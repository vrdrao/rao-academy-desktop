# BRIEF-FIX-GEO-WIRING-1
Fix ISSUES #75: engine/geometry-engine.js is not inlined into review pages, so
all 31 construct questions render "Geometry engine not loaded" and are dead.
Guard-first, minimal, staged. Also close #76 (not-a-defect) and record both
findings in docs/ISSUES.md.

## CONSTRAINTS
- Do NOT edit any lessons/ content. This fix touches only: make-review.js, the
  generated review pages, a new guard file, and docs/ISSUES.md.
- No commit, no push. Leave everything as a modified/untracked working tree for
  Venkat to review.
- GUARD-FIRST: the new guard must FAIL before the fix and PASS after, proved by
  sabotage (undo the wiring → FAIL, restore → PASS). Show both.
- Show every diff. Measure sizes; never guess.

## STEP 1 — INVESTIGATE, then STOP
Before changing anything, report:
(a) How make-review.js inlines the OTHER engine assets — which files, and whether
    each is inlined into EVERY review page or only pages that need it. Quote the
    code (file:line).
(b) Size of engine/geometry-engine.js (confirm ~962 KB) and the review/ size delta
    of two options:
    - Option A: inline into every review page, matching the others.
    - Option B: inline ONLY into pages that contain a construct/geometry question.
    Give the total added bytes for each (962 KB × page count).
(c) Your recommendation. Default to the MINIMAL correct fix: if the others inline
    everywhere and Option A is large, prefer Option B so 100+ non-geometry pages
    are not bloated with an engine they never use.
STOP. Show me (a)-(c). Do not proceed until I confirm the option.

## STEP 2 — WIRE (only after I confirm the option)
Inline engine/geometry-engine.js via the confirmed option, matching the existing
inlining mechanism. Show the make-review.js diff.

## STEP 3 — REGENERATE + VERIFY (live)
Regenerate the affected review pages. Then verify with a Playwright probe (same
method as the diagnostic):
- window.RaoGeo is defined on a regenerated geometry page.
- The string "Geometry engine not loaded" appears ZERO times across all
  regenerated pages.
- At least one construct question grades a correct answer TRUE (answerable).
Report the render count — target 31/31 — and name any that still fail.

## STEP 4 — GUARD (sabotage-proved)
Add a guard (tools/verify-geo-wired.js, or the nearest existing verify-* home) that
asserts a construct question renders with RaoGeo defined and NO "Geometry engine
not loaded" string. Wire it where the other verify-* guards run (npm test). Prove
it FAILS with the wiring removed and PASSES restored — show both — and report the
npm test exit code.

## STEP 5 — LOG (obey docs/ISSUES.md laws: never renumber, never delete)
- Close #76 as not-a-defect, closed 2026-07-22, resolution = the live-grade proof:
  identity-keyed grading (preview-engine.js:2838), no shuffle path, correct→TRUE,
  reversed-position-same-identity→TRUE, wrong→FALSE; "has,none,has,none" was the
  answer-line display, not a misgrade; 154 categorize Qs / 68 files, 0 at risk.
- Close #75, closed 2026-07-22, resolution = which option chosen, the make-review.js
  change, 31/31 now render, the new guard. ADD the note: there is no consuming app
  yet, so the review pipeline is the only surface today — whatever system eventually
  renders these lessons must ALSO load geometry-engine.js or the 31 break again there.

## OUTPUT
Paste inline when done: the Step 3 render count (X/31), the Step 4 sabotage result
(FAIL→PASS) and npm test exit code, and confirmation that #75 and #76 are logged.
No commit, no push.
