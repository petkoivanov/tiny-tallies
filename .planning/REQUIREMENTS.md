# Requirements: Tiny Tallies

**Defined:** 2026-03-05
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles

## v0.8 Requirements

Requirements for Social & Subscription milestone. Each maps to roadmap phases.

### Multi-Child Profiles

- [x] **PROF-01**: User can switch between child profiles from the home screen
- [ ] **PROF-02**: Parent can add a new child profile with name, age, and grade level (PIN-gated)
- [ ] **PROF-03**: Parent can edit an existing child profile's name, age, and grade level
- [ ] **PROF-04**: Parent can delete a child profile with confirmation
- [x] **PROF-05**: Each child profile has independent progress (Elo, BKT, skills, XP, achievements, cosmetics)
- [x] **PROF-06**: App supports up to 5 child profiles per device
- [x] **PROF-07**: New child profiles initialize with grade-appropriate skill unlocks and difficulty
- [x] **PROF-08**: Active child data auto-saves on app background and profile switch

### Parent Dashboard

- [ ] **DASH-01**: Parent can view a progress overview per child (mastery, sessions, streaks, time spent)
- [ ] **DASH-02**: Parent can view misconception analytics showing specific reasoning errors per child
- [ ] **DASH-03**: Parent can view trend graphs of skill mastery and performance over time
- [ ] **DASH-04**: Parent can view a scrollable session history with per-session details
- [ ] **DASH-05**: Parent dashboard is accessible behind PIN gate from home screen

### Parental Controls

- [ ] **CTRL-01**: Parent can set a daily session time cap per child
- [ ] **CTRL-02**: Parent can set a bedtime lockout window per child (e.g., 8pm-7am)
- [ ] **CTRL-03**: App shows break reminders after configurable continuous practice time
- [ ] **CTRL-04**: Time controls are configured within the parent dashboard

### Subscription

- [ ] **SUB-01**: App displays a freemium paywall with clear free vs premium tier comparison
- [ ] **SUB-02**: Free tier allows 3 practice sessions per day with full adaptive engine
- [ ] **SUB-03**: Premium tier unlocks unlimited sessions, AI tutor, and all color themes
- [ ] **SUB-04**: User can restore purchases on reinstall or new device
- [ ] **SUB-05**: All purchase UI is behind the parental PIN gate
- [ ] **SUB-06**: Subscription state is managed via RevenueCat (not persisted locally)

## Future Requirements

### Push Notifications

- **NOTF-01**: Parent receives push notification summary of child's daily progress
- **NOTF-02**: Parent receives notification when child achieves a milestone badge

### Cloud Sync

- **SYNC-01**: Child progress syncs across devices via cloud backend
- **SYNC-02**: Family group shared across devices

### Advanced Analytics

- **ANLYT-01**: Parent can view detailed session replays
- **ANLYT-02**: Parent can export progress reports as PDF

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cross-device sync | Requires cloud backend infrastructure, deferred to future |
| Push notifications to parents | Requires server infrastructure |
| Push notifications to children | COPPA compliance risk |
| Ads in free tier | COPPA violation risk, violates design principles |
| Upselling UI visible to children | FTC complaint risk, violates no-punitive-mechanics principle |
| Child-visible locked-feature indicators | Children should not see what they can't access |
| Cross-child comparisons in dashboard | Harmful to sibling dynamics, violates non-punitive principles |
| Session replays | High storage cost, moderate value, defer to future |
| Grandfathering existing users | Not selected for this milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROF-01 | Phase 39 | Complete |
| PROF-02 | Phase 39 | Pending |
| PROF-03 | Phase 39 | Pending |
| PROF-04 | Phase 39 | Pending |
| PROF-05 | Phase 38 | Complete |
| PROF-06 | Phase 38 | Complete |
| PROF-07 | Phase 38 | Complete |
| PROF-08 | Phase 38 | Complete |
| DASH-01 | Phase 41 | Pending |
| DASH-02 | Phase 41 | Pending |
| DASH-03 | Phase 40 | Pending |
| DASH-04 | Phase 40 | Pending |
| DASH-05 | Phase 41 | Pending |
| CTRL-01 | Phase 42 | Pending |
| CTRL-02 | Phase 42 | Pending |
| CTRL-03 | Phase 42 | Pending |
| CTRL-04 | Phase 42 | Pending |
| SUB-01 | Phase 43 | Pending |
| SUB-02 | Phase 43 | Pending |
| SUB-03 | Phase 43 | Pending |
| SUB-04 | Phase 43 | Pending |
| SUB-05 | Phase 43 | Pending |
| SUB-06 | Phase 43 | Pending |

**Coverage:**
- v0.8 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-06 after roadmap creation*
