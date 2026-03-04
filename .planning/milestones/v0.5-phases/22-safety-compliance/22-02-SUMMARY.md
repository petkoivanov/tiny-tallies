---
phase: 22-safety-compliance
plan: 02
subsystem: safety
tags: [gemini, safety-settings, system-instruction, consent, store-migration, api-safety]

# Dependency graph
requires:
  - phase: 22-safety-compliance
    plan: 01
    provides: GEMINI_SAFETY_SETTINGS constant, SafetySetting type from safetyConstants.ts
  - phase: 21-llm-service-store
    provides: geminiClient.ts, promptTemplates.ts, childProfileSlice.ts, appStore.ts, types.ts
provides:
  - callGemini with safetySettings in every API call and null return on safety-blocked responses
  - buildSystemInstruction with all 7 explicit safety rules and effort-praise mandate
  - tutorConsentGranted boolean in childProfileSlice with persistence
  - STORE_VERSION 6 with v5->v6 migration
affects: [22-03, useTutor, consent-gate-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [null-return-safety-block, explicit-safety-rules-in-system-instruction, consent-flag-persistence]

key-files:
  created: []
  modified:
    - src/services/tutor/geminiClient.ts
    - src/services/tutor/promptTemplates.ts
    - src/store/slices/childProfileSlice.ts
    - src/store/appStore.ts
    - src/store/migrations.ts
    - src/services/tutor/__tests__/geminiClient.test.ts
    - src/services/tutor/__tests__/promptTemplates.test.ts
    - src/__tests__/migrations.test.ts

key-decisions:
  - "callGemini returns null (not throw) on safety-blocked responses for graceful fallback handling"
  - "System instruction uses numbered CRITICAL SAFETY RULES block for clarity and auditability"
  - "Effort-praise rule includes explicit example phrasing (great try vs you are smart)"
  - "tutorConsentGranted defaults to false -- opt-in required before AI tutor access"

patterns-established:
  - "Null return pattern for safety-blocked API responses: callers check null before processing"
  - "Consent flag in store with migration: boolean with ??= false default for backwards compatibility"

requirements-completed: [LLM-03, SAFE-03, SAFE-06]

# Metrics
duration: 3min
completed: 2026-03-04
---

# Phase 22 Plan 02: Safety Wiring Summary

**Gemini safety settings wired into every API call with null return on safety blocks, 7 explicit safety rules in system instruction, and consent flag persisted via store migration v6**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T12:50:37Z
- **Completed:** 2026-03-04T12:53:42Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- GEMINI_SAFETY_SETTINGS (4 harm categories at BLOCK_LOW_AND_ABOVE) passed in every callGemini request config
- Safety-blocked responses (finishReason SAFETY/RECITATION) and empty/undefined text return null instead of throwing
- buildSystemInstruction enhanced with all 7 numbered CRITICAL SAFETY RULES + effort-praise mandate
- tutorConsentGranted boolean added to childProfileSlice with persistence via STORE_VERSION 6 migration
- 53 tests passing across geminiClient, promptTemplates, and migrations suites

## Task Commits

Each task was committed atomically (TDD: test then feat):

1. **Task 1: Gemini client safety settings and system instruction enhancement**
   - `59d2233` (test) - Failing tests for safety settings and prompt rules
   - `5115dcd` (feat) - Wire safety settings into Gemini client and enhance system instruction
2. **Task 2: Consent flag in store with migration v5 to v6**
   - `104833b` (test) - Failing tests for v5->v6 consent migration
   - `e73bcb7` (feat) - Add consent flag to store with v5->v6 migration

## Files Created/Modified
- `src/services/tutor/geminiClient.ts` - Import GEMINI_SAFETY_SETTINGS, pass in config, return null on safety blocks, return type changed to Promise<string | null>
- `src/services/tutor/promptTemplates.ts` - Enhanced buildSystemInstruction with 7 numbered CRITICAL SAFETY RULES + effort-praise example
- `src/store/slices/childProfileSlice.ts` - Added tutorConsentGranted boolean (default false) and setTutorConsentGranted action
- `src/store/appStore.ts` - Bumped STORE_VERSION to 6, added tutorConsentGranted to partialize
- `src/store/migrations.ts` - Added v5->v6 migration defaulting tutorConsentGranted to false
- `src/services/tutor/__tests__/geminiClient.test.ts` - Added 7 new tests for safety-blocked responses and safety settings
- `src/services/tutor/__tests__/promptTemplates.test.ts` - Added 7 new tests for all safety rules in system instruction
- `src/__tests__/migrations.test.ts` - Added 2 new tests for v5->v6 migration, updated chain test to v1->v6

## Decisions Made
- **Null return on safety block:** callGemini returns null instead of throwing when Gemini blocks a response. This allows callers to gracefully substitute a canned fallback without try/catch. Downstream useTutor.ts will need to handle null (addressed in Plan 03).
- **Numbered safety rules:** System instruction uses a numbered "CRITICAL SAFETY RULES" block (1-7) for clarity and auditability, making it easy to verify completeness.
- **Effort-praise with example:** Added concrete example phrasing ("great try" not "you are smart") to make the LLM guidance more actionable.
- **Consent defaults false:** tutorConsentGranted defaults to false so existing users must explicitly grant consent before AI tutor access.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- **Downstream type error:** `useTutor.ts:141` has a type error because it assigns `callGemini()` result (now `string | null`) to a `string` variable. This is expected and documented in the plan's success criteria as being addressed in Plan 03. Not fixed here to avoid scope creep.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Safety settings are now enforced on every Gemini API call
- System instruction contains complete safety rules for LLM guidance
- Consent flag is ready for UI gating in a consent screen
- Plan 03 will wire the safety pipeline (checkAnswerLeak, validateContent, scrubOutboundPii) into the useTutor hook call flow and handle the null return type in useTutor.ts

## Self-Check: PASSED

- All 8 modified files verified on disk
- All 4 task commits (59d2233, 5115dcd, 104833b, e73bcb7) verified in git log
- 53 tests passing across 3 suites, STORE_VERSION = 6

---
*Phase: 22-safety-compliance*
*Completed: 2026-03-04*
