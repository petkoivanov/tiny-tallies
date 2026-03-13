# Phase 83: Coordinate Geometry Domain - Research

**Researched:** 2026-03-13
**Domain:** Math engine domain handler extension (coordinate geometry, G8-10)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COORD-01 | `coordinate_geometry` domain handler — slope, distance formula, midpoint, equation of a line (G8-10, 6 skills) | Full handler pattern documented from Phase 82; 6 skills mapped to CCSS 8.EE/8.G standards; construction-from-answer pattern applied; FractionAnswer type available for slope |
| COORD-02 | Coordinate geometry templates with numeric answers (slope as fraction, distance/midpoint as numeric) | `FractionAnswer` type already in discriminated union; `answerNumericValue` handles fractions via division; distractor generator's `answerNumericValue` call extracts float proxy for Elo; `distractorStrategy: 'domain_specific'` required |
| COORD-03 | Word problem variants for coordinate geometry (real-world distance/slope contexts) | Prefix mode confirmed as correct approach; `generateWordProblem` already filters by operation and grade; 4-6 new templates in `wordProblems/templates.ts` |
| COORD-04 | AI tutor prompt guidance for coordinate geometry (guide toward formula without revealing substitution steps) | `buildHintPrompt`/`buildTeachPrompt` receive `operation: 'coordinate_geometry'` and `bugDescription` from bug patterns; no new tutor code needed; Socratic formula-identification framing via bug description strings |

</phase_requirements>

---

## Summary

Phase 83 follows the same pattern as Phase 82 (linear equations) exactly. The codebase has an established pattern for adding new domains: handler file, generators file, skills file, templates file, bug patterns file, plus wiring into four index files and the registry. Phase 82 is the most recent completed domain and is the definitive reference implementation.

The key distinction for coordinate geometry is **answer type variety**: slope problems use `FractionAnswer` (numerator/denominator), while distance and midpoint problems use `NumericAnswer`. The `FractionAnswer` type already exists in the discriminated union in `types.ts` — no new answer types are needed. The `answerNumericValue()` function handles fractions for Elo-proxy purposes. The distractor generator works on the `answerNumericValue` (float) proxy for fraction answers, meaning fraction distractors are generated as numeric values, not as fraction pairs — this is acceptable because the MC options will display as floating-point approximations for distance/midpoint, or the template can use numeric distractors expressed as simplified decimals.

The `videoMap.ts` already has `coordinate_geometry: 'N4nrdf0yYfM'` defined, but the `coordinate_geometry` key causes a TypeScript error because the type is not yet in the `MathDomain` union. Adding `'coordinate_geometry'` to the union fixes this pre-existing error.

After Phase 82's 8 skills, the registry test hardcodes `SKILLS.length === 159`. Adding 6 coordinate geometry skills will require updating that assertion to 165. The `prerequisiteGating.test.ts` also hardcodes 151 (pre-Phase 82 count) — it likely needs the same update, but since Phase 82 already updated `domainHandlerRegistry.test.ts` to 159, the prerequisiteGating test at 151 is an existing discrepancy that must be resolved in Wave 0.

**Primary recommendation:** Follow Phase 82 pattern exactly. Create `src/services/mathEngine/domains/coordinateGeometry/` with handler, generators, and index; create matching files in bugLibrary, skills, and templates; wire into four index files and registry; update word problem templates; update affected test counts; add `'coordinate_geometry'` to `MathDomain` union and `ALLOWS_NEGATIVES` set in validation.ts; manual QA checkpoint for tutor hints.

---

## Standard Stack

### Core
| Library / System | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `src/services/mathEngine/types.ts` | current | `FractionAnswer`, `NumericAnswer`, `DomainHandler`, `ProblemTemplate`, `DistractorStrategy` | All domain handlers use these types; `FractionAnswer` already defined for slope answers |
| `src/services/mathEngine/seededRng.ts` | current | Deterministic RNG via `SeededRng` | Required for reproducible problem generation |
| `src/services/tutor/promptTemplates.ts` | current | `buildHintPrompt`, `buildTeachPrompt`, `buildBoostPrompt` | AI tutor uses `operation` + `bugDescription` fields |
| `src/services/mathEngine/domains/fractions/utils.ts` | current | `gcd(a, b)` utility | Required for slope fraction reduction to lowest terms |

