# Phase 33: Badge UI & Session Integration - Research

**Researched:** 2026-03-04
**Domain:** Badge UI components, Reanimated celebration animations, session integration wiring
**Confidence:** HIGH

## Summary

Phase 33 bridges the Phase 32 data layer (badge registry, evaluation engine, achievement store) to the user-facing experience. It requires five deliverables: (1) wiring `evaluateBadges` into the session commit-on-complete flow in `useSession.ts`, (2) passing newly-earned badge IDs as route params to ResultsScreen, (3) a badge celebration popup animation component using Reanimated, (4) a new BadgeCollection screen with categorized grid, and (5) a badge count entry point on HomeScreen. All patterns have direct precedents in the codebase -- route params follow the existing `xpEarned`/`leveledUp`/`cpaAdvances` pattern, animations follow `ConfettiCelebration` and `AnswerFeedbackAnimation`, the new screen follows the AppNavigator registration pattern, and the HomeScreen entry point follows the existing streak/XP stat display pattern.

The key risk is the 500-line guardrail on ResultsScreen (currently 418 lines). Adding a badge section in the stats card plus a badge popup overlay will exceed this limit. The research recommends extracting the badge popup into `components/animations/BadgeUnlockPopup.tsx` and optionally extracting the ResultsScreen badge section into `components/results/BadgesSummary.tsx` to keep ResultsScreen under 500 lines. Similarly, useSession.ts (422 lines) needs badge evaluation wiring added -- this should remain manageable since the addition is approximately 15-20 lines.

**Primary recommendation:** Wire `evaluateBadges` + `addEarnedBadges` + `incrementSessionsCompleted` into the existing `useSession` commit-on-complete block, pass `newBadges: string[]` as route params, build a `BadgeUnlockPopup` animation component in `components/animations/`, create `BadgeCollectionScreen` in `screens/`, and add a badge count pressable to HomeScreen's stats section. Use emoji-in-circle pattern from AVATARS for badge icons (zero asset management).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Badge unlock celebration: Full-screen popup modal overlay with badge icon, name, and description -- centered on screen with dim background, child taps to dismiss
- When multiple badges earned in one session, show each badge popup sequentially -- tap to advance to next badge (max ~3 realistically)
- Badge-specific animation: badge scales up with a glow/shimmer effect, distinct from the ConfettiCelebration used for level-up -- differentiates badge unlock from level up
- Popup appears on the Results screen as an overlay -- navigate to Results first, then show popup(s) overlaid on Results
- Badge collection screen: New screen in navigator (BadgeCollection) accessible from Home screen
- Badges organized in categorized sections with headers: "Skill Mastery", "Category & Grade", "Milestones" (behavior badges) -- matches the 27-badge registry structure
- Locked badges shown fully visible but dimmed (reduced opacity), with requirements text -- child sees what they're working toward
- Tapping a badge shows a detail overlay (bottom sheet or modal) with: badge icon large, name, description, requirement text, earned date or "Not yet earned"
- Badge icons are emoji-based in styled containers (like avatar circles) -- matches existing AVATARS pattern, zero asset management
- Results screen badges: New "Badges Earned" section inside existing stats card, after streak row, before time row
- No badges section when no badges earned -- clean, non-punitive
- "View All Badges" pressable link below badges section navigating to badge collection screen
- Badge evaluation runs during session commit, earned badge IDs passed as route params to Results
- Home screen entry point: Badge count button in stats section showing e.g. "3 / 27 Badges" -- pressable, navigates to badge collection screen
- Count reads directly from Zustand store (earnedBadges)

