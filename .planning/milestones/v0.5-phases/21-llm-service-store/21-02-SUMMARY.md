---
phase: 21-llm-service-store
plan: 02
subsystem: services
tags: [gemini, llm, prompt-engineering, rate-limiting, abort-controller, zod, expo-secure-store]

# Dependency graph
requires:
  - phase: 21-llm-service-store (plan 01)
    provides: TutorMode, AgeBracket, PromptParams, geminiResponseSchema types
provides:
  - Lazy singleton Gemini client with abort/timeout (getGeminiClient, callGemini)
  - Pure prompt template functions (buildSystemInstruction, buildHintPrompt)
  - Rate limiter with configurable limits (checkRateLimit, getRateLimitMessage)
  - Barrel export index.ts for all tutor service modules
affects: [21-llm-service-store plan 03, phase 22, phase 23]

# Tech tracking
tech-stack:
  added: []
  patterns: [lazy-singleton-client, abort-signal-timeout, pure-prompt-templates, rate-limit-pure-functions]

key-files:
  created:
    - src/services/tutor/promptTemplates.ts
    - src/services/tutor/rateLimiter.ts
    - src/services/tutor/__tests__/promptTemplates.test.ts
    - src/services/tutor/__tests__/rateLimiter.test.ts
    - src/services/tutor/__tests__/geminiClient.test.ts
  modified:
    - src/services/tutor/geminiClient.ts
    - src/services/tutor/index.ts

key-decisions:
  - "AbortSignal.any() with manual listener fallback for Hermes compatibility"
  - "ts-expect-error for httpOptions.signal typing (runtime-supported but not typed in SDK v1.30)"
  - "WORD_LIMITS as Record for age bracket word limits (6-7=8, 7-8=10, 8-9=12)"

patterns-established:
  - "Lazy singleton: module-level variable initialized on first async call, resetable for testing"
  - "AbortController + timeout: internal 8s timeout combined with external signal via AbortSignal.any or fallback"
  - "Pure prompt templates: no side effects, fully testable, correctAnswer deliberately excluded from params"
  - "Rate limiter: pure functions with priority ordering (problem > session > daily)"

requirements-completed: [LLM-01, LLM-02, LLM-04, LLM-05]

# Metrics
duration: 7min
completed: 2026-03-04
---

# Phase 21 Plan 02: Core Tutor Service Modules Summary

**Gemini client singleton with 8s abort/timeout, pure prompt templates with age-bracket word limits, and 3/20/50 rate limiter**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-04T06:11:09Z
- **Completed:** 2026-03-04T06:18:37Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Built and tested prompt templates with age-bracket-specific word limits and strict answer-hiding guardrails
- Built and tested rate limiter with configurable 3/problem, 20/session, 50/day limits and child-friendly messages
- Built and tested Gemini client with lazy init from expo-secure-store, 8s timeout, external abort support, and Zod response validation
- All 32 tutor service tests passing, 805 total tests green

## Task Commits

Each task was committed atomically:

1. **Task 1: Prompt templates and rate limiter with tests** - `bf9d571` (feat -- committed in prior partial run)
2. **Task 2: Gemini client tests with abort and timeout** - `738d023` (test)

_Note: Task 1 implementation and test files were committed in a prior partial execution run (bf9d571). Task 2 added the missing geminiClient test file._

## Files Created/Modified
- `src/services/tutor/promptTemplates.ts` - Pure functions for system instruction and hint prompts with age-bracket word limits
- `src/services/tutor/rateLimiter.ts` - RATE_LIMITS constants, checkRateLimit priority checker, child-friendly messages
- `src/services/tutor/geminiClient.ts` - Lazy singleton GoogleGenAI client, callGemini with abort/timeout/Zod validation
- `src/services/tutor/index.ts` - Barrel export for all tutor service modules
- `src/services/tutor/__tests__/promptTemplates.test.ts` - 11 tests covering word limits, guardrails, optional params
- `src/services/tutor/__tests__/rateLimiter.test.ts` - 10 tests covering limits, priority, messages
- `src/services/tutor/__tests__/geminiClient.test.ts` - 11 tests covering singleton, abort, timeout, Zod validation

## Decisions Made
- Used `AbortSignal.any()` with manual listener fallback pattern for Hermes engine compatibility (ES2024 feature may not be available)
- Used `@ts-expect-error` for `httpOptions.signal` on generateContent call -- runtime-supported but not typed in @google/genai v1.30.0
- Kept word limit mapping as a Record const rather than inline ternaries for readability
- Used `gemini-2.5-flash` as the model identifier (API resolves aliases)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created prerequisite types.ts from Plan 01**
- **Found during:** Task 1 (initial setup)
- **Issue:** Plan 02 depends on types.ts from Plan 01, which had not been executed yet at first check
- **Fix:** Discovered Plan 01 was actually committed in a prior run (b7b3d82), types.ts already existed on disk
- **Files modified:** None (already committed)
- **Verification:** Types import successfully in all modules

---

**Total deviations:** 1 investigated (0 required changes)
**Impact on plan:** No scope creep. Prior Plan 01 execution provided all dependencies.

## Issues Encountered
- Pre-existing TypeScript errors in `src/hooks/__tests__/useTutor.test.ts` from an incomplete Plan 03 run (useTutor hook not fully implemented). These are out of scope for Plan 02 and do not affect Plan 02's modules.
- Jest fake timers required careful handling with async `getGeminiClient()` -- solved by using `jest.advanceTimersByTimeAsync()` with pre-warmed client cache.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three tutor service modules (geminiClient, promptTemplates, rateLimiter) are exported via barrel index.ts
- Plan 03 (useTutor hook) can compose these services with the tutorSlice from Plan 01
- Gemini API key must be provisioned in expo-secure-store before runtime use (handled by future onboarding phase)

## Self-Check: PASSED

All 7 files verified on disk. Both commit hashes (bf9d571, 738d023) found in git log.

---
*Phase: 21-llm-service-store*
*Completed: 2026-03-04*
