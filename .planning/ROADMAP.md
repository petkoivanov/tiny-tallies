# Roadmap: Tiny Tallies

## Milestones

- ✅ **v0.1 Foundation** — Phases 1-6 (shipped 2026-03-03)
- ✅ **v0.2 UI Polish & Gamification** — Phases 7-10 (shipped 2026-03-03)
- ✅ **v0.3 Adaptive Learning Engine** — Phases 11-14 (shipped 2026-03-03)
- ✅ **v0.4 Virtual Manipulatives** — Phases 15-20 (shipped 2026-03-04)
- 🚧 **v0.5 AI Tutor** — Phases 21-24 (in progress)

## Phases

<details>
<summary>✅ v0.1 Foundation (Phases 1-6) — SHIPPED 2026-03-03</summary>

- [x] Phase 1: Project Scaffolding & Navigation (2/2 plans) — completed 2026-03-01
- [x] Phase 2: Math Engine Core (2/2 plans) — completed 2026-03-02
- [x] Phase 3: Bug Library & Answer Formats (2/2 plans) — completed 2026-03-02
- [x] Phase 4: State Management & Persistence (2/2 plans) — completed 2026-03-02
- [x] Phase 5: Adaptive Difficulty (2/2 plans) — completed 2026-03-02
- [x] Phase 6: Session Flow & Navigation Control (2/2 plans) — completed 2026-03-02

</details>

<details>
<summary>✅ v0.2 UI Polish & Gamification (Phases 7-10) — SHIPPED 2026-03-03</summary>

- [x] Phase 7: Gamification Engine (2/2 plans) — completed 2026-03-02
- [x] Phase 8: Home Screen Dashboard (1/1 plans) — completed 2026-03-03
- [x] Phase 9: Session & Results UI Polish (2/2 plans) — completed 2026-03-03
- [x] Phase 10: Animated Feedback & Celebrations (2/2 plans) — completed 2026-03-03

</details>

<details>
<summary>✅ v0.3 Adaptive Learning Engine (Phases 11-14) — SHIPPED 2026-03-03</summary>

- [x] Phase 11: Bayesian Knowledge Tracing (2/2 plans) — completed 2026-03-03
- [x] Phase 12: Leitner Spaced Repetition (2/2 plans) — completed 2026-03-03
- [x] Phase 13: Prerequisite Graph & Outer Fringe (2/2 plans) — completed 2026-03-03
- [x] Phase 14: Smart Session Orchestration (2/2 plans) — completed 2026-03-03

</details>

<details>
<summary>✅ v0.4 Virtual Manipulatives (Phases 15-20) — SHIPPED 2026-03-04</summary>

- [x] Phase 15: Foundation -- Store Schema, Services, and Mappings (2/2 plans) — completed 2026-03-03
- [x] Phase 16: Shared Drag Primitives (2/2 plans) — completed 2026-03-03
- [x] Phase 17: Manipulative Components (4/4 plans) — completed 2026-03-03
- [x] Phase 18: CPA Progression and Session Integration (3/3 plans) — completed 2026-03-03
- [x] Phase 19: Sandbox Navigation (2/2 plans) — completed 2026-03-03
- [x] Phase 20: Polish (4/4 plans) — completed 2026-03-04

</details>

### v0.5 AI Tutor (In Progress)

- [ ] **Phase 21: LLM Service & Store** - Gemini client, prompt templates, rate limiting, tutor store slice, and core lifecycle hook
- [ ] **Phase 22: Safety & Compliance** - Output filtering, COPPA data minimization, safety filters, content validation, fallback responses, and VPC gate
- [ ] **Phase 23: Chat UI & HINT Mode** - Help button, chat bubble UI, response buttons, per-problem reset, offline detection, and Socratic hint delivery
- [ ] **Phase 24: TEACH, BOOST & Auto-Escalation** - TEACH mode with manipulative integration, BOOST mode scaffolding, auto-escalation state machine, and Bug Library-informed explanations

## Phase Details

### Phase 21: LLM Service & Store
**Goal**: The app can send prompts to Gemini and receive validated responses, with tutor state managed in an ephemeral store slice that reads from but never writes to session/adaptive state
**Depends on**: Phase 20 (v0.4 complete)
**Requirements**: LLM-01, LLM-02, LLM-04, LLM-05, STATE-01, STATE-02, STATE-03
**Success Criteria** (what must be TRUE):
  1. Gemini client initializes lazily with API key from expo-secure-store and sends a prompt that returns a validated response
  2. Prompt templates produce age-appropriate, CPA-stage-aware prompts given a child age bracket, CPA stage, and problem context
  3. LLM calls abort cleanly via AbortController and enforce an 8-second timeout
  4. Rate limiter blocks calls exceeding 3/problem, 20/session, or 50/day thresholds and returns a user-friendly message
  5. Tutor store slice holds chat messages, tutor mode, hint level, and loading/error state without persisting to AsyncStorage or triggering a store migration
**Plans**: TBD

