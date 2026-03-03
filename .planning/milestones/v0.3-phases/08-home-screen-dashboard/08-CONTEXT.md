# Phase 8: Home Screen Dashboard - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign HomeScreen to show child's identity and progress: name greeting, level display, XP progress bar, streak counter with this-week indicator, and Start Practice button. Consumes gamification state from Phase 7 (xp, level, weeklyStreak, lastSessionDate via store).

</domain>

<decisions>
## Implementation Decisions

### Screen Layout
- Top-heavy layout: profile/identity at top, stats in middle, Start Practice button fixed at bottom
- Child's name replaces app title — "Hi, Emma!" as hero greeting (no "Tiny Tallies" title on home screen)
- Start Practice button anchored at bottom of screen (not scrolling with content), always visible and thumb-reachable
- Natural reading flow: identity → level/XP → streak → action button

### Child Identity Display
- Hero greeting: "Hi, [name]!" in large Lexend bold
- Level shown prominently near name: "Level 5" badge/text
- Avatar from childProfileSlice.avatarId (existing avatar constants in store/constants/avatars.ts)

### XP Progress Bar
- Shows progress toward next level: "45/120 XP" with filled bar
- Bar resets each level (Phase 7 decision: cumulative internally, progress derived)
- Use calculateXpForLevel and calculateLevelFromXp from services/gamification/levelProgression.ts

### Streak Display
- Show streak count + practiced-this-week indicator (Phase 7 decision)
- "3 week streak ✓" when practiced this week
- Gentle nudge text when not yet practiced this week (not punitive — no "you're falling behind!")
- Derive practicedThisWeek from lastSessionDate vs current calendar week (isSameISOWeek from weeklyStreak service)

### Claude's Discretion
- Avatar visual treatment (emoji circle, icon, or illustration placeholder)
- XP bar style (thickness, colors, animation on mount)
- Streak icon choice (flame, star, or calendar icon from lucide-react-native)
- Exact spacing and proportions between sections
- Empty/first-time state when child has no sessions yet (Level 1, 0 XP, 0 streak)
- Whether to show "Math made fun!" subtitle or remove entirely

</decisions>

<specifics>
## Specific Ideas

- The screen should feel personal and welcoming — child opens the app and sees THEIR name and progress, not an app landing page
- Button must be large and easy to hit (48dp min already in theme, but consider making it even larger for primary CTA)
- No punitive language — streak nudge should be encouraging ("Ready to keep your streak going?") not guilt-inducing

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `HomeScreen.tsx`: Current centered layout with title/subtitle/button — will be rewritten but Pressable pattern and styles structure reusable
- `theme/index.ts`: Full theme system (colors, spacing, typography, layout with minTouchTarget=48)
- `gamificationSlice.ts`: xp, level, weeklyStreak, lastSessionDate state
- `levelProgression.ts`: calculateXpForLevel(level), calculateLevelFromXp(totalXp), detectLevelUp
- `weeklyStreak.ts`: isSameISOWeek for practicedThisWeek derivation
- `childProfileSlice.ts`: name, age, grade, avatarId
- `store/constants/avatars.ts`: Avatar constant definitions
- `lucide-react-native`: Icon library (per CLAUDE.md — no other icon libraries)

### Established Patterns
- StyleSheet.create for styles (not inline)
- useSafeAreaInsets for safe area padding
- useNavigation for routing to Session screen
- useAppStore for Zustand state access
- Theme constants imported from @/theme

### Integration Points
- useAppStore() to read: name (childProfile), xp, level, weeklyStreak, lastSessionDate (gamification)
- Navigation: navigate('Session', { sessionId }) on button press (existing)
- Gamification services: import calculateXpForLevel, calculateLevelFromXp for XP bar math
- Streak services: import isSameISOWeek for practicedThisWeek

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-home-screen-dashboard*
*Context gathered: 2026-03-02*
