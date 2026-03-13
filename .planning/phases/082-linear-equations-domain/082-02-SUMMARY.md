---
phase: 082-linear-equations-domain
plan: 02
subsystem: math-engine
tags: [linear-equations, domain-handler, bug-library, skills, templates, algebra]

requires:
  - phase: 082-01
    provides: Wave 0 RED test stubs for linearEquations domain (linearEquations.test.ts, domainHandlerRegistry.test.ts)

provides:
  - linear_equations MathDomain type registered across all index/registry files
  - 8 SkillDefinition entries for grades 8-9 (one_step_addition through word_problem)
  - 8 ProblemTemplate entries, all with distractorStrategy: 'domain_specific'
  - linearEquationsHandler dispatching on 8 config types
  - 8 generator functions using construction-from-answer pattern
  - 3 BugPattern entries with balance-model description strings
  - ALLOWS_NEGATIVES includes 'linear_equations' for negative distractor support
  - BUGS_BY_OPERATION['linear_equations'] wired into distractorGenerator

affects: [083-coordinate-geometry, 091-integration, prompt-templates, skill-map-ui]

tech-stack:
  added: []
  patterns:
    - "construction-from-answer: pick x first, derive equation from x — generators never solve for x"
    - "operand layout convention: operands[0]=wrong-op result, operands[1]=constant b, operands[2]=correct x"
    - "balance-model bug descriptions: all 3 patterns explicitly mention maintaining/failing to maintain balance"

key-files:
  created:
    - src/services/mathEngine/skills/linearEquations.ts
    - src/services/mathEngine/templates/linearEquations.ts
    - src/services/mathEngine/bugLibrary/linearEquationsBugs.ts
    - src/services/mathEngine/domains/linearEquations/generators.ts
    - src/services/mathEngine/domains/linearEquations/linearEquationsHandler.ts
    - src/services/mathEngine/domains/linearEquations/index.ts
  modified:
    - src/services/mathEngine/types.ts
    - src/services/mathEngine/bugLibrary/validation.ts
    - src/services/mathEngine/bugLibrary/index.ts
    - src/services/mathEngine/bugLibrary/distractorGenerator.ts
    - src/services/mathEngine/skills/index.ts
    - src/services/mathEngine/templates/index.ts
    - src/services/mathEngine/domains/index.ts
    - src/services/mathEngine/domains/registry.ts
    - src/components/reports/SkillDomainSummary.tsx
    - src/components/skillMap/skillMapColors.ts
    - src/services/tutor/problemIntro.ts
    - src/__tests__/mathEngine/linearEquations.test.ts

key-decisions:
  - "Skill IDs use bare names (one_step_addition) not namespaced (linear_equations.one-step-addition) — matches Wave 0 RED test stubs"
  - "generateTwoStepMixed delegates inline (not via function calls) using rng.next() < 0.5 branch — avoids coupling between generators"
  - "generateWordProblemVariant delegates to two-step-add-mul logic inline with wordProblem: true metadata flag"
  - "lin_sign_flip uses operands[0] (wrong-op result) and operands[1] (constant b) matching distractorGenerator.ts call convention"

requirements-completed: [LIN-01, LIN-02, LIN-04]

duration: 1min
completed: 2026-03-13
---

# Phase 82 Plan 02: Linear Equations Domain Implementation Summary

**8-skill algebra domain with construction-from-answer generators, 3 balance-model bug patterns, and full registry wiring across 14 files**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-13T16:33:59Z
- **Completed:** 2026-03-13T16:34:50Z
- **Tasks:** 3
- **Files modified:** 14 (6 created, 8 modified)

## Accomplishments

- Complete linear_equations domain: 8 skills, 8 templates, 8 generators, 1 handler — all tests GREEN
- 3 algebra-specific bug patterns (lin_wrong_operation, lin_sign_flip, lin_forgot_to_divide) with balance-model descriptions for AI tutor
- Negative distractors enabled for linear_equations via ALLOWS_NEGATIVES; all 39 test assertions pass
- Downstream exhaustiveness fixes: SkillDomainSummary, skillMapColors, problemIntro all updated for new domain

## Task Commits

Each task was committed atomically:

1. **Task 1: Create domain infrastructure files (skills, templates, bug patterns)** - `332e24f` (feat)
2. **Task 2: Create linearEquations domain handler with 8 generators** - `4389f1a` (feat)
3. **Task 3: Wire everything into existing index/registry files** - `1a7def4` (feat)

