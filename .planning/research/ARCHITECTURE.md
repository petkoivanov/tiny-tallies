# Architecture Research: Gamification Features Integration

**Domain:** Gamification layer for children's math learning app (ages 6-9)
**Researched:** 2026-03-04
**Confidence:** HIGH

## System Overview

```
EXISTING (unmodified)                    NEW (v0.7 additions)
========================                 ========================

Navigation Layer
  Home ---- Session ---- Results         SkillMap   AvatarPicker   DailyChallenge
    |           |            |              |           |               |
    v           v            v              v           v               v

Screen Layer
  HomeScreen (modify: badges,         SkillMapScreen    AvatarScreen
   daily challenge card, avatar)      (new screen)      (new screen)
  SessionScreen (modify: theme
   wrapper, challenge banner)
  ResultsScreen (modify: badges
   earned, challenge results)

Component Layer
  home/        session/     animations/   badges/       skillmap/     avatar/
  ExploreGrid  CpaSession   Confetti      BadgeCard     SkillNode     AvatarGrid
  (existing)   (existing)   (existing)    BadgePopup    SkillEdge     FrameSelector
                                          BadgeGrid     MapCanvas     ThemePicker

Service Layer
  gamification/             adaptive/       NEW services
  levelProgression.ts       prerequisite    gamification/
  weeklyStreak.ts           Gating.ts         achievementEngine.ts
  (existing)                (existing)        achievementDefinitions.ts
                                              dailyChallengeScheduler.ts
                                              themeRegistry.ts

Store Layer (Zustand slices)
  gamificationSlice    skillStatesSlice    NEW slices
  (MODIFY: add         (READ-ONLY)        achievementSlice.ts
   theme, avatar                          dailyChallengeSlice.ts
   frame fields)
```

## Integration Strategy: New vs Modified

### Files to CREATE (new)

| File | Purpose | Size Est. |
|------|---------|-----------|
| `src/store/slices/achievementSlice.ts` | Achievement records, unlock timestamps | ~120 lines |
| `src/store/slices/dailyChallengeSlice.ts` | Daily challenge state, completion tracking | ~100 lines |
| `src/services/gamification/achievementEngine.ts` | Evaluate unlock conditions against store state | ~200 lines |
| `src/services/gamification/achievementDefinitions.ts` | Badge definitions as typed constants | ~250 lines |
| `src/services/gamification/dailyChallengeScheduler.ts` | Rotating challenge generation, themed sets | ~180 lines |
| `src/services/gamification/themeRegistry.ts` | Theme definitions and unlock conditions | ~120 lines |
| `src/screens/SkillMapScreen.tsx` | Interactive DAG visualization | ~200 lines |
| `src/screens/AvatarScreen.tsx` | Avatar/frame/theme selection screen | ~180 lines |
| `src/components/badges/BadgeCard.tsx` | Single badge display (locked/unlocked) | ~80 lines |
| `src/components/badges/BadgePopup.tsx` | Full-screen badge unlock animation | ~100 lines |
| `src/components/badges/BadgeGrid.tsx` | Scrollable grid of all badges | ~90 lines |
| `src/components/badges/index.ts` | Barrel exports | ~10 lines |
| `src/components/skillmap/SkillNode.tsx` | Single node in skill DAG visualization | ~120 lines |
| `src/components/skillmap/SkillEdge.tsx` | Edge/arrow between nodes (SVG path) | ~80 lines |
| `src/components/skillmap/MapCanvas.tsx` | Scrollable/zoomable map container | ~150 lines |
| `src/components/skillmap/index.ts` | Barrel exports | ~10 lines |
| `src/components/avatar/AvatarGrid.tsx` | Avatar emoji selection grid | ~90 lines |
| `src/components/avatar/FrameSelector.tsx` | Unlockable frame ring selector | ~80 lines |
| `src/components/avatar/ThemePicker.tsx` | Theme skin selection with previews | ~100 lines |
| `src/components/avatar/index.ts` | Barrel exports | ~10 lines |
| `src/components/home/DailyChallengeCard.tsx` | Challenge prompt + countdown on home | ~120 lines |
| `src/components/session/ChallengeBanner.tsx` | In-session banner for daily challenge mode | ~60 lines |
| `src/store/constants/badges.ts` | Badge ID union type, category constants | ~30 lines |
| `src/store/constants/themes.ts` | Theme ID type, color palette definitions | ~60 lines |
| `src/store/constants/frames.ts` | Avatar frame definitions (unlockable) | ~30 lines |

