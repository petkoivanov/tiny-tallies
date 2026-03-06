# Architecture Research

**Domain:** Multi-child profiles, parent dashboard, parental controls, freemium IAP subscription
**Researched:** 2026-03-05
**Confidence:** HIGH (existing codebase well-understood; IAP integration patterns well-documented)

## System Overview

```
                    CURRENT (v0.7)                         NEW (v0.8)
                    ============                           ========

  Navigation:       Flat Stack                  -->   Nested: Main Stack + Parent Stack
                    (Home, Session, ...)              PIN-gated parent area

  Store:            Single-child flat state     -->   Multi-child with activeChildId
                    STORE_VERSION=12                   Children map + per-child data
                                                      STORE_VERSION=13-15

  New Slices:       --                          -->   profilesSlice (children map)
                                                      parentControlsSlice (time caps)
                                                      subscriptionSlice (IAP state)

  New Services:     --                          -->   subscription/ (IAP lifecycle)
                                                      analytics/ (dashboard computations)
                                                      timeControls/ (enforcement)

  External:         Gemini LLM                  -->   + RevenueCat (IAP backend)
```

## The Core Problem: Single-Child to Multi-Child

The current store is flat -- all child data (skillStates, xp, level, misconceptions, badges, challenges, etc.) lives at the top level of a single persisted Zustand store. There is no concept of "which child" because there is only one.

Multi-child support requires restructuring persisted data so each child has an independent copy of all learning state. Two viable approaches exist:

### Approach A: Children Map with activeChildId (RECOMMENDED)

Wrap all per-child state into a `children` map keyed by child ID. An `activeChildId` field points to the currently selected child. Existing slices continue to read/write flat state, but `switchChild` maps between `children[activeChildId].*` and the flat state on profile switch.

```typescript
// New top-level structure in profilesSlice
interface ProfilesSlice {
  activeChildId: string | null;
  children: Record<string, ChildData>;
  addChild: (child: NewChildInput) => void;
  switchChild: (childId: string) => void;
  removeChild: (childId: string) => void;
  updateChild: (childId: string, updates: Partial<ChildMeta>) => void;
}

interface ChildData {
  // Identity (was in childProfileSlice)
  id: string;
  childName: string;
  childAge: number;
  childGrade: number;
  avatarId: AllAvatarId;
  frameId: FrameId | null;
  themeId: ThemeId;
  createdAt: string;

  // Learning state (was flat at store root)
  skillStates: Record<string, SkillState>;
  xp: number;
  level: number;
  weeklyStreak: number;
  lastSessionDate: string | null;
  sessionsCompleted: number;
  misconceptions: Record<string, MisconceptionRecord>;
  earnedBadges: Record<string, EarnedBadge>;
  challengeCompletions: Record<string, ChallengeCompletion>;
  challengesCompleted: number;
  exploredManipulatives: ManipulativeType[];
  tutorConsentGranted: boolean;

  // NEW: session history for parent dashboard analytics
  sessionHistory: SessionHistoryEntry[];
}
```

**Why this approach:** Existing slices (skillStatesSlice, gamificationSlice, misconceptionSlice, etc.) remain **unchanged**. The `switchChild` action hydrates the flat state from `children[newId]` and saves the current flat state back to `children[oldId]`. This is a "copy-on-switch" pattern -- the active child's data lives in the familiar flat shape during use, and gets serialized back to the children map on switch.

**Trade-off:** Slight data duplication during active use (data in both flat state and children map). Acceptable because the children map is the source of truth and flat state is a working copy.

### Approach B: Separate AsyncStorage key per child (REJECTED)

Each child gets its own Zustand persist key (`tiny-tallies-child-${id}`). Switching children reinitializes the store from a different key.

**Why NOT this approach:** Zustand persist does not support dynamic storage keys. Reinitializing the store causes component unmount/remount cascades. The parent dashboard needs to read ALL children's data simultaneously for comparison charts, which requires loading multiple storage keys. Much more complex with no benefit.

## Component Responsibilities

