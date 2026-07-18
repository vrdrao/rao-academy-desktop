# Grade 3 Capability Scan — 2026-07-19 (overnight run, Step 5)

Input: `sources-g3/` — 198 `.docx` documents in 24 topic folders, ingested from
`word-staging/grade3/Class 3 - Done/`. Engine at scan time: **rao-master-19**.

**Method (read this before trusting the table):** this is a TITLE-driven scan,
cross-checked against the engine's actual TYPES/SUPPORTED lists and against
tonight's 16 Grade 4 conversions (which exercised the same pipeline and exposed
the real gaps listed in the overnight report's ENGINE-REQUESTS). The `.docx`
files are screenshot-based Word documents; no per-image reading was done at
scan time. Every GAP below names the document that triggers it. A morning
spot-check of 2–3 documents per GAP row is recommended before any engine work
is scheduled.

## Engine inventory (what rao-master-19 offers today)

- **Question types (12):** single-select, multi-select, fill-blanks, expression,
  order, sequence-build, categorize (venn2/bins), line-plot, construct (geometry),
  time, bar-graph, lattice.
- **fill-blanks layouts:** inline `[]` blanks (prompt/figure/sequence strip),
  round-scaffold, multiply (single-digit multiplier, full-product digit entry),
  column, vertical.
- **Figure types:** base-ten, spinner, number-line, inequality-line, icons,
  area-model, data-table (display-only), division-table (with blanks),
  equal-groups, sequence — plus arbitrary inline SVG.
- **Enrichment:** helper chips, 3-rung hint ladders, whyWrong + codes, stepped
  solutions (rao-master-14+).

## Capability table

