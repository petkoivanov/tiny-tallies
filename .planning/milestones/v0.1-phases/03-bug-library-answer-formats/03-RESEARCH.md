# Phase 3: Bug Library & Answer Formats - Research

**Researched:** 2026-03-01
**Domain:** Misconception-based distractor generation, multiple choice & free text answer formats
**Confidence:** HIGH

## Summary

This phase extends the Phase 2 math engine with two capabilities: (1) a Bug Library that generates plausible wrong answers from known misconception patterns, and (2) answer format support for multiple choice and free text input. The existing math engine provides a clean foundation -- `Problem` has operands, correctAnswer, operation, and metadata (digitCount, requiresCarry, requiresBorrow), and the `constraints.ts` module already has column-iteration algorithms for carry/borrow detection that can be repurposed for computing misconception-based distractors.

No new dependencies are needed. The Bug Library is pure computation (given operands + operation, compute what a student with misconception X would answer). The answer format layer wraps a Problem with presentation data (shuffled choices for MC, or validation config for free text). Both are stateless, deterministic functions that fit the existing pure-function pipeline architecture.

The research identifies 6 addition bugs and 5 subtraction bugs from math education literature (Brown & Burton 1978, Ashlock 2010) that cover grades 1-3. Three-digit bugs reuse the same column-wise patterns as two-digit but extend to hundreds. The distractor assembly algorithm follows a 3-phase priority: bug-library distractors first (target 2 of 3), off-by-one adjacent distractor second, random constrained fallback third.

**Primary recommendation:** Implement Bug Library as a new `src/services/mathEngine/bugLibrary/` module with pure compute functions per bug pattern. Add answer format types and a `formatProblem()` function that wraps Problem into a presentation-ready object. Do not modify the existing `Problem` type -- extend it via composition.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
All four discussion areas were delegated to Claude's judgment. Key constraints to respect:
- Distractors must come from Bug Library misconception patterns (no-carry error, smaller-from-larger, off-by-one, etc.), NOT random numbers
- Multiple choice must present exactly 1 correct + 3 distractors in shuffled order
- Free text input must validate against the programmatically computed correct answer
- Both formats must work for addition AND subtraction across all difficulty levels
- Must integrate with existing Problem type from Phase 2 (operands, correctAnswer, metadata fields available)
- SessionAnswer expects { problemId: string, answer: number, correct: boolean }

### Claude's Discretion
- Misconception pattern count and which specific bug patterns to include -- choose based on math education research for grades 1-3 addition/subtraction
- Grade-specific vs universal patterns with auto-filtering
- Whether distractors carry bug-pattern metadata (for future misconception detection in v0.5)
- Extensibility for future operations -- balance generality vs simplicity
- Distractor selection strategy (most plausible first vs random from pool)
- Fallback when bug patterns produce fewer than 3 distractors -- ensure exactly 3 distractors are always produced
- Negative/zero filtering -- use age-appropriate constraints for 6-9 year olds
- Uniqueness enforcement -- all 4 choices (1 correct + 3 distractors) must be distinct
- Multiple choice shuffling strategy (random vs balanced rotation)
- Free text validation tolerance (strict vs lenient parsing of leading zeros, whitespace, etc.)
- Where answer format data lives (extend Problem model vs separate layer)
- Numbers-only display for multiple choice options -- UI presentation is Phase 7's concern
- Ownership boundary (engine vs caller/session layer decides format)
- Whether difficulty influences format selection
- API shape (presentation-ready object vs raw data)
- Mid-session format flexibility (interchangeable vs locked per session)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MATH-05 | Engine generates distractor answers using Bug Library misconception patterns (e.g., no-carry error, smaller-from-larger) | Bug Library module with 11 compute functions (6 addition, 5 subtraction) covering all grade 1-3 misconception patterns. Three-phase distractor assembly algorithm guarantees exactly 3 distractors per problem. |
| MATH-06 | Problems support multiple choice format (1 correct + 3 distractors) | `MultipleChoicePresentation` type wraps Problem with shuffled options array. Seeded RNG ensures deterministic shuffle. Exactly 4 options (1 correct + 3 distractors), all distinct positive integers. |
| MATH-07 | Problems support free text input format with numeric keyboard | `FreeTextPresentation` type wraps Problem with validation config. `parseIntegerInput()` handles whitespace, leading zeros, non-numeric rejection. `validateFreeTextAnswer()` compares parsed input to correctAnswer. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.9 | Type-safe bug pattern definitions and answer format types | Already in project, strict mode enforced |
| Zod | ^4.1 | Validation at API boundary for answer format params | Already in project, used in generator.ts for boundary validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SeededRng (internal) | N/A | Deterministic distractor shuffling and random fallback generation | Always -- ensures reproducible MC option order given same seed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom bug compute functions | Lookup tables of pre-computed distractors | Compute functions are more flexible -- they work for any operand pair within a template range, while lookup tables would need exhaustive pre-computation. Compute functions are the standard approach (Brown & Burton 1978). |
| Wrapping Problem via composition | Extending Problem interface directly | Composition keeps Problem type stable for Phase 2 consumers. Adding optional fields to Problem would leak presentation concerns into the math engine core. |

