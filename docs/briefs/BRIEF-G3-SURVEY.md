# BRIEF-G3-SURVEY — read-only reconnaissance of the Grade 3 source

**Chat-authored, 2026-07-20. READ-ONLY. Nothing is created, moved, edited,
committed or pushed by this brief.**

---

## WHY THIS BRIEF EXISTS, AND WHAT CHANGED

A prior chat told Venkat that Grade 3 ingestion was machine work that could run
overnight. That was wrong, and it was the load-bearing assumption behind a
"weeks, not years" estimate given to a founder who is running out of money.

**Venkat has since changed the model, and it changes this survey's job.**

The Word documents are **NOT a question bank to be transcribed.** Venkat's exact
position: the questions in them are *"very monotonous and repetitive,"* and the
purpose of supplying them is *"to just get an idea of the lesson or the skill
that is being taught and then use our imagination, our creativity to create
questions that test the same concept from different perspectives."*

So the expensive part of the old model — reading every question image and
determining its answer with confidence — **is no longer required.** We are not
transcribing answers. We are extracting *skills*.

**What this survey must therefore answer is not "how many images must be read"
but "how many distinct skills does Grade 3 contain, and what is each one's
ceiling."**

---

## THE ONE NUMBER THAT MATTERS MOST

**Document count is not lesson count. Do not conflate them.**

Every Grade 3 lesson will be authored at **exactly 30 questions** (Venkat's
ruling; applies to Grade 3 only — Grade 4 counts are settled and out of scope).

So the workload is `lessons × 30`. If 90 documents represent 90 distinct skills,
that is 2,700 questions — comparable to the entire Grade 4 corpus. If several
documents teach the same skill at different difficulties and collapse into one
lesson, the number is far smaller.

**The gap between document count and distinct-skill count is the whole story of
this survey.** Report both numbers separately and never blend them.

---

## SCOPE FENCE

- **READ-ONLY.** No file is created, modified, moved, renamed or deleted.
  No commit. No push. No `git add`.
- Do not author any lesson, question, or frontmatter.
- Do not build a pipeline, script, or converter.
- Do not modify anything in `lessons/`, `lessons-g3/`, `review/`, or `tools/`.
- If a task cannot be completed read-only, **skip it and say so in the report.**
- Grade 4 is out of scope entirely.

**You may write ONE file and only one: the report itself, at
`docs/audits/G3-SURVEY.md`.** If `docs/audits/` does not exist, report the
findings in chat instead and say so. Do not create the directory.

---

## TASK A — SETTLE THE TWO-LOCATIONS PROBLEM FIRST

There are two candidate homes for the Grade 3 source and **nobody has proven
which is real.** This is the `deploy-drop/` problem and the `_1to1` problem for
the third time: two locations claiming to be the same source.

**Do not survey content until this is settled.**

1. List `C:\Users\Venkat Rao\Desktop\word-staging\` — every subdirectory, with
   file counts and total bytes.
2. List the repo's untracked `sources-g3/` — same detail.
3. **Determine whether they duplicate each other, differ, or overlap
   partially.** Compare by filename and by size. If filenames match but sizes
   differ, say so explicitly — that is the worst case and must not be laundered
   into "they're the same."
4. Report which location is more complete, and by what evidence.

**Do not delete, move, or reconcile anything.** Report only. Venkat rules.

---

## TASK B — WHAT IS ALREADY DONE

`word-staging\extracted\` and `word-staging\Not needed\` are dated 18–19 July.
**Someone already started processing these. Contents UNMEASURED.**

Report what each holds: file count, formats, and whether `extracted/` contains
extracted *images*, extracted *text*, or converted *HTML*.

**If a partial pipeline already exists, we must not rebuild it.** Say plainly
what stage it reached and whether its output is usable.

---

## TASK C — THE SKILL INVENTORY (the core deliverable)

For **every Grade 3 document**, report one row:

| document filename | topic/skill it teaches | number ceiling | question count in doc | screenshot or typed text |

Definitions, so these are measured and not invented:

- **topic/skill** — one short phrase, e.g. "two-digit subtraction with
  regrouping", "telling time to the nearest 5 minutes", "identify fractions of
  a shape". Read the document title and enough of its content to be accurate.
- **number ceiling** — the largest numbers the document actually works with,
  and whether it stays inside them. This is the single most important column:
  it is the guard rail against authoring questions that are too hard.
  If a document never exceeds two digits, say so.
- **question count in doc** — how many questions the source contains. This is
  *context only*. It does not constrain our output, which is always 30.
- **screenshot or typed text** — whether questions are images or real text.

**Then, and this is the deliverable:** group the documents into **distinct
skills**. Report the count of distinct skills alongside the count of documents,
and name any case where multiple documents collapse into one skill.

---

## TASK D — INTERACTION TYPE FIT

The engine supports eight types: `single-select`, `multi-select`, `fill-blanks`,
`expression`, `order`, `sequence-build`, `categorize`, `line-plot`.

For each distinct skill from Task C, name **which types could plausibly carry
it.** Not which type the Word doc used — which types the *skill* admits.

This exists because Venkat's instruction is to test each concept "from different
perspectives" with "better interaction and newer ways." A skill that only admits
one type is a skill where we will struggle to make 30 questions feel varied, and
we need to know which those are before authoring starts, not during.

**Flag any skill that appears to need an interaction type the engine does not
have.** Do not design it. Name it.

---

## TASK E — GRADE 3 REPO STATE

`lessons-g3/` currently holds 1 file. Report what it is.

Report whether any Grade 3 lesson has ever been authored, and whether
`docs/question-ids.json` contains any Grade 3 IDs. **It must not** — the ID
guard explicitly excludes g3 today. Confirm that exclusion still holds.

---

## ANTI-LAUNDERING — this brief's specific failure mode

The temptation here is to make Grade 3 sound tractable because Venkat needs it
to be tractable. **Do not.**

- Say **UNMEASURED** when something is unmeasured.
- Do not estimate effort, duration, or timeline **anywhere in this report.**
  Chat rules on timeline after reading measured facts. A survey that smuggles in
  an estimate corrupts the decision it exists to inform.
- If a document is unreadable, ambiguous, or in an unexpected format, name it
  individually rather than folding it into a total.
- Report counts you actually derived from a listing. Never round, never
  approximate, never say "approximately N" where N could be counted.

---

## REPORT FORMAT

Report in this order:

1. **Task A** — the two-locations verdict, with evidence.
2. **Task B** — what `extracted/` and `Not needed/` hold.
3. **Task C** — the full document table, then **document count vs distinct-skill
   count** stated as two separate numbers.
4. **Task D** — interaction-type fit per skill; any gaps named.
5. **Task E** — `lessons-g3/` state and g3 ID-ledger confirmation.
6. **Anything noticed but not acted on.**
7. **Explicit confirmation that nothing was created, modified, moved, committed
   or pushed** — with `git status -sb` as evidence.

**Do not self-commission follow-up work. Do not write a handoff. Do not propose
the next brief.**
