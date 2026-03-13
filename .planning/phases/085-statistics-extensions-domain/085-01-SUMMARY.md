---
phase: 085-statistics-extensions-domain
plan: 01
subsystem: testing
tags: [jest, tdd, math-engine, statistics, wave-0, red-tests]

# Dependency graph
requires:
  - phase: 084-sequences-series-domain
    provides: sequences_series domain handler and registry pattern; prerequisiteGating at 170 skills
provides:
  - Failing Wave 0 test stubs for statistics_hs domain (20 tests)
  - Updated domainHandlerRegistry test: 22 operations, 175 skills, statistics_hs expectedTypes
  - Updated prerequisiteGating test: SKILLS.length 175
  - Updated wordProblems test: statistics_hs in ALL_OPERATIONS and gradeMap grade 9
affects: [085-02, 085-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave 0 RED stubs: test file created before implementation, all tests fail until Wave 1 lands"
    - "statistics_hs test follows sequencesSeries.test.ts structure: registry, skills, integer answers, z-score bounds, bug library, distractors"

key-files:
  created:
    - src/__tests__/mathEngine/statisticsHs.test.ts
  modified:
    - src/__tests__/mathEngine/domainHandlerRegistry.test.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts
    - src/__tests__/mathEngine/wordProblems.test.ts

key-decisions:
  - "statistics_hs z-score bounds test uses [-2, 2] range — generator constrained to small integer z-scores for grade 9"
  - "statistics_hs word problem grade is 9 in gradeMap — aligns with Common Core HSS.ID"
  - "STATISTICS_HS_BUGS expected to have exactly 3 entries: stats_zscore_sign_flip, stats_zscore_forgot_mean, stats_normal_wrong_band"

patterns-established:
  - "Wave 0 pattern: test z-score bounds separately from general integer-answer test — domain-specific bound constraint"

requirements-completed: [STATS-01, STATS-02, STATS-03, STATS-04]

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 085 Plan 01: Statistics HS Domain Summary

**Wave 0 RED test stubs for statistics_hs domain: 20 tests across 4 files verifying 5 skills, 3 bug patterns, z-score bounds, and distractor generation contracts**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T21:17:05Z
- **Completed:** 2026-03-13T21:25:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created statisticsHs.test.ts with 20 RED tests covering all acceptance contracts for STATS-01 through STATS-04
- Updated domainHandlerRegistry.test.ts: 21→22 operations, 170→175 skills, statistics_hs answer types entry
- Updated prerequisiteGating.test.ts: SKILLS.length assertion 170→175
- Updated wordProblems.test.ts: statistics_hs added to ALL_OPERATIONS and gradeMap at grade 9

## Task Commits

Each task was committed atomically:

1. **Task 1: Create statisticsHs.test.ts with failing stubs** - `21b37c3` (test)
2. **Task 2: Update domainHandlerRegistry, prerequisiteGating, and wordProblems tests** - `59974a8` (test)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/__tests__/mathEngine/statisticsHs.test.ts` - 20 Wave 0 RED stubs for statistics_hs domain
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` - 22 ops, 175 skills, statistics_hs expectedTypes
- `src/__tests__/adaptive/prerequisiteGating.test.ts` - SKILLS.length 170→175
- `src/__tests__/mathEngine/wordProblems.test.ts` - statistics_hs in ALL_OPERATIONS and gradeMap

## Decisions Made
- z-score bounds test uses [-2, 2] integer range — statistics_hs generator must constrain z-scores to small integers suitable for grade 9
- statistics_hs gradeMap entry is 9 (Common Core HSS.ID.A standards start in grade 9)
- Bug IDs follow domain prefix pattern: stats_zscore_sign_flip, stats_zscore_forgot_mean, stats_normal_wrong_band

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 test files contain correct RED contracts
- Wave 1 (085-02) can implement statisticsHs domain handler against these stubs
- prerequisiteGating and registry tests will turn GREEN automatically once Wave 1 lands all 5 skills

---
*Phase: 085-statistics-extensions-domain*
*Completed: 2026-03-13*
