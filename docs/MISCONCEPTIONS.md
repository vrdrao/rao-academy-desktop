# Misconception Taxonomy — Rao Academy Grade 4

Derived mechanically from 4,014 distractors across 104 lesson files.
Each entry has a computable detection rule. If it cannot be computed, it is not here.

---

## How to read an entry

```
CODE            stable machine key (SCREAMING_SNAKE). Never shown to a child.
concept         which topic(s) it appears in
rule            how to DETECT it from (correct, distractor, operands)
message         student-facing template. Describes the option, not the child.
```

---

## 1. Arithmetic — basic computation errors

### OFF_BY_ONE
- **concept:** all arithmetic
- **rule:** `|distractor − correct| == 1`
- **message:** "This answer is off by 1 — check your last step."

### OFF_BY_TWO
- **concept:** all arithmetic
- **rule:** `|distractor − correct| == 2`
- **message:** "This answer is off by 2 — recount carefully."

### CARRY_DROPPED
- **concept:** multi-digit addition, subtraction
- **rule:** `distractor == correct − 10^k` for some k ∈ {1,2,3,4} AND question is addition/subtraction
- **message:** "A carry was missed — check where digits add past 9."

### CARRY_EXTRA
- **concept:** multi-digit addition, subtraction
- **rule:** `distractor == correct + 10^k` for some k ∈ {1,2,3,4} AND question is addition/subtraction
- **message:** "An extra carry crept in — recheck each column."

### WRONG_OP_ADD_FOR_SUB
- **concept:** addition, subtraction
- **rule:** `correct == a − b` AND `distractor == a + b` (or vice versa), where a, b are prompt operands
- **message:** "This adds instead of subtracting (or vice versa)."

### WRONG_OP_ADD_FOR_MULT
- **concept:** multiplication, word problems
- **rule:** `correct == a × b` AND `distractor == a + b`
- **message:** "This adds the numbers instead of multiplying."

### WRONG_OP_SUB_FOR_MULT
- **concept:** multiplication, word problems
- **rule:** `correct == a × b` AND `distractor == a − b` (or `|a − b|`)
- **message:** "This subtracts the numbers instead of multiplying."

### WRONG_OP_MULT_FOR_ADD
- **concept:** addition
- **rule:** `correct == a + b` AND `distractor == a × b`
- **message:** "This multiplies instead of adding."

### CONCATENATED_DIGITS
- **concept:** arithmetic
- **rule:** `distractor == parseInt(String(a) + String(b))` where a, b are operands
- **message:** "The digits were placed side by side instead of being computed."

---

## 2. Place value errors

### PLACE_SHIFT_UP
- **concept:** place value, multiplication patterns
- **rule:** `distractor == correct × 10^k` for some k ∈ {1,2,3}
- **message:** "This is 10/100/1,000 times too large — check the place value."

### PLACE_SHIFT_DOWN
- **concept:** place value, multiplication patterns
- **rule:** `distractor == correct / 10^k` for some k ∈ {1,2,3} AND result is integer
- **message:** "This is 10/100/1,000 times too small — check the place value."

### WRONG_PLACE_IDENTIFIED
- **concept:** place value
- **rule:** prompt asks "value of digit D in number N"; `distractor == D × 10^j` where `j ≠ correct power`
- **message:** "That is the value of this digit in a different place."

---

## 3. Estimation and rounding

### ROUND_BOTH_DOWN
- **concept:** estimation, rounding
- **rule:** `correct == round(a, P) + round(b, P)` AND `distractor == floor(a, P) + floor(b, P)` AND distractor ≠ correct
- **message:** "Both numbers were rounded down — check the rounding digit."

### ROUND_BOTH_UP
- **concept:** estimation, rounding
- **rule:** `correct == round(a, P) + round(b, P)` AND `distractor == ceil(a, P) + ceil(b, P)` AND distractor ≠ correct
- **message:** "Both numbers were rounded up — check the rounding digit."

