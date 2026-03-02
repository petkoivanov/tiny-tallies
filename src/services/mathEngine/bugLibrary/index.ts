// Types
export type {
  DistractorSource,
  BugPattern,
  DistractorResult,
} from './types';

// Bug patterns
export { ADDITION_BUGS } from './additionBugs';
export { SUBTRACTION_BUGS } from './subtractionBugs';

// Validation utilities
export { isValidDistractor, shuffleArray } from './validation';

// Distractor generation
export { generateDistractors } from './distractorGenerator';
