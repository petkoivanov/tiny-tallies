# Tiny Tallies

## What This Is

An AI-powered math learning mobile app for children ages 6-9 (grades 1-3). Features adaptive daily practice sessions with programmatic problem generation, misconception-based distractors via Bug Library pattern, Elo-based adaptive difficulty, gamification (XP/levels/streaks), polished UI with animated feedback, a full adaptive learning engine (BKT, Leitner spaced repetition, prerequisite graph, smart session orchestration), six interactive virtual manipulatives with CPA progression (Concrete → Pictorial → Abstract), and an on-demand AI tutor powered by Gemini that provides Socratic hints, CPA-aware teaching with manipulative integration, and deep scaffolding — auto-escalating support based on struggle level with full COPPA-compliant safety pipeline. Sister product to Tiny Tales (children's storytelling app), sharing the same tech stack and patterns.

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
- ✓ Bayesian Knowledge Tracing (BKT) for mastery estimation per skill — v0.3
- ✓ Modified Leitner spaced repetition with 6 boxes and age-adjusted intervals — v0.3
- ✓ Prerequisite skill graph (DAG) with outer fringe algorithm — v0.3
- ✓ Smart session mix: 60% review / 30% new / 10% challenge — v0.3
- ✓ BKT-driven mastery thresholds (≥0.95 mastered, <0.40 needs re-teaching) — v0.3
- ✓ All 6 virtual manipulatives with drag-and-drop, snap-to-zone, haptic feedback — v0.4
- ✓ CPA progression system (Concrete → Pictorial → Abstract) driven by BKT mastery — v0.4
- ✓ Session-embedded manipulative panel with auto-expand in concrete mode — v0.4
- ✓ Per-manipulative sandbox screens for free exploration — v0.4
- ✓ Guided mode highlighting, undo support, counter grid mode, double ten frame — v0.4
- ✓ Gemini LLM integration with lazy client, rate limiting, AbortController lifecycle — v0.5
- ✓ Multi-layer safety pipeline (consent → PII scrub → safety filters → answer-leak → content validation → fallbacks) — v0.5
- ✓ Chat bubble UI with HelpButton, ChatPanel, ResponseButtons, per-problem reset, offline handling — v0.5
- ✓ Three-mode auto-escalation tutor: HINT → TEACH (CPA + manipulatives) → BOOST — v0.5
- ✓ Bug Library misconception-informed tutor explanations — v0.5
- ✓ Parental consent gate with PIN verification for COPPA compliance — v0.5

### Active

(None — planning next milestone)

### Out of Scope

- Classroom/teacher mode — future product expansion
- Multiple curricula beyond Common Core — reduce scope, add later
- Ages outside 6-9 — clearest market gap, manageable content scope
- Platform expansion (web, iOS-specific) — mobile-first
- Advanced analytics/reporting — parent dashboard in later milestone
- Real-time multiplayer — COPPA complexity, defer
- Chat or social features with personal info — COPPA compliance
- Free text input UI — architecture supports it, deferred to post-v0.1

## Context

**Current state:** Shipped v0.5 AI Tutor with ~29,092 LOC TypeScript. 1,051 tests passing. Full adaptive learning pipeline + 6 interactive virtual manipulatives with CPA progression + on-demand AI tutor with three-mode auto-escalation (HINT/TEACH/BOOST), Gemini LLM backend, multi-layer safety pipeline, and COPPA-compliant parental consent gate.

**Architecture (implemented through v0.4):**
- Programmatic math engine: 14 skills across addition/subtraction (Common Core grades 1-3)
- Bug Library: 11 misconception patterns with three-phase distractor assembly
- Elo rating system with variable K-factor (K=40 at start, decaying toward K=16)
- Gaussian-weighted problem selection targeting 85% success rate
- Frustration guard (3 consecutive wrong → easier problem)
- Session orchestrator: 15-problem queue (3 warmup + 9 practice + 3 cooldown) with 60/30/10 review/new/challenge mix
- Zustand persist with versioned migrations (STORE_VERSION=5) and AsyncStorage
- 6 virtual manipulatives (Counters, TenFrame, NumberLine, BaseTenBlocks, FractionStrips, BarModel) with 60fps drag primitives
- CPA progression: BKT-driven concrete/pictorial/abstract stage tracking with one-way advancement
- ManipulativePanel animated drawer for session-embedded concrete mode; PictorialDiagram SVG renderers for pictorial mode
- Sandbox free-play screens for all 6 manipulatives with explore grid on home screen
- Guided mode highlighting (GuidedHighlight + guidedSteps service), 10-step undo (useActionHistory), counter grid mode, double ten frame
- XP/level progression, weekly streaks, animated feedback and confetti celebrations
- Bayesian Knowledge Tracing with age-adjusted parameters (3 age brackets)
- Leitner 6-box spaced repetition with age-adjusted intervals and BKT-informed initial placement
- Prerequisite skill DAG with BKT-mastery gating and outer fringe algorithm
- Practice mix: BKT-weighted selection, fallback cascade, constrained shuffle (no adjacent challenges, review-first)

**Architecture (implemented in v0.5):**
- Gemini LLM integration: lazy singleton client, 8s timeout, AbortController lifecycle
- Three-mode AI tutor: HINT (Socratic) → TEACH (CPA-aware + manipulatives) → BOOST (scaffolding + answer reveal)
- Auto-escalation state machine: hintCount/wrongAnswerCount thresholds, per-problem reset
- Safety pipeline: consent gate → PII scrubbing → Gemini safety filters → answer-leak detection → content validation → canned fallbacks
- Chat UI: HelpButton, ChatPanel bottom sheet, pre-defined ResponseButtons, per-problem reset, offline handling
- Rate limiting: 3/problem, 20/session, 50/day configurable thresholds
- COPPA: parental PIN consent gate via expo-secure-store, no child PII sent to LLM

**Architecture (planned, future milestones):**
- Misconception detection system with Bug Library interventions (2-then-3 confirmation)

**Tech stack:**
- React Native 0.81.5 / Expo 54 / TypeScript 5.9 (strict mode)
- Zustand 5 for state management (domain slices pattern)
- React Navigation 7 native-stack
- react-native-gesture-handler + react-native-reanimated (manipulatives, 60fps)
- Gemini (@google/genai v1.43.0) for LLM tutoring layer
- Zod for runtime validation at system boundaries
- Jest + jest-expo + React Native Testing Library

**Research completed (13 documents in .planning/):**
Market research, curriculum standards (Common Core/Singapore/Russian/UK), AI tutoring engine design, virtual manipulatives specs, misconception detection patterns, spaced repetition algorithms, gamification design, onboarding/placement testing, child UX design, sound/audio design, math anxiety mitigation, COPPA privacy compliance, problem generation engine.

**Future milestones:**
- v0.6: Misconception detection system (Bug Library + interventions, 2-then-3 confirmation)
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
| Hybrid architecture (programmatic + LLM) | LLMs unreliable at arithmetic; separation enables testing | ✓ Good — math engine works perfectly, 557 tests |
| Zustand domain slices pattern | Clean separation of concerns, composable store | ✓ Good — 4 slices, clean boundaries |
| Mulberry32 seeded PRNG | 15-line implementation, no external dependency | ✓ Good — deterministic tests, reproducible problems |
| Bug Library pattern | Identifies WHAT child misunderstands, not just THAT they're wrong | ✓ Good — 11 patterns, three-phase assembly |
| Elo with variable K-factor | K=40 at start decaying to K=16, faster initial convergence | ✓ Good — smooth difficulty adaptation |
| Gaussian-weighted problem selection | Sharp sigma=0.10 targets 85% success with variety | ✓ Good — balanced difficulty |
| Pre-generated session queue | Accept minor Elo drift, simpler architecture | ✓ Good — clean session lifecycle |
| Commit-on-complete pattern | Elo/XP accumulate in refs, atomic commit only on finish | ✓ Good — quit discards cleanly |
| usePreventRemove for nav guard | React Navigation 7 recommended approach | ✓ Good — dual guard (hook + gestureEnabled) |
| Route params for Results data | Avoids timing issues with store clearing | ✓ Good — reliable data passing |
| Weekly streaks (not daily) | Research: daily streaks cause anxiety in children | ✓ Good — non-punitive engagement |
| No hearts/lives/penalties | Punitive mechanics harm learning motivation | ✓ Good — intrinsic motivation maintained |
| BKT age-adjusted parameters | 3 brackets (6-7, 7-8, 8-9) with research-backed rates | ✓ Good — age-appropriate mastery tracking |
| Soft mastery lock (3 consecutive wrong to break) | Protects against single slips; stable mastery | ✓ Good — prevents oscillation |
| BKT-informed Leitner placement | v3→v4 migration uses P(L) for initial box, not all Box 1 | ✓ Good — existing progress respected |
| Leitner drop 2 boxes (not to Box 1) | Less punishing for children; maintains engagement | ✓ Good — research-backed |
| BKT-mastery gating (replaces Elo threshold) | True mastery, not just difficulty proxies | ✓ Good — pedagogically sound |
| No-re-locking policy | Practiced skills stay unlocked even if prereq mastery lost | ✓ Good — avoids frustration |
| 60/30/10 practice mix | Review/new/challenge with fallback cascade | ✓ Good — structured sessions |
| Gemini for LLM layer | Already integrated in Tiny Tales; good for context/explanations | ✓ Good — lazy singleton, non-streaming, 8s timeout |
| CPA progression | Research-backed (Singapore Math, NCTM recommended) | ✓ Good — BKT-driven 3-stage with one-way advance |
| Start Common Core only | Reduce scope; add curricula in later versions | ✓ Good — 14 skills implemented |
| Ages 6-9 focus | Clearest market gap; manageable content scope | ✓ Good — grade 1-3 content complete |

| 60fps drag primitives on UI thread | Reanimated worklets for snap math, no JS bridge lag | ✓ Good — smooth interaction, all 6 manipulatives |
| Ephemeral manipulative state | Component-local useState, never persisted to store | ✓ Good — clean sandbox, no store bloat |
| ManipulativePanel (in-screen, not Modal) | Avoids gesture conflicts with manipulatives inside panel | ✓ Good — collapsible overlay works cleanly |
| Ephemeral tutorSlice (not persisted) | Chat state is session-scoped, no migration needed | ✓ Good — clean lifecycle, STORE_VERSION unchanged for tutor |
| Multi-layer safety pipeline | Defense-in-depth: consent → PII → filters → leak → validate → fallback | ✓ Good — 6 layers, never leaks answers |
| Pre-defined ResponseButtons (no free text) | Ages 6-7 can't type; eliminates prompt injection surface | ✓ Good — 3 fixed responses per mode |
| Auto-escalation state machine | Pure function thresholds (hint≥2+wrong≥1 → TEACH, wrong≥3 → BOOST) | ✓ Good — predictable, testable |
| BoostPromptParams type-safe answer isolation | Only BOOST mode type contains correctAnswer field | ✓ Good — TypeScript prevents accidental answer exposure |
| Parental PIN consent gate | COPPA VPC requirement; PIN via expo-secure-store | ✓ Good — persists across restarts, swipe-back prevention |
| Non-streaming Gemini calls | Simpler implementation, streaming deferred to future | ✓ Good — stable primary path for v0.5 |

---
*Last updated: 2026-03-04 after v0.5 milestone*
