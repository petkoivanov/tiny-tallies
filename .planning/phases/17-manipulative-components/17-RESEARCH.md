# Phase 17: Manipulative Components - Research

**Researched:** 2026-03-03
**Domain:** Six virtual math manipulatives (base-ten blocks, number line, ten frame, counters, fraction strips, bar model) built on Phase 16 shared drag primitives
**Confidence:** HIGH

## Summary

Phase 17 implements six standalone interactive manipulative components, each building on the DraggableItem, SnapZone, and AnimatedCounter primitives delivered in Phase 16. The components are purely visual/interactive -- no problem awareness, no session integration, no store persistence. State is ephemeral and component-local (React state + Reanimated SharedValues).

The primary technical challenge is the base-ten blocks auto-grouping choreography: detecting when 10 cubes occupy the ones column, animating them into a rod, and supporting the inverse decomposition. This requires coordinating multiple SharedValue-driven animations in sequence using `withDelay` and `withSequence` from Reanimated 4. The number line uses react-native-svg (already installed, v15.12.1) for tick marks and hop arrow arcs, with `Animated.createAnimatedComponent` wrapping SVG elements for smooth marker animation. The remaining four manipulatives (ten frame, counters, fraction strips, bar model) are simpler compositions of SnapZone grids, tap-to-toggle state, and basic Animated.View transforms.

All six manipulatives render inside a shared ManipulativeShell wrapper component that provides the reset button (top-left), AnimatedCounter (top-right), and a flex workspace area. This ensures visual consistency and reduces per-component boilerplate. Each manipulative stays under 500 lines by splitting into a main component + helper modules (constants, types, layout calculations).

**Primary recommendation:** Build a ManipulativeShell wrapper first, then implement components in order of complexity: counters (simplest -- free placement + tap-to-flip) -> ten frame (SnapZone grid) -> number line (SVG + snap-to-tick) -> fraction strips (tap-to-shade) -> bar model (drag dividers + number picker) -> base-ten blocks (most complex -- auto-group/decompose choreography).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Base-ten blocks: count-based auto-group when 10 cubes in ones column after ~500ms delay
- Merge animation: slide-and-stack cubes into rod (~400ms total)
- Decompose: tap rod to fan out 10 cubes; cross-column drag rod from tens->ones auto-decomposes
- Hundreds flats: same 10:1 grouping pattern as rods (10 rods -> flat)
- Place-value mat: labeled columns (Hundreds | Tens | Ones) with distinct background colors
- Block sourcing: tray/palette at bottom; drag from tray or tap to add
- Base-ten block color: all blocks share one color (e.g., blue); size differentiates
- 30-object cap: gentle nudge message ("Try grouping your cubes!") + prevent adding
- Number line: snap to tick marks (discrete integer steps), hop arrows as cumulative trail
- Number line range: configurable 0-10, 0-20, 0-100 (tick marks at 10s with expandable sections)
- Single marker only on number line
- Ten frame: fill order top-left to right, top row first (1-5), then bottom (6-10)
- Ten frame: second frame auto-spawns when first full (add-within-20)
- Ten frame: tap occupied cell to remove counter (fade-out)
- Counters: two-color flip (red start, tap to flip yellow), running count shows both colors
- Counters: free placement (no grid), children group by color naturally
- Counter colors: red and yellow (classic classroom)
- Fraction strips: tap to toggle shade, 48dp targets
- Fraction strips: up to 3 strips stacked vertically for comparison
- Fraction strip denominators: 2, 3, 4, 6, 8
- Bar model: preset partition count (2, 3, 4 parts) then drag dividers to resize
- Bar model: number picker wheel (0-999), no keyboard, no free text
- Bar model: tap section to mark as unknown with "?" display
- Visual design: flat + friendly, clean flat shapes, rounded corners, soft shadows, bold solid colors
- Per-type color palette: base-ten=blue, counters=red/yellow, number line=green, ten frame=orange, fraction strips=purple, bar model=teal
- Drag state: scale up (1.05x) + shadow lift using Phase 16 DRAG_SCALE/DRAG_OPACITY
- Shared ManipulativeShell wrapper: reset button (top-left), AnimatedCounter (top-right), workspace area
- Running count: top-right corner, fixed, uses Phase 16 AnimatedCounter
- Reset: staggered spring animations using Phase 16 RESET_SPRING_CONFIG and RESET_STAGGER_MS
- API scope: standalone only -- no problem awareness, no session props

