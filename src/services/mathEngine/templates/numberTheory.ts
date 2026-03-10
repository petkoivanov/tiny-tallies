import type { ProblemTemplate } from '../types';

export const NUMBER_THEORY_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'nt_gcf',
    operation: 'number_theory',
    skillId: 'number-theory.gcf',
    standards: ['6.NS.B.4'],
    grades: [6],
    baseElo: 1050,
    digitCount: 2,
    domainConfig: { type: 'gcf' },
  },
  {
    id: 'nt_lcm',
    operation: 'number_theory',
    skillId: 'number-theory.lcm',
    standards: ['6.NS.B.4'],
    grades: [6],
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { type: 'lcm' },
  },
  {
    id: 'nt_absolute_value',
    operation: 'number_theory',
    skillId: 'number-theory.absolute-value',
    standards: ['6.NS.C.7c'],
    grades: [6],
    baseElo: 900,
    digitCount: 2,
    domainConfig: { type: 'absolute_value' },
  },
];
