# CONTENT-CENSUS-33-38 — every `₹` and `·` in the Grade 4 corpus

**BRIEF-CONTENT-1 Task A. Executed 2026-07-21. READ-ONLY census.**
Scans every lesson under `lessons/` (including `lessons/incoming/`), the same
corpus the harness asserts (103 lessons, 2,668 questions). `lessons/_preview/`
is a stale preview artifact the engine and every guard skip; it is **excluded**
here for the same reason and is not part of the 2,668. Grade 4 only —
`lessons-g3/` and all `sources-g*/` were neither read nor scanned.

Occurrences are located with the real `<!--@q -->` block boundaries; each row is
tagged to the question `id` whose block it falls in and to the field it sits in.

---

## Table 1 — every `₹` occurrence

**Headline: 201 questions across 23 files contain `₹`. Every one is genuinely
about money. NOT-MONEY = 0. AMBIGUOUS = 0.**

| bucket | count (questions) | action |
|---|---:|---|
| MONEY | 201 | leave alone |
| NOT-MONEY | 0 | — (none found) |
| AMBIGUOUS | 0 | — (none found) |

Item 33 was opened from a review note — *"₹ rendered unconditionally on non-money
column sums."* **It does not reproduce.** Two independent checks:

1. Of 201 `₹` questions, 143 carry an explicit prose money word (cost/price/spent/
   saved/…). The other 58 carry no prose money word **only because they are bare
   currency operations** (`₹613 × 8 = ?`, `₹361 rounded to the nearest ₹100`,
   `₹3.62 ___ ₹3.62`). Every one still displays `₹` amounts and is about money.
   The full 58 are listed below as the strictest-test evidence — none is NOT-MONEY.
2. Only **3** questions with a `layout: vertical/column/stack` (the "column sums"
   Item 33 names) contain `₹`, and **all 3 are money**. There is no non-money
   column sum wearing a `₹`.

Enumerating all 1,127 `₹`-bearing lines verbatim would be 1,127 rows of money
content with a uniform MONEY verdict and no action — omitted as non-actionable,
**not** to hide a NOT-MONEY pile (there is none). The per-file question counts and
the full strictest-test subset are given instead.

### `₹` questions per file (all MONEY)

| file | `₹` questions |
|---|---:|
| money_add_subtract_multiply_divide.html | 30 |
| incoming/Unit_prices_remix.html | 27 |
| incoming/round-money-amounts.html | 25 |
| incoming/Compare-money-amounts.html | 24 |
| incoming/money_add_subtract_remix.html | 23 |
| incoming/price-lists-with-multiplication.html | 19 |
| use_perimeter_to_determine_cost.html | 15 |
| incoming/Estimate quotients - word problems.html | 10 |
| incoming/read_a_table.html | 7 |
| add_5digit_word_problems.html | 5 |
| incoming/interpret-remainders.html | 3 |
| multiply_2digit_by_2digit.html | 2 |
| compare_numbers_up_to_five_digits.html | 1 |
| frequency_tables.html | 1 |
| incoming/Compare_numbers_using_multiplication_remix.html | 1 |
| incoming/Divide larger numbers - word problems.html | 1 |
| incoming/estimate-sums-differences-products-and-quotients-word-problems-remix.html | 1 |
| incoming/estimate-sums-faithful.html | 1 |
| incoming/multiplication-patterns-over-increasing-place-values.html | 1 |
| incoming/perimeter_remix.html | 1 |
| incoming/Properties_of_addition_full30.html | 1 |
| incoming/Properties_of_addition_new8.html | 1 |
| mixed_operations_word_problems.html | 1 |

**Total: 201 questions.**

### The 58 `₹` questions with no prose money-word — shown in full (all MONEY, bare currency ops)

