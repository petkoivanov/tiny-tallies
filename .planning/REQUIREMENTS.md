# Requirements: Tiny Tallies

**Defined:** 2026-03-03
**Core Value:** Personalized, AI-guided daily math practice that adapts to each child's level, detects misconceptions, and teaches from first principles — making math fun and building real understanding.

## v0.4 Requirements

Requirements for v0.4 Virtual Manipulatives milestone. Each maps to roadmap phases.

### Manipulatives

- [x] **MANIP-01**: User can drag and drop base-ten blocks (ones cubes, tens rods, hundreds flats) onto a place-value mat
- [x] **MANIP-02**: User can auto-group 10 ones cubes into a tens rod, and tap a rod to decompose into 10 cubes
- [x] **MANIP-03**: User can drag a marker along a number line and see hop arrows with labeled values
- [x] **MANIP-04**: User can place counters on a ten frame with snap-to-cell behavior and running count display
- [x] **MANIP-05**: User can drag counters freely and use two-color mode for comparison/subtraction
- [x] **MANIP-06**: User can shade fraction strip sections and compare fractions by stacking strips
- [x] **MANIP-07**: User can create bar model part-whole layouts with labeled sections and "?" placeholder
- [x] **MANIP-08**: User can tap to add/remove pieces as alternative to dragging (48dp touch targets)
- [x] **MANIP-09**: User can reset any manipulative to its starting state
- [x] **MANIP-10**: User receives haptic feedback on snap and grouping events
- [x] **MANIP-11**: User sees a running count/value that updates when objects are placed (not during drag)

### CPA Progression

- [x] **CPA-01**: System tracks CPA stage per skill using BKT mastery (P(L) < 0.40 → concrete, 0.40–0.85 → pictorial, ≥ 0.85 → abstract)
- [ ] **CPA-02**: User sees interactive manipulatives (concrete mode) when skill mastery is low
- [ ] **CPA-03**: User sees static visual representations (pictorial mode) when skill mastery is moderate
- [ ] **CPA-04**: User sees numbers only (abstract mode) when skill mastery is high
- [ ] **CPA-05**: CPA stage advances automatically when user completes a practice session

### Session Integration

- [ ] **SESS-01**: User sees a contextually-selected manipulative as collapsible overlay during practice problems
- [ ] **SESS-02**: System auto-selects the appropriate manipulative type based on the current problem's skill
- [ ] **SESS-03**: User can expand/collapse the manipulative panel during a session

### Sandbox

- [ ] **SAND-01**: User can access per-manipulative sandbox screens from the home screen
- [ ] **SAND-02**: User can freely explore each manipulative without problem constraints
- [ ] **SAND-03**: Sandbox state is ephemeral (not persisted across app restarts)

### Polish

- [ ] **POL-01**: User sees guided mode highlighting the next suggested action on a manipulative
- [ ] **POL-02**: User can undo last action on a manipulative (max 10 steps)
- [ ] **POL-03**: User can switch counters to array grid mode for multiplication concepts
- [ ] **POL-04**: Ten frame auto-spawns a second frame for add-within-20 problems

### Foundation

- [x] **FOUND-01**: Store schema supports CPA level per skill (STORE_VERSION 5 with migration)
- [x] **FOUND-02**: Babel config updated for Reanimated 4 worklet compilation
- [x] **FOUND-03**: Shared drag primitives (DraggableItem, SnapZone) run snap logic on UI thread at 60fps
- [x] **FOUND-04**: Manipulative-to-skill mapping table determines which manipulative suits each math concept

## Future Requirements

Deferred to v0.5+ milestones. Tracked but not in current roadmap.

### AI Tutor Integration

- **TUTOR-01**: ManipulativeEvent logging for AI tutor analysis
- **TUTOR-02**: CPA stage badge visible to child in UI
- **TUTOR-03**: AI tutor references manipulative state in hints

### Advanced Interactions

- **ADV-01**: Pinch-to-zoom on number line for fractions
- **ADV-02**: Fraction circles (pie mode) as alternative to strips

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Free-draw / whiteboard on manipulative canvas | Clutters canvas, breaks skill tracking |
| Voice-controlled placement | Unreliable for child voices, COPPA audio capture concerns |
| Multiplayer shared canvas | COPPA blocks real-time sharing; adds infrastructure complexity |
| Auto-animate "watch me solve it" mode | Passive viewing does not transfer; violates HINT mode guardrail |
| Unlimited draggable objects (no cap) | JS thread cannot maintain 60fps beyond ~30 objects; cap at 30 with auto-grouping |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 15 | Complete |
| FOUND-02 | Phase 15 | Complete |
| FOUND-04 | Phase 15 | Complete |
| CPA-01 | Phase 15 | Complete |
| FOUND-03 | Phase 16 | Complete |
| MANIP-08 | Phase 16 | Complete |
| MANIP-09 | Phase 16 | Complete |
| MANIP-10 | Phase 16 | Complete |
| MANIP-11 | Phase 16 | Complete |
| MANIP-01 | Phase 17 | Complete |
| MANIP-02 | Phase 17 | Complete |
| MANIP-03 | Phase 17 | Complete |
| MANIP-04 | Phase 17 | Complete |
| MANIP-05 | Phase 17 | Complete |
| MANIP-06 | Phase 17 | Complete |
| MANIP-07 | Phase 17 | Complete |
| CPA-02 | Phase 18 | Pending |
| CPA-03 | Phase 18 | Pending |
| CPA-04 | Phase 18 | Pending |
| CPA-05 | Phase 18 | Pending |
| SESS-01 | Phase 18 | Pending |
| SESS-02 | Phase 18 | Pending |
| SESS-03 | Phase 18 | Pending |
| SAND-01 | Phase 19 | Pending |
| SAND-02 | Phase 19 | Pending |
| SAND-03 | Phase 19 | Pending |
| POL-01 | Phase 20 | Pending |
| POL-02 | Phase 20 | Pending |
| POL-03 | Phase 20 | Pending |
| POL-04 | Phase 20 | Pending |

**Coverage:**
- v0.4 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after roadmap creation*
