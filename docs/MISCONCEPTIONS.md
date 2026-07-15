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
- **message:** "Just one away! A sneaky little 1 slipped in — or slipped out — at the very end."

### OFF_BY_TWO
- **concept:** all arithmetic
- **rule:** `|distractor − correct| == 2`
- **message:** "Only two away! A small counting slip is hiding in here — count once more, slowly."

### CARRY_DROPPED
- **concept:** multi-digit addition, subtraction
- **rule:** `distractor == correct − 10^k` for some k ∈ {1,2,3,4} AND question is addition/subtraction
- **message:** "Almost there! Somewhere a carry didn't make the jump to the next column."

### DROPPED_CARRY
- **concept:** multi-digit addition
- **rule:** an addition problem (correct == a+b) where distractor == a+b computed with a carry omitted at exactly one place value — column-by-column addition matches except one column where carry-in was not added.
- **message:** "This adds the columns but misses carrying into the next place."

### CARRY_EXTRA
- **concept:** multi-digit addition, subtraction
- **rule:** `distractor == correct + 10^k` for some k ∈ {1,2,3,4} AND question is addition/subtraction
- **message:** "An extra carry crept into a column where it wasn't invited — check each column again."

### WRONG_OP_ADD_FOR_SUB
- **concept:** addition, subtraction
- **rule:** `correct == a − b` AND `distractor == a + b` (or vice versa), where a, b are prompt operands
- **message:** "This answer went the wrong direction — should the number be getting bigger or smaller here?"

### WRONG_OP_ADD_FOR_MULT
- **concept:** multiplication, word problems
- **rule:** `correct == a × b` AND `distractor == a + b`
- **message:** "This answer adds the numbers together — but 'times as much' is asking for something bigger!"

### WRONG_OP_SUB_FOR_MULT
- **concept:** multiplication, word problems
- **rule:** `correct == a × b` AND `distractor == a − b` (or `|a − b|`)
- **message:** "This answer took away instead of building up — should the total here be bigger or smaller than the numbers you started with?"

### WRONG_OP_MULT_FOR_ADD
- **concept:** addition
- **rule:** `correct == a + b` AND `distractor == a × b`
- **message:** "This multiplies instead of adding."
- **status:** DORMANT — documented rule, zero live assignments as of this commit.

### CONCATENATED_DIGITS
- **concept:** arithmetic
- **rule:** `distractor == parseInt(String(a) + String(b))` where a, b are operands
- **message:** "These numbers got glued side by side instead of worked out — they need real maths, not sticking together."

### DIVIDED_NOT_MULTIPLIED
- **concept:** multiplication, word problems
- **rule:** problem operation is multiplication (correct == a*b for problem operands a,b), but distractor == a/b or b/a (integer or rounded).
- **message:** "This divides the numbers when the problem asks you to multiply."

---

## 2. Place value errors

### DROP_INTERIOR_ZERO
- **concept:** place value, division
- **rule:** correct has a 0 in a non-leading, non-trailing position; distractor == correct with that interior 0 removed.
- **message:** "This skips a zero that belongs in the middle of the number."

### DROP_LEADING_DIGIT
- **concept:** place value, division
- **rule:** distractor == correct with one or more leading digits removed.
- **message:** "This leaves off the digit at the front of the number."

### DIGIT_INSERT_OR_SHIFT
- **concept:** place value
- **rule:** distractor differs from correct by one inserted extra digit (len+1, correct is a subsequence) OR exactly one digit changed by +/-1 in a single place.
- **message:** "This has a digit in the wrong place, changing the number's size."

### DIGIT_REARRANGE
- **concept:** ordering, place value
- **rule:** sorted(digits(distractor)) == sorted(digits(correct)) AND distractor != correct.
- **message:** "These are the right digits, but not in the right order for this value."

### PLACE_SHIFT_UP
- **concept:** place value, multiplication patterns
- **rule:** `distractor == correct × 10^k` for some k ∈ {1,2,3}
- **message:** "This answer grew too large — somewhere a place value climbed one step too high."

