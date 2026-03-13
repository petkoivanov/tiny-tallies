import type { MathDomain } from '@/services/mathEngine/types';

/**
 * Curated Khan Academy video IDs per math domain.
 * IDs sourced from youtube.com/@khanacademy — verify before each release.
 * undefined means no video available for that domain yet.
 * Per STATE.md decision: module constant only, NOT a Zustand store slice.
 * Update via OTA release, not store migration.
 *
 * VIDEO-04 scope: covers all 18 existing MathDomain values.
 * 9 HS domains (linear_equations, coordinate_geometry, sequences_series,
 * statistics_hs, systems_equations, quadratic_equations, polynomials,
 * exponential_functions, logarithms) will be added when phases 82-90 land.
 */
export const videoMap: Partial<Record<MathDomain, string>> = {
  addition:       'AuX7nPBqDts',   // Khan Academy: Basic addition
  subtraction:    'Lxg0hUZrSP8',   // Khan Academy: Basic subtraction
  multiplication: 'E9wIPIIFSGU',   // Khan Academy: Multiplication intro
  division:       'e_tY6X5PwWw',   // Khan Academy: Division intro
  fractions:      'g6eSBX8OgvM',   // Khan Academy: Intro to fractions
  place_value:    'YlmwDkpEoB8',   // Khan Academy: Place value
  time:           '5q0o2BKYVEY',   // Khan Academy: Telling time
  money:          'W3Z4vNPiHmU',   // Khan Academy: Counting money
  patterns:       'F5rinCKMpH4',   // Khan Academy: Patterns
  measurement:    'H9yBbpOFJF0',   // Khan Academy: Measurement
  ratios:         'HpdMJaOgDgk',   // Khan Academy: Intro to ratios
  exponents:      'XZRQhkXEiF4',   // Khan Academy: Exponents
  expressions:    'y7QLzdXB0DY',   // Khan Academy: Algebraic expressions
  geometry:       'MFwd6LBD8dI',   // Khan Academy: Basic geometry
  probability:    'KzfWUEJjG18',   // Khan Academy: Basic probability
  number_theory:  'ZTErpEEd3ok',   // Khan Academy: Factors and multiples
  basic_graphs:   'SjsA7Hldvtk',   // Khan Academy: Reading bar graphs
  data_analysis:  'hz5fDTrMqTg',   // Khan Academy: Data and statistics
  // HS domains populated when phases 82-90 land:
  // linear_equations, coordinate_geometry, sequences_series,
  // statistics_hs, systems_equations, quadratic_equations,
  // polynomials, exponential_functions, logarithms
};
