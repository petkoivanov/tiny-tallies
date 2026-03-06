# Phase 35: Daily Challenges - Research

**Researched:** 2026-03-05
**Domain:** Daily challenge system (date-seeded rotation, challenge sessions, home screen card, badge integration)
**Confidence:** HIGH

## Summary

Phase 35 adds a daily challenge system as a third session mode alongside standard and remediation. The implementation is entirely within existing architecture patterns: date-seeded PRNG for theme rotation (reusing `createRng`), a new `CHALLENGE_SESSION_CONFIG` following the existing config pattern, skill-filtered problem generation through `generateSessionQueue`, and badge evaluation extension for challenge-specific badges.

The primary complexity is in the challenge service layer (theme definitions, date-seed rotation, completion tracking) and the home screen DailyChallengeCard component. All stat integration (Elo, BKT, Leitner, XP, badges) flows through existing commit-on-complete infrastructure with minimal modification -- mainly adding bonus XP and challenge completion counters.

**Primary recommendation:** Create a `challengeService` in `src/services/challenge/` with pure functions for theme rotation and challenge generation, a `challengeSlice` in the store for completion state, and a `DailyChallengeCard` component for the home screen. Extend `SessionMode` to include `'challenge'` and pipe challenge config through existing `useSession` hook.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 5-6 themed challenge sets: one per operation + mixed combos (e.g., Addition Adventure, Subtraction Sprint, Number Bonds, Place Value Power, Mixed Mastery, Speed Round)
- Themes filter by operation + grade range -- problems drawn from matching skills the child has unlocked
- Date-seeded random rotation using existing `createRng(dateSeed)` -- deterministic, same theme for all users on same day, no backend
- One attempt per day -- card shows "Completed!" after finishing. No replay
- 10 problems per challenge session (shorter than standard 15 -- quick focused burst)
- Accuracy + streak combo goal: each challenge has an accuracy target (e.g., 8/10) AND a streak target (e.g., 5 in a row)
- Elo-adaptive difficulty within theme's skill filter -- reuses existing problemSelector
- Full stat integration -- challenge answers update Elo, BKT, Leitner via existing commit-on-complete flow
- Daily challenge card placed above the main practice button
- Card shows theme name + emoji + goal description + current progress
- Completed state: card transforms to celebration with results. Stays visible all day
- Missed day: just today's new challenge, zero mention of yesterday. No guilt messaging
- Flat bonus XP on top of normal per-problem XP for challenge completion
- 3-5 challenge-specific special badges
- Challenge completion counts toward existing weekly practice streak (no separate streak)
- Extend existing badge evaluation with new condition types

### Claude's Discretion
- Exact theme names, emojis, and skill filter definitions per theme
- Challenge session config structure (extends SessionConfig or new type)
- STORE_VERSION bump number and migration shape for challenge state
- Goal threshold values (accuracy %, streak length per theme)
- Challenge card component structure and animation details
- How challenge session integrates with SessionScreen vs. new screen
- Date seed computation (YYYYMMDD integer or similar)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAL-01 | Daily challenge system with theme + skill filter + goal type definitions | ChallengeTheme type with operation filter, grade range, goals; CHALLENGE_THEMES constant array |
| CHAL-02 | Challenges rotate daily via date-seeded PRNG (fully offline) | `createRng(dateSeed)` with YYYYMMDD integer seed; `getTodaysChallenge()` pure function |
| CHAL-03 | User can play themed challenge sets | Extend SessionMode to 'challenge', add CHALLENGE_SESSION_CONFIG (0+10+0), filter skills by theme operation |
| CHAL-04 | User can attempt streak/accuracy goals with bonus XP rewards | Goal evaluation in challenge commit flow; bonus XP via existing addXp |
| CHAL-05 | Challenge-specific special badges awarded on completion | New 'challenges-completed' condition type in UnlockCondition; 4 new badges in BADGES registry |
| CHAL-06 | Daily challenge card on home screen with progress display | DailyChallengeCard component above practice button; reads challengeSlice state |
| CHAL-07 | Non-punitive design (no "missed" messaging, zero penalty for skipping) | Card only shows today's challenge; no history tracking; neutral copy on not-started state |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.x | Challenge state slice (completion tracking) | Already the app's state manager |
| React Navigation 7 | 7.x | Challenge session routing via existing Session screen | Already in use |
| react-native-reanimated | 3.x | Card celebration animation | Already in use for badges/skill map |

