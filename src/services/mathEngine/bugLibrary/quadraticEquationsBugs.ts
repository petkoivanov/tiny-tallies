/**
 * Bug library patterns for quadratic equations.
 *
 * Operand layout (all generators):
 *   operands[0] = wrongSignR1 (-r1, sign error on first root)
 *   operands[1] = wrongSignR2 (-r2, sign error on second root)
 *   operands[2] = r1 + r2 (sum of roots)
 *   operands[3] = r1 * r2 (product of roots)
 *
 * In the distractorGenerator, a = operands[0], b = operands[1].
 */

import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const QUADRATIC_EQUATIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'quad_wrong_sign',
    operations: ['quadratic_equations' as MathDomain],
    description:
      'Student found the correct root magnitude but used the wrong sign \u2014 confused by the factored form (x - r) vs (x + r).',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongSignR1 (= -r1)
      return a;
    },
  },
  {
    id: 'quad_sum_product_confusion',
    operations: ['quadratic_equations' as MathDomain],
    description:
      'Student confused the sum and product relationships \u2014 used the wrong-sign second root as a root.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = wrongSignR2 (= -r2)
      return b;
    },
  },
  {
    id: 'quad_only_one_root',
    operations: ['quadratic_equations' as MathDomain],
    description:
      'Student found only one root and reported it as the answer, forgetting that quadratics have two solutions.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] used as the "one root" distractor
      return a;
    },
  },
] as const;
