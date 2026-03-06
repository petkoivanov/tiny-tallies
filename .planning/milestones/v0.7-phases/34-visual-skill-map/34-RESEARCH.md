# Phase 34: Visual Skill Map - Research

**Researched:** 2026-03-05
**Domain:** SVG graph rendering, Reanimated animations, skill map UI
**Confidence:** HIGH

## Summary

This phase renders the 14-skill prerequisite DAG as a two-column interactive visual tree using `react-native-svg` (v15.12.1, already installed) for node/edge rendering and `react-native-reanimated` (v4.1.6, already installed) for animations. No new dependencies are needed.

The DAG has a clean structure: 7 addition nodes in a left column, 7 subtraction nodes in a right column, 12 same-column vertical edges (linear chains), and 6 cross-column diagonal edges (each subtraction row 1-6 has one prerequisite from the corresponding addition row). All 14 nodes fit on one screen with fixed positions computed from container dimensions via `onLayout`. The existing `SKILLS` array, `isSkillUnlocked()`, `getOuterFringe()`, and `skillStates` store provide all data; the screen is purely a read-only visualization with a tap-to-detail overlay.

**Primary recommendation:** Use SVG for all graph rendering (nodes, edges, labels) with `Animated.createAnimatedComponent` + `useAnimatedProps` for SVG property animations (opacity, stroke, fill). Use Reanimated `Animated.View` wrappers for entrance scale/fade animations on node groups. Follow the `BadgeDetailOverlay` centered-modal pattern for the detail overlay.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Top-down vertical tree: Grade 1 skills at top, Grade 3 at bottom
- Two columns: addition (left), subtraction (right) with cross-links between them
- Fits on one screen -- all 14 nodes visible without scrolling
- Column headers ("Addition", "Subtraction") at top with grade indicators (Grade 1/2/3) along the side
- Circular nodes with operation emoji (+ for addition, - for subtraction) and colored state ring
- Four state visuals: Locked (dimmed/gray + lock icon), Unlocked (accent outline, no fill), In-progress (partial fill donut from masteryProbability), Mastered (solid gold/green + checkmark/star)
- Small abbreviated label below each node
- Operation-tinted node colors: blue-purple for addition, teal-green for subtraction
- Centered modal detail overlay matching BadgeDetailOverlay pattern, tap outside to dismiss
- Child-friendly data: progress bar for mastery (not raw number), 1-6 stars for Leitner box, BKT probability drives progress bar silently
- Locked skills show prerequisite names with completion checkmarks
- View only -- no "Practice" action button
- Fixed layout -- no pan/zoom. Tap nodes only interaction
- Staggered node reveal on screen open: nodes fade/scale in top-to-bottom (~50ms stagger per node, ~700ms total), edges draw in after nodes
- Outer fringe edges glow with subtle pulse
- Outer fringe nodes have gentle idle breathing pulse
- Mastered/locked nodes are static after entrance animation

### Claude's Discretion
- Edge rendering approach (curved bezier vs straight diagonal)
- Exact node sizes, spacing, and typography within fits-on-screen constraint
- Exact color values for operation tints (blue-purple addition / teal-green subtraction families)
- Stagger timing and easing curves for entrance animation
- State-change animation specifics (mastery fill transition, unlock celebration pulse)
- Progress bar and stars styling in detail overlay
- SVG vs View-based rendering decision for nodes (performance tradeoff)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SMAP-01 | User can view prerequisite DAG as interactive visual tree/graph | SVG rendering with `react-native-svg`, fixed 2-column layout computed from container dimensions, `SKILLS` array provides DAG data, tap interaction via `Pressable` overlays on SVG nodes |
| SMAP-02 | Skill nodes show locked/unlocked/in-progress/mastered states from BKT | `isSkillUnlocked()` + `getOuterFringe()` for unlock/fringe state, `getOrCreateSkillState()` for masteryProbability/masteryLocked/leitnerBox, four visual states with distinct ring colors |
| SMAP-03 | User can tap node for detail overlay (mastery %, BKT probability, Leitner box) | `BadgeDetailOverlay` Modal pattern reuse, `getOrCreateSkillState()` provides all data, child-friendly progress bar + stars presentation |
| SMAP-04 | Nodes animate mastery fill, pulse on unlock, edges glow for active path | Reanimated `withRepeat`+`withTiming` for breathing pulse, `useAnimatedProps` with `SVGAdapter` for SVG property animation, `withDelay` stagger for entrance |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-svg | 15.12.1 | SVG node/edge rendering | Already installed, used for NumberLine and pictorial diagrams |
| react-native-reanimated | 4.1.6 | UI-thread animations | Already installed, established pattern throughout app |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | installed | Safe area insets for screen padding | Screen top padding |
| @react-navigation/native | installed | Navigation to/from skill map | Screen registration and back navigation |
| lucide-react-native | installed | Lock, Check, Star, ChevronLeft icons | Node state overlays, back button, detail overlay |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG for nodes | View-based circles | Views are simpler but SVG enables ring/donut progress rendering natively; SVG is the right choice for circular progress rings |
| SVG for edges | View-based absolute-positioned lines | Views cannot render curved paths; SVG `Path` with bezier is essential for cross-column edges |
| Animated SVG props | Opacity-only View wrappers | `useAnimatedProps` with `SVGAdapter` enables direct SVG property animation (strokeDashoffset for ring fill, opacity for glow) on the UI thread |