### ROUND_ONE_WRONG
- **concept:** estimation, rounding
- **rule:** `distractor == wrongRound(a, P) + round(b, P)` OR `round(a, P) + wrongRound(b, P)` where wrongRound is floor when should be ceil (or vice versa)
- **message:** "One of the two numbers was rounded the wrong way."

### EXACT_NOT_ROUNDED
- **concept:** estimation
- **rule:** `distractor == a + b` (exact sum) where correct is the rounded sum, AND `distractor ≠ correct`
- **message:** "This is the exact answer, not the estimate — round first, then compute."

### WRONG_ROUND_PLACE
- **concept:** estimation
- **rule:** `distractor == round(a, Q) + round(b, Q)` where `Q ≠ P` (rounded to wrong place value)
- **message:** "The numbers were rounded to the wrong place value."

### ROUND_WRONG_DIRECTION_SINGLE
- **concept:** rounding
- **rule:** prompt asks to round number N to place P; `distractor == floor(N,P)` when `correct == ceil(N,P)` or vice versa
- **message:** "This rounds the wrong way — check the digit to the right."

---

## 4. Geometry — area and perimeter

### AREA_FOR_PERIMETER
- **concept:** area, perimeter
- **rule:** prompt asks perimeter; `distractor == l × w` (area) where `correct == 2(l+w)`
- **message:** "This is the area (length × width), not the perimeter."

### PERIMETER_FOR_AREA
- **concept:** area, perimeter
- **rule:** prompt asks area; `distractor == 2(l+w)` (perimeter) where `correct == l × w`
- **message:** "This is the perimeter (2 × (l+w)), not the area."

### FORGOT_DOUBLE_PERIMETER
- **concept:** perimeter
- **rule:** prompt asks perimeter; `distractor == l + w` (half perimeter) where `correct == 2(l+w)`
- **message:** "This adds the two sides but forgets to double them."

### HALF_PERIMETER_FOR_AREA
- **concept:** area
- **rule:** prompt asks area; `distractor == l + w` where `correct == l × w`
- **message:** "This adds the sides instead of multiplying them."

### SIDE_SQUARED_FOR_RECT
- **concept:** area, perimeter of squares
- **rule:** prompt about square with side s; distractor uses wrong formula (e.g., area=4s instead of s², or perimeter=s² instead of 4s)
- **message:** "This uses the wrong formula for a square."

---

## 5. Multiplication

### ADJACENT_TABLE_FACT
- **concept:** multiplication facts, tables
- **rule:** `distractor == (a±1) × b` OR `a × (b±1)` where `correct == a × b`
- **message:** "This is one row off in the times table."

### PARTIAL_PRODUCT_PLACE_ERROR
- **concept:** multi-digit multiplication
- **rule:** distractor differs from correct by a power of 10 in one partial product
- **message:** "A partial product landed in the wrong column."

---

## 6. Division

### DIVISOR_AS_ANSWER
- **concept:** division
- **rule:** `distractor == divisor` where correct is the quotient
- **message:** "This is the divisor (the number you divide by), not the answer."

### REMAINDER_AS_ANSWER
- **concept:** division
- **rule:** `distractor == dividend mod divisor`
- **message:** "This is the remainder, not the quotient."

### QUOTIENT_OFF_BY_ONE
- **concept:** division word problems
- **rule:** `distractor == correct ± 1` AND question involves division with remainder context (round up/down)
- **message:** "This is off by one — check whether you need to round the quotient up or down."

---

## 7. Fractions

### FRACTION_ADJACENT
- **concept:** fractions
- **rule:** distractor fraction differs from correct by ±1 in numerator or denominator (e.g., 1/3 vs 1/4, 2/3 vs 1/3)
- **message:** "This fraction has the wrong number of parts shaded or the wrong total."

### FRACTION_WHOLE_FOR_PART
- **concept:** fractions
- **rule:** `distractor == n/n` (whole) where correct is a proper fraction
- **message:** "This fraction means all parts, not just the shaded ones."

---

## 8. Time

### AM_PM_SWAP
- **concept:** time, AM/PM
- **rule:** distractor is the opposite of AM/PM (answer is "A.M.", distractor is "P.M." or vice versa)
- **message:** "A.M. is before noon, P.M. is after noon — check the clue in the question."

