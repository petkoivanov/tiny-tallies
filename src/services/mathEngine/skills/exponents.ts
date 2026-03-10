import type { SkillDefinition } from '../types';

export const EXPONENTS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'exponents.squares',
    name: 'Squares',
    operation: 'exponents',
    grade: 5,
    standards: ['5.NBT.A.2'],
    prerequisites: ['multiplication.facts-7-8-9'],
  },
  {
    id: 'exponents.cubes',
    name: 'Cubes',
    operation: 'exponents',
    grade: 5,
    standards: ['5.NBT.A.2'],
    prerequisites: ['exponents.squares'],
  },
  {
    id: 'exponents.power-of-10',
    name: 'Powers of 10',
    operation: 'exponents',
    grade: 5,
    standards: ['5.NBT.A.2'],
    prerequisites: ['place-value.to-10000'],
  },
  {
    id: 'exponents.evaluate',
    name: 'Evaluate exponents',
    operation: 'exponents',
    grade: 6,
    standards: ['6.EE.A.1'],
    prerequisites: ['exponents.squares', 'exponents.cubes'],
  },
  {
    id: 'exponents.square-root',
    name: 'Square roots',
    operation: 'exponents',
    grade: 6,
    standards: ['6.EE.A.1'],
    prerequisites: ['exponents.squares'],
  },
  {
    id: 'exponents.negative',
    name: 'Negative exponents',
    operation: 'exponents',
    grade: 8,
    standards: ['8.EE.A.1'],
    prerequisites: ['exponents.evaluate'],
  },
];
