# CCSS Math Standards Research: Grades 5-8

**Research Date:** 2026-03-09
**Purpose:** Comprehensive breakdown of US Common Core math standards for grades 5-8, with focus on problem formats and compatibility with Tiny Tallies' existing problem generation engine.

## Current Engine Constraints

The existing math engine (see `src/services/mathEngine/types.ts`) uses:
- `Grade = 1 | 2 | 3 | 4`
- `Problem.operands: [number, number]` — always two numeric operands
- `Problem.correctAnswer: number` — single numeric answer
- `Operation` enum: addition, subtraction, multiplication, division, fractions, place_value, time, money, patterns
- `ProblemTemplate.operandRanges?: [OperandRange, OperandRange]` — two ranges

This document flags which standards fit the current two-operand model and which require new problem structures.

---

## GRADE 5 (Age 10-11)

### Domains Overview
| Code | Domain | Standards Count |
|------|--------|----------------|
| 5.OA | Operations & Algebraic Thinking | 3 |
| 5.NBT | Number & Operations in Base Ten | 7 |
| 5.NF | Number & Operations — Fractions | 7 (with sub-standards) |
| 5.MD | Measurement & Data | 5 (with sub-standards) |
| 5.G | Geometry | 4 |

### 5.OA — Operations & Algebraic Thinking

**5.OA.A.1** — Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.
- **Problem format:** Evaluate multi-step expressions, e.g., `3 × (2 + 5) = ?`, `(8 - 3) × (4 + 1) = ?`
- **Structure needed:** MULTI-STEP EXPRESSION — needs more than two operands plus grouping symbols. Cannot use two-operand model.
- **NEW STRUCTURE REQUIRED:** Expression tree or expression string with evaluation

**5.OA.A.2** — Write simple expressions that record calculations with numbers, and interpret numerical expressions without evaluating them.
- **Problem format:** "Which expression means 'add 3 and 4, then multiply by 2'?" — select from `(3 + 4) × 2`, `3 + 4 × 2`, etc.
- **Structure needed:** Expression interpretation (match description to expression). Multiple-choice with expression options.
- **NEW STRUCTURE REQUIRED:** Expression matching / interpretation format

**5.OA.B.3** — Generate two numerical patterns using two given rules; identify relationships; form ordered pairs and graph them.
- **Problem format:** "Using the rules 'add 3' and 'add 6', starting from 0, what are the first 5 terms of each pattern?" or "What ordered pair corresponds to step 3?"
- **Structure needed:** Pattern generation, ordered pairs, coordinate graphing
- **NEW STRUCTURE REQUIRED:** Pattern/sequence problem type

### 5.NBT — Number & Operations in Base Ten

**5.NBT.A.1** — A digit in one place represents 10 times as much as the place to its right and 1/10 of the place to its left.
- **Problem format:** "In 4,532, the 5 represents ___. How many times greater is this than the 3?" or "What is the value of the 7 in 0.073?"
- **TWO-OPERAND COMPATIBLE:** Can frame as "a × b = ?" where a is digit value and b is 10 or 1/10. Also works as place-value domain problems.

**5.NBT.A.2** — Explain patterns in zeros when multiplying by powers of 10; explain decimal point placement.
- **Problem format:** `3.7 × 100 = ?`, `450 ÷ 10 = ?`
- **TWO-OPERAND COMPATIBLE:** `a × 10^n = ?` or `a ÷ 10^n = ?`. Fits existing multiplication/division with powers of 10.

**5.NBT.A.3a** — Read and write decimals to thousandths using base-ten numerals, number names, and expanded form.
- **Problem format:** "Write 347.392 in expanded form" or "What number is 3 × 100 + 4 × 10 + 7 × 1 + 3 × (1/10) + 9 × (1/100) + 2 × (1/1000)?"
- **NEW STRUCTURE REQUIRED:** Expanded form representation, number-name matching

**5.NBT.A.3b** — Compare two decimals to thousandths using >, =, and <.
- **Problem format:** "Compare: 3.456 ___ 3.465" (choose >, =, or <)
- **TWO-OPERAND COMPATIBLE:** Can use existing two-operand comparison model. Answer is an operator, not a number.
- **MINOR ADAPTATION:** Answer type needs to be comparison operator rather than numeric.

**5.NBT.A.4** — Round decimals to any place.
- **Problem format:** "Round 3.456 to the nearest tenth"
- **TWO-OPERAND COMPATIBLE (loosely):** operand = number, second "operand" = place value. Answer is numeric.

**5.NBT.B.5** — Fluently multiply multi-digit whole numbers using the standard algorithm.
- **Problem format:** `234 × 56 = ?`
- **TWO-OPERAND COMPATIBLE:** Standard `a × b = ?`. Extend operand ranges to 4+ digits.

**5.NBT.B.6** — Whole-number quotients with up to 4-digit dividends and 2-digit divisors.
- **Problem format:** `4,536 ÷ 18 = ?`
- **TWO-OPERAND COMPATIBLE:** Standard `a ÷ b = ?`. Extend operand ranges.

**5.NBT.B.7** — Add, subtract, multiply, and divide decimals to hundredths.
- **Problem format:** `3.45 + 2.7 = ?`, `1.2 × 0.4 = ?`
- **TWO-OPERAND COMPATIBLE:** Standard operations with decimal operands. Need decimal support in operand generation and answer validation (floating-point precision).

### 5.NF — Number & Operations — Fractions

**5.NF.A.1** — Add and subtract fractions with unlike denominators (including mixed numbers).
- **Problem format:** `3/4 + 1/3 = ?`, `2 1/2 - 1 1/3 = ?`
- **TWO-OPERAND COMPATIBLE:** Two fraction operands, one operation. Need fraction representation (numerator/denominator pairs). Answer is a fraction.
- **ADAPTATION NEEDED:** Operands and answer must be fractions, not single numbers.

**5.NF.A.2** — Word problems involving addition and subtraction of fractions.
- **Problem format:** "Maria ate 1/4 of a pizza and Juan ate 1/3. How much did they eat in total?"
- **TWO-OPERAND COMPATIBLE:** Same as 5.NF.A.1 but with word problem wrapper (can use LLM context wrapping).

**5.NF.B.3** — Interpret a fraction as division (a/b = a ÷ b). Solve word problems with division leading to fraction answers.
- **Problem format:** "Share 3 sandwiches equally among 4 people. How much does each get?"
- **TWO-OPERAND COMPATIBLE:** `a ÷ b = ?` where answer is a fraction.

