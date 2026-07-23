# REPORT-MEASURE-PANELS-2

Re-measurement of the solution panel for `docs/ISSUES.md` item 81, produced by
**BRIEF-MEASURE-PANELS-2**. Read-only. One file written (this one). No lesson,
engine or CSS file was touched. No commit, no push.

Every number below is a **real rendered measurement** (Playwright 1.56.1 headless
Chromium, real engine, real fonts asserted active). Nothing here proposes a fix.

---

## 0. The headline, before any table

**The panel BRIEF-MEASURE-PANELS-2 asked me to re-measure is byte-for-byte the
same panel REPORT-1 measured.** The brief's premise — *"BRIEF-G3-ENGINE-1 changed
the solution panel AFTER [REPORT-1] was taken … the panel that was measured is not
the panel that exists"* — is **not supported by the file record.** The timeline
(git-verified):

| Event | Time |
|---|---|
| `solution-renderer.js`, `rao-card.css`, `rao-card.js` last modified | **2026-07-21 21:16** |
| BRIEF-MEASURE-PANELS-1 written | 2026-07-22 09:37 |
| **REPORT-MEASURE-PANELS-1 written (the measurement)** | **2026-07-22 09:54** |
| commit `6723912` (BRIEF-G3-ENGINE-1) | 2026-07-22 12:12 |

The three solution files were edited the **evening before** REPORT-1, and have not
been touched since (`git status` shows them clean = identical to committed HEAD).
Commit `6723912` at 12:12 *committed* those already-present working-tree bytes; it
did **not** alter them after REPORT-1. And REPORT-1 itself already names the
Change-5 classes it supposedly predates (`.sol-tables-2`, `.sol-eq`, `.sol-note`,
`.sol-foot`) and lists *"table, facts, rule"* among the eight block types. REPORT-1
measured the post-BRIEF-G3-ENGINE-1 panel. So did I.

I re-measured anyway, exactly as instructed, and the re-measurement **confirms it
independently**: panel heights reproduce to the pixel for all 7 shapes × 3 widths,
and panel widths reproduce exactly (294 / 642 / 758). The residual numeric
differences vs REPORT-1 are all traceable to **my measurement harness differing
from REPORT-1's (whose script was not saved)** — not to any change in the panel.
Two are worth chat's attention and are called out below (§4, §5, §8).

---

## 1. The delta table — READ THIS FIRST (step 4)

`panelH` = rendered height of the `renderSolution` panel. `availW` = `.pv-card`
content-box width = panel width. `widest` = widest leaf's content width (px).
`fill%` = widest / availW. `cardH`/`over` = full-card height and card-level
overflow past the viewport (see the **chrome caveat** below the table).

**R1** = REPORT-1's value · **new** = this pass · Δ = new − R1.

