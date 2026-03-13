# Phase 85: Statistics Extensions Domain - Research

**Researched:** 2026-03-13
**Domain:** High school statistics — standard deviation, normal distribution, z-scores, percentiles
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STATS-01 | `statistics_hs` domain handler — standard deviation (conceptual), normal distribution properties, z-scores (integer), percentiles (G9-11, 5 skills) | Construction-from-answer pattern; all skills yield integer answers when inputs are engineered; 5-skill DAG mirrors sequences_series structure |
| STATS-02 | Statistics HS templates extending existing data_analysis infrastructure | New operation key `statistics_hs`; templates follow ProblemTemplate shape with `distractorStrategy: 'domain_specific'`; `domainConfig.type` routes to sub-generator |
| STATS-03 | Word problem variants for statistics (survey, test scores contexts) | Prefix-mode WordProblemTemplate entries in `wordProblems/templates.ts`; two templates suffice at minGrade 9 |
| STATS-04 | AI tutor prompt guidance for statistics extensions | No code changes needed — prompt system is domain-agnostic; manual QA checkpoint verifies HINT/BOOST distinction between conceptual and computational problem types |
</phase_requirements>

---

## Summary

Phase 85 adds a `statistics_hs` math domain covering grade-9-11 high school statistics: standard deviation concept, normal distribution (68-95-99.7 rule), z-score calculation, percentile identification, and a word problem skill. The domain follows the same three-plan structure established by phases 82-84 (Wave 0 stubs → core domain wiring → word problems + tutor QA).

The central engineering challenge is keeping all answers as integers. Standard deviation and z-scores naturally produce decimals. The solution is to work entirely backwards using the construction-from-answer pattern: choose an integer z-score first, then engineer integer-valued μ and σ such that x = μ + z·σ is also an integer. Normal distribution problems use the 68-95-99.7 rule only, which yields integer percentages. Percentile problems use lookup-style questions (e.g., "what percentage of scores fall below the mean?") rather than computation, which are always integer answers.

The domain does not duplicate any K-8 `data_analysis` skill. The `data_analysis` domain covers dot plots, histograms, box plots, scatter plots, mean/median/mode/range — all grades 4-8. The `statistics_hs` domain starts at grade 9 and covers inferential/distributional concepts not present in the K-8 domain.

**Primary recommendation:** Use construction-from-answer with engineered integer inputs throughout. For z-scores: pick z ∈ {-3,-2,-1,0,1,2,3}, pick σ ∈ {5,10,15,20}, compute μ as a round number, then present x = μ + z·σ. For normal distribution: use the 68-95-99.7 rule exclusively — all answers are integer percentages.

---

## Standard Stack

### Core (confirmed from codebase inspection, HIGH confidence)

| File/Module | Purpose | Pattern |
|-------------|---------|---------|
| `src/services/mathEngine/types.ts` | MathDomain union — must add `'statistics_hs'` | Exhaustive union; TypeScript will error at all incomplete Record sites |
| `src/services/mathEngine/domains/registry.ts` | `HANDLERS: Record<MathDomain, DomainHandler>` | Add `statistics_hs: statisticsHsHandler` |
| `src/services/mathEngine/skills/index.ts` | `SKILLS` array barrel | Add `...STATISTICS_HS_SKILLS` import + spread |
| `src/services/mathEngine/templates/index.ts` | `ALL_TEMPLATES` array barrel | Add `...STATISTICS_HS_TEMPLATES` import + spread |
| `src/services/mathEngine/bugLibrary/index.ts` | Bug pattern barrel | Add `export { STATISTICS_HS_BUGS }` |
| `src/services/video/videoMap.ts` | Domain → YouTube video ID | Uncomment reserved entry: `statistics_hs: 'h8EYEJ32oQ8'` |
| `src/services/mathEngine/wordProblems/templates.ts` | Word problem prefix templates | Add 2-3 prefix-mode entries for `'statistics_hs'` at `minGrade: 9` |

