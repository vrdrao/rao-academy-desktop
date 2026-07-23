# BRIEF-CULL-1B — Close the cull: authorised constant update, then commit

**Authorised by chat after auditing BRIEF-CULL-1A. 2026-07-20.**

BRIEF-CULL-1A halted correctly at Phase 4 on a single stale constant. That halt
was right and is recorded as a success. This brief completes the work.

**Nothing in BRIEF-CULL-1A is to be re-run.** The 15 moves and 15 review
deletions are already in the tree. Do not repeat them. Do not regenerate review
pages again.

---

## THE AUTHORISATION

`tools/verify-question-ids.js:32` holds `const EXPECTED = 3015;`

**You are authorised to change this value to 2668.**

This is not tuning a guard to pass. The cull was authorised in advance, the
target of 2,668 was written into BRIEF-CULL-1A before it ran, and two
independent measurements (arithmetic reconciliation and the grading gate) both
landed on 2,668. The constant is stale, not the corpus.

**This authorisation covers this one constant and nothing else.** If any other
guard fails, STOP and report. Do not fix. Do not tune.

---

## PHASE 1 — Improve the tripwire, do not merely bump it

A bare integer fired correctly but could not tell an authorised cull from a
silent regression. Fix the general case.

Change the constant to `2668` AND add a comment block directly above it, in
this shape:

```js
// Corpus-size tripwire. This number must ONLY ever change as part of an
// explicitly authorised brief that predicts the new value BEFORE the run.
// Never edit this to make a failing test pass.
//
// History:
//   3015 -> 2668  BRIEF-CULL-1A/1B, 2026-07-20: 15 duplicate _1to1/faithful
//                 lessons archived to archive/lessons-1to1/. 347 questions
//                 removed from the live corpus. Their IDs remain permanently
//                 taken in docs/question-ids.json, which did not shrink.
const EXPECTED = 2668;
```

Keep the exact variable name and semantics. Only the value and the comment
change.

**Do not** make the constant dynamic, auto-derived, or read from a file. Its
entire value is that it is a hard-coded number a human had to authorise.

---

## PHASE 2 — Prove the tripwire still discriminates

The guard's purpose is to catch an unauthorised corpus drop. Prove it still
does, at the new value.

1. **Sabotage:** temporarily remove one question from one lesson source in
   `lessons/incoming/` (any file, any question).
2. Run `node tools/verify-question-ids.js`. **It must FAIL** and the failure
   message must name the number it saw (2667) against the number it expected
   (2668).
3. **Restore the removed question exactly.** Confirm via `git diff` that the
   file is byte-identical to before the sabotage.
4. Re-run the guard. It must now PASS.

**Report the exact failure text from step 2 and the exact pass output from
step 4.** A sabotage reported without its numbers is not a proof.

If the sabotage does NOT cause a failure, STOP and report — the guard is not
discriminating and bumping it would have been laundering after all.

---

## PHASE 3 — Full suite

Run `npm test`, unpiped, and report the exit code.

Name every guard individually with its exit code. Do not summarise as "all
passed."

**Expected:** `verify-question-ids.js` now passes at 2,668. Every other guard
unchanged from the last green run.

If any guard other than `verify-question-ids.js` behaves differently than it
did before this brief, STOP and report. Do not fix.

---

## PHASE 4 — Commit, local only

One commit. Suggested message:

```
BRIEF-CULL-1A/1B: archive 15 duplicate _1to1 lessons

Move 15 duplicate faithful/1to1 lesson sources from lessons/incoming/ to
archive/lessons-1to1/ via git mv, delete their stale review pages, and update
the corpus-size tripwire from 3015 to 2668.

Corpus: 118 -> 103 lessons, 3015 -> 2668 questions.
Reconciliation: 3015 - 347 = 2668, confirmed independently by the grading gate.
docs/question-ids.json unchanged at 3015 entries (append-only; archived
questions' IDs stay permanently taken and permanently dead).

Excluded from the cull and retained:
  - estimate-sums-faithful.html (Brief 7.5 proof lesson, deliberately
    re-authored; matches the rule by name only)
  - Multiply_two-digit_by_two-digit_word_problems__1to1.html (no surviving
    remix twin; archiving would have permanently deleted 26 questions)
```

**Do NOT push.** Report `git status -sb` and the ahead-count when done.

---

## PHASE 5 — Report

Report in this order:

1. The constant change, with the file and line.
2. Phase 2 sabotage: the exact failure text, the exact restore confirmation,
   the exact pass output.
3. Every guard in `npm test`, named individually with its exit code.
4. `npm test` overall exit code, unpiped.
5. `git status -sb` and the ahead-count.
6. Confirmation that `lessons-g3/` was not touched (file count).
7. Anything noticed but not acted on.

**Do not push. Do not self-commission follow-up work. Do not write a handoff.**