### Supporting
| System | Purpose | When to Use |
|---------|---------|-------------|
| `distractorStrategy: 'domain_specific'` on `ProblemTemplate` | Skips ±1 adjacent phase; forces domain-specific bug patterns to fill all slots | All coordinate geometry templates — ±1 adjacent is meaningless for slope/distance |
| `FractionAnswer` + `fractionAnswer()` factory | Represents slope as p/q | Slope problems only; distance and midpoint use `numericAnswer` |
| `ALLOWS_NEGATIVES` set in `validation.ts` | Allows negative distractors | `coordinate_geometry` must be added — slopes and coordinate values can be negative |
| Word problem prefix mode | Prepends context sentence; preserves original question text | Same pattern as linear_equations — operands are internal computation values, not displayable nouns |

---

## Architecture Patterns

### Recommended Project Structure

```
src/services/mathEngine/
├── domains/
│   └── coordinateGeometry/          # NEW
│       ├── index.ts                  # barrel export
│       ├── coordinateGeometryHandler.ts  # DomainHandler impl
│       └── generators.ts             # 6 generator functions
├── bugLibrary/
│   └── coordinateGeometryBugs.ts    # NEW — 3+ BugPattern entries
├── skills/
│   └── coordinateGeometry.ts        # NEW — 6 SkillDefinition entries
└── templates/
    └── coordinateGeometry.ts        # NEW — 6+ ProblemTemplate entries
```

Plus edits to:
- `types.ts` — add `'coordinate_geometry'` to `MathDomain` union
- `domains/index.ts` — export `coordinateGeometryHandler`
- `domains/registry.ts` — add `coordinate_geometry: coordinateGeometryHandler` to `HANDLERS`
- `bugLibrary/index.ts` — export `COORDINATE_GEOMETRY_BUGS`
- `bugLibrary/distractorGenerator.ts` — add `coordinate_geometry: COORDINATE_GEOMETRY_BUGS` to `BUGS_BY_OPERATION`
- `bugLibrary/validation.ts` — add `'coordinate_geometry'` to `ALLOWS_NEGATIVES` set
- `skills/index.ts` — import and spread `COORDINATE_GEOMETRY_SKILLS` into `SKILLS`
- `templates/index.ts` — import and spread `COORDINATE_GEOMETRY_TEMPLATES` into `ALL_TEMPLATES`
- `wordProblems/templates.ts` — add 4-6 new word problem prefix templates

### Pattern 1: Construction-from-Answer Generator

All generators build from the answer outward. For coordinate geometry this means: pick the two points first, then compute slope/distance/midpoint from those points.

```typescript
// Source: pattern from src/services/mathEngine/domains/linearEquations/generators.ts
export function generateSlope(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick points first — build problem from answer
  const x1 = rng.intRange(-5, 5);
  const y1 = rng.intRange(-5, 5);
  const rise = rng.intRange(-6, 6, /* exclude */ 0); // non-zero numerator
  const run  = rng.intRange(-6, 6, /* exclude */ 0); // non-zero denominator

  // Reduce to lowest terms using gcd from fractions/utils.ts
  const g = gcd(Math.abs(rise), Math.abs(run));
  const num = rise / g;
  const den = run / g;
  // Normalize sign: denominator always positive
  const slopeNum = den < 0 ? -num : num;
  const slopeDen = den < 0 ? -den : den;

  const x2 = x1 + run;
  const y2 = y1 + rise;

  // Wrong answer: student swaps rise/run
  const wrongSwapped = slopeDen; // numerator of swapped fraction as float proxy

  return {
    operands: [wrongSwapped, slopeDen, slopeNum],
    correctAnswer: fractionAnswer(slopeNum, slopeDen),
    questionText: `Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`,
    metadata: { digitCount: 1, requiresCarry: false, requiresBorrow: false },
  };
}
```

**CRITICAL:** `gcd` is already available in `src/services/mathEngine/domains/fractions/utils.ts`. Import it directly — do not re-implement.

### Pattern 2: FractionAnswer for Slope

Slope problems return `FractionAnswer`. The distractor generator calls `answerNumericValue()` on the correct answer, which for `FractionAnswer` returns `numerator / denominator` (a float). This float is used as the Elo proxy and for distractor proximity checking. The MC options will display as decimal approximations unless the generator additionally sets `metadata.answerDisplay` to the fraction string (e.g., `-3/4`).

