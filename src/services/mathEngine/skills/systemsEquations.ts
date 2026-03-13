import type { SkillDefinition } from '../types';

export const SYSTEMS_EQUATIONS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'substitution_simple',
    name: 'Substitution \u2014 Variable Already Isolated',
    operation: 'systems_equations',
    grade: 9,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['one_step_addition'],
  },
  {
    id: 'substitution_general',
    name: 'Substitution \u2014 Isolate Then Substitute',
    operation: 'systems_equations',
    grade: 9,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['substitution_simple'],
  },
  {
    id: 'elimination_add',
    name: 'Elimination \u2014 Direct Addition',
    operation: 'systems_equations',
    grade: 9,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['substitution_simple'],
  },
  {
    id: 'elimination_multiply',
    name: 'Elimination \u2014 Multiply to Align',
    operation: 'systems_equations',
    grade: 10,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['elimination_add'],
  },
  {
    id: 'sys_word_problem',
    name: 'Systems of Equations Word Problems',
    operation: 'systems_equations',
    grade: 10,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['substitution_general'],
  },
] as const;
