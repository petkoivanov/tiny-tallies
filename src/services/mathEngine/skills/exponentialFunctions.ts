import type { SkillDefinition } from '../types';

export const EXPONENTIAL_FUNCTIONS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'exp_evaluate',
    name: 'Evaluate Exponential Expression',
    operation: 'exponential_functions',
    grade: 9,
    standards: ['HSF-LE.A.1'],
    prerequisites: ['exponents.evaluate'],
  },
  {
    id: 'growth_factor',
    name: 'Growth Factor Problems',
    operation: 'exponential_functions',
    grade: 10,
    standards: ['HSF-LE.A.1'],
    prerequisites: ['exp_evaluate'],
  },
  {
    id: 'decay_factor',
    name: 'Decay Factor / Half-Life',
    operation: 'exponential_functions',
    grade: 10,
    standards: ['HSF-LE.A.1'],
    prerequisites: ['growth_factor'],
  },
  {
    id: 'doubling_time',
    name: 'Doubling-Time Scenarios',
    operation: 'exponential_functions',
    grade: 11,
    standards: ['HSF-LE.A.1'],
    prerequisites: ['growth_factor'],
  },
  {
    id: 'exp_word_problem',
    name: 'Exponential Word Problems',
    operation: 'exponential_functions',
    grade: 10,
    standards: ['HSF-LE.A.1'],
    prerequisites: ['growth_factor'],
  },
] as const;
