# BRIEF-MOBILE-1A — WHICH STYLESHEET WINS

**Chat-authored. Read-only. No edits, no commits, no pushes.**
**Engine: rao-master-22. Corpus: 3,015 questions / 118 lessons, Grade 4 only.**
**`lessons-g3/` is out of scope and must not be touched or counted.**

---

## 0. WHY THIS BRIEF EXISTS

Chat measured the project mount and found two complete, diverging copies of the
lesson stylesheet:

- **`rao.css`** — carries **9 `@container lesson (...)` blocks** at 600 / 520 /
  480 / 460 / 420 / 380 / 360 / 330px, plus a `container-type:inline-size` /
  `container-name:lesson` declaration on `.rao-lesson` (rao.css:827-828).
  Covers `.venn-box` (4 breakpoints), `.vcol`, `.vmul-grid`, `.lp-col`,
  `.bg-bar`, `.bins`, `.time-row`, `.vs-text`, `.opts`, SVG figures.
  Carries an authored comment block explaining that container queries replaced
  media queries because a lesson in a narrow panel on a wide desktop was
  getting desktop styling.

- **`preview-engine.js`'s `MARKUP_STYLE_CSS`** (declared at line 2765, consumed
  at line 2788 via `MODS.css.makeCssExtractor`) — a full stylesheet baked into
  the engine as a single packed string. It contains **zero `@container`
  blocks**. It has only the older `@media` rules: 12× `max-width:600px`,
  3× `max-width:480px`, 1× `max-width:380px`.

**These two files disagree about how a lesson looks on a phone.**

HANDOFF-31 §7 states there is *no* mobile breakpoint for column arithmetic and
treats mobile as unreviewed. That is **false for `rao.css`** — `.vcol` and
`.vmul-grid` are covered at 480px with an authored RENDER-1 C4 comment about a
44px tap floor. It appears **true for the engine's copy**. The handoff was
measuring one file and generalising to both.

**The consequence, and the reason this brief comes before any mobile fix
work:** if the review pages Venkat has been reviewing load a different
stylesheet than the live app serves, then every layout judgement made in review
describes a rendering no child ever sees. Fixing mobile before settling this
risks putting fixes into the file the phone does not read.

**This brief does not fix anything. It answers which file wins, where, and how
far apart they are.** Venkat rules on the strategy after reading the report.

---

## 1. STANDING LAWS THAT APPLY

- **Read-only.** No file in the repo is modified, staged, committed, or pushed.
  If any phase seems to require an edit, that phase **stops and reports**.
- **Measure, don't assume — including this brief's own premises.** Chat measured
  the *project mount*, which is a manual copy. If the repo files differ from
  what §0 describes, **report the difference and continue measuring the repo**.
  The repo is truth; §0 is chat's belief.
- **Anti-laundering.** Unknowns are reported as unknowns. Where a number was not
  measured, write **UNMEASURED**. Never infer a count from a sample.
- **Never pipe a run in a way that masks output or exit code.**
- **A class defined by a rule must name its members.** Any "N selectors differ"
  claim must be accompanied by the actual list, or a stated cap with the
  criterion used to truncate.
- **Claude Code never pushes, never self-commissions, never writes handoffs.**
- **No scope expansion.** If something interesting is found outside these five
  phases, name it in §7 and do not act on it.

---

## 2. PHASE 1 — INVENTORY THE STYLESHEETS IN THE REPO

Establish what exists on disk, independent of the project mount.

1. `ls -la` every CSS file and every file that could contain a stylesheet
   relevant to lesson rendering. At minimum locate: `rao.css`, `rao-card.css`,
   `fonts.css`, `robo.css`, `preview-engine.js`. Report path, byte size, mtime.
2. For **each** stylesheet source, report:
   - count of `@media` blocks, with the breakpoint values
   - count of `@container` blocks, with the breakpoint values
   - presence or absence of `container-type` / `container-name`
3. Confirm the engine's baked stylesheet: report the identifier name, the line
   it is declared on, the line(s) where it is consumed, and its length in
   characters.
4. State whether the repo copies match the §0 description. **Any mismatch is a
   finding, not an error** — report it and carry on.

**Report:** a table of stylesheet sources with breakpoint counts.

---

## 3. PHASE 2 — WHICH STYLESHEET DOES EACH SURFACE LOAD

This is the core question. There are three surfaces and they may not agree.

**Surface A — the live app.** Find the HTML entry point(s) the deployed app
serves. Report every stylesheet it links (`<link rel=stylesheet>`) and every
script that injects CSS at runtime. If the app injects the engine's baked CSS,
say so explicitly. **If the entry point cannot be identified with certainty,
say UNMEASURED and report what was searched** — do not guess.

**Surface B — a review page.** Take `review/subtract_numbers_up_to_five_digits.html`.
Report every stylesheet it links and every inlined `<style>` block, in document
order. State plainly: does this page get `rao.css`, the engine's baked CSS, or
both? **If both, which one wins** for a contested selector — determined by
source order and specificity, not by assumption.

