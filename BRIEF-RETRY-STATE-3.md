# BRIEF-RETRY-STATE-3 — "Try again" means a fresh start

Chat-authored 2026-07-23. Grade 4 only. `lessons-g3/` is out of scope.

This brief **corrects a chat-side authoring error** in BRIEF-RETRY-STATE-2.
BRIEF-RETRY-STATE-2 landed at commit `1d50f07` (local, unpushed) and is otherwise
correct — four of its five fixes stand. Only the #111 behaviour is wrong.

---

## 0. WHAT WENT WRONG — read this before touching code

ISSUES.md #111 was written as *"any new selection dismisses previous feedback."*
That is TRUE but INCOMPLETE. Venkat's actual standing instruction, given
repeatedly, is broader:

> **When a child clicks "Try again", the card returns to exactly the state it was
> in when they first arrived at the question.**

BRIEF-RETRY-STATE-2 implemented `hideStaleFeedback()` fired on **new selection
only**, and its Phase 2 report stated plainly: *"Dismisses on new selection, not
on Try-again."* Chat read that line and approved it anyway. The error is
chat-side authoring, not execution.

**Observed defect (Venkat, screenshot, 2026-07-23):** child answers wrong →
"NOT QUITE" chip + explanation panel appear → child clicks **Try again** → **the
chip and panel are still on screen.** The typed value clears; the feedback does
not. Same button, two different behaviours.

---

## 1. STANDING RULES — these override anything below

1. **Guard-first, always.** Write the fixture, run it, **see it FAIL**, then fix,
   then see it PASS. Report the FAIL output verbatim. A guard not observed
   failing is not a guard.
2. **Measure the repo, never these notes.** Verify every claim here against the
   working tree before acting. If the repo disagrees with this brief, **STOP and
   report.**
3. **No-repaint law is BINDING.** The question DOM must never rebuild
   mid-session. Panels are append-only. This reset is **HIDE / CLEAR ONLY —
   NEVER node removal, never a re-render of the card.** A fix that rebuilds the
   card will be rejected at audit even if it looks correct on screen.
4. **Anti-laundering.** Every number traceable. "UNPARSED, reason X" beats a
   guess.
5. **No pushing.** Local commit only.
6. **Engine only.** Zero changes under `lessons/`. If a fix seems to need a
   content change, **STOP and report.**

---

## 2. THE RULING — verbatim, do not reinterpret

**RULED BY VENKAT 2026-07-23.**

On **"Try again"**, the card returns to its first-arrival state. Every one of the
following must be gone:

- the "NOT QUITE" chip
- the whyWrong / explanation panel (`.cc-msg-why`)
- any red tint, wrong-marking, or prior-attempt correctness styling
- the typed value in fill-blanks *(already correct — do not regress it)*
- the selected/highlighted option state

**ONE EXPLICIT EXCEPTION — RULED:**

- **The HINT STAYS.** If the child opened a hint before their wrong attempt, that
  hint remains open and visible after Try again. It is not part of the failed
  attempt; the child worked for it and keeps it.

**SEPARATELY RULED — KEEP THE EXISTING BEHAVIOUR:**

- Dismiss-on-new-selection stays. If the child does **not** click Try again but
  simply taps a different option, the stale feedback still vanishes. Both
  triggers coexist. **Do not remove the `hideStaleFeedback()` selection wiring
  built in BRIEF-RETRY-STATE-2** — extend it, do not replace it.

---

## PHASE 0 — Recon (no edits)

Produce `REPORT-RETRY-STATE-3-PHASE0.md`.

**0.1** Confirm HEAD is `1d50f07` and still unpushed. If not, **STOP and report.**

**0.2** Report the exact current wiring of `hideStaleFeedback()`: where it is
defined, every place it is called from, and what each call site clears.

**0.3** Report the exact current wiring of `restoreTask()` / the Try-again path:
line numbers, and an enumerated list of what it clears today vs what §2 above
requires. **The gap between those two lists is the work.**

**0.4** Report where the hint's open/closed state lives, and confirm whether the
Try-again path currently touches it. This determines whether "hint stays" needs
active protection or is already true by default. **Report which.**

**STOP GATE 1 — report and wait for chat authorization.**

---

## PHASE 1 — Guards, proved failing

Produce `REPORT-RETRY-STATE-3-PHASE1.md`. Guards only, no production changes.
Extend `tools/verify-retry-state.js`.

**G6 — Try again clears ALL failed-attempt state.**
Scenario: answer wrong → Check → observe chip + panel visible → click **Try
again** → assert every item in §2's list is hidden/cleared.

Assert **each item separately**, not as one lumped check — a single combined
assertion cannot tell you which piece regressed later.

