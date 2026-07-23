# BRIEF-G3-HINT-STRIP-1

**Scope fence.** Grade 3 only. `lessons/` is not read, not touched, not referenced. Grade 4 is closed and out of scope by explicit ruling this session.

**No engine change in this brief.** `rao-card.js`, `solution-renderer.js`, `rao.css`, `rao-card.css` and every file in `tools/` are READ-ONLY. If any task below appears to require an engine edit, STOP and report — do not edit.

**One file is written:** `lessons-g3/multiplication_facts_up_to_10.html`. Plus `docs/ISSUES.md` for logged items.

---

## §0 — MEASURE FIRST. No edits until §0 is complete and reported.

Three briefs stopped this session because they specified against a mental model of the repo instead of measuring it. This section exists to prevent a fourth. Every line number, function name and behaviour below is a **premise to be checked**, not a fact. Report what you find, not what was expected.

**0.1 — The hint blocks.**
Locate every `hint:` block in `lessons-g3/multiplication_facts_up_to_10.html`. Report:
- Total count.
- Exact frontmatter shape: key name, single value vs list, indentation, quoting.
- Whether all are structurally identical or whether variants exist.

**STOP if the count is not 30.** Report and halt.

**0.2 — The engine's wrong-answer path, verbatim.**
Print, verbatim with real line numbers, no paraphrase:
- `walkOffered()` (reported to be at `rao-card.js:169` — verify)
- `allHintsUsed()`
- Every function that calls either of them
- The handler that runs on a wrong answer selection, from the tap through to whatever renders

**0.3 — Behaviour at zero hints, traced not inferred.**
Trace through the actual code and report:
- What `allHintsUsed()` returns when the hint array is empty, absent, or undefined. Trace it; do not reason about what it "presumably" does.
- What `walkOffered()` therefore evaluates to on the first wrong answer when a question has no hint.
- Whether the solution is *offered* (button, requires a tap) or *shown* (renders directly).

**0.4 — Every other consumer of `hint`.**
Search the engine and CSS for every read of hint data. Report each with file and line:
- Button labels and their text (e.g. "Show me the solution")
- Chip labels, counters, or numbering that reference hints
- Any `cc-has*` or similar flag set from hint presence
- Any CSS rule that shows, hides, or sizes an element based on a hint-related class

For each, state what it does when a question has no hint. **This is the section most likely to find a defect** — an orphan chip, a counter reading 0, or a flag that no longer has anything behind it.

**0.5 — The clearing behaviour.**
Handoff §4 ruling 4 states "hint bubbles clear when the solution opens," shipped in BRIEF-G3-ENGINE-1. Verify against the code. Report:
- Whether hint bubbles are actually removed from the DOM, hidden by CSS, or neither.
- Whether this fires on all paths that open a solution, or only some.

**0.6 — The append-only law.**
The no-repaint law states the question DOM must never rebuild mid-session; solution and hint panels are append-only. Ruling 12 requires the hint to be **removed** when the solution opens. Report whether removing a hint bubble is compatible with the append-only law as implemented, or whether these two rules conflict. If they conflict, report it and do not attempt to resolve it — that is a chat-side ruling.

**Report §0 in full before starting §1.**

---

## §1 — STRIP

Remove all 30 `hint:` blocks from `lessons-g3/multiplication_facts_up_to_10.html`.

Remove the block and its content entirely. Do not leave an empty `hint:` key, a placeholder, or a commented-out block.

**Nothing else changes.** Not whitespace, not the header comment, not adjacent frontmatter keys, not question order.

Note the intent for the record: these are **cleared for reselection**, not abolished. Grade 3's default is no hint; Venkat will name individual questions to receive hints back after visual review. Hints remain a supported feature.

---

## §2 — PROTECTED FIELDS

The file is untracked, so there is no `git diff` baseline. Verify by field extraction, exactly as the previous brief did.

Unchanged, all of them:
- 30 questions
- Mix: single-select 14 / fill-blanks 6 / multi-select 3 / categorize 4 / order 3
- Every option and every `data-val`
- Every `code:` and every `explain:`
- All 46 `whyWrong` entries — **byte-identical**, including the 21 rewritten by the previous brief
- All 30 `solution:` blocks — **byte-identical**, all five shapes
- The header comment, including its 2 pre-existing middots

Report each as verified or failed. A field that cannot be verified is reported as unverified, never assumed.

---

## §3 — MEASURE THE RESULT

Post-strip, measure and report. Do not infer from §0 — re-measure.

**3.1** `build()` returns 30, 0 empty markup.
**3.2** Self-grade 30/30.
**3.3** Zero `hint:` blocks remain.

**3.4 — Render the actual child experience.** For at least three questions covering different types (one single-select, one fill-blanks, one categorize or order), simulate a wrong answer and report **exactly what appears on screen**:
- After one wrong tap: what renders, in what order, with what labels?
- After two wrong taps: what changes?
- Is the solution shown directly, or does a button appear that must be tapped?
- Do any orphan elements render — an empty hint bubble, a chip with no content, a counter showing zero?

Report this as observed output, not as a description of what the code should do.

**3.5** `npm test` full suite. Report exit code, and state explicitly whether the guards scan `lessons-g3/`. Green means Grade 4 did not regress; it is not validation of this file.

---

## §4 — GAP REPORT

Compare observed behaviour to the target. Report each row as MATCHES, DIFFERS, or UNKNOWN.

| Case | Target: 1st wrong | Target: 2nd wrong |
|---|---|---|
| No hint | whyWrong + solution shown directly | — |
| Has hint | whyWrong + hint | whyWrong + solution, hint cleared from screen |

For every DIFFERS, describe the gap precisely: what happens instead, and which function or CSS rule is responsible. **Do not fix anything.** The engine change is a separate brief, guard-first.

---

## §5 — ISSUES

Log to `docs/ISSUES.md`, continuing from item 70:
- The hint-strip and the reselection intent.
- Every DIFFERS from §4, one item each.
- Any orphan element or dead code path found in §0.4.
- Any conflict found in §0.6.

Do not delete or renumber existing rows.

---

## §6 — STOP CONDITIONS

Halt and report immediately, before touching disk, if:
- The hint count is not 30.
- Any protected field cannot be verified by extraction.
- Stripping hints requires an engine or CSS edit to avoid a broken render.
- §0.6 finds a genuine conflict between the append-only law and hint clearing.
- Anything in `lessons/` would be read or written.

**Do not commit. Do not stage. Do not push.**
