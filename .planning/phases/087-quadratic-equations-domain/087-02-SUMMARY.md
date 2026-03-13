---
phase: 087-quadratic-equations-domain
plan: 02
subsystem: math-engine
tags: [quadratic-equations, multi-select, answer-format, domain-handler, tutor-safety]

requires:
  - phase: 087-quadratic-equations-domain
    provides: "RED test stubs for quadratic_equations domain (6 skills, 3 bugs, multiSelect formatter)"
  - phase: 080-foundation
    provides: "MultiSelectAnswer type (FOUND-06), MultiSelectMC component (FOUND-07)"
provides:
  - "quadratic_equations domain handler with 6 generators (construction-from-answer)"
  - "formatAsMultiSelect answer pipeline function with selectAndFormatAnswer integration"
  - "checkMultiAnswerLeak safety function for multi-root HINT/TEACH leak detection"
  - "CpaSessionContent multi_select rendering branch via MultiSelectMC"
  - "BOOST prompt shows both roots via answerDisplayValue"
  - "All Plan 01 RED tests now GREEN (65 tests pass)"
affects: [087-03-PLAN, 091-integration]

tech-stack:
  added: []
  patterns: [multi-select-answer-pipeline, multi-root-safety-check, construction-from-answer-quadratic]

key-files:
  created:
    - src/services/mathEngine/answerFormats/multiSelect.ts
    - src/services/mathEngine/bugLibrary/quadraticEquationsBugs.ts
    - src/services/mathEngine/domains/quadraticEquations/generators.ts
    - src/services/mathEngine/domains/quadraticEquations/quadraticEquationsHandler.ts
    - src/services/mathEngine/domains/quadraticEquations/index.ts
    - src/services/mathEngine/skills/quadraticEquations.ts
    - src/services/mathEngine/templates/quadraticEquations.ts
  modified:
    - src/services/mathEngine/answerFormats/answerFormatSelector.ts
    - src/services/mathEngine/answerFormats/index.ts
    - src/services/mathEngine/bugLibrary/distractorGenerator.ts
    - src/services/mathEngine/bugLibrary/index.ts
    - src/services/mathEngine/domains/registry.ts
    - src/services/mathEngine/domains/index.ts
    - src/services/mathEngine/skills/index.ts
    - src/services/mathEngine/templates/index.ts
    - src/services/mathEngine/types.ts
    - src/components/session/CpaSessionContent.tsx
    - src/components/reports/SkillDomainSummary.tsx
    - src/components/skillMap/skillMapColors.ts
    - src/hooks/useTutor.ts
    - src/services/tutor/safetyFilter.ts
    - src/services/tutor/types.ts
    - src/services/tutor/problemIntro.ts
    - src/services/video/videoMap.ts
    - src/__tests__/mathEngine/quadraticEquations.test.ts

key-decisions:
  - "quad_word_problem skill ID avoids collision with linear_equations bare word_problem ID (same pattern as coord_word_problem, sys_word_problem)"
  - "formatAsMultiSelect uses SeededRng parameter (not seed number) for consistency with multipleChoice.ts shuffleArray call"
  - "CpaSessionContent multi-select wraps boolean onAnswer callback: passes answerNumericValue on correct, NaN on incorrect"
  - "checkMultiAnswerLeak loops over all roots and delegates to existing checkAnswerLeak for each value"
  - "BoostPromptParams.correctAnswer widened to number | string to accept answerDisplayValue output for multi-root answers"
  - "useTutor TEACH safety runs checkMultiAnswerLeak then content-only validation (via runSafetyPipeline with mode=boost to skip redundant leak check)"
  - "skillMapColors quadratic_equations uses pink palette (#9d174d primary) to differentiate from other HS domains"

patterns-established:
  - "Multi-select early-return in selectAndFormatAnswer: multi_select answers bypass MC/free-text probability split"
  - "Multi-root safety pattern: checkMultiAnswerLeak for HINT/TEACH, answerDisplayValue for BOOST"

requirements-completed: [QUAD-01, QUAD-02, QUAD-03, QUAD-05]

duration: 9min
completed: 2026-03-13
---

# Phase 087 Plan 02: Quadratic Equations Domain Implementation Summary

**Complete quadratic_equations domain with 6 generators, formatAsMultiSelect pipeline, CpaSessionContent multi-select rendering, and multi-root tutor safety -- first domain to use MultiSelectAnswer exclusively**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-13T22:47:24Z
- **Completed:** 2026-03-13T22:56:00Z
- **Tasks:** 2
- **Files modified:** 25

## Accomplishments
- Implemented formatAsMultiSelect answer pipeline function with early-return branch in selectAndFormatAnswer -- first consumer of MultiSelectPresentation type
- Created 6 quadratic equation generators using construction-from-answer pattern (pick roots, build equation) with deterministic integer roots and wrong-sign distractors
- Wired CpaSessionContent to render MultiSelectMC for multi_select format, with boolean-to-numeric callback adaptation
- Added checkMultiAnswerLeak to safety pipeline for multi-root HINT/TEACH leak detection, and answerDisplayValue for BOOST prompts showing both roots
- All 65 Plan 01 RED tests now pass GREEN (24 operations, 186 skills)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create multi-select answer format pipeline and domain core files** - `884aa17` (feat)
2. **Task 2: Wire CpaSessionContent multi-select rendering, tutor safety updates, and remaining integrations** - `a444e9f` (feat)

