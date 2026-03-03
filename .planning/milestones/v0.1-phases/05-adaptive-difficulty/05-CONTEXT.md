# Phase 5: Adaptive Difficulty - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Elo rating system that updates per skill after each problem attempt, selects problems targeting 85% success rate, and includes a frustration guard after 3 consecutive wrong answers. No UI changes (Phase 7), no session flow structure (Phase 6), no BKT mastery estimation (v0.2).

</domain>

<decisions>
## Implementation Decisions

### Adaptation Speed
- Fast adaptation with K=32-40 range — child notices difficulty change within 5-10 problems
- Variable K-factor by confidence: higher K early (provisional player, adapt fast), lower K as attempts accumulate (established level)
- Fixed 85% success target for v0.1 — no variable targeting by mastery level
- Elo clamped to 600-1400 range (slightly beyond 800-1250 template range) to prevent extreme drift

### Frustration Response
- Frustration guard triggers after 3 consecutive wrong answers
- Drop 1 template level on trigger (e.g., 2-digit with carry -> 2-digit no carry) — gentle step down
- Reset consecutive-wrong counter on any correct answer — child earns way back naturally through Elo updates
- Guard tracks consecutive wrong per skill, not across all skills in session
- Guard affects problem selection only — Elo still updates normally from all answers (accurate tracking)

### Within-Session Adaptation
- Real-time Elo updates within session — each answer updates Elo immediately, next problem reflects current performance
- Mix skills within a session — pulls from multiple skills for engaging variety
- Weakest skill priority for next-problem selection — favor skills with lowest Elo relative to available templates, balanced by occasional strong-skill problems for confidence
- Prerequisite gating — child must demonstrate competence (Elo > threshold) on prerequisite skills before harder ones unlock. Skills.ts already defines prerequisite chains.

### Difficulty Targeting
- Weighted random template selection — randomly pick from nearby templates, weighted by baseElo proximity to child's current Elo. Adds variety while staying in range.
- Comfort-zone philosophy — pick templates where child is expected to succeed ~85-90%. Problems are slightly below peak ability to build confidence.
- New service at src/services/adaptive/ — dedicated adaptive service with Elo calculator, problem selector, frustration guard. Barrel export for Phase 6.
- XP scales by difficulty — harder problems (higher baseElo) earn more XP. Connects to Phase 8 gamification.

### Claude's Discretion
- Exact K-factor formula and how confidence scaling works (attempts threshold for provisional vs established)
- Prerequisite unlock threshold (what Elo level counts as "competent")
- Weakest-skill weighting algorithm (how much to favor weak vs strong skills)
- Weighted random distribution shape (linear, gaussian, etc.)
- XP scaling formula specifics
- File organization within src/services/adaptive/
- Test strategy and coverage

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decisions above.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SkillState { eloRating, attempts, correct }` in skillStatesSlice.ts — per-skill Elo storage ready
- `getOrCreateSkillState()` in skillStateHelpers.ts — lazy init with DEFAULT_ELO=1000
- `ProblemTemplate.baseElo` (800-1250 range across 14 templates) — difficulty anchor for template selection
- `generateProblem({ templateId, seed })` in generator.ts — takes a templateId, returns Problem
- `getTemplatesBySkill(skillId)` — returns all templates for a skill
- `createRng()` seeded PRNG — deterministic problem generation
- `SKILL_DEFINITIONS` in skills.ts — 14 skills with prerequisites array
- `SessionAnswer { problemId, answer, correct, timeMs?, format?, bugId? }` — answer tracking ready

### Established Patterns
- Pure function architecture — stateless functions take params, return data
- Services for domain logic, store for state (Phase 4 decision)
- Barrel exports via index.ts for each service
- Zod validation at API boundaries only
- Files under 500 lines — refactor into focused modules

### Integration Points
- `updateSkillState(skillId, partial)` — store action to write new Elo after calculation
- `skillStates` persisted via Zustand persist middleware (AsyncStorage)
- Phase 6 session flow will call adaptive service to get next problem
- Phase 8 gamification will consume XP-per-difficulty from this service
- Store version may need bumping if SkillState schema changes (CLAUDE.md guardrail)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-adaptive-difficulty*
*Context gathered: 2026-03-02*
