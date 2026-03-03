# Phase 5: Adaptive Difficulty - Research

**Researched:** 2026-03-02
**Domain:** Elo rating system for adaptive problem selection in children's math education
**Confidence:** HIGH

## Summary

Phase 5 implements an Elo-based adaptive difficulty system that tracks per-skill ratings, selects problems targeting an 85% success rate, and includes a frustration guard. The core domain is well-understood: Elo rating math is straightforward (a few pure functions), the existing codebase already stores per-skill `eloRating` in `SkillState`, and templates already have `baseElo` anchors spanning 800-1250. The work is entirely service-layer logic with no UI, no external dependencies, and no store schema changes.

The Elo rating system in educational contexts treats each problem attempt as a "match" between the student (player) and the problem template (opponent). The student's rating goes up on correct answers and down on incorrect ones, while problem difficulty is fixed (templates have static `baseElo`). A variable K-factor based on attempt count gives fast initial adaptation while stabilizing over time. Problem selection uses weighted random sampling of templates whose `baseElo` is near the child's current Elo, biased toward slightly-easier problems to achieve the 85% target.

**Primary recommendation:** Build three pure-function modules (`eloCalculator.ts`, `problemSelector.ts`, `frustrationGuard.ts`) in `src/services/adaptive/` with a barrel export. No new dependencies needed. No store schema changes required -- the existing `SkillState.eloRating`, `SkillState.attempts`, and `SkillState.correct` fields plus the existing `updateSkillState()` action provide everything needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fast adaptation with K=32-40 range -- child notices difficulty change within 5-10 problems
- Variable K-factor by confidence: higher K early (provisional player, adapt fast), lower K as attempts accumulate (established level)
- Fixed 85% success target for v0.1 -- no variable targeting by mastery level
- Elo clamped to 600-1400 range (slightly beyond 800-1250 template range) to prevent extreme drift
- Frustration guard triggers after 3 consecutive wrong answers
- Drop 1 template level on trigger (e.g., 2-digit with carry -> 2-digit no carry) -- gentle step down
- Reset consecutive-wrong counter on any correct answer -- child earns way back naturally through Elo updates
- Guard tracks consecutive wrong per skill, not across all skills in session
- Guard affects problem selection only -- Elo still updates normally from all answers (accurate tracking)
- Real-time Elo updates within session -- each answer updates Elo immediately, next problem reflects current performance
- Mix skills within a session -- pulls from multiple skills for engaging variety
- Weakest skill priority for next-problem selection -- favor skills with lowest Elo relative to available templates, balanced by occasional strong-skill problems for confidence
- Prerequisite gating -- child must demonstrate competence (Elo > threshold) on prerequisite skills before harder ones unlock. Skills.ts already defines prerequisite chains.
- Weighted random template selection -- randomly pick from nearby templates, weighted by baseElo proximity to child's current Elo. Adds variety while staying in range.
- Comfort-zone philosophy -- pick templates where child is expected to succeed ~85-90%. Problems are slightly below peak ability to build confidence.
- New service at src/services/adaptive/ -- dedicated adaptive service with Elo calculator, problem selector, frustration guard. Barrel export for Phase 6.
- XP scales by difficulty -- harder problems (higher baseElo) earn more XP. Connects to Phase 8 gamification.

