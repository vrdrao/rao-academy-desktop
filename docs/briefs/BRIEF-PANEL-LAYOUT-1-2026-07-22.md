BRIEF-PANEL-LAYOUT-1
Chat-authored 2026-07-22. Item 81. Guard-first. Four phases, three STOP gates.

AUTHORITY
Build to SOLUTION-PANEL-LAYOUT-CONTRACT-v1.md exactly. That file is the spec.
Where this brief and the contract disagree, the CONTRACT wins — report the
disagreement rather than picking one.

Do not redesign. Do not improve on the contract. Do not add a rule the contract
does not contain. If the contract is silent on something you need, STOP and ask.

SCOPE
- Engine + CSS only: engine/rao-card.css, engine/solution-renderer.js,
  engine/rao-card.js as needed.
- Binds Grade 3 AND Grade 4 (Ruling R4). Both corpora are in scope for TESTING.
- Do NOT edit any lesson file in lessons/ or lessons-g3/. If a shape cannot
  declare SEQUENCE or BLOCK without a lesson edit, STOP and report — that is a
  contract gap, not something to solve by editing content.
- Do NOT touch the walkthrough (.sol-walk / .cc-bub). Out of scope per contract.
- Do NOT widen the panel. Ruling 19(1) stands: 294 / 642 / 758 are fixed.

────────────────────────────────────────────────
PHASE 1 — GUARD FIRST. STOP at the end.
────────────────────────────────────────────────
Write tools/verify-panel-layout.js BEFORE touching any engine or CSS file.

It must assert, by reading computed style and rendered geometry in a real
browser at 294px, 642px and 758px panel widths:

  A. A SEQUENCE with short items columnises. At 758 with ~66px items it lands
     at 4 columns, not 5, not 8. (Rule 2, Ruling R1.)
  B. Column order is ACROSS. Assert that the item rendered at grid position
     row1-col2 is sequence item 2, NOT item 5. (Ruling R3.) This is the
     assertion that catches a `column-count` implementation.
  C. `column-count` / `columns` is NOT the mechanism. Assert computed
     `column-count` is `auto` on every sequence container. (Contract Rule 2.)
  D. A SEQUENCE whose LONGEST SINGLE ITEM exceeds the available width stays at
     1 column. Build this fixture synthetically — one item wider than 294px.
     Do NOT use the Grade-4 steps working string for this: per Ruling R5 its
     items are ~90–130px and it columnises to 4 at 758px. (Rule 2.)
  D2. sol-working IS BLOCK AND IS NEVER ITEMISED (Ruling R6, supersedes the
     earlier D2). Assert: the sol-working container carries NO sequence marker;
     it renders as ONE unsplit element at 294, 642 and 758; it is never split on
     ", ". Assert specifically that a PROSE working — use the real corpus string
     "1 kL is 1,000 L, and 842 falls short of 1,000." — renders as a single
     element and is NOT broken into two fragments at any width. If it exceeds
     the panel it gets a horizontal scroll rail and the panel does not widen.
     THIS IS THE ASSERTION THAT PREVENTS THE GREEN-HARNESS TRAP. A naive ", "
     split would satisfy a list-shaped fixture while shattering ~164 prose
     workings in the corpus. D2 must fail against any implementation that splits.
  E. A sequence breaks BETWEEN items, never within one. Assert no item is split
     across two lines: each item's rendered bounding box height equals a single
     line height. Apply this to the TABLE and FACTS sequences and to the
     synthetic fixture — NOT to sol-working, which is BLOCK per R6. (Rule 3.)
  F. An item individually wider than the panel gets its own horizontal scroll
     rail, and the PANEL width is unchanged. Use the synthetic fixture from D,
     not steps. (Rule 3 tail.)
  G. A BLOCK never columnises at any width — full panel width at 294, 642, 758.
     (Rule 4.)
  H. An undeclared shape is treated as BLOCK, not SEQUENCE. (Rule 1 fail-safe.)
  I. Panel width is still 294 / 642 / 758. Nothing widened. (Ruling 19(1).)

