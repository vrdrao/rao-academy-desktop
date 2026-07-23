# REPORT-MEASURE-PANELS-1
Read-only measurement pass for `docs/ISSUES.md` item 81 (solution-panel vertical
layout contract). Numbers are real rendered measurements — no estimates.

Produced by BRIEF-MEASURE-PANELS-1. Nothing here proposes a fix.

---

## Method (as approved at Step 0, with the three refinements applied)

- **Engine:** Playwright 1.56.1 headless Chromium — the same browser `npm test`
  uses. Each question is driven through the **real** engine
  (`RaoPreview.build` → real `.qbody` markup + parsed `solution`), mounted in the
  **real** card context (`.rao-lesson[data-theme=grape] > .pv-frame > .pv-card`)
  with the real `fonts.css` + `rao.css` + `rao-card.css`, in the realistic
  answered/open state: `pv-head` + revealed `.qbody.is-checked` (correct option
  greened) + a one-line feedback row + the **open** solution panel + a
  `Next question` button.
- **The panel = `renderSolution(...)` output** (confirmed Decision 1 — the open
  "shown directly" form, not the walkthrough).
- **Available width = the `.pv-card` content box** (confirmed Decision 2): card
  `clientWidth` minus left/right padding.
- **Height read** with `getBoundingClientRect()`.
- **Refinement 1 — widest content:** the widest of **every** leaf element in the
  panel (sol-eq rows, `sol-note`, `sol-foot`, step goal/working/reason, takeaway,
  verification, the legacy `.explain`), measured as **max-content width** (clone
  set to `width:max-content; white-space:nowrap`). The report names which element
  is widest, not just its size.
- **Refinement 2 — overflow is card-level:** the panel sits below
  prompt/options/feedback and above the Next button, so overflow is computed from
  the full **`.pv-card` bottom vs the viewport height**, not panel-height alone.
  Panel height and the panel's top-offset-within-the-card are still reported.
- **Refinement 3 — fonts:** all four self-hosted families
  (`Baloo 2`, `Quicksand`, `DM Sans`, `JetBrains Mono`) were embedded as base64
  data-URIs, force-loaded (`document.fonts.load`) and asserted active
  (`document.fonts.check`) **before every measurement**. **All 21 runs
  (7 shapes × 3 widths) rendered with the real fonts active** — no width in this
  report is fallback-font. (Had any failed, its width and %-fill cells would read
  "fallback-font — approximate".)

**Walkthrough structural relation (one line, as requested — not measured):** the
step-by-step walkthrough (`renderWalkthrough`) renders into a **different
container** — `.sol-walk > .sol-walk-steps.cc-chat` with `.cc-bub` chat bubbles —
**not** the `.sol-*` blocks that `renderSolution` emits; a layout contract written
against `renderSolution` will **not** automatically cover the walkthrough, and the
shipping app currently opens the walkthrough (`rao-card.js:321`), so if that path
survives, the contract must cover both containers explicitly.

**One measured fact that frames the whole item.** `.rao-lesson` is capped at
`max-width:820px` (`rao.css:28`). So the panel's available width **plateaus at
758px** for every viewport at or above ~868px — that is why the 1280 column below
is 758px, not ~1250px. Item 81's "two-thirds empty" is emptiness **inside the
758px reading column**, not the full screen; widening past 820px is a separate,
deliberate typography decision, not this defect.

---

## STEP 1 — the solution shapes (discovered from code + lessons)

Eight block types exist in `solution-renderer.js`
(`step`, `figure`, `takeaway`, `verification`, `table`, `facts`, `rule`, plus the
legacy string `explain`). Rendered into distinct panel shapes across both grades:

| # | shape | grade(s) | live example (lesson · question) |
|---|---|---|---|
| 1 | **table-1** — single times-table | 3 | `lessons-g3/multiplication_facts_up_to_10.html` · Q5 (`8 × 8 = ?`) |
| 2 | **table-2** — two-table comparison (`sol-tables-2`) | 3 | same file · Q17 (`Which is larger, 7 × 8 or 9 × 6?`) |
| 3 | **table-absent** — table with "N is not here" gap | 3 | same file · Q24 (factor 6 up to 9, 40 absent) |
| 4 | **facts** — independent facts list | 3 | same file · Q15 (`[[6,4],[4,5],[3,9],[8,4]]`) |
| 5 | **rule** — rule sentence + one example row | 3 | same file · Q7 (`9 × 0 = ?`, "times zero") |
| 6 | **steps** — `step`×N + `takeaway` + `verification` | 4 | `lessons/compare_numbers_up_to_five_digits.html` · Q3 (greater-than-6,000) |
| 7 | **legacy** — bare one-line `<p class="explain">` | 4 | `lessons/incoming/Choose numbers with a particular quotient.html` · Q1 |

