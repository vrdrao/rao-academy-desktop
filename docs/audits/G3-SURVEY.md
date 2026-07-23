# BRIEF-G3-SURVEY — read-only reconnaissance of the Grade 3 source

Executed 2026-07-20. READ-ONLY: nothing created, modified, moved, committed or
pushed except this one report file (`docs/audits/G3-SURVEY.md`, explicitly
permitted by the brief). Every number below is traceable to a listing command.

No effort, duration, or timeline estimate appears anywhere in this report, by
instruction.

---

## Task A — the two-locations verdict

**They are byte-for-byte identical. Neither is "more complete"; they are twins.**

| location | files | bytes | formats |
|---|---|---|---|
| `C:\Users\Venkat Rao\Desktop\word-staging\word docs-g3\` | 198 | 52,659,112 | 198 `.docx` |
| repo `sources-g3/` (untracked) | 198 | 52,659,112 | 198 `.docx` |

Evidence, strongest last:
- Same file count (198) and same total bytes (52,659,112).
- `(relative-path | size)` manifests of both trees diff to **0 lines** — every
  file sits at the same sub-path with the same size.
- Basename overlap: **198 in both, 0 unique to either.**
- **Full md5 content compare:** per-file `(path | md5)` of both trees diff to
  **0 lines**; 198 distinct hashes on each side (no internal duplicates within a
  tree either). Content is identical, not merely same-sized.

So this is **not** the `deploy-drop/` / `_1to1` two-location hazard — there is no
divergence to reconcile. `word-staging\word docs-g3\` and `sources-g3/` are the
same corpus in two places. **Which one is canonical is Venkat's ruling; nothing
was moved or deleted.**

> Scope note: `word-staging\` also contains `word docs-g2`, `word docs-g5`,
> `word docs-g6`, `word docs-g7` (Grades 2/5/6/7). Out of scope — listed for
> awareness only, not surveyed.

---

## Task B — what `extracted/` and `Not needed/` hold

**These are NOT Grade 3, and no Grade 3 processing has begun.** They are
leftover **Grade 4** pipeline artifacts, mis-attributed by the brief's premise.

- `word-staging\extracted\` — **21 `.html` files** (converted HTML lesson
  extractions, ~119–255 KB each). No images/text folders; the questions are
  already-converted HTML.
- `word-staging\Not needed\` — **22 files**: one `extract-lessons.ps1` (a 4,475-byte
  PowerShell extraction script), one `.html`, and **20 `.zip` archives** (the raw
  downloaded `files (NN).zip…` bundles).

**Proof they are Grade 4, not Grade 3:** every sampled title in `extracted/`
resolves to an existing Grade-4 source in the repo's `sources/` directory —
"Subtract numbers up to five digits", "Compare and convert metric units of mass",
"Find the probability", "Multiply a two-digit number by a two-digit number",
"Compare numbers up to five digits" (all 5/5 FOUND in `sources/`). These are
five-digit / 2×2-multiplication skills — Grade 4. The actual Grade 3 documents
are named "Class 3 - …" and are all `.docx` in `word docs-g3\` / `sources-g3\`;
**none of them appears in `extracted/` or `Not needed/`.**

Stage reached by that pipeline: it produced the **Grade 4** HTML corpus (the
`.docx → zip → .html` path visible here). It has **no bearing on Grade 3** — for
Grade 3, nothing has been extracted, converted, or processed. There is no G3
partial pipeline to avoid rebuilding.

---

## Task C — the skill inventory

### Format (measured across all 198 docs)

**Every Grade 3 question is a screenshot.** All 198 `.docx` carry image anchors
(`<w:drawing>`, 1–36 per doc); `document.xml` contains **zero** typed question
text (`<w:t>` runs = 0 for the questions). 22 docs carry 1–4 stray text runs —
a heading only, never a typed question. This matches the Grade 4 pattern
("every question is a screenshot").

- **Question count in doc** below is the **image-anchor count** — a proxy, and
  context only (our output is always 30 regardless). It may slightly over- or
  under-count where a doc has a non-question figure or a multi-part image.
- **Number ceiling** is **title-derived**. Because questions are screenshots
  with no readable text, the ceiling the doc *actually works within* lives inside
  the images and was **NOT read** in this survey. Where a title states a band
  ("up to three digits") it is recorded; where it does not, the cell is `—`
  (**content-level ceiling UNMEASURED** — would require reading the screenshots).

### Full document table (198 rows)

| topic | document (skill) | ceiling (title-derived) | q-count (image proxy) | format |
|---|---|---|---|---|
| Addition | Add two numbers up to three digits - word problems | 3-digit (<1000) | img×16 | screenshot |
| Addition | Add two numbers up to three digits | 3-digit (<1000) | img×13 | screenshot |
| Addition | Addition_ fill in the missing digits | — | img×28 | screenshot |
| Addition | Add three or more numbers up to three digits - word problems | 3-digit (<1000) | img×14 | screenshot |
| Addition | Add three or more numbers up to three digits each | 3-digit (<1000) | img×20 | screenshot |
| Addition | Addition input_output tables - up to three digits | 3-digit (<1000) | img×13 | screenshot |
| Addition | Addition patterns over increasing place values | — | img×14 | screenshot |
| Addition | Balance addition equations - up to three digits | 3-digit (<1000) | img×15 | screenshot |
| Addition | Complete the addition sentence - up to three digits | 3-digit (<1000) | img×14 | screenshot |
| Data and graphs | Count shapes in a Venn diagram | — | img×20 | screenshot |
| Data and graphs | Create line plots | — | img×21 | screenshot |
| Data and graphs | Interpret line plots | — | img×16 | screenshot |
| Data and graphs | Interpret pictographs | — | img×27 | screenshot |
| Data and graphs | Sort shapes into a Venn diagram | — | img×16 | screenshot |
| Division fluency | Division facts for 2, 3, 4, 5, 10 | facts ≤ 10–12 | img×21 | screenshot |
| Division fluency | Division facts for 2, 3, 4, 5, 10_ sorting | facts ≤ 10–12 | img×22 | screenshot |
| Division fluency | Division facts for 2, 3, 4, 5, 10_ true or false_ | facts ≤ 10–12 | img×21 | screenshot |
| Division fluency | Division facts for 6, 7, 8, 9 | facts ≤ 10–12 | img×19 | screenshot |
| Division fluency | Division facts for 6, 7, 8, 9_ sorting | facts ≤ 10–12 | img×16 | screenshot |
| Division fluency | Division facts for 6, 7, 8, 9_ true or false_ | facts ≤ 10–12 | img×15 | screenshot |
| Division fluency | Division facts up to 10 | facts ≤ 10–12 | img×18 | screenshot |
| Division fluency | Division facts up to 10_ find the missing number | facts ≤ 10–12 | img×15 | screenshot |
| Division fluency | Division facts up to 10_ sorting | facts ≤ 10–12 | img×25 | screenshot |
| Division fluency | Division facts up to 10_ true or false_ | facts ≤ 10–12 | img×22 | screenshot |
| Division fluency | Division sentences up to 10_ true or false_ | — | img×19 | screenshot |
| Division skill builders | Divide by 1 | facts ≤ 10–12 | img×15 | screenshot |
| Division skill builders | Divide by 10 | facts ≤ 10–12 | img×19 | screenshot |
| Division skill builders | Divide by 2 | facts ≤ 10–12 | img×16 | screenshot |
| Division skill builders | Divide by 3 | facts ≤ 10–12 | img×22 | screenshot |
| Division skill builders | Divide by 4 | facts ≤ 10–12 | img×19 | screenshot |
| Division skill builders | Divide by 5 | facts ≤ 10–12 | img×21 | screenshot |
| Division skill builders | Divide by 6 | facts ≤ 10–12 | img×16 | screenshot |
| Division skill builders | Divide by 7 | facts ≤ 10–12 | img×16 | screenshot |
| Division skill builders | Divide by 8 | facts ≤ 10–12 | img×20 | screenshot |
| Division skill builders | Divide by 9 | facts ≤ 10–12 | img×20 | screenshot |
| Division | Complete the division table | — | img×12 | screenshot |
| Division | Divisibility rules for 2, 5 and 10 | — | img×22 | screenshot |
| Division | Division input_output tables | — | img×14 | screenshot |
| Division | Division word problems | — | img×22 | screenshot |
| Estimation and rounding | Estimate differences | — | img×12 | screenshot |
| Estimation and rounding | Estimate differences_ word problems | — | img×14 | screenshot |
| Estimation and rounding | Estimate products | — | img×16 | screenshot |
| Estimation and rounding | Estimate products_ word problems | — | img×14 | screenshot |
| Estimation and rounding | Estimate sums, differences and products_ word problems | — | img×12 | screenshot |
| Estimation and rounding | Estimate sums | — | img×17 | screenshot |
| Estimation and rounding | Estimate sums_ word problems | — | img×12 | screenshot |
| Estimation and rounding | Round money amounts | — | img×17 | screenshot |
| Estimation and rounding | Rounding puzzles | — | img×20 | screenshot |
| Estimation and rounding | Rounding | — | img×22 | screenshot |
| Geometry | Count and compare sides and vertices | — | img×19 | screenshot |
| Geometry | Count vertices, edges and faces | — | img×12 | screenshot |
| Geometry | Find the area of rectangles and squares | — | img×14 | screenshot |
| Geometry | Find the missing side length of a rectangle | — | img×13 | screenshot |
| Geometry | Identify faces of three-dimensional shapes | — | img×18 | screenshot |
| Geometry | Identify three-dimensional shapes | — | img×23 | screenshot |
| Geometry | Identify two-dimensional shapes | — | img×22 | screenshot |
| Geometry | Is it a polygon_ | — | img×23 | screenshot |
| Geometry | Maps | — | img×19 | screenshot |
| Geometry | Reflection, rotation and translation | — | img×23 | screenshot |
| Geometry | Symmetry | — | img×18 | screenshot |
| Logical reasoning | Age puzzles | — | img×13 | screenshot |
| Logical reasoning | Find the order | — | img×12 | screenshot |
| Logical reasoning | Find two numbers based on sum and difference | — | img×10 | screenshot |
| Logical reasoning | Find two numbers based on sum, difference, product and quotient | — | img×12 | screenshot |
| Logical reasoning | Guess the number | — | img×13 | screenshot |
| Logical reasoning | Largest_smallest number possible | — | img×12 | screenshot |
| Measurement | Compare and convert metric units of length | — | img×16 | screenshot |
| Measurement | Compare weight and capacity | — | img×24 | screenshot |
| Measurement | Conversion tables | — | img×13 | screenshot |
| Measurement | Holds more or less | — | img×18 | screenshot |
| Measurement | Light and heavy | — | img×20 | screenshot |
| Measurement | Measure using a centimetre ruler | — | img×29 | screenshot |
| Measurement | Metric mixed units | — | img×16 | screenshot |
| Measurement | Read a thermometer | — | img×12 | screenshot |
| Measurement | Reasonable temperature | — | img×23 | screenshot |
| Measurement | Which metric unit of length is appropriate_ | — | img×23 | screenshot |
| Mixed operations | Add and subtract data from tables | — | img×21 | screenshot |
| Mixed operations | Add, subtract, multiply and divide | — | img×14 | screenshot |
| Mixed operations | Addition, subtraction, multiplication and division facts | — | img×24 | screenshot |
| Mixed operations | Addition, subtraction, multiplication and division word problems | — | img×23 | screenshot |
| Mixed operations | Complete the addition, subtraction, multiplication or division sentence | — | img×23 | screenshot |
| Mixed operations | Multi-step word problems | — | img×12 | screenshot |
| Mixed operations | Multiplication and division facts up to 10_ true or false_ | facts ≤ 10–12 | img×20 | screenshot |
| Mixed operations | Multiplication and division facts up to 12_ true or false_ | facts ≤ 10–12 | img×18 | screenshot |
| Mixed operations | Multiplication and division facts up to 5_ true or false_ | facts ≤ 10–12 | img×25 | screenshot |
| Mixed operations | Multiplication and division sentences up to 12_ true or false_ | — | img×19 | screenshot |
| Mixed operations | Numerical operations_ find the missing sign | — | img×19 | screenshot |
| Money | Add and subtract money amounts | money (rupees) | img×22 | screenshot |
| Money | Add money amounts - word problems | money (rupees) | img×21 | screenshot |
| Money | Count coins and notes - up to 500-rupee note | money ≤ ~1000 | img×36 | screenshot |
| Money | Inequalities with money | money (rupees) | img×22 | screenshot |
| Money | Making change | money (rupees) | img×19 | screenshot |
| Money | Price lists | money (rupees) | img×15 | screenshot |
| Money | Purchases - do you have enough money - up to 1,000 rupees | money ≤ ~1000 | img×19 | screenshot |
| Money | Put money amounts in order | money (rupees) | img×19 | screenshot |
| Money | Which picture shows more_ | money (rupees) | img×18 | screenshot |
| Multiplication fluency | Multiplication facts for 2, 3, 4, 5 and 10 | facts ≤ 10–12 | img×21 | screenshot |
| Multiplication fluency | Multiplication facts for 6, 7, 8 and 9 | facts ≤ 10–12 | img×27 | screenshot |
| Multiplication fluency | Multiplication facts for 6, 7, 8, 9_ sorting | facts ≤ 10–12 | img×20 | screenshot |
| Multiplication fluency | Multiplication facts for 6, 7, 8, 9_ true or fals | facts ≤ 10–12 | img×28 | screenshot |
| Multiplication fluency | Multiplication facts up to 10 | facts ≤ 10–12 | img×24 | screenshot |
| Multiplication fluency | Multiplication facts up to 10_ true or false_ | facts ≤ 10–12 | img×18 | screenshot |
| Multiplication fluency | Multiplication facts for 2, 3, 4, 5, 10_ sorting | facts ≤ 10–12 | img×29 | screenshot |
| Multiplication fluency | Multiplication facts for 2, 3, 4, 5, 10_ true or false_ | facts ≤ 10–12 | img×23 | screenshot |
| Multiplication fluency | Multiplication facts up to 10_ find the missing factor | facts ≤ 10–12 | img×18 | screenshot |
| Multiplication fluency | Multiplication facts up to 10_ select the missing factors | facts ≤ 10–12 | img×24 | screenshot |
| Multiplication fluency | Multiplication facts up to 10_ sorting | facts ≤ 10–12 | img×24 | screenshot |
| Multiplication fluency | Multiplication sentences up to 10_ true or false_3 | — | img×19 | screenshot |
| Multiplication fluency | Squares up to 10 x 10 | facts ≤ 10–12 | img×17 | screenshot |
| Multiplication skill builders | Multiply by 1 | facts ≤ 10–12 | img×24 | screenshot |
| Multiplication skill builders | Multiply by 10 | facts ≤ 10–12 | img×30 | screenshot |
| Multiplication skill builders | Multiply by 3 | facts ≤ 10–12 | img×27 | screenshot |
| Multiplication skill builders | Multiply by 5 | facts ≤ 10–12 | img×24 | screenshot |
| Multiplication skill builders | Multiply by 6 | facts ≤ 10–12 | img×24 | screenshot |
| Multiplication skill builders | Multiply by 7 | facts ≤ 10–12 | img×22 | screenshot |
| Multiplication skill builders | Multiply by 0 | facts ≤ 10–12 | img×24 | screenshot |
| Multiplication skill builders | Multiply by 2 | facts ≤ 10–12 | img×27 | screenshot |
| Multiplication skill builders | Multiply by 4 | facts ≤ 10–12 | img×18 | screenshot |
| Multiplication skill builders | Multiply by 8 | facts ≤ 10–12 | img×23 | screenshot |
| Multiplication skill builders | Multiply by 9 | facts ≤ 10–12 | img×16 | screenshot |
| Multiplication | Box multiplication | — | img×23 | screenshot |
| Multiplication | Lattice multiplication | — | img×1 | screenshot |
| Multiplication | Multiplication input_output tables | — | img×16 | screenshot |
| Multiplication | Multiplication sentences | — | img×31 | screenshot |
| Multiplication | Multiplication word problems | — | img×24 | screenshot |
| Multiplication | Multiplication word problems_ find the missing factor | — | img×19 | screenshot |
| Multiplication | Multiply numbers ending in zeroes | — | img×22 | screenshot |
| Multiplication | Multiply one-digit numbers by three-digit numbers | — | img×27 | screenshot |
| Multiplication | Multiply one-digit numbers by three-digit numbers_ word problems | — | img×15 | screenshot |
| Multiplication | Multiply one-digit numbers by two-digit numbers | — | img×29 | screenshot |
| Multiplication | Multiply one-digit numbers by two-digit numbers_ word problems | — | img×21 | screenshot |
| Numbers and comparing | Put numbers in order | — | img×31 | screenshot |
| Numbers and comparing | Which number is greatest_least_ | — | img×25 | screenshot |
| Numbers and comparing | Comparing numbers | — | img×22 | screenshot |
| Numbers and comparing | Even or odd_ arithmetic rules | — | img×24 | screenshot |
| Numbers and comparing | Ordinal numbers to 100th | to 100th | img×25 | screenshot |
| Numbers and comparing | Skip-counting puzzles | — | img×31 | screenshot |
| Numbers and comparing | Even or odd | — | img×27 | screenshot |
| Numbers and comparing | Number sequences | — | img×27 | screenshot |
| Numbers and comparing | Write numbers in words | — | img×24 | screenshot |
| Patterns | Complete a repeating pattern | — | img×24 | screenshot |
| Patterns | Find the next row in a growing pattern | — | img×16 | screenshot |
| Patterns | Find the next shape in a pattern | — | img×24 | screenshot |
| Patterns | Growing patterns | — | img×14 | screenshot |
| Patterns | Make a repeating pattern | — | img×14 | screenshot |
| Patterns | Repeating patterns | — | img×16 | screenshot |
| Place values | Place value names up to hundreds | hundreds | img×24 | screenshot |
| Place values | Value of a digit | — | img×27 | screenshot |
| Place values | Convert between place values | — | img×34 | screenshot |
| Place values | Convert from expanded form | — | img×24 | screenshot |
| Place values | Convert to_from a number | — | img×28 | screenshot |
| Place values | Place value models up to hundreds | hundreds | img×28 | screenshot |
| Place values | Place value names up to thousands | thousands | img×24 | screenshot |
| Place values | Place value word problems | — | img×16 | screenshot |
| Place values | Convert between standard and expanded form | — | img×31 | screenshot |
| Probability | Certain, probable, unlikely and impossible | — | img×25 | screenshot |
| Probability | Combinations | — | img×27 | screenshot |
| Probability | More, less and equally likely | — | img×26 | screenshot |
| Properties | Addition, subtraction, multiplication and division terms | — | img×16 | screenshot |
| Properties | Distributive property_ find the missing factor | — | img×17 | screenshot |
| Properties | Multiply using the distributive property | — | img×18 | screenshot |
| Properties | Properties of addition | — | img×30 | screenshot |
| Properties | Properties of multiplication | — | img×15 | screenshot |
| Properties | Relate addition and multiplication | — | img×14 | screenshot |
| Properties | Relate multiplication and division | — | img×19 | screenshot |
| Properties | Solve using properties of addition | — | img×24 | screenshot |
| Properties | Solve using properties of multiplication | — | img×33 | screenshot |
| Properties | Understanding parentheses | — | img×27 | screenshot |
| Subtraction | Balance subtraction equations - up to three digits | 3-digit (<1000) | img×16 | screenshot |
| Subtraction | Subtraction input_output tables - up to three digits | 3-digit (<1000) | img×14 | screenshot |
| Subtraction | Complete the subtraction sentence - up to three digits | 3-digit (<1000) | img×11 | screenshot |
| Subtraction | Subtract numbers up to three digits - word problems | 3-digit (<1000) | img×15 | screenshot |
| Subtraction | Subtract numbers up to three digits | 3-digit (<1000) | img×16 | screenshot |
| Subtraction | Subtraction patterns over increasing place values | — | img×17 | screenshot |
| Subtraction | Subtraction_ fill in the missing digits | — | img×27 | screenshot |
| Time | Elapsed time word problems | — | img×19 | screenshot |
| Time | Elapsed time | — | img×20 | screenshot |
| Time | Match analogue clocks and times | — | img×24 | screenshot |
| Time | Match digital clocks and times | — | img×16 | screenshot |
| Time | Read a calendar | — | img×12 | screenshot |
| Time | Read clocks and write times | — | img×16 | screenshot |
| Time | Reading schedules | — | img×25 | screenshot |
| Time | Time patterns | — | img×20 | screenshot |
| Time | Timelines | — | img×22 | screenshot |
| Time | A.M. or P.M_ | — | img×17 | screenshot |
| Understand division | Divide by counting equal groups | facts ≤ 10–12 | img×29 | screenshot |
| Understand division | Relate multiplication and division for arrays | — | img×26 | screenshot |
| Understand division | Relate multiplication and division for groups | — | img×27 | screenshot |
| Understand division | Write division sentences for arrays | — | img×29 | screenshot |
| Understand division | Write division sentences for groups | — | img×30 | screenshot |
| Understand multiplication | Count equal groups | — | img×35 | screenshot |
| Understand multiplication | Identify multiplication expressions for arrays | — | img×16 | screenshot |
| Understand multiplication | Identify multiplication expressions for equal groups | — | img×24 | screenshot |
| Understand multiplication | Make arrays to model multiplication | — | img×30 | screenshot |
| Understand multiplication | Relate addition and multiplication for equal groups | — | img×27 | screenshot |
| Understand multiplication | Write multiplication sentences for arrays | — | img×23 | screenshot |
| Understand multiplication | Write multiplication sentences for equal group | — | img×26 | screenshot |
| Understand multiplication | Write multiplication sentences for number lines | — | img×25 | screenshot |

### Document count vs distinct-skill count — the two numbers, kept separate

- **Documents: 198** (measured, exact).
- **Distinct skills: ~110** (a grouping judgment, NOT a raw count — see rule
  below). Sensitive to how format-variants are treated; a defensible range is
  ~105-130.

**These must not be blended.** 198 is measured off a listing. 110 is the result
of collapsing format-variants of the same concept, and reasonable people would
draw a few of those lines differently. The gap between them is the survey's
point: Grade 3 is **not** 198 lessons' worth of distinct skills.

**Grouping rule applied:** a document collapses into another when it is the same
concept in a different *format* — suffixes "word problems", "sorting", "true or
false", "find/select the missing number/factor" — and the "Multiply by N" /
"Divide by N" families and "facts for {2,3,4,5,10} / {6,7,8,9} / up to 10"
fact-recall variants collapse to one fact-recall skill each. Genuinely distinct
concepts are kept separate.

| topic | docs | distinct skills | note |
|---|---|---|---|
| Addition | 9 | 7 | 2 word-problem variants collapse into their bases |
| Subtraction | 7 | 6 | subtract-word-problems collapses into subtract |
| Multiplication | 11 | 9 | 1x2 / 1x3 word-problem variants collapse into bases |
| Multiplication fluency | 13 | 2 | **11 collapse -> 1** fact-recall + "Squares to 10x10" |
| Multiplication skill builders | 11 | 1 | **"Multiply by 0...10" all collapse -> 1** |
| Understand multiplication | 8 | 5 | "write mult sentences for arrays/groups/number-lines" collapse; "identify expressions for arrays/equal-groups" collapse |
| Division | 4 | 4 | all distinct |
| Division fluency | 11 | 1 | **all 11 collapse -> 1** fact-recall (sorting / T-F / missing-number) |
| Division skill builders | 10 | 1 | **"Divide by 1...10" all collapse -> 1** |
| Understand division | 5 | 3 | "relate mult&div for arrays/groups" and "write div sentences for arrays/groups" each collapse |
| Mixed operations | 11 | 5 | four-op facts/word-problems/complete-sentence collapse; T-F up-to-5/10/12 collapse |
| Estimation and rounding | 10 | 5 | estimate +/-/x/sums word-problem variants collapse; Rounding + Rounding puzzles collapse |
| Geometry | 11 | 10 | mostly distinct |
| Measurement | 10 | 7 | weight/capacity/heavy-light comparisons collapse; thermometer + reasonable-temp collapse |
| Money | 9 | 6 | add-money-word-problems collapses; compare/order/inequality collapse |
| Numbers and comparing | 9 | 6 | put-in-order / greatest-least / comparing collapse; even-or-odd + arithmetic-rules collapse |
| Patterns | 6 | 3 | repeating-pattern variants collapse; growing-pattern variants collapse |
| Place values | 9 | 6 | names up-to-hundreds/thousands collapse; expanded-form variants collapse |
| Probability | 3 | 2 | likelihood-scale variants collapse |
| Properties | 10 | 6 | distributive pair collapses; "properties of +" and "solve using properties of +" collapse (same for x) |
| Time | 10 | 7 | elapsed-time + word-problems collapse; analogue/digital/read-clock collapse |
| Data and graphs | 5 | 3 | Venn count+sort collapse; line-plot create+interpret collapse |
| Logical reasoning | 6 | 5 | two-number sum/diff + sum/diff/product/quotient collapse |
| **TOTAL** | **198** | **~110** | |

**Largest collapses (least debatable):** the two "skill builder" families
(21 docs -> 2 skills) and the two "fluency" families (24 docs -> 3 skills). Those
four families alone are **45 documents representing 5 skills.**

---

## Task D — interaction-type fit per skill

Engine types considered (the brief's list of 8): `single-select`,
`multi-select`, `fill-blanks`, `expression`, `order`, `sequence-build`,
`categorize`, `line-plot`. *(The engine also has a 9th type, `construct`
[geometry self-grading], which the brief's list omits — relevant to the gaps
flagged below.)*

| skill family | plausible types | variety outlook |
|---|---|---|
| 3-digit addition / subtraction (+ word problems, balance, missing-digit, input-output) | fill-blanks, single-select, expression, order | good — rich |
| Multiplication / division computation & word problems | fill-blanks, single-select, expression, order | good |
| **Fact recall** (skill-builders, fluency, true-or-false, sorting) | single-select, multi-select, fill-blanks, categorize (sorting), sequence-build | **thin — see flag (1)** |
| Understand x/÷ (arrays, equal groups, number lines) | single-select, multi-select, categorize, expression, line-plot | good |
| Estimation & rounding | single-select, fill-blanks, order | good |
| Place value (names, expanded form, value of a digit) | fill-blanks, single-select, expression, categorize | good |
| Numbers & comparing (order, greatest/least, even/odd, sequences) | order, single-select, multi-select, sequence-build | good |
| Patterns (repeating, growing) | sequence-build, single-select, order | good |
| Money (add/subtract, change, price lists, compare) | fill-blanks, single-select, order, multi-select | good |
| Data & graphs (pictograph, line plot, Venn) | line-plot, categorize (Venn = categorize/venn2), single-select | good |
| Probability (likelihood, combinations) | single-select, order, categorize, multi-select | adequate |
| Properties / parentheses / distributive | fill-blanks, expression, single-select, multi-select | good |
| Logical reasoning (puzzles, guess the number) | fill-blanks, single-select, expression | adequate |
| Geometry — 2D/3D naming, sides/vertices/edges/faces, polygons | single-select, multi-select, categorize | good |
| **Geometry — symmetry, reflection/rotation/translation, area on a grid** | single-select + **`construct`** | **flag (2) (needs construct)** |
| **Measurement — measure with a cm ruler; read a thermometer** | single-select (of a labelled image) | **flag (3) (no interactive instrument)** |
| **Time — match/read analogue & digital clocks** | single-select (of a clock image) | **flag (4) (no interactive clock)** |
| Time — elapsed time, calendars, schedules, timelines | fill-blanks, single-select, order | good |

**Gaps named (not designed):**
- **(1) Fact-recall fluency & skill-builders** admit essentially only
  select/fill/sorting types. This is where "30 varied questions per lesson" will
  be hardest — the concept is single-answer recall. Flagging *before* authoring,
  as the brief asks. (These are also the biggest doc->skill collapses, so few
  lessons, but each still needs 30 varied items.)
- **(2) Symmetry / reflection-rotation-translation / area-on-a-grid** want a
  *construction* interaction. The engine's `construct` type exists but is **not
  in the brief's 8-type list** — someone should confirm `construct` is on the
  table for G3 before these are authored.
- **(3) "Measure using a centimetre ruler" and "Read a thermometer"** assume an
  interactive measuring instrument the engine does not have. They can be reduced
  to `single-select` over a labelled image, but that changes the pedagogy (read
  the answer vs. perform the measurement). Named, not solved.
- **(4) Analogue/digital clock reading** assumes an interactive clock; the engine
  has none. Reducible to `single-select` over clock images (as Grade 4's time
  lessons did), with the same pedagogy caveat.

---

## Task E — Grade 3 repo state

- **`lessons-g3/` holds exactly 1 file:** `Division_facts_up_to_10_remix.html`
  (38,914 bytes). Its header identifies it as **"GRADE 3 · PILOT 1 · Division
  facts up to 10 (remix)"**, sourced from
  `sources-g3/Division fluency/Division facts up to 10.docx`, extraction noted at
  `docs/extractions/G3-PILOT1-EXTRACTION.md`. So **one** Grade 3 lesson has been
  authored (a pilot).
- **`docs/question-ids.json` contains ZERO Grade 3 IDs.** All 3,015 ledger
  entries live under `lessons/` (472) or `lessons/incoming/` (2,543); none under
  `lessons-g3/`. The pilot lesson's questions carry no ledger IDs.
- **The g3 exclusion still holds.** `tools/verify-question-ids.js` scans only
  `lessons/` + `lessons/incoming/` and explicitly excludes `lessons-g3/`; its
  check 6 ("lessons-g3/ excluded from the scan set") passed in the last full
  `npm test`. Confirmed.

---

## Anything noticed but not acted on

1. **`sources-g3/` is untracked** (not in git). It is a full 198-file, 52 MB
   copy of the Grade 3 source sitting in the working tree, identical to the
   desktop `word-staging` copy. Noted; not staged, not moved.
2. **One outlier document:** `Multiplication/Lattice multiplication.docx` has
   only **1 image anchor** — far below its neighbours (12-31). It may be a
   near-empty or single-image doc. Named individually per anti-laundering; not
   opened further.
3. **The brief's Task-B premise was inverted:** it assumed `extracted/` and
   `Not needed/` were partial *Grade 3* processing. They are *Grade 4* leftovers.
   Reported as measured rather than laundered into "G3 already started."
4. **`word-staging\` also stages Grades 2, 5, 6, 7** (`word docs-g2/g5/g6/g7`,
   149/142/162/225 files). Out of scope here; flagged so the two-location
   question can be asked of them later if needed.
5. **The distinct-skill count (~110) is a grouping judgment, not a measurement.**
   Every collapse is named in the Task C table so the reviewer can redraw any
   line. The document count (198) is the only hard number.

---

## Confirmation — nothing changed except this report

No lesson, question, frontmatter, tool, pipeline, or directory was created or
modified. `docs/audits/` already existed; this report is the single permitted
write. Nothing staged, committed, or pushed. `git status -sb` evidence follows
in chat.