**5.NF.B.4** — Multiply a fraction by a whole number or fraction.
- **Problem format:** `3/4 × 2/5 = ?`, `3 × 2/3 = ?`
- **TWO-OPERAND COMPATIBLE** with fraction operand representation.

**5.NF.B.5** — Compare size of a product to size of one factor based on the other factor (reasoning about multiplication by fractions > 1 vs < 1).
- **Problem format:** "Without calculating, is 7 × 3/4 greater than, equal to, or less than 7?"
- **TWO-OPERAND COMPATIBLE** with comparison answer type.

**5.NF.B.6** — Solve real-world problems involving multiplication of fractions and mixed numbers.
- **Problem format:** Word problems with fraction multiplication.
- **TWO-OPERAND COMPATIBLE** with fraction operands + word problem wrapper.

**5.NF.B.7** — Division with unit fractions: (a) unit fraction ÷ whole number, (b) whole number ÷ unit fraction, (c) word problems.
- **Problem format:** `1/3 ÷ 4 = ?`, `5 ÷ 1/4 = ?`
- **TWO-OPERAND COMPATIBLE** with fraction operand representation.

### 5.MD — Measurement & Data

**5.MD.A.1** — Convert among measurement units within a system (e.g., 5 cm to 0.05 m).
- **Problem format:** "Convert 5 feet to inches", "How many grams in 2.5 kilograms?"
- **TWO-OPERAND COMPATIBLE (loosely):** amount × conversion_factor = ?. But needs unit awareness.
- **ADAPTATION NEEDED:** Unit conversion problem type with unit labels.

**5.MD.B.2** — Line plots with fractional measurements; solve problems from line plots.
- **Problem format:** Data interpretation from visual line plots.
- **NEW STRUCTURE REQUIRED:** Visual data display + data interpretation questions. Not a simple computation.

**5.MD.C.3/C.4** — Understand volume concepts; measure volumes by counting unit cubes.
- **Problem format:** "How many unit cubes fill this rectangular prism?" (with visual)
- **NEW STRUCTURE REQUIRED:** 3D visualization or counting problem.

**5.MD.C.5** — Volume formulas: V = l × w × h and V = B × h for rectangular prisms. Additive volume (composite shapes).
- **Problem format:** "Find the volume of a rectangular prism with length 4, width 3, height 5"
- **5.MD.C.5a/b:** THREE-OPERAND but can be modeled as (l × w) × h — could chain two-operand operations.
- **5.MD.C.5c (additive volume):** NEW STRUCTURE REQUIRED — composite shape with two sub-volumes to add.
- **ADAPTATION NEEDED:** Formula application with 3 inputs (l, w, h). Cannot truly fit two-operand model.

### 5.G — Geometry

**5.G.A.1** — Coordinate system with perpendicular axes; locate points using ordered pairs.
- **Problem format:** "What are the coordinates of point A?" (with grid) or "Plot the point (3, 5)"
- **NEW STRUCTURE REQUIRED:** Coordinate grid interaction.

**5.G.A.2** — Graph points in first quadrant; interpret coordinate values in context.
- **Problem format:** Contextual coordinate problems.
- **NEW STRUCTURE REQUIRED:** Same as 5.G.A.1 — coordinate grid.

**5.G.B.3** — Attributes of 2D figure categories apply to subcategories.
- **Problem format:** "All rectangles are parallelograms. True or false?" or classification questions.
- **NEW STRUCTURE REQUIRED:** Classification / true-false / categorical reasoning.

**5.G.B.4** — Classify 2D figures in a hierarchy based on properties.
- **Problem format:** "Which of these shapes is a rhombus?" or "A square is a special type of ___"
- **NEW STRUCTURE REQUIRED:** Shape classification.

---

## GRADE 6 (Age 11-12)

### Domains Overview
| Code | Domain | Standards Count |
|------|--------|----------------|
| 6.RP | Ratios & Proportional Relationships | 3 (with sub-standards) |
| 6.NS | The Number System | 8 (with sub-standards) |
| 6.EE | Expressions & Equations | 9 (with sub-standards) |
| 6.G | Geometry | 4 |
| 6.SP | Statistics & Probability | 5 (with sub-standards) |

### 6.RP — Ratios & Proportional Relationships

**6.RP.A.1** — Understand the concept of a ratio; use ratio language to describe relationships.
- **Problem format:** "There are 3 apples for every 5 oranges. What is the ratio of apples to oranges?" or "Express the ratio 6:9 in simplest form."
- **TWO-OPERAND COMPATIBLE (loosely):** Two quantities form a ratio. Answer could be expressed as simplified ratio.
- **ADAPTATION NEEDED:** Ratio answer format (a:b or a/b).

**6.RP.A.2** — Understand unit rate a/b associated with ratio a:b (b != 0).
- **Problem format:** "If 12 oranges cost $3, what is the cost per orange?"
- **TWO-OPERAND COMPATIBLE:** `a ÷ b = ?` to find unit rate. Standard division.

**6.RP.A.3** — Use ratio and rate reasoning to solve problems.
- **6.RP.A.3a** — Tables of equivalent ratios; find missing values; plot on coordinate plane.
  - **Problem format:** "Complete the ratio table: 2:5, 4:?, 6:?, 8:?"
  - **NEW STRUCTURE REQUIRED:** Table completion, multiple missing values.

- **6.RP.A.3b** — Unit rate problems (unit pricing, constant speed).
  - **Problem format:** "A car travels 180 miles in 3 hours. What is the speed in miles per hour?"
  - **TWO-OPERAND COMPATIBLE:** `a ÷ b = ?`.

- **6.RP.A.3c** — Find a percent of a quantity as rate per 100; find whole given part and percent.
  - **Problem format:** "What is 30% of 150?", "15 is 25% of what number?"
  - **TWO-OPERAND COMPATIBLE:** `a × (b/100) = ?` or `a ÷ (b/100) = ?`. Two operands (quantity, percent).

- **6.RP.A.3d** — Ratio reasoning to convert measurement units.
  - **Problem format:** "Convert 5 kilometers to meters."
  - **TWO-OPERAND COMPATIBLE:** `a × conversion_factor = ?`.

### 6.NS — The Number System

**6.NS.A.1** — Divide fractions by fractions; solve word problems.
- **Problem format:** `3/4 ÷ 2/5 = ?`
- **TWO-OPERAND COMPATIBLE** with fraction operand representation.

