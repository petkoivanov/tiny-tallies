import type { BugPattern } from './types';

export const FRACTIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'frac_larger_denom_larger',
    operations: ['fractions'],
    description: 'Thinks larger denominator means larger fraction (1/4 > 1/3)',
    minDigits: 1,
    compute(a, b) {
      // For comparison: picks the larger number instead of the correct answer
      return b > a ? b : a > b ? a : null;
    },
  },
  {
    id: 'frac_add_across',
    operations: ['fractions'],
    description: 'Adds numerators AND denominators (1/2 + 1/3 = 2/5)',
    minDigits: 1,
    compute(a, b) {
      // Produces a+b when the correct answer is different
      const wrong = a + b;
      return wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'frac_whole_number_compare',
    operations: ['fractions'],
    description: 'Compares only numerators, ignoring denominators',
    minDigits: 1,
    compute(a, b) {
      // Returns the other operand as a wrong comparison pick
      return b > 0 ? b : null;
    },
  },
  {
    id: 'frac_off_by_one_plus',
    operations: ['fractions'],
    description: 'Off by +1 in numerator',
    minDigits: 1,
    compute(a, b) {
      // Classic off-by-one: result + 1
      const correct = a + b;
      return correct + 1;
    },
  },
  {
    id: 'frac_off_by_one_minus',
    operations: ['fractions'],
    description: 'Off by -1 in numerator',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      return correct > 1 ? correct - 1 : null;
    },
  },
  {
    id: 'frac_mixed_number_error',
    operations: ['fractions'],
    description: 'Confuses whole part and fractional part in mixed numbers',
    minDigits: 1,
    compute(a, b) {
      if (a <= 1 || b <= 1) return null;
      // Swaps whole and fraction parts
      return b * 10 + a;
    },
  },
  {
    id: 'frac_multiply_both',
    operations: ['fractions'],
    description:
      'When multiplying fraction by whole, multiplies both numerator and denominator',
    minDigits: 1,
    compute(a, b) {
      // a × n/d: wrong answer = a × b × 2 instead of a × b
      const wrong = a * b;
      return wrong > 0 ? wrong + b : null;
    },
  },
  {
    id: 'frac_subtract_flip',
    operations: ['fractions'],
    description: 'Subtracts smaller from larger regardless of order',
    minDigits: 1,
    compute(a, b) {
      // When a < b, student computes b - a instead of a - b
      if (a >= b || b - a === a + b) return null;
      return Math.abs(a - b);
    },
  },
  {
    id: 'frac_uses_operand',
    operations: ['fractions'],
    description: 'Uses one of the operands as the answer',
    minDigits: 1,
    compute(a, _b) {
      return a > 0 ? a : null;
    },
  },
];
