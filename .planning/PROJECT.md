# Tiny Tallies

## What This Is

An AI-powered math learning mobile app for children ages 6-9 (grades 1-3). Features adaptive daily practice sessions with programmatic problem generation, misconception-based distractors via Bug Library pattern, Elo-based adaptive difficulty, and a structured session flow (warmup/practice/cooldown). Sister product to Tiny Tales (children's storytelling app), sharing the same tech stack and patterns.

## Core Value

Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## Requirements

### Validated

- ✓ Programmatic math engine with curriculum-tagged problems (Common Core grades 1-3) — v0.1
- ✓ Distractor generation from Bug Library (pre-computed wrong answers for known misconception patterns) — v0.1
- ✓ Elo rating system for adaptive difficulty targeting 85% success rate — v0.1
- ✓ Basic session flow (warmup → practice → cooldown) — v0.1
- ✓ Zustand store with domain slices (child profile, skill states, session state) — v0.1
- ✓ Navigation: Home → Session → Results with back-prevention guards — v0.1
- ✓ Problem display UI polish (48dp touch targets, high contrast dark theme, Lexend font) — v0.2
- ✓ Basic XP and level system with celebration animations — v0.2
- ✓ Weekly streak tracking — v0.2
- ✓ Home screen with level/XP/streak display — v0.2
- ✓ Animated feedback for correct/incorrect answers — v0.2

### Active

- [ ] Bayesian Knowledge Tracing (BKT) for mastery estimation per skill
- [ ] Modified Leitner spaced repetition with 6 boxes and age-adjusted intervals
- [ ] Prerequisite skill graph (DAG) with outer fringe algorithm
- [ ] Smart session mix: 60% review / 30% new / 10% challenge
- [ ] BKT-driven mastery thresholds (≥0.95 mastered, <0.40 needs re-teaching)

### Out of Scope

- Classroom/teacher mode — future product expansion
- Multiple curricula beyond Common Core — reduce scope, add later
- Ages outside 6-9 — clearest market gap, manageable content scope
- Platform expansion (web, iOS-specific) — mobile-first
- Advanced analytics/reporting — parent dashboard in later milestone
- Real-time multiplayer — COPPA complexity, defer
- Chat or social features with personal info — COPPA compliance
- Free text input UI — architecture supports it, deferred to post-v0.1

## Current Milestone: v0.3 Adaptive Learning Engine

**Goal:** Build the adaptive learning backbone — BKT mastery estimation, Leitner spaced repetition, and prerequisite skill graph — so sessions become pedagogically structured with smart problem selection.

**Target features:**
- Bayesian Knowledge Tracing (BKT) for mastery estimation per skill
- Modified Leitner spaced repetition with 6 boxes and age-adjusted intervals
- Prerequisite skill graph (DAG) with outer fringe algorithm
- Smart session mix: 60% review / 30% new / 10% challenge
- BKT-driven mastery thresholds (≥0.95 mastered, <0.40 needs re-teaching)

## Context

**Current state:** Shipped v0.1 Foundation with 6,799 LOC TypeScript across 113 files. 336 tests passing. Full functional session flow operational — child can start a session, answer 15 adaptive problems (3 warmup + 9 practice + 3 cooldown), see feedback, and view results with score/XP/duration.

**Architecture (implemented v0.1):**
- Programmatic math engine: 14 skills across addition/subtraction (Common Core grades 1-3)
- Bug Library: 11 misconception patterns with three-phase distractor assembly
- Elo rating system with variable K-factor (K=40 at start, decaying toward K=16)
- Gaussian-weighted problem selection targeting 85% success rate
- Frustration guard (3 consecutive wrong → easier problem)
- Session orchestrator: pre-generated 15-problem queue with commit-on-complete pattern
- Zustand persist with versioned migrations and AsyncStorage

**Architecture (planned, future milestones):**
- Hybrid: Programmatic math engine + LLM (Gemini) for context wrapping only
- Bayesian Knowledge Tracing (BKT) for mastery estimation per skill
- Modified Leitner spaced repetition with age-adjusted intervals (6 boxes, drop 2 on wrong)
- CPA progression (Concrete → Pictorial → Abstract)
- Three-mode AI tutor: TEACH / HINT (Socratic, never reveals answer) / BOOST
- Virtual manipulatives (base-ten blocks, number lines, ten frames, fraction strips)

**Tech stack:**
- React Native 0.81.5 / Expo 54 / TypeScript 5.9 (strict mode)
- Zustand 5 for state management (domain slices pattern)
- React Navigation 7 native-stack
- react-native-gesture-handler + react-native-reanimated (manipulatives, 60fps)
- Gemini (@google/genai) for LLM tutoring layer (future)
- Zod for runtime validation at system boundaries
- Jest + jest-expo + React Native Testing Library

**Research completed (13 documents in .planning/):**
Market research, curriculum standards (Common Core/Singapore/Russian/UK), AI tutoring engine design, virtual manipulatives specs, misconception detection patterns, spaced repetition algorithms, gamification design, onboarding/placement testing, child UX design, sound/audio design, math anxiety mitigation, COPPA privacy compliance, problem generation engine.

**Future milestones:**
- v0.2: Core UI polish + gamification (XP/levels, streaks, animations) — SHIPPED
- v0.3: BKT + spaced repetition + prerequisite graph (CURRENT)
- v0.4: Virtual manipulatives (base-ten blocks, number lines, ten frames, fraction strips)
- v0.5: AI tutor integration (Gemini, three-mode, CPA progression)
- v0.6: Misconception detection system (Bug Library + interventions)
- v0.7: Extended gamification (coins, shop, badges, skill map)
- v0.8: Social & subscription (family groups, parent dashboard, IAP)

## Constraints

- **Shared stack**: Must align with Tiny Tales (same Expo SDK 54, same patterns)
- **File size**: Files under 500 lines — refactor into focused modules with barrel exports
- **Math computation**: LLM must NEVER compute math answers — programmatic engine only
- **LLM hints**: Must NEVER reveal the answer — Socratic questioning only
- **COPPA**: No chat, no personal info sharing, verifiable parental consent required
- **Offline**: Core practice works without internet (AI tutoring needs connection)
- **Accessibility**: 48dp touch targets, dyslexia-friendly fonts, no flashing
- **No punitive mechanics**: No hearts, lives, game over — intrinsic motivation only
- **FlashList**: v1.x only — v2.x requires new architecture, crashes on RN 0.81

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid architecture (programmatic + LLM) | LLMs unreliable at arithmetic; separation enables testing | ✓ Good — math engine works perfectly, 336 tests |
| Zustand domain slices pattern | Clean separation of concerns, composable store | ✓ Good — 4 slices, clean boundaries |
| Mulberry32 seeded PRNG | 15-line implementation, no external dependency | ✓ Good — deterministic tests, reproducible problems |
| Bug Library pattern | Identifies WHAT child misunderstands, not just THAT they're wrong | ✓ Good — 11 patterns, three-phase assembly |
| Elo with variable K-factor | K=40 at start decaying to K=16, faster initial convergence | ✓ Good — smooth difficulty adaptation |
| Gaussian-weighted problem selection | Sharp sigma=0.10 targets 85% success with variety | ✓ Good — balanced difficulty |
| Pre-generated session queue | Accept minor Elo drift, simpler architecture | ✓ Good — clean session lifecycle |
| Commit-on-complete pattern | Elo/XP accumulate in refs, atomic commit only on finish | ✓ Good — quit discards cleanly |
| usePreventRemove for nav guard | React Navigation 7 recommended approach | ✓ Good — dual guard (hook + gestureEnabled) |
| Route params for Results data | Avoids timing issues with store clearing | ✓ Good — reliable data passing |
| Gemini for LLM layer | Already integrated in Tiny Tales; good for context/explanations | — Pending |
| Modified Leitner (drop 2, not to Box 1) | Less punishing for children; maintains engagement | — Pending |
| Weekly streaks (not daily) | Research: daily streaks cause anxiety in children | — Pending |
| No hearts/lives/penalties | Punitive mechanics harm learning motivation | — Pending |
| CPA progression | Research-backed (Singapore Math, NCTM recommended) | — Pending |
| Start Common Core only | Reduce scope; add curricula in later versions | ✓ Good — 14 skills implemented |
| Ages 6-9 focus | Clearest market gap; manageable content scope | ✓ Good — grade 1-3 content complete |

---
*Last updated: 2026-03-03 after v0.3 milestone start*
