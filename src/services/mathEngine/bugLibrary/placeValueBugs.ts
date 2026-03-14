import type { BugPattern } from './types';

export const PLACE_VALUE_BUGS: readonly BugPattern[] = [
  {
    id: 'pv_place_value_swap',
    operations: ['place_value'],
    description:
      'Confuses face value with place value (asked for digit 3 in tens, answers 30 or vice versa)',
    minDigits: 1,
    compute(a, b) {
      // operands: [number, placeIndex] for decompose/identify_digit
      if (b < 0 || b > 3) return null;
      const digits = String(a).split('').reverse().map(Number);
      if (b >= digits.length) return null;
      const faceValue = digits[b];
      if (faceValue === 0) return null;
      // If correct answer is face value, bug produces place value
      const placeValue = faceValue * Math.pow(10, b);
      return placeValue !== faceValue ? placeValue : null;
    },
  },
  {
    id: 'pv_adjacent_place',
    operations: ['place_value'],
    description: 'Reads the wrong place (e.g., asked for tens digit, gives ones digit)',
    minDigits: 1,
    compute(a, b) {
      // operands: [number, placeIndex]
      if (b < 0 || b > 3) return null;
      const digits = String(a).split('').reverse().map(Number);
      // Pick adjacent place
      const altPlace = b > 0 ? b - 1 : b + 1;
      if (altPlace >= digits.length) return null;
      const wrong = digits[altPlace];
      const correct = digits[b];
      return wrong !== correct ? wrong : null;
    },
  },
  {
    id: 'pv_reverse_write',
    operations: ['place_value'],
    description: 'Writes digits in reverse order (23 → 32)',
    minDigits: 1,
    compute(a) {
      if (!Number.isInteger(a) || a < 10) return null;
      const reversed = parseInt(
        String(a).split('').reverse().join(''),
        10,
      );
      return reversed !== a ? reversed : null;
    },
  },
  {
    id: 'pv_zero_placeholder',
    operations: ['place_value'],
    description: 'Omits zero in number (305 → 35)',
    minDigits: 1,
    compute(a) {
      if (!Number.isInteger(a)) return null;
      const str = String(a);
      if (!str.includes('0')) return null;
      const noZero = parseInt(str.replace(/0/g, ''), 10);
      return noZero !== a && noZero > 0 ? noZero : null;
    },
  },
  {
    id: 'pv_rounding_direction',
    operations: ['place_value'],
    description: 'Rounds in wrong direction',
    minDigits: 1,
    compute(a, b) {
      // operands: [number, roundTo] for rounding
      if (b !== 10 && b !== 100) return null;

      // Decimal rounding: a is decimal and b is the scale (10 = tenths)
      if (!Number.isInteger(a)) {
        const correct = Math.round(a * b) / b;
        const step = 1 / b; // 0.1 for tenths
        const wrong = a >= correct ? correct - step : correct + step;
        return wrong > 0 ? Math.round(wrong * b) / b : null;
      }

      // Integer rounding: round a to nearest b (10 or 100)
      const correct = Math.round(a / b) * b;
      const wrong = a >= correct ? correct - b : correct + b;
      return wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'pv_comparison_length',
    operations: ['place_value'],
    description: 'Compares numbers by digit count only, not value',
    minDigits: 1,
    compute(a, b) {
      // operands: [a, b] for compare — integers only
      if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
      if (String(a).length === String(b).length) return null;
      // Picks the number with more digits even if it's smaller in value
      const wrong = String(a).length > String(b).length ? a : b;
      const correct = Math.max(a, b);
      return wrong !== correct ? wrong : null;
    },
  },
  {
    id: 'pv_skip_wrong_step',
    operations: ['place_value'],
    description: 'Uses wrong skip-counting step (e.g., counts by 5 instead of 10)',
    minDigits: 1,
    compute(a, b) {
      // operands: [lastShown, step] for skip_count — integers only
      if (!Number.isInteger(a) || b < 2) return null;
      // Use a nearby step
      const wrongStep = b <= 2 ? b + 1 : b - 1;
      const wrong = a + wrongStep;
      const correct = a + b;
      return wrong !== correct && wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'pv_off_by_one',
    operations: ['place_value'],
    description: 'Off by 1 in digit identification',
    minDigits: 1,
    compute(a, b) {
      // Integer digit identification only
      if (!Number.isInteger(a)) return null;
      const digits = String(a).split('').reverse().map(Number);
      if (b >= 0 && b < digits.length) {
        const correct = digits[b];
        return correct > 0 ? correct - 1 : correct + 1;
      }
      return null;
    },
  },
  {
    id: 'pv_expanded_addition',
    operations: ['place_value'],
    description: 'Adds digits instead of expanding (345 = 3+4+5 = 12)',
    minDigits: 1,
    compute(a) {
      if (!Number.isInteger(a) || a < 10) return null;
      const digitSum = String(a)
        .split('')
        .reduce((sum, d) => sum + Number(d), 0);
      return digitSum !== a ? digitSum : null;
    },
  },
];
