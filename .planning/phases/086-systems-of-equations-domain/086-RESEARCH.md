# Phase 86: Systems of Equations Domain - Research

**Researched:** 2026-03-13
**Domain:** Systems of linear equations (2×2), substitution, elimination, integer solutions
**Confidence:** HIGH

---

## Summary

Phase 86 adds `systems_equations` as the 23rd `MathDomain` to Tiny Tallies. It follows the exact same three-plan HS domain pattern established in Phases 82-85: Plan 01 (RED test stubs), Plan 02 (core domain wiring), Plan 03 (word problem prefix templates). All domain infrastructure files, wiring registries, and test count thresholds are fully understood from the prior phases.

The primary architectural decision for this phase is the **answer representation for a two-variable solution (x, y)**. After reviewing all four options against the existing type system, the recommended approach is **Option A: ask for one variable per problem, embed the other in problem text**. This keeps the answer type as `numericAnswer`, avoids any new UI work, and produces two clean distractor problems per system (one for x, one for y). Phase 87 (Quadratic Equations) uses `MultiSelectAnswer` for two roots — systems equations should NOT use that path because (x, y) values are not an unordered set; order matters and they are best tested independently.

The construction-from-answer pattern is straightforward for 2×2 systems: pick solution (x, y) first, choose small coefficients a, b, d, e ∈ [1,4], derive constants c = ax+by and f = dx+ey, then verify det(ad-bd) ≠ 0. This guarantees integer solutions with no solver logic anywhere in the engine.

**Primary recommendation:** Use `numericAnswer` for all 5 skills. Ask for x in some problems and y in others; embed the other value in the problem text for the word problem skill. This is the simplest, most testable approach with zero new UI requirements.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SYS-01 | `systems_equations` domain handler — 2×2 linear systems with integer solutions via substitution and elimination (G9-10, 5 skills) | Construction-from-answer pattern verified; 5 skills designed with Common Core HSA-REI.C.6 coverage |
| SYS-02 | Systems templates with algebra-aware distractor generation (swapped-variable, sign-error bug patterns) | 3 bug patterns identified; operand layout for distractors designed |
| SYS-03 | Word problem variants for systems (two-variable real-world scenarios) | 3 prefix-mode word problem templates at minGrade 9-10 designed |
| SYS-04 | AI tutor prompt guidance for systems of equations | Socratic framing documented; Pitfall: never name the method step, ask "what is the coefficient of x in this equation?" instead |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `numericAnswer` factory | (project-local) | Answer type for all 5 skills | All prior single-variable HS answers use this type; no new type needed |
| `SeededRng.intRange` | (project-local) | Deterministic integer generation | All domain generators use this; ensures reproducible seeds |
| `distractorStrategy: 'domain_specific'` | (project-local) | Suppress ±1 adjacency distractors | Same as all HS domains — swap/sign distractors are semantically meaningful |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Unicode minus U+2212 `−` | N/A | Subtraction sign in question text | Used in linear_equations generators — use the same convention |
| `prefix` word problem mode | (project-local) | Scene-setting without `{a}/{b}` operand substitution | Required for all HS domain word problems (Pitfall 5 from prior phases) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| numericAnswer (ask for x only) | MultiSelectAnswer [x, y] | MultiSelect requires student to select both; for systems this means putting both values into an unordered set — but (x,y) has semantic identity. More importantly, MultiSelect requires the `MultiSelectMC` UI component; asking for x alone uses the existing NumberPad flow with zero UI work |
| Two separate problems (x then y) | Single problem asking for x, y embedded | Two problems per system wastes skill coverage on pure repetition; the sys_word_problem skill already validates the two-variable framing |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/services/mathEngine/
├── domains/systemsEquations/        # NEW — matches prior HS domain layout
│   ├── generators.ts                # 5 generators (one per skill)
│   ├── systemsEquationsHandler.ts   # DomainHandler switch on domainConfig.type
│   └── index.ts                     # barrel: export { systemsEquationsHandler }
├── skills/systemsEquations.ts       # NEW — SYSTEMS_EQUATIONS_SKILLS (5 skills)
├── templates/systemsEquations.ts    # NEW — SYSTEMS_EQUATIONS_TEMPLATES (5 templates)
└── bugLibrary/systemsEquationsBugs.ts  # NEW — 3 bug patterns
```

Plus wiring updates in 6 existing files (types.ts, domains/index.ts, domains/registry.ts, skills/index.ts, templates/index.ts, bugLibrary/index.ts) and the videoMap uncomment.

### Pattern 1: Construction-From-Answer for 2×2 Systems
**What:** Pick integer solution (x, y) first. Choose coefficients, compute constants. Verify determinant ≠ 0.
**When to use:** All 5 skill generators.

```typescript
// Source: project pattern from linearEquations/generators.ts and sequencesSeries/generators.ts
// Construction-from-answer: pick x, y first — NEVER solve the system

