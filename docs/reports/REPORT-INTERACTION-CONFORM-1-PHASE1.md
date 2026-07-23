# REPORT-INTERACTION-CONFORM-1 — Phase 1 (Guards, proved failing)

Run 2026-07-23. Guards only — **zero production changes**. Rule 14 confirmed by
Venkat to cover both `order` and `sequence-build`.

All six guards (G10–G15) were added to `tools/verify-retry-state.js` (the file
the brief names). The five RETRY-STATE-2 guards (G1–G5) already in that file
still pass, untouched. Only tracked change this phase: `tools/verify-retry-state.js`
(+450 lines). No file under `engine/` or `lessons/` was touched.

---

## Exit requirement — prediction stated BEFORE running

| Guard | Predicted | Reasoning (from Phase 0) |
|---|---|---|
| **G10** | **FAIL** | The painter (`markFeedback`) never learned the grader's comma/Indian/commutative forms, so `42,613` / `1,00,000` / `16+31=47` grade correct yet get `.incorrect`. Sabotage `4-9=5` already stays wrong+painted → that one asserts PASS. |
| **G11** | **FAIL** | `clearSelection()` strips `.is-sel` from the correct pick, which `markWrongSelections()` deliberately left unmarked → correct pick becomes identical to a never-chosen option. Wrong-pick ✕ asserts PASS. |
| **G12** | **FAIL** | `resumeAnswering()` restores only `.qbody`; the whyWrong panel + "Not quite" chip live outside it and are NOT hidden on Try again. Typed/selection/tint clear, nodes present, and the hint survives → those assert PASS. |
| **G13** | **FAIL** | `rao.css:654` reveals `.explain` on a correct answer (`is-checked`). The rule-6 sub-case (first wrong reveals nothing) already holds → it asserts PASS. |
| **G14** | **FAIL** | `.order-slots.incorrect` only runs a shake animation — there is no per-tile marking at all. Correct-tile and sabotage assertions PASS. |
| **G15** | **PASS** | Regression bundle — the four RETRY-STATE-2 fixes already shipped in `1d50f07`. |

---

## Actual results vs prediction — MATCH on all six

Command: `node tools/verify-retry-state.js` (exit 1; **8 assertions failed**, all
of them the ones predicted to fail).

### G10 — right answer never painted wrong → **FAIL** (as predicted)
```
FAIL  G10a — comma form 42,613 correct + no red box — graded=true redBox=true
FAIL  G10b — Indian form 1,00,000 correct + no red box — graded=true redBox=true
FAIL  G10c — commutative sum 16+31=47 correct + no red box — graded=true redBox=true
PASS  G10d — subtraction 4-9=5 wrong + red box (sabotage) — graded WRONG and painted wrong
```
`graded=true` proves the grader accepts all three; `redBox=true` proves the
painter marks them `.incorrect` anyway. The sabotage stays correctly wrong+painted.

### G11 — multi-select shows what the child picked → **FAIL** (as predicted)
```
FAIL  G11 — correct pick stays visually distinct from a never-chosen option —
      both render identically — sig=rgb(224,219,244)|rgb(255,255,255)|none|rgb(255,255,255)|rgb(205,199,232)
PASS  G11 — wrong pick carries its ✕ — cc-x present
```
The signature is the resting look of an **unselected** `.opt` (default lavender
border `rgb(224,219,244)`, plain check-ind `#cdc7e8`): the correct pick "12" is
byte-for-byte the same as never-chosen "20". The wrong pick keeps its ✕.

> **Guard-quality correction, disclosed.** The first run of G11 falsely PASSED.
> Cause: `.opt` and `.check-ind` carry 150ms CSS transitions, and I read the
> style signature 120ms after Check — catching the correct pick mid-fade back to
> rest, so it *transiently* differed from a never-chosen option. That is a timing
> artifact, not a real distinction; the guard would have passed both before and
> after the fix — i.e. it was worthless. Fixed by moving the pointer off every
> card element (`mouse.move(1,1)`) and waiting 500ms for transitions to settle
> before reading. G11 now genuinely fails pre-fix. The same settle fix was applied
> to G14 (its last-placed tile was briefly hovered/mid-transition, which made one
> misplaced tile spuriously differ — `s3=true` in the first run, now correctly
> `s3=false`). Both now compare **resting** looks only.

