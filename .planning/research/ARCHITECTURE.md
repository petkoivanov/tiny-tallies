# Architecture Research

**Domain:** Virtual Manipulatives — React Native math app (v0.4 milestone)
**Researched:** 2026-03-03
**Confidence:** HIGH (all key claims verified against existing codebase + official docs)

---

## Standard Architecture

### System Overview

The v0.4 milestone grafts three new subsystems onto an existing v0.3 core. Integration is additive — existing session, skill, and store code is extended, not replaced.

```
┌─────────────────────────────────────────────────────────────────┐
│                       NAVIGATION LAYER                          │
│                                                                 │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌─────────────────┐  │
│  │  Home   │  │ Session  │  │ Results │  │ ManipExplore    │  │
│  │ Screen  │  │ Screen   │  │ Screen  │  │ (tab navigator) │  │
│  └────┬────┘  └────┬─────┘  └─────────┘  └────────┬────────┘  │
│       │            │  (NEW: manipulative panel)     │           │
│       │            ↓                                │           │
│       │    ┌───────────────┐    ┌───────────────────┤           │
│       │    │ManipulativePanel│  │  Sandbox screens  │           │
│       │    │(session-embed)│    │ (6 per manip type)│           │
│       │    └───────────────┘    └───────────────────┘           │
└───────┴─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       COMPONENT LAYER                           │
│                                                                 │
│  src/components/manipulatives/                                  │
│  ┌────────────┐ ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │BaseTenBlock│ │NumberLine │ │TenFrame  │ │FractionStrips  │  │
│  └────────────┘ └───────────┘ └──────────┘ └────────────────┘  │
│  ┌────────────┐ ┌───────────┐                                   │
│  │  Counters  │ │ BarModel  │                                   │
│  └────────────┘ └───────────┘                                   │
│                                                                 │
│  Shared primitives: DraggableItem, SnapZone, AnimatedCounter   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│                                                                 │
│  src/services/manipulatives/                                    │
│  ┌──────────────────┐  ┌───────────────────┐                   │
│  │ cpaMappingService│  │ manipulativeSelect │                   │
│  │ (skill→CPA level)│  │ (session linking)  │                   │
│  └──────────────────┘  └───────────────────┘                   │
│                                                                 │
│  src/services/adaptive/ (EXISTING — extended only)             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ bktCalculator | eloCalculator | leitnerCalculator | ...  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        STATE LAYER                              │
│                                                                 │
│  ┌──────────────────┐  ┌────────────────────────────────────┐  │
│  │ manipSlice (NEW) │  │ skillStatesSlice (EXTENDED)        │  │
│  │ sandboxHistory   │  │ + cpaLevel per skill               │  │
│  │ preferredManip   │  │ + preferredManipulative per skill  │  │
│  └──────────────────┘  └────────────────────────────────────┘  │
│                                                                 │
│  STORE_VERSION = 5 (bump from 4 with migration function)       │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation Notes |
|-----------|---------------|----------------------|
| `ManipulativePanel` | Session-embedded visual aid overlay | Modal/bottom-sheet over SessionScreen |
| `BaseTenBlocks` | Place value with drag-and-drop cubes/rods | Gesture.Pan + SharedValue snap-to-column |
| `NumberLine` | Hop arrows on SVG line, adjustable range | react-native-svg Line + Reanimated marker |
| `TenFrame` | 2×5 grid with counter drops, fill-to-10 | View grid + DraggableItem → SnapZone |
| `Counters` | Drag tokens into grouping circles | Gesture.Pan + group boundary detection |
| `FractionStrips` | Horizontal bars shaded by tap, stack compare | react-native-svg Rect + tap toggle state |
| `BarModel` | Resizable bars for word problems | Gesture.Pan on resize handle + label tap |
| `DraggableItem` | Reusable draggable primitive | Gesture.Pan, useSharedValue, useAnimatedStyle |
| `SnapZone` | Drop target that triggers spring-snap | onDrop callback + Reanimated withSpring |
| `AnimatedCounter` | Live count display | useSharedValue + withTiming number roll |
| `SandboxScreen` | Per-manipulative free-play screen | Full-screen, no session context |
| `ManipExploreNavigator` | Tab/stack navigator for 6 sandbox screens | New navigator registered in AppNavigator |
| `cpaMappingService` | Maps skillId → which manipulative, which CPA level | Pure function, no store access |
| `manipulativeSelector` | Returns manipulative config for current session problem | Reads skillStates.cpaLevel |

---

## Recommended Project Structure

```
src/
├── components/
│   ├── animations/          # EXISTING
│   │   └── AnswerFeedbackAnimation.tsx
│   └── manipulatives/       # NEW — all manipulative components
│       ├── shared/
│       │   ├── DraggableItem.tsx        # primitive: pan + snap
│       │   ├── SnapZone.tsx             # drop target
│       │   ├── AnimatedCounter.tsx      # live count display
│       │   └── index.ts
│       ├── BaseTenBlocks/
│       │   ├── BaseTenBlocks.tsx        # orchestrator
│       │   ├── PlaceValueColumn.tsx     # ones/tens/hundreds col
│       │   ├── UnitCube.tsx             # draggable 1-cube
│       │   ├── TenRod.tsx               # draggable rod (10)
│       │   ├── HundredFlat.tsx          # draggable flat (100)
│       │   └── index.ts
│       ├── NumberLine/
│       │   ├── NumberLine.tsx
│       │   ├── HopArrow.tsx             # animated SVG arrow
│       │   └── index.ts
│       ├── TenFrame/
│       │   ├── TenFrame.tsx
│       │   ├── TenFrameCell.tsx         # individual cell + drop zone
│       │   └── index.ts
│       ├── Counters/
│       │   ├── Counters.tsx
│       │   ├── CounterToken.tsx         # draggable colored token
│       │   ├── GroupingCircle.tsx       # drop zone circle
│       │   └── index.ts
│       ├── FractionStrips/
│       │   ├── FractionStrips.tsx
│       │   ├── FractionBar.tsx          # single shaded bar
│       │   └── index.ts
│       ├── BarModel/
│       │   ├── BarModel.tsx
│       │   ├── ResizableBar.tsx         # drag-to-resize
│       │   └── index.ts
│       └── index.ts                     # barrel: all 6 manipulatives
│
├── screens/
│   ├── HomeScreen.tsx        # EXISTING
│   ├── SessionScreen.tsx     # MODIFIED — adds ManipulativePanel
│   ├── ResultsScreen.tsx     # EXISTING (no change)
│   └── sandbox/             # NEW — 6 standalone screens
│       ├── ManipExploreLandingScreen.tsx
│       ├── BaseTenSandboxScreen.tsx
│       ├── NumberLineSandboxScreen.tsx
│       ├── TenFrameSandboxScreen.tsx
│       ├── CountersSandboxScreen.tsx
│       ├── FractionStripsSandboxScreen.tsx
│       ├── BarModelSandboxScreen.tsx
│       └── index.ts
│
├── navigation/
│   ├── AppNavigator.tsx      # MODIFIED — adds ManipExplore route
│   ├── ManipExploreNavigator.tsx  # NEW — stack or tabs for sandbox
│   └── types.ts              # MODIFIED — add sandbox route params
│
├── hooks/
│   ├── useSession.ts         # EXISTING (minimal touch)
│   └── useManipulative.ts    # NEW — manipulative state + config for session
│
├── services/
│   ├── adaptive/             # EXISTING (no changes)
│   ├── mathEngine/           # EXISTING (no changes)
│   ├── session/              # EXISTING (minor extension)
│   │   └── sessionTypes.ts   # MODIFIED — add ManipulativeHint to SessionProblem
│   └── manipulatives/        # NEW
│       ├── cpaMappingService.ts   # skill → CPA level logic
│       ├── manipulativeSelector.ts # picks which manip to show
│       ├── skillManipMap.ts        # static mapping table
│       └── index.ts
│
└── store/
    ├── appStore.ts           # MODIFIED — add manipSlice, bump STORE_VERSION=5
    ├── migrations.ts         # MODIFIED — add v4→v5 migration
    └── slices/
        ├── skillStatesSlice.ts    # MODIFIED — add cpaLevel field
        ├── manipSlice.ts          # NEW — sandbox history, preferences
        └── ... (existing slices unchanged)
