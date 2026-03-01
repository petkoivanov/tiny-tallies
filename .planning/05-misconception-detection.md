# Misconception Detection System

**Research Date:** 2026-02-28
**Focus:** Identifying and correcting mathematical misconceptions in ages 6-9

## Core Approach: Bug Library Pattern

Instead of just checking right/wrong, the system maintains a **library of known misconceptions** for each topic. When a child gives a wrong answer, the system checks if it matches a known "bug pattern" — revealing WHAT the child misunderstands, not just THAT they're wrong.

## How It Works

```
┌──────────────────┐
│  Child answers 43 │
│  for 27 + 18      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Bug Library Lookup              │
│                                  │
│  Correct: 45                     │
│  Bug: "no_carry" → 2+1=3, 7+8=5 │
│       → Result: 35 ✗ (not 43)   │
│  Bug: "carry_wrong_column"       │
│       → 7+8=15, write 5 carry 1 │
│       → 1+2+1=4, result: 45     │
│  Bug: "add_digits_separately"    │
│       → 2+7=9, 1+8=9 → 99 ✗    │
│  Bug: "reverse_carry"            │
│       → 7+8=15, write 1 carry 5 │
│       → 5+2+1=8 → 81 ✗         │
│  No match → "unknown_error"      │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Confirmation (2-then-3 Rule)    │
│                                  │
│  1st occurrence → note pattern   │
│  2nd occurrence → flag suspected │
│  3rd occurrence → confirmed!     │
│  → Trigger targeted intervention │
└──────────────────────────────────┘
```

## Bug Library by Topic

### Addition Bugs

| Bug ID | Pattern | Example | Misconception |
|--------|---------|---------|---------------|
| `add_no_carry` | Ignores carry entirely | 27+18=35 | Doesn't understand regrouping |
| `add_carry_wrong` | Carries wrong digit | 27+18=115 | Writes carry in wrong place |
| `add_reverse_digits` | Writes ones in tens | 17+5=112 | Place value confusion |
| `add_larger_from_smaller` | Always subtracts smaller from larger | 18+27 answered as 27+18 but with subtraction | Operation confusion |
| `add_concat` | Concatenates instead of adding | 12+3=123 | Doesn't understand addition |
| `add_off_by_one` | Answer ±1 | 7+8=14 or 16 | Counting error |

### Subtraction Bugs

| Bug ID | Pattern | Example | Misconception |
|--------|---------|---------|---------------|
| `sub_smaller_from_larger` | Always subtracts smaller digit from larger | 42-17=35 (7-2=5, 4-1=3) | Most common subtraction bug |
| `sub_no_borrow` | Ignores borrowing | 53-28=35 | Doesn't understand regrouping |
| `sub_borrow_forget_reduce` | Borrows but doesn't reduce tens | 53-28=35 | Incomplete borrowing |
| `sub_borrow_wrong_column` | Borrows from wrong column | 423-167=366 | Multi-digit confusion |
| `sub_zero_confusion` | 0-N=0 or 0-N=N | 30-7=37 or 30-7=30 | Zero as identity confusion |

### Multiplication Bugs

| Bug ID | Pattern | Example | Misconception |
|--------|---------|---------|---------------|
| `mul_add_instead` | Adds instead of multiplying | 3×4=7 | Operation confusion |
| `mul_off_by_one_group` | One too many/few groups | 3×4=8 or 3×4=16 | Counting groups wrong |
| `mul_adjacent_fact` | Wrong times table entry | 7×8=54 (gives 7×7+5) | Table memorization error |
| `mul_zero_any` | N×0=N | 5×0=5 | Doesn't understand zero property |
| `mul_one_add` | N×1=N+1 | 5×1=6 | Confuses ×1 with +1 |

### Fraction Bugs

