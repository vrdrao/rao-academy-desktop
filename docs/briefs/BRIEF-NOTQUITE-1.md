# BRIEF-NOTQUITE-1

Ruled by Venkat 2026-07-24. Chat-authored. Runs ONLY after BRIEF-WHYWRONG-OFF-1
is complete and committed. One task at a time.

## THE RULING

On a WRONG FIRST ATTEMPT in calm mode, the child gets an explicit, instant,
playful "not quite" signal: **a pill + a gentle shake of the card.**

- Reason (Venkat): young children do not register that they were wrong from the
  current quiet feedback (✕ marks + a hint arriving). The signal must be
  instant, visible, and land where the child is already looking.
- The pill text is playful, ties into the next step ("…the hint below"), and
  NEVER states distance from the answer (rule 12: no "close", "almost",
  "nearly").
- The joke lands on the QUESTION, never on the child.
- **Second wrong attempt gets NO joke.** Plain, kind line only (see pools).
- Messages are FIXED ENGINE LINES in a pool — zero per-question authoring.
- Pools are **keyed by grade** so each grade can have its own voice later.
  Only the Grade 4 pool ships now (scope fence: Grade 4 only).

## THE MESSAGE POOLS (verbatim — do not edit, do not add)

Grade 4, first wrong attempt, hint available (rotate randomly, never the same
line twice in a row):

1. "Ooh, tricky one! The hint below will help"
2. "The answer is still hiding — your clue is below!"
3. "Keep hunting, detective! Check the hint below"
4. "Oops-a-daisy! The hint below will help you"
5. "Hmm, nope! Let's peek at the hint below"

Grade 4, first wrong attempt, NO hint will appear (child already exhausted the
hint ladder before answering — the "below" promise would be false):

- "Hmm, not that one — try again!"

Grade 4, second wrong attempt, ONLY when a walkthrough exists and will open
(the pill is the doorway into it):

- "Let's work it out together"

Second wrong attempt with NO walkthrough: **NO pill at all.** The shown-answer
panel carries its own line ("No worries, let's try a new one!" — see
BRIEF-SHOWN-ANSWER-1, ruled the same day). A pill here would contradict the
panel ("work it out together" followed by "try a new one"). AMENDED 2026-07-24
same-day, before first run — this supersedes any earlier draft of this brief
that showed the pill unconditionally on attempt 2.

Structure: a single grade-keyed object (e.g. keys "4", later "3", "5"…) with
the three slots above per grade. Resolve grade from wherever the lesson/engine
already knows it. **STOP-GATE: if no grade signal exists at runtime, halt and
report what IS available — do not invent a detection mechanism. Defaulting to
the "4" pool when no signal exists is acceptable if reported.**

## BEHAVIOUR SPEC

On a wrong Check in calm mode, in this order:

1. Existing marks fire exactly as today (✕ / tint / tile edges — untouched).
2. **The pill appears INSTANTLY** (no typing delay) in the feedback slot —
   the calm path currently blanks it deliberately (`fb.className="pv-fb";
   fb.textContent=""` with the comment "the bubble carries it"; that comment
   is now obsolete — the bubble is gone since WHYWRONG-OFF-1). Pill picks from
   the correct pool/slot:
   - attempt 1 + hint fallback will fire → hint-pointing pool (rotate, no
     immediate repeat; track last index in the card closure)
   - attempt 1 + hint ladder exhausted → the no-hint fallback line
   - attempt 2 (the cap) + walkthrough will open → the plain second-miss line
   - attempt 2 (the cap) + NO walkthrough → no pill (see pools section)
3. **The card gives one gentle shake** — a short CSS animation (~300–400ms,
   small horizontal amplitude), added/removed via a class. Must respect the
   no-repaint law (no DOM rebuild; class toggle only) and must not run again
   until the next wrong Check. Respect `prefers-reduced-motion`: no shake when
   the device asks for reduced motion.
4. The auto-hint then types below exactly as it already does — the pill's
   "below" promise is kept by existing behaviour. Do not change hint logic.

Clearing (existing fresh-start rules extend to the pill):

- "Try again" tap → pill gone, shake class gone.
- Any NEW selection / blank edit → pill gone (same trigger that already hides
  stale feedback, #111 machinery — extend it, do not duplicate it).
- Correct answer → pill never shows; nothing changes on the correct path.

Out of scope: rapid-fire and quiz modes keep their existing "Not quite"
handling. Calm mode only.

## PHASE 0 — DISCOVERY (read-only)

1. Confirm in the repo engine where the calm path blanks the feedback slot and
   where the shake would attach (card frame vs qbody) — report the exact
   anchor points before editing.
2. Confirm what grade signal (if any) reaches the card at runtime (lesson
   frontmatter, config, manifest). STOP-GATE above applies.
3. Confirm no existing CSS class named for shake collides.

## PHASE 1 — GUARD FIRST (seen FAILING before the fix)

New guard `tools/verify-notquite.js`, registered in `test` and `test:fast`.
Fixture-driven, calm mode:

- Wrong attempt 1 → pill visible, text is EXACTLY one of the five pool lines,
  shake class present then removed.
- Two consecutive wrong-attempt-1 renders → pill text differs (no immediate
  repeat). Use a seeded/forced random if needed for determinism.
- Hint ladder exhausted first, then wrong → pill text is EXACTLY the fallback
  line (not a pool line).
- Wrong attempt 2 on a question WITH a walkthrough → pill text is EXACTLY the
  second-miss line, then the walkthrough opens.
- Wrong attempt 2 on a question WITHOUT a walkthrough → NO pill renders.
- "Try again" → pill absent.
- New selection after wrong → pill absent.
- Correct answer → pill never present.
- No pool line anywhere contains "close", "almost", or "nearly" (rule-12
  lint on the pool itself).

Run against the current engine → must FAIL. Record the failing output.

## PHASE 2 — BUILD

Implement per the spec. Keep the pool object at the top of the file, dated,
with a comment naming this brief and Venkat's ruling, and noting that new
grades add a key here — no other change.

Phase 1 guard must now PASS. Full existing suite must stay green — in
particular the WHYWRONG-OFF guard and retry-state guards must be untouched
and passing.

## PHASE 3 — RECORDS

1. `STUDENT-INTERACTION-RULES.md`: add **Rule 19** (dated, RULED by Venkat
   2026-07-24): wrong first attempt = instant playful pill + gentle shake;
   pill points to the hint; joke lands on the question, never the child;
   second attempt gets the plain line; pools are grade-keyed engine lines,
   never per-question content; rule 12 applies to every line.
2. `docs/ISSUES.md`: add a RECORD row for this ruling (supersedes the old
   "calm mode shows no Not-quite pill" design — cite the old comment so
   nobody restores it from a stale note).

## PHASE 4 — REGENERATE `review/`

Same precondition as WHYWRONG-OFF-1 Phase 4 (#117 CRLF stop-gate), then
regenerate all lesson review pages so Venkat's preview shows the pill + shake.

## PHASE 5 — CLOSE OUT

- Full `npm test` green (exit 0).
- Commit locally:
  `notquite: instant pill + gentle shake on wrong attempt, grade-keyed pools (BRIEF-NOTQUITE-1)`.
- **NO PUSH.**
- Report: anchor points found, grade-signal finding, failing-then-passing
  guard output, and diff stat.

## STOP-GATES (summary)

- No runtime grade signal → report before proceeding (default-to-4 only if
  reported).
- Shake cannot be done without violating no-repaint → STOP.
- Any existing guard goes red for reasons unrelated to this change → STOP.
- CRLF drift before review regeneration → STOP.