### Claude's Discretion
- Exact K-factor formula and how confidence scaling works (attempts threshold for provisional vs established)
- Prerequisite unlock threshold (what Elo level counts as "competent")
- Weakest-skill weighting algorithm (how much to favor weak vs strong skills)
- Weighted random distribution shape (linear, gaussian, etc.)
- XP scaling formula specifics
- File organization within src/services/adaptive/
- Test strategy and coverage

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADPT-01 | Each child has an Elo rating that updates after each problem attempt | Elo update formula implemented in `eloCalculator.ts`; existing `SkillState.eloRating` stores the value; `updateSkillState()` persists changes |
| ADPT-02 | Elo is tracked per skill (e.g., addition-no-carry, subtraction-with-borrow) not just globally | Already tracked per skill via `Record<string, SkillState>` in skillStatesSlice; adaptive service receives `skillId` per answer |
| ADPT-03 | Problem selection targets problems within the child's Elo range to converge on 85% success rate | `problemSelector.ts` uses weighted random sampling of templates by expected success probability, targeting 85% via Elo proximity offset |
| ADPT-04 | Frustration guard triggers an easier problem after 3 consecutive wrong answers | `frustrationGuard.ts` tracks consecutive wrong per skill; overrides template selection to drop 1 level on trigger |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9 | All adaptive logic as pure typed functions | Already in project; strict mode catches edge cases in math |
| Zustand 5 | 5.x | Store reads/writes for SkillState | Already in project; `updateSkillState()` action exists |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | - | No additional libraries needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled Elo | npm `elo-rating` or `elo-rank` | Elo is ~20 lines of math; adding a dependency for it is overkill and adds bundle weight |
| Weighted random | lodash `_.sample` with weights | Project doesn't use lodash; a 10-line weighted random function is simpler |

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Recommended Project Structure
```
src/services/adaptive/
├── types.ts              # EloUpdateResult, ProblemSelection, FrustrationState, etc.
├── eloCalculator.ts      # expectedScore(), calculateEloUpdate(), getKFactor()
├── problemSelector.ts    # selectNextProblem(), getEligibleTemplates(), weightByEloDifference()
├── frustrationGuard.ts   # FrustrationTracker, shouldTriggerGuard(), getEasierTemplate()
├── prerequisiteGating.ts # isSkillUnlocked(), getUnlockedSkills()
├── skillSelector.ts      # selectNextSkill(), weightByWeakness()
├── xpCalculator.ts       # calculateXpForDifficulty()
├── index.ts              # Barrel export
```

### Pattern 1: Pure Function Elo Calculator
**What:** All Elo math as stateless pure functions. Input: current ratings + answer result. Output: new rating.
**When to use:** Every problem answer event.
**Example:**
```typescript
// src/services/adaptive/eloCalculator.ts

/** Logistic expected score: probability student answers correctly */
export function expectedScore(studentElo: number, templateBaseElo: number): number {
  return 1 / (1 + Math.pow(10, (templateBaseElo - studentElo) / 400));
}

/**
 * Variable K-factor: higher for new students, lower as they accumulate attempts.
 * Based on uncertainty function U(n) = K_max / (1 + decay * n)
 * - First 30 attempts: K stays near K_MAX (40) for fast adaptation
 * - After 30 attempts: K decays toward K_MIN (16) for stability
 *
 * Inspired by FIDE's approach (K=40 for new, K=20 for established, K=10 for elite)
 * and Pelanek's uncertainty function U(n) = a/(1 + bn).
 */
export function getKFactor(attempts: number): number {
  const K_MAX = 40;
  const K_MIN = 16;
  const DECAY = 0.05; // At n=30: K ~= 40/(1+1.5) = 16... too fast. Use gentler decay.
  // Better: K = K_MIN + (K_MAX - K_MIN) / (1 + DECAY * attempts)
  // At n=0: K=40, n=20: K=28, n=60: K=22, n=200: K=18
  return K_MIN + (K_MAX - K_MIN) / (1 + DECAY * attempts);
}

export interface EloUpdateResult {
  newElo: number;
  eloDelta: number;
  expectedScore: number;
}

export function calculateEloUpdate(
  studentElo: number,
  templateBaseElo: number,
  correct: boolean,
  attempts: number,
): EloUpdateResult {
  const expected = expectedScore(studentElo, templateBaseElo);
  const actual = correct ? 1 : 0;
  const K = getKFactor(attempts);
  const delta = K * (actual - expected);
  const newElo = Math.round(
    Math.max(600, Math.min(1400, studentElo + delta))
  );
  return { newElo, eloDelta: newElo - studentElo, expectedScore: expected };
}
```

