# Phase 90: Logarithms Domain - Research

**Researched:** 2026-03-13
**Domain:** Math engine domain handler -- logarithms (evaluate log at special values, basic log rules, word problems)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LOG-01 | `logarithms` domain handler -- evaluate log at special values (log10, log2, ln of integer powers), basic log rules (G10-11, 4 skills) | Full domain handler pattern established across 10 prior HS domains; all wiring touchpoints identified; exponential_functions is the inverse-concept predecessor |
| LOG-02 | Logarithm templates with integer numeric answers only (special values -- no floating point) | NumericAnswer with integer-only constraint; construction-from-answer ensures integer results by picking base^answer = argument (inversion of exponentiation) |
| LOG-03 | Word problem variants for logarithms (pH, decibel, Richter scale contexts) | Prefix-mode word problem pattern established across all 8 prior HS domains; 3 templates at minGrade 10 |
| LOG-04 | AI tutor prompt guidance for logarithms | AI tutor uses MathDomain string in prompt; no domain-specific code required -- only manual QA sign-off on Socratic hints about "what power gives this result" reasoning |
</phase_requirements>

---

## Summary

Phase 90 introduces the `logarithms` math domain, following the identical code pattern established by all prior HS domain phases (82-89). The implementation is purely additive: no existing files are modified except to register the new domain in the standard wiring locations (types, registry, skills/index, templates/index, bugLibrary/distractorGenerator, bugLibrary/index, wordProblems/templates, SkillDomainSummary, videoMap).

The four skills are: evaluate log base 10 (log10(10^n) = n), evaluate log base 2 (log2(2^n) = n), evaluate natural log (ln(e^n) = n, with the answer being the exponent n which is always an integer), and log_word_problem. All answers are integers -- construction-from-answer ensures this by choosing the exponent (answer) first, then computing the argument as base^answer. This is the inverse of the exponential_functions domain: instead of "compute 2^3", it asks "log2(8) = ?". The success criteria explicitly requires integer-only answers at special values, meaning arguments must be exact integer powers of the base.

The key mathematical insight for this domain is that logarithms at "special values" are trivially integer: log_b(b^n) = n. By restricting arguments to perfect powers of the base (e.g., log10(100) = 2, log2(32) = 5, ln(e^3) = 3), every answer is guaranteed to be an integer. This eliminates the need for floating-point computation entirely. The word problem contexts (pH, decibel, Richter scale) naturally use log10, making them a perfect fit for this special-values approach.

**Primary recommendation:** Mirror the exponentialFunctionsHandler file structure exactly. Three plans: Wave 0 test stubs + wiring updates, core domain implementation (4 generators + handler + skills + templates + bugs), word problem templates + AI tutor QA.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| (none new) | -- | All logarithm math is inverse exponentiation (Math.log2, Math.log10, answer = exponent) | No external library needed; engine uses SeededRng for reproducible generation |

### Supporting
| File | Purpose | When to Use |
|------|---------|-------------|
| `src/services/mathEngine/seededRng.ts` | Reproducible random number generation | All generators receive `rng: SeededRng` -- never call `Math.random()` directly |
| `src/services/mathEngine/types.ts` | `numericAnswer`, `DomainProblemData`, `ProblemTemplate`, `SkillDefinition` | All domain handlers use these exact types |
| `src/services/mathEngine/bugLibrary/types.ts` | `BugPattern` interface | Each new bug pattern implements this interface |
| `src/services/mathEngine/domains/exponentialFunctions/generators.ts` | Inverse-concept reference | Logarithms are the inverse of exponentials; generator ranges should complement |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended File Structure

```
src/services/mathEngine/
  types.ts                                    MODIFY: add 'logarithms' to MathDomain union
  domains/
    registry.ts                               MODIFY: import + register logarithmsHandler
    index.ts                                  MODIFY: re-export logarithmsHandler
    logarithms/                               CREATE new directory
      generators.ts                           CREATE: 4 generator functions
      logarithmsHandler.ts                    CREATE: dispatch switch by domainConfig.type
      index.ts                                CREATE: barrel export
  skills/
    logarithms.ts                             CREATE: LOGARITHMS_SKILLS array (4 skills)
    index.ts                                  MODIFY: import + spread LOGARITHMS_SKILLS
  templates/
    logarithms.ts                             CREATE: LOGARITHMS_TEMPLATES array (4 templates)
    index.ts                                  MODIFY: import + spread LOGARITHMS_TEMPLATES
  bugLibrary/
    logarithmsBugs.ts                         CREATE: LOGARITHMS_BUGS array (3 bug patterns)
    distractorGenerator.ts                    MODIFY: add logarithms to BUGS_BY_OPERATION
    index.ts                                  MODIFY: export LOGARITHMS_BUGS
  wordProblems/
    templates.ts                              MODIFY: add 3 prefix-mode word problem templates
src/components/reports/
  SkillDomainSummary.tsx                      MODIFY: add logarithms to DOMAIN_LABELS + DOMAIN_ORDER
src/services/video/
  videoMap.ts                                 MODIFY: uncomment logarithms entry
```

