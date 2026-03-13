# Phase 89: Exponential Functions Domain - Research

**Researched:** 2026-03-13
**Domain:** Math engine domain handler -- exponential_functions (evaluate exponential expressions, growth/decay factor identification, half-life/doubling-time)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EXP-01 | `exponential_functions` domain handler -- evaluate exponential expressions, growth/decay factor identification, half-life/doubling-time (G9-11, 5 skills) | Full domain handler pattern established across 9 prior HS domains; all 7+ wiring touchpoints identified; existing `exponents` K-8 domain provides base/exponent evaluation generators to reference |
| EXP-02 | Exponential templates with numeric answers (integer exponents, simple base values) | NumericAnswer with integer-only constraint; construction-from-answer ensures integer results by picking integer bases and exponents; growth/decay factor MC uses numericAnswer with label for display |
| EXP-03 | Word problem variants for exponential functions (population, bacteria, investment contexts) | Prefix-mode word problem pattern established across all 7 prior HS domains; 3 templates at minGrade 9-10 |
| EXP-04 | AI tutor prompt guidance for exponential functions | AI tutor uses MathDomain string in prompt; no domain-specific code required -- only manual QA sign-off on Socratic hints about base/growth-factor reasoning |
</phase_requirements>

---

## Summary

Phase 89 introduces the `exponential_functions` math domain, following the identical code pattern established by all prior HS domain phases (82-88). The implementation is purely additive: no existing files are modified except to register the new domain in the standard wiring locations (types, registry, skills/index, templates/index, bugLibrary/distractorGenerator, bugLibrary/index, wordProblems/templates, SkillDomainSummary, videoMap).

The five skills are: evaluate exponential expression (compute b^n), growth factor identification (MC: is the base > 1 or < 1?), decay factor identification (similar but focused on 0 < b < 1), doubling-time problems, and exp_word_problem. All answers are integers -- construction-from-answer ensures this by using integer bases and integer exponents exclusively. Growth/decay factor identification uses MC with numericAnswer + label to present decimal base values as choices.

The key distinction from the existing K-8 `exponents` domain is the conceptual layer: `exponents` is purely computational ("What is 3^4?"), while `exponential_functions` tests understanding of exponential growth/decay models (A = A0 * b^t), factor identification (b > 1 = growth, 0 < b < 1 = decay), and applied contexts (half-life, doubling-time). The success criteria explicitly requires growth vs. decay factor identification as MC with base values above and below 1 as distractors. This means at least one skill generates MC problems where the answer is "which value is the growth/decay factor" rather than a pure numeric computation.

**Primary recommendation:** Mirror the polynomialsHandler file structure exactly. Three plans: Wave 0 test stubs + wiring updates, core domain implementation (5 generators + handler + skills + templates + bugs), word problem templates + AI tutor QA.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | -- | All exponential math is pure arithmetic (Math.pow with integers) | No external library needed; engine uses SeededRng for reproducible generation |

### Supporting
| File | Purpose | When to Use |
|------|---------|-------------|
| `src/services/mathEngine/seededRng.ts` | Reproducible random number generation | All generators receive `rng: SeededRng` -- never call `Math.random()` directly |
| `src/services/mathEngine/types.ts` | `numericAnswer`, `DomainProblemData`, `ProblemTemplate`, `SkillDefinition` | All domain handlers use these exact types |
| `src/services/mathEngine/bugLibrary/types.ts` | `BugPattern` interface | Each new bug pattern implements this interface |
| `src/services/mathEngine/domains/exponents/generators.ts` | Existing K-8 exponent evaluation generators | Reference for SUPERSCRIPTS map and base/exponent range patterns |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended File Structure

