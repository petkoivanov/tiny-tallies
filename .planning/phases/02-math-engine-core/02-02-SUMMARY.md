---
phase: 02-math-engine-core
plan: 02
subsystem: math-engine
tags: [typescript, problem-generation, templates, zod, deterministic, common-core]

# Dependency graph
requires:
  - phase: 02-math-engine-core
    provides: Types (Problem, ProblemTemplate), seeded PRNG (createRng), carry/borrow constraints, skill taxonomy
provides:
  - 14 problem templates (7 addition, 7 subtraction) for grades 1-3
  - generateProblem() and generateProblems() with Zod-validated params
  - Template registry with findTemplate, getTemplatesBySkill, getTemplatesByOperation
  - Public barrel export for math engine API
  - Type re-exports for external consumers
affects: [phase-03, phase-05, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [template-registry, operand-generation-with-constraints, zod-boundary-validation, round-robin-batch-generation]

key-files:
  created:
    - src/services/mathEngine/templates/addition.ts
    - src/services/mathEngine/templates/subtraction.ts
    - src/services/mathEngine/templates/index.ts
    - src/services/mathEngine/generator.ts
    - src/services/mathEngine/index.ts
    - src/types/mathEngine.ts
    - src/__tests__/mathEngine/addition.test.ts
    - src/__tests__/mathEngine/subtraction.test.ts
    - src/__tests__/mathEngine/generator.test.ts
  modified: []

key-decisions:
  - "MAX_ATTEMPTS=100 guard on operand generation to prevent infinite loops on tight constraints"
  - "Round-robin template selection in batch generation when multiple templates per skill"
  - "Subtraction constrains b upper bound to a-1 inline rather than post-filtering"
  - "Zod v4 schemas validate at API boundary only -- internal helpers use typed params"
  - "Problem ID format is templateId_seed for deterministic uniqueness"

patterns-established:
  - "Template registry pattern: readonly arrays + lookup functions (findTemplate, getTemplatesBySkill)"
  - "Zod boundary validation: parse at public API entry, type-safe internally"
  - "Barrel export pattern: flat re-exports from index.ts, no nested barrels"

requirements-completed: [MATH-01, MATH-02, MATH-03, MATH-04, MATH-08]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 2 Plan 2: Problem Templates & Generator Summary

**14 problem templates (addition/subtraction grades 1-3) with deterministic generator, Zod-validated params, carry/borrow constraint enforcement, and 95 new tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T19:00:54Z
- **Completed:** 2026-03-01T19:04:05Z
- **Tasks:** 3
- **Files created:** 9

## Accomplishments
- Defined 14 problem templates covering single-digit through three-digit addition and subtraction with carry/borrow variants
- Built deterministic generator that produces Problem objects with programmatically computed correct answers (never LLM)
- Implemented Zod v4 boundary validation for GenerationParams and BatchGenerationParams
- Created comprehensive test suite with 95 new tests proving correctness of all templates and generator behavior
- Established public barrel export providing clean API for downstream phases

## Task Commits

Each task was committed atomically:

1. **Task 1: Create addition and subtraction problem templates** - `b7df3b9` (feat)
2. **Task 2: Create generator function with Zod validation and barrel exports** - `57c87fe` (feat)
3. **Task 3: Create comprehensive tests for templates and generator** - `6b0d3b3` (test)

## Files Created/Modified
- `src/services/mathEngine/templates/addition.ts` - 7 addition ProblemTemplate definitions (grades 1-3, with/without carry)
- `src/services/mathEngine/templates/subtraction.ts` - 7 subtraction ProblemTemplate definitions (grades 1-3, with/without borrow)
- `src/services/mathEngine/templates/index.ts` - Template registry with ALL_TEMPLATES, findTemplate, getTemplatesBySkill, getTemplatesByOperation
- `src/services/mathEngine/generator.ts` - generateProblem(), generateProblems() with Zod validation and MAX_ATTEMPTS guard
- `src/services/mathEngine/index.ts` - Public barrel export for the entire math engine
- `src/types/mathEngine.ts` - Type re-exports for external consumers
- `src/__tests__/mathEngine/addition.test.ts` - 42 tests across 7 addition templates
- `src/__tests__/mathEngine/subtraction.test.ts` - 42 tests across 7 subtraction templates
- `src/__tests__/mathEngine/generator.test.ts` - 11 tests for generator determinism, validation, batch generation

## Decisions Made
- MAX_ATTEMPTS=100 guard on operand generation prevents infinite loops when constraints are tight
- Round-robin template selection in generateProblems() when a skill has multiple templates
- Subtraction constrains b's upper bound to a-1 inline (early in the loop) rather than generating and filtering
- Zod v4 schemas validate at public API boundary only; internal helpers use TypeScript types directly
- Problem ID format `templateId_seed` provides deterministic uniqueness without UUID

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Math engine core is complete: types, standards, skills, PRNG, constraints, templates, and generator all in place
- Phase 3 (Bug Library / misconception detection) can import generateProblem and requiresCarry/requiresBorrow
- Phase 5 (adaptive difficulty) can use the Elo ratings from templates and batch generation
- Public API via `src/services/mathEngine/index.ts` provides clean import surface

## Self-Check: PASSED

All 9 created files verified on disk. All three task commits (b7df3b9, 57c87fe, 6b0d3b3) found in git log. 121/121 tests passing (116 math engine + 5 Phase 1). TypeScript typecheck clean.

---
*Phase: 02-math-engine-core*
*Completed: 2026-03-01*
