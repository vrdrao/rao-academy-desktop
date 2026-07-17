# Project Status — Rao Academy

Last updated: 2026-07-17

---

## Corpus

**104 lesson files. 2,722 questions. 0 failures.** (was 108/2,808 on 2026-07-14;
that delta predates Brief 7.6. 2,721 → 2,722 on 2026-07-17: one precedence-
coverage question added to `_type-coverage.html` by Brief 7.6.1.)

All tested in a real Chromium browser: build, render, grade correct, reject wrong, 8 themes,
CSS containment, container queries, double-attach idempotency, type coverage (12/12), zero
blank figures.

The corpus lives in `lessons/` (4 authored lessons + `_type-coverage.html` fixture) and
`lessons/incoming/` (105 imported from the Class 4 Word doc bank). `lessons/_preview/` is
gitignored scratch.

---

## What the harness actually tests

Until 2026-07-14, the harness used a flat `readdirSync("lessons/")` that found 4 `.html` files
and silently skipped the 105 files in `lessons/incoming/`. Every "green" claim in the project's
history — across ~95 sessions — was a claim about **98 questions out of 2,808**. That is 4% of
the bank.

The harness now recurses `lessons/` (excluding `_preview/`) and has a **minimum-corpus-count
guard**: if it finds fewer than 100 lesson files, it exits with code 2 and the message
`CORPUS TOO SMALL`. This guard exists because the harness silently skipped 96% of the corpus
and nobody noticed.

---

## Bugs found and fixed when the full corpus was first tested

### 1. Time normalizer — ENGINE BUG (13 questions, 1 lesson)

`find-start-and-end-times-remix.html`. Answer keys used `P.M.`/`A.M.` (with periods). The
engine's `check()` normalizer had a fragile regex that happened to handle `P.M.` but the
harness's answer-entry code could not match `P.M.` to the AM/PM toggle button (which uses
`data-ap="PM"`). **A child typing "12:35 P.M." in the live app was at risk of being graded
wrong** if the serializer/normalizer path diverged.

**Fix:** Normalizer now strips all dots before matching — `P.M.` / `p.m.` / `PM` / `pm` / `Pm`
all canonicalize to `PM`. One normalization point, on the way in to `check()`.

### 2. SVG 0×0 blank figures (22 figures across 4 questions, 1 lesson)

`identify-three-dimensional-figures.html`. 58 SVGs had `viewBox` but no `width`/`height`
attributes. Without intrinsic size, SVGs inside categorize tiles collapsed to 0×0 in the
browser. The harness detected this (it checks `getBoundingClientRect()` on every figure).

**Fix:** Batch-added `width`/`height` derived from `viewBox` to 147 SVGs across 3 files.

### 3. Sanitizer silently deleting prompt text — ENGINE BUG (1 question, 1 lesson)

`Place_values_remix.html` Q13. The prompt `"8 ones = []"` was destroyed by the engine's
sanitizer. The regex `/\son[a-z]+\s*=\s*[^\s>]+/gi` — meant to strip event handlers like
`onclick=` — ran globally on the entire HTML string and matched `ones = <input` in prose text.
The word `ones` starts with `on`, and the `= <input` looked like an unquoted attribute value.

This silently deleted the word, the equals sign, and the `<input>` tag. The question rendered
as a blank. **`npm test` passed** because the harness wasn't testing this file.

**Fix:** The sanitizer now constrains `on*` attribute stripping to only run inside HTML opening
tags (`<tag ...attrs...>`), never in text content. Guard added: prompts containing `ones`,
`online`, `ongoing` must survive the sanitizer; event handlers (`onclick`, `onmouseover`) must
still be stripped. Guard proved to fail against the old regex.

### 4. Order answer key mismatch (1 question, 1 lesson)

`estimate-products_remix.html` Q8. The answer key had estimated products `["80","180","280"]`
but `order` type requires tile text. Fixed to `["4 × 22","6 × 31","4 × 67"]`.

### 5. batch-validate.js — deleted

`batch-validate.js` ran in Node only (no browser), tested only `lessons/incoming/`, and was
not wired into `npm test`. It was a strict subset of what the harness does. A second, weaker
validation path that covers less than the primary path is not a safety net — it is an illusion
of coverage that lets you believe things are tested when they are not.

---

## Guards added

