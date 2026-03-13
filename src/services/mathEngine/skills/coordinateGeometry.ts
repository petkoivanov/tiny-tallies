import type { SkillDefinition } from '../types';

export const COORDINATE_GEOMETRY_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'slope',
    name: 'Slope of a Line',
    operation: 'coordinate_geometry',
    grade: 8,
    standards: ['8.EE.B.5'],
    prerequisites: ['two_step_mixed'],
  },
  {
    id: 'distance',
    name: 'Distance Between Two Points',
    operation: 'coordinate_geometry',
    grade: 8,
    standards: ['8.G.B.8'],
    prerequisites: ['slope'],
  },
  {
    id: 'midpoint',
    name: 'Midpoint of a Segment',
    operation: 'coordinate_geometry',
    grade: 8,
    standards: ['8.G.B.8'],
    prerequisites: ['slope'],
  },
  {
    id: 'line_equation_yintercept',
    name: 'Y-Intercept from Line Equation',
    operation: 'coordinate_geometry',
    grade: 9,
    standards: ['8.EE.B.6'],
    prerequisites: ['slope'],
  },
  {
    id: 'line_equation_slope',
    name: 'Slope from Line Equation',
    operation: 'coordinate_geometry',
    grade: 9,
    standards: ['8.EE.B.6'],
    prerequisites: ['line_equation_yintercept'],
  },
  {
    id: 'coord_word_problem',
    name: 'Coordinate Geometry Word Problems',
    operation: 'coordinate_geometry',
    grade: 10,
    standards: ['8.EE.B.5', '8.G.B.8'],
    prerequisites: ['line_equation_slope'],
  },
] as const;