| Component | Responsibility | New vs Modified |
|-----------|----------------|-----------------|
| `profilesSlice` | Children map, activeChildId, add/switch/remove, save/load flat state | **NEW** |
| `parentControlsSlice` | Daily time cap, bedtime window, break reminders per child | **NEW** |
| `subscriptionSlice` | Subscription tier, expiry, entitlements (ephemeral -- source of truth is IAP store) | **NEW** |
| `childProfileSlice` | Unchanged -- continues as working copy of active child's identity fields | **UNCHANGED** |
| `gamificationSlice` | Unchanged internally -- data now scoped per-child via profilesSlice | **UNCHANGED** |
| `skillStatesSlice` | Unchanged internally | **UNCHANGED** |
| `misconceptionSlice` | Unchanged internally | **UNCHANGED** |
| `achievementSlice` | Unchanged internally | **UNCHANGED** |
| `challengeSlice` | Unchanged internally | **UNCHANGED** |
| `sandboxSlice` | Unchanged internally | **UNCHANGED** |
| `tutorSlice` | Unchanged internally (already ephemeral) | **UNCHANGED** |
| `appStore.ts` | Add new slices to compose, update partialize, bump STORE_VERSION | **MODIFIED** |
| `migrations.ts` | Add v12->v13 (profiles), v13->v14 (parent controls), v14->v15 (subscription bootstrap) | **MODIFIED** |
| `AppNavigator.tsx` | Add new screens, nest parent stack | **MODIFIED** |
| `HomeScreen.tsx` | Add child switcher component, parent button, session count display | **MODIFIED** |

## Recommended Project Structure

```
src/
  store/
    slices/
      profilesSlice.ts              # NEW: multi-child management
      parentControlsSlice.ts         # NEW: time caps, bedtime config
      subscriptionSlice.ts           # NEW: IAP state (ephemeral, NOT persisted)
      childProfileSlice.ts           # EXISTING: unchanged
      gamificationSlice.ts           # EXISTING: unchanged
      skillStatesSlice.ts            # EXISTING: unchanged
      misconceptionSlice.ts          # EXISTING: unchanged
      achievementSlice.ts            # EXISTING: unchanged
      challengeSlice.ts              # EXISTING: unchanged
      sandboxSlice.ts                # EXISTING: unchanged
      sessionStateSlice.ts           # EXISTING: unchanged
      tutorSlice.ts                  # EXISTING: unchanged
    appStore.ts                      # MODIFIED: compose new slices
    migrations.ts                    # MODIFIED: v12->v15
  services/
    subscription/                    # NEW
      subscriptionService.ts         # IAP lifecycle (init, purchase, restore)
      subscriptionTypes.ts           # Tier, entitlements, product IDs
      paywallGuard.ts                # Feature gating logic (pure function)
      __tests__/
    analytics/                       # NEW
      dashboardAnalytics.ts          # Compute stats from session history
      trendCalculator.ts             # Weekly/monthly trend lines
      analyticsTypes.ts              # Dashboard data shapes
      __tests__/
    timeControls/                    # NEW
      timeControlService.ts          # Enforce caps, bedtime, breaks
      timeControlTypes.ts            # Config shapes
      __tests__/
    consent/
      parentalPin.ts                 # EXISTING: reused for parent dashboard gate
  screens/
    ProfileSwitcherScreen.tsx         # NEW: child selector + add child
    AddChildScreen.tsx                # NEW: onboarding form for new child
    ParentDashboardScreen.tsx         # NEW: analytics overview (PIN-gated)
    ChildProgressScreen.tsx           # NEW: per-child detail view
    TimeControlsScreen.tsx            # NEW: configure caps/bedtime
    SubscriptionScreen.tsx            # NEW: paywall/manage subscription
    HomeScreen.tsx                    # MODIFIED: child switcher + parent button
    ThemePickerScreen.tsx             # MODIFIED: premium gating on themes
  components/
    parent/                           # NEW
      ProgressChart.tsx               # Skill progress bar chart
      SessionHistoryList.tsx          # Recent sessions list
      MisconceptionBreakdown.tsx      # Misconception status overview
      ChildCard.tsx                   # Child summary card for dashboard
      TrendLine.tsx                   # Weekly/monthly trend sparkline
      index.ts
    subscription/                     # NEW
      PaywallCard.tsx                 # Premium feature upgrade prompt
      SubscriptionBadge.tsx           # "Premium" indicator badge
      index.ts
    profiles/                         # NEW
      ChildSwitcher.tsx               # Compact profile switcher for home screen
      ChildAvatar.tsx                 # Small avatar circle for switcher
      index.ts
  navigation/
    AppNavigator.tsx                  # MODIFIED: add new screens
    ParentNavigator.tsx               # NEW: nested stack for parent screens
    types.ts                          # MODIFIED: add new screen params
  hooks/
    useSubscription.ts                # NEW: subscription state + feature guards
    useTimeControls.ts                # NEW: time enforcement for sessions
    useActiveChild.ts                 # NEW: convenience selectors for active child
    useSessionCounter.ts              # NEW: count today's sessions for free tier
    useSaveActiveChild.ts             # NEW: sync flat state back to children map
```