| file | id | prompt (first 120 chars) |
|---|---|---|
| add_5digit_word_problems.html | `q8yvfqqgd` | A charity raised ₹63,410 in the first drive and ₹25,397 in the second. How much was raised in total? |
| incoming/Compare-money-amounts.html | `q7gmm73e9` | Choose the words that make this true: ₹3.62 _____ ₹3.62 |
| incoming/Compare-money-amounts.html | `qw4njb8s6` | Choose the words that make this true: ₹9.41 _____ ₹9.41 |
| incoming/Compare-money-amounts.html | `qaqu88hgz` | Choose the words that make this true: ₹42.75 _____ ₹42.75 |
| incoming/Compare-money-amounts.html | `qrf4qui9u` | Choose the words that make this true: ₹706.47 _____ ₹706.47 |
| incoming/money_add_subtract_remix.html | `q9d4y3aa8` | Tap the total. ₹661 + ₹214 = ? |
| incoming/money_add_subtract_remix.html | `qvduya6vk` | How much altogether? ₹6.76 + ₹7.05 = ? |
| incoming/money_add_subtract_remix.html | `qh6efk9x5` | Add it up — tap the answer. ₹620 + ₹88 + ₹31 = ? |
| incoming/money_add_subtract_remix.html | `qgpcgu3gr` | What is the total? ₹74 + ₹83 + ₹14 = ? |
| incoming/money_add_subtract_remix.html | `qs8atvy98` | Tap the correct total. ₹392 + ₹161 + ₹955 = ? |
| incoming/money_add_subtract_remix.html | `qdvncszy7` | How much in all? ₹4.19 + ₹3.72 + ₹7.73 = ? |
| incoming/money_add_subtract_remix.html | `qv97hkq6q` | Tap the total. ₹3.92 + ₹0.24 + ₹8.20 = ? |
| incoming/money_add_subtract_remix.html | `qjf9cnmpw` | Work out each one. Select every total that is more than ₹100. |
| incoming/money_add_subtract_remix.html | `qs2xva5m3` | How much altogether? ₹67.93 + ₹16.84 + ₹6.68 = ? |
| incoming/money_add_subtract_remix.html | `qjehbxx5h` | Tap the total. ₹39.64 + ₹28.55 + ₹30.11 = ? |
| incoming/money_add_subtract_remix.html | `qdu3yc2rv` | What is the total? ₹83.82 + ₹93.46 + ₹23.94 = ? |
| incoming/money_add_subtract_remix.html | `qaayxm2mh` | Add it up — tap the answer. ₹4,314 + ₹9,826 + ₹9,614 = ? |
| incoming/money_add_subtract_remix.html | `q7igifztg` | Tap the correct total. ₹40,854 + ₹67,252 = ? |
| incoming/money_add_subtract_remix.html | `qcmh7nytt` | Find the difference. ₹47.95 − ₹22.22 = ? |
| incoming/money_add_subtract_remix.html | `q7qwduu84` | Subtract — tap the answer. ₹7,426 − ₹1,139 = ? |
| incoming/money_add_subtract_remix.html | `qhhwb8wpg` | How much is left? ₹8,487 − ₹1,063 = ? |
| incoming/money_add_subtract_remix.html | `qhahatbsr` | Find the difference. ₹37.54 − ₹27.44 = ? |
| incoming/money_add_subtract_remix.html | `qj96uj6kp` | Subtract — tap the answer. ₹2,202 − ₹2,033 = ? |
| incoming/money_add_subtract_remix.html | `qd5rakncx` | How much is left? ₹93,699 − ₹61,416 = ? |
| incoming/money_add_subtract_remix.html | `qxqz66czi` | Sort each total into the right box. |
| incoming/round-money-amounts.html | `q3j8yzmmw` | What is ₹361 rounded to the nearest ₹100? |
| incoming/round-money-amounts.html | `qymnmgcy5` | What is ₹141 rounded to the nearest ₹10? |
| incoming/round-money-amounts.html | `qyruxxqz3` | Round each amount to the nearest ₹10. Does it round down or up? |
| incoming/round-money-amounts.html | `qhzyjpsns` | What is ₹69 rounded to the nearest ₹10? |
| incoming/round-money-amounts.html | `qtqjxayna` | What is ₹601 rounded to the nearest ₹100? |
| incoming/round-money-amounts.html | `qsg4iwjm9` | What is ₹85 rounded to the nearest ₹10? |
| incoming/round-money-amounts.html | `q53ik74yp` | What is ₹298 rounded to the nearest ₹10? |
| incoming/round-money-amounts.html | `qx6s6jh2w` | Select all the amounts that round to ₹700 when rounded to the nearest ₹100. |
| incoming/round-money-amounts.html | `q58r2f9cv` | What is ₹170 rounded to the nearest ₹100? |
| incoming/round-money-amounts.html | `qa9gjy9vn` | What is ₹450 rounded to the nearest ₹100? |
| incoming/round-money-amounts.html | `qah52dqaj` | What is ₹1,049 rounded to the nearest ₹100? |
| incoming/round-money-amounts.html | `qs96jesg6` | What is ₹3,950 rounded to the nearest ₹100? |
| incoming/round-money-amounts.html | `qixpjgxdm` | Round each amount to the nearest ₹100. Which hundred does it land on? |
| incoming/round-money-amounts.html | `qbjvtn6ue` | Round each amount to the nearest ₹100. Then put the amounts in order, from the one that rounds to the smallest hundred t |
| incoming/round-money-amounts.html | `qd783k42u` | What is ₹974 rounded to the nearest ₹10? |
| incoming/round-money-amounts.html | `qy2vshmh3` | What is ₹7,499 rounded to the nearest ₹1,000? |
| incoming/round-money-amounts.html | `qjzjre2x9` | What is ₹7,500 rounded to the nearest ₹1,000? |
| incoming/round-money-amounts.html | `q3ukv32xs` | What is ₹93,520 rounded to the nearest ₹100? |
| incoming/round-money-amounts.html | `q5w6vtwtd` | What is ₹92,461 rounded to the nearest ₹1,000? |
| incoming/round-money-amounts.html | `qzfx7ke87` | What is ₹24,680 rounded to the nearest ₹1,000? |
| incoming/round-money-amounts.html | `qd5md7fhc` | Round each amount to the nearest ₹10,000. Which ten-thousand does it land on? |
| incoming/round-money-amounts.html | `qdf5w3bvu` | What is ₹53,998 rounded to the nearest ₹10,000? |
| incoming/round-money-amounts.html | `qgz885dy9` | What is ₹45,000 rounded to the nearest ₹10,000? |
| incoming/round-money-amounts.html | `qkkkgacrq` | What is ₹19,296 rounded to the nearest ₹10,000? |
| incoming/round-money-amounts.html | `qwrud4p3r` | What is ₹99,640 rounded to the nearest ₹1,000? |
| money_add_subtract_multiply_divide.html | `qezm9iyza` | ₹613 × 8 = ? |
| money_add_subtract_multiply_divide.html | `qrzbmy5ku` | ₹252 × 62 = ? |
| money_add_subtract_multiply_divide.html | `qbec2qwm3` | ₹5,403 + ₹4,422 = ? |
| money_add_subtract_multiply_divide.html | `qx9usfecs` | ₹89,295 + ₹12,451 = ? |
| money_add_subtract_multiply_divide.html | `qrqnapyrm` | ₹? + ₹65 = ₹150 |
| money_add_subtract_multiply_divide.html | `qpab2cbx3` | ₹? × 7 = ₹210 |
| money_add_subtract_multiply_divide.html | `qccpunny8` | About how much is ₹198 + ₹403? |
| money_add_subtract_multiply_divide.html | `qgt2jak8z` | Sort each amount into the right box. |

---

## Table 2 — every `·` occurrence

**Headline: 172 lines / 328 occurrences across 17 files. Every `·` is a spaced
separator ` · ` between parallel items. PROSE-SEPARATOR = all. METADATA = 0.
MULTIPLY = 0. AMBIGUOUS = 0.**

