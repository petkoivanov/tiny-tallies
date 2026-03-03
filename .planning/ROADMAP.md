# Roadmap: Tiny Tallies

## Milestones

- ✅ **v0.1 Foundation** — Phases 1-6 (shipped 2026-03-03)
- 🚧 **v0.2 UI Polish & Gamification** — Phases 7-10 (in progress)

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

### v0.2 UI Polish & Gamification

- [x] **Phase 7: Gamification Engine** (2/2 plans) — completed 2026-03-02
- [ ] **Phase 8: Home Screen Dashboard** - Child profile display with level, XP progress bar, streak counter, and Start Practice button
- [ ] **Phase 9: Session & Results UI Polish** - Problem display layout, answer option styling, results screen refinement, 48dp touch targets, and dark theme consistency
- [ ] **Phase 10: Animated Feedback & Celebrations** - Reanimated-driven correct/incorrect answer animations and level-up celebration

## Phase Details

### Phase 7: Gamification Engine
**Goal**: Children earn meaningful, scaled rewards that track their progress across sessions
**Depends on**: Phase 6 (session flow commits XP)
**Requirements**: GAME-01, GAME-02, GAME-04
**Success Criteria** (what must be TRUE):
  1. Completing a correct answer awards XP scaled by the problem's Elo difficulty (harder problems earn more)
  2. XP accumulates toward the next level using the formula: XP needed = 100 + (level x 20)
  3. When enough XP is earned, the child's level increments automatically
  4. Weekly streak increments when a session is completed in a new calendar week, and resets if a full week is missed
**Plans**: 2 plans

Plans:
- [ ] 07-01-PLAN.md — Level progression service and XP-to-level integration into session commit
- [ ] 07-02-PLAN.md — Weekly streak service and streak integration into session commit

### Phase 8: Home Screen Dashboard
**Goal**: Children see their identity and progress the moment they open the app
**Depends on**: Phase 7 (gamification state available)
**Requirements**: UI-01, GAME-05
**Success Criteria** (what must be TRUE):
  1. Home screen displays the child's name prominently
  2. Home screen shows current level number and an XP progress bar toward the next level
  3. Home screen displays the current weekly streak count
  4. A large "Start Practice" button is the primary call-to-action
**Plans**: TBD

Plans:
- [ ] 08-01: Home screen dashboard layout with profile, XP bar, and streak display

### Phase 9: Session & Results UI Polish
**Goal**: The practice experience feels polished, readable, and physically comfortable for small hands
**Depends on**: Phase 7 (XP/level data for results display)
**Requirements**: UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Session screen displays the problem in large, clear Lexend typography with a visual progress indicator (e.g., step dots or progress bar)
  2. Answer option buttons are laid out in a clean grid with distinct pressed/selected states
  3. Results screen shows session summary with score, XP earned, and duration in a polished card layout
  4. Every interactive element across all screens meets the 48dp minimum touch target
  5. All screens use the high-contrast dark theme consistently with child-friendly color accents
**Plans**: TBD

Plans:
- [ ] 09-01: Session screen problem display and answer layout polish
- [ ] 09-02: Results screen polish and cross-screen touch target / theme audit

### Phase 10: Animated Feedback & Celebrations
**Goal**: Children receive delightful, immediate visual feedback that reinforces learning and rewards milestones
**Depends on**: Phase 8 (home screen shows level), Phase 9 (session screen styled)
**Requirements**: UI-06, GAME-03
**Success Criteria** (what must be TRUE):
  1. Correct answers trigger a celebration animation (e.g., bounce, sparkle, or confetti burst) with a positive color flash
  2. Incorrect answers trigger a gentle encouragement animation (e.g., soft shake or fade) without punitive tone
  3. Leveling up triggers a distinct, more prominent celebration animation visible to the child
**Plans**: TBD

Plans:
- [ ] 10-01: Correct/incorrect answer feedback animations
- [ ] 10-02: Level-up celebration animation

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
| 8. Home Screen Dashboard | v0.2 | 0/1 | Not started | - |
| 9. Session & Results UI Polish | v0.2 | 0/2 | Not started | - |
| 10. Animated Feedback & Celebrations | v0.2 | 0/2 | Not started | - |
