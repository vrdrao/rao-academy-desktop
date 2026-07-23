# BRIEF-SOURCE-READ — diagnosis of three unanswerable questions + one un-enriched lesson

Executed 2026-07-20. READ-ONLY. Nothing was created, modified, moved, committed
or pushed except this one report (`docs/audits/SOURCE-READ.md`, explicitly
permitted). No fix was applied. No guard was written. No effort/timeline estimate
appears anywhere below.

Source read with UTF-8; the source uses genuine `×` (U+00D7) and `—` (U+2014)
(any `�` seen in a terminal was a display artifact, not a source defect).

---

## Task A — Item 41: `q86pfikqr`, the L-shape

Located by id in **`lessons/incoming/area-and-perimeter-word-problems.html`**
(ledger `file` field confirms; grep confirms it is the only source containing the id).

### 1. Frontmatter (verbatim)

```
<!--@q
id: q86pfikqr
type: single-select
answer: ["20 sq cm"]
description: Area of an L-shaped tile
hint: Once you've split it, each piece is a plain rectangle. Work out both areas — then what do you do with the two numbers?
-->
```

### 2. `answer:` — exactly as authored

`answer: ["20 sq cm"]`

### 3. Figure specification (verbatim, source order)

Polygon: `points="54,54 198,54 198,126 270,126 270,198 54,198"` — **six vertices → a six-sided figure.**

Six `<text>` labels, in source order:

| # | position (x,y) | text | edge it labels |
|---|---|---|---|
| 1 | 126,35 | `4 cm` | top edge (x 54→198) |
| 2 | 225,70 | `2 cm` | upper right vertical (y 54→126) |
| 3 | 254,104 | `2 cm` | notch horizontal (x 198→270) |
| 4 | 289,162 | `2 cm` | lower right vertical (y 126→198) |
| 5 | 162,217 | `6 cm` | bottom edge (x 54→270) |
| 6 | 35,126 | `4 cm` | left edge (y 54→198) |

**There are SIX labels, not seven.** (The brief's prose says "seven" but its own
enumeration — top 4, left 4, bottom 6, three right-side 2s — also totals six.)

### 4. Option list (verbatim)

`<ul class="options"><li>24 sq cm</li><li>20 sq cm</li><li>16 sq cm</li><li>10 sq cm</li></ul>`

### 5. description / hint / whyWrong / solution

- description: `Area of an L-shaped tile`
- hint: `Once you've split it, each piece is a plain rectangle. Work out both areas — then what do you do with the two numbers?`
- explain: `Cut it in two: 4 × 2 = 8 on top, 6 × 2 = 12 below. 8 + 12 = 20 sq cm.`
- whyWrong: **none.** solution/walkthrough: **none.**

### The three explicit answers

**(a) Does the authored figure match what renders?**
The source has **six** labels for a **six**-sided figure, all internally
consistent at exactly **36 SVG units per cm** (top 144u=4cm, left 144u=4cm,
bottom 216u=6cm, each right segment 72u=2cm). The figure **closes**: left 4 =
2+2 (the two right verticals); bottom 6 = 4 (top) + 2 (notch). The SVG is a
sibling of `<p class="prompt">` (not nested inside it), so there is no
figure-in-prompt double-render. **There is no evidence of a seventh label or an
engine defect.** Whether a browser paints a spurious seventh label is
**UNMEASURED** (not rendered here), but the source that feeds the render has six,
all correct.

**(b) Is the authored answer among the authored options?**
**Yes.** `20 sq cm` is option 2 of `[24, 20, 16, 10]`.

**(c) Is the authored answer arithmetically correct for the authored figure?**
**Yes.** Shoelace on the authored coordinates = **20 sq cm** exactly. The
explain's decomposition (`4×2 = 8` top, `6×2 = 12` below, sum `20`) is correct
and matches the figure.

**Conclusion for Item 41:** all three checks come back clean — the figure is
coherent, the answer is present, and it is arithmetically correct. **This
question is answerable.** The brief's "area = 12, not among options" arises from
a mis-decomposition (using the notch width `2` instead of the full bottom width
`6`: `4×2 + 2×2 = 12`). The correct split is `4×2 + 6×2 = 20`, which *is* an
option. **Reported as measured: no defect found in `q86pfikqr`.**

---

## Task B — Item 44: `qe4c5gevv` and `qszpxymg7`

