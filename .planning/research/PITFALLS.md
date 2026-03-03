# Pitfalls Research

**Domain:** Virtual manipulatives for children's math learning app (React Native / Expo)
**Researched:** 2026-03-03
**Confidence:** HIGH (gesture/animation pitfalls from official docs + known issues); MEDIUM (CPA design pitfalls from research literature); HIGH (integration pitfalls from codebase analysis)

---

## Critical Pitfalls

### Pitfall 1: Running Snap Logic on the JS Thread Instead of the UI Thread

**What goes wrong:**
Snap-to-grid collision detection and position clamping are computed on the JavaScript thread during `onEnd` or `onChange` callbacks, then fed back through the bridge to update shared values. At 30 objects (the stated maximum for base-ten blocks), this creates perceptible lag: the block visually "drifts" before snapping, and on low-end Android the snap animation stutters or drops frames.

**Why it happens:**
Developers wire gesture callbacks to regular JS functions: `onEnd: (e) => setPosition(snapTo(e.x, e.y))`. The snap math feels trivial, but calling it from JS while Reanimated is running animations on the UI thread causes thread-crossing synchronization delays that compound with each additional draggable object.

**How to avoid:**
Move ALL snap math into a `worklet`. Define `snapToColumn`, `snapToCell`, and `isInDropZone` functions with the `'worklet'` directive. Call them exclusively from within `useAnimatedStyle` or `runOnUI`. Never read `sharedValue.value` from the JS thread during an active gesture — only set it from a worklet.

```typescript
// WRONG — runs on JS thread, causes lag
const onEnd = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
  const snapped = snapToGrid(e.translationX, e.translationY, gridConfig);
  position.value = snapped; // bridge crossing
};

// CORRECT — all math in worklet, stays on UI thread
const gesture = Gesture.Pan()
  .onEnd((e) => {
    'worklet';
    const snapped = snapToGrid(e.translationX, e.translationY, gridConfig);
    position.value = withSpring(snapped, SNAP_CONFIG);
  });
```

**Warning signs:**
- Drag releases feel "sticky" before snap animation plays
- Flipper/React DevTools shows JS thread at >80% during drag
- FPS drops from 60 to 40-45 when 10+ items are on screen
- Snap feels correct in debug build but incorrect in release (different thread timing)

**Phase to address:** Phase establishing the base draggable primitive. Must be correct before building individual manipulatives on top.

---

### Pitfall 2: Capturing Zustand State Inside Worklets

**What goes wrong:**
A developer uses `useAppStore(state => state.childAge)` inside a component and then closes over the result inside a gesture handler or `useAnimatedStyle`. The worklet captures the value at closure creation time, not reactively. This means grid cell sizing, drop zone tolerances, or snap distances computed from `childAge` are stale after store hydration completes — or freeze if the store ever updates mid-session.

**Why it happens:**
Worklets run in a separate JS VM context on the UI thread. They cannot call React hooks or read Zustand state. Developers assume JS closures "just work" inside `'worklet'` annotated functions, but Reanimated serializes the captured value at worklet creation — there is no live binding.

**How to avoid:**
Extract any store-derived configuration values into `useSharedValue` bridges at component mount time. Pass them into worklets as shared value arguments, not as closed-over JS values.

```typescript
// WRONG — stale closure in worklet
const childAge = useAppStore(s => s.childAge);
const snapTolerance = childAge <= 6 ? 40 : 24; // captured once, stale

const gesture = Gesture.Pan().onEnd((e) => {
  'worklet';
  if (distance(e) < snapTolerance) { // uses stale value
    position.value = withSpring(target);
  }
});

// CORRECT — bridge via shared value
const childAge = useAppStore(s => s.childAge);
const toleranceSV = useSharedValue(childAge <= 6 ? 40 : 24);

useEffect(() => {
  toleranceSV.value = childAge <= 6 ? 40 : 24;
}, [childAge]);

const gesture = Gesture.Pan().onEnd((e) => {
  'worklet';
  if (distance(e) < toleranceSV.value) {
    position.value = withSpring(target);
  }
});
```

**Warning signs:**
- Age-appropriate snap tolerance works on first install but ignores age updates
- Different behavior between fresh install and persisted store load
- TypeScript doesn't catch this — it compiles cleanly

**Phase to address:** Phase establishing the draggable primitive. Document the shared-value bridge pattern in the manipulative architecture so every subsequent manipulative follows it.

---

