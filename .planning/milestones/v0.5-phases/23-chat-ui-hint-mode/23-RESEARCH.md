# Phase 23: Chat UI & HINT Mode - Research

**Researched:** 2026-03-04
**Domain:** React Native chat UI, bottom sheet animation, offline detection, Socratic hint integration
**Confidence:** HIGH

## Summary

Phase 23 delivers the first user-facing AI tutor interaction: a help button on the session screen that opens a chat bottom sheet with Socratic hints. The entire data layer is already built (Phases 21-22): `useTutor` hook, `tutorSlice`, Gemini client, safety pipeline, rate limiting, and canned fallbacks. This phase is purely UI + integration -- wiring existing hooks to new visual components.

The approach is straightforward: build a custom bottom sheet using Reanimated (matching the existing ManipulativePanel pattern), add `useNetInfo` from `@react-native-community/netinfo` (already installed) for offline detection, compose chat bubble components with `StyleSheet.create`, and integrate into `SessionScreen.tsx` by wiring `useTutor` + `useSession` hooks. No new dependencies are needed.

**Primary recommendation:** Build a custom animated bottom sheet (not `@gorhom/bottom-sheet`) following the ManipulativePanel pattern already in the codebase. All chat state management uses the existing `tutorSlice` -- no new store slices or migrations needed.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Help button: Bottom-right FAB-style, CircleHelp icon from lucide-react-native with "Help" text label, positioned above answer grid
- Subtle pulse animation 1-2 times after wrong answer; stops after first use
- Button hides when chat panel is open; reappears when chat closes
- Bottom sheet slides up from bottom, covering ~60% of screen height
- Problem remains visible above the sheet for context
- Dismiss via X button in chat header AND swipe-down gesture
- Auto-scroll to latest message; child can scroll up to re-read
- Tutor bubbles: soft blue/purple, left-aligned. Child bubbles: green, right-aligned. Rounded corners + subtle drop shadow
- Must respect existing dark theme and high-contrast design language
- 3 contextual buttons after each tutor message: "I understand!", "Tell me more", "I'm confused"
- "I understand!" -> brief encouragement -> auto-close chat after ~1.5s
- "Tell me more" -> requests next Socratic hint (increments hint level)
- "I'm confused" -> rephrased hint (Phase 24 escalation later)
- Buttons remain static regardless of hint count
- First tap on Help immediately delivers first Socratic hint (no greeting, no button-first flow)
- Loading: animated typing indicator dots in tutor-styled bubble
- Offline tap: chat opens with friendly message + retry button
- Mid-conversation disconnect: inline tutor bubble with offline message, chat stays open
- LLM failure/timeout: canned fallback + single "Try again" button; if retry also fails, just fallback, no further retry
- Child can close and re-tap Help to start fresh

### Claude's Discretion
- Exact animation timing and easing curves for bottom sheet and help button pulse
- Chat panel header design (title text, close button styling)
- Typing indicator animation implementation details
- Response button styling (colors, spacing, border radius)
- Exact encouragement messages for "I understand!" response

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | Child-initiated help button visible during session (never auto-triggers) | FAB component with CircleHelp icon, conditionally rendered based on `sessionPhase` and chat panel open state. Pulse animation via Reanimated `withRepeat`/`withSequence` triggered by wrong-answer feedback. |
| CHAT-02 | Chat bubble UI with tutor and child message styling | ChatPanel component with ScrollView, ChatBubble component with role-based styling (tutor left blue/purple, child right green). Uses existing `TutorMessage` type from tutorSlice. |
| CHAT-03 | Pre-defined response buttons for child input (no free-text) | ResponseButtons component renders 3 fixed buttons. Child taps add a `role: 'child'` message to tutorSlice then invoke appropriate action. |
| CHAT-04 | Per-problem chat reset on problem advance with AbortController cleanup | Watch `currentIndex` from useSession; call `resetForProblem()` from useTutor on change. useTutor already handles AbortController abort + tutorSlice reset. |
| CHAT-05 | Offline detection with friendly message when network unavailable | `useNetInfo()` hook from `@react-native-community/netinfo` (already installed v11.4.1, already mocked in jest.setup.js). Check `isConnected` before requesting hint. |
| MODE-01 | HINT mode delivers Socratic questions that never reveal the answer | Already implemented in useTutor + safety pipeline (Phase 22). Chat UI calls `requestHint()` which uses HINT mode prompts with answer-leak detection. |

