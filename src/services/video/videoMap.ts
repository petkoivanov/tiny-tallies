import type { MathDomain } from '@/services/mathEngine/types';

/**
 * Curated educational video IDs per math domain.
 * IDs sourced from YouTube — verify before each release.
 * undefined means no video available for that domain yet.
 * Per STATE.md decision: module constant only, NOT a Zustand store slice.
 * Update via OTA release, not store migration.
 *
 * Last verified: 2026-03-15
 */
export const videoMap: Partial<Record<MathDomain, string>> = {
  addition:       'AuX7nPBqDts',   // Khan Academy: Basic addition
  subtraction:    'AO9bHbUdg-M',   // Khan Academy: Introduction to subtraction
  multiplication: 'xO_1bYgoQvA',   // Khan Academy: Multiplication tables
  division:       'e_tY6X5PwWw',   // Khan Academy: Division intro
  fractions:      'jgWqSjgMAtw',   // Khan Academy: Fraction Basics
  place_value:    'wx2gI8iwMCA',   // Khan Academy: Introduction to Place Value
  time:           'NjJFJ7ge_qk',   // Khan Academy: Telling time
  money:          'pnXJGNo08v0',   // Jack Hartmann: The Money Song
  patterns:       'skDNVst7Glw',   // Khan Academy: Math patterns
  measurement:    '_irJM-um6HE',   // Khan Academy: Measuring Lengths
  ratios:         'bIKmw0aTmYc',   // Khan Academy: Intro to Ratios
  exponents:      'XZRQhkii0h0',   // Khan Academy: Introduction to Exponents
  expressions:    'tHYis-DP0oU',   // Khan Academy: What is a variable?
  geometry:       '10dTx1Zy_4w',   // Khan Academy: Recognizing Shapes
  probability:    'KzfWUEJjG18',   // Khan Academy: Basic probability
  number_theory:  '5xe-6GPR_qQ',   // Khan Academy: Finding Factors and Multiples
  basic_graphs:   'OmLl6pkvV-I',   // Khan Academy: Reading bar graph examples
  data_analysis:  'w49ddHSDGUA',   // Khan Academy: Picture graphs
  // HS domains (phases 82-90):
  linear_equations:    'bAerID24QJ0',  // Khan Academy: Linear equations 1
  coordinate_geometry: 'N4nrdf0yYfM',  // Khan Academy: Introduction to the coordinate plane
  sequences_series: '_cooC3yG_p0',  // Khan Academy: Arithmetic sequences
  statistics_hs: 'h8EYEJ32oQ8',  // Khan Academy: Statistics HS
  systems_equations: 'nok99JOhcjo',  // Khan Academy: Systems of equations
  quadratic_equations: 'IWigvJcCAJ0',  // Khan Academy: Quadratic equations
  polynomials: 'Vm7H0VTlIco',  // Khan Academy: Polynomials
  exponential_functions: '6WMZ7J0wwMI',  // Khan Academy: Exponential functions
  logarithms: 'Z5myJ8dg_rM',  // Khan Academy: Logarithms
};
