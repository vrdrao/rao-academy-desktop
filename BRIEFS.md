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

BRIEF 7.6 — CALM CARD (engine rao-master-16). BLOCKER: no lesson reaches a real child until this is deployed.

Read incoming/calm-card-v36.html first — verify md5 deb8d07a84a9f1fbc6847b7ff57a965f (1,791,115 bytes on disk) and STOP if it does not match. It is the signed-off behavioral spec (Venkat, 2026-07-17), reviewed state by state; its cc-script layer encodes the exact approved behavior for states 1 (Answering), 2 (Wrong), 3 (Hint), 4 (Walkthrough — Steps), 5 (Correct). Also read docs/CALM-CARD-MASTER-SPEC-v1.md §3 (presentation contract). Your job is to implement the same behavior in preview-engine.js as rao-master-16. Forward-only, no JSON rewrite, CSS stays packed single-line (no real newlines). The demo's dev chrome (state bar, drawers, tuner) does not ship. Demo state 6 (video walkthrough) and everything Robo are OUT OF SCOPE here — do not implement, but do not structurally preclude a later Watch tab beside the steps panel. Where this brief and the demo file disagree, STOP and report the disagreement; do not resolve it yourself.

WHY THIS IS A BLOCKER, NOT POLISH: today, while a walkthrough is open and retry is still available, the correct option is highlighted green — a child can bail out, tap the green one, and get marked correct having learned nothing. That is a grading bug wearing a design costume.

THE LAWS (each maps to a test below):

1. TASK IMMUTABILITY. The prompt and all answer options keep their normal colors, opacity, and styling in every state. Nothing about the task ever dims, fades, or recolors. Only card chrome (problem label, counter) may quiet down.

2. NO ANSWER REVEAL WHILE ATTEMPTING IS POSSIBLE. No green styling, no correct-answer highlight, no final-answer text anywhere on the card while the question is still attemptable. The reveal happens exactly once, at the walkthrough's final step.

3. WRONG IS A WHISPER. A wrong attempt marks the tried option with a small red ✕ glyph before its text — that is the ONLY change to it. Same font color, same border, same background as every other option. The ✕ persists for the life of the question (v36 `cc-tried` + `.cc-x`: glyph 0.8em, red, 7px right margin, bold). No shake animation, no red flood, no is-wrong red treatment on the option.

4. HELP ACCUMULATES, NEVER REPLACES. All shown hint rungs stay visible together; all shown walkthrough steps stay visible together in ONE "Solution — step by step" panel. Nothing the card has told the child ever disappears while the question is live.

5. ONE HINT LADDER, TUTOR-BUBBLE PRESENTATION. The whyWrong message after a wrong attempt IS hint rung 1, chip-labeled exactly "Hint 1"; forward hints continue the count ("Hint 2", ...). Hint labels carry no total — never "of N". A pre-attempt "Hint" press starts the ladder at the first forward hint; numbering adapts. Presentation is the approved tutor-conversation pattern, identical to steps: append-only typed chat bubbles — the bubble node is created once showing typing dots and filled ONCE (dots → chip + text) at 650ms; earlier bubbles are never touched again; bubbles are faceless (no avatar seat — remove dead .cc-ava CSS in production). Content model unchanged: whyWrong entries keep their taxonomy codes; hint rungs stay move-naming, no arithmetic — the unification is presentation only.

