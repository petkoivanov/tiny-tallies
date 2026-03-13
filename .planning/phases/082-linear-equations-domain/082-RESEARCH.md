# Phase 82: Linear Equations Domain - Research

**Researched:** 2026-03-13
**Domain:** Math engine domain handler extension (linear equations, G8-9)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIN-01 | `linear_equations` domain handler — one-step, two-step, and multi-step equations with integer solutions (G8-9, 8 skills) | Full handler pattern documented; 8 skills mapped to CCSS 8.EE standards; construction-from-answer pattern applied |
| LIN-02 | Linear equation templates with algebra-aware distractor generation (wrong-operation, sign-flip, forgot-to-divide bug patterns) | `BugPattern` interface documented; `distractorStrategy: 'domain_specific'` flag blocks generic ±1 adjacency; 3 specific bug patterns specified |
| LIN-03 | Word problem variants for linear equations (age, distance, money contexts) | Word problem template mechanism documented; `'replace'` mode with algebra-appropriate contexts; 6 new templates specified |
| LIN-04 | AI tutor prompt guidance for linear equations (Socratic balance-model framing without revealing steps) | `buildHintPrompt` / `buildTeachPrompt` receive `operation: 'linear_equations'`; domain-specific `bugDescription` strings documented; balance-model framing approach specified |

</phase_requirements>

---

## Summary

Phase 82 adds the `linear_equations` domain to the existing math engine. The codebase already has 18 domains following a well-established pattern: a handler file dispatching on `domainConfig.type`, a generators file with construction-from-answer functions, a skills file with `SkillDefinition[]`, a templates file with `ProblemTemplate[]`, and a bug patterns file with `BugPattern[]`. All of these must be wired into the existing index/registry files.

The phase has four requirements: the domain handler itself (LIN-01), algebra-aware distractor generation via new bug patterns (LIN-02), word problem templates for algebra contexts (LIN-03), and AI tutor prompt enrichment via `bugDescription` strings passed to the existing `buildHintPrompt`/`buildTeachPrompt` functions (LIN-04). No new answer types are needed; all linear equation answers are `NumericAnswer` (integer solutions only).

The key architectural decision already locked in the project is `distractorStrategy: 'domain_specific'` on all linear equation templates — this blocks the generic ±1 adjacency phase in `generateDistractors`, ensuring algebra-specific wrong answers (wrong-operation, sign-flip, forgot-to-divide) fill all three distractor slots. The domainHandlerRegistry test hardcodes `ALL_OPERATIONS` and a skill count of 151, so both will need updating.

**Primary recommendation:** Follow the expressions/exponents domain pattern exactly. Create `src/services/mathEngine/domains/linearEquations/` with `linearEquationsHandler.ts`, `generators.ts`, and `index.ts`; create matching files in `bugLibrary/`, `skills/`, and `templates/`; wire everything into the four index files and the registry; update the word problem templates; update the domainHandlerRegistry test.

---

## Standard Stack

### Core
| Library / System | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `src/services/mathEngine/types.ts` | current | `NumericAnswer`, `DomainHandler`, `ProblemTemplate`, `DistractorStrategy` | All domain handlers use these types |
| `src/services/mathEngine/seededRng.ts` | current | Deterministic RNG via `SeededRng` | Required for reproducible problem generation |
| `src/services/tutor/promptTemplates.ts` | current | `buildHintPrompt`, `buildTeachPrompt`, `buildBoostPrompt` | AI tutor uses `operation` + `bugDescription` fields from these functions |

### Supporting
| System | Purpose | When to Use |
|---------|---------|-------------|
| `distractorStrategy: 'domain_specific'` flag on `ProblemTemplate` | Skips ±1 adjacency phase; forces domain-specific bug patterns to fill all slots | All linear equations templates |
| `BugPattern.compute(a, b, operation)` | Receives `operands[0]` and `operands[1]` from the generated problem | Encodes algebra bug patterns that compute plausible wrong answers |
| Word problem `'replace'` mode | Full narrative replaces `questionText` | Linear equations benefit from replace mode with variables embedded in story |

