# BRIEF-1 — ENGINE-FIXES

**Authored chat-side, 2026-07-20. Engine at `rao-master-22`. Scope: Grade 4
only. `lessons-g3/` is out of scope entirely — do not read, count, guard, or
regenerate it.**

---

## 0. Standing rules for this brief

**Guard-first, always.** Every fix below gets a fixture that demonstrates FAIL
before the fix and PASS after. **Both proofs are required and they are
different proofs.** Pre-fix RED (run the assertion against the unfixed engine,
watch it fail) is not the same as a sabotage round-trip (break the fix, watch it
fail, restore). A guard never observed failing is faith, not measurement.

**Measure the cause before fixing it — including this brief's own premises.**
Two prior sessions found the brief's guessed cause was wrong (RENDER-1's C3 was
a tap-target floor, not flush-box CSS; C5 needed no lesson edit at all). If a
Phase 0 measurement contradicts what this brief asserts, **report the
contradiction and stop that item.** Do not fix what the brief describes if the
measurement says something else is happening.

**Anti-laundering.** Unknowns are reported as unknowns. Every number has a
traceable source. Never dress an assumption as a finding.

**Verify at 1280px and 390px** for every visual change. Real touch events for
anything drag-related, never mouse simulation.

**Chase every changed number.** If a count shifts unexpectedly, halt and
reconcile before continuing.

**No pushing.** Commit locally, enumerated, one commit per item. Venkat pushes
after chat audit. Do not run `git push` under any circumstance.

**Note on `.order-slot`:** it carries `transition: border-color .15s`. Wait at
least 250ms after any state change before reading computed style.

**Note on packed CSS:** `rao.css` contains packed one-line CSS blocks. When
editing via str_replace, use zero newline escapes — escape characters have
previously doubled into literal backslash-n and silently broken rules. Verify
every CSS change via `getComputedStyle`, never by inspecting markup.

---

## 1. What this brief does NOT do

Do not touch tile sizing beyond what item F specifies. The 54px/1.125rem
scheme and the 50px `sb-` scheme are **canonical by ruling**. Any note or memory
claiming tiles should be 44px/1.05rem is superseded and must be ignored.

Do not fix lesson content. Do not edit any file under `lessons/`. Every fix in
this brief is engine-side. Content fixes are a separate brief.

Do not touch `raoGeoEngine.js` or the geometry fallback. Separate brief.

---

## Item A — Venn diagram label collision

**Observed:** `review/symmetry_remix.html` Q8. Two circle labels overlap; one is
almost entirely hidden behind "has a horizontal line of symmetry."

### Phase 0 — measure
Print how Venn/categorize circle labels are currently positioned: the emitting
code with line numbers, and the governing CSS. Answer:
- Are labels absolutely positioned, flow-positioned, or SVG text?
- Is there any width constraint or collision handling today?
- How many Grade 4 questions render a Venn/two-circle layout? List file and
  question number for every one.

### Phase 1 — guard RED
Write a fixture asserting that no two Venn labels overlap: get bounding boxes
for both label elements and assert zero intersection. **Run it against the
unfixed engine and show it FAIL.** Print the measured overlap in px.

### Phase 2 — fix
Position each label above its own circle — left label over left circle, right
label over right circle — rather than both crowded at top centre. Constrain each
label's width to its circle's width so long text wraps rather than bleeding
sideways.

**If the measured cause turns out to be something other than positioning,
report it and stop.** Do not apply this fix over a different cause.

### Phase 3 — PASS + sabotage
Re-run the fixture: PASS. Then deliberately break the fix, confirm the fixture
FAILS, restore, confirm PASS. Print all three results.

### Phase 4 — verify every instance
For every Venn question enumerated in Phase 0, screenshot at 1280px and 390px
and confirm no overlap. Print a per-question table.

---

## Item B — pattern chain wraps to a second row

**Observed:** `review/number-patterns-word-problems-remix.html` Q2. The chain
`3 → 6 → 9 → 12 → 15` breaks after 12, orphaning `→ 15` onto row two.

### Phase 0 — measure
- Print the CSS governing these number tiles and arrows.
- Measure the actual rendered width of each tile and arrow, and the available
  container width, at 1280px and 390px.
- **Test the hypothesis explicitly:** is the shared `min-height:44px` /
  min-width tap-target floor (which applies to `.opt, .tile, .order-slot,
  .vs-tile, .bin, .rao-hint, .rao-check`) forcing these display-only tiles
  wider than their content needs? Report YES/NO with measured numbers.
- Count Grade 4 questions rendering a pattern chain. List file and question
  number for each.

### Phase 1 — guard RED
Fixture asserting the chain occupies exactly one row: all tile bounding boxes
share the same `top` value within 2px tolerance. Run against unfixed engine,
show FAIL, print the measured row count and which tile wrapped.

### Phase 2 — fix
Two parts:

