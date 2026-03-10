import type { BugPattern } from './types';

export const MULTIPLICATION_BUGS: readonly BugPattern[] = [
  {
    id: 'mul_add_instead',
    operations: ['multiplication'],
    description: 'Adds operands instead of multiplying',
    minDigits: 1,
    compute(a, b) {
      const wrong = a + b;
      return wrong !== a * b ? wrong : null;
    },
  },
  {
    id: 'mul_off_by_one_group',
    operations: ['multiplication'],
    description: 'One too many groups (a+1)*b or (a-1)*b',
    minDigits: 1,
    compute(a, b) {
      const correct = a * b;
      const more = (a + 1) * b;
      if (more !== correct) return more;
      const less = (a - 1) * b;
      return less > 0 && less !== correct ? less : null;
    },
  },
  {
    id: 'mul_adjacent_fact',
    operations: ['multiplication'],
    description: 'Off-by-one in times table (gives a*(b+1) or a*(b-1))',
    minDigits: 1,
    compute(a, b) {
      const correct = a * b;
      const up = a * (b + 1);
      if (up !== correct) return up;
      const down = a * (b - 1);
      return down > 0 && down !== correct ? down : null;
    },
  },
  {
    id: 'mul_zero_any',
    operations: ['multiplication'],
    description: 'N × 0 = N (identity confusion with zero)',
    minDigits: 1,
    compute(a, b) {
      if (b === 0) return a > 0 ? a : null;
      if (a === 0) return b > 0 ? b : null;
      return null;
    },
  },
  {
    id: 'mul_one_add',
    operations: ['multiplication'],
    description: 'N × 1 = N + 1 (confuses ×1 with +1)',
    minDigits: 1,
    compute(a, b) {
      if (a === 1) return b + 1;
      if (b === 1) return a + 1;
      return null;
    },
  },
  {
    id: 'mul_partial_product_error',
    operations: ['multiplication'],
    description: 'Multiplies ones digit correctly but ignores tens carry',
    minDigits: 2,
    compute(a, b) {
      if (a < 10 && b < 10) return null;
      const onesA = a % 10;
      const tensA = Math.floor(a / 10);
      const onesProduct = onesA * b;
      const tensProduct = tensA * b;
      // Writes partial products side by side without adding
      const wrong = tensProduct * 10 + (onesProduct % 10);
      return wrong !== a * b && wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'mul_place_value_shift',
    operations: ['multiplication'],
    description: 'Forgets to shift when multiplying by tens (e.g., 3×20=60 written as 6)',
    minDigits: 1,
    compute(a, b) {
      if (b % 10 !== 0 || b === 0) return null;
      const factor = b / 10;
      const wrong = a * factor;
      return wrong !== a * b ? wrong : null;
    },
  },
  {
    id: 'mul_off_by_one_plus',
    operations: ['multiplication'],
    description: 'Off by one — adds 1 to correct product',
    minDigits: 1,
    compute(a, b) {
      return a * b + 1;
    },
  },
];
