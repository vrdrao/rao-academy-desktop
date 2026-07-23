# BRIEF-ISSUES-1 — create `docs/ISSUES.md`, the permanent consolidated issue log

**Chat-authored, 2026-07-20. Authorised by Venkat. Supersedes any earlier draft
of this brief — the seed table below is the authoritative one.**

---

## WHY THIS EXISTS

Issues found during review are currently recorded as prose scattered across
handoff documents — Items 13–25 in HANDOFF-29 §6, Items 26–34 in HANDOFF-31
§11, Items 35–49 in HANDOFF-33 §5. **Each handoff restates and renumbers them,
and things fall out.**

The evidence:

- **Item 49** was found by accident during an unrelated census.
- A skip-list entry for `bar_graphs` **hid two unanswerable questions** across
  at least two handoffs.
- The `area-and-perimeter Q19` check has been **carried unchecked across four
  handoffs.**

None were dropped through carelessness. They were dropped because the only
record was prose in a document that gets rewritten every session.

**This file is the permanent record. Handoffs will reference it and stop
restating issues.**

---

## HOW IT DIFFERS FROM `STATE.md`

`STATE.md` is measured from the repo and regenerated automatically.
**`ISSUES.md` cannot be measured** — no script knows that a figure is
unanswerable. It is hand-maintained, so the discipline must come from structure.

**Two laws, both borrowed from things that already work here:**

1. **Keyed by question ID wherever one exists.** Every question carries a
   permanent opaque `id: q********`. That is the join key — an issue logged in
   July stays findable in November even if the lesson is renamed or archived.
2. **Nothing is ever deleted, only closed.** Same rule as
   `docs/question-ids.json`. A closed issue keeps its row, its resolution and
   its date. **Deleting closed rows destroys the record of why something is the
   way it is** — which is how a superseded tile-sizing scheme resurfaced twice
   and was nearly re-applied.

**A third law, earned tonight:** an issue may be closed as **`not-a-defect`**.
Item 41 was logged as a correctness failure, investigated, and found to be a
reviewer misread. **That row stays in the log, closed, with the reason** — so
nobody re-opens it in November and burns another twenty minutes.

---

## SCOPE FENCE

- Create `docs/ISSUES.md`. **Seed it with the rows below, verbatim.**
- **Do not investigate, verify, fix, or triage any issue in this brief.**
  Several rows describe live defects. Leave every one alone.
- Do not modify any lesson, guard, tool, or the engine.
- Do not renumber the seeded items. **Item numbers are permanent identifiers**
  and must match the handoff history.
- **Do not push.** Commit locally only.

---

## TASK A — create `docs/ISSUES.md`

### Structure

A header explaining the file's authority and its three laws, then one table.

**Columns, in this order:**

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
| `opened` | date |
| `closed` | date, or `—` |
| `resolution` | how it was resolved, or `—` |

**`severity: correctness` means a child is shown something wrong or
unanswerable.** It ranks above everything else regardless of effort.

### The header must state, explicitly

- This file is the **authoritative record of known issues.** Handoffs reference
  it; they do not restate it.
- **Contents are asserted, not measured.** Unlike `STATE.md`, nothing here is
  verified by tooling. A row may be stale.
- **Rows are never deleted.** Closing means setting `status`, filling `closed`
  and `resolution`, and leaving the row in place.
- **Item numbers are permanent.** A closed item's number is never reused.
- **An issue may be closed as `not-a-defect`** when investigation shows the
  report was mistaken. The row stays, with the reason.

---

## TASK B — seed rows

Enter these verbatim. **Do not act on any of them.** All `opened` dates are
`2026-07-20`.

