---
phase: 21-llm-service-store
plan: 01
subsystem: state
tags: [zustand, tutor, zod, ephemeral-state, gemini]

requires:
  - phase: 20-manipulatives
    provides: "STORE_VERSION 5, sandboxSlice pattern, appStore composition"
provides:
  - "TutorSlice ephemeral state (messages, mode, hints, loading, error, rate counters)"
  - "TutorMessage, TutorMode, AgeBracket, PromptParams, GeminiResponse types"
  - "geminiResponseSchema Zod validator for Gemini API boundary"
  - "Barrel export at src/services/tutor/index.ts"
affects: [21-02-PLAN, 21-03-PLAN, useTutor-hook, prompt-templates, gemini-client]

tech-stack:
  added: []
  patterns: [ephemeral-zustand-slice, daily-reset-counter, zod-api-validation]

key-files:
  created:
    - src/services/tutor/types.ts
    - src/services/tutor/index.ts
    - src/store/slices/tutorSlice.ts
    - src/__tests__/store/tutorSlice.test.ts
  modified:
    - src/store/appStore.ts

key-decisions:
  - "tutorSlice excluded from partialize -- fully ephemeral, no AsyncStorage persistence"
  - "STORE_VERSION stays at 5 -- no migration needed for ephemeral state"
  - "Daily call count reset uses ISO date string comparison for simplicity"
  - "PromptParams deliberately excludes correctAnswer -- LLM must never see it"

patterns-established:
  - "Ephemeral slice pattern: add to AppState and create() but exclude from partialize"
  - "Rate counter pattern: problem/session/daily granularity with daily date-based reset"

requirements-completed: [STATE-01, STATE-02, STATE-03]

duration: 2min
completed: 2026-03-04
---

# Phase 21 Plan 01: Tutor Types & State Summary

**Ephemeral tutorSlice with TutorMessage/Mode/PromptParams types, Zod response validation, and 3-tier rate counter with daily reset**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-04T06:11:18Z
- **Completed:** 2026-03-04T06:13:30Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Tutor domain types (TutorMessage, TutorMode, AgeBracket, PromptParams, GeminiResponse) with Zod schema validation
- Ephemeral tutorSlice with 8 actions: addTutorMessage, setTutorMode, incrementHintLevel, setTutorLoading, setTutorError, resetProblemTutor, resetSessionTutor, incrementCallCount
- 3-tier rate counter (problem/session/daily) with automatic daily reset logic
- appStore integration with TutorSlice composed but excluded from persistence
- 19 TDD tests covering all state transitions, reset semantics, and daily reset edge case
- Full test suite: 782 tests passing, TypeScript clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Tutor types and ephemeral tutorSlice with tests** - `b7b3d82` (feat)
2. **Task 2: Integrate tutorSlice into appStore** - `c9ef491` (feat)

## Files Created/Modified
- `src/services/tutor/types.ts` - TutorMessage, TutorMode, AgeBracket, PromptParams, GeminiResponse types and Zod schema
- `src/services/tutor/index.ts` - Barrel export for tutor service types
- `src/store/slices/tutorSlice.ts` - Ephemeral Zustand slice with tutor state and 8 actions
- `src/__tests__/store/tutorSlice.test.ts` - 19 tests covering all slice behaviors
- `src/store/appStore.ts` - Added TutorSlice to AppState union and create() composition

## Decisions Made
- tutorSlice is fully ephemeral (excluded from partialize) -- avoids stale chat data persisting across app restarts
- STORE_VERSION remains at 5 -- no migration needed since nothing is persisted
- Daily call count uses ISO date string (YYYY-MM-DD) for comparison -- simple, timezone-aware via local Date
- PromptParams interface deliberately omits correctAnswer field -- enforces the guardrail that LLM must never see the answer

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None -- no external service configuration required.

## Next Phase Readiness
- Types and state layer ready for Plan 02 (prompt templates) and Plan 03 (Gemini client + useTutor hook)
- TutorSlice accessible via useAppStore selectors for hook integration
- geminiResponseSchema ready for API response validation in Gemini client

## Self-Check: PASSED

All 6 files verified present. Both task commits (b7b3d82, c9ef491) verified in git log.

---
*Phase: 21-llm-service-store*
*Completed: 2026-03-04*