function generateSubstitutionSimple(_template: ProblemTemplate, rng: SeededRng): DomainProblemData {
  // Pick integer solution
  const x = rng.intRange(1, 8);
  const y = rng.intRange(1, 8);

  // Eq1: y = mx + b (isolates y — substitution_simple form)
  const m = rng.intRange(1, 3);   // coefficient ∈ [1,3] to keep y small
  const b = y - m * x;            // derived: ensures eq1 is satisfied

  // Eq2: dx + ey = f
  const d = rng.intRange(1, 4);
  const e = rng.intRange(1, 4);
  const f = d * x + e * y;

  // Overflow check: max f = 4*8 + 4*8 = 64  (safe)
  // Verify det ≠ 0: det(e1=y-mx → coeffs [m,-1], e2=[d,e]) = m*e - (-1)*d = me+d ≠ 0
  // Since m ≥ 1 and e ≥ 1, me+d ≥ 2 — det is always nonzero.

  // Distractors
  const swappedAnswer = y;         // student solved for y but reported it as x
  const signFlippedAnswer = -x;    // sign error during elimination step

  return {
    operands: [swappedAnswer, signFlippedAnswer, x],
    correctAnswer: numericAnswer(x),
    questionText: `y = ${m}x + ${b < 0 ? `(${b})` : b}\n${d}x + ${e}y = ${f}\nSolve for x.`,
    metadata: {},
  };
}
```

### Pattern 2: Determinant Safety for Elimination Skills
**What:** For elimination_add and elimination_multiply, the two equations share a coefficient pair that cancels. Since we build both equations from the known (x, y), any nonzero coefficients guarantee det ≠ 0 as long as the two equations are not proportional.

**How to ensure non-proportional equations:**
- For elimination_add: use `a` and `-a` as the opposing coefficient pair for one variable (e.g., `a` on y in eq1, `-a` on y in eq2). Then choose different non-proportional coefficients for x in each equation.
- Proportionality check: equations are proportional iff (a1/a2 = b1/b2 = c1/c2). Since we pick x-coefficients independently from [1,4] with the constraint they differ, proportionality is practically impossible.

```typescript
// Source: construction-from-answer pattern
function generateEliminationAdd(_template: ProblemTemplate, rng: SeededRng): DomainProblemData {
  const x = rng.intRange(1, 8);
  const y = rng.intRange(1, 8);

  // Choose x-coefficients so they differ (ensures non-proportional)
  const a = rng.intRange(1, 4);
  let d = rng.intRange(1, 4);
  if (d === a) d = (d % 4) + 1;  // nudge to ensure d ≠ a

  // Eq1: ax + ky = c1  where k cancels with eq2
  const k = rng.intRange(1, 4);
  const c1 = a * x + k * y;

  // Eq2: dx - ky = c2  (opposite k coefficient — direct addition cancels y)
  const c2 = d * x - k * y;

  // Adding eq1 + eq2: (a+d)x = c1+c2  →  x = (c1+c2)/(a+d) — exact integer ✓

  const swappedAnswer = y;
  const addedInsteadOfSubtracted = d * x + k * y;  // used eq2 as dx+ky instead of dx-ky

  return {
    operands: [swappedAnswer, addedInsteadOfSubtracted, x],
    correctAnswer: numericAnswer(x),
    questionText: `${a}x + ${k}y = ${c1}\n${d}x \u2212 ${k}y = ${c2}\nSolve for x.`,
    metadata: {},
  };
}
```

### Pattern 3: Skill ID Naming Convention
Following `[Phase 082]` decision: bare names, not namespaced.

| Skill ID | Analogue |
|----------|---------|
| `substitution_simple` | `one_step_addition` |
| `substitution_general` | `two_step_add_mul` |
| `elimination_add` | `multi_step` |
| `elimination_multiply` | `multi_step` (harder) |
| `sys_word_problem` | `seq_word_problem` / `stats_word_problem` |

### Pattern 4: gradeMap Entry
All HS domains have a `gradeMap` entry in the prerequisite gating. Based on the State.md decision for statistics_hs: `systems_equations` gradeMap entry is `9` (Common Core HSA-REI.C.6 starts grade 9).

### Anti-Patterns to Avoid
- **Using CoordinateAnswer for (x,y):** The type exists but it's for coordinate pair display (e.g. midpoints), not two-variable algebra solutions. Students would see two inputs and need `CoordinateInputPad`, which does not exist.
- **Using MultiSelectAnswer for [x,y]:** MultiSelect uses `setsEqual()` which is order-independent — {x,y} and {y,x} would both score correct. For systems, x=3 and y=5 are different variables; asking separately avoids all ambiguity.
- **Computing solution (x,y) by solving:** NEVER. Always pick x and y first, then build the problem. The engine must never solve equations.
- **b negative without parentheses:** When b = y - m*x is negative, render as `(${b})` or use Unicode minus to avoid `y = 3x + -2` display bugs.
- **Determinant = 0:** Must guard against proportional equations. For substitution_simple this cannot happen (y is isolated). For elimination forms, the construction approach makes it practically impossible if coefficients are chosen independently.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Negative coefficient display | Custom formatting logic | Inline conditional in template string | All prior HS generators use `unicode minus + string template` pattern |
| Distractor generation | Custom deduplication | Existing `distractorGenerator.ts` with `distractorStrategy: 'domain_specific'` | distractorGenerator already handles validation, deduplication, and padding |
| Two-variable grading | New grader/UI | `numericAnswer` + ask for one variable per problem | Avoids all new UI; two-variable UI would need a new input component |
| Determinant verification | Algebraic solver | Construction-from-answer makes det ≠ 0 structurally guaranteed | See Pattern 2 |

**Key insight:** The construction-from-answer pattern eliminates all need for a solver or algebraic verifier. Every problem is structurally correct by construction.

---

## Common Pitfalls

### Pitfall 1: Negative b in "y = mx + b" question text
**What goes wrong:** When b = y - m*x is negative, naive template produces `y = 3x + -2`.
**Why it happens:** JavaScript string interpolation doesn't know to suppress the `+` before a negative number.
**How to avoid:** Guard: `b >= 0 ? `+ ${b}` : `\u2212 ${Math.abs(b)}`` in the question text builder.
**Warning signs:** Any template that displays `+ -` in a test snapshot.

### Pitfall 2: Overflow in elimination_multiply
**What goes wrong:** When multiplying one equation to align coefficients, the constants can grow large.
**Why it happens:** If a = 3 and d = 4, multiplying eq1 by 4 and eq2 by 3 gives constants up to 4*(4*8+4*8)=256.
**How to avoid:** Cap multiplier ≤ 4; cap x, y ∈ [1, 8]; cap original coefficients ∈ [1, 4]. Max constant after multiply: 4*(4*8 + 4*8) = 256 — displayable.
**Warning signs:** Constants > 500 in question text, which looks implausible for a grade 9-10 problem.

### Pitfall 3: Proportional equations (no unique solution)
**What goes wrong:** Two equations like `2x + 4y = 10` and `x + 2y = 5` are the same line — no unique solution.
**Why it happens:** Coefficients are accidentally proportional: (a/d = b/e = c/f).
**How to avoid:** For elimination skills, ensure x-coefficients differ (d ≠ a after the nudge). For substitution skills, the first equation has y isolated — cannot be proportional to a general `dx + ey = f`.
**Warning signs:** The test `expect(result.correctAnswer.value).toBe(x)` fails with NaN or Infinity.

### Pitfall 4: Swapped operand conventions break bug pattern compute()
**What goes wrong:** Bug pattern `compute(a, b, operation)` receives `operands[0]` and `operands[1]`. If you change the operand layout mid-phase, the bug patterns fire on wrong values.
**Why it happens:** Bug patterns are wired by position, not by name.
**How to avoid:** Document the operand layout at the top of generators.ts (as in sequences_series/generators.ts) and keep it consistent across all generators in the file.
**Warning signs:** Bug pattern produces a distractor that equals the correct answer, causing test failures in the distractor uniqueness check.

### Pitfall 5: Word problem prefix mode and {a}/{b} substitution
**What goes wrong:** If `mode: 'replace'` is used, the word problem template tries to substitute `{a}` and `{b}` into the context — but HS systems generators store operands as distractor values, not the equation operands. This produces garbled text.
**Why it happens:** The default replace mode assumes the operand layout of arithmetic generators.
**How to avoid:** All HS domain word problems use `mode: 'prefix'` exclusively (confirmed pattern from sequences_series, statistics_hs, coordinate_geometry, linear_equations). Always use `mode: 'prefix'`.
**Warning signs:** Word problem text shows `{a}` or `{b}` literal placeholders instead of substituted values.

---

## Code Examples

### Skill definitions (following STATISTICS_HS_SKILLS shape)
```typescript
// src/services/mathEngine/skills/systemsEquations.ts
import type { SkillDefinition } from '../types';

