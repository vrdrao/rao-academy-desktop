# BRIEF-G3-LESSON1-REWRITE — whyWrong stops naming the answer; solutions become printed facts

**Chat-authored. Execute verbatim. Do not commit. Do not push. Do not regenerate
the review page. Touch exactly one file:
`lessons-g3/multiplication_facts_up_to_10.html`.**

**Do not touch `preview-engine.js`, `rao-card.js`, `solution-renderer.js`,
`rao.css`, `rao-card.css`, or anything under `lessons/`.** Engine work for this
ruling is a separate brief (`BRIEF-G3-ENGINE-1`) and is NOT part of this one.

---

## 0. WHAT THIS IS AND WHY

Two Venkat rulings, both made 2026-07-21 after reviewing the rendered lesson:

**Ruling C — a `whyWrong` message names the misconception, never the answer.**
Reasoning: if tapping a wrong option tells the child the right answer, guessing
becomes cheaper than thinking. The child should learn what was wrong with their
choice and still have to find the answer — or choose to open the solution.

**The solution format ruling — solutions print the facts, never a method.**
Reasoning, his words: the current Q1 solution explains 7 × 8 by splitting 8 into
4 + 4 and doubling, which is the distributive property — taught in Grade 5 or 6.
A Grade 3 child who does not know 7 × 8 does not know "double 28" either. He
asked for the times table printed up to the fact needed, and nothing else.

**This SUPERSEDES an earlier ruling.** On 2026-07-20 he ruled *"solution blocks
may run 2–3 steps, do not trim them"* after seeing the step-by-step panel. He has
overruled it for Grade 3 multiplication. **Record the supersession in
`docs/ISSUES.md` — do not silently drop the old rule**, or a future session
restores multi-step solutions as a regression.

---

## 1. MEASURE FIRST — stop conditions

Report before changing anything:

1. Question count, and the type of each.
2. Total `whyWrong` entries, and the count per question.
3. Of those entries, how many contain their question's correct answer as a whole
   numeric token. **List them by question and option key.**
4. Count of `step`, `takeaway`, `verification` blocks across the file.

**STOP and report, changing nothing, if any of these is false:**

- 30 questions, type mix 14 single-select / 6 fill-blanks / 3 multi-select /
  4 categorize / 3 order.
- 46 `whyWrong` entries total.
- **21** entries contain the correct answer as a whole numeric token.
- 60 `step`, 30 `takeaway`, 30 `verification`.

**These numbers came from a prior read-only measurement of this same file. If
they have moved, something changed underneath and this brief is operating on a
stale premise. Stop.**

---

## 2. TASK A — rewrite the 21 leaking `whyWrong` messages

**Only the 21 identified in §1.3. The other 25 already comply — do not touch
them.**

Each rewritten message must:

- Name **what the child's wrong option actually is**. Q1's `54` is 6 × 9. Q13's
  `32` is 8 × 4.
- Name **the relationship to what was asked**, without stating the answer.
  "Right family, wrong pair." "One seven short." "That is the eights, not the
  sevens."
- **Never contain the correct answer as a whole numeric token.**
- Stay to **one or two short sentences**. Grade 3.
- Keep the existing `code:` value unchanged. **Only `message:` changes.**

**Worked example, Q1, option `54`:**

- Before: `54 is 6 x 9. Seven eights land on 56 — one more eight past 48.`
- After: `54 is 6 × 9. Right family, wrong pair — you need eights, not nines.`

**Note the `x` → `×` correction** in that example. Apply it wherever a bare
lowercase `x` is used as a multiplication sign in any `message:`. Report how many
you fixed.

**Self-check every rewritten message** against its question's correct answer,
whole-token match. **Report the count that still contain it. It must be 0.**

Also report the **naive raw-substring count** — messages where the answer's
digits appear inside another number or word — and trace each to its question and
option. **A report giving only the flattering number is incomplete.**

---

## 3. TASK B — rewrite all 30 `solution:` blocks

Replace every existing `solution:` block. **Delete all `step`, `takeaway` and
`verification` blocks from this file.** The new blocks use `type: table` and
`type: facts` per `BRIEF-G3-ENGINE-1` §Change 5.

**`BRIEF-G3-ENGINE-1` ships the renderer and runs BEFORE this brief.** Confirm
`solution-renderer.js` dispatches `table`, `facts` and `rule` before starting. **If
it does not, STOP — the engine brief has not landed and this brief is premature.**
**Do not implement the renderer here.**

### The five shapes — 11 + 2 + 4 + 8 + 5 = 30

**Every assignment and every parameter below was derived in Python against the
measured question list. Verify them; do not re-derive by eye.**

**Shape 1 — one table.** Q1–6, 12, 13, 14, 19, 20 (11 questions).
One `table` block, one entry in `tables`, `mark` on the target row. `upTo` is the
smallest value reaching the fact. `note` ONLY on Q12–14 (missing factor) and
Q19, 20 (word problems) — one plain sentence naming what to count. **Q1–6 get no
`note`: the table alone.**

**Shape 2 — two tables side by side.** Q17, 18 (2 questions).
Q17: 7×8=56 vs 9×6=54, first is larger. Q18: 9×4=36 vs 6×6=36, **equal** —
the footer must say both land on the same number.