### Pattern 1: Construction-from-Answer (MANDATORY for all generators)

**What:** Pick the correct answer (the exponent n) first, then derive the argument as base^n. The student is asked "What is log_base(base^n)?" and the answer is n.
**When to use:** Every single generator function in this domain.
**Example:**
```typescript
// log base 10 -- construction-from-answer
export function generateLogBase10(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Answer is always the exponent
  const answer = rng.intRange(1, 6); // log10(10) = 1 through log10(1000000) = 6
  const argument = Math.pow(10, answer);

  // Bug distractors:
  const wrongArgument = argument; // student gives the argument instead of the exponent
  const wrongOffByOne = answer + 1; // miscounted zeros

  return {
    operands: [wrongArgument, wrongOffByOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText: `Evaluate log\u2081\u2080(${argument.toLocaleString()}).`,
    metadata: {},
  };
}
```

### Pattern 2: Domain Handler Dispatch Switch

**What:** Handler reads `template.domainConfig.type` and dispatches to the matching generator.
**When to use:** `logarithmsHandler.ts` -- identical to exponentialFunctionsHandler structure.

### Pattern 3: Prefix-Mode Word Problems

**What:** A scene-setting sentence is prepended to the original question text. The `mode: 'prefix'` field controls this.
**When to use:** All 3 logarithm word problem prefix templates.

### Pattern 4: Skill ID Convention -- Domain-Prefixed Word Problem

**What:** Use `log_word_problem` as the word problem skill ID, not bare `word_problem`.
**Source:** Established pattern from `coord_word_problem`, `seq_word_problem`, `sys_word_problem`, `quad_word_problem`, `poly_word_problem`, `exp_word_problem`.

### Anti-Patterns to Avoid

- **Floating-point answers:** The success criteria is explicit: "all answers are integers (special values only -- no floating point)". Never generate a problem whose argument is not an exact integer power of the base. E.g., log10(50) = 1.699... is FORBIDDEN.
- **Log-law symbolic manipulation:** The success criteria says "without requiring log-law symbolic manipulation". Do NOT generate problems like "log(ab) = log(a) + log(b)" or "log(a^n) = n*log(a)" where the student must apply log rules symbolically. The problems should be direct evaluation: "what is log2(32)?".
- **Using Math.log() for computation:** Do NOT compute answers via `Math.log(x) / Math.log(base)` -- this can produce floating-point errors (e.g., `Math.log(8) / Math.log(2)` may not be exactly 3.0). Instead, the answer IS the exponent picked during construction. Construction-from-answer eliminates floating-point entirely.
- **Namespace collision in skill IDs:** Use `log10_eval`, `log2_eval`, `ln_eval`, `log_word_problem`. Verify none collide with existing skill IDs.
- **Large argument display:** log10(10^6) = 1,000,000 is fine with `toLocaleString()`, but log2(2^10) = 1024 is the practical max for log2 before arguments get unwieldy.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Random number generation | `Math.random()` | `rng.intRange(min, max)` | Seeded RNG ensures reproducible tests across seeds 1-20 |
| Distractor generation infrastructure | Custom distractor logic | `generateDistractors()` + `BUGS_BY_OPERATION` entry | The existing pipeline handles bug library lookup, adjacent +/-1, and random fill |
| Word problem interpolation | Custom template engine | Add entries to `wordProblems/templates.ts` | The `generateWordProblem()` function handles `{name}`, `{a}`, `{b}` interpolation automatically |
| Logarithm computation | `Math.log(x) / Math.log(base)` | Construction-from-answer: `answer = n; argument = base^n` | Avoids floating-point errors entirely |

**Key insight:** The entire domain is 5 files (generators.ts, handler.ts, index.ts, skills.ts, templates.ts) plus 2 additional files (bugs.ts, word problem entries) and ~9 one-liner modifications to existing registry/index/wiring files. There is no novel infrastructure to build.

