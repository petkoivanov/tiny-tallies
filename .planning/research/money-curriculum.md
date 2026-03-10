# Money Curriculum Research

**Domain:** Teaching money (US coins and bills) in elementary math, grades 1-4 (ages 6-10)
**Researched:** 2026-03-08
**Overall confidence:** HIGH (standards are well-documented; pedagogy is well-established)

---

## 1. Common Core Standards for Money

Money is surprisingly narrow in Common Core. There is essentially ONE dedicated money standard, plus money appears as a context in later problem-solving standards.

### Primary Standard: 2.MD.C.8 (Grade 2)

> "Solve word problems involving dollar bills, quarters, dimes, nickels, and pennies, using $ and cent symbols appropriately. Example: If you have 2 dimes and 3 pennies, how many cents do you have?"

This is THE money standard. It lives in Grade 2, Measurement & Data, cluster "Work with time and money."

### Supporting/Prerequisite Standards

| Standard | Grade | Description | Money Relevance |
|----------|-------|-------------|-----------------|
| 1.MD.3 (varies by state) | 1 | Identify coins by name and value | Prerequisite: recognize penny=1c, nickel=5c, dime=10c, quarter=25c |
| 1.OA.C.5 | 1 | Relate counting to addition | Skip counting by 5s, 10s needed for coins |
| 2.MD.C.8 | 2 | Solve word problems with money using $ and cent symbols | **Primary money standard** |
| 2.NBT.B.5 | 2 | Fluently add and subtract within 100 | Coin counting requires addition within 100 |
| 3.MD.1 | 3 | Tell time, solve elapsed time problems | Money used in word problem contexts |
| 3.OA.D.8 | 3 | Two-step word problems with +/-/x | Money as context for multi-step problems |
| 4.MD.2 | 4 | Use four operations to solve word problems involving money | Problems with decimals ($), fractions, unit conversion |
| 4.OA.A.3 | 4 | Multi-step word problems with whole numbers | Money as real-world context |

### Key Observation

Common Core does NOT have a dedicated Grade 1 money standard in most state adoptions. However, many states (Florida: MA.1.M.2.2, Texas, New York) add first-grade coin identification standards. The practical teaching sequence starts in Grade 1 with identification even where the formal standard is Grade 2.

**Implication for Tiny Tallies:** We should follow the practical teaching sequence (coin identification at Grade 1 level, counting and word problems at Grade 2, making change and multi-step at Grade 3-4) rather than strictly Common Core, which lumps everything into 2.MD.C.8.

---

## 2. Coins and Bills by Grade Level

### Grade 1 (Ages 6-7): Recognition and Values

**Skills:**
- Identify penny, nickel, dime, quarter by sight (front and back)
- Know the value of each coin (1c, 5c, 10c, 25c)
- Understand that 5 pennies = 1 nickel, 2 nickels = 1 dime, etc.
- Use the cent symbol (c or cent sign)
- Count same-type coin groups (e.g., "How much are 3 nickels?")

**Coins introduced:** Penny, nickel, dime, quarter (all four)
**Bills:** Not yet
**Notation:** Cents only (no dollar sign, no decimal notation)

**Problem types:**
- "Which coin is this?" (identification from image)
- "How much is a dime worth?"
- "How much are 4 pennies?" (single coin type counting)
- "Which is worth more, a nickel or a dime?"

### Grade 2 (Ages 7-8): Counting Mixed Coins and Simple Word Problems

**Skills:**
- Count mixed sets of coins (sort highest-to-lowest, then add)
- Skip count by 5s (nickels), 10s (dimes), 25s (quarters), switching mid-count
- Solve addition word problems with coins
- Write amounts using cent symbol
- Introduction to dollar bills ($1, $5)
- Write amounts using dollar sign and decimal (e.g., $0.75, $1.25)

**Coins:** All four coins
**Bills:** $1 bill introduced; $5 as enrichment
**Notation:** Both cent (75c) and dollar ($0.75) notation

**Problem types:**
- "Jesse has 4 pennies, 3 nickels, and 2 dimes. How many cents does Jesse have?"
- "Anna's mom gave her 2 quarters, 4 nickels, and 1 penny. How much money does Anna have?"
- "Maryam has 5 dimes and 3 pennies. Then she finds 2 nickels. How many cents does Maryam have now?"
- "Show 47 cents using the fewest coins"
- "Do these two groups of coins have the same value?"

