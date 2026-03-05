# Project Research Summary

**Project:** Tiny Tallies — v0.7 Gamification Features
**Domain:** Children's math learning app gamification (ages 6-9) — achievement badges, skill map, daily challenges, avatar customization, UI themes
**Researched:** 2026-03-04
**Confidence:** HIGH

## Executive Summary

Tiny Tallies v0.7 adds a gamification layer on top of a mature, adaptive math learning engine. The foundational approach is badge-first: an achievement system (badge registry, evaluation engine, store slice) must be built before anything else, because unlockable avatars, frames, and themes all depend on badges as their unlock mechanism. This is ethically differentiated from competitors — no coins, no shop, no paywall — all cosmetics are earned through achievement. The existing codebase already contains every library needed (react-native-svg, react-native-reanimated, lottie-react-native, expo-notifications); v0.7 is entirely an architectural and UI expansion, zero new npm dependencies.

The recommended build order flows from dependency to dependent: (1) achievement system foundation, (2) visual skill map (can parallel with badges since it reads existing data independently), (3) daily challenges, (4) avatar/frame unlockables, (5) UI themes last. Themes are deliberately deferred to last because the existing static `StyleSheet.create` pattern is hostile to dynamic theming — attempting themes early will destabilize all prior work. The visual skill map is the highest-complexity single feature (custom SVG/React Native DAG rendering of 14 nodes) and requires a performance validation spike before full build.

The critical risk is the overjustification effect: if badge pop-ups are too prominent or too frequent, research shows they shift children from "I enjoy math" to "I want the next badge," which reduces learning outcomes (Hanus & Fox 2015). The second critical risk is store migration: the Zustand store is at v8 and needs at least two new version bumps for gamification state; a botched migration silently drops persisted data. Both risks have clear prevention strategies documented in research and must be addressed in Phase 1 design decisions, not deferred to later phases.

## Key Findings

### Recommended Stack

The v0.7 gamification features require no new dependencies — every library is already in `package.json`. `react-native-svg` (v15.12.1) handles skill map node/edge rendering with animated mastery arcs via `useAnimatedProps`. `react-native-reanimated` (~4.1.1) drives 60fps node animations. `lottie-react-native` (~7.3.1) provides rich badge unlock celebration animations from free LottieFiles assets (10-30KB per animation). `expo-notifications` (~0.32.15) enables daily challenge reminders via `DailyTriggerInput` with no backend required. The theme system is implemented using React Context + Zustand — the project's existing `StyleSheet.create` pattern means NativeWind or styled-components would require rewriting 40+ component files.

See full details: `.planning/research/STACK.md`

**Core technologies:**
- `react-native-svg` v15.12.1: Skill map DAG rendering (nodes, edges, animated mastery arcs) — already installed, proven in 8 pictorial diagram components
- `react-native-reanimated` ~4.1.1: Skill map node animations (pulse, glow, unlock transitions) — already drives confetti and manipulative drag
- `lottie-react-native` ~7.3.1: Badge unlock celebration animations — already in package.json, not yet imported
- `expo-notifications` ~0.32.15: Daily challenge reminders — already in package.json, not yet imported
- `zustand` ^5.0.8: 2 new domain slices (achievementSlice, dailyChallengeSlice) — follows established slice pattern
- React Context: ThemeProvider for dynamic color palette — minimal migration cost for a theme-per-context approach

**No-install constraint:** FlashList must stay at v1.x (v2.x crashes on RN 0.81). No Skia, no d3, no graph visualization libraries needed for 14-node DAG.

### Expected Features

See full details: `.planning/research/FEATURES.md`

**Must have (table stakes) — these make the app feel gamified:**
- Achievement badges for mastery milestones — every major competitor has these; children need visible proof of learning
- Achievement badges for effort/behavior — rewards persistence over speed, aligns with growth mindset research
- Progress visualization (skill map) — highest-complexity v0.7 feature; children need concrete representation of abstract progress
- Avatar selection from presets — already partially implemented (8 emoji animals); needs expansion to 12-15 with unlock states
- Session-end summary with rewards — extend existing Results screen to show badge unlocks and challenge progress

