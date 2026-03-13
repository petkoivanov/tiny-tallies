---
phase: 080-foundation
plan: "01"
subsystem: testing
tags: [tdd, wave-0, migrations, math-engine, components]
dependency_graph:
  requires: []
  provides:
    - FOUND-04 test stubs (migrations v21->v22)
    - FOUND-05 test stubs (NumberPad allowNegative)
    - FOUND-06 test stubs (setsEqual + multiSelectAnswer)
    - FOUND-07 test stubs (MultiSelectMC component)
  affects:
    - src/__tests__/store/migrations.test.ts
    - src/__tests__/mathEngine/answerTypes.test.ts
    - src/__tests__/components/session/NumberPad.test.tsx
    - src/__tests__/components/session/MultiSelectMC.test.tsx
tech_stack:
  added: []
  patterns:
    - "Wave 0 TDD stubs: RED state tests that drive Plans 02, 03, and 04"
    - "Sentinel field pattern for migration tests (childGradeV22Migrated)"
key_files:
  created:
    - src/__tests__/mathEngine/answerTypes.test.ts
    - src/__tests__/components/session/NumberPad.test.tsx
    - src/__tests__/components/session/MultiSelectMC.test.tsx
  modified:
    - src/__tests__/store/migrations.test.ts
decisions:
  - "Sentinel field childGradeV22Migrated used in migration stubs so tests fail on missing v22 block, not just on fast-path"
  - "NumberPad display testID assumption: numberpad-display (Plan 04 must ensure this exists)"
  - "MultiSelectMC testIDs established in stubs: multiselectmc-check-button, multiselectmc-option-N-selected, multiselectmc-option-N-correct"
metrics:
  duration_seconds: 217
  completed_date: "2026-03-13"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 1
---

# Phase 80 Plan 01: Wave 0 Test Stubs Summary

Four failing test stubs that define verification contracts for FOUND-04 through FOUND-07 before any implementation begins, using the sentinel-field and module-resolution RED patterns.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Store migration + answer-types test stubs | deb58a7 | migrations.test.ts (modified), answerTypes.test.ts (created) |
| 2 | NumberPad + MultiSelectMC test stubs | d8f87fa | NumberPad.test.tsx (created), MultiSelectMC.test.tsx (created) |

## Test Stub Status

All 4 Wave 0 stub suites are in RED (FAIL) state as required:

| File | Failure mode | RED until |
|------|-------------|-----------|
| `migrations.test.ts` (new describes) | Sentinel `childGradeV22Migrated` is `undefined` | Plan 03 adds v22 migration |
| `answerTypes.test.ts` | `TypeError: not a function` for setsEqual/multiSelectAnswer | Plan 02 adds exports |
| `NumberPad.test.tsx` | 6/7 tests fail — `allowNegative` prop absent, ± key not rendered | Plan 04 adds prop |
| `MultiSelectMC.test.tsx` | `Cannot find module '@/components/session/MultiSelectMC'` | Plan 04 creates component |

## Decisions Made

1. **Sentinel field pattern for migration tests:** Instead of relying purely on assertion errors after the migration runs, tests assert `result.childGradeV22Migrated === true` as a sentinel. This makes them fail cleanly in RED state (v22 block missing) and will pass once Plan 03 adds the migration.

2. **testID contract established in stubs:** The NumberPad test targets `testID="numberpad-display"` and MultiSelectMC tests target `testID="multiselectmc-check-button"`, `testID="multiselectmc-option-N-selected"`, and `testID="multiselectmc-option-N-correct"`. Plan 04 must implement these exact testIDs for the tests to go GREEN.

3. **Reanimated mock pattern:** Used inline object mock (not `require('react-native-reanimated/mock')`) following the project convention established in `AvatarCircle.test.tsx` and other existing tests.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Relative import path in migrations.test.ts converted to @/ alias**
- **Found during:** Task 1
- **Issue:** Existing `migrations.test.ts` used `'../../store/migrations'` but skill requires `@/` aliases
- **Fix:** Changed to `import { migrateStore } from '@/store/migrations'`
- **Files modified:** `src/__tests__/store/migrations.test.ts`
- **Commit:** deb58a7

**2. [Rule 3 - Blocking] Reanimated mock pattern incompatible with project setup**
- **Found during:** Task 2
- **Issue:** `require('react-native-reanimated/mock')` caused `createSerializable is not a function` error
- **Fix:** Replaced with inline object mock matching `AvatarCircle.test.tsx` pattern
- **Files modified:** `NumberPad.test.tsx`, `MultiSelectMC.test.tsx`
- **Commit:** d8f87fa
