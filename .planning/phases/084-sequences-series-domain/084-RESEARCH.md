# Phase 84: Sequences & Series Domain - Research

**Researched:** 2026-03-13
**Domain:** Math engine domain handler — sequences_series (arithmetic sequences, geometric sequences, nth-term, partial sums)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEQ-01 | `sequences_series` domain handler — arithmetic sequences, geometric sequences, nth-term formula, partial sums (G9-11, 5 skills) | Full domain handler pattern established by linearEquations and coordinateGeometry; all 7 wiring touchpoints identified |
| SEQ-02 | Sequences templates extending existing patterns infrastructure with higher-order progressions | patterns domain uses identical template shape; sequences_series adds geometric ratios and partial sum types absent from K-8 patterns |
| SEQ-03 | Word problem variants for sequences (savings/growth contexts) | prefix-mode word problem pattern established in templates.ts for coordinate_geometry and linear_equations; 6 prefix templates needed |
| SEQ-04 | AI tutor prompt guidance for sequences & series | AI tutor uses MathDomain string in prompt; no domain-specific code required — only manual QA sign-off on Socratic hints about common difference/ratio |
</phase_requirements>

---

## Summary

Phase 84 introduces the `sequences_series` math domain, following the identical code pattern established by Phases 82 (linear_equations) and 83 (coordinate_geometry). The implementation is purely additive: no existing files are modified except to register the new domain in 7 fixed wiring locations (types, registry, skills/index, templates/index, bugLibrary/distractorGenerator, bugLibrary/index, wordProblems/templates).

The five skills are: arithmetic sequence (find nth term), geometric sequence (find nth term), arithmetic sequence (next term / common difference), geometric sequence (next term / ratio), and sequences word problem. All answers are integers — construction-from-answer ensures this by picking the answer first and deriving operands around it. Geometric sequences use ratio values of 2, 3, or 4 with small starting terms to keep answers bounded. Partial sums (arithmetic sum formula) form the fifth skill.

The key pedagogical distinction from the K-8 patterns domain is multiplication-based progression: the patterns domain only uses additive (arithmetic) sequences with small steps; sequences_series adds geometric (multiplicative) progression, nth-term formulas (an = a1 + (n-1)d and an = a1 * r^(n-1)), and partial sum formulas (Sn = n/2 * (a1 + an)). Common student misconceptions include applying the arithmetic formula to geometric sequences, computing a wrong term index (off-by-one on n), and forgetting to use the correct formula for partial sums.

**Primary recommendation:** Mirror the coordinateGeometryHandler file structure exactly. Three plans: Wave 0 test stubs, core domain implementation, word problem templates plus AI tutor QA.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | — | All sequences math is pure arithmetic | No external library needed; engine uses SeededRng for reproducible generation |

### Supporting
| File | Purpose | When to Use |
|------|---------|-------------|
| `src/services/mathEngine/seededRng.ts` | Reproducible random number generation | All generators receive `rng: SeededRng` — never call `Math.random()` directly |
| `src/services/mathEngine/types.ts` | `numericAnswer`, `DomainProblemData`, `ProblemTemplate`, `SkillDefinition` | All domain handlers use these exact types |
| `src/services/mathEngine/bugLibrary/types.ts` | `BugPattern` interface | Each new bug pattern implements this interface |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended File Structure

