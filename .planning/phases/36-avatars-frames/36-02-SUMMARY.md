---
phase: 36-avatars-frames
plan: 02
subsystem: ui
tags: [react-native, avatar-picker, navigation, cosmetics, badges]

requires:
  - phase: 36-01
    provides: Avatar/frame constants, AvatarCircle component, childProfileSlice with avatarId/frameId
provides:
  - AvatarPickerScreen with sectioned grid (avatars, specials, frames)
  - CosmeticDetailOverlay for locked item badge requirements
  - AvatarPicker navigation route
  - BadgeUnlockPopup cosmetic unlock text
affects: [37-themes]

tech-stack:
  added: []
  patterns: [sectioned-grid-picker, locked-item-overlay, cosmetic-unlock-text]

key-files:
  created:
    - src/screens/AvatarPickerScreen.tsx
    - src/components/avatars/CosmeticDetailOverlay.tsx
    - src/__tests__/screens/AvatarPickerScreen.test.tsx
  modified:
    - src/navigation/types.ts
    - src/navigation/AppNavigator.tsx
    - src/components/avatars/index.ts
    - src/components/animations/BadgeUnlockPopup.tsx
    - src/__tests__/components/BadgeUnlockPopup.test.tsx
    - src/__tests__/appStore.test.ts

key-decisions:
  - "BADGE_EMOJIS lookup for overlay badge display (BadgeDefinition has no emoji field)"
  - "Centered modal pattern for CosmeticDetailOverlay matching BadgeDetailOverlay"
  - "Frame unequip via re-tap (toggle null) for intuitive UX"

patterns-established:
  - "Locked cosmetic items: opacity 0.4 + Lock icon overlay + detail overlay on tap"
  - "Grid picker: 4-column flexWrap with selected item highlight border"

requirements-completed: [AVTR-04]

duration: 4m16s
completed: 2026-03-05
---

# Phase 36 Plan 02: Avatar Picker Screen Summary

**AvatarPickerScreen with 3-section grid picker, live preview, locked item overlay, and badge popup cosmetic unlock text**

## Performance

- **Duration:** 4m 16s
- **Started:** 2026-03-05T19:15:19Z
- **Completed:** 2026-03-05T19:19:35Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- AvatarPickerScreen renders 3 sections (14 avatars, 5 special, 6 frames) with live preview and save
- CosmeticDetailOverlay shows badge requirement for locked cosmetic items
- BadgeUnlockPopup displays gold cosmetic unlock text for badges that unlock avatars/frames
- Navigation route AvatarPicker registered and wired from HomeScreen

## Task Commits

Each task was committed atomically:

1. **Task 1: AvatarPickerScreen (TDD RED)** - `d0dcc3f` (test)
2. **Task 1: AvatarPickerScreen (TDD GREEN)** - `f3560af` (feat)
3. **Task 2: Badge popup cosmetic unlock text** - `158efac` (feat)

_Note: TDD task had RED and GREEN commits._

## Files Created/Modified
- `src/screens/AvatarPickerScreen.tsx` - Sectioned avatar/frame picker with live preview and save
- `src/components/avatars/CosmeticDetailOverlay.tsx` - Modal overlay for locked cosmetic items
- `src/components/avatars/index.ts` - Barrel export for CosmeticDetailOverlay
- `src/navigation/types.ts` - AvatarPicker route in RootStackParamList
- `src/navigation/AppNavigator.tsx` - AvatarPicker screen registration
- `src/components/animations/BadgeUnlockPopup.tsx` - Cosmetic unlock text display
- `src/__tests__/screens/AvatarPickerScreen.test.tsx` - 6 tests for picker screen
- `src/__tests__/components/BadgeUnlockPopup.test.tsx` - 2 new tests for cosmetic text
- `src/__tests__/appStore.test.ts` - Fixed stale assertions from plan 01

## Decisions Made
- Used BADGE_EMOJIS lookup for overlay badge display since BadgeDefinition has no emoji field
- Centered modal pattern for CosmeticDetailOverlay matching BadgeDetailOverlay from Phase 33
- Frame unequip via re-tap toggle (set to null) for intuitive UX

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CosmeticDetailOverlay badge.emoji TS error**
- **Found during:** Task 2 (typecheck)
- **Issue:** BadgeDefinition type has no emoji property, causing TS2339
- **Fix:** Used BADGE_EMOJIS[badgeId] lookup instead of badge.emoji
- **Files modified:** src/components/avatars/CosmeticDetailOverlay.tsx
- **Verification:** npm run typecheck passes (only pre-existing TS2366 errors remain)
- **Committed in:** 158efac

**2. [Rule 1 - Bug] Fixed stale test assertions from Plan 01**
- **Found during:** Task 2 (full test suite)
- **Issue:** appStore.test.ts expected 8 avatars and STORE_VERSION=10 but Plan 01 changed to 14 avatars and version 11
- **Fix:** Updated test assertions to match actual values
- **Files modified:** src/__tests__/appStore.test.ts
- **Verification:** All 1380 tests pass
- **Committed in:** 158efac

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Avatar system complete: data layer, AvatarCircle, picker screen, navigation, badge unlock text
- Phase 36 (Avatars & Frames) fully delivered
- Ready for Phase 37 (Themes) which is the final phase of v0.7

---
*Phase: 36-avatars-frames*
*Completed: 2026-03-05*