### Structure Rationale

- **`store/slices/profilesSlice.ts`:** Central orchestrator for multi-child. Owns the children map and the critical `switchChild` action that hydrates/dehydrates flat state. All existing slices remain untouched.
- **`services/subscription/`:** Isolated from store because IAP lifecycle involves async native API calls. Store only holds derived state (tier, entitlements). Service manages the native IAP API via RevenueCat SDK.
- **`services/analytics/`:** Pure computation functions that derive dashboard data from session history and skill states. No store coupling -- takes data as arguments, returns computed results. Follows the same pattern as the achievement evaluation engine.
- **`services/timeControls/`:** Pure enforcement logic. Takes current time + config + session history, returns {canPlay, remainingMinutes, lockReason}. No side effects.
- **`navigation/ParentNavigator.tsx`:** Nested stack accessed after PIN verification. Reuses the existing `parentalPin.ts` service. No separate auth flow needed -- just verify PIN on button press, then navigate.

## Architectural Patterns

### Pattern 1: Copy-on-Switch for Multi-Child Profiles

**What:** Active child's data lives in flat store shape (unchanged from v0.7). On profile switch, current flat state is serialized back into `children[currentId]`, then new child's data is hydrated into flat state from `children[newId]`.

**When to use:** When adding multi-entity support to an existing single-entity store without rewriting all consumers.

**Trade-offs:**
- Pro: Zero changes to existing slice actions, selectors, and screen components
- Pro: All ~1,400 existing tests continue to pass without modification
- Pro: New child creation just inserts a fresh ChildData with defaults
- Con: `switchChild` is a complex action touching many state fields
- Con: Must ensure no session is active during switch (guard required)
- Con: Must remember to save before app background (auto-save hook)

**Example:**
```typescript
switchChild: (newChildId: string) => set((state) => {
  if (state.isSessionActive) return state; // Guard: no switch mid-session

  const currentId = state.activeChildId;
  const children = { ...state.children };

  // Save current child's flat state back to children map
  if (currentId && children[currentId]) {
    children[currentId] = saveChildFromFlatState(state, children[currentId]);
  }

  // Hydrate new child's state into flat fields
  const newChild = children[newChildId];
  return {
    ...loadChildToFlatState(newChild),
    activeChildId: newChildId,
    children,
  };
}),
```

Helper functions `saveChildFromFlatState` and `loadChildToFlatState` centralize the field mapping to avoid repetition and ensure no fields are missed:

```typescript
// In store/helpers/profileHelpers.ts
const PER_CHILD_FIELDS = [
  'childName', 'childAge', 'childGrade', 'avatarId', 'frameId', 'themeId',
  'skillStates', 'xp', 'level', 'weeklyStreak', 'lastSessionDate',
  'sessionsCompleted', 'misconceptions', 'earnedBadges',
  'challengeCompletions', 'challengesCompleted', 'exploredManipulatives',
  'tutorConsentGranted',
] as const;
```

### Pattern 2: Ephemeral Subscription State (Not Persisted)

**What:** Subscription tier and entitlements are NOT persisted in Zustand. The source of truth is the App Store / Play Store (via RevenueCat). On app launch, the service queries the store and hydrates the ephemeral slice.

**When to use:** For any state where an external system is the authority (subscriptions, auth tokens).

**Trade-offs:**
- Pro: No stale subscription state if user cancels/upgrades outside app
- Pro: No migration complexity for subscription schema changes
- Pro: No risk of users tampering with cached subscription state
- Con: Requires async initialization on app launch (brief loading state)
- Con: First launch in airplane mode defaults to free tier

