import type { SkillDefinition } from '../types';

/** Decimal arithmetic skills — grades 5-6, extending existing operations */
export const DECIMAL_SKILLS: readonly SkillDefinition[] = [
  // Grade 5: Decimal addition
  {
    id: 'addition.decimal-tenths',
    name: 'Add decimals (tenths)',
    operation: 'addition',
    grade: 5,
    standards: ['5.NBT.B.7'],
    prerequisites: ['addition.four-digit.with-carry', 'place-value.decimal-identify'],
  },
  {
    id: 'addition.decimal-hundredths',
    name: 'Add decimals (hundredths)',
    operation: 'addition',
    grade: 5,
    standards: ['5.NBT.B.7'],
    prerequisites: ['addition.decimal-tenths'],
  },
  // Grade 5: Decimal subtraction
  {
    id: 'subtraction.decimal-tenths',
    name: 'Subtract decimals (tenths)',
    operation: 'subtraction',
    grade: 5,
    standards: ['5.NBT.B.7'],
    prerequisites: ['subtraction.four-digit.with-borrow', 'place-value.decimal-identify'],
  },
  {
    id: 'subtraction.decimal-hundredths',
    name: 'Subtract decimals (hundredths)',
    operation: 'subtraction',
    grade: 5,
    standards: ['5.NBT.B.7'],
    prerequisites: ['subtraction.decimal-tenths'],
  },
  // Grade 5-6: Decimal multiplication
  {
    id: 'multiplication.decimal-by-whole',
    name: 'Multiply decimal by whole number',
    operation: 'multiplication',
    grade: 5,
    standards: ['5.NBT.B.7'],
    prerequisites: ['multiplication.two-by-one', 'place-value.decimal-identify'],
  },
  {
    id: 'multiplication.decimal-by-decimal',
    name: 'Multiply decimal by decimal',
    operation: 'multiplication',
    grade: 6,
    standards: ['6.NS.B.3'],
    prerequisites: ['multiplication.decimal-by-whole'],
  },
  // Grade 5-6: Decimal division
  {
    id: 'division.decimal-by-whole',
    name: 'Divide decimal by whole number',
    operation: 'division',
    grade: 5,
    standards: ['5.NBT.B.7'],
    prerequisites: ['division.three-by-one', 'place-value.decimal-identify'],
  },
  {
    id: 'division.whole-by-decimal',
    name: 'Divide whole number by decimal',
    operation: 'division',
    grade: 6,
    standards: ['6.NS.B.3'],
    prerequisites: ['division.decimal-by-whole'],
  },
];
