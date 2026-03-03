# Roadmap: Tiny Tallies

## Overview

Tiny Tallies v0.1 Foundation delivers a working math practice app for children ages 6-9. The build progresses from project scaffolding through a programmatic math engine (addition/subtraction with Bug Library distractors), adaptive difficulty via Elo ratings, a structured session flow, child-friendly UI screens, and gamification. By the end of Phase 8, a child can launch the app, start an adaptive practice session, answer problems at their level, see animated feedback, earn XP and levels, and review their results.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Scaffolding & Navigation** - Expo 54 project setup, TypeScript strict, navigation shell, Zustand store skeleton (completed 2026-03-01)
- [x] **Phase 2: Math Engine Core** - Programmatic addition/subtraction generation with standards tagging and difficulty templates (completed 2026-03-02)
- [x] **Phase 3: Bug Library & Answer Formats** - Misconception-based distractor generation, multiple choice, and free input formats (completed 2026-03-02)
- [x] **Phase 4: State Management & Persistence** - Child profile, skill states, session state, and AsyncStorage persistence (completed 2026-03-02)
- [ ] **Phase 5: Adaptive Difficulty** - Elo rating system per skill targeting 85% success rate with frustration guard
- [ ] **Phase 6: Session Flow & Navigation Control** - Full session lifecycle (warmup/practice/cooldown) with navigation guards
- [ ] **Phase 7: Core UI Screens** - Home, session, and results screens with child-friendly design (48dp targets, dark theme)
- [ ] **Phase 8: Gamification & Feedback** - XP/level system, weekly streaks, animated celebrations, correct/incorrect feedback

## Phase Details

### Phase 1: Project Scaffolding & Navigation
**Goal**: A running Expo 54 app with TypeScript strict mode, navigation stack, and Zustand store skeleton ready for domain slices
**Depends on**: Nothing (first phase)
**Requirements**: STOR-05, NAV-01
**Success Criteria** (what must be TRUE):
  1. App launches on device/emulator without errors via `npx expo start`
  2. Navigation stack renders a Home screen and can push to placeholder Session and Results screens
  3. Zustand store is structured with empty domain slice pattern (child profile, skill states, session, gamification slots)
  4. TypeScript strict mode compiles with zero errors via `npm run typecheck`
  5. Jest test suite runs successfully with at least one passing test
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Theme constants, Zustand store skeleton with 4 domain slices, navigation types
- [ ] 01-02-PLAN.md — App.tsx root component, AppNavigator, 3 styled placeholder screens, store tests

### Phase 2: Math Engine Core
**Goal**: Engine programmatically generates addition and subtraction problems for grades 1-3 with correct answers, standards tags, and configurable difficulty
**Depends on**: Phase 1
**Requirements**: MATH-01, MATH-02, MATH-03, MATH-04, MATH-08
**Success Criteria** (what must be TRUE):
  1. Engine generates addition problems with configurable operand ranges (single-digit through 3-digit, with/without carry)
  2. Engine generates subtraction problems with configurable operand ranges (single-digit through 3-digit, with/without borrow)
  3. Every generated problem has a programmatically computed correct answer that is never delegated to an LLM
  4. Every problem is tagged to a specific Common Core standard (e.g., 1.OA.A.1, 2.NBT.B.5)
  5. Problem templates control difficulty via operand ranges, carry/borrow requirements, and digit count
**Plans**: TBD

Plans:
- [ ] 02-01-PLAN.md — Types, standards, skill taxonomy, seeded PRNG, carry/borrow constraints
- [ ] 02-02-PLAN.md — Addition/subtraction templates, generator function, Zod validation, barrel exports, tests

### Phase 3: Bug Library & Answer Formats
**Goal**: Problems include misconception-based distractors and support both multiple choice and free text input answer formats
**Depends on**: Phase 2
**Requirements**: MATH-05, MATH-06, MATH-07
**Success Criteria** (what must be TRUE):
  1. Distractors are generated from Bug Library patterns (no-carry error, smaller-from-larger, off-by-one, etc.) rather than random numbers
  2. Multiple choice format presents exactly 1 correct answer and 3 plausible distractors in shuffled order
  3. Free text input format accepts numeric keyboard input and validates against the computed correct answer
  4. Both answer formats work for addition and subtraction problems across all difficulty levels
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Bug Library types, 11 misconception compute functions, distractor validation, three-phase assembly algorithm, tests
- [ ] 03-02-PLAN.md — Answer format types, multiple choice formatter, free text parsing/validation, barrel exports, tests

