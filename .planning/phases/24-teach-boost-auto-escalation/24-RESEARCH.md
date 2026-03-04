# Phase 24: TEACH, BOOST & Auto-Escalation - Research

**Researched:** 2026-03-04
**Domain:** Finite state machine for tutor mode escalation, CPA-aware prompt templates, manipulative panel auto-expansion, answer reveal UX, misconception-informed LLM prompts
**Confidence:** HIGH

## Summary

Phase 24 completes the AI tutor's three-mode system by adding TEACH mode (CPA-aware teaching with manipulative integration), BOOST mode (deep scaffolding with programmatic answer reveal), and the auto-escalation state machine that transitions HINT -> TEACH -> BOOST based on struggle level. The phase also integrates Bug Library misconception tags into all tutor explanations.

The entire data layer (Gemini client, safety pipeline, rate limiting, tutorSlice, useTutor hook) and UI layer (ChatPanel, ResponseButtons, HelpButton, ManipulativePanel) are already built from Phases 21-23. This phase is primarily about: (1) a pure-function escalation state machine, (2) new prompt templates for TEACH and BOOST modes, (3) wiring CPA stage from `useCpaMode` into `useTutor`, (4) passing misconception data from wrong-answer selection into the prompt, (5) adjusting ChatPanel to minimize when ManipulativePanel opens in TEACH mode, and (6) BOOST mode's answer reveal + "Got it!" button UX.

No new dependencies are needed. No store migration is needed (tutorSlice is ephemeral). The primary complexity is in the SessionScreen orchestration -- coordinating ManipulativePanel expansion, ChatPanel minimization, answer grid highlighting, and the escalation state machine, all within the existing component composition pattern.

**Primary recommendation:** Build the escalation logic as a pure function `computeEscalation()` that takes `{ hintCount, wrongAnswerCount, currentMode }` and returns the next mode. Add `wrongAnswerCount` to tutorSlice (ephemeral, resets per-problem). Wire `useCpaMode` into `useTutor` for CPA-stage-aware prompts. Build `buildTeachPrompt()` and `buildBoostPrompt()` as sibling functions to `buildHintPrompt()`. Modify `buildSystemInstruction()` to vary safety rules by mode (BOOST allows answer reveal). All state machine logic lives in a new `escalationEngine.ts` service file.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- HINT -> TEACH: After 2 Socratic hints delivered AND child answers wrong again. Fast escalation -- don't let ages 6-9 struggle too long
- TEACH -> BOOST: After 3+ total wrong answers on the problem (cumulative across all modes). Matches success criteria "3+ wrong attempts"
- Transitions announced with gentle tutor message: "Let me show you a different way!" before switching mode. Positive framing, not punitive
- State machine resets per-problem only -- closing and reopening chat on same problem preserves current mode. Avoids frustrating re-escalation from scratch
- ManipulativePanel auto-expands with the correct manipulative pre-selected for the current skill (via useCpaMode). Matches existing concrete-mode auto-expand behavior
- Full CPA-stage language adaptation: concrete references physical objects/blocks, pictorial references diagrams/pictures, abstract uses math notation/algorithms
- Chat guidance only -- no guided highlighting on manipulatives. Tutor explains via chat, manipulative is open for child to explore freely
- When ManipulativePanel opens, chat minimizes to show only the latest tutor message as a floating banner at top. Manipulatives need screen space. Child can tap to re-expand full chat
- Tutor explains answer in chat with teaching tone: "The answer is 15! When we add 8 + 7, we can make a 10 first..." Focus on the WHY, not just the number. Growth mindset
- Correct answer option is visually highlighted in the answer grid simultaneously. Dual reinforcement -- chat explains, grid shows
- After reveal, response buttons change to single "Got it!" button. Simplifies the moment -- child acknowledges and moves on
- Child taps the highlighted answer to advance (still requires interaction, but correct answer is obvious)
- BOOST-revealed answer counts as WRONG for XP/Elo/BKT. Child didn't solve independently -- honest tracking. Encouragement comes from tutor chat, not from scoring
- Bug Library misconception tags inform ALL tutor modes, including HINT. Even Socratic hints target the specific misconception
- Subtle reframing approach -- tutor addresses the misconception indirectly by teaching the correct approach, never says "you did X wrong"
- When no Bug Library match (random/adjacent distractor), fall back to generic CPA walkthrough
- Misconception passed to LLM via structured prompt template -- bugDescription string woven into instructions

