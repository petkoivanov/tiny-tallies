# Phase 20: Polish - Research

**Researched:** 2026-03-03
**Domain:** Manipulative UX enhancements (guided hints, undo, array grid, double ten frame)
**Confidence:** HIGH

## Summary

Phase 20 adds four distinct enhancements to the existing 6 virtual manipulatives: (1) guided mode with pulsing glow hints, (2) undo capability with reverse animations across all manipulatives, (3) counter array grid mode for multiplication, and (4) ten frame double-frame pre-spawning for add-within-20. All four features build on the existing ManipulativeShell, DraggableItem, and SnapZone infrastructure from Phases 16-17, the session integration from Phase 18, and the sandbox from Phase 19.

The core technical challenge is the undo system, which must work across 6 manipulatives with different state shapes (arrays of objects, boolean arrays, scalar positions, composite states). The research recommends a shared `useActionHistory` hook using state snapshots (not action replay) for simplicity, given the immutable spread-operator update pattern already used by all manipulatives. Guided mode requires a lookup table mapping (operation + manipulativeType) to step sequences, plus a pulsing animation overlay. Array grid mode and double ten frame are more contained changes to Counters and TenFrame respectively.

**Primary recommendation:** Build a shared `useActionHistory<T>` hook that captures state snapshots on each action, then layer guided mode, grid mode, and double frame as component-level changes. Extend ManipulativeShell props for undo/grid toggle buttons.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Guided mode activates only in concrete CPA mode (low mastery) during practice sessions -- not in sandbox, not in pictorial/abstract
- Visual indicator: pulsing glow animation on the next suggested target zone/item (soft green highlight pulse)
- Suggest only -- child can still interact freely with any part of the manipulative. No disabling, no restrictions
- If the child takes a different action than suggested, the hint just updates to reflect the new state
- Steps determined via pre-computed lookup table: problem type + manipulative type -> sequence of guided steps
- Matches the "no punitive mechanics" philosophy -- guidance, not enforcement
- Undo across all 6 manipulatives -- consistent behavior, no "why doesn't undo work here?" confusion
- Each manipulative tracks its own action history (max 10 steps)
- Auto-grouping in base-ten blocks counts as one undoable action -- undoing restores the 10 cubes from the rod
- Reverse animation on undo -- counter slides back to tray, rod decomposes back to cubes. Builds spatial understanding of what changed
- Undo button in ManipulativeShell header bar, next to the existing reset button (existing 56dp header)
- Uses existing spring animation configs for reverse animations
- Works in both session and sandbox contexts
- Toggle button in ManipulativeShell header -- 'Grid' / 'Free' toggle next to reset and undo buttons
- Counters animate from free positions to grid positions (and vice versa) on toggle
- Configurable rows x columns -- max 10x10
- In sandbox: row/column pickers (like BarModel's NumberPicker wheel pattern) to set grid dimensions
- In session: problem auto-configures grid dimensions from multiplication operands (e.g., 3x4 problem -> 3 rows, 4 columns)
- Available in both sandbox and session contexts
- Grid counters snap to intersections, showing multiplication as repeated addition visually
- Pre-spawn second frame for problems where answer > 10 (e.g., 7+6=13) -- both frames visible from start
- In sandbox: always show two frames from the start -- free exploration, no constraints
- New optional `initialFrames` prop on TenFrame component -- CpaSessionContent passes `initialFrames={2}` for >10 problems, sandbox passes `initialFrames={2}` always
- Default stays `initialFrames={1}` for backward compatibility
- Existing auto-spawn behavior (second frame on first full) remains as fallback

### Claude's Discretion
- Guided mode lookup table content -- specific step sequences per problem type + manipulative combination
- Glow animation styling (color intensity, pulse timing, opacity)
- Undo button icon choice (from lucide-react-native)
- Action history data structure (state snapshots vs action replay)
- Grid/Free toggle button visual design
- Row/column picker layout and positioning in array grid mode
- How existing counters animate between free and grid positions

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| POL-01 | User sees guided mode highlighting the next suggested action on a manipulative | Pulsing glow animation via withRepeat + withTiming on Reanimated shared values; lookup table maps problem+manipulative to step sequences; GuidedHighlight component wraps SnapZone/item targets |
| POL-02 | User can undo last action on a manipulative (max 10 steps) | Shared `useActionHistory<T>` hook with state snapshots; ManipulativeShell extended with onUndo prop and undo button; reverse animations via RETURN_SPRING_CONFIG |
| POL-03 | User can switch counters to array grid mode for multiplication concepts | Counters component extended with gridMode state; grid layout computes cell positions from rows x columns; NumberPicker reused for dimension selection in sandbox |
| POL-04 | Ten frame auto-spawns a second frame for add-within-20 problems | TenFrame extended with optional `initialFrames` prop; CpaSessionContent passes `initialFrames={2}` when problem.correctAnswer > 10; SandboxScreen passes `initialFrames={2}` for ten_frame type |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | 4.x | Pulsing glow animations, reverse undo animations, grid transition | Already used by all manipulatives; withRepeat + withTiming for pulse |
| react-native-gesture-handler | 2.x | Grid mode drag interactions | Already used by all manipulatives |
| react-native-worklets | 1.x | scheduleOnRN bridge for worklet->JS callbacks | Already used by Counters and DraggableItem |
| lucide-react-native | latest | Undo button icon, Grid/Free toggle icon | Project standard for icons (CLAUDE.md) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-haptics | SDK 54 | Undo feedback haptic | Already in haptics.ts; triggerSnapHaptic for undo |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| State snapshots for undo | Action replay (Command pattern) | Snapshots are simpler given existing immutable patterns; action replay better for complex transforms but overkill here |
| react-native-reanimated for glow | react-native-animated-glow (Skia) | Adds Skia dependency; Reanimated withRepeat already in stack and sufficient for opacity/scale pulse |

**Installation:**
```bash
# No new dependencies needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    manipulatives/
      shared/
        useActionHistory.ts        # NEW: Shared undo hook (state snapshots)
        GuidedHighlight.tsx         # NEW: Pulsing glow overlay component
        animationConfig.ts          # EXTEND: Add PULSE_CONFIG, UNDO_SPRING_CONFIG
        index.ts                    # EXTEND: Export new items
      ManipulativeShell.tsx         # EXTEND: Add undo button, grid toggle
      Counters/
        Counters.tsx                # EXTEND: Add grid mode, useActionHistory
        CountersTypes.ts            # EXTEND: Add grid-related types
        CountersGrid.tsx            # NEW: Grid layout sub-component
      TenFrame/
        TenFrame.tsx                # EXTEND: Add initialFrames prop, useActionHistory
        TenFrameTypes.ts            # EXTEND: Add initialFrames to props
      BaseTenBlocks/
        BaseTenBlocks.tsx           # EXTEND: Wire useActionHistory
      NumberLine/
        NumberLine.tsx              # EXTEND: Wire useActionHistory
      FractionStrips/
        FractionStrips.tsx          # EXTEND: Wire useActionHistory
      BarModel/
        BarModel.tsx                # EXTEND: Wire useActionHistory
  services/
    cpa/
      guidedSteps.ts               # NEW: Lookup table for guided mode step sequences
      guidedStepsTypes.ts           # NEW: Types for guided steps
```

### Pattern 1: State Snapshot Undo (useActionHistory)
**What:** A generic hook that records state snapshots and provides undo functionality.
**When to use:** Every manipulative component that needs undo capability.
**Why state snapshots over action replay:** All 6 manipulatives already use `useState` with immutable spread updates. State snapshots capture the complete state at each step, making undo trivial (pop and restore). Action replay would require encoding every action type across 6 different state shapes -- far more complex with no benefit since states are small.

**Example:**
```typescript
// Source: Custom pattern based on React state management best practices
interface ActionHistoryState<T> {
  history: T[];    // Past states (max 10)
  current: T;      // Current state
}

function useActionHistory<T>(initialState: T, maxSteps = 10) {
  const [state, setState] = useState<ActionHistoryState<T>>({
    history: [],
    current: initialState,
  });

  const pushState = useCallback((newState: T) => {
    setState((prev) => ({
      history: [...prev.history, prev.current].slice(-maxSteps),
      current: newState,
    }));
  }, [maxSteps]);

  const undo = useCallback((): T | null => {
    let restored: T | null = null;
    setState((prev) => {
      if (prev.history.length === 0) return prev;
      const newHistory = [...prev.history];
      restored = newHistory.pop()!;
      return { history: newHistory, current: restored };
    });
    return restored;
  }, []);

  const reset = useCallback((resetState: T) => {
    setState({ history: [], current: resetState });
  }, []);

  return {
    state: state.current,
    canUndo: state.history.length > 0,
    historyLength: state.history.length,
    pushState,
    undo,
    reset,
  };
}
```

**Integration pattern per manipulative:**
```typescript
// Before (Counters example):
const [counters, setCounters] = useState<CounterState[]>([]);

// After:
const { state: counters, pushState: pushCounters, undo, canUndo, reset } =
  useActionHistory<CounterState[]>([]);

// Every user action calls pushCounters instead of setCounters:
const handleFlip = useCallback((id: string) => {
  const next = counters.map((c) => c.id === id ? { ...c, color: c.color === 'red' ? 'yellow' : 'red' } : c);
  pushCounters(next);
}, [counters, pushCounters]);
```

### Pattern 2: Pulsing Glow Animation (GuidedHighlight)
**What:** A wrapper component that renders a pulsing glow effect around a target element.
**When to use:** During concrete CPA mode in practice sessions when guided mode is active.

**Example:**
```typescript
// Source: Reanimated withRepeat docs (https://docs.swmansion.com/react-native-reanimated/docs/animations/withRepeat/)
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const GUIDED_GLOW_COLOR = 'rgba(74, 222, 128, 0.4)'; // Soft green

function GuidedHighlight({ active, children }: { active: boolean; children: React.ReactNode }) {
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,  // Infinite repeat
        true, // Reverse (pulse in/out)
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [active, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: GUIDED_GLOW_COLOR,
    shadowOpacity: glowOpacity.value * 0.8,
    shadowRadius: 12,
    // Android shadow fallback via elevation + backgroundColor overlay
  }));

  return (
    <Animated.View style={[styles.container, active && glowStyle]}>
      {children}
    </Animated.View>
  );
}
```

### Pattern 3: Array Grid Layout (CountersGrid)
**What:** Computed grid positions for counters in array mode.
**When to use:** When Counters is toggled to grid mode.

**Example:**
```typescript
// Source: Standard grid layout computation
interface GridConfig {
  rows: number;
  cols: number;
  cellSize: number;
  originX: number;
  originY: number;
}

function computeGridPositions(config: GridConfig): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      positions.push({
        x: config.originX + col * config.cellSize,
        y: config.originY + row * config.cellSize,
      });
    }
  }
  return positions;
}
```

### Pattern 4: ManipulativeShell Header Extension
**What:** Extend the 56dp header bar with undo button and optional grid toggle.
**When to use:** All manipulative instances get undo; only Counters gets grid toggle.

**Example:**
```typescript
// Extended ManipulativeShell props
interface ManipulativeShellProps {
  count: number;
  countLabel?: string;
  onReset: () => void;
  onUndo?: () => void;        // NEW: Undo callback
  canUndo?: boolean;           // NEW: Enables/disables undo button
  onGridToggle?: () => void;   // NEW: Grid/Free toggle callback
  isGridMode?: boolean;        // NEW: Current grid mode state
  renderCounter?: () => React.ReactNode;
  children: React.ReactNode;
  testID?: string;
}
```

### Anti-Patterns to Avoid
- **Giant single undo hook with action type discrimination:** Each manipulative has a different state shape. Don't try to create one union type -- use the generic `useActionHistory<T>` with each component's own state type.
- **Blocking undo during auto-group:** Auto-group in BaseTenBlocks fires asynchronously. The undo snapshot should be captured BEFORE auto-group triggers, and undoing an auto-group should restore the pre-group state (10 cubes, not 1 rod).
- **Glow animation on JS thread:** Use Reanimated shared values and worklet-based animations for the glow pulse. The old RN `Animated.timing` pattern (used in SandboxTooltip) runs on JS thread and would jank during gesture interactions.
- **Grid snap zones recreating SnapZone array on every render:** Memoize grid snap target computation to avoid shared value thrashing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pulsing animation | Custom interval-based opacity toggle | `withRepeat(withTiming(...), -1, true)` from Reanimated | Runs on UI thread, handles lifecycle cleanup, respects reduceMotion |
| Undo state management | Per-component undo arrays | Shared `useActionHistory<T>` generic hook | Avoids duplicating the same pattern in 6 components |
| Grid cell positions | Manual absolute positioning math | Computed grid with `computeGridPositions` helper | Reusable, testable, avoids off-by-one layout bugs |
| Number picker for grid dimensions | Custom slider or text input | Reuse existing `NumberPicker` pattern from BarModel | Already proven UX for ages 6-9, consistent visual design |

**Key insight:** The project already has all the animation infrastructure (spring configs, haptics, DraggableItem, SnapZone). Phase 20 is about orchestrating existing primitives into new interaction patterns, not building new low-level infrastructure.

## Common Pitfalls

### Pitfall 1: Undo + Auto-Group Race Condition in BaseTenBlocks
**What goes wrong:** If undo is triggered while an auto-group timer is pending, the state can become inconsistent (undo restores 10 cubes, then auto-group fires and groups them again).
**Why it happens:** `useAutoGroup` has a timer-based delay (`AUTO_GROUP_DELAY = 500ms`). Undo could fire during this window.
**How to avoid:** Clear the auto-group timer on undo (call `clearTimer()` before restoring state). The `useAutoGroup` hook already exposes `clearTimer`.
**Warning signs:** Blocks disappearing after undo, or count flickering.

### Pitfall 2: Guided Mode Highlighting Stale Target After State Change
**What goes wrong:** The guided highlight points to a cell/zone that no longer exists (e.g., after the child placed a counter in a different cell, the ten frame cells shifted).
**Why it happens:** The guided step sequence is pre-computed but the manipulative state has changed.
**How to avoid:** Recompute the current step based on actual manipulative state, not just the step index. The lookup table should provide a function `(currentState, problem) => targetId | null` rather than a static sequence.
**Warning signs:** Green glow on an occupied cell, or glow on nothing.

### Pitfall 3: Grid Mode Counter Animations Causing Flash
**What goes wrong:** Toggling between free and grid mode causes all counters to briefly flash at position (0,0) before animating to their targets.
**Why it happens:** React state update changes counter positions immediately, but Reanimated animations haven't started yet.
**How to avoid:** Use `withSpring` on shared values for position transitions, not React state changes. Compute target positions, set them as animation targets, then update React state only after animation completes (via `runOnJS` callback).
**Warning signs:** Counters visible at top-left corner momentarily.

### Pitfall 4: ManipulativeShell Header Overflow on Small Screens
**What goes wrong:** Adding undo + grid toggle + reset + counter to the 56dp header creates overflow on narrow screens (< 320dp).
**Why it happens:** Three buttons + counter display compete for limited horizontal space.
**How to avoid:** Use compact icon-only buttons (24dp icons with 48dp touch targets via hitSlop). Undo button uses `Undo2` icon. Grid toggle uses `Grid3X3`/`Move` icons. Don't add text labels to header buttons.
**Warning signs:** Buttons overlapping or counter text truncated.

### Pitfall 5: TenFrame initialFrames Prop Not Resetting SnapTargets
**What goes wrong:** When initialFrames=2, the second frame's SnapZones aren't measured yet when the first counter is dragged.
**Why it happens:** SnapZone uses `measureInWindow` on layout, but the second frame may not have rendered by the time the user starts dragging.
**How to avoid:** Initialize cells array to `CELLS_PER_FRAME * initialFrames` length. The existing `onMeasured` pattern handles progressive measurement -- just ensure both frames render before enabling drag.
**Warning signs:** First drag snaps to first frame only even though second frame is visible.

### Pitfall 6: State Snapshot Memory for Complex Manipulatives
**What goes wrong:** BaseTenBlocks with 30 blocks has relatively large state objects. 10 snapshots could theoretically use significant memory.
**Why it happens:** Each snapshot is a full copy of the blocks array.
**How to avoid:** Not actually a problem in practice. 10 snapshots of 30 BlockState objects (id, type, column) is trivially small (< 10KB). No optimization needed.

## Code Examples

### Undo Button Icon (lucide-react-native)
```typescript
// Source: lucide-react-native docs / existing project patterns
import { Undo2 } from 'lucide-react-native';

// In ManipulativeShell header, next to RotateCcw (reset):
<Pressable
  onPress={onUndo}
  disabled={!canUndo}
  hitSlop={HIT_SLOP}
  accessibilityLabel="Undo last action"
  accessibilityRole="button"
  testID="undo-button"
  style={styles.undoButton}
>
  <Undo2
    size={ICON_SIZE}
    color={canUndo ? colors.textSecondary : colors.textMuted}
  />
</Pressable>
```

### Grid/Free Toggle Button
```typescript
// Source: lucide-react-native / existing project patterns
import { Grid3X3, Move } from 'lucide-react-native';

// In ManipulativeShell header (only shown when onGridToggle is provided):
{onGridToggle && (
  <Pressable
    onPress={onGridToggle}
    hitSlop={HIT_SLOP}
    accessibilityLabel={isGridMode ? 'Switch to free mode' : 'Switch to grid mode'}
    accessibilityRole="button"
    testID="grid-toggle-button"
    style={styles.gridToggleButton}
  >
    {isGridMode
      ? <Move size={ICON_SIZE} color={colors.textSecondary} />
      : <Grid3X3 size={ICON_SIZE} color={colors.textSecondary} />
    }
  </Pressable>
)}
```

### TenFrame initialFrames Prop Extension
```typescript
// Source: Existing TenFrame.tsx pattern
export interface TenFrameProps {
  initialFrames?: 1 | 2;  // NEW: Default 1 for backward compat
  testID?: string;
}

export function TenFrame({ initialFrames = 1, testID }: TenFrameProps) {
  const [cells, setCells] = useState<boolean[]>(
    () => new Array(CELLS_PER_FRAME * initialFrames).fill(false) as boolean[],
  );
  const [frameCount, setFrameCount] = useState(initialFrames);
  // ... rest unchanged, auto-spawn still works as fallback
}
```

### Guided Step Lookup Table Structure
```typescript
// Source: Custom design based on CONTEXT.md decisions
import type { Operation } from '@/services/mathEngine/types';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

/** A single guided step -- identifies which target to highlight. */
interface GuidedStep {
  /** Target ID pattern to highlight (e.g., 'cell-0', 'col-ones', 'add-counter-button') */
  targetId: string;
  /** Optional hint text (e.g., "Place the first counter here") */
  hintText?: string;
}

/** Maps a problem context to a sequence of guided steps. */
interface GuidedStepSequence {
  operation: Operation;
  manipulativeType: ManipulativeType;
  /** Function that computes the next step based on current state */
  getNextStep: (problemOperands: [number, number], currentCount: number) => GuidedStep | null;
}

// Example for TenFrame + addition:
const tenFrameAdditionGuide: GuidedStepSequence = {
  operation: 'addition',
  manipulativeType: 'ten_frame',
  getNextStep: (operands, currentCount) => {
    const [a, b] = operands;
    if (currentCount < a) {
      // Phase 1: Place first operand
      return { targetId: `cell-${currentCount}`, hintText: `Place ${a - currentCount} more` };
    }
    if (currentCount < a + b) {
      // Phase 2: Place second operand
      return { targetId: `cell-${currentCount}` };
    }
    return null; // Done
  },
};
```

### Counters Grid Mode State
```typescript
// Source: Custom design based on CONTEXT.md decisions
interface CountersGridState {
  mode: 'free' | 'grid';
  rows: number;    // 1-10
  cols: number;    // 1-10
}

// In Counters component:
const [gridState, setGridState] = useState<CountersGridState>({
  mode: 'free',
  rows: 3,
  cols: 4,
});

// When toggling to grid, animate each counter to its grid position:
const handleGridToggle = useCallback(() => {
  if (gridState.mode === 'free') {
    // Compute grid positions and animate counters to them
    const positions = computeGridPositions({
      rows: gridState.rows,
      cols: gridState.cols,
      cellSize: COUNTER_SIZE + spacing.sm,
      originX: spacing.md,
      originY: spacing.md,
    });
    // Animate each counter to its grid position using withSpring
    const updated = counters.map((c, i) => ({
      ...c,
      x: positions[i]?.x ?? c.x,
      y: positions[i]?.y ?? c.y,
    }));
    pushCounters(updated);
    setGridState((prev) => ({ ...prev, mode: 'grid' }));
  } else {
    setGridState((prev) => ({ ...prev, mode: 'free' }));
  }
}, [gridState, counters, pushCounters]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS thread Animated.timing for pulse | Reanimated withRepeat + withTiming on UI thread | Reanimated 2+ (2021) | 60fps pulse even during heavy JS work |
| Snapshot-based undo with class components | Hook-based generic `useActionHistory<T>` | React hooks (2019) | Clean integration with existing functional components |
| SandboxTooltip uses old Animated API | New components should use Reanimated | Project standard | GuidedHighlight should use Reanimated, not old Animated |

**Deprecated/outdated:**
- Old `Animated` API from React Native core: Still works but runs on JS thread. SandboxTooltip uses it for simple fade, which is fine, but the GuidedHighlight pulsing animation MUST use Reanimated for smooth interaction during gestures.

## Open Questions

1. **Guided mode step sequences -- how many combinations?**
   - What we know: 14 skills, 6 manipulative types, but only ~20 skill-manipulative pairings exist in `skillManipulativeMap.ts`. Addition and subtraction are the two operations.
   - What's unclear: The exact step-by-step guidance for each combination (e.g., "for subtraction with base-ten blocks, first decompose the rod, then remove cubes").
   - Recommendation: Start with the 5 most common pairings (counters+single-digit, ten-frame+within-20, base-ten-blocks+two-digit, number-line+within-20, bar-model as generic). The function-based approach (`getNextStep(operands, currentCount)`) means each guide is a small function, not a giant static table. Expand later as needed.

2. **Android shadow limitations for glow effect**
   - What we know: iOS supports `shadowColor/shadowOpacity/shadowRadius` natively. Android uses `elevation` which only supports gray shadows.
   - What's unclear: Whether the green glow will look good on Android.
   - Recommendation: Use a backgroundColor overlay approach on Android (a slightly larger View behind the target with the glow color and opacity animation). Conditional via `Platform.OS`. Alternatively, use a border color pulse which works identically on both platforms.

3. **Grid mode interaction with undo**
   - What we know: Toggling grid/free changes counter positions. This is a user action.
   - What's unclear: Should toggling grid/free be undoable?
   - Recommendation: Yes, treat it as an undoable action. Toggling to grid pushes the free-position state onto the history. Undoing restores counters to their free positions. This is consistent with "undo last action" semantics.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | `jest.config.js` (root) |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POL-01 | Guided highlight renders pulsing glow when active | unit | `npm test -- --testPathPattern=GuidedHighlight` | No -- Wave 0 |
| POL-01 | Guided step lookup returns correct target for problem | unit | `npm test -- --testPathPattern=guidedSteps` | No -- Wave 0 |
| POL-02 | useActionHistory tracks state and undoes correctly | unit | `npm test -- --testPathPattern=useActionHistory` | No -- Wave 0 |
| POL-02 | ManipulativeShell renders undo button when onUndo provided | unit | `npm test -- --testPathPattern=ManipulativeShell` | Yes (extend) |
| POL-02 | Undo button disabled when canUndo is false | unit | `npm test -- --testPathPattern=ManipulativeShell` | Yes (extend) |
| POL-03 | Counters grid mode computes correct positions | unit | `npm test -- --testPathPattern=CountersGrid` | No -- Wave 0 |
| POL-03 | Grid toggle animates counters to grid positions | unit | `npm test -- --testPathPattern=Counters` | No -- Wave 0 |
| POL-04 | TenFrame with initialFrames=2 renders two frames | unit | `npm test -- --testPathPattern=TenFrame` | No -- Wave 0 |
| POL-04 | TenFrame default initialFrames=1 for backward compat | unit | `npm test -- --testPathPattern=TenFrame` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<relevant_pattern>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + `npm run typecheck` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/manipulatives/useActionHistory.test.ts` -- covers POL-02 (undo hook logic)
- [ ] `src/__tests__/manipulatives/GuidedHighlight.test.tsx` -- covers POL-01 (guided highlight rendering)
- [ ] `src/__tests__/cpa/guidedSteps.test.ts` -- covers POL-01 (step lookup table)
- [ ] `src/__tests__/manipulatives/CountersGrid.test.tsx` -- covers POL-03 (grid computation + rendering)
- [ ] `src/__tests__/manipulatives/TenFrame.test.tsx` -- covers POL-04 (initialFrames prop)

*(Existing ManipulativeShell.test.tsx will be extended for undo button tests)*

## Sources

### Primary (HIGH confidence)
- Reanimated `withRepeat` docs: https://docs.swmansion.com/react-native-reanimated/docs/animations/withRepeat/ -- Verified API signature, -1 for infinite repeat, reverse parameter
- Existing codebase: ManipulativeShell.tsx (99 lines), all 6 manipulative components, animationConfig.ts, DraggableItem.tsx, SnapZone.tsx -- Direct code reading
- Existing codebase: CpaSessionContent.tsx, SandboxScreen.tsx -- Integration points verified
- Existing codebase: skillManipulativeMap.ts -- 14 skills mapped to manipulative preferences
- Existing codebase: Problem type (types.ts) -- operation, operands, correctAnswer fields available

### Secondary (MEDIUM confidence)
- lucide-react-native icons: `Undo2`, `Grid3X3`, `Move` -- Common lucide icons, already using lucide in project
- Android shadow limitations: Platform.OS conditional for glow effect -- Well-known React Native limitation

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- No new dependencies; all patterns use existing installed libraries
- Architecture: HIGH -- useActionHistory hook pattern is well-established; state snapshot approach validated against all 6 manipulative state shapes
- Pitfalls: HIGH -- All pitfalls derived from direct code reading of existing auto-group timing, SnapZone measurement, and animation patterns
- Guided mode lookup table: MEDIUM -- Step sequences are content design, not purely technical; structure is sound but specific step sequences need refinement during implementation

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable -- no external dependency changes expected)
