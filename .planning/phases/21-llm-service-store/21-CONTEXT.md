# Phase 21: LLM Service & Store - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Gemini LLM service layer and ephemeral tutor store slice. This phase delivers: singleton Gemini client with API key from secure store, prompt template pure functions, rate limiter, tutor Zustand slice (not persisted), and the core useTutor hook lifecycle with AbortController cleanup. No UI components in this phase — that's Phase 23.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

All gray areas delegated to Claude. Use research-backed defaults:

**Tutor personality:**
- Name: "Math Helper" (generic, friendly, age-appropriate)
- Tone: Warm and encouraging, growth mindset language, effort praise only ("Great thinking!" not "You're so smart!")
- No gendered character or avatar — text-only persona in system instruction
- Age-bracket-adjusted sentence length (8 words for 6-7, 10 for 7-8, 12 for 8-9)

**API key setup:**
- Read from expo-secure-store at runtime (key: `gemini-api-key`)
- If key not found, geminiClient returns a clear error (not crash) — downstream handles gracefully
- No hardcoded keys in source. Dev workflow: set key via a setup utility or manual secure-store write
- Production: key provisioned during onboarding/parent setup flow (future phase)

**Model & parameters:**
- Model: `gemini-2.5-flash` (locked, not configurable — cheapest/fastest adequate for children's hints)
- Temperature: 0.7 (balanced variety without hallucination risk)
- Max output tokens: 200 (forces concise responses for young readers)
- Thinking disabled (no reasoning traces needed for short hints)

**Rate limiting:**
- 3 calls per problem, 20 per session, 50 per day — configurable constants
- Child-friendly message on limit: encouraging tone, e.g. "You've been working hard! Try this one on your own."
- Rate state tracked in tutorSlice (ephemeral, resets on app restart for daily count use device date)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — user delegated all decisions to Claude. Use research SUMMARY.md and ARCHITECTURE.md as the authoritative source for implementation choices.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `appStore.ts`: Zustand slice composition pattern with `partialize` — tutorSlice follows identical pattern but excluded from partialize
- `SessionAnswer.bugId`: Already captures misconception tag from distractor — tutor can read this directly
- `BugPattern.description`: Human-readable misconception description in bugLibrary/types.ts — pass to prompt templates
- `expo-secure-store` (v15.0.7): Already in dependencies for API key storage
- `@google/genai` (v1.30.0): Already installed, upgrade to latest recommended
- `@react-native-community/netinfo` (v11.4.1): Already in dependencies for offline detection
- `zod` (v4.1.13): Already in dependencies for response validation at system boundary

### Established Patterns
- Zustand slices: `StateCreator<AppState, [], [], SliceType>` pattern in src/store/slices/
- Services: Pure functions in src/services/{domain}/ with barrel exports (index.ts)
- Hooks: Compose services + store in src/hooks/ (useSession.ts, useCpaMode.ts)
- Types: Separate types file per service domain (types.ts or {domain}Types.ts)
- STORE_VERSION = 5, partialize controls persistence — new ephemeral slice needs no version bump

### Integration Points
- `appStore.ts`: Add tutorSlice to AppState type union and slice composition
- `useSession`: Provides currentProblem, currentIndex, sessionAnswers — tutor hook reads these
- `useCpaMode`: Provides CPA stage — tutor prompt templates need this
- `childProfileSlice`: Provides childAge — tutor uses age bracket for prompt parameterization
- `bugLibrary/`: BugPattern.id + description — tutor resolves misconception context from bugId
- `skillStatesSlice`: Read-only access for mastery probability context

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 21-llm-service-store*
*Context gathered: 2026-03-04*