### Claude's Discretion
- Exact animation timing for ManipulativePanel auto-expand during TEACH
- Floating chat banner design (position, styling, tap-to-expand behavior)
- Answer highlight styling in grid (glow, border, color)
- Exact wording of gentle transition messages between modes
- "Got it!" button styling and auto-close timing
- Prompt template structure for TEACH and BOOST modes (within the constraints above)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MODE-02 | TEACH mode walks through concept with CPA-stage-aware language | New `buildTeachPrompt()` in `promptTemplates.ts` with CPA-stage parameter from `useCpaMode`. Mode-aware `buildSystemInstruction()` that adjusts language guidance per CPA stage. Prompt includes manipulative type name so LLM references the specific tool on screen. |
| MODE-03 | TEACH mode triggers ManipulativePanel expansion with correct manipulative type | `useTutor` returns `{ shouldExpandManipulative, manipulativeType }` when transitioning to TEACH. SessionScreen watches this signal and calls `setPanelExpanded(true)` on `CpaSessionContent`. ManipulativePanel already accepts `expanded` prop and auto-animates. `useCpaMode(skillId)` already resolves manipulativeType. |
| MODE-04 | BOOST mode provides deep scaffolding with programmatic answer reveal after 3+ wrong | New `buildBoostPrompt()` that includes the correct answer in the prompt (BOOST-only exception to the "never send answer" rule). Modified `buildSystemInstruction()` that allows answer revelation in BOOST mode. SessionScreen highlights correct answer option in the answer grid. ResponseButtons replaced with single "Got it!" button. |
| MODE-05 | Auto-escalation state machine (HINT -> TEACH -> BOOST) based on struggle level | Pure function `computeEscalation()` in new `escalationEngine.ts`. Input: `{ hintCount, wrongAnswerCount, currentMode }`. Thresholds: HINT->TEACH after 2 hints + wrong answer; TEACH->BOOST after 3+ cumulative wrong. Resets per-problem via `resetProblemTutor()`. |
| MODE-06 | Bug Library misconception tag informs tutor explanations | `ChoiceOption.bugId` already flows from distractor generation. On wrong answer, SessionScreen looks up `BugPattern.description` via bugId and passes to `useTutor`. All prompt builders accept `bugDescription` parameter (already in `PromptParams`). |

</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | ~4.1.1 | ManipulativePanel spring animation, floating banner animation, answer highlight glow | Already used throughout session UI |
| zustand | ^5.0.8 | tutorSlice for escalation state (wrongAnswerCount, tutorMode) | Project state management standard |
| react-native-gesture-handler | ^2.24.0 | ChatPanel swipe-down dismiss | Already used in ChatPanel |
| lucide-react-native | ^0.554.0 | Icons for mode transition UI | Only allowed icon library |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @google/genai | ^1.43.0 | Gemini API calls for TEACH/BOOST prompts | Already configured and working |
| zod | ^3.24.1 | Response validation | Already in safety pipeline |

### No New Dependencies Required
This phase extends existing patterns. No new npm packages are needed.

## Architecture Patterns

### Recommended Project Structure (New/Modified Files)
```
src/
  services/
    tutor/
      escalationEngine.ts         # NEW: Pure function state machine
      escalationEngine.test.ts    # NEW: Unit tests for escalation logic
      promptTemplates.ts          # MODIFIED: Add buildTeachPrompt, buildBoostPrompt, mode-aware system instruction
      types.ts                    # MODIFIED: Add BoostPromptParams extending PromptParams with correctAnswer
      index.ts                    # MODIFIED: Export new functions
  store/
    slices/
      tutorSlice.ts               # MODIFIED: Add wrongAnswerCount field + incrementWrongAnswerCount + resetProblemTutor updates
  hooks/
    useTutor.ts                   # MODIFIED: Mode-aware prompt routing, CPA integration, escalation trigger, expose signals
  components/
    chat/
      ChatPanel.tsx               # MODIFIED: Support minimized/banner mode when manipulative panel is open
      ChatBanner.tsx              # NEW: Floating banner showing latest tutor message (tap to expand)
      ResponseButtons.tsx         # MODIFIED: Support 'gotit' response type for BOOST mode
      index.ts                    # MODIFIED: Export ChatBanner
  screens/
    SessionScreen.tsx             # MODIFIED: Wire escalation, coordinate ManipulativePanel + ChatPanel states, answer highlight, wrong answer tracking
  components/
    session/
      CpaSessionContent.tsx       # MODIFIED: Add boostHighlight prop to highlight correct answer in BOOST mode
      CompactAnswerRow.tsx        # MODIFIED: Add boostHighlight prop
```

