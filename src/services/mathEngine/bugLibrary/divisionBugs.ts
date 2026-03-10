import type { BugPattern } from './types';

export const DIVISION_BUGS: readonly BugPattern[] = [
  {
    id: 'div_subtract_instead',
    operations: ['division'],
    description: 'Subtracts instead of dividing',
    minDigits: 1,
    compute(a, b) {
      if (b === 0) return null;
      const wrong = a - b;
      return wrong > 0 && wrong !== a / b ? wrong : null;
    },
  },
  {
    id: 'div_reverse_operands',
    operations: ['division'],
    description: 'Divides b ÷ a instead of a ÷ b',
    minDigits: 1,
    compute(a, b) {
      if (a === 0 || b === 0) return null;
      if (b % a !== 0) return null;
      const wrong = b / a;
      return wrong !== a / b ? wrong : null;
    },
  },
  {
    id: 'div_off_by_one',
    operations: ['division'],
    description: 'Off by one in quotient',
    minDigits: 1,
    compute(a, b) {
      if (b === 0) return null;
      const correct = a / b;
      return correct + 1;
    },
  },
  {
    id: 'div_multiply_instead',
    operations: ['division'],
    description: 'Multiplies instead of dividing',
    minDigits: 1,
    compute(a, b) {
      if (b === 0) return null;
      const wrong = a * b;
      return wrong !== a / b ? wrong : null;
    },
  },
  {
    id: 'div_remainder_ignore',
    operations: ['division'],
    description: 'Drops remainder and rounds down when should report remainder',
    minDigits: 1,
    compute(a, b) {
      if (b === 0 || a % b === 0) return null;
      return Math.floor(a / b);
    },
  },
  {
    id: 'div_add_instead',
    operations: ['division'],
    description: 'Adds operands instead of dividing',
    minDigits: 1,
    compute(a, b) {
      if (b === 0) return null;
      const wrong = a + b;
      return wrong !== a / b ? wrong : null;
    },
  },
];