| # | grade | question id | file | issue | lane | severity | status | closed | resolution |
|---|---|---|---|---|---|---|---|---|---|
| 41 | 4 | `q86pfikqr` | area-and-perimeter-word-problems | Reported: L-shape unsolvable, correct answer 12 not among options | L | correctness | not-a-defect | 2026-07-20 | BRIEF-SOURCE-READ: source has 6 labels for 6 sides, figure closes (left 4 = 2+2, bottom 6 = 4+2). Shoelace on authored coordinates = 20 sq cm, which IS among options [24,20,16,10]. The "12" came from mis-decomposing the notch width as 2 instead of bottom width 6. Reviewer misread, not a defect |
| 44 | 4 | `qe4c5gevv` | bar_graphs_remix | Categorize renders no data — "sort by how many" with no quantities. Data ABSENT from source, not failing to render; quantities exist only in `explain:`, shown after answering | content | correctness | open | — | — |
| 44 | 4 | `qszpxymg7` | bar_graphs_remix | Categorize renders no data — sort teams by points, no points given. Same shape as `qe4c5gevv`; authoring defect, one file, two questions | content | correctness | open | — | — |
| 45 | all | — | — | No guard proves a question is *answerable* from what is rendered. Spec written by BRIEF-SOURCE-READ Task D; not built | infra | correctness | open | — | — |
| 49 | 4 | — | Multiply_two-digit_by_two-digit_word_problems__1to1 | Reported: only lesson missing its enrichment pass. MEASURED WIDER: it is indistinguishable from the `_remix` baseline (both 0% whyWrong, 0% solution). The full §13 pack exists in only **19 of 103 lessons** — 84 lessons sit at 0% whyWrong. Not one lesson; a corpus-wide gap | content | correctness | open | — | — |
| 48 | all | `qukz2ne4j`, `qwy5e27zq`, `qnh5ry3b4`, `q55c5764u`, `qyz6te24b`, `qpg3sxjip` | box_multiplication_remix | Partial-product box should be drag-to-cell, not multi-select; multi-select does not verify which product belongs in which cell. Authoring format needed before G3 conversion begins | E | correctness | ruled | — | — |
| 50 | all | — | — | On ~86% of questions a second wrong answer re-offers "Try again" indefinitely — no walkthrough, no cap. A child can be stuck in a loop. **Root cause measured: there is nothing to show** — see Item 49 | E | correctness | open | — | — |
| 55 | all | — | tools / npm test | `whyWrong` coverage is **ungated** — `npm test` runs `verify-content-guards.js --hint-leak-only`. Nothing has ever enforced whyWrong, which is how 84/103 lessons reached 0% unnoticed | infra | correctness | open | — | — |
| 53 | 4, 3 | — | — | MCQ preferred over fill-blanks corpus-wide — a fourth grader taps more easily than types. Fill-blanks acceptable occasionally for variety; single-select is the default. **Applies to Grade 3 authoring from question one** | P | layout | ruled | — | — |
| 54 | 4 | — | — | Corpus-wide scan needed: count fill-blanks questions across all 103 lessons, per lesson, and how many admit conversion to single-select. Gates the Item 53 conversion work | infra | infra | open | — | — |
| 56 | 4 | — | interpret-remainders | 29 questions currently fill-blanks; candidate for conversion under Item 53. First lesson identified by review | P | layout | open | — | — |
| 29 | 4 | — | — | Multi-expression prompts run horizontally; must stack | E | layout | open | — | — |
| 33 | 4 | — | — | `₹` rendered unconditionally on non-money column sums | content | polish | open | — | — |
| 38 | 4 | — | — | `·` middot separator reads as multiply | content | polish | open | — | — |
| 39 | 4 | — | — | Comparison figures stack vertically; must sit side by side. Chat recommends side-by-side desktop/tablet, stacked on phone | E | layout | open | — | — |
| 40 | 4 | `q86pfikqr` | area-and-perimeter-word-problems | Dimension labels collide with figure boundary. **Separate from Item 41 and still live** — the figure is correct, its labelling is cosmetically wrong | L | layout | open | — | — |
| 42 | 4 | — | — | Options render full-width single column; should be 2×2 | E | layout | open | — | — |
| 46 | 4 | `q8nhv3ty3` | — | Y-axis interval too fine (5s to 100); sibling chart `qpwstmk82` is the correct pattern to copy | E | layout | open | — | — |
| 47 | 4 | `qpwstmk82` | — | Chart legend clipped — "Cats"/"Dogs" lose final letter | E | layout | open | — | — |
| 51 | 4 | — | area-and-perimeter-word-problems | Q19 expected `Answer: A`, observed B — Ctrl+F5 check carried unchecked across four handoffs | L | correctness | open | — | — |
| 52 | all | — | — | Kids should not be asked to scroll unless necessary — Check button must be reachable at 390×844 without scrolling. Candidate guard, not yet built | infra | layout | open | — | — |
| 31 | 4 | — | — | "HINT 1" shown when only one hint exists | E | polish | parked | — | — |
| 32 | 4 | — | — | Categorize gives no verdict and no per-tile feedback | E | polish | parked | — | — |
| 37 | 4 | — | — | Answer line shows bare values, unmappable to blanks | content | polish | parked | — | — |
| 34 | all | — | tools/verify-reset.js | Addresses frames by hard-coded index | infra | infra | parked | — | — |
| 36 | all | — | deploy-drop/ | Stale frozen copy | infra | infra | parked | — | — |

