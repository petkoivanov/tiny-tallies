---
phase: 083-coordinate-geometry-domain
verified: 2026-03-13T20:00:00Z
status: human_needed
score: 11/11 automated must-haves verified
human_verification:
  - test: "Navigate to a grade 8-9 practice session, trigger a slope problem, answer incorrectly 2-3 times to escalate to HINT mode, request 3 hints"
    expected: "No hint reveals the slope value directly (e.g., 'the slope is 4/3'). Hints ask formula-guiding questions such as 'What do we call the ratio of vertical change to horizontal change?'"
    why_human: "Socratic hint quality from Gemini LLM cannot be tested programmatically — requires runtime inspection of actual LLM output"
  - test: "Trigger a distance problem in HINT mode, request 3 hints"
    expected: "Hints ask about the Pythagorean theorem formula conceptually, not 'substitute x1=1, y1=2'. No hint reveals the distance value."
    why_human: "LLM output non-deterministic and cannot be unit-tested"
  - test: "Escalate a coordinate geometry problem to BOOST mode"
    expected: "BOOST prompt DOES show the correct answer (BOOST mode is allowed to reveal)"
    why_human: "Requires live app session and LLM call"
  - test: "Review 10+ hint outputs across slope, distance, midpoint, and line-equation problem types"
    expected: "At least half guide toward relevant formula conceptually. None reveal substitution steps in HINT mode."
    why_human: "10-sample manual QA threshold — COORD-04 Socratic framing cannot be unit-tested"
---

# Phase 083: Coordinate Geometry Domain Verification Report

**Phase Goal:** Students in grades 8-10 can practice slope, distance, midpoint, and equation-of-a-line problems with the full adaptive engine
**Verified:** 2026-03-13T20:00:00Z
**Status:** human_needed (all automated checks pass; COORD-04 AI tutor hint quality requires manual sign-off)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | `coordinate_geometry` domain handler registered and dispatches on 6 config types | VERIFIED | `registry.ts` line 46: `coordinate_geometry: coordinateGeometryHandler`; `coordinateGeometry.test.ts` registry test passes |
| 2 | 6 skills registered for grades 8-10 (slope, distance, midpoint, line_equation_yintercept, line_equation_slope, coord_word_problem) | VERIFIED | `skills/coordinateGeometry.ts` exports 6 `SkillDefinition` entries; `coordinateGeometry.test.ts` skills suite passes |
| 3 | Slope generator returns FractionAnswer in reduced form with positive denominator across seeds 1-20 | VERIFIED | `generators.ts` `generateSlope` uses `reduceFraction` + `gcd`; 3 dedicated tests pass (type, reduced, positive-denom) |
| 4 | Distance/midpoint/line equation generators return integer answers across seeds 1-20 | VERIFIED | Pythagorean triples for distance; same-parity construction for midpoint; integer m/b for line generators; integer-answers test suite passes |
| 5 | All 7 templates have `distractorStrategy: 'domain_specific'` | VERIFIED | `templates/coordinateGeometry.ts`: all 7 entries have `distractorStrategy: 'domain_specific'`; template test passes |
| 6 | 3 bug patterns with formula-identification description strings for AI tutor | VERIFIED | `coordinateGeometryBugs.ts`: 3 entries with non-empty descriptions mentioning rise/run, direction, square root; bug library test passes |
| 7 | Negative distractors valid for `coordinate_geometry` | VERIFIED | `validation.ts`: `ALLOWS_NEGATIVES` Set includes `'coordinate_geometry'`; `isValidDistractor(-3, 4, 'coordinate_geometry')` test passes |
| 8 | `coordinate_geometry` in `MathDomain` union; TypeScript compiles with 0 errors | VERIFIED | `types.ts` line 21: `\| 'coordinate_geometry'`; `npm run typecheck` exits clean |
| 9 | 6 word problem prefix templates covering map/ramp/city/cell-tower/bridge/drone contexts at grades 8-10 | VERIFIED | `wordProblems/templates.ts` lines 408-458: 6 entries with `mode: 'prefix'`, `question: ''`, no `{a}/{b}` tokens; `wordProblems.test.ts` passes |
| 10 | Registry and gating tests GREEN at 20 operations, 165 skills | VERIFIED | `domainHandlerRegistry.test.ts` and `prerequisiteGating.test.ts` both pass with updated counts |
| 11 | AI tutor Socratic hint quality — no hints reveal substitution steps in HINT mode | NEEDS HUMAN | Manual QA described in SUMMARY-03 as "sign-off given" but requires human confirmation per COORD-04 contract |

