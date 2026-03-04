---
phase: 25-consent-gate-minor-fixes
plan: 02
subsystem: ui
tags: [consent, navigation, react-native, session, offline-guard]

requires:
  - phase: 25-consent-gate-minor-fixes
    provides: "ConsentScreen with PIN create/verify and Consent route in AppNavigator"
  - phase: 21-tutor-hook-gemini-client
    provides: "tutorConsentGranted boolean in childProfileSlice, useTutor consent guard"
provides:
  - "Consent interception in SessionScreen.handleHelpTap with child-friendly message"
  - "Auto-fire tutor request on return from ConsentScreen with consent granted"
  - "Retry button isOnline guard matching handleHelpTap pattern"
affects: [session-flow, parental-controls]

tech-stack:
  added: []
  patterns: ["ref-based consent pending tracking for cross-screen state coordination"]

key-files:
  created: []
  modified:
    - src/screens/SessionScreen.tsx
    - src/__tests__/screens/SessionScreen.test.tsx

key-decisions:
  - "consentPendingRef (useRef) for tracking consent-pending state across navigation, avoiding stale closure issues"
  - "Consent message uses addTutorMessage with consent- id prefix for distinguishable messages in chat history"

patterns-established:
  - "Cross-screen ref tracking: useRef to track pending state before navigation, useEffect to detect return with changed store value"

requirements-completed: [SAFE-06]

duration: 3min
completed: 2026-03-04
---

# Phase 25 Plan 02: SessionScreen Consent Wiring Summary

**Consent gate interception in SessionScreen handleHelpTap with auto-fire on return and retry offline guard**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T16:08:30Z
- **Completed:** 2026-03-04T16:11:30Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments
- handleHelpTap intercepts when tutorConsentGranted is false, showing child-friendly "ask a grown-up" message and navigating to ConsentScreen
- Auto-fire effect watches tutorConsentGranted transition via useEffect + consentPendingRef, fires requestHint on return from ConsentScreen
- Retry button now respects isOnline guard, matching the existing handleHelpTap pattern (fixes retry-offline bug from v0.5 audit)
- 5 new tests added (3 consent gate + 2 retry guard), all 1051 tests passing, TypeScript clean

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Consent gate and retry guard tests** - `2e1dd52` (test)
2. **Task 1 (GREEN): Consent interception, auto-fire, retry fix** - `af1fba9` (feat)

_TDD task: RED committed failing tests, GREEN committed passing implementation._

## Files Created/Modified
- `src/screens/SessionScreen.tsx` - Added tutorConsentGranted read, consentPendingRef, consent interception in handleHelpTap, auto-fire useEffect, retry isOnline guard
- `src/__tests__/screens/SessionScreen.test.tsx` - 5 new tests (consent message, consent granted path, auto-fire on return, retry offline guard, retry online), tutorConsentGranted in mock store, retry button in mock ChatPanel

## Decisions Made
- Used useRef (consentPendingRef) for consent-pending tracking -- avoids stale closure problems and prevents re-fire on subsequent renders
- Consent message uses `consent-${Date.now()}` id prefix to distinguish from regular tutor messages in chat history
- isOnline added to handleResponse dependency array since retry case now uses it

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full consent gate flow is now functional end-to-end: Help tap -> consent message -> ConsentScreen -> PIN -> back -> auto-fire tutor
- Phase 25 is complete -- all consent gate and minor fixes delivered
- 1051 tests passing, TypeScript clean
- v0.5 milestone is complete

## Self-Check: PASSED

All 2 files verified present. Both commit hashes (2e1dd52, af1fba9) verified in git log.

---
*Phase: 25-consent-gate-minor-fixes*
*Completed: 2026-03-04*
