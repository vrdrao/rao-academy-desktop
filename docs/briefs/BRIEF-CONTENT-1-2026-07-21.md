# BRIEF-CONTENT-1 — Item 33 (stray ₹) and Item 38 (middot reads as multiply)

**Chat-authored. Execute verbatim. Do not self-commission beyond this file.**

Two content rulings from Venkat, 2026-07-21:

- **Item 33 — RULED:** `₹` appears **only** when the question is genuinely about
  money. Never on plain column sums or non-money quantities.
- **Item 38 — RULED:** the raised dot `·` has no place in Grade 4. Commas in
  prose separators, en dash `–` in header-style metadata, `×` where
  multiplication is actually meant.

**Scope fence:** Grade 4 only. `lessons-g3/`, `sources-g3/`, `sources-g2/`,
`sources-g5/`, `sources-g6/`, `sources-g7/` are OUT OF SCOPE and must not be
read or written.

---

## 0. PREMISES THIS BRIEF ASSERTS — DISPROVE THEM IF THEY ARE FALSE

Chat measured the following against the **project-copy** engine files, not the
repo. **Re-measure against the repo before relying on any of it.** If the repo
disagrees, STOP and report the difference rather than proceeding.

| # | Premise | Chat's measurement |
|---|---|---|
| P1 | `preview-engine.js` inserts `" · "` as the multiply operator in the expression keypad | line ~2331, `insertAtCursor(exprInp, btn.querySelector("sup") ? "^" : " · ")` |
| P2 | The same file backspaces `" · "` as a 3-char unit | line ~2328, `s.slice(a - 3, a) === " · "` |
| P3 | Nothing parses or grades on the `·` character | `exprpowPreviewHtml` special-cases only `^`; `expr.serialize` returns the raw trimmed string |
| P4 | The engine has no `₹` formatting logic at all | exactly one `₹` in `preview-engine.js`, a character-class test at line ~1978 |
| P5 | Middots in `robo.js` (14) and `raoGeoEngine.js` (2) are inside code comments only | grep, manual read |

**If P3 is false — if anything anywhere normalises, splits, or compares on `·` —
STOP before Task C and report.** That would make the operator change a
behavioural change rather than a cosmetic one, and it would need its own brief.

---

## Task A — CENSUS, read-only, writes no lesson file

Scan **every** lesson file under `lessons/` (including `lessons/incoming/`).
Grade 4 only.

Produce `docs/audits/CONTENT-CENSUS-33-38.md` with two tables.

**Table 1 — every `₹` occurrence.** Columns: file, question `id`, the field it
appears in (`prompt` / `options` / `explain` / `whyWrong` / `hint` / other), and
the full surrounding line verbatim.

**Table 2 — every `·` occurrence in `lessons/`.** Same columns.

Then classify every row in both tables into exactly one bucket, and **state the
count per bucket**:

For `₹`:
- **MONEY** — the question is genuinely about money (prices, cost, change,
  spending, earning, ₹ in the answer as currency). **Leave alone.**
- **NOT-MONEY** — plain quantities, column sums, measurements, counts.
  **Strip the `₹`.**
- **AMBIGUOUS** — cannot be decided from the file alone. **Do not touch. List
  for Venkat's ruling.**

For `·`:
- **PROSE-SEPARATOR** — separating clauses or steps in a sentence. → comma
- **METADATA** — header-style lists (e.g. `Grade 4 · Multiplication`). → en dash `–`
- **MULTIPLY** — genuinely means multiplication. → `×`
- **AMBIGUOUS** — **do not touch. List for Venkat's ruling.**

**Anti-laundering:** every classification must be defensible from the quoted
line. If the bucket is a judgment call, mark it AMBIGUOUS rather than guessing.
**A large AMBIGUOUS pile is a success, not a failure.** Do not tune the
classifier to minimise it.

**If Table 1 or Table 2 is empty, say so explicitly and report zero.** An empty
result is a valid finding — Item 33 and Item 38 rows were opened from review
observation and have never been measured. Chat has been wrong about premises
four times; this may be the fifth.

