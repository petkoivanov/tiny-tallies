/**
 * Safety constants for the LLM response filter pipeline.
 * Includes Gemini safety settings, number-to-word mapping,
 * content validation limits, and canned fallback responses.
 */

import type {
  HarmCategory,
  HarmBlockThreshold,
  SafetySetting,
} from '@google/genai';
import type { AgeBracket } from './types';
import type { FallbackCategory } from './safetyTypes';

/**
 * Safety settings for Gemini API calls.
 * BLOCK_LOW_AND_ABOVE is the most restrictive threshold.
 * Gemini 2.5 defaults to OFF, so explicit configuration is MANDATORY.
 *
 * Uses string literals cast to enum types because @google/genai enum
 * values are string-backed and the module is ESM (not Jest-transformable).
 */
export const GEMINI_SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: 'HARM_CATEGORY_HARASSMENT' as HarmCategory,
    threshold: 'BLOCK_LOW_AND_ABOVE' as HarmBlockThreshold,
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH' as HarmCategory,
    threshold: 'BLOCK_LOW_AND_ABOVE' as HarmBlockThreshold,
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as HarmCategory,
    threshold: 'BLOCK_LOW_AND_ABOVE' as HarmBlockThreshold,
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as HarmCategory,
    threshold: 'BLOCK_LOW_AND_ABOVE' as HarmBlockThreshold,
  },
];

/**
 * Static lookup table for numbers 0-20 and round tens up to 100.
 * Used as fast lookup for answer-leak detection.
 */
export const NUMBER_WORDS: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
  30: 'thirty',
  40: 'forty',
  50: 'fifty',
  60: 'sixty',
  70: 'seventy',
  80: 'eighty',
  90: 'ninety',
  100: 'one hundred',
  200: 'two hundred',
};

/**
 * Converts a number (0-200) to its English word form.
 * For numbers in the static table, returns the direct lookup.
 * For compound numbers (21-99, 101-199), generates dynamically.
 * Returns null for out-of-range or non-integer values.
 */
export function numberToWord(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > 200) return null;

  // Direct lookup for numbers in the table
  if (NUMBER_WORDS[n] !== undefined) return NUMBER_WORDS[n];

  // Compound numbers 21-99: e.g. "twenty-one", "thirty-five"
  if (n >= 21 && n <= 99) {
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    const tensWord = NUMBER_WORDS[tens];
    const onesWord = NUMBER_WORDS[ones];
    if (tensWord && onesWord) return `${tensWord}-${onesWord}`;
    return null;
  }

  // Compound numbers 101-199: e.g. "one hundred one", "one hundred fifty-five"
  if (n >= 101 && n <= 199) {
    const remainder = n - 100;
    const remainderWord = numberToWord(remainder);
    if (remainderWord) return `one hundred ${remainderWord}`;
    return null;
  }

  return null;
}

/** Maximum words per sentence, by age bracket. */
export const CONTENT_WORD_LIMITS: Record<AgeBracket, number> = {
  '6-7': 8,
  '7-8': 10,
  '8-9': 12,
};

/** Maximum number of sentences in a response. */
export const MAX_SENTENCES = 4;

/** Maximum word character length (letters only) as vocabulary complexity proxy. */
export const MAX_WORD_LENGTH: Record<AgeBracket, number> = {
  '6-7': 7,
  '7-8': 8,
  '8-9': 9,
};

/**
 * Canned fallback responses for each failure category.
 * Messages are context-free -- they never reference specific problems,
 * numbers, or operations. Child-friendly and encouraging.
 */
export const CANNED_FALLBACKS: Record<FallbackCategory, string[]> = {
  safety_blocked: [
    "Let's think about this math problem together! What do you notice?",
    'Great question! Try looking at the numbers carefully.',
    "I'm here to help! What part feels tricky?",
  ],
  answer_leaked: [
    'Hmm, let me think of a better hint. What do you see in the problem?',
    "Let's try a different approach! Can you draw it out?",
    'Good thinking! Try using your fingers to count.',
  ],
  content_invalid: [
    "Let's try again! Look at the numbers in the problem.",
    "You're doing great! What do you think comes next?",
    'Keep going! Try breaking it into smaller parts.',
  ],
  timeout: [
    'I need a moment! While I think, try solving it your way.',
    "Hmm, I'm thinking hard! Can you try drawing it out?",
    "Let's take a different approach. What do you notice?",
  ],
  error: [
    'Oops! Let me try again. What part of the problem are you working on?',
    'Something went wrong on my end. Try your best -- you can do it!',
    "I hit a bump! Keep trying, you're doing great!",
  ],
  rate_limited: [
    "You've had great hints on this one! Try your best -- you can do it!",
    "You've been working really hard! Try solving the next few on your own.",
  ],
};

/**
 * Returns a random canned fallback for the given category.
 * Uses Math.random for variety so the child doesn't see the same message every time.
 */
export function getCannedFallback(category: FallbackCategory): string {
  const options = CANNED_FALLBACKS[category];
  return options[Math.floor(Math.random() * options.length)];
}
