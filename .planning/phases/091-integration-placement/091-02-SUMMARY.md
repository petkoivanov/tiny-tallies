---
phase: 091-integration-placement
plan: 02
subsystem: math-engine, ui
tags: [prerequisite-dag, skill-map, scroll-view, cross-domain-edges]

# Dependency graph
requires:
  - phase: 082-linear-equations-domain
    provides: "linear_equations skills (multi_step, one_step_addition)"
  - phase: 089-exponential-functions-domain
    provides: "exponential_functions skills (exp_evaluate)"
  - phase: 088-polynomials-domain
    provides: "polynomials skills (foil_expansion)"
provides:
  - "Complete cross-domain prerequisite DAG for all HS domains"
  - "Horizontally scrollable skill map supporting 27 columns"
  - "MIN_COLUMN_SPACING constant for layout consistency"
  - "LayoutResult type for computeNodePositions return value"
affects: [skill-map, prerequisite-gating, adaptive-engine]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "LayoutResult return type pattern for computeNodePositions (nodes + contentWidth)"
    - "ScrollView horizontal wrapping for wide SVG content"

key-files:
  created: []
  modified:
    - src/services/mathEngine/skills/polynomials.ts
    - src/services/mathEngine/skills/exponentialFunctions.ts
    - src/components/skillMap/skillMapLayout.ts
    - src/components/skillMap/SkillMapGraph.tsx
    - src/components/skillMap/index.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts
    - src/__tests__/components/skillMapLayout.test.ts

key-decisions:
  - "Used exponents.evaluate instead of plan's exponents.integer-exponent (non-existent ID) as prerequisite for exp_evaluate"

patterns-established:
  - "LayoutResult type: computeNodePositions returns { nodes, contentWidth } for dynamic SVG sizing"

requirements-completed: [INT-02, INT-03]

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 091 Plan 02: Cross-Domain Prerequisites + Skill Map 27-Column Layout Summary

**Cross-domain prerequisite edges wired for polynomials/exponential_functions chains; skill map updated with horizontal ScrollView for 27-column layout**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T03:07:34Z
- **Completed:** 2026-03-14T03:11:15Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Wired foil_expansion -> multi_step prerequisite (polynomials depends on linear_equations chain)
- Wired exp_evaluate -> exponents.evaluate prerequisite (exponential_functions depends on exponents chain)
- Added 6 HS cross-domain prerequisite verification tests covering all chains
- Skill map layout computes dynamic contentWidth with MIN_COLUMN_SPACING (64px)
- SkillMapGraph wrapped in horizontal ScrollView for 27-column support
- Added no-overlap and content-width-expansion layout tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire missing cross-domain prerequisite edges for HS domains** - `04e7ca1` (feat)
2. **Task 2: Update skill map layout for 27 domains with horizontal scrolling** - `51620f6` (feat)

## Files Created/Modified
- `src/services/mathEngine/skills/polynomials.ts` - foil_expansion prerequisites: ['multi_step']
- `src/services/mathEngine/skills/exponentialFunctions.ts` - exp_evaluate prerequisites: ['exponents.evaluate']
- `src/components/skillMap/skillMapLayout.ts` - MIN_COLUMN_SPACING, LayoutResult type, dynamic contentWidth
- `src/components/skillMap/SkillMapGraph.tsx` - Horizontal ScrollView wrapping, contentWidth-based SVG sizing
- `src/components/skillMap/index.ts` - Export LayoutResult type and MIN_COLUMN_SPACING
- `src/__tests__/adaptive/prerequisiteGating.test.ts` - 6 HS cross-domain chain tests
- `src/__tests__/components/skillMapLayout.test.ts` - Content width expansion and no-overlap tests

## Decisions Made
- Used `exponents.evaluate` instead of plan-specified `exponents.integer-exponent` as the prerequisite for `exp_evaluate` -- the plan referenced a non-existent skill ID; `exponents.evaluate` is the correct terminal exponents skill

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected non-existent prerequisite skill ID**
- **Found during:** Task 1 (wiring cross-domain prerequisites)
- **Issue:** Plan specified `exponents.integer-exponent` as prerequisite for `exp_evaluate`, but no skill with that ID exists. The exponents domain uses `exponents.evaluate` as the general integer exponent evaluation skill.
- **Fix:** Used `exponents.evaluate` instead of `exponents.integer-exponent`
- **Files modified:** src/services/mathEngine/skills/exponentialFunctions.ts
- **Verification:** All prerequisite ID validation tests pass, DAG acyclic
- **Committed in:** 04e7ca1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential correction -- using non-existent skill ID would have broken the prerequisite graph validation. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All cross-domain prerequisite chains are fully connected
- Skill map supports 27-domain layout with horizontal scrolling
- Ready for remaining Phase 091 integration plans

---
*Phase: 091-integration-placement*
*Completed: 2026-03-14*
