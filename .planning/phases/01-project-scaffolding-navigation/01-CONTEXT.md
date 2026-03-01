# Phase 1: Project Scaffolding & Navigation - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

A running Expo 54 app with TypeScript strict mode, React Navigation native-stack, and Zustand store skeleton with empty domain slices. Placeholder Home, Session, and Results screens connected via navigation. Theme system and Lexend font loaded. At least one passing Jest test.

</domain>

<decisions>
## Implementation Decisions

### Store Slice Structure
- 4 domain slices: childProfile, skillStates, sessionState, gamification
- Single appStore.ts composes all slices via spread (one createStore() call)
- No persistence middleware in Phase 1 — added in Phase 4
- Types co-located in each slice file (not centralized in src/types/)
- Store version tracking in appStore.ts for future migrations

### Navigation Structure
- Stack-only navigation (native-stack) — no tabs for v0.1
- Screen file organization: flat in src/screens/ (HomeScreen.tsx, SessionScreen.tsx, ResultsScreen.tsx)
- Navigator config in src/navigation/AppNavigator.tsx with types in navigation/types.ts
- Platform default transitions (iOS slide, Android fade)
- Results screen: "Done" button resets stack to Home (prevents back-to-session)

### App Shell & Theme
- Theme constants in src/theme/index.ts — colors, spacing, typography as single source of truth
- Color palette: deep navy backgrounds (#1a1a2e family), bright accents for feedback
  - Primary: indigo (#6366f1)
  - Correct: bright green/yellow
  - Incorrect: soft coral (not punishing red)
  - Text: high contrast white/light on dark
- Minimal providers for v0.1: SafeAreaProvider + NavigationContainer + StatusBar config
- Load Lexend font via expo-font in App.tsx from Phase 1 (dyslexia-friendly, UX research)

### Placeholder Screens
- Styled dark-themed shells (not minimal text) — validates theme + navigation together
- Home screen: big central "Start Practice" button (prominent, clear primary action)
- Custom header component (hide default React Navigation header) — child-friendly styling
- No header on session/results screens — immersive feel during practice

### Claude's Discretion
- Exact spacing values and typography scale in theme
- SafeAreaView wrapping approach
- Loading/splash screen behavior during font load
- Jest test subject (store, navigation, or component)
- Error boundary inclusion/exclusion

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- index.tsx: Entry point with polyfills (@google/genai compatibility), references ./App
- jest.setup.js: 256 lines of comprehensive mocks (Reanimated, Gesture Handler, AsyncStorage, Navigation, etc.)
- jest.config.js: Configured with jest-expo preset, @/ path alias, coverage collection

### Established Patterns
- Path alias: @/* maps to src/* (configured in tsconfig.json and jest.config.js)
- Dark UI mode: app.json sets userInterfaceStyle: "dark", background #1a1a2e
- New Architecture: enabled in app.json (newArchEnabled: true)
- Portrait only: orientation locked in app.json
- File size limit: 500 lines per CLAUDE.md — refactor into focused modules

### Integration Points
- index.tsx imports ./App — App.tsx must be created at project root
- src/store/slices/ directory exists and ready for slice files
- src/navigation/ directory exists and ready for AppNavigator
- src/screens/ directory exists and ready for screen components
- Notification color #6366f1 already set in app.json plugins (matches indigo primary)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches within the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-project-scaffolding-navigation*
*Context gathered: 2026-03-01*
