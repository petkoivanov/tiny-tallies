# Milestones

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