| Guard | File | Asserts |
|---|---|---|
| Untracked-file | `verify-tracked.js` | Every file in `lessons/` and `tools/` is git-tracked |
| Minimum corpus count | `harness.js` | Harness sees ≥ 100 lesson files (was silently seeing 4) |
| Blank-figure detection | `harness.js` | Every SVG/canvas/figure renders at > 2×2 px |
| Sanitizer prose | `verify-structural.js` | Prompts with `ones`/`online`/`ongoing` survive; `onclick`/`onmouseover` are stripped |
| Grading firewall: DEPENDENCY | `verify-firewall.js` | Solution renderer has no import/reference to the grading module |
| Grading firewall: RUNTIME | `verify-firewall.js` | Rendering a solution never calls `check()` |
| Grading firewall: MUTATION | `verify-firewall.js` | Rendering a solution cannot mutate the stored answer or response |
| Grading firewall: SOURCE-DIFF | `verify-firewall.js` | Solution and grading files not modified together without `FIREWALL_ALLOW_GRADING=1` |

Every guard was proved to fail before being trusted.

---

## Solution system — Brief 7

**Spec written:** `CLAUDE.md` §13 + `docs/SOLUTION_SPEC.md`.

**7.1 — Firewall: DONE.** Four guards, each proved to fail. Solution renderer stub
(`engine/solution-renderer.js`) exists and is structurally incapable of touching grading.

**7.2 — Renderer + blocks: DONE.** (rao-master-14)

**7.3 — Three-tier ladder: DONE.** (rao-master-15) Hint ladders, whyWrong display,
stepped walkthrough, touch-verified at 380px.

**7.4 — whyWrong + validation: DONE.** Taxonomy (docs/MISCONCEPTIONS.md), classifier,
four content guards. Content debt: 3,989 distractors across 103 lessons still lack
whyWrong (guard not in npm test until that reaches 0).

**7.5 — The proof: DONE (2026-07-15).** `estimate-sums-faithful.html` re-authored,
23 → 30 questions (all 23 supplied items kept; 7 added to fill interaction gaps).
12 round-scaffolds, 12 selects, 2 multi-selects, 1 order, 1 categorize/bins,
1 sequence-build, 1 helper-chip fill-blanks. Hint ladder + solution block list +
takeaway on all 30; whyWrong (42 entries, taxonomy codes) on every distractor.
All arithmetic re-verified in Python (round-half-up).

Two tool bugs found and fixed during 7.5:
1. **verify-content-guards.js was blind to whyWrong** — it used its own flat
   line-based frontmatter parser instead of the engine's, so KEY MATCH and TONE
   were vacuously true across the entire corpus (checked: 0). Now reads
   `q.whyWrong` from `RaoPreview.build()`. Both guards re-proved to fail.
2. **verify-format.js used a flat `readdirSync("lessons")`** — the same bug class
   that hid 96% of the corpus from the harness. Review pages for `incoming/`
   lessons were never checked. Now recursive; checks 4 pairs; proved to fail on
   a stale review (card-count mismatch).

**7.6 — Calm Card: DONE (2026-07-17).** (rao-master-16) Reference:
`incoming/calm-card-v36.html` (md5 `deb8d07a84a9f1fbc6847b7ff57a965f`, signed off
2026-07-17) + `docs/CALM-CARD-MASTER-SPEC-v1.md`. Killed the blocker: the correct
option is NEVER highlighted while a question is attemptable (the old wireCard
revealed it green on every wrong attempt — a child could bail out and tap the
green one). Wrong is now a whisper (✕ glyph only, option keeps its resting look);
hints + whyWrong are ONE tutor-bubble ladder ("Hint n", never "of N", 650ms
type-then-fill, append-only); the walkthrough is child-initiated (after 2nd wrong
attempt or when hints run out), LOCKS the question at open, records
`solved-with-help` (not correct), has no retry inside, and reveals the answer
quietly at the final step; correct is the only loud moment (green + sparks +
chime + "The idea to keep" takeaway + "Next question →"). New guard
`tools/verify-calm.js` (in npm test): ANSWER-LEAK sweeps every select question in
the corpus (1,593 across 104 lessons) plus LOCK-ON-OPEN, TASK-IMMUTABILITY,
ACCUMULATION, BUBBLE-PARITY-vs-v36, HINT-LABEL-BAN — every guard proved to fail
before being trusted. verify-touch.js rewritten to the calm flow (real CDP touch,
380px). Landed as two commits so the SOURCE-DIFF firewall stayed honest
(behavior first with grading untouched, then the version stamp alone —
sequencing approved by Venkat in-session).

