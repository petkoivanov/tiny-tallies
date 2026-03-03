# Phase 15: Foundation -- Store Schema, Services, and Mappings - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver store schema changes (STORE_VERSION 4→5 with CPA level per skill), CPA mapping service (BKT P(L) → CPA stage), manipulative-to-skill mapping table, and babel config fix for Reanimated 4 worklets. No UI components or manipulative rendering — this is pure infrastructure and services.

</domain>

<decisions>
## Implementation Decisions

### CPA Thresholds
- P(L) < 0.40 = concrete, 0.40–0.85 = pictorial, >= 0.85 = abstract
- One-way advance only — once a child reaches pictorial, they never drop back to concrete even if P(L) dips
- In pictorial mode, child can tap optional "show blocks" button to access interactive concrete manipulative (scaffolding without regression)
- CPA level advances at session end only, inside commitSessionResults — atomic with Elo/BKT/Leitner, consistent with existing commit-on-complete pattern

### Skill-Manipulative Mapping
- Each skill maps to multiple manipulatives with a ranked preference list (session picks #1 by default, sandbox shows all)
- Claude designs the specific mapping based on Common Core standards and math pedagogy research
- General pattern: single-digit/within-10 → counters, ten frame; within-20 → ten frame, number line; two-digit → base-ten blocks, number line; three-digit → base-ten blocks
- Subtraction mirrors addition mappings
- Bar model available for all word problems as secondary manipulative
- Fraction strips: sandbox-only for now — no fraction skills exist in the current 14-skill set; will be session-mapped when fraction skills are added in a future milestone

### CPA Migration (v4→v5)
- BKT-informed initial CPA placement: use existing P(L) to determine starting CPA level (mirrors v3→v4 Leitner box placement pattern)
- CPA level stored as string enum: `'concrete' | 'pictorial' | 'abstract'` — self-documenting, consistent with named-state pattern
- Field name: `cpaLevel` added to SkillState type
- Migration initializes: P(L) < 0.40 → 'concrete', 0.40–0.85 → 'pictorial', >= 0.85 → 'abstract'

### Claude's Discretion
- Exact cpaMappingService function signature and return types
- Whether to create a new manipSlice or extend skillStatesSlice for CPA-related actions
- Babel config fix details (react-native-worklets/plugin vs react-native-reanimated/plugin)

</decisions>

<specifics>
## Specific Ideas

- CPA advance is one-way to align with no-punitive-mechanics principle — a child never "loses" progress
- Optional concrete help in pictorial mode follows research recommendation (Fyfe et al. concreteness fading)
- Mapping table should be a static pure-function lookup (no store reads) — similar to how SKILLS array works

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skillStatesSlice.ts`: SkillState type — adding `cpaLevel` field here (line 5-22)
- `migrations.ts`: Migration chain pattern — v4→v5 follows exact same pattern as v3→v4 (line 43-58)
- `appStore.ts`: STORE_VERSION constant at line 32, partialize at line 47 — cpaLevel must be included
- `skills.ts`: SKILLS array with 14 skill definitions — mapping table references these IDs
- `bktCalculator.ts`: BKT P(L) calculation — CPA service reads masteryProbability from this

### Established Patterns
- Store migration: `if (version < N)` block in migrateStore, iterate skillStates, set defaults with `??=`
- Pure function services: all adaptive services are pure functions (eloCalculator, bktCalculator, leitnerCalculator)
- Type-driven: SkillState type is the source of truth, used across all services

### Integration Points
- `commitSessionResults` in session service: where CPA advance logic hooks in (alongside Elo/BKT/Leitner updates)
- `skillStatesSlice.updateSkillState`: existing action for updating individual skill fields — CPA level uses this
- `prerequisiteGating.ts`: reads SkillState for mastery — CPA service reads same data but for a different purpose

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-foundation-store-schema-services-and-mappings*
*Context gathered: 2026-03-03*
