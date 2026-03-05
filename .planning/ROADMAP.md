# Roadmap: Tiny Tallies

## Milestones

- ✅ **v0.1 Foundation** — Phases 1-6 (shipped 2026-03-03)
- ✅ **v0.2 UI Polish & Gamification** — Phases 7-10 (shipped 2026-03-03)
- ✅ **v0.3 Adaptive Learning Engine** — Phases 11-14 (shipped 2026-03-03)
- ✅ **v0.4 Virtual Manipulatives** — Phases 15-20 (shipped 2026-03-04)
- ✅ **v0.5 AI Tutor** — Phases 21-25 (shipped 2026-03-04)
- ✅ **v0.6 Misconception Detection** — Phases 26-30 (shipped 2026-03-05)
- 🚧 **v0.7 Gamification** — Phases 31-37 (in progress)

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

### v0.7 Gamification (In Progress)

**Milestone Goal:** Deep gamification layer -- achievement badges, visual skill map, daily challenges, avatar customization, and unlockable themes -- building intrinsic motivation through progression and personalization.

- [x] **Phase 31: Pre-work -- Screen Refactoring** - Refactor SessionScreen below 500-line guardrail before adding gamification code (completed 2026-03-05)
- [x] **Phase 32: Achievement System Foundation** - Badge registry, evaluation engine, and store persistence (data layer) (completed 2026-03-05)
- [x] **Phase 33: Badge UI & Session Integration** - Badge display components, popup animations, and Results/Home screen wiring (completed 2026-03-05)
- [x] **Phase 34: Visual Skill Map** - Interactive DAG visualization of prerequisite skills with mastery states (completed 2026-03-05)
- [x] **Phase 35: Daily Challenges** - Date-seeded themed challenge sessions with bonus XP and non-punitive design (completed 2026-03-05)
- [x] **Phase 36: Avatars & Frames** - Expanded avatar pool with achievement-unlockable special avatars and frame decorations (completed 2026-03-05)
- [ ] **Phase 37: UI Themes** - Dynamic color theming with ThemeProvider, theme picker, and session cosmetic wrappers

## Phase Details

### Phase 31: Pre-work -- Screen Refactoring
**Goal**: SessionScreen is below the 500-line guardrail and ready for gamification additions
**Depends on**: Nothing (first phase in v0.7)
**Requirements**: PREP-01
**Success Criteria** (what must be TRUE):
  1. SessionScreen file is under 500 lines with no behavioral changes to existing functionality
  2. Extracted components and hooks are individually importable and tested
**Plans:** 1/1 plans complete

Plans:
- [ ] 31-01-PLAN.md -- Extract useChatOrchestration hook + SessionHeader component, refactor SessionScreen, update tests

### Phase 32: Achievement System Foundation
**Goal**: The badge data layer exists -- a static registry of badges, a pure-function evaluation engine, and persisted badge state in the store
**Depends on**: Phase 31
**Requirements**: ACHV-01, ACHV-02, ACHV-03
**Success Criteria** (what must be TRUE):
  1. Badge definitions catalog exists with categories (mastery, behavior, exploration, remediation) and typed unlock conditions
  2. Achievement evaluation engine takes a store state snapshot and returns newly-earned badge IDs without side effects
  3. Earned badges and badge progress persist across app restarts via store migration (STORE_VERSION bump)
**Plans:** 2/2 plans complete

Plans:
- [ ] 32-01-PLAN.md -- Badge types, static registry catalog (27 badges), and pure-function evaluation engine
- [ ] 32-02-PLAN.md -- Achievement store slice, gamificationSlice sessionsCompleted extension, appStore integration, v8-to-v9 migration

### Phase 33: Badge UI & Session Integration
**Goal**: Users see their badges -- earned badges display in a grid, new unlocks trigger celebration popups, and session results show what was earned
**Depends on**: Phase 32
**Requirements**: ACHV-04, ACHV-05, ACHV-06, ACHV-07, ACHV-08
**Success Criteria** (what must be TRUE):
  1. User earns mastery badges (skill mastered, category complete, grade complete) and behavior badges (streak milestones, session count, remediation victories) through normal play
  2. User sees a celebration popup animation when a new badge is unlocked after a session
  3. User can view a badge grid screen showing earned badges and locked badges with their unlock requirements
  4. Results screen displays all newly earned badges from the just-completed session
**Plans:** 3/3 plans complete

Plans:
- [ ] 33-01-PLAN.md -- Session integration wiring, navigation types, BadgeIcon component, and BADGE_EMOJIS map
- [ ] 33-02-PLAN.md -- BadgeUnlockPopup animation, BadgesSummary, ResultsScreen and HomeScreen integration
- [ ] 33-03-PLAN.md -- BadgeCollectionScreen with categorized grid, detail overlay, AppNavigator registration

### Phase 34: Visual Skill Map
**Goal**: Users can explore their learning progress as an interactive visual tree showing skill relationships and mastery states
**Depends on**: Phase 31 (reads existing skill/BKT data, independent of badge system)
**Requirements**: SMAP-01, SMAP-02, SMAP-03, SMAP-04
**Success Criteria** (what must be TRUE):
  1. User can navigate to a skill map screen showing the 14-skill prerequisite DAG as an interactive visual tree
  2. Each skill node visually reflects its state (locked/unlocked/in-progress/mastered) derived from BKT mastery data
  3. User can tap any skill node to see a detail overlay with mastery percentage, BKT probability, and Leitner box
  4. Nodes animate mastery fill progress, pulse on unlock events, and edges glow for the active learning path