### Pattern 2: Weighted Random Template Selection for 85% Target
**What:** Select templates where expected success probability is near 85%, using weighted random for variety.
**When to use:** Every time a new problem is needed.
**Example:**
```typescript
// src/services/adaptive/problemSelector.ts

/**
 * Weight templates by how close their expected success rate is to the 85% target.
 * Templates where the child has ~85% chance of success get highest weight.
 * Uses a gaussian-like weighting: weight = exp(-((p - target)^2) / (2 * sigma^2))
 */
export function weightBySuccessProbability(
  studentElo: number,
  templates: ProblemTemplate[],
  targetSuccess: number = 0.85,
): WeightedTemplate[] {
  const SIGMA = 0.10; // Controls spread: how tolerant of deviation from target
  return templates.map(template => {
    const p = expectedScore(studentElo, template.baseElo);
    const deviation = p - targetSuccess;
    const weight = Math.exp(-(deviation * deviation) / (2 * SIGMA * SIGMA));
    return { template, weight, expectedSuccess: p };
  });
}

/** Pick from weighted templates using cumulative distribution */
export function weightedRandomSelect(
  weighted: WeightedTemplate[],
  rng: SeededRng,
): ProblemTemplate {
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.template;
  }
  return weighted[weighted.length - 1].template; // fallback
}
```

### Pattern 3: Frustration Guard as Stateless Tracker
**What:** Track consecutive wrong answers per skill, trigger easier problem selection.
**When to use:** After each wrong answer, check if guard should activate.
**Example:**
```typescript
// src/services/adaptive/frustrationGuard.ts

export interface FrustrationState {
  /** Map of skillId -> consecutive wrong count */
  consecutiveWrong: Record<string, number>;
}

export function createFrustrationState(): FrustrationState {
  return { consecutiveWrong: {} };
}

export function updateFrustrationState(
  state: FrustrationState,
  skillId: string,
  correct: boolean,
): FrustrationState {
  if (correct) {
    // Reset counter on correct answer
    const { [skillId]: _, ...rest } = state.consecutiveWrong;
    return { consecutiveWrong: rest };
  }
  return {
    consecutiveWrong: {
      ...state.consecutiveWrong,
      [skillId]: (state.consecutiveWrong[skillId] ?? 0) + 1,
    },
  };
}

const FRUSTRATION_THRESHOLD = 3;

export function shouldTriggerGuard(state: FrustrationState, skillId: string): boolean {
  return (state.consecutiveWrong[skillId] ?? 0) >= FRUSTRATION_THRESHOLD;
}
```

### Pattern 4: Prerequisite Gating via Skill Graph
**What:** Walk the prerequisite tree from skills.ts; only unlock skills where all prereqs meet Elo threshold.
**When to use:** When determining which skills are available for problem selection.
**Example:**
```typescript
// src/services/adaptive/prerequisiteGating.ts
import { SKILLS } from '../../services/mathEngine/skills';
import type { SkillState } from '../../store/slices/skillStatesSlice';

const UNLOCK_THRESHOLD = 950; // Elo at which a skill is considered "competent"

export function isSkillUnlocked(
  skillId: string,
  skillStates: Record<string, SkillState>,
  defaultElo: number = 1000,
): boolean {
  const skill = SKILLS.find(s => s.id === skillId);
  if (!skill) return false;
  if (skill.prerequisites.length === 0) return true; // Root skills always unlocked
  return skill.prerequisites.every(prereqId => {
    const state = skillStates[prereqId];
    return (state?.eloRating ?? defaultElo) >= UNLOCK_THRESHOLD;
  });
}

export function getUnlockedSkills(
  skillStates: Record<string, SkillState>,
  defaultElo: number = 1000,
): string[] {
  return SKILLS
    .filter(s => isSkillUnlocked(s.id, skillStates, defaultElo))
    .map(s => s.id);
}
```

### Anti-Patterns to Avoid
- **Coupling Elo update to store:** Keep `calculateEloUpdate()` as a pure function that returns the new rating. The *caller* (Phase 6 session flow) writes to the store via `updateSkillState()`. The adaptive service never imports the store directly.
- **Storing frustration state in Zustand:** Frustration tracking is session-scoped and ephemeral. It lives in local variables or React state, not in the persisted store. Persisting it would cause stale triggers across sessions.
- **Using the Elo formula's 400 constant for problem selection:** The 400 scaling constant is for expected score calculation only. Don't use raw Elo point differences for template weight -- always go through `expectedScore()` to get a probability, then weight on probability deviation from 0.85.
- **Updating template baseElo dynamically:** Template `baseElo` values are static calibration points (800-1250). Only student Elo changes. This is by design -- the system treats items as fixed difficulty anchors per Pelanek's recommendations for educational Elo.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Elo expected score | Custom probability formula | Standard logistic: `1/(1+10^((Rd-Rs)/400))` | The formula is canonical; deviating from it breaks the mathematical guarantees |
| Weighted random selection | Custom selection logic each time | A reusable `weightedRandomSelect(items, weights, rng)` utility | Cumulative distribution sampling is easy to get wrong (off-by-one, floating point) |
| Seeded RNG | New PRNG implementation | Existing `createRng()` from `seededRng.ts` | Already tested and used across the math engine |

