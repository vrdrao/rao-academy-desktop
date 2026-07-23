# HANDOFF-37 — Grade 4 is pushed and publishable; Grade 3 Phase 1 starts now

**Chat-side handoff, 2026-07-21 ~14:00 IST. Prior: HANDOFF-36.**

**This document SUPERSEDES `HANDOFF-36.md` entirely. It stands alone.** Read
earlier handoffs only for historical context on decisions already made.
Everything current is here.

**The new chat's first job:** get the `sources-g3/` file listing from Venkat,
pick three maximally-different Phase 1 lessons, and write BRIEF-G3-CEILING-1 —
a READ, not an authoring task. See §7. **Nothing is owed on Grade 4. Do not
invent Grade 4 engineering work.**

---

## 0. THE HANDOFF ACCURACY LAW

**A handoff may never claim a file exists on disk without a directory listing to
prove it.**

- **CONFIRMED** = proven by a directory listing, load test, grep against the
  actual file, terminal output, or a screenshot Venkat pasted.
- **UNMEASURED** = chat-side belief only. Verify before relying on it.

The law has caught chat five times. Assume it will again.

---

## 1. WHO DOES WHAT

Venkat is non-technical, the sole product decision-maker and auditor. Chat
decides, writes briefs, audits reports. Claude Code executes against the local
repo and **never pushes**. Venkat pushes via TortoiseGit after an enumerated
chat audit. A bare `y` = full agreement.

**Decisions are MADE for him and explained after** — no menus where a
recommendation will do. When he asks "what would you recommend?", give one
answer with reasoning, not a comparison table.

**When a decision is visual, RENDER it.** Prose descriptions of visual choices
waste his time.

**There is no background work.** Work happens in the message or it does not
happen. **Nothing runs overnight.** Claude Code executes only while Venkat is at
the keyboard invoking it.

**Tell him the plan in advance** — what runs, how long, exactly when he is
needed. **Number the steps. One action per step.** Do not stack a question on
top of an instruction.

**He will say when he wants something wrapped up.** When he does, stop adding
gates, stop proposing follow-ups, finish the thing.

**Repo:** `C:\Users\Venkat Rao\Desktop\rao-academy` (CONFIRMED)
**Remote:** `vrdrao/rao-academy-desktop` (CONFIRMED, private)
**Word source (OUTSIDE the repo):** `C:\Users\Venkat Rao\Desktop\word-staging`
(CONFIRMED)
**Claude Code:** v2.1.209, Opus 4.8, 1M context, high effort, Claude Max

**Brief protocol:** briefs are FILES in the repo root, chat-authored, invoked
exactly: `Read <FILE> in the repo root and execute it verbatim.` Never
reconstruct a brief from memory into the chat window. Chat writes the file,
presents it for download, Venkat saves it to the repo root.

**Veto ritual:** clear the Claude Code input box before every invocation.

**ONE Claude Code task at a time.** A TortoiseGit push counts as a task.

**Delete superseded briefs from the repo root** so they cannot be re-invoked.

**Mid-run interruptions:** if Claude Code asks a question or proposes a scope
change mid-run, Venkat pastes the exact text to chat rather than answering
Claude Code directly. **This happened today on BRIEF-AREAMODEL-1 and the
process worked** — see §4.

---

## 2. THE TWO RULES THAT GOVERN ORDERING

### 2a. Prioritise by volume

> **Prioritise by questions affected per unit of Venkat's time. Severity breaks
> ties within similar volume. Severity only outranks volume once children are
> actually using the system.**

**Nothing is live. No child has seen any of this.**

Chat violated this rule on 2026-07-21 by writing a brief around two unmeasured
cosmetic items while a 2,219-question blocker sat untouched. **The cause: the
cosmetic items were the ones he had just ruled on, so they were the ones ready
to write. Ready is not important.**

### 2b. Bundle briefs

**Commits and pushes are the expensive step, not the work.** Batch several items
into one commit. Cheap items ride along on a commit that is happening anyway;
they are never the reason a commit happens.

---

## 3. THE PUSH RULING

**Venkat pushes ONCE, at end of day, carrying several commits.** Not per brief.

