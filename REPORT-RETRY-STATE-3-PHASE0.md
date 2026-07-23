# REPORT-RETRY-STATE-3 — PHASE 0 (Recon, no edits)

Read-only. No engine/tool/content changes. Grade 4 only; `lessons-g3/` untouched.

**Headline: the gap is exactly one thing — the `.cc-msg-why` whyWrong panel + its
"NOT QUITE" chip are NOT cleared by the Try-again path today, because they live
OUTSIDE `.qbody` and the reset only touches `.qbody`.** Everything else §2 requires
(typed value, selection, tint, wrong-marking) is already cleared. The hint already
survives by default. And there is a `verify-reset.js` law-4 conflict to flag before
Phase 2 — see the end.

---

## 0.1 — HEAD is `1d50f07`, unpushed ✅ (no stop)

```
HEAD:        1d50f072c793fed0cb543ad6d0921a08b3c24558  (1d50f07)
origin/main: ff2c0d4659800ec7ea02e25fe8a4a6463aef7164  (ff2c0d4)
ahead by:    1 commit, NOT pushed
  1d50f07 BRIEF-RETRY-STATE-2: retry-state engine pass (#88 #111 #84 #85 #109)
```

HEAD is the BRIEF-RETRY-STATE-2 commit, still local. No stop condition.

---

## 0.2 — `hideStaleFeedback()` — current wiring

**Defined:** `engine/rao-card.js:311–320`.

**What it clears:**
| Target | Action |
|---|---|
| every `.cc-msg-why` bubble (the whyWrong panel + its "NOT QUITE" `.cc-schip` chip) | `style.display = "none"` — **HIDE, node + class retained** (no-repaint compliant) |
| every `.cc-x` mark inside `.qbody` | `.remove()` (whisper marks; engine adds/removes these freely) |
| every `.cc-tried` class inside `.qbody` | `classList.remove("cc-tried")` |

It does **NOT** touch hint bubbles (`.cc-msg` WITHOUT `.cc-msg-why`) — scoped to
`.cc-msg-why` only.

**Called from — EXACTLY ONE site:** the `onNewSelection` handler
(`rao-card.js:119–126`), a **capture-phase** delegated listener on `qbody` for
`click` and `input`, fired only when the event target is inside
`.opt, .opt-fig, .hcell, .st-apple, .blank-input, .ans-input`.

**It is NOT called from the Try-again path (`resumeAnswering`/`restoreTask`).**
That absence is the entire bug: BRIEF-RETRY-STATE-2 wired dismissal to *new
selection only*, never to the Try-again button.

---

## 0.3 — The Try-again path, and the gap

**Path:** the "Try again" (and "I'll try now") solid button's `onTap` is
`resumeAnswering` (`feedbackRow`, `rao-card.js:237`). So every Try-again routes
through:

- **`resumeAnswering()`** — `rao-card.js:257–265`
- which calls **`restoreTask()`** — `rao-card.js:246–256` (`qbody.innerHTML = taskSnap; attach()`)

