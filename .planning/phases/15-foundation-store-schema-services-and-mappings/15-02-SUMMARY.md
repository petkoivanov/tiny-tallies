---
phase: 15-foundation-store-schema-services-and-mappings
plan: 02
subsystem: store
tags: [zustand, migration, cpa, bkt, session, elo, leitner]

requires:
  - phase: 15-01
    provides: CPA types (CpaStage), deriveCpaStage, advanceCpaStage from cpaMappingService

provides:
  - SkillState with cpaLevel field (per-skill CPA tracking)
  - Store v5 migration with BKT-informed CPA placement
  - commitSessionResults writes CPA level atomically with Elo/BKT/Leitner
  - useSession computes one-way CPA advance via advanceCpaStage

affects: [phase-16-manipulative-components, phase-18-session-ui, phase-20-guided-mode]

tech-stack:
  added: []
  patterns: [one-way CPA advance in session commit pipeline]

key-files:
  created: []
  modified:
    - src/store/slices/skillStatesSlice.ts
    - src/store/helpers/skillStateHelpers.ts
    - src/store/migrations.ts
    - src/store/appStore.ts
    - src/services/session/sessionTypes.ts
    - src/services/session/sessionOrchestrator.ts
    - src/hooks/useSession.ts
    - src/__tests__/migrations.test.ts
    - src/__tests__/appStore.test.ts
    - src/__tests__/session/sessionOrchestrator.test.ts

key-decisions:
  - "cpaLevel stored per-skill in SkillState, defaults to 'concrete' for new skills"
  - "v4->v5 migration uses deriveCpaStage with BKT P(L) thresholds for existing skills"
  - "CPA advance is one-way only via advanceCpaStage (never regresses)"

patterns-established:
  - "CPA level flows through PendingSkillUpdate -> commitSessionResults -> updateSkillState atomically"
  - "Migration imports from services layer (deriveCpaStage) for BKT-informed placement"

requirements-completed: [FOUND-01, CPA-01]

duration: 10min
completed: 2026-03-03
---

# Phase 15 Plan 02: Store Schema + Session CPA Integration Summary

**Store v5 with per-skill cpaLevel field, BKT-informed v4->v5 migration, and atomic CPA advance in commitSessionResults pipeline**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-03T17:20:51Z
- **Completed:** 2026-03-03T17:31:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- SkillState type extended with cpaLevel: CpaStage field, all three default locations updated
- v4->v5 migration adds BKT-informed CPA placement: P(L)<0.40=concrete, 0.40-0.85=pictorial, >=0.85=abstract
- PendingSkillUpdate includes newCpaLevel, commitSessionResults writes it to store atomically
- useSession computes one-way CPA advance using advanceCpaStage when building pending updates
- 589 tests passing (up from 557), TypeScript clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Store schema v4->v5 migration with CPA level per skill** - `1412144` (feat)
2. **Task 2: Wire CPA advance into commitSessionResults** - `6dc90e5` (feat)

## Files Created/Modified
- `src/store/slices/skillStatesSlice.ts` - Added cpaLevel: CpaStage to SkillState type + fallback default
- `src/store/helpers/skillStateHelpers.ts` - Added cpaLevel: 'concrete' to getOrCreateSkillState default
- `src/store/migrations.ts` - v4->v5 migration with BKT-informed CPA placement via deriveCpaStage
- `src/store/appStore.ts` - STORE_VERSION bumped from 4 to 5
- `src/services/session/sessionTypes.ts` - Added newCpaLevel: CpaStage to PendingSkillUpdate
- `src/services/session/sessionOrchestrator.ts` - commitSessionResults writes cpaLevel from update
- `src/hooks/useSession.ts` - Computes CPA advance via advanceCpaStage in handleAnswer
- `src/__tests__/migrations.test.ts` - New v4->v5 migration tests (BKT placement, empty, missing, chain)
- `src/__tests__/appStore.test.ts` - Updated STORE_VERSION + all SkillState assertions
- `src/__tests__/session/sessionOrchestrator.test.ts` - CPA write-through + mixed CPA level tests
- `src/__tests__/adaptive/skillSelector.test.ts` - Updated bkt helper with cpaLevel
- `src/__tests__/adaptive/integration.test.ts` - Updated makeSkillState with cpaLevel
- `src/__tests__/adaptive/prerequisiteGating.test.ts` - Updated makeSkillState with cpaLevel
- `src/__tests__/session/practiceMix.test.ts` - Updated bktDefaults with cpaLevel
- `src/__tests__/session/useSession.test.ts` - Updated inline SkillState objects with cpaLevel

## Decisions Made
- cpaLevel defaults to 'concrete' for all new skills (safest starting point)
- Migration uses deriveCpaStage from cpaMappingService (services own domain logic, store imports it)
- CPA advance computed in useSession hook alongside Elo/BKT/Leitner (same handleAnswer flow)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated all test helper SkillState objects with cpaLevel**
- **Found during:** Task 1 (TypeScript typecheck)
- **Issue:** Adding required cpaLevel to SkillState caused TS errors in 6 test files with SkillState objects
- **Fix:** Added cpaLevel to bkt/bktDefaults const objects and makeSkillState helpers across all test files
- **Files modified:** skillSelector.test.ts, integration.test.ts, prerequisiteGating.test.ts, practiceMix.test.ts, useSession.test.ts, sessionOrchestrator.test.ts
- **Verification:** npm run typecheck clean, all 589 tests pass
- **Committed in:** 1412144 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Necessary for TypeScript strict mode compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Store schema v5 complete with CPA tracking per skill
- Session commit pipeline writes CPA level atomically
- Ready for Phase 16 (manipulative UI components) which will read cpaLevel to determine which manipulatives to show
- Ready for Phase 18 (session UI) which will use cpaLevel for visual presentation

---
*Phase: 15-foundation-store-schema-services-and-mappings*
*Completed: 2026-03-03*
