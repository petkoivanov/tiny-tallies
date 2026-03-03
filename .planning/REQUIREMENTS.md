# Requirements: Tiny Tallies

**Defined:** 2026-03-01
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles.

## v1 Requirements

Requirements for v0.1 Foundation milestone. Each maps to roadmap phases.

### Math Engine

- [x] **MATH-01**: Engine programmatically generates addition problems for grades 1-3 with configurable operand ranges
- [x] **MATH-02**: Engine programmatically generates subtraction problems for grades 1-3 with configurable operand ranges
- [x] **MATH-03**: Engine computes correct answers (never LLM) and validates user responses
- [x] **MATH-04**: Each problem is tagged to a Common Core standard (e.g., 1.OA.A.1, 2.NBT.B.5)
- [x] **MATH-05**: Engine generates distractor answers using Bug Library misconception patterns (e.g., no-carry error, smaller-from-larger)
- [x] **MATH-06**: Problems support multiple choice format (1 correct + 3 distractors)
- [x] **MATH-07**: Problems support free text input format with numeric keyboard
- [x] **MATH-08**: Problem templates define difficulty via operand ranges, carry/borrow requirements, and number of digits

### Adaptive Difficulty

- [x] **ADPT-01**: Each child has an Elo rating that updates after each problem attempt
- [x] **ADPT-02**: Elo is tracked per skill (e.g., addition-no-carry, subtraction-with-borrow) not just globally
- [x] **ADPT-03**: Problem selection targets problems within the child's Elo range to converge on 85% success rate
- [x] **ADPT-04**: Frustration guard triggers an easier problem after 3 consecutive wrong answers

### State Management

- [x] **STOR-01**: Child profile stores name, age, grade, and avatar selection
- [x] **STOR-02**: Skill states track per-skill Elo rating and attempt/correct counts
- [x] **STOR-03**: Session state tracks current problem index, answers given, score, and XP earned
- [x] **STOR-04**: All state persists across app restarts via AsyncStorage
- [x] **STOR-05**: Zustand store uses domain slices pattern (child profile, skill states, session, gamification)

### Session Flow

- [x] **SESS-01**: Child can start a practice session from the home screen
- [x] **SESS-02**: Session follows structured phases: warmup (easy) -> practice (adaptive) -> cooldown (easy)
- [x] **SESS-03**: Session displays problems one at a time with immediate feedback (correct/incorrect)
- [x] **SESS-04**: Session ends with a summary showing correct/total, XP earned, and skills practiced
- [x] **SESS-05**: Parent can configure session length (number of problems or time limit)

### UI / Screens

- [ ] **UI-01**: Home screen shows child's name, level, XP progress bar, and a "Start Practice" button
- [ ] **UI-02**: Session screen displays the problem, answer options (multiple choice or free input), and progress indicator
- [ ] **UI-03**: Results screen shows session summary with correct/total, XP earned, and a "Done" button
- [ ] **UI-04**: All touch targets are minimum 48dp for ages 6-9 motor skills
- [ ] **UI-05**: Dark theme with high contrast colors and child-friendly design
- [ ] **UI-06**: Animated feedback for correct answers (celebration) and incorrect answers (gentle encouragement)

### Navigation

- [x] **NAV-01**: React Navigation native-stack with Home -> Session -> Results flow
- [x] **NAV-02**: Back navigation is disabled during active session (prevents accidental exit)
- [x] **NAV-03**: Session can be exited via explicit "Quit" button with confirmation

### Gamification

- [ ] **GAME-01**: Child earns XP for each correct answer (scaled by problem difficulty)
- [ ] **GAME-02**: XP accumulates toward levels with formula: XP per level = 100 + (level x 20)
- [ ] **GAME-03**: Level-up triggers celebration animation
- [ ] **GAME-04**: Weekly streak tracks consecutive weeks with at least one completed session
- [ ] **GAME-05**: Home screen displays current level, XP progress, and streak count

## v2 Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Intelligence (v0.2)

- **INTL-01**: Bayesian Knowledge Tracing per skill for mastery estimation
- **INTL-02**: Modified Leitner spaced repetition with 6 boxes and age-adjusted intervals
- **INTL-03**: Prerequisite graph with outer fringe algorithm for skill sequencing
- **INTL-04**: Session composition follows 60% review / 30% new / 10% challenge ratio

### Manipulatives (v0.3)

- **MANP-01**: Base-ten blocks with drag, snap, group, and ungroup interactions
- **MANP-02**: Number line with hop, zoom, and fraction support
- **MANP-03**: Ten frame with fill and count interactions
- **MANP-04**: Counters with grouping and array formation

### AI Tutor (v0.4)

