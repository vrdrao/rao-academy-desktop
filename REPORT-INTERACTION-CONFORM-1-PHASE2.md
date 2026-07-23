# REPORT-INTERACTION-CONFORM-1 — Phase 2 (The fixes)

Run 2026-07-23. Engine-only changes + the ruled guard amendments. Rule 14 covers
`order` and `sequence-build`. **G10–G15 all PASS. Full `npm test` is green (exit 0,
"all green").**

Files changed this phase:

| File | What |
|---|---|
| `engine/rao-card.js` | item 1 (painter consults grader) · item 2 (`cc-kept`) · item 3 (Try-again hides whyWrong) · item 5 (`markMisplaced`) |
| `engine/rao.css` | item 4 (3 reveal rules removed) · item 5 (`.tile-wrong` CSS) |
| `engine/rao-card.css` | item 2 (`.cc-kept` CSS) |
| `tools/verify-reset.js` | law-4 amendment (ruled) |
| `tools/verify-calm.js` | test g amendment (rule 13) |
| `tools/verify-styles.js` | BUG-4 inverted (rule 13) |
| `tools/verify-retry-state.js` | G10–G15 (from Phase 1, unchanged this phase) |

`review/compare_numbers_up_to_five_digits.html` in the tree is a **pre-existing**
uncommitted change, not mine (present in the session's opening git snapshot).

---

## The five fixes

### Item 1 — the red box (painter agrees with the grader, no duplicated logic)

`markFeedback()` no longer keeps its own normalisation. For `fill-blanks` and
`expression` it now consults the grader itself, per field:

```js
var grade1 = function (b, uv, av) {
  try {
    if (window.RaoPreview && typeof window.RaoPreview.check === "function")
      return !!window.RaoPreview.check(b, [uv], [av]);
  } catch (e) { /* fall through to exact match */ }
  return String(uv) === String(av);
};
```

`check("fill-blanks", ["42,613"], ["42613"])` and
`check("expression", ["16+31=47"], ["31 + 16 = 47"])` are the SAME calls the Check
handler already makes — so the painter can never drift from the grader (the brief's
explicit requirement: "do NOT duplicate the grader's normalisation logic — both
must consult one shared source of truth"). No restructuring was needed; the grader
is already a per-field-callable pure function. This is not a firewall violation:
`markFeedback` is part of the grading-feedback path (it runs right after `check()`
in the Check handler), not the solution renderer — the §13.1 firewall governs the
solution/walkthrough renderer, which is untouched. `lattice` keeps raw equality
(single-digit cells, no normalisation possible or needed).

### Item 2 — multi-select tick (a correct pick stays visibly chosen)

`markWrongSelections()` now adds a neutral `.cc-kept` class to a correctly-picked
option instead of leaving it bare:

```js
if (ans.indexOf(val) !== -1) { el.classList.add("cc-kept"); continue; }
```

`.cc-kept` (in `rao-card.css`) is a quiet **brand-tinted** edge — deliberately NOT
the green `.is-correct` look (rule 6 forbids revealing correctness while an attempt
remains) and NOT the resting look (rule 12: the child must see what they picked).
No ✕, no tick. It clears on Try again (`restoreTask` rebuilds the qbody) and on a
new selection (added to `hideStaleFeedback`).

### Item 3 — Try again is a fresh start (whyWrong goes, hint stays)

`resumeAnswering()` now calls `hideStaleFeedback()` — the EXISTING
dismiss-on-new-selection helper (#111), reused not replaced. It hides the
`.cc-msg-why` panel + its "Not quite" chip (display:none, node retained — HIDE not
remove) and clears residual ✕/kept marks. Hint bubbles are `.cc-msg` **without**
`.cc-msg-why`, so they are untouched and stay visible (rule 4 narrowed: hints
persist, answer-specific feedback does not).

### Item 4 — remove the explain line

The three CSS **reveal** rules were removed from `rao.css`:
- adaptive `[data-mode="adaptive"].is-checked .explain{display:block}` (was line 654)
- quiz-review `[data-mode="quiz"].is-review .explain{display:block}` (was line 666)
- rapid `[data-mode="rapid"].is-checked .explain{display:block}` (was line 1061)

With every reveal gone, `.explain{display:none}` (base) holds in every state — the
line never paints. The `<p class="explain">` element is **retained** as an inert
hidden carrier the walkthrough can still read as a fallback (removing the emission
would have broken `verify-calm` test g, which matches `<p class="explain">` in
markup, and risked `verify-structural`'s DROPPED_PROSE). `explain` is **not**
stripped from any lesson (out of scope, as instructed).

**§13.8 conflict, flagged:** `CLAUDE.md` §13.8 says Rapid Fire shows the one-line
explain. Rule 13 (STUDENT-INTERACTION-RULES.md, the authority, 2026-07-23) rules it
"removed from the product" — mode-wide. The authority wins; I removed the Rapid
reveal too and noted the supersession in the CSS comment. This is the brief and the
authority AGREEING; §13.8 is the older, now-stale doc.

**Orphaned-field count (for a later content brief):** **2,454** questions across
**99** files carry a non-empty `explain` (verify-calm's own scan agrees: 51
frontmatter-only + 2,003 markup-only + 400 both-form = 2,454). These are now
orphaned from any visible output. A later content brief strips them — NOT this one.

### Item 5 — ordering marks the misplaced tiles

A shared `markMisplaced()` helper marks only the out-of-place tiles on a wrong
`order` / `sequence-build` answer:

```js
function markMisplaced(qbody, slotSel, tileSel, ans) {
  var slots = qbody.querySelectorAll(slotSel);
  for (var i = 0; i < slots.length; i++) {
    var t = slots[i].querySelector(tileSel);
    if (t && String(t.dataset.val) !== ans[i]) t.classList.add("tile-wrong");
  }
}
```

Display-only: it compares each slot's placed tile value to the key at that
position. `.tile-wrong` (in `rao.css`) is a soft red edge. Nothing moves, nothing
greens — the correct order is NOT revealed (rule 6). `tile-wrong` was added to
`FB_STATES`/`clearFeedback` so a re-check re-marks cleanly. Covers both `order`
(`.order-slot`/`.tile`) and `sequence-build` (`.sb-slot`/`.sb-tile`), per Venkat's
ruling that rule 14 spans both.

---

## G10–G15 — all PASS (was 8 failing in Phase 1)

```
G10a comma 42,613          PASS   graded correct, box unpainted
G10b Indian 1,00,000       PASS   graded correct, box unpainted
G10c commutative 16+31=47  PASS   graded correct, box unpainted
G10d subtraction 4-9=5     PASS   graded WRONG and painted wrong (sabotage)
G11 correct pick distinct  PASS   + wrong pick keeps its ✕
G12 whyWrong hidden/chip   PASS   + selection/marks cleared, nodes present, HINT survives
G13a explain gone (correct)PASS   G13b red mark + no reveal PASS
G14 misplaced marked       PASS   correct tiles clean + order not revealed (sabotage)
G15 regression             PASS   comma/Indian/commutativity/box-width/typed-clear
```

---

## Every test that changed state, and why

**1. `verify-retry-state.js` (G10–G15): 8 assertions FAIL → PASS.** The five Phase-2
fixes closed exactly the defects the Phase-1 guards were written against. G15 stayed
green throughout (regression bundle).

**2. `verify-reset.js` — law-4 assertions AMENDED (ruled).** The old assertions
required *every* `.cc-msg` bubble to survive a reset **visible**. My item-3 fix hides
whyWrong bubbles on Try again, so the old assertion would have gone red. Per the
brief's ruling I split the invariant three ways — **not** weakened to "some survive":
- NO-REPAINT: every bubble NODE survives (present).
- HINTS: every hint bubble stays VISIBLE.
- whyWrong: every `.cc-msg-why` is present but HIDDEN.

Proved to bite: with the fix reverted, "law 4 (narrowed): whyWrong hidden on Try
again" FAILS ("still visible"); restored → green. The construct fixture exercises a
surviving-visible HINT; the progress drill exercises a hidden whyWrong.

**3. `verify-calm.js` — test g EXPLAIN REVEAL AMENDED (rule 13).** Old assertion:
a legacy (no-solution) explain reveals on a correct answer (`wantAfter="block"`).
Rule 13 removes the reveal, so this would have gone red. Amended to `wantAfter="none"`
— the explain stays hidden in every state, both authoring forms. Parity + precedence
assertions are unchanged (the element is still emitted).

**4. `verify-styles.js` — BUG-4 INVERTED (rule 13).** Old BUG-4 asserted the
explanation *reveals* after Check (its original purpose was catching
"emitted-but-permanently-invisible"). Rule 13 flips the failure mode: the explanation
must now stay hidden after Check. Relabelled "explanation stays hidden (rule 13)".

No other test changed behaviour. `harness.js` (103 lessons, render/grade/reject/all
8 themes), `verify-format`, `verify-firewall`, `verify-solpanel`, `verify-drag`,
`verify-touch`, `verify-no-dead-end`, `verify-grading-node`, etc. all stayed green —
the fixes touch feedback painting and reset timing, not the initial render, grading,
or the firewall.

---

## Pre-existing issue found (NOT caused by this brief, NOT fixed here)

`tools/verify-snapshot.js` reports **59 legacy-explain snapshots changed** — and it
does so on a **clean HEAD `1d50f07`** too (verified by stashing all my changes and
re-running). It is **not** in the `npm test` chain, so it has drifted unnoticed. My
changes did not touch `solution-renderer.js` (what it snapshots) and did not cause
it. Flagging for a future brief; out of scope here.

---

## STOP GATE 3 — summary

- All five fixes applied, engine-only. G10–G15 PASS. **`npm test` exit 0, "all green".**
- Three guards amended to the new rulings (reset law-4, calm test g, styles BUG-4);
  the reset amendment proved to bite. None weakened to pass.
- Item 4's orphaned-`explain` count: **2,454** across **99** files (for a later
  content brief). §13.8 supersession noted.
- Pre-existing `verify-snapshot` failure (59) flagged, not mine, not in `npm test`.

Awaiting instruction to proceed to Phase 3 (review artifact + commit).
