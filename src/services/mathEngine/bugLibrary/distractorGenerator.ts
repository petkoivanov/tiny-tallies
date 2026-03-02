import type { Problem } from '../types';
import type { SeededRng } from '../seededRng';
import type { BugPattern, DistractorResult } from './types';
import { ADDITION_BUGS } from './additionBugs';
import { SUBTRACTION_BUGS } from './subtractionBugs';
import { isValidDistractor, shuffleArray } from './validation';

/** IDs of off-by-one patterns handled in Phase 2, not Phase 1 */
const OFF_BY_ONE_IDS = new Set([
  'add_off_by_one_plus',
  'add_off_by_one_minus',
  'sub_off_by_one_plus',
  'sub_off_by_one_minus',
]);

/**
 * Returns bug patterns applicable to the given problem,
 * excluding off-by-one patterns (reserved for Phase 2).
 */
function getApplicableBugs(problem: Problem): BugPattern[] {
  const bugs =
    problem.operation === 'addition' ? ADDITION_BUGS : SUBTRACTION_BUGS;

  return bugs.filter(
    (bug) =>
      bug.minDigits <= problem.metadata.digitCount &&
      !OFF_BY_ONE_IDS.has(bug.id),
  );
}

/** Safety limit for random fallback iterations */
const MAX_RANDOM_ITERATIONS = 50;

/**
 * Three-phase distractor assembly algorithm.
 *
 * Phase 1: Bug Library -- compute misconception-based distractors (target 2)
 * Phase 2: Adjacent -- off-by-one from correct answer (target 1)
 * Phase 3: Random fallback -- fill remaining slots
 *
 * Always returns exactly 3 unique, valid distractors.
 */
export function generateDistractors(
  problem: Problem,
  rng: SeededRng,
): DistractorResult[] {
  const { correctAnswer, operation } = problem;
  const results: DistractorResult[] = [];
  const used = new Set<number>([correctAnswer]);

  // Phase 1: Bug Library (target 2)
  const applicableBugs = shuffleArray(getApplicableBugs(problem), rng);

  for (const bug of applicableBugs) {
    if (results.length >= 2) break;

    const value = bug.compute(
      problem.operands[0],
      problem.operands[1],
      operation,
    );

    if (
      value !== null &&
      Number.isInteger(value) &&
      !used.has(value) &&
      isValidDistractor(value, correctAnswer, operation)
    ) {
      results.push({ value, source: 'bug_library', bugId: bug.id });
      used.add(value);
    }
  }

  // Phase 2: Adjacent off-by-one (target 1)
  if (results.length < 3) {
    const plus1 = correctAnswer + 1;
    const minus1 = correctAnswer - 1;

    if (!used.has(plus1) && isValidDistractor(plus1, correctAnswer, operation)) {
      results.push({ value: plus1, source: 'adjacent', bugId: undefined });
      used.add(plus1);
    } else if (
      !used.has(minus1) &&
      isValidDistractor(minus1, correctAnswer, operation)
    ) {
      results.push({ value: minus1, source: 'adjacent', bugId: undefined });
      used.add(minus1);
    }
  }

  // Phase 3: Random fallback
  const rangeHalf = Math.max(Math.floor(correctAnswer * 0.4), 5);
  const rangeLow = Math.max(1, correctAnswer - rangeHalf);
  const rangeHigh = correctAnswer + rangeHalf;

  let iterations = 0;
  while (results.length < 3 && iterations < MAX_RANDOM_ITERATIONS) {
    iterations++;
    const value = rng.intRange(rangeLow, rangeHigh);

    if (
      !used.has(value) &&
      isValidDistractor(value, correctAnswer, operation)
    ) {
      results.push({ value, source: 'random', bugId: undefined });
      used.add(value);
    }
  }

  // Deterministic fallback if random phase exhausted
  if (results.length < 3) {
    let offset = 2;
    while (results.length < 3) {
      const candidate = correctAnswer + offset;
      if (
        candidate > 0 &&
        !used.has(candidate) &&
        isValidDistractor(candidate, correctAnswer, operation)
      ) {
        results.push({ value: candidate, source: 'random', bugId: undefined });
        used.add(candidate);
      } else {
        // Try negative direction
        const candidateNeg = correctAnswer - offset;
        if (
          candidateNeg > 0 &&
          !used.has(candidateNeg) &&
          isValidDistractor(candidateNeg, correctAnswer, operation)
        ) {
          results.push({
            value: candidateNeg,
            source: 'random',
            bugId: undefined,
          });
          used.add(candidateNeg);
        }
      }
      offset++;

      // Ultimate safety — should never reach this in practice
      if (offset > 100) break;
    }
  }

  return results;
}
