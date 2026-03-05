# Feature Research

**Domain:** Gamification for children's math learning app (ages 6-9)
**Researched:** 2026-03-04
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features parents and children expect from any modern gamified educational app. Missing these makes the product feel bare compared to Khan Academy Kids, SplashLearn, or Prodigy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Achievement badges for mastery milestones | Every major competitor (Khan Academy, Duolingo, SplashLearn) has badges for skill completion. Children expect visible proof of what they have learned. | MEDIUM | Already designed in `07-gamification.md` research. Need badge definition registry, unlock evaluation engine, persisted badge state in store, and badge award animation. Depends on existing BKT mastery data in `skillStatesSlice`. |
| Achievement badges for effort/behavior | Duolingo has 10+ behavior-based badges (streak, XP totals, lessons completed). Rewarding persistence over ability aligns with growth mindset research (Dweck, 2006). | MEDIUM | Categories: streak milestones, session count, problem count, remediation victories. Must be non-comparative (no leaderboard badges). Evaluation runs post-session. |
| Progress visualization (skill map) | Khan Academy, SplashLearn, and Prodigy all show visual progress. Children need concrete representation of abstract progress (Piaget concrete operational stage). Parents expect to see "what my child has learned." | HIGH | The prerequisite DAG already exists in `skills.ts` (14 skills, 2 root nodes, chain structure). Visualization must show: locked/unlocked/in-progress/mastered states. This is the most complex UI feature in v0.7 -- requires custom graph layout, node rendering, edge drawing, and scroll/zoom behavior. |
| Avatar selection from presets | Khan Academy, Prodigy, and SplashLearn all let children pick an avatar. Current app already has 8 emoji avatars in `avatars.ts`. Bare minimum is already met. | LOW | Already implemented at a basic level (8 emoji animals). Expanding to 12-15 is trivial -- just add entries to the `AVATARS` constant. |
| Session-end summary with rewards | SplashLearn and Khan Academy Kids both show post-session reward summaries. Current Results screen shows score/XP/streak but not badge unlocks or challenge progress. | LOW | Extend existing `Results` screen route params to include `badgesUnlocked` and `challengeProgress`. Render badge unlock animations on the Results screen. |

### Differentiators (Competitive Advantage)

