# BRIEF-AUDIT-KEYS — touch-drag viability + answer-key accuracy audit (READ-ONLY)

**Authored:** chat-side, 2026-07-19. **Lane:** audit, no lane assigned until results.
**Invocation:** `Read BRIEF-AUDIT-KEYS.md in the repo root and execute it verbatim.`
**Runs BEFORE `BRIEF-L1-ASMD.md`.** One Claude Code task at a time.

## Why this exists

Venkat pulled one question at random —
`review/area-and-perimeter-word-problems.html`, Q19 of 25 — and it has no
correct answer. Two gardens, both 24 sq m: A is 12 m × 2 m (perimeter 28 m),
B is 6 m × 4 m (perimeter 20 m). The prompt asks which needs **MORE** fence.
The stamped key is **B**, which is the smaller perimeter. A child reasoning
correctly is graded wrong.

A random first pull hitting a wrong key is the reason for this audit. The
question is: **how many more are there?**

## THIS BRIEF IS READ-ONLY. ABSOLUTELY NO WRITES.

- **No lesson file is edited.** Not one, not even an obvious typo.
- **No answer key is corrected.** Not even where the correct value is
  unambiguous.
- **Nothing is committed.** No commits at all, including a "just the report"
  commit. The report is printed to the terminal and written ONLY to
  `docs/audits/KEY-AUDIT-2026-07-19.md` as a new untracked file.
- **No engine or tool file is modified.** If a check needs a helper script,
  write it under `tools/scratch/` as new untracked files; do not touch existing
  guards, and do not add it to `npm test`.

**Rationale, and do not override it:** auto-fixing a key requires deciding what
a question MEANT. Q19 is internally consistent under two different repairs
(flip the key to A, or change MORE to LESS) and only a human can rule between
them. A wrong auto-fix is worse than a known-wrong key, because it looks
resolved.

## Scope fence

**GRADE 4 ONLY** — `lessons/` and its manifest. `lessons-g3/` is not scanned,
not counted, not mentioned in totals. Grade 3 numbers are untouched.

Audit the **lesson sources in `lessons/`**, not the generated pages in
`review/`. If a lesson's source cannot be located, that lesson is a row in the
UNVERIFIABLE table with reason `source not found` — it is never silently
skipped.

---

## PHASE 0 — TOUCH-DRAG VIABILITY. RUNS FIRST. READ-ONLY LIKE THE REST.

**Why this is first and why it may outrank everything else in this brief:**
a wrong answer key costs one question. Drag that does not work on a phone costs
EVERY drag question for every child on a phone — the question becomes
unanswerable, usually failing silently with no error and no tile movement.
An unanswerable question outranks a wrongly-graded one.

Context: HANDOFF-24 records commit `2366311`, "sb-tile touch fix + guard
extension (31 G4 questions)". Touch dragging was broken for at least one tile
type recently and was repaired for that type. **Whether other drag interactions
were covered is unknown.** This phase establishes it by measurement.

### 0.1 — Discover the drag paths from the code, not from assumption

Read the engine and enumerate **every distinct code path by which a child moves
an element with a pointer**. Report each with its entry function and the file
and line where it binds its input events.

The chat's working assumption is that there are two paths — one for
categorize/bins and one for order/sequence-build — but **this assumption is
from chat-side memory and has NOT been verified against the current engine.**
Do not take it as given. If there is one shared path, three paths, or a path
the chat has never named, report what is actually there. If your findings
contradict the assumption above, say so explicitly; that contradiction is a
finding, not an inconvenience.

For each path, report which input events it binds: mouse only, pointer events,
touch events, or HTML5 drag-and-drop. **HTML5 drag-and-drop does not fire on
touch devices at all** — any path relying on it is broken on mobile by
construction, and that conclusion can be drawn from the code without a browser.

### 0.2 — Count the exposure

Across `lessons/` (Grade 4 only), count questions using a drag interaction,
broken out **by the paths discovered in 0.1** — not by the chat's guessed
labels. Print the per-path totals and a per-lesson table, every row.

This number is the blast radius. State it plainly.

### 0.3 — Test each path under REAL touch emulation

Real Chromium at 390px with **touch emulation enabled**, dispatching genuine
touch events (`touchstart` / `touchmove` / `touchend`) or Playwright's touch
API.

**THE TRAP, STATED EXPLICITLY:** driving mouse events at a 390px viewport is
NOT a mobile test. It will pass on a build that is completely broken on real
phones, because the narrow viewport changes layout while the input path stays
desktop. If the harness cannot dispatch true touch events, **report that it
could not and mark the result UNVERIFIED** — do not substitute a mouse-driven
run and describe it as a mobile test.

For each discovered path, using a real question from `lessons/`, report:

1. does the tile visibly move on touch-drag (report the measured
   transform/position delta, not a screenshot impression)
2. does it land in the target bin/slot
3. does the drop register in the answer state
4. does **Check** grade it correctly afterwards

All four, per path, each a measured PASS / FAIL / UNVERIFIED. A path that
fails at step 1 still gets steps 2–4 reported as N/A with the reason.

### 0.4 — Prove the observation is real

For any path reporting PASS, sabotage its touch handling, re-run, and show the
actual FAIL output, then restore and show PASS again. A green result never
observed failing is faith, not a measurement — and a harness that reports PASS
against a deliberately broken path is itself broken, which is the single most
important thing this phase could discover.

Restore the sabotage completely. Confirm the working tree is clean at the end
of Phase 0 — `git status` printed verbatim.

