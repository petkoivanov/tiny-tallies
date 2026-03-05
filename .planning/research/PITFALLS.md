# Pitfalls Research

**Domain:** Gamification features (achievements, skill map, daily challenges, avatars, themes) added to an existing children's math learning app
**Researched:** 2026-03-04
**Confidence:** HIGH (codebase analysis + domain research + established psychology literature)

## Critical Pitfalls

### Pitfall 1: Store Migration Cascade Corruption

**What goes wrong:**
Adding 5+ new features (badges, daily challenges, avatars, themes, skill map state) to the Zustand store requires multiple new persisted fields. The store is already at STORE_VERSION=8 with a linear migration chain. If badge definitions, avatar unlockables, theme selections, daily challenge state, and achievement progress are all added in a single version bump (v8 -> v9), any mid-development schema change forces re-doing the migration. Worse: if the migration function has a bug and ships, existing users' persisted data gets silently corrupted or dropped because `migrateStore` returns partial state.

**Why it happens:**
The existing migration chain (`migrations.ts`) handles each version bump sequentially. With gamification, the temptation is to add all new state in one shot to avoid multiple version bumps. But gamification state is inherently iterative -- badge definitions evolve, theme unlocks get rebalanced, avatar systems change. The `partialize` function in `appStore.ts` must also be updated for every new persisted field, and missing a field means it silently disappears on app restart.

**How to avoid:**
- Bump STORE_VERSION once per phase, not once per feature. Each phase adds a bounded set of fields.
- Keep a "migration test" that roundtrips v8 state through all new migrations and asserts every field survives.
- Add new persisted fields to `partialize` in the same commit as the migration -- never separately.
- Use Zod schemas to validate migrated state in development, catching silent drops early.
- Consider which gamification state actually needs persistence: badge unlock timestamps YES, daily challenge rotation state NO (derive from date), theme selection YES, cached badge render state NO.

**Warning signs:**
- `partialize` in `appStore.ts` lists fewer fields than what the slices define as state.
- A store test passes with fresh state but fails when migrating from v8 fixture data.
- Users report losing progress after an app update (badges disappeared, theme reset).

**Phase to address:**
Phase 1 (Achievement/Badge system) -- must establish the migration pattern before subsequent phases add more state.

---

### Pitfall 2: Overjustification Effect -- Badges Crowding Out Learning Motivation

**What goes wrong:**
Adding visible achievement badges for every action (complete a session, get 5 correct, use a manipulative) shifts children's motivation from "I enjoy math" to "I want the next badge." Research consistently shows that when extrinsic rewards are prominent and expected, intrinsic motivation drops. Hanus & Fox (2015) found that gamification with badges decreased intrinsic motivation, classroom satisfaction, AND final exam scores. The overjustification effect is especially pronounced in children ages 6-9 who are still forming their relationship with learning.

**Why it happens:**
Developers design badges to feel rewarding and assume more badges = more engagement. The research doc (`07-gamification.md`) already identifies this risk but the concrete implementation is where it goes wrong: too many badge categories, too-frequent pop-ups, badge counts shown prominently on every screen, or "you haven't earned X yet" messaging that creates a controlling frame instead of an informational one.

**How to avoid:**
- Use INFORMATIONAL framing: "You've been practicing and earned this!" (not "Complete 5 sessions to unlock this badge").
- Cap visible badge pop-ups to 1 per session maximum. Queue others for the results screen.
- Avoid showing unearned badges as locked/grayed-out checklists -- this creates controlling "to-do" pressure.
- Focus badges on EFFORT and PERSISTENCE (already in the research doc), not performance outcomes.
- Never tie badges to speed or accuracy thresholds that would make children rush or feel inadequate.
- Include "surprise" badges that children discover naturally rather than chase intentionally.
- Test with children: if a child asks "how do I get more badges?" instead of "can I do more math?", the system is failing.

