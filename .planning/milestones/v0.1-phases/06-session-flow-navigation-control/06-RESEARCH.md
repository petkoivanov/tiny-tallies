# Phase 6: Session Flow & Navigation Control - Research

**Researched:** 2026-03-02
**Domain:** Session lifecycle orchestration, React Navigation guards, state machine composition
**Confidence:** HIGH

## Summary

Phase 6 connects all previously built components (math engine, bug library, adaptive difficulty, state management) into a working practice session. The child taps "Start Practice" on the Home screen and enters a structured session of 15 problems: 3 warmup (easy, strongest skills) followed by 9 adaptive practice (weakest skills, Elo-targeted) followed by 3 cooldown (easy, strongest skills). Each problem is presented as multiple choice with Bug Library distractors, with 1-2 second correct/incorrect feedback before auto-advancing. The session ends with a results summary screen showing score, XP, and duration.

Navigation guards must prevent accidental exit during the session. React Navigation 7's `usePreventRemove` hook (documented as compatible with native-stack) intercepts back button, swipe gestures, and programmatic navigation actions. An explicit "Quit" button with an `Alert.alert` confirmation dialog provides the only exit path. On quit, the session is discarded (no Elo/XP commit). On completion, Elo and XP updates commit to the store, and `CommonActions.reset` navigates to Results then Home.

The primary architectural challenge is the session orchestrator -- a service that pre-generates the problem queue at session start (selecting skills, templates, generating problems, formatting as multiple choice), then exposes a simple index-based progression API. This keeps the screen component thin (render current problem, handle answer, show feedback) while the orchestrator handles all domain logic composition.

**Primary recommendation:** Build a pure-function `sessionOrchestrator` service that composes existing adaptive/mathEngine modules to pre-generate 15 problems at session start, with a thin `useSession` hook that bridges the orchestrator output to screen state.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Fixed problem count: 15 problems default (3 warmup + 9 practice + 3 cooldown)
- Session length not configurable by parents for v0.1 -- hardcoded default, defer settings UI
- Warmup/cooldown use lowest unlocked templates (easiest available) for confidence building
- Warmup/cooldown pick from child's strongest skills (highest Elo); practice focuses on weakest skills
- Elo updates in real-time throughout all phases (warmup, practice, cooldown) -- no special handling
- Quit mid-session discards the session -- confirmation dialog: "Are you sure? Your progress won't be saved."
- Elo/XP not applied on quit; clean exit to Home
- Correct/incorrect feedback shows briefly (1-2 seconds) then auto-advances to next problem
- Back button/gesture disabled during active session (React Navigation beforeRemove listener)
- Always multiple choice for v0.1 -- consistent experience, simpler UI
- Free text input deferred to future enhancement
- MC with Bug Library distractors provides rich answer variety already
- Results screen shows summary totals: correct/total, XP earned, session duration
- Per-skill breakdown deferred to future enhancement
- Elo and XP updates commit to store only when session completes successfully (not on quit)
- Results screen uses existing CommonActions.reset to return to Home (prevents back-nav to completed session)

