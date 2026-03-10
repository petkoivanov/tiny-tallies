import type { SkillDefinition } from '../types';

export const PATTERNS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'patterns.number-patterns',
    name: 'Number patterns',
    operation: 'patterns',
    grade: 1,
    standards: ['1.OA.D.7'],
    prerequisites: [],
  },
  {
    id: 'patterns.skip-counting-patterns',
    name: 'Skip counting patterns',
    operation: 'patterns',
    grade: 2,
    standards: ['2.NBT.A.2'],
    prerequisites: [
      'patterns.number-patterns',
      'place-value.skip-counting',
    ],
  },
  {
    id: 'patterns.missing-addend',
    name: 'Missing addend',
    operation: 'patterns',
    grade: 1,
    standards: ['1.OA.D.8'],
    prerequisites: ['addition.within-20.with-carry'],
  },
  {
    id: 'patterns.missing-factor',
    name: 'Missing factor',
    operation: 'patterns',
    grade: 3,
    standards: ['3.OA.A.4'],
    prerequisites: [
      'multiplication.facts-2-5-10',
      'division.facts-within-100',
    ],
  },
  {
    id: 'patterns.input-output',
    name: 'Input/output tables',
    operation: 'patterns',
    grade: 4,
    standards: ['4.OA.C.5'],
    prerequisites: ['patterns.missing-factor'],
  },
];