**Commit nothing yet. Report both bucket counts before proceeding.**

---

## Task B — APPLY the content fixes

Apply **only** to rows classified MONEY→no-change, NOT-MONEY, PROSE-SEPARATOR,
METADATA, and MULTIPLY-inside-lesson-content. **AMBIGUOUS rows are skipped and
logged**, never guessed.

Rules:
- `₹` NOT-MONEY → remove the `₹` character and any space it leaves doubled.
- `·` PROSE-SEPARATOR → `,` (comma + single space, no space before)
- `·` METADATA → `–` (en dash, spaced)
- `·` MULTIPLY → `×` (spaced)

**Do not reflow, re-wrap, or otherwise reformat any line beyond the character
being replaced.** A diff line should differ by the replaced character and
nothing else.

**Chase every changed number.** Report the corpus question count before and
after. It must be **2,668** both times. If it moves, STOP.

---

## Task C — ENGINE: expression keypad `·` → `×`

**Gated on P1, P2, P3 all confirming against the repo.** If P3 fails, skip this
task entirely and report.

In `preview-engine.js`:
1. The insert at ~line 2331: `" · "` → `" × "`
2. The backspace comparison at ~line 2328: `" · "` → `" × "` (still 3 chars,
   so the `a - 3` arithmetic is unchanged — **verify this, do not assume**)

**Leave `robo.js` and `raoGeoEngine.js` alone.** Their middots are code
comments. Confirm this by quoting one line from each before declaring it.

---

## Task D — GUARDS, guard-first

Two new guards in `tools/`. **Each must be proved to FAIL before the fix and
PASS after.** Stage new files before running `npm test` — `verify-tracked.js`
fails on untracked files.

**Guard 1 — no `·` in Grade 4 lesson content.** Scans `lessons/` for `·` in any
child-facing field. Hard-fail.

**Guard 2 — no `·` in the engine's child-facing insert path.** Asserts
`preview-engine.js` contains no `" · "` string literal. Hard-fail.

**₹ is NOT guarded.** No script can know whether a question is about money —
that is exactly the Item 45 class of problem. Guarding it would produce false
failures on every legitimate money question. **Do not build a ₹ guard. Do not
approximate one with a keyword list.**

For each guard, disclose the sabotage used to prove it discriminates, with the
exact failure text and the real numbers it printed. **A sabotage that trivially
fails is a weak sabotage — say so rather than hiding it.**

---

## Task G — PRE-PUSH HOOK: stop running the full suite twice

**Venkat's ruling, 2026-07-21.** Every brief currently runs the full `npm test`
at commit (~25 min) and then the **identical** suite again at push (~25 min).
On a single-developer repo where commit and push happen minutes apart, the
second run cannot discover anything the first did not. **That is ~25 minutes
lost per brief, permanently.**

**Ruling: the pre-push hook drops to a fast integrity check.** The full suite
stays exactly where it is at commit. Nothing untested reaches origin; we stop
proving the same thing twice.

### G1 — MEASURE FIRST. Do not assume the mechanism.

Chat has **not** seen `package.json`, `.husky/`, or any hook file. Everything
below is UNMEASURED. Report all of the following verbatim before changing
anything:

- The contents of `.husky/pre-push` and `.husky/pre-commit` if they exist.
- Any `prepush` / `prepare` / `husky` entries in `package.json`.
- Whether hooks live in `.git/hooks/` instead (untracked, and therefore **not
  changeable by a commit** — if so, STOP and report; Venkat must edit it by
  hand and chat must write him instructions).
- The exact command the pre-push hook runs today.
- What `npm test` and `npm run test:fast` each expand to.

**If the hook mechanism is not what this brief assumes, STOP and report.** Do
not improvise a substitute.

### G2 — The replacement check

The pre-push hook must verify **that HEAD is exactly what was tested**, then
exit. It must:

1. **Fail if the working tree is dirty** — any uncommitted or unstaged change
   means the thing being pushed is not the thing that passed at commit.