### Claude's Discretion
- Session service architecture (new service vs extending session state slice)
- How session phases transition internally (state machine, index ranges, etc.)
- Feedback indicator design (simple text/icon, not animated -- animations are Phase 8)
- Confirmation dialog implementation (Alert.alert vs custom modal)
- How to compose adaptive service functions into the session loop
- Test strategy and coverage
- Whether to add sessionPhase to SessionStateSlice or keep it local

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SESS-01 | Child can start a practice session from the home screen | HomeScreen already has "Start Practice" button navigating to Session; session orchestrator initializes problem queue on mount |
| SESS-02 | Session follows structured phases: warmup (easy) -> practice (adaptive) -> cooldown (easy) | Session orchestrator pre-generates 3+9+3 problem queue using skill selection by Elo ranking (strongest for warmup/cooldown, weakest for practice) |
| SESS-03 | Session displays problems one at a time with immediate feedback (correct/incorrect) | SessionScreen renders current problem from queue; feedback state with 1-2s timer before auto-advance |
| SESS-04 | Session ends with a summary showing correct/total, XP earned, and skills practiced | ResultsScreen reads session state from store; XP and Elo committed on completion |
| SESS-05 | Parent can configure session length (number of problems or time limit) | Deferred per CONTEXT.md decisions -- hardcoded 15 problems for v0.1 |
| NAV-02 | Back navigation is disabled during active session (prevents accidental exit) | usePreventRemove hook + gestureEnabled:false on Session screen |
| NAV-03 | Session can be exited via explicit "Quit" button with confirmation | Alert.alert with cancel/quit options; quit discards session and resets to Home |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-navigation/native | ^7.1.22 | Navigation + beforeRemove event | Already installed; native-stack for performance |
| @react-navigation/native-stack | ^7.8.2 | Screen stack management | Already installed; gestureEnabled option |
| zustand | ^5.0.8 | State management | Already installed; session state slice exists |
| react-native (Alert) | 0.81.5 | Native confirmation dialog | Built-in; no dependency needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | ~5.6.0 | Safe area insets | Already used in all screens |
| lucide-react-native | ^0.554.0 | Icons for UI elements | Quit button, feedback indicators |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Alert.alert for quit confirmation | Custom Modal component | Alert.alert is simpler, native-feel, 3 lines of code; custom modal allows theming but overkill for v0.1 |
| Pre-generated problem queue | On-demand generation per problem | Pre-generation avoids async gaps between problems; entire session deterministic from a single seed |
| Index ranges for phase tracking | Formal state machine library (xstate) | Index ranges are simpler for linear 3-phase flow; state machine overkill when phases are sequential and non-branching |

**Installation:**
```bash
# No new dependencies needed -- all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  services/
    session/
      sessionOrchestrator.ts  # Pure function: generates full problem queue
      sessionTypes.ts          # SessionConfig, SessionProblem, SessionResult types
      index.ts                 # Barrel exports
  hooks/
    useSession.ts              # Bridges orchestrator to screen state; manages progression
  screens/
    SessionScreen.tsx           # Renders current problem, handles answers, shows feedback
    ResultsScreen.tsx           # Shows session summary, commits results, navigates home
  store/
    slices/
      sessionStateSlice.ts     # Extended with sessionPhase field if needed
```

### Pattern 1: Pre-Generated Problem Queue
**What:** At session start, the orchestrator generates all 15 problems upfront as a `SessionProblem[]` array. Each entry contains the formatted multiple-choice problem, the session phase it belongs to (warmup/practice/cooldown), and the skill ID for Elo updates.
**When to use:** When the session structure is fixed and deterministic (no dynamic re-routing based on mid-session answers).
**Why:** Eliminates async gaps between problems. The entire session is deterministic from a single seed. Screen component only needs to index into the array.

```typescript
// Source: Project codebase composition pattern
interface SessionProblem {
  readonly problem: Problem;
  readonly presentation: MultipleChoicePresentation;
  readonly phase: 'warmup' | 'practice' | 'cooldown';
  readonly skillId: string;
  readonly templateBaseElo: number;
}

interface SessionConfig {
  readonly warmupCount: number;  // 3
  readonly practiceCount: number; // 9
  readonly cooldownCount: number; // 3
}

function generateSessionQueue(
  skillStates: Record<string, SkillState>,
  config: SessionConfig,
  seed: number,
): SessionProblem[] {
  const rng = createRng(seed);
  const unlockedSkills = getUnlockedSkills(skillStates);
  const queue: SessionProblem[] = [];

  // Warmup: strongest skills, easiest templates
  for (let i = 0; i < config.warmupCount; i++) {
    const skillId = selectStrongestSkill(unlockedSkills, skillStates, rng);
    const elo = getOrCreateSkillState(skillStates, skillId).eloRating;
    const template = selectEasiestTemplate(skillId);
    const problem = generateProblem({ templateId: template.id, seed: rng.intRange(0, 999999) });
    const presentation = formatAsMultipleChoice(problem, rng.intRange(0, 999999));
    queue.push({ problem, presentation, phase: 'warmup', skillId, templateBaseElo: template.baseElo });
  }

  // Practice: weakest skills, adaptive templates
  for (let i = 0; i < config.practiceCount; i++) {
    const skillId = selectSkill(unlockedSkills, skillStates, rng);
    const elo = getOrCreateSkillState(skillStates, skillId).eloRating;
    const template = selectTemplateForSkill(skillId, elo, rng);
    const problem = generateProblem({ templateId: template.id, seed: rng.intRange(0, 999999) });
    const presentation = formatAsMultipleChoice(problem, rng.intRange(0, 999999));
    queue.push({ problem, presentation, phase: 'practice', skillId, templateBaseElo: template.baseElo });
  }

  // Cooldown: same as warmup
  // ...

  return queue;
}
```

