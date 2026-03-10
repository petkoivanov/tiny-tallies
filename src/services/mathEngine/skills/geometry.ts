import type { SkillDefinition } from '../types';

export const GEOMETRY_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'geometry.complementary-angles',
    name: 'Complementary angles',
    operation: 'geometry',
    grade: 7,
    standards: ['7.G.B.5'],
    prerequisites: ['subtraction.three-digit.no-borrow'],
  },
  {
    id: 'geometry.supplementary-angles',
    name: 'Supplementary angles',
    operation: 'geometry',
    grade: 7,
    standards: ['7.G.B.5'],
    prerequisites: ['geometry.complementary-angles'],
  },
  {
    id: 'geometry.circle-area',
    name: 'Circle area',
    operation: 'geometry',
    grade: 7,
    standards: ['7.G.B.4'],
    prerequisites: ['exponents.squares'],
  },
  {
    id: 'geometry.circle-circumference',
    name: 'Circle circumference',
    operation: 'geometry',
    grade: 7,
    standards: ['7.G.B.4'],
    prerequisites: ['multiplication.two-by-one'],
  },
  {
    id: 'geometry.pythagorean',
    name: 'Pythagorean theorem',
    operation: 'geometry',
    grade: 8,
    standards: ['8.G.B.7'],
    prerequisites: ['exponents.square-root'],
  },
  {
    id: 'geometry.slope',
    name: 'Slope from two points',
    operation: 'geometry',
    grade: 8,
    standards: ['8.EE.B.6'],
    prerequisites: ['subtraction.two-digit.with-borrow'],
  },
];