### Files to MODIFY (existing)

| File | Change | Risk |
|------|--------|------|
| `src/store/appStore.ts` | Add achievementSlice + dailyChallengeSlice to AppState, STORE_VERSION 8->10, partialize additions | LOW -- pattern well-established |
| `src/store/migrations.ts` | Add v8->v9 (achievements map, equipped theme/frame) and v9->v10 (daily challenge state) | LOW -- follows existing migration chain |
| `src/store/slices/gamificationSlice.ts` | Add `equippedThemeId` and `equippedFrameId` fields + setters | LOW -- additive only |
| `src/navigation/AppNavigator.tsx` | Add SkillMap and Avatar screens | LOW -- additive |
| `src/navigation/types.ts` | Add SkillMap and Avatar to RootStackParamList | LOW -- additive |
| `src/screens/HomeScreen.tsx` | Add DailyChallengeCard, badge count display, avatar frame ring, skill map entry | MEDIUM -- largest UI change |
| `src/screens/ResultsScreen.tsx` | Add newly-earned badges section, daily challenge bonus display | LOW -- additive section |
| `src/screens/SessionScreen.tsx` | Pass challenge mode flag, apply theme wrapper | LOW -- conditional wrapper |
| `src/services/session/sessionOrchestrator.ts` | Call achievementEngine.evaluate() in commitSessionResults | LOW -- single function call at end |
| `src/services/session/sessionTypes.ts` | Add `isDailyChallenge` to SessionFeedback, `newBadges` | LOW -- additive fields |
| `src/theme/index.ts` | Export theme variants alongside current defaults | LOW -- additive |

### Files that are READ-ONLY (no changes needed)

| File | Why Untouched |
|------|---------------|
| `src/store/slices/skillStatesSlice.ts` | Achievement engine reads `skillStates` but never modifies it |
| `src/store/slices/misconceptionSlice.ts` | Badge definitions reference misconception counts via selectors |
| `src/services/adaptive/*` | Prerequisite graph, BKT, Leitner -- all read-only for skill map |
| `src/services/mathEngine/*` | SKILLS array used by skill map, badge definitions -- read-only |
| `src/store/slices/sessionStateSlice.ts` | Session flow unchanged |
| `src/store/slices/tutorSlice.ts` | Tutor system unaffected |

## Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `achievementSlice` | Persists earned badges, timestamps, viewed status | Read by HomeScreen, ResultsScreen, BadgeGrid |
| `dailyChallengeSlice` | Today's challenge config, completion status, bonus XP | Read by HomeScreen, SessionScreen, ResultsScreen |
| `achievementEngine` | Pure function: takes full store state, returns newly-earned badge IDs | Called by sessionOrchestrator at commit time |
| `achievementDefinitions` | Typed constant array of badge definitions with unlock predicates | Imported by achievementEngine, BadgeGrid |
| `dailyChallengeScheduler` | Deterministic daily challenge generation from date seed | Called by HomeScreen on mount, SessionScreen on start |
| `themeRegistry` | Maps themeId to color overrides, unlock conditions | Read by theme provider, AvatarScreen |
| `SkillMapScreen` | Renders SKILLS DAG with mastery overlays | Reads skillStates, prerequisiteGating |
| `AvatarScreen` | Avatar/frame/theme selection and equip | Reads/writes gamificationSlice |

## Architectural Patterns

### Pattern 1: Achievement Engine as Pure Function Evaluator

**What:** The achievement engine is a stateless pure function that accepts a snapshot of the full store state (skillStates, gamification, misconceptions, sessionAnswers) and returns an array of badge IDs that should be newly unlocked. It does NOT mutate state -- the caller (commitSessionResults) writes the results to achievementSlice.

**When to use:** Always. This is the core pattern for badge evaluation.

**Why this pattern:** Testable without store mocking. Deterministic. Can be called speculatively (e.g., "show progress toward next badge") without side effects. Follows the existing pattern where commitSessionResults accumulates pure results then writes atomically.