### Pattern 2: Index-Range Phase Tracking
**What:** Track current session phase by comparing `currentProblemIndex` against fixed ranges derived from config constants.
**When to use:** When phases are sequential and non-overlapping.
**Why:** Simpler than a state machine. The phase is a derived value, not independent state.

```typescript
function getSessionPhase(index: number, config: SessionConfig): 'warmup' | 'practice' | 'cooldown' | 'complete' {
  if (index < config.warmupCount) return 'warmup';
  if (index < config.warmupCount + config.practiceCount) return 'practice';
  if (index < config.warmupCount + config.practiceCount + config.cooldownCount) return 'cooldown';
  return 'complete';
}
```

### Pattern 3: usePreventRemove for Navigation Guards
**What:** React Navigation 7's `usePreventRemove` hook intercepts all removal attempts (back button, swipe, programmatic navigation) and allows showing a confirmation dialog before proceeding.
**When to use:** During active sessions to prevent accidental exit.
**Why:** Works with native-stack (unlike the older `beforeRemove` event listener approach). The swipe gesture starts but gets cancelled if prevention is active.

```typescript
// Source: https://reactnavigation.org/docs/use-prevent-remove/
import { usePreventRemove } from '@react-navigation/native';

function SessionScreen() {
  const [isSessionActive, setIsSessionActive] = useState(true);
  const navigation = useNavigation();

  usePreventRemove(isSessionActive, ({ data }) => {
    Alert.alert(
      'Quit Practice?',
      "Are you sure? Your progress won't be saved.",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            // Clean up session state
            endSession();
            navigation.dispatch(data.action);
          },
        },
      ],
    );
  });
}
```

### Pattern 4: Feedback Timer with Auto-Advance
**What:** After the child answers, show correct/incorrect feedback for 1-2 seconds, then auto-advance to the next problem.
**When to use:** For every answer submission.
**Why:** Immediate feedback is pedagogically important. The timer prevents the child from getting stuck and keeps the session flowing.

```typescript
const FEEDBACK_DURATION_MS = 1500; // 1.5 seconds

const [feedbackState, setFeedbackState] = useState<{
  visible: boolean;
  correct: boolean;
} | null>(null);

const handleAnswer = useCallback((selectedValue: number) => {
  const isCorrect = selectedValue === currentProblem.problem.correctAnswer;
  setFeedbackState({ visible: true, correct: isCorrect });

  // Record answer and update Elo
  recordAnswer({ problemId, answer: selectedValue, correct: isCorrect, format: 'mc' });

  // Auto-advance after delay
  const timer = setTimeout(() => {
    setFeedbackState(null);
    advanceToNext();
  }, FEEDBACK_DURATION_MS);

  return () => clearTimeout(timer);
}, [currentProblem]);
```

### Pattern 5: Commit-on-Complete for Elo/XP
**What:** Accumulate Elo deltas and XP during the session in local/hook state, then batch-commit to the Zustand store only when the session completes successfully.
**When to use:** When quit should discard all progress.
**Why:** Avoids partial state writes. On quit, nothing has changed in the persistent store. On completion, all updates are applied atomically.

```typescript
// During session: accumulate updates
interface PendingSkillUpdate {
  skillId: string;
  newElo: number;
  attempts: number;
  correct: number;
}

// On completion: commit all at once
function commitSessionResults(
  updates: Map<string, PendingSkillUpdate>,
  totalXp: number,
  updateSkillState: AppState['updateSkillState'],
  addXp: AppState['addXp'],
) {
  for (const [skillId, update] of updates) {
    updateSkillState(skillId, {
      eloRating: update.newElo,
      attempts: update.attempts,
      correct: update.correct,
    });
  }
  addXp(totalXp);
}
```

