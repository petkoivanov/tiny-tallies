# Phase 28: Session Mix Adaptation - Research

**Researched:** 2026-03-04
**Domain:** Session queue generation, practice mix algorithm, misconception-driven remediation injection
**Confidence:** HIGH

## Summary

Phase 28 modifies the existing practice mix generation pipeline to inject remediation problems for skills with confirmed misconceptions. The current system generates a 15-problem session queue: 3 warmup + 9 practice + 3 cooldown. The practice portion uses a 60/30/10 split (review/new/challenge) via `generatePracticeMix()` in `practiceMix.ts`. This phase adds a pre-step that reserves up to 3 remediation slots from the review allocation before the standard 60/30/10 fill.

The implementation is well-scoped. All building blocks exist: `getConfirmedMisconceptions()` returns confirmed misconception records with `skillId`, `selectFromPool()` handles weighted selection, `selectTemplateForSkill()` handles Elo-targeted template selection, and `constrainedShuffle()` handles ordering. The work involves (1) adding a `'remediation'` category to `PracticeProblemCategory`, (2) modifying `generatePracticeMix()` to accept misconception skill IDs and inject remediation slots before the standard fill, (3) adjusting `computeSlotCounts()` or its usage to reduce review slots by remediation count, and (4) threading misconception data from the store through `useSession` -> `generateSessionQueue` -> `generatePracticeMix`.

**Primary recommendation:** Add an optional `confirmedMisconceptionSkillIds` parameter to `generatePracticeMix()`, inject remediation items first (up to 3, one per unique skill), then reduce the review slot count accordingly before the standard fill. Add `'remediation'` to `PracticeProblemCategory`. In `constrainedShuffle`, treat `'remediation'` like `'review'` (eligible for first-slot warm-start).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Up to 3 remediation slots out of 9 practice slots (33% cap)
- Number of remediation slots = min(confirmed misconception count, 3)
- If fewer than 3 confirmed misconceptions, use fewer slots (1 per confirmed misconception skill)
- Remaining slots (6-8) follow normal 60/30/10 review/new/challenge split
- Replace review slots -- remediation IS targeted review of misconception skills
- Review slots replaced first since both serve the "reinforce weak areas" goal
- New and challenge slots preserved for forward progress
- Reduced review count = original review count minus remediation slots taken
- Standard Elo-targeted template selection (same as review problems)
- Remediation value comes from practicing the specific misconception skill, not from difficulty adjustment
- Uses existing `selectTemplateForSkill` with gaussian-targeted selection
- Warmup and cooldown are unchanged

### Claude's Discretion
- How to select which confirmed misconceptions get the remediation slots when more than 3 exist
- Whether remediation problems get a distinct `category` tag (e.g., 'remediation') or reuse 'review'
- Integration approach with existing `generatePracticeMix` function
- Constrained shuffle behavior for remediation problems

### Deferred Ideas (OUT OF SCOPE)
None

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTV-01 | Session mix prioritizes skills with confirmed misconceptions (remediation problems injected into practice) | Confirmed misconception data available via `getConfirmedMisconceptions()` selector. Practice mix pipeline (`generatePracticeMix`) is the injection point. Remediation replaces review slots (up to 3). Template selection reuses `selectTemplateForSkill`. |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.x | State management (misconception store access) | Already used for all app state |
| TypeScript | strict | Type-safe category extension | Already enforced project-wide |
| Jest + jest-expo | - | Unit testing practice mix changes | Existing test infrastructure |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SeededRng | internal | Deterministic random selection for remediation | Already used in all pool selection |
| selectTemplateForSkill | internal | Elo-targeted template selection for remediation problems | Reuse for remediation (same as review) |

No new dependencies required. This phase uses only existing internal modules.

## Architecture Patterns

### Recommended Project Structure
```
src/
  services/
    session/
      practiceMix.ts          # MODIFY: add remediation injection
      sessionOrchestrator.ts   # MODIFY: pass misconceptions to generatePracticeMix
      sessionTypes.ts          # MODIFY: add 'remediation' to PracticeProblemCategory
      index.ts                 # NO CHANGE (re-exports)
  store/
    slices/
      misconceptionSlice.ts   # NO CHANGE (selectors already exist)
  hooks/
    useSession.ts              # MODIFY: read misconceptions, pass to generateSessionQueue
  __tests__/
    session/
      practiceMix.test.ts      # MODIFY: add remediation injection tests
      sessionOrchestrator.test.ts  # MODIFY: add misconception-aware queue tests
```

