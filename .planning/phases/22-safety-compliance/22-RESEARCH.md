# Phase 22: Safety & Compliance - Research

**Researched:** 2026-03-04
**Domain:** LLM output safety filtering, COPPA data minimization, Gemini safety settings, content validation, parental consent gates
**Confidence:** HIGH

## Summary

This phase wraps every LLM interaction in deterministic safety layers. The existing Phase 21 code (`geminiClient.ts`, `promptTemplates.ts`, `useTutor.ts`) provides the call infrastructure but has no safety filtering, no Gemini safety settings, no content validation, no answer-leak detection, and no parental consent gate. All six requirements (SAFE-01 through SAFE-06) and LLM-03 must be built from scratch.

The Gemini 2.5 models default to safety filters OFF, which means BLOCK_LOW_AND_ABOVE must be explicitly configured. The `@google/genai` v1.30.0 SDK supports `SafetySetting[]` in the `config` parameter of `generateContent`, with `HarmCategory` and `HarmBlockThreshold` enums available as string literals. The answer-leak detection must work deterministically (regex + rule engine) because LLM self-policing is unreliable. COPPA data minimization is already partially addressed -- `PromptParams` deliberately excludes `correctAnswer` -- but must be extended to verify no child name, age, or profile data leaks into outbound prompts. The VPC consent gate stores a boolean flag in the persisted store (requires STORE_VERSION bump to 6) and blocks tutor access until the parent acknowledges consent via a PIN-protected confirmation.

**Primary recommendation:** Build a `safetyFilter` service module with pure functions for answer-leak detection, content validation, and PII scrubbing. Wire Gemini safety settings into `callGemini`. Create a consent flag in a new store field. Keep all safety logic deterministic and fully unit-testable.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LLM-03 | System instruction enforces safety rules (no answer reveal, age-appropriate language, effort praise only) and Gemini safety filters set to BLOCK_LOW_AND_ABOVE for all 4 categories | Gemini SDK `SafetySetting` type verified in `genai.d.ts`; `HarmCategory` has 4 applicable categories; `HarmBlockThreshold.BLOCK_LOW_AND_ABOVE` confirmed; system instruction enhancement in `buildSystemInstruction` |
| SAFE-01 | Post-generation output filter scans for answer leaking (regex + rule engine) | Deterministic regex patterns for digit match, spelled-out number words, indirect phrasing; pure function architecture for testability |
| SAFE-02 | COPPA data minimization -- never send child name, specific age, or profile data to LLM | `PromptParams` already excludes `correctAnswer`; extend with outbound prompt scrubbing function; verify no PII in system instruction or user message |
| SAFE-03 | Gemini safety filters set to BLOCK_LOW_AND_ABOVE for all 4 categories | `config.safetySettings` array with 4 `SafetySetting` entries; Gemini 2.5 defaults to OFF so explicit configuration is mandatory |
| SAFE-04 | Content validation (sentence length, vocabulary level per age bracket) | Word-per-sentence limits already defined (8/10/12); add sentence count limit and vocabulary complexity check |
| SAFE-05 | Canned fallback responses when LLM fails, is blocked, or times out | Categorized fallback messages for safety-blocked, timeout, error, content-validation-failed; useTutor integration |
| SAFE-06 | VPC parental consent gate before first AI tutor use | Persisted boolean in store (STORE_VERSION 6 + migration); PIN-protected consent confirmation; gate check in `useTutor` |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | ^1.30.0 | Gemini API with SafetySetting config | Already installed; provides `HarmCategory`, `HarmBlockThreshold` enums |
| `zod` | ^4.1.13 | Validate safety filter outputs at boundaries | Already installed; project convention |
| `zustand` | ^5.0.8 | Consent flag in persisted store | Already installed; slice pattern established |
| `expo-secure-store` | ^15.0.7 | PIN verification for parental consent gate | Already installed; CLAUDE.md mandates for sensitive data |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | - | All safety logic is pure functions + regex | No new dependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom regex answer filter | LLM-as-judge second pass | Too slow, unreliable, adds API cost; deterministic regex is faster and testable |
| Syllable counting for vocabulary | Full NLP readability scorer | Over-engineered; word length heuristic (>8 chars = complex) is sufficient for ages 6-9 |
| PIN-based VPC | Email-plus VPC method | Email requires backend infrastructure not in scope; PIN is FTC-accepted for internal consent gates |

