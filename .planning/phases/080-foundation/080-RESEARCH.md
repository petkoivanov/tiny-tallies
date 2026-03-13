# Phase 80: Foundation - Research

**Researched:** 2026-03-13
**Domain:** TypeScript type system, React Native UI, Zustand store migrations, safety regex
**Confidence:** HIGH

## Summary

Phase 80 is a pure infrastructure phase — no new math content, only changes to types, store, safety pipeline, UI primitives, and onboarding copy. Every subsequent v1.2 phase (81-91) is blocked on this work landing cleanly.

The scope falls into six independent workstreams: (1) Grade type expansion (1-8 to 1-12) with seven downstream changes; (2) safety pipeline regex fix for negative-number answer leak detection; (3) AgeBracket expansion to cover ages 10-18; (4) store migration v21 to v22; (5) NumberPad negative-number input via a `±` toggle; (6) MultiSelectAnswer as a new 6th discriminated union variant plus a MultiSelectMC checkbox component.

There is one additional requirement that is genuinely cosmetic — FOUND-09 updates onboarding/UI copy from "ages 6-9" to reflect K-12 scope — but its location is in `ProfileCreationWizard.tsx` (AGES/GRADES arrays), `src/theme/index.ts` (one comment), and service-layer JSDoc strings, none of which affect runtime behavior.

**Primary recommendation:** Implement all six workstreams in dependency order: types first, then safety and AgeBracket fixes (no deps), then store migration (depends on types), then NumberPad (standalone), then MultiSelectAnswer + MultiSelectMC (depends on types), then onboarding copy last (isolated).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Grade type expands from 1-8 to 1-12 across codebase | Grade = 1\|2\|...\|8 in `src/services/mathEngine/types.ts`; MAX_GRADE constant not yet extracted; ProfileCreationWizard GRADES array stops at 6; AgeRange type in childProfileSlice stops at '8-9'; BKT AGE_BRACKET_PARAMS covers only ages 6-9; Leitner getAgeIntervalBracket clamps to '8-9' for age >= 9; placement mapper grade arithmetic all valid for grades 9-12 with no change; CAT item bank may need grade 9-12 items |
| FOUND-02 | Safety pipeline fixes for negative numbers | `checkAnswerLeak` in `safetyFilter.ts` uses `\b` word boundary — confirmed broken for negative numbers because `-` is not a word character; fix is to detect negative answers and use a different pattern |
| FOUND-03 | AgeBracket type expanded to cover ages 10-18 | `AgeBracket = '6-7' \| '7-8' \| '8-9'` in `src/services/tutor/types.ts`; CONTENT_WORD_LIMITS and MAX_WORD_LENGTH in `safetyConstants.ts` are keyed by AgeBracket; WORD_LIMITS in `promptTemplates.ts` also keyed by AgeBracket; all three must be extended |
| FOUND-04 | Store migration STORE_VERSION bump | Current STORE_VERSION = 21 in `appStore.ts`; migration chain in `migrations.ts` must have a v21->v22 block; CLAUDE.md guardrail: never bump without corresponding migration |
| FOUND-05 | NumberPad gains `±` toggle key | `NumberPad.tsx` has no sign toggle; internal value state is a string; toggle logic is: if value starts with `-` remove it, else prepend `-`; maxDigits must account for the `-` sign character |
| FOUND-06 | MultiSelectAnswer added as 6th Answer variant | `Answer` discriminated union in `src/services/mathEngine/types.ts` currently has 5 variants; needs `MultiSelectAnswer { type: 'multi_select'; values: readonly number[] }`; `answerNumericValue()` needs a case; `MultiSelectPresentation` extends FormattedProblem |
| FOUND-07 | MultiSelectMC component | New component; checkbox-style options; "Check" button activates once >= 1 option selected; binary grading (all-or-nothing); `setsEqual()` utility for correctness comparison |
| FOUND-08 | distractorStrategy field on ProblemTemplate | `ProblemTemplate` in `src/services/mathEngine/types.ts` has a `domainConfig` escape hatch but no explicit `distractorStrategy`; adding a typed field is cleaner than encoding strategy in domainConfig; distractorGenerator.ts `generateDistractors()` must check the field |
| FOUND-09 | K-12 repositioning copy | ProfileCreationWizard: AGES array stops at 12, GRADES array stops at grade 6 — both must extend to age 18 and grade 12; handleAgeSelect auto-grade formula must update; one comment in src/theme/index.ts; JSDoc strings in leitner/bkt/session services — cosmetic only |
</phase_requirements>