### WRONG_24H_NO_ADD_12
- **concept:** 12h/24h time conversion
- **rule:** answer is PM time + 12; distractor omits adding 12 (e.g., 9:00 PM → distractor "09:00" instead of "21:00")
- **message:** "For P.M. times after noon, add 12 to the hour."

### WRONG_24H_WRONG_OFFSET
- **concept:** 12h/24h time conversion
- **rule:** distractor adds wrong offset (e.g., +2, +10 instead of +12)
- **message:** "The conversion between 12-hour and 24-hour time is off."

### ELAPSED_MINUTES_ERROR
- **concept:** elapsed time
- **rule:** distractor has correct hours but wrong minutes (or vice versa)
- **message:** "The hours or minutes in the elapsed time are not quite right."

---

## 9. Comparison and ordering

### COMPARISON_REVERSED
- **concept:** comparing numbers, money
- **rule:** answer is "is less than" and distractor is "is greater than" (or vice versa)
- **message:** "The comparison is the wrong way around."

### COMPARISON_EQUAL_WRONG
- **concept:** comparing numbers
- **rule:** answer is a comparison and distractor is "is equal to" (but numbers differ)
- **message:** "These values are not equal."

---

## 10. Parity and properties

### ODD_EVEN_CONFUSED
- **concept:** even/odd numbers
- **rule:** answer is even, distractor is odd (or vice versa) — check digit parity
- **message:** "Even numbers end in 0, 2, 4, 6, or 8. Odd numbers end in 1, 3, 5, 7, or 9."

### PROPERTY_CONFUSED
- **concept:** properties of addition/multiplication
- **rule:** answer and distractor are both property names from {Commutative, Associative, Identity, Distributive}
- **message:** "That is a different property — re-read what the equation shows."

---

## 11. Shape identification

### SHAPE_CONFUSED
- **concept:** 3D shapes, geometry
- **rule:** answer and distractor are both shape names (cube, sphere, cone, cylinder, prism, pyramid)
- **message:** "Look again at the faces, edges, and vertices to identify the shape."

---

## 12. Probability

### PROBABILITY_WRONG_LEVEL
- **concept:** probability
- **rule:** answer and distractor are both from {certain, probable, unlikely, impossible}
- **message:** "Count how many match — that tells you how likely it is."

---

## 13. Patterns and sequences

### PATTERN_WRONG_RULE
- **concept:** number patterns, geometric sequences
- **rule:** distractor applies a different (plausible) rule to the sequence
- **message:** "Check the pattern rule — look at how each number changes."

---

## 14. Money

### DECIMAL_PLACE_ERROR
- **concept:** money arithmetic
- **rule:** distractor differs from correct by a factor of 10 or 100 (paise/rupee confusion)
- **message:** "Check the decimal point — rupees and paise must line up."

### MONEY_WRONG_OPERATION
- **concept:** money word problems
- **rule:** `correct == a + b` AND `distractor == a − b` (or vice versa) with money values
- **message:** "Check whether the problem asks to add or subtract."

---

## 15. Multi-step word problems

### PARTIAL_COMPUTATION
- **concept:** multi-step problems
- **rule:** distractor equals an intermediate result (e.g., only the first step)
- **message:** "This is only part of the answer — the problem needs another step."

### ALL_NUMBERS_COMBINED
- **concept:** word problems with extra information
- **rule:** distractor uses all numbers in the problem, including irrelevant ones
- **message:** "Not all numbers in the problem are needed — re-read what is being asked."

---

## 16. Visual and non-computable

### VISUAL_ONLY
- **concept:** shape selection, area by counting, equal parts, symmetry
- **rule:** distractor has empty `data-val` or no text value (image/SVG-based option)
- **message:** *(not applicable — requires per-question visual authoring)*

---

## 17. Catch-all

### DOUBLE_OR_HALF
- **concept:** all arithmetic
- **rule:** `distractor == correct × 2` OR `distractor == correct / 2`
- **message:** "This is double (or half) of the correct answer."