### Pattern 1: Remediation Injection Before Standard Fill

**What:** Insert remediation items into the practice mix before the 60/30/10 fill runs, reducing the review slot count to compensate.

**When to use:** Always, when confirmed misconceptions exist.

**Rationale:** By injecting remediation first, the standard fill logic remains unchanged -- it just operates on a reduced review count. This minimizes changes to existing code.

**Example:**
```typescript
// In generatePracticeMix:
export function generatePracticeMix(
  skillStates: Record<string, SkillState>,
  childAge: number | null,
  rng: SeededRng,
  practiceCount: number = 9,
  now?: Date,
  confirmedMisconceptionSkillIds: readonly string[] = [],
): PracticeMixItem[] {
  const slots = computeSlotCounts(practiceCount);

  // Phase 28: Inject remediation slots first
  const remediationCount = Math.min(confirmedMisconceptionSkillIds.length, 3);
  const remediationItems = selectRemediationSkills(
    confirmedMisconceptionSkillIds,
    skillStates,
    rng,
    remediationCount,
  );

  // Reduce review count by remediation slots taken
  const adjustedReviewCount = Math.max(0, slots.review - remediationItems.length);

  // ... rest of standard fill with adjustedReviewCount instead of slots.review
}
```

### Pattern 2: Unique Skill ID Extraction from Misconceptions

**What:** Extract unique skill IDs from confirmed misconception records for remediation slot filling.

**When to use:** When multiple misconception records may reference the same skill.

**Rationale:** A child might have multiple confirmed misconceptions on the same skill (e.g., `add_no_carry::addition.two-digit` and `place_value::addition.two-digit`). We want one remediation slot per unique skill, not per misconception record.

**Example:**
```typescript
// In useSession or sessionOrchestrator:
const confirmed = getConfirmedMisconceptions(misconceptions);
const uniqueSkillIds = [...new Set(confirmed.map(r => r.skillId))];
```

### Pattern 3: Misconception Recency-Based Selection (>3 confirmed skills)

**What:** When more than 3 unique skills have confirmed misconceptions, select the 3 most recently confirmed.

**When to use:** When confirmed misconception count exceeds the 3-slot cap.

**Rationale:** Most recently confirmed misconceptions are the most urgent -- they represent the child's current struggle areas, not historical ones that may have been naturally corrected.

**Example:**
```typescript
function selectRemediationSkills(
  confirmedMisconceptionSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  rng: SeededRng,
  maxSlots: number,
): PracticeMixItem[] {
  // If within cap, use all; otherwise select by some priority
  const selected = confirmedMisconceptionSkillIds.slice(0, maxSlots);
  return selected.map(skillId => ({
    skillId,
    category: 'remediation' as PracticeProblemCategory,
  }));
}
```

### Pattern 4: Category Tag Decision -- Use 'remediation' (New Category)

**What:** Add `'remediation'` to `PracticeProblemCategory` type union rather than reusing `'review'`.

**Why:** A distinct category provides several advantages:
1. Analytics can track remediation problems separately from standard review
2. Future phases (INTV-02: AI tutor context) can differentiate remediation from review to tailor explanations
3. `constrainedShuffle` can treat remediation like review for ordering (eligible for first-slot warm-start)
4. No data ambiguity -- remediation is semantically different from spaced-repetition review

**Impact:** The `PracticeProblemCategory` type in `sessionTypes.ts` changes from `'review' | 'new' | 'challenge'` to `'review' | 'new' | 'challenge' | 'remediation'`. The `constrainedShuffle` function does not need changes -- it only checks for `'review'` (first slot) and `'challenge'` (adjacency constraint). Remediation items will naturally end up in shuffled positions which is fine since they are not challenges.

### Pattern 5: Threading Misconception Data

**What:** Pass confirmed misconception skill IDs through the call chain: `useSession` -> `generateSessionQueue` -> `generatePracticeMix`.

**Details:**
1. `useSession` reads `misconceptions` from store, calls `getConfirmedMisconceptions()`, extracts unique skill IDs
2. `generateSessionQueue` accepts an optional `confirmedMisconceptionSkillIds` parameter
3. `generatePracticeMix` accepts the same parameter and uses it for remediation injection

