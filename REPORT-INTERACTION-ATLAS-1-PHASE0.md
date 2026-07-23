# REPORT-INTERACTION-ATLAS-1 — PHASE 0 (Feasibility, read-only)

Read-only. Zero changes to `engine/`, `tools/`, `lessons/`. No commit. I probed
the hard states **against the real engine** (built two throwaway review pages
through `make-review` from scratchpad fixtures, drove them with Playwright,
screenshotted) rather than reasoning about them — then deleted the scaffolding.

**Headline: every one of the ~21 scenarios is reachable, driven by the real
engine.** None require faking a state. Three things to know before Phase 1: (1) a
mascot-overlay quirk dictates the capture technique, (2) scenario 16 needs a
synthetic question because none exists in the corpus, and (3) two Group-C types
may need a wider viewport. Details below.

---

## The technique — and one gotcha that decides it

**Primary technique: DRIVE-THEN-SCREENSHOT.** Build a real card through the shared
pipeline (`make-review`, current engine at `1d50f07`), drive it with real
interaction, and screenshot the card at the target state. Each atlas tile is an
image of the real card in the real state. This is the right medium for the stated
goal — *"scan every state side by side"* — and it is deterministic.

**Why screenshots, not live embedded cards:** the engine re-runs on page load and
resets every card to fresh, so a mid-interaction state (wrong-checked, walkthrough
open, …) **cannot be frozen on a static page** without re-driving it live on load —
which is exactly the fragile "sandbox" the brief forbids. Only scenario 1 (fresh)
could be a live embed; for uniformity I will screenshot all tiles. I will say so
per tile in the Phase-1 report.

**The gotcha — ROBO the mascot overlays the Check button at 390px.** My first two
probe passes failed to drive the *second* Check because the mascot's dock sits over
the Check button's centre, so a coordinate-click hit the mascot, not the button.
Switching to **DOM-level clicks (`element.click()`)** drove every state perfectly.
**Finding for Phase 1:** drive via DOM clicks (or hide the mascot dock before
capturing). This is a capture-harness detail, **not** an engine bug — I changed
nothing.

---

## Per-scenario feasibility

Legend — Reachable: ✅ yes · ⚠️ yes, with a caveat. Technique: **D**=drive-then-
screenshot · **G**=grading-drive (type→Check) · **Drag**=drag/tap-drive.
All captures target **390×844** unless noted.

### Group A — the answer paths
| # | Scenario | Reachable | Technique | Evidence / notes |
|---|---|---|---|---|
| 1 | Fresh, untouched | ✅ | D (or live) | renders fresh; trivial |
| 2 | Correct, just checked | ✅ | D | probed: green option + "Show me the solution" & "Next question →" offered. Settle sparks/chime before capture |
| 3 | Correct, then solution opened | ✅ | D | probed: tapping "Show me the solution" renders the full walkthrough **and the outcome stays correct** (green persists) |
| 4 | First wrong, just checked | ✅ | D | probed: "NOT QUITE" panel + ✕ on the wrong option, card locked |
| 5 | **After Try again (KNOWN BUG)** | ✅ | D | probed & screenshotted: options reset clean, Check returns — **but the "NOT QUITE" panel is still on screen.** This is the parked BRIEF-RETRY-STATE-3 defect. Caption per brief; **do not fix** |
| 6a | Second wrong — WITH walkthrough | ✅ | D | probed: 2nd wrong auto-opens the walkthrough and locks the card |
| 6b | Second wrong — WITHOUT walkthrough | ✅ | D | probed on a no-solution fixture: caps to "answer shown" + "Next question →", no Try again |