**Shape 3 — one table, gaps shown.** Q24–27 (4 questions). Derived parameters:

| Q | factor | upTo | mark | absent (after row, value) |
|---|---|---|---|---|
| 24 | 6 | 9 | 3, 5, 8 | (6, 40) |
| 25 | 8 | 7 | 3, 4 | (3, 30), (6, 54) |
| 26 | 7 | 9 | 3, 5, 8 | (6, 45) |
| 27 | 9 | 9 | 3, 6, 8 | (4, 40) |

**Q25 carries TWO absent entries** — 30 and 54 both miss the eight table. `absent`
is a list.

**Shape 4 — facts list.** Q15, 16, 21, 22, 23, 28, 29, 30 (8 questions).
Q15/16 and Q21/22/23: `items` are the four option expressions, `mark` the correct
one(s). Q28–30: `items` are the four cards, `footer` states the order.

**Shape 5 — rule.** Q7, 8, 9, 10, 11 (5 questions).
One `rule` block: the rule in one plain sentence, plus `example` as the question's
own pair.

- Q7 (9 × 0) — anything times zero is zero
- Q8 (1 × 7), Q9 (6 × 1) — anything times one stays the same
- Q10 (10 × 7), Q11 (10 × 10) — times ten puts a zero on the end

**These five teach a RULE, not a fact, and must not be tables.** Q7's answer is 0
and no times-table row can produce it. Printing the seven times table to reach
1 × 7 teaches nothing about the ×1 rule. **This corrects an error in the first
version of this brief, which assigned all five to Shape 1.**

### Rules for all three block types

- **Never write a product into frontmatter.** Only `factor`, `upTo`, `mark`,
  `[a, b]` pairs, and `rule` text. The engine computes every product.
- **A `0` operand is legal ONLY inside a `rule` block's `example`.** `table` and
  `facts` reject it.
- **`upTo` is the smallest value that reaches the fact**, except Shape 3 where it
  must clear the largest tile.
- `note` and `footer` are plain Grade 3 sentences. **No method, ever.** No
  splitting, no doubling, no distributive property, no "count on from".
- Use `×`, never `x` or `·`.

### Derive every number in Python

**Every product, every `upTo`, every `mark` index, every `absent` placement is
derived in Python and checked against the question's own answer key. Never mental
arithmetic.** Report the script's output alongside the report.

---

## 4. WHAT MUST NOT CHANGE — protected fields

The lesson file is **UNTRACKED**, so `git diff` has no baseline. **Say that
plainly in the report and verify by field extraction instead** — extract each
field before and after and compare.

Must be byte-identical after:

- 30 questions; type mix 14/6/3/4/3
- every `id:`, every option, every `data-val`
- every `hint:` block — **1 rung each, unchanged**
- every `code:` inside `whyWrong`
- every `explain:` line
- the 25 compliant `whyWrong` messages

Changed by design: 21 `whyWrong` `message:` values, and all 30 `solution:`
blocks.

---

## 5. VERIFY

1. **`build()` returns 30**, every question non-empty markup, 0 empty.
2. **Self-grade 30/30** with the questions' own keys.
3. **Zero `whyWrong` messages contain their answer** as a whole numeric token.
   Report the naive count too, traced.
4. **Zero hint rungs contain their answer** at any position — re-check, the
   ladders were measured clean and must stay clean.
5. **Zero `step` / `takeaway` / `verification` blocks remain** in this file.
6. **Zero products appear in any `solution:` frontmatter.** Grep and prove it.
   The only integers permitted are `factor`, `upTo`, `mark` indices, `[a, b]`
   pairs and `absent` values.
7. **Shape counts:** 11 `table` one-entry, 2 `table` two-entry, 4 `table` with
   `absent`, 8 `facts`, 5 `rule`. **Report the actual counts. They must match.**
8. **Zero occurrences of `·`; zero `₹` outside money; zero bare `x` as a
   multiplication sign.**
9. `npm test` — **and state explicitly that the 29 guards do not scan
   `lessons-g3/`.** Green means Grade 4 did not regress. **It is not validation of
   this file.** Presenting it as validation is a defect in the report.

---

## 6. ISSUES

Append to `docs/ISSUES.md`:

- Ruling C as a new item — `whyWrong` names the misconception, never the answer;
  binding on all Grade 3 lessons; **21 of 46 rewritten in lesson 1**.
- The solution-format ruling as a new item — Grade 3 multiplication solutions are
  printed facts, four shapes, no method blocks.
- **The supersession** — the 2026-07-20 "2–3 steps, do not trim" ruling is
  overruled for Grade 3. **Reference both item numbers so the history is
  traceable.**

**Rows are never deleted, only closed. Item numbers are permanent.** Report the
new highest item number.

---

## 7. WHAT NOT TO DO

- Do not commit. Do not push. Do not regenerate the review page.
- Do not touch the engine, the stylesheets, or anything under `lessons/`.
- Do not implement the `table` or `facts` renderer here.
- Do not touch the 25 compliant `whyWrong` messages.
- Do not touch any `hint:` block.
- Do not tune any count to hit an expected number. **If a count disagrees with
  §1, stop and report.**
- Do not report a green `npm test` as evidence this lesson is valid.
