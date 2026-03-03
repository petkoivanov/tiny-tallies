# Feature Research

**Domain:** Virtual Math Manipulatives for children ages 6-9 (React Native educational app)
**Researched:** 2026-03-03
**Confidence:** HIGH (grounded in existing internal research doc 04-virtual-manipulatives.md + external sources confirming standard patterns)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any virtual math manipulative product must have. Missing these = product feels broken or incomplete compared to free tools like Math Learning Center apps, Didax, or Toy Theater.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Drag-and-drop counter/block placement | Every virtual manipulative offers this. Children expect objects to be physically movable | HIGH | Must run at 60fps on low-end Android. Use RNGH PanGestureHandler + Reanimated SharedValue on UI thread |
| Snap-to-grid / snap-to-cell | Counters that float freely without snapping feel broken to children. Spatial precision is low at ages 6-9 | MEDIUM | Spring animation on snap (`withSpring`). Configurable grid positions per manipulative type |
| Running count display | Children need immediate feedback on how many objects they have placed. Without it the tool teaches nothing | LOW | Animated count label using `withTiming`. Updates in real time as items are placed or removed |
| Tap-to-add / tap-to-remove | Drag is the primary interaction but tap-to-add is the fallback for accessibility and precision placement | LOW | 48dp minimum touch targets per CLAUDE.md requirement |
| Reset / clear button | Children make mistakes and need a non-punitive way to start over | LOW | Confirms before clearing if > 5 items placed |
| Visual distinction between manipulative types | Each manipulative (block, counter, fraction strip) needs distinctive color and shape so children recognize it | LOW | Color-blind safe palette (internal research 04) |
| Session-embedded display during problem solving | Standard expectation set by Prodigy and similar apps — manipulative appears as a visual aid when child requests or gets stuck | MEDIUM | Collapsible overlay or drawer within the existing session screen flow |
| Standalone sandbox screen per manipulative | Free exploration mode expected from all serious manipulative tools (Math Learning Center, Brainingcamp, Didax all offer this) | MEDIUM | One screen per manipulative type with allowFreePlay config flag |

### Per-Manipulative Table Stakes

**Base-Ten Blocks**

| Behavior | Why Expected | Complexity |
|----------|--------------|------------|
| Unit cube, ten rod, hundred flat as distinct objects | Standard representation across all base-ten tools | LOW |
| Auto-group: 10 cubes animate into a rod | Core pedagogical mechanic for regrouping — every base-ten app does this | HIGH | Involves detecting proximity, triggering animation, replacing 10 objects with 1 |
| Tap rod to break into 10 cubes (for borrowing) | Inverse of regrouping — equally fundamental | HIGH | Run on same animation system as auto-group |
| Column snap: ones / tens / hundreds zones | Visual place-value columns are the defining feature of base-ten blocks | MEDIUM | Three labeled drop zones with snap logic |

**Number Line**

| Behavior | Why Expected | Complexity |
|----------|--------------|------------|
| Tap a position to place a marker | Universal interaction in number line tools | LOW |
| Hop/jump arrows with labeled values | Math Learning Center's Number Line app defines this expectation — jumps above/below the line with value labels | MEDIUM |
| Adjustable range (0-10, 0-20, 0-100) | Different skills require different scales | LOW |
| Animated arrow showing forward or backward jumps | Visual representation of addition and subtraction direction | MEDIUM |

**Ten Frame**

| Behavior | Why Expected | Complexity |
|----------|--------------|------------|
| 2x5 grid with fixed cell positions | The ten frame format is canonical — deviating confuses teachers and children familiar with the format | LOW |
| Counters snap into cells left-to-right, top row first | Standard filling order used in all ten frame tools (Didax, Toy Theater, Math Learning Center Number Frames) | MEDIUM |
| Running count display showing total and "need X more to make 10" | Central pedagogical message of the ten frame — children expect this feedback | LOW |
| Double ten frame for numbers 11-20 | Second frame appears automatically when first is full; expected for grade 1-2 curriculum | MEDIUM |

