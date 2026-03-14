import type { MathDomain } from '@/services/mathEngine/types';

export interface DomainMeta {
  domain: MathDomain;
  displayName: string;
  emoji: string;
}

export interface DomainCategory {
  title: string;
  emoji: string;
  domains: DomainMeta[];
}

const d = (domain: MathDomain, displayName: string, emoji: string): DomainMeta => ({
  domain,
  displayName,
  emoji,
});

export const DOMAIN_CATEGORIES: DomainCategory[] = [
  {
    title: 'Number Sense',
    emoji: '\uD83E\uDDE0',
    domains: [
      d('addition', 'Addition', '+'),
      d('subtraction', 'Subtraction', '\u2212'),
      d('multiplication', 'Multiplication', '\u00D7'),
      d('division', 'Division', '\u00F7'),
      d('fractions', 'Fractions', '\uD83C\uDF55'),
      d('place_value', 'Place Value', '\uD83D\uDD22'),
    ],
  },
  {
    title: 'Measurement & Data',
    emoji: '\uD83D\uDCCA',
    domains: [
      d('time', 'Time', '\u23F0'),
      d('money', 'Money', '\uD83D\uDCB0'),
      d('measurement', 'Measurement', '\uD83D\uDCCF'),
      d('patterns', 'Patterns', '\uD83D\uDD01'),
      d('basic_graphs', 'Basic Graphs', '\uD83D\uDCCA'),
      d('data_analysis', 'Data Analysis', '\uD83D\uDCC8'),
    ],
  },
  {
    title: 'Pre-Algebra',
    emoji: '\uD83E\uDDEA',
    domains: [
      d('ratios', 'Ratios', '\u2696\uFE0F'),
      d('exponents', 'Exponents', '\uD83D\uDE80'),
      d('expressions', 'Expressions', '\uD83E\uDDEE'),
      d('number_theory', 'Number Theory', '\uD83D\uDD0D'),
      d('geometry', 'Geometry', '\uD83D\uDCD0'),
      d('probability', 'Probability', '\uD83C\uDFB2'),
    ],
  },
  {
    title: 'Algebra & Beyond',
    emoji: '\uD83C\uDF1F',
    domains: [
      d('linear_equations', 'Linear Equations', '\u26A1'),
      d('coordinate_geometry', 'Coordinate Geometry', '\uD83D\uDDFA\uFE0F'),
      d('systems_equations', 'Systems of Equations', '\uD83E\uDDE9'),
      d('quadratic_equations', 'Quadratics', '\uD83C\uDFD4\uFE0F'),
      d('polynomials', 'Polynomials', '\uD83C\uDF0A'),
      d('sequences_series', 'Sequences', '\uD83D\uDD17'),
      d('exponential_functions', 'Exponentials', '\uD83D\uDCC8'),
      d('logarithms', 'Logarithms', '\uD83D\uDD2C'),
      d('statistics_hs', 'Statistics', '\uD83D\uDCC9'),
    ],
  },
];

/** Flat lookup: domain → meta. */
export const DOMAIN_META: Record<string, DomainMeta> = {};
for (const cat of DOMAIN_CATEGORIES) {
  for (const meta of cat.domains) {
    DOMAIN_META[meta.domain] = meta;
  }
}
