# Phase 18: CPA Progression and Session Integration - Research

**Researched:** 2026-03-03
**Domain:** CPA-aware session rendering, bottom-drawer panel, pictorial SVG diagrams, Reanimated layout animation
**Confidence:** HIGH

## Summary

Phase 18 integrates the CPA (Concrete-Pictorial-Abstract) progression framework into the existing SessionScreen so that each problem dynamically renders the appropriate representation based on the child's per-skill mastery level. The core engineering challenge is modifying a clean 363-line screen into a CPA-branching renderer with three distinct modes (interactive manipulative panel, static SVG diagram, plain numbers-only) while keeping the file under 500 lines through extraction. A secondary challenge is the bottom-drawer panel -- an animated collapsible workspace using Reanimated that coexists with gesture-driven manipulatives inside it.

All prerequisite infrastructure exists and is well-tested: `deriveCpaStage()` maps P(L) to CPA stages, `getPrimaryManipulative()` selects the right manipulative per skill, `ManipulativeShell` wraps all 6 manipulatives, and `commitSessionResults` already advances CPA stages at session end. The `useSession` hook exposes `currentProblem.skillId` on every render cycle. No new store schema changes are needed -- `cpaLevel` is already in `SkillState` (STORE_VERSION 5). No new dependencies are needed -- `react-native-svg` (v15.12.1), `react-native-reanimated` (v4), and `react-native-gesture-handler` are all already installed.

**Primary recommendation:** Extract CPA-mode rendering into a `CpaSessionRenderer` component and the drawer into a `ManipulativePanel` component, keeping SessionScreen as a thin orchestrator that reads CPA stage per-problem and delegates. Build 6 pictorial SVG renderer functions (one per manipulative type) as pure components in a `pictorial/` directory.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Bottom drawer pattern: manipulative panel slides up from below the answer grid when expanded
- Problem text + answer buttons stay at top; manipulative workspace below
- Panel height ~50% of screen when expanded
- When panel is open, answer buttons switch from 2x2 grid to a single horizontal row of 4 smaller buttons (still 48dp minimum)
- In concrete mode (low mastery), panel starts expanded automatically
- In pictorial/abstract mode, no panel is shown by default (pictorial uses inline diagram instead)
- Static auto-generated SVG diagrams for pictorial mode -- NOT interactive, NOT read-only manipulatives
- Per-manipulative pictorial renderers: each manipulative type gets its own static SVG style
- Pictorial diagram shown inline between problem text and answer buttons -- always visible, no toggle needed
- "Need help?" button below the pictorial diagram opens the full interactive manipulative in the collapsible panel (scaffolding without CPA regression)
- Toggle button as primary interaction: prominent labeled button (blocks icon + "Show blocks") between answers and panel area
- Tap to expand, tap again to collapse -- simple, discoverable, 48dp target
- Icon changes to indicate panel state (open/closed)
- Smooth slide animation (~300ms spring) using Reanimated for 60fps
- Panel collapses and manipulative resets when advancing to the next problem
- Manipulative starts empty -- child builds the representation themselves
- Per-problem CPA: each problem uses the CPA stage of its own skill
- Subtle celebration on Results screen when CPA stage advances: "You leveled up! Now you can solve with pictures!"
- Small icon in session header showing current CPA mode (blocks/picture/numbers icon)
- Abstract mode = current SessionScreen unchanged

