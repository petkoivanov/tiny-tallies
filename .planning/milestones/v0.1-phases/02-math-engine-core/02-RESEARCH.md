# Phase 2: Math Engine Core - Research

**Researched:** 2026-03-01
**Domain:** Programmatic math problem generation (addition/subtraction, grades 1-3)
**Confidence:** HIGH

## Summary

Phase 2 builds a pure-function math engine that programmatically generates addition and subtraction problems for grades 1-3, computes correct answers deterministically, tags each problem to Common Core standards, and exposes configurable difficulty via templates. The engine lives in `src/services/mathEngine/` as the project's first service module, with types in `src/types/mathEngine.ts`.

This is a data-modeling and algorithmic phase with zero UI and zero external dependencies. The entire engine is pure TypeScript -- no new npm packages needed. The key design decisions are: (1) a template registry pattern where each template defines operand constraints, carry/borrow requirements, and standard tags; (2) a lightweight seeded PRNG for deterministic number generation; (3) Zod schemas at the API boundary for runtime validation of generation parameters; and (4) a skill taxonomy using dot-delimited string IDs compatible with the existing `Record<string, SkillState>` store.

**Primary recommendation:** Build the engine as a set of pure functions organized around a template registry. Each template encodes one problem "shape" (e.g., two-digit addition with regrouping) with its Common Core tag, Elo range, and operand constraints. A `generateProblem()` function selects numbers within constraints, computes the answer via arithmetic, and returns a typed `Problem` object. No LLM, no side effects, no store mutation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
No locked decisions -- all four discussion areas (skill taxonomy, difficulty templates, problem data model, standards coverage) were delegated to Claude's discretion.

Key constraints to respect:
- Skill IDs must work with existing `Record<string, SkillState>` in skillStatesSlice
- Problem IDs must work with existing `SessionAnswer.problemId: string` in sessionStateSlice
- Correct answers must ALWAYS be computed programmatically, never by LLM
- Engine lives in `src/services/` per project architecture
- TypeScript strict mode required

### Claude's Discretion
- Skill taxonomy granularity, grade grouping, skill ID format -- optimize for Elo tracking and Common Core alignment
- Difficulty templates: discrete levels vs parameterized, carry/borrow strictness, template count, pre-assigned Elo ranges
- Problem data model: metadata depth, problem ID format, API shape, display hints
- Standards coverage: grade bands, data structure, single vs multiple mapping, storage format
- Extensible from day one for future operations (multiplication, fractions)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MATH-01 | Engine programmatically generates addition problems for grades 1-3 with configurable operand ranges | Template registry pattern with 8 addition templates covering single-digit through 3-digit, with/without carry. Operand ranges defined per template via `OperandConstraints`. |
| MATH-02 | Engine programmatically generates subtraction problems for grades 1-3 with configurable operand ranges | Parallel template set with 8 subtraction templates. Borrow detection algorithm ensures constraint enforcement. Non-negative result guaranteed by constraint validation. |
| MATH-03 | Engine computes correct answers (never LLM) and validates user responses | Pure arithmetic computation (`a + b` / `a - b`) in each template's `generate()` function. Answer is a field on the returned `Problem` object. Validation is a simple equality check. |
| MATH-04 | Each problem is tagged to a Common Core standard (e.g., 1.OA.A.1, 2.NBT.B.5) | Standards stored as string arrays on each template. Comprehensive mapping table covers 1.OA.C.6, 1.OA.A.1, 2.NBT.B.5, 2.NBT.B.7, 3.NBT.A.2 for addition/subtraction. |
| MATH-08 | Problem templates define difficulty via operand ranges, carry/borrow requirements, and digit count | Each template specifies `operandRanges`, `requiresCarry`/`requiresBorrow` flags, digit count is implicit in ranges. Templates also carry `baseElo` for Phase 5 integration. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.9.2 | Strict type safety for problem types | Already configured in project; `strict: true` |
| Zod | ^4.1.13 | Runtime validation of generation parameters at API boundary | Already installed; project convention per CLAUDE.md |
| Jest + jest-expo | ^29.7.0 / ^54.0.13 | Unit testing for all generation logic | Already configured; pure functions are ideal for unit tests |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | - | No new dependencies needed for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled seeded PRNG | `pure-rand` npm package | pure-rand has better distribution quality (xoroshiro128+) but adds a dependency for a simple use case. A mulberry32 PRNG in ~10 lines is sufficient for number selection where distribution uniformity is not cryptographic. |
| Zod for internal types | Plain TypeScript types only | Zod adds runtime validation but internal engine functions trust their own types. Use Zod only at the public API boundary (`generateProblem` params), not for every internal data pass. |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   └── mathEngine/
│       ├── index.ts              # Public API barrel export
│       ├── types.ts              # Problem, Template, Skill types
│       ├── standards.ts          # Common Core standard constants
│       ├── skills.ts             # Skill taxonomy definitions
│       ├── templates/
│       │   ├── index.ts          # Template registry barrel
│       │   ├── addition.ts       # Addition problem templates
│       │   └── subtraction.ts    # Subtraction problem templates
│       ├── generator.ts          # generateProblem() main entry point
│       ├── constraints.ts        # Carry/borrow detection, operand validation
│       └── seededRng.ts          # Deterministic PRNG (mulberry32)
├── types/
│   └── mathEngine.ts             # Re-export of engine types for external consumers
└── __tests__/
    └── mathEngine/
        ├── generator.test.ts     # Problem generation tests
        ├── addition.test.ts      # Addition template tests
        ├── subtraction.test.ts   # Subtraction template tests
        ├── constraints.test.ts   # Carry/borrow detection tests
        └── seededRng.test.ts     # PRNG determinism tests
