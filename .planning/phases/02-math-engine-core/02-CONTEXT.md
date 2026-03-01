# Phase 2: Math Engine Core - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Programmatic engine that generates addition and subtraction problems for grades 1-3 with correct answers, Common Core standards tags, and configurable difficulty templates. No distractors (Phase 3), no persistence (Phase 4), no adaptive selection (Phase 5) — just the generation engine and its data model.

</domain>

<decisions>
## Implementation Decisions

### Skill Taxonomy
- Claude's discretion on granularity — choose what makes sense for Elo tracking and Common Core alignment
- Claude's discretion on grade grouping vs flat progression
- Claude's discretion on skill ID format — optimize for store compatibility (Record<string, SkillState>) and debuggability
- Extensible from day one — skill schema should accommodate future operations (multiplication, fractions) without refactoring

### Difficulty Templates
- Claude's discretion on discrete levels vs parameterized templates — choose what serves the adaptive system best
- Claude's discretion on whether templates carry pre-assigned Elo ranges for Phase 5
- Claude's discretion on carry/borrow strictness (strict flag vs probabilistic)
- Claude's discretion on template count — cover what's needed for a smooth difficulty curve across grades 1-3

### Problem Data Model
- Claude's discretion on metadata depth — include what downstream phases (Bug Library, adaptive difficulty, session tracking) will need
- Claude's discretion on problem ID format — choose what works for session tracking and future spaced repetition
- Claude's discretion on API shape (one-at-a-time vs batch vs both) — design for Phase 5 adaptive sessions and Phase 6 session flow
- Claude's discretion on display hints — determine the right boundary between engine and UI

### Standards Coverage
- Claude's discretion on grade bands — determine scope based on target age range (6-9) and v0.1 goals
- Claude's discretion on data structure (string tags vs structured objects)
- Claude's discretion on single vs multiple standard mapping per problem
- Claude's discretion on storage format (hardcoded constants vs external JSON)

### Claude's Discretion
All four discussion areas were delegated to Claude's judgment. Key constraints to respect:
- Skill IDs must work with existing `Record<string, SkillState>` in skillStatesSlice
- Problem IDs must work with existing `SessionAnswer.problemId: string` in sessionStateSlice
- Correct answers must ALWAYS be computed programmatically, never by LLM
- Engine lives in `src/services/` per project architecture
- TypeScript strict mode required

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User trusts Claude's judgment on all implementation details for the math engine internals.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SkillStatesSlice` (src/store/slices/skillStatesSlice.ts): Defines `SkillState { eloRating, attempts, correct }` with `Record<string, SkillState>` — engine skill IDs must be compatible string keys
- `SessionStateSlice` (src/store/slices/sessionStateSlice.ts): Defines `SessionAnswer { problemId: string, answer: number, correct: boolean }` — engine problem output must produce compatible data

### Established Patterns
- Zustand domain slices pattern in `src/store/slices/` — state changes go through slice actions
- Services directory (`src/services/`) exists but is empty — math engine will be the first service
- Types directory (`src/types/`) exists but is empty — engine types will be the first type definitions
- TypeScript strict mode enforced project-wide

### Integration Points
- Engine types need to align with `SkillState` and `SessionAnswer` interfaces
- Engine will be consumed by Phase 5 (adaptive difficulty) and Phase 6 (session flow)
- Bug Library in Phase 3 will extend the engine's problem model with distractor generation

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-math-engine-core*
*Context gathered: 2026-03-01*
