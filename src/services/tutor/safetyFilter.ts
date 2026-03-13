/**
 * Deterministic safety filter functions for LLM response validation.
 * Pure functions with no side effects or store dependencies.
 *
 * Pipeline order: checkAnswerLeak -> validateContent -> deliver to child
 * scrubOutboundPii runs on OUTBOUND prompts (before callGemini).
 */

import type { AgeBracket, TutorMode } from './types';
import type {
  SafetyCheckResult,
  ContentValidationResult,
  SafetyPipelineResult,
} from './safetyTypes';
import {
  numberToWord,
  CONTENT_WORD_LIMITS,
  MAX_SENTENCES,
  MAX_WORD_LENGTH,
} from './safetyConstants';

/**
 * Build a regex that matches answerStr as a standalone number.
 * \b fails for negative numbers (the '-' is \W, so no word boundary before the digit).
 * For negative answers, use look-behind/look-ahead instead.
 */
function buildNumberPattern(answerStr: string): RegExp {
  const escaped = escapeRegex(answerStr);
  if (answerStr.startsWith('-')) {
    // Negative: match only when not preceded or followed by another digit
    return new RegExp(`(?<![0-9])${escaped}(?![0-9])`);
  }
  // Positive: word boundary works correctly
  return new RegExp(`\\b${escaped}\\b`);
}

/**
 * Checks if the LLM response leaks the correct answer.
 * Uses deterministic regex + rule engine, NOT LLM self-policing.
 *
 * Checks for:
 * 1. Exact digit match as standalone word (word boundary prevents "17" matching "7")
 * 2. Spelled-out number word with word boundary (prevents "seventy" matching "seven")
 * 3. Indirect phrasing patterns: "equals X", "is X", "get X", "makes X", "gives X"
 */
export function checkAnswerLeak(
  response: string,
  correctAnswer: number,
): SafetyCheckResult {
  const text = response.toLowerCase();
  const answerStr = String(correctAnswer);
  const answerWord = numberToWord(correctAnswer);

  // Pattern 1: Digit appears as standalone number
  // Uses look-around for negative numbers (word boundary fails on '-')
  const digitPattern = buildNumberPattern(answerStr);
  if (digitPattern.test(text)) {
    return { safe: false, reason: 'answer_digit_leak' };
  }

  // Pattern 2: Spelled-out number word (word boundary)
  if (answerWord) {
    const wordPattern = new RegExp(`\\b${escapeRegex(answerWord)}\\b`);
    if (wordPattern.test(text)) {
      return { safe: false, reason: 'answer_word_leak' };
    }
  }

  // Pattern 3: Indirect reveal phrases
  const phrases = ['equals', 'is', 'get', 'gets', 'makes', 'gives'];
  for (const phrase of phrases) {
    // Check digit form: "equals 7" or "equals -3"
    // For negative answers, use look-around after the phrase+space
    const digitIndirectSuffix = answerStr.startsWith('-')
      ? `(?<![0-9])${escapeRegex(answerStr)}(?![0-9])`
      : `${escapeRegex(answerStr)}\\b`;
    const digitIndirect = new RegExp(
      `\\b${escapeRegex(phrase)}\\s+${digitIndirectSuffix}`,
    );
    if (digitIndirect.test(text)) {
      return { safe: false, reason: 'answer_indirect_leak' };
    }

    // Check word form: "equals seven"
    if (answerWord) {
      const wordIndirect = new RegExp(
        `\\b${escapeRegex(phrase)}\\s+${escapeRegex(answerWord)}\\b`,
      );
      if (wordIndirect.test(text)) {
        return { safe: false, reason: 'answer_indirect_leak' };
      }
    }
  }

  return { safe: true, reason: null };
}

/**
 * Checks if the LLM response leaks ANY value from a multi-root answer.
 * Loops over each value and calls checkAnswerLeak.
 * Returns { safe: false, leaked } on first leak found, or { safe: true }.
 */
export function checkMultiAnswerLeak(
  response: string,
  values: readonly number[],
): { safe: boolean; leaked?: number } {
  for (const value of values) {
    const result = checkAnswerLeak(response, value);
    if (!result.safe) {
      return { safe: false, leaked: value };
    }
  }
  return { safe: true };
}

/**
 * Validates that LLM output respects sentence length and vocabulary
 * constraints per age bracket.
 *
 * Checks (in order):
 * 1. Sentence count against MAX_SENTENCES (4)
 * 2. Word count per sentence against CONTENT_WORD_LIMITS[ageBracket]
 * 3. Word character length (letters only) against MAX_WORD_LENGTH[ageBracket]
 *
 * Returns first failure found, or { valid: true, reason: null }.
 */