File **`lessons/incoming/bar_graphs_remix.html`** (ships; excluded from the cull).

### `qe4c5gevv` — frontmatter + question block (verbatim)

```
<!--@q
id: qe4c5gevv
type: categorize
layout: bins
regions: [{"id": "more", "label": "More than 20"}, {"id": "fewer", "label": "Fewer than 20"}]
answer: ["more", "fewer", "more", "fewer"]
description: Sort bars above/below a value
hint: Read each animal's bar and compare to 20.
-->
<div class="question" data-type="categorize">
  <p class="prompt">Sort each animal by how many the zoo has.</p>
  <ul class="tiles"><li>Lion</li><li>Zebra</li><li>Monkey</li><li>Seal</li></ul>
  <p class="explain">Lion 30 and Monkey 40 are more than 20; Zebra 10 and Seal 15 are fewer.</p>
</div>
```

### `qszpxymg7` — frontmatter + question block (verbatim)

```
<!--@q
id: qszpxymg7
type: categorize
layout: bins
regions: [{"id": "above", "label": "More than 50"}, {"id": "upto", "label": "50 or fewer"}]
answer: ["above", "upto", "above", "upto"]
description: Sort bars vs 50
hint: Compare each team's bar to 50.
-->
<div class="question" data-type="categorize">
  <p class="prompt">Sort each team by their points.</p>
  <ul class="tiles"><li>Reds</li><li>Blues</li><li>Golds</li><li>Greens</li></ul>
  <p class="explain">Reds 70 and Golds 60 are more than 50; Blues 30 and Greens 50 are 50 or fewer.</p>
</div>
```

### Present-vs-absent verdict

**The data is ABSENT from the source, not failing to render.** Each question
body contains only a prompt and four label tiles (`Lion/Zebra/Monkey/Seal`;
`Reds/Blues/Golds/Greens`). There is **no `<table>`, no `<svg>`, no `<figure>`,
no inline values** anywhere in the `<div class="question">`. The quantities that
make the sort possible (Lion 30, Zebra 10, …; Reds 70, Blues 30, …) exist **only
inside the `explain:` string**, which a child sees *after* answering. Before
answering, there is no bar chart and no number — the question cannot be answered
from what is rendered.

- The hint even instructs "Read each animal's **bar**" / "Compare each team's
  **bar** to 50" — referring to a bar chart that was never authored into the body.
- The "tell" the brief noted (`above, upto, above, upto` on `qszpxymg7`) is the
  **normal categorize answer format** — one region id per tile in tile order — not
  lost data. The answer key is well-formed; it is the *stimulus* that is missing.

**This is an AUTHORING defect (missing figure), not an engine defect.**

**BRIEF-3 / `FLATTENED_MARKUP` connection — measured, not asserted: none.**
There is no `<table>` (or any markup) here that should render and fails to. The
BRIEF-3 work makes option `<table>`s render and guards flattening; these two
questions carry no table/figure at all. The data was never authored into the
body, so the table-rendering path is not involved. **No connection exists.**

---

## Task C — the general case (both scans over all 103 lessons)

### C.1 — categorize with no data source

**152 categorize questions total.** Mechanical filter (no `<svg>/<figure>/<table>/<img>`
in the body **and** tiles not self-describing numerics) flags **16**. Inspecting
each one's regions + prompt + tiles classifies them:

**Genuinely unanswerable — 2 (both already known):**

| id | file | why |
|---|---|---|
| `qe4c5gevv` | lessons/incoming/bar_graphs_remix.html | sort animals by hidden counts |
| `qszpxymg7` | lessons/incoming/bar_graphs_remix.html | sort teams by hidden points |

**The other 14 are answerable (self-describing / world-knowledge tiles) — named and rejected as near-misses, not laundered:**