### Test files requiring count assertions updates (HIGH confidence — verified in source)

| Test File | Current Assertion | New Assertion After Phase 85 |
|-----------|-------------------|------------------------------|
| `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` | `ALL_OPERATIONS` array has 21 entries; `total skills = 170`; `'all skills are covered across the 21 domains'` | 22 entries; `total = 175`; `'22 domains'` |
| `src/__tests__/adaptive/prerequisiteGating.test.ts` | `SKILLS.length toBe(170)` | `SKILLS.length toBe(175)` |
| `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` | `expectedTypes` map | Add `statistics_hs: ['numeric']` |
| `src/__tests__/mathEngine/wordProblems.test.ts` | `ALL_OPERATIONS` array | Add `'statistics_hs'` |

---

## Architecture Patterns

### Recommended File Structure

```
src/services/mathEngine/
├── skills/statisticsHs.ts                           # 5 SkillDefinitions
├── templates/statisticsHs.ts                        # 5 ProblemTemplates
├── bugLibrary/statisticsHsBugs.ts                   # 3-4 BugPatterns
├── domains/statisticsHs/
│   ├── generators.ts                                # generateStdDevConcept, generateNormalDist, generateZScore, generatePercentile
│   ├── statisticsHsHandler.ts                       # DomainHandler switch on domainConfig.type
│   └── index.ts                                     # barrel: export { statisticsHsHandler }
```

This matches the structure used by `sequencesSeries/`, `coordinateGeometry/`, and `linearEquations/`.

### Pattern 1: Construction-from-Answer (ALL generators MUST use this)

All 9 HS domain handlers use construction-from-answer. Pick the answer first, build the problem around it.

**Z-score generator example:**
```typescript
// Source: codebase pattern (generators.ts in sequencesSeries, coordinateGeometry, linearEquations)
export function generateZScore(
  _template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  // Answer-first: pick z ∈ {-2,-1,0,1,2}
  const z = rng.intRange(-2, 2);
  // Pick σ from small multiples to keep x integer
  const sigma = rng.choice([5, 10, 15, 20]);
  // Pick μ as a round number (mean)
  const mu = rng.intRange(5, 15) * 10; // 50-150
  // x = mu + z * sigma — guaranteed integer
  const x = mu + z * sigma;

  // Distractor operands (pre-computed wrong answers)
  const wrongSignFlip = mu - z * sigma;   // negated z
  const wrongForgetMu = z * sigma;        // forgot to add mean

  const questionText = `A dataset has mean ${mu} and standard deviation ${sigma}. What is the z-score of the value ${x}?`;

  return {
    operands: [wrongSignFlip, wrongForgetMu],
    correctAnswer: numericAnswer(z),
    questionText,
    metadata: {},
  };
}
```

### Pattern 2: distractorStrategy: 'domain_specific' (REQUIRED for all HS templates)

```typescript
// Source: all HS domain templates (sequencesSeries, linearEquations, coordinateGeometry)
{
  id: 'stats_zscore',
  operation: 'statistics_hs',
  skillId: 'stats_zscore',
  grades: [10],
  baseElo: 1150,
  digitCount: 1,
  distractorStrategy: 'domain_specific',  // REQUIRED — disables ±1 adjacency
  standards: ['HSS-ID.A.4'],
  domainConfig: { type: 'zscore' },
}
```

### Pattern 3: Skill ID naming convention

From STATE.md decision `[Phase 083]`: use prefixed IDs to avoid collision with any existing skill. Use `stats_` prefix for all statistics_hs skill IDs.

- `stats_stddev_concept` — what standard deviation measures (conceptual MC)
- `stats_normal_rule` — 68-95-99.7 rule identification
- `stats_zscore` — calculate z = (x - μ) / σ with integer inputs
- `stats_percentile` — identify percentile from z-score and normal distribution
- `stats_word_problem` — word problem skill (reuses z-score generator)