```
src/services/mathEngine/
  types.ts                                    MODIFY: add 'exponential_functions' to MathDomain union
  domains/
    registry.ts                               MODIFY: import + register exponentialFunctionsHandler
    index.ts                                  MODIFY: re-export exponentialFunctionsHandler
    exponentialFunctions/                      CREATE new directory
      generators.ts                           CREATE: 5 generator functions
      exponentialFunctionsHandler.ts           CREATE: dispatch switch by domainConfig.type
      index.ts                                CREATE: barrel export
  skills/
    exponentialFunctions.ts                    CREATE: EXPONENTIAL_FUNCTIONS_SKILLS array (5 skills)
    index.ts                                  MODIFY: import + spread EXPONENTIAL_FUNCTIONS_SKILLS
  templates/
    exponentialFunctions.ts                    CREATE: EXPONENTIAL_FUNCTIONS_TEMPLATES array (5 templates)
    index.ts                                  MODIFY: import + spread EXPONENTIAL_FUNCTIONS_TEMPLATES
  bugLibrary/
    exponentialFunctionsBugs.ts               CREATE: EXPONENTIAL_FUNCTIONS_BUGS array (3 bug patterns)
    distractorGenerator.ts                    MODIFY: add exponential_functions to BUGS_BY_OPERATION
    index.ts                                  MODIFY: export EXPONENTIAL_FUNCTIONS_BUGS
  wordProblems/
    templates.ts                              MODIFY: add 3 prefix-mode word problem templates
src/components/reports/
  SkillDomainSummary.tsx                      MODIFY: add exponential_functions to DOMAIN_LABELS + DOMAIN_ORDER
src/services/video/
  videoMap.ts                                 MODIFY: uncomment exponential_functions entry
```

### Pattern 1: Construction-from-Answer (MANDATORY for all generators)

**What:** Pick the correct answer first, then derive all problem values from it. Never solve forward to get the answer.
**When to use:** Every single generator function in this domain.
**Example:**
```typescript
// Evaluate b^n -- construction-from-answer
export function generateEvaluateExpression(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const base = rng.intRange(2, 6);
  const exp = rng.intRange(2, 4);
  const answer = Math.pow(base, exp);

  // Bug distractors:
  const wrongMultiply = base * exp;       // confused exponentiation with multiplication
  const wrongBaseTimesBase = base * base; // always squared regardless of exponent

  const sup = SUPERSCRIPTS[exp] ?? `^${exp}`;

  return {
    operands: [wrongMultiply, wrongBaseTimesBase, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `Evaluate ${base}${sup}.`,
    metadata: {},
  };
}
```

### Pattern 2: Growth/Decay Factor Identification (MC with label)

**What:** Present 4 numeric options representing possible growth/decay factors. The student identifies which value is the factor given context. Uses numericAnswer for the correct factor value.
**When to use:** growth_factor_id and decay_factor_id skills.
**Critical note from success criteria:** "Growth vs. decay factor identification problems generate correctly as MC with base values above and below 1 as distractors."
**Example:**
```typescript
// Growth factor identification -- MC problem
export function generateGrowthFactorId(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick an integer growth rate percentage: 10%, 20%, ..., 50%
  const pct = rng.intRange(1, 5) * 10;
  const factor = 100 + pct; // e.g., 120 for 20% growth (store as integer * 100)
  // Answer is the percentage itself for integer constraint
  const answer = pct;

  // Bug distractors:
  const wrongDecay = 100 - pct; // confused growth with decay
  const wrongBase = 100;        // thought no change

  return {
    operands: [wrongDecay, wrongBase, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `A population grows by ${pct}% each year. What is the percent growth rate?`,
    metadata: {},
  };
}
```

**Alternative approach (recommended):** Since success criteria says "all answers are integers (integer base and exponent inputs only)", the growth/decay factor skill should be framed so the answer is an integer. For example: "A quantity doubles every 3 years. After 6 years, how many times its original size is it?" Answer: 4 (= 2^2). Or: "A bacteria colony triples every hour. After 4 hours, how many times its original size?" Answer: 81 (= 3^4). This keeps answers as integers from Math.pow while testing growth/decay understanding.

### Pattern 3: Domain Handler Dispatch Switch

