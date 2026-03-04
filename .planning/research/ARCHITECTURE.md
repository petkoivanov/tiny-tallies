# Architecture Patterns: AI Tutor Integration

**Domain:** AI-powered math tutoring with LLM (Gemini) integration into existing React Native adaptive learning app
**Researched:** 2026-03-03
**Confidence:** HIGH (verified against existing codebase structure, @google/genai SDK docs, prior research docs)

---

## Recommended Architecture

### System Overview

The v0.5 AI Tutor grafts an LLM-powered conversational tutor onto the existing v0.4 session infrastructure. The integration is **additive** -- existing session, store, and manipulative code remains unchanged. New code creates a parallel conversation layer that reads from (but never writes to) existing session/skill state.

```
+----------------------------------------------------------------------+
|                        NAVIGATION LAYER                              |
|                                                                      |
|  +--------+  +-------------------+  +---------+  +---------+        |
|  | Home   |  | Session Screen    |  | Results |  | Sandbox |        |
|  | Screen |  |                   |  | Screen  |  | Screen  |        |
|  +--------+  |  +-------------+  |  +---------+  +---------+        |
|              |  |CpaSession   |  |                                   |
|              |  |Content      |  |                                   |
|              |  +------+------+  |                                   |
|              |         |         |                                   |
|              |  +------v------+  |                                   |
|              |  | NEW: Tutor  |  |                                   |
|              |  | ChatPanel   |  |                                   |
|              |  +------+------+  |                                   |
|              |         |         |                                   |
|              |  +------v------+  |                                   |
|              |  | Manipulative|  |                                   |
|              |  | Panel       |  |                                   |
|              |  +-------------+  |                                   |
|              +-------------------+                                   |
+----------------------------------------------------------------------+

+----------------------------------------------------------------------+
|                         HOOKS LAYER                                  |
|                                                                      |
|  useSession (existing)    useTutor (NEW)     useCpaMode (existing)   |
|  - session queue          - chat messages     - CPA stage            |
|  - answer handling        - LLM streaming     - manipulative type    |
|  - Elo/BKT updates        - mode escalation                         |
|  - feedback timing        - abort cleanup                            |
+----------------------------------------------------------------------+

+----------------------------------------------------------------------+
|                       SERVICES LAYER                                 |
|                                                                      |
|  src/services/tutor/ (NEW)         src/services/ (existing)          |
|  +---------------------------+     +----------------------------+    |
|  | geminiClient.ts           |     | mathEngine/                |    |
|  | - GoogleGenAI singleton   |     | - problem generation       |    |
|  | - chat session factory    |     | - bug library              |    |
|  |                           |     |                            |    |
|  | promptTemplates.ts        |     | adaptive/                  |    |
|  | - system instructions     |     | - BKT, Elo, Leitner       |    |
|  | - HINT/TEACH/BOOST prompts|     |                            |    |
|  |                           |     | session/                   |    |
|  | tutorOrchestrator.ts      |     | - queue generation         |    |
|  | - mode selection logic    |     | - session orchestrator     |    |
|  | - escalation rules        |     |                            |    |
|  | - context assembly        |     | cpa/                       |    |
|  |                           |     | - CPA mapping              |    |
|  | tutorTypes.ts             |     | - guided steps             |    |
|  | - TutorMode, ChatMessage  |     | - skill-manipulative map   |    |
|  | - TutorContext, etc.      |     +----------------------------+    |
|  +---------------------------+                                       |
+----------------------------------------------------------------------+

+----------------------------------------------------------------------+
|                        STORE LAYER                                   |
|                                                                      |
|  appStore.ts (existing)         tutorSlice.ts (NEW)                  |
|  - childProfileSlice            - chat messages per problem          |
|  - skillStatesSlice             - current tutor mode                 |
|  - sessionStateSlice            - hint level counter                 |
|  - gamificationSlice            - tutor active flag                  |
|  - sandboxSlice                 - loading/error state                |
|                                                                      |
|  NOTE: tutorSlice is EPHEMERAL -- not persisted to AsyncStorage.     |
|  Chat resets per-problem. No migration needed.                       |
+----------------------------------------------------------------------+
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Tutor state is ephemeral (not persisted) | Chat resets per-problem; no value in persisting partial conversations across app restarts |
| TutorSlice in Zustand (not just local state) | Multiple components need chat state: ChatPanel reads messages, CpaSessionContent reads mode for panel control, SessionScreen reads loading state |
| Gemini client as singleton service | One API key, one client instance. Avoids re-initialization overhead. Matches existing service pattern (pure functions in services, not hooks) |
| `ai.models.generateContentStream` over `ai.chats` | Manual history management gives explicit control over context window, prompt injection, and per-problem reset. The `ai.chats` convenience API adds opacity we do not want |
| Streaming responses | Children see text appearing word-by-word, reducing perceived latency. Critical for 6-9 age group attention spans |
| AbortController per request | CLAUDE.md mandates defense-in-depth cleanup. Every LLM call must be cancellable on unmount/problem-advance/quit |
| Prompt templates as pure functions | Deterministic, testable, no side effects. Bug Library context and CPA stage are function parameters, not runtime lookups |
| Tutor never writes to skillStatesSlice | Tutor is read-only against adaptive state. Only useSession's handleAnswer writes Elo/BKT/Leitner updates. Clean separation of concerns |

---

## Component Boundaries

### New Components

| Component | Location | Responsibility | Communicates With |
|-----------|----------|---------------|-------------------|
| `TutorChatPanel` | `src/components/session/TutorChatPanel.tsx` | Chat bubble UI overlay, message list, streaming text display | useTutor hook, tutorSlice |
| `TutorHelpButton` | `src/components/session/TutorHelpButton.tsx` | "Need help?" FAB that initiates tutor conversation | useTutor hook |
| `ChatBubble` | `src/components/session/chat/ChatBubble.tsx` | Individual message bubble (child vs tutor styling) | TutorChatPanel |
| `StreamingText` | `src/components/session/chat/StreamingText.tsx` | Renders text as it streams from LLM, character by character | ChatBubble |

### New Services

| Service | Location | Responsibility | Communicates With |
|---------|----------|---------------|-------------------|
| `geminiClient` | `src/services/tutor/geminiClient.ts` | GoogleGenAI singleton, `sendMessage()` with streaming + abort | promptTemplates, tutorOrchestrator |
| `promptTemplates` | `src/services/tutor/promptTemplates.ts` | Pure functions that build system instructions + user prompts per mode | geminiClient |
| `tutorOrchestrator` | `src/services/tutor/tutorOrchestrator.ts` | Mode selection (HINT/TEACH/BOOST), escalation logic, context assembly | geminiClient, promptTemplates, Bug Library |
| `tutorTypes` | `src/services/tutor/tutorTypes.ts` | All tutor-related TypeScript types | Everything in tutor/ |

### New Hook

| Hook | Location | Responsibility | Communicates With |
|------|----------|---------------|-------------------|
| `useTutor` | `src/hooks/useTutor.ts` | Chat lifecycle, LLM calls, abort cleanup, mode state | tutorOrchestrator, geminiClient, tutorSlice, useSession data |

### New Store Slice

| Slice | Location | Responsibility |
|-------|----------|---------------|
| `tutorSlice` | `src/store/slices/tutorSlice.ts` | Chat messages, tutor mode, hint level, loading/error, active flag |

### Modified Components (minimal changes)

| Component | What Changes | Why |
|-----------|-------------|-----|
| `CpaSessionContent` | Add `TutorHelpButton` + `TutorChatPanel` to render tree | Tutor UI lives inside session content |
| `SessionScreen` | Pass problem/skill context to useTutor | Tutor needs current problem data |
| `appStore.ts` | Add tutorSlice to composition, bump STORE_VERSION only if persisting (likely not needed) | New slice registration |

---

## Data Flow

### Flow 1: Child Taps "Help" Button

```
1. Child taps TutorHelpButton
   |
