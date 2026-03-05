# Phase 31: Pre-work -- Screen Refactoring - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor SessionScreen below the 500-line guardrail (currently 552 lines) with no behavioral changes. Prepare screens for gamification additions in subsequent phases.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
- Full discretion on refactoring approach — user trusts Claude to make all extraction decisions
- Scope: SessionScreen is the primary target (552 lines → under 500). Proactive refactoring of HomeScreen (317 lines) and ResultsScreen (418 lines) is at Claude's discretion given upcoming gamification growth.
- Extraction strategy: hooks vs components vs both — Claude decides based on code analysis
- Biggest extraction candidate: chat/tutor interaction logic (~150 lines of state, effects, handlers)
- Smaller candidates: session header/progress bar components, helper functions (formatPhaseLabel, getPhaseColor)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useSession` hook: already extracted, handles session state/flow
- `useTutor` hook: already extracted, handles LLM interaction
- `useCpaMode` hook: already extracted, handles CPA progression
- `useNetworkStatus` hook: already extracted, handles online/offline

### Established Patterns
- Custom hooks in `src/hooks/` for domain logic extraction
- Session components in `src/components/session/` (CpaSessionContent, CpaModeIcon)
- Chat components in `src/components/chat/` (HelpButton, ChatPanel, ChatBanner)
- Barrel exports (`index.ts`) for component directories

### Integration Points
- SessionScreen imports from `@/hooks/`, `@/components/session/`, `@/components/chat/`, `@/store/appStore`, `@/services/`
- Extracted code must maintain same external API (no changes to navigation params, store interactions, or session flow)
- Tests for SessionScreen must continue passing

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Pure infrastructure refactoring.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 31-pre-work-screen-refactoring*
*Context gathered: 2026-03-04*
