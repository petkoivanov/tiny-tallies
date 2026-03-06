---
phase: 37-ui-themes
plan: 03
subsystem: ui
tags: [react-native, theming, useTheme, useMemo, StyleSheet, reanimated]

# Dependency graph
requires:
  - phase: 37-01
    provides: ThemeProvider, useTheme hook, ThemeColors type, theme store slice
provides:
  - All component files migrated from static colors to useTheme()
  - Zero remaining static colors imports across entire codebase
  - Full app is theme-aware via React Context
affects: [37-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useMemo(() => StyleSheet.create({...}), [colors]) for dynamic styles"
    - "createStyles(colors: ThemeColors) factory for complex multi-subcomponent files"
    - "Split styles: static at module scope, color-dependent via useMemo in component"
    - "Sub-components receive dynamic styles via props when at module scope"

key-files:
  created: []
  modified:
    - src/components/badges/BadgeGrid.tsx
    - src/components/badges/BadgesSummary.tsx
    - src/components/badges/BadgeDetailOverlay.tsx
    - src/components/badges/BadgeIcon.tsx
    - src/components/avatars/AvatarCircle.tsx
    - src/components/avatars/CosmeticDetailOverlay.tsx
    - src/components/home/DailyChallengeCard.tsx
    - src/components/home/ExploreGrid.tsx
    - src/components/home/ExploreCard.tsx
    - src/components/home/SandboxTooltip.tsx
    - src/components/animations/BadgeUnlockPopup.tsx
    - src/components/animations/ConfettiCelebration.tsx
    - src/components/manipulatives/ManipulativeShell.tsx
    - src/components/manipulatives/BaseTenBlocks/BaseTenBlocks.tsx
    - src/components/manipulatives/FractionStrips/FractionStrips.tsx
    - src/components/manipulatives/Counters/Counters.tsx
    - src/components/manipulatives/Counters/CountersParts.tsx
    - src/components/manipulatives/Counters/CountersGrid.tsx
    - src/components/manipulatives/TenFrame/TenFrame.tsx
    - src/components/manipulatives/BarModel/BarModel.tsx
    - src/components/manipulatives/BarModel/BarModelParts.tsx
    - src/components/manipulatives/BarModel/NumberPicker.tsx
    - src/components/skillMap/SkillDetailOverlay.tsx
    - src/components/session/pictorial/TenFrameDiagram.tsx
    - src/components/session/pictorial/FractionStripsDiagram.tsx
    - src/components/session/pictorial/BarModelDiagram.tsx
    - src/components/session/pictorial/NumberLineDiagram.tsx
    - src/components/session/pictorial/BaseTenBlocksDiagram.tsx
    - src/components/session/pictorial/CountersDiagram.tsx

key-decisions:
  - "Used createStyles factory pattern for DailyChallengeCard and SkillDetailOverlay (complex multi-subcomponent files)"
  - "ConfettiCelebration uses colorIndex in ParticleConfig instead of color string, resolving theme colors at render time"
  - "Independent useTheme() calls in CountersParts sub-components rather than prop-passing (each is standalone)"

patterns-established:
  - "useMemo dynamic styles: For simple components, wrap StyleSheet.create in useMemo with [colors] dependency"
  - "createStyles factory: For files with many sub-components sharing styles, use createStyles(colors) and pass styles via props"
  - "Split styles: Keep non-color styles at module scope, color-dependent styles in useMemo inside component"
  - "Reanimated hook ordering: useTheme() must be called BEFORE useSharedValue/useAnimatedStyle"

requirements-completed: [THME-01]

# Metrics
duration: ~45min
completed: 2026-03-05
---

# Phase 37 Plan 03: Component Theme Migration Summary

**Migrated 29 component files from static colors import to useTheme() hook, eliminating all static color references across the codebase**

## Performance

- **Duration:** ~45 min (across multiple sessions due to rate limits)
- **Tasks:** 2/2
- **Files modified:** 29

## Accomplishments
- Migrated all 26 planned component files to useTheme() with useMemo-cached styles
- Auto-fixed 3 additional BarModel files that were missed from the plan but imported the removed static colors export
- Zero remaining static `colors` imports anywhere in src/ -- full TypeScript compilation clean
- Full test suite passes (91/92 suites, 1398/1399 tests; sole failure is pre-existing STORE_VERSION test)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate badge, avatar, home, animation components (12 files)** - `e845d42` (feat)
2. **Task 2: Migrate manipulative, pictorial, skillMap, barModel components (19 files)** - `3d6d664` (feat)

## Files Created/Modified

### Task 1 (12 files)
- `src/components/badges/BadgeGrid.tsx` - useTheme + useMemo styles
- `src/components/badges/BadgesSummary.tsx` - useTheme + useMemo styles
- `src/components/badges/BadgeDetailOverlay.tsx` - useTheme + useMemo styles, switch default case fix
- `src/components/badges/BadgeIcon.tsx` - useTheme + useMemo for circle/emoji styles
- `src/components/avatars/AvatarCircle.tsx` - useTheme before useSharedValue (Reanimated)
- `src/components/avatars/CosmeticDetailOverlay.tsx` - useTheme + useMemo styles
- `src/components/home/DailyChallengeCard.tsx` - createStyles factory pattern
- `src/components/home/ExploreGrid.tsx` - useTheme + useMemo styles
- `src/components/home/ExploreCard.tsx` - useTheme + useMemo styles
- `src/components/home/SandboxTooltip.tsx` - useTheme + useMemo styles
- `src/components/animations/BadgeUnlockPopup.tsx` - useTheme before useSharedValue
- `src/components/animations/ConfettiCelebration.tsx` - colorIndex pattern for particles

### Task 2 (17 planned + 3 auto-fixed = 19 files total, including badge fixes)
- `src/components/manipulatives/ManipulativeShell.tsx` - useTheme for icon colors
- `src/components/manipulatives/BaseTenBlocks/BaseTenBlocks.tsx` - dynamicStyles + labelStyle prop
- `src/components/manipulatives/FractionStrips/FractionStrips.tsx` - dynamicStyles + fractionLabelStyle prop
- `src/components/manipulatives/Counters/Counters.tsx` - dynamicStyles for tray/nudge
- `src/components/manipulatives/Counters/CountersParts.tsx` - independent useTheme per sub-component
- `src/components/manipulatives/Counters/CountersGrid.tsx` - useTheme + dynamicStyles
- `src/components/manipulatives/TenFrame/TenFrame.tsx` - useTheme + dynamicStyles for tray
- `src/components/manipulatives/BarModel/BarModel.tsx` - useTheme + dynamicStyles (auto-fix)
- `src/components/manipulatives/BarModel/BarModelParts.tsx` - useTheme per sub-component (auto-fix)
- `src/components/manipulatives/BarModel/NumberPicker.tsx` - useTheme + dynamicStyles (auto-fix)
- `src/components/skillMap/SkillDetailOverlay.tsx` - createStyles factory, styles passed to all sub-components
- `src/components/session/pictorial/TenFrameDiagram.tsx` - useTheme, colors.primary local
- `src/components/session/pictorial/FractionStripsDiagram.tsx` - useTheme, colors.primary local
- `src/components/session/pictorial/BarModelDiagram.tsx` - useTheme, colors.primary local
- `src/components/session/pictorial/NumberLineDiagram.tsx` - useTheme, arcColor local
- `src/components/session/pictorial/BaseTenBlocksDiagram.tsx` - useTheme, strokeColor parameter
- `src/components/session/pictorial/CountersDiagram.tsx` - useTheme, colors.primary local

## Decisions Made
- Used createStyles(colors) factory for DailyChallengeCard and SkillDetailOverlay where many sub-components share a common style set
- ConfettiCelebration stores colorIndex in particle config rather than color string, resolving actual theme color at render time
- CountersParts sub-components each call useTheme() independently rather than receiving colors as props (simpler, each is self-contained)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Migrated 3 BarModel files not in plan**
- **Found during:** Task 2 (typecheck verification)
- **Issue:** BarModel.tsx, BarModelParts.tsx, NumberPicker.tsx imported the removed static `colors` export, causing TypeScript compilation to fail
- **Fix:** Applied same useTheme + dynamicStyles migration pattern
- **Files modified:** src/components/manipulatives/BarModel/BarModel.tsx, BarModelParts.tsx, NumberPicker.tsx
- **Verification:** npm run typecheck passes clean
- **Committed in:** 3d6d664 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed switch statement exhaustiveness in badge files**
- **Found during:** Task 2 (typecheck verification, but files from Task 1)
- **Issue:** BadgeDetailOverlay.tsx getRequirementText and BadgeGrid.tsx getShortRequirement had switch statements without default cases, causing TS2366 "Function lacks ending return statement"
- **Fix:** Added default return cases to both switch statements
- **Files modified:** src/components/badges/BadgeDetailOverlay.tsx, src/components/badges/BadgeGrid.tsx
- **Verification:** npm run typecheck passes clean
- **Committed in:** 3d6d664 (Task 2 commit)

**3. [Rule 1 - Bug] Removed unused ThemeColors import**
- **Found during:** Task 2 (code review)
- **Issue:** BaseTenBlocksDiagram.tsx had unused `import type { ThemeColors }` that would cause lint warnings
- **Fix:** Removed the unused import
- **Files modified:** src/components/session/pictorial/BaseTenBlocksDiagram.tsx
- **Committed in:** 3d6d664 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 2 bugs)
**Impact on plan:** All auto-fixes necessary for correctness. BarModel files were missed from the plan's file list but needed migration to achieve zero static colors imports. No scope creep.

## Issues Encountered
- Pre-existing test failure: appStore.test.ts expects STORE_VERSION=11 but actual is 12 (changed in plan 37-01 for theme migration). Out of scope, not caused by this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All component files are now theme-aware via useTheme() hook
- Switching themeId in the Zustand store will propagate color changes to every component
- Ready for Plan 04 (theme selection UI / settings screen integration)

---
*Phase: 37-ui-themes*
*Completed: 2026-03-05*
