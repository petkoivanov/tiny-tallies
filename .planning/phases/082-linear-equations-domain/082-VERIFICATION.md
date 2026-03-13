---
phase: 082-linear-equations-domain
verified: 2026-03-13T17:00:00Z
status: human_needed
score: 10/11 must-haves verified
re_verification: false
human_verification:
  - test: "Trigger linear equations problems in a grade 8-9 session and request AI tutor hints after 2-3 wrong answers"
    expected: "HINT mode outputs use balance-model language ('What happens to both sides if you...', 'Think about keeping both sides equal') and NEVER state the solution value directly"
    why_human: "Actual Gemini output quality cannot be verified programmatically; the SUMMARY claims 10+ hints were reviewed and approved, but this was a checkpoint gate in the autonomous flow — it requires human confirmation that the sign-off was genuine and not auto-approved"
  - test: "Navigate to a grade 8 student's practice screen and confirm linear_equations problems appear in the skill map"
    expected: "Linear Equations domain visible in skill map with correct color and label; grade 8 skills unlocked for a grade 8 student"
    why_human: "UI rendering, skill map layout, and domain label/color cannot be verified programmatically"
---

# Phase 082: Linear Equations Domain Verification Report

**Phase Goal:** Students in grades 8-9 can practice solving one-step, two-step, and multi-step linear equations with the full adaptive engine, misconception detection, and AI tutor support
**Verified:** 2026-03-13T17:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from Phase 82 Success Criteria + Plan must_haves)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `linear_equations` domain appears in the domain registry and generates valid problems across all 8 skills for grades 8-9 | VERIFIED | `registry.ts` line 44: `linear_equations: linearEquationsHandler`; 8 skills in `linearEquations.ts`; 26 tests GREEN |
| 2 | Wrong answers reflect algebra-specific bug patterns (wrong-operation, sign-flip, forgot-to-divide) as distractors | VERIFIED | `linearEquationsBugs.ts` exports `LINEAR_EQUATIONS_BUGS` with 3 entries; wired into `distractorGenerator.ts` line 50; distractor tests GREEN |
| 3 | Word problem variants (age, distance, money contexts) generate correctly | VERIFIED | 6 templates in `wordProblems/templates.ts` (wp_lin_age_1/2, wp_lin_distance_1/2, wp_lin_money_1/2); `wordProblems.test.ts` GREEN (47 tests pass) |
| 4 | AI tutor hints for linear equations use Socratic balance-model framing without stating the solution | ? UNCERTAIN | Bug descriptions contain balance-model text; `bugDescription` flows into `buildHintPrompt` via `params.bugDescription`; but actual LLM hint quality needs human QA confirmation |
| 5 | `linear_equations` in `MathDomain` union — TypeScript compiles (excluding pre-existing error) | VERIFIED | `types.ts` line 20: `'linear_equations'` in union; `npm run typecheck` shows only pre-existing `coordinate_geometry` videoMap error |
| 6 | All 8 skills registered (19 operations, 159 skills total) | VERIFIED | `domainHandlerRegistry.test.ts` GREEN: 19 operations, 159 skills asserted and passing |
| 7 | Handler generates integer solutions for all 8 skills across 20 seeds | VERIFIED | `linearEquations.test.ts` "produces integer correctAnswer" test passes across seeds 1-20 |
| 8 | All 8 templates have `distractorStrategy: 'domain_specific'` | VERIFIED | All 8 entries in `templates/linearEquations.ts` confirm `distractorStrategy: 'domain_specific'`; test assertion passes |
| 9 | 3 bug patterns with balance-model description strings | VERIFIED | `linearEquationsBugs.ts`: `lin_wrong_operation` (mentions "balance on both sides"), `lin_sign_flip` (mentions "did not maintain balance"), `lin_forgot_to_divide` (mentions "forgot to divide by the coefficient") |
| 10 | Negative distractors allowed for `linear_equations` | VERIFIED | `validation.ts` line 12: `'linear_equations'` in `ALLOWS_NEGATIVES`; `isValidDistractor(-5, 3, 'linear_equations')` test passes |
| 11 | Word problem templates pass reading level calibration (prefix mode, no {a}/{b} tokens) | VERIFIED | All 6 templates use `mode: 'prefix'`, `question: ''`; no `{a}` or `{b}` references in template strings |