### G12 — Try again is a fresh start → **FAIL** (as predicted)
```
FAIL  G12 — whyWrong panel HIDDEN after Try again — stale 'Not quite' survives
FAIL  G12 — 'Not quite' chip hidden after Try again — chip still visible
PASS  G12 — selection cleared — 0 selected
PASS  G12 — red tint / ✕ marks cleared — 0 marks
PASS  G12 — HIDE not remove: nodes still in the DOM — why + chip + hint present
PASS  G12 — the HINT survives Try again — hint bubble still visible
```
Exactly the split Phase 0 predicted: `restoreTask()` cleans `.qbody` (selection,
marks) and the whyWrong/hint nodes live outside it, so they persist — but the
Try-again path does **not** hide the whyWrong panel/chip. The hint correctly
survives (rule 2's "stays" clause) and no node was removed (no-repaint holds).

### G13 — the explain line is gone → **FAIL** (as predicted)
```
FAIL  G13a — a correct answer renders NO explain line — graded=true explainVisible=true
PASS  G13b — first wrong shows the red mark — blank tinted incorrect
PASS  G13b — first wrong reveals NO answer (rule 6) — not checked, explain not visible
```
On a correct answer, `is-checked` reveals `.explain` (the line rule 13 removes).
The rule-6 case already holds: a first wrong answer shows the red mark and reveals
nothing.

### G14 — ordering marks the misplaced tiles → **FAIL** (as predicted)
```
FAIL  G14 — both misplaced tiles carry wrong-styling — s2=false s3=false —
      misplaced tiles are not individually marked (rule 14)
PASS  G14 — correctly-placed tiles carry NO wrong-styling — slots 0 & 1 share the baseline
PASS  G14 (sabotage) — the correct order is NOT revealed — tiles stay in the child's order, no green
```
Both misplaced tiles (slots 2 & 3) render identically to a correctly-placed tile
— there is no per-tile marking. The sabotage holds pre-fix: no green, and the
tiles stay in the child's submitted order (nothing reveals the key).

### G15 — regression → **PASS** (as predicted)
```
PASS  G15 — comma grouping (#84) — check returned true
PASS  G15 — Indian lakh grouping (#84) — check returned true
PASS  G15 — misplaced comma stays wrong (sabotage) — check returned false
PASS  G15 — addition commutativity (#109) — check returned true
PASS  G15 — the answer box is not clipped (#85) — scrollWidth <= clientWidth
PASS  G15 — the box is empty on Try again (#88) — value cleared
```
All four RETRY-STATE-2 fixes hold. This is the guard that must never turn red;
Phase 2 will lean on it while restructuring the painter's normalisation.

---

## What each guard drives (so Phase 2 knows the target)

- **G10** — real fill-blank / expression cards, real keystrokes through the real
  engine + painter. Asserts on `.qbody.is-checked` (graded) and `.incorrect`
  (painted). Fixtures modelled on real evidence (42613 = #88; `31 + 16 = 47` =
  q2zyrs8kf). Sabotage uses a synthetic subtraction expression (Phase 0 proved
  the corpus has none) — NOT added to `lessons/`.
- **G11** — real multi-select. Compares a **resting** computed-style signature
  (border, background, box-shadow, check-ind fill/border) of the correct pick vs a
  never-chosen option; asserts `.cc-x` on the wrong pick.
- **G12** — opens a hint, makes a wrong pick, clicks the real **Try again**
  button, then asserts each rule-2 clause separately, including hint survival and
  no node removal.
- **G13** — asserts `.explain` is not visible in the correct-answer state, and
  that the first-wrong state shows a red mark with no reveal.
- **G14** — taps rule 14's worked example into slots (tap-to-place through the
  real `enableTileDrag`), then compares per-tile resting signatures and checks the
  key is not revealed.
- **G15** — node-level grading (comma/Indian/commutativity/sabotage) + one
  browser pass for box-width and typed-clearing.

---

## STOP GATE 2 — summary

- G10–G15 written into `tools/verify-retry-state.js`; G1–G5 untouched and still green.
- **Prediction matched actual on all six.** 8 assertions fail (G10a/b/c, G11,
  G12×2, G13a, G14) — every one a genuine defect the fix must close. G15 passes.
- One guard-quality bug found and fixed **before trusting the guard**: G11/G14's
  transition-timing false signal, now settled to resting-state comparison. This is
  the STANDING-RULE-1 discipline — a guard not observed failing for the right
  reason is not a guard.
- Zero production changes; nothing under `engine/` or `lessons/` touched.

Awaiting instruction to proceed to Phase 2 (the fixes).