### Pattern 4: domainConfig.type dispatch

```typescript
// Source: sequencesSeriesHandler.ts pattern
export const statisticsHsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    const type = (template.domainConfig ?? {}).type as string;
    switch (type) {
      case 'stddev_concept':   return generateStdDevConcept(template, rng);
      case 'normal_rule':      return generateNormalDistribution(template, rng);
      case 'zscore':           return generateZScore(template, rng);
      case 'percentile':       return generatePercentile(template, rng);
      case 'word_problem':     return generateZScore(template, rng); // reuse z-score generator
      default:
        throw new Error(`statisticsHsHandler: unknown domainConfig.type "${type}".`);
    }
  },
};
```

### Pattern 5: Word problem prefix mode (sequences_series precedent)

```typescript
// Source: wordProblems/templates.ts — sequences_series section (lines 512-562)
{
  id: 'wp_stats_survey',
  operations: ['statistics_hs'],
  mode: 'prefix',
  template: '{name} is analyzing survey results about test scores at {place}.',
  question: '',
  minGrade: 9,
},
{
  id: 'wp_stats_scores',
  operations: ['statistics_hs'],
  mode: 'prefix',
  template: '{name} is studying how exam scores are distributed in a class.',
  question: '',
  minGrade: 9,
},
{
  id: 'wp_stats_data',
  operations: ['statistics_hs'],
  mode: 'prefix',
  template: '{name} collected data on heights of students and is analyzing the spread.',
  question: '',
  minGrade: 10,
},
```

### Anti-Patterns to Avoid

- **Non-integer z-scores:** If σ does not evenly divide (x - μ), the z-score is a decimal. Always pick z first, then engineer x. Never pick x first and compute z.
- **Standard deviation computation from raw data:** SD from a dataset requires summing squared deviations — cannot produce integer answers without carefully engineered datasets. The requirement says "standard deviation (conceptual)" — use a conceptual framing instead (e.g., "which dataset has the larger standard deviation?").
- **68-95-99.7 with non-standard percentages:** Do not compute probabilities for arbitrary z values (requires normal CDF). Stick to the named rule: 68% within 1σ, 95% within 2σ, 99.7% within 3σ.
- **Percentile from scratch:** Do not have students compute a percentile rank from raw data — too many steps, non-integer results. Use the correspondence between z-scores and the named normal distribution percentages.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Integer-safe z-scores | Custom rounding/truncation logic | Construction-from-answer: pick z ∈ integers, engineer μ and σ | Rounding changes the correct answer, breaking grading |
| Domain-specific distractors | Generic ±1 adjacency | `distractorStrategy: 'domain_specific'` on all templates | ±1 on z-scores (-1 → 0 → 1) is meaningless and maps to a different valid z-score |
| Seeded randomness | `Math.random()` | `SeededRng` from `src/services/mathEngine/seededRng.ts` | Reproducibility required for test stubs (seeds 1-20) |
| Wrong answer computation | Inline arithmetic in handler | `operands[0]`, `operands[1]` as pre-computed distractors via BugPattern | Bug Library pattern feeds `bugDescription` to AI tutor |
| Answer factories | `{ type: 'numeric', value: z }` inline | `numericAnswer(z)` from `types.ts` | Consistency with all other domain generators |

---

## Common Pitfalls

### Pitfall 1: Decimal z-scores from arbitrary inputs
**What goes wrong:** Generator picks x=73, μ=70, σ=6 → z=0.5 (decimal). Answer fails integer check.
**Why it happens:** Selecting x and then computing z, rather than picking z first.
**How to avoid:** Construction-from-answer: `z = rng.intRange(-2, 2)`, `sigma = rng.choice([5,10,15,20])`, `x = mu + z * sigma`.
**Warning signs:** Any `Number.isInteger(value) === false` in the seeds 1-20 test loop.

