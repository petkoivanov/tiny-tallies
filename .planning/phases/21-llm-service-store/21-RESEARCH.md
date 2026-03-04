# Phase 21: LLM Service & Store - Research

**Researched:** 2026-03-04
**Domain:** Gemini LLM integration, Zustand ephemeral state, prompt engineering for children's math tutoring
**Confidence:** HIGH

## Summary

This phase builds the foundational LLM service layer: a singleton Gemini client reading API keys from expo-secure-store, pure-function prompt templates parameterized by age/CPA/problem context, an AbortController-based call with 8-second timeout, a rate limiter (3/problem, 20/session, 50/day), and an ephemeral tutorSlice in Zustand. No UI is delivered -- that is Phase 23.

The project already has `@google/genai` v1.30.0 installed. The `GoogleGenAI` class exposes `models.generateContent()` for non-streaming calls. The `expo-secure-store` v15.0.7 and `zod` v4.1.13 are also already present. The Zustand v5.0.8 slice composition pattern is well-established with 5 existing slices. The tutorSlice is ephemeral (excluded from `partialize`) so no store migration or version bump is needed.

**Primary recommendation:** Follow the existing service/slice/hook layering exactly. Create `src/services/tutor/` for Gemini client, prompt templates, and rate limiter. Create `src/store/slices/tutorSlice.ts` for ephemeral state. Create `src/hooks/useTutor.ts` to compose them.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
No explicitly locked decisions -- all gray areas delegated to Claude's discretion with the following research-backed defaults:

- Model: `gemini-2.5-flash` (not configurable)
- Temperature: 0.7, max output tokens: 200, thinking disabled
- API key from expo-secure-store at key `gemini-api-key`
- Rate limits: 3/problem, 20/session, 50/day as configurable constants
- Tutor personality: "Math Helper", warm/encouraging, growth mindset, effort praise only
- Age-bracket-adjusted sentence length (8 words for 6-7, 10 for 7-8, 12 for 8-9)
- No gendered character or avatar -- text-only persona in system instruction

### Claude's Discretion
All implementation details delegated to Claude. Use research-backed defaults per CONTEXT.md.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LLM-01 | Gemini client singleton with lazy initialization and API key from expo-secure-store | GoogleGenAI constructor pattern, lazy init via module-level variable, getItemAsync for key retrieval |
| LLM-02 | Prompt templates as pure functions parameterized by child age, CPA stage, and problem context | Pure functions in `src/services/tutor/promptTemplates.ts`, typed interfaces for template params |
| LLM-04 | Non-streaming Gemini API call with AbortController and 8-second timeout | `models.generateContent()` accepts `abortSignal` in httpOptions; AbortController with setTimeout for 8s |
| LLM-05 | Rate limiting (max 3 calls/problem, 20/session, 50/day configurable) | In-memory counters in tutorSlice, checked before each call, child-friendly limit messages |
| STATE-01 | Ephemeral tutorSlice in Zustand (not persisted, no migration needed) | Slice added to AppState type union and composition but excluded from partialize -- STORE_VERSION stays at 5 |
| STATE-02 | Chat messages, tutor mode, hint level, loading/error state in tutorSlice | TutorMessage[], TutorMode enum, hintLevel counter, loading boolean, error string/null |
| STATE-03 | Tutor reads from skill/session state but never writes to it | useTutor hook reads useAppStore selectors; tutorSlice actions only write to tutor state |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | ^1.30.0 (upgrade to latest recommended) | Gemini API client | Already in dependencies; official Google SDK |
| `expo-secure-store` | ^15.0.7 | API key storage | Already in dependencies; CLAUDE.md mandates for sensitive data |
| `zod` | ^4.1.13 | Response validation | Already in dependencies; CLAUDE.md mandates at system boundaries |
| `zustand` | ^5.0.8 | Ephemeral tutor state | Already the project state manager; slice pattern established |
| `@react-native-community/netinfo` | ^11.4.1 | Offline detection (prep for Phase 23) | Already in dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None needed | - | - | All dependencies already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@google/genai` | REST fetch to Gemini API | SDK handles auth, retries, types; no reason to hand-roll |
| In-slice rate limiter | Separate rate-limit service | Slice is simpler; rate state is ephemeral anyway |

**Installation:**
```bash
# No new dependencies needed. Optionally upgrade genai:
npm install @google/genai@latest
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  services/
    tutor/
      index.ts              # barrel export
      types.ts              # TutorMessage, TutorMode, PromptParams, GeminiResponse
      geminiClient.ts       # singleton client, lazy init, API key from secure-store
      promptTemplates.ts    # pure functions for HINT/TEACH/BOOST system & user prompts
      rateLimiter.ts        # pure functions: checkLimit, incrementCount, getLimitMessage
  store/
    slices/
      tutorSlice.ts         # ephemeral slice: messages, mode, hintLevel, loading, error, rate counts
    appStore.ts             # add TutorSlice to AppState union + composition (NOT to partialize)
  hooks/
    useTutor.ts             # composes geminiClient + tutorSlice + reads session/skill state
