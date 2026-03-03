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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v0.1 | 6 | 6 | First milestone — established patterns |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v0.1 | 336 | N/A | 0 (no new deps beyond Expo SDK) |

### Top Lessons (Verified Across Milestones)

1. Pure function architecture enables fast, reliable testing and clean composition
2. Scope milestones to executable phases only — deferred work belongs in future milestones