### Claude's Discretion
- Exact pictorial SVG rendering implementation for each manipulative type
- Toggle button visual design (icon choice, label text, placement coordinates)
- Spring animation configuration for panel slide
- Compact answer row layout details (spacing, sizing within 48dp constraint)
- CPA mode icon design and header placement
- Results screen celebration message copy and animation

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CPA-02 | User sees interactive manipulatives (concrete mode) when skill mastery is low | `deriveCpaStage()` returns 'concrete' for P(L) < 0.40; `getPrimaryManipulative()` selects manipulative; ManipulativeShell + all 6 components ready; bottom drawer panel renders them |
| CPA-03 | User sees static visual representations (pictorial mode) when skill mastery is moderate | `deriveCpaStage()` returns 'pictorial' for 0.40 <= P(L) < 0.85; new pictorial SVG renderers per manipulative type; inline between problem and answers |
| CPA-04 | User sees numbers only (abstract mode) when skill mastery is high | `deriveCpaStage()` returns 'abstract' for P(L) >= 0.85; SessionScreen current layout is already this mode -- no manipulatives, no diagrams |
| CPA-05 | CPA stage advances automatically when user completes a practice session | Already implemented in `useSession.handleAnswer` -> `advanceCpaStage()` -> `commitSessionResults`; Results screen needs celebration UI |
| SESS-01 | User sees a contextually-selected manipulative as collapsible overlay during practice problems | ManipulativePanel component with Reanimated slide animation; renders selected manipulative inside ManipulativeShell |
| SESS-02 | System auto-selects the appropriate manipulative type based on the current problem's skill | `getPrimaryManipulative(skillId)` already returns ranked first choice; hook reads `currentProblem.skillId` |
| SESS-03 | User can expand/collapse the manipulative panel during a session | Toggle button with tap handler; Reanimated shared value drives panel height; collapses on problem advance |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | 4.x | Panel slide animation (withSpring), animated layout | Already used throughout app for all animations |
| react-native-gesture-handler | 2.x | Manipulative gesture handling inside panel | Already used by all 6 manipulatives |
| react-native-svg | 15.12.1 | Pictorial mode static SVG diagrams | Already used by NumberLine component |
| lucide-react-native | - | CPA mode icons, toggle button icon | Project standard icon library per CLAUDE.md |

### Supporting (already available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | - | Insets for panel positioning | Already used by SessionScreen |
| zustand | - | Reading skillStates.cpaLevel per problem | Already the project state manager |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom bottom drawer | @gorhom/bottom-sheet | Overkill: adds dependency, gesture conflicts with manipulatives inside; custom Reanimated panel is simpler and conflict-free |
| react-native-svg for pictorial | Canvas/Skia | SVG already installed and pattern-proven in NumberLine; no benefit to switching |
| Animated (RN core) | - | JS thread animations; Reanimated runs on UI thread for 60fps |

**Installation:** None needed -- all dependencies already installed.

## Architecture Patterns

### Recommended Component Structure
```
src/
  components/
    session/
      ManipulativePanel.tsx       # ~120 lines: animated bottom drawer with toggle
      ManipulativePanel.test.tsx   # Panel animation and toggle tests
      CpaSessionContent.tsx       # ~150 lines: CPA-branching renderer (concrete/pictorial/abstract)
      CpaSessionContent.test.tsx  # Mode-switching tests
      CompactAnswerRow.tsx        # ~80 lines: horizontal 4-button answer layout
      CompactAnswerRow.test.tsx
      CpaModeIcon.tsx             # ~40 lines: header icon for current CPA mode
      pictorial/
        PictorialDiagram.tsx      # ~60 lines: dispatcher to per-type renderers
        CountersDiagram.tsx       # ~50 lines: static dot-group SVG
        TenFrameDiagram.tsx       # ~50 lines: static ten-frame grid SVG
        BaseTenBlocksDiagram.tsx  # ~60 lines: static place-value block SVG
        NumberLineDiagram.tsx     # ~50 lines: static labeled number line SVG
        BarModelDiagram.tsx       # ~50 lines: static part-whole bar SVG
        FractionStripsDiagram.tsx # ~50 lines: static fraction strip SVG
        index.ts                  # Barrel exports
  hooks/
    useCpaMode.ts                # ~30 lines: derives CPA stage + manipulative type from skillId
  screens/
    SessionScreen.tsx            # Modified: adds CpaSessionContent, panel toggle state
    ResultsScreen.tsx            # Modified: adds CPA advance celebration row
```

