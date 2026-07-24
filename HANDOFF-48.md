# HANDOFF-48

Written 2026-07-24, ~00:10, at the close of a session that began with HANDOFF-47.
**Supersedes HANDOFF-47 completely.**

---

## 0. READ THIS FIRST — THE LAW OF THIS PROJECT

**Never state what a file contains without opening it in the same breath.**

This is not general advice. It is the specific cause of nearly every wasted hour
in this project, and it failed four separate ways in one afternoon:

- Chat reported ISSUES #75 as open and "confirmed a fix" — the log already had it
  closed.
- Chat pushed Venkat to rule on #91 — the log had it marked `not-a-defect`.
- Chat quoted "49 undecided issues," inherited from HANDOFF-47's assertion.
  Measured: **16**, of which one wasn't a defect. Real number **15**.
- Chat wrote three briefs scoped to `lessons/` without knowing 84 of 103 lessons
  lived in `lessons/incoming/`.

**And the most dangerous one — HANDOFF-47 §3 instructed:**
> *"Stray `STUDENT-INTERACTION-RULES (1).md` — a 7.7 KB partial download beside
> the canonical file. **Delete it.**"*

That file was **23 KB, not 7.7 KB**, and it was the **newer** copy — the only one
containing rules 16, 17 and 18. The repo copy stopped at rule 15. Following that
instruction would have destroyed the multi-select ruling, the whyWrong voice
ruling, and rule 16. It was described by size and never opened.

**A wrong document is worse than no document.** Treat every handoff — including
this one — as a claim to verify, not a fact to trust.

---

## 1. HOW VENKAT NEEDS TO BE TALKED TO

**Carried forward from HANDOFF-47 §1 and reconfirmed all session. Highest
priority instruction in this file.**

Venkat is a **teacher**, not a developer. Verbatim, from the previous session:
*"You keep talking to me as if I have some deep technical expertise. I don't…
Almost half of what happened in the previous chat was me just agreeing to
whatever you said because I had no idea what you were talking about."*

- Frame every decision as **what a child sees and does** and **what changes for
  that child**. No file names, function names or rule numbers in anything he is
  asked to rule on.
- **A yes he did not understand is worse than a delay.**
- **Never cite a bare issue number.** Every mention gets a one-line description of
  the symptom a child experiences. Not "#84 is open" but "#84 — when the answer is
  over a thousand and the child types 1,250 with a comma, the app marks them
  wrong."
- He rules; chat proposes. **Never infer a ruling from a symptom.**
- He is a strong product thinker. When he pushes back, his reasoning is usually
  better than the original proposal. Argue the case **once**, clearly, then
  implement what he decides.

**His stated position on process, 2026-07-23, and it is binding:**
> *"I don't want to maintain a long issue log which gets corrected or you forget
> the context. I will identify one issue at a time, pass it on to you, get it
> fixed, and move on. I know it's not efficient, but that's the only way I
> believe we can move forward. I don't trust the way the handoffs have been
> working."*

**Do not propose a big multi-item plan.** One issue, verified against the actual
files, fixed, closed. That is the working mode now.

---

## 2. REPO STATE — VERIFY BEFORE TRUSTING

**A push was in progress when this was written.** Confirm first:
`git log --oneline origin/main..HEAD` should return **nothing**.

Before the push, `origin/main` was at `d041eba` with five commits ahead:

| Commit | What |
|---|---|
| `078717a` | tracked 53 loose docs in place (no moves) |
| `97224b5` | archived 40 briefs → `docs/briefs/`, 17 reports → `docs/reports/` |
| `9ff85c8` | parked Grade 3 outside the repo (not deleted) |
| `bbd53ad` | guard against lesson files outside canonical folders |
| `2acc983` | merged `lessons/incoming/` into `lessons/` |

Earlier the same day, already pushed: `d041eba` (child-facing fixes + the
complete rules file).

**Full `npm test` green (exit 0) after every commit.**

### Corpus, measured

- **`lessons/` = 103 files, 2,666 questions.** ONE flat folder. `lessons/incoming/`
  **no longer exists.**
- **`review/` = 107 pages.** One per lesson, plus 4 non-lesson artifacts.
- Grade 3 parked at `../rao-academy-grade3-parked/` (outside the repo, with a
  README). **Not deleted.**

---

## 3. THE FOLDER QUESTION — SETTLED

Venkat's core complaint entering this session: *"I don't know which folder has the
latest updated files… I'm worried they are using different engine versions."*

**Measured answer:**

- **`lessons/` — the raw source.** All edits happen here. 103 files, one folder.
- **`review/` — generated, disposable.** Built from `lessons/` by
  `tools/make-review.js`. Each page inlines a full engine copy (hence ~800 KB).
