# Phase 1: Project Scaffolding & Navigation - Research

**Researched:** 2026-03-01
**Domain:** Expo 54 project scaffold, React Navigation 7 native-stack, Zustand 5 store with slices, theme system, font loading
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Store Slice Structure:**
- 4 domain slices: childProfile, skillStates, sessionState, gamification
- Single appStore.ts composes all slices via spread (one createStore() call)
- No persistence middleware in Phase 1 -- added in Phase 4
- Types co-located in each slice file (not centralized in src/types/)
- Store version tracking in appStore.ts for future migrations

**Navigation Structure:**
- Stack-only navigation (native-stack) -- no tabs for v0.1
- Screen file organization: flat in src/screens/ (HomeScreen.tsx, SessionScreen.tsx, ResultsScreen.tsx)
- Navigator config in src/navigation/AppNavigator.tsx with types in navigation/types.ts
- Platform default transitions (iOS slide, Android fade)
- Results screen: "Done" button resets stack to Home (prevents back-to-session)

**App Shell & Theme:**
- Theme constants in src/theme/index.ts -- colors, spacing, typography as single source of truth
- Color palette: deep navy backgrounds (#1a1a2e family), bright accents for feedback
  - Primary: indigo (#6366f1)
  - Correct: bright green/yellow
  - Incorrect: soft coral (not punishing red)
  - Text: high contrast white/light on dark
- Minimal providers for v0.1: SafeAreaProvider + NavigationContainer + StatusBar config
- Load Lexend font via expo-font in App.tsx from Phase 1 (dyslexia-friendly, UX research)

**Placeholder Screens:**
- Styled dark-themed shells (not minimal text) -- validates theme + navigation together
- Home screen: big central "Start Practice" button (prominent, clear primary action)
- Custom header component (hide default React Navigation header) -- child-friendly styling
- No header on session/results screens -- immersive feel during practice

### Claude's Discretion

- Exact spacing values and typography scale in theme
- SafeAreaView wrapping approach
- Loading/splash screen behavior during font load
- Jest test subject (store, navigation, or component)
- Error boundary inclusion/exclusion

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STOR-05 | Zustand store uses domain slices pattern (child profile, skill states, session, gamification) | Zustand 5 slices pattern with StateCreator typing; sister project appStore.ts pattern; compose via spread in single create() call |
| NAV-01 | React Navigation native-stack with Home -> Session -> Results flow | React Navigation 7 native-stack with typed RootStackParamList; CommonActions.reset for Results->Home; headerShown: false per screen |

</phase_requirements>

## Summary

This phase bootstraps the Tiny Tallies app from an empty src/ directory to a running Expo 54 application with navigation, state management skeleton, and visual theme. The project already has comprehensive infrastructure: package.json with all dependencies installed, tsconfig.json with strict mode and @/ path alias, jest.config.js with jest-expo preset, jest.setup.js with 256 lines of mocks (including React Navigation, Reanimated, and gesture handler mocks), app.json configured for dark mode, and index.tsx as the entry point importing ./App.

The primary work involves creating: (1) App.tsx as the root component with font loading, SafeAreaProvider, and NavigationContainer, (2) AppNavigator.tsx with typed native-stack for Home/Session/Results screens, (3) appStore.ts composing four empty domain slices via Zustand 5's StateCreator pattern, (4) src/theme/index.ts with the dark navy color palette and typography scale, and (5) three styled placeholder screens. The sister project tiny-tales provides a proven reference implementation for the store composition and navigation patterns.

**Primary recommendation:** Follow the tiny-tales sister project patterns exactly for store composition (StateCreator with slice spread) and navigation (createNativeStackNavigator with typed ParamList), adapting for Tiny Tallies' four domain slices and three-screen stack.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | ~54.0.25 | Managed workflow framework | Already installed, project foundation |
| react-native | 0.81.5 | Mobile framework | Already installed, new architecture enabled |
| react | 19.1.0 | UI library | Already installed |
| @react-navigation/native | ^7.1.22 | Navigation framework | Already installed, CLAUDE.md specifies React Navigation 7 |
| @react-navigation/native-stack | ^7.8.2 | Stack navigator | Already installed, best performance for screen transitions |
| zustand | ^5.0.8 | State management | Already installed, CLAUDE.md specifies Zustand with domain slices |
| typescript | ~5.9.2 | Type safety | Already installed, strict mode in tsconfig.json |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @expo-google-fonts/lexend | ^0.4.1 | Dyslexia-friendly font | Font loading in App.tsx, already installed |
| expo-font | ~14.0.9 | Font loading API | useFonts hook, already installed |
| expo-splash-screen | ~31.0.11 | Splash control during load | Keep splash visible during font loading, already installed |
| expo-status-bar | ~3.0.8 | Status bar styling | Light content on dark background, already installed |
| react-native-safe-area-context | ~5.6.0 | Safe area insets | SafeAreaProvider at root, already installed |
| react-native-screens | ~4.16.0 | Native screen optimization | Required by native-stack navigator, already installed |
| lucide-react-native | ^0.554.0 | Icons | Any icons in placeholder screens, already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| native-stack | stack (JS-based) | native-stack has better perf + native transitions; stack offers more customization. Use native-stack per CLAUDE.md. |
| Zustand slices | Zustand single store | Slices enable modular growth across 8 phases; single store hits 500-line limit fast. Slices mandated by CLAUDE.md. |
| StyleSheet.create | Inline styles | StyleSheet.create is mandated by CLAUDE.md; provides validation and deduplication |

**Installation:** All dependencies are already installed. No new packages needed for Phase 1.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── __tests__/           # Test files (existing empty dir)
├── components/          # Shared components (existing empty dir)
├── hooks/               # Custom hooks (existing empty dir)
├── navigation/
│   ├── AppNavigator.tsx # Stack navigator with screens
│   └── types.ts         # RootStackParamList type definition
├── screens/
│   ├── HomeScreen.tsx   # "Start Practice" button, dark themed
│   ├── SessionScreen.tsx # Placeholder session view
│   └── ResultsScreen.tsx # Summary placeholder with "Done" button
├── services/            # Domain logic (existing empty dir, unused Phase 1)
├── store/
│   ├── appStore.ts      # Composed store with version tracking
│   └── slices/
│       ├── childProfileSlice.ts  # Name, age, grade, avatar
│       ├── skillStatesSlice.ts   # Per-skill Elo, attempts
│       ├── sessionStateSlice.ts  # Current session tracking
│       └── gamificationSlice.ts  # XP, levels, streaks
├── theme/
│   └── index.ts         # Colors, spacing, typography constants
└── types/               # Shared types (existing empty dir, unused Phase 1)
App.tsx                  # Root component: fonts, providers, navigator
```

### Pattern 1: Zustand 5 Slices Composition (No Persist)
**What:** Each domain slice defined as a StateCreator function. Types co-located in the slice file. Combined store via spread in a single create() call. No persist middleware in Phase 1 -- store is memory-only.
**When to use:** Every store slice in this project.
**Example:**
```typescript
// src/store/slices/childProfileSlice.ts
import type { StateCreator } from 'zustand';

// Types co-located in slice file (per CONTEXT.md decision)
export interface ChildProfileSlice {
  childName: string | null;
  childAge: number | null;
  childGrade: number | null;
  avatarId: string | null;
  setChildProfile: (profile: Partial<Pick<ChildProfileSlice, 'childName' | 'childAge' | 'childGrade' | 'avatarId'>>) => void;
}

// AppState is the combined type of all slices
import type { AppState } from '../appStore';

export const createChildProfileSlice: StateCreator<
  AppState,
  [],
  [],
  ChildProfileSlice
> = (set) => ({
  childName: null,
  childAge: null,
  childGrade: null,
  avatarId: null,
  setChildProfile: (profile) => set((state) => ({ ...state, ...profile })),
});
```

```typescript
// src/store/appStore.ts
import { create } from 'zustand';
import { createChildProfileSlice, type ChildProfileSlice } from './slices/childProfileSlice';
import { createSkillStatesSlice, type SkillStatesSlice } from './slices/skillStatesSlice';
import { createSessionStateSlice, type SessionStateSlice } from './slices/sessionStateSlice';
import { createGamificationSlice, type GamificationSlice } from './slices/gamificationSlice';

// Combined type -- intersection of all slices
export type AppState = ChildProfileSlice & SkillStatesSlice & SessionStateSlice & GamificationSlice;

// Current store version -- increment + add migration when changing schema
export const STORE_VERSION = 1;

export const useAppStore = create<AppState>()(
  (...a) => ({
    ...createChildProfileSlice(...a),
    ...createSkillStatesSlice(...a),
    ...createSessionStateSlice(...a),
    ...createGamificationSlice(...a),
  })
);
```

**Note on circular imports:** The AppState type is defined in appStore.ts. Slices import it for the StateCreator generic. This creates a circular reference. The sister project (tiny-tales) solves this by defining the combined type in a separate store/types.ts file. However, the CONTEXT.md decision says "types co-located in each slice file." To resolve this, define AppState in appStore.ts and import it in slice files -- TypeScript handles this type-only circular import because types are erased at compile time.

### Pattern 2: Typed React Navigation 7 Native-Stack
**What:** Define RootStackParamList as a type alias (not interface), pass to createNativeStackNavigator generic, use NativeStackScreenProps for screen component props.
**When to use:** All navigation setup.
**Example:**
```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Session: undefined;  // Will get params in Phase 6
  Results: undefined;  // Will get params in Phase 6
};

// Global declaration for useNavigation type inference
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import HomeScreen from '@/screens/HomeScreen';
import SessionScreen from '@/screens/SessionScreen';
import ResultsScreen from '@/screens/ResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
    </Stack.Navigator>
  );
}
```

### Pattern 3: Stack Reset from Results to Home
**What:** Use CommonActions.reset to clear the back stack when returning from Results to Home, preventing the user from navigating back to a completed session.
**When to use:** Results screen "Done" button.
**Example:**
```typescript
// In ResultsScreen.tsx
import { CommonActions, useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

const handleDone = () => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    })
  );
};
```

### Pattern 4: Font Loading with Splash Screen
**What:** Load Lexend fonts in App.tsx using useFonts hook, keep splash screen visible until fonts are ready.
**When to use:** App root component.
**Example:**
```typescript
// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '@/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