**Score:** 11/11 automated must-haves verified (COORD-04 hint quality requires human QA gate)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/services/mathEngine/domains/coordinateGeometry/generators.ts` | 6 generator functions, construction-from-answer | VERIFIED | 290 lines, all 6 exported: `generateSlope`, `generateDistance`, `generateMidpointX`, `generateMidpointY`, `generateLineYIntercept`, `generateLineSlope` |
| `src/services/mathEngine/domains/coordinateGeometry/coordinateGeometryHandler.ts` | DomainHandler dispatching on 6 config types | VERIFIED | switch on `config.type`, all 6 cases + `word_problem` fallback, descriptive error for unknown types |
| `src/services/mathEngine/domains/coordinateGeometry/index.ts` | Barrel export | VERIFIED | Exports `coordinateGeometryHandler` |
| `src/services/mathEngine/skills/coordinateGeometry.ts` | 6 SkillDefinition entries, grades 8-10 | VERIFIED | Grades 8/8/8/9/9/10; correct prerequisites; `coord_word_problem` ID avoids collision |
| `src/services/mathEngine/templates/coordinateGeometry.ts` | 7 templates (2 midpoint variants), all `domain_specific` | VERIFIED | 7 entries, all `distractorStrategy: 'domain_specific'`, Elo range 1000-1200 |
| `src/services/mathEngine/bugLibrary/coordinateGeometryBugs.ts` | 3 BugPattern entries with description strings | VERIFIED | 3 entries: `coord_slope_swapped_rise_run`, `coord_slope_sign_error`, `coord_distance_forgot_sqrt`; all have formula-identification descriptions |
| `src/services/mathEngine/wordProblems/templates.ts` | 6 new coordinate_geometry prefix templates | VERIFIED | Lines 408-458: 6 entries with `wp_coord_map`, `wp_coord_city`, `wp_coord_ramp`, `wp_coord_phone`, `wp_coord_bridge`, `wp_coord_map2` |
| `src/__tests__/mathEngine/coordinateGeometry.test.ts` | 23 tests covering full COORD acceptance contract | VERIFIED | 23 tests, all GREEN |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `domains/registry.ts` | `domains/coordinateGeometry/coordinateGeometryHandler.ts` | `coordinate_geometry: coordinateGeometryHandler` | WIRED | Line 24 import, line 46 assignment |
| `bugLibrary/distractorGenerator.ts` | `bugLibrary/coordinateGeometryBugs.ts` | `coordinate_geometry: COORDINATE_GEOMETRY_BUGS` | WIRED | Line 21 import, line 52 assignment |
| `bugLibrary/validation.ts` | `coordinate_geometry` in `ALLOWS_NEGATIVES` | `ALLOWS_NEGATIVES.has('coordinate_geometry')` | WIRED | Line 13: `'coordinate_geometry'` in Set |
| `skills/index.ts` | `skills/coordinateGeometry.ts` | `...COORDINATE_GEOMETRY_SKILLS` spread | WIRED | Line 24 import, line 48 spread, line 87 re-export |
| `templates/index.ts` | `templates/coordinateGeometry.ts` | `...COORDINATE_GEOMETRY_TEMPLATES` spread | WIRED | Line 23 import, line 47 spread, line 91 re-export |
| `domains/index.ts` | `domains/coordinateGeometry/index.ts` | `export { coordinateGeometryHandler }` | WIRED | Line 16 barrel export |
| `bugLibrary/index.ts` | `bugLibrary/coordinateGeometryBugs.ts` | `export { COORDINATE_GEOMETRY_BUGS }` | WIRED | Line 25 |
| `wordProblems/generator.ts` | `wordProblems/templates.ts` | `WORD_PROBLEM_TEMPLATES.filter` by operation | WIRED | Templates added to shared array; generator filters by operation |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| COORD-01 | 083-01, 083-02 | `coordinate_geometry` domain handler — slope, distance formula, midpoint, equation of a line (G8-10, 6 skills) | SATISFIED | Handler registered in registry; 6 skills in `SKILLS` array; all tests GREEN |
| COORD-02 | 083-01, 083-02 | Coordinate geometry templates with numeric answers (slope as fraction, distance/midpoint as numeric) | SATISFIED | `distractorStrategy: 'domain_specific'` on all 7 templates; FractionAnswer for slope confirmed across 20 seeds; integer answers for distance/midpoint confirmed |
| COORD-03 | 083-01, 083-03 | Word problem variants for coordinate geometry (real-world distance/slope contexts) | SATISFIED | 6 prefix-mode word problem templates covering map/city/ramp/cell-tower/bridge/drone contexts at grades 8-10; `wordProblems.test.ts` GREEN |
| COORD-04 | 083-01, 083-02, 083-03 | AI tutor prompt guidance for coordinate geometry | PARTIALLY VERIFIED | Bug descriptions implemented (formula-identification, Socratic framing); `problemIntro.ts` entry present; HINT mode quality requires human QA gate per plan spec |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No TODO/FIXME/placeholder/empty-implementation patterns found in any coordinate geometry implementation file |

### Pre-existing Test Failures (Not Introduced by Phase 83)

The following test failures exist in the codebase but pre-date Phase 83 and are acknowledged in SUMMARY-02:

| Test File | Failing Assertion | Cause |
|-----------|------------------|-------|
| `src/__tests__/mathEngine/skills.test.ts` | `has 151 skills total` (now 165) | File was not updated for Phase 82 or 83 skill additions |
| `src/__tests__/mathEngine/skills.test.ts` | `covers all 18 operations` (now 20) | Same — predates linear_equations and coordinate_geometry additions |
| `src/__tests__/mathEngine/skills.test.ts` | `covers grades 1-8` | Same — grades 9-10 now present |
| `src/__tests__/cat/catEngine.test.ts` | Grade range assertion | Pre-existing; expects grades ≤8 only |

These are not regressions from Phase 83. They reflect a known gap where `skills.test.ts` was not maintained to track new domain additions (a separate cleanup task).

### Human Verification Required

#### 1. Slope problem HINT mode quality

**Test:** Start the app (`npx expo start`), navigate to a grade 8-9 student practice session, trigger a slope problem (e.g., "Find the slope of the line through (1, 2) and (4, 6)."), answer incorrectly 2-3 times to escalate to HINT mode, request 3 hints.
**Expected:** No hint states the slope value directly (e.g., "the slope is 4/3"). Hints ask formula-guiding questions such as "What do we call the ratio of vertical change to horizontal change?" or "Which direction did the y values change?"
**Why human:** Gemini LLM responses are non-deterministic and cannot be unit-tested.

#### 2. Distance problem HINT mode quality

**Test:** Trigger a distance problem, answer incorrectly to reach HINT mode, request 3 hints.
**Expected:** Hints ask about the Pythagorean theorem formula conceptually ("What formula gives us the length of the hypotenuse from the two legs?"), not "Use sqrt((x2-x1)^2 + (y2-y1)^2) with x1=1, y1=2".
**Why human:** LLM output — cannot verify programmatically.

#### 3. BOOST mode reveal behavior

**Test:** Escalate a coordinate geometry problem to BOOST mode.
**Expected:** BOOST prompt DOES show the correct answer (BOOST is allowed to reveal per architecture).
**Why human:** Requires live app session and LLM call.

#### 4. 10+ hint review across all problem types

**Test:** Review minimum 10 hint outputs spanning slope, distance, midpoint, and line-equation problem types.
**Expected:** At least half guide toward the relevant formula conceptually; none reveal substitution steps in HINT mode.
**Why human:** COORD-04 Socratic formula-identification framing is a qualitative QA standard that cannot be automated.

**Note:** SUMMARY-03 records that the human sign-off was given during plan execution ("Manual QA sign-off: 10+ Gemini Socratic hints reviewed across slope/distance/midpoint/line types; none reveal substitution steps in HINT mode"). If that sign-off is accepted as evidence, COORD-04 is fully satisfied and the overall status may be upgraded to `passed`.

### Gaps Summary

No structural gaps found. All implementation files exist, are substantive (no stubs), and are fully wired. All 88 targeted tests pass. TypeScript compiles with 0 errors. All 6 commits referenced in summaries are verified in git history.

The only open item is human confirmation of COORD-04 AI tutor Socratic hint quality, which is a qualitative gate that requires a live app session. SUMMARY-03 claims this was completed — if accepted, the phase goal is fully achieved.

---

_Verified: 2026-03-13_
_Verifier: Claude (gsd-verifier)_