### Anti-Patterns to Avoid
- **Modifying `computeSlotCounts` directly:** Do not change the core 60/30/10 math. Instead, adjust the review count AFTER calling `computeSlotCounts`. This keeps the base algorithm clean and testable independently.
- **Building a separate remediation pool with BKT weighting:** Remediation skills are already determined (confirmed misconceptions). No weighting needed -- each confirmed misconception skill gets exactly one slot. Weighting only applies when >3 confirmed skills compete for 3 slots.
- **Putting remediation in warmup/cooldown:** The user decision explicitly states warmup and cooldown are unchanged. Remediation belongs in the practice segment only.
- **Making remediation a separate "phase":** Remediation problems are regular practice problems on specific skills. They use `selectTemplateForSkill` and appear in the practice queue like any other problem.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Template selection for remediation | Custom difficulty algorithm | `selectTemplateForSkill(skillId, eloRating, rng)` | User decision: standard Elo-targeted selection, remediation value comes from the skill choice not difficulty |
| Pool weighting for remediation skills | Custom weighting function | Direct selection from confirmed list | Remediation skills are pre-determined; no pool weighting needed |
| Constrained ordering with remediation | Modified shuffle algorithm | Existing `constrainedShuffle` | Remediation uses 'remediation' category which is implicitly handled (not 'challenge', so no adjacency constraint; not 'review' explicitly but can satisfy first-slot if present) |

## Common Pitfalls

### Pitfall 1: Remediation Count Exceeding Review Slots
**What goes wrong:** If `computeSlotCounts(9)` gives `review=5`, and 3 remediation slots are taken, only 2 review slots remain. But if the practiceCount were smaller (e.g., 3), the review count could be 1 or 2, and 3 remediation slots would exceed the review allocation.
**Why it happens:** `Math.max(0, slots.review - remediationCount)` could make review go to 0 while still having remediation slots to fill.
**How to avoid:** Cap remediation slots at `Math.min(confirmedMisconceptionSkillIds.length, 3, slots.review)`. For the default `practiceCount=9`, `slots.review=5`, so this cap is always 3 (fine). But guard against edge cases in tests.
**Warning signs:** Tests with non-default practiceCount values failing.

### Pitfall 2: Duplicate Skills Across Remediation and Review
**What goes wrong:** A remediation skill could also appear in the review pool (it is a review-due skill with a confirmed misconception). This could cause the same skill to appear in both remediation slots and remaining review slots.
**Why it happens:** The review pool includes all Leitner-due skills. A skill with a confirmed misconception may also be due for review.
**How to avoid:** Add remediation skill IDs to the `usedSkillIds` set before the standard review fill runs. The existing `selectFromPool` logic already prefers unused skills.
**Warning signs:** Same skill appearing 2+ times in a 9-problem practice mix.

### Pitfall 3: No Confirmed Misconceptions -- No-Op Path
**What goes wrong:** Function signature changes but the no-misconceptions path is not tested.
**Why it happens:** All tests focus on the new remediation path, forgetting to verify backward compatibility.
**How to avoid:** Ensure existing `generatePracticeMix` tests pass without changes (no misconceptions = empty array default). Add explicit test: "when no confirmed misconceptions, mix is unchanged."
**Warning signs:** Existing test failures after signature change.

### Pitfall 4: Remediation Skill Not in SkillStates
**What goes wrong:** A confirmed misconception's skillId might not have a corresponding entry in `skillStates` (if the skill was never formally practiced, only wrong-answered).
**Why it happens:** Bug Library records misconceptions on wrong answers, but `skillStates` is populated via `updateSkillState`. A skill might have been encountered only once (no formal SkillState update committed yet if session was quit).
**How to avoid:** Use `getOrCreateSkillState(skillStates, skillId)` which returns defaults for missing skills. The `selectTemplateForSkill` function only needs a skillId and eloRating, and `getOrCreateSkillState` provides a default 1000 Elo.
**Warning signs:** Undefined eloRating passed to selectTemplateForSkill.

### Pitfall 5: Constrained Shuffle First-Slot Requirement
**What goes wrong:** `constrainedShuffle` requires the first item to be a `'review'` category for warm-start. If all review slots were replaced by remediation, there are no `'review'` items, and the first-slot constraint fails silently (leaves first item as-is).
**Why it happens:** With 3 remediation slots reducing review from 5 to 2, there are still 2 review items. But with unusual configs, review could reach 0.
**How to avoid:** Update `constrainedShuffle`'s first-slot logic to also accept `'remediation'` as a valid warm-start category. Both are review-type activities.
**Warning signs:** First practice problem being a 'new' or 'challenge' category when remediation is present.

## Code Examples

### Example 1: Updated PracticeProblemCategory Type
```typescript
// sessionTypes.ts
export type PracticeProblemCategory = 'review' | 'new' | 'challenge' | 'remediation';
```