```

### Structure Rationale

- **`components/manipulatives/`:** Each manipulative is a self-contained folder (orchestrator + sub-components + barrel). This enforces the 500-line file limit without creating shallow module sprawl. Shared DraggableItem and SnapZone primitives prevent gesture code duplication across 6 manipulatives.
- **`screens/sandbox/`:** Isolated from the main session flow. No session state access — purely ManipSlice + child profile. Keeps SessionScreen clean.
- **`services/manipulatives/`:** Follows existing pattern — services contain pure domain logic with no React dependencies. `cpaMappingService` is a pure function so it's fully testable without mocks.
- **`store/slices/manipSlice.ts`:** New slice for manipulative-specific persisted state (sandbox visit history, user's preferred manipulative per skill). Kept separate from skillStatesSlice to honor single-responsibility.

---

## Architectural Patterns

### Pattern 1: Gesture + SharedValue Drag-and-Snap

**What:** Each draggable object has an `(x, y)` SharedValue pair updated by a `Gesture.Pan()` handler. On gesture end, a snap function finds the nearest valid SnapZone and animates with `withSpring` on the UI thread.

**When to use:** BaseTenBlocks (cubes → column), TenFrame (counter → cell), Counters (token → group).

**Trade-offs:** All gesture callbacks are automatically workletized by Gesture Handler 2 + Reanimated 4. The `scheduleOnRN` (formerly `runOnJS`) call to update React state for count tracking adds one frame of latency — acceptable for non-animation state updates.

**Example:**
```typescript
// src/components/manipulatives/shared/DraggableItem.tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  scheduleOnRN,  // Reanimated 4 — replaces runOnJS
} from 'react-native-reanimated';