**Installation:**
```bash
# No new dependencies needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  screens/
    SkillMapScreen.tsx          # Screen shell: safe area, header, back button, overlay state
  components/
    skillMap/
      index.ts                  # Barrel export
      SkillMapGraph.tsx          # SVG container: onLayout, node/edge coordinate computation, renders SkillMapNode + SkillMapEdge
      SkillMapNode.tsx           # Single SVG node: circle + ring + emoji + label, animated entrance + pulse
      SkillMapEdge.tsx           # Single SVG edge: Path line between nodes, optional glow animation
      SkillDetailOverlay.tsx     # Modal overlay: mastery progress bar, stars, prereq checklist
      skillMapLayout.ts          # Pure functions: compute node positions, edge paths from container dimensions
      skillMapTypes.ts           # TypeScript types for node state, position, edge data
      skillMapColors.ts          # Color constants for operation tints, state rings
```

### Pattern 1: Fixed-Position Graph Layout (Pure Computation)
**What:** Compute all node (x,y) positions and edge paths from container dimensions in a pure function -- no layout engine needed.
**When to use:** The DAG is static (14 nodes, fixed topology). No dynamic layout algorithm is needed.
**Example:**
```typescript
// skillMapLayout.ts
export interface NodePosition {
  skillId: string;
  x: number;
  y: number;
  column: 'addition' | 'subtraction';
  row: number; // 0-6
  grade: 1 | 2 | 3;
}

export interface EdgeData {
  fromId: string;
  toId: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  isCrossColumn: boolean;
}

export function computeNodePositions(
  width: number,
  height: number,
  headerHeight: number,
): NodePosition[] {
  const addX = width * 0.30; // Addition column at 30%
  const subX = width * 0.70; // Subtraction column at 70%
  const usableHeight = height - headerHeight;
  const rowSpacing = usableHeight / 8; // 7 nodes need 8 segments for padding
  const startY = headerHeight + rowSpacing;

  // 7 addition nodes at rows 0-6, 7 subtraction nodes at rows 0-6
  // Positions are deterministic from dimensions
  ...
}

export function computeEdgePaths(
  nodes: NodePosition[],
  nodeRadius: number,
): EdgeData[] {
  // Derive edges from SKILLS prerequisites
  // Same-column: straight vertical lines
  // Cross-column: quadratic bezier curves
  ...
}
```

### Pattern 2: SVG + Reanimated Animated Components
**What:** Create animated SVG components using `Animated.createAnimatedComponent` and drive SVG properties via `useAnimatedProps` with `SVGAdapter`.
**When to use:** For animating SVG-specific properties like `strokeDashoffset` (progress ring), `opacity` (glow), `strokeOpacity` (edge glow).
**Example:**
```typescript
// SkillMapNode.tsx
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withDelay,
  SVGAdapter,
} from 'react-native-reanimated';
import { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

// For progress ring (in-progress state):
const circumference = 2 * Math.PI * radius;
const progressOffset = circumference * (1 - masteryProbability);

const ringProps = useAnimatedProps(() => ({
  strokeDashoffset: progressOffset,
}), null, SVGAdapter);

// For breathing pulse (outer fringe):
const pulseOpacity = useSharedValue(1);
useEffect(() => {
  if (isOuterFringe) {
    pulseOpacity.value = withRepeat(
      withTiming(0.5, { duration: 1200 }),
      -1,
      true, // reverse
    );
  }
}, [isOuterFringe]);
```