export const SYSTEMS_EQUATIONS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'substitution_simple',
    name: 'Substitution — Variable Already Isolated',
    operation: 'systems_equations',
    grade: 9,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['one_step_addition'],  // linear_equations prerequisite chain
  },
  {
    id: 'substitution_general',
    name: 'Substitution — Isolate Then Substitute',
    operation: 'systems_equations',
    grade: 9,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['substitution_simple'],
  },
  {
    id: 'elimination_add',
    name: 'Elimination — Direct Addition',
    operation: 'systems_equations',
    grade: 9,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['substitution_simple'],
  },
  {
    id: 'elimination_multiply',
    name: 'Elimination — Multiply to Align',
    operation: 'systems_equations',
    grade: 10,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['elimination_add'],
  },
  {
    id: 'sys_word_problem',
    name: 'Systems of Equations Word Problems',
    operation: 'systems_equations',
    grade: 10,
    standards: ['HSA-REI.C.6'],
    prerequisites: ['substitution_general'],
  },
] as const;
```

### Template definitions (following SEQUENCES_SERIES_TEMPLATES shape)
```typescript
// src/services/mathEngine/templates/systemsEquations.ts
import type { ProblemTemplate } from '../types';

export const SYSTEMS_EQUATIONS_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'sys_substitution_simple',
    operation: 'systems_equations',
    skillId: 'substitution_simple',
    grades: [9],
    baseElo: 1050,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.C.6'],
    domainConfig: { type: 'substitution_simple' },
  },
  {
    id: 'sys_substitution_general',
    operation: 'systems_equations',
    skillId: 'substitution_general',
    grades: [9],
    baseElo: 1100,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.C.6'],
    domainConfig: { type: 'substitution_general' },
  },
  {
    id: 'sys_elimination_add',
    operation: 'systems_equations',
    skillId: 'elimination_add',
    grades: [9],
    baseElo: 1100,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.C.6'],
    domainConfig: { type: 'elimination_add' },
  },
  {
    id: 'sys_elimination_multiply',
    operation: 'systems_equations',
    skillId: 'elimination_multiply',
    grades: [10],
    baseElo: 1150,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.C.6'],
    domainConfig: { type: 'elimination_multiply' },
  },
  {
    id: 'sys_word_problem',
    operation: 'systems_equations',
    skillId: 'sys_word_problem',
    grades: [10],
    baseElo: 1100,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.C.6'],
    domainConfig: { type: 'word_problem' },
  },
] as const;
```

### Bug patterns
```typescript
// src/services/mathEngine/bugLibrary/systemsEquationsBugs.ts
import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const SYSTEMS_EQUATIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'sys_swapped_xy',
    operations: ['systems_equations' as MathDomain],
    description:
      'Student found the correct values for x and y but reported the y-value when asked for x.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = swappedAnswer (the y value for this problem)
      return a;
    },
  },
  {
    id: 'sys_sign_error',
    operations: ['systems_equations' as MathDomain],
    description:
      'Student made a sign error during elimination — added equations when they should have subtracted (or vice versa), negating the correct answer.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = signFlippedAnswer (-x)
      return b;
    },
  },
  {
    id: 'sys_forgot_back_sub',
    operations: ['systems_equations' as MathDomain],
    description:
      'Student solved for one variable but forgot to substitute back — left the intermediate expression as the answer instead of the final value.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] is used (same slot as swappedAnswer serves as the intermediate)
      return a;
    },
  },
] as const;
```

### Handler (following sequencesSeriesHandler shape)
```typescript
// src/services/mathEngine/domains/systemsEquations/systemsEquationsHandler.ts
import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateSubstitutionSimple,
  generateSubstitutionGeneral,
  generateEliminationAdd,
  generateEliminationMultiply,
  generateWordProblemVariant,
} from './generators';

