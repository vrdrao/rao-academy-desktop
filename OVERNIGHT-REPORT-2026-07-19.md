# Overnight Run Report — 2026-07-19 (BRIEF-OVERNIGHT-CONVERSION)

Everything is LOCAL. Nothing was pushed. Venkat audits, then pushes.

## Headline

**16 of 21 Grade 4 sources converted** (388 questions, full enrichment on every
question), **5 on OVERLAP-HOLD** for your ruling. Corpus: **102 lessons / 2,687
questions → 118 / 3,075**. Grade 3: **198 documents ingested + capability scan
written** (Step 5 ran; Step 6 pilots — see PILOTS section). Full-suite banner:
see FULL SUITE below.

## PUSH-GATE DIAGNOSIS (Step 0)

- `node tools/verify-styles.js` standalone on the blocked tree: **EXIT 0, 108
  PASS lines, zero FAIL** — the push-time failure **did not reproduce**.
- Verdict: **flaky browser-process death**, as suspected. Corroboration: the
  crashed run left `review/__vf_select-area-1to1.html` (a verify-format temp
  page that is deleted on normal exit) stranded in the working tree. It is
  still there, untracked — delete at will.
- Nothing was fixed, per the brief. The morning `git push` retry should settle
  it (the pre-push hook reruns the full suite anyway).

## LEDGER — all 21 sources accounted for

| # | Source document | Outcome | Q | Commit |
|---|---|---|---|---|
| 1 | Data and graphs-Frequency tables(D) | CONVERTED → `lessons/frequency_tables.html` | 21 | 1bdd8ea |
| 2 | Geometric Measurements-Find the area of figures made of unit squares(D) | **OVERLAP-HOLD** — same skill as Select area 1to1 + remix | — | — |
| 3 | Geometric Measurements-Use perimeter to determine cost(D) | CONVERTED → `lessons/use_perimeter_to_determine_cost.html` | 20 | a5a29a4 |
| 4 | Geometry-Identify faces of three-dimensional figures(D) | CONVERTED → `lessons/identify_faces_of_3d_figures.html` | 16 | 4822430 |
| 5 | Geometry-Which three-dimensional figure is being described_(D) | **OVERLAP-HOLD (ruling reversed at conversion)** — 10/16 questions are face/edge/vertex counts = Count_vertices lesson's exact ground; 2 more duplicate #4; only ~6 fresh | — | — |
| 6 | LD-Subtraction-Estimate differences_ word problems(D) | CONVERTED → `lessons/estimate_differences_word_problems.html` | 22 | 61a7a94 |
| 7 | LDM- Money-Add, subtract, multiply and divide money amounts(D) | CONVERTED → `lessons/money_add_subtract_multiply_divide.html` | 30 | a277cd1 |
| 8 | LDM- Multipication-Estimate products_ word problems(D) | CONVERTED → `lessons/estimate_products_word_problems.html` | 20 | 983260d |
| 9 | LDM- Multipication-Multiply a two-digit number by a two-digit number(D) | CONVERTED → `lessons/multiply_2digit_by_2digit.html` | 25 | 74e1f64 |
| 10 | LDM- Multipication-…complete the missing steps(D) | CONVERTED → `lessons/multiply_2x2_complete_missing_steps.html` | 37 | d894f70 |
| 11 | LDM- Multipication-Multiply numbers ending in zeroes(D) | CONVERTED → `lessons/multiply_numbers_ending_in_zeroes.html` | 21 | 6a064ea |
| 12 | LDM- Number Sense-Compare numbers up to five digits(D) | CONVERTED → `lessons/compare_numbers_up_to_five_digits.html` | 30 | 220fc7b |
| 13 | LDM- Probability-Find the probability(D) | CONVERTED → `lessons/find_the_probability.html` | 30 | 4923de2 |
| 14 | LDM- Probability-Make predictions(D) | CONVERTED → `lessons/make_predictions.html` | 23 | 909b5ef |
| 15 | LDM- Subtraction-Subtract numbers up to five digits(D) | CONVERTED → `lessons/subtract_numbers_up_to_five_digits.html` | 21 | bbd5ba8 |
| 16 | LDM- Units of Measurement-Compare and convert metric units of mass(D) | **OVERLAP-HOLD (ruling reversed at conversion)** — document is **MISLABELED: titled mass, contains only LENGTH** (mm/cm/dm/m/km); overlaps metric_mixed_units_remix + choose-the-appropriate-metric-unit; only novelty is decimetres | — | — |
| 17 | LDM- Units of Measurement-Compare and convert metric units of volume(D) | CONVERTED → `lessons/compare_convert_metric_volume.html` | 22 | d8f1f7b |
| 18 | LDM-Mixed Operations-Mentally add and subtract numbers ending in zeroes(D) | **OVERLAP-HOLD** — addition half is literally Addition_patterns_over_increasing_place_values; subtraction half uncovered (a subtraction-only remix is possible if you rule it) | — | — |
| 19 | LDM-Multipication-Multiply 1-digit numbers by larger numbers(D) | **OVERLAP-HOLD** — same known-fact-scaffold skill as Multiply_1x2_remix + Multiply_1x3-4digit_REMIX | — | — |
| 20 | LDM-Multipication-Properties of multiplication(D) | CONVERTED → `lessons/properties_of_multiplication.html` | 24 | f863b85 |
| 21 | Mixed Operations-Addition, subtraction, multiplication and division word problems(D) | CONVERTED → `lessons/mixed_operations_word_problems.html` | 26 | 1902cd3 |

