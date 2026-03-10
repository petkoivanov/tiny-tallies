import type { WordProblemTemplate } from './types';

export const WORD_PROBLEM_TEMPLATES: readonly WordProblemTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITION — grades 1-4
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_add_combine',
    operations: ['addition'],
    template: '{name} has {a} {object}. {name2} has {b} {object}.',
    question: 'How many {object} do they have together?',
    minGrade: 1,
    maxGrade: 2,
  },
  {
    id: 'wp_add_join',
    operations: ['addition'],
    template: '{name} {verb} {a} {object}. Then {name} {verb} {b} more {object}.',
    question: 'How many {object} does {name} have now?',
    minGrade: 1,
    maxGrade: 3,
  },
  {
    id: 'wp_add_context',
    operations: ['addition'],
    template:
      '{name} went to {place} and {verb} {a} {object}. Later, {name} {verb} {b} more {object}.',
    question: 'How many {object} does {name} have in all?',
    minGrade: 2,
    maxGrade: 4,
  },
  {
    id: 'wp_add_trip',
    operations: ['addition'],
    template:
      'On a field trip, {name} collected {a} {object} in the morning and {b} {object} in the afternoon.',
    question: 'How many {object} did {name} collect during the whole trip?',
    minGrade: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBTRACTION — grades 1-4
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_sub_take_away',
    operations: ['subtraction'],
    template: '{name} had {a} {object}. {name} {giveVerb} {b} {object}.',
    question: 'How many {object} does {name} have left?',
    minGrade: 1,
    maxGrade: 3,
  },
  {
    id: 'wp_sub_compare',
    operations: ['subtraction'],
    template: '{name} has {a} {object}. {name2} has {b} {object}.',
    question: 'How many more {object} does {name} have than {name2}?',
    minGrade: 2,
    maxGrade: 4,
  },
  {
    id: 'wp_sub_project',
    operations: ['subtraction'],
    template:
      '{name} had {a} {object} for a project at {place}. After using {b} of them, how many are left?',
    question: 'How many {object} does {name} have now?',
    minGrade: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPLICATION — grades 2-4
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_mul_equal_groups',
    operations: ['multiplication'],
    template: '{name} has {a} {container}. Each {container_s} has {b} {object}.',
    question: 'How many {object} does {name} have in all?',
    minGrade: 2,
    maxGrade: 3,
  },
  {
    id: 'wp_mul_repeated',
    operations: ['multiplication'],
    template: '{name} bought {a} packs of {object}. Each pack has {b} {object}.',
    question: 'How many {object} did {name} buy?',
    minGrade: 3,
    maxGrade: 4,
  },
  {
    id: 'wp_mul_arrange',
    operations: ['multiplication'],
    template:
      'For a school event at {place}, {name} set up {a} rows of chairs with {b} chairs in each row.',
    question: 'How many chairs did {name} set up?',
    minGrade: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DIVISION — grades 3-4
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // MONEY — grades 2-4
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_money_total',
    operations: ['money'],
    template: '{name} buys a toy for {a}\u00A2 and a book for {b}\u00A2.',
    question: 'How much did {name} spend in all?',
    minGrade: 2,
  },
  {
    id: 'wp_money_change',
    operations: ['money'],
    template: '{name} has {a}\u00A2. {name} buys a snack for {b}\u00A2.',
    question: 'How much change does {name} get?',
    minGrade: 2,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIME — grades 3
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_time_elapsed',
    operations: ['time'],
    template:
      '{name} started reading at {a}. {name} read for {b} minutes.',
    question: 'What time did {name} finish?',
    minGrade: 3,
  },
  {
    id: 'wp_time_duration',
    operations: ['time'],
    template:
      '{name} arrived at {place} at {a}. {name} left at {b}.',
    question: 'How long was {name} there?',
    minGrade: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRACTIONS — grades 1-4
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_frac_share',
    operations: ['fractions'],
    template:
      '{name} has a pizza cut into {b} equal slices. {name} eats {a} slices.',
    question: 'What fraction of the pizza did {name} eat?',
    minGrade: 1,
    maxGrade: 3,
  },
  {
    id: 'wp_frac_compare',
    operations: ['fractions'],
    template:
      '{name} ate {a} of a pie. {name2} ate {b} of the same pie.',
    question: 'Who ate more?',
    minGrade: 3,
  },
  {
    id: 'wp_frac_add',
    operations: ['fractions'],
    template:
      '{name} drank {a} of a bottle of juice in the morning and {b} of the bottle in the afternoon.',
    question: 'How much juice did {name} drink in all?',
    minGrade: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLACE VALUE — grades 1-5 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_pv_count',
    operations: ['place_value'],
    mode: 'prefix',
    template: 'At {place}, {name} counted {a} {object}.',
    question: '',
    minGrade: 1,
    maxGrade: 3,
  },
  {
    id: 'wp_pv_collect',
    operations: ['place_value'],
    mode: 'prefix',
    template:
      'For a school project, {name} is studying the number {a}.',
    question: '',
    minGrade: 2,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PATTERNS — grades 1-4 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_pat_nature',
    operations: ['patterns'],
    mode: 'prefix',
    template: '{name} noticed a number pattern.',
    question: '',
    minGrade: 1,
    maxGrade: 2,
  },
  {
    id: 'wp_pat_activity',
    operations: ['patterns'],
    mode: 'prefix',
    template:
      'While sorting {object} at {place}, {name} found a number pattern.',
    question: '',
    minGrade: 2,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEASUREMENT — grades 4-5 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_meas_build',
    operations: ['measurement'],
    mode: 'prefix',
    template:
      '{name} is building something at {place} and needs to convert a measurement.',
    question: '',
    minGrade: 4,
  },
  {
    id: 'wp_meas_cook',
    operations: ['measurement'],
    mode: 'prefix',
    template:
      'While helping in the kitchen, {name} needs to measure ingredients.',
    question: '',
    minGrade: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RATIOS — grades 6-7 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_ratio_shop',
    operations: ['ratios'],
    mode: 'prefix',
    template: '{name} is comparing prices at {place}.',
    question: '',
    minGrade: 6,
  },
  {
    id: 'wp_ratio_recipe',
    operations: ['ratios'],
    mode: 'prefix',
    template:
      '{name} is adjusting a recipe and needs to figure out the right amounts.',
    question: '',
    minGrade: 6,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPONENTS — grades 5-8 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_exp_area',
    operations: ['exponents'],
    mode: 'prefix',
    template:
      '{name} is calculating areas for a science project.',
    question: '',
    minGrade: 5,
    maxGrade: 6,
  },
  {
    id: 'wp_exp_science',
    operations: ['exponents'],
    mode: 'prefix',
    template:
      'In science class, {name} is working with large numbers and powers.',
    question: '',
    minGrade: 5,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPRESSIONS — grades 5-6 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_expr_puzzle',
    operations: ['expressions'],
    mode: 'prefix',
    template: '{name} is solving a math puzzle.',
    question: '',
    minGrade: 5,
    maxGrade: 5,
  },
  {
    id: 'wp_expr_homework',
    operations: ['expressions'],
    mode: 'prefix',
    template:
      'For homework, {name} needs to find the value of an expression. Remember to follow the order of operations!',
    question: '',
    minGrade: 5,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GEOMETRY — grades 7-8 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_geo_design',
    operations: ['geometry'],
    mode: 'prefix',
    template: '{name} is designing a space at {place} and needs to solve a geometry problem.',
    question: '',
    minGrade: 7,
  },
  {
    id: 'wp_geo_build',
    operations: ['geometry'],
    mode: 'prefix',
    template:
      'For a building project, {name} needs to calculate some measurements.',
    question: '',
    minGrade: 7,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROBABILITY — grade 7 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_prob_game',
    operations: ['probability'],
    mode: 'prefix',
    template: '{name} is playing a probability game at {place}.',
    question: '',
    minGrade: 7,
  },
  {
    id: 'wp_prob_predict',
    operations: ['probability'],
    mode: 'prefix',
    template:
      'In science class, {name} is making predictions about a random experiment.',
    question: '',
    minGrade: 7,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NUMBER THEORY — grade 6 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_nt_share',
    operations: ['number_theory'],
    mode: 'prefix',
    template:
      '{name} is figuring out how to organize {object} into equal groups.',
    question: '',
    minGrade: 6,
  },
  {
    id: 'wp_nt_schedule',
    operations: ['number_theory'],
    mode: 'prefix',
    template:
      '{name} is working on a number theory problem for math class.',
    question: '',
    minGrade: 6,
  },
];
