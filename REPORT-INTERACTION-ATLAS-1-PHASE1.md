# REPORT-INTERACTION-ATLAS-1 — PHASE 1 (Build)

**Deliverable:** `review/_INTERACTION-ATLAS.html` — one self-contained page (2.0 MB,
LF, 22 embedded images, **zero external references**, opens offline by
double-click). Every tile is a screenshot of the **real card** driven to that
state by the real engine (at commit `1d50f07`) — **nothing is a mock-up, no state
was faked.**

**22 of 22 tiles built. None could not be built.**

**Read-only honoured:** zero changes to `engine/`, `tools/`, `lessons/`. All
fixtures were authored in scratchpad, built through the review builder, and
deleted after capture.

---

## 🔴 FINDINGS — reported loudly (per the brief; NOT fixed, per §5)

### Finding 1 (NEW, systematic) — a right answer written differently is ACCEPTED but painted RED as if wrong
Building Group D uncovered a real bug that no prior report noticed.

**What happens:** a child types `42,613` (comma), `1,00,000` (Indian lakh), or
`16+31=47` (addition the other way round). All three **grade correct** — the card
celebrates and offers **“Next question”** — **but the input box is coloured red**,
exactly like a wrong answer. The child is moved on *and* shown a red “wrong” box at
the same time. Two signals that contradict each other (the same *shape* of problem
as the parked Try-again bug).

**Scope:** all three “accept a right answer written differently” behaviours that
landed in `1d50f07` — comma grouping, Indian grouping, and addition commutativity.
Only the genuinely-wrong subtraction case (`4-9=5`) shows red *correctly*.

**Root cause (confirmed, not guessed):** the `1d50f07` fixes updated the
**grader** (`check()`) to accept these forms, but the **visual marker**
(`markFeedback()`) still compares with a normaliser that strips whitespace only,
not commas — `rao-card.js:699`. So the grader says "right" (green outcome, Next
question) while the marker says "wrong" (red box). The grader and the painter
disagree.

**Population affected:** every numeric fill-blank with an answer ≥ 1,000 (the
comma/Indian population — 121 questions) plus every typed-expression question — a
child who writes the number the natural way sees success and a red box together.

**I did not fix this** (§5). It is a candidate for a new engine brief; flagged here
and shown as-is in the atlas under **“Problem · just found.”**

### Finding 2 (minor, pre-existing) — “pick several”, the right pick loses its tick
In the multi-select wrong state, the wrong pick gets a ✕ (correct), but the
**right** pick the child made is no longer ticked — so it looks identical to the
options they never chose. Shown in the atlas tagged **“Worth a look.”** (This is a
known-shape gap, not new; surfaced here for Venkat's eye.)

### Finding 3 (minor, pre-existing) — ordering and sorting don't mark individual tiles
A wrong ordering or sorting shows only “Try again” — no per-number mark, unlike the
✕/tint that picks and typing boxes get. Captioned factually in the atlas so Venkat
can decide whether that inconsistency matters.

**Everything the brief predicted for Group D otherwise held:** comma, Indian, and
commutative all grade correct; subtraction stays wrong. The *grading* is as ruled;
only the *colour* is the finding.

---

## The parked bug, shown as-is (scenario 5)
The “After pressing Try again” tile shows the choices reset and Check restored, but
the old “Not quite” message still on screen — the known BRIEF-RETRY-STATE-3 defect.
Tagged **“Known problem · fix on hold.”** Not fixed.

---

## Tile inventory — all 22, technique per tile

Technique legend: **DS** = drive-then-screenshot via DOM clicks against the real
card · **Drag** = pointer-based manual drag (mouse down/move/up) · **Type** = set
the input value then Check. All captured at **390×844** (phone size), mascot dock
hidden for clarity.

| # | Tile (plain-English heading) | Technique | Status tag |
|---|---|---|---|
| A1 | A brand-new question | DS (fresh render) | As ruled |
| A2 | A right answer | DS | As ruled |
| A3 | A right answer, then "show me how" | DS (correct → show solution) | As ruled |
| A4 | The first wrong answer | DS | As ruled |
| A5 | After pressing Try again | DS | **Known problem · fix on hold** |
| A6a | Second wrong — with a worked solution | DS (wrong → try again → wrong) | As ruled |
| A6b | Second wrong — no worked solution | DS (bare fixture) | As ruled |
| B7 | Asking for a hint | DS | As ruled |
| B8 | Using every hint | DS | As ruled |
| B9 | A wrong answer after a hint | DS | As ruled |
| B10 | Try again, with a hint open | DS | As ruled |
| B11 | The solution, step by step | DS | As ruled |
| B12 | The solution, the last step | DS (advance steps) | As ruled |
| C-fb | A typing box (wrong) | Type | As ruled |
| C-ss | Pick one (wrong) | DS | As ruled |
| C-ms | Pick several (wrong) | DS | **Worth a look** |
| C-ord | Put in order (wrong) | Drag | As ruled |
| C-cat | Sort into groups (wrong) | Drag | As ruled |
| D13 | A comma in the number | Type | **Problem · just found** |
| D14 | Indian-style grouping | Type | **Problem · just found** |
| D15 | The same sum, the other way round | Type | **Problem · just found** |
| D16 | Order matters for take-away | Type | As ruled |

**No tile is missing.** Scenario 5 is present as the known bug; the D-findings are
present as newly-found problems.

---

## Techniques & harness notes (for the record)

- **Drive-then-screenshot** was the right medium: the engine resets on page load, so
  a mid-interaction state can only be captured, not frozen live. Each tile is a real
  screenshot, not a live embed.
- **DOM clicks, not coordinate clicks.** As Phase 0 warned, the mascot's corner dock
  overlaps the Check button at 390px; a coordinate click hits the mascot. Every drive
  uses `element.click()`, and the mascot dock is hidden before each capture.
- **Frame-scoped clicks for multi-card pages.** Two Group-D fixtures hold two cards;
  the Check click and the screenshot are scoped to the specific card, not the page
  (an early pass captured the wrong card until this was fixed).
- **Manual pointer drag for ordering/sorting** — the widgets use pointer events, so
  HTML5 drag does nothing; mouse down → stepped moves → up places the tiles.
- **Fixtures** (all scratchpad, none in `lessons/`): a rich single-select (hint +
  why-wrong + solution), a bare single-select, a two-card fill-blank (comma + Indian),
  a two-card expression (real commutativity + **synthetic** subtraction — the corpus
  has none), a multi-select, an ordering, and a sorting question.

---

## Presentation (for a non-technical reader)
Plain English throughout — no code names, file names, or issue numbers in anything
Venkat reads. Colour-coded tags (green “as ruled”, amber “worth a look”, red “a
problem”), a legend, and a callout naming the two problem areas up top so he can
jump straight to them. Grouped A–D, scannable, single-column on a phone.

---

## STOP GATE 2 — Phase 1 complete, awaiting authorization

- `review/_INTERACTION-ATLAS.html` built — **22/22 tiles, all engine-driven, none
  faked, self-contained, LF.**
- **Loud finding:** a right answer written with a comma / Indian grouping /
  commutatively is **accepted but shown in a red box** — grader and visual marker
  disagree (`1d50f07` updated one, not the other). Not fixed, per the brief.
- Scenario 5 shows the parked Try-again bug as-is.
- Read-only: `engine/`/`tools/`/`lessons/` untouched; scaffolding deleted.

**Awaiting authorization before Phase 2 (commit).**