### Pattern 1: Pure Function Escalation Engine
**What:** A stateless pure function that computes the next tutor mode based on current state.
**When to use:** Any time a wrong answer is submitted or a hint is delivered.
**Why pure:** Easy to unit test with no mocking. No side effects. The state machine logic is the most critical correctness requirement.

```typescript
// src/services/tutor/escalationEngine.ts

import type { TutorMode } from './types';

export interface EscalationInput {
  currentMode: TutorMode;
  hintCount: number;        // Number of hint-level LLM responses delivered
  wrongAnswerCount: number;  // Cumulative wrong answers on this problem
}

export interface EscalationResult {
  nextMode: TutorMode;
  shouldTransition: boolean;
  transitionMessage: string | null;  // Gentle announcement message
}

/**
 * Pure function: given current escalation state, compute the next mode.
 *
 * Thresholds (locked decisions):
 * - HINT -> TEACH: hintCount >= 2 AND wrongAnswerCount >= 1 (after hint delivery)
 * - TEACH -> BOOST: wrongAnswerCount >= 3 (cumulative across all modes)
 * - BOOST is terminal for this problem (no further escalation)
 */
export function computeEscalation(input: EscalationInput): EscalationResult {
  const { currentMode, hintCount, wrongAnswerCount } = input;

  if (currentMode === 'hint' && hintCount >= 2 && wrongAnswerCount >= 1) {
    return {
      nextMode: 'teach',
      shouldTransition: true,
      transitionMessage: "Let me show you a different way!",
    };
  }

  if (currentMode === 'teach' && wrongAnswerCount >= 3) {
    return {
      nextMode: 'boost',
      shouldTransition: true,
      transitionMessage: "Let me help you through this one!",
    };
  }

  return {
    nextMode: currentMode,
    shouldTransition: false,
    transitionMessage: null,
  };
}
```

### Pattern 2: Mode-Aware Prompt Routing in useTutor
**What:** useTutor selects the correct prompt builder based on current tutorMode.
**When to use:** Every time a tutor LLM call is made.

```typescript
// Inside useTutor's request function, after escalation check:
function selectPromptBuilder(mode: TutorMode) {
  switch (mode) {
    case 'hint':
      return buildHintPrompt;
    case 'teach':
      return buildTeachPrompt;
    case 'boost':
      return buildBoostPrompt;
  }
}
```

### Pattern 3: Coordinated Panel State in SessionScreen
**What:** SessionScreen manages the relationship between ChatPanel, ManipulativePanel, and answer grid through coordinated boolean state.
**When to use:** When TEACH mode activates and ManipulativePanel needs to auto-expand.

```
States:
- chatOpen: boolean (full chat panel visible)
- chatMinimized: boolean (floating banner only)
- manipulativeExpanded: boolean (ManipulativePanel.expanded)
- boostReveal: boolean (correct answer highlighted)

Transitions:
- TEACH mode activated -> manipulativeExpanded=true, chatOpen=false, chatMinimized=true
- Tap banner -> chatOpen=true, chatMinimized=false (manipulative stays open)
- BOOST mode activated -> boostReveal=true, answer grid highlights correct
- "Got it!" tapped -> close chat, advance problem
```