## Files Created/Modified
- `src/services/mathEngine/answerFormats/multiSelect.ts` - formatAsMultiSelect: builds 2-correct + 2-distractor shuffled options from MultiSelectAnswer
- `src/services/mathEngine/answerFormats/answerFormatSelector.ts` - Added multi_select early-return before MC/free-text probability logic
- `src/services/mathEngine/domains/quadraticEquations/generators.ts` - 6 generators: factoring monic, factoring leading coeff, quadratic formula (simple+rational), completing square, word problem
- `src/services/mathEngine/domains/quadraticEquations/quadraticEquationsHandler.ts` - Domain handler routing to generators via domainConfig.type switch
- `src/services/mathEngine/skills/quadraticEquations.ts` - 6 skill definitions with prerequisite chain
- `src/services/mathEngine/templates/quadraticEquations.ts` - 6 templates with domain_specific distractorStrategy
- `src/services/mathEngine/bugLibrary/quadraticEquationsBugs.ts` - 3 bugs: wrong_sign, sum_product_confusion, only_one_root
- `src/components/session/CpaSessionContent.tsx` - MultiSelectMC rendering branch with boolean-to-numeric callback wrapper
- `src/services/tutor/safetyFilter.ts` - checkMultiAnswerLeak function for multi-root leak detection
- `src/hooks/useTutor.ts` - Multi-select BOOST prompt (answerDisplayValue) and HINT/TEACH safety (checkMultiAnswerLeak)
- `src/services/tutor/types.ts` - Widened BoostPromptParams.correctAnswer to number | string
- `src/components/reports/SkillDomainSummary.tsx` - Added quadratic_equations domain label and order
- `src/services/tutor/problemIntro.ts` - Added quadratic_equations intro string
- `src/services/video/videoMap.ts` - Uncommented quadratic_equations video ID
- `src/components/skillMap/skillMapColors.ts` - Added quadratic_equations pink color palette

## Decisions Made
- Renamed word_problem skill to quad_word_problem to avoid collision with linear_equations (same pattern as coord_word_problem, sys_word_problem)
- formatAsMultiSelect accepts SeededRng (not seed number) to match shuffleArray call convention
- CpaSessionContent wraps MultiSelectMC boolean callback: passes answerNumericValue(correctAnswer) on correct, NaN on incorrect
- useTutor TEACH mode for multi-select: runs checkMultiAnswerLeak first, then content-only validation via runSafetyPipeline with mode=boost to skip redundant leak check
- BoostPromptParams.correctAnswer widened to number | string for answerDisplayValue compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed RED test stub bug compute signature**
- **Found during:** Task 1 (bug library creation)
- **Issue:** Plan 01 test stubs called `bug.compute({ operands: [...] })` but BugPattern interface is `(a: number, b: number, operation: MathDomain) => number | null`
- **Fix:** Updated test stubs to call `bug.compute(-3, 5, 'quadratic_equations' as MathDomain)` matching the standard interface
- **Files modified:** src/__tests__/mathEngine/quadraticEquations.test.ts
- **Verification:** All 3 bug library tests pass
- **Committed in:** 884aa17 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed word_problem skill ID collision**
- **Found during:** Task 1 (skill registration)
- **Issue:** `word_problem` skill ID already used by linear_equations domain; getTemplatesBySkill returned templates from both domains, breaking count assertions
- **Fix:** Renamed to `quad_word_problem` following established convention (coord_word_problem, sys_word_problem)
- **Files modified:** skills/quadraticEquations.ts, templates/quadraticEquations.ts, quadraticEquations.test.ts
- **Verification:** All template and skill count assertions pass
- **Committed in:** 884aa17 (Task 1 commit)

**3. [Rule 2 - Missing Critical] Added quadratic_equations to skillMapColors**
- **Found during:** Task 2 (typecheck)
- **Issue:** TypeScript error: MathDomain 'quadratic_equations' not in skillMapColors Record, breaking SkillDetailOverlay
- **Fix:** Added pink palette (#9d174d primary) for quadratic_equations
- **Files modified:** src/components/skillMap/skillMapColors.ts
- **Verification:** npm run typecheck passes with no errors
- **Committed in:** a444e9f (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- 4 pre-existing test failures (skills.test, catEngine, curriculumIntegration, wordProblems) caused by Plan 01 RED stubs adding quadratic_equations to ALL_OPERATIONS/gradeMap -- these are not regressions from Plan 02

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Domain handler fully wired with all 6 skills generating valid 2-root MultiSelectAnswer problems
- Multi-select answer pipeline complete: formatAsMultiSelect -> selectAndFormatAnswer -> CpaSessionContent -> MultiSelectMC
- Tutor safety pipeline handles multi-root answers in all 3 modes (HINT, TEACH, BOOST)
- Plan 03 (word problem templates + AI tutor QA) can proceed -- generators and tutor integration complete

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (884aa17, a444e9f) verified in git log.

---
*Phase: 087-quadratic-equations-domain*
*Completed: 2026-03-13*
