# 13 — Math Problem Generation Engine

**Research Date:** 2026-03-01
**Focus:** Programmatic math problem generation, difficulty calibration, distractor generation, and session composition for ages 6-9

## 1. Architecture Overview

### Why Programmatic Generation (Not LLM)

LLMs are unreliable at arithmetic. GPT-4 and Gemini regularly make carry/borrow errors, miscalculate multi-digit multiplication, and produce incorrect fraction comparisons. For an educational app where **every answer must be provably correct**, programmatic generation is non-negotiable.

The math engine computes answers deterministically. The LLM layer (Gemini) is restricted to context wrapping, hint generation, and explanations — it never touches computation.

```
┌─────────────────────────────────────────────────────────────────┐
│                   Math Problem Generation Engine                │
│                                                                 │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Template     │  │   Number     │  │   Distractor         │ │
│  │   Registry     │  │   Selection  │  │   Generator          │ │
│  │   (by topic)   │  │   (SeededRNG)│  │   (Bug Library)      │ │
│  └───────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│          │                 │                      │             │
│          ▼                 ▼                      ▼             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Problem Assembly Pipeline                      ││
│  │                                                             ││
│  │  1. Select template (topic + difficulty + CPA level)        ││
│  │  2. Generate numbers (SeededRNG + constraints)              ││
│  │  3. Compute correct answer (deterministic)                  ││
│  │  4. Generate distractors (bug library + random)             ││
│  │  5. Validate invariants (no degenerate cases)               ││
│  │  6. Tag with curriculum standard + metadata                 ││
│  └─────────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Session Composer                             │
│  Selects problems based on Elo rating, BKT mastery,            │
│  Leitner box, and session phase (warmup/core/cooldown)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM Layer (Gemini)                           │
│  OPTIONAL: Wraps problem in story context, generates hints,    │
│  explains concepts. NEVER computes answers.                    │
└─────────────────────────────────────────────────────────────────┘
```

### Separation of Concerns

| Component | Responsibility | Depends On |
|-----------|---------------|------------|
| **Template Registry** | Defines problem structures per topic | Curriculum standards |
| **Number Selector** | Picks numbers meeting difficulty constraints | SeededRNG, difficulty matrix |
| **Answer Computer** | Deterministic correct answer calculation | Problem operands + operation |
| **Distractor Generator** | Produces plausible wrong answers | Bug library, answer value |
| **Problem Validator** | Rejects degenerate/trivial problems | Generated problem |
| **Session Composer** | Selects which problems to present | Elo, BKT, Leitner state |
| **Word Problem Wrapper** | Adds narrative context to bare problems | Variable pools, reading level |

### Integration with Adaptive Systems

The engine is a **pure function pipeline** — given a seed, difficulty target, and topic, it produces a deterministic problem. The adaptive systems (Elo, BKT, Leitner) live in the Zustand store and feed parameters into the engine:

```typescript
// Adaptive systems provide parameters → Engine generates problems
const problem = generateProblem({
  topic: 'add_within_20',
  targetElo: childProfile.eloRating - 60,  // 85% success target
  cpaLevel: skillState.cpaLevel,
  seed: sessionSeed + problemIndex,
  grade: childProfile.grade,
  avoidBugIds: recentlyTestedBugs,
});
```

---

## 2. Problem Template System

### Core Interfaces

```typescript
/** Defines the structure of a problem type without specific numbers */
interface ProblemTemplate {
  /** Unique identifier, e.g., 'add_two_digit_no_regroup' */
  id: string;
  /** Topic area this template belongs to */
  topic: TopicId;
  /** Common Core standard(s) this template addresses */
  standards: string[];  // e.g., ['1.OA.6', '2.OA.2']
  /** Grade levels this template applies to */
  grades: Grade[];
  /** Base Elo difficulty rating for this template type */
  baseElo: number;
  /** CPA levels this template supports */
  cpaLevels: CpaLevel[];
  /** Constraints on number generation */
  constraints: ProblemConstraints;
  /** Function that generates a problem given random numbers */
  generate: (rng: SeededRNG, difficulty: DifficultyParams) => GeneratedProblem;
  /** Bug patterns that apply to this template (for distractor generation) */
  applicableBugs: BugId[];
  /** Answer format expected */
  answerFormat: AnswerFormat;
}

/** The concrete, playable problem produced by a template */
interface GeneratedProblem {
  /** Unique ID for this specific problem instance */
  id: string;
  /** Template that generated this problem */
  templateId: string;
  /** The problem text (bare, without word problem wrapper) */
  questionText: string;
  /** The correct answer */
  correctAnswer: MathAnswer;
  /** Distractor answers (for multiple choice) */
  distractors: Distractor[];
  /** Elo difficulty rating (adjusted from template base) */
  eloRating: number;
  /** CPA level */
  cpaLevel: CpaLevel;
  /** Topic and curriculum tags */
  topic: TopicId;
  standards: string[];
  /** Visual representation hints (for pictorial/concrete modes) */
  visualHint?: VisualHint;
  /** Metadata for analytics */
  metadata: ProblemMetadata;
}

/** Constraints governing number selection for a template */
interface ProblemConstraints {
  /** Range for each operand */
  operandRanges: Array<{ min: number; max: number }>;
  /** Constraint on the result (e.g., answer must be positive) */
  resultRange?: { min: number; max: number };
  /** Whether regrouping/carrying is required */
  requiresRegrouping?: boolean;
  /** Whether regrouping is forbidden (for simpler problems) */
  forbidRegrouping?: boolean;
  /** Numbers to exclude (e.g., 0 for multiplication, 1 for division) */
  excludeOperands?: number[];
  /** Custom validation function for generated numbers */
  validate?: (operands: number[], result: number) => boolean;
}

/** Supported answer formats */
type AnswerFormat =
  | { type: 'number' }
  | { type: 'fraction'; simplified?: boolean }
  | { type: 'multipleChoice'; choiceCount: 4 }
  | { type: 'selectImage' }
  | { type: 'ordering'; itemCount: number }
  | { type: 'fillBlank'; blankCount: number };

/** A distractor (wrong answer option) with its origin */
interface Distractor {
  value: MathAnswer;
  source: 'bug_library' | 'random' | 'adjacent';
  bugId?: BugId;  // Which misconception this targets, if any
}

/** Flexible answer type supporting different math representations */
type MathAnswer =
  | { type: 'integer'; value: number }
  | { type: 'fraction'; numerator: number; denominator: number }
  | { type: 'decimal'; value: number; precision: number }
  | { type: 'shape'; shapeId: string }
  | { type: 'time'; hours: number; minutes: number }
  | { type: 'measurement'; value: number; unit: MeasurementUnit };

type CpaLevel = 'concrete' | 'pictorial' | 'abstract';
type Grade = 1 | 2 | 3;
```

### Template Registration Pattern

Templates are organized by topic in a registry. Each topic module exports its templates, and a barrel `index.ts` collects them:

```typescript
// src/services/mathEngine/templates/addition.ts
import type { ProblemTemplate } from '../types';

export const addWithin10: ProblemTemplate = {
  id: 'add_within_10',
  topic: 'addition',
  standards: ['1.OA.6'],
  grades: [1],
  baseElo: 850,
  cpaLevels: ['concrete', 'pictorial', 'abstract'],
  constraints: {
    operandRanges: [{ min: 1, max: 9 }, { min: 1, max: 9 }],
    resultRange: { min: 2, max: 10 },
    excludeOperands: [0],  // no +0 problems at this level
  },
  applicableBugs: ['add_off_by_one', 'add_concat'],
  answerFormat: { type: 'multipleChoice', choiceCount: 4 },
  generate: (rng, difficulty) => {
    // Implementation in section 7 (Number Selection Algorithms)
  },
};

export const addWithin20NoRegroup: ProblemTemplate = { /* ... */ };
export const addWithin20WithRegroup: ProblemTemplate = { /* ... */ };

// src/services/mathEngine/templates/index.ts (barrel export)
export { addWithin10, addWithin20NoRegroup, addWithin20WithRegroup } from './addition';
export { subWithin10, subWithin20NoRegroup, subWithin20WithRegroup } from './subtraction';
// ... etc.
```

### Template Registry

```typescript
// src/services/mathEngine/templateRegistry.ts
import type { ProblemTemplate, TopicId, Grade, DifficultyParams } from './types';
import * as templates from './templates';

const registry: Map<string, ProblemTemplate> = new Map();

/** Register all templates on module load */
function initRegistry(): void {
  const allTemplates = Object.values(templates) as ProblemTemplate[];
  for (const template of allTemplates) {
    registry.set(template.id, template);
  }
}

/** Find templates matching topic, grade, and difficulty range */
function findTemplates(
  topic: TopicId,
  grade: Grade,
  eloRange: { min: number; max: number },
): ProblemTemplate[] {
  const results: ProblemTemplate[] = [];
  for (const template of registry.values()) {
    if (
      template.topic === topic &&
      template.grades.includes(grade) &&
      template.baseElo >= eloRange.min &&
      template.baseElo <= eloRange.max
    ) {
      results.push(template);
    }
  }
  return results;
}

initRegistry();
export { registry, findTemplates };
```

---

## 3. Problem Types by Topic

### Counting (Grades 1-2)

| Template ID | Description | Number Range | Elo Range | Standards |
|------------|-------------|-------------|-----------|-----------|
| `count_forward_to_20` | Count objects: "How many stars?" | 1-20 | 800-850 | K.CC.5 |
| `count_forward_to_100` | "What number comes after 67?" | 1-100 | 850-900 | 1.NBT.1 |
| `count_forward_to_120` | "Count from 98. What comes after 100?" | 98-120 | 900-950 | 1.NBT.1 |
| `count_backward_from_20` | "Count back from 15. What comes after 12?" | 1-20 | 850-900 | K.CC.2 |
| `skip_count_by_2` | "2, 4, 6, ?, 10" | 2-100 | 900-950 | 2.NBT.2 |
| `skip_count_by_5` | "5, 10, 15, ?, 25" | 5-100 | 900-950 | 2.NBT.2 |
| `skip_count_by_10` | "10, 20, ?, 40, 50" | 10-100 | 850-900 | 2.NBT.2 |
| `skip_count_by_100` | "100, 200, 300, ?" | 100-1000 | 950-1000 | 2.NBT.2 |

```typescript
const skipCountBy2: ProblemTemplate = {
  id: 'skip_count_by_2',
  topic: 'counting',
  standards: ['2.NBT.2'],
  grades: [2],
  baseElo: 920,
  cpaLevels: ['pictorial', 'abstract'],
  constraints: {
    operandRanges: [{ min: 2, max: 50 }],  // starting number (even)
  },
  applicableBugs: ['count_off_by_one', 'skip_count_wrong_step'],
  answerFormat: { type: 'fillBlank', blankCount: 1 },
  generate: (rng, difficulty) => {
    // Pick a starting even number
    const start = rng.intRange(1, 25) * 2;
    const sequenceLength = 5;
    const blankPosition = rng.intRange(1, 3); // blank in middle
    const sequence = Array.from({ length: sequenceLength }, (_, i) => start + i * 2);
    const answer = sequence[blankPosition];

    const display = sequence
      .map((n, i) => (i === blankPosition ? '?' : String(n)))
      .join(', ');

    return {
      id: `skip2_${start}_${blankPosition}`,
      templateId: 'skip_count_by_2',
      questionText: display,
      correctAnswer: { type: 'integer', value: answer },
      distractors: generateCountingDistractors(answer, 2),
      eloRating: 920,
      cpaLevel: 'abstract',
      topic: 'counting',
      standards: ['2.NBT.2'],
      metadata: { operation: 'skip_count', step: 2, start },
    };
  },
};
```

