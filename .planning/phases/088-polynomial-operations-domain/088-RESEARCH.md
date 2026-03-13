# Phase 88: Polynomial Operations Domain - Research

**Researched:** 2026-03-13
**Domain:** Polynomial operations -- FOIL expansion, polynomial evaluation, GCF factoring, difference of squares
**Confidence:** HIGH

---

## Summary

Phase 88 adds `polynomials` as the 25th `MathDomain` to Tiny Tallies. It follows the established three-plan HS domain pattern (Plan 01: RED test stubs + skills + bugs, Plan 02: core domain handler + wiring, Plan 03: word problem templates + AI tutor QA). The domain covers 6 skills across grades 9-10: FOIL expansion, polynomial evaluation at a point, GCF factoring, difference-of-squares factoring, and word problems.

The unique challenge for this domain is the **mixed answer type**: evaluation skills produce `numericAnswer` (standard pipeline), while factoring skills (GCF, difference of squares) produce `ExpressionAnswer` for MC identification of the correct factored form. The `ExpressionAnswer` type already exists in `types.ts` but has **never been used by any domain**. The MC rendering pipeline in `CpaSessionContent.tsx` currently displays `option.value` (numeric) directly as text. For expression MC, we need to add `label?: string` to the `AnswerOption` interface in CpaSessionContent and display `option.label ?? String(option.value)`. The existing `MultiSelectMC` component already implements this pattern (`option.label ?? String(option.value)` on line 84).

