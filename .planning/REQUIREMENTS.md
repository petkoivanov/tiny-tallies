# Requirements: Tiny Tallies v1.2 High School Math Expansion

**Defined:** 2026-03-12
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

---

## v1.2 Requirements

### Foundation

- [x] **FOUND-01**: Grade type expands from 1-8 to 1-12 across the entire codebase (types.ts, ProfileCreationWizard, age picker, BKT age brackets, store migration)
- [x] **FOUND-02**: Safety pipeline fixes for negative numbers — `checkAnswerLeak` regex fixed so negatives like `-3` are correctly detected as answer leaks
- [x] **FOUND-03**: `AgeBracket` type expanded to cover ages 10-18 (grades 9-12) so AI tutor hints use appropriate register for teens
- [x] **FOUND-04**: Store migration (STORE_VERSION bump) to persist new grade range and any new HS domain skill states
- [x] **FOUND-05**: NumberPad gains a `±` toggle key so students can enter negative number answers (e.g., x = -3)
- [x] **FOUND-06**: Multi-select MC answer type: `MultiSelectAnswer` added as 6th variant in Answer discriminated union, with `MultiSelectPresentation` in ProblemTemplate
- [x] **FOUND-07**: `MultiSelectMC` component — checkbox-style options with a "Check" button that activates once ≥1 option selected; binary grading (all-or-nothing)
- [x] **FOUND-08**: `distractorStrategy` field added to `ProblemTemplate` so algebra/HS templates can opt out of ±1 adjacency (use domain-specific distractor logic instead)
- [x] **FOUND-09**: App repositioned to K-12 — onboarding copy, age/grade picker range, and any "ages 6-9" UI copy updated to reflect wider audience

### YouTube Video Tutor

- [x] **VIDEO-01**: `react-native-youtube-iframe` + `react-native-webview` installed and working in Expo managed workflow build
- [x] **VIDEO-02**: "Watch a video" button appears in ChatPanel after hint ladder is exhausted (BOOST mode complete) — triggered by `ladderExhausted` signal from useTutor
- [x] **VIDEO-03**: Tapping "Watch a video" opens an inline YouTube player using youtube-nocookie.com for COPPA compliance
- [x] **VIDEO-04**: Static `videoMap.ts` curated lookup: `MathDomain → YouTube video ID` for all 27 domains (18 existing + 9 new), sourced from Khan Academy YouTube channel
- [x] **VIDEO-05**: Post-video vote: "Was this helpful?" with 👍 / 👎 buttons; vote stored per domain in tutorSlice
- [x] **VIDEO-06**: COPPA parental consent gate for YouTube — separate from AI tutor consent; parent must approve before first YouTube embed renders; stored in parental controls

### Linear Equations Domain

- [x] **LIN-01**: `linear_equations` domain handler — one-step, two-step, and multi-step equations with integer solutions (G8-9, 8 skills)
- [x] **LIN-02**: Linear equation templates with algebra-aware distractor generation (wrong-operation, sign-flip, forgot-to-divide bug patterns)
- [x] **LIN-03**: Word problem variants for linear equations (age, distance, money contexts)
- [x] **LIN-04**: AI tutor prompt guidance for linear equations (Socratic balance-model framing without revealing steps)

### Coordinate Geometry Domain

- [x] **COORD-01**: `coordinate_geometry` domain handler — slope, distance formula, midpoint, equation of a line (G8-10, 6 skills)
- [x] **COORD-02**: Coordinate geometry templates with numeric answers (slope as fraction, distance/midpoint as numeric)
- [x] **COORD-03**: Word problem variants for coordinate geometry (real-world distance/slope contexts)
- [x] **COORD-04**: AI tutor prompt guidance for coordinate geometry

### Sequences & Series Domain

- [x] **SEQ-01**: `sequences_series` domain handler — arithmetic sequences, geometric sequences, nth-term formula, partial sums (G9-11, 5 skills)
- [x] **SEQ-02**: Sequences templates extending existing patterns infrastructure with higher-order progressions
- [x] **SEQ-03**: Word problem variants for sequences (savings/growth contexts)
- [x] **SEQ-04**: AI tutor prompt guidance for sequences & series

### Statistics Extensions Domain

- [x] **STATS-01**: `statistics_hs` domain handler — standard deviation (conceptual), normal distribution properties, z-scores (integer), percentiles (G9-11, 5 skills)
- [x] **STATS-02**: Statistics HS templates extending existing data_analysis infrastructure
- [x] **STATS-03**: Word problem variants for statistics (survey, test scores contexts)
- [x] **STATS-04**: AI tutor prompt guidance for statistics extensions

### Systems of Equations Domain

- [x] **SYS-01**: `systems_equations` domain handler — 2×2 linear systems with integer solutions via substitution and elimination (G9-10, 5 skills)
- [x] **SYS-02**: Systems templates with algebra-aware distractor generation (swapped-variable, sign-error bug patterns)
- [x] **SYS-03**: Word problem variants for systems (two-variable real-world scenarios)
- [x] **SYS-04**: AI tutor prompt guidance for systems of equations