### Anti-Patterns to Avoid
- **Anti-pattern: Mode-specific code in tutorSlice.** The slice should remain a dumb data store. Escalation logic belongs in `escalationEngine.ts`, prompt selection in `useTutor`. The slice just holds `tutorMode`, `wrongAnswerCount`, and `hintLevel`.
- **Anti-pattern: Sending correctAnswer to LLM in non-BOOST modes.** Only `buildBoostPrompt` receives `correctAnswer`. The `PromptParams` type deliberately excludes it. Create a separate `BoostPromptParams` that extends `PromptParams` with `correctAnswer`.
- **Anti-pattern: Complex animation orchestration in SessionScreen.** Keep animations local to components. ManipulativePanel already handles its own spring animation via `expanded` prop. ChatPanel does the same via `isOpen`. SessionScreen just toggles booleans.
- **Anti-pattern: Tracking wrong answers in React state instead of Zustand.** Wrong answer count must persist across chat open/close cycles within the same problem. It must be in tutorSlice (ephemeral but per-problem scoped), not in React component state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State machine framework | Don't import XState or build a generic FSM | Pure function `computeEscalation()` | Only 3 states, 2 transitions. A function is simpler and more testable than a framework. |
| ManipulativePanel animation | Don't build new animation code | Existing `ManipulativePanel` with `expanded` prop | Already has spring animation, toggle button, and correct visual design. Just control the boolean. |
| Chat bottom sheet | Don't build new sheet | Existing `ChatPanel` with `isOpen` prop | Already has spring animation, swipe-to-dismiss, message list, and response buttons. |
| Bug pattern lookup | Don't build separate misconception DB | `ADDITION_BUGS` / `SUBTRACTION_BUGS` arrays already have `id` and `description` | The distractor generator already tags each distractor with `bugId`. Just look up the description. |
| CPA stage resolution | Don't derive CPA from mastery in the hook | `useCpaMode(skillId)` | Already reads persisted cpaLevel from store and resolves manipulativeType. |
| Answer leak detection for BOOST | Don't disable safety pipeline | Modify `buildSystemInstruction()` to permit answer in BOOST mode | The safety pipeline checks the system instruction context. BOOST mode's system instruction explicitly allows answer mention. |

**Key insight:** This phase wires together existing infrastructure far more than it builds new things. The escalation engine is the only truly new logic. Everything else is connecting existing pieces in new configurations.

## Common Pitfalls

### Pitfall 1: Safety Pipeline Blocking BOOST Answer Reveal
**What goes wrong:** BOOST mode sends the correct answer to the LLM, which includes it in the response. The answer-leak detector in `runSafetyPipeline()` catches this and replaces the response with a canned fallback.
**Why it happens:** The safety pipeline was designed for HINT mode where answer leaking is a critical safety violation.
**How to avoid:** BOOST mode must bypass the answer-leak check in `runSafetyPipeline()`. Pass a `mode` parameter to the safety pipeline, or call `validateContent()` without `checkAnswerLeak()` when in BOOST mode. The content validation (sentence length, vocabulary) should still run.
**Warning signs:** BOOST mode responses consistently show canned fallback messages instead of the answer explanation.

### Pitfall 2: Wrong Answer Count Not Tracking Across Chat Sessions
**What goes wrong:** Child answers wrong twice, opens chat, gets 2 hints, closes chat, answers wrong again. But the wrong answer count resets because it was stored in React state that re-initialized.
**Why it happens:** Using `useState` in SessionScreen for wrongAnswerCount instead of tutorSlice.
**How to avoid:** Add `wrongAnswerCount` to tutorSlice. It resets with `resetProblemTutor()` (per-problem) but persists across chat open/close cycles.
**Warning signs:** Child reaches 3+ wrong answers but BOOST mode never triggers.

### Pitfall 3: ManipulativePanel and ChatPanel Fighting for Screen Space
**What goes wrong:** Both ManipulativePanel (50% height) and ChatPanel (60% height) try to be visible simultaneously, covering >100% of screen.
**Why it happens:** TEACH mode opens ManipulativePanel but doesn't minimize ChatPanel.
**How to avoid:** Clear state coordination in SessionScreen: when TEACH triggers ManipulativePanel expansion, ChatPanel transitions to minimized (banner) mode. The banner floats at the top of the screen and doesn't conflict with the bottom-positioned ManipulativePanel.
**Warning signs:** Overlapping panels, manipulative gestures blocked by chat overlay.

### Pitfall 4: BOOST Mode Sending correctAnswer to LLM in PromptParams
**What goes wrong:** PromptParams deliberately excludes correctAnswer. If you add it to PromptParams, you create a risk of accidentally sending the answer in HINT/TEACH modes.
**Why it happens:** Wanting to reuse the same type for all modes.
**How to avoid:** Create a separate `BoostPromptParams` type that extends PromptParams and adds `correctAnswer: number`. Only `buildBoostPrompt()` accepts this type. The type system enforces that HINT/TEACH never see the answer.
**Warning signs:** TypeScript allowing correctAnswer in hint/teach prompt builders.