## Standard Stack

### Core (already in use — no new installs)
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| TypeScript strict | 5.x (Expo 54) | Type system changes | All changes are type-only modifications |
| Zustand | 4.x | Store migration | Follow established migration chain pattern in `migrations.ts` |
| React Native | 0.81 | NumberPad UI, MultiSelectMC | Use existing `StyleSheet.create`, `Pressable` patterns |
| Jest + jest-expo | current | Test coverage | Follow `tiny-tallies-testing` skill patterns |

### No New Dependencies
All Phase 80 work uses existing libraries. No new packages required.

## Architecture Patterns

### Recommended Change Order (dependency-safe)

```
Wave 1 (no deps):
  - src/services/mathEngine/types.ts         (Grade, Answer, ProblemTemplate)
  - src/services/tutor/types.ts              (AgeBracket)
  - src/services/tutor/safetyConstants.ts    (CONTENT_WORD_LIMITS, MAX_WORD_LENGTH)
  - src/services/tutor/promptTemplates.ts    (WORD_LIMITS)

Wave 2 (depends on Wave 1):
  - src/services/tutor/safetyFilter.ts       (checkAnswerLeak negative fix)
  - src/store/slices/childProfileSlice.ts    (AgeRange type expand)
  - src/services/adaptive/bktCalculator.ts   (AGE_BRACKET_PARAMS expand)
  - src/services/adaptive/leitnerCalculator.ts (getAgeIntervalBracket expand)
  - src/services/mathEngine/bugLibrary/distractorGenerator.ts (distractorStrategy)

Wave 3 (depends on Wave 1):
  - src/store/appStore.ts + src/store/migrations.ts  (STORE_VERSION 22)

Wave 4 (independent UI):
  - src/components/session/NumberPad.tsx             (± toggle key)
  - src/components/session/MultiSelectMC.tsx         (new component)
  - src/services/mathEngine/answerFormats/types.ts   (MultiSelectPresentation)
  - src/services/mathEngine/answerFormats/multipleChoice.ts (unchanged — new formatter needed)

Wave 5 (cosmetic):
  - src/components/profile/ProfileCreationWizard.tsx (AGES, GRADES, handleAgeSelect)
  - src/theme/index.ts + service JSDoc comments
```

### Pattern 1: Grade Type Expansion

**What:** `Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8` expands to include `9 | 10 | 11 | 12`.
**When to use:** Anywhere a Grade value is typed or validated.

```typescript
// Source: src/services/mathEngine/types.ts (current state)
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// After change:
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Add MAX_GRADE constant for runtime use:
export const MAX_GRADE: Grade = 12;
```

**TypeScript exhaustiveness:** After expanding Grade, `tsc --noEmit` will surface any switch/exhaustive-check that doesn't handle new grade values. Run `npm run typecheck` after each wave.

### Pattern 2: Negative Number Regex Fix

**What:** `\b` (word boundary) does not match before a digit when preceded by `-` because `-` is not a word character. `checkAnswerLeak('-3', -3)` incorrectly returns `{ safe: true }`.

**Root cause confirmed:** `\b` asserts a position between `\w` (`[a-zA-Z0-9_]`) and `\W`. Since `-` is `\W`, the sequence `-3` has no `\b` before the `3` in contexts like "the answer is -3" — the `\b` sits between the space and `-`, not between `-` and `3`.

**Fix strategy:**
```typescript
// Source: src/services/tutor/safetyFilter.ts — checkAnswerLeak()

// For negative answers, use a look-behind/look-ahead approach:
// Pattern: (?<![0-9])-?DIGITS(?![0-9])
// OR simpler: handle negative sign explicitly

function buildDigitPattern(answerStr: string): RegExp {
  if (answerStr.startsWith('-')) {
    // Negative number: match literal "-N" not preceded by a digit
    return new RegExp(`(?<![0-9])${escapeRegex(answerStr)}(?![0-9])`);
  }
  // Positive number: existing word-boundary approach works
  return new RegExp(`\\b${escapeRegex(answerStr)}\\b`);
}
```

