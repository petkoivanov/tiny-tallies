# Phase 19: Sandbox Navigation - Research

**Researched:** 2026-03-03
**Domain:** React Navigation screen routing, Zustand state slice, React Native ScrollView grid layout
**Confidence:** HIGH

## Summary

Phase 19 is a UI integration phase: add a new navigation route (SandboxScreen) with a `manipulativeType` param, create a 2x3 card grid on the HomeScreen for entry, and render existing manipulative components in a free-play wrapper. All 6 manipulative components are already built and exported from `src/components/manipulatives/index.ts` with minimal props (typically just `testID`). Each already wraps itself in `ManipulativeShell` internally, so the sandbox screen simply renders the selected component full-screen.

The store needs a small new slice (`sandboxSlice`) to track which manipulatives have been explored (for the "new" dot and first-time tooltip dismissal). This is a `Set<ManipulativeType>` persisted via Zustand's `partialize`. STORE_VERSION does NOT need bumping because the new slice adds new fields with defaults -- existing persisted data simply won't have these fields and they'll initialize to defaults. No schema shape change on existing fields.

**Primary recommendation:** Implement in 2 plans: (1) Store slice + Navigation route + SandboxScreen, (2) HomeScreen grid UI with explore cards, new-dot tracking, and first-time tooltips.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Add a "Sandbox" section below the stats section (XP/streak) on the home screen
- Display all 6 manipulatives as a 2x3 grid of tappable cards
- Wrap HomeScreen content in a ScrollView to accommodate the new section
- Section header label: "Explore"
- Start Practice button remains at the bottom after the grid
- Each card shows an emoji + short friendly name
- Math-themed emojis for each manipulative
- Short friendly names: Blocks, Number Line, Ten Frame, Counters, Fractions, Bar Model
- Each card gets a unique subtle accent/colored background -- emoji provides additional color pop
- Scale press feedback on tap (Pressable scale-down animation)
- Cards ordered by difficulty: Counters, Ten Frame, Blocks, Number Line, Fractions, Bar Model
- Subtle 'new' dot on cards the child hasn't explored yet -- disappears permanently after first use
- 'New' dot state persists across app restarts (stored in Zustand store)
- One shared SandboxScreen with a `manipulativeType` route param
- Navigate directly from home grid card to SandboxScreen -- back button returns to home
- No in-screen manipulative picker/switcher needed
- Standard safe-area insets (consistent with rest of app)
- Workspace always starts completely empty
- Brief first-time tooltip on first open of each manipulative
- Per-manipulative tooltip message (specific to each manipulative)
- Tooltip auto-dismisses after 3 seconds
- Tooltip dismissal state persists across restarts (same store field as 'new' dot tracking)
- No analytics, no XP, no time tracking, no scoring -- completely pressure-free zone
- COPPA compliance (no usage data collection in sandbox)

### Claude's Discretion
- Card proportions (square vs rectangular) -- pick what fits the screen width and looks balanced
- Tooltip visual style -- pick a style consistent with the dark theme
- Exact header chrome on SandboxScreen -- use existing ManipulativeShell patterns
- Per-manipulative emoji selection (math-themed, visually distinct)
- Per-manipulative tooltip messages (age-appropriate for 6-9)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SAND-01 | User can access per-manipulative sandbox screens from the home screen | Navigation route `Sandbox` with `manipulativeType` param + HomeScreen 2x3 grid cards navigate to it |
| SAND-02 | User can freely explore each manipulative without problem constraints | SandboxScreen renders the selected manipulative component with no scoring, timing, or problem prompts -- components already support free interaction |
| SAND-03 | Sandbox state is ephemeral (not persisted across app restarts) | Manipulative state is component-local (already the pattern) -- no store persistence of workspace state. Only UX metadata (explored/tooltip-dismissed) persists |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-navigation/native-stack | ^7.8.2 | Add Sandbox route to native stack | Already in use for Home/Session/Results |
| zustand | ^5.0.8 | sandboxSlice for explored-manipulatives tracking | Already the store pattern |
| react-native (ScrollView) | 0.81.5 | Wrap HomeScreen content for scrollable layout | Built-in, no new dependency |
| react-native (Animated) | 0.81.5 | Scale press feedback on cards | Built-in, matches existing press patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | ~5.6.0 | Safe area insets on SandboxScreen | Already used on all screens |
| lucide-react-native | ^0.554.0 | Back arrow icon on SandboxScreen header | Already the project icon library |
| react-native-reanimated | ~4.1.1 | Tooltip fade-in/fade-out animation, card scale animation | Already available globally |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Reanimated for card scale | Pressable `transform` with state | Reanimated runs on UI thread (smoother), but simple Pressable style callback with `transform: [{ scale: 0.95 }]` is adequate for a press effect and simpler to implement |
| ScrollView for HomeScreen | FlatList | Only 6 cards -- not enough items to justify virtualization overhead |

