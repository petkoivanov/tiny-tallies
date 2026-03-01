// Types (re-export for consumers)
export type {
  Problem,
  ProblemTemplate,
  ProblemMetadata,
  GenerationParams,
  BatchGenerationParams,
  SkillDefinition,
  Operation,
  Grade,
  OperandRange,
} from './types';

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
export { ADDITION_SUBTRACTION_STANDARDS } from './standards';
export type { StandardCode } from './standards';

// Utilities (exported for Phase 3 Bug Library use)
export { requiresCarry, requiresBorrow } from './constraints';
export { createRng } from './seededRng';
export type { SeededRng } from './seededRng';