### Claude's Discretion
- Exact animation timing and easing curves for badge popup
- Badge detail overlay implementation (bottom sheet vs modal)
- Exact emoji assignments per badge category/tier
- Badge grid column count and spacing
- "View All Badges" link styling
- Whether to extract ResultsScreen badge section into a component (file is at 418 lines)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACHV-04 | User earns mastery badges (skill mastered, category complete, grade complete) | Wiring evaluateBadges into useSession commit flow. evaluateBadges already handles all mastery condition types. See Session Integration section. |
| ACHV-05 | User earns behavior badges (streak milestones, session count, remediation victories) | Same wiring -- evaluateBadges checks streak/sessions/remediation conditions. incrementSessionsCompleted must be called before evaluation. See Session Integration section. |
| ACHV-06 | Badge popup animation on unlock with Results screen integration | BadgeUnlockPopup component with Reanimated scale+opacity animation. Sequential display for multi-badge. See Badge Celebration Popup section. |
| ACHV-07 | User can view badge grid showing earned and locked badges with requirements | New BadgeCollectionScreen with categorized sections, dimmed locked badges, detail overlay. See Badge Collection Screen section. |
| ACHV-08 | Results screen displays newly earned badges after session | New badges section in stats card reading newBadges from route params. "View All Badges" link. See Results Screen Integration section. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | Badge popup scale/opacity animations on UI thread | Already used -- ConfettiCelebration, AnswerFeedbackAnimation, ResultsScreen |
| zustand | (existing) | Read earnedBadges from achievementSlice, call addEarnedBadges | Already used -- 8 slices composed in appStore.ts |
| @react-navigation/native-stack | ^7.8.2 | Register BadgeCollection screen | Already used -- AppNavigator.tsx |
| TypeScript | strict mode | Type-safe route params and component props | Project requirement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jest + jest-expo | (existing) | Unit tests for new components, integration wiring | All new code |
| @testing-library/react-native | (existing) | Screen and component render tests | Screen tests |

### Alternatives Considered
None -- this phase uses zero new dependencies. All work uses existing libraries in the project.

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    animations/
      BadgeUnlockPopup.tsx    # Badge celebration overlay (~120 lines)
    badges/
      BadgeIcon.tsx            # Emoji-in-circle badge display (~50 lines)
      BadgeGrid.tsx            # Categorized grid with sections (~100 lines)
      BadgeDetailOverlay.tsx   # Tap-to-view badge detail modal (~80 lines)
      BadgesSummary.tsx        # Results screen badge section (~60 lines)
      index.ts                 # Barrel exports
  screens/
    BadgeCollectionScreen.tsx   # Full badge grid screen (~150 lines)
  navigation/
    types.ts                    # Add newBadges to Results, add BadgeCollection route
    AppNavigator.tsx            # Register BadgeCollection screen
  hooks/
    useSession.ts               # Wire evaluateBadges + addEarnedBadges into commit flow
```

### Pattern 1: Route Params for Session Results (Established)

**What:** Data computed during session commit (XP, level-up, streak, CPA advances) is passed to Results screen via route params. Badge IDs follow this exact pattern.
**When to use:** Passing `newBadges: string[]` from SessionScreen to ResultsScreen.
**Example:**
```typescript
// Source: existing pattern in src/navigation/types.ts + src/hooks/useSession.ts
// In types.ts -- add to Results params:
Results: {
  // ...existing params...
  newBadges?: string[];  // IDs of badges earned this session
};

// In useSession.ts -- after commitSessionResults:
const newBadges = evaluateBadges(snapshot, earnedBadges);
if (newBadges.length > 0) {
  addEarnedBadges(newBadges);
}
// Include in sessionResult for route params
```

### Pattern 2: Animation Overlay Component (from ConfettiCelebration)

**What:** Full-screen overlay with `StyleSheet.absoluteFillObject`, `zIndex: 10+`, using Reanimated shared values for scale/opacity animations. `pointerEvents` controls interactivity.
**When to use:** For the badge unlock popup -- similar positioning to ConfettiCelebration but interactive (tap to dismiss).
**Example:**
```typescript
// Source: pattern from src/components/animations/ConfettiCelebration.tsx
// Badge popup uses same absoluteFillObject overlay, but with pointerEvents="auto"
// (unlike confetti which uses "none") because the popup needs tap-to-dismiss.
<View style={styles.overlay} pointerEvents="auto">
  <Pressable style={styles.backdrop} onPress={onDismiss}>
    <Animated.View style={[styles.badgeCard, animatedStyle]}>
      {/* Badge content */}
    </Animated.View>
  </Pressable>
</View>
```

### Pattern 3: Emoji-in-Circle (from AVATARS)

**What:** Emoji character rendered inside a styled circular container with background color.
**When to use:** For badge icons throughout the app (collection grid, popup, results section).
**Example:**
```typescript
// Source: existing pattern in src/store/constants/avatars.ts + HomeScreen
// AVATARS uses { emoji: '...' } rendered in avatarCircle style
<View style={[styles.badgeCircle, earned ? styles.badgeEarned : styles.badgeLocked]}>
  <Text style={styles.badgeEmoji}>{emoji}</Text>
