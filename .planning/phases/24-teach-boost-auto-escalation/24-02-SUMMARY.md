---
phase: 24-teach-boost-auto-escalation
plan: 02
subsystem: ai-tutor
tags: [useTutor, mode-routing, escalation, cpa-integration, boost, teach, hooks]

requires:
  - phase: 24-teach-boost-auto-escalation
    plan: 01
    provides: computeEscalation, buildTeachPrompt, buildBoostPrompt, BoostPromptParams, runSafetyPipeline BOOST bypass, wrongAnswerCount
provides:
  - Mode-aware useTutor hook routing (hint/teach/boost prompt selection)
  - Escalation check after each successful LLM delivery
  - CPA stage integration (parameter-driven, no hardcoded concrete)
  - BOOST safety bypass via mode parameter in runSafetyPipeline
  - shouldExpandManipulative and manipulativeType signals for ManipulativePanel
  - requestTutor primary function with requestHint backward-compat alias
  - Bug description and wrongAnswer passthrough into prompt params
affects: [24-03-PLAN, SessionScreen, ManipulativePanel, tutor-ui]

tech-stack:
  added: []
  patterns: [multi-mode-hook-orchestration, parameter-driven-cpa, backward-compat-alias]

key-files:
  modified:
    - src/hooks/useTutor.ts
    - src/hooks/__tests__/useTutor.test.ts

key-decisions:
  - "requestTutor is the primary function name; requestHint is an alias pointing to the same callback for backward compatibility"
  - "shouldExpandManipulative derived from tutorMode=teach AND manipulativeType!==null (computed in render, not state)"
  - "BOOST mode skips incrementHintLevel; only hint/teach modes increment"
  - "Escalation check reads fresh state via getState() after incrementHintLevel to ensure accurate thresholds"

patterns-established:
  - "Multi-mode hook pattern: switch on store mode to select prompt builder"
  - "Parameter-driven CPA: cpaInfo optional param with concrete default for backward compat"
  - "Post-delivery escalation: run computeEscalation after message delivery and hintLevel increment"

requirements-completed: [MODE-02, MODE-03, MODE-04, MODE-05, MODE-06]

duration: 4min
completed: 2026-03-04
---

# Phase 24 Plan 02: useTutor Hook Multi-Mode Wiring Summary

**Mode-aware prompt routing (hint/teach/boost), post-delivery escalation with transition messages, CPA stage passthrough, and ManipulativePanel coordination signals in useTutor hook**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T14:58:08Z
- **Completed:** 2026-03-04T15:02:15Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments

- useTutor routes to buildHintPrompt, buildTeachPrompt, or buildBoostPrompt based on tutorMode from store
- BOOST mode passes correctAnswer via BoostPromptParams (type-safe isolation) and skips hintLevel increment
- runSafetyPipeline receives tutorMode parameter so BOOST bypasses answer-leak check
- computeEscalation runs after every successful delivery; transitions set mode and add gentle transition messages
- CPA stage flows from cpaInfo parameter into all prompt builders (replaces hardcoded 'concrete')
- bugDescription and wrongAnswer from lastWrongContext parameter flow into prompt params for misconception-aware hints
- shouldExpandManipulative and manipulativeType exposed for ManipulativePanel coordination
- requestTutor as primary name with requestHint alias for backward compatibility
- All 21 existing tests preserved and passing; 24 new tests added; 1016 total tests passing

## Task Commits

Each task was committed atomically (TDD approach):

1. **Task 1 RED: Failing tests for mode-aware routing, escalation, CPA integration** - `39778ce` (test)
2. **Task 1 GREEN: Wire mode-aware routing, escalation, and CPA into useTutor** - `cc07ed3` (feat)

## Files Created/Modified

- `src/hooks/useTutor.ts` - Extended with multi-mode prompt routing, escalation checks, CPA integration, ManipulativePanel signals, expanded UseTutorReturn interface
- `src/hooks/__tests__/useTutor.test.ts` - 24 new tests for TEACH routing, BOOST routing, escalation transitions, CPA stage passthrough, BOOST safety bypass, shouldExpandManipulative signal, manipulativeType passthrough, requestTutor alias, safety pipeline mode param

## Decisions Made

- requestTutor is the primary function name reflecting multi-mode nature; requestHint assigned to same callback for backward compat
- shouldExpandManipulative is a computed value (not state) derived from tutorMode=teach AND manipulativeType!==null
- BOOST mode does NOT increment hintLevel (only hint/teach do) to avoid artificially inflating escalation counters
- Escalation check reads fresh state via useAppStore.getState() after incrementHintLevel to ensure accurate threshold evaluation
- CPA defaults to 'concrete' when cpaInfo parameter is not provided (backward compatibility)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- useTutor hook fully mode-aware and ready for SessionScreen integration (Plan 03)
- All ManipulativePanel signals (shouldExpandManipulative, manipulativeType) exposed for UI wiring
- requestTutor available as primary entry point; requestHint alias ensures no breaking changes
- Escalation engine fully integrated; transitions will happen automatically during tutoring sessions
- No blockers for Plan 03 (UI integration)
- 1016 tests passing, TypeScript clean

## Self-Check: PASSED

- All 2 source/test files verified present
- Commit 39778ce (Task 1 RED) verified in git log
- Commit cc07ed3 (Task 1 GREEN) verified in git log
- 1016 tests passing, TypeScript clean

---
*Phase: 24-teach-boost-auto-escalation*
*Completed: 2026-03-04*