### Pitfall 3: Gesture Conflicts Between Drag, Tap-Alternative, and Scroll

**What goes wrong:**
Each manipulative needs both a drag gesture (primary) and a tap-to-select + tap-destination alternative (for age-6 children and accessibility). When a `PanGestureHandler` is a sibling or ancestor of a `TapGestureHandler`, the pan handler activates immediately on `onBegin` (before the user has moved), consuming the event and silently cancelling the tap. The child taps a counter intending to select it, but the pan activates and nothing visually happens — no snap, no selection. This is especially bad at age 6 where taps are imprecise and fingers rest briefly before dragging.

**Why it happens:**
`Gesture.Pan()` has a default `minDistance` of 0. It becomes active on finger down (`onBegin`), which beats the tap handler that waits for finger lift. In the old handler API, `simultaneousHandlers` and `waitFor` were explicit; in the Gesture API, developers often forget that nesting GestureDetectors creates implicit competition via the gesture responder system.

**How to avoid:**
Set `minDistance` on Pan gestures to at least 6-8 pixels so short taps can complete. Use `Gesture.Exclusive()` or `Gesture.Race()` composition to give the Tap gesture priority, falling through to Pan only if the tap window elapses. Never nest `GestureDetector` wrappers for the same object — combine gestures into one `GestureDetector` using composition.

```typescript
// CORRECT — tap wins short touches, pan wins sustained movement
const tap = Gesture.Tap()
  .onEnd(() => { 'worklet'; onSelect(); });

const pan = Gesture.Pan()
  .minDistance(8)
  .onUpdate((e) => { 'worklet'; position.value = { x: e.translationX, y: e.translationY }; })
  .onEnd((e) => { 'worklet'; position.value = withSpring(snapTarget(e)); });

// Race: first gesture to activate wins
const composed = Gesture.Race(tap, pan);
```

**Warning signs:**
- Tap-to-select works in isolation but fails when drag is added to the same component
- Children at age 6 cannot place counters consistently
- Accessibility testers report the tap alternative "never works"
- Works in slow-motion device demo but fails at real interaction speed

**Phase to address:** Phase establishing the draggable primitive, before any individual manipulative is built. Validate with `fireGestureHandler` tests covering both tap and drag sequences on the same element.

---

### Pitfall 4: Animating Width/Height Instead of Transform for Drag Positions

**What goes wrong:**
A developer positions draggable blocks using `style={{ left: x, top: y }}` (or `marginLeft`, `width`) driven by an animated shared value. Each gesture frame triggers layout recalculation across the subtree. With 20+ blocks on screen (base-ten blocks: counters), this causes frame drops to 30-40fps on mid-range Android — well below the 60fps requirement.

**Why it happens:**
It's the natural way to position things in React Native. Developers prototype with `position: 'absolute'` + `left/top` and it looks fine in debug mode with 3 objects, but performance degrades as object count grows. Layout properties require a full native layout pass per frame, while `transform: [{ translateX }, { translateY }]` bypasses layout entirely.

**How to avoid:**
All draggable object positions MUST use `transform: [{ translateX: position.x }, { translateY: position.y }]`. Set the item's base position once with `position: 'absolute'` + static `left/top` in `StyleSheet.create`, then use `transform` for the dynamic delta. Never animate `left`, `top`, `width`, `height`, `margin`, or `padding` on objects that move more than once.

```typescript
// WRONG — causes layout recalculation every frame
const animatedStyle = useAnimatedStyle(() => ({
  left: position.value.x,
  top: position.value.y,
}));

// CORRECT — bypasses layout, GPU-composited
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: position.value.x },
    { translateY: position.value.y },
  ],
}));
```

**Warning signs:**
- FPS drops when dragging single object while others are visible (not being dragged)
- Android performs significantly worse than iOS (Android layout engine is more sensitive)
- Profiler shows "Layout" in the render waterfall during gesture callbacks

**Phase to address:** Phase establishing the draggable primitive. This is architectural — retrofit is expensive because it changes the coordinate system model used by every manipulative.

---

### Pitfall 5: Advancing CPA Stage Purely on Elo Rating Rather Than BKT Mastery

**What goes wrong:**
The CPA progression gate (Concrete → Pictorial → Abstract) is wired to the Elo rating or a simple correct-answer count rather than the BKT `P(mastery)` threshold. A child with high Elo on easy problems gets advanced to Abstract mode while BKT `P(L)` is still 0.60 — below the ≥0.95 mastery threshold. They struggle at the abstract stage, Elo drops, they get pushed back, and the oscillation between stages is frustrating and pedagogically incorrect.