**Example:**
```typescript
interface SubscriptionSlice {
  subscriptionTier: 'free' | 'premium';
  subscriptionExpiry: string | null;
  isSubscriptionLoading: boolean;
  setSubscriptionState: (tier: 'free' | 'premium', expiry: string | null) => void;
  setSubscriptionLoading: (loading: boolean) => void;
}

// CRITICAL: NOT included in partialize -- ephemeral only
// Default on app launch is 'free' + loading=true until RevenueCat responds
```

### Pattern 3: Append-Only Session History with Cap

**What:** Each completed session appends a `SessionHistoryEntry` to the active child's data in the children map. Capped at 200 entries per child (oldest entries dropped via shift) to bound AsyncStorage size.

**When to use:** When analytics require historical data but unlimited growth would bloat storage.

**Trade-offs:**
- Pro: Simple append, no complex aggregation at write time
- Pro: Cap prevents unbounded storage growth (200 entries * ~200 bytes each = ~40KB per child)
- Pro: Parent dashboard computes analytics on-demand from raw history (no stale aggregates)
- Con: Loses data beyond 200 sessions (~6-12 months of typical use, acceptable)

**Example:**
```typescript
interface SessionHistoryEntry {
  sessionId: string;
  date: string;                    // ISO date string
  durationMs: number;
  score: number;
  total: number;
  xpEarned: number;
  skillsWorked: string[];          // skill IDs touched in session
  mode: 'normal' | 'remediation' | 'challenge';
  misconceptionsTriggered: number; // count (not keys -- COPPA minimal data)
}
```

### Pattern 4: Feature Gating via Pure Paywall Guard

**What:** A pure function `canAccess(feature, tier)` determines whether the current subscription tier allows a given feature. Used by hooks and screens to conditionally render premium UI or redirect to the paywall.

**When to use:** At every premium feature boundary (AI tutor, unlimited sessions, themes, detailed parent analytics).

**Trade-offs:**
- Pro: Single source of truth for what is free vs premium
- Pro: Testable without IAP infrastructure
- Pro: Easy to adjust tier boundaries during A/B testing
- Con: Must be checked at both UI and service level (defense in depth)

**Example:**
```typescript
type GatedFeature =
  | 'aiTutor'
  | 'unlimitedSessions'
  | 'allThemes'
  | 'detailedAnalytics';

const FREE_LIMITS = {
  sessionsPerDay: 3,
  themes: ['dark'] as const,  // Only default theme
} as const;

function canAccess(feature: GatedFeature, tier: 'free' | 'premium'): boolean {
  if (tier === 'premium') return true;
  // All gated features are premium-only
  return false;
}

function getRemainingFreeSessions(
  todaySessionCount: number,
  tier: 'free' | 'premium',
): number {
  if (tier === 'premium') return Infinity;
  return Math.max(0, FREE_LIMITS.sessionsPerDay - todaySessionCount);
}
```

### Pattern 5: Auto-Save on App Background

**What:** A `useSaveActiveChild` hook listens to AppState changes (active -> background/inactive) and saves the current flat state back to `children[activeChildId]`. This ensures no data loss if the app is killed while a child is active.

**When to use:** Mounted once in App.tsx or the root navigator.

**Why necessary:** The copy-on-switch pattern only saves to the children map during explicit `switchChild` calls. If the app is backgrounded and killed without switching, the flat state has unsaved changes. This hook provides the safety net.

```typescript
function useSaveActiveChild() {
  const saveActiveChild = useAppStore((s) => s.saveActiveChild);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        saveActiveChild();
      }
    });
    return () => sub.remove();
  }, [saveActiveChild]);
}
```

## Data Flow

### Profile Switch Flow

```
[ChildSwitcher on HomeScreen] --(tap different child avatar)-->
  profilesSlice.switchChild(newChildId) -->
    1. Guard: reject if isSessionActive === true
    2. Save current flat state -> children[currentId]
    3. Load children[newChildId] -> flat state fields
    4. Set activeChildId = newChildId
  --> [All subscribed components re-render with new child's data]
  --> [HomeScreen shows new child's name, XP, level, avatar, streak]
```

### Session Completion Flow (Modified for v0.8)