**Score:** 10/11 truths verified (1 requires human confirmation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/services/mathEngine/domains/linearEquations/linearEquationsHandler.ts` | DomainHandler dispatching on 8 config types | VERIFIED | 49 lines; all 8 switch cases present; exports `linearEquationsHandler` |
| `src/services/mathEngine/domains/linearEquations/generators.ts` | 8 generator functions, construction-from-answer | VERIFIED | 196 lines; all 8 functions exported; negative solution generator uses `rng.intRange(-10, -1)` |
| `src/services/mathEngine/domains/linearEquations/index.ts` | Barrel export | VERIFIED | Single-line barrel: `export { linearEquationsHandler }` |
| `src/services/mathEngine/bugLibrary/linearEquationsBugs.ts` | 3 BugPattern entries with balance-model descriptions | VERIFIED | 54 lines; 3 entries; all descriptions contain balance-model language |
| `src/services/mathEngine/skills/linearEquations.ts` | 8 SkillDefinition entries for grades 8-9 | VERIFIED | 68 lines; 8 skills; grades 8 and 9; correct standards (8.EE.C.7a, 8.EE.C.7b, 8.EE.C.7) |
| `src/services/mathEngine/templates/linearEquations.ts` | 8 ProblemTemplate entries with `distractorStrategy: 'domain_specific'` | VERIFIED | 92 lines; 8 templates; all with `distractorStrategy: 'domain_specific'`; Elo range 1000-1200 |
| `src/__tests__/mathEngine/linearEquations.test.ts` | Test suite covering all acceptance contracts | VERIFIED | 174 lines; 26 tests all GREEN |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `domains/registry.ts` | `linearEquations/linearEquationsHandler.ts` | `HANDLERS['linear_equations']` | WIRED | Line 44: `linear_equations: linearEquationsHandler` |
| `bugLibrary/distractorGenerator.ts` | `linearEquationsBugs.ts` | `BUGS_BY_OPERATION['linear_equations']` | WIRED | Line 50: `linear_equations: LINEAR_EQUATIONS_BUGS` |
| `bugLibrary/validation.ts` | ALLOWS_NEGATIVES set | `ALLOWS_NEGATIVES.has('linear_equations')` | WIRED | Line 12: `'linear_equations'` in Set |
| `skills/index.ts` | `skills/linearEquations.ts` | `...LINEAR_EQUATIONS_SKILLS` spread | WIRED | Lines 23, 46, 84 |
| `templates/index.ts` | `templates/linearEquations.ts` | `...LINEAR_EQUATIONS_TEMPLATES` spread | WIRED | Lines 22, 45, 88 |
| `domains/index.ts` | `linearEquations/index.ts` | barrel re-export | WIRED | Line 15: `export { linearEquationsHandler }` |
| `bugLibrary/index.ts` | `linearEquationsBugs.ts` | named export | WIRED | Line 24: `export { LINEAR_EQUATIONS_BUGS }` |
| `wordProblems/generator.ts` | `wordProblems/templates.ts` | filter by `operation === 'linear_equations'` | WIRED | 6 templates with `operations: ['linear_equations']` present in file |
| `tutor/promptTemplates.ts` | `linearEquationsBugs.ts` bug descriptions | `params.bugDescription` passthrough | WIRED | Lines 183-185, 220-223, 257-260 route `bugDescription` into all 3 hint prompt builders |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LIN-01 | 082-01, 082-02 | `linear_equations` domain handler — one-step, two-step, and multi-step equations with integer solutions (G8-9, 8 skills) | SATISFIED | Handler registered; 8 skills; all generators produce integer answers; 26 tests GREEN |
| LIN-02 | 082-01, 082-02 | Linear equation templates with algebra-aware distractor generation (wrong-operation, sign-flip, forgot-to-divide bug patterns) | SATISFIED | 3 bug patterns in `linearEquationsBugs.ts`; wired into `distractorGenerator.ts`; `distractorGenerator.test.ts` passes (47 tests) |
| LIN-03 | 082-01, 082-03 | Word problem variants for linear equations (age, distance, money contexts) | SATISFIED | 6 prefix-mode templates in `wordProblems/templates.ts`; `wordProblems.test.ts` GREEN |
| LIN-04 | 082-01, 082-02, 082-03 | AI tutor prompt guidance for linear equations (Socratic balance-model framing without revealing steps) | NEEDS HUMAN | Bug pattern descriptions contain balance-model text and flow into prompt builder via `bugDescription`; manual QA checkpoint claimed approval in SUMMARY-03 but cannot be verified programmatically |

**Orphaned requirements:** None. All 4 requirement IDs (LIN-01 through LIN-04) from REQUIREMENTS.md Phase 82 row are claimed and accounted for across the 3 plans.

### Anti-Patterns Found

No anti-patterns detected in any of the 7 new implementation files. No TODO/FIXME/PLACEHOLDER comments. No stub return values (`return null`, `return {}`, `return []`). No console.log-only implementations.

**Administrative metadata gaps noted (non-blocking):**

- ROADMAP.md plan checkboxes for `082-02-PLAN.md` and `082-03-PLAN.md` remain `[ ]` (unchecked) despite full implementation and passing tests — ROADMAP was not updated post-completion.
- REQUIREMENTS.md phase status row shows "Pending" for LIN-01 through LIN-04 despite completion — not updated post-completion.
- Word problem templates use `minGrade: 6` instead of the plan-specified `minGrade: 8`. Functionally non-breaking because `linear_equations` domain skills only exist for grades 8-9 and `generateWordProblem` is only called when a linear_equations problem is generated. Templates are simply available for a wider grade range than the domain supports.

**Pre-existing TypeScript error (unrelated to Phase 82):**

`src/services/video/videoMap.ts:36` — `coordinate_geometry` key in `Partial<Record<MathDomain, string>>` is now invalid because `coordinate_geometry` is not yet in `MathDomain`. This was a pre-existing issue documented in SUMMARY-02 and deferred to Phase 83. Phase 82 did not introduce this error; it was present before Phase 82 started.

### Human Verification Required

#### 1. AI Tutor Balance-Model Hint Quality (LIN-04)

**Test:** Start the Expo app (`npx expo start`). Navigate to a practice session for a grade 8-9 student. Generate a linear equations problem (e.g., "3x + 5 = 14. Solve for x."). Answer incorrectly 2-3 times to trigger HINT mode. Request hints.

**Expected:** Each hint uses balance-model language — phrasing like "What do you need to subtract from both sides?", "What happens to the equation if you undo the addition?", "Think about keeping both sides equal." The answer value is NEVER stated in any hint. BOOST mode is allowed to reveal the answer.

**Why human:** Gemini's actual output quality cannot be verified statically. The `bugDescription` strings (which contain "did not maintain balance on both sides", "forgot to divide by the coefficient") are correctly wired to `buildHintPrompt`, but whether the LLM uses them to generate Socratic balance-model questions is a runtime LLM behavior. The SUMMARY-03 checkpoint claims 10+ hints were reviewed and approved, but this was an autonomous checkpoint — the actual quality requires developer confirmation.

Minimum bar: 10 hint outputs reviewed across at least 3 different problem types (one-step, two-step, word problem); none state the answer; at least half use equality/balance framing.

#### 2. Skill Map and Domain Label Rendering

**Test:** Open the skill map screen for a grade 8 student. Confirm the Linear Equations domain is visible, correctly colored (blue family per `skillMapColors.ts`), and labeled "Linear Equations" (per `SkillDomainSummary.tsx`).

**Expected:** Domain visible with blue color; one-step, two-step, and multi-step skills visible and unlocked appropriately for grade 8. No layout overflow or node collisions.

**Why human:** UI rendering, layout correctness, and visual appearance cannot be verified with grep/file checks.

### Gaps Summary

No functional gaps were found. All 4 requirements (LIN-01 through LIN-04) have automated evidence of implementation. The one uncertain item (LIN-04 hint quality) has a structural wiring path verified — it requires human confirmation that the LLM output meets the Socratic balance-model standard.

The phase goal ("Students in grades 8-9 can practice solving one-step, two-step, and multi-step linear equations with the full adaptive engine, misconception detection, and AI tutor support") is structurally satisfied:

- **Adaptive engine:** domain handler registered, 8 skills, Elo-based templates (1000-1200), integer generators
- **Misconception detection:** 3 bug patterns wired into distractor generator, ALLOWS_NEGATIVES configured
- **AI tutor support:** bug descriptions flow into all 3 tutor modes (HINT, TEACH, BOOST); balance-model language present in all 3 bug descriptions

---

_Verified: 2026-03-13T17:00:00Z_
_Verifier: Claude (gsd-verifier)_
