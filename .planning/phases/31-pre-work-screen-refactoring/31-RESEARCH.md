# Phase 31: Pre-work -- Screen Refactoring - Research

**Researched:** 2026-03-04
**Domain:** React Native screen refactoring, hook extraction, component decomposition
**Confidence:** HIGH

## Summary

SessionScreen.tsx is currently 552 lines, 52 lines over the project's 500-line guardrail. The file has a clear monolithic structure: 22 lines of imports, 26 lines of utility functions, 438 lines of component body (containing 5 useState, 7 useEffect, and 5 useCallback calls), and 58 lines of StyleSheet. The primary bloat comes from chat/tutor interaction orchestration logic (~150 lines of state, effects, and callbacks) that coordinates between the `useTutor` hook, the store, and the chat UI components.

The refactoring is purely structural -- zero behavioral changes. The key insight is that the chat/tutor orchestration logic (chatOpen/chatMinimized state, help tap handling, response routing, consent gating, auto-close timers, TEACH minimize effects, per-problem reset logic, and BOOST scoring guards) forms a cohesive domain that can be extracted into a single custom hook. The utility functions (`formatPhaseLabel`, `getPhaseColor`) and the header/progress bar JSX can be extracted as a presentational component. Together these extractions should bring SessionScreen comfortably under 400 lines while preserving exact external behavior.

**Primary recommendation:** Extract a `useChatOrchestration` hook (~130-140 lines) for all chat/tutor UI coordination logic, and a `SessionHeader` component (~60-70 lines including styles) for the header bar, phase label, progress bar, and quit button. This is sufficient to bring SessionScreen well below 500 lines. HomeScreen (317 lines) and ResultsScreen (418 lines) do not need proactive refactoring -- they have headroom for gamification additions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None -- no locked decisions specified.

### Claude's Discretion
- Full discretion on refactoring approach -- user trusts Claude to make all extraction decisions
- Scope: SessionScreen is the primary target (552 lines to under 500). Proactive refactoring of HomeScreen (317 lines) and ResultsScreen (418 lines) is at Claude's discretion given upcoming gamification growth.
- Extraction strategy: hooks vs components vs both -- Claude decides based on code analysis
- Biggest extraction candidate: chat/tutor interaction logic (~150 lines of state, effects, handlers)
- Smaller candidates: session header/progress bar components, helper functions (formatPhaseLabel, getPhaseColor)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PREP-01 | SessionScreen refactored below 500-line guardrail (currently 552 lines) | Detailed line-by-line analysis identifies two extraction targets (useChatOrchestration hook + SessionHeader component) that together remove ~180-200 lines from SessionScreen, bringing it to ~350-370 lines. Existing test suite (1,099 lines, 40+ test cases) provides regression safety. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Native | 0.81 | UI framework | Project standard |
| Expo | SDK 54 | Managed workflow | Project standard |
| TypeScript | strict mode | Type safety | Project standard |
| Jest + jest-expo | -- | Testing | Project standard |
| React Native Testing Library | -- | Component testing | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | -- | State management | Chat state reads via `useAppStore` selectors |
| React Navigation 7 | -- | Navigation | `useNavigation`, `usePreventRemove` in SessionScreen |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Single `useChatOrchestration` hook | Multiple small hooks (useChatState, useBoostGuard, etc.) | More hooks = more files but individually simpler; single hook is preferred because the state is deeply interconnected (chatOpen drives helpButton visibility, TEACH effect reads chatOpen, per-problem reset clears all state together) |
| Extracting SessionHeader component | Inline JSX left as-is | Component extraction is preferable because header + progress bar is a self-contained visual unit with its own styles and utility functions |

**Installation:**
No new dependencies required. This is a pure refactoring phase using existing project infrastructure.

## Architecture Patterns