### Pattern 5: Theme Constants
**What:** Centralized theme object with colors, spacing scale, typography in src/theme/index.ts.
**When to use:** All styled components reference theme constants.
**Example:**
```typescript
// src/theme/index.ts
import { StyleSheet } from 'react-native';

export const colors = {
  // Backgrounds
  background: '#1a1a2e',
  backgroundLight: '#16213e',
  surface: '#0f3460',
  surfaceLight: '#1a4a7a',

  // Primary
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',

  // Feedback
  correct: '#84cc16',      // Bright green/yellow
  incorrect: '#f87171',    // Soft coral (not punishing red)

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Lexend_400Regular',
    medium: 'Lexend_500Medium',
    semiBold: 'Lexend_600SemiBold',
    bold: 'Lexend_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 48,
  },
} as const;

export const layout = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  minTouchTarget: 48, // 48dp minimum for ages 6-9 motor skills (UI-04)
} as const;
```

### Anti-Patterns to Avoid
- **Adding state directly to appStore.ts:** CLAUDE.md mandates slices only. Never put state/actions directly in the composed store except resetAll.
- **Using React Navigation's interface instead of type for ParamList:** Must be a `type` alias, not `interface`. TypeScript will fail to infer params properly with an interface.
- **Inline styles in render:** CLAUDE.md requires `StyleSheet.create`. Always define styles outside component render.
- **Barrel imports from node_modules:** Per skill reference bundle-barrel-exports.md, import directly from specific paths where possible. However, for project internal modules, CLAUDE.md recommends barrel exports (index.ts) for refactored modules -- use them sparingly and only for re-exporting the module's public API.
- **Importing fonts you don't need:** Load only the Lexend weights actually used (Regular, Medium, SemiBold, Bold). Don't load all 9 weights.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Safe area insets | Custom platform detection | `react-native-safe-area-context` SafeAreaProvider + useSafeAreaInsets | Handles notch, Dynamic Island, navigation bars across all devices |
| Navigation transitions | Custom animated transitions | React Navigation native-stack default animations | Native platform transitions are faster and feel correct |
| Font loading state | Custom async font loader | `useFonts` hook from @expo-google-fonts/lexend | Handles loading/error states, integrates with expo-splash-screen |
| Splash screen timing | setTimeout or manual delays | `expo-splash-screen` preventAutoHideAsync/hideAsync | Proper native splash screen control, no flash of unstyled content |
| Stack reset | Manual history manipulation | `CommonActions.reset` from @react-navigation/native | Properly clears navigation state without memory leaks |

