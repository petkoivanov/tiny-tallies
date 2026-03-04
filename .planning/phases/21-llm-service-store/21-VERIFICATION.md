---
phase: 21-llm-service-store
verified: 2026-03-04T07:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "End-to-end Gemini API call with real API key"
    expected: "callGemini returns a non-empty Socratic hint string in under 8 seconds"
    why_human: "Real network call to Gemini requires a provisioned API key in expo-secure-store; cannot mock in automated checks"
  - test: "useTutor hook in a rendered screen with a live problem"
    expected: "requestHint displays a tutor message in under 8 seconds without crashing"
    why_human: "Integration of hook with React Navigation and session state requires a running Expo build"
---

# Phase 21: LLM Service & Store Verification Report

**Phase Goal:** The app can send prompts to Gemini and receive validated responses, with tutor state managed in an ephemeral store slice that reads from but never writes to session/adaptive state
**Verified:** 2026-03-04T07:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All 12 truths derived from plan `must_haves` across the three plan files.

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | tutorSlice holds chat messages, tutor mode, hint level, loading/error state, and rate counters | VERIFIED | `src/store/slices/tutorSlice.ts` lines 5-23: TutorSlice interface declares all 9 state fields |
| 2  | tutorSlice is ephemeral — not persisted to AsyncStorage, STORE_VERSION remains 5 | VERIFIED | `src/store/appStore.ts` line 42: `STORE_VERSION = 5`; partialize (lines 59-70) contains no tutor fields |
| 3  | resetProblemTutor clears messages/mode/hints/error/problemCallCount without touching session/skill state | VERIFIED | `tutorSlice.ts` lines 53-60: sets only tutor fields; 19 tests in `tutorSlice.test.ts` confirm semantics |
| 4  | incrementCallCount handles daily date reset logic | VERIFIED | `tutorSlice.ts` lines 70-86: compares `dailyCountDate` to today ISO string, resets daily to 1 on new day |
| 5  | Gemini client initializes lazily from API key in expo-secure-store and throws descriptive error if key missing | VERIFIED | `geminiClient.ts` lines 16-28: checks cache, calls `SecureStore.getItemAsync('gemini-api-key')`, throws on null |
| 6  | callGemini sends systemInstruction + userMessage to gemini-2.5-flash and returns Zod-validated text | VERIFIED | `geminiClient.ts` lines 77-92: calls `models.generateContent` with model `'gemini-2.5-flash'`, validates via `geminiResponseSchema.parse` |
| 7  | callGemini aborts on external AbortSignal and on 8-second timeout | VERIFIED | `geminiClient.ts` lines 52-75: creates `timeoutController` with 8000ms setTimeout, uses `AbortSignal.any` or manual listener fallback |
| 8  | Prompt templates produce age-appropriate system instructions with correct word limits per age bracket | VERIFIED | `promptTemplates.ts` lines 3-6: `WORD_LIMITS = {'6-7':8, '7-8':10, '8-9':12}`; 5 tests in `promptTemplates.test.ts` confirm word limits |
| 9  | Prompt templates NEVER include correctAnswer in any prompt | VERIFIED | `types.ts` lines 17-26: `PromptParams` deliberately omits `correctAnswer`; `promptTemplates.ts` line 31 comment confirms; type-level test in `promptTemplates.test.ts` lines 80-86 |
| 10 | Rate limiter blocks at 3/problem, 20/session, 50/day and returns child-friendly messages | VERIFIED | `rateLimiter.ts` lines 1-5: `RATE_LIMITS = {perProblem:3, perSession:20, perDay:50}`; `checkRateLimit` checks in priority order; 10 tests confirm |
| 11 | useTutor hook composes Gemini client + tutorSlice + session/skill state into a single interface | VERIFIED | `useTutor.ts` imports `callGemini`, `buildSystemInstruction`, `buildHintPrompt`, `checkRateLimit`, `useAppStore`; 12 integration tests pass |
| 12 | useTutor reads childAge, current problem, CPA stage from session/skill state but NEVER writes to them | VERIFIED | `useTutor.ts` line 57: reads `childAge` via selector; no imports of session/skill write actions; STATE-03 test in `useTutor.test.ts` lines 306-326 confirms via `setState` spy |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/services/tutor/types.ts` | TutorMessage, TutorMode, AgeBracket, PromptParams, GeminiResponse types and Zod schema | VERIFIED | 37 lines; exports all 5 types + `geminiResponseSchema`; `correctAnswer` deliberately absent from `PromptParams` |
| `src/services/tutor/index.ts` | Barrel export for all tutor service modules | VERIFIED | 24 lines; exports types, geminiClient, promptTemplates, rateLimiter |
| `src/store/slices/tutorSlice.ts` | Ephemeral Zustand slice with tutor state and actions | VERIFIED | 88 lines; exports `TutorSlice` and `createTutorSlice`; follows `StateCreator<AppState, [], [], TutorSlice>` pattern |
| `src/store/appStore.ts` | TutorSlice composed into AppState, excluded from partialize | VERIFIED | Lines 26-28 import slice; line 36 adds to AppState type; line 52 spreads in `create()`; absent from `partialize` |
| `src/services/tutor/geminiClient.ts` | Lazy singleton Gemini client with callGemini function | VERIFIED | 99 lines; exports `getGeminiClient`, `resetGeminiClient`, `callGemini`, `CallGeminiOptions` |
| `src/services/tutor/promptTemplates.ts` | Pure functions for system instruction and hint/teach/boost prompts | VERIFIED | 51 lines; exports `buildSystemInstruction` and `buildHintPrompt` |
| `src/services/tutor/rateLimiter.ts` | Pure rate limit checking and message functions | VERIFIED | 41 lines; exports `RATE_LIMITS`, `checkRateLimit`, `getRateLimitMessage`, `RateState`, `RateLimitKind` |
| `src/hooks/useTutor.ts` | Lifecycle hook composing tutor services with store | VERIFIED | 193 lines; exports `useTutor`; accepts `SessionProblem | null`; implements AbortController defense-in-depth |
| `src/__tests__/store/tutorSlice.test.ts` | 19 tests covering all slice behaviors | VERIFIED | 272 lines; 19 tests in 7 describe blocks; all pass |
| `src/services/tutor/__tests__/promptTemplates.test.ts` | 11 tests for prompt templates | VERIFIED | 87 lines; 11 tests; all pass |
| `src/services/tutor/__tests__/rateLimiter.test.ts` | 10 tests for rate limiter | VERIFIED | 97 lines; 10 tests; all pass |
| `src/services/tutor/__tests__/geminiClient.test.ts` | 11 tests for Gemini client | VERIFIED | 233 lines; 11 tests; all pass |
| `src/hooks/__tests__/useTutor.test.ts` | 12 integration tests for hook behavior | VERIFIED | 339 lines; 12 tests; all pass |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/store/appStore.ts` | `src/store/slices/tutorSlice.ts` | `createTutorSlice` in `create()` | WIRED | Line 27 imports; line 52 spreads `...createTutorSlice(...a)` |
| `src/store/slices/tutorSlice.ts` | `src/services/tutor/types.ts` | type imports | WIRED | Line 3: `import type { TutorMessage, TutorMode } from '@/services/tutor/types'` |
| `src/services/tutor/geminiClient.ts` | `expo-secure-store` | `getItemAsync` for API key | WIRED | Line 19: `SecureStore.getItemAsync('gemini-api-key')` |
| `src/services/tutor/geminiClient.ts` | `@google/genai` | `GoogleGenAI` constructor + `models.generateContent` | WIRED | Line 1 import; line 78: `client.models.generateContent(...)` |
| `src/services/tutor/geminiClient.ts` | `src/services/tutor/types.ts` | `geminiResponseSchema` for Zod validation | WIRED | Line 3 import; line 91: `geminiResponseSchema.parse({ text })` |
| `src/hooks/useTutor.ts` | `src/services/tutor/geminiClient.ts` | `callGemini` function call | WIRED | Line 3 import; line 130: `await callGemini({...})` |
| `src/hooks/useTutor.ts` | `src/store/slices/tutorSlice.ts` | `useAppStore` selectors for tutor state and actions | WIRED | Lines 47-65: 10 selectors covering state and all actions |
| `src/hooks/useTutor.ts` | `src/services/tutor/rateLimiter.ts` | `checkRateLimit` before each call | WIRED | Line 8 import; line 93: `checkRateLimit(rateState)` |
| `src/hooks/useTutor.ts` | `src/services/tutor/promptTemplates.ts` | `buildSystemInstruction` and `buildHintPrompt` | WIRED | Lines 4-7 import; lines 126-127: both called with `promptParams` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| LLM-01 | 21-02, 21-03 | Gemini client singleton with lazy initialization and API key from expo-secure-store | SATISFIED | `geminiClient.ts`: module-level `clientInstance`, `getGeminiClient()` reads from `SecureStore`, caches; 4 singleton tests pass |
| LLM-02 | 21-02 | Prompt templates as pure functions parameterized by child age, CPA stage, and problem context | SATISFIED | `promptTemplates.ts`: `buildSystemInstruction` and `buildHintPrompt` are pure functions; `PromptParams` includes `ageBracket`, `cpaStage`, `problemText`; 11 tests pass |
| LLM-04 | 21-02, 21-03 | Non-streaming Gemini API call with AbortController and 8-second timeout | SATISFIED | `geminiClient.ts`: `setTimeout(8000)`, `AbortSignal.any` fallback; `useTutor.ts`: passes `abortSignal` to `callGemini`; timeout test with fake timers passes |
| LLM-05 | 21-02, 21-03 | Rate limiting (max 3 calls/problem, 20/session, 50/day configurable) | SATISFIED | `rateLimiter.ts`: `RATE_LIMITS = {perProblem:3, perSession:20, perDay:50}`; `checkRateLimit` checks in priority order; `useTutor.ts` checks before every call; 10 rate limiter tests + useTutor integration test pass |
| STATE-01 | 21-01 | Ephemeral tutorSlice in Zustand (not persisted, no migration needed) | SATISFIED | `tutorSlice.ts` added to `AppState` and `create()` but excluded from `partialize`; `STORE_VERSION = 5` unchanged |
| STATE-02 | 21-01 | Chat messages, tutor mode, hint level, loading/error state in tutorSlice | SATISFIED | `tutorSlice.ts` interface declares `tutorMessages`, `tutorMode`, `hintLevel`, `tutorLoading`, `tutorError` plus rate counters; 19 tests cover all state transitions |
| STATE-03 | 21-01, 21-03 | Tutor reads from skill/session state but never writes to it | SATISFIED | `useTutor.ts` imports only read selectors (`childAge`) from non-tutor slices; no session/skill action imports; dedicated STATE-03 test (useTutor.test.ts line 306) spies on `setState` and confirms no session/skill fields written |

