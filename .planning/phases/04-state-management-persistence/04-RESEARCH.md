# Phase 4: State Management & Persistence - Research

**Researched:** 2026-03-01
**Domain:** Zustand persist middleware + AsyncStorage for React Native
**Confidence:** HIGH

## Summary

Phase 4 adds persistence to the existing Zustand store (4 domain slices already in place) via the `persist` middleware backed by `@react-native-async-storage/async-storage`. Both libraries are already installed at compatible versions (zustand 5.0.11, async-storage 2.2.0). The core task is wrapping the existing `create()` call with `persist()`, configuring `partialize` to exclude transient session state and action functions, setting up versioned migrations, and enriching the existing slice data shapes.

The existing codebase has a clean slice composition pattern using `StateCreator<AppState, [], [], SliceType>` generics. The persist middleware wraps the outermost `create()` call -- individual slices do not need to know about persistence. This is the standard Zustand pattern for combining slices with middleware.

**Primary recommendation:** Wrap `create()` in `persist()` at the `appStore.ts` level with `createJSONStorage(() => AsyncStorage)`, use `partialize` to persist only data fields (excluding actions and transient session state), bump `STORE_VERSION` to 2 with a migration from version 1, and enrich slice types with the fields required by STOR-01 through STOR-03.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
All four discussion areas were delegated to Claude's judgment. Key constraints to respect:
- Child profile must store name, age, grade, and avatar selection (STOR-01)
- Skill states must track per-skill Elo rating and attempt/correct counts (STOR-02)
- Session state must track current problem index, answers given, score, and XP earned (STOR-03)
- All state must survive app restart via AsyncStorage (STOR-04)
- Never add state directly to appStore.ts -- use or extend slices (CLAUDE.md)
- Bump STORE_VERSION + add migration function when changing schema (CLAUDE.md guardrail)
- Don't bypass expo-secure-store for sensitive data (CLAUDE.md guardrail)
- Skill IDs are dot-delimited strings from Phase 2 (e.g., "addition.single-digit.no-carry")
- SessionAnswer expects { problemId: string, answer: number, correct: boolean }

### Claude's Discretion
- Avatar approach -- choose something simple and fun for ages 6-9
- Single vs multiple profiles -- consider v0.1 scope
- First launch flow (required setup vs guest mode)
- Whether grade affects problem selection or is just metadata for v0.1
- Full vs selective persistence -- determine what's safest for data integrity
- Migration approach (version + migration map vs wipe) -- consider child progress safety
- Secure store setup -- no sensitive data in v0.1, but respect CLAUDE.md guardrail
- Reset capabilities -- determine what's appropriate for v0.1
- Timing data (time per problem, session duration)
- Tracking answer format (MC vs free text) in SessionAnswer
- Session history (past session summaries vs current-only)
- Background/foreground handling
- Skill entry creation (lazy vs eager) -- work with existing Record<string, SkillState> pattern
- Default starting Elo -- consider template baseElo values from Phase 2
- bugId tracking in skill states -- weigh future misconception detection benefit vs complexity
- Elo logic ownership -- follow project architecture (services for domain logic, store for state)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STOR-01 | Child profile stores name, age, grade, and avatar selection | Existing `childProfileSlice.ts` already has `childName`, `childAge`, `childGrade`, `avatarId` fields. Enrich with avatar constants and optional profile metadata. Persist via `partialize`. |
| STOR-02 | Skill states track per-skill Elo rating and attempt/correct counts | Existing `skillStatesSlice.ts` has `Record<string, SkillState>` with `eloRating`, `attempts`, `correct`. Enrich `updateSkillState` to handle lazy initialization with default Elo (1000). Persist entire `skillStates` record. |
| STOR-03 | Session state tracks current problem index, answers given, score, and XP earned | Existing `sessionStateSlice.ts` has all required fields. Session state is transient -- do NOT persist (exclude via `partialize`). Session data resets on `startSession()`. |
| STOR-04 | All state persists across app restart via AsyncStorage | Wrap `create()` with `persist()` middleware using `createJSONStorage(() => AsyncStorage)`. Use `partialize` to persist child profile, skill states, and gamification. Exclude session state and action functions. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.11 | State management with persist middleware | Already installed; `persist` is built-in middleware, not a separate package |
| @react-native-async-storage/async-storage | 2.2.0 | Persistent key-value storage for React Native | Already installed; Expo SDK 54 compatible; standard RN persistence layer |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.1.13 | Runtime validation of persisted state on rehydration | Already installed; use at the persistence boundary to validate stored data shape |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AsyncStorage | react-native-mmkv | ~30x faster, but adds new native dependency; AsyncStorage is sufficient for this data volume and already installed |
| Zod validation on rehydration | Trust Zustand migration | Zustand `migrate` handles shape changes, but Zod catches corruption; belt-and-suspenders approach is safer for child progress data |

