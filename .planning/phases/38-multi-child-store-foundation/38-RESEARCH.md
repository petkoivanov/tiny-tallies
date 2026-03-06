# Phase 38: Multi-Child Store Foundation - Research

**Researched:** 2026-03-06
**Domain:** Zustand store restructuring, multi-profile state management, data migration
**Confidence:** HIGH

## Summary

This phase restructures the flat single-child Zustand store (v12) into a multi-child keyed architecture (v13) using a "copy-on-switch" pattern. The critical insight is that the 36 files currently using `useAppStore` selectors should NOT need changes -- the flat slice interface is preserved by hydrating/dehydrating child data into the same top-level fields on profile switch.

The store currently persists 17 fields via `partialize`. These fields split cleanly into two categories: (1) per-child data (all 17 current fields) and (2) new global data (children map, activeChildId, profile metadata). The v12->v13 migration is the most structurally complex migration in the project's history -- it reshapes the entire persistence format rather than adding/defaulting fields.

**Primary recommendation:** Implement copy-on-switch with a `children: Record<string, ChildData>` map alongside `activeChildId`. On switch, dehydrate current child's state into the map, then hydrate the target child's state into the flat top-level fields. The `partialize` function changes to persist the children map + activeChildId instead of flat fields. Use `expo-crypto` (already installed) for UUID generation via `Crypto.randomUUID()`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Name is **required** when creating a profile
- Both **age and grade** are required (age drives BKT parameters, grade drives curriculum)
- New profiles include **avatar selection** as part of creation flow (show grid of 14 regular avatars)
- Theme is **per-profile** (themeId stays in per-child data, switches when profile switches)
- Profile switcher triggered by **tapping the child's avatar** on the home screen
- Opens a **sheet/menu** showing avatar circles + names for all profiles, plus a "Manage Profiles" link (PIN-gated)
- **No PIN required** to switch between profiles -- frictionless for children
- Profile switching is **blocked during active sessions** (hide/disable switcher) to prevent data corruption
- PIN is required for profile management (add/edit/delete) but NOT for switching
- **Existing users (upgrade from v0.7):** On first launch, show a prompt screen: "Welcome! Name your learner" -- ask for name, and also age/grade if those fields are null. Migrate existing data into the first profile.
- **Brand-new installs:** Start with a "Create your first profile" screen (name, age, grade, avatar) before showing the home screen. No data to migrate.
- The migration prompt is a one-time screen, not a recurring nag.
- Maximum **5 profiles** per device
- **Deleting the last profile resets the app** to the fresh-install "Create profile" screen
- Delete confirmation requires **typing the child's name** to prevent accidental deletion
- **All profile creation is PIN-gated** (including the very first profile on fresh install -- parent sets up the device)
- Profile creation flow: name -> age/grade -> avatar picker -> done (short wizard, not a single form)
- The migration prompt for existing users should feel welcoming, not like an error or interruption
- Avatar picker in creation reuses the existing AvatarPickerScreen grid (14 regular avatars, special ones locked until earned)

