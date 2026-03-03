# Roadmap: Tiny Tallies

## Milestones

- ✅ **v0.1 Foundation** — Phases 1-6 (shipped 2026-03-03)
- ✅ **v0.2 UI Polish & Gamification** — Phases 7-10 (shipped 2026-03-03)
- ✅ **v0.3 Adaptive Learning Engine** — Phases 11-14 (shipped 2026-03-03)
- 🚧 **v0.4 Virtual Manipulatives** — Phases 15-20 (in progress)

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

### 🚧 v0.4 Virtual Manipulatives (In Progress)

**Milestone Goal:** Deliver six interactive virtual manipulatives with CPA progression, session-embedded visual aids, and standalone sandbox exploration -- making abstract math concepts tangible through direct manipulation at 60fps.

- [x] **Phase 15: Foundation -- Store Schema, Services, and Mappings** - CPA tracking per skill, manipulative-to-skill mapping, and babel config for Reanimated 4 (completed 2026-03-03)
- [x] **Phase 16: Shared Drag Primitives** - Reusable DraggableItem, SnapZone, and interaction patterns that all manipulatives build on (completed 2026-03-03)
- [x] **Phase 17: Manipulative Components** - All 6 manipulatives as standalone interactive components (base-ten blocks, number line, ten frames, counters, fraction strips, bar models) (completed 2026-03-03)
- [ ] **Phase 18: CPA Progression and Session Integration** - BKT-driven concrete/pictorial/abstract rendering and session-embedded manipulative overlay
- [ ] **Phase 19: Sandbox Navigation** - Per-manipulative free exploration screens accessible from home
- [ ] **Phase 20: Polish** - Guided mode, undo, array grid counters, and double ten frame

## Phase Details

### Phase 15: Foundation -- Store Schema, Services, and Mappings
**Goal**: The system can track CPA stage per skill, determine which manipulative suits each math concept, and compile Reanimated 4 worklet code
**Depends on**: Phase 14 (v0.3 complete)
**Requirements**: FOUND-01, FOUND-02, FOUND-04, CPA-01
**Success Criteria** (what must be TRUE):
  1. Store schema includes cpaLevel per skill with migration from STORE_VERSION 4 to 5 that initializes existing skills to concrete
  2. Given a skill ID, the system returns the appropriate manipulative type(s) for that concept
  3. CPA stage for a skill is derived from BKT mastery: P(L) < 0.40 = concrete, 0.40-0.85 = pictorial, >= 0.85 = abstract
  4. Reanimated 4 worklet code compiles and runs without babel errors
**Plans**: 2 plans

Plans:
- [x] 15-01-PLAN.md — CPA types, service, skill-manipulative mapping, and babel config fix
- [x] 15-02-PLAN.md — Store schema v4->v5 migration and commitSessionResults CPA integration

### Phase 16: Shared Drag Primitives
**Goal**: A reusable set of drag-and-drop primitives that run snap logic on the UI thread at 60fps, providing the interaction foundation for all 6 manipulatives
**Depends on**: Phase 15
**Requirements**: FOUND-03, MANIP-08, MANIP-09, MANIP-10, MANIP-11
**Success Criteria** (what must be TRUE):
  1. User can drag an item and it snaps to valid zones with spring animation at 60fps (no JS thread lag)
  2. User can tap to add or remove pieces as an alternative to dragging, with 48dp touch targets
  3. User can reset any manipulative to its starting state via a reset action
  4. User receives haptic feedback when items snap or group
  5. A running count/value display updates on drop events (not during active drag)
**Plans**: 2 plans

Plans:
- [x] 16-01-PLAN.md — Types, snap math worklets, animation config, haptics, jest mocks, and GestureHandlerRootView
- [x] 16-02-PLAN.md — DraggableItem, SnapZone, and AnimatedCounter interactive components

