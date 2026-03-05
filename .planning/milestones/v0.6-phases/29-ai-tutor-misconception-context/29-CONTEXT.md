# Phase 29: AI Tutor Misconception Context - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

The AI tutor knows about a child's confirmed misconceptions and addresses them specifically in explanations. This phase enriches LLM prompts with confirmed misconception data so tutoring responses target specific misunderstanding patterns rather than giving generic help. COPPA compliance maintained — no child PII in LLM context.

</domain>

<decisions>
## Implementation Decisions

### Misconception context scope
- Include only confirmed misconceptions for the current skill (not all skills)
- Confirmed status only — do not include suspected misconceptions (must pass 2-then-3 rule)
- Always include confirmed misconceptions for the skill even when the current wrong answer's bug doesn't match a confirmed pattern — the tutor benefits from knowing the child's history
- Include misconception context on remediation-category problems even when the child answers correctly (if they ask for explanation/hint, the tutor should know about the confirmed pattern)

### Prompt framing
- Structured list format: each confirmed misconception as a bullet with bugTag and description
- Data + light guidance instruction (e.g., "Address these patterns in your explanation without naming them directly")
- Never name misconceptions directly to the child — address the pattern through teaching, not labeling
- Keep existing single-bug bugDescription (from the last wrong answer) as "immediate context" alongside the enriched confirmed misconception list as "historical context" — LLM sees both layers

### Mode differentiation
- All modes receive the same misconception data
- Per-mode guidance differs:
  - HINT: "steer the child away from these patterns without revealing them"
  - TEACH: "address these patterns step by step"
  - BOOST: "explain why these patterns lead to wrong answers"
- HINT mode should target misconception patterns specifically in Socratic questions (e.g., steer toward the carry step if confirmed add_no_carry)
- No CPA stage adaptation in this phase — misconception context only affects textual explanations, not manipulative selection
- Cap at 3 misconceptions per prompt even if more exist for the skill

### Claude's Discretion
- How to select top 3 misconceptions when more than 3 exist for a skill (recency vs occurrence count)
- Exact wording of per-mode misconception guidance instructions
- Whether to include occurrence count in the structured list
- Integration approach with existing prompt builders (extend PromptParams type vs separate context assembly)
- PII scrubbing verification approach (misconception data is bugTag + skillId, no PII, but verify the pipeline)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getConfirmedMisconceptions(misconceptions)` (misconceptionSlice.ts): Returns all confirmed records with skillId and bugTag
- `getMisconceptionsBySkill(misconceptions, skillId)` (misconceptionSlice.ts): Filters misconceptions by skill — direct fit for "current skill only" scope
- `getBugDescription(bugId)` (bugLookup.ts): Converts bugTag to human-readable description — reusable for building structured list
- `buildHintPrompt()`, `buildTeachPrompt()`, `buildBoostPrompt()` (promptTemplates.ts): Existing prompt builders that already accept bugDescription — extend with misconception list
- `scrubOutboundPii()` (safetyFilter.ts): PII scrubbing before LLM call — misconception data passes through this pipeline

### Established Patterns
- Prompt construction: `useTutor` assembles PromptParams → prompt builder formats → scrubOutboundPii → callGemini
- Single-bug insertion: HINT uses "Possible misconception: {bugDescription}", TEACH/BOOST use "The child may have {bugDescription}. Address this without naming it directly."
- Type safety: `PromptParams` intentionally excludes `correctAnswer`; only `BoostPromptParams` extends it — same pattern should apply for misconception context
- Phase 28 threading pattern: store selector → hook → service function (confirmed works for misconception data flow)

### Integration Points
- `useTutor.ts` lines 148-158: Where promptParams are assembled — injection point for confirmed misconception data from store
- `promptTemplates.ts`: Prompt builders — add misconception list section to user message
- `types.ts`: PromptParams type — extend with optional confirmedMisconceptions field
- `SessionScreen.tsx` line 238: Where lastWrongContext is set — may need to also pass skill context for misconception lookup

</code_context>

<specifics>
## Specific Ideas

No specific requirements — the enrichment should feel seamless within the existing tutor flow. The child should not notice a difference in interface, only that the tutor's explanations are more relevant to their specific struggles.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 29-ai-tutor-misconception-context*
*Context gathered: 2026-03-04*