| shape · w | panelH R1→new | availW R1→new | widest R1→new | fill% R1→new | cardH R1→new | over R1→new |
|---|---|---|---|---|---|---|
| table-1 · 380 | 266 → **266** ✓ | 294 → **294** ✓ | 66 → 65 | 22.4 → 22.3 | 860 → 808 | 95 → 43 |
| table-1 · 768 | 266 → **266** ✓ | 642 → **642** ✓ | 66 → 65 | 10.3 → 10.2 | 658 → 610 | 0 → 0 ✓ |
| table-1 · 1280 | 266 → **266** ✓ | 758 → **758** ✓ | 66 → 65 | 8.7 → 8.6 | 658 → 610 | 0 → 0 ✓ |
| table-2 · 380 | 292 → **292** ✓ | 294 → **294** ✓ | 378 → **378** ✓ | 128.6 → 128.5 | 826 → 750 | 61 → 0 |
| table-2 · 768 | 267 → **267** ✓ | 642 → **642** ✓ | 378 → **378** ✓ | 58.9 → **58.9** ✓ | 725 → 677 | 0 → 0 ✓ |
| table-2 · 1280 | 267 → **267** ✓ | 758 → **758** ✓ | 378 → **378** ✓ | 49.9 → **49.9** ✓ | 725 → 677 | 0 → 0 ✓ |
| table-absent · 380 | 332 → **332** ✓ | 294 → **294** ✓ | 87 → 95 | 29.6 → 32.4 | 892 → 816 | 127 → 51 |
| table-absent · 768 | 332 → **332** ✓ | 642 → **642** ✓ | 87 → 95 | 13.6 → 14.8 | 847 → 799 | 0 → 0 ✓ |
| table-absent · 1280 | 332 → **332** ✓ | 758 → **758** ✓ | 87 → 95 | 11.5 → 12.6 | 847 → 799 | 102 → 54 |
| facts · 380 | 133 → **133** ✓ | 294 → **294** ✓ | 66 → 65 | 22.4 → 22.1 | 717 → 665 | 0 → 0 ✓ |
| facts · 768 | 133 → **133** ✓ | 642 → **642** ✓ | 66 → 65 | 10.3 → 10.1 | 517 → 468 | 0 → 0 ✓ |
| facts · 1280 | 133 → **133** ✓ | 758 → **758** ✓ | 66 → 65 | 8.7 → 8.6 | 517 → 468 | 0 → 0 ✓ |
| rule · 380 | 66 → **66** ✓ | 294 → **294** ✓ | 233 → **233** ✓ | 79.3 → **79.3** ✓ | 680 → 605 | 0 → 0 ✓ |
| rule · 768 | 66 → **66** ✓ | 642 → **642** ✓ | 233 → **233** ✓ | 36.3 → **36.3** ✓ | 455 → 407 | 0 → 0 ✓ |
| rule · 1280 | 66 → **66** ✓ | 758 → **758** ✓ | 233 → **233** ✓ | 30.7 → 30.8 | 455 → 407 | 0 → 0 ✓ |
| steps · 380 | 449 → **449** ✓ | 294 → **294** ✓ | 432 → **613** ⚠ | 146.9 → 208.3 | 1275 → 1176 | 510 → 411 |
| steps · 768 | 305 → **305** ✓ | 642 → **642** ✓ | 432 → **613** ⚠ | 67.3 → 95.4 | 785 → 737 | 0 → 0 ✓ |
| steps · 1280 | 273 → **273** ✓ | 758 → **758** ✓ | 432 → **613** ⚠ | 57.0 → 80.8 | 754 → 706 | 9 → 0 |
| legacy · 380 | 52 → **52** ✓ | 294 → **294** ✓ | 198 → 211 | 67.3 → 71.8 | 606 → 621 | 0 → 0 ✓ |
| legacy · 768 | 52 → **52** ✓ | 642 → **642** ✓ | 198 → 211 | 30.8 → 32.9 | 380 → 399 | 0 → 0 ✓ |
| legacy · 1280 | 52 → **52** ✓ | 758 → **758** ✓ | 198 → 211 | 26.1 → 27.8 | 380 → 399 | 0 → 0 ✓ |

**What the deltas mean:**

- **panelH: identical in every one of 21 cells.** This is the proof the panel is
  unchanged. Panel height depends only on engine + CSS + content + width — all four
  byte-identical to REPORT-1 — so a match here is exactly what "same panel" predicts.
- **availW: identical in every cell** (294 / 642 / 758). Same width model.
- **widest / fill: exact or ~1px** for 5 of 7 shapes (`sol-note`, `sol-foot`
  match to the pixel; `sol-eq` within 1px). Two shapes differ and both are
  **measurement**, not panel: `steps` (⚠ — see §5, a correction to REPORT-1) and
  the tiny `table-absent` +8px / `legacy` +13px residuals (§ Appendix).
- **cardH / over: my card runs ~48–99px shorter than REPORT-1's** (except `legacy`,
  +15). This is **not the panel** (panelH is identical) — it is the *stand-in
  feedback + Next-button chrome* around the panel. REPORT-1 flagged this row as *"a
  stand-in single line … the exact post-ruling wording is not yet fixed"*; its exact
  card scaffold was not saved, so my reconstruction of that non-panel chrome differs
  by up to a line. **Card-level overflow is therefore approximate in BOTH reports**
  — the real app doesn't even use this panel here (§9). What is exact and shared is
  the panel itself, and it is unchanged.

### The four REPORT-1 claims — verdicts (step 4)