</View>
```

### Pattern 4: Screen Registration (from AppNavigator)

**What:** New screen added to Stack.Navigator with typed params.
**When to use:** For BadgeCollectionScreen registration.
**Example:**
```typescript
// Source: src/navigation/AppNavigator.tsx
// Add to RootStackParamList in types.ts:
BadgeCollection: undefined;

// Add to AppNavigator.tsx:
<Stack.Screen name="BadgeCollection" component={BadgeCollectionScreen} />
```

### Pattern 5: Component Extraction for File Size (from components/session, components/chat)

**What:** When a screen would exceed 500 lines, extract logical sections into focused components under `components/{domain}/`.
**When to use:** ResultsScreen is at 418 lines. Adding badge section + popup overlay will push past 500. Extract badge-related UI into `components/badges/`.
**Example:**
```typescript
// components/badges/BadgesSummary.tsx
// Receives newBadges: string[] prop, renders badge section in stats card
// Used by ResultsScreen to keep it under 500 lines

// components/animations/BadgeUnlockPopup.tsx
// Receives badges: BadgeDefinition[], onComplete callback
// Renders sequential popup overlay with scale animation
```

### Anti-Patterns to Avoid
- **Inline animation values:** Use `useSharedValue` + `useAnimatedStyle`, not React state for animation values (causes JS thread blocking).
- **Inline style objects:** Use `StyleSheet.create` for all styles (CLAUDE.md guardrail).
- **Reading route params for store truth:** Badge count on HomeScreen reads from `earnedBadges` in store, NOT from route params. Route params are for Results screen only.
- **Coupling badge UI to evaluation logic:** UI components receive badge IDs/definitions as props; they never call `evaluateBadges` directly.
- **Using ConfettiCelebration for badges:** Per user decision, badge animation must be visually distinct (scale+shimmer, not falling particles).
- **File over 500 lines:** Extract components rather than letting screens grow.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Badge evaluation | Custom UI-side evaluation | `evaluateBadges()` from Phase 32 | Pure function already tested, handles all 6 condition types |
| Badge registry lookup | Inline badge data | `getBadgeById()`, `getBadgesByCategory()` from Phase 32 | Static catalog with typed helpers already exists |
| Store persistence | Manual AsyncStorage calls | Zustand `addEarnedBadges` action from achievementSlice | Already handles idempotent badge writing |
| Level-up animation | New celebration system | Existing `ConfettiCelebration` component | Already used on ResultsScreen for level-up |
| Route param typing | Untyped params | `RootStackParamList` type augmentation | React Navigation 7 global augmentation already configured |
| Scroll list for badge grid | Custom scroll handling | ScrollView with View sections | 27 badges is small enough -- no virtualization needed |

**Key insight:** The Phase 32 foundation provides all data utilities. This phase is purely about UI wiring and visual components.

## Common Pitfalls

### Pitfall 1: Badge evaluation running before state is committed
**What goes wrong:** `evaluateBadges` reads stale state because it runs before `commitSessionResults` updates the store.
**Why it happens:** The evaluation needs post-commit state (updated mastery, streak, session count) but is called before the commit.
**How to avoid:** Call `incrementSessionsCompleted()` and `commitSessionResults()` FIRST, then call `evaluateBadges()` using `useAppStore.getState()` to get the freshly-committed snapshot. Zustand `set()` is synchronous, so `getState()` reflects updates immediately.
**Warning signs:** Behavior badges (session count, streak milestones) never trigger because evaluation sees pre-commit values.

### Pitfall 2: ResultsScreen exceeding 500 lines
**What goes wrong:** CLAUDE.md guardrail violation -- ResultsScreen is already 418 lines.
**Why it happens:** Adding badge section (stats card rows), popup overlay, and "View All Badges" link adds ~120+ lines of JSX and styles.
**How to avoid:** Extract `BadgeUnlockPopup` into `components/animations/`. Extract `BadgesSummary` into `components/badges/`. ResultsScreen becomes a composition of these components.
**Warning signs:** File exceeds 500 lines during implementation.

### Pitfall 3: useSession.ts exceeding 500 lines
**What goes wrong:** useSession.ts is at 422 lines. Adding badge evaluation + store writes adds 15-20 lines.
**Why it happens:** The commit-on-complete block is already large.
**How to avoid:** Keep the addition minimal -- construct snapshot from `useAppStore.getState()`, call `evaluateBadges`, call `addEarnedBadges`, add to `SessionResult`. If approaching 500 lines, extract the commit block into a helper function.
**Warning signs:** File approaches or exceeds 500 lines.

### Pitfall 4: Badge popup blocking Results screen navigation
**What goes wrong:** Popup appears during navigation transition, causing visual glitches or the popup appearing over the wrong screen.
**Why it happens:** The popup is triggered immediately when ResultsScreen mounts, before the navigation animation completes.
**How to avoid:** Use a small delay (300-500ms) before showing the first popup, matching the existing `withDelay` pattern used for levelUpScale animation. The popup should only render after the Results screen is fully mounted.
**Warning signs:** Popup flickers or appears over SessionScreen during transition.

### Pitfall 5: Reanimated worklet errors in tests
**What goes wrong:** Tests crash with "worklet" or "native module" errors from react-native-reanimated.
**Why it happens:** Reanimated v4 uses native worklets that aren't available in Jest.
**How to avoid:** Use the established manual mock pattern from `ResultsScreen.test.tsx` -- mock `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring`, `withDelay` as synchronous identity functions. The project already has this mock pattern proven working.
**Warning signs:** Test runner crashes on import of animation components.

### Pitfall 6: Forgetting to add BadgeCollection to RootStackParamList
**What goes wrong:** TypeScript error when navigating to BadgeCollection -- "Argument of type 'BadgeCollection' is not assignable".
**Why it happens:** Navigation types must be declared in RootStackParamList before the screen can be navigated to.
**How to avoid:** Update `navigation/types.ts` FIRST, then register screen in AppNavigator, then implement the screen.
**Warning signs:** TypeScript error on `navigation.navigate('BadgeCollection')`.

### Pitfall 7: Badge popup not dismissing properly in sequential display
**What goes wrong:** Tapping to dismiss one badge popup immediately dismisses all remaining popups, or the next popup doesn't appear.
**Why it happens:** State management for the sequential popup queue is tricky -- a simple boolean won't track which badge to show next.
**How to avoid:** Use an index state: `currentPopupIndex` tracks which badge in the `newBadges` array to show. Tap-to-dismiss increments the index. When index >= newBadges.length, the overlay closes. Reset animation values between badges.
**Warning signs:** Multi-badge sessions only show one popup or skip badges.

## Code Examples

Verified patterns from the existing codebase:

### Session Integration: Wiring evaluateBadges into useSession
```typescript
// In useSession.ts, inside the session-complete block (after commitSessionResults):
// Source: follows pattern from existing commit-on-complete flow in useSession.ts lines 317-355

