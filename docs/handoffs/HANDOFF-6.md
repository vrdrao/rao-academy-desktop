# HANDOFF-6 — Brief 7.5 closed and pushed

Written 2026-07-15, at commit `f06d335`, immediately after the milestone push.
Read CLAUDE.md first; this file only carries what CLAUDE.md and STATUS.md do not.

---

## Repo state at f06d335 (all verified this session, not recalled)

- **Branch:** `main`, in sync with `origin/main` after fast-forward push
  `a9d05dd..f06d335`.
- **Milestone commits (pushed):**
  - `533b13e` — Brief 7.5: re-author `estimate-sums-faithful.html` as the
    solution-system proof + repair of two vacuous guards (see below)
  - `f06d335` — fixture whyWrong codes mapped to taxonomy + new CODE REGISTRY guard
- **Engine:** `rao-master-15`. Forward-only, as always.
- **Suite (`npm test`), last full green run in the `f06d335` pre-commit hook:**
  104 lesson files · **2,721 questions** — every one rendered, graded correct,
  rejected wrong, re-tinted under all 8 themes; 0 blank figures; 0 JS errors;
  **12/12 type coverage**; format (4 lesson/review pairs), styles, and
  real-touch verification at 380px all green.
- ⚠️ **STATUS.md's corpus header still says "108 files, 2,808 questions"** —
  that predates the `1f69a98` corpus cleanup (three `(2)` duplicate files
  deleted: `bar_graphs_1to1 (2)`, `bar_graphs_remix (2)`, `inequalities_remix (2)`).
  Current truth is what the suite prints: 104 files, 2,721 questions. The header
  needs updating next time STATUS.md is touched (not done here — this commit is
  the handoff only).
- **whyWrong inventory: 44 entries, every one enumerated and reconciled** —
  42 in `lessons/incoming/estimate-sums-faithful.html`
  (14 select questions × 3 distractors) and 2 in `lessons/_type-coverage.html`
  q14 (`"130,000"` → ESTIMATE_WRONG_VALUE, `"60,000"` → PARTIAL_COMPUTATION;
  these were kebab-case pre-taxonomy codes until `f06d335`).
- **Code registry: 76 codes** parsed from `### CODE` headings in
  `docs/MISCONCEPTIONS.md`. Of the 76 message templates there: 2 are
  placeholders (VISUAL_ONLY, VISUAL_DEPENDENT) and 6 are DORMANT, leaving
  68 live templates — reconciled exactly with Venkat's count.
- **Five content guards** in `tools/verify-content-guards.js`, each with a
  break→FAIL→restore→PASS proof on record:
  | Guard | State at f06d335 | Proof |
  |---|---|---|
  | DISTRACTOR COVERAGE | FAILING corpus-wide by design — 3,989 uncovered distractors across 103 lessons (the known content debt) | live-failing right now |
  | KEY MATCH | PASS 44/44 | orphan key `"99,999"` planted → FAIL → restored (this session, twice) |
  | TONE | PASS 44/44 | "You forgot…" planted → FAIL → restored (this session, twice) |
  | CODE REGISTRY (new) | PASS 44/44 against 76 codes | `TOTALLY_MADE_UP_CODE` planted → FAIL, exit 1 → restored |
  | HINT LEAK | PASS, 2,765 rungs | proven in commit `54888bb` era |
  Only HINT LEAK runs in `npm test` (`--hint-leak-only`) until the coverage
  debt reaches zero. CODE REGISTRY also fails loudly if the registry parses
  to zero codes — it cannot go vacuous.
- **Four firewall guards** (DEPENDENCY / RUNTIME / MUTATION / SOURCE-DIFF): green.

---

## What Brief 7.5 delivered

`estimate-sums-faithful.html`: 23 dead questions (15 identical fill-blanks,
then 8 identical selects) → **30 questions, 7 interaction types**, all 23
supplied items kept (none dropped), 7 added to fill interaction/misconception
gaps. 12 round-scaffolds; 3 of the 15 round-then-add items became story
selects (newspapers/kg, stadium tickets, ₹ savings) to break monotony —
a deliberate interpretation of "round-scaffold on every round-then-add item",
disclosed to and accepted by Venkat. Every question has a 2–3 rung hint
ladder, a solution block list, a takeaway (the rule, not the answer), and a
verification line; every distractor has whyWrong with a taxonomy code. All
arithmetic verified independently in Python with round-half-up before
authoring (0 failures). Review page: `review/estimate-sums-faithful.html`.

---

## Two guards found vacuous and repaired (the real lesson of this milestone)

1. **The whyWrong guards were blind.** `verify-content-guards.js` parsed
   frontmatter with its own flat, line-based parser that could not read the
   nested `whyWrong:` map — so KEY MATCH and TONE had checked **zero entries,
   ever** ("Covered: 0" corpus-wide even with entries present). Repaired to
   consume `q.whyWrong` from the engine's `build()` output — one parse point.
   Both guards re-proved to fail after the repair.
2. **`verify-format.js` used a flat `readdirSync("lessons")`** — the identical
   bug class that once hid 96% of the corpus from the harness (see STATUS.md).
   Review pages for `lessons/incoming/` lessons were never format-checked.
   Now recursive; checks 4 lesson/review pairs; proved to fail on a stale
   review (card-count 29 vs 30).

Pattern to remember: **a guard that has never printed FAIL is not a guard.**
Both of these had "passed" every run since they were written.

---

## Parked — Brief 7.6 ("calm card")

⚠️ **Sourcing caveat:** BRIEFS.md ends at 7.5. There is **no in-repo record**
of Brief 7.6, "calm card", or its blocker — the following is recorded verbatim
from Venkat at milestone close and could not be independently verified in this
session. Next session: get the full 7.6 brief text from Venkat before starting.

As stated by Venkat: Brief 7.6 (calm card) is **parked on a blocker — a
grading hole in which the correct answer shows green during retry**
("green-answer-during-retry"). Treat that as a display-side bug adjacent to
the §13 firewall: the retry path ("I've got it — let me try again") must not
reveal or mark the correct option before the child re-checks. When the brief
arrives, verify against the `rao-card.js` retry path — note the current touch
test asserts retry clears panels/feedback and keeps the child's selection, but
asserts nothing about correct-answer reveal state during retry. That is the
hole to close, with a guard proved to fail, before 7.6 work starts.

---

## Next work — batch pipeline (blocked)

As stated by Venkat (also not otherwise documented in-repo): the next body of
work is the **batch authoring pipeline**, currently **blocked on the 21 Word
docs** that have not yet been supplied. When they arrive, the per-lesson
workflow (extract images in true document order → verify every answer in
Python → author → `npm test` → `make-review` → `verify-format`) runs at
batch scale, per the "3+ files share a defect → fix the general case" rule.
Independent of the Word docs, the standing debt is **3,989 distractors
without whyWrong** across 103 lessons — burning that down is what lets
DISTRACTOR COVERAGE (and the rest of the content guards) into `npm test`.

---

## Process note for every future session

**Checkpoint rule (was missed twice, including at this milestone):** every
closed-and-pushed milestone ends with writing `docs/handoffs/HANDOFF-<n>.md`,
unprompted, in the same session, while context is still live. This file is
HANDOFF-6; the next one is HANDOFF-7.