## Files Created/Modified

- `src/services/mathEngine/skills/linearEquations.ts` - 8 SkillDefinition entries, grades 8-9
- `src/services/mathEngine/templates/linearEquations.ts` - 8 ProblemTemplate entries with distractorStrategy: 'domain_specific'
- `src/services/mathEngine/bugLibrary/linearEquationsBugs.ts` - 3 BugPattern entries with balance-model descriptions
- `src/services/mathEngine/domains/linearEquations/generators.ts` - 8 generator functions (construction-from-answer)
- `src/services/mathEngine/domains/linearEquations/linearEquationsHandler.ts` - DomainHandler switching on 8 config types
- `src/services/mathEngine/domains/linearEquations/index.ts` - barrel export
- `src/services/mathEngine/types.ts` - 'linear_equations' added to MathDomain union
- `src/services/mathEngine/bugLibrary/validation.ts` - 'linear_equations' added to ALLOWS_NEGATIVES
- `src/services/mathEngine/bugLibrary/distractorGenerator.ts` - LINEAR_EQUATIONS_BUGS registered
- `src/services/mathEngine/skills/index.ts` - LINEAR_EQUATIONS_SKILLS spread into SKILLS
- `src/services/mathEngine/templates/index.ts` - LINEAR_EQUATIONS_TEMPLATES spread into ALL_TEMPLATES
- `src/services/mathEngine/domains/registry.ts` - linearEquationsHandler registered
- `src/components/reports/SkillDomainSummary.tsx` - DOMAIN_LABELS and DOMAIN_ORDER updated
- `src/components/skillMap/skillMapColors.ts` - linear_equations color entry added (blue family)
- `src/services/tutor/problemIntro.ts` - linear_equations intro string added

## Decisions Made

- Skill IDs use bare names (`one_step_addition`, not `linear_equations.one-step-addition`) — Wave 0 test stubs specified exact IDs without namespace prefix
- `generateTwoStepMixed` uses inline branching (`rng.next() < 0.5`) rather than delegating to other exported functions — avoids export coupling
- `generateWordProblemVariant` uses two-step-add-mul math with `wordProblem: true` metadata flag
- `lin_sign_flip` receives `a=operands[0]` (wrong-op result) and `b=operands[1]` (constant) per distractorGenerator.ts call convention: `bug.compute(operands[0], operands[1], operation)`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Updated downstream Record<MathDomain,...> exhaustive maps**
- **Found during:** Task 3 (wiring phase)
- **Issue:** Adding 'linear_equations' to MathDomain union caused TypeScript errors in SkillDomainSummary (DOMAIN_LABELS), skillMapColors, and problemIntro (INTROS) — all use Record<MathDomain, ...> and require exhaustive entries
- **Fix:** Added `linear_equations` entries to all three files (label, color, intro string)
- **Files modified:** src/components/reports/SkillDomainSummary.tsx, src/components/skillMap/skillMapColors.ts, src/services/tutor/problemIntro.ts
- **Verification:** npm run typecheck passes (excluding pre-existing videoMap error)
- **Committed in:** 1a7def4 (Task 3 commit)

**2. [Rule 1 - Bug] Fixed incomplete Problem shape in Wave 0 test stub**
- **Found during:** Task 3 (typecheck run)
- **Issue:** linearEquations.test.ts line 134 constructed a partial Problem object missing templateId, skillId, standards, grade, baseElo; also metadata was Partial<ProblemMetadata> not ProblemMetadata
- **Fix:** Added missing required fields and spread with defaults to satisfy Problem type
- **Files modified:** src/__tests__/mathEngine/linearEquations.test.ts
- **Verification:** All 26 linearEquations tests pass, typecheck clean
- **Committed in:** 1a7def4 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both auto-fixes required for TypeScript correctness. No scope creep.

## Issues Encountered

- Pre-existing `coordinate_geometry` key in videoMap.ts (line 36) is invalid in `Partial<Record<MathDomain, string>>` — this was previously masked by `linear_equations` being invalid. Logged to deferred items; not in scope for this plan.

## Next Phase Readiness

- linear_equations domain fully operational; 39 tests GREEN (linearEquations + domainHandlerRegistry + distractorGenerator)
- Ready for Plan 03 (prompt templates) and Plan 04 (integration tests)
- Pre-existing videoMap.ts `coordinate_geometry` error should be resolved before Phase 83 adds more HS domains

---
*Phase: 082-linear-equations-domain*
*Completed: 2026-03-13*
