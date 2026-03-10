// Types (re-export for consumers)
export type {
  Problem,
  ProblemTemplate,
  ProblemMetadata,
  GenerationParams,
  BatchGenerationParams,
  SkillDefinition,
  MathDomain,
  Grade,
  OperandRange,
  Answer,
  NumericAnswer,
  FractionAnswer,
  ComparisonAnswer,
  CoordinateAnswer,
  ExpressionAnswer,
  DomainHandler,
  DomainProblemData,
} from './types';

export { numericAnswer, answerNumericValue } from './types';

// Domain handlers
export { getHandler } from './domains';

// Generator
export {
  generateProblem,
  generateProblems,
  GenerationParamsSchema,
  BatchGenerationParamsSchema,
} from './generator';

// Templates
export {
  ALL_TEMPLATES,
  findTemplate,
  getTemplatesBySkill,
  getTemplatesByOperation,
} from './templates';

// Skills
export {
  SKILLS,
  getSkillById,
  getSkillsByOperation,
  getSkillsByGrade,
} from './skills';

// Standards
export { STANDARDS, ADDITION_SUBTRACTION_STANDARDS } from './standards';
export type { StandardCode } from './standards';

// Utilities (exported for Phase 3 Bug Library use)
export { requiresCarry, requiresBorrow } from './constraints';
export { createRng } from './seededRng';
export type { SeededRng } from './seededRng';

// Bug Library (Phase 3)
export { generateDistractors } from './bugLibrary';
export type { DistractorResult, DistractorSource, BugPattern } from './bugLibrary';

// Answer Formats (Phase 3)
export {
  formatAsMultipleChoice,
  formatAsFreeText,
  parseIntegerInput,
  validateFreeTextAnswer,
} from './answerFormats';
export type {
  AnswerFormat,
  ChoiceOption,
  MultipleChoicePresentation,
  FreeTextPresentation,
  FormattedProblem,
} from './answerFormats';