### Anti-Patterns to Avoid
- **Storing problem queue in Zustand:** The problem queue is session-scoped ephemeral data. Putting it in the store would trigger persistence writes and re-renders across the app. Keep it in a `useRef` or hook state.
- **Computing Elo updates in the store:** Per CLAUDE.md, services contain domain logic. The store holds state. Elo calculation happens in the session orchestrator or hook, then results are committed to the store.
- **Using `beforeRemove` event listener with native-stack:** The older event-based approach has known compatibility issues with `@react-navigation/native-stack`. Use `usePreventRemove` hook instead.
- **Async problem generation during session:** Generating problems on-demand introduces potential lag between problems. Pre-generate the entire queue at session start.
- **Mutating frustration state in store:** FrustrationState is explicitly documented as session-scoped ephemeral data (see frustrationGuard.ts). Keep it local to the session hook.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Navigation back prevention | Custom gesture interceptor | `usePreventRemove` hook from @react-navigation/native | Hook handles back button, swipe, and programmatic removal; tested with native-stack |
| Confirmation dialog | Custom modal with overlay | `Alert.alert` from react-native | Native system dialog; accessible; no styling needed for v0.1 |
| Problem generation | Custom random selection | `selectTemplateForSkill` + `generateProblem` + `formatAsMultipleChoice` | Already built with gaussian weighting, bug library distractors, carry/borrow constraints |
| Skill selection | Custom sorting/filtering | `selectSkill` (weakness-weighted) + `getUnlockedSkills` (prerequisite gating) | Already built with baseline floors and cumulative distribution sampling |
| Elo calculation | Custom rating formula | `calculateEloUpdate` from adaptive service | Already handles K-factor decay, clamping, and expected score |
| XP calculation | Custom scaling formula | `calculateXp` from adaptive service | Already handles base + difficulty bonus |
| Timer management | setInterval polling | `setTimeout` with cleanup in useEffect return | setTimeout is simpler for one-shot delays; cleanup prevents memory leaks |

**Key insight:** Phase 6 is primarily a *composition* phase. Every computational building block already exists. The new code orchestrates existing pure functions into a session flow.

## Common Pitfalls

### Pitfall 1: Elo Drift on Pre-Generated Queue
**What goes wrong:** If Elo is pre-computed at session start but the decision says "Elo updates in real-time throughout all phases," the practice problems won't reflect warmup Elo changes.
**Why it happens:** Pre-generating all 15 problems at start means the practice phase uses the starting Elo, not the Elo after warmup.
**How to avoid:** Two approaches: (a) Pre-generate warmup and cooldown (fixed difficulty), but generate practice problems on-the-fly using updated Elo. (b) Accept the minor drift since warmup is only 3 easy problems and Elo change is minimal (K=16-40 * small delta for easy correct answers). Recommendation: Use approach (a) -- generate practice problems lazily or regenerate the practice portion after warmup completes. The warmup/cooldown portions can be pre-generated since they always use easiest templates regardless of Elo.
**Warning signs:** Elo values in pending updates don't match what the adaptive system would choose mid-session.

### Pitfall 2: Timer Leak on Unmount or Quit
**What goes wrong:** If the child quits during the feedback delay, the setTimeout fires after the component unmounts, causing state-update-on-unmounted-component warnings or navigation errors.
**Why it happens:** setTimeout callback captures stale references and fires after cleanup.
**How to avoid:** Store timer ID in a ref, clear it in useEffect cleanup and in the quit handler. Per CLAUDE.md: "Must use AbortController for cancellation. Follow the defense-in-depth cleanup pattern (explicit handlers + useEffect unmount)."
**Warning signs:** Console warnings about state updates on unmounted components.

### Pitfall 3: Double Navigation on Session End
**What goes wrong:** If the session completion triggers both a navigate('Results') and the auto-advance logic simultaneously, the navigation stack gets confused.
**Why it happens:** Race between the feedback timer's next-problem advance and the session-complete detection.
**How to avoid:** When `currentIndex + 1 >= totalProblems`, the advance function should navigate to Results instead of incrementing the index. Use a single code path for "what happens after feedback timer fires."
**Warning signs:** Seeing the Results screen flash and return, or a blank screen.

