# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v0.1 — Foundation

**Shipped:** 2026-03-03
**Phases:** 6 | **Plans:** 12 | **Sessions:** 6

### What Was Built
- Programmatic math engine with 14 skills across Common Core grades 1-3 (addition/subtraction)
- Bug Library with 11 misconception patterns and three-phase distractor assembly
- Elo-based adaptive difficulty with Gaussian-weighted problem selection (85% success target)
- Zustand store with 4 domain slices, versioned migrations, AsyncStorage persistence
- Full session flow: warmup (3) → practice (9) → cooldown (3) with commit-on-complete
- SessionScreen with MC answers, feedback, navigation guards + ResultsScreen with summary

### What Worked
- Pure function architecture throughout (math engine, adaptive difficulty, session orchestrator) — enables comprehensive unit testing without mocking
- Domain slice pattern in Zustand — clean separation, each slice independently testable
- Pre-generated session queue — simpler architecture, avoids async complexity during sessions
- Commit-on-complete pattern — clean quit semantics, no partial state corruption
- Bug Library pattern — deterministic distractor generation, reproducible tests

### What Was Inefficient
- Phases 7-8 (Core UI, Gamification) planned in roadmap but not executed — milestone scope was too ambitious for v0.1, should have scoped to phases 1-6 from the start
- ROADMAP.md progress table got out of sync with actual completion (phases 5-6 not marked complete in roadmap despite having summaries)

### Patterns Established
- Barrel exports (`index.ts`) in every service module for clean import paths
- Dot-delimited skill IDs (`operation.scope.variant`) for flat Record lookups
- Seeded PRNG (mulberry32) for deterministic problem generation and testing
- Route params for cross-screen data passing (avoids store timing issues)
- usePreventRemove + gestureEnabled:false dual navigation guard pattern

### Key Lessons
1. Scope milestones to what will actually be executed — include only phases you plan to complete
2. Pure function services compose cleanly and test easily — avoid store coupling in domain logic
3. Pre-compute over lazy-compute for session data when Elo drift is acceptable
4. Variable K-factor (K=40→K=16) gives faster initial convergence without long-term instability

### Cost Observations
- Model mix: ~70% opus (executor), ~30% sonnet (checker, verifier)
- Sessions: 6 planning sessions, 6 execution sessions
- Notable: Average plan execution 3.1min — fast due to pure function architecture and clear task boundaries

---

## Milestone: v0.2 — UI Polish & Gamification

**Shipped:** 2026-03-03
**Phases:** 4 | **Plans:** 7

### What Was Built
- XP/level progression service with formula-driven leveling (100 + level*20 XP per level)
- Weekly streak tracking with ISO week calculation and non-punitive design
- Personal home screen dashboard (child name, avatar, level, XP progress, streak)
- Session UI polish: progress bar with phase colors, answer button feedback, scale-on-press
- Results screen with dynamic motivational messages, XP bar, streak display, level-up callout
- Animated feedback: spring bounce correct, horizontal shake incorrect, confetti celebration on level-up

### What Worked
- Layered execution: gamification service → integration into session flow → UI consumption → animations as separate phases
- Reusing patterns from v0.1: commit-on-complete extended cleanly for XP/streak
- Small plan count (7) but high impact — visible UX transformation

### What Was Inefficient
- Global reanimated Jest mock was broken (returning undefined), caused test failures until fixed in Phase 10
- v0.2 milestone scope originally separate but combined well with v0.1 workflow

### Patterns Established
- SessionFeedback type as return value from commitSessionResults — clean data flow to UI
- Motivational message thresholds (90%+ "Amazing!", 70%+ "Great job!", below "Nice effort!")
- Scale-on-press (0.95 transform) as universal touch feedback pattern

### Key Lessons
1. Fix broken test infrastructure (mock issues) before building on top of it
2. SessionFeedback return pattern works cleanly for passing computed data to Results screen
3. Animations should be separate phase from base UI — easier to test and iterate

