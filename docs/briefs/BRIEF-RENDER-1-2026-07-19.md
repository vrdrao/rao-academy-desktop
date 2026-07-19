# BRIEF-RENDER-1 — five rendering fixes + Q19 key + ordering enumeration

**Authored:** chat-side, 2026-07-19. **Lane:** E (commits 1–5), L (commit 6),
read-only enumeration (Phase R).
**Invocation:** `Read BRIEF-RENDER-1.md in the repo root and execute it verbatim.`

## Run order tonight — DO NOT run this before its predecessors

1. `BRIEF-FR-2.md` (already staged) → chat audit of its report
2. `BRIEF-AUDIT-KEYS.md` → chat audit of its report
3. **this brief**

This brief lands on the engine AFTER FR-2's bump to `rao-master-21`. Entry
check: `__version` must read `rao-master-21` before commit 1. If it reads
`rao-master-20`, FR-2 has not run — STOP and report.

**If BRIEF-AUDIT-KEYS Phase 0 reported any drag path FAIL on touch:** STOP
before starting this brief and report. A touch-drag emergency outranks
rendering polish and needs its own chat-authored brief first. (UNVERIFIED is
not FAIL — proceed on UNVERIFIED, but restate the UNVERIFIED verdict in this
brief's report so it is not lost.)

## Scope fence

**GRADE 4 ONLY.** `lessons-g3/` untouched. Engine files are IN scope for
commits 1–5 (this is the engine chat's brief). One lesson file is in scope for
commit 6, named there. Nothing else.

Never roll the engine back. All engine edits are forward-only on top of
`rao-master-21`.

## Discipline for every E commit (1–5)

- **Guard first.** A fixture question demonstrating the defect enters
  `review/_type-coverage.html`'s source set. Show the guard RED against the
  unfixed engine — actual FAIL output printed, not described — then fix, then
  PASS. Both proofs, per commit.
- **Verify by computed style and pixel measurement** via Playwright at 1280px
  and 390px, real Chromium. Never by reading markup, never by screenshot
  impression. Note: some slot/tile styles carry transitions (e.g. `.order-slot`
  has `transition:border-color .15s`) — wait ≥250ms before reading
  `getComputedStyle`.
- One commit per item. Each commit message names the defect and its fixture.

---

## COMMIT 1 — line-plot marks: discrete ✕, never a solid block

**Defect:** in filled line-plot columns, adjacent filled slots render as one
continuous purple block. The plot's own key says `✕ = 1 item`; the figure
contradicts its legend and a child cannot count the marks. Seen in
`review/Create_line_plots_remix.html` (`line-plot · 24` in that lesson alone).

**Fix, in the engine's line-plot renderer:** every filled slot renders a
discrete ✕ glyph, visually separated from its neighbours — five stacked marks
must read as five countable ✕s at both viewports. Style the ✕ to match the
key's ✕ so figure and legend agree.

**Measure, don't assume, the cause first:** report whether the block effect
comes from slot background fill, zero gap, or something else — by file:line.

**Guard:** fixture with a column of ≥4 filled slots; assert each filled slot
contains a rendered glyph node and that adjacent marks have non-zero visual
separation (computed style / bounding boxes), not merely that a class is
present.

## COMMIT 2 — line-plot layout: source table beside the plot, responsively

**Defect:** the tally/source table stacks above the plot, so the data the
child is transcribing is off-screen while they build — forced scrolling on
every placement.

**Fix:** at desktop widths, table and plot sit side by side; below a measured
breakpoint they stack. **Measure the breakpoint** — find the narrowest width
at which both render legibly side by side (table not squashed, plot slots
still ≥ the 44px tap-target floor) and set the breakpoint there. Do not guess
768px. At 390px they MUST stack; two squashed figures is worse than scrolling.

**Guard:** fixture asserting side-by-side geometry (bounding boxes
horizontally adjacent) at 1280px and stacked at 390px.

**Scope note:** apply to the line-plot question layout. If the same
table-above-figure pattern exists in other question types, COUNT and report
those instances (lesson + question), but do NOT widen the fix to them in this
brief — that is a follow-up decision for the chat.

## COMMIT 3 — vertical-arithmetic answer blanks: gaps between column boxes

**Defect:** in column-arithmetic fill-blanks (seen in
`review/Multiply_1x3-4digit_REMIX.html`), the per-digit answer boxes render
flush, sharing borders — three boxes read as one segmented box. The columns
are place-value columns; merging them visually destroys the distinction the
layout teaches.

**Fix:** a visible gap between adjacent digit boxes. **Hard constraint: the
boxes must remain column-aligned with the digits above them.** A gap that
shifts the blanks off their place-value columns is a worse defect than the
flush boxes. Verify alignment by comparing x-centres of each box against the
digit column above it, within a small tolerance, at both viewports.

**Guard:** fixture asserting (a) non-zero horizontal gap between adjacent
boxes and (b) x-centre alignment of each box with its column.

## COMMIT 4 — thousands comma: understated and narrow

**Defect:** in vertical arithmetic with thousands separators (seen in
`review/addition-missing-digits.html`, `fill-blanks · 27`), the comma renders
at full digit prominence AND occupies a full digit-width column, pushing
place-value columns apart and breaking vertical alignment.

**Fix, two parts, both required:**
1. Understate: muted colour, lighter weight, smaller size than digits.
2. Narrow: the comma's column shrinks so digit columns close up and align
   vertically across the rows of the sum.

Verify digit-column alignment across rows (top operand, bottom operand,
result/blank row) by x-centre comparison at both viewports.

**Guard:** fixture with a 5-digit sum; assert comma computed font-size/colour
differ from digits AND comma column width is below a measured digit-column
width threshold.

## COMMIT 5 — comparison-figure sizing: cap the multiplier, keep shared scale

**Defect:** in `review/area-and-perimeter-word-problems.html` Q19, two
rectangles drawn to a correct shared scale render oversized (~550px for the
12 m rectangle), dominating the card.

**Cause is UNMEASURED and the class is provisional.** First determine, by
file:line, whether the size comes from (a) the engine's figure renderer
scaling to available width with no cap, or (b) per-question dimensions in the
lesson markup.

- If (a): fix in the engine — cap the rendered size of comparison figures to a
  reasonable fraction of card width, scaling the PAIR by one shared multiplier.
- If (b): this is not an engine defect. Fix the one question's markup, report
  the reclassification to L, and grep the corpus for other questions carrying
  the same oversized per-question dimensions — report the count, fix only
  this one.

**Hard constraint either way: the two figures share ONE scale.** Sizing each
independently would render them visually equal and destroy the question's
point (same area, different perimeter). Assert in the guard that the ratio of
rendered widths equals the ratio of stated dimensions.

**Guard:** fixture with two rectangles of equal area and different dimensions;
assert total figure block ≤ the chosen cap AND rendered-width ratio matches
dimension ratio.

---

## PHASE Q — Q19 VERIFICATION ONLY. NO EDIT. (superseded key fix)

**History:** Venkat's browser showed Q19 of
`review/area-and-perimeter-word-problems.html` stamped `Answer: B` (wrong —
correct is A: A is 12×2, perimeter 28 m; B is 6×4, perimeter 20 m). The
KEY-AUDIT of 2026-07-19 then found the tree's stamped key is ALREADY A, in
both the lesson source and the on-disk review page, with no amendment in git
history. The working hypothesis is a stale browser cache on Venkat's side; he
is hard-refreshing to confirm.

**Therefore: DO NOT EDIT ANY KEY.** Instead verify and report:

1. Grep the source lesson for the prompt snippet `Which one needs MORE fence`
   — require exactly one match; print the question's full stamped key and
   enrichment (hints, explain, whyWrong) verbatim.
2. Recompute both perimeters in Python; confirm the stamped key agrees.
3. Confirm the question's enrichment nowhere asserts B is correct — if any
   hint/explain/whyWrong text contradicts key A, report each line verbatim
   and STOP (do not fix; that would be a new finding needing a ruling).
4. Check git history of the lesson file for any past commit where this key
   read B — report the commit if found, or state plainly that the key has
   been A since first tracked.

If, contrary to the audit, the tree's key reads B: STOP this phase, report,
change nothing — the contradiction between two same-day measurements would
itself be the finding.

No commit from this phase unless something must be recorded, in which case
report first and let the chat rule.

---

## PHASE R — READ-ONLY: enumerate all ordering questions (P-sweep input)

No edits, no commits from this phase. Output feeds tomorrow's P sweep, which
Venkat must audit before it is briefed.

Across all `lessons/` (Grade 4 only), enumerate every `order`-type question.
For each, one table row:

| lesson | q# | prompt snippet (≤80 chars) | direction (asc/desc/other) | tile content (expressions / bare results) | prompt says "work out"? (y/n) | current key |

Then totals:
- order questions total; by direction; by tile content
- **the defect intersection:** count of questions whose prompt says "work
  out" (or equivalent) but whose tiles are bare results
- count of bare-result questions whose values differ in leading digit /
  magnitude (candidates for retargeting to estimation questions rather than
  rebuilding — flag, do not decide)

Full table, every row, no truncation. Write to
`docs/audits/ORDER-ENUM-2026-07-19.md` as a new untracked file.

---

## CLOSING — after commit 5 and Phase Q

- Bump engine `__version` to `rao-master-22`.
- Regenerate ALL 118 review pages (they inline the engine; commits 1–5 changed
  it). Print the regenerated count MEASURED, not asserted.
- Refresh the deploy-drop to md5-match `engine/` sources; pin DEPLOY.md.
- `npm test` green. Full Playwright pass on the five fixture questions plus
  one real affected question per commit, both viewports.
- Archive this brief to `docs/briefs/`.
- **No push.** Commits stay local for chat audit. Venkat pushes the full
  enumerated batch after audit.

## Deviations

Mandatory. Include transient tool errors, any fixture that could not be made
to FAIL pre-fix (that is a broken guard and must be said plainly), and any
place the measured cause contradicted this brief's stated suspicion — the
brief being wrong is reportable, not smoothable.

## Report back

1. Per commit 1–5: measured cause (file:line), pre-fix RED output, post-fix
   PASS, computed-style/pixel verification results at both viewports.
2. Phase Q: the grep match, the stamped key and enrichment verbatim, the
   Python perimeter recomputation, and the git-history answer on whether the
   key ever read B.
3. Phase R: the full table and totals.
4. Closing: regenerated page count, deploy-drop md5 confirmation, npm test
   output.
5. Deviations.