**Key insight:** The Elo system's value comes from its mathematical simplicity. All the "intelligence" is in the expected score formula and K-factor tuning -- the rest is standard weighted random selection and state tracking. Don't add complexity.

## Common Pitfalls

### Pitfall 1: K-Factor Too High Causing Rating Oscillation
**What goes wrong:** With K=40 fixed, a child who knows the material but makes occasional mistakes sees their Elo swing wildly, causing erratic difficulty jumps.
**Why it happens:** High K means each answer moves the rating by up to 40 points. Three wrong answers in a row drops rating by ~100 points.
**How to avoid:** Use variable K-factor that decays with attempts. K=40 for first ~10 attempts, decaying to K=16 by ~100 attempts. Formula: `K = 16 + 24 / (1 + 0.05 * attempts)`.
**Warning signs:** Child gets easy problems after a single mistake despite high overall accuracy.

### Pitfall 2: Elo Stuck at Extremes
**What goes wrong:** A child gets stuck at Elo 600 or 1400 (the clamp boundaries) and the system can't recover because updates are clamped away.
**Why it happens:** If clamp range is too narrow or K too high, Elo can hit the boundary and then expected scores become extreme (>0.99 or <0.01), making updates very small.
**How to avoid:** Clamp range of 600-1400 is good (200 points beyond template range of 800-1250). Also ensure that even at boundary, there exist templates where expected success is near 85%.
**Warning signs:** `eloDelta` is consistently 0 or +/-1 after clamping.

### Pitfall 3: No Templates in Elo Range
**What goes wrong:** A child's Elo is 600 but the easiest template has baseElo 800, so expected success is >95% for everything. The system degrades to uniform random selection.
**Why it happens:** Template baseElo range (800-1250) doesn't extend to the full Elo clamp range (600-1400).
**How to avoid:** This is actually acceptable by design -- a child at Elo 600 *should* get easy problems. The weighted selection will still prefer the easiest templates (baseElo 800), which have the highest expected success. The 85% target becomes a soft ceiling rather than a hard constraint at extremes.
**Warning signs:** All templates have weight > 0.9 or all < 0.1 for the given Elo.

### Pitfall 4: Frustration Guard Infinite Loop
**What goes wrong:** Guard triggers, drops a level, but the easier template is still too hard. Child gets 3 more wrong, guard triggers again -- potentially bottoming out.
**Why it happens:** "Drop 1 template level" assumes the next-easier template is significantly easier.
**How to avoid:** When guard triggers, select from templates at least 1 step down in the skill's template ordering by baseElo. If already at the easiest template for that skill, stay there. The consecutive-wrong counter naturally resets on any correct answer, breaking the cycle.
**Warning signs:** Guard triggering more than twice in a row for the same skill.

### Pitfall 5: Weakest-Skill Selection Creates Monotony
**What goes wrong:** Child only ever practices their weakest skill, making the session boring and demotivating.
**Why it happens:** Pure "pick the weakest" selection has no variety.
**How to avoid:** Use weighted random for skill selection too: weakest skill gets highest weight but isn't guaranteed. A 70/30 split (70% chance weakest, 30% chance any skill) provides variety while still prioritizing growth areas.
**Warning signs:** Session answers show the same skillId for 5+ consecutive problems.