export const systemsEquationsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;
    switch (type) {
      case 'substitution_simple':  return generateSubstitutionSimple(template, rng);
      case 'substitution_general': return generateSubstitutionGeneral(template, rng);
      case 'elimination_add':      return generateEliminationAdd(template, rng);
      case 'elimination_multiply': return generateEliminationMultiply(template, rng);
      case 'word_problem':         return generateWordProblemVariant(template, rng);
      default:
        throw new Error(
          `systemsEquationsHandler: unknown domainConfig.type "${type}". ` +
          `Expected one of: substitution_simple, substitution_general, elimination_add, elimination_multiply, word_problem.`,
        );
    }
  },
};
```

### Word problem templates (following statistics_hs prefix-mode shape)
```typescript
// 3 templates to add to wordProblems/templates.ts
// ═══════════════════════════════════════════════════════════════════════
// SYSTEMS OF EQUATIONS — grades 9-10 (prefix mode)
// ═══════════════════════════════════════════════════════════════════════
{
  id: 'wp_sys_tickets',
  operations: ['systems_equations'],
  mode: 'prefix',
  template: '{name} is selling two types of tickets for a school event.',
  question: '',
  minGrade: 9,
},
{
  id: 'wp_sys_prices',
  operations: ['systems_equations'],
  mode: 'prefix',
  template: '{name} is comparing the prices of two different items at {place}.',
  question: '',
  minGrade: 9,
},
{
  id: 'wp_sys_ages',
  operations: ['systems_equations'],
  mode: 'prefix',
  template: '{name} is solving a puzzle about the combined and difference of two people\'s ages.',
  question: '',
  minGrade: 10,
},
```

### videoMap uncomment (Wave 1 action)
```typescript
// src/services/video/videoMap.ts — change this comment to an active entry:
// Before (Wave 0 state):
// systems_equations:     'nok99JOhcjo'  (Phase 86)