### Grade 3 (Ages 8-9): Making Change and Two-Step Problems

**Skills:**
- Making change (count-up method: from price to amount paid)
- Two-step word problems involving money (buy + change, compare prices)
- Addition and subtraction with money amounts
- Dollar and cent notation fluency
- Equivalent representations (same amount, different coins)

**Coins:** All four
**Bills:** $1, $5, $10, $20
**Notation:** Primarily dollar notation ($3.50); cent notation for small amounts

**Problem types:**
- "A bag of chips costs 75c. You pay with $1.00. How much change do you get?"
- "Maya buys a pencil for $0.35 and an eraser for $0.20. How much did she spend in all?"
- "Tom has $5.00. He buys a toy for $3.25. How much money does he have left?"
- "Which costs more: 3 apples at $0.50 each, or 2 oranges at $0.75 each?"
- "You need exactly 60c. Show two different ways to make 60c."

### Grade 4 (Ages 9-10): Multi-Step Problems with Decimals

**Skills:**
- Multi-step word problems with all four operations
- Money amounts with decimals to hundredths
- Compare, order, and round money amounts
- Real-world budgeting scenarios
- Unit pricing concepts (cost per item)

**Coins:** All four
**Bills:** All common denominations ($1, $5, $10, $20)
**Notation:** Dollar notation with decimals; converting between cents and dollars

**Problem types:**
- "Jenna has $20.00. She buys 3 notebooks at $2.75 each. How much change does she receive?"
- "A pack of 6 juice boxes costs $4.50. How much does each juice box cost?"
- "Marcus earns $5.50 per week doing chores. How much will he earn in 4 weeks?"
- "Which is the better deal: 3 pens for $2.25 or 5 pens for $3.50?"

---

## 3. Problem Types Taxonomy

For implementation in Tiny Tallies, money problems can be categorized into these programmatic types:

### Level 1: Identification (Grade 1, Elo ~400-600)

| Problem Type | Template | Answer Format |
|-------------|----------|---------------|
| `money.coin-id.name` | Show coin image, "What coin is this?" | Multiple choice: penny/nickel/dime/quarter |
| `money.coin-id.value` | Show coin image, "How much is this worth?" | Multiple choice: 1c/5c/10c/25c |
| `money.coin-id.match` | "Which coin is worth 10 cents?" | Multiple choice with coin images |
| `money.coin-id.compare` | "Which is worth more?" (show two coins) | Multiple choice: two coin options |

### Level 2: Same-Coin Counting (Grade 1-2, Elo ~500-700)

| Problem Type | Template | Answer Format |
|-------------|----------|---------------|
| `money.count.pennies` | Show N pennies, "How much?" | Multiple choice (numeric cents) |
| `money.count.nickels` | Show N nickels, "How much?" | Multiple choice (skip count by 5) |
| `money.count.dimes` | Show N dimes, "How much?" | Multiple choice (skip count by 10) |
| `money.count.quarters` | Show N quarters, "How much?" | Multiple choice (skip count by 25) |

### Level 3: Mixed-Coin Counting (Grade 2, Elo ~600-900)

| Problem Type | Template | Answer Format |
|-------------|----------|---------------|
| `money.mixed.two-types` | "3 dimes and 2 pennies. How many cents?" | Multiple choice (numeric) |
| `money.mixed.three-types` | "2 quarters, 1 dime, 3 pennies. How much?" | Multiple choice (numeric) |
| `money.mixed.all-types` | All four coin types | Multiple choice (numeric) |
| `money.mixed.word-problem` | "Sam has 2 dimes and 3 pennies..." | Multiple choice (numeric) |

### Level 4: Making Change (Grade 2-3, Elo ~800-1100)

| Problem Type | Template | Answer Format |
|-------------|----------|---------------|
| `money.change.from-dollar` | "Item costs 75c. You pay $1.00. Change?" | Multiple choice (numeric) |
| `money.change.from-amount` | "Costs 35c. You have 50c. Change?" | Multiple choice (numeric) |
| `money.change.coins-needed` | "What coins make 35c change?" | Multiple choice (coin combinations) |

