# Requirements: Tiny Tallies

**Defined:** 2026-03-02
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles.

## v0.2 Requirements

Requirements for v0.2 UI Polish & Gamification milestone. Each maps to roadmap phases.

### UI Polish

- [ ] **UI-01**: Home screen shows child's name, level, XP progress bar, and a "Start Practice" button
- [ ] **UI-02**: Session screen displays the problem, answer options (multiple choice or free input), and progress indicator
- [ ] **UI-03**: Results screen shows session summary with correct/total, XP earned, and a "Done" button
- [ ] **UI-04**: All touch targets are minimum 48dp for ages 6-9 motor skills
- [ ] **UI-05**: Dark theme with high contrast colors and child-friendly design
- [ ] **UI-06**: Animated feedback for correct answers (celebration) and incorrect answers (gentle encouragement)

### Gamification

- [x] **GAME-01**: Child earns XP for each correct answer (scaled by problem difficulty)
- [x] **GAME-02**: XP accumulates toward levels with formula: XP per level = 100 + (level x 20)
- [ ] **GAME-03**: Level-up triggers celebration animation
- [ ] **GAME-04**: Weekly streak tracks consecutive weeks with at least one completed session
- [ ] **GAME-05**: Home screen displays current level, XP progress, and streak count

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Intelligence (v0.3)

- **INTL-01**: Bayesian Knowledge Tracing per skill for mastery estimation
- **INTL-02**: Modified Leitner spaced repetition with 6 boxes and age-adjusted intervals
- **INTL-03**: Prerequisite graph with outer fringe algorithm for skill sequencing
- **INTL-04**: Session composition follows 60% review / 30% new / 10% challenge ratio

### Manipulatives (v0.4)

- **MANP-01**: Base-ten blocks with drag, snap, group, and ungroup interactions
- **MANP-02**: Number line with hop, zoom, and fraction support
- **MANP-03**: Ten frame with fill and count interactions
- **MANP-04**: Counters with grouping and array formation

### AI Tutor (v0.5)

- **TUTR-01**: Gemini integration for context wrapping and age-appropriate explanations
- **TUTR-02**: Three-mode tutor: TEACH (CPA), HINT (Socratic), BOOST (scaffolding)
- **TUTR-03**: LLM safety guardrails preventing answer revelation and math computation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Sound effects / audio | Requires audio asset pipeline; defer to dedicated audio milestone |
| Parental controls / PIN | Deferred to subscription milestone (v0.8) |
| Multiple child profiles | Deferred to social milestone (v0.8) |
| Onboarding / placement test | Requires BKT (v0.3) to be meaningful |
| Coin shop / purchasable items | Extended gamification in v0.7 |
| Badges / achievements | Extended gamification in v0.7 |
| Skill map visualization | Extended gamification in v0.7 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 8 | Pending |
| UI-02 | Phase 9 | Pending |
| UI-03 | Phase 9 | Pending |
| UI-04 | Phase 9 | Pending |
| UI-05 | Phase 9 | Pending |
| UI-06 | Phase 10 | Pending |
| GAME-01 | Phase 7 | Complete |
| GAME-02 | Phase 7 | Complete |
| GAME-03 | Phase 10 | Pending |
| GAME-04 | Phase 7 | Pending |
| GAME-05 | Phase 8 | Pending |

**Coverage:**
- v0.2 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after roadmap creation*