**Counters / Tokens**

| Behavior | Why Expected | Complexity |
|----------|--------------|------------|
| Two color modes (e.g. red/yellow) for comparison problems | Two-color counters are the standard physical tool these replicate | LOW |
| Tap canvas to add, tap counter to remove | Universal interaction pattern | LOW |
| Drag to regroup into grouping circles | Expected for multiplication/division concepts (equal groups) | HIGH |
| Per-group count label | Without this, grouping is visually meaningless | LOW |

**Fraction Strips**

| Behavior | Why Expected | Complexity |
|----------|--------------|------------|
| Whole, halves, thirds, fourths, sixths, eighths rows | Standard strip denominator set used in physical kits and all virtual tools | LOW |
| Tap segment to shade/unshade (shows numerator) | Core interaction for showing a fraction | LOW |
| Stack mode: compare two fraction strips side by side | Comparison is THE primary use of fraction strips — missing this defeats the purpose | MEDIUM |
| Numerator/denominator label updates as segments are shaded | Children need to see the symbol alongside the visual | LOW |

**Bar Model**

| Behavior | Why Expected | Complexity |
|----------|--------------|------------|
| Horizontal bar representing a total | The Singapore Math bar model format is widely taught and expected | LOW |
| Drag to resize bar segments | Bars must be adjustable to represent different quantities | HIGH |
| Part-whole layout (total bar split into labelled parts) | Fundamental bar model structure for addition/subtraction word problems | MEDIUM |
| "?" label for unknown quantity | The question mark is the visual cue that children are taught to look for | LOW |
| Bracket showing total above bar | Standard notation in Singapore Math bar model diagrams | MEDIUM |

### Differentiators (Competitive Advantage)