**6.NS.B.2** — Fluently divide multi-digit numbers using standard algorithm.
- **Problem format:** `9,876 ÷ 32 = ?`
- **TWO-OPERAND COMPATIBLE:** Standard long division.

**6.NS.B.3** — Fluently add, subtract, multiply, and divide multi-digit decimals.
- **Problem format:** `34.56 × 7.8 = ?`, `123.45 - 67.89 = ?`
- **TWO-OPERAND COMPATIBLE** with decimal support.

**6.NS.B.4** — GCF of two numbers (<=100); LCM of two numbers (<=12); distributive property to express sums.
- **Problem format:** "What is the GCF of 24 and 36?", "What is the LCM of 4 and 6?"
- **TWO-OPERAND COMPATIBLE:** Two inputs, one numeric answer. Need new operation types (GCF, LCM).
- **NEW OPERATION TYPE NEEDED:** `gcf` and `lcm` operations.

**6.NS.C.5** — Understand positive and negative numbers; use them in real-world contexts.
- **Problem format:** "A temperature of -5 degrees means ___ degrees below zero." Conceptual.
- **NEW STRUCTURE REQUIRED:** Conceptual understanding / contextualization.

**6.NS.C.6** — Rational numbers on number line; coordinate axes with negative numbers.
- **6.NS.C.6a** — Opposite signs indicate opposite sides of 0; `-(-3) = 3`
  - **Problem format:** "What is the opposite of -7?", "What is -(-5)?"
  - **TWO-OPERAND COMPATIBLE (loosely):** Unary operation — not truly two operands.
  - **ADAPTATION NEEDED:** Unary operations (negation, absolute value).

- **6.NS.C.6b** — Signs in ordered pairs indicate quadrants; reflections across axes.
  - **NEW STRUCTURE REQUIRED:** Coordinate plane reasoning.

- **6.NS.C.6c** — Position integers and rational numbers on number lines and coordinate planes.
  - **NEW STRUCTURE REQUIRED:** Number line / coordinate plane interaction.

**6.NS.C.7** — Ordering and absolute value of rational numbers.
- **6.NS.C.7a** — Inequality as position on number line.
  - **Problem format:** "Is -3 > -5? Use the number line to explain."
  - **TWO-OPERAND COMPATIBLE:** Comparison with answer type (>, <, =).

- **6.NS.C.7b** — Write and interpret statements of order in real-world contexts.
  - **Problem format:** "Order from least to greatest: -3, 1.5, -0.5, 2"
  - **NEW STRUCTURE REQUIRED:** Ordering/sorting — more than 2 items to compare.

- **6.NS.C.7c/d** — Absolute value as distance from 0; interpret in real-world context.
  - **Problem format:** "What is |-7|?", "Which is farther from 0: -4 or 3?"
  - **ADAPTATION NEEDED:** Unary operation (absolute value) or comparison.

**6.NS.C.8** — Solve problems by graphing in all four quadrants; find distances between points with same x or y coordinate.
- **Problem format:** "Find the distance between (-3, 2) and (5, 2)."
- **TWO-OPERAND COMPATIBLE (loosely):** Distance = |x2 - x1| or |y2 - y1|. But input is coordinate pairs.
- **ADAPTATION NEEDED:** Coordinate pair inputs.

### 6.EE — Expressions & Equations

**6.EE.A.1** — Write and evaluate numerical expressions involving whole-number exponents.
- **Problem format:** `2^3 = ?`, `5^2 + 3 = ?`, "Write 8 × 8 × 8 using an exponent."
- **TWO-OPERAND COMPATIBLE:** `a^b = ?` — base and exponent are two operands.
- **NEW OPERATION TYPE NEEDED:** `exponentiation`.

**6.EE.A.2** — Write, read, and evaluate expressions with variables.
- **6.EE.A.2a** — Write expressions with letters for numbers.
  - **Problem format:** "Write an expression for '5 less than a number n'" => `n - 5`
  - **NEW STRUCTURE REQUIRED:** Expression writing / symbolic output.

- **6.EE.A.2b** — Identify parts of expression (sum, term, product, factor, quotient, coefficient).
  - **Problem format:** "In 3x + 7, what is the coefficient of x?"
  - **NEW STRUCTURE REQUIRED:** Expression parsing / vocabulary.

- **6.EE.A.2c** — Evaluate expressions at specific values of variables.
  - **Problem format:** "Evaluate 3x + 2 when x = 5"
  - **NEW STRUCTURE REQUIRED:** Variable substitution and multi-step evaluation.

**6.EE.A.3** — Apply properties of operations to generate equivalent expressions (e.g., distributive property).
- **Problem format:** "Use distributive property to write an equivalent expression for 3(x + 4)"
- **NEW STRUCTURE REQUIRED:** Algebraic manipulation, symbolic output.

**6.EE.A.4** — Identify when two expressions are equivalent.
- **Problem format:** "Are 2(x + 3) and 2x + 6 equivalent?"
- **NEW STRUCTURE REQUIRED:** Expression equivalence checking.

**6.EE.B.5** — Understand solving equations/inequalities; use substitution to check.
- **Problem format:** "Does x = 3 make the equation 2x + 1 = 7 true?"
- **TWO-OPERAND COMPATIBLE (loosely):** Substitution check can be framed as evaluation. But conceptually different.

**6.EE.B.6** — Use variables to represent numbers; write expressions for real-world problems.
- **Problem format:** "Write an equation for: 'A number increased by 7 equals 15'"
- **NEW STRUCTURE REQUIRED:** Equation writing from verbal description.

**6.EE.B.7** — Solve one-step equations: `x + p = q`, `px = q` for non-negative rational numbers.
- **Problem format:** "Solve for x: x + 8 = 15", "Solve: 3x = 12"
- **TWO-OPERAND COMPATIBLE (with reframing):** Known value and coefficient/addend are two operands. Answer is the variable value.
- **NEW OPERATION TYPE NEEDED:** `solve_one_step` — inversion of arithmetic operations.

**6.EE.B.8** — Write inequalities `x > c` or `x < c`; represent on number line.
- **Problem format:** "Graph x > 3 on a number line"
- **NEW STRUCTURE REQUIRED:** Inequality representation, number line visualization.

**6.EE.C.9** — Variables for two related quantities (dependent/independent); write equations; graph and table.
- **Problem format:** "If y = 2x + 3, complete the table for x = 1, 2, 3, 4"
- **NEW STRUCTURE REQUIRED:** Function tables, graphing.

### 6.G — Geometry

