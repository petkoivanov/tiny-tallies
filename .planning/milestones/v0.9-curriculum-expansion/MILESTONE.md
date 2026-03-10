# v0.9 — Full Curriculum Expansion

**Goal**: Expand from 14 addition/subtraction skills to full curriculum coverage across 16 math domains for grades 1-8, add parent reports with AI summaries, and improve answer input UX.

**Depends on**: v0.8 (Phases 38-40 complete; Phases 41-44 deferred)

**Status**: NEARLY COMPLETE — 132 skills across 16 operations, 2139 tests passing, grades 1-8. Phases 45-53, 55-58 complete. Phase 54 (Word Problem System) remaining.

## Scope

### In Scope (this milestone)
- **Multiplication** — equal groups, arrays, times tables (2-12), multi-digit (Grade 4)
- **Division** — sharing, grouping, division facts, relationship to multiplication, long division intro
- **Fractions** — equal parts, halves/quarters, unit fractions, number line, equivalence, comparison, addition (like denominators), mixed numbers
- **Place Value** — ones/tens, hundreds, thousands, comparing, ordering, rounding, expanded form
- **Time** — hours, half-hours, quarter-hours, 5-minute, 1-minute, a.m./p.m., elapsed time
- **Money** — coin identification, same-coin counting, mixed-coin counting, making change, multi-step
- **Patterns & Algebra** — number patterns, skip counting, missing number (□ + 3 = 7), input/output tables
- **Grade 4 Addition/Subtraction** — four-digit, multi-step word problems
- **Word problems** — template-based generation with name pools, context variables, increasing frequency with Elo
- **NumberPad component** — custom in-app number pad with decimal key for typed answers
- **Probabilistic answer format** — MC at low Elo, increasing free-text probability with Elo
- **Dynamic MC options** — 4 options at low Elo → 5 → 6 as Elo increases
- **Child-facing level indicator** — show difficulty level on each problem
- **Parent reports** — AI-generated summaries, time-series charts, expandable data points, accessed from ParentalControls
- **New components** — AnalogClock (SVG), CoinDisplay (SVG)

### Deferred (next milestone)
- ~~Geometry (2D/3D shapes, symmetry, spatial reasoning, perimeter, area)~~ — IMPLEMENTED: 6 skills (Grade 7-8)
- ~~Measurement (length, weight/mass, capacity/volume, temperature)~~ — IMPLEMENTED: 5 skills (Grade 4-5)
- Data & Statistics (picture graphs, bar graphs, tally charts)
- Interactive clock manipulative (draggable hands) — static read-only clock first
- Coin drag-and-drop manipulative — display only first
- Session History & Analytics Engine (Phase 41 from v0.8)
- Parental Time Controls (Phase 43 from v0.8)
- Freemium Subscription & IAP (Phase 44 from v0.8)

### Additional Domains (beyond original scope)
Implemented domains not originally planned for v0.9:
- **Measurement**: 5 skills (Grade 4-5)
- **Ratios**: 9 skills (Grade 6-7)
- **Exponents**: 6 skills (Grade 5-8)
- **Expressions**: 7 skills (Grade 5-6)
- **Decimals**: skills exist
- **Integers**: skills exist
- **Geometry**: 6 skills (Grade 7-8)
- **Probability**: 2 skills (Grade 7)
- **Number Theory**: 3 skills (Grade 6)

## Phases

### Phase 45: Type System & Engine Expansion
**Goal**: Expand the math engine types to support all 16 domains and Grade 1-8
**Files**: `types.ts`, `skills.ts`, `standards.ts`, template index, store types
**Status**: COMPLETE (2026-03-10) — Operation type has all 16 values, Answer discriminated union done, DomainHandler interface done, answer format selection wired in with Elo-based MC/free-text probability, dynamic MC option count 4/5/6.