### Pattern 1: CPA Mode Resolution Per Problem
**What:** Pure hook that reads `skillId` from current problem and returns CPA stage + manipulative type.
**When to use:** Every problem render in the session.
**Example:**
```typescript
// src/hooks/useCpaMode.ts
import { useAppStore } from '@/store/appStore';
import { getOrCreateSkillState } from '@/store/helpers/skillStateHelpers';
import { getPrimaryManipulative } from '@/services/cpa';
import type { CpaStage, ManipulativeType } from '@/services/cpa';

export interface CpaModeInfo {
  stage: CpaStage;
  manipulativeType: ManipulativeType | null;
}

export function useCpaMode(skillId: string | null): CpaModeInfo {
  const skillStates = useAppStore((s) => s.skillStates);

  if (!skillId) {
    return { stage: 'abstract', manipulativeType: null };
  }

  const skillState = getOrCreateSkillState(skillStates, skillId);
  const stage = skillState.cpaLevel ?? 'concrete';
  const manipulativeType = stage !== 'abstract' ? getPrimaryManipulative(skillId) : null;

  return { stage, manipulativeType };
}
```
**Key insight:** Read the PERSISTED `cpaLevel` from the store, not derive it live from mastery. The store value respects the one-way advance constraint. `deriveCpaStage()` is only used during `commitSessionResults` to compute the new level.

### Pattern 2: Animated Bottom Drawer Panel
**What:** Reanimated `useSharedValue` for panel height, `useAnimatedStyle` for translateY, `withSpring` for smooth slide.
**When to use:** Concrete mode (auto-expanded) and "Need help?" scaffolding from pictorial mode.
**Example:**
```typescript
// Pattern for ManipulativePanel
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const PANEL_HEIGHT = Dimensions.get('window').height * 0.5;
const PANEL_SPRING = { damping: 20, stiffness: 200, mass: 0.8 };

function ManipulativePanel({ expanded, onToggle, children }) {
  const translateY = useSharedValue(PANEL_HEIGHT); // start hidden

  useEffect(() => {
    translateY.value = withSpring(
      expanded ? 0 : PANEL_HEIGHT,
      PANEL_SPRING,
    );
  }, [expanded]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.panel, panelStyle]}>
      {children}
    </Animated.View>
  );
}
```

### Pattern 3: Per-Problem State Reset
**What:** Panel collapses and manipulative resets when `currentIndex` changes. Achieved by keying the manipulative on `currentIndex`.
**When to use:** Every problem transition.
**Example:**
```typescript
// In CpaSessionContent: key resets manipulative state
<ManipulativeShell onReset={handleReset} count={0}>
  <ManipulativeComponent key={`manip-${currentIndex}`} />
</ManipulativeShell>
```
**Why key-based reset:** All 6 manipulatives use component-local state (useState). Changing the key unmounts and remounts, giving a clean empty workspace per the "child builds it themselves" requirement.

### Pattern 4: Conditional Answer Layout
**What:** 2x2 grid (default) vs horizontal row (when panel expanded). Controlled by a boolean prop.
**When to use:** Panel open state changes answer layout.
**Example:**
```typescript
// Compact horizontal row when panel is open
{panelExpanded ? (
  <CompactAnswerRow options={options} onAnswer={handleAnswer} ... />
) : (
  <View style={styles.optionsGrid}>
    {/* existing 2x2 grid */}
  </View>
)}
```

### Pattern 5: Pictorial SVG Dispatching
**What:** A dispatcher component maps `ManipulativeType` to the correct static SVG renderer.
**When to use:** Pictorial CPA stage -- inline between problem text and answers.
**Example:**
```typescript
// src/components/session/pictorial/PictorialDiagram.tsx
function PictorialDiagram({ type, problem }: PictorialDiagramProps) {
  switch (type) {
    case 'counters': return <CountersDiagram problem={problem} />;
    case 'ten_frame': return <TenFrameDiagram problem={problem} />;
    case 'base_ten_blocks': return <BaseTenBlocksDiagram problem={problem} />;
    case 'number_line': return <NumberLineDiagram problem={problem} />;
    case 'bar_model': return <BarModelDiagram problem={problem} />;
    case 'fraction_strips': return <FractionStripsDiagram problem={problem} />;
    default: return null;
  }
}
```

