import { answerNumericValue } from '../types';
import type { Problem } from '../types';
import type { FreeTextPresentation } from './types';

/** Maximum accepted value for free text integer input */
const MAX_VALUE = 9999;

/**
 * Parses a string as a non-negative integer suitable for math answer input.
 *
 * Accepts: digits with optional leading zeros and surrounding whitespace.
 * Rejects: empty, non-numeric, decimals, negatives, internal spaces, values > 9999.
 *
 * @returns The parsed integer, or null if input is invalid
 */
export function parseIntegerInput(input: string): number | null {
  const trimmed = input.trim();

  if (trimmed === '') return null;

  // Strip leading zeros but keep "0" itself
  const normalized = trimmed.replace(/^0+(?=\d)/, '');

  // Reject anything that isn't pure digits
  if (!/^\d+$/.test(normalized)) return null;

  const value = parseInt(normalized, 10);

  // Reject values exceeding the bound
  if (value > MAX_VALUE) return null;

  return value;
}

/**
 * Parses a string as a non-negative decimal number suitable for math answer input.
 *
 * Accepts: digits with optional decimal point and surrounding whitespace.
 * Rejects: empty, non-numeric, negatives, multiple dots, values > 9999.
 *
 * @returns The parsed number, or null if input is invalid
 */
export function parseDecimalInput(input: string): number | null {
  const trimmed = input.trim();

  if (trimmed === '' || trimmed === '.') return null;

  // Accept digits with optional single decimal point
  if (!/^\d+\.?\d*$/.test(trimmed)) return null;

  const value = parseFloat(trimmed);

  if (!isFinite(value) || value > MAX_VALUE) return null;

  return value;
}

/**
 * Validates a free text answer against the correct answer.
 *
 * @returns Object with correct (boolean) and parsedValue (number | null)
 */
export function validateFreeTextAnswer(
  input: string,
  correctAnswer: number,
): { correct: boolean; parsedValue: number | null } {
  const parsedValue = parseIntegerInput(input);

  if (parsedValue === null) {
    return { correct: false, parsedValue: null };
  }

  return { correct: parsedValue === correctAnswer, parsedValue };
}

/**
 * Formats a Problem as a free text presentation.
 * Sets maxDigits based on the correct answer's digit count + 1 (room for error),
 * with a minimum of 2.
 */
export function formatAsFreeText(problem: Problem): FreeTextPresentation {
  const correctValue = answerNumericValue(problem.correctAnswer);
  const correctStr = String(correctValue);
  const allowDecimal = !Number.isInteger(correctValue);
  // For decimals, count digits excluding the dot; for integers, count digits
  const digitCount = correctStr.replace('.', '').length;
  const maxDigits = Math.max(2, digitCount + (allowDecimal ? 2 : 1));

  return {
    problem,
    format: 'free_text',
    maxDigits,
    allowDecimal,
  };
}
