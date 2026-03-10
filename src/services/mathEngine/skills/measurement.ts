import type { SkillDefinition } from '../types';

export const MEASUREMENT_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'measurement.convert-down',
    name: 'Convert larger to smaller units',
    operation: 'measurement',
    grade: 4,
    standards: ['4.MD.A.1'],
    prerequisites: ['multiplication.facts-2-5-10'],
  },
  {
    id: 'measurement.convert-up',
    name: 'Convert smaller to larger units',
    operation: 'measurement',
    grade: 4,
    standards: ['4.MD.A.1'],
    prerequisites: ['division.facts-within-100'],
  },
  {
    id: 'measurement.compare',
    name: 'Compare measurements in different units',
    operation: 'measurement',
    grade: 4,
    standards: ['4.MD.A.2'],
    prerequisites: ['measurement.convert-down'],
  },
  {
    id: 'measurement.metric',
    name: 'Metric unit conversions',
    operation: 'measurement',
    grade: 5,
    standards: ['5.MD.A.1'],
    prerequisites: ['measurement.convert-down', 'place-value.to-10000'],
  },
  {
    id: 'measurement.multi-step',
    name: 'Multi-step measurement problems',
    operation: 'measurement',
    grade: 5,
    standards: ['5.MD.A.1'],
    prerequisites: ['measurement.metric'],
  },
];
