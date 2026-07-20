# ISSUES — the authoritative record of known issues

This file is the **authoritative record of known issues** for the project.
Handoffs reference item numbers here; they do **not** restate issue detail.
Issues found during review get a row **at the time they are found**, not at
handoff time.

**Contents are asserted, not measured.** Unlike `STATE.md` (which is regenerated
from the repo by tooling), nothing in this file is verified by any script — no
script can know that a figure is unanswerable. **A row may be stale.** Trust it
the way you trust a colleague's note, not the way you trust a passing test.

## The three laws

1. **Keyed by question ID wherever one exists.** Every question carries a
   permanent opaque `id: q********`. That is the join key: an issue logged in July
   stays findable in November even if the lesson is renamed or archived. Where no
   single id applies (engine/infra), the id column is `—`.
2. **Rows are never deleted, only closed.** The same append-only law as
   `docs/question-ids.json`. Closing means setting `status`, filling `closed` with
   a date and `resolution` with how it was resolved, and **leaving the row in
   place.** Deleting a closed row destroys the record of *why* something is the way
   it is — which is how a superseded tile-sizing scheme resurfaced twice and was
   nearly re-applied. **Item numbers are permanent** and are never reused or
   renumbered.
3. **An issue may be closed as `not-a-defect`.** When investigation shows the
   report was mistaken, the row stays, closed, with the reason — so nobody
   re-opens it and burns another twenty minutes. Item 41 is the worked example.

## Column meanings

| Column | Meaning |
|---|---|
| `#` | permanent item number — never reused, never renumbered |
| `grade` | 4, 3, or `all` for engine/infra issues |
| `question id` | `q********` where one exists, else `—` |
| `file` | source file, or `—` |
| `issue` | one line, specific enough to act on without context |
| `lane` | `E` engine · `P` pattern sweep · `L` lesson-specific · `D` working as designed · `infra` · `content` |
| `severity` | `correctness` · `layout` · `polish` · `infra` |
| `status` | `open` · `ruled` · `in progress` · `closed` · `not-a-defect` · `parked` |
| `opened` | date the issue was logged |
| `closed` | date closed, or `—` |
| `resolution` | how it was resolved, or `—` |

**`severity: correctness` means a child is shown something wrong or unanswerable.**
It ranks above everything else regardless of effort.

## Issues

