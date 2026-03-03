# Requirements: Tiny Tallies

**Defined:** 2026-03-03
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles.

## v0.3 Requirements

Requirements for v0.3 Adaptive Learning Engine milestone. Each maps to roadmap phases.

### BKT (Mastery Estimation)

- [x] **BKT-01**: Each skill tracks a mastery probability (P(L)) updated via Bayesian inference after every answer
- [x] **BKT-02**: BKT parameters are age-adjusted (younger children: higher guess rate, higher slip rate, lower learn rate)
- [x] **BKT-03**: Skill with P(L) >= 0.95 is marked as mastered and moves to review-only scheduling
- [x] **BKT-04**: Skill with P(L) < 0.40 is flagged for re-teaching priority

### Leitner (Spaced Repetition)

- [x] **LEIT-01**: Each skill occupies one of 6 Leitner boxes determining its review interval
- [x] **LEIT-02**: Correct answer moves skill up one box (longer interval before next review)
- [x] **LEIT-03**: Wrong answer drops skill down 2 boxes (minimum Box 1), not all the way to Box 1
- [x] **LEIT-04**: Review intervals are age-adjusted (shorter gaps for younger children)
- [x] **LEIT-05**: Skill is considered mastered after 3 consecutive correct answers in Box 6

### Prerequisite Graph

- [x] **PREG-01**: Skill prerequisite DAG defines unlock dependencies for all existing skills
- [x] **PREG-02**: Outer fringe algorithm computes which new skills are available based on mastered prerequisites
- [x] **PREG-03**: New skills are only presented in sessions when all their prerequisites are mastered

### Session Orchestration

- [x] **SESS-01**: Session problems follow 60% review / 30% new / 10% challenge composition
- [x] **SESS-02**: Review problems are sourced from the Leitner queue (skills due for review)
- [x] **SESS-03**: New problems are sourced from the prerequisite outer fringe
- [x] **SESS-04**: Challenge problems are selected slightly above the child's current Elo rating
- [x] **SESS-05**: BKT mastery probabilities inform problem selection (deprioritize mastered skills, prioritize weak ones)

## Previous Milestones (Shipped)

### v0.2 — UI Polish & Gamification

- [x] **UI-01**: Home screen shows child's name, level, XP progress bar, and a "Start Practice" button
- [x] **UI-02**: Session screen displays the problem, answer options (multiple choice or free input), and progress indicator
- [x] **UI-03**: Results screen shows session summary with correct/total, XP earned, and a "Done" button
- [x] **UI-04**: All touch targets are minimum 48dp for ages 6-9 motor skills
- [x] **UI-05**: Dark theme with high contrast colors and child-friendly design
- [x] **UI-06**: Animated feedback for correct answers (celebration) and incorrect answers (gentle encouragement)
- [x] **GAME-01**: Child earns XP for each correct answer (scaled by problem difficulty)
- [x] **GAME-02**: XP accumulates toward levels with formula: XP per level = 100 + (level x 20)
- [x] **GAME-03**: Level-up triggers celebration animation
- [x] **GAME-04**: Weekly streak tracks consecutive weeks with at least one completed session
- [x] **GAME-05**: Home screen displays current level, XP progress, and streak count

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

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
| Onboarding / placement test | Requires BKT to be meaningful; consider for v0.3+ |
| Coin shop / purchasable items | Extended gamification in v0.7 |
| Badges / achievements | Extended gamification in v0.7 |
| Skill map visualization | Extended gamification in v0.7 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BKT-01 | Phase 11 | Complete |
| BKT-02 | Phase 11 | Complete |
| BKT-03 | Phase 11 | Complete |
| BKT-04 | Phase 11 | Complete |
| LEIT-01 | Phase 12 | Complete |
| LEIT-02 | Phase 12 | Complete |
| LEIT-03 | Phase 12 | Complete |
| LEIT-04 | Phase 12 | Complete |
| LEIT-05 | Phase 12 | Complete |
| PREG-01 | Phase 13 | Complete |
| PREG-02 | Phase 13 | Complete |
| PREG-03 | Phase 13 | Complete |
| SESS-01 | Phase 14 | Complete |
| SESS-02 | Phase 14 | Complete |
| SESS-03 | Phase 14 | Complete |
| SESS-04 | Phase 14 | Complete |
| SESS-05 | Phase 14 | Complete |

**Coverage:**
- v0.3 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after v0.3 roadmap creation*
