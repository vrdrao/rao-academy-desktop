# BRIEF-SHOWN-ANSWER-1

Ruled by Venkat 2026-07-24. Chat-authored. Runs ONLY after BRIEF-BTN-TRIM-1 is
complete and committed. One task at a time.

## THE RULING

The no-walkthrough second-failure path (`showAnswer()` in `engine/rao-card.js`)
is made consistent with the walkthrough path:

1. **The accumulated hint bubbles CLEAR when the answer is revealed** — same as
   `openWalkthrough()` and `revealSolution()` already do (Item 63's sanctioned
   exception now covers all three commit paths). The chat container lives
   outside `.qbody`, so removing it honours the no-repaint law exactly as the
   other two paths do.
2. **The line "Here's the answer — you've got this!" is REPLACED, verbatim,
   with: "No worries, let's try a new one!"** This closes the open question
   about that line reading as praise for failing twice (#89 in the issue log's
   open-questions set). Everything else in the panel is unchanged: the correct
   option still greens (select), the plain Answer line still renders
   (non-select), no reason is ever fabricated (Venkat's standing ruling),
   outcome stays recorded as "shown-answer".

Related, already handled elsewhere: BRIEF-NOTQUITE-1 (as amended 2026-07-24)
renders NO pill on this path — the panel line above is the only message.

## PHASE 0 — DISCOVERY (read-only)

1. Locate `showAnswer()` in the repo engine and confirm it does NOT currently
   remove the chat, and that `openWalkthrough()` / `revealSolution()` DO
   (`if (chat) { chat.remove(); chat = null; }`). Report line numbers.
2. Grep tools for guards asserting the OLD line text ("you've got this") or
   asserting hint-bubble survival on the shown-answer path — enumerate before
   editing. **STOP-GATE: if any guard asserts the old behaviour for a reason
   this brief does not explain, halt with the guard's text.**

## PHASE 1 — GUARD FIRST (seen FAILING before the fix)

Extend `tools/verify-notquite.js` or the appropriate existing verifier
(follow the repo's pattern; do not create a new file if one fits):

Fixture: a question WITHOUT a walkthrough, calm mode, hint delivered, then two
wrong attempts:

- After the second wrong Check: NO hint bubbles remain (chat container gone),
  the reveal panel is present, and its line is EXACTLY
  "No worries, let's try a new one!"
- The correct option is greened (select fixture) / the Answer line renders
  (non-select fixture) — unchanged behaviour, asserted so it cannot regress.
- Outcome recorded is "shown-answer".

Run against the current engine → must FAIL (old line present, hints present).
Record the failing output.

## PHASE 2 — THE CHANGE

`engine/rao-card.js`, `showAnswer()` only:

- Add the same chat-removal the other two commit paths use, at the equivalent
  point (before the panel renders).
- Replace the `cc-shown-line` text with "No worries, let's try a new one!"
  (exact, including the comma and exclamation mark).
- Dated comment naming this brief and both rulings.
- Amend the law-4 comment block at the top of the file: the sanctioned
  exception now names all THREE paths (openWalkthrough, revealSolution,
  showAnswer), dated.

Phase 1 guard must now PASS. Amend any Phase 0-found guards asserting the old
text/behaviour, each with a dated comment, each proved to bite (temporarily
restore the old line → amended guard must FAIL → re-apply → green).

## PHASE 3 — RECORDS + REGENERATE

1. `docs/ISSUES.md`: close #89 (the "you've got this" praise-for-failing
   question) — resolution: replaced with "No worries, let's try a new one!"
   and hints now clear on this path, ruled 2026-07-24; add the old line
   verbatim in the resolution so it is never restored from a stale note.
2. `STUDENT-INTERACTION-RULES.md`: amend the help-accumulates law's exception
   note to name all three paths, dated.
3. Regenerate `review/` (same #117 CRLF stop-gate).

## PHASE 4 — CLOSE OUT

- Full `npm test` green (exit 0).
- Commit locally:
  `shown-answer: clear hints + "No worries, let's try a new one!" (BRIEF-SHOWN-ANSWER-1, closes #89)`.
- **NO PUSH.**
- Report: Phase 0 findings, failing-then-passing guard output, bite-proofs,
  diff stat.

## STOP-GATES (summary)

- A guard asserts the old behaviour for an unexplained reason → STOP.
- Chat removal cannot be done identically to the other two paths → STOP.
- CRLF drift before review regeneration → STOP.