### Claude's Discretion
- Exact copy-on-switch implementation details (hydrate/dehydrate mechanics)
- UUID generation approach for child IDs
- Auto-save timing (debounce, app state listener approach)
- Store migration field-by-field mapping
- Profile switcher sheet animation/styling
- How to handle edge cases (corrupted profiles, migration failures)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROF-05 | Each child profile has independent progress (Elo, BKT, skills, XP, achievements, cosmetics) | Copy-on-switch pattern with `ChildData` type containing all 17 persisted fields; children map keyed by UUID |
| PROF-06 | App supports up to 5 child profiles per device | Enforced in `addChild` action with `Object.keys(children).length < 5` guard |
| PROF-07 | New child profiles initialize with grade-appropriate skill unlocks and difficulty | `getSkillsByGrade()` from skills.ts + `getUnlockedSkills()` from prerequisiteGating.ts provide grade-aware initialization |
| PROF-08 | Active child data auto-saves on app background and profile switch | React Native `AppState` change listener + dehydrate-before-switch pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.8 | State management with persist middleware | Already in use; persist middleware handles migration chain |
| expo-crypto | ~15.0.8 | UUID v4 generation via `Crypto.randomUUID()` | Already installed; no new dependency needed |
| @react-native-async-storage/async-storage | (existing) | Persistence backend for Zustand persist | Already the persistence layer |
| expo-secure-store | (existing) | PIN verification for profile management | Already used for parental PIN |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native (AppState) | 0.81.5 | App lifecycle events for auto-save | `AppState.addEventListener('change')` for background detection |
| react-native-safe-area-context | (existing) | Safe area for profile switcher sheet | Profile switcher bottom sheet layout |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-crypto randomUUID | uuid package | expo-crypto already installed, no new dependency |
| AppState listener for auto-save | Zustand onFinishHydration + subscribe | AppState is more reliable for background detection; subscribe fires too often |
| Bottom sheet library | Custom modal/sheet | Custom is simpler for this use case; avoid new dependency |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   ├── appStore.ts              # Add profilesSlice, restructure partialize
│   ├── migrations.ts            # Add v12->v13 structural migration
│   ├── slices/
│   │   ├── profilesSlice.ts     # NEW: children map, activeChildId, switch/add/remove actions
│   │   ├── childProfileSlice.ts # KEEP: flat profile fields (hydrated from active child)
│   │   └── ... (all other slices unchanged)
│   ├── helpers/
│   │   ├── skillStateHelpers.ts # Existing (add grade-init helper)
│   │   └── childDataHelpers.ts  # NEW: hydrate/dehydrate, ChildData type, defaults
│   └── constants/
│       └── avatars.ts           # Existing (unchanged)
├── services/
│   └── profile/
│       └── profileInitService.ts # NEW: grade-appropriate initialization logic
├── hooks/
│   └── useAutoSave.ts           # NEW: AppState listener for background save
├── components/
│   └── profile/
│       ├── ProfileSwitcherSheet.tsx  # NEW: bottom sheet with avatar circles
│       └── ProfileCreationWizard.tsx # NEW: name -> age/grade -> avatar steps
├── screens/
│   ├── ProfileSetupScreen.tsx   # NEW: first-run and migration prompt screen
│   └── HomeScreen.tsx           # MODIFY: avatar tap opens switcher
└── navigation/
    └── AppNavigator.tsx         # MODIFY: conditional initial route
```

### Pattern 1: Copy-on-Switch (Hydrate/Dehydrate)
**What:** Child data is stored in a `children` map but the active child's data is always "hydrated" into the flat top-level fields that all 36 existing consumer files read from. On switch, the current child's data is "dehydrated" (saved back to the map) and the target child's data is hydrated (loaded from the map into top-level fields).

**When to use:** When you need multi-tenant state but want to avoid refactoring all consumers.

**Example:**
```typescript
// src/store/helpers/childDataHelpers.ts

/** All per-child fields that get stored in the children map */
export interface ChildData {
  childName: string | null;
  childAge: number | null;
  childGrade: number | null;
  avatarId: AllAvatarId | null;
  frameId: FrameId | null;
  themeId: ThemeId;
  tutorConsentGranted: boolean;
  skillStates: Record<string, SkillState>;
  xp: number;
  level: number;
  weeklyStreak: number;
  lastSessionDate: string | null;
  exploredManipulatives: ManipulativeType[];
  misconceptions: Record<string, MisconceptionRecord>;
  earnedBadges: Record<string, EarnedBadge>;
  sessionsCompleted: number;
  challengeCompletions: Record<string, ChallengeCompletion>;
  challengesCompleted: number;
}

/** Fields to extract from AppState for dehydration */
const CHILD_DATA_KEYS: (keyof ChildData)[] = [
  'childName', 'childAge', 'childGrade', 'avatarId', 'frameId',
  'themeId', 'tutorConsentGranted', 'skillStates', 'xp', 'level',
  'weeklyStreak', 'lastSessionDate', 'exploredManipulatives',
  'misconceptions', 'earnedBadges', 'sessionsCompleted',
  'challengeCompletions', 'challengesCompleted',
];

/** Extract per-child fields from flat state into a ChildData snapshot */
export function dehydrateChild(state: AppState): ChildData {
  const data = {} as ChildData;
  for (const key of CHILD_DATA_KEYS) {
    (data as any)[key] = state[key];
  }
  return data;
}

/** Create a partial state update to apply a child's data onto flat fields */
export function hydrateChild(data: ChildData): Partial<AppState> {
  return { ...data } as Partial<AppState>;
}
```

### Pattern 2: Profiles Slice
**What:** A new Zustand slice that owns the `children` map, `activeChildId`, and all profile management actions.

**Example:**
```typescript
// src/store/slices/profilesSlice.ts
import * as Crypto from 'expo-crypto';