### Pitfall 2: Standard deviation concept using computation
**What goes wrong:** Generator asks student to compute σ from a list of 5 numbers — multi-step, always produces non-integer σ for reasonable datasets.
**Why it happens:** Confusing "conceptual" with "computational" standard deviation.
**How to avoid:** STATS-01 spec says "standard deviation (conceptual)" — present two datasets, ask which has larger spread, or state that σ=8 means "most values are within 8 of the mean" and ask a recognition question. The correct answer is an integer index (e.g., which dataset: A=1 or B=2, represented as `numericAnswer(1)` or `numericAnswer(2)`).

### Pitfall 3: MathDomain exhaustive Record TypeScript errors
**What goes wrong:** Adding `'statistics_hs'` to the MathDomain union makes TypeScript error at every `Record<MathDomain, ...>` that is missing the new key.
**Why it happens:** TypeScript strict mode; all Records over MathDomain are exhaustive.
**How to avoid:** After adding to the union in `types.ts`, fix ALL sites immediately — `registry.ts` (HANDLERS), `domainHandlerRegistry.test.ts` (ALL_OPERATIONS + expectedTypes), `wordProblems.test.ts` (ALL_OPERATIONS), `videoMap.ts` (add key). Check with `npm run typecheck` before committing each wave.
**Warning signs:** TypeScript error `Property 'statistics_hs' is missing in type...`

### Pitfall 4: Skill count assertions are hardcoded
**What goes wrong:** Adding 5 skills breaks `domainHandlerRegistry.test.ts` assertion `expect(total).toBe(170)` and `prerequisiteGating.test.ts` assertion `expect(SKILLS.length).toBe(170)`.
**Why it happens:** Hardcoded counts in test assertions.
**How to avoid:** Update both assertions to 175 in the Wave 0 stub plan (085-01-PLAN.md). The count 170 + 5 = 175.
**Warning signs:** Test failure message `Expected: 175, Received: 170` or vice versa.

### Pitfall 5: Normal distribution percentages exceeding 100
**What goes wrong:** Generating "percentage of values within 3σ" as distractor 103%, or computing overlapping regions.
**Why it happens:** Misunderstanding the symmetric cumulative nature of the rule.
**How to avoid:** Constrain distractors to: wrong rule band (e.g., uses 95% instead of 68%), inverted reading (32% instead of 68%), wrong tail (50% instead of 84%). All are plausible integer values ≤ 100.

### Pitfall 6: Prerequisite chain — statistics_hs depends on data_analysis
**What goes wrong:** statistics_hs skills list `data-analysis.scatter-trend` as prerequisite but the ID format is dotted, unlike flat HS skill IDs.
**Why it happens:** K-8 skill IDs use dot-notation (`data-analysis.scatter-trend`) while HS skills use flat underscore IDs (`arithmetic_next_term`).
**How to avoid:** The prerequisite for `stats_stddev_concept` should be `'data-analysis.scatter-trend'` (the last K-8 data analysis skill). Use the exact string from `dataAnalysis.ts` line 98: `'data-analysis.scatter-trend'`.

---

## 5 Skills Design

Mapping STATS-01 spec to 5 concrete skills with integer-safe generation strategy:

| Skill ID | Name | Grade | Generator Strategy | Answer Type |
|----------|------|-------|-------------------|-------------|
| `stats_stddev_concept` | Standard Deviation Concept | 9 | Present two datasets A/B, ask which has larger spread. Answer is 1 or 2 (index). | `numericAnswer(1 or 2)` |
| `stats_normal_rule` | Normal Distribution (68-95-99.7 Rule) | 9 | Given mean/SD and a score, ask "what percent of values fall within Nσ?" Answer is 68, 95, or 99.7 → use 68, 95, 100 (round 99.7) or frame as integer percent. | `numericAnswer(68)` etc. |
| `stats_zscore` | Calculate a Z-Score | 10 | Construction-from-answer: z ∈ {-2,-1,0,1,2}, σ ∈ {5,10,15,20}, x = μ + z·σ. | `numericAnswer(z)` |
| `stats_percentile` | Percentile and Normal Distribution | 10 | Given z-score context, ask what percentile. Use: z=0→50th, z=1→84th, z=-1→16th, z=2→97th, z=-2→2nd. Answers are integers. | `numericAnswer(50)` etc. |
| `stats_word_problem` | Statistics Word Problems | 10 | Prefix-mode wrapping of z-score generator. Survey/test-score contexts. | `numericAnswer(z)` |

