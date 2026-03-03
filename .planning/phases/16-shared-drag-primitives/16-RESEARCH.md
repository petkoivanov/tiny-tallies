# Phase 16: Shared Drag Primitives - Research

**Researched:** 2026-03-03
**Domain:** React Native gesture-driven drag-and-drop primitives (react-native-gesture-handler 2.28 + react-native-reanimated 4.1 + expo-haptics)
**Confidence:** HIGH

## Summary

Phase 16 builds three reusable interaction primitives -- DraggableItem, SnapZone, and AnimatedCounter -- that all six manipulatives (Phases 17+) will consume. The core technical challenge is keeping all drag position updates and snap logic on the UI thread via Reanimated worklets while crossing to the RN thread only for semantic state updates (haptics, count changes). All libraries are already installed; no new dependencies are needed.

The gesture composition pattern uses `Gesture.Race(tap, pan)` from react-native-gesture-handler 2.28's Gesture API (not the old Handler component API, and not the upcoming 3.x hook-based API). Pan gets `minDistance(8)` to prevent accidental drags from age-6 finger rests. Snap math runs as `'worklet'`-annotated pure functions called from `onEnd` only. Thread-crossing uses `scheduleOnRN` from `react-native-worklets` (Reanimated 4 API -- NOT the deprecated `runOnJS`).

**Primary recommendation:** Build DraggableItem as a generic component accepting snap targets as SharedValue arrays, with the findNearestSnap worklet as a separate testable pure function. SnapZone uses `onLayout` for measurement and exposes its bounds via a shared context. AnimatedCounter uses `useAnimatedReaction` to detect value changes and animates digit transitions with `withTiming`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use `Gesture.Race(tap, pan)` composition -- tap completes before pan activates
- Pan gesture: `minDistance(8)` to prevent accidental drags from taps (ages 6-7 rest fingers)
- All snap math in `'worklet'`-annotated functions called from `onEnd` only
- Positions via `transform: [{ translateX }, { translateY }]` -- never `left`/`top`
- `scheduleOnRN` (not deprecated `runOnJS`) for crossing to RN thread (haptics, state updates)
- Minimum 48dp touch targets per accessibility requirements
- Tap-to-add and tap-to-remove as first-class alternative to dragging
- `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on snap
- `Haptics.notificationAsync(NotificationFeedbackType.Success)` on group formation
- No `Heavy` or `Error` feedback -- no punitive mechanics
- Value display updates on drop events only (not during active drag -- distracting for children)
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-03 | Shared drag primitives (DraggableItem, SnapZone) run snap logic on UI thread at 60fps | Core deliverable -- Gesture.Pan + worklet snap math + SharedValue transforms; architecture pattern documented with full code examples |
| MANIP-08 | User can tap to add/remove pieces as alternative to dragging (48dp touch targets) | Gesture.Race(tap, pan) composition with minDistance(8) on pan; tap wins short touches. `layout.minTouchTarget` (48) already in theme |
| MANIP-09 | User can reset any manipulative to its starting state via a reset action | Reset function zeros all SharedValues; spring or instant animation back to origin; exposed as callback from DraggableItem |
| MANIP-10 | User receives haptic feedback on snap and grouping events | expo-haptics called via `scheduleOnRN` from onEnd worklet; Light for snap, Success for group |
| MANIP-11 | User sees a running count/value that updates when objects are placed (not during drag) | AnimatedCounter component with `useAnimatedReaction` or `withTiming` on value change; updated only via onSnap callback (onEnd), never onUpdate |
</phase_requirements>

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-gesture-handler | ~2.28.0 | Gesture recognition: Pan, Tap, Race composition | Only gesture library for RN; Gesture API (v2) is the current stable builder pattern |
| react-native-reanimated | ~4.1.1 | UI-thread animations, SharedValues, worklets | Industry standard for 60fps animations; v4 with New Architecture support |
| react-native-worklets | ^0.7.4 | scheduleOnRN, scheduleOnUI worklet runtime | Required peer for Reanimated 4; provides thread-crossing primitives |
| expo-haptics | ~15.0.7 | Tactile feedback on snap/group events | Expo SDK 54 blessed module; no VIBRATE permission needed with performAndroidHapticsAsync |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | ~5.6.0 | Inset-aware positioning for canvas bounds | Already installed; used if manipulative canvas needs safe area awareness |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom DraggableItem | react-native-reanimated-dnd | 562 stars, built on Reanimated 3 (not 4); adds dependency risk for Expo 54. Custom primitives give full control over snap math, haptics, and child-specific UX. NOT recommended. |
| Custom AnimatedCounter | react-native-animated-numbers | External dependency for a <100-line component. NOT recommended -- build inline. |

**Installation:** No new packages needed. All libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    manipulatives/
      shared/
        DraggableItem.tsx        # ~200 lines: pan + tap + snap + haptics
        SnapZone.tsx             # ~120 lines: layout measurement + drop boundary
        AnimatedCounter.tsx      # ~80 lines: animated value display
        snapMath.ts              # ~60 lines: worklet snap functions (pure, testable)
        types.ts                 # ~40 lines: SnapTarget, DraggableConfig, etc.
        index.ts                 # barrel export
```

