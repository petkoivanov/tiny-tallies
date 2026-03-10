# Deferred Items — v0.9 → Next Milestone

Items explicitly deferred from the curriculum expansion milestone.

## Deferred Math Domains

### Geometry
- 2D shapes (identify, classify, attributes)
- 3D shapes (identify, faces, edges, vertices)
- Symmetry (line symmetry, identify symmetrical shapes)
- Spatial reasoning (rotation, reflection)
- Perimeter (calculate perimeter of polygons)
- Area (count squares, multiply length × width)
- Angles (right angles, acute/obtuse — Grade 4)

**Why deferred**: Requires fundamentally different UI — shape rendering, interactive geometry tools. Not multiple-choice friendly. Needs separate design work.

### Measurement (Length, Weight, Capacity)
- Measure lengths (inches, centimeters, feet)
- Compare lengths (longer/shorter)
- Weight/mass (grams, kilograms, pounds, ounces)
- Capacity/volume (liters, milliliters, cups, gallons)
- Temperature (Fahrenheit, Celsius — reading thermometers)
- Unit conversion (Grade 4: feet↔inches, kg↔g, etc.)

**Why deferred**: Measurement problems need visual aids (rulers, scales, measuring cups). Interactive ruler/scale components require significant UX design.

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
- Phase 41: Session History & Analytics Engine — partially absorbed into Phase 57 (parent reports collect session data)
- Phase 43: Parental Time Controls — daily caps, bedtime lockout, break reminders
- Phase 44: Freemium Subscription & IAP — RevenueCat, paywall, feature gating

## Pickup Priority (suggested order for next milestone)

1. Session History & Analytics (foundation for everything else)
2. Geometry (high curriculum value, kids expect shapes)
3. Measurement (ties into money/time concepts)
4. Interactive manipulatives (clock, coins)
5. Data & Statistics (lower priority — less computational)
6. Parental Time Controls
7. Freemium Subscription