- **Zero duplicate lesson filenames anywhere.** The thing he feared most was not
  happening.
- **Review pages are path-independent** — regenerating all 103 after the merge
  produced **zero changes**. They are built from `#source` content, not location.

**Still unknown, and it is the one real gap:** lessons reach the live app via a
**SQL importer that lives outside this repo**. No import has been done yet, so
nothing is stale — but the repo can be perfect while the app serves something old.
**Establish this before any launch.**

### Folders that are NOT junk — do not "clean up" without reading

- **`incoming/` (repo ROOT — different from the old `lessons/incoming/`)** —
  holds `calm-card-v36.html`, a **live test dependency**. `verify-calm.js:288`
  reads it as the signed-off reference. **Deleting it turns the suite red.**
- **`sources/` (21 files)** — legacy-format originals. **19 of 21 have a clear
  live counterpart; 2 do not.** See §6.
- **`archive/`, `mockup/`, `deploy-drop/`, `.format-diff/`, `tools/scratch/`,
  `lessons/_preview/`** — surveyed, all benign, all left in place deliberately.
- **`lessons-g3/`** — still exists, holding **one file on purpose**:
  `multiplication_facts_up_to_10.html`, used by `tools/verify-panel-layout.js` in
  7 test cases. Removing it breaks that tool. Documented as a temporary guard
  exception.

---

## 4. THE NEW GUARD — AND WHY IT MATTERS

`tools/verify-lesson-location.js`, registered in `test` and `test:fast`.

**Fails if any `<!--@q` lesson file exists outside** `lessons/`, `review/`,
`archive/`, plus three documented temporary exceptions (`sources/`, `lessons-g3/`,
`tools/scratch/dropped-prose-fixture.html`), each carrying a one-line comment
saying why it exists and that it is temporary.

**Proved failing first**: a stray lesson was planted → exit 1; removed → exit 0.

**Why this matters more than tidiness:** the repo accumulated five lesson folders
because *nothing in the system ever objected*. Now something does. When the two
`sources/` questions are resolved, remove that exception.

---

## 5. WHAT SHIPPED TODAY

### `d041eba` — child-facing fixes

- **#107 dropped** — a question reading *"Tap every digit that makes this
  statement true"* with **no statement on the card.** Unanswerable; every
  automated check passed it. Third such question found by human eye.
- **#113 dropped** — a round-then-order question that taught nothing.
  **Honest correction:** chat's brief described it as "tiles pre-sorted, move
  nothing." **Wrong** — tiles render 700/80/150, unsorted. The real defect is that
  sorting the RAW values gives the same order as the ROUNDED ones, so the rounding
  step is inert. Claude Code caught this by reading the file.
- **#103 fixed** — deleted *"Be careful: 20,000 itself is not less than 20,000"*,
  which handed over the exact thing being tested. Replaced with a whyWrong in the
  ruled voice: *"Looks like you counted 20,000 itself — but a number is never less
  than itself, so it stays out."*
- **Rule 18 built** — correct multi-select picks now show a **green tick**; wrong
  picks red ✕; unpicked options stay unmarked. Guard `checkMultiSelectGreen`,
  proved failing first. **Note:** `rao.css` deliberately neutralises green on
  options to enforce rule 6, so this needed a dedicated class. It is a deliberate
  hole in a safety rule. **Multi-select only — must never generalise.**
- **Rule 14 extended to categorize** — mis-binned tiles get the soft red edge;
  correct tiles stay clean; the correct grouping is not revealed. Guard
  `checkCategorizeMisplaced`, proved failing first.
- **ISSUES #76 DISPROVEN** — the suspicion that categorize graded by tray
  *position* rather than tile *identity* was false. `categorize.serialize` sorts
  by `data-idx` and grades against `ans[idx]`. Not a defect.

### `2acc983` — the merge, and the trap inside it

84 lessons moved up. The non-obvious part: **`docs/whywrong-floor.json` keyed all
84 entries by their `incoming/` path.** After the merge those entries would have
read as "gone" and the files as "new" — **the suite would have stayed green while
84 lessons silently lost their coverage floor.** Caught and re-keyed. Also updated:
`docs/question-ids.json` (2,543 paths), `verify-question-ids.js`,
`assign-question-ids.js`, `batch-extract.js`, `verify-mcq-92.js`,
`verify-format.js`, `preview.js`, `capture-explain-baseline.js`.

**Carry this forward: when a brief changes where something lives or how it is
judged, ask what else reads it.**

---

## 6. THE MEASUREMENT THAT RESIZED THE PROJECT

