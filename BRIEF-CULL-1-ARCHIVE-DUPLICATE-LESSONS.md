# BRIEF-CULL-1 — Archive 16 duplicate lesson sources

**Authored chat-side, 2026-07-20. Executes against
`C:\Users\Venkat Rao\Desktop\rao-academy`.**

**This brief MOVES files. It does not delete them. It does not push.**

---

## 0. WHY THIS EXISTS

BRIEF-CENSUS-1 measured 17 review pages matching `*1to1*` / `*faithful*`.
**All 17 are LIVE** — each has a source in `lessons/incoming/`, and all 17 were
regenerated in the 18:57 sweep today. Deleting the review pages alone would be
undone by the next regeneration.

A standing ruling reads: **ship REMIX only; do not generate the 1:1 faithful
HTML file.** These 17 are the faithful conversions that ruling says not to ship.
Each is a twin of a `_remix` sibling that also exists.

**Venkat has ruled: archive 16 of the 17.**

**`estimate-sums-faithful.html` is EXCLUDED and must not be touched.** Per
STATUS.md / HANDOFF-6 it is the deliberately re-authored Brief 7.5 proof lesson
(23→30 questions, full ladder, `whyWrong` and solution coverage). It matches the
rule by name only.

**Scope fence: Grade 4 only. Do not read, list, or touch `lessons-g3/` or
`sources-g*/`.**

---

## 1. THE 16 — exact list, no pattern matching

Move only these. Do not re-derive this list by glob. If a filename below does
not exist exactly as written, **STOP and report** rather than matching something
similar.

```
Compare-money-amounts-1to1.html
Multiply_two-digit_by_two-digit_word_problems__1to1.html
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

**EXCLUDED — do not move, do not delete, do not regenerate away:**

```
estimate-sums-faithful.html
```

---

## PHASE 0 — Pre-move measurement (READ-ONLY)

Report before moving anything:

1. Confirm all 16 sources exist in `lessons/incoming/`. Report any that do not.
2. Confirm `lessons/incoming/estimate-sums-faithful.html` exists and is NOT in
   the move list.
3. **Question count per file** for the 16, and the total.
4. **Current corpus count** from the grading gate's own independent count.
   Expected: 3,015.
5. File count in `lessons/` (expect 19), `lessons/incoming/` (expect 99), and
   `review/` (expect 119).
6. For each of the 16, confirm a `_remix` or bare sibling source exists that is
   NOT being moved. **Report any of the 16 whose removal would leave that
   lesson with no source at all.** If any exists, STOP and report before
   moving.

**If Phase 0 shows a lesson would be left with no surviving source, STOP.**

---

## PHASE 2 — Move the sources

1. Create `archive/lessons-1to1/` in the repo root if it does not exist.
2. `git mv` each of the 16 from `lessons/incoming/` to `archive/lessons-1to1/`.
   Use `git mv` so history is preserved — **not** delete-and-recreate.
3. Report the 16 moves individually.

**Do not modify `docs/question-ids.json`.** It is append-only. Every ID
belonging to an archived question stays permanently taken and permanently dead.
This is the never-reuse rule and it is not negotiable.

---

## PHASE 3 — Remove the stale review pages

1. Delete the corresponding 16 `review/*.html` pages.
2. **Do not delete `review/estimate-sums-faithful.html`.**
3. Report the 16 deletions individually and the resulting `review/` file count.

---

## PHASE 4 — Regenerate and verify

1. Regenerate every remaining review page:
   `node tools/make-review.js lessons/<file>.html` — one call per lesson, across
   `lessons/` and `lessons/incoming/`. Report attempted / succeeded / failed.
2. **Re-run the pattern scan on `review/`.** Expect exactly ONE match:
   `estimate-sums-faithful.html`. **If any of the 16 reappeared, the removal
   lever was wrong — STOP and report.**
3. Report the new `review/` file count.

---

## PHASE 5 — Chase the changed number

This is the load-bearing phase. **Never tune a count to hit an expected value.**

1. **New corpus count** from the grading gate's own independent count.
2. **Arithmetic check:** old count (3,015) minus the Phase 0 total for the 16
   must equal the new count exactly. Report all three numbers and the
   subtraction. **If they do not reconcile, STOP and report the discrepancy
   without adjusting anything.**
3. Run `node tools/verify-question-ids.js`. Report the result.
4. Confirm `docs/question-ids.json` still holds **3,015** entries — the ledger
   is append-only and must NOT shrink. **If it shrank, something deleted ledger
   entries and that is a halt.**

---

## PHASE 6 — Full suite

1. Run `npm test` unpiped. Report exit code and the named guard results.
   **Never pipe in a way that masks output or exit code.**
2. Run each guard individually and name it with its exit code.
3. **Stage all new and moved files before running `npm test`** —
   `verify-tracked.js` fails on untracked files.

**If any guard fails, STOP and report. Do not fix. Do not tune a guard to
pass.**

---

## PHASE 7 — Commit, local only

One commit:

```
BRIEF-CULL-1: archive 16 1to1/faithful duplicate lessons
```

Report the commit hash, file count, and insertion/deletion totals.

**DO NOT PUSH.** Report `git status -sb` and the ahead-count.

---

## 2. WHAT NOT TO DO

- **Do not push.** Venkat pushes after a chat audit.
- **Do not touch `estimate-sums-faithful.html`** in any directory.
- **Do not touch `lessons-g3/` or `sources-g*/`.**
- **Do not modify or shrink `docs/question-ids.json`.**
- **Do not delete the 16 sources** — `git mv` to archive only.
- **Do not tidy the untracked `BRIEF-*.md` files.** Offered previously, still
  not authorised.
- **Do not fix any defect found along the way.** Report it.
- **Do not tune any count, guard, or check to match an expected number.**

---

## 3. REPORT FORMAT

One report, one section per phase, then:

**Anything noticed but not acted on.**

Every number traceable to the command that produced it. Where something cannot
be answered from what was measured, write **UNMEASURED**.

**Phase 5's three-number reconciliation is the single most important output of
this brief. Report it explicitly even if it is clean.**