### Claude's Discretion
- Exact color hex values for each manipulative palette (within dark-theme high-contrast)
- ManipulativeShell component API details (props, flex layout, safe area handling)
- Number line tick label sizing and positioning
- Bar model divider drag handle design
- Fraction strip visual styling (border vs fill for shaded/unshaded)
- Auto-group delay exact timing (500ms suggested but fine-tunable)
- Counter workspace dimensions and maximum counter count
- Component file organization (one file vs split into sub-components)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MANIP-01 | User can drag and drop base-ten blocks (ones cubes, tens rods, hundreds flats) onto a place-value mat | DraggableItem for each block type, SnapZone for each place-value column, tray palette for sourcing blocks. Block rendering via Animated.View with size-based styling |
| MANIP-02 | User can auto-group 10 ones cubes into a tens rod, and tap a rod to decompose into 10 cubes | Auto-group detection via count monitoring with setTimeout delay, withSequence + withDelay for merge animation, tap handler for decompose fan-out animation |
| MANIP-03 | User can drag a marker along a number line and see hop arrows with labeled values | SVG Line/Text for number line rendering, DraggableItem for marker with snap-to-tick, SVG Path arcs for hop arrows with cumulative trail state |
| MANIP-04 | User can place counters on a ten frame with snap-to-cell behavior and running count display | 2x5 grid of SnapZones, DraggableItem counters, cell occupation tracking, second frame auto-spawn via conditional render |
| MANIP-05 | User can drag counters freely and use two-color mode for comparison/subtraction | Free-placement counters (no snap zones), tap-to-flip color toggle (red/yellow), dual running count display |
| MANIP-06 | User can shade fraction strip sections and compare fractions by stacking strips | Tap-to-toggle shading on strip sections, up to 3 strips stacked, configurable denominators (2,3,4,6,8) |
| MANIP-07 | User can create bar model part-whole layouts with labeled sections and "?" placeholder | Draggable dividers with proportional resizing, number picker modal (FlatList-based), tap-to-mark-unknown |
</phase_requirements>

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-gesture-handler | ~2.28.0 | Pan/Tap gesture composition for drag interactions | Used by Phase 16 DraggableItem; Gesture.Race(tap, pan) pattern established |
| react-native-reanimated | ~4.1.1 | UI-thread animations, SharedValues, withSequence/withDelay for choreography | Used by Phase 16 for all animations; withSequence essential for auto-group |
| react-native-worklets | ^0.7.4 | scheduleOnRN for thread-crossing (haptics, state updates) | Required peer for Reanimated 4; pattern established in Phase 16 |
| react-native-svg | 15.12.1 | Number line rendering (Line, Text, Path for hop arrows), fraction strip rendering | Already installed; provides SVG primitives for precise geometric drawing |
| expo-haptics | ~15.0.7 | Tactile feedback on snap, group, and decompose events | Phase 16 pattern: triggerSnapHaptic (Light), triggerGroupHaptic (Success) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | ~5.6.0 | Inset-aware ManipulativeShell layout | Already installed; shell wrapper needs safe area for reset button positioning |
| lucide-react-native | ^0.554.0 | Reset button icon, potentially info icons | Project standard icon library |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-svg for number line | Pure View-based rendering | SVG gives precise tick positioning, arc paths for hop arrows, text placement; Views require complex absolute positioning math. Use SVG. |
| FlatList-based number picker for bar model | @react-native-picker/picker | Expo picker is native-backed but styling is limited (cannot match dark theme consistently). FlatList with snapToInterval gives full styling control and no new dependency. Use FlatList. |
| react-native-wheel-scrollview-picker for number picker | Custom FlatList picker | External dependency (last updated 7 years ago); risky with Expo SDK 54. Build with FlatList snapToInterval. |

**Installation:** No new packages needed. All libraries already in package.json.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    manipulatives/
      shared/                    # Phase 16 (existing)
        DraggableItem.tsx
        SnapZone.tsx
        AnimatedCounter.tsx
        snapMath.ts
        haptics.ts
        animationConfig.ts
        types.ts
        index.ts
      ManipulativeShell.tsx       # ~120 lines: shared wrapper (reset, counter, workspace)
      ManipulativeShell.test.tsx   # render tests
      BaseTenBlocks/
        BaseTenBlocks.tsx         # ~350 lines: main component with auto-group orchestration
        BaseTenBlocksTypes.ts     # ~40 lines: BlockType, PlaceValueColumn types
        BaseTenBlocksLayout.ts    # ~80 lines: column positions, block sizing, tray layout
        BaseTenBlocksRenderers.tsx # ~120 lines: CubeBlock, RodBlock, FlatBlock visual components
        index.ts                  # barrel export
      NumberLine/
        NumberLine.tsx            # ~300 lines: main component with SVG number line + marker
        NumberLineTypes.ts        # ~30 lines: range config, marker state
        NumberLineSvg.tsx         # ~150 lines: SVG rendering (ticks, labels, hop arrows)
        index.ts
      TenFrame/
        TenFrame.tsx             # ~250 lines: main component with grid + dual-frame
        TenFrameTypes.ts         # ~25 lines: cell state, frame config
        index.ts
      Counters/
        Counters.tsx             # ~200 lines: free-placement with two-color flip
        CountersTypes.ts         # ~20 lines: counter state, color type
        index.ts
      FractionStrips/
        FractionStrips.tsx       # ~250 lines: stacked strips with tap-to-shade
        FractionStripsTypes.ts   # ~25 lines: strip config, denomination types
        index.ts
      BarModel/
        BarModel.tsx             # ~300 lines: part-whole with draggable dividers
        BarModelTypes.ts         # ~30 lines: section state, divider config
        NumberPicker.tsx         # ~130 lines: FlatList-based wheel picker (0-999)
        index.ts
      index.ts                   # master barrel: export all 6 + shell