| # | REPORT-1 claim | Verdict |
|---|---|---|
| **(a)** | available panel width plateaus at **758px** on screens ≥ ~868px | **HOLDS — exact.** availW @1280 = 758 for all 7 shapes. The plateau is `.rao-lesson{max-width:820}` → 820 − 6 (frame) − 56 (card pad) = 758, unchanged. |
| **(b)** | worst fill @1280: table-1 & facts at 8.7%, table-absent at 11.5% | **HOLDS.** New: table-1 **8.6%**, facts **8.6%**, table-absent **12.6%**. The worst-offender ranking is **identical** (table-1 = facts < table-absent < legacy < rule < table-2 < steps). Sub-1% and +1.1% shifts are the `sol-eq` measurement residual, not a panel change. |
| **(c)** | at 800px laptop height, table-absent overflows by **102px**, steps by **9px** | **HOLDS in direction; px are chrome-dependent.** New: table-absent still overflows the 800px laptop (**54px**); steps lands at **0** (card 706 + 55 top = 761 < 800). Both sit inside the ±~48px card-chrome reconstruction margin. The panel is identical (panelH 799-vs-847… no: panelH table-absent 332=332, steps 273=273); only the non-panel chrome moved the card bottom. |
| **(d)** | worst phone overflow: **steps at 510px** | **HOLDS.** Steps is still by far the worst phone overflow — new **411px** card overflow @380, next-worst is table-absent at 51px. The px gap (411 vs 510) is entirely the card-chrome reconstruction; the **panel** overflows the phone identically (panelH 449 = 449). |

---

## 2. The solution shapes that exist NOW (step 2)

**Eight block renderers** exist in `solution-renderer.js` (`step`, `figure`,
`takeaway`, `verification`, `table`, `facts`, `rule`, + the legacy string
`explain`) — **the same eight REPORT-1 found. No new shape was introduced.** The
brief expected `table`/`facts`/`rule` as "new shapes introduced by
BRIEF-G3-ENGINE-1"; they are not new *relative to REPORT-1*, because REPORT-1 was
written after those changes already existed in the tree (§0). They ARE the
BRIEF-G3-ENGINE-1 additions; they simply predate REPORT-1's measurement too.

Rendered into the same 7 distinct panel shapes REPORT-1 measured (an 8th,
`figure`, is renderer-supported but has zero instances and zero CSS — §6):

| # | shape | grade | live instances | representative (lesson · qid · #) |
|---|---|---|--:|---|
| 1 | **table-1** (single table) | 3 | 11 `table` blocks total across G3 | `lessons-g3/multiplication_facts_up_to_10.html` · `auth-q5` · Q5 (`8 × 8`, table up to 8) |
| 2 | **table-2** (two-table compare, `sol-tables-2`) | 3 | 2 (`auth-q17`, `auth-q18`) | same file · `auth-q17` · Q17 (`compare 7×8, 9×6`) |
| 3 | **table-absent** (table with "N is not here") | 3 | 4 (`auth-q24`–`q27`) | same file · `auth-q24` · Q24 (factor 6 up to 9, 40 absent) |
| 4 | **facts** (independent facts list) | 3 | 8 `facts` blocks | same file · `auth-q15` · Q15 (`[[6,4],[4,5],[3,9],[8,4]]`) |
| 5 | **rule** (rule sentence + example row) | 3 | 5 `rule` blocks | same file · `auth-q7` · Q7 (`9 × 0`, times-zero) |
| 6 | **steps** (`step`×N + `takeaway` + `verification`) | **4** | **1,052 `step`, 474 `takeaway`, 474 `verification`** blocks across **20** files | `lessons/compare_numbers_up_to_five_digits.html` · `qdajh9mrg` · Q3 (greater-than-6,000) |
| 7 | **legacy** (bare `<p class="explain">`) | 4 | **84** `lessons/incoming/` files | `lessons/incoming/Choose numbers with a particular quotient.html` · `q8exzy2gm` · Q1 |