### Pattern 1: Gesture.Race(tap, pan) Composition
**What:** A composed gesture where tap and pan compete. Tap activates on short touches (finger down + up within ~200ms with <8px movement). Pan activates once finger moves 8+ pixels. The first to activate cancels the other.

**When to use:** Every DraggableItem -- children must be able to both drag AND tap pieces.

**Example:**
```typescript
// Source: RNGH 2.28 Gesture API + project CONTEXT.md decisions
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const tap = Gesture.Tap()
  .onEnd(() => {
    'worklet';
    // Tap handling: add/remove piece at this position
    scheduleOnRN(onTap, itemId);
  });

const pan = Gesture.Pan()
  .minDistance(8) // prevents accidental drags from age-6 finger rests
  .onStart(() => {
    'worklet';
    startX.value = offsetX.value;
    startY.value = offsetY.value;
    isDragging.value = true;
  })
  .onChange((e) => {
    'worklet';
    offsetX.value = startX.value + e.translationX;
    offsetY.value = startY.value + e.translationY;
  })
  .onEnd(() => {
    'worklet';
    isDragging.value = false;
    const target = findNearestSnap(
      offsetX.value,
      offsetY.value,
      snapTargets.value,
      snapThreshold.value
    );
    if (target) {
      offsetX.value = withSpring(target.cx, SNAP_SPRING_CONFIG);
      offsetY.value = withSpring(target.cy, SNAP_SPRING_CONFIG);
      scheduleOnRN(onSnap, target.id);
      scheduleOnRN(triggerHapticSnap);
    } else {
      // Return to origin
      offsetX.value = withSpring(startX.value, SNAP_SPRING_CONFIG);
      offsetY.value = withSpring(startY.value, SNAP_SPRING_CONFIG);
    }
  });

const composed = Gesture.Race(tap, pan);

return (
  <GestureDetector gesture={composed}>
    <Animated.View style={[styles.item, animatedStyle]}>
      {children}
    </Animated.View>
  </GestureDetector>
);
```

### Pattern 2: Worklet Snap Math (Pure Functions)
**What:** Snap-to-zone collision detection as pure `'worklet'`-annotated functions. These never touch JS state, are fully testable as regular functions, and run entirely on the UI thread.

**When to use:** Every DraggableItem's onEnd handler.

**Example:**
```typescript
// Source: Reanimated worklet pattern + project architecture research
// src/components/manipulatives/shared/snapMath.ts

export interface SnapTarget {
  id: string;
  cx: number;  // center x
  cy: number;  // center y
  width: number;
  height: number;
}

export function findNearestSnap(
  x: number,
  y: number,
  targets: SnapTarget[],
  threshold: number,
): SnapTarget | null {
  'worklet';
  let nearest: SnapTarget | null = null;
  let minDist = threshold;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const dx = x - t.cx;
    const dy = y - t.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = t;
    }
  }
  return nearest;
}

export function isInsideZone(
  x: number,
  y: number,
  zone: SnapTarget,
): boolean {
  'worklet';
  const halfW = zone.width / 2;
  const halfH = zone.height / 2;
  return (
    x >= zone.cx - halfW &&
    x <= zone.cx + halfW &&
    y >= zone.cy - halfH &&
    y <= zone.cy + halfH
  );
}
```