```

### Pattern 1: ManipulativeShell Wrapper
**What:** A shared wrapper component that provides consistent layout for all 6 manipulatives: reset button (top-left), running count (top-right via AnimatedCounter), and flexible workspace area.
**When to use:** Every manipulative component renders inside ManipulativeShell.

**Example:**
```typescript
// src/components/manipulatives/ManipulativeShell.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { AnimatedCounter } from './shared';
import { colors, spacing, layout } from '@/theme';

interface ManipulativeShellProps {
  /** Current count value for AnimatedCounter */
  count: number;
  /** Optional label for counter (e.g., "Red: 5 | Yellow: 3") */
  countLabel?: string;
  /** Called when reset button pressed */
  onReset: () => void;
  /** Optional: custom counter component (for dual-count displays) */
  renderCounter?: () => React.ReactNode;
  /** The manipulative workspace */
  children: React.ReactNode;
}

export function ManipulativeShell({
  count,
  countLabel,
  onReset,
  renderCounter,
  children,
}: ManipulativeShellProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={onReset}
          style={styles.resetButton}
          accessibilityLabel="Reset manipulative"
          accessibilityRole="button"
        >
          <RotateCcw size={24} color={colors.textSecondary} />
        </Pressable>
        {renderCounter ? (
          renderCounter()
        ) : (
          <AnimatedCounter value={count} label={countLabel} />
        )}
      </View>
      <View style={styles.workspace}>{children}</View>
    </View>
  );
}
```

### Pattern 2: Auto-Group Choreography (Base-Ten Blocks)
**What:** When 10 cubes accumulate in the ones column, trigger a delayed auto-group sequence: wait ~500ms, then animate cubes sliding together into a rod shape over ~400ms, replace with a single rod object, and fire groupHaptic.
**When to use:** Base-ten blocks only.

**Example:**
```typescript
// Auto-group detection and choreography
import { withDelay, withSequence, withTiming, withSpring } from 'react-native-reanimated';

// Step 1: Detect grouping condition (called from React state, not worklet)
function checkAutoGroup(onesCount: number) {
  if (onesCount >= 10) {
    // Start auto-group after delay
    autoGroupTimer.current = setTimeout(() => {
      performAutoGroup();
    }, 500); // 500ms user decision: locked
  }
}

// Step 2: Animate merge (runs on UI thread via shared values)
function animateMerge(cubeOffsets: SharedValue<number>[], targetX: number) {
  // Slide all 10 cubes toward the target position with stagger
  for (let i = 0; i < 10; i++) {
    cubeOffsets[i].value = withDelay(
      i * 20, // 20ms stagger between cubes
      withTiming(targetX, { duration: 200 })
    );
  }
  // After all cubes reach target, scale down to form rod
  // Total: 200ms slide + 200ms morph = ~400ms
}

// Step 3: Replace cubes with rod (React state update after animation)
function performAutoGroup() {
  // Remove 10 cube objects, add 1 rod object
  setBlocks(prev => {
    const ones = prev.filter(b => b.type === 'cube' && b.column === 'ones');
    const rest = prev.filter(b => !(b.type === 'cube' && b.column === 'ones'));
    const cubesToRemove = ones.slice(0, 10);
    const remaining = ones.slice(10);
    return [
      ...rest,
      ...remaining,
      { id: generateId(), type: 'rod', column: 'tens' },
    ];
  });
  triggerGroupHaptic();
}
```

### Pattern 3: SVG Number Line with Animated Marker
**What:** Render the number line using react-native-svg (Line, Text, Path elements), with an Animated.createAnimatedComponent-wrapped SVG element for the marker. Hop arrows use SVG Path arc commands.
**When to use:** Number line manipulative.

**Example:**
```typescript
// Number line SVG rendering
import Svg, { Line, Text as SvgText, Path, Circle } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Render tick marks and labels
function renderTicks(range: [number, number], width: number) {
  const [min, max] = range;
  const count = max - min;
  const spacing = width / count;

  return Array.from({ length: count + 1 }, (_, i) => {
    const x = i * spacing;
    const value = min + i;
    return (
      <React.Fragment key={value}>
        <Line
          x1={x} y1={20} x2={x} y2={40}
          stroke="#AAAAAA" strokeWidth={2}
        />
        <SvgText
          x={x} y={55} fontSize={14}
          fill="#FFFFFF" textAnchor="middle"
        >
          {value}
        </SvgText>
      </React.Fragment>
    );
  });
}

