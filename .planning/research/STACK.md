# Stack Research: v0.7 Gamification Features

**Domain:** Children's math learning app gamification (achievement badges, skill map, daily challenges, avatar customization, UI themes)
**Researched:** 2026-03-04
**Confidence:** HIGH

## Executive Summary

The existing stack already contains every library needed for v0.7 gamification. No new npm dependencies are required. The project has react-native-svg (used extensively for manipulative pictorial diagrams), react-native-reanimated (used for 60fps drag primitives and confetti animations), expo-notifications (in deps, not yet imported), and lottie-react-native (in deps, not yet imported). The work is entirely architectural: new Zustand slices, new services, new components, and a theme provider pattern built on React Context.

## Recommended Stack

### Core Technologies (Already Installed -- No Changes)

| Technology | Version | Purpose for v0.7 | Why No Change Needed |
|------------|---------|-------------------|---------------------|
| react-native-svg | 15.12.1 | Skill map graph rendering (nodes, edges, mastery arcs) | Already used for 8 pictorial diagram components; SVG is the right primitive for a DAG visualization with circles, paths, and text |
| react-native-reanimated | ~4.1.1 | Animated skill map nodes (pulse, glow, unlock transitions), badge celebration animations, theme transition fades | Already used for confetti + manipulative drag; `useAnimatedProps` works with react-native-svg for animated stroke-dashoffset mastery arcs |
| lottie-react-native | ~7.3.1 | Badge unlock celebration animations, level-up effects | Already in package.json but not imported; Lottie JSON animations are smaller and richer than hand-coded Reanimated for one-shot celebrations |
| expo-notifications | ~0.32.15 | Daily challenge reminder notifications | Already in package.json but not imported; `DailyTriggerInput` with `repeats: true` handles recurring daily reminders without a backend |
| expo-haptics | ~15.0.7 | Haptic feedback on badge unlock, skill node tap, avatar selection | Already used in `src/components/manipulatives/shared/haptics.ts`; extend to new interactions |
| expo-linear-gradient | ~15.0.7 | Theme gradient backgrounds, skill map region shading, badge cards | Already in package.json; provides native gradient rendering |
| zustand | ^5.0.8 | New slices for achievements, daily challenges, avatar/theme state | Already the state management foundation; extend with 2-3 new slices following established domain slice pattern |
| zod | ^4.1.13 | Validation of achievement definitions, theme schemas, challenge configs | Already used at system boundaries; apply to new config types |

### What Each Feature Needs

#### 1. Achievement Badges

**Libraries:** None new. Pure TypeScript service + Zustand slice + Reanimated/Lottie animations.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Badge definitions | TypeScript constants (like `SKILLS` array) | Static `AchievementDefinition[]` with id, name, category, criteria, icon |
| Badge state tracking | New `achievementSlice` in Zustand | `earnedBadges: Record<string, EarnedBadge>`, persisted via `partialize` |
| Criteria evaluation | Pure function service `achievementEvaluator.ts` | Check after session complete, skill mastery, streak update; deterministic, testable |
| Unlock animation | Lottie for celebration + Reanimated for entrance | Use `lottie-react-native` LottieView for badge-specific unlock anims; JSON assets from LottieFiles |
| Badge gallery UI | react-native-svg for badge icons OR emoji-based (like current avatars) | SVG preferred for scalable, themeable badges; emoji fallback is simpler |
| Store migration | v8 -> v9: add `earnedBadges: {}` | Follows established migration chain pattern |

#### 2. Visual Skill Map

**Libraries:** None new. react-native-svg + react-native-reanimated (both already installed).

| Component | Technology | Notes |
|-----------|-----------|-------|
| Graph layout | Custom layout algorithm in TypeScript service | 14 nodes, 2 operation chains -- small enough for hand-tuned positions; no graph layout library needed |
| Node rendering | react-native-svg `Circle`, `Text`, `G` | Each skill = circle node with label, color-coded by mastery state |
| Edge rendering | react-native-svg `Path` or `Line` | Prerequisite arrows between nodes; straight lines or gentle curves |
| Mastery indicator | Animated SVG arc via `useAnimatedProps` | `strokeDashoffset` on arc path animated by `withTiming` when mastery changes |
| Node states | Reanimated `useAnimatedStyle` | Locked=gray+scale(0.8), active=pulse animation, mastered=glow+full color |
| Tap interaction | react-native-gesture-handler `Pressable` or RN `Pressable` | Tap node -> show skill detail popup; 48dp minimum touch target |
| Pan/zoom | react-native-gesture-handler `PanGestureHandler` + `PinchGestureHandler` | Only if map is larger than viewport; 14 nodes may fit without scrolling |
| Scroll container | `ScrollView` with `contentContainerStyle` | Simpler alternative to pan/zoom for the initial implementation |