**Notes for the person entering these:**

- **Item 44 gets two rows, both numbered 44.** Two question IDs, one issue
  number. **Do not renumber** — the handoff history uses 44 for both.
- **Items 50–56 are newly numbered here.** They existed as prose in HANDOFF-33
  or were ruled tonight. Numbering them is the point of this file.
- **Item 41 seeds as `not-a-defect`, already closed.** This is deliberate. It is
  the worked example of the third law.

---

## TASK C — add a usage note to `CLAUDE.md`

Add a short section stating:

- `docs/ISSUES.md` is the authoritative issue record.
- Any newly found issue gets a row **at the time it is found**, not at handoff
  time.
- Closing an issue means setting `status` with a date and resolution.
  **Never delete a row.**
- An issue may be closed as `not-a-defect`; the row and the reason stay.
- Handoffs reference item numbers; they do not restate issue detail.

**Do not fix `CLAUDE.md`'s known-wrong `npm run review` shorthand** — separate
open defect, out of scope.

---

## TASK D — full suite and commit

1. Stage new files before `npm test` — `verify-tracked.js` fails on untracked
   files.
2. Run `npm test` unpiped. Report exit code; name every guard individually.
3. Commit locally:

```
BRIEF-ISSUES-1: docs/ISSUES.md, the permanent consolidated issue log

Consolidates issues previously scattered as prose across HANDOFF-29 §6,
HANDOFF-31 §11 and HANDOFF-33 §5 into one table keyed by permanent question id.

Rows are never deleted, only closed with a date and resolution — the same
append-only law as docs/question-ids.json. Item numbers are permanent and are
never reused or renumbered. An issue may be closed as not-a-defect, with the
row and the reason retained.

Seeded with 26 rows, including tonight's BRIEF-SOURCE-READ findings: Item 41
closed as a reviewer misread, Item 49 rewritten from one lesson to a
corpus-wide gap (whyWrong present in only 19 of 103 lessons), and Item 55
opened for whyWrong being ungated.
```

**Do not push.** Report `git status -sb` and the ahead-count.

---

## ANTI-LAUNDERING

- **Seed the rows exactly as given.** Do not reword, merge, split, or re-triage.
- Do not change any `status`. **Nothing is closed or opened by this brief
  beyond what the table already states.**
- If a seeded row appears wrong, **enter it as given and flag the discrepancy in
  the report.** Do not silently correct it.
- Do not add issues you notice while working. Report them; they get numbered
  deliberately.

---

## REPORT FORMAT

1. `docs/ISSUES.md` in full.
2. The `CLAUDE.md` addition, quoted.
3. Every guard in `npm test`, individually, with exit codes; then overall exit
   code unpiped.
4. `git status -sb` and the ahead-count.
5. Anything noticed but not acted on — including any seeded row you believe is
   inaccurate.

**Do not push. Do not fix any issue in the log. Do not self-commission
follow-up work. Do not write a handoff.**
