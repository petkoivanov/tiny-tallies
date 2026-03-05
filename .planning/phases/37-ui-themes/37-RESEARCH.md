# Phase 37: UI Themes - Research

**Researched:** 2026-03-05
**Domain:** React Native dynamic theming, React Context, Zustand store migration, session cosmetic wrappers
**Confidence:** HIGH

## Summary

Phase 37 replaces the static `colors` export in `theme/index.ts` with a React Context-based ThemeProvider that delivers dynamic color palettes app-wide. Five themes (Default Dark, Ocean, Forest, Sunset, Space) provide full palette swaps across all 12 color tokens. Non-default themes are badge-gated using the established cosmetic unlock pattern from Phase 36. A session wrapper component adds themed ambient visuals during math sessions. A ThemePickerScreen follows the AvatarPickerScreen pattern.

The migration scope is significant: 52 files currently import `colors` from `@/theme`. The approach of removing the static `colors` export entirely is correct -- TypeScript will surface every consumer that needs migration, making it impossible to miss one. The `StyleSheet.create` pattern used throughout the app creates styles at module load time with static color values, which is incompatible with dynamic theming. The solution is a `createThemedStyles` factory pattern that generates styles from theme colors at render time, cached via `useMemo`.

**Primary recommendation:** Use React Context + `useTheme()` hook pattern. Remove static `colors` export to force TypeScript-verified migration. Use `useMemo`-cached style factories per component. Session wrappers as decorative `Animated.View` overlays with very slow Reanimated animations (4-8s cycles).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 5 themes total: Default Dark (always available), Ocean, Forest, Sunset, Space (4 unlockable via badges)
- Full palette swap -- all 12 color tokens in `theme/index.ts` change per theme (backgrounds, surfaces, primary, text, feedback)
- Typography stays Lexend across all themes -- only colors change
- 1:1 badge-to-theme mapping following Phase 36 cosmetic unlock pattern
- Each theme includes its own session wrapper -- wrapper is tied to the equipped theme, not a separate cosmetic
- Subtle ambient animation during math sessions (e.g., floating bubbles for ocean, twinkling stars for space) -- must not distract from the math problem
- Default dark theme also gets a basic wrapper for consistency across all themes
- React Context + `useTheme()` hook returns current colors -- screens call `const { colors } = useTheme()`
- ALL screens migrated to `useTheme()` -- full consistency, switching themes changes everything
- Immediate theme switching via React Context re-render -- no app restart needed
- Static `colors` export in `theme/index.ts` removed entirely -- force all consumers through `useTheme()`, TypeScript catches missed migrations
- Store migration needed for equipped `themeId` field in childProfileSlice
- Follows Phase 36 picker pattern: sectioned layout with live preview and locked items showing badge requirements
- Preview should show a representative snapshot of the theme (not just a color swatch) -- how the app would look

### Claude's Discretion
- Feedback color handling per theme (keep universal green/red or theme-tint them for visual harmony)
- Session wrapper visual approach (borders, backgrounds, card styling, or a mix)
- Ambient animation implementation (Reanimated patterns, performance budget)
- Exact color hex values for each theme palette
- Which badges unlock which themes (distribute across difficulty levels)
- Theme picker preview implementation (screenshots vs live mini-preview)
- Store migration version bump and shape

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| THME-01 | ThemeProvider with React Context for dynamic app-wide color theming | ThemeProvider pattern, `useTheme()` hook, `createThemedStyles` factory, removal of static `colors` export |
| THME-02 | User can select from 3-5 UI color themes (default dark, ocean, forest, sunset, space) | 5 theme palette definitions with 12 color tokens each, `ThemeId` type, `THEMES` constant registry |
| THME-03 | Session cosmetic wrappers add themed context/art around math problems | `SessionWrapper` component with per-theme decorative overlays, Reanimated ambient animations |
| THME-04 | Theme picker screen to preview, equip, and see locked theme requirements | Follows AvatarPickerScreen pattern, live mini-preview, CosmeticDetailOverlay reuse |
| THME-05 | Themes unlocked via achievement badges | Badge-to-theme mapping in `THEMES` constant, `isCosmeticUnlocked` reuse, `getCosmeticUnlockText` extension |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Context | built-in | Theme color delivery | Native React API, re-renders all consumers on change -- exactly what we want for instant theme switching |
| react-native-reanimated | existing | Session wrapper ambient animations | Already used for sparkle, badge popup, confetti animations in project |
| Zustand | existing | Persist equipped themeId | Already the state management solution, extends childProfileSlice |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react-native | existing | Theme picker icons (Lock, Palette, etc.) | Icon needs in picker screen |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Context | Zustand selector for colors | Context re-renders are desired here (theme change = repaint everything), Zustand selector would fight against this |
| Per-component useMemo styles | StyleSheet.create with dynamic values | StyleSheet.create runs once at module load, cannot accept runtime values -- useMemo is the correct pattern for dynamic styles |

