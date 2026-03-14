# Phase 91: Integration & Placement - Research

**Researched:** 2026-03-13
**Domain:** Cross-cutting integration — placement staircase, prerequisite DAG, skill map layout, store migration, domain intro strings
**Confidence:** HIGH

## Summary

Phase 91 is a wiring phase, not a domain-building phase. All 9 HS domain handlers (Phases 82-90) are complete and registered in the SKILLS array. The work is connecting them to the placement test, prerequisite graph, skill map UI, and ensuring existing grade-8 users can access the new content.

The codebase is well-structured for this integration. The placement staircase already uses `getSkillsByGrade()` which dynamically reads from the SKILLS registry, and the skill map layout computes columns from the OPERATIONS extracted from SKILLS. The main changes are: (1) bumping MAX_GRADE in PlacementTestScreen, (2) adding HS domains to the CAT item bank discrimination table, (3) adding cross-domain prerequisite edges between HS domains per INT-02, (4) updating the skill map layout to handle 27 columns without overflow, and (5) a store migration to trigger re-assessment for grade-8 users.

**Primary recommendation:** This phase has 5 discrete, well-scoped tasks. Each touches different files with minimal overlap. The riskiest item is the skill map layout (27 columns on a phone screen) which needs either a scrollable/grouped layout or a reduced node size.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INT-01 | Placement staircase extended to grade 12 — MAX_GRADE = 12, HS skills registered so staircase can sample them | PlacementTestScreen.tsx has `MAX_GRADE = 8` constant; itemBank.ts DOMAIN_DISCRIMINATION needs 9 HS entries |
| INT-02 | Prerequisite DAG edges wired for HS skills (linear_equations -> systems_equations -> quadratic_equations -> polynomials) | Current HS domains have intra-domain prereqs but most cross-domain edges are already present; need to verify/add the specified chain |
| INT-03 | Skill map layout updated to accommodate 27 total domains without overflow | skillMapLayout.ts computes columns per OPERATIONS; 27 columns at 400px = ~14px per column, needs grouping or horizontal scroll |
| INT-04 | Existing-user store migration — users capped at grade 8 can be placed into grade 9-12 via re-assessment trigger | STORE_VERSION=23; need v24 migration that resets placementComplete for users with placementGrade=8 |
| INT-05 | problemIntro.ts updated with domain intro strings for all 9 new HS domains | Already complete — all 27 domains have entries in INTROS record |
</phase_requirements>

## Standard Stack

No new libraries needed. This phase operates entirely within the existing codebase.

### Core (Existing)
| Library | Version | Purpose | Relevance |
|---------|---------|---------|-----------|
| Zustand | existing | Store + migrations | STORE_VERSION bump for INT-04 |
| react-native-svg | existing | Skill map rendering | Skill map layout changes for INT-03 |
| Jest + RNTL | existing | Testing | DAG validation, layout tests |

## Architecture Patterns

### File Change Map

```
INT-01 (Placement staircase):
  src/screens/PlacementTestScreen.tsx        — remove local MAX_GRADE=8, import from types.ts
  src/services/cat/itemBank.ts               — add 9 HS domain discrimination values

INT-02 (Prerequisite DAG):
  src/services/mathEngine/skills/*.ts        — add/verify cross-domain prereq edges
  src/__tests__/adaptive/prerequisiteGating.test.ts — update SKILLS.length, add HS edge tests

INT-03 (Skill map layout):
  src/components/skillMap/skillMapLayout.ts  — adapt for 27 columns (grouping or scroll)
  src/components/skillMap/SkillMapGraph.tsx   — may need horizontal ScrollView
  src/__tests__/components/skillMapLayout.test.ts — update assertions

INT-04 (Store migration):
  src/store/appStore.ts                      — STORE_VERSION = 24
  src/store/migrations.ts                    — v23->v24: reset placementComplete for grade-8 users
  src/store/slices/onboardingSlice.ts        — widen placementGrade type comment to 1-12

INT-05 (Intro strings):
  src/services/tutor/problemIntro.ts         — ALREADY COMPLETE (all 27 entries exist)
```

### Pattern: Placement Staircase Extension (INT-01)

**Current state:** PlacementTestScreen.tsx defines `const MAX_GRADE = 8` locally. The types.ts already has `export const MAX_GRADE: Grade = 12`. The screen should import from types.ts.

**Key insight:** The staircase algorithm (`generateForGrade`) calls `getSkillsByGrade(grade as Grade)`. Since all 9 HS domains already register skills at grades 8-12 via the SKILLS array, the staircase will automatically sample HS skills once MAX_GRADE is raised. No algorithm changes needed.