### PLACE_SHIFT_DOWN
- **concept:** place value, multiplication patterns
- **rule:** `distractor == correct / 10^k` for some k ∈ {1,2,3} AND result is integer
- **message:** "This answer came out too small — somewhere a place value slipped down a step. Count those zeros!"

### WRONG_PLACE_IDENTIFIED
- **concept:** place value
- **rule:** prompt asks "value of digit D in number N"; `distractor == D × 10^j` where `j ≠ correct power`
- **message:** "Right digit, wrong home — this value belongs to a different place in the number."

---

## 3. Estimation and rounding

### ROUND_BOTH_DOWN
- **concept:** estimation, rounding
- **rule:** `correct == round(a, P) + round(b, P)` AND `distractor == floor(a, P) + floor(b, P)` AND distractor ≠ correct
- **message:** "Both numbers got rounded downhill — but one of them wanted to go up! Check each rounding digit."

### ROUND_BOTH_UP
- **concept:** estimation, rounding
- **rule:** `correct == round(a, P) + round(b, P)` AND `distractor == ceil(a, P) + ceil(b, P)` AND distractor ≠ correct
- **message:** "Both numbers got rounded uphill — but one of them wanted to come down! Check each rounding digit."

### ROUND_ONE_WRONG
- **concept:** estimation, rounding
- **rule:** `distractor == wrongRound(a, P) + round(b, P)` OR `round(a, P) + wrongRound(b, P)` where wrongRound is floor when should be ceil (or vice versa)
- **message:** "One of the two numbers rounded the wrong way — the other neighbour was closer for it."

### EXACT_NOT_ROUNDED
- **concept:** estimation
- **rule:** `distractor == a + b` (exact sum) where correct is the rounded sum, AND `distractor ≠ correct`
- **message:** "This is the exact answer showing off — but the question only wants an estimate! Round first."

### WRONG_ROUND_PLACE
- **concept:** estimation
- **rule:** `distractor == round(a, Q) + round(b, Q)` where `Q ≠ P` (rounded to wrong place value)
- **message:** "The rounding happened at the wrong spot — check which place the question points to."

### ROUND_WRONG_DIRECTION_SINGLE
- **concept:** rounding
- **rule:** prompt asks to round number N to place P; `distractor == floor(N,P)` when `correct == ceil(N,P)` or vice versa
- **message:** "This rounds the wrong way — the digit next door decides which neighbour wins."

### ROUND_WRONG_WAY
- **concept:** rounding
- **rule:** "Which P is N closest to?" — distractor is the nearest rounding-unit multiple in the OPPOSITE direction from correct (correct rounds up → distractor is the lower multiple, and vice versa). E.g., 354: correct 400, distractor 300.
- **message:** "This rounds to the wrong side — check which multiple is nearer."

---

## 4. Geometry — area and perimeter

### AREA_FOR_PERIMETER
- **concept:** area, perimeter
- **rule:** prompt asks perimeter; `distractor == l × w` (area) where `correct == 2(l+w)`
- **message:** "This measures the space *inside* — but the question is walking around the *edge*!"

### PERIMETER_FOR_AREA
- **concept:** area, perimeter
- **rule:** prompt asks area; `distractor == 2(l+w)` (perimeter) where `correct == l × w`
- **message:** "This walks around the edge — but the question wants the space inside!"

### FORGOT_DOUBLE_PERIMETER
- **concept:** perimeter
- **rule:** prompt asks perimeter; `distractor == l + w` (half perimeter) where `correct == 2(l+w)`
- **message:** "This walks only halfway around the shape — a rectangle has two of each side!"

### HALF_PERIMETER_FOR_AREA
- **concept:** area
- **rule:** prompt asks area; `distractor == l + w` where `correct == l × w`
- **message:** "This adds the sides — but area is about filling the inside, not walking the edge."

### SIDE_SQUARED_FOR_RECT
- **concept:** area, perimeter of squares
- **rule:** prompt about square with side s; distractor uses wrong formula (e.g., area=4s instead of s², or perimeter=s² instead of 4s)
- **message:** "This uses the wrong formula for a square."
- **status:** DORMANT — documented rule, zero live assignments as of this commit.

