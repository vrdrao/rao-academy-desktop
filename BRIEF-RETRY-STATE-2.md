# BRIEF-RETRY-STATE-2 — the retry-state engine pass

Chat-authored 2026-07-23. Grade 4 only. `lessons-g3/` is out of scope.

Covers ISSUES.md **#88, #111, #84, #85, #109**. One root cause: **state that does
not reset between attempts.**

Three of the five are `severity: correctness` — a child who was RIGHT was told
they were WRONG (#84, #109) or shown success and failure simultaneously (#111).
That is why this batch precedes Batch 1.

---

## 0. STANDING RULES — these override anything below

1. **Guard-first, always.** For every one of the five items: write the fixture,
   run it, see it FAIL, then fix, then see it PASS. A guard that has not been
   observed failing is not a guard and must not be trusted. Report the FAIL
   output verbatim.
2. **Measure the repo, never these notes.** Every value quoted in this brief is
   from a read-only project copy that may be stale. Before acting on any claim
   here, verify it against the repo working tree and report what you actually
   found. If the repo disagrees with this brief, **STOP and report** — do not
   reconcile it yourself.
3. **Anti-laundering.** Every number has a traceable source. "UNPARSED, reason X"
   beats a plausible guess. Never convert an unknown into a confident label.
4. **No pushing.** All work stays local. Chat audits and authorizes.
5. **Fix the general case.** These are all PATTERN-WIDE. Fix the engine, not the
   question that exposed it. Count the affected population at fix time and report
   the count.
6. **STOP gates are absolute.** Where this brief says STOP, stop and report. Do
   not proceed on your own judgement.

---

## PHASE 0 — Recon and law verification (no edits)

Read-only. Produce `REPORT-RETRY-STATE-2-PHASE0.md`.

**0.1 — Verify the tree is clean.**
`git log --oneline origin/main..HEAD` — report the result. If HEAD is not equal
to origin/main, **STOP** (a prior push was expected to complete; chat must
confirm before engine work begins).

**0.2 — Locate the retry path.** In `rao-card.js`, find the code that runs when
the child takes a new attempt after a wrong verdict. Report file, function name,
and line numbers. Report every state artifact it currently resets and every one
it leaves alone.

**0.3 — Verify Law 3 verbatim.** The project copy of `rao-card.js` states in its
header (LAWS, item 3) that on a wrong fill-blank *"the typed value is NEVER
cleared — erasing it reads as punishment"*, and that `tools/verify-reset.js`
A1–A5 guards this. **Confirm or refute against the repo.** Quote the actual law
text and the actual assertions A1–A5 verbatim. Report their exact line numbers.

**0.4 — Inventory the existing reset guard.** Report what `verify-reset.js`
currently asserts, assertion by assertion, in one line each.

**0.5 — Population counts.** Report, with the command used for each:
- number of numeric fill-blank questions whose answer is >= 1000 (the #84/#85
  population)
- number of questions accepting a typed expression containing `+` or `×`
  (the #109 population)
- number of questions that render a whyWrong message (the #111 population)

**0.6 — #85 truncation test — THIS IS A CORRECTNESS GATE.**
Take a numeric fill-blank whose answer is 5 digits. In a real browser (Playwright,
real events), type the full correct answer into the narrow input. Read back **what
the grader actually receives** — not what is visible on screen.

- If the grader receives the complete string, #85 is display-only and stays
  `severity: layout`.
- **If the grader receives a truncated string, STOP THE ENTIRE BRIEF and report
  immediately.** That would mean correct children are being marked wrong at
  scale, and it outranks every other item here.

**STOP GATE 1 — report Phase 0 and wait for chat authorization before Phase 1.**

---

## PHASE 1 — Guards first, all five, proved failing

No production code changes in this phase. Write guards only. Produce
`REPORT-RETRY-STATE-2-PHASE1.md`.

Build **one** new guard file, `tools/verify-retry-state.js`, covering all five
state transitions, plus amendments to `verify-reset.js` where noted.

### G1 — fill-blank clears on Try again (#88)
**RULED BY VENKAT 2026-07-23: the typed value IS CLEARED on "Try again."**

This **REVERSES** the Law 3 clause verified in 0.3 and **INVERTS** whichever of
`verify-reset.js` A1–A5 asserts preservation.

Required work:
- Assert: after a wrong fill-blank verdict, clicking "Try again" leaves the input
  **empty**.
- Amend the offending assertion(s) in `verify-reset.js` to assert clearing, not
  preservation. **Do not delete them** — invert them, and add a comment on the
  line naming this brief, the date, and the ruling, so a future reader cannot
  mistake the reversal for drift.
- **TWO SITES, both found by Phase 0 (0.3) — flipping only one leaves the old
  behaviour winning silently:** assertion **A5 at `verify-reset.js:158`**, and the
  **`keepValues:true` drill at `verify-reset.js:714–717`**. Both currently assert
  preservation. Both must flip. Report both before-and-after.
- **A5 SPLIT — CONFIRMED BY VENKAT 2026-07-23.** A5 carries two preservation
  assertions. Invert **through-Try-Again only**; **keep through-Check as
  preservation.** The value must survive the Check that produces the wrong
  verdict, so the child can still see the answer they are being told is wrong.
  It clears at the Try-again tap, not before. Clearing at Check would erase the
  number the child is actively reading feedback about.
- Amend the LAWS comment block at the head of `rao-card.js` (law 3) to state the
  new behaviour, dated, citing this brief.
- Add a row to `docs/ISSUES.md` recording the reversal itself, so the old
  behaviour is not "restored" later by someone reading an old note. **This is
  the specific failure mode that hit the tile-sizing scheme twice.**

### G2 — stale feedback dismissed on ANY new selection (#111)
**RULED BY VENKAT 2026-07-22.** Not just the "Try again" button — the moment the
child taps a **different option**, all of the following must go: the whyWrong
panel, the "NOT QUITE" chip, and any prior-attempt correctness styling.

**BINDING CONSTRAINT:** the no-repaint law forbids rebuilding the question DOM
mid-session, and hint/solution panels are append-only. This MUST be implemented
as **HIDE** (visibility / display), **NEVER node removal.** A fix that removes
the node violates an existing law and will be rejected at audit.

Assert all four: panel hidden, chip hidden, prior styling cleared, and **the node
still present in the DOM** (proving hide-not-remove).

### G3 — comma-separated numeric answers accepted (#84)
Assert `42613` and `42,613` both grade CORRECT for the same question.

**RULED BY VENKAT 2026-07-23 — INDIAN LAKH GROUPING MUST ALSO BE ACCEPTED.**
The children using this product are in India and are taught lakh grouping in
school. A child must never be marked wrong for writing a number the way their
school taught them.

Accept **both** systems:
- Western: `1,000,000`
- Indian: `1,00,000`

Below six digits the two are identical, so this affects the 4 six-digit questions
Phase 1 identified — but the rule is general and must not be scoped to those 4.

**Sabotage requirement:** a **misplaced** comma must still NOT be accepted. Prove
the fixture distinguishes a valid Indian grouping from a random comma. Report the
exact rule chosen. If valid-Indian vs misplaced turns out to be ambiguous in any
case, **STOP and report** rather than picking a lenient rule.

**SEPARATE, NOT IN THIS BRIEF:** the engine currently *displays* Western grouping
everywhere. Whether Rao Academy should display Indian grouping to Indian children
is an open product decision for Venkat, logged as a new issue — **do not change
any display formatting in this brief.**

### G4 — input box fits its answer (#85)
**RULED BY VENKAT: WIDEN THE BOX. DO NOT SHRINK THE FONT.** Reducing text size to
solve a container problem degrades legibility for a nine-year-old.

Assert the input's rendered width accommodates the full digit count of the key
(known from the answer) with no clipping, at **390×844 and 360×780**.

Special case from #85's amendment: in `round-scaffold`, the **result** box needs
more width than the operand boxes — the sum can be one digit wider than either
operand. Evidence id `qm37aecdj` (3000/7000 → 10000). Assert the result box
specifically.

### G5 — commutative typed answers accepted, ADDITION ONLY (#109)
**RE-RULED BY VENKAT 2026-07-23, SUPERSEDING THE EARLIER "+ AND × " RULING.**

Phase 0 (0.5) measured the corpus: **6 typed-expression questions, ALL addition.
Zero `×`, zero `−`, zero `÷`.** The multiplication case cannot be tested against
real content, and this project does not build defences against content that does
not exist.

**Scope: `+` only.**

- Assert `16+31=47` grades CORRECT where the question asked for thirty-one plus
  sixteen. Use a REAL question from the 6-question population.
- **CRITICAL NEGATIVE FIXTURES — these must FAIL to grade correct:**
  `4-9=5` and a division case written backwards. These are **synthetic** — Phase 0
  established no such questions exist in the corpus. Label them synthetic in the
  report; do NOT add them to `lessons/`.
- Implement as an explicit **operator allowlist containing `+` only.** No
  "commutative-ish" heuristic. No inference from the shape of the expression.
- **`×` is deliberately EXCLUDED, not forgotten.** Comment it at the allowlist so
  a future reader does not "restore" it as a bug fix. If multiplication questions
  of this type are ever authored, this guard must be revisited — record that in
  the ISSUES.md resolution.

### Phase 1 exit requirement
Run all five guards against the **unmodified** engine. **Every one must FAIL, and
must fail for the stated reason.** Paste the failure output verbatim in the
report. A guard that passes before the fix is not testing what it claims — stop
and rewrite it.

**STOP GATE 2 — report Phase 1 with all five failures shown, and wait for chat
authorization before Phase 2.**

---

## PHASE 2 — The fixes

Produce `REPORT-RETRY-STATE-2-PHASE2.md`.

Implement the five fixes. Constraints:

- **One state-reset path.** These are one root cause; resist five scattered
  patches. If the code does not permit a single path, say so and explain why
  rather than forcing it.
- **#111 is HIDE, never remove.** Restated because it is the easiest to get
  wrong.
- **#109 is an allowlist**, not a heuristic.
- **#85 widens**, never shrinks font.
- **Touch no lesson content.** This is an engine pass. Zero changes under
  `lessons/`. If a fix appears to require a content change, **STOP and report.**

Then run all five guards. All five must PASS. Paste the output.

Then run the full suite. Report any test that changed state, and why.

**Known expected breakage:** amending `verify-reset.js` for G1 will change that
file's own results. Report before-and-after explicitly so it is visibly
intentional and not mistaken for a regression.

**STOP GATE 3 — report Phase 2 and wait for chat authorization before Phase 3.**

---

## PHASE 3 — Review artifacts and commit prep

Produce `REPORT-RETRY-STATE-2-PHASE3.md`.

**3.1 — The flicker question, OPEN AT FIX TIME (#111).** Hiding feedback on every
selection change will make the panel flicker in and out under rapid tapping.
Chat's position is that this is probably acceptable and arguably the correct
signal — but **Venkat must SEE it before it ships.** Produce a review page
demonstrating rapid option-tapping on a whyWrong question, and say plainly in the
report that this needs his eyes.

**3.2 — Regenerate review pages ONLY for questions this brief touched.** Do not
regenerate the corpus. HANDOFF-45 §5.4 records that 104 review pages still carry
mixed CRLF and regenerating them all produces an unreadable diff; that is a
separate isolated task, gated on #117.

**3.3 — Line endings.** Any file written must match the repo's committed
convention. **Check with byte-level Python** (`b.count(b"\r\n")` on a binary
read), **not `grep -c $'\r'`** — grep gave false results twice on 2026-07-22 and
its output must not be trusted here.

**3.4 — Run the format check explicitly.** `verify-format-staged` silently does
nothing when nothing is staged and will report green on a check that never ran.
Invoke `node tools/verify-format.js <lesson>` directly and paste the output.

**3.5 — Update `docs/ISSUES.md`:** close #88, #111, #84, #85, #109 with
resolutions; add the Law 3 reversal row from G1.

**3.6 — Commit locally. DO NOT PUSH.** Report the commit hash, the file list, and
`git log --oneline origin/main..HEAD` for the chat-side enumeration check.

---

## Deliverables

- `tools/verify-retry-state.js` (new)
- amended `tools/verify-reset.js`
- amended `rao-card.js` (incl. the LAWS header block)
- `docs/ISSUES.md` updated
- four phase reports
- one local commit, unpushed

## Out of scope — do not touch

- `lessons-g3/` — hard fence
- lesson content of any kind
- `docs/MISCONCEPTIONS.md` — unaudited; `BRIEF-WHYWRONG-CLASSIFY-1` must run
  against it unchanged
- corpus-wide review page regeneration
- #93 (further MCQ conversion) — gated on this brief landing