**Installation:**
```bash
# No new packages needed -- all implementation uses existing dependencies
```

## Architecture Patterns

### Recommended Project Structure
```
src/services/mathEngine/
├── bugLibrary/
│   ├── types.ts           # BugPattern, Distractor, DistractorResult types
│   ├── additionBugs.ts    # Addition misconception compute functions
│   ├── subtractionBugs.ts # Subtraction misconception compute functions
│   ├── distractorGenerator.ts  # Assembly algorithm: bugs -> off-by-one -> random
│   ├── validation.ts      # isValidDistractor, age-appropriate filtering
│   └── index.ts           # Barrel export
├── answerFormats/
│   ├── types.ts           # MultipleChoicePresentation, FreeTextPresentation, AnswerFormat
│   ├── multipleChoice.ts  # formatAsMultipleChoice(problem, seed) -> MC presentation
│   ├── freeText.ts        # parseIntegerInput(), validateFreeTextAnswer()
│   └── index.ts           # Barrel export
├── templates/             # (existing)
├── constraints.ts         # (existing -- reused for carry/borrow column analysis)
├── generator.ts           # (existing -- may add generateProblemWithDistractors())
├── seededRng.ts           # (existing -- reused for shuffling)
├── types.ts               # (existing -- no modifications needed)
└── index.ts               # (existing -- extend with new exports)
```

### Pattern 1: Bug Pattern as Pure Compute Function
**What:** Each misconception is a pure function that takes operands and returns the wrong answer a student with that misconception would produce, or `null` if the bug is not applicable to this problem.
**When to use:** For every bug pattern in the library.
**Why:** Pure functions are testable in isolation, composable, and match the existing math engine's stateless architecture.

```typescript
// Pattern derived from: .planning/05-misconception-detection.md
// and .planning/13-problem-generation.md section 5

interface BugPattern {
  /** Unique identifier, e.g., 'add_no_carry' */
  id: string;
  /** Which operations this bug applies to */
  operations: Operation[];
  /** Human description for future analytics/tutor use */
  description: string;
  /** Minimum digit count where this bug is meaningful */
  minDigits: number;
  /**
   * Compute the wrong answer a student with this misconception would give.
   * Returns null if the bug is not applicable to these operands.
   */
  compute: (a: number, b: number, operation: Operation) => number | null;
}
```

### Pattern 2: Three-Phase Distractor Assembly
**What:** Generate exactly 3 distractors using a priority pipeline: (1) bug-library distractors, (2) off-by-one adjacent distractor, (3) random constrained fallback. Each phase only activates if previous phases didn't fill all 3 slots.
**When to use:** Every time distractors are needed for a problem.
**Why:** Maximizes diagnostic value (bug-based distractors reveal misconceptions) while guaranteeing exactly 3 distractors even for simple problems where few bugs apply.