### Phase 4: State Management & Persistence
**Goal**: App stores and persists child profile, per-skill tracking, and session state across restarts
**Depends on**: Phase 1
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04
**Success Criteria** (what must be TRUE):
  1. Child profile stores and displays name, age, grade, and avatar selection
  2. Skill states track per-skill Elo rating and attempt/correct counts
  3. Session state tracks current problem index, answers given, score, and XP earned during an active session
  4. All state survives app restart (kill and relaunch) via AsyncStorage
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Enrich slice types, avatar constants, lazy skill state helpers, profile completeness checker, tests
- [ ] 04-02-PLAN.md — Persist middleware with AsyncStorage, versioned migrations (v1->v2), partialize config, persistence integration tests

### Phase 5: Adaptive Difficulty
**Goal**: Problem selection adapts to the child's skill level using Elo ratings, converging on 85% success rate with a frustration safety net
**Depends on**: Phase 2, Phase 4
**Requirements**: ADPT-01, ADPT-02, ADPT-03, ADPT-04
**Success Criteria** (what must be TRUE):
  1. Each child has an Elo rating that updates after every problem attempt (increases on correct, decreases on incorrect)
  2. Elo is tracked independently per skill (e.g., addition-no-carry and subtraction-with-borrow have separate ratings)
  3. Problem selection picks problems within the child's Elo range such that over time the child gets roughly 85% correct
  4. After 3 consecutive wrong answers, the next problem is noticeably easier (frustration guard)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Session Flow & Navigation Control
**Goal**: Child can complete a full practice session (warmup, adaptive practice, cooldown) with proper navigation guards preventing accidental exit
**Depends on**: Phase 2, Phase 3, Phase 4, Phase 5
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. Child taps "Start Practice" on home screen and enters a session
  2. Session follows warmup (easy problems) then adaptive practice then cooldown (easy) structure
  3. Problems display one at a time with immediate correct/incorrect feedback after each answer
  4. Session ends with a summary screen showing correct/total, XP earned, and skills practiced
  5. Back button/gesture is disabled during active session; child can only exit via explicit "Quit" button with confirmation dialog
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Session orchestrator service, types, useSession hook with feedback timing and commit-on-complete
- [ ] 06-02-PLAN.md — SessionScreen with MC answers and navigation guards, ResultsScreen with summary, nav type updates

### Phase 7: Core UI Screens
**Goal**: Home, session, and results screens are fully styled with child-friendly design (48dp touch targets, high contrast dark theme, Lexend font)
**Depends on**: Phase 6
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Home screen shows child's name, current level, XP progress bar, and a prominent "Start Practice" button
  2. Session screen displays the current problem, answer options (multiple choice or free input), and a progress indicator
  3. Results screen shows session summary with correct/total, XP earned, and a "Done" button that returns to home
  4. All interactive elements have minimum 48dp touch targets suitable for ages 6-9 motor skills
  5. Dark theme with high contrast colors is applied consistently across all screens
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

### Phase 8: Gamification & Feedback
**Goal**: Children earn XP, level up, track weekly streaks, and see animated celebrations for correct answers, incorrect encouragement, and level-ups
**Depends on**: Phase 6, Phase 7
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, UI-06
**Success Criteria** (what must be TRUE):
  1. Child earns XP for each correct answer, scaled by problem difficulty (harder problems give more XP)
  2. XP accumulates toward levels using the formula: XP per level = 100 + (level x 20)
  3. Level-up triggers a visible celebration animation
  4. Weekly streak increments when the child completes at least one session in a calendar week
  5. Home screen displays current level, XP progress toward next level, and streak count
  6. Correct answers show a celebration animation; incorrect answers show gentle encouragement (not punitive)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD
- [ ] 08-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
Note: Phase 4 can begin in parallel with Phases 2-3 (no dependency on math engine).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding & Navigation | 2/2 | Complete | 2026-03-01 |
| 2. Math Engine Core | 2/2 | Complete | 2026-03-02 |
| 3. Bug Library & Answer Formats | 2/2 | Complete | 2026-03-02 |
| 4. State Management & Persistence | 2/2 | Complete | 2026-03-02 |
| 5. Adaptive Difficulty | 0/2 | Not started | - |
| 6. Session Flow & Navigation Control | 0/2 | Not started | - |
| 7. Core UI Screens | 0/3 | Not started | - |
| 8. Gamification & Feedback | 0/3 | Not started | - |