Changes (all complete):
1. ○ `Operation` → `MathDomain` rename — deferred, low priority (currently still `Operation` but has all 16 values)
2. ✓ `Grade = 1 | 2 | 3 | 4` → expanded to `1 | 2 | 3 | 4 | 5 | 6 | 7 | 8`
3. ✓ `Problem.correctAnswer` changed from `number` to `Answer` discriminated union (`NumericAnswer | FractionAnswer | ComparisonAnswer | CoordinateAnswer | ExpressionAnswer`)
4. ✓ `DomainHandler` interface + `DomainProblemData` type added
5. ✓ `ProblemTemplate.domainConfig` for domain-specific constraints
6. ✓ `ProblemMetadata` extended with `displayTime`, `coinSet`, `fractionDisplay`, `answerDisplay`
7. ✓ Answer format selection logic (MC vs free-text based on Elo) — sigmoid probability wired into session orchestrator
8. ✓ Dynamic option count logic (4/5/6 based on Elo thresholds)

### Phase 46: Multiplication Domain
**Status**: COMPLETE (2026-03-10) — 11 skills, 8 bug patterns, domain handler.
**Goal**: Full multiplication curriculum grades 2-4
Skills (11):
- `multiplication.equal-groups` (G2) — understand multiplication as equal groups
- `multiplication.arrays` (G2) — rows × columns
- `multiplication.repeated-addition` (G2) — bridge from addition
- `multiplication.facts-2-5-10` (G3) — times tables 2, 5, 10
- `multiplication.facts-3-4-6` (G3) — times tables 3, 4, 6
- `multiplication.facts-7-8-9` (G3) — times tables 7, 8, 9
- `multiplication.by-10-100` (G3) — multiply by multiples of 10
- `multiplication.two-by-one` (G4) — 2-digit × 1-digit
- `multiplication.two-by-two` (G4) — 2-digit × 2-digit
- `multiplication.four-by-one` (G4) — up to 4-digit × 1-digit

Bug patterns: `mul_add_instead`, `mul_off_by_one_group`, `mul_adjacent_fact`, `mul_zero_any`, `mul_one_add`, `mul_partial_product_error`, `mul_place_value_shift`

Manipulative mapping: Counters (arrays/equal groups), BarModel (word problems)

### Phase 47: Division Domain
**Status**: COMPLETE (2026-03-10) — 9 skills, 6 bug patterns, domain handler.
**Goal**: Full division curriculum grades 3-4
Skills (9):
- `division.sharing-equally` (G3) — fair sharing concept
- `division.grouping` (G3) — how many groups
- `division.facts-within-100` (G3) — division facts (inverse of times tables)
- `division.relationship-multiplication` (G3) — if 6×4=24 then 24÷6=4
- `division.with-remainders` (G4) — interpret remainders
- `division.two-by-one` (G4) — 2-digit ÷ 1-digit
- `division.three-by-one` (G4) — 3-digit ÷ 1-digit
- `division.multi-step` (G4) — multi-step word problems

Bug patterns: `div_subtract_instead`, `div_remainder_ignore`, `div_remainder_as_decimal`, `div_off_by_one`, `div_zero_dividend`, `div_reverse_operands`

Manipulative mapping: Counters (sharing/grouping), BarModel (word problems)

### Phase 48: Fractions Domain
**Status**: COMPLETE (2026-03-09) — 14 skills (G1-6), 14 templates, 9 bug patterns. Extended beyond original G1-4 scope to include G5-6 (add/subtract unlike, multiply fractions, divide unit fractions, divide fractions).
**Goal**: Fractions curriculum grades 1-6
Skills (14):
- `fractions.equal-parts` (G1) — understand equal partitioning
- `fractions.halves-quarters` (G1-2) — identify halves, quarters, thirds
- `fractions.unit-fractions` (G3) — 1/2, 1/3, 1/4, 1/6, 1/8
- `fractions.on-number-line` (G3) — place fractions on number line
- `fractions.equivalent` (G3) — recognize equivalent fractions
- `fractions.compare-same-denom` (G3) — compare fractions with same denominator
- `fractions.compare-same-numer` (G3) — compare fractions with same numerator
- `fractions.add-subtract-like-denom` (G4) — add/subtract fractions same denominator
- `fractions.mixed-numbers` (G4) — understand and convert mixed numbers
- `fractions.multiply-by-whole` (G4) — multiply fraction by whole number

Bug patterns: `frac_larger_denom_larger`, `frac_add_across`, `frac_whole_number_compare`, `frac_equal_parts_ignore`, `frac_mixed_number_error`, `frac_multiply_both`

Manipulative mapping: FractionStrips, NumberLine, BarModel