**Note on `stats_normal_rule` integer rounding:** 99.7% is conventionally stated as such in textbooks. Use 68 and 95 for 1σ and 2σ; for the 3σ question, ask "approximately what percent" and accept 100 as the answer, OR only generate 1σ and 2σ questions in this template. The simpler approach: only use the 68 and 95 bands in generation, keeping answers strictly integer.

---

## Code Examples

### Skill definitions (patterns from sequencesSeries.ts)

```typescript
// Source: src/services/mathEngine/skills/statisticsHs.ts (to be created)
export const STATISTICS_HS_SKILLS: readonly SkillDefinition[] = [
  {
    id: 'stats_stddev_concept',
    name: 'Standard Deviation Concept',
    operation: 'statistics_hs',
    grade: 9,
    standards: ['HSS-ID.A.2'],
    prerequisites: ['data-analysis.scatter-trend'],
  },
  {
    id: 'stats_normal_rule',
    name: 'Normal Distribution (68-95 Rule)',
    operation: 'statistics_hs',
    grade: 9,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_stddev_concept'],
  },
  {
    id: 'stats_zscore',
    name: 'Calculate a Z-Score',
    operation: 'statistics_hs',
    grade: 10,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_normal_rule'],
  },
  {
    id: 'stats_percentile',
    name: 'Percentile and Normal Distribution',
    operation: 'statistics_hs',
    grade: 10,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_zscore'],
  },
  {
    id: 'stats_word_problem',
    name: 'Statistics Word Problems',
    operation: 'statistics_hs',
    grade: 10,
    standards: ['HSS-ID.A.4'],
    prerequisites: ['stats_zscore'],
  },
] as const;
```

### Template definitions (patterns from sequencesSeries templates)

```typescript
// Source: src/services/mathEngine/templates/statisticsHs.ts (to be created)
export const STATISTICS_HS_TEMPLATES: readonly ProblemTemplate[] = [
  {
    id: 'stats_stddev_concept',
    operation: 'statistics_hs',
    skillId: 'stats_stddev_concept',
    grades: [9],
    baseElo: 1000,
    digitCount: 1,
    distractorStrategy: 'domain_specific',
    standards: ['HSS-ID.A.2'],
    domainConfig: { type: 'stddev_concept' },
  },
  // ... (one template per skill)
] as const;
```

### Bug pattern shape (from sequencesSeriesBugs.ts)