**Why it happens:**
Elo is already implemented and exposed; BKT state is in `skillStatesSlice`. It's tempting to wire CPA progression to the most visible metric. The research literature is clear (Bayesian Knowledge Tracing, not performance proxies) but the integration isn't obvious from the slice API.

**How to avoid:**
The CPA stage for a given skill must be driven exclusively by `skillState.mastery` (the BKT `P(L)` field in `skillStatesSlice`). Define three gates:
- `P(L) < 0.40` → Concrete stage required (manipulative always shown)
- `0.40 ≤ P(L) < 0.85` → Pictorial stage (static diagram shown, manipulative optional)
- `P(L) ≥ 0.85` → Abstract stage (manipulative available but not foregrounded)
- `P(L) ≥ 0.95` → Mastered, no manipulative unless requested

Do NOT use Elo, consecutive correct count, or session completion rate as gates.

**Warning signs:**
- CPA stage changes after a lucky streak on easy problems
- BKT `P(L)` and displayed CPA stage are diverged in test assertions
- Child oscillates between stages across consecutive sessions

**Phase to address:** CPA progression system phase. Write explicit unit tests asserting CPA stage given `P(L)` values at boundary conditions (0.39, 0.40, 0.84, 0.85, 0.94, 0.95).

---

### Pitfall 6: Treating CPA as a Rigid One-Way Progression

**What goes wrong:**
The system advances a child from Concrete → Pictorial → Abstract but never re-introduces concrete manipulatives when they encounter a new harder sub-skill (e.g., they mastered addition-to-10 at Abstract level, then hit subtraction-with-borrowing for the first time). The child struggles at Abstract level on the new concept because they never worked with it concretely.

**Why it happens:**
CPA is often implemented as a global "stage" for the child rather than a per-skill stage. Research (Bruner, NCTM) is clear that CPA stage is per-concept, not per-child — a child can be Abstract on counting and Concrete on fractions simultaneously.

**How to avoid:**
Store CPA stage per-skill, not per-child. The `skillStatesSlice` already has per-skill state — add `cpaStage: 'concrete' | 'pictorial' | 'abstract'` to `SkillState`. When a new skill unlocks via the prerequisite graph, initialize its `cpaStage` to `'concrete'` regardless of the child's overall level. The CPA stage for skill X must only advance based on skill X's `P(L)`.

**Warning signs:**
- A global `cpaStage` field exists in `childProfileSlice` rather than `skillStatesSlice`
- New skill introduction shows Abstract representation immediately for high-Elo children
- Test for "new skill first encounter" shows no concrete manipulative

**Phase to address:** CPA progression system phase. This is a schema decision that affects STORE_VERSION — add `cpaStage` to `SkillState`, bump `STORE_VERSION` to 5, add migration that initializes `cpaStage: 'concrete'` for all existing skills.

---

### Pitfall 7: Blocking Session Flow When Child Dismisses Manipulative Mid-Problem

**What goes wrong:**
The session flow (15-problem queue, commit-on-complete pattern) has no state for "manipulative in use." When a child taps away from the manipulative mid-interaction — or the session's `usePreventRemove` guard fires — the manipulative's ephemeral drag state (position of counters, current bar model layout) is lost with no warning. The problem is re-presented but the manipulative starts fresh, confusing the child who had partially modeled the solution.

**Why it happens:**
The existing session state in `sessionStateSlice` tracks the problem queue and scoring refs, but has no field for manipulative state. The manipulative is treated as a pure render-time side-effect with no persistence requirement.

**How to avoid:**
Keep manipulative ephemeral state in component-local state (not the Zustand store — it changes too frequently for persist to be appropriate). Ensure that problem re-display within the same session re-mounts the manipulative fresh (children expect to start over). The critical rule: manipulative state does NOT need to survive navigation away from the session — the existing `usePreventRemove` guard already prevents mid-session navigation. Document this boundary explicitly so no one adds manipulative state to the persisted store.

**Warning signs:**
- Someone adds `manipulativeState` to `sessionStateSlice` with AsyncStorage persistence
- The `partialize` function in `appStore.ts` is modified to include manipulative positions
- Test suite includes assertions on persisted manipulative positions

