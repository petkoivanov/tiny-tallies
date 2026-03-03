# Roadmap: Tiny Tallies

## Milestones

- ✅ **v0.1 Foundation** — Phases 1-6 (shipped 2026-03-03)
- ✅ **v0.2 UI Polish & Gamification** — Phases 7-10 (shipped 2026-03-03)
- 🚧 **v0.3 Adaptive Learning Engine** — Phases 11-14 (in progress)

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

### v0.3 Adaptive Learning Engine

- [x] **Phase 11: Bayesian Knowledge Tracing** - BKT mastery estimation service with age-adjusted parameters and mastery/re-teaching thresholds (completed 2026-03-03)
- [x] **Phase 12: Leitner Spaced Repetition** - Modified 6-box Leitner system with age-adjusted intervals and review queue scheduling (completed 2026-03-03)
- [x] **Phase 13: Prerequisite Graph & Outer Fringe** - BKT-mastery-based skill gating with outer fringe algorithm for new skill discovery (completed 2026-03-03)
- [ ] **Phase 14: Smart Session Orchestration** - Session problem selection using 60/30/10 mix sourced from Leitner queue, outer fringe, and challenge pool

## Phase Details

<details>
<summary>v0.1 Phase Details (shipped)</summary>

### Phase 1: Project Scaffolding & Navigation
**Goal**: Project foundation with navigation and theme
**Depends on**: Nothing
**Requirements**: (v0.1 scope)
**Plans**: 2 plans (complete)

### Phase 2: Math Engine Core
**Goal**: Programmatic problem generation across 14 skills
**Depends on**: Phase 1
**Requirements**: (v0.1 scope)
**Plans**: 2 plans (complete)

### Phase 3: Bug Library & Answer Formats
**Goal**: Misconception-based distractors and multiple choice
**Depends on**: Phase 2
**Requirements**: (v0.1 scope)
**Plans**: 2 plans (complete)

### Phase 4: State Management & Persistence
**Goal**: Zustand store with domain slices and AsyncStorage persistence
**Depends on**: Phase 1
**Requirements**: (v0.1 scope)
**Plans**: 2 plans (complete)

### Phase 5: Adaptive Difficulty
**Goal**: Elo-based difficulty targeting 85% success rate
**Depends on**: Phase 2, Phase 4
**Requirements**: (v0.1 scope)
**Plans**: 2 plans (complete)

### Phase 6: Session Flow & Navigation Control
**Goal**: Complete session lifecycle with navigation guards
**Depends on**: Phase 5
**Requirements**: (v0.1 scope)
**Plans**: 2 plans (complete)

</details>

<details>
<summary>v0.2 Phase Details (shipped)</summary>

### Phase 7: Gamification Engine
**Goal**: Children earn meaningful, scaled rewards that track their progress across sessions
**Depends on**: Phase 6 (session flow commits XP)
**Requirements**: GAME-01, GAME-02, GAME-04
**Plans**: 2 plans (complete)

### Phase 8: Home Screen Dashboard
**Goal**: Children see their identity and progress the moment they open the app
**Depends on**: Phase 7 (gamification state available)
**Requirements**: UI-01, GAME-05
**Plans**: 1 plan (complete)

### Phase 9: Session & Results UI Polish
**Goal**: The practice experience feels polished, readable, and physically comfortable for small hands
**Depends on**: Phase 7 (XP/level data for results display)
**Requirements**: UI-02, UI-03, UI-04, UI-05
**Plans**: 2 plans (complete)

### Phase 10: Animated Feedback & Celebrations
**Goal**: Children receive delightful, immediate visual feedback that reinforces learning and rewards milestones
**Depends on**: Phase 8 (home screen shows level), Phase 9 (session screen styled)
**Requirements**: UI-06, GAME-03
**Plans**: 2 plans (complete)

</details>

