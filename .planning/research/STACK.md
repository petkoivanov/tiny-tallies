# Stack Research

**Domain:** Virtual Manipulatives — React Native interactive math tools (ages 6-9)
**Researched:** 2026-03-03
**Confidence:** HIGH

## Context: What Already Exists

The following are already installed and validated — do NOT re-add or change versions:

| Technology | Installed Version | Role |
|------------|------------------|------|
| react-native-gesture-handler | 2.28.0 | Gesture recognition |
| react-native-reanimated | 4.1.6 | 60fps animations, UI-thread worklets |
| react-native-worklets | 0.7.4 | Worklet runtime (Reanimated 4 dependency) |
| react-native-svg | 15.12.1 | SVG rendering (number lines, fraction strips) |
| expo-haptics | 15.0.8 | Tactile feedback on snap/group |
| expo-linear-gradient | 15.0.7 | Block/bar gradients |

**New Architecture is already enabled** (`"newArchEnabled": true` in app.json). This is required for Reanimated 4 and is already confirmed active.

---

## Recommended Stack for v0.4

### No New Dependencies Required

All libraries needed for virtual manipulatives are already installed. The work is entirely implementation, not installation.

| Capability | Library | Version | Status |
|------------|---------|---------|--------|
| Drag-and-drop (pan gesture) | react-native-gesture-handler | 2.28.0 | Installed |
| Snap-to-grid animations | react-native-reanimated | 4.1.6 | Installed |
| SVG shapes (number lines, fractions) | react-native-svg | 15.12.1 | Installed |
| Animated SVG props | react-native-reanimated | 4.1.6 | Installed |
| Snap/group haptic feedback | expo-haptics | 15.0.8 | Installed |
| Block gradients, bar fills | expo-linear-gradient | 15.0.7 | Installed |
| Spring snap animation | react-native-reanimated | 4.1.6 | Installed |
| Worklet runtime | react-native-worklets | 0.7.4 | Installed |

---

## Critical Configuration Fix Required

### babel.config.js Must Be Updated

The current `babel.config.js` uses the old Reanimated 3 plugin:

```javascript
// CURRENT (wrong for Reanimated 4)
plugins: ['react-native-reanimated/plugin'],
```

Reanimated 4 extracted worklets into `react-native-worklets`. The plugin must change:

```javascript
// CORRECT for Reanimated 4 + react-native-worklets 0.7.x
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],  // Changed from react-native-reanimated/plugin
  };
};
```

This fix is required before any worklet-based drag-and-drop code will compile. The 557 existing tests pass currently only because they mock Reanimated — the app would fail at runtime on device without this fix.

**Source:** [Reanimated 4 Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) — MEDIUM confidence (official docs, verified).

---

## API Patterns for Manipulatives

### Drag-and-Drop (All 6 Manipulatives)

Use `Gesture.Pan()` from react-native-gesture-handler v2 Gesture API (not the old handler-based API) combined with `useSharedValue` + `useAnimatedStyle` from Reanimated 4:

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,         // deprecated in Reanimated 4, use scheduleOnRN from 'react-native-worklets'
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Preferred pattern for Reanimated 4:
const offsetX = useSharedValue(0);
const offsetY = useSharedValue(0);
const startX = useSharedValue(0);
const startY = useSharedValue(0);

