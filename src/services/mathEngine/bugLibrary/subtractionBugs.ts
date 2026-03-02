import type { BugPattern } from './types';

/**
 * Subtraction misconception patterns.
 *
 * Each pattern computes a plausible wrong answer based on a known
 * student misconception. Returns null when the pattern does not
 * apply to the given operands.
 */
export const SUBTRACTION_BUGS: readonly BugPattern[] = [
  {
    id: 'sub_smaller_from_larger',
    operations: ['subtraction'],
    description:
      'Always subtracts smaller digit from larger per column (e.g., 42-17: |2-7|=5, 4-1=3 -> 35)',
    minDigits: 2,
    compute(a, b) {
      let x = a;
      let y = b;
      let result = 0;
      let place = 1;
      let hasBorrow = false;

      while (x > 0 || y > 0) {
        const dx = x % 10;
        const dy = y % 10;
        if (dx < dy) hasBorrow = true;
        result += Math.abs(dx - dy) * place;
        place *= 10;
        x = Math.floor(x / 10);
        y = Math.floor(y / 10);
      }

      // Only useful when borrow is needed; otherwise gives correct answer
      return hasBorrow ? result : null;
    },
  },
  {
    id: 'sub_zero_confusion',
    operations: ['subtraction'],
    description:
      'When top digit is 0, writes bottom digit instead of borrowing (e.g., 30-7: 0->7, 3-0=3 -> 37)',
    minDigits: 2,
    compute(a, b) {
      // Check if top number (a) has a zero digit that needs borrowing
      let x = a;
      let y = b;
      let hasZeroDigit = false;

      // First pass: check for zero digits in a where b digit > 0
      let tempX = a;
      let tempY = b;
      while (tempX > 0 || tempY > 0) {
        const dx = tempX % 10;
        const dy = tempY % 10;
        if (dx === 0 && dy > 0) {
          hasZeroDigit = true;
          break;
        }
        tempX = Math.floor(tempX / 10);
        tempY = Math.floor(tempY / 10);
      }

      if (!hasZeroDigit) return null;

      // Compute: where top digit is 0, write bottom digit; elsewhere subtract normally
      let result = 0;
      let place = 1;
      while (x > 0 || y > 0) {
        const dx = x % 10;
        const dy = y % 10;
        if (dx === 0 && dy > 0) {
          // Zero confusion: student writes bottom digit
          result += dy * place;
        } else if (dx >= dy) {
          result += (dx - dy) * place;
        } else {
          // For other columns where borrow is needed, use smaller-from-larger
          result += (dy - dx) * place;
        }
        place *= 10;
        x = Math.floor(x / 10);
        y = Math.floor(y / 10);
      }

      const correct = a - b;
      return result !== correct ? result : null;
    },
  },
  {
    id: 'sub_borrow_forget_reduce',
    operations: ['subtraction'],
    description:
      'Borrows for ones column but forgets to reduce tens digit (e.g., 53-28: 13-8=5, 5-2=3 -> 35)',
    minDigits: 2,
    compute(a, b) {
      // Only applies when borrowing is needed
      const onesA = a % 10;
      const onesB = b % 10;

      if (onesA >= onesB) return null; // No borrow needed in ones column

      // Borrow for ones: add 10 to ones of a
      const onesResult = onesA + 10 - onesB;
      // Forget to reduce tens: use original tens
      const tensA = Math.floor(a / 10) % 10;
      const tensB = Math.floor(b / 10) % 10;

      // For the tens column, since we forgot to reduce, subtract normally
      // If tens also needs borrow, apply the same bug recursively? No, keep simple.
      const tensResult = tensA >= tensB ? tensA - tensB : tensB - tensA;

      // Handle hundreds if present
      const hundredsA = Math.floor(a / 100);
      const hundredsB = Math.floor(b / 100);
      const hundredsResult =
        hundredsA >= hundredsB
          ? hundredsA - hundredsB
          : hundredsB - hundredsA;

      const result =
        hundredsResult * 100 + tensResult * 10 + onesResult;
      const correct = a - b;

      return result !== correct ? result : null;
    },
  },
  {
    id: 'sub_off_by_one_plus',
    operations: ['subtraction'],
    description: 'Off by one — adds 1 to the correct answer',
    minDigits: 1,
    compute(a, b) {
      const correct = a - b;
      const result = correct + 1;
      // Implausible if result equals a itself
      if (result >= a) return null;
      if (result <= 0) return null;
      return result;
    },
  },
  {
    id: 'sub_off_by_one_minus',
    operations: ['subtraction'],
    description: 'Off by one — subtracts 1 from the correct answer',
    minDigits: 1,
    compute(a, b) {
      const correct = a - b;
      return correct <= 1 ? null : correct - 1;
    },
  },
];
