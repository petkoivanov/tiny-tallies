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