### OPERAND_ECHO
- **concept:** all arithmetic
- **rule:** `distractor ∈ {prompt operands}` (child selected one of the given numbers instead of computing)
- **message:** "This is one of the numbers from the question, not the answer."

### SUM_EVAL_ERROR
- **concept:** multi-select "select all sums equal to X"
- **rule:** distractor expression `a + b` evaluates to a value ≠ target
- **message:** "This sum does not equal the target — compute it to check."

---

## 18. Additional codes discovered during mechanical derivation

### BORROW_ERROR
- **concept:** multi-digit subtraction
- **rule:** `distractor == correct + 10^k` where question is subtraction (forgot to decrease next column)
- **message:** "A borrow was missed — recheck the subtraction."

### DATA_READING_ERROR
- **concept:** bar graphs, tables, line plots
- **rule:** question reads from a chart/table; distractor is a value from a different row/column/bar
- **message:** "Re-read the chart — check you are looking at the right bar or row."

### DIGIT_CONFUSION
- **concept:** number names, place value
- **rule:** distractor has same digits as correct but in wrong positions (e.g., 861 vs 681)
- **message:** "The digits are right but in the wrong places."

### DIVISIBILITY_CONFUSED
- **concept:** divisibility rules
- **rule:** answer is divisible by N; distractor is not (or vice versa)
- **message:** "Test the divisibility rule for this number."

### ESTIMATE_WRONG_VALUE
- **concept:** estimation (catch-all for estimation questions not matching specific rounding patterns)
- **rule:** question is an estimation question; distractor is a plausible wrong estimate
- **message:** "Round each number first, then compute."

### FORMULA_ERROR
- **concept:** geometry (perimeter missing side, area from dimensions)
- **rule:** distractor uses wrong formula manipulation on geometric dimensions
- **message:** "Check which formula applies to this shape."

### MULTI_STEP_ERROR
- **concept:** multi-step word problems
- **rule:** distractor results from applying wrong operation sequence on 3+ operands
- **message:** "Re-read the problem — check each step in order."

### NEAR_MISS
- **concept:** all numeric
- **rule:** `3 ≤ |d − c| ≤ 10` or within 15% of correct, no specific rule matched
- **message:** "This is close but not quite — recheck the last step."

### ORDINAL_SUFFIX_ERROR
- **concept:** ordinal numbers
- **rule:** distractor has correct number but wrong suffix (e.g., "21th" instead of "21st")
- **message:** "Check the ending — is it -st, -nd, -rd, or -th?"

### SHAPE_PROPERTY_CONFUSED
- **concept:** 3D shapes (faces, edges, vertices)
- **rule:** distractor is a count belonging to a different shape or different property
- **message:** "This count belongs to a different shape or a different property."

### TABLE_LOOKUP_ERROR
- **concept:** price lists, unit prices
- **rule:** question requires looking up a value from a table; distractor uses wrong table entry
- **message:** "Check you are reading the right row and column from the table."

### VISUAL_DEPENDENT
- **concept:** questions with operands in images (not prompt text)
- **rule:** prompt contains no extractable numbers; operands are in an SVG/image
- **message:** *(requires per-question visual authoring)*

### WRONG_NUMBER_PAIR
- **concept:** sum/difference/product/quotient pair selection
- **rule:** distractor pair does not satisfy the stated condition (wrong sum, difference, etc.)
- **message:** "Test this pair — it does not satisfy both conditions."

### WRONG_OP_IN_EXPRESSION
- **concept:** number sentences, expressions
- **rule:** distractor expression uses wrong operation (e.g., "35 − 5 = 30" instead of "35 ÷ 5 = 7")
- **message:** "This uses the wrong operation."

### WRONG_OP_SUB_FOR_DIV
- **concept:** multiplicative comparison
- **rule:** `correct == a/b`, `distractor == a − b` (subtracted instead of dividing)
- **message:** "This subtracts instead of dividing."