```

### Pattern 1: Lazy Singleton Gemini Client
**What:** Module-level variable initialized on first call, not at import time. Returns the client or throws a descriptive error if API key is missing.
**When to use:** Every LLM call goes through this singleton.
**Example:**
```typescript
// src/services/tutor/geminiClient.ts
import { GoogleGenAI } from '@google/genai';
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORE_KEY = 'gemini-api-key';

let clientInstance: GoogleGenAI | null = null;

export async function getGeminiClient(): Promise<GoogleGenAI> {
  if (clientInstance) return clientInstance;

  const apiKey = await SecureStore.getItemAsync(API_KEY_STORE_KEY);
  if (!apiKey) {
    throw new Error(
      'Gemini API key not found. Set it in secure store with key "gemini-api-key".'
    );
  }

  clientInstance = new GoogleGenAI({ apiKey });
  return clientInstance;
}

/** Reset client (for testing or key rotation). */
export function resetGeminiClient(): void {
  clientInstance = null;
}
```

### Pattern 2: Prompt Templates as Pure Functions
**What:** Each tutor mode (HINT, TEACH, BOOST) has a pure function that takes typed params and returns prompt strings. No side effects, fully testable.
**When to use:** Before every Gemini call.
**Example:**
```typescript
// src/services/tutor/promptTemplates.ts
import type { PromptParams } from './types';

export function buildSystemInstruction(params: PromptParams): string {
  const maxWords = params.ageBracket === '6-7' ? 8 : params.ageBracket === '7-8' ? 10 : 12;
  return [
    'You are Math Helper, a warm and encouraging math tutor for children.',
    `The child is ${params.ageBracket} years old.`,
    `Keep sentences under ${maxWords} words.`,
    'Use growth mindset language. Praise effort, not ability.',
    'NEVER reveal the answer. Ask guiding questions only.',
    'NEVER compute math. Only explain concepts.',
    `The child is learning at the ${params.cpaStage} stage.`,
  ].join(' ');
}

export function buildHintPrompt(params: PromptParams): string {
  // Pure function returning user message content
  const { problemText, operation, wrongAnswer, bugDescription } = params;
  let prompt = `The child is working on: ${problemText} (${operation}).`;
  if (wrongAnswer !== undefined) {
    prompt += ` They answered ${wrongAnswer}, which is wrong.`;
  }
  if (bugDescription) {
    prompt += ` This may indicate: ${bugDescription}.`;
  }
  prompt += ' Give a Socratic hint without revealing the answer.';
  return prompt;
}
```

### Pattern 3: AbortController + Timeout for LLM Calls
**What:** Every Gemini call gets an AbortController. A setTimeout aborts after 8 seconds. Cleanup on both success and unmount.
**When to use:** The `callGemini` service function wraps this pattern.
**Example:**
```typescript
// src/services/tutor/geminiClient.ts (continued)
import { z } from 'zod';

const TIMEOUT_MS = 8000;
const MODEL = 'gemini-2.5-flash';

const geminiResponseSchema = z.object({
  text: z.string().min(1),
});

export interface CallGeminiOptions {
  systemInstruction: string;
  userMessage: string;
  abortSignal?: AbortSignal;
}

