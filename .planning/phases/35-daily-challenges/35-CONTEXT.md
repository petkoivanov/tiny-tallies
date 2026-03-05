# Phase 35: Daily Challenges - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can play rotating daily challenge sessions with themed skill focus, bonus XP, and special badges — fully offline, no penalty for skipping. A daily challenge card on the home screen shows today's challenge with progress. Challenges are a third session mode alongside standard and remediation. Avatar customization and themes are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Challenge themes & rotation
- 5-6 themed challenge sets: one per operation + mixed combos (e.g., Addition Adventure, Subtraction Sprint, Number Bonds, Place Value Power, Mixed Mastery, Speed Round)
- Themes filter by operation + grade range — problems drawn from matching skills the child has unlocked
- Date-seeded random rotation using existing `createRng(dateSeed)` — deterministic, same theme for all users on same day, no backend
- One attempt per day — card shows "Completed!" after finishing. No replay.

### Session structure & goals
- 10 problems per challenge session (shorter than standard 15 — quick focused burst)
- Accuracy + streak combo goal: each challenge has an accuracy target (e.g., 8/10) AND a streak target (e.g., 5 in a row). Two goals to chase, more rewarding when both hit
- Elo-adaptive difficulty (same as standard practice) within the theme's skill filter — personalized to child's level, reuses existing problemSelector
- Full stat integration — challenge answers update Elo, BKT mastery, Leitner boxes via existing commit-on-complete flow. Child progresses by playing challenges.

### Home screen presentation
- Daily challenge card placed above the main practice button — prominent, first thing child sees after stats section
- Card shows: theme name + emoji + goal description + current progress (e.g., "🚀 Addition Adventure — Get 8/10 correct! [Not started]")
- Completed state: card transforms to celebration with results ("✓ Challenge Complete! 9/10 — +50 bonus XP"). Green/gold accent. Stays visible all day.
- Missed day: just today's new challenge, zero mention of yesterday. No guilt, no "missed" messaging. Aligns with non-punitive philosophy.

### Rewards & badge integration
- Flat bonus XP on top of normal per-problem XP for challenge completion (e.g., +50 XP). Meeting the goal gives the bonus; failing the goal still gives normal XP.
- 3-5 challenge-specific special badges: e.g., "First Challenge" (complete 1), "Challenge Streak" (complete 5 days), "Challenge Master" (complete 20), "Perfect Challenge" (10/10 score)
- No separate challenge streak — challenge completion counts toward existing weekly practice streak. One unified engagement metric.
- Extend existing badge evaluation: add challenge badges to BADGES registry + new condition types (e.g., 'challenges-completed'). evaluateBadges runs on challenge commit same as regular sessions.

### Claude's Discretion
- Exact theme names, emojis, and skill filter definitions per theme
- Challenge session config structure (extends SessionConfig or new type)
- STORE_VERSION bump number and migration shape for challenge state (completedChallenges, challengesCompleted counter)
- Goal threshold values (what accuracy %, what streak length per theme)
- Challenge card component structure and animation details
- How challenge session integrates with SessionScreen vs. new screen
- Date seed computation (YYYYMMDD integer or similar)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createRng(seed)` (`services/mathEngine/seededRng.ts`): Mulberry32 PRNG with `next()` and `intRange()` — use for date-seeded theme rotation
- `SessionConfig` + `DEFAULT_SESSION_CONFIG` / `REMEDIATION_SESSION_CONFIG` (`services/session/sessionTypes.ts`): existing session config pattern for challenge sessions (10 problems)
- `sessionOrchestrator` (`services/session/`): builds session queue, commit-on-complete — extend for challenge mode
- `practiceMix` + `skillSelector` + `problemSelector` (`services/session/`, `services/adaptive/`): problem generation pipeline — reuse with skill filter
- `BADGES` registry + `evaluateBadges` (`services/achievement/`): static badge catalog + pure evaluation engine — extend with challenge badges
- `gamificationSlice`: XP, level, weeklyStreak, sessionsCompleted — bonus XP flows through existing addXp
- `achievementSlice`: earnedBadges + addEarnedBadges — challenge badges stored same way
- `HomeScreen` (~320 lines): current layout with stats, practice button, remediation, explore grid, badge count, skill map

### Established Patterns
- Commit-on-complete: all state updates atomic after session finishes (XP, Elo, BKT, Leitner, badges, streak)
- SessionMode = 'standard' | 'remediation' — challenge would be a third mode
- Route params for Results data (score, xpEarned, leveledUp, streakCount, newBadges)
- Zustand domain slices with versioned migrations (STORE_VERSION=9 currently)
- Pure-function services in `src/services/` reading state, no direct store coupling
- Date handling: `lastSessionDate` string in gamificationSlice, `isSameISOWeek()` for streak logic

### Integration Points
- `SessionMode` type: add 'challenge' variant
- `SessionConfig`: new CHALLENGE_SESSION_CONFIG (0+10+0 or similar)
- `sessionOrchestrator`: accept challenge skill filter for problem generation
- `BADGES` registry: add 3-5 challenge badge definitions with new condition types
- `evaluateBadges`: handle new challenge condition types (challenges-completed threshold)
- `gamificationSlice` or new `challengeSlice`: store challenge completion state (today's challenge ID, completed status, score, challengesCompleted count)
- `HomeScreen`: add DailyChallengeCard component above practice button
- `RootStackParamList`: challenge session params (theme, goal, skill filter)
- `ResultsScreen`: show challenge bonus XP and goal achievement status

</code_context>

<specifics>
## Specific Ideas

- Challenge card placement above practice button makes daily challenges feel like the "daily action" — prominent without replacing practice
- Celebration state on completion card acts as a daily trophy that stays visible all day
- Accuracy + streak combo gives two goals to chase per session — more satisfying when both achieved
- Theme emoji on the card creates instant visual identity (🚀 Addition Adventure, ⚡ Subtraction Sprint)
- Full Elo/BKT/Leitner integration means challenges aren't "wasted practice" — every answer counts toward skill progression

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 35-daily-challenges*
*Context gathered: 2026-03-05*