**Should have (differentiators):**
- Visual skill map with prerequisite DAG — no competitor shows actual skill relationships as an interactive tree; this is the standout feature
- Daily challenges with rotating themes — bonus XP, no penalty for skipping, date-seeded rotation (fully offline, no backend)
- Unlockable avatars/frames via achievements — all cosmetics achievement-unlockable, zero paywall (ethically superior to Prodigy's FTC-complaint model)
- Unlockable UI color themes — 3-5 palette variants earned through badges
- Remediation achievement badges — no competitor rewards overcoming misconceptions; leverages existing misconceptionSlice

**Defer to v0.8+:**
- Social badges (requires family groups)
- Animated mascot integration (higher asset cost)
- Badge showcase/trophy wall screen (nice-to-have, not structural)
- Sound effects for badge unlocks (incremental polish)

**Anti-features to avoid explicitly:**
- Coins/virtual currency — creates loss aversion and is an FTC complaint target (Prodigy precedent)
- Collectible items/gacha — compulsive behavior in children; explicitly excluded from milestone scope
- Competitive leaderboards — COPPA implications; harms self-esteem in ages 6-9
- Daily login streak separate from weekly — causes anxiety documented in parent complaints; weekly streak is the correct granularity
- Pay-to-unlock cosmetics — violates project values; all cosmetics must be earned through gameplay
- Complex avatar builder — implementation cost disproportionate to value for emoji-based system

### Architecture Approach

The gamification layer integrates with the existing codebase via two new Zustand slices (achievementSlice, dailyChallengeSlice), minimal modifications to gamificationSlice (two new fields), and a single integration point at `commitSessionResults()` in sessionOrchestrator.ts. The achievement engine is a pure function evaluator — stateless, takes a snapshot of store state, returns newly-earned badge IDs — making it fully testable without store mocking. The skill map is a pure derivation of the existing `SKILLS` array (already defines the prerequisite DAG). Daily challenges are generated deterministically from a UTC date seed using the existing Mulberry32 PRNG — no backend required. Theme switching uses React Context over Zustand-persisted `equippedThemeId`, avoiding storage of full color palettes.

See full details: `.planning/research/ARCHITECTURE.md`

**Major components:**
1. `achievementSlice` + `achievementEngine` — foundation; pure function evaluator called once at session commit; stores earned badge IDs + timestamps
2. `dailyChallengeSlice` + `dailyChallengeScheduler` — date-seeded rotation; ephemeral state (today's challenge only); extends existing session modes
3. `SkillMapScreen` + `skillMapLayout` service — reads existing SKILLS DAG + skillStates; custom SVG rendering; no new data structures
4. `ThemeProvider` — React Context wrapping app root; reads `equippedThemeId` from store; components migrate from direct `colors` import to `useTheme()` hook
5. `AvatarScreen` — combines avatar + frame + theme selection; depends on badge system for unlock conditions

**Store migration plan:** STORE_VERSION 8 → 9 (achievements, lifetime stats, equipped theme/frame) → 10 (daily challenge state). Two separate migration hops to allow phased rollout.

**Build order from architecture research:** achievements (1) → badge UI (2) → badge integration (3) → skill map parallel track → daily challenges (4) → theme system (5) → avatar frames + AvatarScreen (6).

### Critical Pitfalls

See full details: `.planning/research/PITFALLS.md`

1. **Store migration cascade corruption** — Adding 5+ new features means multiple new persisted fields; a botched migration drops user data silently. Prevention: bump STORE_VERSION once per phase; write a roundtrip migration test (v8 fixture → v9/v10 → verify all fields intact); always update `partialize` in the same commit as the migration.

2. **Overjustification effect** — Prominent badges shift children from "I enjoy math" to "I want the next badge," reducing learning outcomes (Hanus & Fox 2015). Prevention: informational framing ("You earned this!"), cap 1 badge pop-up per session, never show grayed-out locked badge checklists, focus badge categories on effort/persistence not performance speed/accuracy.

3. **Skill map SVG rendering tanks on low-end Android** — 50-100+ SVG elements with animations cause multi-second render times on low-end devices. Prevention: technology spike before full build; limit animations to 2-3 active/next-unlockable nodes; use `useMemo` for layout computation; consider Skia or View-based layout as alternative.

4. **Theme system breaks existing accessibility guarantees** — `StyleSheet.create` captures static values at module load time, not render time; a "just wrap it in a context provider" approach without careful refactoring silently breaks color values. Prevention: use `useTheme()` hook + `createThemedStyles(theme)` factory pattern; preserve Lexend font across all themes; require WCAG AA contrast ratios for all palette variants; update `AppNavigator.tsx` contentStyle to avoid "White Flash of Death."

5. **Daily challenges create hidden punitive mechanics** — Even "optional" challenges become obligatory when they are the primary source of bonus XP and special badges. Prevention: no exclusive daily-challenge-only badges; cap XP bonus at 10-20% of standard session; multi-day availability windows; never show "missed challenge" messaging.

6. **HomeScreen and SessionScreen file size bloat** — SessionScreen is already at 552 lines (over the 500-line limit); adding gamification elements to HomeScreen, SessionScreen, and ResultsScreen will push all three well past the guardrail. Prevention: refactor SessionScreen below 500 lines BEFORE gamification work begins; extract every gamification element as its own component before integrating into screens.

## Implications for Roadmap

Based on combined research, the dependency graph dictates a clear phase structure. The badge system must come first because unlockable avatars, frames, and themes all use badges as their unlock mechanism. The skill map can be built in parallel (it reads only existing data). Themes must come last to avoid destabilizing earlier work.

### Phase 0: Pre-work — Screen Refactoring
**Rationale:** SessionScreen is already at 552 lines, violating the 500-line guardrail. Adding gamification to it without first refactoring guarantees an unmaintainable file. This must happen before any feature work.
**Delivers:** SessionScreen refactored below 500 lines; extraction of candidate components for gamification hook points
**Avoids:** Pitfall 6 (HomeScreen/SessionScreen file size bloat)
**Research flag:** SKIP — this is a refactor of existing code, no new patterns needed

### Phase 1: Achievement System Foundation
**Rationale:** Everything else — daily challenges, unlockable avatars, frames, themes — depends on the badge system existing. Store migration pattern for v8→v9 must be established correctly here; mistakes here corrupt all subsequent phases.
**Delivers:** achievementSlice, achievementEngine (pure function evaluator), achievementDefinitions (~30 badges covering skill mastery + effort + exploration + remediation), STORE_VERSION 8→9 migration, badge state persistence
**Addresses:** Achievement badges for mastery (table stakes), achievement badges for effort/behavior (table stakes)
**Avoids:** Store migration cascade (Pitfall 1), overjustification effect (Pitfall 2 — badge definition framing must be correct from day 1)
**Research flag:** SKIP — architecture is fully specified; patterns are established in codebase

### Phase 2: Badge UI + Results Integration
**Rationale:** Once the data layer exists, the display layer can be built and wired to the session flow. Keeping this separate from Phase 1 enforces the boundary between data (engine, store) and presentation (components, screens).
**Delivers:** BadgeCard, BadgePopup, BadgeGrid components; ResultsScreen extended with badge unlock display; HomeScreen badge count indicator; session commit wired to achievement evaluation
**Uses:** lottie-react-native (badge unlock celebration), react-native-reanimated (entrance animations)
**Implements:** Badge display layer from architecture
**Avoids:** Badge-during-session interruption (queue all unlocks for ResultsScreen, never mid-session)
**Research flag:** SKIP — well-documented Lottie + Reanimated patterns; component structure fully specified

### Phase 3: Visual Skill Map
**Rationale:** The skill map reads only existing data (SKILLS array + skillStates) so it has no dependencies on the badge system. It is the highest-complexity single feature and benefits from its own phase. A performance validation spike must happen before committing to full SVG rendering.
**Delivers:** SkillMapScreen, skillMapLayout service, SkillNode + SkillEdge + MapCanvas components; HomeScreen entry point
**Uses:** react-native-svg + react-native-reanimated for node/edge rendering and animations
**Avoids:** SVG performance on low-end devices (Pitfall 4 — spike first, measure time-to-interactive < 500ms on low-end Android before full build)
**Research flag:** NEEDS RESEARCH — validate rendering approach (SVG vs. View-based absolute positioning vs. Skia) with a performance spike before building full feature

### Phase 4: Daily Challenges
**Rationale:** Daily challenges depend on the badge system (challenge completion triggers badge awards and bonus XP). By this phase, the session orchestrator integration pattern is understood from Phase 2's badge integration work.
**Delivers:** dailyChallengeScheduler (date-seeded, offline), dailyChallengeSlice, DailyChallengeCard component, SessionScreen challenge mode integration (banner, shortened session config), ResultsScreen challenge result display, STORE_VERSION 9→10 migration
**Addresses:** Daily challenges with rotating themes (differentiator)
**Avoids:** Hidden punitive mechanics (Pitfall 5 — no exclusive badges, XP cap, multi-day windows, no "missed" messaging); session orchestrator god-function (Pitfall 7 — strategy pattern for Standard/Remediation/Challenge)
**Research flag:** SKIP — deterministic date-seeded pattern established; strategy extraction is architectural refactoring

### Phase 5: Unlockable Avatars and Frames
**Rationale:** Depends on the badge system (badges are the unlock mechanism). The avatar type migration (from the constrained `AvatarId` union to a broader unlockable system) requires care to preserve existing users' avatar selections.
**Delivers:** Expanded avatar pool (12-15 vs. current 8), avatar frame ring system (5-7 frames), AvatarDisplay composable component (frame + emoji + badge overlay), AvatarScreen with avatar/frame selection, HomeScreen avatar with frame rendering
**Addresses:** Unlockable avatars/frames via achievements (differentiator)
**Avoids:** Avatar type migration breaking existing selection (use separate `equippedAvatarId: string` field, keep `AvatarId` for presets); dead-end progression (extensible `UnlockCondition` union type supporting `achievement`, `level`, `time` variants)
**Research flag:** SKIP — avatar extension is straightforward; migration pattern follows established chain

### Phase 6: UI Themes
**Rationale:** Themes must come last because the existing `StyleSheet.create` pattern requires careful refactoring to work with dynamic theming. Building themes last means the refactoring scope is controlled and existing screens are stable before being theme-aware. The "White Flash of Death" and contrast-ratio concerns require dedicated QA.
**Delivers:** ThemeProvider (React Context), THEMES registry (3-5 color palettes), `useTheme()` hook, theme-aware screens (HomeScreen, ResultsScreen, AvatarScreen), ThemePicker in AvatarScreen, AppNavigator.tsx contentStyle updated
**Addresses:** Unlockable UI color themes (differentiator)
**Avoids:** Theme breaking accessibility (Pitfall 3 — WCAG AA validation, Lexend font preserved, White Flash prevention, manipulative colors exempted from theming)
**Research flag:** NEEDS RESEARCH — validate `createThemedStyles(theme)` factory approach vs. hook-per-component approach; determine which screens require full migration vs. cosmetic overlay only

### Phase Ordering Rationale

- **Dependency order is mandatory:** Badges → (Daily Challenges, Avatar Frames, Themes) because all three unlock mechanisms depend on the achievement system. Skill map is independent and can be Phase 3 or inserted anywhere after Phase 2.
- **Performance-risk isolation:** Skill map (highest technical risk) and themes (highest integration risk) are given their own phases rather than bundled with other features. This ensures failures in these areas don't block other deliverables.
- **Migration sequencing:** Two store version bumps (v9 for achievements, v10 for daily challenges) match two natural phase boundaries. Never bundle all migrations into one hop.
- **COPPA compliance is a cross-cutting concern:** No free-text input anywhere in gamification; all timestamps in UTC; gamification state never sent to external services. Verify in every phase.

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (Skill Map):** Rendering approach must be validated with a performance spike before committing. Options: (a) react-native-svg + useAnimatedProps, (b) View-based absolute positioning with Reanimated, (c) react-native-skia. Measure time-to-interactive on a low-end Android device. Target < 500ms.
- **Phase 6 (Themes):** Need to validate `createThemedStyles(theme)` factory approach works with `StyleSheet.create` caching. Need to confirm which components require full `useTheme()` migration vs. which can use cosmetic overlays without touching the `StyleSheet` layer.

Phases with standard patterns (skip research-phase):
- **Phase 0:** Established refactoring — no new patterns
- **Phase 1:** Architecture fully specified; pure function evaluator pattern is standard; Zustand slice pattern established across 7 existing slices
- **Phase 2:** Lottie integration is well-documented; component structure fully specified in ARCHITECTURE.md
- **Phase 4:** Date-seeded PRNG pattern already used by math engine; strategy pattern extraction is standard refactoring
- **Phase 5:** Avatar extension is additive; migration pattern follows established chain

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries already in package.json and verified against Expo SDK 54 compatibility; no new dependencies required; alternatives documented and rejected with rationale |
| Features | HIGH | Competitor analysis is current and documented (Khan Academy, Prodigy, SplashLearn, Duolingo); psychology research on overjustification and punitive mechanics is well-sourced; feature dependencies mapped explicitly |
| Architecture | HIGH | Based on direct codebase analysis of existing slices, services, and patterns; build order derived from actual dependency graph, not assumptions; all integration points identified |
| Pitfalls | HIGH | Primary pitfalls documented with academic sources (Hanus & Fox 2015, Petrovych et al. 2022); technical pitfalls based on known react-native-svg performance benchmarks and confirmed RN/Expo behavior |

**Overall confidence:** HIGH

### Gaps to Address

- **Skill map rendering performance on low-end Android:** Research identifies the risk and recommends a spike, but exact element count + animation configuration that stays under 500ms is not pre-validated. Resolve with a focused performance spike at the start of Phase 3.
- **Theme migration scope:** The research specifies the approach (createThemedStyles factory + useTheme hook) but does not enumerate which of the ~40 existing component files require migration vs. which can remain static. Resolve during Phase 6 planning with a file audit.
- **Badge count and categories:** Research defines the structure (skill mastery, effort, exploration, challenge, remediation) and examples, but the full badge catalog (targeting 30-50 definitions) needs to be authored during Phase 1. Badge design should be reviewed against the overjustification criteria before shipping.
- **Lottie asset sourcing:** Research recommends LottieFiles as the source for badge unlock animations. Specific animation selections and their file size validation need to happen during Phase 2 execution, not planning.

## Sources

### Primary (HIGH confidence)

**Stack:**
- Expo SDK 54 Notifications docs: https://docs.expo.dev/versions/latest/sdk/notifications/ — DailyTriggerInput API verified
- react-native-reanimated docs: https://docs.swmansion.com/react-native-reanimated/docs/core/useAnimatedProps/ — SVG animated props pattern
- react-native-svg GitHub v15.x: https://github.com/software-mansion/react-native-svg — RN 0.81 compatibility confirmed
- Expo color themes guide: https://docs.expo.dev/develop/user-interface/color-themes/ — React Context theming pattern
- Existing codebase: `src/theme/index.ts`, `src/store/constants/avatars.ts`, `src/services/mathEngine/skills.ts`, `src/store/migrations.ts`

**Features:**
- Prodigy FTC Complaint: https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294
- Gamification dark patterns (children): https://www.researchgate.net/publication/378448656_Dark_Patterns_of_Cuteness_Popular_Learning_App_Design_as_a_Risk_to_Children's_Autonomy
- Existing project research: `.planning/07-gamification.md`, `.planning/09-child-ux-design.md`

**Architecture:**
- Codebase analysis: `src/store/`, `src/services/`, `src/screens/`, `src/navigation/`
- SKILLS DAG: `src/services/mathEngine/skills.ts` (14 skills, 2 root nodes, prerequisites array)
- Session orchestrator: `src/services/session/sessionOrchestrator.ts`
- Migration chain: `src/store/migrations.ts` (versions 1-8)

**Pitfalls:**
- Overjustification effect: https://www.psychologyofgames.com/2016/10/the-overjustification-effect-and-game-achievements/
- Daily Quests or Daily Pests (ACM 2022): https://dl.acm.org/doi/10.1145/3549489
- White Flash of Death (React Native themes): https://medium.com/@ripenapps-technologies/the-white-flash-of-death-solving-theme-flickering-in-react-native-production-apps-d732af3b4cae
- react-native-svg performance: https://github.com/software-mansion/react-native-svg/issues/2660
- FTC COPPA 2025 amendments: https://securiti.ai/ftc-coppa-final-rule-amendments/

### Secondary (MEDIUM confidence)

- SplashLearn gamification: https://brighterly.com/blog/splashlearn-reviews/
- Duolingo achievement system: https://duolingoguides.com/all-duolingo-achievements/
- Gamification in children's education meta-analysis: https://slejournal.springeropen.com/articles/10.1186/s40561-019-0085-2
- Zustand migration best practices: https://github.com/pmndrs/zustand/discussions/1717

---
*Research completed: 2026-03-04*
*Ready for roadmap: yes*