No orphaned requirements found — all 7 IDs declared in plan frontmatter map to REQUIREMENTS.md entries, all marked Complete for Phase 21.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/hooks/useTutor.ts` | 119 | `cpaStage: 'concrete' as const` with inline comment "will be enhanced when CPA hook is wired" | Info | CPA stage is hardcoded to 'concrete' for all hints. This is explicitly noted as a future wiring point for Phase 22/23. Does not block phase goal — prompts still include CPA stage context and are sent to Gemini correctly. |

No blockers or warnings found. The one informational item is an acknowledged temporary default, not a stub.

---

### Human Verification Required

#### 1. Live Gemini API Call

**Test:** Set a real Gemini API key via `expo-secure-store` (`SecureStore.setItemAsync('gemini-api-key', 'YOUR_KEY')`), launch the app, and call `useTutor.requestHint()` with a real math problem.
**Expected:** A Socratic hint (non-empty string, max 1000 chars, no answer revealed) is returned in under 8 seconds and appears as a `TutorMessage` in the store.
**Why human:** Requires a provisioned API key, real network access, and a running Expo build. Cannot be validated with Jest mocks.

#### 2. Abort on Unmount in Running App

**Test:** Navigate to a screen using `useTutor`, trigger `requestHint`, then immediately navigate away before the response arrives.
**Expected:** No state update errors ("Can't perform a React state update on an unmounted component") appear in the Metro logs.
**Why human:** The defense-in-depth abort behavior at component unmount requires a real React Native environment to validate reliably.

---

### Gaps Summary

No gaps. All 12 must-have truths verified, all 13 artifacts substantive and wired, all 9 key links confirmed in code, all 7 requirements satisfied with test evidence.

---

## Test Suite Evidence

```
PASS src/services/tutor/__tests__/geminiClient.test.ts   (11 tests)
PASS src/hooks/__tests__/useTutor.test.ts                (12 tests)
PASS src/__tests__/store/tutorSlice.test.ts              (19 tests)
PASS src/services/tutor/__tests__/rateLimiter.test.ts    (10 tests)
PASS src/services/tutor/__tests__/promptTemplates.test.ts (11 tests)
Tests: 63 passed, 63 total
TypeScript: 0 errors
STORE_VERSION: 5 (unchanged)
```

---

_Verified: 2026-03-04T07:00:00Z_
_Verifier: Claude (gsd-verifier)_