interface DraggableItemProps {
  snapTargets: SnapTarget[];          // computed from SnapZone layout
  onSnap: (targetId: string) => void; // runs on RN thread (scheduleOnRN)
}

function findNearestSnap(x: number, y: number, targets: SnapTarget[]): SnapTarget | null {
  'worklet';
  let nearest: SnapTarget | null = null;
  let minDist = 60; // px threshold
  for (const t of targets) {
    const d = Math.sqrt((x - t.cx) ** 2 + (y - t.cy) ** 2);
    if (d < minDist) { minDist = d; nearest = t; }
  }
  return nearest;
}

export function DraggableItem({ snapTargets, onSnap, children }: DraggableItemProps) {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const notify = scheduleOnRN(onSnap);  // Reanimated 4 API

  const gesture = Gesture.Pan()
    .onStart(() => {
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    })
    .onUpdate((e) => {
      offsetX.value = startX.value + e.translationX;
      offsetY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      const target = findNearestSnap(offsetX.value, offsetY.value, snapTargets);
      if (target) {
        offsetX.value = withSpring(target.cx, { damping: 15, stiffness: 200 });
        offsetY.value = withSpring(target.cy, { damping: 15, stiffness: 200 });
        notify(target.id);
      } else {
        // Snap back to origin
        offsetX.value = withSpring(0);
        offsetY.value = withSpring(0);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animStyle}>{children}</Animated.View>
    </GestureDetector>
  );
}
```

### Pattern 2: SVG-Based Static Manipulatives

**What:** Manipulatives that are primarily visual (NumberLine, FractionStrips) use `react-native-svg` for the base shape. Interaction points (tick-tap, segment-shade) overlay transparent Pressable areas over the SVG.

**When to use:** NumberLine (complex tick/hop rendering), FractionStrips (bar segments), BarModel (bracket/label lines).

**Trade-offs:** SVG renders well for static + infrequently-updated shapes. For the animated hop arrow on NumberLine, combine SVG Path with Reanimated `useAnimatedProps` — this keeps the animation on the UI thread without re-rendering the full SVG. Avoid driving many SVG children via animated props simultaneously (cap at ~20 animated SVG nodes).

**Example:**
```typescript
// Animated SVG hop arrow (NumberLine)
import { Path } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

function HopArrow({ fromX, toX, y }: HopArrowProps) {
  const progress = useSharedValue(0);

  // Trigger animation on fromX/toX change
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 400 });
  }, [fromX, toX, progress]);

  const animatedProps = useAnimatedProps(() => {
    const midX = fromX + (toX - fromX) * 0.5;
    const arcY = y - 30 * progress.value;  // arc height animates up
    return { d: `M${fromX},${y} Q${midX},${arcY} ${toX},${y}` };
  });

  return <AnimatedPath animatedProps={animatedProps} stroke="#6366f1" strokeWidth={2} fill="none" />;
}
```

### Pattern 3: CPA Level Tracked Per Skill in SkillStatesSlice

**What:** Each skill stores a `cpaLevel: 'concrete' | 'pictorial' | 'abstract'` field in `skillStates`. The CPA mapping service reads BKT `masteryProbability` and determines when to auto-advance from concrete → pictorial → abstract. The level is written to the store at session commit time (commit-on-complete pattern, same as Elo/BKT).

**When to use:** This is the primary mechanism for the CPA progression requirement. Never compute the CPA advance in UI components — keep it in `cpaMappingService`.

**Trade-offs:** Storing CPA level per skill (not per manipulative) keeps the model aligned with existing BKT-per-skill architecture. If a child masters addition but struggles with subtraction, they correctly see concrete for subtraction and abstract for addition.

**Example:**
```typescript
// src/services/manipulatives/cpaMappingService.ts
export type CpaLevel = 'concrete' | 'pictorial' | 'abstract';

