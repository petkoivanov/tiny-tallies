# Phase 19: Sandbox Navigation - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Per-manipulative free exploration screens accessible from the home screen. Children can freely interact with any of the 6 manipulatives (Counters, TenFrame, BaseTenBlocks, NumberLine, FractionStrips, BarModel) without time limits, scoring, or problem prompts. Sandbox state is ephemeral and does not persist across app restarts.

</domain>

<decisions>
## Implementation Decisions

### Home Screen Entry Point
- Add a "Sandbox" section below the stats section (XP/streak) on the home screen
- Display all 6 manipulatives as a 2x3 grid of tappable cards
- Wrap HomeScreen content in a ScrollView to accommodate the new section
- Section header label: "Explore"
- Start Practice button remains at the bottom after the grid

### Manipulative Gallery Cards
- Each card shows an emoji + short friendly name
- Math-themed emojis for each manipulative
- Short friendly names: Blocks, Number Line, Ten Frame, Counters, Fractions, Bar Model
- Each card gets a unique subtle accent/colored background (not uniform surface color) — emoji provides additional color pop
- Scale press feedback on tap (Pressable scale-down animation)
- Cards ordered by difficulty: Counters, Ten Frame, Blocks, Number Line, Fractions, Bar Model
- Subtle 'new' dot on cards the child hasn't explored yet — disappears permanently after first use
- 'New' dot state persists across app restarts (stored in Zustand store)

### Sandbox Screen Layout
- One shared SandboxScreen with a `manipulativeType` route param
- Navigate directly from home grid card to SandboxScreen — back button returns to home
- No in-screen manipulative picker/switcher needed
- Standard safe-area insets (consistent with rest of app)
- Workspace always starts completely empty

### Free Play Guidance
- Brief first-time tooltip on first open of each manipulative
- Per-manipulative tooltip message (specific to each manipulative, e.g., "Drag blocks to build numbers!")
- Tooltip auto-dismisses after 3 seconds
- Tooltip dismissal state persists across restarts (same store field as 'new' dot tracking)
- No analytics, no XP, no time tracking, no scoring — completely pressure-free zone
- Aligns with COPPA compliance (no usage data collection in sandbox)

### Claude's Discretion
- Card proportions (square vs rectangular) — pick what fits the screen width and looks balanced
- Tooltip visual style — pick a style consistent with the dark theme
- Exact header chrome on SandboxScreen — use existing ManipulativeShell patterns
- Per-manipulative emoji selection (math-themed, visually distinct)
- Per-manipulative tooltip messages (age-appropriate for 6-9)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ManipulativeShell` (`src/components/manipulatives/ManipulativeShell.tsx`): Wraps all 6 manipulatives with consistent reset+counter+workspace layout. Sandbox can render this directly.
- All 6 manipulative components exported from `src/components/manipulatives/index.ts`: Counters, TenFrame, BaseTenBlocks, NumberLine, FractionStrips, BarModel
- `ManipulativeType` type from `src/services/cpa/cpaTypes.ts`: 6 string literals matching the manipulatives
- Pressable with `styles.buttonPressed` pattern on HomeScreen — existing press feedback to follow
- `colors`, `spacing`, `typography`, `layout` from `@/theme` — consistent design tokens

### Established Patterns
- React Navigation 7 native-stack: AppNavigator with `RootStackParamList` type alias
- Zustand store with domain slices — 'new' dot tracking would need a small slice or extension
- `StyleSheet.create` for all styles, never inline
- `useSafeAreaInsets()` for safe area handling
- `lucide-react-native` for icons (if needed for back navigation)

### Integration Points
- `AppNavigator.tsx`: Add `Sandbox` route with `ManipulativeType` param
- `RootStackParamList` in `types.ts`: Add `Sandbox: { manipulativeType: ManipulativeType }`
- `HomeScreen.tsx` (238 lines): Add Explore section with 2x3 grid below stats — ScrollView wrapper needed
- Zustand store: Small addition for `exploredManipulatives: Set<ManipulativeType>` tracking

</code_context>

<specifics>
## Specific Ideas

- Difficulty order for grid: Counters (simplest, just drag dots) -> Ten Frame (structured grid) -> Blocks (place value) -> Number Line (linear) -> Fractions (parts) -> Bar Model (part-whole relationships)
- 'New' dot encourages children to try all 6 manipulatives — gamification-light without pressure
- First-time tooltips per manipulative ensure children understand how each tool works without requiring adult help

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-sandbox-navigation*
*Context gathered: 2026-03-03*