**6.G.A.1** — Area of triangles, special quadrilaterals, and polygons by composing/decomposing.
- **Problem format:** "Find the area of a triangle with base 8 and height 5"
- **TWO-OPERAND COMPATIBLE:** For triangles, `(b × h) / 2` — can be modeled as two operands with formula.
- **ADAPTATION NEEDED:** Formula application with known formula. Answer = (a × b) / 2.

**6.G.A.2** — Volume of right rectangular prism with fractional edge lengths (V = lwh or V = Bh).
- **Problem format:** "Find the volume: l = 3.5, w = 2, h = 4"
- **THREE-OPERAND:** Requires l, w, h. Same issue as 5.MD.C.5.
- **ADAPTATION NEEDED:** Three-input formula application.

**6.G.A.3** — Draw polygons in coordinate plane; find side lengths from coordinates.
- **Problem format:** "Find the length of the side from (2, 3) to (2, 8)"
- **TWO-OPERAND COMPATIBLE (loosely):** Absolute difference of matching coordinates.

**6.G.A.4** — Surface area from nets (rectangles and triangles).
- **Problem format:** "Find the surface area of a rectangular prism with dimensions 3 × 4 × 5"
- **NEW STRUCTURE REQUIRED:** Multi-step formula: 2(lw + lh + wh). Needs 3+ inputs.

### 6.SP — Statistics & Probability

**6.SP.A.1/A.2/A.3** — Recognize statistical questions; understand distribution, center, spread.
- **Problem format:** Conceptual/classification questions.
- **NEW STRUCTURE REQUIRED:** Not computational — conceptual understanding.

**6.SP.B.4** — Display data in dot plots, histograms, box plots.
- **NEW STRUCTURE REQUIRED:** Data visualization — beyond computation.

**6.SP.B.5** — Summarize data sets: count, mean, median, mode, range, IQR, MAD.
- **Problem format:** "Find the mean of: 3, 5, 7, 2, 8", "Find the median of: 12, 4, 7, 9, 15"
- **NEW STRUCTURE REQUIRED:** Operates on a LIST of numbers, not two operands. Needs variable-length input.

---

## GRADE 7 (Age 12-13)

### Domains Overview
| Code | Domain | Standards Count |
|------|--------|----------------|
| 7.RP | Ratios & Proportional Relationships | 3 (with sub-standards) |
| 7.NS | The Number System | 3 (with sub-standards) |
| 7.EE | Expressions & Equations | 4 (with sub-standards) |
| 7.G | Geometry | 6 |
| 7.SP | Statistics & Probability | 8 (with sub-standards) |

### 7.RP — Ratios & Proportional Relationships

**7.RP.A.1** — Compute unit rates with ratios of fractions (e.g., 1/2 mile per 1/4 hour).
- **Problem format:** `(1/2) ÷ (1/4) = ?` — fraction divided by fraction.
- **TWO-OPERAND COMPATIBLE** with fraction operand support.

**7.RP.A.2** — Recognize and represent proportional relationships.
- **7.RP.A.2a** — Test for proportional relationships in tables/graphs.
  - **NEW STRUCTURE REQUIRED:** Table analysis, proportionality testing.
- **7.RP.A.2b** — Identify constant of proportionality in tables, graphs, equations, diagrams.
  - **Problem format:** "In the table (2,6), (3,9), (5,15), what is the constant of proportionality?"
  - **NEW STRUCTURE REQUIRED:** Extracting rate from data set.
- **7.RP.A.2c** — Represent proportional relationships by equations.
  - **Problem format:** "Write an equation: y is 3 times x" => y = 3x
  - **NEW STRUCTURE REQUIRED:** Equation writing.
- **7.RP.A.2d** — Explain what (x,y) means on proportional relationship graph, especially (0,0) and (1,r).
  - **NEW STRUCTURE REQUIRED:** Graph interpretation — conceptual.

**7.RP.A.3** — Use proportional relationships to solve multistep ratio and percent problems.
- **Problem format:** "An item costs $40 and is on sale for 25% off. What is the sale price?", "A population grew from 500 to 650. What is the percent increase?"
- **TWO-OPERAND COMPATIBLE:** Can often be modeled as `a × (1 - b/100)` or similar. But multi-step.
- **ADAPTATION NEEDED:** Multi-step percent problems (markup, discount, tax, tip, percent change).

### 7.NS — The Number System

**7.NS.A.1** — Add and subtract rational numbers (including negatives).
- **7.NS.A.1a** — Opposite quantities combine to make 0.
- **7.NS.A.1b** — p + q on number line; additive inverses.
- **7.NS.A.1c** — Subtraction as adding additive inverse: p - q = p + (-q).
- **7.NS.A.1d** — Properties of operations for adding/subtracting rational numbers.
- **Problem format:** `-3 + 7 = ?`, `5 - (-2) = ?`, `-4.5 + (-2.3) = ?`
- **TWO-OPERAND COMPATIBLE:** Standard `a + b` or `a - b` with negative numbers (integers, decimals, fractions).

**7.NS.A.2** — Multiply and divide rational numbers (including negatives).
- **7.NS.A.2a** — Rules for multiplying signed numbers, e.g., (-1)(-1) = 1.
- **7.NS.A.2b** — Integer division rules; -(p/q) = (-p)/q = p/(-q).
- **7.NS.A.2c** — Properties for multiplying/dividing rational numbers.
- **7.NS.A.2d** — Convert rational number to decimal via long division; terminating vs repeating.
- **Problem format:** `-3 × 4 = ?`, `-12 ÷ (-3) = ?`, "Convert 1/3 to a decimal"
- **TWO-OPERAND COMPATIBLE:** Standard operations with signed numbers.

**7.NS.A.3** — Solve real-world problems involving four operations with rational numbers.
- **Problem format:** Multi-step word problems with positive and negative rational numbers.
- **PARTIALLY COMPATIBLE:** Individual steps are two-operand, but problems may be multi-step.

### 7.EE — Expressions & Equations

**7.EE.A.1** — Apply properties to add, subtract, factor, and expand linear expressions with rational coefficients.
- **Problem format:** "Simplify: 3x + 2x - 5", "Factor: 6x + 12", "Expand: 4(2x - 3)"
- **NEW STRUCTURE REQUIRED:** Algebraic expression manipulation. Symbolic input/output.

**7.EE.A.2** — Rewriting expressions in different forms reveals relationships.
- **Problem format:** "Rewrite 0.05p + p as 1.05p to show the total after a 5% increase"
- **NEW STRUCTURE REQUIRED:** Expression transformation — conceptual/symbolic.