/** BKT thresholds for CPA auto-advance (based on TEACH mode in AI tutoring research) */
const CPA_THRESHOLDS = {
  concreteToPicktorial: 0.60, // 3 consecutive correct at concrete → move to pictorial
  pictorialToAbstract: 0.85,  // approaching mastery → abstract
} as const;

export function computeCpaLevel(masteryProbability: number, currentLevel: CpaLevel): CpaLevel {
  if (currentLevel === 'concrete' && masteryProbability >= CPA_THRESHOLDS.concreteToPicktorial) {
    return 'pictorial';
  }
  if (currentLevel === 'pictorial' && masteryProbability >= CPA_THRESHOLDS.pictorialToAbstract) {
    return 'abstract';
  }
  return currentLevel;
}

// Maps skillId to which manipulative types are appropriate
export const SKILL_MANIPULATIVE_MAP: Record<string, ManipulativeType[]> = {
  'addition.single-digit.no-carry': ['counters', 'ten_frame', 'number_line'],
  'addition.within-20.no-carry':    ['ten_frame', 'number_line'],
  'addition.within-20.with-carry':  ['ten_frame', 'base_ten_blocks'],
  'addition.two-digit.no-carry':    ['base_ten_blocks', 'number_line'],
  'addition.two-digit.with-carry':  ['base_ten_blocks'],
  'addition.three-digit.no-carry':  ['base_ten_blocks'],
  'addition.three-digit.with-carry':['base_ten_blocks'],
  'subtraction.single-digit.no-borrow': ['counters', 'number_line'],
  'subtraction.within-20.no-borrow':    ['counters', 'number_line'],
  'subtraction.within-20.with-borrow':  ['ten_frame', 'number_line'],
  'subtraction.two-digit.no-borrow':    ['base_ten_blocks', 'number_line'],
  'subtraction.two-digit.with-borrow':  ['base_ten_blocks'],
  'subtraction.three-digit.no-borrow':  ['base_ten_blocks'],
  'subtraction.three-digit.with-borrow':['base_ten_blocks'],
  // Fraction strips + bar model used for future fractions skills
};
```

### Pattern 4: ManipulativePanel as Optional Session Overlay

**What:** `ManipulativePanel` is a collapsible panel rendered inside `SessionScreen` (not a modal navigator). It shows the contextually selected manipulative for the current problem. The panel is dismissible — child can hide it and work abstractly, or expand it to use manipulatives.

**When to use:** CPA level is `concrete` or `pictorial` and a manipulative mapping exists for the current skill.

**Trade-offs:** Implementing as an in-screen panel (not a `Modal`) avoids gesture conflicts with React Navigation. The panel uses a Reanimated `withSpring` height animation. Render only when `cpaLevel !== 'abstract'` — at abstract level, the panel is hidden entirely.

```typescript
// SessionScreen.tsx integration sketch
const { cpaLevel, manipulativeType, manipulativeConfig } = useManipulative(currentProblem?.skillId);