Features that set Tiny Tallies apart. Not required, but create meaningful engagement advantages over competitors.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Visual skill map with prerequisite DAG | Most competitors show flat progress bars or lists. Rendering the actual prerequisite graph as an interactive tree/map lets children SEE how skills connect -- addition leads to subtraction, single-digit leads to multi-digit. This makes the learning journey tangible and explorable, not just a percentage. | HIGH | No off-the-shelf React Native skill-tree component exists. Must be custom-built. The existing `SKILLS` array with `prerequisites` fields provides the data. Layout algorithm: topological sort into grade-based rows, draw edges with react-native-svg or Reanimated paths. Node states driven by `skillStatesSlice` BKT data (locked=gray, unlocked=pulsing, in-progress=partial fill, mastered=glowing). |
| Daily challenges with rotating themes | SplashLearn has daily goals; Duolingo has daily quests. But themed daily challenges (e.g., "Addition Adventure Monday," "Speed Round Wednesday") with bonus XP create a reason to return beyond normal practice. Rotating content prevents habituation. | MEDIUM | Need: daily challenge definition system (theme + skill filter + goal type), server-free date-seeded rotation (Mulberry32 PRNG already exists), challenge progress tracking per day, bonus XP award, special daily-challenge badges. No backend required -- seed from date. |
| Unlockable avatars/frames via achievements | Prodigy locks cosmetics behind paywall (criticized by FTC complaint). Tiny Tallies can differentiate by making ALL cosmetics achievement-unlockable with zero paywall. This is ethically superior and still drives engagement. | MEDIUM | Badge definitions include `reward` field pointing to avatar/frame unlock. Need: `unlockedAvatars` and `equippedFrame` in store. Frame = border decoration around avatar circle on home screen. ~5-7 special avatars + ~5-7 frames earned through achievement milestones. |
| Theme/skin unlocking via achievements | SplashLearn and Prodigy gate cosmetics behind payment. Unlocking UI color schemes and session "wrappers" (themed problem contexts like space, underwater, jungle) through achievements gives children ownership over their experience. | MEDIUM | UI themes: 3-5 color palette variants applied via theme context. Session wrappers: cosmetic context text/imagery around math problems (purely visual, does not affect math engine). Both stored as unlocked/equipped in gamification store. |
| Remediation achievement badges | No major competitor specifically rewards overcoming misconceptions. Celebrating "You fixed your carry mistake!" turns a struggle into a triumph -- directly supporting growth mindset. | LOW | Leverages existing `misconceptionSlice` resolved status. Badge triggers when misconception status transitions to `resolved`. Minimal new logic needed. |
| Non-punitive daily challenge design | Duolingo's daily streak has been widely criticized for causing anxiety in children (documented in parent complaints). Daily challenges in Tiny Tallies should offer BONUS rewards for completion, never penalties for skipping. Challenge resets daily with no "missed challenge" messaging. | LOW | Design constraint, not implementation complexity. Ensure challenge UI shows "Bonus challenge available!" not "You missed yesterday's challenge!" No challenge streak -- use the existing weekly streak only. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems, especially for children ages 6-9.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Coins/virtual currency with shop | Prodigy, SplashLearn use coins to "buy" cosmetics. Creates sense of economy and choice. | Creates loss aversion ("I can't afford that"), introduces opportunity cost anxiety, and is a gateway to IAP dark patterns. Prodigy was subject to an FTC complaint for manipulative coin/membership tactics. Children 6-7 do not understand economic tradeoffs well enough for this to be fair. The milestone context explicitly says NO coins/economy. | Unlock cosmetics directly via achievement badges. No intermediate currency. Earning a badge = cosmetic unlocks immediately. Zero economic anxiety. |
| Collectible items/stickers | Gacha/collection mechanics drive engagement in adult apps and older-child games. | Collection completion pressure ("I need them all") creates compulsive behavior. Research on dark patterns in educational apps (2024 arxiv study) identifies forced collection as a manipulation tactic targeting children. Random/gacha distribution is especially harmful. The milestone context explicitly says NO collectibles. | Deterministic badge unlocks. Children know exactly what they need to do to earn each reward. No randomness, no FOMO. |
| Timed daily challenges with countdown | Creates urgency, drives daily engagement. Duolingo uses time-limited events effectively for adults. | Countdown timers cause anxiety in children ages 6-9 (documented in child UX research). Time pressure undermines learning by prioritizing speed over understanding. | Daily challenges reset at midnight with no countdown. Available all day. Missed days have zero consequence. |
| Competitive leaderboards | Khan Academy had energy-point leaderboards. Drives engagement for top performers. | Discourages bottom-half children. Social comparison harms self-esteem in ages 6-9. Existing research in `07-gamification.md` explicitly calls this out as an anti-pattern. COPPA implications for showing other users' data. | Self-comparison only: "Your best session this week" vs "Last week's best." Personal records, never rankings. |
| Daily login streak (separate from weekly) | Duolingo's most famous mechanic. Drives DAU metrics. | Widely documented to cause anxiety, guilt, and "meltdowns" in children when broken. Parents report negative emotional reactions. The app already uses weekly streaks specifically to avoid this. Adding a daily streak contradicts the design philosophy. | Weekly streak (already implemented) is the engagement mechanic. Daily challenges provide a daily touchpoint without streak pressure. |
| Pay-to-unlock cosmetics/themes (IAP) | Revenue model for Prodigy ($60/year membership). Funds development. | Prodigy received FTC complaint for "rubbing non-membership status in kids' faces." Creates inequality in classrooms. Children feel inferior when they cannot access content peers have. Explicitly against project values. | All cosmetics earned through gameplay. Revenue model is separate concern (v0.8 subscription for parent features, not child cosmetics). |
| Speed/accuracy leaderboards for challenges | Creates competitive engagement around daily challenges. | Same problems as general leaderboards, amplified by the daily cadence. Children who are slower processors feel excluded. Speed emphasis undermines the "understanding over speed" philosophy. | Personal bests only. "You answered 12 correct today -- that's 2 more than your average!" |
| Complex avatar builder (face/hair/clothes/accessories) | Prodigy has a full character creator. Children enjoy detailed customization. | High implementation cost (asset pipeline, rendering layers, combinations). Ages 6-7 have difficulty with multi-step customization. Bloats app size with assets. For emoji-based avatars, this is architectural overreach. | Preset avatars (12-15 options) plus frame decorations (5-7 options). Two simple choices, not a full builder. Each avatar is a complete design, not assembled from parts. |