### Pattern 3: Staggered Entrance Animation
**What:** Nodes fade/scale in top-to-bottom with ~50ms stagger, edges draw after nodes complete.
**When to use:** On screen mount to create a polished reveal effect.
**Example:**
```typescript
// Per-node entrance with row-based delay
const entranceScale = useSharedValue(0);
const entranceOpacity = useSharedValue(0);

useEffect(() => {
  const delay = row * 50; // 50ms per row, 0-6 rows
  entranceScale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 180 }));
  entranceOpacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
}, []);

// Edges start after last node (row 6 * 50ms + buffer)
const edgeDelay = 7 * 50 + 100; // ~450ms
```

### Pattern 4: Detail Overlay (Modal Pattern)
**What:** Centered modal with dim backdrop, matching `BadgeDetailOverlay` exactly.
**When to use:** When user taps any skill node.
**Example:**
```typescript
// SkillDetailOverlay.tsx -- follows BadgeDetailOverlay pattern
<Modal transparent animationType="fade" onRequestClose={onClose}>
  <Pressable style={styles.backdrop} onPress={onClose}>
    <Pressable style={styles.card} onPress={() => {}}>
      {/* Skill name, emoji, progress bar, stars, prereqs */}
    </Pressable>
  </Pressable>
</Modal>
```

### Anti-Patterns to Avoid
- **Dynamic layout algorithms for a static graph:** The DAG is fixed at 14 nodes with known topology. Do not use d3-force, dagre, or any layout library. Compute positions from container dimensions with simple arithmetic.
- **ScrollView/FlatList for the map:** The map must fit on one screen without scrolling. Use a fixed-height SVG container measured via `onLayout`.
- **Inline styles in SVG components:** Use constants and computed values, not inline style objects. `StyleSheet.create` for View-level styles; SVG props are passed directly.
- **Separate SVG for each node:** Use a single `<Svg>` container with all nodes and edges as children. Multiple SVGs cause layout complexity and prevent edge rendering between nodes.
- **Pan/Zoom gestures:** User explicitly decided fixed layout, tap-only interaction. Do not add `PanGestureHandler` or `PinchGestureHandler`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Skill unlock logic | Custom prerequisite checker | `isSkillUnlocked()` from `prerequisiteGating.ts` | Already handles BKT mastery gating, no-re-locking policy, root skills |
| Outer fringe detection | Manual DAG traversal | `getOuterFringe()` from `prerequisiteGating.ts` | Correctly excludes mastered and previously-practiced skills |
| Skill state defaults | Manual fallback values | `getOrCreateSkillState()` from `skillStateHelpers.ts` | Lazy initialization with correct defaults (masteryProbability: 0.1, leitnerBox: 1, etc.) |
| SVG animation | JS-thread Animated API | `Animated.createAnimatedComponent` + `useAnimatedProps` | Runs on UI thread, no jank during JS work |
| Progress ring math | Manual arc path string | `strokeDasharray` + `strokeDashoffset` on Circle | Standard SVG technique for circular progress -- a circle with dash pattern where the dash length equals circumference |
| Modal overlay | Custom absolute positioning | React Native `Modal` component | Handles Android back button (`onRequestClose`), proper z-ordering, tested pattern |

**Key insight:** This phase is a pure read-only visualization. All data sources (SKILLS array, prerequisiteGating functions, skillStates store) already exist. The work is entirely in the visual rendering layer.

## Common Pitfalls