export interface ProfilesSlice {
  children: Record<string, ChildData>;
  activeChildId: string | null;
  switchChild: (childId: string) => void;
  addChild: (profile: NewChildProfile) => string | null; // returns ID or null if at limit
  removeChild: (childId: string) => void;
  saveActiveChild: () => void; // dehydrate current state into children map
}

export const createProfilesSlice: StateCreator<AppState, [], [], ProfilesSlice> = (set, get) => ({
  children: {},
  activeChildId: null,

  saveActiveChild: () => {
    const state = get();
    if (!state.activeChildId) return;
    set({
      children: {
        ...state.children,
        [state.activeChildId]: dehydrateChild(state),
      },
    });
  },

  switchChild: (childId: string) => {
    const state = get();
    if (state.isSessionActive) return; // block during sessions
    if (!state.children[childId]) return;

    // Dehydrate current child first
    const updatedChildren = state.activeChildId
      ? { ...state.children, [state.activeChildId]: dehydrateChild(state) }
      : state.children;

    // Hydrate target child
    const targetData = updatedChildren[childId];
    set({
      ...hydrateChild(targetData),
      children: updatedChildren,
      activeChildId: childId,
    });
  },

  addChild: (profile: NewChildProfile) => {
    const state = get();
    if (Object.keys(state.children).length >= 5) return null;

    const id = Crypto.randomUUID();
    const childData = createDefaultChildData(profile);

    // Save current child first if one is active
    const updatedChildren = state.activeChildId
      ? { ...state.children, [state.activeChildId]: dehydrateChild(state) }
      : { ...state.children };

    updatedChildren[id] = childData;

    set({
      ...hydrateChild(childData),
      children: updatedChildren,
      activeChildId: id,
    });

    return id;
  },

  removeChild: (childId: string) => {
    const state = get();
    const { [childId]: _, ...remaining } = state.children;

    if (Object.keys(remaining).length === 0) {
      // Last profile deleted -- reset to fresh state
      set({
        children: {},
        activeChildId: null,
        // Reset flat fields to defaults...
      });
      return;
    }

    if (state.activeChildId === childId) {
      // Switch to first remaining child
      const nextId = Object.keys(remaining)[0];
      set({
        ...hydrateChild(remaining[nextId]),
        children: remaining,
        activeChildId: nextId,
      });
    } else {
      set({ children: remaining });
    }
  },
});
```

### Pattern 3: Restructured Partialize
**What:** The `partialize` function changes from persisting 17 flat fields to persisting the `children` map and `activeChildId`. The flat fields are still in memory (for selectors) but are NOT independently persisted -- they live inside the children map.

**Example:**
```typescript
// In appStore.ts -- updated partialize
partialize: (state) => ({
  children: state.children,
  activeChildId: state.activeChildId,
}),
```

**Critical detail:** Before persisting, the active child's current state must be dehydrated into the children map. Use Zustand's `onRehydrateStorage` or a manual save trigger.

### Pattern 4: Auto-Save with AppState Listener
**What:** Listen for React Native AppState changes to dehydrate active child data before the app goes to background.

**Example:**
```typescript
// src/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppStore } from '@/store/appStore';

