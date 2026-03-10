import type { SkillDefinition } from '../types';

export const PROBABILITY_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'probability.basic',
    name: 'Basic probability',
    operation: 'probability',
    grade: 7,
    standards: ['7.SP.C.5'],
    prerequisites: ['fractions.equivalent'],
  },
  {
    id: 'probability.complement',
    name: 'Complement probability',
    operation: 'probability',
    grade: 7,
    standards: ['7.SP.C.5'],
    prerequisites: ['probability.basic'],
  },
];
