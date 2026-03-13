---
phase: 083-coordinate-geometry-domain
plan: 03
subsystem: mathEngine
tags: [coordinate-geometry, word-problems, ai-tutor, qa, socratic-hints]

# Dependency graph
requires:
  - phase: 083-02
    provides: coordinate_geometry DomainHandler, 6 skills, 7 templates, 3 bug patterns, full registry wiring

provides:
  - 6 word problem prefix templates for coordinate_geometry (grades 8-10)
  - contexts: map/distance, ramp/slope, city, cell-tower, bridge, delivery-drone
  - Manual QA sign-off: Socratic formula-identification hints verified across slope/distance/midpoint/line types
  - COORD-03 and COORD-04 requirements satisfied

affects:
  - 091-integration (word problem coverage complete for coordinate geometry)
  - AI tutor (hint quality verified via manual QA)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "prefix mode word problems: mode='prefix' prepends context sentence; original geometry question text preserved unchanged"
    - "no {a}/{b} tokens in prefix templates — coordinate values are internal computation values, not displayable context nouns"

key-files:
  created: []
  modified:
    - src/services/mathEngine/wordProblems/templates.ts

key-decisions:
  - "6 templates added (plan specified 4-6 minimum): includes bridge and drone contexts for grade 9-10 variety"
  - "wp_coord_phone set to minGrade 9 per plan (slightly more abstract real-world context)"
  - "wp_coord_map2 set to minGrade 10 per plan (delivery-drone abstraction for upper HS)"
  - "Manual QA sign-off confirms Socratic hints ask formula-guiding questions, not substitution steps"

patterns-established:
  - "Coordinate geometry word problems: all use mode='prefix', question='', no {a}/{b} tokens — matches Pitfall 7 guidance from Research"

requirements-completed: [COORD-03, COORD-04]

# Metrics
duration: ~5min
completed: 2026-03-13
---

# Phase 83 Plan 03: Coordinate Geometry Word Problems + QA Summary

**6 prefix-mode word problem templates for coordinate_geometry (map/ramp/city/cell-tower/bridge/drone contexts, grades 8-10) with manual QA sign-off confirming Socratic hint quality across all coordinate geometry problem types**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-13T15:10:00Z
- **Completed:** 2026-03-13T15:14:15Z
- **Tasks:** 2 (T1 automated + T2 checkpoint)
- **Files modified:** 1

## Accomplishments

- 6 word problem prefix templates added covering map/distance, ramp/slope, city walking route, cell-tower grid, bridge support, and delivery-drone contexts
- All templates pass wordProblems.test.ts with coordinate_geometry in ALL_OPERATIONS (grades 8, 9, and 10)
- Manual QA sign-off: 10+ Gemini Socratic hints reviewed across slope, distance, midpoint, and line-equation problem types; none reveal substitution steps in HINT mode

## Task Commits

1. **Task 1: Add word problem prefix templates to templates.ts** — `6de9380` (feat)
2. **Task 2: Manual QA — AI tutor formula-identification hint quality** — checkpoint approved (no commit)

## Files Created/Modified

- `src/services/mathEngine/wordProblems/templates.ts` — 6 new coordinate_geometry prefix-mode entries appended after the linear_equations section

## Decisions Made

- Added 6 templates (exceeded the 4-minimum) — bridge and drone contexts cover grade 9-10 range with appropriately abstract real-world scenarios
- `wp_coord_phone` (cell towers) and `wp_coord_bridge` set to `minGrade: 9`; `wp_coord_map2` (delivery drone) set to `minGrade: 10` per plan specification
- All templates use `mode: 'prefix'`, `question: ''`, and no `{a}/{b}` tokens — matches Research Pitfall 7 guidance

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 83 (Coordinate Geometry Domain) is fully complete: all 4 requirements COORD-01 through COORD-04 satisfied across plans 01, 02, and 03
- coordinate_geometry domain is production-ready: handler, skills, templates, bug patterns, word problems, registry wiring, and AI tutor QA all done
- Phase 84 onward can depend on coordinate_geometry being present in the MathDomain union and domain handler registry

## Self-Check: PASSED

- src/services/mathEngine/wordProblems/templates.ts: FOUND (6de9380)
- 6de9380 (Task 1 commit): FOUND

---
*Phase: 083-coordinate-geometry-domain*
*Completed: 2026-03-13*
