# LAYOUT-SCAN — the Item 29/39/40/42/46/47 bundle + Item 52, measured

**BRIEF-PUBLISH-1 Task B1 (+ Task C). Executed 2026-07-21.** Counts drive whether
each item is worth fixing. Grade 4 only (`lessons/**`, `_preview` skipped);
static scan for figure counts, browser `getBBox`/`getComputedStyle` for geometry
and rendering. Corpus: 103 lessons, 2,668 questions.

**Outcome (Venkat's ruling 2026-07-21):** fix the three single-question figures
(40, 46, 47); close Item 42 as not-a-defect (0 affected); **defer Items 29, 39,
and 52** — each needs a shared-CSS/engine change affecting all 2,668 questions —
to a focused styling pass.

---

## Item 29 — multi-expression prompts run horizontally; must stack

**Count: UNMEASURED (signature not statically decidable).** "Multi-expression
prompt" has no clean mechanical signature — it needs a visual pass to define which
prompts qualify. The stacking fix is a shared-CSS/engine change. **Deferred with
39 and 52.** Lane E.

## Item 39 — comparison figures stack vertically; must sit side by side

**Count: 13 questions** carry 2+ top-level `<svg>`/`<figure>` in the body
(options/tiles lists excluded):

| id | file | figures |
|---|---|---|
| qzrgxzr9e | find_the_probability.html | 2 |
| qh9vkk9xb | incoming/Count_vertices__edges_and_faces.html | 3 |
| qggmw4vj3 | incoming/Count_vertices__edges_and_faces.html | 4 |
| qw5spzezy | incoming/identify-three-dimensional-figures.html | 4 |
| qxtf49ufw | incoming/Multiply_1x2_remix.html | 3 |
| qvmn5ay9v | incoming/Multiply_1x2_remix.html | 3 |
| qhxhxzxak | incoming/Multiply_1x2_remix.html | 3 |
| qa7s2e2be | incoming/perimeter_missing_side_remix.html | 3 |
| qq2r3bysm | incoming/simple-fractions-parts-of-a-group.html | 3 |
| qfzxggbwz | incoming/simple-fractions-parts-of-a-group.html | 3 |
| qidwas8n3 | incoming/Understanding_probability_remix.html | 3 |
| qs52re9b8 | incoming/Understanding_probability_remix.html | 3 |
| q9he8br3m | make_predictions.html | 2 |

The figures are un-wrapped siblings in `.qbody`; side-by-side needs a shared
responsive rule (flex/grid + a wrapper) touching every question. **Deferred.**
Lane E. **Stays open.**

## Item 40 — `q86pfikqr` dimension labels collide with the boundary — FIXED

**Count: 1 question.** `getBBox` measured two labels ~3px inside the L-shape
stroke: left "4 cm" (right 57 vs shape-left 54) and lower-right "2 cm" (left 267
vs shape-right 270). Font renders at authored 19px (figure not auto-scaled), so
this is **positional, not size** — `dim-label` counter-sizing would enlarge to
20px and worsen it. Fixed by nudging the two labels outward (x 35→28, x 289→297);
both clear the boundary (verified by `getBBox`). The notch "2 cm" labels sit in
the L's concave void (no stroke), which is correct placement.

## Item 42 — options single-column; should be 2×2 — NOT-A-DEFECT

**Count: 0 of 1,647 select questions.** `getComputedStyle(...).gridTemplateColumns`
at tablet width (820px), for every select question with ≥3 options, computed to
2+ columns. `repeat(auto-fit, minmax(150px,1fr))` already delivers 2×2; single
column at phone width (390px) is correct. **Does not manifest — closed
not-a-defect.** (As anticipated: Items 33 and 41 also measured zero.)

## Item 46 — `q8nhv3ty3` y-axis interval too fine — FIXED

**Count: 1 question** with a 5-step y-axis (21 tick labels, 0…100). Removed the 10
intermediate odd-multiple-of-5 gridline+label pairs → a 10-step axis (11 labels)
matching sibling `qpwstmk82`. Bars unchanged (same 168px/100 scale).

## Item 47 — `qpwstmk82` legend clipped — FIXED

**Count: 1 question.** Legend text at x=412 (`Cats`/`Dogs` → ~432) overflowed the
`viewBox` width 430 and the SVG overflow-clip cut the final letter. Widened
`viewBox` `0 0 430 232` → `0 0 448 232`; all coordinates unchanged.

---

## Item 52 (Task C) — Check reachable at 390×844 without scrolling

**Count: 64 of 2,642 questions (2.4%)** render the Check button >844px from the
card top at 390×844. The tallest are figure-heavy — `identify-three-dimensional-figures`
(up to 1,611px), `box_multiplication_remix` (up to 1,093px), `frequency_tables`
(1,196px). **Many are legitimately tall content**, so the fix is a
sticky/reachable Check button, NOT shortening content — a shared-CSS/engine change
affecting all questions. **Deferred to the focused styling pass.** Non-zero, so
Item 52 **stays open** with this count.