```typescript
// Source: src/services/mathEngine/types.ts — fractionAnswer factory
import { fractionAnswer } from '../../types';

// Slope answer as reduced fraction
correctAnswer: fractionAnswer(slopeNum, slopeDen),
// Display override so MC shows "−3/4" not "-0.75"
metadata: { ..., answerDisplay: `${slopeNum}/${slopeDen}` },
```

**Note:** Check whether `answerDisplayValue` in `types.ts` for `FractionAnswer` returns `"num/den"` — it does (`return \`${answer.numerator}/${answer.denominator}\``). Use `answerDisplayValue` in BOOST mode.

### Pattern 3: NumericAnswer for Distance and Midpoint

Distance problems: `sqrt((x2-x1)^2 + (y2-y1)^2)`. To keep answers as integers, use Pythagorean triples (3-4-5, 5-12-13, 8-15-17, 6-8-10, etc.) as the construction seeds. Pick the triple, scale it, and read off the hypotenuse as the integer distance.

Midpoint problems: `((x1+x2)/2, (y1+y2)/2)`. To keep answers as integers, ensure both coordinate sums are even (pick both x-coords with same parity, same for y-coords).

For equation-of-a-line: use `y = mx + b` form with integer slope `m` and integer y-intercept `b`. Pick `m` and `b` first, then evaluate at `x=0` to get the y-intercept — the answer IS `b`, expressed as a `NumericAnswer`.

### Pattern 4: Handler Dispatch

```typescript
// Source: pattern from src/services/mathEngine/domains/linearEquations/linearEquationsHandler.ts
type CoordinateGeometryType =
  | 'slope'
  | 'distance'
  | 'midpoint_x'
  | 'midpoint_y'
  | 'line_equation_yintercept'
  | 'line_equation_slope';

export const coordinateGeometryHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: CoordinateGeometryType };
    switch (config.type) {
      case 'slope':                    return generateSlope(template, rng);
      case 'distance':                 return generateDistance(template, rng);
      case 'midpoint_x':               return generateMidpointX(template, rng);
      case 'midpoint_y':               return generateMidpointY(template, rng);
      case 'line_equation_yintercept': return generateLineYIntercept(template, rng);
      case 'line_equation_slope':      return generateLineSlope(template, rng);
      default:
        throw new Error(`Unknown coordinate geometry type: ${(config as { type: string }).type}`);
    }
  },
};
```

### Pattern 5: Adding to MathDomain Union and All Dependent Records

Exactly as in Phase 82. Adding `'coordinate_geometry'` to the union in `types.ts` causes TypeScript to require exhaustive updates to:
1. `HANDLERS` record in `registry.ts` — add `coordinate_geometry: coordinateGeometryHandler`
2. `BUGS_BY_OPERATION` record in `distractorGenerator.ts` — add `coordinate_geometry: COORDINATE_GEOMETRY_BUGS`
3. `videoMap` in `videoMap.ts` — already present (pre-existing key), TypeScript error resolves automatically
4. `gradeMap` in `wordProblems.test.ts` — add `coordinate_geometry: 8`
5. `expectedTypes` in `domainHandlerRegistry.test.ts` — add `coordinate_geometry: ['numeric', 'fraction']`
6. `ALL_OPERATIONS` in `domainHandlerRegistry.test.ts` and `wordProblems.test.ts` — add `'coordinate_geometry'`

### Anti-Patterns to Avoid

- **Don't compute distance with floating-point sqrt.** Restrict all distance problems to Pythagorean triples so the answer is always an integer. Use `numericAnswer(hypotenuse)` where hypotenuse is an integer.
- **Don't use `distractorStrategy: 'default'` on coordinate geometry templates.** ±1 adjacent is meaningless for slope or distance — e.g., "the slope is 3/4, is it 3/4+1 = 7/4?" is not pedagogically useful.
- **Don't store `FractionAnswer` operands as fraction pairs.** Store the relevant scalar wrong-answer values in `operands[0]`/`operands[1]` so bug patterns can return integer/float distractors via `compute(a, b)`.
- **Don't allow undefined slope.** Generators for `slope` type must ensure `run !== 0` (vertical line slope is undefined). Use rejection sampling if the RNG produces zero run.
- **Don't use template-literal `{a}` / `{b}` in word problem replace-mode.** Use prefix mode like linear_equations — coordinate values are not displayable as context nouns.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GCD for fraction reduction | Custom gcd | `gcd()` from `src/services/mathEngine/domains/fractions/utils.ts` | Already correct, handles zero, negative inputs |
| Seeded randomness | Custom RNG | `rng.intRange(min, max)`, `rng.next()` from `SeededRng` | Determinism required |
| Distractor generation | Custom wrong-answer picker | `BugPattern.compute` + existing `generateDistractors` | Three-phase pipeline handles dedup, validity, fallback |
| AI tutor prompts | New prompt builder | Pass `operation: 'coordinate_geometry'` + `bugDescription` to `buildHintPrompt` | All safety, word-limit, and misconception context already baked in |
| Word problem injection | Inline narrative | Add entries to `WORD_PROBLEM_TEMPLATES` in `wordProblems/templates.ts` | `generateWordProblem` already filters by operation and grade |
| Fraction display | Custom format | `answerDisplayValue(problem.correctAnswer)` returns `"num/den"` for `FractionAnswer` | Existing utility handles all answer types |
| Pythagorean triple generation | Custom triples | Hardcode a lookup list of small triples; pick from it | Distance must be integer; float sqrt is forbidden |

