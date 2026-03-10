import type { ProblemTemplate } from '../types';

export const PROBABILITY_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'prob_basic',
    operation: 'probability',
    skillId: 'probability.basic',
    standards: ['7.SP.C.5'],
    grades: [7],
    baseElo: 1050,
    digitCount: 2,
    domainConfig: { type: 'basic' },
  },
  {
    id: 'prob_complement',
    operation: 'probability',
    skillId: 'probability.complement',
    standards: ['7.SP.C.5'],
    grades: [7],
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { type: 'complement' },
  },
];