### Pitfall 4: Store Version Bump Forgotten
**What goes wrong:** If `sessionPhase` or any new field is added to `SessionStateSlice`, the store version must be bumped with a migration function.
**Why it happens:** CLAUDE.md guardrail: "Don't modify store migration version without adding a corresponding migration function."
**How to avoid:** If new fields are added to persisted slices, bump STORE_VERSION and add migration. BUT: session state is NOT persisted (partialize excludes it), so new session fields do NOT require a migration. Verify by checking `appStore.ts` partialize config.
**Warning signs:** Runtime errors on first launch after update; stale data in AsyncStorage.

### Pitfall 5: Strongest/Weakest Skill Selection Confusion
**What goes wrong:** Warmup should use strongest skills (highest Elo), but `selectSkill` in the adaptive service is weakness-weighted (lowest Elo gets highest probability). Using it for warmup would give the opposite of the desired behavior.
**Why it happens:** The existing `selectSkill` function was designed for practice (weakness-targeting).
**How to avoid:** For warmup/cooldown, implement a separate `selectStrongestSkill` function that inverts the weighting (highest Elo = highest weight), or simply sort unlocked skills by Elo descending and pick from the top. This is a small new function, not a modification of existing adaptive code.
**Warning signs:** Warmup problems are hard instead of easy; child struggles at session start.

### Pitfall 6: gestureEnabled Not Set on Session Screen
**What goes wrong:** On iOS, even with `usePreventRemove`, the swipe gesture starts and then cancels, which can feel jarring. Better UX to disable the gesture entirely.
**Why it happens:** `gestureEnabled` defaults to `true` on iOS for native-stack.
**How to avoid:** Set `gestureEnabled: false` as a screen option for the Session screen in AppNavigator, or dynamically via `navigation.setOptions`. Since `headerShown: false` is already global, `headerBackVisible` is not needed.
**Warning signs:** iOS users can start swiping back and see a partial transition before it snaps back.

## Code Examples

### Session Orchestrator - Strongest Skill Selection
```typescript
// New function for warmup/cooldown (complements existing selectSkill for practice)
import type { SkillState } from '@/store/slices/skillStatesSlice';
import type { SeededRng } from '@/services/mathEngine';

const DEFAULT_ELO = 1000;

/**
 * Selects a skill weighted toward the child's strongest (highest Elo).
 * Used for warmup and cooldown phases where confidence-building is the goal.
 */
export function selectStrongestSkill(
  unlockedSkillIds: readonly string[],
  skillStates: Record<string, SkillState>,
  rng: SeededRng,
  defaultElo: number = DEFAULT_ELO,
): string {
  const elos = unlockedSkillIds.map((id) => ({
    skillId: id,
    elo: skillStates[id]?.eloRating ?? defaultElo,
  }));
  const minElo = Math.min(...elos.map((e) => e.elo));
  const BASELINE = 50;
  const weights = elos.map(({ skillId, elo }) => ({
    skillId,
    weight: elo - minElo + BASELINE,
  }));
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) return w.skillId;
  }
  return weights[weights.length - 1].skillId;
}
```

### Easiest Template Selection for Warmup/Cooldown
```typescript
import { getTemplatesBySkill } from '@/services/mathEngine';
import type { ProblemTemplate } from '@/services/mathEngine';

/**
 * Returns the easiest template for a skill (lowest baseElo).
 * Used in warmup/cooldown for confidence-building problems.
 */
export function selectEasiestTemplate(skillId: string): ProblemTemplate {
  const templates = getTemplatesBySkill(skillId);
  if (templates.length === 0) {
    throw new Error(`No templates found for skill: ${skillId}`);
  }
  return templates.reduce((a, b) => (a.baseElo <= b.baseElo ? a : b));
}
```

### Navigation Guard with usePreventRemove
```typescript
// Source: https://reactnavigation.org/docs/use-prevent-remove/
import { usePreventRemove } from '@react-navigation/native';
import { Alert } from 'react-native';

function useSessionNavigationGuard(
  isActive: boolean,
  onQuit: () => void,
) {
  const navigation = useNavigation();

  usePreventRemove(isActive, ({ data }) => {
    Alert.alert(
      'Quit Practice?',
      "Are you sure? Your progress won't be saved.",
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            onQuit();
            navigation.dispatch(data.action);
          },
        },
      ],
    );
  });
}
```

### Disable Gesture on Session Screen
```typescript
// In AppNavigator.tsx
<Stack.Screen
  name="Session"
  component={SessionScreen}
  options={{ gestureEnabled: false }}
/>
```

