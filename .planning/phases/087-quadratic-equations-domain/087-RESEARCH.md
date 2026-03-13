# Phase 87: Quadratic Equations Domain - Research

**Researched:** 2026-03-13
**Domain:** Quadratic equations, factoring monic quadratics, quadratic formula, integer roots, MultiSelectAnswer
**Confidence:** HIGH

---

## Summary

Phase 87 adds `quadratic_equations` as the 24th `MathDomain` to Tiny Tallies. It follows the established three-plan HS domain pattern (Plan 01: RED test stubs, Plan 02: core domain wiring, Plan 03: word problem templates + AI tutor QA). The core differentiator from all prior HS domains is that quadratic problems have **two roots**, requiring the `MultiSelectAnswer` type and `MultiSelectMC` component built in Phase 80 (FOUND-06, FOUND-07). This is the first domain to use multi-select -- every prior domain uses `numericAnswer`.

The critical integration challenge is the **answer format pipeline**. Currently, `selectAndFormatAnswer()` only routes to `formatAsMultipleChoice` or `formatAsFreeText`. It does not handle `multi_select` answers. Phase 87 must extend this pipeline: (1) create `formatAsMultiSelect` function, (2) add a `multi_select` branch in `selectAndFormatAnswer`, and (3) add a `multi_select` rendering branch in `CpaSessionContent.tsx`. Additionally, the safety pipeline (`checkAnswerLeak`) and BOOST prompt (`BoostPromptParams.correctAnswer`) both accept a single `number`, not an array -- both need updating to handle two-root answers without leaking either root in HINT/TEACH mode.

The construction-from-answer pattern remains straightforward: pick two integer roots r1, r2 first, then compute the quadratic as (x - r1)(x - r2) = x^2 - (r1+r2)x + r1*r2. The discriminant is always a perfect square by construction (it factors into the chosen roots). Distractors use wrong-sign roots and sum/product confusion values.

**Primary recommendation:** Extend the answer format pipeline to handle `multi_select` before wiring the domain handler. The domain generators use `multiSelectAnswer([r1, r2])` and `distractorStrategy: 'domain_specific'`. CpaSessionContent renders MultiSelectMC when presentation.format is 'multi_select'.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| QUAD-01 | `quadratic_equations` domain handler -- factoring monic quadratics with integer roots, quadratic formula for rational roots (G9-10, 6 skills) | Construction-from-answer pattern verified; 6 skills designed with Common Core HSA-REI.B.4 coverage; all roots are integers by construction |
| QUAD-02 | Quadratic templates use `MultiSelectAnswer` + `MultiSelectPresentation` -- student selects both roots from options | `MultiSelectAnswer` type exists (FOUND-06); `MultiSelectMC` component exists (FOUND-07); answer format pipeline needs `formatAsMultiSelect` + `selectAndFormatAnswer` extension + `CpaSessionContent` rendering branch |
| QUAD-03 | Distractor generation for quadratic roots (wrong-sign roots, sum/product confusion bug patterns) | 3 bug patterns designed; operand layout documented; `distractorStrategy: 'domain_specific'` suppresses meaningless +/-1 adjacency |
| QUAD-04 | Word problem variants for quadratics (area, projectile contexts) | Prefix-mode templates at minGrade 9-10; same pattern as all prior HS domains |
| QUAD-05 | AI tutor prompt guidance for quadratic equations -- BOOST uses answerDisplayValue() (shows both roots); HINT/TEACH never leak either root | `answerDisplayValue` already returns `values.join(' and ')` for multi_select; BOOST prompt needs `correctAnswer: string` (not number); `checkAnswerLeak` needs multi-root variant; `runSafetyPipeline` needs to check both roots |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `multiSelectAnswer` factory | (project-local) | Answer type for two-root problems | Built in FOUND-06; first real consumer is this phase |
| `MultiSelectMC` component | (project-local) | Checkbox-style option selection | Built in FOUND-07; binary grading via `setsEqual()` |
| `setsEqual` | (project-local) | Order-independent array comparison | Used by MultiSelectMC for all-or-nothing grading |
| `SeededRng.intRange` | (project-local) | Deterministic integer generation | All domain generators use this |
| `distractorStrategy: 'domain_specific'` | (project-local) | Suppress +/-1 adjacency distractors | Same as all HS domains |
| `answerDisplayValue` | (project-local) | Human-readable answer for BOOST prompts | Returns `values.join(' and ')` for multi_select |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Unicode minus U+2212 | N/A | Subtraction sign in question text | Used in all HS generators |
| `prefix` word problem mode | (project-local) | Scene-setting without `{a}/{b}` substitution | Required for all HS domain word problems |
| `formatAsMultiSelect` | NEW (project-local) | Formats Problem into MultiSelectPresentation | Called by `selectAndFormatAnswer` when answer.type is 'multi_select' |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MultiSelectAnswer [r1, r2] | Two separate numericAnswer problems (one per root) | Loses the pedagogically important "find both roots" task; would make quadratics feel like two unrelated problems |
| Checkbox UI (MultiSelectMC) | NumberPad entry of one root | Misses the key concept that quadratics have two solutions |
| `formatAsMultiSelect` in answer pipeline | Inline formatting in domain handler | Violates separation of concerns; answer pipeline owns all formatting |

