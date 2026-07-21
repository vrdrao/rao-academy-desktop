# FILLBLANKS-CENSUS — fill-blanks across the Grade 4 corpus

**BRIEF-BATCH-1 Task B (Item 54). Executed 2026-07-21. READ-ONLY.**
Nothing was converted, no distractor was authored, no lesson was edited. This is a
count that scopes the Item 53 MCQ-conversion work; Venkat decides what actually
converts.

Measured with the real engine (`RaoPreview.build()`) over all lesson files
`tools/verify-*` scan (`lessons/**`, `_preview` skipped) — **103 lessons, 2,668
questions**, the same corpus the harness asserts.

---

## 1. Total fill-blanks

**599 fill-blanks questions — 22.5% of 2,668.**

Fill-blanks is the second most common type after single-select. Nearly a quarter
of the bank asks a Grade 4 child to type rather than tap.

---

## 2. Per-lesson counts (descending)

**Lessons with 10 or more fill-blanks (19 lessons):**

| count | lesson |
|---:|---|
| 32 | incoming/Subtraction_missing_digits_remix.html |
| 30 | incoming/Complete_the_division_table.html |
| 29 | incoming/interpret-remainders.html |
| 28 | multiply_2x2_complete_missing_steps.html |
| 27 | incoming/addition-missing-digits.html |
| 26 | incoming/Multiply_two-digit_by_two-digit_word_problems__1to1.html |
| 21 | Addition_patterns_over_increasing_place_values.html |
| 18 | incoming/Multiply_1x3-4digit_REMIX.html |
| 18 | incoming/number-patterns-word-problems-remix.html |
| 17 | incoming/divide-larger-numbers.html |
| 15 | incoming/Properties_of_addition_full30.html |
| 14 | incoming/multiply-a-two-digit-number-by-a-three-digit-number.html |
| 13 | incoming/estimate-sums-faithful.html |
| 12 | incoming/estimate_differences_all.html |
| 12 | incoming/guess-and-check_lesson30.html |
| 12 | incoming/Place_values_remix.html |
| 12 | subtract_numbers_up_to_five_digits.html |
| 11 | make_predictions.html |
| 10 | incoming/perimeter_remix.html |

**The remaining lessons (fewer than 10 each):**

```
 9  incoming/add-subtract-multiply-divide-remix-expanded.html
 9  incoming/choose-numbers-sum-diff-prod-quot__remix.html
 8  incoming/estimate-sums-remix.html
 8  incoming/increasing_number_pattern__remix.html
 8  incoming/interpret-line-plots-remix.html
 8  incoming/Multiplication_facts_to_10_remix.html
 8  incoming/perimeter_missing_side_remix.html
 7  add_5digit_word_problems.html
 7  estimate_products_word_problems.html
 7  incoming/Elapsed_time_remix.html
 7  incoming/metric_mixed_units_remix.html
 7  incoming/Time_patterns_remix.html
 6  compare_convert_metric_volume.html
 6  estimate_differences_word_problems.html
 6  identify_faces_of_3d_figures.html
 6  incoming/box_multiplication_remix.html
 6  incoming/Choose numbers with a particular quotient.html
 6  incoming/estimate-sums-differences-products-and-quotients-word-problems-remix.html
 6  incoming/find-the-order-remix.html
 5  incoming/choose-product_remix.html
 5  incoming/Create_line_plots_remix.html
 5  incoming/Estimate_sums__word_problems.html
 5  incoming/simple-fractions-parts-of-a-group.html
 4  frequency_tables.html
 4  incoming/bar_graphs_remix.html
 4  incoming/Divisibility_rules_remix.html
 4  incoming/number-patterns-mixed-review-remix.html
 4  incoming/ordinal-numbers-to-100th_remix.html
 4  incoming/place_values_unit_conversion_remix.html
 4  incoming/rounding_remix.html
 4  incoming/time_units_variations.html
 4  _type-coverage.html   (harness fixture, not a real lesson)
 3  find_the_probability.html
 3  incoming/Choose-numbers-with-a-particular-difference-30-remix.html
 3  incoming/geometric_patterns_remix.html
 3  incoming/money_add_subtract_remix.html
 3  incoming/multiplication-patterns-over-increasing-place-values.html
 3  incoming/Multiply_1x2_remix.html
 3  incoming/select-area-remix.html
 3  incoming/time_units_remix.html
 3  incoming/Unit_prices_remix.html
 3  multiply_2digit_by_2digit.html
 3  multiply_numbers_ending_in_zeroes.html
 2  incoming/Division_facts_to_10.html
 2  incoming/names-for-numbers_remix.html
 2  incoming/ordinal-numbers-to-100th_set2.html
 2  incoming/simple-fractions-30.html
 2  incoming/transportation-schedules-12h-complete.html
 2  incoming/transportation_24h_more15.html
 2  incoming/transportation_24h_remix.html
 1  incoming/Compare_numbers_using_multiplication_remix.html
 1  incoming/Properties_of_addition_new8.html
 1  incoming/Understanding_probability_remix.html
 1  use_perimeter_to_determine_cost.html
```

