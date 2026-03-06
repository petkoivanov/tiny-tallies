---
phase: 38-multi-child-store-foundation
plan: "03"
subsystem: store/navigation
tags: [auto-save, navigation, integration, multi-child]
dependency_graph:
  requires: [38-02]
  provides: [useAutoSave, conditional-navigation, profile-setup-route]
  affects: [App.tsx, AppNavigator.tsx, navigation-types]
tech_stack:
  added: []
  patterns: [AppState-listener, conditional-initial-route, copy-on-switch-persistence]
key_files:
  created:
    - src/hooks/useAutoSave.ts
    - src/__tests__/hooks/useAutoSave.test.ts
  modified:
    - src/navigation/AppNavigator.tsx
    - src/navigation/types.ts
    - App.tsx
    - src/__tests__/appStore.test.ts
decisions:
  - useAutoSave placed at App root level (outside NavigationContainer children)
  - ProfileSetup placeholder inline in AppNavigator (Phase 39 replaces)
  - Persistence tests updated to use direct setState instead of addChild (expo-crypto unavailable in Jest)
metrics:
  duration: ~8min
  completed: "2026-03-06T13:10:00Z"
  tasks_completed: 3
  tasks_total: 3
  tests_added: 5
  tests_total: 1452
---

# Phase 38 Plan 03: Auto-Save and Conditional Navigation Summary

Auto-save hook with AppState listener and conditional ProfileSetup routing, completing the multi-child store foundation.

## One-Liner

useAutoSave hook triggers saveActiveChild on app background; AppNavigator conditionally routes to ProfileSetup when no child profiles exist.

## Task Results

### Task 1: useAutoSave hook with AppState listener (TDD)
- **Commit:** 496404d
- Created `src/hooks/useAutoSave.ts` with AppState change listener
- Saves active child on active->background and active->inactive transitions only
- Ignores background->active and inactive->active (resume) transitions
- Cleans up listener on unmount
- 5 tests covering all transition paths + cleanup

### Task 2: Conditional navigation and auto-save integration
- **Commit:** f2be20f
- AppNavigator reads `childCount` from store to determine initial route
- Routes to `ProfileSetup` when no profiles exist, `Home` otherwise
- Added `ProfileSetup` placeholder screen (Phase 39 replaces with full wizard)
- Added `ProfileSetup: undefined` to `RootStackParamList`
- Wired `useAutoSave()` call in `App.tsx` at root level

### Task 3: Full integration verification
- **Commit:** f058475
- Fixed STORE_VERSION assertion (11 -> 13 after Plan 02 v12->v13 migration)
- Updated 3 persistence tests to check `children[activeChildId]` instead of flat `parsed.state` fields
- Fixed beforeEach to use direct `setState` for active child setup (expo-crypto `randomUUID` unavailable in Jest)
- All 1452 tests pass across 99 suites, zero regressions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing persistence test failures from Plan 02**
- **Found during:** Task 3
- **Issue:** 4 appStore persistence tests failed because Plan 02 changed partialize to store child data inside `children` map, but tests still checked flat `parsed.state` fields. Additionally, STORE_VERSION test expected 11 but was bumped to 13.
- **Fix:** Updated assertions to read from `children[TEST_CHILD_ID]`, used direct `setState` instead of `addChild` (expo-crypto not available in Jest), updated version assertion.
- **Files modified:** `src/__tests__/appStore.test.ts`
- **Commit:** f058475

## Verification

- `npm test`: 1452 passed, 0 failed (99 suites)
- `npm run typecheck`: Clean, zero errors