6. WALKTHROUGH: TRIGGER AND COMMIT. Child-initiated only, via a "Walk me through it" button that appears after the SECOND wrong attempt OR when all hints are used, never before the first attempt, never auto-opened. (This trigger button is intentionally absent from the demo, which drives states via its dev bar — this law governs.) OPENING THE WALKTHROUGH IS THE COMMIT POINT: the question locks immediately and is recorded as solved-with-help, NOT correct. There is NO retry inside the walkthrough — one button per step: "Next step", then "Got it" on the final step, exactly as v36 state 4 behaves (child-paced, steps type in as bubbles under the "Solution — step by step" header — header currently KEPT, subject to Venkat's pending one-word ruling; build so its removal is a one-line change). The final step reveals the answer and marks the correct option green, quietly — triumph and rescue must feel different. No chalkboard/blackboard solution surface anywhere.

7. CORRECT IS THE ONLY LOUD MOMENT. On correct: the chosen option gets the green correct treatment, all other options unchanged (no dimming), a green-edged "The idea to keep" takeaway panel, then "Next question →". Green appears in exactly two situations in the whole system: this, and the walkthrough final step.

8. MODES. Adaptive: full behavior above. Rapid Fire: no walkthrough mid-run; whyWrong flash only. Quiz: no help until submit; walkthrough available per-question in review. Same lesson file, data-mode decides.

BUTTON LABELS (exact, reconciled to the signed-off demo): "Check" / "Try again" / "Hint" (pre-ladder) / "Give one more hint" (once rung 1 is visible) / "I'll try now" (closes the hint ladder) / "Walk me through it" / "Next step" / "Got it" / "Next question →".

TESTS — extend the harness and touch tests, break-restore proof for each new guard:
a. ANSWER-LEAK (UI): for every select-type question, simulate a wrong attempt; assert via getComputedStyle in real Chromium that no option carries green/correct styling and no reveal text exists while the question is attemptable. Sabotage: reintroduce early green; show me the FAIL output; restore.
b. LOCK-ON-OPEN: open a walkthrough; assert the question locks immediately, no retry control exists anywhere in the walkthrough, and grading records solved-with-help not correct. Sabotage-proof it.
c. TASK-IMMUTABILITY: snapshot computed color/opacity of prompt and all options in answering state; assert identical in wrong/hint/walkthrough states.
d. ACCUMULATION: after advancing to walkthrough step 3, assert steps 1 and 2 are still visible; after hint rung 2, assert rung 1 still visible.
e. BUBBLE PARITY: against incoming/calm-card-v36.html as reference, assert the production hint/step bubbles are append-only (node count only ever grows; a MutationObserver sees zero mutations to earlier bubbles after their single fill) and fill dots→content at 650ms ±50ms.
f. HINT-LABEL BAN: assert no rendered hint chip ever matches /of\s+\d/.
All existing guards (KEY MATCH, TONE, CODE REGISTRY, hint-leak, coverage) must stay green. npm test before any deploy — no exceptions. Verify all styling via getComputedStyle in a real browser, never markup inspection.

Report back with the numbered reconciliation: tests added, sabotage FAIL outputs (actual output, not summaries), engine version bump, and anything in the demo you could not implement faithfully — disclosed inside the report structure, not as loose preamble.

# BRIEF 7.6.1 — Frontmatter `explain:` engine fix (rao-master-17)

Approved by Venkat 2026-07-17 (recorded in STATUS.md at 09cc647). Scope is exactly the
bug you flagged in your 7.6 report §6.2 — nothing else rides along.

## The bug (your own finding, restated as the contract)

`build()` only reads `<p class="explain">` from question markup. The frontmatter
`explain:` form documented in CLAUDE.md §13.6 parses and then vanishes — all 30
`explain:` strings in the Brief 7.5 proof lesson are silently dropped.

## Required behavior

1. A frontmatter `explain:` string renders identically to the markup
   `<p class="explain">` path: same element, same class, same DOM position, same
   reveal timing and conditions. A child must not be able to tell which authoring
   form produced it.
2. Precedence: if a question has BOTH markup `<p class="explain">` and frontmatter
   `explain:`, markup wins and frontmatter is ignored (existing lessons must not
   change behavior). Report how many questions in the corpus have both, even if zero.
3. All Calm Card interactions from 7.6 apply unchanged: the `cc-hastake` suppression
   (takeaway panel or walkthrough carried the teaching → explain stays hidden) must
   apply to frontmatter-sourced explains exactly as to markup-sourced ones. The BUG-4
   style guard must still pass.
4. All question types that honor markup explain honor frontmatter explain. If any
   type honors neither today, leave it alone and list it in the report.

## Engine rules

- Bump engine to **rao-master-17**. Forward-only. Packed CSS string: if untouched,
  say so; if touched, it stays packed single-line, zero newline escapes.
- STOP-and-report if implementing this requires touching anything beyond
  `engine/preview-engine.js` (and STATUS.md/version stamp). Do not widen the diff
  yourself.

## Proof requirements (all actual output, no summaries)

- New or extended guard in npm test: for every corpus question with frontmatter
  `explain:` and no markup explain, assert the explain element exists in the built
  DOM and reveals on correct under legacy (non-takeaway) conditions.
- Sabotage 1: revert the fix → guard must FAIL naming the proof lesson and a count
  (expected all 30 from the 7.5 proof lesson). Show the actual FAIL line.
- Sabotage 2: make frontmatter override markup (break precedence) → a guard must
  FAIL. If no corpus question has both forms, add one to `lessons/_type-coverage.html`
  so the precedence rule is actually testable, and disclose the corpus count change
  that causes (expected 2,721 → 2,722; any other number gets explained).
- Restore, full npm test green, report the final counts (lessons and questions —
  every changed number reconciled).

## Report requirements

- md5 + bytes-on-disk for every shipped file.
- Firewall: expected outcome is the normal SOURCE-DIFF pass (engine change with no
  grading-file change, or the two-commit pattern if needed). FIREWALL_ALLOW_GRADING
  must never be set; confirm explicitly.
- Anything you couldn't implement faithfully goes in its own section; absence of
  that section is itself an audit flag.
- Commits stay LOCAL. No push, no handoff files, no commits beyond this brief's
  scope. Venkat pushes only after the chat audit clears.

BRIEF 7.7 — ROBO PRODUCTION INTEGRATION (engine rao-master-18).

PRE-CHECK (do this first, report before proceeding): read the current engine version string from engine/preview-engine.js. It must be exactly rao-master-17. If it is anything else, STOP and report — do not begin. Then verify these reference files and STOP on any mismatch: incoming/calm-card-v36.html (md5 deb8d07a84a9f1fbc6847b7ff57a965f, 1,791,115 bytes) · incoming/guided-solve-rebuilt-v1.html (md5 362ca7c1940e1cb8bb09ab3403fdbc65, 1,795,641 bytes) · robo_motion_lab_v29.html (md5 07165667e4adb3ee2ecf4535e3dc27b4) · docs/ROBO-ENGAGEMENT-FRAMEWORK-v4.md present.

## Objective

Integrate Robo (the mascot) into the production Calm Card, implementing ROBO-ENGAGEMENT-FRAMEWORK-v4.md's core layers exactly (v4 carries v3 unchanged; v4's §A personality pack, §B stage props, §C gaze, and §D palette tint are OUT OF SCOPE here — they are Brief 7.8). Reference demo: incoming/calm-card-v36.html — the visual/behavioral target; implement against the real engine files, never by copying demo scaffolding. The reaction ladder's canonical source is incoming/guided-solve-rebuilt-v1.html (the sanctioned, Venkat-approved rebuild — see docs/GUIDED-SOLVE-REBUILD-NOTE.md for provenance; its header comment stays intact in any file you touch it from). Where this brief, the framework, and the reference files disagree, STOP and report; do not resolve it yourself.