**Surface C — the preview/authoring output**, if it differs from B.

Then answer directly:

> **Do the review pages render with the same CSS the live app serves?
> YES / NO / UNMEASURED.**

This single line is the most important output of the brief.

---

## 4. PHASE 3 — MEASURE THE DIVERGENCE

For the selectors that matter to mobile layout, quantify how far apart the two
stylesheets actually are.

**Selector set** (this is the list; do not expand it):
`.vcol`, `.vmul-grid`, `.vm-cell`, `.cmath`, `.cmath-wrap`, `.venn-box`,
`.vs-text`, `.vs-out`, `.bins`, `.bin`, `.lp-col`, `.lp-cols`, `.bg-bar`,
`.bg-plot`, `.bg-clusters`, `.opts`, `.opt`, `.prompt`, `.tile`, `.order-slot`,
`.order-slots`, `.order-bank`, `.dt-table`, `.seq`, `.rsf-grid`, `.time-row`,
`.hchart`, `.hcell`, `.cal`, `.sb-slot`, `.sb-tile`, `.blank-input`.

For each, report in one row:

| selector | in rao.css? | in engine CSS? | responsive rules in rao.css | responsive rules in engine CSS | verdict |
|---|---|---|---|---|---|

Verdict is one of: **AGREE** (both carry equivalent responsive treatment),
**RAO-ONLY** (rao.css adapts, engine does not), **ENGINE-ONLY**,
**CONFLICT** (both adapt, to different values), **NEITHER**.

**The number that matters:** how many of the 32 selectors are **RAO-ONLY** or
**CONFLICT**. That is the size of the divergence.

Do not attempt to judge which value is *correct*. Report the disagreement only.

---

## 5. PHASE 4 — DOES THE CONTAINER-QUERY MECHANISM ACTUALLY FIRE

`@container` rules only work if the questions render inside an element carrying
`container-type: inline-size`. `rao.css` puts that on `.rao-lesson`.

1. Grep the repo for `rao-lesson` as a class applied in markup or set by JS.
   Report where the class is applied: the app shell, review pages, both, or
   neither.
2. For `review/subtract_numbers_up_to_five_digits.html` specifically: is the
   question content inside an element with class `rao-lesson`? Report the
   containment chain from the question element upward.
3. Report the browser support gate stated in rao.css's own comment (Chrome 105+
   / Safari 16+ / Firefox 110+) — **do not evaluate whether that is acceptable**,
   that is Venkat's ruling. Just confirm the comment's claim matches the code.

**If `.rao-lesson` is absent from the surface that loads `rao.css`, every one of
its 9 container queries is dead code and the divergence in Phase 3 is larger in
practice than on paper.** Report this conclusion explicitly if it holds.

---

## 6. PHASE 5 — ONE RENDERED SANITY CHECK

A single measured render, to confirm the paper analysis against reality.

Using Playwright with **real CDP touch events** (never mouse simulation, per the
standing law):

1. Load `review/subtract_numbers_up_to_five_digits.html` at viewport
   **390 × 844** (iPhone-class).
2. On the first column-arithmetic question, report via `getComputedStyle`
   (**never by reading markup** — `rao.css` and `MARKUP_STYLE_CSS` both contain
   packed one-line blocks):
   - `.cmath` computed `table-layout` and rendered width
   - one `.cm-col-d` computed width
   - one `.blank-input.cm-cell` computed width and height
   - `.cmath-wrap` `scrollWidth` vs `clientWidth`
3. **State whether the content requires horizontal scrolling at 390px.**
   `scrollWidth > clientWidth` is the test. Report both numbers.
4. Repeat at **360 × 780**.
5. Report whether any element's painted box extends beyond the viewport width.

**Halt condition:** if the page fails to load or the selectors are absent,
**stop, report what was seen, and do not substitute a different lesson.**

---

## 7. WHAT TO REPORT

A single report, in this order:

1. **The one-line answer** to Phase 2: do review pages and the live app render
   with the same CSS? YES / NO / UNMEASURED.
2. Phase 1 stylesheet inventory table.
3. Phase 2 per-surface loading detail.
4. Phase 3 divergence table, with the RAO-ONLY + CONFLICT count stated as a
   number out of 32.
5. Phase 4 container-mechanism finding, including the dead-code conclusion if it
   applies.
6. Phase 5 measured numbers at 390px and 360px, with the scroll verdict.
7. **Anything noticed but not acted on**, named and left alone.
8. **Explicit confirmation that nothing was modified, staged, committed, or
   pushed**, plus `git status --short` output to prove it.

Where a phase could not be completed, say so and say why. **A correct stop is a
success.** Do not fill a gap with an inference.

---

## 8. WHAT THIS BRIEF DOES NOT DO

- It does not fix any layout.
- It does not merge, delete, or reconcile the two stylesheets.
- It does not decide which stylesheet should win — **that is Venkat's ruling**,
  made after reading this report.
- It does not touch `lessons-g3/`.
- It does not regenerate review pages.
- It does not run the full test suite.