**Installation:**
```bash
# No new packages needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   ├── appStore.ts              # Composed store with persist middleware
│   ├── migrations.ts            # Version migration functions (NEW)
│   ├── persistConfig.ts         # Persist configuration (storage, partialize) (NEW)
│   └── slices/
│       ├── childProfileSlice.ts # Enriched with avatar constants
│       ├── skillStatesSlice.ts  # Enriched with lazy init + default Elo
│       ├── sessionStateSlice.ts # Enriched with optional timing/format fields
│       └── gamificationSlice.ts # Unchanged or minimal enrichment
```

### Pattern 1: Persist Wrapping Composed Slices
**What:** Apply `persist()` at the `create()` level, not inside individual slices. Slices remain unaware of persistence.
**When to use:** Always, when combining slices pattern with persist middleware in Zustand v5.
**Example:**
```typescript
// Source: Zustand official docs + GitHub discussions
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createChildProfileSlice(...a),
      ...createSkillStatesSlice(...a),
      ...createSessionStateSlice(...a),
      ...createGamificationSlice(...a),
    }),
    {
      name: 'tiny-tallies-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: STORE_VERSION,
      migrate: migrateStore,
      partialize: (state) => ({
        // Persist only data, not actions or transient session state
        childName: state.childName,
        childAge: state.childAge,
        childGrade: state.childGrade,
        avatarId: state.avatarId,
        skillStates: state.skillStates,
        xp: state.xp,
        level: state.level,
        weeklyStreak: state.weeklyStreak,
        lastSessionDate: state.lastSessionDate,
      }),
    },
  ),
);
```

### Pattern 2: Versioned Migrations
**What:** Track schema version and provide migration functions for each version bump. Zustand calls `migrate` when stored version differs from current `STORE_VERSION`.
**When to use:** Every time the persisted state shape changes.
**Example:**
```typescript
// Source: Zustand official docs
export function migrateStore(
  persistedState: unknown,
  version: number,
): AppState {
  const state = persistedState as Record<string, unknown>;

  if (version === 1) {
    // Migration from v1 (no persistence) to v2 (first persisted version)
    // v1 had no persisted state, so just return defaults
    // Future migrations chain: if (version < 3) { ... }
  }

  return state as unknown as AppState;
}
```

### Pattern 3: Partialize for Selective Persistence
**What:** Use `partialize` to persist only data fields. Exclude action functions (they are not serializable) and transient session state (it should reset on app restart).
**When to use:** Always with Zustand persist.
**Key insight:** Session state (`isSessionActive`, `currentProblemIndex`, `sessionScore`, `sessionXpEarned`, `sessionAnswers`) is explicitly excluded -- a session should not resume after app kill. Child profile, skill progress, and gamification data must survive restarts.