### Recommended Extraction Structure
```
src/
  hooks/
    useChatOrchestration.ts     # NEW: chat/tutor UI coordination (state, effects, callbacks)
  components/
    session/
      SessionHeader.tsx          # NEW: header bar + progress bar + quit button
      SessionHeader.test.tsx     # NEW: unit tests for SessionHeader
      index.ts                   # UPDATED: add SessionHeader export
  screens/
    SessionScreen.tsx            # MODIFIED: uses new hook + component, under 500 lines
```

### Pattern 1: Custom Hook Extraction for Coordinated UI State
**What:** Extract interconnected UI state (chatOpen, chatMinimized, helpUsed, shouldPulse), effects (per-problem reset, TEACH minimize, consent auto-fire, correct-answer reveal, pulse trigger, auto-close cleanup), and callbacks (handleHelpTap, handleResponse, handleCloseChat, handleBannerTap, handleAnswerWithBoost) into a single `useChatOrchestration` hook.
**When to use:** When multiple pieces of React state, effects, and callbacks are tightly coupled and form a cohesive behavioral domain.
**Why a single hook:** The chat state variables are deeply interconnected:
  - `chatOpen` is read by: showHelp derivation, TEACH minimize effect, HelpButton visibility, ChatPanel visibility
  - `chatMinimized` is read by: showHelp derivation, ChatBanner visibility
  - `helpUsed` is read by: shouldPulse derivation
  - All five state variables reset together in the per-problem reset effect
  - BOOST scoring guard (`handleAnswerWithBoost`) reads `boostReveal` which derives from `tutor.tutorMode`
  - `handleHelpTap` sets chatOpen, helpUsed, shouldPulse, and may trigger consent navigation

Splitting these into separate hooks would require passing multiple shared values between hooks, creating unnecessary coupling complexity.

**Interface:**
```typescript
interface ChatOrchestrationParams {
  tutor: UseTutorReturn;
  currentProblem: SessionProblem | null;
  currentIndex: number;
  correctAnswer: number | null;
  feedbackState: FeedbackState | null;
  sessionPhase: SessionPhase;
  isComplete: boolean;
  isOnline: boolean;
  handleAnswer: (selectedValue: number) => void;
}

interface ChatOrchestrationReturn {
  chatOpen: boolean;
  chatMinimized: boolean;
  showHelp: boolean;
  shouldPulse: boolean;
  showCorrectAnswer: boolean;
  boostHighlightAnswer: number | null;
  responseMode: 'standard' | 'gotit';
  bannerMessage: string;
  handleAnswerWithBoost: (selectedValue: number) => void;
  handleHelpTap: () => void;
  handleResponse: (type: 'understand' | 'more' | 'confused' | 'retry' | 'gotit') => void;
  handleCloseChat: () => void;
  handleBannerTap: () => void;
}
```

### Pattern 2: Presentational Component Extraction
**What:** Extract the header bar (phase label, CPA icon, progress text, quit button) and progress bar into a `SessionHeader` component. Move `formatPhaseLabel` and `getPhaseColor` utilities inside the component file. Move associated styles.
**When to use:** When a block of JSX has its own utility functions, its own styles, and receives all data via props with no internal state.

**Interface:**
```typescript
interface SessionHeaderProps {
  sessionPhase: SessionPhase;
  cpaStage: CpaStage;
  currentIndex: number;
  totalProblems: number;
  feedbackState: FeedbackState | null;
  onQuit: () => void;
}
```

### Anti-Patterns to Avoid
- **Changing external API:** The refactored SessionScreen MUST accept the same navigation params, call the same store actions, and render the same DOM structure. No prop changes to downstream components.
- **Over-extracting:** Do NOT create a hook per effect or per callback. The chat state is interconnected -- extracting `usePulse` and `useAutoClose` separately would create artificial boundaries between tightly coupled state.
- **Breaking test mocks:** The existing test file (1,099 lines) mocks `@/components/session`, `@/components/chat`, `@/hooks/useSession`, `@/hooks/useTutor`, etc. The new `useChatOrchestration` hook should be tested directly (hook unit tests), while the existing SessionScreen test should mock the new hook to preserve existing test coverage.
- **Moving store interactions out of testable paths:** All `useAppStore` calls for chat orchestration (addTutorMessage, incrementWrongAnswerCount, tutorConsentGranted) should move into the extracted hook so they remain testable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Line counting verification | Manual counting | `wc -l` on final files | Automated, reliable |
| Behavioral regression detection | Manual visual QA | Existing 40+ SessionScreen tests | Already comprehensive |
| TypeScript interface compatibility | Manual checking | `npm run typecheck` | Catches any signature mismatches |