```
src/services/mathEngine/
├── types.ts                          MODIFY: add 'sequences_series' to MathDomain union
├── domains/
│   ├── registry.ts                   MODIFY: import + register sequencesSeriesHandler
│   ├── index.ts                      MODIFY: re-export sequencesSeriesHandler
│   └── sequencesSeries/              CREATE new directory
│       ├── generators.ts             CREATE: 5 generator functions
│       ├── sequencesSeriesHandler.ts CREATE: dispatch switch by domainConfig.type
│       └── index.ts                  CREATE: barrel export
├── skills/
│   ├── sequencesSeries.ts            CREATE: SEQUENCES_SERIES_SKILLS array (5 skills)
│   └── index.ts                      MODIFY: import + spread SEQUENCES_SERIES_SKILLS
├── templates/
│   ├── sequencesSeries.ts            CREATE: SEQUENCES_SERIES_TEMPLATES array (5 templates)
│   └── index.ts                      MODIFY: import + spread SEQUENCES_SERIES_TEMPLATES
├── bugLibrary/
│   ├── sequencesSeriesBugs.ts        CREATE: SEQUENCES_SERIES_BUGS array (3 bug patterns)
│   ├── distractorGenerator.ts        MODIFY: add sequences_series to BUGS_BY_OPERATION
│   └── index.ts                      MODIFY: export SEQUENCES_SERIES_BUGS
└── wordProblems/
    └── templates.ts                  MODIFY: add 6 prefix-mode word problem templates
```

### Pattern 1: Construction-from-Answer (MANDATORY for all generators)

**What:** Pick the correct answer first, then derive all problem values from it. Never solve forward to get the answer.
**When to use:** Every single generator function in this domain.
**Example:**
```typescript
// Source: established by linearEquations/generators.ts and coordinateGeometry/generators.ts
// Arithmetic nth-term: a_n = a1 + (n-1)*d
export function generateArithmeticNthTerm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Construction-from-answer: pick answer first
  const a1 = rng.intRange(1, 20);        // first term
  const d = rng.intRange(1, 10);         // common difference
  const n = rng.intRange(3, 8);          // term index to find
  const answer = a1 + (n - 1) * d;      // the correct answer

  // Bug distractors: wrong formula applications
  const wrongNoSubtract = a1 + n * d;   // forgot the (n-1), used n instead
  const wrongJustD = a1 + d;            // only one step: a1 + d

  return {
    operands: [wrongNoSubtract, wrongJustD, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `Find the ${n}th term of the arithmetic sequence: ${a1}, ${a1 + d}, ${a1 + 2 * d}, ...`,
    metadata: { digitCount: 2, requiresCarry: false, requiresBorrow: false },
  };
}
```

### Pattern 2: Domain Handler Dispatch Switch

**What:** Handler reads `template.domainConfig.type` and dispatches to the matching generator.
**When to use:** `sequencesSeriesHandler.ts` — identical to coordinateGeometryHandler structure.
**Example:**
```typescript
// Source: mirrored from coordinateGeometry/coordinateGeometryHandler.ts
export const sequencesSeriesHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;
    switch (type) {
      case 'arithmetic_nth_term':   return generateArithmeticNthTerm(template, rng);
      case 'geometric_nth_term':    return generateGeometricNthTerm(template, rng);
      case 'arithmetic_next_term':  return generateArithmeticNextTerm(template, rng);
      case 'geometric_next_term':   return generateGeometricNextTerm(template, rng);
      case 'arithmetic_partial_sum':return generateArithmeticPartialSum(template, rng);
      case 'word_problem':          return generateArithmeticNthTerm(template, rng);
      default:
        throw new Error(`sequencesSeriesHandler: unknown type "${type}"`);
    }
  },
};
```

### Pattern 3: Prefix-Mode Word Problems

**What:** A scene-setting sentence is prepended to the original equation question text. The `mode: 'prefix'` field controls this in the word problem generator.
**When to use:** All 6 sequences_series word problem prefix templates.
**Example:**
```typescript
// Source: established by wordProblems/templates.ts for linear_equations and coordinate_geometry
{
  id: 'wp_seq_savings',
  operations: ['sequences_series'],
  mode: 'prefix',
  template: '{name} is saving money each week, adding the same amount every time.',
  question: '',
  minGrade: 9,
},
```

### Pattern 4: Skill ID Convention — Bare Names

**What:** Skill IDs for HS domains use bare names without namespace prefix (e.g., `arithmetic_nth_term`, not `sequences_series.arithmetic_nth_term`).
**When to use:** All skill definitions in `sequencesSeries.ts`.
**Source:** STATE.md decision from Phase 082: "Skill IDs use bare names (one_step_addition) not namespaced - matches Wave 0 test stubs"

