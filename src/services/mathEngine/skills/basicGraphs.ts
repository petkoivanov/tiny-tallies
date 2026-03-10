import type { SkillDefinition } from '../types';

export const BASIC_GRAPHS_SKILLS: readonly SkillDefinition[] = [
  // ─── Picture Graphs (Grade 1-2) ──────────────────────────────────────────
  {
    id: 'basic-graphs.picture-read',
    name: 'Read picture graphs',
    operation: 'basic_graphs',
    grade: 1,
    standards: ['1.MD.C.4'],
    prerequisites: [],
  },
  {
    id: 'basic-graphs.picture-compare',
    name: 'Compare picture graph categories',
    operation: 'basic_graphs',
    grade: 2,
    standards: ['2.MD.D.10'],
    prerequisites: ['basic-graphs.picture-read'],
  },
  {
    id: 'basic-graphs.picture-scaled',
    name: 'Scaled picture graphs',
    operation: 'basic_graphs',
    grade: 3,
    standards: ['3.MD.B.3'],
    prerequisites: ['basic-graphs.picture-compare'],
  },

  // ─── Tally Charts (Grade 1-2) ────────────────────────────────────────────
  {
    id: 'basic-graphs.tally-read',
    name: 'Read tally charts',
    operation: 'basic_graphs',
    grade: 1,
    standards: ['1.MD.C.4'],
    prerequisites: [],
  },
  {
    id: 'basic-graphs.tally-compare',
    name: 'Compare tally chart categories',
    operation: 'basic_graphs',
    grade: 2,
    standards: ['2.MD.D.10'],
    prerequisites: ['basic-graphs.tally-read'],
  },

  // ─── Bar Graphs (Grade 2-4) ──────────────────────────────────────────────
  {
    id: 'basic-graphs.bar-read',
    name: 'Read bar graphs',
    operation: 'basic_graphs',
    grade: 2,
    standards: ['2.MD.D.10'],
    prerequisites: ['basic-graphs.picture-read'],
  },
  {
    id: 'basic-graphs.bar-compare',
    name: 'Compare bar graph categories',
    operation: 'basic_graphs',
    grade: 3,
    standards: ['3.MD.B.3'],
    prerequisites: ['basic-graphs.bar-read'],
  },
  {
    id: 'basic-graphs.bar-solve',
    name: 'Solve problems using bar graphs',
    operation: 'basic_graphs',
    grade: 4,
    standards: ['3.MD.B.3', '4.MD.B.4'],
    prerequisites: ['basic-graphs.bar-compare'],
  },
];