**Key insight:** The existing test suite IS the refactoring safety net. 40+ test cases covering rendering, answer handling, chat flow, TEACH/BOOST modes, consent gate, offline behavior, and navigation. If all tests pass after refactoring, behavioral equivalence is confirmed.

## Common Pitfalls

### Pitfall 1: Breaking Mock Paths in Existing Tests
**What goes wrong:** After extracting `useChatOrchestration`, the SessionScreen test still mocks individual hooks (`useSession`, `useTutor`, `useNetworkStatus`) and store selectors. If the new hook imports these internally, the mocks may not intercept correctly.
**Why it happens:** Jest mock hoisting means `jest.mock('@/hooks/useChatOrchestration')` must be added, and the mock must return a compatible shape.
**How to avoid:** The SessionScreen test should mock the new `useChatOrchestration` hook entirely (return a mock object matching `ChatOrchestrationReturn`). Create separate unit tests for the hook itself that mock its internal dependencies.
**Warning signs:** Tests pass individually but fail together, or tests produce "not a function" errors on mock returns.

### Pitfall 2: Stale Closure in Extracted Hook
**What goes wrong:** Moving callbacks from SessionScreen into a hook changes closure capture timing. A callback that previously captured `tutor.requestHint` from render scope may now capture a stale reference.
**Why it happens:** When useCallback dependencies are copied to a new hook, the dependency array may not include all needed values.
**How to avoid:** Run `npm run lint` after extraction -- the `react-hooks/exhaustive-deps` rule will catch missing dependencies. Also verify the existing eslint-disable comment on the per-problem reset effect (line 169) is preserved.
**Warning signs:** Chat hints fire with wrong problem context, or "Tell me more" sends stale tutor state.

### Pitfall 3: Forgetting to Move Associated Styles
**What goes wrong:** SessionHeader component is extracted but its styles remain in SessionScreen's StyleSheet, or styles are duplicated.
**Why it happens:** StyleSheet definitions at the bottom of the file are easy to overlook during component extraction.
**How to avoid:** For each extracted JSX block, identify which `styles.xxx` references it uses and move those style definitions to the new component's local StyleSheet.create(). Use TypeScript to verify -- any remaining `styles.xxx` reference that no longer exists in SessionScreen's StyleSheet will produce a type error.
**Warning signs:** Runtime style-related warnings, or stale unused style definitions left behind.

### Pitfall 4: Barrel Export Not Updated
**What goes wrong:** New SessionHeader component is created but not added to `src/components/session/index.ts`, breaking the project's barrel export convention.
**Why it happens:** Easy to forget the index.ts update.
**How to avoid:** Always update the barrel `index.ts` when adding a component to an existing directory. Verify with import: `import { SessionHeader } from '@/components/session'`.
**Warning signs:** Import works with direct path but fails with barrel import.

### Pitfall 5: ref Behavior Change on Hook Extraction
**What goes wrong:** Refs like `autoCloseTimerRef`, `consentPendingRef`, `teachMinimizedRef` behave differently when moved to a custom hook because hooks create their own ref instances.
**Why it happens:** This is actually fine -- `useRef` in a custom hook works identically to `useRef` in a component. But developers sometimes worry about this unnecessarily and add extra state synchronization that introduces bugs.
**How to avoid:** Simply move the ref declarations and their associated effects/callbacks into the hook. Refs work correctly in custom hooks.
**Warning signs:** None if done correctly -- this is a "pitfall to NOT fall into by over-engineering."

