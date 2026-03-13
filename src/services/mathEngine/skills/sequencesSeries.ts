import type { SkillDefinition } from '../types';

export const SEQUENCES_SERIES_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'arithmetic_next_term',
    name: 'Next Term of an Arithmetic Sequence',
    operation: 'sequences_series',
    grade: 9,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['multi_step'],
  },
  {
    id: 'arithmetic_nth_term',
    name: 'Nth Term of an Arithmetic Sequence',
    operation: 'sequences_series',
    grade: 9,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['arithmetic_next_term'],
  },
  {
    id: 'geometric_next_term',
    name: 'Next Term of a Geometric Sequence',
    operation: 'sequences_series',
    grade: 10,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['arithmetic_nth_term'],
  },
  {
    id: 'geometric_nth_term',
    name: 'Nth Term of a Geometric Sequence',
    operation: 'sequences_series',
    grade: 10,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['geometric_next_term'],
  },
  {
    id: 'seq_word_problem',
    name: 'Sequences Word Problems',
    operation: 'sequences_series',
    grade: 10,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['arithmetic_nth_term'],
  },
] as const;
