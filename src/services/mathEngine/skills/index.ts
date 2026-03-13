import type { Grade, MathDomain, SkillDefinition } from '../types';

import { ADDITION_SKILLS } from './addition';
import { DIVISION_SKILLS } from './division';
import { FRACTIONS_SKILLS } from './fractions';
import { MONEY_SKILLS } from './money';
import { MULTIPLICATION_SKILLS } from './multiplication';
import { PATTERNS_SKILLS } from './patterns';
import { PLACE_VALUE_SKILLS } from './placeValue';
import { SUBTRACTION_SKILLS } from './subtraction';
import { TIME_SKILLS } from './time';
import { MEASUREMENT_SKILLS } from './measurement';
import { RATIOS_SKILLS } from './ratios';
import { EXPONENTS_SKILLS } from './exponents';
import { EXPRESSIONS_SKILLS } from './expressions';
import { DECIMAL_SKILLS } from './decimals';
import { INTEGER_SKILLS } from './integers';
import { GEOMETRY_SKILLS } from './geometry';
import { PROBABILITY_SKILLS } from './probability';
import { NUMBER_THEORY_SKILLS } from './numberTheory';
import { BASIC_GRAPHS_SKILLS } from './basicGraphs';
import { DATA_ANALYSIS_SKILLS } from './dataAnalysis';
import { LINEAR_EQUATIONS_SKILLS } from './linearEquations';
import { COORDINATE_GEOMETRY_SKILLS } from './coordinateGeometry';
import { SEQUENCES_SERIES_SKILLS } from './sequencesSeries';

export const SKILLS: readonly SkillDefinition[] = [
  ...ADDITION_SKILLS,
  ...SUBTRACTION_SKILLS,
  ...MULTIPLICATION_SKILLS,
  ...DIVISION_SKILLS,
  ...FRACTIONS_SKILLS,
  ...PLACE_VALUE_SKILLS,
  ...TIME_SKILLS,
  ...MONEY_SKILLS,
  ...PATTERNS_SKILLS,
  ...MEASUREMENT_SKILLS,
  ...RATIOS_SKILLS,
  ...EXPONENTS_SKILLS,
  ...EXPRESSIONS_SKILLS,
  ...DECIMAL_SKILLS,
  ...INTEGER_SKILLS,
  ...GEOMETRY_SKILLS,
  ...PROBABILITY_SKILLS,
  ...NUMBER_THEORY_SKILLS,
  ...BASIC_GRAPHS_SKILLS,
  ...DATA_ANALYSIS_SKILLS,
  ...LINEAR_EQUATIONS_SKILLS,
  ...COORDINATE_GEOMETRY_SKILLS,
  ...SEQUENCES_SERIES_SKILLS,
];

export function getSkillById(id: string): SkillDefinition | undefined {
  return SKILLS.find((skill) => skill.id === id);
}

export function getSkillsByOperation(
  operation: MathDomain,
): SkillDefinition[] {
  return SKILLS.filter((skill) => skill.operation === operation);
}

export function getSkillsByGrade(grade: Grade): SkillDefinition[] {
  return SKILLS.filter((skill) => skill.grade === grade);
}

export {
  ADDITION_SKILLS,
  SUBTRACTION_SKILLS,
  MULTIPLICATION_SKILLS,
  DIVISION_SKILLS,
  FRACTIONS_SKILLS,
  PLACE_VALUE_SKILLS,
  TIME_SKILLS,
  MONEY_SKILLS,
  PATTERNS_SKILLS,
  MEASUREMENT_SKILLS,
  RATIOS_SKILLS,
  EXPONENTS_SKILLS,
  EXPRESSIONS_SKILLS,
  DECIMAL_SKILLS,
  INTEGER_SKILLS,
  GEOMETRY_SKILLS,
  PROBABILITY_SKILLS,
  NUMBER_THEORY_SKILLS,
  BASIC_GRAPHS_SKILLS,
  DATA_ANALYSIS_SKILLS,
  LINEAR_EQUATIONS_SKILLS,
  COORDINATE_GEOMETRY_SKILLS,
  SEQUENCES_SERIES_SKILLS,
};