### Level 5: Multi-Step Money Problems (Grade 3-4, Elo ~1000-1400)

| Problem Type | Template | Answer Format |
|-------------|----------|---------------|
| `money.multi.buy-two` | "Buy pencil $0.35 + eraser $0.20. Total?" | Multiple choice (dollar amount) |
| `money.multi.buy-and-change` | "Have $5. Buy toy $3.25. How much left?" | Multiple choice (dollar amount) |
| `money.multi.compare-prices` | "3 apples at $0.50 or 2 oranges at $0.75?" | Multiple choice (which costs more/less) |
| `money.multi.unit-price` | "6 juice boxes for $4.50. Price each?" | Multiple choice (dollar amount) |

---

## 4. Common Misconceptions (Bug Library Patterns)

These are the documented misconceptions children have with money, formatted for integration into Tiny Tallies' Bug Library pattern.

### Critical Misconceptions

#### BUG: `money.size-value-confusion`
**What:** Child believes larger coins are worth more (nickel > dime because nickel is physically bigger)
**Age range:** Primarily ages 6-7 (Grade 1)
**Detection:** Consistently choosing nickel as more valuable than dime in comparison problems; counting dimes as 5c
**Distractor generation:** In "which is worth more" problems, offer the physically larger coin as incorrect answer
**Remediation:** Side-by-side comparison showing "5 pennies = 1 nickel" vs "10 pennies = 1 dime"; the dime buys MORE even though it's smaller

#### BUG: `money.count-coins-not-value`
**What:** Child counts the NUMBER of coins instead of their VALUE (3 coins = 3 cents regardless of type)
**Age range:** Ages 6-8 (Grades 1-2)
**Detection:** Answer equals the count of coins shown, not their total value. E.g., 2 dimes + 1 nickel = "3" instead of 25
**Distractor generation:** Include coin-count as a distractor option
**Remediation:** Explicit "each coin is worth a DIFFERENT amount" with value labels

#### BUG: `money.skip-count-switch-error`
**What:** Child fails to switch counting patterns when moving from one coin type to another (e.g., counts 10, 20, 30 for dimes, then continues 40, 50 for nickels instead of 35, 40)
**Age range:** Ages 7-8 (Grade 2)
**Detection:** Answer is consistently too high when mixed coins are present; specifically the answer matches what you'd get counting all coins at the highest denomination's skip value
**Distractor generation:** Include the "all-same-skip" wrong answer
**Remediation:** Practice switching: "Count by 10s... now switch to 5s starting from where you stopped"

### Moderate Misconceptions

#### BUG: `money.quarter-addition-error`
**What:** Child adds quarters incorrectly (25 is awkward for mental math -- common errors: 25+25=45, or counting quarters as 20c)
**Age range:** Ages 7-9 (Grades 2-3)
**Detection:** Quarter-heavy problems answered as if quarters=20c, or 25+25=45
**Distractor generation:** Include 20c-per-quarter total and off-by-5 totals

#### BUG: `money.decimal-notation-confusion`
**What:** Child writes $3.4 instead of $3.40, or treats $3.50 as 350 cents instead of 350 cents (correct) but then writes it as $350
**Age range:** Ages 8-10 (Grades 3-4)
**Detection:** Answers that are 10x too large or missing trailing zero
**Distractor generation:** Include $X.Y (missing zero) and $XYZ (no decimal) as options

#### BUG: `money.change-subtraction-direction`
**What:** Child subtracts the wrong way when making change (subtracts the larger from the smaller, e.g., 75-100 instead of 100-75)
**Age range:** Ages 7-9 (Grades 2-3)
**Detection:** Negative or nonsensical change amounts; answer matches |price - payment| when price > payment
**Distractor generation:** Include the reversed subtraction result

#### BUG: `money.cent-dollar-boundary`
**What:** Child doesn't understand that 100c = $1.00; treats cents and dollars as unrelated
**Age range:** Ages 7-8 (Grade 2)
**Detection:** Cannot convert between cent notation and dollar notation; e.g., 125c != $1.25 in their mind
**Distractor generation:** Include "125 cents" as distinct from "$1.25" in equivalence problems