The approach for factored-form MC: the generator returns `ExpressionAnswer` with a canonical string (e.g., `"3(x + 2)"`). The `selectAndFormatAnswer` pipeline needs a new branch for `expression` type that (a) always uses MC (never free-text, since we don't have expression parsing), (b) generates expression-string distractors as labels on `ChoiceOption`, and (c) uses a numeric encoding (hash or index) for `value` to flow through the existing `onAnswer(number)` pipeline. Alternatively, factored-form problems can use `numericAnswer` with the index of the correct expression option, and the domain generates its own complete MC options with labels. The simplest approach: factored-form generators return `numericAnswer(0)` as a sentinel and embed expression MC options in `metadata`, then a format branch handles rendering. However, this is overengineered. The cleanest path: **use numericAnswer for the correct answer's numeric proxy (e.g., GCF value), add label to ChoiceOption in CpaSessionContent, and have the distractor generator produce labeled options for expression domains.** This matches the existing `label` pattern in MultiSelectMC.

**Primary recommendation:** Follow the established three-plan HS domain pattern. Use `numericAnswer` for all skills (evaluation = direct numeric, factoring = numeric proxy with label for expression display). Add `label?: string` to `AnswerOption` in CpaSessionContent.tsx to support expression string display in regular MC.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| POLY-01 | `polynomials` domain handler -- FOIL expansion, polynomial evaluation at a point, simple factoring (GCF, difference of squares) (G9-10, 6 skills) | Established domain handler pattern from 8 prior HS domains; MathDomain type, registry, skills, templates, bugs all need `polynomials` entries |
| POLY-02 | Polynomial templates with numeric answers (evaluation) and MC expression answers (factored form identification) | ExpressionAnswer type exists but unused; recommend numericAnswer + label-based MC for factored forms; ChoiceOption label pattern proven in MultiSelectMC |
| POLY-03 | Word problem variants for polynomials (area/perimeter expressions) | Prefix-mode word problem pattern established in all prior HS domains; word problem templates in templates.ts |
| POLY-04 | AI tutor prompt guidance for polynomial operations | problemIntro.ts needs `polynomials` entry; manual QA auto-approved per user pre-authorization |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | strict | Type-safe domain handler | Project convention |
| Jest + jest-expo | existing | Wave 0 RED stubs, domain tests | Project test framework |
| Zustand | existing | No store changes needed for this domain | State management |

### No New Dependencies
This phase requires zero new npm packages. All polynomial math is trivially computable with basic arithmetic.

## Architecture Patterns

### Established Three-Plan HS Domain Pattern

Every HS domain (phases 82-87) follows this exact structure:

**Plan 01 -- RED Stubs + Skills + Bugs:**
- Add `'polynomials'` to `MathDomain` union in `types.ts`
- Create `src/services/mathEngine/skills/polynomials.ts` (6 SkillDefinitions)
- Create `src/services/mathEngine/bugLibrary/polynomialsBugs.ts` (3-4 BugPatterns)
- Create `src/__tests__/mathEngine/polynomials.test.ts` (Wave 0 RED stubs)
- Wire into: skills/index.ts, bugLibrary/index.ts (export), distractorGenerator.ts (BUGS_BY_OPERATION)
- Update exhaustive Record<MathDomain> sites: SkillDomainSummary.tsx (DOMAIN_LABELS + DOMAIN_ORDER), skillMapColors.ts

**Plan 02 -- Domain Handler + Templates + Wiring:**
- Create `src/services/mathEngine/domains/polynomials/generators.ts`
- Create `src/services/mathEngine/domains/polynomials/polynomialsHandler.ts`
- Create `src/services/mathEngine/domains/polynomials/index.ts`
- Create `src/services/mathEngine/templates/polynomials.ts` (6 templates)
- Wire into: domains/index.ts (export), domains/registry.ts (HANDLERS), templates/index.ts (ALL_TEMPLATES + export)
- Update problemIntro.ts with `polynomials` entry
- Update videoMap.ts (uncomment polynomials entry)
- **NEW for this domain:** Add `label?: string` to `AnswerOption` in CpaSessionContent.tsx, display `option.label ?? String(option.value)` -- 3 lines changed

**Plan 03 -- Word Problems + AI Tutor QA:**
- Add 3 prefix-mode word problem templates to `wordProblems/templates.ts`
- Manual QA sign-off (auto-approved per user pre-authorization)

### Recommended File Structure
```
src/services/mathEngine/
  domains/polynomials/
    generators.ts          # 6 generator functions
    polynomialsHandler.ts  # DomainHandler switch on domainConfig.type
    index.ts               # barrel export
  skills/polynomials.ts    # 6 SkillDefinitions
  templates/polynomials.ts # 6 ProblemTemplates
  bugLibrary/polynomialsBugs.ts  # 3-4 BugPatterns
```

### Skill Design (6 skills)

| Skill ID | Name | Grade | Answer Type | Generator |
|----------|------|-------|-------------|-----------|
| `foil_expansion` | FOIL Expansion | 9 | numericAnswer | Expand (a+b)(c+d), evaluate at x=1 to get numeric answer |
| `poly_evaluation` | Polynomial Evaluation | 9 | numericAnswer | Evaluate ax^2+bx+c at given x |
| `gcf_factoring` | GCF Factoring | 9 | numericAnswer (with label) | Identify factored form from MC; numeric proxy = GCF value |
| `diff_of_squares` | Difference of Squares | 10 | numericAnswer (with label) | Identify factored form from MC; numeric proxy = a value |
| `combined_operations` | Combined Polynomial Operations | 10 | numericAnswer | Simplify and evaluate a polynomial expression |
| `poly_word_problem` | Polynomial Word Problems | 10 | numericAnswer | Area/perimeter context with polynomial evaluation |

### Construction-From-Answer Pattern

All generators use this pattern (construction-from-answer):

**FOIL Expansion:**
```typescript
// Pick integers a, b, c, d in [-5, 5]
// Form: (x + a)(x + b) -- expand to x^2 + (a+b)x + ab
// Question: "Expand (x + 3)(x + 2) and evaluate at x = 1"
// Answer: 1 + (3+2)*1 + 3*2 = 12 (numericAnswer)
function generateFoilExpansion(template, rng): DomainProblemData {
  const a = rng.intRange(-5, 5);
  const b = rng.intRange(-5, 5);
  const x = rng.intRange(1, 5); // evaluation point
  const answer = (x + a) * (x + b);
  // operands: [a, b, x, wrongAnswer1, wrongAnswer2]
  return { operands: [...], correctAnswer: numericAnswer(answer), questionText: ... };
}
```

**Polynomial Evaluation:**
```typescript
// Pick coefficients a, b, c and evaluation point x
// Form: ax^2 + bx + c at x = val
// Answer: a*val^2 + b*val + c
function generatePolyEval(template, rng): DomainProblemData {
  const a = rng.intRange(1, 5);
  const b = rng.intRange(-8, 8);
  const c = rng.intRange(-10, 10);
  const x = rng.intRange(-3, 5);
  const answer = a * x * x + b * x + c;
  return { operands: [...], correctAnswer: numericAnswer(answer), questionText: ... };
}
```

**GCF Factoring (expression MC):**
```typescript
// Pick GCF k in [2,5], coefficients a, b
// Form: kax + kb = k(ax + b)
// Question: "Factor 6x + 12. Choose the correct factored form."
// Correct: "6(x + 2)" -- MC option with label
// Distractors: "3(2x + 4)", "2(3x + 12)", "6(x + 12)" -- common errors
// Answer: numericAnswer(gcfValue) as Elo proxy
function generateGcfFactoring(template, rng): DomainProblemData {
  const gcf = rng.intRange(2, 5);
  const a = rng.intRange(1, 4);
  const b = rng.intRange(1, 6);
  // operands encode distractor info
  return { operands: [gcf, a, b, ...], correctAnswer: numericAnswer(gcf), questionText: ... };
}
```

**Difference of Squares:**
```typescript
// Pick a, b integers
// Form: a^2 - b^2 = (a+b)(a-b)
// Question: "Factor x^2 - 9. Choose the correct factored form."
// Correct: "(x + 3)(x - 3)"
// Distractors: "(x + 9)(x - 1)", "(x + 3)^2", "(x - 3)^2"
function generateDiffOfSquares(template, rng): DomainProblemData {
  const b = rng.intRange(2, 8);
  return { operands: [b, ...], correctAnswer: numericAnswer(b), questionText: ... };
}
```

### Expression MC Strategy (CRITICAL DESIGN DECISION)

The requirement says "MC expression answers (factored form identification)". Two approaches:

**Approach A (RECOMMENDED): numericAnswer + ChoiceOption.label**
- Generators return `numericAnswer(numericProxy)` where proxy = GCF or `a` value
- The factoring templates set `domainConfig.expressionMC: true` (flag for format selector)
- `selectAndFormatAnswer` always routes factoring to MC (never free-text)
- Distractor generation for factoring skills produces `ChoiceOption[]` with `label` strings
- CpaSessionContent.tsx displays `option.label ?? String(option.value)` (1-line change)
- Grading works unchanged: user taps MC option, `onAnswer(option.value)` sends numeric value, matches `correctAnswer.value`

**Approach B (REJECTED): ExpressionAnswer**
- Would require: new `expressionAnswer()` factory, new branch in `selectAndFormatAnswer`, string-based grading, expression equivalence checking, free-text expression parsing. Far too complex.

**Decision: Use Approach A.** The `ChoiceOption.label` pattern is already proven in MultiSelectMC. The only infrastructure change is adding `label` display support to the regular MC path in CpaSessionContent.tsx.

### Bug Patterns for Polynomials

| Bug ID | Description | Compute |
|--------|-------------|---------|
| `poly_foil_forgot_middle` | Student multiplied first and last but forgot the middle terms (OI in FOIL) | a*c + b*d (missing ad+bc cross terms) |
| `poly_wrong_gcf` | Student factored out a non-maximal common factor | operands[0] / 2 or similar partial GCF |
| `poly_sign_error` | Student made a sign error in the expanded/factored form | negated middle term |

### Operand Layout Convention

Following the established convention (documented in quadraticEquationsBugs.ts header), each generator documents its operand layout:

```
FOIL: operands[0]=a, operands[1]=b, operands[2]=evaluationX, operands[3]=wrongMiddle
Eval: operands[0]=coeffA, operands[1]=coeffB, operands[2]=coeffC, operands[3]=evalX
GCF:  operands[0]=gcf, operands[1]=innerA, operands[2]=innerB
DiffSq: operands[0]=squaredBase, operands[1]=wrongDistractor
```

### Anti-Patterns to Avoid
- **Do NOT use ExpressionAnswer for this domain**: It's unused infrastructure, no grading pipeline exists for it, and string equivalence is error-prone
- **Do NOT attempt free-text expression input**: Out of scope per REQUIREMENTS.md
- **Do NOT add LaTeX rendering**: Out of scope per REQUIREMENTS.md ("Not needed -- ExpressionAnswer renders as plain text")
- **Do NOT use `option.value` for expression strings**: `value` is typed as `number` in ChoiceOption

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Expression equivalence | Symbolic expression comparator | MC with fixed labeled options | Expression equivalence is a CAS problem; MC sidesteps it entirely |
| Expression parsing | Free-text algebraic input parser | MC selection of pre-built options | Out of scope; parser complexity is enormous |
| Polynomial display | LaTeX/MathJax renderer | Unicode superscripts + signed coefficient helpers | x\u00B2 renders fine; \u2212 for minus; existing quadratic domain uses this |

## Common Pitfalls

### Pitfall 1: Record<MathDomain> Exhaustiveness
**What goes wrong:** Adding `'polynomials'` to `MathDomain` union causes TypeScript errors at ALL `Record<MathDomain>` exhaustive sites
**Why it happens:** TypeScript enforces exhaustive keys on Record types
**How to avoid:** Update ALL exhaustive sites in Plan 01: distractorGenerator.ts BUGS_BY_OPERATION, SkillDomainSummary.tsx DOMAIN_LABELS + DOMAIN_ORDER, skillMapColors.ts, problemIntro.ts, registry.ts HANDLERS, videoMap.ts
**Warning signs:** TypeScript errors mentioning "polynomials" missing from Record

### Pitfall 2: Bug Import Causes RED at Module Level
**What goes wrong:** Importing POLYNOMIALS_BUGS in distractorGenerator.ts before the file exists causes module-level failure
**Why it happens:** All prior HS domains documented this exact issue (086, 087)
**How to avoid:** Create the bugs file in Plan 01 before wiring the import. The Wave 0 stub creates the file first.

### Pitfall 3: Skill ID Collision
**What goes wrong:** Using generic skill IDs like `word_problem` collides with linear_equations' bare `word_problem` ID
**Why it happens:** skillMapLayout uses skillId as Map key
**How to avoid:** Prefix: `poly_word_problem` (matching convention: quad_word_problem, coord_word_problem, sys_word_problem, seq_word_problem)

### Pitfall 4: Word Problem Operand Mismatch (Pitfall 5 from prior domains)
**What goes wrong:** Word problem templates using `{a}/{b}` placeholders don't match generator operand layout
**Why it happens:** Prefix mode prepends context; generator operands are domain-specific, not {a}/{b}
**How to avoid:** Use prefix mode exclusively for word problems (same solution as all prior HS domains)

### Pitfall 5: Factored Form Display Formatting
**What goes wrong:** Factored forms like "3(x + -2)" display awkwardly with double signs
**Why it happens:** Negative coefficients concatenated naively
**How to avoid:** Reuse `signedCoeff` and `signedConst` helpers from quadratic domain, or write equivalent helpers for polynomial canonical strings

### Pitfall 6: prerequisiteGating Count
**What goes wrong:** Adding 6 new skills changes the prerequisiteGating expected count in the integration test
**Why it happens:** `prerequisiteGating.test.ts` asserts exact skill count
**How to avoid:** Update the count assertion. Prior domains document the count bump pattern.

### Pitfall 7: CpaSessionContent Label Rendering
**What goes wrong:** Adding `label` to AnswerOption but forgetting to update the display, accessibility, or boost highlight code paths
**Why it happens:** option.value is referenced in 5+ places in the MC render block
**How to avoid:** Update all references: display text (line 508), accessibilityLabel (line 505), and the boost highlight comparison may need label awareness

## Code Examples

### Generator Pattern (from quadratic equations, verified in codebase)
```typescript
// Source: src/services/mathEngine/domains/quadraticEquations/generators.ts
import { numericAnswer } from '../../types';
import type { DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';

export function generateFoilExpansion(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const a = rng.intRange(-5, 5);
  const b = rng.intRange(-5, 5);
  while (a === 0) a = rng.intRange(-5, 5); // avoid trivial
  while (b === 0) b = rng.intRange(-5, 5);
  const x = rng.intRange(1, 4);
  const answer = (x + a) * (x + b);

  // FOIL: (x+a)(x+b) = x^2 + (a+b)x + ab
  const sum = a + b;
  const product = a * b;
  const forgotMiddle = x * x + product; // bug: only F and L

  const questionText = `Expand (x ${signedConst(a)})(x ${signedConst(b)}) and evaluate at x = ${x}.`;

  return {
    operands: [a, b, x, forgotMiddle],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}
```

### Handler Pattern (from quadratic equations, verified)
```typescript
// Source: src/services/mathEngine/domains/quadraticEquations/quadraticEquationsHandler.ts
export const polynomialsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;
    switch (type) {
      case 'foil_expansion': return generateFoilExpansion(template, rng);
      case 'poly_evaluation': return generatePolyEvaluation(template, rng);
      case 'gcf_factoring': return generateGcfFactoring(template, rng);
      case 'diff_of_squares': return generateDiffOfSquares(template, rng);
      case 'combined_operations': return generateCombinedOps(template, rng);
      case 'word_problem': return generateWordProblem(template, rng);
      default: throw new Error(`polynomialsHandler: unknown type "${type}"`);
    }
  },
};
```

### Template Pattern (from quadratic equations, verified)
```typescript
// Source: src/services/mathEngine/templates/quadraticEquations.ts
export const POLYNOMIALS_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'poly_foil_expansion',
    operation: 'polynomials',
    skillId: 'foil_expansion',
    grades: [9],
    baseElo: 1000,
    digitCount: 2,
    distractorStrategy: 'domain_specific',
    standards: ['HSA-APR.A.1'],
    domainConfig: { type: 'foil_expansion' },
  },
  // ... 5 more templates
];
```

### Label-Enhanced MC Rendering (proposed change to CpaSessionContent.tsx)
```typescript
// Current (line 508):
<Text style={styles.optionText}>{option.value}</Text>

// Proposed:
<Text style={styles.optionText}>{option.label ?? String(option.value)}</Text>

// And update AnswerOption interface:
interface AnswerOption {
  readonly value: number;
  readonly bugId?: string;
  readonly label?: string;  // NEW: expression string for display
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ExpressionAnswer type for factoring | numericAnswer + label for MC display | Phase 88 (new) | Avoids building expression equivalence; reuses existing MC pipeline |
| Each domain builds custom MC | Domain-specific distractor strategy flag | Phase 80 (FOUND-08) | Templates opt out of adjacency distractors |

## Wiring Checklist (All Exhaustive Record<MathDomain> Sites)

Files that must be updated when adding `'polynomials'` to MathDomain:

| File | What to Add |
|------|-------------|
| `src/services/mathEngine/types.ts` | `'polynomials'` to MathDomain union |
| `src/services/mathEngine/domains/registry.ts` | `polynomials: polynomialsHandler` in HANDLERS |
| `src/services/mathEngine/domains/index.ts` | export polynomialsHandler |
| `src/services/mathEngine/bugLibrary/distractorGenerator.ts` | `polynomials: POLYNOMIALS_BUGS` in BUGS_BY_OPERATION + import |
| `src/services/mathEngine/skills/index.ts` | import + spread POLYNOMIALS_SKILLS + export |
| `src/services/mathEngine/templates/index.ts` | import + spread POLYNOMIALS_TEMPLATES + export |
| `src/components/reports/SkillDomainSummary.tsx` | DOMAIN_LABELS + DOMAIN_ORDER entries |
| `src/components/skillMap/skillMapColors.ts` | color entry for polynomials |
| `src/services/tutor/problemIntro.ts` | INTROS entry for polynomials |
| `src/services/video/videoMap.ts` | uncomment polynomials video ID |
| `src/services/mathEngine/wordProblems/templates.ts` | 3 prefix-mode word problem templates |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | jest.config.js (existing) |
| Quick run command | `npm test -- --testPathPattern=polynomials` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POLY-01 | 6 skills registered, handler defined, 3-4 bugs | unit | `npm test -- --testPathPattern=polynomials` | Wave 0 |
| POLY-02 | Numeric answers for eval, labeled MC for factoring | unit | `npm test -- --testPathPattern=polynomials` | Wave 0 |
| POLY-03 | Word problem templates with prefix mode | unit | `npm test -- --testPathPattern=wordProblems` | Wave 0 (extend) |
| POLY-04 | AI tutor hints don't leak answer | manual-only | Manual QA (auto-approved) | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=polynomials`
- **Per wave merge:** `npm test && npm run typecheck`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/polynomials.test.ts` -- covers POLY-01, POLY-02
- [ ] `src/services/mathEngine/bugLibrary/polynomialsBugs.ts` -- bug patterns
- [ ] `src/services/mathEngine/skills/polynomials.ts` -- 6 skill definitions

## Open Questions

1. **Factoring MC: How does grading work with labeled options?**
   - What we know: `onAnswer(option.value)` sends the numeric value, which is compared to `correctAnswer.value`. For factoring, the correct answer is a numeric proxy (e.g., GCF value). Distractors have different numeric values.
   - What's unclear: Can we guarantee distractor numeric values are unique? Yes -- GCF distractors use different numeric proxies (partial GCF, wrong GCF).
   - Recommendation: Assign unique sequential integers (0, 1, 2, 3) as values for expression MC options. correctAnswer = numericAnswer(0). Distractors get values 1, 2, 3. This guarantees uniqueness and simplifies grading. The labels carry the expression strings.

2. **Should `selectAndFormatAnswer` force MC for factoring skills?**
   - What we know: Currently, Elo-based probability routes to free-text or MC. Factoring can't use free-text (no expression parser).
   - Recommendation: Add a check in `selectAndFormatAnswer`: if `problem.correctAnswer.type === 'numeric'` and the template has `domainConfig.expressionMC: true` (or a similar flag), always route to MC. Alternatively, have the domain handler return problems with pre-built MC options via a convention.

3. **Standards alignment?**
   - What we know: HSA-APR.A.1 covers polynomial arithmetic (add, subtract, multiply). HSA-SSE.A.2 covers factoring (GCF, difference of squares).
   - Recommendation: Use HSA-APR.A.1 for FOIL/evaluation/combined, HSA-SSE.A.2 for GCF/difference-of-squares/word problems.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: 8 existing HS domain implementations (phases 82-87)
- `src/services/mathEngine/types.ts` -- ExpressionAnswer type, Answer union, ChoiceOption
- `src/services/mathEngine/domains/quadraticEquations/` -- most recent domain pattern
- `src/components/session/CpaSessionContent.tsx` -- MC rendering pipeline
- `src/components/session/MultiSelectMC.tsx` -- label pattern on ChoiceOption

### Secondary (MEDIUM confidence)
- Common Core HSA-APR.A.1 and HSA-SSE.A.2 standards mapping

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - zero new dependencies, established domain pattern from 8 prior implementations
- Architecture: HIGH - three-plan pattern proven across all HS domains; label-enhanced MC is minimal change
- Pitfalls: HIGH - documented from 6 prior HS domains; each pitfall has a known resolution

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- no external dependencies)
