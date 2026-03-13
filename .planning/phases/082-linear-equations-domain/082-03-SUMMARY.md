---
phase: 082-linear-equations-domain
plan: 03
subsystem: math-engine
tags: [linear-equations, word-problems, templates, ai-tutor, socratic-hints, balance-model]

requires:
  - phase: 082-02
    provides: linear_equations domain handler, 8 skills, 8 templates, 3 bug patterns, full wiring

provides:
  - 6 word problem prefix templates for linear_equations (age, distance, money contexts)
  - wordProblems.test.ts GREEN with linear_equations in ALL_OPERATIONS
  - Manual QA sign-off — 10+ Gemini Socratic hints reviewed; none reveal answer in HINT mode
  - Phase 82 complete — all 4 requirements (LIN-01 through LIN-04) satisfied

affects: [083-coordinate-geometry, 091-integration, word-problem-generator]

tech-stack:
  added: []
  patterns:
    - "prefix mode word problems: mode='prefix' prepends scene-setting sentence before equation text — avoids {a}/{b} operand mismatch (Pitfall 5)"
    - "COPPA-safe templates: no personal info, no chat references — use {name}/{place} substitution vars only"

key-files:
  created: []
  modified:
    - src/services/mathEngine/wordProblems/templates.ts

key-decisions:
  - "All 6 linear_equations word problem templates use mode='prefix' — equation text is preserved unchanged; context sentence is prepended (avoids operand display mismatch)"
  - "Templates reference {name} and {place} substitution vars only — {a}/{b} not used in prefix mode per Pitfall 5 in RESEARCH.md"
  - "minGrade: 8 for all 6 templates matches the domain's grade range (grades 8-9)"

patterns-established:
  - "Prefix mode pattern: for domains where operand tokens ({a}/{b}) do not map meaningfully to context nouns, use mode='prefix' with scene-setting sentences and empty question field"

requirements-completed: [LIN-03, LIN-04]

duration: ~10min
completed: 2026-03-13
---

# Phase 82 Plan 03: Word Problem Templates + Manual QA Summary

**6 prefix-mode word problem templates for linear_equations (age/distance/money) with manual QA sign-off confirming balance-model Socratic hints never reveal the answer**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-13T16:36:04Z
- **Completed:** 2026-03-13
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 1

## Accomplishments

- 6 word problem prefix templates added to templates.ts covering age (2), distance (2), and money (2) contexts for grades 8-9
- generateWordProblem returns non-null for operation 'linear_equations' at grade 8 and 9 — wordProblems.test.ts GREEN
- Manual QA checkpoint approved: 10+ Gemini Socratic hints reviewed across one-step, two-step, and word problem variants — none revealed the answer in HINT mode; balance-model framing confirmed ("What happens to both sides if you subtract?")
- Phase 82 fully complete — all 4 requirements LIN-01 through LIN-04 satisfied

## Task Commits

Each task was committed atomically:

1. **Task 1: Add 6 word problem prefix templates to templates.ts** - `09f4085` (feat)
2. **Task 2: Manual QA — AI tutor balance-model hint quality** - checkpoint approved (no commit — human QA, no code changes)

## Files Created/Modified

- `src/services/mathEngine/wordProblems/templates.ts` - 6 new entries added in LINEAR EQUATIONS section (wp_lin_age_1, wp_lin_age_2, wp_lin_distance_1, wp_lin_distance_2, wp_lin_money_1, wp_lin_money_2)

## Decisions Made

- Used mode='prefix' for all 6 templates so the equation text from the generator is preserved unchanged — the word problem template only adds a scene-setting sentence. This sidesteps the operand display problem (Pitfall 5 from RESEARCH.md) where {a} and {b} would show raw coefficient values rather than contextual nouns.
- Templates use {name} and {place} substitution vars only; {a}/{b} are not referenced in any of the 6 entries.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 82 is fully complete (LIN-01 through LIN-04 all satisfied)
- linear_equations domain is production-ready: 8 skills, 8 templates, 3 bug patterns, 6 word problem templates, full registry wiring, manual QA passed
- Phase 83 (Coordinate Geometry) can proceed — pre-existing videoMap.ts `coordinate_geometry` key error should be resolved early in Phase 83 since that domain will add its own video entries

---
*Phase: 082-linear-equations-domain*
*Completed: 2026-03-13*
