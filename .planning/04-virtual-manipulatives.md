# Virtual Manipulatives UI Design

**Research Date:** 2026-02-28
**Focus:** Interactive math tools for ages 6-9 on mobile

## Research Basis

- **NCTM Position:** "Every student should have access to manipulatives" — physical AND virtual
- **Moyer-Packenham (2016):** Virtual manipulatives as effective as physical for K-3 math
- **Key finding:** Interaction (drag, snap, split) is critical — passive viewing doesn't work
- **Touch screen advantage:** Children 6-9 are highly proficient with touch; drag-and-drop is natural

## Core Manipulative Types

### 1. Base-Ten Blocks

**Purpose:** Place value, addition with regrouping, subtraction with borrowing

**Components:**
- **Unit cube** (1) — small square, individually draggable
- **Ten rod** (10) — horizontal bar that snaps from 10 cubes
- **Hundred flat** (100) — square grid

**Interactions:**
- Drag cubes to counting area
- Auto-group: 10 cubes → animates into a rod (with sound/haptic)
- Tap rod to break back into 10 cubes (for borrowing)
- Snap to place-value columns (ones | tens | hundreds)

**Technical:**
- `react-native-gesture-handler` PanGestureHandler for drag
- `react-native-reanimated` SharedValue for smooth 60fps animations
- Snap-to-grid logic with configurable column positions

```
┌──────────────────────────────┐
│  Hundreds  │   Tens   │ Ones │
│            │  ████    │  ■   │
│            │  ████    │  ■   │
│            │          │  ■   │
│            │          │      │
│  ← drag blocks here →       │
└──────────────────────────────┘
```

### 2. Number Line

**Purpose:** Addition, subtraction, fractions, number sense

**Components:**
- Horizontal line with evenly spaced tick marks
- Animated "hop" arrow showing jumps
- Adjustable range (0-10, 0-20, 0-100, 0-1 for fractions)
- Pinch-to-zoom for fractions (subdivide between integers)

**Interactions:**
- Tap a number to place marker
- Drag arrow to show hop from one number to another
- Hop counter shows "jumped 3 spaces"
- For fractions: pinch between 0 and 1 to reveal 1/2, 1/3, 1/4 marks

```
  ←──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──→
     0  1  2  3  4  5  6  7  8  9  10
              ╰──hop: +3──╯
              3          → 6
```

### 3. Fraction Strips / Circles

**Purpose:** Equal parts, comparing fractions, equivalent fractions

**Components:**
- **Circle/pie mode:** Drag divider lines to split into equal parts
- **Bar/strip mode:** Horizontal bars split into segments
- Shading: tap segments to shade/unshade
- Stack mode: compare two fractions by stacking strips

**Interactions:**
- Drag knife/divider to split shape into N parts
- Tap segments to shade (shows numerator update)
- Drag one strip above another to compare
- Pinch to resize for equivalent fractions

```
  Whole:   [████████████████████]
  Halves:  [████████|████████████]
  Thirds:  [██████|██████|████████]
  Fourths: [█████|█████|█████|█████]
                    ↑ shaded = 2/4
```

### 4. Counters / Tokens

**Purpose:** Counting, addition, subtraction, equal groups, division

**Components:**
- Colorful circular tokens (2 colors for comparison)
- Grouping circles (drag tokens into groups)
- Array grid (snap tokens into rows × columns)

**Interactions:**
- Tap to add a counter
- Drag to move between groups
- Double-tap group circle to add/remove it
- Auto-count display per group

```
  Group 1:  ●●●      Group 2:  ●●●●
  (3)                 (4)

  Total: 7
```

### 5. Ten Frame

**Purpose:** Addition within 20, make-10 strategy, number bonds

**Components:**
- 2×5 grid (classic ten frame)
- Draggable counters to fill cells
- Second ten frame for numbers > 10
- "Fill to 10" animation for make-10 strategy

**Interactions:**
- Drag counters into cells
- Shows running count
- "Fill" button auto-fills to demonstrate make-10
- Highlight remaining cells to show "need X more to make 10"

```
  ┌───┬───┬───┬───┬───┐
  │ ● │ ● │ ● │ ● │ ● │
  ├───┼───┼───┼───┼───┤
  │ ● │ ● │ ● │   │   │   = 8
  └───┴───┴───┴───┴───┘
       "Need 2 more to make 10!"
```

### 6. Bar Model (Singapore Math)

**Purpose:** Word problems, part-whole relationships, comparison

**Components:**
- Resizable bars representing quantities
- Labels for known/unknown values
- Question mark for the unknown
- Bracket showing total

**Interactions:**
- Drag to resize bars
- Tap to add label
- Split bar into equal parts
- Stack for comparison problems

```
  Sam has 12 apples. He gave 5 away. How many left?

  ┌────────────────────────┐
  │         12             │  ← total
  ├──────────┬─────────────┤
  │    5     │     ?       │  ← parts
  └──────────┴─────────────┘
```

## Technical Architecture

```typescript
// Shared manipulative interface
interface Manipulative {
  type: ManipulativeType;
  config: ManipulativeConfig;
  onInteraction: (event: ManipulativeEvent) => void;
  onComplete: (result: ManipulativeResult) => void;
}

type ManipulativeType =
  | 'base_ten_blocks'
  | 'number_line'
  | 'fraction_strips'
  | 'fraction_circles'
  | 'counters'
  | 'ten_frame'
  | 'bar_model'
  | 'array_grid';

interface ManipulativeConfig {
  range?: [number, number];
  targetValue?: number;
  showLabels?: boolean;
  allowFreePlay?: boolean;
  guidedMode?: boolean;  // highlights next expected action
}

interface ManipulativeEvent {
  action: 'drag' | 'tap' | 'pinch' | 'drop' | 'split' | 'group';
  element: string;
  position: { x: number; y: number };
  value?: number;
}
```

## Animation Principles

1. **Snap feedback:** Items snap to valid positions with spring animation (reanimated `withSpring`)
2. **Haptic on snap:** `Haptics.impactAsync(Light)` when item locks into place
3. **Counting animation:** Numbers count up/down with `withTiming` as items are added/removed
4. **Grouping animation:** Items slide together when grouped, with a subtle glow
5. **Error state:** Gentle shake animation (not red/angry) when item placed incorrectly in guided mode
6. **Celebration:** Confetti burst on correct answer (reusable Lottie animation)

## Accessibility

- All manipulatives have VoiceOver/TalkBack labels
- High contrast mode option (thicker borders, more distinct colors)
- Minimum touch target: 44×44pt (Apple HIG)
- Color-blind safe palette (avoid red/green as sole differentiators)
- Alternative input: tap buttons as fallback for drag-and-drop

## Performance Considerations

- **Max objects on screen:** 30 draggable items (beyond this, use grouping)
- **Gesture handler:** Use `react-native-gesture-handler` v2 Gesture API (not old handler API)
- **Reanimated worklets:** All drag animations on UI thread via `useAnimatedStyle`
- **SVG for shapes:** Use `react-native-svg` for fraction circles, number lines
- **Pre-render:** Cache manipulative layouts for common configurations

## Research References

- Moyer-Packenham, P.S. (2016). "International perspectives on teaching with virtual manipulatives"
- NCTM (2014). "Principles to Actions: Ensuring Mathematical Success for All"
- Carbonneau, K.J. (2013). "Meta-analysis of manipulative use in mathematics"
- Suh, J. & Moyer, P. (2007). "Developing students' representational fluency using virtual and physical algebra balances"