Features that go beyond what free tools offer and align with the app's core value of adaptive, personalized math learning.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| BKT-driven CPA stage progression | Free tools have no progression — they dump children into freeplay. Automatic advancement from concrete → pictorial → abstract based on mastery is unique to adaptive apps | HIGH | Uses existing BKT P(L) scores. Threshold: concrete at P(L)<0.70, pictorial at 0.70-0.90, abstract at P(L)≥0.90. Non-linear: child can go back |
| Manipulative-to-skill mapping | System selects the RIGHT manipulative for the current problem automatically — e.g., ten frame for addition-within-20, base-ten blocks for regrouping | MEDIUM | Mapping table in a config: skill_id → manipulative_type + config |
| Guided mode with next-action highlight | When a child is in session and stuck, the manipulative subtly highlights what to do next (gentle glow, not flashing) — bridges to the upcoming AI tutor without requiring LLM | HIGH | Requires knowing the correct manipulation sequence for each problem type |
| Session-embedded "suggest manipulative" trigger | After first wrong answer in session, system offers the relevant manipulative as a visual aid without breaking session flow | MEDIUM | Ties into existing session orchestrator wrong-answer handling |
| Per-manipulative interaction event logging | Log every tap, drag, snap, and group action with timestamp — enables future AI tutor to understand HOW child is thinking, not just WHAT they answered | MEDIUM | ManipulativeEvent stream stored in session state slice |
| CPA stage indicator visible to child | Show child their current level (e.g., "You're using blocks!" → "You're drawing pictures!" → "You're solving in your head!") to build metacognitive awareness | LOW | Visual badge/label only; no explanation needed |
| Undo last action | Physical manipulatives can be picked back up. Undo maintains the "playing with objects" feel and reduces frustration in 6-9 year olds | MEDIUM | Stack-based undo history, max 10 actions deep |
| Haptic feedback on snap | Physical manipulatives make clicking sounds when placed. Haptic on snap satisfies the same proprioceptive expectation | LOW | `Haptics.impactAsync('Light')` on valid snap; no haptic on invalid placement |
| Array grid mode for counters | Snapping counters into rows × columns teaches multiplication as area model — no free manipulative tool for children integrates this with the skill curriculum | MEDIUM | Grid dimensions configurable (e.g., 3×4 for 3×4=12) |
| Pinch-to-zoom on number line for fractions | Subdividing between integers to show 1/2, 1/4 marks is pedagogically critical for grade 3 fractions and uncommon in free tools | HIGH | react-native-gesture-handler PinchGestureHandler; only active when skill is a fraction skill |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Free-draw / whiteboard on the manipulative canvas | Seems creative; many apps add this | Clutters the canvas, distracts from the mathematical object, very hard to parse intent for skill tracking | Guided mode's highlighted cells/positions provide structured scaffolding without open-ended drawing |
| Voice-controlled placement ("put 3 blocks in tens column") | Feels high-tech and accessible | Speech recognition on mobile for 6-9 year old voices is highly unreliable (accent, lisp, noise). COPPA considerations around audio capture | Tap-to-add as accessible fallback is simpler, more reliable, already planned |
| Multiplayer shared manipulative canvas | Collaborative learning sounds good | COPPA blocks real-time sharing of personal activity. Real-time sync adds significant infrastructure complexity. Adds 0 value for solo adaptive learning | Sandbox mode gives unstructured exploration; session-embedded is always solo |
| Auto-animate "watch me solve it" mode that shows the answer | Requested by parents as a teaching mode | Research shows passive viewing does not transfer — only active manipulation leads to conceptual understanding. Also conflicts with the HINT mode's Socratic guardrail | BOOST mode in the future AI tutor milestone walks through a similar problem step-by-step while keeping the child active |
| Unlimited draggable objects on canvas (no cap) | Seems like more flexibility | Beyond ~30 objects the JS thread cannot keep 60fps on mid-range Android. Gesture handler events begin to drop. UX becomes visually cluttered and cognitively overwhelming for ages 6-9 | Enforce 30-object max with auto-grouping trigger. Document this constraint in PITFALLS.md |
| Pixel-accurate free positioning (no snap) | Advanced users want precise control | Ages 6-9 cannot reliably position objects with pixel precision on touch. Inaccurate placement breaks mathematical relationships (e.g., fraction strip not aligned) | Snap zones with generous 20dp hit radius make placement forgiving |
| Persistent cross-session freeplay state | "Save my sandbox" feels like a portfolio feature | Complex state management, not tied to learning goals, and children at these ages don't revisit saved work. Adds store migration overhead | Sandbox resets per session. Session results (XP, progress) are already persisted |

---

## Feature Dependencies

```
[CPA Stage Progression]
    └──requires──> [BKT mastery scores] (already exists in v0.3)
    └──requires──> [Manipulative-to-skill mapping table]
    └──requires──> [Each manipulative implements concrete + pictorial + abstract render modes]

[Session-embedded manipulatives]
    └──requires──> [Each manipulative as a standalone React component]
    └──requires──> [Session orchestrator wrong-answer hook] (exists in v0.3)
    └──enhances──> [Future AI Tutor HINT/BOOST modes] (v0.5)

[Guided mode / next-action highlight]
    └──requires──> [Problem-type → manipulation sequence lookup table]
    └──requires──> [ManipulativeEvent logging]
    └──enhances──> [Future AI Tutor TEACH mode] (v0.5)

[Auto-group (10 cubes → rod)]
    └──requires──> [Proximity detection logic]
    └──requires──> [Reanimated group animation]

[Pinch-to-zoom number line]
    └──requires──> [react-native-gesture-handler PinchGestureHandler]
    └──requires──> [Fraction skill detection from current problem]

[Array grid mode for counters]
    └──requires──> [Counters base component]
    └──requires──> [Grid dimension config from skill context]

[Manipulative interaction event logging]
    └──requires──> [ManipulativeEvent type definition]
    └──feeds──> [Future AI Tutor analysis] (v0.5)

[Double ten frame (11-20)]
    └──requires──> [Ten frame base component]
    └──requires──> [Auto-spawn second frame when first is full]
```

### Dependency Notes