**Plans:** 3/3 plans complete

Plans:
- [ ] 34-01-PLAN.md -- Types, layout computation, colors, navigation wiring, SkillMapScreen shell, HomeScreen entry point
- [ ] 34-02-PLAN.md -- SVG graph rendering (SkillMapNode, SkillMapEdge, SkillMapGraph), entrance animations, outer fringe pulse
- [ ] 34-03-PLAN.md -- SkillDetailOverlay modal with progress bar, stars, prerequisite checklist

### Phase 35: Daily Challenges
**Goal**: Users can play rotating daily challenge sessions with themed skill focus, bonus XP, and special badges -- fully offline, no penalty for skipping
**Depends on**: Phase 32 (challenge completion awards badges and bonus XP)
**Requirements**: CHAL-01, CHAL-02, CHAL-03, CHAL-04, CHAL-05, CHAL-06, CHAL-07
**Success Criteria** (what must be TRUE):
  1. Daily challenge system generates themed challenge sets (skill filter, goal type) that rotate via date-seeded PRNG with no backend
  2. User can play themed challenge sessions (e.g., Addition Adventure, Subtraction Sprint) from the home screen
  3. User can attempt streak/accuracy goals with bonus XP rewards and challenge-specific special badges on completion
  4. Home screen displays a daily challenge card showing today's challenge with progress
  5. Skipping or missing a challenge produces zero negative messaging and no penalty (non-punitive design)
**Plans:** 2/2 plans complete

Plans:
- [ ] 35-01-PLAN.md -- Challenge service (types, themes, date-seeded rotation, skill filtering), store slice with v10 migration, badge extension (4 challenge badges)
- [ ] 35-02-PLAN.md -- Session integration (SessionMode='challenge', useSession challenge branch, maxStreak), DailyChallengeCard, HomeScreen and ResultsScreen wiring

### Phase 36: Avatars & Frames
**Goal**: Users can personalize their avatar from an expanded pool and equip achievement-unlocked special avatars and decorative frames
**Depends on**: Phase 33 (avatars and frames unlock via earned badges)
**Requirements**: AVTR-01, AVTR-02, AVTR-03, AVTR-04
**Success Criteria** (what must be TRUE):
  1. User can choose from 12-15 avatar presets (expanded from current 8)
  2. User sees 4-7 special avatars and 5-7 decorative frames that are locked until specific badges are earned
  3. Updated avatar picker screen shows all presets alongside locked unlockable items with their badge requirements
  4. Equipped avatar and frame render correctly on the home screen and throughout the app
**Plans:** 2/2 plans complete

Plans:
- [ ] 36-01-PLAN.md -- Expand avatar constants (14 regular + 5 special + 6 frames), store migration v10->v11, AvatarCircle component, HomeScreen integration
- [ ] 36-02-PLAN.md -- AvatarPickerScreen with sectioned grid and live preview, CosmeticDetailOverlay, navigation wiring, BadgeUnlockPopup cosmetic text

### Phase 37: UI Themes
**Goal**: Users can personalize the app appearance with unlockable color themes and session cosmetic wrappers, all earned through achievements
**Depends on**: Phase 33 (themes unlock via earned badges)
**Requirements**: THME-01, THME-02, THME-03, THME-04, THME-05
**Success Criteria** (what must be TRUE):
  1. ThemeProvider with React Context delivers dynamic color values app-wide, replacing static color imports in themed screens
  2. User can select from 3-5 UI color themes (default dark, ocean, forest, sunset, space) with immediate visual preview
  3. Session cosmetic wrappers add themed context and art around math problems during play
  4. Theme picker screen allows preview, equip, and shows locked theme badge requirements
  5. Non-default themes are locked until the user earns the corresponding achievement badges
**Plans:** 4 plans

Plans:
- [ ] 37-01-PLAN.md -- Theme types, palettes, ThemeProvider, useTheme hook, theme cosmetics, store migration v12
- [ ] 37-02-PLAN.md -- Color migration: screens, App.tsx, AppNavigator, session/chat components (21 files)
- [ ] 37-03-PLAN.md -- Color migration: badges, avatars, home, animations, manipulatives, pictorial (26 files)
- [ ] 37-04-PLAN.md -- SessionWrapper with per-theme ambient animations, ThemePickerScreen with preview

## Progress

**Execution Order:**
Phases execute in numeric order: 31 -> 32 -> 33 -> 34 -> 35 -> 36 -> 37

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
| 33. Badge UI & Session Integration | 3/3 | Complete    | 2026-03-05 | - |
| 34. Visual Skill Map | 3/3 | Complete    | 2026-03-05 | - |
| 35. Daily Challenges | 2/2 | Complete    | 2026-03-05 | - |
| 36. Avatars & Frames | 2/2 | Complete    | 2026-03-05 | - |
| 37. UI Themes | v0.7 | 0/4 | Not started | - |
