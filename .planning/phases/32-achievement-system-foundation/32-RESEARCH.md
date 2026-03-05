# Phase 32: Achievement System Foundation - Research

**Researched:** 2026-03-04
**Domain:** Badge data layer (registry, evaluation engine, store persistence)
**Confidence:** HIGH

## Summary

Phase 32 builds a pure data layer for achievements: a static badge catalog, a side-effect-free evaluation engine, and an `achievementSlice` in the Zustand store with a v8->v9 migration. No UI work is in scope -- that is Phase 33. The codebase already has every pattern this phase needs: the `SKILLS` readonly array for catalog design, `levelProgression.ts` for pure-function game logic, domain slices with `StateCreator<AppState>`, and a well-tested migration chain. This is a straightforward application of established conventions.

**Primary recommendation:** Follow the exact patterns from `skills.ts` (catalog), `levelProgression.ts` (pure engine), `gamificationSlice.ts` + `misconceptionSlice.ts` (slice + selectors), and `migrations.ts` (version bump). The badge catalog, evaluation engine, and slice are three cleanly separable units with zero external dependencies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Per-skill mastery badges (14 skills), plus category roll-up badges (all addition, all subtraction), plus grade roll-up badges (grade 1, grade 2, grade 3) -- ~20+ mastery badges
- Behavior badges for: weekly streak milestones, session count milestones, remediation victories (misconception resolved)
- Tiered badge naming (bronze/silver/gold progression for escalating thresholds within a concept)
- Static readonly TypeScript array -- follows existing SKILLS pattern in `mathEngine/skills.ts`
- Simple thresholds only -- one condition per badge, no AND/OR compound rules
- Snapshot-based evaluation: engine reads current store state to determine eligibility, no separate progress counters
- sessionsCompleted counter added to gamificationSlice (not derived from attempts)
- Remediation victory = MisconceptionRecord with status 'resolved' (3 correct in remediation completes it)
- No meta-badges -- badges cannot require other badges as preconditions
- Post-session only -- runs during commit-on-complete flow, matches existing atomic update pattern
- Pure function: takes store state snapshot, returns newly-earned BadgeId[] (diffs against stored earned set)
- No side effects in engine -- caller persists results to store
- Single-pass evaluation -- no ordering dependencies between badges
- New achievementSlice (separate from gamificationSlice) -- domain separation: gamification = XP/level/streaks, achievement = badges
- earnedBadges: Record<BadgeId, { earnedAt: string }> -- IDs with timestamps for "earned on" display
- sessionsCompleted: number added to gamificationSlice (general game stat, not badge-specific)
- STORE_VERSION 8 -> 9: standard empty-init migration (earnedBadges: {}, sessionsCompleted: 0), no backfilling

### Claude's Discretion
- Exact badge names and descriptions within the tiered pattern
- Badge ID naming convention details
- TypeScript type design for unlock condition discriminated union
- Internal structure of the evaluation engine (iteration order, short-circuit logic)
- Test coverage strategy

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACHV-01 | Badge registry with static catalog (ID, category, unlock conditions, reward associations) | Badge catalog design follows SKILLS readonly array pattern. Discriminated union for unlock conditions. See Architecture Patterns section. |
| ACHV-02 | Badge evaluation engine checks unlock conditions post-session | Pure function pattern from levelProgression.ts. Snapshot-based evaluation reads store state, diffs against earnedBadges. See Code Examples section. |
| ACHV-03 | Badge state persisted in store (earnedBadges, badgeProgress) with migration | achievementSlice pattern from misconceptionSlice.ts. v8->v9 migration in established chain. See Store Migration section. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | (existing) | State management via domain slices | Already used -- 7 slices composed in appStore.ts |
| TypeScript | strict mode | Type-safe badge definitions and discriminated unions | Project requirement |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jest + jest-expo | (existing) | Unit tests for engine, slice, migration | All new code |

### Alternatives Considered
None -- this phase uses zero external dependencies. All work is pure TypeScript with existing Zustand patterns.

## Architecture Patterns

### Recommended Project Structure
```
src/
  services/
    achievement/
      badgeRegistry.ts      # Static BADGES array + lookup helpers (~200 lines)
      badgeEvaluation.ts    # Pure evaluation engine (~150 lines)
      badgeTypes.ts         # Type definitions (~80 lines)
      index.ts              # Barrel exports
  store/
    slices/
      achievementSlice.ts   # earnedBadges state + actions (~60 lines)
    appStore.ts             # Add achievementSlice to composition + partialize
    migrations.ts           # Add version < 9 migration block
```

### Pattern 1: Static Readonly Catalog (from skills.ts)

