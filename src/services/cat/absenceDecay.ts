/**
 * Absence-based skill decay — reduces Elo and mastery when a student
 * is inactive for extended periods.
 *
 * Based on Ebbinghaus forgetting curve: retention decays exponentially
 * with time since last practice. The decay is gentler for well-practiced
 * skills (higher Leitner box) and more aggressive for recently learned ones.
 *
 * Also triggers optional re-assessment when decay is significant.
 */

import { ELO_MIN, ELO_MAX } from '@/services/adaptive/eloCalculator';

/** Days of inactivity before any decay applies */
const GRACE_PERIOD_DAYS = 3;

/** Maximum Elo points that can be lost from decay */
const MAX_ELO_DECAY = 150;

/** Decay rate per day of absence (higher = faster decay) */
const BASE_DECAY_RATE = 0.02;

/** Decay resistance factor per Leitner box (higher box = slower decay) */
const BOX_RESISTANCE: Record<number, number> = {
  1: 0.3,  // least resistant — almost no practice history
  2: 0.5,
  3: 0.65,
  4: 0.75,
  5: 0.85,
  6: 0.95, // most resistant — well-practiced skill
};

/** BKT mastery decay per day of absence (before resistance) */
const BKT_DECAY_RATE = 0.01;

/** Threshold for triggering re-assessment suggestion (Elo points lost) */
const REASSESSMENT_THRESHOLD = 80;

export interface DecayInput {
  /** Current Elo rating */
  eloRating: number;
  /** Current BKT mastery probability */
  masteryProbability: number;
  /** Leitner box (1-6) */
  leitnerBox: number;
  /** Whether skill was mastery-locked */
  masteryLocked: boolean;
  /** Number of days since last practice */
  daysSinceLastPractice: number;
}

export interface DecayResult {
  /** New Elo after decay */
  newElo: number;
  /** Elo points lost */
  eloDecay: number;
  /** New mastery probability after decay */
  newMasteryProbability: number;
  /** Whether mastery lock should be removed */
  breakMasteryLock: boolean;
  /** Whether re-assessment is recommended */
  suggestReassessment: boolean;
}

/**
 * Calculate decay for a single skill based on absence duration.
 *
 * Returns the adjusted values. Does NOT modify any state — caller
 * is responsible for applying the results.
 */
export function calculateAbsenceDecay(input: DecayInput): DecayResult {
  const { daysSinceLastPractice, leitnerBox, eloRating, masteryProbability, masteryLocked } = input;

  // No decay within grace period
  if (daysSinceLastPractice <= GRACE_PERIOD_DAYS) {
    return {
      newElo: eloRating,
      eloDecay: 0,
      newMasteryProbability: masteryProbability,
      breakMasteryLock: false,
      suggestReassessment: false,
    };
  }

  const effectiveDays = daysSinceLastPractice - GRACE_PERIOD_DAYS;
  const resistance = BOX_RESISTANCE[leitnerBox] ?? 0.5;

  // Elo decay: exponential curve with box resistance
  // retention = e^(-rate * days * (1 - resistance))
  const decayFactor = 1 - Math.exp(-BASE_DECAY_RATE * effectiveDays * (1 - resistance));
  const rawEloDecay = decayFactor * MAX_ELO_DECAY;
  const eloDecay = Math.round(Math.min(rawEloDecay, MAX_ELO_DECAY));
  const newElo = Math.max(ELO_MIN, eloRating - eloDecay);

  // BKT mastery decay
  const bktDecay = BKT_DECAY_RATE * effectiveDays * (1 - resistance);
  const newMasteryProbability = Math.max(0, masteryProbability - bktDecay);

  // Break mastery lock if mastery drops below threshold
  const breakMasteryLock = masteryLocked && newMasteryProbability < 0.80;

  // Suggest re-assessment if significant decay
  const suggestReassessment = eloDecay >= REASSESSMENT_THRESHOLD;

  return {
    newElo,
    eloDecay,
    newMasteryProbability,
    breakMasteryLock,
    suggestReassessment,
  };
}

/**
 * Calculate days since a given ISO date string.
 */
export function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

/**
 * Check if any skill has decayed enough to suggest re-assessment.
 *
 * Returns true if the student should be offered a placement re-test.
 */
export function shouldSuggestReassessment(
  decayResults: DecayResult[],
): boolean {
  const significantDecays = decayResults.filter((r) => r.suggestReassessment);
  // Suggest if 3+ skills have significant decay
  return significantDecays.length >= 3;
}
