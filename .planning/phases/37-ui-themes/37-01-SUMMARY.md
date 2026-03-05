---
phase: 37-ui-themes
plan: 01
subsystem: ui
tags: [react-context, theming, zustand, migration, cosmetics]

# Dependency graph
requires:
  - phase: 36-avatars-frames
    provides: cosmetic unlock pattern (getCosmeticUnlockText, isCosmeticUnlocked, SPECIAL_AVATARS, FRAMES)
provides:
  - ThemeId type and ThemeColors interface with 5 palettes (12 tokens each)
  - ThemeProvider component and useTheme() hook for dynamic color delivery
  - THEME_COSMETICS array with 4 badge-gated theme definitions
  - Store migration v12 with themeId persistence in childProfileSlice
affects: [37-02, 37-03, 37-04, color-migration, theme-picker, session-wrappers]

# Tech tracking
tech-stack:
  added: []
  patterns: [React Context ThemeProvider, useTheme() hook, theme cosmetic constants]

key-files:
  created:
    - src/theme/colors.ts
    - src/store/constants/themes.ts
    - src/__tests__/gamification/themeDefinitions.test.ts
    - src/__tests__/store/themeIdMigration.test.ts
  modified:
    - src/theme/index.ts
    - src/store/constants/avatars.ts
    - src/store/slices/childProfileSlice.ts
    - src/store/appStore.ts
    - src/store/migrations.ts

key-decisions:
  - "STORE_VERSION bumped from 11 to 12 with themeId migration"
  - "Static colors export removed from theme/index.ts to force TypeScript-verified consumer migration"
  - "Feedback colors (correct/incorrect) kept universal across all 5 themes for recognition"

patterns-established:
  - "ThemeProvider + useTheme() hook: React Context delivers current theme colors, screens call const { colors } = useTheme()"
  - "THEME_COSMETICS follows SPECIAL_AVATARS/FRAMES badge-gating pattern"

requirements-completed: [THME-01, THME-02, THME-05]

# Metrics
duration: 3m5s
completed: 2026-03-05
---

# Phase 37 Plan 01: Theme Foundation Summary

**5 color theme palettes with ThemeProvider/useTheme() hook, badge-gated cosmetic constants, and store migration v12 for themeId persistence**

## Performance

- **Duration:** 3m5s
- **Started:** 2026-03-05T20:15:25Z
- **Completed:** 2026-03-05T20:18:31Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Created 5 theme palettes (dark, ocean, forest, sunset, space) with 12 color tokens each
- Built ThemeProvider with React Context and useTheme() hook for dynamic color delivery
- Extended getCosmeticUnlockText with theme unlock text for 4 badge-gated themes
- Added store migration v12 with themeId field in childProfileSlice
- Removed static colors export from theme/index.ts (consumers must migrate to useTheme)

## Task Commits

Each task was committed atomically:

1. **Task 1: Theme types, palettes, ThemeProvider, and cosmetic constants** - `65699ad` (feat)
2. **Task 2: Store migration v12 for themeId persistence** - `ff38660` (feat)

_Note: TDD tasks - RED/GREEN phases combined per task commit_

## Files Created/Modified
- `src/theme/colors.ts` - ThemeId type, ThemeColors interface, THEMES constant with 5 palettes
- `src/theme/index.ts` - ThemeProvider component, useTheme() hook (static colors removed)
- `src/store/constants/themes.ts` - THEME_COSMETICS array with 4 badge-gated themes
- `src/store/constants/avatars.ts` - Extended getCosmeticUnlockText for theme support
- `src/store/slices/childProfileSlice.ts` - Added themeId field (ThemeId, default 'dark')
- `src/store/appStore.ts` - STORE_VERSION=12, themeId in partialize
- `src/store/migrations.ts` - v12 migration: themeId defaults to 'dark'
- `src/__tests__/gamification/themeDefinitions.test.ts` - 15 tests for themes and cosmetics
- `src/__tests__/store/themeIdMigration.test.ts` - 4 tests for migration chaining

## Decisions Made
- STORE_VERSION bumped from 11 to 12 with themeId migration
- Static colors export removed from theme/index.ts to force TypeScript-verified consumer migration
- Feedback colors (correct/incorrect) kept universal across all 5 themes (#84cc16/#f87171)
- ThemeProvider uses React.createElement to avoid JSX compilation in .ts file

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ThemeProvider ready for App.tsx wrapping (Plan 02/03 will migrate consumers)
- THEMES constant available for theme picker (Plan 04)
- TypeScript will surface all 45+ consumer files needing migration from static colors to useTheme()
- 19 new tests passing, existing tests unaffected

---
*Phase: 37-ui-themes*
*Completed: 2026-03-05*
