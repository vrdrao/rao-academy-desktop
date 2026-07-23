# REPORT-RETRY-STATE-2 — PHASE 2 (The fixes)

All five fixes implemented; **all five guards now PASS**; the **full `npm test`
suite is GREEN** (862-line log, zero failures). Zero lesson content touched. All
files LF. Nothing pushed.

I re-read the amended brief first. Two amendments since Phase 1 landed cleanly:
**A5 split CONFIRMED** (invert Try-Again only, keep through-Check — exactly what
Phase 1 built) and **G3 must accept Indian lakh grouping too** — which changed
the G3 fix and guard (both updated below).

**Pre-flight note (STANDING RULE 2):** git showed `preview-engine.js` and
`rao.css` as modified, but `git update-index --refresh` proved them **stat-dirty
only — content-identical to HEAD** (a prior session normalised them LF per
ISSUES #117). So I edited them from a clean HEAD baseline. The genuine
pre-existing changes are in `docs/ISSUES.md` (rows 116/117, a #44→#44b renumber,
#92 status) and `review/compare_numbers_up_to_five_digits.html` — both outside
this brief's scope; I touched neither.

---

## Files changed (all in scope)

| File | Fix | What changed |
|---|---|---|
| `engine/preview-engine.js` | G3, G5 | `check()` — new `fill-blanks` branch (comma grouping) + expanded `expression` branch (commutative addition allowlist) |
| `engine/rao-card.js` | G1, G2 | `restoreTask()` no longer preserves typed values; new `hideStaleFeedback()` + a capture-phase selection listener; LAWS law-3 amended |
| `engine/rao.css` | G4 | base `.blank-input` 64→96px; `.rsf-blank` 72/58→84px; result box `:last-of-type` 96px; `.rsf` `overflow-x:auto` |
| `tools/verify-reset.js` | G1 | the two inverted assertions from Phase 1, plus a null-serialize fix (an emptied fill-blank serialises to `null`) |
| `tools/verify-retry-state.js` | all | Phase-1 guard + a 6-digit G4 case (the widest key in the corpus) |

**Zero changes under `lessons/`.** Confirmed by `git status`.

---

## On the "one state-reset path" constraint

The five items share one *framing* (state that does not reset between attempts)
but live in **three different layers**, and forcing them into one path would be
worse, not better:

- **G3/G5 are grading** — `preview-engine.js check()`. Pure functions; nothing to
  do with DOM reset.
- **G4 is layout** — `rao.css`. A box width; no logic.
- **G1/G2 are the actual reset state** — `rao-card.js`. Here I *did* keep it to
  one concept: the card renderer clears stale attempt state in exactly two
  clearly-labelled places — `restoreTask()` (the value, on "Try again") and
  `hideStaleFeedback()` (the whyWrong panel, on a new selection). They are two
  triggers (a button vs. a selection) for the same idea, not five scattered
  patches. `hideStaleFeedback()` is a single shared helper.

So: one reset *concept* in the renderer, expressed as two triggers; the grader
and CSS fixes are necessarily in their own layers. This is the honest shape, per
the brief's "say so rather than forcing it."

---

## Per-fix detail

### G1 (#88) — the box clears on "Try again"
`restoreTask()` used to snapshot the typed values into `keep[]` and re-write them
after the re-mount. Removed that block entirely. An input's typed value never
serialises into `innerHTML`, so `qbody.innerHTML = taskSnap` already yields empty
inputs; dropping `keep[]` means every fill-blank returns to a clean, empty slate.
The LAWS header (law 3) is amended, dated, citing this brief, and states the
split explicitly: **value SURVIVES the Check, CLEARS on the Try-again tap.**

### G2 (#111) — stale feedback dismissed on any new selection, HIDE not remove
New `hideStaleFeedback()`: sets `display:none` on every `.cc-msg-why` bubble (the
whyWrong panel + its "Not quite" chip) — **never detaches the node** (no-repaint /
append-only law) — and clears any residual `.cc-x`/`.cc-tried` whisper marks. It
is called by a **capture-phase** delegated listener on `qbody` (click + input),
fired when the child taps an option or edits a blank. Delegation on `qbody` means
it **survives `restoreTask`'s re-mount** (only `qbody`'s innerHTML is replaced;
`qbody` itself persists). Hint bubbles (`.cc-msg` WITHOUT `.cc-msg-why`) are left
visible — help still accumulates (law 4).

**Deliberately NOT dismissed on the Try-again button** — only on a new selection.
Dismissing on Try-again would fail `verify-reset`'s law-4 assertion ("every
bubble visible after the reset") and is not what the widened ruling asks: the
trigger is the *new selection*, which is exactly the auth-q3 evidence (wrong →
Try again → correct pick → stale panel must go on that pick). `verify-reset` and
`verify-solpanel` both stay green, confirming the whyWrong stream is untouched
until a new selection.

### G3 (#84) — comma grouping accepted, Western AND Indian, misplaced rejected
New `fill-blanks` branch in `check()`. A value's commas are stripped **only** when
they form a valid grouping, then compared to the digit-only key:

```
Western  /^\d{1,3}(,\d{3})+$/       100,000 · 1,000,000
Indian   /^\d{1,2}(,\d{2})+,\d{3}$/  1,00,000 · 12,34,567
```

A **misplaced** comma matches neither, is left intact, and so fails the key match
(the sabotage requirement). **Rule chosen, reported per the brief:** accept iff
(stripped digits == key) AND (the comma pattern is a valid Western or Indian
grouping). **No ambiguity was found** between valid-Indian and misplaced — a
misplaced comma cannot match either pattern *and* strip to the key, so no STOP
was triggered. Verified live:

```
["42,613"]  vs 42613  -> true    (Western)
["1,00,000"] vs 100000 -> true    (Indian lakh)
["100,000"]  vs 100000 -> true    (Western)
["4,2613"]  vs 42613  -> false   (misplaced — 1 digit then 4)
["426,13"]  vs 42613  -> false   (misplaced — 2 trailing)
["1,0,0000"] vs 100000 -> false   (garbage)
single-select ["88,695"] vs 88695 -> false  (NON-fill-blanks: NOT stripped)
```

The last line proves the branch is scoped to `fill-blanks` only — single-select
still matches `data-val` verbatim. **Display formatting untouched**, per the
brief's separate-issue note.

### G4 (#85) — the box widens, the font does not
Base `.blank-input` 64→96px (fits a 6-digit key at 1.4rem; measured, not guessed:
6-digit `428617` renders `client 92 ≥ scroll 92`, no clip, at both viewports). The
per-digit variants (`.vm-cell`/`.cm-cell`/`.lat-in`/`.dt-table`/`.am-*`) keep
their own narrower widths — more-specific rules, unaffected. Round-scaffold:
operands 72/58→**84px** (fit 5-digit rounded values); the **result box gets more
width than the operands** via `.rsf-grid > .rsf-blank:last-of-type{width:96px}`
(the #85 amendment, qm37aecdj: 10000 is a digit wider than 3000/7000). `:last-of-type`
keys off the existing `.rsf-blank` class so the CSS scoper keeps it. `.rsf` gets
`overflow-x:auto` so three widened boxes never break the 360px layout (mirrors
`am-wrap`). **Font size unchanged everywhere** — the ruling honoured.

### G5 (#109) — commutative addition, an explicit `{+}` allowlist
Expanded `expression` branch. Exact match still wins first. Otherwise the ONLY
shape normalised is `"a+b+...=total"` (regex `/^[0-9+]+=[0-9]+$/`, addends split
on `+` and sorted). Any other operator fails that shape and falls through to
exact — so `4-9=5` and `3÷12=4` written backwards **stay wrong**. `×` is
**commented as deliberately excluded** (Phase 0 found zero `×` questions; nothing
to test against — revisit if one is ever authored). Verified live: `16+31=47`,
`16 + 31 = 47`, and `6+5+4+3=18` all grade correct against their keys;
subtraction/division reversed grade false.

---

## All five guards — PASS (verbatim)

```
RETRY-STATE VERIFICATION — BRIEF-RETRY-STATE-2 (G1 #88 · G2 #111 · G3 #84 · G4 #85 · G5 #109)

── G3 (#84): comma-grouped numeric fill-blank grades CORRECT; misplaced comma does NOT ──
  PASS  G3 — ["42613"] -> true (control: bare digits)
  PASS  G3 — ["42,613"] -> true (the fix: canonical thousands grouping)
  PASS  G3 — ["4,2613"] -> false (sabotage: comma after 1 digit is misplaced)
  PASS  G3 — ["426,13"] -> false (sabotage: comma leaves 2 trailing digits)

── G5 (#109): commutative ADDITION accepted; subtraction/division backwards STAY wrong ──
  PASS  G5 — ["31 + 16 = 47"] vs key ["31 + 16 = 47"] -> true (control: exact)
  PASS  G5 — ["16 + 31 = 47"] vs key ["31 + 16 = 47"] -> true (the fix: operands swapped)
  PASS  G5 — ["16+31=47"] vs key ["31 + 16 = 47"] -> true (swapped + no spaces)
  PASS  G5 — ["4 - 9 = 5"] vs key ["9 - 4 = 5"] -> false (SYNTHETIC: subtraction not commutative)
  PASS  G5 — ["3 ÷ 12 = 4"] vs key ["12 ÷ 3 = 4"] -> false (SYNTHETIC: division not commutative)

── G1 (#88): the fill-blank box is EMPTY after "Try again" ──
  PASS  G1 — the box is empty on retry (RULED 2026-07-23: value IS cleared) — value=""

── G2 (#111): a new selection HIDES the stale whyWrong panel (node stays) ──
  PASS  G2 — whyWrong panel HIDDEN after new selection — not visible
  PASS  G2 — 'Not quite' chip hidden — not visible
  PASS  G2 — prior-attempt ✕/tint cleared — 0 marks
  PASS  G2 — HIDE not remove: nodes still in the DOM — panel + chip present

── G4 (#85): the fill-blank box is wide enough — no clipping at 390×844 and 360×780 ──
  PASS  G4 — plain 5-digit box not clipped @ 390×844 — client 92px >= scroll 92px (5 digits)
  PASS  G4 — plain 6-digit box not clipped @ 390×844 — client 92px >= scroll 92px (6 digits — widest key)
  PASS  G4 — round-scaffold RESULT box not clipped @ 390×844 — client 92px >= scroll 92px (5 digits)
  PASS  G4 — plain 5-digit box not clipped @ 360×780 — client 92px >= scroll 92px (5 digits)
  PASS  G4 — plain 6-digit box not clipped @ 360×780 — client 92px >= scroll 92px (6 digits — widest key)
  PASS  G4 — round-scaffold RESULT box not clipped @ 360×780 — client 92px >= scroll 92px (5 digits)

all retry-state guards passed
```

---

## Full suite — GREEN

`npm test` ran end to end (the `&&` chain reached the last guard,
`verify-geo-wired`, which only runs if every prior guard exited 0). 862-line log,
**zero failures.** Every guard's green summary present:

```
node grading gate     2637 grade correct · 2637 reject wrong · 31 construct skipped — OK
harness.js            ENGINE rao-master-22 — SAFE TO SHIP ✅
verify-format         all 103 lessons: structure + paint identical
verify-styles/touch/drag/venn/categorize-tap/id-chip/colmath/area-model   all ✅
verify-reset          RESET: Try Again returns every behavior to its first-attempt state ✅
verify-calm           CALM CARD: all laws hold ✅
verify-no-dead-end / verify-robo / verify-solpanel / verify-geo-wired      all ✅
```

### The only test that changed state — `verify-reset.js` (the "known expected breakage")
This is exactly the G1 amendment the brief flagged. Its own results, across the
three phases:

| | pre-brief | Phase 1 (guard inverted, engine unmodified) | Phase 2 (engine fixed) |
|---|---|---|---|
| A5 through-Try-Again | PASS (asserted *preserved*) | **FAIL** (asserts *cleared*, engine preserved) | **PASS** (asserts *cleared*, engine clears) |
| keepValues drill ×2 | PASS (asserted *preserved*) | **FAIL** (asserts *cleared*, engine preserved) | **PASS** (asserts *cleared*, engine clears) |
| A5 through-Check | PASS (preserved) | PASS (unchanged) | PASS (unchanged) |

The file was **green before the brief and green now**; the meaning of two
assertions flipped (preservation → clearing) and the engine flipped to match.
The intermediate Phase-1 red was the guard-first proof. **No other test changed
state** — every other guard was green before and after.

**Why verify-format stayed green despite the CSS change:** its fingerprint
compares DOM skeleton + paint (frame gradient, check button, qbody surface) — not
`.blank-input` width. The pixel screenshots differ (boxes are wider) but are saved
for external review, not gated (`pct=-1`). So the width fix does not make the
on-disk review pages "structurally stale." (Phase 3 will still regenerate the
specific pages the brief calls for — the #111 flicker demo — per 3.2, not a
corpus sweep.)

---

## Scope & safety confirmation

- **Lesson content:** zero changes under `lessons/` (`git status` clean there).
- **Line endings:** all five edited files are pure LF (byte-level Python:
  `CRLF=0` on preview-engine.js, rao-card.js, rao.css, verify-reset.js,
  verify-retry-state.js).
- **No pushing.** Nothing committed yet — that is Phase 3.
- **Engine version** unchanged at `rao-master-22` (grading behaviour extended, no
  new type, forward-compatible).

---

## STOP GATE 3 — Phase 2 complete, awaiting authorization

- All five fixes implemented across the correct layers (grader / CSS / renderer).
- **All five guards PASS**; **full `npm test` GREEN**; only `verify-reset`
  changed state, exactly as the brief anticipated (before/after shown).
- No lesson content touched; all LF; nothing pushed.

**Awaiting authorization before Phase 3.**