- **CPA progression requires BKT:** P(L) thresholds drive which render mode is shown. BKT already exists in v0.3 (slice: `skillStates`). No new state needed — read P(L) from existing store.
- **Session-embedded requires standalone components first:** The session overlay is just a modal wrapping the same manipulative component used in sandbox. Build standalone first, embed second.
- **Guided mode is a v0.4 differentiator, not a blocker:** The manipulatives work without guided mode. Guided mode is an enhancement that also seeds data for the v0.5 AI tutor.
- **Auto-group and pinch-zoom are the two highest-risk interactions:** Both require coordinated gesture detection + animation that is easy to get wrong on both iOS and Android. Plan for integration time.

---

## MVP Definition

For v0.4, the milestone scope is all 6 manipulatives. The question is what level of feature completeness each requires at launch vs. what can be enhanced later.

### Launch With (v0.4 core)

- [ ] All 6 manipulative types as interactive React Native components: base-ten blocks, number line, ten frames, counters, fraction strips, bar models — **required by milestone spec**
- [ ] Drag-and-drop at 60fps using react-native-gesture-handler + react-native-reanimated — **foundation all other features depend on**
- [ ] Snap-to-grid / snap-to-cell for each manipulative — **without snap, objects feel broken**
- [ ] Running count / value display on each manipulative — **core educational feedback loop**
- [ ] Tap-to-add / tap-to-remove as accessibility fallback — **48dp targets, ages 6-7 cannot reliably drag small objects**
- [ ] Auto-group: 10 cubes → rod (base-ten blocks) and tap to break apart — **regrouping is the primary use case for base-ten blocks**
- [ ] Hop arrows on number line with labeled values — **without hops, number line is just a display, not a tool**
- [ ] Two-color counter mode — **needed for comparison and subtraction concepts**
- [ ] Fraction strip shading + comparison stack — **useless without shading; comparison is the primary use case**
- [ ] Bar model part-whole layout with "?" label — **minimum structure for word problem scaffolding**
- [ ] Per-manipulative sandbox screen — **required by milestone spec**
- [ ] Session-embedded manipulative as visual aid (collapsible overlay) — **required by milestone spec**
- [ ] BKT-driven CPA stage progression (concrete → pictorial → abstract) — **required by milestone spec; uses existing BKT scores**
- [ ] Manipulative-to-skill mapping table — **required for session-embedded auto-selection**
- [ ] Haptic feedback on snap — **low effort, high physical feel payoff**
- [ ] Reset button on all manipulatives — **essential for children who make mistakes**

### Add After Validation (v0.4 polish)

- [ ] Guided mode with next-action highlight — add once core interactions are solid; enables better data for v0.5 AI tutor
- [ ] Undo last action — add once drag-and-drop is stable; lower priority than core interactions
- [ ] Array grid mode for counters — add when multiplication skills are being actively practiced (grade 2-3 focus)
- [ ] Double ten frame auto-spawn — add after single ten frame is validated; needed for add_within_20 skill

### Future Consideration (v0.5+)

