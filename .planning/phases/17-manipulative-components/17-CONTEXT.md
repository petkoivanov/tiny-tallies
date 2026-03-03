# Phase 17: Manipulative Components - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

All 6 virtual manipulatives as fully interactive standalone components: base-ten blocks, number line, ten frame, counters, fraction strips, bar model. Each builds on the shared drag primitives from Phase 16 (DraggableItem, SnapZone, AnimatedCounter). Components are standalone — no problem/session awareness (that's Phase 18). State is ephemeral, component-local, never persisted.

</domain>

<decisions>
## Implementation Decisions

### Base-Ten Blocks
- Count-based auto-group: when 10 cubes are in the ones column, they auto-merge into a rod after ~500ms delay
- Merge animation: slide-and-stack — cubes slide together into a line, then morph/scale into a rod shape (~400ms total)
- Decompose: tap a rod to fan out 10 cubes in a row at the rod's position (visual inverse of grouping)
- Cross-column drag decompose: dragging a rod from tens to ones column auto-decomposes into 10 cubes (regrouping metaphor)
- Hundreds flats: same pattern as rods — 10 rods auto-group into a flat, tap flat to decompose into 10 rods. Consistent 10:1 pattern at all levels
- Place-value mat: labeled columns (Hundreds | Tens | Ones) with distinct background colors (e.g., blue/green/yellow) for maximum visual scaffolding
- Block sourcing: tray/palette at bottom with one of each block type. Drag from tray to mat, or tap to add
- Base-ten block color: all blocks share one color (e.g., blue). Size difference distinguishes place value — matches most classroom block sets
- 30-object cap: gentle nudge message ("Try grouping your cubes!") and prevent adding until grouping reduces count

### Number Line
- Marker movement: snap to tick marks (discrete integer steps). Hop arrows appear between start and current position
- Hop arrows: cumulative trail — as marker moves from 3 to 7, arcs appear: 3→4, 4→5, 5→6, 6→7. Each hop shows +1 with labeled arc above the line (counting-on strategy)
- Range: configurable per problem context — 0-10 for single-digit, 0-20 for within-20, 0-100 for two-digit (tick marks at 10s with expandable sections)
- Single marker only — child drags one marker to show the result. No multi-marker complexity

### Ten Frame
- Fill order: top-left to right across top row first (cells 1-5), then bottom row (6-10). Child can drag counter to any empty cell
- Second frame: auto-spawns below when first frame is full (for add-within-20 problems). Running count shows combined total
- Removal: tap an occupied cell to remove the counter (fade-out animation). Mirrors tap-to-add pattern

### Counters (Two-Color Mode)
- Two-color flip: counters start as red. Tap to flip to yellow. Running count shows both: "Red: 5 | Yellow: 3"
- Free placement: counters placed anywhere on the workspace, no grid. Children group by color naturally
- Counter colors: red and yellow — classic classroom two-sided counter colors, high contrast on dark theme

### Fraction Strips
- Shading: tap to toggle — tap a section to shade, tap again to unshade. Simple, accessible, 48dp targets
- Stacking: up to 3 strips vertically for comparison (e.g., 1/2 vs 2/4 vs 3/6)
- Denominators: 2, 3, 4, 6, 8 — Common Core grades 1-3, sections stay large enough for 48dp touch targets

### Bar Model
- Section creation: preset partition count (2, 3, 4 parts) then drag dividers to resize sections
- Labels: number picker wheel (0-999) — no keyboard, no free text input. Tap section to open picker
- "?" placeholder: tap any section to mark it as the unknown with "?" display

### Visual Design Language
- Style: flat + friendly — clean flat shapes with rounded corners and soft shadows, bold solid colors. Matches existing dark-theme high-contrast style. Child-friendly without being babyish
- Per-type color palette: each manipulative has a distinct primary color (base-ten = blue, counters = red/yellow, number line = green, ten frame = orange, fraction strips = purple, bar model = teal)
- Drag state: scale up (1.05x) + shadow lift when picked up — uses Phase 16's DRAG_SCALE/DRAG_OPACITY config consistently across all 6

### Cross-Manipulative Consistency
- Shared ManipulativeShell wrapper component: provides reset button (top-left), AnimatedCounter (top-right), and main workspace area. All 6 manipulatives render inside this shell
- Running count position: top-right corner, fixed, same for all manipulatives. Uses AnimatedCounter from Phase 16
- Reset behavior: animate items back to start positions with staggered spring animations. Uses Phase 16's RESET_SPRING_CONFIG and RESET_STAGGER_MS
- API scope: standalone only — no problem awareness, no session props. Phase 18 adds the integration layer on top

### Claude's Discretion
- Exact color hex values for each manipulative palette (within the dark-theme high-contrast constraint)
- ManipulativeShell component API details (props, flex layout, safe area handling)
- Number line tick label sizing and positioning
- Bar model divider drag handle design
- Fraction strip visual styling (border vs fill color for shaded/unshaded)
- Auto-group delay exact timing (500ms suggested but fine-tunable)
- Counter workspace dimensions and maximum counter count
- Component file organization (one file per manipulative vs split into sub-components)

</decisions>

<specifics>
## Specific Ideas

- Base-ten blocks should feel like classroom blocks — the 10:1 grouping pattern (cubes → rods → flats) is the core learning mechanic
- Number line hop arrows teach counting-on strategy — the cumulative trail is pedagogically important, not just visual decoration
- Ten frame auto-spawn for within-20 mirrors the "make a ten" strategy children learn in classrooms
- Counters with red/yellow flip are immediately recognizable to children who've used physical two-sided counters
- Fraction strips with tap-to-shade avoids drag precision issues for young children
- Bar model with number picker avoids free text input (project constraint) while staying child-friendly

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/manipulatives/shared/DraggableItem.tsx`: Gesture.Race(tap, pan) with snap-to-zone, haptic feedback, 48dp targets — use for all draggable pieces
- `src/components/manipulatives/shared/SnapZone.tsx`: Drop target with measureInWindow position reporting — use for place-value columns, ten frame cells, etc.
- `src/components/manipulatives/shared/AnimatedCounter.tsx`: Pop animation on value change — use for all running count displays
- `src/components/manipulatives/shared/snapMath.ts`: findNearestSnap, isInsideZone worklet functions — all snap logic
- `src/components/manipulatives/shared/haptics.ts`: triggerSnapHaptic (Light), triggerGroupHaptic (Success) — use for snap and auto-group events
- `src/components/manipulatives/shared/animationConfig.ts`: SNAP_SPRING_CONFIG, RETURN_SPRING_CONFIG, RESET_SPRING_CONFIG, COUNTER_POP_CONFIG, MAX_OBJECTS (30), DRAG_SCALE, DRAG_OPACITY, RESET_STAGGER_MS
- `src/services/cpa/cpaTypes.ts`: ManipulativeType enum — 'base_ten_blocks' | 'number_line' | 'fraction_strips' | 'counters' | 'ten_frame' | 'bar_model'
- `src/services/cpa/skillManipulativeMap.ts`: SKILL_MANIPULATIVE_MAP with getManipulativesForSkill/getPrimaryManipulative — used by Phase 18 for session integration

### Established Patterns
- Components under 500 lines with barrel exports (index.ts)
- StyleSheet.create for styles, not inline
- Dark theme with high contrast
- Pure function services for logic
- Ephemeral component state (never persisted to store)

### Integration Points
- Phase 18 ManipulativePanel will render these components during sessions
- Phase 19 Sandbox screens will use these same standalone components
- Phase 20 guided mode will layer onto these components

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-manipulative-components*
*Context gathered: 2026-03-03*
