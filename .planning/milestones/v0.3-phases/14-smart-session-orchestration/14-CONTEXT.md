# Phase 14: Smart Session Orchestration - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor session problem generation from simple warmup/practice/cooldown selection to a pedagogically structured 60/30/10 mix (review/new/challenge) sourced from Leitner review queue, outer fringe, and Elo-based challenge pool. The existing 15-problem session structure (3 warmup + 9 practice + 3 cooldown) is preserved — the mix applies to the 9 practice problems only. Service/data layer changes with no UI modifications.

</domain>

<decisions>
## Implementation Decisions

### Session structure
- Keep the 15-problem session: 3 warmup + 9 practice + 3 cooldown
- The 60/30/10 mix (review/new/challenge) applies ONLY to the 9 practice problems
- Warmup and cooldown keep their current behavior: strength-weighted skill selection + easiest template (confidence-building)
- Session length is always 15 problems — fixed, predictable for the child
- Practice slot counts are calculated by rounding 60/30/10 of 9 to whole numbers (e.g., 5/3/1 or 6/2/1)

### Problem ordering
- Practice problems are interleaved using constrained random ordering:
  - No two challenge problems adjacent
  - At least one review problem before first new/challenge
  - Randomized within constraints (using seeded RNG for deterministic testing)
- Prefer unique skills per session — each practice problem targets a different skill when possible. Only repeat skills if there aren't enough distinct skills to fill all 9 slots

### BKT influence on selection
- Within each category, BKT mastery probability (P(L)) weights skill selection: lower P(L) = higher chance of being selected
- Review: prioritize weakest due skills (lowest P(L) among review-due)
- New skills: standard outer fringe selection with BKT weighting
- Challenge: prefer mid-range P(L) skills (0.40-0.80 range) — the growth zone

### Category fallbacks
- No review-due skills (new user, nothing due yet) → shift empty review slots to new skills
- No outer fringe skills (all mastered or in progress) → shift empty new-skill slots to review
- No challenge candidates → shift challenge slot to review
- All categories empty (fresh profile, no skills unlocked) → fall back to root skills using existing weakness-weighted selection

### Challenge definition
- Challenge problems draw from already-unlocked skills where template Elo exceeds the child's current Elo for that skill
- Target mid-range P(L) skills (0.40-0.80) for challenge selection — child knows enough to attempt harder problems but isn't mastered
- Frustration guard (3 consecutive wrong → easier problem) remains active for ALL problems including challenges
- No-punitive-mechanics principle applies: challenges are growth opportunities, not punishments

### Claude's Discretion
- Exact Elo offset for challenge template selection (how far above child's Elo)
- Rounding strategy for 60/30/10 of 9 practice slots (e.g., 5/3/1 vs 6/2/1)
- Constrained random ordering algorithm details
- BKT weighting formula within each category
- How to handle edge cases when unique skills are exhausted (repeat selection strategy)

</decisions>

<specifics>
## Specific Ideas

- The 60/30/10 composition aligns with SESS-01 through SESS-05 requirements
- Fallback cascade (review → new → review → root) ensures every session always has 15 problems regardless of child's progress state
- Challenge from within unlocked skills (not outer fringe) keeps challenges within familiar territory — stretches difficulty, not novelty

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sessionOrchestrator.ts`: `generateSessionQueue` is the primary refactoring target — currently handles warmup/practice/cooldown with strength/weakness weighting
- `selectStrongestSkill` / `selectEasiestTemplate`: Keep as-is for warmup/cooldown
- `selectSkill` (weakness-weighted): Adaptable for BKT-weighted selection within categories
- `selectTemplateForSkill` (Gaussian-targeted): Reusable for review and new-skill template selection
- `leitnerCalculator.getReviewStatus`: Returns `isDue` and `overdueByMs` for any skill — used to build the review queue
- `prerequisiteGating.getOuterFringe`: Returns new-skill candidates — used directly for the new-skill category
- `prerequisiteGating.getUnlockedSkills`: Returns all unlocked skills — used for challenge pool filtering
- `frustrationGuard.ts`: Already integrated in session flow — no changes needed

### Established Patterns
- Pure function services in `src/services/adaptive/` with barrel export via `index.ts`
- Seeded RNG (`createRng`) for deterministic problem generation and testing
- `SessionConfig` with `warmupCount`, `practiceCount`, `cooldownCount` in `sessionTypes.ts`
- `PendingSkillUpdate` already carries BKT, Elo, and Leitner fields atomically
- `commitSessionResults` handles all state updates atomically on session completion

### Integration Points
- `generateSessionQueue` in `sessionOrchestrator.ts` — main refactoring target
- `skillSelector.ts` — may need new selection functions (BKT-weighted, challenge-targeted)
- `src/services/adaptive/index.ts` — barrel export for any new functions
- `useSession` hook — calls `generateSessionQueue`, may need to pass additional state (childAge for Leitner due checks)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-smart-session-orchestration*
*Context gathered: 2026-03-03*
