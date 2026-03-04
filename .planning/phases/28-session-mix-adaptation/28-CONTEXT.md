# Phase 28: Session Mix Adaptation - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Practice sessions automatically prioritize skills with confirmed misconceptions by injecting remediation problems into the practice queue. Remediation replaces review slots (not new or challenge). Warmup and cooldown are unchanged.

</domain>

<decisions>
## Implementation Decisions

### Injection ratio
- Up to 3 remediation slots out of 9 practice slots (33% cap)
- Number of remediation slots = min(confirmed misconception count, 3)
- If fewer than 3 confirmed misconceptions, use fewer slots (1 per confirmed misconception skill)
- Remaining slots (6-8) follow normal 60/30/10 review/new/challenge split

### Slot replacement strategy
- Replace review slots — remediation IS targeted review of misconception skills
- Review slots replaced first since both serve the "reinforce weak areas" goal
- New and challenge slots preserved for forward progress
- Reduced review count = original review count minus remediation slots taken

### Problem difficulty for remediation
- Standard Elo-targeted template selection (same as review problems)
- Remediation value comes from practicing the specific misconception skill, not from difficulty adjustment
- Uses existing `selectTemplateForSkill` with gaussian-targeted selection

### Claude's Discretion
- How to select which confirmed misconceptions get the remediation slots when more than 3 exist
- Whether remediation problems get a distinct `category` tag (e.g., 'remediation') or reuse 'review'
- Integration approach with existing `generatePracticeMix` function
- Constrained shuffle behavior for remediation problems

</decisions>

<specifics>
## Specific Ideas

No specific requirements — the integration should feel seamless within the existing session flow. Remediation problems are regular math problems on the misconception skill, not a special problem type.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getConfirmedMisconceptions()` (misconceptionSlice.ts): Returns all confirmed misconception records with skillId
- `generatePracticeMix()` (practiceMix.ts): Main orchestrator for 60/30/10 split — injection point
- `computeSlotCounts()` (practiceMix.ts): Computes review/new/challenge slot counts — may need adjustment
- `selectFromPool()` (practiceMix.ts): Weighted selection from skill pool — reusable for remediation
- `selectTemplateForSkill()` (problemSelector.ts): Gaussian-targeted template selection for standard difficulty

### Established Patterns
- Practice mix uses pool-based selection with BKT inverse weighting
- Constrained shuffle ensures review-first and no adjacent challenges
- Fallback cascade handles empty pools gracefully
- `PracticeMixItem` has skillId + category — remediation could use existing or new category

### Integration Points
- `generatePracticeMix()` in practiceMix.ts — inject remediation before or within the 60/30/10 fill
- `generateSessionQueue()` in sessionOrchestrator.ts — needs to pass misconceptions data to practice mix
- `useSession.ts` — needs to read misconceptions from store and pass to session generation
- `computeSlotCounts()` — adjust review count to account for remediation slots taken

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 28-session-mix-adaptation*
*Context gathered: 2026-03-04*
