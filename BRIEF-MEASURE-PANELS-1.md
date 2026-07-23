# BRIEF-MEASURE-PANELS-1
Read-only measurement pass for docs/ISSUES.md item 81
(solution-panel vertical layout contract). Numbers only — no fixes, no proposals.

## HARD CONSTRAINTS — read first
- READ ONLY. Do not edit, move, or delete any file. The ONLY file you may
  create is the report named in the Output section.
- lessons/ is authorized read-only for this pass. Grade 4 lessons may be READ.
  Grade 4 is NEVER written.
- Do not commit. Do not push.
- MEASURE, DO NOT ESTIMATE. Every height in this report must be a real rendered
  measurement from a browser layout engine. If a shape cannot be rendered, write
  "COULD NOT RENDER — <reason>" in that cell. Never fill a height with a guess,
  an estimate, or rows × assumed-row-height. A fabricated number here corrupts
  the layout contract built from it.

## STEP 0 — prove your method, then STOP
Before producing any numbers, report:
(a) What rendering capability you have (headless browser? which? the existing
    verify-styles.js / preview-engine harness? something else?).
(b) Exactly how you set viewport width to 380px, 768px, 1280px and read back a
    solution panel's rendered pixel height.
(c) One worked example: pick a single solution shape, render at 380px wide, and
    report the panel's measured height AND how you obtained that number.
STOP after Step 0. Show me this. Do not run the full sweep until I confirm.

## STEP 1 — enumerate the shapes (only after I confirm Step 0)
List every distinct solution shape that renders inside a solution panel, across
BOTH grades. For each: the shape's name/identifier, which grade(s) use it, and
one live example (lesson + question) where it appears. Discover the count from
the code and lessons — do not assume it.

## STEP 2 — measurement table
For each shape, at each width (380 / 768 / 1280 px), report:
- rendered panel height in px
- overflow: does it exceed the viewport height at that width, and by how many px?
  Use these viewport heights (flag me if you think they're wrong):
  380px wide → 820px tall (phone) | 768 → 1024 (tablet) | 1280 → 800 (laptop)
- wasted width: widest rendered content row's width as a % of the panel's
  available width. (A shape filling 35% of a 1280px panel IS the item-81 defect.)

## STEP 3 — reflowable vs. unbreakable
Classify each shape:
- REFLOWABLE — a sequence of short independent items (fact rows, step lines) that
  could wrap into columns without breaking meaning.
- UNBREAKABLE — contains an element that must not be split or narrowed (figure,
  diagram, geometry render, wide table, long single sentence). Name it.
- MIXED — describe which parts are which.

## STEP 4 — worst offenders
Two ranked lists: (1) shapes by wasted horizontal space at 1280px, worst first;
(2) any shape that overflows at 380px. These are what the contract fixes first.

## OUTPUT
Write the report to REPORT-MEASURE-PANELS-1.md at the repo root. No other file
changes. When done, show me the file path, line count, and paste the Step 2
table inline.
