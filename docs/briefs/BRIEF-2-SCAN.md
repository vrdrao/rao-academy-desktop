# BRIEF-2-SCAN — READ-ONLY ENUMERATION

**Authored chat-side, 2026-07-20. Grade 4 only. `lessons-g3/` is out of scope
entirely — do not read it, count it, or mention it.**

---

## 0. THE NATURE OF THIS BRIEF

**This brief changes nothing.** No lesson file is edited. No engine file is
edited. No commit is made. No push is made. The single deliverable is a report.

If at any point you believe a fix is obvious and cheap, **do not apply it.**
Report it. Chat rules on fixes; this run only measures.

You may create scratch files under `tools/scratch/` (gitignored). Nothing else
is written.

**Working tree must be clean when you finish, apart from pre-existing untracked
files.** Confirm this explicitly in §5 of your report.

---

## 1. WHY THIS SCAN EXISTS

BRIEF-1 Item G proved that `build()` silently discarded authored content on 55
questions across four patterns. Venkat then found two more defects by eye in
`bar_graphs_1to1.html` within minutes of opening it:

- **Q4, Q5, Q10** — prompt says "which bar graph shows the same data?", the
  options are two near-identical shrunken charts, and **the data the child is
  meant to match is not on screen at all.**
- **Q11** — prompt says "which table shows the same data?", and the option
  tables render as one unbroken run of characters:
  `Orchestra instrumentsInstrumentGirlsBoysViola9010Violin5050Bass3030`.
  The table structure is gone; the cell text is concatenated.

Both are believed to be instances of classes, not one-offs. **This scan
establishes the size of each class before anything is deleted or repaired.**

Venkat has already ruled that graph-as-option questions are to be **removed**
from the corpus. That deletion is a separate brief and happens only after he
sees the real count.

---

## 2. SCAN A — QUESTIONS WHOSE OPTIONS CONTAIN A FIGURE

### What to find

Every question, corpus-wide across `lessons/`, where **the answer options
themselves contain a chart, graph, or plot** — as opposed to the stimulus
containing one.

Include: bar graphs, line plots, pictographs, line graphs, any option-embedded
SVG that renders axes, bars, or plotted points.

**Exclude, and say so if you excluded anything on this basis:**
- Questions where the figure is in the *stimulus* and the options are text.
- Geometry/shape options (shape tiles, symmetry figures, area grids). Those are
  a different class and Venkat has not ruled on them.

### How to report

A table with one row per question: lesson file, question number, question
`type:`, how many options, a one-line description of what the options show, and
**whether the stimulus data the prompt refers to is actually present in the
rendered question.**

That last column is the one that matters most. For `bar_graphs_1to1` Q4 the
answer is NO — the prompt refers to data that does not exist on the page.

Then a per-lesson count, and a corpus total.

### Method disclosure — mandatory

State exactly how you searched, and state what your method would miss. If you
used a text pattern, give it. If a question could carry a graph option in a form
your scan would not catch, say so. **An undisclosed weak scan is worse than a
disclosed one.**

---

## 3. SCAN B — QUESTIONS WHOSE OPTIONS CONTAIN A TABLE

### What to find

Every question, corpus-wide across `lessons/`, where **an answer option contains
an authored `<table>`**.

### What to determine for each

1. **Does the table survive to the rendered markup, or is it flattened?**
   Check the rendered `review/` page, not just the source. `bar_graphs_1to1` Q11
   is the known-flattened case — use it as your reference for what "flattened"
   looks like.
2. **If flattened, is the resulting text readable at all?** Q11's is not.

### The engine question this scan must answer

BRIEF-1 Item G established that `parseQuestion()` claims an authored `<table>`
only for `line-plot` (line 1260) and `bar-graph` (1218) stimulus. **Determine
whether option-level tables are claimed by any extractor at all, or whether they
fall through to the same silent-drop path.**

Quote the relevant code lines. Do not fix anything. This determines whether the
repair is an engine change or a content rewrite, and chat needs the evidence to
rule.

### Report

Same shape as Scan A: per-question table, per-lesson counts, corpus total,
method disclosure.

---

## 4. SCAN C — CLASSIFY THE 24 LINE-PLOT `<p class="context">` DROPS

BRIEF-1 Item G found 24 questions in `interpret-line-plots-remix` where a
`<p class="context">` element — described as carrying a story sentence plus a
plot title — is silently dropped by `build()`.

**Classify every one of the 24 into exactly one bucket:**

- **DECORATION** — the dropped text is scene-setting only. The question is fully
  answerable without it. Fix would be a merge into `p.prompt`, or deletion.
- **LOAD-BEARING** — the dropped text carries information the child needs: a
  number, a unit, a label, a constraint, or the plot's subject. Without it the
  question is degraded or unanswerable. Fix is a rebuild.

**Judge against the rendered page, not the source.** The test is: reading only
what actually renders, can a child answer correctly and for the right reason?

For every LOAD-BEARING item, quote the dropped text and state in one line what
the child cannot know without it.

**Do not smooth the counts.** If it splits 24/0 or 0/24, report that. If a
question is genuinely ambiguous, put it in a third bucket called UNCERTAIN and
explain why — that is a legitimate answer and is preferred over a confident
guess.

---

## 5. REPORT FORMAT

One report, five sections:

1. **Scan A** — table, counts, method disclosure
2. **Scan B** — table, counts, the engine finding with quoted code, method
   disclosure
3. **Scan C** — 24 classifications, quoted text for load-bearing items
4. **ANYTHING ELSE YOU NOTICED** — a plain list. You are reading a lot of the
   corpus in this run. If you see another defect class, name it here in one line
   each. **Do not investigate it. Do not fix it.** Just name it.
5. **CLEAN-TREE CONFIRMATION** — output of `git status`, and an explicit
   statement that no lesson or engine file was modified and no commit was made.

---

## 6. STANDING LAWS THAT APPLY TO THIS RUN

- **Anti-laundering.** Every number has a traceable source. Unknowns are
  reported as unknowns. A scan you are not confident in is disclosed as such,
  with its numbers, not withheld and not dressed up.
- **Chase every changed number.** If a corpus count you produce disagrees with
  3,014, halt and reconcile before reporting.
- **Never pad.** If a scan finds nothing, report zero.
- **Do not self-commission.** Nothing outside §2, §3, §4 is executed.
- **Never push. Never commit. Never write a handoff.**
- **If you believe this brief's premise is wrong** — as with BRIEF-1 Item B,
  where the stated cause was contradicted by measurement — **stop that scan,
  report the contradiction with evidence, and continue with the others.** A
  correct stop is a success, not a failure.