**Key insight:** All UI infrastructure libraries are already installed. Phase 1 is purely about wiring them together correctly -- zero npm installs needed.

## Common Pitfalls

### Pitfall 1: NavigationContainer Outside SafeAreaProvider
**What goes wrong:** Safe area insets are unavailable inside navigation screens, causing content to render behind notches and home indicators.
**Why it happens:** NavigationContainer must be a child of SafeAreaProvider to access inset data.
**How to avoid:** Provider ordering in App.tsx: `SafeAreaProvider > NavigationContainer > AppNavigator`.
**Warning signs:** Content clipped at top/bottom on devices with notches.

### Pitfall 2: Circular Type Import in Zustand Slices
**What goes wrong:** TypeScript error or runtime crash when slices import AppState from appStore.ts and appStore.ts imports slices.
**Why it happens:** Zustand slices need the combined AppState type for the StateCreator generic first parameter.
**How to avoid:** TypeScript handles type-only circular imports fine because types are erased at compile time. Use `import type { AppState }` in slice files. Alternatively, define a shared `AppState` type in a separate file. The sister project uses store/types.ts for this.
**Warning signs:** "Cannot access before initialization" runtime errors, or TypeScript compilation hanging.

### Pitfall 3: Missing Global ReactNavigation Type Declaration
**What goes wrong:** useNavigation() hook has no type information, requiring manual type annotations on every usage.
**Why it happens:** React Navigation's global type augmentation is skipped.
**How to avoid:** Add `declare global { namespace ReactNavigation { interface RootParamList extends RootStackParamList {} } }` in navigation/types.ts.
**Warning signs:** Every navigation.navigate() call requires explicit type casting.