### Quadratic Equations Domain

- [x] **QUAD-01**: `quadratic_equations` domain handler — factoring monic quadratics with integer roots, quadratic formula for rational roots (G9-10, 6 skills)
- [x] **QUAD-02**: Quadratic templates use `MultiSelectAnswer` + `MultiSelectPresentation` — student selects both roots from 4 options
- [x] **QUAD-03**: Distractor generation for quadratic roots (wrong-sign roots, sum/product confusion bug patterns)
- [x] **QUAD-04**: Word problem variants for quadratics (area, projectile contexts)
- [x] **QUAD-05**: AI tutor prompt guidance for quadratic equations

### Polynomial Operations Domain

- [x] **POLY-01**: `polynomials` domain handler — FOIL expansion, polynomial evaluation at a point, simple factoring (GCF, difference of squares) (G9-10, 6 skills)
- [x] **POLY-02**: Polynomial templates with numeric answers (evaluation) and MC expression answers (factored form identification)
- [x] **POLY-03**: Word problem variants for polynomials (area/perimeter expressions)
- [x] **POLY-04**: AI tutor prompt guidance for polynomial operations

### Exponential Functions Domain

- [x] **EXP-01**: `exponential_functions` domain handler — evaluate exponential expressions, growth/decay factor identification, half-life/doubling-time (G9-11, 5 skills)
- [x] **EXP-02**: Exponential templates with numeric answers (integer exponents, simple base values)
- [x] **EXP-03**: Word problem variants for exponential functions (population, bacteria, investment contexts)
- [x] **EXP-04**: AI tutor prompt guidance for exponential functions

### Logarithms Domain

- [x] **LOG-01**: `logarithms` domain handler — evaluate log at special values (log₁₀, log₂, ln of integer powers), basic log rules (G10-11, 4 skills)
- [x] **LOG-02**: Logarithm templates with integer numeric answers only (special values — no floating point)
- [x] **LOG-03**: Word problem variants for logarithms (pH, decibel, Richter scale contexts)
- [x] **LOG-04**: AI tutor prompt guidance for logarithms

### Integration & Placement

- [x] **INT-01**: Placement staircase extended to grade 12 — `MAX_GRADE = 12`, HS skills registered so staircase can sample them
- [ ] **INT-02**: Prerequisite DAG edges wired for HS skills (linear_equations → systems_equations → quadratic_equations → polynomials)
- [ ] **INT-03**: Skill map layout updated to accommodate 27 total domains without overflow
- [x] **INT-04**: Existing-user store migration — users previously capped at grade 8 can be placed into grade 9-12 via re-assessment trigger
- [x] **INT-05**: `problemIntro.ts` updated with domain intro strings for all 9 new HS domains

---

## Future Requirements (v1.3+)

### Hard Domains (Deferred)
- Trigonometry — visual unit circle, floating-point answers
- Rational expressions — symbolic CAS required
- Matrices — new MatrixAnswer type + new UI
- Geometry proofs — proof validation not automatable

### Visual Aids (Deferred)
- Algebra balance scale manipulative (CPA for linear equations)
- Parabola sketch component for quadratics
- CPA pictorial mode for HS algebra domains

### Other Deferred
- Free-text algebraic expression input (type "2x+3")
- Step-by-step solution reveal
- Complex/imaginary roots for quadratics
- Calculus (limits, derivatives)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Graphing calculator / Desmos integration | Desmos-level scope |
| Free-text symbolic expression input | Parser + equivalence checking complexity |
| Step-by-step solution reveal | Violates Socratic tutoring model |
| Calculus | Beyond easy/moderate, requires CAS |
| Trigonometry | Hard category — deferred to v1.3 |
| Rational expressions | Requires symbolic simplification |
| Matrices | New UI paradigm — hard category |
| Complex/imaginary roots | Outside standard K-12 scope |
| LaTeX rendering | Not needed — ExpressionAnswer renders as plain text |
| Partial credit for multi-select MC | Complicates Elo/BKT — binary grading only |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 through FOUND-09 | Phase 80 | Complete (2026-03-13) |
| VIDEO-01 through VIDEO-06 | Phase 81 | Pending |
| LIN-01 through LIN-04 | Phase 82 | Pending |
| COORD-01 through COORD-04 | Phase 83 | Pending |
| SEQ-01 through SEQ-04 | Phase 84 | Complete |
| STATS-01 through STATS-04 | Phase 85 | Pending |
| SYS-01 through SYS-04 | Phase 86 | Pending |
| QUAD-01 through QUAD-05 | Phase 87 | Pending |
| POLY-01 through POLY-04 | Phase 88 | Pending |
| EXP-01 through EXP-04 | Phase 89 | Partial (EXP-01, EXP-02, EXP-04 complete) |
| LOG-01 through LOG-04 | Phase 90 | Pending |
| INT-01 through INT-05 | Phase 91 | Partial (INT-01, INT-04, INT-05 complete) |

**Coverage:**
- v1.2 requirements: 64 total
- Mapped to phases: 64
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after initial definition*