---

## Architecture Patterns

### Recommended Project Structure

```
src/services/mathEngine/
├── domains/
│   └── linearEquations/          # NEW
│       ├── index.ts               # barrel export
│       ├── linearEquationsHandler.ts  # DomainHandler impl
│       └── generators.ts          # 8 generator functions
├── bugLibrary/
│   └── linearEquationsBugs.ts    # NEW — 3 BugPattern entries
├── skills/
│   └── linearEquations.ts        # NEW — 8 SkillDefinition entries
└── templates/
    └── linearEquations.ts        # NEW — 8+ ProblemTemplate entries
```

Plus edits to:
- `domains/index.ts` — export `linearEquationsHandler`
- `domains/registry.ts` — add `linear_equations: linearEquationsHandler` to `HANDLERS`
- `bugLibrary/index.ts` — export `LINEAR_EQUATIONS_BUGS`, add to `BUGS_BY_OPERATION`
- `bugLibrary/distractorGenerator.ts` — add `linear_equations: LINEAR_EQUATIONS_BUGS` entry
- `skills/index.ts` — import and spread `LINEAR_EQUATIONS_SKILLS` into `SKILLS`
- `templates/index.ts` — import and spread `LINEAR_EQUATIONS_TEMPLATES` into `ALL_TEMPLATES`
- `wordProblems/templates.ts` — add 6 new word problem templates
- `types.ts` — add `'linear_equations'` to `MathDomain` union

### Pattern 1: Construction-from-Answer Generator

All domain generators build the problem from the answer outward (never compute an answer by parsing an expression). For linear equations this means: pick the solution `x` first, then construct the equation that has `x` as its root.

```typescript
// Source: src/services/mathEngine/domains/expressions/generators.ts (generateOneStepEquation)
export function generateOneStepAddition(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Pick answer first
  const x = rng.intRange(2, 20);         // integer solution
  const b = rng.intRange(1, 15);
  const sum = x + b;                      // build equation from answer
  return {
    operands: [x, b, sum],               // operands[0] = answer, [1] = b, [2] = rhs
    correctAnswer: numericAnswer(x),
    questionText: `x + ${b} = ${sum}. Solve for x.`,
    metadata: {},
  };
}
```

**Why operands layout matters:** `BugPattern.compute(a, b, operation)` receives `operands[0]` and `operands[1]`. The bug patterns must be designed around the chosen operand layout.

### Pattern 2: Handler Dispatch on `domainConfig.type`

```typescript
// Source: src/services/mathEngine/domains/expressions/expressionsHandler.ts
type LinearEquationsType =
  | 'one_step_add_sub'
  | 'one_step_mul_div'
  | 'two_step_add_mul'
  | 'two_step_sub_div'
  | 'two_step_mixed'
  | 'multi_step'
  | 'word_problem_age'
  | 'word_problem_distance';

export const linearEquationsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const config = template.domainConfig as { type: LinearEquationsType };
    switch (config.type) {
      case 'one_step_add_sub': return generateOneStepAddSub(template, rng);
      // ...
      default: throw new Error(`Unknown linear equations type: ${config.type}`);
    }
  },
};
```

### Pattern 3: Adding to `MathDomain` Union and Registry

The `MathDomain` type in `types.ts` is a string literal union. Adding `'linear_equations'` cascades automatically to `BUGS_BY_OPERATION` (which is `Record<MathDomain, readonly BugPattern[]>`) — TypeScript will require an entry be added there too.

```typescript
// types.ts — add to union
export type MathDomain =
  | 'addition'
  // ... existing 18 ...
  | 'linear_equations';  // NEW

// registry.ts — add to HANDLERS
const HANDLERS: Record<MathDomain, DomainHandler> = {
  // ... existing ...
  linear_equations: linearEquationsHandler,
};

// distractorGenerator.ts — add to BUGS_BY_OPERATION
const BUGS_BY_OPERATION: Record<MathDomain, readonly BugPattern[]> = {
  // ... existing ...
  linear_equations: LINEAR_EQUATIONS_BUGS,
};
```