```

### Pattern 1: Template Registry
**What:** Each problem "shape" is a statically defined template object with metadata (standards, grade, Elo range) and a `generate()` function that produces a concrete problem given an RNG and constraints.
**When to use:** For every problem type (add-within-10, add-two-digit-regroup, sub-three-digit-borrow, etc.)
**Example:**
```typescript
// src/services/mathEngine/templates/addition.ts
import type { ProblemTemplate } from '../types';

export const addWithin10: ProblemTemplate = {
  id: 'add_within_10',
  operation: 'addition',
  skillId: 'addition.single-digit.no-carry',
  standards: ['1.OA.C.6'],
  grades: [1],
  operandRanges: [{ min: 1, max: 9 }, { min: 1, max: 9 }],
  resultRange: { min: 2, max: 10 },
  requiresCarry: false,
  baseElo: 850,
  digitCount: 1,
};
```

### Pattern 2: Pure Generator Function
**What:** The `generateProblem()` function is a pure function -- given the same seed and template, it always produces the same problem. No side effects, no store access, no randomness beyond the seeded PRNG.
**When to use:** Always -- the engine never mutates state. The caller (session flow, adaptive selector) owns state.
**Example:**
```typescript
// src/services/mathEngine/generator.ts
import { createRng } from './seededRng';
import { findTemplate } from './templates';
import type { Problem, GenerationParams } from './types';

export function generateProblem(params: GenerationParams): Problem {
  const template = findTemplate(params.templateId);
  const rng = createRng(params.seed);

  const [a, b] = generateOperands(rng, template);
  const correctAnswer = computeAnswer(template.operation, a, b);

  return {
    id: `${template.id}_${params.seed}`,
    templateId: template.id,
    operation: template.operation,
    operands: [a, b],
    correctAnswer,
    questionText: formatQuestion(template.operation, a, b),
    skillId: template.skillId,
    standards: template.standards,
    grade: template.grades[0],
    baseElo: template.baseElo,
    metadata: {
      digitCount: template.digitCount,
      requiresCarry: template.requiresCarry ?? false,
      requiresBorrow: template.requiresBorrow ?? false,
    },
  };
}
```

### Pattern 3: Skill ID Convention
**What:** Skill IDs use dot-delimited strings following `{operation}.{sub-skill}.{variant}` pattern. These serve as keys in `Record<string, SkillState>`.
**When to use:** Every template maps to exactly one skill ID. The skill taxonomy is defined once in `skills.ts` and referenced by templates.
**Example:**
```typescript
// Skill ID examples:
// 'addition.single-digit.no-carry'     → 1.OA.C.6
// 'addition.two-digit.with-carry'      → 2.NBT.B.5
// 'subtraction.three-digit.with-borrow' → 3.NBT.A.2