### What the Try-again path clears TODAY
| Item | Cleared? | How |
|---|---|---|
| typed value in fill-blanks | ✅ cleared (empty) | `qbody.innerHTML = taskSnap` (RETRY-STATE-2 #88) — **do not regress** |
| selected / highlighted option (`.is-sel`) | ✅ cleared | snapshot re-mount wipes it |
| red tint / wrong-marking (`.cc-x`, `.cc-tried`) | ✅ cleared | they live inside `.qbody`; wiped by the innerHTML reset |
| frozen (`inert`) / dimmed chrome / hidden foot | ✅ cleared | `freezeTask(false)`, `quietChrome(false)`, `hideFoot(false)` |
| the `.pv-fb` feedback slot | ✅ cleared | `fb.className/textContent/style` reset |

### What §2 requires gone — vs today
| §2 requires GONE on Try again | Today |
|---|---|
| the "NOT QUITE" chip | ❌ **STAYS** — it is inside the `.cc-msg-why` bubble, which lives OUTSIDE `.qbody` (in the `.cc-chat` stream inserted via `qbody.after(chat)`, in `.pv-card`), so `qbody.innerHTML = taskSnap` cannot touch it |
| the whyWrong / explanation panel (`.cc-msg-why`) | ❌ **STAYS** — same reason |
| red tint / wrong-marking / prior styling | ✅ cleared |
| typed value (fill-blanks) | ✅ cleared |
| selected / highlighted option | ✅ cleared |

**THE GAP = the `.cc-msg-why` panel + "NOT QUITE" chip.** That is the exact
observed defect (chip + panel still on screen after Try again). Everything else is
already correct.

**The fix (Phase 2, for context):** have `resumeAnswering()` also call
`hideStaleFeedback()`. It already hides `.cc-msg-why` (node retained → no-repaint
compliant) and leaves hint bubbles alone. This is a one-line extension of existing,
already-proven code — Try again and new-selection converge on the same helper, with
Try again additionally clearing the typed value + selection via `restoreTask()` (it
already does). §2's "one reset path" is naturally satisfiable.

---

## 0.4 — The hint's open/closed state — already safe by default

**Where it lives:**
- **Calm/adaptive mode (the default):** a hint is a `.cc-msg` tutor bubble
  (WITHOUT `.cc-msg-why`) in the `.cc-chat` wrap, created by `giveHint()`
  (`rao-card.js:213–217`) → `bubbles.msg(ensureChat(), "Hint "+n, …)`. `ensureChat()`
  (`:178`) inserts the chat via `qbody.after(chat)` — a **sibling of `.qbody`**, in
  `.pv-card`, **outside `.qbody`**.
- **Legacy/degraded mode:** the hint text sits in `.pv-hintbox` (`:576–608`), also a
  sibling in `.pv-card`, **outside `.qbody`**.

**Does the Try-again path touch it?** **No.** `resumeAnswering`/`restoreTask` touch
only `qbody.innerHTML`, the `.pv-fb` slot, and the action row. The chat stream and
`.pv-hintbox` are outside `.qbody`, so the reset is structurally incapable of
touching the hint.

**Which is it — active protection needed, or true by default?** **True by default.**
The hint survives Try again with no code today, and the Phase-2 fix keeps it safe
*because `hideStaleFeedback()` is scoped to `.cc-msg-why`* and never matches a hint
bubble. **G7 (hint-preserved) is therefore a regression guard** — it locks in an
invariant that is true now, so a future over-broad reset sweep cannot quietly
"tidy away" the hint.

---

## KEY FLAG for Phase 2 — the `verify-reset.js` law-4 conflict

Making Try again hide `.cc-msg-why` collides with `verify-reset.js`'s **law-4**
("help accumulates — every bubble that existed at feedback is still there, *fully
visible*, after the reset"). Measured against the repo:

- **Presence/class checks survive the HIDE (no change needed).** The
  "progress survives reset" section (`verify-reset.js:869–888`) checks
  `mid.bubbles === 1` (count) and `whyClass` (the class is present). A HIDE keeps
  the node **and** its `.cc-msg-why` class, so count stays 1 and the class stays →
  these **still PASS**.
- **Visibility checks will break IF the drilled bubble is a whyWrong bubble.** The
  drillBody law-4 (`:716`, `after.bubblesVisible`) and A4 (`:266`,
  `left.bubblesVisible`) require **every** `.cc-msg` visible after the reset. If a
  drill's feedback bubble is a `.cc-msg-why`, hiding it makes `bubblesVisible=false`
  → FAIL. `lessons/_type-coverage.html` carries `whyWrong` on 3 fixtures (e.g.
  single-select `q43sv8eg2`), so at least one drill may produce a whyWrong bubble.
  **Exactly which assertions flip will be confirmed by running `verify-reset.js`
  after the fix in Phase 1/2** — I am flagging, not guessing, the count.

**This means the new ruling PARTIALLY REVERSES law-4:** whyWrong bubbles now HIDE on
Try again; **hint bubbles still STAY.** So Phase 2 will need to amend
`verify-reset.js`'s law-4 assertions to distinguish whyWrong (hidden on Try again)
from hints (visible) — directly analogous to the RETRY-STATE-2 G1 inversion, and
exactly the law-4 tension RETRY-STATE-2 Phase 2 named as the reason it (wrongly)
did not dismiss on Try again. This is **expected** (Phase 2 says "report any test
that changed state"), **not** a repo-disagreement STOP.

---

## STOP GATE 1 — Phase 0 complete, awaiting authorization

- **0.1** HEAD `1d50f07`, unpushed — no stop. ✅
- **0.2** `hideStaleFeedback()` (rao-card.js:311–320) hides `.cc-msg-why` + clears
  `.cc-x`/`.cc-tried`; called from ONE site — the new-selection listener
  (119–126); **not** from Try again.
- **0.3** Try-again path = `resumeAnswering` (257–265) → `restoreTask` (246–256).
  It already clears value/selection/tint/marking; **the gap is the `.cc-msg-why`
  panel + "NOT QUITE" chip** (outside `.qbody`, untouched). Fix = call
  `hideStaleFeedback()` from `resumeAnswering`.
- **0.4** The hint lives outside `.qbody` (chat stream / `.pv-hintbox`); Try again
  never touches it → **"hint stays" is already true by default**; G7 is a
  regression guard.
- **FLAG:** the fix reverses law-4 for whyWrong bubbles; `verify-reset.js`
  visibility assertions will need amending in Phase 2 (presence/class assertions
  survive the HIDE unchanged).

No edits made. **Awaiting authorization before Phase 1.**
