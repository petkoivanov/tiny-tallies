import type { BktParams, BktUpdateResult } from './bktTypes';

/** Consecutive wrong answers needed to break mastery lock */
export const MASTERY_LOCK_BREAK_COUNT = 3;

export interface MasteryLockResult {
  /** Final mastery probability after lock logic */
  masteryProbability: number;
  /** Updated consecutive wrong count */
  consecutiveWrong: number;
  /** Whether mastery lock is active */
  masteryLocked: boolean;
}

/**
 * Applies soft mastery lock logic on top of raw BKT update.
 *
 * When masteryLocked=true, the skill's P(L) is held at BKT_MASTERY_THRESHOLD
 * even if BKT math drops it lower -- UNLESS the child has gotten 3+ consecutive
 * wrong answers, at which point the lock breaks and P(L) follows BKT naturally.
 *
 * This prevents a single slip or bad day from losing hard-earned mastery.
 *
 * Correct answers always reset consecutiveWrong to 0 and preserve the lock.
 */
export function applySoftMasteryLock(
  bktResult: BktUpdateResult,
  currentMasteryLocked: boolean,
  currentConsecutiveWrong: number,
  isCorrect: boolean,
): MasteryLockResult {
  if (isCorrect) {
    return {
      masteryProbability: bktResult.newPL,
      consecutiveWrong: 0,
      masteryLocked: bktResult.isMastered || currentMasteryLocked,
    };
  }

  // Incorrect answer
  const consecutiveWrong = currentConsecutiveWrong + 1;

  if (currentMasteryLocked && consecutiveWrong < MASTERY_LOCK_BREAK_COUNT) {
    // Protect mastery: hold P(L) at threshold
    return {
      masteryProbability: BKT_MASTERY_THRESHOLD,
      consecutiveWrong,
      masteryLocked: true,
    };
  }

  if (currentMasteryLocked && consecutiveWrong >= MASTERY_LOCK_BREAK_COUNT) {
    // Break lock: follow BKT naturally
    return {
      masteryProbability: bktResult.newPL,
      consecutiveWrong,
      masteryLocked: false,
    };
  }

  // Not locked: follow BKT naturally
  return {
    masteryProbability: bktResult.newPL,
    consecutiveWrong,
    masteryLocked: bktResult.isMastered,
  };
}

/** Mastery threshold: P(L) >= 0.95 means the skill is mastered. */
export const BKT_MASTERY_THRESHOLD = 0.95;

/** Re-teaching threshold: P(L) < 0.40 means the skill needs re-teaching. */
export const BKT_RETEACH_THRESHOLD = 0.40;

/** Research-default BKT parameters (matches age 7-8 bracket). */
export const DEFAULT_BKT_PARAMS: BktParams = {
  pL0: 0.1,
  pT: 0.3,
  pS: 0.1,
  pG: 0.25,
};

/**
 * Age-bracket BKT parameter map.
 *
 * - Ages 6-7 (childAge 6 or 7): higher guess/slip, lower learn rate
 * - Ages 7-8 (childAge 8): research defaults
 * - Ages 8-9 (childAge 9): lower guess/slip, higher learn rate
 * - Ages 10-18: extrapolated values (LOW confidence per research)
 *   The existing fallback DEFAULT_BKT_PARAMS applies for ages outside 6-18.
 */
const AGE_BRACKET_PARAMS: Record<number, BktParams> = {
  6: { pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 },
  7: { pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 },
  8: { pL0: 0.1, pT: 0.30, pS: 0.10, pG: 0.25 },
  9: { pL0: 0.1, pT: 0.35, pS: 0.08, pG: 0.20 },
  10: { pL0: 0.1, pT: 0.38, pS: 0.06, pG: 0.18 },
  11: { pL0: 0.1, pT: 0.38, pS: 0.06, pG: 0.18 },
  12: { pL0: 0.1, pT: 0.38, pS: 0.06, pG: 0.18 },
  13: { pL0: 0.1, pT: 0.39, pS: 0.06, pG: 0.17 },
  14: { pL0: 0.1, pT: 0.40, pS: 0.05, pG: 0.15 },
  15: { pL0: 0.1, pT: 0.40, pS: 0.05, pG: 0.15 },
  16: { pL0: 0.1, pT: 0.40, pS: 0.05, pG: 0.15 },
  17: { pL0: 0.1, pT: 0.40, pS: 0.05, pG: 0.15 },
  18: { pL0: 0.1, pT: 0.40, pS: 0.05, pG: 0.15 },
};

/**
 * Returns BKT parameters adjusted for the child's age bracket.
 *
 * @param childAge - Integer age (6-9), or null for research defaults
 * @returns BktParams for the corresponding age bracket
 */
export function getBktParams(childAge: number | null): BktParams {
  if (childAge === null) {
    return { ...DEFAULT_BKT_PARAMS };
  }
  const bracket = AGE_BRACKET_PARAMS[childAge];
  return bracket ? { ...bracket } : { ...DEFAULT_BKT_PARAMS };
}

/**
 * Performs a single BKT Bayesian inference update.
 *
 * Equations:
 *   After correct:   P(L|obs) = P(L)*(1-P(S)) / (P(L)*(1-P(S)) + (1-P(L))*P(G))
 *   After incorrect: P(L|obs) = P(L)*P(S)     / (P(L)*P(S)     + (1-P(L))*(1-P(G)))
 *   Learning:        P(L_new) = P(L|obs) + (1-P(L|obs)) * P(T)
 *
 * @param currentPL - Current mastery probability P(L), in [0, 1]
 * @param correct   - Whether the student answered correctly
 * @param params    - BKT parameters (use getBktParams for age-adjusted values)
 * @returns BktUpdateResult with updated mastery and threshold flags
 */
export function updateBktMastery(
  currentPL: number,
  correct: boolean,
  params: BktParams,
): BktUpdateResult {
  const { pT, pS, pG } = params;

  // Step 1: Bayesian posterior update
  let pLGivenObs: number;
  if (correct) {
    const numerator = currentPL * (1 - pS);
    const denominator = numerator + (1 - currentPL) * pG;
    pLGivenObs = numerator / denominator;
  } else {
    const numerator = currentPL * pS;
    const denominator = numerator + (1 - currentPL) * (1 - pG);
    pLGivenObs = numerator / denominator;
  }

  // Step 2: Apply learning transition
  const newPL = pLGivenObs + (1 - pLGivenObs) * pT;

  return {
    newPL,
    isMastered: newPL >= BKT_MASTERY_THRESHOLD,
    needsReteaching: newPL < BKT_RETEACH_THRESHOLD,
  };
}
