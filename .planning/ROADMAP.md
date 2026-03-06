# Roadmap: Tiny Tallies

## Milestones

- ✅ **v0.1 Foundation** — Phases 1-6 (shipped 2026-03-03)
- ✅ **v0.2 UI Polish & Gamification** — Phases 7-10 (shipped 2026-03-03)
- ✅ **v0.3 Adaptive Learning Engine** — Phases 11-14 (shipped 2026-03-03)
- ✅ **v0.4 Virtual Manipulatives** — Phases 15-20 (shipped 2026-03-04)
- ✅ **v0.5 AI Tutor** — Phases 21-25 (shipped 2026-03-04)
- ✅ **v0.6 Misconception Detection** — Phases 26-30 (shipped 2026-03-05)
- ✅ **v0.7 Gamification** — Phases 31-37 (shipped 2026-03-06)
- **v0.8 Social & Subscription** — Phases 38-43

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

<details>
<summary>✅ v0.6 Misconception Detection (Phases 26-30) — SHIPPED 2026-03-05</summary>

- [x] Phase 26: Misconception Store & Recording (2/2 plans) — completed 2026-03-04
- [x] Phase 27: Confirmation Engine (1/1 plans) — completed 2026-03-04
- [x] Phase 28: Session Mix Adaptation (1/1 plans) — completed 2026-03-04
- [x] Phase 29: AI Tutor Misconception Context (1/1 plans) — completed 2026-03-04
- [x] Phase 30: Remediation Mini-Sessions (2/2 plans) — completed 2026-03-05

</details>

<details>
<summary>✅ v0.7 Gamification (Phases 31-37) — SHIPPED 2026-03-06</summary>

- [x] Phase 31: Pre-work -- Screen Refactoring (1/1 plans) — completed 2026-03-05
- [x] Phase 32: Achievement System Foundation (2/2 plans) — completed 2026-03-05
- [x] Phase 33: Badge UI & Session Integration (3/3 plans) — completed 2026-03-05
- [x] Phase 34: Visual Skill Map (3/3 plans) — completed 2026-03-05
- [x] Phase 35: Daily Challenges (2/2 plans) — completed 2026-03-05
- [x] Phase 36: Avatars & Frames (2/2 plans) — completed 2026-03-05
- [x] Phase 37: UI Themes (4/4 plans) — completed 2026-03-06

</details>

### v0.8 Social & Subscription (Phases 38-43)

- [x] **Phase 38: Multi-Child Store Foundation** - Restructure Zustand store from single-child to multi-child keyed architecture (completed 2026-03-06)
- [ ] **Phase 39: Profile Management UI** - Profile switcher, add/edit/delete children from home screen
- [ ] **Phase 40: Session History & Analytics Engine** - Session history collection and pure-computation analytics services
- [ ] **Phase 41: Parent Dashboard** - PIN-gated parent navigator with progress, misconception, and trend views
- [ ] **Phase 42: Parental Time Controls** - Daily session caps, bedtime lockout, and break reminders per child
- [ ] **Phase 43: Freemium Subscription & IAP** - RevenueCat integration, paywall, feature gating, restore purchases

## Phase Details

### Phase 38: Multi-Child Store Foundation
**Goal**: Each child's learning data is isolated and independently persisted so the app can support multiple learners on one device
**Depends on**: Nothing (first phase of v0.8)
**Requirements**: PROF-05, PROF-06, PROF-07, PROF-08
**Success Criteria** (what must be TRUE):
  1. App migrates existing single-child data into a children map without data loss (v12->v13 migration)
  2. Switching active child hydrates that child's complete state (Elo, BKT, skills, XP, achievements, cosmetics, misconceptions) into the store
  3. A new child profile initializes with grade-appropriate skill unlocks and starting difficulty
  4. Active child data auto-saves when the app goes to background or when switching profiles
  5. Store enforces a maximum of 5 child profiles per device
**Plans**: 3 plans
Plans:
- [x] 38-01-PLAN.md — ChildData types, hydrate/dehydrate helpers, grade-appropriate initialization
- [ ] 38-02-PLAN.md — ProfilesSlice, appStore restructure, v12->v13 migration
- [ ] 38-03-PLAN.md — Auto-save hook, conditional navigation, integration verification

### Phase 39: Profile Management UI
**Goal**: Parents can manage multiple child profiles and children can switch between them from the home screen
**Depends on**: Phase 38
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04
**Success Criteria** (what must be TRUE):
  1. Child can tap a profile switcher on the home screen and switch to a different child's profile
  2. Parent can add a new child profile with name, age, and grade level after entering the parental PIN
  3. Parent can edit an existing child profile's name, age, and grade level
  4. Parent can delete a child profile with a confirmation prompt