SABOTAGE PROOF — mandatory, report all output:
  1. Break column order (make it fill down) → assertion B must FAIL.
  2. Implement with `column-count` → assertions B and C must FAIL.
  3. Allow mid-item breaking → assertion E must FAIL.
  4. Columnise a BLOCK → assertion G must FAIL.
  5. Remove the fail-safe so undeclared reads as SEQUENCE → H must FAIL.
  6. Split sol-working on ", " into items (the rejected corpus-wide itemisation)
     → D2 must FAIL, and must fail on the PROSE fixture specifically. This
     sabotage guards Ruling R6 and the green-harness trap Phase 2 identified;
     it must be proved.
  7. Add the sequence marker to sol-working → D2 must FAIL. A marker alone is
     enough to make it columnise, so the absence of the marker is itself the
     mechanism and must be guarded.

Each sabotage must fail the SPECIFIC assertion named, not merely "something
fails". A guard that goes red for the wrong reason has not been proved. If any
sabotage does not produce the named failure, STOP and report — the assertion is
not discriminating.

Run the guard against the UNCHANGED engine. It must FAIL (nothing is
implemented yet). Report which assertions fail and why. A guard that passes
before the fix is testing nothing.

Report and STOP.

────────────────────────────────────────────────
PHASE 2 — DECLARE THE SHAPES. STOP at the end.
────────────────────────────────────────────────
Do not begin until chat authorizes Phase 1.

  1. List every solution shape that currently exists across BOTH grades, with
     its live instance count. REPORT-MEASURE-PANELS-2 found 7 — confirm or
     correct.
  2. For each, propose SEQUENCE, BLOCK, or MIXED (with which part is which),
     citing the contract's definition and the shape's actual content. For MIXED,
     name the sub-parts explicitly.
  3. State how the declaration is carried in the engine — a class, a data
     attribute, whatever fits the existing renderer. Prefer the mechanism that
     requires NO lesson-file change.
  4. Flag any shape you cannot confidently classify. UNKNOWN is a valid answer
     and chat will rule. Do not guess.

Report and STOP. Chat rules on the classification before any code is written.

────────────────────────────────────────────────
PHASE 3 — IMPLEMENT. STOP at the end.
────────────────────────────────────────────────
Do not begin until chat authorizes the Phase 2 classification.

  1. Implement to the contract. CSS grid with auto-flow row. Not `column-count`.

     AUTHORIZED CLASSIFICATION (chat ruling on the Phase 2 report):
       SEQUENCE (get the sol-seq marker, items are existing .sol-row/.sol-absent):
         table-1, table-absent, facts
         table-2 — each of its two tables stays ONE internal column (Ruling R7);
                   the side-by-side arrangement is already the width usage
       BLOCK (no marker, fail-safe applies automatically):
         rule, legacy, figure, sol-working (Ruling R6), the sol-step card list
         (Ruling R8), and all sol-note / sol-foot / sol-goal / sol-reason /
         sol-takeaway / sol-verification prose
     DECLARATION MECHANISM (as proposed in Phase 2, authorized): a positive class
     marker emitted by renderTable/renderFacts. A CLASS, not a data- attribute —
     data-* carrying content has a known double-encoding failure mode in this
     engine, and the marker carries no content. Unmarked containers are BLOCK by
     the Rule 1 fail-safe. ZERO lesson-file edits.
  2. Run tools/verify-panel-layout.js. All assertions must pass.
  3. Run the full existing suite. Report the result. If ANY existing guard now
     fails, STOP and report — do not weaken, re-point, or skip an existing
     assertion to make the suite green. A newly-failing guard is a finding.
  4. Re-run the REPORT-MEASURE-PANELS-2 measurement method and report the
     before/after table: fill percentage and panel height per shape per width.
     Chat needs the actual gain, not a claim of one.
  5. Regenerate review pages for two lessons — one Grade 4, one Grade 3 — so
     Venkat can see the result in a browser. Name the files.

Do NOT commit. Do NOT push. Report and STOP.

────────────────────────────────────────────────
PHASE 4 — HUMAN REVIEW GATE
────────────────────────────────────────────────
Venkat opens the two regenerated review pages and rules. Nothing commits until
he has seen it rendered. No exceptions.

────────────────────────────────────────────────
HARD RULES
────────────────────────────────────────────────
- Never write to a lesson file in lessons/ or lessons-g3/.
- Never widen the panel.
- Never touch the walkthrough.
- Never use `column-count` or `columns` for a sequence.
- Never weaken, re-point, or skip an existing guard to make the suite pass.
- Never commit. Never push.
- Never add a rule the contract does not contain. If the contract is silent,
  STOP and ask.
- If anything is ambiguous, STOP and report the exact text. Do not decide.