**Warning signs:**
- Badge unlock screen gets more animation/polish time than the actual problem-solving experience.
- Badge definitions include "get X correct in a row" or "complete session in under Y minutes" -- these are performance-controlling.
- Children who have earned all easy badges stop using the app (novelty wore off).
- The badge gallery becomes the first screen children navigate to.

**Phase to address:**
Phase 1 (Achievement/Badge system) -- badge definition design is the foundation. Getting the framing wrong here poisons everything built on top.

---

### Pitfall 3: Theme System Breaks Existing Dark-Mode + Accessibility Guarantees

**What goes wrong:**
The existing theme (`src/theme/index.ts`) is a set of `as const` exported objects: `colors`, `spacing`, `typography`, `layout`. Every screen and component imports these directly. A theme system that allows multiple color schemes must either (a) replace these static exports with dynamic values, causing a massive refactor touching every file that uses `colors.background`, or (b) create a parallel dynamic system that coexists awkwardly with the static one. Either way, the existing high-contrast dark theme (designed for accessibility with specific contrast ratios and the Lexend dyslexia-friendly font) can be silently broken by a theme that introduces lighter backgrounds, lower-contrast text, or different font families.

**Why it happens:**
The static `as const` theme pattern was the right choice for a single-theme app -- it's fast (no runtime lookup), type-safe, and zero-overhead. But it is architecturally hostile to multiple themes. Developers will try to "just wrap it in a context provider" without realizing that every `StyleSheet.create` call captures the static values at module load time, not at render time. StyleSheet.create does NOT react to theme changes.

**How to avoid:**
- Do NOT try to make `StyleSheet.create` dynamic. Instead, use a hook-based pattern where components consume theme via `useTheme()` and create styles inline or via a `createThemedStyles(theme)` factory.
- OR keep the existing theme as the base and implement "themes" as cosmetic overlays (session backgrounds, card borders, button accent colors) that do NOT touch the core UI chrome. This is far less disruptive.
- Preserve the Lexend font family across ALL themes -- it is not decorative, it is an accessibility feature.
- Every theme must pass WCAG AA contrast ratio checks (4.5:1 for normal text, 3:1 for large text) against its background.
- The `contentStyle: { backgroundColor: '#1a1a2e' }` hardcoded in `AppNavigator.tsx` must also be made theme-aware, or it causes a flash of wrong color on navigation.
- The "White Flash of Death" (documented in React Native theme implementations) occurs when JS theme state and native UI are out of sync on cold start.

**Warning signs:**
- New theme looks fine in Storybook/isolated component but text becomes unreadable in context.
- Hardcoded color values appear in components that were supposed to be theme-aware (grep for hex codes like `#1a1a2e`).
- SessionScreen's ManipulativePanel drawer or ChatPanel bottom sheet doesn't pick up new theme colors.
- Children with dyslexia report difficulty reading in a new theme (font changed or contrast dropped).

**Phase to address:**
Phase 5 (Themes) -- must be the LAST gamification feature to avoid destabilizing earlier work. Requires an architecture decision early (Phase 1 design) about whether themes are "full UI reskin" or "cosmetic overlays."

---

### Pitfall 4: Skill Map SVG Rendering Tanks Performance on Low-End Devices

**What goes wrong:**
The prerequisite DAG has 14 skills with cross-operation dependencies (subtraction nodes require addition prereqs). Rendering this as an interactive SVG graph with nodes, edges, mastery indicators, pulsing animations, and tap targets creates 50-100+ SVG elements. On low-end Android devices, react-native-svg rendering 100+ elements causes multi-second render times (benchmarked at 9-10 seconds for 500 elements). Even with 14 nodes, each node with a circle, text label, mastery ring, glow animation, and connecting edges, the SVG element count balloons. Pinch-to-zoom, pan, and tap interactions on SVG elements compound the issue.