**Measured, three data points:** 1,487,375 ms (24m47s, failed on network),
1,495,734 ms (24m56s, succeeded), **1,524,750 ms (25m25s, succeeded,
2026-07-21 13:42)**. One push per day = one suite run per day.

**When he is holding commits for end of day, do not tell him to push.**

**The hook duplication was a FALSE premise — do not resurrect it.** Hooks live
in tracked `.githooks/` (`core.hooksPath=.githooks`). **pre-commit** runs
`npm run test:fast` (~1–2 min, 13-guard subset). **pre-push** runs a
history-rewrite guard then the **full** `npm test`. **The full suite runs ONCE,
at push.** The browser suites (touch, drag, venn, categorize-tap, calm, robo)
run **ONLY** at push — reducing pre-push would delete the only gate they pass.

**Unexplained, UNMEASURED:** README says ~12–15 min; measured ~25 min three
times. Not worth a brief. Note it if it comes up.

**Pre-push read-only check:** `git log --oneline origin/main..HEAD` matched
against an enumerated list, **re-run at push time** — never trust an earlier
screenshot.

**Venkat pushes to `main` directly. Never "Create pull request" in TortoiseGit.**

---

## 4. WHAT HAPPENED TODAY AFTER HANDOFF-36 — the record

### BRIEF-AREAMODEL-1 ran, stopped for a ruling, completed, audited PASS, pushed

**The mid-run stop.** Claude Code reached Task A and refused to proceed. The
brief said "if the `<foreignObject>` probe passes all four checks, take
Option 1." The probe **did** pass all four in Chromium at both viewports
(focused=true, digitPad=true, inputmode=numeric, cell 120×54, typing works,
zero errors). But it stopped anyway, because:

- The brief's own named risk was **mobile Safari**, and Playwright/Chromium
  cannot test iOS Safari, where `<foreignObject>` focus/caret has historically
  been buggy.
- The engine already solves "typed cells in a grid" **four times** —
  `divisionTable`, `colmath`, `vertical`, `lattice` — **all plain HTML
  `<td><input>`, zero SVG `<foreignObject>`.**

**Chat's rule was testing the wrong browser. That was chat's error, not Claude
Code's.** A passing probe on Chromium is not evidence about iPad Safari.

**Venkat ruled: Option 2 — HTML grid.** Reasoning on the record: more code is
the correct price; Option 1 would be the only place in the corpus depending on a
technique with known iPad-Safari bugs, on school iPads, where it cannot be
debugged. **Build inside, not beside.**

### The audit — every §6 check of HANDOFF-36 cleared

| Requirement | Result |
|---|---|
| P1–P6 re-measured | 6/6 CONFIRMED with line numbers |
| Corpus `area-model` count | **25**, not 6 — reconciled, recorded as Item 58 |
| Mechanism decision + four probe results | All four reported; Option 2 taken |
| Answer keys DERIVED, arithmetic shown | Derived from decompositions; cell-sum = product verified all six |
| Guard 1: right number, wrong cell → wrong | Sabotage produced `{"user":["450","6300","350","25"],"ok":true}`, then restored |
| Question count both sides | 2,668 = 2,668 |
| Ledger did not shrink | 3,020 entries, empty diff, 6 IDs preserved |
| Guard baseline | **28 → 29**, no pre-existing guard changed behaviour |

**Guard 1's sabotage is the strongest run to date** — it produced the exact
wrong-answer-marked-right output the guard exists to prevent.

**`q55c5764u` (30×860) resolved.** It is a 2×1 grid where row sums would
duplicate the cells; `sums="hide"` means no row-total boxes, so no duplication.
Two blanks, `["24000","1800"]`.

**Claude Code overrode the brief's `sums` recommendation and disclosed it.** The
brief recommended `sums="blank"`; it shipped `sums="hide"` for these six with
reasoning, while keeping format and guard support for `sums="blank"`. Correct
call, correctly disclosed. Anti-laundering working as intended.

### The push — DONE

```
5682100..4dbe2cc  main -> main
Success (1524750 ms @ 21-07-2026 13:42:41)
```

Carried three commits:

```
4dbe2cc  BRIEF-AREAMODEL-1: Item 48 — typed cells in the partial-product box
e23950b  BRIEF-PUBLISH-1: no-dead-end cap (Item 50), three figure fixes, layout scan
cd5c093  BRIEF-CONTENT-1: census ₹/·, middots→commas, keypad ·→×, two guards
```

**Nothing is local. Nothing is owed. Grade 4 is on origin.**

---

## 5. CURRENT STATE — CONFIRMED

| Fact | Value |
|---|---|
| Lessons | **103** |
| Questions | **2,668** |
| Corpus tripwire `EXPECTED` | **2668**, agrees |
| ID ledger `docs/question-ids.json` | **3,020 entries**, append-only, must never shrink |
| Engine | `rao-master-22` |
| Guards in `npm test` | **29**, all exit 0 |
| `whyWrong` coverage | **280 / 2,668 (10.5%)** — floor-gated, not rising |
| Questions WITH a `solution:` | **449 / 2,668 (16.8%)** |
| Grade 3 lessons authored | **1** (`Division_facts_up_to_10_remix.html`, Pilot 1) |
| Local commits ahead of origin | **0** |

**`verify-format` reports "all 102 match" — CORRECT and RECONCILED.** 102 = 103
lessons minus `_type-coverage.html`, a `_`-prefixed harness fixture deliberately
excluded at `verify-format.js:96`. **Do not re-chase this number.**

---

## 6. GRADE 4 — CLOSED

**Venkat's finish line, all six items:**

1. Cull ✅ DONE, pushed
2. Unanswerable questions ✅ DONE
3. Item 45 guard ✅ first half live
4. Item 49 — `whyWrong` — **OPEN but no longer a ship-blocker**
5. One layout brief ✅ DONE (3 fixed, 3 deferred)
6. His content rulings ✅ DONE (both phantoms)

**Item 49 burns down lesson-by-lesson during review, NEVER as a corpus sweep.**
Before Item 50 landed, a missing `whyWrong` meant a child hit a dead end. Now
they get the answer and move on. **The gap degrades gracefully.**

### Deferred, with measured counts — post-publish, do not raise unasked

- **Items 29, 39, 52** — shared-CSS changes touching all 2,668 questions.
  39 = 13 questions; 52 = 64 of 2,642 with Check below the 390×844 fold (many
  legitimately tall — the fix is a sticky Check, not shorter content); 29 not
  statically decidable. One focused styling pass.
- **Items 53 / 56** — 330 of 599 fill-blanks admit clean conversion to
  single-select. Improvement, not a defect.
- **Parked:** 31, 32, 37 (polish), 34, 36 (infra).

### Item 53's area-model exception — RULED, do not re-litigate

Item 53 says MCQ is preferred over fill-blanks corpus-wide. **The area model is
a ruled exception**, recorded in its ISSUES row: Item 53 governs *answer
selection*; the area model's pedagogical content IS "which product belongs in
which cell," which cannot be a tap without drag-to-cell or an unusable 12-option
grid.

---

## 7. THE WORK NOW — GRADE 3 PHASE 1

**Venkat unparked Grade 3 on 2026-07-21 and asked to start it today.** Chat's
ruling, which he accepted: **Phase 1 only. Grade 4 lesson review does not start
concurrently.** Two live streams competing for the same daytime attention means
neither gets done. Phase 1 is three lessons, not a stream — it does not compete.

### THE IMMEDIATE NEXT ACTION

**Chat asked Venkat for the `sources-g3/` file listing and has NOT received it.**
Top-level folders is sufficient if the full list is 198 filenames.

Then, in order:

1. **Chat picks three maximally-different lessons** — see below.
2. **Chat writes `BRIEF-G3-CEILING-1.md`** — a READ, no authoring.
3. Venkat saves it to the repo root, clears the input box, invokes it.
4. Chat audits the ceiling report.
5. **Then** Phase 1 authoring proper.

### The three lessons must be maximally different

The three interaction shapes that broke differently in Grade 4:

1. **Fact-fluency** — admits only select/fill/sort; **hardest to make 30
   questions feel varied.**
2. **Word problem** — where prose-dependence makes questions
   un-machine-checkable, and where Indian context rules actually bite.
