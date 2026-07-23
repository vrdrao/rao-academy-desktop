# TEACHING CENSUS — Grade 4 corpus (BRIEF-TEACHING-CENSUS-1)

**READ-ONLY measurement. Nothing in `lessons/` or `engine/` was modified.**

Measured 2026-07-23 against engine `rao-master-22`, driving every question
through the real `RaoPreview.build()` — no second parser (HARD CONSTRAINT §3). The
hint-leak matcher (§2) reuses `tools/verify-content-guards.js` logic verbatim.
Every number below is a machine count; none is estimated.

Scope fence: `lessons/` only (top-level + `lessons/incoming/`). `lessons-g3/` was
neither read nor counted. `lessons/_preview/` is excluded from the corpus (it is a
preview-fixtures dir the harness skips) and reported separately in §0.

---

## §0 — BASELINE

- **Lesson files under `lessons/`: 103.** (19 top-level + 84 in `lessons/incoming/`.)
  `lessons/incoming/` **is included** in the corpus (harness discovery recurses into it).
- **`lessons/_preview/`: 4 files — EXCLUDED** from the corpus and from every count below.
- **Total questions: 2668.**

Expected 103 files / 2,668 questions — **both match exactly. No halt.**

Questions per `behavior`:

| behavior | count |
|---|---:|
| single-select | 1511 |
| multi-select | 169 |
| fill-blanks | 576 |
| order | 141 |
| sequence-build | 31 |
| categorize | 152 |
| expression | 6 |
| line-plot | 33 |
| construct | 31 |
| bar-graph *(other)* | 3 |
| lattice *(other)* | 1 |
| time *(other)* | 14 |
| **total** | **2668** |

`other` = behavior types outside the nine named in the brief that exist in the corpus:
bar-graph (3), time (14), lattice (1).

---

## §1 — HINT COVERAGE AND REUSE

**Corpus roll-up.** 2649 of 2668 questions carry at least one hint rung
(99.3%). Rung distribution across hinted questions:
**1 rung: 2200 · 2 rungs: 6 · 3+ rungs: 443.**

**1b — the hint-only types (fill-blanks / order / sequence-build / categorize),**
where Rule 16 makes the hint the ONLY teaching a child receives:

- hint-only questions: **900**
- of those, hinted: **893**
- **with NO hint: 7** ← the number that matters most in §1

Per-behavior hint coverage (corpus):

| behavior | hinted | total | coverage |
|---|---:|---:|---:|
| single-select | 1506 | 1511 | 99.7% |
| multi-select | 168 | 169 | 99.4% |
| fill-blanks | 573 | 576 | 99.5% |
| order | 140 | 141 | 99.3% |
| sequence-build | 30 | 31 | 96.8% |
| categorize | 150 | 152 | 98.7% |
| expression | 5 | 6 | 83.3% |
| line-plot | 31 | 33 | 93.9% |
| construct | 31 | 31 | 100.0% |
| bar-graph | 2 | 3 | 66.7% |
| lattice | 0 | 1 | 0.0% |
| time | 13 | 14 | 92.9% |

**Roll-up — distribution of per-lesson DISTINCT-hint counts** (1d, computed after
trimming and collapsing internal whitespace runs; exact match otherwise — case and
punctuation NOT normalised):

| distinct hints in lesson | # lessons |
|---|---:|
| 1-5 | 9 |
| 6-10 | 10 |
| 11-20 | 26 |
| 21+ | 58 |
| **total** | **103** |
| 2054 distinct hint texts corpus-wide (union) | — |

### 1e — The reuse shape: five lessons with the LOWEST distinct-to-hinted ratio

Each distinct hint text listed verbatim, with the count of questions using it.

**`incoming/increasing_number_pattern__remix.html`** — 37 hinted, 1 distinct (ratio 0.027):

- **[37×]** Look at the gaps between numbers — they grow by 1 each step.

**`incoming/Subtraction_missing_digits_remix.html`** — 32 hinted, 1 distinct (ratio 0.031):

- **[32×]** Subtract each column from the right. If the top digit is smaller, borrow 1 from the next column.

**`incoming/addition-missing-digits.html`** — 27 hinted, 1 distinct (ratio 0.037):

- **[27×]** Add one column at a time, starting from the ones on the right. If a column adds up to 10 or more, carry the ten into the next column.

**`incoming/equal-parts.html`** — 35 hinted, 2 distinct (ratio 0.057):

- **[27×]** Equal parts are exactly the same size. Which shape has pieces that all match?
- **[8×]** Equal parts are the same size all the way across. Tap every shape whose pieces match.

**`incoming/Complete_the_division_table.html`** — 30 hinted, 2 distinct (ratio 0.067):

- **[16×]** Total = Groups &times; Each Group + Left Over.
- **[14×]** Total &divide; Number of Equal Groups = Amount in Each Group.

### 1a / 1b / 1c / 1d — per-lesson hint table

`hint-only NO-HINT` = hint-only-type questions with no hint (the Rule-16 gap). 
`ratio` = distinct ÷ hinted (lower = more reuse).