**What:** Handler reads `template.domainConfig.type` and dispatches to the matching generator.
**When to use:** `exponentialFunctionsHandler.ts` -- identical to polynomialsHandler structure.

### Pattern 4: Prefix-Mode Word Problems

**What:** A scene-setting sentence is prepended to the original question text. The `mode: 'prefix'` field controls this.
**When to use:** All 3 exponential_functions word problem prefix templates.

### Pattern 5: Skill ID Convention -- Domain-Prefixed Word Problem

**What:** Use `exp_word_problem` as the word problem skill ID, not bare `word_problem`.
**Source:** Established pattern from `coord_word_problem`, `seq_word_problem`, `sys_word_problem`, `quad_word_problem`, `poly_word_problem`.

### Anti-Patterns to Avoid

- **Floating-point answers:** The success criteria is explicit: "all answers are integers (integer base and exponent inputs only)". Never generate a problem whose answer requires decimal representation. Growth/decay factor problems must be reframed to produce integer answers (e.g., "how many times larger" rather than "what is the factor 1.2").
- **Overlapping with K-8 exponents domain:** The existing `exponents` domain already handles "What is 3^2?" and "What is 10^4?". The `exponential_functions` domain should focus on applied exponential thinking (growth/decay, half-life, doubling-time), not duplicate basic evaluation. However, one "evaluate" skill at grade 9 level with higher difficulty (larger bases/exponents) is appropriate as an entry skill.
- **Namespace collision in skill IDs:** Use bare names (e.g., `evaluate_expression`, `growth_decay`, `half_life`, `doubling_time`, `exp_word_problem`) but ensure none collide with existing skill IDs across all domains.
- **Large answer overflow:** Base 6, exponent 4 = 1296. Base 7, exponent 4 = 2401. Cap at base 6, exponent 4 or base 10, exponent 3 to keep answers under 2000.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Random number generation | `Math.random()` | `rng.intRange(min, max)` | Seeded RNG ensures reproducible tests across seeds 1-20 |
| Distractor generation infrastructure | Custom distractor logic | `generateDistractors()` + `BUGS_BY_OPERATION` entry | The existing pipeline handles bug library lookup, adjacent +/-1, and random fill |
| Word problem interpolation | Custom template engine | Add entries to `wordProblems/templates.ts` | The `generateWordProblem()` function handles `{name}`, `{a}`, `{b}` interpolation automatically |
| Superscript characters | Custom mapping | Copy `SUPERSCRIPTS` map from `exponents/generators.ts` | Reuse proven Unicode superscript mapping |

**Key insight:** The entire domain is 5 files (generators.ts, handler.ts, index.ts, skills.ts, templates.ts) plus 2 additional files (bugs.ts, word problem entries) and ~9 one-liner modifications to existing registry/index/wiring files. There is no novel infrastructure to build.

---

## Common Pitfalls

### Pitfall 1: Integer Answer Constraint for Growth/Decay Problems
**What goes wrong:** Growth/decay factor problems naturally produce decimal answers (e.g., factor = 1.2 for 20% growth). The success criteria explicitly requires integer answers only.
**Why it happens:** The mathematical definition of exponential growth A = A0 * b^t has b as a decimal (1.2, 0.5, etc.).
**How to avoid:** Reframe problems to ask for the result of the exponential computation, not the factor itself. "A population doubles every year. After 3 years, how many times larger is it?" Answer: 8 (= 2^3). This tests the same growth/decay concept while producing integer answers. Alternatively, ask for the percentage (20%) rather than the factor (1.2).
**Warning signs:** `Number.isInteger(answerNumericValue(result.correctAnswer))` fails for any seed.

### Pitfall 2: Skill ID Collision
**What goes wrong:** Using `evaluate` as a skill ID would collide with the existing `exponents` domain's `evaluate` skill (exponents/generators.ts has `generateEvaluate`).
**Why it happens:** Both domains deal with base^exponent evaluation.
**How to avoid:** Use `evaluate_expression` or `exp_evaluate` as the skill ID for the exponential_functions evaluate skill. Check all existing skill IDs before committing.
**Warning signs:** `computeNodePositions` Map key collision; skill map renders incorrectly.