### Pattern 4: BugPattern Operand Convention

Bug patterns receive `operands[0]` as `a` and `operands[1]` as `b`. For linear equations the recommended operand layout is:

- `operands[0]` = the wrong-operation result (e.g., answer if student adds instead of subtracts)
- `operands[1]` = the coefficient / RHS constant
- `operands[2]` = the correct answer `x`

This matches how expressionsBugs uses `operands[0]` for the left-to-right result distractor.

For two-step and multi-step equations, `operands[0]` = result of "forgot to divide" (only applying subtraction, not the division step), which is the most common algebra misconception.

### Pattern 5: `distractorStrategy: 'domain_specific'` on Templates

All linear equation templates should set this flag. The generic ±1 adjacent phase is pedagogically useless for algebra (x = 7 and x = 8 are equally plausible to a student, whereas sign-flipped or wrong-operation results are actually what students compute).

```typescript
{
  id: 'lin_one_step_add',
  operation: 'linear_equations',
  skillId: 'linear_equations.one-step-addition',
  grades: [8],
  baseElo: 1000,
  digitCount: 1,
  distractorStrategy: 'domain_specific',  // blocks ±1 adjacency
  domainConfig: { type: 'one_step_add_sub' },
  standards: ['8.EE.C.7'],
}
```

### Anti-Patterns to Avoid

- **Don't let the LLM compute answers.** The `generate()` function must compute `correctAnswer` programmatically. LLM is only used in prompt enrichment (bugDescription strings).
- **Don't use `Expression` answer type.** All linear equation answers are `NumericAnswer` (integer solutions only). Phase 82 does not include symbolic manipulation.
- **Don't use `distractorStrategy: 'default'`** on linear equation templates. ±1 adjacency distractors are not algebra-meaningful.
- **Don't allow non-integer solutions.** Generators must constrain RNG ranges so `x` is always an integer. For two-step: choose `x`, choose `b`, set `a = coefficient` such that `a*x + b = rhs` produces integer `rhs` only.
- **Don't negative-x without care.** Grade 8-9 students should encounter negative solutions — the NumberPad ± key (FOUND-05) handles input. Generators CAN produce `x < 0` for harder skills.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Seeded randomness | Custom RNG | `rng.intRange(min, max)`, `rng.next()` from `SeededRng` | Determinism required; same seed = same problem |
| Distractor generation | Custom wrong-answer picker | `BugPattern.compute` + existing `generateDistractors` pipeline | Three-phase pipeline already handles dedup, validity, fallback |
| AI tutor prompts | New prompt builder | Pass `operation: 'linear_equations'` + `bugDescription` string to existing `buildHintPrompt` / `buildTeachPrompt` | All safety rules, word limits, and misconception context already baked in |
| Word problem injection | Inline narrative generation | Add entries to `WORD_PROBLEM_TEMPLATES` in `wordProblems/templates.ts` | `generateWordProblem` already filters by operation and grade |
| Answer display for BOOST | Custom formatting | `answerDisplayValue(problem.correctAnswer)` already returns `String(numericValue)` | Existing utility handles all answer types |

**Key insight:** Every hook — distractor generation, word problems, tutor prompts, safety pipeline — already works with any `MathDomain` string. Adding `'linear_equations'` to the union and registering the handler is the entire integration surface.

---

## Common Pitfalls

### Pitfall 1: `BUGS_BY_OPERATION` TypeScript Error After Adding to `MathDomain`

**What goes wrong:** TypeScript requires `Record<MathDomain, readonly BugPattern[]>` to be exhaustive. Adding `'linear_equations'` to the union immediately breaks `distractorGenerator.ts` with a type error.
**Why it happens:** `Record<K, V>` enforces all keys. The compiler error appears in `distractorGenerator.ts`, not in `types.ts`.
**How to avoid:** Add `linear_equations: LINEAR_EQUATIONS_BUGS` to `BUGS_BY_OPERATION` in the same wave as adding the union member.
**Warning signs:** `npm run typecheck` fails with "Property 'linear_equations' is missing in type..."