**Plans**: TBD

### Phase 40: Session History & Analytics Engine
**Goal**: The app collects session-level data and computes analytics that power the parent dashboard
**Depends on**: Phase 38
**Requirements**: DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. Every completed session appends a history entry with date, duration, problems attempted, accuracy, and skills practiced
  2. Session history is capped (200 entries per child) and persisted across app restarts
  3. Analytics service computes skill mastery trends over time from session history
  4. Analytics service computes per-session detail views from stored history entries
**Plans**: TBD

### Phase 41: Parent Dashboard
**Goal**: Parents can view their children's learning progress, misconceptions, and session history through a dedicated dashboard
**Depends on**: Phase 38, Phase 40
**Requirements**: DASH-01, DASH-02, DASH-05
**Success Criteria** (what must be TRUE):
  1. Parent can access the dashboard from the home screen after entering the parental PIN
  2. Parent can view a per-child progress overview showing mastery percentage, total sessions, current streak, and time spent
  3. Parent can view misconception analytics showing each child's specific reasoning errors with descriptions
  4. Parent can view trend graphs showing skill mastery and performance changes over time
  5. Parent can scroll through a session history list with per-session details (date, accuracy, duration, skills)
**Plans**: TBD

### Phase 42: Parental Time Controls
**Goal**: Parents can configure time boundaries to promote healthy practice habits per child
**Depends on**: Phase 41
**Requirements**: CTRL-01, CTRL-02, CTRL-03, CTRL-04
**Success Criteria** (what must be TRUE):
  1. Parent can set a daily session time cap per child from within the parent dashboard
  2. Parent can set a bedtime lockout window per child (e.g., 8pm-7am) that prevents starting new sessions
  3. App shows a break reminder after a configurable amount of continuous practice time
  4. When daily time cap is reached, the app prevents starting new sessions with a friendly message
**Plans**: TBD

### Phase 43: Freemium Subscription & IAP
**Goal**: The app monetizes through a freemium model with clear value tiers while keeping all purchase interactions behind parental gates
**Depends on**: Phase 42
**Requirements**: SUB-01, SUB-02, SUB-03, SUB-04, SUB-05, SUB-06
**Success Criteria** (what must be TRUE):
  1. App displays a paywall screen with a clear comparison of free vs premium tiers
  2. Free tier users can complete 3 practice sessions per day with the full adaptive engine (no AI tutor, limited themes)
  3. Premium tier users have unlimited sessions, AI tutor access, and all color themes
  4. User can restore previous purchases on reinstall or new device
  5. All purchase and subscription UI is accessible only after entering the parental PIN
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
| 26. Misconception Store & Recording | v0.6 | 2/2 | Complete | 2026-03-04 |
| 27. Confirmation Engine | v0.6 | 1/1 | Complete | 2026-03-04 |
| 28. Session Mix Adaptation | v0.6 | 1/1 | Complete | 2026-03-04 |
| 29. AI Tutor Misconception Context | v0.6 | 1/1 | Complete | 2026-03-04 |
| 30. Remediation Mini-Sessions | v0.6 | 2/2 | Complete | 2026-03-05 |
| 31. Pre-work -- Screen Refactoring | v0.7 | 1/1 | Complete | 2026-03-05 |
| 32. Achievement System Foundation | v0.7 | 2/2 | Complete | 2026-03-05 |
| 33. Badge UI & Session Integration | v0.7 | 3/3 | Complete | 2026-03-05 |
| 34. Visual Skill Map | v0.7 | 3/3 | Complete | 2026-03-05 |
| 35. Daily Challenges | v0.7 | 2/2 | Complete | 2026-03-05 |
| 36. Avatars & Frames | v0.7 | 2/2 | Complete | 2026-03-05 |
| 37. UI Themes | v0.7 | 4/4 | Complete | 2026-03-06 |
| 38. Multi-Child Store Foundation | 3/3 | Complete    | 2026-03-06 | - |
| 39. Profile Management UI | v0.8 | 0/? | Not started | - |
| 40. Session History & Analytics Engine | v0.8 | 0/? | Not started | - |
| 41. Parent Dashboard | v0.8 | 0/? | Not started | - |
| 42. Parental Time Controls | v0.8 | 0/? | Not started | - |
| 43. Freemium Subscription & IAP | v0.8 | 0/? | Not started | - |
