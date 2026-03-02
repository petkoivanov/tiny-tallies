---
phase: 03-bug-library-answer-formats
plan: 01
subsystem: math-engine
tags: [misconceptions, distractors, bug-library, tdd, seeded-rng]

# Dependency graph
requires:
  - phase: 02-math-engine-core
    provides: "Problem type, SeededRng, carry/borrow detection, templates, generator"
provides:
  - "11 misconception-based bug patterns (6 addition, 5 subtraction)"
  - "Three-phase distractor assembly algorithm (generateDistractors)"
  - "Distractor validation utility (isValidDistractor)"
  - "Deterministic Fisher-Yates shuffle (shuffleArray)"
  - "BugPattern, DistractorResult, DistractorSource types"
affects: [03-02 answer-format-presentation, misconception-detection, adaptive-difficulty]

# Tech tracking
tech-stack:
  added: []
  patterns: [bug-library-pattern, three-phase-assembly, column-iteration-misconceptions]

key-files:
  created:
    - src/services/mathEngine/bugLibrary/types.ts
    - src/services/mathEngine/bugLibrary/additionBugs.ts
    - src/services/mathEngine/bugLibrary/subtractionBugs.ts
    - src/services/mathEngine/bugLibrary/validation.ts
    - src/services/mathEngine/bugLibrary/distractorGenerator.ts
    - src/services/mathEngine/bugLibrary/index.ts
    - src/__tests__/mathEngine/bugLibrary.test.ts
    - src/__tests__/mathEngine/distractorGenerator.test.ts
  modified: []

key-decisions:
  - "Merged sub_no_borrow into sub_smaller_from_larger (identical column-wise computation) and replaced with sub_zero_confusion pattern"
  - "Off-by-one patterns excluded from Phase 1 bug-library and reserved for Phase 2 adjacent slot to avoid duplication"
  - "Deterministic fallback after 50 random iterations using offset increments from correctAnswer"

patterns-established:
  - "Bug pattern compute functions: return number|null, null means not applicable"
  - "Three-phase distractor assembly: bug-library -> adjacent -> random fallback"
  - "Distractor validation: positive, non-duplicate, plausible range, age-appropriate"

requirements-completed: [MATH-05]

# Metrics
duration: 4min
completed: 2026-03-02
---

# Phase 3 Plan 1: Bug Library & Distractor Generator Summary

**11 misconception-based bug patterns (6 addition, 5 subtraction) with three-phase distractor assembly algorithm guaranteeing exactly 3 unique, valid distractors per problem**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-02T02:28:43Z
- **Completed:** 2026-03-02T02:33:17Z
- **Tasks:** 2
- **Files created:** 8

## Accomplishments

- Implemented 11 bug patterns modeling real student misconceptions: no-carry, carry-wrong-column, concatenation, digit-reversal (addition); smaller-from-larger, zero-confusion, borrow-forget-reduce (subtraction); plus off-by-one variants for both operations
- Built three-phase distractor assembly: Phase 1 selects up to 2 misconception-based distractors, Phase 2 adds adjacent off-by-one, Phase 3 fills remaining slots with random fallback -- always producing exactly 3
- Full TDD coverage with 46 new tests (36 bug pattern + validation, 10 generator invariants) passing alongside 121 existing tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Bug Library types, patterns, and validation** (TDD)
   - `285bab0` test(03-01): add failing tests for bug library patterns and validation
   - `5dea0df` feat(03-01): implement bug library types, 11 bug patterns, and validation utilities

2. **Task 2: Three-phase distractor assembly algorithm** (TDD)
   - `d488d2f` test(03-01): add failing tests for distractor generator assembly algorithm
   - `05ee60f` feat(03-01): implement three-phase distractor generator with barrel exports

## Files Created/Modified

- `src/services/mathEngine/bugLibrary/types.ts` - DistractorSource, BugPattern, DistractorResult type definitions
- `src/services/mathEngine/bugLibrary/additionBugs.ts` - 6 addition misconception patterns (no-carry, carry-wrong-column, off-by-one+/-, concat, reverse-digits)
- `src/services/mathEngine/bugLibrary/subtractionBugs.ts` - 5 subtraction misconception patterns (smaller-from-larger, zero-confusion, borrow-forget-reduce, off-by-one+/-)
- `src/services/mathEngine/bugLibrary/validation.ts` - isValidDistractor filter and deterministic shuffleArray
- `src/services/mathEngine/bugLibrary/distractorGenerator.ts` - Three-phase assembly algorithm (generateDistractors)
- `src/services/mathEngine/bugLibrary/index.ts` - Barrel export for all bug library public API
- `src/__tests__/mathEngine/bugLibrary.test.ts` - 36 tests for bug patterns and validation
- `src/__tests__/mathEngine/distractorGenerator.test.ts` - 10 tests for distractor assembly invariants and edge cases

## Decisions Made

- **Merged sub_no_borrow into sub_smaller_from_larger:** Per plan guidance, these produce identical column-wise computations. Replaced sub_no_borrow with sub_zero_confusion (30-7 -> 37) which models a distinct and common misconception.
- **Off-by-one in Phase 2 only:** Off-by-one patterns are excluded from Phase 1 bug-library selection to avoid duplication with the Phase 2 adjacent slot, which already handles correctAnswer +/- 1.
- **Deterministic fallback:** After 50 random iterations, falls back to systematic offset search (correctAnswer +/- 2, 3, 4...) to guarantee exactly 3 distractors even in extremely tight ranges.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed template IDs in distractor generator tests**
- **Found during:** Task 2 (writing tests)
- **Issue:** Test used hyphenated template IDs (e.g., 'add-1d-no-carry') but actual templates use underscores (e.g., 'add_single_digit_no_carry')
- **Fix:** Updated all 20 template IDs in test to match actual template definitions
- **Files modified:** src/__tests__/mathEngine/distractorGenerator.test.ts
- **Verification:** All tests pass with correct template IDs
- **Committed in:** 05ee60f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Template ID format mismatch caught during TDD RED phase. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Bug library module complete and exported via barrel at `src/services/mathEngine/bugLibrary/`
- Ready for Plan 03-02 (answer format presentation) to consume generateDistractors for multiple-choice option assembly
- Ready for future misconception detection to use bugId provenance from DistractorResult

## Self-Check: PASSED

All 8 files exist. All 4 commits verified (285bab0, 5dea0df, d488d2f, 05ee60f).

---
*Phase: 03-bug-library-answer-formats*
*Completed: 2026-03-02*
