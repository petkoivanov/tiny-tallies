# Phase 11: Bayesian Knowledge Tracing - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Add per-skill mastery estimation using Bayesian Knowledge Tracing (BKT) alongside the existing Elo rating system. BKT tracks whether the child truly knows a skill, while Elo continues to track problem difficulty. No UI changes — this is a service/data layer phase. Downstream phases (12-14) consume BKT mastery data for spaced repetition, prerequisite gating, and session orchestration.

</domain>

<decisions>
## Implementation Decisions

### Mastery reversibility
- Soft lock with decay: mastery (P(L) >= 0.95) requires 3+ consecutive wrong answers before reverting
- A single slip or bad day does not lose mastery — protects against discouraging flip-flopping
- Revert level on mastery loss: Claude's discretion (let the BKT math determine where P(L) naturally falls, or force to practice zone — pick what fits best)
- Mastered skills still receive monthly maintenance reviews to prevent silent long-term forgetting

### Re-teaching threshold
- Immediate flagging: as soon as P(L) drops below 0.40, the skill is flagged for re-teaching priority
- No multi-session confirmation required — catch problems fast

### BKT parameters
- Use research default values exactly: P(L0)=0.1, P(T)=0.3, P(S)=0.1, P(G)=0.25
- Let research defaults determine mastery pace — don't force a specific number of correct answers
- Discrete age brackets (6-7, 7-8, 8-9) with fixed parameter sets per bracket, not continuous interpolation
- Parameters are fixed per age — no self-calibrating or per-child adjustment in v0.3

### Dual-system behavior
- BKT and Elo are fully independent — they update separately and don't influence each other
- BKT is the authority for mastery decisions (gating, scheduling). Elo is the authority for problem difficulty selection
- Both BKT and Elo update on every answered problem, including warmup and cooldown phases
- BKT fields extend the existing SkillState type (same record, not a separate data structure). Requires store migration version bump

### Claude's Discretion
- Exact revert level when mastery is lost (natural P(L) vs forced value)
- BKT update implementation details (service structure, function signatures)
- Store migration strategy for adding BKT fields to SkillState
- How to track "consecutive wrong" count for soft mastery lock

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Implementation should follow the exact BKT equations from `.planning/06-spaced-repetition.md` research doc.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `eloCalculator.ts`: Parallel structure for BKT service — same pattern of pure functions with clear inputs/outputs
- `childProfileSlice.ts`: Already has `childAge` field for age-adjusted BKT parameters
- `skillStateHelpers.ts`: `getOrCreateSkillState` helper for safe skill state access with defaults

### Established Patterns
- Pure function services in `src/services/adaptive/` — BKT service fits here
- `SkillState` type in `skillStatesSlice.ts`: `{ eloRating, attempts, correct, lastPracticed? }` — extend with BKT fields
- `updateSkillState(skillId, Partial<SkillState>)` — existing store action handles partial updates
- Store migration versioning in `appStore.ts` — bump version + add migration for new schema

### Integration Points
- `commitSessionResults` in `sessionOrchestrator.ts` — BKT updates integrate alongside Elo updates
- `prerequisiteGating.ts` — Phase 13 will refactor `isSkillUnlocked` from Elo threshold to BKT mastery
- `skillSelector.ts` — Phase 14 will add BKT-informed weighting

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 11-bayesian-knowledge-tracing*
*Context gathered: 2026-03-03*