**Distribution:** Grade 3 (`lessons-g3/`) uses table/facts/rule
(`multiplication_facts_up_to_10.html`, rewritten) **and** the Grade-4-style
steps shape (`Division_facts_up_to_10_remix.html`, pre-ruling). Grade 4:
`lessons/` (19 enriched files) carry the steps shape (1,052 `step`, 474
`takeaway`, 474 `verification` blocks); `lessons/incoming/` (84 files) are legacy
explain-only.

- **9th type, `figure`: COULD NOT RENDER — no live example in the corpus.** Zero
  `type: figure` solution blocks exist in either grade, and `.sol-figure` has **no
  CSS rules** (all other block types are styled). Renderer-supported, currently
  unused. Not measured.

---

## STEP 2 — measurement table

Widths → viewport heights: **380 → 820** (phone) · **768 → 1024** (tablet) ·
**1280 → 800** (laptop). All rows: fonts **active**. Overflow is card-level
(`.pv-card` bottom − viewport height; 0 = fits, no scroll).

| shape | w | panel H | panel top-in-card | card H | overflow | avail W | widest px | %-fill | widest element (text) |
|---|--:|--:|--:|--:|--:|--:|--:|--:|---|
| **table-1** | 380 | 266 | 521 | 860 | **95** | 294 | 66 | 22.4% | `sol-eq` (`8 × 8 = 64`) |
| | 768 | 266 | 311 | 658 | 0 | 642 | 66 | 10.3% | `sol-eq` |
| | 1280 | 266 | 311 | 658 | 0 | 758 | 66 | **8.7%** | `sol-eq` |
| **table-2** | 380 | 292 | 460 | 826 | **61** | 294 | 378 | 128.6% | `sol-foot` (`7 × 8 = 56 is more than 9 × 6 = 54, so 7 × 8 is larger.`) |
| | 768 | 267 | 376 | 725 | 0 | 642 | 378 | 58.9% | `sol-foot` |
| | 1280 | 267 | 376 | 725 | 0 | 758 | 378 | 49.9% | `sol-foot` |
| **table-absent** | 380 | 332 | 486 | 892 | **127** | 294 | 87 | 29.6% | `sol-eq` (`40 is not here`) |
| | 768 | 332 | 433 | 847 | 0 | 642 | 87 | 13.6% | `sol-eq` |
| | 1280 | 332 | 433 | 847 | **102** | 758 | 87 | **11.5%** | `sol-eq` |
| **facts** | 380 | 133 | 510 | 717 | 0 | 294 | 66 | 22.4% | `sol-eq` (`8 × 4 = 32`) |
| | 768 | 133 | 302 | 517 | 0 | 642 | 66 | 10.3% | `sol-eq` |
| | 1280 | 133 | 302 | 517 | 0 | 758 | 66 | **8.7%** | `sol-eq` |
| **rule** | 380 | 66 | 540 | 680 | 0 | 294 | 233 | 79.3% | `sol-note` (`Any number times zero is zero.`) |
| | 768 | 66 | 307 | 455 | 0 | 642 | 233 | 36.3% | `sol-note` |
| | 1280 | 66 | 307 | 455 | 0 | 758 | 233 | 30.7% | `sol-note` |
| **steps** | 380 | 449 | 752 | 1275 | **510** | 294 | 432 | 146.9% | `sol-verification` (`Each keeper beats 6,000 by at least 1; each reject is 6,000 or below.`) |
| | 768 | 305 | 399 | 785 | 0 | 642 | 432 | 67.3% | `sol-verification` |
| | 1280 | 273 | 399 | 754 | **9** | 758 | 432 | 57.0% | `sol-verification` |
| **legacy** | 380 | 52 | 437 | 606 | 0 | 294 | 198 | 67.3% | `.explain` (`28 ÷ 4 = 7, because 7 × 4 = 28.`) |
| | 768 | 52 | 203 | 380 | 0 | 642 | 198 | 30.8% | `.explain` |
| | 1280 | 52 | 203 | 380 | 0 | 758 | 198 | 26.1% | `.explain` |

