# BRIEF-INTERACTION-ATLAS-1 — see every scenario

Chat-authored 2026-07-23. Grade 4 only. `lessons-g3/` out of scope.

**Purpose.** Venkat cannot finalize the student interaction rules by reading
prose. He needs to *see* every state a child can reach. This brief builds a
single HTML page — the **Interaction Atlas** — showing every scenario, driven by
the **real engine**, so what he signs off on is what actually ships.

**Why now.** `BRIEF-RETRY-STATE-3` is **PARKED at Phase 1 by Venkat's
instruction.** Phase 0 was read-only, so nothing is half-built and parking costs
nothing. **Do not resume it.** It resumes only after the rules are frozen.

---

## 0. STANDING RULES

1. **The engine is the source of truth. This brief is not.** Every scenario must
   be produced by loading the real `rao-card.js` / `preview-engine.js` and
   driving it — real clicks, real state. **Never hand-write a mock of a card.**
   A hand-drawn approximation is worse than nothing here: Venkat would be ruling
   on a picture instead of his product.
2. **Read-only against the engine.** Zero changes to `engine/`, `tools/`,
   `lessons/`. This brief produces ONE new review file. If a scenario cannot be
   reached without changing the engine, **that is a finding — report it, do not
   change the engine.**
3. **Anti-laundering.** If a scenario cannot be reached, say so plainly and say
   why. **Never fabricate a state to fill a gap in the grid.** A missing tile
   labelled "could not reach, reason X" is a genuinely useful result.
4. **No pushing. No committing** beyond the single local commit at the end.
5. **Do not fix anything you find.** Log it. This brief observes; it does not
   repair. Scenario 4 below is a KNOWN bug with a fix already ruled and parked —
   it must appear in the atlas as-is.

---

## 1. WHAT TO BUILD

`review/_INTERACTION-ATLAS.html` — one self-contained page Venkat opens by
double-clicking. No server, no build step, no network.

**Structure:** a vertical list of scenario sections. Each section contains:

- **A heading** naming the scenario in plain English.
- **The actual card**, in that exact state, rendered by the real engine.
- **A caption** in plain English: what the child just did, and what the card is
  doing in response.
- **A rule tag** naming which rule this demonstrates (list in §2).
- **A status tag**: `AS RULED` / `UNRULED — needs decision` / `KNOWN BUG — fix
  parked`.

**How to reach each state:** script the real interaction against the real card —
click the option, click Check, click Try again — then capture the card in that
state. Prefer live embedded cards over screenshots if a card can be frozen in a
state without a rebuild. If a state can only be captured as an image, that is
acceptable — **say which technique was used for each tile in the report.**

**Do not** put the whole engine behind a "play with it" sandbox. Venkat needs to
scan every state side by side, not click through one at a time.

---

## 2. THE SCENARIOS — build every one

Use the same simple question throughout so nothing varies but the state, EXCEPT
where a scenario requires a specific question type.

**Group A — the answer paths**
1. Fresh question, untouched. First arrival.
2. Correct answer, just checked. *(rule 8: loud, nothing to read)*
3. Correct answer, solution then opened. *(outcome must STAY correct)*
4. First wrong answer, just checked. *(rule 5: wrong is a whisper)*
5. **After tapping Try again.** *(rule 2: fresh start — **KNOWN BUG, fix parked
   in BRIEF-RETRY-STATE-3**: the "Not quite" panel does not clear. Label it
   `KNOWN BUG — fix parked`. Caption it: "the message should be gone here."
   **DO NOT FIX IT.**)*
6. Second wrong answer — the lock. *(rule 1: two attempts is the cap. Show BOTH
   variants: a question WITH a walkthrough, and one WITHOUT.)*

**Group B — help**
7. Hint 1 open, question untouched.
8. All hints exhausted.
9. Wrong answer AFTER a hint was opened. *(rule 7: does the hint numbering hold?)*
10. Try again with a hint open. *(rule 2 exception: **the hint must survive**)*
11. Walkthrough open, mid-steps.
12. Walkthrough at its final step — the reveal.

**Group C — question types**
Show a first-wrong state for each: fill-in-the-blank, single-select,
multi-select, ordering/drag, categorize.
*(rule 5: fill-blanks tint, selects get the ✕ — prove they differ correctly.)*

**Group D — the right-answer-written-differently cases** *(rule 10)*
13. `42,613` with a comma — accepted.
14. `1,00,000` Indian lakh grouping — accepted.
15. `16+31=47` where the question asked thirty-one plus sixteen — accepted.
16. `4-9=5` — correctly still WRONG.
*(These landed in `1d50f07`. If any behaves differently than stated, **that is a
finding — report it loudly.**)*

**If any scenario cannot be reached, include the tile anyway** with the heading,
the reason it could not be reached, and what you tried.

---

## 3. PRESENTATION

Venkat is non-technical. The page is for **his eyes, not a developer's.**

- Plain English throughout. **No CSS class names, no function names, no file
  paths, no issue numbers** in anything he reads.
- Every caption describes **what a child sees and does**.
- Group with clear headings. Scannable top to bottom.
- Each tile carries its status tag prominently — he is hunting for
  `UNRULED` and `KNOWN BUG` tiles.
- **Mobile matters.** Render at 390×844 where feasible; note where a state was
  captured at desktop width instead.

---

## 4. PHASES

**PHASE 0 — feasibility (read-only).** Report
`REPORT-INTERACTION-ATLAS-1-PHASE0.md`: for each of the ~20 scenarios, state
whether it is reachable, by what technique, and flag any you cannot reach and
why. **STOP GATE 1 — report and wait.**

**PHASE 1 — build.** Produce the atlas. Report
`REPORT-INTERACTION-ATLAS-1-PHASE1.md` listing every tile built, the technique
used for each, and every tile that could not be built with its reason.
**STOP GATE 2 — report and wait.**

**PHASE 2 — commit.** Verify line endings with **byte-level Python**
(`b.count(b"\r\n")`), not grep. Commit locally. **DO NOT PUSH.** Report the hash
and `git log --oneline origin/main..HEAD`.

---

## 5. DELIVERABLE

- `review/_INTERACTION-ATLAS.html`
- three phase reports
- one local commit, unpushed, stacked on `1d50f07`

## OUT OF SCOPE

- **`BRIEF-RETRY-STATE-3` — PARKED. Do not resume, do not apply its fix.**
- any engine, tool, or lesson change
- `lessons-g3/`
- fixing anything the atlas reveals — **log findings, change nothing**