2. **Fail if any commit being pushed has no test evidence.** Chosen mechanism is
   Claude Code's judgment, but it must be *evidence*, not a guess. Preferred:
   the commit-time run writes HEAD's SHA to a gitignored receipt file
   (e.g. `.test-receipt`), and pre-push asserts the receipt matches every SHA in
   `origin/main..HEAD`. **A hook that only checks the tip is insufficient when a
   day's worth of commits is pushed at once** — Venkat has ruled he will now
   push once daily, carrying several commits.
3. **Run in seconds, not minutes.** If the chosen mechanism cannot, say so and
   report rather than shipping something slow.

**Do NOT make the hook a no-op. Do NOT make it `exit 0` unconditionally.** A
hook that always passes is worse than no hook, because it looks like a gate.

### G3 — Prove it

Guard-first, same law as everything else. Demonstrate, with exact terminal
output and exit codes:

- **Dirty tree → hook FAILS.** Touch a tracked file, attempt push, show refusal.
- **Clean tree, receipt matches → hook PASSES**, and show the elapsed time.
- **Receipt stale/missing → hook FAILS.** This is the discriminator that
  matters; a weak sabotage here makes the whole change worthless. Disclose the
  sabotage used.

**Report the measured before/after timing of the push step.** Chat has quoted
timings wrongly before; do not repeat a chat estimate, measure it.

### G4 — Do not touch pre-commit

The full suite stays at commit. **If any change to `package.json` alters what
runs at commit time, that is a STOP.**

---

## Task E — ISSUES.md

Update `docs/ISSUES.md`:

- **Item 33** — set `status`, `closed` (2026-07-21), and `resolution` naming the
  NOT-MONEY count fixed and the AMBIGUOUS count left open. If AMBIGUOUS > 0,
  the row stays `open` with the resolution recording partial progress.
- **Item 38** — same treatment. Resolution must name the three buckets
  separately and state whether Task C ran.
- **Item 51** — close as **`not-a-defect`**, closed 2026-07-21. Venkat reviewed
  the question directly (id `q3wypsawf`, area-and-perimeter-word-problems, Q19
  of 25). Resolution text must record the arithmetic: both gardens are 24 sq m;
  A is 12×2 with perimeter 2(12+2)=28 m; B is 6×4 with perimeter 2(6+4)=20 m;
  **A needs more fence, so `Answer: A` in the file is correct.** The observed
  "B" was a reviewer misread, same shape as Item 41. **Also set the
  `question id` column to `q3wypsawf`** — it was `—` and an id now exists.
- **Item 57 (or next free number) — OPEN a new row** for Task G: pre-push hook
  reduced to a fast integrity check, lane `infra`, severity `infra`, closed the
  same day with the measured before/after timing in the resolution.
- **Open a new row** for any AMBIGUOUS pile requiring Venkat's ruling. Next free
  item number. Do not reuse or renumber.

**Rows are never deleted, only closed.**

---

## Task F — REGENERATE review pages

Review pages bake the engine in. If Task C ran, regenerate every review page:
`node tools/make-review.js lessons/<file>.html`, one per lesson. There is no
sweep command — `npm run review` does not exist.

---

## COMPLETION REPORT — required contents

1. **P1–P5 re-measured against the repo**, each stated CONFIRMED or DISPROVED
   with the evidence.
2. Both bucket count tables, with AMBIGUOUS counts stated plainly.
3. Corpus question count before and after — both must read 2,668.
4. Every guard in `npm test` named individually with its exit code. **25
   existing (BATCH-1 added two) + 2 new = 27.** If any pre-existing guard
   behaves differently than before, **that is a STOP.**
5. `npm test` full run, exit code shown, **unpiped**.
6. **Task G:** the measured hook mechanism (G1) quoted verbatim; the three
   sabotage proofs with exit codes (G3); measured push-step timing before and
   after; explicit confirmation that pre-commit is unchanged (G4).
7. `git log --oneline origin/main..HEAD` — **ahead-count depends on whether
   Venkat has pushed BATCH-1 yet. Report the number and the enumerated list;
   do not assert an expected value.**
8. Anything skipped, and why.

**ONE commit for all of it.** Do not commit per task.

**Do not push.** Venkat pushes after chat audits this report.