---

## Common Pitfalls

### Pitfall 1: Floating-Point from Math.log()
**What goes wrong:** Using `Math.log(argument) / Math.log(base)` to compute the answer can produce values like 2.9999999999999996 instead of 3.
**Why it happens:** IEEE 754 floating-point arithmetic is imprecise for logarithms.
**How to avoid:** NEVER compute the answer via Math.log. Construction-from-answer: pick n first, compute argument = base^n, answer IS n. The answer is always an exact integer by construction.
**Warning signs:** `Number.isInteger(answerNumericValue(result.correctAnswer))` fails sporadically.

### Pitfall 2: SKILLS.length and ALL_OPERATIONS Hardcode Updates
**What goes wrong:** `prerequisiteGating.test.ts` asserts `SKILLS.length === 197` and `domainHandlerRegistry.test.ts` asserts 26 operations. Adding `logarithms` will break these unless they are updated in Wave 0.
**Why it happens:** The count tests are hard-coded.
**How to avoid:** Wave 0 test stubs MUST update: (a) SKILLS.length to 201 (197 + 4), (b) ALL_OPERATIONS array to include `logarithms` (27 entries), (c) handler count assertion to "27 operations".
**Warning signs:** `npm test -- --testPathPattern=prerequisiteGating` fails with "expected 197, received 201".

### Pitfall 3: SkillDomainSummary Record Exhaustiveness
**What goes wrong:** `SkillDomainSummary.tsx` has `DOMAIN_LABELS: Record<MathDomain, string>` and `DOMAIN_ORDER: MathDomain[]`. Adding `logarithms` to the MathDomain union in types.ts without updating these causes a TypeScript compile error.
**Why it happens:** `Record<MathDomain, string>` requires an entry for every union member.
**How to avoid:** Add `logarithms: 'Logarithms'` to DOMAIN_LABELS and add `'logarithms'` to DOMAIN_ORDER in the same plan that modifies types.ts.
**Warning signs:** `npm run typecheck` fails with "Property 'logarithms' is missing".

### Pitfall 4: Unicode Subscript Rendering for Log Bases
**What goes wrong:** Using plain text "log10" is ambiguous (could be log*10 or log base 10). Using Unicode subscripts for the base improves readability.
**Why it happens:** The math convention is log with subscript base.
**How to avoid:** Use Unicode subscript digits for the base: `log\u2081\u2080` for log10, `log\u2082` for log2. For ln (natural log), use the standard "ln" notation.
**Unicode subscript digits:** 0=\u2080, 1=\u2081, 2=\u2082, 3=\u2083, ..., 9=\u2089.

### Pitfall 5: Prefix-Mode Word Problem Pattern
**What goes wrong:** Using `{a}` and `{b}` in word problem templates causes operand mismatch when the underlying generator uses different operand semantics.
**Why it happens:** Logarithm operands are [wrongArgument, wrongOffByOne, answer], not [a, b].
**How to avoid:** Use prefix mode exclusively (same as all prior HS domains). The prefix sentence adds context before the original questionText without interpolating operands.

### Pitfall 6: Natural Log (ln) Special Values
**What goes wrong:** ln(e^n) = n requires e as the base, but e is irrational (~2.718). Computing Math.pow(Math.E, n) for large n produces non-integer arguments.
**Why it happens:** e^n is only integer for n=0 (gives 1).
**How to avoid:** Frame ln problems differently. Instead of showing the argument, show the exponential form: "Evaluate ln(e^4)." The student must know that ln(e^n) = n. The argument is displayed as "e^4" (using superscript), NOT as the numeric value 54.598... This avoids floating-point entirely and tests the same conceptual understanding. Alternatively, only use n=0 (ln(1) = 0) and n=1 (ln(e) = 1) where the display is clean.

---

## 4 Skills Design

Based on requirements analysis:

| # | Skill ID | Name | Grade | Description | Answer Type |
|---|----------|------|-------|-------------|-------------|
| 1 | log10_eval | Evaluate Log Base 10 | 10 | log10(10^n) = n, where n in [1,6] | numeric (integer) |
| 2 | log2_eval | Evaluate Log Base 2 | 10 | log2(2^n) = n, where n in [1,10] | numeric (integer) |
| 3 | ln_eval | Evaluate Natural Log | 11 | ln(e^n) = n, displayed as "ln(e^n)" not numeric argument | numeric (integer) |
| 4 | log_word_problem | Logarithm Word Problems | 10 | Prefix-mode word problems with pH/decibel/Richter contexts reusing log10_eval | numeric (integer) |

