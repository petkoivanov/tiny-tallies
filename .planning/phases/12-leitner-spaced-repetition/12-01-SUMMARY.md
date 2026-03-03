---
phase: 12-leitner-spaced-repetition
plan: "01"
subsystem: adaptive
tags: [leitner, spaced-repetition, zustand, migration, bkt]

# Dependency graph
requires:
  - phase: 11-bkt-session-integration
    provides: BKT mastery probability per skill, soft mastery lock, age bracket mapping
provides:
  - Leitner box transition engine (pure functions)
  - Age-adjusted review interval table (3 brackets + default)
  - Box 6 graduation tracking (3 consecutive correct)
  - getReviewStatus for queue sorting (isDue/overdueByMs)
  - mapPLToInitialBox for BKT-informed migration placement
  - SkillState extended with leitnerBox, nextReviewDue, consecutiveCorrectInBox6
  - PendingSkillUpdate extended with Leitner fields
  - Store migration v3->v4 with BKT-informed initial box placement
affects: [12-02-session-integration, 14-review-queue]

# Tech tracking
tech-stack:
  added: []
  patterns: [pure-function calculator module, age-bracket interval lookup, BKT-informed migration placement]

key-files:
  created:
    - src/services/adaptive/leitnerTypes.ts
    - src/services/adaptive/leitnerCalculator.ts
    - src/__tests__/adaptive/leitnerCalculator.test.ts
  modified:
    - src/services/adaptive/index.ts
    - src/store/slices/skillStatesSlice.ts
    - src/store/helpers/skillStateHelpers.ts
    - src/store/appStore.ts
    - src/store/migrations.ts
    - src/services/session/sessionTypes.ts
    - src/hooks/useSession.ts
    - src/__tests__/migrations.test.ts
    - src/__tests__/appStore.test.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts
    - src/__tests__/adaptive/skillSelector.test.ts
    - src/__tests__/session/sessionOrchestrator.test.ts

key-decisions:
  - "Leitner fields carry-forward in useSession handleAnswer as passthrough until 12-02 wires actual transitions"

patterns-established:
  - "Pure-function Leitner calculator following BKT calculator pattern: exported constants, age bracket lookup, testable transitions"
  - "BKT-informed migration placement: existing mastery data maps to initial Leitner box instead of all starting at Box 1"

requirements-completed: [LEIT-01, LEIT-02, LEIT-03, LEIT-04, LEIT-05]

# Metrics
duration: 7min
completed: 2026-03-03
---

# Phase 12 Plan 01: Leitner Service & Store Schema Summary

**Pure-function Leitner calculator with age-adjusted intervals (3 brackets), Box 6 graduation tracking, BKT-informed migration v3->v4, and SkillState/PendingSkillUpdate schema extensions**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-03T13:48:13Z
- **Completed:** 2026-03-03T13:55:00Z
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments
- Leitner calculator with 8 pure functions: transitionBox, getReviewStatus, computeNextReviewDue, mapPLToInitialBox, getIntervalMs, getAgeIntervalBracket + exported constants
- Age-adjusted interval table with 3 brackets (6-7, 7-8, 8-9) producing different review gaps for younger vs older children
- Store migration v3->v4 using BKT mastery probability for intelligent initial box placement (not all Box 1)
- 58 new tests (53 calculator + 5 migration) bringing total to 494 passing tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Leitner types and calculator service** - `d649241` (feat)
2. **Task 2: Extend SkillState, PendingSkillUpdate, migration, and helpers** - `e5c7994` (feat)
3. **Task 3: Write comprehensive tests for Leitner calculator and migration** - `c60d394` (test)

## Files Created/Modified
- `src/services/adaptive/leitnerTypes.ts` - LeitnerBox, LeitnerTransitionResult, LeitnerReviewStatus types
- `src/services/adaptive/leitnerCalculator.ts` - Pure functions: transitionBox, getReviewStatus, computeNextReviewDue, mapPLToInitialBox, getIntervalMs, getAgeIntervalBracket
- `src/services/adaptive/index.ts` - Barrel exports for all Leitner types and functions
- `src/store/slices/skillStatesSlice.ts` - SkillState extended with leitnerBox, nextReviewDue, consecutiveCorrectInBox6
- `src/store/helpers/skillStateHelpers.ts` - getOrCreateSkillState default includes Leitner fields
- `src/store/appStore.ts` - STORE_VERSION bumped 3->4
- `src/store/migrations.ts` - v3->v4 migration with BKT-informed initial box placement
- `src/services/session/sessionTypes.ts` - PendingSkillUpdate extended with Leitner fields
- `src/hooks/useSession.ts` - Leitner fields carry-forward in handleAnswer
- `src/__tests__/adaptive/leitnerCalculator.test.ts` - 53 tests covering all calculator functions
- `src/__tests__/migrations.test.ts` - 5 new v4 migration tests

## Decisions Made
- Leitner fields in useSession handleAnswer carry forward current values (passthrough) until Plan 12-02 wires actual Leitner transitions into the session flow. This keeps the build green without premature integration.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated all existing tests and useSession with Leitner defaults**
- **Found during:** Task 2 (extend SkillState)
- **Issue:** Adding 3 required fields to SkillState and PendingSkillUpdate broke TypeScript compilation in 6 test files and useSession.ts where these types are constructed without the new fields
- **Fix:** Added Leitner default values (leitnerBox: 1, nextReviewDue: null, consecutiveCorrectInBox6: 0) to all SkillState/PendingSkillUpdate constructors in tests and useSession.ts. Updated STORE_VERSION assertion from 3 to 4.
- **Files modified:** prerequisiteGating.test.ts, skillSelector.test.ts, sessionOrchestrator.test.ts, appStore.test.ts, migrations.test.ts, useSession.ts
- **Verification:** npm run typecheck clean, all 436 existing tests still pass
- **Committed in:** e5c7994 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required fix for type correctness after schema extension. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Leitner calculator and schema are ready for Plan 12-02 to wire into session flow
- transitionBox can be called from handleAnswer to update Leitner state per answer
- commitSessionResults can be extended to persist Leitner fields to store
- getReviewStatus ready for Phase 14 review queue implementation

## Self-Check: PASSED

All created files verified. All 3 task commits verified (d649241, e5c7994, c60d394).

---
*Phase: 12-leitner-spaced-repetition*
*Completed: 2026-03-03*