```typescript
// Source: .planning/13-problem-generation.md section 5

function generateDistractors(
  problem: Problem,
  rng: SeededRng,
): DistractorResult[] {
  const results: DistractorResult[] = [];
  const used = new Set<number>([problem.correctAnswer]);

  // Phase 1: Bug-library distractors (target 2)
  const applicableBugs = getApplicableBugs(problem);
  // Shuffle bugs using seeded RNG for determinism
  for (const bug of shuffleArray(applicableBugs, rng)) {
    if (results.length >= 2) break;
    const bugAnswer = bug.compute(problem.operands[0], problem.operands[1], problem.operation);
    if (bugAnswer !== null && !used.has(bugAnswer) && isValidDistractor(bugAnswer, problem.correctAnswer)) {
      results.push({ value: bugAnswer, source: 'bug_library', bugId: bug.id });
      used.add(bugAnswer);
    }
  }

  // Phase 2: Off-by-one (common real error for ages 6-9)
  if (results.length < 3) {
    const offset = rng.next() > 0.5 ? 1 : -1;
    const adjacent = problem.correctAnswer + offset;
    if (adjacent > 0 && !used.has(adjacent)) {
      results.push({ value: adjacent, source: 'adjacent' });
      used.add(adjacent);
    }
  }

  // Phase 3: Random constrained fallback
  while (results.length < 3) {
    // ... generate random value in plausible range, validate, add
  }

  return results;
}
```

### Pattern 3: Answer Format as Composition Wrapper
**What:** Answer format types wrap a `Problem` with presentation data rather than modifying the Problem type. A factory function takes a Problem + format + seed and returns a format-specific presentation object.
**When to use:** When preparing problems for display in Session UI (Phase 6/7).
**Why:** Keeps Problem type pure (math engine concern only) while allowing the presentation layer to have format-specific data. Avoids breaking existing consumers of Problem.

```typescript
interface MultipleChoicePresentation {
  problem: Problem;
  format: 'multiple_choice';
  /** Shuffled array of exactly 4 options: 1 correct + 3 distractors */
  options: ChoiceOption[];
  /** Index of the correct answer in shuffled options (for checking) */
  correctIndex: number;
}

interface ChoiceOption {
  value: number;
  /** Bug pattern ID if this option came from bug library, for future misconception tracking */
  bugId?: string;
}

interface FreeTextPresentation {
  problem: Problem;
  format: 'free_text';
  /** Maximum expected input length for UI sizing hint */
  maxDigits: number;
}

type FormattedProblem = MultipleChoicePresentation | FreeTextPresentation;
```

### Anti-Patterns to Avoid
- **Modifying Problem type for format data:** Adding `distractors`, `options`, or `format` fields to the Problem interface couples the math engine to presentation concerns. Use composition instead.
- **Bug patterns that depend on runtime state:** Bug compute functions must be pure -- they take operands and return a number. Do not access store state, session history, or child profile from within bug patterns.
- **Hardcoded distractor values:** Distractors must be computed from operands, not stored as fixed numbers per template. The bug library computes what a student would answer given specific operands.
- **Random-only distractors as primary strategy:** Random distractors fail to reveal misconceptions and may produce obviously wrong answers. Bug-library distractors must be the primary source.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Seeded shuffle | Custom Fisher-Yates | Utility using existing `createRng()` | Existing SeededRng already provides `intRange` needed for Fisher-Yates. Build a small `shuffleArray(arr, rng)` utility -- not a new RNG. |
| Column-wise digit extraction | New digit parsing logic | Existing `requiresCarry`/`requiresBorrow` patterns | The column-iteration algorithm in `constraints.ts` (lines 5-10) is the exact pattern needed for computing no-carry and no-borrow bug answers. Mirror the approach, don't reinvent. |
| Integer input parsing | Regex-heavy custom parser | Simple trim + regex + parseInt with bounds | The research doc (section on free-text validation) already defines the exact parsing logic. Keep it simple -- ages 6-9 enter whole numbers only. |