**Example:**
```typescript
// src/services/gamification/achievementEngine.ts

export interface AchievementEvalContext {
  readonly skillStates: Record<string, SkillState>;
  readonly xp: number;
  readonly level: number;
  readonly weeklyStreak: number;
  readonly totalSessions: number;
  readonly totalCorrect: number;
  readonly totalAttempts: number;
  readonly misconceptions: Record<string, MisconceptionRecord>;
  readonly exploredManipulatives: ManipulativeType[];
  readonly earnedBadgeIds: ReadonlySet<string>;
  // Session-specific context for session-scoped badges
  readonly sessionScore?: number;
  readonly sessionTotal?: number;
  readonly isDailyChallenge?: boolean;
}

export function evaluateAchievements(
  ctx: AchievementEvalContext,
): string[] {
  return ACHIEVEMENT_DEFINITIONS
    .filter((def) => !ctx.earnedBadgeIds.has(def.id))
    .filter((def) => def.condition(ctx))
    .map((def) => def.id);
}
```

### Pattern 2: Badge Definitions as Typed Constants with Predicate Functions

**What:** Each badge is a constant object with an `id`, metadata (name, icon, category, description), and a `condition` function that takes `AchievementEvalContext` and returns `boolean`. Definitions are a readonly array, not a class hierarchy.

**When to use:** For all badge types (skill mastery, effort, exploration, daily challenge).

**Why this pattern:** Adding a new badge is a single object addition to an array -- no new files, no registration boilerplate. The predicate pattern supports arbitrary complexity (compound conditions, range checks) while staying type-safe. Matches the existing SKILLS constant array pattern.

**Example:**
```typescript
// src/services/gamification/achievementDefinitions.ts

export interface AchievementDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string; // emoji for MVP, Lottie key later
  readonly category: 'skill' | 'effort' | 'exploration' | 'challenge';
  readonly condition: (ctx: AchievementEvalContext) => boolean;
  readonly progressFn?: (ctx: AchievementEvalContext) => {
    current: number;
    target: number;
  };
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  // Skill mastery badges
  {
    id: 'addition-ace',
    name: 'Addition Ace',
    description: 'Master all addition skills',
    icon: '\u2795',
    category: 'skill',
    condition: (ctx) =>
      SKILLS.filter((s) => s.operation === 'addition')
        .every((s) => ctx.skillStates[s.id]?.masteryLocked === true),
    progressFn: (ctx) => {
      const addSkills = SKILLS.filter((s) => s.operation === 'addition');
      return {
        current: addSkills.filter(
          (s) => ctx.skillStates[s.id]?.masteryLocked
        ).length,
        target: addSkills.length,
      };
    },
  },
  // Effort badges
  {
    id: 'practice-500',
    name: 'Practice Makes Perfect',
    description: 'Answer 500 problems',
    icon: '\uD83C\uDFAF',
    category: 'effort',
    condition: (ctx) => ctx.totalAttempts >= 500,
    progressFn: (ctx) => ({ current: ctx.totalAttempts, target: 500 }),
  },
  // ...more definitions
];
```

### Pattern 3: Daily Challenge as Deterministic Date-Seeded Generation

**What:** Daily challenges are generated deterministically from the current date as a seed. No server needed. The same date always produces the same challenge. Challenge types rotate on a fixed schedule (e.g., Monday=accuracy goal, Tuesday=speed, Wednesday=specific skill, etc.).

**When to use:** For all daily challenge generation.

**Why this pattern:** Fully offline. Deterministic = testable. No backend coordination needed. Matches the existing Mulberry32 seeded PRNG pattern used by the math engine. If the app is opened multiple times in a day, the same challenge is shown.

**Example:**
```typescript
// src/services/gamification/dailyChallengeScheduler.ts

export type ChallengeType = 'accuracy' | 'streak' | 'skill-focus' | 'speed' | 'explorer';

export interface DailyChallenge {
  readonly id: string;           // date-based: "2026-03-04"
  readonly type: ChallengeType;
  readonly title: string;        // "Accuracy Star"
  readonly description: string;  // "Get 12 out of 15 correct"
  readonly goal: number;         // target value (e.g., 12 correct)
  readonly bonusXp: number;      // extra XP for completing
  readonly badgeId?: string;     // optional special badge for challenge completion
}

const CHALLENGE_ROTATION: readonly ChallengeType[] = [
  'accuracy', 'streak', 'skill-focus', 'speed',
  'explorer', 'accuracy', 'skill-focus',
]; // 7-day cycle, indexed by dayOfWeek (0=Sunday)

export function generateDailyChallenge(
  date: Date,
  skillStates: Record<string, SkillState>,
): DailyChallenge {
  const dayOfWeek = date.getDay();
  const type = CHALLENGE_ROTATION[dayOfWeek];
  const dateStr = date.toISOString().slice(0, 10);
  const seed = dateStringToSeed(dateStr);
  // ...generate challenge params based on type + seed
}
```