```
[SessionScreen endSession] -->
  commitSessionResults() (existing flow):
    1. Commit Elo/XP/BKT updates (existing)
    2. Evaluate badges (existing)
    3. Record misconceptions (existing)
  NEW additions after existing flow:
    4. Create SessionHistoryEntry from session data
    5. Append to children[activeChildId].sessionHistory (capped at 200)
    6. Save flat state to children[activeChildId]
    7. Check daily session count for free tier limit
  --> [ResultsScreen displays as usual]
  --> [If free tier + session limit reached, show upgrade nudge on return to Home]
```

### Subscription Initialization Flow

```
[App Launch] -->
  subscriptionSlice.setSubscriptionLoading(true) -->
  [subscriptionService.initialize()] -->
    1. Purchases.configure({ apiKey }) via RevenueCat SDK
    2. Purchases.getCustomerInfo() to check active subscriptions
    3. Map entitlements to tier ('free' | 'premium')
  --> subscriptionSlice.setSubscriptionState(tier, expiry)
  --> subscriptionSlice.setSubscriptionLoading(false)
  --> [Components reading useSubscription() now have tier info]
```

### Feature Gating Flow (AI Tutor Example)

```
[User taps Help button during session] -->
  [useSubscription().tier check] -->
    tier === 'premium'? -->
      YES: show ChatPanel (existing AI tutor flow)
      NO: show PaywallCard with "Upgrade for AI Help" -->
        [User taps Upgrade] -->
          navigation.navigate('Subscription') -->
            [RevenueCat paywall] -->
              [Purchase success] -->
                subscriptionSlice.setSubscriptionState('premium', expiry) -->
                [navigation.goBack()] -->
                [Help button now works]
```

### Time Controls Enforcement Flow

```
[HomeScreen mounts / Start Practice tapped] -->
  [useTimeControls hook] -->
    1. Read parentControls config for activeChildId
    2. Get current time, check vs bedtime window
    3. Count today's total session duration from sessionHistory
    4. Compare accumulated time against daily cap
  --> returns { canStartSession, remainingMinutes, isLocked, lockReason }
  --> [If locked: disable Start Practice, show lock reason message]
  --> [If near limit: show remaining time warning]
```

### Parent Dashboard Flow (PIN-Gated)

```
[HomeScreen "Parent Dashboard" button] -->
  [verifyParentalPin() via existing parentalPin.ts service] -->
    PIN correct? -->
      YES: navigation.navigate('ParentDashboard') -->
        1. Read ALL children from profilesSlice.children
        2. For each child: dashboardAnalytics.computeOverview(child)
        3. Render ChildCard grid with summary stats
        4. Tap child -> ChildProgressScreen(childId) -->
          - Skill mastery breakdown
          - Session history list
          - Misconception status
          - Trend charts (weekly accuracy, time spent)
      NO: show error, stay on HomeScreen
```

## Migration Strategy: v12 to v15

### v12 -> v13: Multi-Child Profiles (Critical Migration)

This is the most complex migration in the project's history. It must:
1. Generate a UUID for the existing single child
2. Copy all per-child flat state into `children[uuid]`
3. Set `activeChildId = uuid`
4. Keep flat state as-is (working copy for active child)

```typescript
if (version < 13) {
  // Generate a stable ID for the existing child
  const childId = generateId(); // crypto.randomUUID() with fallback

  state.activeChildId = childId;
  state.children = {
    [childId]: {
      id: childId,
      childName: (state.childName as string) ?? 'Player 1',
      childAge: (state.childAge as number) ?? 7,
      childGrade: (state.childGrade as number) ?? 1,
      avatarId: state.avatarId ?? null,
      frameId: state.frameId ?? null,
      themeId: state.themeId ?? 'dark',
      createdAt: new Date().toISOString(),
      // Copy all learning state
      skillStates: state.skillStates ?? {},
      xp: state.xp ?? 0,
      level: state.level ?? 1,
      weeklyStreak: state.weeklyStreak ?? 0,
      lastSessionDate: state.lastSessionDate ?? null,
      sessionsCompleted: state.sessionsCompleted ?? 0,
      misconceptions: state.misconceptions ?? {},
      earnedBadges: state.earnedBadges ?? {},
      challengeCompletions: state.challengeCompletions ?? {},
      challengesCompleted: state.challengesCompleted ?? 0,
      exploredManipulatives: state.exploredManipulatives ?? [],
      tutorConsentGranted: state.tutorConsentGranted ?? false,
      sessionHistory: [], // No retroactive history
    },
  };
  // Flat state fields remain for working copy -- no change needed
}
```

