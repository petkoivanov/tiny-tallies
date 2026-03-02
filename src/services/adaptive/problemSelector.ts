import { expectedScore } from './eloCalculator';
import type { WeightedTemplate } from './types';
import type { ProblemTemplate } from '../mathEngine/types';
import type { SeededRng } from '../mathEngine/seededRng';
import { getTemplatesBySkill } from '../mathEngine/templates';

/** Target success probability for problem selection. */
export const TARGET_SUCCESS = 0.85;

/** Standard deviation for gaussian weighting on probability deviation. */
export const SIGMA = 0.10;

/**
 * Assigns gaussian weights to templates based on proximity of their expected
 * success probability to the target success rate (85%).
 *
 * Templates where the student has ~85% chance of answering correctly get
 * weight near 1.0. Templates far from 85% expected success get weight near 0.0.
 *
 * @param studentElo     - The student's current Elo rating
 * @param templates      - Available problem templates to weight
 * @param targetSuccess  - Target success probability (default 0.85)
 * @returns Weighted templates with gaussian weights and expected success values
 */
export function weightBySuccessProbability(
  studentElo: number,
  templates: readonly ProblemTemplate[],
  targetSuccess: number = TARGET_SUCCESS,
): WeightedTemplate[] {
  return templates.map((template) => {
    const p = expectedScore(studentElo, template.baseElo);
    const deviation = p - targetSuccess;
    const weight = Math.exp(
      -(deviation * deviation) / (2 * SIGMA * SIGMA),
    );
    return { template, weight, expectedSuccess: p };
  });
}

/**
 * Selects a template from a weighted list using cumulative distribution sampling.
 *
 * Uses the provided SeededRng for deterministic selection. Rolls a random value
 * between 0 and totalWeight, then walks the cumulative distribution to find
 * the selected template. Falls back to the last item for floating point edge cases.
 *
 * @param weighted - Templates with their selection weights
 * @param rng      - Seeded random number generator
 * @returns The selected problem template
 */
export function weightedRandomSelect(
  weighted: readonly WeightedTemplate[],
  rng: SeededRng,
): ProblemTemplate {
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.template;
  }
  return weighted[weighted.length - 1].template;
}

/**
 * Selects a problem template for a skill, targeting 85% expected success rate.
 *
 * When frustration is active, filters to templates with baseElo below the
 * student's Elo (easier problems). If all templates are at or above the
 * student's Elo, picks the single easiest template. The filtered set still
 * goes through gaussian-weighted random selection.
 *
 * @param skillId           - The skill ID to select a template for
 * @param studentElo        - The student's current Elo rating
 * @param rng               - Seeded random number generator
 * @param frustrationActive - Whether the frustration guard is active (default false)
 * @returns The selected problem template
 * @throws Error if no templates exist for the skill
 */
export function selectTemplateForSkill(
  skillId: string,
  studentElo: number,
  rng: SeededRng,
  frustrationActive: boolean = false,
): ProblemTemplate {
  let templates = getTemplatesBySkill(skillId);
  if (templates.length === 0) {
    throw new Error(`No templates found for skill: ${skillId}`);
  }

  if (frustrationActive) {
    const easier = templates.filter((t) => t.baseElo < studentElo);
    if (easier.length > 0) {
      templates = easier;
    } else {
      // All templates are at or above student Elo; pick the easiest one
      templates = [
        templates.reduce((a, b) => (a.baseElo <= b.baseElo ? a : b)),
      ];
    }
  }

  const weighted = weightBySuccessProbability(studentElo, templates);
  return weightedRandomSelect(weighted, rng);
}