### WRONG_UNIT_CHOSEN
- **concept:** metric measurement
- **rule:** distractor has correct number but wrong unit (km vs mm, m vs cm, etc.)
- **message:** "The number is right but the unit is wrong — think about the size."

### PLACE_SHIFT_IN_EXPRESSION
- **concept:** expressions with place-value shifts
- **rule:** distractor expression has operands shifted by powers of 10 (e.g., "6 × 80" vs "6 × 800")
- **message:** "Check the place value of each number in the expression."

### DIGIT_SWAP
- **concept:** division, multiplication
- **rule:** distractor has same digits as correct but in different order
- **message:** "The digits are right but swapped — check each column."

---

## Summary — actual corpus frequencies (2026-07-15)

Derived from 4,014 distractors across 104 lesson files.

| # | Code | Count | % | Detection rule |
|---|---|---|---|---|
| 1 | VISUAL_ONLY | 349 | 8.5 | empty data-val / image-based |
| 2 | ESTIMATE_WRONG_VALUE | 300 | 7.3 | estimation question, generic wrong estimate |
| 3 | DATA_READING_ERROR | 249 | 6.1 | chart/table reading error |
| 4 | SUM_EVAL_ERROR | 224 | 5.5 | expression evaluates to wrong target |
| 5 | WRONG_NUMBER_PAIR | 182 | 4.4 | pair doesn't satisfy condition |
| 6 | WRONG_24H_WRONG_OFFSET | 169 | 4.1 | 12h→24h wrong offset |
| 7 | OFF_BY_ONE | 153 | 3.7 | \|d−c\| = 1 |
| 8 | OPERAND_ECHO | 148 | 3.6 | d ∈ prompt operands |
| 9 | PARTIAL_COMPUTATION | 147 | 3.6 | intermediate result only |
| 10 | NEAR_MISS | 139 | 3.4 | close but no specific rule |
| 11 | CARRY_DROPPED | 126 | 3.1 | d = c − 10^k |
| 12 | DOUBLE_OR_HALF | 124 | 3.0 | d = 2c or c/2 |
| 13 | PARTIAL_PRODUCT_PLACE_ERROR | 116 | 2.8 | partial product off by 10^k |
| 14 | ADJACENT_TABLE_FACT | 113 | 2.8 | d = (a±1)×b |
| 15 | WRONG_PLACE_IDENTIFIED | 94 | 2.3 | digit × wrong power |
| 16 | VISUAL_DEPENDENT | 92 | 2.2 | operands in image, not text |
| 17 | PLACE_SHIFT_DOWN | 79 | 1.9 | d = c / 10^k |
| 18 | PLACE_SHIFT_UP | 73 | 1.8 | d = c × 10^k |
| 19 | ROUND_ONE_WRONG | 65 | 1.6 | one operand rounded wrong |
| 20 | DIGIT_CONFUSION | 65 | 1.6 | digits in wrong positions |
| 21 | WRONG_UNIT_CHOSEN | 64 | 1.6 | correct number, wrong unit |
| 22 | FORMULA_ERROR | 62 | 1.5 | wrong geometry formula |
| 23 | TABLE_LOOKUP_ERROR | 47 | 1.1 | wrong table row/column |
| 24 | WRONG_OP_ADD_FOR_MULT | 50 | 1.2 | d = a+b when c = a×b |
| 25 | MULTI_STEP_ERROR | 50 | 1.2 | wrong operation sequence |
| 26 | OFF_BY_TWO | 48 | 1.2 | \|d−c\| = 2 |
| 27 | SHAPE_PROPERTY_CONFUSED | 48 | 1.2 | wrong face/edge/vertex count |
| 28 | WRONG_24H_NO_ADD_12 | 41 | 1.0 | PM time without +12 |
| 29 | PARTIAL_PRODUCT_PLACE_ERROR | 40 | 1.0 | box method partial product |
| 30 | COMPARISON_REVERSED | 40 | 1.0 | flipped comparison |
| 31 | ROUND_WRONG_DIRECTION_SINGLE | 38 | 0.9 | floor↔ceil for single number |
| 32 | PROBABILITY_WRONG_LEVEL | 36 | 0.9 | wrong probability term |
| 33 | ELAPSED_MINUTES_ERROR | 33 | 0.8 | hours ok, minutes wrong |
| 34 | ROUND_BOTH_DOWN | 32 | 0.8 | both operands floored |
| 35 | CARRY_EXTRA | 30 | 0.7 | d = c + 10^k |
| 36 | AM_PM_SWAP | 30 | 0.7 | opposite AM/PM |
| 37 | SHAPE_CONFUSED | 30 | 0.7 | wrong 3D shape name |
| 38 | ROUND_BOTH_UP | 28 | 0.7 | both operands ceiled |
| 39 | ODD_EVEN_CONFUSED | 27 | 0.7 | wrong parity |
| 40 | DIVISOR_AS_ANSWER | 27 | 0.7 | d = divisor |
| 41 | PATTERN_WRONG_RULE | 27 | 0.7 | wrong sequence rule |
| 42 | PLACE_SHIFT_IN_EXPRESSION | 23 | 0.6 | operand shifted in expression |
| 43 | DIVISIBILITY_CONFUSED | 18 | 0.4 | fails divisibility test |
| 44 | WRONG_ROUND_PLACE | 18 | 0.4 | rounded to wrong place |
| 45 | PROPERTY_CONFUSED | 18 | 0.4 | wrong math property |
| 46 | WRONG_OP_ADD_FOR_SUB | 17 | 0.4 | d = a+b when c = a−b |
| 47 | DECIMAL_PLACE_ERROR | 17 | 0.4 | ×10 or ×100 off in money |
| 48 | BORROW_ERROR | 16 | 0.4 | forgot borrow in subtraction |
| 49 | COMPARISON_EQUAL_WRONG | 16 | 0.4 | "equal" when not equal |
| 50 | REMAINDER_AS_ANSWER | 14 | 0.3 | d = a mod b |
| 51 | WRONG_OP_IN_EXPRESSION | 13 | 0.3 | wrong operation in expression |
| 52 | DIGIT_SWAP | 10 | 0.2 | same digits, wrong order |
| 53 | EXACT_NOT_ROUNDED | 10 | 0.2 | d = exact sum |
| 54 | ORDINAL_SUFFIX_ERROR | 10 | 0.2 | wrong -st/-nd/-rd/-th |
| 55 | QUOTIENT_OFF_BY_ONE | 9 | 0.2 | d = quotient ± 1 |
| 56 | WRONG_OP_SUB_FOR_DIV | 8 | 0.2 | subtracted instead of dividing |
| 57 | FORGOT_DOUBLE_PERIMETER | 7 | 0.2 | d = l+w when 2(l+w) asked |
| 58 | AREA_FOR_PERIMETER | 7 | 0.2 | d = l×w when perimeter asked |
| 59 | WRONG_UNIT_CHOSEN | 7 | 0.2 | correct number, wrong unit |
| 60 | HALF_PERIMETER_FOR_AREA | 6 | 0.1 | d = l+w when area asked |
| 61 | CONCATENATED_DIGITS | 6 | 0.1 | d = concat(a,b) |
| 62 | PERIMETER_FOR_AREA | 5 | 0.1 | d = 2(l+w) when area asked |
| 63 | WRONG_OP_SUB_FOR_MULT | 3 | 0.1 | d = \|a−b\| when c = a×b |
| — | UNCLASSIFIED_TEXT | 284 | 6.9 | text option, no rule |
| — | FRACTION_ADJACENT | 104 | 2.5 | fraction ±1 in num/denom |
| — | FRACTION_WHOLE_FOR_PART | 15 | 0.4 | d = n/n |

**Total: 63 computable codes + 3 meta-codes (VISUAL_ONLY, VISUAL_DEPENDENT, UNCLASSIFIED_TEXT).**

### Classification results

```
Total distractors:     4,014
Exactly one code:      3,639  (90.7%)
Ambiguous (>1 code):     230  ( 5.7%)
Unexplained (0 codes):   145  ( 3.6%)
```
