# Phase 9: Session & Results UI Polish - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish SessionScreen and ResultsScreen into a child-friendly, readable, and physically comfortable experience. Add visual progress indicator, answer button feedback states, expanded results content (level/streak/motivation), and ensure 48dp touch targets and dark theme consistency across all three screens.

</domain>

<decisions>
## Implementation Decisions

### Session Progress Indicator
- Replace "3 / 15" text-only progress with a horizontal progress bar below the header row
- Bar fills left-to-right as questions are answered — full width, same visual pattern as HomeScreen XP bar
- Keep "3 / 15" count text above or beside the bar for precise position
- Color-code the progress bar by session phase: distinct color per phase (Warmup / Practice / Cooldown)
- Keep the text phase label ("Warmup" / "Practice" / "Cooldown") in the header alongside color

### Answer Button Feedback
- When child taps an answer, color the tapped button: green border/background for correct, red for incorrect
- On wrong answer, show the tapped button as incorrect (red) first, then after a brief delay (~500ms) highlight the correct answer button in green
- Keep 2x2 grid layout for 4 multiple-choice options (current layout, well above 48dp)
- Add scale-on-press effect: button slightly shrinks (scale ~0.95) when finger is down for tactile feel
- Remove the separate feedback icon (Check/X above grid) — button coloring replaces it

### Results Screen Content
- Show XP progress bar with before/after fill — visually animate from start-of-session XP to end. Show "+85 XP" label.
- Dynamic motivational message based on score percentage: "Amazing!" (90%+), "Great job!" (70-89%), "Nice effort!" (below 70%). Always positive, never punitive.
- Streak displayed inline in the stats card as a row: "Streak: 3 weeks ✓" with Flame icon (matching HomeScreen pattern)
- Level-up callout: when leveled up, add a prominent "Level Up! → Level 6" text row in the stats card with primaryLight color
- Phase 10 adds animation on top of this static content

### Theme & Touch Target Audit
- Audit all three screens (Home, Session, Results) for 48dp touch target compliance and dark theme consistency
- Keep current palette: navy (#1a1a2e) + indigo (#6366f1) + lime green (correct) + soft red (incorrect)
- Keep quit button (X) as-is: plain icon in muted color, deliberately understated, already meets 48dp
- Keep problem text at fontSize.display (48dp) — prioritize readability for ages 6-9

### Claude's Discretion
- Exact phase colors for progress bar (which color per Warmup/Practice/Cooldown)
- Exact delay timing for correct answer reveal (around 500ms)
- Scale animation implementation (Animated API vs Reanimated)
- How to pass level-up and streak data to ResultsScreen (route params extension vs store read)
- Stats card row ordering on results screen
- Whether motivational message uses emoji or stays text-only

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HomeScreen.tsx`: XP progress bar pattern (container + fill with borderRadius, calculateLevelFromXp) — reuse for results screen XP bar
- `theme/index.ts`: Full theme system (colors, spacing, typography with Lexend, layout with minTouchTarget=48, borderRadius)
- `gamificationSlice.ts`: xp, level, weeklyStreak, lastSessionDate state — read for results display
- `levelProgression.ts`: calculateLevelFromXp for XP bar math
- `weeklyStreak.ts`: isSameISOWeek for streak indicator
- `lucide-react-native`: Check, X (currently used), Flame (used on HomeScreen) — available for results

### Established Patterns
- StyleSheet.create for all styles (no inline)
- useSafeAreaInsets for safe area padding
- useAppStore with atomic selectors for minimal re-renders
- Pressable with pressed callback for button states
- Route params for passing data between screens (ResultsScreen reads score/total/xpEarned/durationMs from params)
- Dark theme with colors.background, colors.surface, colors.surfaceLight hierarchy

### Integration Points
- SessionScreen: useSession hook returns currentProblem, feedbackState, handleAnswer — needs selectedAnswer tracking for button coloring
- ResultsScreen: route.params currently has { score, total, xpEarned, durationMs } — needs extension for level-up and streak data
- Navigation types: RootStackParamList in src/navigation/types.ts — update Results params
- commitSessionResults already returns SessionFeedback with leveledUp, levelsGained, streakCount, practicedThisWeek

</code_context>

<specifics>
## Specific Ideas

- Answer button coloring replaces the separate feedback icon — feedback is directly on the button the child tapped, not a disconnected icon above
- "Show after brief delay" pattern for correct answer reveal: wrong (red) first, then correct (green) appears. Teaches through feedback.
- Scale-on-press (0.95) is common in children's apps — gives satisfying tactile feel
- Results screen should feel like a reward moment: "Amazing! +85 XP, Level Up! → Level 6, 3 week streak ✓"
- Progress bar color-coded by phase gives visual variety without text — child can "feel" the phases changing

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-session-results-ui-polish*
*Context gathered: 2026-03-02*