**Indirect phrase patterns** for negative answers also need updating — the existing indirect patterns use `\b${phrase}\s+${answerStr}\b` which fails for negative answers for the same reason.

**numberToWord:** The current implementation returns `null` for negative numbers (`if (n < 0) return null`). This means word-leak detection is skipped for negative answers — acceptable, as negative numbers don't have standard English word forms that LLMs would produce.

### Pattern 3: AgeBracket Expansion

**What:** `AgeBracket = '6-7' | '7-8' | '8-9'` must expand to cover ages 10-18.

**Required new brackets:** `'10-11' | '12-13' | '14-18'` (matching three teen cognitive/reading levels — early middle school, late middle school, high school).

**All impacted locations:**
1. `src/services/tutor/types.ts` — `AgeBracket` type declaration
2. `src/services/tutor/safetyConstants.ts` — `CONTENT_WORD_LIMITS` and `MAX_WORD_LENGTH` Record keys
3. `src/services/tutor/promptTemplates.ts` — `WORD_LIMITS` Record keys

**Age-to-bracket mapping** (new function or extend existing):
- Age 10-11 → '10-11' (grade 5-6, late elementary/early middle)
- Age 12-13 → '12-13' (grade 7-8, middle school)
- Age 14-18 → '14-18' (grade 9-12, high school)

**Content limits for teen brackets** (recommended, HIGH confidence based on reading research):
```typescript
CONTENT_WORD_LIMITS: {
  '6-7': 8,
  '7-8': 10,
  '8-9': 12,
  '10-11': 15,   // middle elementary — no strict ceiling needed
  '12-13': 20,   // middle school — conversational length
  '14-18': 25,   // high school — essay-length hints acceptable
}
MAX_WORD_LENGTH: {
  '6-7': 7,
  '7-8': 8,
  '8-9': 9,
  '10-11': 11,
  '12-13': 13,
  '14-18': 16,   // algebra/calculus vocabulary (e.g., "coefficient" = 11 chars)
}
```

**Where AgeBracket is derived from childAge:** The caller code (in hooks or prompt builders) converts `childAge: number` to `AgeBracket`. A new helper `getAgeBracket(childAge: number | null): AgeBracket` should be extracted — currently this logic is inline wherever `ageBracket` is computed.

### Pattern 4: Store Migration v21 → v22

**Current STORE_VERSION = 21.** Migration chain is in `src/store/migrations.ts`.

The v22 migration is minimal — it ensures any persisted child data with `childGrade > 8` (impossible currently, but future safety) is valid, and adds any new fields. Since Phase 80 doesn't add new store fields (grade values are already stored as `number`), the migration is a no-op that just documents the version bump for schema validity:

```typescript
if (version < 22) {
  // v21 -> v22: Grade type expanded to support 1-12.
  // No data shape change — childGrade is already stored as number.
  // This migration ensures stores created with v1.2 types are recognized.
  // No field additions needed.
}
```

**CLAUDE.md guardrail:** "Don't modify store migration version without adding a corresponding migration function." The migration function MUST exist even if it's a no-op.

### Pattern 5: NumberPad ± Toggle

**What:** A `±` key that toggles the sign of the current display value.

**Current NumberPad structure:**
- Display row: `[display] [⌫] [✓]`
- Row 1: `1 2 3 4 5` (5-per-row layout)
- Row 2: `6 7 8 9 0`
- Row 3: `showMe` button OR `.` decimal key (conditional)

**Proposed layout with ± key:**
- Row 3: `± . (empty)` — shown when `allowNegative={true}` prop is set

**Logic for ± key press:**
```typescript
if (key === '±') {
  setValue((prev) => {
    if (prev === '' || prev === '-') return prev; // no-op on empty
    return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
  });
  return;
}
```

