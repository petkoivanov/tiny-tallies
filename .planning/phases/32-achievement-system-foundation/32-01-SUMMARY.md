---
phase: 32-achievement-system-foundation
plan: 01
subsystem: gamification
tags: [typescript, zustand, badges, achievement, pure-functions]

# Dependency graph
requires:
  - phase: math-engine-foundation
    provides: SKILLS array, Operation/Grade types, SkillDefinition
provides:
  - Static badge registry with 27 BadgeDefinition entries
  - Pure-function evaluation engine (evaluateBadges)
  - Badge type system (BadgeCategory, BadgeTier, UnlockCondition discriminated union)
  - BadgeEvaluationSnapshot interface for decoupled engine input
affects: [32-02 achievement store slice, 33 achievement UI, session completion flow]

# Tech tracking
tech-stack:
  added: []
  patterns: [static readonly badge catalog, discriminated union for unlock conditions, snapshot-based pure evaluation]

key-files:
  created:
    - src/services/achievement/badgeTypes.ts
    - src/services/achievement/badgeRegistry.ts
    - src/services/achievement/badgeEvaluation.ts
    - src/services/achievement/index.ts
    - src/__tests__/achievement/badgeRegistry.test.ts
    - src/__tests__/achievement/badgeEvaluation.test.ts
  modified: []

key-decisions:
  - "Badge IDs follow mastery.{skillId} / mastery.category.{op} / mastery.grade.{n} / behavior.{metric}.{tier} convention"
  - "All skill-mastery badges are gold tier since mastery is binary (not tiered progression)"
  - "BadgeCategory limited to mastery and behavior for this phase (exploration/remediation realized as behavior badges)"

patterns-established:
  - "Badge catalog: static readonly BadgeDefinition[] following SKILLS array pattern"
  - "Evaluation engine: pure function taking snapshot + earnedBadges, returning string[] of new IDs"
  - "Unlock conditions: discriminated union with 6 condition types, single condition per badge"

requirements-completed: [ACHV-01, ACHV-02]

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 32 Plan 01: Badge Registry and Evaluation Engine Summary

**Static badge registry (27 badges across 6 condition types) with pure-function evaluation engine and comprehensive test suite (26 tests)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T04:10:27Z
- **Completed:** 2026-03-05T04:13:51Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Badge type system with discriminated union for 6 unlock condition types (skill-mastery, category-mastery, grade-mastery, streak-milestone, sessions-milestone, remediation-victory)
- Static registry of 27 badges: 14 skill-mastery, 2 category-mastery, 3 grade-mastery, 3 streak, 3 sessions, 2 remediation
- Pure-function evaluation engine with single-pass iteration, no store coupling, no side effects
- 26 tests passing (15 registry + 11 evaluation), full test suite green at 1203 tests

## Task Commits

Each task was committed atomically (TDD: RED then GREEN):

1. **Task 1: Badge types, registry, and tests**
   - `593875d` test(32-01): add failing tests for badge registry
   - `b595ca3` feat(32-01): implement badge registry with 27 badge definitions
2. **Task 2: Badge evaluation engine and tests**
   - `a3053f5` test(32-01): add failing tests for badge evaluation engine
   - `95b9a18` feat(32-01): implement badge evaluation engine

## Files Created/Modified
- `src/services/achievement/badgeTypes.ts` - Type definitions: BadgeCategory, BadgeTier, UnlockCondition union, BadgeDefinition, BadgeEvaluationSnapshot (29 lines)
- `src/services/achievement/badgeRegistry.ts` - Static BADGES array with 27 entries + getBadgeById + getBadgesByCategory (254 lines)
- `src/services/achievement/badgeEvaluation.ts` - Pure evaluateBadges function with checkCondition switch (72 lines)
- `src/services/achievement/index.ts` - Barrel exports for all public APIs (11 lines)
- `src/__tests__/achievement/badgeRegistry.test.ts` - 15 tests for registry integrity, lookups, and categories
- `src/__tests__/achievement/badgeEvaluation.test.ts` - 11 tests for all condition types, skip-earned, purity

## Decisions Made
- Badge IDs follow `mastery.{skillId}` / `mastery.category.{op}` / `mastery.grade.{n}` / `behavior.{metric}.{tier}` convention
- All skill-mastery badges assigned gold tier since mastery is binary (P(L) >= 0.95 threshold)
- BadgeCategory limited to 'mastery' | 'behavior' for this phase, matching CONTEXT.md guidance that exploration and remediation categories are realized as behavior badges with specific condition types

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Badge types, registry, and evaluation engine are fully self-contained in `src/services/achievement/`
- Plan 02 (achievement store slice) can import from the barrel export and integrate with Zustand store
- evaluateBadges signature matches the pattern described in RESEARCH.md for session completion integration
- No blockers for Plan 02

## Self-Check: PASSED

All 7 created files verified on disk. All 4 task commits verified in git history.

---
*Phase: 32-achievement-system-foundation*
*Completed: 2026-03-05*
