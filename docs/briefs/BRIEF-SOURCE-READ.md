# BRIEF-SOURCE-READ — diagnose three unanswerable questions and one un-enriched lesson

**Chat-authored, 2026-07-20. READ-ONLY. Nothing is created, moved, edited,
committed or pushed by this brief.**

---

## WHY THIS BRIEF EXISTS

Three questions currently in the live Grade 4 corpus **cannot be answered by a
child from what is rendered.** All three were found by Venkat's eye in a single
review sitting. **No guard caught any of them.**

This brief does not fix them. **It finds out what is actually there**, so the
fix can be scoped correctly — one lesson or a corpus sweep — rather than
guessed at.

A fourth item (a lesson that appears never to have received its enrichment pass)
is included because it is the same kind of question: *what does the source
actually contain?*

---

## SCOPE FENCE

- **READ-ONLY.** No file created, modified, moved, renamed or deleted.
  No commit. No push. No `git add`.
- **Do not fix anything.** Not the frontmatter, not the figure, not the options,
  not the engine. Diagnosis only.
- Do not write a guard. Task D asks you to *specify* one, not build it.
- `lessons-g3/` is out of scope. Grade 3 is out of scope.
- If a task cannot be completed read-only, **skip it and say so.**

**You may write ONE file and only one:** `docs/audits/SOURCE-READ.md`.
`docs/audits/` already exists. Do not create any other file.

---

## TASK A — Item 41: `q86pfikqr`, the L-shape

**File:** `review/area-and-perimeter-word-problems.html` renders it; the source
lives under `lessons/` or `lessons/incoming/`. **Locate it by its id**, do not
guess the filename.

As rendered, the L-shape carries **seven** labels for a **six**-sided figure:
top `4 cm`, left `4 cm`, bottom `6 cm`, and three right-side labels of `2 cm`.
The numbers do not close — the left side reads 4, the right side totals 6.

Cutting into two rectangles gives `4×2 = 8` plus `2×2 = 4` = **12 sq cm**.
**The rendered options are 24, 20, 16, 10. Twelve is not among them.**

Report, verbatim from the source:

1. The complete `<!--@q ... -->` frontmatter block, every line.
2. The `answer:` value exactly as authored.
3. The complete figure specification — every label, every dimension, in
   source order.
4. The complete option list as authored.
5. The `description`, `hint`, and any `whyWrong` or solution/walkthrough content.

**Then answer three questions, separately and explicitly:**

- Does the authored figure match what renders? If the source has six labels and
  seven render, that is an engine defect. If the source has seven, it is an
  authoring defect.
- Is the authored `answer:` present among the authored options?
- Is the authored answer arithmetically correct for the authored figure?

**Do not decide which is "the" defect.** Report what each artefact says and let
the three answers stand side by side. It may be more than one.

---

## TASK B — Item 44: `qe4c5gevv` and `qszpxymg7`, categorize with no data

**File:** `lessons/incoming/bar_graphs_remix.html` (CONFIRMED — this file was
excluded from the cull and ships).

`qe4c5gevv` asks a child to sort Lion, Zebra, Monkey, Seal into "More than 20" /
"Fewer than 20". **Nowhere in the render does it say how many of each.**
`qszpxymg7` sorts teams by points, with no points given.

**The tell:** the answer line on `qszpxymg7` reads `above, upto, above, upto` —
four values for four tiles, and they are *category labels*, not data. **This
suggests the data existed at authoring time and was lost between source and
render.**

Report, verbatim from the source, for **both** questions:

1. The complete `<!--@q ... -->` frontmatter, every line.
2. The complete `<div class="question">` preview block, every line — including
   any `<table>`, list, or figure markup.
3. Whether a data source (table, chart spec, figure, or inline values) exists in
   the source at all.

**Then answer, explicitly:**

- **Is the data present in the source and failing to render, or absent from the
  source entirely?** This is the load-bearing question of the whole brief. It
  determines whether the fix is an engine fix or an authoring fix.
- If present in the source: what markup carries it, and does it match the shape
  BRIEF-3 shipped for option `<table>` rendering?

**BRIEF-3 shipped "option `<table>`s render as tables" plus a
`FLATTENED_MARKUP` guard this session.** A table that should render and does not
is adjacent to work that just landed. **Check this specifically. Do not assert a
connection — measure whether one exists.**

---

## TASK C — the general case

**Do not fix the file. Find out how many others share the defect.**

1. **Scan every categorize question in the corpus** (all 103 lessons). For each,
   determine whether it renders any data source at all — table, figure, chart,
   or inline values. **Report the count of categorize questions that render no
   data source, and name every one by its question id and file.**
2. **Scan every single-select and multi-select question in the corpus.** For
   each, determine whether the authored `answer:` value appears among the
   authored options. **Report the count of mismatches and name every one by
   question id and file.**

These are two mechanical checks and they are the exact shape of Item 45. If
either returns more than the known cases, **that is the finding of the night.**

**Report counts you derived from an actual scan. If a check cannot be done
mechanically for some question type, say which and why — do not silently
exclude it from the denominator.**

---

## TASK D — specify the Item 45 guard, do not build it

Based on what Tasks A–C found, **specify** (in prose, in the report) a guard
that would have caught these three questions. At minimum it should assert:

- the authored correct answer appears among the authored options
- a categorize question renders a data source

**Do not write the guard. Do not create `tools/verify-answerable.js`.** State
what it must assert, which question types it can cover mechanically, and —
importantly — **which types it cannot cover and why.** Name its blind spots
honestly; a guard that silently skips half the corpus is worse than none.

---

## TASK E — Item 49: the un-enriched lesson

`Multiply_two-digit_by_two-digit_word_problems__1to1.html` has **no `_remix`
twin.** It was excluded from the cull for exactly that reason — archiving it
would have permanently deleted 26 questions.

Every other lesson received an enrichment pass. This one may never have.

Report:

1. The file's current location and its exact question count.
2. **How many of its questions have `hint:`** — as a count and a percentage.
3. **How many have `whyWrong` content** — count and percentage.
4. **How many have a solution or walkthrough** — count and percentage.
5. **The same four numbers for a known-good `_remix` lesson**, so there is a
   baseline to compare against. Name which lesson you used.

**Do not enrich it. Do not author anything.** The comparison is the deliverable.

---

## ANTI-LAUNDERING

- Say **UNMEASURED** when something is unmeasured.
- Quote source verbatim. Do not paraphrase frontmatter.
- Do not decide which defect is "the real one" where the evidence supports more
  than one. Report all of them.
- Name near-misses and reject them explicitly rather than accepting
  "close enough."
- **Do not estimate effort or timeline anywhere in this report.**
- If a scan in Task C cannot cover some question type, **say so and give the
  count you could not check.** Never let an unchecked question fall out of the
  denominator silently.

---

## REPORT FORMAT

1. **Task A** — the L-shape: verbatim source, then the three explicit answers.
2. **Task B** — both questions: verbatim source, then the present-vs-absent
   verdict.
3. **Task C** — both scan counts, with every offender named by id and file.
4. **Task D** — the guard specification, including its blind spots.
5. **Task E** — the four numbers for the un-enriched lesson and the four for the
   baseline.
6. **Anything noticed but not acted on.**
7. **Explicit confirmation that nothing was created, modified, moved, committed
   or pushed** beyond the one permitted report — with `git status -sb` as
   evidence.

**Do not self-commission follow-up work. Do not write a handoff. Do not propose
the next brief. Do not fix anything.**