### Anti-Patterns to Avoid
- **Deriving CPA stage live instead of reading store:** The store's `cpaLevel` has the one-way advance constraint baked in. Re-deriving from `masteryProbability` would show regression in pictorial children during a bad session.
- **Using Modal for manipulative panel:** Modal creates a separate React tree that blocks gestures in the parent. The in-screen collapsible panel (locked decision) avoids this entirely.
- **Making SessionScreen a god component:** Resist adding CPA branching logic directly into SessionScreen. Extract `CpaSessionContent` to handle mode switching, keeping SessionScreen as coordinator.
- **Inline styles for animated views:** Reanimated requires `useAnimatedStyle` -- never pass interpolated values directly as style props.
- **Reusing interactive manipulatives for pictorial mode:** The decision explicitly says pictorial = static SVGs, not read-only interactive components. Different components entirely.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CPA stage lookup | Custom mastery-to-stage logic | `skillState.cpaLevel` from store | One-way advance constraint already enforced by `advanceCpaStage()` at commit time |
| Manipulative selection | Hardcoded switch on skill pattern | `getPrimaryManipulative(skillId)` | 14-skill mapping table already maintained in `skillManipulativeMap.ts` |
| Panel slide animation | Animated (core RN) or manual requestAnimationFrame | Reanimated `withSpring` + `useAnimatedStyle` | UI thread animation; 60fps guaranteed even during JS work |
| Problem SVG generation | Canvas drawing or custom rendering | `react-native-svg` primitives (Rect, Circle, Line, Text) | Already installed, already pattern-proven in NumberLineSvg.tsx |
| Manipulative component wrapper | Custom reset/counter/workspace | `ManipulativeShell` | All 6 manipulatives already use it; consistent UX |

**Key insight:** Nearly all the hard logic (CPA mapping, manipulative selection, one-way advance, session commit) was built in Phases 15-17. Phase 18 is primarily UI composition and layout work.

## Common Pitfalls

### Pitfall 1: Gesture Conflict Between Panel and Manipulatives
**What goes wrong:** Pan gestures on the panel (for potential drag-to-dismiss) conflict with pan gestures inside manipulatives (for dragging blocks, counters).
**Why it happens:** Nested gesture handlers can steal touches from each other.
**How to avoid:** Use tap-only toggle for the panel (locked decision). No pan gesture on the panel itself. Manipulative gestures inside the panel work without conflict because the panel container is a static `Animated.View` with no gesture detector.
**Warning signs:** Blocks or counters become undraggable when inside the panel.

### Pitfall 2: Panel Height Calculation on Different Devices
**What goes wrong:** `50% of screen` varies dramatically between phones and tablets. On small phones, 50% may not be enough for base-ten blocks.
**Why it happens:** `Dimensions.get('window').height` is static and doesn't account for safe areas, header, or answer row.
**How to avoid:** Use `onLayout` of the available space (below the answer row) rather than raw screen height. Calculate panel height as percentage of remaining space after header + answers.
**Warning signs:** Panel clips behind the answer buttons or leaves too little workspace on small screens.

### Pitfall 3: Stale CPA Stage During Session
**What goes wrong:** Reading CPA stage from the store mid-session shows the stage BEFORE session start, but `pendingUpdatesRef` accumulates CPA advances that haven't been committed yet.
**Why it happens:** CPA advance is computed in `handleAnswer` but only committed in `commitSessionResults` at session end.
**How to avoid:** This is actually CORRECT behavior per the locked decision: "CPA stage advances automatically after a practice session completes." During the session, the child works at their pre-session CPA level. The advance celebration appears on the Results screen.
**Warning signs:** None -- this is the intended design. Do NOT try to "fix" this by reading pending updates.

