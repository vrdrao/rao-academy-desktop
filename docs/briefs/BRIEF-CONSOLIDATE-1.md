# BRIEF-CONSOLIDATE-1

**Purpose.** Venkat cannot tell which folder holds what. Five folders contain
lesson files, ~50 loose brief/report files sit in the repo root, and a folder
named `incoming/` exists at two different levels. This brief ends that.

**Target end state:** ONE folder of raw lessons (`lessons/`), ONE folder of
rendered pages to review (`review/`), no Grade 3 inside the repo, and a clean
root.

**Authority:** `STUDENT-INTERACTION-RULES.md` (rules 1–18, now in git).

**Context that makes this safe:** nothing has been imported into the live app.
Nothing outside this repo reads these folders. The only consumers are the test
suite and `tools/make-review.js`.

---

## HARD CONSTRAINTS

1. **NOTHING IS DELETED. Everything moves.** Grade 3 leaves the repo but is
   preserved on disk. Loose files move into `docs/`. If a step seems to call for
   deletion, STOP and report instead.
2. **PASS 1 IS READ-ONLY.** Do not move a single file until Venkat has ruled on
   the Pass 1 findings. **HALT at the end of Pass 1.**
3. **COMMIT UNTRACKED FILES BEFORE MOVING THEM.** The ~50 root files are not in
   git. Untracked + moved = no history and no undo. Add and commit them **where
   they currently sit**, as their own commit, before any move. This ordering is
   the entire safety story of this brief.
4. **Use `git mv`, never a plain move**, so history follows the file.
5. **Do not push.** Commit locally; Venkat pushes through TortoiseGit.
6. **Do not edit the contents of any lesson, engine or doc file.** This brief
   moves files. It does not change them.
7. **Chase every changed number.** Lesson counts must be identical before and
   after (103 Grade 4). If any count shifts, HALT and reconcile.

---

# PASS 1 — SURVEY THE UNKNOWNS (READ-ONLY, THEN HALT)

For **each** folder below report: file count and types, whether tracked in git,
whether anything in the repo references it (search `tools/`, `package.json`,
`.githooks/`, `CLAUDE.md`, test files), whether it is inside `npm test` scope,
and the newest file date.

- **`incoming/`** (repo ROOT — this is a DIFFERENT folder from `lessons/incoming/`).
  The survey found 2 `.html` files with no question markers. **What are they?**
- **`sources/`** — 21 legacy-format lessons, dated 2026-07-19. **The decisive
  question: was every one of these converted into a lesson now living in
  `lessons/` or `lessons/incoming/`?** Match by content or title, not filename —
  names may differ. **Report any source with NO corresponding live lesson.**
  Those are unconverted originals and must not be moved.
- **`sources-g3/`** — Grade 3 source material. Count and size only.
- **`archive/`** — contains `lessons-1to1/` (15 archived duplicates). Anything else?
- **`mockup/`** — 1 `.html`. What is it, and does anything reference it?
- **`deploy-drop/`** — reported as engine files + `DEPLOY.md`. Confirm no lessons.
- **`.format-diff/`** — purpose? Is it generated output or something a tool needs?
- **`tools/scratch/`** — 5 `.html`, **one of which contains question markers.**
  Identify that file: is it a real lesson, a fixture, or a leftover?
- **`lessons/_preview/`** — 4 `.preview.html` fixtures. Does any tool or test
  read them, or are they orphaned?

Also report: the total count of loose `BRIEF-*.md` and `REPORT-*.md` files in the
repo root, and whether `docs/briefs/` and `docs/reports/` already exist.

**HALT HERE.** Write the findings and stop. Do not proceed to Pass 2.

---

# PASS 2 — EXECUTE (only after Venkat rules on Pass 1)

Run in this exact order. **Each step is its own commit** so any single step can
be undone without unwinding the rest.

### Step 1 — Rescue the untracked files (COMMIT FIRST, MOVE LATER)

`git add` every untracked `BRIEF-*.md` and `REPORT-*.md` in the repo root and any
other untracked non-generated documentation. Commit **in place**, no moves.

Do NOT add: `node_modules/`, generated output, or anything already ignored.

Commit message: `chore: track loose brief and report files (no moves)`