### Addition (Grades 1-3)

| Template ID | Description | Operand Ranges | Regrouping | Elo Range | Standards |
|------------|-------------|---------------|------------|-----------|-----------|
| `add_within_5` | Single-digit, sum <=5 | 1-4 + 1-4 | No | 800-830 | 1.OA.6 |
| `add_within_10` | Single-digit, sum <=10 | 1-9 + 1-9 | No | 830-870 | 1.OA.6 |
| `add_within_20_no_regroup` | e.g., 12 + 5 | 10-19 + 1-9 | No | 870-920 | 1.OA.6 |
| `add_within_20_regroup` | e.g., 8 + 7 (crosses 10) | 2-9 + 2-9 | Yes | 920-980 | 1.OA.6 |
| `add_two_digit_no_regroup` | e.g., 23 + 14 | 10-99 + 10-99 | No | 980-1050 | 2.NBT.5 |
| `add_two_digit_regroup` | e.g., 37 + 45 | 10-99 + 10-99 | Yes | 1050-1120 | 2.NBT.5 |
| `add_three_digit_no_regroup` | e.g., 234 + 152 | 100-499 + 100-499 | No | 1120-1180 | 3.NBT.2 |
| `add_three_digit_regroup` | e.g., 367 + 285 | 100-499 + 100-499 | Yes | 1180-1300 | 3.NBT.2 |
| `add_three_numbers` | e.g., 3 + 4 + 5 | 1-9 each | Maybe | 950-1050 | 1.OA.2 |
| `add_missing_addend` | 5 + ? = 12 | 1-9 + ? | Maybe | 1000-1100 | 1.OA.8 |

```typescript
const addTwoDigitRegroup: ProblemTemplate = {
  id: 'add_two_digit_regroup',
  topic: 'addition',
  standards: ['2.NBT.5', '2.NBT.6'],
  grades: [2, 3],
  baseElo: 1080,
  cpaLevels: ['concrete', 'pictorial', 'abstract'],
  constraints: {
    operandRanges: [{ min: 10, max: 99 }, { min: 10, max: 99 }],
    resultRange: { min: 20, max: 198 },
    requiresRegrouping: true,
    excludeOperands: [10, 20, 30, 40, 50, 60, 70, 80, 90], // no round numbers
  },
  applicableBugs: [
    'add_no_carry',
    'add_carry_wrong',
    'add_reverse_digits',
    'add_off_by_one',
  ],
  answerFormat: { type: 'multipleChoice', choiceCount: 4 },
  generate: (rng, difficulty) => {
    let a: number, b: number;
    do {
      a = rng.intRange(10, 99);
      b = rng.intRange(10, 99);
    } while (
      // Ensure regrouping occurs (ones digits sum > 9)
      (a % 10) + (b % 10) <= 9 ||
      // Exclude round numbers
      a % 10 === 0 ||
      b % 10 === 0
    );

    const answer = a + b;
    return {
      id: `add2r_${a}_${b}`,
      templateId: 'add_two_digit_regroup',
      questionText: `${a} + ${b} = ?`,
      correctAnswer: { type: 'integer', value: answer },
      distractors: generateAdditionDistractors(a, b, answer),
      eloRating: adjustEloByNumbers(1080, a, b),
      cpaLevel: difficulty.cpaLevel ?? 'abstract',
      topic: 'addition',
      standards: ['2.NBT.5'],
      visualHint: {
        type: 'base_ten_blocks',
        groups: [
          { tens: Math.floor(a / 10), ones: a % 10 },
          { tens: Math.floor(b / 10), ones: b % 10 },
        ],
      },
      metadata: { operation: 'addition', regrouping: true, digitCount: 2 },
    };
  },
};
```

### Subtraction (Grades 1-3)

| Template ID | Description | Operand Ranges | Regrouping | Elo Range | Standards |
|------------|-------------|---------------|------------|-----------|-----------|
| `sub_within_5` | Basic subtraction | 2-5 - 1-4 | No | 810-840 | 1.OA.6 |
| `sub_within_10` | Single-digit | 2-10 - 1-9 | No | 840-880 | 1.OA.6 |
| `sub_within_20_no_regroup` | e.g., 17 - 4 | 11-20 - 1-9 | No | 880-940 | 1.OA.6 |
| `sub_within_20_regroup` | e.g., 15 - 8 (crosses 10) | 11-20 - 2-9 | Yes | 940-1000 | 1.OA.6 |
| `sub_two_digit_no_regroup` | e.g., 56 - 23 | 20-99 - 10-99 | No | 1000-1070 | 2.NBT.5 |
| `sub_two_digit_regroup` | e.g., 52 - 27 | 20-99 - 10-99 | Yes | 1070-1150 | 2.NBT.5 |
| `sub_three_digit_no_regroup` | e.g., 485 - 132 | 100-999 - 100-999 | No | 1150-1220 | 3.NBT.2 |
| `sub_three_digit_regroup` | e.g., 423 - 167 | 100-999 - 100-999 | Yes | 1220-1350 | 3.NBT.2 |
| `sub_missing_subtrahend` | 12 - ? = 5 | 2-20 - ? | Maybe | 1020-1120 | 1.OA.8 |

```typescript
const subTwoDigitRegroup: ProblemTemplate = {
  id: 'sub_two_digit_regroup',
  topic: 'subtraction',
  standards: ['2.NBT.5'],
  grades: [2, 3],
  baseElo: 1100,
  cpaLevels: ['concrete', 'pictorial', 'abstract'],
  constraints: {
    operandRanges: [{ min: 20, max: 99 }, { min: 10, max: 89 }],
    resultRange: { min: 1, max: 89 },
    requiresRegrouping: true,
  },
  applicableBugs: [
    'sub_smaller_from_larger',
    'sub_no_borrow',
    'sub_borrow_forget_reduce',
    'sub_zero_confusion',
  ],
  answerFormat: { type: 'multipleChoice', choiceCount: 4 },
  generate: (rng, difficulty) => {
    let a: number, b: number;
    do {
      a = rng.intRange(20, 99);
      b = rng.intRange(10, a - 1);
    } while (
      // Ensure regrouping (ones of b > ones of a)
      (b % 10) <= (a % 10) ||
      // Ensure non-trivial result
      a - b < 2 ||
      // Exclude round numbers
      a % 10 === 0 ||
      b % 10 === 0
    );

    const answer = a - b;
    return {
      id: `sub2r_${a}_${b}`,
      templateId: 'sub_two_digit_regroup',
      questionText: `${a} - ${b} = ?`,
      correctAnswer: { type: 'integer', value: answer },
      distractors: generateSubtractionDistractors(a, b, answer),
      eloRating: adjustEloByNumbers(1100, a, b),
      cpaLevel: difficulty.cpaLevel ?? 'abstract',
      topic: 'subtraction',
      standards: ['2.NBT.5'],
      visualHint: {
        type: 'base_ten_blocks',
        groups: [{ tens: Math.floor(a / 10), ones: a % 10 }],
        action: 'remove',
        removeAmount: { tens: Math.floor(b / 10), ones: b % 10 },
      },
      metadata: { operation: 'subtraction', regrouping: true, digitCount: 2 },
    };
  },
};
```

### Multiplication (Grades 2-3)

| Template ID | Description | Factors | Elo Range | Standards |
|------------|-------------|---------|-----------|-----------|
| `mul_equal_groups` | "3 groups of 4" with pictures | 2-5 x 2-5 | 1000-1060 | 3.OA.1 |
| `mul_arrays` | "How many dots? 3 rows of 4" | 2-5 x 2-5 | 1020-1080 | 3.OA.1 |
| `mul_repeated_addition` | "4 + 4 + 4 = ? x 4" | 2-5 x 2-10 | 1040-1100 | 3.OA.1 |
| `mul_times_table_2` | Times table for 2 | 1-10 x 2 | 980-1020 | 3.OA.7 |
| `mul_times_table_5` | Times table for 5 | 1-10 x 5 | 1000-1040 | 3.OA.7 |
| `mul_times_table_10` | Times table for 10 | 1-10 x 10 | 960-1000 | 3.OA.7 |
| `mul_times_table_3_4` | Times tables for 3, 4 | 1-10 x 3-4 | 1040-1100 | 3.OA.7 |
| `mul_times_table_6_7_8_9` | Times tables for 6-9 | 1-10 x 6-9 | 1100-1200 | 3.OA.7 |
| `mul_by_multiples_of_10` | e.g., 4 x 30 | 1-9 x 10/20/30 | 1100-1180 | 3.NBT.3 |
| `mul_commutative` | "3 x 4 = 4 x ?" | 2-10 x 2-10 | 1060-1120 | 3.OA.5 |

```typescript
const mulArrays: ProblemTemplate = {
  id: 'mul_arrays',
  topic: 'multiplication',
  standards: ['3.OA.1', '3.OA.3'],
  grades: [2, 3],
  baseElo: 1050,
  cpaLevels: ['concrete', 'pictorial'],
  constraints: {
    operandRanges: [{ min: 2, max: 5 }, { min: 2, max: 5 }],
    excludeOperands: [1],  // no x1 arrays
  },
  applicableBugs: ['mul_add_instead', 'mul_off_by_one_group', 'mul_adjacent_fact'],
  answerFormat: { type: 'multipleChoice', choiceCount: 4 },
  generate: (rng, difficulty) => {
    const rows = rng.intRange(2, 5);
    const cols = rng.intRange(2, 5);
    const answer = rows * cols;

    return {
      id: `arr_${rows}_${cols}`,
      templateId: 'mul_arrays',
      questionText: `How many dots?\n${Array(rows).fill('● '.repeat(cols).trim()).join('\n')}`,
      correctAnswer: { type: 'integer', value: answer },
      distractors: generateMultiplicationDistractors(rows, cols, answer),
      eloRating: 1050 + (rows + cols - 4) * 10,
      cpaLevel: 'pictorial',
      topic: 'multiplication',
      standards: ['3.OA.1'],
      visualHint: { type: 'array', rows, cols },
      metadata: { operation: 'multiplication', representation: 'array' },
    };
  },
};
```

### Division (Grades 2-3)

| Template ID | Description | Dividend / Divisor | Elo Range | Standards |
|------------|-------------|-------------------|-----------|-----------|
| `div_equal_sharing` | "12 cookies shared by 3 friends" | 4-30 / 2-5 | 1050-1120 | 3.OA.2 |
| `div_grouping` | "How many groups of 4 in 20?" | 4-50 / 2-10 | 1060-1130 | 3.OA.2 |
| `div_from_multiplication` | "? x 4 = 20, so 20 / 4 = ?" | 4-100 / 2-10 | 1080-1150 | 3.OA.6 |
| `div_fact_families` | Relate *, / within family | 2-10 x 2-10 | 1100-1180 | 3.OA.6 |