### Phase 22: Safety & Compliance
**Goal**: Every LLM response passes through deterministic safety checks before reaching the child, and parental consent is required before first AI tutor use
**Depends on**: Phase 21
**Requirements**: LLM-03, SAFE-01, SAFE-02, SAFE-03, SAFE-04, SAFE-05, SAFE-06
**Success Criteria** (what must be TRUE):
  1. System instruction enforces safety rules (no answer reveal, age-appropriate language, effort praise only) and Gemini safety filters are set to BLOCK_LOW_AND_ABOVE for all 4 categories
  2. Post-generation output filter detects and blocks responses that leak the correct answer (number as digit, spelled out, or indirect phrasing)
  3. Outbound prompts never contain child name, specific age, or profile data -- only math problem, numeric answer, and misconception tag
  4. Content validator rejects responses exceeding sentence length or vocabulary limits for the child's age bracket, substituting a canned fallback
  5. When LLM fails, is blocked, times out, or is rate-limited, the child sees a friendly canned fallback response and the session continues uninterrupted
**Plans**: TBD

### Phase 23: Chat UI & HINT Mode
**Goal**: A child can tap Help during a practice problem and receive Socratic hints through a chat bubble interface that resets per-problem and degrades gracefully offline
**Depends on**: Phase 22
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, MODE-01
**Success Criteria** (what must be TRUE):
  1. Child sees a help button during practice that they can tap to open the tutor chat (button is always visible, never auto-triggers)
  2. Chat displays tutor messages in styled bubbles and child responds via pre-defined response buttons (no free-text input)
  3. Tutor delivers Socratic hints that guide thinking without ever revealing the answer
  4. Chat state resets completely when the problem advances, with any in-flight LLM calls cancelled via AbortController
  5. When the device is offline, child sees a friendly message explaining help is unavailable and practice continues normally
**Plans**: TBD

### Phase 24: TEACH, BOOST & Auto-Escalation
**Goal**: The tutor automatically escalates from hints to CPA-aware teaching with manipulatives to deep scaffolding based on the child's struggle level, with Bug Library misconception tags informing explanations
**Depends on**: Phase 23
**Requirements**: MODE-02, MODE-03, MODE-04, MODE-05, MODE-06
**Success Criteria** (what must be TRUE):
  1. When hints are insufficient, tutor auto-escalates to TEACH mode which uses CPA-stage-aware language matching the child's current concrete/pictorial/abstract level
  2. TEACH mode triggers the ManipulativePanel to expand with the correct manipulative type pre-selected for the current skill
  3. After continued struggle, tutor auto-escalates to BOOST mode which provides deep scaffolding and programmatic answer reveal after 3+ wrong attempts
  4. Auto-escalation state machine transitions HINT -> TEACH -> BOOST based on hint count and wrong-answer count, resetting per-problem
  5. Bug Library misconception tags from the child's wrong answer inform tutor explanations, addressing the specific misunderstanding rather than giving generic feedback
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 21 -> 22 -> 23 -> 24

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Project Scaffolding & Navigation | v0.1 | 2/2 | Complete | 2026-03-01 |
| 2. Math Engine Core | v0.1 | 2/2 | Complete | 2026-03-02 |
| 3. Bug Library & Answer Formats | v0.1 | 2/2 | Complete | 2026-03-02 |
| 4. State Management & Persistence | v0.1 | 2/2 | Complete | 2026-03-02 |
| 5. Adaptive Difficulty | v0.1 | 2/2 | Complete | 2026-03-02 |
| 6. Session Flow & Navigation Control | v0.1 | 2/2 | Complete | 2026-03-02 |
| 7. Gamification Engine | v0.2 | 2/2 | Complete | 2026-03-02 |
| 8. Home Screen Dashboard | v0.2 | 1/1 | Complete | 2026-03-03 |
| 9. Session & Results UI Polish | v0.2 | 2/2 | Complete | 2026-03-03 |
| 10. Animated Feedback & Celebrations | v0.2 | 2/2 | Complete | 2026-03-03 |
| 11. Bayesian Knowledge Tracing | v0.3 | 2/2 | Complete | 2026-03-03 |
| 12. Leitner Spaced Repetition | v0.3 | 2/2 | Complete | 2026-03-03 |
| 13. Prerequisite Graph & Outer Fringe | v0.3 | 2/2 | Complete | 2026-03-03 |
| 14. Smart Session Orchestration | v0.3 | 2/2 | Complete | 2026-03-03 |
| 15. Foundation -- Store Schema, Services, and Mappings | v0.4 | 2/2 | Complete | 2026-03-03 |
| 16. Shared Drag Primitives | v0.4 | 2/2 | Complete | 2026-03-03 |
| 17. Manipulative Components | v0.4 | 4/4 | Complete | 2026-03-03 |
| 18. CPA Progression and Session Integration | v0.4 | 3/3 | Complete | 2026-03-03 |
| 19. Sandbox Navigation | v0.4 | 2/2 | Complete | 2026-03-03 |
| 20. Polish | v0.4 | 4/4 | Complete | 2026-03-04 |
| 21. LLM Service & Store | v0.5 | 0/? | Not started | - |
| 22. Safety & Compliance | v0.5 | 0/? | Not started | - |
| 23. Chat UI & HINT Mode | v0.5 | 0/? | Not started | - |
| 24. TEACH, BOOST & Auto-Escalation | v0.5 | 0/? | Not started | - |
