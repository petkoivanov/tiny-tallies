import type { SkillDefinition } from '../types';

export const SUBTRACTION_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'subtraction.single-digit.no-borrow',
    name: 'Subtract within 10',
    operation: 'subtraction',
    grade: 1,
    standards: ['1.OA.C.6'],
    prerequisites: [],
  },
  {
    id: 'subtraction.within-20.no-borrow',
    name: 'Subtract within 20 (no borrow)',
    operation: 'subtraction',
    grade: 1,
    standards: ['1.OA.C.6'],
    prerequisites: [
      'subtraction.single-digit.no-borrow',
      'addition.within-20.no-carry',
    ],
  },
  {
    id: 'subtraction.within-20.with-borrow',
    name: 'Subtract within 20 (with borrow)',
    operation: 'subtraction',
    grade: 1,
    standards: ['1.OA.C.6'],
    prerequisites: [
      'subtraction.within-20.no-borrow',
      'addition.within-20.with-carry',
    ],
  },
  {
    id: 'subtraction.two-digit.no-borrow',
    name: 'Subtract two-digit (no borrow)',
    operation: 'subtraction',
    grade: 2,
    standards: ['2.NBT.B.5'],
    prerequisites: [
      'subtraction.within-20.with-borrow',
      'addition.two-digit.no-carry',
    ],
  },
  {
    id: 'subtraction.two-digit.with-borrow',
    name: 'Subtract two-digit (with borrow)',
    operation: 'subtraction',
    grade: 2,
    standards: ['2.NBT.B.5'],
    prerequisites: [
      'subtraction.two-digit.no-borrow',
      'addition.two-digit.with-carry',
    ],
  },
  {
    id: 'subtraction.three-digit.no-borrow',
    name: 'Subtract three-digit (no borrow)',
    operation: 'subtraction',
    grade: 3,
    standards: ['3.NBT.A.2'],
    prerequisites: [
      'subtraction.two-digit.with-borrow',
      'addition.three-digit.no-carry',
    ],
  },
  {
    id: 'subtraction.three-digit.with-borrow',
    name: 'Subtract three-digit (with borrow)',
    operation: 'subtraction',
    grade: 3,
    standards: ['3.NBT.A.2'],
    prerequisites: [
      'subtraction.three-digit.no-borrow',
      'addition.three-digit.with-carry',
    ],
  },
  {
    id: 'subtraction.four-digit.with-borrow',
    name: 'Subtract four-digit (with borrow)',
    operation: 'subtraction',
    grade: 4,
    standards: ['4.NBT.B.4'],
    prerequisites: [
      'subtraction.three-digit.with-borrow',
      'addition.four-digit.no-carry',
    ],
  },
];