**Installation:**
```bash
# No new dependencies needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  services/
    tutor/
      safetyFilter.ts        # Answer-leak detection, content validation, PII scrubbing
      safetyConstants.ts      # Canned fallbacks, vocab limits, number words, safety settings
      safetyTypes.ts          # SafetyCheckResult, ContentValidationResult, FallbackCategory
      geminiClient.ts         # (MODIFY) Add safetySettings to generateContent config
      promptTemplates.ts      # (MODIFY) Enhance system instruction with stronger safety rules
      index.ts                # (MODIFY) Export new safety modules
  store/
    slices/
      childProfileSlice.ts    # (MODIFY) Add tutorConsentGranted: boolean
    appStore.ts               # (MODIFY) Add tutorConsentGranted to partialize, STORE_VERSION = 6
    migrations.ts             # (MODIFY) Add version < 6 migration
  hooks/
    useTutor.ts               # (MODIFY) Wire safety filter after callGemini, consent gate check
```

### Pattern 1: Layered Safety Pipeline
**What:** Every LLM response passes through a deterministic pipeline: Gemini safety filters (API-level) -> Answer-leak detection -> Content validation -> Fallback substitution. Each layer is a pure function.
**When to use:** Every single `callGemini` return value, before it reaches the child.
**Example:**
```typescript
// src/services/tutor/safetyFilter.ts
import type { AgeBracket } from './types';
import { CANNED_FALLBACKS, NUMBER_WORDS } from './safetyConstants';
import type { SafetyCheckResult, ContentValidationResult } from './safetyTypes';

/**
 * Checks if the LLM response leaks the correct answer.
 * Uses deterministic regex + rule engine, NOT LLM self-policing.
 *
 * Checks for:
 * 1. Exact digit match (e.g., "the answer is 7")
 * 2. Spelled-out number word (e.g., "the answer is seven")
 * 3. Indirect phrasing (e.g., "you need seven more", "it equals 7")
 */
export function checkAnswerLeak(
  response: string,
  correctAnswer: number,
): SafetyCheckResult {
  const text = response.toLowerCase();
  const answerStr = String(correctAnswer);
  const answerWord = NUMBER_WORDS[correctAnswer]; // "seven" for 7

  // Pattern 1: Digit appears as standalone number
  const digitPattern = new RegExp(`\\b${answerStr}\\b`);
  if (digitPattern.test(text)) {
    return { safe: false, reason: 'answer_digit_leak' };
  }

  // Pattern 2: Spelled-out number word
  if (answerWord && text.includes(answerWord)) {
    return { safe: false, reason: 'answer_word_leak' };
  }

  // Pattern 3: Indirect reveal phrases
  const indirectPatterns = [
    `equals ${answerStr}`,
    `equals ${answerWord}`,
    `is ${answerStr}`,
    `is ${answerWord}`,
    `get ${answerStr}`,
    `get ${answerWord}`,
    `makes ${answerStr}`,
    `makes ${answerWord}`,
  ];
  for (const pattern of indirectPatterns) {
    if (text.includes(pattern)) {
      return { safe: false, reason: 'answer_indirect_leak' };
    }
  }

  return { safe: true, reason: null };
}
```