Notes on reading the table:
- **%-fill > 100%** (table-2 @380, steps @380) means the widest element **cannot
  fit one line** at that width and already wraps — it is *using* all the width, not
  wasting it. That element is the reflow limiter (see Step 3).
- **Low %-fill** (table-1/facts ~9–22%, table-absent ~11–30%) is the Item-81
  defect: short independent rows stacked in one narrow column, most of the panel
  width empty.
- **`sol-eq` widths are constant across widths** (66px, 87px, etc.) — the fact
  rows never use more than a fraction of the panel; only the container stretches.

---

## STEP 3 — reflowable vs. unbreakable

| shape | class | detail |
|---|---|---|
| **table-1** | **REFLOWABLE** | 8 independent `sol-eq` fact rows (~66px each); trivially wrap into 2–4 columns. |
| **facts** | **REFLOWABLE** | 4 independent fact rows (~66px each). Same as table-1. |
| **table-absent** | **REFLOWABLE** | 9 fact rows + short "N is not here" lines (~87px), all independent. |
| **table-2** | **MIXED** | The two times-tables are reflowable columns (already side-by-side via `sol-tables-2`), **but** `sol-foot` is a single 378px sentence — an **unbreakable** wide line that sets the panel's minimum comfortable width. |
| **rule** | **MIXED** | One `sol-note` sentence (233px, **unbreakable** single line) + one example fact row. Little to reflow — essentially a short sentence plus one row. |
| **steps** | **MIXED (mostly unbreakable)** | Step `goal`/`working` fragments are short, but `working` sequences (e.g. `5,900 ✗, 6,001 ✓, …`), the `takeaway`, and the `verification` are **long full sentences** (up to 432px). The step *list* is a sequence, but each item's prose is an unbreakable line. |
| **legacy** | **UNBREAKABLE** | A single explanatory sentence (one `<p>`, 198px). Nothing to reflow. |

---

## STEP 4 — worst offenders

### (1) Most wasted horizontal space at 1280px (worst first)
Ranked by %-fill at 1280 (lower = more of the 758px panel empty):

| rank | shape | %-fill @1280 | ≈ empty | widest element |
|---|---|--:|--:|---|
| 1 | **table-1** | 8.7% | ~91% | `sol-eq` fact row |
| 1= | **facts** | 8.7% | ~91% | `sol-eq` fact row |
| 3 | **table-absent** | 11.5% | ~88% | `sol-eq` fact row |
| 4 | **legacy** | 26.1% | ~74% | `.explain` sentence |
| 5 | **rule** | 30.7% | ~69% | `sol-note` sentence |
| 6 | **table-2** | 49.9% | ~50% | `sol-foot` sentence |
| 7 | **steps** | 57.0% | ~43% | `sol-verification` sentence |

The three **table/facts** shapes waste ~90% of the panel width at 1280 and are the
clearest targets — and they are exactly the REFLOWABLE ones (Step 3), i.e. the
cheapest to fix by columnising.

### (2) Overflows at 380px (worst first)
Card bottom beyond the 820px phone viewport → forces scroll:

| rank | shape | overflow @380 | card H @380 |
|---|---|--:|--:|
| 1 | **steps** | **510px** | 1275 |
| 2 | **table-absent** | 127px | 892 |
| 3 | **table-1** | 95px | 860 |
| 4 | **table-2** | 61px | 826 |
| — | facts / rule / legacy | 0 | fit |

**Also flag — the 1280×800 laptop height (not just phone) forces scroll on two
shapes:** **table-absent** overflows by **102px** and **steps** by **9px** at
1280, because the 800px laptop height is shorter than the 1024px tablet height.
The overflow problem is not phone-only.

---

## Appendix — reproducibility & honesty notes

- **What was rendered:** the open `renderSolution` panel inside a realistic
  answered card, per shape, at 3 viewports. The card included prompt + options
  (correct option greened) + a representative one-line feedback row + the panel +
  a Next button, so card-level height/overflow reflects a real single-question
  screen.
- **The feedback row** above the panel is a stand-in single line (the exact
  post-ruling wording is not yet fixed); it contributes ~one line to card height
  consistently across shapes and does not affect panel width or %-fill.
- **`build()` chunking:** each example was isolated by splitting its lesson on
  `<!--@q` and selecting the block by a unique frontmatter signature; `qIndex` is
  that block's 1-based position in the file.
- **Not measured, by instruction:** the walkthrough form (structural relation
  noted above); the `figure` block (no live instance).
- **No fix, no proposal, no file changed** other than this report. No commit, no
  push.