**G7 — Try again PRESERVES the hint.**
Scenario: open hint → answer wrong → Check → Try again → assert the hint is
**still open and visible.** This guard protects the exception from being
"tidied away" by a future reset sweep.

**G8 — no-repaint compliance.**
Assert the panel and chip nodes are **still present in the DOM** after Try again
(hidden, not removed), and that the question DOM was not rebuilt.

**G9 — selection-dismiss still works (regression guard).**
The BRIEF-RETRY-STATE-2 behaviour must survive this change. Assert: wrong answer
→ tap a *different option* (no Try again) → feedback hidden.

**Exit requirement:** G6 must FAIL against the current engine (that is the bug).
G9 must **PASS** (it already works — this one is a regression guard, and passing
now is correct). State plainly in the report which guards are expected to fail
and which are expected to pass, **before** running them, then show the actual
results against that prediction.

**STOP GATE 2 — report and wait.**

---

## PHASE 2 — The fix

Produce `REPORT-RETRY-STATE-3-PHASE2.md`.

Extend the Try-again path so it performs the full reset in §2, preserving the
hint.

**Constraints:**
- **HIDE / CLEAR, never remove.** No-repaint law.
- **One reset path.** Try again and new-selection may share a helper, but Try
  again clears strictly more (it also clears the typed value and selection).
  If the code cannot express this cleanly, say so — do not force it.
- **Do not regress the four other BRIEF-RETRY-STATE-2 fixes** (#88 typed-value
  clearing, #84 commas incl. Indian grouping, #85 box widths, #109 addition
  commutativity).

Run G6–G9: all must PASS. Run the full suite: report any test that changed state
and why. Paste output.

**EXPECTED, RULED, NOT A REGRESSION — the law-4 conflict.** Phase 0 flagged that
`verify-reset.js` law-4 assertions (drillBody 716, A4 266) require *every*
`.cc-msg` bubble to stay visible after a reset. **Venkat ruled 2026-07-23:**

> A wrong-answer message disappears on Try again. A hint does not.

A hint is help the child earned and keeps. A wrong-answer message is a verdict on
an attempt they have just abandoned.

So law 4 is **narrowed, not abolished.** Required work:

- Amend the law-4 assertions to distinguish the two bubble types: **hint bubbles
  must still be visible** after Try again; **`.cc-msg-why` bubbles must be
  hidden.** Do not weaken the assertion to "some bubbles survive" — it must still
  fail if a *hint* vanishes.
- Amend the LAWS comment block in `rao-card.js` (law 4) to state the exception,
  dated, citing this brief.
- Report before-and-after for every amended assertion, so the narrowing is
  visibly intentional.

If any law-4 assertion cannot be split this way because the fixture does not
distinguish hint bubbles from whyWrong bubbles, **STOP and report** — do not
delete the assertion to make the suite green.

**STOP GATE 3 — report and wait.**

---

## PHASE 3 — Review artifact and commit

Produce `REPORT-RETRY-STATE-3-PHASE3.md`.

**3.1** Rebuild `review/_RETRY-STATE-2-flicker-demo.html` as
`review/_RETRY-STATE-3-reset-demo.html`, against the fixed engine, so Venkat can
verify by hand: get it wrong → Check → Try again → **screen is clean, hint (if
opened) survives.**

**3.2** Line endings: verify with **byte-level Python** (`b.count(b"\r\n")`), not
`grep`. Grep gave false results twice on 2026-07-22.

**3.3** Run `node tools/verify-format.js <lesson>` **explicitly** and paste
output. `verify-format-staged` reports green when nothing is staged and the check
never ran.

**3.4** `docs/ISSUES.md`: reopen **#111** with a note that the first fix was
partial, then close it against this brief. **Do not silently amend the old
row** — the partial fix and its correction must both be visible, so this
authoring error stays legible to whoever reads the log next.

**3.5** Commit locally. **DO NOT PUSH.** Report the hash, file list, and
`git log --oneline origin/main..HEAD` for chat-side enumeration.

---

## Deliverables

- amended `tools/verify-retry-state.js` (G6–G9)
- amended engine file(s) — Try-again reset path
- `review/_RETRY-STATE-3-reset-demo.html`
- `docs/ISSUES.md` updated (#111 reopened + closed)
- four phase reports
- one local commit, unpushed, stacked on `1d50f07`

## Out of scope

- `lessons-g3/` — hard fence
- lesson content of any kind
- the other four BRIEF-RETRY-STATE-2 fixes — **do not touch, do not "improve"**
- corpus-wide review page regeneration (#117-gated)
- `docs/MISCONCEPTIONS.md`