**Installation:** No new packages needed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/services/mathEngine/
  domains/quadraticEquations/        # NEW
    generators.ts                    # 6 generators (one per skill)
    quadraticEquationsHandler.ts     # DomainHandler switch on domainConfig.type
    index.ts                         # barrel: export { quadraticEquationsHandler }
  skills/quadraticEquations.ts       # NEW -- QUADRATIC_EQUATIONS_SKILLS (6 skills)
  templates/quadraticEquations.ts    # NEW -- QUADRATIC_EQUATIONS_TEMPLATES (6 templates)
  bugLibrary/quadraticEquationsBugs.ts  # NEW -- 3 bug patterns
  answerFormats/multiSelect.ts       # NEW -- formatAsMultiSelect function
```

Plus wiring updates in 9 existing files:
- `types.ts` -- add `'quadratic_equations'` to MathDomain union
- `domains/registry.ts` -- import + register handler
- `domains/index.ts` -- export handler
- `skills/index.ts` -- import + spread skills
- `templates/index.ts` -- import + spread templates
- `bugLibrary/index.ts` -- export bugs
- `bugLibrary/distractorGenerator.ts` -- add QUADRATIC_EQUATIONS_BUGS to BUGS_BY_OPERATION
- `answerFormats/answerFormatSelector.ts` -- add multi_select branch
- `answerFormats/index.ts` -- export formatAsMultiSelect

Plus UI/tutor updates in 4 existing files:
- `components/session/CpaSessionContent.tsx` -- add multi_select rendering branch
- `components/reports/SkillDomainSummary.tsx` -- add 'quadratic_equations' entries
- `services/tutor/problemIntro.ts` -- add quadratic_equations intro
- `services/video/videoMap.ts` -- uncomment quadratic_equations entry

Plus safety/tutor updates for multi-root answers:
- `services/tutor/types.ts` -- widen `BoostPromptParams.correctAnswer` to `number | string`
- `services/tutor/safetyFilter.ts` -- add multi-root `checkAnswerLeak` variant
- `hooks/useTutor.ts` -- use `answerDisplayValue` for BOOST, check both roots in safety pipeline

### Pattern 1: Construction-From-Answer for Quadratic Equations
**What:** Pick two integer roots r1, r2 first. Build the quadratic as x^2 - (r1+r2)x + r1*r2 = 0. The discriminant is always a perfect square because the equation was constructed from integer factors.
**When to use:** All 6 skill generators.

```typescript
// Construction-from-answer: pick roots first -- NEVER solve the quadratic
function generateFactoringMonic(_template: ProblemTemplate, rng: SeededRng): DomainProblemData {
  // Pick two distinct integer roots
  const r1 = rng.intRange(-8, 8);
  let r2 = rng.intRange(-8, 8);
  while (r2 === r1) r2 = rng.intRange(-8, 8);  // ensure distinct roots

  // Build quadratic: (x - r1)(x - r2) = x^2 - (r1+r2)x + r1*r2
  const sum = r1 + r2;
  const product = r1 * r2;

  // Distractors: wrong-sign roots, sum/product confusion
  const wrongSignR1 = -r1;  // student forgot to negate
  const wrongSignR2 = -r2;
  const sumConfusion = sum;  // student gives -(r1+r2) instead of roots
  const productConfusion = product;  // student gives r1*r2 instead of roots

  // coefficients for display
  const bDisplay = sum === 0 ? '' : sum > 0 ? ` + ${sum}x` : ` \u2212 ${Math.abs(sum)}x`;
  const cDisplay = product === 0 ? '' : product > 0 ? ` + ${product}` : ` \u2212 ${Math.abs(product)}`;

  const questionText = `x\u00B2${bDisplay}${cDisplay} = 0\nFind both roots.`;

  return {
    operands: [wrongSignR1, wrongSignR2, sumConfusion, productConfusion],
    correctAnswer: multiSelectAnswer([r1, r2]),
    questionText,
    metadata: {},
  };
}
```

### Pattern 2: formatAsMultiSelect Function
**What:** Creates MultiSelectPresentation from a Problem with MultiSelectAnswer. Generates distractors for individual root values, merges with correct roots, shuffles into options array, and records correctIndices.

```typescript
// src/services/mathEngine/answerFormats/multiSelect.ts
import type { Problem } from '../types';
import type { SeededRng } from '../seededRng';
import { createRng } from '../seededRng';
import { shuffleArray } from '../bugLibrary/validation';
import type { ChoiceOption, MultiSelectPresentation } from './types';

/**
 * Formats a multi-select problem into a presentation with checkbox options.
 * Correct values come from problem.correctAnswer.values (MultiSelectAnswer).
 * Distractor values come from problem.operands (domain-specific wrong answers).
 * Total options = correct values + distractors (typically 2 correct + 2 distractors = 4 options).
 */