**CAT item bank gap:** `DOMAIN_DISCRIMINATION` in itemBank.ts is typed as `Record<string, number>` and falls back to 1.0 for unknown domains. The 9 HS domains need explicit discrimination values for proper IRT calibration. Recommended values:

```typescript
linear_equations: 1.3,
coordinate_geometry: 1.1,
sequences_series: 1.2,
statistics_hs: 1.0,
systems_equations: 1.3,
quadratic_equations: 1.4,
polynomials: 1.3,
exponential_functions: 1.2,
logarithms: 1.2,
```

### Pattern: Cross-Domain Prerequisites (INT-02)

**Current state analysis of HS cross-domain edges:**

The REQUIREMENTS.md specifies the chain: `linear_equations -> systems_equations -> quadratic_equations -> polynomials`. Examining the current prerequisites:

| Domain | Root Skill | Current Prerequisite | Cross-Domain? |
|--------|-----------|---------------------|---------------|
| linear_equations | one_step_addition | expressions.one-step-equation | YES (from expressions) |
| coordinate_geometry | slope | two_step_mixed | YES (from linear_equations) |
| sequences_series | arithmetic_next_term | multi_step | YES (from linear_equations) |
| statistics_hs | stats_stddev_concept | data-analysis.scatter-trend | YES (from data_analysis) |
| systems_equations | substitution_simple | one_step_addition | YES (from linear_equations) |
| quadratic_equations | factoring_monic | multi_step | YES (from linear_equations) |
| polynomials | foil_expansion | [] (empty!) | NO — root skill |
| exponential_functions | exp_evaluate | [] (empty!) | NO — root skill |
| logarithms | log10_eval | exp_evaluate | YES (from exponential_functions) |

**Missing edges per INT-02 spec:**
1. `polynomials.foil_expansion` should depend on `multi_step` (linear_equations) — currently a root skill with no prerequisites
2. `exponential_functions.exp_evaluate` should depend on `exponents.integer-exponent` or similar from the existing exponents domain — currently a root skill

**The INT-02 chain `linear_equations -> systems_equations -> quadratic_equations -> polynomials` is mostly wired already:**
- linear_equations -> systems_equations: via `substitution_simple` prereqs `one_step_addition` (linear_eq skill)
- linear_equations -> quadratic_equations: via `factoring_monic` prereqs `multi_step` (linear_eq skill)
- linear_equations -> sequences_series: via `arithmetic_next_term` prereqs `multi_step`
- exponential_functions -> logarithms: via `log10_eval` prereqs `exp_evaluate`

**Missing:** polynomials.foil_expansion has empty prerequisites, and exponential_functions.exp_evaluate has empty prerequisites. These should be wired to appropriate prereqs.

### Pattern: Skill Map 27-Column Layout (INT-03)

**Current implementation:** `computeNodePositions` creates one column per unique operation (MathDomain). With 27 domains, each column gets `width / 28` pixels. On a 400px phone that is ~14px per column — far too narrow for `NODE_RADIUS = 24` (48px diameter nodes).

**Options:**
1. **Horizontal ScrollView** — keep current layout but wrap in a horizontal scroll. Content width = 27 * ~60px = ~1620px. Most natural extension of existing code.
2. **Grade-grouped rows** — reorganize as rows by grade level (1-12 on Y axis), domains plotted within their grade. More compact but breaks the column-per-domain pattern.
3. **Reduced node size** — shrink NODE_RADIUS from 24 to ~12. Still tight at 27 columns but workable on tablets.

**Recommendation:** Horizontal ScrollView with the existing column layout. Minimum code change, maximum compatibility. The skill map already renders in an SVG with computed width/height — just make the SVG wider than the screen and wrap in a horizontal ScrollView.

**Implementation:**
```typescript
// In computeNodePositions, use a computed width instead of screen width
const MIN_COLUMN_SPACING = 64; // 2 * NODE_RADIUS + 16px gap
const contentWidth = Math.max(width, (numColumns + 1) * MIN_COLUMN_SPACING);
```

Then in SkillMapGraph.tsx, wrap the SVG in a `<ScrollView horizontal>`.

### Pattern: Store Migration for Re-Assessment (INT-04)

**Current state:** STORE_VERSION = 23. OnboardingSlice has `placementGrade: number | null` and `placementComplete: boolean`.