### Pattern 4: Skill Map as Declarative Layout from Existing DAG

**What:** The skill map screen reads the existing `SKILLS` array (which already defines prerequisites as a DAG) and `skillStates` from the store, then renders nodes and edges. Layout is computed from the DAG structure using a simple left-to-right layered algorithm (topological sort by depth). No new data structures needed -- the existing `skills.ts` IS the graph definition.

**When to use:** For the SkillMapScreen.

**Why this pattern:** Zero data duplication. The SKILLS array is already the single source of truth for the prerequisite graph. The visual map is a pure derivation. Any future skill additions automatically appear on the map.

**Example:**
```typescript
// src/services/gamification/skillMapLayout.ts

export interface SkillNodeLayout {
  readonly skillId: string;
  readonly x: number;
  readonly y: number;
  readonly depth: number; // topological depth from roots
  readonly mastery: 'locked' | 'unlocked' | 'practicing' | 'mastered';
}

export function computeSkillMapLayout(
  skills: readonly SkillDefinition[],
  skillStates: Record<string, SkillState>,
): SkillNodeLayout[] {
  // 1. Compute depth via BFS from root skills
  // 2. Assign x = depth, y = index within depth layer
  // 3. Derive mastery status from skillStates + prerequisiteGating
}
```

### Pattern 5: Theme System via React Context Provider with Store-Driven Selection

**What:** A `ThemeProvider` wraps the app and reads `equippedThemeId` from gamificationSlice. It provides the active color palette via React context. Components consume `useTheme()` instead of importing `colors` directly from `@/theme`. The default theme is the current dark navy palette. Additional themes are unlockable cosmetic skins.

**When to use:** For all theme-aware components. Non-theme-aware components (deep utilities, services) continue importing constants directly.

**Why this pattern:** Minimal migration cost. The current `colors` import still works as the default. New components and gradually migrated existing components use `useTheme()`. Theme switching is instant (context re-render, no store write latency). Follows React idiom.

**Trade-offs:** Requires gradual migration of existing `colors` imports to `useTheme()` in theme-affected components (screens, not services). However, this can be done incrementally -- only session-wrapper and home screen need immediate migration.

**Example:**
```typescript
// src/theme/ThemeProvider.tsx

const ThemeContext = React.createContext(DEFAULT_THEME);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const equippedThemeId = useAppStore((s) => s.equippedThemeId);
  const theme = THEMES[equippedThemeId ?? 'default'] ?? DEFAULT_THEME;
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
```

### Pattern 6: Avatar Frame as Layered View Composition

**What:** The avatar display becomes a composable `AvatarDisplay` component that layers: (1) frame ring (SVG/View border with theme color), (2) avatar emoji, (3) optional level badge overlay. Frame rings are unlockable cosmetics tied to achievements.

**When to use:** HomeScreen avatar, ResultsScreen, AvatarScreen preview.

**Why this pattern:** The current avatar is a simple emoji in a circle. Frames are purely visual overlays that don't change the underlying data. The `AvatarId` type and `AVATARS` constant remain unchanged. Only `equippedFrameId` is added to gamificationSlice.

## Data Flow

### Achievement Evaluation Flow

```
Session completes
    |
    v
commitSessionResults()
    |  (existing: write Elo, XP, level, streak)
    |
    v
evaluateAchievements(ctx)    <-- NEW: pure function call
    |  reads: skillStates, xp, level, streak, misconceptions,
    |         exploredManipulatives, earnedBadges, sessionScore
    |
    v
returns: newBadgeIds[]
    |
    v
achievementSlice.unlockBadges(newBadgeIds)    <-- NEW: store write
    |
    v
ResultsScreen route params include newBadgeIds    <-- NEW: display
    |
    v
BadgePopup animation on Results screen
```

### Daily Challenge Flow

