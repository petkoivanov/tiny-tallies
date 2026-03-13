import type { Problem } from '../types';
import type { SeededRng } from '../seededRng';
import { createRng } from '../seededRng';
import { formatAsMultipleChoice } from './multipleChoice';
import { formatAsMultiSelect } from './multiSelect';
import { formatAsFreeText } from './freeText';
import type { FormattedProblem } from './types';

/**
 * Probability of free-text format based on Elo.
 * Uses sigmoid: P(free_text) = 1 / (1 + exp(-(elo - 1000) / 150))
 */
export function freeTextProbability(elo: number): number {
  return 1 / (1 + Math.exp(-(elo - 1000) / 150));
}

/**
 * Number of MC options based on Elo thresholds:
 * - Elo < 950: 4 options
 * - 950 ≤ Elo < 1100: 5 options
 * - Elo ≥ 1100: 6 options
 */
export function mcOptionCount(elo: number): number {
  if (elo < 950) return 4;
  if (elo < 1100) return 5;
  return 6;
}

/**
 * Selects answer format and formats the problem accordingly.
 * Uses Elo-based probability to decide between MC and free-text.
 */
export function selectAndFormatAnswer(
  problem: Problem,
  elo: number,
  seed: number,
): FormattedProblem {
  // Multi-select answers always use the multi-select format (no MC/free-text split)
  if (problem.correctAnswer.type === 'multi_select') {
    return formatAsMultiSelect(problem, createRng(seed));
  }

  const rng = createRng(seed);
  const pFreeText = freeTextProbability(elo);

  if (rng.next() < pFreeText) {
    return formatAsFreeText(problem);
  }

  const optionCount = mcOptionCount(elo);
  return formatAsMultipleChoice(problem, seed, optionCount);
}