// Future extensibility:
// 'multiplication.times-table.2'       → 3.OA.C.7
// 'fractions.compare.unit'             → 3.NF.A.3
```

### Pattern 4: Carry/Borrow Detection
**What:** Algorithmic functions that determine whether a specific pair of operands requires carrying (addition) or borrowing (subtraction), used both for constraint enforcement and metadata tagging.
**When to use:** In the operand generation loop to enforce `requiresCarry`/`requiresBorrow` template constraints.
**Example:**
```typescript
// src/services/mathEngine/constraints.ts

/** Returns true if adding a + b requires carrying in any column */
export function requiresCarry(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if ((a % 10) + (b % 10) >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

/** Returns true if subtracting b from a requires borrowing in any column */
export function requiresBorrow(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if ((a % 10) < (b % 10)) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}
```

### Pattern 5: Seeded PRNG (Mulberry32)
**What:** A minimal deterministic PRNG that produces reproducible sequences from a seed. Used instead of `Math.random()` so that the same seed always generates the same problem.
**When to use:** For all number selection in problem generation. Session seed + problem index produces a unique seed per problem.
**Example:**
```typescript
// src/services/mathEngine/seededRng.ts

export interface SeededRng {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] inclusive */
  intRange(min: number, max: number): number;
}

export function createRng(seed: number): SeededRng {
  let state = seed | 0;

  function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    intRange(min: number, max: number): number {
      return min + Math.floor(next() * (max - min + 1));
    },
  };
}
```

### Anti-Patterns to Avoid
- **LLM for computation:** Never call Gemini or any LLM to compute a math answer. The engine IS the answer source. This is a hard project guardrail.
- **Store mutation in engine:** The engine produces data, it never writes to Zustand. The caller decides what to do with the problem.
- **`Math.random()` for number selection:** Non-deterministic. Always use the seeded PRNG so problems are reproducible from a seed.
- **Monolithic template file:** Don't put all templates in one file. Split by operation (addition.ts, subtraction.ts) per CLAUDE.md's 500-line file limit.
- **Inline style objects in types:** Even though this phase has no UI, type definitions should not embed presentation concerns. `questionText` is a plain string, not a styled object.
- **Barrel import anti-pattern:** Per the project's react-native-best-practices skill, avoid deep barrel re-exports. Keep the barrel in `templates/index.ts` flat (one level only).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema validation | Custom type guards for every function | Zod schemas at the public API boundary | Zod infers TypeScript types from schemas, single source of truth |
| Complex PRNG algorithm | Mersenne Twister or xoroshiro from scratch | Mulberry32 (10 lines) | Good enough for number selection, zero dependencies, well-tested algorithm |
| Common Core standard database | Full standard hierarchy parser | Hardcoded constant map of the ~10 standards relevant to addition/subtraction grades 1-3 | The standard set is small and stable; a database is over-engineering |

**Key insight:** This phase is pure algorithmic code with no external integrations. The temptation is to over-engineer (registry classes, dependency injection, plugin systems). Resist it -- plain objects, pure functions, and TypeScript types are the right abstraction level. The engine should be a library of functions, not a framework.

## Common Pitfalls

### Pitfall 1: Infinite Loop in Constrained Number Generation
**What goes wrong:** The `do...while` loop that generates operands satisfying carry/borrow constraints never terminates because the constraints are impossible to satisfy for the given range.
**Why it happens:** Template defines `requiresCarry: true` but operand ranges are too narrow (e.g., `[1,2] + [1,2]` -- max sum of ones digits is 4, never >= 10).
**How to avoid:** Add a max-iteration guard (e.g., 100 attempts) and throw a descriptive error. Also add a unit test per template that verifies it can generate at least 10 problems without hitting the guard.
**Warning signs:** Tests that sometimes pass, sometimes timeout.

### Pitfall 2: Carry/Borrow Detection Off-by-One
**What goes wrong:** The `requiresCarry()` function only checks the ones column but misses carries in tens or hundreds columns (e.g., 150 + 860 carries in hundreds).
**Why it happens:** Only checking `(a % 10) + (b % 10) >= 10` without iterating through all digit positions.
**How to avoid:** Use the column-iteration algorithm shown in Architecture Patterns (divides by 10 in a loop). Unit test with multi-column carry cases like 199 + 801.
**Warning signs:** Three-digit problems tagged "no carry" that actually require carrying.

### Pitfall 3: Subtraction Producing Negative Results
**What goes wrong:** Template generates `a - b` where `b > a`, producing a negative answer that makes no sense for grades 1-3.
**Why it happens:** Operand ranges allow the second operand to exceed the first (e.g., both in `[10, 99]`).
**How to avoid:** Always generate `a` first, then constrain `b` to `[min, a - 1]` (or `[min, a]` if zero results are acceptable). The template's `resultRange.min` should enforce `>= 0`.
**Warning signs:** Negative `correctAnswer` values in generated problems.

### Pitfall 4: Skill ID Mismatch with Store
**What goes wrong:** Engine generates skill IDs that don't match what the store expects, causing `skillStates[skillId]` to return `undefined`.
**Why it happens:** Skill IDs are defined in two places (engine taxonomy and wherever the store initializes them) and they drift.
**How to avoid:** Export the canonical skill list from the engine. The store should derive its keys from the engine's skill definitions, never hardcode them independently.
**Warning signs:** `updateSkillState` calls that create new entries instead of updating existing ones (which actually works with the current store, but indicates a taxonomy mismatch).

### Pitfall 5: Non-Deterministic Tests
**What goes wrong:** Tests that assert specific generated values fail intermittently.
**Why it happens:** Using `Math.random()` or forgetting to pass a fixed seed in test setup.
**How to avoid:** Every test that calls `generateProblem()` must pass a fixed seed. The PRNG is deterministic, so assertions on exact output values are safe with a known seed.
**Warning signs:** Tests that pass locally but fail in CI, or vice versa.

### Pitfall 6: Forgetting Zod v4 API Changes
**What goes wrong:** Using Zod v3 patterns that don't exist or behave differently in v4.
**Why it happens:** Zod 4 is relatively new (2025); most online examples show v3 syntax.
**How to avoid:** The project has Zod ^4.1.13 installed. Key changes: `z.discriminatedUnion()` still works but check import paths. `z.object().merge()` is deprecated -- use `.extend()`. Error formatting uses `z.flattenError()` instead of `error.flatten()`.
**Warning signs:** TypeScript errors on Zod schema definitions that look correct per v3 docs.

## Code Examples

### Complete Addition Template
```typescript
// Source: Project planning doc .planning/13-problem-generation.md, adapted for Phase 2 scope
import type { ProblemTemplate } from '../types';