### Pitfall 4: SplashScreen.preventAutoHideAsync Not Called at Module Level
**What goes wrong:** Splash screen flashes and hides before fonts load, showing unstyled content.
**Why it happens:** Calling preventAutoHideAsync inside a component effect is too late -- the splash may have already been hidden by the framework.
**How to avoid:** Call `SplashScreen.preventAutoHideAsync()` at module scope (top level of App.tsx), not inside useEffect.
**Warning signs:** Brief flash of white/unstyled screen on app launch.

### Pitfall 5: Using Interface Instead of Type for ParamList
**What goes wrong:** Navigation params are not correctly inferred, losing type safety.
**Why it happens:** React Navigation requires a `type` alias for the param list mapping. Interfaces cannot be used due to TypeScript's structural typing differences.
**How to avoid:** Always use `type RootStackParamList = { ... }` not `interface RootStackParamList { ... }`.
**Warning signs:** TypeScript errors about incompatible types when navigating, or params always typed as `object | undefined`.

### Pitfall 6: Forgetting to Export Slice Types
**What goes wrong:** AppState type is incomplete, leading to missing properties in selectors.
**Why it happens:** Slice interface is defined but not exported, so it can't be composed into AppState.
**How to avoid:** Every slice file must export both the slice interface and the createXSlice function.
**Warning signs:** TypeScript errors on `useAppStore(s => s.childName)` -- property not found.

### Pitfall 7: Store Version Without Migration Registry
**What goes wrong:** Future persist middleware (Phase 4) requires version tracking from the start.
**Why it happens:** Version is forgotten and defaults to 0, making it impossible to know which migrations to run.
**How to avoid:** Set `STORE_VERSION = 1` in appStore.ts from Phase 1, even without persist. Add a comment about incrementing + adding migrations per CLAUDE.md guardrail.
**Warning signs:** No version constant in appStore.ts.

## Code Examples

Verified patterns from official sources and sister project:

### Screen Component with Theme and Navigation
```typescript
// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, layout } from '@/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Tiny Tallies</Text>
      <Pressable
        style={styles.startButton}
        onPress={() => navigation.navigate('Session')}
      >
        <Text style={styles.startButtonText}>Start Practice</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.display,
    color: colors.textPrimary,
    marginBottom: spacing.xxl,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: layout.borderRadius.lg,
    minHeight: layout.minTouchTarget,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xl,
    color: colors.textPrimary,
  },
});
```