3. **Figure/diagram** — produced every phantom defect in Grade 4; the shape
   where the engine's interaction types run out.

**The purpose is not three good lessons. It is the authoring spec.**

### Why the ceiling read comes FIRST — the reasoning, recorded

**Every Grade 3 question is a screenshot. Zero typed question text.** The number
ranges Grade 3 works in are therefore **UNMEASURED** — title-derived only. They
live inside the images.

**Authoring above grade level is the one defect no guard can catch
retroactively, because there is nothing to compare against.** If we author 30
questions and then discover Grade 3 division stops at 10, we have made the
Grade 4 mistake in miniature — a defect authored 30 times before anyone noticed
once.

`BRIEF-G3-CEILING-1` must report, per chosen document: largest addend, largest
minuend, largest product, largest dividend, whether division carries remainders,
whether fractions appear and in what form, and any place-value ceiling. **That
output becomes the ceiling guard before lesson one exists.** ~10 minutes of
Claude Code.

### The three-phase plan

**Phase 1 — three maximally-different lessons.** He reviews all three hard.
Output is the authoring spec.

**Phase 2 — write the spec as GUARDS before lesson four exists.** This is the
piece Grade 4 never had. `npm test` had 23 guards and not one checked
`whyWrong`; had it existed on day one, the 84-lesson gap could not have
happened. Guards for: `whyWrong` present, no `₹` outside money, no `·`,
fill-blanks under a per-lesson ceiling, answerability, Check reachable at
390×844, **and the number ceiling.** **A guard is a rule that cannot be
forgotten. A review note is a rule that can.**

**Phase 3 — batches of 5–8, gated by his review.** Guards reject spec violations
before anything reaches his eyes, so he reviews pedagogy, not stray rupee signs.
**A defect found in batch three becomes a guard before batch four is authored.**

**The honest cost:** Phases 1–2 produce three lessons and some test scripts while
a paid team sits idle. That is the part that will be tempting to skip. Grade 4 is
the evidence for why not to.

### Measured Grade 3 facts (CONFIRMED, `docs/audits/G3-SURVEY.md`)