**Key insight:** The bug library is essentially a catalog of pure functions that simulate student errors. Each function mirrors the column-iteration pattern already established in `constraints.ts`. The hard part is getting the math right for each bug pattern -- testing edge cases is critical.

## Common Pitfalls

### Pitfall 1: Bug Pattern Produces the Correct Answer
**What goes wrong:** A bug compute function returns a value equal to `correctAnswer` for certain operand combinations. For example, `add_no_carry` on `14 + 15` gives `29`, which IS the correct answer (no carry actually occurs in ones column: 4+5=9).
**Why it happens:** Bug patterns are defined for the general case but some operand pairs make the bug irrelevant. The `add_no_carry` bug only produces a different answer when carry IS required.
**How to avoid:** Bug compute functions should return `null` when they would produce the correct answer. Additionally, the assembly algorithm must check `bugAnswer !== correctAnswer` before adding to the distractor set. Use the `requiresCarry`/`requiresBorrow` metadata from Problem to pre-filter: skip `add_no_carry` when `metadata.requiresCarry === false`.
**Warning signs:** Tests where a distractor equals the correct answer. Test every bug pattern with both applicable and non-applicable operand pairs.

### Pitfall 2: Distractor Is Negative or Zero for Ages 6-9
**What goes wrong:** A subtraction bug pattern or off-by-one computation produces 0 or a negative number. For 6-9 year olds, negative numbers are confusing and zero distractors for addition are implausible.
**Why it happens:** `sub_smaller_from_larger` on `10 - 9` gives `Math.abs(1-0)*10 + Math.abs(0-9)` = `19`, but `off-by-one` on `3 - 2 = 1` gives `0`.
**How to avoid:** `isValidDistractor()` must reject: (1) negative numbers always, (2) zero for addition, (3) values that are absurdly far from the correct answer. Use a range-based plausibility check.
**Warning signs:** Distractors of 0 appearing for addition problems. Automated tests should assert all distractors > 0 for addition.

### Pitfall 3: Fewer Than 3 Unique Distractors
**What goes wrong:** For very simple problems (e.g., `1 + 1 = 2`), bug patterns may all return `null` or produce duplicates, and the plausible range is tiny (1-7). The algorithm cannot produce 3 distinct positive distractors.
**Why it happens:** Small operands limit the number of plausible wrong answers. Single-digit problems have very few applicable bug patterns (no carry bugs on single-digit, no column confusion).
**How to avoid:** The fallback phase must guarantee 3 distractors. Use deterministic offset strategy as final resort: `correctAnswer + 1`, `correctAnswer + 2`, `correctAnswer + 3` (adjusted to avoid duplicates and stay positive). This is not ideal diagnostically but ensures the MC format always has 4 options.
**Warning signs:** `generateDistractors()` returning fewer than 3 items. Test with smallest possible operands (1+1, 2-1).

### Pitfall 4: Concatenation Bug Producing Absurdly Large Numbers
**What goes wrong:** `add_concat` for `99 + 99` produces `9999`, which is visually implausible as an answer to a two-digit addition problem.
**Why it happens:** String concatenation grows exponentially with digit count.
**How to avoid:** `isValidDistractor()` must have a max-distance check relative to the correct answer. For `correctAnswer <= 100`, distractors beyond `correctAnswer + 50` should be rejected. The `add_concat` bug is mainly useful for single-digit problems (e.g., `3 + 4 = 34`).
**Warning signs:** Three-digit distractors appearing for two-digit addition problems.

### Pitfall 5: Non-Deterministic Shuffle Breaking Reproducibility
**What goes wrong:** Using `Math.random()` for MC option shuffling means the same problem produces different option orders on different runs, breaking snapshot tests and making debugging harder.
**Why it happens:** Forgetting to use the seeded RNG for shuffle.
**How to avoid:** Always pass `SeededRng` to the shuffle function. Derive a sub-seed from the problem seed so distractor order is stable.
**Warning signs:** Flaky tests where option order changes between runs.