export const addTwoDigitWithCarry: ProblemTemplate = {
  id: 'add_two_digit_with_carry',
  operation: 'addition',
  skillId: 'addition.two-digit.with-carry',
  standards: ['2.NBT.B.5'],
  grades: [2, 3],
  operandRanges: [{ min: 10, max: 99 }, { min: 10, max: 99 }],
  resultRange: { min: 20, max: 198 },
  requiresCarry: true,
  baseElo: 1080,
  digitCount: 2,
};
```

### Generate Problem with Carry Enforcement
```typescript
// Source: Derived from project architecture and planning docs
import { createRng } from './seededRng';
import { requiresCarry } from './constraints';
import type { Problem, ProblemTemplate } from './types';

const MAX_ATTEMPTS = 100;

function generateOperands(
  template: ProblemTemplate,
  seed: number,
): [number, number] {
  const rng = createRng(seed);
  const [rangeA, rangeB] = template.operandRanges;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const a = rng.intRange(rangeA.min, rangeA.max);
    const b = rng.intRange(rangeB.min, rangeB.max);

    // Check carry constraint
    if (template.requiresCarry === true && !requiresCarry(a, b)) continue;
    if (template.requiresCarry === false && requiresCarry(a, b)) continue;

    // Check result range
    const result = template.operation === 'addition' ? a + b : a - b;
    if (template.resultRange) {
      if (result < template.resultRange.min || result > template.resultRange.max) continue;
    }

    // Subtraction: ensure non-negative
    if (template.operation === 'subtraction' && result < 0) continue;

    return [a, b];
  }

  throw new Error(
    `Failed to generate operands for template ${template.id} after ${MAX_ATTEMPTS} attempts. ` +
    `Check that operand ranges are compatible with carry/borrow constraints.`
  );
}
```

### Common Core Standards Map
```typescript
// Source: Common Core State Standards for Mathematics (corestandards.org)
// Scoped to addition/subtraction for grades 1-3