**Installation:**
No new dependencies required. All tools are already in the project.

## Architecture Patterns

### Recommended Project Structure
```
src/
  theme/
    index.ts           # ThemeProvider, useTheme hook, spacing/typography/layout exports (static)
    colors.ts          # Theme palette definitions (THEMES constant, ThemeId type, ThemeColors type)
    sessionWrappers.ts # Per-theme session wrapper config (animation params, decorative elements)
  store/
    constants/
      themes.ts        # THEME_COSMETICS: badge-to-theme mapping (like avatars.ts pattern)
    slices/
      childProfileSlice.ts  # Add themeId field
  components/
    session/
      SessionWrapper.tsx    # Decorative ambient wrapper during math sessions
  screens/
    ThemePickerScreen.tsx   # Theme selection with preview
```

### Pattern 1: ThemeProvider with useTheme Hook
**What:** React Context provider wrapping the app, delivering current theme colors
**When to use:** Every component that needs color values
**Example:**
```typescript
// theme/colors.ts
export type ThemeId = 'dark' | 'ocean' | 'forest' | 'sunset' | 'space';

export interface ThemeColors {
  background: string;
  backgroundLight: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  correct: string;
  incorrect: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export const THEMES: Record<ThemeId, ThemeColors> = {
  dark: { /* current colors from theme/index.ts */ },
  ocean: { /* blue/teal palette */ },
  forest: { /* green/earth palette */ },
  sunset: { /* orange/warm palette */ },
  space: { /* deep purple/cosmic palette */ },
};

// theme/index.ts
const ThemeContext = createContext<ThemeColors>(THEMES.dark);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeId = useAppStore((s) => s.themeId) ?? 'dark';
  const colors = THEMES[themeId] ?? THEMES.dark;
  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return { colors: useContext(ThemeContext) };
}

// Keep spacing, typography, layout as static exports (unchanged)
export { spacing, typography, layout };
```

### Pattern 2: Dynamic Style Factory (createThemedStyles replacement for StyleSheet.create)
**What:** useMemo-cached style generation from theme colors
**When to use:** Every component migrated from static StyleSheet.create with color references
**Example:**
```typescript
// Before (static -- breaks with dynamic themes):
const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
});

// After (dynamic -- theme-aware):
export default function MyScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: { backgroundColor: colors.background },
  }), [colors]);

  return <View style={styles.container} />;
}
```

### Pattern 3: Session Wrapper Component
**What:** Decorative ambient overlay wrapping session content per equipped theme
**When to use:** SessionScreen only, renders behind/around math problems
**Example:**
```typescript
// Wrapper renders decorative elements around children
function SessionWrapper({ themeId, children }: Props) {
  // Each theme defines its own decorative elements
  // Ocean: floating bubble circles with slow drift
  // Forest: gently swaying leaf shapes
  // Sunset: warm gradient bars
  // Space: twinkling dot stars
  // Dark: subtle particle float
  return (
    <View style={styles.wrapper}>
      <ThemeDecoration themeId={themeId} />
      {children}
    </View>
  );
}
```

### Pattern 4: Theme Cosmetic Constants (follows avatars.ts pattern)
**What:** THEME_COSMETICS array with badgeId for unlock gating
**When to use:** Theme picker, badge unlock popup, getCosmeticUnlockText
**Example:**
```typescript
export const THEME_COSMETICS = [
  { id: 'ocean', label: 'Ocean', emoji: '\u{1F30A}', badgeId: 'mastery.grade.1' },
  { id: 'forest', label: 'Forest', emoji: '\u{1F332}', badgeId: 'behavior.streak.gold' },
  { id: 'sunset', label: 'Sunset', emoji: '\u{1F305}', badgeId: 'behavior.sessions.gold' },
  { id: 'space', label: 'Space', emoji: '\u{1F680}', badgeId: 'behavior.challenge.perfect' },
] as const;
```