### Pitfall 1: SVG Coordinate System vs RN Layout
**What goes wrong:** SVG uses a top-left origin coordinate system where Y increases downward. Mixing SVG positioning with RN layout (flexbox, absolute positioning) creates confusing coordinate math.
**Why it happens:** Developers try to use RN Views inside SVG or vice versa.
**How to avoid:** Render the entire graph (nodes + edges + labels) inside a single `<Svg>` element. Use SVG primitives (`Circle`, `Path`, `Text as SvgText`, `G`) for everything inside the SVG. Use RN `Pressable` as invisible overlays on top of SVG for tap detection (absolute-positioned over node coordinates).
**Warning signs:** Nodes appearing at wrong positions, edges not connecting to nodes.

### Pitfall 2: Tap Targets Too Small for Children
**What goes wrong:** SVG elements don't have a `Pressable` equivalent. Using `onPress` on SVG `Circle` is unreliable across platforms.
**Why it happens:** `react-native-svg` event handling is inconsistent, especially on Android.
**How to avoid:** Layer invisible RN `Pressable` components (absolute-positioned) over each node's screen coordinates. Ensure 48dp minimum touch target per CLAUDE.md. The `onLayout` measurement gives coordinates for both SVG rendering and Pressable positioning.
**Warning signs:** Taps not registering, inconsistent behavior between iOS and Android.