### Pattern 2: Content Validation with Age Brackets
**What:** Validates that LLM output respects sentence length and vocabulary constraints per age bracket.
**When to use:** After answer-leak check, before delivering to child.
**Example:**
```typescript
/**
 * Validates content is age-appropriate.
 * Checks: sentence count, words per sentence, vocabulary complexity.
 */
export function validateContent(
  response: string,
  ageBracket: AgeBracket,
): ContentValidationResult {
  const maxWordsPerSentence = WORD_LIMITS[ageBracket];
  const maxSentences = 4; // Keep responses brief for children
  const maxWordLength = ageBracket === '6-7' ? 7 : ageBracket === '7-8' ? 8 : 9;

  const sentences = response
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length > maxSentences) {
    return { valid: false, reason: 'too_many_sentences' };
  }

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter((w) => w.length > 0);
    if (words.length > maxWordsPerSentence) {
      return { valid: false, reason: 'sentence_too_long' };
    }
    // Check for complex vocabulary (proxy: word character length)
    const complexWords = words.filter((w) => w.replace(/[^a-zA-Z]/g, '').length > maxWordLength);
    if (complexWords.length > 0) {
      return { valid: false, reason: 'vocabulary_too_complex', complexWords };
    }
  }

  return { valid: true, reason: null };
}
```

### Pattern 3: Outbound PII Scrubbing
**What:** Verify that no child name, specific age number, or profile data appears in outbound prompts. This is a defense-in-depth check on top of `PromptParams` excluding these fields.
**When to use:** Before every `callGemini` invocation.
**Example:**
```typescript
/**
 * Scrubs outbound prompt to ensure no PII leaks.
 * Defense-in-depth: PromptParams already excludes these,
 * but this catches accidental additions.
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

  // Check for child name
  if (childName && childName.length > 0) {
    const namePattern = new RegExp(childName, 'gi');
    if (namePattern.test(cleanSystem) || namePattern.test(cleanUser)) {
      piiFound = true;
      cleanSystem = cleanSystem.replace(namePattern, 'the child');
      cleanUser = cleanUser.replace(namePattern, 'the child');
    }
  }

  // Check for specific age number (not age bracket)
  if (childAge !== null) {
    const agePatterns = [
      new RegExp(`\\b${childAge}\\s*(years?|yr)\\s*old\\b`, 'gi'),
      new RegExp(`\\bage\\s*:?\\s*${childAge}\\b`, 'gi'),
      new RegExp(`\\b${childAge}\\s*-?\\s*year`, 'gi'),
    ];
    for (const pattern of agePatterns) {
      if (pattern.test(cleanSystem) || pattern.test(cleanUser)) {
        piiFound = true;
        cleanSystem = cleanSystem.replace(pattern, 'the child');
        cleanUser = cleanUser.replace(pattern, 'the child');
      }
    }
  }

  return { systemInstruction: cleanSystem, userMessage: cleanUser, piiFound };
}
```

### Pattern 4: Gemini Safety Settings Configuration
**What:** Static array of `SafetySetting` objects passed to every `generateContent` call.
**When to use:** In `callGemini` config parameter.
**Example:**
```typescript
// src/services/tutor/safetyConstants.ts
import type { SafetySetting } from '@google/genai';

/**
 * Safety settings for Gemini API calls.
 * BLOCK_LOW_AND_ABOVE is the most restrictive threshold.
 * Gemini 2.5 defaults to OFF, so explicit configuration is MANDATORY.
 */
export const GEMINI_SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_LOW_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_LOW_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_LOW_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_LOW_AND_ABOVE',
  },
];
```