**Why it happens:**
The skill tree "looks simple" -- 14 nodes, some edges. But each node is a complex visual element (mastery ring with gradient, label, icon, pulsing animation for active skills, grayed overlay for locked). On react-native-svg, each SVG element creates its own native view, and clipping operations (for mastery progress rings) are particularly slow. The DAG also has a non-trivial layout: it is not a simple tree but a directed acyclic graph with cross-links (subtraction skills depend on both subtraction and addition prereqs).

**How to avoid:**
- Use react-native-skia (already compatible with Expo SDK 54) for the skill map rendering instead of react-native-svg. Skia renders on the GPU and handles complex drawings at 60fps.
- Alternatively, render the skill map as a static pre-computed layout with React Native Views (not SVG at all) -- position nodes absolutely using a computed layout. This avoids SVG overhead entirely.
- Pre-compute the DAG layout once (topological sort + layer assignment) and cache it. Do not re-layout on every render.
- Limit animations to the "active" and "next unlockable" nodes (2-3 at most), not all 14.
- Use `React.memo` aggressively on skill nodes -- mastery data changes rarely (only after session commit).
- Consider a "flat" skill map (scrollable list grouped by grade/operation) as a simpler alternative to a graph view, with the graph as an optional "advanced" view.

**Warning signs:**
- Skill map screen takes >500ms to appear (measure with `performance.now()` or React profiler).
- Jank when scrolling/panning the skill map (dropped frames visible on low-end devices).
- The skill map component file exceeds 500 lines because layout logic, rendering, and interaction are tangled.
- Users never visit the skill map screen (too slow to load or too complex to understand).

**Phase to address:**
Phase 2 (Skill Map) -- requires a technology spike to validate rendering approach before building the full feature.

---

### Pitfall 5: Daily Challenge System Creates Hidden Punitive Mechanics

**What goes wrong:**
Daily challenges ("Complete 3 addition problems with 100% accuracy" or "Finish today's challenge to keep your streak") are described as optional bonus content but functionally become mandatory because they are the primary source of bonus XP and special badges. Missing a day feels like losing progress, which violates the core design principle of "no punitive mechanics." The existing weekly streak system was specifically chosen over daily streaks to avoid this exact problem. Daily challenges reintroduce the same anxiety through the back door.

**Why it happens:**
Designers intend daily challenges as "fun extras" but the implementation naturally creates daily engagement obligations. If daily challenges offer exclusive badges or significant XP bonuses, children feel compelled to complete them every day. Research from ACM (Petrovych et al., 2022, "Daily Quests or Daily Pests?") documents that engagement rewards can harm player experience when they feel obligatory rather than optional.

**How to avoid:**
- Make daily challenges TRULY optional: no exclusive badges, no XP multipliers, no streak mechanics tied to daily completion.
- Use "rotating challenges" with multi-day windows (e.g., 3-day availability) instead of strict daily deadlines.
- Cap bonus XP from challenges to be small relative to standard session XP (at most 10-20% bonus, not 50%+).
- Never show "you missed today's challenge" messaging. Only positive: "Today's challenge is ready!"
- Track challenge completion rate -- if >80% of children complete daily challenges, they may feel obligatory. Aim for 40-60% completion as a sign they are truly optional.
- Do not stack daily challenges -- if a child misses Monday's, it is gone; Tuesday's is a fresh start with no sense of accumulation.

**Warning signs:**
- Children have anxiety about opening the app because they "need to do their daily challenge."
- Parents report children insisting on completing challenges even when they want to stop.
- Challenge-related badges become the most-pursued badges (engagement is badge-driven, not math-driven).
- The word "daily" appears prominently in the UI (creates urgency).

**Phase to address:**
Phase 3 (Daily Challenges) -- must integrate with the existing session orchestrator without creating a second parallel session flow.

---

### Pitfall 6: HomeScreen and SessionScreen Exceed 500-Line Limit

**What goes wrong:**
HomeScreen is 317 lines and SessionScreen is 552 lines (already over the 500-line limit). Adding gamification features (badge showcase, daily challenge entry point, skill map navigation, avatar display, theme indicators) to HomeScreen will push it well past 500 lines. SessionScreen needs challenge-mode integration and theme-aware rendering. ResultsScreen (418 lines) needs badge unlock announcements, challenge completion, and XP bonus displays. All three screens bloat past the file size guardrail.