---

## 5. Multiplication

### ADJACENT_TABLE_FACT
- **concept:** multiplication facts, tables
- **rule:** `distractor == (a±1) × b` OR `a × (b±1)` where `correct == a × b`
- **message:** "So close — this answer lives one door down in the times table!"

### PARTIAL_PRODUCT_PLACE_ERROR
- **concept:** multi-digit multiplication
- **rule:** distractor differs from correct by a power of 10 in one partial product
- **message:** "One partial product wandered into the wrong column — every piece has its own place to sit."

---

## 6. Division

### DIVISOR_AS_ANSWER
- **concept:** division
- **rule:** `distractor == divisor` where correct is the quotient
- **message:** "Sneaky! This is the number you divide *by* — the question wants what comes out."

### REMAINDER_AS_ANSWER
- **concept:** division
- **rule:** `distractor == dividend mod divisor`
- **message:** "This is the little bit left over, not the answer — the question wants the big share."

### QUOTIENT_OFF_BY_ONE
- **concept:** division word problems
- **rule:** `distractor == correct ± 1` AND question involves division with remainder context (round up/down)
- **message:** "So close — one group too many, or one too few! Think about what happens to the leftover."

---

## 7. Fractions

### FRACTION_ADJACENT
- **concept:** fractions
- **rule:** distractor fraction differs from correct by ±1 in numerator or denominator (e.g., 1/3 vs 1/4, 2/3 vs 1/3)
- **message:** "So close — this fraction is just one step away from the picture. Count the parts once more."

### FRACTION_WHOLE_FOR_PART
- **concept:** fractions
- **rule:** `distractor == n/n` (whole) where correct is a proper fraction
- **message:** "This fraction means all parts, not just the shaded ones."
- **status:** DORMANT — documented rule, zero live assignments as of this commit.

---

## 8. Time

### AM_PM_SWAP
- **concept:** time, AM/PM
- **rule:** distractor is the opposite of AM/PM (answer is "A.M.", distractor is "P.M." or vice versa)
- **message:** "Morning and evening traded places in this one — the clue in the story says which it really is."

### WRONG_24H_NO_ADD_12
- **concept:** 12h/24h time conversion
- **rule:** answer is PM time + 12; distractor omits adding 12 (e.g., 9:00 PM → distractor "09:00" instead of "21:00")
- **message:** "Careful — the clock's morning and afternoon got mixed up in this one. What does the hour number tell you?"

### WRONG_24H_WRONG_OFFSET
- **concept:** 12h/24h time conversion
- **rule:** distractor adds wrong offset (e.g., +2, +10 instead of +12)
- **message:** "These two clocks aren't telling the same time — the 24-hour clock is being tricky here."

### ELAPSED_MINUTES_ERROR
- **concept:** elapsed time
- **rule:** distractor has correct hours but wrong minutes (or vice versa)
- **message:** "The clock hands slipped a little here — the hours or the minutes aren't quite right."

### TIME_UNIT_CONFUSION
- **concept:** time, duration
- **rule:** a time/duration question where distractor uses a wrong unit conversion or count — any of: minutes-per-hour != 60; a fraction-of-hour value (15/30/45/90) substituted for the correct duration; wrong count of equal time-blocks; or a clock time rounded to the next whole hour.
- **message:** "This uses the wrong amount of time for one of the units."

---

## 9. Comparison and ordering

### COMPARISON_REVERSED
- **concept:** comparing numbers, money
- **rule:** answer is "is less than" and distractor is "is greater than" (or vice versa)
- **message:** "This comparison is standing on its head — check which side is really bigger."

### COMPARISON_EQUAL_WRONG
- **concept:** comparing numbers
- **rule:** answer is a comparison and distractor is "is equal to" (but numbers differ)
- **message:** "These two look like twins, but they're not — check every digit, right to the end."

---

## 10. Parity and properties

