export type {
  TutorMode,
  AgeBracket,
  TutorMessage,
  PromptParams,
  GeminiResponse,
} from './types';
export { geminiResponseSchema } from './types';

export {
  getGeminiClient,
  resetGeminiClient,
  callGemini,
} from './geminiClient';
export type { CallGeminiOptions } from './geminiClient';

export { buildSystemInstruction, buildHintPrompt } from './promptTemplates';

export {
  RATE_LIMITS,
  checkRateLimit,
  getRateLimitMessage,
} from './rateLimiter';
export type { RateState, RateLimitKind } from './rateLimiter';

export type {
  SafetyCheckResult,
  ContentValidationResult,
  SafetyPipelineResult,
  FallbackCategory,
} from './safetyTypes';
export {
  GEMINI_SAFETY_SETTINGS,
  CANNED_FALLBACKS,
  getCannedFallback,
  numberToWord,
  NUMBER_WORDS,
  CONTENT_WORD_LIMITS,
  MAX_SENTENCES,
  MAX_WORD_LENGTH,
} from './safetyConstants';
export {
  checkAnswerLeak,
  validateContent,
  scrubOutboundPii,
  runSafetyPipeline,
} from './safetyFilter';