### Pattern 4: Lazy Skill State Initialization
**What:** Create skill state entries on first encounter rather than eagerly for all 14 skills. Use a helper that returns existing state or creates a default entry.
**When to use:** When a child attempts a problem for a skill they haven't seen before.
**Example:**
```typescript
// In a service or helper, not in the slice itself
export function getOrCreateSkillState(
  skillStates: Record<string, SkillState>,
  skillId: string,
  defaultElo: number = 1000,
): SkillState {
  return skillStates[skillId] ?? {
    eloRating: defaultElo,
    attempts: 0,
    correct: 0,
  };
}
```

### Pattern 5: Hydration Awareness
**What:** AsyncStorage is async, so the store initially contains default (empty) state before hydration completes. The app must handle this transition.
**When to use:** Any component that reads persisted state on mount.
**Example:**
```typescript
// Source: Zustand persist docs
// Option A: Use onFinishHydration callback
const unsub = useAppStore.persist.onFinishHydration(() => {
  // State is now hydrated from AsyncStorage
});

// Option B: Check hydration status
if (useAppStore.persist.hasHydrated()) {
  // Safe to read persisted state
}
```

### Pattern 6: Avatar as Enum/Constant Set
**What:** Define a fixed set of avatar options (animal emojis or simple identifiers) rather than custom images. The `avatarId` field stores a string key into this set.
**When to use:** v0.1 -- simple avatar selection for children ages 6-9.
**Example:**
```typescript
export const AVATARS = [
  { id: 'fox', label: 'Fox', emoji: '' },
  { id: 'owl', label: 'Owl', emoji: '' },
  { id: 'bear', label: 'Bear', emoji: '' },
  { id: 'rabbit', label: 'Rabbit', emoji: '' },
  { id: 'cat', label: 'Cat', emoji: '' },
  { id: 'dog', label: 'Dog', emoji: '' },
  { id: 'panda', label: 'Panda', emoji: '' },
  { id: 'koala', label: 'Koala', emoji: '' },
] as const;

export type AvatarId = typeof AVATARS[number]['id'];
```

### Anti-Patterns to Avoid
- **Persisting action functions:** `partialize` must exclude all functions. Zustand persist serializes state to JSON -- functions are not serializable and will be silently dropped or cause errors on rehydration.
- **Persisting session state:** Session state (`isSessionActive`, `currentProblemIndex`, etc.) is transient. Persisting it means an interrupted session could resume in a broken state with stale problem references.
- **Adding state directly to appStore.ts:** CLAUDE.md guardrail -- always use or extend slice files.
- **Bumping STORE_VERSION without migration:** CLAUDE.md guardrail -- every version bump must have a corresponding migration function.
- **Deep-merging on rehydration without merge option:** Zustand's default is shallow merge. If `skillStates` is a nested `Record<string, SkillState>`, shallow merge at the top level works because the entire `skillStates` object is replaced. But if future phases add nested objects within slices, a custom `merge` function may be needed.
- **Eager initialization of all 14 skill states:** Wastes storage and complicates the initial state. Lazy creation on first problem attempt is cleaner.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence | Custom AsyncStorage read/write with manual serialization | Zustand `persist` middleware with `createJSONStorage` | Handles serialization, rehydration, versioning, migration out of the box |
| JSON storage adapter | Custom getItem/setItem wrapper around AsyncStorage | `createJSONStorage(() => AsyncStorage)` from `zustand/middleware` | Handles JSON parse/stringify, async resolution, error handling |
| State migration system | Custom version-check-and-transform logic | Zustand `persist` `version` + `migrate` options | Built-in version comparison and migration function invocation |
| Schema validation | Manual type checking of rehydrated state | Zod schemas for validating persisted data shape | Catches corruption, provides clear error messages, already in project stack |

**Key insight:** Zustand's persist middleware handles 90% of the persistence complexity. The only custom code needed is: (1) the `partialize` function listing which fields to persist, (2) migration functions for schema changes, and (3) optionally Zod schemas for rehydration validation.

## Common Pitfalls

