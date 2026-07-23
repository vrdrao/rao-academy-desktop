# BRIEF-REVIEW-PATH-1 — map every `review/` path reference before anything moves

**Type: READ-ONLY. This brief makes NO changes to any file.**
**No moves. No renames. No tool changes. No commits. No push.**

Expected duration: ~15 minutes.

---

## 0. SCOPE FENCE

- Read only. Do **not** create, move, rename, delete or edit any file.
- Do **not** modify `tools/make-review.js` or any other tool.
- Do **not** regenerate any review page.
- Do **not** delete the existing untracked
  `review/multiplication_facts_up_to_10.html` — it is Venkat's current review
  artifact and he is reading it right now.
- Do **not** stage, commit or push.

**If a task cannot be completed read-only, report that and stop. Do not
improvise a write.**

---

## 1. WHY THIS EXISTS

`tools/make-review.js` writes review pages into a **flat `review/` directory**,
regardless of which grade the source lesson came from. Grade 3's first authored
lesson landed at `review/multiplication_facts_up_to_10.html`, alongside Grade 4's
pages.

**The measured hazard:** Grade 3 and Grade 4 share skill names. `sources-g3/`
contains `Division facts up to 10`, `Multiplication word problems`,
`Multiplication input_output tables` and others whose Grade 4 counterparts
already exist. If two grades produce the same output filename, **one review page
silently overwrites the other** — and the review page is the artifact Venkat
opens every day.

The proposed fix is to make review output mirror its source directory
(`lessons/` → `review/`, `lessons-g3/` → `review-g3/`), extending to future
grades automatically.

**That fix is NOT authorised by this brief.** The parked `lessons/incoming/`
consolidation carries the standing warning that a path change *"needs a
read-only scan of every lesson-path reference first."* The same discipline
applies here. **This brief measures. A later brief decides.**

**Chat has not read `tools/make-review.js`.** Everything above about how it
behaves is inference from its output filename. Treat chat's description as
UNMEASURED and report what the file actually does.

---

## 2. TASK A — read the tool

Read `tools/make-review.js` in full and report:

1. **How the output path is constructed.** Quote the relevant lines with line
   numbers. Is `review/` hard-coded, derived from the input path, read from a
   config, or passed as an argument?
2. **Whether it takes an output-path argument** already. If it does, the fix may
   be a calling-convention change rather than a tool change — say so.
3. **What it does if the output file already exists** — overwrite silently,
   refuse, prompt, or back up. **This determines whether the collision hazard is
   real or already handled.** Quote the code.
4. **Whether it creates the output directory** if missing (`mkdir -p` behaviour),
   or assumes it exists.
5. **Whether it embeds the engine and CSS by path**, and if so which paths.
   (The report of the last run named `engine/rao-card.css` and
   `engine/rao-card.js`.) Quote them.
6. **Any grade assumption anywhere in the file** — a hard-coded `lessons/`, a
   grade string, a manifest lookup. Quote each with a line number, or state
   **none found**.

---

## 3. TASK B — find every reference to the review path

Search the **whole repo**, excluding `node_modules/`, `.git/`, and any
`sources-g*/` directories, for references to the review output location.

Report every hit with **file, line number, and the line itself**, grouped by
file. Search for at least:

- `review/`
- `make-review`
- `makeReview`
- `review-page`, `reviewPage`, `reviewDir`

Cover, at minimum:

- `tools/` — every script
- `.githooks/` — pre-commit and pre-push
- `package.json` — every script entry
- `CLAUDE.md`, `LESSONS-MANIFEST.md`, `GRADE-ROLLOUT-PLAYBOOK.md`, and any
  `docs/*.md`
- `.gitignore` — **state explicitly whether `review/` is ignored, partially
  ignored, or tracked.** Quote the relevant lines.

**For each hit, classify it:**

- **BINDING** — code that would break if the path changed
- **DOCUMENTATION** — prose that would merely become stale
- **INCIDENTAL** — a mention that neither breaks nor misleads

