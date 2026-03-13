---
phase: 082-linear-equations-domain
plan: "01"
subsystem: math-engine
tags: [tdd, wave-0, linear-equations, bug-library, test-stubs]
dependency_graph:
  requires: []
  provides: [lin-wave0-tests]
  affects: [082-02, 082-03, 082-04]
tech_stack:
  added: []
  patterns: [wave-0-red-stubs, service-engine-test-template]
key_files:
  created:
    - src/__tests__/mathEngine/linearEquations.test.ts
  modified:
    - src/__tests__/mathEngine/domainHandlerRegistry.test.ts
    - src/__tests__/mathEngine/wordProblems.test.ts
decisions:
  - "Wave 0 RED stubs only — no implementation; all tests fail by design"
  - "linear_equations cast as MathDomain to allow test authoring before type union is updated"
  - "gradeMap entry for linear_equations set to grade 6 (matches algebra curriculum)"
metrics:
  duration_minutes: 2
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 2
  completed_date: "2026-03-13"
---

# Phase 082 Plan 01: Linear Equations Wave 0 Test Stubs Summary

**One-liner:** RED test stubs defining acceptance contracts for all 8 linear_equations skills, 3 bug patterns, negative-solution support, and domain_specific distractor strategy — failing until Wave 1 lands.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create linearEquations.test.ts with failing stubs | b24a73b | src/__tests__/mathEngine/linearEquations.test.ts |
| 2 | Update domainHandlerRegistry.test.ts and wordProblems.test.ts | 808661d | domainHandlerRegistry.test.ts, wordProblems.test.ts |

## What Was Built

**Task 1 — linearEquations.test.ts (new file, 169 lines):**

20 test assertions covering the full Wave 1 acceptance contract:
- Registry: `getHandler('linear_equations')` is registered and returns a handler with `.generate()`
- Skills: exactly 8 skills for `linear_equations` operation, all 8 IDs present (`one_step_addition`, `one_step_multiplication`, `two_step_add_mul`, `two_step_sub_div`, `two_step_mixed`, `multi_step`, `negative_solution`, `word_problem`)
- Templates: every skill has at least one template; all templates use `distractorStrategy: 'domain_specific'`
- Generator: produces integer `correctAnswer` values for all 8 skills across seeds 1–20
- Bug Library: `LINEAR_EQUATIONS_BUGS` has exactly 3 entries (`lin_wrong_operation`, `lin_sign_flip`, `lin_forgot_to_divide`), each with non-empty `description` string
- Distractors: `generateDistractors` returns 3 distractors, none equal to correct answer
- Negative solutions: `negative_solution` skill produces `x < 0` within seeds 1–20
- Validation: `isValidDistractor(-5, 3, 'linear_equations')` returns `true`

**Task 2 — registry and word problems test updates:**

`domainHandlerRegistry.test.ts`:
- `ALL_OPERATIONS` array: added `'linear_equations'` (18 → 19 operations)
- Test label updated: "18 operations" → "19 operations"
- Skill count assertion: `151` → `159` (8 new linear_equations skills)
- `expectedTypes` object: added `linear_equations: ['numeric']`

`wordProblems.test.ts`:
- `ALL_OPERATIONS` array: added `'linear_equations'` (18 → 19 operations)
- `gradeMap` in "every non-excluded operation generates a word problem" test: added `linear_equations: 6`

## Current Test Status (Wave 0 — expected RED)

| File | Tests | Status |
|------|-------|--------|
| linearEquations.test.ts | 17 fail, 3 pass | RED (module not found) |
| domainHandlerRegistry.test.ts | 7 fail, 33 pass | RED (no handler/skills) |
| wordProblems.test.ts | included in registry run | RED (no wp templates) |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `src/__tests__/mathEngine/linearEquations.test.ts` exists (created)
- [x] `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` updated with `linear_equations`
- [x] `src/__tests__/mathEngine/wordProblems.test.ts` updated with `linear_equations`
- [x] All three files compile without syntax errors (failures are runtime/assertion, not parse)
- [x] Commits b24a73b and 808661d exist in git log
