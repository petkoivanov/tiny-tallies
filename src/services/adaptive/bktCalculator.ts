import type { BktParams, BktUpdateResult } from './bktTypes';

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
 */
const AGE_BRACKET_PARAMS: Record<number, BktParams> = {
  6: { pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 },
  7: { pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 },
  8: { pL0: 0.1, pT: 0.30, pS: 0.10, pG: 0.25 },
  9: { pL0: 0.1, pT: 0.35, pS: 0.08, pG: 0.20 },
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