2. useTutor.startTutor() called
   |
3. tutorOrchestrator.determineMode() reads:
   |-- current problem (from useSession)
   |-- hint level (from tutorSlice: 0 = first help)
   |-- child's wrong answer (from sessionStateSlice.sessionAnswers)
   |-- bug ID of wrong answer (from SessionAnswer.bugId)
   |-- CPA stage (from useCpaMode)
   |-- child age (from childProfileSlice)
   |
4. Returns TutorMode: HINT (level 1) for first help request
   |
5. promptTemplates.buildHintPrompt() assembles:
   |-- System instruction (safety rules, age-appropriate language)
   |-- Problem context (operands, operation, correct answer)
   |-- Child's wrong answer + matched bug description
   |-- Hint level instructions (Socratic, never reveal)
   |-- Previous hints in conversation (for continuity)
   |
6. geminiClient.sendMessage() called with:
   |-- assembled prompt
   |-- conversation history
   |-- AbortSignal from controller
   |
7. Streaming response chunks update tutorSlice.messages[]
   |-- Each chunk: dispatch addStreamChunk(text)
   |-- UI re-renders incrementally via ChatBubble + StreamingText
   |
8. On stream complete: tutorSlice.setLoading(false)
```

### Flow 2: Auto-Escalation (HINT -> TEACH -> BOOST)

```
Wrong answer #1 + tap Help -> HINT level 1 (Socratic nudge)
  |