## Feature Dependencies

```
Achievement Badge System (registry + evaluation + store)
    |
    |----> Badge Award Animation (Results screen + toast)
    |           |
    |           +----> Unlockable Avatars (badge reward = avatar unlock)
    |           |
    |           +----> Unlockable Frames (badge reward = frame unlock)
    |           |
    |           +----> Unlockable Themes (badge reward = theme unlock)
    |
    +----> Daily Challenges (challenge badges depend on badge system)
    |           |
    |           +----> Challenge-specific badges
    |
    +----> Visual Skill Map (mastery badges shown on map nodes)

Existing BKT Mastery (skillStatesSlice)
    |
    +----> Achievement Badge Evaluation (mastery-based badges need BKT data)
    |
    +----> Visual Skill Map Node States (locked/unlocked/mastered from BKT)

Existing Prerequisite DAG (skills.ts)
    |
    +----> Visual Skill Map Layout (edges from prerequisites array)

Existing Misconception Tracking (misconceptionSlice)
    |
    +----> Remediation Badges (resolved misconception triggers badge)

Existing XP/Level System (gamificationSlice)
    |
    +----> Daily Challenge Bonus XP (challenge awards bonus XP)

Avatar Selection (childProfileSlice.avatarId)
    |
    +----> Unlockable Avatars (extends avatar pool)
    |
    +----> Unlockable Frames (decorates avatar display)

Theme System (new slice)
    |
    +----> UI Color Themes (app-wide color palette swap)
    |
    +----> Session Cosmetic Wrappers (problem context theming)
```

### Dependency Notes

- **Achievement Badge System is the foundation.** Everything else -- daily challenges, unlockable avatars, themes -- depends on the badge system existing first. It must be built in the first phase.
- **Visual Skill Map has no upstream dependencies on other v0.7 features.** It reads existing `skillStatesSlice` and `skills.ts` data. It can be built in parallel with the badge system.
- **Daily Challenges depend on the badge system** because challenge completion triggers badge awards and bonus XP.
- **Unlockable Avatars/Frames/Themes depend on badges** because badges are the unlock mechanism (no coins, no shop).
- **Theme system is purely cosmetic** and has no dependency on the skill map or daily challenges. It depends only on badges for unlocking.
- **Store migration required:** New persisted state (badges, unlockedAvatars, equippedFrame, unlockedThemes, equippedTheme, dailyChallengeProgress) needs STORE_VERSION bump(s). Plan migration(s) carefully -- one version bump per phase is cleanest.

## MVP Definition

### Build First (Foundation Phase)

Core infrastructure that everything else depends on.

- [ ] **Achievement badge registry and definitions** -- Static badge catalog with IDs, categories, unlock conditions, reward associations. This is the "schema" for all gamification.
- [ ] **Badge evaluation engine** -- Service that checks badge unlock conditions against current state (BKT mastery, XP, streak, session count, misconception status). Runs post-session.
- [ ] **Badge state persistence** -- New fields in gamification store slice: `earnedBadges`, `badgeProgress`. Store migration v8 to v9.
- [ ] **Badge award animation + Results screen integration** -- Show newly earned badges on Results screen with unlock animation. Toast for mid-session badge unlocks.
- [ ] **Visual skill map (basic)** -- Render prerequisite DAG as a scrollable tree. Nodes show locked/unlocked/mastered states from BKT. Tap node for detail overlay. This is the highest-complexity feature but can be built in parallel.

