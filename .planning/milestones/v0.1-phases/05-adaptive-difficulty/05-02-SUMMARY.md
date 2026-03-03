---
phase: 05-adaptive-difficulty
plan: 02
subsystem: adaptive
tags: [elo, gaussian-weighting, problem-selection, skill-selection, xp, adaptive-difficulty]

# Dependency graph
requires:
  - phase: 05-adaptive-difficulty/05-01
    provides: "Elo calculator, frustration guard, prerequisite gating, adaptive types"
  - phase: 02-math-engine-core
    provides: "Problem templates, seededRng, generator, skill definitions"
  - phase: 04-state-management
    provides: "SkillState type definition for Elo ratings per skill"
provides:
  - "Gaussian-weighted problem selector targeting 85% success rate"
  - "Weakness-prioritized skill selector with baseline floor"
  - "Difficulty-scaled XP calculator for gamification rewards"
  - "Barrel export index.ts for entire adaptive service"
  - "End-to-end integration tests for adaptive flow"
affects: [06-session-flow, 08-gamification]

# Tech tracking
tech-stack:
  added: []
  patterns: ["gaussian weighting for target probability", "cumulative distribution sampling", "weakness-priority skill selection"]

key-files:
  created:
    - src/services/adaptive/problemSelector.ts
    - src/services/adaptive/skillSelector.ts
    - src/services/adaptive/xpCalculator.ts
    - src/services/adaptive/index.ts
    - src/__tests__/adaptive/problemSelector.test.ts
    - src/__tests__/adaptive/skillSelector.test.ts
    - src/__tests__/adaptive/xpCalculator.test.ts
    - src/__tests__/adaptive/integration.test.ts
  modified: []

key-decisions:
  - "Gaussian weight formula exp(-(p-target)^2 / (2*sigma^2)) with sigma=0.10 for problem selection"
  - "WEAKNESS_BASELINE=50 ensures all skills get non-zero selection probability"
  - "XP SCALE_FACTOR=0.01 gives 3 bonus XP per 250 Elo above reference"
  - "Frustration override filters templates but still applies gaussian weighted selection"
  - "Integration tests use real functions (no mocking) to validate module composition"

patterns-established:
  - "Cumulative distribution sampling: sum weights, roll, walk distribution"
  - "Gaussian proximity weighting for target probability matching"
  - "Weakness-priority selection with configurable baseline floor"

requirements-completed: [ADPT-01, ADPT-02, ADPT-03, ADPT-04]

# Metrics
duration: 4min
completed: 2026-03-02
---

# Phase 5 Plan 2: Problem Selector, Skill Selector & XP Calculator Summary

**Gaussian-weighted problem selection targeting 85% success, weakness-prioritized skill selector, and difficulty-scaled XP calculator with barrel export and integration tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-02T23:07:31Z
- **Completed:** 2026-03-02T23:11:45Z
- **Tasks:** 2
- **Files created:** 8

## Accomplishments
- Problem selector with gaussian weighting targets 85% expected success rate using exp(-(p-target)^2 / (2*sigma^2))
- Frustration override filters to easier templates while maintaining weighted selection
- Skill selector prioritizes weaker skills (lower Elo) with WEAKNESS_BASELINE=50 floor
- XP calculator scales rewards by difficulty with BASE_XP=10 minimum floor
- Barrel export re-exports all 6 adaptive modules for clean Phase 6 imports
- Integration tests validate full flow: skill selection -> template selection -> problem generation -> Elo update
- Convergence simulation confirms Elo system trends toward 85% target success
- All 277 tests pass across 18 suites, TypeScript strict mode compiles cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Problem selector, skill selector, XP calculator with tests** - `d1bddef` (test: RED), `a0d8c44` (feat: GREEN)
2. **Task 2: Barrel export and integration test** - `1bda987` (feat)

**Plan metadata:** [pending] (docs: complete plan)

_Note: TDD task 1 has RED + GREEN commits._

## Files Created/Modified
- `src/services/adaptive/problemSelector.ts` - Gaussian-weighted template selection targeting 85% success rate with frustration override
- `src/services/adaptive/skillSelector.ts` - Weakness-prioritized skill selection with baseline floor
- `src/services/adaptive/xpCalculator.ts` - Difficulty-scaled XP calculator
- `src/services/adaptive/index.ts` - Barrel export for all 6 adaptive modules
- `src/__tests__/adaptive/problemSelector.test.ts` - 9 tests: weighting, determinism, frustration, distribution
- `src/__tests__/adaptive/skillSelector.test.ts` - 6 tests: weakness priority, determinism, distribution
- `src/__tests__/adaptive/xpCalculator.test.ts` - 5 tests: base values, scaling, monotonicity
- `src/__tests__/adaptive/integration.test.ts` - 5 tests: full flow, frustration, XP, convergence, independence

## Decisions Made
- Gaussian weight sigma=0.10 provides sharp selectivity around 85% target while still allowing variety
- WEAKNESS_BASELINE=50 ensures even the strongest skill has meaningful selection probability
- XP SCALE_FACTOR=0.01 gives moderate bonus (3 XP per 250 Elo above reference) to avoid over-rewarding
- Frustration override filters templates but still applies gaussian weighted selection (does not bypass the 85% targeting)
- Integration tests use real functions from all modules (no mocking) to validate correct composition
- Convergence test uses wide tolerance (0.70-0.95) because 50 rounds is insufficient for precise convergence

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test expectation for near-zero weight threshold**
- **Found during:** Task 1 (GREEN phase - problem selector tests)
- **Issue:** Test used student Elo 1400 with template baseElo 800, expecting weight < 0.01. But expected success was ~97% (deviation 0.12 from 85%), giving weight ~0.49 -- not near-zero.
- **Fix:** Changed to student Elo 600 (expected success ~24%, deviation 0.61 from 85%) which correctly produces near-zero weight (~8e-9).
- **Files modified:** src/__tests__/adaptive/problemSelector.test.ts
- **Verification:** Test passes with corrected expectation
- **Committed in:** a0d8c44 (Task 1 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix in test)
**Impact on plan:** Test expectation correction only. No implementation or scope changes.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete adaptive difficulty service ready for Phase 6 session flow integration
- Barrel export at `@/services/adaptive` provides clean public API
- All modules are pure functions with no store coupling -- easy to compose in session hooks
- XP calculator ready for Phase 8 gamification rewards integration

## Self-Check: PASSED

All 8 created files verified on disk. All 4 commits verified in git log. 277 tests pass, TypeScript compiles cleanly.

---
*Phase: 05-adaptive-difficulty*
*Completed: 2026-03-02*