### Pattern 5: Canned Fallback Responses
**What:** Pre-written, child-friendly messages for each failure category.
**When to use:** When LLM fails, is blocked by safety filters, times out, rate-limited, or fails content validation.
**Example:**
```typescript
// src/services/tutor/safetyConstants.ts
export type FallbackCategory =
  | 'safety_blocked'
  | 'answer_leaked'
  | 'content_invalid'
  | 'timeout'
  | 'error'
  | 'rate_limited';

export const CANNED_FALLBACKS: Record<FallbackCategory, string[]> = {
  safety_blocked: [
    "Let's think about this math problem together! What do you notice?",
    "Great question! Try looking at the numbers carefully.",
    "I'm here to help! What part feels tricky?",
  ],
  answer_leaked: [
    "Hmm, let me think of a better hint. What do you see in the problem?",
    "Let's try a different approach! Can you draw it out?",
    "Good thinking! Try using your fingers to count.",
  ],
  content_invalid: [
    "Let's try again! Look at the numbers in the problem.",
    "You're doing great! What do you think comes next?",
    "Keep going! Try breaking it into smaller parts.",
  ],
  timeout: [
    "I need a moment! While I think, try solving it your way.",
    "Hmm, I'm thinking hard! Can you try drawing it out?",
    "Let's take a different approach. What do you notice?",
  ],
  error: [
    "Oops! Let me try again. What part of the problem are you working on?",
    "Something went wrong on my end. Try your best -- you can do it!",
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
```

### Pattern 6: VPC Consent Gate
**What:** A persisted boolean `tutorConsentGranted` in the store. Before the tutor is accessible, the parent must confirm consent via PIN verification. The consent check happens in `useTutor` before any LLM call.
**When to use:** First time the child attempts to use the AI tutor.
**Example:**
```typescript
// In childProfileSlice.ts -- add to interface and defaults:
tutorConsentGranted: boolean;
setTutorConsentGranted: (granted: boolean) => void;

// In useTutor.ts -- consent gate before calling Gemini:
const tutorConsentGranted = useAppStore((s) => s.tutorConsentGranted);

const requestHint = useCallback(async () => {
  if (!tutorConsentGranted) {
    setTutorError('consent_required');
    return;
  }
  // ... existing logic
}, [tutorConsentGranted, /* other deps */]);
```

### Anti-Patterns to Avoid
- **Relying on system instruction alone for answer filtering:** The LLM can ignore instructions. Always use deterministic post-generation checks.
- **Sending child name or exact age to LLM "for context":** This violates COPPA. Use only age bracket (6-7, 7-8, 8-9).
- **Using LLM-as-judge for safety:** Adds latency, cost, and unreliability. Keep safety checks deterministic.
- **Skipping safety checks on cached/repeated responses:** Every response must pass through the full pipeline, even if seen before.
- **Storing consent in ephemeral state:** Consent must persist across app restarts. Use partialize + store migration.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gemini content filtering | Custom content classifier | `config.safetySettings` with `BLOCK_LOW_AND_ABOVE` | Google's trained classifiers are more accurate than anything custom |
| API-level safety blocking | Custom HTTP interceptor | Gemini SDK `SafetySetting` array | SDK handles all the request formatting and response parsing |
| Number word mapping | Complex NLP number parser | Static lookup table (0-1000) | Math problems for ages 6-9 have answers in a small range; static map is complete and deterministic |

**Key insight:** Safety filtering for a children's math app is a bounded problem. Answers are numeric (typically 0-200 range for ages 6-9). A static number-to-word lookup table + regex is more reliable than any ML-based approach.

## Common Pitfalls

### Pitfall 1: Gemini 2.5 Safety Filters Default to OFF
**What goes wrong:** Developer assumes Gemini has safety filtering by default. For Gemini 2.5+ models, the default threshold is OFF.
**Why it happens:** Older models (1.0, 1.5) had BLOCK_MEDIUM_AND_ABOVE by default. The 2.5 generation changed this.
**How to avoid:** Explicitly set `safetySettings` in every `generateContent` config. Make it a constant array, not optional.
**Warning signs:** Inappropriate content passing through without being blocked.

### Pitfall 2: Answer Leak via Number Words
**What goes wrong:** LLM says "you need seven more" when the answer is 7. Digit-only regex misses this.
**Why it happens:** LLMs naturally express numbers as words in conversational text.
**How to avoid:** Include number words (zero through one hundred at minimum) in the answer-leak detection. Also check indirect phrasing patterns like "equals seven", "makes seven", "is seven".
**Warning signs:** Children receiving responses that contain the answer spelled out as a word.

