---
phase: 21-llm-service-store
plan: 03
subsystem: services
tags: [react-hooks, zustand, gemini, abort-controller, rate-limiting, tdd]

# Dependency graph
requires:
  - phase: 21-llm-service-store (plans 01, 02)
    provides: tutorSlice, geminiClient, promptTemplates, rateLimiter, tutor types
provides:
  - useTutor hook composing all tutor services into a single React interface
  - requestHint with rate limiting, abort lifecycle, and error handling
  - resetForProblem for problem transition cleanup
  - Complete barrel exports for downstream phases
affects: [22-safety-layer, 23-chat-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [hook-composes-services, abort-controller-defense-in-depth, read-only-cross-slice-access]

key-files:
  created:
    - src/hooks/useTutor.ts
    - src/hooks/__tests__/useTutor.test.ts
    - src/services/tutor/types.ts
    - src/services/tutor/geminiClient.ts
    - src/services/tutor/promptTemplates.ts
    - src/services/tutor/rateLimiter.ts
    - src/services/tutor/index.ts
    - src/store/slices/tutorSlice.ts
  modified:
    - src/store/appStore.ts

key-decisions:
  - "useTutor accepts SessionProblem as parameter rather than reading from store (session queue is in useRef, not Zustand)"
  - "AbortController cleanup uses defense-in-depth: explicit abort in finally + useEffect unmount"
  - "Loading guard uses useAppStore.getState() for synchronous check (prevents stale closure)"

patterns-established:
  - "Hook-composes-services: useTutor wraps service functions so UI never calls Gemini/rate-limiter directly"
  - "Read-only cross-slice: tutor reads childAge but never writes session/skill state (STATE-03)"
  - "Abort-on-reset: resetForProblem aborts in-flight request before clearing state"

requirements-completed: [LLM-01, LLM-04, LLM-05, STATE-03]

# Metrics
duration: 7min
completed: 2026-03-04
---

# Phase 21 Plan 03: useTutor Hook Summary

**useTutor hook composing Gemini client, prompt templates, rate limiter, and tutorSlice with AbortController lifecycle and read-only session state access**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-04T06:11:40Z
- **Completed:** 2026-03-04T06:19:24Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- useTutor hook provides requestHint and resetForProblem with full abort lifecycle
- Rate limiting prevents excess LLM calls with child-friendly messages at 3/problem, 20/session, 50/day
- 12 integration tests covering rate limiting, prompt building, error handling, loading states, abort cleanup, double-tap guard, and STATE-03 compliance
- Complete barrel exports in src/services/tutor/index.ts for Phase 22+ consumption
- Full test suite passes (805 tests across 53 suites) with clean typecheck

## Task Commits

Each task was committed atomically:

1. **Task 0: Tutor service dependencies** - `bf9d571` (feat) - types, slice, geminiClient, promptTemplates, rateLimiter
2. **Task 1: useTutor hook with TDD tests** - `d3276a6` (feat) - hook + 12 integration tests
3. **Task 2: Full phase integration verification** - verification only, no code changes needed

## Files Created/Modified
- `src/hooks/useTutor.ts` - Lifecycle hook composing all tutor services with store
- `src/hooks/__tests__/useTutor.test.ts` - 12 integration tests for hook behavior
- `src/services/tutor/types.ts` - TutorMessage, TutorMode, AgeBracket, PromptParams, geminiResponseSchema
- `src/services/tutor/geminiClient.ts` - Lazy singleton Gemini client with abort/timeout
- `src/services/tutor/promptTemplates.ts` - buildSystemInstruction and buildHintPrompt
- `src/services/tutor/rateLimiter.ts` - checkRateLimit and getRateLimitMessage
- `src/services/tutor/index.ts` - Barrel export for all tutor services
- `src/store/slices/tutorSlice.ts` - Ephemeral Zustand slice (not persisted)
- `src/store/appStore.ts` - TutorSlice integrated, STORE_VERSION remains 5

## Decisions Made
- useTutor accepts SessionProblem as parameter rather than reading from store, since session queue lives in useRef (not Zustand)
- Loading guard uses useAppStore.getState() for synchronous reads to prevent stale closure issues
- AbortController cleanup uses defense-in-depth pattern: explicit checks in try/catch/finally + useEffect unmount abort

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created Plan 01 and 02 dependency files**
- **Found during:** Pre-execution dependency check
- **Issue:** Plan 03 depends on tutorSlice (Plan 01), geminiClient/promptTemplates/rateLimiter (Plan 02), but none existed
- **Fix:** Created all dependency files following Plan 01 and 02 specifications
- **Files created:** src/services/tutor/types.ts, tutorSlice.ts, geminiClient.ts, promptTemplates.ts, rateLimiter.ts, index.ts; modified appStore.ts
- **Verification:** 21 Plan 01/02 tests pass, typecheck clean
- **Committed in:** bf9d571

**2. [Rule 1 - Bug] Fixed test type errors for SessionProblem fixture**
- **Found during:** Task 1 TDD GREEN phase
- **Issue:** Test fixture missing Problem.metadata field and MultipleChoicePresentation required fields (format, correctIndex, problem)
- **Fix:** Added metadata, format, correctIndex, and nested problem reference to test fixture
- **Files modified:** src/hooks/__tests__/useTutor.test.ts
- **Verification:** TypeScript typecheck clean
- **Committed in:** d3276a6

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Blocking fix was necessary because dependency plans had not been executed yet. Bug fix was a test type correction. No scope creep.

## Issues Encountered
None - plan executed smoothly after dependency resolution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All tutor services and the useTutor hook are ready for Phase 22 (Safety Layer) and Phase 23 (Chat UI)
- Barrel exports provide complete API surface: types, client, prompts, rate limiter, hook
- STORE_VERSION remains at 5 (tutorSlice is ephemeral, not persisted)
- 805 tests passing, TypeScript clean

## Self-Check: PASSED

All 8 created files verified on disk. Both commit hashes (bf9d571, d3276a6) verified in git log.

---
*Phase: 21-llm-service-store*
*Completed: 2026-03-04*
