# Complete Skills Reference — v0.9

Every skill to be implemented, with IDs, grades, prerequisites, Elo ranges, standards, and template specifications.

## Notation
- **Elo**: `baseElo` for the easiest template in that skill. Harder templates within the same skill are +50-80 higher.
- **Prerequisites**: skill IDs that must be `masteryLocked` before this skill unlocks.
- **Format**: MC = multiple choice, FT = free text (selected probabilistically by Elo).

---

## 1. Addition (9 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 1 | `addition.single-digit.no-carry` | Add within 10 | 1 | 1.OA.C.6 | 800 | — | a+b, a,b∈[1,9], sum≤10 |
| 2 | `addition.within-20.no-carry` | Add within 20 (no carry) | 1 | 1.OA.C.6 | 850 | #1 | a∈[10,19]+b∈[1,9], sum≤19 |
| 3 | `addition.within-20.with-carry` | Add within 20 (carry) | 1 | 1.OA.C.6 | 920 | #2 | a,b∈[2,9], sum∈[10,18] |
| 4 | `addition.two-digit.no-carry` | Add 2-digit (no carry) | 2 | 2.NBT.B.5 | 1000 | #3 | a,b∈[10,99], no carry |
| 5 | `addition.two-digit.with-carry` | Add 2-digit (carry) | 2 | 2.NBT.B.5 | 1080 | #4 | a,b∈[10,99], requires carry |
| 6 | `addition.three-digit.no-carry` | Add 3-digit (no carry) | 3 | 3.NBT.A.2 | 1150 | #5 | a,b∈[100,999], no carry |
| 7 | `addition.three-digit.with-carry` | Add 3-digit (carry) | 3 | 3.NBT.A.2 | 1250 | #6 | a,b∈[100,999], requires carry |
| 8 | `addition.four-digit.no-carry` | Add 4-digit (no carry) | 4 | 4.NBT.B.4 | 1300 | #7 | a,b∈[1000,9999], no carry |
| 9 | `addition.four-digit.with-carry` | Add 4-digit (carry) | 4 | 4.NBT.B.4 | 1380 | #8 | a,b∈[1000,9999], requires carry |

## 2. Subtraction (8 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 10 | `subtraction.single-digit.no-borrow` | Subtract within 10 | 1 | 1.OA.C.6 | 800 | — | a-b, a∈[2,10], b∈[1,a-1] |
| 11 | `subtraction.within-20.no-borrow` | Subtract within 20 (no borrow) | 1 | 1.OA.C.6 | 850 | #10, #2 | a∈[10,19]-b∈[1,9], no borrow |
| 12 | `subtraction.within-20.with-borrow` | Subtract within 20 (borrow) | 1 | 1.OA.C.6 | 920 | #11, #3 | a∈[10,18]-b∈[2,9], requires borrow |
| 13 | `subtraction.two-digit.no-borrow` | Subtract 2-digit (no borrow) | 2 | 2.NBT.B.5 | 1000 | #12, #4 | a,b∈[10,99], no borrow |
| 14 | `subtraction.two-digit.with-borrow` | Subtract 2-digit (borrow) | 2 | 2.NBT.B.5 | 1080 | #13, #5 | a,b∈[10,99], requires borrow |
| 15 | `subtraction.three-digit.no-borrow` | Subtract 3-digit (no borrow) | 3 | 3.NBT.A.2 | 1150 | #14, #6 | a,b∈[100,999], no borrow |
| 16 | `subtraction.three-digit.with-borrow` | Subtract 3-digit (borrow) | 3 | 3.NBT.A.2 | 1250 | #15, #7 | a,b∈[100,999], requires borrow |
| 17 | `subtraction.four-digit.with-borrow` | Subtract 4-digit (borrow) | 4 | 4.NBT.B.4 | 1350 | #16, #8 | a,b∈[1000,9999] |

## 3. Multiplication (10 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 18 | `multiplication.equal-groups` | Equal groups concept | 2 | 2.OA.C.4 | 850 | #3, PV#30 | N groups of M, N∈[2,5], M∈[2,5] |
| 19 | `multiplication.arrays` | Arrays (rows × cols) | 2 | 2.OA.C.4 | 880 | #18 | R rows × C cols, R,C∈[2,5] |
| 20 | `multiplication.repeated-addition` | Repeated addition | 2 | 2.OA.C.4 | 900 | #18 | N+N+N... = N×M |
| 21 | `multiplication.facts-2-5-10` | Times tables 2,5,10 | 3 | 3.OA.C.7 | 920 | #19, #20 | a×b, a∈{2,5,10}, b∈[1,10] |
| 22 | `multiplication.facts-3-4-6` | Times tables 3,4,6 | 3 | 3.OA.C.7 | 970 | #21 | a×b, a∈{3,4,6}, b∈[1,10] |
| 23 | `multiplication.facts-7-8-9` | Times tables 7,8,9 | 3 | 3.OA.C.7 | 1020 | #22 | a×b, a∈{7,8,9}, b∈[1,10] |
| 24 | `multiplication.by-10-100` | Multiply by 10, 100 | 3 | 3.NBT.A.3 | 1000 | #21 | a×{10,100}, a∈[1,9] |
| 25 | `multiplication.two-by-one` | 2-digit × 1-digit | 4 | 4.NBT.B.5 | 1150 | #23, #24 | a∈[10,99]×b∈[2,9] |
| 26 | `multiplication.two-by-two` | 2-digit × 2-digit | 4 | 4.NBT.B.5 | 1280 | #25 | a,b∈[10,99] |
| 27 | `multiplication.four-by-one` | Up to 4-digit × 1-digit | 4 | 4.NBT.B.5 | 1350 | #25 | a∈[100,9999]×b∈[2,9] |

