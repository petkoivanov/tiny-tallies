# Architecture Research

**Domain:** High school math expansion (K-12) — integrating 9 HS domains + YouTube video hints into existing React Native adaptive math engine
**Researched:** 2026-03-12
**Confidence:** HIGH — based on direct codebase inspection of all integration points

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UI Layer                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────────┐   │
│  │  NumberPad     │  │  ChatPanel     │  │  PlacementTestScreen    │   │
│  │  + `-` key     │  │  + VideoCard   │  │  + MAX_GRADE=12          │   │
│  │  MODIFY        │  │  MODIFY + NEW  │  │  MODIFY                  │   │
│  └───────┬────────┘  └───────┬────────┘  └────────────┬────────────┘   │
│          │                   │                         │                │
│  ┌───────┴──────────────────────────────────────────────────────────┐  │
│  │             MultiSelectMC (NEW — checkboxes + Check button)       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                              Hook Layer                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  useTutor — MODIFY: expose videoId when ladderExhausted + domain   │ │
│  │             has a mapped video; no new API call, computed locally   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                            Service Layer                                 │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │  mathEngine/                   │  │  tutor/                        │ │
│  │    types.ts — ADD              │  │    videoMap.ts — NEW           │ │
│  │      MultiSelectAnswer         │  │      DOMAIN_VIDEO_MAP          │ │
│  │      Grade 9|10|11|12          │  │      getVideoForDomain()       │ │
│  │      MathDomain + 9 values     │  │    promptTemplates.ts (keep)   │ │
│  │    domains/registry.ts — ADD   │  │    safetyFilter.ts (keep)      │ │
│  │      9 new handler entries     │  └────────────────────────────────┘ │
│  │    domains/*.ts — NEW (×9)     │                                     │
│  └────────────────────────────────┘                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                           Store Layer (Zustand, STORE_VERSION=21 now)    │
│  ┌────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│  │  tutorSlice        │  │  onboardingSlice     │  │  childProfile   │  │
│  │  + videoVotes map  │  │  (placementGrade     │  │  Slice          │  │
│  │  + voteVideo()     │  │   already number,    │  │  Grade field    │  │
│  │  MODIFY            │  │   no change)         │  │  type → 1-12   │  │
│  └────────────────────┘  └─────────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Status for v1.2 |
|-----------|----------------|-----------------|
| `src/services/mathEngine/types.ts` | Answer discriminated union, Grade type, DomainHandler interface, MathDomain | MODIFY — add MultiSelectAnswer, extend Grade to 9-12, add 9 MathDomain values |
| `src/services/mathEngine/domains/registry.ts` | Maps MathDomain → DomainHandler | MODIFY — register 9 new handlers |
| `src/services/mathEngine/domains/*.ts` (×9) | Per-domain problem generators | ADD — 9 new domain files |
| `src/components/session/NumberPad.tsx` | Custom keypad for numeric free-text answers | MODIFY — add `-` key (prop-gated: `showNegative?: boolean`) |
| `src/components/session/MultiSelectMC.tsx` | Checkbox-style MC for MultiSelectAnswer problems | ADD — new component |
| `src/screens/PlacementTestScreen.tsx` | Staircase placement algorithm | MODIFY — `MAX_GRADE = 12`; no algorithm change |
| `src/services/tutor/videoMap.ts` | Domain → YouTube videoId curated map | ADD — new file |
| `src/components/chat/VideoCard.tsx` | YouTube video embed (react-native-youtube-iframe) | ADD — new component |
| `src/components/chat/ChatPanel.tsx` | Tutor bottom sheet | MODIFY — accept `videoId?: string | null` prop, render VideoCard |
| `src/hooks/useTutor.ts` | LLM orchestration, hint ladder, escalation | MODIFY — add `videoId: string | null` to return type |
| `src/store/slices/tutorSlice.ts` | Ephemeral tutor state | MODIFY — add `videoVotes`, `voteVideo()` |
| `src/store/appStore.ts` | Root store composition, STORE_VERSION | MODIFY — bump STORE_VERSION if Grade type persisted anywhere as literal |

## Recommended Project Structure Changes

```
src/
├── services/
│   ├── mathEngine/
│   │   ├── types.ts                        # MODIFY — MultiSelectAnswer, Grade 9-12, 9 new MathDomain values
│   │   └── domains/
│   │       ├── registry.ts                 # MODIFY — 9 new registrations
│   │       ├── linearEquations.ts          # NEW (Phase 82)
│   │       ├── coordinateGeometry.ts       # NEW (Phase 83)
│   │       ├── sequencesSeries.ts          # NEW (Phase 84)
│   │       ├── statisticsHs.ts             # NEW (Phase 85)
│   │       ├── systemsEquations.ts         # NEW (Phase 86)
│   │       ├── quadraticEquations.ts       # NEW (Phase 87, first MultiSelectAnswer use)
│   │       ├── polynomials.ts              # NEW (Phase 88)
│   │       ├── exponentialFunctions.ts     # NEW (Phase 89)
│   │       └── logarithms.ts               # NEW (Phase 90)
│   └── tutor/
│       └── videoMap.ts                     # NEW (Phase 81)
├── components/
│   ├── session/
│   │   ├── NumberPad.tsx                   # MODIFY — add `-` key behind showNegative prop
│   │   └── MultiSelectMC.tsx               # NEW (Phase 80)
│   └── chat/
│       ├── ChatPanel.tsx                   # MODIFY — videoId prop + VideoCard slot
│       └── VideoCard.tsx                   # NEW (Phase 81)
├── store/
│   ├── appStore.ts                         # MODIFY — STORE_VERSION bump (Phase 80)
│   ├── migrations.ts                       # MODIFY — migration for grade expansion if needed
│   └── slices/
│       └── tutorSlice.ts                   # MODIFY — videoVotes + voteVideo (Phase 81)
└── screens/
    └── PlacementTestScreen.tsx             # MODIFY — MAX_GRADE = 12 (Phase 91)
```

## Architectural Patterns

### Pattern 1: MultiSelectAnswer in the Discriminated Union

**What:** Add `MultiSelectAnswer` as a sixth variant to the existing `Answer` union. Needed for problems with multiple correct roots (e.g., "Which values are solutions to x²-5x+6=0? Select all that apply"). The domain handler produces an Answer with `type: 'multiselect'`, the session UI detects this type and renders `MultiSelectMC` instead of the standard single-tap options.

**When to use:** Any template where a problem has more than one correct numeric answer: quadratic equations with two real roots, polynomial "select all rational roots" problems.

**Integration point in types.ts:**
```typescript
export interface MultiSelectAnswer {
  readonly type: 'multiselect';
  readonly values: readonly number[]; // sorted ascending, always
}

export type Answer =
  | NumericAnswer
  | FractionAnswer
  | ComparisonAnswer
  | CoordinateAnswer
  | ExpressionAnswer
  | MultiSelectAnswer; // NEW 6th variant
```

**answerNumericValue() extension:**

`answerNumericValue()` serves three callers: (1) Elo scoring, (2) hint-safety answer-leak detection in `safetyFilter.ts`, (3) BOOST prompt correct-answer parameter. For `MultiSelectAnswer`, return the sum of sorted values — this is a deterministic numeric proxy suitable for Elo comparison (two arrays with the same values produce the same sum), and the sum is an unlikely literal to appear in a tutor text response:

```typescript
case 'multiselect':
  return answer.values.reduce((a, b) => a + b, 0);
```

For the BOOST prompt specifically, passing the sum to the LLM would be pedagogically wrong ("the answer is 5" when the actual answers are "x=2 and x=3"). Add a second utility function `answerDisplayValue(answer: Answer): string`:

```typescript
case 'multiselect':
  return answer.values.join(' and '); // "2 and 3"
```

Use `answerDisplayValue` in `buildBoostPrompt()` and nowhere else. `answerNumericValue` stays as the Elo/safety bridge throughout the rest of the system.

**Elo correctness check for MultiSelect:** The session must compare sets, not sum proxies. The isCorrect logic in the session hook becomes:

```typescript
if (correctAnswer.type === 'multiselect') {
  isCorrect = setsEqual(submittedValues, correctAnswer.values);
} else {
  isCorrect = submittedNumeric === answerNumericValue(correctAnswer);
}
```

The Elo engine still receives a boolean `isCorrect` — no change to eloEngine.ts.

---

### Pattern 2: Polynomial/Logarithm Answer Handling — Evaluation, Not Symbolic CAS

**What:** All HS domain answers are computable by the programmatic engine at problem-generation time. Avoid symbolic expression matching entirely.

**Decision rule per HS template type:**

| Problem type | Answer type | How engine computes it |
|---|---|---|
| Evaluate polynomial at x=k | NumericAnswer | Horner's method or direct expansion; integer/decimal result |
| Solve quadratic — select both roots | MultiSelectAnswer | Quadratic formula with integer discriminant; two NumericAnswer values packed as array |
| Factor polynomial — choose form | ExpressionAnswer (MC only, no free text) | Engine assembles canonical string "(x-a)(x-b)"; distractors swap signs or swap order |
| Evaluate log (log₂8, log₃27) | NumericAnswer | Table lookup / integer check; always integer output |
| Select log rule (MC) | ExpressionAnswer (MC only) | String label like "logₐ(mn) = logₐm + logₐn"; distractors are wrong rules |
| Exponential growth f(t) at t=k | NumericAnswer | Engine computes to 2 decimal places using integer base |
| Slope / distance / midpoint | NumericAnswer or FractionAnswer | Integer coordinate arithmetic |
| Sequence nth term | NumericAnswer | Closed form (arithmetic: a+nd, geometric: a·rⁿ) |
| Standard deviation (population) | NumericAnswer | Engine computes from generated dataset; rounded to 2dp |
| Substitute into system | NumericAnswer | Engine solves 2×2 integer system; answer is always integer |

`ExpressionAnswer` is used only as a multiple-choice string label selector — never as free-text input. The engine generates exactly one canonical correct string and 3-4 plausible wrong strings. The student picks from rendered options.

---

### Pattern 3: Staircase Placement Test Extension to Grades 9-12

**What:** The current `PlacementTestScreen` hardcodes `MAX_GRADE = 8` (line 40) and derives its problem pool from `getSkillsByGrade(grade as Grade)`. Both need updating.

**Required changes only — algorithm is unchanged:**

1. `PlacementTestScreen.tsx` line 40: `const MAX_GRADE = 12;`
   The staircase algorithm already handles arbitrary MAX_GRADE — no logic change.

2. `getSkillsByGrade()` — currently exported from `src/services/mathEngine/skills/index.ts`. Once Phase 82-90 domain skill files are registered in the SKILLS array with `grade: 9|10|11|12`, the existing filter `skill.grade === grade` will return HS skills automatically. No change to the function itself.

3. `onboardingSlice.ts` — `placementGrade: number | null` is already typed as `number`, not `Grade`. The `completePlacement(grade, theta)` action accepts `number`. No slice change needed.

4. Grade initialization in `childProfileSlice` — When a user selects grade 9-12 during onboarding, the skill initialization logic may attempt to seed K-8 skills. Audit the grade-based initialization path in `childProfileSlice` to ensure it handles grades 9-12 gracefully (HS skill states are added as new domains are practiced, not pre-seeded).

5. Store migration — `STORE_VERSION` bump is required in Phase 80 (foundation phase) since the `Grade` type change and grade expansion touches persisted `childGrade` field. Even though `Grade` union expansion is TypeScript-level-safe, a migration is needed to set `childGrade` to a valid value for any persisted store that may have had an invalid value. Keep migration minimal: if `childGrade > 12`, clamp to 12; otherwise pass through.

---

### Pattern 4: YouTube Video Integration — videoMap + useTutor Signal

**What:** When `ladderExhausted` is true and the current domain has a curated video, expose a `videoId` signal from `useTutor`. ChatPanel renders a `VideoCard` component using `react-native-youtube-iframe`. A simple thumbs up/down vote is stored ephemerally in tutorSlice.

**Where the domain → videoId mapping lives:**

`src/services/tutor/videoMap.ts` — a plain module-level constant, not a store slice. Static configuration updated with each domain phase release:

```typescript
// src/services/tutor/videoMap.ts
import type { MathDomain } from '@/services/mathEngine/types';

export const DOMAIN_VIDEO_MAP: Partial<Record<MathDomain, string>> = {
  linear_equations:       'xvUveqHKIhY',
  coordinate_geometry:    'W_okgL6HpY4',
  sequences_series:       'VG9pHVMtzKQ',
  statistics_hs:          'mk8tOD0t8M0',
  systems_equations:      'vA-55wZtLeE',
  quadratic_equations:    'i7idZfS8t8w',
  polynomials:            'ffLLmV0-kIU',
  exponential_functions:  'sBhEi4L91Sg',
  logarithms:             'Z5myJ8dg_rM',
};

export function getVideoForDomain(domain: MathDomain): string | null {
  return DOMAIN_VIDEO_MAP[domain] ?? null;
}
```

Video IDs are curated Khan Academy videos. They are NOT fetched remotely — they are updated via app release. This avoids the complexity of adding the map to the Zustand store (migration costs, AsyncStorage bloat, partialize changes).

**How useTutor triggers video display:**

`useTutor` already computes `ladderExhausted`. Add `videoId` to `UseTutorReturn`:

```typescript
// Addition to UseTutorReturn interface
videoId: string | null;

// Computed inside useTutor:
const videoId = ladderExhausted && currentProblem
  ? getVideoForDomain(currentProblem.problem.operation)
  : null;
```

**ChatPanel prop addition:**

```typescript
// ChatPanelProps addition
videoId?: string | null;
```

When `videoId` is non-null, `ChatPanel` renders `VideoCard` between the message list and the footer buttons. The video is an additional help resource, not a replacement for the response buttons.

**Vote store addition to tutorSlice (ephemeral, not in partialize):**

```typescript
// TutorSlice additions
videoVotes: Record<string, 'up' | 'down'>; // keyed by videoId
voteVideo: (videoId: string, vote: 'up' | 'down') => void;
```

Votes stay in tutorSlice because tutorSlice is already ephemeral (excluded from `partialize` in appStore.ts). They reset each app session — per-session feedback, not persisted analytics. If future phases require aggregated vote analytics, move to a separate persisted slice with backend sync.

---

### Pattern 5: New Domain Handler Registration (Standard Pattern)

**What:** Each of the 9 new domains follows the existing `DomainHandler` interface with no changes to `generator.ts` or the interface itself. The system is already designed for additive domain registration.

**Steps per domain (same for all 9):**

1. Create `src/services/mathEngine/domains/{domainName}.ts` implementing `DomainHandler`
2. Add domain name literal to `MathDomain` union in `types.ts`
3. Register in `HANDLERS` record in `registry.ts`
4. Create `src/services/mathEngine/skills/{domainName}Skills.ts` with `SkillDefinition[]`
5. Export skills from `src/services/mathEngine/skills/index.ts`
6. Create `src/services/mathEngine/templates/{domainName}Templates.ts` with `ProblemTemplate[]`
7. Export templates from templates barrel
8. Add bug patterns for misconception detection (BugPattern[] in bug library)

**Domain-specific notes:**

| Domain | Answer types used | Special notes |
|--------|-------------------|---------------|
| `linear_equations` | NumericAnswer | Cleanest domain — solve for x, integer answers |
| `coordinate_geometry` | NumericAnswer, FractionAnswer, CoordinateAnswer (exists) | Slope may be fraction; midpoint uses CoordinateAnswer |
| `sequences_series` | NumericAnswer | Pattern extension of existing `patterns` domain logic |
| `statistics_hs` | NumericAnswer | Std dev computation requires careful dataset generation and rounding |
| `systems_equations` | NumericAnswer (two separate templates or paired template) | Solutions are always integers from curated coefficient sets |
| `quadratic_equations` | MultiSelectAnswer (two-root templates), NumericAnswer (discriminant templates) | First use of MultiSelectAnswer — validates the pipeline |
| `polynomials` | NumericAnswer (evaluate), ExpressionAnswer (factor form MC) | Canonical form strings assembled by handler, not LLM |
| `exponential_functions` | NumericAnswer | Integer base, integer exponent inputs → exact decimal output |
| `logarithms` | NumericAnswer | Special-value tables only; avoid templates requiring log laws computation |

## Data Flow

### New Problem Generation Flow (unchanged architecture, extended pool)

```
Session orchestrator selects skillId
    (G9-12 skills now in SKILLS array after Phase 82-90)
    ↓
generateProblem({ templateId, seed, elo })  [generator.ts — unchanged]
    ↓
getHandler(template.operation)              [registry.ts — 9 new entries]
    ↓
handler.generate(template, rng)             [new HS handler file]
    ↓
DomainProblemData { correctAnswer: Answer } [may be MultiSelectAnswer]
    ↓
Problem assembled by generator.ts           [unchanged]
    ↓
Session UI detects answer.type:
  'numeric' | 'fraction'  → existing NumberPad or MC
  'comparison'            → existing comparison UI
  'coordinate'            → existing coordinate UI
  'expression'            → existing expression MC
  'multiselect'           → NEW MultiSelectMC component
```

### Video Hint Flow (new, Phase 81)

```
Student exhausts hint ladder (ladderExhausted = true in useTutor)
    ↓
videoId = getVideoForDomain(problem.operation)   [videoMap.ts lookup]
    ↓
useTutor returns { videoId }
    ↓
SessionScreen passes videoId prop to ChatPanel
    ↓
ChatPanel renders VideoCard (react-native-youtube-iframe)
    ↓
Student watches, taps thumbs up/down
    ↓
tutorSlice.voteVideo(videoId, vote)              [ephemeral, resets on app relaunch]
```

### MultiSelect Answer Evaluation Flow (new, Phase 80 + 87)

```
Problem { correctAnswer: MultiSelectAnswer { values: [2, 3] } }
    ↓
MultiSelectMC component renders checkboxes: [1] [2] [3] [4]
    ↓ student selects [2] and [3], taps Check
selectedValues: number[] = [2, 3]
    ↓
setsEqual(selectedValues, correctAnswer.values) → true
    ↓
isCorrect = true
Elo update: answerNumericValue(MultiSelectAnswer) = 5  (sum, proxy only)
    ↓
BOOST mode (if triggered): answerDisplayValue(MultiSelectAnswer) = "2 and 3"
    passed as correctAnswer display string to buildBoostPrompt()
```

## Integration Points

### New vs. Modified Components (Complete List)

| File | Change Type | Phase | What Changes |
|------|------------|-------|--------------|
| `src/services/mathEngine/types.ts` | MODIFY | 80 | + `MultiSelectAnswer` interface, `Grade` union → 9-12, `MathDomain` + 9 literals, `answerNumericValue` + multiselect case, new `answerDisplayValue` export |
| `src/services/mathEngine/domains/registry.ts` | MODIFY | 82-90 (one entry per domain per phase) | + 9 handler imports and HANDLERS entries |
| `src/components/session/NumberPad.tsx` | MODIFY | 80 | Add `-` key, controlled by `showNegative?: boolean` prop (defaults false, preserving existing behavior) |
| `src/components/session/MultiSelectMC.tsx` | NEW | 80 | Checkbox-style MC component for MultiSelectAnswer; renders option list with checkboxes, separate Check button, per-option selection state |
| `src/services/tutor/videoMap.ts` | NEW | 81 | `DOMAIN_VIDEO_MAP`, `getVideoForDomain()` pure function |
| `src/components/chat/VideoCard.tsx` | NEW | 81 | Wraps `react-native-youtube-iframe`, shows video title, thumbs vote buttons |
| `src/components/chat/ChatPanel.tsx` | MODIFY | 81 | + `videoId?: string | null` prop; render `VideoCard` when non-null between message list and footer |
| `src/hooks/useTutor.ts` | MODIFY | 81 | + `videoId: string | null` to `UseTutorReturn`; compute from `ladderExhausted && getVideoForDomain()` |
| `src/store/slices/tutorSlice.ts` | MODIFY | 81 | + `videoVotes: Record<string, 'up' | 'down'>` state; + `voteVideo(id, vote)` action |
| `src/store/appStore.ts` | MODIFY | 80 | Bump `STORE_VERSION` from 21 to 22; add migration for grade expansion |
| `src/store/migrations.ts` | MODIFY | 80 | Add v21→v22 migration (grade clamp if out-of-range) |
| `src/screens/PlacementTestScreen.tsx` | MODIFY | 91 | `MAX_GRADE = 12` constant change; add Grade type cast for 9-12 in `generateForGrade` |
| Domain handlers (×9) | NEW | 82-90 | One file per domain implementing `DomainHandler` |
| Skills files (×9) | NEW | 82-90 | `SkillDefinition[]` per domain in `src/services/mathEngine/skills/` |
| Templates files (×9) | NEW | 82-90 | `ProblemTemplate[]` per domain in `src/services/mathEngine/templates/` |

### Components That Require No Changes

These are answer-type agnostic or use `answerNumericValue()` as the only coupling point:

| File | Why Unchanged |
|------|--------------|
| `src/services/mathEngine/generator.ts` | Delegates to handler; no answer type knowledge |
| `src/services/elo/eloEngine.ts` | Receives `isCorrect: boolean`; Elo math is answer-type agnostic |
| `src/services/bkt/bktEngine.ts` | Receives `isCorrect: boolean`; BKT is answer-type agnostic |
| `src/services/session/sessionOrchestrator.ts` | Selects by skillId and Elo; no answer type knowledge |
| `src/services/tutor/promptTemplates.ts` | Receives `operation: MathDomain` (string); works with any domain value in the union |
| `src/services/tutor/safetyFilter.ts` | Uses `answerNumericValue()` for leak detection; sum convention for multiselect is safe (sum is unlikely to appear literally in tutor text) |
| `src/services/misconception/bugLibrary.ts` | Bug patterns are domain-specific but the library infrastructure is unchanged |
| `src/components/session/CpaSessionContent.tsx` | Renders `questionText`; delegates answer format rendering to session hook which detects answer type |
| `src/store/slices/onboardingSlice.ts` | `placementGrade: number | null` typed as `number`; no type narrowing to old Grade union |

## Anti-Patterns

### Anti-Pattern 1: Symbolic Expression Free-Text Input

**What people do:** Add a text input for answers like "x^2-5x+6" and try to validate equivalence with the correct answer string.

**Why it's wrong:** String equality fails for algebraically equivalent forms ("x^2-5x+6" vs "(x-2)(x-3)" vs "x(x-5)+6"). A CAS (computer algebra system) is required for equivalence checking. There is no production-quality CAS available for React Native.

**Do this instead:** All symbolic/algebraic answers use MC-only format. The engine assembles the canonical correct string and 3-4 plausible distractor strings. Student selects from options. `ExpressionAnswer` is a discriminated union variant for MC label selection, never for free-text entry.

---

### Anti-Pattern 2: Passing answerNumericValue Sum to BOOST Prompt

**What people do:** Call `answerNumericValue(MultiSelectAnswer{ values: [2,3] })` which returns 5, then pass "5" as the correct answer to the BOOST prompt.

**Why it's wrong:** The LLM then explains "the answer is 5" which is meaningless to a student who needs to understand "x = 2 and x = 3".

**Do this instead:** Use `answerDisplayValue(answer)` in `buildBoostPrompt()` for the human-readable correct answer display. Keep `answerNumericValue()` solely as the Elo/safety bridge. These are two distinct purposes that must not be conflated.

---

### Anti-Pattern 3: Registering a Domain Without Its Skills and Templates

**What people do:** Add a domain name to `MathDomain` and register its handler in `registry.ts` to "test the handler in isolation", leaving skills and templates for a follow-up commit.

**Why it's wrong:** `getSkillsByGrade()` returns empty for grade 9-12 until skills are registered — placement test silently skips those grades. Session orchestrator cannot select HS problems. The handler exists but is unreachable. Tests that exercise only the handler miss the full round-trip.

**Do this instead:** In each domain phase, complete all three layers: domain handler file, skills file, and templates file. Write round-trip tests covering template → generator → answer type in the same phase.

---

### Anti-Pattern 4: Adding videoMap to the Zustand Store

**What people do:** Put `videoMap: Record<MathDomain, string>` in a store slice to allow "remote update via config fetch."

**Why it's wrong:** The store is persisted with versioned migrations. Every video ID change requires a migration entry or the stored map becomes stale. Persisting ~20 video IDs (strings) adds unnecessary migration overhead and couples a static config concern to the user-data store.

**Do this instead:** Keep `videoMap.ts` as a module constant in `src/services/tutor/`. Video IDs are updated by app release. If remote configuration becomes a real need, implement a lightweight config endpoint that bypasses the Zustand store entirely (a simple module-level fetch-on-launch pattern, not a store slice).

---

### Anti-Pattern 5: Treating MultiSelectAnswer Equality as Sum Comparison

**What people do:** Check `answerNumericValue(submitted) === answerNumericValue(correct)` for multiselect answers, thinking the sum proxy is sufficient.

**Why it's wrong:** Different answer sets can have the same sum (e.g., {1, 5} and {2, 4} both sum to 6). A student selecting the wrong pair of roots would be incorrectly scored as correct.

**Do this instead:** Implement proper set equality for MultiSelectAnswer at the session isCorrect check:
```typescript
function setsEqual(a: number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((v, i) => v === sortedB[i]);
}
```
`answerNumericValue()` returns the sum only as the Elo math proxy — not as the isCorrect decision.

## Suggested Build Order — 11 Phases (80-91)

**Rationale:** Phase 80 is the critical foundation blocker. All domain phases (82-90) depend on the type system changes in Phase 80. Phase 81 (YouTube) touches only the tutor layer and can overlap with early domain work on a separate branch, but must be sequenced after Phase 80 for STORE_VERSION consistency. Domain phases 82-90 have no inter-dependencies — they can be done in any order. Simpler domains (linear, coordinate, sequences) are placed before harder ones (quadratics, polynomials) because Phase 87 (quadratics) validates the new MultiSelectAnswer pipeline end-to-end and should not be attempted before the UI components from Phase 80 are verified. Phase 91 is the integration phase and must follow all domain phases.

| Phase | Content | Dependencies | Risk |
|-------|---------|--------------|------|
| 80 | Foundation: extend Grade to 1-12, MathDomain + 9 values, MultiSelectAnswer in union, answerDisplayValue(), NumberPad `-` key (prop-gated), MultiSelectMC component, store migration v21→v22 | None — all additive changes | LOW — purely additive; existing union variants and Grade values unaffected |
| 81 | YouTube video tutor: videoMap.ts, VideoCard, ChatPanel + useTutor modifications, tutorSlice videoVotes | Phase 80 (for STORE_VERSION) | MEDIUM — react-native-youtube-iframe is a new native dependency; must verify Expo SDK 54 compatibility before adopting |
| 82 | `linear_equations` domain (G8-9, 8 skills) | Phase 80 | LOW — NumericAnswer only; solve-for-x templates with integer coefficients |
| 83 | `coordinate_geometry` domain (G8-10, 6 skills) | Phase 80 | LOW — NumericAnswer + existing CoordinateAnswer; integer coordinate sets |
| 84 | `sequences_series` domain (G9-11, 5 skills) | Phase 80 | LOW — NumericAnswer; arithmetic and geometric sequences extend existing patterns domain logic |
| 85 | `statistics_hs` domain (G9-11, 5 skills: std dev, variance, normal dist concepts) | Phase 80 | MEDIUM — standard deviation requires careful dataset generation and rounding strategy; normal distribution concepts are MC-only (ExpressionAnswer string labels) |
| 86 | `systems_equations` domain (G9-10, 5 skills) | Phase 80 | LOW — NumericAnswer; curated 2×2 integer-coefficient systems with integer solutions |
| 87 | `quadratic_equations` domain (G9-10, 6 skills) | Phase 80 (MultiSelectAnswer + MultiSelectMC must exist) | MEDIUM — first production use of MultiSelectAnswer; end-to-end pipeline validation; two-root templates require integer discriminants |
| 88 | `polynomials` domain (G9-10, 6 skills) | Phase 80 | MEDIUM — ExpressionAnswer MC for factored forms requires careful canonical string design; evaluation templates are NumericAnswer (simple) |
| 89 | `exponential_functions` domain (G9-11, 5 skills) | Phase 80 | LOW — NumericAnswer; integer base and exponent inputs; growth/decay evaluation |
| 90 | `logarithms` domain (G10-11, 4 skills) | Phase 80 | LOW — NumericAnswer; special-value log tables only; avoid templates needing log-rule symbolic manipulation |
| 91 | Integration: PlacementTestScreen MAX_GRADE=12, HS nodes in skill map, HS prerequisite DAG edges, re-assessment triggers for G9-12, full regression test suite | Phases 82-90 all complete | MEDIUM — skill map layout engine may need capacity increase; prerequisite DAG needs HS prerequisite research; placement test for G9-12 needs review of streak thresholds |

## Sources

- Direct inspection: `src/services/mathEngine/types.ts` (current Answer union, Grade = 1|2|...|8, MathDomain 18 values)
- Direct inspection: `src/services/mathEngine/generator.ts` (generation pipeline, handler delegation)
- Direct inspection: `src/services/mathEngine/domains/registry.ts` (HANDLERS Record pattern)
- Direct inspection: `src/hooks/useTutor.ts` (ladderExhausted, UseTutorReturn, answerNumericValue usage)
- Direct inspection: `src/components/chat/ChatPanel.tsx` (panel structure, footer slot, props shape)
- Direct inspection: `src/components/session/NumberPad.tsx` (DIGIT_ROWS layout, showDecimal prop pattern)
- Direct inspection: `src/screens/PlacementTestScreen.tsx` (MAX_GRADE=8, getSkillsByGrade, staircase algorithm)
- Direct inspection: `src/store/slices/tutorSlice.ts` (ephemeral slice, not in partialize)
- Direct inspection: `src/store/slices/onboardingSlice.ts` (placementGrade: number, not Grade)
- Direct inspection: `src/store/appStore.ts` (STORE_VERSION=21, partialize excludes tutorSlice)
- `.planning/PROJECT.md` (milestone context, v1.2 phase plan 80-91, PROJECT requirements)

---
*Architecture research for: Tiny Tallies v1.2 High School Math Expansion (Phases 80-91)*
*Researched: 2026-03-12*