**Why NOT use a graph visualization library:**
- The DAG has only 14 nodes and ~15 edges -- trivially small
- External graph libraries (react-d3-graph, vis-network) are web-only, not React Native compatible
- react-native-graph (Margelo) is for line/area charts, not node-edge graphs
- Custom SVG gives full control over child-friendly styling, animations, and touch targets
- The prerequisite relationships are already defined in `SKILLS` array with `prerequisites[]`

#### 3. Daily Challenges

**Libraries:** None new. expo-notifications (already in deps) + pure TypeScript scheduling service.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Challenge definitions | TypeScript constants | Challenge templates: "5 addition problems under 2 minutes", "Master a new skill today", etc. |
| Daily rotation | Deterministic selection from `Mulberry32` PRNG seeded by date | Same pattern as problem generation; ensures same challenge for retries on same day |
| Challenge state | New `challengeSlice` in Zustand OR extend `gamificationSlice` | `dailyChallenge: { date, challengeId, status, progress }`, persisted |
| Reminder notifications | `expo-notifications` `scheduleNotificationAsync` with `DailyTriggerInput` | Schedule at parent-configured time; requires notification permission prompt |
| Completion tracking | Pure function service | Check challenge criteria after each session; award bonus XP + special badge |
| Store migration | v9 -> v10 (or combined with badges migration) | Add `dailyChallenge` state |

**Notification scheduling pattern:**
```typescript
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Daily Challenge Ready!",
    body: "Your math challenge is waiting!",
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: 16, // 4 PM, configurable by parent
    minute: 0,
    repeats: true,
  },
});
```

#### 4. Avatar Customization

**Libraries:** None new. Extend existing `src/store/constants/avatars.ts` pattern.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Base avatars | Existing `AVATARS` constant (8 animal emojis) | Keep as-is; these are the free presets |
| Unlockable avatars | Extend `AVATARS` with `unlockCriteria?: string` field | e.g., "Master all addition" unlocks "Math Dragon" |
| Avatar frames | react-native-svg `Circle` with decorative border | Gold frame for all-skills-mastered, silver for streak milestones |
| Avatar selection UI | Existing pattern + locked overlay for unearned | Reuse current onboarding avatar picker with lock/unlock states |
| Equipped state | Extend `childProfileSlice` with `equippedFrame?: FrameId` | Minimal state addition; single migration |

#### 5. UI Themes (Skins + Session Cosmetic Wrappers)

**Libraries:** None new. React Context + Zustand for theme state.

| Component | Technology | Notes |
|-----------|-----------|-------|
| Theme definitions | TypeScript constants extending `src/theme/index.ts` pattern | Multiple color palettes: "Ocean Deep" (current dark navy), "Forest Green", "Sunset Warm", "Space Purple" |
| Theme context | React `createContext` + `useContext` hook | `ThemeProvider` wrapping app root; components read colors from context instead of direct import |
| Theme persistence | Add `activeThemeId` to gamification/achievement slice | Persisted in Zustand store; survives app restart |
| Session cosmetics | Purely visual wrappers (background pattern, answer button style variants) | Config objects mapping theme -> component style overrides |
| Theme unlock | Tied to achievement system | Earn "Forest Explorer" badge -> unlock "Forest Green" theme |
| Migration path | Refactor `src/theme/index.ts` from static export to theme registry | Current `colors` object becomes the "default" theme; new themes follow same shape |

**Theme architecture pattern:**
```typescript
// src/theme/themes.ts
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

export const THEMES: Record<string, ThemeColors> = {
  'ocean-deep': { /* current colors */ },
  'forest-green': { /* green palette */ },
  'sunset-warm': { /* warm palette */ },
  'space-purple': { /* purple palette */ },
};

// src/theme/ThemeProvider.tsx
const ThemeContext = createContext<ThemeColors>(THEMES['ocean-deep']);
export const useThemeColors = () => useContext(ThemeContext);
```

### Supporting Libraries (Already Installed -- No Changes)

| Library | Version | Purpose for v0.7 | When to Use |
|---------|---------|-------------------|-------------|
| lucide-react-native | ^0.554.0 | Icons for badge gallery, skill map legend, challenge cards | UI iconography throughout new screens |
| @react-navigation/native-stack | ^7.8.2 | New screens: BadgeGallery, SkillMap, DailyChallenge, AvatarCustomizer, ThemeSelector | Standard navigation pattern |
| @expo-google-fonts/lexend | ^0.4.1 | Typography in new screens | Consistent with existing UI |
| expo-crypto | ~15.0.8 | Hash-based deterministic daily challenge selection (if Mulberry32 is insufficient) | Edge case only |