export function useAutoSave() {
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (
        appStateRef.current === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        useAppStore.getState().saveActiveChild();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, []);
}
```

### Pattern 5: v12->v13 Migration
**What:** The structural migration that reshapes flat persisted state into the children map format.

**Example:**
```typescript
if (version < 13) {
  // v12 -> v13: Restructure flat state into multi-child map
  // Extract all per-child fields from the flat state
  const childData: Record<string, unknown> = {};
  for (const key of CHILD_DATA_KEYS) {
    childData[key] = state[key];
  }

  // Generate an ID for the existing child (deterministic from existing data)
  const childId = Crypto.randomUUID();

  state.children = { [childId]: childData };
  state.activeChildId = childId;

  // Note: flat fields remain in state for immediate hydration
  // They will be read by existing selectors until the app restarts

  // Flag for migration prompt screen
  state._needsMigrationPrompt = true;
}
```

### Anti-Patterns to Avoid
- **Refactoring all 36 consumer files:** The copy-on-switch pattern exists specifically to avoid this. Do NOT change selectors like `useAppStore(s => s.xp)` to `useAppStore(s => s.children[s.activeChildId].xp)`.
- **Persisting flat fields AND children map:** This creates data duplication and sync bugs. Only the children map should be persisted. Flat fields are runtime-only, hydrated on app start and profile switch.
- **Using `set()` inside `partialize`:** Zustand's partialize is a pure function. Side effects (like dehydrating) must happen before persist triggers.
- **Synchronous UUID generation in migration:** `Crypto.randomUUID()` is synchronous in expo-crypto, so this is fine. But do NOT use `Crypto.digestStringAsync()` or other async functions inside the migration.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom ID generator | `expo-crypto` `Crypto.randomUUID()` | Cryptographically secure, already installed, RFC 4122 compliant |
| Data persistence | Custom AsyncStorage wrapper | Zustand persist middleware | Already handles serialization, versioning, migration chain |
| PIN verification | Custom secure storage | `parentalPin.ts` service | Already implemented with expo-secure-store |
| App lifecycle detection | Custom interval/polling | React Native `AppState` API | Built into RN, reliable background/foreground detection |
| Bottom sheet | @gorhom/bottom-sheet | Simple `Modal` + `Animated.View` | Avoid new dependency for a simple profile list |

**Key insight:** This phase's complexity is in the data architecture, not in UI libraries. The profile switcher sheet is a simple modal with a flat list of avatar circles -- no gesture-driven bottom sheet library needed.

## Common Pitfalls

### Pitfall 1: Data Loss During Migration
**What goes wrong:** The v12->v13 migration fails to copy all 17 persisted fields, losing user progress.
**Why it happens:** The field list in the migration doesn't match the `partialize` field list.
**How to avoid:** Define `CHILD_DATA_KEYS` as a single source of truth array, used by both migration and dehydrate functions. Write a test that verifies CHILD_DATA_KEYS matches the v12 partialize fields.
**Warning signs:** Any test showing `undefined` values in migrated child data.

### Pitfall 2: Stale Flat State After Switch
**What goes wrong:** After switching profiles, some component still shows the previous child's data.
**Why it happens:** Component is using a stale closure or memoized selector that doesn't react to the batch `set()` call.
**How to avoid:** Use Zustand's atomic `set()` with all hydrated fields in a single call. Avoid spreading across multiple `set()` calls. Ensure all child data fields are included in the hydration.
**Warning signs:** Flickering UI showing old data momentarily after switch.

### Pitfall 3: Race Condition on Auto-Save
**What goes wrong:** App goes to background during a profile switch, causing partial dehydration.
**Why it happens:** `saveActiveChild` fires via AppState listener while `switchChild` is mid-execution.
**How to avoid:** `switchChild` does its own dehydration atomically. The AppState auto-save is a safety net, not the primary save mechanism. Both operations use a single `set()` call.
**Warning signs:** Corrupted children map entries with mixed data from two profiles.

### Pitfall 4: Migration Prompt Not Dismissing
**What goes wrong:** The "Welcome! Name your learner" screen keeps appearing on every app launch.
**Why it happens:** The migration prompt flag is stored in memory but not persisted, or the flag isn't cleared after the user completes the prompt.
**How to avoid:** Use a persisted flag (e.g., `_migrationComplete: boolean` in the children map or a separate flag). Clear it explicitly when the user finishes the migration wizard. For fresh installs, skip the flag entirely -- the presence of `children` with at least one entry indicates setup is complete.
**Warning signs:** Users reporting they see the setup screen every time they open the app.

### Pitfall 5: Partialize Saving Stale Children Map
**What goes wrong:** The persist middleware serializes the children map, but the active child's latest state changes are not reflected (because they're in the flat fields, not yet dehydrated).
**Why it happens:** Zustand persist calls `partialize` on every state change, but the active child's data in the `children` map is only updated on explicit dehydration (switch/background).
**How to avoid:** Two approaches: (A) dehydrate on every state change via a Zustand `subscribe` middleware, or (B) dehydrate in the `partialize` function itself. Option B is cleaner:
```typescript
partialize: (state) => ({
  children: state.activeChildId
    ? { ...state.children, [state.activeChildId]: dehydrateChild(state) }
    : state.children,
  activeChildId: state.activeChildId,
}),
```
This ensures every persist write includes the latest active child data.
**Warning signs:** Data loss when the app is force-killed (no background event fires).

### Pitfall 6: Grade-Appropriate Initialization is Wrong
**What goes wrong:** A Grade 3 child starts with only Grade 1 root skills unlocked, same as a Grade 1 child.
**Why it happens:** The prerequisite gating system requires mastery of prerequisites to unlock skills. A new Grade 3 profile has no mastery data.
**How to avoid:** For new profiles, pre-seed `skillStates` with mastered entries for all skills at grades below the child's grade. E.g., Grade 3 child gets all Grade 1 and Grade 2 skills pre-mastered (masteryLocked: true, reasonable Elo). This unlocks Grade 3 skills via the existing prerequisite gating.
**Warning signs:** All children regardless of grade seeing only "Add within 10" as their first skill.

## Code Examples

### Complete ChildData Type Definition
```typescript
// src/store/helpers/childDataHelpers.ts
import type { SkillState } from '../slices/skillStatesSlice';
import type { MisconceptionRecord } from '../slices/misconceptionSlice';
import type { EarnedBadge } from '../slices/achievementSlice';
import type { ChallengeCompletion } from '../../services/challenge/challengeTypes';
import type { AllAvatarId, FrameId } from '../constants/avatars';
import type { ThemeId } from '@/theme/colors';
import type { ManipulativeType } from '@/services/cpa/cpaTypes';

