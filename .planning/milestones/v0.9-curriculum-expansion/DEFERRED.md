# Deferred Items — v0.9 → Next Milestone

Items explicitly deferred from the curriculum expansion milestone.

## Deferred Math Domains

### ~~Geometry~~ — IMPLEMENTED in v0.9
6 skills (G7-8): coordinate distance, midpoint, slope, equation of a line, triangle area, circle circumference. Implemented as numeric/coordinate answer types without interactive geometry tools.

### ~~Measurement~~ — IMPLEMENTED in v0.9
5 skills (G4-5): unit conversion, perimeter, area, volume, compound shapes. Implemented as numeric answer types.

### Data & Statistics
- Picture graphs (read and interpret)
- Bar graphs (read, interpret, create)
- Tally charts (count and record)
- Line plots (Grade 3-4)
- Reading data (answer questions from graphs)

**Why deferred**: Graph rendering components needed. Different problem format (show graph, ask question). Not computation-focused.

## Deferred Features

### Interactive Clock Manipulative
- Draggable clock hands with gear linkage (minute hand moves hour hand proportionally)
- Sandbox mode for free exploration
- CPA integration for time skills
**Why deferred**: Static read-only clock ships first. Interactive version adds complexity (gesture handling, gear math, conflict with pan gestures in panel).

### Coin Drag-and-Drop Manipulative
- Drag realistic coins onto workspace
- Running total display
- Trade coins for equivalents (5 pennies → 1 nickel)
- Area model mode (squares proportional to value)
**Why deferred**: CoinDisplay (static) ships first. Interactive version is a full manipulative with drag/snap infrastructure.

### v0.8 Phases (previously planned, deferred to focus on curriculum)
- ~~Phase 41: Session History & Analytics Engine~~ — DONE (absorbed into v0.9 Phase 57: sessionHistorySlice + parent reports)
- Phase 43: Parental Time Controls — daily caps, bedtime lockout, break reminders
- Phase 44: Freemium Subscription & IAP — RevenueCat, paywall, feature gating

## Pickup Priority (suggested order for next milestone)

1. Word Problem System (Phase 54 — remaining v0.9 item)
2. Interactive manipulatives (clock, coins)
3. Data & Statistics (lower priority — less computational)
4. Parental Time Controls
5. Freemium Subscription
6. Onboarding / Placement Testing