**Why it happens:**
Each gamification feature seems small in isolation ("just add a badge row to HomeScreen"). But 5 features x 30-50 lines each = 150-250 additional lines per screen. Without proactive extraction, the screens become monolithic files that are hard to test, review, and maintain.

**How to avoid:**
- Extract each gamification feature into its own component BEFORE integrating into screens:
  - `<BadgeShowcase />` (home screen badge display)
  - `<DailyChallengeCard />` (home screen challenge entry)
  - `<SkillMapButton />` (navigation to skill map)
  - `<AvatarDisplay />` (avatar with frame/accessories)
  - `<BadgeUnlockOverlay />` (results screen badge announcement)
- Use a `src/components/gamification/` directory with barrel exports.
- SessionScreen already needs refactoring (552 lines) -- this should happen BEFORE gamification work begins.
- Each new screen (SkillMapScreen, BadgeGalleryScreen, AvatarScreen, ThemePickerScreen) must stay under 500 lines from the start.

**Warning signs:**
- Any file exceeds 400 lines during development (act at 400, not 500).
- A component accepts >5 props (sign it is doing too much).
- StyleSheet definition in a file exceeds 100 lines (extract styles into a co-located styles file or shared components).

**Phase to address:**
Phase 1 (pre-work) -- refactor SessionScreen below 500 lines BEFORE starting gamification features.

---

### Pitfall 7: Daily Challenge Session Conflicts with Session Orchestrator

**What goes wrong:**
Daily challenges need their own session flow (themed problem set, specific skill focus, bonus XP calculation) but the app has a single session orchestrator (`sessionOrchestrator.ts`) that generates the 15-problem queue with warmup/practice/cooldown phases. The existing code already supports two session modes (`standard` and `remediation` via `SessionMode` type and `REMEDIATION_SESSION_CONFIG`). Adding a third "challenge" mode seems straightforward but creates conflicts: challenges need different problem selection logic (specific skill, specific difficulty), different XP calculation (bonus multiplier), and different completion criteria (accuracy threshold, not just finishing).

**Why it happens:**
The session orchestrator is tightly coupled to the practice mix algorithm (`practiceMix.ts`), which uses Leitner review scheduling and BKT-weighted skill selection. Daily challenges need deterministic, themed content (e.g., "all addition problems at grade 2 level") which bypasses the adaptive algorithm entirely. Bolting challenge logic onto the existing orchestrator creates a god-function; creating a separate orchestrator means duplicating shared logic (Elo updates, BKT transitions, XP calculation, misconception tracking).

**How to avoid:**
- Extract the session lifecycle (start -> answer -> next -> commit) from the problem-selection strategy. Use a strategy pattern: `StandardStrategy`, `RemediationStrategy`, `ChallengeStrategy`.
- Share `commitSessionResults` across all strategies -- Elo, BKT, XP, and streak logic are universal.
- Challenge problems should still flow through the math engine (same `generateProblem` + `formatAsMultipleChoice`) -- only the skill/template selection differs.
- Route param for session mode already exists (`mode: 'remediation'`); extend to `mode: 'challenge'` with a `challengeId` param.
- Keep challenge session configs small (5-8 problems, no warmup/cooldown) to differentiate from standard sessions.

**Warning signs:**
- `sessionOrchestrator.ts` grows past 350 lines with challenge-specific branches.
- `if (mode === 'challenge')` checks scattered across multiple files.
- Challenge XP is calculated differently from standard XP, creating inconsistencies in total XP display.
- Misconception tracking skips challenge sessions (not intentional, just not wired up).

**Phase to address:**
Phase 3 (Daily Challenges) -- but the strategy extraction should be planned in Phase 1 architecture.

---

### Pitfall 8: Avatar/Theme Unlockables Without an Economy Create Dead-End Progression