**Key insight:** The `FractionAnswer` type, `fractionAnswer` factory, and `gcd` utility are already present in the codebase. Coordinate geometry is the second domain to use `FractionAnswer` (fractions domain uses it too). All integration hooks work with any `MathDomain` string — adding `'coordinate_geometry'` to the union and registering the handler is the entire integration surface.

---

## Common Pitfalls

### Pitfall 1: `BUGS_BY_OPERATION` TypeScript Error After Adding to `MathDomain`

**What goes wrong:** `Record<MathDomain, readonly BugPattern[]>` is exhaustive. Adding `'coordinate_geometry'` to the union immediately breaks `distractorGenerator.ts`.
**Why it happens:** `Record<K, V>` enforces all keys. The compiler error appears in `distractorGenerator.ts`, not `types.ts`.
**How to avoid:** Add `coordinate_geometry: COORDINATE_GEOMETRY_BUGS` to `BUGS_BY_OPERATION` in the same wave as adding the union member.
**Warning signs:** `npm run typecheck` fails with "Property 'coordinate_geometry' is missing in type..."

### Pitfall 2: Test Count Assertions Need Updating

**What goes wrong:** Three test files have hardcoded counts that break when new skills are added.
**Why it happens:** Regression detection via exact count assertions.
**Files to update:**
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — `expect(total).toBe(159)` → `165` (159 + 6 new skills); `ALL_OPERATIONS` must include `'coordinate_geometry'`; `expectedTypes` must include `coordinate_geometry: ['numeric', 'fraction']`
- `src/__tests__/adaptive/prerequisiteGating.test.ts` — `expect(SKILLS.length).toBe(151)` — this is a pre-existing discrepancy (was not updated by Phase 82); correct value after Phase 82 is 159, after Phase 83 is 165. Update to 165.
- `src/__tests__/mathEngine/wordProblems.test.ts` — `ALL_OPERATIONS` must include `'coordinate_geometry'`; `gradeMap` must include `coordinate_geometry: 8`
**Warning signs:** `npm test -- --testPathPattern=domainHandlerRegistry` or `prerequisiteGating` fails with "Expected: 159/151, Received: 165".

### Pitfall 3: Slope Fraction Reduction

**What goes wrong:** Slope `rise/run = 4/6` displayed as `4/6` instead of `2/3`; Elo proxy comparison fails when two equivalent fractions (4/6 vs 2/3) exist.
**Why it happens:** Fractions must be in lowest terms for display and comparison correctness.
**How to avoid:** Always reduce using `gcd(Math.abs(rise), Math.abs(run))` from `fractions/utils.ts` before constructing `fractionAnswer(num, den)`. Additionally, normalize sign so denominator is always positive.
**Warning signs:** `fractionAnswer(4, 6)` appears in output instead of `fractionAnswer(2, 3)`.

### Pitfall 4: Negative Distractors Rejected for Coordinate Geometry

**What goes wrong:** Slope distractors (e.g., `-3/4`) or negative distance/midpoint values silently dropped by `isValidDistractor`.
**Why it happens:** `isValidDistractor` only allows negatives for operations in `ALLOWS_NEGATIVES` set. `coordinate_geometry` is not in the set yet.
**How to avoid:** Add `'coordinate_geometry'` to the `ALLOWS_NEGATIVES` set in `src/services/mathEngine/bugLibrary/validation.ts`.
**Warning signs:** Only 1-2 distractors generated instead of 3 for slope problems; negative slopes never appear as wrong answers.