export function formatAsMultiSelect(
  problem: Problem,
  seed: number,
): MultiSelectPresentation {
  const rng = createRng(seed);
  const answer = problem.correctAnswer;
  if (answer.type !== 'multi_select') {
    throw new Error('formatAsMultiSelect requires a multi_select answer');
  }

  const correctValues = answer.values;

  // Build distractor pool from operands (domain puts meaningful wrong values there)
  const used = new Set(correctValues);
  const distractors: number[] = [];
  for (const v of problem.operands) {
    if (!used.has(v) && distractors.length < 2) {
      distractors.push(v);
      used.add(v);
    }
  }

  // Build options: correct values first, then distractors
  const options: ChoiceOption[] = [
    ...correctValues.map((v) => ({ value: v })),
    ...distractors.map((v) => ({ value: v })),
  ];

  // Shuffle deterministically
  const shuffled = shuffleArray(options, rng);

  // Find indices of correct values in shuffled array
  const correctSet = new Set(correctValues);
  const correctIndices = shuffled
    .map((opt, i) => (correctSet.has(opt.value) ? i : -1))
    .filter((i) => i >= 0);

  return {
    problem,
    format: 'multi_select',
    options: shuffled,
    correctIndices,
  };
}
```

### Pattern 3: selectAndFormatAnswer Extension
**What:** Add multi_select early-return before the MC/free-text probability decision.

```typescript
// In answerFormatSelector.ts -- add at top of selectAndFormatAnswer:
export function selectAndFormatAnswer(
  problem: Problem,
  elo: number,
  seed: number,
): FormattedProblem {
  // Multi-select answers always render as multi-select checkboxes
  if (problem.correctAnswer.type === 'multi_select') {
    return formatAsMultiSelect(problem, seed);
  }

  // ... existing MC/free-text logic unchanged ...
}
```

### Pattern 4: CpaSessionContent MultiSelectMC Branch
**What:** Add a third branch in `renderAnswers()` for multi_select format.

```typescript
// In CpaSessionContent.tsx renderAnswers():
const isMultiSelect = presentation.format === 'multi_select';

if (isMultiSelect) {
  return (
    <MultiSelectMC
      options={presentation.options}
      correctIndices={presentation.correctIndices}
      onAnswer={onAnswer}
    />
  );
}
// ... existing free_text and MC branches ...
```

### Pattern 5: Safety Pipeline for Multi-Root Answers
**What:** For HINT/TEACH, check that neither root leaks. For BOOST, pass both roots as display string.

```typescript
// Option A (minimal): In useTutor.ts, for multi_select answers:
// 1. BOOST: pass answerDisplayValue(answer) as correctAnswer string
// 2. Safety: run checkAnswerLeak for EACH value in values array

// In useTutor.ts BOOST prompt construction:
case 'boost': {
  const displayAnswer = problem.correctAnswer.type === 'multi_select'
    ? answerDisplayValue(problem.correctAnswer)
    : String(answerNumericValue(problem.correctAnswer));
  userPrompt = buildBoostPrompt({
    ...promptParams,
    correctAnswer: displayAnswer,
  });
  break;
}

// In safety pipeline: check all values
const valuesToCheck = problem.correctAnswer.type === 'multi_select'
  ? [...problem.correctAnswer.values]
  : [answerNumericValue(problem.correctAnswer)];