**Installation:**
No new dependencies needed. Everything is already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
  screens/
    SandboxScreen.tsx            # New -- shared sandbox screen
  navigation/
    AppNavigator.tsx             # Modified -- add Sandbox route
    types.ts                     # Modified -- add Sandbox to RootStackParamList
  store/
    appStore.ts                  # Modified -- compose sandboxSlice, add to partialize
    slices/
      sandboxSlice.ts            # New -- explored manipulatives tracking
  components/
    home/
      ExploreGrid.tsx            # New -- 2x3 card grid component
      ExploreCard.tsx            # New -- individual card with press animation + new dot
      SandboxTooltip.tsx         # New -- auto-dismissing tooltip overlay
```

### Pattern 1: Navigation Route with Type Param
**What:** Single SandboxScreen with ManipulativeType route param
**When to use:** When multiple similar screens share the same layout
**Example:**
```typescript
// types.ts
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

export type RootStackParamList = {
  Home: undefined;
  Session: { sessionId: string };
  Results: { /* existing params */ };
  Sandbox: { manipulativeType: ManipulativeType };
};
```

```typescript
// SandboxScreen.tsx
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

type SandboxRouteProp = RouteProp<RootStackParamList, 'Sandbox'>;

export default function SandboxScreen() {
  const route = useRoute<SandboxRouteProp>();
  const { manipulativeType } = route.params;
  // Render the corresponding manipulative component
}
```

### Pattern 2: Manipulative Component Map
**What:** A record mapping ManipulativeType string to React component for dynamic rendering
**When to use:** When a route param selects which component to render
**Example:**
```typescript
import { Counters, TenFrame, BaseTenBlocks, NumberLine, FractionStrips, BarModel } from '@/components/manipulatives';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

const MANIPULATIVE_COMPONENTS: Record<ManipulativeType, React.ComponentType<{ testID?: string }>> = {
  counters: Counters,
  ten_frame: TenFrame,
  base_ten_blocks: BaseTenBlocks,
  number_line: NumberLine,
  fraction_strips: FractionStrips,
  bar_model: BarModel,
};
```

### Pattern 3: Zustand Slice for Explored State
**What:** A small slice tracking which manipulatives the child has opened
**When to use:** For persisted UX metadata that doesn't change store schema version
**Example:**
```typescript
// sandboxSlice.ts
import type { StateCreator } from 'zustand';
import type { AppState } from '../appStore';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

export interface SandboxSlice {
  exploredManipulatives: ManipulativeType[];
  markExplored: (type: ManipulativeType) => void;
}

export const createSandboxSlice: StateCreator<AppState, [], [], SandboxSlice> = (set) => ({
  exploredManipulatives: [],
  markExplored: (type) =>
    set((state) => ({
      exploredManipulatives: state.exploredManipulatives.includes(type)
        ? state.exploredManipulatives
        : [...state.exploredManipulatives, type],
    })),
});
```

**Important:** Use `ManipulativeType[]` (array) instead of `Set<ManipulativeType>` because Zustand's JSON serialization does not handle Set natively. Arrays serialize/deserialize cleanly with `createJSONStorage`.

### Pattern 4: ScrollView Wrapping for HomeScreen
**What:** Replace the current `flex: 1` View container with ScrollView + contentContainerStyle
**When to use:** When adding content that may exceed the viewport
**Key consideration:** The current HomeScreen uses `flex: 1` on the container with `flex: 1` on statsSection to push the button to the bottom. With ScrollView, use `contentContainerStyle={{ flexGrow: 1 }}` and keep the button section at the natural end of content.

### Pattern 5: Card Scale Press Feedback
**What:** Pressable with style callback using transform scale on pressed state
**When to use:** For tactile button feedback appropriate for children
**Example:**
```typescript
<Pressable
  onPress={onPress}
  style={({ pressed }) => [
    styles.card,
    pressed && { transform: [{ scale: 0.95 }] },
  ]}