**7.EE.B.3** — Solve multi-step problems with positive and negative rationals in any form; convert between forms; assess reasonableness.
- **Problem format:** Multi-step word problems mixing fractions, decimals, and integers.
- **PARTIALLY COMPATIBLE:** Multi-step, but individual steps can be two-operand.

**7.EE.B.4** — Construct and solve equations and inequalities.
- **7.EE.B.4a** — Solve equations of form `px + q = r` and `p(x + q) = r`.
  - **Problem format:** "Solve: 3x + 5 = 20", "Solve: 2(x + 4) = 14"
  - **NEW STRUCTURE REQUIRED:** Two-step equation solving. Three values (p, q, r) define the equation. Needs algebraic solving engine.

- **7.EE.B.4b** — Solve inequalities of form `px + q > r` or `px + q < r`; graph solution set.
  - **Problem format:** "Solve: 2x + 3 > 11", "Graph the solution."
  - **NEW STRUCTURE REQUIRED:** Inequality solving + number line graphing.

### 7.G — Geometry

**7.G.A.1** — Scale drawings: compute actual lengths/areas from scale.
- **Problem format:** "On a map with scale 1 cm : 50 km, two cities are 3.5 cm apart. What is the actual distance?"
- **TWO-OPERAND COMPATIBLE:** `a × scale_factor = ?`.

**7.G.A.2** — Draw/construct geometric shapes with given conditions; triangle construction from angles/sides.
- **NEW STRUCTURE REQUIRED:** Geometric construction — interactive, not computational.

**7.G.A.3** — Describe 2D figures from slicing 3D figures.
- **NEW STRUCTURE REQUIRED:** Spatial reasoning — conceptual/visual.

**7.G.B.4** — Circle formulas: A = pi*r^2, C = 2*pi*r (or pi*d).
- **Problem format:** "Find the area of a circle with radius 7", "Find the circumference of a circle with diameter 10"
- **TWO-OPERAND COMPATIBLE (loosely):** `pi × r^2` or `pi × d`. But one operand is always pi.
- **ADAPTATION NEEDED:** Formula application with pi constant.

**7.G.B.5** — Supplementary, complementary, vertical, and adjacent angles; solve equations for unknown angles.
- **Problem format:** "Two supplementary angles: one is 65 degrees. Find the other.", "Vertical angles: one is 3x + 10 and the other is 40. Find x."
- **PARTIALLY COMPATIBLE:** Simpler cases are `180 - a = ?` (two operands). More complex cases involve equation solving.

**7.G.B.6** — Area, volume, surface area of 2D and 3D objects (triangles, quadrilaterals, polygons, cubes, prisms).
- **Problem format:** "Find the volume of a rectangular prism: 4 × 5 × 6", "Find the surface area of a cube with side 3"
- **MULTI-OPERAND:** Most formulas need 2-3 inputs. Volume = l × w × h.
- **ADAPTATION NEEDED:** Formula application with varying input count.

### 7.SP — Statistics & Probability

**7.SP.A.1/A.2** — Random sampling; draw inferences about population from samples.
- **NEW STRUCTURE REQUIRED:** Conceptual understanding, data analysis.

**7.SP.B.3/B.4** — Compare two data distributions; use measures of center and variability for comparative inference.
- **NEW STRUCTURE REQUIRED:** Data set operations, list-based computation.

**7.SP.C.5** — Probability as number between 0 and 1.
- **Problem format:** "A bag has 3 red and 5 blue marbles. What is the probability of drawing a red marble?"
- **TWO-OPERAND COMPATIBLE:** `favorable ÷ total = ?` — basic fraction/division.

**7.SP.C.6** — Experimental probability from data; relative frequency.
- **Problem format:** "A coin was flipped 100 times and landed heads 47 times. What is the experimental probability?"
- **TWO-OPERAND COMPATIBLE:** `a ÷ b = ?`.

**7.SP.C.7** — Develop probability models; compare to observed frequencies.
- **7.SP.C.7a** — Uniform probability models.
  - **Problem format:** "A fair die is rolled. What is the probability of rolling a 3?"
  - **TWO-OPERAND COMPATIBLE:** `1 ÷ n = ?`.
- **7.SP.C.7b** — Non-uniform probability models from frequency data.
  - **NEW STRUCTURE REQUIRED:** Data-driven probability.

**7.SP.C.8** — Compound event probabilities using organized lists, tables, tree diagrams, simulation.
- **Problem format:** "Two dice are rolled. What is the probability the sum is 7?"
- **NEW STRUCTURE REQUIRED:** Sample space enumeration, compound probability.

---

## GRADE 8 (Age 13-14)

### Domains Overview
| Code | Domain | Standards Count |
|------|--------|----------------|
| 8.NS | The Number System | 2 |
| 8.EE | Expressions & Equations | 8 (with sub-standards) |
| 8.F | Functions | 5 |
| 8.G | Geometry | 9 (with sub-standards) |
| 8.SP | Statistics & Probability | 4 |

### 8.NS — The Number System

**8.NS.A.1** — Irrational numbers; rational numbers have repeating/terminating decimals; convert repeating decimals to fractions.
- **Problem format:** "Is sqrt(5) rational or irrational?", "Convert 0.333... to a fraction"
- **PARTIALLY COMPATIBLE:** Classification is conceptual. Conversion can be two-operand.

**8.NS.A.2** — Approximate irrational numbers on number line; estimate expressions like pi^2.
- **Problem format:** "Between which two integers does sqrt(10) lie?", "Estimate sqrt(50) to the nearest tenth."
- **TWO-OPERAND COMPATIBLE (loosely):** Can ask "sqrt(a) is between b and b+1, find b."
- **ADAPTATION NEEDED:** Square root estimation problems.

### 8.EE — Expressions & Equations

**8.EE.A.1** — Properties of integer exponents: e.g., 3^2 × 3^(-5) = 3^(-3) = 1/27.
- **Problem format:** "Simplify: 2^3 × 2^4", "Evaluate: 5^(-2)"
- **TWO-OPERAND COMPATIBLE:** Exponent arithmetic — base^exp, or combine exponents.
- **ADAPTATION NEEDED:** Negative exponents; exponent rules.

**8.EE.A.2** — Square root and cube root symbols for x^2 = p and x^3 = p.
- **Problem format:** "What is sqrt(64)?", "What is the cube root of 27?", "Solve: x^2 = 144"
- **TWO-OPERAND COMPATIBLE (loosely):** Root operations are essentially unary (one input). Can model as `root(n, a)`.
- **ADAPTATION NEEDED:** Root operations.

