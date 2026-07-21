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
| 44 | 4 | `qe4c5gevv` | bar_graphs_remix | Categorize renders no data — "sort by how many" with no quantities. Data ABSENT from source, not failing to render; quantities exist only in `explain:`, shown after answering | content | correctness | closed | 2026-07-20 | 2026-07-21 | BRIEF-BATCH-1: body now renders a single-series bar chart (reused this lesson's existing `pv-graph` inline-SVG mechanism; no new renderer). Quantities taken verbatim from the existing `explain:` text — Lion 30, Zebra 10, Monkey 40, Seal 15; no numbers invented. Every sort is determinable before answering. New `verify-answerable.js` hard-gates this id |
| 44 | 4 | `qszpxymg7` | bar_graphs_remix | Categorize renders no data — sort teams by points, no points given. Same shape as `qe4c5gevv`; authoring defect, one file, two questions | content | correctness | closed | 2026-07-20 | 2026-07-21 | BRIEF-BATCH-1: body now renders a single-series bar chart (same reused `pv-graph` mechanism). Quantities taken verbatim from the existing `explain:` text — Reds 70, Blues 30, Golds 60, Greens 50; no numbers invented. Greens 50 sits exactly on the "50 or fewer" gridline. New `verify-answerable.js` hard-gates this id |
| 45 | all | — | — | No guard proves a question is *answerable* from what is rendered. Spec written by BRIEF-SOURCE-READ Task D; not built. **First half built (BRIEF-BATCH-1): `tools/verify-answerable.js` implements Assertion 2 (categorize must present a data source) — hard-gates the two known cases, flags the rest for review. Assertion 1 (select answer selectable) and fill-blanks/order/etc. remain unbuilt** | infra | correctness | open | 2026-07-20 | — | — |
| 49 | 4 | — | Multiply_two-digit_by_two-digit_word_problems__1to1 | Reported: only lesson missing its enrichment pass. MEASURED WIDER: it is indistinguishable from the `_remix` baseline (both 0% whyWrong, 0% solution). The full §13 pack exists in only **19 of 103 lessons** — 84 lessons sit at 0% whyWrong. Not one lesson; a corpus-wide gap | content | correctness | open | 2026-07-20 | — | — |
| 48 | all | `qukz2ne4j`, `qwy5e27zq`, `qnh5ry3b4`, `q55c5764u`, `qyz6te24b`, `qpg3sxjip` | box_multiplication_remix | Partial-product box should be drag-to-cell, not multi-select; multi-select does not verify which product belongs in which cell. Authoring format needed before G3 conversion begins | E | correctness | ruled | 2026-07-20 | — | — |
| 50 | all | — | — | On ~86% of questions a second wrong answer re-offers "Try again" indefinitely — no walkthrough, no cap. A child can be stuck in a loop. **Root cause measured: there is nothing to show** — see Item 49 | E | correctness | open | 2026-07-20 | — | — |
| 55 | all | — | tools / npm test | `whyWrong` coverage is **ungated** — `npm test` runs `verify-content-guards.js --hint-leak-only`. Nothing has ever enforced whyWrong, which is how 84/103 lessons reached 0% unnoticed | infra | correctness | closed | 2026-07-20 | 2026-07-21 | BRIEF-BATCH-1: `tools/verify-whywrong-floor.js` added — a **ratcheting** per-lesson floor recorded in `docs/whywrong-floor.json` (current state: 280/2668 = 10.5%). Wired into `npm test` and `test:fast`. FAILs if any lesson's whyWrong-covered count drops below its floor; never auto-raises the floor (raising is a human act in a brief). Does NOT force 100% — a permanently-red suite gets bypassed; it forbids regression. Proved to fail by sabotage (removed one whyWrong → FAIL naming lesson/floor/saw), restored byte-identical → PASS |
| 53 | 4, 3 | — | — | MCQ preferred over fill-blanks corpus-wide — a fourth grader taps more easily than types. Fill-blanks acceptable occasionally for variety; single-select is the default. **Applies to Grade 3 authoring from question one** | P | layout | ruled | 2026-07-20 | — | — |
| 54 | 4 | — | — | Corpus-wide scan needed: count fill-blanks questions across all 103 lessons, per lesson, and how many admit conversion to single-select. Gates the Item 53 conversion work | infra | infra | closed | 2026-07-20 | 2026-07-21 | BRIEF-BATCH-1: `docs/audits/FILLBLANKS-CENSUS.md` — **599 fill-blanks (22.5% of 2,668)**; 359 single-blank / 240 multi-blank; 131 carry a structural `layout:`; **330 admit clean conversion** (rule: 1 blank + numeric + no `layout:`). READ-ONLY census; no conversions made. Scopes Item 53, does not execute it |
| 56 | 4 | — | interpret-remainders | 29 questions currently fill-blanks; candidate for conversion under Item 53. First lesson identified by review | P | layout | open | 2026-07-20 | — | — |
| 57 | all | — | .githooks/pre-push | Proposed (BRIEF-CONTENT-1 Task G): reduce pre-push to a fast integrity check because the full suite allegedly runs at BOTH commit and push (~25 min each, duplicated) | infra | infra | not-a-defect | 2026-07-21 | 2026-07-21 | BRIEF-CONTENT-1 Task G STOPPED at G1 (measure-first): the premise is false. BRIEF-PRECOMMIT-SPEED (2026-07-18) already split the gates — `pre-commit` runs `npm run test:fast` (~1–2 min), `pre-push` runs the full `npm test` (~12–15 min) exactly ONCE. There is no duplicate full-suite run to remove. Reducing pre-push would delete the ONLY full-suite gate (the browser suites run solely at push), a safety regression. Neither hook changed |
| 29 | 4 | — | — | Multi-expression prompts run horizontally; must stack | E | layout | open | 2026-07-20 | — | — |
| 33 | 4 | — | — | `₹` rendered unconditionally on non-money column sums | content | polish | not-a-defect | 2026-07-20 | 2026-07-21 | BRIEF-CONTENT-1 Task A (docs/audits/CONTENT-CENSUS-33-38.md): measured every `₹` in the corpus — **201 questions across 23 files, all genuinely about money. NOT-MONEY = 0, AMBIGUOUS = 0.** The 58 with no prose money-word are bare currency ops (`₹613 × 8`, `₹361 rounded to nearest ₹100`). Only 3 column/vertical/stack questions carry `₹`, all money. The reported defect does not manifest; nothing stripped, nothing to fix |
| 38 | 4 | — | — | `·` middot separator reads as multiply | content | polish | closed | 2026-07-20 | 2026-07-21 | BRIEF-CONTENT-1: census found **328 `·` occurrences (172 lines, 17 files), all PROSE-SEPARATOR; METADATA = 0, MULTIPLY = 0, AMBIGUOUS = 0.** Task B replaced every ` · ` → `, ` in lesson content (corpus stayed 2,668). Task C changed the expression keypad in preview-engine.js (` · ` → ` × `, insert + backspace, arithmetic unchanged) — cosmetic, nothing grades on `·` (P3 verified). Two new guards: `verify-no-middot.js` (lessons) and `verify-engine-no-middot.js` (engine), both proved by sabotage |
| 39 | 4 | — | — | Comparison figures stack vertically; must sit side by side. Chat recommends side-by-side desktop/tablet, stacked on phone | E | layout | open | 2026-07-20 | — | — |
| 40 | 4 | `q86pfikqr` | area-and-perimeter-word-problems | Dimension labels collide with figure boundary. **Separate from Item 41 and still live** — the figure is correct, its labelling is cosmetically wrong | L | layout | open | 2026-07-20 | — | — |
| 42 | 4 | — | — | Options render full-width single column; should be 2×2 | E | layout | open | 2026-07-20 | — | — |
| 46 | 4 | `q8nhv3ty3` | — | Y-axis interval too fine (5s to 100); sibling chart `qpwstmk82` is the correct pattern to copy | E | layout | open | 2026-07-20 | — | — |
| 47 | 4 | `qpwstmk82` | — | Chart legend clipped — "Cats"/"Dogs" lose final letter | E | layout | open | 2026-07-20 | — | — |
| 51 | 4 | `q3wypsawf` | area-and-perimeter-word-problems | Q19 expected `Answer: A`, observed B — Ctrl+F5 check carried unchecked across four handoffs | L | correctness | not-a-defect | 2026-07-20 | 2026-07-21 | BRIEF-CONTENT-1: Venkat reviewed `q3wypsawf` (Q19 of 25) directly. Both gardens are 24 sq m; A is 12×2 with perimeter 2(12+2)=28 m; B is 6×4 with perimeter 2(6+4)=20 m. **A needs more fence, so `Answer: A` in the file is correct.** The observed "B" was a reviewer misread — same shape as Item 41. `question id` column set to `q3wypsawf` (was `—`; an id now exists) |
| 52 | all | — | — | Kids should not be asked to scroll unless necessary — Check button must be reachable at 390×844 without scrolling. Candidate guard, not yet built | infra | layout | open | 2026-07-20 | — | — |
| 31 | 4 | — | — | "HINT 1" shown when only one hint exists | E | polish | parked | 2026-07-20 | — | — |
| 32 | 4 | — | — | Categorize gives no verdict and no per-tile feedback | E | polish | parked | 2026-07-20 | — | — |
| 37 | 4 | — | — | Answer line shows bare values, unmappable to blanks | content | polish | parked | 2026-07-20 | — | — |
| 34 | all | — | tools/verify-reset.js | Addresses frames by hard-coded index | infra | infra | parked | 2026-07-20 | — | — |
| 36 | all | — | deploy-drop/ | Stale frozen copy | infra | infra | parked | 2026-07-20 | — | — |
