# BRIEF-3-ENGINE — FIVE ENGINE DEFECTS, GUARD-FIRST

**Authored chat-side, 2026-07-20. Grade 4 only. `lessons-g3/` is out of scope
entirely — do not read it, count it, or mention it.**

---

## 0. WHAT THIS BRIEF IS AND IS NOT

This brief changes **engine files only**: `engine/preview-engine.js`, `rao.css`,
`rao-card.css`, and the test tooling under `tools/`.

**No lesson file is edited. No question prompt, number, option, or answer key is
touched.** Content repairs are BRIEF-4's job and must not be anticipated here.
If a fix appears to require a lesson edit, that item **stops** and is reported.

Commit per item. Never push. Never write a handoff. Never self-commission work
outside §2–§6.

**One exception to "no lesson files":** Item C requires a fixture question, and
`lessons/_type-coverage.html` is the single sanctioned fixture file, as in
BRIEF-1 Item C. Follow that precedent exactly, including the corpus-ledger
reconciliation in §7.

---

## 1. THE GUARD LAW — applies to every item below

For each item, in this order:

1. **Phase 0 — MEASURE.** Establish the actual cause in the actual code before
   changing anything. Quote file and line numbers.
2. **RED.** Write the guard first. Run it against the **unfixed** engine and
   record the concrete failure — real numbers, real measurements, not "it
   fails".
3. **FIX.**
4. **PASS.** Run the guard against the fixed engine.
5. **SABOTAGE ROUND-TRIP.** Neuter the fix, confirm the guard goes RED again,
   restore, confirm PASS.

**A guard never observed failing is faith, not proof. Both the pre-fix RED and
the sabotage round-trip are required. Neither substitutes for the other.**

**If Phase 0 contradicts this brief's stated cause — as happened with BRIEF-1
Item B, where the chain turned out to be a build-time SVG and not CSS-floored
tiles — STOP that item, apply nothing, and report the measured cause with
evidence. Continue with the other items. A correct stop is a success.**

---

## 2. ITEM A — OPTION TABLES RENDER AS TABLES

### The measured cause (from BRIEF-2-SCAN, verify before acting)

`optionsOf()` at `engine/preview-engine.js:751` tests:

```js
const hasPic = /<\s*(img|svg|figure)\b/i.test(o.html);
```

`table` is absent from that list, so a table option falls to the text branch at
:758–759, where `stripTags` (:661) collapses it into one run. That run becomes
**both** the button's visible content **and** its `data-val` grading key.

Six questions affected, all in `bar_graphs_1to1.html`: **Q7, Q9, Q11, Q15, Q18,
Q19** (2 option tables each, 12 total). Q11 is the reference case, rendering as
`Orchestra instrumentsInstrumentGirlsBoysViola9010Violin5050Bass3030`.

### The fix

Teach `optionsOf` that a `<table>` is visual content, so the option renders its
markup rather than its stripped text.

**Constraints — all mandatory:**

- **Grading must not change.** BRIEF-2-SCAN verified all six currently grade
  correctly via positional resolution against authored `["1"]`/`["2"]` answers.
  After the fix, `check()` must still return true for exactly one option in each
  of the six. **Prove this per question, not in aggregate.**
- **The `data-val` key must not become the table's markup.** If keys are
  currently the stripped run, state what they become and confirm positional
  resolution still holds.
- **Sanitizer:** `DANGEROUS_TAGS` (:2697) does not include `table`, so tables
  already pass. Confirm; do not widen the sanitizer.
