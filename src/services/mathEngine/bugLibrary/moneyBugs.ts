import type { BugPattern } from './types';

export const MONEY_BUGS: readonly BugPattern[] = [
  {
    id: 'money_size_value_confusion',
    operations: ['money'],
    description: 'Thinks bigger coin = more value (nickel > dime because larger)',
    minDigits: 1,
    compute(a, b) {
      // Swaps dime (10) and nickel (5) values
      if (a === 10) return 5;
      if (a === 5) return 10;
      return null;
    },
  },
  {
    id: 'money_count_coins_not_value',
    operations: ['money'],
    description: 'Counts number of coins instead of total value',
    minDigits: 1,
    compute(a, b) {
      // a = coin value in cents, b = count
      // Wrong: reports count instead of value
      if (b > 1) return b;
      return null;
    },
  },
  {
    id: 'money_quarter_addition',
    operations: ['money'],
    description: 'Adds quarters as 20 cents instead of 25',
    minDigits: 1,
    compute(a, b) {
      if (a !== 25) return null;
      return 20 * b;
    },
  },
  {
    id: 'money_cent_dollar_boundary',
    operations: ['money'],
    description: 'Confuses cents and dollars at boundary (100¢ → $10.00)',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      if (correct < 100) return null;
      return correct * 10;
    },
  },
  {
    id: 'money_off_by_coin',
    operations: ['money'],
    description: 'Off by one coin value in total',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      // Add one extra penny
      return correct + 1;
    },
  },
  {
    id: 'money_change_direction',
    operations: ['money'],
    description: 'Subtracts in wrong direction when making change',
    minDigits: 1,
    compute(a, b) {
      if (a <= b) return null;
      // Instead of a - b, computes b - a (negative, takes absolute)
      const wrong = Math.abs(b - a);
      return wrong !== a - b ? wrong : null;
    },
  },
  {
    id: 'money_skip_count_switch',
    operations: ['money'],
    description: 'Starts skip counting by wrong value when switching coin types',
    minDigits: 1,
    compute(a, b) {
      const correct = a + b;
      return correct > 5 ? correct - 5 : null;
    },
  },
];
