# BRIEF-CULL-1A — Archive 15 duplicate lesson sources

**Authored chat-side, 2026-07-20. Supersedes BRIEF-CULL-1, which halted
correctly at Phase 0.**

**This brief MOVES files. It does not delete them. It does not push.**

---

## 0. WHY THIS EXISTS

BRIEF-CULL-1 halted at Phase 0 because
`Multiply_two-digit_by_two-digit_word_problems__1to1.html` has **no surviving
twin** — no bare, no `_remix`, no `__remix`. Archiving it would have deleted 26
questions and the lesson would not have returned. **The halt was correct.**

**Ruled: cull 15. That file stays.**

The other 15 each have a confirmed surviving `_remix` or bare sibling, verified
by BRIEF-CULL-1 Phase 0.6. That check does not need repeating.

**Also excluded, unchanged: `estimate-sums-faithful.html`** — the deliberately
re-authored Brief 7.5 proof lesson. Matches the rule by name only.

**Scope fence: Grade 4 only. Do not read, list, or touch `lessons-g3/` or
`sources-g*/`.**

**Do not add gates, checks, or questions beyond what is written here. Execute
and finish.**

---

## 1. THE 15 — exact list, no pattern matching

Move only these from `lessons/incoming/`. Do not re-derive by glob. If any
filename does not exist exactly as written, **STOP and report.**

```
Compare-money-amounts-1to1.html
Time_patterns_1to1.html
Subtraction_missing_digits_1to1.html
am-or-pm_1to1.html
estimate-products_1to1.html
box_multiplication_1to1.html
bar_graphs_1to1.html
even_odd_faithful.html
estimate-sums-differences-products-and-quotients-word-problems-1to1.html
multiplication-patterns-over-increasing-place-values-1to1.html
multiply-a-two-digit-number-by-a-three-digit-number-word-problems__1to1.html
number-patterns-mixed-review-1to1.html
names-for-numbers_1to1.html
select-area-1to1.html
time_units_1to1.html
```

**EXCLUDED — do not move, delete, or regenerate away:**

```
Multiply_two-digit_by_two-digit_word_problems__1to1.html
estimate-sums-faithful.html
```

**Known from BRIEF-CULL-1 Phase 0 — do not re-measure:**

- The 15 hold **347 questions** (373 total minus the 26 in the excluded file).
- Corpus before: **3,015**. Ledger: **3,015** entries.
- Expected corpus after: **2,668**.

---

## PHASE 1 — Move the sources

1. Create `archive/lessons-1to1/` in the repo root.
2. `git mv` each of the 15 from `lessons/incoming/` to `archive/lessons-1to1/`.
   Use `git mv` so history is preserved — **not** delete-and-recreate.
3. Report the 15 moves individually.

**Do not modify `docs/question-ids.json`.** It is append-only. Archived
questions' IDs stay permanently taken and permanently dead.

---

## PHASE 2 — Remove the stale review pages

1. Delete the corresponding 15 `review/*.html` pages.
2. **Do not delete `review/estimate-sums-faithful.html` or
   `review/Multiply_two-digit_by_two-digit_word_problems__1to1.html`.**
3. Report the resulting `review/` file count.

---

## PHASE 3 — Regenerate

1. Regenerate every remaining review page:
   `node tools/make-review.js lessons/<file>.html` — one call per lesson, across
   `lessons/` and `lessons/incoming/`. Report attempted / succeeded / failed.
2. Re-run the `*1to1*` / `*faithful*` scan on `review/`. **Expect exactly TWO
   matches:** `estimate-sums-faithful.html` and
   `Multiply_two-digit_by_two-digit_word_problems__1to1.html`. If any of the 15
   reappeared, **STOP and report.**
3. Report the new `review/` file count.

---

## PHASE 4 — Chase the changed number

**Never tune a count to hit an expected value.**

1. New corpus count from the grading gate's own independent count.
2. **Reconciliation: 3,015 − 347 = 2,668.** Report all three numbers and state
   whether the measured new count equals 2,668. **If it does not reconcile,
   STOP and report the discrepancy without adjusting anything.**
3. Run `node tools/verify-question-ids.js`. Report the result.
4. Confirm `docs/question-ids.json` still holds **3,015** entries. It must not
   shrink. **If it shrank, that is a halt.**

---

## PHASE 5 — Full suite

1. **Stage all new and moved files first** — `verify-tracked.js` fails on
   untracked files.
2. Run `npm test` unpiped. Report exit code and named guard results. **Never
   pipe in a way that masks output or exit code.**
3. Run each guard individually and name it with its exit code.

**If any guard fails, STOP and report. Do not fix. Do not tune a guard to
pass.**

---

## PHASE 6 — Commit, local only

One commit:

```
BRIEF-CULL-1A: archive 15 1to1/faithful duplicate lessons
```

Report the commit hash, file count, insertion/deletion totals, `git status -sb`,
and the ahead-count.

**DO NOT PUSH.**

---

## 2. WHAT NOT TO DO

- **Do not push.**
- **Do not touch the two excluded files** in any directory.
- **Do not touch `lessons-g3/` or `sources-g*/`.**
- **Do not modify or shrink `docs/question-ids.json`.**
- **Do not delete the 15 sources** — `git mv` to archive only.
- **Do not tidy the untracked `BRIEF-*.md` files.**
- **Do not fix any defect found along the way.** Report it in one line.
- **Do not tune any count, guard, or check to match an expected number.**
- **Do not propose follow-up work.** Report and stop.

---

## 3. REPORT FORMAT

One report, one section per phase. Keep it short — numbers and outcomes, not
narrative.

**Phase 4's reconciliation (3,015 − 347 = 2,668) is the single most important
output. Report it explicitly.**