Wrong answer #2 + tap Help -> HINT level 2 (suggest manipulatives)
  |-- tutorOrchestrator detects hintLevel >= 2
  |-- prompt includes "Suggest using [manipulative type]"
  |-- TutorChatPanel emits onSuggestManipulative event
  |-- CpaSessionContent expands ManipulativePanel
  |
Wrong answer #3 + tap Help -> BOOST (deep scaffolding)
  |-- tutorOrchestrator detects hintLevel >= 3
  |-- Mode switches to BOOST
  |-- Prompt: "Walk through from first principles"
  |-- May reveal answer WITH full explanation
  |-- Includes follow-up practice suggestion
```

### Flow 3: TEACH Mode (Proactive on New Skill)

```
1. Session enters a problem for a NEW skill (category === 'new' from practiceMix)
   |
2. CPA stage is 'concrete' (BKT mastery < 0.40)
   |
3. CpaSessionContent renders ManipulativePanel auto-expanded (existing behavior)
   |
4. TutorHelpButton shows with enhanced prompt: "Want me to explain?"
   |
5. On tap: tutorOrchestrator.determineMode() returns TEACH
   |-- because: first encounter with this skill + concrete CPA
   |
6. promptTemplates.buildTeachPrompt() assembles CPA walkthrough
   |-- References the specific manipulative visible on screen
   |-- Walks through concept step by step
```

### Flow 4: Problem Advance (Chat Reset)

```
1. useSession advances to next problem (currentIndex++)
   |
2. useTutor detects problem change via useEffect dependency
   |
3. Abort in-flight LLM request:
   |-- abortControllerRef.current.abort()
   |-- Create new AbortController for next problem
   |
4. Reset tutorSlice:
   |-- clearMessages()
   |-- resetHintLevel()
   |-- setMode(null)
   |-- setActive(false)
```

### Flow 5: Session Quit/Complete

```
1. useSession.handleQuit() or session completes
   |
2. useTutor cleanup runs (useEffect return):
   |-- abortControllerRef.current.abort()
   |
3. tutorSlice resets (ephemeral, no persistence needed)
```

---

## Detailed Component Designs

### TutorSlice (New Zustand Slice)

```typescript
// src/store/slices/tutorSlice.ts

export type TutorMode = 'hint' | 'teach' | 'boost';

export interface ChatMessage {
  id: string;
  role: 'child' | 'tutor';
  text: string;
  /** True while streaming is in progress for this message */
  isStreaming: boolean;
  timestamp: number;
}