| Bug ID | Pattern | Example | Misconception |
|--------|---------|---------|---------------|
| `frac_larger_denom_larger` | 1/4 > 1/3 | — | "4 is bigger than 3 so 1/4 is bigger" |
| `frac_add_across` | 1/2+1/3=2/5 | Adds numerators and denominators | Whole number addition applied to fractions |
| `frac_whole_number_compare` | 3/8 > 2/4 | "3 is bigger than 2" | Compares numerators only |
| `frac_equal_parts_ignore` | Accepts unequal partitions | — | "Pieces" not "equal pieces" |

### Place Value Bugs

| Bug ID | Pattern | Example | Misconception |
|--------|---------|---------|---------------|
| `pv_digit_value` | Tens digit = face value | "3 in 34" = 3, not 30 | Doesn't understand positional notation |
| `pv_reverse_write` | Writes digits reversed | Twenty-three → 32 | Reverses spoken/written order |
| `pv_zero_placeholder` | Omits zero | Three hundred five → 35 | Zero as placeholder not understood |

## Confirmation Strategy: 2-then-3 Rule

To avoid false positives (a single careless mistake), the system requires **pattern confirmation:**

1. **1st occurrence** of a bug pattern → Log it, no action
2. **2nd occurrence** of SAME bug within 5 problems → Flag as "suspected"
3. **3rd occurrence** (any time) → Confirm misconception → Trigger intervention

**Why 2-then-3:**
- Single errors are often careless mistakes (especially ages 6-7)
- 2 occurrences close together suggest a real pattern
- 3rd confirmation (even weeks later) proves it's persistent
- Research shows this balance avoids over-diagnosis while catching real issues

## Intervention System

When a misconception is confirmed:

### Immediate Response
1. Switch to BOOST mode (from tutor engine)
2. Target the specific misconception (not generic "try again")
3. Use the manipulative that best addresses the misconception

### Misconception-to-Manipulative Mapping

| Misconception Category | Best Manipulative | Why |
|----------------------|-------------------|-----|
| Carry/borrow errors | Base-ten blocks | Physical grouping makes regrouping visible |
| Place value confusion | Place value chart + blocks | Columns enforce position awareness |
| Fraction comparison | Fraction strips (stacked) | Visual comparison eliminates number bias |
| Multiplication confusion | Array grid | Rows × columns = visible product |
| Operation confusion (+/×) | Counters in groups vs single | Physical distinction between operations |

### Follow-up
- Schedule 2-3 targeted problems in next session (addressing the specific bug)
- If child gets targeted problems right → reduce suspicion level
- If still struggling → present concept from scratch (TEACH mode)

## Data Model

```typescript
interface BugEntry {
  bugId: string;
  topic: TopicId;
  pattern: (problem: MathProblem, childAnswer: number) => boolean;
  description: string;
  suggestedManipulative: ManipulativeType;
  interventionPrompt: string;
}

interface MisconceptionRecord {
  bugId: string;
  occurrences: Array<{
    timestamp: number;
    problemId: string;
    childAnswer: number;
    correctAnswer: number;
  }>;
  status: 'noted' | 'suspected' | 'confirmed' | 'resolved';
  lastSeen: number;
  interventionCount: number;
}

// Per-child misconception tracker
interface ChildMisconceptions {
  childId: string;
  records: Record<string, MisconceptionRecord>;
  resolvedBugs: string[];  // bugs that were confirmed then corrected
}
```

## Implementation Priority

1. **Phase 1:** Addition + subtraction bugs (most common, ages 6-7)
2. **Phase 2:** Place value + multiplication bugs (ages 7-8)
3. **Phase 3:** Fraction + division bugs (ages 8-9)

Each phase: ~15-20 bug patterns to implement.
Total bug library target: ~60 patterns covering grades 1-3.

## Research References

- Brown, J.S. & Burton, R.R. (1978). "Diagnostic models for procedural bugs in basic mathematical skills"
- Ashlock, R.B. (2010). "Error Patterns in Computation" (10th edition)
- Resnick, L.B. (1982). "Syntax and semantics in learning to subtract"
- Confrey, J. (1990). "What constructivism implies for teaching"
- ALTER-Math consortium (2024). "Adaptive Learning Technology for Error Remediation"
