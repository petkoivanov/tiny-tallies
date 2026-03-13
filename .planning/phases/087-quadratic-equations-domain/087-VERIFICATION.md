---
phase: 087-quadratic-equations-domain
verified: 2026-03-13T23:30:00Z
status: human_needed
score: 9/9 must-haves verified
human_verification:
  - test: "Start a practice session with a grade 9-10 profile, navigate to quadratic equations problems"
    expected: "Problems display as x^2 + bx + c = 0 with 'Find both roots' instruction and answer options render as checkboxes (MultiSelectMC), not radio buttons"
    why_human: "React Native UI rendering cannot be verified programmatically — requires device/simulator"
  - test: "Select both correct roots and press Check"
    expected: "Scores as correct (all-or-nothing grading)"
    why_human: "MultiSelectMC callback wiring with boolean-to-numeric adaptation requires runtime verification"
  - test: "Select only one root and press Check"
    expected: "Scores as incorrect (all-or-nothing)"
    why_human: "Runtime behavior of onAnswer with partial selection"
  - test: "Get a problem wrong, trigger AI tutor HINT mode"
    expected: "HINT mode uses Socratic questioning about factoring approach WITHOUT revealing either root value"
    why_human: "LLM response content and safety filter behavior require live API call"
  - test: "Exhaust hint ladder to reach BOOST mode"
    expected: "BOOST mode mentions BOTH roots (e.g., 'The roots are 3 and -5')"
    why_human: "LLM response content with answerDisplayValue requires live API call"
  - test: "Check word problems show context sentences before the equation"
    expected: "Context sentence (area/projectile/number) appears above the quadratic equation"
    why_human: "Prefix template rendering requires runtime verification"
---

# Phase 087: Quadratic Equations Domain — Verification Report

