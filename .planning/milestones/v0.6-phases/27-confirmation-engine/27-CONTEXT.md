# Phase 27: Confirmation Engine - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Distinguish suspected from confirmed misconceptions using cross-session pattern analysis. The 2-then-3 confirmation rule upgrades misconception status inline within `recordMisconception`. Phase 26's data layer provides the records; this phase adds the intelligence to classify them.

</domain>

<decisions>
## Implementation Decisions

### Status upgrade timing
- Upgrade status inline within `recordMisconception` — right after incrementing occurrenceCount, check thresholds and set status in the same action
- No separate confirmation action needed — status is always consistent with count
- Silent operation — no visible reaction (no toast, no alert). Effects surface through Phase 28 (session mix) and Phase 29 (tutor context)
- Cross-session requirement already satisfied by Phase 26's session deduplication — occurrenceCount=2 already means 2 distinct sessions, no additional cross-session check needed
- Thresholds hardcoded as named constants: SUSPECTED_THRESHOLD = 2, CONFIRMED_THRESHOLD = 3 (research-backed values)

### Threshold behavior
- Status lifecycle: new -> suspected -> confirmed -> resolved
- Extend MisconceptionStatus type in Phase 27 to include 'resolved' (add type now, Phase 30 sets it)
- Confirmation engine is one-way: new -> suspected -> confirmed. Only Phase 30 remediation can set 'resolved'
- Once confirmed, stays confirmed until explicit remediation — no auto-decay, no time-based clearing
- If a resolved misconception recurs, it goes back to 'new' with occurrenceCount reset — clean lifecycle restart

### History & querying
- Add optional `suspectedAt` and `confirmedAt` ISO string fields to MisconceptionRecord — set when status transitions happen
- Status-filtered selectors: getConfirmedMisconceptions(), getSuspectedMisconceptions() — Phase 28 needs confirmed for session mix, Phase 29 needs confirmed for tutor prompts
- Summary count selector: getMisconceptionCounts() returning { new: N, suspected: N, confirmed: N } — Phase 30 triggers remediation at 2+ confirmed

### Claude's Discretion
- Whether to add resolvedAt field now or defer to Phase 30
- Exact implementation of threshold check within recordMisconception
- Test strategy for status transitions

</decisions>

<specifics>
## Specific Ideas

No specific requirements — the 2-then-3 rule is well-defined in the research docs and requirements. Implementation is a focused enhancement to the existing misconceptionSlice.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `misconceptionSlice.ts`: MisconceptionRecord type with status field, recordMisconception action, compositeKey helper
- `MisconceptionStatus` type: already has 'new' | 'suspected' | 'confirmed' — needs 'resolved' added
- `getMisconceptionsBySkill()`, `getMisconceptionsByBugTag()`: existing selectors to pattern-match for new ones
- Session dedup in recordMisconception: ensures occurrenceCount increments represent distinct sessions

### Established Patterns
- Slice actions mutate state inline via Zustand set() — confirmation logic fits naturally
- Standalone selector functions (not slice actions) — getMisconceptionsBySkill pattern
- Named constants for thresholds — similar to BKT mastery thresholds in skillStatesSlice

### Integration Points
- `recordMisconception` in misconceptionSlice.ts — add threshold check after count increment
- `MisconceptionRecord` interface — add optional suspectedAt, confirmedAt fields
- `MisconceptionStatus` type — add 'resolved' variant
- New selector functions exported from misconceptionSlice.ts

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-confirmation-engine*
*Context gathered: 2026-03-04*
