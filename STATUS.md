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

**104/104 files pass** build + grade + reject.

### 3 failures (all fixed)

1. **`divide-larger-numbers.html`** — FIXED.
   - 14 questions used `type: long-division` with `answer: []`. `long-division` is not a
     supported engine type — the engine rejected all 14 with build errors.
   - Converted to `fill-blanks` with quotient (and remainder where applicable). All 14
     answers verified with Python `divmod()`. Now 24/24 pass.

2. **`multiplication-patterns-over-increasing-place-values-1to1.html`** — FIXED.
   - 31 questions used unsupported `layout: stack` + `rows:` frontmatter. The engine's
     `fill-blanks` needs `[]` blanks in the prompt, not `_` in a `rows` array. All 31
     built with `answer: []` (empty) → wrong answers accepted.
   - Converted all 31 to standard `fill-blanks` with `[]` inline in prompt text.
     Now 31/31 pass.

3. **`multiplication-patterns-over-increasing-place-values.html`** — FIXED.
   - Same root cause as #2. 3 of 21 questions used `layout: stack` + `rows:`.
   - Converted to standard `fill-blanks`. Now 21/21 pass.

**Important lesson:** the batch validator flagged these as "reject failures" (wrong
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