### Pitfall 3: SKILLS.length and ALL_OPERATIONS Hardcode Updates
**What goes wrong:** `prerequisiteGating.test.ts` asserts `SKILLS.length === 192` and `domainHandlerRegistry.test.ts` asserts 25 operations. Adding `exponential_functions` will break these unless they are updated in Wave 0.
**Why it happens:** The count tests are hard-coded.
**How to avoid:** Wave 0 test stubs MUST update: (a) SKILLS.length to 197 (192 + 5), (b) ALL_OPERATIONS array to include `exponential_functions` (26 entries), (c) handler count assertion to "26 operations".
**Warning signs:** `npm test -- --testPathPattern=prerequisiteGating` fails with "expected 192, received 197".

### Pitfall 4: Large Exponential Values Overflow Display
**What goes wrong:** `base=5, exp=5 = 3125` or `base=10, exp=4 = 10000` creates unwieldy MC options.
**Why it happens:** Exponential growth is fast; uncapped ranges overflow readability.
**How to avoid:** Cap generator ranges: base in [2, 6], exponent in [2, 4]. Max answer: 6^4 = 1296 (under 2000). For half-life/doubling-time: initial_value in [100, 1000], time_periods in [1, 4], factor in [2, 3].
**Warning signs:** Test across seeds 1-20 and check `answerNumericValue(result.correctAnswer) < 2000`.

### Pitfall 5: SkillDomainSummary Record Exhaustiveness
**What goes wrong:** `SkillDomainSummary.tsx` has `DOMAIN_LABELS: Record<MathDomain, string>` and `DOMAIN_ORDER: MathDomain[]`. Adding `exponential_functions` to the MathDomain union in types.ts without updating these causes a TypeScript compile error.
**Why it happens:** `Record<MathDomain, string>` requires an entry for every union member.
**How to avoid:** Add `exponential_functions: 'Exponential Functions'` to DOMAIN_LABELS and add `'exponential_functions'` to DOMAIN_ORDER in the same plan that modifies types.ts.
**Warning signs:** `npm run typecheck` fails with "Property 'exponential_functions' is missing".

### Pitfall 6: Existing `exponents` Domain is NOT Being Modified
**What goes wrong:** Confusion between K-8 `exponents` domain and new `exponential_functions` domain leads to accidentally modifying exponents files.
**Why it happens:** Similar names, overlapping mathematical concepts.
**How to avoid:** `exponential_functions` is a NEW, separate domain directory (`domains/exponentialFunctions/`). The existing `domains/exponents/` is untouched. Reference its code for the SUPERSCRIPTS map pattern only.

---

## 5 Skills Design

Based on requirements analysis:

| # | Skill ID | Name | Grade | Description | Answer Type |
|---|----------|------|-------|-------------|-------------|
| 1 | exp_evaluate | Evaluate Exponential Expression | 9 | Compute b^n for integer b and n | numeric (integer) |
| 2 | growth_factor | Growth Factor Problems | 10 | "Doubles/triples every T periods; after N periods how many times larger?" | numeric (integer) |
| 3 | decay_factor | Decay Factor / Half-Life | 10 | "Halves every T periods; what fraction remains after N periods?" Framed as "original was X, now is ?" | numeric (integer) |
| 4 | doubling_time | Doubling-Time Scenarios | 11 | "Starts at A, doubles every T years. Value after N years?" Answer = A * 2^(N/T), constrained to integer | numeric (integer) |
| 5 | exp_word_problem | Exponential Word Problems | 10 | Prefix-mode word problems reusing growth_factor or exp_evaluate generators | numeric (integer) |

### Integer Answer Strategy per Skill