// Hop arrow arc between two tick positions
function renderHopArc(fromX: number, toX: number, key: string) {
  const midX = (fromX + toX) / 2;
  const arcHeight = 25;
  // SVG quadratic bezier curve for the arc
  const d = `M ${fromX} 20 Q ${midX} ${20 - arcHeight} ${toX} 20`;
  return (
    <Path
      key={key}
      d={d}
      stroke="#4ADE80"
      strokeWidth={2}
      fill="none"
      markerEnd="url(#arrowhead)"
    />
  );
}
```

### Pattern 4: Tap-to-Toggle State (Fraction Strips, Ten Frame)
**What:** Track cell/section occupation as React state (boolean arrays). Tap toggles the boolean and triggers a visual transition. No drag needed -- just tap for shading.
**When to use:** Fraction strip section shading, ten frame counter removal.

**Example:**
```typescript
// Fraction strip tap-to-shade pattern
const [shaded, setShaded] = useState<boolean[]>(
  new Array(denominator).fill(false)
);

function handleSectionTap(index: number) {
  setShaded(prev => {
    const next = [...prev];
    next[index] = !next[index];
    return next;
  });
  triggerSnapHaptic();
}

// Count shaded sections for display
const numerator = shaded.filter(Boolean).length;
// AnimatedCounter shows: numerator/denominator
```

### Pattern 5: FlatList-Based Number Picker (Bar Model)
**What:** A custom number picker using FlatList with `snapToInterval` for iOS-style wheel behavior. Values 0-999, no keyboard input.
**When to use:** Bar model section labeling.

**Example:**
```typescript
// Number picker using FlatList with snap
import { FlatList } from 'react-native';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;