### Pattern 3: SnapZone Layout Measurement
**What:** SnapZone components measure their screen position via `onLayout` and expose their bounds as SnapTarget data that DraggableItem reads. The parent orchestrator collects all SnapZone measurements into a SharedValue array.

**When to use:** Every container that acts as a drop target.

**Example:**
```typescript
// Source: React Native onLayout + Reanimated measure() pattern
// src/components/manipulatives/shared/SnapZone.tsx

interface SnapZoneProps {
  id: string;
  onMeasured: (target: SnapTarget) => void;
  isActive?: boolean;
  children?: React.ReactNode;
}

export function SnapZone({ id, onMeasured, isActive = true, children }: SnapZoneProps) {
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    // Use measureInWindow for absolute coordinates
    viewRef.current?.measureInWindow((pageX, pageY, w, h) => {
      onMeasured({
        id,
        cx: pageX + w / 2,
        cy: pageY + h / 2,
        width: w,
        height: h,
      });
    });
  }, [id, onMeasured]);

  return (
    <View
      ref={viewRef}
      onLayout={handleLayout}
      style={[styles.zone, isActive && styles.zoneActive]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Drop zone ${id}`}
    >
      {children}
    </View>
  );
}
```

### Pattern 4: AnimatedCounter with useAnimatedReaction
**What:** A counter display that animates number changes with a rolling/spring transition. Updates only when the source value changes (on drop events), never during drag.

**When to use:** Every manipulative's running value display.

**Example:**
```typescript
// src/components/manipulatives/shared/AnimatedCounter.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  label?: string;
}