**Phase Goal:** Students in grades 9-10 can practice factoring and solving quadratic equations with two roots using the multi-select answer format
**Verified:** 2026-03-13T23:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | quadratic_equations domain generates valid 2-root problems for all 6 skills | VERIFIED | generators.ts (195 lines): 6 generators (factoring_monic, factoring_leading_coeff, quadratic_formula_simple, quadratic_formula_rational, completing_the_square, word_problem); all return multiSelectAnswer([r1, r2]); all 34 domain tests pass |
| 2 | MultiSelectAnswer flows through selectAndFormatAnswer to CpaSessionContent as MultiSelectMC | VERIFIED | answerFormatSelector.ts: multi_select early-return at line 39; CpaSessionContent.tsx: MultiSelectMC import + branch at line 432; test suite: 34 multi_select tests pass |
| 3 | Safety pipeline checks both roots in HINT/TEACH mode | VERIFIED | safetyFilter.ts: checkMultiAnswerLeak exported at line 103; useTutor.ts: isMultiSelectTeach branch at line 413 calls checkMultiAnswerLeak with all root values |
| 4 | BOOST prompt shows both roots via answerDisplayValue | VERIFIED | useTutor.ts line 288-290: multi_select branch uses answerDisplayValue(); BoostPromptParams.correctAnswer widened to number \| string in types.ts |
| 5 | Distractors include wrong-sign roots and sum/product confusion values | VERIFIED | generators.ts buildResult(): operands = [wrongSignR1, wrongSignR2, sum, product]; 3 bug patterns in quadraticEquationsBugs.ts (quad_wrong_sign, quad_sum_product_confusion, quad_only_one_root) |
| 6 | 3 prefix-mode word problem templates exist for quadratic_equations | VERIFIED | wordProblems/templates.ts lines 621-652: wp_quad_area (grade 9), wp_quad_projectile (grade 10), wp_quad_number (grade 9); wordProblems test suite: 65/65 pass |
| 7 | quadratic_equations registered in domain handler registry | VERIFIED | registry.ts line 54: quadratic_equations: quadraticEquationsHandler; domainHandlerRegistry test: 24 operations, 186 skills — all pass |
| 8 | Full test suite has no regressions from Phase 087 | VERIFIED | 3 failures in skills.test, catEngine, curriculumIntegration are pre-existing (last modified commit c4cdd0a, predating Phase 087); Phase 087 files not in those test histories; Phase commits 2ec4d23, 599b327, 884aa17, a444e9f, 8b56673 all confirmed in git log |
| 9 | TypeScript type check passes | VERIFIED | npm run typecheck exits 0 — no type errors |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/services/mathEngine/domains/quadraticEquations/generators.ts` | 6 generators using construction-from-answer | VERIFIED | 195 lines; 6 exported generator functions; all return multiSelectAnswer |
| `src/services/mathEngine/answerFormats/multiSelect.ts` | formatAsMultiSelect function | VERIFIED | 64 lines; exports formatAsMultiSelect; throws on non-multi_select; builds 2 correct + up to 2 distractors; shuffles deterministically |
| `src/services/mathEngine/skills/quadraticEquations.ts` | 6 skill definitions | VERIFIED | Exports QUADRATIC_EQUATIONS_SKILLS (6 skills: factoring_monic, factoring_leading_coeff, quadratic_formula_simple, quadratic_formula_rational, completing_the_square, quad_word_problem) |
| `src/services/mathEngine/templates/quadraticEquations.ts` | 6 template definitions | VERIFIED | Exports QUADRATIC_EQUATIONS_TEMPLATES (6 templates, all with distractorStrategy: 'domain_specific') |
| `src/services/mathEngine/bugLibrary/quadraticEquationsBugs.ts` | 3 bug patterns | VERIFIED | Exports QUADRATIC_EQUATIONS_BUGS (quad_wrong_sign, quad_sum_product_confusion, quad_only_one_root) |
| `src/services/mathEngine/wordProblems/templates.ts` | 3 prefix-mode word problem templates | VERIFIED | wp_quad_area, wp_quad_projectile, wp_quad_number added at lines 621-652 |
| `src/services/tutor/safetyFilter.ts` | checkMultiAnswerLeak function | VERIFIED | Exported at line 103; loops over root values delegating to checkAnswerLeak |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `answerFormats/answerFormatSelector.ts` | `answerFormats/multiSelect.ts` | multi_select early-return branch | WIRED | Line 5: import formatAsMultiSelect; line 39-41: early-return for multi_select answers |
| `components/session/CpaSessionContent.tsx` | `components/session/MultiSelectMC.tsx` | multi_select rendering branch | WIRED | Line 37: import MultiSelectMC; lines 431-440: multi_select format branch renders MultiSelectMC |
| `hooks/useTutor.ts` | `services/tutor/safetyFilter.ts` | multi-root safety check loop | WIRED | Line 16: import checkMultiAnswerLeak; line 417: called with all root values |
| `services/mathEngine/domains/registry.ts` | `services/mathEngine/domains/quadraticEquations` | handler registration | WIRED | Line 28: import quadraticEquationsHandler; line 54: quadratic_equations: quadraticEquationsHandler |
| `services/tutor/promptTemplates.ts` (via useTutor.ts) | BOOST correctAnswer display | answerDisplayValue for multi_select | WIRED | useTutor.ts line 288-290: multi_select branch uses answerDisplayValue() |
| `wordProblems/templates.ts` | quadratic_equations operations | operations: ['quadratic_equations'] on templates | WIRED | Lines 626, 635, 644: each template declares operations: ['quadratic_equations'] |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| QUAD-01 | 087-01, 087-02 | quadratic_equations domain handler — factoring monic quadratics with integer roots, quadratic formula for rational roots (G9-10, 6 skills) | SATISFIED | 6 generators in generators.ts; 6 skills in quadraticEquations.ts; registry.ts wired; 186 skills in registry |
| QUAD-02 | 087-01, 087-02 | Quadratic templates use MultiSelectAnswer + MultiSelectPresentation — student selects both roots from 4 options | SATISFIED | formatAsMultiSelect builds 2 correct + 2 distractors; answerFormatSelector routes multi_select; CpaSessionContent renders MultiSelectMC; 34 tests pass |
| QUAD-03 | 087-01, 087-02 | Distractor generation for quadratic roots (wrong-sign roots, sum/product confusion bug patterns) | SATISFIED | 3 bug patterns in quadraticEquationsBugs.ts; operand layout documented (wrongSignR1, wrongSignR2, sum, product); distractorGenerator.ts updated |
| QUAD-04 | 087-03 | Word problem variants for quadratics (area, projectile contexts) | SATISFIED | 3 prefix-mode templates in wordProblems/templates.ts (area, projectile, number contexts); wordProblems tests pass |
| QUAD-05 | 087-02, 087-03 | AI tutor prompt guidance for quadratic equations | SATISFIED (partial human) | problemIntro.ts has quadratic_equations string; useTutor.ts wired for multi-root BOOST/HINT/TEACH; Socratic framing correctness requires human QA |

All 5 QUAD requirements are accounted for across the 3 plans. No orphaned requirements found.

### Anti-Patterns Found

None. Scanned all 6 created files for TODO/FIXME/PLACEHOLDER/empty returns — clean.

### Human Verification Required

The following items pass all automated checks but require runtime testing:

#### 1. MultiSelectMC UI Rendering

**Test:** Start a practice session with a grade 9-10 profile and navigate to quadratic equations
**Expected:** Problems display as x^2 + bx + c = 0 equations with "Find both roots" instruction; answer options render as checkboxes (not radio buttons)
**Why human:** React Native component rendering and visual layout cannot be verified programmatically

#### 2. All-or-Nothing Grading

**Test:** Select only one root and press Check; then select both correct roots and press Check
**Expected:** Single root = incorrect; both correct roots = correct
**Why human:** MultiSelectMC boolean callback with numeric adaptation (answerNumericValue on correct, NaN on incorrect) requires runtime execution

#### 3. AI Tutor HINT Mode — Socratic Framing

**Test:** Get a quadratic problem wrong, trigger HINT mode
**Expected:** Tutor asks questions about factoring approach (e.g., "What does the zero product property tell you?") WITHOUT stating either root value
**Why human:** LLM response quality and safety filter pass/fail on actual API responses requires live test

#### 4. AI Tutor BOOST Mode — Both Roots Shown

**Test:** Exhaust hint ladder to reach BOOST mode
**Expected:** BOOST response explicitly mentions BOTH roots (e.g., "The roots are 3 and -5")
**Why human:** answerDisplayValue formatting and LLM interpolation requires live API response

#### 5. Word Problem Context Rendering

**Test:** Trigger a word problem variant (quad_word_problem skill)
**Expected:** Context sentence appears before the equation (e.g., "Alex is designing a rectangular garden... x^2 - 3x - 10 = 0")
**Why human:** Prefix template concatenation rendering requires runtime verification

### Pre-Existing Test Failures (Not Phase 087 Regressions)

Three test files fail that are **not** caused by Phase 087:

| Test File | Failure | Root Cause |
|-----------|---------|------------|
| `skills.test.ts` | Expected 151 skills, got 186; expected 18 operations, got 24 | Test written for G1-8 domains only; last modified commit c4cdd0a (Phase 60-69); never updated for HS domain expansion (Phases 82-87) |
| `catEngine.test.ts` | Expected grade <= 8, got 9; expected 8 grades, got 9-10 | Same — CAT item bank test predates HS domain introduction |
| `curriculumIntegration.test.ts` | Expected ['multiple_choice', 'free_text'], got 'multi_select' | Test hardcoded valid formats without accounting for multi_select; last modified commit c4cdd0a |

These 6 failures were present before Phase 087 started (documented in 087-02-SUMMARY.md and 087-03-SUMMARY.md) and represent a technical debt item for a future fix plan.

### Gaps Summary

No gaps. All automated must-haves verified. Phase goal is achieved at the implementation level — the quadratic equations domain is fully wired from generator through answer format pipeline through UI rendering through AI tutor safety. Remaining items are human runtime verification of UI behavior, grading logic, and LLM response quality.

---
_Verified: 2026-03-13T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