### Development Tools (No Changes)

| Tool | Purpose | Notes |
|------|---------|-------|
| Jest + jest-expo | Test achievement evaluator, challenge scheduler, theme system | All new services are pure functions; highly testable |
| TypeScript strict mode | Type-safe badge/theme/challenge definitions | Leverage discriminated unions for badge criteria types |

## Installation

```bash
# No new packages to install.
# All required libraries are already in package.json:
#   - react-native-svg@15.12.1
#   - react-native-reanimated@~4.1.1
#   - lottie-react-native@~7.3.1
#   - expo-notifications@~0.32.15
#   - expo-haptics@~15.0.7
#   - expo-linear-gradient@~15.0.7
#   - zustand@^5.0.8
#   - zod@^4.1.13
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Skill map rendering | Custom react-native-svg | react-native-graph (Margelo/Skia) | react-native-graph is for line/area charts, not node-edge DAGs; our graph has 14 nodes, not thousands of data points |
| Skill map rendering | Custom react-native-svg | d3-force + react-native-svg | d3-force is overkill for a static 14-node DAG with known topology; adds 60KB+ dependency for layout we can hand-code in 50 lines |
| Skill map rendering | Custom react-native-svg | react-native-skia | Skia is powerful but adds a heavy dependency (~2MB); SVG is already installed, proven in codebase, and sufficient for 14 nodes |
| Badge animations | Lottie (already installed) | Rive (rive-react-native) | Rive is more powerful but adds a new dependency; Lottie is already in package.json and has a massive free animation library |
| Badge animations | Lottie + Reanimated | Hand-coded Reanimated only | Lottie JSON animations from LottieFiles are faster to create, richer, and smaller than hand-coding complex celebration sequences |
| Theme system | React Context + Zustand | NativeWind / Tailwind | Project uses StyleSheet.create pattern (per CLAUDE.md); switching to NativeWind would require rewriting 40+ component files |
| Theme system | React Context + Zustand | react-native-paper ThemeProvider | Paper is a full UI component library; project has custom components; importing Paper just for theming adds unnecessary weight |
| Theme system | React Context + Zustand | styled-components | Adds a runtime dependency for what React Context + Zustand handle natively; project doesn't use styled-components anywhere |
| Notifications | expo-notifications (already installed) | react-native-push-notification | expo-notifications is the Expo-blessed solution; alternatives break managed workflow |
| State persistence | AsyncStorage (current) | react-native-mmkv | MMKV is faster but adds native dependency complexity; AsyncStorage is already working, proven, and sufficient for the data volume |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| FlashList v2.x | Crashes on RN 0.81 (requires new architecture) -- per CLAUDE.md guardrail | FlashList v1.x if you need a virtualized list for badge gallery (but FlatList is fine for <50 badges) |
| react-native-skia | Heavy (~2MB), new dependency for a feature achievable with existing react-native-svg | react-native-svg + react-native-reanimated (both already installed) |
| d3 / d3-force | Web-focused, adds 60KB+, requires complex RN adaptation for a 14-node graph | Hand-coded SVG layout with known skill topology |
| react-native-paper | Full UI framework; would clash with existing custom component patterns | React Context for theming, custom components for UI |
| NativeWind / Tailwind CSS | Project uses `StyleSheet.create` (per CLAUDE.md); migration would touch every component | Keep `StyleSheet.create`; use `useThemeColors()` hook for dynamic colors |
| Any coin/currency system | Research doc (07-gamification.md) describes coins, but v0.7 scope is achievements/themes/challenges only | Achievement-based unlocks (earn badge -> unlock theme/avatar) without intermediate currency |
| External achievement/gamification SDKs | Over-engineered for 30-50 achievement definitions; adds vendor lock-in | Pure TypeScript achievement evaluator service |

## Store Schema Changes

The gamification features require extending the Zustand store. Estimated migration path:

| Migration | Fields Added | Slice |
|-----------|-------------|-------|
| v8 -> v9 | `earnedBadges: Record<string, EarnedBadge>` | New `achievementSlice` |
| v8 -> v9 | `activeThemeId: string` (default: `'ocean-deep'`) | Extend `gamificationSlice` or new slice |
| v8 -> v9 | `equippedFrame: FrameId \| null` | Extend `childProfileSlice` |
| v8 -> v9 | `dailyChallenge: DailyChallengeState \| null` | New `challengeSlice` or extend `gamificationSlice` |

**Recommendation:** Combine into a single STORE_VERSION=9 migration that adds all new fields at once. This avoids multiple migration hops and follows the existing pattern of one migration per milestone.

**Partialize additions:** New persisted fields must be added to the `partialize` function in `appStore.ts`.

## New File Structure (Recommended)

```
src/
  services/
    gamification/
      achievementDefinitions.ts    -- Static AchievementDefinition[] (like SKILLS[])
      achievementEvaluator.ts      -- Pure function: (state) => newBadges[]
      challengeDefinitions.ts      -- Static ChallengeDefinition[]
      challengeScheduler.ts        -- Deterministic daily challenge selection
      challengeEvaluator.ts        -- Pure function: (session, challenge) => completed?
  store/
    slices/
      achievementSlice.ts          -- earnedBadges state + actions
      challengeSlice.ts            -- dailyChallenge state + actions
    constants/
      avatars.ts                   -- Extend with unlockable avatars + frames
  theme/
    index.ts                       -- Keep as backward-compat re-export
    themes.ts                      -- ThemeColors interface + THEMES registry
    ThemeProvider.tsx               -- React Context provider
    useThemeColors.ts              -- Hook for consuming theme
  components/
    skillMap/
      SkillMapView.tsx             -- Main SVG skill map component
      SkillNode.tsx                -- Individual node with mastery arc
      SkillEdge.tsx                -- Prerequisite connection line
    badges/
      BadgeCard.tsx                -- Single badge display
      BadgeGallery.tsx             -- Grid of all badges
      BadgeUnlockCelebration.tsx   -- Lottie/Reanimated unlock animation
    challenges/
      DailyChallengeCard.tsx       -- Challenge display on home screen
    avatar/
      AvatarCustomizer.tsx         -- Avatar + frame selection
    animations/
      BadgeCelebration.tsx         -- Badge-specific Lottie animation
  screens/
    SkillMapScreen.tsx
    BadgeGalleryScreen.tsx
    AvatarScreen.tsx
    ThemeScreen.tsx