## Scope

1. **Port the Robo rig verbatim** from robo_motion_lab_v29.html: inline SVG in a fixed dock (.rao-dock, z-index 8), CSS + WAAPI, no external assets. Strip lab-only chrome (page tokens, controls, target ping, Auto tour, Home corner, stage tap-to-fly). Do NOT port the stage apple (removed by design; the apple TOSS motion inside the rig stays).
2. **Facade:** window.Robo = { play, flyTo, bubble, busy } with DROP-not-queue. Victory lap orbits the active question card with exact-return.
3. **Port the reaction ladder from incoming/guided-solve-rebuilt-v1.html** — the six mood-solve-* reactions (encourage, happy, celebrate, hyped, shook, sleepy) with their exact keyframes and hold timings (2100/1600/2200/2000/1900/held ×slow-factor equivalents). Do not reconstruct from memory and do not substitute the old mood-demo-* stand-ins anywhere.
4. **Wire Layers 1–2 to real card events** (not the demo ccBar): wrong → encourage, correct → happy + praise bubble, streak 3 → celebrate, streak 5 → hyped, comeback → shook, 45 s idle → doze. Praise pool single-sourced: `Nailed it!` / `That's it!` / `Perfect estimate!` / `You got it!` + `⚡ N in a row!` at streak ≥ 2, ~150 ms after correct, ≈ 1900 ms duration. Comeback events draw ONLY from the effort pool (`You didn't give up!` / `You fixed it yourself!` / `That's how it's done — keep trying!` / `You worked it out!`), never the outcome pool; both pools single-sourced side by side. Name personalization at streak ≥ 3 milestones only (celebrate, hyped): append the logged-in child's first name (`Nailed it, Priya! ⚡ 3 in a row!`); never on ordinary corrects, never on comeback, never in walkthrough; read the name from the account/session layer, degrade silently to the nameless line if unavailable.
5. **Remove the existing card cheer row and any in-card mascot/avatar renders**, including the cc-ava seat in chat-bubble creation. Card keeps green option, sparks, chime, takeaway, Next. Hint/step/walkthrough bubbles are faceless (dots → text). Remove dead .cc-ava CSS in production.
6. **Walkthrough silence:** Robo fully quiet (no bubble, no mood, no motion) from walkthrough open through the quiet reveal.
7. **Layer 3 physical play:** tap = poke (6 px / 500 ms threshold; single friendly wobble — the poke LADDER is 7.8 scope), drag with pointer capture, viewport clamps (4 px), yield rule on drop (nearestClear → flyTo), sessionStorage['roboPos'] via savePos on a 700 ms post-drop timer, restore + clamp on load, not grabbable while busy.
8. **Layer 4 ambience:** float, blink, eye-tracking ≤ 260 px (off while dragging/busy), 45 s doze, resize clamps. Stuck-child rule: doze is suppressed when the most recent answer event was wrong; at the 45 s mark, ONE silent lean-in toward the card (no bubble, no sound, no mood, no repeat until the next answer event). Correct re-arms normal doze; a new wrong re-arms exactly one lean-in. Walkthrough silence overrides everything: no lean-in, no doze.
9. **Mobile touch law (hard):** .rao-dock .rao-mascot-wrap{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}
10. **Responsive size:** wrap 120×130 above 600 px, 84×91 at ≤ 600 px; every positional computation (clamps, yield, fly-home, stage bounds) reads offsetWidth/offsetHeight live (re-synced on resize), never a hardcoded constant.