**Testing this migration:** Create a fixture with v12 store state, run migration, verify children map contains all data and flat state is unchanged. This migration MUST have dedicated tests.

### v13 -> v14: Parent Controls

```typescript
if (version < 14) {
  state.parentControls = {};
  // parentControls is a Record<childId, ParentControlConfig>
  // Empty by default -- parent configures per child
}
```

### v14 -> v15: Subscription Bootstrap

```typescript
if (version < 15) {
  // No persisted subscription state -- this migration exists only
  // to bump the version. Subscription state is ephemeral.
  // But we add sessionHistory to any children that don't have it
  // (defensive, in case v13 migration was from a pre-sessionHistory version)
  const children = (state.children ?? {}) as Record<string, Record<string, unknown>>;
  for (const childId of Object.keys(children)) {
    children[childId].sessionHistory ??= [];
  }
  state.children = children;
}
```

## Navigation Changes

### Current Structure (v0.7 -- Flat)

```
RootStack
  +-- Home
  +-- Session
  +-- Results
  +-- Sandbox
  +-- BadgeCollection
  +-- SkillMap
  +-- AvatarPicker
  +-- ThemePicker
  +-- Consent
```

### New Structure (v0.8 -- Nested Parent Area)

```
RootStack
  +-- ProfileSwitcher             # NEW: shown when no activeChildId
  +-- AddChild                    # NEW: create new child profile
  +-- Home                        # MODIFIED: child switcher + parent button
  +-- Session                     # EXISTING (unchanged)
  +-- Results                     # EXISTING (unchanged)
  +-- Sandbox                     # EXISTING (unchanged)
  +-- BadgeCollection             # EXISTING (unchanged)
  +-- SkillMap                    # EXISTING (unchanged)
  +-- AvatarPicker                # EXISTING (unchanged)
  +-- ThemePicker                 # MODIFIED: premium theme gating
  +-- Consent                     # EXISTING (unchanged)
  +-- Subscription                # NEW: paywall screen
  +-- ParentStack (group)         # NEW: PIN-gated nested navigator
      +-- ParentDashboard         # All-children overview
      +-- ChildProgress           # Per-child detail (params: childId)
      +-- TimeControls            # Configure caps/bedtime (params: childId)
```

The `ParentStack` screens are accessed after PIN verification. The PIN check happens before navigation (reusing existing `parentalPin.ts` service). No separate authentication navigator needed -- verify PIN on "Parent" button press, navigate into nested stack on success.

The `ProfileSwitcher` screen is the initial route when `activeChildId` is null (fresh install). After selecting/creating a child, it navigates to Home.

## IAP Integration: RevenueCat vs expo-iap

### Recommendation: RevenueCat (react-native-purchases)

| Factor | RevenueCat | expo-iap |
|--------|-----------|----------|
| Expo managed workflow | Config plugin, EAS Build required | Config plugin, EAS Build required |
| Receipt validation | Server-side (included) | Client-side only (must build) |
| Subscription restore | Built-in cross-device restore | Manual implementation required |
| Analytics dashboard | MRR, churn, LTV included | None (build or use separate tool) |
| COPPA compliance | Anonymous mode (no user PII) | Manual PII avoidance |
| Price | Free up to $2.5k MRR | Free (open source) |
| Maturity | Production-proven, huge RN user base | Newer, less battle-tested |
| Webhook support | Yes (for server-side logic) | No |

**Use RevenueCat** because subscription receipt validation, cross-platform restore, and analytics are significant effort to build manually. RevenueCat handles all of this. The free tier ($2.5k MRR) covers the app's likely revenue for its first year+. Anonymous mode (no user PII) satisfies COPPA requirements without any additional work.

**Important:** Both options require a development build (EAS Build). Neither works in Expo Go. This is already the case for Tiny Tallies since it uses custom native modules (react-native-reanimated, react-native-gesture-handler).

### Subscription Product Structure