**8.EE.A.3** — Scientific notation for very large/small quantities; compare magnitudes.
- **Problem format:** "Express 45,000,000 in scientific notation", "How many times larger is 3 × 10^8 than 6 × 10^5?"
- **TWO-OPERAND COMPATIBLE:** Coefficient × 10^exponent format. Comparison is division.
- **ADAPTATION NEEDED:** Scientific notation format for inputs/outputs.

**8.EE.A.4** — Operations with numbers in scientific notation.
- **Problem format:** `(3 × 10^4) × (2 × 10^3) = ?`
- **TWO-OPERAND COMPATIBLE:** Two scientific-notation numbers, one operation.
- **ADAPTATION NEEDED:** Scientific notation representation.

**8.EE.B.5** — Graph proportional relationships; interpret unit rate as slope; compare proportional relationships.
- **Problem format:** "From the graph, what is the slope (unit rate)?", comparison of two representations.
- **NEW STRUCTURE REQUIRED:** Graph interpretation, multi-representation comparison.

**8.EE.B.6** — Derive y = mx and y = mx + b using similar triangles; slope concept.
- **Problem format:** "Find the slope between points (2, 3) and (6, 11)"
- **TWO-OPERAND COMPATIBLE (loosely):** Slope = (y2-y1)/(x2-x1). But input is two coordinate pairs.
- **ADAPTATION NEEDED:** Coordinate pair inputs for slope calculation.

**8.EE.C.7** — Solve linear equations in one variable.
- **8.EE.C.7a** — Recognize one solution, infinitely many, or no solutions.
  - **Problem format:** "How many solutions does 2x + 3 = 2x + 5 have?"
  - **NEW STRUCTURE REQUIRED:** Equation analysis — conceptual reasoning.
- **8.EE.C.7b** — Solve linear equations with rational coefficients, distributive property, like terms.
  - **Problem format:** "Solve: 3(x - 2) + 4 = 2x + 5", "Solve: 0.5x + 1.2 = 3.7"
  - **NEW STRUCTURE REQUIRED:** Multi-step linear equation solver. Far beyond two-operand.

**8.EE.C.8** — Systems of two linear equations.
- **8.EE.C.8a** — Solutions as intersection points.
  - **NEW STRUCTURE REQUIRED:** Conceptual understanding of systems.
- **8.EE.C.8b** — Solve systems algebraically and by graphing.
  - **Problem format:** "Solve: y = 2x + 1 and y = -x + 7"
  - **NEW STRUCTURE REQUIRED:** System of equations solver. Two equations, two unknowns.
- **8.EE.C.8c** — Real-world problems leading to systems.
  - **NEW STRUCTURE REQUIRED:** Same solver with word problem wrapper.

### 8.F — Functions

**8.F.A.1** — Function as rule assigning each input exactly one output.
- **Problem format:** "Does this table represent a function?" (check for repeated x with different y)
- **NEW STRUCTURE REQUIRED:** Table analysis, conceptual classification.

**8.F.A.2** — Compare properties of two functions in different representations.
- **Problem format:** "Which function has the greater rate of change: y = 3x + 1 or the function shown in the table?"
- **NEW STRUCTURE REQUIRED:** Multi-representation comparison.

**8.F.A.3** — y = mx + b defines a linear function; give examples of nonlinear functions.
- **Problem format:** "Is y = x^2 linear or nonlinear?", "Which equation represents a linear function?"
- **NEW STRUCTURE REQUIRED:** Classification / conceptual.

**8.F.B.4** — Construct a function to model a linear relationship; find rate of change and initial value from description, table, or graph.
- **Problem format:** "A plumber charges $50 plus $30 per hour. Write the equation.", "From the table, find the slope and y-intercept."
- **NEW STRUCTURE REQUIRED:** Function construction from context/data.

**8.F.B.5** — Describe functional relationships qualitatively from graphs (increasing/decreasing, linear/nonlinear).
- **Problem format:** "On which interval is the function increasing?" (from graph)
- **NEW STRUCTURE REQUIRED:** Graph interpretation — visual/conceptual.

### 8.G — Geometry

**8.G.A.1** — Properties preserved under rotations, reflections, translations (lines stay lines, lengths preserved, angles preserved, parallel lines stay parallel).
- **NEW STRUCTURE REQUIRED:** Transformation concepts — visual/conceptual.

**8.G.A.2** — Congruence via sequences of rotations, reflections, translations.
- **NEW STRUCTURE REQUIRED:** Transformation reasoning.

**8.G.A.3** — Effects of dilations, translations, rotations, reflections on 2D figures using coordinates.
- **Problem format:** "Reflect point (3, -2) over the x-axis. What are the new coordinates?"
- **PARTIALLY COMPATIBLE:** Individual transformations can be computed, but need coordinate input/output.
- **ADAPTATION NEEDED:** Coordinate transformation operations.

**8.G.A.4** — Similarity via sequences of rotations, reflections, translations, and dilations.
- **NEW STRUCTURE REQUIRED:** Transformation/similarity reasoning.

**8.G.A.5** — Angle sum of triangles (180 degrees); exterior angles; transversal angles; AA similarity criterion.
- **Problem format:** "Two angles of a triangle are 45 and 70. Find the third angle.", "Parallel lines cut by transversal: if one angle is 110, find the others."
- **TWO-OPERAND COMPATIBLE (simple cases):** `180 - (a + b) = ?` for triangle angles.
- **ADAPTATION NEEDED:** Some cases need three inputs (two known angles).

**8.G.B.6** — Explain proof of Pythagorean Theorem and its converse.
- **NEW STRUCTURE REQUIRED:** Proof/conceptual understanding.

**8.G.B.7** — Apply Pythagorean Theorem to find unknown side lengths.
- **Problem format:** "A right triangle has legs 3 and 4. Find the hypotenuse.", "Hypotenuse is 13, one leg is 5. Find the other leg."
- **TWO-OPERAND COMPATIBLE:** `sqrt(a^2 + b^2)` or `sqrt(c^2 - a^2)`.
- **ADAPTATION NEEDED:** Pythagorean theorem computation. Answer involves square root.

**8.G.B.8** — Pythagorean Theorem for distance between two points in coordinate system.
- **Problem format:** "Find the distance between (1, 2) and (4, 6)"
- **TWO-OPERAND COMPATIBLE (loosely):** `sqrt((x2-x1)^2 + (y2-y1)^2)`. Needs coordinate pair inputs.
- **ADAPTATION NEEDED:** Coordinate pair inputs, multi-step computation.