**maxDigits behavior:** Currently `maxDigits` counts characters including `-`. Consider whether the `-` sign should count against maxDigits. Recommendation: the `-` sign should NOT count against digit limit (maxDigits represents significant digits). Implementation: check `prev.replace('-', '').length >= maxDigits` before appending.

**New prop:** `allowNegative?: boolean` (default `false`) to gate the ± key. Backward-compatible.

**FreeTextPresentation** (`src/services/mathEngine/answerFormats/types.ts`) has `allowDecimal: boolean` — add `allowNegative?: boolean` here too so the session orchestrator can pass the correct props to NumberPad.

### Pattern 6: MultiSelectAnswer Discriminated Union

**What:** A 6th Answer variant for problems with multiple correct values (e.g., two roots of a quadratic).

```typescript
// Source: src/services/mathEngine/types.ts

/** Multi-select answer — student must select ALL correct values */
export interface MultiSelectAnswer {
  readonly type: 'multi_select';
  readonly values: readonly number[];
}

// Extend the Answer union:
export type Answer =
  | NumericAnswer
  | FractionAnswer
  | ComparisonAnswer
  | CoordinateAnswer
  | ExpressionAnswer
  | MultiSelectAnswer;

// answerNumericValue() — add case (Elo proxy only, sum or first value):
case 'multi_select':
  return answer.values[0] ?? 0; // Elo proxy — not used for grading

// Add factory:
export function multiSelectAnswer(values: number[]): MultiSelectAnswer {
  return { type: 'multi_select', values: [...values] };
}

// Add grading helper (used by MultiSelectMC):
export function setsEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((v) => setA.has(v));
}
```

**MultiSelectPresentation** (new type in `answerFormats/types.ts`):
```typescript
export interface MultiSelectPresentation {
  readonly problem: Problem;
  readonly format: 'multi_select';
  readonly options: readonly ChoiceOption[];
  readonly correctIndices: readonly number[];  // indices of correct options
}

// FormattedProblem union extends:
export type FormattedProblem =
  | MultipleChoicePresentation
  | FreeTextPresentation
  | MultiSelectPresentation;
```

**MultiSelectMC component** (`src/components/session/MultiSelectMC.tsx`):
- Checkboxes: each option toggles independently
- "Check" button: disabled until at least 1 option selected
- Grading: binary all-or-nothing using `setsEqual(selected, correctValues)`
- Feedback: after submit, show which boxes are correct/incorrect (green/red)
- State: `selectedIndices: Set<number>` local state
- Props mirror MultipleChoicePresentation fields plus `onAnswer: (correct: boolean) => void`

**answerDisplayValue()** utility needed for BOOST mode prompt (FOUND-06 note in STATE.md):
```typescript
export function answerDisplayValue(answer: Answer): string {
  switch (answer.type) {
    case 'numeric': return String(answer.value);
    case 'fraction': return `${answer.numerator}/${answer.denominator}`;
    case 'comparison': return answer.value;
    case 'coordinate': return `(${answer.x}, ${answer.y})`;
    case 'expression': return answer.value;
    case 'multi_select': return answer.values.join(' and ');
  }
}
```

### Pattern 7: distractorStrategy on ProblemTemplate

**What:** A typed field that lets templates opt out of the ±1 adjacency distractor logic.

```typescript
// Source: src/services/mathEngine/types.ts — ProblemTemplate interface

export type DistractorStrategy = 'default' | 'domain_specific';
// 'default' = current 3-phase logic (bug library + adjacent + random)
// 'domain_specific' = skip adjacent phase, rely on bug library + random only

// Add to ProblemTemplate:
distractorStrategy?: DistractorStrategy;
```

**distractorGenerator.ts change:**
```typescript
// In generateDistractors(), Phase 2 (Adjacent):
const strategy = problem.template?.distractorStrategy ?? 'default';
// But problem doesn't carry the template — need to pass strategy as param:

export function generateDistractors(
  problem: Problem,
  rng: SeededRng,
  count: number = 3,
  distractorStrategy: DistractorStrategy = 'default',
): DistractorResult[]
```

**Caller change:** `formatAsMultipleChoice()` must receive and pass `distractorStrategy`. The `Problem` type should carry `distractorStrategy` from its originating template — either add it to `Problem` or thread it through `GenerationParams`. Adding it to `Problem` is cleaner (Problem already carries `templateId`, `skillId`, `grade`, etc.).

