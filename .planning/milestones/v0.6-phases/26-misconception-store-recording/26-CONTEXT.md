# Phase 26: Misconception Store & Recording - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Every wrong answer's Bug Library tag is captured and persisted in a new `misconceptionSlice`, surviving app restarts. Store migration from STORE_VERSION 6 to 7. Recording happens immediately on answer (not deferred to session commit). Phase 27 adds the confirmation engine on top of this data.

</domain>

<decisions>
## Implementation Decisions

### Recording timing
- Record misconception immediately on answer, not at session commit — ensures no data lost from abandoned sessions
- Breaks from commit-on-complete pattern (Elo/XP) intentionally: learning data is more valuable than consistency
- Deduplicate per session: same bugTag+skillId in one session counts as 1 occurrence for confirmation purposes (prevents a single bad session from inflating counts)
- Fully local/offline — pure AsyncStorage writes, no network needed

### Record structure
- Aggregate record per bugTag+skillId composite key (not individual occurrence log)
- Fields: bugTag, skillId, occurrenceCount, status, firstSeen, lastSeen
- Status field included from the start: 'new' (Phase 26 always sets 'new', Phase 27 upgrades to 'suspected'/'confirmed')
- Skill-level only — no problem-level detail stored (sessionAnswers already has that ephemerally)
- occurrenceCount incremented at most once per session due to deduplication

### Storage limits
- No cap on records — maximum ~154 aggregate records (14 skills x 11 bug patterns)
- Never auto-clear — records persist forever, Phase 30 (remediation) may change status but raw history is never lost

### Cross-skill grouping
- Separate records per skill — 'add_no_carry' on add_2digit is a different record than on add_3digit
- Enables Phase 28 to target the specific skill where the misconception appears

### Claude's Discretion
- Store query interface design (selectors for by-skill and by-bugTag lookups)
- Record context richness (whether to include problemId or wrong answer value alongside the bug tag)
- Deduplication implementation (session-scoped tracking mechanism)
- Migration function details

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The requirements (STATE-01, STATE-02, MISC-01) are well-defined and the architecture decisions above guide implementation.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SessionAnswer.bugId` (sessionStateSlice.ts:13): Already captures bugId on wrong answers — misconception recording hooks into this
- `useSession.ts` (lines 159-166): Already extracts bugId from selected option when wrong — recording trigger point
- `bugLookup.ts`: `getBugDescription()` for human-readable bug descriptions
- `BugPattern.id` (types.ts): The 11 bug patterns with unique string IDs
- `migrateStore()` (migrations.ts): Migration chain pattern — add `if (version < 7)` block

### Established Patterns
- Zustand domain slices in `src/store/slices/` with StateCreator typing
- `appStore.ts` composes slices and `partialize` controls persistence
- Migration chain: sequential `if (version < N)` blocks in `migrations.ts`
- STORE_VERSION constant in `appStore.ts` (currently 6, bump to 7)
- `tutorSlice` is ephemeral (not persisted) — misconceptionSlice WILL be persisted

### Integration Points
- `recordAnswer()` in `useSession.ts` — where bugId is already captured; trigger misconception recording here
- `appStore.ts` — compose new slice, update AppState type, add to partialize
- `migrations.ts` — add v6→v7 migration (initialize empty misconceptions map)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 26-misconception-store-recording*
*Context gathered: 2026-03-04*