### Minor Misconceptions

#### BUG: `money.penny-nickel-swap`
**What:** Confuses penny and nickel values (penny=5c, nickel=1c) -- both are similar copper/silver color in some lighting
**Age range:** Ages 6-7 (Grade 1)
**Detection:** Penny-only counts are 5x too high, or nickel counts are 5x too low

#### BUG: `money.fewest-coins-greedy-fail`
**What:** When asked to make an amount with fewest coins, doesn't use largest denominations first
**Age range:** Ages 8-9 (Grade 3)
**Detection:** Correct total but too many coins; uses many small coins instead of fewer large ones

---

## 5. How Math Apps Handle Money Problems

### SplashLearn (Market Leader for K-3)

**Approach:**
- Uses realistic coin images (photographic quality, both heads and tails)
- Interactive drag-and-drop: students drag coins into a workspace to build amounts
- Multiple choice for identification and counting problems
- Lesson structure: Warm Up -> Compare Coins -> Compare Bills -> "Is the Money Enough?" -> Rewind (review) -> Exit Slip
- Grade 1: identify and match coins to values; order coins by value
- Grade 2: count money with different coins; use coins to make given amount

**Key UX patterns:**
- Coins are shown at realistic relative sizes
- Students sort/order coins as a precursor to counting
- Both "choose the answer" and "build the amount" interaction modes

### Money Pieces (Math Learning Center) -- Best-in-Class Manipulative

**Approach:**
- Two visual modes: (1) realistic coin images at proportional sizes, (2) area model where 1 square = 1 penny
- Students drag coins/bills onto a workspace
- Can trade coins for equivalent values (5 pennies -> 1 nickel)
- Can flip coins (heads/tails)
- Illustrated covers to hide amounts for problem-posing
- Open-ended sandbox -- no right/wrong, just exploration
- Supports both coins and bills ($1)

**Key UX patterns:**
- Area model is unique and powerful: a nickel shows as 5 squares, a dime as 10 squares, making value visually proportional to size (directly addresses the size-value misconception)
- Trading feature builds equivalence understanding

### IKnowIt, DreamBox, Khan Academy

**Common patterns across apps:**
- Coin images are always shown (never abstract "25c" without visual)
- Multiple choice is dominant answer format for ages 6-8
- Drag-and-drop for "build this amount" tasks
- Word problems show coin images alongside text
- Most apps start with identification before counting

---

## 6. Implementation Recommendations for Tiny Tallies

### Visual Assets Required

**Coin images (SVG recommended for scalability):**
- Penny (front/back) -- copper colored, Lincoln
- Nickel (front/back) -- silver, larger, Jefferson
- Dime (front/back) -- silver, smallest, Roosevelt
- Quarter (front/back) -- silver, largest, Washington

**Bill images (simplified):**
- $1 bill (simplified/stylized -- full detail not needed)
- $5 bill (Grade 3-4 only)

**Recommendation:** Use SVG coin illustrations rather than photographic images. SVGs scale perfectly, render crisply on all devices, and keep bundle size small. Style them with recognizable features (color, relative size, president silhouette) but don't need photographic accuracy. The area model from Money Pieces is worth implementing as a manipulative.

### Answer Format by Level

| Level | Primary Format | Secondary Format | Why |
|-------|---------------|------------------|-----|
| Identification (G1) | Multiple choice with coin images | Tap-the-coin | Ages 6-7 can't type; visual matching is appropriate |
| Same-coin counting (G1-2) | Multiple choice (numeric) | Drag coins to count | Skip counting is the skill being tested |
| Mixed-coin counting (G2) | Multiple choice (numeric) | Build-the-amount (drag coins) | Multiple choice tests mental math; drag-and-drop tests procedural |
| Making change (G2-3) | Multiple choice (numeric) | Count-up with number line | Multiple choice for speed; number line for understanding |
| Multi-step (G3-4) | Multiple choice (dollar amounts) | Free text input | Older children can type; decimal input needs validation |

### Manipulative Integration

The existing manipulative infrastructure (drag-and-drop with react-native-gesture-handler + reanimated) is well-suited for a **CoinManipulative**:

