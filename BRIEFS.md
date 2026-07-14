# BRIEFS — copy-paste into Claude Code

**Ready-made briefs. Paste them as-is.**

---

## Brief 0 — Start a fresh session

```
Read CLAUDE.md and STATUS.md. Tell me where we are and what's next.
```

---

## Brief 1 — End a session cleanly (do this BEFORE /clear)

```
Before I clear the session — persist state to disk.

1. Update STATUS.md: what's done, what's in progress, what's next,
   and anything you learned this session that a fresh session would
   otherwise have to rediscover.
2. Update CLAUDE.md with any new rule or gotcha worth keeping
   permanently.
3. Commit both locally. Do not push.

Give me the commit hash and stop.
```

---

## Brief 2 — Build the preview tool (DO THIS FIRST — it's the blocker)

```
The lesson HTML files are content-only — no <html>, no engine, no CSS.
That is correct for import, but it means I cannot LOOK at them.

I need to review every lesson as a STUDENT sees it: the real buttons,
the real card, the real figures, the real padding and alignment, the
real feedback when I answer. Not markup.

Build tools/preview.js:

1. Takes a lesson filename.
2. Generates lessons/_preview/<name>.preview.html — a full standalone
   page that:
   - loads rao.css and preview-engine.js the same way the live app does
   - renders the lesson through the engine, exactly as production would
   - is fully interactive: I can tap options, type in blanks, drag
     tiles, press Hint, press Check, and see the real feedback
3. Puts a small control bar at the top (OUTSIDE .rao-lesson, so it
   cannot affect the lesson):
   - mode switch: Rapid Fire / Adaptive / Quiz
   - theme switch: all 8 colour themes
   - a "reveal answers" toggle so I can sanity-check the key fast
4. Opens it in my browser.

Rules:
- lessons/_preview/ goes in .gitignore. Preview files are throwaway.
  NEVER committed. NEVER imported.
- The preview MUST use the real rao.css and the real preview-engine.js.
  Do not inline a copy. Do not stub anything. If the preview and the
  live app can drift, the preview is worthless.

Verify it works by generating a preview for estimate-sums-faithful.html
and giving me the path.
```

---

## Brief 3 — Fix the 3 failing lessons

```
Three lessons fail reject-discrimination. Fix them properly.

1. divide-larger-numbers.html — 4 questions have answer: [] (empty
   answer keys). That is a REAL authoring bug, not a test artifact.
   Show me those 4 questions, work out the correct answers, and
   author them.

2. multiplication-patterns-over-increasing-place-values-1to1.html
   (31 failures) and multiplication-patterns-over-increasing-place-
   values.html (3 failures) — diagnose properly.

   Do NOT assume it's a test heuristic limitation. Show me, per
   failing question, the correct answer and the synthetic wrong
   answer your harness generated, and WHY the wrong answer graded
   true.

   If it genuinely is the heuristic (a reversed order list that
   happens to also be valid), then FIX THE HEURISTIC — do not
   whitelist the file.

Then re-run the full validation on all three and show me the output.
Commit locally. Do not push.
```

---

## Brief 4 — Per-lesson review loop

```
Process <FILENAME>.

1. Convert to the current authoring format per CLAUDE.md.
2. Validate: RaoPreview.build(), self-grade round-trip, wrong-answer
   discrimination, hint leak test, verify-format, verify-styles.
3. Generate the preview via tools/preview.js.
4. Report:

   File: <name>
   Questions: <n>
   Format changes made: <bullets, or "none — already current">
   Validation: <pass/fail per check>
   Preview: <path>
   Content concerns: <anything that violates CLAUDE.md §7 — repetitive
                      prompts, no interaction variety, unused scaffolds,
                      leaky hints, degenerate numbers>

Then STOP. Do not move to the next file. Do not commit. Do not push.

If the same defect appears in three files in a row, tell me — we should
be fixing the general case, not the file.
```

---

## Brief 5 — Content quality pass (the big one)

```
The 102 lessons are valid. They are not good. Fix that.

Take <FILENAME>. Read CLAUDE.md §7 (Content standards) first.

Audit it against every standard there and give me a written verdict
BEFORE changing anything:

- Prompt repetition: how many consecutive questions share the same
  prompt sentence?
- Interaction variety: what's the distribution of question types, and
  are they clustered?
- Scaffolds: is round-scaffold used where it should be? helper: chips?
- Distractors: is each one traceable to a real misconception, or was
  it invented to fill a slot?
- Hints: does any hint do the arithmetic, eliminate options, or
  restate the answer (including disguised — "4 tens" for 40)?
- Degenerate numbers: can any question be answered correctly WITHOUT
  doing the thing the lesson teaches?
- Answer-key distribution: is it predictable?
- Figures: any? Should there be?

Then propose the remix. Show me the plan before you write it.

Standard to hit: a nine-year-old should want to do question 20.
Right now they glaze over at question four.
```

