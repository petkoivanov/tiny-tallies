# Bug Library Patterns — v0.9 Expansion

All misconception patterns for new domains. Existing addition/subtraction bugs remain unchanged.

## Multiplication Bugs

| Bug ID | Pattern | Example | Distractor Formula |
|--------|---------|---------|-------------------|
| `mul_add_instead` | Adds instead of multiplying | 3×4=7 | `a+b` |
| `mul_off_by_one_group` | One group too many/few | 3×4=8 or 16 | `a×b ± b` |
| `mul_adjacent_fact` | Wrong table entry (±1 of one factor) | 7×8=49 | `a×(b±1)` |
| `mul_zero_any` | N×0=N instead of 0 | 5×0=5 | `a` when b=0 |
| `mul_one_add` | N×1=N+1 | 5×1=6 | `a+1` when b=1 |
| `mul_partial_product_error` | Multiplies ones only, ignores tens | 23×4=12 | `ones(a)×b` |
| `mul_place_value_shift` | Forgets to add partial products | 23×4=812 | concat(2×4, 3×4) |
| `mul_commutative_confuse` | Gets factors backward in word problem | "3 groups of 4" → 3 | Uses wrong factor as answer |

## Division Bugs

| Bug ID | Pattern | Example | Distractor Formula |
|--------|---------|---------|-------------------|
| `div_subtract_instead` | Subtracts instead of dividing | 24÷6=18 | `a-b` |
| `div_remainder_ignore` | Drops remainder | 25÷4=6 | `floor(a/b)` (correct but without R1) |
| `div_remainder_add` | Adds remainder to quotient | 25÷4=7 | `floor(a/b) + remainder` |
| `div_off_by_one` | Quotient off by 1 | 24÷6=3 or 5 | `a/b ± 1` |
| `div_reverse_operands` | Divides wrong way | 6÷24 instead of 24÷6 | `b/a` (if integer) |
| `div_multiply_instead` | Multiplies instead | 24÷6=144 | `a×b` |

## Fraction Bugs

| Bug ID | Pattern | Example | Distractor Formula |
|--------|---------|---------|-------------------|
| `frac_larger_denom_larger` | Bigger denominator = bigger fraction | 1/4 > 1/3 | Compare denominators only |
| `frac_add_across` | Adds num+num, den+den | 1/2+1/3=2/5 | `(n1+n2)/(d1+d2)` |
| `frac_whole_number_compare` | Compares numerators only | 3/8 > 2/4 | Compare numerators only |
| `frac_equal_parts_ignore` | Accepts unequal partitions | Counts pieces regardless | N/total_pieces |
| `frac_mixed_number_error` | Converts mixed→improper wrong | 2 1/3 = 2/3 | Ignores whole number part |
| `frac_multiply_both` | Multiplies both num and den by whole | 3×(2/5)=6/15 | `(n×w)/(d×w)` |
| `frac_subtract_flip` | Subtracts larger from smaller num | 5/8 - 3/8 = 2/8 ✓, but 3/8 - 5/8 = 2/8 | `|n1-n2|/d` |

## Place Value Bugs

| Bug ID | Pattern | Example | Distractor Formula |
|--------|---------|---------|-------------------|
| `pv_digit_value` | Face value not place value | "3 in 345" = 3, not 300 | Digit face value |
| `pv_reverse_write` | Reverses number from spoken | "forty-three" → 34 | Reverse digit order |
| `pv_zero_placeholder` | Omits zero placeholder | "three hundred five" → 35 | Drop zero |
| `pv_rounding_direction` | Always rounds up (or down) | 342→350 (should be 340) | Round wrong direction |
| `pv_comparison_length` | More digits = always larger | 99 < 100 ✓, but thinks 999 > 1000 | Compare digit count only |
| `pv_expanded_addition` | Adds digits instead of expanding | 345 = 3+4+5=12 | Sum of digits |

## Time Bugs

| Bug ID | Pattern | Example | Distractor Formula |
|--------|---------|---------|-------------------|
| `time_hand_swap` | Confuses hour/minute hands | 3:40 → "8:15" | Swap and scale hand readings |
| `time_hour_round_up` | Reads next hour when hand between | 4:30 → "5:30" | `hour+1` |
| `time_minute_as_number` | Reads minute hand position as face value | 2:15 → "2:03" | `minutes/5` |
| `time_elapsed_no_hour_cross` | Doesn't carry across hour boundary | 2:45+40min → "2:85" | Naive add without carry |
| `time_counterclockwise` | Reads minutes counterclockwise | 10:10 → "10:50" | `60-minutes` |
| `time_am_pm_confusion` | Wrong period for activity | Dinner at 6 a.m. | Flip a.m./p.m. |
| `time_wrong_start_position` | Starts counting from 1 not 12 | Off by 5 minutes | `minutes±5` |
| `time_near_hour_confusion` | Near-hour rounds to next | 7:55 → "8:55" | `hour+1` |

## Money Bugs

| Bug ID | Pattern | Example | Distractor Formula |
|--------|---------|---------|-------------------|
| `money_size_value_confusion` | Bigger coin = more value | Nickel > dime | Physically larger coin |
| `money_count_coins_not_value` | Counts coins not cents | 2 dimes + 1 nickel = "3" | Number of coins |
| `money_skip_count_switch` | Fails to switch skip-count pattern | All coins at highest denomination | `count × highest_value` |
| `money_quarter_addition` | 25+25=45 or quarter=20¢ | Quarters counted as 20 | `count × 20` |
| `money_decimal_notation` | $3.4 instead of $3.40 | Missing trailing zero | Drop trailing zero |
| `money_change_direction` | Subtracts wrong way | 75-100 instead of 100-75 | `|price-payment|` reversed |
| `money_cent_dollar_boundary` | 100¢ ≠ $1.00 in child's mind | Can't convert | N/A (detection only) |
| `money_penny_nickel_swap` | Penny=5¢, nickel=1¢ | Values swapped | Swap penny/nickel values |

## Pattern Bugs

| Bug ID | Pattern | Example | Distractor Formula |
|--------|---------|---------|-------------------|
| `pattern_linear_only` | Assumes +constant always | 2,4,8,16,? → 20 | Last + common_diff |
| `missing_add_instead` | Adds both sides of equation | □+3=7 → 10 | `operand+result` |
| `missing_reverse_operation` | Uses wrong inverse | □×4=24 → 20 | `result-factor` |
| `io_table_constant` | Ignores input, uses constant output | in=5,rule=×3 → 3 | Just the multiplier |
| `order_left_to_right` | Evaluates left-to-right ignoring precedence | 2+3×4=20 | `(2+3)×4` |

---

## Integration Notes

- All bugs implement the existing `BugPattern` interface from `bugLibrary/`
- Each bug has a `compute(operands, correctAnswer)` function returning the distractor value
- Distractors must be positive integers (or valid time/money strings) and ≠ correct answer
- The 2-then-3 confirmation rule applies to all new bugs identically
- Bug-to-manipulative mapping extends the existing `MISCONCEPTION_MANIPULATIVE_MAP`