### Anti-Patterns to Avoid
- **Inline style objects for colors:** Use useMemo + StyleSheet.create, not raw `{{ backgroundColor: colors.x }}` -- React Native optimizes StyleSheet objects
- **Colors in component props as default values:** Don't `color = '#1a1a2e'` -- always go through `useTheme()`
- **Theme-aware StyleSheet at module level:** StyleSheet.create at module scope cannot access React Context -- must be inside component/hook
- **Heavy session wrapper animations:** Keep ambient animations under 5 animated nodes, use `useAnimatedStyle` not `withTiming` in render, target >55fps

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence | Custom AsyncStorage logic | Zustand persist (existing) + themeId in childProfileSlice | Already handles serialization, rehydration, migrations |
| Cosmetic unlock checks | New unlock system | `isCosmeticUnlocked(badgeId, earnedBadges)` from avatars.ts | Exact same badge-gating pattern, reuse existing function |
| Badge unlock text | New text generator | Extend `getCosmeticUnlockText` to check THEME_COSMETICS | Same pattern as avatars and frames |
| Animation loops | Manual Animated.loop | Reanimated `withRepeat(withTiming(...))` | Project already uses this pattern in AvatarCircle sparkle |

**Key insight:** The cosmetic unlock infrastructure from Phase 36 (isCosmeticUnlocked, getCosmeticUnlockText, CosmeticDetailOverlay) is directly reusable. Theme unlocking is architecturally identical to avatar/frame unlocking.

## Common Pitfalls

### Pitfall 1: StyleSheet.create at Module Scope with Dynamic Colors
**What goes wrong:** Colors from useTheme() are not available at module scope. StyleSheet.create runs once at import time.
**Why it happens:** 52 files currently use `const styles = StyleSheet.create({ ... colors.X ... })` at module level.
**How to avoid:** Move StyleSheet.create inside the component, wrap with `useMemo(() => StyleSheet.create({...}), [colors])`. The `colors` object reference changes only on theme switch, so memoization is efficient.
**Warning signs:** Colors don't update when switching themes = missed migration.

### Pitfall 2: Performance Regression from Re-renders
**What goes wrong:** ThemeProvider context change re-renders all consumers. If 50+ components subscribe, theme switch could cause a visible stutter.
**Why it happens:** React Context re-renders all consumers when value changes.
**How to avoid:** Theme switching is infrequent (user action in picker screen). The re-render is desired and acceptable. useMemo on styles prevents unnecessary StyleSheet recreation within the same theme. Do NOT try to optimize away re-renders here.
**Warning signs:** Premature optimization with useRef/memo to prevent theme re-renders -- this defeats the purpose.

### Pitfall 3: Navigator contentStyle Hardcoded Color
**What goes wrong:** `AppNavigator.tsx` line 21 has `contentStyle: { backgroundColor: '#1a1a2e' }` hardcoded. Theme switch won't affect navigation transition backgrounds.
**Why it happens:** Navigator options are set once, not reactive to Context.
**How to avoid:** Use `useTheme()` inside AppNavigator and pass colors dynamically to screenOptions. AppNavigator must be a child of ThemeProvider.
**Warning signs:** Flash of default dark background during screen transitions when using a non-dark theme.

### Pitfall 4: Missing Migration for Existing Users
**What goes wrong:** Existing users have no themeId in store. App crashes or shows undefined colors.
**Why it happens:** Store version not bumped or migration not added.
**How to avoid:** STORE_VERSION 11 -> 12, migration adds `state.themeId ??= 'dark'`. ThemeProvider also falls back: `THEMES[themeId] ?? THEMES.dark`.
**Warning signs:** Any code path that assumes themeId is always defined without fallback.

