# BRIEF — OVERNIGHT BATCH CONVERSION: 21 GRADE 4 SOURCE DOCUMENTS (2026-07-18)

This brief is designed to run UNATTENDED through the night. Venkat is
asleep; there is no one to ask. Wherever this brief says STOP-AND-SKIP, that
means: skip that one item, record it in the deviations section, and continue
with the rest. Never halt the whole run for a single lesson's problem, and
never widen scope to "solve" a problem this brief doesn't authorize.

## PRE-CHECK (report before proceeding; STOP the whole run on any mismatch)

1. `git status` — tree clean, branch main. KNOWN STATE: HEAD is the
   duplicate-cull commit `b2e9f74`, and origin/main is ONE behind at
   `760bf09` — the cull's push was BLOCKED by the push gate at 00:46 on
   2026-07-19 (full suite failed at push time). This is recorded and
   expected; do not try to push, and do not treat being ahead of origin
   as a mismatch. Any OTHER divergence is a STOP.
2. Engine `__version` is exactly `rao-master-19`.
3. Record the suite's current totals (lessons / questions) as the BEFORE
   numbers.
4. Source staging folder exists:
   `C:\Users\Venkat Rao\Desktop\word-staging\extracted\`
   containing exactly 21 .html lesson documents. Count them. If the count
   is not 21, STOP the whole run and report.

## Step 0 — Diagnose the blocked push (before anything else)

The push-time full suite failed with no FAIL line visible: the per-lesson
card-check list stopped after `rounding_remix` and the FAILED banner
printed. The same tree passed the full suite ~40 minutes earlier, so a
flaky browser-process death is suspected, not a regression.

1. Re-run the browser style/card check standalone (`node
   tools/verify-styles.js`) once on this tree. Capture the tail of its
   output and its exit code into the report.
2. If it FAILS: record the complete first failure block verbatim (lesson,
   check, actual values) in a PUSH-GATE FAILURE section of the report. Do
   NOT fix anything, do NOT touch the engine or guards — diagnosis only,
   Venkat and chat adjudicate in the morning. Continue with the run
   (conversion work is content-only and independent; the fast commit gate
   does not include browser checks).
3. If it PASSES: record "push-gate failure did not reproduce — FLAKY
   browser-process death suspected" with the exit code. Continue with the
   run. The morning push retry will settle it.

## Step 1 — Ingest sources into the repo (one commit)

Copy all 21 files from the staging folder into `sources/` in the repo
(create the folder if absent). Commit them with this brief archived to
docs/briefs/ in the same commit. Sources live in the repo so every lesson
is traceable to its document — standing rule from the 2026-07-18 audit.
Do not modify the staging folder itself.

## Step 2 — Corpus-overlap check (before converting anything)

For each of the 21 sources, compare its topic against the existing lesson
corpus (manifest titles + lesson filenames). If a source's topic appears to
already be covered by an existing lesson, DO NOT convert it — list it in
the report under OVERLAP-HOLD with the matching existing lesson, for
Venkat's morning ruling. Converting a duplicate creates exactly the problem
the duplicate cull just removed.

## Step 3 — Convert, one lesson at a time, one commit per lesson

Process sources in alphabetical order. For each:

1. Convert per `WORD_TO_AUTHORING_INSTRUCTIONS.md` — that document is the
   authority for format, structure, and the REMIX delivery default. Where
   this brief and that document conflict, that document wins for format;
   this brief wins for process.
2. Full enrichment is mandatory per question: 3-rung hint ladder (orient /
   method / nearly-does-it; hints never state the answer), whyWrong entry
   for every distractor tagged with a code from docs/MISCONCEPTIONS.md
   (new misconception codes may be added to the taxonomy in the same
   commit, following its format), stepped solution (goal/working/reason)
   ending in takeaway + verification, and an explain line. Distractors are
   designed from real misconceptions, never random numbers. Prompt
   ordering law: lead with the actual question/expression, then the
   method instruction. Indian context throughout (names, ₹, real
   settings), language suited to a 9-10 year old.
3. Figures: use ONLY figure types the rao-master-19 engine supports
   (unknown data-show is now a build-failing error — do not attempt one).
   If a question genuinely wants an unsupported figure, author it without
   the figure and add one line to an ENGINE-REQUESTS section of the
   report. Answer-leak rule: no figure, hint, or option layout may reveal
   the answer of its own question.
4. Generate the lesson's review page via tools/make-review.js, update
   LESSONS-MANIFEST.md (row + totals) and review/index.html in the same
   commit.
5. One commit per lesson: lesson file + review page + manifest + index.
   The fast commit gate runs per commit; that is sufficient per-lesson.
6. Self-check line in the report per lesson: question count, mix summary
   (how many fluency / story / other), hint+whyWrong+solution coverage
   confirmed complete, figure types used.

## Step 4 — End of run (whenever it ends)

Run the FULL `npm test` suite once on the final tree. Then write the final
report. If capacity or time runs out mid-run: whatever is committed is
safe and complete per-lesson; note in the report where the run stopped and
which sources remain. An interrupted run is a successful partial run, not
a failure — never rush a lesson to "finish the list."

## Hard fences for the night

- NO pushes (the deny rule blocks it anyway; do not attempt).
- NO engine, guard, hook, or CSS changes of any kind. If something in the
  engine seems broken, STOP-AND-SKIP the affected lesson and report it.
- NO changes to existing lessons — this run only ADDS.
- FIREWALL_ALLOW_GRADING never set.
- Totals reconcile: BEFORE + (converted lessons' questions) = AFTER, shown
  per lesson in a running ledger. Any number that moves outside this
  ledger fails the morning audit.

## Step 5 — CONDITIONAL: Grade 3 capability scan (read-only analysis)

After Step 4, check whether `C:\Users\Venkat Rao\Desktop\word-staging\grade3\`
exists and contains documents. If it does NOT exist, skip this step silently.
If it does:

1. Ingest the Grade 3 documents into `sources-g3/` in the repo (create the
   folder; if any are zips, extract lesson documents the same way the
   Grade 4 staging was handled — skip preview-engine and js/css/font junk)
   and commit them.
2. Run a CAPABILITY SCAN: inventory every question type, figure type, and
   interaction the Grade 3 documents imply, and map each against what the
   rao-master-19 engine supports today. This is ANALYSIS ONLY — no lesson
   conversion, no engine changes, no authoring.
3. Write the result to `docs/GRADE3-CAPABILITY-SCAN.md`: a table of
   capabilities (SUPPORTED / GAP), each GAP with the document and example
   question that needs it, and a closing section listing which Grade 3
   topics could be converted today with zero engine work. Also flag any
   suspected duplicate or near-duplicate source documents (same topic
   twice, older drafts) in their own section for Venkat's morning ruling —
   flag only, delete nothing.
4. Commit the scan document. This file is the input for the separate
   Grade 3 chat.

## Step 6 — CONDITIONAL: Grade 3 PILOT conversions (hard cap: 3 lessons)

Only if Step 5 ran and the scan identified topics with ZERO engine gaps.
Purpose: produce template candidates for morning critique, not inventory.

1. Select AT MOST 3 zero-gap topics — prefer self-contained, mainstream
   topics (arithmetic/number-sense over anything structurally novel).
2. Convert each per the Grade 4 pipeline mechanics but into the Grade 3
   spaces: `lessons-g3/`, review pages in `review-g3/` plus a
   `review-g3/index.html`, manifest `LESSONS-MANIFEST-G3.md` (create
   these; Grade 3 totals are tracked separately from Grade 4's and start
   at 0). Full enrichment per Step 3's rules. Content pitched to a
   8-9 year old; same Indian-context, distractor-as-diagnosis,
   answer-leak, and prompt-ordering laws.
3. Mark each with `PILOT` in its manifest row and report entry. These
   three lessons are template candidates — in the report, add a TEMPLATE
   NOTES section: the authoring choices made that future Grade 3 lessons
   would inherit (mix proportions used, new misconception codes added,
   any judgment calls), so the morning critique targets the mold, not
   just the three lessons.
4. One commit per lesson, same as Step 3. HARD CAP of 3 regardless of
   remaining time or capacity — more pilots add audit surface, not value.
   Grade 4 lessons in this run must remain untouched by Step 6.

## Morning report requirements

- Ledger table: one row per source — CONVERTED (with question count and
  commit hash) / OVERLAP-HOLD (with matching lesson) / SKIPPED (with
  reason). All 21 rows present, no source unaccounted for.
- BEFORE → AFTER totals with the arithmetic shown.
- ENGINE-REQUESTS section (may be empty).
- If Step 5 ran: Grade 3 source count ingested and the scan's
  SUPPORTED/GAP tally; if it was skipped, one line saying the grade3
  folder was absent.
- If Step 6 ran: the pilot ledger (topic, question count, commit hash,
  PILOT flag) and the TEMPLATE NOTES section. Grade 3 totals reported
  separately from Grade 4's.
- Full-suite banner from the end-of-run test.
- md5 + bytes for the manifest and index; deviations section (its absence
  is an audit flag).
- Everything stays LOCAL. Venkat audits in the morning, then pushes.