```
HomeScreen mounts
    |
    v
generateDailyChallenge(today, skillStates)    <-- pure function
    |
    v
DailyChallengeCard displays challenge
    |
    v
User taps "Accept Challenge"
    |
    v
navigation.navigate('Session', {
  sessionId: ...,
  isDailyChallenge: true,
  challengeId: challenge.id,
})
    |
    v
SessionScreen renders ChallengeBanner (goal overlay)
    |
    v
Session completes normally (same session flow)
    |
    v
commitSessionResults() evaluates challenge goal
    |
    v
dailyChallengeSlice.markCompleted(challengeId, passed)
    |
    v
ResultsScreen shows challenge result + bonus XP if passed
```

### Theme Application Flow

```
App starts
    |
    v
ThemeProvider reads equippedThemeId from gamificationSlice
    |
    v
Provides theme colors via React Context
    |
    v
Components call useTheme() for color values
    |
    v
User selects new theme in AvatarScreen
    |
    v
gamificationSlice.setEquippedThemeId(id)
    |
    v
ThemeProvider re-renders, all consumers update
```

### Skill Map Data Flow

```
SkillMapScreen mounts
    |
    v
Read SKILLS array (static import)    +    Read skillStates (store selector)
    |                                       |
    v                                       v
computeSkillMapLayout(SKILLS, skillStates)
    |
    v
SkillNodeLayout[] with positions + mastery status
    |
    v
MapCanvas renders ScrollView with:
  - SkillEdge components (SVG lines for prerequisites)
  - SkillNode components (circles with mastery coloring)
    |
    v
Tap SkillNode -> show detail popover (mastery %, BKT, Leitner box)
```

## Store Schema Changes

### New Slice: achievementSlice

```typescript
export interface AchievementRecord {
  readonly badgeId: string;
  readonly earnedAt: string;  // ISO string
  viewed: boolean;            // false until user sees the badge popup
}

export interface AchievementSlice {
  achievements: Record<string, AchievementRecord>;  // keyed by badgeId
  totalSessions: number;      // lifetime session count (for effort badges)
  totalCorrect: number;       // lifetime correct answers (for effort badges)
  totalAttempts: number;      // lifetime total attempts (for effort badges)
  unlockBadges: (badgeIds: string[]) => void;
  markBadgeViewed: (badgeId: string) => void;
  incrementSessionStats: (correct: number, total: number) => void;
}
```

**Rationale for `totalSessions/totalCorrect/totalAttempts` here vs. computing from skillStates:**
The skillStates track per-skill attempts/correct, but summing across all skills on every evaluation is O(n). Keeping lifetime counters in the achievement slice avoids repeated computation and enables simple threshold checks in badge predicates. The counters are incremented once per session in commitSessionResults, which already iterates pendingUpdates.

### New Slice: dailyChallengeSlice

```typescript
export interface DailyChallengeState {
  currentChallengeId: string | null;  // date string, e.g., "2026-03-04"
  challengeCompleted: boolean;
  challengePassed: boolean;
  bonusXpAwarded: number;
}

export interface DailyChallengeSlice {
  dailyChallenge: DailyChallengeState;
  setDailyChallenge: (challengeId: string) => void;
  markChallengeCompleted: (passed: boolean, bonusXp: number) => void;
  resetDailyChallenge: () => void;
}
```

**Rationale:** Ephemeral-ish -- only today's challenge matters. On new day, `resetDailyChallenge()` is called. Persisted to survive app restarts within the same day.

### Modified Slice: gamificationSlice

Add three fields:

```typescript
export interface GamificationSlice {
  // ... existing fields (xp, level, weeklyStreak, lastSessionDate)
  equippedThemeId: string | null;   // NEW: currently active theme
  equippedFrameId: string | null;   // NEW: avatar frame ring
  setEquippedThemeId: (id: string | null) => void;  // NEW
  setEquippedFrameId: (id: string | null) => void;  // NEW
}
```

### Migration Plan: STORE_VERSION 8 -> 10

```typescript
// migrations.ts additions

if (version < 9) {
  // v8 -> v9: Add achievement tracking + cosmetic equips
  state.achievements ??= {};
  state.totalSessions ??= 0;
  state.totalCorrect ??= 0;
  state.totalAttempts ??= 0;
  state.equippedThemeId ??= null;
  state.equippedFrameId ??= null;
}

if (version < 10) {
  // v9 -> v10: Add daily challenge state
  state.dailyChallenge ??= {
    currentChallengeId: null,
    challengeCompleted: false,
    challengePassed: false,
    bonusXpAwarded: 0,
  };
}
```

**Rationale for two versions, not one:** Achievements and daily challenges are independent features. If one ships before the other (phased rollout), each has its own migration boundary. This matches the v6->v7->v8 pattern used for misconception tracking.

