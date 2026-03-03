---
phase: 02-math-engine-core
plan: 01
subsystem: math-engine
tags: [typescript, types, common-core, prng, constraints, pure-functions]

# Dependency graph
requires:
  - phase: 01-project-scaffolding
    provides: Store slices with Record<string, SkillState> and SessionAnswer types
provides:
  - Math engine type definitions (Problem, ProblemTemplate, GenerationParams, SkillDefinition)
  - Common Core standards constants for addition/subtraction grades 1-3
  - Skill taxonomy with 14 skills (7 addition + 7 subtraction)
  - Seeded PRNG (mulberry32) for deterministic problem generation
  - Carry/borrow detection functions for constraint enforcement
affects: [02-02-PLAN, phase-03, phase-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [template-registry-types, dot-delimited-skill-ids, seeded-prng, column-iteration-constraints]

key-files:
  created:
    - src/services/mathEngine/types.ts
    - src/services/mathEngine/standards.ts
    - src/services/mathEngine/skills.ts
    - src/services/mathEngine/seededRng.ts
    - src/services/mathEngine/constraints.ts
    - src/__tests__/mathEngine/seededRng.test.ts
    - src/__tests__/mathEngine/constraints.test.ts
  modified: []

key-decisions:
  - "Flat type definitions with no class hierarchies -- pure interfaces and type aliases"
  - "Skill IDs use dot-delimited format (operation.scope.variant) compatible with Record<string, SkillState>"
  - "Mulberry32 PRNG chosen over external dependency -- 15 lines, sufficient distribution for number selection"
  - "Carry/borrow detection uses column-iteration algorithm covering all digit positions"

patterns-established:
  - "Pure function math engine: no side effects, no store mutation, deterministic from seed"
  - "Skill taxonomy as readonly array with helper lookup functions"
  - "Standards as const object with derived StandardCode type"

requirements-completed: [MATH-04, MATH-08]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 2 Plan 1: Math Engine Foundation Summary

**Type definitions, 17 Common Core standards, 14-skill taxonomy, mulberry32 PRNG, and carry/borrow column detection for programmatic problem generation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T18:56:39Z
- **Completed:** 2026-03-01T18:58:15Z
- **Tasks:** 2
- **Files created:** 7

## Accomplishments
- Defined all math engine types (Problem, ProblemTemplate, GenerationParams, SkillDefinition) under TypeScript strict mode
- Mapped 17 Common Core addition/subtraction standards for grades 1-3 with StandardCode type
- Created 14-skill taxonomy with dot-delimited IDs, prerequisite chains, and three lookup helpers
- Implemented deterministic mulberry32 seeded PRNG with next() and intRange() methods
- Built carry/borrow detection functions iterating all digit columns plus operand validation
- All 21 new tests pass alongside 5 existing Phase 1 tests (26 total)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create math engine types, standards, and skill taxonomy** - `59cc502` (feat)
2. **Task 2: Create seeded PRNG and carry/borrow constraint utilities with tests** - `2553d50` (feat)

## Files Created/Modified
- `src/services/mathEngine/types.ts` - Problem, ProblemTemplate, GenerationParams, SkillDefinition, Operation, Grade types
- `src/services/mathEngine/standards.ts` - 17 Common Core standard codes with descriptions, StandardCode type
- `src/services/mathEngine/skills.ts` - 14 skill definitions with helpers (getSkillById, getSkillsByOperation, getSkillsByGrade)
- `src/services/mathEngine/seededRng.ts` - Mulberry32 deterministic PRNG with SeededRng interface
- `src/services/mathEngine/constraints.ts` - requiresCarry, requiresBorrow, validateOperands functions
- `src/__tests__/mathEngine/seededRng.test.ts` - 5 tests: determinism, different seeds, bounds, intRange, equal min/max
- `src/__tests__/mathEngine/constraints.test.ts` - 16 tests: carry detection (7), borrow detection (6), validation (3)

## Decisions Made
- Flat type definitions with no class hierarchies -- pure interfaces and type aliases only
- Skill IDs use dot-delimited format (operation.scope.variant) compatible with existing Record<string, SkillState>
- Mulberry32 PRNG chosen over external dependency (pure-rand) -- 15 lines, sufficient distribution for number selection
- Carry/borrow detection uses column-iteration algorithm rather than single-column check, covering all digit positions
- Constraints module uses immutable local variables rather than mutating parameters

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All types, standards, skills, PRNG, and constraint utilities ready for Plan 02 (templates and generator)
- Plan 02 will import types from types.ts, skills from skills.ts, createRng from seededRng.ts, and requiresCarry/requiresBorrow from constraints.ts
- Template registry pattern established via ProblemTemplate type definition

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (59cc502, 2553d50) found in git log. 26/26 tests passing. TypeScript typecheck clean.

---
*Phase: 02-math-engine-core*
*Completed: 2026-03-01*
