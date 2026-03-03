# Project Research Summary

**Project:** Tiny Tallies — Virtual Manipulatives (v0.4 milestone)
**Domain:** Interactive math manipulatives for children ages 6-9 (React Native / Expo)
**Researched:** 2026-03-03
**Confidence:** HIGH

## Executive Summary

The v0.4 milestone delivers six virtual math manipulatives (base-ten blocks, number line, ten frames, counters, fraction strips, bar models) that integrate into an existing adaptive learning session flow. Research confirms that all required animation and gesture libraries are already installed — the milestone is entirely implementation work, not infrastructure work. The one pre-flight fix required before any code runs is a `babel.config.js` plugin change: replacing `react-native-reanimated/plugin` with `react-native-worklets/plugin` for Reanimated 4 compatibility. Without this change, worklet-based gesture code will fail at runtime on device even though tests pass.

The recommended architecture grafts three additive subsystems onto v0.3 without modifying existing session, skill, or scoring code: (1) a shared draggable primitive (`DraggableItem` + `SnapZone`) that runs entirely on the UI thread via Reanimated SharedValues, (2) a CPA progression service that reads existing BKT `P(L)` scores per skill and advances children through concrete → pictorial → abstract stages per-skill (not globally), and (3) a `ManipulativePanel` overlay that embeds contextually selected manipulatives inside the existing session screen. The store schema bump (STORE_VERSION 4 → 5) is required to add `cpaLevel` to each `SkillState` entry and must include a migration function.

The two highest-risk implementation areas are the draggable primitive (gesture/animation pitfalls compound across all 6 manipulatives if the base is wrong) and the CPA progression logic (must use BKT `P(L)` not Elo, must be per-skill not per-child). Both must be validated with explicit unit tests before downstream manipulative components are built. Free competitors (Math Learning Center, Toy Theater) offer comparable drag-and-drop manipulatives but none offer adaptive CPA progression, session-embedded manipulatives, or native mobile touch at 60fps — these are the three differentiators that justify the milestone.

---

## Key Findings

### Recommended Stack

No new packages are required. The installed library set (react-native-gesture-handler 2.28.0, react-native-reanimated 4.1.6, react-native-worklets 0.7.4, react-native-svg 15.12.1, expo-haptics 15.0.8, expo-linear-gradient 15.0.7) covers every manipulative interaction. New Architecture is already enabled (`newArchEnabled: true`), which is required for Reanimated 4.

The only mandatory pre-work is the babel plugin change. All drag-and-drop code must use the Reanimated 4 API patterns: `Gesture.Pan()` (not `PanGestureHandler`), `scheduleOnRN` from `react-native-worklets` (not deprecated `runOnJS`), and `transform: [translateX, translateY]` (never `left`/`top`) for animated positions. SVG-based manipulatives (number line, fraction strips) must use `useAnimatedProps` with `createAnimatedComponent` rather than `useAnimatedStyle` because SVG attributes are props, not style.

**Core technologies:**
- `react-native-gesture-handler` 2.28.0: All drag interactions — use `Gesture.Pan()` Gesture API, compose with `Gesture.Race(tap, pan)` for tap/drag conflict resolution
- `react-native-reanimated` 4.1.6: 60fps UI-thread animations — `useSharedValue`, `withSpring`, `useAnimatedStyle`, `useAnimatedProps`
- `react-native-worklets` 0.7.4: Worklet runtime — provides babel plugin and `scheduleOnRN` for crossing to RN thread
- `react-native-svg` 15.12.1: SVG rendering for number lines, fraction strips, bar model bracket lines
- `expo-haptics` 15.0.8: Tactile feedback on snap (`Light`), group formation (`Success`), no `Heavy`/`Error` per no-punitive-mechanics principle

### Expected Features