- **The two-locations hazard is dead.** `word-staging\word docs-g3\` and repo
  `sources-g3/` are **byte-identical twins** — 198 `.docx`, 52,659,112 bytes,
  198 matching md5s. **Nothing to reconcile.**
- **`extracted/` and `Not needed/` are Grade 4 leftovers, not Grade 3.**
- **198 documents. ~110 distinct skills** (grouping judgment, range ~105–130).
  **Keep these two numbers strictly separate.**
- **Every G3 question is a screenshot.** Zero typed question text.
- **Number ceilings are UNMEASURED.** See above.

### The reframe — Venkat's ruling, still binding

**The Word documents are NOT a question bank to be transcribed.** His words: the
questions are *"very monotonous and repetitive,"* and their purpose is *"to just
get an idea of the lesson or the skill that is being taught and then use our
imagination, our creativity to create questions that test the same concept from
different perspectives."*

**Consequence: we extract *skills*, not answers.** A prior chat's "overnight
machine work / weeks not years" estimate was built on the transcription model and
was wrong. **Do not resurrect it.**

### Ruled for Grade 3

- **30 questions per lesson. Fixed.**
- **Grade 4 counts are settled** — not a top-up debt, not parked. **Do not raise
  it.**
- **Item 53 applies from question one:** MCQ preferred over fill-blanks.
- **Item 48 has landed** (4dbe2cc, pushed) — the area-model authoring format is
  in `WORD_TO_AUTHORING_INSTRUCTIONS.md` with the `qukz2ne4j` worked example.
  **This was a G3 blocker. It is cleared.**

### Interaction-type gaps (named by the survey, not designed)

1. Fact-recall fluency admits only select/fill/sort.
2. Symmetry, reflection/rotation/translation, grid-area want `construct` —
   exists in the engine, absent from the 8-type list. **Confirm scope.**
3. Ruler-measuring and thermometer-reading — **no interactive instrument.**
4. Analogue/digital clock reading — **no interactive clock.**

2–4 reduce to single-select over images, with a pedagogy cost.

### Scale, stated honestly

**~110 lessons × 30 questions ≈ 3,300 questions — larger than the Grade 4
corpus. Do not soften this number for him.**

---

## 8. THE AREA-MODEL AUTHORING FORMAT — new, and what G3 reads

Written into `WORD_TO_AUTHORING_INSTRUCTIONS.md` with a worked example
(`qukz2ne4j`, 75×95).

- **Frontmatter:** `data-show="area-model"`, `data-mode="type"`,
  `data-sums="hide|blank|show"`, `data-blank-start="0"`. **Requires
  `type: fill-blanks`.**
- **Blank-ordering convention:** per row top→bottom, each product cell
  left→right, then (**only** when `sums="blank"`) that row's total box. The
  `answer:` array must match. Values are digit-only.
- **`areaModelTyped()`** reproduces the geometry as an HTML `<table>` (headers,
  cells, optional row-total boxes) matching the proven `divisionTable` pattern.
  **No SVG geometry survives in `mode="type"`.**
- `mode="filled"` and `mode="blank"` are **unchanged** — proven byte-identical
  old-vs-new across all 25 questions.

**The six converted questions use `sums="hide"`** (products only), decided over
the brief's `sums="blank"` recommendation to stay faithful to original scope and
avoid redundant row-sums on the single-column 30×860 grid. **The format and
guards still support `sums="blank"` row-total inputs.**

### The six, derived (arithmetic shown, Python-verified)

| id | factors | answer (reading order) | check |
|---|---|---|---|
| `qwy5e27zq` | 42×21 → [40,2]×[20,1] | `["800","40","40","2"]` | 882 ✓ |
| `qukz2ne4j` | 75×95 → [70,5]×[90,5] | `["6300","450","350","25"]` | 7125 ✓ |
| `qnh5ry3b4` | 755×81 → [700,50,5]×[80,1] | `["56000","4000","400","700","50","5"]` | 61155 ✓ |
| `q55c5764u` | 30×860 → [30]×[800,60] | `["24000","1800"]` | 25800 ✓ |
| `qyz6te24b` | 94×69 → [90,4]×[60,9] | `["5400","240","810","36"]` | 6486 ✓ |
| `qpg3sxjip` | 386×16 → [300,80,6]×[10,6] | `["3000","800","60","1800","480","36"]` | 6176 ✓ |

---

## 9. THE PHANTOM PATTERN — read before trusting any issue row

**Five reported defects measured as ZERO:**

| Item | Reported | Measured |
|---|---|---|
| 41 | L-shape unsolvable | Reviewer misread. Not a defect |
| 51 | Q19 answer key wrong | Reviewer misread. `Answer: A` correct |
| 33 | Stray `₹` on non-money sums | **201 ₹, all money. Zero stray** |
| 42 | Options render single-column | **0 of 1,647** |
| 38 | `·` reads as multiply | Real but benign — 328, all prose separators |

**Meanwhile the two that measured LARGER were the invisible ones:** Item 49
(84 of 103 lessons at 0% `whyWrong`) and Item 50 (2,219 of 2,668 on the dead-end
path). **Item 58 is a third:** the area-model count was recorded as 6 and
measured as 25.

**Visible defects shrink on contact; invisible ones grow. Measure before ruling,
and put a stop condition in every brief** — "if the count is zero, close as
not-a-defect and change nothing."

---

## 10. `docs/ISSUES.md` — how it stays current

**Read `docs/ISSUES.md` for the list. Do not restate it in future handoffs.**
**Highest row as of this handoff: Item 58.**

**Three laws, in the file's own header:**

1. **Keyed by question ID** wherever one exists.
2. **Rows are never deleted, only closed** — with date and resolution.
3. **An issue may be closed as `not-a-defect`.** Items 41, 51, 33, 42 are worked
   examples.

**Item numbers are permanent and never renumbered.**

**Contents are asserted, not measured.** No script can know a figure is
unanswerable. Trust it like a colleague's note, not a passing test.

**The discipline — chat's responsibility, not Venkat's:**

1. **When he reports an issue during review, chat numbers it immediately** and
   writes the row into the next brief.
2. **Every brief that commits ends with a Task updating `docs/ISSUES.md`.**
3. **At the end of every session, chat reads back the issues raised and confirms
   each has a row.**

**The failure mode:** an issue reported when no brief runs afterwards never
lands. Rule 3 exists to catch that. **Do not rely on Venkat to remember.**

**Record the REASONING in every resolution, not just the outcome.** Item 48 had
to be re-litigated because the original drag-to-cell ruling was recorded without
its reasoning. Same failure made a superseded tile-sizing scheme resurface twice.

---

## 11. BUSINESS CONTEXT

**Venkat is running out of money. He has a paid team sitting idle waiting for
content, and has given them nothing.**

Word documents exist for Grades 1–7. Up to Grade 6 comprehensive; Grade 6 onward
deliberately sparse. **Ruled: Grade 3 next. Grade 1 later.**

**His publishing bar:** get Grade 4 to a level where children can start
attempting questions. **Explanations are an ongoing process that must not
bottleneck the other grades.** Item 50 was fixed specifically to decouple those.
**That bar is now met and the work is pushed.**

---

## 12. THE IMPORT PROBLEM — team-side, unblocked

Team's answer on stable-ID matching: *"it's not the behavior right now, but we
can work on it."* They could not have — **there was nothing to match on** until
BRIEF-ID-1.

**Now actionable.** Every question carries `id: q********` in `@q` frontmatter,
present in the `#source` block the platform imports.