| # | grade | question id | file | issue | lane | severity | status | opened | closed | resolution |
|---|---|---|---|---|---|---|---|---|---|---|
| 41 | 4 | `q86pfikqr` | area-and-perimeter-word-problems | Reported: L-shape unsolvable, correct answer 12 not among options | L | correctness | not-a-defect | 2026-07-20 | 2026-07-20 | BRIEF-SOURCE-READ: source has 6 labels for 6 sides, figure closes (left 4 = 2+2, bottom 6 = 4+2). Shoelace on authored coordinates = 20 sq cm, which IS among options [24,20,16,10]. The "12" came from mis-decomposing the notch width as 2 instead of bottom width 6. Reviewer misread, not a defect |
| 44 | 4 | `qe4c5gevv` | bar_graphs_remix | Categorize renders no data — "sort by how many" with no quantities. Data ABSENT from source, not failing to render; quantities exist only in `explain:`, shown after answering | content | correctness | open | 2026-07-20 | — | — |
| 44 | 4 | `qszpxymg7` | bar_graphs_remix | Categorize renders no data — sort teams by points, no points given. Same shape as `qe4c5gevv`; authoring defect, one file, two questions | content | correctness | open | 2026-07-20 | — | — |
| 45 | all | — | — | No guard proves a question is *answerable* from what is rendered. Spec written by BRIEF-SOURCE-READ Task D; not built | infra | correctness | open | 2026-07-20 | — | — |
| 49 | 4 | — | Multiply_two-digit_by_two-digit_word_problems__1to1 | Reported: only lesson missing its enrichment pass. MEASURED WIDER: it is indistinguishable from the `_remix` baseline (both 0% whyWrong, 0% solution). The full §13 pack exists in only **19 of 103 lessons** — 84 lessons sit at 0% whyWrong. Not one lesson; a corpus-wide gap | content | correctness | open | 2026-07-20 | — | — |
| 48 | all | `qukz2ne4j`, `qwy5e27zq`, `qnh5ry3b4`, `q55c5764u`, `qyz6te24b`, `qpg3sxjip` | box_multiplication_remix | Partial-product box should be drag-to-cell, not multi-select; multi-select does not verify which product belongs in which cell. Authoring format needed before G3 conversion begins | E | correctness | ruled | 2026-07-20 | — | — |
| 50 | all | — | — | On ~86% of questions a second wrong answer re-offers "Try again" indefinitely — no walkthrough, no cap. A child can be stuck in a loop. **Root cause measured: there is nothing to show** — see Item 49 | E | correctness | open | 2026-07-20 | — | — |
| 55 | all | — | tools / npm test | `whyWrong` coverage is **ungated** — `npm test` runs `verify-content-guards.js --hint-leak-only`. Nothing has ever enforced whyWrong, which is how 84/103 lessons reached 0% unnoticed | infra | correctness | open | 2026-07-20 | — | — |
| 53 | 4, 3 | — | — | MCQ preferred over fill-blanks corpus-wide — a fourth grader taps more easily than types. Fill-blanks acceptable occasionally for variety; single-select is the default. **Applies to Grade 3 authoring from question one** | P | layout | ruled | 2026-07-20 | — | — |
| 54 | 4 | — | — | Corpus-wide scan needed: count fill-blanks questions across all 103 lessons, per lesson, and how many admit conversion to single-select. Gates the Item 53 conversion work | infra | infra | open | 2026-07-20 | — | — |
| 56 | 4 | — | interpret-remainders | 29 questions currently fill-blanks; candidate for conversion under Item 53. First lesson identified by review | P | layout | open | 2026-07-20 | — | — |
| 29 | 4 | — | — | Multi-expression prompts run horizontally; must stack | E | layout | open | 2026-07-20 | — | — |
| 33 | 4 | — | — | `₹` rendered unconditionally on non-money column sums | content | polish | open | 2026-07-20 | — | — |
| 38 | 4 | — | — | `·` middot separator reads as multiply | content | polish | open | 2026-07-20 | — | — |
| 39 | 4 | — | — | Comparison figures stack vertically; must sit side by side. Chat recommends side-by-side desktop/tablet, stacked on phone | E | layout | open | 2026-07-20 | — | — |
| 40 | 4 | `q86pfikqr` | area-and-perimeter-word-problems | Dimension labels collide with figure boundary. **Separate from Item 41 and still live** — the figure is correct, its labelling is cosmetically wrong | L | layout | open | 2026-07-20 | — | — |
| 42 | 4 | — | — | Options render full-width single column; should be 2×2 | E | layout | open | 2026-07-20 | — | — |
| 46 | 4 | `q8nhv3ty3` | — | Y-axis interval too fine (5s to 100); sibling chart `qpwstmk82` is the correct pattern to copy | E | layout | open | 2026-07-20 | — | — |
| 47 | 4 | `qpwstmk82` | — | Chart legend clipped — "Cats"/"Dogs" lose final letter | E | layout | open | 2026-07-20 | — | — |
| 51 | 4 | — | area-and-perimeter-word-problems | Q19 expected `Answer: A`, observed B — Ctrl+F5 check carried unchecked across four handoffs | L | correctness | open | 2026-07-20 | — | — |
| 52 | all | — | — | Kids should not be asked to scroll unless necessary — Check button must be reachable at 390×844 without scrolling. Candidate guard, not yet built | infra | layout | open | 2026-07-20 | — | — |
| 31 | 4 | — | — | "HINT 1" shown when only one hint exists | E | polish | parked | 2026-07-20 | — | — |
| 32 | 4 | — | — | Categorize gives no verdict and no per-tile feedback | E | polish | parked | 2026-07-20 | — | — |
| 37 | 4 | — | — | Answer line shows bare values, unmappable to blanks | content | polish | parked | 2026-07-20 | — | — |
| 34 | all | — | tools/verify-reset.js | Addresses frames by hard-coded index | infra | infra | parked | 2026-07-20 | — | — |
| 36 | all | — | deploy-drop/ | Stale frozen copy | infra | infra | parked | 2026-07-20 | — | — |