| lesson | Q | hinted | cov | hint-only tot | hint-only NO-HINT | 1rung | 2rung | 3+rung | distinct | ratio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| _type-coverage.html | 26 | 7 | 26.9% | 9 | 7 | 6 | 0 | 1 | 7 | 1.00 |
| add_5digit_word_problems.html | 32 | 32 | 100.0% | 15 | 0 | 32 | 0 | 0 | 4 | 0.13 |
| Addition_patterns_over_increasing_place_values.html | 26 | 26 | 100.0% | 21 | 0 | 26 | 0 | 0 | 24 | 0.92 |
| compare_convert_metric_volume.html | 22 | 22 | 100.0% | 11 | 0 | 0 | 0 | 22 | 19 | 0.86 |
| compare_numbers_up_to_five_digits.html | 30 | 30 | 100.0% | 11 | 0 | 0 | 0 | 30 | 22 | 0.73 |
| estimate_differences_word_problems.html | 22 | 22 | 100.0% | 6 | 0 | 0 | 0 | 22 | 3 | 0.14 |
| estimate_products_word_problems.html | 20 | 20 | 100.0% | 10 | 0 | 0 | 0 | 20 | 3 | 0.15 |
| find_the_probability.html | 30 | 30 | 100.0% | 7 | 0 | 0 | 0 | 30 | 30 | 1.00 |
| frequency_tables.html | 21 | 21 | 100.0% | 5 | 0 | 0 | 0 | 21 | 21 | 1.00 |
| identify_faces_of_3d_figures.html | 16 | 16 | 100.0% | 8 | 0 | 0 | 0 | 16 | 16 | 1.00 |
| incoming/add-subtract-multiply-divide-remix-expanded.html | 30 | 30 | 100.0% | 11 | 0 | 0 | 0 | 30 | 30 | 1.00 |
| incoming/addition-missing-digits.html | 27 | 27 | 100.0% | 27 | 0 | 27 | 0 | 0 | 1 | 0.04 |
| incoming/am-or-pm_remix.html | 18 | 18 | 100.0% | 4 | 0 | 18 | 0 | 0 | 17 | 0.94 |
| incoming/area-and-perimeter-word-problems.html | 25 | 25 | 100.0% | 2 | 0 | 25 | 0 | 0 | 25 | 1.00 |
| incoming/bar_graphs_remix.html | 30 | 30 | 100.0% | 8 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/box_multiplication_remix.html | 25 | 25 | 100.0% | 12 | 0 | 25 | 0 | 0 | 9 | 0.36 |
| incoming/Choose numbers with a particular quotient.html | 31 | 31 | 100.0% | 13 | 0 | 31 | 0 | 0 | 26 | 0.84 |
| incoming/choose-numbers-sum-diff-prod-quot__remix.html | 23 | 23 | 100.0% | 19 | 0 | 23 | 0 | 0 | 17 | 0.74 |
| incoming/Choose-numbers-with-a-particular-difference-30-remix.html | 30 | 30 | 100.0% | 8 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/choose-product_remix.html | 22 | 22 | 100.0% | 6 | 0 | 22 | 0 | 0 | 22 | 1.00 |
| incoming/choose-the-appropriate-metric-unit-of-measure.html | 22 | 22 | 100.0% | 0 | 0 | 22 | 0 | 0 | 10 | 0.45 |
| incoming/Compare_numbers_using_multiplication_remix.html | 30 | 30 | 100.0% | 6 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/Compare-money-amounts.html | 24 | 24 | 100.0% | 8 | 0 | 24 | 0 | 0 | 8 | 0.33 |
| incoming/Complete_the_division_table.html | 30 | 30 | 100.0% | 30 | 0 | 30 | 0 | 0 | 2 | 0.07 |
| incoming/Count_vertices__edges_and_faces.html | 22 | 22 | 100.0% | 6 | 0 | 22 | 0 | 0 | 22 | 1.00 |
| incoming/Create figures with a given area.html | 30 | 30 | 100.0% | 1 | 0 | 30 | 0 | 0 | 21 | 0.70 |
| incoming/Create_line_plots_remix.html | 42 | 42 | 100.0% | 7 | 0 | 42 | 0 | 0 | 10 | 0.24 |
| incoming/Divide larger numbers - word problems.html | 25 | 25 | 100.0% | 3 | 0 | 25 | 0 | 0 | 25 | 1.00 |
| incoming/divide-larger-numbers.html | 24 | 24 | 100.0% | 18 | 0 | 24 | 0 | 0 | 24 | 1.00 |
| incoming/Divisibility_rules_remix.html | 30 | 30 | 100.0% | 12 | 0 | 30 | 0 | 0 | 7 | 0.23 |
| incoming/Division_facts_to_10.html | 16 | 16 | 100.0% | 4 | 0 | 16 | 0 | 0 | 16 | 1.00 |
| incoming/Elapsed_time_remix.html | 30 | 30 | 100.0% | 11 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/equal-parts.html | 35 | 35 | 100.0% | 0 | 0 | 35 | 0 | 0 | 2 | 0.06 |
| incoming/Estimate quotients - word problems.html | 21 | 21 | 100.0% | 0 | 0 | 21 | 0 | 0 | 21 | 1.00 |
| incoming/estimate_differences_all.html | 42 | 42 | 100.0% | 18 | 0 | 42 | 0 | 0 | 27 | 0.64 |
| incoming/Estimate_sums__word_problems.html | 30 | 30 | 100.0% | 5 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/estimate-products_remix.html | 20 | 20 | 100.0% | 3 | 0 | 20 | 0 | 0 | 20 | 1.00 |
| incoming/estimate-sums-differences-products-and-quotients-word-problems-remix.html | 24 | 24 | 100.0% | 6 | 0 | 24 | 0 | 0 | 24 | 1.00 |
| incoming/estimate-sums-faithful.html | 30 | 30 | 100.0% | 16 | 0 | 0 | 6 | 24 | 30 | 1.00 |
| incoming/estimate-sums-remix.html | 23 | 23 | 100.0% | 8 | 0 | 23 | 0 | 0 | 16 | 0.70 |
| incoming/even_odd_remix.html | 30 | 30 | 100.0% | 7 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/find-start-and-end-times-remix.html | 30 | 30 | 100.0% | 3 | 0 | 30 | 0 | 0 | 26 | 0.87 |
| incoming/find-the-order-remix.html | 30 | 30 | 100.0% | 20 | 0 | 30 | 0 | 0 | 27 | 0.90 |
| incoming/find-two-numbers-based-on-sum-difference-product-and-quotient.html | 23 | 23 | 100.0% | 0 | 0 | 23 | 0 | 0 | 23 | 1.00 |
| incoming/geometric_patterns_remix.html | 30 | 30 | 100.0% | 11 | 0 | 30 | 0 | 0 | 23 | 0.77 |
| incoming/guess-and-check_lesson30.html | 30 | 30 | 100.0% | 15 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/identify-three-dimensional-figures.html | 25 | 25 | 100.0% | 5 | 0 | 25 | 0 | 0 | 25 | 1.00 |
| incoming/increasing_number_pattern__remix.html | 37 | 37 | 100.0% | 18 | 0 | 37 | 0 | 0 | 1 | 0.03 |
| incoming/inequalities_remix.html | 8 | 8 | 100.0% | 0 | 0 | 8 | 0 | 0 | 8 | 1.00 |
| incoming/interpret-line-plots-remix.html | 30 | 30 | 100.0% | 8 | 0 | 30 | 0 | 0 | 23 | 0.77 |
| incoming/interpret-remainders.html | 29 | 29 | 100.0% | 0 | 0 | 29 | 0 | 0 | 29 | 1.00 |
| incoming/metric_mixed_units_remix.html | 31 | 31 | 100.0% | 13 | 0 | 31 | 0 | 0 | 26 | 0.84 |
| incoming/money_add_subtract_remix.html | 24 | 24 | 100.0% | 5 | 0 | 24 | 0 | 0 | 7 | 0.29 |
| incoming/multi-step-word-problems-mcq.html | 28 | 28 | 100.0% | 0 | 0 | 28 | 0 | 0 | 28 | 1.00 |
| incoming/Multiplication_facts_to_10_remix.html | 32 | 32 | 100.0% | 10 | 0 | 32 | 0 | 0 | 17 | 0.53 |
| incoming/multiplication-patterns-over-increasing-place-values.html | 21 | 21 | 100.0% | 9 | 0 | 21 | 0 | 0 | 21 | 1.00 |
| incoming/Multiply_1x2_remix.html | 29 | 29 | 100.0% | 6 | 0 | 29 | 0 | 0 | 27 | 0.93 |
| incoming/Multiply_1x3-4digit_REMIX.html | 34 | 34 | 100.0% | 22 | 0 | 34 | 0 | 0 | 5 | 0.15 |
| incoming/Multiply_two-digit_by_two-digit_word_problems__1to1.html | 26 | 26 | 100.0% | 26 | 0 | 26 | 0 | 0 | 26 | 1.00 |
| incoming/multiply-a-two-digit-number-by-a-three-digit-number-word-problems.html | 19 | 19 | 100.0% | 1 | 0 | 19 | 0 | 0 | 19 | 1.00 |
| incoming/multiply-a-two-digit-number-by-a-three-digit-number.html | 27 | 27 | 100.0% | 14 | 0 | 27 | 0 | 0 | 27 | 1.00 |
| incoming/names-for-numbers_remix.html | 30 | 30 | 100.0% | 7 | 0 | 30 | 0 | 0 | 16 | 0.53 |
| incoming/number-patterns-mixed-review-remix.html | 30 | 30 | 100.0% | 9 | 0 | 30 | 0 | 0 | 29 | 0.97 |
| incoming/number-patterns-word-problems-remix.html | 35 | 35 | 100.0% | 24 | 0 | 35 | 0 | 0 | 33 | 0.94 |
| incoming/ordinal-numbers-to-100th_remix.html | 12 | 12 | 100.0% | 7 | 0 | 12 | 0 | 0 | 11 | 0.92 |
| incoming/ordinal-numbers-to-100th_set2.html | 10 | 10 | 100.0% | 5 | 0 | 10 | 0 | 0 | 10 | 1.00 |
| incoming/perimeter_missing_side_remix.html | 25 | 25 | 100.0% | 10 | 0 | 25 | 0 | 0 | 11 | 0.44 |
| incoming/perimeter_remix.html | 30 | 30 | 100.0% | 13 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/Place_values_remix.html | 30 | 30 | 100.0% | 14 | 0 | 30 | 0 | 0 | 27 | 0.90 |
| incoming/place_values_unit_conversion_remix.html | 32 | 32 | 100.0% | 8 | 0 | 32 | 0 | 0 | 26 | 0.81 |
| incoming/price-lists-with-multiplication.html | 20 | 20 | 100.0% | 3 | 0 | 20 | 0 | 0 | 20 | 1.00 |
| incoming/Properties_of_addition_full30.html | 30 | 30 | 100.0% | 17 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/Properties_of_addition_new8.html | 8 | 8 | 100.0% | 3 | 0 | 8 | 0 | 0 | 8 | 1.00 |
| incoming/read_a_table.html | 30 | 30 | 100.0% | 6 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/rotational_symmetry.html | 23 | 23 | 100.0% | 0 | 0 | 23 | 0 | 0 | 17 | 0.74 |
| incoming/round-money-amounts.html | 25 | 25 | 100.0% | 4 | 0 | 25 | 0 | 0 | 25 | 1.00 |
| incoming/rounding_remix.html | 30 | 30 | 100.0% | 5 | 0 | 30 | 0 | 0 | 24 | 0.80 |
| incoming/select-area-remix.html | 30 | 30 | 100.0% | 9 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/Simple fractions - what fraction does the shape show.html | 30 | 30 | 100.0% | 0 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/simple-fractions-30.html | 30 | 30 | 100.0% | 6 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/simple-fractions-parts-of-a-group.html | 30 | 30 | 100.0% | 11 | 0 | 30 | 0 | 0 | 30 | 1.00 |
| incoming/Subtraction_missing_digits_remix.html | 32 | 32 | 100.0% | 32 | 0 | 32 | 0 | 0 | 1 | 0.03 |
| incoming/symmetry_remix.html | 11 | 11 | 100.0% | 2 | 0 | 11 | 0 | 0 | 11 | 1.00 |
| incoming/symmetry_set2.html | 20 | 20 | 100.0% | 3 | 0 | 20 | 0 | 0 | 20 | 1.00 |
| incoming/time_12_24_remix.html | 30 | 30 | 100.0% | 4 | 0 | 30 | 0 | 0 | 13 | 0.43 |
| incoming/Time_patterns_remix.html | 30 | 30 | 100.0% | 11 | 0 | 30 | 0 | 0 | 28 | 0.93 |
| incoming/time_units_remix.html | 16 | 16 | 100.0% | 5 | 0 | 16 | 0 | 0 | 16 | 1.00 |
| incoming/time_units_variations.html | 15 | 15 | 100.0% | 6 | 0 | 15 | 0 | 0 | 15 | 1.00 |
| incoming/transportation_24h_more15.html | 15 | 15 | 100.0% | 5 | 0 | 15 | 0 | 0 | 15 | 1.00 |
| incoming/transportation_24h_remix.html | 12 | 12 | 100.0% | 5 | 0 | 12 | 0 | 0 | 12 | 1.00 |
| incoming/transportation-schedules-12h-complete.html | 30 | 30 | 100.0% | 7 | 0 | 30 | 0 | 0 | 29 | 0.97 |
| incoming/Understanding_probability_remix.html | 30 | 30 | 100.0% | 7 | 0 | 30 | 0 | 0 | 29 | 0.97 |
| incoming/Unit_prices_remix.html | 27 | 27 | 100.0% | 5 | 0 | 27 | 0 | 0 | 14 | 0.52 |
| incoming/Word problems with extra or missing information.html | 24 | 24 | 100.0% | 0 | 0 | 24 | 0 | 0 | 23 | 0.96 |
| make_predictions.html | 23 | 23 | 100.0% | 12 | 0 | 0 | 0 | 23 | 23 | 1.00 |
| mixed_operations_word_problems.html | 26 | 26 | 100.0% | 0 | 0 | 0 | 0 | 26 | 26 | 1.00 |
| money_add_subtract_multiply_divide.html | 30 | 30 | 100.0% | 4 | 0 | 0 | 0 | 30 | 30 | 1.00 |
| multiply_2digit_by_2digit.html | 25 | 25 | 100.0% | 7 | 0 | 0 | 0 | 25 | 25 | 1.00 |
| multiply_2x2_complete_missing_steps.html | 37 | 37 | 100.0% | 28 | 0 | 0 | 0 | 37 | 25 | 0.68 |
| multiply_numbers_ending_in_zeroes.html | 21 | 21 | 100.0% | 8 | 0 | 0 | 0 | 21 | 17 | 0.81 |
| properties_of_multiplication.html | 24 | 24 | 100.0% | 4 | 0 | 0 | 0 | 24 | 20 | 0.83 |
| subtract_numbers_up_to_five_digits.html | 21 | 21 | 100.0% | 13 | 0 | 0 | 0 | 21 | 14 | 0.67 |
| use_perimeter_to_determine_cost.html | 20 | 20 | 100.0% | 3 | 0 | 0 | 0 | 20 | 20 | 1.00 |