### Pitfall 6: Race Condition Between Elo Read and Write
**What goes wrong:** Two rapid answers could read the same Elo, compute updates independently, and the second write overwrites the first.
**Why it happens:** Zustand's `set()` is synchronous, but if the flow reads Elo, computes, then writes in a `useEffect` or async handler, stale reads can occur.
**How to avoid:** Phase 6's session flow should ensure sequential answer processing (one answer fully processed before the next). The adaptive service itself is stateless pure functions, so the ordering is the caller's responsibility.
**Warning signs:** Elo not reflecting the previous answer's result.

## Code Examples

Verified patterns based on the existing codebase structure:

### Elo Update Flow (Caller Pattern for Phase 6)
```typescript
// This is how Phase 6 session flow will call the adaptive service:
import { calculateEloUpdate } from '../services/adaptive';
import { getOrCreateSkillState } from '../store/helpers/skillStateHelpers';
import { useAppStore } from '../store/appStore';

function processAnswer(skillId: string, templateBaseElo: number, correct: boolean) {
  const { skillStates, updateSkillState } = useAppStore.getState();
  const current = getOrCreateSkillState(skillStates, skillId);

  const result = calculateEloUpdate(
    current.eloRating,
    templateBaseElo,
    correct,
    current.attempts,
  );

  updateSkillState(skillId, {
    eloRating: result.newElo,
    attempts: current.attempts + 1,
    correct: correct ? current.correct + 1 : current.correct,
    lastPracticed: new Date().toISOString(),
  });
}
```

### Problem Selection Flow
```typescript
import { getTemplatesBySkill } from '../services/mathEngine';
import { weightBySuccessProbability, weightedRandomSelect } from '../services/adaptive';
import { createRng } from '../services/mathEngine';

function selectProblemForSkill(
  skillId: string,
  studentElo: number,
  seed: number,
  frustrationActive: boolean,
): ProblemTemplate {
  let templates = getTemplatesBySkill(skillId);

  if (frustrationActive) {
    // Drop to easier templates: filter to those with baseElo < student's current Elo
    const easier = templates.filter(t => t.baseElo < studentElo);
    if (easier.length > 0) templates = easier;
  }

  const weighted = weightBySuccessProbability(studentElo, templates);
  const rng = createRng(seed);
  return weightedRandomSelect(weighted, rng);
}
```

### XP Scaling by Difficulty
```typescript
// src/services/adaptive/xpCalculator.ts

const BASE_XP = 10;
const ELO_REFERENCE = 1000; // Middle of range
const SCALE_FACTOR = 0.01;  // +1 XP per 100 Elo above reference

/** XP earned for a correct answer, scaled by template difficulty */
export function calculateXp(templateBaseElo: number): number {
  const bonus = Math.round((templateBaseElo - ELO_REFERENCE) * SCALE_FACTOR);
  return Math.max(BASE_XP, BASE_XP + bonus);
  // baseElo 800 -> 8 XP (clamped to 10), baseElo 1000 -> 10 XP, baseElo 1250 -> 13 XP
}
```

