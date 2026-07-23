# BRIEF-BATCH-1 — gate whyWrong, scan fill-blanks, fix the two dataless questions

**Chat-authored, 2026-07-21. Authorised by Venkat.**

**Three items, ONE commit.** Bundled deliberately: the commit and push are the
expensive step (~25 min each), not the work. Do not split this into three
commits.

Items covered: **55** (gate whyWrong), **54** (fill-blanks scan), **44** (two
unanswerable categorize questions).

---

## PRIORITISATION PRINCIPLE — why this order

Venkat's ruling, 2026-07-21: **prioritise by questions affected per unit of his
time.** Severity breaks ties within similar volume; it only outranks volume once
children are actually using the system. **Nothing is live. No child has seen any
of this.**

Item 55 touches all 2,668 questions. Item 54 measures a conversion job spanning
hundreds. Item 44 is two questions and rides along only because this brief
already commits.

---

## SCOPE FENCE

- **Three tasks. Nothing else.**
- Do not fix any other issue in `docs/ISSUES.md`, however tempting.
- Do not author `whyWrong` content for any lesson. **Task A gates; it does not
  fill.**
- Do not convert any question from fill-blanks to single-select. **Task B counts;
  it does not convert.**
- `lessons-g3/` is out of scope entirely.
- **Do not push.** Commit locally; Venkat pushes after audit.

---

## TASK A — Item 55: gate `whyWrong` with a ratcheting floor

### The problem

`npm test` runs `verify-content-guards.js --hint-leak-only`. **`whyWrong`
coverage has never been enforced.** That is how 84 of 103 lessons reached 0%
without anyone noticing.

### The constraint that shapes the fix

**Gating at 100% would turn `npm test` red immediately and keep it red for
weeks.** A permanently red suite gets ignored, then bypassed. That is worse
than no guard.

**So the guard must ratchet: it asserts coverage never gets WORSE, not that it
is good.**

### What to build

Extend `tools/verify-content-guards.js` (or add a sibling guard — your judgement,
state which you chose and why) to:

1. **Measure `whyWrong` coverage per lesson** — count of questions with at least
   one `whyWrong` entry, over total questions in that lesson.
2. **Compare against a committed floor file**, e.g.
   `docs/whywrong-floor.json`, holding one entry per lesson.
3. **FAIL if any lesson drops below its recorded floor.**
4. **PASS if a lesson rises above its floor** — and **print the lessons that
   rose**, so the floor can be raised deliberately.

**The floor file is generated once, from current measured state, by this brief.**
It is a record of where we are, not a target.

**Critical:** the guard must **never auto-raise the floor.** Raising it is a
human act, done in a brief, exactly like the corpus tripwire. **A guard that
rewrites its own expectations checks nothing.**

### Wire it in

Add it to the `npm test` chain. **It must pass on first run** — the floor is
generated from current state, so nothing can be below it yet.

### Prove it discriminates

1. Run it. Confirm PASS, and report the measured overall coverage.
2. **Sabotage:** remove one `whyWrong` entry from a lesson that has some
   (there are 19 such lessons).
3. Re-run. **It must FAIL, naming the lesson, the floor, and what it saw.**
4. **Restore exactly.** Confirm byte-identical via `git diff`.
5. Re-run. Confirm PASS.

**Report the exact failure text from step 3 and the exact pass output from
step 5.** A sabotage reported without its numbers is not a proof.

---

## TASK B — Item 54: the fill-blanks census (READ-ONLY, no changes)

Venkat's Item 53 ruling: **MCQ preferred over fill-blanks corpus-wide — a
fourth grader taps more easily than types.** Fill-blanks is acceptable
occasionally for variety; single-select is the default.

**This task counts. It converts nothing.**

Across all 103 lessons, report:

1. **Total fill-blanks questions**, and as a percentage of 2,668.
2. **Per-lesson counts**, sorted descending. Name every lesson with 10+.
3. **How many are single-blank vs multi-blank.** A single-blank question with a
   numeric answer converts cleanly to single-select; a multi-blank
   `round-scaffold` or column-arithmetic question does not.
4. **How many have a `layout:` frontmatter value** (e.g. `round-scaffold`) —
   these are structural and are **poor conversion candidates.**
5. **Your assessment of how many admit clean conversion to single-select**, with
   the rule you applied stated explicitly so Venkat can overrule it.

**Do not convert anything. Do not author distractors. Do not edit any lesson.**

Write findings into the report and into `docs/audits/FILLBLANKS-CENSUS.md`.

---

## TASK C — Item 44: the two dataless categorize questions

**File:** `lessons/incoming/bar_graphs_remix.html`
**Questions:** `qe4c5gevv`, `qszpxymg7`

**Measured cause (BRIEF-SOURCE-READ):** the data is **absent from the source**,
not failing to render. Both bodies hold only a prompt and four label tiles — no
`<table>`, `<svg>`, `<figure>`, or inline values. **The quantities exist only in
`explain:`, shown after the child has already answered.**