- [ ] Pinch-to-zoom number line for fractions — defer until fraction skills are in active session practice; high implementation complexity
- [ ] ManipulativeEvent logging for AI tutor analysis — defer to v0.5 AI Tutor milestone when the consumer exists
- [ ] CPA stage indicator visible to child — low complexity but low urgency; add during v0.5 UI work alongside tutor modes
- [ ] Fraction circles (pie mode) — nice addition but fraction strips cover the same concepts; defer to avoid scope creep

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Drag-and-drop at 60fps | HIGH | HIGH | P1 |
| Snap-to-grid | HIGH | MEDIUM | P1 |
| Auto-group 10 cubes → rod | HIGH | HIGH | P1 |
| Running count display | HIGH | LOW | P1 |
| Tap-to-add fallback | HIGH | LOW | P1 |
| Session-embedded visual aid | HIGH | MEDIUM | P1 |
| Sandbox screens (all 6) | HIGH | MEDIUM | P1 |
| BKT-driven CPA progression | HIGH | MEDIUM | P1 |
| Manipulative-to-skill mapping | HIGH | LOW | P1 |
| Hop arrows on number line | HIGH | MEDIUM | P1 |
| Fraction strip shading + stack | HIGH | MEDIUM | P1 |
| Bar model part-whole + "?" | HIGH | MEDIUM | P1 |
| Two-color counter mode | MEDIUM | LOW | P1 |
| Haptic on snap | MEDIUM | LOW | P1 |
| Reset button | HIGH | LOW | P1 |
| Guided mode (next-action highlight) | HIGH | HIGH | P2 |
| Undo last action | MEDIUM | MEDIUM | P2 |
| Array grid for counters | MEDIUM | MEDIUM | P2 |
| Double ten frame auto-spawn | MEDIUM | MEDIUM | P2 |
| Pinch-to-zoom number line | MEDIUM | HIGH | P3 |
| ManipulativeEvent logging | MEDIUM | MEDIUM | P3 |
| CPA stage badge for child | LOW | LOW | P3 |
| Fraction circles (pie mode) | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v0.4 launch
- P2: Should have, add when core is working
- P3: Future milestone consideration

---

## Competitor Feature Analysis

| Feature | Math Learning Center (free web) | Toy Theater (free web) | Brainingcamp (paid, web) | Our Approach |
|---------|--------------------------------|------------------------|--------------------------|--------------|
| Base-ten blocks | Yes, full (join/break, color groups) | Yes, basic | Yes, full | Same plus BKT CPA stage + session embedding |
| Number line with jumps | Yes, above/below line jumps | Yes, basic | Yes | Same plus adaptive range from skill context |
| Ten frames | Yes, 5/10/double/custom frames | Yes, basic | Yes | Same plus auto-spawn second frame |
| Fraction strips | Yes, via Fractions app | Yes, basic | Yes, full | Same plus BKT-driven denominator reveal |
| Bar models | No | No | No (has algebra tiles) | **Differentiator** — Singapore Math bar model is absent from free web tools |
| Counters with grouping | Yes (two-color) | Yes | Yes | Same plus array grid mode for multiplication |
| CPA progression | No | No | No | **Differentiator** — no competitor auto-progresses based on mastery |
| Adaptive skill selection | No | No | No | **Differentiator** — manipulative chosen by skill being practiced |
| Session-embedded | No (standalone only) | No | No | **Differentiator** — embedded in practice flow |
| Mobile (native) | No (web only, usable on tablet) | No | No | **Differentiator** — native touch at 60fps vs web canvas |

---

## CPA Progression: What It Looks Like Per Manipulative

This section specifies the three render modes for each manipulative type, as CPA is a core milestone requirement.

### Concrete Mode (P(L) < 0.70 for the relevant skill)

Fully interactive drag-and-drop. Child moves physical-feeling objects. Maximum affordance for exploration.

- Base-ten blocks: Draggable 3D-feeling cubes, rods, flats with drop shadows
- Number line: A movable frog or token the child drags along the line
- Ten frame: Chunky colored circles dragged into cells
- Counters: Large (44dp minimum) colorful discs dragged freely
- Fraction strips: Draggable colored strip segments that can be repositioned
- Bar model: Draggable resize handle on each bar segment

### Pictorial Mode (P(L) 0.70–0.90)

Pre-drawn diagram shown alongside a simpler interaction. Child taps to complete or shade rather than full drag.

- Base-ten blocks: Drawn squares and rods; child taps to add/remove without drag
- Number line: Printed line with numbered marks; child taps a position or taps an arrow to hop
- Ten frame: Drawn grid; child taps cells to fill/unfill
- Counters: Dot diagram with tap-to-shade
- Fraction strips: Printed strip rows; child taps segments to shade
- Bar model: Pre-drawn bar outlines; child taps to add a label or tap-drag to resize

### Abstract Mode (P(L) ≥ 0.90)

Symbol-only. No manipulative shown by default. Manipulative available as an optional collapsible hint (child can request it).