---

## Brief 6 — Lock down permissions

```
Lock down .claude/settings.json properly.

Deny rules alone do not stop a Node or Python script that opens a file
directly — only an OS-level sandbox does. Set up:

1. An allow-only permission model in .claude/settings.json
2. An OS-level sandbox so scripts cannot read outside the repo

Then PROVE it: write a throwaway Node script that tries to read
C:\Users\Venkat Rao\Desktop\ and show me it FAILS. Then delete it.

A lockdown I haven't seen fail is a lockdown I don't believe in.
```

---

## The two lines to keep saying

Paste these whenever they apply. They should become reflex.

**When it adds any guard, check, or test:**
```
Break the thing it protects. Run the guard. Show me the FAIL output —
the actual numbers, not a summary. Then restore.
```

**When it starts working file-by-file:**
```
Stop. If three or more files share this defect, fix the general case
and sweep. Do not process them one at a time.
```

**When it tells you something passed:**
```
Did that actually run, or are you inferring? If you don't know, say
"I don't know".
```

## Brief 7 — Build the solution system (rao-master-14)

**Four sessions. `/clear` between each. Do them in order.**

The order is not negotiable. The firewall is built and proved *before* a single line of the
renderer exists. If the firewall isn't real, everything after it is built on sand — and this
project has been there before.

Full spec: `docs/SOLUTION_SPEC.md`. Standing rules: `CLAUDE.md` §13.

---

### Brief 7.1 — The grading firewall (do this first; build nothing else)

```
Read CLAUDE.md §13 and docs/SOLUTION_SPEC.md before you touch anything.

This session builds the grading firewall and NOTHING ELSE. No renderer.
No blocks. No hints. Just the wall and the four guards that prove it holds.

The rule: rendering a solution must be structurally incapable of touching
grading. The solution renderer must not import, call, or mutate anything
in the grading path. It must never call check(). It must never alter the
stored answer or the student's response.

Build four guards. For EACH one, follow CLAUDE.md §2 exactly:

  1. Write the guard.
  2. BREAK the thing it protects.
  3. Run the guard and SHOW ME THE FAIL OUTPUT — the actual output, not
     a summary.
  4. Restore.
  5. Run the guard and show me the PASS.

The four guards:

  a) DEPENDENCY — fails if the solution renderer imports or references
     the grading module.
     Break it by: adding the import.

  b) RUNTIME — spy on check(). Fails if opening, stepping through, or
     closing a solution calls check() even once.
     Break it by: calling check() from the renderer.

  c) MUTATION — fails if rendering a solution alters the stored answer
     or the student's stored response.
     Break it by: mutating the response object during render.

  d) SOURCE-DIFF — fails if solution work modifies a grading file
     without explicit authorisation.
     Break it by: touching a grading file.

Wire all four into npm test.

Then STOP. Show me eight outputs — four FAILs and four PASSes. Do not
build the renderer. Do not commit until I've seen them.
```

---

### Brief 7.2 — The renderer + legacy safety

```
Read CLAUDE.md §13 and docs/SOLUTION_SPEC.md.

The firewall from 7.1 is in place. Now build the renderer behind it.

1. normalizeExplain() — ONE parse point. Frontmatter + markup in, one
   normalized object out. A legacy string `explain:` normalizes to a
   single-block list. Nothing downstream ever sees the old shape.

2. Four block renderers, and only four:
     step         — goal / working / reason, all optional
     figure       — same SVG handling as question figures
     takeaway     — highlighted band
     verification — sanity check band

   NOT called `check` — check() is the grading function. Do not weaken
   the vocabulary.

3. Every block gets a text fallback. If a renderer dies, the child still
   sees the working.

4. THE LEGACY SNAPSHOT GUARD — this is the important one.

   All 2,710 existing questions have a string `explain:`. Every one must
   render BYTE-IDENTICAL after this change.

   Compare at the RIGHT layer: capture the renderer's HTML output string
   BEFORE DOM insertion and byte-compare THAT. Do NOT byte-compare
   serialized DOM — browsers normalise whitespace, reorder attributes and
   re-encode entities, and you will get false failures. The fix for a
   false failure is always to loosen the guard until it stops firing.
   That is how a guard dies.

   Screenshot-compare representative rendered pages separately.

   PROVE THE GUARD FAILS: change one character of legacy output, run it,
   show me the FAIL, restore, show me the PASS.

5. Run the full existing validation suite. All 2,710 questions across 102
   lessons must still build, grade, and reject exactly as before.

This is a rao-master-14 bump. Engine is forward-only — the new engine runs
every old lesson. Never roll back.

Report: guard FAIL output, guard PASS output, and the count of lessons
that still validate. Then STOP.
```

---

### Brief 7.3 — The three-tier ladder

