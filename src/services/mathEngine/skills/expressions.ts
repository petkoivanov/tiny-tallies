import type { SkillDefinition } from '../types';

export const EXPRESSIONS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'expressions.two-ops',
    name: 'Order of operations (two operations)',
    operation: 'expressions',
    grade: 5,
    standards: ['5.OA.A.1'],
    prerequisites: ['multiplication.facts-7-8-9', 'addition.three-digit.no-carry'],
  },
  {
    id: 'expressions.parentheses',
    name: 'Parentheses in expressions',
    operation: 'expressions',
    grade: 5,
    standards: ['5.OA.A.1'],
    prerequisites: ['expressions.two-ops'],
  },
  {
    id: 'expressions.with-division',
    name: 'Division in expressions',
    operation: 'expressions',
    grade: 5,
    standards: ['5.OA.A.1'],
    prerequisites: ['expressions.two-ops', 'division.facts-within-100'],
  },
  {
    id: 'expressions.three-ops',
    name: 'Three-operation expressions',
    operation: 'expressions',
    grade: 5,
    standards: ['5.OA.A.1'],
    prerequisites: ['expressions.parentheses', 'expressions.with-division'],
  },
  {
    id: 'expressions.nested-parens',
    name: 'Nested parentheses',
    operation: 'expressions',
    grade: 5,
    standards: ['5.OA.A.1'],
    prerequisites: ['expressions.three-ops'],
  },
];
