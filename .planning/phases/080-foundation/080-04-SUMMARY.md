---
phase: 080-foundation
plan: 04
subsystem: ui
tags: [react-native, components, number-pad, multi-select, checkbox, negative-numbers, math-engine]

# Dependency graph
requires:
  - phase: 080-02
    provides: "setsEqual() in mathEngine/types, ChoiceOption + MultiSelectPresentation in answerFormats/types"
provides:
  - "NumberPad with allowNegative prop and ± toggle key"
  - "MultiSelectMC checkbox component for multi-root answer grading"
affects:
  - 082-linear-equations
  - 083-coordinate-geometry
  - 087-quadratics

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "allowNegative prop gates ± key rendering in Row 3 of NumberPad"
    - "maxDigits counts significant digits only — minus sign excluded from count"
    - "MultiSelectMC binary grading via setsEqual() — order-independent set comparison"
    - "testID contract: multiselectmc-option-N / multiselectmc-option-N-selected / multiselectmc-option-N-correct / multiselectmc-option-N-incorrect / multiselectmc-check-button"
    - "getByTestId over getByText for digit keys when display may show same digit — avoids RNTL 13.x multiple-match error"

key-files:
  created:
    - src/components/session/MultiSelectMC.tsx
  modified:
    - src/components/session/NumberPad.tsx
    - src/__tests__/components/session/NumberPad.test.tsx

key-decisions:
  - "NumberPad testID is numberpad-display (no hyphen between 'number' and 'pad') — matches test contract from plan 080-01 stubs"
  - "RNTL 13.x getByText and getByTestId both respect accessibility hiding — test stubs for maxDigits used getByText for digit keys causing duplicate-element failures; fixed by using getByTestId('numpad-key-N') in those tests"
  - "MultiSelectMC uses named export (not default-only) to match test import pattern in MultiSelectMC.test.tsx"
  - "ChoiceOption extended with optional label?: string for display — falls back to String(value) when absent"

patterns-established:
  - "Row 3 of NumberPad is conditionally rendered only when allowNegative||onShowMe||showDecimal — no empty row"
  - "±  key is first in Row 3, before decimal, before showMe"

requirements-completed:
  - FOUND-05
  - FOUND-07

# Metrics
duration: 25min
completed: 2026-03-13
---

# Phase 80 Plan 04: NumberPad ± Key and MultiSelectMC Summary

**NumberPad ± toggle key for negative number input and MultiSelectMC checkbox component for multi-root answer grading with setsEqual() binary correctness**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-13T12:00:00Z
- **Completed:** 2026-03-13T12:25:35Z
- **Tasks:** 2
- **Files modified:** 3 modified + 1 created

## Accomplishments

- NumberPad gains `allowNegative` prop: renders ± key in Row 3 when true, ± press toggles sign, maxDigits counts only significant digits (minus sign excluded)
- MultiSelectMC created: toggleable checkboxes, Check button with disabled state, binary grading via setsEqual(), green/red post-submit feedback
- All 15 tests GREEN (7 NumberPad + 8 MultiSelectMC)

## Task Commits

1. **Task 1: NumberPad ± toggle key** - `6fa41f2` (feat)
2. **Task 2: MultiSelectMC checkbox component** - `069de00` (feat)

**Plan metadata:** (this commit)

_Note: TDD tasks — plan stubs were pre-existing RED tests written in plan 080-01_

## Files Created/Modified

- `src/components/session/NumberPad.tsx` - Added allowNegative prop, ± key in Row 3, significant-digit-only maxDigits check, testID fix (numberpad-display)
- `src/components/session/MultiSelectMC.tsx` - New component: toggle checkboxes, binary grading with setsEqual, green/red feedback, full testID contract
- `src/__tests__/components/session/NumberPad.test.tsx` - Fixed tests 6-7: getByText→getByTestId for digit key presses to avoid RNTL duplicate-element collision

## Decisions Made

- **testID fix in NumberPad:** Display Text was `testID="number-pad-display"` but test stubs expected `testID="numberpad-display"`. Fixed to match the contract established in plan 080-01.
- **RNTL 13 query constraint:** In RNTL 13.3.3, both `getByText` and `getByTestId` filter by accessibility state — `importantForAccessibility="no-hide-descendants"` hides elements from both queries. The maxDigits tests in the stubs used `getByText('9')` which fails when display already shows '9'. Fixed by using `getByTestId('numpad-key-9')` in those tests (the testIDs already existed). This is a stub-level fix consistent with the "make stubs GREEN" objective.
- **Named export for MultiSelectMC:** Test file imports `{ MultiSelectMC }` (named), not default import. Component exports both named and default for flexibility.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test stubs 6-7 used getByText for key presses that collide with display value**
- **Found during:** Task 1 (NumberPad ± toggle key)
- **Issue:** After pressing '9' once, the display shows '9'. RNTL 13's `getByText('9')` then finds two elements (display + key) and throws "Found multiple elements". The test stubs were written before this constraint was considered.
- **Fix:** Changed tests 6-7 to use `getByTestId('numpad-key-9')`, `getByTestId('key-plus-minus')`, and `getByTestId('numpad-key-1')` instead of `getByText` for key presses that would conflict with display content. Display assertion still uses `getByTestId('numberpad-display').props.children`.
- **Files modified:** src/__tests__/components/session/NumberPad.test.tsx
- **Verification:** All 7 NumberPad tests pass
- **Committed in:** 6fa41f2 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in test stubs)
**Impact on plan:** Required fix to make the tests functional — the test logic was correct, the query method was wrong for the duplicate-text scenario.

## Issues Encountered

- RNTL 13.3.3 filters both `getByText` and `getByTestId` by accessibility state. Attempted `importantForAccessibility="no-hide-descendants"` to hide display from `getByText` but this also blocked `getByTestId`. Resolution: use testID-based queries for key presses instead of text-based queries.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- NumberPad `allowNegative` prop is ready for Phase 82 (linear equations with negative solutions) and Phase 83 (coordinate geometry)
- MultiSelectMC is ready for Phase 87 (quadratics — multi-root answers)
- Both components require no additional setup — props-based API is fully defined

---
*Phase: 080-foundation*
*Completed: 2026-03-13*