### Pattern 5: Bug Pattern Operand Layout Documentation

**What:** The comment header in generators.ts documents which `operands[N]` value feeds which bug pattern. The bug compute() function reads `(a, b)` = `(operands[0], operands[1])`.
**When to use:** Every generator that has misconception-based distractors.
**Example from coordinateGeometry/generators.ts:**
```
// generateLineSlope:
//   operands[0] = b (wrong: confused intercept with slope)
//   operands[1] = m + b (wrong: added both)
//   operands[2] = m (correct)
```

### Anti-Patterns to Avoid

- **Solving forward:** Never write `a1 + (n-1)*d` and then check if it's in range. Pick `a1`, `d`, `n` first so the answer is known before generating question text.
- **Namespace in skill IDs:** Never use `sequences_series.arithmetic_nth_term`. Bare name only: `arithmetic_nth_term`.
- **Floating-point answers:** Geometric sequences must use integer ratios (2, 3, 4) and integer starting terms. A ratio of 1.5 produces non-integer answers — invalid for NumericAnswer.
- **Large geometric answers:** r=4, n=8 produces 4^7 * a1 which overflows displayable range. Cap r at 4 and n at 6 for geometric sequences.
- **word_problem skill ID collision:** Use `seq_word_problem` as the skill ID, not the bare `word_problem` — STATE.md notes that `coord_word_problem` was used (not bare `word_problem`) to avoid key collision in `computeNodePositions` Map. Pattern confirmed: use domain-prefixed word problem skill IDs for HS domains.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Random number generation | `Math.random()` | `rng.intRange(min, max)` | Seeded RNG ensures reproducible tests across seeds 1-20 |
| GCD reduction | Custom gcd function | Import `gcd` from `fractions/utils` if needed (or inline for tests only) | coordinateGeometry test inlines gcd for test isolation — production generators don't need it for integer answers |
| Distractor generation infrastructure | Custom distractor logic | `generateDistractors()` + `BUGS_BY_OPERATION` entry | The existing pipeline handles bug library lookup, adjacent ±1, and random fill |
| Word problem interpolation | Custom template engine | Add entries to `wordProblems/templates.ts` | The `generateWordProblem()` function handles `{name}`, `{a}`, `{b}` interpolation automatically |

**Key insight:** The entire domain is 5 files (generators.ts, handler.ts, index.ts, skills.ts, templates.ts) plus 2 additional files (bugs.ts, word problem entries) and 7 one-liner modifications to existing registry/index files. There is no novel infrastructure to build.

---

## Common Pitfalls

### Pitfall 1: Geometric Sequence Integer Overflow
**What goes wrong:** `r=4, n=8, a1=5` → answer = 5 * 4^7 = 81920. Multiple choice renders as a 5-digit number, destroying readability.
**Why it happens:** Construction-from-answer picks r and n independently without checking the result magnitude.
**How to avoid:** For geometric sequences, cap: `r = rng.intRange(2, 3)`, `n = rng.intRange(3, 6)`, `a1 = rng.intRange(1, 5)`. Max answer: 5 * 3^5 = 1215.
**Warning signs:** Test across seeds 1-20 and check `answerNumericValue(result.correctAnswer) < 2000`.

### Pitfall 2: Partial Sum Formula Produces Non-Integer
**What goes wrong:** `Sn = n/2 * (a1 + an)` produces 0.5 fractions when n is odd and (a1 + an) is odd.
**Why it happens:** The sum formula divides by 2. If n*(a1+an) is odd, the result is fractional.
**How to avoid:** Construction-from-answer: pick a1 and d, then compute an = a1 + (n-1)*d, then compute Sn = n*(a1+an)/2. If Sn is not integer (it always will be because n*(a1+an) is always even — arithmetic series property), there is no problem. Actually this is always integer: either n is even, or (a1 + an) = 2*a1 + (n-1)*d is even. Verify with seeds 1-20 that `Number.isInteger(answerNumericValue(...))` passes.
**Warning signs:** Test with seeds 1-20 and assert `Number.isInteger()`.

