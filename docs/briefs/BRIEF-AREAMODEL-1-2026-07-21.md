# BRIEF-AREAMODEL-1 — Item 48: typed cells in the partial-product box

**Chat-authored. Execute verbatim. Do not self-commission beyond this file.**

**ONE commit.**

**Scope fence:** Grade 4 only. `lessons-g3/`, `sources-g3/`, `sources-g2/`,
`sources-g5/`, `sources-g6/`, `sources-g7/` are OUT OF SCOPE — do not read or
write them. **This brief establishes the format that Grade 3 authoring will
use; it does not author any Grade 3 content.**

---

## 0. WHY THIS EXISTS — and why the original ruling changed

`docs/ISSUES.md` Item 48 says the partial-product box "should be drag-to-cell,
not multi-select." **Venkat has re-ruled it as TYPED CELLS, 2026-07-21.**

**Record this reasoning in the ISSUES row (Task E).** Item 48 was ruled once
before without its reasoning written down, which is why it is being re-litigated
today. The same failure made a superseded tile-sizing scheme resurface twice.

The reasoning, for the record:

1. **Reuses a proven mechanism.** `divisionTable()` already emits
   `<input class="blank-input" data-blank="N">` into table cells, and
   `fill.serialize` (`preview-engine.js:2480`) sorts every `.blank-input` under
   the question root by `data-blank` — it does not care where the input sits.
   Drag-to-cell would need a new drop-target system inside an SVG, touch
   handling, ghost snapshots and a new grading path. **Build inside, not
   beside.**
2. **Typing tests more than dragging here.** A child who types `3600` into the
   tens×tens cell has done the multiplication. A child who drags a pre-made
   `3600` tile has recognised it. Worse, four tiles into four cells leaks:
   getting three right makes the fourth free.
3. **It mirrors paper.** Children write partial products into boxes in a
   notebook.

**On the apparent conflict with Item 53** (MCQ preferred over fill-blanks):
Item 53's reasoning is about *answer selection* — tapping one of four options
beats typing it. The area model is not selection; the pedagogical content IS
"which product belongs in which cell," which cannot be expressed as a tap
without drag-to-cell or an unusable twelve-option grid. **Venkat has ruled this
a legitimate exception. Note it in Item 53's row so it is not re-litigated.**

---

## 1. PREMISES — MEASURE FIRST

Chat measured the following against the **project-copy** of
`preview-engine.js`, NOT the repo. **Re-measure every one. Report CONFIRMED or
DISPROVED with evidence.**

**Chat premises have been false five times. A correct STOP is a success.**

| # | Premise | Chat's measurement |
|---|---|---|
| P1 | `areaModel(top, side, mode, sums, hi)` renders the box grid as static SVG | `~line 205`, called at `~414` from the figure dispatcher |
| P2 | `areaModel` emits **zero** inputs — the grid is a picture | grep for `blank-input` in the function body returns 0 |
| P3 | `mode: "blank"` already draws an empty cell with a dashed underline | `~line 239` |
| P4 | `divisionTable()` is the working precedent for inputs in cells | it emits `<input class="blank-input" data-blank="${b++}">` |
| P5 | `fill.serialize` collects **every** `.blank-input` under the question root, ordered by `data-blank` | `:2480` — `root.querySelectorAll(".blank-input")` then sort |
| P6 | Item 48 affects exactly 6 questions, all in `box_multiplication_remix` | ids `qukz2ne4j`, `qwy5e27zq`, `qnh5ry3b4`, `q55c5764u`, `qyz6te24b`, `qpg3sxjip` |

**If P5 is DISPROVED — if fill-blanks grading scopes blanks to the prompt or a
table rather than the whole root — STOP and report.** The entire approach
depends on it.

**Also verify and report:** whether any *other* lesson uses `area-model`
figures, and whether any of those are already fill-blanks. **A count of
`area-model` questions corpus-wide is required** — Item 48's row names 6, but
that number has never been verified and the format change may touch more.

---

## 2. THE HARD PART — SVG CANNOT HOLD AN `<input>`

`areaModel` returns an `<svg>`. **An `<input>` cannot be a direct child of
`<svg>`.** It requires a `<foreignObject>` wrapper, which carries real
cross-browser and mobile-Safari risk, or the grid must be rebuilt as HTML.

**Task A decides this, and it decides it by measurement, not by preference.**

### Task A — choose the mechanism, with evidence

Evaluate exactly two options. **Do not invent a third without reporting why.**

**Option 1 — `<foreignObject>` inside the existing SVG.** Keeps `areaModel`'s
geometry, headers, row-sum boxes and highlight logic untouched. Risk:
`foreignObject` input focus, caret behaviour and the numeric keypad on iOS
Safari and Android Chrome.

**Option 2 — an HTML grid overlaid on, or replacing, the SVG.** Inputs behave
natively. Cost: the geometry must be reproduced, and the `hi` highlight and
row-sum boxes re-implemented.

**Build a throwaway probe for Option 1 and test it under real CDP touch events
at 390×844 and 360×780.** Report:

- Does tapping a `foreignObject` input focus it?
- Does the numeric keypad appear?
- Does the caret render?
- Does `ensureDigitPad()` (the engine's own digit pad) work with it?

**If Option 1 fails any of these, take Option 2 and say so.** If Option 1
passes all of them, take Option 1 — it is the smaller change.

**Report the decision and the evidence before implementing.** Do not implement
both.

---

## 3. Task B — the authoring format

Add a `mode` to `areaModel` for typed cells. **Do not change the behaviour of
`mode: filled` or `mode: blank`** — existing questions using them must render
byte-identically. Prove this.

The frontmatter shape is your design, but it must satisfy:

- Every product cell becomes an input, numbered left-to-right, top-to-bottom, so
  `data-blank` order matches reading order.
- **The `answer:` array order must match that same reading order.** State the
  convention explicitly in the report — an author reading it must not have to
  guess.
- The row-sum boxes (`sums: show | hide | blank`) keep working. If `sums:
  blank`, decide and state whether those are also inputs. **Recommendation: they
  are** — the row sums are the next step of the same skill.
- The existing `hi` single-highlighted-cell mode is untouched.

**Write the authoring format into `WORD_TO_AUTHORING_INSTRUCTIONS.md`** with a
worked example — a complete frontmatter block for one real question, showing the
grid it produces and the `answer:` array. **This file is the artefact Grade 3
authoring will read.** Without it this brief has not achieved its purpose.

---

## 4. Task C — convert the six questions

Convert the Item 48 questions from multi-select to the new format.

**The answer keys must be DERIVED, not copied.** For a question `48 × 76`, the
partial products are computed from the decomposition — do not lift numbers from
the existing multi-select options, which may include distractors.

**Quote the source factors for each question before writing its answer array.**
Show the arithmetic. **A wrong answer key marks a correct child wrong, and that
is the one failure we refuse to ship** — the engine's own comment at
`preview-engine.js:1544` says exactly this.

**Chase every changed number.** Corpus question count before and after must both
read **2,668**. Question IDs must be preserved — these are conversions, not new
questions. `docs/question-ids.json` **must not shrink.**

---

## 5. Task D — guards, guard-first

**Each must be proved to FAIL before the change and PASS after.** Stage new
files before `npm test` — `verify-tracked.js` fails on untracked files.

- **Guard 1 — the typed grid grades correctly.** Correct entries in every cell
  → correct. One cell wrong → wrong. **The assertion must confirm that a value
  in the WRONG CELL is marked wrong** — that is the entire point of Item 48,
  and a guard that accepts right-numbers-anywhere tests nothing.
- **Guard 2 — no regression on existing area-model questions.** Every question
  using `mode: filled` or `mode: blank` renders unchanged.
- **Guard 3 — visibility.** At 390×844 and 360×780 with real CDP touch events:
  every cell input is tappable, reachable, and the Check button is still
  reachable. **The grid must not overflow horizontally.**

**Disclose every sabotage with its exact failure text, real numbers, and exit
code. Name a weak sabotage as weak rather than hiding it.**

---

## 6. Task E — `docs/ISSUES.md`

**Rows are never deleted, only closed. Item numbers are permanent.**

- **Item 48** — close, 2026-07-21. **The resolution must record the reasoning
  from §0**, not just the outcome: why typed cells over drag-to-cell, and the
  measured `area-model` question count from §1.
- **Item 53** — update the row (do not close) noting the area-model exception
  and why it is not a violation.
- **OPEN a new row** for anything found — particularly if the `area-model`
  count exceeds 6, or if Option 2 was taken and the SVG geometry had to be
  reproduced.

---

## 7. Task F — regenerate review pages

Engine change → review pages bake it in. Regenerate every page:
`node tools/make-review.js lessons/<file>.html`, one per lesson. **There is no
sweep command — `npm run review` does not exist.**

---

## COMPLETION REPORT — required contents

1. **P1–P6** re-measured, each CONFIRMED or DISPROVED with evidence.
2. **The corpus-wide `area-model` question count**, and whether it exceeds 6.
3. **Task A:** the mechanism chosen, with the four probe results at both
   viewport sizes.
4. **Task B:** the frontmatter shape, the blank-ordering convention, the
   `sums: blank` decision, and confirmation that `filled` / `blank` render
   unchanged.
5. **Task C:** for each of the six questions — the source factors quoted, the
   arithmetic shown, and the derived answer array.
6. **Task D:** all three guards with sabotage text and exit codes.
7. **Corpus question count before and after — both must read 2,668.** Confirm
   `docs/question-ids.json` did not shrink.
8. **Every guard in `npm test` named individually with its exit code.** Baseline
   is **28**. **If any pre-existing guard behaves differently, that is a STOP** —
   report it and explain, do not silently accept it.
9. `npm test` full run, exit code, **unpiped**.
10. `git log --oneline origin/main..HEAD` with the enumerated list. **Report the
    number; do not assert an expected value** — Venkat pushes once daily and
    several commits may be ahead.
11. Anything skipped, and why.

**ONE commit. Do not push.** Venkat pushes after chat audits this report.