### Pitfall 3: Answer Leak via Mathematical Equivalence
**What goes wrong:** For "3 + 4 = ?", the LLM says "three plus four gives you a number between six and eight" -- effectively narrowing to the answer.
**Why it happens:** Socratic questioning can accidentally become too specific.
**How to avoid:** Check not just exact answer match but also ranges that effectively reveal it. For the MVP, catching exact digit and word matches covers the vast majority of cases. Log borderline responses for future pattern analysis.
**Warning signs:** Test cases where the LLM's "hint" is effectively a direct reveal.

### Pitfall 4: PII in System Instruction
**What goes wrong:** A well-meaning developer adds "The child's name is Emma and she is 7 years old" to the system instruction for personalization.
**Why it happens:** Natural desire to personalize the tutor experience.
**How to avoid:** The PII scrubber runs on outbound prompts as defense-in-depth. `PromptParams` type excludes name/age. System instruction uses only age bracket ("6-7 year old"), never exact age. Code review should flag any `childName` or `childAge` references in prompt-building code.
**Warning signs:** `childName` appearing anywhere in `promptTemplates.ts` or `safetyFilter.ts` imports.

### Pitfall 5: STORE_VERSION Bump Without Migration
**What goes wrong:** Adding `tutorConsentGranted` to partialize without a migration causes existing users to crash or lose data.
**Why it happens:** CLAUDE.md guardrail exists for this reason -- it is a common mistake.
**How to avoid:** Bump STORE_VERSION to 6. Add `if (version < 6)` migration block that defaults `tutorConsentGranted` to `false`. Existing users will be prompted for consent on next tutor access.
**Warning signs:** `STORE_VERSION` changed but no corresponding `if (version < N)` block in `migrations.ts`.

### Pitfall 6: Fallback Message Still Contains Answer Context
**What goes wrong:** Canned fallback says "The answer to 3 + 4 is... just kidding! Try again!" -- or similar phrasing that leaks context.
**Why it happens:** Canned messages written without careful review.
**How to avoid:** Canned fallbacks must be completely context-free. They should never reference the specific problem, numbers, or operation. Only generic encouragement.
**Warning signs:** Any canned fallback containing placeholders or template variables.

### Pitfall 7: Safety-Blocked Response Throws Instead of Falling Back
**What goes wrong:** When Gemini blocks a response due to safety settings, the SDK may return empty text or throw. If not handled, the child sees an error instead of a friendly fallback.
**Why it happens:** The `finishReason` may be `SAFETY` instead of `STOP`, and `response.text` may be `undefined`.
**How to avoid:** Check `response.candidates?.[0]?.finishReason` for `SAFETY`, `RECITATION`, or other non-STOP values. If detected, return a canned fallback instead of throwing.
**Warning signs:** Empty or undefined text from generateContent when safety filters trigger.

## Code Examples

### Gemini Client with Safety Settings
```typescript
// Modification to src/services/tutor/geminiClient.ts
import { GEMINI_SAFETY_SETTINGS } from './safetyConstants';

export async function callGemini(options: CallGeminiOptions): Promise<string> {
  const client = await getGeminiClient();
  // ... existing AbortController setup ...

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: options.userMessage,
      config: {
        systemInstruction: options.systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 200,
        safetySettings: GEMINI_SAFETY_SETTINGS, // NEW: explicit safety filters
      },
      // @ts-expect-error -- httpOptions.signal is supported at runtime
      httpOptions: { signal: combinedSignal },
    });

    // NEW: Check for safety-blocked response
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
      return null; // Signal to caller to use canned fallback
    }

    const text = response.text ?? '';
    const parsed = geminiResponseSchema.parse({ text });
    return parsed.text;
  } finally {
    clearTimeout(timeoutId);
    // ... existing cleanup ...
  }
}
```