### Pitfall 4: AnswerFeedbackAnimation Width Breaking in Compact Mode
**What goes wrong:** `AnswerFeedbackAnimation` has a hardcoded `width: '45%'` wrapper style that breaks horizontal row layout.
**Why it happens:** The wrapper was designed for the 2x2 grid where each button is 45% of container width.
**How to avoid:** The `CompactAnswerRow` component needs its own feedback wrapper or the existing wrapper needs a width prop override. Best approach: pass a `compactMode` boolean that switches to `flex: 1` instead of `width: '45%'`.
**Warning signs:** Answer buttons overflow or wrap when panel is expanded.

### Pitfall 5: Manipulative Not Resetting on Problem Advance
**What goes wrong:** Counter/block state persists from the previous problem.
**Why it happens:** If the manipulative component is not unmounted between problems, its useState persists.
**How to avoid:** Key the manipulative component on `currentIndex` (Pattern 3 above). When the key changes, React unmounts and remounts, giving a fresh empty workspace.
**Warning signs:** Child sees leftover blocks/counters from the previous problem.

### Pitfall 6: 500-Line Limit Violation
**What goes wrong:** Trying to add CPA branching + panel + pictorial + compact answers directly to SessionScreen exceeds 500 lines.
**Why it happens:** SessionScreen is already 363 lines. Adding all new logic would push it to 600+.
**How to avoid:** Extract aggressively: `CpaSessionContent` handles mode switching, `ManipulativePanel` handles drawer, `CompactAnswerRow` handles layout, pictorial renderers are separate files.
**Warning signs:** SessionScreen approaching 400 lines during implementation.

## Code Examples

### Reading CPA Stage in Session
```typescript
// In SessionScreen or CpaSessionContent
const skillId = currentProblem?.skillId ?? null;
const { stage, manipulativeType } = useCpaMode(skillId);

// Render based on stage
switch (stage) {
  case 'concrete':
    // Show manipulative panel (auto-expanded) + standard answer grid
    break;
  case 'pictorial':
    // Show inline SVG diagram + "Need help?" button + standard answer grid
    break;
  case 'abstract':
    // Current SessionScreen layout unchanged
    break;
}
```

### Pictorial SVG Example: Counters Diagram
```typescript
// src/components/session/pictorial/CountersDiagram.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { Problem } from '@/services/mathEngine/types';
import { colors } from '@/theme';

interface CountersDiagramProps {
  problem: Problem;
}

const DOT_RADIUS = 10;
const DOT_SPACING = 28;
const DOTS_PER_ROW = 5;
const SVG_HEIGHT = 80;

export function CountersDiagram({ problem }: CountersDiagramProps) {
  const [a, b] = problem.operands;
  const total = a + b;
  const rows = Math.ceil(total / DOTS_PER_ROW);
  const svgWidth = DOTS_PER_ROW * DOT_SPACING + DOT_RADIUS * 2;

  return (
    <View style={styles.container}>
      <Svg width={svgWidth} height={rows * DOT_SPACING + DOT_RADIUS * 2}>
        {Array.from({ length: total }, (_, i) => {
          const row = Math.floor(i / DOTS_PER_ROW);
          const col = i % DOTS_PER_ROW;
          const isFirstGroup = i < a;
          return (
            <Circle
              key={i}
              cx={DOT_RADIUS + col * DOT_SPACING}
              cy={DOT_RADIUS + row * DOT_SPACING}
              r={DOT_RADIUS}
              fill={isFirstGroup ? '#EF4444' : '#FACC15'}
              opacity={0.9}
            />
          );
        })}
      </Svg>
    </View>
  );
}
```

### Manipulative Panel Toggle Button
```typescript
// Using lucide-react-native icons (project standard)
import { Blocks, ChevronDown, ChevronUp } from 'lucide-react-native';

function ToggleButton({ expanded, onToggle, manipulativeType }) {
  const label = expanded ? 'Hide blocks' : 'Show blocks';
  const Icon = expanded ? ChevronDown : ChevronUp;

  return (
    <Pressable
      onPress={onToggle}
      style={styles.toggleButton}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID="manipulative-toggle"
    >
      <Blocks size={20} color={colors.primaryLight} />
      <Text style={styles.toggleLabel}>{label}</Text>
      <Icon size={16} color={colors.textSecondary} />
    </Pressable>
  );
}
```

