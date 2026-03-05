---
phase: 36-avatars-frames
plan: 01
subsystem: ui
tags: [avatar, frame, cosmetics, zustand, reanimated, store-migration]

# Dependency graph
requires:
  - phase: 32-badges
    provides: Badge registry with badgeId conventions for cosmetic unlock mapping
  - phase: 35-daily-challenges
    provides: STORE_VERSION=10, challengeCompletions/challengesCompleted in store
provides:
  - Expanded AVATARS (14 regular), SPECIAL_AVATARS (5 badge-unlocked), FRAMES (6 badge-unlocked)
  - AllAvatarId, SpecialAvatarId, FrameId types
  - resolveAvatar, getCosmeticUnlockText, isCosmeticUnlocked helpers
  - AvatarCircle shared component with frame border and sparkle animation
  - STORE_VERSION=11 with v10->v11 migration (frameId)
  - HomeScreen avatar pressable for AvatarPicker navigation
affects: [36-02-avatar-picker, 37-themes]

# Tech tracking
tech-stack:
  added: []
  patterns: [badge-to-cosmetic mapping via badgeId, sparkle animation with reanimated rotation+opacity]

key-files:
  created:
    - src/components/avatars/AvatarCircle.tsx
    - src/components/avatars/index.ts
    - src/__tests__/store/constants/avatars.test.ts
    - src/__tests__/components/AvatarCircle.test.tsx
  modified:
    - src/store/constants/avatars.ts
    - src/store/slices/childProfileSlice.ts
    - src/store/appStore.ts
    - src/store/migrations.ts
    - src/screens/HomeScreen.tsx
    - src/__tests__/migrations.test.ts
    - src/__tests__/screens/HomeScreen.test.tsx

key-decisions:
  - "resolveAvatar returns { id, label, emoji } union type (widened from const literals) for simpler consumer usage"
  - "Sparkle animation: 4s rotation loop + 1s opacity pulse, positioned at cardinal points around circle"
  - "AvatarCircle wraps in Pressable only when onPress provided (no unnecessary touch targets)"
  - "HomeScreen navigates to AvatarPicker as never-cast (type resolved in Plan 02)"

patterns-established:
  - "Badge-to-cosmetic mapping: SPECIAL_AVATARS and FRAMES each carry badgeId for unlock checking"
  - "AvatarCircle reusable component pattern: emoji + size + optional frame/sparkle decorations"

requirements-completed: [AVTR-01, AVTR-02, AVTR-03]

# Metrics
duration: 5m2s
completed: 2026-03-05
---

# Phase 36 Plan 01: Avatar and Frame Data Layer Summary

**14 regular + 5 special avatars and 6 frames with badge-unlock mapping, AvatarCircle component with frame border and sparkle animation, HomeScreen integration**

## Performance

- **Duration:** 5m 2s
- **Started:** 2026-03-05T19:07:44Z
- **Completed:** 2026-03-05T19:12:46Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Expanded avatar pool from 8 to 14 regular animals, added 5 special badge-unlocked avatars and 6 decorative frames
- Created AvatarCircle shared component with optional frame border and sparkle animation via Reanimated
- Updated store with STORE_VERSION=11, v10->v11 migration adding frameId, AllAvatarId type support
- HomeScreen now uses AvatarCircle with frame and sparkle support, avatar is pressable

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand avatar constants, add special avatars and frames, store migration** - `cbe7667` (feat)
2. **Task 2: AvatarCircle shared component with frame border and sparkle, HomeScreen integration** - `9c21131` (feat)

## Files Created/Modified
- `src/store/constants/avatars.ts` - Expanded AVATARS (14), added SPECIAL_AVATARS (5), FRAMES (6), helper functions
- `src/store/slices/childProfileSlice.ts` - Added frameId field, AllAvatarId type for avatarId
- `src/store/appStore.ts` - Bumped STORE_VERSION to 11, added frameId to partialize
- `src/store/migrations.ts` - Added v10->v11 migration setting frameId to null
- `src/components/avatars/AvatarCircle.tsx` - Reusable avatar circle with frame border and sparkle animation
- `src/components/avatars/index.ts` - Barrel export
- `src/screens/HomeScreen.tsx` - Replaced inline avatar with AvatarCircle, added frame/sparkle support
- `src/__tests__/store/constants/avatars.test.ts` - 18 tests for constants and helpers
- `src/__tests__/components/AvatarCircle.test.tsx` - 8 tests for component rendering
- `src/__tests__/migrations.test.ts` - Added v10->v11 migration tests
- `src/__tests__/screens/HomeScreen.test.tsx` - Added reanimated mock and frameId to state

## Decisions Made
- resolveAvatar returns widened `{ id, label, emoji }` type instead of narrow const literal unions for simpler consumer usage
- Sparkle animation uses 4s continuous rotation with 1s opacity pulse (0.4 to 1.0) for subtle but visible effect
- AvatarCircle conditionally wraps in Pressable only when onPress is provided (no unnecessary touch overhead)
- HomeScreen navigates to 'AvatarPicker' with `as never` cast -- Plan 02 will register the route and resolve the type

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed resolveAvatar return type mismatch**
- **Found during:** Task 2 (typecheck)
- **Issue:** resolveAvatar return type used narrow const literal union types which caused TS2322 when searching arrays with `.find()`
- **Fix:** Widened return type to `{ id: string; label: string; emoji: string } | undefined`
- **Files modified:** src/store/constants/avatars.ts
- **Verification:** `npm run typecheck` passes (only 2 pre-existing TS2366 errors remain)
- **Committed in:** 9c21131 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type fix necessary for TypeScript correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Avatar constants, types, and AvatarCircle component ready for AvatarPicker screen (Plan 02)
- HomeScreen pressable avatar wired to 'AvatarPicker' navigation target
- Badge-to-cosmetic unlock mapping in place for picker to check earned status

---
*Phase: 36-avatars-frames*
*Completed: 2026-03-05*
