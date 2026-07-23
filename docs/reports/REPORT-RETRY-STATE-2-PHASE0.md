# REPORT-RETRY-STATE-2 — PHASE 0 (Recon and law verification)

Read-only. No edits to engine, tools, or content. Grade 4 only; `lessons-g3/`
untouched. Every number below carries the command that produced it.

**Headline: no STOP triggered. Tree is clean (0.1), and the #85 truncation gate
(0.6) came back DISPLAY-ONLY — the grader receives the complete string.** Ready
for STOP GATE 1 authorization.

---

## 0.1 — Tree is clean ✅ (no stop)

```
$ git log --oneline origin/main..HEAD
(empty)
$ git rev-parse HEAD        -> ff2c0d4659800ec7ea02e25fe8a4a6463aef7164
$ git rev-parse origin/main -> ff2c0d4659800ec7ea02e25fe8a4a6463aef7164
```

HEAD **equals** origin/main. Zero unpushed commits. The prior push completed. No
stop condition. Working tree has the pre-existing untracked/modified files listed
in the session's opening git status (BRIEF-* notes, mockups, audit docs) — none
are part of this brief's scope and none were touched.

---

## 0.2 — The retry path

**File:** `engine/rao-card.js`. The "new attempt after a wrong verdict" path is
two functions:

| Function | Lines | Role |
|---|---|---|
| `resumeAnswering()` | 246–254 | The `onTap` of the "Try again" button. Orchestrates the reset. |
| `restoreTask()` | 226–245 | Restores the mount-time task snapshot (`taskSnap`) and re-attaches the behavior. |

The "Try again" button itself is built by `feedbackRow(solidLabel)` (207–219);
its solid button's `onTap` is `resumeAnswering` (line 217). `resumeAnswering`
runs, in order:

1. `removeRow()` — removes the feedback action row.
2. `freezeTask(false)` — re-enables interaction on `.qbody`.
3. `hideFoot(false)` — un-hides the Hint/Check footer.
4. `quietChrome(false)` — un-dims card chrome (`.pv-tlabel` / `.pv-ring`).
5. `restoreTask()` — `qbody.innerHTML = taskSnap` then `attach()` re-run.
6. `fb.className = "pv-fb"; fb.textContent = ""; fb.style.color = ""` — clears the
   feedback slot.
7. `syncHintBtn()`.

### State artifacts it RESETS (on "Try again")
- **✕ wrong-selection glyphs** and **red blank tints** — wiped by the
  `qbody.innerHTML = taskSnap` restore (231–239).
- **Selection state** (`.is-sel`) — gone with the snapshot restore.
- **Frozen / dimmed / hidden-foot chrome** — cleared by steps 2–4.
- **The `.pv-fb` feedback slot** — cleared (step 6). *(Note: in adaptive mode this
  slot is already empty — `calmWrong` sets `fb.textContent = ""` at line 495; the
  "Not quite" chip lives in the bubble stream, not here — see 0.2 leaves-alone.)*

### State artifacts it LEAVES ALONE (deliberately)
Documented at rao-card.js:224–225 ("Attempt counters … live in this closure and
are deliberately NOT reset") and enforced by law 4 (help accumulates):
- **Closure counters:** `wrongCount`, `hintNum`, `rungIdx`, `shownWhys`.
- **The bubble / chat stream** — hint bubbles AND the whyWrong bubble (the one
  carrying the **"Not quite"** chip + `cc-msg-why` warning tint). These sit in
  `.pv-card` **outside** `.qbody`, so the snapshot restore structurally cannot
  touch them.
- **Fill-blanks typed values** — preserved verbatim across the re-mount by the
  `keep[]` capture/restore (233–244).

### Relevance to #111
There is **no per-selection handler** that dismisses stale feedback. The whyWrong
panel / "Not quite" chip / prior ✕ marks are cleared **only** on the "Try again"
button, never when the child simply taps a different option. That absence is
exactly issue #111. (`calmWrong` at 478–536 is the only place feedback is raised;
nothing lowers it on a fresh selection.)

---

## 0.3 — Law 3, verified against the repo ✅ (confirmed, with one nuance)

**Law text is present, verbatim, at `engine/rao-card.js:15–26`:**

> 3. WRONG IS A WHISPER (amended by BRIEF FR-2, 2026-07-19, per HANDOFF-24
>    rulings 1–4 …). … Fill-blanks get NO glyph: the wrong blank tints softly red
>    (border + text) and **the typed value is NEVER cleared — erasing it reads as
>    punishment.** … On "Try again" every ✕/tint clears and the task returns to
>    its first-attempt state — restored from a snapshot taken at mount, with
>    fill-blanks typed values **preserved verbatim** (guard: tools/verify-reset.js
>    A1–A5).