export interface ChildData {
  childName: string;
  childAge: number;
  childGrade: number;
  avatarId: AllAvatarId | null;
  frameId: FrameId | null;
  themeId: ThemeId;
  tutorConsentGranted: boolean;
  skillStates: Record<string, SkillState>;
  xp: number;
  level: number;
  weeklyStreak: number;
  lastSessionDate: string | null;
  exploredManipulatives: ManipulativeType[];
  misconceptions: Record<string, MisconceptionRecord>;
  earnedBadges: Record<string, EarnedBadge>;
  sessionsCompleted: number;
  challengeCompletions: Record<string, ChallengeCompletion>;
  challengesCompleted: number;
}

export const DEFAULT_CHILD_DATA: Omit<ChildData, 'childName' | 'childAge' | 'childGrade' | 'avatarId'> = {
  frameId: null,
  themeId: 'dark',
  tutorConsentGranted: false,
  skillStates: {},
  xp: 0,
  level: 1,
  weeklyStreak: 0,
  lastSessionDate: null,
  exploredManipulatives: [],
  misconceptions: {},
  earnedBadges: {},
  sessionsCompleted: 0,
  challengeCompletions: {},
  challengesCompleted: 0,
};
```

### Grade-Appropriate Skill Initialization
```typescript
// src/services/profile/profileInitService.ts
import { SKILLS } from '../mathEngine/skills';
import type { SkillState } from '../../store/slices/skillStatesSlice';
import type { Grade } from '../mathEngine/types';

/**
 * Pre-seeds skill states for a new child profile.
 * Skills at grades below the child's grade are pre-mastered
 * so the prerequisite gating system unlocks grade-appropriate skills.
 */
export function createGradeAppropriateSkillStates(
  grade: Grade,
): Record<string, SkillState> {
  const skillStates: Record<string, SkillState> = {};

  for (const skill of SKILLS) {
    if (skill.grade < grade) {
      // Pre-master skills below the child's grade
      skillStates[skill.id] = {
        eloRating: 1100, // slightly above default, indicating competence
        attempts: 5,     // simulate some experience
        correct: 5,
        masteryProbability: 0.95,
        consecutiveWrong: 0,
        masteryLocked: true,
        leitnerBox: 5,
        nextReviewDue: null,
        consecutiveCorrectInBox6: 0,
        cpaLevel: 'abstract',
      };
    }
    // Skills at or above the child's grade start fresh (default lazy init)
  }

  return skillStates;
}
```

### Navigation Conditional for First-Run
```typescript
// In AppNavigator.tsx or a wrapper component
const activeChildId = useAppStore((s) => s.activeChildId);
const children = useAppStore((s) => s.children);
const hasProfiles = Object.keys(children).length > 0;

// Determine initial route:
// - No profiles at all -> ProfileSetup (fresh install or last profile deleted)
// - Has profiles but needs migration prompt -> MigrationPrompt
// - Has profiles and active child -> Home
const initialRouteName = hasProfiles ? 'Home' : 'ProfileSetup';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat single-child state | Keyed children map with copy-on-switch | This phase (v13) | All child data isolated; up to 5 profiles |
| 17 fields in partialize | 2 fields (children, activeChildId) | This phase (v13) | Persistence structure fundamentally changes |
| No app lifecycle handling | AppState listener for auto-save | This phase | Data safety on background/force-kill |
| Single-child implicit | Explicit activeChildId | This phase | Profile management becomes possible |