**Phase to address:** Session integration phase (embedding manipulatives in session flow). Explicitly document that manipulative ephemeral state stays in component refs/local state.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reading `sharedValue.value` on JS thread during `onEnd` | Simpler gesture handler code | Synchronization lag accumulates; causes stutter with >5 items | Never — use worklets from day one |
| Single `cpaStage` field per child (not per skill) | Simpler state shape | Wrong representation shown for new skills; pedagogically incorrect | Never |
| Positioning drag items with `left`/`top` instead of `transform` | Matches mental model | Layout recalculation every frame; 30fps with 10+ items | Never for draggable items; fine for static elements |
| Using old Handler API (`PanGestureHandler` wrapper) instead of Gesture API | Familiar patterns from v1 | Cannot compose with v2 gestures; gesture conflicts harder to resolve | Never on new code; migrate if encountered |
| Wrapping entire manipulative in a `ScrollView` as layout shortcut | Easy overflow handling | ScrollView intercepts gestures and fights PanGestureHandler | Never — use absolute positioning within fixed bounds |
| Inline style objects in render for animated styles | Fast prototyping | Causes unnecessary re-renders on every frame | Prototype only; remove before phase is marked complete |
| `console.log` in worklet to debug gesture values | Useful during development | `runOnJS(console.log)` adds bridge crossing; missed in cleanup kills perf | Development only; remove via `__DEV__` guard |
| Skipping `testID` on gesture components during initial build | Faster initial development | Cannot test with `getByGestureTestId`; gesture tests become impossible | Never — add `testID` when component is created |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Reanimated + Zustand | Closing over Zustand state values inside worklets | Bridge store-derived config through `useSharedValue`; update the shared value in `useEffect` |
| RNGH + ScrollView | Placing draggable items inside ScrollView | Use `simultaneousHandlers` carefully or avoid ScrollView entirely; use absolute positioning within fixed canvas |
| RNGH + React Navigation | Gesture handler not wrapped with `GestureHandlerRootView` at app root | `GestureHandlerRootView` must be the outermost wrapper; already required by RNGH v2 — verify it exists in `App.tsx` |
| react-native-svg + Reanimated | Animating SVG `Path d` attribute causes full SVG re-parse each frame | Animate `transform` on `<G>` wrapper elements instead; use fixed path geometry |
| Zustand migrate + new `cpaStage` field | Missing migration function for STORE_VERSION bump | Add `migrateStore` case in `migrations.ts` initializing `cpaStage: 'concrete'` for all existing `skillStates` entries |
| Jest + RNGH | Missing `jestSetup.js` import in Jest setup | Add `'react-native-gesture-handler/jestSetup'` to `setupFilesAfterEnv` in `jest.config.js`; already needed if any gesture components exist in tests |
| Reanimated + Jest | `useSharedValue` and `useAnimatedStyle` throw in test environment | Import `'react-native-reanimated/mock'` in Jest setup; check `jest-expo` preset covers this for Expo SDK 54 |
| Session commit-on-complete + manipulatives | Reading manipulative positions to verify answer correctness | Manipulatives are visual aids only — answer correctness must come from the math engine, never from manipulative state; the manipulative cannot be wrong |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| >20 draggable items each with independent `useSharedValue` pair | 60fps during single-item drag, 30fps during initial mount with all items | Use a single shared value array or object; animate by index | Beyond 15 items on screen simultaneously |
| `useAnimatedStyle` with inline function that creates new objects | Subtle re-renders on every frame even when no gesture is active | Always return the same shape from `useAnimatedStyle`; never create new arrays inside it | Immediately — overhead accumulates |
| Haptics in worklet via direct call | `expo-haptics` is not worklet-compatible; crashes in strict Reanimated mode | Call `runOnJS(triggerHaptic)()` from worklet | First time a haptic is added to an `onEnd` worklet |
| Spring animation with default config on snap | Blocks visible on screen jitter for 800ms before settling; confusing to child | Use `{ damping: 20, stiffness: 200, overshootClamping: true }` for snapping — no bounce on precise placement | Every snap interaction |
| SVG number line with 100 tick marks all re-rendering | SVG re-renders entirely on parent state change | Memoize static tick marks; only animate the movable marker | Number line with range 0-100 |
| Manipulative state in Zustand store updated on every drag frame | AsyncStorage write attempted 60 times/second; app hangs | Manipulative position lives in local state/refs only; persist nothing during drag; only persist on problem completion if needed | First drag interaction with store-connected position |

