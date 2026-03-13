import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const SEQUENCES_SERIES_BUGS: readonly BugPattern[] = [
  {
    id: 'seq_arithmetic_wrong_step',
    operations: ['sequences_series' as MathDomain],
    description:
      'Student identified the common difference incorrectly — used d+1 or d-1 instead of the actual step between terms, resulting in an answer one step off.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongStep (last displayed term + incremented d)
      return a;
    },
  },
  {
    id: 'seq_arithmetic_off_by_one',
    operations: ['sequences_series' as MathDomain],
    description:
      'Student found the term at the wrong index — used n instead of (n-1) in the nth-term formula, resulting in an off-by-one error on the term position.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = wrongIndex (last displayed term, off-by-one)
      return b;
    },
  },
  {
    id: 'seq_geometric_uses_arithmetic',
    operations: ['sequences_series' as MathDomain],
    description:
      'Student applied arithmetic sequence thinking to a geometric sequence — added the ratio instead of multiplying by it, confusing common difference with common ratio.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongArithmetic (added ratio instead of multiplied)
      return a;
    },
  },
] as const;
