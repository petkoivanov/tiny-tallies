---
phase: 087-quadratic-equations-domain
plan: 01
subsystem: testing
tags: [jest, tdd, red-stubs, quadratic-equations, math-engine, multi-select]

requires:
  - phase: 086-systems-of-equations-domain
    provides: "systems_equations domain with 5 skills, 180 total skill count baseline"
  - phase: 080-foundation
    provides: "MultiSelectAnswer type (FOUND-06), MultiSelectMC component (FOUND-07)"
provides:
  - "RED test stubs for quadratic_equations domain (6 skills, 3 bugs)"
  - "RED test stubs for formatAsMultiSelect answer pipeline function"
  - "Updated count assertions: 24 operations, 186 skills"
  - "Contract documentation for Wave 1 implementation"
affects: [087-02-PLAN, 087-03-PLAN, 091-integration]

tech-stack:
  added: []
  patterns: [wave-0-red-stubs, count-assertion-updates, multi-select-answer-format]

key-files:
  created:
    - src/__tests__/mathEngine/quadraticEquations.test.ts
    - src/__tests__/mathEngine/multiSelect.test.ts
  modified:
    - src/__tests__/mathEngine/domainHandlerRegistry.test.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts
    - src/__tests__/mathEngine/wordProblems.test.ts

key-decisions:
  - "QUADRATIC_EQUATIONS_BUGS import causes RED at module level -- same pattern as prior domains"
  - "quadratic_equations gradeMap entry is 9 (Common Core HSA-REI standards start grade 9)"
  - "quadratic_equations expectedTypes uses ['multi_select'] -- first domain to use non-numeric answer type exclusively"

patterns-established:
  - "Wave 0 RED stub pattern: consistent across all 9 HS domain handlers + first answer format pipeline stub"

requirements-completed: [QUAD-01, QUAD-02, QUAD-03]

duration: 2min
completed: 2026-03-13
---

# Phase 087 Plan 01: Quadratic Equations RED Test Stubs Summary

**RED test stubs for quadratic_equations domain (6 skills, multi_select answers, 3 bugs) + formatAsMultiSelect pipeline function -- 2 new test files, 3 count-updated files, all failing until Wave 1 lands**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T22:42:00Z
- **Completed:** 2026-03-13T22:44:03Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created quadraticEquations.test.ts with 20 test cases covering registry, skills, templates, bugs, multi_select answer generation, distractor properties, integer roots, and skill-specific constraints
- Created multiSelect.test.ts with 6 test cases covering formatAsMultiSelect function (format, options, distractors, correctIndices, error handling)
- Updated domainHandlerRegistry.test.ts: 23->24 operations, 180->186 skills, added quadratic_equations with multi_select expectedType
- Updated prerequisiteGating.test.ts: 180->186 skill count assertion
- Updated wordProblems.test.ts: added quadratic_equations to ALL_OPERATIONS and gradeMap (grade 9)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create RED test stubs -- quadraticEquations.test.ts + multiSelect.test.ts** - `2ec4d23` (test)
2. **Task 2: Update count assertions in 3 existing test files** - `599b327` (test)

## Files Created/Modified
- `src/__tests__/mathEngine/quadraticEquations.test.ts` - RED test stubs for quadratic_equations domain (6 skills, 3 bugs, multi_select answers, distractor generation)
- `src/__tests__/mathEngine/multiSelect.test.ts` - RED test stubs for formatAsMultiSelect answer pipeline function (6 test cases)
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` - Updated operation count 23->24, skill count 180->186, added quadratic_equations to expectedTypes with multi_select
- `src/__tests__/adaptive/prerequisiteGating.test.ts` - Updated skill count assertion 180->186
- `src/__tests__/mathEngine/wordProblems.test.ts` - Added quadratic_equations to ALL_OPERATIONS and gradeMap (grade 9)

## Decisions Made
- QUADRATIC_EQUATIONS_BUGS import causes RED at module level, consistent with prior domain stubs
- quadratic_equations gradeMap entry is 9 (Common Core HSA-REI standards start in grade 9)
- quadratic_equations expectedTypes uses ['multi_select'] -- first domain to exclusively use non-numeric answer type
- multiSelect.test.ts uses makeMockProblem helper with multiSelectAnswer([3, -5]) and operands [-3, 5, -2, -15] matching the quadratic construction-from-answer pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- RED test stubs establish the contract for Wave 1 (Plan 02: handler, skills, templates, generators, formatAsMultiSelect)
- All tests fail as expected -- quadraticEquations at assertion level (handler undefined), multiSelect at import level (module not found)
- First domain to test multi_select answer type exclusively -- Plan 02 must wire formatAsMultiSelect into selectAndFormatAnswer pipeline

---
*Phase: 087-quadratic-equations-domain*
*Completed: 2026-03-13*