>
```

This matches the existing `buttonPressed` pattern on HomeScreen but adds scale. No Reanimated needed for a simple pressed state transform.

### Anti-Patterns to Avoid
- **Don't persist sandbox workspace state:** Manipulative state is component-local by design. Only UX metadata (explored/tooltip tracking) goes in the store.
- **Don't bump STORE_VERSION for adding new slice fields:** New fields with defaults don't require migration. Only bump when changing existing persisted field shapes.
- **Don't use FlatList for 6 cards:** The grid has a fixed, small number of items. FlatList adds unnecessary complexity. Use a simple View with `flexWrap: 'wrap'`.
- **Don't import manipulatives dynamically:** All 6 are already statically exported. Dynamic `import()` would add code-splitting complexity for no benefit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Navigation back button | Custom back button with goBack() | React Navigation's default headerLeft or simple `navigation.goBack()` in a Pressable | Navigation handles gesture back, hardware back on Android automatically |
| Safe area handling | Manual padding calculations | `useSafeAreaInsets()` from react-native-safe-area-context | Handles notch, status bar, home indicator across all devices |
| JSON-safe Set persistence | Custom Set serializer for Zustand | Use plain array (`ManipulativeType[]`) with `includes()` | Zustand JSON storage doesn't support Set; arrays are simpler and just as fast for 6 items |
| Tooltip timer | Manual setInterval/setTimeout without cleanup | `useEffect` with `setTimeout` + cleanup return | Prevents memory leaks on unmount |

**Key insight:** This phase composes existing pieces (manipulative components, navigation patterns, store slices) rather than building new primitives. The main risk is integration errors, not algorithmic complexity.

## Common Pitfalls

### Pitfall 1: ScrollView + flex: 1 Children
**What goes wrong:** Content inside ScrollView doesn't fill the screen when there's little content
**Why it happens:** ScrollView measures children by intrinsic size, not available space
**How to avoid:** Use `contentContainerStyle={{ flexGrow: 1 }}` on ScrollView, NOT `flex: 1`
**Warning signs:** Button floats up to middle of screen instead of staying at bottom

### Pitfall 2: Zustand Set Serialization
**What goes wrong:** `Set<ManipulativeType>` silently serializes to `{}` in JSON, losing all data on app restart
**Why it happens:** `JSON.stringify(new Set(['foo']))` produces `{}`
**How to avoid:** Use `ManipulativeType[]` array instead of Set
**Warning signs:** "Explored" state resets after every app restart

### Pitfall 3: partialize Not Updated
**What goes wrong:** New slice state is never persisted, resets on restart
**Why it happens:** `partialize` in appStore.ts explicitly selects which fields to persist
**How to avoid:** Add `exploredManipulatives` to the `partialize` return object
**Warning signs:** "New" dots reappear after every restart

### Pitfall 4: GestureHandlerRootView Missing
**What goes wrong:** Manipulative gestures don't work on SandboxScreen
**Why it happens:** The gesture handler root view must wrap the gesture-enabled content
**How to avoid:** Verify that `GestureHandlerRootView` wraps the entire app (already confirmed -- it wraps the app per project decisions)
**Warning signs:** Drag gestures silently fail

### Pitfall 5: Tooltip setTimeout Leak
**What goes wrong:** Console warning "Can't perform a React state update on an unmounted component"
**Why it happens:** User navigates back before tooltip auto-dismisses (3-second timeout)
**How to avoid:** Return cleanup function from useEffect that calls `clearTimeout`
**Warning signs:** Yellow box warning in development, potential crash in strict mode

### Pitfall 6: HomeScreen Exceeds 500 Lines After Changes
**What goes wrong:** Lint / style rule violation
**Why it happens:** Adding the Explore grid, card components, and tooltip directly to HomeScreen.tsx
**How to avoid:** Extract ExploreGrid and ExploreCard into separate component files under `src/components/home/`
**Warning signs:** HomeScreen.tsx growing past 300 lines during implementation

## Code Examples

Verified patterns from existing codebase:

### Adding a Route to AppNavigator
```typescript
// AppNavigator.tsx -- add Sandbox screen
import SandboxScreen from '@/screens/SandboxScreen';

// Inside Stack.Navigator:
<Stack.Screen name="Sandbox" component={SandboxScreen} />
```

### Route Type Definition
```typescript
// types.ts -- extend RootStackParamList
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

export type RootStackParamList = {
  Home: undefined;
  Session: { sessionId: string };
  Results: { /* existing */ };
  Sandbox: { manipulativeType: ManipulativeType };
};
```

### Composing a New Slice into appStore
```typescript
// appStore.ts
import {
  type SandboxSlice,
  createSandboxSlice,
} from './slices/sandboxSlice';

export type AppState = ChildProfileSlice &
  SkillStatesSlice &
  SessionStateSlice &
  GamificationSlice &
  SandboxSlice;

