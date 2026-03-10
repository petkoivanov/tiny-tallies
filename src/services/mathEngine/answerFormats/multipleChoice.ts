import { answerNumericValue } from '../types';
import type { Problem } from '../types';
import { createRng } from '../seededRng';
import { generateDistractors } from '../bugLibrary/distractorGenerator';
import { shuffleArray } from '../bugLibrary/validation';
import type { ChoiceOption, MultipleChoicePresentation } from './types';

/**
 * Formats a Problem as a multiple choice presentation.
 * 1 correct answer + (optionCount-1) distractors, shuffled in deterministic order.
 *
 * @param problem - The problem to format
 * @param seed - Seed for deterministic distractor generation and shuffling
 * @param optionCount - Total number of options including correct answer (default 4)
 * @returns MultipleChoicePresentation with shuffled options and correctIndex
 */
export function formatAsMultipleChoice(
  problem: Problem,
  seed: number,
  optionCount: number = 4,
): MultipleChoicePresentation {
  const rng = createRng(seed);

  // Generate distractors using the bug library pipeline
  const distractors = generateDistractors(problem, rng, optionCount - 1);

  const correctValue = answerNumericValue(problem.correctAnswer);

  // Build options: correct answer first, then distractors
  const options: ChoiceOption[] = [
    { value: correctValue },
    ...distractors.map((d) => ({
      value: d.value,
      bugId: d.bugId,
    })),
  ];

  // Shuffle using the same RNG (state has advanced past distractor generation)
  const shuffledOptions = shuffleArray(options, rng);

  // Find where the correct answer ended up
  const correctIndex = shuffledOptions.findIndex(
    (o) => o.value === correctValue,
  );

  return {
    problem,
    format: 'multiple_choice',
    options: shuffledOptions,
    correctIndex,
  };
}