export const ADDITION_SUBTRACTION_STANDARDS = {
  // Grade 1: Operations & Algebraic Thinking
  '1.OA.A.1': 'Use addition and subtraction within 20 to solve word problems',
  '1.OA.A.2': 'Solve word problems that call for addition of three whole numbers whose sum is less than or equal to 20',
  '1.OA.B.3': 'Apply properties of operations as strategies to add and subtract',
  '1.OA.B.4': 'Understand subtraction as an unknown-addend problem',
  '1.OA.C.5': 'Relate counting to addition and subtraction',
  '1.OA.C.6': 'Add and subtract within 20, demonstrating fluency within 10',
  '1.OA.D.7': 'Understand the meaning of the equal sign',
  '1.OA.D.8': 'Determine the unknown whole number in an addition or subtraction equation',

  // Grade 1: Number & Operations in Base Ten
  '1.NBT.C.4': 'Add within 100 using concrete models, drawings, and strategies based on place value',
  '1.NBT.C.5': 'Given a two-digit number, mentally find 10 more or 10 less',
  '1.NBT.C.6': 'Subtract multiples of 10 in the range 10-90 from multiples of 10',

  // Grade 2: Number & Operations in Base Ten
  '2.NBT.B.5': 'Fluently add and subtract within 100',
  '2.NBT.B.6': 'Add up to four two-digit numbers using strategies based on place value',
  '2.NBT.B.7': 'Add and subtract within 1000 using concrete models and strategies',
  '2.NBT.B.8': 'Mentally add 10 or 100 to a given number 100-900, and mentally subtract 10 or 100',
  '2.NBT.B.9': 'Explain why addition and subtraction strategies work using place value',

  // Grade 3: Number & Operations in Base Ten
  '3.NBT.A.2': 'Fluently add and subtract within 1000 using strategies and algorithms based on place value',
} as const;

export type StandardCode = keyof typeof ADDITION_SUBTRACTION_STANDARDS;
```

### Skill Taxonomy
```typescript
// Source: Derived from Common Core progression + .planning/02-curriculum-standards.md

export interface SkillDefinition {
  id: string;
  name: string;
  operation: 'addition' | 'subtraction';
  grade: 1 | 2 | 3;
  standards: string[];
  prerequisites: string[];
}