**Must have (table stakes — v0.4 launch):**
- Drag-and-drop at 60fps for all 6 manipulative types — children expect objects to be physically movable
- Snap-to-grid / snap-to-cell — objects that float without snapping feel broken to ages 6-9
- Running count/value display updating on drop (not during drag — distracting)
- Tap-to-add / tap-to-remove as fallback — 48dp targets; ages 6-7 cannot reliably drag small objects
- Auto-group: 10 cubes animate into rod (base-ten blocks); tap rod to break into 10 cubes
- Hop arrows with labeled values (number line) — without hops, the number line is display-only
- Two-color counter mode — standard for comparison and subtraction concepts
- Fraction strip shading + stack comparison — useless without shading; comparison is the primary use case
- Bar model part-whole layout with "?" label — minimum structure for word problem scaffolding
- Per-manipulative sandbox screen (standalone free-play)
- Session-embedded manipulative as collapsible visual aid overlay
- BKT-driven CPA stage progression (concrete → pictorial → abstract) per skill
- Manipulative-to-skill mapping table (auto-selects correct manipulative for problem)
- Haptic feedback on snap and grouping events
- Reset button on all manipulatives

**Should have (v0.4 polish — add after core is validated):**
- Guided mode with next-action highlight — bridges to v0.5 AI tutor without requiring LLM
- Undo last action — stack-based, max 10 deep; maintains "playing with objects" feel
- Array grid mode for counters — teaches multiplication as equal groups / area model
- Double ten frame auto-spawn — required for add-within-20 skill group

**Defer (v0.5+):**
- Pinch-to-zoom on number line for fractions — high complexity, child UX research shows pinch unreliable for ages 6-9
- ManipulativeEvent logging for AI tutor — no consumer until v0.5 AI Tutor milestone
- CPA stage badge visible to child — low urgency, surface during v0.5 UI work
- Fraction circles (pie mode) — fraction strips cover same concepts; avoid scope creep

**Anti-features (do not implement):**
- Free-draw / whiteboard on manipulative canvas — clutters canvas, breaks skill tracking
- Voice-controlled placement — unreliable for child voices, COPPA audio capture concerns
- Multiplayer shared canvas — COPPA blocks real-time sharing; adds infrastructure complexity
- Auto-animate "watch me solve it" mode — passive viewing does not transfer; violates HINT mode guardrail
- Unlimited draggable objects (no cap) — JS thread cannot maintain 60fps beyond ~30 objects; cap at 30 with auto-grouping

### Architecture Approach

The architecture is additive: three new subsystems attach to the v0.3 core without touching existing session, Elo, BKT, or Leitner code. The `components/manipulatives/` tree holds 6 self-contained manipulative folders each under 500 lines, plus three shared primitives (`DraggableItem`, `SnapZone`, `AnimatedCounter`). Services live in `src/services/manipulatives/` as pure functions testable without React. State is split: a new `manipSlice` holds sandbox preferences and history; `skillStatesSlice` gains a `cpaLevel` field per skill. STORE_VERSION bumps from 4 to 5 with a migration that initializes `cpaLevel: 'concrete'` for all existing skills. The `ManipulativePanel` renders as an in-screen collapsible panel (not a Modal navigator) to avoid gesture conflicts with React Navigation.

**Major components:**
1. `DraggableItem` — reusable pan gesture + SharedValue + snap primitive; the foundation every manipulative builds on
2. `cpaMappingService` — pure function reading BKT `P(L)` → CPA level; contains the per-skill advancement thresholds
3. `ManipulativePanel` — session-embedded overlay; dumb component that receives `type`, `config`, `cpaLevel` as props; no store access
4. `ManipExploreNavigator` + 6 `SandboxScreen` files — free-play exploration screens, isolated from session state
5. `skillManipMap` — static table mapping `skill_id` → appropriate manipulative types + configuration

### Critical Pitfalls

1. **Snap logic on JS thread** — Move ALL snap math into `'worklet'`-annotated functions called from `onEnd` only. Running snap on JS thread causes perceptible lag with 10+ objects on Android. Must be correct in `DraggableItem` before any manipulative is built on top.

2. **Width/height animation instead of transform** — All draggable positions must use `transform: [{ translateX }, { translateY }]`, never `left`/`top`/`width`/`height`. Layout properties trigger full native layout recalculation every frame — frame drops from 60fps to 30-40fps with 20+ objects. This is architectural and expensive to retrofit.

