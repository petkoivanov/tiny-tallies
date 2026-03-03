---
phase: 16-shared-drag-primitives
plan: 02
subsystem: ui
tags: [react-native-gesture-handler, react-native-reanimated, drag-and-drop, snap-zone, animated-counter, haptics, worklets]

# Dependency graph
requires:
  - phase: 16-shared-drag-primitives
    plan: 01
    provides: SnapTarget/DraggableItemProps/SnapZoneProps/AnimatedCounterProps types, findNearestSnap worklet, spring configs, haptic helpers, gesture builder jest mocks
provides:
  - DraggableItem component with pan+tap gesture, snap-to-zone, haptic feedback, and reset support
  - SnapZone component with measureInWindow-based absolute position reporting
  - AnimatedCounter component with pop animation on value change
  - Complete barrel export for all shared manipulative primitives
affects: [17-manipulative-components, 18-manipulative-panel, 19-sandbox-screens]

# Tech tracking
tech-stack:
  added: []
  patterns: [Gesture.Race(tap, pan) composition, onRegister callback for reset support, measureInWindow for absolute positioning, scheduleOnRN for thread crossing]

key-files:
  created:
    - src/components/manipulatives/shared/DraggableItem.tsx
    - src/components/manipulatives/shared/SnapZone.tsx
    - src/components/manipulatives/shared/AnimatedCounter.tsx
    - src/__tests__/manipulatives/DraggableItem.test.tsx
    - src/__tests__/manipulatives/SnapZone.test.tsx
    - src/__tests__/manipulatives/AnimatedCounter.test.tsx
  modified:
    - src/components/manipulatives/shared/index.ts

key-decisions:
  - "DraggableItem uses onRegister callback to expose offsetX/offsetY shared values for parent-driven reset"
  - "SnapZone uses measureInWindow (not onLayout) for absolute screen coordinates matching DraggableItem translateX/Y"
  - "AnimatedCounter uses regular value prop (not SharedValue) since updates only on drop events, not 60fps"
  - "Pan gesture minDistance(8) prevents accidental drags from child finger rests"

patterns-established:
  - "onRegister pattern: Components expose internal shared values via callback for parent orchestration"
  - "measureInWindow for snap targets: Absolute coordinates ensure DraggableItem and SnapZone coordinate systems align"
  - "Pop animation pattern: withSequence(withTiming(1.15, 100ms), withTiming(1, 150ms)) for value change feedback"

requirements-completed: [FOUND-03, MANIP-08, MANIP-09, MANIP-10, MANIP-11]

# Metrics
duration: 3min
completed: 2026-03-03
---

# Phase 16 Plan 02: Shared Drag Primitives Components Summary

**DraggableItem with pan+tap gesture and snap-to-zone, SnapZone with absolute position measurement, AnimatedCounter with pop animation on drop events**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-03T19:00:41Z
- **Completed:** 2026-03-03T19:03:48Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- DraggableItem component with Gesture.Race(tap, pan) composition, snap-to-zone via findNearestSnap worklet, haptic feedback, visual drag feedback (scale/opacity/zIndex), and onRegister callback for parent-driven reset
- SnapZone component with measureInWindow-based absolute position reporting, visual states for default/active/occupied
- AnimatedCounter with pop animation on value change (drop events only), large child-friendly text, accessibility labels
- Complete barrel export providing clean import path for all Phase 17 manipulatives
- 19 new tests (6 DraggableItem + 6 SnapZone + 7 AnimatedCounter), 622 total tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: DraggableItem with pan+tap gesture, snap-to-zone, haptic feedback** - `12cc466` (feat)
2. **Task 2: SnapZone, AnimatedCounter, barrel export update** - `4f82259` (feat)

## Files Created/Modified
- `src/components/manipulatives/shared/DraggableItem.tsx` - Pan+tap gesture component with snap-to-zone, haptics, visual feedback, reset support
- `src/components/manipulatives/shared/SnapZone.tsx` - Drop target with measureInWindow position reporting and visual states
- `src/components/manipulatives/shared/AnimatedCounter.tsx` - Animated value display with pop transition on change
- `src/components/manipulatives/shared/index.ts` - Barrel export updated with DraggableItem, SnapZone, AnimatedCounter
- `src/__tests__/manipulatives/DraggableItem.test.tsx` - 6 render and accessibility tests
- `src/__tests__/manipulatives/SnapZone.test.tsx` - 6 render, style, and accessibility tests
- `src/__tests__/manipulatives/AnimatedCounter.test.tsx` - 7 value display, label, and accessibility tests

## Decisions Made
- DraggableItem exposes offsetX/offsetY shared values via onRegister callback rather than ref pattern. This allows parent manipulatives to collect and reset all items by setting values to 0. Simpler than imperative ref and supports staggered reset animation.
- SnapZone uses measureInWindow instead of onLayout coordinates. onLayout gives position relative to parent, but DraggableItem translateX/Y are screen-relative. measureInWindow gives absolute coordinates that align.
- AnimatedCounter takes a regular number prop (not SharedValue) since it only updates on drop events (low frequency), making React re-render acceptable and the API simpler.
- Pan gesture uses minDistance(8) to prevent accidental drags from children ages 6-7 resting fingers on screen.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared drag primitives complete: types, snap math, animation configs, haptics, DraggableItem, SnapZone, AnimatedCounter
- Clean import path via barrel export: `import { DraggableItem, SnapZone, AnimatedCounter, findNearestSnap, SNAP_SPRING_CONFIG } from '@/components/manipulatives/shared'`
- Phase 17 can compose these primitives into concrete manipulative components (BaseTenBlocks, NumberLine, TenFrame, etc.)
- Phase 16 complete (2/2 plans done)

## Self-Check: PASSED

All 7 created/modified files verified on disk. Both commits (12cc466, 4f82259) verified in git log.

---
*Phase: 16-shared-drag-primitives*
*Completed: 2026-03-03*
