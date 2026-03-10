import type { BugPattern } from './types';

export const DATA_ANALYSIS_BUGS: readonly BugPattern[] = [
  {
    id: 'da_mean_no_divide',
    operations: ['data_analysis'],
    description: 'Adds values but forgets to divide by count (sum instead of mean)',
    minDigits: 1,
    compute(a, b) {
      // Returns sum instead of mean — a is correct answer, b is count
      const sum = a * b;
      return sum !== a ? sum : null;
    },
  },
  {
    id: 'da_median_unsorted',
    operations: ['data_analysis'],
    description: 'Picks middle value without sorting first',
    minDigits: 1,
    compute(a, b) {
      // Returns a different value; simulates picking from unsorted data
      return a !== b ? b : null;
    },
  },
  {
    id: 'da_range_max_only',
    operations: ['data_analysis'],
    description: 'Reports maximum value instead of range (max - min)',
    minDigits: 1,
    compute(a, b) {
      // a is correct range, b is max value
      return b !== a ? b : null;
    },
  },
  {
    id: 'da_off_by_one_bin',
    operations: ['data_analysis'],
    description: 'Reads adjacent bin in histogram',
    minDigits: 1,
    compute(a) {
      return a > 1 ? a - 1 : a + 1;
    },
  },
  {
    id: 'da_iqr_wrong',
    operations: ['data_analysis'],
    description: 'Computes Q3 - Q1 incorrectly (subtracts from median instead)',
    minDigits: 1,
    compute(a, b) {
      // a is correct IQR, b is median; returns median - Q1 ≈ a/2
      const wrong = Math.round(a / 2);
      return wrong !== a && wrong > 0 ? wrong : null;
    },
  },
  {
    id: 'da_count_axis_not_dots',
    operations: ['data_analysis'],
    description: 'Counts axis marks instead of data points',
    minDigits: 1,
    compute(a, b) {
      // Returns the axis range count instead of data point count
      return a !== b ? b : null;
    },
  },
];
