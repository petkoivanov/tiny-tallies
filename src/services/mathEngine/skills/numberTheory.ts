import type { SkillDefinition } from '../types';

export const NUMBER_THEORY_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'number-theory.gcf',
    name: 'Greatest common factor',
    operation: 'number_theory',
    grade: 6,
    standards: ['6.NS.B.4'],
    prerequisites: ['division.facts-within-100'],
  },
  {
    id: 'number-theory.lcm',
    name: 'Least common multiple',
    operation: 'number_theory',
    grade: 6,
    standards: ['6.NS.B.4'],
    prerequisites: ['number-theory.gcf'],
  },
  {
    id: 'number-theory.absolute-value',
    name: 'Absolute value',
    operation: 'number_theory',
    grade: 6,
    standards: ['6.NS.C.7c'],
    prerequisites: ['addition.two-digit.no-carry'],
  },
];