### Pitfall 3: Skill ID word_problem Collision
**What goes wrong:** If the word problem skill is named `word_problem` (bare), `computeNodePositions` in the skill map uses skillId as a Map key and collides with linear_equations' `word_problem` skill.
**Why it happens:** K-8 domains use namespaced IDs (`patterns.number-patterns`), but HS domains (phases 82-83) introduced bare IDs. Two bare `word_problem` IDs conflict.
**How to avoid:** Use `seq_word_problem` as the skill ID (matching the pattern established by `coord_word_problem` in Phase 83).
**Warning signs:** Skill map renders two nodes at the same position; `computeNodePositions` silently overwrites the first entry.

### Pitfall 4: Distractor Equals Correct Answer
**What goes wrong:** Bug pattern `compute()` returns a value equal to the correct answer, creating an invalid distractor that is filtered but leaves fewer than 3 distractors.
**Why it happens:** For small sequences, wrong formulas can accidentally produce the right answer (e.g., arithmetic next-term with d=0 — but d is always ≥ 1 so this is unlikely).
**How to avoid:** Bug patterns that might collide return `null` when `wrong === correct`. The distractorGenerator handles null returns by falling back to adjacent/random fill. Match the pattern in `linearEquationsBugs.ts`: `return a !== b ? a : null`.
**Warning signs:** `generateDistractors()` returns fewer than 3 values; test asserts `distractors.length === 3`.

### Pitfall 5: Prerequisite Count Tests
**What goes wrong:** `prerequisiteGating.test.ts` asserts `SKILLS.length === 165` and `domainHandlerRegistry.test.ts` asserts 20 handlers and the ALL_OPERATIONS list. Adding `sequences_series` will break these unless they are updated in Wave 0.
**Why it happens:** The count tests are hard-coded. Phase 83 updated prerequisiteGating count from 151 to 165 in one step (STATE.md: "prerequisiteGating count resolved 151→165 in one step").
**How to avoid:** Wave 0 test stubs (Plan 01) MUST update: (a) SKILLS.length to 170 (165 + 5), (b) ALL_OPERATIONS array to include `sequences_series`, (c) handler count assertion if present.
**Warning signs:** `npm test -- --testPathPattern=prerequisiteGating` fails with "expected 165, received 170".

### Pitfall 6: `domainHandlerRegistry.test.ts` ALL_OPERATIONS hardcode
**What goes wrong:** `domainHandlerRegistry.test.ts` has an explicit `ALL_OPERATIONS` array with 20 entries and asserts "has a handler registered for all 20 operations". Adding sequences_series without updating this test breaks it.
**How to avoid:** In Plan 01 (Wave 0 stubs), update ALL_OPERATIONS to 21 entries including `sequences_series`, update the test description to "21 operations".
**Warning signs:** Registry test fails because sequences_series is not in ALL_OPERATIONS array.

---

## Code Examples

### Arithmetic Next-Term Generator
```typescript
// Pattern: mirrors generateFindNext in patterns/generators.ts but with grade 9-11 ranges
export function generateArithmeticNextTerm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a1 = rng.intRange(1, 30);
  const d = rng.intRange(1, 15);
  const terms = 4; // show 4 terms, ask for 5th
  const seq: number[] = Array.from({ length: terms }, (_, i) => a1 + i * d);
  const answer = a1 + terms * d;

  // Bug distractors for seq_arithmetic_wrong_step and seq_arithmetic_off_by_one
  const wrongStep = seq[terms - 1] + (d + 1);   // incremented d by 1
  const wrongIndex = a1 + (terms - 1) * d;       // last displayed term (off-by-one on which term)

  return {
    operands: [wrongStep, wrongIndex, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `What comes next? ${seq.join(', ')}, ?`,
    metadata: { digitCount: 2, requiresCarry: false, requiresBorrow: false },
  };
}
```