### Pitfall 3: Progress Ring strokeDashoffset Direction
**What goes wrong:** The progress ring fills clockwise from the 3-o'clock position by default, not from the top.
**Why it happens:** SVG circles start their stroke at 0 degrees (3 o'clock) and go clockwise.
**How to avoid:** Rotate the progress ring by -90 degrees: `transform="rotate(-90, cx, cy)"` so it starts at 12 o'clock (top) and fills clockwise, which feels natural for "filling up".
**Warning signs:** Progress appears to start from the right side of the circle.

### Pitfall 4: Animated SVG Props Require SVGAdapter
**What goes wrong:** `useAnimatedProps` works for RN Views but SVG components need the `SVGAdapter` to map animated prop names to native SVG attributes.
**Why it happens:** SVG attribute naming (e.g., `strokeDashoffset`) differs from RN style naming.
**How to avoid:** Always pass `SVGAdapter` as the third argument to `useAnimatedProps` when animating SVG components: `useAnimatedProps(() => ({...}), null, SVGAdapter)`.
**Warning signs:** Animated SVG props not updating, console warnings about unknown props.

### Pitfall 5: onLayout Not Firing on Mount
**What goes wrong:** SVG rendering requires container dimensions but `onLayout` fires asynchronously after mount, causing a frame of invisible/zero-sized content.
**Why it happens:** RN layout is asynchronous.
**How to avoid:** Initialize with `width: 0, height: 0` state and render null/placeholder until dimensions are available. The `NumberLineSvg` pattern already does this: `if (width <= 0) return null`.
**Warning signs:** Flash of empty content on screen open, nodes at (0,0).

### Pitfall 6: Too Many Animated Components Causing Frame Drops
**What goes wrong:** Creating 14 separate `useSharedValue` + `useAnimatedProps` sets for nodes plus 18 for edges overwhelms the animation system.
**Why it happens:** Each animated component is independently tracked.
**How to avoid:** Only animate nodes that need animation (outer fringe breathing pulse -- typically 1-3 nodes at a time). Use static SVG props for locked/mastered nodes. Entrance animation can use a single shared progress value with per-node delay rather than 14 independent shared values.
**Warning signs:** Choppy animations, high CPU usage on low-end devices.

## Code Examples

### Node State Derivation
```typescript
// Derive display state for each skill from store data
import { SKILLS } from '@/services/mathEngine/skills';
import { isSkillUnlocked, getOuterFringe } from '@/services/adaptive/prerequisiteGating';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import type { SkillState } from '@/store/slices/skillStatesSlice';

export type NodeState = 'locked' | 'unlocked' | 'in-progress' | 'mastered';

export function getNodeState(
  skillId: string,
  skillStates: Record<string, SkillState>,
): NodeState {
  const state = getOrCreateSkillState(skillStates, skillId);

  if (state.masteryLocked) return 'mastered';
  if (state.attempts > 0) return 'in-progress';
  if (isSkillUnlocked(skillId, skillStates)) return 'unlocked';
  return 'locked';
}
```

### Progress Ring SVG Pattern
```typescript
// Circular progress ring using strokeDasharray/strokeDashoffset
// Source: Standard SVG technique, verified with react-native-svg 15.x

const NODE_RADIUS = 24;
const RING_RADIUS = NODE_RADIUS + 4; // Ring sits outside the node circle
const STROKE_WIDTH = 4;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ProgressRingProps {
  cx: number;
  cy: number;
  progress: number; // 0-1 from masteryProbability
  color: string;
}

function ProgressRing({ cx, cy, progress, color }: ProgressRingProps) {
  const offset = CIRCUMFERENCE * (1 - progress);
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={RING_RADIUS}
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeDasharray={`${CIRCUMFERENCE}`}
      strokeDashoffset={offset}
      strokeLinecap="round"
      fill="none"
      transform={`rotate(-90, ${cx}, ${cy})`}
    />
  );
}
```

### Bezier Edge Path for Cross-Column Links
```typescript
// Source: NumberLineSvg.tsx hop arrows pattern adapted for skill map edges
// Cross-column edges use quadratic bezier curves for visual clarity

function computeEdgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  isCrossColumn: boolean,
  nodeRadius: number,
): string {
  // Offset start/end to node circle edges (not centers)
  const startY = from.y + nodeRadius;
  const endY = to.y - nodeRadius;

  if (!isCrossColumn) {
    // Same-column: straight vertical line
    return `M ${from.x} ${startY} L ${to.x} ${endY}`;
  }

  // Cross-column: quadratic bezier with control point at midpoint
  const midX = (from.x + to.x) / 2;
  const midY = (startY + endY) / 2;
  return `M ${from.x} ${startY} Q ${midX} ${midY} ${to.x} ${endY}`;
}
```

### Reanimated Mock Pattern for Tests
```typescript
// Source: BadgeUnlockPopup.test.tsx -- established project pattern
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text: require('react-native').Text,
      createAnimatedComponent: (c: any) => c,
      call: jest.fn(),
    },
    useSharedValue: (init: any) => ({ value: init }),
    useAnimatedStyle: (fn: () => any) => fn(),
    useAnimatedProps: (fn: () => any) => fn(),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withDelay: (_d: number, v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    withRepeat: (v: any) => v,
    Easing: { in: (e: any) => e, inOut: (e: any) => e, quad: (v: any) => v, linear: (v: any) => v, ease: (v: any) => v },
    useReducedMotion: jest.fn(() => false),
    SVGAdapter: undefined,
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: View, // Svg container
    Svg: View,
    Circle: (props: any) => <View testID={props.testID ?? 'svg-circle'} {...props} />,
    Path: (props: any) => <View testID={props.testID ?? 'svg-path'} {...props} />,
    Line: (props: any) => <View testID={props.testID ?? 'svg-line'} {...props} />,
    G: (props: any) => <View {...props} />,
    Text: (props: any) => <Text {...props} />,
    Rect: (props: any) => <View {...props} />,
  };
});
```

### Breathing Pulse Animation Pattern
```typescript
// Source: GuidedHighlight.tsx and HelpButton.tsx -- established project pattern
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

function useBreathingPulse(active: boolean) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1, // infinite
        true, // reverse (breathe in/out)
      );
      opacity.value = withRepeat(
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}
```

## DAG Topology Reference

The 14-skill DAG has this exact structure (critical for layout computation):

```
                Addition (Left)              Subtraction (Right)
Grade 1 Row 0:  Add within 10               Sub within 10
                    |                           |    \
Grade 1 Row 1:  Add within 20 (no carry) ----> Sub within 20 (no borrow)
                    |                           |    \
Grade 1 Row 2:  Add within 20 (carry) -------> Sub within 20 (borrow)
                    |                           |    \
Grade 2 Row 3:  Add two-digit (no carry) ----> Sub two-digit (no borrow)
                    |                           |    \
Grade 2 Row 4:  Add two-digit (carry) -------> Sub two-digit (borrow)
                    |                           |    \
Grade 3 Row 5:  Add three-digit (no carry) --> Sub three-digit (no borrow)
                    |                           |    \
Grade 3 Row 6:  Add three-digit (carry) -----> Sub three-digit (borrow)
```

**Edge counts:**
- Same-column vertical (addition chain): 6 edges
- Same-column vertical (subtraction chain): 6 edges
- Cross-column (addition -> subtraction): 6 edges
- **Total: 18 edges**

**Cross-link pattern:** Addition row N -> Subtraction row N+1 (each subtraction skill requires the equivalent addition skill).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `runOnJS` callback pattern | `scheduleOnRN` from `react-native-worklets` | Reanimated 4.x | Project already migrated; use `scheduleOnRN` if needed |
| `restDisplacementThreshold` in `withSpring` | `energyThreshold` | Reanimated 4.x | Use `energyThreshold` for spring config |
| `useAnimatedGestureHandler` | Gesture API from `react-native-gesture-handler` v2+ | Reanimated 4.x | Not relevant (no gestures in skill map) |

**Deprecated/outdated:**
- Reanimated 3 `runOnUI`/`runOnJS` API: replaced by `scheduleOnUI`/`scheduleOnRN` from `react-native-worklets`. Project babel.config.js already uses `react-native-worklets/plugin`.

## Color Scheme Recommendation (Claude's Discretion)

Based on the project's dark theme (`colors.background: #1a1a2e`) and existing accents:

```typescript
// skillMapColors.ts
export const skillMapColors = {
  // Operation tints
  addition: {
    base: '#7c3aed',     // Purple-500 (blue-purple family)
    light: '#a78bfa',    // Purple-400
    ring: '#c4b5fd',     // Purple-300
  },
  subtraction: {
    base: '#0d9488',     // Teal-600 (teal-green family)
    light: '#2dd4bf',    // Teal-400
    ring: '#5eead4',     // Teal-300
  },

  // State overlays (applied on top of operation tint)
  locked: {
    fill: '#374151',     // Gray-700
    ring: '#6b7280',     // Gray-500
    label: '#9ca3af',    // Gray-400
  },
  unlocked: {
    fill: 'transparent',
    // ring uses operation tint color
  },
  inProgress: {
    // ring uses operation tint, fill from strokeDashoffset progress
  },
  mastered: {
    ring: '#fbbf24',     // Amber-400 (gold)
    fill: '#fbbf24',
  },

  // Edge colors
  edge: {
    normal: '#475569',   // Slate-600
    glow: '#818cf8',     // Matches project primaryLight
  },
} as const;
```

## Node Size Recommendation (Claude's Discretion)

For 14 nodes fitting on one screen (assuming ~700px usable height after header/safe area):

- **Node radius:** 22-26px (44-52dp diameter, meeting 48dp touch target minimum)
- **Row spacing:** ~80-90px (700px / 8 segments)
- **Column separation:** 40% of screen width between centers
- **Label font:** 10-11px (typography.fontSize.xs range)
- **Node emoji:** 16-18px

## Edge Rendering Recommendation (Claude's Discretion)

**Recommendation: Quadratic bezier for cross-column, straight for same-column.**

- Same-column edges: Straight vertical `Line` from bottom of parent node to top of child node
- Cross-column edges: Quadratic bezier `Path` with control point at the vertical midpoint -- creates a gentle S-curve that avoids overlapping with nodes
- This matches the `NumberLineSvg` hop arrow pattern already established in the codebase

## Open Questions

1. **Animated SVG props with react-native-svg 15 + Reanimated 4 compatibility**
   - What we know: `Animated.createAnimatedComponent(Circle)` + `useAnimatedProps` with `SVGAdapter` is the documented pattern for Reanimated 4
   - What's unclear: Whether `SVGAdapter` is fully compatible with react-native-svg v15.12.1 on Reanimated 4.1.6 specifically -- the project has never used this combination
   - Recommendation: If `useAnimatedProps` with SVGAdapter causes issues, fallback to wrapping SVG elements in `Animated.View` and using `useAnimatedStyle` for opacity/transform animations only (this is simpler and definitely works). The progress ring can use a static `strokeDashoffset` prop driven by React state instead of animated props.

2. **Performance on low-end Android with 14 animated SVG nodes**
   - What we know: STATE.md notes "Skill map SVG rendering needs performance validation spike on low-end Android (target < 500ms TTI)"
   - What's unclear: Whether 14 SVG nodes + 18 edges + multiple animated shared values will cause frame drops
   - Recommendation: Only animate outer fringe nodes (typically 1-3 at a time). All other nodes render with static SVG props. Entrance animation uses a single driving shared value with `withDelay` offsets. Defer entrance animation until `InteractionManager.runAfterInteractions` for clean screen transition.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | `jest.config.js` (exists) |
| Quick run command | `npm test -- --testPathPattern=skillMap` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SMAP-01 | DAG rendered as visual tree with 14 nodes | unit | `npm test -- --testPathPattern=SkillMapScreen` | Wave 0 |
| SMAP-01 | Navigation to SkillMap from HomeScreen | unit | `npm test -- --testPathPattern=HomeScreen` | Existing (update) |
| SMAP-02 | Nodes show correct state (locked/unlocked/in-progress/mastered) | unit | `npm test -- --testPathPattern=SkillMapGraph` | Wave 0 |
| SMAP-02 | getNodeState derives state from BKT data | unit | `npm test -- --testPathPattern=skillMapLayout` | Wave 0 |
| SMAP-03 | Tap node opens detail overlay with skill data | unit | `npm test -- --testPathPattern=SkillMapScreen` | Wave 0 |
| SMAP-03 | Detail overlay shows progress bar, stars, prereqs | unit | `npm test -- --testPathPattern=SkillDetailOverlay` | Wave 0 |
| SMAP-04 | Entrance animation stagger (smoke test) | manual-only | Visual verification | N/A |
| SMAP-04 | Outer fringe pulse animation | manual-only | Visual verification | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=skillMap`
- **Per wave merge:** `npm test && npm run typecheck`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/screens/SkillMapScreen.test.tsx` -- covers SMAP-01, SMAP-03
- [ ] `src/__tests__/components/SkillMapGraph.test.tsx` -- covers SMAP-02 (node state rendering)
- [ ] `src/__tests__/components/SkillDetailOverlay.test.tsx` -- covers SMAP-03 (overlay content)
- [ ] `src/__tests__/components/skillMapLayout.test.ts` -- covers SMAP-02 (getNodeState pure function)
- [ ] Update `src/__tests__/screens/HomeScreen.test.tsx` -- covers SMAP-01 (navigation entry point)

## Sources

### Primary (HIGH confidence)
- `src/services/mathEngine/skills.ts` -- SKILLS array with 14 SkillDefinitions, prerequisites, operations, grades
- `src/services/adaptive/prerequisiteGating.ts` -- isSkillUnlocked, getUnlockedSkills, getOuterFringe
- `src/store/slices/skillStatesSlice.ts` -- SkillState type with masteryProbability, masteryLocked, leitnerBox
- `src/store/helpers/skillStateHelpers.ts` -- getOrCreateSkillState with defaults
- `src/services/adaptive/bktCalculator.ts` -- BKT_MASTERY_THRESHOLD = 0.95
- `src/components/badges/BadgeDetailOverlay.tsx` -- Modal overlay pattern
- `src/components/animations/BadgeUnlockPopup.tsx` -- Reanimated animation patterns (withDelay, withSpring, withSequence)
- `src/components/manipulatives/NumberLine/NumberLineSvg.tsx` -- SVG rendering with bezier paths
- `src/components/manipulatives/shared/GuidedHighlight.tsx` -- withRepeat breathing pulse pattern
- [Reanimated useAnimatedProps docs](https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedProps/) -- SVGAdapter pattern
- [Reanimated animating styles and props](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/animating-styles-and-props/) -- createAnimatedComponent pattern

### Secondary (MEDIUM confidence)
- Package versions verified from node_modules: react-native-svg 15.12.1, react-native-reanimated 4.1.6
- Babel config confirms react-native-worklets/plugin (Reanimated 4 setup)

### Tertiary (LOW confidence)
- SVGAdapter + react-native-svg v15 + Reanimated 4.1.6 combination not yet tested in this project (see Open Question 1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in the project
- Architecture: HIGH -- DAG topology fully analyzed, layout computation is straightforward arithmetic, patterns taken from existing codebase
- Pitfalls: HIGH -- based on direct experience with project codebase and verified SVG/Reanimated patterns
- Animation approach: MEDIUM -- SVGAdapter + animated SVG props pattern is well-documented but untested in this specific project version combination

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable -- no fast-moving dependencies)