### Phase 49: Place Value Domain
**Status**: DOMAIN HANDLER COMPLETE (2026-03-09) — 8 skills, 8 templates, 9 bug patterns (rewritten for domain-specific operands). UI integration (BaseTenBlocks) already exists.
**Goal**: Place value and number sense curriculum grades 1-4
Skills (8):
- `place-value.ones-tens` (G1) — understand tens and ones
- `place-value.hundreds` (G2) — understand hundreds place
- `place-value.to-1000` (G2) — read/write numbers to 1000
- `place-value.comparing` (G2) — compare numbers using >, <, =
- `place-value.skip-counting` (G2) — skip count by 2s, 5s, 10s, 100s
- `place-value.rounding-10-100` (G3) — round to nearest 10 or 100
- `place-value.to-10000` (G4) — place value to ten-thousands
- `place-value.expanded-form` (G4) — write numbers in expanded form

Bug patterns (updated): `pv_place_value_swap`, `pv_adjacent_place`, `pv_reverse_write`, `pv_zero_placeholder`, `pv_rounding_direction`, `pv_comparison_length`, `pv_skip_wrong_step`, `pv_off_by_one`, `pv_expanded_addition`

Manipulative mapping: BaseTenBlocks

### Phase 50: Time Domain + AnalogClock Component
**Status**: COMPLETE (2026-03-10) — 7 skills, 7 templates, 6 bug patterns (rewritten for domain-specific operands). AnalogClock SVG component still pending.
**Goal**: Time-telling curriculum grades 1-3, SVG clock component
Skills (7):
- `time.read.hours` (G1)
- `time.read.half-hours` (G1)
- `time.read.quarter-hours` (G2)
- `time.read.five-minutes` (G2)
- `time.am-pm` (G2)
- `time.read.one-minute` (G3)
- `time.elapsed.same-hour` (G3)
- `time.elapsed.cross-hour` (G3)

New component: `AnalogClock` (SVG via react-native-svg)
- Configurable face variants: full/quarters/minimal/blank
- Hour hand, minute hand with proper angles
- Tick marks and number labels
- Accessible labels

Bug patterns: `time_hand_swap`, `time_hour_round_up`, `time_minute_as_number`, `time_elapsed_no_hour_cross`, `time_counterclockwise`, `time_am_pm_confusion`, `time_wrong_start_position`, `time_near_hour_confusion`

### Phase 51: Money Domain + CoinDisplay Component
**Status**: COMPLETE (2026-03-10) — 7 skills, 7 templates, 7 bug patterns. CoinDisplay SVG component still pending.
**Goal**: Money curriculum grades 1-4, SVG coin display
Skills (7):
- `money.coin-id` (G1) — identify coins by name and value
- `money.count.same-type` (G1) — count same-type coins
- `money.count.mixed` (G2) — count mixed coins
- `money.notation` (G2) — use $ and ¢ symbols
- `money.change.simple` (G2-3) — making change from $1
- `money.change.complex` (G3) — making change from larger amounts
- `money.multi-step` (G3-4) — buy and calculate change
- `money.unit-price` (G4) — cost per item

New component: `CoinDisplay` (SVG coins — penny, nickel, dime, quarter)
- Proportional sizes (realistic relative sizing)
- Recognizable features (color, size)
- All internal math in cents (integers, never floating point)

Bug patterns: `money_size_value_confusion`, `money_count_coins_not_value`, `money_skip_count_switch`, `money_quarter_addition`, `money_decimal_notation`, `money_change_direction`, `money_cent_dollar_boundary`, `money_penny_nickel_swap`

### Phase 52: Patterns & Missing Number Domain
**Status**: COMPLETE (2026-03-10) — 5 skills, 5 templates, 5 bug patterns.
**Goal**: Patterns and early algebra for grades 1-4
Skills (5 implemented):
- `patterns.number-patterns` (G1) — identify and extend number patterns
- `patterns.skip-counting-patterns` (G2) — patterns in skip counting
- `patterns.missing-addend` (G1-2) — □ + 3 = 7
- `patterns.missing-factor` (G3) — □ × 4 = 24
- `patterns.input-output` (G3-4) — function tables (input → rule → output)
- `patterns.order-of-operations` (G4) — parentheses first, then multiply/divide, then add/subtract

Bug patterns: `pattern_linear_only`, `missing_add_instead`, `missing_reverse_operation`, `io_table_constant`, `order_left_to_right`