return (
  <View style={styles.container}>
    {/* existing problem display */}
    {cpaLevel !== 'abstract' && manipulativeType && (
      <ManipulativePanel
        type={manipulativeType}
        config={manipulativeConfig}
        cpaLevel={cpaLevel}
      />
    )}
    {/* existing answer options */}
  </View>
);
```

---

## Data Flow

### CPA Level Determination Flow

```
Problem loaded (skillId known)
    ↓
useManipulative(skillId)
    ↓ reads
skillStates[skillId].cpaLevel (persisted per skill)
    ↓ reads
skillStates[skillId].masteryProbability
    ↓ passed to
cpaMappingService.computeCpaLevel(masteryProbability, currentCpaLevel)
    ↓ returns
CpaLevel ('concrete' | 'pictorial' | 'abstract')
    ↓ drives
ManipulativePanel visibility + which manipulative to render
    ↓
On session complete (commit-on-complete):
    cpaMappingService.computeCpaLevel() re-evaluated
    New cpaLevel written to skillStates via updateSkillState()
```

### Drag-Drop Data Flow (session-embedded)

```
Child drags DraggableItem
    ↓ (UI thread — Gesture.Pan.onUpdate)
offsetX.value, offsetY.value update → useAnimatedStyle re-renders
    ↓ (UI thread — Gesture.Pan.onEnd)
findNearestSnap() worklet → SnapZone found
offsetX/Y snap via withSpring
    ↓ (RN thread — scheduleOnRN callback)
Parent component state update (count display)
    ↓
AnimatedCounter re-renders with new count
```

### Session Problem → Manipulative Config Flow

```
SessionProblem.skillId
    ↓
SKILL_MANIPULATIVE_MAP[skillId][0]  // primary manipulative
    ↓
ManipulativeConfig { targetValue: problem.correctAnswer, range: [...], ... }
    ↓
ManipulativePanel receives config as prop
    ↓
Specific manipulative component (BaseTenBlocks etc.) renders with config
```

### Store Data Flow (CPA state write)

```
Session commit (commitSessionResults called)
    ↓ existing: Elo, BKT, Leitner written to store
    ↓ NEW: for each skillId in pendingUpdates:
computeCpaLevel(newMasteryPL, currentCpaLevel) → newCpaLevel
updateSkillState(skillId, { cpaLevel: newCpaLevel })
    ↓
Zustand persist writes cpaLevel to AsyncStorage (via partialize)
    ↓ next session:
