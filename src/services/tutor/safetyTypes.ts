/**
 * Types for the deterministic safety filter pipeline.
 * Every LLM response must pass through these checks before reaching the child.
 */

/** Result of checking whether the LLM response leaks the correct answer. */
export interface SafetyCheckResult {
  safe: boolean;
  reason: 'answer_digit_leak' | 'answer_word_leak' | 'answer_indirect_leak' | null;
}

/** Result of validating content is age-appropriate. */
export interface ContentValidationResult {
  valid: boolean;
  reason: 'too_many_sentences' | 'sentence_too_long' | 'vocabulary_too_complex' | null;
  complexWords?: string[];
}

/** Categories of failure that map to canned fallback responses. */
export type FallbackCategory =
  | 'safety_blocked'
  | 'answer_leaked'
  | 'content_invalid'
  | 'timeout'
  | 'error'
  | 'rate_limited';

/** Discriminated union result of the full safety pipeline. */
export type SafetyPipelineResult =
  | { passed: true; text: string }
  | { passed: false; fallbackCategory: FallbackCategory; reason: string };