### Build Second (Engagement Phase)

Features that leverage the badge system for daily engagement and personalization.

- [ ] **Daily challenge system** -- Date-seeded challenge rotation, challenge definitions (theme + skill filter + goal), progress tracking, bonus XP, challenge-specific badges.
- [ ] **Unlockable avatars and frames** -- Extend avatar pool with achievement-gated special avatars. Add frame decoration system. Avatar picker shows locked items with badge requirement.
- [ ] **Avatar/frame display on home screen** -- Update HomeScreen profile section to render equipped frame around avatar.

### Build Third (Polish Phase)

Cosmetic features that add depth but are not structurally required.

- [ ] **UI color themes** -- 3-5 color palette variants (default dark, ocean blue, forest green, sunset warm, space purple). Applied via React context/provider. Unlocked via achievement badges.
- [ ] **Session cosmetic wrappers** -- Themed context text/imagery around math problems (space theme, underwater theme, jungle theme). Purely visual wrapper, does not affect math engine. Unlocked via badges.
- [ ] **Theme picker screen** -- Screen to preview and equip unlocked themes. Shows locked themes with badge requirement.

### Future Consideration (v0.8+)

- [ ] **Social badges** -- "Help a friend" badges. Requires family groups (v0.8 scope).
- [ ] **Animated mascot integration** -- Character mascot that reacts to badges. Higher asset and implementation cost. Defer to post-gamification polish.
- [ ] **Badge showcase/profile** -- Dedicated screen showing all earned badges as a trophy wall. Nice to have but not essential for v0.7.
- [ ] **Sound effects for badge unlocks** -- Audio feedback (expo-av). Desirable but can be added as incremental polish.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| Badge registry + evaluation engine | HIGH | MEDIUM | P1 | Foundation |
| Badge persistence (store slice) | HIGH | LOW | P1 | Foundation |
| Badge award animation | HIGH | MEDIUM | P1 | Foundation |
| Visual skill map | HIGH | HIGH | P1 | Foundation |
| Daily challenges | HIGH | MEDIUM | P2 | Engagement |
| Unlockable avatars/frames | MEDIUM | MEDIUM | P2 | Engagement |
| Avatar/frame home screen display | MEDIUM | LOW | P2 | Engagement |
| UI color themes | MEDIUM | MEDIUM | P3 | Polish |
| Session cosmetic wrappers | LOW | MEDIUM | P3 | Polish |
| Theme picker screen | LOW | LOW | P3 | Polish |
| Remediation badges | MEDIUM | LOW | P1 | Foundation (part of badge registry) |

**Priority key:**
- P1: Must have -- defines the gamification system and provides visible progress
- P2: Should have -- drives daily engagement and personalization
- P3: Nice to have -- cosmetic depth, can ship without

## Competitor Feature Analysis