**Tell the team explicitly:** the ID must come from *our* files and be matched
on, **never generated by their importer**.

**Nothing blocks them starting platform setup.** Destructive imports cost nothing
while no children use the system.

### The ID scheme — RULED, permanent

- `q` + 8 chars from `23456789abcdefghijkmnpqrstuvwxyz` (no `0`/`o`, `1`/`l`,
  `u`).
- **Assigned once. Never regenerated. Never reused.**
- **Opaque.** Nothing may ever infer grade, lesson, order or type from an ID.
- `docs/question-ids.json` is append-only, **3,020 entries**, must never shrink.
- `tools/assign-question-ids.js` is **proven idempotent.**

---

## 13. STANDING LAWS

- **Guard-first, always.** Every engine change gets a fixture demonstrating FAIL
  before and PASS after. **Pre-fix RED and a sabotage round-trip are different
  proofs; both are required.**
- **Test discriminators must discriminate.** Disclose weak sabotages with their
  numbers. Strengthen the assertion; never loosen it to pass.
- **Measure, don't assume — including the brief's own premises.** A correct stop
  is a success. **Chat premises have been false six times.**
- **A brief's mechanical rule can test the wrong thing.** BRIEF-AREAMODEL-1's
  "pass the probe → take Option 1" rule ran the probe on Chromium while the
  named risk was iPad Safari. **When writing a pass/fail rule, state what the
  test is evidence ABOUT, not just what it measures.**
- **Put a stop condition in every brief:** if the measured count is zero, close
  as `not-a-defect` and change nothing.
- **Anti-laundering.** Say **UNMEASURED** when it is. Name near-misses and reject
  them explicitly.
- **Chase every changed number.**
- **Never tune a check to hit an expected count.**
- **Fix the general case, not the file.**
- **Never pad.**
- **Build inside, not beside.**
- **Record the reasoning, not just the outcome**, in every ISSUES resolution.
- **A class defined by a rule must name its members before anything is deleted.**
- **No-repaint law.** Question DOM never rebuilds mid-session; solution and hint
  panels append-only.
- **Self-containment law.** A question may not depend on any other question.
- **Visibility law.** Every human-facing control verified visible after a real
  click/tap, at multiple viewport sizes. **Scroll into view before checking.**
- **Never pipe a run in a way that masks output or exit code.**
- **Stage new guard files before running `npm test`** — `verify-tracked.js` fails
  on untracked files.
- **Claude Code never pushes. Never self-commissions. Never writes handoffs.**
- **Prompt ordering:** lead with the question or expression, then the method.
- **Indian cultural context:** Priya, Arjun, Rohan, Diya; ₹ for money.
- **Packed CSS caution:** verify via `getComputedStyle`, never markup.
- **`.order-slot` has `transition: border-color .15s`** — wait ~250 ms before
  reading computed style.
