import type { BugPattern } from './types';

export const EXPRESSIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'expr_left_to_right',
    operations: ['expressions'],
    description: 'Evaluates left-to-right ignoring operator precedence (e.g., 3+4×2 = 14 instead of 11)',
    minDigits: 1,
    compute(a, b, _op) {
      // a = left-to-right result, b = correct result
      // These are stored in operands as [leftToRightResult, correct]
      return a !== b ? a : null;
    },
  },
  {
    id: 'expr_off_by_one',
    operations: ['expressions'],
    description: 'Off by one from the correct answer',
    minDigits: 1,
    compute(_a, b, _op) {
      return b + 1;
    },
  },
  {
    id: 'expr_wrong_operation',
    operations: ['expressions'],
    description: 'Applies the wrong operation to one pair (e.g., adds instead of multiplies)',
    minDigits: 1,
    compute(a, b, _op) {
      // a = wrong-operation result
      const wrong = a + 1;
      return wrong !== b ? wrong : null;
    },
  },
];