### Integer Answer Strategy per Skill

- **log10_eval:** Answer = n where argument = 10^n. n in [1,6]. Arguments: 10, 100, 1000, 10000, 100000, 1000000. All answers are small integers (1-6). Display argument with comma formatting via toLocaleString().
- **log2_eval:** Answer = n where argument = 2^n. n in [1,10]. Arguments: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024. All answers are small integers (1-10).
- **ln_eval:** Answer = n. Display as "ln(e^n)" using Unicode superscript for the exponent. n in [1,5]. No numeric argument needed -- the exponential form IS the display. This avoids irrational number display while testing the core concept (ln and e are inverses).
- **log_word_problem:** Reuses log10_eval generator. Prefix templates add real-world context (pH, decibel, Richter).

### Word Problem Contexts (3 templates)

1. **pH scale:** "A chemist measures the hydrogen ion concentration of a solution. The pH is calculated using log base 10." Reuses log10_eval. Answers 1-6 correspond to acidic pH values.
2. **Decibel scale:** "A sound engineer is measuring noise levels. The decibel scale uses log base 10 to compare sound intensities." Reuses log10_eval.
3. **Richter scale:** "A seismologist is analyzing earthquake data. The Richter scale uses log base 10 to measure earthquake magnitude." Reuses log10_eval.

---

## Code Examples

### Log Base 10 Generator
```typescript
// Unicode subscript digits for log base display
const SUBSCRIPTS: Record<number, string> = {
  0: '\u2080', 1: '\u2081', 2: '\u2082', 3: '\u2083', 4: '\u2084',
  5: '\u2085', 6: '\u2086', 7: '\u2087', 8: '\u2088', 9: '\u2089',
};

const SUPERSCRIPTS: Record<number, string> = {
  2: '\u00B2', 3: '\u00B3', 4: '\u2074', 5: '\u2075',
};

export function generateLog10Eval(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const answer = rng.intRange(1, 6);
  const argument = Math.pow(10, answer);

  const wrongArgument = argument;         // gave the argument instead of exponent
  const wrongOffByOne = answer + 1;       // miscounted zeros

  const formattedArg = argument.toLocaleString();
  const questionText = `Evaluate log${SUBSCRIPTS[1]}${SUBSCRIPTS[0]}(${formattedArg}).`;

  return {
    operands: [wrongArgument, wrongOffByOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}
```

### Log Base 2 Generator
```typescript
export function generateLog2Eval(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const answer = rng.intRange(1, 10);
  const argument = Math.pow(2, answer);

  const wrongArgument = argument;         // gave argument instead of exponent
  const wrongOffByOne = answer - 1;       // off-by-one

  const questionText = `Evaluate log${SUBSCRIPTS[2]}(${argument}).`;

  return {
    operands: [wrongArgument, wrongOffByOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}
```

### Natural Log (ln) Generator
```typescript
export function generateLnEval(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const answer = rng.intRange(1, 5);
  const sup = SUPERSCRIPTS[answer] ?? `^${answer}`;

  const wrongSquared = answer * answer;   // confused ln(e^n) with n^2
  const wrongOffByOne = answer + 1;

  // Display as "ln(e^n)" -- never show the numeric value of e^n
  const questionText = `Evaluate ln(e${sup}).`;

  return {
    operands: [wrongSquared, wrongOffByOne, answer],
    correctAnswer: numericAnswer(answer),
    questionText,
    metadata: {},
  };
}
```

### Bug Pattern File
```typescript
import type { MathDomain } from '../types';
import type { BugPattern } from './types';

export const LOGARITHMS_BUGS: readonly BugPattern[] = [
  {
    id: 'log_gave_argument',
    operations: ['logarithms' as MathDomain],
    description:
      'Student gave the argument instead of the exponent -- e.g., answered 1000 instead of 3 for log10(1000).',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      // operands[0] = wrongArgument (pre-stored by generator)
      return a;
    },
  },
  {
    id: 'log_off_by_one',
    operations: ['logarithms' as MathDomain],
    description:
      'Student miscounted -- off by one in the exponent (e.g., said 4 instead of 3 for log10(1000)).',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      // operands[1] = wrongOffByOne (pre-stored by generator)
      return b;
    },
  },
  {
    id: 'log_confused_base',
    operations: ['logarithms' as MathDomain],
    description:
      'Student confused the base -- e.g., computed log2 when the problem asks log10, or vice versa.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      return a;
    },
  },
] as const;
```

