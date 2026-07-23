# BRIEF-G3-ENGINE-1 — five changes to the shared answering loop, one fixture

**Chat-authored. Execute verbatim. Do not commit. Do not push. Do not regenerate
review pages. Do not touch any file under `lessons/` or `lessons-g3/`.**

---

## 0. WHY THIS BRIEF IS DANGEROUS

`rao-card.js` is the shared answering loop. **All 2,668 Grade 4 questions and
every Grade 3 question run through it.** Grade 4 is pushed, closed and approved.
**Any regression here breaks approved, shipped content.**

**Three of the five changes deliberately reverse a documented law** written in
the file's own header comment. Each reversal MUST amend the law text in the same
change. If the code and the comment disagree, a future session reads the comment
and restores the old behaviour as a "fix". **Amending the comment is not
optional and is not cosmetic — it is the durability of the change.**

**Report the unflattering number.** If an assertion passes only weakly, say so
with the number. Never loosen an assertion to make it pass.

**If any measurement in §1 disagrees with what this brief asserts, STOP and
report. Do not adapt the brief to the file. Chat's premises have been wrong
repeatedly and this brief may be wrong too.**

---

## 1. MEASURE FIRST — stop conditions

Report these before changing anything:

1. `rao-card.js` total line count.
2. Quote lines 25–45 verbatim (the numbered law block).
3. Quote line 200 verbatim (the walkthrough action-row entry).
4. Quote `openWalkthrough()` in full.
5. Quote `celebrate()` and `takeawayText()` in full.
6. Every line number where `cc-hastake` is added.
7. Every occurrence of the string `Walk me through it` with line numbers.
8. `solution-renderer.js`: quote the block-type `switch` in full, quote
   `walkChip()`, quote `walkBody()`.

**STOP and report, changing nothing, if any of these is false:**

- The law numbered **5** in the header does NOT say the `whyWrong` message is
  the next hint rung.
- The label `Walk me through it` does NOT appear at `:200`.
- `cc-hastake` is added at fewer than two distinct sites.
- `solution-renderer.js` does NOT dispatch block types via a `switch` on
  `block.type`.

---

## 2. THE FIVE CHANGES

### Change 1 — button label (ruling A)

`Walk me through it` → **`Show me the solution`**.

Change it at `:200` AND in the law comment at `~:34`. **Both. Grep afterwards to
prove zero remaining occurrences of the old string in `rao-card.js`.**

Rationale to record in the commit message: the old label read as an extension of
the hint ladder; children were expected to mistake it for "hint 3".

### Change 2 — `whyWrong` gets its own identity (ruling B, Item 66)

**This REVERSES law 5.** Law 5 currently states the `whyWrong` message after a
wrong attempt IS the next hint rung, sharing the `Hint n` numbering.

New behaviour:

- A `whyWrong` message renders with the chip text **`Not quite`**, never
  `Hint n`.
- A `whyWrong` message **does not increment `hintNum`**. If the child has used no
  hints, the next hint they request is still `Hint 1`.
- Visually distinct from a hint bubble: use the existing warning role tokens
  already available in the stylesheet. **Do not invent a new colour.** If no
  warning-tinted bubble class exists, add one in `rao-card.css` derived from the
  existing bubble class — same geometry, different tint. Report which class you
  used and whether you created it.

**Amend law 5** to state that `whyWrong` and hints are two separate streams with
separate labelling, and record why: two adults on this project misread a
`whyWrong` message as a leaking hint rung on consecutive days, and a child would
misread it every time.

### Change 3 — hint bubbles clear when the solution opens (Item 63)

