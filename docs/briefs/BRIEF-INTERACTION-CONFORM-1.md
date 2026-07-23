# BRIEF-INTERACTION-CONFORM-1 — close the gap between the rules and the engine

Chat-authored 2026-07-23. Grade 4 only. `lessons-g3/` out of scope.

**Read `STUDENT-INTERACTION-RULES.md` before starting.** It is the authority for
this brief. Where this brief and that file disagree, **that file wins and you
STOP and report the discrepancy.**

This brief closes five gaps between the ruled interaction model and what the
engine does today. Three are defects found by the Interaction Atlas; one is a
parked fix; one is a removal Venkat ruled.

**Supersedes and absorbs `BRIEF-RETRY-STATE-3`** (parked at Phase 1, nothing
built). Do not execute that brief separately — item 3 below is its content.

---

## 0. STANDING RULES

1. **Guard-first, always.** For each item: write the fixture, run it, **see it
   FAIL**, then fix, then see it PASS. Report FAIL output verbatim. A guard not
   observed failing is not a guard.
2. **Measure the repo, never these notes.** Verify before acting. Repo disagrees
   with this brief → **STOP and report.**
3. **No-repaint law is BINDING.** Panels are hidden or cleared, never removed;
   the question DOM never rebuilds mid-question. A fix that rebuilds the card is
   rejected at audit even if it looks right on screen.
4. **Anti-laundering.** Every count traceable to a command. "UNPARSED, reason X"
   beats a guess.
5. **Engine only.** Zero changes under `lessons/`. If a fix appears to need a
   content change, **STOP and report.**
6. **No pushing.** Local commits only.

---

## PHASE 0 — Recon (no edits)

`REPORT-INTERACTION-CONFORM-1-PHASE0.md`.

**0.1** Confirm HEAD is `1d50f07` (or later) and unpushed state. Report
`git log --oneline origin/main..HEAD`.

**0.2 — item 1, the red box.** Find where a fill-blank input's wrong-styling is
applied (the Atlas report names `markFeedback()` around `rao-card.js:699`, but
**verify**). Report exactly why it disagrees with the grader: the Atlas found the
grader was taught comma and commutative forms on 2026-07-23 but the painter still
normalises with whitespace-strip only. Confirm or correct that account.

**0.3 — item 2, multi-select tick.** Report what happens to a correctly-picked
option's tick after Check when another pick was wrong. Name the code path.

**0.4 — item 4, the explain line.** Report **every** place the `explain` line is
produced, stored, rendered, or referenced — engine, tools, review generators,
authoring docs. Report how many lesson questions carry an `explain` field.
**Report only. Change nothing yet.**

**0.5 — item 5, ordering.** Report how an ordering/sorting answer is compared to
its key today, and whether per-tile correctness is already computed internally
(it may be — the comparison has to know). If it is, the fix is display-only. Say
which.

**0.6 — population counts**, each with its command: fill-blanks affected by the
red box; multi-select questions; ordering/sorting questions; questions carrying
an `explain`.

**STOP GATE 1 — report and wait.**

---

## PHASE 1 — Guards, proved failing

`REPORT-INTERACTION-CONFORM-1-PHASE1.md`. Guards only, zero production changes.

**G10 — a right answer is never painted wrong.** *(rules 10, 12)*
Type `42,613`, `1,00,000`, `16+31=47` into their real questions. Assert graded
**correct** AND the input carries **no wrong-styling**. Sabotage: `4-9=5` must
still be graded wrong **and** painted wrong.

**G11 — multi-select shows what the child picked.** *(rule 12)*
Pick one right and one wrong. Assert the right pick remains **visually distinct
from options never chosen**. Assert the wrong pick carries its ✕.

**G12 — Try again is a fresh start.** *(rule 2)*
After a wrong verdict, click Try again. Assert **each separately**: "Not quite"
chip hidden; whyWrong panel hidden; red tint cleared; typed value cleared;
selection cleared; **nodes still present in the DOM** (no-repaint); and **the
hint still open and visible** if one was opened.

**G13 — the explain line is gone.** *(rule 13)*
Assert no state renders an explain line. Include the state that most needs it:
**first wrong answer on a question with no whyWrong** — assert the child sees the
red mark and **no answer reveal.** This is the rule-6 case; it is the reason the
explain was removed.