## 4. Division (8 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 28 | `division.sharing-equally` | Fair sharing | 3 | 3.OA.A.2 | 900 | #21 | N items ÷ M groups, no remainder |
| 29 | `division.grouping` | How many groups | 3 | 3.OA.A.2 | 930 | #28 | N items, groups of M |
| 30 | `division.facts-within-100` | Division facts | 3 | 3.OA.C.7 | 970 | #29, #23 | a÷b, a≤100, exact division |
| 31 | `division.relationship-multiplication` | Mul↔Div relationship | 3 | 3.OA.B.6 | 1000 | #30 | If a×b=c then c÷a=b |
| 32 | `division.with-remainders` | Division with remainders | 4 | 4.OA.A.3 | 1080 | #30 | a÷b with remainder |
| 33 | `division.two-by-one` | 2-digit ÷ 1-digit | 4 | 4.NBT.B.6 | 1150 | #32 | a∈[10,99]÷b∈[2,9] |
| 34 | `division.three-by-one` | 3-digit ÷ 1-digit | 4 | 4.NBT.B.6 | 1250 | #33 | a∈[100,999]÷b∈[2,9] |
| 35 | `division.multi-step` | Multi-step word problems | 4 | 4.OA.A.3 | 1300 | #33 | Two-step problems |

## 5. Fractions (10 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 36 | `fractions.equal-parts` | Equal partitioning | 1 | 1.G.A.3 | 800 | — | "Is this split into equal parts?" |
| 37 | `fractions.halves-quarters` | Halves, quarters, thirds | 2 | 2.G.A.3 | 850 | #36 | Identify 1/2, 1/3, 1/4 of shape |
| 38 | `fractions.unit-fractions` | Unit fractions | 3 | 3.NF.A.1 | 920 | #37 | 1/n for n∈{2,3,4,6,8} |
| 39 | `fractions.on-number-line` | Fractions on number line | 3 | 3.NF.A.2 | 970 | #38 | Place fraction on 0-1 line |
| 40 | `fractions.equivalent` | Equivalent fractions | 3 | 3.NF.A.3 | 1020 | #39 | 1/2 = 2/4 = 3/6 etc. |
| 41 | `fractions.compare-same-denom` | Compare (same denominator) | 3 | 3.NF.A.3 | 1050 | #40 | 3/8 vs 5/8 |
| 42 | `fractions.compare-same-numer` | Compare (same numerator) | 3 | 3.NF.A.3 | 1080 | #41 | 2/3 vs 2/5 |
| 43 | `fractions.add-subtract-like-denom` | Add/sub same denominator | 4 | 4.NF.B.3 | 1150 | #42 | 2/5 + 1/5 = 3/5 |
| 44 | `fractions.mixed-numbers` | Mixed numbers | 4 | 4.NF.B.3 | 1200 | #43 | 1 2/3, convert to/from improper |
| 45 | `fractions.multiply-by-whole` | Fraction × whole number | 4 | 4.NF.B.4 | 1280 | #43 | 3 × 2/5 = 6/5 |

## 6. Place Value (8 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 46 | `place-value.ones-tens` | Tens and ones | 1 | 1.NBT.B.2 | 800 | — | "What digit is in the tens place of 34?" |
| 47 | `place-value.hundreds` | Hundreds place | 2 | 2.NBT.A.1 | 880 | #46 | Hundreds, tens, ones in 3-digit |
| 48 | `place-value.to-1000` | Read/write to 1000 | 2 | 2.NBT.A.3 | 920 | #47 | "What number is 4 hundreds, 0 tens, 5 ones?" |
| 49 | `place-value.comparing` | Compare numbers (<, >, =) | 2 | 2.NBT.A.4 | 950 | #47 | "456 ☐ 465" → < |
| 50 | `place-value.skip-counting` | Skip count (2s, 5s, 10s, 100s) | 2 | 2.NBT.A.2 | 870 | #46 | "What comes next: 10, 20, 30, ?" |
| 51 | `place-value.rounding-10-100` | Round to nearest 10/100 | 3 | 3.NBT.A.1 | 1000 | #49 | "Round 347 to nearest 100" |
| 52 | `place-value.to-10000` | Place value to 10,000 | 4 | 4.NBT.A.2 | 1100 | #51 | 4-digit place value |
| 53 | `place-value.expanded-form` | Expanded form | 4 | 4.NBT.A.2 | 1150 | #52 | "3,456 = 3000 + 400 + 50 + 6" |