</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | Bottom sheet slide animation, help button pulse, typing indicator | Already used for ManipulativePanel, AnswerFeedbackAnimation throughout codebase |
| @react-native-community/netinfo | ^11.4.1 | Offline detection via `useNetInfo()` hook | Already installed, already mocked in jest.setup.js |
| lucide-react-native | ^0.554.0 | CircleHelp icon for help button, X icon for close | Only allowed icon library per CLAUDE.md |
| zustand | ^5.0.8 | tutorSlice for chat state (already exists) | Project state management standard |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | ~5.6.0 | Safe area insets for bottom sheet positioning | Already used in SessionScreen |
| react-native-gesture-handler | ~2.28.0 | Swipe-down gesture for sheet dismissal | Already installed, PanGesture for swipe detection |
| @testing-library/react-native | ^13.3.3 | Component testing | All UI tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom bottom sheet | @gorhom/bottom-sheet | NOT installed, adds dependency, needs Expo SDK 54 compat verification. Custom approach follows existing ManipulativePanel pattern -- simpler, proven in codebase |
| ScrollView for messages | FlatList/FlashList | Chat will have <20 messages per problem (rate limited to 3 calls/problem). ScrollView is simpler and avoids inverted list complexity |
| Custom offline hook | expo-network | netinfo already installed + mocked; expo-network would be redundant |

**Installation:**
```bash
# No new dependencies needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    chat/
      HelpButton.tsx         # FAB with pulse animation (~80 lines)
      ChatPanel.tsx           # Bottom sheet container + header (~120 lines)
      ChatBubble.tsx          # Single message bubble (tutor/child) (~60 lines)
      ChatMessageList.tsx     # ScrollView of bubbles + auto-scroll (~80 lines)
      ResponseButtons.tsx     # 3 fixed response buttons (~70 lines)
      TypingIndicator.tsx     # Animated dots in tutor bubble style (~50 lines)
      index.ts                # Barrel exports
  hooks/
    useNetworkStatus.ts       # Thin wrapper around useNetInfo (~25 lines)
```

### Pattern 1: Custom Bottom Sheet (follow ManipulativePanel pattern)
**What:** Animated panel that slides up from bottom using Reanimated `useSharedValue` + `withSpring`
**When to use:** Chat panel open/close animation
**Example:**
```typescript
// Source: Existing ManipulativePanel.tsx pattern
const PANEL_HEIGHT = Dimensions.get('window').height * 0.6;
const PANEL_SPRING = { damping: 20, stiffness: 200, mass: 0.8, overshootClamping: true };

const translateY = useSharedValue(PANEL_HEIGHT);

useEffect(() => {
  translateY.value = withSpring(
    isOpen ? 0 : PANEL_HEIGHT,
    PANEL_SPRING,
  );
}, [isOpen, translateY]);

const panelStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: translateY.value }],
}));
```

### Pattern 2: Help Button Pulse Animation
**What:** Gentle scale pulse 1-2 times after wrong answer, stops after first Help tap
**When to use:** Visual nudge without being distracting
**Example:**
```typescript
// Subtle pulse: scale 1.0 -> 1.08 -> 1.0, repeat 2x
const scale = useSharedValue(1);

const triggerPulse = () => {
  scale.value = withRepeat(
    withSequence(
      withTiming(1.08, { duration: 400 }),
      withTiming(1.0, { duration: 400 }),
    ),
    2, // repeat 2 times
    false, // don't reverse
  );
};
```

### Pattern 3: Chat Reset on Problem Advance
**What:** Watch `currentIndex` and reset chat state + abort in-flight requests
**When to use:** Per-problem chat lifecycle (CHAT-04)
**Example:**
```typescript
// In SessionScreen or a wrapper hook
useEffect(() => {
  tutor.resetForProblem();
  setChatOpen(false);
}, [currentIndex]); // fires when problem advances
```

