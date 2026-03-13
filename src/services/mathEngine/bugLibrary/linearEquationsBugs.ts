import type { BugPattern } from './types';

/**
 * Bug patterns for the linear_equations domain.
 *
 * These patterns model common algebra misconceptions using the balance model:
 * - lin_wrong_operation: student does not maintain balance on both sides
 * - lin_sign_flip: student moves a constant across the equals sign without flipping its sign
 * - lin_forgot_to_divide: student completes the first step but forgot to divide by the coefficient
 *
 * Operand layout (set by generators):
 *   operands[0] = wrong-operation result (used by lin_wrong_operation and lin_forgot_to_divide)
 *   operands[1] = the constant b (used by lin_sign_flip: compute(a=correctX, b=constant))
 *   operands[2] = correct answer x (informational)
 */
export const LINEAR_EQUATIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'lin_wrong_operation',
    operations: ['linear_equations'],
    description:
      'Student did not maintain balance on both sides — used the wrong inverse operation when isolating the variable.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: string): number | null {
      // operands[0] pre-stores the wrong-operation result
      return a;
    },
  },
  {
    id: 'lin_sign_flip',
    operations: ['linear_equations'],
    description:
      'Student moved the constant across the equals sign without flipping its sign — did not maintain balance on both sides.',
    minDigits: 1,
    compute(a: number, b: number, _operation: string): number | null {
      // a = correctX, b = constant
      // Wrong answer: student adds constant instead of subtracting
      const wrong = a + 2 * b;
      return wrong !== a ? wrong : null;
    },
  },
  {
    id: 'lin_forgot_to_divide',
    operations: ['linear_equations'],
    description:
      'Student completed the first step correctly but forgot to divide by the coefficient at the end.',
    minDigits: 1,
    compute(a: number, b: number, _operation: string): number | null {
      // a = forgotDiv result (pre-stored in operands[0])
      // b = correct answer (operands[2] proxy — operands[1] is constant)
      // Returns null if forgot-divide equals the correct answer
      return a !== b ? a : null;
    },
  },
];