---

## Security Mistakes

This section is minimal for manipulatives — the primary concerns are pedagogical correctness and COPPA compliance, not security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| LLM (Gemini) used to validate manipulative answer or compute target value | Math answer is unreliable; violates CLAUDE.md constraint | Math engine computes all correct answers; manipulative is display-only; never pass manipulative state to LLM for correctness check |
| Storing child's manipulative interaction patterns in a form that could identify them | COPPA violation if data is transmitted | Manipulative state is ephemeral (session-local); only aggregate mastery metrics (BKT P(L)) are persisted |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring drag as the only interaction mode | Age-6 children with imprecise fine motor cannot use the manipulative; accessibility failure | Always provide tap-to-select + tap-destination as an alternative; document both in the manipulative interface spec |
| Spring animation with visible overshoot on snap-to-grid | Block appears to "bounce" past its target slot; child re-drags thinking it's not placed | Use `overshootClamping: true` in `withSpring` config for all snap interactions |
| Showing all 6 manipulative types simultaneously in a picker | Overwhelming for ages 6-7 (working memory: 3-4 items); violates screen density limit | Show only the contextually appropriate manipulative for the current problem; don't offer choice until Abstract stage |
| Animated grouping (10 cubes → 1 rod) plays while child is mid-drag another block | Simultaneous animations fragment attention; child loses track of block being dragged | Queue grouping animations; never play while a gesture is active (`isGestureActive` shared value) |
| Error feedback with red shake for wrong snap placement | Red = failure = anxiety; contradicts no-punitive-mechanics principle | Use gentle blue wobble + "try again" haptic; block returns to origin with `withSpring` |
| Counter/block count label updates every frame during drag (via animated text) | Animated numbers during drag are distracting for children | Update count label only on drop (`onEnd`), not during drag (`onUpdate`) |
| Manipulative sandbox screen has no "reset" button | Child who makes a mess cannot start over without leaving and re-entering | Always provide a visible "Start over" button (trash icon with label); implement as clear-all without navigation |
| CPA stage shown to the child as a label ("Concrete mode") | Metacognitive framing is inappropriate for ages 6-9; creates labels and potential stigma | CPA stage drives which representation appears; never surface the stage name to the child |
| Pinch-to-zoom on number line for fraction subdivisions | Research shows pinch is unreliable for ages 6-9 (both hands required, precision issues) | Use tap-to-subdivide buttons (+/- for fraction density) instead of pinch |

---

## "Looks Done But Isn't" Checklist