**8.G.C.9** — Volume formulas for cones, cylinders, spheres.
- **Problem format:** "Find the volume of a cylinder with radius 3 and height 10", "Find the volume of a sphere with radius 6"
- **PARTIALLY COMPATIBLE:** Sphere is `(4/3) × pi × r^3` (one variable input). Cylinder is `pi × r^2 × h` (two variable inputs).
- **ADAPTATION NEEDED:** Formula application with pi, varying input counts.

### 8.SP — Statistics & Probability

**8.SP.A.1** — Scatter plots; describe patterns (clustering, outliers, association type).
- **NEW STRUCTURE REQUIRED:** Data visualization and interpretation.

**8.SP.A.2** — Informally fit lines to scatter plots; assess model fit.
- **NEW STRUCTURE REQUIRED:** Visual estimation / line fitting.

**8.SP.A.3** — Use equation of linear model to solve problems; interpret slope and intercept.
- **Problem format:** "Using y = 2.5x + 10, predict the value when x = 8"
- **TWO-OPERAND COMPATIBLE (loosely):** Variable substitution: `2.5 × 8 + 10`. But multi-step.
- **ADAPTATION NEEDED:** Expression evaluation.

**8.SP.A.4** — Two-way tables for bivariate categorical data; relative frequencies.
- **NEW STRUCTURE REQUIRED:** Table construction and interpretation.

---

## SUMMARY: Problem Format Requirements

### Standards That FIT the Current Two-Operand Model (`a op b = ?`)

These can reuse the existing `Problem` type with extended operand ranges and decimal/negative support:

| Grade | Standards | Description |
|-------|-----------|-------------|
| 5 | 5.NBT.A.1, A.2, A.4, B.5, B.6, B.7 | Multi-digit arithmetic, decimals, powers of 10 |
| 5 | 5.NF.A.1, A.2, B.3, B.4, B.6, B.7 | Fraction arithmetic (with fraction operand type) |
| 6 | 6.RP.A.2, A.3b, A.3c, A.3d | Unit rates, percent of quantity, unit conversion |
| 6 | 6.NS.A.1, B.2, B.3 | Fraction division, multi-digit decimal arithmetic |
| 6 | 6.EE.A.1 | Exponentiation (a^b) |
| 6 | 6.EE.B.7 | One-step equations (inverse operation) |
| 7 | 7.RP.A.1 | Unit rates with fraction division |
| 7 | 7.NS.A.1, A.2 | Four operations with signed rational numbers |
| 7 | 7.G.A.1 | Scale factor computation |
| 7 | 7.SP.C.5, C.6, C.7a | Basic probability (favorable/total) |
| 8 | 8.EE.A.1 | Exponent rules |
| 8 | 8.EE.A.3, A.4 | Scientific notation operations |

### Standards That Need MINOR ADAPTATIONS to Two-Operand Model

These need small changes: comparison answers, fraction I/O, unary operations, formula constants:

| Adaptation | Standards | What's Needed |
|-----------|-----------|---------------|
| **Comparison answer (>, <, =)** | 5.NBT.A.3b, 5.NF.B.5, 6.NS.C.7a | Answer is operator, not number |
| **Fraction operands & answer** | 5.NF.*, 6.NS.A.1, 7.RP.A.1, 7.NS.* | Operands as numerator/denominator pairs |
| **Unary operations** | 6.NS.C.6a (negation), 6.NS.C.7c (abs value), 8.EE.A.2 (sqrt/cbrt) | Single input, not two |
| **Formula with constant (pi)** | 7.G.B.4, 8.G.C.9 | One variable + constant (pi) |
| **Decimal/negative operands** | 5.NBT.B.7, 7.NS.A.1-3 | Extended number types |
| **New operation types** | 6.NS.B.4 (GCF/LCM), 6.EE.A.1 (exponents) | New `Operation` enum values |

### Standards That REQUIRE NEW Problem Structures

These fundamentally cannot work with `operands: [number, number]`:

| New Structure | Standards | Description |
|---------------|-----------|-------------|
| **Multi-step expression evaluation** | 5.OA.A.1, 6.EE.A.2c, 8.SP.A.3 | `3 + 4 × 2 = ?`, `3x + 2 when x = 5` |
| **Expression interpretation/matching** | 5.OA.A.2, 6.EE.A.2a/b, 6.EE.A.3, 6.EE.A.4, 7.EE.A.1, 7.EE.A.2 | Match verbal to symbolic, simplify expressions |
| **Pattern/sequence problems** | 5.OA.B.3 | Generate terms, identify rules |
| **Ordering/sorting (>2 items)** | 6.NS.C.7b | Order from least to greatest |
| **Three-operand formulas** | 5.MD.C.5, 6.G.A.2, 6.G.A.4, 7.G.B.6 | V = lwh, surface area |
| **Variable/equation solving (2-step)** | 7.EE.B.4a | Solve `px + q = r` |
| **Variable/equation solving (multi-step)** | 8.EE.C.7b | Solve `3(x-2) + 4 = 2x + 5` |
| **Systems of equations** | 8.EE.C.8 | Two equations, two unknowns |
| **Inequality solving + graphing** | 6.EE.B.8, 7.EE.B.4b | Solve and graph on number line |
| **Coordinate operations** | 5.G.A.1/2, 6.NS.C.6b/c, 6.NS.C.8, 8.G.A.3, 8.G.B.8 | Input/output as coordinate pairs |
| **Function tables/graphing** | 6.EE.C.9, 8.F.A.1-3, 8.F.B.4/5 | Tables, graphs, rate of change |
| **Statistical measures on lists** | 6.SP.B.5, 7.SP.B.3/4 | Mean, median, IQR on data sets |
| **Data visualization interpretation** | 5.MD.B.2, 6.SP.B.4, 8.SP.A.1/2 | Line plots, histograms, scatter plots |
| **Probability (compound events)** | 7.SP.C.8 | Sample spaces, tree diagrams |
| **Conceptual/classification** | 5.G.B.3/4, 6.NS.C.5, 6.SP.A.1-3, 8.NS.A.1, 8.F.A.3, 8.G.A.1/2/4, 8.G.B.6 | True/false, classify, explain |
| **Geometric construction/spatial** | 7.G.A.2, 7.G.A.3 | Interactive construction, spatial reasoning |