function NumberPicker({ value, onChange, min = 0, max = 999 }) {
  const data = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const flatListRef = useRef<FlatList>(null);

  return (
    <View style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => String(item)}
        renderItem={({ item, index }) => (
          <View style={[styles.pickerItem, { height: ITEM_HEIGHT }]}>
            <Text style={styles.pickerText}>{item}</Text>
          </View>
        )}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialScrollIndex={value - min}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.y / ITEM_HEIGHT
          );
          onChange(min + index);
        }}
      />
    </View>
  );
}
```

### Pattern 6: Cross-Column Drag Decompose (Base-Ten Blocks)
**What:** When a rod is dragged from the tens column into the ones column, it auto-decomposes into 10 cubes at the drop position. Detected by checking which column the snap target belongs to vs the block's origin column.
**When to use:** Base-ten blocks regrouping.

**Example:**
```typescript
// In base-ten blocks onSnap handler
function handleSnap(blockId: string, targetId: string) {
  const block = blocks.find(b => b.id === blockId);
  const targetColumn = getColumnFromTargetId(targetId);

  if (block?.type === 'rod' && targetColumn === 'ones') {
    // Cross-column decompose: rod -> 10 cubes
    decomposeRod(blockId, targetColumn);
  } else if (block?.type === 'flat' && targetColumn === 'tens') {
    // Cross-column decompose: flat -> 10 rods
    decomposeFlat(blockId, targetColumn);
  } else {
    // Normal placement
    moveBlock(blockId, targetColumn);
  }
}
```

### Anti-Patterns to Avoid
- **Storing manipulative state in Zustand:** State is ephemeral, component-local. Never persist blocks, counters, or marker positions to the store. Phase 18 adds session integration on top.
- **Rendering SVG in useAnimatedStyle:** SVG props (cx, cy, d, r) cannot be animated via useAnimatedStyle. Use `useAnimatedProps` with `Animated.createAnimatedComponent(SvgElement)` instead.
- **setTimeout in worklets:** setTimeout is NOT available in worklets. Use `withDelay` for animation timing. Use `scheduleOnRN` to call `setTimeout` on the RN thread if needed for non-animation delays.
- **Dynamically creating DraggableItems mid-gesture:** Adding/removing items while a drag is active causes SnapZone remeasurement and can leave stale targets. Defer state changes until gesture completes (use a pending queue).
- **Over-abstracting the 6 components:** Each manipulative has unique interaction patterns. Do NOT try to build a generic "manipulative renderer" that takes config. Build 6 focused components that share ManipulativeShell and Phase 16 primitives.
- **Animating path "d" attribute interpolation:** SVG path d-attribute string interpolation is expensive and complex. For hop arrows, render each arc as a separate Path component added to state when marker moves. Do NOT try to animate the d attribute.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG geometric primitives | Custom View-based line/circle/arc rendering | react-native-svg (Line, Circle, Path, Text) | SVG gives pixel-perfect positioning, arc paths, proper text anchoring; View-based math is error-prone |
| Number picker wheel | Custom scroll-based picker from scratch | FlatList with snapToInterval + getItemLayout | FlatList handles scroll physics, deceleration, momentum, accessibility. snapToInterval gives wheel behavior. No external dependency needed |
| Animated SVG props | Custom native module for SVG animation | Animated.createAnimatedComponent + useAnimatedProps | Reanimated 4 supports animating any native component prop; works with react-native-svg out of the box |
| Auto-group timer | Custom requestAnimationFrame loop | setTimeout (via scheduleOnRN) + withDelay for animations | The 500ms wait before grouping is a UI delay (not an animation), so setTimeout is appropriate. The actual merge animation uses withDelay/withSequence |
| Grid cell layout (ten frame) | Manual absolute positioning math | Flexbox row/column with fixed cell dimensions | Flexbox handles equal-width cells naturally; SnapZone measures itself via onLayout |

**Key insight:** The 6 manipulatives are more like 6 mini-apps than variations of one pattern. Each has unique interaction semantics (auto-group, snap-to-tick, tap-to-shade, free-placement, drag-dividers, preset-partition). Share the shell and primitives but do NOT over-abstract.

## Common Pitfalls

### Pitfall 1: Auto-Group Timer Leak
**What goes wrong:** Multiple auto-group timers fire simultaneously when user rapidly adds/removes cubes, causing duplicate rod creation.
**Why it happens:** setTimeout from checkAutoGroup stacks up if not cleared when cube count changes.
**How to avoid:** Store timer ref. Clear previous timer whenever cube count changes (in useEffect cleanup or before setting new timer). Only one timer active at a time.
**Warning signs:** Extra rods appear; cube count goes negative; blocks disappear.

### Pitfall 2: SVG Coordinate Space Mismatch
**What goes wrong:** DraggableItem marker position (screen coordinates via translateX/Y) does not align with SVG tick positions (SVG viewBox coordinates).
**Why it happens:** SVG viewBox defines its own coordinate system. DraggableItem operates in screen-space coordinates. Mixing them causes marker to appear offset from ticks.
**How to avoid:** Use the SVG container's onLayout to get its screen position and dimensions. Convert between SVG viewBox coordinates and screen coordinates using a linear mapping function. Or: skip viewBox and use pixel-based SVG coordinates that match the container's layout dimensions directly.
**Warning signs:** Marker snaps to correct tick logically but visually appears offset by 10-50px.

### Pitfall 3: SnapZone Remeasurement on Dynamic Layout
**What goes wrong:** Ten frame auto-spawns second frame; SnapZone positions for first frame shift but snap targets array has stale measurements.
**Why it happens:** Adding the second frame changes the layout, shifting the first frame up. SnapZones only remeasure on their own onLayout, which may not fire if only the parent's layout changes.
**How to avoid:** Add a `key` prop to the SnapZone container that changes when the number of frames changes, forcing remount and remeasurement. Or trigger manual remeasurement via a ref callback when frame count changes.
**Warning signs:** Counters snap to wrong cells after second frame appears; first-frame cells seem "shifted down" from the visual grid.

### Pitfall 4: 30-Object Cap with Auto-Group Interaction
**What goes wrong:** User has 28 objects, adds 3 more cubes (hitting cap), then auto-group fires reducing to 22 objects, but the cap message persists.
**Why it happens:** Cap enforcement checks total object count synchronously, but auto-group is asynchronous (500ms timer). The "Try grouping!" message shows at 30, then auto-group reduces count, but the message doesn't auto-dismiss.
**How to avoid:** Derive the cap message from current object count reactively (not from a one-shot event). When auto-group reduces count below MAX_OBJECTS, the message automatically disappears because the count-based condition is no longer met.
**Warning signs:** "Try grouping your cubes!" message stays visible after auto-group completes successfully.

### Pitfall 5: Performance with 30 Animated.View Instances
**What goes wrong:** Frame drops when 20+ DraggableItem instances each have their own useAnimatedStyle + useSharedValue pair.
**Why it happens:** Each DraggableItem creates 5 SharedValues (offsetX, offsetY, startX, startY, isDragging). At 30 items = 150 SharedValues + 30 useAnimatedStyle worklets running on every frame.
**How to avoid:** SharedValues in DraggableItem are local and only compute when their specific item is being dragged (isDragging gate). The useAnimatedStyle only re-evaluates when the item's own SharedValues change, not all 30. This is inherently efficient. DO NOT lift SharedValues to parent. Keep them per-component. The 30-object MAX_OBJECTS cap from Phase 16 ensures this stays within bounds.
**Warning signs:** Frame drops during drag when >20 items on screen. Profile with Reanimated FPS monitor.

### Pitfall 6: Bar Model Divider Precision for Young Children
**What goes wrong:** Children ages 6-9 cannot position dividers precisely enough to create the proportions they want.
**Why it happens:** Drag-to-resize requires fine motor precision that young children lack. Dividers snap to arbitrary positions.
**How to avoid:** Implement snap-to-percentage increments (e.g., snap to nearest 10% or nearest equal-section width). Make divider drag handles large (48dp minimum) and add visual guidelines. Provide preset equal-section buttons as an alternative to manual drag.
**Warning signs:** Children repeatedly try to make equal sections but end up with uneven bars.

### Pitfall 7: Fraction Strip Touch Target Size at High Denominators
**What goes wrong:** With denominator 8, each section may be narrower than 48dp on smaller devices.
**Why it happens:** Available width / 8 sections can result in sections < 48dp wide on phones.
**How to avoid:** Enforce minimum strip width based on denominator * 48dp. If screen is too narrow, use horizontal scrolling or reduce maximum denominator. The locked denominator set (2,3,4,6,8) was chosen to keep targets large enough, but verify on smallest supported device width (~320dp).
**Warning signs:** Tap events register on wrong section; children tap one section but adjacent section shades.

## Code Examples

### ManipulativeShell Complete Implementation
```typescript
// Source: Project pattern (CONTEXT.md locked decisions)
// src/components/manipulatives/ManipulativeShell.tsx