**Migration v23 -> v24:**
```typescript
if (version < 24) {
  // v23 -> v24: Existing grade-8 users can now be placed into grades 9-12.
  // Reset placement for users whose placement capped at grade 8
  // so they get a re-assessment prompt covering HS content.
  const placementGrade = state.placementGrade as number | null;
  if (placementGrade !== null && placementGrade >= 8) {
    state.placementComplete = false;
    // Keep placementGrade as a hint for the staircase start point
  }
}
```

**Key concern:** The re-assessment should only trigger for users who *were capped* at grade 8 (i.e., they could have scored higher but the test stopped). The safest heuristic: if `placementGrade >= 8`, reset `placementComplete = false`. This covers exact-8 users and also anyone who might have been capped. Users at grade 7 or below genuinely placed there and don't need re-assessment.

**UI trigger:** After migration, `placementComplete === false` will cause the home screen to show the placement test prompt again naturally via existing onboarding flow.

### Anti-Patterns to Avoid

- **Do NOT modify SkillDefinition type** — prerequisites is already `readonly string[]`, no schema changes needed.
- **Do NOT add grade filtering to skill map** — the skill map shows ALL skills, not just the child's grade.
- **Do NOT change the staircase algorithm** — it already handles grade climbing correctly, just needs MAX_GRADE updated.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Grade-filtered item bank | Custom filter logic | `buildItemBankForGrades(minGrade, maxGrade)` | Already exists in itemBank.ts |
| Skill graph validation | Manual edge checking | Existing cycle-detection test in prerequisiteGating.test.ts | Already validates all edges |
| Domain intro strings | New mechanism | Existing `problemIntro.ts` INTROS record | Already has all 27 entries |

## Common Pitfalls

### Pitfall 1: Skill Count Assertion Breakage
**What goes wrong:** `prerequisiteGating.test.ts` line 43 asserts `SKILLS.length === 201`. Adding/removing prerequisite edges does not change skill count, but if any skill is accidentally duplicated or removed during edits, this test catches it.
**How to avoid:** Do NOT change any skill arrays — only modify `prerequisites` fields within existing skill definitions.

### Pitfall 2: Skill Map Node Overlap at 27 Columns
**What goes wrong:** 27 columns on a 400px phone screen means ~14px per column. NODE_RADIUS is 24, so nodes are 48px wide — they overlap massively.
**How to avoid:** Must implement horizontal scrolling or column grouping. Cannot just bump MAX_GRADE and expect the skill map to work.

### Pitfall 3: PlacementTestScreen handleAnswer Only Handles Numeric
**What goes wrong:** PlacementTestScreen uses `answerNumericValue(currentProblem.correctAnswer)` for comparison. HS domains with multi_select answers (quadratic_equations) or fraction answers (coordinate_geometry slope) will not work correctly in the placement MC format.
**How to avoid:** The placement test generates its own MC distractor set (`answerOptions` in the component) using numeric values only. Skills with non-numeric answers need to either be excluded from placement sampling or have their `answerNumericValue()` fallback handle them correctly. Check that `answerNumericValue` returns sensible values for FractionAnswer and MultiSelectAnswer types. Per STATE.md decisions: `answerNumericValue` for multi_select returns `values[0]` as Elo proxy, and `fractionAnswer` types exist. The placement test should filter to numeric-answer skills only, or the existing fallback may be acceptable since the test just checks `answer === correctValue`.

### Pitfall 4: Missing DOMAIN_DISCRIMINATION Fallback
**What goes wrong:** `DOMAIN_DISCRIMINATION` defaults to 1.0 for missing keys. This is acceptable but not optimal — explicit values ensure proper IRT calibration.
**How to avoid:** Add all 9 HS domain entries explicitly.

### Pitfall 5: Migration Runs on All Users Including New Users
**What goes wrong:** The v24 migration resets `placementComplete` for grade-8 users. New users start with `placementComplete: false` and `placementGrade: null`, so the migration is a no-op for them (null !== 8). But if a new user somehow gets `placementGrade = 8` before the migration runs, they'd get an unwanted reset.
**How to avoid:** Guard on `placementGrade !== null && placementGrade >= 8` — null check prevents false positives.

## Code Examples

### INT-01: PlacementTestScreen MAX_GRADE Fix
```typescript
// Before:
const MAX_GRADE = 8;

// After: import from types.ts
import { MAX_GRADE } from '@/services/mathEngine/types';
// Remove local constant entirely
```

### INT-02: Adding Missing Cross-Domain Prerequisites
```typescript
// In polynomials.ts — foil_expansion currently has prerequisites: []
// Change to:
prerequisites: ['multi_step'],  // requires multi-step linear equations

// In exponentialFunctions.ts — exp_evaluate currently has prerequisites: []
// Change to:
prerequisites: ['exponents.integer-exponent'],  // requires basic exponent evaluation
```

