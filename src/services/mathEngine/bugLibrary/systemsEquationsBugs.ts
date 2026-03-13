import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const SYSTEMS_EQUATIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'sys_swapped_xy',
    operations: ['systems_equations' as MathDomain],
    description:
      'Student found the correct values for x and y but reported the y-value when asked for x.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = swappedAnswer (the y value for this problem)
      return a;
    },
  },
  {
    id: 'sys_sign_error',
    operations: ['systems_equations' as MathDomain],
    description:
      'Student made a sign error during elimination \u2014 added equations when they should have subtracted (or vice versa), negating the correct answer.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = signFlippedAnswer (-x)
      return b;
    },
  },
  {
    id: 'sys_forgot_back_sub',
    operations: ['systems_equations' as MathDomain],
    description:
      'Student solved for one variable but forgot to substitute back \u2014 left the intermediate expression as the answer instead of the final value.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] is used (same slot as swappedAnswer serves as the intermediate)
      return a;
    },
  },
] as const;
