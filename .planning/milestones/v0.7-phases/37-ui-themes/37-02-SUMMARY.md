---
phase: 37-ui-themes
plan: 02
subsystem: ui
tags: [theming, useTheme, useMemo, color-migration, screens, components]

# Dependency graph
requires:
  - phase: 37-01
    provides: ThemeProvider, useTheme() hook, ThemeColors type
provides:
  - ThemeProvider wrapping NavigationContainer in App.tsx
  - AppNavigator using dynamic contentStyle from useTheme()
  - 8 screens migrated to useTheme() with useMemo-cached styles
  - Header + 5 session + 5 chat components migrated to useTheme()
affects: [37-03, 37-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [useTheme-useMemo-pattern, dynamic-stylesheet-in-component]

# Key files
key-files:
  modified:
    - App.tsx
    - src/navigation/AppNavigator.tsx
    - src/screens/HomeScreen.tsx
    - src/screens/SessionScreen.tsx
    - src/screens/ResultsScreen.tsx
    - src/screens/SandboxScreen.tsx
    - src/screens/ConsentScreen.tsx
    - src/screens/BadgeCollectionScreen.tsx
    - src/screens/SkillMapScreen.tsx
    - src/screens/AvatarPickerScreen.tsx
    - src/components/Header.tsx
    - src/components/session/SessionHeader.tsx
    - src/components/session/CompactAnswerRow.tsx
    - src/components/session/CpaSessionContent.tsx
    - src/components/session/CpaModeIcon.tsx
    - src/components/session/ManipulativePanel.tsx
    - src/components/chat/ChatPanel.tsx
    - src/components/chat/ChatBubble.tsx
    - src/components/chat/ChatBanner.tsx
    - src/components/chat/HelpButton.tsx
    - src/components/chat/ResponseButtons.tsx

# Decisions
decisions:
  - Helper functions referencing colors (getMotivationalColor, getPhaseColor) accept colors as parameter
  - ConsentScreen NumButton inlined to access dynamic styles via closure
  - CpaSessionContent getOptionFeedbackStyle moved inside component for styles closure access
  - CompactAnswerButton receives styles via prop from parent for shared dynamic stylesheet
  - CpaModeIcon keeps module-scope styles since only container style has no color refs

# Metrics
metrics:
  duration: 8m
  completed: "2026-03-05"
---

# Phase 37 Plan 02: Screen & Component Color Migration Summary

Migrated 21 files from static `colors` import to dynamic `useTheme()` hook with `useMemo`-cached StyleSheet -- covers all screens, navigation, Header, session components, and chat components.

## What Changed

### Task 1: ThemeProvider + Navigation + 8 Screens (dc216c1)

- **App.tsx**: Wrapped `NavigationContainer` with `ThemeProvider` inside `SafeAreaProvider`
- **AppNavigator.tsx**: Replaced hardcoded `#1a1a2e` contentStyle with `colors.background` from `useTheme()`
- **8 screens** (Home, Session, Results, Sandbox, Consent, BadgeCollection, SkillMap, AvatarPicker): Mechanical migration of `StyleSheet.create` from module scope into component body wrapped in `useMemo(() => ..., [colors])`

### Task 2: Header + Session + Chat Components (a38e81b)

- **Header.tsx**: Standard migration pattern
- **5 session components** (SessionHeader, CompactAnswerRow, CpaSessionContent, CpaModeIcon, ManipulativePanel): Migrated with special handling for helper functions and sub-components that referenced module-scope styles
- **5 chat components** (ChatPanel, ChatBubble, ChatBanner, HelpButton, ResponseButtons): Standard migration pattern including animated components (Reanimated closures work naturally with local `colors` variable)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Helper functions referencing module-scope colors**
- **Found during:** Task 1 (ResultsScreen), Task 2 (SessionHeader)
- **Issue:** `getMotivationalColor` and `getPhaseColor` referenced `colors` at module scope, which no longer exists
- **Fix:** Added `colors: ThemeColors` parameter to both functions
- **Files modified:** ResultsScreen.tsx, SessionHeader.tsx

**2. [Rule 3 - Blocking] Sub-components sharing module-scope styles**
- **Found during:** Task 1 (ConsentScreen), Task 2 (CompactAnswerRow, CpaSessionContent)
- **Issue:** `NumButton`, `CompactAnswerButton`, and `getOptionFeedbackStyle` referenced module-scope `styles` object
- **Fix:** ConsentScreen NumButton inlined; CompactAnswerButton receives styles via prop; getOptionFeedbackStyle moved inside component closure
- **Files modified:** ConsentScreen.tsx, CompactAnswerRow.tsx, CpaSessionContent.tsx

## Verification

- `npm run typecheck`: Clean for all migrated files (remaining errors only in Plan 03 files: manipulatives, pictorial diagrams, SkillDetailOverlay)
- `npm test -- --testPathPattern="HomeScreen|SessionScreen|ResultsScreen"`: 84 tests passing
- 2 pre-existing TS2366 errors in badge UI unchanged