### Zustand Store Test
```typescript
// src/__tests__/appStore.test.ts
import { useAppStore } from '@/store/appStore';

describe('appStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('should initialize with all domain slices', () => {
    const state = useAppStore.getState();

    // Child profile slice
    expect(state.childName).toBeNull();

    // Skill states slice
    expect(state.skillStates).toEqual({});

    // Session state slice
    expect(state.isSessionActive).toBe(false);

    // Gamification slice
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
  });

  it('should update child profile via setChildProfile', () => {
    useAppStore.getState().setChildProfile({ childName: 'Alex', childAge: 7 });
    const state = useAppStore.getState();
    expect(state.childName).toBe('Alex');
    expect(state.childAge).toBe(7);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Navigation 6 + manual typing | React Navigation 7 with static API + global type augmentation | 2024 (RN 7.0) | Less boilerplate, better type inference |
| Zustand v4 `create<T>()(...)` | Zustand v5 same API, improved TS | 2024 (Zustand 5.0) | Same syntax, better middleware typing |
| expo-app-loading (deprecated) | expo-splash-screen preventAutoHideAsync | Expo SDK 46+ | Direct splash control, no wrapper component |
| React Navigation header customization | headerShown: false + custom component | Consistent in v7 | Full control over child-friendly header design |

**Deprecated/outdated:**
- `expo-app-loading`: Replaced by expo-splash-screen's preventAutoHideAsync pattern
- React Navigation's `createStackNavigator` (JS-based): Superseded by `createNativeStackNavigator` for better performance
- `SafeAreaView` from `react-native`: Use `react-native-safe-area-context` instead (proper cross-platform support)

## Open Questions

1. **Theme: Exact Spacing and Typography Scale**
   - What we know: CONTEXT.md specifies deep navy backgrounds, indigo primary, specific feedback colors
   - What's unclear: Exact spacing values (4/8/16/24/32/48 suggested) and font size scale
   - Recommendation: Use the standard 4px grid (xs:4, sm:8, md:16, lg:24, xl:32, xxl:48) and modular type scale. These are Claude's discretion per CONTEXT.md -- recommend the values in the Pattern 5 example.

2. **Jest Test Subject**
   - What we know: "At least one passing test" is a success criterion. CONTEXT.md leaves test subject to Claude's discretion.
   - What's unclear: Whether to test store, navigation, or component
   - Recommendation: Test the Zustand store (appStore) -- it's the most testable unit without rendering. The jest.setup.js already mocks React Navigation, so navigation tests are also viable but more complex. Store test is highest value for verifying slice composition works.

3. **Error Boundary Inclusion**
   - What we know: Sister project wraps each screen with `withErrorBoundary()`. CONTEXT.md leaves this to discretion.
   - What's unclear: Whether to add error boundaries in Phase 1 or defer
   - Recommendation: Defer to a later phase. Phase 1 placeholder screens have no error-prone logic. Adding error boundaries now adds complexity without value. The sister project's pattern (`withErrorBoundary` HOC) is available as a reference when needed.

4. **SafeAreaView Wrapping Approach**
   - What we know: SafeAreaProvider at root. Individual screens need safe area handling.
   - What's unclear: Whether to use SafeAreaView component or useSafeAreaInsets hook
   - Recommendation: Use the `useSafeAreaInsets()` hook in each screen -- it gives explicit control over which edges get padding. This matches React Navigation's recommendation and allows the Home screen to have custom header positioning while Session/Results screens are immersive. Avoid the SafeAreaView component as it applies padding to all edges uniformly.

## Sources

### Primary (HIGH confidence)
- [React Navigation 7 TypeScript docs](https://reactnavigation.org/docs/typescript/) - ParamList typing, NativeStackScreenProps, global type augmentation
- [React Navigation 7 native-stack docs](https://reactnavigation.org/docs/native-stack-navigator/) - screenOptions, headerShown, contentStyle, animation
- [React Navigation CommonActions](https://reactnavigation.org/docs/navigation-actions/) - reset pattern for stack clearing
- [Zustand slices pattern (DeepWiki)](https://deepwiki.com/pmndrs/zustand/7.1-slices-pattern) - StateCreator typing, slice composition, cross-slice access
- [Zustand TypeScript integration (DeepWiki)](https://deepwiki.com/pmndrs/zustand/5-typescript-integration) - create<T>()() curried syntax, middleware typing
- [Expo fonts documentation](https://docs.expo.dev/develop/user-interface/fonts/) - useFonts hook, splash screen integration
- [Expo splash-screen docs](https://docs.expo.dev/versions/latest/sdk/splash-screen/) - preventAutoHideAsync, hideAsync API
- [Expo safe-area-context docs](https://docs.expo.dev/versions/latest/sdk/safe-area-context/) - SafeAreaProvider, useSafeAreaInsets
- Sister project tiny-tales: src/store/appStore.ts, src/store/slices/uiSlice.ts, src/navigation/AppNavigator.tsx -- proven patterns

### Secondary (MEDIUM confidence)
- [@expo-google-fonts/lexend GitHub](https://github.com/expo/google-fonts/tree/master/font-packages/lexend) - Font weight names (Lexend_400Regular through Lexend_900Black)
- [React Navigation safe areas guide](https://reactnavigation.org/docs/handling-safe-area/) - useSafeAreaInsets recommendation over SafeAreaView

### Tertiary (LOW confidence)
- None -- all critical findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and version-pinned in package.json. No new dependencies needed.
- Architecture: HIGH - Sister project provides proven reference implementation. Zustand slices and React Navigation patterns are well-documented.
- Pitfalls: HIGH - Verified against official docs and sister project experience. Type-only circular imports confirmed safe in TypeScript.

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable libraries, no breaking changes expected)
