# Phase 20: Polish - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhanced manipulative interactions: guided hints that highlight the next suggested action, undo capability (max 10 steps) across all 6 manipulatives, counter array grid mode for multiplication concepts, and ten frame double-frame pre-spawning for add-within-20 problems. Builds on all 6 existing manipulative components from Phase 17, session integration from Phase 18, and sandbox from Phase 19.

</domain>

<decisions>
## Implementation Decisions

### Guided Mode Behavior
- Activates only in concrete CPA mode (low mastery) during practice sessions — not in sandbox, not in pictorial/abstract
- Visual indicator: pulsing glow animation on the next suggested target zone/item (soft green highlight pulse)
- Suggest only — child can still interact freely with any part of the manipulative. No disabling, no restrictions
- If the child takes a different action than suggested, the hint just updates to reflect the new state
- Steps determined via pre-computed lookup table: problem type + manipulative type → sequence of guided steps
- Matches the "no punitive mechanics" philosophy — guidance, not enforcement

### Undo Capability
- Undo across all 6 manipulatives — consistent behavior, no "why doesn't undo work here?" confusion
- Each manipulative tracks its own action history (max 10 steps)
- Auto-grouping in base-ten blocks counts as one undoable action — undoing restores the 10 cubes from the rod
- Reverse animation on undo — counter slides back to tray, rod decomposes back to cubes. Builds spatial understanding of what changed
- Undo button in ManipulativeShell header bar, next to the existing reset button (existing 56dp header)
- Uses existing spring animation configs for reverse animations
- Works in both session and sandbox contexts

### Counter Array Grid Mode
- Toggle button in ManipulativeShell header — 'Grid' / 'Free' toggle next to reset and undo buttons
- Counters animate from free positions to grid positions (and vice versa) on toggle
- Configurable rows × columns — max 10×10
- In sandbox: row/column pickers (like BarModel's NumberPicker wheel pattern) to set grid dimensions
- In session: problem auto-configures grid dimensions from multiplication operands (e.g., 3×4 problem → 3 rows, 4 columns)
- Available in both sandbox and session contexts
- Grid counters snap to intersections, showing multiplication as repeated addition visually

### Ten Frame Double-Frame
- Pre-spawn second frame for problems where answer > 10 (e.g., 7+6=13) — both frames visible from start
- In sandbox: always show two frames from the start — free exploration, no constraints
- New optional `initialFrames` prop on TenFrame component — CpaSessionContent passes `initialFrames={2}` for >10 problems, sandbox passes `initialFrames={2}` always
- Default stays `initialFrames={1}` for backward compatibility
- Existing auto-spawn behavior (second frame on first full) remains as fallback

### Claude's Discretion
- Guided mode lookup table content — specific step sequences per problem type + manipulative combination
- Glow animation styling (color intensity, pulse timing, opacity)
- Undo button icon choice (from lucide-react-native)
- Action history data structure (state snapshots vs action replay)
- Grid/Free toggle button visual design
- Row/column picker layout and positioning in array grid mode
- How existing counters animate between free and grid positions

</decisions>

<specifics>
## Specific Ideas

- Guided mode should feel like a gentle teacher pointing — "try here next" — not a locked-down tutorial
- Undo reverse animations are pedagogically valuable — the child sees what changed and builds spatial reasoning about cause/effect
- Array grid mode makes multiplication concrete: 3 rows × 4 columns = 12 counters. The visual IS the math
- Pre-spawning two frames for add-within-20 helps children plan their "make a ten" strategy before placing counters

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ManipulativeShell.tsx` (99 lines): Header bar with reset + counter — undo and grid toggle will go here
- `animationConfig.ts`: SNAP_SPRING_CONFIG, RETURN_SPRING_CONFIG, RESET_SPRING_CONFIG — reuse for reverse undo animations
- `DraggableItem.tsx`: Already supports onRegister callback for parent-driven animated resets — same pattern for undo
- `SnapZone.tsx`: Measurement system for snap targets — reuse for array grid snap zones
- `NumberPicker` pattern from BarModel: Wheel-style picker — reuse for row/column selectors in array mode
- `SandboxTooltip.tsx`: Auto-dismissing overlay — similar pattern possible for guided mode hints
- `haptics.ts`: triggerSnapHaptic, triggerGroupHaptic — reuse for undo feedback

### Established Patterns
- All manipulatives use `useState` with spread operators (immutable updates) — ready for action history wrapping
- ManipulativeShell renders children, passes count + onReset callbacks — extend for onUndo
- TenFrame already has frameCount state and auto-spawn logic — extend with initialFrames prop
- Counters already has free placement with absolute positioning — add grid layout as alternative

### Integration Points
- `ManipulativeShell`: Add undo button + grid toggle to header
- `CpaSessionContent`: Pass `guidedMode` flag and `initialFrames` to manipulatives in concrete mode
- All 6 manipulative components: Add action history tracking via shared hook
- `TenFrame`: Accept optional `initialFrames` prop
- `Counters`: Add grid mode state and snap zone generation

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-polish*
*Context gathered: 2026-03-03*
