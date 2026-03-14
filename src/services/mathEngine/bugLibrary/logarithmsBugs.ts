import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const LOGARITHMS_BUGS: readonly BugPattern[] = [
  {
    id: 'log_gave_argument',
    operations: ['logarithms' as MathDomain],
    description:
      'Student gave the argument instead of the exponent -- e.g., answered 1000 instead of 3 for log10(1000).',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongArgument (pre-stored by generator)
      return a;
    },
  },
  {
    id: 'log_off_by_one',
    operations: ['logarithms' as MathDomain],
    description:
      'Student miscounted -- off by one in the exponent.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = wrongOffByOne (pre-stored by generator)
      return b;
    },
  },
  {
    id: 'log_confused_base',
    operations: ['logarithms' as MathDomain],
    description:
      'Student confused the base -- e.g., computed log2 when the problem asks log10.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongArgument/wrongSquared (pre-stored by generator)
      return a;
    },
  },
] as const;
