# Phase 3: Bug Library & Answer Formats - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Misconception-based distractor generation (Bug Library) and answer format support (multiple choice + free text input). This phase extends the Phase 2 math engine with wrong-answer generation and format-specific presentation data. No UI rendering (Phase 7), no adaptive selection logic (Phase 5), no misconception tracking/intervention (v0.5).

</domain>

<decisions>
## Implementation Decisions

### Misconception Patterns
- Claude's discretion on pattern count and which specific bug patterns to include — choose based on math education research for grades 1-3 addition/subtraction
- Claude's discretion on grade-specific vs universal patterns with auto-filtering
- Claude's discretion on whether distractors carry bug-pattern metadata (for future misconception detection in v0.5) — consider whether tagging now avoids costly refactoring later
- Claude's discretion on extensibility for future operations — balance generality vs simplicity

### Distractor Generation
- Claude's discretion on distractor selection strategy (most plausible first vs random from pool)
- Claude's discretion on fallback when bug patterns produce fewer than 3 distractors — ensure exactly 3 distractors are always produced
- Claude's discretion on negative/zero filtering — use age-appropriate constraints for 6-9 year olds
- Claude's discretion on uniqueness enforcement — all 4 choices (1 correct + 3 distractors) must be distinct

### Answer Format Behavior
- Claude's discretion on multiple choice shuffling strategy (random vs balanced rotation)
- Claude's discretion on free text validation tolerance (strict vs lenient parsing of leading zeros, whitespace, etc.)
- Claude's discretion on where answer format data lives (extend Problem model vs separate layer) — keep Problem type focused while supporting both formats cleanly
- Numbers-only display for multiple choice options — UI presentation is Phase 7's concern

### Format Selection Logic
- Claude's discretion on ownership boundary (engine vs caller/session layer decides format)
- Claude's discretion on whether difficulty influences format selection
- Claude's discretion on API shape (presentation-ready object vs raw data)
- Claude's discretion on mid-session format flexibility (interchangeable vs locked per session)

### Claude's Discretion
All four discussion areas were delegated to Claude's judgment. Key constraints to respect:
- Distractors must come from Bug Library misconception patterns (no-carry error, smaller-from-larger, off-by-one, etc.), NOT random numbers
- Multiple choice must present exactly 1 correct + 3 distractors in shuffled order
- Free text input must validate against the programmatically computed correct answer
- Both formats must work for addition AND subtraction across all difficulty levels
- Must integrate with existing Problem type from Phase 2 (operands, correctAnswer, metadata fields available)
- SessionAnswer expects { problemId: string, answer: number, correct: boolean }

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User trusts Claude's judgment on all implementation details for the Bug Library and answer format internals.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Problem` type (src/services/mathEngine/types.ts): Has operands, correctAnswer, operation, metadata (digitCount, requiresCarry, requiresBorrow) — all needed for computing misconception-based distractors
- `requiresCarry()` / `requiresBorrow()` (src/services/mathEngine/constraints.ts): Column-iteration algorithms that can inform distractor generation (e.g., compute what answer you'd get if you forgot to carry)
- `createRng()` (src/services/mathEngine/seededRng.ts): Deterministic PRNG for reproducible distractor shuffling
- `generateProblem()` (src/services/mathEngine/generator.ts): Returns Problem objects that the Bug Library will extend with distractor data
- Public barrel (src/services/mathEngine/index.ts): Already exports constraints and RNG "for Phase 3 Bug Library use"

### Established Patterns
- Pure function architecture — generator.ts is stateless, takes params and returns data
- Zod v4 validation at API boundary only — internal functions trust TypeScript types
- Template registry pattern — could be mirrored for bug pattern registration
- Seeded PRNG for deterministic generation — distractors should also be deterministic given same seed

### Integration Points
- Bug Library extends the math engine's output — takes a Problem and produces distractors
- Answer format data either extends Problem or wraps it
- SessionAnswer.answer (number) must work for both MC selection and free text input
- Phase 5 (adaptive difficulty) will consume problems with format data
- Phase 6 (session flow) will use format selection to present problems

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-bug-library-answer-formats*
*Context gathered: 2026-03-01*