### Pitfall 1: Async Hydration Race Condition
**What goes wrong:** Components render with default (empty) state before AsyncStorage hydration completes, causing a flash of empty UI or triggering "no profile" flows.
**Why it happens:** AsyncStorage is asynchronous. Zustand's persist middleware hydrates in a microtask after store creation.
**How to avoid:** Use `useAppStore.persist.hasHydrated()` or `onFinishHydration` to gate rendering. The app already has a splash screen (`expo-splash-screen`) that can be held until hydration completes.
**Warning signs:** Child profile appears blank briefly on app launch, then populates.

### Pitfall 2: Persisting Functions
**What goes wrong:** Action functions (e.g., `setChildProfile`, `addXp`) get serialized as `null` or cause JSON.stringify errors.
**Why it happens:** Functions are not JSON-serializable. Without `partialize`, the entire state object (including functions) is persisted.
**How to avoid:** Always use `partialize` to explicitly list only data fields. The `partialize` function should return an object containing only serializable state values.
**Warning signs:** `JSON.stringify` errors in console, or rehydrated state missing action functions.

### Pitfall 3: Shallow Merge Overwrites Nested State
**What goes wrong:** On rehydration, top-level persisted fields overwrite current state, but nested objects within the same key are replaced entirely rather than merged.
**Why it happens:** Zustand's default `merge` is shallow. For this phase, this is actually fine because `skillStates` is a single top-level key with the full `Record<string, SkillState>` value.
**How to avoid:** For v0.1 this is a non-issue. If future phases add deeply nested persisted state, provide a custom `merge` function.
**Warning signs:** Skill states or profile fields unexpectedly reset after rehydration.

### Pitfall 4: Forgetting to Update STORE_VERSION
**What goes wrong:** Schema shape changes without version bump means Zustand doesn't run migration, and old persisted state hydrates into incompatible new state shape.
**Why it happens:** Developer forgets CLAUDE.md guardrail.
**How to avoid:** Add a comment block at version constant. Existing test (`STORE_VERSION equals 1`) should be updated to match new version.
**Warning signs:** TypeScript errors or runtime crashes on rehydrated state access.

### Pitfall 5: Testing with Persist Middleware
**What goes wrong:** Tests that previously used `useAppStore.setState(useAppStore.getInitialState())` may behave differently when persist middleware is active, because `setState` triggers a persist write to the mocked AsyncStorage.
**Why it happens:** Persist middleware intercepts all `setState` calls.
**How to avoid:** The existing AsyncStorage mock (`jest/async-storage-mock`) handles this. Ensure tests reset state via `useAppStore.setState(useAppStore.getInitialState(), true)` (the `true` flag replaces state entirely). Consider clearing mock storage between tests with `AsyncStorage.clear()`.
**Warning signs:** Test state leaking between test cases, or unexpected persist-related console warnings.

### Pitfall 6: Session State Resurrection
**What goes wrong:** If session state is accidentally persisted, killing the app mid-session and relaunching shows a "session in progress" with stale problem references.
**Why it happens:** Session state was included in `partialize`.
**How to avoid:** Explicitly exclude all session fields from `partialize`. The `startSession` action already resets all session fields, so even if accidentally persisted, starting a new session would clear stale data -- but prevention is better.
**Warning signs:** `isSessionActive` is `true` on app launch without user starting a session.

## Code Examples

Verified patterns from official sources and project codebase:

### Wrapping Existing Store with Persist
```typescript
// appStore.ts - AFTER Phase 4
// Source: Zustand docs + project pattern
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  type ChildProfileSlice,
  createChildProfileSlice,
} from './slices/childProfileSlice';
import {
  type SkillStatesSlice,
  createSkillStatesSlice,
} from './slices/skillStatesSlice';
import {
  type SessionStateSlice,
  createSessionStateSlice,
} from './slices/sessionStateSlice';
import {
  type GamificationSlice,
  createGamificationSlice,
} from './slices/gamificationSlice';
import { migrateStore } from './migrations';

export type AppState = ChildProfileSlice &
  SkillStatesSlice &
  SessionStateSlice &
  GamificationSlice;

/**
 * Increment + add migration function when changing schema shape.
 * See CLAUDE.md guardrail: never bump version without a corresponding migration.
 */
export const STORE_VERSION = 2;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createChildProfileSlice(...a),
      ...createSkillStatesSlice(...a),
      ...createSessionStateSlice(...a),
      ...createGamificationSlice(...a),
    }),
    {
      name: 'tiny-tallies-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: STORE_VERSION,
      migrate: migrateStore,
      partialize: (state) => ({
        childName: state.childName,
        childAge: state.childAge,
        childGrade: state.childGrade,
        avatarId: state.avatarId,
        skillStates: state.skillStates,
        xp: state.xp,
        level: state.level,
        weeklyStreak: state.weeklyStreak,
        lastSessionDate: state.lastSessionDate,
      }),
    },
  ),
);
```

### Migration Function
```typescript
// migrations.ts
// Source: Zustand persist docs version+migrate pattern
export function migrateStore(
  persistedState: unknown,
  version: number,
): Record<string, unknown> {
  const state = (persistedState ?? {}) as Record<string, unknown>;

  // v1 -> v2: First persist enablement. No shape changes needed,
  // but migration function is required by CLAUDE.md guardrail.
  if (version < 2) {
    // Ensure all expected fields exist with defaults
    state.childName ??= null;
    state.childAge ??= null;
    state.childGrade ??= null;
    state.avatarId ??= null;
    state.skillStates ??= {};
    state.xp ??= 0;
    state.level ??= 1;
    state.weeklyStreak ??= 0;
    state.lastSessionDate ??= null;
  }

  return state;
}
```