### Handler File
```typescript
import type { DomainHandler, DomainProblemData, ProblemTemplate } from '../../types';
import type { SeededRng } from '../../seededRng';
import {
  generateLog10Eval,
  generateLog2Eval,
  generateLnEval,
  generateLogWordProblem,
} from './generators';

export const logarithmsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;

    switch (type) {
      case 'log10_eval':
        return generateLog10Eval(template, rng);
      case 'log2_eval':
        return generateLog2Eval(template, rng);
      case 'ln_eval':
        return generateLnEval(template, rng);
      case 'word_problem':
        return generateLogWordProblem(template, rng);
      default:
        throw new Error(
          `logarithmsHandler: unknown domainConfig.type "${type}". ` +
            `Expected one of: log10_eval, log2_eval, ln_eval, word_problem.`,
        );
    }
  },
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| K-8 exponents (evaluate b^n) | HS logarithms (inverse: evaluate log_b(x)) | Phase 90 | New domain, inverse of exponential_functions |
| Bare `word_problem` skill ID | Domain-prefixed `log_word_problem` | Phase 83+ | Avoids Map key collision |
| videoMap.ts comment placeholders | Active MathDomain entries | Phase 82+ | `logarithms: 'Z5myJ8dg_rM'` must be uncommented |

**Deprecated/outdated:**
- videoMap.ts comment `// logarithms: 'Z5myJ8dg_rM' (Phase 90)`: Must be activated as a live entry when MathDomain gains `logarithms`.

---

## Wiring Touchpoints (Complete Checklist)

Every new HS domain must be wired in these locations:

| # | File | Change |
|---|------|--------|
| 1 | `src/services/mathEngine/types.ts` | Add `'logarithms'` to `MathDomain` union |
| 2 | `src/services/mathEngine/domains/registry.ts` | Import handler + add to `HANDLERS` record |
| 3 | `src/services/mathEngine/domains/index.ts` | Re-export handler |
| 4 | `src/services/mathEngine/skills/index.ts` | Import + spread `LOGARITHMS_SKILLS` into `SKILLS` |
| 5 | `src/services/mathEngine/templates/index.ts` | Import + spread `LOGARITHMS_TEMPLATES` into `ALL_TEMPLATES` |
| 6 | `src/services/mathEngine/bugLibrary/distractorGenerator.ts` | Add `logarithms: LOGARITHMS_BUGS` to `BUGS_BY_OPERATION` |
| 7 | `src/services/mathEngine/bugLibrary/index.ts` | Export `LOGARITHMS_BUGS` |
| 8 | `src/services/mathEngine/wordProblems/templates.ts` | Add 3 prefix-mode templates for `logarithms` |
| 9 | `src/services/video/videoMap.ts` | Uncomment `logarithms: 'Z5myJ8dg_rM'` |
| 10 | `src/components/reports/SkillDomainSummary.tsx` | Add to DOMAIN_LABELS + DOMAIN_ORDER |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (project root) |
| Quick run command | `npm test -- --testPathPattern=logarithms` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOG-01 | Handler registered for logarithms | unit | `npm test -- --testPathPattern=logarithms` | Wave 0 |
| LOG-01 | 4 skills registered | unit | `npm test -- --testPathPattern=logarithms` | Wave 0 |
| LOG-01 | All skills produce integer answers across seeds 1-20 | unit | `npm test -- --testPathPattern=logarithms` | Wave 0 |
| LOG-01 | domainHandlerRegistry updated to 27 operations | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | Modify existing |
| LOG-01 | prerequisiteGating SKILLS.length updated to 201 | unit | `npm test -- --testPathPattern=prerequisiteGating` | Modify existing |
| LOG-02 | Every template has distractorStrategy domain_specific | unit | `npm test -- --testPathPattern=logarithms` | Wave 0 |
| LOG-02 | All answers bounded (< 2000) | unit | `npm test -- --testPathPattern=logarithms` | Wave 0 |
| LOG-02 | Templates cover log10, log2, and ln | unit | `npm test -- --testPathPattern=logarithms` | Wave 0 |
| LOG-03 | Word problem prefix templates for logarithms exist | unit | `npm test -- --testPathPattern=logarithms` | Wave 0 |
| LOG-04 | AI tutor Socratic hints -- no answer revealed | manual QA | Manual review of 10+ hints | N/A (manual) |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=logarithms`
- **Per wave merge:** `npm test -- --testPathPattern="logarithms|domainHandlerRegistry|prerequisiteGating"`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/logarithms.test.ts` -- Wave 0 RED stubs covering LOG-01 through LOG-03
- [ ] Update `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` -- add `logarithms` to ALL_OPERATIONS, update count to 27
- [ ] Update `src/__tests__/adaptive/prerequisiteGating.test.ts` -- update SKILLS.length from 197 to 201