### Anti-Patterns to Avoid

- **Expanding `AgeRange` type in childProfileSlice:** `AgeRange = '6-7' | '7-8' | '8-9' | null` is used for anonymous peer benchmarking demographics, not tutor age brackets. These are separate concerns. FOUND-01 does not require `AgeRange` to change (peer benchmarking still targets ages 6-9 demographic reporting). Confirmed from code inspection.
- **Conflating Grade (type) with childGrade (value):** `childGrade: number | null` in the store is already a plain number — the Grade type is a TypeScript compile-time constraint, not a runtime validator. The store migration does not need to transform values.
- **Treating `numberToWord` as covering negative numbers:** It returns `null` for n < 0. This is correct — skip word-leak detection for negative answers.
- **Making ± key always visible:** Only show it when `allowNegative={true}` is passed. HS domain handlers that need negative inputs will set this; K-8 problems should not display it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Set equality for multi-select grading | Custom sort+compare logic | `setsEqual()` helper (new, simple) | Trivial to test, reusable by Quadratics domain |
| Negative number regex | Complex look-ahead/behind chains | Conditional pattern: if negative, use look-behind `(?<![0-9])`; if positive, use `\b` | Safe, testable, minimal change |
| AgeBracket age derivation | Inline ternary chains everywhere | `getAgeBracket(age: number | null): AgeBracket` utility | Centralizes logic, testable |
| Store version tracking | Manual version comments | Established `STORE_VERSION` constant + migration chain pattern already in codebase | Guardrail already exists |

**Key insight:** This phase is almost entirely surgical edits to existing files. The temptation to build elaborate abstractions is low — resist it. Keep changes minimal and well-tested.

## Common Pitfalls

### Pitfall 1: Word Boundary Regex and Negative Numbers
**What goes wrong:** `checkAnswerLeak` passes for negative answers like `-3`, letting the LLM reveal the answer to a teen doing algebra.
**Why it happens:** `\b` matches at word character/non-word-character boundaries. `-` is `\W`, so `-3` has no `\b` before the digit from the perspective of the regex engine. `checkAnswerLeak('the answer is -3', -3)` returns `{ safe: true }` with the current code.
**How to avoid:** Branch on whether `answerStr.startsWith('-')` and use a negative look-behind `(?<![0-9])` instead of `\b` for the left boundary. The right boundary `(?![0-9])` works for both cases.
**Warning signs:** New test `checkAnswerLeak('the answer is -3', -3)` returns `{ safe: true }` — this test MUST be added as part of FOUND-02.

### Pitfall 2: AgeBracket is Not AgeRange
**What goes wrong:** Developer confuses `AgeBracket` (tutor types.ts — used for LLM content calibration) with `AgeRange` (childProfileSlice — used for peer benchmarking demographics). They have similar bracket syntax but serve completely different purposes.
**Why it happens:** Both use dash-separated age range strings. `AgeRange` is currently `'6-7' | '7-8' | '8-9' | null`. FOUND-03 only changes `AgeBracket`, not `AgeRange`.
**How to avoid:** Only touch `src/services/tutor/types.ts` for `AgeBracket`. Leave `AgeRange` in `childProfileSlice.ts` unchanged.

### Pitfall 3: Migration Without Corresponding Migration Function
**What goes wrong:** STORE_VERSION bumped but no migration case added — Zustand's persist middleware will receive an older version number and call `migrateStore`, which returns early at the fast-path `if (version >= 22) return state`, skipping all migrations. This is fine. But if the version is bumped without the fast-path updating, old stores get partially migrated.
**Why it happens:** Fast path in `migrations.ts` line 20: `if (version >= 21) return state` — this must change to `if (version >= 22) return state` when STORE_VERSION becomes 22.
**How to avoid:** Always update BOTH the `STORE_VERSION` constant in `appStore.ts` AND the fast-path check AND add the `if (version < N)` block in `migrations.ts`.