| bucket | count (occurrences) | action |
|---|---:|---|
| PROSE-SEPARATOR | 328 | `·` → `,` |
| METADATA | 0 | — |
| MULTIPLY | 0 | — |
| AMBIGUOUS | 0 | — |

Multiplication is already written with `×` throughout; the `·` never means
multiply — it only separates parallel calculations/clauses (e.g.
`30 × 7 = 210 · 4 × 20 = 80`). No header-style metadata (`Grade 4 · …`) exists.
All 328 are the spaced form ` · ` (0 unspaced), so each becomes `, ` (comma +
single space, no space before).

### `·` lines per file

| file | `·` lines |
|---|---:|
| compare_numbers_up_to_five_digits.html | 18 |
| estimate_products_word_problems.html | 16 |
| multiply_2digit_by_2digit.html | 14 |
| multiply_numbers_ending_in_zeroes.html | 14 |
| properties_of_multiplication.html | 14 |
| find_the_probability.html | 12 |
| incoming/estimate-sums-faithful.html | 12 |
| money_add_subtract_multiply_divide.html | 12 |
| compare_convert_metric_volume.html | 10 |
| use_perimeter_to_determine_cost.html | 10 |
| subtract_numbers_up_to_five_digits.html | 9 |
| frequency_tables.html | 7 |
| identify_faces_of_3d_figures.html | 7 |
| mixed_operations_word_problems.html | 7 |
| estimate_differences_word_problems.html | 5 |
| make_predictions.html | 4 |
| incoming/multiply-a-two-digit-number-by-a-three-digit-number-word-problems.html | 1 |

### Every `·` line, verbatim

