# BRIEF-0A — MEASURE-PERIMETER (READ-ONLY)

**Authored chat-side, 2026-07-20. Scope: Grade 4 only. `lessons-g3/` is out of
scope entirely — do not read it, count it, or mention it.**

---

## 0. THIS BRIEF WRITES NOTHING

**You will not edit any file. You will not create any file. You will not stage,
commit, or push anything. You will not run any formatter, generator, or fix
script.** This brief produces a printed report in the terminal and nothing else.

If you believe a fix is obvious, **do not apply it.** Report it and stop. Chat
rules on fixes; this brief only measures.

If any instruction below appears to require a write, that is an error in the
brief. Skip that step, log it as SKIPPED-WOULD-WRITE, and continue.

---

## 1. Why this brief exists

During review, Venkat opened `review/perimeter_missing_side_remix.html`
question 1 of 25. It shows a triangle labelled 6 and 9 on two sides, asks for
the length of side `a`, and offers 5 / 7 / 8 / 15. The key is 7.

**With only two sides of a triangle and no perimeter given, side `a` is not
determined.** Any value strictly between 3 and 15 makes a valid triangle. So
5, 7, and 8 are all defensible answers to the question as displayed. A child
reasoning correctly cannot arrive at 7.

The lesson's own filename says `perimeter_missing_side`, which implies the
intended stimulus is *perimeter plus all-but-one side*. The perimeter appears
to be absent from what the child sees.

**We do not yet know whether the perimeter is missing from the source, or
present in the source and dropped by the renderer.** Those have completely
different fixes. This brief settles that and nothing else.

**Anti-laundering applies with full force.** If you cannot determine something,
report it as UNKNOWN with the reason. Do not infer, do not smooth, do not
describe an assumption in the vocabulary of a finding. A wrong confident answer
here is worse than an honest gap.

---

## 2. Files in scope

- Source: whichever file(s) generate `review/perimeter_missing_side_remix.html`.
  **Locate it; do not assume the path.** Prior work established that lesson
  sources may sit under `lessons/incoming/` rather than a flat `lessons/`.
- Rendered: `review/perimeter_missing_side_remix.html`

Print the resolved absolute path of every file you read, before you read it.

---

## 3. Tasks

### Task 1 — Locate and confirm

Find the source file for this lesson. Print:

- the source file path
- the rendered review file path
- the question count in each

If the counts differ between source and rendered, **halt Task 1, print both
counts, and continue to Task 2 with the discrepancy flagged.** Do not try to
explain it.

### Task 2 — Per-question stimulus audit, all 25 questions

For **every** question in the lesson, print one row with:

| col | meaning |
|---|---|
| `n` | question number, 1-based |
| `type` | question type (single-select, fill-blanks, etc.) |
| `perimeter_in_prompt` | YES / NO — does the prompt text state a perimeter value? |
| `perimeter_in_figure` | YES / NO / NO-FIGURE — does the figure contain a perimeter label? |
| `sides_given` | how many side lengths are visible to the child |
| `sides_total` | how many sides the shape has |
| `key` | the keyed answer |
| `unique` | YES / NO / UNKNOWN — see below |

**`unique` means: given ONLY what the child can see, is the keyed answer the
only mathematically correct answer?**

- YES = the displayed information determines the answer.
- NO = more than one option (or more than one value) is consistent with what is
  shown.
- UNKNOWN = you cannot tell. Say why in a footnote.

Do not compute `unique` by trusting the key. Compute it from the stimulus and
then compare to the key.

### Task 3 — Source vs rendered comparison

For **at least the 5 questions** with `unique = NO` (or all of them if fewer
than 5), compare the source authoring to the rendered HTML and answer:

- Is a perimeter value present in the source but absent from the render?
- Is a perimeter value absent from the source too?
- If present in source, what element carries it, and why might it not render?

Print the relevant source fragment and the corresponding rendered fragment
side by side. **Verbatim. Do not paraphrase them.**

### Task 4 — Signature scan across Grade 4

Define the signature as: *a question asking for a missing side or missing
dimension, where the stimulus shows fewer measurements than are needed to
determine the answer.*

Scan all Grade 4 lessons for that signature. Print:

- total count of matching questions
- the list of files containing them, with per-file counts
- for each file, the first matching question number as a sample

**If your scan method cannot detect this reliably, say so and describe what it
can and cannot catch.** A partial scan honestly labelled is useful. A scan
claiming completeness it does not have is not.

### Task 5 — Cross-check one known-good lesson

Pick one perimeter or area lesson that does NOT match the signature. Print two
sample questions showing what a correctly-specified missing-side question looks
like in this corpus. This gives chat a template for the rebuild.

---

## 4. Report back — enumerated, in this order

1. Resolved paths and question counts (Task 1)
2. The 25-row table (Task 2)
3. Count of `unique = NO`, `unique = YES`, `unique = UNKNOWN`
4. Source-vs-rendered fragments (Task 3)
5. Corpus signature scan results and scan limitations (Task 4)
6. Known-good template samples (Task 5)
7. `git status` — **must show no modifications.** If it shows any, something
   went wrong; say so loudly at the top of your report.

## 5. Stop conditions

- If any task would require a write, skip it and log SKIPPED-WOULD-WRITE.
- If the source file cannot be located, print everything you tried and stop.
  Do not create it.
- Do not proceed to any other brief. When this report is printed, you are done.