### Supporting
No new dependencies required. All functionality builds on existing infrastructure.

## Architecture Patterns

### Recommended Project Structure
```
src/
  services/
    challenge/
      index.ts              # barrel exports
      challengeTypes.ts      # ChallengeTheme, ChallengeGoal, DailyChallengeState types
      challengeThemes.ts     # CHALLENGE_THEMES constant array (5-6 themes)
      challengeService.ts    # getTodaysChallenge(), evaluateChallengeGoals(), getChallengeSkillIds()
  store/
    slices/
      challengeSlice.ts      # challengeCompletions, challengesCompleted counter
  components/
    home/
      DailyChallengeCard.tsx  # Home screen challenge card
```

### Pattern 1: Date-Seeded Theme Rotation
**What:** Deterministic daily theme selection using YYYYMMDD integer as seed to `createRng`
**When to use:** Every app launch to determine today's challenge
**Example:**
```typescript
// Pure function, no side effects
function getDateSeed(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day; // e.g., 20260305
}

function getTodaysChallenge(date: Date = new Date()): ChallengeTheme {
  const seed = getDateSeed(date);
  const rng = createRng(seed);
  const index = rng.intRange(0, CHALLENGE_THEMES.length - 1);
  return CHALLENGE_THEMES[index];
}
```

### Pattern 2: Challenge Theme Definitions
**What:** Static array of themed challenge configurations with skill filters
**When to use:** Defines the 5-6 challenge types that rotate daily
**Example:**
```typescript
interface ChallengeTheme {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly skillFilter: {
    readonly operations?: readonly Operation[];
    readonly grades?: readonly Grade[];
  };
  readonly goals: {
    readonly accuracyTarget: number; // e.g., 8 out of 10
    readonly streakTarget: number;   // e.g., 5 in a row
  };
}

const CHALLENGE_THEMES: readonly ChallengeTheme[] = [
  {
    id: 'addition-adventure',
    name: 'Addition Adventure',
    emoji: '\uD83D\uDE80', // rocket
    description: 'Get 8/10 correct!',
    skillFilter: { operations: ['addition'] },
    goals: { accuracyTarget: 8, streakTarget: 4 },
  },
  {
    id: 'subtraction-sprint',
    name: 'Subtraction Sprint',
    emoji: '\u26A1', // lightning
    description: 'Get 8/10 correct!',
    skillFilter: { operations: ['subtraction'] },
    goals: { accuracyTarget: 8, streakTarget: 4 },
  },
  {
    id: 'number-bonds',
    name: 'Number Bonds',
    emoji: '\uD83D\uDD17', // link
    description: 'Get 7/10 correct!',
    skillFilter: { operations: ['addition', 'subtraction'], grades: [1] },
    goals: { accuracyTarget: 7, streakTarget: 3 },
  },
  {
    id: 'place-value-power',
    name: 'Place Value Power',
    emoji: '\uD83C\uDFD7\uFE0F', // building
    description: 'Get 7/10 correct!',
    skillFilter: { operations: ['addition', 'subtraction'], grades: [2, 3] },
    goals: { accuracyTarget: 7, streakTarget: 3 },
  },
  {
    id: 'mixed-mastery',
    name: 'Mixed Mastery',
    emoji: '\uD83C\uDF1F', // star
    description: 'Get 8/10 correct!',
    skillFilter: { operations: ['addition', 'subtraction'] },
    goals: { accuracyTarget: 8, streakTarget: 5 },
  },
];
```

### Pattern 3: Challenge Session Config
**What:** SessionConfig for challenges: 0 warmup + 10 practice + 0 cooldown
**When to use:** When generating a challenge session queue
**Example:**
```typescript
export const CHALLENGE_SESSION_CONFIG: Readonly<SessionConfig> = {
  warmupCount: 0,
  practiceCount: 10,
  cooldownCount: 0,
};
```
This follows the exact same pattern as `REMEDIATION_SESSION_CONFIG`. The `generateSessionQueue` already supports custom configs and skill filtering.