| file:line | id | field | line (verbatim) |
|---|---|---|---|
| compare_convert_metric_volume.html:20 | `qr2kvhz3v` | solution/working(fm) | working: "593 ✗ · 341 ✗ · 298 ✗ · 1,053 ✓ · 1,740 ✓ (✓ = over 1,000)" |
| compare_convert_metric_volume.html:187 | `q4vpkdtr8` | solution/working(fm) | working: "341 · 1,000 · 1,053 · 1,740 · 2,000" |
| compare_convert_metric_volume.html:319 | `qjiieem9t` | solution/working(fm) | working: "1 cL = 10 mL · 6 cL = 60 mL" |
| compare_convert_metric_volume.html:322 | `qjiieem9t` | solution/working(fm) | working: "20 mL = 2 cL · 40 mL = 4 cL · 70 mL = 7 cL" |
| compare_convert_metric_volume.html:330 | `qjiieem9t` | prompt | <p class="prompt">1 centilitre = 10 millilitres. Fill in: 1 cL = [] mL · [] cL = 20 mL · [] cL = 40 mL · 6 cL = [] mL · [] cL = 70 mL</p> |
| compare_convert_metric_volume.html:363 | `q73gux2zp` | solution/working(fm) | working: "2,000 mL ✓ · 200 mL ✗ · 200 cL = 2,000 mL ✓ · 20 cL = 200 mL ✗ · 2 kL = 2,000,000 mL ✗ · 2,000 cL = 20,000 mL ✗" |
| compare_convert_metric_volume.html:548 | `qzi8mz9qx` | solution/working(fm) | working: "3,000 L · 2 kL = 2,000 L · 300 L · 30,000 mL = 30 L" |
| compare_convert_metric_volume.html:610 | `q56nzfj9m` | solution/working(fm) | working: "100 cL = 1 L · 500 cL = 5 L" |
| compare_convert_metric_volume.html:613 | `q56nzfj9m` | solution/working(fm) | working: "3 L = 300 cL · 7 L = 700 cL" |
| compare_convert_metric_volume.html:620 | `q56nzfj9m` | prompt | <p class="prompt">100 centilitres = 1 litre. Fill in: 100 cL = [] L · [] cL = 3 L · 500 cL = [] L · [] cL = 7 L</p> |
| compare_numbers_up_to_five_digits.html:101 | `qdajh9mrg` | solution/working(fm) | working: "5,900 ✗ · 6,001 ✓ · 7,240 ✓ · 600 ✗ · 6,000 ✗ (equal) · 8,150 ✓" |
| compare_numbers_up_to_five_digits.html:229 | `q9i9yfkba` | solution/working(fm) | working: "62,150 ✓ · 71,004 ✓ · 48,300 ✗ · 38,720 ✗" |
| compare_numbers_up_to_five_digits.html:391 | `qsaiugam3` | solution/working(fm) | working: "64,701 has 7 · 64,071 has 0 → 64,701 wins" |
| compare_numbers_up_to_five_digits.html:423 | `q3pnm6f62` | solution/working(fm) | working: "6xx pair: 8,607 & 8,670 · 7xx pair: 8,706 & 8,760" |
| compare_numbers_up_to_five_digits.html:426 | `q3pnm6f62` | solution/working(fm) | working: "07 < 70 · 06 < 60" |
| compare_numbers_up_to_five_digits.html:547 | `qscbcghnr` | solution/working(fm) | working: "19,999 ✓ · 20,000 ✗ (equal) · 8,742 ✓ · 21,050 ✗ · 20,001 ✗ · 13,600 ✓" |
| compare_numbers_up_to_five_digits.html:665 | `qchyghcsr` | solution/working(fm) | working: "70,542 > 70,524 · 70,452 > 70,425" |
| compare_numbers_up_to_five_digits.html:706 | `qhhmpihb4` | solution/working(fm) | working: "3 → 43,318 · 4 → 44,318 · 5 → 45,318 · 6 → 46,318" |
| compare_numbers_up_to_five_digits.html:709 | `qhhmpihb4` | solution/working(fm) | working: "43,318 ✗ · 44,318 ✗ · 45,318 ✓ · 46,318 ✓" |
| compare_numbers_up_to_five_digits.html:746 | `qc9nue7ia` | solution/working(fm) | working: "31,470 over · 18,250 under" |
| compare_numbers_up_to_five_digits.html:749 | `qc9nue7ia` | solution/working(fm) | working: "24,900 under · 27,300 over · 25,001 over (the 001 tips it)" |
| compare_numbers_up_to_five_digits.html:835 | `qwnemjyfj` | solution/working(fm) | working: "30,500 · 35,218 · 39,999" |
| compare_numbers_up_to_five_digits.html:953 | `qkacif7es` | solution/working(fm) | working: "4 digits: 9,087 & 9,870 · 5 digits: 10,870 & 18,700" |
| compare_numbers_up_to_five_digits.html:956 | `qkacif7es` | solution/working(fm) | working: "9,087 < 9,870 (hundreds 0 < 8) · 10,870 < 18,700 (thousands 0 < 8)" |
| compare_numbers_up_to_five_digits.html:1048 | `qvhx4hai4` | solution/working(fm) | working: "105 ✗ · 300 ✓ · 015 ✗ · 410 ✓ · 150 ✗ (equal)" |
| compare_numbers_up_to_five_digits.html:1123 | `qg2mjc7ew` | solution/working(fm) | working: "39,999 under · 40,001 over · 44,500 over · 38,000 under · 40,100 over" |
| compare_numbers_up_to_five_digits.html:1195 | `qzy6dsjtg` | solution/working(fm) | working: "6,000 over · 5,455 under (4 hundreds) · 5,600 over (6 hundreds)" |
| compare_numbers_up_to_five_digits.html:1198 | `qzy6dsjtg` | solution/working(fm) | working: "5,545 → tens 4 < 5 → under · 5,565 → tens 6 > 5 → over" |
| estimate_differences_word_problems.html:137 | `qq4wxkdc2` | solution/working(fm) | working: "64 → 60 (a smaller start) · 27 → 30 (takes away more)" |
| estimate_differences_word_problems.html:291 | `qwtbgsa6h` | solution/working(fm) | working: "89 → 90 (a bigger start) · 34 → 30 (takes away less)" |
| estimate_differences_word_problems.html:488 | `qghbgintp` | solution/working(fm) | working: "91 → 90 (a smaller start) · 56 → 60 (takes away more)" |
| estimate_differences_word_problems.html:674 | `qjxw8654k` | solution/working(fm) | working: "96 → 100 (a bigger start) · 61 → 60 (takes away less)" |
| estimate_differences_word_problems.html:828 | `qvwgk9dau` | solution/working(fm) | working: "94 → 90 (a smaller start) · 58 → 60 (takes away more)" |
| estimate_products_word_problems.html:22 | `qv8xfbxi7` | solution/working(fm) | working: "18 → 20 · 62 → 60" |
| estimate_products_word_problems.html:58 | `qd3pvirms` | solution/working(fm) | working: "42 → 40 · 21 → 20" |
| estimate_products_word_problems.html:94 | `qbxvuwpsv` | solution/working(fm) | working: "288 → 300 · 19 → 20" |
| estimate_products_word_problems.html:130 | `q69hx46t6` | solution/working(fm) | working: "31 → 30 · 48 → 50" |
| estimate_products_word_problems.html:166 | `qduz6mpzs` | solution/working(fm) | working: "68 → 70 · 53 → 50" |
| estimate_products_word_problems.html:202 | `q8kktmcm7` | solution/working(fm) | working: "22 → 20 · 38 → 40" |
| estimate_products_word_problems.html:238 | `qbd3at33w` | solution/working(fm) | working: "96 → 100 · 41 → 40" |
| estimate_products_word_problems.html:274 | `qm95uwdxy` | solution/working(fm) | working: "58 → 60 · 29 → 30" |
| estimate_products_word_problems.html:310 | `qziy4ssvw` | solution/working(fm) | working: "47 → 50 · 62 → 60" |
| estimate_products_word_problems.html:346 | `qirzwdzz9` | solution/working(fm) | working: "19 → 20 · 63 → 60" |
| estimate_products_word_problems.html:611 | `qmrqa5hb7` | explain(fm) | explain: "Estimates: 19 × 21 ≈ 400 · 47 × 19 ≈ 1,000 · 23 × 78 ≈ 1,600 — smallest to largest." |
| estimate_products_word_problems.html:615 | `qmrqa5hb7` | solution/working(fm) | working: "19 × 21 ≈ 400 · 47 × 19 ≈ 1,000 · 23 × 78 ≈ 1,600" |
| estimate_products_word_problems.html:641 | `q444cfmiu` | explain(fm) | explain: "Estimates: 42 × 21 ≈ 800 · 31 × 48 ≈ 1,500 · 68 × 53 ≈ 3,500 — smallest to largest." |
| estimate_products_word_problems.html:645 | `q444cfmiu` | solution/working(fm) | working: "42 × 21 ≈ 800 · 31 × 48 ≈ 1,500 · 68 × 53 ≈ 3,500" |
| estimate_products_word_problems.html:671 | `qszug53kt` | explain(fm) | explain: "Estimates: 58 × 29 ≈ 1,800 · 47 × 62 ≈ 3,000 · 288 × 19 ≈ 6,000 — smallest to largest." |
| estimate_products_word_problems.html:675 | `qszug53kt` | solution/working(fm) | working: "58 × 29 ≈ 1,800 · 47 × 62 ≈ 3,000 · 288 × 19 ≈ 6,000" |
| find_the_probability.html:466 | `qmzc7uqqp` | explain(fm) | explain: "Roll a 7: 0 faces (impossible) · Roll a 1: 1 face (unlikely) · Higher than 1: 5 faces (likely) · Less than 7: all 6 faces (certain)." |
| find_the_probability.html:470 | `qmzc7uqqp` | solution/working(fm) | working: "a 7 → 0 · a 1 → 1 · higher than 1 → 5 · less than 7 → 6" |
| find_the_probability.html:473 | `qmzc7uqqp` | solution/working(fm) | working: "0 → impossible · 1 of 6 → unlikely · 5 of 6 → likely · 6 of 6 → certain" |
| find_the_probability.html:545 | `q9scw8tvi` | solution/working(fm) | working: "red 2 · blue 2 · green 1 · yellow 1" |
| find_the_probability.html:548 | `q9scw8tvi` | solution/working(fm) | working: "green ✓ · yellow ✓" |
| find_the_probability.html:607 | `qkrnivitd` | solution/working(fm) | working: "pink 1 · blue 2 · green 3" |
| find_the_probability.html:722 | `qck4fepia` | solution/working(fm) | working: "red 2 < 5 ✓ · blue 3 < 5 ✓" |
| find_the_probability.html:814 | `q4nbtzp6k` | explain(fm) | explain: "Green has no parts (impossible) · red covers half (even chance) · red-or-blue covers everything (certain)." |
| find_the_probability.html:848 | `qe2jyxry4` | explain(fm) | explain: "A 7 cannot be rolled (0) · heads is 1/2 · every face is below 7 (1) — least to most likely." |
| find_the_probability.html:852 | `qe2jyxry4` | solution/working(fm) | working: "roll a 7 → 0 · heads → 1/2 · below 7 → 1" |
| find_the_probability.html:930 | `qzrgxzr9e` | solution/working(fm) | working: "Bag A → 1/4 · Bag B → 1/8" |
| find_the_probability.html:1009 | `q3rbajv4h` | solution/working(fm) | working: "red 2 · blue 2 (of 4)" |
| frequency_tables.html:68 | `q55rgsdkn` | solution/working(fm) | working: "bar over 2 → up to 10 · bar over 3 → up to 5" |
| frequency_tables.html:135 | `qvy2iigk9` | solution/working(fm) | working: "3 times → exactly 1 person · 5 times → 6, and 6 < 10" |
| frequency_tables.html:350 | `q42uhzb4n` | solution/working(fm) | working: "0 → 18 ✓ · 1 → 12 ✓ · 2 → 3 ✗ · 3 → 2 ✗ · 4 → 10 ✓" |
| frequency_tables.html:470 | `qxuhde2dr` | solution/working(fm) | working: "0 bananas → 14 people, not nobody · 1 banana → 15 but 4 bananas → 13" |
| frequency_tables.html:545 | `qpxbzgs7q` | solution/working(fm) | working: "Cricket 20 · Football 10 · Tennis 5 · Hockey 15" |
| frequency_tables.html:668 | `qyknv6rpm` | solution/working(fm) | working: "Red 12 · Blue 7 · Green 15 · Yellow 4" |
| frequency_tables.html:672 | `qyknv6rpm` | solution/working(fm) | working: "Red 12 ✓ · Blue 7 ✓ · Green 9 ✗ · Yellow 4 ✓" |
| identify_faces_of_3d_figures.html:57 | `q28rfngzr` | solution/working(fm) | working: "4 sides, all equal · 4 square corners → a square" |
| identify_faces_of_3d_figures.html:307 | `qa5xrkn47` | solution/working(fm) | working: "top circle flat ✓ · bottom circle flat ✓" |
| identify_faces_of_3d_figures.html:440 | `qds36wmy8` | solution/working(fm) | working: "cube → every face square ✓ · square pyramid → its base is a square ✓" |
| identify_faces_of_3d_figures.html:443 | `qds36wmy8` | solution/working(fm) | working: "cylinder → circles only ✗ · cone → one circle ✗" |
| identify_faces_of_3d_figures.html:501 | `qvdek5qu8` | solution/working(fm) | working: "square pyramid → 4 triangle walls ✓ · triangular prism → 2 triangle ends ✓" |
| identify_faces_of_3d_figures.html:504 | `qvdek5qu8` | solution/working(fm) | working: "cube → all squares ✗ · sphere → no faces at all ✗" |
| identify_faces_of_3d_figures.html:573 | `qvmv73mvz` | solution/working(fm) | working: "cone ✗ · sphere ✗" |
| incoming/estimate-sums-faithful.html:328 | `q3nnb64dr` | solution/working(fm) | working: "612 + 285 → 600 + 300 = 900 · 302 + 594 → 300 + 600 = 900 · 156 + 731 → 200 + 700 = 900" |
| incoming/estimate-sums-faithful.html:332 | `q3nnb64dr` | solution/working(fm) | working: "487 + 618 → 500 + 600 = 1,100 · 719 + 468 → 700 + 500 = 1,200" |
| incoming/estimate-sums-faithful.html:565 | `q2tz3k3hi` | solution/working(fm) | working: "3,466 + 3,509 → 7,000 · 1,510 + 3,482 → 5,000 · 2,940 + 4,088 → 7,000" |
| incoming/estimate-sums-faithful.html:735 | `q3m88e6tk` | solution/working(fm) | working: "9,229 → 9,000 · 3,578 → 4,000" |
| incoming/estimate-sums-faithful.html:777 | `qqpsrfdvj` | solution/working(fm) | working: "8,314 → 8,000 · 2,034 → 2,000" |
| incoming/estimate-sums-faithful.html:819 | `qxfn8b6k5` | solution/working(fm) | working: "1,036 → 1,000 · 1,307 → 1,000" |
| incoming/estimate-sums-faithful.html:896 | `q2hypeq57` | solution/working(fm) | working: "4,419 → 4,000 · 4,763 → 5,000" |
| incoming/estimate-sums-faithful.html:973 | `qv25huup2` | solution/working(fm) | working: "55,367 → 60,000 · 12,376 → 10,000" |
| incoming/estimate-sums-faithful.html:1021 | `qha7rbs2q` | solution/working(fm) | working: "72,915 + 45,180 → 120,000 · 29,634 + 51,077 → 80,000 · 88,846 + 24,163 → 110,000" |
| incoming/estimate-sums-faithful.html:1062 | `qyyip7sb5` | solution/working(fm) | working: "12,966 → 10,000 · 36,787 → 40,000" |
| incoming/estimate-sums-faithful.html:1104 | `qm635pmeq` | solution/working(fm) | working: "90,037 → 90,000 · 26,907 → 30,000" |
| incoming/estimate-sums-faithful.html:1146 | `qjv6w35dn` | solution/working(fm) | working: "98,923 → 100,000 · 62,844 → 60,000" |
| incoming/multiply-a-two-digit-number-by-a-three-digit-number-word-problems.html:207 | `q37ihimga` | prompt | <p class="prompt">Three factories each work out their yearly total (815×86 · 533×27 · 975×42). Put the totals in order from smallest to largest.</p> |
| make_predictions.html:143 | `qa4jjvsif` | solution/working(fm) | working: "red 3 · blue 3" |
| make_predictions.html:183 | `qr8tra9g2` | solution/working(fm) | working: "green 5 · pink 3" |
| make_predictions.html:223 | `qsdsis9dd` | solution/working(fm) | working: "blue 4 · yellow 2 · green 2" |
| make_predictions.html:771 | `qbcwrcerd` | solution/working(fm) | working: "purple 1 · blue 3 · yellow 4" |
| mixed_operations_word_problems.html:209 | `qkxdn2uhk` | solution/working(fm) | working: "whole 500 · known part 285" |
| mixed_operations_word_problems.html:398 | `q2yemygpg` | solution/working(fm) | working: "156 + 89 = 245 · 245 + 67 = 312" |
| mixed_operations_word_problems.html:441 | `qibjsm2rt` | solution/working(fm) | working: "10−5 = 5 · 9−3 = 6 · 4−2 = 2 → 265" |
| mixed_operations_word_problems.html:484 | `quzp3jidc` | solution/working(fm) | working: "9×20 = 180 · 9×4 = 36 · 180 + 36 = 216" |
| mixed_operations_word_problems.html:527 | `q3ny2j2zm` | solution/working(fm) | working: "15−8 = 7 · 13−7 = 6 · 1−1 = 0 → 67" |
| mixed_operations_word_problems.html:613 | `qvpjr3jrj` | solution/working(fm) | working: "25×30 = 750 · 25×6 = 150 · 750 + 150 = 900" |
| mixed_operations_word_problems.html:1087 | `q6sauce6p` | solution/working(fm) | working: "28 → 30 · 31 → 30" |
| money_add_subtract_multiply_divide.html:73 | `qfwjpcecx` | solution/working(fm) | working: "16 − 7 = 9 · 4 − 0 = 4 · 4 − 1 = 3 → ₹349" |
| money_add_subtract_multiply_divide.html:229 | `qezm9iyza` | explain(fm) | explain: "8 × 3 = 24 (write 4, carry 2) · 8 × 1 = 8, + 2 = 10 (write 0, carry 1) · 8 × 6 = 48, + 1 = 49: ₹4,904." |
| money_add_subtract_multiply_divide.html:336 | `qbec2qwm3` | solution/working(fm) | working: "ones 3+2=5 · tens 0+2=2 · hundreds 4+4=8 · thousands 5+4=9" |
| money_add_subtract_multiply_divide.html:380 | `qx9usfecs` | solution/working(fm) | working: "5+1=6 · 9+5=14 → write 4, carry 1 · 2+4+1=7" |
| money_add_subtract_multiply_divide.html:383 | `qx9usfecs` | solution/working(fm) | working: "9+2=11 → write 1, carry 1 · 8+1+1=10" |
| money_add_subtract_multiply_divide.html:470 | `qwah6ubsa` | solution/working(fm) | working: "68 → 70 is 2 · 70 → 100 is 30" |
| money_add_subtract_multiply_divide.html:518 | `qhbabvqzc` | solution/working(fm) | working: "100 − 75 = 25 · 49 − 32 = 17 → ₹17.25" |
| money_add_subtract_multiply_divide.html:561 | `qpkj9f5rp` | solution/working(fm) | working: "10 − 5 = 5 · 14 − 8 = 6 · 1 − 1 = 0 → ₹65" |
| money_add_subtract_multiply_divide.html:993 | `qccpunny8` | solution/working(fm) | working: "198 → 200 · 403 → 400" |
| money_add_subtract_multiply_divide.html:1076 | `qnfsshg5a` | solution/working(fm) | working: "50+50=100 · 40+60=100 · 30+80=110 · 25×4=100 · 90+20=110 · 200÷2=100" |
| money_add_subtract_multiply_divide.html:1121 | `qvmupkys3` | solution/working(fm) | working: "450 ✗ · 1,200 ✓ · 505 ✓ · 499 ✗ · 500 ✗ · 750 ✓" |
| money_add_subtract_multiply_divide.html:1158 | `qx6wvuf6f` | solution/working(fm) | working: "85 → 2 digits · 140, 320 → 3 · 1,050 → 4" |
| multiply_2digit_by_2digit.html:19 | `qwucw8irs` | solution/working(fm) | working: "30 × 7 = 210 · 4 × 20 = 80" |
| multiply_2digit_by_2digit.html:164 | `q9ti5v9jz` | solution/working(fm) | working: "20×13 = 260 · 22×13 = 286 · 12×24 = 288 · 11×27 = 297" |
| multiply_2digit_by_2digit.html:274 | `qq7vqn5jj` | solution/working(fm) | working: "58 × 4: 8 × 4 = 32 → write 2, carry 3 · 5 × 4 = 20, + 3 = 23 → 232" |
| multiply_2digit_by_2digit.html:278 | `qq7vqn5jj` | solution/working(fm) | working: "58 × 20 = 1,160 ✓ · addition itself ✓" |
| multiply_2digit_by_2digit.html:351 | `qpa49yuhe` | solution/working(fm) | working: "74 × 6 = 444 · 74 × 30 = 2,220" |
| multiply_2digit_by_2digit.html:449 | `qw73ycupb` | explain(fm) | explain: "24×21 = 504 (even, under 1000 → left only) · 48×74 = 3,552 (even and over → overlap) · 29×65 = 1,885 (odd, over → right only) · 11×27 = 297 (odd, under → outside)." |
| multiply_2digit_by_2digit.html:453 | `qw73ycupb` | solution/working(fm) | working: "24×21 = 504 · 48×74 = 3,552 · 29×65 = 1,885 · 11×27 = 297" |
| multiply_2digit_by_2digit.html:456 | `qw73ycupb` | solution/working(fm) | working: "504: even ✓ over ✗ → A · 3,552: ✓✓ → AB · 1,885: ✗✓ → B · 297: ✗✗ → OUT" |
| multiply_2digit_by_2digit.html:490 | `qqihhch5s` | solution/working(fm) | working: "50 × 6 = 300 · 2 × 30 = 60" |
| multiply_2digit_by_2digit.html:694 | `qrvuabtca` | solution/working(fm) | working: "52 × 20 + 52 × 4 → splits 24 ✓ · 50 × 24 + 2 × 24 → splits 52 ✓" |
| multiply_2digit_by_2digit.html:697 | `qrvuabtca` | solution/working(fm) | working: "52 × 2 + 52 × 4 = 52 × 6 ✗ · 50 × 24 + 2 = 1,202 ✗" |
| multiply_2digit_by_2digit.html:738 | `qxdpam2ci` | solution/working(fm) | working: "47 → 7 · 63 → 3" |
| multiply_2digit_by_2digit.html:898 | `qi4wduris` | solution/working(fm) | working: "52 → 50 · 38 → 40" |
| multiply_2digit_by_2digit.html:941 | `qmyx2nt3h` | solution/working(fm) | working: "24×21 ≈ 500 · 48×74 ≈ 3,500 · 13×51 ≈ 650 · 75×56 ≈ 4,800" |
| multiply_numbers_ending_in_zeroes.html:65 | `qtnwbfyb9` | solution/working(fm) | working: "400 → 2 zeros · 2 → none → answer 800" |
| multiply_numbers_ending_in_zeroes.html:160 | `qvdeixg7s` | explain(fm) | explain: "800 × 2 = 1,600 · 80 × 100 = 8,000 · 700 × 20 = 14,000 — smallest to largest." |
| multiply_numbers_ending_in_zeroes.html:164 | `qvdeixg7s` | solution/working(fm) | working: "800 × 2 = 1,600 · 80 × 100 = 8,000 · 700 × 20 = 14,000" |
| multiply_numbers_ending_in_zeroes.html:203 | `q52sy7cyj` | solution/working(fm) | working: "7,000×6 = 42,000 · 700×60 = 42,000 · 6,000×7 = 42,000 · 8,000×6 = 48,000 · 7,000×9 = 63,000" |
| multiply_numbers_ending_in_zeroes.html:387 | `q7svhaqsw` | solution/working(fm) | working: "400 · 400 · 8,000 · 42,000 · 80,000 · 180,000" |
| multiply_numbers_ending_in_zeroes.html:568 | `q7np8j8t8` | solution/working(fm) | working: "40 → 1 zero · 500 → 2 zeros → 20 followed by 000 = 20,000" |
| multiply_numbers_ending_in_zeroes.html:678 | `q5ub4q35y` | explain(fm) | explain: "20×500 = 10,000 ✓ · 1,000×80 = 80,000 ✓ · 5,000×4 = 20,000 ✓ — each ends in exactly 4 zeros; 400×30 = 12,000 and 700×60 = 42,000 end in three." |
| multiply_numbers_ending_in_zeroes.html:689 | `q5ub4q35y` | solution/working(fm) | working: "10,000 · 80,000 · 12,000 · 20,000 · 42,000" |
| multiply_numbers_ending_in_zeroes.html:692 | `q5ub4q35y` | solution/working(fm) | working: "4 ✓ · 4 ✓ · 3 ✗ · 4 ✓ · 3 ✗" |
| multiply_numbers_ending_in_zeroes.html:708 | `q5ub4q35y` | explain(body) | <p class="explain">10,000 · 80,000 · 20,000 each end in 4 zeros. 12,000 and 42,000 end in only 3.</p> |
| multiply_numbers_ending_in_zeroes.html:729 | `qsgqqfser` | solution/working(fm) | working: "50×40 → 2 · 50×400 → 3 · 500×400 → 4" |
| multiply_numbers_ending_in_zeroes.html:759 | `qn9kmhvqj` | explain(fm) | explain: "20×500 = 10,000 (4 zeros, not big → left) · 1,000×80 = 80,000 (both → middle) · 60×900 = 54,000 (big only → right) · 700×9 = 6,300 (neither → outside)." |
| multiply_numbers_ending_in_zeroes.html:763 | `qn9kmhvqj` | solution/working(fm) | working: "10,000 · 80,000 · 54,000 · 6,300" |
| multiply_numbers_ending_in_zeroes.html:766 | `qn9kmhvqj` | solution/working(fm) | working: "10,000: zeros ✓ size ✗ → A · 80,000: ✓✓ → AB · 54,000: ✗✓ → B · 6,300: ✗✗ → OUT" |
| properties_of_multiplication.html:222 | `qj47vnkxj` | solution/working(fm) | working: "7×3=3×7 · 4×6=6×4 → commutative" |
| properties_of_multiplication.html:225 | `qj47vnkxj` | solution/working(fm) | working: "8×1=8 · 1×12=12 → identity" |
| properties_of_multiplication.html:262 | `qajr89m9m` | solution/working(fm) | working: "(2 × 5) → × inside · (5 + 1) → + inside · (2 + 4) → + inside · (3 × 2) → × inside" |
| properties_of_multiplication.html:265 | `qajr89m9m` | solution/working(fm) | working: "× → associative · + → distributive" |
| properties_of_multiplication.html:297 | `qewvxafpa` | solution/working(fm) | working: "swap order → commutative · regroup first → associative · split across a sum → distributive" |
| properties_of_multiplication.html:336 | `qcqxxyivy` | solution/working(fm) | working: "3 rows of 5 = 15 · 5 columns of 3 = 15" |
| properties_of_multiplication.html:430 | `qzpp5j69v` | solution/working(fm) | working: "Priya: 6 × 4 · Arjun: 4 × 6" |
| properties_of_multiplication.html:501 | `qkn4cy6r6` | solution/working(fm) | working: "0×9 ✓ · 15×0 ✓ · 7×0 ✓" |
| properties_of_multiplication.html:504 | `qkn4cy6r6` | solution/working(fm) | working: "9×1 = 9 · 1×7 = 7 — both alive" |
| properties_of_multiplication.html:542 | `qwdt6mc88` | solution/working(fm) | working: "8×1 = 8 · 8×0 = 0 · 1×10 = 10 · 0×10 = 0 · 5×1 = 5" |
| properties_of_multiplication.html:630 | `qmr4hepfx` | solution/working(fm) | working: "8 × 1 = 8 · 8 × 0 = 0" |
| properties_of_multiplication.html:895 | `q3bewruzg` | solution/working(fm) | working: "9×1 = 9 (not 0) · 6×0 = 0 (not 6) · 3×8 = 24 ≠ 11" |
| properties_of_multiplication.html:932 | `q5bg3wfga` | solution/working(fm) | working: "6×4 = 24 · (2×2)×6 = 24 · 4×(5+1) = 24 · 8×4 = 32 · 5×(2+3) = 25" |
| properties_of_multiplication.html:976 | `qsp7ubkyx` | solution/working(fm) | working: "4×5 = 20 · 20×1 = 20 · 10×2 = 20 · 20×0 = 0" |
| subtract_numbers_up_to_five_digits.html:57 | `qwgmq2xik` | solution/working(fm) | working: "12 − 7 = 5 · 6 − 3 = 3" |
| subtract_numbers_up_to_five_digits.html:61 | `qwgmq2xik` | solution/working(fm) | working: "12 − 7 = 5 · 4 − 1 = 3 → 3,535" |
| subtract_numbers_up_to_five_digits.html:185 | `q54xvaxc4` | solution/working(fm) | working: "3−1 ✓ · 7−8 ✗ borrow · 2−2 ✓ · 3−2 ✓" |
| subtract_numbers_up_to_five_digits.html:227 | `qxpp3bwgx` | solution/working(fm) | working: "9−6 = 3 · 7−6 = 1 · 7−6 = 1 → 311" |
| subtract_numbers_up_to_five_digits.html:325 | `qzrrd2rht` | solution/working(fm) | working: "12 − 6 = 6 · 11 − 0 = 1 (borrowed) · 6 − 9 borrows → 8 → 816" |
| subtract_numbers_up_to_five_digits.html:392 | `qm7kfzjgt` | solution/working(fm) | working: "3−0 = 3 · 8−1 = 7 · 9−1 = 8 · 6−0 = 6 · 4−1 = 3" |
| subtract_numbers_up_to_five_digits.html:459 | `qf5rv4gi9` | solution/working(fm) | working: "4−8 borrow · 3−0 fine · 8−5 fine · 0−9 borrow · 7−6 fine" |
| subtract_numbers_up_to_five_digits.html:462 | `qf5rv4gi9` | solution/working(fm) | working: "7,014 and 4,450 borrow at/through a 0 · 7,068's 0 hundreds must lend to nobody — it must BE lent to for 0−4" |
| subtract_numbers_up_to_five_digits.html:710 | `qddiwgttg` | solution/working(fm) | working: "61,208 → 61,000 · 29,875 → 30,000" |
| use_perimeter_to_determine_cost.html:61 | `q4girap2u` | solution/working(fm) | working: "fencing a field · ribbon around a gift · trim around a ceiling · rope around a court" |
| use_perimeter_to_determine_cost.html:65 | `q4girap2u` | solution/working(fm) | working: "painting a wall · carpet for a room" |
| use_perimeter_to_determine_cost.html:210 | `qqg6iciv9` | solution/working(fm) | working: "? opposite 14 m → 14 m · ? opposite 9 m → 9 m" |
| use_perimeter_to_determine_cost.html:486 | `q6s3e26pk` | solution/working(fm) | working: "total ₹240 · each metre ₹10 · metres = ?" |
| use_perimeter_to_determine_cost.html:632 | `qc6pcr23n` | solution/working(fm) | working: "A: 30 × ₹20 = ₹600 · B: 30 × ₹25 = ₹750" |
| use_perimeter_to_determine_cost.html:662 | `q85upqe9z` | explain(fm) | explain: "Square 10 m: 40 m ✓ · Square 14 m: 56 m ✗ · 12 by 8 rectangle: 40 m ✓ — two plots fit inside 50 m." |
| use_perimeter_to_determine_cost.html:673 | `q85upqe9z` | solution/working(fm) | working: "10 m square → 40 m · 14 m square → 56 m · 12 × 8 → 40 m" |
| use_perimeter_to_determine_cost.html:676 | `q85upqe9z` | solution/working(fm) | working: "40 ✓ · 56 ✗ · 40 ✓" |
| use_perimeter_to_determine_cost.html:715 | `q68j5pm2e` | solution/working(fm) | working: "A: 4 × 6 = 24 m · B: 2 × (12 + 3) = 30 m" |
| use_perimeter_to_determine_cost.html:861 | `qfvhtr78a` | solution/working(fm) | working: "small: 2 × (6 + 4) = 20 m · big: 2 × (12 + 8) = 40 m" |

---

## Verdict

- **Item 33 (`₹`):** no NOT-MONEY and no AMBIGUOUS occurrence exists. Nothing to
  strip. The reported defect does not manifest in the current corpus.
- **Item 38 (`·`):** 328 occurrences, all PROSE-SEPARATOR, converted to commas by
  Task B. No AMBIGUOUS pile, so no Venkat ruling is required.
