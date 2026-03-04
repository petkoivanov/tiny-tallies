# Requirements: Tiny Tallies

**Defined:** 2026-03-04
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## v0.5 Requirements

Requirements for AI Tutor milestone. Each maps to roadmap phases.

### LLM Service

- [ ] **LLM-01**: Gemini client singleton with lazy initialization and API key from expo-secure-store
- [ ] **LLM-02**: Prompt templates as pure functions parameterized by child age, CPA stage, and problem context
- [ ] **LLM-03**: System instruction enforces safety rules (no answer reveal, age-appropriate language, effort praise only)
- [ ] **LLM-04**: Non-streaming Gemini API call with AbortController and 8-second timeout
- [ ] **LLM-05**: Rate limiting (max 3 calls/problem, 20/session, 50/day configurable)

### Chat UI

- [ ] **CHAT-01**: Child-initiated help button visible during session (never auto-triggers)
- [ ] **CHAT-02**: Chat bubble UI with tutor and child message styling
- [ ] **CHAT-03**: Pre-defined response buttons for child input (no free-text)
- [ ] **CHAT-04**: Per-problem chat reset on problem advance with AbortController cleanup
- [ ] **CHAT-05**: Offline detection with friendly message when network unavailable

### Tutor Modes

- [ ] **MODE-01**: HINT mode delivers Socratic questions that never reveal the answer
- [ ] **MODE-02**: TEACH mode walks through concept with CPA-stage-aware language
- [ ] **MODE-03**: TEACH mode triggers ManipulativePanel expansion with correct manipulative type
- [ ] **MODE-04**: BOOST mode provides deep scaffolding with programmatic answer reveal after 3+ wrong
- [ ] **MODE-05**: Auto-escalation state machine (HINT → TEACH → BOOST) based on struggle level
- [ ] **MODE-06**: Bug Library misconception tag informs tutor explanations

### Safety & Compliance

- [ ] **SAFE-01**: Post-generation output filter scans for answer leaking (regex + rule engine)
- [ ] **SAFE-02**: COPPA data minimization — never send child name, age, or profile to LLM
- [ ] **SAFE-03**: Gemini safety filters set to BLOCK_LOW_AND_ABOVE for all 4 categories
- [ ] **SAFE-04**: Content validation (sentence length, vocabulary level per age bracket)
- [ ] **SAFE-05**: Canned fallback responses when LLM fails, is blocked, or times out
- [ ] **SAFE-06**: VPC parental consent gate before first AI tutor use

### Store & State

- [ ] **STATE-01**: Ephemeral tutorSlice in Zustand (not persisted, no migration needed)
- [ ] **STATE-02**: Chat messages, tutor mode, hint level, loading/error state in tutorSlice
- [ ] **STATE-03**: Tutor reads from skill/session state but never writes to it

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Extended Tutor

- **TUTR-01**: Streaming text display (word-by-word appearance)
- **TUTR-02**: TTS audio narration for tutor messages (ages 6-7 emergent readers)
- **TUTR-03**: Tutor analytics and metrics for parent dashboard
- **TUTR-04**: Tutor in sandbox/exploration mode
- **TUTR-05**: Response caching layer for common misconception patterns

### Misconception Detection (v0.6)

- **MISC-01**: Pattern tracking across sessions (2-then-3 confirmation rule)
- **MISC-02**: Targeted interventions triggered by confirmed misconceptions
- **MISC-03**: Misconception history in child profile

## Out of Scope

| Feature | Reason |
|---------|--------|
| Free-text chat input | Ages 6-7 cannot type reliably; pre-defined buttons eliminate prompt injection surface |
| Voice input | COPPA audio capture concerns; speech recognition unreliable for child voices |
| Voice output (TTS) | Deferred to future polish phase; `expo-speech` not in current dependencies |
| Tutor auto-trigger on wrong answer | Research shows child autonomy prevents math anxiety; on-demand only |
| Tutor in sandbox mode | Sandbox is free exploration; tutor guidance conflicts with free play |
| Real-time multiplayer tutoring | COPPA blocks real-time sharing |
| Conversation persistence across sessions | No pedagogical value; COPPA data retention concerns |
| Tutor computing math answers | LLM must NEVER compute math — programmatic engine only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LLM-01 | — | Pending |
| LLM-02 | — | Pending |
| LLM-03 | — | Pending |
| LLM-04 | — | Pending |
| LLM-05 | — | Pending |
| CHAT-01 | — | Pending |
| CHAT-02 | — | Pending |
| CHAT-03 | — | Pending |
| CHAT-04 | — | Pending |
| CHAT-05 | — | Pending |
| MODE-01 | — | Pending |
| MODE-02 | — | Pending |
| MODE-03 | — | Pending |
| MODE-04 | — | Pending |
| MODE-05 | — | Pending |
| MODE-06 | — | Pending |
| SAFE-01 | — | Pending |
| SAFE-02 | — | Pending |
| SAFE-03 | — | Pending |
| SAFE-04 | — | Pending |
| SAFE-05 | — | Pending |
| SAFE-06 | — | Pending |
| STATE-01 | — | Pending |
| STATE-02 | — | Pending |
| STATE-03 | — | Pending |

**Coverage:**
- v0.5 requirements: 25 total
- Mapped to phases: 0
- Unmapped: 25

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*