### Enhanced System Instruction (LLM-03)
```typescript
// Modification to buildSystemInstruction in promptTemplates.ts
export function buildSystemInstruction(params: PromptParams): string {
  const wordLimit = WORD_LIMITS[params.ageBracket] ?? 10;

  return [
    'You are a friendly Math Helper for a child.',
    `Keep sentences under ${wordLimit} words.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent. Say things like "great try" not "you are smart".',
    `The child is working at the ${params.cpaStage} stage (CPA framework).`,

    // Safety rules -- reinforced and explicit
    'CRITICAL SAFETY RULES:',
    '1. NEVER reveal the answer as a digit or word.',
    '2. NEVER compute math for the child.',
    '3. NEVER say the result of any calculation.',
    '4. Ask guiding questions to help them discover the answer.',
    '5. Use only age-appropriate, simple words.',
    '6. Never use sarcasm, irony, or complex humor.',
    '7. Never discuss topics outside math.',
  ].join(' ');
}
```

### Safety Filter Types
```typescript
// src/services/tutor/safetyTypes.ts
export interface SafetyCheckResult {
  safe: boolean;
  reason: 'answer_digit_leak' | 'answer_word_leak' | 'answer_indirect_leak' | null;
}

export interface ContentValidationResult {
  valid: boolean;
  reason: 'too_many_sentences' | 'sentence_too_long' | 'vocabulary_too_complex' | null;
  complexWords?: string[];
}

export type SafetyPipelineResult =
  | { passed: true; text: string }
  | { passed: false; fallbackCategory: FallbackCategory; reason: string };
```

### Full Safety Pipeline Integration in useTutor
```typescript
// Modification to useTutor.ts requestHint callback
const requestHint = useCallback(async () => {
  // 0. Consent gate
  if (!tutorConsentGranted) {
    setTutorError('consent_required');
    return;
  }

  // 1. Guard: loading, no problem, rate limit (existing)
  // ...

  // 2. Build prompts (existing)
  const systemInstruction = buildSystemInstruction(promptParams);
  const hintPrompt = buildHintPrompt(promptParams);

  // 3. NEW: PII scrubbing (defense-in-depth)
  const scrubbed = scrubOutboundPii(
    systemInstruction,
    hintPrompt,
    childName,
    childAge,
  );

  try {
    // 4. Call Gemini (with safety settings now in config)
    const responseText = await callGemini({
      systemInstruction: scrubbed.systemInstruction,
      userMessage: scrubbed.userMessage,
      abortSignal: controller.signal,
    });

    // 5. NEW: Handle safety-blocked response
    if (responseText === null) {
      const fallback = getCannedFallback('safety_blocked');
      addTutorMessage({ /* fallback message */ });
      return;
    }

    // 6. NEW: Answer-leak detection
    const answerCheck = checkAnswerLeak(responseText, currentProblem.problem.correctAnswer);
    if (!answerCheck.safe) {
      const fallback = getCannedFallback('answer_leaked');
      addTutorMessage({ /* fallback message */ });
      return;
    }

    // 7. NEW: Content validation
    const contentCheck = validateContent(responseText, ageBracket);
    if (!contentCheck.valid) {
      const fallback = getCannedFallback('content_invalid');
      addTutorMessage({ /* fallback message */ });
      return;
    }

    // 8. Response passed all checks -- deliver to child
    addTutorMessage({ /* validated response */ });
    incrementCallCount();
    incrementHintLevel();
  } catch (err) {
    // 9. Existing error handling + NEW: categorized fallbacks
    if (isAbortError(err)) return;
    if (isTimeoutError(err)) {
      const fallback = getCannedFallback('timeout');
      addTutorMessage({ /* fallback message */ });
      return;
    }
    const fallback = getCannedFallback('error');
    addTutorMessage({ /* fallback message */ });
  }
}, [/* deps */]);
```

### Number Words Lookup Table
```typescript
// src/services/tutor/safetyConstants.ts
/** Maps numbers 0-200 to their English word form for answer-leak detection. */
export const NUMBER_WORDS: Record<number, string> = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
  5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
  10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
  15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
  20: 'twenty', 21: 'twenty-one', 22: 'twenty-two', // ... up to 200
  30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty',
  70: 'seventy', 80: 'eighty', 90: 'ninety', 100: 'one hundred',
  // Compound numbers use regex pattern: "twenty-one", "thirty-five", etc.
};