- **exp_evaluate:** Straightforward: Math.pow(base, exp) with integer inputs is always integer.
- **growth_factor:** "A bacteria colony triples every hour. After 3 hours, how many bacteria if it started with 5?" Answer: 5 * 3^3 = 135. Always integer.
- **decay_factor:** "A sample starts at 1024. It halves every year. After 4 years, how much remains?" Answer: 1024 / 2^4 = 64. Pick initial values that are powers of 2 to ensure integer division. Initial = rng.choice([64, 128, 256, 512, 1024]), periods in [1,4].
- **doubling_time:** "Investment starts at 50, doubles every 3 years. After 9 years, what is it worth?" Answer: 50 * 2^3 = 400. Pick time so N/T is integer.

---

## Code Examples

### Exponential Evaluate Generator
```typescript
// Source: mirrors exponents/generators.ts but at grade 9 level with higher ranges
const SUPERSCRIPTS: Record<number, string> = {
  2: '\u00B2', 3: '\u00B3', 4: '\u2074', 5: '\u2075',
};

export function generateExpEvaluate(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const base = rng.intRange(2, 6);
  const exp = rng.intRange(2, 4);
  const answer = Math.pow(base, exp);

  const wrongMultiply = base * exp;
  const wrongPlusOne = Math.pow(base, exp + 1);
  const sup = SUPERSCRIPTS[exp] ?? `^${exp}`;

  return {
    operands: [wrongMultiply, wrongPlusOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `Evaluate ${base}${sup}.`,
    metadata: {},
  };
}
```

### Growth Factor Generator
```typescript
export function generateGrowthFactor(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const initial = rng.intRange(2, 10);
  const factor = rng.intRange(2, 4);  // doubles, triples, quadruples
  const periods = rng.intRange(2, 4);
  const answer = initial * Math.pow(factor, periods);

  const wrongAdd = initial + factor * periods;      // linear thinking
  const wrongOneLess = initial * Math.pow(factor, periods - 1); // off-by-one

  const factorWord = factor === 2 ? 'doubles' : factor === 3 ? 'triples' : 'quadruples';

  return {
    operands: [wrongAdd, wrongOneLess, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `A colony starts with ${initial} bacteria and ${factorWord} every hour. How many after ${periods} hours?`,
    metadata: {},
  };
}
```

### Decay / Half-Life Generator
```typescript
export function generateDecayFactor(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick initial as power of 2 to guarantee integer after halving
  const powers = [64, 128, 256, 512, 1024];
  const initial = powers[rng.intRange(0, powers.length - 1)];
  const periods = rng.intRange(1, 4);
  const answer = initial / Math.pow(2, periods);

  const wrongDouble = initial * Math.pow(2, periods); // confused decay with growth
  const wrongOneLess = initial / Math.pow(2, periods - 1); // off-by-one

  return {
    operands: [wrongDouble, wrongOneLess, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `A substance starts at ${initial}g and loses half its mass every year. How many grams remain after ${periods} years?`,
    metadata: {},
  };
}
```

### Bug Pattern File
```typescript
import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const EXPONENTIAL_FUNCTIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'exp_linear_thinking',
    operations: ['exponential_functions' as MathDomain],
    description: 'Student used multiplication instead of exponentiation -- computed base * exponent instead of base^exponent.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      return a; // operands[0] = wrongMultiply/wrongAdd pre-stored by generator
    },
  },
  {
    id: 'exp_off_by_one_period',
    operations: ['exponential_functions' as MathDomain],
    description: 'Student computed one fewer period -- used (n-1) instead of n in the exponent.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      return b; // operands[1] = wrongOneLess pre-stored by generator
    },
  },
  {
    id: 'exp_growth_decay_swap',
    operations: ['exponential_functions' as MathDomain],
    description: 'Student confused growth with decay -- multiplied when should have divided, or vice versa.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      return a; // operands[0] = wrongDouble pre-stored by decay generator
    },
  },
] as const;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| K-8 exponents (evaluate b^n) | HS exponential_functions (growth/decay models) | Phase 89 | New domain, not replacement of existing exponents |
| Bare `word_problem` skill ID | Domain-prefixed `exp_word_problem` | Phase 83+ | Avoids Map key collision |
| videoMap.ts comment placeholders | Active MathDomain entries | Phase 82+ | `exponential_functions: '6WMZ7J0wwMI'` must be uncommented |

**Deprecated/outdated:**
- videoMap.ts comment `// exponential_functions: '6WMZ7J0wwMI' (Phase 89)`: Must be activated as a live entry when MathDomain gains `exponential_functions`.