- **Touch testing uses real CDP touch events**, never mouse simulation.
- **Treat the repo engine as truth and any notes as possibly stale.** Always
  measure before "re-applying" any patch.
- **`npm run review` does not exist as a sweep.** One
  `node tools/make-review.js lessons/<file>.html` per lesson. `CLAUDE.md` carries
  the wrong shorthand — open doc defect, deliberately not fixed.
- **`git mv`, not delete-and-recreate**, when relocating tracked files.
- **Review pages bake the engine in** — regenerate after every engine change.

---

## 14. MEASURED ENGINE FACTS — do not "restore" from old notes

**`rao-master-22` is canonical.**

- `.tile` — height **54px**, font **1.125rem**, padding **0 14px**
- `.order-slot` — min-height **54px**, font **1.3rem**, shape floor **54px**
- `.sb-tile` / `.sb-slot` — **50×50px**
- `.vs-text` — font **1rem**, padding **11px 15px**

**A 44px / 1.05rem scheme appears in older notes. It is NOT a restoration target
and must never be re-applied.** The "keep `.vs-text` and `.tile` at the same
font" rule is void.

**Verified present and merged** (older notes wrongly claim these need
re-applying every session): `liftGhost` on **both** drag paths, `round-scaffold`
in full, `order-slot .filled`, helper-chip, categorize affordance.

**Partial:** `qprompt-solo` — present, but sizes are a length-adaptive clamp
capped at 1.5rem; the gate requires ≤5 words **and** a maths operator, so comma
sequences never trigger it.

**Mobile is NOT broken.** `rao.css` carries 16 `@media` + 9 `@container`
queries. No horizontal scroll at 390×844 or 360×780.

### Load-bearing engine facts

- **`rao-card.js` runs the answering loop**, not `preview-engine.js`. The check
  handler, feedback rows, hint ladder and attempt counting all live there.
  `preview-engine.js` builds and grades; **it contains no `feedback` /
  `check-btn` strings at all.**
- **The two-attempt cap** is `rao-card.js:~427` —
  `commitCap() = canWalk() ? openWalkthrough() : showAnswer()`, gated on
  `wrongCount >= 2`. **Outcome string `shown-answer` is distinct from
  `solved-with-help`.**
- **`fill.serialize` (`preview-engine.js:2480`) collects EVERY `.blank-input`
  under the question root**, sorted by `data-blank`. It does not care whether the
  input is in the prompt, a table, or a figure. **This is what makes typed
  area-model cells possible.**
- **`areaModel()` (`~line 205`, dispatched at 414)** renders the static SVG box
  grid, `mode: filled | blank`, dashed underline at line 239. **Emits zero
  inputs.**
- **`divisionTable()` (line 299)** is the working precedent for `blank-input`
  inside cells. **`colmath`, `vertical` and `lattice` are three more.** All four
  are plain HTML `<td><input>`. **Zero use SVG `<foreignObject>`.**
- **The expression keypad** inserts `" × "`, not `" · "`. Nothing parses or
  grades on that character.
- **The digit pad** scopes via `closest(".qbody")` and works on any focused
  `.blank-input`.

### The engine option-keying rule — MEMORISE THIS

The engine keys options by **`data-val` → text → 1-based position**
(`preview-engine.js:745`, `:989`). So index, letter and figure-option answers are
all valid.

**Any answerability guard that does naive text matching will report ~114 phantom
defects on day one.**

---

## 15. PARKED — do not resurrect unasked

- **The unexplained push.** At ~20:15 on 2026-07-20 origin advanced without
  Venkat initiating it. Every local mechanism was eliminated; a reflog check
  found no repeat. **Still UNMEASURED and open. Watch for a second data point;
  escalate then.** No recurrence 2026-07-21.
- **Full-suite timing discrepancy** — README says ~12–15 min, measured ~25 min
  three times.
- `lessons/incoming/` holds most lessons — Venkat asked for consolidation.
  Chat's position: "incoming" describes a *stage*, which belongs in frontmatter,
  not a file path. Needs a read-only scan of every lesson-path reference first.