export function AnimatedCounter({ value, label }: AnimatedCounterProps) {
  const displayValue = useSharedValue(value);
  const scale = useSharedValue(1);

  // Animate when value changes (triggered by onSnap, not onUpdate)
  useAnimatedReaction(
    () => value,
    (current, previous) => {
      if (previous !== null && current !== previous) {
        // Pop-in animation on change
        scale.value = withTiming(1.15, { duration: 100 }, () => {
          scale.value = withTiming(1, { duration: 150 });
        });
        displayValue.value = withTiming(current, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      } else {
        displayValue.value = current;
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.counter, animatedStyle]}>
      <Animated.Text style={styles.counterText}>
        {/* Note: Animated text interpolation requires ReText or
            round the shared value for display */}
        {Math.round(displayValue.value)}
      </Animated.Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </Animated.View>
  );
}
```

### Pattern 5: Reset via SharedValue Zeroing
**What:** A reset function that returns all DraggableItems to their starting positions, either via spring animation or instant clear.

**When to use:** Reset button on sandbox, problem transition in session.

**Example:**
```typescript
// Reset approach: animate all items back to origin with staggered spring
function resetManipulative(
  items: { offsetX: SharedValue<number>; offsetY: SharedValue<number> }[],
  animate: boolean = true,
) {
  'worklet';
  for (let i = 0; i < items.length; i++) {
    if (animate) {
      const delay = i * 30; // 30ms stagger per item
      items[i].offsetX.value = withDelay(delay, withSpring(0, RESET_SPRING_CONFIG));
      items[i].offsetY.value = withDelay(delay, withSpring(0, RESET_SPRING_CONFIG));
    } else {
      items[i].offsetX.value = 0;
      items[i].offsetY.value = 0;
    }
  }
}
```

### Anti-Patterns to Avoid
- **Snap logic on JS thread:** NEVER compute findNearestSnap outside a worklet. Even "simple" distance math causes visible jank at 20+ objects because of bridge-crossing latency.
- **Zustand state captured in worklets:** Worklets serialize closure values at creation time. Bridge store-derived config through useSharedValue, update in useEffect. See Pitfall 2 in pitfalls section.
- **Nested GestureDetectors on same element:** Combine tap + pan into one Gesture.Race, wrap in ONE GestureDetector. Two nested GestureDetectors create implicit competition that silently breaks.
- **Animating left/top instead of transform:** Layout properties trigger native layout pass every frame. Use `transform: [{ translateX }, { translateY }]` exclusively for drag positions.
- **scheduleOnRN in onChange/onUpdate:** Called ~60 times/second during drag. Only call scheduleOnRN in onEnd (once per gesture).
- **Haptics called directly from worklet:** expo-haptics is NOT worklet-compatible. Always call via `scheduleOnRN(triggerHaptic)` from the onEnd worklet.
- **Missing GestureHandlerRootView:** The current App.tsx does NOT have GestureHandlerRootView. This MUST be added as the outermost wrapper before any gesture components will work.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gesture recognition | Custom touch responder system | react-native-gesture-handler Gesture API | Platform-native recognition, automatic workletization, built-in composition |
| UI-thread animations | requestAnimationFrame loop | react-native-reanimated withSpring/withTiming | Worklet runtime bypasses JS thread entirely; handles cancellation, spring physics |
| Haptic feedback | Vibration API | expo-haptics | Cross-platform (iOS taptic engine, Android haptic engine), typed feedback styles |
| Layout measurement | Manual coordinate tracking | onLayout + measureInWindow (or Reanimated measure()) | Handles rotation, scroll offset, safe area; returns absolute coordinates |
| Thread crossing | Direct function calls from worklets | scheduleOnRN from react-native-worklets | Proper microtask scheduling; prevents race conditions between threads |

**Key insight:** The entire drag-and-drop system rests on the Reanimated worklet runtime. Any attempt to bypass it (custom touch handlers, Animated API, JS-thread position tracking) will fail the 60fps requirement at 20+ objects.

## Common Pitfalls

### Pitfall 1: Missing GestureHandlerRootView
**What goes wrong:** All gesture components silently fail to recognize any gestures. No error is thrown -- components render but taps/drags do nothing.
**Why it happens:** App.tsx currently wraps with SafeAreaProvider + NavigationContainer but NOT GestureHandlerRootView. This is a prerequisite for all gesture handler functionality.
**How to avoid:** Add `GestureHandlerRootView` as the outermost wrapper in App.tsx, wrapping SafeAreaProvider. Must have `style={{ flex: 1 }}`.
**Warning signs:** Gesture components render visually but no gesture callbacks fire. Works on web but not on device.

### Pitfall 2: Stale Closure Values in Worklets
**What goes wrong:** Store-derived configuration (snap threshold based on child age, grid dimensions) is captured at worklet creation time and never updates.
**Why it happens:** Worklets serialize closure values. They cannot read Zustand state reactively.
**How to avoid:** Bridge all dynamic config values through `useSharedValue`. Update the shared value in a `useEffect` that watches the store selector.
**Warning signs:** Correct behavior on first render; stale after any config change.

### Pitfall 3: Tap/Pan Gesture Conflict
**What goes wrong:** Tap-to-add never fires because Pan activates on finger contact (minDistance defaults to 0).
**Why it happens:** Pan gesture default activation is immediate. Without explicit minDistance, even a stationary finger triggers Pan, cancelling Tap.
**How to avoid:** Set `minDistance(8)` on Pan. Use `Gesture.Race(tap, pan)` so tap wins short touches.
**Warning signs:** Drag works perfectly; tap "never works" for children age 6-7 who rest fingers briefly.

### Pitfall 4: scheduleOnRN Argument Passing
**What goes wrong:** `scheduleOnRN(fn(arg))` calls fn immediately on the UI thread instead of scheduling it on RN thread.
**Why it happens:** Reanimated 4 changed the API from `runOnJS(fn)(arg)` (curried) to `scheduleOnRN(fn, arg)` (variadic). Old patterns break silently.
**How to avoid:** Always use `scheduleOnRN(fn, arg1, arg2)` -- arguments are separate parameters, not a function call.
**Warning signs:** Function executes synchronously on UI thread; haptics/state updates happen during drag instead of on completion.

### Pitfall 5: Spring Animation Overshoot on Snap
**What goes wrong:** Block visibly bounces past its target slot. Child re-drags thinking placement failed.
**Why it happens:** Default withSpring config has `overshootClamping: false` and relatively low damping.
**How to avoid:** Use `overshootClamping: true` for all snap-to-zone animations. Keep bounce only for decorative animations (counter pop, celebration).
**Warning signs:** Block appears to "jitter" after snap; child re-grabs placed blocks.

### Pitfall 6: Measuring SnapZone Before Layout
**What goes wrong:** onLayout hasn't fired yet; snap targets array is empty; first drag attempt snaps to nothing.
**Why it happens:** SnapZone onLayout is asynchronous. If a draggable renders before zones measure, the snap targets SharedValue is still empty.
**How to avoid:** Initialize snap targets as empty array; DraggableItem's snap logic gracefully returns to origin when no targets exist. SnapZone's onMeasured callback pushes to the targets array progressively.
**Warning signs:** First drag always returns to origin; subsequent drags work correctly.

## Code Examples

### Complete DraggableItem Component API Design
```typescript
// Recommended API for DraggableItem
interface DraggableItemProps {
  /** Unique identifier for this draggable */
  id: string;
  /** Shared value array of valid snap targets -- updated by parent */
  snapTargets: SharedValue<SnapTarget[]>;
  /** Distance threshold for snapping (px) */
  snapThreshold?: number;
  /** Called on RN thread when item snaps to a zone */
  onSnap?: (itemId: string, targetId: string) => void;
  /** Called on RN thread when item tapped (tap-to-add/remove) */
  onTap?: (itemId: string) => void;
  /** Called on RN thread when drag starts */
  onDragStart?: (itemId: string) => void;
  /** Whether this item can be dragged */
  enabled?: boolean;
  /** Style override for the draggable wrapper */
  style?: StyleProp<ViewStyle>;
  /** Accessible label for this item */
  accessibilityLabel: string;
  /** Children to render inside the draggable */
  children: React.ReactNode;
}
```

### Complete SnapZone Component API Design
```typescript
// Recommended API for SnapZone
interface SnapZoneProps {
  /** Unique identifier for this zone */
  id: string;
  /** Called when zone position is measured (pass up to parent) */
  onMeasured: (target: SnapTarget) => void;
  /** Whether zone accepts drops */
  isActive?: boolean;
  /** Whether zone is currently occupied */
  isOccupied?: boolean;
  /** Visual feedback when item is nearby during drag */
  highlightOnProximity?: boolean;
  /** Style override */
  style?: StyleProp<ViewStyle>;
  /** Accessible label */
  accessibilityLabel: string;
  children?: React.ReactNode;
}
```

### Haptic Feedback Pattern
```typescript
// src/components/manipulatives/shared/haptics.ts
import * as Haptics from 'expo-haptics';

/** Call via scheduleOnRN from worklet onEnd */
export function triggerSnapHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Call via scheduleOnRN when group forms (e.g., 10 cubes -> rod) */
export function triggerGroupHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Usage in worklet:
// .onEnd(() => {
//   'worklet';
//   if (target) {
//     scheduleOnRN(triggerSnapHaptic);
//   }
// })
```

### Spring Configuration Recommendations
```typescript
// src/components/manipulatives/shared/animationConfig.ts

/** Snap-to-zone: fast, no bounce (precision placement) */
export const SNAP_SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
  overshootClamping: true,
} as const;

