import type { ProblemTemplate } from '../types';

/** Integer (negative number) arithmetic templates */
export const INTEGER_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'add_integers',
    operation: 'addition',
    skillId: 'addition.integers',
    standards: ['6.NS.C.5'],
    grades: [6],
    operandRanges: [
      { min: -20, max: 20 },
      { min: -20, max: 20 },
    ],
    resultRange: { min: -40, max: 40 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { allowNegative: true },
  },
  {
    id: 'sub_integers',
    operation: 'subtraction',
    skillId: 'subtraction.integers',
    standards: ['6.NS.C.5'],
    grades: [6],
    operandRanges: [
      { min: -20, max: 20 },
      { min: -20, max: 20 },
    ],
    resultRange: { min: -40, max: 40 },
    baseElo: 1150,
    digitCount: 2,
    domainConfig: { allowNegative: true },
  },
  {
    id: 'mul_integers',
    operation: 'multiplication',
    skillId: 'multiplication.integers',
    standards: ['7.NS.A.2'],
    grades: [7],
    operandRanges: [
      { min: -10, max: 10 },
      { min: -10, max: 10 },
    ],
    resultRange: { min: -100, max: 100 },
    baseElo: 1200,
    digitCount: 2,
    domainConfig: { allowNegative: true },
  },
  {
    id: 'div_integers',
    operation: 'division',
    skillId: 'division.integers',
    standards: ['7.NS.A.2'],
    grades: [7],
    operandRanges: [
      { min: -50, max: 50 },
      { min: -10, max: -1 },
    ],
    resultRange: { min: -50, max: 50 },
    baseElo: 1250,
    digitCount: 2,
    domainConfig: { allowNegative: true },
  },
];