### Example 2: Remediation Injection in generatePracticeMix
```typescript
// practiceMix.ts - Updated generatePracticeMix signature and injection logic

/** Maximum remediation slots per session */
const MAX_REMEDIATION_SLOTS = 3;

export function generatePracticeMix(
  skillStates: Record<string, SkillState>,
  childAge: number | null,
  rng: SeededRng,
  practiceCount: number = 9,
  now?: Date,
  confirmedMisconceptionSkillIds: readonly string[] = [],
): PracticeMixItem[] {
  const slots = computeSlotCounts(practiceCount);
  const reviewPool = buildReviewPool(skillStates, now);
  const newPool = buildNewSkillPool(skillStates);
  const challengePool = buildChallengePool(skillStates);

  const usedSkillIds = new Set<string>();
  const result: PracticeMixItem[] = [];

  // Step 0: Inject remediation slots (replaces review slots)
  const remediationCount = Math.min(
    confirmedMisconceptionSkillIds.length,
    MAX_REMEDIATION_SLOTS,
    slots.review, // never exceed available review slots
  );

  for (let i = 0; i < remediationCount; i++) {
    const skillId = confirmedMisconceptionSkillIds[i];
    result.push({ skillId, category: 'remediation' });
    usedSkillIds.add(skillId);
  }

  // Adjust review count: original minus remediation slots taken
  const adjustedReviewCount = slots.review - remediationCount;

  // Fill review slots (reduced count)
  let unfilledReview = 0;
  for (let i = 0; i < adjustedReviewCount; i++) {
    if (!selectAndTrack(reviewPool, 'review')) {
      unfilledReview++;
    }
  }

  // ... rest unchanged (new slots, challenge slots, fallback cascade)
}
```

### Example 3: Misconception Priority Selection (>3 confirmed skills)
```typescript
// practiceMix.ts - Helper to select which misconception skills get slots

/**
 * Selects which confirmed misconception skills get remediation slots.
 * When more than MAX_REMEDIATION_SLOTS skills have confirmed misconceptions,
 * prioritizes by lowest BKT mastery (weakest skills first).
 */
function selectRemediationSkillIds(
  confirmedSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  rng: SeededRng,
  maxSlots: number,
): string[] {
  if (confirmedSkillIds.length <= maxSlots) {
    return [...confirmedSkillIds];
  }

  // Build pool items with masteryPL for BKT-inverse weighting
  const pool: Array<{ skillId: string; masteryPL: number }> = confirmedSkillIds.map(
    (skillId) => ({
      skillId,
      masteryPL: getOrCreateSkillState(skillStates, skillId).masteryProbability,
    }),
  );

  const selected: string[] = [];
  const used = new Set<string>();

  for (let i = 0; i < maxSlots; i++) {
    const pick = selectFromPool(pool, rng, used);
    if (pick) {
      selected.push(pick.skillId);
      used.add(pick.skillId);
    }
  }

  return selected;
}
```

### Example 4: Threading Misconceptions Through useSession
```typescript
// useSession.ts - Reading misconceptions and passing to session generation
import { getConfirmedMisconceptions } from '../store/slices/misconceptionSlice';

// Inside initializeSession or useSession:
const misconceptions = useAppStore((s) => s.misconceptions);
const confirmed = getConfirmedMisconceptions(misconceptions);
const uniqueSkillIds = [...new Set(confirmed.map(r => r.skillId))];

// Pass to generateSessionQueue:
const queue = generateSessionQueue(
  skillStates,
  DEFAULT_SESSION_CONFIG,
  seed,
  childAge,
  uniqueSkillIds, // new parameter
);
```

### Example 5: Updated generateSessionQueue Signature
```typescript
// sessionOrchestrator.ts
export function generateSessionQueue(
  skillStates: Record<string, SkillState>,
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
  seed: number = Date.now(),
  childAge: number | null = null,
  confirmedMisconceptionSkillIds: readonly string[] = [],
): SessionProblem[] {
  // ...
  const practiceMix = generatePracticeMix(
    skillStates,
    childAge,
    rng,
    practiceCount,
    undefined, // now
    confirmedMisconceptionSkillIds,
  );
  // ...
}
```

