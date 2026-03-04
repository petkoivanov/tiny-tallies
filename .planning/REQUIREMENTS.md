# Requirements: Tiny Tallies

**Defined:** 2026-03-04
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## v0.6 Requirements

Requirements for Misconception Detection milestone. Each maps to roadmap phases.

### Misconception Tracking

- [ ] **MISC-01**: System records which Bug Library misconception tag each wrong answer triggers, persisted across sessions
- [ ] **MISC-02**: 2-then-3 confirmation rule — 2 occurrences flags "suspected", 3 confirms the misconception
- [ ] **MISC-03**: Misconception history per child in store with timestamps, skill, and confirmation status

### Interventions

- [ ] **INTV-01**: Session mix prioritizes skills with confirmed misconceptions (remediation problems injected into practice)
- [ ] **INTV-02**: AI tutor receives confirmed misconception data in prompt context for targeted explanations
- [ ] **INTV-03**: Dedicated remediation mini-session when confirmed misconceptions accumulate (e.g., 2+ confirmed)

### Store & State

- [ ] **STATE-01**: misconceptionSlice in Zustand store with persistence (requires STORE_VERSION bump + migration)
- [ ] **STATE-02**: Misconception records include: bugTag, skillId, occurrenceCount, status (suspected/confirmed), timestamps

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Extended Gamification (v0.7)

- **GAME-01**: Achievement badges with trophy case
- **GAME-02**: Visual skill map (prerequisite DAG as explorable map)
- **GAME-03**: Daily challenges with XP boost and special badges
- **GAME-04**: Avatar customization (unlockable through achievements)
- **GAME-05**: Theme customization

### Social & Subscription (v0.8)

- **SOCL-01**: Parent dashboard with child progress analytics
- **SOCL-02**: Multiple child profiles (family groups)
- **SOCL-03**: In-app purchases / subscription

## Out of Scope

| Feature | Reason |
|---------|--------|
| Parent-facing misconception dashboard | Deferred to v0.8 parent dashboard |
| Misconception-based skill locking | Conflicts with no-re-locking policy |
| Auto-generated remediation content via LLM | LLM must never compute math; remediation uses existing engine problems |
| Cross-child misconception analytics | No multi-child support until v0.8 |
| Free text misconception notes | Children ages 6-7 cannot type reliably |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MISC-01 | — | Pending |
| MISC-02 | — | Pending |
| MISC-03 | — | Pending |
| INTV-01 | — | Pending |
| INTV-02 | — | Pending |
| INTV-03 | — | Pending |
| STATE-01 | — | Pending |
| STATE-02 | — | Pending |

**Coverage:**
- v0.6 requirements: 8 total
- Mapped to phases: 0
- Unmapped: 8

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*
