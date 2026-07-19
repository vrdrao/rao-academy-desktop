# BRIEF-L1-ASMD — measure enrichment, then rebuild one lesson to 30

**Authored:** chat-side, 2026-07-19. **Lane:** L (conditional escalation to P).
**Invocation:** `Read BRIEF-L1-ASMD.md in the repo root and execute it verbatim.`

## Scope fence

**GRADE 4 ONLY.** `lessons-g3/` is untouched by every phase of this brief —
not counted, not scanned, not regenerated. Grade 3 totals must be identical
before and after this run.

**Engine files are OUT OF SCOPE.** `engine/preview-engine.js`, `engine/rao.css`,
`engine/rao-card.css`, `engine/rao-card.js` and `tools/` are not edited by this
brief. If Phase 0 concludes the defect is in the review generator, you STOP and
report; you do not fix it. That fix is a separate chat-authored engine brief.

**Do not self-commission recovery work.** If any phase fails or stalls, report
the partial result and stop. Never substitute one work item for another —
scope is not yours.

---

## Target lesson

The lesson whose review page is `review/add-subtract-multiply-divide-remix-expanded.html`.

**Phase 0 step 1 is to locate its SOURCE file in `lessons/` and print the path.**
Do not assume the filename matches. If no source lesson in `lessons/` generates
that review page, STOP and report — a review page with no source is itself a
finding and changes everything downstream.

---

## PHASE 0 — MEASURE ONLY. NO EDITS. NO COMMITS.

Phase 0 writes nothing to any lesson file. Its entire output is numbers.

### 0.1 — Locate and count the target lesson

From the SOURCE file in `lessons/` (not the review page), print:

- absolute path, and md5
- total question count
- number of questions carrying `whyWrong` (any)
- number of questions carrying `solution:`
- number of questions carrying `explain`
- hint rung counts, as a distribution: how many questions have 0 rungs,
  1 rung, 2 rungs, 3 rungs

Print these as literal measured numbers. Do not round, summarize, or
characterize them as "sparse", "thin", or "as expected". Anti-laundering law:
the reviewer decides what the numbers mean.

### 0.2 — THE A/B DETERMINATION (the reason this phase exists)

The chat measured the REVIEW PAGE and found 96 questions, 0 `whyWrong`,
0 `solution`, and single-line hints throughout. Determine which is true:

- **A — the source lesson genuinely lacks enrichment.** Source counts in 0.1
  are ~zero, matching the review page.
- **B — the source lesson HAS enrichment and the review generator drops it.**
  Source counts in 0.1 are materially higher than the review page's.

State **A or B explicitly**, and print the side-by-side counts (source vs
review page) that justify the call. Do not infer B from a single field; show
every field.

**IF THE ANSWER IS B: STOP HERE.**

Do not proceed to Phase 1. Do not rebuild. Do not edit the lesson. Commit
nothing. Report:

- the exact counts proving enrichment exists in source but not in the page
- the generator file responsible, by path
- the specific transform that drops it, by file:line if you can identify it
  — and if you cannot identify it, SAY SO rather than guessing

B means all 118 review pages are blind and Venkat has been reviewing lessons
unable to see the hints, whyWrongs, and walkthroughs. That is an engine-lane
emergency, and it outranks this brief entirely.

### 0.3 — Corpus-wide enrichment scan (runs in BOTH cases A and B)

Across **all** lesson files in `lessons/` (Grade 4 only), produce a table,
one row per lesson:

| lesson | questions | with whyWrong | with solution | with explain | 3-rung hints |

Then print totals: corpus question count, and for each enrichment field the
count and percentage of questions carrying it.

Print the **full table, every row**. Do not truncate to "the worst 10" and do
not collapse rows into a summary. Collisions and gaps are printed row by row;
the reviewer decides what is benign.

Also print: the corpus question total you measured, against the recorded
**3,075 / 118 files**. If either differs, enumerate the difference — do not
reconcile it silently, and do not adjust the recorded figure.

### 0.4 — Phase 0 report

Report 0.1–0.3 and **stop for chat audit if the answer is B**.

If the answer is A, continue to Phase 1 in the same run.

---

## PHASE 1 — REBUILD TO 30 (ONLY IF PHASE 0 CONCLUDED A)

One commit.

### 1.1 — Selection: 96 → 30

Keep the act-structured arc: addition → subtraction → multiplication →
division → missing factor.

**The count is not the goal; the variety is.** The current file concentrates 88
of 96 questions in two interaction types (single-select 52, fill-blanks 36),
with `order` ×4 and `expression` ×4. A rebuild that ships 30 single-selects and
fill-blanks has fixed nothing.