Supporting commits: e92a764 (source ingest + brief archived), d358d46 (G3
ingest), ac0ea12 (G3 scan), plus this report's commit.

## BEFORE → AFTER (the arithmetic)

- BEFORE: 102 lessons / 2,687 questions.
- Added: 16 lessons; questions 21+20+16+22+30+20+25+37+21+30+30+23+21+22+24+26 = **388**.
- AFTER: 102+16 = **118 lessons**; 2,687+388 = **3,075 questions**.
- Manifest and review/index.html both read 118 / 3,075. Every number moved
  through per-lesson commits listed above — no out-of-ledger movement.

## Enrichment coverage (per-lesson self-check, all 16)

Every converted question carries: a 3-rung hint ladder (orient / method /
nearly-does-it), `whyWrong` with a taxonomy code for **every** incorrect
option of every select question, a stepped solution ending in takeaway +
verification, and an `explain` line. Every answer key was recomputed
independently (arithmetic in script with asserts where formulaic; SVG
geometry read for figure-dependent keys — bar heights, tally counts, spinner
slices, marble counts, arc angles, number-line ticks). Interaction mixes per
lesson are in the per-commit messages; the bank-wide mix stays diverse
(selects, fill-blanks incl. column/round-scaffold layouts, order,
sequence-build, categorize bins+venn2, line-plot, bar-graph).

## Taxonomy changes (docs/MISCONCEPTIONS.md)

- **Added:** WRONG_MEASUREMENT_FOR_JOB, WRONG_ERROR_DIAGNOSIS,
  MULTIPLIED_NOT_DIVIDED (commit a5a29a4); WRONG_OPERATION_CHOSEN (1902cd3).
- **Status change:** MONEY_WRONG_OPERATION dormant → LIVE (a277cd1).

## ENGINE-REQUESTS (no engine was touched; wishlist only)

1. `layout: steps` — labelled multi-step fill-blanks scaffold (perimeter-cost Q6).
2. `data-show="solid-3d"` — interactive spin-and-tap solid; 12 of 16 questions
   in lesson 4822430 wanted it (static SVGs substituted).
3. Two-row partial-product scaffold — `layout: multiply` with
   `blank: ones|tens|total` (26 questions re-authored as inline blanks).
4. `data-show="compare-expr"` — comparison expression figure (10 questions
   moved the expression into the prompt).
5. `layout: fraction` — stacked fraction input (3 questions → inline []/[]).
6. `data-show` marbles / coin / die — replaced with hand-drawn inline SVGs.
7. `layout: table` + `focus:` line — unit-conversion tables with blank cells
   and a highlighted expression row (volume lesson; re-authored inline).

## Content fixes made during conversion (disclosed)