| id | file | sort criterion (intrinsic to the tile) |
|---|---|---|
| qeevadz8f | lessons/compare_convert_metric_volume.html | object → mL/L/kL (a pool vs a spoon) |
| qewvxafpa | lessons/properties_of_multiplication.html | rule statement → commutative/associative/distributive |
| q4girap2u | lessons/use_perimeter_to_determine_cost.html | job → perimeter/area |
| qa84zxg64 | lessons/incoming/Understanding_probability_remix.html | event → certain/impossible |
| qs3bymxbn | lessons/incoming/am-or-pm_remix.html | activity → A.M./P.M. |
| q77ih8bq3 | lessons/incoming/am-or-pm_remix.html | clue → A.M./P.M. |
| qcfkh8rvy | lessons/incoming/am-or-pm_remix.html | event → A.M./P.M. |
| qdba6mj6g | lessons/incoming/am-or-pm_remix.html | event → A.M./P.M. |
| qk77nuxaf | lessons/incoming/area-and-perimeter-word-problems.html | job → area/perimeter |
| qdehbcxnr | lessons/incoming/even_odd_remix.html | parity rule (even+even…) → always even/odd |
| qb5xpe5v3 | lessons/incoming/metric_mixed_units_remix.html | unit → length/mass/capacity |
| q35yygrd3 | lessons/incoming/names-for-numbers_remix.html | number-name → 3 digits/4 digits (the name IS the value) |
| qjipgcdti | lessons/incoming/perimeter_remix.html | job → perimeter/area |
| qckh4q65q | lessons/incoming/time_units_variations.html | unit pair → regroups at 7/12/24 |

**C.1 result: 2 categorize questions render no data source and are unanswerable
— exactly the two already known. No new cases.**

### C.2 — single/multi-select answer not among options

**1,657 select questions total. TRUE mismatches: 0.**

An initial naive scan flagged 114, but every one was a **parser artifact**: the
engine's grading key is *explicit `data-val` → else option text → else 1-based
position* (`preview-engine.js:745`), and an answer authored as a **1-based index
or a letter** is mapped to that option (`:989`). So `answer:["1"]` over text
options `28/32/20/24` means "option 1" and is valid, and figure-only options
(`<li><svg>…</svg></li>`) are keyed by position. Re-scanning with the engine's
actual rule (answer valid if it matches a data-val, option text, a 1-based index
in range, or a letter in range) yields **0 mismatches** — consistent with the
green `verify-grading-node` gate, which already proves every key grades correct.

**C.2 result: 0 select questions have an answer outside their options.**
`q86pfikqr` (Item 41) was **not** among them — its answer `20 sq cm` is present.

**Coverage honesty (denominator):** both scans covered every question of the
relevant types across all 103 lessons; nothing was silently excluded. `construct`
(geometry self-grading, `answer: []`) and non-select/non-categorize types are out
of scope for these two specific checks by design and are not counted as select or
categorize questions. The C.2 check cannot mechanically verify that the *offered*
correct option is the *arithmetically* right value (see Task D blind spot) — it
only verifies selectability.

**The finding of the night: neither scan surfaced anything beyond the two known
categorize questions. Item 41 is not defective. The corpus does not harbour a
hidden population of these defects.**

---

## Task D — specification of the Item-45 guard (NOT built)

A guard `verify-answerable.js` (not created here) should assert, per question:

**Assertion 1 — the authored correct answer is selectable.**
For every `single-select` / `multi-select`, each element of `answer:` must
resolve to an option under the engine's real keying: explicit `data-val`, else
option text, else a 1-based positional index in `[1..N]`, else a letter in
`[A..]` within range. **It must replicate `preview-engine.js` keying, not a
naive text match** — otherwise it produces ~114 false positives (as shown above)
and gets "fixed" by loosening until it is worthless. Mechanically decidable;
covers 100% of select questions.

**Assertion 2 — a categorize question presents a data source.**
For every `categorize`, the body must contain a stimulus the child can read
*before* answering: a `<table>`, `<svg>`, `<figure>`, `<img>`, **or** tiles that
are themselves the data (numeric/self-describing). If none of these is present
and the tiles are opaque labels, fail. This would have caught `qe4c5gevv` and
`qszpxymg7`.

**Blind spots — named honestly:**

1. **Assertion 1 cannot catch the Item-41 *class* it was imagined for.** Item 41
   was actually correct, but had it been wrong (correct value not offered), the
   check would still pass — because "is the answer selectable" ≠ "is the offered
   answer arithmetically correct." Catching a *wrong value among plausible values*
   requires **independently recomputing each problem's maths**, which a static
   guard cannot do without a per-question solver. This is the check's fundamental
   limit, not a tuning gap.