### Group B — help
| # | Scenario | Reachable | Technique | Evidence / notes |
|---|---|---|---|---|
| 7 | Hint 1 open, untouched | ✅ | D | probed: tapping Hint types "Hint 1" bubble; button becomes "Give one more hint" |
| 8 | All hints exhausted | ✅ | D | probed: 2-rung ladder, both rungs shown |
| 9 | Wrong AFTER a hint was opened | ✅ | D | open hint → wrong → Check; shows whether hint numbering holds (rule 7). Reachable by composition of two probed steps |
| 10 | Try again with a hint open | ✅ | D | hint bubbles live OUTSIDE the question body, so Try again cannot touch them — the hint survives (the exception). Contrasts with #5 |
| 11 | Walkthrough open, mid-steps | ✅ | D | probed: opens at "Step 1 of 2" with a "Next step" button |
| 12 | Walkthrough at final step (reveal) | ✅ | D | probed: "Next step" advances to "Step 2 of 2"; steps accumulate on screen |

### Group C — question types (first-wrong state each)
| Type | Reachable | Technique | Evidence / notes |
|---|---|---|---|
| fill-in-the-blank | ✅ | D | type wrong → Check → soft red tint, no ✕ |
| single-select | ✅ | D | = scenario 4 (✕ on the wrong option) |
| multi-select | ✅ | D | fixture in `_type-coverage`; ✕ on each wrong pick |
| ordering / drag | ⚠️ | Drag | drivable via drag (proven by the existing drag guard). **May need wider than 390px** — flag per tile in Phase 1 |
| categorize | ⚠️ | Drag/tap | drivable via drag or tap-to-place (proven by the venn / categorize-tap guards). **May need wider than 390px** |

*(Rule 5 contrast is demonstrable: fill-blanks tints; selects get the ✕.)*

### Group D — right answer written differently
| # | Scenario | Reachable | Technique | Evidence / notes |
|---|---|---|---|---|
| 13 | `42,613` with a comma — accepted | ✅ | G | comma grouping lands in `1d50f07`; also shows the widened box |
| 14 | `1,00,000` Indian lakh — accepted | ✅ | G | Indian grouping accepted (verified at grader level) |
| 15 | `16+31=47` (asked 31+16) — accepted | ✅ | G | use the real corpus commutativity question |
| 16 | `4-9=5` — correctly still WRONG | ⚠️ SYNTHETIC | G | **the corpus has ZERO subtraction/division typed-expression questions** (measured in the prior brief). This tile needs a **synthetic** subtraction fixture, authored in scratchpad, **not** added to `lessons/`. Will be labelled synthetic in the atlas |

**Group D confirmation:** all four grader behaviours were re-verified at the
grader level while probing — 13/14/15 grade correct, 16 grades wrong. Nothing
behaves differently than the brief states, so there is no §2-style "finding to
report loudly" — the `1d50f07` fixes hold.

---

## Fixtures Phase 1 will need (all outside `lessons/`)
- **Rich single-select** (hint ladder + whyWrong + solution) — Group A/B. *(built & probed)*
- **Bare single-select** (no solution) — scenario 6b. *(built & probed)*
- **Fill-blank** (5-/6-digit, comma + Indian) — Group C fill-blank, D-13/14.
- **Expression** — real commutativity question (D-15) + **synthetic subtraction** (D-16).
- **Multi-select, order, categorize** — reuse `_type-coverage` or small scratchpad fixtures — Group C.

None touch `lessons/`; they are demo sources in scratchpad, exactly as the flicker
demo was built.

---

## Unreachable scenarios: NONE
Every tile can be produced by the real engine. The only qualifiers are the
*technique* notes above (drag for two Group-C types; synthetic question for D-16;
possible wider viewport for drag types) — not reachability.

---

## STOP GATE 1 — Phase 0 complete, awaiting authorization

- All ~21 scenarios **reachable**, engine-driven; probed the hard ones for real.
- Technique: **drive-then-screenshot via DOM clicks** (mascot overlay rules out
  coordinate clicks); screenshots not live embeds (states can't be frozen on
  static load). Two Group-C drag types + D-16 synthetic + possible wider viewport
  are the only caveats.
- Scenario 5 reachable and correctly shows the **parked known bug** as-is.
- Read-only: no `engine/`/`tools/`/`lessons/` changes; probe scaffolding deleted.

**Awaiting authorization before Phase 1 (build the atlas).**