export interface TutorSlice {
  // State
  tutorActive: boolean;
  tutorMode: TutorMode | null;
  hintLevel: number;  // 0 = no hints yet, 1-3 = escalation
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  activateTutor: (mode: TutorMode) => void;
  deactivateTutor: () => void;
  addChildMessage: (text: string) => void;
  addTutorMessage: (id: string) => void;
  appendToTutorMessage: (id: string, chunk: string) => void;
  finalizeTutorMessage: (id: string) => void;
  incrementHintLevel: () => void;
  resetForNewProblem: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

**Critical design choice:** `chatMessages` is an array, not a Map. React re-renders on array reference change (spread). Map mutations do not trigger re-renders in Zustand without extra work.

**Not persisted:** The `partialize` function in `appStore.ts` already controls what gets persisted. TutorSlice fields simply will not be listed in `partialize`, so they reset on app restart. No STORE_VERSION bump needed.

### Gemini Client Service

```typescript
// src/services/tutor/geminiClient.ts

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// Zod validation at system boundary (per CLAUDE.md)
const GeminiResponseSchema = z.object({
  text: z.string().min(1),
});

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    // API key from expo-secure-store (per CLAUDE.md: don't bypass secure store)
    const apiKey = getApiKeyFromSecureStore();
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export interface SendMessageOptions {
  systemInstruction: string;
  conversationHistory: Array<{ role: 'user' | 'model'; text: string }>;
  userMessage: string;
  abortSignal: AbortSignal;
  onChunk: (text: string) => void;
}

export async function sendTutorMessage(options: SendMessageOptions): Promise<string> {
  const ai = getClient();

  const contents = [
    ...options.conversationHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    { role: 'user' as const, parts: [{ text: options.userMessage }] },
  ];

  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: options.systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 200, // Short responses for children
      abortSignal: options.abortSignal,
    },
  });

  let fullText = '';
  for await (const chunk of stream) {
    if (options.abortSignal.aborted) break;
    const text = chunk.text ?? '';
    fullText += text;
    options.onChunk(text);
  }

  // Validate at boundary
  GeminiResponseSchema.parse({ text: fullText });
  return fullText;
}
```

**Model choice: `gemini-2.5-flash`** because:
- 232 tokens/sec output speed, 0.51s time-to-first-token
- Lowest cost at $0.30/M input, $2.50/M output (children's app = cost-sensitive)
- Thinking can be disabled for maximum speed (children's hints do not need reasoning traces)
- Sufficient quality for age-appropriate language generation
- Already in the Google GenAI ecosystem matching `@google/genai` package

**Max 200 output tokens** because:
- Research doc specifies max 2-3 sentences for hints
- Children ages 6-9 cannot process long text blocks
- Limits cost per interaction
- Forces LLM to be concise

### Prompt Template Architecture

```typescript
// src/services/tutor/promptTemplates.ts

import type { Problem } from '../mathEngine/types';
import type { CpaStage, ManipulativeType } from '../cpa/cpaTypes';
import type { BugPattern } from '../mathEngine/bugLibrary/types';
import type { TutorMode } from './tutorTypes';

interface PromptContext {
  problem: Problem;
  childAge: number;
  cpaStage: CpaStage;
  manipulativeType: ManipulativeType | null;
}

interface HintContext extends PromptContext {
  childAnswer: number;
  bugId: string | undefined;
  bugDescription: string | undefined;
  hintLevel: 1 | 2 | 3;
  previousHints: string[];
}

interface TeachContext extends PromptContext {
  conceptDescription: string;
}

interface BoostContext extends PromptContext {
  childAnswer: number;
  bugId: string | undefined;
  bugDescription: string | undefined;
  previousHints: string[];
}

// System instruction is CONSTANT across all modes.
// This is the safety guardrail layer.
export function buildSystemInstruction(childAge: number): string {
  return `You are a friendly, encouraging math tutor helping a ${childAge}-year-old child.

CRITICAL RULES:
1. NEVER compute math yourself. Use ONLY the provided correct_answer.
2. NEVER reveal the answer in a hint. Guide through questions ONLY.
3. NEVER say "wrong", "incorrect", or "no." Say "let's try again" or "hmm, not quite."
4. NEVER use negative language about the child's ability.
5. ALWAYS praise effort ("Great thinking!" not "You're so smart!").
6. Use sentences of ${childAge <= 7 ? 8 : childAge <= 8 ? 10 : 12} words or fewer.
7. Use only words a ${childAge}-year-old knows.
8. Maximum 3 sentences per response.
9. Use gender-neutral examples. No allergen food. No scary contexts.
10. If you suggest a manipulative, name it specifically (blocks, number line, etc.).`;
}

export function buildHintPrompt(ctx: HintContext): string { /* ... */ }
export function buildTeachPrompt(ctx: TeachContext): string { /* ... */ }
export function buildBoostPrompt(ctx: BoostContext): string { /* ... */ }
```

**Pure functions, fully testable.** Each takes a typed context object, returns a string. No side effects, no async, no store dependency. The Bug Library description is passed in as a string parameter -- the prompt template does not import from bugLibrary directly, keeping the dependency direction clean.

### Tutor Orchestrator

```typescript
// src/services/tutor/tutorOrchestrator.ts

import type { TutorMode } from './tutorTypes';
import type { SessionAnswer } from '../../store/slices/sessionStateSlice';
import type { CpaStage } from '../cpa/cpaTypes';
import type { PracticeProblemCategory } from '../session/sessionTypes';

interface EscalationContext {
  currentHintLevel: number;
  wrongAnswerCount: number;  // for current problem
  cpaStage: CpaStage;
  problemCategory: PracticeProblemCategory;
  isFirstEncounter: boolean;  // first time seeing this skill
}

/**
 * Determines tutor mode based on escalation context.
 * Pure function -- no side effects.
 */
export function determineMode(ctx: EscalationContext): TutorMode {
  // TEACH: new skill at concrete level, child hasn't answered yet
  if (ctx.isFirstEncounter && ctx.cpaStage === 'concrete') {
    return 'teach';
  }

  // BOOST: 3+ wrong answers on same problem
  if (ctx.wrongAnswerCount >= 3 || ctx.currentHintLevel >= 3) {
    return 'boost';
  }

  // HINT: default for wrong answers
  return 'hint';
}

/**
 * Resolves bug description from bug ID for prompt context.
 */
export function resolveBugDescription(bugId: string | undefined): string | undefined {
  // Looks up from ADDITION_BUGS + SUBTRACTION_BUGS
  // Returns human-readable description
}
```

### useTutor Hook

```typescript
// src/hooks/useTutor.ts

export interface UseTutorReturn {
  // State
  isActive: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  currentMode: TutorMode | null;
  error: string | null;

  // Actions
  requestHelp: () => Promise<void>;
  dismissTutor: () => void;

  // Signals for parent components
  shouldExpandManipulative: boolean;
  suggestedManipulativeType: ManipulativeType | null;
}
```

**AbortController pattern (defense-in-depth per CLAUDE.md):**

```typescript
export function useTutor(
  currentProblem: SessionProblem | null,
  currentIndex: number,
  sessionAnswers: SessionAnswer[],
): UseTutorReturn {
  const abortControllerRef = useRef<AbortController>(new AbortController());

  // Reset on problem change (explicit handler)
  useEffect(() => {
    // Abort any in-flight request from previous problem
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    // Reset tutor state
    resetForNewProblem();
  }, [currentIndex]);

  // Defense-in-depth: abort on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const requestHelp = useCallback(async () => {
    const controller = abortControllerRef.current;
    if (controller.signal.aborted) return;

    setLoading(true);
    const messageId = generateId();
    addTutorMessage(messageId);

    try {
      await sendTutorMessage({
        systemInstruction: buildSystemInstruction(childAge),
        conversationHistory: buildHistory(messages),
        userMessage: buildPrompt(context),
        abortSignal: controller.signal,
        onChunk: (text) => {
          if (!controller.signal.aborted) {
            appendToTutorMessage(messageId, text);
          }
        },
      });
      finalizeTutorMessage(messageId);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Expected on problem advance or unmount -- not an error
        return;
      }
      setError('Something went wrong. Try again!');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [/* deps */]);

  // Signal to CpaSessionContent: expand manipulative panel
  const shouldExpandManipulative =
    currentMode === 'teach' ||
    (currentMode === 'hint' && hintLevel >= 2) ||
    currentMode === 'boost';

  return { /* ... */ };
}
```

### TutorChatPanel (UI Component)

```
+------------------------------------------+
| [x]  Math Helper                         |  <- header with dismiss
|------------------------------------------|
|  +------------------------------------+  |
|  |  [tutor bubble]                    |  |
|  |  "Let's think about 7 + 8.        |  |
|  |   How many more do we need         |  |
|  |   to make 10?"                     |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |            [child bubble]          |  |
|  |            "I need help"           |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  [tutor bubble, streaming...]      |  |
|  |  "Great thinking! We know 7 + 3    |  |
|  |   makes 10. So we take 3 fro..."  |  |
|  +------------------------------------+  |
|                                          |
|  [More help]                             |  <- escalation button
+------------------------------------------+
```

**UI placement:** The TutorChatPanel renders as an overlay **between** the problem text and the ManipulativePanel (or answer buttons). It does NOT use a Modal (same rationale as ManipulativePanel -- gesture conflicts). It uses `Animated.View` with spring slide-in, matching ManipulativePanel's animation style.

**Height:** Takes up to 40% of screen height when active, pushing answer buttons into CompactAnswerRow mode (same pattern used by ManipulativePanel in concrete mode).

**FlatList for messages:** Uses standard `FlatList` (not FlashList -- chat messages are typically <10 items, no virtualization benefit, and avoids FlashList v1.x complexity for trivial list).

### Integration with CpaSessionContent

The existing `CpaSessionContent` component is the natural integration point. Changes are minimal:

```
Current CpaSessionContent layout:
  [Problem Text]
  [Pictorial Diagram?]     (pictorial mode)
  [Need Help Button?]      (pictorial mode)  <-- REPURPOSE for tutor
  [Answer Buttons]
  [Guided Hint Text?]      (concrete mode)
  [Manipulative Panel?]    (concrete/pictorial)

New CpaSessionContent layout:
  [Problem Text]
  [Pictorial Diagram?]     (pictorial mode)
  [TutorHelpButton]        (ALL modes -- replaces "Need help?")
  [TutorChatPanel?]        (when tutor active)
  [Answer Buttons]         (CompactAnswerRow when panel/chat active)
  [Guided Hint Text?]      (concrete mode)
  [Manipulative Panel?]    (concrete/pictorial + tutor-triggered)
```

**Key change:** The existing "Need help?" button (`needHelpButton` in pictorial mode) becomes `TutorHelpButton` that works in ALL CPA modes. In pictorial/abstract modes, it was previously a manipulative scaffold. Now it launches the AI tutor instead, which may ALSO trigger the manipulative panel (when tutor suggests it).

### Integration with ManipulativePanel

The tutor does NOT directly control the ManipulativePanel. Instead:

1. `useTutor` exposes `shouldExpandManipulative: boolean` and `suggestedManipulativeType: ManipulativeType | null`
2. `CpaSessionContent` reads these values and sets `panelExpanded` accordingly
3. This preserves the existing panel toggle logic -- tutor suggests, CpaSessionContent decides

```typescript
// In CpaSessionContent (modified):
const { shouldExpandManipulative, suggestedManipulativeType } = useTutor(/*...*/);

useEffect(() => {
  if (shouldExpandManipulative && !panelExpanded) {
    setPanelExpanded(true);
  }
}, [shouldExpandManipulative]);
```

This means TEACH mode at hint level 2+ opens the manipulative panel with a chat message like "Let's use our blocks! Put 7 blocks here..." while the actual blocks are visible below.

---

## Patterns to Follow

### Pattern 1: Service Singleton with Lazy Init

**What:** GoogleGenAI client created once, lazily, cached in module scope.
**When:** Any service that wraps an external SDK with expensive initialization.
**Why:** Matches existing codebase pattern (services are pure modules, not classes/hooks).

```typescript
// src/services/tutor/geminiClient.ts
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return client;
}
```

### Pattern 2: Ephemeral Zustand Slice (No Persistence)

**What:** Store slice that is excluded from `partialize`, resetting on app restart.
**When:** UI state that has no value across sessions (chat messages, loading flags).
**Why:** The existing `partialize` in `appStore.ts` already controls persistence. Simply not listing tutorSlice fields means they auto-reset. No migration needed.

```typescript
// In appStore.ts partialize -- tutorSlice fields NOT listed:
partialize: (state) => ({
  childName: state.childName,
  childAge: state.childAge,
  // ... existing fields only
  // tutorActive, chatMessages, etc. intentionally OMITTED
}),
```

### Pattern 3: Streaming Chunk Accumulation

**What:** Stream LLM chunks into a Zustand message object, updating text incrementally.
**When:** Any streaming text UI that needs React re-renders per chunk.

```typescript
// In tutorSlice:
appendToTutorMessage: (id, chunk) =>
  set((state) => ({
    chatMessages: state.chatMessages.map((msg) =>
      msg.id === id
        ? { ...msg, text: msg.text + chunk }
        : msg
    ),
  })),
```

**Performance note:** This creates a new array on every chunk (~5-20 per response). Acceptable because chat has <10 messages and chunks arrive at ~50ms intervals. No optimization needed.

### Pattern 4: AbortController Per-Request with Defense-in-Depth

**What:** Create a new AbortController for each LLM request. Abort on problem advance AND on unmount.
**When:** Any async operation that must be cancellable.
**Why:** CLAUDE.md mandates this pattern. The existing codebase does not yet use AbortController (no async external calls until now), so this establishes the precedent.

```typescript
// Two-layer cleanup:

// Layer 1: Explicit abort on problem change
useEffect(() => {
  abortControllerRef.current.abort();
  abortControllerRef.current = new AbortController();
  resetForNewProblem();
}, [currentIndex]);

// Layer 2: Abort on unmount (defense-in-depth)
useEffect(() => {
  return () => {
    abortControllerRef.current.abort();
  };
}, []);
```

### Pattern 5: Pure Prompt Templates with Typed Contexts

**What:** Prompt construction as pure functions taking typed context objects.
**When:** Any LLM prompt that needs to be testable and deterministic.

```typescript
// testable:
expect(buildHintPrompt({
  problem: mockProblem,
  childAge: 7,
  childAnswer: 14,
  hintLevel: 2,
  // ...
})).toContain('Suggest using');
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: LLM Computes Math

**What:** Asking Gemini to compute answers, verify answers, or generate problems.
**Why bad:** LLMs are unreliable at arithmetic (especially carry/borrow). The entire hybrid architecture exists to prevent this. CLAUDE.md explicitly forbids it.
**Instead:** Always pass `correctAnswer` from the programmatic math engine into the prompt. The LLM references it but never computes it.

### Anti-Pattern 2: Tutor Writes to Skill State

**What:** Having the tutor update Elo, BKT, or Leitner state based on hint interactions.
**Why bad:** Breaks the commit-on-complete pattern. Session results are accumulated in refs and committed atomically. If tutor modified skill state mid-session, quit-discard semantics break.
**Instead:** Tutor reads from store (via selectors), never writes. Hint usage could be tracked in analytics later, but not in adaptive state.

### Anti-Pattern 3: Modal for Chat UI

**What:** Rendering TutorChatPanel inside a `<Modal>`.
**Why bad:** Same reason ManipulativePanel avoids Modal -- gesture conflicts with react-native-gesture-handler. The ManipulativePanel may be open simultaneously with the chat panel. Nested modals break on Android.
**Instead:** Use an `Animated.View` overlay within the component tree, exactly like ManipulativePanel.

### Anti-Pattern 4: Full Conversation History to LLM

**What:** Sending all messages from every hint level as conversation history.
**Why bad:** Context window waste. Children's tutoring conversations are at most 3-6 messages. But including ALL system prompts repeated per-message inflates token count.
**Instead:** Send system instruction once (via `config.systemInstruction`). Send only the actual conversation turns as `contents`. Cap at last 6 messages.

### Anti-Pattern 5: Persisting Chat Messages

**What:** Adding chatMessages to the `partialize` function.
**Why bad:** Chat resets per-problem by design. Persisting creates stale state on app restart (the session is gone but old chat messages remain). Also requires migration when schema changes.
**Instead:** Ephemeral slice. Let it reset naturally.

### Anti-Pattern 6: Creating AbortController in Render

**What:** `const controller = new AbortController()` inside the component body.
**Why bad:** Creates a new controller on every render, losing the reference to abort in-flight requests.
**Instead:** Store in `useRef` and manage explicitly.

---

## File Structure

```
src/
  services/
    tutor/
      index.ts                    # Barrel exports
      tutorTypes.ts               # TutorMode, ChatMessage, prompt context types
      geminiClient.ts             # GoogleGenAI singleton, sendTutorMessage()
      promptTemplates.ts          # System instruction + per-mode prompt builders
      tutorOrchestrator.ts        # Mode determination, escalation logic
  store/
    slices/
      tutorSlice.ts               # Ephemeral chat state slice
  hooks/
    useTutor.ts                   # Chat lifecycle, abort cleanup
  components/
    session/
      TutorHelpButton.tsx         # FAB to initiate tutor
      TutorChatPanel.tsx          # Chat overlay with message list
      chat/
        ChatBubble.tsx            # Individual message bubble
        StreamingText.tsx         # Animated streaming text display
        index.ts                  # Barrel exports
```

Estimated file count: 10 new files, 2-3 modified files.
All new files target <500 lines (per CLAUDE.md).

---

## Connectivity Handling

The AI tutor requires network connectivity. The app already has `@react-native-community/netinfo` in dependencies.

```typescript
// In useTutor, before making LLM call:
import NetInfo from '@react-native-community/netinfo';

const requestHelp = useCallback(async () => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    setError('Connect to the internet to use the helper!');
    return;
  }
  // ... proceed with LLM call
}, []);
```

The tutor button remains visible but shows a friendly offline message. Core practice (problem generation, answer checking, Elo/BKT updates) continues working offline as designed.

---

## Scalability Considerations

| Concern | Current (v0.5) | At Scale |
|---------|----------------|----------|
| Token cost | ~200 tokens/response, ~3 responses/session = 600 tokens/session | Rate limiting per child per day; cost caps in API config |
| Latency | Streaming masks TTFT (0.51s for 2.5 Flash) | Acceptable; pre-fetch not needed for child-initiated |
| Conversation length | Max 6 messages per problem, resets | No context window concern |
| Concurrent requests | 1 at a time (abort previous) | No concurrency issues |
| API key management | expo-secure-store, single key | Future: per-user auth tokens via backend proxy |

---

## Build Order (Dependency-Aware)

```
Phase 1: Types + Service Layer (no UI dependencies)
  1. tutorTypes.ts           -- all types, no imports from new code
  2. promptTemplates.ts      -- pure functions, imports only types + mathEngine types
  3. tutorOrchestrator.ts    -- pure functions, imports tutorTypes + bugLibrary types
  4. geminiClient.ts         -- imports @google/genai + tutorTypes + Zod

Phase 2: Store Layer (depends on types)
  5. tutorSlice.ts           -- imports tutorTypes, follows existing slice pattern
  6. appStore.ts             -- minimal change: add tutorSlice to composition

Phase 3: Hook Layer (depends on services + store)
  7. useTutor.ts             -- composes services + store + AbortController

Phase 4: UI Layer (depends on hook)
  8. ChatBubble.tsx          -- pure presentational
  9. StreamingText.tsx        -- animated text display
  10. TutorChatPanel.tsx      -- composes ChatBubble + StreamingText
  11. TutorHelpButton.tsx     -- simple Pressable
  12. CpaSessionContent.tsx   -- integrate TutorHelpButton + TutorChatPanel
```

This order ensures each layer is testable independently before integration. Services can be unit-tested with mock data. The hook can be tested with mock services. UI components can be tested with mock hook returns.

---

## Sources

- [Existing codebase analysis] -- all file references verified against actual source
- [@google/genai npm package](https://www.npmjs.com/package/@google/genai) -- v1.30.0+ (installed), v1.43.0 latest
- [@google/genai SDK docs](https://googleapis.github.io/js-genai/release_docs/index.html) -- API reference
- [GenerateContentConfig interface](https://googleapis.github.io/js-genai/release_docs/interfaces/types.GenerateContentConfig.html) -- abortSignal support confirmed
- [Gemini 2.5 Flash performance](https://artificialanalysis.ai/models/gemini-2-5-flash) -- 232 tok/s, 0.51s TTFT
- [Project research: 03-ai-tutoring-engine.md] -- three-mode tutor design, prompt templates, safety guardrails
- [Project research: 05-misconception-detection.md] -- Bug Library integration with tutor