**What:** Badge definitions as a `readonly` TypeScript array with typed entries, exported as a module-level constant.
**When to use:** For the badge registry -- same pattern as `SKILLS` in `mathEngine/skills.ts`.
**Example:**
```typescript
// Source: existing pattern in src/services/mathEngine/skills.ts
export const BADGES: readonly BadgeDefinition[] = [
  {
    id: 'mastery.addition.single-digit.no-carry',
    name: 'Addition Starter',
    description: 'Master adding within 10',
    category: 'mastery',
    tier: 'bronze',
    condition: {
      type: 'skill-mastery',
      skillId: 'addition.single-digit.no-carry',
    },
  },
  // ...
] as const;

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGES.filter((b) => b.category === category);
}
```

### Pattern 2: Discriminated Union for Unlock Conditions

**What:** Each badge has exactly one unlock condition, modeled as a discriminated union on a `type` field. No compound conditions.
**When to use:** For type-safe condition checking in the evaluation engine.
**Example:**
```typescript
// Each condition type maps to exactly one check in the evaluator
export type UnlockCondition =
  | { type: 'skill-mastery'; skillId: string }
  | { type: 'category-mastery'; operation: Operation }
  | { type: 'grade-mastery'; grade: Grade }
  | { type: 'streak-milestone'; weeklyStreakRequired: number }
  | { type: 'sessions-milestone'; sessionsRequired: number }
  | { type: 'remediation-victory'; resolvedCountRequired: number };
```

### Pattern 3: Pure-Function Evaluation Engine (from levelProgression.ts)

**What:** A pure function that takes a store state snapshot and returns newly-earned badge IDs. No side effects, no store coupling.
**When to use:** For the badge evaluation engine -- same pattern as `detectLevelUp()` and `computeStreakUpdate()`.
**Example:**
```typescript
// Source: follows pattern from src/services/gamification/levelProgression.ts
export function evaluateBadges(
  snapshot: BadgeEvaluationSnapshot,
  earnedBadges: Record<string, { earnedAt: string }>,
): string[] {
  const newlyEarned: string[] = [];
  for (const badge of BADGES) {
    if (earnedBadges[badge.id]) continue; // already earned
    if (checkCondition(badge.condition, snapshot)) {
      newlyEarned.push(badge.id);
    }
  }
  return newlyEarned;
}
```

### Pattern 4: Domain Slice (from misconceptionSlice.ts)

**What:** A Zustand slice with `StateCreator<AppState>` typing, containing state + actions + exported selector functions.
**When to use:** For `achievementSlice` -- follows the same pattern as `misconceptionSlice` and `gamificationSlice`.
**Example:**
```typescript
// Source: follows pattern from src/store/slices/misconceptionSlice.ts
export interface AchievementSlice {
  earnedBadges: Record<string, { earnedAt: string }>;
  addEarnedBadges: (badgeIds: string[]) => void;
}

export const createAchievementSlice: StateCreator<
  AppState,
  [],
  [],
  AchievementSlice
> = (set) => ({
  earnedBadges: {},
  addEarnedBadges: (badgeIds) =>
    set((state) => {
      const now = new Date().toISOString();
      const updates = { ...state.earnedBadges };
      for (const id of badgeIds) {
        if (!updates[id]) {
          updates[id] = { earnedAt: now };
        }
      }
      return { earnedBadges: updates };
    }),
});
```

### Pattern 5: Store Migration (from migrations.ts)

**What:** A new `if (version < 9)` block in the migration chain that initializes new fields with defaults.
**When to use:** For the v8->v9 migration that adds `earnedBadges` and `sessionsCompleted`.
**Example:**
```typescript
// Source: follows pattern from src/store/migrations.ts
if (version < 9) {
  // v8 -> v9: Add achievement system and session counter
  state.earnedBadges ??= {};
  state.sessionsCompleted ??= 0;
}
```

### Anti-Patterns to Avoid
- **Coupling engine to store:** The evaluation engine must NOT import from `@/store/appStore` or call `useAppStore`. It receives a plain snapshot object.
- **Progress counters in badges:** The decision says NO separate progress counters -- the engine reads existing state (skillStates, misconceptions, weeklyStreak, sessionsCompleted).
- **Compound conditions:** Each badge has exactly ONE condition. No AND/OR logic, no badge-requires-badge chains.
- **Side effects in evaluator:** The `evaluateBadges` function returns IDs only. The caller (session completion flow) calls `addEarnedBadges`.
- **Inline state in appStore.ts:** Never add state directly to appStore.ts -- all state goes through slices (CLAUDE.md guardrail).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence | Custom AsyncStorage logic | Zustand persist middleware (already configured) | Handles serialization, rehydration, migrations |
| Migration chain | Separate migration scripts | Existing `migrateStore()` function with `if (version < N)` pattern | Established chain from v1-v8, proven reliable |
| Mastery checking | Custom mastery logic | Read `skillStates[id].masteryLocked` boolean | BKT + soft lock already computed by adaptive service |
| Misconception resolution | Custom status tracking | Read `misconceptions[key].status === 'resolved'` | MisconceptionSlice already tracks full lifecycle |
| Streak reading | Recalculate streaks | Read `weeklyStreak` from gamificationSlice | Already maintained by session completion flow |

