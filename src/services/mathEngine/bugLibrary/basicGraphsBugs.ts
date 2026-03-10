import type { BugPattern } from './types';

export const BASIC_GRAPHS_BUGS: readonly BugPattern[] = [
  {
    id: 'graph_misread_value',
    operations: ['basic_graphs'],
    description: 'Reads adjacent category value instead of the asked one',
    minDigits: 1,
    compute(a, b) {
      // Returns b instead of a (read the wrong bar/row)
      return a !== b ? b : null;
    },
  },
  {
    id: 'graph_count_categories',
    operations: ['basic_graphs'],
    description: 'Counts number of categories instead of the value',
    minDigits: 1,
    compute(a, b) {
      // Typical graph has 3-5 categories; returns 4 as a common mistake
      const catCount = 4;
      return a !== catCount ? catCount : null;
    },
  },
  {
    id: 'graph_off_by_one',
    operations: ['basic_graphs'],
    description: 'Miscounts by one (off-by-one reading error)',
    minDigits: 1,
    compute(a) {
      return a > 1 ? a - 1 : a + 1;
    },
  },
  {
    id: 'graph_ignore_scale',
    operations: ['basic_graphs'],
    description: 'Counts icons without applying scale factor',
    minDigits: 1,
    compute(a, b) {
      // If scale > 1, child counts icons instead of multiplying
      if (b > 1) {
        const iconCount = Math.round(a / b);
        return iconCount !== a ? iconCount : null;
      }
      return null;
    },
  },
  {
    id: 'graph_subtract_wrong_order',
    operations: ['basic_graphs'],
    description: 'Subtracts smaller from larger regardless of question order',
    minDigits: 1,
    compute(a, b) {
      // For "how many more A than B": computes |a-b| but question might ask b-a
      const wrong = a + b;
      return wrong !== Math.abs(a - b) ? wrong : null;
    },
  },
  {
    id: 'graph_add_instead_of_subtract',
    operations: ['basic_graphs'],
    description: 'Adds values instead of finding difference',
    minDigits: 1,
    compute(a, b) {
      const sum = a + b;
      const diff = Math.abs(a - b);
      return sum !== diff ? sum : null;
    },
  },
];