**B1 — display-only tiles lose the tap-target floor.** A tile the child never
taps has no reason to carry a 44px minimum. Introduce a way for the engine to
distinguish interactive tiles from display-only ones and exempt the latter.
**This is the fix-the-general-case half** — it removes the cause anywhere else
it bites, not just here.

**B2 — responsive chain sizing.** Scale tiles down toward a legibility floor
before allowing any wrap. Below that floor, wrap deliberately with the arrow
leading the new row rather than orphaning a bare tile.

State the legibility floor you choose and why.

### Phase 3 — PASS + sabotage
As Item A.

### Phase 4 — verify
Every chain question from Phase 0, both viewports. Confirm single row at
1280px; at 390px confirm either single row or a deliberate arrow-led wrap,
never an orphan.

**Regression check:** confirm B1 did not shrink any genuinely interactive tap
target below 44px. Print computed sizes for one interactive tile of each type
(`.opt`, `.tile`, `.vs-tile`, `.bin`) before and after.

---

## Item C — in/out pattern questions render as prose

**Observed:** `review/number-patterns-mixed-review-1to1.html` Q8 reads
"The rule is add 7. If the input is 8, the output is ▢ (3 → 10, 5 → 12, 8 → ?)".
The pattern is strung out as text with a trailing parenthetical after the answer
blank. Input/output patterns are a table concept — rendered as a two-column
table the child scans down and sees the constant jump; as prose it becomes a
reading task.

### Phase 0 — measure
- Enumerate Grade 4 questions whose stimulus is an input→output mapping. Report
  count, files, question numbers.
- **State your detection method and what it can and cannot catch.** A partial
  scan honestly labelled is useful; a scan claiming completeness it lacks is
  not.

### Phase 1 — build the layout
Add a named layout, in the same manner as the existing `round-scaffold`
(`buildRoundScaffold`, `preview-engine.js` ~line 1000, wired ~1589). Name it
`in-out`.

Renders a two-column table: header row `In` / `Out`, then one row per pair,
with the blank in the final Out cell.

**Do not apply it to any lesson in this brief.** Build the layout, prove it
renders, and register it. Retargeting existing questions is content work and
belongs to the content brief.

### Phase 2 — fixture
Add a fixture question using `layout: in-out` to `lessons/_type-coverage.html`
(this is the sanctioned fixture file and the only `lessons/` file this brief may
touch). Prove it renders correctly at both viewports and grades correctly on
fill and Check.

**Corpus ledger:** adding a fixture changes the question count. Print the count
before and after and reconcile the delta exactly. Prior precedent: RENDER-1
added 4 fixtures and the 3,079-vs-3,075 discrepancy was reconciled to exactly
those 4, enumerated.

---

## Item D — sequence stimulus is understated

**Observed:** `review/number-patterns-word-problems-remix.html` Q1. The
instruction "Continue the pattern:" renders at 18px left-aligned; the sequence
`5, 10, 15,` renders in a separate `<p class="seq-strip">` sibling; the blanks
render at 22.4px. The given terms are the stimulus — they are what the child
reads to find the pattern — and they currently look subordinate to the empty
boxes.

BRIEF-0B established `qprompt-solo` does not fire here because its gate
requires ≤5 words **and** at least one maths operator; a comma sequence has
none. This is a deliberate gate, not a missing patch.

### Phase 0 — measure
Print the current `seq-strip` CSS and computed font-size, alignment, and width
at both viewports. Enumerate Grade 4 questions rendering a `seq-strip`.

### Phase 1 — fix
Style `seq-strip` as a stimulus: centred, sized to sit alongside the blanks
rather than beneath them in visual weight. Match the sequence numbers and the
blanks to the same size so `5, 10, 15, ▢ ▢ ▢` reads as one continuous sequence.

**Do not change the `qprompt-solo` gate.** Extending it to comma sequences was
considered and rejected in favour of styling `seq-strip` directly — the gate's
operator condition exists for a reason and widening it risks firing on prompts
it was written to exclude.

State the size you choose and its relationship to the blank size.

### Phase 2 — guard + verify
Fixture asserting `seq-strip` font-size equals blank font-size within 1px, and
that the strip is horizontally centred in its container. RED before, PASS after,
sabotage round-trip. Verify every `seq-strip` question at both viewports.

---

## Item E — sequence-build tile font

**Ruled by Venkat, 2026-07-20:** `.sb-tile` font drops from 1.3rem to
**0.95rem**. The 50×50px box is unchanged. Reason: long labels such as "100th"
crowded the box border at 1.3rem.

This is a design ruling, not a defect fix. Apply it directly.

### Verify
- Computed `.sb-tile` font-size = 0.95rem at both viewports
- `.sb-tile` and `.sb-slot` remain 50×50px
- A placed tile still fits its slot with no clipping
- Screenshot `review/ordinal-numbers-to-100th_remix.html` Q6 at both viewports
- Confirm the longest label in the corpus still fits. **Find the longest
  `sb-tile` label across Grade 4 and report it** — do not assume "100th" is the
  worst case.