### Pitfall 5: Escalation Triggering Mid-LLM-Call
**What goes wrong:** Child answers wrong while an LLM hint request is in-flight. The hint response arrives after escalation to TEACH, showing a hint-style message in TEACH mode context.
**Why it happens:** Asynchronous LLM calls and synchronous state updates don't naturally coordinate.
**How to avoid:** Check the current mode when the LLM response arrives (not when the request was sent). If mode has changed since the request, discard the response or re-request with the new mode's prompt. Alternatively, abort in-flight requests when escalation triggers.
**Warning signs:** Socratic hint messages appearing after "Let me show you a different way!" transition message.

### Pitfall 6: Bug Library Lookup Failing Silently
**What goes wrong:** `bugId` from the selected wrong answer option doesn't match any pattern because the lookup code searches the wrong bug array (addition bugs for a subtraction problem).
**Why it happens:** The bugId is just a string; you need to search both `ADDITION_BUGS` and `SUBTRACTION_BUGS`, or use the problem's operation to select the correct array.
**How to avoid:** Create a helper `getBugDescription(bugId: string): string | undefined` that searches both arrays. Or pass the operation to narrow the search.
**Warning signs:** Tutor always falling back to generic CPA walkthrough even when the child selected a bug-library-generated distractor.

## Code Examples

### Bug Library Description Lookup
```typescript
// src/services/tutor/bugLookup.ts
import { ADDITION_BUGS, SUBTRACTION_BUGS } from '@/services/mathEngine/bugLibrary';

const ALL_BUGS = [...ADDITION_BUGS, ...SUBTRACTION_BUGS];

/**
 * Looks up the human-readable description for a bug pattern ID.
 * Returns undefined if the bugId is not found (adjacent/random distractor).
 */
export function getBugDescription(bugId: string | undefined): string | undefined {
  if (!bugId) return undefined;
  return ALL_BUGS.find((b) => b.id === bugId)?.description;
}
```

### TEACH Mode System Instruction Modification
```typescript
// Modified buildSystemInstruction for TEACH mode
// Key differences from HINT:
// - Explicitly instructs to TEACH, not ask Socratic questions
// - References the manipulative type by name
// - CPA-stage language guidance is more directive
function buildTeachSystemInstruction(params: PromptParams): string {
  const wordLimit = WORD_LIMITS[params.ageBracket] ?? 10;
  const cpaGuidance = getCpaLanguageGuidance(params.cpaStage);

  return [
    'You are a friendly Math Helper teaching a child step by step.',
    `Keep sentences under ${wordLimit} words.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent.',
    `The child is at the ${params.cpaStage} stage.`,
    cpaGuidance,
    'TEACHING RULES:',
    '1. Walk through the problem step by step.',
    '2. NEVER reveal the final answer as a digit or word.',
    '3. NEVER compute the final result for the child.',
    '4. Show HOW to solve it, letting the child do the last step.',
    '5. Use only age-appropriate, simple words.',
    '6. Never use sarcasm, irony, or complex humor.',
    '7. Never discuss topics outside math.',
  ].join(' ');
}

function getCpaLanguageGuidance(stage: 'concrete' | 'pictorial' | 'abstract'): string {
  switch (stage) {
    case 'concrete':
      return 'Reference physical objects and blocks. Say things like "put 3 blocks here" and "count them all together".';
    case 'pictorial':
      return 'Reference pictures and diagrams. Say things like "look at the picture" and "count the dots".';
    case 'abstract':
      return 'Use math notation. Say things like "write the numbers in a column" and "add the ones first".';
  }
}
```

### BOOST Mode Prompt (Answer Allowed)
```typescript
// buildBoostPrompt - ONLY function that receives correctAnswer
// Creates a separate BoostPromptParams type for type safety

export interface BoostPromptParams extends PromptParams {
  correctAnswer: number;  // BOOST-only: LLM may reference this
}

