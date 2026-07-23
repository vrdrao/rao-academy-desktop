# BRIEF-ID-1 — EVERY QUESTION GETS A PERMANENT NAME

**Chat-authored. Guard-first. Corpus-wide content change + engine change. No push.**
**Engine: rao-master-22 + BRIEF-TAP-1 (commit `7b03fe5`, local).**
**Corpus: 3,015 questions / 118 lessons, Grade 4 only.**
**`lessons-g3/` is out of scope and must not be touched, counted, or regenerated.**

---

## 0. WHY THIS BRIEF EXISTS — AND WHY IT OUTRANKS EVERYTHING ELSE

The ID audit (2026-07-20) established, with proof:

- **No question in the corpus carries an author-level identifier.** Zero of 3,015
  questions have `id`/`qid`/`uid`/`slug`/`guid`/`uuid` in frontmatter.
- **The only identity is positional.** `parseQuestion` (`preview-engine.js:1601`)
  synthesises `` const qid = `auth-q${index + 1}` `` from the build-loop counter
  `i` (`:2064`, `:2082`, `:2113`). Inserting, deleting, or reordering a question
  renumbers itself **and every question after it**.
- **It does not reach the importable artifact.** The platform imports the
  `<div id="source">` block. `auth-q…` is computed at runtime in the browser and
  appears in generated files only as the uninterpolated template literal
  `data-qid="${qid}"` inside the inlined script — **0 interpolated values**.
- **3,015 questions collapse onto 42 distinct id strings**, because every lesson
  restarts at `auth-q1`. `auth-q1` alone names 118 different questions.

**Consequences that make this urgent:**

1. **The platform cannot do stable-ID matching.** There is nothing on our side to
   match against. Every import is therefore destructive; per-child progress
   cannot survive a re-import.
2. **BRIEF-4 is built around deletions.** Deleting question 5 of 30 renumbers
   questions 6–30. Running BRIEF-4 before this scrambles identity corpus-wide.
3. **Cost scales with delay.** 3,015 questions today; 25,000+ once Grades 1–8 are
   ingested.

**Ruling (Venkat, 2026-07-20): each question gets a short random permanent code,
opaque by design.** Not derived from grade, topic, lesson name, file path, or
position — all of which change. Nothing may ever parse meaning out of an ID.

---

## 1. THE ID SCHEME — RULED, NOT NEGOTIABLE

- **Format:** `q` followed by **8 characters** from the alphabet
  `23456789abcdefghijkmnpqrstuvwxyz` (Crockford-style: no `0`/`o`, no `1`/`l`, no
  `u`, to survive being read aloud or retyped). Example: `q7k2m9x4`.
- **Case-sensitive, lowercase only.**
- **Assigned once. Never regenerated. Never reused**, even if a question is
  deleted — a dead ID stays dead.
- **Authored into the source frontmatter** as `id:`, so it lives in the file, is
  visible in diffs, and travels into the `#source` block the platform imports.
- **Opaque.** No code anywhere may infer grade, lesson, order, or type from an
  ID. The guard in Phase 4 asserts this.

**Collision safety:** 32^8 ≈ 1.1 × 10^12. Across a projected 25,000 questions the
birthday-collision probability is ~2.8 × 10^-4. **Nevertheless, uniqueness is
enforced by explicit check, never by probability** — Phase 2 verifies it.

---

## 2. STANDING LAWS THAT APPLY

- **Guard-first, always.** Fixture demonstrating **FAIL before** and **PASS
  after**. **Pre-fix RED and a sabotage round-trip are different proofs and both
  are required.**
- **Chase every changed number.** Corpus is **3,015**. This brief adds no
  questions and deletes none. **Any count other than 3,015 at any phase is a
  halt condition.**
- **A class defined by a rule must name its members before anything is written.**
- **Fix the general case, not the file.**
- **Measure, don't assume — including this brief's own premises.** §0 was
  measured against the project mount. If the repo differs, **report and measure
  the repo.** The repo is truth.
