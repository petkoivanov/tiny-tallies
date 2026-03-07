# Milestones

## v0.8 Social & Subscription (In Progress)

**Phases completed so far:** 3 of 7 phases (38-40), 10 plans
**Timeline:** 2 days (2026-03-06 → 2026-03-07, ongoing)
**LOC:** ~47,423 TypeScript | 208 source files
**Tests:** 1,597 passing across 113 test suites

**Key accomplishments (so far):**
- Multi-child store: copy-on-switch architecture with ChildData map, v12→v13 structural migration, grade-appropriate initialization, auto-save on background/switch
- Profile management: PinGate component, ProfileSwitcherSheet, ProfileCreationWizard (3-step), ProfileManagementScreen with edit/delete
- Privacy disclosure: COPPA-compliant PrivacyDisclosure component in ProfileSetupScreen (PIN → Disclosure → Wizard)
- Sentry error tracking: @sentry/react-native with PII scrubbing (child names, ages, emails), opt-out toggle, module-level init
- Authentication: Google/Apple Sign-In with backend JWT verification via jose JWKS, authSlice in store (v13→v14 migration)
- Backend: Cloudflare Workers + D1 deployed at `https://tiny-tallies-api.magic-mirror-works.workers.dev` with auth, consent, sync, config, and data deletion endpoints
- Cloud sync: incremental delta-based sync with offline queue in AsyncStorage, NetInfo connectivity trigger, additive badge merge, MAX-based skill state merge
- ParentalControlsScreen: PIN-gated settings with Privacy & Data (Sentry toggle), Account (sign in/out, delete), AI Helper (tutor consent)

**Remaining phases:**
- Phase 41: Session History & Analytics Engine
- Phase 42: Parent Dashboard
- Phase 43: Parental Time Controls
- Phase 44: Freemium Subscription & IAP

---

## v0.7 Gamification (Shipped: 2026-03-06)

**Phases completed:** 7 phases, 17 plans
**Timeline:** 2 days (2026-03-04 -> 2026-03-06)
**LOC:** ~40,434 TypeScript | 177 files changed (+22,890 / -2,321)
**Tests:** 1,411 passing

**Key accomplishments:**
- Achievement system with 31-badge registry (mastery, behavior, challenge categories), pure-function evaluation engine, and persisted badge state (STORE_VERSION 9)
- Badge UI: celebration popup with scale+glow animation, categorized badge collection grid, Results screen integration, HomeScreen badge count
- Interactive visual skill map rendering the 14-skill prerequisite DAG with locked/unlocked/in-progress/mastered states, tap-for-detail overlay, and animated mastery fill
- Daily challenges with date-seeded PRNG rotation across 5 themed sets, streak/accuracy goals, bonus XP, 4 challenge-specific badges, and non-punitive design
- Avatar/frame customization: 14 regular + 5 special avatars + 6 decorative frames, all unlockable through achievement badges with live-preview picker
- Dynamic color theming: ThemeProvider with 5 palettes (dark, ocean, forest, sunset, space), full app migration to useTheme() across 47+ files, session ambient decorations, and theme picker with preview

---

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

