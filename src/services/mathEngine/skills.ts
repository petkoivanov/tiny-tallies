import type { Grade, Operation, SkillDefinition } from './types';

export const SKILLS: readonly SkillDefinition[] = [
  // Addition skills
  {
    id: 'addition.single-digit.no-carry',
    name: 'Add within 10',
    operation: 'addition',
    grade: 1,
    standards: ['1.OA.C.6'],
    prerequisites: [],
  },
  {
    id: 'addition.within-20.no-carry',
    name: 'Add within 20 (no carry)',
    operation: 'addition',
    grade: 1,
    standards: ['1.OA.C.6'],
    prerequisites: ['addition.single-digit.no-carry'],
  },
  {
    id: 'addition.within-20.with-carry',
    name: 'Add within 20 (with carry)',
    operation: 'addition',
    grade: 1,
    standards: ['1.OA.C.6'],
    prerequisites: ['addition.within-20.no-carry'],
  },
  {
    id: 'addition.two-digit.no-carry',
    name: 'Add two-digit (no carry)',
    operation: 'addition',
    grade: 2,
    standards: ['2.NBT.B.5'],
    prerequisites: ['addition.within-20.with-carry'],
  },
  {
    id: 'addition.two-digit.with-carry',
    name: 'Add two-digit (with carry)',
    operation: 'addition',
    grade: 2,
    standards: ['2.NBT.B.5'],
    prerequisites: ['addition.two-digit.no-carry'],
  },
  {
    id: 'addition.three-digit.no-carry',
    name: 'Add three-digit (no carry)',
    operation: 'addition',
    grade: 3,
    standards: ['3.NBT.A.2'],
    prerequisites: ['addition.two-digit.with-carry'],
  },
  {
    id: 'addition.three-digit.with-carry',
    name: 'Add three-digit (with carry)',
    operation: 'addition',
    grade: 3,
    standards: ['3.NBT.A.2'],
    prerequisites: ['addition.three-digit.no-carry'],
  },

  // Subtraction skills
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
    prerequisites: ['subtraction.single-digit.no-borrow'],
  },
  {
    id: 'subtraction.within-20.with-borrow',
    name: 'Subtract within 20 (with borrow)',
    operation: 'subtraction',
    grade: 1,
    standards: ['1.OA.C.6'],
    prerequisites: ['subtraction.within-20.no-borrow'],
  },
  {
    id: 'subtraction.two-digit.no-borrow',
    name: 'Subtract two-digit (no borrow)',
    operation: 'subtraction',
    grade: 2,
    standards: ['2.NBT.B.5'],
    prerequisites: ['subtraction.within-20.with-borrow'],
  },
  {
    id: 'subtraction.two-digit.with-borrow',
    name: 'Subtract two-digit (with borrow)',
    operation: 'subtraction',
    grade: 2,
    standards: ['2.NBT.B.5'],
    prerequisites: ['subtraction.two-digit.no-borrow'],
  },
  {
    id: 'subtraction.three-digit.no-borrow',
    name: 'Subtract three-digit (no borrow)',
    operation: 'subtraction',
    grade: 3,
    standards: ['3.NBT.A.2'],
    prerequisites: ['subtraction.two-digit.with-borrow'],
  },
  {
    id: 'subtraction.three-digit.with-borrow',
    name: 'Subtract three-digit (with borrow)',
    operation: 'subtraction',
    grade: 3,
    standards: ['3.NBT.A.2'],
    prerequisites: ['subtraction.three-digit.no-borrow'],
  },
];

export function getSkillById(id: string): SkillDefinition | undefined {
  return SKILLS.find((skill) => skill.id === id);
}

export function getSkillsByOperation(
  operation: Operation,
): SkillDefinition[] {
  return SKILLS.filter((skill) => skill.operation === operation);
}

export function getSkillsByGrade(grade: Grade): SkillDefinition[] {
  return SKILLS.filter((skill) => skill.grade === grade);
}