---

## Wiring Touchpoints (Complete Checklist)

Every new HS domain must be wired in these locations:

| # | File | Change |
|---|------|--------|
| 1 | `src/services/mathEngine/types.ts` | Add `'exponential_functions'` to `MathDomain` union |
| 2 | `src/services/mathEngine/domains/registry.ts` | Import handler + add to `HANDLERS` record |
| 3 | `src/services/mathEngine/domains/index.ts` | Re-export handler |
| 4 | `src/services/mathEngine/skills/index.ts` | Import + spread `EXPONENTIAL_FUNCTIONS_SKILLS` into `SKILLS` |
| 5 | `src/services/mathEngine/templates/index.ts` | Import + spread `EXPONENTIAL_FUNCTIONS_TEMPLATES` into `ALL_TEMPLATES` |
| 6 | `src/services/mathEngine/bugLibrary/distractorGenerator.ts` | Add `exponential_functions: EXPONENTIAL_FUNCTIONS_BUGS` to `BUGS_BY_OPERATION` |
| 7 | `src/services/mathEngine/bugLibrary/index.ts` | Export `EXPONENTIAL_FUNCTIONS_BUGS` |
| 8 | `src/services/mathEngine/wordProblems/templates.ts` | Add 3 prefix-mode templates for `exponential_functions` |
| 9 | `src/services/video/videoMap.ts` | Uncomment `exponential_functions: '6WMZ7J0wwMI'` |
| 10 | `src/components/reports/SkillDomainSummary.tsx` | Add to DOMAIN_LABELS + DOMAIN_ORDER |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (project root) |
| Quick run command | `npm test -- --testPathPattern=exponentialFunctions` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EXP-01 | Handler registered for exponential_functions | unit | `npm test -- --testPathPattern=exponentialFunctions` | Wave 0 |
| EXP-01 | 5 skills registered | unit | `npm test -- --testPathPattern=exponentialFunctions` | Wave 0 |
| EXP-01 | All skills produce integer answers across seeds 1-20 | unit | `npm test -- --testPathPattern=exponentialFunctions` | Wave 0 |
| EXP-01 | domainHandlerRegistry updated to 26 operations | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | Modify existing |
| EXP-01 | prerequisiteGating SKILLS.length updated to 197 | unit | `npm test -- --testPathPattern=prerequisiteGating` | Modify existing |
| EXP-02 | Every template has distractorStrategy domain_specific | unit | `npm test -- --testPathPattern=exponentialFunctions` | Wave 0 |
| EXP-02 | All answers bounded (< 2000) | unit | `npm test -- --testPathPattern=exponentialFunctions` | Wave 0 |
| EXP-02 | Growth/decay generators produce correct answers | unit | `npm test -- --testPathPattern=exponentialFunctions` | Wave 0 |
| EXP-03 | Word problem prefix templates for exponential_functions exist | unit | `npm test -- --testPathPattern=exponentialFunctions` | Wave 0 |
| EXP-04 | AI tutor Socratic hints -- no factor/answer revealed | manual QA | Manual review of 10+ hints | N/A (manual) |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=exponentialFunctions`
- **Per wave merge:** `npm test -- --testPathPattern="exponentialFunctions|domainHandlerRegistry|prerequisiteGating"`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/exponentialFunctions.test.ts` -- Wave 0 RED stubs covering EXP-01 through EXP-03
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` -- add `exponential_functions` to ALL_OPERATIONS, update count to 26
- [ ] Update `src/__tests__/adaptive/prerequisiteGating.test.ts` -- update SKILLS.length from 192 to 197

---

## Open Questions

1. **Skill ID collision with existing `exponents` domain**
   - What we know: The K-8 exponents domain has skill IDs: `evaluate`, `square`, `cube`, `power_of_10`, `square_root`, `negative`. The exponential_functions evaluate skill must avoid `evaluate`.
   - What's unclear: Exact collision is certain -- `evaluate` exists. Need a unique ID.
   - Recommendation: Use `exp_evaluate` as the skill ID for the exponential_functions evaluation skill. All other skill IDs (growth_factor, decay_factor, doubling_time, exp_word_problem) are unique.

2. **Growth/decay factor MC problem design**
   - What we know: Success criteria says "Growth vs. decay factor identification problems generate correctly as MC with base values above and below 1 as distractors."
   - What's unclear: How to present base values above/below 1 while keeping answers as integers. The criteria says "integer base and exponent inputs only" but also wants MC with base values like 1.2 vs 0.8.
   - Recommendation: The growth/decay identification skill should compute the final result (integer) while the question text mentions the factor. The MC distractors are different integer results from applying wrong factors. This satisfies both constraints: the answer is an integer result, and the problem tests whether the student understands growth vs. decay by computing the correct result. The question text can reference the decimal factor, but the answer the student selects is an integer computation result. Alternatively, ask "What percentage does it grow by?" with integer percentage answers (20%, 50%, etc.).

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `src/services/mathEngine/domains/polynomials/` -- polynomialsHandler.ts, generators.ts (latest HS domain pattern)
- Direct code inspection of `src/services/mathEngine/domains/exponents/` -- exponentsHandler.ts, generators.ts (K-8 exponents reference)
- Direct code inspection of `src/services/mathEngine/types.ts` -- MathDomain union (25 current entries)
- Direct code inspection of `src/services/mathEngine/domains/registry.ts` -- HANDLERS record (25 entries)
- Direct code inspection of `src/services/mathEngine/skills/index.ts` -- SKILLS aggregation (192 skills)
- Direct code inspection of `src/services/mathEngine/bugLibrary/distractorGenerator.ts` -- BUGS_BY_OPERATION record
- Direct code inspection of `src/services/mathEngine/wordProblems/templates.ts` -- prefix-mode template pattern
- Direct code inspection of `src/components/reports/SkillDomainSummary.tsx` -- DOMAIN_LABELS and DOMAIN_ORDER
- Direct code inspection of `src/__tests__/mathEngine/polynomials.test.ts` -- Wave 0 test stub pattern
- Direct code inspection of `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` -- ALL_OPERATIONS (25 entries, "25 operations")
- Direct code inspection of `.planning/REQUIREMENTS.md` -- EXP-01 through EXP-04 definitions
- Direct code inspection of `src/services/video/videoMap.ts` -- exponential_functions video ID '6WMZ7J0wwMI' comment

### Secondary (MEDIUM confidence)
- STATE.md decisions section -- skill ID convention, word problem collision avoidance, manual QA auto-approval pattern

### Tertiary (LOW confidence)
- Common Core HSF-LE (Linear, Quadratic, and Exponential Models) standard mapping -- standard references are illustrative; project does not enforce standards validation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies; identical pattern to 9 prior HS domains
- Architecture: HIGH -- all 10 wiring touchpoints identified and verified against existing implementations; file structure mirrors polynomials exactly
- Pitfalls: HIGH -- integer constraint verified against success criteria; skill ID collision confirmed by inspecting existing exponents skills; SKILLS.length and ALL_OPERATIONS counts verified from current test files
- Skills design: MEDIUM -- growth/decay factor MC design has an open question about how to frame decimal factors with integer answers; two viable approaches documented

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (stable codebase -- 90 days)