**Concrete mode:** Drag realistic coin images onto a workspace. Running total displayed. Support trading (5 pennies -> 1 nickel with animation). This directly maps to the Money Pieces model.

**Pictorial mode:** Area-model coins (squares proportional to value). This is the unique Money Pieces insight -- a dime is 10 squares, a nickel is 5 squares, so the dime is VISUALLY bigger by value even though the real coin is smaller. Directly addresses `money.size-value-confusion`.

**Abstract mode:** Numeric notation only ($0.75, 75c). Standard math problem format.

### Problem Generation Engine Changes

Money requires a new `Operation` type (or a new domain concept). The current engine is tightly coupled to `'addition' | 'subtraction'` operations with numeric operands. Money problems are structurally different:

1. **Coin identification** -- not arithmetic at all, it's visual matching
2. **Counting coins** -- IS addition, but the addends are determined by coin type and count
3. **Making change** -- IS subtraction, but with money context
4. **Multi-step** -- compound addition/subtraction with money context

**Recommended approach:** Add `'money'` as a new Operation type. Create `templates/money.ts` alongside `addition.ts` and `subtraction.ts`. Money problem templates generate `Problem` objects where:
- `operands` can represent coin counts or money amounts (in cents for internal computation)
- `questionText` includes coin names/images (rendered by the UI)
- A new `metadata` field like `coinSet` describes which coins are involved
- `correctAnswer` is always in cents (integer math -- no floating point)

**Internal representation:** Always work in cents (integers). Never use floating point for money. Convert to dollar notation only at the display layer. This avoids floating-point rounding bugs (0.1 + 0.2 !== 0.3).

### Bug Library Extension

Add money-specific bugs to the Bug Library. The 8 misconceptions documented above map directly to the existing Bug Library pattern:

```
bugTag: 'money.size-value-confusion'
affectedSkills: ['money.coin-id.compare', 'money.count.dimes']
distractorFn: (problem) => /* return the physically-larger-coin answer */
```

The 2-then-3 confirmation rule applies identically -- detect the pattern twice to suspect, three times to confirm, then enter remediation.

### Skill Prerequisite Graph Extension

Money skills should integrate into the existing DAG:

```
addition.single-digit.no-carry -----> money.coin-id.name (prereq: can add)
                                  |
money.coin-id.name -----> money.coin-id.value -----> money.count.same-type
                                                          |
addition.within-20.no-carry -----> money.count.two-types -----> money.count.mixed
                                                                      |
subtraction.within-20.with-borrow -----> money.change.simple -----> money.change.from-dollar
                                                                          |
addition.two-digit.with-carry -----> money.multi.buy-two -----> money.multi.buy-and-change
```

Money skills depend on arithmetic prerequisites -- a child shouldn't attempt mixed-coin counting until they can add within 20, and shouldn't attempt making change until they can subtract within 20 with borrowing.

### Age/Grade Targeting

| Skill Group | Grade | Age | Prerequisites |
|-------------|-------|-----|---------------|
| Coin identification | 1 | 6-7 | None (entry point) |
| Same-coin counting | 1-2 | 6-8 | Coin identification + addition within 10 |
| Mixed-coin counting | 2 | 7-8 | Same-coin counting + addition within 20 |
| Making change | 2-3 | 7-9 | Mixed-coin counting + subtraction within 20 |
| Dollar notation | 2-3 | 7-9 | Mixed-coin counting |
| Multi-step money | 3-4 | 8-10 | Making change + two-digit addition/subtraction |

### Scope Consideration: Grade 4

The app currently targets ages 6-9 (grades 1-3). Grade 4 money problems (multi-step with decimals, unit pricing) would push into the age 9-10 range. **Recommendation:** Include Levels 1-4 (identification through making change) in the initial money implementation. Level 5 (multi-step with dollar decimals) can be added if/when the app expands to Grade 4.

---

## 7. Key Implementation Pitfalls

### Pitfall 1: Floating-Point Money
**What:** Using JavaScript floating-point for money calculations
**Why bad:** 0.1 + 0.2 = 0.30000000000000004; coin counting accumulates errors
**Prevention:** ALL money math in cents (integers). `75` not `0.75`. Convert to dollar string only for display.

