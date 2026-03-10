/**
 * Placement mapper — converts CAT results to per-skill Elo ratings.
 *
 * After the placement test, this module maps the estimated theta
 * (on the IRT logit scale) to Elo ratings for each skill, taking
 * into account the skill's grade level and the domain accuracy
 * observed during the test.
 *
 * Skills below the estimated grade level get slightly above-average
 * Elo; skills at grade level get average Elo; skills above get
 * below-average Elo (or stay at default).
 */

import { ELO_MIN, ELO_MAX } from '@/services/adaptive/eloCalculator';
import type { CatState } from './types';
import { getCatResults } from './catEngine';

/** Default Elo for skills (matches store default) */
const DEFAULT_ELO = 1000;

/**
 * Convert IRT theta (logit scale) to Elo scale.
 *
 * theta 0 → Elo 1000 (average)
 * theta 3 → Elo 1400 (maximum)
 * theta -3 → Elo 600 (minimum)
 */
export function thetaToElo(theta: number): number {
  const elo = DEFAULT_ELO + theta * (400 / 3);
  return Math.round(Math.max(ELO_MIN, Math.min(ELO_MAX, elo)));
}

/**
 * Compute per-skill Elo adjustments from CAT results.
 *
 * Returns a map of skillId → suggested starting Elo.
 *
 * Strategy:
 * - Skills at or below estimated grade: set Elo based on theta
 * - Skills 1 grade above: set Elo slightly below theta
 * - Skills 2+ grades above: leave at default (1000) or lower
 * - Domain-specific accuracy adjustments if we have data
 */
export function computePlacementElos(
  catState: CatState,
  allSkillIds: { id: string; grade: number; operation: string }[],
): Map<string, number> {
  const results = getCatResults(catState);
  const baseElo = thetaToElo(results.theta);
  const eloMap = new Map<string, number>();

  for (const skill of allSkillIds) {
    let elo: number;

    if (skill.grade <= results.estimatedGrade) {
      // Mastered grade level: assign slightly above base
      const gradeBonus = (results.estimatedGrade - skill.grade) * 30;
      elo = Math.min(ELO_MAX, baseElo + gradeBonus);
    } else if (skill.grade === results.estimatedGrade + 1) {
      // One grade above: slightly below base
      elo = Math.max(ELO_MIN, baseElo - 50);
    } else {
      // Two+ grades above: leave at default or lower
      elo = Math.max(ELO_MIN, DEFAULT_ELO - (skill.grade - results.estimatedGrade) * 40);
    }

    // Apply domain-specific adjustment if we have data
    const domainData = results.domainAccuracy[skill.operation];
    if (domainData && domainData.total >= 2) {
      const domainAcc = domainData.correct / domainData.total;
      // Scale ±50 based on domain accuracy vs overall accuracy
      const accDiff = domainAcc - results.accuracy;
      elo = Math.round(
        Math.max(ELO_MIN, Math.min(ELO_MAX, elo + accDiff * 100)),
      );
    }

    eloMap.set(skill.id, elo);
  }

  return eloMap;
}

/**
 * Determine which skills should start as unlocked based on placement.
 *
 * All skills at or below the estimated grade level are unlocked.
 * Skills 1 grade above are also unlocked if the student showed
 * reasonable accuracy at their grade level.
 */
export function computeUnlockedSkills(
  estimatedGrade: number,
  accuracy: number,
  allSkillIds: { id: string; grade: number }[],
): Set<string> {
  const unlocked = new Set<string>();
  const unlockGrade = accuracy >= 0.7
    ? estimatedGrade + 1
    : estimatedGrade;

  for (const skill of allSkillIds) {
    if (skill.grade <= unlockGrade) {
      unlocked.add(skill.id);
    }
  }

  return unlocked;
}
