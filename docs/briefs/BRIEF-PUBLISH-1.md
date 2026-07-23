# BRIEF-PUBLISH-1 — the no-dead-end cap, the layout bundle, and Item 52

**Chat-authored. Execute verbatim. Do not self-commission beyond this file.**

**ONE commit for everything in this file.** Commits and pushes are the expensive
step, not the work.

**Scope fence:** Grade 4 only. `lessons-g3/`, `sources-g3/`, `sources-g2/`,
`sources-g5/`, `sources-g6/`, `sources-g7/` are OUT OF SCOPE — do not read or
write them.

**Supersedes the earlier draft of this filename.** That draft carried tasks for
Items 33, 38, 51, the keypad operator, the `CLAUDE.md` version, and the pre-push
hook. **BRIEF-CONTENT-1 (commit `cd5c093`) completed or correctly stopped all of
them. Do not redo that work.** If any of it appears undone, that is a finding —
report it, do not silently re-execute.

**Ordering rationale (Venkat's §2 volume rule):** Task A affects roughly 2,295
questions and is the last true ship-blocker on the Grade 4 finish line. Tasks B
and C are cosmetic and cheap, riding an already-expensive commit. Tasks D and E
are near-zero-cost cleanups.

---

## 0. PREMISES — MEASURE THESE FIRST, THEY MAY BE WRONG

Chat measured the following against the **project-copy** of `rao-card.js`, NOT
the repo. **Re-measure every one against the repo before acting.** Report each
CONFIRMED or DISPROVED with the evidence.

**Chat premises have now been false five times. The most recent — the pre-push
hook duplication in BRIEF-CONTENT-1 Task G — was caught only because the brief
required measurement before action. A correct STOP is a success.**

| # | Premise | Chat's measurement |
|---|---|---|
| P1 | A two-wrong-attempt cap already exists | `rao-card.js:~427` — `var capped = wrongCount >= 2 && canWalk();` |
| P2 | The cap only fires when a walkthrough exists | `canWalk()` at `~168` requires `solution` **and** `window.RaoSolution.renderWalkthrough` |
| P3 | With no solution, the child gets `feedbackRow("Try again")` indefinitely | the `else` branches at `~440–450`; the in-file comment says "a question with no solution keeps today's retry loop (parked item)" |
| P4 | `openWalkthrough()` at `~291` is the correct structural template for the fallback | it locks, sets outcome, removes the row, freezes the task, hides the foot, quiets chrome, hides the hint button, then offers "Next question →" via `onDone` |
| P5 | `revealCorrect()` and `nextQuestion()` already exist and are reusable | called from `openWalkthrough`'s `onReveal` / `onDone` |
| P6 | `setOutcome()` records an outcome string on the frame and dispatches `rao:outcome` | `~125` |

**If P1 is DISPROVED — if no cap exists at all — STOP and report.** The whole
shape of Task A changes and chat must re-rule.

---

## Task A — ITEM 50: no dead ends. **This is the brief's reason for existing.**

### The defect, stated precisely

The two-attempt cap is **already correct** where a walkthrough exists. The
defect is the `&& canWalk()` conjunct: on a question with no authored
`solution:`, the second wrong answer falls through to `feedbackRow("Try again")`
and the child can retry forever with nothing new ever offered.

Only a minority of the corpus has a walkthrough (`whyWrong` coverage measured at
280/2668; **solution coverage is UNMEASURED and must be measured in A1**). The
dead-end path is likely the *normal* path, not the edge case — but that is chat's
expectation, not a measurement. **A1 decides it.**

### A1 — Measure the blast radius BEFORE changing anything

Report, corpus-wide across `lessons/` (including `lessons/incoming/`):

- How many of the 2,668 questions have an authored `solution:` (→ `canWalk()`
  can be true).
- How many do not (→ the dead-end path today).
- The per-lesson breakdown for any lesson at 100% or 0%.

**Do not estimate. Count.** State both numbers plainly; they go in the
completion report and in `docs/ISSUES.md`.

**If the count of questions WITHOUT a solution is zero or near-zero, STOP and
report** — Item 50 would not manifest, exactly as Items 33 and 41 did not, and
the fix would be solving a problem that does not exist.

### A2 — Venkat's ruling, to implement exactly

> **Two wrong attempts is the cap on EVERY question, walkthrough or not.**
>
> Where a walkthrough exists: current behaviour is unchanged — it opens
> automatically. **Do not touch that path.**
>
> Where none exists: **reveal the correct answer, show a brief encouraging
> line, mark the question attempted-and-shown, and offer "Next question →".
> No third attempt. No dead end.**

**Explicitly forbidden — Venkat ruled on this directly:** do NOT fabricate an
explanation. A plain statement of the correct answer is honest; an invented
reason for *why* it is correct is not, and would teach a child something we
never authored. **No generated pedagogy. No templated "because…" sentences.**
If authored `explain:` content exists on the question it may be shown. If it
does not, show nothing beyond the answer and the encouraging line.

### A3 — Implementation

Model the new path on `openWalkthrough()` (P4). It must, in this order:

1. Return early if already `locked`.
2. Set `locked = true`.
3. `setOutcome(...)` — **a NEW outcome string distinct from
   `solved-with-help`**, e.g. `shown-answer`. These two are pedagogically
   different and analytics must be able to tell them apart. Name your choice in
   the report.
4. `removeRow()`, `freezeTask(true)`, `hideFoot(true)`, `quietChrome(true)`,
   hide the hint button — same as the walkthrough path.
5. Reveal the correct answer via the existing `revealCorrect()`. **Reuse it; do
   not write a second reveal path.**
6. Show the encouraging line. Short, warm, non-judgemental. It must NOT imply
   the child failed. **Put the exact string in the report for Venkat to
   overrule.**
7. If authored `explain:` content exists, show it. If not, show nothing more.
8. Offer `Next question →` wired to the existing `nextQuestion()`.

**The `whyWrong` bubble that types before the cap fires must keep typing first**
— help accumulates (law 5). The fallback opens *after* it, exactly as
`openWalkthrough()` does in the `capped` branch.

**No-repaint law:** the question DOM must not rebuild. The reveal and any panel
are **append-only**.

### A4 — Guards, guard-first

**Both must be proved to FAIL before the change and PASS after.** Stage new
files before `npm test` — `verify-tracked.js` fails on untracked files.

- **Guard 1 — no dead end.** A question with **no** `solution:`, answered wrong
  twice, must end locked with the answer revealed and a Next control present.
  **The assertion must include that no "Try again" control remains** — that is
  the actual defect, and a guard that misses it is worthless.
- **Guard 2 — the walkthrough path is unchanged.** A question **with** a
  `solution:`, answered wrong twice, must still open the walkthrough and record
  the existing outcome. This is the regression guard on the minority that
  already works.

**Sabotage both.** Disclose the exact sabotage, its failure text with real
numbers, and its exit code. **A weak sabotage must be named as weak, not
hidden.** Test discriminators must discriminate.

### A5 — Visibility law

Verify at **390×844** and **360×780**, with real CDP touch events (never mouse
simulation), that after the second wrong attempt the revealed answer and the
Next control are **visible inside the viewport**. Scroll into view before
checking — below-the-fold is not hidden, but it must be reachable.

---

## Task B — The layout bundle: Items 29, 39, 40, 42, 46, 47

**One scan, then one fix pass. Not six briefs.**

### B1 — Scan first, read-only

Write `docs/audits/LAYOUT-SCAN.md`. For each item below, report **how many
questions are affected and in which lessons**. Chat has never measured any of
these; the counts drive whether each is worth fixing at all.

| Item | Defect |
|---|---|
| 29 | Multi-expression prompts run horizontally; must stack |
| 39 | Comparison figures stack vertically; must sit side by side |
| 40 | `q86pfikqr` — dimension labels collide with the figure boundary |
| 42 | Options render full-width single column; should be 2×2 |
| 46 | `q8nhv3ty3` — y-axis interval too fine (5s to 100). Sibling `qpwstmk82` is the correct pattern |
| 47 | `qpwstmk82` — chart legend clipped; "Cats"/"Dogs" lose the final letter |

**Report counts before fixing.** If any item affects zero questions, say so and
close it as `not-a-defect` — that is a valid finding, not a failure. **Items 33
and 41 both measured zero; expect at least one of these to do the same.**

### B2 — Fix

Chat's rulings, to implement:

- **39** — side-by-side on desktop/tablet, stacked on phone. `rao.css` already
  carries 16 `@media` + 9 `@container` queries; **use the existing responsive
  mechanism, do not invent a new breakpoint scheme.**
- **42** — 2×2. Note `--rz-opt-cols:2` already exists and `.opts` uses
  `repeat(auto-fit,minmax(150px,1fr))` at desktop width. **Measure why it is
  rendering single-column before changing anything** — this may be a content
  issue (long option text) rather than CSS. Report the cause.
- **46** — copy the interval pattern from `qpwstmk82` verbatim. Do not invent a
  new scale.
- **29, 40, 47** — fix as described; report the mechanism chosen.

**Fix the general case, not the file.** If three or more questions share a
defect, it is a corpus sweep, not a per-file edit.

**Packed CSS caution:** `rao.css` and the engine's `MARKUP_STYLE_CSS` blob are
packed one-liners. Use zero newline escapes when editing them, and **verify via
`getComputedStyle`, never via markup.**

**`.order-slot` has `transition: border-color .15s`** — wait ~250 ms before
reading computed style in Playwright.

---

## Task C — ITEM 52: Check reachable without scrolling

The Check button must be reachable at **390×844 without scrolling**. Kids should
not have to hunt for it.

**Measure first:** on how many questions is it currently below the fold at
390×844? Report the count. **If the answer is zero, close Item 52 as
`not-a-defect` and change nothing.**

If non-zero, fix, then build a guard asserting Check is within the viewport at
390×844 on a representative sample. **Name the sample and why it is
representative** — do not claim corpus-wide proof from three questions.

---

## Task D — Reconcile an unexplained number

BRIEF-CONTENT-1 reported `verify-format` as **PASS (all 102 match)**.
BRIEF-BATCH-1 reported the same guard as **PASS (bar_graphs_remix identical)**.
The corpus is **103 lessons**.

**Chase every changed number.** Determine what 102 counts and why it is not 103.
Chat's expectation — UNMEASURED — is that it counts review pages or format-
comparable files rather than lessons, and that no lesson has been lost. **The
corpus tripwire reading 2,668 is consistent with nothing lost, but that is not
proof.**

Report what the number is, why it is 102, and whether it is correct. **If a
lesson is genuinely missing from that guard's scope, that is a STOP.**

---

## Task E — `docs/ISSUES.md`

**Rows are never deleted, only closed. Item numbers are permanent.**

- **Item 50** — resolution must name the real root cause (the `&& canWalk()`
  conjunct, **not** "no cap exists"), both counts from A1, and the new outcome
  string. Close only if Task A fully landed. **If A1 stopped, record the finding
  and leave the row open.**
- **Items 29, 39, 40, 42, 46, 47** — close each individually with its measured
  count from B1 and the mechanism used. Any that measured zero close as
  `not-a-defect`.
- **Item 52** — close, or close as `not-a-defect` if the count was zero.
- **Item 45** — update, do not close. Task A's guards extend answerability
  coverage but do not complete it.
- **Item 49** — **do not close.** Task A makes the missing content survivable; it
  does not author it.
- **OPEN new rows** for anything found along the way, including Task D's finding
  if it is a defect. **Next free numbers. Never reuse or renumber.**

---

## Task F — Regenerate review pages

Review pages bake the engine in. Tasks A and B both change engine or CSS, so
**regenerate every review page**: `node tools/make-review.js lessons/<file>.html`,
one per lesson. **There is no sweep command — `npm run review` does not exist.**

---

## COMPLETION REPORT — required contents

1. **P1–P6 re-measured against the repo**, each CONFIRMED or DISPROVED with
   evidence.
2. **Task A:** both counts from A1; the outcome string chosen; the exact
   encouraging-line copy; both guards' sabotage text and exit codes; the
   390×844 and 360×780 visibility results.
3. **Task B:** the per-item counts from B1, and the cause of the Item 42
   single-column rendering.
4. **Task C:** the below-the-fold count.
5. **Task D:** what 102 counts, and whether it is correct.
6. **Corpus question count before and after — both must read 2,668.**
7. **Every guard in `npm test` named individually with its exit code.** Current
   baseline is **27** (BATCH-1 added two, CONTENT-1 added two). **If any
   pre-existing guard behaves differently than before, that is a STOP.**
8. `npm test` full run, exit code shown, **unpiped**.
9. `git log --oneline origin/main..HEAD` with the enumerated list. **Report the
   number; do not assert an expected value** — Venkat is now pushing once daily
   and several commits may be ahead.
10. Anything skipped, and why.

**ONE commit for all of it. Do not commit per task.**

**Do not push.** Venkat pushes after chat audits this report.
