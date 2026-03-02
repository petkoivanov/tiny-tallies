# Phase 6: Session Flow & Navigation Control - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Full session lifecycle: child starts practice from Home, completes warmup (easy) → practice (adaptive) → cooldown (easy) sequence, sees results summary. Navigation guards prevent accidental exit; explicit Quit button with confirmation dialog. No UI styling beyond functional layout (Phase 7), no animated celebrations (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Session Structure
- Fixed problem count: 15 problems default (3 warmup + 9 practice + 3 cooldown)
- Session length not configurable by parents for v0.1 — hardcoded default, defer settings UI
- Warmup/cooldown use lowest unlocked templates (easiest available) for confidence building
- Warmup/cooldown pick from child's strongest skills (highest Elo); practice focuses on weakest skills
- Elo updates in real-time throughout all phases (warmup, practice, cooldown) — no special handling

### Quit & Feedback Flow
- Quit mid-session discards the session — confirmation dialog: "Are you sure? Your progress won't be saved."
- Elo/XP not applied on quit; clean exit to Home
- Correct/incorrect feedback shows briefly (1-2 seconds) then auto-advances to next problem
- Back button/gesture disabled during active session (React Navigation beforeRemove listener)

### Answer Format
- Always multiple choice for v0.1 — consistent experience, simpler UI
- Free text input deferred to future enhancement
- MC with Bug Library distractors provides rich answer variety already

### Results & Post-Session
- Results screen shows summary totals: correct/total, XP earned, session duration
- Per-skill breakdown deferred to future enhancement
- Elo and XP updates commit to store only when session completes successfully (not on quit)
- Results screen uses existing CommonActions.reset to return to Home (prevents back-nav to completed session)

### Claude's Discretion
- Session service architecture (new service vs extending session state slice)
- How session phases transition internally (state machine, index ranges, etc.)
- Feedback indicator design (simple text/icon, not animated — animations are Phase 8)
- Confirmation dialog implementation (Alert.alert vs custom modal)
- How to compose adaptive service functions into the session loop
- Test strategy and coverage
- Whether to add sessionPhase to SessionStateSlice or keep it local

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decisions above.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sessionStateSlice` — isSessionActive, currentProblemIndex, sessionScore, sessionXpEarned, sessionAnswers[], startSession/endSession/recordAnswer actions
- `adaptive/` service — selectSkill, selectTemplateForSkill, calculateEloUpdate, calculateXp, frustrationGuard, prerequisiteGating, getUnlockedSkills
- `mathEngine/` — generateProblem(templateId, seed), formatAsMultipleChoice, generateDistractors
- `getOrCreateSkillState()` — lazy skill init helper
- `updateSkillState(skillId, partial)` — store action for Elo writes
- `gamificationSlice` — addXp(), setLevel(), incrementStreak()
- `createRng(seed)` — seeded PRNG for deterministic generation
- Theme tokens: colors.correct (#84cc16), colors.incorrect (#f87171), minTouchTarget: 48
- Navigation: Home/Session/Results screens with native-stack, headerShown: false

### Established Patterns
- Services for domain logic, store for state
- Pure function architecture — stateless functions take params, return data
- Barrel exports via index.ts
- CommonActions.reset for stack cleanup on Results Done

### Integration Points
- SessionScreen.tsx is placeholder — ready for session flow implementation
- ResultsScreen.tsx is placeholder — ready for results display
- HomeScreen.tsx has "Start Practice" button navigating to Session
- RootStackParamList needs sessionId params for Session and Results screens
- sessionStateSlice may need sessionPhase field (warmup/practice/cooldown)
- Store version bump + migration if SessionStateSlice schema changes

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-session-flow-navigation-control*
*Context gathered: 2026-03-02*