### Pattern 4: Offline-aware Hint Requesting
**What:** Check network status before calling `requestHint()`
**When to use:** All hint request paths (CHAT-05)
**Example:**
```typescript
import { useNetInfo } from '@react-native-community/netinfo';

const netInfo = useNetInfo();
const isOnline = netInfo.isConnected !== false; // null = unknown, treat as online

const handleHelpTap = () => {
  if (!isOnline) {
    // Show offline message in chat panel
    addTutorMessage({
      id: `offline-${Date.now()}`,
      role: 'tutor',
      text: "I can't help right now because we're not connected to the internet. Keep trying -- you've got this!",
      timestamp: Date.now(),
    });
    return;
  }
  requestHint();
};
```

### Pattern 5: Auto-scroll to Latest Message
**What:** ScrollView ref with `scrollToEnd()` after new message is added
**When to use:** Chat message list (CHAT-02)
**Example:**
```typescript
const scrollRef = useRef<ScrollView>(null);

useEffect(() => {
  // Small delay to let layout complete
  const timer = setTimeout(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, 100);
  return () => clearTimeout(timer);
}, [messages.length]);
```

### Pattern 6: Swipe-down Dismiss Gesture
**What:** Pan gesture on chat panel header to dismiss on downward swipe
**When to use:** Chat panel dismissal (accessibility: two methods)
**Example:**
```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onEnd((event) => {
    if (event.translationY > 50) {
      // Swipe down threshold met -- close panel
      runOnJS(onClose)();
    }
  });
```

### Anti-Patterns to Avoid
- **Do NOT use a Modal for the chat panel:** The problem must remain visible above. Modal covers the entire screen. Use an absolutely-positioned View with translateY animation.
- **Do NOT use FlatList with `inverted` prop:** With <20 messages, inverted FlatList adds complexity (scroll position issues, keyboard interactions). Use a regular ScrollView with `scrollToEnd`.
- **Do NOT persist chat messages to AsyncStorage:** tutorSlice is ephemeral by design (STATE-01). Messages reset per-problem.
- **Do NOT build a custom network detection hook from scratch:** `useNetInfo()` is already installed and mocked.
- **Do NOT add child messages to the store for "I understand!":** The auto-close flow means the child response + encouragement + close happen in rapid succession. Add the child message, show encouragement, then close -- all within the component.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Network status detection | Custom polling / `navigator.onLine` | `useNetInfo()` from @react-native-community/netinfo | Handles all edge cases (airplane mode, WiFi without internet, cellular). Already installed + mocked. |
| Chat message state management | Local useState for messages | Existing `tutorSlice` via `useTutor` hook | Messages, loading, error, hint level all already managed. Just read from the hook. |
| LLM request lifecycle | Manual fetch + abort logic | `useTutor.requestHint()` | AbortController, rate limiting, PII scrubbing, safety pipeline, canned fallbacks all wired. |
| Problem-reset cleanup | Manual state clearing | `useTutor.resetForProblem()` | Handles AbortController abort + full state reset in one call. |
| Bottom sheet animation | CSS transitions / Animated API | Reanimated `useSharedValue` + `withSpring` | UI-thread animations, proven pattern in ManipulativePanel. |
| Typing indicator animation | Custom JS interval | Reanimated `withRepeat` + `withSequence` | Runs on UI thread, no JS thread blocking. |
| Canned fallback messages | Hardcoded strings in components | `getCannedFallback(category)` from safetyConstants | Randomized, categorized, already tested. |

**Key insight:** Phase 21-22 built the entire data/logic layer. Phase 23 is UI wiring only. Resist the temptation to add logic in components -- delegate everything to useTutor.

## Common Pitfalls

### Pitfall 1: Chat Panel Overlapping ManipulativePanel
**What goes wrong:** Both the chat bottom sheet and ManipulativePanel compete for screen real estate at the bottom of the screen.
**Why it happens:** ManipulativePanel is rendered by CpaSessionContent in concrete/pictorial modes. Chat panel is a separate overlay.
**How to avoid:** When chat panel opens, collapse ManipulativePanel (or render chat panel above it). Use `zIndex` / `elevation` to ensure chat panel renders on top. Consider hiding the ManipulativePanel toggle when chat is open.
**Warning signs:** Visual overlap in concrete CPA mode with both panels active.

