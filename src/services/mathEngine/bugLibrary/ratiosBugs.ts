import type { BugPattern } from './types';

export const RATIOS_BUGS: readonly BugPattern[] = [
  {
    id: 'ratio_add_instead',
    operations: ['ratios'],
    description: 'Adds terms instead of dividing/multiplying for proportional reasoning',
    minDigits: 1,
    compute(a, b, _op) {
      // e.g., "3:5 = ?:10" → child adds 5 to get 8 instead of multiplying
      return a + b;
    },
  },
  {
    id: 'ratio_subtract_instead',
    operations: ['ratios'],
    description: 'Subtracts instead of using ratio relationship',
    minDigits: 1,
    compute(a, b, _op) {
      const wrong = Math.abs(a - b);
      return wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'ratio_swap_terms',
    operations: ['ratios'],
    description: 'Uses the other term of the ratio as the answer',
    minDigits: 1,
    compute(a, b, _op) {
      return b;
    },
  },
  {
    id: 'ratio_percent_off_by_ten',
    operations: ['ratios'],
    description: 'Misplaces decimal in percent conversion (e.g., 0.5 → 5% instead of 50%)',
    minDigits: 1,
    compute(a, b, _op) {
      if (b === 0) return null;
      const correct = Math.round((a / b) * 100);
      const wrong = Math.round((a / b) * 10);
      return wrong !== correct && wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'ratio_invert_fraction',
    operations: ['ratios'],
    description: 'Inverts the ratio (uses b/a instead of a/b)',
    minDigits: 1,
    compute(a, b, _op) {
      if (a === 0 || b === 0) return null;
      const correct = Math.round(a / b);
      const wrong = Math.round(b / a);
      return wrong !== correct && wrong > 0 ? wrong : null;
    },
  },
];