### Pitfall 2: Coin Images as PNGs at Fixed Size
**What:** Using raster images for coins that look blurry on high-DPI screens or wrong at different sizes
**Prevention:** SVG coin illustrations. They scale perfectly and the file sizes are small.

### Pitfall 3: Teaching Counting Before Identification
**What:** Jumping to "how much are 3 dimes" before the child can identify a dime
**Prevention:** Skill DAG enforces identification mastery before counting skills unlock.

### Pitfall 4: Showing All Four Coin Types Immediately
**What:** Overwhelming children with penny+nickel+dime+quarter all at once
**Prevention:** Progressive introduction: penny first, then nickel (skip count by 5), then dime (skip count by 10, address size confusion), then quarter (skip count by 25). Two-coin mixed counting before three-coin, before four-coin.

### Pitfall 5: Ignoring the Physical Size Issue in Digital
**What:** Making all coin images the same size on screen, removing the size-value learning opportunity
**Prevention:** Render coins at proportional sizes (quarter > nickel > penny > dime... wait, dime is actually smaller). This IS the learning moment. The area-model pictorial mode resolves it.

### Pitfall 6: US-Only Assumption Without Extensibility
**What:** Hardcoding penny/nickel/dime/quarter values throughout the codebase
**Prevention:** Define a `CoinSystem` config object: `{ penny: 1, nickel: 5, dime: 10, quarter: 25 }`. Even if only US coins ship initially, the abstraction enables future localization (UK pence, Euro cents).

---

## Sources

### Standards (HIGH confidence)
- [Common Core 2.MD.C.8](https://www.thecorestandards.org/Math/Content/2/MD/C/8/) -- Primary money standard
- [Common Core Grade 4 Measurement & Data](https://www.thecorestandards.org/Math/Content/4/MD/) -- 4.MD.2 money in word problems
- [Common Core Grade 4 Operations](https://www.thecorestandards.org/Math/Content/4/OA/) -- 4.OA.3 multi-step problems
- [Florida MA.1.M.2.2](https://www.cpalms.org/PreviewStandard/Preview/15272) -- Grade 1 coin identification (state standard)
- [CT K-2 Domain Progressions](https://portal.ct.gov/-/media/SDE/CT-Core-Standards/2014/08/CCSS_math_K_2_Domain_Progressions.pdf)

### Pedagogy and Misconceptions (HIGH confidence)
- [Understood.org: Why Kids Struggle with Money](https://www.understood.org/en/articles/counting-money-why-some-kids-struggle-with-it) -- Cognitive challenges
- [Third Space Learning: Money Word Problems](https://thirdspacelearning.com/us/math-resources/topic-guides/number-and-quantity/money-word-problems/) -- Problem types, common mistakes, teaching strategies
- [NRICH: Money Problems](https://nrich.maths.org/articles/money-problems) -- Size vs value misconception research
- [Primary Delight: Teaching Counting Money](https://primarydelightteaching.com/how-to-teach-counting-money-1st-2nd-grade/) -- Teaching sequence
- [Primary Delight: 4 Common Mistakes](https://primarydelightteaching.com/4-common-mistakes-when-teaching-money-to-kids/) -- Pedagogical pitfalls

### Apps and Implementation (MEDIUM confidence)
- [Money Pieces (Math Learning Center)](https://www.mathlearningcenter.org/apps/money-pieces) -- Best-in-class money manipulative, area model
- [SplashLearn Money Games](https://www.splashlearn.com/math/money-games) -- Market leader interactive approach
- [DreamBox: 20 Money Problems for 2nd Grade](https://www.dreambox.com/math/2nd-grade/money-problems-2nd-grade) -- Problem examples

### Word Problem Examples (HIGH confidence)
- [K5 Learning: Grade 2 Money Word Problems](https://www.k5learning.com/free-math-worksheets/second-grade-2/word-problems/money)
- [K5 Learning: Grade 3 Counting Money](https://www.k5learning.com/free-math-worksheets/third-grade-3/counting-money)
- [SuperTeacherWorksheets: Money](https://www.superteacherworksheets.com/money.html)

---
*Research for: Tiny Tallies money curriculum expansion*
*Researched: 2026-03-08*