- All types: Standard equation or expression displayed. "Show me with blocks/strips/etc." toggle available.
- This mode confirms the child can work without scaffolding while keeping the visual safety net accessible.

**Transition logic:** Non-linear per research. Child can always access a lower CPA mode by tapping a "use blocks" affordance. The system advances upward automatically on consecutive correct answers (threshold: 3 correct at current level per existing AI tutor design in doc 03).

---

## Existing System Integration Points

These dependencies on already-shipped v0.3 code must be respected:

| v0.3 System | How v0.4 Manipulatives Use It | Risk |
|------------|-------------------------------|------|
| BKT `skillStates` slice | Read P(L) to determine CPA mode | LOW — read-only; no new state needed |
| Session orchestrator (wrong-answer hook) | Trigger manipulative overlay after first wrong answer | MEDIUM — need to add hook in existing session flow without breaking 557 tests |
| Problem schema (skill_id, topic, operands) | Map skill_id to manipulative type and configure range/mode | LOW — problem schema is stable |
| Zustand store (STORE_VERSION=4) | Add `manipulativeState` slice for sandbox persistence within session | MEDIUM — must bump version + migration; follow existing slice pattern |
| react-native-gesture-handler (already installed) | Use Gesture API v2 (not legacy handler API) | LOW — already a dependency |
| react-native-reanimated (already installed) | UI-thread animations via `useAnimatedStyle`, `withSpring`, `withTiming` | LOW — already a dependency |
| XP/celebration system | Trigger confetti on correct answer within manipulative-assisted session | LOW — existing Lottie animation reused |

---

## Sources

- [Internal research: 04-virtual-manipulatives.md] (Moyer-Packenham 2016, NCTM 2014, Carbonneau 2013)
- [Internal research: 02-curriculum-standards.md] (Common Core grade 1-3 skill taxonomy)
- [Internal research: 03-ai-tutoring-engine.md] (CPA progression thresholds, three-mode tutor design)
- [Internal research: 09-child-ux-design.md] (Piaget concrete operational stage, working memory limits, touch target requirements)
- [CPA Approach Explained — Maths No Problem](https://mathsnoproblem.com/en/approach/concrete-pictorial-abstract)
- [Concrete Pictorial Abstract — Third Space Learning](https://thirdspacelearning.com/blog/concrete-pictorial-abstract-maths-cpa/)
- [Number Pieces App — Math Learning Center](https://www.mathlearningcenter.org/apps/number-pieces)
- [Number Frames App — Math Learning Center](https://apps.apple.com/apps/number-frames)
- [Math Learning Center App Suite — 14 free manipulative apps](https://www.mathlearningcenter.org/apps)
- [Fraction Tiles — Brainingcamp](https://www.brainingcamp.com/fraction-tiles)
- [Bar Modelling — Maths No Problem](https://mathsnoproblem.com/en/approach/bar-modelling)
- [Concreteness Fading in Mathematics — Springer (Fyfe et al.)](https://link.springer.com/article/10.1007/s10648-014-9249-3)
- [Making Math Moments Matter — Concreteness Fading Model](https://makemathmoments.com/concreteness-fading/)
- [Impact of virtual vs concrete manipulatives on fractions — Taylor & Francis 2024](https://www.tandfonline.com/doi/full/10.1080/2331186X.2024.2379712)
- [Prodigy in-game math aids (embedded manipulative reference)](https://prodigygame.zendesk.com/hc/en-us/articles/201695627-FAQ-In-Game-Student-Math-Aids)
- [Toy Theater — Virtual Manipulatives collection](https://toytheater.com/category/teacher-tools/virtual-manipulatives/)
- [Didax Virtual Manipulatives collection](https://www.didax.com/math/virtual-manipulatives.html)
- [10 Math Manipulatives — Prodigy Blog (skill mapping reference)](https://www.prodigygame.com/main-en/blog/math-manipulatives)

---
*Feature research for: Virtual Math Manipulatives — Tiny Tallies v0.4*
*Researched: 2026-03-03*