// For each value, run checkAnswerLeak; fail if ANY leaks
```

### Pattern 6: Skill ID Naming Convention
Following `[Phase 082]` decision: bare names, not namespaced.

| Skill ID | Description | Grade |
|----------|------------|-------|
| `factoring_monic` | Factor x^2 + bx + c (leading coefficient 1) | 9 |
| `factoring_leading_coeff` | Factor ax^2 + bx + c (a > 1, still integer roots) | 9 |
| `quadratic_formula_simple` | Apply formula to get two integer roots | 9 |
| `quadratic_formula_rational` | Apply formula; rational roots (still integers for this phase) | 10 |
| `completing_the_square` | Complete the square to solve | 10 |
| `quad_word_problem` | Area/projectile quadratic word problems | 10 |

### Anti-Patterns to Avoid
- **Using numericAnswer for quadratic roots:** This is the core anti-pattern. Quadratics have TWO solutions; using numericAnswer and asking for one root misses the pedagogical point.
- **Computing roots by solving:** NEVER. Always pick r1, r2 first, then build the quadratic. The engine must never use the quadratic formula.
- **Non-integer roots:** All roots MUST be integers. Construction-from-answer guarantees this. The discriminant is always a perfect square because the polynomial was built from integer factors.
- **Roots equal to each other (repeated root):** Avoid r1 === r2 for multi-select because then the student must select only one value from the checkboxes, which is confusing with the "select both roots" instruction.
- **Displaying coefficients without negative guards:** Same as Pitfall 1 from Phase 86 -- `+ -5` must become `- 5`.
- **Putting both correct roots in operands:** operands[] is for distractors (consumed by bug patterns). The correct roots go in `multiSelectAnswer([r1, r2])`. The operands should contain wrong-sign and confusion values only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-select grading | Custom equality check | `setsEqual()` from types.ts | Already handles order-independent comparison; used by MultiSelectMC |
| Checkbox UI | Custom toggle buttons | `MultiSelectMC` component | Built and tested in Phase 80 (FOUND-07); has testID contracts |
| Distractor deduplication | Manual Set tracking | `distractorGenerator.ts` with `domain_specific` strategy | Handles validation and deduplication |
| Answer display for tutor | String concatenation of roots | `answerDisplayValue()` | Already returns `values.join(' and ')` for multi_select |
| Discriminant verification | Algebraic check | Construction-from-answer makes it structurally perfect-square | No solver logic needed |

**Key insight:** Phase 80 (FOUND-06, FOUND-07) built the multi-select infrastructure specifically for this phase. The MultiSelectMC component, setsEqual grading, and multiSelectAnswer factory are all ready. The remaining gap is the answer format pipeline (selectAndFormatAnswer -> formatAsMultiSelect -> CpaSessionContent rendering).

---

## Common Pitfalls

### Pitfall 1: Answer Format Pipeline Not Handling multi_select
**What goes wrong:** `selectAndFormatAnswer()` returns either MultipleChoicePresentation or FreeTextPresentation. If a quadratic problem with `multi_select` answer goes through this function, it will try to format as MC/free-text, calling `answerNumericValue()` which returns only the first root.
**Why it happens:** No `formatAsMultiSelect` function exists; no multi_select branch in selectAndFormatAnswer.
**How to avoid:** Create `formatAsMultiSelect` function and add early-return branch in `selectAndFormatAnswer` before MC/free-text probability decision.
**Warning signs:** Tests show only one root appearing as an option, or `formatAsMultipleChoice` crashing on multi_select answer.

### Pitfall 2: CpaSessionContent Rendering multi_select as MC
**What goes wrong:** Without a multi_select rendering branch, CpaSessionContent falls through to the MC grid layout, which shows radio-style buttons instead of checkboxes and doesn't support selecting multiple answers.
**Why it happens:** CpaSessionContent only checks for `free_text` and `multiple_choice` formats.
**How to avoid:** Add explicit `if (presentation.format === 'multi_select')` branch that renders `MultiSelectMC`.
**Warning signs:** Quadratic problems render with regular MC buttons instead of checkboxes.

### Pitfall 3: Safety Pipeline Leaking One Root in HINT/TEACH Mode
**What goes wrong:** `checkAnswerLeak` takes a single `correctAnswer: number`. For a quadratic with roots 3 and -5, the safety filter only checks for "3" (via `answerNumericValue`). The LLM could mention "-5" without being caught.
**Why it happens:** `answerNumericValue` for multi_select returns `values[0]` only (Elo proxy).
**How to avoid:** In useTutor.ts, when `correctAnswer.type === 'multi_select'`, run `checkAnswerLeak` for EACH value in the values array. If ANY value leaks, fail the safety check.
**Warning signs:** AI tutor in HINT mode mentions one of the roots without the safety filter catching it.

### Pitfall 4: BOOST Prompt Showing Only One Root
**What goes wrong:** `buildBoostPrompt` receives `correctAnswer: number` from `answerNumericValue()`, which returns only the first root. BOOST mode explanation says "The answer is 3" when the answer is "3 and -5".
**Why it happens:** `BoostPromptParams.correctAnswer` is typed as `number`.
**How to avoid:** Widen `BoostPromptParams.correctAnswer` to `number | string`. In useTutor.ts, for multi_select answers, pass `answerDisplayValue(answer)` which returns "3 and -5".
**Warning signs:** BOOST prompt only mentions one root.

### Pitfall 5: Word Problem prefix mode and {a}/{b} substitution
**What goes wrong:** Same as all prior HS domains -- `mode: 'replace'` tries to substitute operands into text, producing garbled output.
**How to avoid:** All HS domain word problems use `mode: 'prefix'` exclusively.
**Warning signs:** Word problem text shows `{a}` or `{b}` literals.

### Pitfall 6: Repeated Roots (r1 === r2)
**What goes wrong:** If both roots are the same (e.g., x^2 - 6x + 9 = 0 has root x=3 twice), the MultiSelectMC shows 4 options but only one is "correct". The student instruction says "Find both roots" but there's only one distinct root. The checkbox list would have one correct option, confusing the all-or-nothing grading.
**Why it happens:** Random root generation without distinctness check.
**How to avoid:** Ensure r1 !== r2 in all generators with a while-loop or nudge.
**Warning signs:** `multiSelectAnswer([3, 3])` -- `setsEqual()` would still work but the UI would be pedagogically wrong.

### Pitfall 7: Negative Coefficient Display
**What goes wrong:** `x^2 + -5x + 6` instead of `x^2 - 5x + 6`.
**How to avoid:** Guard negative coefficients: `sum > 0 ? ` + ${sum}x` : ` - ${Math.abs(sum)}x``.
**Warning signs:** Any template showing `+ -` in test snapshot.

### Pitfall 8: Operand Layout for Bug Pattern compute()
**What goes wrong:** Bug patterns use `operands[0]` and `operands[1]` positionally. If the layout changes between generators, bug patterns fire on wrong values.
**How to avoid:** Document the operand layout at the top of generators.ts and keep it consistent.
**Warning signs:** Bug pattern produces a distractor equal to a correct root.

---

## Code Examples

### Skill Definitions
```typescript
// src/services/mathEngine/skills/quadraticEquations.ts
import type { SkillDefinition } from '../types';

export const QUADRATIC_EQUATIONS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'factoring_monic',
    name: 'Factor Monic Quadratics',
    operation: 'quadratic_equations',
    grade: 9,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['multi_step'],  // linear_equations prerequisite
  },
  {
    id: 'factoring_leading_coeff',
    name: 'Factor Quadratics (Leading Coefficient > 1)',
    operation: 'quadratic_equations',
    grade: 9,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_monic'],
  },
  {
    id: 'quadratic_formula_simple',
    name: 'Quadratic Formula - Integer Roots',
    operation: 'quadratic_equations',
    grade: 9,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_monic'],
  },
  {
    id: 'quadratic_formula_rational',
    name: 'Quadratic Formula - Larger Coefficients',
    operation: 'quadratic_equations',
    grade: 10,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['quadratic_formula_simple'],
  },
  {
    id: 'completing_the_square',
    name: 'Completing the Square',
    operation: 'quadratic_equations',
    grade: 10,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_monic'],
  },
  {
    id: 'quad_word_problem',
    name: 'Quadratic Word Problems',
    operation: 'quadratic_equations',
    grade: 10,
    standards: ['HSA-REI.B.4'],
    prerequisites: ['factoring_leading_coeff'],
  },
] as const;
```

### Template Definitions
```typescript
// src/services/mathEngine/templates/quadraticEquations.ts
import type { ProblemTemplate } from '../types';

