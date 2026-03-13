---
phase: 086-systems-of-equations-domain
plan: 01
subsystem: testing
tags: [jest, tdd, red-stubs, systems-equations, math-engine]

requires:
  - phase: 085-statistics-extensions-domain
    provides: "statistics_hs domain with 5 skills, 175 total skill count baseline"
provides:
  - "RED test stubs for systems_equations domain (5 skills, 3 bugs)"
  - "Updated count assertions: 23 operations, 180 skills"
  - "Contract documentation for Wave 1 implementation"
affects: [086-02-PLAN, 086-03-PLAN, 091-integration]

tech-stack:
  added: []
  patterns: [wave-0-red-stubs, count-assertion-updates]

key-files:
  created:
    - src/__tests__/mathEngine/systemsEquations.test.ts
  modified:
    - src/__tests__/mathEngine/domainHandlerRegistry.test.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts
    - src/__tests__/mathEngine/wordProblems.test.ts

key-decisions:
  - "SYSTEMS_EQUATIONS_BUGS import causes RED at module level — same pattern as prior domains"
  - "systems_equations gradeMap entry is 9 (Common Core HSA.REI standards start grade 9)"

patterns-established:
  - "Wave 0 RED stub pattern: consistent across all 9 HS domain handlers"

requirements-completed: [SYS-01, SYS-02]

duration: 2min
completed: 2026-03-13
---

# Phase 086 Plan 01: Systems of Equations RED Test Stubs Summary

**RED test stubs for systems_equations domain: 1 new test file (20 tests) + 3 count-updated files, all failing until Wave 1 lands**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T22:07:55Z
- **Completed:** 2026-03-13T22:09:39Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created systemsEquations.test.ts with 20 test cases covering registry, skills, handler generation, answer bounds, bug library, and distractor generation
- Updated domainHandlerRegistry.test.ts: 22->23 operations, 175->180 skills, added systems_equations to expectedTypes
- Updated prerequisiteGating.test.ts: 175->180 skill count assertion
- Updated wordProblems.test.ts: added systems_equations to ALL_OPERATIONS and gradeMap

## Task Commits

Each task was committed atomically:

1. **Task 1: Create RED test stubs -- systemsEquations.test.ts** - `2a190dc` (test)
2. **Task 2: Update count assertions in 3 existing test files** - `0c65f5b` (test)

## Files Created/Modified
- `src/__tests__/mathEngine/systemsEquations.test.ts` - RED test stubs for systems_equations domain (5 skills, 3 bugs, distractor generation)
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` - Updated operation count 22->23, skill count 175->180, added systems_equations to expectedTypes
- `src/__tests__/adaptive/prerequisiteGating.test.ts` - Updated skill count assertion 175->180
- `src/__tests__/mathEngine/wordProblems.test.ts` - Added systems_equations to ALL_OPERATIONS and gradeMap (grade 9)

## Decisions Made
- SYSTEMS_EQUATIONS_BUGS import causes RED at module level, consistent with prior domain stubs
- systems_equations gradeMap entry is 9 (Common Core HSA.REI standards start in grade 9)
- No minWordProblemCount map exists in wordProblems.test.ts; only ALL_OPERATIONS and gradeMap updated

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- RED test stubs establish the contract for Wave 1 (Plan 02: handler, skills, templates, generators)
- All 20 tests fail at import/runtime level as expected, confirming stubs are wired to missing implementation

---
*Phase: 086-systems-of-equations-domain*
*Completed: 2026-03-13*