The exact clause the brief quotes ("the typed value is NEVER cleared — erasing it
reads as punishment") is at **lines 24–25**. The "preserved verbatim … A1–A5"
citation is at **lines 25–26**. **CONFIRMED.**

**The A1–A5 assertions are present, verbatim, at `tools/verify-reset.js:147–158`:**

```
147   A1–A5 — THE WRONG-MARK LAWS (BRIEF FR-2, 2026-07-19, per HANDOFF-24):
148     A1  a wrong selection displays a ✕ mark on that option after Check.
149     A2  a ✕ never appears on a correct selection — including a correct
150         selection inside a wrong multi-select attempt.
151     A3  a ✕ never appears on an unselected option.
152     A4  Try Again clears every ✕/tint, and ONLY those: hint bubbles, chat
153         content and action history are untouched (help accumulates), and
154         attempt counters do not reset (counter survival is proven by the
155         "progress survives reset" section — wrongCount + ladder position).
156     A5  fill-blanks: a wrong blank tints (border + text) with NO ✕ glyph;
157         a correct blank in the same attempt is untouched; the typed value
158         is preserved VERBATIM through Check and through Try Again.
```

**Nuance for Phase 1 (G1):** the brief predicted "whichever of A1–A5 asserts
preservation." It is **A5** — specifically its final clause "the typed value is
preserved VERBATIM through Check and through Try Again" (line 158). That is the
assertion G1 must INVERT (assert *cleared* on Try again). There is a second live
site: the per-behavior reset drill at `verify-reset.js:714–717` runs the
fill-blanks case with `{ keepValues: true }` and the comment "INVERTED from FR-1's
'must NOT survive'" — this too asserts preservation and will need inverting under
G1. **Flagging both now so the G1 reversal is complete, not half-done.**

---

## 0.4 — Existing reset guard inventory (`tools/verify-reset.js`)

Two guarded law-groups drive real Chromium (Playwright), computed-style, real
clicks — never markup strings.

**A1–A5 — wrong-mark laws (one line each):**
- **A1** — a wrong selection shows a red ✕ after Check (single- and multi-select).
- **A2** — no ✕ on a correct selection, including a correct pick inside a wrong
  multi-select.
- **A3** — no ✕ on any unselected option.
- **A4** — "Try Again" clears every ✕/tint and ONLY those; hint bubbles + chat +
  action history survive; attempt counters do not reset.
- **A5** — fill-blanks: wrong blank tints border+text, no ✕ glyph; a correct blank
  in the same attempt is untouched; **typed value preserved verbatim through Check
  and through Try Again.** ← the G1 reversal target.

**A6–A9 — the two-attempt cap:**
- **A6** — a second wrong attempt LOCKS the question (qbody inert, foot hidden,
  zero retry controls), and the lock holds after settling.
- **A7** — the walkthrough opens AUTOMATICALLY on the second wrong attempt.
- **A8** — no green anywhere at walkthrough open (reveal stays at the final step).
- **A9** — auto-open records solved-with-help, not correct. Plus: a
  `canWalk()`-false second wrong CAPS to shown-answer (no dead-end loop; Item 50).

**Per-behavior reset drill (≈600–770):** snapshot → wrong → "Try again" → compare
computed state to snapshot, for every behavior. Fill-blanks case runs with
`keepValues: true` (asserts the typed value **survives**, tint clears) — the second
G1 inversion site (see 0.3). Also asserts qbody un-inerts after Try again, and a
touch-drag placement / `touch-action:none` regression guard.

---

## 0.5 — Population counts

Corpus scope = `lessons/*.html` (19) + `lessons/incoming/*.html` (84) = **103
Grade-4 files**, **2,668 `@q` blocks**. Command for all three: a Python pass that
splits each file on `<!--@q … -->`, parses the frontmatter `type`/`answer`, and
counts (script: `scratchpad/recon.py`, verbatim in-tree run reproduced below).

```
$ python recon.py     # globs lessons/*.html + lessons/incoming/*.html
Grade-4 corpus files: 103
Total @q blocks: 2668
```

### #84 / #85 population — numeric fill-blank answers ≥ 1000
**121 questions.** (fill-blanks whose answer list has any element that parses as an
integer ≥ 1000, commas stripped.) Digit-count breakdown (max digits per question):

| digits | questions |
|---|---|
| 4-digit | 72 |
| 5-digit | 45 |
| 6-digit | 4 |

**≥ 5-digit subset = 49 questions** — this is the tight #85 (5-digit-box-width)
population. Zero UNPARSED answers.

### #109 population — typed-expression questions with `+` or `×`
**6 questions**, all `type: expression`, **all using `+` only** — the corpus
currently contains **zero** `×`, **zero** `−`, and **zero** `÷` expression
questions. Enumerated (anti-laundering — the full list, not a summary):

| id | answer | file |
|---|---|---|
| qba35afcq | `17 + 2 = 19` | lessons/_type-coverage.html (fixture) |
| q7b5bzxxh | `4 + 3 + 5 + 6 = 18` | incoming/Divisibility_rules_remix.html |
| qkv96jjkt | `8 + 1 + 2 + 1 = 12` | incoming/Divisibility_rules_remix.html |
| qdr2xyix7 | `5 + 6 + 7 + 0 = 18` | incoming/Divisibility_rules_remix.html |
| qp2czt6zi | `15 + 12 = 27` | incoming/add-subtract-multiply-divide-remix-expanded.html |
| q2zyrs8kf | `31 + 16 = 47` | incoming/add-subtract-multiply-divide-remix-expanded.html |

`q2zyrs8kf` (`31 + 16 = 47`, prompt "thirty-one plus sixteen") is the exact #109
case. **Consequence for Phase 1 G5:** the multiplication positive fixture and BOTH
negative fixtures (subtraction `4-9=5`, division backwards) have **no natural home
in the corpus** — they must be **synthetic** fixtures in `verify-retry-state.js`.
Flagging so the synthetic fixtures are visibly intentional, not a gap.

### #111 population — questions rendering a whyWrong message
**309 questions** across **20 files** (frontmatter contains a `whyWrong:` block).

---

## 0.6 — #85 truncation gate — CORRECTNESS GATE — DISPLAY-ONLY ✅ (no brief-wide stop)

Method: real Chromium (Playwright), the exact #84 five-digit question (`qrgncsxq7`,
answer `42613`), mounted through the real engine + rao-card.js pipeline. Typed
`42613` into the narrow `.blank-input` with **real per-character key events**
(`pressSequentially`, 30 ms/key), at **390×844 and 360×780**. Then read what the
**grader** receives — `RaoPreview.serialize(qbody, "fill-blanks")` — and the
`RaoPreview.check(...)` verdict. Script: `scratchpad/trunc.js`.

