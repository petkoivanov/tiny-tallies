import type { SkillDefinition } from '../types';

export const QUADRATIC_EQUATIONS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'factoring_monic',
    name: 'Factoring Monic Quadratics',
    operation: 'quadratic_equations',
    grade: 9,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['multi_step'],
  },
  {
    id: 'factoring_leading_coeff',
    name: 'Factoring with Leading Coefficient',
    operation: 'quadratic_equations',
    grade: 9,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_monic'],
  },
  {
    id: 'quadratic_formula_simple',
    name: 'Quadratic Formula \u2014 Simple',
    operation: 'quadratic_equations',
    grade: 9,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_monic'],
  },
  {
    id: 'quadratic_formula_rational',
    name: 'Quadratic Formula \u2014 Rational Roots',
    operation: 'quadratic_equations',
    grade: 10,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['quadratic_formula_simple'],
  },
  {
    id: 'completing_the_square',
    name: 'Completing the Square',
    operation: 'quadratic_equations',
    grade: 10,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_monic'],
  },
  {
    id: 'quad_word_problem',
    name: 'Quadratic Equation Word Problems',
    operation: 'quadratic_equations',
    grade: 10,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_leading_coeff'],
  },
] as const;
