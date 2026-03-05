# Requirements: Tiny Tallies

**Defined:** 2026-03-04
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## v0.7 Requirements

Requirements for gamification milestone. Each maps to roadmap phases.

### Prep

- [x] **PREP-01**: SessionScreen refactored below 500-line guardrail (currently 552 lines)

### Achievements

- [x] **ACHV-01**: Badge registry with static catalog (ID, category, unlock conditions, reward associations)
- [x] **ACHV-02**: Badge evaluation engine checks unlock conditions post-session
- [x] **ACHV-03**: Badge state persisted in store (earnedBadges, badgeProgress) with migration
- [x] **ACHV-04**: User earns mastery badges (skill mastered, category complete, grade complete)
- [x] **ACHV-05**: User earns behavior badges (streak milestones, session count, remediation victories)
- [x] **ACHV-06**: Badge popup animation on unlock with Results screen integration
- [x] **ACHV-07**: User can view badge grid showing earned and locked badges with requirements
- [x] **ACHV-08**: Results screen displays newly earned badges after session

### Skill Map

- [x] **SMAP-01**: User can view prerequisite DAG as interactive visual tree/graph
- [x] **SMAP-02**: Skill nodes show locked/unlocked/in-progress/mastered states from BKT
- [x] **SMAP-03**: User can tap node for detail overlay (mastery %, BKT probability, Leitner box)
- [x] **SMAP-04**: Nodes animate mastery fill, pulse on unlock, edges glow for active path

### Daily Challenges

- [x] **CHAL-01**: Daily challenge system with theme + skill filter + goal type definitions
- [x] **CHAL-02**: Challenges rotate daily via date-seeded PRNG (fully offline)
- [ ] **CHAL-03**: User can play themed challenge sets (Addition Adventure, Subtraction Sprint, etc.)
- [ ] **CHAL-04**: User can attempt streak/accuracy goals with bonus XP rewards
- [x] **CHAL-05**: Challenge-specific special badges awarded on completion
- [ ] **CHAL-06**: Daily challenge card on home screen with progress display
- [ ] **CHAL-07**: Non-punitive design (no "missed" messaging, zero penalty for skipping)

### Avatars & Frames

- [ ] **AVTR-01**: Avatar preset pool expanded from 8 to 12-15 options
- [ ] **AVTR-02**: 4-7 special avatars unlockable through achievement badges
- [ ] **AVTR-03**: 5-7 frame decorations around avatar earned via badges
- [ ] **AVTR-04**: Updated avatar picker shows all presets + locked unlockables with requirements

### Themes

- [ ] **THME-01**: ThemeProvider with React Context for dynamic app-wide color theming
- [ ] **THME-02**: User can select from 3-5 UI color themes (default dark, ocean, forest, sunset, space)
- [ ] **THME-03**: Session cosmetic wrappers add themed context/art around math problems
- [ ] **THME-04**: Theme picker screen to preview, equip, and see locked theme requirements
- [ ] **THME-05**: Themes unlocked via achievement badges

## v0.8 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social & Subscription

- **SOCL-01**: Family groups with shared progress view
- **SOCL-02**: Parent dashboard with learning analytics
- **SOCL-03**: In-app purchase subscription for parent features

## Out of Scope

| Feature | Reason |
|---------|--------|
| Coins/virtual currency | Creates loss aversion, gateway to IAP dark patterns, Prodigy FTC complaint |
| Collectible items/stickers | Collection completion pressure, gacha mechanics harmful to children |
| Competitive leaderboards | Discourages bottom-half children, COPPA implications |
| Daily login streak | Causes anxiety in children when broken, contradicts weekly streak design |
| Pay-to-unlock cosmetics | Creates inequality, against project values |
| Complex avatar builder | Over-engineered for ages 6-7, high asset cost |
| Timed challenges with countdown | Time pressure causes anxiety in ages 6-9 |
| Speed/accuracy leaderboards | Speed emphasis undermines understanding-first philosophy |
| Badge showcase/trophy wall | Nice-to-have, defer to post-v0.7 polish |
| Sound effects for badges | Defer to incremental polish |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PREP-01 | Phase 31 | Complete |
| ACHV-01 | Phase 32 | Complete |
| ACHV-02 | Phase 32 | Complete |
| ACHV-03 | Phase 32 | Complete |
| ACHV-04 | Phase 33 | Complete |
| ACHV-05 | Phase 33 | Complete |
| ACHV-06 | Phase 33 | Complete |
| ACHV-07 | Phase 33 | Complete |
| ACHV-08 | Phase 33 | Complete |
| SMAP-01 | Phase 34 | Complete |
| SMAP-02 | Phase 34 | Complete |
| SMAP-03 | Phase 34 | Complete |
| SMAP-04 | Phase 34 | Complete |
| CHAL-01 | Phase 35 | Complete |
| CHAL-02 | Phase 35 | Complete |
| CHAL-03 | Phase 35 | Pending |
| CHAL-04 | Phase 35 | Pending |
| CHAL-05 | Phase 35 | Complete |
| CHAL-06 | Phase 35 | Pending |
| CHAL-07 | Phase 35 | Pending |
| AVTR-01 | Phase 36 | Pending |
| AVTR-02 | Phase 36 | Pending |
| AVTR-03 | Phase 36 | Pending |
| AVTR-04 | Phase 36 | Pending |
| THME-01 | Phase 37 | Pending |
| THME-02 | Phase 37 | Pending |
| THME-03 | Phase 37 | Pending |
| THME-04 | Phase 37 | Pending |
| THME-05 | Phase 37 | Pending |

**Coverage:**
- v0.7 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after roadmap creation*
