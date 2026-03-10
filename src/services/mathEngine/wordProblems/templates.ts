import type { WordProblemTemplate } from './types';

export const WORD_PROBLEM_TEMPLATES: readonly WordProblemTemplate[] = [
  // ─── Addition ───
  {
    id: 'wp_add_combine',
    operations: ['addition'],
    template: '{name} has {a} {object}. {name2} has {b} {object}.',
    question: 'How many {object} do they have together?',
    minGrade: 1,
  },
  {
    id: 'wp_add_join',
    operations: ['addition'],
    template: '{name} {verb} {a} {object}. Then {name} {verb} {b} more {object}.',
    question: 'How many {object} does {name} have now?',
    minGrade: 1,
  },
  {
    id: 'wp_add_context',
    operations: ['addition'],
    template:
      '{name} went to {place} and {verb} {a} {object}. Later, {name} {verb} {b} more {object}.',
    question: 'How many {object} does {name} have in all?',
    minGrade: 2,
  },

  // ─── Subtraction ───
  {
    id: 'wp_sub_take_away',
    operations: ['subtraction'],
    template: '{name} had {a} {object}. {name} {giveVerb} {b} {object}.',
    question: 'How many {object} does {name} have left?',
    minGrade: 1,
  },
  {
    id: 'wp_sub_compare',
    operations: ['subtraction'],
    template: '{name} has {a} {object}. {name2} has {b} {object}.',
    question: 'How many more {object} does {name} have than {name2}?',
    minGrade: 2,
  },

  // ─── Multiplication ───
  {
    id: 'wp_mul_equal_groups',
    operations: ['multiplication'],
    template: '{name} has {a} {container}. Each {container_s} has {b} {object}.',
    question: 'How many {object} does {name} have in all?',
    minGrade: 2,
  },
  {
    id: 'wp_mul_repeated',
    operations: ['multiplication'],
    template: '{name} bought {a} packs of {object}. Each pack has {b} {object}.',
    question: 'How many {object} did {name} buy?',
    minGrade: 3,
  },

  // ─── Division ───
  {
    id: 'wp_div_sharing',
    operations: ['division'],
    template:
      '{name} has {a} {object} to share equally among {b} friends.',
    question: 'How many {object} does each friend get?',
    minGrade: 3,
  },
  {
    id: 'wp_div_grouping',
    operations: ['division'],
    template:
      '{name} has {a} {object}. {name} puts {b} {object} in each {container_s}.',
    question: 'How many {container} does {name} need?',
    minGrade: 3,
  },

  // ─── Money ───
  {
    id: 'wp_money_total',
    operations: ['money'],
    template: '{name} buys a toy for {a}¢ and a book for {b}¢.',
    question: 'How much did {name} spend in all?',
    minGrade: 2,
  },
  {
    id: 'wp_money_change',
    operations: ['money'],
    template: '{name} has {a}¢. {name} buys a snack for {b}¢.',
    question: 'How much change does {name} get?',
    minGrade: 2,
  },

  // ─── Time ───
  {
    id: 'wp_time_elapsed',
    operations: ['time'],
    template:
      '{name} started reading at {a}. {name} read for {b} minutes.',
    question: 'What time did {name} finish?',
    minGrade: 3,
  },
];