// For compound numbers not in the table, generate dynamically:
export function numberToWord(n: number): string | null {
  if (NUMBER_WORDS[n]) return NUMBER_WORDS[n];
  if (n < 0 || n > 200 || !Number.isInteger(n)) return null;
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  if (ones === 0) return NUMBER_WORDS[tens] ?? null;
  const tensWord = NUMBER_WORDS[tens];
  const onesWord = NUMBER_WORDS[ones];
  if (tensWord && onesWord) return `${tensWord}-${onesWord}`;
  return null;
}
```

### Store Migration for Consent Flag
```typescript
// In migrations.ts:
if (version < 6) {
  // v5 -> v6: Add parental consent flag for AI tutor
  state.tutorConsentGranted ??= false;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Gemini 1.5 defaulted to BLOCK_MEDIUM_AND_ABOVE | Gemini 2.5+ defaults to OFF | Gemini 2.5 release (2025) | Must explicitly configure safety settings |
| COPPA data minimization was best practice | COPPA 2025 amendments make it legal obligation | April 2025 FTC rule | Data minimization is now legally required, not optional |
| Single-layer LLM safety (system instruction) | Multi-layer: system instruction + API filters + post-gen deterministic checks | Industry standard 2024-2025 | Defense-in-depth is now the expected pattern |

**Deprecated/outdated:**
- Relying on system instruction alone for content safety: Model can be jailbroken or hallucinate past instructions
- COPPA pre-2025 rules: New amendments effective June 2025 with compliance deadline April 2026

## Open Questions

1. **Exact answer range for the number words table**
   - What we know: Ages 6-9, operations are addition, subtraction, multiplication (simple). Answers typically 0-200.
   - What's unclear: Whether any problem templates can produce answers >200.
   - Recommendation: Generate the number-to-word lookup for 0-200. Add a `numberToWord()` function for dynamic generation up to 999. Log any answers outside the table range in development.

2. **VPC consent flow UI**
   - What we know: SAFE-06 requires parental consent gate. The store flag and hook gate can be built now.
   - What's unclear: The exact UI for the consent flow (modal? separate screen? inline?).
   - Recommendation: Build the data layer (store flag, migration, consent check in useTutor) in this phase. The UI can be a simple modal with PIN verification. The exact design is Phase 23+ (Chat UI) concern, but the gate logic belongs here.

3. **Handling `response.text === undefined` vs empty string**
   - What we know: When safety filters block, `response.text` may be `undefined`. The Zod schema requires `min(1)`.
   - What's unclear: Exact behavior of `response.text` getter when all candidates are blocked.
   - Recommendation: Handle both `undefined` and empty string as safety-blocked. Check `finishReason` first if available, fall back to text-is-empty check.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo (React Native Testing Library) |
| Config file | `jest.config.js` (exists) |
| Quick run command | `npm test -- --testPathPattern=safety` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LLM-03 | System instruction includes all 7 safety rules; safetySettings has 4 categories with BLOCK_LOW_AND_ABOVE | unit | `npm test -- --testPathPattern=promptTemplates\|safetyConstants` | Partially (promptTemplates exists, safetyConstants is Wave 0) |
| SAFE-01 | checkAnswerLeak detects digit, word, and indirect answer leaks | unit | `npm test -- --testPathPattern=safetyFilter` | No - Wave 0 |
| SAFE-02 | scrubOutboundPii removes child name, specific age from prompts | unit | `npm test -- --testPathPattern=safetyFilter` | No - Wave 0 |
| SAFE-03 | GEMINI_SAFETY_SETTINGS has exactly 4 entries, all BLOCK_LOW_AND_ABOVE | unit | `npm test -- --testPathPattern=safetyConstants` | No - Wave 0 |
| SAFE-04 | validateContent rejects long sentences and complex vocabulary per bracket | unit | `npm test -- --testPathPattern=safetyFilter` | No - Wave 0 |
| SAFE-05 | getCannedFallback returns valid strings for all 6 categories | unit | `npm test -- --testPathPattern=safetyConstants` | No - Wave 0 |
| SAFE-06 | useTutor blocks requestHint when tutorConsentGranted is false | unit | `npm test -- --testPathPattern=useTutor` | Partially (useTutor test structure exists from Phase 21) |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=safety`
- **Per wave merge:** `npm test && npm run typecheck`
- **Phase gate:** Full suite green + typecheck clean before verify

### Wave 0 Gaps
- [ ] `src/services/tutor/__tests__/safetyFilter.test.ts` -- covers SAFE-01, SAFE-02, SAFE-04
- [ ] `src/services/tutor/__tests__/safetyConstants.test.ts` -- covers LLM-03 (safety settings), SAFE-03, SAFE-05
- [ ] Update `src/services/tutor/__tests__/promptTemplates.test.ts` -- covers LLM-03 (system instruction rules)
- [ ] Update `src/services/tutor/__tests__/geminiClient.test.ts` -- covers safety settings in generateContent config
- [ ] `src/store/slices/__tests__/childProfileSlice.test.ts` (if not exists) -- covers SAFE-06 consent flag
- [ ] `src/store/__tests__/migrations.test.ts` (if not exists) -- covers v5->v6 migration
- [ ] Update `src/hooks/__tests__/useTutor.test.ts` -- covers SAFE-06 consent gate, safety pipeline integration

## Sources

### Primary (HIGH confidence)
- `@google/genai` v1.30.0 `genai.d.ts` type definitions -- verified `HarmCategory`, `HarmBlockThreshold`, `SafetySetting` interfaces, `FinishReason.SAFETY`, `BlockedReason.SAFETY` enums
- Project codebase: `geminiClient.ts`, `promptTemplates.ts`, `types.ts`, `useTutor.ts`, `appStore.ts`, `migrations.ts` -- established patterns, existing code to modify
- [Gemini API Safety Settings docs](https://ai.google.dev/gemini-api/docs/safety-settings) -- confirmed BLOCK_LOW_AND_ABOVE threshold, 4 harm categories, Gemini 2.5 defaults to OFF
- CLAUDE.md -- project guardrails (SecureStore for sensitive data, Zod at boundaries, store version + migration rule)

### Secondary (MEDIUM confidence)
- [COPPA Compliance in 2025 guide](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/) -- VPC methods, data minimization requirements
- [FTC COPPA Rule changes](https://www.dataprotectionreport.com/2025/06/ftcs-coppa-rule-changes-include-ai-training-consent-requirement/) -- AI training consent requirement, compliance deadline April 2026
- [Gemini by Example - Safety Filters](https://geminibyexample.com/032-safety-filters/) -- code examples for safety settings configuration
- [LLM Safety Layers - RisingStack](https://blog.risingstack.com/llm-safety-layers/) -- defense-in-depth pattern for LLM output filtering

### Tertiary (LOW confidence)
- Number-to-word coverage range (0-200) -- based on curriculum analysis assumption, should be verified against problem template output ranges
- Word length as vocabulary complexity proxy -- heuristic assumption (>8 chars = complex for 6-7 year olds), may need tuning

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all types verified from installed SDK
- Architecture: HIGH -- follows established service/pure-function patterns, builds on Phase 21 code
- Safety filter design: HIGH -- deterministic regex approach is well-understood, bounded problem domain
- COPPA compliance: MEDIUM -- legal requirements verified from official sources, but VPC implementation specifics (exact UI flow) have multiple valid approaches
- Pitfalls: HIGH -- verified Gemini 2.5 safety-off default from official docs, store migration pattern well-established

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days -- safety filter patterns are stable; COPPA rules have April 2026 compliance deadline)
