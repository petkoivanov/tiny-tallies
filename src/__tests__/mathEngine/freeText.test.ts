import {
  parseIntegerInput,
  validateFreeTextAnswer,
  formatAsFreeText,
} from '../../services/mathEngine/answerFormats/freeText';
import { generateProblem } from '../../services/mathEngine/generator';

describe('parseIntegerInput', () => {
  it('parses a simple integer', () => {
    expect(parseIntegerInput('42')).toBe(42);
  });

  it('trims whitespace', () => {
    expect(parseIntegerInput('  42  ')).toBe(42);
  });

  it('strips leading zeros', () => {
    expect(parseIntegerInput('007')).toBe(7);
  });

  it('preserves zero itself', () => {
    expect(parseIntegerInput('0')).toBe(0);
  });

  it('rejects empty string', () => {
    expect(parseIntegerInput('')).toBeNull();
  });

  it('rejects non-numeric input', () => {
    expect(parseIntegerInput('abc')).toBeNull();
  });

  it('rejects decimals', () => {
    expect(parseIntegerInput('3.14')).toBeNull();
  });

  it('accepts negative integers', () => {
    expect(parseIntegerInput('-5')).toBe(-5);
    expect(parseIntegerInput('-123')).toBe(-123);
  });

  it('rejects bare minus sign', () => {
    expect(parseIntegerInput('-')).toBeNull();
  });

  it('rejects negative values exceeding bound', () => {
    expect(parseIntegerInput('-99999')).toBeNull();
  });

  it('rejects internal spaces', () => {
    expect(parseIntegerInput('12 34')).toBeNull();
  });

  it('rejects values exceeding 9999 bound', () => {
    expect(parseIntegerInput('99999')).toBeNull();
  });

  it('accepts values at 9999 bound', () => {
    expect(parseIntegerInput('9999')).toBe(9999);
  });
});

describe('validateFreeTextAnswer', () => {
  it('returns correct: true when input matches correctAnswer', () => {
    const result = validateFreeTextAnswer('42', 42);
    expect(result).toEqual({ correct: true, parsedValue: 42 });
  });

  it('returns correct: false when input does not match', () => {
    const result = validateFreeTextAnswer('43', 42);
    expect(result).toEqual({ correct: false, parsedValue: 43 });
  });

  it('returns correct: false with null parsedValue for non-numeric input', () => {
    const result = validateFreeTextAnswer('abc', 42);
    expect(result).toEqual({ correct: false, parsedValue: null });
  });

  it('handles whitespace and leading zeros correctly', () => {
    const result = validateFreeTextAnswer('  042  ', 42);
    expect(result).toEqual({ correct: true, parsedValue: 42 });
  });
});

describe('formatAsFreeText', () => {
  it('sets maxDigits to 2 for single-digit answer', () => {
    const problem = generateProblem({
      templateId: 'add_single_digit_no_carry',
      seed: 42,
    });
    // Single-digit answer: 1 digit + 1 = 2, min 2 => maxDigits = 2
    const result = formatAsFreeText(problem);
    expect(result.maxDigits).toBe(2);
    expect(result.format).toBe('free_text');
    expect(result.problem).toBe(problem);
  });

  it('sets maxDigits to 3 for two-digit answer', () => {
    const problem = generateProblem({
      templateId: 'add_two_digit_no_carry',
      seed: 42,
    });
    const result = formatAsFreeText(problem);
    // Two-digit answer: digits + 1 = 3
    expect(result.maxDigits).toBe(3);
  });

  it('sets maxDigits to 4 for three-digit answer', () => {
    const problem = generateProblem({
      templateId: 'add_three_digit_no_carry',
      seed: 42,
    });
    const result = formatAsFreeText(problem);
    // Three-digit answer: digits + 1 = 4
    expect(result.maxDigits).toBe(4);
  });
});