**G14 — ordering marks the misplaced tiles.** *(rule 14)*
Key `3,024 · 3,204 · 3,240 · 3,402`; child submits `3,024 · 3,204 · 3,402 ·
3,240`. Assert the two misplaced tiles carry wrong-styling and **the two correct
ones do not.** Sabotage: assert the **correct order is NOT revealed** — marking
which tiles are misplaced must not show where they belong, while an attempt
remains (rule 6).

**G15 — regression guard.** Assert the four BRIEF-RETRY-STATE-2 fixes still hold:
comma/Indian grading, addition commutativity, box widths, typed-value clearing on
Try again.

**Exit requirement:** state in the report, **before running**, which guards you
expect to fail and which to pass. Then show actual results against that
prediction. G15 is expected to PASS — it is a regression guard.

**STOP GATE 2 — report and wait.**

---

## PHASE 2 — The fixes

`REPORT-INTERACTION-CONFORM-1-PHASE2.md`.

**Item 1 — the red box.** Make the painter agree with the grader. **Do not
duplicate the grader's normalisation logic** — a second copy will drift from the
first exactly as it did here. Both must consult one shared source of truth. If
that is not possible without restructuring, **STOP and report** rather than
copying the logic.

**Item 2 — multi-select tick.** A correctly-picked option must stay visually
distinct from one never chosen.

**Item 3 — Try again fresh start.** Extend the Try-again path to clear the
whyWrong panel and chip. **Hide, never remove.** The hint must survive. Keep the
existing dismiss-on-new-selection behaviour — extend it, do not replace it.

> **Law-4 conflict, RULED — expected, not a regression.** `verify-reset.js`
> law-4 assertions require every `.cc-msg` bubble to survive a reset. Rule 4 is
> now narrowed: **hints persist; answer-specific feedback does not.** Amend those
> assertions to distinguish the two — hint bubbles must still be asserted
> visible; whyWrong bubbles asserted hidden. **Do not weaken to "some bubbles
> survive"** — it must still fail if a hint vanishes. If a fixture cannot tell
> the types apart, **STOP and report**; do not delete an assertion to go green.

**Item 4 — remove the explain line.** Remove its rendering from the engine.
**Do NOT strip `explain` fields from lesson content** — that is a content change
and out of scope. Report the count of orphaned fields for a later content brief.

**Item 5 — ordering marks misplaced tiles.** Misplaced tiles get wrong-styling;
correctly-placed tiles get none. **Do not reveal the correct order.**

Run G10–G15: all must PASS. Run the full suite. Report every test that changed
state and why.

**STOP GATE 3 — report and wait.**

---

## PHASE 3 — Review artifact and commit

`REPORT-INTERACTION-CONFORM-1-PHASE3.md`.

**3.1** Rebuild the Interaction Atlas as `review/_INTERACTION-ATLAS-2.html`
against the fixed engine, same 22 scenarios, same plain-English captions, same
technique. **Keep the original file** so Venkat can compare before and after.
Every tile previously tagged "a problem" must now be clean — **and if one is not,
say so in the report rather than re-tagging it.**

**3.2** Line endings: **byte-level Python** (`b.count(b"\r\n")`), not grep.

**3.3** Run `node tools/verify-format.js <lesson>` explicitly and paste output.
`verify-format-staged` reports green when nothing is staged and no check ran.

**3.4** `docs/ISSUES.md`: close the three Atlas defects and #111; add rows for
the explain removal and the ordering change, each naming its rule in
`STUDENT-INTERACTION-RULES.md`.

**3.5** Commit locally. **DO NOT PUSH.** Report hash, file list, and
`git log --oneline origin/main..HEAD`.

---

## Deliverables

- amended `tools/verify-retry-state.js` (G10–G15)
- amended `tools/verify-reset.js` (law-4 narrowing)
- amended engine files
- `review/_INTERACTION-ATLAS-2.html` (original retained)
- `docs/ISSUES.md` updated
- four phase reports
- one local commit, unpushed

## Out of scope

- `lessons-g3/` — hard fence
- lesson content, including stripping orphaned `explain` fields
- `docs/MISCONCEPTIONS.md`
- corpus-wide review page regeneration (#117-gated)
- the four open questions in `STUDENT-INTERACTION-RULES.md` — **unruled, do not
  implement, do not infer**