export function buildBoostPrompt(params: BoostPromptParams): string {
  const lines: string[] = [
    `The child is working on: ${params.problemText}`,
    `Operation: ${params.operation}`,
    `The correct answer is: ${params.correctAnswer}`,
  ];

  if (params.wrongAnswer !== undefined) {
    lines.push(`The child last answered: ${params.wrongAnswer}`);
  }

  if (params.bugDescription) {
    lines.push(
      `The child may have: ${params.bugDescription}. Address this without naming it directly.`,
    );
  }

  lines.push(
    'Explain the answer with a teaching tone. Show WHY it is correct.',
    'Focus on understanding, not just the number.',
  );

  return lines.join('\n');
}
```

### BOOST System Instruction (Answer Reveal Allowed)
```typescript
function buildBoostSystemInstruction(params: PromptParams): string {
  const wordLimit = WORD_LIMITS[params.ageBracket] ?? 10;

  return [
    'You are a friendly Math Helper explaining a problem to a child.',
    `Keep sentences under ${wordLimit} words.`,
    'Use simple, encouraging language with growth mindset.',
    'Praise effort, not talent.',
    `The child is at the ${params.cpaStage} stage.`,
    'BOOST MODE RULES:',
    '1. You MAY reveal the answer -- the child has struggled enough.',
    '2. Focus on WHY the answer is correct, not just stating it.',
    '3. Break down the steps clearly.',
    '4. Be encouraging -- this is a learning moment, not a failure.',
    '5. Use only age-appropriate, simple words.',
    '6. Never use sarcasm, irony, or complex humor.',
    '7. Never discuss topics outside math.',
  ].join(' ');
}
```

### SessionScreen Wrong Answer Tracking + Escalation
```typescript
// In SessionScreen, when handleAnswer detects wrong answer:
// 1. Increment wrongAnswerCount in tutorSlice
// 2. Find bugId from selected option
// 3. Check if escalation should trigger
// 4. If chat is open, run escalation check

const handleAnswer = useCallback((selectedValue: number) => {
  // ... existing answer handling ...

  if (!isCorrect) {
    incrementWrongAnswerCount(); // New tutorSlice action

    // Find bugId from the selected wrong answer
    const selectedOption = currentProblem.presentation.options.find(
      (o) => o.value === selectedValue,
    );
    const bugId = selectedOption?.bugId;
    const bugDescription = getBugDescription(bugId);

    // Store for tutor prompt context
    setLastBugDescription(bugDescription ?? null); // tutorSlice or React state
    setLastWrongAnswer(selectedValue);
  }
}, [/* deps */]);
```

### ChatBanner (Minimized Chat for TEACH Mode)
```typescript
// src/components/chat/ChatBanner.tsx
// Floating banner at top of screen showing latest tutor message
// Tap to re-expand full ChatPanel

interface ChatBannerProps {
  message: string;
  onTap: () => void;
  visible: boolean;
}