### Pitfall 5: Distance Answers Must Be Integers (No Floating-Point sqrt)

**What goes wrong:** Generator picks arbitrary point pairs yielding `sqrt(17)` — not an integer — which breaks the `NumericAnswer` assumption and produces floating-point distractors.
**Why it happens:** `sqrt(a^2 + b^2)` is rarely integer.
**How to avoid:** Use construction-from-triple pattern: hardcode a list of Pythagorean triples (3-4-5, 5-12-13, 8-15-17, 6-8-10) with a scale factor; pick triple and scale, then set `dx = a*scale`, `dy = b*scale`, `distance = c*scale`. This guarantees integer distance.
**Warning signs:** `correctAnswer.value` contains `.` when logged; `numericAnswer(Math.sqrt(...))` produces float.

### Pitfall 6: Midpoint Answers Must Be Integers

**What goes wrong:** Midpoint of (1, 3) and (2, 4) is (1.5, 3.5) — fractional midpoint.
**Why it happens:** Sum of coordinates must be even for integer midpoint.
**How to avoid:** In midpoint generators, always pick both x-coordinates with the same parity (both even or both odd) so their sum is even, and similarly for y-coordinates. Construction-from-answer: pick the midpoint first, then set `x1 = mx - dx`, `x2 = mx + dx` for any integer `dx`.
**Warning signs:** `correctAnswer.value % 1 !== 0` in midpoint templates.

### Pitfall 7: Word Problem Operand Mismatch (Same as Phase 82 Pitfall 5)

**What goes wrong:** Replace-mode word problem template uses `{a}` and `{b}` tokens, but generators store internal computation values (wrong-operation results) in `operands[0]` and `operands[1]`.
**Why it happens:** `generateWordProblem` interpolates `{a}` = `operands[0]` and `{b}` = `operands[1]`.
**How to avoid:** Use `mode: 'prefix'` for all coordinate geometry word problem templates. The geometry problem text (e.g., "Find the slope of the line through (2, 3) and (5, 7).") is already self-contained — a prefix context sentence is all that's needed.
**Warning signs:** Word problem text reads "a map 12 and b map 5" instead of a coherent sentence.

### Pitfall 8: `FractionAnswer` Distractors Compared as Floats

**What goes wrong:** `answerNumericValue` returns `numerator/denominator` as float. Two different fractions that round to the same float (e.g., `1/3 ≈ 0.333` and `2/6 ≈ 0.333`) would be considered equal by the `used` set in `generateDistractors`.
**Why it happens:** `generateDistractors` uses a `Set<number>` keyed on float values.
**How to avoid:** Ensure all fractions are fully reduced before constructing `fractionAnswer`. Reduced fractions with distinct values will have distinct float representations for the denominators used (2-8 range). This is not a problem in practice for the ranges used.

---

## Code Examples

Verified patterns from codebase source files:

### 6 Skills for the Domain

```typescript
// Source: pattern from src/services/mathEngine/skills/linearEquations.ts
export const COORDINATE_GEOMETRY_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'slope',
    name: 'Slope of a line between two points',
    operation: 'coordinate_geometry',
    grade: 8,
    standards: ['8.EE.B.5'],
    prerequisites: ['linear_equations.two_step_mixed'],  // uses two_step_mixed ID
  },
  {
    id: 'distance',
    name: 'Distance formula',
    operation: 'coordinate_geometry',
    grade: 8,
    standards: ['8.G.B.8'],
    prerequisites: ['slope'],
  },
  {
    id: 'midpoint',
    name: 'Midpoint of a segment',
    operation: 'coordinate_geometry',
    grade: 8,
    standards: ['8.G.B.8'],
    prerequisites: ['slope'],
  },
  {
    id: 'line_equation_yintercept',
    name: 'Equation of a line: find y-intercept',
    operation: 'coordinate_geometry',
    grade: 9,
    standards: ['8.EE.B.6'],
    prerequisites: ['slope'],
  },
  {
    id: 'line_equation_slope',
    name: 'Equation of a line: find slope from equation',
    operation: 'coordinate_geometry',
    grade: 9,
    standards: ['8.EE.B.6'],
    prerequisites: ['line_equation_yintercept'],
  },
  {
    id: 'word_problem',
    name: 'Coordinate geometry word problems',
    operation: 'coordinate_geometry',
    grade: 10,
    standards: ['8.EE.B.5', '8.G.B.8'],
    prerequisites: ['line_equation_slope'],
  },
];
```