**Key insight:** The entire badge system reads existing state -- it creates almost no new state. The only new persisted fields are `earnedBadges` (Record) and `sessionsCompleted` (number).

## Common Pitfalls

### Pitfall 1: Forgetting to update partialize in appStore.ts
**What goes wrong:** New slice state is not included in the `partialize` function, so it never persists to AsyncStorage.
**Why it happens:** The `partialize` function in `appStore.ts` explicitly lists which fields to persist. New fields are silently dropped if not added.
**How to avoid:** After creating `achievementSlice`, add `earnedBadges` to the `partialize` return object. Also add `sessionsCompleted` when extending gamificationSlice.
**Warning signs:** Badge state resets on app restart during testing.

### Pitfall 2: Version bump without migration function
**What goes wrong:** CLAUDE.md guardrail violation -- store version 9 but no `if (version < 9)` block.
**Why it happens:** Developer bumps `STORE_VERSION` constant but forgets migration.
**How to avoid:** Always pair `STORE_VERSION = 9` with `if (version < 9) { ... }` in `migrations.ts`. Test the migration chain.
**Warning signs:** Existing users get undefined values after app update.

### Pitfall 3: Badge ID collisions or typos
**What goes wrong:** Two badges share the same ID, or a badge condition references a non-existent skillId.
**Why it happens:** With 20+ badges, manual IDs are error-prone.
**How to avoid:** Use a naming convention like `{category}.{operation}.{skill-slug}.{tier}` for mastery badges and `{category}.{metric}.{tier}` for behavior badges. Add a unit test that validates all badge IDs are unique and all referenced skillIds exist in the SKILLS array.
**Warning signs:** Wrong badge awarded, or badge never unlocks.

### Pitfall 4: Evaluation snapshot type mismatch
**What goes wrong:** Engine reads a field that doesn't exist in the snapshot, causing runtime errors.
**Why it happens:** The snapshot type is manually defined rather than derived from store state.
**How to avoid:** Define a `BadgeEvaluationSnapshot` interface that explicitly picks the fields needed from store state. The caller constructs this from `useAppStore.getState()`.
**Warning signs:** TypeScript errors if snapshot interface is properly typed; runtime undefined if not.

### Pitfall 5: Mutating earnedBadges record in slice
**What goes wrong:** Zustand state mutation without spread, causing stale renders.
**Why it happens:** Direct object mutation instead of immutable update.
**How to avoid:** Always spread: `{ ...state.earnedBadges, [id]: { earnedAt: now } }`. Follow the misconceptionSlice pattern.
**Warning signs:** UI doesn't update after earning badge, or React devtools shows stale state.

### Pitfall 6: File exceeds 500-line limit
**What goes wrong:** CLAUDE.md guardrail violation if badge catalog grows large.
**Why it happens:** 20+ badge definitions with descriptions can be verbose.
**How to avoid:** Keep badge definitions concise. If registry exceeds 400 lines, split into `masteryBadges.ts`, `behaviorBadges.ts`, and compose in `badgeRegistry.ts`.
**Warning signs:** Lint or review catches file length.

## Code Examples

### Badge Type Definitions
```typescript
// src/services/achievement/badgeTypes.ts
import type { Grade, Operation } from '../mathEngine/types';

export type BadgeCategory = 'mastery' | 'behavior' | 'exploration' | 'remediation';
export type BadgeTier = 'bronze' | 'silver' | 'gold';

export type UnlockCondition =
  | { type: 'skill-mastery'; skillId: string }
  | { type: 'category-mastery'; operation: Operation }
  | { type: 'grade-mastery'; grade: Grade }
  | { type: 'streak-milestone'; weeklyStreakRequired: number }
  | { type: 'sessions-milestone'; sessionsRequired: number }
  | { type: 'remediation-victory'; resolvedCountRequired: number };

export interface BadgeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: BadgeCategory;
  readonly tier: BadgeTier;
  readonly condition: UnlockCondition;
}
```