## Code Examples

Verified patterns from project research documents and existing codebase:

### Column-Wise No-Carry Bug (Addition)
```typescript
// Source: .planning/05-misconception-detection.md, .planning/13-problem-generation.md
// Mirrors column-iteration in src/services/mathEngine/constraints.ts

/**
 * Simulates a student who ignores carry entirely.
 * Each column is added independently, ones digit kept.
 * 27 + 18: ones = (7+8)%10 = 5, tens = 2+1 = 3 -> 35 (correct: 45)
 */
function computeNoCarry(a: number, b: number): number | null {
  // Only meaningful when carry is actually required
  let result = 0;
  let multiplier = 1;
  let x = a;
  let y = b;
  let hasCarry = false;

  while (x > 0 || y > 0) {
    const colSum = (x % 10) + (y % 10);
    if (colSum >= 10) hasCarry = true;
    result += (colSum % 10) * multiplier;
    multiplier *= 10;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }

  return hasCarry ? result : null; // null if no carry needed (bug not applicable)
}
```

### Smaller-From-Larger Bug (Subtraction)
```typescript
// Source: .planning/05-misconception-detection.md
// Most common subtraction bug in grades 1-3

/**
 * Student always subtracts smaller digit from larger in each column.
 * 42 - 17: |2-7|=5, |4-1|=3 -> 35 (correct: 25)
 */
function computeSmallerFromLarger(a: number, b: number): number | null {
  let result = 0;
  let multiplier = 1;
  let x = a;
  let y = b;
  let hasBorrow = false;

  while (x > 0 || y > 0) {
    const digitA = x % 10;
    const digitB = y % 10;
    if (digitA < digitB) hasBorrow = true;
    result += Math.abs(digitA - digitB) * multiplier;
    multiplier *= 10;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }

  return hasBorrow ? result : null; // null if no borrow needed
}
```

### Seeded Array Shuffle
```typescript
// Using existing SeededRng from src/services/mathEngine/seededRng.ts

import type { SeededRng } from '../seededRng';

function shuffleArray<T>(array: readonly T[], rng: SeededRng): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.intRange(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### Free Text Integer Parsing
```typescript
// Source: .planning/13-problem-generation.md section on free-text validation

function parseIntegerInput(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  // Remove leading zeros but keep "0" itself
  const normalized = trimmed.replace(/^0+(?=\d)/, '');

  // Only digits allowed (no decimals, no signs for ages 6-9)
  if (!/^\d+$/.test(normalized)) return null;

  const value = parseInt(normalized, 10);

  // Sanity bound -- children should not enter numbers > 9999
  if (value > 9999) return null;

  return value;
}

