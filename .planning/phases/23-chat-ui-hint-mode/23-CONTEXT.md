# Phase 23: Chat UI & HINT Mode - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

A child can tap Help during a practice problem and receive Socratic hints through a chat bubble interface that resets per-problem and degrades gracefully offline. This phase delivers: help button on session screen, chat bottom sheet with bubble UI, pre-defined response buttons, per-problem reset with AbortController cleanup, offline detection, and HINT mode integration via useTutor. TEACH/BOOST modes and auto-escalation are Phase 24.

</domain>

<decisions>
## Implementation Decisions

### Help Button Placement & Behavior
- Bottom-right floating action button (FAB-style), positioned above the answer grid
- Subtle pulse animation 1-2 times after a wrong answer to remind help is available; stops after first use
- CircleHelp icon from lucide-react-native with "Help" text label below (accessible for pre-readers)
- Button hides when chat panel is open; reappears when chat closes

### Chat Panel Layout
- Bottom sheet that slides up from bottom, covering ~60% of screen height
- Problem remains visible above the sheet for context
- Dismiss via X button in chat header AND swipe-down gesture (two methods for accessibility)
- Auto-scroll to latest message; child can scroll up to re-read earlier hints

### Chat Bubble Styling
- Rounded bubbles, color-coded: tutor messages in soft blue/purple (left-aligned), child responses in green (right-aligned)
- Familiar chat pattern with rounded corners and subtle drop shadow
- Must respect existing dark theme and high-contrast design language

### Response Buttons & Conversation Flow
- 3 contextual buttons after each tutor message: "I understand!", "Tell me more", "I'm confused"
- On "I understand!": tutor shows brief encouragement ("Great! Give it a try!") then auto-closes chat after ~1.5s
- On "Tell me more": requests next Socratic hint (increments hint level)
- On "I'm confused": signals struggle (used by auto-escalation in Phase 24, for now triggers a rephrased hint)
- Buttons remain static regardless of hint count (no adaptation by hint level)
- When child taps Help initially, tutor immediately delivers the first Socratic hint for the current problem (no greeting, no button-first flow — straight to value)

### Offline & Loading States
- Loading: animated typing indicator dots in a tutor-styled bubble (three dots, like iMessage "typing...")
- Offline (tap Help while offline): chat panel opens with friendly message: "I can't help right now because we're not connected to the internet. Keep trying — you've got this!" with a retry button
- Mid-conversation disconnect: inline tutor bubble with "Oops, we lost connection! Your earlier messages are still here. Try again when you're back online." Chat stays open, conversation preserved
- On LLM failure/timeout: show canned fallback message + single "Try again" button. If retry also fails, just show the fallback, no further retry. Child can close and re-tap Help to start fresh

### Claude's Discretion
- Exact animation timing and easing curves for bottom sheet and help button pulse
- Chat panel header design (title text, close button styling)
- Typing indicator animation implementation details
- Response button styling (colors, spacing, border radius)
- Exact encouragement messages for "I understand!" response

</decisions>

<specifics>
## Specific Ideas

- Help button pulse should be gentle — not distracting during problem solving, just a subtle nudge after a wrong answer
- The "straight to first hint" flow avoids wasting the child's time on pleasantries — they asked for help, give them help
- Auto-close after "I understand!" with encouragement bridges the transition back to the problem naturally
- Retry button on failure gives agency without overwhelming — one chance, then graceful fallback

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ManipulativePanel`: Animated collapsible drawer (Reanimated) — similar bottom-sheet pattern, can reference for animation approach
- `useTutor` hook: Already wired with full safety pipeline, rate limiting, AbortController lifecycle — chat UI just calls `requestHint()`
- `AnswerFeedbackAnimation`: Existing animation component — reference for timing patterns
- `@react-native-community/netinfo` (v11.4.1): Already installed for offline detection
- `lucide-react-native`: Already used for icons (CircleHelp available)
- `tutorSlice`: Messages array, loading/error state, hint level — all chat state management ready
- Theme constants: `colors`, `spacing`, `typography`, `layout` from `@/theme`

### Established Patterns
- Component composition: Screen → Components → Hooks → Services
- StyleSheet.create for all styles (no inline objects)
- Reanimated for animations (ManipulativePanel, ConfettiCelebration)
- 48dp minimum touch targets throughout the app
- Dark theme with high-contrast colors

### Integration Points
- `SessionScreen.tsx`: Help button and chat panel mount here, alongside CpaSessionContent and ManipulativePanel
- `useSession`: Provides currentProblem, currentIndex (chat resets when currentIndex changes)
- `useTutor`: requestHint(), resetChat(), messages, isLoading, error — the data layer
- `tutorSlice`: addMessage, setLoading, setError, resetSession, incrementHintLevel
- `useCpaMode`: CPA stage for prompt context (already read by useTutor)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 23-chat-ui-hint-mode*
*Context gathered: 2026-03-04*