### Pattern 4: Challenge Skill Filtering
**What:** Filter unlocked skills by challenge theme's operation/grade constraints before passing to session queue generation
**When to use:** When initializing a challenge session
**Example:**
```typescript
function getChallengeSkillIds(
  theme: ChallengeTheme,
  skillStates: Record<string, SkillState>,
): string[] {
  const unlocked = getUnlockedSkills(skillStates);
  return unlocked.filter((skillId) => {
    const skill = getSkillById(skillId);
    if (!skill) return false;
    const { operations, grades } = theme.skillFilter;
    if (operations && !operations.includes(skill.operation)) return false;
    if (grades && !grades.includes(skill.grade)) return false;
    return true;
  });
}
```
**Fallback:** If the filtered set is empty (child hasn't unlocked any skills matching the theme), fall back to all unlocked skills. This ensures the challenge is always playable.

### Pattern 5: Challenge Store Slice
**What:** Zustand slice for tracking challenge completion state
**When to use:** Persisting which challenges have been completed and total count
**Example:**
```typescript
interface ChallengeCompletion {
  readonly themeId: string;
  readonly score: number;
  readonly total: number;
  readonly accuracyGoalMet: boolean;
  readonly streakGoalMet: boolean;
  readonly bonusXpAwarded: number;
  readonly completedAt: string; // ISO timestamp
}

interface ChallengeSlice {
  // Keyed by date string "YYYY-MM-DD" for O(1) lookup
  challengeCompletions: Record<string, ChallengeCompletion>;
  challengesCompleted: number; // lifetime counter for badge evaluation
  completeChallenge: (dateKey: string, completion: ChallengeCompletion) => void;
}
```
Store version bumps from 9 to 10. Migration adds `challengeCompletions: {}` and `challengesCompleted: 0`.

### Pattern 6: SessionMode Extension
**What:** Add 'challenge' to the SessionMode union and handle in useSession
**When to use:** Routing challenge sessions through existing session infrastructure
**Example:**
```typescript
// sessionTypes.ts
export type SessionMode = 'standard' | 'remediation' | 'challenge';

// navigation/types.ts - Session params extended
Session: {
  sessionId: string;
  mode?: SessionMode;
  remediationSkillIds?: string[];
  challengeThemeId?: string; // NEW: identifies which challenge theme
};
```
The `useSession` hook already branches on `mode` for remediation. Add a third branch for challenge that uses `CHALLENGE_SESSION_CONFIG` and filters skills by theme.

### Pattern 7: Badge System Extension
**What:** Add new condition type and badges for challenge milestones
**When to use:** Evaluating challenge-specific badges post-session
**Example:**
```typescript
// Add to UnlockCondition union
| { type: 'challenges-completed'; challengesRequired: number }
| { type: 'perfect-challenge' }

// Add to BadgeEvaluationSnapshot
challengesCompleted: number;
lastChallengeScore?: { score: number; total: number };

// New badges (4)
{ id: 'behavior.challenge.first', name: 'First Challenge', tier: 'bronze',
  condition: { type: 'challenges-completed', challengesRequired: 1 } },
{ id: 'behavior.challenge.streak', name: 'Challenge Streak', tier: 'silver',
  condition: { type: 'challenges-completed', challengesRequired: 5 } },
{ id: 'behavior.challenge.master', name: 'Challenge Master', tier: 'gold',
  condition: { type: 'challenges-completed', challengesRequired: 20 } },
{ id: 'behavior.challenge.perfect', name: 'Perfect Challenge', tier: 'gold',
  condition: { type: 'perfect-challenge' } },
```

### Anti-Patterns to Avoid
- **Separate challenge session screen:** Reuse the existing SessionScreen. Challenges are just a session mode variant, not a different UI flow.
- **Server-side challenge tracking:** Everything must be offline. No API calls, no remote challenge validation.
- **Challenge streak separate from weekly streak:** One unified engagement metric. Challenge completions count toward existing weekly practice streak.
- **Punitive missed-day messaging:** Never show "You missed yesterday's challenge!" or streak-break language. The card only ever shows today.
- **Storing full challenge history:** Only store completion records keyed by date. No need for a full history view -- just today's status and lifetime counter.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date-seeded randomness | Custom hash function | `createRng(dateSeed)` | Already proven Mulberry32 PRNG in codebase |
| Session queue generation | Custom problem picker | `generateSessionQueue` with skill filter | Handles Elo-adaptive selection, template weighting, all edge cases |
| XP/level/streak updates | Manual state mutations | `commitSessionResults` | Atomic commit-on-complete, level-up detection, streak computation |
| Badge evaluation | Custom badge checking | `evaluateBadges` with extended snapshot | Single-pass, pure function, already handles all condition types |
| Store persistence | Manual AsyncStorage | Zustand persist with `partialize` | Migration chain, JSON serialization, rehydration all handled |

## Common Pitfalls

### Pitfall 1: Empty Skill Filter
**What goes wrong:** A child with only Grade 1 addition unlocked gets a "Place Value Power" challenge that filters for Grade 2-3, resulting in zero matching skills and a crash.
**Why it happens:** Theme filters are applied before checking if any unlocked skills match.
**How to avoid:** Always fall back to all unlocked skills when the filtered set is empty. Log a warning but never crash or show an error to the child.
**Warning signs:** Empty array from `getChallengeSkillIds` before passing to `generateSessionQueue`.

### Pitfall 2: Date Boundary Edge Cases
**What goes wrong:** A child starts a challenge at 11:58 PM, finishes at 12:02 AM the next day, and the completion is recorded for the wrong date.
**How to avoid:** Capture the challenge date at session start time, not at commit time. Store the date key when the challenge card is pressed.
**Warning signs:** Completion records appearing on unexpected dates.

### Pitfall 3: Store Migration Forgetting partialize
**What goes wrong:** New `challengeCompletions` and `challengesCompleted` fields are added to the slice but not to the `partialize` function in `appStore.ts`, causing data loss on app restart.
**Why it happens:** Zustand `persist` only saves fields listed in `partialize`.
**How to avoid:** Always add new persisted fields to both the slice AND `partialize` in `appStore.ts`.
**Warning signs:** Challenge completion data disappears after app restart.

### Pitfall 4: HomeScreen Line Count
**What goes wrong:** Adding the DailyChallengeCard inline to HomeScreen pushes it over the 500-line guardrail.
**How to avoid:** Extract DailyChallengeCard as a separate component in `src/components/home/`. HomeScreen is currently 378 lines, so a small inline addition could work, but a component extraction is cleaner and safer.
**Warning signs:** HomeScreen exceeding ~450 lines after changes.

### Pitfall 5: Challenge Mode Not Counted in sessionsCompleted
**What goes wrong:** Challenge sessions don't increment `sessionsCompleted`, breaking session-milestone badges.
**Why it happens:** Forgetting to call `incrementSessionsCompleted` in the challenge commit flow.
**How to avoid:** The challenge commit flow must follow the exact same post-commit steps as standard/remediation: increment sessions, evaluate badges, etc.

## Code Examples

### Challenge Commit Flow (extends existing pattern)
```typescript
// In useSession completion handler, after commitSessionResults:
if (mode === 'challenge') {
  const theme = getTodaysChallengeTheme();
  const dateKey = getTodayDateKey(); // "YYYY-MM-DD"
  const accuracyGoalMet = score >= theme.goals.accuracyTarget;
  const streakGoalMet = maxStreak >= theme.goals.streakTarget;
  const bonusXp = 50; // flat bonus for completing challenge

  // Award bonus XP
  addXp(bonusXp);

  // Record challenge completion
  completeChallenge(dateKey, {
    themeId: theme.id,
    score,
    total: totalProblems,
    accuracyGoalMet,
    streakGoalMet,
    bonusXpAwarded: bonusXp,
    completedAt: new Date().toISOString(),
  });
}
```

### DailyChallengeCard Component Structure
```typescript
// src/components/home/DailyChallengeCard.tsx
function DailyChallengeCard() {
  const challengeCompletions = useAppStore((s) => s.challengeCompletions);
  const todayKey = getTodayDateKey();
  const todaysCompletion = challengeCompletions[todayKey];
  const theme = getTodaysChallenge();
  const isCompleted = todaysCompletion !== undefined;

  if (isCompleted) {
    return <CompletedChallengeCard completion={todaysCompletion} theme={theme} />;
  }
  return <ActiveChallengeCard theme={theme} />;
}
```

### Navigation Integration
```typescript
// HomeScreen -- launching a challenge
navigation.navigate('Session', {
  sessionId: String(Date.now()),
  mode: 'challenge',
  challengeThemeId: theme.id,
});
```

### Results Screen Extension
```typescript
// Results params extended for challenge
Results: {
  // ...existing params
  isChallenge?: boolean;
  challengeBonusXp?: number;
  accuracyGoalMet?: boolean;
  streakGoalMet?: boolean;
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SessionMode = 'standard' \| 'remediation' | SessionMode = 'standard' \| 'remediation' \| 'challenge' | Phase 35 | Third session mode variant |
| STORE_VERSION = 9 | STORE_VERSION = 10 | Phase 35 | New challengeSlice fields persisted |
| 27 badges in registry | 31 badges (4 challenge badges added) | Phase 35 | New condition types in evaluateBadges |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + RNTL |
| Config file | jest.config.js |
| Quick run command | `npm test -- --testPathPattern=challenge` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAL-01 | Theme definitions with skill filters and goals | unit | `npm test -- --testPathPattern=challengeThemes` | No - Wave 0 |
| CHAL-02 | Date-seeded rotation is deterministic | unit | `npm test -- --testPathPattern=challengeService` | No - Wave 0 |
| CHAL-03 | Challenge session generates 10 skill-filtered problems | unit | `npm test -- --testPathPattern=challengeService` | No - Wave 0 |
| CHAL-04 | Goal evaluation + bonus XP awarded | unit | `npm test -- --testPathPattern=challengeService` | No - Wave 0 |
| CHAL-05 | Challenge badges evaluated on completion | unit | `npm test -- --testPathPattern=badgeEvaluation` | Partial - existing badgeEvaluation tests |
| CHAL-06 | DailyChallengeCard renders states correctly | unit | `npm test -- --testPathPattern=DailyChallengeCard` | No - Wave 0 |
| CHAL-07 | No punitive messaging in card states | unit | `npm test -- --testPathPattern=DailyChallengeCard` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=challenge`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + typecheck before verify

### Wave 0 Gaps
- [ ] `src/__tests__/challenge/challengeService.test.ts` -- covers CHAL-01, CHAL-02, CHAL-03, CHAL-04
- [ ] `src/__tests__/gamification/challengeBadges.test.ts` -- covers CHAL-05
- [ ] `src/__tests__/components/home/DailyChallengeCard.test.tsx` -- covers CHAL-06, CHAL-07
- [ ] `src/__tests__/store/challengeSlice.test.ts` -- store migration and actions

## Open Questions

1. **Max streak tracking during session**
   - What we know: The challenge has a streak goal (e.g., 5 in a row). `useSession` currently tracks `score` but not max consecutive correct.
   - What's unclear: Whether to add max streak tracking to `useSession` or compute it separately for challenges.
   - Recommendation: Add a `maxStreak` ref to `useSession` that tracks the longest consecutive correct run. Minimal change, useful for all modes.

2. **Theme fallback for limited skill pools**
   - What we know: A new user may only have 1-2 skills unlocked. Some themes (e.g., Place Value Power for grades 2-3) may have zero matching skills.
   - What's unclear: Should the card show a different message, or silently fall back?
   - Recommendation: Fall back to all unlocked skills silently. The theme name/emoji stays the same. The child still gets a fun themed challenge even if the skill filter couldn't be applied.

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/services/session/sessionOrchestrator.ts` -- session queue generation, commit flow
- Project codebase: `src/services/session/sessionTypes.ts` -- SessionConfig, SessionMode patterns
- Project codebase: `src/services/mathEngine/seededRng.ts` -- createRng Mulberry32 implementation
- Project codebase: `src/services/achievement/badgeEvaluation.ts` -- evaluateBadges pure function pattern
- Project codebase: `src/services/achievement/badgeTypes.ts` -- UnlockCondition union type
- Project codebase: `src/store/appStore.ts` -- STORE_VERSION=9, partialize, slice composition
- Project codebase: `src/store/migrations.ts` -- migration chain pattern
- Project codebase: `src/screens/HomeScreen.tsx` -- current layout (378 lines), insertion point for card
- Project codebase: `src/hooks/useSession.ts` -- session lifecycle, mode branching pattern
- Project codebase: `src/services/mathEngine/skills.ts` -- SKILLS array, getSkillsByOperation, getSkillsByGrade
- Project codebase: `src/navigation/types.ts` -- RootStackParamList, Session params

### Secondary (MEDIUM confidence)
- CONTEXT.md user decisions -- locked implementation choices from discussion phase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing infrastructure
- Architecture: HIGH - follows established patterns (slices, services, session modes)
- Pitfalls: HIGH - derived from direct code analysis of integration points
- Badge extension: HIGH - clear pattern from existing badge system code

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable -- no external dependencies changing)