Do not merge the classes. A count per class is required.

---

## 4. TASK C — inventory what is in `review/` today

1. Total file count in `review/`, and total size.
2. How many are **tracked** vs **untracked** (`git ls-files` vs
   `git status --porcelain`). Report both numbers.
3. Name any file in `review/` that is **not** a per-lesson review page —
   `index.html` is known to exist and is recorded as having no lesson source.
4. **The collision check.** For every `.html` in `review/`, determine whether a
   source lesson of that name exists in `lessons/`, in `lessons-g3/`, in
   **both**, or in **neither**. Report the four counts, and **name every file in
   the "both" and "neither" groups.**

   **The "both" group is the measurement this brief exists for.** If it is zero
   today, say zero — that is a real and useful result, and it means the hazard is
   prospective rather than present.

---

## 5. TASK D — name the collision surface prospectively

Without opening any `.docx`, compare **filenames only**:

1. List the 198 Grade 3 source document names (from `sources-g3/`, all
   subfolders) reduced to a normalised slug — lowercase, spaces and hyphens to
   underscores, extension dropped.
2. List every existing Grade 4 lesson filename in `lessons/` (including
   `lessons/incoming/` if lessons live there), normalised the same way.
3. **Report every slug that appears in both lists**, with its Grade 3 source path
   and its Grade 4 lesson path.

State the normalisation rule you used, exactly, so the result is reproducible.

**This is an estimate of future collisions, not a defect count.** Grade 3 lesson
filenames are not yet decided and may differ from their source document names.
Label the number **PROSPECTIVE** in the report. Do not present it as a measured
defect.

---

## 6. STOP CONDITIONS

- `tools/make-review.js` not found → report and stop.
- `review/` does not exist → report and stop.
- Any task would require a write → do not perform it; report which task and why.
- If the collision count in Task C.4 "both" is **zero** and Task D's prospective
  count is **zero**, say so plainly and recommend **closing this as
  not-a-defect** — the standing rule is that if the measured count is zero, close
  it and change nothing.

A correct stop is a success. A zero is a result.

---

## 7. OUTPUT FORMAT

Terminal only. **Do not write a report file.**

```
=== BRIEF-REVIEW-PATH-1 REPORT ===

--- TASK A: THE TOOL ---
Output path construction:  <how, with line numbers + quoted code>
Takes an output argument:  YES <how> | NO
On existing output file:   overwrite | refuse | prompt | backup  <quoted code>
Creates output dir:        YES | NO
Engine/CSS embedded from:  <paths, quoted>
Grade assumptions:         <quoted lines, or none found>

--- TASK B: REFERENCES ---
BINDING       (<n>):  <file:line — content>
DOCUMENTATION (<n>):  <file:line — content>
INCIDENTAL    (<n>):  <file:line — content>
.gitignore status of review/: <ignored | partially | tracked, quoted>

--- TASK C: REVIEW/ TODAY ---
Files: <n>   Total size: <n>
Tracked: <n>   Untracked: <n>
Non-lesson files: <names>
Source match:  lessons/ only <n> · lessons-g3/ only <n> · BOTH <n> · NEITHER <n>
BOTH:    <names or none>
NEITHER: <names or none>

--- TASK D: PROSPECTIVE COLLISIONS ---
Normalisation rule used: <state it>
G3 source slugs: <n>   G4 lesson slugs: <n>
Slugs present in both (PROSPECTIVE): <n>
<list: slug — g3 source path — g4 lesson path>

--- REPO STATE ---
Files created:   none
Files modified:  none
git status clean of new changes: YES

=== END REPORT ===
```

---

## 8. WHAT SUCCESS LOOKS LIKE

Every binding reference to the review path named with a line number, the
overwrite behaviour of `make-review.js` established from its code rather than
inferred, today's collisions counted, and tomorrow's estimated and labelled as an
estimate — **with nothing on disk changed.**

If the honest answer is that there is no collision and no hazard, that is a
successful outcome and the fix should not be built.