### Pitfall 4: maxDigits With Negative Sign
**What goes wrong:** User types `±` to negate the value, then can't enter the last digit because `'-3'.length >= maxDigits` when maxDigits=2.
**Why it happens:** The display value string includes the `-` character which counts toward the character limit.
**How to avoid:** The maxDigits check in NumberPad's `handlePress` should compare against `prev.replace('-', '').length`, not `prev.length`.

### Pitfall 5: TypeScript Exhaustiveness After Grade Expansion
**What goes wrong:** A switch/if-chain somewhere checks specific Grade values and doesn't cover 9-12. TypeScript won't always catch this if the variable is typed as `number` somewhere in the chain.
**Why it happens:** `childGrade` in the store is `number | null`, not `Grade`. Runtime code using `childGrade` may have implicit assumptions.
**How to avoid:** Run `npm run typecheck` after Wave 1. Also search for hardcoded `8` used as a maximum grade sentinel.

### Pitfall 6: WORD_LIMITS in promptTemplates.ts is a Duplicate
**What goes wrong:** `safetyConstants.ts` has `CONTENT_WORD_LIMITS: Record<AgeBracket, number>` AND `promptTemplates.ts` has `WORD_LIMITS: Record<string, number>`. They are separately defined and may drift.
**Why it happens:** They were defined independently. `WORD_LIMITS` is typed as `Record<string, number>` (weaker), `CONTENT_WORD_LIMITS` is typed as `Record<AgeBracket, number>` (stronger).
**How to avoid:** When adding new AgeBracket values, update both. Consider using `CONTENT_WORD_LIMITS` from `safetyConstants.ts` directly in `promptTemplates.ts` (import instead of duplicate). This can be a cleanup in the same wave.

## Code Examples

### Verified: Current safetyFilter.ts checkAnswerLeak (negative number bug)
```typescript
// Source: src/services/tutor/safetyFilter.ts:40-42
// BUG: \b does not match before a digit preceded by '-'
const digitPattern = new RegExp(`\\b${escapeRegex(answerStr)}\\b`);
if (digitPattern.test(text)) {
  return { safe: false, reason: 'answer_digit_leak' };
}
```

### Verified: Current migrations.ts fast-path (must be updated)
```typescript
// Source: src/store/migrations.ts:20
// Must change from 21 to 22 when bumping version
if (version >= 21) return state;
```

### Verified: Current Grade type (needs expansion)
```typescript
// Source: src/services/mathEngine/types.ts:21
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
```

### Verified: Current AgeBracket type (needs expansion)
```typescript
// Source: src/services/tutor/types.ts:4
export type AgeBracket = '6-7' | '7-8' | '8-9';
```

### Verified: ProfileCreationWizard AGES and GRADES arrays (need expansion)
```typescript
// Source: src/components/profile/ProfileCreationWizard.tsx:28-37
const AGES = [5, 6, 7, 8, 9, 10, 11, 12];   // only goes to 12, must go to 18
const GRADES = [                              // only goes to grade 6, must go to 12
  { label: 'K', value: 0 },
  { label: '1', value: 1 },
  // ...
  { label: '6', value: 6 },
];
// handleAgeSelect formula: const autoGrade = Math.max(0, Math.min(6, selectedAge - 5));
// Must change: Math.min(6 -> 12, selectedAge - 5)
```

### Verified: BKT AGE_BRACKET_PARAMS (needs expansion to cover ages 10-18)
```typescript
// Source: src/services/adaptive/bktCalculator.ts:90-95
// Currently only covers ages 6-9; ages >= 10 fall through to DEFAULT_BKT_PARAMS
const AGE_BRACKET_PARAMS: Record<number, BktParams> = {
  6: { pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 },
  7: { pL0: 0.1, pT: 0.25, pS: 0.15, pG: 0.30 },
  8: { pL0: 0.1, pT: 0.30, pS: 0.10, pG: 0.25 },
  9: { pL0: 0.1, pT: 0.35, pS: 0.08, pG: 0.20 },
};
// Ages 10-18 currently return DEFAULT_BKT_PARAMS (age 8 bracket) — acceptable as fallback
// but explicit entries for 10-12, 13-15, 16-18 are better (teens learn faster, less guessing)
```

