import type { MathDomain } from '../types';
import type { SeededRng } from '../seededRng';

/**
 * Validates that a distractor is plausible for the given problem.
 * Rejects values that are negative, zero for addition, equal to
 * the correct answer, absurdly distant, or too large for small answers.
 */
/** Operations where negative distractors are plausible */
const ALLOWS_NEGATIVES = new Set<MathDomain>([
  'expressions',
  'linear_equations',
  'coordinate_geometry',
]);

export function isValidDistractor(
  distractor: number,
  correctAnswer: number,
  operation: MathDomain,
): boolean {
  // Reject negative values unless the operation allows them
  if (distractor < 0 && !ALLOWS_NEGATIVES.has(operation) && correctAnswer >= 0) {
    return false;
  }

  // Reject zero for basic arithmetic (not a plausible answer)
  if (distractor === 0 && !ALLOWS_NEGATIVES.has(operation)) return false;

  // Reject if equal to correct answer
  if (distractor === correctAnswer) return false;

  // Reject absurdly distant values
  const maxDistance = Math.max(Math.abs(correctAnswer) * 0.5, 10);
  if (Math.abs(distractor - correctAnswer) > maxDistance) return false;

  // Reject large distractors when correct answer is small
  if (
    Math.abs(correctAnswer) <= 5 &&
    Math.abs(distractor) > 10 &&
    !ALLOWS_NEGATIVES.has(operation)
  ) {
    return false;
  }

  return true;
}

/**
 * Fisher-Yates shuffle using a seeded RNG for deterministic ordering.
 * Returns a new array — does not mutate the input.
 */
export function shuffleArray<T>(array: readonly T[], rng: SeededRng): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.intRange(0, i);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