Selection rules:

- Cut runs of near-identical drill first. The file's padding is structural:
  Q1–8 are eight single-digit addition facts; Q65–88 are twenty-four division
  facts in near-identical blocks of four; Q89–96 are eight missing-factor items
  differing only in blank position. These runs are where the 66 cuts come from.
- Retain **both** members of any pair that teaches a genuinely different thing
  (e.g. missing factor in the first position vs the second position is a real
  distinction — keep one of each, not four of each).
- Preserve every interaction type that currently appears. `order` and
  `expression` are the scarcest and must survive.
- Preserve the difficulty gradient inside each operation: facts → two-digit →
  three-digit / regrouping. Do not cut a lesson down to only its easy end.

Print the **selection ledger**: one row per original question 1–96, marked
KEPT or CUT, with a one-phrase reason for every CUT. All 96 rows. 30 KEPT,
66 CUT — assert this arithmetic and fail loudly if it does not hold.

### 1.2 — Full §5 enrichment on all 30

Every retained question ships with:

- a 3-rung hint ladder (orient / method / nearly-does-it)
- `whyWrong` for **EVERY** distractor, each tagged with a misconception code
  from `docs/MISCONCEPTIONS.md`. New misconceptions get new codes added to the
  taxonomy **in this same commit**.
- a stepped solution walkthrough (goal / working / reason per step), ending
  with a takeaway and a verification step
- an `explain` line

**EXPLAIN PRECEDENCE:** where a question carries both an in-markup explain and
a frontmatter `explain:`, the markup wins. The frontmatter explain must NOT
open with the same text as the markup explain — that makes the markup-wins
assertion undecidable and fails verify-calm.

**Hint-leak discipline:** a hint never performs arithmetic on the child's
numbers, never eliminates options, never states or restates the answer
including in disguised form. Run the hint-leak guard against every rung of
every ladder. Reword any rung that fires, before commit, and disclose every
firing in the commit message.

**Answers independently recomputed.** Recompute all 30 answers in Python
before authoring. Never copy the existing file's answer into the computed
field — the existing keys are inputs to be checked, not truth. Surface every
mismatch between the old key and your computed answer in the report; do not
silently correct one.

**Never pad.** 30 is the target because it was ruled. Do not invent questions
to reach it; if the selection rules cannot yield 30 without padding, report
the shortfall and stop.

### 1.3 — Indian cultural context

Names (Priya, Arjun, Rohan, Diya), ₹ for currency where any question carries
money. Keep objects convention-neutral per the charter amendment
(India-first launch, global rollout).

### 1.4 — QA before commit

- 30/30 grade-correct on the computed answers
- 30/30 reject a wrong answer
- 90/90 hint rungs clean against the leak guard
- `npm test` green (grading harness, verify-format, verify-styles)
- Playwright at 1280px and 390px, real Chromium. Verify by computed style and
  pixel scanning, not by screenshot eyeballing and not by reading markup.

---

## PHASE 2 — REGENERATE AND RECONCILE (only if Phase 1 ran)

One commit.

- Regenerate this lesson's review page. Confirm the new page renders 30 cards
  by **measuring the rendered count**, not by asserting it.
- **Verify the shipped file before attaching:** grep the regenerated page for
  `whyWrong` and `solution` and print the counts. A rebuild that enriches the
  lesson but produces a review page still showing zero is case B arriving late
  — if that happens, say so plainly.
- Update `LESSONS-MANIFEST-G4.md`.
- Print the corpus delta **enumerated and measured**: BEFORE + change = AFTER,
  with the recorded 3,075 as the BEFORE. Do not bake in the expected 3,009 —
  measure it. Any number that moves outside this ledger fails the morning audit.

---

## Commit discipline

- Claude Code **never pushes**. Commits stay local until chat audit clears.
- Archive this brief to `docs/briefs/` as part of Phase 1's commit.
- **Deviations section is mandatory** in the report — including transient tool
  errors. Its absence is itself an audit flag.
- Report unknowns as unknowns. If a step could not be measured, say it could
  not be measured; never dress an assumption as a finding.

## Report back

1. Phase 0: the source path, the counts, the explicit A/B call with its
   side-by-side justification, and the full corpus table (every row).
2. Phase 1 (if it ran): the 96-row selection ledger, the answer-recomputation
   mismatches, hint-leak firings, QA results.
3. Phase 2 (if it ran): measured render count, enrichment grep counts,
   enumerated corpus delta.
4. Deviations.
