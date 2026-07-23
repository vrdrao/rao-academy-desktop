# BRIEF-CENSUS-1 — Census of duplicate review pages

**READ-ONLY. This brief changes nothing. No deletions, no edits, no commits, no
pushes, no regeneration. If any instruction below appears to require a write,
STOP and report instead.**

**Authored chat-side, 2026-07-20. Executes against
`C:\Users\Venkat Rao\Desktop\rao-academy`.**

---

## 0. WHY THIS EXISTS

Venkat reported that `review/` contains duplicate pages he does not want to
review. He named eleven by eye. Ten end in `_1to1`, one ends in `_faithful`.

A standing chat-side instruction reads: **"Ship REMIX only (SQL import file)
plus updated `preview-engine.js`. Do not generate the 1:1 faithful HTML file."**
So the pipeline once emitted extra artifacts per lesson and a ruling stopped it.
Files predating that ruling may still be on disk.

**Two possibilities, and they demand different fixes:**

1. **Orphans** — generated before the ruling, never regenerated, nothing feeds
   them now. Deleting them is permanent.
2. **Live output** — a source in `lessons/` or `lessons/incoming/` still emits
   them on every regeneration sweep. Deleting them is temporary; they return.

**Nothing is deleted until this brief reports.** Standing law: *a class defined
by a rule must name its members before anything is deleted.*

**Scope fence: Grade 4 only. Do not read, list, or touch `lessons-g3/`.**

---

## 1. VENKAT'S LIST — to be verified, not trusted

```
time_units_1to1
names-for-numbers_1to1
multiply-a-two-digit-number-by-a-three-digit-number-word-problems__1to1
estimate-products_1to1
box_multiplication_1to1
bar_graphs_1to1
am-or-pm_1to1
Time_patterns_1to1
Subtraction_missing_digits_1to1
Multiply_two-digit_by_two-digit_word_problems__1to1
even_odd_faithful
```

Read off a folder by eye. **Treat this as a sample, not the class.** Task A
defines the class by rule; this list is checked against it as a subset.

Note the inconsistent conventions — mixed capitalisation, single vs double
underscore before `1to1`. That inconsistency is itself evidence about how many
different pipeline runs produced these. Report it.

---

## TASK A — Name the full class by rule

List every file in `review/`. For each, record filename, size in bytes, and
mtime.

Then match **case-insensitively** against both patterns:

- `*1to1*` (any separator: `_1to1`, `__1to1`, `-1to1`)
- `*faithful*` (any separator)

**Report:**

1. Total file count in `review/`.
2. Every pattern match, with size and mtime, sorted by mtime.
3. **Which of Venkat's eleven are NOT matched by the rule**, if any.
4. **Which rule-matches are NOT on Venkat's list** — the ones his eye missed.
5. Count of `review/` files remaining after excluding all matches. **State
   whether that equals 118.**

Do not delete. Do not rename. List only.

---

## TASK B — Orphan or live output? (THE LOAD-BEARING QUESTION)

For each file matched in Task A, determine whether anything still generates it.

1. List every file in `lessons/` and in `lessons/incoming/`. **Do not touch
   `lessons-g3/`.** Report both counts.
2. For each Task A match, is there a correspondingly-named source in either
   directory — including a `1to1`/`faithful` variant source?
3. Read `tools/make-review.js`. Answer precisely:
   - How is the output filename derived from the input filename?
   - **Can a single source file emit more than one review page?** Quote the
     relevant lines.
   - Is there any conditional, flag, or branch that would emit a `1to1` or
     `faithful` variant?
4. Grep the repo (excluding `review/` itself and `lessons-g3/`) for the strings
   `1to1` and `faithful`. Report every hit with file and line. **A hit inside
   tooling means the mechanism still exists.**

**Report a verdict per file: ORPHAN (no source, no mechanism) or LIVE (a source
or mechanism still emits it).** Where the evidence does not support a verdict,
say **UNMEASURED** — do not guess. Anti-laundering applies.

---

## TASK C — Locate six question IDs

These six IDs were logged during review as partial-product box questions
(Item 48):

```
qukz2ne4j
qwy5e27zq
qnh5ry3b4
q55c5764u
qyz6te24b
qpg3sxjip
```

Using `docs/question-ids.json` and the lesson sources:

1. For each ID, report the `file` field from the ledger.
2. State whether that file is one of the Task A matches.
3. Report which `review/` page(s) render each ID.

**This determines whether Item 48 describes questions that ship or questions in
a file about to be deleted.** Answer it plainly.

---

## TASK D — Four more IDs

Same treatment as Task C. These were logged as defects today:

```
q86pfikqr    (options may not contain the correct answer)
qe4c5gevv    (categorize renders with no data table)
qszpxymg7    (categorize renders with no data table)
qv7w53wqn    (comparison figures stacked vertically)
```

For each: ledger `file`, whether that file is a Task A match, and which
`review/` page(s) render it.

**Do not diagnose these defects. Do not read their frontmatter for correctness.
Location only.** A separate brief handles the defects.

---

## TASK E — `bar_graphs_1to1` and the skip list

`bar_graphs_1to1` appears on Venkat's duplicate list. It also appears on a
chat-side do-not-log list described as "fully triaged — skip entirely."

Report:

1. Does `review/bar_graphs.html` exist alongside `review/bar_graphs_1to1.html`?
2. Does a `bar_graphs` source exist in `lessons/` or `lessons/incoming/`?
3. Question count in each.

**No ruling. Facts only.** Chat rules on whether the skip-list entry was a
misfiling.

---

## 2. WHAT NOT TO DO

- **Do not delete, move, or rename anything.**
- **Do not regenerate any review page.**
- **Do not commit. Do not push.**
- **Do not touch `lessons-g3/` or `sources-g*/`.**
- **Do not modify `docs/question-ids.json`.** It is append-only and every ID in
  it is permanently taken.
- **Do not tidy the untracked `BRIEF-*.md` files** — offered in a prior session,
  not authorised.
- **Do not fix anything found.** Report and stop.
- **Do not tune any count to match an expected number**, including 118.

---

## 3. REPORT FORMAT

One report, these sections: Task A, Task B, Task C, Task D, Task E, then:

**Anything noticed but not acted on.**

Every number traceable to the command that produced it. Where a question cannot
be answered from what was read, write **UNMEASURED** rather than inferring.

**If any task turns out to require a write to answer, STOP and say so.**