- **Answer leak (source bug):** Compare-numbers Q5's number line printed the
  46,000 label directly beneath the arrow the child must identify — label
  removed; value stays inferable from neighbouring ticks (220fc7b).
- **Prompt fix:** Find-the-probability Q6 asked "blue or pink" on a spinner
  with no blue — reworded to "pink"; key unchanged at 3/4 (4923de2).
- The **hint-leak guard fired 4 times** across the night (an "eliminate"
  phrasing, an answer digit inside a quoted equation, a bin key word, key
  values echoed in rungs) — each reworded before commit. The guard is alive
  and biting; every firing is disclosed in its lesson's commit message.

## Deviations & judgment calls

- **Question counts below 30:** the brief inherits CLAUDE.md's 30-question
  floor; the sources ship 16–37 questions with already-diverse interaction
  mixes. I converted at source count and did **not** pad — inventing 5–14
  questions per lesson at 3 a.m. multiplies audit surface, and the standing
  rule says fill gaps, never pad. Flagging explicitly for the audit.
- **Two Step-2 rulings reversed at conversion time** (sources 5 and 16, table
  above) once content contradicted the title-level ruling. Both are HOLDs, not
  conversions — nothing was double-created.
- The stranded `review/__vf_select-area-1to1.html` temp file and this brief's
  original `(1)`-suffixed filename were the only unexpected items in the
  starting tree; the brief was archived to `docs/briefs/` (clean name) in
  e92a764.
- `npm test` (full suite) was started after the final Grade 4 lesson commit;
  the two later commits are docs/sources-only (no lesson/engine/tool changes).

## GRADE 3 (Steps 5–6)

- `word-staging/grade3/` existed → Step 5 ran. **198 .docx documents** in 24
  topic folders ingested to `sources-g3/` (d358d46).
- **Scan:** `docs/GRADE3-CAPABILITY-SCAN.md` (ac0ea12) — 24 capability rows:
  **18 SUPPORTED / 6 GAP-or-inspect**; ~170 of 198 documents convertible today
  with zero engine work. Suspected drafts (underscore-prefixed files, one
  trailing-`_3` file) and ~20 cross-grade twins flagged — nothing deleted.
- **PILOTS (Step 6):** NOT attempted. The Grade 3 sources are screenshot-based
  Word documents (unlike the Grade 4 batch, which arrived pre-converted as
  HTML): a faithful pilot requires per-image reading and answer verification,
  and remaining overnight capacity was not enough to do even one lesson at
  full enrichment standard without rushing. Per the brief — "never rush a
  lesson to finish the list" — pilots are left for the Grade 3 chat, with the
  scan's three recommended zero-gap candidates named in its closing section.

## FULL SUITE (Step 4) — ran twice; final run GREEN

**Run 1** (after the last conversion) FAILED one law and the failure was real:
verify-calm's **g. EXPLAIN PRECEDENCE** flagged 2 questions
(identify_faces q2, perimeter-cost q2) where my frontmatter `explain:`
opened with the same 25 characters as the source's in-markup explain, making
the markup-wins assertion undecidable. Banner: "1 law(s) VIOLATED — DO NOT
SHIP". The two frontmatter explains were reworded (markup text untouched —
it is what renders), reviews regenerated, committed as **845155c**.

**Run 2** (final tree, exit code captured directly): **`npm test` exit 0**. Banners:

```
NODE GRADING GATE  engine rao-master-19 · 118 lessons · 3075 questions
NODE GRADING: all keys grade correct and reject wrong — OK to commit
ENGINE rao-master-19 — SAFE TO SHIP ✅        (harness: render/grade/reject/themes per lesson)
all 117 match the lesson format               (verify-format, review pages)
selection styling is clean                    (verify-styles)
TOUCH: the calm card works with real touch events at 380px ✅
CALM CARD: all laws hold ✅
ROBO: rig, ladder, silence, stuck-child, touch — all hold ✅
```

## Integrity hashes (audit anchors)

- `LESSONS-MANIFEST.md` — md5 `afb32500400992bcc4c147e370ab1820`, 19,619 bytes.
- `review/index.html` — md5 `948dff454a4accb94f9f7930e74349c8`, 15,695 bytes.
- Final tree HEAD at report time: 845155c (this report's commit follows it).