---

## §2 — HINTS THAT LEAK THE ANSWER (ISSUES #64)

Every hint rung of every hinted question was tested for the answer, per type, using
the exact matching logic of `tools/verify-content-guards.js` (whole-token match for
numerics so `40` does not match inside `408`; substring for text; plus its
unit-conversion and classification heuristics). That guard runs inside `npm test`,
so a clean result is expected.

**Result: 0 leaking rungs.** Every rung of all 2649 hinted questions was tested; none exposes its question's answer.

> **Coverage note / UNMEASURED.** This is the same mechanical matcher the project
> ships; per `verify-content-guards.js`'s own comments it catches numeric-token,
> substring, unit-conversion and classification leaks but *cannot reason about
> meaning* — a semantically-leaking rung that never states the answer verbatim is
> outside its reach and outside this census. Full semantic coverage is human review
> (CLAUDE.md §13.3), not measured here.

---

## §3 — THE whyWrong GAP, MEASURED AGAINST RULE 16

### 3a — The real gap (single-select + multi-select ONLY)

Of **1674** select questions that have at least one distractor
(6 select questions have zero distractors — every option correct — and are excluded):

- **full whyWrong** (every wrong option covered): **309**
- **partial** (some options covered, some not): **0**
- **none** (no wrong option covered): **1365**  ← **the true size of the authoring job**