- **TUTR-01**: Gemini integration for context wrapping and age-appropriate explanations
- **TUTR-02**: Three-mode tutor: TEACH (CPA), HINT (Socratic), BOOST (scaffolding)
- **TUTR-03**: LLM safety guardrails preventing answer revelation and math computation

### Misconception Detection (v0.5)

- **MISC-01**: Bug Library matching for addition and subtraction misconception patterns
- **MISC-02**: 2-then-3 confirmation rule before flagging misconception
- **MISC-03**: Misconception-to-manipulative mapping for targeted intervention

### Gamification Extended (v0.6)

- **GAMX-01**: Coin economy with cosmetic shop items
- **GAMX-02**: Achievement badges for skills, effort, and exploration
- **GAMX-03**: Progress visualization via skill map

### Social & Subscription (v0.7)

- **SOCL-01**: Family group creation and management
- **SOCL-02**: Cooperative math challenges between siblings
- **SOCL-03**: Parent dashboard with progress visibility
- **SOCL-04**: Subscription tiers with Apple/Google IAP

## Out of Scope

| Feature | Reason |
|---------|--------|
| Classroom/teacher mode | Future product expansion beyond family use |
| Multiple curricula (beyond Common Core) | Reduce v1 scope; add Singapore/Russian/UK later |
| Ages outside 6-9 | Clearest market gap; manageable content scope |
| Web or platform-specific features | Mobile-first with React Native |
| Advanced analytics/reporting | Parent dashboard deferred to v0.7 |
| Real-time multiplayer | COPPA complexity; cooperative challenges in v0.7 |
| Chat or social features | COPPA compliance -- no personal info exchange |
| Multiplication/division problems | Add in v0.2+ after addition/subtraction foundation |
| Fraction problems | Add in v0.3 alongside fraction manipulatives |
| Sound/audio/TTS | Deferred to v0.3+ with manipulatives |
| Onboarding/placement test | Deferred to v0.2 with BKT + prerequisite graph |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STOR-05 | Phase 1: Project Scaffolding & Navigation | Complete |
| NAV-01 | Phase 1: Project Scaffolding & Navigation | Complete |
| MATH-01 | Phase 2: Math Engine Core | Complete |
| MATH-02 | Phase 2: Math Engine Core | Complete |
| MATH-03 | Phase 2: Math Engine Core | Complete |
| MATH-04 | Phase 2: Math Engine Core | Complete |
| MATH-08 | Phase 2: Math Engine Core | Complete |
| MATH-05 | Phase 3: Bug Library & Answer Formats | Complete |
| MATH-06 | Phase 3: Bug Library & Answer Formats | Complete |
| MATH-07 | Phase 3: Bug Library & Answer Formats | Complete |
| STOR-01 | Phase 4: State Management & Persistence | Complete |
| STOR-02 | Phase 4: State Management & Persistence | Complete |
| STOR-03 | Phase 4: State Management & Persistence | Complete |
| STOR-04 | Phase 4: State Management & Persistence | Complete |
| ADPT-01 | Phase 5: Adaptive Difficulty | Complete |
| ADPT-02 | Phase 5: Adaptive Difficulty | Complete |
| ADPT-03 | Phase 5: Adaptive Difficulty | Complete |
| ADPT-04 | Phase 5: Adaptive Difficulty | Complete |
| SESS-01 | Phase 6: Session Flow & Navigation Control | Complete |
| SESS-02 | Phase 6: Session Flow & Navigation Control | Complete |
| SESS-03 | Phase 6: Session Flow & Navigation Control | Complete |
| SESS-04 | Phase 6: Session Flow & Navigation Control | Complete |
| SESS-05 | Phase 6: Session Flow & Navigation Control | Complete |
| NAV-02 | Phase 6: Session Flow & Navigation Control | Complete |
| NAV-03 | Phase 6: Session Flow & Navigation Control | Complete |
| UI-01 | Phase 7: Core UI Screens | Pending |
| UI-02 | Phase 7: Core UI Screens | Pending |
| UI-03 | Phase 7: Core UI Screens | Pending |
| UI-04 | Phase 7: Core UI Screens | Pending |
| UI-05 | Phase 7: Core UI Screens | Pending |
| GAME-01 | Phase 8: Gamification & Feedback | Pending |
| GAME-02 | Phase 8: Gamification & Feedback | Pending |
| GAME-03 | Phase 8: Gamification & Feedback | Pending |
| GAME-04 | Phase 8: Gamification & Feedback | Pending |
| GAME-05 | Phase 8: Gamification & Feedback | Pending |
| UI-06 | Phase 8: Gamification & Feedback | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after roadmap creation*