### Pitfall 2: `domainHandlerRegistry.test.ts` Hardcodes 18 Operations and Skill Count 151

**What goes wrong:** The test explicitly checks `ALL_OPERATIONS` has 18 items and `SKILLS.length === 151`.
**Why it happens:** The test was written with exact counts for regression detection.
**How to avoid:** Update `ALL_OPERATIONS` array in the test to include `'linear_equations'`, update the skill count assertion from `151` to `151 + 8 = 159`.
**Warning signs:** `npm test -- --testPathPattern=domainHandlerRegistry` fails with "Expected: 151, Received: 159".

### Pitfall 3: Two-Step Generator Integer Solution Constraint

**What goes wrong:** Generating `ax + b = c` by picking `a`, `b`, `c` randomly often yields fractional solutions.
**Why it happens:** `x = (c - b) / a` requires `(c - b)` to be divisible by `a`.
**How to avoid:** Use construction-from-answer pattern: pick `x` first, then pick `a` and `b`, set `c = a*x + b`. The result is always integer.
**Warning signs:** `numericAnswer` receives a float; `checkAnswerLeak` regex may misfire on decimal strings.

### Pitfall 4: Sign-Flip Bug Pattern Needs Negative Validation

**What goes wrong:** The sign-flip pattern (wrong answer = `−x` instead of `x`) produces a negative distractor. `isValidDistractor` may reject negatives for certain operations.
**Why it happens:** `validation.ts` `isValidDistractor` checks `operation` to decide if negatives are allowed. `linear_equations` needs to be whitelisted.
**How to avoid:** Verify `isValidDistractor` source — if it uses a hard-coded allowlist of operations where negatives are valid, add `linear_equations` to it.
**Warning signs:** Negative distractors silently dropped; only 1-2 distractors generated instead of 3.

### Pitfall 5: Word Problem Operand Mismatch

**What goes wrong:** `generateWordProblem` passes `operands[0]` as `a` and `operands[1]` as `b` to template strings. If these are internal-only values (e.g., wrong-operation result), the word problem narrative reads nonsensically.
**Why it happens:** Word problem templates assume operands are displayable quantities.
**How to avoid:** For linear equations, use `mode: 'prefix'` (like ratios/geometry do) to prepend a context sentence before the original equation text, OR ensure `operands[0]` / `operands[1]` are the displayable coefficient and constant.
**Warning signs:** Word problem text contains "7 apples and 14 apples" when the problem is "3x + 5 = 14, solve for x".

### Pitfall 6: AI Tutor Balance-Model Framing Requires `bugDescription` Strings

**What goes wrong:** The tutor gives generic "try again" hints rather than balance-model framing.
**Why it happens:** `buildHintPrompt` uses `params.bugDescription` (if present) to steer the LLM. If no `bugDescription` is supplied for algebra bugs, the LLM defaults to generic framing.
**How to avoid:** Bug pattern `description` fields in `LINEAR_EQUATIONS_BUGS` serve as the `bugDescription` passed by the misconception detection layer. Descriptions must explicitly mention balance (e.g., "applied the operation to only one side of the equation").
**Warning signs:** LLM hint output during manual QA does not reference the balance model.

---

## Code Examples

### 8 Skills for the Domain