```
Read CLAUDE.md §13 and docs/SOLUTION_SPEC.md.

Build the ladder: hint rungs → whyWrong on a wrong answer → walkthrough
on demand.

1. HINTS become a list of 1-3 rungs. A single string stays valid forever
   and is treated as a one-rung ladder.

   Each rung names the move MORE SPECIFICALLY. No rung ever PERFORMS the
   move. "689 is closer to 700 than to 600" is a LEAK, not a hint — it
   does arithmetic on the child's numbers.

   The existing hint leak test now runs against EVERY RUNG of every
   ladder. Literal answer, disguised answer ("4 tens" for 40), option
   elimination, arithmetic on the child's numbers — all still forbidden.

2. THE WALKTHROUGH IS NEVER DUMPED. One step at a time. The child taps to
   advance. Previous steps stay visible above, dimmed. An "I've got it —
   let me try again" button is present at EVERY step. Nothing auto-
   advances.

3. This touches attach(). CLAUDE.md §4: attach() MUST stay idempotent —
   store and call cleanup before re-binding. Double-attach every question
   as a check, or multi-select breaks on React re-mounts.

4. MODE BEHAVIOUR:
     Adaptive   — the full ladder
     Rapid Fire — the one-line explain: only, plus log the whyWrong code
     Quiz       — nothing during; full walkthroughs on the review screen

5. Verify in a REAL BROWSER with REAL TOUCH EVENTS. Playwright's mouse API
   gives false passes for touch — use Input.dispatchTouchEvent via a CDP
   session. A walkthrough that "passes" under mouse can be completely dead
   on a phone.

   Test at 380px. Every tap target ≥44x44px.

6. The firewall guards from 7.1 must still pass. The ladder is behaviour.
   It must not have crept into grading.

Report: the four firewall guards still green, the idempotency check, and
the touch-event verification output. Then STOP.
```

---

### Brief 7.4 — whyWrong + the validation that makes §7 real

```
Read CLAUDE.md §13 and docs/SOLUTION_SPEC.md.

CLAUDE.md §7 says every distractor must be traceable to a specific
misconception and never invented to fill a slot. Today that traceability
lives NOWHERE and nothing enforces it. This session fixes that.

1. whyWrong in frontmatter — NEVER in data-* attributes. The frontmatter
   is the source of truth (§8). The engine already double-encodes entities
   in data-val; prose in a data- attribute walks into that bug class.

   Keyed by LITERAL OPTION TEXT — the same key the engine already uses.
   Do not introduce a third keying scheme. See §13.9 for the deferral and
   its trigger.

   Each entry has:
     code    — stable machine key, never shown to a child. This is the
               analytics key. It costs nothing now and cannot be
               retrofitted later.
     message — student-facing, one line.

2. FOUR GUARDS. Prove each one fails (CLAUDE.md §2).

   a) DISTRACTOR COVERAGE — every incorrect option of every single-select
      and multi-select has a whyWrong entry. No entry = the option is a
      slot-filler = the lesson FAILS validation.

   b) KEY MATCH — every whyWrong key matches an actual option EXACTLY.
      No orphans, no typos.

   c) TONE — describe the OPTION, do not diagnose the CHILD. A tap proves
      what they picked, not why. Telling a nine-year-old confidently what
      they were thinking when it isn't what they were thinking is
      corrosive.

        GOOD: "This estimate is too large — this pair is closer to 130,000."
        BAD:  "You forgot to round the first number."

      The guard rejects any message opening with "You forgot / You didn't /
      You added / You should have" unless the author sets diagnostic: true.

   d) HINT LEAK — extended to run against every rung of every ladder.

3. Run coverage across all 102 lessons. Tell me how many select questions
   currently have distractors with NO whyWrong. That number is the size of
   the content debt. Do not author them yet — just report the number.

Report: four FAIL outputs, four PASS outputs, and the coverage number.
Then STOP.
```

---

### Brief 7.5 — The proof (do this only after 7.1-7.4 are green)

```
Read CLAUDE.md §7 and §13.

STATUS.md calls estimate-sums-faithful.html "mechanically correct and
pedagogically dead": 15 consecutive fill-blanks with an identical prompt
sentence, then 8 consecutive single-selects with an identical prompt
sentence, zero use of round-scaffold, zero figures, zero variety.

Re-author it as the proof that the solution system works.

Per CLAUDE.md §7 and §13:
  - round-scaffold layout on every round-then-add item (that is what it
    was built for)
  - vary the interaction type; vary the prompt
  - a hint ladder on every question
  - whyWrong on every distractor of every select — with a real
    misconception behind it, or CUT the distractor
  - a solution block list on every question that has more than one step
  - a takeaway on every question: the RULE, not the answer

Do not drop a supplied question without asking me first.

Then generate the preview and give me the path.

The standard: a nine-year-old should want to do question 20. Right now
they glaze over at question four.
```

---

### The line to keep saying, every session

```
Break the thing it protects. Run the guard. Show me the FAIL output —
the actual output, not a summary. Then restore.
```
