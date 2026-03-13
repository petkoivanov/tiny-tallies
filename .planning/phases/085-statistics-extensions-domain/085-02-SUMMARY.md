---
phase: 085-statistics-extensions-domain
plan: 02
subsystem: math-engine
tags: [statistics, domain-handler, skills, templates, bug-library, generators]
dependency_graph:
  requires: [085-01]
  provides: [statistics_hs-domain-handler, statistics_hs-skills, statistics_hs-templates, statistics_hs-bugs]
  affects: [bugLibrary/distractorGenerator, domains/registry, skills/index, templates/index, videoMap]
tech_stack:
  added: []
  patterns: [construction-from-answer, domain-specific-distractor-strategy, fixed-lookup-table]
key_files:
  created:
    - src/services/mathEngine/domains/statisticsHs/generators.ts
    - src/services/mathEngine/domains/statisticsHs/statisticsHsHandler.ts
    - src/services/mathEngine/domains/statisticsHs/index.ts
    - src/services/mathEngine/bugLibrary/statisticsHsBugs.ts
    - src/services/mathEngine/skills/statisticsHs.ts
    - src/services/mathEngine/templates/statisticsHs.ts
  modified:
    - src/services/mathEngine/types.ts
    - src/services/mathEngine/bugLibrary/index.ts
    - src/services/mathEngine/bugLibrary/distractorGenerator.ts
    - src/services/mathEngine/skills/index.ts
    - src/services/mathEngine/templates/index.ts
    - src/services/mathEngine/domains/index.ts
    - src/services/mathEngine/domains/registry.ts
    - src/services/video/videoMap.ts
    - src/components/reports/SkillDomainSummary.tsx
    - src/components/skillMap/skillMapColors.ts
    - src/services/tutor/problemIntro.ts
decisions:
  - "'statistics_hs' metadata fields use empty Partial<ProblemMetadata> — ProblemMetadata is a fixed interface, domain-specific data does not persist beyond generation"
  - "generateStdDevConcept uses rng.intRange for all randomness — SeededRng has no choice() method, implemented as local rngChoice() helper using intRange"
  - "statistics_hs added to skillMapColors, DOMAIN_LABELS, and problemIntro INTROS as required auto-fixes (Rule 2) since MathDomain union expansion makes these Record<MathDomain, ...> maps exhaustive"
metrics:
  duration: "4 minutes 13 seconds"
  completed_date: "2026-03-13"
  tasks_completed: 3
  files_created: 6
  files_modified: 11
---

# Phase 085 Plan 02: Statistics HS Domain Implementation Summary

Complete statistics_hs domain: 5 skills, 5 templates with domain_specific distractors, 3 bug patterns for AI tutor context, 4 generators using construction-from-answer with integer-safe z-scores bounded in [-2, 2], and full wiring into all registries.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create domain infrastructure files (skills, templates, bug patterns) | afa6062 | statisticsHs.ts x3 (skills/templates/bugs) |
| 2 | Create statisticsHs domain handler with 4 generators | 43a5976 | generators.ts, statisticsHsHandler.ts, index.ts |
| 3 | Wire everything into existing index/registry files | 46d2b17 | types.ts + 10 existing files |

## What Was Built

**Skills (5 entries):**
- `stats_stddev_concept` — grade 9, HSS-ID.A.2
- `stats_normal_rule` — grade 9, HSS-ID.A.4
- `stats_zscore` — grade 10, HSS-ID.A.4
- `stats_percentile` — grade 10, HSS-ID.A.4
- `stats_word_problem` — grade 10, HSS-ID.A.4

**Templates (5 entries):** All with `distractorStrategy: 'domain_specific'`, digitCount: 1

**Generators (4 functions):**
- `generateStdDevConcept`: answer is 1 or 2 (integer dataset index), operands hold wrongChoice
- `generateNormalDistribution`: 68% or 95% only (no 99.7 decimal), operands hold swapped band + tail
- `generateZScore`: z = intRange(-2,2), sigma ∈ {5,10,15,20}, x = mu + z*sigma; operands hold -z and z*sigma
- `generatePercentile`: fixed lookup table {-2:2, -1:16, 0:50, 1:84, 2:97}; word_problem reuses zscore generator

**Bug Patterns (3 entries):**
- `stats_zscore_sign_flip`: student negated z-score
- `stats_zscore_forgot_mean`: student forgot to subtract mean (z*sigma vs (x-mu)/sigma)
- `stats_normal_wrong_band`: student confused 68% and 95% bands

## Verification Results

- `npm run typecheck`: 0 errors
- `statisticsHs.test.ts`: all tests GREEN (handler registered, 5 skills, 5 templates, distractorStrategy, integer answers seeds 1-20, z-score bounds [-2,2], 3 bug patterns, distractor generation)
- `domainHandlerRegistry.test.ts`: PASS (22 operations, 175 skills)
- `prerequisiteGating.test.ts`: PASS (175 skills)
- `distractorGenerator.test.ts`: PASS (BUGS_BY_OPERATION exhaustive)
- Total: 51 tests passed across 3 suites

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added statistics_hs to MathDomain-keyed maps in components/services**

- **Found during:** Task 3 typecheck
- **Issue:** Adding 'statistics_hs' to MathDomain union caused TypeScript errors in 3 files that use `Record<MathDomain, ...>`: `SkillDomainSummary.tsx` (DOMAIN_LABELS), `skillMapColors.ts`, and `problemIntro.ts` (INTROS)
- **Fix:** Added `statistics_hs` entry to each exhaustive map with appropriate values
- **Files modified:** src/components/reports/SkillDomainSummary.tsx, src/components/skillMap/skillMapColors.ts, src/services/tutor/problemIntro.ts
- **Commit:** 46d2b17

**2. [Rule 1 - Bug] Fixed metadata type error in generators.ts**

- **Found during:** Task 3 typecheck
- **Issue:** Custom keys (center, sigmaCount, mu, z) were added to metadata return but `Partial<ProblemMetadata>` does not allow unknown keys — TypeScript strict mode error
- **Fix:** Changed all 4 generator metadata returns to `{}` (empty partial) matching the pattern used by all other domain generators
- **Files modified:** src/services/mathEngine/domains/statisticsHs/generators.ts
- **Commit:** included in 43a5976 (discovered before commit)

**3. [Rule 1 - Bug] Implemented rngChoice() helper since SeededRng has no choice() method**

- **Found during:** Task 2 (writing generators.ts)
- **Issue:** Plan specified `rng.choice([68, 95])` but SeededRng interface only has `next()` and `intRange()` — no choice() method
- **Fix:** Added local `rngChoice<T>(rng, items)` helper function in generators.ts using `rng.intRange(0, items.length - 1)`
- **Files modified:** src/services/mathEngine/domains/statisticsHs/generators.ts
- **Commit:** 43a5976

## Self-Check

**Files exist:**
- src/services/mathEngine/domains/statisticsHs/generators.ts: FOUND
- src/services/mathEngine/domains/statisticsHs/statisticsHsHandler.ts: FOUND
- src/services/mathEngine/bugLibrary/statisticsHsBugs.ts: FOUND
- src/services/mathEngine/skills/statisticsHs.ts: FOUND
- src/services/mathEngine/templates/statisticsHs.ts: FOUND

**Commits exist:**
- afa6062: FOUND
- 43a5976: FOUND
- 46d2b17: FOUND

## Self-Check: PASSED
