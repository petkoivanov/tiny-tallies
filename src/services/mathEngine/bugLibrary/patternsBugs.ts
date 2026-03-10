import type { BugPattern } from './types';

export const PATTERNS_BUGS: readonly BugPattern[] = [
  {
    id: 'pattern_linear_only',
    operations: ['patterns'],
    description: 'Assumes pattern always adds same constant (misses multiplication patterns)',
    minDigits: 1,
    compute(a, b) {
      // For multiplication patterns: gives additive answer instead
      const wrong = a + b;
      return wrong !== a * b ? wrong : null;
    },
  },
  {
    id: 'missing_add_instead',
    operations: ['patterns'],
    description: 'Adds instead of subtracting to find missing number',
    minDigits: 1,
    compute(a, b) {
      // For □ + b = c: should be c - b, but adds c + b
      const wrong = a + b + b;
      return wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'missing_reverse_operation',
    operations: ['patterns'],
    description: 'Uses wrong inverse operation for missing number',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      return correct + 1;
    },
  },
  {
    id: 'io_table_constant',
    operations: ['patterns'],
    description: 'Uses input as output (identity) instead of applying rule',
    minDigits: 1,
    compute(a) {
      return a;
    },
  },
  {
    id: 'pattern_off_by_step',
    operations: ['patterns'],
    description: 'Gives the value one step too early or late in sequence',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      return correct - b > 0 ? correct - b : correct + b;
    },
  },
];