### INT-04: Store Migration v24
```typescript
if (version < 24) {
  // v23 -> v24: HS placement re-assessment for grade-8 users
  const pg = state.placementGrade as number | null;
  if (pg !== null && pg >= 8) {
    state.placementComplete = false;
  }
}
```

### INT-03: Horizontal Scroll Skill Map
```typescript
// In SkillMapGraph.tsx wrapping:
<ScrollView horizontal showsHorizontalScrollIndicator>
  <Svg width={contentWidth} height={height}>
    {/* existing nodes and edges */}
  </Svg>
</ScrollView>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MAX_GRADE = 8 in PlacementTestScreen | Should import MAX_GRADE from types.ts (already = 12) | Phase 80 set MAX_GRADE=12 in types.ts | PlacementTestScreen still has stale local constant |
| 18-domain skill map | 27-domain skill map | Phase 91 | Layout algorithm needs update |
| Placement caps at grade 8 | Placement extends to grade 12 | Phase 91 | Existing users need re-assessment trigger |

## Open Questions

1. **Placement test multi-select answer handling**
   - What we know: PlacementTestScreen uses `answerNumericValue()` for answer comparison and generates numeric-only MC distractors. Quadratic equations use multi_select answers.
   - What's unclear: Should placement test skip multi_select skills, or does `answerNumericValue` returning `values[0]` work acceptably as a placement proxy?
   - Recommendation: Filter placement to numeric-answer skills only via a guard in `generateForGrade`. This is safer than relying on proxy values for a placement decision.

2. **Skill map grouping vs scrolling**
   - What we know: 27 columns do not fit on a phone screen without scrolling or grouping.
   - What's unclear: Product preference for scroll vs. grouped layout.
   - Recommendation: Horizontal scroll — least invasive change, preserves existing column-per-domain pattern.

3. **Prerequisite chain for polynomials/exponentials**
   - What we know: INT-02 specifies `linear_equations -> systems_equations -> quadratic_equations -> polynomials`. Currently polynomials.foil_expansion and exponential_functions.exp_evaluate are root skills.
   - What's unclear: Should exponential_functions chain from exponents domain or remain independent?
   - Recommendation: Wire `foil_expansion` prereq to `multi_step` (linear equations). Wire `exp_evaluate` prereq to `exponents.integer-exponent` (existing exponents domain). This matches the pedagogical progression.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo + RNTL |
| Config file | jest.config.js |
| Quick run command | `npm test -- --testPathPattern=prerequisiteGating` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INT-01 | Placement staircase reaches grade 12 | unit | `npm test -- --testPathPattern=PlacementTestScreen` | Needs new test assertions |
| INT-02 | Prerequisite DAG includes HS edges | unit | `npm test -- --testPathPattern=prerequisiteGating` | Existing file, update assertions |
| INT-03 | Skill map renders 27 domains | unit | `npm test -- --testPathPattern=skillMapLayout` | Existing file, update assertions |
| INT-04 | Grade-8 users get re-assessment | unit | `npm test -- --testPathPattern=migrations` | Needs new migration test |
| INT-05 | All 9 domains display intros | unit | `npm test -- --testPathPattern=problemIntro` | Needs new test file |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<relevant_pattern> -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] `src/__tests__/services/tutor/problemIntro.test.ts` -- covers INT-05 (verify all 27 domains have non-default intros)
- [ ] Migration test for v24 in existing migration test file or new file -- covers INT-04

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of all files listed in File Change Map
- `src/screens/PlacementTestScreen.tsx` — confirmed MAX_GRADE = 8 (local), types.ts MAX_GRADE = 12
- `src/services/cat/itemBank.ts` — confirmed DOMAIN_DISCRIMINATION missing 9 HS domains
- `src/services/tutor/problemIntro.ts` — confirmed all 27 domain entries present (INT-05 already done)
- `src/components/skillMap/skillMapLayout.ts` — confirmed column-per-operation layout
- `src/store/migrations.ts` — confirmed STORE_VERSION = 23, migration chain pattern
- `src/services/mathEngine/skills/*.ts` — confirmed current prerequisite edges for all 9 HS domains

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, pure integration
- Architecture: HIGH - all patterns visible in existing codebase
- Pitfalls: HIGH - identified through direct code inspection
- INT-05 status: HIGH - confirmed already complete via problemIntro.ts inspection

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable codebase, no external dependency risk)
