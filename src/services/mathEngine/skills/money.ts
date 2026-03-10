import type { SkillDefinition } from '../types';

export const MONEY_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'money.coin-id',
    name: 'Identify coins',
    operation: 'money',
    grade: 1,
    standards: ['1.MD.3'],
    prerequisites: [],
  },
  {
    id: 'money.count.same-type',
    name: 'Count same-type coins',
    operation: 'money',
    grade: 1,
    standards: ['1.MD.3'],
    prerequisites: ['money.coin-id', 'addition.single-digit.no-carry'],
  },
  {
    id: 'money.count.mixed',
    name: 'Count mixed coins',
    operation: 'money',
    grade: 2,
    standards: ['2.MD.C.8'],
    prerequisites: ['money.count.same-type', 'addition.within-20.no-carry'],
  },
  {
    id: 'money.notation',
    name: 'Dollar/cent notation',
    operation: 'money',
    grade: 2,
    standards: ['2.MD.C.8'],
    prerequisites: ['money.count.mixed'],
  },
  {
    id: 'money.change.simple',
    name: 'Making change',
    operation: 'money',
    grade: 2,
    standards: ['2.MD.C.8'],
    prerequisites: [
      'money.count.mixed',
      'subtraction.within-20.with-borrow',
    ],
  },
  {
    id: 'money.multi-step',
    name: 'Multi-step money problems',
    operation: 'money',
    grade: 3,
    standards: ['3.OA.D.8'],
    prerequisites: [
      'money.change.simple',
      'addition.two-digit.with-carry',
    ],
  },
  {
    id: 'money.unit-price',
    name: 'Unit pricing',
    operation: 'money',
    grade: 4,
    standards: ['4.MD.A.2'],
    prerequisites: ['money.multi-step', 'division.two-by-one'],
  },
];