### Skill Selection with Weakness Priority
```typescript
// src/services/adaptive/skillSelector.ts

export interface SkillWeight {
  skillId: string;
  weight: number;
  elo: number;
}

/**
 * Weight unlocked skills inversely by Elo: weaker skills get higher weight.
 * Uses softmax-like approach: weight = maxElo - skillElo + baseline
 */
export function weightSkillsByWeakness(
  unlockedSkillIds: string[],
  skillStates: Record<string, SkillState>,
  defaultElo: number = 1000,
): SkillWeight[] {
  const BASELINE_WEIGHT = 50; // Ensures even strong skills get picked sometimes
  const elos = unlockedSkillIds.map(id => ({
    skillId: id,
    elo: skillStates[id]?.eloRating ?? defaultElo,
  }));
  const maxElo = Math.max(...elos.map(e => e.elo));

  return elos.map(({ skillId, elo }) => ({
    skillId,
    elo,
    weight: maxElo - elo + BASELINE_WEIGHT,
  }));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed K-factor (K=32) | Variable K based on uncertainty/attempts | Pelanek 2016+ | Better tracking of rapidly-learning children without oscillation for established learners |
| Global single Elo | Per-skill Elo ratings | Standard in educational Elo since ~2014 | A child good at addition can be appropriately challenged while subtraction stays easier |
| Target 50% success (chess-like) | Target 75-90% success (education) | Educational Elo adaptations ~2012+ | Children need higher success rates for motivation; 85% is the "sweet spot" from learning science |
| Fixed item difficulty | Calibrated static baseElo per template | Current practice | Template difficulty anchored to curriculum progression, not dynamically adjusted |

**Deprecated/outdated:**
- Fixed K-factor without uncertainty: Works but inferior to variable K for learning contexts where ability changes rapidly. The user-decided K=32-40 range with decay is aligned with current best practice.
- Global Elo only: Already ruled out by ADPT-02 requirement.

## Discretion Recommendations

### K-Factor Formula
**Recommendation:** `K = K_MIN + (K_MAX - K_MIN) / (1 + DECAY * attempts)` where K_MAX=40, K_MIN=16, DECAY=0.05.
**Rationale:** This produces K=40 at 0 attempts, K=28 at 20 attempts, K=22 at 60 attempts, K=18 at 200 attempts. The decay curve matches FIDE's tiered approach (40/20/10) but as a smooth continuous function. K_MIN=16 ensures ratings remain responsive enough to detect genuine skill changes. Pelanek's recommended uncertainty function U(n) = a/(1+bn) with a=1,b=0.05 maps directly to this formula shape.
**Confidence:** HIGH -- well-supported by educational Elo literature.

### Prerequisite Unlock Threshold
**Recommendation:** Elo >= 950 on all prerequisite skills.
**Rationale:** DEFAULT_ELO is 1000 (start value). A threshold of 950 means the child must have practiced the prerequisite without performing terribly (a few wrong answers won't lock them out, but consistent failure will). This is 150 points below the easiest templates (800), so even a slightly-struggling child can unlock next skills. The threshold should be configurable as a constant for easy tuning.
**Confidence:** MEDIUM -- reasonable heuristic, may need tuning after playtesting.

### Weakest-Skill Weighting
**Recommendation:** Inverse-Elo weighting with a baseline floor. Weight = (maxElo - skillElo) + BASELINE where BASELINE=50. This ensures even the strongest skill gets picked ~1/N of the time at minimum.
**Rationale:** Pure weakest-first creates boring sessions. The baseline ensures variety. With 3 unlocked skills at Elo 900, 1000, 1100: weights are 250, 150, 50 -- the weakest skill gets picked ~56% of the time, middle ~33%, strongest ~11%.
**Confidence:** MEDIUM -- weighting shape is reasonable but exact BASELINE may need tuning.

### Weighted Random Distribution Shape
**Recommendation:** Gaussian weighting on success probability deviation from 0.85 target, with sigma=0.10.
**Rationale:** Gaussian weighting naturally concentrates selection on templates near the target while allowing occasional easier or harder problems. Sigma=0.10 means templates with 75-95% expected success get reasonable weight, while templates at 50% or 99% get negligible weight. This is more principled than linear distance weighting.
**Confidence:** HIGH -- gaussian weighting on probability space is standard in item selection.

### XP Scaling Formula
**Recommendation:** `XP = max(BASE_XP, BASE_XP + round((baseElo - 1000) * 0.01))` with BASE_XP=10.
**Rationale:** Produces 10 XP at baseElo 1000 (middle), 8 XP at 800 (clamped to 10), 13 XP at 1250 (hardest). This is a simple linear scale. The clamp ensures even easy problems give minimum XP. The formula is exposed for Phase 8 gamification to consume.
**Confidence:** MEDIUM -- exact numbers depend on leveling curve from GAME-02 (`XP per level = 100 + level*20`).

### File Organization
**Recommendation:** Seven files as shown in Architecture Patterns above (types, eloCalculator, problemSelector, frustrationGuard, prerequisiteGating, skillSelector, xpCalculator, index). Each file stays well under 500 lines (estimated 40-80 lines each). The barrel export in `index.ts` re-exports all public functions and types.
**Confidence:** HIGH -- follows existing project patterns (see `src/services/mathEngine/` structure).

### Test Strategy
**Recommendation:** One test file per module in `src/__tests__/adaptive/`. Key test cases:
- **eloCalculator:** Correct answer increases Elo, wrong decreases; clamping at 600/1400; K-factor decreases with attempts; expectedScore returns 0.5 when ratings equal; expectedScore > 0.5 when student rated higher
- **problemSelector:** Templates near 85% target get highest weight; gaussian weights sum to positive; weighted random respects weights (statistical test with seed)
- **frustrationGuard:** Triggers after exactly 3 consecutive wrong; resets on correct; tracks per-skill independently
- **prerequisiteGating:** Root skills always unlocked; skills with unmet prereqs locked; skills with met prereqs unlocked
- **skillSelector:** Weakest skill gets highest weight; all skills get nonzero weight
- **xpCalculator:** Higher baseElo gives more XP; minimum XP floor respected
- **Integration:** Full flow -- select skill, select template, generate problem, record answer, update Elo, select next -- produces a reasonable difficulty trajectory
**Confidence:** HIGH -- follows existing test patterns in `src/__tests__/mathEngine/`.

## Open Questions

1. **Optimal sigma for gaussian weighting**
   - What we know: Sigma=0.10 on probability space concentrates on 75-95% success range
   - What's unclear: Whether this is too narrow or too wide for 14 templates spread across 800-1250 baseElo
   - Recommendation: Start with 0.10, write tests that verify the weight distribution, adjust if playtesting shows too little or too much variety

2. **Frustration guard "drop 1 level" mapping**
   - What we know: Templates within a skill are ordered by baseElo; "drop 1 level" means select from templates with lower baseElo
   - What's unclear: Most skills have only 1 template. "Drop 1 level" may need to cross skill boundaries (e.g., from `addition.two-digit.with-carry` to `addition.two-digit.no-carry`)
   - Recommendation: When frustration triggers, look at the prerequisite skill's templates as the "easier" option. If the skill has multiple templates, pick the one with lowest baseElo. Document this as a known edge case.

3. **How Phase 6 session flow will compose these functions**
   - What we know: Phase 5 provides pure functions; Phase 6 orchestrates them in a session loop
   - What's unclear: Exact API surface Phase 6 needs (single `getNextProblem()` vs individual functions)
   - Recommendation: Export both granular functions AND a high-level `selectNextProblem(skillStates, frustrationState, seed)` convenience function. Phase 6 can use the convenience function or compose granularly.

## Sources

### Primary (HIGH confidence)
- [GeeksforGeeks - Elo Rating Algorithm](https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/) - Verified Elo formulas and K-factor mechanics
- [Wikipedia - Elo Rating System](https://en.wikipedia.org/wiki/Elo_rating_system) - FIDE K-factor tiers (40/20/10), expected score formula, scaling constant 400
- Existing codebase: `src/store/slices/skillStatesSlice.ts`, `src/services/mathEngine/templates/`, `src/services/mathEngine/skills.ts` - Verified SkillState shape, template baseElo values, skill prerequisite chains

### Secondary (MEDIUM confidence)
- [Pelanek 2016 - Applications of the Elo Rating System in Adaptive Educational Systems](https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf) - Educational Elo guidelines, uncertainty function U(n) = a/(1+bn), recommendation for per-skill tracking
- [Springer 2025 - Balancing stability and flexibility: dynamic K value approach](https://link.springer.com/article/10.1007/s11257-025-09439-z) - Current research confirming variable K is superior to fixed K for learning environments
- [Bolsinova 2026 - Keeping Elo alive](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bmsp.12395) - Recent evaluation confirming Elo remains effective for learning systems with proper tuning

### Tertiary (LOW confidence)
- [PMC - Balanced difficulty task finder](https://pmc.ncbi.nlm.nih.gov/articles/PMC7501397/) - Flow state framework supporting 85% success target as optimal challenge level

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; pure TypeScript functions using existing store/engine
- Architecture: HIGH - Follows established project patterns (services/, pure functions, barrel exports); all modules under 100 lines
- Pitfalls: HIGH - Elo system is well-documented; pitfalls are well-known from chess and educational literature
- Discretion areas: MEDIUM - K-factor formula and gaussian weighting are well-grounded but exact tuning parameters (sigma, BASELINE, UNLOCK_THRESHOLD) may need adjustment after playtesting

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (stable domain, no fast-moving dependencies)