### Phase 53: Grade 4 Addition & Subtraction
**Status**: COMPLETE (2026-03-10) — 3 skills (4-digit add no-carry, add with-carry, sub with-borrow) + templates exist.
**Goal**: Extend existing add/sub to Grade 4
Skills (3 new):
- `addition.four-digit.no-carry` (G4) — add within 10,000 no carry
- `addition.four-digit.with-carry` (G4) — add within 10,000 with carry
- `subtraction.four-digit.with-borrow` (G4) — subtract within 10,000

Templates: extend existing template pattern with larger operand ranges

### Phase 54: Word Problem System
**Status**: NOT STARTED
**Goal**: Template-based word problem generation across all domains
- Name pool with cultural diversity (gender-neutral, no stereotypes)
- Context variable pools (objects, places, containers, activities)
- Reading level calibration by age bracket
- Word problem frequency increases with Elo (low Elo = bare equations, high Elo = 30-50% word problems)
- Covers: addition, subtraction, multiplication, division, fractions, money, time

### Phase 55: NumberPad + Answer Format System
**Status**: COMPLETE (2026-03-10) — NumberPad component built, answer format selection wired into session orchestrator with sigmoid probability, dynamic MC option count.
**Goal**: Custom number pad component and probabilistic answer format selection
- NumberPad component with digits 0-9, decimal point, backspace, submit
- Large touch targets (56dp minimum for ages 6-7)
- Answer format selection: `P(free_text) = sigmoid((elo - 900) / 150)` — mostly MC below 900, mostly free-text above 1100
- Dynamic MC option count: 4 options (Elo < 950), 5 options (950-1100), 6 options (Elo > 1100)
- Session screen integration — render NumberPad or MC grid based on selected format

### Phase 56: Level Indicator + Elo Transparency
**Status**: COMPLETE (2026-03-10) — eloToLevel mapping, HomeScreen level display, SessionHeader LevelBadge component (prominent "Level N" pill with surface background).
**Goal**: Show difficulty level on problems, parent-visible Elo data
- Child-facing: "Level X" badge on session screen (map Elo ranges to levels 1-10)
- Elo range mapping: Level 1 (600-700) through Level 10 (1300-1400)
- LevelBadge component exported from session barrel, used in SessionHeader

### Phase 57: Parent Reports Screen
**Status**: COMPLETE (2026-03-10) — Full parent dashboard with AI summaries, SVG charts, session history, expandable skill domains.
**Goal**: Comprehensive parent dashboard with AI summaries and charts
- ✓ Session history store slice (sessionHistorySlice, capped at 50, newest-first)
- ✓ Session history recorded on completion in useSession hook
- ✓ Store migration v14→v15 for sessionHistory field
- ✓ MasteryDonutChart (SVG donut: mastered/in-progress/not-started)
- ✓ SessionBarChart (SVG bar chart: last 10 sessions, score percentages)
- ✓ AiSummaryCard (Gemini-generated parent summary, expandable session list)
- ✓ ExpandableSkillDomain (per-domain drill-down with accuracy per skill)
- ✓ SessionHistoryList (20 sessions, mode badges, score, duration, skill names)
- ✓ SkillDomainSummary updated with all 16 domains
- ✓ ParentReportsScreen fully rewired with new components
- ✓ 59 tests across 7 test files (ParentReportsScreen + 6 component tests)
- Note: Used react-native-svg (existing dep) instead of react-native-chart-kit

### Phase 58: Integration Testing & Verification
**Status**: COMPLETE (2026-03-10) — 29 new integration tests, full suite 2139 tests passing across 149 suites.
**Goal**: End-to-end verification of all new domains, prerequisite DAG, session flow
- ✓ Domain handler registry test: all 16 handlers registered, functional, valid answer types (6 tests)
- ✓ Cross-domain session integration: queue generation, multi-domain coverage, phase ordering, commitSessionResults, Elo bounds (9 tests)
- ✓ Answer format integration: MC/free-text across all 16 domains, option distinctness, Elo thresholds, monotonic probability (7 tests)
- ✓ Store migration chain: v13→v14→v15, full v0→v15 chain, data preservation (7 tests)
- ✓ Fixed childDataHelpers test (19 keys with sessionHistory)
- ✓ Fixed appStore test (STORE_VERSION 15)
- ✓ Full suite: 2139 tests, 149 suites, typecheck clean
- Note: Word problem verification skipped (Phase 54 not started)