```typescript
// Source: src/services/mathEngine/bugLibrary/sequencesSeriesBugs.ts — pattern
export const STATISTICS_HS_BUGS: readonly BugPattern[] = [
  {
    id: 'stats_zscore_sign_flip',
    operations: ['statistics_hs' as MathDomain],
    description:
      'Student negated the z-score — subtracted (x - μ) instead of (x - μ) / σ direction, ' +
      'getting the opposite sign.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      return a; // operands[0] = wrongSignFlip (negated z)
    },
  },
  {
    id: 'stats_zscore_forgot_mean',
    operations: ['statistics_hs' as MathDomain],
    description:
      'Student computed z * σ without subtracting the mean first, confusing the formula.',
    minDigits: 1,
    compute(_a: number, b: number, _operation: MathDomain): number | null {
      return b; // operands[1] = wrongForgetMu
    },
  },
  {
    id: 'stats_normal_wrong_band',
    operations: ['statistics_hs' as MathDomain],
    description:
      'Student applied the wrong σ band — used 68% when 95% was correct, or vice versa.',
    minDigits: 1,
    compute(a: number, _b: number, _operation: MathDomain): number | null {
      return a; // operands[0] = wrongBand
    },
  },
] as const;
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| K-8 only (data_analysis domain) | K-12 with statistics_hs as separate domain at G9-11 | No duplication; K-8 = descriptive stats; G9-11 = inferential/distributional |
| Placeholder handler for unknown HS domains | Full domain handler with typed dispatch | TypeScript exhaustiveness enforced at compile time |
| Manual distractor generation | Bug Library pattern with `BugPattern.compute()` | Bug descriptions feed AI tutor `bugDescription` param |

**Current counts after Phase 85:**
- MathDomain union: 21 → 22 variants
- SKILLS total: 170 → 175
- Test assertion: `ALL_OPERATIONS` has 21 entries → 22
- Test assertion: `total skills = 170` → 175

---

## Common Student Misconceptions (HS Statistics)

Verified against standard HS curriculum sources (HIGH confidence — well-established domain):

| Misconception | Bug Pattern ID | Distractor Operand |
|---------------|----------------|--------------------|
| Z-score sign flip (subtract μ from x vs x from μ) | `stats_zscore_sign_flip` | `wrongSignFlip = -(correct_z)` |
| Forget to divide by σ (compute x - μ only) | `stats_zscore_forgot_mean` | `wrongForgetMu = x - mu` |
| Confuse 68% and 95% normal bands | `stats_normal_wrong_band` | `wrongBand = 95 when answer is 68` or vice versa |
| Interpret percentile as absolute count | (conceptual distractor in MC) | Present a count value as distractor |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | jest.config.js (root) |
| Quick run command | `npm test -- --testPathPattern=statisticsHs` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STATS-01 | `statistics_hs` handler registered | unit | `npm test -- --testPathPattern=statisticsHs` | ❌ Wave 0 |
| STATS-01 | 5 skills registered for operation | unit | `npm test -- --testPathPattern=statisticsHs` | ❌ Wave 0 |
| STATS-01 | All 5 skills produce integer answers across seeds 1-20 | unit | `npm test -- --testPathPattern=statisticsHs` | ❌ Wave 0 |
| STATS-01 | domain count updated to 22 | unit | `npm test -- --testPathPattern=domainHandlerRegistry` | ✅ (assertion updated in Wave 0) |
| STATS-01 | skill count updated to 175 | unit | `npm test -- --testPathPattern=prerequisiteGating` | ✅ (assertion updated in Wave 0) |
| STATS-02 | All templates have `distractorStrategy: 'domain_specific'` | unit | `npm test -- --testPathPattern=statisticsHs` | ❌ Wave 0 |
| STATS-02 | Does not duplicate any data_analysis skill ID | unit | `npm test -- --testPathPattern=statisticsHs` | ❌ Wave 0 |
| STATS-03 | Word problem prefix templates exist for statistics_hs | unit | `npm test -- --testPathPattern=wordProblems` | ✅ (templates.ts assertion is presence-based) |
| STATS-04 | Manual QA — HINT never reveals z value | manual | Manual review checkpoint in Plan 03 | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=statisticsHs`
- **Per wave merge:** `npm test -- --testPathPattern="statisticsHs|domainHandlerRegistry|prerequisiteGating|wordProblems"`
- **Phase gate:** Full suite `npm test` green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/statisticsHs.test.ts` — covers STATS-01 and STATS-02; mirrors `sequencesSeries.test.ts` structure
- [ ] Updated assertions in `domainHandlerRegistry.test.ts`: `ALL_OPERATIONS` length 21→22, `total toBe(175)`, add `statistics_hs` to `expectedTypes` map
- [ ] Updated assertion in `prerequisiteGating.test.ts`: `SKILLS.length toBe(175)`
- [ ] Add `'statistics_hs'` to `ALL_OPERATIONS` array in `wordProblems.test.ts`

---

## Open Questions

1. **stats_normal_rule — 99.7 band as integer**
   - What we know: 99.7% is the standard value; 99 or 100 would be a rounding
   - What's unclear: Whether to include 3σ questions at all or restrict to 1σ and 2σ
   - Recommendation: Only generate 68% (1σ) and 95% (2σ) questions; skip 3σ entirely to avoid the 99.7 decimal. This gives 2 possible answer values, which is sufficient for distractors.

2. **stats_stddev_concept — MC answer representation**
   - What we know: "Which dataset has larger spread?" has answer A or B, best represented as `numericAnswer(1)` or `numericAnswer(2)`
   - What's unclear: Whether to use NumericAnswer(1/2) or a different Answer type
   - Recommendation: Use `numericAnswer(1)` or `numericAnswer(2)` following the established convention. The question text encodes "Dataset A" and "Dataset B" and the number 1 or 2 maps to selection. This is consistent with the existing NumericAnswer approach used for all similar multiple-choice-by-number questions.

3. **Prerequisite to data_analysis**
   - What we know: Phase 91 will wire DAG edges; `data_analysis → statistics_hs` is called out in ROADMAP.md Phase 91 description
   - What's unclear: Whether to add the prerequisite now or leave it for Phase 91
   - Recommendation: Add `prerequisites: ['data-analysis.scatter-trend']` to `stats_stddev_concept` now. Phase 91 just needs to verify it's there. The prerequisite ID `'data-analysis.scatter-trend'` is confirmed in `src/services/mathEngine/skills/dataAnalysis.ts` line 98.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `src/services/mathEngine/domains/sequencesSeries/generators.ts` — construction-from-answer pattern, operand layout, overflow guards
- `src/services/mathEngine/domains/sequencesSeries/sequencesSeriesHandler.ts` — DomainHandler shape, switch dispatch
- `src/services/mathEngine/bugLibrary/sequencesSeriesBugs.ts` — BugPattern shape, operand convention
- `src/services/mathEngine/skills/sequencesSeries.ts` — SkillDefinition shape, grade targeting, prerequisites
- `src/services/mathEngine/templates/sequencesSeries.ts` — ProblemTemplate shape, `distractorStrategy: 'domain_specific'`
- `src/services/mathEngine/types.ts` — MathDomain union, Answer discriminated union, numericAnswer factory
- `src/__tests__/mathEngine/domainHandlerRegistry.test.ts` — current count assertions (21 ops, 170 skills)
- `src/__tests__/adaptive/prerequisiteGating.test.ts` — SKILLS.length assertion (170)
- `src/services/mathEngine/wordProblems/templates.ts` — prefix mode convention, sequences_series entries
- `src/services/video/videoMap.ts` — reserved video ID for statistics_hs: `'h8EYEJ32oQ8'`
- `.planning/STATE.md` — construction-from-answer decision, skill ID naming decision, prefix mode decision
- `.planning/REQUIREMENTS.md` — STATS-01 through STATS-04 verbatim

### Secondary (MEDIUM confidence — curriculum standards)
- Common Core HSS-ID.A.2: use standard deviation to measure spread
- Common Core HSS-ID.A.4: use mean and standard deviation to fit to normal distribution, use z-scores to compare

---

## Metadata

**Confidence breakdown:**
- Standard stack (files to create/modify): HIGH — verified by direct inspection of phases 82-84 precedents
- Architecture patterns (construction-from-answer, distractors, templates): HIGH — matches exactly what is in the codebase
- Integer-safety strategy for statistics: HIGH — derived from math first principles, verified approach
- Common pitfalls: HIGH — identified from TypeScript exhaustive Records (confirmed compiler behavior) and math domain constraints
- Test count assertions: HIGH — read directly from test files (170 in two places)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable domain — no third-party library changes, pure internal pattern replication)