**Result — identical at both viewports:**

```
behavior:        fill-blanks
answer:          ["42613"]
maxlength:       12                 (input allows 12 chars; 5-digit fits)
DOM value:       "42613"
grader receives: ["42613"]          ← COMPLETE. Not truncated.
check result:    true               ← grades CORRECT
rendered width:  64px   client 60px   scrollWidth 77px   clipped: true
```

**Verdict:** the grader receives the **complete** string and grades a correct child
**CORRECT**. Per the brief's own rule, **#85 is display-only and stays
`severity: layout`.** The entire brief proceeds — no stop.

But the clipping is real and visible: the 5 digits need ~77px, the box gives 60px
of client width, so `scrollWidth > clientWidth` (`clipped: true`) — the child sees
their own answer cut off / scrolled. That is the legitimate #85 layout defect G4
must fix by **widening the box** (never shrinking the font, per the ruling). The
input carries `maxlength="12"` (engine lines 1711/1726; round-scaffold uses
`maxlength="7"` at line 1046) — comfortably above 5, which is why no character is
ever dropped.

### Bonus recon (confirming #84 and #109 are real defects today)
Node-level grade calls against the unmodified engine:

```
fill-blanks, key ["42613"]:
  ["42613"]  -> true
  ["42,613"] -> false     ← #84: the comma form is rejected today
expression, key ["31 + 16 = 47"]:
  ["31 + 16 = 47"] -> true
  ["16 + 31 = 47"] -> false   ← #109: the commutative form is rejected today
```

Both confirmed real against the working tree.

---

## STOP GATE 1 — Phase 0 complete, awaiting authorization

Summary for the chat-side check:
- **0.1** clean tree, HEAD == origin/main — no stop. ✅
- **0.2** retry path = `resumeAnswering`/`restoreTask` (rao-card.js:226–254);
  resets ✕/tint/selection/chrome/fb, leaves counters + bubble stream + fill-blank
  values alone; **no per-selection dismissal exists** (the #111 gap).
- **0.3** Law 3 + A1–A5 confirmed verbatim; G1's inversion target is **A5**
  (verify-reset.js:158) **plus** the `keepValues:true` drill at 714–717.
- **0.4** existing guard = A1–A5 (wrong-marks) + A6–A9 (two-attempt cap) +
  per-behavior snapshot drill.
- **0.5** populations: #84/#85 = **121** (≥5-digit subset **49**); #109 = **6**
  (all `+`, so ×/−/÷ fixtures are synthetic); #111 = **309** across 20 files.
- **0.6** truncation gate: grader receives the **full string**, grades CORRECT —
  **#85 is display-only, stays `layout`. No brief-wide stop.** ✅

**No edits were made. Awaiting authorization before Phase 1.**
