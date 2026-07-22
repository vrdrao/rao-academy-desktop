SOLUTION-PANEL-LAYOUT-CONTRACT v1 (DRAFT — awaiting Venkat's ruling)
Chat-authored 2026-07-22. Item 81. Measured against REPORT-MEASURE-PANELS-2.md.

WHAT THIS IS
One rule, written at the panel level, that every solution shape inherits —
including shapes that do not exist yet. It is deliberately NOT a list of
per-shape fixes. Fixing seven shapes today means fixing the eighth again in
September.

THE DEFECT
The panel grows downward and never sideways. It has no rule about how to use the
width it is given, so it defaults to a single column and the child scrolls.
Measured: at 1280px the panel is 758px wide and two shapes fill 8.7% of it.
The other 91% is white space the child scrolls past.

WHAT THE PANEL IS
A 758px-wide box on desktop (plateaus at 758 for any screen ≥ ~868px), 642px at
tablet, 294px at phone. These are measured, not chosen. This contract does NOT
widen the panel — Ruling 19(1) settled that. It changes how content sits inside
the width already available.

────────────────────────────────────────────────
RULE 1 — CONTENT DECLARES ITS SHAPE
────────────────────────────────────────────────
A shape declares itself as exactly one of two kinds. The panel lays it out from
that declaration alone and never inspects what the content means.

  SEQUENCE   — an ordered set of short, self-contained items.
               A times table's rows. A facts list. A working string like
               "5,900 ✗, 6,001 ✓, 6,010 ✓". A set of method steps.
               May be reflowed into columns.

  BLOCK      — a single thing that loses meaning if broken.
               A figure. A diagram. A prose sentence. A rule statement.
               Never reflowed. Always full panel width.

A shape containing both declares each part separately. A `steps` solution whose
step text is prose but whose working is a sequence is BLOCK for the text and
SEQUENCE for the working.

WHAT COUNTS AS ONE ITEM (Ruling R5, added after the Phase-1 challenge):
An item is the smallest unit that still means something on its own. In a working
string, "5,900 ✗" is one item — the number and its mark travel together. The
comma-space between items is the boundary. The renderer establishes boundaries by
splitting the authored field; a measured width for a whole string is never the
width of an item.

When in doubt about whether something is one item or several, ask: would a child
reading it alone on a line still understand it? "5,900 ✗" yes — one item.
"5,900" without its mark, no — not an item boundary.

Any shape that fails to declare is treated as BLOCK. Failing safe means
scrolling, which is today's behaviour — never a broken figure.

────────────────────────────────────────────────
RULE 2 — SEQUENCES COLUMNISE TO FIT THE WIDTH
────────────────────────────────────────────────
A SEQUENCE lays out in as many columns as fit, where a column is as wide as the
sequence's own longest item plus gutter. Not a fixed column count — a computed
one.

  columns = floor(available_width / (longest_item_width + gutter))
  minimum 1, maximum 4.

Items fill ACROSS then wrap (Ruling R3): row 1 is items 1,2,3,4; row 2 is items
5,6,7,8. Never down-then-across. This is CSS grid auto-flow row, not CSS columns
— `column-count` fills downward and is therefore forbidden for sequences.

The cap of 4 is a legibility judgement, not a measurement (Ruling R1).

Worked example, table-1 @1280 (measured at 8.7% fill):
  available 758, longest item ~66px, gutter 24px
  → floor(758 / 90) = 8 → capped at 4
  Five rows become two rows of four. Panel height drops by roughly 60%.

Worked example, steps @1280. REPORT-MEASURE-PANELS-2 measured the widest LEAF in
the Grade-4 steps solution at 613px: the working string "5,900 ✗, 6,001 ✓, …".
That 613px figure is the width of the whole string, NOT of one item. Under Rule 1
the string is a SEQUENCE of ~6 short items, each ~90–130px:
  available 758, longest item ~130px, gutter 24px
  → floor(758 / 154) = 4 columns.
On a 294px phone: floor(294 / 154) = 1 column, and the string breaks BETWEEN its
items under Rule 3 rather than overflowing by 510px. That break is the layout fix
Ruling R2 refers to.

ITEM BOUNDARIES ARE DEFINED BY THE RENDERER, NOT THE LESSON. The working is
authored as a single field; solution-renderer.js splits it on ", " into item
elements. No lesson file changes.

Worked example of a sequence that correctly does NOT move: a shape whose longest
single item exceeds the available width computes to 1 column and stays as it is.
The rule applying and doing nothing is the rule working, not failing.

────────────────────────────────────────────────
RULE 3 — A SEQUENCE BREAKS BETWEEN ITEMS, NEVER WITHIN ONE
────────────────────────────────────────────────
"5,900 ✗, 6,001 ✓" is two items. It may break between them. It may never break
between "5,900" and "✗", or wrap "✓" alone onto the next line.

This is the rule that makes Rule 2 safe on a phone. A 613px working string on a
294px phone panel MUST break — the question is only where. Breaking between
items is a reflow. Breaking within one is damage, and worse than the scroll it
replaces.

If an item is individually wider than the panel, it does not break. It gets a
horizontal scroll rail of its own, and the panel does not grow.

────────────────────────────────────────────────
RULE 4 — BLOCKS NEVER REFLOW
────────────────────────────────────────────────
A BLOCK occupies full panel width at every size. If it overflows vertically, the
panel scrolls. If it overflows horizontally, it gets its own scroll rail — the
panel does not widen and neighbouring content does not shift.

────────────────────────────────────────────────
RULE 5 — THE `figure` SHAPE, DECLARED UP FRONT
────────────────────────────────────────────────
Ruling 19(3): the contract must state the figure rule NOW, while `figure` has no
instances and no CSS, so the first real figure inherits a rule rather than
inventing one.

  A figure is always BLOCK. It is never reflowed, never columnised, never
  scaled below legibility. It sits full panel width. If it is wider than the
  panel it gets a horizontal scroll rail. If two figures appear in one
  solution they stack; they do not sit side by side.

────────────────────────────────────────────────
RULE 6 — THE PHONE IS THE PRIMARY TARGET
────────────────────────────────────────────────
Grades 1–5 are primarily mobile and tablet. Where a desktop optimisation and a
phone optimisation conflict, the phone wins.

Concretely: at 294px nearly every SEQUENCE computes to one column, so phone
layout is dominated by Rule 3, not Rule 2. The phone gain comes from breaking
long items between their parts, not from columnising.

────────────────────────────────────────────────
WHAT THIS CONTRACT DOES NOT COVER
────────────────────────────────────────────────
- The walkthrough (.sol-walk / .cc-bub). Different container. Ruling 19(3).
- Panel width. Ruling 19(1): the cards are not widened.
- Any content rewrite. The contract changes layout only.

────────────────────────────────────────────────
RULINGS (Venkat, 2026-07-22) — CONTRACT IS NOW v1 FINAL
────────────────────────────────────────────────
R1. COLUMN CAP = 4. Confirmed. Beyond four columns the item text must shrink and
    gutters tighten; a child scanning loses the row. 4 is the ceiling at every
    width.

R2. RULING 19(4) IS REVISED: CONTENT → LAYOUT. The Grade-4 `steps` phone
    overflow was previously ruled a content problem on the basis that a 432px
    verification sentence was the widest leaf. REPORT-MEASURE-PANELS-2 found the
    true widest leaf is a 613px working string — a SEQUENCE, not prose. It is
    therefore covered by Rule 3 and is a layout fix. The original ruling was made
    on a wrong measurement and is superseded.

R3. COLUMN ORDER = ACROSS. A columnised sequence reads left to right, then wraps:
    6×1, 6×2, 6×3, 6×4 on the first row. NOT down-then-across. Reason: it matches
    the order the table was taught. Pedagogy ruling.

R4. THIS CONTRACT BINDS GRADE 3 AND GRADE 4. It is product-wide and inherits to
    every future grade. Five of the seven measured shapes are Grade-3 questions;
    designing against Grade 4 alone would have fitted the rule to 2 of 7 shapes.

R5. AN ITEM IS THE SMALLEST SELF-MEANING UNIT (ruled 2026-07-22 in response to
    Claude Code's Phase-1 challenge). The Grade-4 steps working string is a
    SEQUENCE OF ~6 ITEMS, not one 613px item. The 613px measurement is the width
    of the whole string. Each item is ~90–130px, so steps columnises to 4 at
    758px and breaks between items on a phone.
    WHY: R2 revised Ruling 19(4) from content to layout precisely BECAUSE the
    working string is a sequence rather than prose. Treating it as one
    unbreakable item would leave the 510px phone overflow unfixed and make R2
    meaningless. Reading A is rejected.
    v1's original Rule 2 worked example contradicted this and has been corrected.
    Brief assertion D as written encoded the rejected reading and must be
    rewritten — see the note appended to BRIEF-PANEL-LAYOUT-1.md.
    >>> R5 IS NARROWED BY R6. READ R6 BEFORE IMPLEMENTING ANYTHING. <<<

R6. sol-working IS BLOCK IN v1 (ruled 2026-07-22 after Phase 2). R5 defined what
    an item IS. It did not define how the renderer FINDS one, and Phase 2 proved
    it cannot, from content alone.
    THE EVIDENCE: 987 distinct working strings in the corpus. 713 contain no
    ", " and are one item already. Of the 274 that do, only ~110 are genuine
    short-token lists ("5,900 ✗, 6,001 ✓, …"). The other ~164 contain prose that
    a ", " split would shatter into fragments:
      "1 kL is 1,000 L, and 842 falls short of 1,000."
      → ["1 kL is 1,000 L", "and 842 falls short of 1,000."]
    Nothing in the content distinguishes a list from a sentence — both are
    "clause, clause". Telling them apart would require inspecting what the
    content MEANS, which Rule 1 forbids and which is unreliable regardless.
    THE TRAP THIS AVOIDS: the D2 fixture is one of the ~110 clean cases. A naive
    ", " split makes D2 go green while shattering ~164 prose workings elsewhere.
    Green harness, broken corpus. D2 tests ONE working; it does not license a
    corpus-wide split.
    THE RULING: sol-working carries no sequence marker and is therefore BLOCK by
    the Rule 1 fail-safe. If it exceeds the panel width it gets a horizontal
    scroll rail per the Rule 3 tail. No lesson files are edited.
    WHAT THIS COSTS, STATED HONESTLY: R2's phone-overflow fix for `steps` becomes
    a scroll rail rather than a reflow. That is worse than reflowing but is not
    damage. The prize was always the 8.7%-fill table and facts shapes; those are
    untouched and proceed exactly as designed.
    THE PATH BACK: itemisation requires an authoring signal in the lesson files —
    working authored as a list rather than a string, across ~499 step questions.
    That is a CONTENT brief, competing for the same review time as the Grade-4
    issue backlog. Deferred, not abandoned. When it happens, sol-working gets the
    marker and R5 applies in full.

R7. table-2 DOES NOT COLUMNISE INTERNALLY (ruled 2026-07-22). The two tables in
    sol-tables-2 already sit side by side. That side-by-side arrangement IS the
    width usage. Each table stays one internal column; internal columnisation
    does not stack on top of it.

R8. THE sol-step CARD LIST IS BLOCK (ruled 2026-07-22). Rule 1 lists "a set of
    method steps" under SEQUENCE, but Grade-4 step cards carry tall prose (goal
    plus reason) and are order-bearing. They stack full width. Not columnised.
