---
phase: 084-sequences-series-domain
plan: "01"
subsystem: math-engine-tests
tags: [tdd, wave-0, sequences-series, test-stubs, red-tests]
dependency_graph:
  requires: [083-03-PLAN.md]
  provides: [sequences_series Wave 0 RED test contracts]
  affects: [domainHandlerRegistry.test.ts, prerequisiteGating.test.ts, wordProblems.test.ts]
tech_stack:
  added: []
  patterns: [Wave 0 TDD stubs, coordinateGeometry.test.ts pattern]
key_files:
  created:
    - src/__tests__/mathEngine/sequencesSeries.test.ts
  modified:
    - src/__tests__/mathEngine/domainHandlerRegistry.test.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts
    - src/__tests__/mathEngine/wordProblems.test.ts
decisions:
  - "arithmetic_partial_sum skill deferred to Phase 85+ — 5 skills implemented instead of 6 (matches frontmatter SKILL COUNT DECISION)"
  - "sequences_series answers are all numeric (no FractionAnswer) — geometric sequences use integer ratios capped at ratio ≤ 3 for grade 9"
  - "distractor test follows coordinateGeometry.test.ts pattern (full Problem object) — plan's described signature was aspirational, actual signature requires Problem"
metrics:
  duration: "~2 minutes"
  completed: "2026-03-13"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 3
---

# Phase 84 Plan 01: Sequences & Series Wave 0 Test Stubs Summary

Wave 0 RED test stubs defining acceptance contracts for all five sequences_series skills plus updates to three existing test files whose hardcoded operation counts and skill totals change when sequences_series is added.

## What Was Built

**New file: `src/__tests__/mathEngine/sequencesSeries.test.ts`** (156 lines)

20 tests covering:
- Handler registration for `sequences_series`
- 5 skill IDs: `arithmetic_next_term`, `arithmetic_nth_term`, `geometric_next_term`, `geometric_nth_term`, `seq_word_problem`
- Template existence and `distractorStrategy === 'domain_specific'` for all templates
- Integer-valued answers across seeds 1-20 for all 5 skills
- Geometric bounds: `geometric_nth_term` answers < 2000 across seeds 1-20
- `SEQUENCES_SERIES_BUGS` has exactly 3 entries (`seq_arithmetic_wrong_step`, `seq_arithmetic_off_by_one`, `seq_geometric_uses_arithmetic`)
- Each bug has a non-empty `description` string
- All bug patterns target `sequences_series` operation
- `generateDistractors` returns 3 distractors, none equal to correct answer

18 tests FAIL (RED), 2 pass (structural — `it.each` with skill IDs).

**Updated: `src/__tests__/mathEngine/domainHandlerRegistry.test.ts`**
- Added `'sequences_series'` to `ALL_OPERATIONS` (20 → 21)
- Updated two `it()` descriptions from '20 operations' to '21 operations'
- Updated `expect(total).toBe(165)` → `expect(total).toBe(170)`
- Added `sequences_series: ['numeric']` to `expectedTypes` object

**Updated: `src/__tests__/adaptive/prerequisiteGating.test.ts`**
- Updated `expect(SKILLS.length).toBe(165)` → `expect(SKILLS.length).toBe(170)`

**Updated: `src/__tests__/mathEngine/wordProblems.test.ts`**
- Added `'sequences_series'` to `ALL_OPERATIONS` (20 → 21)
- Added `sequences_series: 9` to `gradeMap` (sequences starts at grade 9)

## Verification State

All 4 test files fail with import/assertion errors, not syntax errors. No pre-existing passing tests were broken. Wave 1 will turn these GREEN by implementing the domain handler, skills, templates, and bug patterns.

```
sequencesSeries.test.ts:       18 failed, 2 passed — RED (correct)
domainHandlerRegistry.test.ts: fails (sequences_series not in MathDomain union) — RED
prerequisiteGating.test.ts:    fails (165 ≠ 170) — RED
wordProblems.test.ts:          fails (sequences_series not in MathDomain union) — RED
```

## Commits

| Hash    | Message |
| ------- | ------- |
| f2e8b51 | test(084-01): add failing Wave 0 stubs for sequences_series domain |
| be0a2a8 | test(084-01): update registry, gating, and wordProblems tests for sequences_series |

## Deviations from Plan

**1. [Rule 1 - Bug] Distractor test builds full Problem object instead of using raw arguments**
- **Found during:** Task 1
- **Issue:** Plan described `generateDistractors(result.correctAnswer, result.operands, 'sequences_series', createRng(1))` but actual signature is `generateDistractors(problem: Problem, rng, count, strategy)`
- **Fix:** Followed `coordinateGeometry.test.ts` pattern — built a complete Problem object with all required fields, then called `generateDistractors(problem, createRng(1), 3, 'domain_specific')`
- **Files modified:** `src/__tests__/mathEngine/sequencesSeries.test.ts`
- **Commit:** f2e8b51

## Self-Check: PASSED