```typescript
const divEqualSharing: ProblemTemplate = {
  id: 'div_equal_sharing',
  topic: 'division',
  standards: ['3.OA.2', '3.OA.3'],
  grades: [3],
  baseElo: 1080,
  cpaLevels: ['concrete', 'pictorial', 'abstract'],
  constraints: {
    // We pick divisor and quotient, then compute dividend = divisor * quotient
    // This guarantees even division (no remainders at this level)
    operandRanges: [{ min: 2, max: 5 }, { min: 2, max: 6 }],
  },
  applicableBugs: ['div_multiply_instead', 'div_off_by_one'],
  answerFormat: { type: 'multipleChoice', choiceCount: 4 },
  generate: (rng, difficulty) => {
    const divisor = rng.intRange(2, 5);
    const quotient = rng.intRange(2, 6);
    const dividend = divisor * quotient;

    return {
      id: `divs_${dividend}_${divisor}`,
      templateId: 'div_equal_sharing',
      questionText: `${dividend} ÷ ${divisor} = ?`,
      correctAnswer: { type: 'integer', value: quotient },
      distractors: generateDivisionDistractors(dividend, divisor, quotient),
      eloRating: 1080 + dividend * 2,
      cpaLevel: difficulty.cpaLevel ?? 'pictorial',
      topic: 'division',
      standards: ['3.OA.2'],
      visualHint: {
        type: 'sharing',
        totalItems: dividend,
        groups: divisor,
      },
      metadata: { operation: 'division', representation: 'sharing' },
    };
  },
};
```

### Fractions (Grades 1-3)

| Template ID | Description | Fractions | Elo Range | Standards |
|------------|-------------|-----------|-----------|-----------|
| `frac_identify_half` | "Is this shape split in half?" | 1/2 | 900-950 | 1.G.3 |
| `frac_identify_quarter` | "Color 1/4 of the shape" | 1/4 | 920-970 | 1.G.3 |
| `frac_name_unit` | "What fraction is shaded?" | 1/2, 1/3, 1/4 | 950-1020 | 2.G.3 |
| `frac_equal_parts` | "Is this shape split into equal parts?" | halves, thirds, fourths | 930-990 | 2.G.3 |
| `frac_on_number_line` | "Where is 1/4 on the number line?" | 1/2, 1/3, 1/4, 1/6, 1/8 | 1050-1130 | 3.NF.2 |
| `frac_equivalent` | "Which fraction equals 1/2?" (2/4, 3/6) | unit fractions | 1120-1200 | 3.NF.3 |
| `frac_compare_same_denom` | "Which is bigger: 2/5 or 4/5?" | same denominator | 1080-1150 | 3.NF.3 |
| `frac_compare_same_numer` | "Which is bigger: 1/3 or 1/6?" | same numerator | 1100-1180 | 3.NF.3 |
| `frac_whole_number` | "3/3 = ?" | unit wholes | 1060-1120 | 3.NF.3 |

```typescript
const fracCompareUnitFractions: ProblemTemplate = {
  id: 'frac_compare_same_numer',
  topic: 'fractions',
  standards: ['3.NF.3d'],
  grades: [3],
  baseElo: 1130,
  cpaLevels: ['pictorial', 'abstract'],
  constraints: {
    operandRanges: [
      { min: 2, max: 8 },  // denominator 1
      { min: 2, max: 8 },  // denominator 2
    ],
  },
  applicableBugs: ['frac_larger_denom_larger', 'frac_whole_number_compare'],
  answerFormat: { type: 'multipleChoice', choiceCount: 4 },
  generate: (rng, difficulty) => {
    let d1: number, d2: number;
    do {
      d1 = rng.intRange(2, 8);
      d2 = rng.intRange(2, 8);
    } while (d1 === d2);

    const larger = d1 < d2 ? `1/${d1}` : `1/${d2}`;

    return {
      id: `fcu_${d1}_${d2}`,
      templateId: 'frac_compare_same_numer',
      questionText: `Which is bigger: 1/${d1} or 1/${d2}?`,
      correctAnswer: { type: 'fraction', numerator: 1, denominator: Math.min(d1, d2) },
      distractors: [
        {
          value: { type: 'fraction', numerator: 1, denominator: Math.max(d1, d2) },
          source: 'bug_library',
          bugId: 'frac_larger_denom_larger',
        },
        {
          value: { type: 'fraction', numerator: 1, denominator: Math.min(d1, d2) + 1 },
          source: 'random',
        },
        {
          value: { type: 'fraction', numerator: 2, denominator: Math.max(d1, d2) },
          source: 'random',
        },
      ],
      eloRating: 1130,
      cpaLevel: difficulty.cpaLevel ?? 'pictorial',
      topic: 'fractions',
      standards: ['3.NF.3d'],
      visualHint: {
        type: 'fraction_strips',
        fractions: [
          { numerator: 1, denominator: d1 },
          { numerator: 1, denominator: d2 },
        ],
      },
      metadata: { operation: 'comparison', subtype: 'unit_fractions' },
    };
  },
};
```

### Place Value (Grades 1-3)

| Template ID | Description | Number Range | Elo Range | Standards |
|------------|-------------|-------------|-----------|-----------|
| `pv_tens_and_ones` | "34 has _ tens and _ ones" | 10-99 | 870-940 | 1.NBT.2 |
| `pv_from_blocks` | "3 tens and 7 ones = ?" | 10-99 | 880-950 | 1.NBT.2 |
| `pv_hundreds_tens_ones` | "256 has _ hundreds" | 100-999 | 980-1060 | 2.NBT.1 |
| `pv_expanded_form` | "300 + 40 + 5 = ?" | 100-999 | 1000-1080 | 2.NBT.3 |
| `pv_compare_numbers` | "Which is greater: 342 or 324?" | 100-999 | 960-1040 | 2.NBT.4 |
| `pv_round_nearest_10` | "Round 47 to nearest 10" | 10-99 | 1040-1120 | 3.NBT.1 |
| `pv_round_nearest_100` | "Round 267 to nearest 100" | 100-999 | 1080-1160 | 3.NBT.1 |

### Measurement (Grades 1-3)

| Template ID | Description | Elo Range | Standards |
|------------|-------------|-----------|-----------|
| `meas_length_compare` | "Which is longer?" (pictures) | 850-920 | 1.MD.1 |
| `meas_length_ruler` | "How long is this pencil?" (ruler image) | 920-990 | 2.MD.1 |
| `meas_length_add` | "A 5 cm ribbon and a 7 cm ribbon together" | 970-1050 | 2.MD.5 |
| `meas_time_hour` | "What time does the clock show?" (whole hour) | 880-940 | 1.MD.3 |
| `meas_time_half_hour` | "What time?" (half hour) | 930-990 | 1.MD.3 |
| `meas_time_five_min` | "What time?" (to nearest 5 min) | 990-1060 | 2.MD.7 |
| `meas_time_one_min` | "What time?" (to nearest minute) | 1060-1130 | 3.MD.1 |
| `meas_time_elapsed` | "60 minutes after 2:30 is?" | 1100-1180 | 3.MD.1 |
| `meas_weight_compare` | "Which is heavier?" | 870-930 | 1.MD.1 |
| `meas_money_coins` | "How much? 2 dimes and 3 pennies" | 960-1040 | 2.MD.8 |

### Geometry (Grades 1-3)

| Template ID | Description | Elo Range | Standards |
|------------|-------------|-----------|-----------|
| `geo_identify_2d` | "Which shape is a triangle?" | 830-890 | 1.G.1 |
| `geo_identify_3d` | "Which shape is a cube?" | 870-940 | 1.G.2 |
| `geo_count_sides` | "How many sides does this shape have?" | 850-910 | 2.G.1 |
| `geo_count_vertices` | "How many corners?" | 870-930 | 2.G.1 |
| `geo_partition_halves` | "Split this rectangle into 2 equal parts" | 900-960 | 2.G.3 |
| `geo_partition_rows_cols` | "How many squares? 3 rows, 4 columns" | 980-1060 | 2.G.2 |
| `geo_perimeter` | "Find the perimeter" | 1080-1160 | 3.MD.8 |
| `geo_area_counting` | "Count the squares inside" | 1060-1140 | 3.MD.6 |
| `geo_classify_quadrilateral` | "Is this a square, rectangle, or neither?" | 1040-1120 | 3.G.1 |

---

## 4. Difficulty Calibration

### Elo-to-Difficulty Mapping

Every problem has an Elo rating. The child has an Elo rating. Problem selection targets a **60-point gap** below the child's rating, producing approximately 85% expected success (based on the Elo formula with a 400-point scale):

```
E(success) = 1 / (1 + 10^((problem_elo - child_elo) / 400))

For child_elo = 1060, problem_elo = 1000:
E = 1 / (1 + 10^((1000 - 1060) / 400))
E = 1 / (1 + 10^(-0.15))
E ≈ 0.85  (85% expected success)
```

The 60-point offset is derived from solving for E=0.85:

```
0.85 = 1 / (1 + 10^(d/400))
10^(d/400) = (1/0.85) - 1 = 0.176
d/400 = log10(0.176) = -0.754
d ≈ -60
```

### Difficulty Matrix

Each template's Elo is adjusted based on specific number characteristics:

```typescript
interface DifficultyMatrix {
  /** Base Elo from the template */
  baseElo: number;
  /** Adjustments applied based on generated numbers */
  adjustments: DifficultyAdjustment[];
}

interface DifficultyAdjustment {
  condition: string;
  eloModifier: number;
}

/** Example adjustment table for addition */
const additionDifficultyMatrix: DifficultyAdjustment[] = [
  // Number range adjustments
  { condition: 'both_operands_under_5', eloModifier: -30 },
  { condition: 'operand_is_double', eloModifier: -20 },  // e.g., 6+6
  { condition: 'operand_near_10', eloModifier: -10 },     // e.g., 9+1, 10+3
  { condition: 'both_operands_over_50', eloModifier: +30 },
  { condition: 'three_digit_operands', eloModifier: +80 },

  // Regrouping adjustments
  { condition: 'no_regrouping', eloModifier: -40 },
  { condition: 'single_regrouping', eloModifier: 0 },     // baseline
  { condition: 'double_regrouping', eloModifier: +50 },    // ones AND tens carry
  { condition: 'regrouping_with_zero', eloModifier: +20 }, // e.g., 104 + 97

  // Structural adjustments
  { condition: 'round_number_operand', eloModifier: -15 },  // e.g., 30 + 17
  { condition: 'missing_addend', eloModifier: +40 },        // ? + 5 = 12
  { condition: 'three_addends', eloModifier: +35 },         // 3 + 4 + 5
  { condition: 'word_problem_wrapper', eloModifier: +20 },  // reading comprehension
];
```

```typescript
/** Compute adjusted Elo for a specific problem instance */
function adjustEloByNumbers(baseElo: number, ...operands: number[]): number {
  let adjusted = baseElo;

  // Number magnitude adjustments
  const maxOperand = Math.max(...operands);
  if (maxOperand <= 5) adjusted -= 30;
  else if (maxOperand >= 50) adjusted += 20;
  else if (maxOperand >= 100) adjusted += 60;

  // Doubles bonus (easier — kids memorize these)
  if (operands.length === 2 && operands[0] === operands[1]) {
    adjusted -= 20;
  }

  // Near-10 bonus (easier — make-10 strategy)
  if (operands.some(n => n % 10 === 0 || n % 10 === 9 || n % 10 === 1)) {
    adjusted -= 10;
  }

  return adjusted;
}
```

### Auto-Calibration from Student Performance

Problem Elo ratings are not static. After each attempt, both the child and problem ratings update using the standard Elo formula:

```typescript
const K_FACTOR = 32;  // High K for fast adaptation

function updateEloRatings(
  childElo: number,
  problemElo: number,
  correct: boolean,
): { newChildElo: number; newProblemElo: number } {
  const expected = 1 / (1 + Math.pow(10, (problemElo - childElo) / 400));
  const actual = correct ? 1 : 0;
  const delta = K_FACTOR * (actual - expected);

  return {
    newChildElo: Math.round(childElo + delta),
    newProblemElo: Math.round(problemElo - delta),
  };
}
```

