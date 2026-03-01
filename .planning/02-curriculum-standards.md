# Curriculum Standards Research

**Research Date:** 2026-02-28
**Focus:** Math curricula for grades 1-3 (ages 6-9)

## Supported Curricula

### 1. US Common Core State Standards (CCSS)

**Source:** Common Standards Project (free JSON API), corestandards.org

#### Grade 1 (Age 6-7)
- **Operations & Algebraic Thinking (1.OA):** Addition/subtraction within 20, word problems, properties of operations
- **Number & Operations in Base Ten (1.NBT):** Counting to 120, place value (tens/ones), two-digit addition/subtraction
- **Measurement & Data (1.MD):** Measure lengths, tell time (hour/half-hour), organize data
- **Geometry (1.G):** Shapes (2D/3D), halves/quarters

#### Grade 2 (Age 7-8)
- **Operations & Algebraic Thinking (2.OA):** Addition/subtraction within 100, introduction to multiplication (equal groups)
- **Number & Operations in Base Ten (2.NBT):** Place value to 1000, skip counting, three-digit add/subtract
- **Measurement & Data (2.MD):** Measure in standard units, money, time to nearest 5 minutes, bar graphs
- **Geometry (2.G):** Identify shapes, partition rectangles into rows/columns, halves/thirds/fourths

#### Grade 3 (Age 8-9)
- **Operations & Algebraic Thinking (3.OA):** Multiplication/division within 100, patterns, two-step word problems
- **Number & Operations in Base Ten (3.NBT):** Round to nearest 10/100, fluent add/subtract within 1000, multiply one-digit by multiples of 10
- **Number & Operations — Fractions (3.NF):** Understand fractions as parts of a whole, number line, equivalent fractions, compare fractions
- **Measurement & Data (3.MD):** Time to nearest minute, liquid volume/mass, area, perimeter
- **Geometry (3.G):** Categorize shapes by attributes, partition shapes into equal parts

### 2. New York State Standards (NYSLS)

Closely follows Common Core with minor additions:
- Emphasis on mathematical practices (problem-solving, reasoning)
- Additional focus on estimation strategies
- Stronger emphasis on real-world applications
- Uses "Next Generation Mathematics Learning Standards" (2017 revision)

### 3. Russian Mathematical Tradition

**Source:** Research papers, Russian School of Math (RSM) curriculum outlines

**Key Differences from US:**
- **Earlier abstraction:** Variables and unknowns introduced in Grade 1 (vs Grade 3-4 in US)
- **Stronger mental math:** Emphasis on computing without writing, number decomposition
- **Logical reasoning:** Pattern recognition, logic puzzles, sequences from age 6
- **Word problems:** More complex multi-step problems at earlier ages
- **Geometry emphasis:** Spatial reasoning, symmetry, transformations earlier

**Grade-level mapping (approximate):**
| Grade | Russian Focus | US Equivalent |
|-------|--------------|---------------|
| 1 | Add/sub to 20, unknowns (□ + 3 = 7), patterns | Grade 1-2 US |
| 2 | Add/sub to 100, multiplication intro, measurement | Grade 2-3 US |
| 3 | Multiplication tables, division, fractions intro, multi-step problems | Grade 3-4 US |

### 4. Singapore Math

**Source:** MOE Singapore syllabus, research papers

**Key Approach:** Concrete → Pictorial → Abstract (CPA)
- **Bar models:** Visual representation of word problems (signature technique)
- **Number bonds:** Part-whole relationships (3 and 4 make 7)
- **Mental math strategies:** Make-10, doubles, near-doubles
- **Mastery-based:** Deep understanding before moving on

### 5. European Standards (UK National Curriculum)

**Source:** UK DfE National Curriculum framework

**Key Stage 1 (Years 1-2, Ages 5-7):**
- Number bonds to 20, place value to 100
- Addition/subtraction facts, multiplication/division introduction
- Fractions: halves and quarters
- Money, time, measurement

**Key Stage 2 (Year 3, Age 7-8):**
- Place value to 1000, add/subtract 3-digit numbers
- Multiplication tables (2, 3, 4, 5, 8, 10)
- Fractions: unit fractions, non-unit fractions, ordering
- Time to nearest minute, perimeter, angles

## Topic Taxonomy (Cross-Curriculum)

The app should use a **unified topic system** that maps across curricula:

```
COUNTING_AND_CARDINALITY
├── count_forward (1-120)
├── count_backward
├── skip_counting (2s, 5s, 10s)
└── number_recognition

NUMBER_SENSE
├── place_value_ones_tens
├── place_value_hundreds
├── comparing_numbers
├── ordering_numbers
├── rounding
└── estimation

ADDITION
├── add_within_10
├── add_within_20 (with/without regrouping)
├── add_within_100
├── add_within_1000
├── mental_addition_strategies
├── number_bonds
└── word_problems_addition

SUBTRACTION
├── subtract_within_10
├── subtract_within_20
├── subtract_within_100
├── subtract_within_1000
├── mental_subtraction_strategies
└── word_problems_subtraction

MULTIPLICATION
├── equal_groups
├── arrays
├── repeated_addition
├── times_tables (2-10)
├── multiply_by_10_100
└── word_problems_multiplication

DIVISION
├── sharing_equally
├── grouping
├── division_facts
├── relationship_to_multiplication
└── word_problems_division

FRACTIONS
├── equal_parts
├── halves_quarters
├── unit_fractions
├── fractions_on_number_line
├── equivalent_fractions
└── comparing_fractions

MEASUREMENT
├── length
├── weight_mass
├── capacity_volume
├── time_hours_minutes
├── money
└── temperature

GEOMETRY
├── 2d_shapes
├── 3d_shapes
├── symmetry
├── spatial_reasoning
├── perimeter
└── area

DATA_AND_STATISTICS
├── picture_graphs
├── bar_graphs
├── tally_charts
└── reading_data

PATTERNS_AND_ALGEBRA (Russian Math emphasis)
├── number_patterns
├── shape_patterns
├── missing_number (□ + 3 = 7)
├── simple_equations
└── logic_puzzles
```

## Skill Prerequisites Graph

Critical for the spaced repetition and "what to teach next" systems:

```
count_forward → add_within_10 → add_within_20 → add_within_100
count_backward → subtract_within_10 → subtract_within_20 → subtract_within_100
place_value_ones_tens → add_within_100 + subtract_within_100
equal_groups → multiplication → times_tables
sharing_equally → division → relationship_to_multiplication
add_within_20 + equal_parts → fractions
```

## Implementation Notes

- **Curriculum selection:** User picks during onboarding (default: Common Core)
- **Cross-curriculum mapping:** All problems tagged with universal topic IDs + curriculum-specific standard IDs
- **Difficulty within topics:** Each topic has 5 difficulty levels (intro → fluency)
- **API source:** Common Standards Project provides free JSON API for US standards
- **Russian Math:** No public API; hand-curated content based on RSM and textbook analysis