`docs/audits/TEACHING-CENSUS.md` (BRIEF-TEACHING-CENSUS-1). Read-only, drove the
corpus through the real engine. **These numbers replace every prior estimate.**

- **1,365 select questions have no whyWrong.** That is the true authoring job.
- **900 questions correctly have none** — fill-in, ordering, sequence-build,
  categorize are hint-carried by rule 16. The old "84 of 103 lessons" framing
  **over-counted by 900.**
- **Partial coverage is exactly ZERO.** Every select question is either fully
  covered (309) or has nothing (1,365). **The unit of work is a whole lesson.**
- **Only 15 of 78 numeric lessons** collapse to ≤5 distinct distractor patterns.
  Most have far more — **up to 53**.
- **722 select questions have non-numeric options** — no arithmetic difference
  exists, so nothing can be generated. These are hand-written, one at a time.
- **`add_5digit_word_problems` has 11 distinct differences, not the 2** recorded
  by the earlier hand analysis. **The hand analysis undercounted, and the
  "mechanically generable" hope does not hold corpus-wide.** This resizes the job
  **upward**.
- Only **7 questions** have no hint in the hint-only types. Essentially a
  non-problem.
- **0 leaking hints** — but by mechanical matching only. Semantic leaks are
  explicitly `UNMEASURED`. The report says so rather than claiming a clean bill.

**Unruled sequencing idea, now worth more than it was:** one workout per lesson is
mandatory, two optional. Most children only see the mandatory ten. Authoring those
whyWrongs first covers most children at roughly a third of the cost.

---

## 7. THE RULES FILE — 18 RULES, NOW IN GIT

`STUDENT-INTERACTION-RULES.md`, 525 lines, committed in `d041eba`. **This is the
authority. Read it in full; do not summarise it from here.**

Rules 16, 17 and 18 were added today from the newer out-of-repo copy — the file
HANDOFF-47 told you to delete.

- **Rule 16** — a whyWrong exists **only** where the wrong answer is a known
  option (single-select, multi-select). Fill-in, ordering, sequence-build,
  categorize get hints. A generic "children often miss a carry" told to a child
  who transposed digits is a guess in the shape of feedback.
- **Rule 17** — **RULED 2026-07-23: the gentle hedged voice.**
  *"Looks like you forgot to carry into the thousands column."*
  Not *"You forgot…"* (too flat). Not *"Check the thousands column…"* (sends them
  looking instead of telling them). **Name what the child did.**
- **Rule 18** — multi-select green, with its own amendment note recording the
  case against, Venkat's reasoning, and a "watch this" flag.

**Rule 14 ambiguity, unresolved:** its heading says "Ordering and sorting" but
every example is about ordering. Categorize was built today as a **new extension**.
The rule text should be tightened to name categorize explicitly.

**⚠️ The "Known implementation divergences" section is STALE.** It lists three
defects "last verified 2026-07-23"; **two were fixed in `15dc637`** (right answer
painted red; multi-select losing its tick) and the third
(`BRIEF-RETRY-STATE-3`) was absorbed into CONFORM-1. **Verify and update before
anyone acts on it.**

---

## 8. THE ISSUE LOG — READ THIS BEFORE QUOTING ANY NUMBER

`docs/ISSUES.md`, 91 rows. **The status column does not mean what it appears to.**

`open` means *not closed*, **not** *undecided*. Measured breakdown of the 43 rows
marked open:

- **27 already carry Venkat's ruling in the text** — decided, unbuilt. **This is
  the real backlog** and it is invisible in every count anyone quotes.
