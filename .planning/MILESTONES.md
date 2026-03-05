# Milestones

## v0.6 Misconception Detection (Shipped: 2026-03-05)

**Phases completed:** 5 phases, 7 plans, 14 tasks
**Timeline:** 1 day (2026-03-04 → 2026-03-05)
**LOC:** ~31,380 TypeScript | 44 commits
**Tests:** 1,148 passing

**Key accomplishments:**
- Misconception detection pipeline: Bug Library tags recorded on every wrong answer, deduplicated per session, persisted across sessions with store migration v6→v8
- 2-then-3 confirmation engine: suspected at 2 occurrences, confirmed at 3, with status-filtered selectors and cross-session aggregation
- Adaptive session mix: confirmed misconceptions auto-inject remediation problems into practice queue (replacing review slots, BKT-inverse weighted selection)
- AI tutor misconception context: all three modes (HINT/TEACH/BOOST) receive confirmed misconception data with mode-specific pedagogical guidance (no PII)
- Remediation mini-sessions: dedicated 5-problem practice targeting confirmed misconception skills, with resolution tracking (3 correct → resolved)
- HomeScreen "Practice Tricky Skills" entry point visible when 2+ confirmed misconceptions, with remediation-specific Results messaging

---

## v0.5 AI Tutor (Shipped: 2026-03-04)

**Phases completed:** 5 phases, 13 plans
**Timeline:** 1 day (2026-03-04)
**LOC:** ~29,092 TypeScript | 96 files changed (+15,734 / -150)
**Tests:** 1,051 passing

**Key accomplishments:**
- Gemini LLM integration with lazy client, rate limiting (3/problem, 20/session, 50/day), AbortController lifecycle, and 8s timeout
- Multi-layer safety pipeline: consent gate → PII scrubbing → Gemini safety filters (BLOCK_LOW_AND_ABOVE) → answer-leak detection → content validation → canned fallbacks
- Chat bubble UI with child-initiated HelpButton, ChatPanel bottom sheet, pre-defined ResponseButtons, per-problem reset, and offline handling
- Three-mode auto-escalation tutor: HINT (Socratic, never reveals answer) → TEACH (CPA-stage-aware with manipulative panel integration) → BOOST (deep scaffolding with programmatic answer reveal after 3+ wrong)
- Bug Library misconception tags inform tutor explanations, addressing specific misunderstandings rather than giving generic feedback
- Parental consent gate with PIN verification via expo-secure-store for COPPA compliance (VPC gate before first AI tutor use)

---

## v0.4 Virtual Manipulatives (Shipped: 2026-03-04)

**Phases completed:** 6 phases, 17 plans
**Timeline:** 1 day (2026-03-03 → 2026-03-04)
**LOC:** ~21,900 TypeScript | 166 files changed (+22,150 / -298)

**Key accomplishments:**
- 6 virtual manipulatives (Counters, TenFrame, NumberLine, BaseTenBlocks, FractionStrips, BarModel) with drag-and-drop, snap-to-zone, and haptic feedback
- 60fps drag primitives: snap math worklets on UI thread via Reanimated, DraggableItem + SnapZone reusable across all manipulatives
- CPA progression system: BKT-informed concrete/pictorial/abstract stage tracking with one-way advancement and auto-advance on session complete
- Session integration: auto-expanded manipulative panel in concrete mode, inline pictorial SVG diagrams, CPA stage routing per skill
- Sandbox exploration: per-manipulative free-play screens accessible from home screen explore grid with first-visit tooltips
- Polish: 10-step undo across all 6 manipulatives, guided mode highlighting with pulsing glow, counter array grid mode for multiplication, double ten frame for add-within-20

**Tech debt accepted:**
- Double ManipulativeShell wrapping in CpaSessionContent (cosmetic — outer shell has dead props)
- Missing guidedSteps subtraction resolvers for base_ten_blocks, number_line, bar_model (graceful degradation)

---

## v0.3 Adaptive Learning Engine (Shipped: 2026-03-03)

**Phases completed:** 8 phases, 15 plans
**Timeline:** 2 days (2026-03-02 → 2026-03-03)
**LOC:** 11,866 TypeScript | 89 files changed (+12,028 / -368)

**Key accomplishments:**
- Gamification engine with XP/level progression (100+level*20 formula) and weekly streak tracking
- Personal home screen dashboard showing child name, avatar, level, XP progress bar, and streak
- Session UI polish: progress bars with phase colors, answer button feedback, scale-on-press, motivational messages
- Animated feedback: spring bounce for correct answers, horizontal shake for incorrect, confetti celebrations on level-up
- Bayesian Knowledge Tracing (BKT) with age-adjusted parameters for per-skill mastery estimation (P(L) updated via Bayesian inference)
- Leitner 6-box spaced repetition with age-adjusted review intervals and BKT-informed initial box placement
- Prerequisite skill DAG with BKT-mastery gating and outer fringe algorithm for new skill discovery
- Smart session orchestration: 60/30/10 review/new/challenge mix with BKT-weighted selection and fallback cascade

---

## v0.1 Foundation (Shipped: 2026-03-03)

**Phases completed:** 6 phases, 12 plans
**Timeline:** 2 days (2026-03-01 → 2026-03-02)
**LOC:** 6,799 TypeScript | 113 files changed

**Key accomplishments:**
- Zustand store with 4 domain slices, theme system, and React Navigation 7 native-stack
- Math engine with 14 skills across Common Core grades 1-3, seeded PRNG problem generation
- Bug Library with 11 misconception patterns and three-phase distractor assembly
- Zustand persist middleware with versioned migrations and AsyncStorage backend
- Elo-based adaptive difficulty with Gaussian-weighted problem/skill selection targeting 85% success
- Full session flow (warmup/practice/cooldown) with navigation guards and commit-on-complete

**Known Gaps:**
- UI-01, UI-02, UI-03, UI-04, UI-05: Core UI polish (Phase 7 — deferred to v0.2)
- GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, UI-06: Gamification & feedback (Phase 8 — deferred to v0.2)

---