**Auto-calibration flow:**
1. Template starts with a `baseElo` set by curriculum experts
2. `adjustEloByNumbers()` refines per-instance based on number characteristics
3. After each student attempt, problem Elo updates via Elo formula
4. Over thousands of attempts across users, problem Elo converges to true difficulty
5. Periodically (weekly batch), aggregate problem Elo data to update `baseElo` defaults

### Difficulty by Grade Level

| Grade | Child Starting Elo | Problem Elo Range | Typical Topics |
|-------|-------------------|-------------------|----------------|
| 1 | 1000 | 800-1050 | Counting, add/sub within 20, shapes |
| 2 | 1050 | 900-1150 | Add/sub within 100, place value, measurement |
| 3 | 1100 | 950-1300 | Multiplication, division, fractions, area |

---

## 5. Distractor Generation

### Strategy Overview

Each multiple-choice problem needs 3 distractors (wrong answers) plus the correct answer, yielding 4 choices. Distractor quality directly impacts learning — poorly chosen distractors either make the answer obvious or fail to reveal misconceptions.

**Distractor source priority:**
1. **Bug Library distractors** (2 of 3) — answers that result from known misconceptions
2. **Random constrained distractors** (1 of 3) — plausible wrong answers that aren't bug-based

### Bug-Library-Based Distractors

The bug library (from `05-misconception-detection.md`) provides functions that compute what a student with a specific misconception would answer:

```typescript
interface BugFunction {
  bugId: BugId;
  /** Compute the wrong answer a student with this bug would give */
  compute: (operands: number[], operation: Operation) => number | null;
  /** Human-readable description for analytics */
  description: string;
}

/** Addition bug library */
const additionBugs: BugFunction[] = [
  {
    bugId: 'add_no_carry',
    description: 'Ignores carry — adds each column independently',
    compute: ([a, b]) => {
      // 27 + 18: ones = (7+8)%10 = 5, tens = 2+1 = 3 → 35
      const onesSum = (a % 10) + (b % 10);
      const tensSum = Math.floor(a / 10) + Math.floor(b / 10);
      return tensSum * 10 + (onesSum % 10);
    },
  },
  {
    bugId: 'add_carry_wrong',
    description: 'Writes carry digit in ones place instead of carrying',
    compute: ([a, b]) => {
      const onesSum = (a % 10) + (b % 10);
      if (onesSum <= 9) return null; // No carry needed, bug not applicable
      // 27 + 18: ones = 15, writes "15" in result → 315
      const tensSum = Math.floor(a / 10) + Math.floor(b / 10);
      return tensSum * 100 + onesSum;
    },
  },
  {
    bugId: 'add_off_by_one',
    description: 'Answer is off by 1 (counting error)',
    compute: ([a, b]) => a + b + 1, // Could also be -1, handled by caller
  },
  {
    bugId: 'add_concat',
    description: 'Concatenates digits instead of adding',
    compute: ([a, b]) => parseInt(`${a}${b}`, 10),
  },
];

/** Subtraction bug library */
const subtractionBugs: BugFunction[] = [
  {
    bugId: 'sub_smaller_from_larger',
    description: 'Always subtracts smaller digit from larger in each column',
    compute: ([a, b]) => {
      // 42 - 17: |2-7|=5, |4-1|=3 → 35
      const onesA = a % 10, onesB = b % 10;
      const tensA = Math.floor(a / 10), tensB = Math.floor(b / 10);
      return Math.abs(tensA - tensB) * 10 + Math.abs(onesA - onesB);
    },
  },
  {
    bugId: 'sub_no_borrow',
    description: 'Ignores borrowing entirely',
    compute: ([a, b]) => {
      const onesA = a % 10, onesB = b % 10;
      const tensA = Math.floor(a / 10), tensB = Math.floor(b / 10);
      if (onesA >= onesB) return null; // Borrowing not needed
      // Just subtracts tens normally, but writes 0 or wraps ones
      return (tensA - tensB) * 10 + (onesA - onesB + 10);
      // This actually gives the right answer — real bug is forgetting to decrement tens
    },
  },
  {
    bugId: 'sub_borrow_forget_reduce',
    description: 'Borrows 10 for ones but forgets to reduce tens digit',
    compute: ([a, b]) => {
      const onesA = a % 10, onesB = b % 10;
      const tensA = Math.floor(a / 10), tensB = Math.floor(b / 10);
      if (onesA >= onesB) return null;
      // Borrows to make ones work, but does not reduce tens
      return (tensA - tensB) * 10 + ((onesA + 10) - onesB);
    },
  },
];
```

### Distractor Assembly Algorithm

```typescript
function generateDistractors(
  operands: number[],
  correctAnswer: number,
  operation: Operation,
  applicableBugs: BugFunction[],
  rng: SeededRNG,
): Distractor[] {
  const distractors: Distractor[] = [];
  const usedValues = new Set<number>([correctAnswer]);

  // Phase 1: Bug-library distractors (target: 2)
  const shuffledBugs = rng.shuffle([...applicableBugs]);
  for (const bug of shuffledBugs) {
    if (distractors.length >= 2) break;

    const bugAnswer = bug.compute(operands, operation);
    if (
      bugAnswer !== null &&
      !usedValues.has(bugAnswer) &&
      isValidDistractor(bugAnswer, correctAnswer, operation)
    ) {
      distractors.push({
        value: { type: 'integer', value: bugAnswer },
        source: 'bug_library',
        bugId: bug.bugId,
      });
      usedValues.add(bugAnswer);
    }
  }

  // Phase 2: Off-by-one distractor (very common for young children)
  if (distractors.length < 3) {
    const offByOne = correctAnswer + (rng.random() > 0.5 ? 1 : -1);
    if (!usedValues.has(offByOne) && offByOne > 0) {
      distractors.push({
        value: { type: 'integer', value: offByOne },
        source: 'adjacent',
      });
      usedValues.add(offByOne);
    }
  }

  // Phase 3: Random constrained distractors (fill remaining slots)
  while (distractors.length < 3) {
    const range = getDistractorRange(correctAnswer, operation);
    let candidate: number;
    let attempts = 0;
    do {
      candidate = rng.intRange(range.min, range.max);
      attempts++;
    } while (
      (usedValues.has(candidate) || !isValidDistractor(candidate, correctAnswer, operation)) &&
      attempts < 50
    );

    if (attempts < 50) {
      distractors.push({
        value: { type: 'integer', value: candidate },
        source: 'random',
      });
      usedValues.add(candidate);
    } else {
      // Fallback: use a fixed offset
      const fallback = correctAnswer + (distractors.length + 2) * 3;
      distractors.push({
        value: { type: 'integer', value: fallback },
        source: 'random',
      });
      usedValues.add(fallback);
    }
  }

  return distractors;
}
```

### Distractor Validation Rules

```typescript
function isValidDistractor(
  distractor: number,
  correctAnswer: number,
  operation: Operation,
): boolean {
  // No negative distractors for children
  if (distractor < 0) return false;

  // No zero distractor for operations where zero is meaningless
  if (distractor === 0 && operation !== 'subtraction') return false;

  // Must not equal correct answer
  if (distractor === correctAnswer) return false;

  // Must be "in range" — not absurdly far from the answer
  const maxDistance = Math.max(correctAnswer * 0.5, 10);
  if (Math.abs(distractor - correctAnswer) > maxDistance) return false;

  // For very small answers (< 5), keep distractors small
  if (correctAnswer <= 5 && distractor > 10) return false;

  // For fractions: denominator must be positive
  // (handled separately in fraction distractor logic)

  return true;
}

/** Determine reasonable distractor range based on the correct answer */
function getDistractorRange(
  correctAnswer: number,
  operation: Operation,
): { min: number; max: number } {
  if (correctAnswer <= 10) {
    return { min: 1, max: Math.max(correctAnswer + 5, 10) };
  }
  if (correctAnswer <= 100) {
    return {
      min: Math.max(1, correctAnswer - 20),
      max: correctAnswer + 20,
    };
  }
  return {
    min: Math.max(1, correctAnswer - 50),
    max: correctAnswer + 50,
  };
}
```

### Distractor Quality Scoring

For analytics and future improvement, each distractor receives a quality score:

```typescript
interface DistractorQuality {
  /** How often students pick this distractor (higher = more plausible) */
  selectionRate: number;
  /** Whether it maps to a known misconception */
  diagnosticValue: boolean;
  /** How far from the correct answer (normalized) */
  plausibility: number;  // 0-1, higher = more plausible
}

function scoreDistractor(
  distractor: Distractor,
  correctAnswer: number,
): number {
  let score = 0;

  // Bug-library distractors are inherently higher quality
  if (distractor.source === 'bug_library') score += 3;

  // Adjacent (off-by-one) are common real errors
  if (distractor.source === 'adjacent') score += 2;

  // Plausibility: closer to correct = more plausible
  const distance = Math.abs(
    (distractor.value as { value: number }).value - correctAnswer,
  );
  const normalizedDistance = distance / Math.max(correctAnswer, 1);
  score += Math.max(0, 3 - normalizedDistance * 5);

  return score;
}
```

---

## 6. Word Problem Templates

### Variable Pool Design

Word problems use template strings with variable slots. Each variable slot draws from curated pools that ensure diversity in names, objects, and contexts.

```typescript
interface WordProblemTemplate {
  id: string;
  /** Operation this word problem wraps */
  operation: Operation;
  /** Sentence template with {placeholders} */
  template: string;
  /** Which variable pools to use */
  variablePools: Record<string, VariablePoolId>;
  /** Maximum reading level (Flesch-Kincaid grade) */
  maxReadingLevel: number;
  /** Grade levels this template is appropriate for */
  grades: Grade[];
}

interface VariablePool {
  id: VariablePoolId;
  values: string[];
  metadata?: Record<string, string>;  // e.g., pronouns for names
}
```

### Name Pool (Culturally Diverse)

Names are curated to represent multiple cultures, genders, and backgrounds. The pool is intentionally balanced and avoids stereotyping by never associating specific names with specific activities or roles.

```typescript
const namePool: VariablePool = {
  id: 'names',
  values: [
    // East Asian
    'Mei', 'Hiro', 'Yuki', 'Jun', 'Suki', 'Kai',
    // South Asian
    'Priya', 'Arjun', 'Anaya', 'Dev', 'Riya', 'Rohan',
    // African / African-American
    'Amara', 'Kofi', 'Zara', 'Malik', 'Nia', 'Jabari',
    // Hispanic / Latin American
    'Sofia', 'Carlos', 'Luna', 'Diego', 'Isabella', 'Mateo',
    // European / Anglo
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Jack',
    // Middle Eastern
    'Layla', 'Omar', 'Fatima', 'Amir', 'Yasmin', 'Tariq',
    // Indigenous / Pacific
    'Kaia', 'Tane', 'Aroha', 'Manu', 'Seren', 'Bodhi',
    // Gender-neutral
    'Alex', 'Sam', 'Riley', 'Jordan', 'Casey', 'Morgan',
  ],
  metadata: {
    // Pronoun mappings for sentence construction
    'Mei': 'she/her', 'Hiro': 'he/him', 'Yuki': 'they/them',
    'Jun': 'they/them', 'Alex': 'they/them', 'Sam': 'they/them',
    // ... full mapping for all names
  },
};
```

### Object Pools

