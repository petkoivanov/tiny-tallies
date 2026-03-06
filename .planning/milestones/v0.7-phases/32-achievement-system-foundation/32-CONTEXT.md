# Phase 32: Achievement System Foundation - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the badge data layer: a static registry of badge definitions, a pure-function evaluation engine that checks unlock conditions against store state, and persisted badge state via a new Zustand slice with store migration. No UI in this phase — badge display, popups, and grid are Phase 33.

</domain>

<decisions>
## Implementation Decisions

### Badge catalog design
- Per-skill mastery badges (14 skills), plus category roll-up badges (all addition, all subtraction), plus grade roll-up badges (grade 1, grade 2, grade 3) — ~20+ mastery badges
- Behavior badges for: weekly streak milestones, session count milestones, remediation victories (misconception resolved)
- Tiered badge naming (bronze/silver/gold progression for escalating thresholds within a concept)
- Static readonly TypeScript array — follows existing SKILLS pattern in `mathEngine/skills.ts`

### Unlock condition types
- Simple thresholds only — one condition per badge, no AND/OR compound rules
- Snapshot-based evaluation: engine reads current store state to determine eligibility, no separate progress counters
- sessionsCompleted counter added to gamificationSlice (not derived from attempts)
- Remediation victory = MisconceptionRecord with status 'resolved' (3 correct in remediation completes it)
- No meta-badges — badges cannot require other badges as preconditions

### Evaluation trigger & timing
- Post-session only — runs during commit-on-complete flow, matches existing atomic update pattern
- Pure function: takes store state snapshot, returns newly-earned BadgeId[] (diffs against stored earned set)
- No side effects in engine — caller persists results to store
- Single-pass evaluation — no ordering dependencies between badges

### Store schema & migration
- New achievementSlice (separate from gamificationSlice) — domain separation: gamification = XP/level/streaks, achievement = badges
- earnedBadges: Record<BadgeId, { earnedAt: string }> — IDs with timestamps for "earned on" display
- sessionsCompleted: number added to gamificationSlice (general game stat, not badge-specific)
- STORE_VERSION 8 → 9: standard empty-init migration (earnedBadges: {}, sessionsCompleted: 0), no backfilling

### Claude's Discretion
- Exact badge names and descriptions within the tiered pattern
- Badge ID naming convention details
- TypeScript type design for unlock condition discriminated union
- Internal structure of the evaluation engine (iteration order, short-circuit logic)
- Test coverage strategy

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SKILLS` array (`services/mathEngine/skills.ts`): 14 skills with operation, grades, prerequisites — badge catalog follows same readonly array pattern
- `gamificationSlice.ts`: XP, level, weeklyStreak — sessionsCompleted counter will be added here
- `skillStatesSlice.ts`: per-skill masteryLocked, BKT masteryProbability — badge engine reads these for mastery badges
- `misconceptionSlice.ts`: MisconceptionRecord with status field (resolved) and helper selectors — badge engine reads for remediation badges
- `levelProgression.ts`: calculateLevelFromXp, detectLevelUp — pattern for pure game logic functions
- `prerequisiteGating.ts`: isSkillUnlocked — pattern for pure functions reading skillStates

### Established Patterns
- Zustand domain slices composed in appStore.ts with versioned migrations
- STORE_VERSION bumped with corresponding migration function (v6→v7→v8 established pattern)
- Pure-function services in `src/services/` with no store coupling — engine reads state, doesn't write
- Commit-on-complete pattern: all state updates happen atomically after session finishes
- Barrel exports (`index.ts`) for service directories

### Integration Points
- achievementSlice composed into AppState in appStore.ts (alongside existing 7 slices)
- Badge evaluation called from session completion flow (where XP/level/streak already update)
- sessionsCompleted incremented in same session-complete path
- Badge registry importable from `services/gamification/` or new `services/achievement/` directory

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Pure data layer foundation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 32-achievement-system-foundation*
*Context gathered: 2026-03-04*