## Laws in force

Calm Card: task immutable · help accumulates · no-repaint · green exactly twice · triumph ≠ rescue. Robo Guide standing rules: MOUTH RULE 1 & 2, CHAIN RULE, GHOST RULE, TONE RULES; anger = authored villain beats only; audio synth-only, respects mute. Engine is forward-only. Anti-laundering applies to every claim in your report.

PUSH DISCIPLINE (hard clause): commit only what your final report enumerates, one line per commit. Do NOT push. Push happens only after Venkat replies with an enumerated authorization naming each commit. Creating or pushing anything not enumerated — including handoff or summary files — is a violation of this brief.

## QA protocol (Guide §8 + additions — show actual output, prove guards fail first)

- Assert-guarded edits only; node --check every touched script.
- Playwright real Chromium at 1280×800 AND 390×844.
- 30 ms mouth-continuity scans on any motion touched.
- Mobile: real synthesized touch via CDP Input.dispatchTouchEvent — touch tap → poke; multi-step touch drag → dock moves; yield on drop; roboPos persisted (assert AFTER the 700 ms timer). Mouse events do not count as mobile QA.
- Timing-aware asserts: takeaway after beat 3 (550 ms); praise bubble expiry before walkthrough-silence reads.
- Zero JS errors, zero horizontal overflow, both viewports.
- Break one guard deliberately, show FAIL, restore, show PASS — at minimum the walkthrough-silence guard and the stuck-child doze suppression.
- Ladder asserts: each of the six events fires its mood-solve-* class with the ported keyframe running (getComputedStyle animationName); comeback praise never emits an outcome-pool string; name appears at streak 3/5 only and never elsewhere; with a wrong answer pending, 45 s idle produces the lean-in (once) and NO doze class; at 390 px the drag clamp honours the 84 px width (dock can reach left ≥ 298 on a 390 px viewport — the old 120 px constant caps it at 266, which is the FAIL you must be able to demonstrate).
- Report md5 + byte count (bytes on disk, not len()) of every shipped file.

## Out of scope

Tutor voice / "Rao sir" identity · new motions · Brief 7.8 territory (poke ladder, entrance, mischief, stage props, gaze, palette theming) · video hosting · any change to question content or grading.

Report back with the numbered reconciliation: pre-check results, tests added, sabotage FAIL outputs (actual output, not summaries), engine version bump to rao-master-18, enumerated commit list (unpushed), and anything you could not implement faithfully — disclosed inside the report structure, not as loose preamble.

