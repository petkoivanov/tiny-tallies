# Phase 18: CPA Progression and Session Integration - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Practice sessions automatically show the right representation (concrete manipulative, pictorial diagram, or abstract numbers) based on the child's mastery of each skill. Includes a collapsible manipulative overlay for hands-on problem solving in concrete mode, static pictorial diagrams for mid-mastery skills, and an optional scaffolding path from pictorial back to interactive. CPA stage is per-skill and per-problem within a session.

</domain>

<decisions>
## Implementation Decisions

### Panel Layout and Sizing
- Bottom drawer pattern: manipulative panel slides up from below the answer grid when expanded
- Problem text + answer buttons stay at top; manipulative workspace below
- Panel height ~50% of screen when expanded — generous workspace for base-ten blocks and other complex manipulatives
- When panel is open, answer buttons switch from 2x2 grid to a single horizontal row of 4 smaller buttons (still 48dp minimum)
- In concrete mode (low mastery), panel starts expanded automatically — the child needs hands-on help
- In pictorial/abstract mode, no panel is shown by default (pictorial uses inline diagram instead)

### Pictorial Mode Visuals
- Static auto-generated SVG diagrams — NOT interactive, NOT read-only manipulatives
- Per-manipulative pictorial renderers: each manipulative type gets its own static SVG style (counters show dot groups, base-ten shows block diagrams, number line shows labeled line, etc.)
- Pictorial diagram shown inline between problem text and answer buttons — always visible, no toggle needed
- "Need help?" button below the pictorial diagram opens the full interactive manipulative in the collapsible panel (scaffolding without CPA regression, per Phase 15 decision)

### Expand/Collapse Interaction
- Toggle button as primary interaction: prominent labeled button (blocks icon + "Show blocks") between answers and panel area
- Tap to expand, tap again to collapse — simple, discoverable, 48dp target
- Icon changes to indicate panel state (open/closed)
- Smooth slide animation (~300ms spring) using Reanimated for 60fps — consistent with app's animation style
- Panel collapses and manipulative resets when advancing to the next problem — child starts fresh each time
- Manipulative starts empty — child builds the representation themselves (the act of building IS the learning)

### CPA Mode Transitions
- Per-problem CPA: each problem uses the CPA stage of its own skill — sessions mix concrete, pictorial, and abstract problems as appropriate
- Subtle celebration on Results screen when CPA stage advances: "You leveled up! Now you can solve with pictures!" — no interruption during practice
- Small icon in session header showing current CPA mode (blocks/picture/numbers icon) — informational only
- Abstract mode = current SessionScreen unchanged — no manipulatives, no diagrams, just problem + answers

### Claude's Discretion
- Exact pictorial SVG rendering implementation for each manipulative type
- Toggle button visual design (icon choice, label text, placement coordinates)
- Spring animation configuration for panel slide
- Compact answer row layout details (spacing, sizing within 48dp constraint)
- CPA mode icon design and header placement
- Results screen celebration message copy and animation

</decisions>

<specifics>
## Specific Ideas

- Bottom drawer metaphor = "reach down for help" — natural gesture for children
- Panel starts expanded in concrete mode because children at this stage NEED the manipulative — don't make them discover it
- Manipulative starts empty because the act of building the number representation is itself pedagogically valuable (CPA research)
- Per-problem CPA accurately reflects mastery differences across skills — a child might be abstract at single-digit addition but concrete at two-digit subtraction
- "Need help?" button in pictorial mode follows the concreteness fading research (Fyfe et al.) — scaffolding without regression

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SessionScreen.tsx`: Current session UI (363 lines) — will need modification to support CPA modes and manipulative panel
- `useSession.ts`: Session lifecycle hook — already tracks `currentProblem.skillId` which feeds into CPA stage lookup
- `cpaMappingService.ts`: `deriveCpaStage()` and `advanceCpaStage()` — pure functions for CPA stage derivation
- `skillManipulativeMap.ts`: `getPrimaryManipulative(skillId)` — returns the best manipulative type for a skill
- `ManipulativeShell.tsx`: Shared wrapper (reset + counter + workspace) — used by all 6 manipulatives
- All 6 manipulative components: Counters, TenFrame, NumberLine, FractionStrips, BarModel, BaseTenBlocks — standalone, ephemeral state
- `animationConfig.ts`: Shared animation constants (SNAP_SPRING_CONFIG, etc.) — reuse for panel animations
- `AnswerFeedbackAnimation.tsx`: Existing answer feedback wrapper — answers layout change must preserve this

### Established Patterns
- Components under 500 lines with barrel exports
- StyleSheet.create for styles, not inline
- useSharedValue + useAnimatedStyle for Reanimated animations
- Gesture.Race(tap, pan) composition for touch handling
- Pure function services for logic (CPA mapping, BKT, Elo)
- Commit-on-complete pattern: CPA advance happens in commitSessionResults at session end

### Integration Points
- `useSession` hook: needs to expose `skillId` per problem for CPA stage lookup
- `SessionScreen`: primary modification target — add ManipulativePanel, pictorial diagrams, CPA-aware rendering
- `commitSessionResults`: already handles CPA advance (Phase 15) — no changes needed
- `appStore`: reads `cpaLevel` from `skillStates[skillId]` — already available
- Navigation: no new screens — all changes are within SessionScreen

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-cpa-progression-and-session-integration*
*Context gathered: 2026-03-03*