// 1. Increment session counter BEFORE badge evaluation
incrementSessionsCompleted();

// 2. Build snapshot from freshly-committed state
const currentState = useAppStore.getState();
const badgeSnapshot: BadgeEvaluationSnapshot = {
  skillStates: currentState.skillStates,
  weeklyStreak: currentState.weeklyStreak,
  sessionsCompleted: currentState.sessionsCompleted,
  misconceptions: currentState.misconceptions,
};

// 3. Evaluate and persist
const newBadges = evaluateBadges(badgeSnapshot, currentState.earnedBadges);
if (newBadges.length > 0) {
  currentState.addEarnedBadges(newBadges);
}

// 4. Include in session result for route params
setSessionResult({
  // ...existing fields...
  newBadges,  // Add to SessionResult type
});
```

### Navigation: Route Params Update
```typescript
// Source: existing pattern in src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Session: { /* existing */ };
  Results: {
    // ...existing params...
    newBadges?: string[];  // Badge IDs earned this session
  };
  BadgeCollection: undefined;  // New screen
  Sandbox: { manipulativeType: ManipulativeType };
  Consent: { returnTo?: 'Session' } | undefined;
};
```

### Badge Celebration Popup Animation
```typescript
// Source: animation pattern from ConfettiCelebration + AnswerFeedbackAnimation
// components/animations/BadgeUnlockPopup.tsx

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

