---
phase: 083-coordinate-geometry-domain
plan: 02
subsystem: mathEngine
tags: [coordinate-geometry, domain-handler, bug-library, skills, templates, fractions]

# Dependency graph
requires:
  - phase: 082-linear-equations-domain
    provides: DomainHandler pattern, linear_equations domain reference implementation
  - phase: 083-01
    provides: Wave 0 RED test stubs for coordinate_geometry domain (4 test files)

provides:
  - coordinate_geometry DomainHandler dispatching on 6 config types
  - 6 generator functions using construction-from-answer pattern
  - 6 SkillDefinition entries for grades 8-10
  - 7 ProblemTemplate entries (2 midpoint variants), all with domain_specific distractors
  - 3 BugPattern entries with formula-identification description strings for AI tutor
  - fractionAnswer factory function in types.ts
  - coordinate_geometry in MathDomain union
  - ALLOWS_NEGATIVES includes coordinate_geometry

affects:
  - 091-integration (prerequisite DAG now includes coord geometry skills)
  - AI tutor (COORD-04 bug descriptions feed tutor Socratic hints)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "construction-from-answer: pick correct answer first, build problem around it"
    - "Pythagorean triples hardcoded list for guaranteed integer distance answers"
    - "same-parity construction for integer midpoint answers"
    - "FractionAnswer with reduced form and positive denominator for slope"

key-files:
  created:
    - src/services/mathEngine/domains/coordinateGeometry/generators.ts
    - src/services/mathEngine/domains/coordinateGeometry/coordinateGeometryHandler.ts
    - src/services/mathEngine/domains/coordinateGeometry/index.ts
    - src/services/mathEngine/skills/coordinateGeometry.ts
    - src/services/mathEngine/templates/coordinateGeometry.ts
    - src/services/mathEngine/bugLibrary/coordinateGeometryBugs.ts
  modified:
    - src/services/mathEngine/types.ts
    - src/services/mathEngine/bugLibrary/validation.ts
    - src/services/mathEngine/bugLibrary/index.ts
    - src/services/mathEngine/bugLibrary/distractorGenerator.ts
    - src/services/mathEngine/skills/index.ts
    - src/services/mathEngine/templates/index.ts
    - src/services/mathEngine/domains/index.ts
    - src/services/mathEngine/domains/registry.ts
    - src/__tests__/mathEngine/coordinateGeometry.test.ts

key-decisions:
  - "coord_word_problem skill ID (not bare 'word_problem') avoids collision with linear_equations bare word_problem skill ID"
  - "handler supports 'word_problem' domainConfig.type as fallback to generateDistance for cross-domain template safety"
  - "fractionAnswer factory added to types.ts alongside numericAnswer — symmetry in Answer factory API"
  - "videoMap.ts future domain entries (sequences_series etc) moved to comments — were invalid MathDomain keys exposed by adding coordinate_geometry to the union"

patterns-established:
  - "Domain word_problem skills: use domain-prefixed ID (coord_word_problem) not bare 'word_problem' to avoid cross-domain ID collisions in computeNodePositions/computeEdgePaths"

requirements-completed: [COORD-01, COORD-02, COORD-04]

# Metrics
duration: 10min
completed: 2026-03-13
---

# Phase 83 Plan 02: Coordinate Geometry Domain Summary

**coordinate_geometry DomainHandler with 6 generators (slope/distance/midpoint/line equation), FractionAnswer slope, integer distance via Pythagorean triples, and 3 AI tutor bug patterns for formula-identification misconceptions**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-13T19:01:12Z
- **Completed:** 2026-03-13T19:10:55Z
- **Tasks:** 3
- **Files modified:** 19

## Accomplishments

- All 6 generator functions implemented with construction-from-answer pattern; slope returns FractionAnswer in reduced form with positive denominator across all seeds
- Distance generator uses hardcoded Pythagorean triples list for guaranteed integer answers without relying on floating-point square roots
- All 4 target test suites GREEN: coordinateGeometry, domainHandlerRegistry (20 ops, 165 skills), prerequisiteGating, distractorGenerator