- **Styling:** option tables need enough CSS to read as tables — visible cell
  boundaries, header distinguishable from body, sized to sit in an option
  button at both viewports. Apply in **both CSS copies** (`rao.css` and the
  engine's `MARKUP_STYLE_CSS`), as Items A/D/E/F of BRIEF-1 did.
- **Do not restyle option buttons generally.** Scope to table-bearing options.

### Guard

New check: an option containing an authored `<table>` renders `<table>` markup
in the built output, and its rendered text is **not** the concatenated run.

RED against the unfixed engine on Q11. PASS after. Sabotage round-trip.

### Verification table

All 6 questions × 2 viewports (1280px, 390px): table renders, cell boundaries
visible, fits its option button without overflow, and `check()` grades correctly.

---

## 3. ITEM B — THE DROPPED_PROSE GUARD IS BLIND TO FLATTENING

### The measured cause

BRIEF-2-SCAN found that all six flattened-table questions build with
`issues: []`. The Item G guard from BRIEF-1 detects content that is **dropped**.
Flattened text technically renders, so it passes.

**The guard built to catch this failure class does not catch this failure
class.** That is the defect.

### The fix

Widen the check so that **structured content collapsed into plain text** is
flagged, alongside content dropped entirely. A `<table>`, `<ul>`, `<ol>`, or
similar whose structure is gone from the rendered output but whose text survives
should emit a warning at `warn` level, same as `DROPPED_PROSE`.

Name the new signal distinctly (e.g. `FLATTENED_MARKUP`) so the two classes stay
separable in reports.

**Sequencing note:** Item A repairs the six known cases. Build this guard
**against the pre-Item-A engine** so it is proved to fire on a real case, then
confirm it goes silent once Item A lands. If that ordering is impractical, use
the scratch-fixture approach BRIEF-1 Item G used — a gitignored fixture under
`tools/scratch/` checked against the engine at git HEAD.

**Do not tune the check to hit any particular number.** Run it corpus-wide and
report what it finds. If it flags cases beyond the six, **halt and chase every
one before committing**, exactly as Item G did when 25 became 55. A materially
different count is a finding, not noise.

### Guard

Two permanent cases added to `verify-structural.js` (the fast gate), matching the
Item G precedent. Sabotage round-trip required.

---

## 4. ITEM C — DRAG MEANS MOVE, NOT COPY

### The reported symptom

`Time_patterns_remix.html` **Q9** (sequence-build). Venkat dragged tiles into
answer slots. The tray still showed all four tiles, including duplicates of the
two he had placed. He confirmed this is the post-drop state, not mid-drag.

Same family: `symmetry_set2.html` **Q17** (categorize/venn) — tiles dragged into
Venn regions.

### Phase 0 — measure before assuming

Determine, per drag path, whether the tray tile is removed on drop:

- the shared tile drag path (`startDrag`, ~:2051)
- the venn/bins path (`vs-ghost`, ~:2384)

**These may already behave differently from each other.** Report what each
actually does. Also determine whether pulling a placed tile back out returns it
to the tray, since the fix must preserve that.

Enumerate which question types use each path and how many questions corpus-wide
are affected. **If the count is unmeasured, say unmeasured.**

### The fix

A tile placed in a slot or region leaves the tray. A tile removed from a slot or
region returns to it. **Fix the general case across both drag paths, not one
question.**

**Constraint — the no-repaint law:** the question DOM must not rebuild
mid-session. Tray removal must be a targeted mutation, not a re-render.

**Constraint:** if any question type legitimately allows one tile to be used in
multiple slots, that type is exempt. Identify any such type in Phase 0 and say
so; do not assume none exists.

### Guard

Real touch taps via CDP, per the standing testing rule — never mouse simulation.
Place a tile, assert it is gone from the tray; remove it, assert it returns.
RED before, PASS after, sabotage round-trip. Both drag paths covered.

---

## 5. ITEM D — VENN TILES MUST SIT INSIDE ONE REGION

### The reported symptom

`symmetry_set2.html` **Q17**. Dropped letter tiles straddle region boundaries —
one sits across the left circle's edge, another across the intersection
boundary. A child cannot tell which region their own answer is in.

Note this is **not** BRIEF-1 Item A, which fixed the *labels* above the circles
and is working correctly here. This is about the *contents*.

### Phase 0 — measure

Determine how a dropped tile's position is computed relative to the circle
geometry. Establish whether the overlap is because tiles are wider than the
exclusive regions, because placement ignores geometry, or both. **Report the
measured cause; do not assume mine.**

Enumerate all venn questions corpus-wide (BRIEF-1 Item A found 6 venn2
questions) and state how many exhibit boundary-straddling at each viewport.

### The fix

A placed tile renders wholly within the boundary of the region it belongs to, at
both viewports. If the exclusive region is too narrow to hold a tile at its
current size, the tile shrinks or wraps — **the region is not redrawn to fit the
tile**, since circle geometry carries the mathematical meaning.

**Halt condition:** if the only way to fit tiles is to change circle geometry or
overlap proportions, **stop and report**. That is a design ruling for chat, not
an engine decision.

### Guard

Geometric containment check: every placed tile's bounding box lies inside its
region's boundary. RED before, PASS after, sabotage round-trip, both viewports.

---

## 6. ITEM E — COLUMN ARITHMETIC MUST ALIGN

### The reported symptom

`subtract_numbers_up_to_five_digits.html` **Q1**. Vertical subtraction: the
digit rows are spaced wider than the answer boxes beneath them, so columns drift
apart left to right. By the final column the operand digits sit visibly away
from the box holding their result.

Venkat reports this affects many questions in that lesson. It has 12
fill-blanks.

**This is the highest-value item in the brief.** Misaligned columns in a
place-value lesson actively teach the wrong thing — column alignment is the
skill being taught.

### Phase 0 — measure, and enumerate the real blast radius

- Identify the layout that renders vertical column arithmetic. Quote the
  builder and its CSS.
- Measure the actual misalignment: x-centre of each operand digit vs x-centre of
  its answer box, per column, at 1280px and 390px. **Numbers, not adjectives.**
- **Enumerate every lesson corpus-wide using this layout.** Subtraction and
  addition lessons are both likely. Report count per lesson and corpus total.
  If your scan could miss a variant, disclose it.

### The fix

Operand digits, operator, currency symbol, and answer boxes share one column
grid. Every column's contents are centred on the same axis, top row to answer
box, at both viewports and for any number of digits.

Also address, in the same item:
- the `₹` symbol sitting loose rather than tight against its number
- the answer-box row reading as detached rather than as the sum's third line

**Constraint:** answer boxes are interactive targets and must not shrink below
44px. Carry the same explicit regression check BRIEF-1 Item B carried.

### Guard

Column-alignment check: for each column, |x-centre(top digit) − x-centre(answer
box)| within 2px, at both viewports, across at least 3 questions of differing
digit counts. RED before with the measured drift, PASS after, sabotage
round-trip.

---

## 7. LEDGER, TESTS, AND REPORT

**Corpus ledger.** Current total is **3,014**. Only Item C's possible fixture
may change it, and only by +1. Any other delta means something is wrong —
**halt and reconcile before committing.** Confirm the final count against the
commit gate's own count independently.

**Tests.** Full `npm test` on the final tree. **Do not pipe the run in a way
that masks its exit code** — this has now cost two wasted full-suite runs across
BRIEF-1 and BRIEF-2-SCAN. Report the exit code explicitly.

**Report format.** Per item: Phase 0 finding with line numbers, the RED numbers,
what was changed and where, the PASS numbers, the sabotage round-trip result,
and the verification table. Then:

- `git log --oneline origin/main..HEAD`
- `git status`
- **ANYTHING ELSE YOU NOTICED** — named in one line each, not investigated, not
  fixed.

**Standing laws.** Anti-laundering: every number traceable, unknowns reported as
unknowns, weak scans disclosed with their numbers rather than withheld. Chase
every changed number. Never pad. Fix the general case, not the file. No-repaint
law. Green exactly twice. Claude Code never pushes, never self-commissions,
never writes handoffs.