### Verified: Leitner getAgeIntervalBracket (needs expansion)
```typescript
// Source: src/services/adaptive/leitnerCalculator.ts:68-73
export function getAgeIntervalBracket(childAge: number | null): string {
  if (childAge === null) return 'default';
  if (childAge <= 7) return '6-7';
  if (childAge === 8) return '7-8';
  return '8-9';  // ages 9+ all use '8-9' — must add '10-11', '12-13', '14-18' brackets
}
// LEITNER_INTERVALS must also get new bracket entries
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Single-age-group app | K-12 expansion | Grade type, AgeBracket, AGES/GRADES arrays all need expanding |
| Binary answer (single value) | Multi-select answer (set of values) | New Answer variant + new UI component |
| No sign toggle in NumberPad | ± key for negative input | New prop + key in Row 3 |
| ±1 adjacency always used | distractorStrategy opt-out | New field on ProblemTemplate |

**Stable patterns (no change needed):**
- Zustand persist middleware migration chain pattern — mature and tested through v21
- `escapeRegex()` utility in safetyFilter.ts — solid, just need conditional use
- `DIGIT_ROWS` 5-per-row NumberPad layout — keeps existing structure, ± key in Row 3
- `StyleSheet.create` + `Pressable` for MultiSelectMC — same pattern as CompactAnswerRow

## Open Questions

1. **BKT parameter values for ages 10-18**
   - What we know: Teens have lower guess rates, lower slip rates, higher learn rates than children (general cognitive development research — MEDIUM confidence)
   - What's unclear: Exact values tuned for this app's specific problem difficulty distribution
   - Recommendation: Use conservative extrapolation (e.g., age 10: pT=0.38, pS=0.06, pG=0.18; age 14+: pT=0.40, pS=0.05, pG=0.15) — these can be tuned later via A/B testing

2. **Leitner intervals for teen brackets**
   - What we know: Older learners benefit from longer spaced-repetition intervals (spacing effect research)
   - What's unclear: Optimal intervals for high school math specifically
   - Recommendation: Extrapolate from existing pattern (14-18 bracket: Box 6 = 45 days)

3. **distractorStrategy threading through Problem**
   - What we know: `generateDistractors()` receives a `Problem`, not a `ProblemTemplate`
   - What's unclear: Whether to add `distractorStrategy` to the `Problem` type or thread it as a separate parameter
   - Recommendation: Add `distractorStrategy?: DistractorStrategy` to `Problem` (set from template at generation time) — keeps function signatures clean

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | `jest.config.js` (root) |
| Quick run command | `npm test -- --testPathPattern=safetyFilter` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Grade type accepts 9-12 without TypeScript error | unit (typecheck) | `npm run typecheck` | N/A (compile-time) |
| FOUND-01 | ProfileCreationWizard renders grade options K-12 | unit | `npm test -- --testPathPattern=ProfileCreationWizard` | ✅ exists |
| FOUND-02 | `checkAnswerLeak('-3', -3)` returns `{ safe: false }` | unit | `npm test -- --testPathPattern=safetyFilter` | ✅ exists (add new test) |
| FOUND-02 | `checkAnswerLeak('the answer is -3', -3)` returns `{ safe: false }` | unit | `npm test -- --testPathPattern=safetyFilter` | ✅ exists (add new test) |
| FOUND-03 | `validateContent` works with new AgeBracket values | unit | `npm test -- --testPathPattern=safetyFilter` | ✅ exists (add new tests) |
| FOUND-03 | `runSafetyPipeline` works with '14-18' AgeBracket | unit | `npm test -- --testPathPattern=safetyFilter` | ✅ exists (add new test) |
| FOUND-04 | Store migrates from v21 to v22 without data loss | unit | `npm test -- --testPathPattern=migrations` | ❌ Wave 0 |
| FOUND-05 | NumberPad ± key toggles sign in display | unit | `npm test -- --testPathPattern=NumberPad` | ❌ Wave 0 |
| FOUND-05 | maxDigits does not count the `-` sign character | unit | `npm test -- --testPathPattern=NumberPad` | ❌ Wave 0 |
| FOUND-06 | `answerNumericValue` handles `multi_select` type | unit | `npm test -- --testPathPattern=mathEngine/types` | ❌ Wave 0 |
| FOUND-06 | `setsEqual([1, 2], [2, 1])` returns true | unit | `npm test -- --testPathPattern=mathEngine/types` | ❌ Wave 0 |
| FOUND-07 | MultiSelectMC renders options as checkboxes | unit | `npm test -- --testPathPattern=MultiSelectMC` | ❌ Wave 0 |
| FOUND-07 | MultiSelectMC Check button disabled until selection | unit | `npm test -- --testPathPattern=MultiSelectMC` | ❌ Wave 0 |
| FOUND-07 | MultiSelectMC binary grading: partial selection = incorrect | unit | `npm test -- --testPathPattern=MultiSelectMC` | ❌ Wave 0 |
| FOUND-08 | `generateDistractors` skips adjacent phase when `domain_specific` | unit | `npm test -- --testPathPattern=distractorGenerator` | ✅ exists (add new test) |
| FOUND-09 | ProfileCreationWizard AGES includes 13-18 | unit | `npm test -- --testPathPattern=ProfileCreationWizard` | ✅ exists (add new test) |
| FOUND-09 | ProfileCreationWizard GRADES includes 7-12 | unit | `npm test -- --testPathPattern=ProfileCreationWizard` | ✅ exists (add new test) |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=<relevant pattern>`
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + `npm run typecheck` green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/store/migrations.test.ts` — covers FOUND-04 (v21→v22 migration)
- [ ] `src/__tests__/components/session/NumberPad.test.tsx` — covers FOUND-05 (± key, maxDigits)
- [ ] `src/__tests__/mathEngine/answerTypes.test.ts` — covers FOUND-06 (MultiSelectAnswer, setsEqual)
- [ ] `src/__tests__/components/session/MultiSelectMC.test.tsx` — covers FOUND-07 (checkbox, Check button, grading)

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/services/tutor/safetyFilter.ts` — confirmed `\b` bug with negative numbers
- Direct code inspection: `src/services/mathEngine/types.ts` — confirmed `Grade = 1|2|3|4|5|6|7|8`
- Direct code inspection: `src/services/tutor/types.ts` — confirmed `AgeBracket = '6-7' | '7-8' | '8-9'`
- Direct code inspection: `src/store/appStore.ts` — confirmed `STORE_VERSION = 21`
- Direct code inspection: `src/store/migrations.ts` — confirmed fast-path at v21, migration chain pattern
- Direct code inspection: `src/components/session/NumberPad.tsx` — confirmed no ± key
- Direct code inspection: `src/components/profile/ProfileCreationWizard.tsx` — confirmed AGES stops at 12, GRADES stops at 6
- Direct code inspection: `src/services/adaptive/bktCalculator.ts` — confirmed AGE_BRACKET_PARAMS covers 6-9 only
- Direct code inspection: `src/services/adaptive/leitnerCalculator.ts` — confirmed `getAgeIntervalBracket` clamps to '8-9'
- Direct code inspection: `src/services/mathEngine/bugLibrary/distractorGenerator.ts` — confirmed Phase 2 adjacent logic always runs
- Direct code inspection: `src/services/mathEngine/answerFormats/types.ts` — confirmed 5 Answer variants, no MultiSelectAnswer

### Secondary (MEDIUM confidence)
- `additional_context` block in prompt — technical notes from prior research (confirmed accurate against code)
- JavaScript regex spec: `\b` behavior at `\W-\W` boundaries — standard ECMAScript specification

### Tertiary (LOW confidence)
- BKT parameter values for ages 10-18 — extrapolated from cognitive development literature, not validated against app data

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all existing patterns
- Architecture (type changes): HIGH — all files directly inspected, no ambiguity
- Regex fix: HIGH — ECMAScript `\b` behavior is well-specified, bug confirmed by code inspection
- Store migration: HIGH — established pattern, confirmed current version
- NumberPad ± logic: HIGH — straightforward string toggle, inspected component
- MultiSelectAnswer design: HIGH — discriminated union pattern is established in codebase
- BKT/Leitner teen parameters: LOW — values are extrapolated, not empirically validated for this app

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable codebase — no fast-moving dependencies)
