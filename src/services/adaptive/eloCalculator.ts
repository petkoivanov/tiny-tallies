import type { EloUpdateResult } from './types';

/** Minimum Elo rating (floor clamp). */
export const ELO_MIN = 600;

/** Maximum Elo rating (ceiling clamp). */
export const ELO_MAX = 1400;

/** K-factor upper bound for new students (0 attempts). */
const K_MAX = 40;

/** K-factor lower bound approached asymptotically as attempts grow. */
const K_MIN = 16;

/** Decay rate for K-factor: higher values make K approach K_MIN faster. */
const K_DECAY = 0.05;

/**
 * Returns the expected probability of a correct answer using the Elo logistic formula.
 *
 * When studentElo === templateBaseElo, returns exactly 0.5.
 * Higher student Elo relative to template Elo increases the expected score.
 *
 * @param studentElo  - The student's current Elo rating for the relevant skill
 * @param templateBaseElo - The template's base difficulty Elo
 * @returns Probability in (0, 1)
 */
export function expectedScore(
  studentElo: number,
  templateBaseElo: number,
): number {
  return 1 / (1 + Math.pow(10, (templateBaseElo - studentElo) / 400));
}

/**
 * Returns the K-factor based on number of attempts.
 *
 * K starts at K_MAX (40) for new students and decays toward K_MIN (16)
 * as the student accumulates more attempts. This means early attempts
 * have a larger impact on Elo than later ones, allowing the system to
 * converge quickly to the student's true skill level.
 *
 * Formula: K = K_MIN + (K_MAX - K_MIN) / (1 + K_DECAY * attempts)
 *
 * @param attempts - Total number of attempts the student has made for this skill
 * @returns K-factor value, always in (K_MIN, K_MAX]
 */
export function getKFactor(attempts: number): number {
  return K_MIN + (K_MAX - K_MIN) / (1 + K_DECAY * attempts);
}

/**
 * Calculates an Elo rating update after a student answers a problem.
 *
 * The result is clamped to [ELO_MIN, ELO_MAX] and rounded to the nearest integer.
 * The eloDelta field reflects the actual change after clamping (not the raw delta).
 *
 * @param studentElo     - The student's current Elo rating
 * @param templateBaseElo - The problem template's base Elo difficulty
 * @param correct        - Whether the student answered correctly
 * @param attempts       - Total number of attempts the student has made (for K-factor)
 * @returns EloUpdateResult with newElo, eloDelta, and expectedScore
 */
export function calculateEloUpdate(
  studentElo: number,
  templateBaseElo: number,
  correct: boolean,
  attempts: number,
): EloUpdateResult {
  const expected = expectedScore(studentElo, templateBaseElo);
  const actual = correct ? 1 : 0;
  const K = getKFactor(attempts);
  const delta = K * (actual - expected);
  const newElo = Math.round(
    Math.max(ELO_MIN, Math.min(ELO_MAX, studentElo + delta)),
  );
  return {
    newElo,
    eloDelta: newElo - studentElo,
    expectedScore: expected,
  };
}
