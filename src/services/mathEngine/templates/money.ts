import type { ProblemTemplate } from '../types';

/**
 * Money templates. Use addition as underlying computation.
 * Operands represent cent values for coin counting.
 */
export const MONEY_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'money_coin_id',
    operation: 'money',
    skillId: 'money.coin-id',
    standards: ['1.MD.3'],
    grades: [1],
    operandRanges: [
      { min: 1, max: 100 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 1, max: 100 },
    baseElo: 800,
    digitCount: 1,
    domainConfig: { type: 'identify' },
  },
  {
    id: 'money_count_same_type',
    operation: 'money',
    skillId: 'money.count.same-type',
    standards: ['1.MD.3'],
    grades: [1],
    operandRanges: [
      { min: 5, max: 25 },
      { min: 2, max: 5 },
    ],
    resultRange: { min: 10, max: 125 },
    baseElo: 850,
    digitCount: 2,
    domainConfig: { type: 'count_same' },
  },
  {
    id: 'money_count_mixed',
    operation: 'money',
    skillId: 'money.count.mixed',
    standards: ['2.MD.C.8'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 50 },
      { min: 1, max: 50 },
    ],
    resultRange: { min: 2, max: 100 },
    baseElo: 900,
    digitCount: 2,
    domainConfig: { type: 'count_mixed' },
  },
  {
    id: 'money_notation',
    operation: 'money',
    skillId: 'money.notation',
    standards: ['2.MD.C.8'],
    grades: [2],
    operandRanges: [
      { min: 1, max: 999 },
      { min: 1, max: 1 },
    ],
    resultRange: { min: 1, max: 999 },
    baseElo: 880,
    digitCount: 3,
    domainConfig: { type: 'notation' },
  },
  {
    id: 'money_change_simple',
    operation: 'money',
    skillId: 'money.change.simple',
    standards: ['2.MD.C.8'],
    grades: [2],
    operandRanges: [
      { min: 10, max: 100 },
      { min: 5, max: 50 },
    ],
    resultRange: { min: 5, max: 95 },
    baseElo: 950,
    digitCount: 2,
    domainConfig: { type: 'making_change' },
  },
  {
    id: 'money_multi_step',
    operation: 'money',
    skillId: 'money.multi-step',
    standards: ['3.OA.D.8'],
    grades: [3],
    operandRanges: [
      { min: 10, max: 500 },
      { min: 10, max: 200 },
    ],
    resultRange: { min: 20, max: 700 },
    baseElo: 1050,
    digitCount: 3,
    domainConfig: { type: 'multi_step' },
  },
  {
    id: 'money_unit_price',
    operation: 'money',
    skillId: 'money.unit-price',
    standards: ['4.MD.A.2'],
    grades: [4],
    operandRanges: [
      { min: 10, max: 100 },
      { min: 2, max: 10 },
    ],
    resultRange: { min: 2, max: 50 },
    baseElo: 1150,
    digitCount: 3,
    domainConfig: { type: 'unit_price' },
  },
];