### Geometric Nth-Term Generator (bounded values)
```typescript
// Construction-from-answer with overflow guard: cap r at 3 and n at 6
export function generateGeometricNthTerm(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a1 = rng.intRange(1, 5);
  const r = rng.intRange(2, 3);       // ratio 2 or 3 — keeps values manageable
  const n = rng.intRange(3, 6);       // term index 3-6
  const answer = a1 * Math.pow(r, n - 1);

  // Bug: arithmetic thinking — use + instead of *
  const wrongArithmetic = a1 + (n - 1) * r;
  // Bug: wrong term index — compute n+1 instead of n
  const wrongIndex = a1 * Math.pow(r, n);

  const seq = [a1, a1 * r, a1 * r * r];

  return {
    operands: [wrongArithmetic, wrongIndex, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `Find the ${n}th term of the geometric sequence: ${seq.join(', ')}, ...`,
    metadata: { digitCount: 2, requiresCarry: false, requiresBorrow: false },
  };
}
```

### Bug Pattern File
```typescript
// Source: mirrors linearEquationsBugs.ts and coordinateGeometryBugs.ts structure
import type { BugPattern } from './types';

export const SEQUENCES_SERIES_BUGS: readonly BugPattern[] = [
  {
    id: 'seq_arithmetic_wrong_step',
    operations: ['sequences_series'],
    description: 'Student identified the common difference incorrectly — used d+1 or d-1 instead of the actual step between terms.',
    minDigits: 1,
    compute(a: number, _b: number, _op: string): number | null {
      return a; // operands[0] = wrongStep pre-stored by generator
    },
  },
  {
    id: 'seq_arithmetic_off_by_one',
    operations: ['sequences_series'],
    description: 'Student found a term at the wrong index — used n instead of (n-1) in the nth-term formula, resulting in an off-by-one error.',
    minDigits: 1,
    compute(_a: number, b: number, _op: string): number | null {
      return b; // operands[1] = wrongIndex pre-stored by generator
    },
  },
  {
    id: 'seq_geometric_uses_arithmetic',
    operations: ['sequences_series'],
    description: 'Student applied arithmetic sequence thinking to a geometric sequence — added the ratio instead of multiplying by it.',
    minDigits: 1,
    compute(a: number, _b: number, _op: string): number | null {
      return a; // operands[0] = wrongArithmetic pre-stored by geometric generators
    },
  },
];
```

### Skills Definition (5 skills)
```typescript
export const SEQUENCES_SERIES_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'arithmetic_next_term',
    name: 'Arithmetic Sequence: Next Term',
    operation: 'sequences_series',
    grade: 9,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['multi_step'],      // requires linear_equations multi_step
  },
  {
    id: 'arithmetic_nth_term',
    name: 'Arithmetic Sequence: nth Term Formula',
    operation: 'sequences_series',
    grade: 9,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['arithmetic_next_term'],
  },
  {
    id: 'geometric_next_term',
    name: 'Geometric Sequence: Next Term',
    operation: 'sequences_series',
    grade: 10,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['arithmetic_nth_term'],
  },
  {
    id: 'geometric_nth_term',
    name: 'Geometric Sequence: nth Term Formula',
    operation: 'sequences_series',
    grade: 10,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['geometric_next_term'],
  },
  {
    id: 'arithmetic_partial_sum',
    name: 'Arithmetic Sequence: Partial Sum',
    operation: 'sequences_series',
    grade: 11,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['arithmetic_nth_term'],
  },
  {
    id: 'seq_word_problem',
    name: 'Sequences Word Problems',
    operation: 'sequences_series',
    grade: 10,
    standards: ['HSF-BF.A.1a'],
    prerequisites: ['arithmetic_nth_term'],
  },
] as const;
```

> Note: The requirement says "5 skills" but the success criteria also mentions word problems. If word problem is the 5th skill, drop `geometric_nth_term` or combine `arithmetic_next_term`/`arithmetic_nth_term` into one skill. Plan 01 (Wave 0 stubs) must hard-code the exact count — confirm 5 vs 6 before writing the stub assertion.