### Cost Observations
- Model mix: ~70% opus, ~30% sonnet
- Notable: 7 plans in 1 day — fast due to well-established patterns from v0.1

---

## Milestone: v0.3 — Adaptive Learning Engine

**Shipped:** 2026-03-03
**Phases:** 4 (Phases 11-14) | **Plans:** 15

### What Was Built
- Bayesian Knowledge Tracing (BKT) with age-adjusted parameters (3 brackets: 6-7, 7-8, 8-9)
- Leitner 6-box spaced repetition with age-adjusted intervals and BKT-informed initial placement
- Prerequisite skill DAG with BKT-mastery gating and outer fringe algorithm
- Smart session orchestration: 60/30/10 review/new/challenge mix with BKT-weighted selection
- Fallback cascade for empty categories, constrained shuffle (no adjacent challenges, review-first)

### What Worked
- Pure function pattern continued to pay off — BKT, Leitner, practice mix all testable without mocking
- Store migration chain (v2→v3→v4) with BKT-informed Leitner placement — clean data migration
- Dual-update pattern (Elo + BKT independently in handleAnswer) — clean separation of concerns
- No-re-locking policy decision — avoids frustrating children when prerequisite mastery fluctuates
- Outer fringe excludes practiced-but-unmastered skills — Leitner handles review, no duplication

### What Was Inefficient
- Milestone audit ran before phases 13-14 were built, producing a stale "gaps_found" report — should audit closer to completion
- SUMMARY frontmatter missing requirements_completed entries for phases 11-12 (tech debt from executor)
- Phase 14 plan 02 key_link metadata had incorrect source file (leitnerCalculator instead of mathEngine) — info-only but shows metadata drift risk

### Patterns Established
- Age bracket lookup pattern: childAge → bracket → parameter table (used in both BKT and Leitner)
- BKT-informed initial placement: use mastery probability to place skills in appropriate Leitner boxes during migration
- Fallback cascade pattern: try primary pool → cascade through alternatives → ultimate fallback to root skills
- Constrained shuffle: Fisher-Yates + constraint fix-up passes for pedagogical ordering

### Key Lessons
1. Run milestone audits AFTER all phases are complete, not during development
2. Age-bracket lookup is a reusable pattern — extract into shared utility if a third consumer appears
3. BKT-mastery gating is more pedagogically sound than Elo-threshold gating — true mastery vs difficulty proxy
4. Fallback cascades should always terminate at a guaranteed non-empty set (root skills)
5. Store migration testing is critical — v3→v4 migration had to handle BKT→Leitner dependency correctly

### Cost Observations
- Model mix: ~60% opus (executor), ~30% sonnet (checker, verifier), ~10% haiku (research skipped)
- Notable: 15 plans in 2 days — algorithmic phases take longer than UI phases due to mathematical correctness requirements
- 557 tests at completion — test suite growing linearly with features

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Plans | Phases | Key Change |
|-----------|-------|--------|------------|
| v0.1 | 12 | 6 | First milestone — established patterns |
| v0.2 | 7 | 4 | UI polish, gamification, animations |
| v0.3 | 15 | 4 | Adaptive learning backbone (BKT, Leitner, prereqs, smart sessions) |

### Cumulative Quality

| Milestone | Tests | LOC | Zero-Dep Additions |
|-----------|-------|-----|-------------------|
| v0.1 | 336 | 6,799 | 0 (no new deps beyond Expo SDK) |
| v0.2 | 430 | ~8,500 | 0 |
| v0.3 | 557 | 11,866 | 0 |

### Top Lessons (Verified Across Milestones)

1. Pure function architecture enables fast, reliable testing and clean composition (v0.1, v0.2, v0.3)
2. Scope milestones to executable phases only — deferred work belongs in future milestones (v0.1)
3. Fix broken test infrastructure before building on it — mock issues cascade (v0.2)
4. Age-bracket lookup is a reusable pattern for child-adaptive systems (v0.3)
5. Run milestone audits after all phases complete, not during development (v0.3)
