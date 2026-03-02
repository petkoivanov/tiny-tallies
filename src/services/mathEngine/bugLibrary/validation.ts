import type { Operation } from '../types';
import type { SeededRng } from '../seededRng';

/**
 * Validates that a distractor is plausible for the given problem.
 * Rejects values that are negative, zero for addition, equal to
 * the correct answer, absurdly distant, or too large for small answers.
 */
export function isValidDistractor(
  distractor: number,
  correctAnswer: number,
  operation: Operation,
): boolean {
  // Reject negative values
  if (distractor < 0) return false;

  // Reject zero for addition (0 is never a plausible sum)
  if (distractor === 0 && operation === 'addition') return false;

  // Reject if equal to correct answer
  if (distractor === correctAnswer) return false;

  // Reject absurdly distant values
  const maxDistance = Math.max(correctAnswer * 0.5, 10);
  if (Math.abs(distractor - correctAnswer) > maxDistance) return false;

  // Reject large distractors when correct answer is small
  if (correctAnswer <= 5 && distractor > 10) return false;

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