### Results Navigation with Stack Reset
```typescript
// Already exists in ResultsScreen.tsx -- reuse this pattern
import { CommonActions } from '@react-navigation/native';

const handleDone = () => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    }),
  );
};
```

### Feedback Timer with Cleanup
```typescript
const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleAnswer = useCallback((selectedValue: number) => {
  const isCorrect = selectedValue === currentProblem.problem.correctAnswer;
  setFeedbackState({ visible: true, correct: isCorrect });

  // Record in session state
  recordSessionAnswer(selectedValue, isCorrect);

  // Auto-advance after feedback
  feedbackTimerRef.current = setTimeout(() => {
    setFeedbackState(null);
    advanceToNextProblem();
  }, 1500);
}, [currentProblem]);

// Defense-in-depth cleanup
useEffect(() => {
  return () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
  };
}, []);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `beforeRemove` event listener | `usePreventRemove` hook | React Navigation 7 | Hook works with native-stack; event had compatibility issues |
| `headerLeft: () => null` to hide back | `headerShown: false` globally | Already configured | No header to hide; gestures must be disabled separately |
| Custom modal for confirmation | `Alert.alert` (React Native built-in) | N/A | Native dialog is simpler for v0.1 |
| On-demand problem generation | Pre-generated queue at session start | N/A | Eliminates inter-problem latency |

**Deprecated/outdated:**
- `navigation.addListener('beforeRemove', ...)` with native-stack: Known compatibility issues. Use `usePreventRemove` hook instead.
- `navigation.setOptions({ gestureEnabled: false })` per-render: Better to set as static screen option in navigator for native-stack.

## Open Questions

1. **Elo real-time updates during warmup**
   - What we know: Decision says "Elo updates in real-time throughout all phases." Warmup uses easiest templates. After 3 easy correct answers, Elo will increase slightly.
   - What's unclear: Whether practice problem difficulty should account for warmup's Elo change (tiny but nonzero).
   - Recommendation: Generate practice problems lazily using the updated Elo after warmup completes, or accept the ~5-10 point drift is negligible. The lazy approach is more correct.

2. **Session screen params**
   - What we know: `RootStackParamList` currently has `Session: undefined` and `Results: undefined` with a comment saying "Session and Results will receive params in Phase 6."
   - What's unclear: Whether sessionId should be a nav param or internal state.
   - Recommendation: Use a `sessionId` (timestamp-based) as a nav param for Session to ensure the screen can distinguish between sessions. Pass `sessionId` to Results for the same reason. This also enables future deep linking.

3. **SessionStateSlice extension**
   - What we know: CONTEXT.md leaves "Whether to add sessionPhase to SessionStateSlice or keep it local" to Claude's discretion.
   - What's unclear: Whether other parts of the app need to know the current session phase.
   - Recommendation: Keep session phase as local state in the `useSession` hook. No other screen or component needs to know whether we're in warmup/practice/cooldown. This avoids a store schema change and keeps the information scoped to where it's used.

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/services/adaptive/` - all adaptive functions (selectSkill, selectTemplateForSkill, calculateEloUpdate, calculateXp, frustrationGuard)
- Project codebase: `src/services/mathEngine/` - problem generation, multiple choice formatting, bug library distractors
- Project codebase: `src/store/slices/sessionStateSlice.ts` - existing session state management
- Project codebase: `src/navigation/` - existing AppNavigator, types, CommonActions.reset pattern
- [React Navigation - Preventing Going Back](https://reactnavigation.org/docs/preventing-going-back/) - usePreventRemove documentation
- [React Navigation - usePreventRemove](https://reactnavigation.org/docs/use-prevent-remove/) - hook API, parameters, limitations
- [React Navigation - Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator/) - gestureEnabled, screen options

### Secondary (MEDIUM confidence)
- [React Native Alert API](https://reactnative.dev/docs/alert) - Alert.alert for confirmation dialogs
- Multiple sources confirming `usePreventRemove` works with native-stack (official docs + upgrade guide)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and in use; no new dependencies
- Architecture: HIGH - all building blocks exist; this phase is purely composition
- Pitfalls: HIGH - derived from direct codebase analysis and verified React Navigation docs

**Research date:** 2026-03-02
**Valid until:** 2026-04-01 (stable; no fast-moving dependencies)