**This REVERSES law 4** ("HELP ACCUMULATES — nothing the card has told the child
disappears while the question lives").

In `openWalkthrough()`: the accumulated hint/`whyWrong` bubble container is
removed or hidden at the same point the hint button is hidden. The solution panel
becomes the only thing on screen below the question.

**The no-repaint law is NOT violated and must not be violated: the question DOM
above the bubble stream is untouched.** Do not rebuild the question. Do not
re-render options. Report which element you removed and prove by selector that
the question body was not re-created.

**Amend law 4** to name the walkthrough as the one sanctioned exception.

### Change 4 — correct answer shows nothing by default (Item 65)

**This REVERSES law 7** ("CORRECT is the only loud moment: ... takeaway panel
...").

In `celebrate()`:

- The `.cc-take` panel is **not rendered** on the correct path.
- **`cc-hastake` MUST still be added to `qbody`.** This is the trap: that class
  is what suppresses the duplicate `.explain`. Remove the panel and drop the
  class and `.explain` reappears, swapping one block of text for another and
  defeating the entire ruling. **`.explain` must stay suppressed.**
- The green paint, `cc-win`, sparks and chime are **unchanged**. The correct
  answer stays a loud, happy moment. Only the text panel goes.
- The action row gains a second button: **`Show me the solution`**, ghost style,
  alongside `Next question →`. It calls the same solution-rendering path.
  **It is only offered when `canWalk()` is true.** A question with no `solution:`
  block offers `Next question →` alone.

**`openWalkthrough()` sets `locked` and `setOutcome("solved-with-help")`. The
correct path must NOT do that.** A child who answered correctly and then chose to
read the solution has outcome `correct`, not `solved-with-help`. **If reusing
`openWalkthrough()` would overwrite the outcome, extract the rendering into a
shared function and call it from both paths with the outcome set separately.**
Report which approach you took.

**Amend law 7.**

### Change 5 — three new solution block types: `table`, `facts`, `rule`

Added to `solution-renderer.js` alongside `step`, `figure`, `takeaway`,
`verification`. Between them they cover all 30 questions in lesson 1:
**11 + 2 + 4 + 8 + 5 = 30. The question counts and every derived parameter below
were computed in Python against the measured question list, not assumed.**

**In every case the engine computes every product. The author never supplies a
product.** This is the whole point: a typo'd times table becomes impossible
across ~110 lessons authored by a team, and a guard can verify every table in the
corpus. **Never accept a pre-computed product from frontmatter. If a block
carries one, ignore it and report it.**

#### `table` — one or two times tables

```yaml
solution:
  - type: table
    tables:
      - factor: 6
        upTo: 5
        mark: [5]
    note: Five packets of six, so count five sixes.
```

- `tables` is a list of **1 or 2** entries. Two entries render **side by side**.
- Each entry: `factor` (integer 1–12), `upTo` (integer 1–12), `mark` (list of
  multipliers whose rows are highlighted).
- `note` is optional plain text, rendered **above** the tables.
- `absent` is optional, per table: **a list** of `{ after: n, value: v }`.
  Renders a marked-absent line reading `v is not here` **between** row `n` and
  row `n+1`, in the danger role. **This is how a categorize question shows the
  gap. A table may carry more than one — Q25 carries two.**
- `footer` is optional plain text, rendered **below** the tables.

Covers **Shape 1** (11 questions: Q1–6, 12–14, 19, 20 — one table, one mark),
**Shape 2** (2 questions: Q17, 18 — two tables, footer states the comparison),
**Shape 3** (4 questions: Q24–27 — one table, several marks, one `absent`).

#### `rule` — a stated rule, no table

```yaml
solution:
  - type: rule
    text: Any number times zero is zero.
    example: [9, 0]
```

- `text` is the rule in one plain Grade 3 sentence. Required.
- `example` is an optional `[a, b]` pair, rendered beneath as `a × b = product`
  with the product **computed by the engine**. `b` may be `0` here — this is the
  ONLY block type where a `0` operand is legal.
- Rendered as the sentence, then the worked example line in the same monospace
  style as the other block types, marked.

Covers **Shape 5** (5 questions: Q7, 8, 9, 10, 11).

**Why this exists.** Q7 is 9 × 0, Q8 is 1 × 7, Q9 is 6 × 1, Q10 is 10 × 7, Q11 is
10 × 10. **These teach a rule, not a fact.** No `factor × multiplier` in 1–12
produces 0, so Q7 cannot be a table at all. And printing the seven times table to
reach 1 × 7 teaches nothing about the ×1 rule — the rule is the lesson. **A table
is the wrong instrument for all five.**

```yaml
solution:
  - type: facts
    items:
      - [2, 3]
      - [4, 4]
      - [3, 8]
      - [6, 6]
    footer: "Smallest to largest: 6, 16, 24, 36."
```

- `items` is a list of `[a, b]` pairs. Each renders as `a × b = product`, product
  computed by the engine.
- `mark` optional: list of 0-based indices whose rows are highlighted.
- `note` and `footer` optional plain text.

Covers **Shape 4** (8 questions: Q15, 16, 21, 22, 23, 28, 29, 30).

#### Rendering, both types

Monospace rows, one fact per line. Marked rows carry a tint plus medium weight
using **existing success-role tokens**; absent lines use **existing danger-role
tokens**. **Do not invent a colour.** Report which tokens you used.

**ALIGNMENT IS LOAD-BEARING.** The column of `=` signs running down the table is
what a child's eye follows; a table whose rows do not line up teaches worse than
no table. Therefore:

- **Every row carries identical horizontal padding**, marked or not. A marked row
  differs from an unmarked row in background and weight ONLY — never in position.
- **The absent line is not indented.** It sits in the same column as every other
  row and is distinguished by colour alone.
- **Verify the weight does not shift the glyphs.** Marked rows are medium weight,
  unmarked are regular. In most monospace faces both weights share an advance
  width, but not all. **Measure the actual font loaded by `fonts.css` for
  `--font-mono`.** If the two weights differ in width, drop the weight change and
  keep the tint alone — do not keep a treatment that breaks alignment. **Report
  which font was measured, both advance widths, and which option you took.**

#### Validation, both types

Every integer must be an integer in 1–12. `mark` indices must exist. A `tables`
list must have 1 or 2 entries. **On any invalid block: render nothing for that
block and report it. Do not throw. Do not render partially.**

Chip labels in the walkthrough stepper: `table` → **`The times table`**;
`facts` → **`The facts`**; `rule` → **`The rule`**.

**Known and accepted:** most of these solutions are a single block, so the
stepper types one block and goes straight to the reveal. That is intended — these
panels are meant to be short.

---

## 2A. THE EXISTING GUARDS — re-pointing is IN SCOPE, weakening is NOT

**Three of the five changes reverse laws that existing guards assert. Those
guards must be re-pointed in this same change. This is authorised.**

Measured, and confirmed by Claude Code before this section was written:

| Change | Guard that goes red | Site |
|---|---|---|
| 1 — new label | `verify-calm.js`, `verify-touch.js`, `verify-reset.js` | `:691`/`:693`, `:275–280`, `:830` |
| 2 — `whyWrong` chip | `verify-calm.js`, `verify-touch.js` | `:187` |
| 4 — no `.cc-take` on correct | `verify-calm.js` | `:545`, `:553–554` |

**Verify these sites yourself before editing. If any has moved, report it.**

### The distinction that governs every edit here

- **Tuning** — weakening an assertion so a defect slips through. **Forbidden.
  §5 stands.**
- **Re-pointing** — a guard that correctly asserted the old law now correctly
  asserts the new one. **Required.** A guard left asserting a repealed law is not
  rigour; it is a guard testing behaviour the product no longer has.

### The constraint — every re-pointed assertion ends STRICTER

**Not equivalent. Stricter.** Specifically:

- **Label guards** — assert the new string appears AND assert the old string
  appears nowhere in `rao-card.js`. Two conditions where there was one.
- **Chip guard** (`:187`) — assert the wrong-attempt bubble reads `Not quite`,
  AND that a hint requested afterwards still reads `Hint 1`. Two where there was
  one. **The second is the assertion that proves numbering was not consumed;
  without it the guard is weaker than before and the change is a defect.**
- **Correct-path guard** (`:545`, `:553–554`) — the old assertion required
  `.cc-take` present. Replace with four: **no `.cc-take`**, **no visible
  `.explain`**, **`cc-hastake` present on `qbody`**, **`.cc-win` present**. Four
  where there was one. **Do not simply delete the old assertion.**

### Report this explicitly

For each guard touched: **the assertion count before, the assertion count after,
and what each new assertion catches that the old one did not.** If any guard ends
with fewer or weaker assertions than it started, **stop and report — that is a
defect in this change, not an acceptable cost of it.**

**Do not touch any guard not listed above.** If a fourth guard goes red, stop and
report rather than editing it.

---

## 3. THE FIXTURE — six assertions

One new fixture file. **Stage it before running `npm test`** — `verify-tracked.js`
fails on untracked files.

**Guard-first. Both proofs required, and they are different proofs:**

- **Pre-fix RED** — every assertion below must be demonstrated FAILING against
  the current engine before any change is made. Report the failure output.
- **Sabotage round-trip** — after the fix passes, reintroduce each defect one at a
  time and prove the corresponding assertion goes red. **Disclose any sabotage
  that failed to turn the assertion red, with its number.** A discriminator that
  does not discriminate is worse than no guard.

Assertions:

1. **Label.** The offered button reads `Show me the solution`. Zero occurrences
   of `Walk me through it` anywhere in `rao-card.js`.
2. **`whyWrong` identity.** After one wrong attempt: the bubble chip reads
   `Not quite`, not `Hint 1`. Then request a hint: that chip reads `Hint 1`.
   **Assert both. The second is the one that proves numbering was not consumed.**
3. **Bubbles clear.** Hint/`whyWrong` bubbles present before the solution opens,
   **absent after**. Assert the question body element is the same node before and
   after (no repaint).
4. **Correct path is quiet.** On a correct answer: no `.cc-take` panel AND no
   visible `.explain`. Assert `cc-hastake` IS present on `qbody`. Assert
   `.cc-win` and the green paint ARE present.
5. **Reveal works, outcome preserved.** Tapping `Show me the solution` from the
   correct path renders the full solution. **Assert the recorded outcome is still
   `correct`, not `solved-with-help`.**
6. **Cap-out path unchanged.** Two wrong attempts still auto-open the full
   walkthrough with no tap required, outcome `shown-answer`. **Item 50's fix
   lives on this path and must not become collateral damage.**

Plus render tests for the two new block types, one per shape:

- **Shape 1** — one table, `factor: 6, upTo: 5, mark: [5]`: exactly 5 rows, last
  reads `6 × 5 = 30`, only that row carries the marker class.
- **Shape 2** — two tables: both render side by side, each marks its own row,
  `footer` renders below both.
- **Shape 3** — one table with **two** `absent` entries,
  `[{after: 3, value: 30}, {after: 6, value: 54}]` on `factor: 8, upTo: 7`: both
  absent lines render, each between the correct pair of rows, each carrying the
  danger class, neither counted as a table row. **Two, not one — Q25 needs it.**
- **Shape 5** — a `rule` block with `text` and `example: [9, 0]`: the sentence
  renders, the example line reads `9 × 0 = 0`. **Assert a `0` operand is accepted
  here and rejected by `table` and `facts`.**
- **Shape 4** — `facts` with four pairs: four rows, products computed correctly,
  `footer` renders below.
- **Invalid input** — a block with `factor: 0`, and a second with a `mark` index
  that does not exist: each renders nothing, is reported, and **does not throw**.
  Assert the surrounding solution still renders.
- **Alignment** — in a table with both marked and unmarked rows, assert via
  `getBoundingClientRect()` that **every row's text begins at the same x
  coordinate**, marked and unmarked and absent alike. **Assert on computed
  geometry, never on markup.** This assertion must be shown to go red if the
  marked rows are given extra horizontal padding.

**Derive every expected product in Python. Never mental arithmetic.**

**Assert that a product supplied in frontmatter is ignored.** Author a block
carrying a wrong pre-computed product and prove the rendered row shows the
engine's computed value, not the authored one.

**Visibility law:** assert the `Show me the solution` button is visible after a
real tap at **390×844** and **360×780**. **Real CDP touch events, never mouse
simulation.**

---

## 4. AFTER

- `npm test` — full suite, 29 guards plus the new fixture. **Report the count and
  exit code. Do not pipe in a way that masks the exit code.**
- **Report the §2A before/after assertion counts for each of the three
  re-pointed guards.** A green suite achieved by weakening a guard is a failed
  run, not a passed one.
- **State explicitly that these guards do not scan `lessons-g3/`.** Green means
  Grade 4 did not regress. It is not validation of any Grade 3 lesson.
- Append rows to `docs/ISSUES.md` closing Items 63, 65, 66 and logging the new
  button label. **Never delete a row; close it.** Report the new highest item
  number.
- Report every file changed, staged status, and confirm nothing was committed or
  pushed.

---

## 5. WHAT NOT TO DO

- Do not commit. Do not push. Do not regenerate review pages.
- Do not touch any lesson file.
- Do not "tidy" unrelated code in the files you are editing.
- Do not tune any assertion to hit an expected number. **Re-pointing the three
  guards named in §2A is authorised and is not tuning — but every re-pointed
  assertion must end stricter, per §2A.** Touching any other guard is not
  authorised.
- Do not report a green suite as evidence that a Grade 3 lesson is valid.
- **If a law reversal cannot be made without also amending its comment, stop and
  report rather than changing the code alone.**