/** Return-to-origin: slightly bouncy (playful feel) */
export const RETURN_SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
  mass: 1,
  overshootClamping: false,
} as const;

/** Reset all items: gentle cascade */
export const RESET_SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
  mass: 1,
  overshootClamping: true,
} as const;

/** Counter pop on value change */
export const COUNTER_POP_CONFIG = {
  damping: 8,
  stiffness: 400,
  mass: 0.5,
} as const;

/** Snap distance threshold (pixels) */
export const SNAP_THRESHOLD = 50;
```

### Visual Drag Feedback
```typescript
// During drag: slight scale up + opacity reduction + shadow elevation
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: offsetX.value },
    { translateY: offsetY.value },
    { scale: withTiming(isDragging.value ? 1.08 : 1, { duration: 100 }) },
  ],
  opacity: withTiming(isDragging.value ? 0.85 : 1, { duration: 100 }),
  // Note: elevation/shadow must be in static styles; cannot animate elevation
  zIndex: isDragging.value ? 999 : 0,
}));
```

### GestureHandlerRootView Addition (Required)
```typescript
// App.tsx -- MUST add GestureHandlerRootView
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  // ... existing font loading ...
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### 30-Object Cap Enforcement
```typescript
// Enforce in the parent orchestrator, not in DraggableItem
const MAX_OBJECTS = 30;

function handleAddItem(position: { x: number; y: number }) {
  if (items.length >= MAX_OBJECTS) {
    // Don't add more -- optionally show a gentle visual cue
    return;
  }
  setItems(prev => [...prev, createItem(position)]);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `PanGestureHandler` component wrapper | `Gesture.Pan()` builder + `GestureDetector` | RNGH 2.0 (2022) | Composition via Race/Exclusive/Simultaneous; auto-workletization |
| `runOnJS(fn)(arg)` (curried) | `scheduleOnRN(fn, arg)` (variadic) | Reanimated 4.0 / react-native-worklets 0.7 | Breaking API change; old pattern silently fails |
| `reanimated/plugin` babel plugin | `react-native-worklets/plugin` | Reanimated 4.0 | Already updated in project babel.config.js |
| `useAnimatedGestureHandler` | Gesture API callbacks (onStart, onChange, onEnd) | RNGH 2.0 + Reanimated 4.0 | Removed API; migrate to Gesture builder pattern |
| `restDisplacementThreshold` + `restSpeedThreshold` in withSpring | `energyThreshold` | Reanimated 4.0 | Both old params replaced by single energy threshold |

**Deprecated/outdated:**
- `useAnimatedGestureHandler` -- REMOVED in Reanimated 4. Use Gesture API callbacks.
- `runOnJS` -- REPLACED by `scheduleOnRN` from react-native-worklets.
- `runOnUI(() => {...})()` -- REPLACED by `scheduleOnUI(() => {...})` (no currying).

## Testing Strategy

### Unit Testing: Snap Math Functions
The `snapMath.ts` worklet functions are pure functions. Strip the `'worklet'` directive mentally -- they take numbers in, return values out. Test them directly with Jest as regular functions.

```typescript
// __tests__/manipulatives/snapMath.test.ts
import { findNearestSnap, isInsideZone } from '@/components/manipulatives/shared/snapMath';

