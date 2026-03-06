# Phase 37: UI Themes - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can personalize the app appearance with unlockable color themes (5 total: default dark + ocean + forest + sunset + space) and session cosmetic wrappers that add themed visuals around math problems during play. Non-default themes are badge-gated. A ThemeProvider replaces static color imports app-wide.

</domain>

<decisions>
## Implementation Decisions

### Theme color palettes
- 5 themes total: Default Dark (always available), Ocean, Forest, Sunset, Space (4 unlockable via badges)
- Full palette swap — all 12 color tokens in `theme/index.ts` change per theme (backgrounds, surfaces, primary, text, feedback)
- Typography stays Lexend across all themes — only colors change
- 1:1 badge-to-theme mapping following Phase 36 cosmetic unlock pattern

### Session wrappers
- Each theme includes its own session wrapper — wrapper is tied to the equipped theme, not a separate cosmetic
- Subtle ambient animation during math sessions (e.g., floating bubbles for ocean, twinkling stars for space) — must not distract from the math problem
- Default dark theme also gets a basic wrapper for consistency across all themes
- Visual implementation approach (decorative borders vs background scenes vs themed cards) at Claude's discretion

### ThemeProvider architecture
- React Context + `useTheme()` hook returns current colors — screens call `const { colors } = useTheme()`
- ALL screens migrated to `useTheme()` — full consistency, switching themes changes everything
- Immediate theme switching via React Context re-render — no app restart needed
- Static `colors` export in `theme/index.ts` removed entirely — force all consumers through `useTheme()`, TypeScript catches missed migrations
- Store migration needed for equipped `themeId` field in childProfileSlice

### Theme picker screen
- Follows Phase 36 picker pattern: sectioned layout with live preview and locked items showing badge requirements
- Preview should show a representative snapshot of the theme (not just a color swatch) — how the app would look

### Claude's Discretion
- Feedback color handling per theme (keep universal green/red or theme-tint them for visual harmony)
- Session wrapper visual approach (borders, backgrounds, card styling, or a mix)
- Ambient animation implementation (Reanimated patterns, performance budget)
- Exact color hex values for each theme palette
- Which badges unlock which themes (distribute across difficulty levels)
- Theme picker preview implementation (screenshots vs live mini-preview)
- Store migration version bump and shape

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `theme/index.ts`: Current static `colors`, `spacing`, `typography`, `layout` exports — colors must become dynamic, others stay static
- `AvatarPickerScreen` + `CosmeticDetailOverlay` (Phase 36): sectioned picker with live preview, locked items, badge requirements overlay — reuse pattern for theme picker
- `AvatarCircle` (Phase 36): shared component with cosmetic rendering — pattern for theme-aware components
- `BadgeUnlockPopup` (Phase 33): popup mentions cosmetic unlocks — extend for theme unlocks
- `SPECIAL_AVATARS` / `FRAMES` constants with `badgeId` field (Phase 36): cosmetic unlock registry pattern — reuse for themes

### Established Patterns
- Zustand domain slices with versioned migrations (currently STORE_VERSION=11)
- Cosmetic unlock check: `badgeId in earnedBadges` (Phase 36)
- StyleSheet.create for all styles — must move to dynamic style generation with useTheme()
- Dark theme: navy (#1a1a2e), purple accents (#6366f1/#818cf8), green (#84cc16) — becomes the "default" theme
- Reanimated for animations (sparkle, badge popup, confetti)
- 48dp minimum touch targets for ages 6-9
- 1380 tests passing

### Integration Points
- `theme/index.ts`: Replace static `colors` with ThemeProvider + theme definitions
- `childProfileSlice`: Add `themeId` field
- `appStore.ts`: STORE_VERSION 11 -> 12 with migration for themeId
- Every screen/component importing `colors` from theme: migrate to `useTheme()`
- `SessionScreen`: integrate session wrapper component
- `BadgeUnlockPopup`: add theme cosmetic unlock text
- Navigation: add ThemePicker screen route

</code_context>

<specifics>
## Specific Ideas

- Full palette swap creates genuinely different color worlds — not just tinted versions of the same theme
- Session wrapper ambient animations should be very subtle and slow (think aquarium background, not game FX) to avoid distracting ages 6-9 from math
- Removing static `colors` export is a clean break — TypeScript will surface every file that needs migration, making it impossible to miss one
- Theme preview in picker should give a real sense of the color world, not just a swatch

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 37-ui-themes*
*Context gathered: 2026-03-05*
