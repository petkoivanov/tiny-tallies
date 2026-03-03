---
phase: 14-smart-session-orchestration
plan: 01
subsystem: session
tags: [practice-mix, leitner, bkt, spaced-repetition, adaptive, seeded-rng]

# Dependency graph
requires:
  - phase: 12-leitner-spaced-repetition
    provides: "Leitner box transitions, review status, age-adjusted intervals"
  - phase: 13-prerequisite-graph-outer-fringe
    provides: "BKT-mastery gating, outer fringe, unlocked skills"
provides:
  - "computeSlotCounts: 60/30/10 slot allocation for practice sessions"
  - "buildReviewPool: Leitner-due skills sorted by weakest P(L) first"
  - "buildNewSkillPool: Outer fringe skills for introduction"
  - "buildChallengePool: Mid-range P(L) skills for stretch problems"
  - "selectFromPool: BKT-weighted selection with unique-skill preference"
  - "generatePracticeMix: Full practice mix orchestrator with fallback cascade"
  - "constrainedShuffle: Pedagogical ordering (review-first, no adjacent challenges)"
  - "PracticeProblemCategory and PracticeSlotCounts types"
affects: [14-02-session-orchestrator-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: ["inverse BKT weighting for skill selection", "fallback cascade for empty categories", "constrained Fisher-Yates shuffle"]

key-files:
  created:
    - src/services/session/practiceMix.ts
    - src/__tests__/session/practiceMix.test.ts
  modified:
    - src/services/session/sessionTypes.ts
    - src/services/session/index.ts

key-decisions:
  - "Slot rounding: challenge=round(0.1*n), new=round(0.3*n), review=remainder -- ensures sum always equals practiceCount"
  - "BKT inverse weighting: weight=(1-P(L))+0.05 floor, lower mastery = higher selection probability"
  - "Challenge pool filter: P(L) in [0.40, 0.80] AND attempts>0 AND not masteryLocked"
  - "Unique-skill preference: try unused skills first, fall back to repeats when exhausted"
  - "Fallback cascade: challenge->review->new->unlocked weakness-weighted->root skills"

patterns-established:
  - "Practice mix pure functions: stateless, seeded RNG, testable with deterministic outputs"
  - "Pool builder pattern: build candidates, filter, sort/weight, then select"
  - "Constrained shuffle: guaranteed warm start + no adjacent challenge separation"

requirements-completed: [SESS-01, SESS-02, SESS-03, SESS-04, SESS-05]

# Metrics
duration: 4min
completed: 2026-03-03
---

# Phase 14 Plan 01: Practice Mix Algorithm Summary

**Pure-function practice mix with 60/30/10 review/new/challenge split, BKT-weighted selection, fallback cascade, and constrained pedagogical ordering**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T15:27:53Z
- **Completed:** 2026-03-03T15:31:41Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 4

## Accomplishments
- Practice mix algorithm computing structured 60/30/10 slot allocation (review/new/challenge) for 9 practice problems
- Three pool builders sourcing from Leitner review-due skills, outer fringe new skills, and mid-range P(L) challenge skills
- BKT-weighted selection that favors lower mastery probability with unique-skill preference to maximize skill coverage
- Full fallback cascade handling all empty-category scenarios gracefully down to root skills
- Constrained shuffle enforcing review-first warm start and no adjacent challenge problems
- 27 new tests covering all functions, edge cases, and probabilistic behavior; 548 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing tests for practice mix** - `16e1c2d` (test)
2. **Task 1 (GREEN): Practice mix implementation** - `b101862` (feat)

## Files Created/Modified
- `src/services/session/practiceMix.ts` - 7 pure functions: slot calculation, pool building, BKT-weighted selection, mix generation with fallback cascade, constrained ordering (474 lines)
- `src/__tests__/session/practiceMix.test.ts` - 27 tests covering all functions including edge cases and probabilistic verification (536 lines)
- `src/services/session/sessionTypes.ts` - Added PracticeProblemCategory type and PracticeSlotCounts interface
- `src/services/session/index.ts` - Barrel exports for new types and functions

## Decisions Made
- **Slot rounding strategy:** challenge=round(0.1*n), new=round(0.3*n), review=remainder. Review gets the remainder to guarantee the sum always equals practiceCount exactly and review never drops below intended.
- **BKT inverse weighting:** Weight = (1 - P(L)) + 0.05 floor. The 0.05 floor prevents zero probability for high-mastery skills while still strongly favoring weaker ones.
- **Challenge pool criteria:** P(L) in [0.40, 0.80] AND attempts > 0 AND not masteryLocked. This ensures only practiced-but-unmastered skills with mid-range understanding are selected for stretch problems.
- **Unique-skill preference:** selectFromPool filters to unused skills first, falls back to full pool only when all unique skills are exhausted. Maximizes skill coverage per session.
- **Fallback cascade order:** Unfilled challenge -> review pool then new pool; unfilled new -> review pool; unfilled review -> new pool; ultimate fallback -> weakness-weighted from all unlocked; safety -> root skills.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Practice mix algorithm ready for integration with session orchestrator (14-02)
- All 7 functions exported via session barrel for direct import
- generatePracticeMix returns array of {skillId, category} ready for problem generation pipeline
- constrainedShuffle provides final ordering for session queue building

---
*Phase: 14-smart-session-orchestration*
*Completed: 2026-03-03*