// Scale-up animation for badge icon (distinct from confetti)
const scale = useSharedValue(0);
const opacity = useSharedValue(0);

useEffect(() => {
  // Delayed entrance after Results screen loads
  opacity.value = withDelay(300, withTiming(1, { duration: 200 }));
  scale.value = withDelay(300,
    withSequence(
      withSpring(1.15, { damping: 6, stiffness: 200 }),
      withSpring(1.0, { damping: 10 }),
    ),
  );
}, []);

const badgeAnimatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  opacity: opacity.value,
}));
```

### Badge Icon Component (Emoji-in-Circle)
```typescript
// Source: pattern from AVATARS in src/store/constants/avatars.ts + HomeScreen avatarCircle
// components/badges/BadgeIcon.tsx

interface BadgeIconProps {
  emoji: string;
  earned: boolean;
  size?: number;
}

function BadgeIcon({ emoji, earned, size = 64 }: BadgeIconProps) {
  return (
    <View style={[
      styles.circle,
      { width: size, height: size, borderRadius: size / 2 },
      !earned && styles.locked,
    ]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  locked: {
    opacity: 0.4,
    borderColor: colors.surfaceLight,
  },
  emoji: {
    textAlign: 'center',
  },
});
```

### Badge Emoji Mapping (Claude's Discretion)
```typescript
// Recommended emoji assignments by category/condition type:
// Mastery badges:
//   - Skill mastery: star variants - each skill gets a unique emoji
//   - Category mastery (addition): calculator emoji or math symbol
//   - Category mastery (subtraction): minus emoji or math symbol
//   - Grade mastery: graduation cap / trophy

// Behavior badges:
//   - Streak bronze/silver/gold: fire emoji
//   - Sessions bronze/silver/gold: book/notebook emoji
//   - Remediation bronze/silver: bug/magnifying glass emoji

// Implementation: Add an `emoji` field to BadgeDefinition type, or create a
// separate BADGE_EMOJIS mapping (keeps registry clean, allows future icon changes)
const BADGE_EMOJIS: Record<string, string> = {
  'mastery.addition.single-digit.no-carry': '\u2B50',  // star
  'mastery.category.addition': '\u2795',                // plus sign
  'mastery.grade.1': '\uD83C\uDF93',                    // graduation cap
  'behavior.streak.bronze': '\uD83D\uDD25',             // fire
  'behavior.sessions.bronze': '\uD83D\uDCD6',           // book
  'behavior.remediation.bronze': '\uD83D\uDC1B',        // bug
  // ...etc
};
```

### Results Screen Badge Section
```typescript
// Source: follows existing statRow pattern in ResultsScreen
// components/badges/BadgesSummary.tsx

interface BadgesSummaryProps {
  badgeIds: string[];
  onViewAll: () => void;
}

function BadgesSummary({ badgeIds, onViewAll }: BadgesSummaryProps) {
  if (badgeIds.length === 0) return null;

  return (
    <>
      <View style={styles.divider} />
      <View style={styles.badgesSection} testID="badges-earned-section">
        <Text style={styles.badgesLabel}>Badges Earned</Text>
        {badgeIds.map((id) => {
          const badge = getBadgeById(id);
          if (!badge) return null;
          return (
            <View key={id} style={styles.badgeRow}>
              <Text style={styles.badgeEmoji}>{BADGE_EMOJIS[id]}</Text>
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          );
        })}
      </View>
      <Pressable onPress={onViewAll} style={styles.viewAllLink}>
        <Text style={styles.viewAllText}>View All Badges</Text>
      </Pressable>
    </>
  );
}
```

### HomeScreen Badge Count Entry Point
```typescript
// Source: follows streakContainer pattern in HomeScreen
// Added to stats section after streak display

const earnedBadgeCount = Object.keys(
  useAppStore((state) => state.earnedBadges)
).length;

// In JSX, after streak container:
<Pressable
  onPress={() => navigation.navigate('BadgeCollection')}
  style={styles.badgeCountButton}
  accessibilityRole="button"
  accessibilityLabel={`${earnedBadgeCount} of 27 badges earned. View all badges.`}
  testID="badge-count-button"
>
  <Text style={styles.badgeCountText}>
    {'\uD83C\uDFC5'} {earnedBadgeCount} / {BADGES.length} Badges
  </Text>
</Pressable>
```

### Reanimated Mock Pattern for Tests
```typescript
// Source: established pattern from src/__tests__/screens/ResultsScreen.test.tsx
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
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withDelay: (_d: number, v: any) => v,
    withRepeat: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: { in: (e: any) => e, quad: (v: any) => v, linear: (v: any) => v },
    useReducedMotion: jest.fn(() => false),
  };
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Image-based badge icons | Emoji-in-circle containers | Project decision | Zero asset management, consistent with AVATARS pattern |
| Single celebration type | Distinct animations per event type | Phase 33 decision | Level-up uses confetti; badge unlock uses scale+shimmer |
| Complex badge showcase | Simple categorized grid | Project decision | Badge showcase/trophy wall deferred to post-v0.7 |