2. **Assertion 2's "self-describing tiles" test is heuristic.** "Lion/Zebra"
   (opaque) vs "even+even" (self-describing) vs "eight hundred" (self-describing
   value) cannot be separated purely by "contains a digit." A digit-only rule
   would miss `qe4c5gevv` correctly but risks flagging word-number tiles
   (`q35yygrd3`) as false positives. The guard must treat *world-knowledge sorts*
   (am/pm, area/perimeter, certain/impossible) as answerable — which is a
   semantic judgment it can only approximate. Over-strict → 14 false positives
   (shown above); over-loose → misses the real 2. It should flag for **human
   review**, not hard-fail, on the ambiguous middle.
3. **Neither assertion covers `fill-blanks`, `expression`, `order`,
   `sequence-build`, `line-plot`, `construct`.** Their "answerability" failure
   modes differ (e.g. an estimate with no single correct string) and are out of
   scope for this guard. A guard that silently folded them into a "pass" would be
   worse than none — it must explicitly report which types it does and does not
   cover.

---

## Task E — Item 49: the un-enriched lesson

Enrichment measured as three per-question frontmatter signals.

**Un-enriched candidate — `lessons/incoming/Multiply_two-digit_by_two-digit_word_problems__1to1.html`:**

| metric | value |
|---|---|
| questions | 26 |
| `hint:` | 26/26 (100%) |
| `whyWrong` | 0/26 (0%) |
| solution/walkthrough | 0/26 (0%) |

**Baseline — a known-good `_remix` lesson, `lessons/incoming/box_multiplication_remix.html`:**

| metric | value |
|---|---|
| questions | 25 |
| `hint:` | 25/25 (100%) |
| `whyWrong` | 0/25 (0%) |
| solution/walkthrough | 0/25 (0%) |

**On these three metrics the two lessons are INDISTINGUISHABLE (both 100 / 0 / 0).**
So this comparison does **not** show the 1to1 lesson to be under-enriched relative
to a remix — the remixes carry no `whyWrong`/`solution` either.

**Important context so this is not misread (measured, not laundered):**
`whyWrong`/`solution` (the §13 pack) exist in only **19 of 103 lessons**; the
other ~84 — including all four `_remix` lessons I sampled — sit at 0%/0%. The §13
enrichment and the "remix rewrite" are **different things**: the three metrics
track §13, not the remix pass. For a *true* enriched contrast, the closest
topical §13 twin is **`lessons/multiply_2digit_by_2digit.html`** (a source lesson,
not a remix): **25 q · hint 100% · whyWrong 18/25 (72%) · solution 25/25 (100%)**.
Against *that*, the 1to1 lesson is clearly missing the §13 pack — but so is most
of the corpus. `verify-content-guards.js` runs `--hint-leak-only` in `npm test`,
so `whyWrong` coverage is not gated, which is why 84 lessons pass at 0%.

**What the numbers do and do not say:** the 1to1 lesson has full hint coverage
and no §13 pack; by the §13 pack it is un-enriched, but it is *not an outlier* —
it matches every remix on these axes. Whether it lacks the *remix rewrite*
(question variety/distractor quality) is **not measurable from these three
fields** and is UNMEASURED here.

---

## Anything noticed but not acted on

1. **Item 41 (`q86pfikqr`) is not a defect** — figure, answer presence, and
   arithmetic all check out. The reported "unanswerable" was a reviewer
   mis-decomposition of a correct figure. Flagged plainly rather than accepted.
2. **The engine grades select options by data-val → text → 1-based position**
   (`:745`, `:989`). Any future "answer-in-options" guard MUST use this rule; a
   naive text match yields ~114 false positives.
3. **`whyWrong` coverage is ungated** — `npm test` runs
   `verify-content-guards.js --hint-leak-only`, so §13.4's "whyWrong mandatory
   for every distractor" is not enforced corpus-wide; 84/103 lessons are at 0%.
   Observation only.
4. **The two genuinely-broken categorize questions share one file**
   (`bar_graphs_remix.html`) and one shape (a bar-chart stimulus that was never
   authored into the body, surviving only in `explain:`). A fix is one file, two
   questions — not a corpus sweep. (Stated as scoping fact; no fix applied.)
5. **`qk77nuxaf`** (area-and-perimeter-word-problems) and several am/pm and
   perimeter categorize questions are *near-misses* to the defect shape but are
   answerable from the tile text itself. Named and rejected, not folded into the
   count.

---

## Confirmation — nothing changed except this report

No frontmatter, figure, option, engine, tool, or guard was modified. No guard was
written. `docs/audits/` already existed; this report is the single permitted
write. Nothing staged, committed, or pushed. `git status -sb` evidence follows in
chat.