## Code Examples

### Example 1: useChatOrchestration Hook Signature
```typescript
// src/hooks/useChatOrchestration.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '@/store/appStore';
import { getBugDescription } from '@/services/tutor/bugLookup';
import type { UseTutorReturn } from '@/hooks/useTutor';
import type { FeedbackState } from '@/hooks/useSession';
import type { SessionProblem, SessionPhase } from '@/services/session';
import type { RootStackParamList } from '@/navigation/types';

const BOOST_SENTINEL = -999999;

export interface ChatOrchestrationParams {
  tutor: UseTutorReturn;
  currentProblem: SessionProblem | null;
  currentIndex: number;
  correctAnswer: number | null;
  feedbackState: FeedbackState | null;
  sessionPhase: SessionPhase;
  isComplete: boolean;
  isOnline: boolean;
  handleAnswer: (selectedValue: number) => void;
}

export function useChatOrchestration(params: ChatOrchestrationParams) {
  // All chat state, effects, and callbacks extracted here
  // ...
}
```

### Example 2: SessionHeader Component
```typescript
// src/components/session/SessionHeader.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, typography, layout } from '@/theme';
import { CpaModeIcon } from './CpaModeIcon';
import type { SessionPhase } from '@/services/session';
import type { CpaStage } from '@/services/cpa/cpaTypes';
import type { FeedbackState } from '@/hooks/useSession';

function formatPhaseLabel(phase: SessionPhase): string {
  switch (phase) {
    case 'warmup': return 'Warmup';
    case 'practice': return 'Practice';
    case 'cooldown': return 'Cooldown';
    case 'complete': return 'Complete';
  }
}

function getPhaseColor(phase: SessionPhase): string {
  switch (phase) {
    case 'warmup': return colors.primaryLight;
    case 'practice': return colors.primary;
    case 'cooldown': return colors.correct;
    case 'complete': return colors.correct;
  }
}

interface SessionHeaderProps {
  sessionPhase: SessionPhase;
  cpaStage: CpaStage;
  currentIndex: number;
  totalProblems: number;
  feedbackState: FeedbackState | null;
  onQuit: () => void;
}

export function SessionHeader({
  sessionPhase,
  cpaStage,
  currentIndex,
  totalProblems,
  feedbackState,
  onQuit,
}: SessionHeaderProps) {
  const progressDone = currentIndex + (feedbackState ? 1 : 0);
  const progressPercent =
    totalProblems > 0 ? (progressDone / totalProblems) * 100 : 0;

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.phaseLabel}>{formatPhaseLabel(sessionPhase)}</Text>
        <CpaModeIcon stage={cpaStage} />
        <Text style={styles.progressText}>
          {currentIndex + 1} / {totalProblems}
        </Text>
        <Pressable
          onPress={onQuit}
          style={styles.quitButton}
          accessibilityRole="button"
          accessibilityLabel="Quit session"
          testID="quit-button"
        >
          <X size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.progressBarContainer} testID="progress-bar">
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: getPhaseColor(sessionPhase),
              },
            ]}
            testID="progress-bar-fill"
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: { /* moved from SessionScreen */ },
  phaseLabel: { /* moved from SessionScreen */ },
  progressText: { /* moved from SessionScreen */ },
  quitButton: { /* moved from SessionScreen */ },
  progressBarContainer: { /* moved from SessionScreen */ },
  progressBarBackground: { /* moved from SessionScreen */ },
  progressBarFill: { /* moved from SessionScreen */ },
});
```