```typescript
type SubscriptionTier = 'free' | 'premium';

const PRODUCT_IDS = {
  monthly: 'tt_premium_monthly',
  annual: 'tt_premium_annual',
} as const;

// RevenueCat entitlement identifier
const PREMIUM_ENTITLEMENT = 'premium_access';

// Feature entitlements for gating
const PREMIUM_FEATURES = {
  aiTutor: true,           // Free: no AI tutor
  unlimitedSessions: true, // Free: 3 sessions/day
  allThemes: true,         // Free: dark theme only
  detailedAnalytics: true, // Free: basic stats only in parent dashboard
} as const;

const FREE_TIER = {
  maxSessionsPerDay: 3,
  availableThemes: ['dark'] as const,
  aiTutorAccess: false,
  parentDashboardDetail: 'basic' as const, // summary only, no trends
} as const;
```

## Anti-Patterns

### Anti-Pattern 1: Persisting Subscription State as Source of Truth

**What people do:** Store `isPremium: true` in AsyncStorage and check it on launch.
**Why it's wrong:** User can cancel subscription via App Store/Play Store settings outside the app. Stored state becomes permanently stale. Refunds and chargebacks are not reflected. Users could potentially modify AsyncStorage to fake premium status.
**Do this instead:** Always query RevenueCat on launch. Use ephemeral Zustand state hydrated from the IAP provider. Default to free tier during the brief loading window. Cache ONLY for short offline grace periods (RevenueCat handles this internally).

### Anti-Pattern 2: Separate Zustand Stores per Child

**What people do:** Create independent store instances per child with different persist keys.
**Why it's wrong:** Parent dashboard needs to read ALL children simultaneously for comparison charts. Store initialization is async -- switching causes component unmount/remount cascades. Migrations must run per-store independently. Zustand persist middleware is designed for a single storage key.
**Do this instead:** Single store with children map. Copy-on-switch pattern for active child. All children's data accessible in one `state.children` read.

### Anti-Pattern 3: Pre-Computing Analytics at Session Completion

**What people do:** Maintain running averages, weekly aggregates, and trend data in the store, updated every session completion.
**Why it's wrong:** Aggregation logic changes require migration and re-processing of all data. Adds complexity and potential bugs to the session completion critical path. Store bloat with derived data. Data becomes stale if business logic changes.
**Do this instead:** Store raw session history entries only. Compute analytics on-demand when the parent dashboard opens. Use `useMemo` for expensive computations. Dashboard opens are rare compared to session completions.

### Anti-Pattern 4: Gating Only via UI Hiding

**What people do:** Hide premium features with `{isPremium && <Component />}` without service-level checks.
**Why it's wrong:** Service layer has no awareness of entitlements. Deep links, state manipulation, or navigation bugs could bypass UI gates and trigger premium API calls (e.g., Gemini LLM calls on the free tier, costing money).
**Do this instead:** Implement gating at BOTH the UI level (show/hide, lock icons, PaywallCard) AND the service level (paywallGuard check before executing AI tutor calls). Defense in depth.

### Anti-Pattern 5: Allowing Profile Switch During Active Session

**What people do:** Let users switch profiles from anywhere, including mid-session.
**Why it's wrong:** The session flow accumulates data in refs (Elo changes, XP earned) and commits atomically at session end. Switching profiles mid-session would commit one child's session results to a different child's data. Data corruption.
**Do this instead:** Guard `switchChild` with `if (state.isSessionActive) return state`. Hide the profile switcher UI during active sessions. Only allow switching from HomeScreen.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| RevenueCat | `Purchases.configure()` on app launch, anonymous user ID | No user PII. Config plugin handles native setup. Free under $2.5k MRR. |
| App Store / Play Store | Via RevenueCat SDK (abstracted) | Products configured in App Store Connect / Play Console |
| Gemini LLM | Existing integration | Now gated: check `canAccess('aiTutor', tier)` before LLM calls |
| expo-secure-store | Existing PIN storage | Reused for parent dashboard access gate |
| AsyncStorage | Existing persist backend | Increased data volume with children map -- monitor size |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| profilesSlice <-> all data slices | switchChild hydrates/dehydrates flat state | Must save before switch, load after |
| profilesSlice <-> AppState background | useSaveActiveChild hook syncs on background | Prevents data loss on app kill |
| subscriptionSlice <-> screens | useSubscription hook reads tier | Components never call RevenueCat APIs directly |
| subscriptionSlice <-> AI tutor service | paywallGuard check before LLM call | Defense in depth with UI gating |
| parentControlsSlice <-> session flow | useTimeControls hook checks limits | Enforced at session start, not mid-session |
| sessionHistory <-> analytics service | Pure functions read history, return computed stats | No store coupling in analytics |
| profilesSlice <-> parent dashboard | Dashboard reads `state.children` directly | All children visible for comparison |
| parentalPin service <-> parent navigator | PIN verified before navigation | Reuses existing service unchanged |