### The fix — Venkat's ruling

**Render a bar chart in each question body, and have the child read it.**

This is `bar_graphs_remix` — a chart is thematically correct, and it converts a
bare lookup into an actual graph-reading exercise. **Chosen over a plain data
table deliberately.**

### Requirements

1. **Take the quantities from the existing `explain:` text.** They are already
   there and they are the authored source of truth. **Do not invent numbers.**
   Report the values you extracted, verbatim, before using them.
2. Render a bar chart in the question body using **the same chart mechanism the
   engine already uses elsewhere in this lesson.** **Do not build a new chart
   renderer.** State which existing mechanism you reused.
3. The chart must make every sorting decision determinable **before** the child
   answers.
4. **Do not change the answer, the tiles, or the category labels.** Only the
   missing data is being added.
5. Both questions keep their existing IDs. **IDs are permanent.**

### Guard-first

**Before fixing:** write a fixture asserting each of these two questions renders
a data source in its body. **Confirm it FAILS on the current file.** Report the
exact failure text.

**After fixing:** confirm it PASSES. Report the exact pass text.

**Then extend the fixture to all 152 categorize questions**, using the
self-describing-tile exclusions BRIEF-SOURCE-READ already named as near-misses.
**Flag for review; do not hard-fail** — that heuristic is over-strict in one
direction and over-loose in the other, and BRIEF-SOURCE-READ said so.

This is the first half of Item 45. **Do not attempt the rest of Item 45 here.**

---

## TASK D — regenerate, test, commit

1. **Regenerate the review page for `bar_graphs_remix`** —
   `node tools/make-review.js lessons/incoming/bar_graphs_remix.html`.
   Review pages bake the engine in. **There is no `npm run review` sweep;
   `CLAUDE.md`'s shorthand is wrong.**
2. **Stage new files before running `npm test`** — `verify-tracked.js` fails on
   untracked files.
3. Run `npm test` **unpiped**. Report the exit code and name **every guard
   individually** with its exit code.
4. **One commit.** Suggested message:

```
BRIEF-BATCH-1: gate whyWrong, census fill-blanks, fix two dataless questions

Item 55: adds a ratcheting whyWrong coverage guard with a per-lesson floor in
docs/whywrong-floor.json. The floor records current state and is raised only
by human action, never automatically. Nothing has ever enforced whyWrong,
which is how 84 of 103 lessons reached 0% unnoticed.

Item 54: docs/audits/FILLBLANKS-CENSUS.md — read-only census of fill-blanks
questions corpus-wide, scoping the Item 53 MCQ conversion. No conversions made.

Item 44: qe4c5gevv and qszpxymg7 in bar_graphs_remix asked a child to sort by
quantities that appeared only in explain:, after answering. Both now render a
bar chart in the question body. Quantities taken from the existing explain
text; no numbers invented. These were the last two questions in Grade 4 known
to be unanswerable from what is rendered.
```

**Do not push.** Report `git status -sb` and the ahead-count.

---

## TASK E — update `docs/ISSUES.md`

Close and update rows. **Never delete a row.**

- **Item 44** (both rows) → `closed`, dated `2026-07-21`, resolution naming the
  bar-chart fix and that quantities came from existing `explain:` text.
- **Item 55** → `closed`, dated `2026-07-21`, resolution naming the ratcheting
  floor and the floor file path.
- **Item 54** → `closed`, dated `2026-07-21`, resolution pointing at
  `docs/audits/FILLBLANKS-CENSUS.md` **with the headline number.**
- **Item 45** → stays `open`. Add to its issue text that the answerability
  fixture from Task C is the first half.
- **Item 50** → stays `open`. **The guard does not fix the loop; only authored
  content will.**

---

## ANTI-LAUNDERING

- **Do not author `whyWrong` to make a number look better.** The floor records
  reality, including 0%.
- **Do not invent chart data.** Every value traces to existing `explain:` text,
  quoted in the report.
- Say **UNMEASURED** when something is unmeasured.
- If a sabotage does not produce a failure, **STOP and report** — the guard is
  not discriminating.
- **Do not estimate effort or timeline anywhere.**
- If any guard other than the new one behaves differently than before this
  brief, **STOP and report. Do not fix.**

---

## REPORT FORMAT

1. **Task A** — which file you extended and why; measured overall coverage; the
   floor file; sabotage failure text and restore/pass text verbatim.
2. **Task B** — the five census numbers, the conversion rule you applied, and
   the lessons with 10+ fill-blanks named.
3. **Task C** — the `explain:` values extracted verbatim; which chart mechanism
   you reused; fixture FAIL-before text and PASS-after text; the 152-question
   scan result.
4. **Task D** — every guard named individually with exit codes, then the overall
   exit code unpiped.
5. **Task E** — the `docs/ISSUES.md` rows as they now read.
6. `git status -sb` and the ahead-count.
7. Anything noticed but not acted on.

**Do not push. Do not self-commission follow-up work. Do not write a handoff.**
