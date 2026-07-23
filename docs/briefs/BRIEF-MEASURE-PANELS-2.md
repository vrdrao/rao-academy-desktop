BRIEF-MEASURE-PANELS-2
Chat-authored 2026-07-22. Read-only. One phase. STOP at the end.

PURPOSE
Item 81: solution panels grow downward and never sideways. On desktop the panel
sits inside a 758px capped column and leaves up to ~91% of that width unused; the
child scrolls instead. REPORT-MEASURE-PANELS-1.md measured this and Ruling 19 set
the direction.

That measurement is now STALE. BRIEF-G3-ENGINE-1 changed the solution panel after
it was taken — engine/rao-card.js, engine/rao-card.css,
engine/solution-renderer.js (five engine law changes, including new table/facts/
rule solution blocks), all landed in commit 6723912. The panel that was measured
is not the panel that exists.

This brief RE-MEASURES the panel as it now stands, using the SAME method and the
SAME widths as REPORT-MEASURE-PANELS-1.md, so the two reports are directly
comparable. The layout contract will be written against THIS report, not the old
one.

SCOPE FENCE
- Read-only. This brief writes exactly one file: REPORT-MEASURE-PANELS-2.md.
- Do NOT edit any lesson file. Do NOT edit the engine. Do NOT edit any CSS.
- Do NOT propose a fix, write a contract, or suggest CSS. Numbers only.
- Do NOT commit. Do NOT push.
- Grade 4 (`lessons/`) is the target. Read-only access to `lessons-g3/` is
  permitted ONLY for the comparison in step 7; never written.

METHOD FIDELITY (the point of this brief)
Before measuring anything, READ REPORT-MEASURE-PANELS-1.md in full and reproduce
its method exactly: same widths, same measured properties, same shape list, same
definition of "wasted width" and "overflow". If any part of its method cannot be
reproduced, STOP and report which part and why — do not substitute a method of
your own. A re-measurement using a different method answers a different question
and is worse than no re-measurement.

────────────────────────────────────────────────
THE MEASUREMENT
────────────────────────────────────────────────
  1. Report REPORT-MEASURE-PANELS-1.md's method verbatim as you will apply it:
     the exact widths, the exact properties captured, the exact shape list, and
     how it computed wasted width and overflow. Confirm real fonts are loaded
     (the original loaded them; a fallback font changes every number).

  2. Report which solution shapes exist NOW. The original measured 7. If the
     count or the names differ, say so explicitly and list what changed — new
     shapes introduced by BRIEF-G3-ENGINE-1 (table/facts/rule blocks) are the
     expected difference, but do not assume. For each shape, report how many
     live instances exist in Grade 4 and name one representative lesson +
     question ID used for the measurement.

  3. For every shape at each of the three widths (use the SAME three widths as
     the original — report them explicitly before measuring), capture:
       - rendered panel width (px)
       - rendered content width (px) — the width actually occupied
       - fill percentage (content / available)
       - rendered panel height (px)
       - vertical overflow against the viewport height used by the original
       - reflowable vs unbreakable, using the original's definition

  4. SIDE-BY-SIDE DELTA TABLE. For every shape and width that appears in BOTH
     reports, show old value, new value, and the difference. This is the single
     most important output of this brief. Specifically confirm or refute these
     four claims from REPORT-MEASURE-PANELS-1.md:
       (a) available panel width plateaus at 758px on screens ≥ ~868px
       (b) worst fill @1280: table-1 and facts at 8.7%, table-absent at 11.5%
       (c) at 800px laptop height, table-absent overflows by 102px, steps by 9px
       (d) worst phone overflow: steps at 510px
     For each: HOLDS / CHANGED (with the new number) / NO LONGER APPLICABLE
     (with the reason, e.g. the shape no longer exists).

  5. NEW SHAPES. For any shape that did not exist in the original report,
     measure it fully and state that it has no baseline. Do not invent a
     comparison.

  6. THE `figure` SHAPE. Ruling 19(3) says the contract must include a rule for
     `figure` up front because it had no instances and no CSS. Report whether
     `figure` now has any instances or any CSS. If it still has neither, say so
     — that is the expected answer and it is useful.

  7. GRADE 3 COMPARISON (read-only, no writes). Report whether Grade 3 solution
     panels use the same shapes and the same container. One short paragraph.
     The contract has to serve both grades even though Grade 4 is the active
     focus, so chat needs to know if they diverge.

  8. THE `steps` CONTENT PROBLEM. Ruling 19(4) found Grade 4's `steps` shape
     overflows a phone by 510px because of a long verification sentence — ruled
     a CONTENT problem, not layout. Report: does that long sentence still exist?
     What is the current worst-case `steps` phone overflow, and how much of it
     is attributable to that one sentence versus the shape itself? Columnising
     will not fix it, so chat needs the split.

  9. WALKTHROUGH IS OUT OF SCOPE. Ruling 19(3) declared the walkthrough
     (.sol-walk / .cc-bub) outside the contract because it uses a different
     container. Confirm it still uses a different container. If
     BRIEF-G3-ENGINE-1 merged them, that is a significant finding — report it
     and do not measure the walkthrough either way.

────────────────────────────────────────────────
OUTPUT
────────────────────────────────────────────────
Write REPORT-MEASURE-PANELS-2.md containing all of the above. Structure it so the
delta table (step 4) is near the top — that is what chat reads first.

End the report with a plain-language paragraph, written for a non-technical
reader, answering one question: does the panel behave better, worse, or the same
as when it was first measured?

────────────────────────────────────────────────
HARD RULES
────────────────────────────────────────────────
- Never write to a lesson file, the engine, or any CSS file.
- Never commit. Never push.
- Never propose a fix. If you notice an obvious one, note it in one line at the
  end under "observations" and stop there.
- Never substitute your own measurement method for the original's. If the
  original's method is unclear, STOP and report the ambiguity.
- Never report a number you did not measure. If a shape cannot be rendered,
  report it as UNMEASURED with the reason — do not estimate.
- If anything is ambiguous, STOP and report the exact text. Do not decide.