export async function callGemini(options: CallGeminiOptions): Promise<string> {
  const client = await getGeminiClient();

  // Create internal abort controller for timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

  // Combine external signal (from hook cleanup) with timeout signal
  const combinedSignal = options.abortSignal
    ? AbortSignal.any([options.abortSignal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: options.userMessage,
      config: {
        systemInstruction: options.systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 200,
        // thinkingConfig not set = thinking disabled by default
      },
      // @google/genai supports httpOptions.signal for abort
      httpOptions: { signal: combinedSignal },
    });

    const text = response.text ?? '';
    // Validate at system boundary per CLAUDE.md
    const parsed = geminiResponseSchema.parse({ text });
    return parsed.text;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Pattern 4: Ephemeral Zustand Slice (No Persistence)
**What:** tutorSlice follows identical StateCreator pattern but is excluded from partialize in appStore.ts. STORE_VERSION stays at 5.
**When to use:** The single pattern for all tutor state.
**Example:**
```typescript
// src/store/slices/tutorSlice.ts
import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';

export type TutorMode = 'hint' | 'teach' | 'boost';

export interface TutorMessage {
  id: string;
  role: 'tutor' | 'child';
  text: string;
  timestamp: number;
}

export interface TutorSlice {
  // Chat state
  tutorMessages: TutorMessage[];
  tutorMode: TutorMode;
  hintLevel: number;
  tutorLoading: boolean;
  tutorError: string | null;

  // Rate limiting counters
  problemCallCount: number;
  sessionCallCount: number;
  dailyCallCount: number;
  dailyCountDate: string; // ISO date for daily reset check

  // Actions
  addTutorMessage: (message: TutorMessage) => void;
  setTutorMode: (mode: TutorMode) => void;
  incrementHintLevel: () => void;
  setTutorLoading: (loading: boolean) => void;
  setTutorError: (error: string | null) => void;
  resetProblemTutor: () => void;
  resetSessionTutor: () => void;
  incrementCallCount: () => void;
}

export const createTutorSlice: StateCreator<
  AppState,
  [],
  [],
  TutorSlice
> = (set, get) => ({
  tutorMessages: [],
  tutorMode: 'hint',
  hintLevel: 0,
  tutorLoading: false,
  tutorError: null,
  problemCallCount: 0,
  sessionCallCount: 0,
  dailyCallCount: 0,
  dailyCountDate: new Date().toISOString().slice(0, 10),

  addTutorMessage: (message) =>
    set((state) => ({ tutorMessages: [...state.tutorMessages, message] })),
  setTutorMode: (mode) => set({ tutorMode: mode }),
  incrementHintLevel: () =>
    set((state) => ({ hintLevel: state.hintLevel + 1 })),
  setTutorLoading: (loading) => set({ tutorLoading: loading }),
  setTutorError: (error) => set({ tutorError: error }),
  resetProblemTutor: () =>
    set({ tutorMessages: [], tutorMode: 'hint', hintLevel: 0, tutorError: null, problemCallCount: 0 }),
  resetSessionTutor: () =>
    set({ tutorMessages: [], tutorMode: 'hint', hintLevel: 0, tutorError: null, problemCallCount: 0, sessionCallCount: 0 }),
  incrementCallCount: () =>
    set((state) => {
      const today = new Date().toISOString().slice(0, 10);
      const dailyReset = today !== state.dailyCountDate;
      return {
        problemCallCount: state.problemCallCount + 1,
        sessionCallCount: state.sessionCallCount + 1,
        dailyCallCount: dailyReset ? 1 : state.dailyCallCount + 1,
        dailyCountDate: today,
      };
    }),
});
```

### Pattern 5: appStore.ts Integration (Ephemeral Slice)
**What:** Add TutorSlice to AppState union and spread in create(), but do NOT add any tutorSlice fields to partialize.
**Example:**
```typescript
// In appStore.ts -- changes only:
import { type TutorSlice, createTutorSlice } from './slices/tutorSlice';

export type AppState = ChildProfileSlice &
  SkillStatesSlice &
  SessionStateSlice &
  GamificationSlice &
  SandboxSlice &
  TutorSlice;  // Added

// In create():
  (...a) => ({
    ...createChildProfileSlice(...a),
    ...createSkillStatesSlice(...a),
    ...createSessionStateSlice(...a),
    ...createGamificationSlice(...a),
    ...createSandboxSlice(...a),
    ...createTutorSlice(...a),  // Added
  }),

// partialize: UNCHANGED -- no tutor fields added
```

### Anti-Patterns to Avoid
- **Writing to session/skill state from tutor:** tutorSlice is read-only consumer of session/skill state. STATE-03 explicitly forbids writes.
- **Eager client initialization:** Don't create GoogleGenAI at import time. The API key is async from secure store.
- **Inline prompt strings:** All prompts must be in promptTemplates.ts as pure functions for testability and consistency.
- **Persisting tutor state:** tutorSlice MUST be excluded from partialize. No STORE_VERSION bump.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gemini API calls | Custom HTTP fetch wrapper | `@google/genai` GoogleGenAI SDK | Handles auth headers, content formatting, error types |
| API key storage | AsyncStorage or env vars | `expo-secure-store` | CLAUDE.md guardrail: sensitive data must use secure store |
| Response validation | Manual type checks | `zod` schemas | CLAUDE.md mandates Zod at system boundaries; catches malformed LLM output |
| Abort signal combining | Manual event listener wiring | `AbortSignal.any()` | Standard API, cleaner than manual combination |

**Key insight:** The `@google/genai` SDK handles content formatting, safety settings, and error types. The service layer wraps it with timeout, validation, and rate limiting -- don't duplicate SDK responsibilities.

## Common Pitfalls

### Pitfall 1: AbortSignal.any() Compatibility
**What goes wrong:** `AbortSignal.any()` is relatively new (ES2024). Hermes engine support needs verification.
**Why it happens:** Hermes may lag behind V8 on newer APIs.
**How to avoid:** If `AbortSignal.any()` is unavailable, implement a manual combiner: listen to the external signal and call `timeoutController.abort()`. Test on device early.
**Warning signs:** Runtime error "AbortSignal.any is not a function".

### Pitfall 2: API Key Not Found on First Launch
**What goes wrong:** `getItemAsync` returns null before the parent sets the key in onboarding (future phase).
**Why it happens:** No onboarding flow exists yet to provision the key.
**How to avoid:** `getGeminiClient()` throws a descriptive error. The `useTutor` hook catches this and sets `tutorError` with a user-friendly message. Never crash.
**Warning signs:** Unhandled promise rejection on first tutor interaction.

### Pitfall 3: Daily Counter Reset on App Restart
**What goes wrong:** Since tutorSlice is ephemeral, dailyCallCount resets when the app restarts, allowing more than 50 calls/day.
**Why it happens:** Ephemeral state does not persist.
**How to avoid:** Store `dailyCountDate` and `dailyCallCount` in the slice, but compare against `new Date()` on each call. For true enforcement, consider a lightweight AsyncStorage key (just `{ date, count }`), but per CONTEXT.md this is acceptable -- the rate limit is a soft guardrail, not a hard billing control.
**Warning signs:** If daily limit is critical, the ephemeral approach will under-count on restarts.

### Pitfall 4: Prompt Templates Leaking Answers
**What goes wrong:** The prompt includes the correct answer in the context, and the LLM echoes it.
**Why it happens:** Developer passes `correctAnswer` to the template for "context."
**How to avoid:** NEVER include `correctAnswer` in any prompt template. Only pass: problem text, operation type, child's wrong answer (if any), bug description. The system instruction explicitly says "NEVER reveal the answer."
**Warning signs:** LLM responses containing the numeric answer.

### Pitfall 5: Zustand Slice Type Mismatch
**What goes wrong:** Adding TutorSlice to AppState breaks type inference if StateCreator generic is wrong.
**Why it happens:** Zustand v5 with persist middleware has specific generic requirements.
**How to avoid:** Follow the exact `StateCreator<AppState, [], [], TutorSlice>` pattern used by all existing slices (sessionStateSlice, etc.).
**Warning signs:** TypeScript errors in appStore.ts after adding the slice.

## Code Examples

### Rate Limiter Pure Functions
```typescript
// src/services/tutor/rateLimiter.ts
export const RATE_LIMITS = {
  perProblem: 3,
  perSession: 20,
  perDay: 50,
} as const;

export interface RateState {
  problemCallCount: number;
  sessionCallCount: number;
  dailyCallCount: number;
}

export type RateLimitKind = 'problem' | 'session' | 'daily' | null;

export function checkRateLimit(state: RateState): RateLimitKind {
  if (state.problemCallCount >= RATE_LIMITS.perProblem) return 'problem';
  if (state.sessionCallCount >= RATE_LIMITS.perSession) return 'session';
  if (state.dailyCallCount >= RATE_LIMITS.perDay) return 'daily';
  return null;
}

export function getRateLimitMessage(kind: RateLimitKind): string {
  switch (kind) {
    case 'problem':
      return "You've been working hard on this one! Try your best -- you can do it!";
    case 'session':
      return "Great effort today! Try solving the rest on your own -- I believe in you!";
    case 'daily':
      return "You've had a great practice day! Come back tomorrow for more help.";
    default:
      return '';
  }
}
```

### Zod Response Validation
```typescript
// src/services/tutor/types.ts
import { z } from 'zod';

export const geminiResponseSchema = z.object({
  text: z.string().min(1).max(1000),
});

export type GeminiResponse = z.infer<typeof geminiResponseSchema>;

export type TutorMode = 'hint' | 'teach' | 'boost';
export type AgeBracket = '6-7' | '7-8' | '8-9';

export interface PromptParams {
  ageBracket: AgeBracket;
  cpaStage: 'concrete' | 'pictorial' | 'abstract';
  problemText: string;
  operation: string;
  wrongAnswer?: number;
  bugDescription?: string;
  tutorMode: TutorMode;
  hintLevel: number;
}

export interface TutorMessage {
  id: string;
  role: 'tutor' | 'child';
  text: string;
  timestamp: number;
}
```

### useTutor Hook Skeleton
```typescript
// src/hooks/useTutor.ts
import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { callGemini } from '../services/tutor/geminiClient';
import { buildSystemInstruction, buildHintPrompt } from '../services/tutor/promptTemplates';
import { checkRateLimit, getRateLimitMessage } from '../services/tutor/rateLimiter';

export function useTutor() {
  const abortRef = useRef<AbortController | null>(null);

  // Read from tutor slice
  const messages = useAppStore((s) => s.tutorMessages);
  const loading = useAppStore((s) => s.tutorLoading);
  const error = useAppStore((s) => s.tutorError);
  const tutorMode = useAppStore((s) => s.tutorMode);

  // Read from session/skill state (READ ONLY)
  const childAge = useAppStore((s) => s.childAge);
  // ... other reads

  // Tutor actions
  const addMessage = useAppStore((s) => s.addTutorMessage);
  const setLoading = useAppStore((s) => s.setTutorLoading);
  const setError = useAppStore((s) => s.setTutorError);
  const incrementCallCount = useAppStore((s) => s.incrementCallCount);

  // Cleanup on unmount (defense-in-depth)
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const requestHint = useCallback(async (/* params */) => {
    // 1. Check rate limit
    // 2. Create AbortController
    // 3. Set loading
    // 4. Call callGemini with abort signal
    // 5. Add response as tutor message
    // 6. Increment call count
    // 7. Handle errors (abort, timeout, API error, validation)
  }, [/* deps */]);

  return { messages, loading, error, tutorMode, requestHint };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@google/generative-ai` | `@google/genai` | 2025 | New unified SDK; different import paths and API surface |
| `model.generateContent()` | `client.models.generateContent()` | `@google/genai` v1.x | Access via `client.models` not model instances |
| Manual AbortController wiring | `httpOptions.signal` in genai SDK | `@google/genai` v1.x | SDK natively supports abort signals |

**Deprecated/outdated:**
- `@google/generative-ai` package: Replaced by `@google/genai`. This project correctly uses the new package.
- `getGenerativeModel()`: Old SDK pattern. New SDK uses `client.models.generateContent({ model: 'model-name', ... })`.

## Open Questions

1. **AbortSignal.any() in Hermes**
   - What we know: It is an ES2024 feature. React Native 0.81 uses Hermes.
   - What's unclear: Whether Hermes in RN 0.81 supports AbortSignal.any().
   - Recommendation: Implement with AbortSignal.any() first. If it fails at runtime, fall back to a manual combiner pattern (listen to external signal, forward abort to timeout controller). Add a unit test that exercises the abort path.

2. **@google/genai httpOptions.signal support**
   - What we know: The SDK has `httpOptions` parameter. The `generateContent` method is present on `client.models`.
   - What's unclear: Whether `httpOptions.signal` is fully wired in the installed v1.30.0.
   - Recommendation: Verify with a quick test during implementation. If not supported, wrap the `generateContent` promise with `Promise.race` against an abort-driven rejection. Upgrading to latest is recommended.

3. **Gemini 2.5 Flash model identifier**
   - What we know: CONTEXT.md specifies `gemini-2.5-flash`.
   - What's unclear: The exact model string the API expects (could be `gemini-2.5-flash`, `gemini-2.5-flash-preview-04-17`, etc.).
   - Recommendation: Use `gemini-2.5-flash` as the model string. The API resolves aliases to the latest stable version. If it fails, check the API error for the correct identifier.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo (React Native Testing Library) |
| Config file | `jest.config.js` (exists) |
| Quick run command | `npm test -- --testPathPattern=tutor` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LLM-01 | Gemini client lazy init, key from secure store, error on missing key | unit | `npm test -- --testPathPattern=geminiClient` | No - Wave 0 |
| LLM-02 | Prompt templates produce correct strings for age/CPA/problem combos | unit | `npm test -- --testPathPattern=promptTemplates` | No - Wave 0 |
| LLM-04 | callGemini aborts on external signal and 8s timeout | unit | `npm test -- --testPathPattern=geminiClient` | No - Wave 0 |
| LLM-05 | Rate limiter blocks at 3/problem, 20/session, 50/day thresholds | unit | `npm test -- --testPathPattern=rateLimiter` | No - Wave 0 |
| STATE-01 | tutorSlice is ephemeral, not in partialize, no version bump | unit | `npm test -- --testPathPattern=tutorSlice` | No - Wave 0 |
| STATE-02 | Slice holds messages, mode, hintLevel, loading, error | unit | `npm test -- --testPathPattern=tutorSlice` | No - Wave 0 |
| STATE-03 | Tutor reads session/skill state, never writes to it | unit | `npm test -- --testPathPattern=useTutor` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=tutor`
- **Per wave merge:** `npm test && npm run typecheck`
- **Phase gate:** Full suite green + typecheck clean before verify

### Wave 0 Gaps
- [ ] `src/services/tutor/__tests__/geminiClient.test.ts` -- covers LLM-01, LLM-04
- [ ] `src/services/tutor/__tests__/promptTemplates.test.ts` -- covers LLM-02
- [ ] `src/services/tutor/__tests__/rateLimiter.test.ts` -- covers LLM-05
- [ ] `src/store/slices/__tests__/tutorSlice.test.ts` -- covers STATE-01, STATE-02
- [ ] `src/hooks/__tests__/useTutor.test.ts` -- covers STATE-03
- [ ] Mock for `@google/genai` (jest manual mock or inline mock)
- [ ] Mock for `expo-secure-store` (jest manual mock)

## Sources

### Primary (HIGH confidence)
- Project codebase: `appStore.ts`, `sessionStateSlice.ts`, `useSession.ts`, `useCpaMode.ts` -- established patterns
- `package.json` -- verified dependency versions
- `@google/genai` runtime introspection -- verified API surface (GoogleGenAI, models.generateContent)
- CLAUDE.md -- project guardrails and conventions

### Secondary (MEDIUM confidence)
- `@google/genai` SDK API surface (verified via runtime `Object.keys` inspection of installed v1.30.0)
- CONTEXT.md -- user decisions and parameter choices

### Tertiary (LOW confidence)
- `AbortSignal.any()` support in Hermes -- needs runtime verification
- `httpOptions.signal` wiring in genai SDK v1.30.0 -- needs runtime verification
- `gemini-2.5-flash` exact model string -- needs API verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed, versions confirmed from package.json
- Architecture: HIGH -- follows established slice/service/hook patterns from 5 existing slices
- Pitfalls: MEDIUM -- AbortSignal.any() and httpOptions.signal need runtime verification
- Code examples: HIGH -- based on actual project patterns and SDK introspection

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days -- stable stack, no breaking changes expected)