const pan = Gesture.Pan()
  .onBegin(() => {
    startX.value = offsetX.value;
    startY.value = offsetY.value;
    scheduleOnRN(onPickUp)();  // trigger haptic on JS thread
  })
  .onChange((event) => {
    offsetX.value = startX.value + event.translationX;
    offsetY.value = startY.value + event.translationY;
  })
  .onFinalize(() => {
    // Snap to nearest grid position
    const snapped = snapToGrid(offsetX.value, offsetY.value);
    offsetX.value = withSpring(snapped.x);
    offsetY.value = withSpring(snapped.y);
    scheduleOnRN(onSnap)();    // trigger haptic on snap
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: offsetX.value },
    { translateY: offsetY.value },
  ],
}));
```

**Why this pattern:** Gesture callbacks are auto-workletized; all animation runs on UI thread. `scheduleOnRN` replaces deprecated `runOnJS` in Reanimated 4. `withSpring` snap provides natural feel children respond to.

**Note on runOnJS:** `runOnJS` still works in Reanimated 4.1.x for backward compatibility but is deprecated and will be removed in a future major version. New code in v0.4 should use `scheduleOnRN` from `react-native-worklets`.

### Animated SVG Props (Number Lines, Fraction Strips)

SVG elements (Path, Circle, Rect) animate via `useAnimatedProps` + `createAnimatedComponent`, not `useAnimatedStyle`:

```typescript
import { Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';

// Create animated variants OUTSIDE component to avoid recreation
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Inside component:
const markerX = useSharedValue(50);

const markerProps = useAnimatedProps(() => ({
  cx: markerX.value,  // SVG prop, not style
}));

// <AnimatedCircle animatedProps={markerProps} cy={30} r={8} fill="gold" />
```

**Why `useAnimatedProps` not `useAnimatedStyle`:** SVG properties (`cx`, `cy`, `d`, `r`, `width`, `height`) are props, not style attributes. `useAnimatedStyle` only works for View style properties.

### Haptic Feedback on Snap

```typescript
import * as Haptics from 'expo-haptics';

// On item pickup
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// On snap to valid grid position
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// On group formation (10 cubes → rod)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// On incorrect placement in guided mode (gentle, not punitive)
Haptics.selectionAsync();
```

**Why these choices:** `Light` for pickup is subtle; `Medium` for snap is satisfying but not jarring; `Success` notification for regrouping signals achievement. No `Heavy` or `Error` — matches the app's no-punitive-mechanics philosophy.

### withSpring Configuration for Snap

Reanimated 4 changed `withSpring` defaults. The old `restDisplacementThreshold`/`restSpeedThreshold` parameters were replaced with `energyThreshold`. For snap-to-grid feel:

```typescript
import { withSpring } from 'react-native-reanimated';

// Snappy, crisp snap (good for grid/cell snapping)
offsetX.value = withSpring(targetX, {
  damping: 20,
  stiffness: 300,
  // energyThreshold replaces restDisplacementThreshold in Reanimated 4
});

// Bouncy, playful spring (good for counter drops, ten-frame fills)
offsetX.value = withSpring(targetX, {
  damping: 12,
  stiffness: 200,
});
```

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `PanGestureHandler` (old handler API) | Legacy API, deprecated in favor of `Gesture.Pan()`. Still works but Software Mansion discourages new usage | `Gesture.Pan()` with `GestureDetector` |
| `useAnimatedGestureHandler` | Deprecated in Reanimated 3+, removed pattern | `Gesture.Pan().onChange()` callbacks |
| `runOnJS()` in new code | Deprecated in Reanimated 4, replaced by `scheduleOnRN` | `scheduleOnRN` from `react-native-worklets` |
| `@shopify/react-native-skia` | GPU-powered canvas, overkill for these manipulatives; adds ~2MB; Expo managed workflow requires config plugin | `react-native-svg` (already installed) for SVG shapes, `Animated.View` for blocks/counters |
| FlashList v2.x | Requires new architecture flag changes, crashes on current setup | FlashList v1.x (already in place) |
| `restDisplacementThreshold` / `restSpeedThreshold` in withSpring | Removed in Reanimated 4; will throw runtime warning | `energyThreshold` parameter |
| `gestureHandlerRootHOC` | Deprecated in RNGH 2.28 (the installed version), scheduled for removal | `GestureHandlerRootView` wrapper (already used via navigation setup) |
| Third-party drag-and-drop libraries (react-native-draggable, react-native-drag-sort) | These wrap gesture-handler with their own abstractions; incompatible with the fine-grained snap-to-grid and split/combine logic needed for manipulatives | Custom pan gesture + useSharedValue pattern |

---

## Alternatives Considered

| Capability | Recommended | Alternative | Why Not Alternative |
|------------|-------------|-------------|---------------------|
| Rendering base-ten blocks, counters | `Animated.View` + StyleSheet | React Native Skia Canvas | Skia is GPU-rendered, not composable with React Native layout system; overkill for rectangular shapes |
| Rendering number lines, fraction strips | `react-native-svg` | Pure `Animated.View` with absolute positioning | SVG Path gives mathematically precise tick marks and arc segments; View-based would require manual pixel math |
| Snap animations | `withSpring` (Reanimated 4) | `withTiming` | Spring physics feel more natural and playful for children; timing is mechanical |
| Gesture recognition | `Gesture.Pan()` (RNGH v2 API) | `PanGestureHandler` (legacy) | New API composes better, is the recommended path, and avoids deprecation warnings |
| Haptics | `expo-haptics` | `react-native-haptics` (community) | expo-haptics already installed; consistent with Expo ecosystem; adequate API for our use cases |

---

## Manipulative-Specific Implementation Notes

### Base-Ten Blocks
- Render cubes and rods as `Animated.View` with `StyleSheet` (no SVG needed — rectangular shapes)
- Snap logic: place-value column zones defined as pixel ranges; snap on `onFinalize`
- Group animation (10 cubes → rod): `withTiming` for cubes sliding together, then `withSpring` for rod appearance
- Max 30 draggable items on screen at once (beyond that, show grouped representations)

### Number Line
- Render axis as `react-native-svg` `<Line>` + `<Text>` tick marks
- Marker as `AnimatedCircle` (useAnimatedProps for cx position)
- Hop arc: `AnimatedPath` with d prop computed from shared values
- Pinch-to-zoom for fractions: `Gesture.Pinch()` + scale shared value

### Ten Frame
- Render grid as `View` + `StyleSheet` (2×5 grid of Views)
- Counters as `Animated.View` draggable into cells
- Cell hit-detection: measure cell positions with `onLayout`, compare in `onFinalize`
- "Fill" animation: stagger `withDelay` + `withSpring` for sequential fills

### Counters
- Draggable `Animated.View` circles
- Group circles: regular `View` with `onLayout`-measured bounds
- Auto-count display: shared value tracking items per group, animated with `withTiming`

### Fraction Strips
- Render strips as `react-native-svg` with `<Rect>` segments
- Tap to shade/unshade: `AnimatedRect` with fill animated via `useAnimatedProps`
- Stack comparison: `Gesture.Pan()` for drag-to-compare

### Bar Model
- Render bars as `Animated.View` with width as shared value
- Drag handle on right edge: `Gesture.Pan()` updating bar width shared value
- `withSpring` snap to nearest quantized value (e.g., snap to multiples of 10)

---

## Version Compatibility Matrix

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| react-native-gesture-handler | 2.28.0 | RN 0.81, New Arch | Added RN 0.81 support in this version; `gestureHandlerRootHOC` deprecated |
| react-native-reanimated | 4.1.6 | RN 0.78-0.81, New Arch only | 4.1.6 accepts worklets 0.7.x; requires babel plugin change |
| react-native-worklets | 0.7.4 | Reanimated 4.1.x | Provides worklet runtime; babel plugin `react-native-worklets/plugin` |
| react-native-svg | 15.12.1 | RN 0.81, Expo 54 | Supports `createAnimatedComponent` wrapping; touch event handling has known quirks (see Pitfalls) |
| expo-haptics | 15.0.8 | Expo SDK 54 | Full iOS + Android support; `performAndroidHapticsAsync` for fine-grained Android control |

---

## Installation

No new packages to install. The only change needed is the babel plugin:

```bash
# No npm install needed — all packages are present

# Only code change required:
# Edit babel.config.js: change 'react-native-reanimated/plugin' → 'react-native-worklets/plugin'
# Then clear Metro cache:
npx expo start --clear
```

---

## Sources

- [Reanimated 4 Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) — babel plugin change, API renames, withSpring changes — HIGH confidence (official docs)
- [Reanimated Getting Started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) — New Architecture requirement confirmed — HIGH confidence (official docs)
- [Animating Styles and Props](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/animating-styles-and-props/) — useAnimatedProps for SVG pattern — HIGH confidence (official docs)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — Reanimated v4 / New Arch status — HIGH confidence (official)
- [Expo Haptics Docs](https://docs.expo.dev/versions/latest/sdk/haptics/) — ImpactFeedbackStyle values — HIGH confidence (official)
- [react-native-worklets docs](https://docs.swmansion.com/react-native-worklets/docs/) — babel plugin setup, scheduleOnRN API — HIGH confidence (official)
- [RNGH 2.28 release notes](https://x.com/swmansion/status/1947662341320925570) — gestureHandlerRootHOC deprecation — MEDIUM confidence (official tweet)
- [Reanimated GitHub releases](https://github.com/software-mansion/react-native-reanimated/releases) — 4.1.6 / 4.2.2 versions — HIGH confidence (official)
- package.json + app.json — installed versions, newArchEnabled flag — HIGH confidence (source of truth)

---
*Stack research for: Virtual Manipulatives (v0.4) — Tiny Tallies*
*Researched: 2026-03-03*