### Updated partialize (appStore.ts)

```typescript
partialize: (state) => ({
  // ...existing fields
  childName: state.childName,
  childAge: state.childAge,
  childGrade: state.childGrade,
  avatarId: state.avatarId,
  tutorConsentGranted: state.tutorConsentGranted,
  skillStates: state.skillStates,
  xp: state.xp,
  level: state.level,
  weeklyStreak: state.weeklyStreak,
  lastSessionDate: state.lastSessionDate,
  exploredManipulatives: state.exploredManipulatives,
  misconceptions: state.misconceptions,
  // NEW: v0.7 additions
  achievements: state.achievements,
  totalSessions: state.totalSessions,
  totalCorrect: state.totalCorrect,
  totalAttempts: state.totalAttempts,
  equippedThemeId: state.equippedThemeId,
  equippedFrameId: state.equippedFrameId,
  dailyChallenge: state.dailyChallenge,
}),
```

## Navigation Changes

### New Routes

```typescript
// navigation/types.ts additions

export type RootStackParamList = {
  // ...existing routes
  SkillMap: undefined;
  Avatar: undefined;
};
```

Both new screens take no params. SkillMap reads SKILLS + skillStates from store. Avatar reads avatarId, equippedThemeId, equippedFrameId from store.

### Navigation Entry Points

| Entry Point | Target Screen | Trigger |
|-------------|--------------|---------|
| HomeScreen avatar circle tap | Avatar | Tap profile avatar |
| HomeScreen "Skill Map" button (new) | SkillMap | Tap button in explore section |
| HomeScreen badge count (new) | Overlay/modal with BadgeGrid | Tap badge count |
| ResultsScreen badge earned | BadgePopup overlay | Auto-shown when newBadges.length > 0 |
| AvatarScreen theme/frame selection | Stay on Avatar | In-screen selection |

## Recommended Project Structure (new files only)

```
src/
  store/
    slices/
      achievementSlice.ts       # Badge records, lifetime stats
      dailyChallengeSlice.ts    # Today's challenge state
    constants/
      badges.ts                 # Badge ID type, categories
      themes.ts                 # Theme palettes + unlock conditions
      frames.ts                 # Frame ring definitions
  services/
    gamification/
      achievementEngine.ts      # Pure evaluator function
      achievementDefinitions.ts # Badge array with predicates
      dailyChallengeScheduler.ts # Date-seeded challenge gen
      themeRegistry.ts          # Theme color mappings
      skillMapLayout.ts         # DAG layout computation
  screens/
    SkillMapScreen.tsx          # Interactive prerequisite DAG
    AvatarScreen.tsx            # Avatar + frame + theme picker
  components/
    badges/
      BadgeCard.tsx             # Single badge (locked/unlocked)
      BadgePopup.tsx            # Unlock celebration overlay
      BadgeGrid.tsx             # All badges scrollable grid
      index.ts
    skillmap/
      SkillNode.tsx             # DAG node circle
      SkillEdge.tsx             # DAG edge SVG path
      MapCanvas.tsx             # Scrollable container
      index.ts
    avatar/
      AvatarGrid.tsx            # Emoji avatar selection
      FrameSelector.tsx         # Frame ring options
      ThemePicker.tsx           # Theme skin options
      AvatarDisplay.tsx         # Composable avatar view (frame + emoji + badge)
      index.ts
    home/
      DailyChallengeCard.tsx    # Challenge card on home screen
  theme/
    ThemeProvider.tsx            # React Context for active theme
    themes.ts                   # Theme variant color palettes
```

### Structure Rationale

- **`store/slices/`:** Two new slices follow the established domain-slice pattern. achievementSlice is persisted (lifetime data). dailyChallengeSlice is persisted (survives app restart within day).
- **`services/gamification/`:** Extends the existing gamification service folder. Achievement engine and definitions are separate files to keep definitions (data) apart from evaluation logic. Matches the mathEngine pattern of separating `skills.ts` (definitions) from calculation code.
- **`components/badges/`, `skillmap/`, `avatar/`:** Each feature gets its own component folder with barrel export, matching the existing `manipulatives/`, `chat/`, `session/` pattern.
- **`theme/ThemeProvider.tsx`:** Lives alongside existing `theme/index.ts`. The provider wraps the app in `App.tsx`.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 14 skills (current) | DAG layout is trivial. Linear scan of badge conditions is fine. |
| 50 skills (future) | DAG layout needs proper layered algorithm (Sugiyama). Badge evaluation still O(badges * skills) which is fine up to hundreds. |
| 100+ badges (future) | Consider indexing badges by trigger event (skill mastery, session complete, etc.) to avoid evaluating all predicates on every session. |