### Pitfall 2: Stale Closure in requestHint after Problem Advance
**What goes wrong:** If `requestHint` captures old `currentProblem` in its closure and the problem advances during an in-flight request, the response could be for the wrong problem.
**Why it happens:** React closure capture semantics.
**How to avoid:** `useTutor` already reads `currentProblem` as a parameter and the AbortController cleanup on `resetForProblem()` prevents stale responses. Just make sure `resetForProblem()` is called before `setCurrentIndex` or in a `useEffect` watching `currentIndex`.
**Warning signs:** Tutor message appearing that doesn't match the current problem.

### Pitfall 3: Auto-close After "I understand!" Racing with Problem Advance
**What goes wrong:** The 1.5s auto-close timer fires after the problem has already advanced and chat has been reset, causing unexpected state changes.
**Why it happens:** setTimeout callback fires after problem advance reset.
**How to avoid:** Clear the auto-close timer in the chat reset effect. Use a ref to track if the timer is still valid, and check `currentIndex` hasn't changed before executing the close.
**Warning signs:** Chat panel flickering open/closed during problem transitions.

### Pitfall 4: useNetInfo Initial State is `null`
**What goes wrong:** On first render, `useNetInfo()` returns `{ isConnected: null, isInternetReachable: null }`. Treating `null` as offline blocks the first hint request.
**Why it happens:** NetInfo needs a moment to check network status.
**How to avoid:** Treat `isConnected === null` as "unknown" (assume online). Only show offline message when `isConnected === false` explicitly.
**Warning signs:** Help button shows "offline" message on app launch before network status resolves.

### Pitfall 5: ScrollView Auto-Scroll Not Working on First Message
**What goes wrong:** `scrollToEnd()` fires before the new message has been laid out, so scroll position doesn't update.
**Why it happens:** React render cycle -- the ScrollView content hasn't measured yet when `useEffect` fires.
**How to avoid:** Use a small `setTimeout` (50-100ms) after the messages array changes, or use `onContentSizeChange` on the ScrollView to trigger scroll.
**Warning signs:** First tutor message appears but the view doesn't scroll to show it fully.

### Pitfall 6: Forgetting to Add Child Response as TutorMessage
**What goes wrong:** The child taps "Tell me more" but only the next hint appears -- the child's button tap is not shown as a chat bubble.
**Why it happens:** `requestHint()` only adds tutor messages. Child responses need explicit `addTutorMessage({ role: 'child', ... })`.
**How to avoid:** Each response button handler must first add a `role: 'child'` message, then call the appropriate action (requestHint, etc.).
**Warning signs:** Chat shows only tutor messages, no child bubbles.

### Pitfall 7: jest.setup.js NetInfo Mock Returns `isConnected: true`
**What goes wrong:** Tests for offline behavior don't trigger because the global mock always returns online.
**Why it happens:** The global mock in jest.setup.js sets `isConnected: true` by default.
**How to avoid:** In individual test files, override the mock for offline scenarios: `(NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false })` or mock `useNetInfo` directly.
**Warning signs:** Offline tests pass but with wrong assertions.

## Code Examples

Verified patterns from the existing codebase:

### Chat Bubble Component Pattern
```typescript
// Based on existing style patterns in theme + CpaSessionContent
interface ChatBubbleProps {
  message: TutorMessage;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isTutor = message.role === 'tutor';
  return (
    <View style={[
      styles.bubble,
      isTutor ? styles.tutorBubble : styles.childBubble,
    ]}>
      <Text style={[
        styles.bubbleText,
        isTutor ? styles.tutorText : styles.childText,
      ]}>
        {message.text}
      </Text>
    </View>
  );
}

// Styles follow project conventions
const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: layout.borderRadius.lg,
    marginBottom: spacing.sm,
  },
  tutorBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#4338ca', // Deep indigo for tutor (dark theme compatible)
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  childBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#166534', // Deep green for child
  },
  bubbleText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
});
```

