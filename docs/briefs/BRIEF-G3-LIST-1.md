# BRIEF-G3-LIST-1 — Enumerate every Grade 3 source document

**Type: READ-ONLY. This brief makes NO changes to any file in the repo.**
**No authoring. No engine changes. No commits. No push.**

Expected duration: ~2 minutes.

---

## 0. SCOPE FENCE

- Touch **nothing** outside `sources-g3/`.
- Do **not** open, parse, extract, or read the *contents* of any `.docx`.
  This brief lists filenames only. Opening documents is a later brief.
- Do **not** create, move, rename, or delete any file.
- Do **not** stage, commit, or push.
- Do **not** modify `docs/ISSUES.md`. This brief commits nothing, so the
  standing "every brief that commits ends with an ISSUES update" rule does
  not apply.
- `lessons/`, `lessons-g3/`, `word-staging\` and every other grade's sources
  are **out of scope**. Do not read them, do not count them, do not mention
  them except where §3 explicitly asks.

---

## 1. WHY THIS EXISTS

Grade 3 Phase 1 requires selecting three maximally-different lessons
(fact-fluency, word problem, figure/diagram). That selection is a chat-side
judgment and cannot be made from folder names alone.

Prior handoffs record that `sources-g3/` contains **198 `.docx` files**
(CONFIRMED, 52,659,112 bytes, `docs/audits/G3-SURVEY.md`). That number is the
reconciliation target in §4.

**This listing is permanent reference material.** It will be used for every
Phase 1 and Phase 3 selection decision, not just the first three.

---

## 2. TASK A — enumerate

Working from the repo root (`C:\Users\Venkat Rao\Desktop\rao-academy`), walk
the directory `sources-g3/`.

For **every** subfolder of `sources-g3/`, in alphabetical order by folder name:

1. Print the folder name as a heading.
2. Print every file in that folder whose extension is `.docx`
   (case-insensitive), **one filename per line, verbatim**, in alphabetical
   order. Do not truncate. Do not abbreviate. Do not "clean up" or normalise
   the names — reproduce them exactly as they appear on disk, including
   spaces, capitalisation, punctuation and any trailing spaces before the
   extension.
3. Print the count of `.docx` files in that folder.

Then, separately:

4. Report any `.docx` files sitting **directly** in `sources-g3/` (not inside
   a subfolder), with a count. If there are none, say **zero**.
5. Report any subfolder containing **zero** `.docx` files, by name.
6. Report any file in any of these folders whose extension is **not** `.docx`,
   grouped by extension, with counts. Filenames are not required for these —
   extension and count is enough. If there are none, say **none**.
7. Report whether any subfolder contains further **nested** subfolders. If so,
   name them and state whether they contain `.docx` files. Do **not** silently
   flatten a nested structure into the parent's count.

**Anti-laundering:** if a filename is unreadable, contains characters that
cannot be rendered, or the tooling mangles it, say so explicitly and mark it
**UNREADABLE** rather than guessing at or approximating the name.

---

## 3. TASK B — reconcile the total

Print:

- The **grand total** of `.docx` files found across all subfolders plus any
  loose ones from §2.4.
- The **expected** total: **198**.
- Whether they **MATCH** or **DIFFER**.

**If they differ:** do not proceed, do not investigate further, do not attempt
a fix. Report the two numbers, the per-folder counts, and **STOP**. State
plainly that the discrepancy is unresolved and is a chat-side ruling. Chasing
it is not authorised by this brief.

Do **not** adjust, filter or re-scope the count to make it reach 198. Report
what is on disk. **Never tune a check to hit an expected count.**

---

## 4. STOP CONDITIONS

- **`sources-g3/` does not exist** at the repo root → report that fact and
  stop. Change nothing. Do not go looking for it elsewhere, and do not
  substitute `word-staging\word docs-g3\`.
- **`sources-g3/` exists but is empty** → report that and stop.
- **Total differs from 198** → report per §3 and stop.
- **Any operation would write to disk** → do not perform it. This brief is
  read-only.

A correct stop is a success.

---

## 5. OUTPUT FORMAT

Print the report to the terminal. Do **not** write it to a file — nothing in
the repo changes, including new untracked files.

Structure:

```
=== BRIEF-G3-LIST-1 REPORT ===

## <Folder name 1>
<filename>.docx
<filename>.docx
...
COUNT: <n>

## <Folder name 2>
...
COUNT: <n>

...

=== ANOMALIES ===
Loose .docx directly in sources-g3/: <n or zero>
Empty subfolders: <names or none>
Non-.docx files: <extension: count, or none>
Nested subfolders: <names + whether they hold .docx, or none>
Unreadable filenames: <list or none>

=== RECONCILIATION ===
GRAND TOTAL: <n>
EXPECTED:    198
RESULT:      MATCH | DIFFER

=== END REPORT ===
```

---

## 6. WHAT SUCCESS LOOKS LIKE

Every `.docx` in `sources-g3/` is named verbatim, grouped by its folder, with
counts that sum to a stated grand total, reconciled against 198, and every
anomaly disclosed. **Nothing on disk has changed.**