export function ChatBanner({ message, onTap, visible }: ChatBannerProps) {
  // Animated opacity/translateY for enter/exit
  // Position: absolute, top, full width
  // Style: tutor bubble color (#4338ca), rounded bottom corners
  // Single line with ellipsis overflow
  // Tap target: full banner area, minimum 48dp height
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-mode tutors (hint only) | Multi-mode escalation (HINT/TEACH/BOOST) | 2024+ AI tutor research | Adapts to struggle level, prevents frustration |
| Generic "try again" feedback | Misconception-informed explanations via Bug Library | Internal design decision | Targeted remediation instead of guessing |
| LLM computes math | Programmatic engine + LLM for pedagogy only | CLAUDE.md guardrail | Reliable correct answers, LLM focused on teaching |
| One-size-fits-all language | CPA-stage-aware language adaptation | CPA framework integration | Language matches child's conceptual level |

## Open Questions

1. **Rate limit interaction with mode changes**
   - What we know: Rate limits are per-problem (3), per-session (20), per-day (50). Each LLM call increments all three.
   - What's unclear: Should escalation transitions (HINT->TEACH, TEACH->BOOST) count as LLM calls against the rate limit? The transition message is local (not LLM-generated), but the subsequent TEACH/BOOST prompt IS an LLM call.
   - Recommendation: Count only actual LLM calls against rate limits. Transition messages are local strings, not LLM calls. This is already how the system works -- `incrementCallCount()` is called after `callGemini()` succeeds.

2. **BOOST mode and answer-leak safety pipeline**
   - What we know: `runSafetyPipeline()` includes `checkAnswerLeak()` which detects the correct answer as digit or word in the response.
   - What's unclear: Best approach to bypass answer-leak check in BOOST while keeping other checks.
   - Recommendation: Add a `mode` parameter to `runSafetyPipeline()`. When `mode === 'boost'`, skip `checkAnswerLeak()` but still run `validateContent()`. This is the cleanest approach -- the pipeline function signature gains one parameter.

3. **Abstract stage in TEACH mode -- no manipulative to show**
   - What we know: `useCpaMode` returns `manipulativeType: null` for abstract stage. ManipulativePanel has nothing to show.
   - What's unclear: Should TEACH mode in abstract stage skip ManipulativePanel expansion entirely?
   - Recommendation: Yes. TEACH mode for abstract stage delivers chat-only guidance using abstract-level language (math notation, algorithms). No ManipulativePanel expansion. The `shouldExpandManipulative` signal from useTutor should be `false` when `manipulativeType === null`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo + @testing-library/react-native |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npm test -- --testPathPattern=<pattern>` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MODE-02 | TEACH prompt includes CPA-stage language | unit | `npm test -- --testPathPattern=promptTemplates` | Exists (extend) |
| MODE-03 | TEACH triggers ManipulativePanel expansion | unit | `npm test -- --testPathPattern=useTutor` | Wave 0 |
| MODE-04 | BOOST prompt includes correctAnswer, safety pipeline allows it | unit | `npm test -- --testPathPattern=promptTemplates` | Exists (extend) |
| MODE-04 | BOOST answer reveal highlights correct option | unit | `npm test -- --testPathPattern=CpaSessionContent` | Exists (extend) |
| MODE-05 | Escalation state machine transitions correctly | unit | `npm test -- --testPathPattern=escalationEngine` | Wave 0 |
| MODE-06 | Bug description flows into prompt when bugId present | unit | `npm test -- --testPathPattern=promptTemplates` | Exists (extend) |
| MODE-06 | Bug lookup returns description for known IDs | unit | `npm test -- --testPathPattern=bugLookup` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<changed_module>`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/services/tutor/__tests__/escalationEngine.test.ts` -- covers MODE-05
- [ ] `src/services/tutor/__tests__/bugLookup.test.ts` -- covers MODE-06 lookup
- [ ] Extend `src/services/tutor/__tests__/promptTemplates.test.ts` -- covers MODE-02, MODE-04 prompt builders
- [ ] Extend `src/__tests__/store/tutorSlice.test.ts` -- covers wrongAnswerCount field + incrementWrongAnswerCount

## Sources

### Primary (HIGH confidence)
- **Existing codebase** -- All architectural patterns, types, and integration points verified by reading source files directly:
  - `src/store/slices/tutorSlice.ts` -- TutorSlice interface, resetProblemTutor
  - `src/hooks/useTutor.ts` -- Request flow, AbortController pattern, prompt building
  - `src/services/tutor/promptTemplates.ts` -- buildSystemInstruction, buildHintPrompt patterns
  - `src/services/tutor/types.ts` -- PromptParams, TutorMode enum
  - `src/hooks/useCpaMode.ts` -- CpaModeInfo interface, stage/manipulativeType resolution
  - `src/services/mathEngine/bugLibrary/types.ts` -- BugPattern.description, DistractorResult.bugId
  - `src/services/mathEngine/bugLibrary/additionBugs.ts` -- Bug description format examples
  - `src/services/mathEngine/bugLibrary/subtractionBugs.ts` -- Bug description format examples
  - `src/components/chat/ChatPanel.tsx` -- Panel structure, ResponseButtons integration
  - `src/components/chat/ResponseButtons.tsx` -- ResponseType union, button layout
  - `src/components/session/ManipulativePanel.tsx` -- expanded prop, spring animation
  - `src/components/session/CpaSessionContent.tsx` -- Panel coordination, chatOpen prop, answer grid
  - `src/components/session/CompactAnswerRow.tsx` -- Answer button feedback styles
  - `src/screens/SessionScreen.tsx` -- Full integration point, handleAnswer, handleResponse
  - `src/services/tutor/safetyFilter.ts` -- runSafetyPipeline entry point
  - `src/services/tutor/safetyConstants.ts` -- getCannedFallback, answer-leak detection

### Secondary (MEDIUM confidence)
- `.planning/research/FEATURES.md` -- Feature landscape confirming three-mode escalation design, Bug Library integration plan
- `.planning/phases/24-teach-boost-auto-escalation/24-CONTEXT.md` -- All locked decisions and implementation specifics

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all libraries already installed and verified in codebase
- Architecture: HIGH - Extending established patterns (pure function services, Zustand slices, hook composition, prompt templates). All integration points verified by reading source code.
- Pitfalls: HIGH - Identified from direct code analysis (safety pipeline will block BOOST, panel overlap, type safety for correctAnswer)
- Escalation logic: HIGH - Simple 3-state machine with 2 transitions. Pure function, easy to test exhaustively.

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable -- internal architecture, no external API changes)