### Example 3: Refactored SessionScreen (Slimmed Down)
```typescript
// src/screens/SessionScreen.tsx -- after refactoring
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation, useRoute, usePreventRemove,
} from '@react-navigation/native';
import { colors, spacing, typography } from '@/theme';
import { useSession } from '@/hooks/useSession';
import { useCpaMode } from '@/hooks/useCpaMode';
import { useTutor } from '@/hooks/useTutor';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useChatOrchestration } from '@/hooks/useChatOrchestration';
import { CpaSessionContent } from '@/components/session';
import { SessionHeader } from '@/components/session';
import { HelpButton, ChatPanel, ChatBanner } from '@/components/chat';
// ...

export default function SessionScreen() {
  // useSession, useCpaMode, useTutor, useNetworkStatus -- unchanged
  // useChatOrchestration -- new, replaces ~130 lines of inline state/effects/callbacks
  // usePreventRemove -- unchanged
  // navigate to Results effect -- unchanged
  // JSX uses SessionHeader + CpaSessionContent + HelpButton + ChatPanel + ChatBanner
  // ~350-370 lines total
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline state/effects in screen | Custom hooks for domain logic | React 16.8+ (hooks) | This project already follows this pattern (useSession, useTutor, useCpaMode, useNetworkStatus). SessionScreen's chat orchestration is the remaining inline logic that should follow the same extraction pattern. |

**No deprecations or breaking changes relevant to this phase.** This is a pure internal refactoring using existing React patterns already established in the project.

## Detailed Line Budget Analysis

### Current SessionScreen Breakdown (552 lines)
| Section | Lines | Line Range | Extractable? |
|---------|-------|------------|-------------|
| Imports | 22 | 1-22 | Some reduce after extraction |
| Type aliases | 4 | 24-26 | Move to hook if unused |
| BOOST_SENTINEL constant | 2 | 28-29 | Move to hook |
| formatPhaseLabel utility | 11 | 31-42 | Move to SessionHeader |
| getPhaseColor utility | 12 | 44-56 | Move to SessionHeader |
| Component function declaration + hook calls | 18 | 58-96 | Stays |
| Chat UI state (5x useState) | 7 | 98-115 | Move to hook |
| showCorrectAnswer state + effect | 11 | 115-127 | Move to hook |
| Pulse effect | 5 | 129-134 | Move to hook |
| TEACH minimize effect | 6 | 136-143 | Move to hook |
| Consent auto-fire effect | 8 | 145-154 | Move to hook |
| Per-problem reset effect | 13 | 156-170 | Move to hook |
| Auto-close cleanup effect | 6 | 172-179 | Move to hook |
| usePreventRemove | 17 | 181-199 | Stays |
| Navigate to Results effect | 16 | 201-217 | Stays |
| Progress derivations | 6 | 219-231 | Move to SessionHeader |
| handleAnswerWithBoost callback | 30 | 240-270 | Move to hook |
| handleHelpTap callback | 24 | 272-296 | Move to hook |
| responseMode derivation | 2 | 298-299 | Move to hook |
| handleResponse callback | 65 | 302-368 | Move to hook |
| handleCloseChat callback | 7 | 370-376 | Move to hook |
| handleBannerTap callback | 4 | 378-382 | Move to hook |
| bannerMessage derivation | 4 | 384-388 | Move to hook |
| Loading state JSX | 13 | 390-404 | Stays |
| Problem derivation | 2 | 406-407 | Stays |
| Main JSX return | 84 | 409-493 | Header portion moves to SessionHeader |
| StyleSheet | 58 | 496-552 | Header styles move to SessionHeader |

### Post-Refactoring Estimates
| File | Estimated Lines | Within Budget? |
|------|----------------|---------------|
| SessionScreen.tsx | ~350-370 | Yes (< 500) |
| useChatOrchestration.ts | ~130-150 | Yes (< 500) |
| SessionHeader.tsx | ~90-100 | Yes (< 500) |
| SessionHeader.test.tsx | ~60-80 | Yes (< 500) |

### ProActve Refactoring Assessment: HomeScreen & ResultsScreen
| Screen | Current Lines | Gamification Additions | Projected Growth | Needs Refactoring Now? |
|--------|--------------|----------------------|-----------------|----------------------|
| HomeScreen | 317 | Daily challenge card (Phase 35, ~30-40 lines JSX) | ~350-360 | No -- comfortable headroom |
| ResultsScreen | 418 | Badge display section (Phase 33, ~40-60 lines JSX) | ~460-480 | Borderline -- but gamification adds are mostly new components imported and rendered, not inline logic. Monitor after Phase 33. |

**Recommendation:** Do NOT proactively refactor HomeScreen or ResultsScreen now. Both have headroom. ResultsScreen is closer to the limit but Phase 33 additions will likely be a `<BadgeResults>` component import, adding minimal lines to the screen itself.

## Open Questions

1. **SessionScreen test update strategy**
   - What we know: The existing 1,099-line test file mocks individual hooks and store selectors. After extracting `useChatOrchestration`, the test needs to mock the new hook.
   - What's unclear: Whether to (a) mock `useChatOrchestration` entirely in SessionScreen test and write new hook-level tests, or (b) keep the existing test structure and just add the new hook mock on top.
   - Recommendation: Option (a) is cleaner. Mock `useChatOrchestration` in SessionScreen test (simpler mocks, fewer dependencies). Write focused hook tests for `useChatOrchestration` that mock `useTutor`, `useAppStore`, etc. This follows the existing pattern where `useSession` has its own tests separate from SessionScreen tests.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + React Native Testing Library |
| Config file | `jest.config.js` (project root) |
| Quick run command | `npm test -- --testPathPattern=SessionScreen` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PREP-01 | SessionScreen under 500 lines, no behavioral changes | regression | `npm test -- --testPathPattern=SessionScreen` | Yes -- `src/__tests__/screens/SessionScreen.test.tsx` |
| PREP-01 | Extracted hook works correctly | unit | `npm test -- --testPathPattern=useChatOrchestration` | No -- Wave 0 |
| PREP-01 | SessionHeader renders correctly | unit | `npm test -- --testPathPattern=SessionHeader` | No -- Wave 0 |
| PREP-01 | TypeScript compiles cleanly | typecheck | `npm run typecheck` | N/A |
| PREP-01 | Lint passes | lint | `npm run lint` | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="SessionScreen|SessionHeader|useChatOrchestration" && npm run typecheck`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + `wc -l src/screens/SessionScreen.tsx` confirms < 500