Note the partial count is **0**: in this corpus a select question either has whyWrong
on every distractor or on none. There is no half-authored lesson.

### 3b — Debt that is NOT debt (hint-carried by Rule 16)

Fill-blanks / order / sequence-build / categorize questions with no whyWrong:
**900** — reported here as `NOT-DEBT-PER-RULE-16`. These are hint-carried by
ruling; their absence of whyWrong is not authoring debt and must never be added to the gap.

### 3c — whyWrong that should not exist (on a non-select type)

**None.** No whyWrong was found on any non-select question.

### 3d — DISTRACTOR PATTERN COUNT (the decisive measurement)

For single-select + multi-select questions **whose answer and options are all
numeric AND have exactly one correct value**, `wrong − correct` was computed for
every wrong option and the DISTINCT differences counted per lesson.

- lessons containing measurable numeric-select questions: **78**
- measurable numeric-select questions: **872** · total wrong options: **2390**
- **`NON-NUMERIC`**: 722 select questions across 77 lessons have non-numeric options (e.g. `lt`/`gt`, words, labels) — no difference computable.
- **numeric multi-correct** (numeric options but >1 correct value, so `wrong − correct` is undefined): 86 questions across 27 lessons — flagged, not differenced.

**Ten lessons with the FEWEST distinct differences** (difference values shown — a short,
regular list is the signature of a single generable misconception family such as a missed carry):

