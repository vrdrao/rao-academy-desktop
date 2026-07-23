# BRIEF-DIAG-CRIT-1
Read-only diagnosis of the two unconfirmed critical Grade 4 bugs:
ISSUES #75 (geometry engine not loaded) and #76 (categorize positional grading).
Confirm each, find the mechanism, size the blast radius. No fixes.

## HARD CONSTRAINTS
- READ ONLY. Do not edit/move/delete any file. The ONLY file you create is the
  report named in OUTPUT.
- Grade 4 lessons may be READ. Nothing in the repo is written except the report.
- No commit, no stage, no push.
- PROVE, DO NOT ASSERT. Every claim about how the code behaves carries a
  file:line citation. Every count is a real grep/enumeration, never an estimate.
  If something cannot be determined, write "COULD NOT DETERMINE — <reason>";
  never guess.
- Label every verdict CONFIRMED (proven by running it) or INFERRED (read the
  code and reasoned).

## PART A — #75 geometry engine (lesson qgtig2x2q, Q10 fails "Geometry engine not loaded")
A1. Does the engine file exist? Locate raoGeoEngine.js (or whatever provides the
    geometry engine). Report its path and size, or state it does not exist.
A2. Find the EXACT source of the string "Geometry engine not loaded" — grep it.
    Report file:line and QUOTE the precise condition that emits it (file absent?
    a global/symbol undefined? an init call? a per-type guard?). Do not summarize
    the condition — quote it.
A3. Enumerate every question that depends on the geometry engine across lessons/.
    Report total count, the lessons, and the question ids. State how you detected
    dependence (question type? an engine-call marker?) and cite the pattern.
A4. For qgtig2x2q Q10: is the engine actually loaded on that page at all? Trace
    the load path — how is the engine supposed to reach a lesson page (script tag?
    build inline? a loader?) and is it present for this lesson. If any geometry
    question renders CORRECTLY anywhere, diff the working one against Q10 to
    isolate why Q10 fails.
A5. VERDICT: 1 broken question or systemic? How many geometry questions are
    currently DEAD (error string, unanswerable) vs rendering fine? CONFIRMED or
    INFERRED.

## PART B — #76 categorize grading (lesson qnpwn98bv, Q16 answer renders "has, none, has, none")
B1. Read the categorize grading path. Does it compare tile IDENTITY (which tile in
    which bin) or tray POSITION (slot index)? Cite the file:line of the compare.
B2. Read the categorize render/init. Do tiles SHUFFLE order on load, or render in
    a fixed authored order? Cite file:line.
B3. LIVE PROOF (preferred over B1/B2 inference — use the same throwaway-probe
    method the measurement pass used, no repo change): render/grade qnpwn98bv Q16.
    Feed the grader the IDENTITY-correct mapping and report accept/reject. If tiles
    shuffle, show that a shuffled order changes the graded result for the same
    identity mapping. If you cannot run it, say so and fall back to B1/B2.
B4. COMBINED VERDICT for Q16: can a child who sorts correctly be marked wrong?
    True only if grading is positional AND order varies. State plainly, CONFIRMED
    or INFERRED.
B5. Blast radius: total categorize questions across lessons/; of those, how many
    shuffle their tiles (the actually-at-risk set). Report counts and lessons.

## OUTPUT
Write REPORT-DIAG-CRIT-1.md at the repo root. No other file changes. When done,
paste inline: the A5 verdict, the B4 verdict, and both blast-radius counts.