**7.6.1 — Frontmatter `explain:` fix: DONE (2026-07-17).** (rao-master-17)
`parseQuestion` now falls back to `fm.explain` when the markup carries no
`<p class="explain">`; both forms flow through the same assembly and the same
build()-time sanitizer, so they render identically. Markup wins when both
exist. Corpus: 32 frontmatter-only explains (the 30 in the 7.5 proof lesson +
2 in the fixture) now render; exactly 1 both-form question exists (added to
`_type-coverage.html` so precedence is testable — corpus 2,721 → 2,722
questions, files unchanged at 104). Three new guards in verify-calm.js
(EXPLAIN PARITY / PRECEDENCE / REVEAL-live), each proved to fail: sabotage 1
(drop frontmatter) named estimate-sums-faithful.html (30) + fixture (2);
sabotage 2 (frontmatter overrides markup) named the fixture precedence
question. Reveal verified live for all 32: hidden before Check, correct →
visible when legacy, suppressed (cc-hastake + takeaway panel) when the
solution carries a takeaway.

Pre-existing bugs FOUND during 7.6, not yet fixed (need decisions):
1. ~~Frontmatter `explain:` ignored~~ — FIXED as Brief 7.6.1 above.
2. **`.opt.is-sel` out-specifies `.opt.is-correct`** in rao.css, so the green
   correct treatment never actually painted on a selected option. The calm card
   now sidesteps it (is-sel is dropped when the verdict paints); rapid mode
   still has the stale paint (its wrong-flash shows the shake but keeps the
   selection purple).

---

## Files individually reviewed

| File | Qs | Status | Notes |
|------|---:|--------|-------|
| `addition-missing-digits.html` | 27 | clean | Content unchanged, wrapper stripped |
| `estimate-sums-faithful.html` | 30 | **re-authored** | Brief 7.5 proof lesson — full ladder/whyWrong/solution coverage |
| `even_odd_faithful.html` | 19 | clean | Content unchanged, wrapper stripped |
| `divide-larger-numbers.html` | 24 | **fixed** | 14 `long-division` → `fill-blanks` |
| `Place_values_remix.html` | 30 | **fixed** | Q13 destroyed by sanitizer (engine fix) |
| `estimate-products_remix.html` | 20 | **fixed** | Q8 order key had products not tile text |
| `identify-three-dimensional-figures.html` | 25 | **fixed** | 58 SVGs missing width/height |
| `simple-fractions-30.html` | 30 | **fixed** | 41 SVGs missing width/height |
| `Simple fractions - what fraction does the shape show.html` | 30 | **fixed** | 48 SVGs missing width/height |
| `find-start-and-end-times-remix.html` | 30 | **fixed** | Time normalizer engine bug |

## Deploy state — rao-master-17

**Built and verified locally at `a0b372f` (2026-07-17). Deploy PENDING** —
the app will live at https://www.tulipmath.com on AWS; the exact URL is still
to be determined, so there is nothing to verify against yet. The complete
engine drop (five engine files + fonts + a non-technical DEPLOY.md with the
mount, load order, and md5/byte verification table) is in `deploy-drop/`.

**STANDING GATE — live verification is DEFERRED, not skipped:** the moment a
real URL exists, `node tools/check-app.js <url>` must run against a live page
showing a question and come back green (engine version, rao.css, rao-card.css,
mount, fonts) before the deploy is considered done. No go-live without it.

## What is next

- ~~Header ruling~~ — RULED 2026-07-17: "Solution — step by step" header KEPT
- ~~Brief 7.6.1~~ — DONE 2026-07-17 (see above); commits local, awaiting
  Venkat's audit + push order
- Brief 7.7+: video walkthrough (Watch tab — structurally not precluded), Robo
- Continue individual review of remaining ~95 files
- Duplicates to watch: `bar_graphs_1to1.html` / `bar_graphs_1to1 (2).html` and similar
  `(2)` pairs — likely identical, need dedup
- Content debt from 7.4: 3,989 distractors still lack whyWrong