### 0.5 — Phase 0 verdict

State plainly, in one sentence per path, whether a child on a phone can answer
that question type today. If any path is FAIL or UNVERIFIED, say so in the
report's opening paragraph alongside the key-audit headline.

**Do not fix anything.** Engine repair is chat-authored and separately briefed.
Report and continue to Phase A.

---

## PHASE A — Partition the corpus. This phase's output is two numbers.

Before checking anything, classify **every question in `lessons/`** into
exactly one bucket, and print the counts:

**CHECKABLE** — the correct answer is derivable by computation from data
present in the question itself (numeric expression, dimensioned figure,
structured table). A machine can determine truth.

**NOT CHECKABLE** — correctness depends on reading prose and inferring intent:
word problems whose operation is implied, questions whose key depends on which
quantity the sentence asks for, anything where two different readings of the
prompt yield two different valid keys.

Print:

- total questions in `lessons/` (measured, against the recorded **3,075**;
  enumerate any difference, never reconcile silently)
- CHECKABLE count and percentage
- NOT CHECKABLE count and percentage
- the same split per lesson, full table, every row

**THE NOT-CHECKABLE COUNT IS A HEADLINE FINDING, NOT A FOOTNOTE.** State it in
the report's first paragraph. If this audit verifies 2,000 of 3,075 questions
and finds 40 defects, silence about the remaining 1,075 means nothing was
learned about them — say exactly that, in those terms. Do not let a clean
result on the checkable subset read as a clean bill of health for the corpus.
Anti-laundering law: an unknown is reported as an unknown.

---

## PHASE B — Run the checks over the CHECKABLE bucket

Recompute in Python. `round_half_up`, `Decimal` for money. **Never read the
stamped key before computing** — compute first, then compare, so the stored
value cannot anchor the computation.

### B1 — Arithmetic and formula mismatch
Recompute the answer from the prompt's own numbers. Flag every disagreement
with the stamped key. Covers arithmetic, area, perimeter, rounding, unit
conversion, elapsed time, money.

### B2 — Figure/key contradiction
Where a figure carries dimensions, read the geometry from the SVG and compute
from **it**, not from any text restatement. Flag disagreement with the key, and
separately flag any case where the figure's dimensions contradict the prompt's
stated numbers.

### B3 — Comparison-direction check (THE Q19 PATTERN — treat as first-class)
For any question that compares two or more quantities:
- compute the quantity for each candidate
- detect the comparison word in the prompt: MORE / LESS / LARGER / SMALLER /
  LONGER / SHORTER / GREATER / FEWER / MOST / LEAST
- flag when the stamped key points at the candidate that **contradicts** the
  comparison word

Report each hit with **both computed values and the comparison word**, so the
reviewer can rule which repair is correct. Do NOT propose which repair to make.

### B4 — Structural impossibility
- single-select / multi-select: stamped key not among the options
- duplicate option values within one question
- fill-blanks: key count ≠ blank count
- `order`: key is not a permutation of the supplied tiles
- `categorize`: a key names a bin that does not exist
- any question whose key is empty, malformed, or unparseable

### B5 — Internal consistency of enrichment
- the `explain` or walkthrough states a final value that differs from the key
- a hint states or implies a value contradicting the key
- `whyWrong` attached to the option that is actually correct

B5 catches keys that are wrong in a way the arithmetic agrees with — where the
author's own explanation disagrees with the author's own key.

---

## PHASE C — Report

Write to `docs/audits/KEY-AUDIT-2026-07-19.md` (new, untracked) and print.

**Opening paragraph, mandatory:** total questions, CHECKABLE count,
NOT CHECKABLE count, defects found, and one plain sentence on what the audit
does NOT cover.

**Defect table — one row per hit, every hit, no truncation:**

| # | lesson | q# | check (B1–B5) | prompt snippet (verbatim, ≤80 chars) | stamped key | computed | the mismatch |

Then:
- defect counts by check, by lesson, and by question type
- **UNVERIFIABLE table**: every question the audit could not evaluate, with the
  reason it could not (`prose-dependent`, `figure without dimensions`,
  `source not found`, `unparseable`, …). Full table, every row.
- a severity split: **grades-a-correct-child-wrong** (child is penalised for
  being right) vs **cosmetic/other**. The first group is the emergency.

**Do not rank, prioritise, or propose fixes.** Do not label any defect
"benign", "minor", or "likely intentional" — the reviewer decides what is
benign, not the classifier. Print rows; do not editorialise.

**Do not fix Q19.** It is already known and is a chat-side ruling pending.
Include it in the table as confirmation the audit detects it — if B3 does NOT
flag Q19, the check is broken and you must say so.

## Deviations

Mandatory section. Include transient tool errors, any lesson that failed to
parse, and every heuristic you chose where the brief left the method open —
state the heuristic and its false-positive/false-negative risk in plain terms.
If a check could not be implemented as specified, say it could not be, and do
not substitute a weaker check silently.

## Report back

1. **Phase 0**: drag paths discovered (with file:line), exposure counts per
   path, the four-step touch result per path, the sabotage proof, and the
   plain-language verdict on whether a phone user can answer today.
2. Phase A partition, with the NOT-CHECKABLE number stated plainly.
3. Phase B defect table, complete.
4. The severity split.
5. The UNVERIFIABLE table.
6. Deviations.

Then STOP. No fixes, no commits, no follow-on work self-commissioned.