export const QUADRATIC_EQUATIONS_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'quad_factoring_monic',
    operation: 'quadratic_equations',
    skillId: 'factoring_monic',
    grades: [9],
    baseElo: 1050,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.B.4'],
    domainConfig: { type: 'factoring_monic' },
  },
  {
    id: 'quad_factoring_leading_coeff',
    operation: 'quadratic_equations',
    skillId: 'factoring_leading_coeff',
    grades: [9],
    baseElo: 1100,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.B.4'],
    domainConfig: { type: 'factoring_leading_coeff' },
  },
  {
    id: 'quad_formula_simple',
    operation: 'quadratic_equations',
    skillId: 'quadratic_formula_simple',
    grades: [9],
    baseElo: 1100,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.B.4'],
    domainConfig: { type: 'quadratic_formula_simple' },
  },
  {
    id: 'quad_formula_rational',
    operation: 'quadratic_equations',
    skillId: 'quadratic_formula_rational',
    grades: [10],
    baseElo: 1150,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.B.4'],
    domainConfig: { type: 'quadratic_formula_rational' },
  },
  {
    id: 'quad_completing_square',
    operation: 'quadratic_equations',
    skillId: 'completing_the_square',
    grades: [10],
    baseElo: 1150,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.B.4'],
    domainConfig: { type: 'completing_the_square' },
  },
  {
    id: 'quad_word_problem',
    operation: 'quadratic_equations',
    skillId: 'quad_word_problem',
    grades: [10],
    baseElo: 1100,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-REI.B.4'],
    domainConfig: { type: 'word_problem' },
  },
] as const;
```

### Bug Patterns
```typescript
// src/services/mathEngine/bugLibrary/quadraticEquationsBugs.ts
import type { MathDomain } from '../types';
import type { BugPattern } from './types';

// Operand layout (all generators):
//   operands[0] = wrongSignR1 (-r1, student forgot to negate when factoring)
//   operands[1] = wrongSignR2 (-r2, same error for second root)
//   operands[2] = sum confusion (r1+r2, student gives sum instead of roots)
//   operands[3] = product confusion (r1*r2, student gives product instead of roots)

export const QUADRATIC_EQUATIONS_BUGS: readonly BugPattern[] = [
  {
    id: 'quad_wrong_sign',
    operations: ['quadratic_equations' as MathDomain],
    description:
      'Student found the correct factor values but forgot to negate -- reported the coefficient instead of the root (e.g., for (x-3)(x+5)=0 reported 3 and -5 as -3 and 5).',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongSignR1
      return a;
    },
  },
  {
    id: 'quad_sum_product_confusion',
    operations: ['quadratic_equations' as MathDomain],
    description:
      'Student confused sum and product of roots with the roots themselves -- reported -(r1+r2) or r1*r2 as an answer.',
    minDigits: 1,
    compute(_a: number, _b: number, _operation: MathDomain): number | null {
      // operands[2] = sum (r1+r2), but bug compute only gets operands[0] and [1]
      // Use operands[1] = wrongSignR2 as alternate distractor
      return _b;
    },
  },
  {
    id: 'quad_only_one_root',
    operations: ['quadratic_equations' as MathDomain],
    description:
      'Student found only one root and stopped -- selected only one of the two correct values.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // This bug is behavioral (selecting only 1 of 2 checkboxes), not a distractor value.
      // Return operands[0] as a distractor option.
      return a;
    },
  },
] as const;
```

**Important note on distractor generation for multi_select:** The standard `generateDistractors` function produces distractors as individual numbers for MC options. For multi-select, the "distractors" are individual wrong root values mixed into the option list alongside the correct roots. This is different from MC where distractors are wrong total answers. The `formatAsMultiSelect` function should pull distractor values from `problem.operands` directly, not from `generateDistractors`, because the domain handler pre-computes meaningful wrong-root values.

### Handler
```typescript
// src/services/mathEngine/domains/quadraticEquations/quadraticEquationsHandler.ts
import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateFactoringMonic,
  generateFactoringLeadingCoeff,
  generateQuadraticFormulaSimple,
  generateQuadraticFormulaRational,
  generateCompletingTheSquare,
  generateWordProblemVariant,
} from './generators';