**What goes wrong:**
The milestone context says "NO coins/economy, NO collectibles" but the app needs unlockable avatars and themes. Without a currency, unlockables must be tied directly to achievements. This creates a rigid system where unlocks are one-time events with no ongoing engagement -- once a player has earned all achievement-linked unlocks, there is nothing left to pursue. The research doc (`07-gamification.md`) includes a coins/shop system, but the v0.7 scope explicitly excludes it. The result is an unlock system that is engaging for the first few weeks then goes silent.

**Why it happens:**
Achievement-gated unlocks feel clean in design ("earn Addition Ace badge to unlock Robot avatar") but create a ceiling. With 14 skills and a handful of badge categories, there are maybe 20-30 possible achievement-linked unlocks. A child who practices daily will exhaust these within 2-3 months. After that, the avatar/theme system has no remaining engagement value.

**How to avoid:**
- Design the unlock system to be EXTENSIBLE for a future economy (v0.8+) without requiring schema changes. Use a generic `UnlockCondition` type that supports `{ type: 'achievement', achievementId: string }` now and can later support `{ type: 'purchase', cost: number }` or `{ type: 'level', level: number }`.
- Include level-gated unlocks (every 5 levels unlocks a new avatar/theme) which provides ongoing progression.
- Include time-based unlocks ("Use the app for 30 days" -- not 30 consecutive days) for long-term engagement.
- Make the initial set of free presets generous (6-8 avatars, 3 themes) so unlockables feel like bonuses, not necessities.
- Plan for content drops -- new avatars/themes added in app updates keep the system fresh.

**Warning signs:**
- All unlockable items are tied to specific achievements (no level-based or time-based unlocks).
- A dedicated child runs out of things to unlock within 6 weeks.
- The `UnlockCondition` type is hardcoded to `achievementId: string` with no union/extensibility.

**Phase to address:**
Phase 4 (Avatars) and Phase 5 (Themes) -- but the extensible unlock condition type should be designed in Phase 1.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding badge definitions in a TypeScript const array | Fast to implement, type-safe | Cannot add new badges without app update; no A/B testing | MVP only -- migrate to config-driven system in v0.8 |
| Using emoji for badge icons instead of custom art | No asset pipeline needed | Emoji render differently across Android/iOS; cannot animate | Acceptable for v0.7 if badges use Lottie animations for unlock events |
| Single theme file with all color values | Simple to read and maintain | Every new theme duplicates the full color set; easy to miss a value | Never -- use a base + override pattern from the start |
| Computing daily challenge seed from `Date.now()` | Deterministic per-day | Timezone issues (UTC vs local), challenge changes mid-day for traveling users | Acceptable if seed uses UTC date string, not timestamp |
| Storing full badge history in Zustand persist | Simple implementation | Store size grows unbounded as achievements accumulate | Acceptable -- badge records are tiny (id + timestamp), will not be a problem for years |
| Inlining skill map layout coordinates | No layout algorithm needed | Must manually update when skills are added in future milestones | Never -- compute layout from DAG structure programmatically |

## Integration Gotchas

