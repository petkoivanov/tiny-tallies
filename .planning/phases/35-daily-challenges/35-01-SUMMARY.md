---
phase: 35-daily-challenges
plan: 01
subsystem: services
tags: [zustand, challenge, badge, migration, tdd, seeded-rng]

# Dependency graph
requires:
  - phase: 32-achievement-system
    provides: badge registry, evaluation system, STORE_VERSION 9
provides:
  - Challenge service with types, themes, date-seeded rotation, skill filtering, goal evaluation
  - ChallengeSlice with challengeCompletions and challengesCompleted persistence
  - Store migration v9->v10 for challenge fields
  - 4 challenge badges (first/streak/master/perfect) extending badge registry to 31 total
affects: [35-02, session-flow, daily-challenge-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [date-seeded-prng-rotation, challenge-theme-skill-filtering]

key-files:
  created:
    - src/services/challenge/challengeTypes.ts
    - src/services/challenge/challengeThemes.ts
    - src/services/challenge/challengeService.ts
    - src/services/challenge/index.ts
    - src/store/slices/challengeSlice.ts
    - src/__tests__/challenge/challengeService.test.ts
    - src/__tests__/store/challengeSlice.test.ts
    - src/__tests__/gamification/challengeBadges.test.ts
  modified:
    - src/store/appStore.ts
    - src/store/migrations.ts
    - src/services/achievement/badgeTypes.ts
    - src/services/achievement/badgeRegistry.ts
    - src/services/achievement/badgeEvaluation.ts
    - src/hooks/useSession.ts
    - src/components/badges/badgeEmojis.ts

key-decisions:
  - "Challenge themes use date-seeded PRNG (createRng) for deterministic daily rotation"
  - "Skill filtering falls back to all unlocked skills when theme filter produces empty set"
  - "STORE_VERSION bumped 9->10 with challengeCompletions and challengesCompleted fields"
  - "Challenge badges use challenges-completed and perfect-challenge condition types"
  - "Trophy emoji for challenge badges, hundred-points emoji for perfect challenge"

patterns-established:
  - "Date-seeded challenge rotation: getDateSeed(date) -> createRng(seed) -> intRange for theme index"
  - "Skill filtering with fallback: filter unlocked skills by theme constraints, fall back to all unlocked if empty"

requirements-completed: [CHAL-01, CHAL-02, CHAL-05]

# Metrics
duration: 11m52s
completed: 2026-03-05
---

# Phase 35 Plan 01: Challenge Service Summary

**Date-seeded challenge rotation with 5 themes, skill filtering, ChallengeSlice v10 migration, and 4 challenge badges (31 total)**

## Performance

- **Duration:** 11m 52s
- **Started:** 2026-03-05T16:22:21Z
- **Completed:** 2026-03-05T16:34:13Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Challenge service with deterministic date-seeded theme rotation across 5 themed challenges
- Skill filtering by operation/grade with empty-set fallback to all unlocked skills
- ChallengeSlice stores completions keyed by date with persistent counter via v10 migration
- 4 new challenge badges (first/streak/master/perfect) extending badge registry from 27 to 31
- 31 new tests (18 service + 13 slice/badge), 1,314 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Challenge service -- types, themes, and pure functions** - `15afc31` (feat)
2. **Task 2: Challenge store slice, migration v10, and badge extension** - `d948065` (feat)
3. **Fix: Update existing tests and emojis for 31-badge registry** - `f509018` (fix)

## Files Created/Modified
- `src/services/challenge/challengeTypes.ts` - ChallengeTheme, ChallengeCompletion types, CHALLENGE_BONUS_XP
- `src/services/challenge/challengeThemes.ts` - 5 themed challenge definitions with skill filters and goals
- `src/services/challenge/challengeService.ts` - getDateSeed, getTodayDateKey, getTodaysChallenge, getChallengeSkillIds, evaluateChallengeGoals
- `src/services/challenge/index.ts` - Barrel exports
- `src/store/slices/challengeSlice.ts` - ChallengeSlice with completeChallenge action
- `src/store/appStore.ts` - STORE_VERSION=10, ChallengeSlice composed, partialize updated
- `src/store/migrations.ts` - v9->v10 migration for challenge fields
- `src/services/achievement/badgeTypes.ts` - Extended UnlockCondition and BadgeEvaluationSnapshot
- `src/services/achievement/badgeRegistry.ts` - 4 new challenge badges (31 total)
- `src/services/achievement/badgeEvaluation.ts` - checkCondition for challenges-completed and perfect-challenge
- `src/hooks/useSession.ts` - Badge snapshot includes challengesCompleted
- `src/components/badges/badgeEmojis.ts` - Trophy and hundred-points emojis for challenge badges

## Decisions Made
- Challenge themes use date-seeded PRNG (createRng) for deterministic daily rotation -- same date always returns same theme
- Skill filtering falls back to all unlocked skills when theme filter produces empty set -- ensures challenges are always playable
- STORE_VERSION bumped 9->10 with challengeCompletions (Record) and challengesCompleted (number)
- Challenge badges use new condition types (challenges-completed, perfect-challenge) extending the UnlockCondition union
- Trophy emoji for challenge count badges, hundred-points emoji for perfect challenge badge

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated existing test assertions for new badge count**
- **Found during:** Task 2 (badge extension)
- **Issue:** Existing tests expected 27 badges (badgeRegistry, BadgeCollectionScreen, HomeScreen) and STORE_VERSION=9
- **Fix:** Updated assertions to 31 badges and STORE_VERSION=10
- **Files modified:** src/__tests__/achievement/badgeRegistry.test.ts, src/__tests__/appStore.test.ts, src/__tests__/screens/HomeScreen.test.tsx, src/__tests__/screens/BadgeCollectionScreen.test.tsx
- **Verification:** All 1,314 tests pass
- **Committed in:** f509018

**2. [Rule 3 - Blocking] Added challengesCompleted to useSession badge snapshot**
- **Found during:** Task 2 (badge types extension)
- **Issue:** BadgeEvaluationSnapshot now requires challengesCompleted field; useSession.ts creates a snapshot without it
- **Fix:** Added challengesCompleted from store state to badge snapshot in useSession.ts
- **Files modified:** src/hooks/useSession.ts
- **Verification:** TypeScript compiles cleanly (only 2 pre-existing errors in unrelated files)
- **Committed in:** d948065

**3. [Rule 3 - Blocking] Added challenge badge emojis to BADGE_EMOJIS map**
- **Found during:** Task 2 (badge extension)
- **Issue:** badgeEmojis.ts runtime warning for missing entries; BadgeIcon tests fail
- **Fix:** Added 4 emoji entries (trophy for count badges, hundred-points for perfect)
- **Files modified:** src/components/badges/badgeEmojis.ts
- **Verification:** All badge tests pass, no console warnings
- **Committed in:** f509018

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- 2 pre-existing TypeScript errors in BadgeDetailOverlay.tsx and BadgeGrid.tsx (TS2366: missing return statement) -- out of scope, not caused by this plan's changes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Challenge service layer complete, ready for session flow integration (35-02)
- ChallengeSlice ready for UI consumption
- Badge evaluation extended, ready to award challenge badges in session completion flow

## Self-Check: PASSED

All 8 created files verified present. All 3 commit hashes (15afc31, d948065, f509018) verified in git log.

---
*Phase: 35-daily-challenges*
*Completed: 2026-03-05*