**Note on skill ID bare names:** Phase 82 used bare IDs (`one_step_addition`, not `linear_equations.one_step_addition`) per the STATE.md decision "Skill IDs use bare names". Use bare names here too: `'slope'`, `'distance'`, `'midpoint'`, etc.

**Note on prerequisites cross-domain:** The prerequisite `'two_step_mixed'` (linear equations skill) links coordinate geometry into the DAG. The prerequisite gating system looks up skill IDs globally across all domains.

### 3 Bug Patterns (COORD-02)

```typescript
// Source: pattern from src/services/mathEngine/bugLibrary/linearEquationsBugs.ts
export const COORDINATE_GEOMETRY_BUGS: readonly BugPattern[] = [
  {
    id: 'coord_slope_swapped_rise_run',
    operations: ['coordinate_geometry'],
    description:
      'Student swapped rise and run — divided the horizontal change by the vertical change instead of vertical over horizontal.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: string): number | null {
      // a = operands[0] = 1/(correct slope as float proxy) — set by slope generator
      // Returns the reciprocal-slope value
      return a !== 0 ? a : null;
    },
  },
  {
    id: 'coord_slope_sign_error',
    operations: ['coordinate_geometry'],
    description:
      'Student computed the correct magnitude of the slope but used the wrong sign — did not track direction of rise or run.',
    minDigits: 1,
    compute(a: number, b: number, _operation: string): number | null {
      // a = correct slope as float, b = negated slope stored in operands[1]
      return b !== a ? b : null;
    },
  },
  {
    id: 'coord_distance_forgot_sqrt',
    operations: ['coordinate_geometry'],
    description:
      'Student computed the sum of squared differences but forgot to take the square root at the final step.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: string): number | null {
      // a = operands[0] = d^2 (the un-rooted sum of squares)
      return a;
    },
  },
];
```

**Operand layout for generators:** Each generator must store the bug-distractor values in `operands`:
- **Slope generators:** `operands[0]` = run/rise (swapped ratio as float proxy), `operands[1]` = negative of correct slope float, `operands[2]` = correct slope float (informational)
- **Distance generators:** `operands[0]` = `dx^2 + dy^2` (forgot-sqrt result), `operands[1]` = distance (correct), `operands[2]` = unused
- **Midpoint generators:** `operands[0]` = wrong midpoint (e.g., only one coordinate halved), `operands[1]` = correct midpoint value, `operands[2]` = unused
- **Line equation generators:** `operands[0]` = wrong constant term, `operands[1]` = correct value

### Word Problem Templates (COORD-03)

```typescript
// Source: pattern from src/services/mathEngine/wordProblems/templates.ts (linear_equations section)
// Mode: 'prefix' — prepends context sentence before original geometry problem text
{
  id: 'wp_coord_map',
  operations: ['coordinate_geometry'],
  mode: 'prefix',
  template: '{name} is reading a map where each unit represents one kilometer.',
  question: '',
  minGrade: 8,
},
{
  id: 'wp_coord_city',
  operations: ['coordinate_geometry'],
  mode: 'prefix',
  template: '{name} is planning a walking route through {place}.',
  question: '',
  minGrade: 8,
},
{
  id: 'wp_coord_ramp',
  operations: ['coordinate_geometry'],
  mode: 'prefix',
  template: '{name} is checking the steepness of a ramp for a school project.',
  question: '',
  minGrade: 8,
},
{
  id: 'wp_coord_phone',
  operations: ['coordinate_geometry'],
  mode: 'prefix',
  template: '{name} is finding the distance between two phone towers on a grid.',
  question: '',
  minGrade: 9,
},
```

### Tutor Hint Framing (COORD-04)

No new tutor code is needed. Formula-identification framing comes from:

1. `bugDescription` strings in `COORDINATE_GEOMETRY_BUGS.description` — these are passed by the misconception detection layer to `buildHintPrompt` / `buildTeachPrompt` via `params.bugDescription`
2. The `operation: 'coordinate_geometry'` value signals algebraic geometry context to the LLM

The HINT-mode prompt rules already say "NEVER reveal the final answer." For coordinate geometry, Socratic hints should ask "What do we call the ratio of vertical change to horizontal change?" (for slope) and "What formula gives us the length of the hypotenuse from the two legs?" (for distance). These emerge naturally from `bugDescription` strings that reference the relevant formula concept without substitution steps.

