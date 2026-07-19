# BRIEF-G3-PILOT1-PREP-V3 — Cleanup · entry check · HOLD list · twins enumeration · pilot 1 extraction

Supersedes BRIEF-G3-PILOT1-PREP-2026-07-19 v1/v2. v2 executed Parts A–C
read-only on 2026-07-19 and stopped correctly on entry-gate deviations; this
version incorporates the chat's rulings on all six deviations from that run.

Writes inside the repo: Part A0 deletions, `docs/G3-HOLD-DUPES.md`,
`docs/extractions/G3-PILOT1-EXTRACTION.md`, and the brief archives in
Part E. Nothing else. Scratch work in system temp, outside the repo,
deleted at the end. Report unknowns as UNKNOWN (anti-laundering law). If an
instruction cannot be followed exactly, STOP that part and record it in
Deviations rather than improvising.

---

## Part A0 — Authorized cleanup (rulings on v2 deviations 1–2)

1. Delete `BRIEF-G3-ENTRY-DUPES-2026-07-19.md` from the repo root. Ruling:
   it was NEVER EXECUTED, so the archive-never-delete rule (which covers
   executed briefs) does not apply. Record the deletion in the report.
2. `BRIEF-G3-PILOT1-PREP-2026-07-19-v2.md` WAS executed (read-only,
   Parts A–C). Move it to
   `docs/briefs/BRIEF-G3-PILOT1-PREP-2026-07-19-v2.md` (md5-verify) — it
   is archived in Part E's commit.

## Part A — Entry check (re-baselined per chat ruling)

Report actual observed values:

1. `git status --porcelain` + `git rev-parse HEAD`. After Part A0, the only
   acceptable untracked/changed paths are this brief in the root and the
   v2 brief now sitting in `docs/briefs/`. Anything else → stop after
   Part C, report.
2. Engine `__version` from `engine/preview-engine.js`.
3. **G4 fence baseline:** record VERBATIM the totals line of
   `LESSONS-MANIFEST.md` and the HEAD hash. The known contradiction between
   that line (118 / 3,075) and its stale reconciliation paragraph is
   OWNED BY THE GRADE 4 CHAT — do not fix, do not chase. This session's
   fence guarantee is: that line and every Grade 4 path are UNCHANGED by
   this brief (verified in Part E).
4. `sources-g3/`: recursive `.docx` count (expected 198) and the FULL LIST
   of topic folder names (expected 23 per the v2 run — the scan's "24" is
   presumed erroneous; report the actual names so the chat has ground
   truth).
5. `docs/GRADE3-CAPABILITY-SCAN.md`: byte size + md5.

## Part B — Create `docs/G3-HOLD-DUPES.md` (three sections)

Header: "HOLD & TWINS REGISTER — created by BRIEF-G3-PILOT1-PREP-V3.
Sections 1–2 are EXCLUDED from all Grade 3 conversion batches until Venkat
rules. Section 3 is NOT held — see its header."

**Section 1 — G3-internal suspected duplicates (HELD).** The scan's
duplicate-flag section copied VERBATIM, followed by a flat one-per-line
list of every file path it names (all members of every pair/group). Add
nothing of your own here.

**Section 2 — Pattern-match addition (HELD).**
`sources-g3/Time/_A.M. or P.M_.docx` — held by chat ruling: the scan's
underscore-prefixed count of 13 includes this file (disk shows 12 in the
folders the scan named + this one); the scan misattributed its folder.
State exactly that.

**Section 3 — Cross-grade twins (ENUMERATED, NOT HELD).** Chat ruling:
twins convert normally; they pose no G3-internal duplication risk, and
every twin's variation plan must state its differentiation from the Grade 4
counterpart. Enumerate them MECHANICALLY and label the method:
- Criteria: normalize each G3 source document's topic (from filename and
  the document title if trivially readable) — lowercase, strip punctuation/
  underscores — and match against the normalized lesson names in
  `LESSONS-MANIFEST.md` (read-only). A match = same skill topic (e.g.
  "division facts to 10"). Borderline cases go in a MAYBE sub-list, not
  the match list.
- Record each as: `<G3 path> ↔ <G4 lesson name>`.
- Header must state: "Enumerated by criteria above, NOT verbatim from the
  scan (the scan said '~20 documents' with an ellipsis). Not held."

Copy all three sections' file lists into the report.

## Part C — Pilot candidates

Copy VERBATIM the scan's closing section naming the three zero-gap pilot
candidates. Pilot 1 is the first named. Cross-check pilot 1 against
**Sections 1–2 only** — Section 3 does NOT stop a pilot. If pilot 1 is in
Section 1 or 2: STOP after this part and report; do not substitute pilot 2.
If pilot 1 appears in Section 3 (expected — Grade 4 ships
`Division_facts_to_10.html`), note the pairing and proceed.