## 7. Time (7 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 54 | `time.read.hours` | Tell time (hours) | 1 | 1.MD.3 | 800 | — | Clock shows X:00, "What time?" |
| 55 | `time.read.half-hours` | Tell time (half hours) | 1 | 1.MD.3 | 850 | #54 | Clock shows X:30 |
| 56 | `time.read.quarter-hours` | Tell time (quarter hours) | 2 | 2.MD.7 | 900 | #55 | X:00, X:15, X:30, X:45 |
| 57 | `time.read.five-minutes` | Tell time (5 min) | 2 | 2.MD.7 | 950 | #56 | Any X:00/05/10/.../55 |
| 58 | `time.am-pm` | Understand a.m./p.m. | 2 | 2.MD.7 | 920 | #57 | "Lunch is at 12:30 ___" |
| 59 | `time.read.one-minute` | Tell time (1 min) | 3 | 3.MD.1 | 1020 | #57 | Any time X:YY |
| 60 | `time.elapsed` | Elapsed time | 3 | 3.MD.1 | 1100 | #59 | "30 min after 2:45 is?" |

## 8. Money (7 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 61 | `money.coin-id` | Identify coins | 1 | 1.MD (state) | 780 | — | "Which coin is this?" / "How much is a dime?" |
| 62 | `money.count.same-type` | Count same coins | 1 | 1.MD (state) | 830 | #61, #1 | "How much are 4 nickels?" |
| 63 | `money.count.mixed` | Count mixed coins | 2 | 2.MD.C.8 | 900 | #62, #2 | "3 dimes + 2 pennies = ?" |
| 64 | `money.notation` | Dollar/cent notation | 2 | 2.MD.C.8 | 930 | #63 | "75¢ = $___" |
| 65 | `money.change.simple` | Making change | 2-3 | 2.MD.C.8 | 1000 | #63, #12 | "Cost 75¢, pay $1. Change?" |
| 66 | `money.multi-step` | Multi-step money | 3 | 3.OA.D.8 | 1100 | #65, #5 | "Buy X and Y, total?" |
| 67 | `money.unit-price` | Unit pricing | 4 | 4.MD.A.2 | 1200 | #66, #33 | "6 items for $4.50. Each?" |

## 9. Patterns & Algebra (5 skills)

| # | Skill ID | Name | Grade | Standards | Elo | Prerequisites | Templates |
|---|----------|------|-------|-----------|-----|---------------|-----------|
| 68 | `patterns.number-patterns` | Number patterns | 1 | 1.OA.D.7 | 800 | — | "2, 4, 6, 8, ?" |
| 69 | `patterns.skip-counting-patterns` | Skip counting patterns | 2 | 2.NBT.A.2 | 870 | #68, #50 | "5, 10, 15, 20, ?" |
| 70 | `patterns.missing-addend` | Missing addend (□ + 3 = 7) | 1-2 | 1.OA.D.8 | 880 | #3 | □ + b = c |
| 71 | `patterns.missing-factor` | Missing factor (□ × 4 = 24) | 3 | 3.OA.A.4 | 1020 | #21, #30 | □ × b = c |
| 72 | `patterns.input-output` | Input/output tables | 4 | 4.OA.C.5 | 1150 | #71 | Rule: ×3, in=5, out=? |

---

## Total: 72 skills

## Answer Format Thresholds

| Elo Range | MC Options | P(free-text) |
|-----------|-----------|--------------|
| < 850 | 4 | ~5% |
| 850-950 | 4 | ~15% |
| 950-1050 | 5 | ~35% |
| 1050-1150 | 5 | ~60% |
| 1150-1250 | 6 | ~80% |
| > 1250 | 6 | ~90% |

Formula: `P(free_text) = 1 / (1 + exp(-(elo - 1000) / 150))`

## Word Problem Frequency by Elo

| Elo Range | Word Problem % |
|-----------|---------------|
| < 850 | 0% (bare equations only) |
| 850-1000 | 10% |
| 1000-1100 | 20% |
| 1100-1200 | 30% |
| > 1200 | 40% |

Applicable domains: addition, subtraction, multiplication, division, money, time (elapsed)
Not applicable: place value, patterns (already contextual), fractions (visual), coin-id, time (read-clock)
