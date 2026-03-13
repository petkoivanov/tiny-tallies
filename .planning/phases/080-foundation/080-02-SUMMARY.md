---
phase: 080-foundation
plan: 02
subsystem: api
tags: [typescript, math-engine, tutor, types, grade-expansion, multi-select]

# Dependency graph
requires:
  - phase: 080-01
    provides: Wave 0 stub tests for multi_select answer type (RED state stubs)
provides:
  - Grade type expanded to 1-12 with MAX_GRADE = 12
  - MultiSelectAnswer as 6th Answer union variant
  - setsEqual(), multiSelectAnswer(), answerDisplayValue() utility functions
  - DistractorStrategy type on ProblemTemplate and Problem
  - AgeBracket expanded to 6 brackets (6-7 through 14-18)
  - CONTENT_WORD_LIMITS and MAX_WORD_LENGTH for all 6 brackets
  - WORD_LIMITS in promptTemplates for all 6 brackets
  - MultiSelectPresentation interface and updated FormattedProblem union
  - FreeTextPresentation.allowNegative optional field
  - AnswerFormat type includes 'multi_select'
affects:
  - 080-03
  - 080-04
  - 082-linear-equations
  - 087-quadratics
  - all downstream phases using Grade, AgeBracket, or FormattedProblem

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MultiSelectAnswer uses readonly values array — setsEqual() does order-independent comparison for grading"
    - "answerNumericValue returns first value for multi_select as Elo proxy only — not used for grading"
    - "answerDisplayValue joins values with ' and ' for BOOST-mode prompts"
    - "DistractorStrategy='default' uses bug library + adjacent; 'domain_specific' skips adjacent phase"

key-files:
  created: []
  modified:
    - src/services/mathEngine/types.ts
    - src/services/mathEngine/answerFormats/types.ts
    - src/services/tutor/types.ts
    - src/services/tutor/safetyConstants.ts
    - src/services/tutor/promptTemplates.ts
    - src/__tests__/session/sessionOrchestrator.test.ts

key-decisions:
  - "answerNumericValue for multi_select returns values[0] as Elo proxy — grading must use setsEqual(), never this function"
  - "DistractorStrategy is optional on ProblemTemplate and Problem — existing templates default to 'default' behavior implicitly"
  - "WORD_LIMITS in promptTemplates remains Record<string, number> — strengthening to Record<AgeBracket, number> is deferred"
  - "FreeTextPresentation.allowNegative is optional (backward-compatible) — existing presentations unaffected"

patterns-established:
  - "Type-only expansion pattern: add variants to unions, add optional fields, existing runtime behavior unchanged"
  - "Exhaustiveness enforcement: Record<AgeBracket, number> shapes force compiler errors when AgeBracket expands"

requirements-completed: [FOUND-01, FOUND-03, FOUND-06, FOUND-08]

# Metrics
duration: 12min
completed: 2026-03-13
---

# Phase 080 Plan 02: Type System Expansion Summary

**Grade 1-12, AgeBracket 6-bracket coverage, MultiSelectAnswer as 6th Answer variant, DistractorStrategy, and MultiSelectPresentation — pure type and constant additions with zero runtime behavior changes**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-13T11:54:15Z
- **Completed:** 2026-03-13T12:06:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Grade type expanded from 1-8 to 1-12 with exported MAX_GRADE constant; downstream phases can now target high school
- MultiSelectAnswer added as 6th Answer union variant with setsEqual(), multiSelectAnswer() factory, and answerDisplayValue() — Wave 0 stub tests turned GREEN
- AgeBracket expanded from 3 to 6 brackets (6-7 through 14-18) with exhaustive constants in safetyConstants.ts and promptTemplates.ts
- MultiSelectPresentation interface added to answerFormats, FormattedProblem union updated, FreeTextPresentation gains optional allowNegative field

## Task Commits

1. **Task 1: Grade expansion + MultiSelectAnswer + DistractorStrategy** - `02a1b0f` (feat)
2. **Task 2: AgeBracket expansion + MultiSelectPresentation** - `a7c8573` (feat)

**Plan metadata:** (docs commit follows)

_Note: TDD tasks — tests confirmed RED before implementation, GREEN after._

## Files Created/Modified

- `src/services/mathEngine/types.ts` - Grade 1-12, MAX_GRADE, MultiSelectAnswer, setsEqual, multiSelectAnswer, answerDisplayValue, DistractorStrategy, updated ProblemTemplate/Problem
- `src/services/mathEngine/answerFormats/types.ts` - MultiSelectPresentation, updated FormattedProblem, AnswerFormat, allowNegative on FreeTextPresentation
- `src/services/tutor/types.ts` - AgeBracket expanded to 6 brackets
- `src/services/tutor/safetyConstants.ts` - CONTENT_WORD_LIMITS and MAX_WORD_LENGTH for all 6 brackets
- `src/services/tutor/promptTemplates.ts` - WORD_LIMITS entries for 3 new brackets
- `src/__tests__/session/sessionOrchestrator.test.ts` - Fixed type narrowing after FormattedProblem union expansion

## Decisions Made

- `answerNumericValue` returns `values[0]` for multi_select as Elo proxy only — actual grading must use `setsEqual()` (enforced by type system and documented in code)
- `DistractorStrategy` is optional on both `ProblemTemplate` and `Problem` — existing templates default to `'default'` behavior without needing migration
- `WORD_LIMITS` in promptTemplates retains `Record<string, number>` type (not `Record<AgeBracket, number>`) — this refactor is deferred per plan scope

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed type narrowing in sessionOrchestrator.test.ts after FormattedProblem union expansion**

- **Found during:** Task 2 (AgeBracket expansion + MultiSelectPresentation)
- **Issue:** Adding `MultiSelectPresentation` to the `FormattedProblem` union caused a TypeScript error at line 243 in `sessionOrchestrator.test.ts` — the `else` branch accessed `item.presentation.maxDigits` without narrowing, which was valid when only `FreeTextPresentation` was the non-MC type but broke with `MultiSelectPresentation` added
- **Fix:** Changed `else {` to `else if (item.presentation.format === 'free_text') {` to properly narrow the type
- **Files modified:** `src/__tests__/session/sessionOrchestrator.test.ts`
- **Verification:** `npm run typecheck` passed (no new errors beyond pre-existing wave-0 stubs)
- **Committed in:** `a7c8573` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug introduced by union expansion)
**Impact on plan:** Fix required for correctness — the else branch would silently skip for multi_select presentations post-expansion. No scope creep.

## Issues Encountered

- Pre-existing typecheck errors in `MultiSelectMC.test.tsx` (missing component) and `NumberPad.test.tsx` (missing `allowNegative` prop) were wave-0 stubs from Plan 080-01 and are out of scope for this plan. They will be resolved in later plans.

## Next Phase Readiness

- All type contracts in place for Plans 080-03 (NumberPad negative input) and 080-04 (MultiSelectMC component)
- MultiSelectAnswer, setsEqual, and answerDisplayValue ready for Phase 087 (Quadratics)
- Grade 9-12 types ready for Phases 082-091 (high school domain handlers)
- AgeBracket 14-18 ready for expanded tutor safety validation in older student contexts

---
*Phase: 080-foundation*
*Completed: 2026-03-13*
