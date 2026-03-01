# Tiny Tallies

## What This Is

An AI-powered math learning mobile app for children ages 6-9 (grades 1-3). Features adaptive daily practice sessions with programmatic problem generation, AI tutoring (Gemini for context/explanations only — never for computing math), virtual manipulatives, misconception detection via Bug Library pattern, spaced repetition (modified Leitner), and gamification. Sister product to Tiny Tales (children's storytelling app), sharing the same tech stack and patterns.

## Core Value

Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Programmatic math engine with curriculum-tagged problems (Common Core grades 1-3)
- [ ] Distractor generation from Bug Library (pre-computed wrong answers for known misconception patterns)
- [ ] Elo rating system for adaptive difficulty targeting 85% success rate
- [ ] Basic session flow (warmup → practice → cooldown)
- [ ] Problem display UI (question + multiple choice + free input)
- [ ] Zustand store with domain slices (child profile, skill states, session state)
- [ ] Basic XP and level system
- [ ] Navigation: Home → Session → Results
- [ ] Age-appropriate UI (48dp touch targets, high contrast dark theme, Lexend font)

### Out of Scope

- Classroom/teacher mode — future product expansion
- Multiple curricula beyond Common Core — reduce v1 scope, add later
- Ages outside 6-9 — clearest market gap, manageable content scope
- Platform expansion (web, iOS-specific) — mobile-first
- Advanced analytics/reporting — parent dashboard in later milestone
- Real-time multiplayer — COPPA complexity, defer
- Chat or social features with personal info — COPPA compliance

## Context

**Target audience:**
- Primary: Children ages 6-9 (grades 1-3)
- Secondary: Parents (dashboard, settings, subscription)
- Tertiary: Teachers (classroom mode, future)

**Architecture (planned):**
- Hybrid: Programmatic math engine + LLM (Gemini) for context wrapping only
- Modified Leitner spaced repetition with age-adjusted intervals (6 boxes, drop 2 on wrong)
- Elo rating system targeting 85% success rate
- Bayesian Knowledge Tracing (BKT) for mastery estimation per skill
- Bug Library pattern for misconception detection with 2-then-3 confirmation rule
- CPA progression (Concrete → Pictorial → Abstract)
- Three-mode AI tutor: TEACH / HINT (Socratic, never reveals answer) / BOOST

**Tech stack:**
- React Native 0.81.5 / Expo 54 / TypeScript 5.9 (strict mode)
- Zustand 5 for state management (domain slices pattern)
- React Navigation 7 native-stack
- react-native-gesture-handler + react-native-reanimated (manipulatives, 60fps)
- Gemini (@google/genai) for LLM tutoring layer
- Zod for runtime validation at system boundaries
- Jest + jest-expo + React Native Testing Library

**Research completed (13 documents in .planning/):**
Market research, curriculum standards (Common Core/Singapore/Russian/UK), AI tutoring engine design, virtual manipulatives specs, misconception detection patterns, spaced repetition algorithms, gamification design, onboarding/placement testing, child UX design, sound/audio design, math anxiety mitigation, COPPA privacy compliance, problem generation engine.

**Future milestones (post v0.1):**
- v0.2: BKT + spaced repetition + prerequisite graph
- v0.3: Virtual manipulatives (base-ten blocks, number lines, ten frames, fraction strips)
- v0.4: AI tutor integration (Gemini, three-mode, CPA progression)
- v0.5: Misconception detection system (Bug Library + interventions)
- v0.6: Gamification (coins, shop, weekly streaks, badges, skill map)
- v0.7: Social & subscription (family groups, parent dashboard, IAP)

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
| Hybrid architecture (programmatic + LLM) | LLMs unreliable at arithmetic; separation enables testing | — Pending |
| Gemini for LLM layer | Already integrated in Tiny Tales; good for context/explanations | — Pending |
| Modified Leitner (drop 2, not to Box 1) | Less punishing for children; maintains engagement | — Pending |
| Weekly streaks (not daily) | Research: daily streaks cause anxiety in children | — Pending |
| No hearts/lives/penalties | Punitive mechanics harm learning motivation | — Pending |
| Elo + BKT dual system | Elo for difficulty, BKT for mastery — complementary | — Pending |
| CPA progression | Research-backed (Singapore Math, NCTM recommended) | — Pending |
| Bug Library pattern | Identifies WHAT child misunderstands, not just THAT they're wrong | — Pending |
| Start Common Core only | Reduce scope; add curricula in later versions | — Pending |
| Ages 6-9 focus | Clearest market gap; manageable content scope | — Pending |

---
*Last updated: 2026-03-01 after GSD initialization*
