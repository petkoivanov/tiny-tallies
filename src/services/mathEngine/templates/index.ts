import type { MathDomain, ProblemTemplate } from '../types';
import { ADDITION_TEMPLATES } from './addition';
import { DIVISION_TEMPLATES } from './division';
import { FRACTIONS_TEMPLATES } from './fractions';
import { MONEY_TEMPLATES } from './money';
import { MULTIPLICATION_TEMPLATES } from './multiplication';
import { PATTERNS_TEMPLATES } from './patterns';
import { PLACE_VALUE_TEMPLATES } from './placeValue';
import { SUBTRACTION_TEMPLATES } from './subtraction';
import { TIME_TEMPLATES } from './time';
import { MEASUREMENT_TEMPLATES } from './measurement';
import { RATIOS_TEMPLATES } from './ratios';
import { EXPONENTS_TEMPLATES } from './exponents';
import { EXPRESSIONS_TEMPLATES } from './expressions';
import { DECIMAL_TEMPLATES } from './decimals';
import { INTEGER_TEMPLATES } from './integers';
import { GEOMETRY_TEMPLATES } from './geometry';
import { PROBABILITY_TEMPLATES } from './probability';
import { NUMBER_THEORY_TEMPLATES } from './numberTheory';
import { BASIC_GRAPHS_TEMPLATES } from './basicGraphs';
import { DATA_ANALYSIS_TEMPLATES } from './dataAnalysis';
import { LINEAR_EQUATIONS_TEMPLATES } from './linearEquations';
import { COORDINATE_GEOMETRY_TEMPLATES } from './coordinateGeometry';

export const ALL_TEMPLATES: readonly ProblemTemplate[] = [
  ...ADDITION_TEMPLATES,
  ...SUBTRACTION_TEMPLATES,
  ...MULTIPLICATION_TEMPLATES,
  ...DIVISION_TEMPLATES,
  ...FRACTIONS_TEMPLATES,
  ...PLACE_VALUE_TEMPLATES,
  ...TIME_TEMPLATES,
  ...MONEY_TEMPLATES,
  ...PATTERNS_TEMPLATES,
  ...MEASUREMENT_TEMPLATES,
  ...RATIOS_TEMPLATES,
  ...EXPONENTS_TEMPLATES,
  ...EXPRESSIONS_TEMPLATES,
  ...DECIMAL_TEMPLATES,
  ...INTEGER_TEMPLATES,
  ...GEOMETRY_TEMPLATES,
  ...PROBABILITY_TEMPLATES,
  ...NUMBER_THEORY_TEMPLATES,
  ...BASIC_GRAPHS_TEMPLATES,
  ...DATA_ANALYSIS_TEMPLATES,
  ...LINEAR_EQUATIONS_TEMPLATES,
  ...COORDINATE_GEOMETRY_TEMPLATES,
];

export function findTemplate(templateId: string): ProblemTemplate {
  const template = ALL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(
      `Template not found: "${templateId}". Available templates: ${ALL_TEMPLATES.map((t) => t.id).join(', ')}`,
    );
  }
  return template;
}

export function getTemplatesBySkill(skillId: string): ProblemTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.skillId === skillId);
}

export function getTemplatesByOperation(
  operation: MathDomain,
): ProblemTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.operation === operation);
}

export { ADDITION_TEMPLATES } from './addition';
export { SUBTRACTION_TEMPLATES } from './subtraction';
export { MULTIPLICATION_TEMPLATES } from './multiplication';
export { DIVISION_TEMPLATES } from './division';
export { FRACTIONS_TEMPLATES } from './fractions';
export { PLACE_VALUE_TEMPLATES } from './placeValue';
export { TIME_TEMPLATES } from './time';
export { MONEY_TEMPLATES } from './money';
export { PATTERNS_TEMPLATES } from './patterns';
export { MEASUREMENT_TEMPLATES } from './measurement';
export { RATIOS_TEMPLATES } from './ratios';
export { EXPONENTS_TEMPLATES } from './exponents';
export { EXPRESSIONS_TEMPLATES } from './expressions';
export { DECIMAL_TEMPLATES } from './decimals';
export { INTEGER_TEMPLATES } from './integers';
export { GEOMETRY_TEMPLATES } from './geometry';
export { PROBABILITY_TEMPLATES } from './probability';
export { NUMBER_THEORY_TEMPLATES } from './numberTheory';
export { BASIC_GRAPHS_TEMPLATES } from './basicGraphs';
export { DATA_ANALYSIS_TEMPLATES } from './dataAnalysis';
export { LINEAR_EQUATIONS_TEMPLATES } from './linearEquations';
export { COORDINATE_GEOMETRY_TEMPLATES } from './coordinateGeometry';
