# BRIEF — Complete review set + index + manifest

Read CLAUDE.md first. This task generates the complete review set and an
index. No lesson content, engine, grading, or config file may change.

1. Generate a review page for EVERY lesson in the corpus via
   tools/make-review.js (include lessons in subfolders such as
   lessons/incoming/ if any live there). Every lesson ends with a
   matching review/<name>.html.
2. tools/verify-format.js must pass green on every lesson/review pair.
3. Build review/index.html: a plain page listing every lesson
   alphabetically — title, question count, link to its review page.
   No engine needed on the index itself.
4. Write LESSONS-MANIFEST.md at the repo root: one table row per lesson —
   title, question count, lessons/ path, review/ path, source Word
   document if traceable. End with totals (lessons, questions) compared
   against the recorded 104 / 2,722. If the totals differ, say so
   plainly — do not smooth it over.
5. List any source documents in the repo that have NO corresponding
   lesson output.
6. npm test green. Commit the new review pages, review/index.html, and
   LESSONS-MANIFEST.md and nothing else. Print the totals and git status.
