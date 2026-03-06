---
phase: 38-multi-child-store-foundation
plan: "01"
subsystem: store/helpers, services/profile
tags: [multi-child, store, data-contract, initialization]
dependency_graph:
  requires: []
  provides: [ChildData-type, CHILD_DATA_KEYS, dehydrate-hydrate, grade-init]
  affects: [store-migration, profiles-slice, partialize]
tech_stack:
  added: []
  patterns: [copy-on-switch-data-contract, grade-appropriate-seeding]
key_files:
  created:
    - src/store/helpers/childDataHelpers.ts
    - src/services/profile/profileInitService.ts
    - src/__tests__/store/childDataHelpers.test.ts
    - src/__tests__/services/profileInitService.test.ts
  modified: []
decisions:
  - "ChildData makes childName/childAge/childGrade non-nullable (new profiles always have values)"
  - "Pre-mastered skills use eloRating 1100, masteryLocked true, leitnerBox 5, cpaLevel abstract"
  - "Used any-cast in dehydrate/hydrate loop to satisfy TypeScript strict mode with dynamic key iteration"
metrics:
  duration: ~5min
  completed: "2026-03-06"
---

# Phase 38 Plan 01: ChildData Type and Grade Init Summary

ChildData type contract with 18-field dehydrate/hydrate roundtrip and grade-appropriate skill pre-mastery initialization service.

## What Was Built

### childDataHelpers.ts
- `ChildData` interface: all 18 per-child fields matching appStore partialize output
- `CHILD_DATA_KEYS`: const array as single source of truth for field names
- `dehydrateChild(state)`: extracts per-child fields from flat AppState
- `hydrateChild(data)`: creates partial state update from ChildData snapshot
- `DEFAULT_CHILD_DATA`: sensible defaults (xp:0, level:1, themeId:dark, empty collections)
- `createDefaultChildData(profile)`: factory merging profile info with defaults
- `NewChildProfile` type: minimal input for profile creation

### profileInitService.ts
- `createGradeAppropriateSkillStates(grade)`: pre-masters all skills below child's grade
- Grade 1 = empty (no skills below), Grade 2 = 6 G1 skills, Grade 3 = 10 G1+G2 skills
- Pre-mastered state: eloRating 1100, attempts 5, correct 5, masteryProbability 0.95, masteryLocked true, leitnerBox 5, cpaLevel abstract

## Test Results

- childDataHelpers: 9 tests passed
- profileInitService: 7 tests passed
- Total: 16 tests, 0 failures
- TypeScript typecheck: clean

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript strict mode cast error in dehydrateChild/hydrateChild**
- **Found during:** Task 1 verification (typecheck)
- **Issue:** `Record<string, unknown>` cannot be cast directly to `ChildData` in strict mode
- **Fix:** Used `Partial<ChildData>` intermediate type with `any`-cast in loop body
- **Files modified:** src/store/helpers/childDataHelpers.ts
- **Commit:** b878ac8

## Commits

| Commit  | Type | Description |
|---------|------|-------------|
| 611e5ff | feat | ChildData type and hydrate/dehydrate helpers (Task 1) |
| 85bebb3 | feat | Grade-appropriate skill initialization service (Task 2) |
| b878ac8 | fix  | TypeScript strict mode cast fix |