```typescript
// Source: pattern from src/services/mathEngine/skills/expressions.ts
export const LINEAR_EQUATIONS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'linear_equations.one-step-addition',
    name: 'One-step equations: addition/subtraction',
    operation: 'linear_equations',
    grade: 8,
    standards: ['8.EE.C.7b'],
    prerequisites: ['expressions.one-step-equation'],
  },
  {
    id: 'linear_equations.one-step-multiplication',
    name: 'One-step equations: multiplication/division',
    operation: 'linear_equations',
    grade: 8,
    standards: ['8.EE.C.7b'],
    prerequisites: ['linear_equations.one-step-addition'],
  },
  {
    id: 'linear_equations.two-step-add-mul',
    name: 'Two-step equations: addition + multiplication',
    operation: 'linear_equations',
    grade: 8,
    standards: ['8.EE.C.7b'],
    prerequisites: ['linear_equations.one-step-multiplication'],
  },
  {
    id: 'linear_equations.two-step-sub-div',
    name: 'Two-step equations: subtraction + division',
    operation: 'linear_equations',
    grade: 8,
    standards: ['8.EE.C.7b'],
    prerequisites: ['linear_equations.two-step-add-mul'],
  },
  {
    id: 'linear_equations.two-step-mixed',
    name: 'Two-step equations: mixed operations',
    operation: 'linear_equations',
    grade: 8,
    standards: ['8.EE.C.7b'],
    prerequisites: ['linear_equations.two-step-sub-div'],
  },
  {
    id: 'linear_equations.multi-step',
    name: 'Multi-step equations with integer solutions',
    operation: 'linear_equations',
    grade: 9,
    standards: ['8.EE.C.7a'],
    prerequisites: ['linear_equations.two-step-mixed'],
  },
  {
    id: 'linear_equations.negative-solution',
    name: 'Equations with negative integer solutions',
    operation: 'linear_equations',
    grade: 8,
    standards: ['8.EE.C.7b'],
    prerequisites: ['linear_equations.one-step-multiplication'],
  },
  {
    id: 'linear_equations.word-problem',
    name: 'Linear equation word problems',
    operation: 'linear_equations',
    grade: 9,
    standards: ['8.EE.C.7'],
    prerequisites: ['linear_equations.two-step-mixed'],
  },
];
```

### Bug Patterns (LIN-02)

```typescript
// Source: pattern from src/services/mathEngine/bugLibrary/exponentsBugs.ts
export const LINEAR_EQUATIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'lin_wrong_operation',
    operations: ['linear_equations'],
    description: 'Applied the inverse operation in the wrong direction (added instead of subtracted, or vice versa) without maintaining balance on both sides',
    minDigits: 1,
    compute(a, _b, _op) {
      // a = wrong-operation result stored in operands[0]
      return a;
    },
  },
  {
    id: 'lin_sign_flip',
    operations: ['linear_equations'],
    description: 'Flipped the sign of the constant when moving it across the equals sign (e.g., x + 5 = 12 → x = 12 + 5)',
    minDigits: 1,
    compute(a, b, _op) {
      // a = correct answer x, b = constant being moved
      // sign-flip: answer = x + 2*b (moved b to wrong side with same sign)
      const wrong = a + 2 * b;
      return wrong !== a ? wrong : null;
    },
  },
  {
    id: 'lin_forgot_to_divide',
    operations: ['linear_equations'],
    description: 'Subtracted the constant correctly but forgot to divide by the coefficient (left ax instead of x)',
    minDigits: 1,
    compute(a, b, _op) {
      // a = forgot-to-divide result (c - constant, before dividing by coefficient)
      // stored in operands[0] by two-step generators
      return a !== b ? a : null;
    },
  },
];
```

**Note on operand layout:** Each generator function must encode the relevant wrong-operation result in `operands[0]` and `operands[1]` so `compute(a, b)` can access them. The exact layout depends on problem type and should be consistent within each generator. Document the layout in a comment at the top of the generator.

### Word Problem Templates (LIN-03)

```typescript
// Source: pattern from src/services/mathEngine/wordProblems/templates.ts
// Mode: 'prefix' — prepends context before original equation text
{
  id: 'wp_lin_age',
  operations: ['linear_equations'],
  mode: 'prefix',
  template: '{name} is trying to figure out an age problem.',
  question: '',
  minGrade: 8,
},
{
  id: 'wp_lin_distance',
  operations: ['linear_equations'],
  mode: 'prefix',
  template: '{name} is calculating distance for a trip.',
  question: '',
  minGrade: 8,
},
{
  id: 'wp_lin_money',
  operations: ['linear_equations'],
  mode: 'prefix',
  template: '{name} is working out the cost of items at {place}.',
  question: '',
  minGrade: 8,
},
```

