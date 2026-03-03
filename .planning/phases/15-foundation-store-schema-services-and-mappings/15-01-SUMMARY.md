---
phase: 15-foundation-store-schema-services-and-mappings
plan: 01
subsystem: services
tags: [cpa, manipulatives, babel, reanimated, domain-types]

requires:
  - phase: 13-adaptive-learning-engine
    provides: BKT mastery probability, skill definitions (14 skills)
provides:
  - CpaStage type and threshold constants (0.40/0.85)
  - deriveCpaStage and advanceCpaStage pure functions
  - SKILL_MANIPULATIVE_MAP with 14-skill manipulative preferences
  - getManipulativesForSkill and getPrimaryManipulative helpers
  - ManipulativeType union type for all 6 manipulative kinds
  - Fixed babel config for Reanimated 4 worklet compilation
affects: [15-02-store-migration, 16-manipulative-components, 17-base-ten-blocks, 20-session-integration]

tech-stack:
  added: [react-native-worklets/plugin]
  patterns: [CPA stage derivation, one-way stage advance, skill-manipulative mapping]

key-files:
  created:
    - src/services/cpa/cpaTypes.ts
    - src/services/cpa/cpaMappingService.ts
    - src/services/cpa/skillManipulativeMap.ts
    - src/services/cpa/index.ts
    - src/__tests__/cpa/cpaMappingService.test.ts
    - src/__tests__/cpa/skillManipulativeMap.test.ts
  modified:
    - babel.config.js

key-decisions:
  - "CPA thresholds locked at 0.40/0.85 (not 0.60/0.85 from ARCHITECTURE.md)"
  - "Fraction strips not mapped to any skill (sandbox-only per user decision)"
  - "Bar model included as last entry for all 14 skills for word-problem prep"
  - "Subtraction mirrors addition manipulative mappings exactly"

patterns-established:
  - "CPA one-way advance: advanceCpaStage returns max(current, derived) by stage order"
  - "Skill-manipulative mapping: static readonly array with helper lookup functions"

requirements-completed: [FOUND-02, FOUND-04, CPA-01]

duration: 5min
completed: 2026-03-03
---

# Phase 15 Plan 01: CPA Service Module Summary

**CPA stage derivation (0.40/0.85 thresholds) with one-way advance, 14-skill manipulative mapping table, and babel worklets plugin fix**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-03T17:16:47Z
- **Completed:** 2026-03-03T17:22:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- CPA types module with CpaStage, ManipulativeType, SkillManipulativeMapping, and threshold constants
- deriveCpaStage and advanceCpaStage pure functions with one-way advance constraint
- Complete 14-skill manipulative mapping table following Common Core pedagogy
- Fixed babel.config.js for Reanimated 4 worklet compilation (react-native-worklets/plugin)
- 27 tests covering all boundary conditions, regression scenarios, and mapping coverage

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CPA types and service with tests** - `e9999b3` (feat)
2. **Task 2: Create skill-manipulative mapping table with tests and fix babel config** - `37e0fd0` (feat)

## Files Created/Modified
- `src/services/cpa/cpaTypes.ts` - CPA domain types and threshold constants
- `src/services/cpa/cpaMappingService.ts` - deriveCpaStage and advanceCpaStage pure functions
- `src/services/cpa/skillManipulativeMap.ts` - 14-skill manipulative mapping table with lookup helpers
- `src/services/cpa/index.ts` - Barrel re-export for CPA module
- `src/__tests__/cpa/cpaMappingService.test.ts` - 14 tests for CPA stage derivation and advance
- `src/__tests__/cpa/skillManipulativeMap.test.ts` - 13 tests for mapping coverage and helpers
- `babel.config.js` - Changed plugin from react-native-reanimated/plugin to react-native-worklets/plugin

## Decisions Made
- CPA thresholds locked at 0.40/0.85 (research recommendation, overrides ARCHITECTURE.md 0.60/0.85)
- Fraction strips exist in ManipulativeType but not mapped to any skill (sandbox-only)
- Bar model included as last entry for all skills to prepare for AI tutor word-problem wrapping
- Subtraction mirrors addition mappings (same complexity = same manipulatives)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CPA types and services ready for Plan 02 store migration (adding cpaLevel to SkillState)
- Skill-manipulative mapping ready for Phase 16 manipulative component selection
- Babel config ready for Reanimated 4 worklet compilation in Phase 17+

---
*Phase: 15-foundation-store-schema-services-and-mappings*
*Completed: 2026-03-03*
