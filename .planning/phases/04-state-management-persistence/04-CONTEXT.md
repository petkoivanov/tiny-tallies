# Phase 4: State Management & Persistence - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Flesh out the Zustand store slices (child profile, skill states, session state, gamification) with real data shapes and persist all state across app restarts via AsyncStorage. No UI screens (Phase 7), no adaptive difficulty logic (Phase 5), no session flow control (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Child Profile
- Claude's discretion on avatar approach — choose something simple and fun for ages 6-9
- Claude's discretion on single vs multiple profiles — consider v0.1 scope
- Claude's discretion on first launch flow (required setup vs guest mode)
- Claude's discretion on whether grade affects problem selection or is just metadata for v0.1

### Persistence Strategy
- Claude's discretion on full vs selective persistence — determine what's safest for data integrity
- Claude's discretion on migration approach (version + migration map vs wipe) — consider child progress safety
- Claude's discretion on secure store setup — no sensitive data in v0.1, but respect CLAUDE.md guardrail on expo-secure-store
- Claude's discretion on reset capabilities — determine what's appropriate for v0.1

### Session State Enrichment
- Claude's discretion on timing data (time per problem, session duration)
- Claude's discretion on tracking answer format (MC vs free text) in SessionAnswer
- Claude's discretion on session history (past session summaries vs current-only)
- Claude's discretion on background/foreground handling

### Skill State Structure
- Claude's discretion on skill entry creation (lazy vs eager) — work with existing Record<string, SkillState> pattern
- Claude's discretion on default starting Elo — consider template baseElo values from Phase 2
- Claude's discretion on bugId tracking in skill states — weigh future misconception detection benefit vs complexity
- Claude's discretion on Elo logic ownership — follow project architecture (services for domain logic, store for state)

### Claude's Discretion
All four discussion areas were delegated to Claude's judgment. Key constraints to respect:
- Child profile must store name, age, grade, and avatar selection (STOR-01)
- Skill states must track per-skill Elo rating and attempt/correct counts (STOR-02)
- Session state must track current problem index, answers given, score, and XP earned (STOR-03)
- All state must survive app restart via AsyncStorage (STOR-04)
- Never add state directly to appStore.ts — use or extend slices (CLAUDE.md)
- Bump STORE_VERSION + add migration function when changing schema (CLAUDE.md guardrail)
- Don't bypass expo-secure-store for sensitive data (CLAUDE.md guardrail)
- Skill IDs are dot-delimited strings from Phase 2 (e.g., "addition.single-digit.no-carry")
- SessionAnswer expects { problemId: string, answer: number, correct: boolean }

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User trusts Claude's judgment on all implementation details for state management and persistence.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `appStore.ts`: Zustand store with 4 composed slices, STORE_VERSION=1, no persist middleware yet
- `childProfileSlice.ts`: Has childName, childAge, childGrade, avatarId (all nullable), setChildProfile action
- `skillStatesSlice.ts`: Has Record<string, SkillState> with eloRating/attempts/correct, updateSkillState and resetSkillStates actions
- `sessionStateSlice.ts`: Has isSessionActive, currentProblemIndex, sessionScore, sessionXpEarned, sessionAnswers[], startSession/endSession/recordAnswer actions
- `gamificationSlice.ts`: Has xp, level, weeklyStreak, lastSessionDate, addXp/setLevel/incrementStreak/resetStreak actions
- Phase 2 math engine: 14 skill definitions with dot-delimited IDs, Problem type with templateId/skillId
- Phase 3 answer formats: DistractorResult with bugId metadata, FormattedProblem types

### Established Patterns
- Zustand domain slices composed in appStore.ts via spread
- StateCreator generic typing: StateCreator<AppState, [], [], SliceType>
- Services directory for domain logic (src/services/mathEngine/)
- Zod for runtime validation at boundaries

### Integration Points
- Zustand persist middleware needs to wrap the create() call in appStore.ts
- AsyncStorage adapter for Zustand persist
- Skill IDs from Phase 2 skills.ts must match keys in Record<string, SkillState>
- SessionAnswer type used in sessionStateSlice must stay compatible with Phase 3 answer formats
- Phase 5 will consume skill Elo ratings for adaptive problem selection
- Phase 6 will drive session state transitions

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-state-management-persistence*
*Context gathered: 2026-03-02*