**Deprecated/outdated:**
- Direct flat field persistence (all 17 fields individually) -- replaced by children map persistence
- Implicit single-child assumption -- replaced by explicit profile selection

## Open Questions

1. **Timing of dehydration in partialize vs explicit save**
   - What we know: Option B (dehydrate in partialize) is safest against force-kill data loss
   - What's unclear: Performance impact of dehydrating on every state change
   - Recommendation: Use partialize dehydration (Option B). The dehydrate function is cheap (just field copying). Performance is not a concern for 18 fields.

2. **Migration prompt flow for existing users with complete profiles**
   - What we know: Existing users may already have name, age, grade, and avatar set
   - What's unclear: Should the migration prompt skip fields that are already filled?
   - Recommendation: Show a simplified prompt. If name+age+grade are all set, just show a "Welcome back!" confirmation with the option to edit. If any are null, prompt for the missing fields.

3. **Deterministic vs random ID for migrated profile**
   - What we know: `Crypto.randomUUID()` generates a random UUID
   - What's unclear: Whether the migration ID needs to be deterministic (same UUID on repeated migration attempts)
   - Recommendation: Use random UUID. The migration only runs once (version < 13 guard). If the migration runs again due to some edge case, generating a new UUID for the same data is acceptable since there's only one child at migration time.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | jest.config.js (existing) |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROF-05 | Independent progress per child (hydrate/dehydrate roundtrip) | unit | `npm test -- --testPathPattern=childDataHelpers` | No - Wave 0 |
| PROF-05 | Switch child hydrates complete state | unit | `npm test -- --testPathPattern=profilesSlice` | No - Wave 0 |
| PROF-06 | Max 5 profiles enforced | unit | `npm test -- --testPathPattern=profilesSlice` | No - Wave 0 |
| PROF-07 | Grade-appropriate skill initialization | unit | `npm test -- --testPathPattern=profileInitService` | No - Wave 0 |
| PROF-08 | Auto-save on background | unit | `npm test -- --testPathPattern=useAutoSave` | No - Wave 0 |
| PROF-08 | Dehydrate on profile switch | unit | `npm test -- --testPathPattern=profilesSlice` | No - Wave 0 |
| MIGRATION | v12->v13 migration preserves all data | unit | `npm test -- --testPathPattern=migrations` | Partial - existing migration tests |
| MIGRATION | v12->v13 handles null persisted state | unit | `npm test -- --testPathPattern=migrations` | Partial - existing |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<changed_file_pattern>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/store/profilesSlice.test.ts` -- covers PROF-05, PROF-06, switch/add/remove
- [ ] `src/__tests__/store/childDataHelpers.test.ts` -- covers PROF-05 hydrate/dehydrate roundtrip
- [ ] `src/__tests__/services/profileInitService.test.ts` -- covers PROF-07 grade initialization
- [ ] `src/__tests__/hooks/useAutoSave.test.ts` -- covers PROF-08 AppState listener
- [ ] `src/__tests__/store/migrations.test.ts` -- extend existing file with v12->v13 cases

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: appStore.ts, migrations.ts, all 9 slices, skillStateHelpers.ts, prerequisiteGating.ts, skills.ts, parentalPin.ts, HomeScreen.tsx, AppNavigator.tsx
- package.json: zustand ^5.0.8, expo-crypto ~15.0.8, react-native 0.81.5

### Secondary (MEDIUM confidence)
- [Expo Crypto docs](https://docs.expo.dev/versions/latest/sdk/crypto/) - randomUUID() API verification
- [Zustand persist middleware docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) - migrate function, partialize behavior
- [Zustand v5 migration guide](https://github.com/pmndrs/zustand/blob/main/docs/migrations/migrating-to-v5.md) - persist behavior changes in v5

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, no new dependencies
- Architecture: HIGH - copy-on-switch pattern is well-understood; all existing code inspected
- Pitfalls: HIGH - based on direct inspection of migration chain, partialize behavior, and state shape
- Grade initialization: MEDIUM - logic is sound but the exact pre-mastery values (Elo=1100, attempts=5) may need tuning

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable -- no external dependencies changing)
