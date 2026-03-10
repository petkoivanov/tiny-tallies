import type { ProblemTemplate } from '../types';

/** Decimal arithmetic templates — use domainConfig.decimal to trigger decimal path */
export const DECIMAL_TEMPLATES: readonly ProblemTemplate[] = [
  // Addition
  {
    id: 'add_decimal_tenths',
    operation: 'addition',
    skillId: 'addition.decimal-tenths',
    standards: ['5.NBT.B.7'],
    grades: [5],
    operandRanges: [
      { min: 1.0, max: 99.9 },
      { min: 1.0, max: 99.9 },
    ],
    resultRange: { min: 2.0, max: 199.8 },
    baseElo: 1050,
    digitCount: 2,
    domainConfig: { decimal: true, places: 1 },
  },
  {
    id: 'add_decimal_hundredths',
    operation: 'addition',
    skillId: 'addition.decimal-hundredths',
    standards: ['5.NBT.B.7'],
    grades: [5],
    operandRanges: [
      { min: 1.0, max: 50.0 },
      { min: 1.0, max: 50.0 },
    ],
    resultRange: { min: 2.0, max: 100.0 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { decimal: true, places: 2 },
  },
  // Subtraction
  {
    id: 'sub_decimal_tenths',
    operation: 'subtraction',
    skillId: 'subtraction.decimal-tenths',
    standards: ['5.NBT.B.7'],
    grades: [5],
    operandRanges: [
      { min: 5.0, max: 99.9 },
      { min: 1.0, max: 50.0 },
    ],
    resultRange: { min: 0.1, max: 98.9 },
    baseElo: 1050,
    digitCount: 2,
    domainConfig: { decimal: true, places: 1 },
  },
  {
    id: 'sub_decimal_hundredths',
    operation: 'subtraction',
    skillId: 'subtraction.decimal-hundredths',
    standards: ['5.NBT.B.7'],
    grades: [5],
    operandRanges: [
      { min: 5.0, max: 50.0 },
      { min: 1.0, max: 25.0 },
    ],
    resultRange: { min: 0.01, max: 49.0 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { decimal: true, places: 2 },
  },
  // Multiplication
  {
    id: 'mul_decimal_by_whole',
    operation: 'multiplication',
    skillId: 'multiplication.decimal-by-whole',
    standards: ['5.NBT.B.7'],
    grades: [5],
    operandRanges: [
      { min: 1.0, max: 20.0 },
      { min: 2, max: 9 },
    ],
    resultRange: { min: 2.0, max: 180.0 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { decimal: true, places: 1 },
  },
  {
    id: 'mul_decimal_by_decimal',
    operation: 'multiplication',
    skillId: 'multiplication.decimal-by-decimal',
    standards: ['6.NS.B.3'],
    grades: [6],
    operandRanges: [
      { min: 1.0, max: 10.0 },
      { min: 1.0, max: 10.0 },
    ],
    resultRange: { min: 1.0, max: 100.0 },
    baseElo: 1200,
    digitCount: 2,
    domainConfig: { decimal: true, places: 1 },
  },
  // Division
  {
    id: 'div_decimal_by_whole',
    operation: 'division',
    skillId: 'division.decimal-by-whole',
    standards: ['5.NBT.B.7'],
    grades: [5],
    operandRanges: [
      { min: 2.0, max: 50.0 },
      { min: 2, max: 9 },
    ],
    resultRange: { min: 0.5, max: 25.0 },
    baseElo: 1100,
    digitCount: 2,
    domainConfig: { decimal: true, places: 1 },
  },
  {
    id: 'div_whole_by_decimal',
    operation: 'division',
    skillId: 'division.whole-by-decimal',
    standards: ['6.NS.B.3'],
    grades: [6],
    operandRanges: [
      { min: 2, max: 50 },
      { min: 0.5, max: 5.0 },
    ],
    resultRange: { min: 1.0, max: 100.0 },
    baseElo: 1200,
    digitCount: 2,
    domainConfig: { decimal: true, places: 1 },
  },
];
