---
phase: 17-manipulative-components
plan: 01
subsystem: ui
tags: [react-native, manipulatives, gestures, reanimated, counters, ten-frame]

requires:
  - phase: 16-shared-drag-primitives
    provides: DraggableItem, SnapZone, AnimatedCounter, snap math, haptics, animation configs

provides:
  - ManipulativeShell shared wrapper with reset button and AnimatedCounter header
  - Counters component with free-placement drag and two-color flip
  - TenFrame component with 2x5 snap grid and dual-frame auto-spawn
  - Master barrel export for all manipulatives

affects: [17-02-base-ten-blocks, 17-03-number-line-fraction-strips, 17-04-bar-model, 18-session-integration, 19-sandbox]

tech-stack:
  added: []
  patterns:
    - ManipulativeShell wrapper pattern for consistent layout across all 6 manipulatives
    - Custom pan gesture for free-placement (Counters) vs DraggableItem+SnapZone for structured placement (TenFrame)
    - DualCountDisplay pattern for multi-value running counts
    - TrayCounter respawn pattern with re-keying

key-files:
  created:
    - src/components/manipulatives/ManipulativeShell.tsx
    - src/components/manipulatives/ManipulativeShell.test.tsx
    - src/components/manipulatives/Counters/CountersTypes.ts
    - src/components/manipulatives/Counters/Counters.tsx
    - src/components/manipulatives/Counters/index.ts
    - src/components/manipulatives/TenFrame/TenFrameTypes.ts
    - src/components/manipulatives/TenFrame/TenFrame.tsx
    - src/components/manipulatives/TenFrame/index.ts
    - src/components/manipulatives/index.ts
  modified: []

key-decisions:
  - "Counters uses custom Gesture.Pan() for free placement instead of DraggableItem (no snap zones needed)"
  - "TenFrame filters snap targets dynamically to exclude occupied cells"
  - "TrayCounter respawns via re-keying after each successful snap"

patterns-established:
  - "ManipulativeShell wrapper: all manipulatives wrap in shell for consistent reset+counter+workspace layout"
  - "Custom renderCounter on shell for dual-count displays (red/yellow counters)"
  - "DraggableCounter with pan commit-to-state pattern for free-placement components"

requirements-completed: [MANIP-04, MANIP-05]

duration: 4min
completed: 2026-03-03
---

# Phase 17 Plan 01: ManipulativeShell, Counters, and TenFrame Summary

**ManipulativeShell shared wrapper with Counters (free-placement two-color flip) and TenFrame (2x5 snap grid with dual-frame auto-spawn)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T19:44:10Z
- **Completed:** 2026-03-03T19:48:16Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- ManipulativeShell provides consistent layout (reset button top-left, AnimatedCounter top-right, flexible workspace) for all 6 manipulatives
- Counters with custom pan gesture for free placement, tap-to-flip between red/yellow, dual running count, and 30-counter cap with nudge
- TenFrame with 2x5 SnapZone grid, drag-to-place from tray, tap-to-remove, dynamic snap target filtering, and second frame auto-spawn at 10
- Master barrel export wiring ManipulativeShell, Counters, TenFrame, and all shared primitives

## Task Commits

Each task was committed atomically:

1. **Task 1: ManipulativeShell wrapper and master barrel export** - `ab6ed1c` (feat)
2. **Task 2: Counters component with free-placement and two-color flip** - `c8977d4` (feat)
3. **Task 3: TenFrame component with snap-to-cell grid and dual-frame support** - `d69c512` (feat)

## Files Created/Modified
- `src/components/manipulatives/ManipulativeShell.tsx` - Shared wrapper with reset button and AnimatedCounter header (99 lines)
- `src/components/manipulatives/ManipulativeShell.test.tsx` - 7 tests covering render, reset, counter, custom counter, children
- `src/components/manipulatives/Counters/CountersTypes.ts` - Counter types, color constants, sizing (46 lines)
- `src/components/manipulatives/Counters/Counters.tsx` - Free-placement two-color counter component (318 lines)
- `src/components/manipulatives/Counters/index.ts` - Barrel export
- `src/components/manipulatives/TenFrame/TenFrameTypes.ts` - Ten frame grid constants and types (29 lines)
- `src/components/manipulatives/TenFrame/TenFrame.tsx` - 2x5 snap grid with dual-frame support (344 lines)
- `src/components/manipulatives/TenFrame/index.ts` - Barrel export
- `src/components/manipulatives/index.ts` - Master barrel export for all manipulatives

## Decisions Made
- Counters uses custom `Gesture.Pan()` + `Gesture.Tap()` with `Gesture.Race()` composition for free placement, since DraggableItem's snap-and-return behavior is not needed for free placement
- TenFrame dynamically filters snap targets to exclude occupied cells, providing natural fill-any-empty-cell behavior
- TrayCounter component re-keys itself after each snap to reset DraggableItem's internal shared values, enabling infinite counter supply from a single tray source
- Counter stagger positioning uses modular grid (5 cols x 4 rows of offsets) to prevent overlap when adding multiple counters

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- ManipulativeShell pattern validated and ready for remaining 4 manipulatives (BaseTenBlocks, NumberLine, FractionStrips, BarModel)
- Both Counters and TenFrame demonstrate the two core placement patterns: free placement (Counters) and structured snap-to-zone (TenFrame)
- Master barrel export ready to accept new component exports from Plans 17-02 through 17-04

## Self-Check: PASSED

All 9 created files verified present. All 3 task commits verified in git log.

---
*Phase: 17-manipulative-components*
*Completed: 2026-03-03*
