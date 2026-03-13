---
phase: 083-coordinate-geometry-domain
plan: 01
subsystem: testing
tags: [jest, math-engine, coordinate-geometry, tdd, wave-0]

requires:
  - phase: 082-linear-equations-domain
    provides: linearEquations domain handler pattern — test stubs follow same structure

provides:
  - Wave 0 RED test stubs for coordinate_geometry domain (COORD-01 through COORD-04)
  - Updated domainHandlerRegistry.test.ts with 20 operations and 165 skill count
  - Fixed pre-existing prerequisiteGating.test.ts count discrepancy (151→165)
  - Updated wordProblems.test.ts coverage for coordinate_geometry at grade 8

affects:
  - 083-02 (coordinate_geometry handler implementation — turns these RED tests GREEN)
  - 083-03 (bug library, distractors, ALLOWS_NEGATIVES)
  - 091-integration (all domain counts depend on these test contracts)

tech-stack:
  added: []
  patterns:
    - Wave 0 test stub pattern — import non-existent module, all tests RED by design
    - slope FractionAnswer contract — type assertion + gcd reduced form + positive denominator
    - Inline gcd helper in test file (avoids external dependency for test-only utility)

key-files:
  created:
    - src/__tests__/mathEngine/coordinateGeometry.test.ts
  modified:
    - src/__tests__/mathEngine/domainHandlerRegistry.test.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts
    - src/__tests__/mathEngine/wordProblems.test.ts

key-decisions:
  - "coordinateGeometry.test.ts uses inline gcd helper — avoids importing from fractions/utils which may not be stable across refactors"
  - "prerequisiteGating count resolved 151→165 in one step — Phase 82 did not update it (151→159), this plan jumps directly to post-Phase-83 value"
  - "distractor test uses distance skill (not slope) to test numeric distractors — slope returns FractionAnswer which has different generateDistractors path"

patterns-established:
  - "Domain test: 6-skill coordinate_geometry follows same structure as 8-skill linear_equations"
  - "FractionAnswer tests: assert .type === 'fraction', then cast to access numerator/denominator fields"

requirements-completed: [COORD-01, COORD-02, COORD-03, COORD-04]

duration: 7min
completed: 2026-03-13
---

# Phase 083 Plan 01: Coordinate Geometry Domain Summary

**23 RED test stubs defining acceptance contracts for all 6 coordinate_geometry skills, FractionAnswer slope contract, 3-entry bug library (COORD-04), and domain_specific distractor strategy — plus three existing test files updated for the 20-operation, 165-skill post-Phase-83 state.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T18:56:22Z
- **Completed:** 2026-03-13T19:03:00Z
- **Tasks:** 2 of 2
- **Files modified:** 4

## Accomplishments

- Created coordinateGeometry.test.ts with 23 failing tests covering COORD-01 through COORD-04 contracts
- Updated domainHandlerRegistry.test.ts: 20 operations, 165 skills, coordinate_geometry answer types ['numeric', 'fraction']
- Fixed long-standing prerequisiteGating.test.ts count discrepancy (151→165, resolving Phase 82 miss + Phase 83 in one step)
- Updated wordProblems.test.ts: coordinate_geometry in ALL_OPERATIONS, gradeMap entry at grade 8

## Task Commits

Each task was committed atomically:

1. **Task 1: Create coordinateGeometry.test.ts with failing stubs** - `678daad` (test)
2. **Task 2: Update domainHandlerRegistry, prerequisiteGating, and wordProblems tests** - `e6ddbe5` (test)

## Files Created/Modified

- `src/__tests__/mathEngine/coordinateGeometry.test.ts` — 23 RED stubs: registry, 6 skills, integer answers, slope FractionAnswer (type/reduced/positive-denom), 3-entry COORDINATE_GEOMETRY_BUGS with descriptions, distractor generation, negative values allowed
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — added coordinate_geometry to ALL_OPERATIONS (19→20), updated skill count (159→165), added coordinate_geometry: ['numeric', 'fraction'] to expectedTypes
- `src/__tests__/adaptive/prerequisiteGating.test.ts` — fixed SKILLS.length assertion from 151 to 165
- `src/__tests__/mathEngine/wordProblems.test.ts` — added coordinate_geometry to ALL_OPERATIONS and gradeMap (grade 8)

## Decisions Made

- Used inline `gcd` helper in coordinateGeometry.test.ts rather than importing from fractions/utils — keeps the test self-contained and stable across internal refactors.
- Distractor generation test uses `distance` skill (integer answer) not `slope` (FractionAnswer) — generateDistractors path differs for fraction vs numeric answers, integer path is more straightforward for the RED stub.
- prerequisiteGating count updated directly to 165 (skipping the intermediate 159) — the pre-existing discrepancy means one atomic fix is cleaner than two incremental corrections.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all test files compiled without syntax errors. RED failures are assertion/import errors as expected for Wave 0.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Wave 0 complete — all four test files in RED state define the full acceptance contract for Phase 83
- Wave 1 (Plan 02) can begin: implement coordinateGeometry domain handler, skills, templates, and bug library to turn these tests GREEN
- The domainHandlerRegistry, prerequisiteGating, and wordProblems tests remain RED until Wave 1 also registers the handler and skills

---
*Phase: 083-coordinate-geometry-domain*
*Completed: 2026-03-13*