| Feature | Khan Academy | Prodigy Math | SplashLearn | Duolingo (reference) | Tiny Tallies Approach |
|---------|-------------|-------------|-------------|---------------------|----------------------|
| **Badges** | 5 tiers (Meteorite to Black Hole) based on points/mastery/behavior | Skill mastery badges, event badges | Daily completion rewards + milestone badges | 10+ achievements with tiered levels (Wildfire, XP Olympian, etc.) | Two categories: mastery milestones (skill/category/grade) + behavior rewards (streak/challenges/remediation). Tiered levels within each badge. |
| **Skill visualization** | Course map with unit completion bars | RPG world map (geography-themed) | Flat progress bars per skill | Course tree with checkpoints | Interactive prerequisite DAG tree showing actual skill relationships. Nodes reflect BKT mastery with visual states. |
| **Daily content** | Recommended practice based on mastery | Daily login rewards + battles | Daily learning cards + unlock reward | Daily quests (3 tasks) | Themed daily challenges with date-seeded rotation. Bonus XP, no penalty for skipping. |
| **Avatar** | Unlockable avatars via energy points | Full character creator + pets + clothing (paywall gated) | Character collection via coins | Duo mascot (not customizable) | 12-15 preset avatars (8 existing + 4-7 unlockable via badges). Frames as decorations. No paywall. |
| **Themes/cosmetics** | None | Extensive (clothing, pets, furniture) -- partially paywalled | Character skins via coins | None | UI color themes + session cosmetic wrappers. All earned through achievement badges. No currency, no shop. |
| **Currency** | Energy points (earn-only) | Coins + premium Wishcoins (IAP) -- FTC complained | Coins earned in-game | Gems (earn + buy) | NONE. Direct badge-to-reward unlocking. Explicitly no intermediate currency. |
| **Anti-patterns** | Minimal -- non-punitive | Paywalled cosmetics, manipulative upselling to children, FTC complaint filed | Coin economy creates mild loss aversion | Daily streak anxiety, aggressive notifications | Zero punitive mechanics, zero paywall, zero currency, zero streaks beyond weekly, zero comparison. |

## Design Constraints from Existing Research

The following constraints from `.planning/07-gamification.md` and `.planning/09-child-ux-design.md` directly inform feature design:

1. **Intrinsic over extrinsic** -- Badges celebrate understanding, not just completion
2. **Effort over ability** -- Behavior badges reward persistence, not speed or accuracy percentages
3. **No punitive mechanics** -- No hearts, lives, game over, or streak-loss anxiety
4. **COPPA compliant** -- No social comparison, no personal info in badge displays
5. **Max 6 interactive elements per screen** -- Skill map must be scrollable, not cluttered
6. **Max 2.5s celebration animation** -- Badge unlock animation capped
7. **Tap to skip animations** -- All celebrations skippable after initial play
8. **48dp minimum touch targets** -- Skill map nodes must be tappable
9. **Reduced motion support** -- Badge animations must have opacity-fade fallback
10. **2 navigation levels max** -- Badge list/skill map are single-level screens

## Sources

- Khan Academy badges and avatar system: [Khan Academy Help Center](https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars)
- Prodigy Math features and criticism: [NBC News FTC Complaint](https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294), [Prodigy Wikipedia](https://en.wikipedia.org/wiki/Prodigy_Math_Game)
- SplashLearn gamification: [SplashLearn on App Store](https://apps.apple.com/us/app/splashlearn-kids-learning-app/id672658828), [Brighterly Review](https://brighterly.com/blog/splashlearn-reviews/)
- Duolingo achievement system: [Lingoly.io Achievements Guide](https://lingoly.io/duolingo-achievements/), [DuolingoGuides All Achievements](https://duolingoguides.com/all-duolingo-achievements/)
- Gamification dark patterns research: [arxiv Dark Patterns of Cuteness](https://www.researchgate.net/publication/378448656_Dark_Patterns_of_Cuteness_Popular_Learning_App_Design_as_a_Risk_to_Children's_Autonomy), [arxiv Game Dark Patterns](https://arxiv.org/html/2401.06247v1)
- Gamification EdTech analysis: [Prodwrks Gamification in EdTech](https://prodwrks.com/gamification-in-edtech-lessons-from-duolingo-khan-academy-ixl-and-kahoot/)
- Prodigy Fairplay criticism: [Fairplay 7 Reasons](https://fairplayforkids.org/pf/prodigy/)
- Children's math gamification best practices: [Fremont Math Hub](https://fremontmathhub.com/how-gamification-makes-math-fun-for-kids/), [Codeyoung](https://www.codeyoung.com/blog/how-gamification-improves-math-learning-in-kids)
- Existing project research: `.planning/07-gamification.md`, `.planning/09-child-ux-design.md`

---
*Feature research for: Gamification v0.7 (achievement badges, visual skill map, daily challenges, avatar customization, themes)*
*Researched: 2026-03-04*