### Scaling Priorities

1. **First bottleneck (unlikely):** Badge evaluation on session commit. With 30-50 badges and 14 skills, this is microseconds. No concern until hundreds of badges.
2. **Second bottleneck (possible):** Skill map rendering with 50+ nodes. React Native's layout engine handles this fine with `ScrollView`. Only becomes an issue with 200+ nodes, which would need virtualization.

## Anti-Patterns

### Anti-Pattern 1: Coupling Badge Logic to UI Components

**What people do:** Check badge conditions inside screen components or useEffect hooks.
**Why it's wrong:** Scatters achievement logic across the codebase. Makes testing require full component rendering. Creates race conditions when multiple components evaluate simultaneously.
**Do this instead:** All badge evaluation happens in `achievementEngine.evaluate()`, called exactly once per session commit in `commitSessionResults`. UI only reads the resulting achievementSlice state.

### Anti-Pattern 2: Mutable Badge Definitions

**What people do:** Store badge definitions in the Zustand store or make them editable.
**Why it's wrong:** Badge definitions are application constants, not user data. Putting them in the store means persisting them, migrating them, and syncing them. Bloats store size.
**Do this instead:** Badge definitions are `readonly` TypeScript constants imported from `achievementDefinitions.ts`. The store only tracks which badges are earned (IDs + timestamps).

### Anti-Pattern 3: Server-Dependent Daily Challenges

**What people do:** Fetch daily challenges from an API endpoint.
**Why it's wrong:** Requires a backend (this app has none). Fails offline. Adds latency. Over-engineered for a single-player children's app.
**Do this instead:** Generate challenges deterministically from the date using the existing seeded PRNG (Mulberry32). Same date = same challenge. Fully offline.

### Anti-Pattern 4: Persisting Theme Colors in the Store

**What people do:** Store the entire color palette object in Zustand.
**Why it's wrong:** Duplicates static data. Requires migration when theme palettes change. Bloats persisted state.
**Do this instead:** Store only `equippedThemeId: string | null` in the store. Resolve the actual colors at runtime from the static `themeRegistry`. Theme palette changes in code updates propagate automatically.

### Anti-Pattern 5: Re-computing Skill Map Layout on Every Render

**What people do:** Call `computeSkillMapLayout()` inside the render function of SkillMapScreen.
**Why it's wrong:** Layout computation involves topological sort and position calculation. While fast for 14 nodes, it's unnecessary work on every re-render.
**Do this instead:** Use `useMemo` with `[skillStates]` dependency. Layout only recomputes when skill states change (mastery transitions), which happens at most once per session.

### Anti-Pattern 6: Punitive Unlock Loss

**What people do:** Lock previously earned badges/themes/frames if the underlying condition is no longer met (e.g., streak resets, mastery lost).
**Why it's wrong:** The existing codebase has an explicit no-re-locking policy for skills. Taking away earned cosmetics from a 6-year-old causes distress and violates the "no punitive mechanics" design principle.
**Do this instead:** Once earned, always earned. Badges, themes, and frames are permanent. The `AchievementRecord.earnedAt` timestamp is immutable. The `equippedThemeId` might reference a theme earned during a streak that later reset -- that is fine.

## Integration Points

### Session Orchestrator Integration

The primary integration point is `commitSessionResults()` in `sessionOrchestrator.ts`. This function already handles the atomic commit pattern (Elo + XP + level + streak). The achievement evaluation call is added after existing commits:

```typescript
// In commitSessionResults(), after existing logic:

// NEW: Evaluate achievements
const achievementCtx: AchievementEvalContext = {
  skillStates: /* read from store after updates */,
  xp: newTotalXp,
  level: levelResult.newLevel,
  weeklyStreak: streakResult.newStreak,
  totalSessions: currentTotalSessions + 1,
  totalCorrect: currentTotalCorrect + sessionCorrect,
  totalAttempts: currentTotalAttempts + sessionTotal,
  misconceptions: /* read from store */,
  exploredManipulatives: /* read from store */,
  earnedBadgeIds: new Set(Object.keys(currentAchievements)),
  sessionScore: score,
  sessionTotal: total,
  isDailyChallenge: isDailyChallenge,
};

const newBadgeIds = evaluateAchievements(achievementCtx);
if (newBadgeIds.length > 0) {
  unlockBadges(newBadgeIds);
}
incrementSessionStats(sessionCorrect, sessionTotal);

// Return newBadgeIds in SessionFeedback for ResultsScreen
```