## Build Order (Dependency-Aware)

### Phase 1: Multi-Child Foundation (must be first -- everything depends on this)
1. Define `ChildData` type and `PER_CHILD_FIELDS` mapping
2. Implement `profilesSlice` with children map, addChild, switchChild, removeChild, saveActiveChild
3. Write v12->v13 migration (existing child into children map)
4. Update `appStore.ts`: compose profilesSlice, update partialize
5. Implement `useSaveActiveChild` hook (auto-save on background)
6. Add `ProfileSwitcherScreen` and `AddChildScreen`
7. Modify HomeScreen: add `ChildSwitcher` component + parent button
8. Run full existing test suite to verify no regressions

### Phase 2: Session History and Analytics Engine
1. Define `SessionHistoryEntry` type
2. Add sessionHistory append logic to session completion flow
3. Implement `dashboardAnalytics.ts` (pure computation: accuracy trends, time spent, skill progress)
4. Implement `trendCalculator.ts` (weekly/monthly aggregations from raw entries)
5. Tests for analytics computations

### Phase 3: Parent Dashboard
1. Create `ParentNavigator.tsx` nested stack
2. Wire PIN verification for parent button on HomeScreen
3. Build `ParentDashboardScreen` (all-children overview with ChildCards)
4. Build `ChildProgressScreen` (per-child detail: skills, misconceptions, trends)
5. Build dashboard UI components (ProgressChart, SessionHistoryList, MisconceptionBreakdown, TrendLine)

### Phase 4: Parental Time Controls
1. Implement `parentControlsSlice` (per-child config: dailyCapMinutes, bedtimeStart, bedtimeEnd, breakIntervalMinutes)
2. Write v13->v14 migration
3. Implement `timeControlService.ts` (enforcement logic)
4. Implement `useTimeControls` hook
5. Build `TimeControlsScreen` (configuration UI within parent navigator)
6. Wire time control checks into session start flow on HomeScreen

### Phase 5: Freemium Subscription and IAP (last -- layers gating on working features)
1. Add `react-native-purchases` dependency + Expo config plugin
2. Implement `subscriptionSlice` (ephemeral, not persisted)
3. Implement `subscriptionService.ts` (RevenueCat init, purchase, restore)
4. Implement `paywallGuard.ts` (pure feature gating)
5. Write v14->v15 migration (session history on children)
6. Build `SubscriptionScreen` (paywall UI with product cards)
7. Implement `useSubscription` and `useSessionCounter` hooks
8. Wire gating into: AI tutor (HelpButton), themes (ThemePickerScreen), sessions (HomeScreen), detailed analytics (ChildProgressScreen)
9. Test: verify free tier limits work, premium unlocks correctly, restore purchases works

**Phase ordering rationale:**
- Phase 1 is foundational -- multi-child data structure is a prerequisite for everything else
- Phase 2 before Phase 3 because the dashboard needs session history data to display anything useful
- Phase 3 before Phase 4 because time controls are configured within the parent dashboard flow
- Phase 5 last because it is purely additive gating on top of working features -- much easier to test everything ungated first, then add feature gates. If IAP integration has issues, the rest of the milestone is unblocked.

## Sources

- [Expo in-app purchases guide](https://docs.expo.dev/guides/in-app-purchases/)
- [RevenueCat Expo installation docs](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [expo-iap GitHub repository](https://github.com/hyochan/expo-iap)
- [RevenueCat react-native-purchases](https://github.com/RevenueCat/react-native-purchases)
- [Expo + RevenueCat tutorial](https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial)
- [Zustand architecture patterns at scale](https://brainhub.eu/library/zustand-architecture-patterns-at-scale)
- Existing codebase: appStore.ts, all 9 slices, migrations.ts (v1-v12), AppNavigator.tsx, HomeScreen.tsx, parentalPin.ts

---
*Architecture research for: Multi-child profiles, parent dashboard, parental controls, freemium IAP subscription*
*Researched: 2026-03-05*