function validateFreeTextAnswer(input: string, correctAnswer: number): {
  correct: boolean;
  parsedValue: number | null;
} {
  const parsed = parseIntegerInput(input);
  if (parsed === null) return { correct: false, parsedValue: null };
  return { correct: parsed === correctAnswer, parsedValue: parsed };
}
```

### Distractor Validation
```typescript
function isValidDistractor(
  distractor: number,
  correctAnswer: number,
  operation: Operation,
): boolean {
  // No negative distractors for children ages 6-9
  if (distractor < 0) return false;

  // No zero for addition (implausible)
  if (distractor === 0 && operation === 'addition') return false;

  // Must not equal correct answer
  if (distractor === correctAnswer) return false;

  // Must be in plausible range
  const maxDistance = Math.max(correctAnswer * 0.5, 10);
  if (Math.abs(distractor - correctAnswer) > maxDistance) return false;

  // For very small answers, keep distractors small
  if (correctAnswer <= 5 && distractor > 10) return false;

  return true;
}
```

## Recommended Bug Patterns

Based on math education research (Brown & Burton 1978, Ashlock 2010) and the project's `.planning/05-misconception-detection.md`, these are the bug patterns to implement for grades 1-3 addition and subtraction:

### Addition Bugs (6 patterns)
| Bug ID | Pattern | Applicable When | Example |
|--------|---------|----------------|---------|
| `add_no_carry` | Ignores carry, adds columns independently | requiresCarry && digitCount >= 1 | 27+18=35 (not 45) |
| `add_carry_wrong` | Writes full column sum instead of carrying | requiresCarry && digitCount >= 2 | 27+18=315 (writes 15 in ones) |
| `add_off_by_one_plus` | Answer is correct+1 (counting error) | Always | 7+8=16 (not 15) |
| `add_off_by_one_minus` | Answer is correct-1 (counting error) | correctAnswer > 1 | 7+8=14 (not 15) |
| `add_concat` | Concatenates digits instead of adding | digitCount === 1 | 3+4=34 (not 7) |
| `add_reverse_digits` | Swaps tens/ones in result | correctAnswer >= 10 && tens !== ones | 17+5=22 becomes 22 -> writes 22, but for 9+4=13 writes 31 |

### Subtraction Bugs (5 patterns)
| Bug ID | Pattern | Applicable When | Example |
|--------|---------|----------------|---------|
| `sub_smaller_from_larger` | Subtracts smaller digit from larger per column | requiresBorrow && digitCount >= 2 | 42-17=35 (not 25) |
| `sub_no_borrow` | Forgets to borrow, writes column difference | requiresBorrow && digitCount >= 2 | 53-28=35 (5-2=3, 3-8 treated as 0?) |
| `sub_borrow_forget_reduce` | Borrows for ones but does not reduce tens | requiresBorrow && digitCount >= 2 | 53-28=35 (ones: 13-8=5, tens: 5-2=3 -- forgot to reduce 5 to 4) |
| `sub_off_by_one_plus` | Answer is correct+1 | Always | 8-3=6 (not 5) |
| `sub_off_by_one_minus` | Answer is correct-1 | correctAnswer > 1 | 8-3=4 (not 5) |

**Design recommendation on off-by-one:** Treat off-by-one as a dedicated phase in the distractor assembly algorithm (Phase 2) rather than as separate bug patterns. This avoids consuming 2 of 3 bug-library slots with trivial counting errors. Reserve bug-library slots for structural misconceptions (no-carry, smaller-from-larger, etc.).

**Design recommendation on metadata:** Include `bugId` on each distractor. This costs nothing now and enables Phase v0.5 misconception detection without refactoring. The `DistractorResult` type with optional `bugId` is the right approach.

**Design recommendation on grade filtering:** Use `minDigits` on each bug pattern and filter against `problem.metadata.digitCount` rather than grade-specific lists. This is simpler and automatically works as digit counts increase with grade level.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Random distractors for MC | Bug-library misconception-based distractors | Ashlock 2010, widely adopted by 2020 | Distractors reveal what child misunderstands, not just that they are wrong |
| Hard-coded distractor tables | Compute functions over operands | Brown & Burton 1978, implemented in modern adaptive systems | Works for any operand pair, not just pre-computed ones |
| Single answer format | Format-agnostic problem + presentation wrapper | Standard in current math apps (Khan Academy, IXL, Zearn) | Decouples math correctness from UI presentation |

**Deprecated/outdated:**
- Fixed distractor lists per template: Replaced by computed distractors from bug patterns
- Random number distractors as primary strategy: Replaced by misconception-based generation

## Open Questions

1. **Three-digit bug pattern handling**
   - What we know: The column-iteration approach for no-carry/smaller-from-larger generalizes naturally to three digits. The existing `while (x > 0 || y > 0)` loop in `constraints.ts` already handles arbitrary digit counts.
   - What's unclear: Whether additional three-digit-specific bugs exist beyond column extension (e.g., borrowing across a zero in the middle: 302 - 157). Research mentions `sub_borrow_wrong_column` but the compute function is more complex.
   - Recommendation: Start with column-wise bugs that generalize automatically. Add `sub_zero_confusion` (30-7=37 or 30-7=30) as a targeted three-digit pattern if time allows. Keep the pattern registry extensible.

2. **Format selection ownership**
   - What we know: The engine produces problems; the session/UI layer decides format. CONTEXT.md leaves this to Claude's discretion.
   - What's unclear: Whether format should be a parameter to the problem generation API or a separate post-processing step.
   - Recommendation: Separate post-processing step. `generateProblem()` returns a `Problem` as before. A new `formatProblem(problem, format, seed)` function wraps it into `FormattedProblem`. This keeps the generator unchanged and lets the session layer decide format dynamically.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + jest-expo 54 |
| Config file | `jest.config.js` (exists) |
| Quick run command | `npm test -- --testPathPattern=bugLibrary` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MATH-05 | Bug library generates misconception-based distractors | unit | `npm test -- --testPathPattern=bugLibrary` | Wave 0 |
| MATH-05 | Exactly 3 distractors always produced | unit | `npm test -- --testPathPattern=distractorGenerator` | Wave 0 |
| MATH-05 | No distractor equals correct answer | unit | `npm test -- --testPathPattern=distractorGenerator` | Wave 0 |
| MATH-05 | All distractors are positive integers | unit | `npm test -- --testPathPattern=distractorGenerator` | Wave 0 |
| MATH-06 | MC format has exactly 4 shuffled options | unit | `npm test -- --testPathPattern=multipleChoice` | Wave 0 |
| MATH-06 | MC correct answer is among options | unit | `npm test -- --testPathPattern=multipleChoice` | Wave 0 |
| MATH-06 | MC shuffle is deterministic given same seed | unit | `npm test -- --testPathPattern=multipleChoice` | Wave 0 |
| MATH-07 | Free text parses valid integer input | unit | `npm test -- --testPathPattern=freeText` | Wave 0 |
| MATH-07 | Free text rejects non-numeric input | unit | `npm test -- --testPathPattern=freeText` | Wave 0 |
| MATH-07 | Free text validates against correct answer | unit | `npm test -- --testPathPattern=freeText` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=mathEngine`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
- [ ] `src/__tests__/mathEngine/bugLibrary.test.ts` -- covers MATH-05 (individual bug pattern correctness)
- [ ] `src/__tests__/mathEngine/distractorGenerator.test.ts` -- covers MATH-05 (assembly algorithm invariants)
- [ ] `src/__tests__/mathEngine/multipleChoice.test.ts` -- covers MATH-06 (MC format invariants)
- [ ] `src/__tests__/mathEngine/freeText.test.ts` -- covers MATH-07 (parsing and validation)