| lesson | numeric Q | wrong opts | distinct diffs | the differences |
|---|---:|---:|---:|---|
| incoming/Understanding_probability_remix.html | 3 | 5 | 2 | -1, 1 |
| incoming/Unit_prices_remix.html | 13 | 13 | 2 | -1, 1 |
| incoming/Properties_of_addition_full30.html | 1 | 3 | 3 | -25, -2, 2 |
| incoming/Properties_of_addition_new8.html | 1 | 3 | 3 | -25, -2, 2 |
| incoming/select-area-remix.html | 8 | 14 | 3 | -1, 1, 2 |
| incoming/estimate-sums-faithful.html | 2 | 6 | 4 | -1000, 120, 137, 1000 |
| identify_faces_of_3d_figures.html | 3 | 7 | 4 | -2, -1, 1, 2 |
| incoming/Simple fractions - what fraction does the shape show.html | 4 | 12 | 4 | -2, -1, 1, 2 |
| incoming/Choose-numbers-with-a-particular-difference-30-remix.html | 14 | 42 | 4 | -1, 1, 10, 100 |
| incoming/divide-larger-numbers.html | 4 | 8 | 5 | -90, -1, 1, 2, 36 |

**Ten lessons with the MOST distinct differences** (a long, irregular list means the
distractors do NOT fall into a small pattern — no misconception name is inferred here):

| lesson | numeric Q | wrong opts | distinct diffs |
|---|---:|---:|---:|
| mixed_operations_word_problems.html | 20 | 60 | 53 |
| incoming/Estimate quotients - word problems.html | 21 | 63 | 49 |
| incoming/multiply-a-two-digit-number-by-a-three-digit-number-word-problems.html | 16 | 48 | 48 |
| incoming/multi-step-word-problems-mcq.html | 25 | 75 | 45 |
| incoming/place_values_unit_conversion_remix.html | 20 | 60 | 44 |
| money_add_subtract_multiply_divide.html | 18 | 54 | 44 |
| incoming/price-lists-with-multiplication.html | 14 | 42 | 42 |
| incoming/Multiply_1x2_remix.html | 23 | 69 | 38 |
| incoming/interpret-remainders.html | 29 | 86 | 35 |
| incoming/geometric_patterns_remix.html | 13 | 39 | 35 |