## Skill Count by Domain and Grade

| Domain | G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | Total | Handler Status |
|--------|----|----|----|----|----|----|----|----|-------|---------------|
| Addition | 3 | 2 | 2 | 2 | - | - | - | - | 9 | ✓ arithmeticHandler |
| Subtraction | 3 | 2 | 2 | 1 | - | - | - | - | 8 | ✓ arithmeticHandler |
| Multiplication | 0 | 3 | 4 | 4 | - | - | - | - | 11 | ✓ arithmeticHandler |
| Division | 0 | 0 | 4 | 5 | - | - | - | - | 9 | ✓ arithmeticHandler |
| Fractions | 1 | 1 | 5 | 3 | 3 | 1 | - | - | **14** | ✓ fractionsHandler |
| Place Value | 1 | 4 | 1 | 2 | - | - | - | - | 8 | ✓ placeValueHandler |
| Time | 2 | 3 | 2 | 0 | - | - | - | - | 7 | ✓ timeHandler |
| Money | 2 | 2 | 1 | 2 | - | - | - | - | 7 | ✓ moneyHandler |
| Patterns | 2 | 1 | 1 | 1 | - | - | - | - | 5 | ✓ patternsHandler |
| Measurement | - | - | - | 3 | 2 | - | - | - | 5 | ✓ measurementHandler |
| Ratios | - | - | - | - | - | 5 | 4 | - | 9 | ✓ ratiosHandler |
| Exponents | - | - | - | - | 2 | 2 | 1 | 1 | 6 | ✓ exponentsHandler |
| Expressions | - | - | - | - | 4 | 3 | - | - | 7 | ✓ expressionsHandler |
| Decimals | - | - | - | - | * | * | - | - | * | ✓ decimalsHandler |
| Integers | - | - | - | - | - | * | * | - | * | ✓ integersHandler |
| Geometry | - | - | - | - | - | - | 3 | 3 | 6 | ✓ geometryHandler |
| Probability | - | - | - | - | - | - | 2 | - | 2 | ✓ probabilityHandler |
| Number Theory | - | - | - | - | - | 3 | - | - | 3 | ✓ numberTheoryHandler |
| **Total** | | | | | | | | | **132** | **16 domains** |

*Note: Decimals and Integers skill counts marked with * — skills exist but exact per-grade breakdown not tallied here. Total across all domains: 132 skills.*

## Prerequisites Graph (Cross-Domain)

```
GRADE 1 ENTRY POINTS (no prerequisites):
  addition.single-digit.no-carry
  subtraction.single-digit.no-borrow
  place-value.ones-tens
  time.read.hours
  money.coin-id
  fractions.equal-parts
  patterns.number-patterns

KEY CROSS-DOMAIN LINKS:
  addition.within-20.with-carry → multiplication.equal-groups
  addition.within-20.with-carry → patterns.missing-addend
  multiplication.facts-2-5-10 → division.sharing-equally
  multiplication.facts-7-8-9 → division.facts-within-100
  multiplication.facts-2-5-10 → patterns.missing-factor
  place-value.ones-tens → addition.two-digit.no-carry
  place-value.hundreds → addition.three-digit.no-carry
  place-value.skip-counting → multiplication.equal-groups
  addition.single-digit.no-carry → money.count.same-type
  addition.within-20.no-carry → money.count.mixed
  subtraction.within-20.with-borrow → money.change.simple
  fractions.equal-parts → fractions.halves-quarters → fractions.unit-fractions
  fractions.unit-fractions → fractions.on-number-line → fractions.equivalent
```

## Store Changes

- STORE_VERSION bumped from 14 to 15
- v14→v15 migration: adds `sessionHistory: []` field
- `sessionHistorySlice`: new Zustand slice with `SessionHistoryEntry` type and `addSessionHistory` action (caps at 50 entries, newest-first)
- `sessionHistory` added to `CHILD_DATA_KEYS` (19 keys total), `ChildData` interface, and `DEFAULT_CHILD_DATA`
- `SkillState` unchanged (Elo, BKT, Leitner all domain-agnostic)

## New Dependencies

None — used existing react-native-svg for charts instead of adding react-native-chart-kit.