// After (Wave 1):
systems_equations: 'nok99JOhcjo',  // Khan Academy: Systems of equations (Phase 86)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Solve system algebraically to get answer | Construction-from-answer: pick (x,y) first | Established Phase 82 | Eliminates need for solver; ensures integer solutions by construction |
| Ask for (x,y) as a coordinate pair | Ask for x only, embed y in problem text | This phase decision | No new UI component needed; NumberPad handles single integer |
| `distractorStrategy: 'default'` (±1 adjacency) | `distractorStrategy: 'domain_specific'` | Phase 80 | Meaningful swapped/sign-error distractors instead of meaningless ±1 |
| `mode: 'replace'` word problems | `mode: 'prefix'` for all HS domains | Phase 82 | Avoids {a}/{b} operand collision with HS distractor operand layout |

**Deprecated/outdated:**
- `mode: 'replace'` for HS domain word problems: All Phases 82-85 use prefix mode; Phase 86 must too.

---

## Critical Decision: Answer Format for Two-Variable Systems

**Question:** How should a system's (x, y) solution be represented as an `Answer`?

**Options evaluated:**

| Option | Implementation | Verdict |
|--------|---------------|---------|
| A: Ask for x only; embed y in problem | `numericAnswer(x)` | **RECOMMENDED** |
| B: MultiSelectAnswer [x, y] | `multiSelectAnswer([x, y])` | Rejected — setsEqual() treats {x,y} as unordered set; no "ask for x" semantic |
| C: Two separate problems per system | Two separate templates | Rejected — doubles template count; wastes skill coverage slots |
| D: CoordinateAnswer (x, y) | `coordinateAnswer(x, y)` | Rejected — no CoordinateInputPad; would require new UI |

