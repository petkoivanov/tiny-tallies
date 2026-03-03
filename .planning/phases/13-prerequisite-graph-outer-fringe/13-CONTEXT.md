# Phase 13: Prerequisite Graph & Outer Fringe - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor skill unlocking from Elo-threshold gating to BKT-mastery gating, add cross-operation prerequisite links to the existing DAG, and implement the outer fringe algorithm that identifies which new skills are ready to learn. Service/data layer — no UI changes. Downstream Phase 14 consumes the outer fringe for session problem selection.

</domain>

<decisions>
## Implementation Decisions

### Cross-operation prerequisite links
- Add same-level cross-links: each subtraction skill requires its corresponding addition skill as a prerequisite (e.g., 'Add within 20 (no carry)' gates 'Subtract within 20 (no borrow)')
- Add cross-links directly to the `prerequisites` arrays in `skills.ts` — keep skills.ts as the single source of truth for the DAG
- DAG validation via tests only: write tests for cycle detection, orphan check, and all-prerequisites-reference-real-skills — no runtime validation overhead for a static 14-skill graph

### Unlock threshold (BKT mastery gating)
- Use the `masteryLocked` flag (from Phase 11 soft lock) for prerequisite unlock, NOT raw P(L) threshold
- `masteryLocked=true` means: P(L) reached 0.95 at least once AND child hasn't had 3+ consecutive wrong answers since — stable signal that avoids fluctuation
- Replaces the current Elo-based `UNLOCK_THRESHOLD = 950` in `prerequisiteGating.ts`

### No re-locking policy
- Once a skill is unlocked, it stays unlocked permanently — even if a prerequisite loses mastery (soft lock breaks)
- Re-teaching of weak prerequisites happens through Leitner scheduling (box drops, review intervals), NOT through access removal
- Avoids the frustrating experience of a child losing access to skills they were already practicing

### Outer fringe algorithm
- Pure function: `getOuterFringe(skillStates)` returns `string[]` — follows bktCalculator/leitnerCalculator pattern
- Returns unmastered skills whose ALL prerequisites have `masteryLocked=true`
- Root skills (no prerequisites) are in the fringe if not yet mastered — treated like any other skill
- Mastered skills (masteryLocked=true) are excluded from the fringe — Leitner handles their review scheduling
- Skills that lost mastery (soft lock broke, P(L) dropped) are NOT re-entered into the fringe — they are handled by Leitner review, not treated as "new skills"
- Returns empty array `[]` when all skills are mastered — Phase 14's session orchestrator handles the fallback (reallocate 30% new-skill slot to review/challenge)

### Claude's Discretion
- Exact function signatures for the refactored prerequisite gating
- Whether to keep `isSkillUnlocked` alongside `getOuterFringe` or merge/replace
- Store migration strategy if any schema changes are needed (likely none — just behavior change)
- Test file organization (extend existing prerequisiteGating.test.ts or new file)

</decisions>

<specifics>
## Specific Ideas

- The success criteria says "addition chain and subtraction chain with shared roots" — the cross-links create this by making subtraction skills depend on corresponding addition skills, creating a true DAG instead of two independent chains
- The outer fringe is the pool Phase 14 draws from for the "30% new skills" portion of the 60/30/10 session mix

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skills.ts`: Already has `prerequisites: string[]` on all 14 skills — the DAG structure exists, just needs cross-links added
- `prerequisiteGating.ts`: `isSkillUnlocked` and `getUnlockedSkills` — refactor from Elo to BKT mastery, add fringe logic
- `bktCalculator.ts` / `leitnerCalculator.ts`: Pure function pattern to follow for fringe algorithm
- `skillStatesSlice.ts`: SkillState already has `masteryLocked` field (from Phase 11)

### Established Patterns
- Pure function services in `src/services/adaptive/` with barrel export via `index.ts`
- Test files in `src/__tests__/adaptive/` mirror service structure
- `getOrCreateSkillState` helper provides safe defaults when skill has no state entry

### Integration Points
- `prerequisiteGating.ts` — direct refactoring target (Elo → BKT mastery gating)
- `skillSelector.ts` — currently calls `getUnlockedSkills`, may need to call `getOuterFringe` instead (Phase 14 concern)
- `sessionOrchestrator.ts` `generateSessionQueue` — currently uses `getUnlockedSkills` for skill pool; Phase 14 will switch to fringe-based selection
- `src/services/adaptive/index.ts` — barrel export needs to include new fringe functions

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-prerequisite-graph-outer-fringe*
*Context gathered: 2026-03-03*
