# Phase 16: Shared Drag Primitives - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Reusable drag-and-drop primitives (DraggableItem, SnapZone, AnimatedCounter) that run snap logic on the UI thread at 60fps. These are the foundation all 6 manipulatives build on in Phase 17. No individual manipulative components — only shared interaction primitives.

</domain>

<decisions>
## Implementation Decisions

### Gesture Pattern
- Use `Gesture.Race(tap, pan)` composition — tap completes before pan activates
- Pan gesture: `minDistance(8)` to prevent accidental drags from taps (ages 6-7 rest fingers)
- All snap math in `'worklet'`-annotated functions called from `onEnd` only
- Positions via `transform: [{ translateX }, { translateY }]` — never `left`/`top`
- `scheduleOnRN` (not deprecated `runOnJS`) for crossing to RN thread (haptics, state updates)

### Touch Targets
- Minimum 48dp touch targets per accessibility requirements
- Tap-to-add and tap-to-remove as first-class alternative to dragging

### Haptic Feedback
- `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on snap
- `Haptics.notificationAsync(NotificationFeedbackType.Success)` on group formation
- No `Heavy` or `Error` feedback — no punitive mechanics

### Running Count
- Value display updates on drop events only (not during active drag — distracting for children)
- Animated transition when count changes

### Claude's Discretion
- Spring animation configuration (damping, stiffness, overshootClamping)
- Snap distance threshold (how close before snap triggers)
- Visual feedback during drag (opacity, scale, shadow)
- Reset animation style (animate back vs instant clear vs fade)
- DraggableItem/SnapZone component API design
- AnimatedCounter implementation approach
- Test strategy for gesture-based components
- 30-object cap enforcement approach

</decisions>

<specifics>
## Specific Ideas

No specific requirements — research provided clear patterns. Claude has full discretion on snap feel, reset behavior, visual feedback, and component API design. Priority is 60fps performance and child-friendly interaction (ages 6-9).

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `react-native-gesture-handler` 2.28.0: Gesture.Pan(), Gesture.Tap(), Gesture.Race() — already installed
- `react-native-reanimated` 4.1.6: useSharedValue, useAnimatedStyle, withSpring, useAnimatedProps — already installed
- `react-native-worklets` 0.7.4: scheduleOnRN, babel plugin already configured (Phase 15)
- `expo-haptics` 15.0.8: ImpactFeedbackStyle, NotificationFeedbackType
- `src/services/cpa/cpaTypes.ts`: ManipulativeType enum — primitives don't need this but downstream consumers do

### Established Patterns
- Pure function services for logic (Phase 15 CPA service pattern)
- Components under 500 lines with barrel exports
- StyleSheet.create for styles, not inline
- Dark theme with high contrast (existing app theme)

### Integration Points
- Phase 17 manipulatives will import DraggableItem and SnapZone as building blocks
- Phase 18 ManipulativePanel will render manipulatives that use these primitives
- Phase 19 Sandbox screens will use the same primitives

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-shared-drag-primitives*
*Context gathered: 2026-03-03*