**15 of the 78 lessons with numeric-select questions fall into 5 or fewer distinct differences.**
The remaining lessons' differences are more varied; several (see the MOST table) are
plainly unpatterned and no misconception family is asserted for them.

### 3 — per-lesson whyWrong table

| lesson | select Q | full | partial | none | NOT-DEBT | numeric Q | distinct diffs | non-numeric Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| _type-coverage.html | 10 | 1 | 0 | 9 | 9 | 6 | 13 | 3 |
| add_5digit_word_problems.html | 17 | 0 | 0 | 17 | 15 | 13 | 11 | 4 |
| Addition_patterns_over_increasing_place_values.html | 5 | 0 | 0 | 5 | 21 | 2 | 6 | 3 |
| compare_convert_metric_volume.html | 11 | 11 | 0 | 0 | 11 | 3 | 9 | 8 |
| compare_numbers_up_to_five_digits.html | 19 | 19 | 0 | 0 | 11 | 3 | 9 | 11 |
| estimate_differences_word_problems.html | 16 | 16 | 0 | 0 | 6 | 11 | 9 | 5 |
| estimate_products_word_problems.html | 10 | 10 | 0 | 0 | 10 | 10 | 17 | 0 |
| find_the_probability.html | 23 | 23 | 0 | 0 | 7 | 0 | — | 23 |
| frequency_tables.html | 13 | 13 | 0 | 0 | 5 | 8 | 19 | 4 |
| identify_faces_of_3d_figures.html | 8 | 8 | 0 | 0 | 8 | 3 | 4 | 2 |
| incoming/add-subtract-multiply-divide-remix-expanded.html | 17 | 17 | 0 | 0 | 11 | 17 | 21 | 0 |
| incoming/addition-missing-digits.html | 0 | 0 | 0 | 0 | 27 | 0 | — | 0 |
| incoming/am-or-pm_remix.html | 14 | 0 | 0 | 14 | 4 | 0 | — | 14 |
| incoming/area-and-perimeter-word-problems.html | 23 | 0 | 0 | 23 | 2 | 0 | — | 23 |
| incoming/bar_graphs_remix.html | 22 | 0 | 0 | 22 | 8 | 6 | 10 | 16 |
| incoming/box_multiplication_remix.html | 13 | 0 | 0 | 13 | 12 | 13 | 35 | 0 |
| incoming/Choose numbers with a particular quotient.html | 18 | 0 | 0 | 18 | 13 | 14 | 25 | 4 |
| incoming/choose-numbers-sum-diff-prod-quot__remix.html | 4 | 0 | 0 | 4 | 19 | 0 | — | 0 |
| incoming/Choose-numbers-with-a-particular-difference-30-remix.html | 22 | 0 | 0 | 22 | 8 | 14 | 4 | 0 |
| incoming/choose-product_remix.html | 16 | 0 | 0 | 16 | 6 | 0 | — | 6 |
| incoming/choose-the-appropriate-metric-unit-of-measure.html | 22 | 0 | 0 | 22 | 0 | 0 | — | 22 |
| incoming/Compare_numbers_using_multiplication_remix.html | 24 | 0 | 0 | 24 | 6 | 20 | 31 | 4 |
| incoming/Compare-money-amounts.html | 16 | 0 | 0 | 16 | 8 | 0 | — | 16 |
| incoming/Complete_the_division_table.html | 0 | 0 | 0 | 0 | 30 | 0 | — | 0 |
| incoming/Count_vertices__edges_and_faces.html | 16 | 0 | 0 | 16 | 6 | 13 | 9 | 1 |
| incoming/Create figures with a given area.html | 11 | 0 | 0 | 11 | 1 | 6 | 5 | 3 |
| incoming/Create_line_plots_remix.html | 11 | 0 | 0 | 11 | 7 | 9 | 8 | 0 |
| incoming/Divide larger numbers - word problems.html | 22 | 0 | 0 | 22 | 3 | 16 | 21 | 6 |
| incoming/divide-larger-numbers.html | 6 | 0 | 0 | 6 | 18 | 4 | 5 | 2 |
| incoming/Divisibility_rules_remix.html | 15 | 0 | 0 | 15 | 12 | 3 | 7 | 7 |
| incoming/Division_facts_to_10.html | 12 | 0 | 0 | 12 | 4 | 7 | 10 | 5 |
| incoming/Elapsed_time_remix.html | 19 | 0 | 0 | 19 | 11 | 0 | — | 19 |
| incoming/equal-parts.html | 32 | 0 | 0 | 32 | 0 | 28 | 5 | 0 |
| incoming/Estimate quotients - word problems.html | 21 | 0 | 0 | 21 | 0 | 21 | 49 | 0 |
| incoming/estimate_differences_all.html | 24 | 0 | 0 | 24 | 18 | 18 | 12 | 6 |
| incoming/Estimate_sums__word_problems.html | 25 | 0 | 0 | 25 | 5 | 25 | 29 | 0 |
| incoming/estimate-products_remix.html | 17 | 0 | 0 | 17 | 3 | 16 | 28 | 1 |
| incoming/estimate-sums-differences-products-and-quotients-word-problems-remix.html | 18 | 0 | 0 | 18 | 6 | 18 | 24 | 0 |
| incoming/estimate-sums-faithful.html | 14 | 14 | 0 | 0 | 16 | 2 | 4 | 12 |
| incoming/estimate-sums-remix.html | 15 | 0 | 0 | 15 | 8 | 7 | 15 | 8 |
| incoming/even_odd_remix.html | 23 | 0 | 0 | 23 | 7 | 2 | 6 | 18 |
| incoming/find-start-and-end-times-remix.html | 14 | 0 | 0 | 14 | 3 | 0 | — | 14 |
| incoming/find-the-order-remix.html | 10 | 0 | 0 | 10 | 20 | 9 | 24 | 0 |
| incoming/find-two-numbers-based-on-sum-difference-product-and-quotient.html | 23 | 0 | 0 | 23 | 0 | 5 | 6 | 18 |
| incoming/geometric_patterns_remix.html | 19 | 0 | 0 | 19 | 11 | 13 | 35 | 5 |
| incoming/guess-and-check_lesson30.html | 15 | 0 | 0 | 15 | 15 | 15 | 6 | 0 |
| incoming/identify-three-dimensional-figures.html | 20 | 0 | 0 | 20 | 5 | 8 | 9 | 10 |
| incoming/increasing_number_pattern__remix.html | 19 | 0 | 0 | 19 | 18 | 19 | 8 | 0 |
| incoming/inequalities_remix.html | 8 | 0 | 0 | 8 | 0 | 8 | 5 | 0 |
| incoming/interpret-line-plots-remix.html | 16 | 0 | 0 | 16 | 8 | 13 | 11 | 0 |
| incoming/interpret-remainders.html | 29 | 29 | 0 | 0 | 0 | 29 | 35 | 0 |
| incoming/metric_mixed_units_remix.html | 18 | 0 | 0 | 18 | 13 | 0 | — | 18 |
| incoming/money_add_subtract_remix.html | 19 | 0 | 0 | 19 | 5 | 10 | 15 | 8 |
| incoming/multi-step-word-problems-mcq.html | 28 | 0 | 0 | 28 | 0 | 25 | 45 | 3 |
| incoming/Multiplication_facts_to_10_remix.html | 22 | 0 | 0 | 22 | 10 | 18 | 31 | 4 |
| incoming/multiplication-patterns-over-increasing-place-values.html | 12 | 0 | 0 | 12 | 9 | 9 | 24 | 3 |
| incoming/Multiply_1x2_remix.html | 23 | 0 | 0 | 23 | 6 | 23 | 38 | 0 |
| incoming/Multiply_1x3-4digit_REMIX.html | 12 | 0 | 0 | 12 | 22 | 12 | 24 | 0 |
| incoming/Multiply_two-digit_by_two-digit_word_problems__1to1.html | 0 | 0 | 0 | 0 | 26 | 0 | — | 0 |
| incoming/multiply-a-two-digit-number-by-a-three-digit-number-word-problems.html | 18 | 0 | 0 | 18 | 1 | 16 | 48 | 2 |
| incoming/multiply-a-two-digit-number-by-a-three-digit-number.html | 13 | 0 | 0 | 13 | 14 | 13 | 20 | 0 |
| incoming/names-for-numbers_remix.html | 23 | 0 | 0 | 23 | 7 | 9 | 23 | 14 |
| incoming/number-patterns-mixed-review-remix.html | 21 | 0 | 0 | 21 | 9 | 16 | 15 | 5 |
| incoming/number-patterns-word-problems-remix.html | 11 | 0 | 0 | 11 | 24 | 2 | 6 | 8 |
| incoming/ordinal-numbers-to-100th_remix.html | 5 | 0 | 0 | 5 | 7 | 0 | — | 5 |
| incoming/ordinal-numbers-to-100th_set2.html | 5 | 0 | 0 | 5 | 5 | 0 | — | 5 |
| incoming/perimeter_missing_side_remix.html | 15 | 0 | 0 | 15 | 10 | 13 | 17 | 2 |
| incoming/perimeter_remix.html | 16 | 0 | 0 | 16 | 13 | 0 | — | 16 |
| incoming/Place_values_remix.html | 16 | 0 | 0 | 16 | 14 | 13 | 30 | 3 |
| incoming/place_values_unit_conversion_remix.html | 24 | 0 | 0 | 24 | 8 | 20 | 44 | 4 |
| incoming/price-lists-with-multiplication.html | 17 | 0 | 0 | 17 | 3 | 14 | 42 | 3 |
| incoming/Properties_of_addition_full30.html | 13 | 0 | 0 | 13 | 17 | 1 | 3 | 12 |
| incoming/Properties_of_addition_new8.html | 5 | 0 | 0 | 5 | 3 | 1 | 3 | 4 |
| incoming/read_a_table.html | 24 | 0 | 0 | 24 | 6 | 11 | 25 | 13 |
| incoming/rotational_symmetry.html | 23 | 0 | 0 | 23 | 0 | 0 | — | 23 |
| incoming/round-money-amounts.html | 21 | 0 | 0 | 21 | 4 | 20 | 22 | 0 |
| incoming/rounding_remix.html | 25 | 0 | 0 | 25 | 5 | 23 | 16 | 0 |
| incoming/select-area-remix.html | 16 | 0 | 0 | 16 | 9 | 8 | 3 | 0 |
| incoming/Simple fractions - what fraction does the shape show.html | 30 | 0 | 0 | 30 | 0 | 4 | 4 | 24 |
| incoming/simple-fractions-30.html | 24 | 0 | 0 | 24 | 6 | 7 | 5 | 17 |
| incoming/simple-fractions-parts-of-a-group.html | 19 | 0 | 0 | 19 | 11 | 4 | 6 | 12 |
| incoming/Subtraction_missing_digits_remix.html | 0 | 0 | 0 | 0 | 32 | 0 | — | 0 |
| incoming/symmetry_remix.html | 5 | 0 | 0 | 5 | 2 | 3 | 6 | 1 |
| incoming/symmetry_set2.html | 12 | 0 | 0 | 12 | 3 | 5 | 7 | 5 |
| incoming/time_12_24_remix.html | 26 | 0 | 0 | 26 | 4 | 0 | — | 26 |
| incoming/Time_patterns_remix.html | 19 | 0 | 0 | 19 | 11 | 3 | 9 | 16 |
| incoming/time_units_remix.html | 11 | 0 | 0 | 11 | 5 | 0 | — | 11 |
| incoming/time_units_variations.html | 9 | 0 | 0 | 9 | 6 | 0 | — | 9 |
| incoming/transportation_24h_more15.html | 10 | 0 | 0 | 10 | 5 | 0 | — | 10 |
| incoming/transportation_24h_remix.html | 7 | 0 | 0 | 7 | 5 | 0 | — | 7 |
| incoming/transportation-schedules-12h-complete.html | 23 | 0 | 0 | 23 | 7 | 0 | — | 23 |
| incoming/Understanding_probability_remix.html | 23 | 0 | 0 | 23 | 7 | 3 | 2 | 18 |
| incoming/Unit_prices_remix.html | 22 | 0 | 0 | 22 | 5 | 13 | 2 | 9 |
| incoming/Word problems with extra or missing information.html | 24 | 0 | 0 | 24 | 0 | 0 | — | 24 |
| make_predictions.html | 11 | 11 | 0 | 0 | 12 | 4 | 5 | 7 |
| mixed_operations_word_problems.html | 26 | 26 | 0 | 0 | 0 | 20 | 53 | 6 |
| money_add_subtract_multiply_divide.html | 26 | 26 | 0 | 0 | 4 | 18 | 44 | 8 |
| multiply_2digit_by_2digit.html | 18 | 18 | 0 | 0 | 7 | 13 | 26 | 5 |
| multiply_2x2_complete_missing_steps.html | 9 | 9 | 0 | 0 | 28 | 5 | 12 | 4 |
| multiply_numbers_ending_in_zeroes.html | 13 | 13 | 0 | 0 | 8 | 9 | 18 | 4 |
| properties_of_multiplication.html | 20 | 20 | 0 | 0 | 4 | 6 | 16 | 14 |
| subtract_numbers_up_to_five_digits.html | 8 | 8 | 0 | 0 | 13 | 5 | 13 | 3 |
| use_perimeter_to_determine_cost.html | 17 | 17 | 0 | 0 | 3 | 16 | 20 | 1 |

---

## WHAT THIS MEANS FOR THE SIZE OF THE JOB

- **1365 questions need a whyWrong.** That is the true authoring gap — single-
  and multi-select questions (with distractors) that today cover no wrong option. It is
  NOT the old "84 lessons / every type" framing: 900 hint-only-type questions with no
  whyWrong are hint-carried by Rule 16 and are excluded.
- **15 lessons' distractors fall into 5 or fewer distinct patterns** — where the whyWrong
  message is largely generable from the arithmetic difference rather than hand-written.
  The other 63 numeric lessons are more varied, and many select questions are non-numeric or multi-correct so a large share still needs authored text.
- **7 questions have no hint in the hint-only types** (fill-blanks / order /
  sequence-build / categorize) — the Rule-16 blind spot where the hint is the only teaching.
- **0 leaking hints** were found by the shipped mechanical matcher (semantic leaks unmeasured).

In plain terms: the whyWrong job is roughly **1400** questions, not a few lines per lesson —
materially larger than the single hand-analysed lesson suggested. But a sizeable minority
of it is mechanically generable from distractor differences, and the hint gap is tiny (7).

*Findings only. Nothing was fixed, authored, or proposed as follow-up work.*