- [ ] **Draggable base-ten blocks:** Verify 30 blocks on screen simultaneously maintains 60fps in a release build on a mid-range Android device (not just on simulator or iPhone)
- [ ] **Tap alternative for drag:** Verify that selecting an item with tap, then tapping a destination, successfully places the item — without ever starting a drag gesture
- [ ] **Accessibility labels:** Verify every draggable block has a dynamic `accessibilityLabel` that updates when it is placed (e.g., "Unit block, placed in ones column")
- [ ] **CPA stage per skill:** Verify that a child at Abstract stage for addition sees Concrete stage for a newly unlocked subtraction-with-borrowing skill
- [ ] **Store migration:** Verify `STORE_VERSION` was bumped to 5 and a migration initializing `cpaStage: 'concrete'` exists in `migrations.ts` — verify existing tests still pass
- [ ] **Haptics via runOnJS:** Verify haptic feedback functions are called via `runOnJS` and not directly from within worklets
- [ ] **withSpring overshootClamping:** Verify snap animations do not visually overshoot the target cell — test by placing a block slowly from 5dp outside the snap zone
- [ ] **SVG transforms not `d` attribute animation:** Verify number line marker movement uses `transform` on a `<G>` element, not string interpolation of the `d` attribute
- [ ] **Session flow integrity:** Verify that starting a manipulative interaction during problem N, then answering, correctly advances to problem N+1 with the manipulative reset
- [ ] **Gesture handler root:** Verify `GestureHandlerRootView` is the outermost view in `App.tsx` — failure here causes all gesture tests to silently pass but production to fail
- [ ] **Jest setup file:** Verify `react-native-gesture-handler/jestSetup` is in `setupFilesAfterEnv` and `react-native-reanimated/mock` is imported — run `npm test` with a gesture component test to confirm
- [ ] **Reduced motion:** Verify `AccessibilityInfo.isReduceMotionEnabled()` is checked at manipulative mount and replaces spring animations with instant positioning

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Snap logic on JS thread discovered after all 6 manipulatives built | HIGH | Audit all `onEnd`/`onChange` handlers; extract non-worklet math to `workletize`-annotated helper functions; add `'worklet'` directive and test each manipulative |
| `left`/`top` animation discovered after all manipulatives built | HIGH | Refactor coordinate system in base draggable primitive; all manipulatives using the primitive get fix; standalone manipulatives need individual refactors |
| CPA stage stored per-child discovered in testing | MEDIUM | Move `cpaStage` to `SkillState`; bump `STORE_VERSION`; write migration; update all CPA-stage selectors |
| Missing Jest setup for RNGH discovered when first gesture test is written | LOW | Add import to Jest setup file; tests that were silently skipping gesture interactions will now correctly fire |
| Pinch-to-zoom implemented on number line | LOW | Replace with tap subdivision buttons; gesture already avoided per `child-ux-design.md` spec |
| Manipulative state accidentally persisted to Zustand | MEDIUM | Remove from `partialize`; bump `STORE_VERSION` if the schema changed; write migration to strip the field from persisted state |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Snap logic on JS thread (Pitfall 1) | Base draggable primitive phase | Performance test: 20 blocks at 60fps in release build |
| Zustand state in worklets (Pitfall 2) | Base draggable primitive phase | Unit test: shared value updates when store age changes |
| Gesture conflicts drag + tap + scroll (Pitfall 3) | Base draggable primitive phase | `fireGestureHandler` test for tap + drag on same element |
| Width/height animation instead of transform (Pitfall 4) | Base draggable primitive phase | Profiler shows no "Layout" in frame waterfall during drag |
| CPA wired to Elo not BKT (Pitfall 5) | CPA progression system phase | Unit tests: CPA stage at P(L) boundary values |
| CPA as global per-child not per-skill (Pitfall 6) | CPA progression system phase + STORE_VERSION bump | Test: new skill shows Concrete when child is Abstract on existing skill |
| Session state collision with manipulatives (Pitfall 7) | Session integration phase | Verify no manipulative state in `partialize`; no `sessionStateSlice` changes needed |

---

## Sources

- [React Native Gesture Handler: Testing with Jest](https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing/) — official docs, HIGH confidence
- [React Native Reanimated: Performance Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/) — official docs, HIGH confidence
- [React Native Reanimated: Shared Values](https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue/) — official docs, HIGH confidence
- [RNGH: Gesture Composition](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/) — official docs, HIGH confidence
- [RNGH: GestureDetector](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture-detector/) — official docs, HIGH confidence
- [Synchronization with state (Reanimated + Zustand)](https://github.com/software-mansion/react-native-reanimated/discussions/4685) — community discussion, MEDIUM confidence
- [CPA Myths and Misconceptions](https://mathsnoproblem.com/blog/teaching-maths-mastery/myths-and-misconceptions-surrounding-the-cpa-approach) — Maths No Problem, MEDIUM confidence
- [CPA Approach — Concrete Pictorial Abstract](https://mathsnoproblem.com/en/approach/concrete-pictorial-abstract) — Maths No Problem, MEDIUM confidence
- [Virtual Manipulatives in CPA](https://theothermath.com/index.php/2017/11/06/virtual-manipulatives-in-cpa/) — practitioner research, MEDIUM confidence
- [Brainingcamp Accessibility in Digital Math Manipulatives](https://weeklyvoice.com/brainingcamp-sets-new-standard-for-accessibility-in-digital-math-manipulatives/) — industry reference, MEDIUM confidence
- [Shopify: Making React Native Gestures Feel Natural](https://shopify.engineering/making-react-native-gestures-feel-natural) — engineering blog, MEDIUM confidence
- [Handling Pan and Scroll Gestures Simultaneously](https://medium.com/@taitasciore/handling-pan-and-scroll-gestures-simultaneously-and-gracefully-with-gesture-handler-2-reanimated-63f0d8f72d3c) — community article, MEDIUM confidence
- `.planning/04-virtual-manipulatives.md` — project research, HIGH confidence (project-specific)
- `.planning/09-child-ux-design.md` — project research, HIGH confidence (project-specific)
- `.planning/PROJECT.md` — project context, HIGH confidence (authoritative)

---
*Pitfalls research for: virtual manipulatives in React Native children's math learning app (v0.4 milestone)*
*Researched: 2026-03-03*
