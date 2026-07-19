# BRIEF CLEANSTART — sb-tile touch fix · review/ regeneration · deploy-drop refresh · housekeeping

Approved by Venkat 2026-07-19, after the engine chat's audit of FR-1 (`4bbb5b8`,
pushed). Runs in a **fresh Claude Code session**: read `CLAUDE.md` fully first,
then `GRADE-ROLLOUT-PLAYBOOK.md`, then this brief.

Prior context: `docs/briefs/BRIEF-FR-1-2026-07-19.md` — the amended LAW 3, the
snapshot-restore reset mechanism, and the Deviations section that spawned this
brief.

**Scope fence: GRADE 4 ONLY.** `lessons-g3/` is out of scope for counts, guards,
fixes, regeneration, and the deploy drop. Do not read it, count it, or touch it.
If any command you write would sweep it, exclude it explicitly and say so in the
report.

**Supersedes `BRIEF-FR-2.md`** (self-written by a prior Claude Code session,
never authorized, never run). That file is deleted in item 4. Do not read it for
guidance; where its ideas were sound they are already restated here.

---

## Standing rules for this brief

- **You never push.** Commit only; Venkat pushes after the engine chat's
  enumerated audit.
- **One commit per item**, in the order given. Items are independent: if one
  fails, log it, leave it uncommitted, and continue to the next.
- **No `__version` bump.** No engine JavaScript is touched by this brief.
  `engine/preview-engine.js` and `engine/rao-card.js` stay byte-identical at
  `rao-master-20`. The engine is forward-only; rolling back is prohibited.
- **Anti-laundering.** If a number, a cause, or a result is unknown, say
  "unknown" and say why. Do not convert an unverified count into a
  confident-sounding label.
- **No scope self-commissioning.** If you find a defect outside this brief's
  allowed files, report it in Deviations. Do not fix it. Do not pre-type a
  follow-up task.

**Allowed files.** Touching anything not on this list is a STOP-and-report:

```
rao.css
tools/verify-reset.js
review/**            (generated output)
deploy-drop/**        (generated output)
DEPLOY.md
docs/briefs/          (archive of this brief)
docs/handoffs/        (item 4)
BRIEF-FR-2.md         (deletion only)
BRIEF-CLEANSTART.md   (archive/move only)
```

---

## Phase 0 — read-only inventory (no edits, no commits)

Report all of the following verbatim before making any change. These are
measurements, not assertions: **do not compare them against any number quoted
from memory or from a handoff.** Numbers in this repo's documentation are known
to be stale.

1. `git log --oneline -1` and `git status --porcelain` (confirm the tree is
   clean apart from `BRIEF-FR-2.md` and this brief).
2. Exact count of files in `review/`, and the count broken down as: pages
   generated from lessons, versus `index.html` or any other non-lesson file.
3. How many files in `review/` contain the string `rao-master-19`, and how many
   contain `rao-master-20`.
4. Exact count of `.html` files in `lessons/` (recursive, excluding
   `_preview/`), and separately how many of those are `_`-prefixed.
5. Whether `package.json` has a `review` script, and whether
   `tools/make-review.js` accepts a no-argument bulk mode or is single-lesson
   only. Quote the relevant lines.
6. `rao.css` line 611 and its surrounding rule, quoted verbatim.

**Pre-ruled, so you do not stall:** if a bulk regeneration path exists
(`npm run review` or a no-arg mode), use it. If it does not, write a throwaway
sweep script that loops the real `tools/make-review.js` once per lesson — never
a reimplementation of its logic. Either way item 2's assertions below apply
unchanged.

Print the Phase 0 report, then continue without waiting.

---

## Item 1 — sb-tile touch fix (guard-first)

**The defect.** `rao.css:611` applies `touch-action:none` to
`.tile`/`.vs-tile`/`.order-slot` but not `.sb-tile`. On a real touch device a
finger drag on a sequence-build tile pointercancels into a page scroll, so the
drag is dead. The tap-arm/tap-slot path still works, so children can answer —
this is broken-feeling, not blocking. **31 Grade 4 questions.**

### 1a. Guard first — prove it fails

Extend `tools/verify-reset.js` so that in the **mobile pass only** (390×844,
real CDP `Input.dispatchTouchEvent`), the first sequence-build placement is a
genuine touch drag — `touchStart` → multiple `touchMove` → `touchEnd` — with an
assertion that the target slot ends up filled.

Run it against the **current, unfixed** `rao.css`. It must **FAIL**. Paste the
actual FAIL line into the report. A guard that has never been seen red is not
trusted here.

If it passes before the fix, **STOP and report** — that means the drive is not
exercising the real drag path, and the whole item is unsafe to proceed with.

### 1b. The fix

Exactly one edit: add `.sb-tile` to the existing `touch-action:none` rule at
`rao.css:611`. Nothing broader.

Do **not** add `.sb-slot`. Every sequence-build drag begins on a tile or on a
placed clone, and clones retain the `.sb-tile` class — `.sb-slot` would widen
the rule with no case behind it.