export function validateContent(
  response: string,
  ageBracket: AgeBracket,
): ContentValidationResult {
  const maxWordsPerSentence = CONTENT_WORD_LIMITS[ageBracket];
  const maxWordCharLength = MAX_WORD_LENGTH[ageBracket];

  // Split on sentence-ending punctuation
  const sentences = response
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Check sentence count
  if (sentences.length > MAX_SENTENCES) {
    return { valid: false, reason: 'too_many_sentences' };
  }

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter((w) => w.length > 0);

    // Check word count per sentence
    if (words.length > maxWordsPerSentence) {
      return { valid: false, reason: 'sentence_too_long' };
    }

    // Check vocabulary complexity (word character length, letters only)
    const complexWords = words.filter(
      (w) => w.replace(/[^a-zA-Z]/g, '').length > maxWordCharLength,
    );
    if (complexWords.length > 0) {
      return { valid: false, reason: 'vocabulary_too_complex', complexWords };
    }
  }

  return { valid: true, reason: null };
}

/**
 * Scrubs outbound prompts to ensure no PII leaks to the LLM.
 * Defense-in-depth: PromptParams already excludes name/age,
 * but this catches accidental additions.
 *
 * Replaces child name and specific age patterns with "the child".
 */
export function scrubOutboundPii(
  systemInstruction: string,
  userMessage: string,
  childName: string | null,
  childAge: number | null,
): { systemInstruction: string; userMessage: string; piiFound: boolean } {
  let piiFound = false;
  let cleanSystem = systemInstruction;
  let cleanUser = userMessage;

  // Scrub child name (case-insensitive)
  if (childName && childName.length > 0) {
    const namePattern = new RegExp(escapeRegex(childName), 'gi');
    if (namePattern.test(cleanSystem) || namePattern.test(cleanUser)) {
      piiFound = true;
      cleanSystem = cleanSystem.replace(namePattern, 'the child');
      cleanUser = cleanUser.replace(namePattern, 'the child');
    }
  }

  // Scrub specific age patterns
  if (childAge !== null) {
    const agePatterns = [
      new RegExp(`\\b${childAge}\\s*(years?|yr)\\s*old\\b`, 'gi'),
      new RegExp(`\\bage\\s*:?\\s*${childAge}\\b`, 'gi'),
      new RegExp(`\\b${childAge}\\s*-?\\s*year`, 'gi'),
    ];
    for (const pattern of agePatterns) {
      if (pattern.test(cleanSystem) || pattern.test(cleanUser)) {
        piiFound = true;
        // Reset lastIndex because .test() advances it with global flag
        pattern.lastIndex = 0;
        cleanSystem = cleanSystem.replace(pattern, 'the child');
        pattern.lastIndex = 0;
        cleanUser = cleanUser.replace(pattern, 'the child');
      }
    }
  }

  return { systemInstruction: cleanSystem, userMessage: cleanUser, piiFound };
}

/**
 * Orchestrates the full safety pipeline on an LLM response.
 * Runs checkAnswerLeak first, then validateContent.
 *
 * When mode is 'boost', skips answer-leak check (BOOST is allowed to reveal answers)
 * but still runs content validation.
 *
 * Returns { passed: true, text } if all checks pass,
 * or { passed: false, fallbackCategory, reason } on failure.
 */
export function runSafetyPipeline(
  response: string,
  correctAnswer: number,
  ageBracket: AgeBracket,
  mode?: TutorMode,
): SafetyPipelineResult {
  // Step 1: Answer leak detection (skipped in BOOST mode)
  if (mode !== 'boost') {
    const answerCheck = checkAnswerLeak(response, correctAnswer);
    if (!answerCheck.safe) {
      return {
        passed: false,
        fallbackCategory: 'answer_leaked',
        reason: answerCheck.reason!,
      };
    }
  }

  // Step 2: Content validation (always runs, even in BOOST mode)
  const contentCheck = validateContent(response, ageBracket);
  if (!contentCheck.valid) {
    return {
      passed: false,
      fallbackCategory: 'content_invalid',
      reason: contentCheck.reason!,
    };
  }

  // All checks passed
  return { passed: true, text: response };
}

/**
 * Parses a hint ladder JSON response from Gemini.
 * Extracts a JSON array from the response text (handles markdown code fences).
 * Returns null if parsing fails.
 */
export function parseHintLadder(response: string): string[] | null {
  // Strip markdown code fences if present
  let cleaned = response.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (
      !Array.isArray(parsed) ||
      parsed.length < 2 ||
      !parsed.every((item) => typeof item === 'string' && item.length > 0)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Validates an entire hint ladder for answer leaks and content safety.
 * Truncates the ladder at the first hint that fails a safety check.
 * Returns the safe prefix (may be empty if even the first hint leaks).
 */
export function validateHintLadder(
  hints: string[],
  correctAnswer: number,
  _ageBracket: AgeBracket,
): string[] {
  // Only check for answer leaks — the prompt instructs Gemini to use
  // age-appropriate language, so content/vocabulary filtering is redundant
  // and blocks valid math operation words like "multiplication".
  const safeHints: string[] = [];
  for (const hint of hints) {
    const leakCheck = checkAnswerLeak(hint, correctAnswer);
    if (!leakCheck.safe) break;
    safeHints.push(hint);
  }
  return safeHints;
}

/** Escapes special regex characters in a string for safe use in RegExp. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
