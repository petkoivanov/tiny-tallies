import type { SkillDefinition } from '../types';

/** Integer (negative number) arithmetic skills — grades 6-7 */
export const INTEGER_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'addition.integers',
    name: 'Add integers',
    operation: 'addition',
    grade: 6,
    standards: ['6.NS.C.5'],
    prerequisites: ['addition.four-digit.with-carry'],
  },
  {
    id: 'subtraction.integers',
    name: 'Subtract integers',
    operation: 'subtraction',
    grade: 6,
    standards: ['6.NS.C.5'],
    prerequisites: ['subtraction.four-digit.with-borrow', 'addition.integers'],
  },
  {
    id: 'multiplication.integers',
    name: 'Multiply integers',
    operation: 'multiplication',
    grade: 7,
    standards: ['7.NS.A.2'],
    prerequisites: ['multiplication.two-by-one', 'subtraction.integers'],
  },
  {
    id: 'division.integers',
    name: 'Divide integers',
    operation: 'division',
    grade: 7,
    standards: ['7.NS.A.2'],
    prerequisites: ['division.three-by-one', 'multiplication.integers'],
  },
];
