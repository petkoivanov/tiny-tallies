# Phase 34: Visual Skill Map - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can explore their learning progress as an interactive visual tree showing the 14-skill prerequisite DAG with mastery states. Each node reflects locked/unlocked/in-progress/mastered state from BKT data. Tapping a node shows a detail overlay with mastery progress, practice level, and prerequisite status. Nodes and edges animate to highlight the active learning frontier. No practice-from-map navigation — the map is informational only. Daily challenges, avatar customization, and themes are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Graph layout & orientation
- Top-down vertical tree: Grade 1 skills at top, Grade 3 at bottom
- Two columns: addition (left), subtraction (right) with cross-links between them
- Fits on one screen — all 14 nodes visible without scrolling
- Column headers ("Addition", "Subtraction") at top with grade indicators (Grade 1/2/3) along the side
- Edge rendering (curved vs straight, bezier style) at Claude's discretion

### Node visual design
- Circular nodes with operation emoji (+ for addition, - for subtraction) and colored state ring
- Four state visuals:
  - Locked: dimmed/gray circle with lock icon overlay
  - Unlocked: accent-colored outline ring, no fill
  - In-progress: partial fill ring (progress donut based on masteryProbability)
  - Mastered: solid gold/green ring with checkmark or star overlay
- Small abbreviated label below each node (e.g. "Add 10", "Sub 20+carry")
- Operation-tinted node colors: blue-purple family for addition, teal-green family for subtraction
- State ring colors overlay on top of operation tint

### Detail overlay
- Centered modal (matches BadgeDetailOverlay pattern) — tap outside to dismiss
- Child-friendly data presentation:
  - Mastery as colorful progress bar ("How well you know this!")
  - Leitner box as 1-6 stars or stepping stones ("Practice level")
  - BKT probability drives the progress bar but is not shown as a number
- View only — no "Practice" action button (informational map)
- Locked skills show prerequisite names with completion status checkmarks (e.g. "Master 'Add 10' ✓, 'Subtract 10' ✗")
- Unlocked/in-progress/mastered skills show skill name, operation emoji large, progress bar, practice level stars

### Interaction & animation
- Fixed layout — no pan/zoom. Tap nodes to see detail overlay as the only interaction
- Staggered node reveal on screen open: nodes fade/scale in top-to-bottom (~50ms stagger per node, ~700ms total), edges draw in after nodes
- Outer fringe edges glow with subtle pulse — highlights skills currently available to learn (uses existing getOuterFringe())
- Outer fringe nodes have gentle idle breathing pulse to draw attention
- Mastered/locked nodes are static after entrance animation
- State-change animation details (mastery fill, unlock pulse) at Claude's discretion

### Claude's Discretion
- Edge rendering approach (curved bezier vs straight diagonal)
- Exact node sizes, spacing, and typography within the fits-on-screen constraint
- Exact color values for operation tints (within blue-purple addition / teal-green subtraction families)
- Stagger timing and easing curves for entrance animation
- State-change animation specifics (mastery fill transition, unlock celebration pulse)
- Progress bar and stars styling in detail overlay
- SVG vs View-based rendering decision for nodes (performance tradeoff)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SKILLS` array (`services/mathEngine/skills.ts`): 14 SkillDefinition objects with id, name, operation, grade, prerequisites — the DAG data source
- `isSkillUnlocked()`, `getUnlockedSkills()`, `getOuterFringe()` (`services/adaptive/prerequisiteGating.ts`): prerequisite gate logic, outer fringe calculation
- `skillStatesSlice` (`store/slices/skillStatesSlice.ts`): SkillState with masteryProbability, masteryLocked, leitnerBox, attempts, cpaLevel
- `getOrCreateSkillState()` (`store/helpers/skillStateHelpers.ts`): safe accessor for skill state with defaults
- `BKT_MASTERY_THRESHOLD = 0.95` (`services/adaptive/bktCalculator.ts`): mastery threshold constant
- `react-native-svg` v15.12.1: already installed, used in NumberLineSvg and pictorial diagrams
- `BadgeDetailOverlay` pattern (`screens/BadgeCollectionScreen.tsx`): centered modal with dim background, tap-to-dismiss
- `NumberLineSvg` (`components/manipulatives/NumberLine/NumberLineSvg.tsx`): SVG with onLayout width tracking, bezier Path curves — pattern for responsive SVG rendering

### Established Patterns
- SVG rendering: `import Svg, { Line, Circle, Path, Text as SvgText } from 'react-native-svg'` with onLayout width measurement
- Reanimated animations: useSharedValue, useAnimatedStyle, withSpring, withDelay — used in badge popups and ResultsScreen bounce-on-mount
- Screen structure: useSafeAreaInsets for paddingTop, useNavigation typed via global augmentation, granular Zustand selectors
- Dark theme: navy #1a1a2e background, purple #6366f1/#818cf8 accents, green #84cc16 for correct
- 48dp minimum touch targets, Lexend font, StyleSheet.create for all styles
- lucide-react-native for icons (ChevronLeft for back button)

### Integration Points
- `RootStackParamList` in `navigation/types.ts`: add `SkillMap: undefined`
- `AppNavigator.tsx`: register SkillMapScreen
- `HomeScreen`: add entry point to skill map (button or pressable in stats section)
- `skillStates` store: read masteryProbability, masteryLocked, leitnerBox, attempts per skill

</code_context>

<specifics>
## Specific Ideas

- Operation emoji in nodes (+ and -) matches the math domain and is instantly recognizable for ages 6-9
- Outer fringe glow/pulse creates a "here's what to learn next" wayfinding experience without explicit text instructions
- Prerequisite checklist in locked skill overlay gives children a concrete "what do I need to do" answer
- Progress bars over raw numbers — a 6-year-old understands a filling bar, not "P(L) = 0.73"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 34-visual-skill-map*
*Context gathered: 2026-03-05*