### ODD_EVEN_CONFUSED
- **concept:** even/odd numbers
- **rule:** answer is even, distractor is odd (or vice versa) — check digit parity
- **message:** "This number is pretending to be on the wrong team — its last digit gives it away!"

### PROPERTY_CONFUSED
- **concept:** properties of addition/multiplication
- **rule:** answer and distractor are both property names from {Commutative, Associative, Identity, Distributive}
- **message:** "That's a different property wearing this one's coat — look at what actually moved in the equation."

---

## 11. Shape identification

### SHAPE_CONFUSED
- **concept:** 3D shapes, geometry
- **rule:** answer and distractor are both shape names (cube, sphere, cone, cylinder, prism, pyramid)
- **message:** "This name belongs to a look-alike shape — the faces and edges will tell them apart."

---

## 12. Probability

### PROBABILITY_WRONG_LEVEL
- **concept:** probability
- **rule:** answer and distractor are both from {certain, probable, unlikely, impossible}
- **message:** "This guess is too sure — or not sure enough! Count how many ways it can happen first."

---

## 13. Patterns and sequences

### PATTERN_WRONG_RULE
- **concept:** number patterns, geometric sequences
- **rule:** distractor applies a different (plausible) rule to the sequence
- **message:** "This rule fits the first jump but not all of them — a pattern's rule has to work every single step."

### PATTERN_WRONG_STEP
- **concept:** number patterns, skip-counting, even/odd
- **rule:** a sequence/pattern question where distractor is produced by applying a step other than the pattern's true rule — wrong place value in the increment (+10 not +100, +5 not +50), wrong skip-count (by 2 not 4), additive instead of multiplicative (+100 not ×5), or wrong parity selected (even for odd).
- **message:** "This follows a different step than the pattern's rule."

---

## 14. Money

### DECIMAL_PLACE_ERROR
- **concept:** money arithmetic
- **rule:** distractor differs from correct by a factor of 10 or 100 (paise/rupee confusion)
- **message:** "The decimal point wandered off — rupees and paise need to line up just right."

### MONEY_WRONG_OPERATION
- **concept:** money word problems
- **rule:** `correct == a + b` AND `distractor == a − b` (or vice versa) with money values
- **message:** "Check whether the problem asks to add or subtract."
- **status:** DORMANT — documented rule, zero live assignments as of this commit.

---

## 15. Multi-step word problems

### PARTIAL_COMPUTATION
- **concept:** multi-step problems
- **rule:** distractor equals an intermediate result (e.g., only the first step)
- **message:** "This answer stopped halfway — the problem still has one more move left in it."

### ALL_NUMBERS_COMBINED
- **concept:** word problems with extra information
- **rule:** distractor uses all numbers in the problem, including irrelevant ones
- **message:** "Not all numbers in the problem are needed — re-read what is being asked."
- **status:** DORMANT — documented rule, zero live assignments as of this commit.

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
- **message:** "Whoa, this one grew — or shrank! Somewhere a number got doubled or halved along the way."

### OPERAND_ECHO
- **concept:** all arithmetic
- **rule:** `distractor ∈ {prompt operands}` (child selected one of the given numbers instead of computing)
- **message:** "Careful — this number came straight from the question, dressed up as an answer!"

### SUM_EVAL_ERROR
- **concept:** multi-select "select all sums equal to X"
- **rule:** distractor expression `a + b` evaluates to a value ≠ target
- **message:** "This one doesn't add up to what the question asked — test it and see."

---

## 18. Additional codes discovered during mechanical derivation

### BORROW_ERROR
- **concept:** multi-digit subtraction
- **rule:** `distractor == correct + 10^k` where question is subtraction (forgot to decrease next column)
- **message:** "A borrow was missed — recheck the subtraction."
- **status:** DORMANT — documented rule, zero live assignments as of this commit.

### DATA_READING_ERROR
- **concept:** bar graphs, tables, line plots
- **rule:** question reads from a chart/table; distractor is a value from a different row/column/bar
- **message:** "The chart is playing hide-and-seek — this answer came from a different row or bar than the question asked about."

