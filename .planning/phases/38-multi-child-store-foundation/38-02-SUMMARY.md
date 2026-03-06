---
phase: 38-multi-child-store-foundation
plan: "02"
subsystem: store
tags: [multi-child, profiles, migration, zustand]
dependency_graph:
  requires: [38-01]
  provides: [ProfilesSlice, multi-child-store, v13-migration]
  affects: [appStore, migrations, partialize]
tech_stack:
  added: [expo-crypto]
  patterns: [copy-on-switch, inline-dehydration, atomic-set]
key_files:
  created:
    - src/store/slices/profilesSlice.ts
    - src/__tests__/store/profilesSlice.test.ts
    - src/__tests__/store/migrations.test.ts
  modified:
    - src/store/appStore.ts
    - src/store/migrations.ts
decisions:
  - "Inline dehydration in partialize ensures active child data is always persisted even on force-kill"
  - "onRehydrateStorage callback hydrates active child flat fields after persist middleware loads"
  - "removeChild resets to DEFAULT_CHILD_DATA when last profile deleted (not null fields)"
metrics:
  duration: ~15min
  completed: "2026-03-06"
---

# Phase 38 Plan 02: ProfilesSlice and Store Restructure Summary

ProfilesSlice with copy-on-switch multi-child support, v12->v13 structural migration wrapping 18 flat fields into children map, and restructured partialize for children-only persistence.

## Tasks Completed

### Task 1: ProfilesSlice with switch, add, remove, save actions
- **Commit:** f8d8b90
- Created `profilesSlice.ts` with `ProfilesSlice` interface and `createProfilesSlice`
- `addChild`: UUID generation via expo-crypto, grade-appropriate skill initialization, 5-profile limit guard, dehydrates current child before activating new one
- `switchChild`: blocks during active session, guards non-existent child, atomic dehydrate+hydrate in single `set()` call
- `removeChild`: handles last-child deletion (reset to defaults), active-child deletion (switch to next), non-active deletion
- `saveActiveChild`: dehydrates current flat state into children map entry
- `setMigrationComplete`: clears `_needsMigrationPrompt` flag
- 13 tests covering all actions and edge cases

### Task 2: Restructure appStore, update partialize, implement v12->v13 migration
- **Commit:** 27bc2cf
- Bumped `STORE_VERSION` from 12 to 13
- `AppState` type includes `ProfilesSlice`, store composes `createProfilesSlice`
- `partialize` now persists only `children` (with inline dehydration of active child), `activeChildId`, `_needsMigrationPrompt`
- Added `onRehydrateStorage` callback to hydrate active child flat fields on app load
- v12->v13 migration extracts all 18 `CHILD_DATA_KEYS` fields into children map with generated UUID
- Migration sets `_needsMigrationPrompt: true` for existing users
- 7 migration tests covering field preservation, UUID assignment, fresh install, full v0->v13 chain

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- All 13 profilesSlice tests pass
- All 7 new migration tests pass (+ 39 existing migration tests)
- TypeScript typecheck clean
- Total: 59 tests passing across profilesSlice, migrations, childDataHelpers

## Self-Check: PASSED