## Task Commits

1. **Task 1: Skills, templates, bug patterns** - `e9b4f75` (feat)
2. **Task 2: Domain handler with 6 generators** - `657e5af` (feat)
3. **Task 3: Wire into all index/registry files** - `f662dbf` (feat)

## Files Created/Modified

- `src/services/mathEngine/domains/coordinateGeometry/generators.ts` - 6 generator functions with operand layout docs
- `src/services/mathEngine/domains/coordinateGeometry/coordinateGeometryHandler.ts` - DomainHandler dispatching on 6 config types + word_problem fallback
- `src/services/mathEngine/domains/coordinateGeometry/index.ts` - barrel export
- `src/services/mathEngine/skills/coordinateGeometry.ts` - 6 SkillDefinition entries
- `src/services/mathEngine/templates/coordinateGeometry.ts` - 7 ProblemTemplate entries (2 midpoint variants)
- `src/services/mathEngine/bugLibrary/coordinateGeometryBugs.ts` - 3 BugPattern entries
- `src/services/mathEngine/types.ts` - coordinate_geometry added to MathDomain; fractionAnswer factory added
- `src/services/mathEngine/bugLibrary/validation.ts` - coordinate_geometry in ALLOWS_NEGATIVES
- `src/services/mathEngine/bugLibrary/distractorGenerator.ts` - BUGS_BY_OPERATION entry
- `src/services/mathEngine/bugLibrary/index.ts` - COORDINATE_GEOMETRY_BUGS re-export
- `src/services/mathEngine/skills/index.ts` - COORDINATE_GEOMETRY_SKILLS spread
- `src/services/mathEngine/templates/index.ts` - COORDINATE_GEOMETRY_TEMPLATES spread
- `src/services/mathEngine/domains/index.ts` - coordinateGeometryHandler re-export
- `src/services/mathEngine/domains/registry.ts` - HANDLERS entry
- `src/__tests__/mathEngine/coordinateGeometry.test.ts` - skill ID updated: word_problem -> coord_word_problem
- `src/components/reports/SkillDomainSummary.tsx` - coordinate_geometry label added
- `src/components/skillMap/skillMapColors.ts` - coordinate_geometry colors added
- `src/services/tutor/problemIntro.ts` - coordinate_geometry intro string added
- `src/services/video/videoMap.ts` - future domain entries moved to comments

## Decisions Made

- `coord_word_problem` skill ID instead of bare `word_problem` — avoids collision with `linear_equations` domain's `word_problem` skill ID. `computeNodePositions` and `computeEdgePaths` use skill IDs as Map keys; duplicates silently drop one node and cause missing edges in `skillMapLayout.test.ts`.
- Handler supports `'word_problem'` domainConfig.type as fallback dispatching to `generateDistance` — provides safety if a `word_problem`-typed template reaches the coordinator handler via `getTemplatesBySkill` collision.
- `fractionAnswer` factory added to `types.ts` — the interface document referenced it as an exported function but it was absent; added for symmetry with `numericAnswer`.
- Future domain video IDs (`sequences_series`, etc.) moved to comments in `videoMap.ts` — adding `coordinate_geometry` to `MathDomain` exposed that these keys were invalid in `Partial<Record<MathDomain, string>>`. Commented out; each future phase should add its own entry when its domain lands.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] `fractionAnswer` factory function missing from types.ts**
- **Found during:** Task 2 (generators implementation)
- **Issue:** `generators.ts` imports `fractionAnswer` from types.ts but it was not exported there (only `FractionAnswer` interface and `numericAnswer` factory existed)
- **Fix:** Added `fractionAnswer(numerator, denominator): FractionAnswer` factory alongside `numericAnswer`
- **Files modified:** `src/services/mathEngine/types.ts`
- **Committed in:** e9b4f75 (Task 1 commit)

