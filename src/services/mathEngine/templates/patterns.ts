import type { ProblemTemplate } from '../types';

/**
 * Pattern templates. Use addition as underlying computation.
 * Operands represent sequence values.
 */
export const PATTERNS_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'pat_number_patterns',
    operation: 'patterns',
    skillId: 'patterns.number-patterns',
    standards: ['1.OA.D.7'],
    grades: [1],
    operandRanges: [
      { min: 1, max: 10 },
      { min: 1, max: 5 },
    ],
    resultRange: { min: 2, max: 15 },
    baseElo: 800,
    digitCount: 1,
    domainConfig: { type: 'find_next' },
  },
  {
    id: 'pat_skip_counting_patterns',
    operation: 'patterns',
    skillId: 'patterns.skip-counting-patterns',
    standards: ['2.NBT.A.2'],
    grades: [2],
    operandRanges: [
      { min: 2, max: 100 },
      { min: 2, max: 10 },
    ],
    resultRange: { min: 4, max: 200 },
    baseElo: 870,
    digitCount: 2,
    domainConfig: { type: 'skip_count_pattern' },
  },
  {
    id: 'pat_missing_addend',
    operation: 'patterns',
    skillId: 'patterns.missing-addend',
    standards: ['1.OA.D.8'],
    grades: [1],
    operandRanges: [
      { min: 1, max: 20 },
      { min: 1, max: 10 },
    ],
    resultRange: { min: 2, max: 20 },
    baseElo: 920,
    digitCount: 1,
    domainConfig: { type: 'missing_addend' },
  },
  {
    id: 'pat_missing_factor',
    operation: 'patterns',
    skillId: 'patterns.missing-factor',
    standards: ['3.OA.A.4'],
    grades: [3],
    operandRanges: [
      { min: 2, max: 9 },
      { min: 2, max: 9 },
    ],
    resultRange: { min: 4, max: 81 },
    baseElo: 1000,
    digitCount: 1,
    domainConfig: { type: 'missing_factor' },
  },
  {
    id: 'pat_input_output',
    operation: 'patterns',
    skillId: 'patterns.input-output',
    standards: ['4.OA.C.5'],
    grades: [4],
    operandRanges: [
      { min: 1, max: 20 },
      { min: 1, max: 10 },
    ],
    resultRange: { min: 2, max: 200 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { type: 'input_output' },
  },
];
