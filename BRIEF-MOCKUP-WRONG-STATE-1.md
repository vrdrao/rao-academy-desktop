# BRIEF-MOCKUP-WRONG-STATE-1

**This is a throwaway. Nothing here ships.**

The output is a single self-contained HTML file for visual review only. It is deleted after Venkat looks at it.

---

## SCOPE FENCE — read before starting

**Files that may be written:** exactly one — `mockup/wrong-state-mockup.html`. Create the `mockup/` directory if it does not exist.

**Files that are READ-ONLY:** everything else. Specifically `rao-card.js`, `rao-card.css`, `rao.css`, `solution-renderer.js`, every file in `tools/`, every file in `lessons/`, every file in `lessons-g3/`, `docs/ISSUES.md`, `package.json`.

**HALT immediately if any task appears to require:**
- editing the engine, the CSS, or any tool
- editing any lesson file in either grade
- adding a guard or fixture
- committing, staging, or pushing

**No guard is required for this brief** because no shipping code is touched. This is the only brief in this project where that is true, and it is true only because the output is a dead file.

---

## §1 — WHAT TO BUILD

A single HTML page showing the wrong-answer state for two question types, at three viewport widths.

Copy the real card markup and the real CSS from the engine so the mockup looks exactly like the product. Inline the CSS into the file so it is self-contained and openable with no server.

**Do not import the engine.** Hard-code the markup. This is a picture, not a working card.

---

## §2 — THE STATES TO RENDER

### 2A — Fill-blanks, Q14 (auth-q14), child typed 7

Above the solution panel, in this order:

    You put       7 × [7] = 63        (the 7 in the blank styled as a wrong answer)
    The answer    7 × [9] = 63        (the 9 in the blank styled as correct)

    Not quite. Here's how it works.

Then a divider, then the real solution panel for this question (the times-table shape, marked row).

Labels "You put" and "The answer" are left-aligned in a consistent column so the two expressions line up vertically underneath each other. The changed digit must be visually distinguishable at a glance.

### 2B — Single-select, Q5 (auth-q5), 8 × 8, child picked 56

Options remain in place. The picked option styled wrong, the correct option styled correct. Below them:

    Not quite. Here's how it works.

Then the solution panel.

### 2C — Variant for comparison

Render 2A a second time WITHOUT the "You put" / "The answer" labels — the two expressions stacked bare. This is the alternative Venkat is choosing between. Label the two variants clearly on the page: **"Variant A — labelled"** and **"Variant B — unlabelled"**.

---

## §3 — VIEWPORT WIDTHS

Render every state at three widths on the same page, stacked vertically with a clear heading above each:

- **380px** — phone. The primary device for grades 1–5.
- **768px** — tablet.
- **1280px** — desktop.

Use fixed-width containers so all three are visible on one page without resizing the browser.

**Do not fix the layout defect.** Item 81 is open and unresolved. If the solution panel overflows or wastes horizontal space, render it exactly as it does today. This mockup is about the wrong-answer comparison, not the panel layout.

---

## §4 — WHAT MUST NOT APPEAR

- No "Try again" button. Ruling 11 removes the second attempt.
- No hint button or hint bubble.
- No takeaway panel.
- The solution is open and visible, not behind a button.

The mockup shows the state AFTER rulings 11, 13 and 15 are built — not today's behaviour.

---

## §5 — REPORT

State the file path, the byte size, and confirm that exactly one file was written and nothing else was touched. Confirm no commit, stage, or push occurred.

---

## §6 — CLEANUP NOTE

Do not delete the file. Venkat will look at it and say when it goes.