**Deprecated/outdated:**
- Reanimated 3.x API (`runOnJS`, `runOnUI`): Project uses Reanimated 4.1 which uses `scheduleOnRN`/`scheduleOnUI` from `react-native-worklets`. However, for this phase we only need `useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, `withDelay`, `withSequence` -- all of which remain the same between v3 and v4.

## Open Questions

1. **Badge emoji assignments for 27 badges**
   - What we know: Emoji-based icons in styled circles, matching AVATARS pattern. Categories are mastery (skill, category, grade) and behavior (streak, sessions, remediation).
   - What's unclear: Exact emoji for each of the 27 badges (14 skill mastery, 2 category, 3 grade, 3 streak, 3 sessions, 2 remediation).
   - Recommendation: Create a `BADGE_EMOJIS` lookup map in a constants file. Use themed emojis: stars for skill mastery, math symbols for category mastery, graduation caps for grade mastery, fire for streaks, books for sessions, bugs for remediation. Tier differentiation via circle border color (bronze=#cd7f32, silver=#c0c0c0, gold=#ffd700) rather than different emojis per tier.

2. **Badge detail overlay: bottom sheet vs modal**
   - What we know: Tapping a badge in the collection shows details (icon, name, description, requirements, earned date).
   - What's unclear: Whether to use a bottom sheet or a centered modal.
   - Recommendation: Use a centered modal (same pattern as BadgeUnlockPopup but without animation). Bottom sheet would require additional dependencies or complex gesture handling. A simple Modal component with a dim backdrop and a card is consistent with the popup pattern and keeps the dependency count at zero.

3. **Badge grid column count**
   - What we know: 27 badges total in 3 section categories. Need to fit on phone screens for ages 6-9 (large touch targets).
   - What's unclear: Optimal number of columns.
   - Recommendation: 3 columns. 64dp badge circles with 16dp spacing fits comfortably on smallest supported screens (320dp width). 48dp minimum touch target (CLAUDE.md guardrail) is met with 64dp circles.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npm test -- --testPathPattern="badge\|Badge\|Results\|Home"` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACHV-04 | evaluateBadges wired into session commit, mastery badges earned | integration | `npm test -- --testPathPattern=useSession` | Partially (useSession tested but not badge wiring) |