- **16 are genuinely undecided** — and one (#91) is marked `not-a-defect`
  elsewhere, so the real figure is **15**.

**Three closed today:** #103, #107, #113. **#56 and #75 are resolved but the log
may still say otherwise** — verify against the files, not the log.

**#114 narrowed by measurement:** the child-facing defect **no longer exists**.
Zero inverted division messages corpus-wide across 5 lessons / 45 questions. What
remains is **14 questions in `interpret-remainders` where the analytics code
`REMAINDER_AS_ANSWER` sits on a quotient option** — a labelling mismatch no child
sees. **Venkat ruled Route B:** the structural fix to `docs/MISCONCEPTIONS.md`
gets its own brief with a **full audit of all 63 codes**, because the taxonomy has
no representation of what a question *asks*.

**Found today, unlogged:** `interpret-remainders`, question `qhxw9drpb`, option
"4" reads *"That's close — count the sofas in the part-full truck again."*
**"That's close" breaks rule 12** (never state distance from the answer). Tagged
`NEAR_MISS`; a corpus sweep for similar language has not been run.

---

## 9. OPEN QUESTIONS FOR VENKAT

From the rules file (§Open questions) plus today. **Full text in the rules file.**

1. **"Here's the answer — you've got this!"** after failing **twice**. Reads as
   praise for succeeding. (#89.)
2. **Multi-select gives no instruction on a wrong answer** — nothing says "pick
   every correct one." (#87.)
3. **Sorting reveals raw code** — *"Answer lt80000, ge80000"* shown to a
   nine-year-old. (#90.)
4. **Multiple missed carries** — name both columns, or "you missed a couple of
   carries"? (Rule 17, unruled.)
5. **`solved-with-help`** — recorded when the walkthrough opens, at its final
   step, or when the question moves on? It records a **route, not mastery.**
   Settle before any parent report or adaptive engine reads it.
6. **Asking for the solution burns the second attempt** — the engine does this;
   nobody ruled it.
7. **Number display** — Western grouping shown to Indian children.
8. **How much of a solution table to show.** (#83, parked.)
9. **The `sources/` gap** — 2 of 21 legacy sources have no clean live counterpart.
   The **subtract-ending-in-zeroes** skill in particular has no live home. **Does
   a Grade 4 lesson exist for it, or was content lost in conversion?** Nothing
   moves out of `sources/` until this is answered.
10. **Five non-lesson artifacts sit in `review/`** — two Interaction Atlas pages,
    a flicker demo + GIF, and `_type-coverage.html`. Move to `review/_artifacts/`?
    **Check first whether `_type-coverage.html` is tool-generated.**
11. **`REPORT-INTERACTION-CONFORM-1-PHASE3.md`** carries a modification nobody
    made — pre-existing, unexplained. Claude Code correctly refused to commit an
    edit of unknown origin.
12. **Stale root docs.** `STATUS.md`, `WORKFLOW.md`, `START-HERE.md`,
    `LESSONS-MANIFEST.md`, `HANDOFF-37/40`, `RECOVERY.md`, `BRIEFS.md` all predate
    this week. **Any that still describe `lessons/incoming/` as real are now
    actively wrong** and will mislead the next session exactly as HANDOFF-47 did.

---

## 10. RULES OF ENGAGEMENT

- **One Claude Code task at a time.** Restart points between briefs, never
  mid-brief.
- **Veto ritual: clear the input box before every invocation.** It caught **four**
  pre-typed sends today, including three "push it" and one "commit this."
- **Claude Code NEVER pushes.** Pushes go through TortoiseGit so the hook fires
  and Venkat sees it.
- **Pre-push:** `git log --oneline origin/main..HEAD` against an enumerated list.
- **Briefs are file-based and chat-authored.** One-line invocation naming the
  file. **Never reconstruct a brief from memory.**
- **Guard-first always.** The fixture must be **seen failing** before the fix.
- **Stop-gates work.** Three briefs today halted rather than guessing — on file
  paths, blast radius, and identity-vs-position. Every halt was correct. **Write
  them in.**
- **Nothing is deleted; everything moves.** Applied to Grade 3, to `_shots/`, to
  every archived brief.
- **Mid-run interruptions:** Venkat pastes Claude Code's exact words to chat
  rather than answering it directly.
- **Scope fence:** Grade 4 only. Grade 3 is parked **outside the repo**.

---

## 11. IMMEDIATE NEXT WORK

Per Venkat's ruling in §1: **one issue at a time, verified against the files.**
Do **not** propose a multi-item plan.

Highest value first, chat's read:

1. **Confirm the push landed** (§2).
2. **Update the stale divergences section** of the rules file (§7) — it currently
   describes two fixed defects as live.
3. **The `sources/` gap** (§9.9) — the only open question that might mean content
   was lost.
4. **The stale root docs** (§9.12) — the mechanism that has burned this project
   repeatedly.
5. **whyWrong authoring** — 1,365 questions, whole-lesson units. Consider the
   mandatory-workout-first sequencing (§6).

**Not urgent:** the `review/` artifacts, the `NEAR_MISS` sweep, tightening rule
14's text.

---

## 12. THE OTHER AI IN THE LOOP

Venkat runs work past ChatGPT. Its structural review of the rules document caught
a real contradiction that chat had written an hour earlier and missed. It was also
wrong on one point of fact, because **it reads the rules document and chat
summaries, not the engine** — as it said itself.

**Use it for structure and consistency. It is not a witness to what the engine
does.** Only direct measurement is.

---

## 13. ONE PRE-EXISTING ISSUE, FLAGGED NOT FIXED

`verify-snapshot.js` reported **59 failures on clean HEAD** as of HANDOFF-47 —
present before that session's work, not part of `npm test`, verified by stashing.
**Not re-checked today.** Unexplained, worth a look.