Common mistakes when connecting gamification to the existing systems.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Badges + Session Commit | Checking badge conditions DURING the session (before Elo/BKT updates are committed) -- stale data | Check badge conditions AFTER `commitSessionResults` returns, using the updated store state |
| Daily Challenges + Misconception Tracking | Excluding challenge sessions from misconception recording because they are "special" | Challenge sessions MUST flow through the same misconception detection pipeline -- a wrong answer in a challenge is still a misconception signal |
| Theme Colors + ManipulativePanel | Manipulative colors (base-ten block units, rods) use hardcoded colors for pedagogical reasons (blue units, green rods) | Manipulative colors should be EXEMPT from theming -- they are teaching tools, not decorative elements |
| Avatar + childProfileSlice | Expanding `avatarId: AvatarId` to include unlockable avatars without updating the `AvatarId` type | Use a separate `equippedAvatarId: string` field that accepts both preset and unlockable IDs; keep `AvatarId` for presets |
| Skill Map + prerequisiteGating | Duplicating the prerequisite DAG structure for visual rendering instead of using the canonical `SKILLS` array | Always derive skill map edges from `SKILLS[].prerequisites` -- single source of truth |
| Badge Unlock + Results Screen | Showing badge unlocks BEFORE the results summary, hijacking the flow | Badge unlocks should appear AFTER the session summary (XP, streaks, score) -- the learning feedback is primary |
| Themes + AppNavigator | Forgetting to update `contentStyle: { backgroundColor: '#1a1a2e' }` in `AppNavigator.tsx` | Navigator background must be theme-aware, or screen transitions show the old background color |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering entire skill map on any store change | Skill map jitters or lags on answer submission during a session | Use `useAppStore` with a shallow selector that picks only `skillStates` -- not the full store | Immediately on lower-end devices |
| Computing "all unlocked badges" on every render | HomeScreen becomes sluggish as badge definitions grow | Memoize badge computation with `useMemo`, keyed on the specific state fields badges depend on | At 20+ badge definitions |
| SVG node animations running when skill map is not visible | Battery drain, background CPU usage | Stop animations when screen loses focus (React Navigation `useIsFocused` or `useFocusEffect`) | Any device, accumulates over time |
| Full badge gallery in a ScrollView instead of FlashList | Gallery stutters with 30+ badges rendering at once | Use FlashList v1.x with `estimatedItemSize` for badge grid -- view recycling handles large lists | At 30+ badge items |
| Storing theme colors as JS objects instead of using StyleSheet | Each render creates new style objects, triggering unnecessary native bridge calls | Use `StyleSheet.create` with theme-specific cached stylesheets, rebuilt only on theme change | Immediately, but worse on complex screens |
| Daily challenge seed computation on every component mount | Unnecessary re-computation; potential timezone inconsistency if computed differently in different components | Compute challenge seed once per app launch, store in a non-persisted Zustand field | When multiple components need the seed |

## Security Mistakes

Domain-specific security issues for a children's education app.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Allowing avatar names or custom text in themes | Children enter personal information (name, school, address) via "custom avatar name" | NO free-text input anywhere in gamification. All avatars and themes are preset selections only. COPPA requirement. |
| Exposing achievement data in analytics events | Badge names like "Addition Ace at Lincoln Elementary" leak location data | Achievement events must contain only badge ID and timestamp -- never child name, location, or school |
| Storing achievement timestamps with timezone info | Timezone reveals approximate geographic location -- personal info under COPPA 2025 amendments | Use UTC-only ISO strings for all timestamps. Never persist local timezone offsets. |
| Daily challenge seeded from user-identifiable data | If challenge seed incorporates device ID or user ID, challenges become fingerprinting vectors | Seed from UTC date string only: `"2026-03-04"`. All users get the same challenge (no personalization that could identify) |
| Theme/avatar unlock state sent to any external service | Unlock progression could be correlated with usage patterns to profile children | Gamification state stays entirely on-device. Never sent to Gemini, analytics, or any external API. |

## UX Pitfalls

