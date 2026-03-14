import type { SkillDefinition } from '../types';

export const POLYNOMIALS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'foil_expansion',
    name: 'FOIL Expansion',
    operation: 'polynomials',
    grade: 9,
    standards: ['HSA-APR.A.1'],
    prerequisites: ['multi_step'],
  },
  {
    id: 'poly_evaluation',
    name: 'Polynomial Evaluation',
    operation: 'polynomials',
    grade: 9,
    standards: ['HSA-APR.A.1'],
    prerequisites: ['foil_expansion'],
  },
  {
    id: 'gcf_factoring',
    name: 'GCF Factoring',
    operation: 'polynomials',
    grade: 9,
    standards: ['HSA-SSE.A.2'],
    prerequisites: ['poly_evaluation'],
  },
  {
    id: 'diff_of_squares',
    name: 'Difference of Squares',
    operation: 'polynomials',
    grade: 10,
    standards: ['HSA-SSE.A.2'],
    prerequisites: ['gcf_factoring'],
  },
  {
    id: 'combined_operations',
    name: 'Combined Polynomial Operations',
    operation: 'polynomials',
    grade: 10,
    standards: ['HSA-APR.A.1'],
    prerequisites: ['diff_of_squares'],
  },
  {
    id: 'poly_word_problem',
    name: 'Polynomial Word Problems',
    operation: 'polynomials',
    grade: 10,
    standards: ['HSA-SSE.A.2'],
    prerequisites: ['combined_operations'],
  },
] as const;