### Example 6: Updated constrainedShuffle First-Slot Logic
```typescript
// practiceMix.ts - Update first-slot warm-start to include remediation
export function constrainedShuffle(
  items: ReadonlyArray<PracticeMixItem>,
  rng: SeededRng,
): PracticeMixItem[] {
  if (items.length <= 1) return [...items];
  const arr = [...items];

  // Step 1: Ensure a review OR remediation item is first (warm start)
  const warmStartIdx = arr.findIndex(
    (item) => item.category === 'review' || item.category === 'remediation',
  );
  if (warmStartIdx > 0) {
    [arr[0], arr[warmStartIdx]] = [arr[warmStartIdx], arr[0]];
  }

  // Steps 2-3 unchanged
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed 60/30/10 mix | Remediation-aware mix with up to 33% remediation override | Phase 28 | Practice sessions become misconception-responsive |
| `PracticeProblemCategory` = 3 values | 4 values (+ 'remediation') | Phase 28 | Enables analytics and downstream categorization |
| `generatePracticeMix` takes 5 params | 6 params (+ confirmed misconception skill IDs) | Phase 28 | Backward-compatible via default empty array |

## Open Questions

1. **Misconception Recency vs. BKT Weakness for >3 Selection**
   - What we know: User left selection strategy as Claude's discretion. Two viable approaches: (a) most recently confirmed misconceptions, (b) lowest BKT mastery among confirmed misconception skills.
   - What's unclear: Which is pedagogically better.
   - Recommendation: Use BKT-inverse weighting (weakest misconception skills first) via existing `selectFromPool`. This is consistent with the existing review pool prioritization and is more adaptive than recency. It naturally surfaces the skills the child is struggling with most.

2. **Remediation Problem Appearing in Session Orchestrator Template Selection**
   - What we know: `generateSessionQueue` uses `mixItem.category` to decide template selection strategy ('challenge' gets above-Elo templates, everything else gets standard gaussian).
   - What's unclear: Whether 'remediation' needs its own branch or falls into the standard path.
   - Recommendation: Treat 'remediation' identically to 'review' in template selection (standard gaussian-targeted). This matches the user decision: "standard Elo-targeted template selection." The `else` branch in `generateSessionQueue` already handles this -- any category that is not 'challenge' gets `selectTemplateForSkill`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npm test -- --testPathPattern=practiceMix` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTV-01a | Remediation items injected into practice mix for confirmed misconception skills | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests in existing file |
| INTV-01b | Remediation replaces review slots (not new/challenge) | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests in existing file |
| INTV-01c | Up to 3 remediation slots, capped at confirmed misconception count | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests in existing file |
| INTV-01d | Remaining slots follow standard 60/30/10 split | unit | `npm test -- --testPathPattern=practiceMix` | Needs new tests in existing file |
| INTV-01e | No confirmed misconceptions = standard mix (backward compat) | unit | `npm test -- --testPathPattern=practiceMix` | Existing tests cover this path (default empty array) |
| INTV-01f | Session queue threads misconceptions correctly | unit | `npm test -- --testPathPattern=sessionOrchestrator` | Needs new tests in existing file |
| INTV-01g | constrainedShuffle warm-start accepts remediation | unit | `npm test -- --testPathPattern=practiceMix` | Needs new test in existing file |
| INTV-01h | >3 confirmed misconceptions: only 3 selected | unit | `npm test -- --testPathPattern=practiceMix` | Needs new test |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=practiceMix`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. New tests are added to existing test files (`practiceMix.test.ts`, `sessionOrchestrator.test.ts`), not new files. No new test framework configuration needed.

## Sources

### Primary (HIGH confidence)
- `src/services/session/practiceMix.ts` - Complete practice mix implementation reviewed
- `src/services/session/sessionOrchestrator.ts` - Session queue generation reviewed
- `src/services/session/sessionTypes.ts` - Type definitions reviewed
- `src/store/slices/misconceptionSlice.ts` - Misconception store and selectors reviewed
- `src/hooks/useSession.ts` - Session lifecycle hook reviewed
- `src/__tests__/session/practiceMix.test.ts` - Existing test patterns reviewed
- `src/__tests__/session/sessionOrchestrator.test.ts` - Existing test patterns reviewed
- `src/__tests__/store/misconceptionSlice.test.ts` - Misconception test patterns reviewed
- `.planning/phases/28-session-mix-adaptation/28-CONTEXT.md` - User decisions reviewed

### Secondary (MEDIUM confidence)
None needed -- all information sourced from codebase.

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all internal modules fully reviewed
- Architecture: HIGH - Clear injection point, existing patterns well understood, backward-compatible approach
- Pitfalls: HIGH - All edge cases identified from code review (duplicate skills, missing skill states, slot overflow)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable internal architecture, 30-day validity)