export const SKILLS: readonly SkillDefinition[] = [
  // Addition skills
  { id: 'addition.single-digit.no-carry', name: 'Add within 10', operation: 'addition', grade: 1, standards: ['1.OA.C.6'], prerequisites: [] },
  { id: 'addition.within-20.no-carry', name: 'Add within 20 (no carry)', operation: 'addition', grade: 1, standards: ['1.OA.C.6'], prerequisites: ['addition.single-digit.no-carry'] },
  { id: 'addition.within-20.with-carry', name: 'Add within 20 (with carry)', operation: 'addition', grade: 1, standards: ['1.OA.C.6'], prerequisites: ['addition.within-20.no-carry'] },
  { id: 'addition.two-digit.no-carry', name: 'Add two-digit (no carry)', operation: 'addition', grade: 2, standards: ['2.NBT.B.5'], prerequisites: ['addition.within-20.with-carry'] },
  { id: 'addition.two-digit.with-carry', name: 'Add two-digit (with carry)', operation: 'addition', grade: 2, standards: ['2.NBT.B.5'], prerequisites: ['addition.two-digit.no-carry'] },
  { id: 'addition.three-digit.no-carry', name: 'Add three-digit (no carry)', operation: 'addition', grade: 3, standards: ['3.NBT.A.2'], prerequisites: ['addition.two-digit.with-carry'] },
  { id: 'addition.three-digit.with-carry', name: 'Add three-digit (with carry)', operation: 'addition', grade: 3, standards: ['3.NBT.A.2'], prerequisites: ['addition.three-digit.no-carry'] },

  // Subtraction skills
  { id: 'subtraction.single-digit.no-borrow', name: 'Subtract within 10', operation: 'subtraction', grade: 1, standards: ['1.OA.C.6'], prerequisites: [] },
  { id: 'subtraction.within-20.no-borrow', name: 'Subtract within 20 (no borrow)', operation: 'subtraction', grade: 1, standards: ['1.OA.C.6'], prerequisites: ['subtraction.single-digit.no-borrow'] },
  { id: 'subtraction.within-20.with-borrow', name: 'Subtract within 20 (with borrow)', operation: 'subtraction', grade: 1, standards: ['1.OA.C.6'], prerequisites: ['subtraction.within-20.no-borrow'] },
  { id: 'subtraction.two-digit.no-borrow', name: 'Subtract two-digit (no borrow)', operation: 'subtraction', grade: 2, standards: ['2.NBT.B.5'], prerequisites: ['subtraction.within-20.with-borrow'] },
  { id: 'subtraction.two-digit.with-borrow', name: 'Subtract two-digit (with borrow)', operation: 'subtraction', grade: 2, standards: ['2.NBT.B.5'], prerequisites: ['subtraction.two-digit.no-borrow'] },
  { id: 'subtraction.three-digit.no-borrow', name: 'Subtract three-digit (no borrow)', operation: 'subtraction', grade: 3, standards: ['3.NBT.A.2'], prerequisites: ['subtraction.two-digit.with-borrow'] },
  { id: 'subtraction.three-digit.with-borrow', name: 'Subtract three-digit (with borrow)', operation: 'subtraction', grade: 3, standards: ['3.NBT.A.2'], prerequisites: ['subtraction.three-digit.no-borrow'] },
] as const;
```

### Zod Schema for Generation Parameters (Zod v4)
```typescript
// Source: Zod v4 docs (zod.dev/api)
import { z } from 'zod';