3. **Gesture conflicts between tap and drag** — Set `minDistance(8)` on Pan gestures and compose with `Gesture.Race(tap, pan)` so taps complete before pan activates. Without this, age-6 children who briefly rest a finger will trigger pan and block tap-to-place interactions.

4. **CPA wired to Elo instead of BKT P(L)** — CPA progression must read `skillState.mastery` (BKT `P(L)`), not Elo. Using Elo causes stage oscillation on easy problem streaks. Thresholds: `P(L) < 0.40` → concrete required, `0.40–0.85` → pictorial, `≥ 0.85` → abstract, `≥ 0.95` → mastered.

5. **CPA as global per-child state** — Store `cpaLevel` in `SkillState` (per-skill), never in `childProfileSlice` (per-child). A child Abstract on addition must start Concrete on newly unlocked subtraction-with-borrowing. Schema decision affects STORE_VERSION bump.

6. **Zustand state captured inside worklets** — Worklets serialize closed-over values at creation, not reactively. Any store-derived config (e.g., age-based snap tolerance) must be bridged through a `useSharedValue` updated via `useEffect`.

7. **Manipulative state leaked into persisted store** — Drag positions, counter placements, and bar layouts are ephemeral. They must live in component-local state or refs only — never in `sessionStateSlice` or `partialize`. The existing `usePreventRemove` navigation guard already prevents mid-session navigation loss.

---

## Implications for Roadmap

Based on the combined research, the recommended phase structure follows the architecture build order: schema and services first (nothing else can type-check without them), shared primitives second (all 6 manipulatives depend on `DraggableItem`), manipulative components third (parallelizable after primitives), session integration fourth, and sandbox navigation last (standalone; does not block the session-embedded feature).

### Phase 1: Foundation — Store Schema and Services

**Rationale:** Every downstream file imports types from the store and services. These have no dependencies on UI components and can be fully tested immediately. The babel config fix also belongs here as it is required for any worklet code to compile.
**Delivers:** STORE_VERSION=5 with migration, `cpaLevel` in `SkillState`, `manipSlice`, `cpaMappingService`, `manipulativeSelector`, `skillManipMap`
**Addresses:** BKT-driven CPA stage progression (table-stakes feature); manipulative-to-skill mapping
**Avoids:** Pitfalls 4, 5, 6 — CPA per-skill schema established before any component reads it; store migration included
**Research flag:** Standard patterns — Zustand slice + migration follows existing codebase conventions. Skip research-phase.

### Phase 2: Shared Drag Primitives

**Rationale:** `DraggableItem`, `SnapZone`, and `AnimatedCounter` are required by all 6 manipulatives. Getting them right (UI-thread worklets, transform-based positioning, tap/drag gesture composition) is the highest-risk implementation step. Validated primitives mean all downstream manipulatives inherit correct behavior.
**Delivers:** `DraggableItem.tsx`, `SnapZone.tsx`, `AnimatedCounter.tsx` with full gesture test coverage
**Uses:** `Gesture.Race(tap, pan)`, `useSharedValue`, `withSpring`, `scheduleOnRN`, `overshootClamping: true`
**Avoids:** Pitfalls 1, 2, 3, 6 — snap worklet, transform positioning, gesture composition, SharedValue bridge for store config
**Research flag:** Official docs provide clear patterns (HIGH confidence). No research-phase needed; validate with `fireGestureHandler` tests and Android release build FPS check before moving on.

### Phase 3: Manipulative Components (parallelizable)

**Rationale:** Build simple-to-complex. `TenFrame` validates the DraggableItem pattern with lowest complexity (View grid + counters). `Counters` adds grouping logic. `BaseTenBlocks` is the most complex (3 piece types, place-value columns, auto-group 10→rod). SVG-based manipulatives (`NumberLine`, `FractionStrips`, `BarModel`) use a different pattern and can be developed in parallel after TenFrame proves the drag primitive.
**Delivers:** All 6 manipulative components with concrete-mode interactions; sandbox-ready (no session context required yet)
**Implements:** `BaseTenBlocks`, `NumberLine`, `TenFrame`, `Counters`, `FractionStrips`, `BarModel` component folders
**Avoids:** Auto-group animation queuing (never play while gesture is active — use `isGestureActive` SharedValue guard)
**Research flag:** TenFrame and Counters — standard patterns. BaseTenBlocks auto-group logic (10-cube proximity detection + animation sequencing) may benefit from a targeted research spike if design is unclear. NumberLine SVG + Reanimated animated props — established pattern from STACK.md. No full research-phase needed.