describe('findNearestSnap', () => {
  const targets = [
    { id: 'zone-1', cx: 100, cy: 100, width: 60, height: 60 },
    { id: 'zone-2', cx: 200, cy: 100, width: 60, height: 60 },
  ];

  it('returns nearest zone within threshold', () => {
    expect(findNearestSnap(110, 105, targets, 50)).toEqual(targets[0]);
  });

  it('returns null when no zone within threshold', () => {
    expect(findNearestSnap(500, 500, targets, 50)).toBeNull();
  });
});
```

### Component Testing: Mock Strategy
The existing jest.setup.js already mocks:
- `react-native-reanimated` (useSharedValue returns `{ value: init }`, withSpring returns target value)
- `react-native-gesture-handler` (GestureHandlerRootView passes through)
- `expo-haptics` (impactAsync/notificationAsync are jest.fn())

The gesture handler mock needs enhancement for Phase 16. Add Gesture builder mocks:
```typescript
// Enhancement needed in jest.setup.js
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children, ...props }) =>
      React.createElement(View, props, children),
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: () => ({
        minDistance: jest.fn().mockReturnThis(),
        onStart: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
        onFinalize: jest.fn().mockReturnThis(),
        enabled: jest.fn().mockReturnThis(),
      }),
      Tap: () => ({
        onEnd: jest.fn().mockReturnThis(),
        maxDuration: jest.fn().mockReturnThis(),
        enabled: jest.fn().mockReturnThis(),
      }),
      Race: jest.fn((...gestures) => gestures[0]),
      Exclusive: jest.fn((...gestures) => gestures[0]),
      Simultaneous: jest.fn((...gestures) => gestures[0]),
    },
    State: { UNDETERMINED: 0, FAILED: 1, BEGAN: 2, CANCELLED: 3, ACTIVE: 4, END: 5 },
    Directions: {},
  };
});
```

Also add `react-native-worklets` mock:
```typescript
jest.mock('react-native-worklets', () => ({
  scheduleOnRN: jest.fn((fn, ...args) => fn(...args)),
  scheduleOnUI: jest.fn((fn) => fn()),
}));
```

### What to Test vs. What to Skip
| Testable | How | Priority |
|----------|-----|----------|
| snapMath functions | Direct unit tests (pure functions) | HIGH |
| AnimatedCounter renders correct value | RNTL render + getByText | HIGH |
| DraggableItem renders children | RNTL render + getByTestId | MEDIUM |
| SnapZone calls onMeasured on layout | RNTL render + fireEvent.layout | MEDIUM |
| Haptic functions called on snap | Verify jest.fn() calls in mock | MEDIUM |
| Actual gesture interaction (drag 60fps) | Manual device testing only | Skip in Jest |
| Spring animation curves | Visual device testing only | Skip in Jest |

## Open Questions

1. **AnimatedCounter text rendering with SharedValue**
   - What we know: Reanimated's `useAnimatedStyle` works for transforms/opacity but animating text content requires either a custom `ReText` component or rounding the SharedValue on each frame.
   - What's unclear: Whether the simple approach of passing `value` as a prop (not SharedValue) and using React re-render with `withTiming` scale pop is sufficient, or whether we need a SharedValue-driven text approach for smoothness.
   - Recommendation: Start simple -- pass `value` as a regular prop, animate the container (scale pop) with Reanimated. The value only changes on drop events (not 60fps), so React re-render is acceptable. Only escalate to SharedValue-driven text if there's visible jank.

2. **SnapZone measurement coordinate space**
   - What we know: `onLayout` gives position relative to parent; `measureInWindow` gives absolute screen coordinates. DraggableItem's translateX/Y are relative to its original render position.
   - What's unclear: Whether the coordinate spaces will align correctly when manipulatives are inside a collapsible ManipulativePanel (Phase 18) that itself animates height.
   - Recommendation: Use `measureInWindow` for SnapZone positions. Re-measure when parent layout changes (listen for onLayout on the canvas container). This adds ~1 frame of measurement latency but guarantees coordinate accuracy.

## Sources

### Primary (HIGH confidence)
- [RNGH Gesture Composition](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/) -- Race, Exclusive, Simultaneous APIs
- [RNGH Pan Gesture](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/use-pan-gesture/) -- minDistance, event properties (translationX/Y, velocityX/Y)
- [Reanimated withSpring](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/) -- Config: damping, stiffness, mass, overshootClamping, energyThreshold
- [Reanimated Handling Gestures](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/handling-gestures/) -- Pan + SharedValue + animated style integration
- [Reanimated measure()](https://docs.swmansion.com/react-native-reanimated/docs/advanced/measure/) -- UI-thread layout measurement
- [scheduleOnRN](https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRN/) -- Variadic argument passing, RN Runtime scope requirement
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) -- ImpactFeedbackStyle, NotificationFeedbackType
- [RNGH Testing with Jest](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing/) -- fireGestureHandler, getByGestureTestId
- Project skill: `.claude/skills/react-native-best-practices/references/js-animations-reanimated.md` -- Reanimated 4 migration checklist, worklet patterns
- Project research: `.planning/research/ARCHITECTURE.md` -- Full component structure, data flow, code patterns
- Project research: `.planning/research/PITFALLS.md` -- 7 critical pitfalls with prevention strategies

### Secondary (MEDIUM confidence)
- [Reanimated 3.x to 4.x Migration](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) -- API changes verified
- [react-native-gesture-handler npm](https://www.npmjs.com/package/react-native-gesture-handler) -- v2.28.0 is current stable, v3.0 is nightly only
- [Reanimated DnD library](https://github.com/entropyconquers/react-native-reanimated-dnd) -- Evaluated as alternative; rejected (Reanimated 3 dependency, adds risk)

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or existing codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and versions verified in package.json
- Architecture: HIGH -- patterns verified against existing codebase patterns (ConfettiCelebration.tsx, AnswerFeedbackAnimation.tsx) and official Reanimated/RNGH docs
- Pitfalls: HIGH -- documented from official docs, project-specific pitfalls research, and codebase inspection (missing GestureHandlerRootView confirmed)
- Testing: HIGH -- existing jest.setup.js inspected; mock enhancement patterns verified against RNGH testing docs

**Critical finding:** App.tsx is MISSING `GestureHandlerRootView` wrapper. This is a prerequisite for ALL gesture functionality and must be added before any Phase 16 components can work.

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable libraries, no breaking changes expected)
