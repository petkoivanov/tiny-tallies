import type { Problem, MultiSelectAnswer } from '../types';
import type { SeededRng } from '../seededRng';
import { shuffleArray } from '../bugLibrary/validation';
import type { ChoiceOption, MultiSelectPresentation } from './types';

/**
 * Formats a multi-select Problem as a MultiSelectPresentation.
 * Builds 2 correct options from answer.values + 2 distractors from problem.operands.
 * Shuffles deterministically using the provided RNG.
 *
 * @param problem - The problem with a multi_select correctAnswer
 * @param rng - Seeded RNG for deterministic shuffling
 * @returns MultiSelectPresentation with shuffled options and correctIndices
 * @throws Error if correctAnswer is not multi_select type
 */
export function formatAsMultiSelect(
  problem: Problem,
  rng: SeededRng,
): MultiSelectPresentation {
  if (problem.correctAnswer.type !== 'multi_select') {
    throw new Error(
      `formatAsMultiSelect: expected multi_select answer, got "${problem.correctAnswer.type}"`,
    );
  }

  const answer = problem.correctAnswer as MultiSelectAnswer;
  const correctValues = [...answer.values];
  const correctSet = new Set(correctValues);

  // Build distractor pool from operands (skip values already in correctValues)
  const distractorPool: number[] = [];
  for (const op of problem.operands) {
    if (!correctSet.has(op) && !distractorPool.includes(op)) {
      distractorPool.push(op);
    }
  }

  // Take up to 2 distractors
  const distractors = distractorPool.slice(0, 2);

  // Build ChoiceOption[] array: correctValues + distractors
  const options: ChoiceOption[] = [
    ...correctValues.map((v) => ({ value: v })),
    ...distractors.map((v) => ({ value: v })),
  ];

  // Shuffle deterministically
  const shuffled = shuffleArray(options, rng);

  // Compute correctIndices by finding positions of correct values in shuffled array
  const correctIndices: number[] = [];
  for (let i = 0; i < shuffled.length; i++) {
    if (correctSet.has(shuffled[i].value)) {
      correctIndices.push(i);
    }
  }

  return {
    problem,
    format: 'multi_select',
    options: shuffled,
    correctIndices,
  };
}
