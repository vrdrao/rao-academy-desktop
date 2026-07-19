# BRIEF-G3-PILOT1-PREP-2026-07-19 (v2) — Entry check · HOLD list · pilot 1 extraction

v2 note: identical to v1 except Part E, which now COMMITS locally (the
pre-commit gate is the fast subset since BRIEF-PRECOMMIT-SPEED; the full
suite runs at push, and this brief does not push). This brief REPLACES
BRIEF-G3-ENTRY-DUPES-2026-07-19 (never run).

This brief writes TWO new files inside the repo (Parts B and D), archives
itself into `docs/briefs/` (Part E), and modifies nothing else. Scratch work
(unzipping .docx files) happens in the system temp directory, outside the
repo, deleted at the end.

Execute the parts in order. Produce ONE report at the end in the format of
Part F. Report unknowns as UNKNOWN — never dress a guess as a fact
(anti-laundering law). If any instruction cannot be followed exactly, STOP
that part and record it in Deviations rather than improvising.

---

## Part A — Entry check

Report actual observed values, not bare PASS/FAIL:

1. `git status --porcelain` (verbatim) and `git rev-parse HEAD`. The only
   acceptable untracked file is this brief itself in the repo root.
2. Engine `__version` from `engine/preview-engine.js` (exact string).
3. Grade 4 recorded totals line from `LESSONS-MANIFEST.md`, verbatim
   (expected on record: 102 lessons / 2,687 questions).
4. `sources-g3/`: recursive count of `.docx` files (expected 198) and count
   of topic folders (expected 24).
5. `docs/GRADE3-CAPABILITY-SCAN.md`: byte size + md5.

If item 1 shows anything unexpected beyond this brief, continue read-only
parts but do NOT write files or commit; report and stop after Part C.

## Part B — Create the HOLD list

1. In `docs/GRADE3-CAPABILITY-SCAN.md`, locate the section flagging
   suspected duplicate sources. The files named there are the authoritative
   list — add nothing of your own.
2. Create `docs/G3-HOLD-DUPES.md` with:
   - Header: "HOLD — suspected duplicate sources. Every file listed here is
     EXCLUDED from all Grade 3 conversion batches until Venkat rules.
     Created 2026-07-19 by BRIEF-G3-PILOT1-PREP. Ruling pending."
   - The scan's duplicate section copied VERBATIM.
   - A flat, one-per-line list of every flagged file path (both/all members
     of every pair or group — nothing escapes the hold by being 'probably
     the original'), so future briefs can grep it.
3. Copy the flat list into the report as well.

If you notice OTHER suspiciously similar filenames the scan did not flag,
list them under Deviations as "not flagged by scan, not held, not analyzed"
— do not add them to the HOLD file.

## Part C — Pilot candidates

Copy VERBATIM into the report the scan's closing section naming the three
zero-gap pilot candidates. **Pilot 1 is the first candidate named there.**

Cross-check pilot 1's source file against the HOLD list. If it appears
there: STOP after this part, report, and await the chat's decision. Do not
substitute pilot 2 on your own — substitution is a scope decision and scope
is not yours.

## Part D — Stage 2 faithful extraction of pilot 1

Goal: a complete, verified inventory of pilot 1's source document, detailed
enough that the chat can design the variation plan without ever seeing the
.docx. The Grade 3 sources are SCREENSHOT-BASED: the questions live in
embedded images. You must READ EVERY IMAGE.

1. Copy pilot 1's `.docx` to the temp dir, extract it as a zip, and open
   every image under `word/media/` in document order (cross-reference
   `word/document.xml` relationship order to sequence them correctly —
   filesystem order of media files is not reliable).
2. For EVERY question found, record:
   - Sequence number (your numbering, in document order).
   - The question stem, transcribed verbatim (including any method
     instruction wording).
   - Question type as implied (fill-blank / single-select / multi-select /
     expression / other — describe if other).
   - All options verbatim, if any.
   - The source's marked/printed answer, if the document shows one;
     otherwise UNKNOWN.
   - **Your independently computed answer** — actually compute it (use
     Python for arithmetic, not mental math). Never copy the source's
     answer into this field.
   - MATCH / MISMATCH / SOURCE-ANSWER-UNKNOWN comparing the two.
   - Whether the question depends on a figure, and if so a one-line
     description of the figure.
   - Image filename(s) the question came from (traceability).
3. Also record, at document level: title/topic as printed, total question
   count, the difficulty arc you observe, and any monotony patterns (e.g.
   "questions 4–18 are the identical computation with different numbers")
   — the chat needs this to design the remix.
4. If an image is unreadable or ambiguous, record the question as
   UNREADABLE with the image filename — do not reconstruct it from context.
5. Write the full inventory to `docs/extractions/G3-PILOT1-EXTRACTION.md`
   (create the folder if absent). Include the document-level summary at the
   top and every MISMATCH/UNREADABLE flagged in a dedicated section.
6. In the pasted report: the document-level summary, the per-question TYPE
   tally, every MISMATCH and UNREADABLE in full, and the first 3 questions
   in full as a sample.

## Part E — Local commit (no push)

1. Copy this brief byte-for-byte to
   `docs/briefs/BRIEF-G3-PILOT1-PREP-2026-07-19.md` (md5-verify the copy),
   then remove the root copy — the standing archive pattern.
2. Stage exactly three paths: the archived brief, `docs/G3-HOLD-DUPES.md`,
   `docs/extractions/G3-PILOT1-EXTRACTION.md`. `git status` before
   committing must show nothing else staged or modified.
3. Commit locally with message:
   `G3 pilot prep: HOLD list (duplicates excluded pending ruling) + pilot 1 extraction`
   Wrap the commit in a 30-minute timeout (standing rule — the default
   2-minute timeout has killed a commit mid-hook before). Let the
   pre-commit gate run to completion whatever its duration; never
   --no-verify.
4. Do NOT push. Report the commit hash, the enumerated file list from
   `git show --stat`, and the pre-commit gate's closing output.
5. Delete the temp directory. Final `git status --porcelain` must be empty;
   report it verbatim.

## Part F — Report format

```
ENTRY CHECK
- status/HEAD: <verbatim>
- engine __version: <value>
- G4 totals line: <verbatim>
- sources-g3: <n> .docx in <n> folders (expected 198 / 24)
- scan doc: <bytes> bytes, md5 <hash>

HOLD LIST (flat list, verbatim from docs/G3-HOLD-DUPES.md)
<paths>

PILOT CANDIDATES (scan's closing section, verbatim)
<text>
- Pilot 1 = <path>  · on HOLD list: NO / YES(stopped)

PILOT 1 EXTRACTION SUMMARY
- title/topic: <as printed>
- total questions: <n>  (readable: <n>, unreadable: <n>)
- type tally: <e.g. 22 fill-blank, 8 single-select>
- difficulty arc + monotony notes: <observed>
- answer verification: <n> MATCH, <n> MISMATCH, <n> SOURCE-ANSWER-UNKNOWN
- MISMATCHES + UNREADABLES in full: <each, or "none">
- sample (first 3 questions, full records): <...>
- extraction file: docs/extractions/G3-PILOT1-EXTRACTION.md, <bytes> bytes

COMMIT
- hash: <hash>  (LOCAL, not pushed)
- files: <git show --stat enumeration>
- pre-commit gate output: <closing lines>

END STATE
- git status --porcelain: <verbatim, expected empty>

DEVIATIONS
<everything unexpected, or "none". A missing Deviations section is itself
an audit failure.>
```