```typescript
const countableObjectPool: VariablePool = {
  id: 'countable_objects',
  values: [
    // Fruits (avoiding common allergens in descriptions)
    'apples', 'bananas', 'oranges', 'grapes', 'berries',
    // School supplies
    'pencils', 'crayons', 'stickers', 'erasers', 'books',
    // Nature
    'flowers', 'leaves', 'rocks', 'shells', 'butterflies',
    // Toys
    'blocks', 'marbles', 'toy cars', 'balls', 'dolls',
    // Animals
    'fish', 'birds', 'puppies', 'kittens', 'turtles',
  ],
};

const placePool: VariablePool = {
  id: 'places',
  values: [
    'the park', 'the garden', 'school', 'the library',
    'the playground', 'the store', 'the farm', 'the beach',
    'the kitchen', 'the art room', 'the zoo', 'the market',
  ],
};

const containerPool: VariablePool = {
  id: 'containers',
  values: [
    'basket', 'box', 'bag', 'jar', 'bucket',
    'tray', 'bowl', 'shelf', 'backpack', 'pocket',
  ],
};
```

### Word Problem Templates by Operation

```typescript
const additionWordProblems: WordProblemTemplate[] = [
  {
    id: 'wp_add_combine',
    operation: 'addition',
    template: '{name1} has {a} {objects}. {name2} has {b} {objects}. How many {objects} do they have together?',
    variablePools: { name1: 'names', name2: 'names', objects: 'countable_objects' },
    maxReadingLevel: 2,
    grades: [1, 2],
  },
  {
    id: 'wp_add_join',
    operation: 'addition',
    template: '{name} had {a} {objects}. {pronoun_subject} found {b} more at {place}. How many {objects} does {name} have now?',
    variablePools: { name: 'names', objects: 'countable_objects', place: 'places' },
    maxReadingLevel: 2,
    grades: [1, 2],
  },
  {
    id: 'wp_add_collection',
    operation: 'addition',
    template: 'There are {a} {objects} in one {container} and {b} {objects} in another {container}. How many {objects} are there in all?',
    variablePools: { objects: 'countable_objects', container: 'containers' },
    maxReadingLevel: 2,
    grades: [1, 2, 3],
  },
];

const subtractionWordProblems: WordProblemTemplate[] = [
  {
    id: 'wp_sub_take_away',
    operation: 'subtraction',
    template: '{name} had {a} {objects}. {pronoun_subject} gave {b} to a friend. How many {objects} does {name} have left?',
    variablePools: { name: 'names', objects: 'countable_objects' },
    maxReadingLevel: 2,
    grades: [1, 2],
  },
  {
    id: 'wp_sub_compare',
    operation: 'subtraction',
    template: '{name1} has {a} {objects}. {name2} has {b} {objects}. How many more {objects} does {name1} have than {name2}?',
    variablePools: { name1: 'names', name2: 'names', objects: 'countable_objects' },
    maxReadingLevel: 2,
    grades: [2, 3],
  },
];

const multiplicationWordProblems: WordProblemTemplate[] = [
  {
    id: 'wp_mul_groups',
    operation: 'multiplication',
    template: 'There are {a} {containers}. Each {container_singular} has {b} {objects}. How many {objects} are there in all?',
    variablePools: { containers: 'containers', objects: 'countable_objects' },
    maxReadingLevel: 2,
    grades: [2, 3],
  },
  {
    id: 'wp_mul_array',
    operation: 'multiplication',
    template: '{name} planted {a} rows of {objects} with {b} in each row. How many {objects} did {name} plant?',
    variablePools: { name: 'names', objects: 'countable_objects' },
    maxReadingLevel: 2,
    grades: [3],
  },
];

const divisionWordProblems: WordProblemTemplate[] = [
  {
    id: 'wp_div_sharing',
    operation: 'division',
    template: '{name} has {a} {objects} to share equally among {b} friends. How many {objects} does each friend get?',
    variablePools: { name: 'names', objects: 'countable_objects' },
    maxReadingLevel: 2,
    grades: [3],
  },
  {
    id: 'wp_div_grouping',
    operation: 'division',
    template: '{name} has {a} {objects}. {pronoun_subject} puts {b} {objects} in each {container}. How many {containers} does {name} need?',
    variablePools: { name: 'names', objects: 'countable_objects', container: 'containers' },
    maxReadingLevel: 2,
    grades: [3],
  },
];
```

### Word Problem Generation

```typescript
function generateWordProblem(
  template: WordProblemTemplate,
  operands: number[],
  rng: SeededRNG,
): string {
  let text = template.template;
  const usedNames = new Set<string>();

  // Replace variable placeholders
  for (const [placeholder, poolId] of Object.entries(template.variablePools)) {
    const pool = getPool(poolId);
    let value: string;

    if (poolId === 'names') {
      // Ensure no duplicate names in the same problem
      do {
        value = rng.pick(pool.values);
      } while (usedNames.has(value));
      usedNames.add(value);
    } else {
      value = rng.pick(pool.values);
    }

    text = text.replaceAll(`{${placeholder}}`, value);
  }

  // Replace operand placeholders
  text = text.replace('{a}', String(operands[0]));
  text = text.replace('{b}', String(operands[1]));

  // Replace pronoun placeholders based on name metadata
  text = resolvePronounsInText(text, usedNames, namePool.metadata ?? {});

  return text;
}

/** Resolve {pronoun_subject}, {pronoun_object}, {pronoun_possessive} */
function resolvePronounsInText(
  text: string,
  usedNames: Set<string>,
  pronounMap: Record<string, string>,
): string {
  // Use the most recently referenced name's pronouns
  const names = Array.from(usedNames);
  const lastNamePronouns = pronounMap[names[names.length - 1]] ?? 'they/them';
  const [subject, object] = lastNamePronouns.split('/');

  const subjectCap = subject.charAt(0).toUpperCase() + subject.slice(1);

  return text
    .replaceAll('{pronoun_subject}', subjectCap)
    .replaceAll('{pronoun_object}', object)
    .replaceAll('{pronoun_possessive}', getPossessive(subject));
}

function getPossessive(subject: string): string {
  const map: Record<string, string> = {
    she: 'her', he: 'his', they: 'their',
  };
  return map[subject] ?? 'their';
}
```

### Reading Level Considerations

| Age | Max Words | Max Syllables/Word | Vocabulary Level | Example Sentence Complexity |
|-----|-----------|-------------------|------------------|-----------------------------|
| 6-7 | 12-15 per sentence | 2 | Basic (has, more, many) | "Sam has 5 apples. He gets 3 more." |
| 7-8 | 15-18 per sentence | 2-3 | Standard (together, each, left) | "There are 4 bags with 3 oranges in each bag." |
| 8-9 | 18-22 per sentence | 3 | Math terms (equally, total, remaining) | "Luna has 24 stickers to share equally among 4 friends." |

### Anti-Stereotype Guidelines

The word problem generator follows these rules:

1. **Names are never associated with specific activities** — any name can appear in any context
2. **No gender-activity stereotypes** — boys cook, girls build, everyone plays sports
3. **No cultural-food stereotypes** — avoid associating specific foods with specific cultural names
4. **Avoid common allergens** in food-related problems (no peanuts, tree nuts, shellfish references)
5. **No scary contexts** — no monsters, danger, loss, or negative scenarios
6. **Activities are universally relatable** — parks, schools, gardens, not culture-specific venues
7. **No wealth-based scenarios** — avoid "buying a $500 bike" or luxury items

---

## 7. Number Selection Algorithms

### Seeded Random Number Generator (Mulberry32)

Deterministic random number generation is essential for:
- **Reproducibility**: Same seed produces same problems (for debugging, test replay)
- **Session consistency**: If a child restarts, they see the same session
- **Testing**: Property-based tests need deterministic generation

```typescript
/**
 * Mulberry32 — 32-bit seeded PRNG.
 *
 * Fast, minimal state, excellent distribution for non-cryptographic use.
 * Period: 2^32. Passes SmallCrush and most of BigCrush.
 *
 * Reference: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 */
class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0; // Ensure 32-bit integer
  }

  /** Returns a float in [0, 1) */
  random(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] (inclusive) */
  intRange(min: number, max: number): number {
    return min + Math.floor(this.random() * (max - min + 1));
  }

  /** Returns a random element from an array */
  pick<T>(array: readonly T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  /** Fisher-Yates shuffle (in-place) */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /** Fork: create a child RNG with a derived seed */
  fork(): SeededRNG {
    return new SeededRNG(Math.floor(this.random() * 4294967296));
  }
}
```

### Constrained Number Selection

The core challenge: generating numbers that satisfy all template constraints simultaneously. Naive rejection sampling (generate random numbers, reject if they violate constraints) works for simple cases but can loop indefinitely for tight constraints.

**Strategy: Constructive generation over rejection sampling where possible.**

```typescript
interface NumberSelectionConfig {
  operandRanges: Array<{ min: number; max: number }>;
  resultRange?: { min: number; max: number };
  requiresRegrouping?: boolean;
  forbidRegrouping?: boolean;
  excludeOperands?: number[];
  maxAttempts: number;  // Safety limit for rejection loop
}

/**
 * Generates operands that satisfy all constraints.
 *
 * Uses a hybrid approach:
 * 1. Constructive selection for structural constraints (regrouping)
 * 2. Rejection sampling for remaining constraints
 * 3. Hard limit on attempts with fallback to known-good values
 */
function selectNumbers(
  config: NumberSelectionConfig,
  operation: Operation,
  rng: SeededRNG,
): number[] | null {
  const { operandRanges, resultRange, maxAttempts } = config;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const operands = operandRanges.map(range =>
      rng.intRange(range.min, range.max),
    );

    // Check exclusions
    if (config.excludeOperands?.some(ex => operands.includes(ex))) continue;

    // Compute result
    const result = computeResult(operands, operation);

    // Check result range
    if (resultRange && (result < resultRange.min || result > resultRange.max)) continue;

    // Check regrouping constraints
    if (config.requiresRegrouping && !hasRegrouping(operands, operation)) continue;
    if (config.forbidRegrouping && hasRegrouping(operands, operation)) continue;

    // Check for degenerate cases
    if (isDegenerateCase(operands, operation)) continue;

    return operands;
  }

  // Exhausted attempts — return null, caller uses fallback
  return null;
}

/** Check if an addition/subtraction requires regrouping (carrying/borrowing) */
function hasRegrouping(operands: number[], operation: Operation): boolean {
  const [a, b] = operands;
  if (operation === 'addition') {
    // Check ones column carry
    return (a % 10) + (b % 10) > 9;
  }
  if (operation === 'subtraction') {
    // Check ones column borrow
    return (a % 10) < (b % 10);
  }
  return false;
}
```

### Constructive Generation for Regrouping

For regrouping problems, rejection sampling can be slow. Instead, we construct numbers that guarantee regrouping:

```typescript
/**
 * Constructively generates two 2-digit numbers that require carrying.
 * Instead of random-then-reject, we build numbers from constraints.
 */
function constructRegroupingAddition(rng: SeededRNG): [number, number] {
  // Step 1: Pick ones digits that sum > 9
  const onesA = rng.intRange(2, 9);
  const onesB = rng.intRange(Math.max(2, 10 - onesA), 9);
  // onesA + onesB is guaranteed > 9

  // Step 2: Pick tens digits freely
  const tensA = rng.intRange(1, 8);
  const tensB = rng.intRange(1, 8);
  // Upper bound on tens avoids 3-digit results if desired

  const a = tensA * 10 + onesA;
  const b = tensB * 10 + onesB;

  return [a, b];
}

/**
 * Constructively generates subtraction with borrowing.
 */
function constructBorrowingSubtraction(rng: SeededRNG): [number, number] {
  // Step 1: Pick ones digits where b_ones > a_ones (forces borrow)
  const onesA = rng.intRange(0, 7);
  const onesB = rng.intRange(onesA + 1, 9);

  // Step 2: Pick tens digits where a_tens > b_tens (positive result)
  const tensB = rng.intRange(1, 7);
  const tensA = rng.intRange(tensB + 1, 9);
  // After borrowing: (tensA-1) - tensB >= 0 since tensA > tensB

  const a = tensA * 10 + onesA;
  const b = tensB * 10 + onesB;

  return [a, b];
}
```

