# Tiny Tallies — Project

## What This Is

An AI-powered math learning mobile app for children ages 6-9 (grades 1-3). Sister product to Tiny Tales (children's storytelling app). Features adaptive daily practice sessions with AI tutoring, virtual manipulatives, misconception detection, spaced repetition, and gamification.

## Core Value

**Personalized, AI-guided daily math practice** that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## Target Audience

- **Primary users:** Children ages 6-9 (grades 1-3)
- **Secondary users:** Parents (dashboard, settings, subscription)
- **Tertiary users:** Teachers (classroom mode, future)

## Current Milestone: v0.1 — Foundation

**Status:** Not started

### Key Goals
1. Project scaffolding and core architecture
2. Math problem engine (programmatic generation + validation)
3. Basic Elo rating system for adaptive difficulty
4. Core UI screens (session, problem display, results)
5. Zustand store with domain slices

## Current State

**Version:** v0.1 (Foundation) — in planning

**Tech Stack:**
- React Native 0.81.5 / Expo 54 / TypeScript 5.9 (strict)
- Zustand for state management (domain slices pattern)
- React Navigation 7 native-stack
- react-native-gesture-handler + react-native-reanimated (manipulatives)
- react-native-svg (number lines, fraction circles)
- Gemini (Google GenAI) for LLM tutoring layer
- Zod for runtime validation
- Jest + jest-expo for testing

**Architecture (Planned):**
- Programmatic math engine (never use LLM for computation)
- LLM for context wrapping + explanations only
- Modified Leitner spaced repetition with age-adjusted intervals
- Elo rating system targeting 85% success rate
- Bayesian Knowledge Tracing for mastery estimation
- Bug Library pattern for misconception detection
- CPA progression (Concrete → Pictorial → Abstract)
- Three-mode tutor: TEACH / HINT / BOOST

## Requirements

### Planned (v0.1 Foundation)
- [ ] Math problem engine with curriculum-tagged problems
- [ ] Elo rating system for adaptive difficulty
- [ ] Basic session flow (warmup → practice → cooldown)
- [ ] Problem display UI (question + multiple choice + free input)
- [ ] Zustand store: child profile, skill states, session state
- [ ] Basic XP and level system
- [ ] Navigation: Home → Session → Results

### Planned (v0.2 Intelligence)
- [ ] Bayesian Knowledge Tracing per skill
- [ ] Modified Leitner spaced repetition
- [ ] Prerequisite graph + outer fringe algorithm
- [ ] Session composition (60% review / 30% new / 10% challenge)
- [ ] Frustration detection (3 wrong in a row → easier problem)

### Planned (v0.3 Manipulatives)
- [ ] Base-ten blocks (drag, snap, group, ungroup)
- [ ] Number line (hop, zoom, fractions)
- [ ] Ten frame (fill, count)
- [ ] Counters (group, array)
- [ ] Fraction strips/circles

### Planned (v0.4 AI Tutor)
- [ ] Gemini integration for explanations
- [ ] Three-mode tutor (TEACH / HINT / BOOST)
- [ ] CPA progression with auto-advance
- [ ] Age-appropriate language guidelines
- [ ] Safety guardrails on LLM output

### Planned (v0.5 Misconception Detection)
- [ ] Bug library (addition + subtraction patterns)
- [ ] 2-then-3 confirmation rule
- [ ] Misconception-to-manipulative mapping
- [ ] Targeted intervention scheduling

### Planned (v0.6 Gamification)
- [ ] Coins, shop, cosmetics
- [ ] Weekly streaks
- [ ] Achievement badges
- [ ] Progress visualization (skill map)
- [ ] Daily summary screen

### Planned (v0.7 Social & Subscription)
- [ ] Family groups
- [ ] Cooperative challenges
- [ ] Parent dashboard
- [ ] Subscription tiers
- [ ] Apple/Google Sign-In (reuse from Tiny Tales)

### Out of Scope (v1.0+)
- Classroom/teacher mode
- Multiple curricula (start with Common Core, add others later)
- Ages outside 6-9
- Platform expansion (web, iOS-specific features)
- Advanced analytics/reporting

## Research Documents

All research is saved in `.planning/`:
- [01-market-research.md](.planning/01-market-research.md) — Competitor analysis, market gaps, pricing
- [02-curriculum-standards.md](.planning/02-curriculum-standards.md) — Common Core, Russian, Singapore, UK curricula
- [03-ai-tutoring-engine.md](.planning/03-ai-tutoring-engine.md) — Hybrid architecture, three-mode tutor, prompts
- [04-virtual-manipulatives.md](.planning/04-virtual-manipulatives.md) — Blocks, number lines, fractions, interactions
- [05-misconception-detection.md](.planning/05-misconception-detection.md) — Bug library, confirmation rules
- [06-spaced-repetition.md](.planning/06-spaced-repetition.md) — Leitner, BKT, Elo, session design
- [07-gamification.md](.planning/07-gamification.md) — XP, coins, streaks, badges, COPPA compliance
- [08-onboarding-placement.md](.planning/08-onboarding-placement.md) — Onboarding flow, CAT-based diagnostic placement, cold start calibration
- [09-child-ux-design.md](.planning/09-child-ux-design.md) — Touch targets, visual design, cognitive development, accessibility
- [10-sound-audio-design.md](.planning/10-sound-audio-design.md) — Audio categories, feedback sounds, background music, TTS, haptics
- [11-math-anxiety.md](.planning/11-math-anxiety.md) — Detection signals, mitigation strategies, growth mindset integration
- [12-coppa-privacy.md](.planning/12-coppa-privacy.md) — COPPA 2025 amendments, VPC methods, data minimization, GDPR-K overlap
- [13-problem-generation.md](.planning/13-problem-generation.md) — Template system, difficulty calibration, distractor generation, session composition

## Constraints

- **Shared tech stack** with Tiny Tales (same Expo SDK, same patterns)
- **Files under 500 lines** — refactor into focused modules
- **Programmatic math engine** — LLM never computes answers
- **COPPA compliant** — no chat, no personal info sharing, verifiable parental consent
- **Offline-capable** — core practice should work without internet (AI tutoring needs connection)
- **85% success target** — adaptive difficulty must converge to this rate

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Hybrid architecture (programmatic + LLM) | LLMs unreliable at arithmetic; separation enables testing |
| Gemini for LLM layer | Already integrated in Tiny Tales; good for context/explanations |
| Modified Leitner (drop 2, not to Box 1) | Less punishing for children; maintains engagement |
| Weekly streaks (not daily) | Research: daily streaks cause anxiety in children |
| No hearts/lives/penalties | Punitive mechanics harm learning motivation |
| Elo + BKT dual system | Elo for difficulty, BKT for mastery — complementary |
| CPA progression | Research-backed (Singapore Math, NCTM recommended) |
| Bug Library pattern | Identifies WHAT child misunderstands, not just THAT they're wrong |
| Start Common Core only | Reduce scope; add curricula in later versions |
| Ages 6-9 focus | Clearest market gap; manageable content scope |

---
*Created: 2026-02-28*
