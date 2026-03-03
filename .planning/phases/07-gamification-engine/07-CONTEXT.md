# Phase 7: Gamification Engine - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

XP scaling service, level progression formula, and weekly streak tracking in store/services. Pure engine logic — no UI changes. Produces structured feedback data that Phases 8-10 consume for display.

</domain>

<decisions>
## Implementation Decisions

### XP Display Model
- XP shown as progress toward next level ("45/120 XP") with a progress bar that resets each level
- Store tracks cumulative total XP internally; level and progress derived from total
- Level-up calculated on session commit (matches commit-on-complete pattern)
- Child starts at Level 1 with 0 XP; first level-up at 120 XP (100 + 1x20)

### Level Progression
- Formula locked: XP needed per level = 100 + (level x 20)
- Multi-level jumps allowed — if child earns enough XP for 2+ levels, they jump all of them
- No level cap — levels grow forever; formula naturally slows progression

### Streak Definition
- Calendar week (Monday-Sunday) — complete at least one session in a week to count
- Streak increments on session commit when lastSessionDate is in a prior calendar week
- Full missed week resets streak to 0 — no grace periods, no freezes
- Track "practiced this week" boolean (derived from lastSessionDate vs current week) for UI indicator

### Session Feedback Data
- commitSessionResults returns structured feedback: { xpEarned, newLevel, leveledUp, levelsGained, streakCount, practicedThisWeek }
- Results screen will show: "+85 XP" with before/after level progress bar, "Level up!" if leveled, streak status
- This is the engine contract — UI phases consume this data

### Claude's Discretion
- Exact implementation of cumulative-to-level derivation function
- How to handle edge case of first-ever session (no lastSessionDate)
- Whether to add a helper for "XP needed for next level" or compute inline

</decisions>

<specifics>
## Specific Ideas

- Streak display should show both count and this-week status: "3 week streak ✓" (practiced) or gentle nudge if not yet practiced this week
- Level-up detection should return levelsGained count so Phase 10 can show "double level-up!" animation for multi-jumps
- Results screen should show streak alongside XP/level feedback (not just home screen)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `gamificationSlice.ts`: Has xp, level, weeklyStreak, lastSessionDate fields + addXp, setLevel, incrementStreak, resetStreak actions — all need formula/date logic upgrades
- `xpCalculator.ts`: calculateXp(templateBaseElo) already scales XP by difficulty (BASE_XP=10, Elo bonus). GAME-01 is essentially implemented.
- `sessionOrchestrator.ts`: commitSessionResults() already calls addXp(totalXp) — needs extension to return feedback data and handle level-up + streak

### Established Patterns
- Commit-on-complete: XP/Elo accumulate in refs during session, committed atomically on finish. Level-up and streak should follow this pattern.
- Services in src/services/adaptive/: Pure functions with clear inputs/outputs. Level/streak logic should follow this pattern.
- Store slices: Actions are simple setters. Domain logic lives in services, not slices.

### Integration Points
- sessionOrchestrator.commitSessionResults() — extend to return feedback data and call level/streak logic
- gamificationSlice — upgrade actions to support level derivation and date-aware streak
- useSession hook — will need to receive and pass feedback data to Results screen (Phase 8+ concern)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-gamification-engine*
*Context gathered: 2026-03-02*