### Panel Spring Configuration
```typescript
// Consistent with existing animationConfig.ts pattern
// ~300ms perceptual spring per locked decision
export const PANEL_SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
  overshootClamping: true,
} as const;
```
Note: Reanimated v4 `withSpring` duration is "perceptual" (~1.5x actual). A config with damping 20, stiffness 200 settles in approximately 200-300ms perceptual time.

### CPA Advance Celebration (Results Screen)
```typescript
// Additional row in ResultsScreen stats card, conditionally shown
// CPA advance data must be passed through navigation params
{cpaAdvanced && (
  <>
    <View style={styles.divider} />
    <View style={styles.cpaRow} testID="cpa-advance-callout">
      <Animated.View style={cpaAnimatedStyle}>
        <Text style={styles.cpaText}>
          {cpaAdvanceMessage}
        </Text>
      </Animated.View>
    </View>
  </>
)}
```

### Mapping ManipulativeType to Component
```typescript
// Dynamic component selection for concrete mode
import { Counters, TenFrame, BaseTenBlocks, NumberLine, FractionStrips, BarModel } from '@/components/manipulatives';
import type { ManipulativeType } from '@/services/cpa';

const MANIPULATIVE_COMPONENTS: Record<ManipulativeType, React.ComponentType<{ testID?: string }>> = {
  counters: Counters,
  ten_frame: TenFrame,
  base_ten_blocks: BaseTenBlocks,
  number_line: NumberLine,
  fraction_strips: FractionStrips,
  bar_model: BarModel,
};

function renderManipulative(type: ManipulativeType, key: string) {
  const Component = MANIPULATIVE_COMPONENTS[type];
  return <Component key={key} testID={`session-manipulative-${type}`} />;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Reanimated v3 `runOnJS` | v4 `scheduleOnRN` from `react-native-worklets` | Reanimated 4.x | Import path changed; already adopted in project |
| Reanimated v3 `runOnUI` | v4 `scheduleOnUI` from `react-native-worklets` | Reanimated 4.x | Already adopted |
| `withSpring` restDisplacementThreshold | `energyThreshold` in v4 | Reanimated 4.x | New threshold parameter name |
| Animated (core RN) for layout | Reanimated for all animations | Project convention | UI thread animation standard |

**Deprecated/outdated:**
- `useAnimatedGestureHandler`: Removed in Reanimated v4. Use Gesture API from react-native-gesture-handler v2+.
- `Animated.timing` (core RN): Avoid; use Reanimated `withTiming`/`withSpring`.

## Open Questions

1. **CPA Advance Data Passing to Results Screen**
   - What we know: `commitSessionResults` returns `SessionFeedback` which includes xpEarned, leveledUp, streakCount. CPA advance info is NOT currently in `SessionFeedback`.
   - What's unclear: Whether to add CPA advance fields to `SessionFeedback` type or compute it from `pendingUpdates` before navigating to Results.
   - Recommendation: Add `cpaAdvances: Array<{ skillId: string; from: CpaStage; to: CpaStage }>` to `SessionFeedback` and pass it through navigation params. This keeps the pattern consistent with how `leveledUp` is already passed.

2. **Pictorial Diagram Sizing Across Devices**
   - What we know: Pictorial diagrams are shown inline between problem text and answer buttons. Available vertical space varies by device.
   - What's unclear: Whether diagrams should be fixed-height or scale to available space.
   - Recommendation: Use a fixed max-height (e.g., 120dp) with `aspectRatio` to maintain proportions. This keeps diagrams visually consistent and prevents them from crowding the answer area on small phones.

3. **NumberLine Range for Pictorial Mode**
   - What we know: NumberLine manipulative supports configurable ranges (0-10, 0-20, 0-100). In pictorial mode, the diagram should show a range relevant to the problem.
   - What's unclear: How to determine the range from the problem data (operands and operation).
   - Recommendation: Use `Math.max(...operands, correctAnswer)` rounded up to nearest 10 as the range end, with 0 as start. Simple heuristic that covers all current skill levels.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | `jest.config.js` (exists) |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CPA-02 | Concrete mode renders manipulative panel expanded | unit | `npm test -- --testPathPattern=CpaSessionContent` | No - Wave 0 |
| CPA-03 | Pictorial mode renders inline SVG diagram | unit | `npm test -- --testPathPattern=CpaSessionContent` | No - Wave 0 |
| CPA-04 | Abstract mode renders plain problem + answers (no manipulatives) | unit | `npm test -- --testPathPattern=CpaSessionContent` | No - Wave 0 |
| CPA-05 | Results screen shows CPA advance celebration | unit | `npm test -- --testPathPattern=ResultsScreen` | Partial (ResultsScreen.test.tsx exists, needs CPA tests) |
| SESS-01 | ManipulativePanel renders selected manipulative | unit | `npm test -- --testPathPattern=ManipulativePanel` | No - Wave 0 |
| SESS-02 | Correct manipulative type selected for skill | unit | `npm test -- --testPathPattern=useCpaMode` | No - Wave 0 |
| SESS-03 | Toggle expands/collapses panel | unit | `npm test -- --testPathPattern=ManipulativePanel` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<changed-file-pattern>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + `npm run typecheck` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/session/useCpaMode.test.ts` -- covers SESS-02
- [ ] `src/components/session/CpaSessionContent.test.tsx` -- covers CPA-02, CPA-03, CPA-04
- [ ] `src/components/session/ManipulativePanel.test.tsx` -- covers SESS-01, SESS-03
- [ ] `src/components/session/CompactAnswerRow.test.tsx` -- covers answer layout switch
- [ ] Update `src/__tests__/screens/ResultsScreen.test.tsx` -- covers CPA-05

