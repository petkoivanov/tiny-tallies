# Phase 30: Remediation Mini-Sessions - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Children with multiple confirmed misconceptions can enter a focused remediation session targeting those specific gaps. This is a separate, shorter session type — not the normal 15-problem practice session. Reuses existing session UI and math engine. No LLM-generated problems.

</domain>

<decisions>
## Implementation Decisions

### Session structure & size
- 5 problems total, pure practice only (no warmup, no cooldown)
- All 5 problems target confirmed misconception skills
- Each confirmed misconception skill gets at least 1 problem; remaining slots filled by weakest skills (inverse-BKT weighting)
- Standard Elo-targeted template selection (same as normal practice)
- ~2 minutes to complete

### Entry point & availability
- HomeScreen button, visible only when 2+ confirmed misconceptions exist (per success criteria)
- Below the main "Start Practice" button — prominent but secondary
- Not offered after normal sessions (HomeScreen only)

### Resolution & progress tracking
- 3 correct answers on a misconception skill across remediation sessions triggers confirmed → resolved transition
- Track remediation correct count per misconception skill in the store
- Once resolved, the misconception no longer counts toward the 2+ threshold for showing the button

### Results & feedback UX
- Same Results screen with different messaging (e.g., "Great practice!" + which skills were worked on)
- No custom Results screen — reuse existing with copy changes

### Claude's Discretion
- How to implement the remediation correct counter (new field on MisconceptionRecord vs separate tracking)
- SessionConfig for remediation sessions (custom config vs parameter override)
- Navigation param design (extend Session params vs new route)
- HomeScreen button styling and label text
- Whether to show a misconception skill list before starting the session

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `generatePracticeMix()` (practiceMix.ts): Already accepts `confirmedMisconceptionSkillIds` — can be adapted for remediation-only sessions
- `selectRemediationSkillIds()` (practiceMix.ts): Inverse-BKT weighted selection when >3 confirmed skills
- `getConfirmedMisconceptions()` (misconceptionSlice.ts): Returns confirmed records with skillId
- `useSession` hook: Full session lifecycle — queue generation, answer handling, result commitment
- `SessionScreen.tsx`: Renders problems, feedback, tutor — reusable for remediation sessions
- `constrainedShuffle()`: Already handles `'remediation'` category for ordering

### Established Patterns
- Session lifecycle: init → queue → problem loop → commit results → navigate to Results
- Practice mix: pool-based selection with inverse-BKT weighting, fallback cascade
- Pending updates pattern: Elo/BKT updates accumulated during session, committed atomically on completion
- Misconception recording: `recordMisconception()` called on wrong answers with bugId matching

### Integration Points
- `SessionConfig`: Currently fixed at 3+9+3 — needs remediation variant (e.g., 0+5+0)
- `generateSessionQueue()`: Needs to support remediation-only mode (all practice slots = remediation)
- `HomeScreen.tsx`: Add conditional remediation button reading from misconception store
- `useSession.ts`: Needs to accept session type param and pass to queue generation
- Navigation types: `Session` route params need type/skillIds extension

</code_context>

<specifics>
## Specific Ideas

No specific requirements — the mini-session should feel like a quick, focused version of the normal practice session. Same problem rendering, same feedback, same celebration on completion. The difference is size (5 vs 15) and focus (all misconception skills vs mixed).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 30-remediation-mini-sessions*
*Context gathered: 2026-03-04*