---

## Item F — `.tile` and `.order-slot` font-size disagree

**Measured by BRIEF-0B:** `.tile` is 1.125rem; `.order-slot` is 1.3rem. They
appear in the same row and should match. No reason for the difference was found.

### Fix
Reconcile to **1.125rem**, matching `.tile`. Rationale: the tile is the element
carrying visible text in both the resting and placed states; the slot's font
size only matters for its own sizing calculation.

**Before applying, verify this does not change slot geometry.** The `--ow`
overflow calculation uses `1ch`, which is font-size dependent — changing the
slot's font-size will change its computed min-width. Measure slot width before
and after for a long-text tile (e.g. "512 − 288") and a short one. If widths
change materially, report it and stop rather than shipping a silent layout
shift.

### Verify
Computed font-size equal for `.tile` and `.order-slot`. Placed tiles fit slots
cleanly. Empty and filled slot widths still match (no jump on drop).

---

## Item G — `build()` silently drops unrecognised prose elements

**This is the most important item in this brief.**

BRIEF-0A found that `perimeter_missing_side_remix.html` carried the perimeter
value in `<p class="lead">` on all 25 questions. `parseQuestion()` extracts only
named pieces — prompt, explain, figures, answer area — and assembles the card at
`preview-engine.js:1831` from exactly those. **Everything else is discarded with
no warning and `issues: []`.**

An author can write a fact the child needs, commit it, and the engine throws it
away silently. The review page still looks plausible because `explain` quotes
the missing datum after checking. Nineteen questions shipped unanswerable this
way and no automated check caught it.

**This is a class of failure, not an instance. It is live right now for any
element name an author invents.**

### Phase 0 — measure
Print the current `parseQuestion()` extraction logic with line numbers. List
every element class it recognises. Confirm whether `issues` is populated
anywhere for unrecognised content today.

### Phase 1 — guard RED
Create a scratch fixture containing a question with a prose-bearing element the
engine does not recognise (use `<p class="lead">` since it is the known case).
Assert that `build()` reports an issue for it. **Run against the unfixed engine
and show it FAIL** — no issue reported.

Put the fixture under `tools/scratch/` (gitignored), not in `lessons/`.

### Phase 2 — fix
`build()` emits a warning into `issues` when a question contains a
prose-bearing element carrying visible text that no extractor claims.

**Scope carefully.** The warning must fire on genuinely dropped author prose and
must NOT fire on structural markup, whitespace, comments, or elements the engine
intentionally ignores. **A guard that cries wolf gets disabled, which is worse
than no guard.**

Report your definition of "prose-bearing element carrying visible text" and
justify the boundary.

### Phase 3 — PASS + sabotage + corpus run
- Fixture PASSES.
- Sabotage round-trip: break the check, confirm FAIL, restore, confirm PASS.
- **Run the new check across all 118 Grade 4 lessons.** Print every question it
  flags, with file, question number, and the dropped element's content.
- **Expect exactly the 25 `perimeter_missing_side_remix.html` questions.** If
  the count differs, chase it — a larger number may mean real additional
  defects, or may mean the check is too broad. Reconcile before proceeding.
- **Do not fix any lesson it flags.** Report only.

---

## 2. Commit structure

One commit per item, in order A through G. Each commit message names the item
and what was measured. Do not squash. Do not push.

After the final commit, print `git log --oneline origin/main..HEAD` so chat can
audit the enumerated list against this brief.

---

## 3. Report back — enumerated, in this order

1. Item A: Phase 0 measurements, RED result, fix applied, PASS + sabotage,
   per-question verification table
2. Item B: Phase 0 measurements including the tap-target hypothesis verdict,
   RED, fix (B1 and B2 separately), PASS + sabotage, verification, tap-target
   regression check
3. Item C: enumeration with scan limitations stated, layout built, fixture
   renders and grades, corpus ledger before/after reconciled
4. Item D: Phase 0 measurements, size chosen with rationale, RED, PASS +
   sabotage, per-question verification
5. Item E: applied, computed sizes both viewports, longest corpus label found
   and confirmed fitting
6. Item F: slot geometry before/after, reconciliation applied or halted with
   reason
7. Item G: extraction logic printed, RED, fix with scope definition justified,
   PASS + sabotage, full corpus run results, count reconciled against the
   expected 25
8. `git log --oneline origin/main..HEAD`
9. `git status`

## 4. Stop conditions

- **Any Phase 0 measurement that contradicts this brief's stated cause:**
  report it and stop that item. Continue with the others.
- **Item G flagging materially more or fewer than 25 questions:** stop and
  report before committing. Do not tune the check to hit 25 — that would be
  laundering.
- **Item F changing slot geometry materially:** stop that item, report widths.
- If a fix would require touching any file under `lessons/` other than
  `_type-coverage.html`, stop and report.
- Do not push. Do not write a handoff. Do not self-commission follow-up work.