### Avoiding Trivial and Degenerate Cases

```typescript
/**
 * Detects degenerate cases that are too trivial or confusing.
 * These problems teach bad habits or are not useful practice.
 */
function isDegenerateCase(operands: number[], operation: Operation): boolean {
  const [a, b] = operands;

  switch (operation) {
    case 'addition':
      if (a === 0 || b === 0) return true;    // +0 is trivial
      if (a === b) return false;              // Doubles are fine (useful pattern)
      return false;

    case 'subtraction':
      if (b === 0) return true;               // -0 is trivial
      if (a === b) return true;               // x-x=0 is trivial
      if (a < b) return true;                 // Negative results not for ages 6-9
      return false;

    case 'multiplication':
      if (a === 0 || b === 0) return true;    // x0 is trivial (test separately)
      if (a === 1 || b === 1) return true;    // x1 is trivial (test separately)
      return false;

    case 'division':
      if (b === 0) return true;               // Division by zero
      if (b === 1) return true;               // /1 is trivial
      if (a === b) return true;               // x/x=1 is trivial
      if (a % b !== 0) return true;           // No remainders at this level
      return false;

    default:
      return false;
  }
}
```

### Seed Strategy for Sessions

```typescript
/**
 * Session seed is derived from child ID + date.
 * This ensures:
 * - Same child sees same session if they restart
 * - Different children get different problems
 * - Sessions vary day to day
 */
function computeSessionSeed(childId: string, dateStr: string): number {
  // Simple hash from strings → 32-bit integer
  const combined = `${childId}:${dateStr}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash;
}

// Each problem in the session gets a unique sub-seed
function problemSeed(sessionSeed: number, problemIndex: number): number {
  return (sessionSeed * 2654435761 + problemIndex) | 0;
}
```

---

## 8. Answer Validation & Equivalence

### Integer Answer Checking

The simplest case: the student provides a number, we compare it to the correct answer.

```typescript
function checkIntegerAnswer(
  studentAnswer: string,
  correctAnswer: number,
): AnswerResult {
  const parsed = parseIntegerInput(studentAnswer);
  if (parsed === null) {
    return { correct: false, reason: 'invalid_input' };
  }
  if (parsed === correctAnswer) {
    return { correct: true };
  }
  return {
    correct: false,
    reason: 'wrong_answer',
    studentValue: parsed,
    correctValue: correctAnswer,
  };
}

/** Parse free-text integer input from a child */
function parseIntegerInput(input: string): number | null {
  // Trim whitespace
  const trimmed = input.trim();

  // Empty input
  if (trimmed === '') return null;

  // Remove leading zeros (but keep "0" itself)
  const normalized = trimmed.replace(/^0+(?=\d)/, '');

  // Must be only digits (no decimals, no signs for this age group)
  if (!/^\d+$/.test(normalized)) return null;

  const value = parseInt(normalized, 10);

  // Sanity bound — children should not be entering numbers > 10000
  if (value > 10000) return null;

  return value;
}
```

### Fraction Answer Checking

Fractions require equivalence checking. A child answering "2/4" when the correct answer is "1/2" should be marked correct (unless the problem specifically asks for simplified form).

```typescript
interface FractionAnswer {
  numerator: number;
  denominator: number;
}

function checkFractionAnswer(
  studentAnswer: string,
  correctAnswer: FractionAnswer,
  requireSimplified: boolean,
): AnswerResult {
  const parsed = parseFractionInput(studentAnswer);
  if (parsed === null) {
    return { correct: false, reason: 'invalid_input' };
  }

  // Check equivalence: a/b = c/d iff a*d = b*c
  const isEquivalent =
    parsed.numerator * correctAnswer.denominator ===
    parsed.denominator * correctAnswer.numerator;

  if (!isEquivalent) {
    return {
      correct: false,
      reason: 'wrong_answer',
      studentValue: parsed,
      correctValue: correctAnswer,
    };
  }

  // If simplified form is required, check that too
  if (requireSimplified) {
    const gcdValue = gcd(parsed.numerator, parsed.denominator);
    if (gcdValue > 1) {
      return {
        correct: false,
        reason: 'not_simplified',
        studentValue: parsed,
        correctValue: correctAnswer,
        hint: `Can you simplify ${parsed.numerator}/${parsed.denominator}?`,
      };
    }
  }

  return { correct: true };
}

function parseFractionInput(input: string): FractionAnswer | null {
  const trimmed = input.trim();

  // Format: "n/d"
  const match = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;

  const numerator = parseInt(match[1], 10);
  const denominator = parseInt(match[2], 10);

  // Denominator must be positive and non-zero
  if (denominator <= 0) return null;

  // Sanity bounds
  if (numerator > 100 || denominator > 100) return null;

  return { numerator, denominator };
}

/** Greatest common divisor (Euclidean algorithm) */
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b > 0) {
    [a, b] = [b, a % b];
  }
  return a;
}
```

### Time Answer Checking

```typescript
interface TimeAnswer {
  hours: number;
  minutes: number;
}

function checkTimeAnswer(
  studentAnswer: string,
  correctAnswer: TimeAnswer,
): AnswerResult {
  const parsed = parseTimeInput(studentAnswer);
  if (parsed === null) {
    return { correct: false, reason: 'invalid_input' };
  }

  // Handle 12-hour equivalence (1:30 and 13:30 not needed for this age group)
  if (parsed.hours === correctAnswer.hours && parsed.minutes === correctAnswer.minutes) {
    return { correct: true };
  }

  return { correct: false, reason: 'wrong_answer' };
}