### Phase 4: CPA Progression and Session Integration

**Rationale:** Once manipulative components exist as standalone React components, wiring them into the session flow via `ManipulativePanel` and `useManipulative` is additive. CPA level determination is pure-function logic already built in Phase 1 — this phase wires it to the session commit and the session screen render.
**Delivers:** `ManipulativePanel`, `useManipulative` hook, `SessionScreen` conditional render, `commitSessionResults` CPA advance on session complete
**Addresses:** Session-embedded visual aid (required milestone feature); BKT-driven CPA auto-advance
**Avoids:** Pitfall 7 — manipulative state stays ephemeral in component local state; nothing added to `partialize`
**Research flag:** Session orchestrator integration touches existing code with 557 tests. Review `sessionOrchestrator.ts` closely before changes. No external research needed — integration pattern is internal.

### Phase 5: Sandbox Navigation

**Rationale:** Sandbox screens are fully independent of session flow. They can be built last and shipped incrementally without blocking the session-embedded feature. The `ManipExploreNavigator` + 6 `SandboxScreen` files wire the manipulative components (built in Phase 3) into standalone free-play screens.
**Delivers:** `ManipExploreNavigator`, 6 sandbox screens, HomeScreen entry point, navigation type extensions
**Addresses:** Per-manipulative sandbox screen (required milestone feature)
**Avoids:** Sandbox screens must not read session store — only `manipSlice` + `childProfile`
**Research flag:** Standard React Navigation patterns. No research-phase needed.

### Phase 6: Polish Features

**Rationale:** After core interactions are validated, add guided mode (next-action highlight), undo, array grid for counters, and double ten frame. These are v0.4 polish features — they enhance the core but do not block the milestone launch criteria.
**Delivers:** Guided mode hints, undo stack (max 10), array grid mode for multiplication, double ten frame auto-spawn
**Addresses:** P2 features from feature prioritization matrix
**Research flag:** Guided mode requires a problem-type → manipulation-sequence lookup table. If no prior spec exists for this mapping, a design spike is needed before implementation. Flag for planning.

### Phase Ordering Rationale

- Schema changes come first because TypeScript strict mode catches schema-dependent bugs immediately across all downstream files
- Shared primitives before manipulatives because all 6 manipulatives depend on `DraggableItem` — a wrong primitive means 6 wrong manipulatives
- Session integration after standalone components because `ManipulativePanel` wraps the same components used in sandbox (build standalone first, embed second)
- Sandbox navigation last because it is completely decoupled from the session-embedded feature and does not block the critical path
- Polish features last so core interactions can be validated on real devices before adding complexity

### Research Flags

Phases needing deeper research or design spikes during planning:
- **Phase 3 (BaseTenBlocks):** The 10-cube proximity detection and auto-group animation sequencing may need a targeted design spike if the interaction choreography is not pre-specified. Evaluate during phase planning.
- **Phase 6 (Guided Mode):** Requires a problem-type → manipulation-sequence lookup table. This is domain design work (which manipulative actions solve which problem types) that needs explicit specification before coding begins.

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 1:** Zustand slice + migration follows exact existing codebase conventions
- **Phase 2:** Official Reanimated 4 + RNGH 2 docs provide complete, verified patterns
- **Phase 4:** Internal integration following commit-on-complete pattern already used for Elo/BKT/Leitner
- **Phase 5:** Standard React Navigation nested navigator pattern

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries installed and version-verified against package.json and app.json. Babel plugin change confirmed required by official Reanimated 4 migration guide. `scheduleOnRN` vs `runOnJS` verified from official worklets docs. |
| Features | HIGH | Table-stakes grounded in competitor analysis (Math Learning Center, Toy Theater, Brainingcamp) plus internal planning docs (04-virtual-manipulatives.md, 03-ai-tutoring-engine.md). CPA thresholds backed by Bruner + NCTM + Fyfe et al. peer-reviewed research. |
| Architecture | HIGH | All integration points verified against existing codebase (store structure, slice pattern, session orchestrator, commit-on-complete). Build order is dependency-driven with clear rationale. |
| Pitfalls | HIGH (technical) / MEDIUM (CPA pedagogy) | Gesture/animation pitfalls from official Software Mansion docs + verified codebase patterns. CPA design pitfalls from research literature — well-sourced but interpretive. |

