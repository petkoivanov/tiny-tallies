import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const STATISTICS_HS_BUGS: readonly BugPattern[] = [
  {
    id: 'stats_zscore_sign_flip',
    operations: ['statistics_hs' as MathDomain],
    description:
      'Student negated the z-score — subtracted μ from x in the wrong order or got the opposite sign, giving -(correct z) instead of the correct value.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongSignFlip (negated z-score stored by generateZScore)
      return a;
    },
  },
  {
    id: 'stats_zscore_forgot_mean',
    operations: ['statistics_hs' as MathDomain],
    description:
      'Student forgot to subtract the mean — computed only z × σ without the (x − μ) step, confusing z·σ with x − μ.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = wrongForgetMu (forgot to divide by sigma: z*sigma stored by generateZScore)
      return b;
    },
  },
  {
    id: 'stats_normal_wrong_band',
    operations: ['statistics_hs' as MathDomain],
    description:
      'Student confused the 68% and 95% normal distribution bands — applied the 1σ rule when the 2σ rule was needed, or vice versa.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongBand (swapped 68↔95 stored by generateNormalDistribution)
      return a;
    },
  },
] as const;