**Important:** The `commitSessionResults` function signature will need additional parameters (achievementSlice actions, current achievement state). This is consistent with how it grew to include streak parameters in earlier versions. Consider refactoring to accept a single `StoreActions` object to prevent parameter sprawl.

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| achievementEngine <-> store | Pure function reads snapshot, caller writes results | No direct store access in engine |
| dailyChallengeScheduler <-> store | Pure function generates challenge, screen reads/writes | Scheduler has no store dependency |
| SkillMapScreen <-> SKILLS array | Static import, read-only | No coupling to session flow |
| ThemeProvider <-> gamificationSlice | React context reads one field from store | One-way data flow |
| HomeScreen <-> achievementSlice | Selector reads badge count + unviewed count | Display-only |
| ResultsScreen <-> route params | newBadgeIds passed via navigation params | Follows existing pattern (score, xp, etc.) |
| SessionScreen <-> dailyChallengeSlice | Reads isDailyChallenge from route params | Challenge state managed externally |

## Build Order (Suggested Phase Sequence)

The features have the following dependency graph:

```
achievementSlice + achievementEngine (foundation)
    |
    +--- BadgeCard + BadgeGrid + BadgePopup (display layer)
    |       |
    |       +--- HomeScreen badge count (integration)
    |       +--- ResultsScreen badge earned (integration)
    |
dailyChallengeSlice + dailyChallengeScheduler (independent of badges)
    |
    +--- DailyChallengeCard (display)
    |       |
    |       +--- HomeScreen integration
    |       +--- SessionScreen challenge banner
    |       +--- ResultsScreen challenge result
    |
SkillMapScreen + layout service (independent, read-only data)
    |
    +--- HomeScreen entry point
    |
ThemeProvider + themeRegistry (independent)
    |
    +--- AvatarScreen (depends on theme + frame)
    |       |
    |       +--- HomeScreen avatar tap navigation
    |
Avatar frames + AvatarDisplay (depends on gamificationSlice frame field)
```

**Recommended build order:**

1. **Achievement system** (store + engine + definitions) -- foundation that other features reference for unlock conditions
2. **Badge UI components** (BadgeCard, BadgePopup, BadgeGrid) -- visual layer for achievements
3. **Badge integration** (HomeScreen, ResultsScreen, commitSessionResults) -- wire up the system
4. **Skill map** (layout service + SkillMapScreen + components) -- independent, can parallel with badges
5. **Daily challenges** (scheduler + slice + DailyChallengeCard + session integration) -- independent
6. **Theme system** (ThemeProvider + themeRegistry + AvatarScreen themes tab) -- needs achievement system for unlock conditions
7. **Avatar frames** (frame definitions + FrameSelector + AvatarDisplay) -- needs achievement system for unlock conditions
8. **AvatarScreen** (combines avatar + frame + theme selection) -- depends on theme + frame systems

Items 4 and 5 can be built in parallel with 2-3. Items 6-8 depend on 1 being complete.

## Sources

- Existing codebase analysis: `src/store/`, `src/services/`, `src/screens/`, `src/navigation/`
- Existing gamification research: `.planning/07-gamification.md`
- Zustand v5 slice pattern: established in codebase across 7 slices
- React Navigation 7 native-stack: established in `AppNavigator.tsx`
- SKILLS DAG definition: `src/services/mathEngine/skills.ts` (14 skills, 2 root nodes)
- BKT mastery system: `src/services/adaptive/bktCalculator.ts`
- Prerequisite gating: `src/services/adaptive/prerequisiteGating.ts`
- Session orchestrator commit pattern: `src/services/session/sessionOrchestrator.ts`
- Migration chain: `src/store/migrations.ts` (versions 1-8)
- Avatar constants: `src/store/constants/avatars.ts`
- Theme constants: `src/theme/index.ts`

---
*Architecture research for: Gamification features integration into Tiny Tallies v0.7*
*Researched: 2026-03-04*