| ACHV-05 | incrementSessionsCompleted called before badge evaluation | integration | `npm test -- --testPathPattern=useSession` | No -- Wave 0 |
| ACHV-06 | BadgeUnlockPopup renders, animates, sequential dismiss works | unit | `npm test -- --testPathPattern=BadgeUnlockPopup` | No -- Wave 0 |
| ACHV-06 | ResultsScreen shows popup when newBadges present | unit | `npm test -- --testPathPattern=ResultsScreen` | Partially (ResultsScreen test exists, needs badge cases) |
| ACHV-07 | BadgeCollectionScreen renders categorized grid | unit | `npm test -- --testPathPattern=BadgeCollection` | No -- Wave 0 |
| ACHV-07 | Locked badges shown dimmed with requirements | unit | `npm test -- --testPathPattern=BadgeCollection` | No -- Wave 0 |
| ACHV-07 | Badge detail overlay shows on tap | unit | `npm test -- --testPathPattern=BadgeCollection` | No -- Wave 0 |
| ACHV-08 | Results screen shows badges section when badges earned | unit | `npm test -- --testPathPattern=ResultsScreen` | No -- Wave 0 |
| ACHV-08 | Results screen hides badges section when no badges earned | unit | `npm test -- --testPathPattern=ResultsScreen` | No -- Wave 0 |
| ACHV-08 | "View All Badges" navigates to BadgeCollection | unit | `npm test -- --testPathPattern=ResultsScreen` | No -- Wave 0 |
| HOME | Badge count button visible and navigates to BadgeCollection | unit | `npm test -- --testPathPattern=HomeScreen` | Partially (HomeScreen test exists, needs badge cases) |
| NAV | BadgeCollection route registered, types correct | unit | `npm run typecheck` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="badge\|Badge\|Results\|Home\|useSession"`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + `npm run typecheck` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/components/BadgeUnlockPopup.test.tsx` -- covers ACHV-06 (popup render, sequential dismiss)
- [ ] `src/__tests__/screens/BadgeCollectionScreen.test.tsx` -- covers ACHV-07 (grid, sections, detail overlay)
- [ ] `src/__tests__/components/BadgesSummary.test.tsx` -- covers ACHV-08 (results badge section)
- [ ] New test cases in `src/__tests__/screens/ResultsScreen.test.tsx` -- covers ACHV-06/ACHV-08 (popup shown, badges section)
- [ ] New test cases in `src/__tests__/screens/HomeScreen.test.tsx` -- covers HOME (badge count, navigation)
- [ ] Framework install: None needed -- Jest + RNTL already configured

*(Existing tests for ResultsScreen and HomeScreen will need additional test cases, not new test files)*

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/hooks/useSession.ts` -- commit-on-complete flow at lines 317-355, integration point for evaluateBadges
- Existing codebase: `src/services/session/sessionOrchestrator.ts` -- commitSessionResults function, atomic state update pattern
- Existing codebase: `src/services/achievement/badgeEvaluation.ts` -- evaluateBadges pure function, BadgeEvaluationSnapshot type
- Existing codebase: `src/services/achievement/badgeRegistry.ts` -- 27 badge definitions, getBadgeById, getBadgesByCategory
- Existing codebase: `src/store/slices/achievementSlice.ts` -- addEarnedBadges action, earnedBadges state shape
- Existing codebase: `src/store/slices/gamificationSlice.ts` -- incrementSessionsCompleted action
- Existing codebase: `src/screens/ResultsScreen.tsx` -- 418 lines, route params pattern, ConfettiCelebration usage, stats card layout
- Existing codebase: `src/screens/HomeScreen.tsx` -- 317 lines, stats section layout, streak display, navigation pattern
- Existing codebase: `src/screens/SessionScreen.tsx` -- 226 lines, navigation to Results with route params
- Existing codebase: `src/components/animations/ConfettiCelebration.tsx` -- overlay animation pattern, Reanimated usage
- Existing codebase: `src/components/animations/AnswerFeedbackAnimation.tsx` -- scale/spring animation pattern
- Existing codebase: `src/navigation/types.ts` -- RootStackParamList, route param typing
- Existing codebase: `src/navigation/AppNavigator.tsx` -- screen registration pattern
- Existing codebase: `src/store/constants/avatars.ts` -- emoji-in-circle pattern for badge icons
- Existing codebase: `src/__tests__/screens/ResultsScreen.test.tsx` -- Reanimated mock pattern, route param mock pattern
- Existing codebase: `src/__tests__/screens/HomeScreen.test.tsx` -- store mock pattern, navigation mock pattern
- `.claude/skills/react-native-best-practices/references/js-animations-reanimated.md` -- Reanimated v4 API reference

### Secondary (MEDIUM confidence)
- None needed -- all patterns are directly observed in the codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all existing libraries
- Architecture: HIGH -- every pattern (route params, overlays, emoji icons, screen registration, component extraction) has a direct precedent in the codebase
- Session integration: HIGH -- commit-on-complete flow clearly identified in useSession.ts, evaluateBadges API already exists
- Pitfalls: HIGH -- file size risks quantified (ResultsScreen 418, useSession 422), animation testing mock pattern proven
- Badge UI: HIGH -- AVATARS emoji pattern, ScrollView for small list (27 items), categorized sections

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days -- stable domain, no external dependencies)