**Note:** Use `mode: 'prefix'` for all linear equations word problem templates. The equation text (e.g., "3x + 5 = 14. Solve for x.") is already precise — a replace-mode template would require embedding the equation expression inside the narrative, which complicates the template-variable system. Prefix mode appends the scene-setting sentence before the existing equation.

### Tutor Hint Framing (LIN-04)

The existing `buildHintPrompt` function already passes `operation` and `bugDescription` to the LLM. No new tutor code is needed. The balance-model framing comes from:

1. `bugDescription` strings in `LINEAR_EQUATIONS_BUGS.description` (e.g., "Applied the inverse operation without maintaining balance on both sides")
2. The `operation: 'linear_equations'` value in the prompt, which signals to the LLM the algebraic context

The hint prompt system instruction already says "NEVER reveal the final answer." For linear equations, the TEACH mode prompt will show step-by-step inverse operations. The domain does not need a custom system instruction — the existing `buildTeachSystemInstruction` handles it.

Manual QA is required per the concern logged in STATE.md: "Manual review of 10+ Gemini Socratic hint outputs required before Phase 82 ships (algebra hints are novel territory)."

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Grade max = 8 | Grade max = 12 (`MAX_GRADE = 12`) | Phase 80 | G8-9 domain can now be registered without type errors |
| No negative number input | NumberPad ± key (FOUND-05) | Phase 80 | Generators can produce negative-solution problems |
| Default ±1 distractors for all domains | `distractorStrategy: 'domain_specific'` opt-out | Phase 80 | Algebra domains can skip meaningless adjacent distractors |
| `expressions` domain covers one-step equations | `linear_equations` domain for full G8-9 algebra | Phase 82 | Separate domain for Elo tracking, BKT, and prerequisite DAG |

**Deprecated/outdated:**
- Using `expressions` domain for G8+ linear equations: the `expressions` domain covers G5-6 order of operations and one-step equations. G8-9 two-step and multi-step equations belong in `linear_equations` with its own Elo and BKT tracking.
- `distractorStrategy: 'default'` for algebra domains: always use `'domain_specific'` for linear equations.

---

## Open Questions

1. **`isValidDistractor` allowlist for negatives**
   - What we know: `validation.ts` contains `isValidDistractor`; `distractorGenerator.ts` passes `operation` to it; `allowNegative` in the random phase is set for `subtraction`, `expressions`, and when `correctAnswer < 0`
   - What's unclear: Whether the `isValidDistractor` function also has operation-based negative checks that need updating (not read above — only the random phase logic was reviewed)
   - Recommendation: Read `src/services/mathEngine/bugLibrary/validation.ts` early in Wave 0 and add `'linear_equations'` to any negative-allowlist

2. **Skill count assertion in `domainHandlerRegistry.test.ts`**
   - What we know: Currently asserts `SKILLS.length === 151`
   - What's unclear: Whether any other tests also hardcode this number
   - Recommendation: Search for `151` in test files before writing Wave 0 stubs; update all occurrences

3. **Word problem operand display for two-step equations**
   - What we know: `generateWordProblem` uses `operands[0]` as `{a}` and `operands[1]` as `{b}` in template strings; for linear equations these are internal bug-distractor values, not display quantities
   - What's unclear: Whether `mode: 'prefix'` completely sidesteps this (prefix mode ignores `{a}` / `{b}`)
   - Recommendation: Use `mode: 'prefix'` for all linear equation word problem templates; confirm by tracing the prefix branch in `generator.ts` (`return { text, question: originalQuestionText }` — yes, it ignores `{a}`/`{b}`)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo (React Native Testing Library for components) |
