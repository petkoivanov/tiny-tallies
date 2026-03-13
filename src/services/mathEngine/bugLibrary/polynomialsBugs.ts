import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const POLYNOMIALS_BUGS: readonly BugPattern[] = [
  {
    id: 'poly_foil_forgot_middle',
    operations: ['polynomials' as MathDomain],
    description:
      'Student forgot middle terms in FOIL expansion — computed only First and Last, missing Outer and Inner.',
    minDigits: 1,
    compute(a: number, b: number, _operation: MathDomain): number | null {
      // operands layout: [a, b, x, forgotMiddle]
      // distractorGenerator passes operands[0] as a, operands[1] as b
      // For FOIL: forgotMiddle is stored in operands[3], but bug compute
      // only receives operands[0..1]. Return a*b as the F+L only proxy.
      // Actually the convention is compute(operands[0], operands[1], op).
      // forgotMiddle = x*x + a*b (F+L only). We approximate with a*b.
      return a * b;
    },
  },
  {
    id: 'poly_wrong_gcf',
    operations: ['polynomials' as MathDomain],
    description:
      'Student factored out a non-maximal common factor — used half of the actual GCF.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = gcf. Half the GCF as a wrong distractor.
      return Math.floor(a / 2);
    },
  },
  {
    id: 'poly_sign_error',
    operations: ['polynomials' as MathDomain],
    description:
      'Student made a sign error in expansion or factoring — negated the correct answer.',
    minDigits: 1,
    compute(a: number, b: number, _operation: MathDomain): number | null {
      // Negate the sum of cross terms as a sign-error proxy.
      // For general use: negate b (operands[1]).
      return -b;
    },
  },
] as const;