### Typing Indicator Animation
```typescript
// Three dots that animate sequentially
function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 300 }),
        withTiming(0, { duration: 300 }),
      ),
      -1, true,
    );
    dot2.value = withDelay(150,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1, true,
      ),
    );
    dot3.value = withDelay(300,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1, true,
      ),
    );
  }, [dot1, dot2, dot3]);

  // Each dot uses useAnimatedStyle with translateY
}
```

### Help Button with FAB Pattern
```typescript
// Based on existing button patterns (48dp min touch target, lucide icons)
import { CircleHelp } from 'lucide-react-native';

function HelpButton({ onPress, visible, pulsing }: HelpButtonProps) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      style={styles.helpFab}
      accessibilityRole="button"
      accessibilityLabel="Help"
      testID="help-button"
    >
      <Animated.View style={[styles.helpIconContainer, pulseStyle]}>
        <CircleHelp size={28} color={colors.textPrimary} />
        <Text style={styles.helpLabel}>Help</Text>
      </Animated.View>
    </Pressable>
  );
}
```

### Integration Point: SessionScreen
```typescript
// SessionScreen.tsx will add useTutor hook + chat components
export default function SessionScreen() {
  const { currentProblem, currentIndex, ... } = useSession();
  const tutor = useTutor(currentProblem);
  const netInfo = useNetInfo();

  const [chatOpen, setChatOpen] = useState(false);
  const [helpUsed, setHelpUsed] = useState(false);

  // Reset chat when problem advances (CHAT-04)
  useEffect(() => {
    tutor.resetForProblem();
    setChatOpen(false);
  }, [currentIndex]);

  // Help button only visible during practice phase and when chat is closed
  const showHelp = sessionPhase === 'practice' && !chatOpen && !isComplete;

  return (
    <View style={styles.container}>
      {/* Existing content... */}
      <CpaSessionContent ... />

      {/* Help FAB */}
      <HelpButton
        visible={showHelp}
        onPress={handleHelpTap}
        pulsing={shouldPulse && !helpUsed}
      />

      {/* Chat Panel (absolutely positioned at bottom) */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={tutor.messages}
        loading={tutor.loading}
        isOnline={netInfo.isConnected !== false}
        onResponse={handleResponse}
      />
    </View>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@gorhom/bottom-sheet` for all sheets | Custom Reanimated bottom sheet | Already in codebase (ManipulativePanel) | No new dependency, consistent animation pattern |
| `FlatList inverted` for chat | ScrollView with `scrollToEnd` | N/A (design decision) | Simpler for <20 messages per conversation |
| NetInfo `addEventListener` (imperative) | `useNetInfo()` hook (declarative) | netinfo v11+ | Cleaner React integration, auto-subscribe/unsubscribe |
| Reanimated 3 `runOnJS` | Reanimated 4 `scheduleOnRN` | v4.x | Note: jest.setup.js still mocks `runOnJS` (compatibility). For new code, can use either since mock handles both |

**Deprecated/outdated:**
- `useAnimatedGestureHandler` (Reanimated 3): Removed in v4. Use `Gesture` API from react-native-gesture-handler v2+ instead.
- `Animated.timing` (RN built-in): Use Reanimated `withTiming` for UI-thread animations.

## Open Questions

1. **Help button visibility: practice-only or all phases?**
   - What we know: CHAT-01 says "visible during session," phase description says "practice problem"
   - What's unclear: Whether warmup/cooldown phases should also show the Help button
   - Recommendation: Show only during practice phase. Warmup is review (easy), cooldown is confidence-building. Hints make most sense for practice-level problems. Implementation is trivial to change later (just modify the `showHelp` condition).

2. **"I'm confused" behavior in Phase 23**
   - What we know: Context says "signals struggle (used by auto-escalation in Phase 24, for now triggers a rephrased hint)"
   - What's unclear: Should "rephrased hint" be a separate prompt template or just call `requestHint()` again?
   - Recommendation: Call `requestHint()` without incrementing hint level. The LLM will get the same hint level but generate a new response (different phrasing due to LLM non-determinism). If more control is needed, a simple "rephrase" flag can be added to the prompt params.

