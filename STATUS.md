# Batch Import Status — Class 4 HTML Files

Last updated: 2026-07-14

---

## What is done

- **102 lesson files** copied from `Class 4 HTML Files/Class 4/` into `lessons/incoming/`
- All 102 had the identical stale wrapper (embedded engine JS, embedded card CSS, Google
  Fonts link, inline theme vars on `#preview`). **All stripped** — each file is now
  content-only (`<div id="source">…</div>`).
- **2,710 questions** across 104 files (102 freshly extracted + 2 pre-existing in incoming)
- `tools/batch-extract.js` — the extraction script (reusable)
- `tools/batch-validate.js` — bulk build + grade + reject validation
- `tools/preview.js` — generates fully interactive preview pages at
  `lessons/_preview/<name>.preview.html` (loads real engine, real CSS, has mode/theme/reveal
  controls, opens in browser). `lessons/_preview/` is gitignored.
- Backup branch `backup/pre-cleanup-2026-07-14` pushed to GitHub (contains all pre-cleanup
  untracked files).
- Post-commit auto-push hook removed.

## Validation results

**101/104 files pass** build + grade + reject.

### 3 failures

1. **`divide-larger-numbers.html`** — FIXED this session.
   - 14 questions used `type: long-division` with `answer: []`. `long-division` is not a
     supported engine type — the engine rejected all 14 with build errors.
   - Converted to `fill-blanks` with quotient (and remainder where applicable). All 14
     answers verified with Python `divmod()`. Now 24/24 pass.

2. **`multiplication-patterns-over-increasing-place-values-1to1.html`** — 31 reject failures.
   - Not yet investigated. Likely fill-blanks questions where the synthetic wrong answer
     (`answer + 7`) collides with a valid alternate, OR the same `answer: []` bug. Needs
     per-question inspection next session.

3. **`multiplication-patterns-over-increasing-place-values.html`** — 3 reject failures.
   - Same family as #2. Not yet investigated.

**Important lesson from #1:** the batch validator flagged these as "reject failures" (wrong
answer accepted). The root cause was not a test heuristic problem — it was a real authoring
bug (empty answer keys). When a test fails, investigate the content before blaming the test.

## Files individually reviewed this session

| File | Qs | Status | Notes |
|------|---:|--------|-------|
| `addition-missing-digits.html` | 27 | clean | Content unchanged, wrapper stripped |
| `estimate-sums-faithful.html` | 23 | clean | Content unchanged, wrapper stripped |
| `even_odd_faithful.html` | 19 | clean | Content unchanged, wrapper stripped |
| `divide-larger-numbers.html` | 24 | **fixed** | 14 `long-division` → `fill-blanks` |

## What is next

- Continue individual review of remaining ~98 files (name a file → validate → preview → report)
- Investigate the 2 remaining failures (`multiplication-patterns-*`)
- Once a file is approved by Venkat, move it from `lessons/incoming/` to `lessons/` and
  generate its review page
- Duplicates to watch: `bar_graphs_1to1.html` / `bar_graphs_1to1 (2).html` and similar
  `(2)` pairs — likely identical, need dedup