## Sources

### Primary (HIGH confidence)
- **Project source code** (direct file reads): `cpaMappingService.ts`, `skillManipulativeMap.ts`, `cpaTypes.ts`, `SessionScreen.tsx`, `useSession.ts`, `ManipulativeShell.tsx`, `animationConfig.ts`, `ResultsScreen.tsx`, `AnswerFeedbackAnimation.tsx`, `sessionTypes.ts`, `skillStatesSlice.ts`, navigation types, all manipulative component directories
- **Project CLAUDE.md** -- coding conventions, 500-line limit, StyleSheet.create, lucide-react-native, Reanimated patterns
- **Project skills** -- `react-native-best-practices/references/js-animations-reanimated.md` for Reanimated v4 API (withSpring, useAnimatedStyle, scheduleOnRN)
- **18-CONTEXT.md** -- locked decisions on panel layout, CPA modes, pictorial rendering, interaction patterns

### Secondary (MEDIUM confidence)
- **Reanimated v4 migration notes** from project skill reference -- `energyThreshold` replacing `restDisplacementThreshold`, `scheduleOnRN` replacing `runOnJS`

### Tertiary (LOW confidence)
- Spring timing estimate (~300ms perceptual for damping:20/stiffness:200) -- based on Reanimated v4 docs noting duration is "perceptual (~1.5x actual time)"; exact timing should be validated visually

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used in project
- Architecture: HIGH -- follows established project patterns (extraction, barrel exports, StyleSheet.create, pure service functions)
- Pitfalls: HIGH -- derived from direct code analysis of existing components and their constraints
- Pictorial SVG rendering: MEDIUM -- exact SVG layouts are Claude's discretion; patterns proven in NumberLineSvg.tsx but new per-type renderers untested
- Panel animation timing: MEDIUM -- spring config derived from existing animationConfig.ts patterns but exact visual feel needs runtime tuning

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable -- no external dependencies changing)