**Rationale for Option A:**
- Phase 87 (Quadratic) uses `MultiSelectAnswer` for two roots because they form an unordered set (root 1 and root 2 are equivalent). For systems, x and y are distinct named variables — asking for them separately is both more natural and more granular.
- The existing `NumberPad` with `±` key (from Phase 80) already handles negative integer input.
- The word problem skill (`sys_word_problem`) is the natural place to ask "how many of each?" as a two-step narrative, but the actual answer entered is still a single integer.
- For `sys_word_problem` specifically: the problem text names both values and asks "how many X did [name] buy?" — student enters the x value. The y value is embedded in the narrative.

**Example question text for sys_word_problem:**
```
{name} is selling two types of tickets. Adult tickets cost $5 and child tickets cost $3.
Total tickets sold: 12. Total revenue: $46.
How many adult tickets were sold?
```
The student enters `5` (adult tickets). The child ticket count (7) is derivable but not asked.

---

## Test Count Updates (Wave 0 Plan 01)

Based on the current state after Phase 85:

| Test | Current Value | After Phase 86 |
|------|--------------|----------------|
| `domainHandlerRegistry.test.ts` — "22 operations" | 22 | 23 |
| `domainHandlerRegistry.test.ts` — `ALL_OPERATIONS` array | 22 entries | +1: `'systems_equations'` |
| `domainHandlerRegistry.test.ts` — total skills | 175 | 180 |
| `prerequisiteGating.test.ts` — `SKILLS.length` | 175 | 180 |
| `wordProblems.test.ts` — `ALL_OPERATIONS` array | 22 entries | +1: `'systems_equations'` |
| `domainHandlerRegistry.test.ts` — expectedTypes | 22 keys | +1: `systems_equations: ['numeric']` |

Note: skills go from 175 → 180 (+5 skills: substitution_simple, substitution_general, elimination_add, elimination_multiply, sys_word_problem).

---

## Files to Create (Wave 1)

| File | Action |
|------|--------|
| `src/services/mathEngine/domains/systemsEquations/generators.ts` | CREATE — 5 generators |
| `src/services/mathEngine/domains/systemsEquations/systemsEquationsHandler.ts` | CREATE — handler |
| `src/services/mathEngine/domains/systemsEquations/index.ts` | CREATE — barrel |
| `src/services/mathEngine/skills/systemsEquations.ts` | CREATE — 5 skills |
| `src/services/mathEngine/templates/systemsEquations.ts` | CREATE — 5 templates |
| `src/services/mathEngine/bugLibrary/systemsEquationsBugs.ts` | CREATE — 3 bugs |

## Files to Update (Wave 1)

| File | Change |
|------|--------|
| `src/services/mathEngine/types.ts` | Add `'systems_equations'` to `MathDomain` union |
| `src/services/mathEngine/domains/registry.ts` | Import + register `systemsEquationsHandler` |
| `src/services/mathEngine/domains/index.ts` | Export `systemsEquationsHandler` |
| `src/services/mathEngine/skills/index.ts` | Import + spread `SYSTEMS_EQUATIONS_SKILLS`, export it |
| `src/services/mathEngine/templates/index.ts` | Import + spread `SYSTEMS_EQUATIONS_TEMPLATES`, export it |
| `src/services/mathEngine/bugLibrary/index.ts` | Export `SYSTEMS_EQUATIONS_BUGS` |
| `src/services/video/videoMap.ts` | Uncomment `systems_equations: 'nok99JOhcjo'` entry |

## Files to Update (Wave 2)

| File | Change |
|------|--------|
| `src/services/mathEngine/wordProblems/templates.ts` | Add 3 prefix-mode templates for `systems_equations` |

---

## Open Questions

1. **`sys_forgot_back_sub` bug pattern operand slot**
   - What we know: The "forgot to back-substitute" error produces a different wrong value depending on which variable was solved first. The operand layout needs to pre-compute a plausible "intermediate answer" that represents a partially solved but incomplete result.
   - What's unclear: In practice this distractor may be the same value as `swappedAnswer` (the y value), since if a student stopped after finding y but reported it as x. The two bugs may collapse to the same distractor slot.
   - Recommendation: Implement `sys_forgot_back_sub` using `operands[0]` (same as `sys_swapped_xy`). The distractor generator deduplicates, so if they produce the same value only one appears as a distractor option. If they collide in testing, merge into a single broader bug description.