## Sources

### Primary (HIGH confidence)
- `.planning/05-misconception-detection.md` - Bug Library pattern definitions, confirmation strategy, data model
- `.planning/13-problem-generation.md` - Distractor generation algorithms, assembly pipeline, validation rules, answer format types
- `src/services/mathEngine/constraints.ts` - Column-iteration algorithm for carry/borrow detection (verified in codebase)
- `src/services/mathEngine/types.ts` - Problem interface with metadata fields (verified in codebase)
- `src/services/mathEngine/seededRng.ts` - SeededRng implementation with intRange (verified in codebase)
- `src/services/mathEngine/generator.ts` - Current problem generation pipeline (verified in codebase)

### Secondary (MEDIUM confidence)
- Brown, J.S. & Burton, R.R. (1978). "Diagnostic models for procedural bugs in basic mathematical skills" - Foundational bug library research, cited in project planning docs
- Ashlock, R.B. (2010). "Error Patterns in Computation" (10th edition) - Comprehensive catalog of student math errors, cited in project planning docs

### Tertiary (LOW confidence)
- None -- all research is grounded in project planning documents and existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies, all implementation uses existing project infrastructure
- Architecture: HIGH - Pure function pipeline matches existing math engine architecture, patterns verified in codebase
- Pitfalls: HIGH - Bug patterns are well-documented in project research, edge cases identified from operand analysis
- Bug patterns: HIGH - Derived from established math education research cited in project planning docs

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable domain -- math misconceptions and pure computation, no library version concerns)