```

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-native-svg@15.12.1 | react-native-reanimated@~4.1.1 | `Animated.createAnimatedComponent(Circle)` + `useAnimatedProps` works for animated mastery arcs |
| react-native-svg@15.12.1 | React Native 0.81.5 | Installed via `expo install`; Expo SDK 54 compatible |
| lottie-react-native@~7.3.1 | Expo SDK 54 | Listed in Expo SDK 54 compatible packages; supports managed workflow |
| expo-notifications@~0.32.15 | Expo SDK 54 | `DailyTriggerInput` available; requires `expo-notifications` permission setup in app.json |
| zustand@^5.0.8 | AsyncStorage + persist middleware | Established pattern; new slices follow `StateCreator<AppState>` pattern |

## Integration Points

### With Existing Systems

| Existing System | Integration Point | How |
|----------------|-------------------|-----|
| Session completion | Badge evaluation trigger | Call `evaluateAchievements(state)` in session commit handler |
| BKT mastery changes | Skill map node updates | Skill map reads from `skillStates` (already reactive via Zustand) |
| BKT mastery locked | Badge criteria check | "Master all addition" checks `masteryLocked` for addition skills |
| Weekly streak | Badge + challenge criteria | Streak milestones trigger badge checks |
| XP/Level system | Challenge rewards | Daily challenge completion awards bonus XP through existing `addXp` |
| Prerequisite DAG | Skill map edges | `SKILLS[].prerequisites` already defines the graph topology |
| Misconception resolution | Badge criteria | "Overcome 5 misconceptions" checks `misconceptions` with `status: 'resolved'` |

### Lottie Asset Strategy

Lottie JSON animation files should be stored in `assets/animations/` and loaded at build time. For badge celebrations:

- Source free animations from LottieFiles (lottiefiles.com)
- Keep file sizes under 50KB each (target: 10-30KB)
- Use `autoPlay={false}` with `ref.current.play()` for trigger-on-demand
- Badge-specific animations vs. a single generic celebration: start with one generic, add specific ones iteratively

## Sources

- Expo SDK 54 Notifications docs: https://docs.expo.dev/versions/latest/sdk/notifications/ -- DailyTriggerInput API verified
- Expo SDK 54 Lottie docs: https://docs.expo.dev/versions/v53.0.0/sdk/lottie/ -- lottie-react-native compatibility confirmed
- react-native-reanimated useAnimatedProps: https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedProps/ -- SVG animated props pattern verified
- react-native-svg GitHub: https://github.com/software-mansion/react-native-svg -- v15.x compatible with RN 0.81
- Expo color themes guide: https://docs.expo.dev/develop/user-interface/color-themes/ -- React Context theming pattern
- Existing codebase: `src/theme/index.ts` (current static theme), `src/store/constants/avatars.ts` (avatar pattern), `src/services/mathEngine/skills.ts` (DAG topology), `src/store/migrations.ts` (migration chain pattern)

---
*Stack research for: Tiny Tallies v0.7 Gamification*
*Researched: 2026-03-04*