Common user experience mistakes in gamification for children ages 6-9.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Too many gamification screens (badges, map, avatars, themes, challenges) cluttering navigation | Children get lost, can't find the "practice" button | Keep ONE primary action (Start Practice) prominent. Gamification screens are secondary -- accessed from a profile/settings area, not top-level tabs |
| Badge unlock pop-ups interrupting problem-solving flow | Breaks concentration during a session, especially for children with ADHD | Queue all badge unlocks for the results screen. NEVER interrupt a session with a badge notification |
| Skill map showing all 14 skills at once with technical labels | Overwhelming for 6-year-olds; "addition.two-digit.with-carry" means nothing to a child | Use friendly names ("Big Number Adding") and progressive disclosure (show current grade's skills, expand others on demand) |
| Showing "locked" items prominently (grayed-out badges, locked avatars) | Creates frustration and "I can't do that" feelings in young children | Show earned items proudly. Hide or minimize locked items. Use "Coming soon!" framing, not lock icons |
| Daily challenge timer/countdown visible on screen | Creates time pressure anxiety; contradicts "no punitive mechanics" principle | Show "Today's Challenge" without any timer. It is available all day. No urgency framing |
| Theme changes applying to session screens | Changes the visual context children have learned to associate with math practice -- disorienting | Themes should primarily affect home/profile/results screens. Session screen maintains consistent visual language for learning stability |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Badge System:** Often missing persistence migration -- verify badges survive app restart by testing with `STORE_VERSION` upgrade from v8 fixture
- [ ] **Badge System:** Often missing "earn exactly once" guard -- verify the same badge cannot be awarded twice (deduplicate by badge ID in the awards array)
- [ ] **Skill Map:** Often missing edge rendering for cross-operation dependencies -- verify subtraction nodes show edges to their addition prerequisites (not just same-operation chains)
- [ ] **Skill Map:** Often missing accessibility -- verify all nodes have `accessibilityLabel` with skill name and mastery status for screen readers
- [ ] **Daily Challenges:** Often missing timezone handling -- verify challenge rotation uses UTC, not device local time, by testing with a device set to UTC+12 and UTC-12
- [ ] **Daily Challenges:** Often missing offline behavior -- verify challenges work without network (no Gemini dependency) since core practice works offline
- [ ] **Avatar System:** Often missing the migration from old `avatarId: AvatarId` to new expanded avatar type -- verify existing users keep their selected avatar after update
- [ ] **Theme System:** Often missing navigator `contentStyle` update -- verify no "flash of old background" during screen transitions
- [ ] **Theme System:** Often missing manipulative color exemption -- verify base-ten blocks, fraction strips, etc. retain pedagogical colors regardless of theme
- [ ] **All Features:** Often missing 500-line check -- verify every new and modified file stays under 500 lines after integration
- [ ] **All Features:** Often missing `partialize` update -- verify every new persisted field is listed in `appStore.ts` `partialize` function
- [ ] **All Features:** Often missing FlashList v1 compatibility -- verify any list-based screen (badge gallery, avatar picker) uses FlashList v1.x, NOT FlatList and NOT FlashList v2.x

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Store migration corrupts existing user data | HIGH | Cannot easily recover lost data. Must add a "reset gamification" option that wipes only gamification state. Add store migration tests ASAP to prevent recurrence. |
| Overjustification effect (children only care about badges) | MEDIUM | Reduce badge visibility: move gallery deeper in navigation, reduce unlock animation duration, stop showing badge count on home screen. Re-emphasize learning feedback. |
| Theme breaks accessibility | LOW | Revert to default dark theme as fallback. Add contrast-ratio validation to theme definitions (automated test). |
| Skill map performance too slow | MEDIUM | Replace SVG rendering with Skia or static View-based layout. If urgent, ship a "list view" fallback and defer graph view. |
| Daily challenges feel punitive | LOW | Remove daily terminology. Rename to "Bonus Practice" with no time limit. Remove any streak/completion tracking on challenges. |
| HomeScreen exceeds 500 lines | LOW | Extract gamification components into `src/components/gamification/` with barrel exports. Pure refactor, no behavior change. |
| Session orchestrator becomes a god function | MEDIUM | Extract strategy pattern (Standard/Remediation/Challenge). Each strategy in its own file <300 lines. Shared lifecycle logic in base module. |
| Avatar type migration breaks existing selection | LOW | Add migration that maps old `AvatarId` values to new schema. Include fallback: if avatar ID is not found in new system, default to the user's original preset. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Store migration cascade | Phase 1 (Badges) | Roundtrip migration test: v8 fixture -> v9 -> verify all fields intact |
| Overjustification effect | Phase 1 (Badges) | Badge definitions reviewed for informational (not controlling) framing; no speed/accuracy badges |
| Theme breaks accessibility | Phase 5 (Themes) | Automated contrast-ratio test for every theme definition; Lexend font preserved |
| Skill map performance | Phase 2 (Skill Map) | Technology spike: render 14-node DAG, measure time-to-interactive on low-end Android (<500ms target) |
| Daily challenges feel punitive | Phase 3 (Daily Challenges) | No "missed" messaging in UI; challenge XP bonus capped at 20% of standard session XP |
| HomeScreen bloat | Phase 1 pre-work | SessionScreen refactored below 500 lines before gamification begins; all new features as extracted components |
| Session orchestrator conflicts | Phase 3 (Daily Challenges) | Strategy pattern extracted; each strategy in own file; shared `commitSessionResults` tested across all modes |
| Dead-end avatar progression | Phase 4 (Avatars) | `UnlockCondition` union type supports `achievement`, `level`, and `time` variants; extensible for future `purchase` |
| COPPA violations | All phases | No free-text input anywhere; all timestamps UTC; gamification state never sent externally; audit in each phase |
| FlashList version conflict | Phase 1 (Badge gallery), Phase 4 (Avatar picker) | `package.json` pins `@shopify/flash-list` to `^1.x.x`; CI test fails if v2 installed |
| Navigator background flash | Phase 5 (Themes) | Manual test: switch theme, navigate between screens, verify no white/wrong-color flash |
| Badge awarded twice | Phase 1 (Badges) | Unit test: call badge-check twice with same conditions, verify single entry in awards array |

## Sources

- [The Overjustification Effect and Game Achievements](https://www.psychologyofgames.com/2016/10/the-overjustification-effect-and-game-achievements/) -- Game Developer / Psychology of Games
- [Daily Quests or Daily Pests? Benefits and Pitfalls of Engagement Rewards](https://dl.acm.org/doi/10.1145/3549489) -- ACM SIGCHI 2022
- [The White Flash of Death: Solving Theme Flickering in React Native](https://medium.com/@ripenapps-technologies/the-white-flash-of-death-solving-theme-flickering-in-react-native-production-apps-d732af3b4cae) -- Medium
- [react-native-svg Performance Issues with Multiple SVG Elements](https://github.com/software-mansion/react-native-svg/issues/2660) -- GitHub Issue
- [react-native-svg Rendering Many SVGs Lags Performance](https://github.com/software-mansion/react-native-svg/issues/2739) -- GitHub Issue
- [FlashList v1 Documentation](https://shopify.github.io/flash-list/) -- Shopify
- [FTC 2025 COPPA Rule Amendments](https://securiti.ai/ftc-coppa-final-rule-amendments/) -- Securiti.ai
- [COPPA Compliance 2025 Practical Guide](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/) -- Promise Legal
- [Zustand Persisted Store Re-hydration Merging Issue](https://dev.to/atsyot/solving-zustand-persisted-store-re-hydtration-merging-state-issue-1abk) -- DEV Community
- [Zustand Migration Best Practices](https://github.com/pmndrs/zustand/discussions/1717) -- GitHub Discussion
- [Gamification in Children's Education](https://slejournal.springeropen.com/articles/10.1186/s40561-019-0085-2) -- Smart Learning Environments
- [Gamification Enhances Intrinsic Motivation Meta-Analysis](https://link.springer.com/article/10.1007/s11423-023-10337-7) -- Springer
- [Revealing Weaknesses of Gamification in Education](https://www.temjournal.com/content/143/TEMJournalAugust2025_2462_2471.pdf) -- TEM Journal 2025
- Codebase analysis: `appStore.ts`, `migrations.ts`, `gamificationSlice.ts`, `sessionOrchestrator.ts`, `prerequisiteGating.ts`, `skills.ts`, `theme/index.ts`, `AppNavigator.tsx`, `HomeScreen.tsx` (all at C:/projects/tiny-tallies/src/)

---
*Pitfalls research for: Gamification features in Tiny Tallies (children's math learning app, ages 6-9)*
*Researched: 2026-03-04*