export const GenerationParamsSchema = z.object({
  templateId: z.string(),
  seed: z.number().int(),
  grade: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export type GenerationParams = z.infer<typeof GenerationParamsSchema>;

// For batch generation (Phase 5/6 will use this)
export const BatchGenerationParamsSchema = z.object({
  skillId: z.string(),
  count: z.number().int().min(1).max(50),
  seed: z.number().int(),
  grade: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| LLM-generated math problems | Programmatic generation with LLM for context only | 2023-2024 | LLMs are unreliable at arithmetic; programmatic generation ensures correctness |
| Random distractors | Bug Library pattern (pre-computed misconception answers) | Research: Brown & Burton 1978, modern adoption 2020+ | Distractors reveal specific misconceptions, enabling targeted remediation |
| Global difficulty level | Per-skill Elo rating with template-based difficulty | 2020+ in adaptive learning | Fine-grained adaptation produces better learning outcomes |
| Zod v3 discriminatedUnion | Zod v4 discriminatedUnion (still supported) | 2025 | z.discriminatedUnion() works in v4; .merge() deprecated in favor of .extend() |

**Deprecated/outdated:**
- Zod v3 `.merge()` on objects: use `.extend()` in v4
- Zod v3 `error.flatten()`: use `z.flattenError(error)` in v4

## Open Questions

1. **Whether to include `within_5` templates**
   - What we know: The planning doc includes `add_within_5` and `sub_within_5` as the easiest templates (Elo 800-840)
   - What's unclear: Whether these are meaningfully different from `within_10` for the age range (6-9)
   - Recommendation: Include them. They serve as entry-level for the youngest students (age 6, grade 1) and provide a gentler on-ramp. Cost is minimal (one extra template each).

2. **Problem ID uniqueness strategy**
   - What we know: `SessionAnswer.problemId: string` exists in the store. IDs need to be unique within a session.
   - What's unclear: Whether IDs need to be globally unique across all sessions (for future analytics, spaced repetition).
   - Recommendation: Use `{templateId}_{seed}` format. The seed is unique per problem within a session (session seed + problem index), so IDs are unique within a session. For global uniqueness in the future, the session ID can be prepended by the caller.

3. **How many Elo difficulty bands per template**
   - What we know: Planning docs show Elo ranges per template (e.g., 1050-1120 for two-digit addition with carry). Phase 5 will use these.
   - What's unclear: Whether Phase 2 should compute adjusted Elo per problem instance (based on specific operand values) or just use the template's base Elo.
   - Recommendation: Include `baseElo` on templates now but defer per-instance Elo adjustment to Phase 5. Phase 2's job is to generate problems with metadata; Elo adjustment is adaptive difficulty logic.

4. **Display hint depth for future manipulatives**
   - What we know: Phase 2 CONTEXT.md says display hints are Claude's discretion. Planning docs show `visualHint` with base-ten block decomposition.
   - What's unclear: Whether to include visual hints now or wait for the manipulatives phase (v0.3).
   - Recommendation: Defer visual hints entirely. Include `metadata` with `digitCount`, `requiresCarry`, `requiresBorrow` -- that's sufficient for Phase 3 (Bug Library) and Phase 5 (adaptive). Manipulative-specific hints belong in a later phase.

## Sources

### Primary (HIGH confidence)
- `.planning/13-problem-generation.md` - Comprehensive problem generation architecture with TypeScript interfaces, template examples, carry/borrow algorithms, and Elo calibration
- `.planning/02-curriculum-standards.md` - Common Core standard codes mapped to grade levels and topic areas
- `.planning/05-misconception-detection.md` - Bug Library pattern with addition/subtraction bug IDs (informs Phase 3 but shapes data model here)
- `src/store/slices/skillStatesSlice.ts` - Existing `Record<string, SkillState>` interface the engine must integrate with
- `src/store/slices/sessionStateSlice.ts` - Existing `SessionAnswer { problemId: string, answer: number, correct: boolean }` interface
- [Common Core State Standards for Mathematics](https://learning.ccsso.org/wp-content/uploads/2022/11/ADA-Compliant-Math-Standards.pdf) - Official standard codes and descriptions
- [Zod v4 migration guide](https://zod.dev/v4/changelog) - API changes from v3 to v4

### Secondary (MEDIUM confidence)
- [Grade 1 Operations & Algebraic Thinking standards](https://www.thecorestandards.org/Math/Content/1/OA/) - Official Common Core standard detail pages (verified against planning docs)
- [pure-rand GitHub](https://github.com/dubzzz/pure-rand) - PRNG algorithm reference (decided not to use as dependency, but validated mulberry32 approach)
- [Mulberry32 PRNG gist](https://gist.github.com/steveruizok/09a1d3ff88175b077f9affbee1d4ce73) - Reference implementation for seeded RNG in TypeScript
- [Zod v4 API docs](https://zod.dev/api) - Current Zod API for discriminated unions and schema definition

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; all tools already in the project. Pure TypeScript + Zod + Jest.
- Architecture: HIGH - Template registry pattern is well-established in the planning docs (13-problem-generation.md) with complete TypeScript interfaces. Pattern is straightforward pure-function design.
- Pitfalls: HIGH - Carry/borrow detection, infinite loops, and non-determinism are well-known issues in procedural generation. Mitigations are concrete and testable.

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable -- no external dependencies or fast-moving APIs)