### Pitfall 5: Feedback Colors Losing Accessibility
**What goes wrong:** If correct/incorrect colors are theme-tinted, they may lose their universal green=right/red=wrong meaning.
**Why it happens:** Over-styling feedback for visual harmony.
**How to avoid:** Recommendation: Keep `correct` and `incorrect` as universal colors (#84cc16 / #f87171) across all themes. These are feedback signals that must be instantly recognizable. Only backgrounds, surfaces, primary accent, and text colors should change per theme.
**Warning signs:** User confusion about right/wrong answers.

### Pitfall 6: Session Wrapper Distracting from Math
**What goes wrong:** Animated decorative elements draw child's attention away from the math problem.
**Why it happens:** Making animations too fast, too bright, or too prominent.
**How to avoid:** Animation cycles of 4-8 seconds (very slow). Low opacity (0.1-0.3). Position elements at screen edges only. No animation near the problem area or answer buttons. Use `pointerEvents="none"` on wrapper overlay.
**Warning signs:** Any animation completing a full cycle in under 3 seconds is too fast.

## Code Examples

### Theme Color Palettes (Discretion: recommended hex values)

```typescript
// Confidence: MEDIUM -- color choices are aesthetic, these are starting points
export const THEMES: Record<ThemeId, ThemeColors> = {
  dark: {
    background: '#1a1a2e',
    backgroundLight: '#16213e',
    surface: '#0f3460',
    surfaceLight: '#1a4a7a',
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
  },
  ocean: {
    background: '#0a1628',
    backgroundLight: '#0d2137',
    surface: '#0c3547',
    surfaceLight: '#115566',
    primary: '#22d3ee',
    primaryLight: '#67e8f9',
    primaryDark: '#06b6d4',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#f0f9ff',
    textSecondary: '#bae6fd',
    textMuted: '#7dd3fc',
  },
  forest: {
    background: '#0f1a0f',
    backgroundLight: '#1a2e1a',
    surface: '#1e3a1e',
    surfaceLight: '#2d5a2d',
    primary: '#4ade80',
    primaryLight: '#86efac',
    primaryDark: '#22c55e',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#f0fdf4',
    textSecondary: '#bbf7d0',
    textMuted: '#6ee7b7',
  },
  sunset: {
    background: '#1a0f0a',
    backgroundLight: '#2e1a10',
    surface: '#3d2214',
    surfaceLight: '#5c3520',
    primary: '#fb923c',
    primaryLight: '#fdba74',
    primaryDark: '#f97316',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#fff7ed',
    textSecondary: '#fed7aa',
    textMuted: '#fdba74',
  },
  space: {
    background: '#0f0a1a',
    backgroundLight: '#1a1030',
    surface: '#2a1a4a',
    surfaceLight: '#3d2a6a',
    primary: '#a78bfa',
    primaryLight: '#c4b5fd',
    primaryDark: '#8b5cf6',
    correct: '#84cc16',
    incorrect: '#f87171',
    textPrimary: '#f5f3ff',
    textSecondary: '#ddd6fe',
    textMuted: '#a78bfa',
  },
};
```

### Store Migration (v11 -> v12)

```typescript
// In migrations.ts
if (version < 12) {
  // v11 -> v12: Add theme selection to child profile
  state.themeId ??= 'dark';
}
```

### Badge-to-Theme Mapping (Discretion: distributed across difficulty levels)

```typescript
// Available badges not used by avatars or frames (20 remaining from 31 total)
// Need 4 for themes. Distribute across difficulty:
// Easy:   mastery.grade.1 (Grade 1 Graduate)           -> Ocean
// Medium: behavior.streak.gold (8-week streak)          -> Forest
// Medium: behavior.sessions.gold (100 sessions)         -> Sunset
// Hard:   behavior.challenge.perfect (perfect 10/10)    -> Space

export const THEME_COSMETICS = [
  { id: 'ocean' as const, label: 'Ocean', emoji: '\u{1F30A}', badgeId: 'mastery.grade.1' },
  { id: 'forest' as const, label: 'Forest', emoji: '\u{1F332}', badgeId: 'behavior.streak.gold' },
  { id: 'sunset' as const, label: 'Sunset', emoji: '\u{1F305}', badgeId: 'behavior.sessions.gold' },
  { id: 'space' as const, label: 'Space', emoji: '\u{1F680}', badgeId: 'behavior.challenge.perfect' },
] as const;
```

### Session Wrapper Animation Pattern

```typescript
// Reanimated pattern for slow ambient animation (existing project pattern)
const translateY = useSharedValue(0);

useEffect(() => {
  translateY.value = withRepeat(
    withTiming(20, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
    -1, // infinite
    true, // reverse
  );
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: translateY.value }],
  opacity: 0.15, // very subtle
}));
```

### ThemeProvider Placement in App.tsx

```typescript
// ThemeProvider must wrap NavigationContainer so AppNavigator can use useTheme()
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static color exports | React Context ThemeProvider | This phase | All 52 color-consuming files must migrate |
| StyleSheet.create at module scope with colors | useMemo + StyleSheet.create inside components | This phase | Style generation moves to render time, cached per theme |
| Hardcoded `#1a1a2e` in AppNavigator | Dynamic contentStyle from useTheme() | This phase | Navigation transitions match active theme |

## Migration Scope

52 files import from `@/theme` and reference `colors`. Full list:

**Screens (8):** HomeScreen, SessionScreen, ResultsScreen, SandboxScreen, ConsentScreen, BadgeCollectionScreen, SkillMapScreen, AvatarPickerScreen

**Components (44):** Header, SessionHeader, CpaSessionContent, CompactAnswerRow, CpaModeIcon, ManipulativePanel, ChatPanel, ChatBubble, ChatBanner, ChatMessageList, HelpButton, ResponseButtons, TypingIndicator, ConfettiCelebration, BadgeUnlockPopup, AvatarCircle, CosmeticDetailOverlay, BadgeGrid, BadgeIcon, BadgesSummary, BadgeDetailOverlay, SkillMapGraph, SkillDetailOverlay, SandboxTooltip, ExploreGrid, ExploreCard, DailyChallengeCard, TenFrame, ManipulativeShell, FractionStrips, BaseTenBlocks, Counters, CountersGrid, CountersParts, BarModel, BarModelParts, NumberPicker, TenFrameDiagram, NumberLineDiagram, PictorialDiagram, FractionStripsDiagram, CountersDiagram, BaseTenBlocksDiagram, BarModelDiagram

**Navigation (1):** AppNavigator (hardcoded `#1a1a2e`)

This migration is mechanical but large. Must be split across multiple plans.

## Open Questions

1. **Theme picker preview fidelity**
   - What we know: User wants "representative snapshot of the theme, not just a color swatch"
   - What's unclear: Whether to render a live mini-preview of UI elements or use pre-rendered illustrations
   - Recommendation: Live mini-preview showing a mock "card" with the theme's background, surface, primary, and text colors in a small layout. Simpler than screenshots, more representative than swatches.

2. **StatusBar style per theme**
   - What we know: Currently `<StatusBar style="light" />` in App.tsx
   - What's unclear: Whether any theme needs `style="dark"` (unlikely since all themes are dark backgrounds)
   - Recommendation: Keep `style="light"` for all themes since all 5 are dark-background themes.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| THME-01 | ThemeProvider delivers colors via useTheme | unit | `npm test -- --testPathPattern=theme` | No - Wave 0 |
| THME-02 | 5 theme palettes defined with 12 color tokens each | unit | `npm test -- --testPathPattern=theme` | No - Wave 0 |
| THME-03 | SessionWrapper renders themed ambient decoration | unit | `npm test -- --testPathPattern=SessionWrapper` | No - Wave 0 |
| THME-04 | ThemePickerScreen shows themes, preview, locked state | unit | `npm test -- --testPathPattern=ThemePickerScreen` | No - Wave 0 |
| THME-05 | Theme unlock gated by badge ownership | unit | `npm test -- --testPathPattern=themes` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<relevant_pattern>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + `npm run typecheck` clean

### Wave 0 Gaps
- [ ] `src/__tests__/gamification/themeDefinitions.test.ts` -- covers THME-02, THME-05
- [ ] `src/__tests__/components/ThemeProvider.test.tsx` -- covers THME-01
- [ ] `src/__tests__/components/SessionWrapper.test.tsx` -- covers THME-03
- [ ] `src/__tests__/screens/ThemePickerScreen.test.tsx` -- covers THME-04
- [ ] `src/__tests__/store/themeIdMigration.test.ts` -- covers store migration v12

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/theme/index.ts` -- current static color system (12 tokens)
- Project codebase: `src/store/constants/avatars.ts` -- cosmetic unlock pattern (badgeId gating, isCosmeticUnlocked, getCosmeticUnlockText)
- Project codebase: `src/screens/AvatarPickerScreen.tsx` -- picker screen pattern (sectioned, preview, locked overlay)
- Project codebase: `src/store/migrations.ts` -- migration chain pattern (STORE_VERSION 11, sequential `if (version < N)`)
- Project codebase: `src/store/slices/childProfileSlice.ts` -- profile slice extension point
- Project codebase: `App.tsx` -- provider nesting order for ThemeProvider placement
- Project codebase: `src/services/achievement/badgeRegistry.ts` -- 31 badges, 11 used by avatars/frames, 20 available for themes

### Secondary (MEDIUM confidence)
- React Context documentation -- provider/consumer pattern, re-render behavior
- React Native StyleSheet.create -- module-scope limitation with dynamic values

### Tertiary (LOW confidence)
- Theme hex color values -- aesthetic choices, need visual validation on device

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns established in project
- Architecture: HIGH -- ThemeProvider + Context is the standard React pattern for dynamic theming
- Pitfalls: HIGH -- identified from direct codebase analysis (52 file migration, hardcoded navigator color, StyleSheet.create limitations)
- Color palettes: MEDIUM -- hex values are aesthetic choices that may need tuning
- Session wrapper animations: MEDIUM -- performance characteristics need device validation

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable -- no external dependency changes expected)
