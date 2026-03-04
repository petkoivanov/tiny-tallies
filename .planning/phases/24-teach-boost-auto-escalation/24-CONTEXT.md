# Phase 24: TEACH, BOOST & Auto-Escalation - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

The tutor automatically escalates from hints to CPA-aware teaching with manipulatives to deep scaffolding based on the child's struggle level, with Bug Library misconception tags informing explanations. This phase delivers: auto-escalation state machine (HINT → TEACH → BOOST), TEACH mode with CPA-stage-aware language and ManipulativePanel integration, BOOST mode with deep scaffolding and programmatic answer reveal after 3+ wrong, and Bug Library misconception tags flowing into tutor explanations across all modes. Chat UI and HINT mode already exist from Phase 23.

</domain>

<decisions>
## Implementation Decisions

### Escalation Thresholds
- HINT → TEACH: After 2 Socratic hints delivered AND child answers wrong again. Fast escalation — don't let ages 6-9 struggle too long
- TEACH → BOOST: After 3+ total wrong answers on the problem (cumulative across all modes). Matches success criteria "3+ wrong attempts"
- Transitions announced with gentle tutor message: "Let me show you a different way!" before switching mode. Positive framing, not punitive
- State machine resets per-problem only — closing and reopening chat on same problem preserves current mode. Avoids frustrating re-escalation from scratch

### TEACH Mode Experience
- ManipulativePanel auto-expands with the correct manipulative pre-selected for the current skill (via useCpaMode). Matches existing concrete-mode auto-expand behavior
- Full CPA-stage language adaptation: concrete references physical objects/blocks, pictorial references diagrams/pictures, abstract uses math notation/algorithms
- Chat guidance only — no guided highlighting on manipulatives. Tutor explains via chat, manipulative is open for child to explore freely
- When ManipulativePanel opens, chat minimizes to show only the latest tutor message as a floating banner at top. Manipulatives need screen space. Child can tap to re-expand full chat

### BOOST Mode & Answer Reveal
- Tutor explains answer in chat with teaching tone: "The answer is 15! When we add 8 + 7, we can make a 10 first..." Focus on the WHY, not just the number. Growth mindset
- Correct answer option is visually highlighted in the answer grid simultaneously. Dual reinforcement — chat explains, grid shows
- After reveal, response buttons change to single "Got it!" button. Simplifies the moment — child acknowledges and moves on
- Child taps the highlighted answer to advance (still requires interaction, but correct answer is obvious)
- BOOST-revealed answer counts as WRONG for XP/Elo/BKT. Child didn't solve independently — honest tracking. Encouragement comes from tutor chat, not from scoring

### Misconception Messaging
- Bug Library misconception tags inform ALL tutor modes, including HINT. Even Socratic hints target the specific misconception: "What happens when the ones column adds up to more than 9?"
- Subtle reframing approach — tutor addresses the misconception indirectly by teaching the correct approach, never says "you did X wrong"
- When no Bug Library match (random/adjacent distractor), fall back to generic CPA walkthrough: "Let me walk through this problem with you"
- Misconception passed to LLM via structured prompt template — bugDescription string woven into instructions: "The child may have [description]. Address this without naming it directly." Controlled messaging, not raw to LLM

### Claude's Discretion
- Exact animation timing for ManipulativePanel auto-expand during TEACH
- Floating chat banner design (position, styling, tap-to-expand behavior)
- Answer highlight styling in grid (glow, border, color)
- Exact wording of gentle transition messages between modes
- "Got it!" button styling and auto-close timing
- Prompt template structure for TEACH and BOOST modes (within the constraints above)

</decisions>

<specifics>
## Specific Ideas

- Gentle announcement on mode transition feels like a natural conversation shift, not a system notification — the tutor is adapting to the child, not the app switching modes
- Chat minimizing to floating banner when manipulative opens solves the screen space problem — manipulatives need room for drag interaction
- "Got it!" as the only post-reveal button avoids overwhelming a child who just struggled through 3+ wrong answers
- Teaching tone in BOOST ("here's why") turns a potential failure moment into a learning moment — the child leaves with understanding, not just the answer
- Misconception-informed HINT mode is more efficient — targeted Socratic questions reach the root issue faster

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tutorSlice`: Already has `tutorMode: TutorMode` with 'hint' | 'teach' | 'boost' enum, `hintLevel`, `setTutorMode()` — mode switching infrastructure exists
- `useTutor` hook: `requestHint()`, `resetChat()`, AbortController lifecycle — needs mode-aware prompt routing
- `ManipulativePanel`: Animated collapsible drawer with Reanimated — auto-expand pattern already works for concrete mode
- `useCpaMode`: Returns `{ stage, manipulativeType }` — ready to wire into useTutor (currently hardcoded to 'concrete')
- `buildHintPrompt` / `buildSystemInstruction`: Prompt template pattern — extend with buildTeachPrompt, buildBoostPrompt
- `ChatPanel` / `ResponseButtons`: Existing chat UI — needs conditional button rendering for BOOST mode
- Bug Library: `BugPattern.description` + `DistractorResult.bugId` — misconception data flows from wrong answer selection

### Established Patterns
- Component composition: Screen → Components → Hooks → Services
- Reanimated for animations (ManipulativePanel, ConfettiCelebration)
- StyleSheet.create for all styles
- Ephemeral tutor state (not persisted, no migration needed)
- 48dp touch targets, dark theme, high contrast

### Integration Points
- `SessionScreen.tsx`: Tracks wrong answers per problem, passes bugId to useTutor, coordinates ManipulativePanel + ChatPanel visibility
- `useTutor`: Central hook — needs escalation logic, mode-aware prompt selection, CPA stage from useCpaMode
- `promptTemplates.ts`: New buildTeachPrompt() and buildBoostPrompt() with CPA-stage and bugDescription parameters
- `tutorSlice`: Add wrongAnswerCount field, expose to escalation logic
- `tutor/index.ts`: Export new prompt builders

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 24-teach-boost-auto-escalation*
*Context gathered: 2026-03-04*