3. **Chat panel interaction with ManipulativePanel in concrete mode**
   - What we know: Both occupy bottom screen space. ManipulativePanel covers ~50%, chat panel covers ~60%.
   - What's unclear: Whether to collapse ManipulativePanel when chat opens or layer chat on top
   - Recommendation: Close/collapse ManipulativePanel when chat opens. Child can't meaningfully interact with both simultaneously. Re-expand ManipulativePanel when chat closes.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo v54 + @testing-library/react-native v13.3.3 |
| Config file | `jest.config.js` |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-01 | Help button renders during practice, hides when chat open, hides during warmup/cooldown | unit | `npm test -- --testPathPattern=HelpButton` | No -- Wave 0 |
| CHAT-02 | Chat bubbles render with correct styling per role | unit | `npm test -- --testPathPattern=ChatBubble` | No -- Wave 0 |
| CHAT-02 | ChatPanel opens/closes with bottom sheet animation | unit | `npm test -- --testPathPattern=ChatPanel` | No -- Wave 0 |
| CHAT-03 | Response buttons render, add child message, trigger correct action | unit | `npm test -- --testPathPattern=ResponseButtons` | No -- Wave 0 |
| CHAT-04 | Chat resets when currentIndex changes, abort called | unit | `npm test -- --testPathPattern=SessionScreen` | Partial (exists but no chat tests yet) |
| CHAT-05 | Offline message shown when isConnected is false | unit | `npm test -- --testPathPattern=ChatPanel` | No -- Wave 0 |
| MODE-01 | HINT mode via requestHint delivers Socratic hint, never reveals answer | unit | `npm test -- --testPathPattern=useTutor` | Yes -- existing, covers this |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=chat`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/chat/HelpButton.test.tsx` -- covers CHAT-01 (visibility, press handler, pulse animation)
- [ ] `src/components/chat/ChatPanel.test.tsx` -- covers CHAT-02, CHAT-05 (rendering, open/close, offline message)
- [ ] `src/components/chat/ChatBubble.test.tsx` -- covers CHAT-02 (tutor vs child styling)
- [ ] `src/components/chat/ResponseButtons.test.tsx` -- covers CHAT-03 (button rendering, press handlers)
- [ ] `src/components/chat/TypingIndicator.test.tsx` -- covers CHAT-02 (loading state display)
- [ ] Update `src/__tests__/screens/SessionScreen.test.tsx` -- covers CHAT-04 (chat reset on problem advance)
- [ ] `src/hooks/useNetworkStatus.test.ts` -- covers CHAT-05 (network status wrapper if created)
- No new framework install needed. NetInfo mock already exists in `jest.setup.js`.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/hooks/useTutor.ts` -- complete hook API, all methods documented
- Existing codebase: `src/store/slices/tutorSlice.ts` -- full state shape and actions
- Existing codebase: `src/components/session/ManipulativePanel.tsx` -- bottom sheet animation pattern (Reanimated withSpring)
- Existing codebase: `src/components/animations/AnswerFeedbackAnimation.tsx` -- Reanimated animation pattern
- Existing codebase: `src/theme/index.ts` -- colors, spacing, typography, layout constants
- Existing codebase: `src/screens/SessionScreen.tsx` -- integration point, current structure
- Existing codebase: `jest.setup.js` -- all existing mocks including NetInfo and Reanimated
- Existing codebase: `package.json` -- all dependency versions confirmed

### Secondary (MEDIUM confidence)
- `@react-native-community/netinfo` source: `useNetInfo()` hook signature confirmed from installed module source
- `react-native-reanimated` v4.1.1: API confirmed from jest mock and existing usage in codebase
- `react-native-gesture-handler` v2.28: Gesture.Pan API confirmed from jest mock setup

### Tertiary (LOW confidence)
- None -- all findings verified against installed code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed and in use
- Architecture: HIGH -- follows exact patterns already in the codebase (ManipulativePanel, AnswerFeedbackAnimation)
- Pitfalls: HIGH -- derived from reading actual implementation code and understanding integration points
- Validation: HIGH -- test infrastructure well-established with 800+ passing tests

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable -- no moving targets, all code is internal)
