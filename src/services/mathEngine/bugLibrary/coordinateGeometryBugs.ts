import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const COORDINATE_GEOMETRY_BUGS: readonly BugPattern[] = [
  {
    id: 'coord_slope_swapped_rise_run',
    operations: ['coordinate_geometry' as MathDomain],
    description:
      'Student divided the horizontal change by the vertical change instead of vertical over horizontal — confused which quantity is rise and which is run in the slope formula.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = run/rise (the swapped reciprocal value)
      return a;
    },
  },
  {
    id: 'coord_slope_sign_error',
    operations: ['coordinate_geometry' as MathDomain],
    description:
      'Student found the correct magnitude but used the wrong sign — did not track the direction of the rise or run.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = negated slope value
      return b;
    },
  },
  {
    id: 'coord_distance_forgot_sqrt',
    operations: ['coordinate_geometry' as MathDomain],
    description:
      'Student computed the sum of squared differences (dx² + dy²) but forgot to take the square root at the final step of the distance formula.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = dx^2 + dy^2 (the d-squared value)
      return a;
    },
  },
] as const;