### Phase 17: Manipulative Components
**Goal**: All six virtual manipulatives are fully interactive standalone components that children can directly manipulate to explore math concepts
**Depends on**: Phase 16
**Requirements**: MANIP-01, MANIP-02, MANIP-03, MANIP-04, MANIP-05, MANIP-06, MANIP-07
**Success Criteria** (what must be TRUE):
  1. User can drag base-ten blocks (ones, tens, hundreds) onto a place-value mat, auto-group 10 cubes into a rod, and tap a rod to decompose
  2. User can drag a marker along a number line and see hop arrows with labeled values
  3. User can place counters on a ten frame with snap-to-cell behavior and use two-color mode for comparison
  4. User can shade fraction strip sections and compare fractions by stacking strips vertically
  5. User can create bar model part-whole layouts with labeled sections and a "?" placeholder
**Plans**: 4 plans

Plans:
- [ ] 17-01-PLAN.md — ManipulativeShell wrapper, Counters (two-color flip), and TenFrame (snap grid)
- [ ] 17-02-PLAN.md — NumberLine (SVG + hop arrows) and FractionStrips (tap-to-shade + stacking)
- [ ] 17-03-PLAN.md — BarModel (draggable dividers + NumberPicker wheel)
- [ ] 17-04-PLAN.md — BaseTenBlocks (auto-group/decompose choreography + place-value mat)

### Phase 18: CPA Progression and Session Integration
**Goal**: Practice sessions automatically show the right representation (concrete manipulative, pictorial diagram, or abstract numbers) based on the child's mastery of each skill, with an embedded manipulative overlay for hands-on problem solving
**Depends on**: Phase 15, Phase 17
**Requirements**: CPA-02, CPA-03, CPA-04, CPA-05, SESS-01, SESS-02, SESS-03
**Success Criteria** (what must be TRUE):
  1. User sees interactive manipulatives during practice when their skill mastery is low (concrete mode)
  2. User sees static visual representations during practice when their skill mastery is moderate (pictorial mode)
  3. User sees numbers only during practice when their skill mastery is high (abstract mode)
  4. User can expand and collapse a contextually-selected manipulative overlay during any practice problem
  5. CPA stage advances automatically after a practice session completes based on updated BKT mastery
**Plans**: TBD

Plans:
- [ ] 18-01: TBD
- [ ] 18-02: TBD

### Phase 19: Sandbox Navigation
**Goal**: Children can freely explore any manipulative without problem constraints, accessible from the home screen
**Depends on**: Phase 17
**Requirements**: SAND-01, SAND-02, SAND-03
**Success Criteria** (what must be TRUE):
  1. User can navigate to a per-manipulative sandbox screen from the home screen
  2. User can freely interact with each manipulative without time limits, scoring, or problem prompts
  3. Sandbox state is ephemeral and does not persist across app restarts
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

### Phase 20: Polish
**Goal**: Enhanced manipulative interactions with guided hints, undo capability, and extended modes for multiplication and addition-within-20
**Depends on**: Phase 17, Phase 18
**Requirements**: POL-01, POL-02, POL-03, POL-04
**Success Criteria** (what must be TRUE):
  1. User sees guided mode highlighting the next suggested action on a manipulative
  2. User can undo the last action on a manipulative (up to 10 steps)
  3. User can switch counters to array grid mode for multiplication concepts
  4. Ten frame auto-spawns a second frame when working on add-within-20 problems
**Plans**: TBD

Plans:
- [ ] 20-01: TBD
- [ ] 20-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 15 -> 16 -> 17 -> 18 -> 19 -> 20
(Phase 19 can run after 17, in parallel with 18)

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
| 17. Manipulative Components | 4/4 | Complete   | 2026-03-03 | - |
| 18. CPA Progression and Session Integration | v0.4 | 0/2 | Not started | - |
| 19. Sandbox Navigation | v0.4 | 0/1 | Not started | - |
| 20. Polish | v0.4 | 0/2 | Not started | - |
