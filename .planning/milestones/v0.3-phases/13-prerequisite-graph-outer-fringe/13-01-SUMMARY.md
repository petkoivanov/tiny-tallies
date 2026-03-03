---
phase: 13-prerequisite-graph-outer-fringe
plan: 1
subsystem: adaptive
tags: [prerequisite-graph, dag, bkt, mastery-gating, outer-fringe, spaced-repetition]

# Dependency graph
requires:
  - phase: 11-bkt-mastery-estimation
    provides: BKT mastery estimation with masteryLocked flag in SkillState
  - phase: 12-leitner-spaced-repetition
    provides: Leitner box transitions and review scheduling for practiced skills
provides:
  - Cross-operation prerequisite DAG linking subtraction skills to addition skills
  - BKT-mastery-based prerequisite gating (replaces Elo threshold)
  - No-re-locking policy for practiced skills
  - getOuterFringe pure function for new-skill discovery
affects: [13-02-session-wiring, phase-14-session-orchestrator]

# Tech tracking
tech-stack:
  added: []
  patterns: [pure-function-outer-fringe, bkt-mastery-gating, no-re-locking-policy]

key-files:
  created: []
  modified:
    - src/services/mathEngine/skills.ts
    - src/services/adaptive/prerequisiteGating.ts
    - src/services/adaptive/index.ts
    - src/__tests__/adaptive/prerequisiteGating.test.ts

key-decisions:
  - "BKT masteryLocked replaces Elo threshold (950) for prerequisite unlocking"
  - "No-re-locking policy: practiced skills (attempts > 0) stay unlocked permanently"
  - "Outer fringe excludes practiced-but-unmastered skills (Leitner handles review)"
  - "Cross-operation links: each subtraction skill requires corresponding addition skill at same difficulty level"

patterns-established:
  - "Outer fringe pattern: pure function filtering unmastered skills with all-mastered prerequisites"
  - "No-re-locking policy: once practiced, skill access is permanent regardless of prerequisite state"

requirements-completed: [PREG-01, PREG-02, PREG-03]

# Metrics
duration: 4min
completed: 2026-03-03
---

# Phase 13 Plan 1: DAG Cross-Links, BKT-Mastery Gating & Outer Fringe Summary

**Cross-operation prerequisite DAG with BKT-mastery gating and outer fringe algorithm replacing Elo-threshold unlocking**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T14:40:56Z
- **Completed:** 2026-03-03T14:44:48Z
- **Tasks:** 2 (TDD: 4 commits total)
- **Files modified:** 4

## Accomplishments
- Added cross-operation prerequisite links: each subtraction skill now requires the corresponding addition skill at the same difficulty level, creating a true DAG instead of two independent chains
- Refactored prerequisite gating from Elo threshold (950) to BKT mastery (masteryLocked flag), ensuring children genuinely master prerequisites before progressing
- Implemented no-re-locking policy: once a child has practiced a skill (attempts > 0), it stays unlocked permanently even if prerequisite mastery is lost
- Added getOuterFringe pure function that returns unmastered skills ready to learn (all prerequisites BKT-mastered), excluding practiced-but-unmastered skills handled by Leitner review

## Task Commits

Each task was committed atomically (TDD: test then feat):

1. **Task 1: Add cross-operation prerequisite links to skills DAG**
   - `faf641e` (test) - Failing DAG validation tests for cross-operation links
   - `521c149` (feat) - Add cross-operation prerequisite links to skills DAG

2. **Task 2: Refactor prerequisiteGating from Elo to BKT-mastery and implement outer fringe**
   - `182f4ef` (test) - Failing BKT-mastery gating and outer fringe tests
   - `e9efa4c` (feat) - Refactor to BKT mastery with outer fringe algorithm

## Files Created/Modified
- `src/services/mathEngine/skills.ts` - Added cross-operation prerequisite links (6 subtraction skills now depend on corresponding addition skills)
- `src/services/adaptive/prerequisiteGating.ts` - Replaced Elo-threshold gating with BKT-mastery gating, added getOuterFringe, added no-re-locking policy
- `src/services/adaptive/index.ts` - Updated barrel exports: removed UNLOCK_THRESHOLD, added getOuterFringe
- `src/__tests__/adaptive/prerequisiteGating.test.ts` - Complete rewrite: 25 tests covering DAG validation, BKT mastery gating, outer fringe, no-re-locking

## Decisions Made
- BKT masteryLocked replaces Elo threshold (950) for prerequisite unlocking -- more reliable mastery signal
- No-re-locking policy: practiced skills (attempts > 0) stay unlocked permanently to avoid frustrating children
- Outer fringe excludes practiced-but-unmastered skills -- Leitner review handles those
- Cross-operation links at same difficulty level (e.g., subtraction.within-20.no-borrow requires addition.within-20.no-carry)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Prerequisite graph and outer fringe algorithm ready for Plan 13-02 to wire into session flow
- getOuterFringe available via barrel export for session orchestrator integration
- 519 tests passing, TypeScript clean

---
*Phase: 13-prerequisite-graph-outer-fringe*
*Completed: 2026-03-03*
