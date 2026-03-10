# Tiny Tallies

## What This Is

An AI-powered math learning mobile app for children ages 6-9+ (grades 1-8). Features adaptive daily practice sessions with programmatic problem generation across 16 math domains (addition, subtraction, multiplication, division, fractions, place value, time, money, patterns, measurement, ratios, exponents, expressions, decimals, integers, geometry, probability, number theory) with 132 skills, misconception-based distractors via Bug Library pattern (70+ bug patterns), Elo-based adaptive difficulty with probabilistic MC/free-text answer format selection and dynamic MC option count, deep gamification (XP/levels/streaks, 31 achievement badges, daily challenges, visual skill map), polished UI with animated feedback, NumberPad component, and 5 unlockable color themes, a full adaptive learning engine (BKT, Leitner spaced repetition, prerequisite graph, smart session orchestration), six interactive virtual manipulatives with CPA progression (Concrete -> Pictorial -> Abstract), an on-demand AI tutor powered by Gemini that provides Socratic hints, CPA-aware teaching with manipulative integration, and deep scaffolding — auto-escalating support based on struggle level with full COPPA-compliant safety pipeline, cross-session misconception detection with 2-then-3 confirmation, adaptive session mix, tutor context enrichment, and dedicated remediation mini-sessions, plus avatar/frame customization with achievement-unlockable cosmetics. Domain-specific problem generators produce real curriculum-aligned questions (not placeholder arithmetic). Sister product to Tiny Tales (children's storytelling app), sharing the same tech stack and patterns.

## Core Value

Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## Requirements

### Validated

- ✓ Programmatic math engine with curriculum-tagged problems (Common Core grades 1-8, 132 skills across 16 domains) — v0.1 + v0.9
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

- ✓ Cross-session misconception tracking with 2-then-3 confirmation — v0.6
- ✓ Misconception history in store with persistence (STORE_VERSION 6->8) — v0.6
- ✓ Session mix adaptation for confirmed misconceptions (BKT-inverse weighted) — v0.6
- ✓ AI tutor misconception-aware explanations (per-mode guidance, no PII) — v0.6
- ✓ Remediation mini-sessions (5-problem dedicated practice, resolution at 3 correct) — v0.6

- ✓ Achievement badge system with 31-badge registry, evaluation engine, celebration UI — v0.7
- ✓ Visual skill map with interactive DAG, mastery states, detail overlay — v0.7
- ✓ Daily challenges with date-seeded rotation, themed sets, bonus XP, special badges — v0.7
- ✓ Avatar/frame customization with 14 regular + 5 special avatars + 6 frames — v0.7
- ✓ Dynamic color theming with 5 palettes, ThemeProvider, session cosmetic wrappers — v0.7
- ✓ All gamification cosmetics earned through achievements, zero paywall — v0.7

- ✓ Multi-child store foundation with copy-on-switch, grade-appropriate initialization — v0.8
- ✓ Profile management UI with PIN-gated add/edit/delete, profile switcher — v0.8
- ✓ Privacy disclosure component with COPPA-compliant content — v0.8
- ✓ Sentry error tracking with PII scrubbing and opt-out toggle — v0.8
- ✓ Google/Apple Sign-In with JWT verification backend — v0.8
- ✓ Cloudflare Workers backend with D1 (auth, consent, sync, data deletion) — v0.8
- ✓ Cloud sync with incremental deltas, offline queue, additive badge merge — v0.8
- ✓ ParentalControlsScreen with privacy, account, and AI helper sections — v0.8

- ✓ Domain handler architecture: DomainHandler interface, Answer discriminated union, answerNumericValue() bridge — pre-v0.9
- ✓ Grade type expanded from 1-4 to 1-8 for curriculum expansion — pre-v0.9
- ✓ Fractions domain handler: 14 skills (G1-6), 14 templates, 9 bug patterns — full CCSS coverage including grade 5-6 — pre-v0.9
- ✓ Place value domain handler: 8 skills (G1-4), 8 templates, 9 bug patterns — decompose through expanded form — pre-v0.9
- ✓ Time domain handler: 7 skills (G1-3), 7 templates, 6 bug patterns — clock reading, AM/PM, elapsed time — pre-v0.9
- ✓ Money domain handler: 7 skills (G1-4), 7 templates, 7 bug patterns — coins through unit pricing — pre-v0.9
- ✓ Patterns domain handler: 5 skills (G1-4), 5 templates, 5 bug patterns — sequences, missing values, I/O tables — pre-v0.9
- ✓ All placeholder handlers replaced with domain-specific generators — pre-v0.9

- ✓ Word problem system: 36 templates across all 16 domains, prefix/replace modes, reading level calibration via maxGrade — v0.9 Phase 54
- ✓ Type system expansion: MathDomain type with all 16 values, answer format selection with Elo-based sigmoid probability, dynamic MC option count 4/5/6 — v0.9 Phase 45
- ✓ Multiplication domain: 11 skills (G2-4), 8 bug patterns, domain handler — v0.9 Phase 46
- ✓ Division domain: 9 skills (G3-4), 6 bug patterns, domain handler — v0.9 Phase 47
- ✓ Grade 4 Addition & Subtraction: 3 skills (4-digit add/sub) — v0.9 Phase 53
- ✓ NumberPad component + answer format system: custom number pad, sigmoid MC/free-text probability, dynamic option count — v0.9 Phase 55
- ✓ Level indicator: eloToLevel mapping, HomeScreen + SessionScreen LevelBadge display — v0.9 Phase 56
- ✓ Parent Reports: SessionHistory store slice, MasteryDonutChart, SessionBarChart, ExpandableSkillDomain, AiSummaryCard, SessionHistoryList, ParentReportsScreen — v0.9 Phase 57
- ✓ Integration Testing: domain handler registry, cross-domain sessions, answer format integration, migration chain — v0.9 Phase 58
- ✓ Measurement domain: 5 skills (G4-5) — v0.9
- ✓ Ratios domain: 9 skills (G6-7) — v0.9
- ✓ Exponents domain: 6 skills (G5-8) — v0.9
- ✓ Expressions domain: 7 skills (G5-6) — v0.9
- ✓ Decimals domain: skills implemented — v0.9
- ✓ Integers domain: skills implemented — v0.9
- ✓ Geometry domain: 6 skills (G7-8) — v0.9
- ✓ Probability domain: 2 skills (G7) — v0.9
- ✓ Number Theory domain: 3 skills (G6) — v0.9

### Active

## Previous Milestone: v0.9 Full Curriculum Expansion (COMPLETE — Phases 45-58)

**Goal:** Expand from 14 addition/subtraction skills to full curriculum coverage across 16 math domains for grades 1-8, add parent reports with AI summaries, and improve answer input UX.

**Status:** COMPLETE — 132 skills across 16 domains, 2156 tests passing, grades 1-8.

**Completed:**
- ✓ Phase 45: Type System & Engine Expansion (MathDomain type, Answer union, answer format selection, dynamic MC count)
- ✓ Phase 46: Multiplication Domain (11 skills, 8 bug patterns)
- ✓ Phase 47: Division Domain (9 skills, 6 bug patterns)
- ✓ Phase 48: Fractions Domain (14 skills, 9 bug patterns)
- ✓ Phase 49: Place Value Domain (8 skills, 9 bug patterns)
- ✓ Phase 50: Time Domain (7 skills, 6 bug patterns, AnalogClock SVG)
- ✓ Phase 51: Money Domain (7 skills, 7 bug patterns, CoinDisplay SVG)
- ✓ Phase 52: Patterns Domain (5 skills, 5 bug patterns)
- ✓ Phase 53: Grade 4 Add/Sub (3 skills)
- ✓ Phase 54: Word Problem System (36 templates, 16 domains, prefix/replace modes, reading level calibration)
- ✓ Phase 55: NumberPad + Answer Format System
- ✓ Phase 56: Level Indicator (eloToLevel mapping, HomeScreen + SessionScreen LevelBadge)
- ✓ Phase 57: Parent Reports (SessionHistory slice, SVG charts, AI summary, reports screen)
- ✓ Phase 58: Integration Testing (29 new tests: domain registry, cross-domain sessions, answer formats, migration chain)
- ✓ Additional domains: Measurement, Ratios, Exponents, Expressions, Decimals, Integers, Geometry, Probability, Number Theory
- ✓ Operation → MathDomain rename (type system cleanup)

## Previous Milestone: v0.8 Social & Subscription (COMPLETE — Phases 38-40)

**Target features:**
- ~~Multi-child profile switcher (add/edit/delete children, independent progress per child)~~ ✓ Done (Phases 38-39)
- ~~Privacy, auth, backend, cloud sync~~ ✓ Done (Phase 40)
- ~~Parent dashboard~~ ✓ Done (v0.9 Phase 57 — Parent Reports)
- Parental controls (daily session time cap, bedtime lockout, break reminders) — deferred
- Freemium subscription (free: 3 sessions/day no AI tutor; premium: unlimited + AI tutor + all themes) — deferred
- IAP integration (subscription management, restore purchases, subscription state) — deferred

### Out of Scope

- Classroom/teacher mode — future product expansion
- Multiple curricula beyond Common Core — reduce scope, add later
- Ages outside 6-9 — clearest market gap, manageable content scope
- Platform expansion (web, iOS-specific) — mobile-first
- ~~Advanced analytics/reporting~~ ✓ Done (v0.9 Phase 57 — Parent Reports with AI summaries)
- Real-time multiplayer — COPPA complexity, defer
- Chat or social features with personal info — COPPA compliance
- ~~Free text input UI~~ — ✓ Done (v0.9 Phase 55: NumberPad + answer format selection)

## Context

**Current state:** v0.9 complete with 132 skills across 16 domains (grades 1-8). 2,156 tests passing. Full adaptive learning pipeline + 6 interactive virtual manipulatives with CPA progression + on-demand AI tutor + deep gamification + multi-child profiles + cloud sync backend + NumberPad component + Elo-based answer format selection + parent reports with AI summaries + word problems across all 16 domains.

**Architecture (implemented through v0.4):**
- Programmatic math engine: 132 skills across 16 domains (Common Core grades 1-8)
- Bug Library: 70+ misconception patterns with three-phase distractor assembly
- Elo rating system with variable K-factor (K=40 at start, decaying toward K=16)
- Gaussian-weighted problem selection targeting 85% success rate
- Frustration guard (3 consecutive wrong → easier problem)
- Session orchestrator: 12-problem queue (2 warmup + 8 practice + 2 cooldown) with 60/30/10 review/new/challenge mix
- Zustand persist with versioned migrations (STORE_VERSION=15) and AsyncStorage
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

**Architecture (implemented in v0.6):**
- misconceptionSlice: persisted Zustand slice with MisconceptionRecord (bugTag, skillId, occurrenceCount, status, timestamps, remediationCorrectCount)
- 2-then-3 confirmation engine: suspected at 2, confirmed at 3, resolved after 3 remediation correct answers
- Session mix adaptation: remediation category replaces review slots (max 3), BKT-inverse weighted skill selection for >3 confirmed
- AI tutor misconception context: ConfirmedMisconceptionContext (bugTag + description, no PII), per-mode guidance, capped at 3 per prompt
- Remediation mini-sessions: REMEDIATION_SESSION_CONFIG (0+5+0), remediationOnly queue mode, HomeScreen entry at 2+ confirmed
- STORE_VERSION 8 with v6→v7 (misconceptions map) and v7→v8 (remediationCorrectCount) migrations

**Architecture (implemented in v0.7):**
- achievementSlice: 31-badge registry with discriminated union conditions, pure-function evaluation engine, idempotent addEarnedBadges
- Badge UI: BadgeIcon (emoji+tier border), BadgeUnlockPopup (scale+glow sequential), BadgeCollectionScreen (3-column categorized grid)
- Visual skill map: layout engine computing 14 node positions + 18 edges, SVG rendering with Reanimated entrance animations, outer fringe pulse
- Daily challenges: 5 themed challenge sets with date-seeded PRNG rotation, challenge session mode reusing remediationOnly path
- challengeSlice: completions keyed by date with persistent counter, 4 challenge-specific badges
- Avatar/frame system: 14 regular + 5 special avatars + 6 frames, badge-unlock mapping, AvatarCircle with sparkle animation
- ThemeProvider: React Context with 5 palettes (12 color tokens each), useTheme() + useMemo pattern app-wide
- SessionWrapper: per-theme ambient decorations at screen edges, pointerEvents=none, slow cycles
- STORE_VERSION 9->10->11->12 across 4 migration steps (badges, challenges, frames, themes)

**Architecture (implemented in v0.8 — Phases 38-40):**
- Multi-child store: copy-on-switch pattern with ChildData map, hydrate/dehydrate helpers, grade-appropriate skill initialization
- ProfilesSlice: addChild, removeChild, updateChild, switchChild with auto-save on switch
- v12→v13 migration: single-child to multi-child store restructure (highest-risk migration)
- v13→v14 migration: auth state fields (userId, authProvider, userEmail, isSignedIn)
- Profile management: PinGate component, ProfileSwitcherSheet, ProfileCreationWizard (3-step)
- Privacy disclosure: PrivacyDisclosure component in ProfileSetupScreen (PIN → Disclosure → Wizard)
- Sentry: @sentry/react-native with PII scrubbing (child names, ages, emails), opt-out toggle
- Auth: Google/Apple Sign-In → backend JWT verification via jose JWKS → user creation/linking
- Backend: Cloudflare Workers + D1 (SQLite) at `https://tiny-tallies-api.magic-mirror-works.workers.dev`
  - D1 schema: users, consent_records, child_profiles, score_deltas, badges, skill_states
  - Endpoints: auth/verify, consent/acknowledge, consent/status, sync/push, sync/pull, user/data (DELETE), config
  - API key auth via X-API-Key header, user ID via X-User-Id header
- Cloud sync: incremental deltas (append-only), additive badge merge, MAX-based skill state merge
  - Offline queue in AsyncStorage, NetInfo connectivity trigger
  - useSyncTrigger hook: pull on sign-in, flush pending on connectivity return
- ParentalControlsScreen: PIN-gated settings (Privacy & Data, Account, AI Helper sections)

**Architecture (implemented in v0.9 — Phases 45-58):**
- Domain handler architecture: DomainHandler interface with per-domain generators, Answer discriminated union (numeric/fraction/comparison/expression/coordinate)
- 16 domain handlers registered in registry.ts, shared arithmetic handler for add/sub/mul/div
- Answer format selection: Elo-based sigmoid for MC/free-text probability, dynamic MC option count (4/5/6)
- NumberPad component: custom keypad for free-text answers, digit-limited input
- LevelBadge component: Elo-to-level mapping displayed on Home and Session screens
- sessionHistorySlice: capped at 50 entries (newest first), stores per-session results
- v14→v15 migration: adds sessionHistory array to store
- Parent Reports: MasteryDonutChart (SVG donut), SessionBarChart (SVG bars), ExpandableSkillDomain, AiSummaryCard (Gemini), SessionHistoryList
- AnalogClock SVG: static clock face with configurable detail levels (Phase 50)
- CoinDisplay SVG: realistic US coin display with proportional sizing (Phase 51)

**Tech stack:**
- React Native 0.81.5 / Expo 54 / TypeScript 5.9 (strict mode)
- Zustand 5 for state management (domain slices pattern, STORE_VERSION=15)
- React Navigation 7 native-stack
- react-native-gesture-handler + react-native-reanimated (manipulatives, 60fps)
- Gemini (@google/genai v1.43.0) for LLM tutoring layer
- @sentry/react-native for error tracking with PII scrubbing
- @react-native-google-signin/google-signin + expo-apple-authentication for auth
- Cloudflare Workers + D1 for backend (jose for JWT verification)
- @react-native-community/netinfo for connectivity detection
- Zod for runtime validation at system boundaries
- Jest + jest-expo + React Native Testing Library

**Research completed (13 documents in .planning/):**
Market research, curriculum standards (Common Core/Singapore/Russian/UK), AI tutoring engine design, virtual manipulatives specs, misconception detection patterns, spaced repetition algorithms, gamification design, onboarding/placement testing, child UX design, sound/audio design, math anxiety mitigation, COPPA privacy compliance, problem generation engine.

**Future milestones:**
- v1.0: TBD (onboarding/placement testing, sound/audio, parental time controls, freemium subscription, interactive manipulative animations, data & statistics domain)

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
| Start Common Core only | Reduce scope; add curricula in later versions | ✓ Good — 132 skills implemented across grades 1-8 |
| Ages 6-9 focus | Clearest market gap; manageable content scope | ✓ Good — grade 1-8 content complete |

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
| 2-then-3 confirmation rule | 2=suspected, 3=confirmed; balances false positives vs early detection | ✓ Good — simple, pedagogically sound |
| Composite key (bugTag::skillId) | Misconceptions are skill-specific, not global | ✓ Good — precise tracking |
| Session deduplication | Same misconception counted at most once per session | ✓ Good — prevents inflated counts from repeated errors |
| One-way status transitions (new→suspected→confirmed→resolved) | No regression — once confirmed, stays confirmed until remediated | ✓ Good — stable progression |
| Remediation replaces review slots only (max 3) | Preserves new/challenge allocations; keeps sessions balanced | ✓ Good — targeted without overwhelming |
| BKT-inverse weighted remediation selection | Lowest-mastery misconception skills prioritized | ✓ Good — focuses on biggest gaps |
| Resolution threshold of 3 correct | Three correct answers in remediation clears confirmed→resolved | ✓ Good — achievable but meaningful |
| Per-mode misconception guidance in tutor | HINT steers away, TEACH addresses step-by-step, BOOST explains why | ✓ Good — pedagogically differentiated |
| Cap 3 misconceptions per prompt | Controls prompt length, focuses on most frequent | ✓ Good — balanced signal-to-noise |
| Pure-function badge evaluation engine | No store coupling, single-pass iteration, testable | ✓ Good — 31 badges evaluated in one call |
| Badge IDs as discriminated union conditions | Type-safe unlock logic per category | ✓ Good — 6 condition types, exhaustive matching |
| Animated.View wrapper for SVG nodes | Each node/edge gets own Svg in Animated.View | ✓ Good — works around SVG animation limitations |
| InteractionManager deferred graph render | Waits for nav transition before skill map render | ✓ Good — smooth screen transition |
| Date-seeded PRNG for daily challenges | Deterministic rotation, fully offline, no backend | ✓ Good — same challenge for everyone each day |
| Challenge mode reuses remediationOnly path | Theme-filtered 10-problem sessions via existing queue logic | ✓ Good — minimal new code |
| All cosmetics earned through badges (zero paywall) | Intrinsic motivation, no IAP dark patterns, COPPA-safe | ✓ Good — values-aligned |
| useTheme() + useMemo pattern for theming | StyleSheet.create inside component body with memoized colors | ✓ Good — full app migration across 47+ files |
| SessionWrapper ambient decorations (pointerEvents=none) | Per-theme visual flair without interaction interference | ✓ Good — low opacity, slow cycles, edges only |
| STORE_VERSION 9-12 across v0.7 phases | One migration per gamification feature, clean chaining | ✓ Good — 4 sequential migrations |
| Copy-on-switch multi-child store | Keep flat slice interfaces, hydrate/dehydrate on switch | ✓ Good — minimal API surface change |
| v12→v13 structural reshape migration | Single-child to multi-child with children map | ✓ Good — highest-risk migration succeeded |
| Cloudflare Workers + D1 backend | Same stack as Tiny Tales; proven pattern | ✓ Good — deployed, 17 API tests passing |
| JWT verification via jose JWKS | No Firebase dependency; same pattern as Tiny Tales | ✓ Good — Google/Apple tokens verified server-side |
| Incremental delta sync | Append-only score deltas, additive badges, MAX skill states | ✓ Good — no data loss, works offline |
| Sentry with PII scrubbing | Default-on error tracking, opt-out in ParentalControls | ✓ Good — COPPA-compliant, child data never sent |
| Module-level Sentry.init (synchronous) | Must run before Sentry.wrap(App); opt-out applied async | ✓ Good — eliminates "init before wrap" warning |
| Privacy disclosure in ProfileSetupScreen | PIN → Disclosure → Wizard flow; minimal nav restructuring | ✓ Good — clean integration |
| Word problem prefix mode | Complex domains prepend scene-setting to existing questionText | ✓ Good — works for all 16 domains without domain-specific generators |
| maxGrade reading level calibration | Simple templates capped at low grades; older students get age-appropriate text | ✓ Good — implicit reading level via grade bands |
| Operation → MathDomain rename | Better semantic clarity; "operation" implies arithmetic only | ✓ Good — 28 files updated, zero runtime changes |

---
*Last updated: 2026-03-10 after v0.9 COMPLETE (132 skills, 16 domains, 36 word problem templates, 2156 tests)*