SessionScreen reads cpaLevel from store → correct CPA level shown
```

---

## New vs. Modified Components

### New Files (create from scratch)

| File | Type | Purpose |
|------|------|---------|
| `src/components/manipulatives/shared/DraggableItem.tsx` | Component | Reusable drag primitive |
| `src/components/manipulatives/shared/SnapZone.tsx` | Component | Drop target |
| `src/components/manipulatives/shared/AnimatedCounter.tsx` | Component | Live count display |
| `src/components/manipulatives/BaseTenBlocks/` (5 files) | Components | Place value manipulative |
| `src/components/manipulatives/NumberLine/` (2 files) | Components | Number line with hops |
| `src/components/manipulatives/TenFrame/` (2 files) | Components | Ten frame grid |
| `src/components/manipulatives/Counters/` (3 files) | Components | Token grouping |
| `src/components/manipulatives/FractionStrips/` (2 files) | Components | Fraction bar visual |
| `src/components/manipulatives/BarModel/` (2 files) | Components | Singapore bar model |
| `src/components/manipulatives/ManipulativePanel.tsx` | Component | Session overlay wrapper |
| `src/screens/sandbox/` (8 files) | Screens | Free-play sandbox screens |
| `src/navigation/ManipExploreNavigator.tsx` | Navigator | Sandbox screen navigator |
| `src/services/manipulatives/cpaMappingService.ts` | Service | CPA level logic |
| `src/services/manipulatives/manipulativeSelector.ts` | Service | Pick manip for problem |
| `src/services/manipulatives/skillManipMap.ts` | Service | Static skill→manip table |
| `src/store/slices/manipSlice.ts` | Store slice | Sandbox state |
| `src/hooks/useManipulative.ts` | Hook | Manipulative config for session |

### Modified Files (extend existing)

| File | Change | Impact |
|------|--------|--------|
| `src/store/slices/skillStatesSlice.ts` | Add `cpaLevel: CpaLevel` field to `SkillState` | STORE_VERSION bump required |
| `src/store/appStore.ts` | Add `manipSlice`, bump `STORE_VERSION` to 5 | Requires migration function |
| `src/store/migrations.ts` | Add v4→v5 migration: set `cpaLevel: 'concrete'` for all existing skills | Required |
| `src/store/appStore.ts` partialize | Add `manipSlice` persisted fields + `skillStates.cpaLevel` | Auto-included via skillStates |
| `src/navigation/AppNavigator.tsx` | Register `ManipExplore` stack | Non-breaking addition |
| `src/navigation/types.ts` | Add `ManipExplore`, `SandboxScreen` to `RootStackParamList` | Non-breaking addition |
| `src/screens/SessionScreen.tsx` | Add `<ManipulativePanel>` conditional render | Additive, existing layout untouched |
| `src/services/session/sessionOrchestrator.ts` | Pass manipulative hint metadata to SessionProblem (optional field) | Backward-compatible |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 6 manipulatives (v0.4) | Current plan — all statically configured, no dynamic loading needed |
| 12+ manipulatives (future) | Extract manipulative registry with lazy loading via dynamic import |
| 30+ draggable items | Existing planning doc caps at 30 — beyond this use grouping UI not individual drag targets |

### Scaling Priorities

1. **First bottleneck: UI thread frame drops** — More than ~20 simultaneous animated Reanimated values on screen at once can drop below 60fps. BaseTenBlocks with many individual cubes is the risk. Mitigation: auto-group 10 cubes into a rod before rendering 10 separate animated components.
2. **Second bottleneck: AsyncStorage write frequency** — CPA level changes write through Zustand persist on each session commit. This is bounded by session frequency, not a problem.

---

## Anti-Patterns

### Anti-Pattern 1: Gesture State in Zustand Store

**What people do:** Store `draggablePosition` or `isDragging` in Zustand for each manipulative element.

**Why it's wrong:** Zustand state causes React re-renders. Drag position must update at 60fps — React re-renders at that frequency will drop frames. Reanimated SharedValues operate on the UI thread specifically to avoid this.

**Do this instead:** Drag position lives exclusively in `useSharedValue`. Only the snapped-to destination (a meaningful semantic state like "3 cubes in the ones column") gets notified to the React thread via `scheduleOnRN`.

### Anti-Pattern 2: Computing CPA Level in SessionScreen

**What people do:** Write `if (masteryProbability > 0.6) showConcrete else showAbstract` inline in the screen component.

**Why it's wrong:** The CPA threshold logic is domain logic, not presentation logic. Inline thresholds scatter the rule across files and make it impossible to test without rendering a screen.

**Do this instead:** Put all CPA level computation in `cpaMappingService.ts`. SessionScreen calls `useManipulative()` which calls the service. The service is testable as a pure function.

### Anti-Pattern 3: Running Gesture Callbacks on RN Thread

**What people do:** Use `runOnJS` (Reanimated 3) or call `scheduleOnRN` (Reanimated 4) inside `onUpdate` (called 60 times/second).

**Why it's wrong:** Every `scheduleOnRN` call crosses the JS bridge per frame, causing jank. `onUpdate` is called continuously during drag — only `onEnd` should trigger state updates.

**Do this instead:** Do all position math in worklets inside `onUpdate`. Call `scheduleOnRN` only in `onEnd` (once per drag) to report the semantic result (which snap zone was hit, new count).

### Anti-Pattern 4: Modifying SkillState Schema Without Migration

**What people do:** Add `cpaLevel` to `SkillState` type but forget to bump `STORE_VERSION` and add a migration function.

**Why it's wrong:** Existing users' persisted state won't have `cpaLevel`. Without migration, the field is `undefined`. TypeScript strict mode with `as` casts will hide this at compile time but cause runtime bugs.

**Do this instead:** Follow the existing CLAUDE.md guardrail — bump `STORE_VERSION` to 5 and add this to `migrations.ts`:
```typescript
if (version < 5) {
  const skillStates = (state.skillStates ?? {}) as Record<string, Record<string, unknown>>;
  for (const skillId of Object.keys(skillStates)) {
    skillStates[skillId].cpaLevel ??= 'concrete';
  }
  // manipSlice defaults
  state.sandboxHistory ??= {};
  state.preferredManipulative ??= {};
}
```

### Anti-Pattern 5: Sandbox Screens Accessing Session Store

**What people do:** Sandbox screen reads `sessionAnswers` or `currentProblemIndex` from store to show "related" problems.

**Why it's wrong:** Sandbox is intentionally decoupled from session. Session data is ephemeral and unreliable outside `useSession`. Cross-slice coupling makes testing harder.

**Do this instead:** Sandbox screens read only `manipSlice` state + `childProfile` (for age-appropriate range defaults). They have no knowledge of ongoing sessions.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| SessionScreen ↔ ManipulativePanel | Props: `type`, `config`, `cpaLevel` | Panel is a dumb component — no store access |
| useManipulative ↔ cpaMappingService | Direct function call | Hook is the only consumer |
| useManipulative ↔ skillStatesSlice | `useAppStore` selector | Reads `cpaLevel`, `masteryProbability` |
| commitSessionResults ↔ cpaMappingService | Called inside commit function | CPA advance written at same time as Elo/BKT |
| SandboxScreens ↔ manipSlice | `useAppStore` actions | Records sandbox visits, preferred manipulative |
| ManipExploreNavigator ↔ AppNavigator | Nested navigator, registered as `ManipExplore` screen | HomeScreen navigates to ManipExplore |
| BaseTenBlocks ↔ DraggableItem | Props: `snapTargets`, `onSnap` | Clean primitive-orchestrator boundary |
| NumberLine ↔ react-native-svg | Direct SVG element composition | No wrapper library needed |

### External Library Boundaries

| Library | Version | Usage | Integration Notes |
|---------|---------|-------|-------------------|
| `react-native-gesture-handler` | ~2.28.0 (installed) | All drag interactions | Use `Gesture.Pan()` Gesture API — NOT old `PanGestureHandler` component API |
| `react-native-reanimated` | ~4.1.1 (installed) | All animations, SharedValues | New Architecture confirmed enabled (`newArchEnabled: true`). Use `scheduleOnRN` not `runOnJS` |
| `react-native-svg` | 15.12.1 (installed) | NumberLine, FractionStrips, BarModel lines | Already installed. Use `Animated.createAnimatedComponent(Path)` for animated paths |
| `expo-haptics` | ~15.0.7 (installed) | Snap feedback on successful drops | `Haptics.impactAsync('light')` in `scheduleOnRN` callback on snap |
| `react-native-worklets` | ^0.7.4 (installed) | Required peer for Reanimated 4 | Already installed — confirms Reanimated 4 worklet architecture active |
| `zustand` | ^5.0.8 (installed) | manipSlice + skillStatesSlice extension | Follow existing `StateCreator<AppState, [], [], SliceName>` pattern |

---

## Build Order

The following order minimizes blocked work and respects dependencies:

**Phase 1 — Foundation (blocks nothing, can be done in parallel)**
1. Add `cpaLevel: CpaLevel` to `SkillState` + bump `STORE_VERSION=5` + write migration (v4→v5) — this unblocks all CPA-aware code
2. Create `manipSlice.ts` with `sandboxHistory` and `preferredManipulative` — unblocks sandbox screens
3. Create `src/services/manipulatives/` — `skillManipMap.ts`, `cpaMappingService.ts`, `manipulativeSelector.ts` — pure functions, testable immediately

**Phase 2 — Shared Primitives (required before any manipulative component)**
4. Build `DraggableItem.tsx` — Gesture.Pan + SharedValue + scheduleOnRN + snap logic
5. Build `SnapZone.tsx` — layout measurement + onDrop boundary
6. Build `AnimatedCounter.tsx` — SharedValue + withTiming number display

**Phase 3 — Manipulative Components (can be parallelized after Phase 2)**
7. `TenFrame` — simplest: View grid + DraggableItem + SnapZone. Validates the primitive pattern before complex manipulatives
8. `Counters` — builds on DraggableItem, adds grouping circle boundary logic
9. `BaseTenBlocks` — most complex: 3 piece types, place-value columns, auto-group 10→rod
10. `NumberLine` — SVG-based, different pattern from drag primitives
11. `FractionStrips` — SVG-based with tap-toggle shading
12. `BarModel` — resizable bar with label overlay

**Phase 4 — Integration**
13. `ManipulativePanel` — wrapper + collapse/expand animation
14. `useManipulative` hook — reads store, calls cpaMappingService
15. `SessionScreen` modification — add ManipulativePanel conditional render
16. `commitSessionResults` extension — add CPA level advance in commit

**Phase 5 — Navigation + Sandbox**
17. `ManipExploreNavigator.tsx` + 6 `SandboxScreen` files
18. Register in `AppNavigator.tsx` + extend `navigation/types.ts`
19. Add "Explore" entry point in HomeScreen

**Rationale for this order:** Store schema changes first (Phase 1) because every subsequent file imports types from the store. Shared primitives before components (Phase 2 before 3) because all 6 manipulatives need DraggableItem. TenFrame before BaseTenBlocks (Phase 3) because TenFrame proves the pattern with lower complexity. Sandbox last (Phase 5) because it's standalone — it doesn't block the session-embedded feature and can ship incrementally.

---

## Sources

- Existing codebase: `src/store/appStore.ts`, `src/store/slices/`, `src/services/`, `src/navigation/AppNavigator.tsx`, `src/hooks/useSession.ts` — HIGH confidence (direct inspection)
- `.planning/04-virtual-manipulatives.md` — Prior virtual manipulatives research including component specs and animation principles — HIGH confidence
- `.planning/03-ai-tutoring-engine.md` — CPA progression definition, TEACH mode, threshold documentation — HIGH confidence
- [React Native Reanimated 3.x to 4.x Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) — `scheduleOnRN` vs `runOnJS`, New Architecture requirement — HIGH confidence (official docs)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — New Architecture status, SDK 54 as last optional-NA release — HIGH confidence (official docs)
- `app.json` — `newArchEnabled: true` confirmed in project — HIGH confidence (direct inspection)
- `package.json` — `react-native-reanimated ~4.1.1`, `react-native-gesture-handler ~2.28.0`, `react-native-svg 15.12.1` confirmed — HIGH confidence (direct inspection)
- [React Native Gesture Handler Introduction](https://docs.swmansion.com/react-native-gesture-handler/docs/) — Gesture API (not old handler API) pattern — MEDIUM confidence (official docs, not tested in project yet)

---

*Architecture research for: Virtual Manipulatives integration into Tiny Tallies v0.4*
*Researched: 2026-03-03*