- **Untracked `BRIEF-*.md` in the repo root** (~20) — **not authorised as a
  sweep**, though Claude Code archives the brief it just executed, which is
  established practice.
- `lessons/_preview/` — stale build artifact, outside the 2,668 corpus, skipped
  by every guard.
- `review/index.html` has no lesson source — pre-existing, unrelated.
- `sources-g3/` is a full untracked 52 MB copy in the tree.
- `Multiplication/Lattice multiplication.docx` has only 1 image anchor.
- `word-staging\` also stages Grades 2, 5, 6, 7.
- Shared-engine-file refactor for review pages.
- G3 chat's ENGINE REQUEST: grade-aware guards.
- AWS deployment / tulipmath.com — **clean slate, nothing deployed.** Gate:
  `node tools/check-app.js <live URL>`.
- App-side wiring of `window.RaoAccount.firstName`.
- `HANDOFF.md` in repo root — purpose unknown.
- Untracked `docs/audits/*` and `sources-g2/g5/g6/g7/`.
- Brief 7.8 (Robo personality pack).
- **`raoGeoEngine.js` does not exist in the repo** — it is in the chat project
  files only. Do not reference it as a repo file.

---

## 16. WHAT CHAT GOT WRONG — read before trusting your own premises

**2026-07-21:**

- **Wrote a pass/fail rule that tested the wrong browser** — "probe passes →
  take Option 1", where the probe was Chromium and the risk was iPad Safari.
  Claude Code caught it and stopped. See §4.
- **Wrote a brief around two cosmetic items while a 2,219-question blocker sat
  untouched** — having said two messages earlier that the blocker was the
  highest-leverage item.
- **Asserted the full suite ran twice** (commit + push) and proposed gutting the
  pre-push hook. FALSE — the proposed fix would have deleted the only gate the
  browser suites pass.
- **Told Venkat to push at midday, two messages after ruling end-of-day pushes.**
- **Described Item 50 as "the engine loops forever" before reading the code.**
  The cap existed; the defect was the `&& canWalk()` conjunct.
- **Carried HANDOFF-35's "~30 minutes, a writing task" estimate for Item 48**
  without checking. An `<input>` cannot live in an SVG; it was hours.

**Earlier:**

- Wrong arithmetic into BRIEF-SOURCE-READ as established fact (Item 41).
- Inverted the premise of BRIEF-G3-SURVEY Task B.
- Quoted "~10 minutes" for a brief running the full suite.
- Omitted the `opened` column from BRIEF-ISSUES-1's seed table.

**The pattern: chat's confident premises have been wrong repeatedly, and every
time the discipline of measuring rather than assuming caught it. Write briefs
that can disprove their own premises.**

---

## 17. HOW TO OPEN THE NEW CHAT

**Grade 4 is pushed. There is nothing to audit and nothing to authorise.
Do not open by asking for a `git log`.**

1. **Ask Venkat for the `sources-g3/` file listing** (top-level folders suffice).
   He was asked for it in the prior chat and had not yet pasted it. **This is
   the one thing blocking the next action.**
2. **Pick three maximally-different Phase 1 lessons** — fact-fluency, word
   problem, figure/diagram. §7.
3. **Write `BRIEF-G3-CEILING-1.md`** — a READ of the number ceilings in those
   three documents' screenshots. No authoring in that task. ~10 min.
4. **Audit the ceiling report**, then Phase 1 authoring proper.
5. **Do not start Grade 4 lesson review concurrently.** Ruled today.
6. **Do not invent new Grade 4 engineering work.**

---

**The point of all of this:** Venkat reviewing lessons and sending feedback is
the work; everything else exists to unblock it. **He has a paid team idle and no
content shipped.** The binding constraint is getting real volume into their hands
without shipping something that teaches children wrong answers.

**Where things stand:** Grade 4 crossed the publishable line and is **on
origin**. The dead-end loop is fixed, the area-model conversion landed with its
authoring format documented for Grade 3 to read, and the guard count is 29.
Grade 3 Phase 1 begins with a ceiling read, because **every Grade 3 question is a
screenshot and we do not yet know what numbers Grade 3 is allowed to use.**

**The visible defects were smaller than feared; the invisible ones were much
larger. Measure before ruling.**
