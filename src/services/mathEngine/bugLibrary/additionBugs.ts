import type { BugPattern } from './types';

/**
 * Addition misconception patterns.
 *
 * Each pattern computes a plausible wrong answer based on a known
 * student misconception. Returns null when the pattern does not
 * apply to the given operands.
 */
export const ADDITION_BUGS: readonly BugPattern[] = [
  {
    id: 'add_no_carry',
    operations: ['addition'],
    description: 'Ignores carry — sums each column independently mod 10',
    minDigits: 2,
    compute(a, b) {
      // Sum each column independently, ignoring carry
      let result = 0;
      let x = a;
      let y = b;
      let place = 1;
      let hasCarry = false;

      while (x > 0 || y > 0) {
        const colSum = (x % 10) + (y % 10);
        if (colSum >= 10) hasCarry = true;
        result += (colSum % 10) * place;
        place *= 10;
        x = Math.floor(x / 10);
        y = Math.floor(y / 10);
      }

      // If no carry needed, the bug produces the correct answer — not useful
      return hasCarry ? result : null;
    },
  },
  {
    id: 'add_carry_wrong_column',
    operations: ['addition'],
    description:
      'Writes full column sum instead of carrying (e.g., 7+8=15 written as "15")',
    minDigits: 2,
    compute(a, b) {
      // Build result by concatenating column sums as strings (right to left)
      let x = a;
      let y = b;
      let resultStr = '';
      let hasCarry = false;

      while (x > 0 || y > 0) {
        const colSum = (x % 10) + (y % 10);
        if (colSum >= 10) hasCarry = true;
        // Prepend the full column sum
        resultStr = String(colSum) + resultStr;
        x = Math.floor(x / 10);
        y = Math.floor(y / 10);
      }

      if (!hasCarry) return null;

      const result = parseInt(resultStr, 10);
      const correct = a + b;
      // If somehow equals correct answer, not useful
      return result !== correct ? result : null;
    },
  },
  {
    id: 'add_off_by_one_plus',
    operations: ['addition'],
    description: 'Off by one — adds 1 to the correct answer',
    minDigits: 1,
    compute(a, b) {
      return a + b + 1;
    },
  },
  {
    id: 'add_off_by_one_minus',
    operations: ['addition'],
    description: 'Off by one — subtracts 1 from the correct answer',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      return correct <= 1 ? null : correct - 1;
    },
  },
  {
    id: 'add_concat',
    operations: ['addition'],
    description:
      'Concatenates operands instead of adding (e.g., 3+4 -> 34)',
    minDigits: 1,
    compute(a, b) {
      // Only meaningful for single-digit operands
      if (a >= 10 || b >= 10) return null;
      return parseInt(`${a}${b}`, 10);
    },
  },
  {
    id: 'add_reverse_digits',
    operations: ['addition'],
    description: 'Reverses digits of the correct answer (e.g., 13 -> 31)',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      // Single digit — no reversal possible
      if (correct < 10) return null;

      // Reverse all digits
      const digits = String(correct).split('').reverse().join('');
      const reversed = parseInt(digits, 10);

      // If reversal is identity (e.g., 11 -> 11), not useful
      return reversed !== correct ? reversed : null;
    },
  },
];