interface ManipulativeShellProps {
  count: number;
  countLabel?: string;
  onReset: () => void;
  renderCounter?: () => React.ReactNode;
  children: React.ReactNode;
  testID?: string;
}

// Layout: fixed header bar + flex workspace
// Header: [Reset Button] ............. [AnimatedCounter]
// Workspace: fills remaining space, children render here
```

### Base-Ten Block Visual Rendering
```typescript
// Source: CONTEXT.md locked decisions (all blue, size differentiates)
// Block sizes (relative to cube base unit)
const CUBE_SIZE = 36;  // ones cube: 36x36dp (>48dp with padding)
const ROD_WIDTH = CUBE_SIZE;
const ROD_HEIGHT = CUBE_SIZE * 3;  // visually distinct from cube
const FLAT_SIZE = CUBE_SIZE * 3;   // 108x108dp square

// All blocks share one color family (blue on dark theme)
const BLOCK_COLOR = '#5A7FFF';  // matches project primary palette
const BLOCK_BORDER = '#3D5FCC';

function CubeBlock() {
  return (
    <View style={{
      width: CUBE_SIZE,
      height: CUBE_SIZE,
      backgroundColor: BLOCK_COLOR,
      borderWidth: 1.5,
      borderColor: BLOCK_BORDER,
      borderRadius: 4,
    }} />
  );
}
```

### Number Line Hop Arrow Arc (SVG)
```typescript
// Source: react-native-svg docs + CONTEXT.md (cumulative trail)
// Quadratic Bezier curve creates a smooth arc above the number line

function HopArrow({ fromX, toX, lineY }: {
  fromX: number;
  toX: number;
  lineY: number;
}) {
  const midX = (fromX + toX) / 2;
  const arcHeight = Math.min(30, Math.abs(toX - fromX) * 0.4);
  const controlY = lineY - arcHeight;

  // Quadratic Bezier: M start Q control end
  const d = `M ${fromX} ${lineY} Q ${midX} ${controlY} ${toX} ${lineY}`;

  return (
    <>
      <Path
        d={d}
        stroke="#4ADE80"  // green for number line
        strokeWidth={2}
        fill="none"
      />
      {/* Arrowhead at end */}
      <Path
        d={`M ${toX - 4} ${lineY - 6} L ${toX} ${lineY} L ${toX - 4} ${lineY + 6}`}
        stroke="#4ADE80"
        strokeWidth={2}
        fill="none"
      />
      {/* +1 label above arc */}
      <SvgText
        x={midX}
        y={controlY - 4}
        fontSize={12}
        fill="#4ADE80"
        textAnchor="middle"
      >
        +1
      </SvgText>
    </>
  );
}
```

### Ten Frame Grid Layout
```typescript
// Source: CONTEXT.md locked decisions (top-left fill, 2x5 grid)
// Ten frame: 5 columns x 2 rows = 10 cells

const CELL_SIZE = 56;  // 48dp minimum + 8dp padding
const GRID_COLS = 5;
const GRID_ROWS = 2;

