# BRIEF — DUPLICATE CULL: estimate-products pairs (Venkat's ruling 2026-07-18)

Run this AFTER BRIEF-ENGINE-19 has been executed and committed. Read
CLAUDE.md first.

## PRE-CHECK (report before proceeding; STOP on any mismatch)

1. `git status` — tree clean, branch main.
2. Engine `__version` is exactly `rao-master-19` (this brief runs after the
   engine brief; if the engine is still rao-master-18, STOP).
3. Record the current corpus totals (lessons / questions) as reported by the
   suite — these are the BEFORE numbers for the arithmetic below.

## Authority

Venkat played both files of each duplicate pair back to back and ruled
(2026-07-18): in both pairs the UNDERSCORE-named file survives.

## The task

DELETE exactly these two lesson files and everything derived from them:

1. `lessons/estimate-products-1to1.html` (26 questions, hyphen) —
   survivor: `lessons/estimate-products_1to1.html` (24 questions).
2. `lessons/estimate-products-remix.html` (14 questions, hyphen) —
   survivor: `lessons/estimate-products_remix.html` (20 questions).

Derived artifacts to remove/update in the same commit:
- Their two `review/<name>.html` pages — deleted.
- Their rows in `LESSONS-MANIFEST.md` — removed; manifest totals updated.
- Their entries in `review/index.html` — removed.
- Grep the repo for any other reference to the two deleted filenames
  (docs, tools, STATUS.md); report every hit and what you did with it.
  If a hit is inside a historical/archived document (docs/briefs/,
  docs/handoffs/, docs/audits/), leave it untouched — archives are history.

Do NOT touch the two surviving underscore files in any way. Their md5s
must be identical before and after — include both in the report.

## Expected arithmetic (declared up front; any deviation stops the work)

- Lesson files: BEFORE − 2.
- Questions: BEFORE − 40 (26 + 14).
- The suite, manifest, and index must all agree on the AFTER totals.
  Report BEFORE → AFTER for both numbers with the subtraction shown.

## Guards

1. Full `npm test` green on the final tree (run the FULL suite for this
   report, not just the fast gate).
2. The corpus-count guard must reflect the new totals without any guard
   being loosened — if a guard hard-codes the old totals, update the
   recorded expectation in the same commit and say so explicitly.

## Report requirements

- The exact files deleted and every reference hit from the grep sweep.
- md5 before == after for both survivor files.
- BEFORE → AFTER totals with arithmetic shown.
- Firewall confirmation. Deviations in their own section.
- Commit this brief to `docs/briefs/` in the work's commit. Commits stay
  LOCAL. No push. Venkat pushes after the chat audit clears.