### Templates Definition
```typescript
export const SEQUENCES_SERIES_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'seq_arithmetic_next',
    operation: 'sequences_series',
    skillId: 'arithmetic_next_term',
    grades: [9],
    baseElo: 1050,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSF-BF.A.1a'],
    domainConfig: { type: 'arithmetic_next_term' },
  },
  // ... one template per skill
];
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Namespaced skill IDs (`patterns.number-patterns`) | Bare skill IDs (`arithmetic_next_term`) | Phase 82 (2026-03-13) | Must use bare IDs; test stubs match bare names |
| Single `word_problem` skill ID | Domain-prefixed word problem skill ID (`seq_word_problem`) | Phase 83 (2026-03-13) | Avoids Map key collision in skill map layout |
| Future domains in videoMap.ts comments | Active MathDomain entries in videoMap.ts | Phase 82-83 | `sequences_series` video ID `_cooC3yG_p0` is reserved in videoMap.ts comment — must uncomment and add to MathDomain union AND videoMap when this phase lands |

**Deprecated/outdated:**
- videoMap.ts comment `// sequences_series: '_cooC3yG_p0' (Phase 84)`: This must be activated as a live entry when MathDomain gains `sequences_series`. The comment and the live map entry must stay in sync.

---

## 7 Wiring Touchpoints (Complete Checklist)

Every new HS domain must be wired in exactly these 7 locations:

| # | File | Change |
|---|------|--------|
| 1 | `src/services/mathEngine/types.ts` | Add `'sequences_series'` to `MathDomain` union |
| 2 | `src/services/mathEngine/domains/registry.ts` | Import handler + add to `HANDLERS` record |
| 3 | `src/services/mathEngine/domains/index.ts` | Re-export handler |
| 4 | `src/services/mathEngine/skills/index.ts` | Import + spread `SEQUENCES_SERIES_SKILLS` into `SKILLS` |
| 5 | `src/services/mathEngine/templates/index.ts` | Import + spread `SEQUENCES_SERIES_TEMPLATES` into `ALL_TEMPLATES` |
| 6 | `src/services/mathEngine/bugLibrary/distractorGenerator.ts` | Add `sequences_series: SEQUENCES_SERIES_BUGS` to `BUGS_BY_OPERATION` |
| 7 | `src/services/mathEngine/bugLibrary/index.ts` | Export `SEQUENCES_SERIES_BUGS` |

Plus 2 additional locations for word problems and video:

| # | File | Change |
|---|------|--------|
| 8 | `src/services/mathEngine/wordProblems/templates.ts` | Add 6 prefix-mode templates for `sequences_series` |
| 9 | `src/services/video/videoMap.ts` | Uncomment `sequences_series: '_cooC3yG_p0'` (requires MathDomain to exist first) |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (project root) |
| Quick run command | `npm test -- --testPathPattern=sequencesSeries` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEQ-01 | Handler registered for sequences_series | unit | `npm test -- --testPathPattern=sequencesSeries` | Wave 0 |
| SEQ-01 | 5 (or 6) skills registered | unit | `npm test -- --testPathPattern=sequencesSeries` | Wave 0 |
| SEQ-01 | All skills produce integer answers across seeds 1-20 | unit | `npm test -- --testPathPattern=sequencesSeries` | Wave 0 |
| SEQ-01 | domainHandlerRegistry updated to 21 operations | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | Modify existing |
| SEQ-01 | prerequisiteGating SKILLS.length updated to 170 | unit | `npm test -- --testPathPattern=prerequisiteGating` | Modify existing |
| SEQ-02 | Every template has distractorStrategy domain_specific | unit | `npm test -- --testPathPattern=sequencesSeries` | Wave 0 |
| SEQ-02 | Geometric values bounded (< 2000) | unit | `npm test -- --testPathPattern=sequencesSeries` | Wave 0 |
| SEQ-02 | All answers are integers (Number.isInteger) | unit | `npm test -- --testPathPattern=sequencesSeries` | Wave 0 |
| SEQ-03 | Word problem prefix templates for sequences_series exist | unit | `npm test -- --testPathPattern=sequencesSeries` | Wave 0 |
| SEQ-04 | AI tutor Socratic hints — no formula/answer revealed | manual QA | Manual review of 10+ hints in HINT mode | N/A (manual) |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=sequencesSeries`
- **Per wave merge:** `npm test -- --testPathPattern="sequencesSeries|domainHandlerRegistry|prerequisiteGating"`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/sequencesSeries.test.ts` — Wave 0 RED stubs covering SEQ-01 through SEQ-03
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — add `sequences_series` to ALL_OPERATIONS, update count to 21
- [ ] Update `src/__tests__/adaptive/prerequisiteGating.test.ts` — update SKILLS.length from 165 to 170