**Report the count added.** These files are the written record of every ruling
Venkat has made and have existed on one laptop with no backup.

### Step 2 — Merge `lessons/incoming/` into `lessons/`

`git mv` all 84 files from `lessons/incoming/` up into `lessons/`.

**Pre-check:** confirm zero filename collisions before moving. (The 2026-07-23
survey found none — re-verify, do not assume.) If any collision exists, **HALT.**

Then:
- Update any path reference to `lessons/incoming/` in `tools/`, `package.json`,
  `.githooks/`, `CLAUDE.md`, test files, or docs. **Enumerate every file changed.**
- Remove the now-empty `lessons/incoming/` directory.
- **`lessons/` must now contain exactly 103 lesson files.** Report the count.

Commit message: `refactor: merge lessons/incoming into lessons (103 lessons, one folder)`

### Step 3 — Regenerate every review page

The move invalidates the source path baked into each review page. Regenerate all
103 Grade 4 review pages against their new `lessons/` locations.

**Do not regenerate** the 5 non-lesson pages (`_INTERACTION-ATLAS.html`,
`_INTERACTION-ATLAS-2.html`, `index.html`, `_RETRY-STATE-2-flicker-demo.html`,
and the Grade 3 `multiplication_facts_up_to_10.html` — see Step 4).

Then run **full `npm test`**. It must be green. **If it is red, HALT and report —
do not attempt a fix.**

Commit message: `chore: regenerate review pages after lessons merge`

### Step 4 — Move Grade 3 out of the repo

**Venkat's ruling: moved out, NOT deleted.**

Create `../rao-academy-grade3-parked/` — a sibling folder beside the repo, on the
Desktop, **outside** it. Move into it:
- `lessons-g3/` (2 lessons)
- `sources-g3/`
- `review/multiplication_facts_up_to_10.html` (the Grade 3 review page)

Then:
- Remove any Grade 3 path reference from test scope, `CLAUDE.md`, or tooling.
- Write `../rao-academy-grade3-parked/README.md` recording: what this is, that it
  was parked 2026-07-23 per Venkat's scope ruling (Grade 3 waits for Grade 4
  completion), that it is **not deleted**, and what would be needed to bring it
  back.
- **Report whether `GRADE3-CHARTER.md` or similar Grade 3 governance docs exist
  in the repo. Do NOT move them without asking** — they may be referenced.

Commit message: `chore: park Grade 3 outside the repo (not deleted)`

### Step 5 — Archive the loose brief and report files

`git mv` from the repo root:
- `BRIEF-*.md` → `docs/briefs/`
- `REPORT-*.md` → `docs/reports/`

Create either folder if missing. `docs/briefs/` already exists by convention
(`docs/briefs/BRIEF-<name>-<date>.md`) — follow it.

**Leave in the root:** `STUDENT-INTERACTION-RULES.md`, `CLAUDE.md`, any README,
`.gitignore`, `.gitattributes`, `package.json`, and any handoff file. **If unsure
whether a file belongs in the root, leave it and report.**

Commit message: `chore: archive briefs and reports into docs/`

### Step 6 — Whatever Venkat ruled from Pass 1

Only the folders he explicitly ruled on. Nothing else moves.

### Step 7 — The guard that stops this recurring

Add a check that **fails** if a lesson file (`.html` containing `<!--@q`) exists
anywhere outside `lessons/`, `review/`, `archive/`, and `lessons/_preview/`.

**Guard-first: prove it FAILS before it passes.** Temporarily place a lesson file
in a disallowed location, confirm the check goes red, remove it, confirm green.
**Report both observations.** A guard that has never failed is not trusted.

Register it in `npm test`.

Commit message: `test: guard against lesson files outside canonical folders`

---

## REPORTING

Per step: what moved, the count before and after, every reference updated, and
the commit hash.

**Final state to confirm explicitly:**
- `lessons/` = 103 files, one folder, no `incoming/`
- `review/` = 107 pages (108 minus the Grade 3 one)
- No Grade 3 content anywhere in the repo
- Repo root free of `BRIEF-*` / `REPORT-*`
- Full `npm test` green
- The Step 7 guard seen failing, then passing

**Do not push.** If anything is ambiguous at any point, STOP and ask.