**Manual QA required:** Per Phase 82 precedent, a manual QA checkpoint for 10+ Gemini Socratic hints in HINT mode is required in Plan 03. Coordinate geometry is also novel HS territory.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Grade max = 8 | Grade max = 12 | Phase 80 | G8-10 domain registers without type errors |
| No negative input on NumberPad | NumberPad ± key (FOUND-05) | Phase 80 | Generators can produce negative coordinate values |
| Default ±1 distractors for all domains | `distractorStrategy: 'domain_specific'` opt-out | Phase 80 | Coordinate geometry uses domain-specific wrong answers |
| `videoMap.ts` has `coordinate_geometry` key with TypeScript error | After adding to `MathDomain` union, error resolves | Phase 83 | Pre-existing TypeScript error cleaned up |
| `expressions` domain: one-step equations; `linear_equations`: G8-9 two-step | `coordinate_geometry`: G8-10 slope/distance/midpoint/line | Phase 83 | Separate domain for Elo tracking, BKT, prerequisite DAG |

**Deprecated/outdated:**
- Using numeric approximations for slope answers: always use `FractionAnswer` for slope so display shows exact fraction (e.g., `2/3`) not decimal (`0.6667`).

---

## Open Questions

1. **`prerequisiteGating.test.ts` hardcodes `151` (pre-Phase 82 count)**
   - What we know: Phase 82 updated `domainHandlerRegistry.test.ts` to `159` but did NOT update `prerequisiteGating.test.ts` from `151`
   - What's unclear: Whether this test is currently failing or was silently passing due to some other dynamic
   - Recommendation: In Wave 0, run `npm test -- --testPathPattern=prerequisiteGating` to verify current state; update the hardcoded count to `165` in Phase 83's Wave 0 stubs

2. **Cross-domain prerequisites: `two_step_mixed` (linear_equations) as a prereq for `slope`**
   - What we know: Prerequisite IDs are looked up globally by `isSkillUnlocked`; linear_equations uses bare ID `two_step_mixed`
   - What's unclear: Whether prerequisite gating correctly resolves cross-domain bare IDs (e.g., two domains using different bare IDs that collide)
   - Recommendation: Verify `SKILLS.find((s) => s.id === 'two_step_mixed')` returns the linear_equations skill; if there's a collision risk, use namespaced IDs for coordinate geometry skills (e.g., `coord_slope`)

3. **`FractionAnswer` distractor display in MC options**
   - What we know: `generateDistractors` pipeline works on `answerNumericValue(answer)` as float; distractor values are floats; MC renders distractor values via `answerDisplayValue()`
   - What's unclear: Whether the MC component calls `answerDisplayValue` for distractor display, or whether distractor floats (e.g., `0.667`) appear as ugly decimals in MC options
   - Recommendation: Read the session problem component (likely `src/components/session/`) early in Wave 0 to confirm how distractor values are rendered; if floats appear as-is, the distractor operand layout may need to store fraction numerators/denominators instead

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo (React Native Testing Library for components) |
| Config file | `jest.config.js` at repo root |
| Quick run command | `npm test -- --testPathPattern=coordinateGeometry` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COORD-01 | Domain handler generates valid problems for all 6 skills | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ Wave 0 |
| COORD-01 | Handler dispatch covers all 6 `domainConfig.type` values | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ Wave 0 |
| COORD-01 | All 6 skills registered in `SKILLS` array (count = 165) | unit (registry) | `npm test -- --testPathPattern=domainHandlerRegistry` | ✅ (update) |
| COORD-01 | Integer-only solutions for distance/midpoint across 20+ seeds | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ Wave 0 |
| COORD-02 | Slope answers are `FractionAnswer` type with reduced numerator/denominator | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ Wave 0 |
| COORD-02 | `distractorStrategy: 'domain_specific'` present on all 6 templates | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ Wave 0 |
| COORD-02 | Distractor generation returns coord-specific bug-pattern distractors | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ Wave 0 |
| COORD-03 | Word problem generation returns non-null for grades 8-10 | unit | `npm test -- --testPathPattern=wordProblems` | ✅ (update) |
| COORD-04 | `bugDescription` from bug patterns is non-empty string | unit | `npm test -- --testPathPattern=coordinateGeometry` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=coordinateGeometry`
- **Per wave merge:** `npm test -- --testPathPattern="coordinateGeometry|domainHandlerRegistry|wordProblems|prerequisiteGating"`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/coordinateGeometry.test.ts` — covers COORD-01, COORD-02, COORD-04
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — add `'coordinate_geometry'` to `ALL_OPERATIONS`; update skill count from `159` to `165`; add `coordinate_geometry: ['numeric', 'fraction']` to `expectedTypes`
- [ ] Update `src/__tests__/adaptive/prerequisiteGating.test.ts` — update skill count from `151` to `165` (fixes pre-existing discrepancy from Phase 82 + Phase 83 additions)
- [ ] Update `src/__tests__/mathEngine/wordProblems.test.ts` — add `'coordinate_geometry'` to `ALL_OPERATIONS`; add `coordinate_geometry: 8` to `gradeMap`

