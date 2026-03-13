// Types
export type {
  DistractorSource,
  BugPattern,
  DistractorResult,
} from './types';

// Bug patterns
export { ADDITION_BUGS } from './additionBugs';
export { SUBTRACTION_BUGS } from './subtractionBugs';
export { MULTIPLICATION_BUGS } from './multiplicationBugs';
export { DIVISION_BUGS } from './divisionBugs';
export { FRACTIONS_BUGS } from './fractionsBugs';
export { PLACE_VALUE_BUGS } from './placeValueBugs';
export { TIME_BUGS } from './timeBugs';
export { MONEY_BUGS } from './moneyBugs';
export { PATTERNS_BUGS } from './patternsBugs';
export { MEASUREMENT_BUGS } from './measurementBugs';
export { RATIOS_BUGS } from './ratiosBugs';
export { EXPONENTS_BUGS } from './exponentsBugs';
export { EXPRESSIONS_BUGS } from './expressionsBugs';
export { BASIC_GRAPHS_BUGS } from './basicGraphsBugs';
export { DATA_ANALYSIS_BUGS } from './dataAnalysisBugs';
export { LINEAR_EQUATIONS_BUGS } from './linearEquationsBugs';
export { COORDINATE_GEOMETRY_BUGS } from './coordinateGeometryBugs';

// Validation utilities
export { isValidDistractor, shuffleArray } from './validation';

// Distractor generation
export { generateDistractors } from './distractorGenerator';
