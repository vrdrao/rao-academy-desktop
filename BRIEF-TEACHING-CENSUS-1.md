# BRIEF-TEACHING-CENSUS-1

**Type: READ-ONLY MEASUREMENT. No file in `lessons/` or `engine/` may be modified.**

**Authority:** `STUDENT-INTERACTION-RULES.md` (18 rules). Read it before starting.
This brief measures the corpus against rules 16, 17 and ISSUES #64. It changes nothing.

**Purpose.** Nobody knows how large the whyWrong/hint authoring job is. One lesson
(`add_5digit_word_problems`) was analysed by hand and needed **two** distinct
whyWrong messages for 13 multiple-choice questions, and had only **four** distinct
hints across 32 questions. If that shape holds corpus-wide the job is a few lines
per lesson. If it does not, it is a different job requiring a different plan.
**This measurement decides which.** Do not propose or build a review tool.

---

## HARD CONSTRAINTS

1. **READ-ONLY.** Do not edit, create or delete anything under `lessons/`,
   `lessons-g3/`, `engine/`, `tools/` or `docs/`. The ONLY write is the report
   file named in §4. Do not run `npm test`. Do not commit. Do not push.
2. **SCOPE FENCE: `lessons/` only.** `lessons-g3/` is out of scope and must not be
   read, counted or mentioned. Grade 4 only.