| Config file | `jest.config.js` at repo root |
| Quick run command | `npm test -- --testPathPattern=linearEquations` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIN-01 | Domain handler generates valid problems for all 8 skills | unit | `npm test -- --testPathPattern=linearEquations` | ❌ Wave 0 |
| LIN-01 | Handler dispatch covers all `domainConfig.type` values | unit | `npm test -- --testPathPattern=linearEquations` | ❌ Wave 0 |
| LIN-01 | All 8 skills registered in `SKILLS` array | unit (registry) | `npm test -- --testPathPattern=domainHandlerRegistry` | ✅ (update) |
| LIN-01 | Integer-only solutions across 20+ seeds | unit | `npm test -- --testPathPattern=linearEquations` | ❌ Wave 0 |
| LIN-02 | Distractor generation returns algebra-specific bug-pattern distractors | unit | `npm test -- --testPathPattern=linearEquations` | ❌ Wave 0 |
| LIN-02 | `distractorStrategy: 'domain_specific'` prevents ±1 adjacency distractors | unit (distractor) | `npm test -- --testPathPattern=distractorGenerator` | ✅ (update) |
| LIN-03 | Word problem generation returns non-null for grade 8-9 | unit | `npm test -- --testPathPattern=wordProblems` | ✅ (update) |
| LIN-04 | `bugDescription` from bug patterns is non-empty string | unit | `npm test -- --testPathPattern=linearEquations` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=linearEquations`
- **Per wave merge:** `npm test -- --testPathPattern="linearEquations|domainHandlerRegistry|distractorGenerator|wordProblems"`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/linearEquations.test.ts` — covers LIN-01, LIN-02, LIN-04
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — add `'linear_equations'` to `ALL_OPERATIONS`, update skill count from 151 to 159
- [ ] Update `src/__tests__/mathEngine/wordProblems.test.ts` — add `linear_equations` operation coverage assertion

---

## Sources

### Primary (HIGH confidence)
- `src/services/mathEngine/types.ts` — `MathDomain`, `Answer`, `DistractorStrategy`, `DomainHandler`, `ProblemTemplate`, `SkillDefinition` interfaces
- `src/services/mathEngine/domains/expressions/expressionsHandler.ts` + `generators.ts` — canonical handler/generator pattern
- `src/services/mathEngine/domains/exponents/generators.ts` — construction-from-answer pattern
- `src/services/mathEngine/bugLibrary/distractorGenerator.ts` — three-phase distractor assembly, `BUGS_BY_OPERATION` record, `domain_specific` strategy
- `src/services/mathEngine/bugLibrary/types.ts` — `BugPattern` interface
- `src/services/mathEngine/wordProblems/generator.ts` + `templates.ts` — word problem system, prefix mode
- `src/services/tutor/promptTemplates.ts` — `buildHintPrompt`, `buildTeachPrompt`, `buildBoostPrompt`
- `src/services/tutor/types.ts` — `PromptParams`, `AgeBracket`
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — hardcoded 18 operations and 151 skill count
- `.planning/REQUIREMENTS.md` — LIN-01 through LIN-04 definitions
- `.planning/STATE.md` — locked decisions: construction-from-answer, `distractorStrategy: 'domain_specific'`, manual QA concern

### Secondary (MEDIUM confidence)
- Common Core State Standards 8.EE.C.7 (solve linear equations in one variable) — standard IDs `8.EE.C.7`, `8.EE.C.7a`, `8.EE.C.7b` used in skill definitions above; these match the established standards pattern in the codebase
- Common Core 8.EE.C.7a (give examples of linear equations with one solution, no solution, or infinitely many solutions) — multi-step skill maps here

### Tertiary (LOW confidence)
- None — all findings are grounded in codebase source files

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — directly read from source files
- Architecture: HIGH — extrapolated from three complete existing domain implementations (expressions, exponents, ratios)
- Pitfalls: HIGH — TypeScript exhaustiveness errors and test hardcoded counts confirmed by direct inspection
- Word problem prefix mode: HIGH — confirmed by reading generator.ts prefix branch

**Research date:** 2026-03-13
**Valid until:** Stable (no fast-moving dependencies; all patterns internal to codebase)