---

## Sources

### Primary (HIGH confidence)
- `src/services/mathEngine/types.ts` — `MathDomain`, `FractionAnswer`, `fractionAnswer()`, `answerNumericValue()`, `answerDisplayValue()`, `DistractorStrategy`, `DomainHandler`, `ProblemTemplate`, `SkillDefinition`
- `src/services/mathEngine/domains/linearEquations/linearEquationsHandler.ts` + `generators.ts` — canonical Phase 82 handler/generator pattern
- `src/services/mathEngine/domains/linearEquations/index.ts` + `skills/linearEquations.ts` + `templates/linearEquations.ts` — all structural patterns to replicate
- `src/services/mathEngine/bugLibrary/linearEquationsBugs.ts` — canonical bug pattern structure and operand-layout documentation convention
- `src/services/mathEngine/bugLibrary/distractorGenerator.ts` — `BUGS_BY_OPERATION` record, three-phase pipeline, `domain_specific` strategy
- `src/services/mathEngine/bugLibrary/validation.ts` — `ALLOWS_NEGATIVES` set (currently: `expressions`, `linear_equations`); must add `coordinate_geometry`
- `src/services/mathEngine/domains/fractions/utils.ts` — `gcd()` function for slope fraction reduction
- `src/services/mathEngine/wordProblems/templates.ts` (linear_equations section, lines 412-457) — prefix-mode template pattern
- `src/services/video/videoMap.ts` — `coordinate_geometry: 'N4nrdf0yYfM'` pre-existing entry; TypeScript error resolves when domain added to union
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — current `ALL_OPERATIONS` (19 items), hardcoded `159` skill count, `expectedTypes` map
- `src/__tests__/adaptive/prerequisiteGating.test.ts` — hardcoded `151` (pre-Phase 82 discrepancy, needs update to `165`)
- `src/__tests__/mathEngine/wordProblems.test.ts` — `ALL_OPERATIONS`, `gradeMap`, coverage assertions
- `.planning/REQUIREMENTS.md` — COORD-01 through COORD-04 definitions
- `.planning/STATE.md` — locked decisions: construction-from-answer, `distractorStrategy: 'domain_specific'`, bare skill IDs
- `.planning/phases/082-linear-equations-domain/082-RESEARCH.md` — definitive prior-art research for domain handler pattern
- `.planning/phases/082-linear-equations-domain/082-03-SUMMARY.md` — confirms prefix mode established as pattern, Phase 82 complete, prerequisiteGating.test.ts discrepancy

### Secondary (MEDIUM confidence)
- Common Core State Standards 8.EE.B.5 (graph proportional relationships, interpreting slope) — slope skill
- Common Core State Standards 8.EE.B.6 (use similar triangles to explain slope; derive y=mx+b) — line equation skills
- Common Core State Standards 8.G.B.8 (apply Pythagorean theorem to find distance between two points) — distance skill

### Tertiary (LOW confidence)
- None — all findings are grounded in codebase source files

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — directly read from source files; FractionAnswer type confirmed in types.ts
- Architecture: HIGH — exact Phase 82 pattern replication; all wiring points confirmed by reading registry, index, and test files
- Pitfalls: HIGH — TypeScript exhaustiveness errors, test hardcoded counts, negative distractor filtering, and float-sqrt issues all confirmed by direct source inspection
- Word problem prefix mode: HIGH — confirmed by reading generator.ts and 082-03-SUMMARY.md
- prerequisiteGating.test.ts discrepancy: HIGH — confirmed at line 42 (`expect(SKILLS.length).toBe(151)`)

**Research date:** 2026-03-13
**Valid until:** Stable — all patterns internal to codebase; no fast-moving external dependencies
