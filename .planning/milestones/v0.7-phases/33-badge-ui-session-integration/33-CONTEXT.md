# Phase 33: Badge UI & Session Integration - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users see their badges — earned badges display in a categorized grid screen, new unlocks trigger a celebration popup with badge-specific animation, session results show what was earned, and the home screen provides an entry point to the badge collection. Badge evaluation is wired into the existing session commit-on-complete flow.

</domain>

<decisions>
## Implementation Decisions

### Badge unlock celebration
- Full-screen popup modal overlay with badge icon, name, and description — centered on screen with dim background, child taps to dismiss
- When multiple badges earned in one session, show each badge popup sequentially — tap to advance to next badge (max ~3 realistically)
- Badge-specific animation: badge scales up with a glow/shimmer effect, distinct from the ConfettiCelebration used for level-up — differentiates badge unlock from level up
- Popup appears on the Results screen as an overlay — navigate to Results first, then show popup(s) overlaid on Results

### Badge collection screen
- New screen in navigator (BadgeCollection) accessible from Home screen
- Badges organized in categorized sections with headers: "Skill Mastery", "Category & Grade", "Milestones" (behavior badges) — matches the 27-badge registry structure
- Locked badges shown fully visible but dimmed (reduced opacity), with requirements text — child sees what they're working toward
- Tapping a badge shows a detail overlay (bottom sheet or modal) with: badge icon large, name, description, requirement text, earned date or "Not yet earned"
- Badge icons are emoji-based in styled containers (like avatar circles) — matches existing AVATARS pattern, zero asset management. E.g., ⭐ for mastery, 🔥 for streaks, 🏆 for grade completion

### Results screen badges
- New "Badges Earned" section inside existing stats card, after streak row, before time row — badge emoji + name for each earned badge
- No badges section when no badges earned — clean, non-punitive, aligns with "no punitive mechanics" constraint
- "View All Badges" pressable link below badges section navigating to badge collection screen
- Badge evaluation runs during session commit, earned badge IDs passed as route params to Results (consistent with existing xpEarned, leveledUp, streakCount route params pattern)

### Home screen entry point
- Badge count button in stats section showing e.g. "🏅 3 / 27 Badges" — pressable, navigates to badge collection screen
- Count reads directly from Zustand store (earnedBadges) — updates immediately when returning from Results, no extra work

### Claude's Discretion
- Exact animation timing and easing curves for badge popup
- Badge detail overlay implementation (bottom sheet vs modal)
- Exact emoji assignments per badge category/tier
- Badge grid column count and spacing
- "View All Badges" link styling
- Whether to extract ResultsScreen badge section into a component (file is at 418 lines)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ConfettiCelebration` (`components/animations/`): 24-particle falling animation — NOT reused for badges (distinct animation), but shows the pattern for overlay celebrations
- `AnswerFeedbackAnimation` (`components/animations/`): existing animation component pattern
- `AVATARS` array + avatar circle pattern (`store/constants/avatars.ts`, `HomeScreen`): emoji in styled circles — badge icons follow same approach
- `evaluateBadges` (`services/achievement/badgeEvaluation.ts`): pure function taking snapshot + earnedBadges → string[] of newly-earned IDs
- `BADGES` registry + `getBadgeById` + `getBadgesByCategory` (`services/achievement/badgeRegistry.ts`): static catalog with 27 entries
- `achievementSlice` (`store/slices/achievementSlice.ts`): earnedBadges state + addEarnedBadges action
- `gamificationSlice`: sessionsCompleted + incrementSessionsCompleted
- `calculateLevelFromXp` (`services/gamification/levelProgression.ts`): pattern for pure game logic consumption

### Established Patterns
- Route params for Results data (score, xpEarned, leveledUp, streakCount, cpaAdvances) — badge IDs follow same pattern
- Commit-on-complete: all state updates atomic after session finishes — badge evaluation + store write happens here
- StyleSheet.create for all styles, no inline objects
- Dark theme: navy backgrounds (#1a1a2e), purple accents (#6366f1/#818cf8), green for correct (#84cc16)
- Reanimated for animations (useSharedValue, useAnimatedStyle, withSpring, withDelay)
- lucide-react-native for icons
- 48dp minimum touch targets for ages 6-9
- Zustand selectors for per-field reactivity

### Integration Points
- `SessionScreen` commit-on-complete flow: where evaluateBadges runs, passes results to Results route params
- `RootStackParamList` in `navigation/types.ts`: needs `newBadges?: string[]` added to Results params + new BadgeCollection route
- `AppNavigator.tsx`: needs BadgeCollection screen added
- `ResultsScreen` (418 lines): new badges section in stats card + popup overlay
- `HomeScreen` (317 lines): badge count button in stats section

</code_context>

<specifics>
## Specific Ideas

- Badge popup animation should be visually distinct from level-up confetti — scale-up with glow/shimmer rather than falling particles
- Emoji-based badge icons match the existing avatar emoji pattern (AVATARS array uses emoji in circles)
- Sequential popup for multi-badge is important — each badge should feel like its own celebration moment for a 6-9 year old

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 33-badge-ui-session-integration*
*Context gathered: 2026-03-05*