### Badge Evaluation Snapshot
```typescript
// Minimal snapshot interface -- only what the engine needs
export interface BadgeEvaluationSnapshot {
  skillStates: Record<string, { masteryLocked: boolean }>;
  weeklyStreak: number;
  sessionsCompleted: number;
  misconceptions: Record<string, { status: string }>;
}
```

### Evaluation Engine - Condition Checker
```typescript
// src/services/achievement/badgeEvaluation.ts
import { SKILLS } from '../mathEngine/skills';
import { BADGES } from './badgeRegistry';
import type { BadgeEvaluationSnapshot, UnlockCondition } from './badgeTypes';

function checkCondition(
  condition: UnlockCondition,
  snapshot: BadgeEvaluationSnapshot,
): boolean {
  switch (condition.type) {
    case 'skill-mastery':
      return snapshot.skillStates[condition.skillId]?.masteryLocked === true;

    case 'category-mastery': {
      const operationSkills = SKILLS.filter(
        (s) => s.operation === condition.operation,
      );
      return operationSkills.every(
        (s) => snapshot.skillStates[s.id]?.masteryLocked === true,
      );
    }

    case 'grade-mastery': {
      const gradeSkills = SKILLS.filter(
        (s) => s.grade === condition.grade,
      );
      return gradeSkills.every(
        (s) => snapshot.skillStates[s.id]?.masteryLocked === true,
      );
    }

    case 'streak-milestone':
      return snapshot.weeklyStreak >= condition.weeklyStreakRequired;

    case 'sessions-milestone':
      return snapshot.sessionsCompleted >= condition.sessionsRequired;

    case 'remediation-victory': {
      const resolvedCount = Object.values(snapshot.misconceptions)
        .filter((r) => r.status === 'resolved').length;
      return resolvedCount >= condition.resolvedCountRequired;
    }

    default:
      return false;
  }
}

export function evaluateBadges(
  snapshot: BadgeEvaluationSnapshot,
  earnedBadges: Record<string, { earnedAt: string }>,
): string[] {
  const newlyEarned: string[] = [];
  for (const badge of BADGES) {
    if (earnedBadges[badge.id]) continue;
    if (checkCondition(badge.condition, snapshot)) {
      newlyEarned.push(badge.id);
    }
  }
  return newlyEarned;
}
```

### Store Integration Points

**appStore.ts changes:**
```typescript
// 1. Import new slice
import {
  type AchievementSlice,
  createAchievementSlice,
} from './slices/achievementSlice';

// 2. Add to AppState union
export type AppState = ChildProfileSlice &
  SkillStatesSlice &
  SessionStateSlice &
  GamificationSlice &
  SandboxSlice &
  TutorSlice &
  MisconceptionSlice &
  AchievementSlice;  // <-- NEW

// 3. Bump version
export const STORE_VERSION = 9;

// 4. Spread in store creator
...createAchievementSlice(...a),

// 5. Add to partialize
earnedBadges: state.earnedBadges,
sessionsCompleted: state.sessionsCompleted,
```

**gamificationSlice.ts changes:**
```typescript
// Add sessionsCompleted field and incrementer
export interface GamificationSlice {
  // ...existing...
  sessionsCompleted: number;
  incrementSessionsCompleted: () => void;
}

// In createGamificationSlice:
sessionsCompleted: 0,
incrementSessionsCompleted: () =>
  set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 })),
```