3. **Use the engine, do not re-parse.** `preview-engine.js` already parses every
   question and exposes `hint`, `whyWrong`, `solution`, `behavior`, `answer` and
   `id` per question (see `build()` return, ~line 2064, and the serialise path,
   ~line 2872). Drive the corpus through the engine exactly as
   `tools/verify-grading-node.js` does. **Do not write a second parser** — a
   second copy of parsing logic is how the grader and painter drifted apart and
   produced the red-box defect (ISSUES #119).
4. **Every number must be traceable.** No estimates, no "approximately", no
   rounding. If something cannot be measured, write `UNMEASURED` and say why.
   Never label an unknown with a confident-sounding word.
5. **Report the corpus totals first and stop if they disagree with the expected
   103 files / 2,668 questions.** If the counts differ, HALT, report both numbers,
   and do not proceed to §2 or §3. A changed count means something moved and must
   be reconciled before any measurement built on it is trusted.

---

## §0 — BASELINE (do this first, report, then continue)

Report, as measured:
- number of `.html` lesson files under `lessons/` (state whether `lessons/incoming/`
  and `lessons/_preview/` are included, and count them separately)
- total questions
- questions per `behavior` type (single-select, multi-select, fill-blanks, order,
  sequence-build, categorize, expression, line-plot, construct, other)

If total files ≠ 103 or total questions ≠ 2,668, **HALT and report.**

---

## §1 — HINT COVERAGE AND REUSE

Rule 16: on fill-blanks, ordering, sequence-build and categorize there is no
whyWrong, so **the hint is the only teaching a child receives.** Coverage there
is not cosmetic.

Per lesson, report:

- **1a. Hint coverage.** Questions with at least one hint rung / total questions.
- **1b. Coverage split by behavior.** Same ratio, broken out by question type.
  Call out the types rule 16 leaves hint-only (fill-blanks, order, sequence-build,
  categorize) as a separate subtotal — **this is the number that matters most.**
- **1c. Rung counts.** Distribution of rungs per hinted question (1 rung, 2, 3+).
- **1d. DISTINCT hints.** Count of unique hint texts in the lesson vs number of
  hinted questions. Compare after trimming whitespace and collapsing internal
  runs of spaces; do NOT normalise case or punctuation — report exact-match
  distinctness. **Report the ratio.** This is the single most important number in
  the brief: it decides whether hint work is review or authoring.
- **1e. The reuse shape.** For the five lessons with the LOWEST distinct-to-hinted
  ratio, list each distinct hint text verbatim with the count of questions using
  it. This shows what reuse actually looks like.

Corpus roll-up: total questions, total hinted, total distinct hint texts, and the
distribution of per-lesson distinct-hint counts (how many lessons have 1–5
distinct hints, 6–10, 11–20, 21+).

---

## §2 — HINTS THAT LEAK THE ANSWER (ISSUES #64)

**#64: no hint rung may contain the answer, at ANY rung — not merely the last.**
A hint points at the method and stops short of the arithmetic.

For every hint rung, test whether it contains the question's answer. Match per
type, as `tools/verify-content-guards.js` already does for its hint-leak check —
**reuse that matching logic; do not invent a second one.** If its approach does
not cover a behavior type, say so and mark that type `UNMEASURED` rather than
guessing.

- numeric answers: whole-token match, so `40` does not match inside `408`
- text answers: substring match
- order / sequence-build: the answer sequence appearing in the rung
- categorize: bin-mapping appearing in the rung

Report: every leaking rung, with lesson, question id, behavior, the rung text
verbatim, and the answer it exposes. Then a per-lesson count and a corpus total.

**Do not fix any of them.** List only.

---

## §3 — THE whyWrong GAP, MEASURED AGAINST RULE 16

**This is the section that resizes the backlog.** The number quoted so far —
"84 of 103 lessons have no whyWrong" — counts every question type. Rule 16 says
whyWrong is required **only** where the wrong answers are a fixed authored set:
**single-select and multi-select.** Fill-blanks, order, sequence-build and
categorize are hint-carried by ruling, so their absence is NOT debt.

- **3a. The real gap.** Count single-select + multi-select questions ONLY.
  Report: how many have a whyWrong for every wrong option; how many have a
  partial whyWrong (some options covered, some not); how many have none.
  Per lesson and corpus total. **The corpus "none" figure is the true size of
  the authoring job.**
- **3b. Debt that is not debt.** Count fill-blanks / order / sequence-build /
  categorize questions with no whyWrong, and report separately as
  `NOT-DEBT-PER-RULE-16`, so this number is never again added to the gap.
- **3c. whyWrong that should not exist.** Rule 16 scopes whyWrong to select types.
  Report any whyWrong found on a non-select question — lesson, id, behavior.
  Do not remove them; list only.

### 3d — DISTRACTOR PATTERN COUNT (the decisive measurement)

For each lesson, for single-select and multi-select questions **whose answer and
options are all numeric**, compute for every wrong option the arithmetic
difference `wrong − correct`, and count how many DISTINCT differences the lesson
contains.

Rationale, from the hand analysis: in `add_5digit_word_problems` every distractor
was a missed carry, so the differences were only `−10`, `−100`, `−1,000`,
`−10,000` and combinations, plus two at `+1,000`. Two message patterns covered
52 distractors, and the difference itself names the column — so the messages are
generable rather than hand-written.

Report per lesson: number of numeric select questions, total wrong options, and
**the count of distinct differences**. Then list the differences themselves for
the ten lessons with the FEWEST distinct differences, and the ten with the MOST.

Flag separately, do NOT attempt to interpret:
- lessons where options are non-numeric (report as `NON-NUMERIC`, with a count)
- lessons where differences look unpatterned (say so plainly; do not invent a
  misconception name for them)

**Do not write any whyWrong text. Do not name misconceptions. Do not touch
`docs/MISCONCEPTIONS.md`** — it is unaudited and ISSUES #114 records a structural
defect in it. This brief measures; it does not author.

---

## §4 — OUTPUT

Write ONE file: `docs/audits/TEACHING-CENSUS.md`.

Structure it as: §0 baseline · §1 hints · §2 leaks · §3 whyWrong · then a final
section headed **"WHAT THIS MEANS FOR THE SIZE OF THE JOB"** containing, in plain
language and no more than fifteen lines:

- the true number of questions needing a whyWrong (3a "none" total)
- the number of lessons whose distractors fall into 5 or fewer distinct patterns
- the number of questions with no hint in the hint-only types (1b subtotal)
- the number of leaking hints (§2)

Per-lesson tables go in the report file, not in the chat summary.

**In chat, report only:** the §0 baseline, those four headline numbers, and
anything that HALTED. Nothing else.

---

## §5 — WHAT TO DO IF SOMETHING IS UNCLEAR

**Stop and report. Do not infer.** If a rule seems not to cover a case, say so and
leave it `UNMEASURED`. Do not fix anything you find, do not extend scope, do not
propose follow-up work in the report — findings only. If a defect turns up, it
goes in the report as a finding; it is not fixed here.