### Test Pattern with Persist Middleware
```typescript
// Source: Zustand testing docs + project pattern
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, STORE_VERSION } from '@/store/appStore';

describe('appStore persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it('STORE_VERSION equals 2', () => {
    expect(STORE_VERSION).toBe(2);
  });

  it('persists child profile across store recreation', async () => {
    useAppStore.getState().setChildProfile({
      childName: 'Luna',
      childAge: 7,
    });

    // Wait for persist to write
    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = await AsyncStorage.getItem('tiny-tallies-store');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.childName).toBe('Luna');
    expect(parsed.state.childAge).toBe(7);
  });

  it('does NOT persist session state', async () => {
    useAppStore.getState().startSession();

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = await AsyncStorage.getItem('tiny-tallies-store');
    const parsed = JSON.parse(stored!);
    expect(parsed.state.isSessionActive).toBeUndefined();
    expect(parsed.state.sessionAnswers).toBeUndefined();
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zustand v4 `persist` with `getStorage` | Zustand v5 `persist` with `storage` + `createJSONStorage` | Zustand v4.4+ | `getStorage` removed; use `createJSONStorage(() => AsyncStorage)` instead |
| Manual JSON.parse/stringify in custom storage | `createJSONStorage` handles serialization | Zustand v4.4+ | Eliminates common serialization bugs |
| `serialize`/`deserialize` persist options | Removed in v5 | Zustand v5 | Use custom `storage` implementation if custom serialization needed |
| AsyncStorage v1.x (community) | AsyncStorage v2.x (improved API) | 2024 | v2.x has better TypeScript support, same API surface |

**Deprecated/outdated:**
- `getStorage` option in persist: Removed in Zustand v4.4+, use `storage` with `createJSONStorage`
- `serialize`/`deserialize` options: Removed in Zustand v5
- `@react-native-community/async-storage`: Renamed to `@react-native-async-storage/async-storage` long ago

## Open Questions

1. **Default starting Elo for new skill entries**
   - What we know: Template `baseElo` values range from 800 (single-digit operations) to 1250 (three-digit with carry/borrow). These represent problem difficulty, not player skill.
   - What's unclear: Whether to use a single default (e.g., 1000) or set initial Elo based on the skill's template baseElo.
   - Recommendation: Use a single default of 1000 for all new skill entries. Phase 5 (Adaptive Difficulty) will handle the Elo update logic. Starting at 1000 is standard Elo convention and places the child in the middle of the difficulty range (800-1250), which the adaptive system can quickly adjust.

2. **Profile completeness gating**
   - What we know: STOR-01 requires name, age, grade, avatar. The UI for profile setup is Phase 7.
   - What's unclear: Whether Phase 4 should add a `isProfileComplete` computed check or leave that to Phase 7.
   - Recommendation: Add a simple `isProfileComplete` derived getter (not stored state) that checks all four fields are non-null. Phase 7 can use this to decide whether to show setup flow.

3. **Session history for past sessions**
   - What we know: CONTEXT.md lists session history as Claude's discretion. Phase 6 will need session summaries.
   - What's unclear: Whether to add a `sessionHistory` array now or defer to Phase 6.
   - Recommendation: Defer to Phase 6. Phase 4 scope is persistence of current state shapes. Adding session history requires defining the summary shape, which depends on Phase 6 session flow design.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7 + jest-expo 54.0.13 |
| Config file | `jest.config.js` |
| Quick run command | `npm test -- --testPathPattern=appStore` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STOR-01 | Child profile stores name, age, grade, avatar | unit | `npm test -- --testPathPattern=appStore` | Partial (exists but needs persistence assertions) |
| STOR-02 | Skill states track Elo, attempts, correct per skill | unit | `npm test -- --testPathPattern=appStore` | Partial (exists but needs enriched state assertions) |
| STOR-03 | Session state tracks index, answers, score, XP | unit | `npm test -- --testPathPattern=appStore` | Partial (exists but needs non-persistence assertion) |
| STOR-04 | All state survives app restart via AsyncStorage | integration | `npm test -- --testPathPattern=appStore` | No -- needs new persistence tests |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=appStore`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] Persistence integration tests (STOR-04) -- verify data survives store recreation
- [ ] Migration test -- verify `migrateStore` handles version transitions
- [ ] Partialize test -- verify session state excluded from persistence
- [ ] Update existing `STORE_VERSION equals 1` test to `equals 2`

## Sources

### Primary (HIGH confidence)
- Zustand official docs: [Persisting store data](https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data) -- persist middleware API, `createJSONStorage`, `partialize`, `version`, `migrate`
- Zustand GitHub: [pmndrs/zustand](https://github.com/pmndrs/zustand) -- v5.0.11 confirmed installed
- Zustand persist middleware: [DeepWiki analysis](https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware) -- middleware architecture, hydration lifecycle, type signatures
- Expo AsyncStorage docs: [expo.dev/sdk/async-storage](https://docs.expo.dev/versions/latest/sdk/async-storage/) -- installation, compatibility with SDK 54
- Existing codebase: `src/store/appStore.ts`, all 4 slice files, `jest.setup.js`, `jest.config.js`

### Secondary (MEDIUM confidence)
- Zustand Discussion #2027: [Slices + persist TypeScript](https://github.com/pmndrs/zustand/discussions/2027) -- verified approach of wrapping `create()` with `persist()` at the composed level
- Zustand Discussion #1717: [Migration best practices](https://github.com/pmndrs/zustand/discussions/1717) -- versioned migration pattern
- DEV Community: [Zustand persist with AsyncStorage](https://dev.to/finalgirl321/making-zustand-persist-play-nice-with-async-storage-react-suspense-part-12-58l1) -- hydration handling patterns

### Tertiary (LOW confidence)
- None -- all findings verified with primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- both zustand and async-storage already installed and version-verified
- Architecture: HIGH -- persist + slices pattern well-documented in official Zustand docs and multiple verified discussions
- Pitfalls: HIGH -- async hydration, function serialization, and shallow merge are well-known documented issues with established solutions

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable libraries, no breaking changes expected)