### Migration Test Pattern
```typescript
// Follow exact pattern from existing migration tests
it('migrateStore from version 8 initializes achievement fields', () => {
  const input = { childName: 'Luna', xp: 500, weeklyStreak: 3 };
  const result = migrateStore(input, 8);
  expect(result.earnedBadges).toEqual({});
  expect(result.sessionsCompleted).toBe(0);
});

it('migrateStore chains v1->v9 correctly', () => {
  const input = { childName: 'Max', skillStates: {} };
  const result = migrateStore(input, 1);
  // All prior migrations applied
  expect(result.tutorConsentGranted).toBe(false);
  expect(result.misconceptions).toEqual({});
  // New v9 fields
  expect(result.earnedBadges).toEqual({});
  expect(result.sessionsCompleted).toBe(0);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Badge progress counters | Snapshot-based evaluation (read existing state) | Decision for this project | No extra state to maintain; badges are derived |
| Compound badge conditions (AND/OR) | Single condition per badge | Decision for this project | Simpler engine, no ordering issues |
| Badge-unlock-badge chains (meta-badges) | No meta-badges | Decision for this project | Single-pass evaluation guaranteed correct |

**Why snapshot-based is better for this app:** The store already tracks mastery (BKT `masteryLocked`), misconceptions (status lifecycle), streaks (`weeklyStreak`), and will track sessions (`sessionsCompleted`). Duplicating these as badge-specific counters would be redundant and create sync bugs.

## Open Questions

1. **Badge catalog exact count**
   - What we know: ~20+ mastery badges (14 skills + 2 operation + 3 grade rollups), behavior badges for streaks/sessions/remediation with tiered progression
   - What's unclear: Exact number of tiers per behavior badge (e.g., streak: 2-week bronze, 4-week silver, 8-week gold?)
   - Recommendation: Start with 3 tiers for streak and session badges, 2 tiers for remediation badges. Planner defines exact thresholds.

2. **Session counter increment location**
   - What we know: `sessionsCompleted` goes in gamificationSlice, incremented post-session
   - What's unclear: Should it increment in `commitSessionResults` (sessionOrchestrator) or in `useSession` after calling commit?
   - Recommendation: Increment in the same `commitSessionResults` function where XP/streak already update -- keeps all post-session state changes atomic.

3. **Badge evaluation caller location (Phase 33 integration point)**
   - What we know: Badge evaluation runs post-session during commit-on-complete flow
   - What's unclear: Exact call site -- inside `commitSessionResults` or after it returns in `useSession`?
   - Recommendation: Keep evaluation outside `commitSessionResults` to avoid coupling. Call it in `useSession` after commit returns, using `useAppStore.getState()` as the snapshot. The evaluation result feeds into `SessionResult` for Phase 33 UI consumption. This phase just builds the engine; integration can be deferred to Phase 33.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npm test -- --testPathPattern=achievement` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACHV-01 | Badge registry has correct entries, unique IDs, valid skillId refs | unit | `npm test -- --testPathPattern=badgeRegistry` | No -- Wave 0 |
| ACHV-02 | Evaluation engine returns correct badge IDs for given snapshots | unit | `npm test -- --testPathPattern=badgeEvaluation` | No -- Wave 0 |
| ACHV-02 | Engine skips already-earned badges | unit | `npm test -- --testPathPattern=badgeEvaluation` | No -- Wave 0 |
| ACHV-02 | Each condition type evaluates correctly | unit | `npm test -- --testPathPattern=badgeEvaluation` | No -- Wave 0 |
| ACHV-03 | achievementSlice addEarnedBadges action works | unit | `npm test -- --testPathPattern=achievementSlice` | No -- Wave 0 |
| ACHV-03 | v8->v9 migration initializes defaults | unit | `npm test -- --testPathPattern=migrations` | Partially (existing file, new tests needed) |
| ACHV-03 | v1->v9 full chain migration works | unit | `npm test -- --testPathPattern=migrations` | Partially |
| ACHV-03 | sessionsCompleted persists via gamificationSlice | unit | `npm test -- --testPathPattern=achievementSlice` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=achievement\|migrations\|gamification`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/achievement/badgeRegistry.test.ts` -- covers ACHV-01 (catalog validation)
- [ ] `src/__tests__/achievement/badgeEvaluation.test.ts` -- covers ACHV-02 (engine logic)
- [ ] `src/__tests__/store/achievementSlice.test.ts` -- covers ACHV-03 (slice actions)
- [ ] New test cases in `src/__tests__/migrations.test.ts` -- covers ACHV-03 (v8->v9 migration)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/services/mathEngine/skills.ts` -- catalog pattern reference
- Existing codebase: `src/services/gamification/levelProgression.ts` -- pure function engine pattern
- Existing codebase: `src/store/slices/gamificationSlice.ts` -- slice pattern for sessionsCompleted
- Existing codebase: `src/store/slices/misconceptionSlice.ts` -- slice + selectors pattern, resolved status check
- Existing codebase: `src/store/slices/skillStatesSlice.ts` -- masteryLocked field for mastery badges
- Existing codebase: `src/store/appStore.ts` -- slice composition, partialize, STORE_VERSION
- Existing codebase: `src/store/migrations.ts` -- migration chain pattern (v1-v8)
- Existing codebase: `src/__tests__/migrations.test.ts` -- migration test pattern
- Existing codebase: `src/hooks/useSession.ts` -- commit-on-complete flow, integration point
- Existing codebase: `src/services/session/sessionOrchestrator.ts` -- commitSessionResults pattern

### Secondary (MEDIUM confidence)
- None needed -- this phase is entirely informed by existing codebase patterns

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all existing patterns
- Architecture: HIGH -- every pattern has a direct precedent in the codebase
- Pitfalls: HIGH -- identified from existing migration/slice patterns and CLAUDE.md guardrails

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days -- stable domain, no external dependencies)