### DIGIT_CONFUSION
- **concept:** number names, place value
- **rule:** distractor has same digits as correct but in wrong positions (e.g., 861 vs 681)
- **message:** "The digits got jumbled on the way in — match each word to its place, one at a time."

### DIVISIBILITY_CONFUSED
- **concept:** divisibility rules
- **rule:** answer is divisible by N; distractor is not (or vice versa)
- **message:** "This number doesn't pass the test — try actually sharing it out and see what's left over."

### ESTIMATE_WRONG_VALUE
- **concept:** estimation (catch-all for estimation questions not matching specific rounding patterns)
- **rule:** question is an estimation question; distractor is a plausible wrong estimate
- **message:** "This estimate wandered too far from home — friendly, rounded numbers keep it close."

### FORMULA_ERROR
- **concept:** geometry (perimeter missing side, area from dimensions)
- **rule:** distractor uses wrong formula manipulation on geometric dimensions
- **message:** "This answer borrowed the wrong recipe — a different shape's rule sneaked in here."

### MULTI_STEP_ERROR
- **concept:** multi-step word problems
- **rule:** distractor results from applying wrong operation sequence on 3+ operands
- **message:** "One step in the journey went sideways — walk the problem again, one step at a time."

### NEAR_MISS
- **concept:** all numeric
- **rule:** `3 ≤ |d − c| ≤ 10` or within 15% of correct, no specific rule matched
- **message:** "So close! This answer trips right at the finish line — the last step wants one more look."

### ORDINAL_SUFFIX_ERROR
- **concept:** ordinal numbers
- **rule:** distractor has correct number but wrong suffix (e.g., "21th" instead of "21st")
- **message:** "The ending doesn't match — say the number out loud and listen for how it finishes."

### SHAPE_PROPERTY_CONFUSED
- **concept:** 3D shapes (faces, edges, vertices)
- **rule:** distractor is a count belonging to a different shape or different property
- **message:** "This count belongs to a different shape — or a different part of this one. Count on the figure itself."

### TABLE_LOOKUP_ERROR
- **concept:** price lists, unit prices
- **rule:** question requires looking up a value from a table; distractor uses wrong table entry
- **message:** "This came from the wrong spot in the table — trace the row and column with your finger."

### VISUAL_DEPENDENT
- **concept:** questions with operands in images (not prompt text)
- **rule:** prompt contains no extractable numbers; operands are in an SVG/image
- **message:** *(requires per-question visual authoring)*

### WRONG_NUMBER_PAIR
- **concept:** sum/difference/product/quotient pair selection
- **rule:** distractor pair does not satisfy the stated condition (wrong sum, difference, etc.)
- **message:** "This pair passes one test but fails the other — both clues have to be happy at the same time."

### WRONG_OP_IN_EXPRESSION
- **concept:** number sentences, expressions
- **rule:** distractor expression uses wrong operation (e.g., "35 − 5 = 30" instead of "35 ÷ 5 = 7")
- **message:** "This rule doesn't always keep its promise — test it with real numbers and catch it slipping."

### WRONG_OP_SUB_FOR_DIV
- **concept:** multiplicative comparison
- **rule:** `correct == a/b`, `distractor == a − b` (subtracted instead of dividing)
- **message:** "This answer subtracts — but the question is about making equal groups."

### WRONG_UNIT_CHOSEN
- **concept:** metric measurement
- **rule:** distractor has correct number but wrong unit (km vs mm, m vs cm, etc.)
- **message:** "The number looks fine, but the unit doesn't fit — think about how big each unit really is."

### PLACE_SHIFT_IN_EXPRESSION
- **concept:** expressions with place-value shifts
- **rule:** distractor expression has operands shifted by powers of 10 (e.g., "6 × 80" vs "6 × 800")
- **message:** "One number here is wearing the wrong size — check what each part of this really means."

### DIGIT_SWAP
- **concept:** division, multiplication
- **rule:** distractor has same digits as correct but in different order
- **message:** "Two digits traded seats on the way to the answer — check each place carefully."

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
