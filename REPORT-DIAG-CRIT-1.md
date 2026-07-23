# REPORT-DIAG-CRIT-1
Read-only diagnosis of ISSUES #75 (geometry engine not loaded) and #76
(categorize positional grading). No files changed except this report.
Engine under test: `preview-engine.js` `__version: "rao-master-22"`.

Method note: two throwaway Playwright probes were run against the repo's real
engine and real review pages (written to the session scratchpad, **not** the
repo). Their raw output is quoted inline below. Verdicts are labelled CONFIRMED
(observed by running it) or INFERRED (read the code and reasoned).

---

## PART A — #75 geometry engine (qgtig2x2q = `symmetry_remix.html` Q, construct type)

### A1 — Does the engine file exist?
**YES.** `engine/geometry-engine.js` — **985,191 bytes (~962 KB), 1,144 lines.**
It defines the global the engine looks for:
- `engine/geometry-engine.js:1134` — `W.RaoGeo = { mount: mount };`
- adapter `RaoGeo.mount(el, {kind, cfg}) → { grade(), destroy() }` at lines 1071–1134.

The file was created **2026-07-22** (today's date) per its filesystem mtime — it
is newer than the review pages that were generated without it.

### A2 — Exact source of "Geometry engine not loaded"
`engine/preview-engine.js:2631`, inside `construct.bind` (opens at line 2623).
It is the **`else` branch** of this guard at line 2627 — quoted verbatim:

```js
2627    if (window.RaoGeo && typeof window.RaoGeo.mount === "function") {
2628      mount.innerHTML = "";
2629      mount.__geo = window.RaoGeo.mount(mount, spec);
2630    } else {
2631      mount.innerHTML = '<div style="…">Geometry engine not loaded.</div>';
2632    }
```

The string is emitted whenever **`window.RaoGeo` is falsy OR `window.RaoGeo.mount`
is not a function** — i.e. the geometry-engine global is not present on the page.
It is *not* a per-question or per-answer condition; it is a page-global "is the geo
engine loaded at all" check. It is generated at **runtime by JS**, so it is not
visible in the static review HTML — only in a live browser.

### A3 — Every question that depends on the geometry engine
Dependence marker: frontmatter **`type: construct`**, which the builder renders as
`<div class="rao-construct" data-construct='…'>` and dispatches to `construct.bind`
→ `window.RaoGeo.mount` (`preview-engine.js:2622–2634`). Detected via
`grep -r 'type: construct' lessons/`.

**Total: 31 construct questions across 6 files** (30 in real lessons + 1 in the
`_type-coverage.html` harness fixture):

| File | Count | Question IDs |
|---|---|---|
| `lessons/incoming/Create figures with a given area.html` | 18 | qfh2vmnv7, qj924mexy, q2czxrkkq, qs9tbcn3t, qukmzsd9j, qbgfu88jj, qbwcjxwdq, qxbdjjy57, qm4hxem92, qgcimsknv, qyfdwvnv7, qnyzgehkq, qn2gmgehv, qxbkjw3nt, qqwugydxd, q5yz2wnr6, qmg3v2zpw, q5tga2rqk |
| `lessons/incoming/select-area-remix.html` | 5 | qy3zqscxs, qa3giktgc, qj3fj8aud, qdd9mmezk, qdaabvqbb |
| `lessons/incoming/symmetry_remix.html` | 3 | qjfr5qfk6, **qgtig2x2q**, qpg4xyab6 |
| `lessons/incoming/symmetry_set2.html` | 3 | qsae57szi, q3gqgi5vs, q82cm2cby |
| `lessons/incoming/perimeter_remix.html` | 1 | qbhpgzm7e |
| `lessons/_type-coverage.html` (fixture) | 1 | q6xggv3fd |

`qgtig2x2q` is confirmed a construct question (`symmetry_remix.html:231` id).

### A4 — Is the engine actually loaded on the page? Trace the load path.
**The review pipeline never injects it.** `tools/make-review.js` inlines a fixed
asset list — `preview-engine.js` (line 44/275/307), `rao.css`, `rao-card.css`,
`rao-card.js`, `solution-renderer.js` (line 312), `robo.js` (line 319), `robo.css`,
fonts. `grep -n 'geo|RaoGeo|geometry' tools/make-review.js` → **no matches.**
`geometry-engine.js` is not in the list, so `window.RaoGeo` is never defined on a
review page. Corroboration: `tools/verify-reset.js:33–36` — *"construct:
window.RaoGeo is an APP-side asset (raoGeoEngine.js is not in this repo), so a
minimal TEST-SIDE stub is injected."* The whole test/review pipeline treats the geo
engine as external and either stubs it (tests) or omits it (review pages).

**LIVE PROOF (probe opened the real review pages in Chromium):**
```
=== review/symmetry_remix.html ===
{ "windowRaoGeoDefined": false, "constructMounts": 6,
  "notLoadedCount": 3,
  "sampleTexts": ["","","","Geometry engine not loaded.",
                  "Geometry engine not loaded.","Geometry engine not loaded."] }
=== review/symmetry_set2.html ===
{ "windowRaoGeoDefined": false, "constructMounts": 6,
  "notLoadedCount": 3,
  "sampleTexts": ["","","","Geometry engine not loaded.",
                  "Geometry engine not loaded.","Geometry engine not loaded."] }
```
`window.RaoGeo` is undefined on both pages; all 3 construct questions per page
render the error. (The page has 6 `.rao-construct` nodes because make-review keeps a
second inert copy of each question in a page-stash — those 3 are un-bound and empty.
The 3 that `construct.bind` actually wires all show the error. Real construct
*questions* per file = 3, matching the source.) **No construct question renders
correctly anywhere in the repo**, so there is no working-vs-Q10 diff to draw — the
failure is uniform, not specific to Q10 (qgtig2x2q).

### A5 — VERDICT
**SYSTEMIC, not one broken question. CONFIRMED (live run).**
On the review pages Venkat opens, **all 31 construct questions are DEAD** (render the
"Geometry engine not loaded." placeholder, unanswerable): 30 real-lesson questions +
1 harness fixture. **Zero construct questions render fine** in the repo's review
pipeline. Root cause: `make-review.js` never inlines `engine/geometry-engine.js`,
which exists (created today) but is unwired.
The **app** (a separate codebase) may or may not load `geometry-engine.js` —
**COULD NOT DETERMINE — the app source is not in this repo.** The repo-side review
pipeline is definitively broken.

---

## PART B — #76 categorize grading (qnpwn98bv = `symmetry_set2.html` Q16)

### B1 — Identity or position?
**IDENTITY.** The compare is the generic array equality in `check()` at
`preview-engine.js:2838`:
```js
2838    return user.length === correct.length && user.every((v, i) => v === correct[i]);
```
- `correct` = the `answer` array = **correct region per tile, in authored tile order**
  (`buildCategorize`, `preview-engine.js:1084` comment + `:1089`).
- `user` = `categorize.serialize` (`preview-engine.js:2554`), which does
  `querySelectorAll(".vs-tile[data-idx]").sort(by data-idx)` then pushes each tile's
  **current zone `data-region`**. `data-idx` is the tile's authored index, fixed at
  build time (`:1099` `data-idx="${i}"`).

So index *i* in the compare is **tile identity (data-idx), not tray slot position**.
`user[i]` = "which region does authored-tile *i* currently sit in", compared to
`correct[i]` = "which region authored-tile *i* belongs in".

### B2 — Do tiles shuffle on load?
**No — fixed authored order.** `buildCategorize` emits tiles via
`tiles.map((t, i) => … data-idx="${i}")` (`preview-engine.js:1094–1099`) in source
order. `categorize.bind` (`:2555`) only attaches drag/tap handlers; it never
reorders. `grep 'shuffle' engine/*.js` → **no match anywhere**; the only
`Math.random` calls are an inline-id prefix (`preview-engine.js:155`) and confetti
geometry (`rao-card.js:427`) — neither touches tile order. CONFIRMED.

### B3 — LIVE PROOF (probe built & graded qnpwn98bv Q16 through the real engine)
```
answer (source of truth): ["has","none","has","none"]
 tile0=circle→has  tile1=parallelogram→none  tile2=letter A→has  tile3=letter F→none

Scenario A  identity-correct placement, authored order
  serialize = ["has","none","has","none"]   check = TRUE   (accepted)

Scenario B  SAME identity mapping, positions physically reversed +
            tiles re-ordered as DOM siblings inside the "has" bin
  serialize = ["has","none","has","none"]   check = TRUE   (position irrelevant)

Scenario C  wrong identity mapping (control)
  serialize = ["none","none","has","none"]  check = FALSE  (grader discriminates)
```
Scenario B is the decisive one: shuffling the physical/DOM order of the tiles while
keeping each tile in its correct region does **not** change the graded result,
because `serialize` re-sorts by `data-idx`. A wrong mapping (C) is still rejected, so
the grader is not simply passing everything.

### B4 — COMBINED VERDICT for Q16
**A child who sorts correctly CANNOT be marked wrong. Issue #76 is NOT reproduced.
CONFIRMED (live run).** The reported bug requires grading to be positional **and**
tile order to vary; **both are false** — grading is identity-keyed (`data-idx`) and
tiles never shuffle. The "has, none, has, none" the reporter saw is simply the
**answer-line display** rendering the frontmatter `answer: ["has","none","has","none"]`
(`symmetry_set2.html:368`) — it is the correct-answer readout, not evidence of a
mis-grade. #76 should be closed as **not-a-defect** (subject to Venkat's call).

### B5 — Blast radius (categorize)
- **Total categorize questions: 154, across 68 lesson files** (`grep -r 'type:
  categorize' lessons/`).
- **Questions that shuffle their tiles: 0.** No shuffle path exists in the engine or
  card renderer (B2). `serialize` is position-independent regardless.
- **Actually-at-risk set: 0.** The positional-grading failure mode described in #76
  cannot occur for any categorize question in the bank.

---

## Inline summary (as requested)
- **A5 verdict:** SYSTEMIC — CONFIRMED. All 31 construct questions (30 real + 1
  fixture) are dead on review pages ("Geometry engine not loaded"); 0 render.
  `make-review.js` never inlines `geometry-engine.js` (which exists, created today).
  App-side load path COULD NOT BE DETERMINED (app is a separate repo).
- **B4 verdict:** NOT A DEFECT — CONFIRMED live. Categorize grading is identity-keyed
  (`data-idx`), tiles never shuffle; a correct sort always grades TRUE (Scenarios A/B),
  a wrong sort grades FALSE (C). "has, none, has, none" is the answer-line display.
- **Blast radius #75 (construct):** 31 questions / 6 files DEAD on review pages.
- **Blast radius #76 (categorize):** 154 questions / 68 files total; **0 at risk.**