- **Anti-laundering.** Say **UNMEASURED** when it is unmeasured. Never tune a
  check to hit an expected count.
- **Never pipe a run in a way that masks output or exit code.**
- **No-repaint law. Visibility law.** Unchanged.
- **Packed CSS caution:** verify via `getComputedStyle`, never markup.
- **Claude Code never pushes, never self-commissions, never writes handoffs.**
- **Idempotence is a hard requirement.** Running the assigner twice must produce
  a byte-identical tree the second time. Phase 3 proves this.

---

## 3. PHASE 0 — MEASURE (read-only, report, continue)

1. Confirm §0 against the repo: `parseQuestion` line, the `auth-q` template, the
   build-loop counter lines, and that **zero** questions carry an identifier
   field. Report drift from §0.
2. **Confirm `parseFrontmatter` (`:869`) is a generic key/value parser**, i.e.
   an unknown `id:` key is retained on `fm` rather than dropped or rejected. If
   it is a whitelist, **stop and report** — the design below changes.
3. Report the exact byte-level shape of an `@q` block in three different lessons
   (including one in `lessons/` and one in `lessons/incoming/`), so the writer
   inserts `id:` in a form the parser already accepts.
4. Report the question count per lesson and the corpus total. **Must be 3,015.**
5. Report whether any tooling, test, or generator currently **depends on**
   `auth-q{N}` values — grep `auth-q` across the whole repo and name every
   consumer with file and line. **This is the blast-radius question.**

---

## 4. PHASE 1 — THE GUARD, WRITTEN FIRST AND PROVED RED

Create `tools/verify-question-ids.js`. It must FAIL against the current corpus.

Assertions:

1. **Every question in `lessons/` (including `lessons/incoming/`) has an `id:`
   in its `@q` frontmatter.** Report the count missing.
2. **Every ID matches** `^q[23456789abcdefghijkmnpqrstuvwxyz]{8}$`.
3. **Every ID is unique corpus-wide.** Report distinct-count vs question-count;
   they must both be 3,015.
4. **Every ID survives into the `#source` block** of the generated review page
   — i.e. it is present in the artifact the platform imports. Verify on at least
   3 generated lessons.
5. **No ID encodes position.** Assert that sorting questions by ID does not
   reproduce document order in any lesson (a cheap opacity check).
6. **`lessons-g3/` is not scanned.** Assert the scan set excludes it.

**Run against the unmodified corpus. It must FAIL assertions 1–4.** Report the
observed numbers. **A guard that passes before the change is not a guard — if
that happens, stop and report.**

---

## 5. PHASE 2 — THE ASSIGNER

Create `tools/assign-question-ids.js`.

**Behaviour:**

- Walk every lesson file in `lessons/` and `lessons/incoming/`. **Never
  `lessons-g3/`.**
- For each question **lacking** an `id:`, generate a fresh random ID per §1,
  check it against the set of all IDs already seen **and** all IDs in the ledger
  (below), and write it into the `@q` frontmatter.
- **A question that already has an `id:` is left completely untouched.** This is
  what makes reruns safe.
- **Insert `id:` as the first line of the frontmatter block**, so diffs are
  readable and the field is easy to find by eye.
- **Preserve every other byte of the file.** No reformatting, no key reordering,
  no whitespace normalisation, no line-ending changes. The only permitted delta
  is the inserted `id:` line.

**The ledger — `docs/question-ids.json`:**

- Append-only record of every ID ever issued, with the lesson file and the
  question's `description` at time of issue (for human traceability only —
  **nothing may key off it**).
- The assigner reads it at start and treats every ID in it as taken, **including
  IDs whose questions have since been deleted.** This is what enforces "never
  reused."
- Committed to the repo.

**Halt conditions:**

- Any generated ID collides with an existing or ledger ID more than **3 times in
  a row** → stop and report (indicates a broken RNG, not bad luck).