---

## 3. Single-blank vs multi-blank

- **Single-blank: 359**
- **Multi-blank: 240**

Blank count is taken from the engine's parsed `answer:` array length — a
single-blank question has one answer string, a multi-blank has several
(one per blank).

A single-blank question with one numeric answer is the clean conversion target: it
becomes "tap the number" as a `single-select`. A multi-blank question (each blank a
separate answer) does not — a single tap cannot supply three digits.

---

## 4. How many carry a `layout:` value

**131 fill-blanks carry a structural `layout:`** value. These are poor conversion
candidates — the layout *is* the interaction (a vertical sum with a missing digit,
a round-then-add scaffold). Breakdown:

| layout | count |
|---|---:|
| vertical | 60 |
| round-scaffold | 39 |
| multiply | 19 |
| column | 12 |
| in-out | 1 |

`vertical` / `column` / `multiply` are column-arithmetic (find the missing digit in
a written sum). `round-scaffold` is the two-operand "round each, then combine"
estimator. None of these is a "type one number" question; they are structural and
stay fill-blanks.

---

## 5. How many admit clean conversion to single-select

**The rule applied (stated so Venkat can overrule it):**

> A fill-blanks question converts cleanly to single-select **iff** it has
> **exactly one blank**, **AND** the answer is **numeric** (a digit string —
> tappable as one option), **AND** it carries **no `layout:`** (not a structural
> column/scaffold interaction).

By that rule: **330 of 599 (55%) admit clean conversion.**

Full five-way breakdown of all 599 (they sum to 599):

| category | count | converts? |
|---|---:|---|
| single-blank · no layout · numeric | **330** | **yes — clean** |
| single-blank · no layout · non-numeric | 15 | maybe — needs distractor judgement (word/text answer) |
| single-blank · with layout | 14 | no — structural |
| multi-blank · with layout | 117 | no — structural (round-scaffold, vertical) |
| multi-blank · no layout | 123 | no — multiple answers, one tap can't supply them |

**So: 330 clean, 15 borderline (single-blank but the answer is a word, not a
number — convertible in principle but each needs authored distractors and a
judgement call), and 254 that do not convert (269 minus the 15 borderline) because
they are multi-blank or structural.**

### Caveats — where the mechanical rule is loose or strict

- **The 330 is an upper bound on "clean," not a mandate to convert all of them.**
  Item 53 says fill-blanks is *acceptable occasionally for variety*. Converting
  every one would swing the bank hard toward single-select — itself a smell
  (CLAUDE.md: 60% single-select is a diversity warning). The number scopes the
  work; it is not a target.
- **A numeric single-blank with no `layout:` can still be estimation.** CLAUDE.md
  forbids single-blank fill-blanks for an *estimated* answer (no single correct
  string) — those SHOULD become single-select, so they are correctly inside the
  330, but the conversion must offer sensible estimate distractors, not invent
  slot-fillers.
- **The 15 non-numeric single-blank** (e.g. a word answer) are convertible only
  with authored options; they are flagged separately rather than folded into the
  clean count.
- **`interpret-remainders` (29 fill-blanks)** is already named in Item 56 as the
  first conversion candidate identified by review; it sits near the top of this
  list and is largely single-blank numeric.

---

## Coverage honesty

Every fill-blanks question across all 103 lessons was counted; nothing was
silently excluded. `_type-coverage.html` (the harness fixture, 4 fill-blanks) is
included in the 599/2,668 totals for consistency with the corpus the harness
asserts; it is not a shippable lesson and is marked as such above. Blank-count and
numeric classification come from the engine's parsed output, not a second parser.
