import type { SkillDefinition } from '../types';

export const LOGARITHMS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'log10_eval',
    name: 'Evaluate Log Base 10',
    operation: 'logarithms',
    grade: 10,
    standards: ['HSF-BF.B.5'],
    prerequisites: ['exp_evaluate'],
  },
  {
    id: 'log2_eval',
    name: 'Evaluate Log Base 2',
    operation: 'logarithms',
    grade: 10,
    standards: ['HSF-BF.B.5'],
    prerequisites: ['log10_eval'],
  },
  {
    id: 'ln_eval',
    name: 'Evaluate Natural Log',
    operation: 'logarithms',
    grade: 11,
    standards: ['HSF-BF.B.5'],
    prerequisites: ['log2_eval'],
  },
  {
    id: 'log_word_problem',
    name: 'Logarithm Word Problems',
    operation: 'logarithms',
    grade: 10,
    standards: ['HSF-BF.B.5'],
    prerequisites: ['log10_eval'],
  },
] as const;