2. **gradeMap for prerequisiteGating**
   - What we know: Each new HS domain needs a `gradeMap` entry keyed to the domain's minimum grade (9 for systems_equations).
   - What's unclear: Whether `prerequisiteGating.ts` is the right file or whether this is handled in the DAG edges (Phase 91). Phases 82-85 each added a gradeMap entry during Wave 1.
   - Recommendation: Check `src/services/adaptive/prerequisiteGating.ts` during Plan 02 execution to confirm the pattern and add the entry.

3. **AI tutor Socratic prompts for two-method domain**
   - What we know: Systems of equations has two distinct methods (substitution vs elimination). The AI tutor must not prescribe which method to use — that's SYS-04.
   - What's unclear: Whether a single `promptGuidance` string for the `systems_equations` domain covers both methods, or whether substitution_simple and elimination_add need separate guidance.
   - Recommendation: Single guidance string focused on "what do you notice about the coefficients?" and "which equation might be easier to work with first?" — method-neutral Socratic framing.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo (existing) |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npm test -- --testPathPattern=systemsEquations` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SYS-01 | systemsEquations handler generates valid problems for all 5 skills | unit | `npm test -- --testPathPattern=systemsEquations` | ❌ Wave 0 |
| SYS-01 | domainHandlerRegistry recognizes 23 operations | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | ✅ (count update) |
| SYS-01 | prerequisiteGating has 180 skills | unit | `npm test -- --testPathPattern=prerequisiteGating` | ✅ (count update) |
| SYS-02 | Distractors include swapped-variable and sign-error values | unit | `npm test -- --testPathPattern=systemsEquations` | ❌ Wave 0 |
| SYS-03 | wordProblems test recognizes systems_equations operation | unit | `npm test -- --testPathPattern=wordProblems` | ✅ (count update) |
| SYS-04 | Manual AI tutor QA (Socratic framing, no answer reveal) | manual | N/A | N/A — Plan 03 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=systemsEquations`
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/systemsEquations.test.ts` — covers SYS-01 and SYS-02 (RED stubs)
- [ ] Count updates in `domainHandlerRegistry.test.ts`: 22→23 operations, 175→180 skills
- [ ] Count update in `prerequisiteGating.test.ts`: 175→180 skills
- [ ] Add `'systems_equations'` to `ALL_OPERATIONS` array in `wordProblems.test.ts`
- [ ] Add `systems_equations: ['numeric']` to `expectedTypes` in `domainHandlerRegistry.test.ts`

---

## Sources

### Primary (HIGH confidence)
- Project source: `src/services/mathEngine/domains/sequencesSeries/generators.ts` — construction-from-answer pattern with operand layout documentation
- Project source: `src/services/mathEngine/domains/linearEquations/generators.ts` — negative solution handling, metadata shape
- Project source: `src/services/mathEngine/types.ts` — Answer discriminated union, numericAnswer factory, MathDomain type
- Project source: `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — current counts (22 ops, 175 skills), ALL_OPERATIONS array, expectedTypes map
- Project source: `src/__tests__/adaptive/prerequisiteGating.test.ts` — SKILLS.length assertion (175)
- Project source: `src/services/video/videoMap.ts` — reserved comment entry `systems_equations: 'nok99JOhcjo'`
- Project source: `src/services/mathEngine/wordProblems/templates.ts` — prefix-mode template shape for HS domains
- Project source: `.planning/STATE.md` — Phase 82-85 decisions log confirming prefix mode, bare skill IDs, construction-from-answer pattern

### Secondary (MEDIUM confidence)
- Common Core HSA-REI.C.6: "Solve systems of linear equations exactly and approximately, focusing on pairs of linear equations in two variables." — Grade 9-10 standard for all 5 skills.

### Tertiary (LOW confidence)
- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all infrastructure verified from 4 prior identical HS domain phases
- Architecture: HIGH — exact file layout and wiring pattern confirmed from live codebase
- Answer format decision: HIGH — type system reviewed; MultiSelectAnswer semantics confirmed incompatible with ordered (x,y)
- Bug patterns: HIGH — operand layout convention confirmed from sequencesSeries and linearEquations bugs
- Pitfalls: HIGH — Pitfalls 1-5 all verified from prior phase implementations and STATE.md decisions
- Test counts: HIGH — read directly from live test files (22 ops, 175 skills)

**Research date:** 2026-03-13
**Valid until:** 2026-04-12 (stable infrastructure; HS domain pattern is locked)