### Wave 0 Gaps
- [ ] `src/__tests__/hooks/useChatOrchestration.test.ts` -- covers chat state management, BOOST guard, consent flow, response handling
- [ ] `src/components/session/SessionHeader.test.tsx` -- covers rendering, phase labels, progress bar, quit button

## Sources

### Primary (HIGH confidence)
- Direct code analysis of `src/screens/SessionScreen.tsx` (552 lines) -- full line-by-line structural breakdown
- Direct code analysis of `src/hooks/useSession.ts` (422 lines) -- established hook extraction pattern
- Direct code analysis of `src/hooks/useTutor.ts` (368 lines) -- established hook extraction pattern
- Direct code analysis of `src/__tests__/screens/SessionScreen.test.tsx` (1,099 lines) -- existing test coverage assessment
- Direct code analysis of `src/screens/HomeScreen.tsx` (317 lines) -- headroom assessment
- Direct code analysis of `src/screens/ResultsScreen.tsx` (418 lines) -- headroom assessment
- Project CLAUDE.md -- 500-line guardrail, barrel export convention, StyleSheet.create requirement
- Project skill files -- `.claude/skills/tiny-tallies-testing/SKILL.md` for test patterns

### Secondary (MEDIUM confidence)
- Gamification phase growth estimates based on ROADMAP.md phase descriptions and typical React component sizes for badge displays, challenge cards, etc.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, pure internal refactoring
- Architecture: HIGH -- extraction pattern already established in codebase (useSession, useTutor, CpaSessionContent, etc.)
- Pitfalls: HIGH -- based on direct analysis of code dependencies, mock structure, and ref behavior
- Line budget: HIGH -- computed from actual line-by-line analysis, not estimates

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable -- internal refactoring, no external dependency changes)
