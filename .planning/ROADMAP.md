# Roadmap: Tiny Tallies

## Milestones

- ✅ **v0.1 Foundation** — Phases 1-6 (shipped 2026-03-03)
- ✅ **v0.2 UI Polish & Gamification** — Phases 7-10 (shipped 2026-03-03)
- ✅ **v0.3 Adaptive Learning Engine** — Phases 11-14 (shipped 2026-03-03)
- ✅ **v0.4 Virtual Manipulatives** — Phases 15-20 (shipped 2026-03-04)
- ✅ **v0.5 AI Tutor** — Phases 21-25 (shipped 2026-03-04)
- 🚧 **v0.6 Misconception Detection** — Phases 26-30 (in progress)

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

<details>
<summary>✅ v0.5 AI Tutor (Phases 21-25) — SHIPPED 2026-03-04</summary>

- [x] Phase 21: LLM Service & Store (3/3 plans) — completed 2026-03-04
- [x] Phase 22: Safety & Compliance (3/3 plans) — completed 2026-03-04
- [x] Phase 23: Chat UI & HINT Mode (2/2 plans) — completed 2026-03-04
- [x] Phase 24: TEACH, BOOST & Auto-Escalation (3/3 plans) — completed 2026-03-04
- [x] Phase 25: Consent Gate & Minor Fixes (2/2 plans) — completed 2026-03-04

</details>

### 🚧 v0.6 Misconception Detection (In Progress)

**Milestone Goal:** Track misconception patterns across sessions using the 2-then-3 confirmation rule, store misconception history per child, and deliver targeted interventions -- shifting from reactive per-problem feedback to systematic misconception remediation.

- [x] **Phase 26: Misconception Store & Recording** - Store slice, migration, and per-answer bug tag recording (completed 2026-03-04)
- [x] **Phase 27: Confirmation Engine** - 2-then-3 confirmation rule and misconception history with status tracking (completed 2026-03-04)
- [ ] **Phase 28: Session Mix Adaptation** - Session orchestrator prioritizes skills with confirmed misconceptions
- [ ] **Phase 29: AI Tutor Misconception Context** - Tutor prompts enriched with cross-session misconception data
- [ ] **Phase 30: Remediation Mini-Sessions** - Dedicated remediation flow for accumulated confirmed misconceptions

## Phase Details

### Phase 26: Misconception Store & Recording
**Goal**: Every wrong answer's Bug Library tag is captured and persisted, surviving app restarts
**Depends on**: Phase 25 (v0.5 complete)
**Requirements**: STATE-01, STATE-02, MISC-01
**Success Criteria** (what must be TRUE):
  1. A misconceptionSlice exists in the Zustand store with persistence enabled and a store migration from STORE_VERSION 6 to 7
  2. Each misconception record contains bugTag, skillId, occurrenceCount, status, and timestamps as defined in STATE-02
  3. When a child answers incorrectly and the answer matches a Bug Library pattern, the corresponding bug tag is recorded in the misconception store
  4. Misconception records survive app restart (persisted via AsyncStorage)
**Plans**: 2 plans
Plans:
- [ ] 26-01-PLAN.md — misconceptionSlice with types, store composition, migration, and TDD tests
- [ ] 26-02-PLAN.md — Wire misconception recording into useSession answer flow

### Phase 27: Confirmation Engine
**Goal**: The system distinguishes suspected from confirmed misconceptions using cross-session pattern analysis
**Depends on**: Phase 26
**Requirements**: MISC-02, MISC-03
**Success Criteria** (what must be TRUE):
  1. After 2 occurrences of the same bug tag for a skill, the misconception status is set to "suspected"
  2. After 3 occurrences of the same bug tag for a skill, the misconception status is set to "confirmed"
  3. Misconception history per child includes timestamps for each occurrence and the current confirmation status
  4. Confirmation logic operates across sessions (occurrences from different sessions are aggregated)
**Plans**: 1 plan
Plans:
- [ ] 27-01-PLAN.md — 2-then-3 confirmation rule, status timestamps, and status-filtered selectors (TDD)

### Phase 28: Session Mix Adaptation
**Goal**: Practice sessions automatically prioritize skills where the child has confirmed misconceptions
**Depends on**: Phase 27
**Requirements**: INTV-01
**Success Criteria** (what must be TRUE):
  1. The session orchestrator injects remediation problems for skills with confirmed misconceptions into the practice queue
  2. Remediation problems appear in the practice segment (not warmup or cooldown), replacing some of the normal 60/30/10 mix
  3. Skills with confirmed misconceptions receive higher selection weight than standard review skills
**Plans**: 1 plan
Plans:
- [ ] 28-01-PLAN.md — Remediation injection into practice mix with category type, threading through session orchestrator and useSession

### Phase 29: AI Tutor Misconception Context
**Goal**: The AI tutor knows about a child's confirmed misconceptions and addresses them specifically in explanations
**Depends on**: Phase 27
**Requirements**: INTV-02
**Success Criteria** (what must be TRUE):
  1. When generating tutor prompts, confirmed misconception data (bug tag, skill, confirmation status) is included in the LLM context
  2. The tutor's explanations for problems on skills with confirmed misconceptions address the specific misunderstanding pattern rather than giving generic help
  3. No child PII is included in the misconception context sent to the LLM (COPPA compliance maintained)
**Plans**: TBD

### Phase 30: Remediation Mini-Sessions
**Goal**: Children with multiple confirmed misconceptions can enter a focused remediation session that targets those specific gaps
**Depends on**: Phase 27, Phase 28
**Requirements**: INTV-03
**Success Criteria** (what must be TRUE):
  1. When a child has 2 or more confirmed misconceptions, a remediation mini-session option becomes available
  2. The remediation session contains problems specifically targeting the confirmed misconception skills (not the normal 60/30/10 mix)
  3. Completing remediation problems contributes to reducing misconception occurrence counts (progress toward clearing the misconception)
  4. The remediation flow uses the existing session UI and math engine (no LLM-generated problems)
**Plans**: TBD

## Progress

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
| 21. LLM Service & Store | v0.5 | 3/3 | Complete | 2026-03-04 |
| 22. Safety & Compliance | v0.5 | 3/3 | Complete | 2026-03-04 |
| 23. Chat UI & HINT Mode | v0.5 | 2/2 | Complete | 2026-03-04 |
| 24. TEACH, BOOST & Auto-Escalation | v0.5 | 3/3 | Complete | 2026-03-04 |
| 25. Consent Gate & Minor Fixes | v0.5 | 2/2 | Complete | 2026-03-04 |
| 26. Misconception Store & Recording | 2/2 | Complete    | 2026-03-04 | - |
| 27. Confirmation Engine | 1/1 | Complete    | 2026-03-04 | - |
| 28. Session Mix Adaptation | v0.6 | 0/1 | Not started | - |
| 29. AI Tutor Misconception Context | v0.6 | 0/0 | Not started | - |
| 30. Remediation Mini-Sessions | v0.6 | 0/0 | Not started | - |