function TenFrameGrid({
  cells,
  onCellTap,
  snapTargets,
  onSnapZoneMeasured,
}: TenFrameGridProps) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: GRID_ROWS }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: GRID_COLS }, (_, col) => {
            const index = row * GRID_COLS + col;
            return (
              <SnapZone
                key={`cell-${index}`}
                id={`cell-${index}`}
                onMeasured={onSnapZoneMeasured}
                isOccupied={cells[index]}
                accessibilityLabel={`Cell ${index + 1}, ${cells[index] ? 'filled' : 'empty'}`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
```

### Counter Two-Color Flip
```typescript
// Source: CONTEXT.md (red/yellow, tap to flip, free placement)
type CounterColor = 'red' | 'yellow';

interface CounterState {
  id: string;
  color: CounterColor;
  x: number;
  y: number;
}

const COUNTER_COLORS: Record<CounterColor, string> = {
  red: '#EF4444',    // bright red on dark theme
  yellow: '#FACC15', // bright yellow on dark theme
};

function handleCounterTap(counterId: string) {
  setCounters(prev =>
    prev.map(c =>
      c.id === counterId
        ? { ...c, color: c.color === 'red' ? 'yellow' : 'red' }
        : c
    )
  );
  triggerSnapHaptic(); // Light haptic on flip
}

// Dual count display (custom renderCounter for ManipulativeShell)
const redCount = counters.filter(c => c.color === 'red').length;
const yellowCount = counters.filter(c => c.color === 'yellow').length;
```

### Fraction Strip Stacked Comparison
```typescript
// Source: CONTEXT.md (up to 3 strips, denominators 2,3,4,6,8)
const DENOMINATORS = [2, 3, 4, 6, 8] as const;

interface StripState {
  denominator: typeof DENOMINATORS[number];
  shaded: boolean[];
}

// Render stacked strips vertically for comparison
function renderStrips(strips: StripState[], stripWidth: number) {
  return strips.map((strip, i) => (
    <View key={i} style={styles.stripRow}>
      {Array.from({ length: strip.denominator }, (_, j) => {
        const sectionWidth = stripWidth / strip.denominator;
        return (
          <Pressable
            key={j}
            onPress={() => toggleSection(i, j)}
            style={[
              styles.section,
              {
                width: sectionWidth,
                backgroundColor: strip.shaded[j]
                  ? '#A855F7' // purple shaded (fraction strips color)
                  : 'rgba(168, 85, 247, 0.15)', // purple unshaded
                borderColor: '#7C3AED',
              },
            ]}
            accessibilityLabel={`${strip.shaded[j] ? 'Shaded' : 'Unshaded'} section ${j + 1} of ${strip.denominator}`}
          />
        );
      })}
      {/* Fraction label */}
      <Text style={styles.fractionLabel}>
        {strip.shaded.filter(Boolean).length}/{strip.denominator}
      </Text>
    </View>
  ));
}
```

## Color Palette Recommendations

Based on theme constraints (dark background #1a1a2e, high contrast) and CONTEXT.md per-type colors:

| Manipulative | Primary | Light/Fill | Border/Accent | Rationale |
|-------------|---------|------------|---------------|-----------|
| Base-ten blocks | #5A7FFF (blue) | rgba(90,127,255,0.2) | #3D5FCC | Matches project primary family; all blocks same color per decision |
| Number line | #4ADE80 (green) | rgba(74,222,128,0.15) | #22C55E | High contrast on dark; green=growth/progress |
| Ten frame | #FB923C (orange) | rgba(251,146,60,0.2) | #F97316 | Warm, distinct from blue blocks; cell grid visibility |
| Counters | #EF4444/#FACC15 (red/yellow) | N/A | #DC2626/#EAB308 | Classic classroom two-sided counters |
| Fraction strips | #A855F7 (purple) | rgba(168,85,247,0.15) | #7C3AED | Distinct from all other colors; shaded vs unshaded contrast |
| Bar model | #2DD4BF (teal) | rgba(45,212,191,0.15) | #14B8A6 | Complements purple; distinct from green number line |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single monolithic manipulative component | Split: Shell wrapper + focused component + types/layout helpers | Project convention | Keeps files under 500 lines; barrel exports for clean imports |
| SVG path d-attribute string interpolation animation | Static SVG paths added/removed via React state | N/A | Avoid animating d attribute; add/remove complete Path components instead |
| Native wheel picker for number input | FlatList with snapToInterval | Best practice for Expo apps | Full styling control, no native dependency, consistent cross-platform |
| Auto-group via animation timing callback | setTimeout delay + animation sequence + React state swap | Phase 17 design | Clean separation: delay=setTimeout, animation=withSequence, state=setState |

**Deprecated/outdated:**
- `useAnimatedGestureHandler` -- REMOVED in Reanimated 4. Continue using Gesture API callbacks (established in Phase 16).
- `runOnJS` -- REPLACED by `scheduleOnRN`. Phase 16 already uses correct API.
- `Animated.Value` from react-native core -- Use Reanimated SharedValues exclusively.

## Open Questions

1. **Number line 0-100 range with expandable sections**
   - What we know: 100 tick marks would be too dense on a phone screen. The CONTEXT.md says "tick marks at 10s with expandable sections."
   - What's unclear: The exact UX for "expanding" a section (tap a decade to zoom in? pinch? separate mode toggle?). Pinch-to-zoom is deferred (ADV-01).
   - Recommendation: For 0-100 range, show tick marks at multiples of 10 (0, 10, 20, ...100). Tap a decade section to expand and show individual ticks (e.g., tap between 30-40 shows 30,31,32...40). This is a simple toggle, not pinch-to-zoom. Keep the marker snap-to-tick behavior consistent across zoom levels.

2. **Bar model divider drag vs. preset equal sections**
   - What we know: Decision says "preset partition count (2, 3, 4 parts) then drag dividers to resize sections."
   - What's unclear: Whether the initial partition should be equal-width or whether dragging starts from a default configuration. Also unclear: can children add/remove partitions after initial setup?
   - Recommendation: Start with equal-width partitions for the selected count. Dividers can then be dragged to resize. Provide a "Reset to equal" button. Do NOT support adding/removing partitions after initial selection -- that would require complex divider insertion UX. Child selects partition count (2/3/4 preset buttons), gets equal sections, then optionally drags to resize.

3. **Counter maximum count**
   - What we know: MAX_OBJECTS is 30 (from Phase 16 animationConfig.ts). Counters use free placement (no grid).
   - What's unclear: Whether 30 free-floating counters on a phone screen would overlap excessively and become unusable.
   - Recommendation: Use MAX_OBJECTS (30) consistently. At 30 counters on a phone screen, each is ~36dp diameter, so they will overlap if not arranged. Add the same "Try grouping!" nudge at 30 counters. In practice, within-20 problems use at most 20 counters, and sandbox is exploratory.

## Sources

### Primary (HIGH confidence)
- Phase 16 existing code: `src/components/manipulatives/shared/` -- DraggableItem.tsx, SnapZone.tsx, AnimatedCounter.tsx, snapMath.ts, haptics.ts, animationConfig.ts, types.ts (read and analyzed)
- Phase 16 Research: `.planning/phases/16-shared-drag-primitives/16-RESEARCH.md` -- architecture patterns, pitfalls, testing strategy (read and analyzed)
- [Reanimated withDelay docs](https://docs.swmansion.com/react-native-reanimated/docs/animations/withDelay/) -- API: withDelay(delayMs, animation, reduceMotion?)
- [Reanimated withSequence docs](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/) -- API: withSequence(reduceMotion?, ...animations)
- [Reanimated Entering/Exiting animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) -- FadeIn, FadeOut, SlideIn with modifiers (.delay(), .duration(), .springify())
- [Reanimated animating styles and props](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/animating-styles-and-props/) -- useAnimatedProps for SVG elements with Animated.createAnimatedComponent
- [react-native-svg GitHub USAGE.md](https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md) -- Line, Circle, Path, Text component APIs
- [RNGH Gesture Composition](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/) -- Race, Simultaneous, Exclusive
- Project theme: `src/theme/index.ts` -- colors, spacing, typography, layout.minTouchTarget (48)
- Project research: `.planning/04-virtual-manipulatives.md` -- pedagogical research, interaction patterns

### Secondary (MEDIUM confidence)
- [Expo SVG docs](https://docs.expo.dev/versions/latest/sdk/svg/) -- react-native-svg compatibility with Expo SDK 54
- [Reanimated SVG animation guide](https://medium.com/tribalscale/intro-to-svg-animations-with-react-native-reanimated-2-78bd87438129) -- Pattern for Animated.createAnimatedComponent(Circle) with useAnimatedProps
- [FlatList snapToInterval docs](https://reactnative.dev/docs/flatlist) -- Number picker implementation pattern
- [Reanimated performance with many items (GitHub issue #5781)](https://github.com/software-mansion/react-native-reanimated/issues/5781) -- Performance with large arrays of shared values

### Tertiary (LOW confidence)
- None -- all critical findings verified against official docs or existing codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in Phase 16; no new dependencies
- Architecture: HIGH -- patterns build directly on Phase 16 primitives with verified APIs (withDelay, withSequence, useAnimatedProps, SVG components)
- Pitfalls: HIGH -- derived from Phase 16 research + analysis of specific Phase 17 choreography (auto-group, SVG coordinate space, dynamic layout remeasurement)
- Code examples: HIGH -- based on existing Phase 16 code patterns, official Reanimated/RNGH/SVG docs, and project conventions

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable libraries, no breaking changes expected)