**Grade-4 distribution (the brief's target).** Grade 4 (`lessons/`) contains
**only two shapes**: `steps` (the enriched files — block counts 1,052 / 474 / 474,
identical to REPORT-1) and `legacy` (84 `incoming/` files). Grade 4 has **zero**
`table`/`facts`/`rule` blocks — those five shapes live **only in Grade 3**
(`lessons-g3/multiplication_facts_up_to_10.html`), exactly as REPORT-1 sourced them.

> **Scope-fence note (honest disclosure).** The brief's SCOPE FENCE says
> `lessons-g3/` is read-only "ONLY for the comparison in step 7." But step 4 — the
> brief's single most important output — requires re-rendering REPORT-1's exact
> examples, and **5 of REPORT-1's 7 shapes are Grade-3 questions.** A delta table
> "using the SAME method and SAME widths so the two reports are directly comparable"
> is impossible without re-rendering those 5. I therefore **read** (never wrote)
> `lessons-g3/multiplication_facts_up_to_10.html` to reproduce them. If chat
> intended those five shapes to be dropped from the delta, say so and I will re-cut
> the table to Grade-4-only (`steps` + `legacy`) — but that would leave claims (a),
> (b) and most of the delta unanswerable.

---

## 3. Method — reproduced exactly from REPORT-1 (step 1)

REPORT-1's script was **not saved to the repo** (searched `tools/`, `tools/scratch/`,
`docs/briefs/`, git history — absent). I reconstructed its method from its own
"Method" section and **validated the reconstruction against its own numbers** before
trusting it (see below). Reproduced verbatim:

- **Engine:** Playwright 1.56.1 headless Chromium (the browser `npm test` uses).
  Each question driven through the **real** `RaoPreview.build()` → real `.qbody`
  markup + parsed `solution`/`explain`, mounted in the **real** card context
  `.rao-lesson[data-theme=grape] > .pv-frame > .pv-card` with real `fonts.css`
  (base64-inlined) + `rao.css` + `rao-card.css`, in the answered/open state:
  `pv-head` + revealed `.qbody.is-checked` (correct option greened, `cc-hastake`
  sealing the duplicate `.explain`) + one-line feedback + the **open**
  `renderSolution` panel + a Next button.
- **The panel = `renderSolution(...)` output** (REPORT-1 Decision 1 — the open
  "shown directly" form, not the walkthrough).
- **Available width = `.pv-card` content box** (Decision 2): `clientWidth` − L/R
  padding.
- **Widest content:** the widest leaf (`sol-eq`, `sol-note`, `sol-foot`, step
  goal/working/reason, takeaway, verification, legacy `.explain`), max-content
  (`width:max-content; white-space:nowrap`), **content width** (padding/border
  excluded — see the validation note).
- **Overflow is card-level:** `.pv-card` bottom vs viewport height.
- **Three widths → viewport heights:** **380 → 820** (phone) · **768 → 1024**
  (tablet) · **1280 → 800** (laptop). The exact same three REPORT-1 used.