function parseTimeInput(input: string): TimeAnswer | null {
  const trimmed = input.trim();

  // Format: "H:MM" or "HH:MM"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 1 || hours > 12) return null;
  if (minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
}
```

### Measurement Answer Checking

```typescript
function checkMeasurementAnswer(
  studentAnswer: string,
  correctAnswer: { value: number; unit: MeasurementUnit },
  tolerance: number = 0,  // For estimation problems
): AnswerResult {
  const parsed = parseMeasurementInput(studentAnswer);
  if (parsed === null) {
    return { correct: false, reason: 'invalid_input' };
  }

  // Unit must match (no unit conversion at this age)
  if (parsed.unit !== correctAnswer.unit) {
    return { correct: false, reason: 'wrong_unit' };
  }

  // Value check with optional tolerance
  if (Math.abs(parsed.value - correctAnswer.value) <= tolerance) {
    return { correct: true };
  }

  return { correct: false, reason: 'wrong_answer' };
}
```

### Multiple Choice Validation

Multiple-choice is the simplest — just an index match. But we shuffle options and track which distractor was selected for misconception detection:

```typescript
function validateMultipleChoice(
  selectedIndex: number,
  options: Array<MathAnswer | Distractor>,
  correctIndex: number,
): AnswerResult & { selectedDistractor?: Distractor } {
  if (selectedIndex === correctIndex) {
    return { correct: true };
  }

  const selected = options[selectedIndex];
  const distractor = 'bugId' in selected ? selected as Distractor : undefined;

  return {
    correct: false,
    reason: 'wrong_answer',
    selectedDistractor: distractor,
  };
}
```

### Answer Result Type

```typescript
interface AnswerResult {
  correct: boolean;
  reason?: 'wrong_answer' | 'invalid_input' | 'not_simplified' | 'wrong_unit';
  studentValue?: unknown;
  correctValue?: unknown;
  hint?: string;
  selectedDistractor?: Distractor;
}
```

---

## 9. Session Composition Algorithm

### Session Structure

Every session follows a **warmup-core-cooldown** arc designed to build confidence, challenge appropriately, and end on a positive note:

```
Session Timeline (15-20 min)
├── Warmup Phase (2-3 problems, ~2 min)
│   └── Easy review from mastered skills (Leitner Box 5-6)
│   └── Purpose: build confidence, activate prior knowledge
│
├── Core Phase (8-14 problems, ~12 min)
│   ├── 60% Review — skills due for spaced repetition
│   ├── 30% New — skills from the outer fringe
│   └── 10% Challenge — slightly above current Elo
│   └── Misconception probes inserted when bugs are suspected
│
├── Break (optional mini-game, ~1 min)
│
└── Cooldown Phase (2-3 problems, ~2 min)
    └── At or slightly below current level
    └── Purpose: end on success, consolidate learning
```

### Session Composer Implementation

```typescript
interface SessionConfig {
  /** Total number of problems in the session */
  totalProblems: number;
  /** Warmup problem count */
  warmupCount: number;
  /** Cooldown problem count */
  cooldownCount: number;
  /** Mix ratios for core phase (must sum to 1.0) */
  coreMix: { review: number; new: number; challenge: number };
  /** Child's current state */
  childProfile: ChildProfile;
  /** Per-skill states (Leitner box, BKT, Elo) */
  skillStates: Map<string, SkillState>;
  /** Active misconceptions to probe */
  activeBugs: MisconceptionRecord[];
  /** Session RNG seed */
  seed: number;
}

interface SessionPlan {
  problems: PlannedProblem[];
  phases: {
    warmup: { start: number; end: number };
    core: { start: number; end: number };
    cooldown: { start: number; end: number };
  };
}

function composeSession(config: SessionConfig): SessionPlan {
  const rng = new SeededRNG(config.seed);
  const problems: PlannedProblem[] = [];
  const {
    totalProblems,
    warmupCount,
    cooldownCount,
    coreMix,
    childProfile,
    skillStates,
    activeBugs,
  } = config;

  const coreCount = totalProblems - warmupCount - cooldownCount;

  // Phase 1: Warmup — easy, mastered skills
  const warmupProblems = selectWarmupProblems(
    warmupCount, skillStates, childProfile, rng,
  );
  problems.push(...warmupProblems);

  // Phase 2: Core — mixed review/new/challenge
  const reviewCount = Math.round(coreCount * coreMix.review);
  const newCount = Math.round(coreCount * coreMix.new);
  const challengeCount = coreCount - reviewCount - newCount;

  const reviewProblems = selectReviewProblems(
    reviewCount, skillStates, childProfile, rng,
  );
  const newProblems = selectNewProblems(
    newCount, skillStates, childProfile, rng,
  );
  const challengeProblems = selectChallengeProblems(
    challengeCount, skillStates, childProfile, rng,
  );

  // Interleave core problems (don't cluster all review then all new)
  const coreProblems = interleaveProblems(
    reviewProblems, newProblems, challengeProblems, rng,
  );

  // Insert misconception probes into core
  if (activeBugs.length > 0) {
    insertMisconceptionProbes(coreProblems, activeBugs, rng);
  }

  problems.push(...coreProblems);

  // Phase 3: Cooldown — easy, confidence-building
  const cooldownProblems = selectCooldownProblems(
    cooldownCount, skillStates, childProfile, rng,
  );
  problems.push(...cooldownProblems);

  return {
    problems,
    phases: {
      warmup: { start: 0, end: warmupCount },
      core: { start: warmupCount, end: warmupCount + coreCount },
      cooldown: { start: warmupCount + coreCount, end: totalProblems },
    },
  };
}
```

### Problem Selection by Category

```typescript
/** Warmup: pick from well-mastered skills (Leitner Box 5-6) */
function selectWarmupProblems(
  count: number,
  skillStates: Map<string, SkillState>,
  profile: ChildProfile,
  rng: SeededRNG,
): PlannedProblem[] {
  const mastered = Array.from(skillStates.entries())
    .filter(([_, state]) => state.leitnerBox >= 5)
    .map(([id]) => id);

  if (mastered.length === 0) {
    // New user — use the easiest available skills
    return selectEasiestProblems(count, skillStates, profile, rng);
  }

  const selected = rng.shuffle([...mastered]).slice(0, count);
  return selected.map(skillId => {
    const targetElo = profile.eloRating - 150; // Well below level
    return generatePlannedProblem(skillId, targetElo, 'warmup', rng);
  });
}

/** Review: pick skills due for spaced repetition (Leitner schedule) */
function selectReviewProblems(
  count: number,
  skillStates: Map<string, SkillState>,
  profile: ChildProfile,
  rng: SeededRNG,
): PlannedProblem[] {
  const now = Date.now();
  const dueSkills = Array.from(skillStates.entries())
    .filter(([_, state]) => state.nextReviewDue <= now)
    .sort(([, a], [, b]) => a.nextReviewDue - b.nextReviewDue); // Most overdue first

  const selected = dueSkills.slice(0, count);
  return selected.map(([skillId]) => {
    const targetElo = profile.eloRating - 60; // Standard 85% target
    return generatePlannedProblem(skillId, targetElo, 'review', rng);
  });
}

/** New: pick skills from the outer fringe (prerequisites mastered) */
function selectNewProblems(
  count: number,
  skillStates: Map<string, SkillState>,
  profile: ChildProfile,
  rng: SeededRNG,
): PlannedProblem[] {
  const mastered = new Set(
    Array.from(skillStates.entries())
      .filter(([_, state]) => state.bktProbability >= 0.95)
      .map(([id]) => id),
  );

  const fringe = getOuterFringe(mastered);
  const selected = rng.shuffle([...fringe]).slice(0, count);

  return selected.map(skillId => {
    // New problems should be slightly easier to introduce concepts gently
    const targetElo = profile.eloRating - 100;
    return generatePlannedProblem(skillId, targetElo, 'new', rng);
  });
}

/** Challenge: pick problems slightly above the child's level */
function selectChallengeProblems(
  count: number,
  skillStates: Map<string, SkillState>,
  profile: ChildProfile,
  rng: SeededRNG,
): PlannedProblem[] {
  const inProgress = Array.from(skillStates.entries())
    .filter(([_, state]) =>
      state.bktProbability >= 0.5 && state.bktProbability < 0.95,
    )
    .map(([id]) => id);

  const selected = rng.shuffle([...inProgress]).slice(0, count);
  return selected.map(skillId => {
    // Challenge: above child's level (expect ~65% success)
    const targetElo = profile.eloRating + 40;
    return generatePlannedProblem(skillId, targetElo, 'challenge', rng);
  });
}

/** Cooldown: easy problems to end on a positive note */
function selectCooldownProblems(
  count: number,
  skillStates: Map<string, SkillState>,
  profile: ChildProfile,
  rng: SeededRNG,
): PlannedProblem[] {
  const comfortable = Array.from(skillStates.entries())
    .filter(([_, state]) => state.leitnerBox >= 3)
    .map(([id]) => id);

  const selected = rng.shuffle([...comfortable]).slice(0, count);
  return selected.map(skillId => {
    const targetElo = profile.eloRating - 120; // Well within comfort zone
    return generatePlannedProblem(skillId, targetElo, 'cooldown', rng);
  });
}
```

### Interleaving Algorithm

Core problems are interleaved to prevent topic clustering. This uses a round-robin with jitter approach:

```typescript
/**
 * Interleave problem categories to prevent clustering.
 *
 * Instead of: RRRRRRNNNCC
 * Produces:   RNRRNCRNRR
 *
 * Research shows interleaved practice improves retention
 * compared to blocked practice (Roediger & Karpicke, 2006).
 */
function interleaveProblems(
  review: PlannedProblem[],
  newProblems: PlannedProblem[],
  challenge: PlannedProblem[],
  rng: SeededRNG,
): PlannedProblem[] {
  const pools = [
    { items: [...review], weight: 0.6 },
    { items: [...newProblems], weight: 0.3 },
    { items: [...challenge], weight: 0.1 },
  ];

  const result: PlannedProblem[] = [];
  const totalRemaining = () => pools.reduce((sum, p) => sum + p.items.length, 0);

  while (totalRemaining() > 0) {
    // Weighted random selection from non-empty pools
    const availablePools = pools.filter(p => p.items.length > 0);
    const totalWeight = availablePools.reduce((sum, p) => sum + p.weight, 0);
    let r = rng.random() * totalWeight;

    for (const pool of availablePools) {
      r -= pool.weight;
      if (r <= 0) {
        result.push(pool.items.shift()!);
        break;
      }
    }
  }

  return result;
}
```

### Frustration Detection and Recovery

Real-time frustration detection runs during the session and modifies problem selection on the fly:

```typescript
interface FrustrationState {
  consecutiveWrong: number;
  totalWrong: number;
  totalAttempted: number;
  recentAccuracy: number[];  // Last 5 answers (1=correct, 0=wrong)
}

function updateFrustrationState(
  state: FrustrationState,
  correct: boolean,
): FrustrationAction {
  state.totalAttempted++;
  state.recentAccuracy.push(correct ? 1 : 0);
  if (state.recentAccuracy.length > 5) state.recentAccuracy.shift();

  if (correct) {
    state.consecutiveWrong = 0;
    state.totalWrong = state.totalWrong; // unchanged
    return { action: 'continue' };
  }

  state.consecutiveWrong++;
  state.totalWrong++;

  // 3 wrong in a row → reduce difficulty
  if (state.consecutiveWrong === 3) {
    return {
      action: 'reduce_difficulty',
      eloReduction: 100,
      insertEasyWin: true,
      showEncouragement: true,
    };
  }

  // 5 wrong in a row → suggest a break
  if (state.consecutiveWrong >= 5) {
    return {
      action: 'suggest_break',
      message: 'You are doing great work! Want to take a little break?',
    };
  }

  // Running accuracy below 50% over last 5 → gradually reduce difficulty
  const recentRate = state.recentAccuracy.reduce((a, b) => a + b, 0) / state.recentAccuracy.length;
  if (recentRate < 0.5 && state.totalAttempted >= 5) {
    return {
      action: 'reduce_difficulty',
      eloReduction: 50,
      insertEasyWin: false,
      showEncouragement: true,
    };
  }

  return { action: 'continue' };
}

type FrustrationAction =
  | { action: 'continue' }
  | {
      action: 'reduce_difficulty';
      eloReduction: number;
      insertEasyWin: boolean;
      showEncouragement: boolean;
    }
  | { action: 'suggest_break'; message: string };
```

### Flow State Maintenance

The session composer tries to keep the child in a flow state — challenged enough to stay engaged, but not so much that they get frustrated:

```typescript
/**
 * Dynamic difficulty adjustment within a session.
 *
 * After each answer, the effective target Elo is nudged:
 * - Correct → slight increase (+10 Elo, capped at +60 from base)
 * - Wrong → slight decrease (-15 Elo, capped at -80 from base)
 *
 * This creates a "rubber band" effect that gravitates toward
 * the 85% sweet spot.
 */
function adjustSessionDifficulty(
  baseDifficulty: number,
  currentOffset: number,
  correct: boolean,
): number {
  const maxUp = 60;
  const maxDown = -80;

  let newOffset: number;
  if (correct) {
    newOffset = Math.min(currentOffset + 10, maxUp);
  } else {
    newOffset = Math.max(currentOffset - 15, maxDown);
  }

  return baseDifficulty + newOffset;
}
```

### Session Config by Age

```typescript
function getSessionConfigForAge(age: number): Partial<SessionConfig> {
  switch (age) {
    case 6:
    case 7:
      return {
        totalProblems: 12,
        warmupCount: 2,
        cooldownCount: 2,
        coreMix: { review: 0.6, new: 0.3, challenge: 0.1 },
      };
    case 8:
      return {
        totalProblems: 15,
        warmupCount: 3,
        cooldownCount: 2,
        coreMix: { review: 0.6, new: 0.3, challenge: 0.1 },
      };
    case 9:
      return {
        totalProblems: 18,
        warmupCount: 3,
        cooldownCount: 3,
        coreMix: { review: 0.6, new: 0.3, challenge: 0.1 },
      };
    default:
      return {
        totalProblems: 15,
        warmupCount: 3,
        cooldownCount: 2,
        coreMix: { review: 0.6, new: 0.3, challenge: 0.1 },
      };
  }
}
```

---

## 10. Testing Strategy

### Property-Based Testing with fast-check

The math engine is ideal for property-based testing. Every generator must satisfy invariants that hold regardless of inputs. We use `fast-check` (compatible with Jest) for this.

```bash
npm install --save-dev fast-check
```

#### Core Invariants

Every generated problem must satisfy these properties:

```typescript
import fc from 'fast-check';

describe('Problem Generator Invariants', () => {
  test('correct answer is always mathematically correct', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        fc.integer({ min: 1, max: 99 }),
        fc.integer({ min: 1, max: 2 ** 31 }),
        (a, b, seed) => {
          const rng = new SeededRNG(seed);
          const problem = addWithin100.generate(rng, { cpaLevel: 'abstract' });
          const parsed = parseProblemExpression(problem.questionText);
          expect(parsed.result).toBe(
            (problem.correctAnswer as { value: number }).value,
          );
        },
      ),
      { numRuns: 1000 },
    );
  });

  test('no distractor equals the correct answer', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = addTwoDigitRegroup.generate(rng, { cpaLevel: 'abstract' });
          const correctValue = (problem.correctAnswer as { value: number }).value;
          for (const d of problem.distractors) {
            const dValue = (d.value as { value: number }).value;
            expect(dValue).not.toBe(correctValue);
          }
        },
      ),
      { numRuns: 500 },
    );
  });

  test('no duplicate distractors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = subTwoDigitRegroup.generate(rng, { cpaLevel: 'abstract' });
          const values = problem.distractors.map(
            d => (d.value as { value: number }).value,
          );
          const unique = new Set(values);
          expect(unique.size).toBe(values.length);
        },
      ),
      { numRuns: 500 },
    );
  });

  test('all distractors are non-negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = subWithin20Regroup.generate(rng, { cpaLevel: 'abstract' });
          for (const d of problem.distractors) {
            expect((d.value as { value: number }).value).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      { numRuns: 500 },
    );
  });

  test('Elo rating stays within expected bounds for template', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = mulArrays.generate(rng, { cpaLevel: 'pictorial' });
          // Base Elo 1050 ± 200 max adjustment
          expect(problem.eloRating).toBeGreaterThanOrEqual(850);
          expect(problem.eloRating).toBeLessThanOrEqual(1250);
        },
      ),
      { numRuns: 500 },
    );
  });
});
```

#### Regrouping Invariants

```typescript
describe('Regrouping Constraint Invariants', () => {
  test('regrouping-required templates always produce carrying problems', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = addTwoDigitRegroup.generate(rng, { cpaLevel: 'abstract' });
          const match = problem.questionText.match(/(\d+)\s*\+\s*(\d+)/);
          expect(match).not.toBeNull();
          const [a, b] = [parseInt(match![1]), parseInt(match![2])];
          // Ones column must carry
          expect((a % 10) + (b % 10)).toBeGreaterThan(9);
        },
      ),
      { numRuns: 1000 },
    );
  });

  test('no-regrouping templates never produce carrying problems', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = addTwoDigitNoRegroup.generate(rng, { cpaLevel: 'abstract' });
          const match = problem.questionText.match(/(\d+)\s*\+\s*(\d+)/);
          expect(match).not.toBeNull();
          const [a, b] = [parseInt(match![1]), parseInt(match![2])];
          expect((a % 10) + (b % 10)).toBeLessThanOrEqual(9);
        },
      ),
      { numRuns: 1000 },
    );
  });
});
```

#### Division Invariants

```typescript
describe('Division Invariants', () => {
  test('division problems always have integer quotients (no remainders)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = divEqualSharing.generate(rng, { cpaLevel: 'abstract' });
          const match = problem.questionText.match(/(\d+)\s*÷\s*(\d+)/);
          const [dividend, divisor] = [parseInt(match![1]), parseInt(match![2])];
          expect(dividend % divisor).toBe(0);
        },
      ),
      { numRuns: 500 },
    );
  });

  test('division never divides by zero or one', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        (seed) => {
          const rng = new SeededRNG(seed);
          const problem = divEqualSharing.generate(rng, { cpaLevel: 'abstract' });
          const match = problem.questionText.match(/÷\s*(\d+)/);
          const divisor = parseInt(match![1]);
          expect(divisor).toBeGreaterThan(1);
        },
      ),
      { numRuns: 500 },
    );
  });
});
```

#### SeededRNG Determinism Test

```typescript
describe('SeededRNG', () => {
  test('same seed produces same sequence', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);
    for (let i = 0; i < 1000; i++) {
      expect(rng1.random()).toBe(rng2.random());
    }
  });

  test('different seeds produce different sequences', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(43);
    // Extremely unlikely that even one matches
    let matches = 0;
    for (let i = 0; i < 100; i++) {
      if (rng1.random() === rng2.random()) matches++;
    }
    expect(matches).toBeLessThan(5);
  });

  test('intRange produces values within bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 ** 31 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (seed, a, b) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          if (min === max) return; // skip trivial
          const rng = new SeededRNG(seed);
          for (let i = 0; i < 100; i++) {
            const val = rng.intRange(min, max);
            expect(val).toBeGreaterThanOrEqual(min);
            expect(val).toBeLessThanOrEqual(max);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  test('shuffle preserves all elements', () => {
    const rng = new SeededRNG(12345);
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = rng.shuffle([...original]);
    expect(shuffled.sort((a, b) => a - b)).toEqual(original);
  });
});
```

#### Distractor Generation Tests

```typescript
describe('Distractor Generator', () => {
  test('always produces exactly 3 distractors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 99 }),
        fc.integer({ min: 2, max: 99 }),
        fc.integer({ min: 1, max: 2 ** 31 }),
        (a, b, seed) => {
          const rng = new SeededRNG(seed);
          const answer = a + b;
          const distractors = generateDistractors(
            [a, b], answer, 'addition', additionBugs, rng,
          );
          expect(distractors.length).toBe(3);
        },
      ),
      { numRuns: 500 },
    );
  });

  test('bug-library distractors reproduce known misconceptions', () => {
    // 27 + 18 = 45, but "no carry" bug gives 35
    const rng = new SeededRNG(42);
    const distractors = generateDistractors(
      [27, 18], 45, 'addition', additionBugs, rng,
    );
    const bugDistractors = distractors.filter(d => d.source === 'bug_library');
    const values = bugDistractors.map(d => (d.value as { value: number }).value);
    // "add_no_carry" should produce 35
    expect(values).toContain(35);
  });
});
```

#### Session Composition Tests

```typescript
describe('Session Composer', () => {
  test('session has correct total problem count', () => {
    const config = createTestSessionConfig({ totalProblems: 15 });
    const session = composeSession(config);
    expect(session.problems.length).toBe(15);
  });

  test('warmup problems are easier than core problems', () => {
    const config = createTestSessionConfig({ totalProblems: 15 });
    const session = composeSession(config);

    const warmupElos = session.problems
      .slice(session.phases.warmup.start, session.phases.warmup.end)
      .map(p => p.expectedDifficulty);
    const coreElos = session.problems
      .slice(session.phases.core.start, session.phases.core.end)
      .map(p => p.expectedDifficulty);

    const avgWarmup = warmupElos.reduce((a, b) => a + b, 0) / warmupElos.length;
    const avgCore = coreElos.reduce((a, b) => a + b, 0) / coreElos.length;

    expect(avgWarmup).toBeLessThan(avgCore);
  });

  test('session ends with cooldown (easy problems)', () => {
    const config = createTestSessionConfig({ totalProblems: 15 });
    const session = composeSession(config);
    const lastProblem = session.problems[session.problems.length - 1];
    expect(lastProblem.category).toBe('cooldown');
  });

  test('core mix respects approximate ratios (within 20%)', () => {
    const config = createTestSessionConfig({
      totalProblems: 20,
      warmupCount: 3,
      cooldownCount: 2,
    });
    const session = composeSession(config);
    const coreProblems = session.problems.slice(
      session.phases.core.start,
      session.phases.core.end,
    );
    const coreCount = coreProblems.length; // 15

    const reviewCount = coreProblems.filter(p => p.category === 'review').length;
    const newCount = coreProblems.filter(p => p.category === 'new').length;
    const challengeCount = coreProblems.filter(p => p.category === 'challenge').length;

    // 60% review ± 20%
    expect(reviewCount / coreCount).toBeGreaterThanOrEqual(0.4);
    expect(reviewCount / coreCount).toBeLessThanOrEqual(0.8);

    // 30% new ± 20%
    expect(newCount / coreCount).toBeGreaterThanOrEqual(0.1);
    expect(newCount / coreCount).toBeLessThanOrEqual(0.5);
  });

  test('frustration recovery inserts easy problem', () => {
    const state: FrustrationState = {
      consecutiveWrong: 2,
      totalWrong: 4,
      totalAttempted: 8,
      recentAccuracy: [1, 0, 0, 0, 0],
    };

    const action = updateFrustrationState(state, false); // 3rd wrong
    expect(action.action).toBe('reduce_difficulty');
    if (action.action === 'reduce_difficulty') {
      expect(action.insertEasyWin).toBe(true);
      expect(action.eloReduction).toBe(100);
    }
  });
});
```

#### Answer Validation Tests

```typescript
describe('Answer Validation', () => {
  test('integer answers accept correct values', () => {
    expect(checkIntegerAnswer('42', 42).correct).toBe(true);
  });

  test('integer answers reject wrong values', () => {
    expect(checkIntegerAnswer('43', 42).correct).toBe(false);
  });

  test('integer answers handle leading zeros', () => {
    expect(checkIntegerAnswer('042', 42).correct).toBe(true);
  });

  test('integer answers reject non-numeric input', () => {
    expect(checkIntegerAnswer('abc', 42).correct).toBe(false);
    expect(checkIntegerAnswer('', 42).correct).toBe(false);
    expect(checkIntegerAnswer('4.2', 42).correct).toBe(false);
  });

  test('fraction equivalence: 2/4 = 1/2', () => {
    const result = checkFractionAnswer('2/4', { numerator: 1, denominator: 2 }, false);
    expect(result.correct).toBe(true);
  });

  test('fraction simplification required: 2/4 rejected when simplified expected', () => {
    const result = checkFractionAnswer('2/4', { numerator: 1, denominator: 2 }, true);
    expect(result.correct).toBe(false);
    expect(result.reason).toBe('not_simplified');
  });

  test('fraction equivalence: 3/6 = 1/2', () => {
    const result = checkFractionAnswer('3/6', { numerator: 1, denominator: 2 }, false);
    expect(result.correct).toBe(true);
  });
});
```

### Coverage Metrics

| Category | Target | What It Covers |
|----------|--------|----------------|
| **Template correctness** | 100% | Every template's `generate()` produces correct answers |
| **Constraint satisfaction** | 100% | Generated numbers always satisfy template constraints |
| **Distractor validity** | 100% | No distractor equals the answer; no negatives; no duplicates |
| **Degenerate case rejection** | 100% | No +0, x1, /0, x-x problems unless explicitly intended |
| **Regrouping accuracy** | 100% | Regrouping templates always/never produce carrying as specified |
| **Division integrity** | 100% | No remainders, no division by zero |
| **RNG determinism** | 100% | Same seed = same output, always |
| **Session composition** | 95%+ | Correct phase counts, mix ratios within tolerance, frustration handling |
| **Answer parsing** | 95%+ | Handles valid inputs, rejects invalid, equivalence for fractions |

### React Native / Expo Considerations

- **No native dependencies**: The math engine is pure TypeScript. No native modules, no platform-specific code. It runs identically on iOS, Android, and in Jest.
- **Bundle size**: The engine should be small. Templates are data + functions, not large lookup tables. Estimated <20KB minified.
- **Performance**: Problem generation must complete in <5ms (blocking the JS thread). All algorithms are O(1) or O(n) with small n. SeededRNG uses only integer math.
- **Offline capability**: The engine works entirely offline. No network calls. The LLM layer (optional word problem context) is the only component requiring connectivity.
- **State persistence**: Problem history and Elo/BKT/Leitner state live in Zustand, persisted via AsyncStorage (same pattern as Tiny Tales).
- **Testing**: Jest + jest-expo with fast-check. No need for device testing — all logic is pure functions.

---

## References

### Academic

- Brown, J.S. & Burton, R.R. (1978). "Diagnostic models for procedural bugs in basic mathematical skills" — *Cognitive Science*, 2(2)
- Corbett, A.T. & Anderson, J.R. (1995). "Knowledge tracing: Modeling the acquisition of procedural knowledge" — *User Modeling and User-Adapted Interaction*, 4(4)
- Elo, A.E. (1978). *The Rating of Chessplayers, Past and Present* — Arco
- Pelanek, R. (2016). "Applications of the Elo Rating System in Adaptive Educational Systems" — *Computers & Education*, 98
- Klinkenberg, S., Straatemeier, M., & van der Maas, H.L.J. (2011). "A computer adaptive practice system for Maths ability using a new item response model for on the fly ability and difficulty estimation" — *Computers & Education*, 57(2)
- Ashlock, R.B. (2010). *Error Patterns in Computation* (10th edition) — Pearson
- Roediger, H.L. & Karpicke, J.D. (2006). "The power of testing memory" — *Perspectives on Psychological Science*, 1(3)
- Vygotsky, L.S. (1978). *Mind in Society: The Development of Higher Psychological Processes* — Harvard University Press
- Pashler, H., Rohrer, D., Cepeda, N.J., & Carpenter, S.K. (2007). "Enhancing learning and retarding forgetting" — *Psychonomic Bulletin & Review*, 14(2)
- Leitner, S. (1972). *So lernt man lernen* — Herder

### Technical

- Mulberry32 PRNG: Tommy Ettinger (2017). Reference implementation for 32-bit state PRNG — [GitHub](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c)
- fast-check: Nicolas Dubien. Property-based testing framework for JavaScript/TypeScript — [GitHub](https://github.com/dubzzz/fast-check)
- Common Core State Standards for Mathematics — [corestandards.org](https://www.thecorestandards.org/Math/)

### Education Research

- NCTM (2014). *Principles to Actions: Ensuring Mathematical Success for All* — National Council of Teachers of Mathematics
- Bruner, J. (1966). CPA Progression (Concrete-Pictorial-Abstract) — *Toward a Theory of Instruction*
- Singapore Ministry of Education — Primary Mathematics Syllabus (2021)
- PNAS (2024). "GPT-4 tutoring with and without guardrails" — +127% improvement with scaffolded hints vs -17% decline without

---

*Last updated: 2026-03-01*
