---
phase: 37-ui-themes
plan: 04
subsystem: ui
tags: [react-native, reanimated, theme, cosmetic, navigation]

requires:
  - phase: 37-01
    provides: ThemeProvider, useTheme, THEMES, ThemeId, THEME_COSMETICS, themeId in store
  - phase: 37-02
    provides: Screen/component color migration to useTheme pattern
  - phase: 37-03
    provides: Remaining component color migration
  - phase: 36
    provides: AvatarPickerScreen pattern, CosmeticDetailOverlay, isCosmeticUnlocked, getCosmeticUnlockText
provides:
  - SessionWrapper with per-theme ambient Reanimated animations for all 5 themes
  - ThemePickerScreen with live preview, equip, locked state, badge requirements
  - ThemePicker navigation route and HomeScreen entry point
affects: []

tech-stack:
  added: []
  patterns:
    - "SessionWrapper ambient decoration pattern with pointerEvents=none overlay"
    - "ThemePickerScreen follows AvatarPickerScreen cosmetic picker pattern"
    - "DecorationDot animated component with slow repeating opacity/translate cycles"

key-files:
  created:
    - src/components/session/SessionWrapper.tsx
    - src/screens/ThemePickerScreen.tsx
    - src/__tests__/components/SessionWrapper.test.tsx
    - src/__tests__/screens/ThemePickerScreen.test.tsx
  modified:
    - src/components/session/index.ts
    - src/screens/SessionScreen.tsx
    - src/navigation/types.ts
    - src/navigation/AppNavigator.tsx
    - src/screens/HomeScreen.tsx
    - src/__tests__/screens/HomeScreen.test.tsx

key-decisions:
  - "DecorationDot uses ViewStyle type with explicit property assignment to satisfy Reanimated TS constraints"
  - "BadgeUnlockPopup already handles theme cosmetic text via getCosmeticUnlockText - no changes needed"
  - "CosmeticDetailOverlay reused for locked theme items with itemType='avatar' for overlay label"
  - "Theme preview uses mini card with background, surface, primary accent bar, and text samples"

patterns-established:
  - "SessionWrapper: ambient decoration wrapper pattern for themed session visuals"
  - "ThemePickerScreen: cosmetic picker with live preview card and badge-gated unlock"

requirements-completed: [THME-03, THME-04, THME-05]

duration: 5m34s
completed: 2026-03-06
---

# Phase 37 Plan 04: Session Wrapper & Theme Picker Summary

**SessionWrapper with per-theme ambient Reanimated animations and ThemePickerScreen with live preview, badge-gated unlocking, and HomeScreen navigation entry**

## Performance

- **Duration:** 5m 34s
- **Started:** 2026-03-06T04:25:00Z
- **Completed:** 2026-03-06T04:30:34Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- SessionWrapper renders 3-5 slow animated decoration elements per theme at screen edges (pointerEvents=none)
- ThemePickerScreen shows all 5 themes with color swatch dots, live preview card, equipped/locked state
- Default dark always available; 4 themes require earning specific badges to equip
- HomeScreen Palette button navigates to ThemePicker; navigation fully wired

## Task Commits

Each task was committed atomically:

1. **Task 1: SessionWrapper with per-theme ambient animations** - `57d21d4` (feat)
2. **Task 2: ThemePickerScreen with preview, navigation, HomeScreen entry** - `b2e7766` (feat)

## Files Created/Modified
- `src/components/session/SessionWrapper.tsx` - Per-theme ambient decoration wrapper with Reanimated
- `src/components/session/index.ts` - Added SessionWrapper export
- `src/screens/SessionScreen.tsx` - Wrapped content with SessionWrapper
- `src/screens/ThemePickerScreen.tsx` - Theme selection with preview, equip, lock states
- `src/navigation/types.ts` - Added ThemePicker route
- `src/navigation/AppNavigator.tsx` - Registered ThemePicker screen
- `src/screens/HomeScreen.tsx` - Added Themes button with Palette icon
- `src/__tests__/components/SessionWrapper.test.tsx` - 5 tests for SessionWrapper
- `src/__tests__/screens/ThemePickerScreen.test.tsx` - 7 tests for ThemePickerScreen
- `src/__tests__/screens/HomeScreen.test.tsx` - Added Palette icon mock

## Decisions Made
- DecorationDot uses ViewStyle type with explicit property assignment to satisfy Reanimated TS constraints
- BadgeUnlockPopup already handles theme cosmetic text via getCosmeticUnlockText (no changes needed)
- CosmeticDetailOverlay reused for locked theme items (consistent with avatar/frame pattern)
- Theme preview renders mini card showing background, surface, primary accent, and text samples

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in SessionWrapper DecorationDot**
- **Found during:** Task 2 verification (typecheck)
- **Issue:** Spread-based position style created union type incompatible with Reanimated's Animated.View style prop
- **Fix:** Changed to explicit ViewStyle construction with property assignment instead of spread
- **Files modified:** src/components/session/SessionWrapper.tsx
- **Verification:** npm run typecheck passes clean
- **Committed in:** 57d21d4 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed HomeScreen test missing Palette icon mock**
- **Found during:** Task 2 verification (full test suite)
- **Issue:** HomeScreen test lucide mock lacked Palette icon added in this plan
- **Fix:** Added Palette mock to HomeScreen test's lucide-react-native mock
- **Files modified:** src/__tests__/screens/HomeScreen.test.tsx
- **Verification:** HomeScreen test suite passes (17 tests)
- **Committed in:** b2e7766 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for type safety and test correctness. No scope creep.

## Issues Encountered
- Pre-existing appStore test failure (STORE_VERSION test expects 11 but store is at 12) -- out of scope, not caused by this plan

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 37 (UI Themes) is now complete -- all 4 plans executed
- 1411 tests total (12 new), 1 pre-existing failure in appStore version test
- TypeScript clean

---
*Phase: 37-ui-themes*
*Completed: 2026-03-06*