### 1c. Prove it passes, then prove the guard still bites

1. Re-run the guard. It must PASS. Paste the actual line.
2. **Sabotage round-trip:** revert the one-line CSS change, re-run, show the
   FAIL again, restore the fix, re-run, show the PASS. Paste all four results.
   Confirm the sabotage is gone (`grep -c` on the reverted text = 0).

### 1d. Tidy

Remove the now-stale `NOTE` in `tools/verify-reset.js` that describes the
sb-tile drag as a known unfixed defect, including its console output line. Same
discipline as the verify-touch inversion in FR-1: a comment that documents a
fixed defect is a lie waiting to mislead.

### 1e. Gate and commit

Full `npm test`, exit code checked directly — **do not pipe it**, a pipe masks
the exit code. Report the real exit code and the banner.

Commit message names the fix, the guard extension, and the 31-question blast
radius.

---

## Item 2 — regenerate `review/*.html` at rao-master-20

**Why.** Review pages inline the engine and the CSS at generation time; they are
snapshots, not live views. Every one of them currently plays rao-master-19 — the
old ✕ behavior. **Venkat cannot see his own product at rao-master-20 until this
lands.** This is the highest-value item in the brief.

**Order matters:** this runs *after* item 1 is committed, because review pages
inline `rao.css` verbatim. Regenerating first would bake the broken
`touch-action` line into every page.

### Assertions — all mandatory, all measured

Using the Phase 0 numbers as the baseline (not any number from memory):

1. The **set of filenames** in `review/` after regeneration is **identical** to
   the set before — same names, same count. Any file added or removed is a
   **STOP-and-print**, not a skip.
2. Every regenerated lesson page contains `rao-master-20`.
3. **Zero** files in `review/` contain `rao-master-19`.
4. Any page that cannot be regenerated is a **STOP-and-print** naming the file
   and the error. Never skip silently.
5. Non-lesson files in `review/` (e.g. `index.html`) are expected to contain no
   engine string at all. State how many such files there are and confirm they
   are unchanged.

Print the before-count, the after-count, and both grep counts as explicit
numbers in the report. If any two disagree with each other, stop and say so
rather than reconciling them yourself.

Confirm `_`-prefixed lesson files remain skipped by the generator, as designed —
and state plainly in the report that `lessons/_type-coverage.html` therefore has
**no** review page, so it cannot be used to eyeball the fix in a browser.

Commit.

---

## Item 3 — refresh `deploy-drop/` for rao-master-20

Rebuild the drop from the current tree, **engine first, lessons second**, per
`DEPLOY.md`.

- Prove faithfulness with a **source-vs-destination md5 table, per file**. Byte
  identity is the assertion; "copied successfully" is not.
- Re-pin `DEPLOY.md` to item 1's commit hash. (A commit cannot contain its own
  hash — that is why the pin references item 1, matching how the existing drop
  pins its own predecessor.)
- The drop ships as **rao-master-20**. No version bump.

Commit.

---

## Item 4 — housekeeping

1. **Delete `BRIEF-FR-2.md`** from the repo root. It was written by a prior
   Claude Code session without authorization and must not survive as a runnable
   artifact.
2. **Archive this brief** to `docs/briefs/BRIEF-CLEANSTART-2026-07-19.md` and
   remove it from the repo root, matching how FR-1's brief travelled.
3. **Commit any `HANDOFF-*.md` files Venkat has placed in the repo root** to
   `docs/handoffs/`. Do not author, reconstruct, or infer the content of any
   handoff — commit only files that physically exist. List exactly which ones
   you found, by name. If none are present, say so and continue.

Commit.

---

## Traps this repo has already charged for — do not rediscover them

- A tap within ~350 ms of a touch drag can be swallowed by Chrome's gesture
  recognizer as a double-tap candidate. Pause before tapping after a drag.
- The reset **is** a re-mount, so load animations replay by design.
  `__settleAnims` in `tools/verify-reset.js` already handles this — a
  mid-animation transform is not a state difference.
- `verify-tracked.js` fails on files that exist but are not `git add`-ed. Add
  before running the gate.
- **Never pipe `npm test`.** The pipe masks the exit code and a failing suite
  will look green.
- `_type-coverage.html`'s **last** question is load-bearing — `verify-touch`
  drives "the last card on the page". Do not append after it.
- `.order-slot` carries `transition:border-color .15s`. Wait ~250 ms before
  reading `getComputedStyle`.

---

## Report format (mandatory)

1. Phase 0 inventory, verbatim.
2. Per item: what changed, actual guard output (FAIL then PASS where required),
   the numbers, the commit hash.
3. **Shipped-file table: md5 + bytes on disk**, every file touched.
4. Full `npm test` result with the real exit code and banner.
5. **Deviations** — mandatory section, even if empty. Anything you could not do
   faithfully, anything you found and did not fix, anything where the brief's
   literal instruction did not fit what you met. State it plainly; a disclosed
   deviation is cheap and a hidden one is expensive.
6. Enumerated commit list, with the reminder that all commits are **UNPUSHED**.
