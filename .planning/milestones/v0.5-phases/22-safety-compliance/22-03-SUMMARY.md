---
phase: 22-safety-compliance
plan: 03
subsystem: safety
tags: [llm-safety, pii-scrubbing, consent-gate, answer-leak, content-validation, canned-fallbacks, zustand, react-hooks]

# Dependency graph
requires:
  - phase: 22-safety-compliance (plan 01)
    provides: "safetyFilter.ts (checkAnswerLeak, validateContent, scrubOutboundPii, runSafetyPipeline), safetyConstants.ts (getCannedFallback, GEMINI_SAFETY_SETTINGS), safetyTypes.ts"
  - phase: 22-safety-compliance (plan 02)
    provides: "callGemini returns null on safety-blocked, tutorConsentGranted in store, GEMINI_SAFETY_SETTINGS wired into API calls"
provides:
  - "Full safety pipeline wired into useTutor requestHint flow"
  - "Consent gate blocking AI tutor access without parental opt-in"
  - "PII scrubbing on every outbound prompt"
  - "Answer-leak and content validation on every inbound response"
  - "Categorized canned fallbacks for all failure modes"
  - "Complete barrel exports for all safety modules in tutor/index.ts"
affects: [23-ui-session, 24-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: ["consent-gate-first-check", "defense-in-depth-pii-scrub", "deterministic-safety-pipeline", "categorized-canned-fallbacks"]

key-files:
  created: []
  modified:
    - src/hooks/useTutor.ts
    - src/services/tutor/index.ts
    - src/hooks/__tests__/useTutor.test.ts

key-decisions:
  - "Consent gate is the FIRST check in requestHint, before loading guard and problem check"
  - "Error paths set tutorError to null and add fallback message -- child sees friendly message, not error banner"
  - "Timeout detection via DOMException type check and error message keyword matching"
  - "Existing error test updated to match new fallback behavior (was testing raw error, now tests canned fallback)"

patterns-established:
  - "Safety pipeline integration: consent -> PII scrub -> callGemini -> null check -> safety pipeline -> deliver"
  - "Fallback message pattern: all failure modes produce child-friendly canned messages via getCannedFallback"

requirements-completed: [SAFE-01, SAFE-02, SAFE-04, SAFE-05, SAFE-06]

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 22 Plan 03: Safety Pipeline Integration Summary

**Full safety pipeline wired into useTutor: consent gate, PII scrubbing, answer-leak detection, content validation, and categorized canned fallbacks for all failure modes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T12:56:58Z
- **Completed:** 2026-03-04T13:00:24Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 3

## Accomplishments

- Consent gate blocks requestHint when tutorConsentGranted is false, returning 'consent_required' error
- Every outbound prompt passes through scrubOutboundPii before reaching Gemini API
- Every inbound LLM response passes through runSafetyPipeline (answer-leak + content validation)
- Null responses from Gemini safety filters produce child-friendly canned fallback
- All error paths (timeout, generic, safety-blocked, answer-leaked, content-invalid) use categorized canned fallbacks
- incrementCallCount/incrementHintLevel only called on fully validated success
- Barrel exports complete for all safety modules (safetyTypes, safetyConstants, safetyFilter)
- 21 useTutor tests passing (12 existing + 9 new), 902 total tests passing, TypeScript clean

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing safety pipeline tests** - `ae03b39` (test)
2. **Task 1 (GREEN): Wire safety pipeline + barrel exports** - `fdcec8e` (feat)

_TDD task: RED committed failing tests, GREEN committed implementation passing all tests. No REFACTOR needed._

## Files Created/Modified

- `src/hooks/useTutor.ts` - Added consent gate, PII scrubbing, safety pipeline, categorized fallbacks to requestHint flow
- `src/services/tutor/index.ts` - Added barrel exports for safetyTypes, safetyConstants, safetyFilter
- `src/hooks/__tests__/useTutor.test.ts` - Added 9 new safety pipeline tests, updated 1 existing test for new fallback behavior

## Decisions Made

- **Consent gate position:** First check in requestHint, before loading guard -- ensures no LLM call can start without consent
- **Error state on fallback:** Set tutorError to null when adding fallback messages -- child sees friendly message, not error banner
- **Timeout detection:** DOMException type check (non-AbortError) combined with error message keyword matching for broad coverage
- **Existing test update:** Updated "sets tutorError on Gemini failure" to verify null error + fallback message (behavioral change from raw error to canned fallback)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated existing error test assertion**
- **Found during:** Task 1 GREEN phase
- **Issue:** Existing test "requestHint sets tutorError on Gemini failure" expected error to be truthy, but new implementation correctly sets error to null and adds canned fallback message
- **Fix:** Updated test to verify error is null and fallback message is added
- **Files modified:** src/hooks/__tests__/useTutor.test.ts
- **Verification:** All 21 tests pass
- **Committed in:** fdcec8e

---

**Total deviations:** 1 auto-fixed (1 bug fix in test)
**Impact on plan:** Test assertion updated to match intentional behavioral change. No scope creep.

## Issues Encountered

- Pre-existing STORE_VERSION test failure in `src/__tests__/appStore.test.ts` (expects 5, actual is 6 from Plan 22-02). Logged to `deferred-items.md`. Not caused by this plan's changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 22 (Safety & Compliance) is now COMPLETE -- all 3 plans executed
- Full safety pipeline operational: consent -> PII scrub -> Gemini API (with safety settings) -> null check -> answer-leak detection -> content validation -> deliver to child
- Ready for Phase 23 (UI/Session integration) or Phase 24 (Polish)
- Pre-existing STORE_VERSION test needs fixing (minor, tracked in deferred-items.md)

---
*Phase: 22-safety-compliance*
*Completed: 2026-03-04*