**2. [Rule 2 - Missing Critical] SkillDomainSummary, skillMapColors, problemIntro missing coordinate_geometry entries**
- **Found during:** Task 3 (wiring — typecheck revealed exhaustive Record<MathDomain, ...> mismatches)
- **Issue:** Three files use `Record<MathDomain, ...>` or indexed access on MathDomain keys; adding coordinate_geometry to MathDomain made them fail typecheck
- **Fix:** Added `coordinate_geometry` entry to each: 'Coordinate Geometry' label, purple color palette, problem intro string
- **Files modified:** `SkillDomainSummary.tsx`, `skillMapColors.ts`, `problemIntro.ts`
- **Committed in:** f662dbf (Task 3 commit)

**3. [Rule 1 - Bug] videoMap.ts future domain keys caused TypeScript error after MathDomain update**
- **Found during:** Task 3 (typecheck)
- **Issue:** `sequences_series`, `statistics_hs`, etc. were in `videoMap` object literal but are not yet in `MathDomain` union. Adding `coordinate_geometry` to the union caused TypeScript to re-check the entire object, now failing on those future keys.
- **Fix:** Moved future domain video IDs to commented-out lines; each future phase plan should add its video ID when that domain lands.
- **Files modified:** `src/services/video/videoMap.ts`
- **Committed in:** f662dbf (Task 3 commit)

**4. [Rule 1 - Bug] Duplicate `word_problem` skill ID between linear_equations and coordinate_geometry**
- **Found during:** Task 3 verification (skillMapLayout.test.ts began failing)
- **Issue:** Linear_equations domain already has a skill with id `'word_problem'`. Adding a second `word_problem` in coordinate_geometry caused `computeNodePositions` (Map keyed by skillId) to silently overwrite, dropping one edge in `computeEdgePaths`.
- **Fix:** Renamed coord geometry skill to `coord_word_problem` and updated the Wave 0 test stub accordingly. Handler's switch statement retains `'word_problem'` case as defensive fallback.
- **Files modified:** `coordinateGeometry.ts` (skills), `coordinateGeometry.ts` (templates), `coordinateGeometryHandler.ts`, `coordinateGeometry.test.ts`
- **Committed in:** f662dbf (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (1 missing critical factory, 1 missing critical exhaustive-record entries, 1 bug-hidden-by-prior-error, 1 duplicate-ID architectural bug)
**Impact on plan:** All auto-fixes required for type safety and test correctness. No scope creep.

## Issues Encountered

- TypeScript revealed `sequences_series` and other future-domain keys in videoMap.ts were invalid only AFTER `coordinate_geometry` was added to MathDomain (the prior `coordinate_geometry` type error masked them). Resolved by moving future keys to comments.
- Pre-existing test failures in `skills.test.ts` (expects 151 skills, grades 1-8 only), `catEngine.test.ts` (expects grades <=8), and `wordProblems.test.ts` were present before this plan and remain unchanged — not introduced by this plan.

## Next Phase Readiness

- Coordinate geometry domain fully wired: handler, skills, templates, bug patterns, registry, distractor validation, video map, skill map colors, domain summary labels, tutor intros
- All Wave 0 RED tests are now GREEN
- Phase 083-03 (integration/verification) has full implementation to verify against

## Self-Check: PASSED

- generators.ts: FOUND
- coordinateGeometryHandler.ts: FOUND
- skills/coordinateGeometry.ts: FOUND
- templates/coordinateGeometry.ts: FOUND
- coordinateGeometryBugs.ts: FOUND
- e9b4f75 (Task 1 commit): FOUND
- 657e5af (Task 2 commit): FOUND
- f662dbf (Task 3 commit): FOUND

---
*Phase: 083-coordinate-geometry-domain*
*Completed: 2026-03-13*