// In persist config:
partialize: (state) => ({
  // ... existing fields ...
  exploredManipulatives: state.exploredManipulatives,
}),
```

### Navigating to Sandbox from Home
```typescript
// In HomeScreen ExploreCard onPress:
navigation.navigate('Sandbox', {
  manipulativeType: 'counters',
});
```

### SandboxScreen Rendering a Manipulative
```typescript
// SandboxScreen.tsx
const ManipulativeComponent = MANIPULATIVE_COMPONENTS[manipulativeType];
return (
  <View style={[styles.container, { paddingTop: insets.top }]}>
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.title}>{DISPLAY_NAMES[manipulativeType]}</Text>
    </View>
    <View style={styles.workspace}>
      <ManipulativeComponent testID={`sandbox-${manipulativeType}`} />
    </View>
  </View>
);
```

### 2x3 Grid Layout
```typescript
// ExploreGrid.tsx
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',  // ~half width minus gap
    aspectRatio: 1, // square cards (Claude's discretion)
    borderRadius: layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### Tooltip with Auto-Dismiss
```typescript
function SandboxTooltip({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>{message}</Text>
    </View>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Navigation 5 screen options | React Navigation 7 type-safe params with global augmentation | Already in use | Type-safe navigation throughout |
| Zustand v3 set() | Zustand v5 StateCreator slice pattern | Already in use | Clean slice composition |
| Modal screens for overlays | Native stack screens for full-page views | Already established | No gesture conflicts, proper back navigation |

**Deprecated/outdated:**
- None relevant to this phase. All patterns are current.

## Open Questions

1. **Card background colors**
   - What we know: Each card needs a unique subtle accent background color
   - What's unclear: Exact hex values for 6 distinct colors on the dark theme
   - Recommendation: Use muted versions of manipulative-specific colors already in the codebase (e.g., BaseTenBlocks uses `#5A7FFF`, FractionStrips uses `#A855F7`, BarModel uses `#2DD4BF`, Counters uses `#EF4444`, TenFrame uses `#3B82F6`). Create 6 muted bg variants at ~15% opacity.

2. **Emoji selection for each manipulative**
   - What we know: Math-themed, visually distinct emojis needed
   - What's unclear: Best emoji for each (platform rendering varies)
   - Recommendation: Use common math/shape emojis that render well cross-platform. Candidates: Counters (red circle or dots), Ten Frame (grid/abacus), Blocks (building blocks/cube), Number Line (ruler/straight edge), Fractions (pie/pizza slice), Bar Model (bar chart).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7 + jest-expo 54 + React Native Testing Library 13.3 |
| Config file | `jest.config.js` |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SAND-01 | Home screen shows 6 manipulative cards, each navigates to Sandbox | unit | `npm test -- --testPathPattern=HomeScreen` | Exists (needs extension) |
| SAND-01 | SandboxScreen renders correct manipulative for route param | unit | `npm test -- --testPathPattern=SandboxScreen` | Wave 0 |
| SAND-02 | Sandbox renders manipulative without scoring/timing UI | unit | `npm test -- --testPathPattern=SandboxScreen` | Wave 0 |
| SAND-03 | Sandbox state is component-local (no store persistence of workspace) | unit | `npm test -- --testPathPattern=SandboxScreen` | Wave 0 |
| SAND-01 | sandboxSlice tracks explored manipulatives correctly | unit | `npm test -- --testPathPattern=sandboxSlice` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<changed_file>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/screens/SandboxScreen.test.tsx` -- covers SAND-01, SAND-02, SAND-03
- [ ] `src/__tests__/store/sandboxSlice.test.ts` -- covers sandboxSlice markExplored logic
- [ ] Extension to `src/__tests__/screens/HomeScreen.test.tsx` -- covers Explore grid rendering and navigation

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/navigation/AppNavigator.tsx`, `src/navigation/types.ts` -- current navigation patterns
- Existing codebase: `src/store/appStore.ts`, `src/store/slices/gamificationSlice.ts` -- slice composition pattern
- Existing codebase: `src/components/manipulatives/index.ts` -- all 6 components exported
- Existing codebase: `src/screens/HomeScreen.tsx` (238 lines) -- current layout to extend
- Existing codebase: `src/screens/ResultsScreen.tsx` -- `useRoute<RouteProp>` pattern for typed params
- Existing codebase: All manipulative `*Types.ts` files -- props interfaces (minimal, mostly just testID)
- Existing codebase: `src/store/migrations.ts` -- migration pattern reference (NOT needed for this phase)

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions -- detailed implementation requirements from user discussion
- React Navigation 7 docs -- global type augmentation pattern already in use

### Tertiary (LOW confidence)
- None -- all findings based on direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, no new dependencies
- Architecture: HIGH - follows established patterns (slices, navigation, screen structure)
- Pitfalls: HIGH - identified from direct codebase analysis (ScrollView, Set serialization, partialize)

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable -- no external dependencies changing)