## Part D — Stage 2 faithful extraction of pilot 1

Unchanged from v2. In full:

Goal: a complete, verified inventory of pilot 1's source document, detailed
enough that the chat can design the variation plan without ever seeing the
.docx. The sources are SCREENSHOT-BASED: READ EVERY IMAGE.

1. Copy pilot 1's `.docx` to the temp dir, extract as a zip, open every
   image under `word/media/` in DOCUMENT ORDER (cross-reference
   `word/document.xml` relationship order — filesystem order is not
   reliable).
2. For EVERY question record: sequence number (document order) · verbatim
   stem (including method-instruction wording) · implied question type
   (fill-blank / single-select / multi-select / expression / other,
   described) · all options verbatim · the source's printed answer or
   UNKNOWN · **your independently computed answer** (compute in Python,
   never mental math, never copied from the source) · MATCH / MISMATCH /
   SOURCE-ANSWER-UNKNOWN · figure dependency + one-line description ·
   source image filename(s).
3. Document level: printed title/topic · total question count · observed
   difficulty arc · monotony patterns (e.g. "q4–q18 identical computation,
   different numbers") · and, since pilot 1 twins a Grade 4 lesson: the
   G4 counterpart's name and question count from the manifest (read-only,
   for the chat's differentiation planning — do not open the G4 lesson).
4. Unreadable/ambiguous image → record the question as UNREADABLE with the
   filename; never reconstruct from context.
5. Write the full inventory to `docs/extractions/G3-PILOT1-EXTRACTION.md`
   (create folder if absent), MISMATCH/UNREADABLE items in a dedicated
   section at top.
6. Paste into the report: document-level summary, type tally, every
   MISMATCH and UNREADABLE in full, first 3 questions as full-record
   samples.

## Part E — Local commit (no push)

1. Copy this brief byte-for-byte to `docs/briefs/BRIEF-G3-PILOT1-PREP-V3.md`
   (md5-verify), remove the root copy.
2. Stage exactly: the two archived briefs (v2 + v3), `docs/G3-HOLD-DUPES.md`,
   `docs/extractions/G3-PILOT1-EXTRACTION.md`. Nothing else staged or
   modified — in particular ZERO Grade 4 paths.
3. Commit locally, message:
   `G3 pilot prep v3: HOLD register (dupes held, twins enumerated) + pilot 1 extraction; deletes never-run ENTRY-DUPES brief from root`
   30-minute timeout on the command (standing rule); let the pre-commit
   gate finish; never --no-verify.
4. Do NOT push. Report: commit hash, `git show --stat` enumeration,
   pre-commit gate closing output.
5. **Fence verification:** confirm the `LESSONS-MANIFEST.md` totals line is
   byte-identical to the Part A baseline and that the commit touched no
   Grade 4 path. Report both explicitly.
6. Delete the temp dir. Final `git status --porcelain` must be empty;
   report verbatim.

## Part F — Report format

```
CLEANUP
- ENTRY-DUPES deleted: <yes/details>
- v2 brief archived: <path, md5 verified>

ENTRY CHECK
- status/HEAD: <verbatim>
- engine __version: <value>
- G4 fence baseline: <totals line verbatim> @ <HEAD>
- sources-g3: <n> .docx; folders (<n>): <full name list>
- scan doc: <bytes> bytes, md5 <hash>

HOLD REGISTER
- Section 1 (held, scan-verbatim): <flat list>
- Section 2 (held, pattern-match): <entry>
- Section 3 (twins, NOT held, criteria-enumerated): <G3 ↔ G4 list>
  MAYBE sub-list: <list or none>

PILOT CANDIDATES (scan closing section, verbatim)
<text>
- Pilot 1 = <path> · Section 1/2: NO · Section 3 twin: <G4 lesson or none>

PILOT 1 EXTRACTION SUMMARY
- title/topic · total questions (readable/unreadable) · type tally ·
  difficulty arc + monotony notes · G4 twin (name, q-count) ·
  answer verification: <n> MATCH / <n> MISMATCH / <n> SOURCE-ANSWER-UNKNOWN
- MISMATCHES + UNREADABLES in full: <each or none>
- sample (first 3 questions, full records)
- extraction file: <path>, <bytes> bytes

COMMIT
- hash (LOCAL, not pushed) · git show --stat · gate output
- FENCE: manifest totals line unchanged: <yes + verbatim> · G4 paths in
  commit: <none / list>

END STATE
- git status --porcelain: <verbatim, expected empty>

DEVIATIONS
<everything unexpected, or "none". A missing Deviations section is itself
an audit failure.>
```
