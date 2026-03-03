# Phase 10: Animated Feedback & Celebrations - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Add animated visual feedback for correct/incorrect answers on SessionScreen and a level-up celebration animation on ResultsScreen. Builds on top of Phase 9's static styling (green/red borders, level-up text callout). Uses react-native-reanimated (already in deps).

</domain>

<decisions>
## Implementation Decisions

### Correct Answer Animation
- Bounce + color pulse on the tapped button: scale 1.0 → 1.1 → 1.0 with a green color pulse radiating outward
- Plays on top of the existing green border/background from Phase 9
- Quick and satisfying — not distracting (happens 15 times per session)
- Use react-native-reanimated for smooth 60fps animation

### Incorrect Answer Animation
- Soft shake on the tapped button: 2-3 small left-right oscillations
- Universal "not quite" signal — brief and non-punitive
- Plays on top of the existing red border/background from Phase 9
- Must feel gentle, not jarring or scary

### Level-Up Celebration
- Full-screen confetti overlay on ResultsScreen when leveledUp is true
- Confetti particles rain down across the entire screen for 2-3 seconds
- "Level Up!" text could also scale up as part of the celebration
- This is a rare event (every few sessions) so it should feel like a big moment
- Builds on top of the existing "Level Up! → Level N" text row from Phase 9

### Animation Timing
- Non-blocking: animations play alongside the existing ~800ms feedback delay
- Buttons are already disabled during feedback (Phase 9), so no extra waiting needed
- No additional interaction blocking beyond existing feedback flow

### Claude's Discretion
- Exact animation curve/easing for bounce and shake (spring vs timing)
- Confetti particle count, colors, fall speed, and distribution
- Whether to use a confetti library or build simple particle system
- Exact duration of bounce/shake animations
- Whether "Level Up!" text animates (scale up) or stays static during confetti
- How to structure animation components (inline vs extracted)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `react-native-reanimated`: Already in dependencies, available for 60fps animations
- `SessionScreen.tsx`: Has feedbackState, selectedAnswer, correctAnswer, showCorrectAnswer — all triggers for animation
- `ResultsScreen.tsx`: Has leveledUp boolean and "Level Up!" text row — trigger for celebration
- `theme/index.ts`: colors.correct (#84cc16) for positive, colors.incorrect (#f87171) for negative animations

### Established Patterns
- Pressable with pressed callback already handles scale-on-press (0.95) — animations extend this
- StyleSheet.create for all styles
- feedbackState drives the feedback flow: null → { correct: boolean } → null after ~800ms timeout

### Integration Points
- SessionScreen: feedbackState triggers correct/incorrect animations on the tapped button
- SessionScreen: selectedAnswer identifies which button to animate
- ResultsScreen: leveledUp route param triggers confetti overlay
- useSession hook: controls feedback timing (existing ~800ms delay works with animations)

</code_context>

<specifics>
## Specific Ideas

- Correct bounce should feel satisfying — like a "yes!" moment, quick springy bounce
- Incorrect shake should be empathetic — like the button gently nodding "not quite," not a harsh error shake
- Level-up confetti should be the most joyful moment in the app — rare and earned
- Animations must not slow down the session flow — they enhance, not interrupt

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-animated-feedback-celebrations*
*Context gathered: 2026-03-02*
