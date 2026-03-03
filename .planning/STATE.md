---
gsd_state_version: 1.0
milestone: v0.4
milestone_name: Virtual Manipulatives
status: executing
stopped_at: Completed 19-01-PLAN.md
last_updated: "2026-03-03T22:33:31Z"
last_activity: 2026-03-03 -- Completed Plan 19-01 (Sandbox infrastructure)
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 13
  completed_plans: 12
  percent: 92
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles.
**Current focus:** v0.4 Virtual Manipulatives -- Phase 19 (Sandbox Navigation)

## Current Position

Phase: 19 of 20 (Sandbox Navigation)
Plan: 1 of 2 in current phase
Status: Executing
Last activity: 2026-03-03 -- Completed Plan 19-01 (Sandbox infrastructure)

Progress: [█████████░] 92% (12/13 plans)

## Performance Metrics

**Velocity:**
- v0.1: 12 plans in 2 days
- v0.2: 7 plans in 1 day
- v0.3: 15 plans in 2 days
- v0.4: 12 plans estimated (6 phases)

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 18-01 | CPA session building blocks | 3min | 2 | 8 |
| 18-02 | Pictorial diagram renderers | 4min | 1 | 9 |
| 18-03 | CPA session integration | 7min | 2 | 11 |
| 19-01 | Sandbox infrastructure | 3min | 2 | 8 |

## Accumulated Context

### Decisions

Full decision log in PROJECT.md Key Decisions table.

Key context carried from v0.3:
- SkillState type: { eloRating, attempts, correct, lastPracticed?, masteryProbability, consecutiveWrong, masteryLocked, leitnerBox, nextReviewDue, consecutiveCorrectInBox6 }
- STORE_VERSION = 5 (migrations: v1->v2->v3->v4->v5, v5 adds cpaLevel per skill)
- BKT masteryLocked for unlocking; Elo threshold removed in Phase 13
- Session orchestrator: 15 problems (3+9+3), 60/30/10 review/new/challenge mix
- commitSessionResults handles Elo + BKT + Leitner updates atomically
- 14 skills across addition/subtraction with cross-operation prerequisite DAG
- 687 tests passing, TypeScript clean

v0.4 roadmap decisions:
- CPA thresholds: P(L) < 0.40 = concrete, 0.40-0.85 = pictorial, >= 0.85 = abstract
- cpaLevel stored per-skill in SkillState (not per-child)
- Babel plugin change: react-native-worklets/plugin replaces react-native-reanimated/plugin
- Manipulative state is ephemeral (component-local), never persisted to store
- ManipulativePanel is in-screen collapsible (not Modal navigator) to avoid gesture conflicts
- Snap threshold is exclusive (distance < threshold) for precision placement
- GestureHandlerRootView wraps entire app (required for all gesture functionality)
- DraggableItem uses onRegister callback to expose shared values for parent-driven reset
- SnapZone uses measureInWindow for absolute coordinates matching DraggableItem translateX/Y
- AnimatedCounter uses regular prop (not SharedValue) since updates only on drop events
- Pan gesture minDistance(8) prevents accidental drags from child finger rests
- [Phase 17]: Counters uses custom Gesture.Pan() for free placement (no DraggableItem needed)
- [Phase 17]: TenFrame filters snap targets dynamically to exclude occupied cells
- [Phase 17]: TrayCounter respawns via re-keying after each successful snap
- [Phase 17]: Extracted useAutoGroup hook to keep BaseTenBlocks.tsx under 500 lines
- [Phase 17]: Auto-group uses single-timer pattern (ones priority) to prevent race conditions
- [Phase 17]: BarModel sub-components extracted into BarModelParts.tsx to keep main file under 500 lines
- [Phase 17]: NumberPicker uses FlatList with padding sentinel items for centered wheel selection
- [Phase 17]: ManipulativeShell wrapper provides consistent reset+counter+workspace layout for all 6 manipulatives
- [Phase 17-02]: SVG uses pixel-based coordinates (no viewBox) for NumberLine to avoid coordinate mismatch
- [Phase 17-02]: NumberLine marker is Animated.View overlay on SVG for smooth gesture handling
- [Phase 17-02]: FractionStrips use remove button (x) instead of long-press for ages 6-9 discoverability
- [Phase 18-01]: CompactAnswerRow uses inline feedback animations (AnswerFeedbackAnimation width:45% incompatible with 4-button layout)
- [Phase 18-01]: ManipulativePanel tap-only toggle (no pan gesture) avoids gesture conflicts with manipulatives inside
- [Phase 18-01]: PANEL_SPRING_CONFIG: damping 20, stiffness 200, mass 0.8, overshootClamping true
- [Phase 18-02]: SVG mock placed in test file (not jest.setup.js) since only pictorial tests need it
- [Phase 18-02]: Color convention: primary (#6366f1) for first operand, yellow (#FACC15) for second
- [Phase 18-03]: CpaSessionContent manages panel expansion state internally, resetting on currentIndex change
- [Phase 18-03]: Need help? button uses separate needHelpActive flag from panelExpanded
- [Phase 18-03]: CPA advances computed via snapshot-before/compare-after in useSession (not commitSessionResults)
- [Phase 18-03]: getCpaAdvanceMessage selects highest stage when multiple advances present
- [Phase 19-01]: exploredManipulatives uses array (not Set) for Zustand JSON serialization compatibility
- [Phase 19-01]: No STORE_VERSION bump for sandboxSlice -- new fields with defaults only
- [Phase 19-01]: MANIPULATIVE_COMPONENTS record maps ManipulativeType to component for dynamic rendering
- [Phase 19-01]: Tooltip first-visit detection reads state before markExplored to avoid race condition

### Pending Todos

None.

### Blockers/Concerns

- [RESOLVED] CPA thresholds locked at 0.40/0.85 per research recommendation (Plan 15-01).
- BaseTenBlocks auto-group choreography (proximity threshold, animation sequencing) needs design spike in Phase 17.
- Guided mode lookup table (problem-type -> manipulation-sequence) needs content design before Phase 20.

## Session Continuity

Last session: 2026-03-03T22:33:31Z
Stopped at: Completed 19-01-PLAN.md
Resume file: .planning/phases/19-sandbox-navigation/19-02-PLAN.md
Resume command: /gsd:execute-phase 19
