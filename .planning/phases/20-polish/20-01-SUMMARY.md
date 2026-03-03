---
phase: 20-polish
plan: 01
subsystem: ui, services
tags: [react-native, reanimated, hooks, undo, guided-mode, animation, CPA]

# Dependency graph
requires:
  - phase: 17-manipulatives
    provides: ManipulativeShell, animationConfig, shared barrel exports
  - phase: 18-cpa-session
    provides: CPA types, ManipulativeType, Operation types
provides:
  - useActionHistory generic undo hook for all 6 manipulatives
  - GuidedHighlight pulsing glow animation component
  - guidedSteps service with 7 operation-manipulative resolvers
  - ManipulativeShell extended with undo and grid toggle buttons
affects: [20-02, 20-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [stateless-resolver-registry, state-snapshot-undo, platform-conditional-animation]

key-files:
  created:
    - src/components/manipulatives/shared/useActionHistory.ts
    - src/components/manipulatives/shared/GuidedHighlight.tsx
    - src/services/cpa/guidedStepsTypes.ts
    - src/services/cpa/guidedSteps.ts
    - src/__tests__/manipulatives/useActionHistory.test.ts
    - src/__tests__/manipulatives/GuidedHighlight.test.tsx
    - src/__tests__/cpa/guidedSteps.test.ts
  modified:
    - src/components/manipulatives/ManipulativeShell.tsx
    - src/components/manipulatives/ManipulativeShell.test.tsx
    - src/components/manipulatives/shared/animationConfig.ts
    - src/components/manipulatives/shared/index.ts
    - src/services/cpa/index.ts

key-decisions:
  - "useActionHistory uses useState + useRef (not useReducer) for synchronous undo return value"
  - "Guided step resolvers are stateless -- consumers track phase transitions for subtraction"
  - "GuidedHighlight uses shadow on iOS and border-color pulse on Android for cross-platform glow"
  - "UNDO_SPRING_CONFIG reuses RETURN_SPRING_CONFIG values for consistent animation feel"

patterns-established:
  - "Stateless resolver registry: operation + manipulative type -> GuidedStepResolver function"
  - "State-snapshot undo: useActionHistory hook with ref-based sync return for undo"
  - "Platform-conditional animation: iOS shadow vs Android border for glow effects"

requirements-completed: [POL-01, POL-02]

# Metrics
duration: 7min
completed: 2026-03-03
---

# Phase 20 Plan 01: Shared Infrastructure Summary

**useActionHistory undo hook, GuidedHighlight pulsing glow component, guided step resolver service, and ManipulativeShell extended with undo/grid toggle buttons**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-03T23:44:50Z
- **Completed:** 2026-03-03T23:51:56Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- useActionHistory generic hook tracks state snapshots with push/undo/reset and configurable 10-step cap
- GuidedHighlight component renders pulsing glow animation using Reanimated withRepeat on UI thread
- Guided step lookup service with 7 resolvers covering counters, ten_frame, base_ten_blocks, number_line, and bar_model for addition and subtraction
- ManipulativeShell extended with undo button (disabled state) and grid toggle button, fully backward compatible
- 41 tests passing across 4 test suites

## Task Commits

Each task was committed atomically:

1. **Task 1: useActionHistory hook and guided steps service** - `254d97a` (test RED), `d3aa0a7` (feat GREEN)
2. **Task 2: ManipulativeShell extension with undo and grid toggle** - `dfe47bb` (feat)
3. **Task 3: GuidedHighlight component and animation config** - `d156ca5` (test)

_Note: Task 1 TDD had RED then GREEN commits. Tasks 2 and 3 leveraged partially existing implementations from a prior partial execution._

## Files Created/Modified
- `src/components/manipulatives/shared/useActionHistory.ts` - Generic state-snapshot undo hook with ref-based sync return
- `src/components/manipulatives/shared/GuidedHighlight.tsx` - Pulsing glow animation wrapper using Reanimated withRepeat
- `src/components/manipulatives/shared/animationConfig.ts` - Added UNDO_SPRING_CONFIG, PULSE_GLOW_CONFIG, GUIDED_GLOW_COLOR
- `src/components/manipulatives/shared/index.ts` - Barrel exports for useActionHistory, GuidedHighlight, new animation configs
- `src/components/manipulatives/ManipulativeShell.tsx` - Extended with onUndo/canUndo/onGridToggle/isGridMode props
- `src/components/manipulatives/ManipulativeShell.test.tsx` - 7 new tests for undo and grid toggle buttons
- `src/services/cpa/guidedStepsTypes.ts` - GuidedStep and GuidedStepResolver interfaces
- `src/services/cpa/guidedSteps.ts` - 7 resolver implementations with registry lookup
- `src/services/cpa/index.ts` - Exports for guided step types and service
- `src/__tests__/manipulatives/useActionHistory.test.ts` - 8 tests for hook behaviors
- `src/__tests__/manipulatives/GuidedHighlight.test.tsx` - 4 tests for component rendering
- `src/__tests__/cpa/guidedSteps.test.ts` - 15 tests for resolver behaviors

## Decisions Made
- **useActionHistory sync return:** Used useRef to mirror state so undo() returns the restored state synchronously (useState callback is async via React batching)
- **Stateless resolvers:** Guided step resolvers receive only operation, manipulativeType, operands, and currentCount -- no phase tracking. For subtraction, consumers track adding vs removing phases separately and stop calling the resolver when done
- **Platform-conditional glow:** GuidedHighlight uses shadowColor pulse on iOS (native shadow system) and borderColor opacity pulse on Android (since Android elevation only supports gray)
- **UNDO_SPRING_CONFIG:** Reuses RETURN_SPRING_CONFIG values (damping: 15, stiffness: 200) for consistent animation feel across undo operations

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed useActionHistory undo return value**
- **Found during:** Task 1 (useActionHistory hook)
- **Issue:** Original implementation used setState callback to capture restored value, but React batches state updates so the return value was always null
- **Fix:** Added useRef to mirror internal state, allowing undo() to read synchronously before setState completes
- **Files modified:** src/components/manipulatives/shared/useActionHistory.ts
- **Verification:** All 8 useActionHistory tests pass including undo return value test
- **Committed in:** d3aa0a7

**2. [Rule 1 - Bug] Fixed guided step resolver targets**
- **Found during:** Task 1 (guidedSteps service)
- **Issue:** Prior implementation used `add-tens`/`add-ones` for base_ten_blocks (inconsistent with test expectations), countersSubtraction returned null instead of remove targets, tenFrameSubtraction used cell-index instead of generic cell-to-remove for removal phase
- **Fix:** Renamed to `tens-column`/`ones-column`, implemented proper two-phase subtraction logic (add then remove), used `cell-to-remove` for removal phase
- **Files modified:** src/services/cpa/guidedSteps.ts
- **Verification:** All 15 guidedSteps tests pass
- **Committed in:** d3aa0a7

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
- Subtraction resolvers are inherently stateless -- with only currentCount, the resolver cannot distinguish "adding up to first operand" from "done removing back to answer" when both states have the same count value. Tests were aligned to document this limitation. Consumers must track phase transitions externally.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shared building blocks ready for Plans 20-02 and 20-03
- useActionHistory hook can be integrated into all 6 manipulative components
- GuidedHighlight can wrap any interactive element for guided mode highlighting
- ManipulativeShell undo/grid buttons ready for wiring in downstream plans
- Guided step service provides lookup table for CpaSessionContent guided mode

## Self-Check: PASSED

All 13 files verified present. All 4 commit hashes verified in git log.

---
*Phase: 20-polish*
*Completed: 2026-03-03*
