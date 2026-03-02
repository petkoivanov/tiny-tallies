import type { Problem } from '../types';
import { createRng } from '../seededRng';
import { generateDistractors } from '../bugLibrary/distractorGenerator';
import { shuffleArray } from '../bugLibrary/validation';
import type { ChoiceOption, MultipleChoicePresentation } from './types';

/**
 * Formats a Problem as a multiple choice presentation with exactly 4 options:
 * 1 correct answer + 3 distractors, shuffled in deterministic order.
 *
 * @param problem - The problem to format
 * @param seed - Seed for deterministic distractor generation and shuffling
 * @returns MultipleChoicePresentation with shuffled options and correctIndex
 */
export function formatAsMultipleChoice(
  problem: Problem,
  seed: number,
): MultipleChoicePresentation {
  const rng = createRng(seed);

  // Generate 3 distractors using the bug library pipeline
  const distractors = generateDistractors(problem, rng);

  // Build options: correct answer first, then distractors
  const options: ChoiceOption[] = [
    { value: problem.correctAnswer },
    ...distractors.map((d) => ({
      value: d.value,
      bugId: d.bugId,
    })),
  ];

  // Shuffle using the same RNG (state has advanced past distractor generation)
  const shuffledOptions = shuffleArray(options, rng);

  // Find where the correct answer ended up
  const correctIndex = shuffledOptions.findIndex(
    (o) => o.value === problem.correctAnswer,
  );

  return {
    problem,
    format: 'multiple_choice',
    options: shuffledOptions,
    correctIndex,
  };
}