export const quadraticEquationsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;
    switch (type) {
      case 'factoring_monic':         return generateFactoringMonic(template, rng);
      case 'factoring_leading_coeff': return generateFactoringLeadingCoeff(template, rng);
      case 'quadratic_formula_simple': return generateQuadraticFormulaSimple(template, rng);
      case 'quadratic_formula_rational': return generateQuadraticFormulaRational(template, rng);
      case 'completing_the_square':   return generateCompletingTheSquare(template, rng);
      case 'word_problem':            return generateWordProblemVariant(template, rng);
      default:
        throw new Error(
          `quadraticEquationsHandler: unknown domainConfig.type "${type}". ` +
          `Expected one of: factoring_monic, factoring_leading_coeff, quadratic_formula_simple, quadratic_formula_rational, completing_the_square, word_problem.`,
        );
    }
  },
};
```

### Word Problem Templates
```typescript
// 3 templates to add to wordProblems/templates.ts
// QUADRATIC EQUATIONS -- grades 9-10 (prefix mode)
{
  id: 'wp_quad_area',
  operations: ['quadratic_equations'],
  mode: 'prefix',
  template: '{name} is designing a rectangular garden where one side is {a} meters longer than the other.',
  question: '',
  minGrade: 9,
},
{
  id: 'wp_quad_projectile',
  operations: ['quadratic_equations'],
  mode: 'prefix',
  template: '{name} launches a ball into the air from the roof of a building.',
  question: '',
  minGrade: 10,
},
{
  id: 'wp_quad_number',
  operations: ['quadratic_equations'],
  mode: 'prefix',
  template: '{name} is thinking of two numbers whose product and sum have a special relationship.',
  question: '',
  minGrade: 9,
},
```

### Leading Coefficient > 1 Generator
```typescript
// For factoring_leading_coeff: ax^2 + bx + c where a > 1
// Pick roots r1, r2 and leading coefficient a ∈ [2,3]
// Build: a(x - r1)(x - r2) = ax^2 - a(r1+r2)x + a*r1*r2
function generateFactoringLeadingCoeff(_template: ProblemTemplate, rng: SeededRng): DomainProblemData {
  const r1 = rng.intRange(-6, 6);
  let r2 = rng.intRange(-6, 6);
  while (r2 === r1 || r2 === 0) r2 = rng.intRange(-6, 6);  // distinct, nonzero for variety
  if (r1 === 0) { /* handle edge case */ }

  const a = rng.intRange(2, 3);  // small leading coefficient
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;

  // Overflow: max |b| = 3*12 = 36, max |c| = 3*36 = 108 -- safe
  // Roots are still r1 and r2 (dividing by a returns to monic factors)

  const wrongSignR1 = -r1;
  const wrongSignR2 = -r2;

  // Display: ax^2 + bx + c = 0
  const bDisplay = b === 0 ? '' : b > 0 ? ` + ${b}x` : ` \u2212 ${Math.abs(b)}x`;
  const cDisplay = c === 0 ? '' : c > 0 ? ` + ${c}` : ` \u2212 ${Math.abs(c)}`;

  return {
    operands: [wrongSignR1, wrongSignR2, r1 + r2, r1 * r2],
    correctAnswer: multiSelectAnswer([r1, r2]),
    questionText: `${a}x\u00B2${bDisplay}${cDisplay} = 0\nFind both roots.`,
    metadata: {},
  };
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Ask for one root (numericAnswer) | Ask for both roots (multiSelectAnswer) | This phase | Uses MultiSelectMC checkbox UI; binary all-or-nothing grading |
| `selectAndFormatAnswer` only handles MC/free-text | Add multi_select early-return branch | This phase | First consumer of MultiSelectPresentation type |
| `checkAnswerLeak(response, singleNumber)` | Check all values in multi_select | This phase | Prevents leaking either root in HINT/TEACH |
| `BoostPromptParams.correctAnswer: number` | Widen to `number | string` | This phase | BOOST can show "3 and -5" for two-root answers |
| `distractorStrategy: 'default'` | `'domain_specific'` for all HS domains | Phase 80 | Meaningful wrong-sign/confusion distractors |

**Deprecated/outdated:**
- `mode: 'replace'` for HS domain word problems: All Phases 82-86 use prefix mode; Phase 87 must too.
- Single-value answer for quadratic roots: Would miss the pedagogical point of "two solutions".

---

## Critical Integration: Answer Format Pipeline

The biggest work unique to Phase 87 (compared to prior domain phases) is wiring the multi-select answer through the full pipeline:

```
Domain Handler                    Answer Format Pipeline              UI Component
---------------------            -------------------------           ------------------
quadraticEquationsHandler    -->  selectAndFormatAnswer()         --> CpaSessionContent
  returns DomainProblemData        detects multi_select answer        renders MultiSelectMC
  with multiSelectAnswer([r1,r2])  calls formatAsMultiSelect()       for multi_select format
                                   returns MultiSelectPresentation
```

**Files that need multi_select awareness (NEW for this phase):**

| File | Change | Impact |
|------|--------|--------|
| `answerFormats/multiSelect.ts` | CREATE -- formatAsMultiSelect function | New file |
| `answerFormats/answerFormatSelector.ts` | Add multi_select early-return | 3-line change |
| `answerFormats/index.ts` | Export MultiSelectPresentation type, formatAsMultiSelect | 2-line change |
| `components/session/CpaSessionContent.tsx` | Add multi_select rendering branch with MultiSelectMC | ~15-line change |
| `hooks/useTutor.ts` | Multi-root safety check, BOOST display | ~10-line change |
| `services/tutor/types.ts` | Widen BoostPromptParams.correctAnswer | 1-line change |
| `services/tutor/safetyFilter.ts` | Add `checkMultiAnswerLeak` or loop variant | ~10-line change |

---

## Test Count Updates (Wave 0 Plan 01)

Based on the current state after Phase 86:

| Test | Current Value | After Phase 87 |
|------|--------------|----------------|
| `domainHandlerRegistry.test.ts` -- "23 operations" | 23 | 24 |
| `domainHandlerRegistry.test.ts` -- `ALL_OPERATIONS` array | 23 entries | +1: `'quadratic_equations'` |
| `domainHandlerRegistry.test.ts` -- total skills | 180 | 186 |
| `domainHandlerRegistry.test.ts` -- `expectedTypes` | 23 keys | +1: `quadratic_equations: ['multi_select']` |
| `prerequisiteGating.test.ts` -- `SKILLS.length` | 180 | 186 |
| `wordProblems.test.ts` -- `ALL_OPERATIONS` array | 23 entries | +1: `'quadratic_equations'` |

Note: skills go from 180 to 186 (+6 skills: factoring_monic, factoring_leading_coeff, quadratic_formula_simple, quadratic_formula_rational, completing_the_square, quad_word_problem).

---

## Files to Create

| File | Action |
|------|--------|
| `src/services/mathEngine/domains/quadraticEquations/generators.ts` | CREATE -- 6 generators |
| `src/services/mathEngine/domains/quadraticEquations/quadraticEquationsHandler.ts` | CREATE -- handler |
| `src/services/mathEngine/domains/quadraticEquations/index.ts` | CREATE -- barrel |
| `src/services/mathEngine/skills/quadraticEquations.ts` | CREATE -- 6 skills |
| `src/services/mathEngine/templates/quadraticEquations.ts` | CREATE -- 6 templates |
| `src/services/mathEngine/bugLibrary/quadraticEquationsBugs.ts` | CREATE -- 3 bugs |
| `src/services/mathEngine/answerFormats/multiSelect.ts` | CREATE -- formatAsMultiSelect |

## Files to Update (Domain Wiring -- Same as Prior Phases)

| File | Change |
|------|--------|
| `src/services/mathEngine/types.ts` | Add `'quadratic_equations'` to MathDomain union |
| `src/services/mathEngine/domains/registry.ts` | Import + register handler |
| `src/services/mathEngine/domains/index.ts` | Export handler |
| `src/services/mathEngine/skills/index.ts` | Import + spread skills |
| `src/services/mathEngine/templates/index.ts` | Import + spread templates |
| `src/services/mathEngine/bugLibrary/index.ts` | Export bugs |
| `src/services/mathEngine/bugLibrary/distractorGenerator.ts` | Add QUADRATIC_EQUATIONS_BUGS to BUGS_BY_OPERATION |
| `src/services/video/videoMap.ts` | Uncomment `quadratic_equations: 'IWigvJcCAJ0'` |

## Files to Update (Multi-Select Pipeline -- NEW for This Phase)

| File | Change |
|------|--------|
| `src/services/mathEngine/answerFormats/answerFormatSelector.ts` | Add multi_select early-return branch |
| `src/services/mathEngine/answerFormats/index.ts` | Export formatAsMultiSelect, MultiSelectPresentation |
| `src/components/session/CpaSessionContent.tsx` | Add multi_select rendering branch |
| `src/components/reports/SkillDomainSummary.tsx` | Add quadratic_equations entries |
| `src/services/tutor/problemIntro.ts` | Add quadratic_equations intro |

## Files to Update (Tutor Safety -- NEW for This Phase)

| File | Change |
|------|--------|
| `src/services/tutor/types.ts` | Widen BoostPromptParams.correctAnswer to `number \| string` |
| `src/services/tutor/promptTemplates.ts` | Handle string correctAnswer in buildBoostPrompt |
| `src/services/tutor/safetyFilter.ts` | Add multi-value checkAnswerLeak variant |
| `src/hooks/useTutor.ts` | Multi-root BOOST display + multi-root safety check |

## Files to Update (Word Problems -- Plan 03)

| File | Change |
|------|--------|
| `src/services/mathEngine/wordProblems/templates.ts` | Add 3 prefix-mode templates for quadratic_equations |

---

## Open Questions

1. **formatAsMultiSelect distractor sourcing**
   - What we know: The standard `generateDistractors` function produces distractors as scalar values suitable for MC (one correct answer, N wrong answers). For multi-select, the "options" list contains both correct roots AND wrong root values.
   - What's unclear: Should `formatAsMultiSelect` call `generateDistractors` for each root separately, or should it pull distractors directly from `problem.operands` where the domain handler pre-computed wrong-sign/confusion values?
   - Recommendation: Pull directly from `problem.operands`. The domain handler knows the meaningful wrong values (wrong-sign roots, sum/product confusion). This is simpler and more semantically correct. The standard distractor pipeline is designed for single-answer problems.

2. **BoostPromptParams.correctAnswer type widening**
   - What we know: Currently typed as `number`. For multi_select, we need to pass both roots as a display string (e.g., "3 and -5").
   - What's unclear: Whether widening to `number | string` is safe for all existing callsites, or whether a separate `correctAnswerDisplay` field is cleaner.
   - Recommendation: Widen to `number | string`. The field is only interpolated into a string in `buildBoostPrompt` (`The correct answer is: ${params.correctAnswer}`), so string works fine. All existing callers pass `number`, which is assignable to `number | string`.

3. **Number of multi-select options**
   - What we know: MultiSelectMC renders any number of options. For quadratics with 2 roots, we need at least 2 wrong values to make 4 total options.
   - What's unclear: Should the option count be fixed at 4, or Elo-adaptive like MC?
   - Recommendation: Fixed at 4 (2 correct + 2 distractors). With checkboxes, more options increases cognitive load disproportionately compared to MC radio buttons. The wrong-sign roots provide exactly 2 natural distractors.

4. **useTutor.ts multi-root safety check architecture**
   - What we know: `runSafetyPipeline` takes a single `correctAnswer: number`. For multi_select, we need to check all values.
   - What's unclear: Whether to modify `runSafetyPipeline` signature or handle at the callsite in useTutor.ts.
   - Recommendation: Handle at the callsite. In useTutor.ts, for multi_select answers, loop over `values` and call `checkAnswerLeak` for each. This avoids changing the `runSafetyPipeline` signature which has many test consumers. The loop runs in HINT/TEACH only (BOOST skips leak check).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo (existing) |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npm test -- --testPathPattern=quadraticEquations` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUAD-01 | quadraticEquations handler generates valid problems for all 6 skills | unit | `npm test -- --testPathPattern=quadraticEquations` | No -- Wave 0 |
| QUAD-01 | domainHandlerRegistry recognizes 24 operations, 186 skills | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | Yes (count update) |
| QUAD-01 | prerequisiteGating has 186 skills | unit | `npm test -- --testPathPattern=prerequisiteGating` | Yes (count update) |
| QUAD-02 | MultiSelectAnswer generated, formatAsMultiSelect produces MultiSelectPresentation | unit | `npm test -- --testPathPattern=multiSelect` | No -- Wave 0 |
| QUAD-02 | selectAndFormatAnswer routes multi_select to formatAsMultiSelect | unit | `npm test -- --testPathPattern=answerFormatSelector` | Yes (add test) |
| QUAD-03 | Distractors include wrong-sign roots and sum/product confusion | unit | `npm test -- --testPathPattern=quadraticEquations` | No -- Wave 0 |
| QUAD-04 | wordProblems test recognizes quadratic_equations operation | unit | `npm test -- --testPathPattern=wordProblems` | Yes (count update) |
| QUAD-05 | BOOST prompt contains both roots via answerDisplayValue | unit | `npm test -- --testPathPattern=promptTemplates` | Yes (add test) |
| QUAD-05 | Safety filter checks both roots in HINT/TEACH | unit | `npm test -- --testPathPattern=safetyFilter` | Yes (add test) |
| QUAD-05 | Manual AI tutor QA (Socratic framing, no answer reveal) | manual | N/A | N/A -- Plan 03 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=quadraticEquations`
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/quadraticEquations.test.ts` -- covers QUAD-01 and QUAD-03 (RED stubs)
- [ ] `src/__tests__/mathEngine/multiSelect.test.ts` -- covers QUAD-02 formatAsMultiSelect (RED stubs)
- [ ] Count updates in `domainHandlerRegistry.test.ts`: 23->24 operations, 180->186 skills
- [ ] Count update in `prerequisiteGating.test.ts`: 180->186 skills
- [ ] Add `'quadratic_equations'` to `ALL_OPERATIONS` array in `domainHandlerRegistry.test.ts` and `wordProblems.test.ts`
- [ ] Add `quadratic_equations: ['multi_select']` to `expectedTypes` in `domainHandlerRegistry.test.ts`
- [ ] Add multi_select routing test in `answerFormatSelector.test.ts`
- [ ] Add multi-root safety filter test in safetyFilter tests

---

## Sources

### Primary (HIGH confidence)
- Project source: `src/services/mathEngine/types.ts` -- MultiSelectAnswer type, multiSelectAnswer factory, setsEqual, answerDisplayValue (lines 70-146)
- Project source: `src/components/session/MultiSelectMC.tsx` -- checkbox UI component, setsEqual grading, testID contracts
- Project source: `src/services/mathEngine/answerFormats/types.ts` -- MultiSelectPresentation interface, AnswerFormat union
- Project source: `src/services/mathEngine/answerFormats/answerFormatSelector.ts` -- selectAndFormatAnswer (NO multi_select branch)
- Project source: `src/services/mathEngine/answerFormats/multipleChoice.ts` -- formatAsMultipleChoice (reference for formatAsMultiSelect)
- Project source: `src/components/session/CpaSessionContent.tsx` -- renderAnswers() only handles free_text and multiple_choice
- Project source: `src/hooks/useTutor.ts` -- BOOST uses answerNumericValue (line 286), safety uses answerNumericValue (line 397)
- Project source: `src/services/tutor/types.ts` -- BoostPromptParams.correctAnswer is `number`
- Project source: `src/services/tutor/safetyFilter.ts` -- checkAnswerLeak takes single `number`
- Project source: `src/services/mathEngine/domains/systemsEquations/generators.ts` -- reference HS domain generator pattern
- Project source: `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` -- current counts (23 ops, 180 skills), expectedTypes map
- Project source: `src/__tests__/adaptive/prerequisiteGating.test.ts` -- SKILLS.length assertion (180)
- Project source: `src/services/video/videoMap.ts` -- reserved comment entry `quadratic_equations: 'IWigvJcCAJ0'`
- Project source: `.planning/STATE.md` -- Phase 80 decisions confirming MultiSelectAnswer, setsEqual, answerNumericValue proxy behavior

### Secondary (MEDIUM confidence)
- Common Core HSA-REI.B.4: "Solve quadratic equations in one variable" -- Grade 9-10 standard for all 6 skills

### Tertiary (LOW confidence)
- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all infrastructure verified from 5 prior HS domain phases + Phase 80 multi-select foundation
- Architecture: HIGH -- exact file layout and wiring pattern confirmed from live codebase; multi-select pipeline gaps identified from source code
- Answer format pipeline: HIGH -- gaps verified by reading selectAndFormatAnswer, CpaSessionContent, useTutor.ts source code directly
- Safety pipeline: HIGH -- checkAnswerLeak and runSafetyPipeline signatures verified from source
- Bug patterns: HIGH -- operand layout convention confirmed from all prior HS domain implementations
- Pitfalls: HIGH -- all 8 pitfalls verified from prior phase implementations, source code analysis, and STATE.md decisions

**Research date:** 2026-03-13
**Valid until:** 2026-04-12 (stable infrastructure; HS domain pattern is locked)
