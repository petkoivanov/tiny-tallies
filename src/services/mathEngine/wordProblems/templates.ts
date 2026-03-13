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

  // TIME — excluded from word-problem wrapping.
  // Time generators already produce contextual questions with properly formatted
  // times (e.g. "It is 2:15..."). Operands are raw minute/hour counts, not
  // displayable times, so word-problem templates can't use {a}/{b} correctly.

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

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC GRAPHS — grades 1-4 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_bg_survey',
    operations: ['basic_graphs'],
    mode: 'prefix',
    template: '{name} took a survey of classmates at {place}.',
    question: '',
    minGrade: 1,
    maxGrade: 2,
  },
  {
    id: 'wp_bg_project',
    operations: ['basic_graphs'],
    mode: 'prefix',
    template:
      'For a class project, {name} collected data and made a graph.',
    question: '',
    minGrade: 2,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Data Analysis
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_da_science',
    operations: ['data_analysis'],
    mode: 'prefix',
    template:
      'In science class, {name} recorded data from an experiment.',
    question: '',
    minGrade: 4,
  },
  {
    id: 'wp_da_survey',
    operations: ['data_analysis'],
    mode: 'prefix',
    template:
      '{name} collected survey results from students at {place}.',
    question: '',
    minGrade: 5,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COORDINATE GEOMETRY — grades 8-10 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_coord_map',
    operations: ['coordinate_geometry'],
    mode: 'prefix',
    template: '{name} is reading a map where each unit represents one kilometer.',
    question: '',
    minGrade: 8,
  },
  {
    id: 'wp_coord_city',
    operations: ['coordinate_geometry'],
    mode: 'prefix',
    template: '{name} is planning a walking route through {place}.',
    question: '',
    minGrade: 8,
  },
  {
    id: 'wp_coord_ramp',
    operations: ['coordinate_geometry'],
    mode: 'prefix',
    template: '{name} is checking the steepness of a ramp for a school project.',
    question: '',
    minGrade: 8,
  },
  {
    id: 'wp_coord_phone',
    operations: ['coordinate_geometry'],
    mode: 'prefix',
    template: '{name} is finding the distance between two cell towers on a grid.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_coord_bridge',
    operations: ['coordinate_geometry'],
    mode: 'prefix',
    template: '{name} is designing a bridge support and needs to find its slope.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_coord_map2',
    operations: ['coordinate_geometry'],
    mode: 'prefix',
    template: '{name} is plotting the path of a delivery drone on a coordinate grid.',
    question: '',
    minGrade: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LINEAR EQUATIONS — grades 6-9 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_lin_age_1',
    operations: ['linear_equations'],
    mode: 'prefix',
    template: '{name} is working on an age puzzle.',
    question: '',
    minGrade: 6,
  },
  {
    id: 'wp_lin_age_2',
    operations: ['linear_equations'],
    mode: 'prefix',
    template: '{name} is trying to find a mystery number using clues about ages.',
    question: '',
    minGrade: 6,
  },
  {
    id: 'wp_lin_distance_1',
    operations: ['linear_equations'],
    mode: 'prefix',
    template: '{name} is solving a distance problem for a trip.',
    question: '',
    minGrade: 6,
  },
  {
    id: 'wp_lin_distance_2',
    operations: ['linear_equations'],
    mode: 'prefix',
    template: '{name} is calculating how far two trains will travel.',
    question: '',
    minGrade: 6,
  },
  {
    id: 'wp_lin_money_1',
    operations: ['linear_equations'],
    mode: 'prefix',
    template: '{name} is figuring out the cost of items at {place}.',
    question: '',
    minGrade: 6,
  },
  {
    id: 'wp_lin_money_2',
    operations: ['linear_equations'],
    mode: 'prefix',
    template: '{name} is working out how much money to save each week.',
    question: '',
    minGrade: 6,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEQUENCES & SERIES — grades 9-10 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_seq_savings',
    operations: ['sequences_series'],
    mode: 'prefix',
    template: '{name} is saving the same amount of money each week toward a new bike.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_seq_growth',
    operations: ['sequences_series'],
    mode: 'prefix',
    template: '{name} is tracking how a plant grows the same number of centimeters each day.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_seq_stacking',
    operations: ['sequences_series'],
    mode: 'prefix',
    template: '{name} is stacking boxes where each row has the same number of boxes more than the row below it.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_seq_population',
    operations: ['sequences_series'],
    mode: 'prefix',
    template: '{name} is studying how a bacteria colony doubles in size each hour in a science experiment.',
    question: '',
    minGrade: 10,
  },
  {
    id: 'wp_seq_tiles',
    operations: ['sequences_series'],
    mode: 'prefix',
    template: '{name} is tiling a patio where each new row has three times as many tiles as the previous row.',
    question: '',
    minGrade: 10,
  },
  {
    id: 'wp_seq_interest',
    operations: ['sequences_series'],
    mode: 'prefix',
    template: '{name} is tracking how an investment grows by the same percentage each year.',
    question: '',
    minGrade: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS HS — grades 9-10 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wp_stats_survey',
    operations: ['statistics_hs'],
    mode: 'prefix',
    template: '{name} is analyzing survey results about test scores at {place}.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_stats_scores',
    operations: ['statistics_hs'],
    mode: 'prefix',
    template: '{name} is studying how exam scores are distributed in a class.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_stats_data',
    operations: ['statistics_hs'],
    mode: 'prefix',
    template: '{name} collected data on heights of students and is analyzing the spread.',
    question: '',
    minGrade: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SYSTEMS OF EQUATIONS — grades 9-10 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'wp_sys_tickets',
    operations: ['systems_equations'],
    mode: 'prefix',
    template: '{name} is selling two types of tickets for a school event.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_sys_prices',
    operations: ['systems_equations'],
    mode: 'prefix',
    template: '{name} is comparing the prices of two different items at {place}.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_sys_ages',
    operations: ['systems_equations'],
    mode: 'prefix',
    template:
      "{name} is solving a puzzle about the combined and difference of two people's ages.",
    question: '',
    minGrade: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // QUADRATIC EQUATIONS — grades 9-10 (prefix mode)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'wp_quad_area',
    operations: ['quadratic_equations'],
    mode: 'prefix',
    template:
      '{name} is designing a rectangular garden where one side is {a} meters longer than the other.',
    question: '',
    minGrade: 9,
  },
  {
    id: 'wp_quad_projectile',
    operations: ['quadratic_equations'],
    mode: 'prefix',
    template:
      '{name} launches a ball into the air from the roof of a building.',
    question: '',
    minGrade: 10,
  },
  {
    id: 'wp_quad_number',
    operations: ['quadratic_equations'],
    mode: 'prefix',
    template:
      '{name} is thinking of two numbers whose product and sum have a special relationship.',
    question: '',
    minGrade: 9,
  },
];