- **Fonts:** `Baloo 2`, `Quicksand`, `DM Sans`, `JetBrains Mono` embedded as base64
  data-URIs, `document.fonts.load` + `document.fonts.ready`, and
  `document.fonts.check` asserted **true** before every measurement. **All 21 runs
  rendered with the four families active** — no width here is fallback-font.
  (`sol-working` uses the CSS stack `ui-monospace,Menlo,Consolas,monospace` → system
  Consolas on Windows in both REPORT-1's environment and mine; not one of the four.)

**Reconstruction validated against REPORT-1's own numbers before use:** REPORT-1's
294 / 642 / 758 widths pin down the exact box model — a plain `<body>` (default 8px
margin) > `.rao-lesson` (24px padding, `max-width:820`) > `.pv-frame` (margin 20 /
padding 3) > `.pv-card`. My harness reproduces 294 / 642 / 758 **and** REPORT-1's
55px card-top offset (8 + 24 + 20 + 3) **and** all 21 panel heights, which is why I
trust it as a faithful reproduction of REPORT-1's method rather than a new method.

---

## 4. Where the two reports differ, and why (still step 4)

Every panel-intrinsic number reproduces. Three differences remain; **none is a panel
change** (panelH is identical everywhere):

1. **`steps` widest leaf (the one ⚠ in the table).** REPORT-1 named the widest leaf
   `sol-verification` at 432px. My measurement finds the **`sol-working` sequence
   at 613px** — `"5,900 ✗, 6,001 ✓, 7,240 ✓, 600 ✗, 6,000 ✗ (equal), 8,150 ✓"` — is
   wider. This is the same content REPORT-1 rendered (the lesson file predates
   REPORT-1 and is unchanged), and REPORT-1's own Step 3 even *quotes* this working
   sequence as an unbreakable line — but its Step 2 table under-identified the
   widest leaf as the verification sentence. **The panel is unchanged (panelH 449 /
   305 / 273 identical); this is a correction to REPORT-1's widest-element label,
   and it raises `steps` fill @1280 from 57.0% to 80.8%.** See §8.
2. **card-level overflow / cardH** run 48–99px shorter (legacy: +15). Non-panel
   chrome reconstruction (§1 caveat). Direction of every overflow claim is preserved.
3. **`table-absent` sol-eq +8px, `legacy` .explain +13px.** Sub-character
   measurement-technique residual on my content-width extraction; changes no verdict.

---

## 5. New shapes (step 5)

**None.** No shape exists now that did not exist in REPORT-1. `table`, `facts` and
`rule` are the BRIEF-G3-ENGINE-1 additions, but they were already present when
REPORT-1 measured (§0) and REPORT-1 measured all three. There is nothing here
without a baseline.

---

## 6. The `figure` shape (step 6)

**Still zero instances and still zero CSS — the expected answer, and it is useful.**
`grep "type: figure"` across `lessons/` and `lessons-g3/` returns **0**. `grep
"sol-figure"` across `engine/*.css` returns **0**. `renderFigure()` exists in
`solution-renderer.js` (emits `<div class="sol-figure">`) but nothing authors a
figure block and nothing styles one. Unchanged from REPORT-1. Ruling 19(3)'s
instinct stands: any contract must state a `figure` rule up front, because there is
no live instance to measure it against — it would render as an unstyled block.

---

## 7. Grade 3 comparison (step 7)

Grade 3 and Grade 4 solution panels use the **same renderer, the same container, and
overlapping shapes.** Both grades render through the one `RaoSolution.renderSolution`
into the same `.pv-card` inside the same `.rao-lesson[data-theme]` wrapper, styled by
the same `rao.css` + `rao-card.css` — there is exactly one panel implementation and
it is grade-blind. The only divergence is **which shapes each grade uses**: Grade 3
carries the `table`/`facts`/`rule` shapes (in `multiplication_facts_up_to_10.html`)
**plus** the Grade-4-style `steps` shape (in `Division_facts_up_to_10_remix.html`);
Grade 4 carries **only** `steps` and `legacy`. Because the container and renderer are
shared, a layout contract written against the panel serves both grades automatically
— the shapes differ, the panel machinery does not.

---

## 8. The `steps` content problem (step 8)

**Yes, the long verification sentence still exists**, unchanged: *"Each keeper beats
6,000 by at least 1; each reject is 6,000 or below."* — content width **432px**.
Ruling 19(4) called the 510px phone overflow a **content** problem (one long
sentence), not layout. The re-measurement **sharpens that finding**: the verification
sentence is **not even the widest line** — the `sol-working` sequence is (613px). The
phone overflow is driven by **several** long unbreakable lines, not one.

Per-block heights of the `steps` panel, laptop (avail 758) → phone (avail 294):

| block | 1280 | 380 | phone growth | why it grows |
|---|--:|--:|--:|---|
| step 1 (holds the 613px `sol-working` line) | 88 | 151 | **+63** | 613px line wraps 1 → ~3 lines |
| step 2 (holds `"6,000 is not greater than itself"`) | 88 | 120 | +32 | long working line wraps |
| `sol-takeaway` | 47 | 74 | +27 | sentence wraps |
| `sol-verification` (the 432px sentence) | 49 | 104 | **+55** | 432px line wraps 1 → ~3 lines |
| **panel total** | **272** | **449** | **+177** | |

**Split:** of the +177px the panel gains going from laptop to phone, the 613px
`sol-working` line accounts for ~+63px (36%) and the 432px verification sentence for
~+55px (31%); together **~67%**. No single element dominates. **Columnising cannot
help any of them** — each is one line that is individually wider than the phone
column and must wrap; there are no independent short rows to pack side-by-side (that
is the fact-table shapes' problem, not this one). Ruling 19(4)'s "content, not
layout" verdict holds, and applies to the whole family of long lines, not just the
verification sentence.

---

## 9. The walkthrough is still out of scope (step 9)

**Confirmed still a different container — BRIEF-G3-ENGINE-1 did NOT merge them.**
`renderSolution` emits the `.sol-*` blocks measured in this report; the step-by-step
walkthrough is `renderWalkthrough` → `.sol-walk > .sol-walk-steps.cc-chat` with
`.cc-bub` chat bubbles — a distinct DOM. The shipping card still opens the
**walkthrough** (`rao-card.js:321`, `renderWalkthrough(...)`), not `renderSolution`.
So a contract written against `renderSolution` will **not** automatically cover what
the child actually sees in the adaptive card, and — as REPORT-1 noted — the walkthrough
must be addressed explicitly or the contract governs a panel the app doesn't render
in this flow. Per Ruling 19(3) I did **not** measure the walkthrough.

---

## 10. In plain language — better, worse, or the same?

**The same. Exactly the same.** The panel that was measured the first time and the
panel that exists now are the identical piece of software — the files were last
edited the evening before the first measurement and have not been touched since; the
commit that the brief thought changed them merely saved bytes that were already
there. I re-ran the whole measurement from scratch with a fresh, independent setup,
and every height came back to the pixel and every width came back exactly. So the
answer to "does the panel behave better, worse, or the same?" is **the same**, and we
now have a second, independent measurement proving it.

Two things are worth Venkat's eye, and neither is a change in the panel:

1. The first report picked the wrong line as the "widest" thing in the Grade-4
   step-by-step solution. The real widest line is a long working-out string
   (`5,900 ✗, 6,001 ✓, …`) at 613px, not the verification sentence at 432px. It
   doesn't change what the child sees — it just means the panel wastes a little less
   width and overflows a phone for a slightly different reason than first reported.
2. The "does it run off the bottom of the screen" numbers can't be pinned to the
   pixel by either report, because both of us had to invent a stand-in for the
   buttons above and below the panel, and the real app doesn't even show this panel
   here — it shows the tap-through walkthrough instead. The panel's own height is
   solid; the full-screen overflow around it is approximate in both reports.

Bottom line for the contract: build it against **these** numbers with confidence —
they are the current panel — but remember the panel this report measures is the
"show me the whole solution" form, and the adaptive card the child normally taps
through is the **walkthrough**, which is a different box and still outside the
contract.

---

## Observations (one line each, per HARD RULES — NOT proposals)

- The one concrete cleanup worth flagging: the Grade-4 `steps` panel's overflow is a
  content property of a few individually-too-wide lines (max 613px), so the lever is
  line length / line-breaking, not columns.
- REPORT-1's measurement script should be committed to `tools/scratch/` so the next
  re-measure reproduces card-level overflow exactly instead of reconstructing chrome.

---

## Appendix — reproducibility & honesty notes

- **What was rendered:** the open `renderSolution` panel inside a realistic answered
  card (pv-head + greened `is-checked` qbody + one-line feedback + panel + Next
  button), per shape, at 3 viewports, fonts asserted active.
- **Harness location:** written to the session scratchpad (not the repo). It is a
  faithful reconstruction of REPORT-1's described method; REPORT-1's own script was
  not in the repo to reuse.
- **`widest` = content width** (element padding/border excluded). Chosen because it
  reproduces REPORT-1's unpadded leaves exactly (`sol-note` 233 = 233, `sol-foot`
  378 = 378) and its `sol-eq` to ~1px; a box-inclusive measure inflated the padded
  `.explain`/`sol-verification` and did not match. The remaining +8px (`sol-eq` in
  `sol-absent`) / +13px (`.explain`) residuals are sub-character technique noise.
- **Example identity pinned by parsed-solution signature**, not by list position, so
  each re-measured question is provably REPORT-1's (e.g. table-1 = `auth-q5`,
  factor 8 up to 8; not the factor-8-up-to-7 `auth-q1`, which would have mis-matched
  panelH 232 vs 266 — caught and corrected during this pass).
- **Not measured, by instruction:** the walkthrough (§9); the `figure` block (§6, no
  instance).
- **Read-only:** the only file written is this report. No lesson, engine or CSS file
  was modified. No commit. No push.
