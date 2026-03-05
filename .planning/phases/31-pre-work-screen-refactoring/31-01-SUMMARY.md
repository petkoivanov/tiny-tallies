---
phase: 31-pre-work-screen-refactoring
plan: 01
subsystem: session-screen
tags: [refactoring, hooks, components, session]
dependency_graph:
  requires: []
  provides: [useChatOrchestration-hook, SessionHeader-component]
  affects: [SessionScreen, session-tests]
tech_stack:
  added: []
  patterns: [custom-hook-extraction, component-extraction, barrel-exports]
key_files:
  created:
    - src/hooks/useChatOrchestration.ts
    - src/components/session/SessionHeader.tsx
    - src/__tests__/hooks/useChatOrchestration.test.ts
    - src/__tests__/components/session/SessionHeader.test.tsx
  modified:
    - src/screens/SessionScreen.tsx
    - src/components/session/index.ts
    - src/__tests__/screens/SessionScreen.test.tsx
decisions:
  - Kept lastWrongContext state in SessionScreen, passed setLastWrongContext to hook as param
  - SessionHeader uses Fragment wrapper for header + progress bar sections
  - HelpButton pulsing prop simplified to just shouldPulse (hook manages helpUsed internally)
metrics:
  duration: 6m24s
  completed: 2026-03-05
---

# Phase 31 Plan 01: Extract useChatOrchestration & SessionHeader Summary

Refactored SessionScreen from 552 to 226 lines by extracting chat orchestration into a dedicated hook (336 lines) and header/progress UI into a component (137 lines), with full test coverage and zero behavioral changes.

## Task Execution

### Task 1: Extract useChatOrchestration hook + SessionHeader component + refactor SessionScreen
**Commit:** 3feb597

Created `useChatOrchestration` hook containing all chat UI state (chatOpen, chatMinimized, helpUsed, shouldPulse), refs (autoCloseTimer, consentPending, teachMinimized), derived values (boostReveal, showHelp, responseMode, bannerMessage, boostHighlightAnswer), effects (showCorrectAnswer timer, pulse, TEACH minimize, consent auto-fire, per-problem reset, auto-close cleanup), and callbacks (handleAnswerWithBoost, handleHelpTap, handleResponse, handleCloseChat, handleBannerTap). Hook takes store selectors (addTutorMessage, incrementWrongAnswerCount, tutorConsentGranted) internally and uses navigation for consent flow.

Created `SessionHeader` component with formatPhaseLabel/getPhaseColor utilities, header bar (phase label, CpaModeIcon, progress counter, quit button), and progress bar with phase-colored fill. All associated styles moved to component-local StyleSheet.create.

Updated barrel export in `src/components/session/index.ts`. Refactored SessionScreen to import and use both new modules, removing all moved code.

### Task 2: Update SessionScreen tests + write hook and component tests
**Commit:** 1f4a909

Updated SessionScreen test to mock `useChatOrchestration` return value. Tests now verify prop passing and handler wiring rather than internal chat logic. Removed appStore/bugLookup mocks no longer needed by SessionScreen.

Created 26 hook tests covering: initialization defaults, handleHelpTap (online/consent/no-consent), handleResponse (all 5 types), handleCloseChat, handleBannerTap, responseMode derivation, BOOST sentinel scoring, wrong answer tracking with getBugDescription, showHelp conditions, per-problem reset, TEACH minimize, showCorrectAnswer timer, pulse on wrong feedback, boostHighlightAnswer derivation, banner message, retry offline guard.

Created 8 component tests covering: phase labels (warmup/practice/cooldown), progress text, progress bar rendering, feedback state accounting, quit button, CpaModeIcon rendering.

## Verification Results

- SessionScreen.tsx: 226 lines (well under 500-line limit)
- TypeScript: compiles cleanly, zero errors
- ESLint: clean, no new warnings
- Test suite: 1,177 tests pass across 70 suites, zero regressions
- Affected tests: 70 tests pass (36 SessionScreen + 26 hook + 8 component)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] HelpButton pulsing prop simplification**
- **Found during:** Task 1
- **Issue:** Original SessionScreen passed `pulsing={shouldPulse && !helpUsed}` to HelpButton. Since helpUsed moved into the hook and handleHelpTap already calls `setShouldPulse(false)`, the `&& !helpUsed` guard was redundant.
- **Fix:** Pass `pulsing={shouldPulse}` directly -- the hook's internal state management handles the same behavior.
- **Files modified:** src/screens/SessionScreen.tsx

## Self-Check: PASSED

All 8 files verified present. Both commits (3feb597, 1f4a909) confirmed in git log. SessionScreen at 226 lines (under 500). 1,177 tests pass.