| Capability the G3 docs imply | Verdict | Evidence / example document |
|---|---|---|
| 3-digit column add/subtract (+ missing digits) | SUPPORTED | `layout: column` used tonight for G4 5-digit subtraction — Addition/"Add two numbers up to three digits" |
| Balance / complete number sentences | SUPPORTED | inline fill-blanks — Addition/"Balance addition equations" |
| Patterns over increasing place values | SUPPORTED | G4 twin lessons exist — Addition/"Addition patterns over increasing place values" |
| Facts fluency, true/false, sorting (×/÷ all ranges) | SUPPORTED | single-select / categorize bins — all 49 fluency & skill-builder docs |
| Division table completion | SUPPORTED | division-table figure with blanks — Division/"Complete the division table" |
| **Input/output ("function machine") tables** | **GAP (workaround exists)** | Addition/"Addition input_output tables", Subtraction, Multiplication, Division variants + Measurement/"Conversion tables" — no `layout: table` with blank cells (hit tonight on G4 volume tables); can be re-authored as inline blank chains, but the table IS the pedagogy here |
| Estimation & rounding (incl. word problems, money) | SUPPORTED | round-scaffold ×/− used tonight — Estimation/"Estimate products_ word problems" |
| Venn diagrams (count / sort) | SUPPORTED | categorize venn2 — Data and graphs/"Sort shapes into a Venn diagram" |
| Line plots (create / interpret) | SUPPORTED | line-plot type — Data and graphs/"Create line plots" |
| **Pictographs** | **GAP (minor)** | Data and graphs/"Interpret pictographs" — no pictograph figure; hand-built inline SVG per question is viable (icons figure covers simple rows) |
| 2D/3D shape identify, faces/edges/vertices, polygon test | SUPPORTED | static SVG + selects, G4 twins exist — Geometry/"Identify faces of three-dimensional shapes" |
| Area of rectangles / missing side | SUPPORTED | G4 twins — Geometry/"Find the area of rectangles and squares" |
| Symmetry, reflection/rotation/translation (identify) | SUPPORTED | static SVG selects; G4 symmetry lessons — Geometry/"Reflection, rotation and translation" |
| **Maps (grid/direction reading)** | **PROBABLE GAP — inspect** | Geometry/"Maps.docx" — content unknown from title; if it needs an interactive map/grid, nothing exists; if read-the-picture selects, inline SVG suffices |
| Logical reasoning (order, guess-number, age puzzles, largest/smallest) | SUPPORTED | text selects/fills; G4 twins — Logical reasoning/"Find the order" |
| Length compare/convert, unit choice | SUPPORTED | G4 metric lessons — Measurement/"Compare and convert metric units of length" |
| **Measure with a centimetre ruler** | **GAP — inspect** | Measurement/"Measure using a centimetre ruler" — a static SVG ruler under an object works for read-off questions; a draggable-ruler interaction does not exist |
| **Thermometer reading** | GAP (minor) | Measurement/"Read a thermometer" — inline SVG thermometer per question is viable; no figure type |
| Weight/capacity compare (holds more, light/heavy) | SUPPORTED | picture selects (inline SVG) — Measurement/"Light and heavy" |
| Mixed operations, missing sign, multi-step word problems | SUPPORTED | G4 twins converted tonight — Mixed operations/* |
| **Money: count coins and notes (pictures)** | **GAP (workaround)** | Money/"Count coins and notes - up to 500-rupee note" — no coin/note figure type (same class as tonight's marbles/coin/die gap); hand-drawn ₹ note/coin SVGs per question are viable but heavy |
| Money arithmetic, ordering, price lists, making change | SUPPORTED | G4 money lessons — Money/"Making change" |
| Box multiplication | SUPPORTED | area-model figure — Multiplication/"Box multiplication" |
| Lattice multiplication | SUPPORTED | dedicated `lattice` type exists — Multiplication/"Lattice multiplication" |
| 1×2 / 1×3-digit multiplication (+ word problems) | SUPPORTED | layout: multiply is exactly this (single-digit multiplier) — Multiplication/"Multiply one-digit numbers by two-digit numbers" |
| Multiply numbers ending in zeroes | SUPPORTED | G4 twin converted tonight — Multiplication/"Multiply numbers ending in zeroes" |
| Arrays / equal groups / number-line multiplication models | SUPPORTED | icons, equal-groups, number-line figures — Understand multiplication/* |
| **Make arrays to model multiplication (child BUILDS the array)** | **GAP — inspect** | Understand multiplication/"Make arrays to model multiplication" — no build-a-grid interaction; re-wordable to selects at pedagogy cost |
| Numbers & comparing (order, greatest/least, even/odd, ordinals, skip-counting, sequences, number words) | SUPPORTED | G4 twins throughout — Numbers and comparing/* |
| Place value (models, names, expanded form) | SUPPORTED | base-ten figure — Place values/"Place value models up to hundreds" |
| Probability (likelihood words, more/less likely) | SUPPORTED | spinner figure; G4 twins — Probability/"Certain, probable, unlikely and impossible" |
| **Combinations** | PROBABLE GAP — inspect | Probability/"Combinations.docx" — if it asks to enumerate outfit-style combinations, selects work; if it wants an interactive pairing, nothing exists |
| Properties (addition, multiplication, distributive, parentheses) | SUPPORTED | G4 properties pair — Properties/* |
| Clock reading / matching, A.M.-P.M., elapsed time, calendars, schedules, timelines | SUPPORTED (verify `time` type breadth) | dedicated `time` type exists and is harness-covered; G4 time lessons — Time/* — morning check: does `time` render an analogue face for READ questions, or only elapsed-time? |

**Tally: 24 capability rows — 18 SUPPORTED, 6 GAP/inspect** (input-output tables,
pictographs, maps, ruler measuring, thermometer, coin/note pictures, build-an-array,
combinations — several are minor or have viable inline-SVG workarounds).

## Topics convertible TODAY with zero engine work

Everything in: **Addition, Subtraction, Division, Division fluency, Division skill
builders, Multiplication, Multiplication fluency, Multiplication skill builders,
Understand multiplication/division (except "Make arrays"), Estimation and rounding,
Numbers and comparing, Place values, Properties, Logical reasoning, Mixed operations
(except input/output tables), Probability (except Combinations pending inspection),
Patterns, Data and graphs (except pictographs), Geometry (except Maps), Money
(except coin-picture counting), Measurement length/unit-choice docs, Time.**

That is roughly **170 of the 198 documents**. The ~28 others need either a small
figure workaround (SVG pictographs, thermometers, coin art) or a morning ruling.

## Suspected duplicates / drafts — flag only, nothing deleted

1. **Underscore-prefixed fluency files** (`_Multiplication facts up to 10_ sorting.docx`,
   `_Multiply by 0.docx`, etc. — 13 files in Multiplication fluency / skill builders).
   The underscore prefix pattern suggests re-exports or drafts; most have no exact
   non-underscore twin, but the naming inconsistency wants a ruling.
2. **`_Multiplication sentences up to 10_ true or false_3.docx`** — trailing `_3`
   strongly suggests a third draft of the same document.
3. **Cross-grade twins:** ~20 documents share a topic with an existing Grade 4 lesson
   (Complete the division table, Box multiplication, Multiply numbers ending in zeroes,
   Properties of addition/multiplication, Estimate sums/differences/products word
   problems, Find the order, Ordinal numbers, Symmetry, Elapsed time, Time patterns,
   A.M./P.M., Count vertices edges faces, Identify 3D shapes, Identify faces of 3D,
   Round money amounts, Price lists, Rounding…). Presumably intentional per-grade
   banks with different difficulty — but Venkat should confirm Grade 3 wants its own
   copies before conversion effort is spent there.

## Recommended pilot candidates (Step 6 selection)

Zero-gap, mainstream, self-contained: **Division facts up to 10** (fluency),
**Multiplication word problems**, **Add two numbers up to three digits**.
(Structurally novel or gap-touching topics deliberately avoided.)