### Phase 11: Bayesian Knowledge Tracing
**Goal**: The app tracks how well the child actually knows each skill, not just how they performed on the last problem
**Depends on**: Phase 5 (Elo-based skill states in store)
**Requirements**: BKT-01, BKT-02, BKT-03, BKT-04
**Success Criteria** (what must be TRUE):
  1. After every answered problem, the corresponding skill's mastery probability (P(L)) updates via Bayesian inference -- increasing on correct answers and decreasing on incorrect answers
  2. A 6-year-old child's BKT parameters differ from an 8-year-old's: younger children have higher guess/slip rates and lower learn rates, reflecting age-appropriate cognitive differences
  3. When a skill's P(L) reaches 0.95 or above, it is visibly marked as mastered in the store and excluded from active practice rotation
  4. When a skill's P(L) drops below 0.40, it is flagged as needing re-teaching and receives priority in problem selection
**Plans**: 2 plans
Plans:
- [ ] 11-01-PLAN.md — BKT computation service, store schema extension, migration
- [ ] 11-02-PLAN.md — BKT integration into session flow with soft mastery lock

### Phase 12: Leitner Spaced Repetition
**Goal**: The app schedules skill reviews at optimal intervals so children retain what they have learned without wasting time on already-mastered material
**Depends on**: Phase 11 (BKT mastery informs box transitions and mastery graduation)
**Requirements**: LEIT-01, LEIT-02, LEIT-03, LEIT-04, LEIT-05
**Success Criteria** (what must be TRUE):
  1. Each skill occupies one of 6 Leitner boxes, and the box number determines how long before that skill comes up for review again
  2. Getting a problem correct moves its skill up one box (longer wait before next review); getting it wrong drops the skill down 2 boxes (minimum Box 1), not all the way to Box 1
  3. Review intervals are compressed for younger children (e.g., Box 3 = 1 day for age 6-7 vs 3 days for age 8-9)
  4. A skill that achieves 3 consecutive correct answers while in Box 6 graduates to mastered status and shifts to monthly review-only scheduling
**Plans**: TBD

### Phase 13: Prerequisite Graph & Outer Fringe
**Goal**: Children only encounter new skills when they have genuinely mastered the prerequisites, and the app always knows which new skills are ready to introduce
**Depends on**: Phase 11 (BKT mastery thresholds replace Elo-threshold gating)
**Requirements**: PREG-01, PREG-02, PREG-03
**Success Criteria** (what must be TRUE):
  1. All 14 existing skills have prerequisite dependencies defined in a DAG that matches the curriculum progression (addition chain and subtraction chain with shared roots)
  2. The outer fringe algorithm returns exactly those unmastered skills whose prerequisites are all BKT-mastered (P(L) >= 0.95), providing the pool of "ready to learn" skills
  3. During a session, new skills are only drawn from the outer fringe -- a child never sees a problem for a skill whose prerequisites they have not mastered
**Plans**: 2 plans
Plans:
- [ ] 13-01-PLAN.md — DAG cross-links, BKT-mastery gating refactor, outer fringe algorithm
- [ ] 13-02-PLAN.md — Integration wiring, test updates, full regression

### Phase 14: Smart Session Orchestration
**Goal**: Each practice session delivers a pedagogically structured mix of review, new learning, and stretch challenges tailored to this specific child
**Depends on**: Phase 11 (BKT probabilities), Phase 12 (Leitner review queue), Phase 13 (outer fringe for new skills)
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05
**Success Criteria** (what must be TRUE):
  1. A generated session queue contains approximately 60% review problems, 30% new-skill problems, and 10% challenge problems (with graceful fallback when a category has insufficient skills)
  2. Review problems are sourced from skills that are due for review according to their Leitner box intervals -- not random skills
  3. New-skill problems are sourced from the prerequisite outer fringe, introducing only skills the child is ready for
  4. Challenge problems target skills slightly above the child's current Elo rating, providing growth opportunities without frustration
  5. BKT mastery probabilities influence problem selection across all categories: mastered skills are deprioritized, weak skills (low P(L)) are prioritized for more practice

**Plans**: 2 plans
Plans:
- [ ] 14-01-PLAN.md — Practice mix algorithm (slot calculation, pool building, BKT-weighted selection, fallback cascade, constrained ordering)
- [ ] 14-02-PLAN.md — Session orchestrator integration, test updates, full regression

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13 -> 14

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
| 14. Smart Session Orchestration | v0.3 | 0/2 | Not started | - |