**Overall confidence:** HIGH

### Gaps to Address

- **Auto-group animation sequencing (BaseTenBlocks):** Research confirms that the 10-cube → rod animation is required and HIGH complexity, but does not specify the exact interaction choreography (proximity threshold in pixels, animation duration, whether cubes slide to a midpoint or directly to rod position). Needs a design decision before Phase 3 implementation.
- **Guided mode manipulation sequences:** The feature is designed (subtle highlight of next correct action) but the lookup table mapping problem-type → manipulation-sequence is not specified in any research doc. This is a content design gap, not a technical gap. Must be resolved during Phase 6 planning.
- **Android 60fps validation threshold:** Research warns that 30 objects at 60fps on mid-range Android is the target but notes this must be validated in a release build. The exact Android device benchmark target is not specified. Suggest defining a reference device (e.g., Samsung Galaxy A-series) during Phase 2 planning.
- **CPA threshold calibration:** The research specifies `P(L) < 0.40` → concrete, `0.40–0.85` → pictorial, `≥ 0.85` → abstract, but ARCHITECTURE.md uses slightly different thresholds (0.60 and 0.85). PITFALLS.md uses 0.40 and 0.85. Reconcile to a single authoritative threshold table before Phase 1 service implementation.

---

## Sources

### Primary (HIGH confidence)
- `package.json`, `app.json` — installed versions, newArchEnabled flag confirmed
- [Reanimated 4 Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/) — babel plugin, scheduleOnRN, withSpring changes
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — New Architecture status
- [expo-haptics docs](https://docs.expo.dev/versions/latest/sdk/haptics/) — ImpactFeedbackStyle values
- [react-native-worklets docs](https://docs.swmansion.com/react-native-worklets/docs/) — babel plugin, scheduleOnRN API
- [RNGH Gesture Composition docs](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/)
- [Reanimated Performance Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)
- `.planning/04-virtual-manipulatives.md` — CPA mode specs, component animation principles
- `.planning/03-ai-tutoring-engine.md` — CPA progression thresholds, TEACH mode guardrails
- `.planning/09-child-ux-design.md` — Touch target requirements, working memory limits, pinch gesture concerns
- Existing codebase (`src/store/`, `src/services/`, `src/navigation/`) — direct inspection

### Secondary (MEDIUM confidence)
- [RNGH 2.28 release notes](https://x.com/swmansion/status/1947662341320925570) — gestureHandlerRootHOC deprecation
- [Concreteness Fading — Fyfe et al., Springer](https://link.springer.com/article/10.1007/s10648-014-9249-3) — CPA research basis
- [Brainingcamp Accessibility](https://weeklyvoice.com/brainingcamp-sets-new-standard-for-accessibility-in-digital-math-manipulatives/) — competitor reference
- [Shopify: Making React Native Gestures Feel Natural](https://shopify.engineering/making-react-native-gestures-feel-natural) — gesture engineering patterns
- [Reanimated + Zustand synchronization discussion](https://github.com/software-mansion/react-native-reanimated/discussions/4685) — shared value bridge pattern
- [CPA Approach — Maths No Problem](https://mathsnoproblem.com/en/approach/concrete-pictorial-abstract) — pedagogy reference
- [Math Learning Center App Suite](https://www.mathlearningcenter.org/apps) — competitor feature baseline
- [Toy Theater Virtual Manipulatives](https://toytheater.com/category/teacher-tools/virtual-manipulatives/) — competitor feature baseline

---
*Research completed: 2026-03-03*
*Ready for roadmap: yes*