---

## Open Questions

1. **Unicode subscript rendering on all devices**
   - What we know: Unicode subscript digits (U+2080 through U+2089) are widely supported in modern fonts, including the default React Native font stack.
   - What's unclear: Whether all target Android devices render subscript digits correctly. The existing `SUPERSCRIPTS` map in exponents domain uses Unicode superscripts without issue.
   - Recommendation: Use Unicode subscripts for consistency with the existing superscript pattern. If rendering issues arise during testing, fall back to plain text "log10", "log2".

2. **ln(e^n) display -- showing "e" as a symbol**
   - What we know: The question should display "ln(e^4)" not "ln(54.598...)". The letter "e" is sufficient since students at grade 11 know it represents Euler's number.
   - What's unclear: Whether any other generators in the codebase display mathematical constants as symbols.
   - Recommendation: Display as `ln(e${superscript})` where the "e" is a plain letter. No special rendering needed.

3. **Prerequisite chain for logarithms skills**
   - What we know: Logarithms are the inverse of exponentiation. The `exp_evaluate` skill from exponential_functions is the natural prerequisite.
   - What's unclear: Whether the prerequisite DAG edges for HS skills will be wired in Phase 91 (Integration) or should be set here.
   - Recommendation: Set `prerequisites: ['exp_evaluate']` on log10_eval (the entry skill). Other log skills chain from log10_eval. Phase 91 will wire cross-domain DAG edges.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `src/services/mathEngine/domains/exponentialFunctions/` -- generators.ts, exponentialFunctionsHandler.ts (most recent HS domain pattern, inverse-concept reference)
- Direct code inspection of `src/services/mathEngine/types.ts` -- MathDomain union (26 current entries, will become 27)
- Direct code inspection of `src/services/mathEngine/domains/registry.ts` -- HANDLERS record (26 entries)
- Direct code inspection of `src/services/mathEngine/skills/exponentialFunctions.ts` -- skill definition pattern
- Direct code inspection of `src/services/mathEngine/templates/exponentialFunctions.ts` -- template definition pattern
- Direct code inspection of `src/services/mathEngine/bugLibrary/exponentialFunctionsBugs.ts` -- bug pattern structure
- Direct code inspection of `src/services/mathEngine/wordProblems/templates.ts` -- prefix-mode template pattern (3 exp templates at line 685+)
- Direct code inspection of `src/components/reports/SkillDomainSummary.tsx` -- DOMAIN_LABELS and DOMAIN_ORDER (26 entries)
- Direct code inspection of `src/services/video/videoMap.ts` -- logarithms video ID 'Z5myJ8dg_rM' comment at line 44
- Direct code inspection of `src/__tests__/mathEngine/exponentialFunctions.test.ts` -- Wave 0 test stub pattern (217 lines)
- Direct code inspection of `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` -- ALL_OPERATIONS (26 entries, "26 operations")
- Direct code inspection of `src/__tests__/adaptive/prerequisiteGating.test.ts` -- SKILLS.length === 197
- Direct code inspection of `.planning/REQUIREMENTS.md` -- LOG-01 through LOG-04 definitions

### Secondary (MEDIUM confidence)
- STATE.md decisions section -- skill ID convention, word problem collision avoidance, manual QA auto-approval pattern
- 089-RESEARCH.md -- exponential functions research for inverse-domain reference

### Tertiary (LOW confidence)
- Common Core HSF-BF.B.5 (logarithmic functions as inverses of exponential) standard mapping -- standard references are illustrative; project does not enforce standards validation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies; identical pattern to 10 prior HS domains
- Architecture: HIGH -- all 10 wiring touchpoints identified and verified against existing implementations; file structure mirrors exponentialFunctions exactly
- Pitfalls: HIGH -- integer constraint solved by construction-from-answer (never use Math.log); floating-point trap explicitly documented; SKILLS.length and ALL_OPERATIONS counts verified from current test files
- Skills design: HIGH -- logarithms at special values is mathematically trivial (log_b(b^n) = n); no edge cases when using construction-from-answer

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (stable codebase -- 90 days)