### Recommended New `Operation` Types for Grades 5-8

```
// Extend existing Operation type:
export type Operation =
  // Existing (grades 1-4):
  | 'addition' | 'subtraction' | 'multiplication' | 'division'
  | 'fractions' | 'place_value' | 'time' | 'money' | 'patterns'
  // Grade 5-6 additions:
  | 'decimal_arithmetic'    // 5.NBT.B.7, 6.NS.B.3
  | 'fraction_arithmetic'   // 5.NF.*, 6.NS.A.1 (extended beyond grade 3-4 fractions)
  | 'exponents'             // 6.EE.A.1, 8.EE.A.1
  | 'order_of_operations'   // 5.OA.A.1
  | 'gcf_lcm'              // 6.NS.B.4
  | 'ratios'               // 6.RP.*
  | 'percent'              // 6.RP.A.3c, 7.RP.A.3
  | 'unit_conversion'      // 5.MD.A.1, 6.RP.A.3d
  // Grade 6-7 additions:
  | 'integers'             // 6.NS.C.*, 7.NS.* (signed number operations)
  | 'absolute_value'       // 6.NS.C.7c/d
  | 'expressions'          // 6.EE.A.2, 7.EE.A.1
  | 'one_step_equations'   // 6.EE.B.7
  | 'two_step_equations'   // 7.EE.B.4a
  | 'geometry_area'        // 6.G.A.1, 7.G.B.6
  | 'geometry_volume'      // 5.MD.C.5, 6.G.A.2, 7.G.B.6
  | 'geometry_circles'     // 7.G.B.4
  | 'angles'               // 7.G.B.5, 8.G.A.5
  | 'probability'          // 7.SP.C.*
  | 'statistics'           // 6.SP.B.5, 7.SP.B.*
  // Grade 8 additions:
  | 'roots'                // 8.EE.A.2
  | 'scientific_notation'  // 8.EE.A.3, A.4
  | 'linear_equations'     // 8.EE.C.7
  | 'systems_of_equations' // 8.EE.C.8
  | 'functions'            // 8.F.*
  | 'pythagorean_theorem'  // 8.G.B.7, B.8
  | 'transformations'      // 8.G.A.3
  | 'slope'                // 8.EE.B.5, B.6
```

### Recommended New Problem Structures

#### 1. Expression Problem (for order of operations, variable evaluation)
```
Needs: expression string, optional variable bindings, numeric answer
Example: "Evaluate: 3 + 4 × (2 - 1)" => 7
Example: "Evaluate 2x + 3 when x = 5" => 13
```

#### 2. Fraction Problem (extend existing)
```
Needs: operands as {numerator, denominator} pairs, answer as {numerator, denominator}
Example: 3/4 + 1/3 = 13/12
```

#### 3. Multi-Operand Formula Problem (for volume, surface area)
```
Needs: variable-length operand list, formula identifier, numeric answer
Example: V = l × w × h with l=4, w=3, h=5 => 60
```

#### 4. Equation-Solving Problem
```
Needs: equation representation (coefficients p, q, r for px + q = r), numeric answer (value of x)
Example: 3x + 5 = 20 => x = 5
```

#### 5. Comparison/Ordering Problem
```
Needs: list of values, answer as ordered sequence or comparison operator
Example: Order [-3, 1.5, -0.5, 2] => [-3, -0.5, 1.5, 2]
```

#### 6. Coordinate Problem
```
Needs: point(s) as {x, y} pairs, operation (distance, slope, transform), answer as number or point
Example: Distance from (1,2) to (4,6) => 5
```

#### 7. Data Set Problem (for statistics)
```
Needs: list of numbers, operation (mean, median, mode, range), numeric answer
Example: Mean of [3, 5, 7, 2, 8] => 5
```

#### 8. Systems Problem
```
Needs: two equations (as coefficient sets), answer as {x, y} pair
Example: y = 2x + 1, y = -x + 7 => (2, 5)
```

### Priority Ranking for Implementation

Based on which standards are most core and which overlap most with existing engine:

**Phase 1 — Extend existing model (easiest, most coverage):**
1. Extend `Grade` type to include 5, 6, 7, 8
2. Add decimal operand support to existing arithmetic operations
3. Add negative number support to existing arithmetic operations
4. Add fraction operand/answer types (numerator/denominator pairs)
5. Add new operation types: exponents, GCF/LCM, percent

**Phase 2 — New problem types with moderate complexity:**
6. Expression evaluation (order of operations, variable substitution)
7. One-step and two-step equation solving
8. Formula application (area, volume, circumference)
9. Comparison/ordering problems
10. Basic probability (favorable/total)

**Phase 3 — New problem types with high complexity:**
11. Multi-step linear equation solving
12. Coordinate geometry (slope, distance, transformations)
13. Scientific notation
14. Statistics (mean, median, mode on data sets)
15. Systems of equations

**Phase 4 — Conceptual/visual (hardest to automate):**
16. Pattern generation and analysis
17. Graph interpretation
18. Geometric reasoning (congruence, similarity, proofs)
19. Data visualization interpretation
20. Compound probability

---

## Sources

- [Common Core State Standards Initiative — Mathematics](https://www.thecorestandards.org/Math/)
- [Grade 5 Standards](https://www.thecorestandards.org/Math/Content/5/)
- [Grade 6 Standards](https://www.thecorestandards.org/Math/Content/6/)
- [Grade 7 Standards](https://www.thecorestandards.org/Math/Content/7/)
- [Grade 8 Standards](https://www.thecorestandards.org/Math/Content/8/)
- [IXL Common Core Grade 5](https://www.ixl.com/standards/common-core/math/grade-5)
- [IXL Common Core Grade 7](https://www.ixl.com/standards/common-core/math/grade-7)
- [IXL Common Core Grade 8](https://www.ixl.com/standards/common-core/math/grade-8)
- [Oregon CCSSM Grade 5](https://www.oregon.gov/ode/educator-resources/standards/mathematics/Documents/ccssm5.pdf)
- [Oregon CCSSM Grade 7](https://www.oregon.gov/ode/educator-resources/standards/mathematics/Documents/ccssm7.pdf)
- [Oregon CCSSM Grade 8](https://www.oregon.gov/ode/educator-resources/standards/mathematics/Documents/ccssm8.pdf)
- [Math is Fun — Common Core Standards](https://www.mathsisfun.com/links/core-grade-5.html)
- [Education.com — Common Core Overview](https://www.education.com/common-core/seventh-grade/math/)
