import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const EXPONENTIAL_FUNCTIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'exp_linear_thinking',
    operations: ['exponential_functions' as MathDomain],
    description:
      'Student used multiplication instead of exponentiation -- computed base * exponent instead of base^exponent.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongMultiply (pre-stored by generator)
      return a;
    },
  },
  {
    id: 'exp_off_by_one_period',
    operations: ['exponential_functions' as MathDomain],
    description:
      'Student computed one fewer period -- used (n-1) instead of n in the exponent.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = wrongOneLess (pre-stored by generator)
      return b;
    },
  },
  {
    id: 'exp_growth_decay_swap',
    operations: ['exponential_functions' as MathDomain],
    description:
      'Student confused growth with decay -- multiplied when should have divided, or vice versa.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongDouble (pre-stored by decay generator)
      return a;
    },
  },
] as const;