- Question count before ≠ question count after, for any lesson → **stop
  immediately**, do not continue to the next file.
- A file fails to re-parse after writing → **stop, restore that file, report.**

---

## 6. PHASE 3 — RUN IT, THEN PROVE IDEMPOTENCE

1. Run the assigner across all 118 lessons.
2. **Report per-lesson: questions before, questions after, IDs assigned.**
   Totals must read 3,015 / 3,015 / 3,015.
3. **Run the assigner a second time.** It must assign **zero** IDs and produce a
   **byte-identical tree** — prove with `git status --short` showing no change
   from the second run.
4. **Re-parse every lesson with the engine's own `build()`** and confirm the
   question count and every `type` is unchanged from before. **Any parse failure
   is a halt condition.**
5. Confirm `lessons-g3/` shows zero changes.

---

## 7. PHASE 4 — MAKE THE ENGINE PREFER THE AUTHORED ID

`parseQuestion` (`:1601`) must use the authored `id:` when present, and fall
back to `auth-q{index+1}` only when it is absent.

- The fallback **stays**. A newly authored question with no ID yet must still
  build rather than crash.
- **Every consumer named in Phase 0.5 must be checked and updated** if it assumes
  the `auth-q` shape. Name each one and its resolution.
- **The authored ID must reach the rendered `data-qid` attribute**, so the value
  is present in the DOM and in generated output — not merely held in memory.
- **No behaviour change beyond identity.** Rendering, grading, serialization and
  reset must be byte-identical for a question whose ID was just added.

---

## 8. PHASE 5 — PROVE IT

1. **Phase 1 guard now PASSES**, all six assertions.
2. **Sabotage round-trip, both disclosed honestly with numbers:**
   - **A:** duplicate one ID across two lessons → assertion 3 must re-fire.
   - **B:** strip `id:` from one question → assertion 1 must re-fire.
   - If either sabotage fails to re-fire, **say so with the numbers and
     strengthen the assertion**, as BRIEF-TAP-1 did with its hint-CSS sabotage.
3. **Non-regression, named individually — not one aggregated "green":**
   `verify-touch.js`, `verify-reset.js`, `verify-drag.js`, `verify-venn.js`,
   `verify-categorize-tap.js`, `verify-colmath.js`, `verify-grading-node.js`,
   `verify-structural.js`, `verify-tracked.js`.
4. **Full `npm test`, unpiped, exit code reported.** New guard files must be
   git-staged before this run — `verify-tracked.js` fails on untracked guards
   (this cost BRIEF-TAP-1 a re-run).
5. **Corpus count reads 3,015**, from the grading gate's own independent count.
6. **Wire `verify-question-ids.js` into `package.json`** — both the full `test`
   script and a named `test:ids` entry, matching the existing convention.

---

## 9. WHAT TO REPORT

1. Phase 0's five findings, especially **every `auth-q` consumer** found.
2. Phase 1's **pre-change failure**, with observed numbers.
3. Phase 3's per-lesson table and the **idempotence proof**.
4. Phase 4's consumer-by-consumer resolution.
5. Phase 5: guard pass, **both sabotage results including any weak one**,
   individually-named non-regression results, `npm test` exit code, corpus count.
6. The commit list, enumerated, **local only**.
7. Anything noticed but not acted on.
8. `git status --short`, confirmation nothing was pushed, and that
   `lessons-g3/` is untouched.

**A correct stop is a success.** Where something could not be measured, say
**UNMEASURED**.

---

## 10. WHAT THIS BRIEF DOES NOT DO

- It does not delete, add, reorder, or edit any question's content, key, prompt,
  hint, or explanation.
- It does not touch `lessons-g3/`.
- It does not regenerate review pages — chat authorises that separately after
  auditing this report.
- It does not change the platform's importer. That is the team's work; this
  brief exists to give them something stable to match on.
- It does not push.
