# Phase 15: Foundation -- Store Schema, Services, and Mappings - Research

**Researched:** 2026-03-03
**Domain:** Zustand store migration, CPA progression service, manipulative-to-skill mapping, Reanimated 4 babel config
**Confidence:** HIGH

## Summary

Phase 15 delivers four pieces of infrastructure: (1) a store schema migration from STORE_VERSION 4 to 5 adding `cpaLevel` to `SkillState`, (2) a CPA mapping service that derives concrete/pictorial/abstract stage from BKT mastery probability, (3) a static manipulative-to-skill mapping table, and (4) a babel.config.js fix for Reanimated 4 worklet compilation.

All four deliverables follow well-established patterns already in the codebase. The store migration follows the exact `if (version < N)` chain pattern used in v3->v4 (Leitner migration). The CPA service follows the pure-function calculator pattern used by `eloCalculator`, `bktCalculator`, and `leitnerCalculator`. The mapping table follows the static-data pattern of `SKILLS` in `src/services/mathEngine/skills.ts`. The babel fix is a single-line plugin name change.

**Primary recommendation:** Follow existing codebase patterns exactly -- the migration, service, and mapping table patterns are mature and well-tested through 14 prior phases. The only novel aspect is the manipulative-to-skill mapping content, which requires math pedagogy alignment with Common Core standards.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- CPA thresholds: P(L) < 0.40 = concrete, 0.40-0.85 = pictorial, >= 0.85 = abstract
- One-way advance only -- once a child reaches pictorial, they never drop back to concrete even if P(L) dips
- In pictorial mode, child can tap optional "show blocks" button to access interactive concrete manipulative (scaffolding without regression)
- CPA level advances at session end only, inside commitSessionResults -- atomic with Elo/BKT/Leitner, consistent with existing commit-on-complete pattern
- Each skill maps to multiple manipulatives with a ranked preference list (session picks #1 by default, sandbox shows all)
- General mapping pattern: single-digit/within-10 -> counters, ten frame; within-20 -> ten frame, number line; two-digit -> base-ten blocks, number line; three-digit -> base-ten blocks
- Subtraction mirrors addition mappings
- Bar model available for all word problems as secondary manipulative
- Fraction strips: sandbox-only for now -- no fraction skills in current 14-skill set
- BKT-informed initial CPA placement: use existing P(L) to determine starting CPA level (mirrors v3->v4 Leitner box placement pattern)
- CPA level stored as string enum: `'concrete' | 'pictorial' | 'abstract'`
- Field name: `cpaLevel` added to SkillState type
- Migration initializes: P(L) < 0.40 -> 'concrete', 0.40-0.85 -> 'pictorial', >= 0.85 -> 'abstract'
- Mapping table is a static pure-function lookup (no store reads) -- similar to SKILLS array

### Claude's Discretion
- Exact cpaMappingService function signature and return types
- Whether to create a new manipSlice or extend skillStatesSlice for CPA-related actions
- Babel config fix details (react-native-worklets/plugin vs react-native-reanimated/plugin)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Store schema supports CPA level per skill (STORE_VERSION 5 with migration) | Migration pattern documented below; follows exact v3->v4 pattern from `migrations.ts` lines 43-58. SkillState type extension, default value initialization, BKT-informed placement. |
| FOUND-02 | Babel config updated for Reanimated 4 worklet compilation | Official Reanimated 4 migration docs confirm: change `'react-native-reanimated/plugin'` to `'react-native-worklets/plugin'` in babel.config.js. Package `react-native-worklets@0.7.4` already installed. |
| FOUND-04 | Manipulative-to-skill mapping table determines which manipulative suits each math concept | Static mapping table pattern documented; all 14 skills mapped to ranked manipulative preferences based on Common Core pedagogy and user decisions. |
| CPA-01 | System tracks CPA stage per skill using BKT mastery (P(L) < 0.40 -> concrete, 0.40-0.85 -> pictorial, >= 0.85 -> abstract) | CPA derivation service as pure function; thresholds align with existing BKT_RETEACH_THRESHOLD (0.40) in bktCalculator.ts; one-way advance logic documented. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| zustand | ^5.0.8 | State management with persist middleware | Installed, STORE_VERSION=4 |
| react-native-reanimated | ~4.1.1 | Animations on UI thread | Installed, babel plugin needs fix |
| react-native-worklets | ^0.7.4 | Worklet runtime for Reanimated 4 | Installed, plugin not yet configured |
| typescript | ~5.9.2 | Strict mode type checking | Installed |

### No New Dependencies Required
This phase requires zero new npm packages. All work uses existing installed libraries.

## Architecture Patterns

### Recommended File Structure
```
src/
  store/
    appStore.ts              # STORE_VERSION 4->5, partialize unchanged (cpaLevel already inside skillStates)
    migrations.ts            # Add if (version < 5) block
    slices/
      skillStatesSlice.ts    # Add cpaLevel to SkillState type + default value
    helpers/
      skillStateHelpers.ts   # Add cpaLevel to getOrCreateSkillState default
  services/
    cpa/                     # NEW directory
      index.ts               # Barrel export
      cpaTypes.ts            # CpaStage type, ManipulativeType enum, mapping types
      cpaMappingService.ts   # deriveCpaStage(), getManipulativesForSkill()
      skillManipulativeMap.ts # Static SKILL_MANIPULATIVE_MAP constant
  __tests__/
    cpa/                     # NEW test directory
      cpaMappingService.test.ts
      skillManipulativeMap.test.ts
    migrations.test.ts       # Add v4->v5 test cases (extend existing file)
    appStore.test.ts         # Update STORE_VERSION assertion 4->5
```

### Pattern 1: Store Migration (v4->v5)
**What:** Add `cpaLevel` field to SkillState with BKT-informed initial placement
**When to use:** Follows exact same pattern as v3->v4 migration
**Example:**
```typescript
// Source: src/store/migrations.ts (existing v3->v4 pattern)
if (version < 5) {
  // v4 -> v5: Add CPA level to existing skill states
  const skillStates = (state.skillStates ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  for (const skillId of Object.keys(skillStates)) {
    const skill = skillStates[skillId];
    const masteryProbability = (skill.masteryProbability as number) ?? 0.1;
    // BKT-informed initial CPA placement
    skill.cpaLevel ??= mapPLToCpaStage(masteryProbability);
  }
  state.skillStates = skillStates;
}
```

### Pattern 2: Pure Function Service (CPA Calculator)
**What:** Stateless functions that compute CPA stage from mastery data
**When to use:** Same pattern as eloCalculator, bktCalculator, leitnerCalculator
**Example:**
```typescript
// Source: follows bktCalculator.ts pattern
export type CpaStage = 'concrete' | 'pictorial' | 'abstract';

export const CPA_CONCRETE_THRESHOLD = 0.40;
export const CPA_ABSTRACT_THRESHOLD = 0.85;

export function deriveCpaStage(masteryProbability: number): CpaStage {
  if (masteryProbability < CPA_CONCRETE_THRESHOLD) return 'concrete';
  if (masteryProbability < CPA_ABSTRACT_THRESHOLD) return 'pictorial';
  return 'abstract';
}

// One-way advance: CPA can only go forward, never regress
export function advanceCpaStage(
  currentStage: CpaStage,
  newMasteryProbability: number,
): CpaStage {
  const derivedStage = deriveCpaStage(newMasteryProbability);
  const stageOrder: Record<CpaStage, number> = {
    concrete: 0,
    pictorial: 1,
    abstract: 2,
  };
  return stageOrder[derivedStage] > stageOrder[currentStage]
    ? derivedStage
    : currentStage;
}
```

### Pattern 3: Static Mapping Table
**What:** Pure-function lookup from skill ID to ranked manipulative list
**When to use:** Same pattern as SKILLS array in skills.ts
**Example:**
```typescript
// Source: follows src/services/mathEngine/skills.ts pattern
export type ManipulativeType =
  | 'base_ten_blocks'
  | 'number_line'
  | 'fraction_strips'
  | 'counters'
  | 'ten_frame'
  | 'bar_model';

export interface SkillManipulativeMapping {
  skillId: string;
  manipulatives: ManipulativeType[];  // Ranked preference: [0] = primary
}

export const SKILL_MANIPULATIVE_MAP: readonly SkillManipulativeMapping[] = [
  // ...entries for all 14 skills
];

export function getManipulativesForSkill(
  skillId: string,
): ManipulativeType[] {
  const mapping = SKILL_MANIPULATIVE_MAP.find((m) => m.skillId === skillId);
  return mapping?.manipulatives ?? [];
}

export function getPrimaryManipulative(
  skillId: string,
): ManipulativeType | null {
  const manipulatives = getManipulativesForSkill(skillId);
  return manipulatives[0] ?? null;
}
```

### Anti-Patterns to Avoid
- **Storing derived CPA in multiple places:** CPA stage is derived from BKT mastery -- store only `cpaLevel` in SkillState, never duplicate in a separate slice
- **Making CPA bidirectional:** User decision: CPA is one-way advance only. Never regress from pictorial to concrete.
- **Reading store from mapping table:** The mapping is a static pure-function lookup. It takes a skillId string and returns manipulative types. No store dependency.
- **Computing CPA mid-session:** CPA advances only at session end inside `commitSessionResults`, never during problem-by-problem updates
- **Creating a separate manipSlice:** Recommendation: extend SkillStatesSlice by adding `cpaLevel` to SkillState type. No new slice needed -- CPA is a per-skill property, not independent state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Store migration | Custom migration system | Zustand persist `migrate` function with `if (version < N)` chain | Existing pattern handles all edge cases (null state, chaining, partial data) |
| CPA stage ordering | Manual if/else chains for stage comparison | Numeric stage-order map (`{ concrete: 0, pictorial: 1, abstract: 2 }`) | Clean one-way advance logic without string comparison bugs |
| Babel worklet compilation | Manual babel transform | `react-native-worklets/plugin` (already installed) | Official Reanimated 4 babel plugin handles worklet extraction to UI thread |

## Common Pitfalls

### Pitfall 1: Forgetting to Update All Default-Value Locations
**What goes wrong:** Adding `cpaLevel` to SkillState type but missing `getOrCreateSkillState` or the `createSkillStatesSlice` default object
**Why it happens:** Three locations define SkillState defaults: (a) SkillState type, (b) `createSkillStatesSlice` fallback in `updateSkillState`, (c) `getOrCreateSkillState` helper
**How to avoid:** Update all three locations atomically. Run `npm run typecheck` -- TypeScript strict mode will catch missing fields.
**Warning signs:** TypeScript errors about missing properties; tests fail with undefined cpaLevel

### Pitfall 2: Migration Using Wrong Threshold for Initial Placement
**What goes wrong:** STATE.md notes a discrepancy: research says 0.40/0.85, but an earlier ARCHITECTURE.md reference used 0.60/0.85
**Why it happens:** Different documents were written at different times with different threshold assumptions
**How to avoid:** CONTEXT.md locks the thresholds at P(L) < 0.40 = concrete, 0.40-0.85 = pictorial, >= 0.85 = abstract. Use these values exclusively. They align with `BKT_RETEACH_THRESHOLD = 0.40` already in `bktCalculator.ts`.
**Warning signs:** Tests checking threshold boundaries fail

### Pitfall 3: Babel Plugin Order
**What goes wrong:** `react-native-worklets/plugin` must be the LAST plugin in babel.config.js
**Why it happens:** The worklets plugin needs to process code after all other Babel transformations
**How to avoid:** Ensure the plugin array ends with `'react-native-worklets/plugin'`
**Warning signs:** Warning: "[Reanimated] Seems like you are using a Babel plugin `react-native-reanimated/plugin`..."

### Pitfall 4: Duplicate Babel Plugin from babel-preset-expo
**What goes wrong:** `babel-preset-expo` v54 automatically adds `react-native-worklets/plugin` when the package is detected, so manually adding it too could cause double-processing
**Why it happens:** Expo SDK 54's babel preset auto-configures the worklets plugin
**How to avoid:** Two valid approaches: (a) Remove the `plugins` array entirely from babel.config.js and let babel-preset-expo handle it automatically, or (b) replace `'react-native-reanimated/plugin'` with `'react-native-worklets/plugin'` explicitly. Approach (a) is cleaner but approach (b) is more explicit. Recommendation: use approach (b) for clarity and explicit documentation of the dependency.
**Warning signs:** Build warnings about duplicate plugins; Metro bundler warnings

### Pitfall 5: Not Bumping STORE_VERSION Without Migration
**What goes wrong:** CLAUDE.md guardrail: "Don't modify store migration version without adding a corresponding migration function"
**Why it happens:** Easy to bump STORE_VERSION to 5 and forget the migration block
**How to avoid:** Always pair: bump `STORE_VERSION` in `appStore.ts` AND add `if (version < 5)` block in `migrations.ts` in the same commit
**Warning signs:** Existing test `STORE_VERSION equals 4` will fail (it must be updated to 5)

### Pitfall 6: Partialize Doesn't Need Changes
**What goes wrong:** Developer thinks they need to add `cpaLevel` to partialize config
**Why it happens:** Confusion about what gets persisted
**How to avoid:** `cpaLevel` lives inside `skillStates` objects, and `skillStates` is already in partialize. No partialize change needed.
**Warning signs:** None -- this is a "don't do unnecessary work" pitfall

## Code Examples

### Complete Migration Block (v4->v5)
```typescript
// In src/store/migrations.ts
import { mapPLToCpaStage } from '../services/cpa/cpaMappingService';

// Add after existing if (version < 4) block:
if (version < 5) {
  // v4 -> v5: Add CPA level to existing skill states
  const skillStates = (state.skillStates ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  for (const skillId of Object.keys(skillStates)) {
    const skill = skillStates[skillId];
    // BKT-informed initial CPA placement (mirrors v3->v4 Leitner pattern)
    const masteryProbability = (skill.masteryProbability as number) ?? 0.1;
    skill.cpaLevel ??= mapPLToCpaStage(masteryProbability);
  }
  state.skillStates = skillStates;
}
```

### SkillState Type Extension
```typescript
// In src/store/slices/skillStatesSlice.ts -- add to SkillState type:
export type CpaStage = 'concrete' | 'pictorial' | 'abstract';

export type SkillState = {
  eloRating: number;
  attempts: number;
  correct: number;
  lastPracticed?: string;
  masteryProbability: number;
  consecutiveWrong: number;
  masteryLocked: boolean;
  leitnerBox: 1 | 2 | 3 | 4 | 5 | 6;
  nextReviewDue: string | null;
  consecutiveCorrectInBox6: number;
  /** CPA progression stage derived from BKT mastery. One-way advance only. */
  cpaLevel: CpaStage;
};
```

### Babel Config Fix
```javascript
// babel.config.js -- change from:
plugins: ['react-native-reanimated/plugin'],
// to:
plugins: ['react-native-worklets/plugin'],
```

### Complete Skill-Manipulative Mapping
```typescript
// Based on Common Core standards and user decisions in CONTEXT.md
// Pattern: single-digit/within-10 -> counters, ten frame
//          within-20 -> ten frame, number line
//          two-digit -> base-ten blocks, number line
//          three-digit -> base-ten blocks
//          bar model available as secondary for all skills

export const SKILL_MANIPULATIVE_MAP: readonly SkillManipulativeMapping[] = [
  // Addition skills
  { skillId: 'addition.single-digit.no-carry',    manipulatives: ['counters', 'ten_frame'] },
  { skillId: 'addition.within-20.no-carry',       manipulatives: ['ten_frame', 'number_line'] },
  { skillId: 'addition.within-20.with-carry',     manipulatives: ['ten_frame', 'number_line'] },
  { skillId: 'addition.two-digit.no-carry',       manipulatives: ['base_ten_blocks', 'number_line'] },
  { skillId: 'addition.two-digit.with-carry',     manipulatives: ['base_ten_blocks', 'number_line'] },
  { skillId: 'addition.three-digit.no-carry',     manipulatives: ['base_ten_blocks'] },
  { skillId: 'addition.three-digit.with-carry',   manipulatives: ['base_ten_blocks'] },
  // Subtraction skills (mirrors addition mappings per user decision)
  { skillId: 'subtraction.single-digit.no-borrow',  manipulatives: ['counters', 'ten_frame'] },
  { skillId: 'subtraction.within-20.no-borrow',     manipulatives: ['ten_frame', 'number_line'] },
  { skillId: 'subtraction.within-20.with-borrow',   manipulatives: ['ten_frame', 'number_line'] },
  { skillId: 'subtraction.two-digit.no-borrow',     manipulatives: ['base_ten_blocks', 'number_line'] },
  { skillId: 'subtraction.two-digit.with-borrow',   manipulatives: ['base_ten_blocks', 'number_line'] },
  { skillId: 'subtraction.three-digit.no-borrow',   manipulatives: ['base_ten_blocks'] },
  { skillId: 'subtraction.three-digit.with-borrow', manipulatives: ['base_ten_blocks'] },
];
```

### One-Way CPA Advance in commitSessionResults
```typescript
// Integration point in sessionOrchestrator.ts commitSessionResults
// After BKT/Elo/Leitner updates, compute CPA advance for each skill:
for (const [skillId, update] of pendingUpdates) {
  const currentCpaLevel = skillStates[skillId]?.cpaLevel ?? 'concrete';
  const newCpaLevel = advanceCpaStage(currentCpaLevel, update.newMasteryPL);
  updateSkillState(skillId, {
    // ...existing fields...
    cpaLevel: newCpaLevel,
  });
}
```

### Migration Test Pattern (follows existing test style)
```typescript
// In src/__tests__/migrations.test.ts
it('v4->v5 migration adds cpaLevel with BKT-informed placement', () => {
  const input = {
    skillStates: {
      'skill-low': {
        eloRating: 900, attempts: 5, correct: 2,
        masteryProbability: 0.15, consecutiveWrong: 0, masteryLocked: false,
        leitnerBox: 1, nextReviewDue: null, consecutiveCorrectInBox6: 0,
      },
      'skill-mid': {
        eloRating: 1050, attempts: 20, correct: 14,
        masteryProbability: 0.55, consecutiveWrong: 0, masteryLocked: false,
        leitnerBox: 3, nextReviewDue: null, consecutiveCorrectInBox6: 0,
      },
      'skill-high': {
        eloRating: 1200, attempts: 50, correct: 45,
        masteryProbability: 0.92, consecutiveWrong: 0, masteryLocked: true,
        leitnerBox: 5, nextReviewDue: null, consecutiveCorrectInBox6: 0,
      },
    },
  };
  const result = migrateStore(input, 4);
  const skills = result.skillStates as Record<string, Record<string, unknown>>;

  expect(skills['skill-low'].cpaLevel).toBe('concrete');    // 0.15 < 0.40
  expect(skills['skill-mid'].cpaLevel).toBe('pictorial');   // 0.40 <= 0.55 < 0.85
  expect(skills['skill-high'].cpaLevel).toBe('abstract');   // 0.92 >= 0.85
});
```

## Manipulative-to-Skill Mapping Rationale

The mapping follows Common Core pedagogy and the user's locked decisions:

| Skill Category | Primary Manipulative | Secondary | Pedagogical Reason |
|---------------|---------------------|-----------|-------------------|
| Single-digit / within-10 | Counters | Ten frame | One-to-one correspondence; counters are the most concrete representation for small quantities |
| Within-20 | Ten frame | Number line | Make-10 strategy visualization; ten frame shows "fill to 10 then count extras" |
| Two-digit | Base-ten blocks | Number line | Place value understanding; blocks show tens/ones decomposition physically |
| Three-digit | Base-ten blocks | (none) | Extended place value; hundreds flats + tens rods + ones cubes |
| All skills (word problems) | Bar model | (varies) | Part-whole relationship visualization for any operation |

**Fraction strips** are sandbox-only since no fraction skills exist in the current 14-skill set. When fraction skills are added in a future milestone, they will be mapped to fraction strips as the primary manipulative.

## CPA Threshold Reconciliation

STATE.md flagged a blocker: "CPA threshold reconciliation needed: research says 0.40/0.85, ARCHITECTURE.md says 0.60/0.85."

**Resolution:** CONTEXT.md locks the thresholds at 0.40/0.85. This aligns with:
- `BKT_RETEACH_THRESHOLD = 0.40` in `bktCalculator.ts` (already in codebase)
- The research-backed CPA progression (Fyfe et al. concreteness fading)
- Common Core pedagogy: children should spend meaningful time in concrete and pictorial stages

The 0.40 lower threshold means children stay in concrete mode longer, which is developmentally appropriate for ages 6-9.

## Babel Config Fix Details

### Current State
```javascript
// babel.config.js (current)
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],  // OLD - causes warning
  };
};
```

### Required Change
```javascript
// babel.config.js (fixed)
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],  // Must be last plugin
  };
};
```

### Key Facts
- `react-native-worklets@0.7.4` is already in `package.json` dependencies -- no `npm install` needed
- `react-native-reanimated@~4.1.1` is installed and requires New Architecture -- confirmed enabled via `"newArchEnabled": true` in `app.json`
- `babel-preset-expo` v54 auto-detects `react-native-worklets` and could configure the plugin automatically, but keeping the explicit entry is clearer and more maintainable
- The worklets plugin MUST be the last plugin in the array
- After changing babel.config.js, Metro bundler cache must be cleared: `npx expo start --clear`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-native-reanimated/plugin` | `react-native-worklets/plugin` | Reanimated 4.0 (2025) | Worklet extraction moved to standalone package |
| `runOnJS(fn)(args)` | `scheduleOnRN(fn, args)` | Reanimated 4.0 (2025) | Not needed in this phase but relevant for future phases |
| `runOnUI(() => {...})()` | `scheduleOnUI(() => {...})` | Reanimated 4.0 (2025) | Not needed in this phase but relevant for future phases |

## Open Questions

1. **Bar model as secondary for ALL skills or just word-problem skills?**
   - What we know: CONTEXT.md says "bar model available for all word problems as secondary manipulative." Current skills are all direct computation (no word problems yet).
   - What's unclear: Whether bar model should be listed in every skill's mapping now (anticipating word problem wrapping from the AI tutor) or only added when word problem skills exist.
   - Recommendation: Include bar model as the last entry in every skill's manipulative list. It costs nothing (it's just a static array entry) and prepares for AI tutor word-problem wrapping. If the planner disagrees, it's trivially removable.

2. **Should CpaStage type live in skillStatesSlice.ts or cpaTypes.ts?**
   - What we know: CpaStage is used in SkillState (store) and in CPA services. Putting it in the slice means services import from store; putting it in services means the store imports from services.
   - What's unclear: Which direction of dependency is cleaner.
   - Recommendation: Define `CpaStage` in `src/services/cpa/cpaTypes.ts` and import it into `skillStatesSlice.ts`. This follows the existing pattern where `LeitnerBox` type is defined in `leitnerTypes.ts` (services) and imported by store code. Services own the domain types.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/store/migrations.ts` -- migration chain pattern (lines 1-64)
- Codebase analysis: `src/store/slices/skillStatesSlice.ts` -- SkillState type and updateSkillState action
- Codebase analysis: `src/store/appStore.ts` -- STORE_VERSION=4, partialize config
- Codebase analysis: `src/services/adaptive/bktCalculator.ts` -- BKT_RETEACH_THRESHOLD=0.40
- Codebase analysis: `src/services/mathEngine/skills.ts` -- 14 skills with IDs
- Codebase analysis: `src/store/helpers/skillStateHelpers.ts` -- getOrCreateSkillState defaults
- Codebase analysis: `babel.config.js` -- current (incorrect) plugin config
- Codebase analysis: `package.json` -- react-native-worklets@0.7.4 already installed
- Codebase analysis: `app.json` -- newArchEnabled: true
- [Reanimated 4 migration guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) -- babel plugin change
- [Reanimated getting started](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) -- plugin must be last
- [Reanimated compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/) -- RN 0.81 + Reanimated 4.1.x confirmed compatible

### Secondary (MEDIUM confidence)
- [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54) -- babel-preset-expo auto-configures worklets plugin
- [GitHub issue #8231](https://github.com/software-mansion/react-native-reanimated/issues/8231) -- warning message and fix documentation
- `.claude/skills/react-native-best-practices/references/js-animations-reanimated.md` -- Reanimated 4 migration checklist

### Tertiary (LOW confidence)
- None -- all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed, versions confirmed from package.json
- Architecture: HIGH -- follows existing codebase patterns exactly (migrations, pure-function services, static data tables)
- Pitfalls: HIGH -- identified from direct codebase analysis and official Reanimated docs
- Manipulative mapping content: MEDIUM -- based on Common Core pedagogy alignment and user decisions, but the exact primary/secondary ranking is somewhat subjective

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable -- all patterns are established in the codebase)