---

## Open Questions

1. **Skill count: 5 or 6?**
   - What we know: SEQ-01 says "5 skills"; the success criteria mentions word problems separately
   - What's unclear: Is `seq_word_problem` the 5th skill (replacing `arithmetic_partial_sum`) or a 6th?
   - Recommendation: Plan 01 must decide. The coordinate_geometry precedent (Phase 83, 6 skills including `coord_word_problem`) suggests word problem is one of the 5. If so, drop one of the pure sequence skills. Most likely resolution: arithmetic_next_term, arithmetic_nth_term, geometric_next_term, geometric_nth_term, seq_word_problem (5 skills, no partial sum). If partial sum is required by SEQ-01's "partial sums" mention, then 6 skills total — update the Wave 0 stub count accordingly.

2. **Partial sum skill feasibility**
   - What we know: SEQ-01 mentions "partial sums" in the domain spec
   - What's unclear: The arithmetic partial sum formula `Sn = n/2 * (a1 + an)` always produces an integer (see Pitfall 2), so it is technically feasible
   - Recommendation: Include as a skill if the count allows. The generator is straightforward.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `src/services/mathEngine/domains/linearEquations/` — linearEquationsHandler.ts, generators.ts
- Direct code inspection of `src/services/mathEngine/domains/coordinateGeometry/` — coordinateGeometryHandler.ts, generators.ts
- Direct code inspection of `src/services/mathEngine/domains/patterns/` — patternsHandler.ts, generators.ts
- Direct code inspection of `src/services/mathEngine/bugLibrary/` — linearEquationsBugs.ts, coordinateGeometryBugs.ts, distractorGenerator.ts
- Direct code inspection of `src/services/mathEngine/wordProblems/templates.ts` — prefix-mode entries for coordinate_geometry and linear_equations
- Direct code inspection of `src/services/mathEngine/types.ts` — MathDomain union, ProblemTemplate, DomainProblemData
- Direct code inspection of `src/services/mathEngine/skills/linearEquations.ts` and `coordinateGeometry.ts`
- Direct code inspection of `src/services/mathEngine/templates/linearEquations.ts` and `coordinateGeometry.ts`
- Direct code inspection of `src/__tests__/mathEngine/coordinateGeometry.test.ts` and `linearEquations.test.ts`
- Direct code inspection of `.planning/REQUIREMENTS.md` — SEQ-01 through SEQ-04 definitions

### Secondary (MEDIUM confidence)
- STATE.md decisions section — skill ID convention, word problem collision avoidance pattern

### Tertiary (LOW confidence)
- Common Core HSF-BF.A.1a standard mapping — standard references are illustrative; project does not enforce standards validation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all files verified by direct inspection; pattern is 100% consistent across phases 82 and 83
- Architecture: HIGH — 7 wiring touchpoints identified and verified against existing implementations
- Pitfalls: HIGH — pitfall 5 (SKILLS.length) and pitfall 6 (ALL_OPERATIONS) confirmed by reading test files; geometric overflow is a mathematical certainty

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (stable codebase — 90 days)
