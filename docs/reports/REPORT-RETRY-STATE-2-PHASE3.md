# REPORT-RETRY-STATE-2 — PHASE 3 (Review artifacts and commit prep)

All Phase-3 items complete. One local commit, **not pushed**. Commit hash, file
list, and `git log --oneline origin/main..HEAD` are in the final section for the
chat-side enumeration check.

---

## 3.1 — The flicker demonstration (#111) — NEEDS VENKAT'S EYES

**Deliverable:** `review/_RETRY-STATE-2-flicker-demo.html` (a real, playable
review-format card — the 6×9 / auth-q3 shape, whyWrong on both distractors, built
through the shared pipeline with the CURRENT fixed engine so the new behaviour is
live) and `review/_RETRY-STATE-2-flicker-demo.gif` (a recorded run). Underscore-
prefixed so it is a demo, not a corpus review page (both format guards skip `_`).

**How to see it:** open the `.html`, tap **45** (wrong) → **Check** → the red
"NOT QUITE" panel appears → **Try again** → tap **63** or **54**. The panel and
the ✕ vanish the instant you tap a different option.

**The flicker finding — and why the original worry is largely moot.** The brief
flagged that hiding on every selection change could make the panel *flicker in and
out under rapid tapping*. **It does not**, because the hide is **one-directional**:
a new selection only ever *hides* the whyWrong panel; nothing a tap does can
*re-show* it. The panel reappears **only** on a subsequent wrong **Check**. So
rapid option-tapping hides the stale panel once and it stays hidden — no toggling.
The GIF shows this: wrong → panel → Try again → tap → panel gone → more taps →
still gone → correct pick → green with no stale panel.

**This still needs Venkat's eyes before it ships** (per the brief). The judgment
call he should confirm is the design itself: *a new selection dismisses the
critique of the previous answer.* Chat's position (and mine) is this is the
correct signal — a child who has moved on should not still be reading why their
last answer was wrong — and the one-directional hide means there is no flicker to
worry about. But it is his call.

---

## 3.2 — Review-page regeneration scope

**No corpus regeneration.** Per 3.2 and HANDOFF-45 §5.4 / ISSUES #117 (make-review
bakes working-copy line endings; a corpus sweep produces an unreadable diff and is
gated on #117), I regenerated **nothing** in the corpus. The only new review
artifact is the underscore demo above.

**Why the on-disk corpus review pages are NOT structurally stale despite the
engine/CSS change:** `verify-format`'s fingerprint compares DOM skeleton + paint
(frame gradient, Check button, qbody surface) — **not** `.blank-input` width. My
CSS change (box width) and rao-card.js changes (runtime behaviour, no markup
change) do not move that fingerprint, so all 103 review pages still MATCH the
fresh render (full-suite `verify-format` was green in Phase 2, and the explicit
re-run in 3.4 below confirms it). The review pages' *inlined* CSS still shows the
old 64px box, so a corpus regen is desirable eventually to reflect the wider box
visually — but it is out of scope here and gated on #117, exactly as the brief
directs.

---

## 3.3 — Line endings (byte-level Python, not grep)

`b.count(b"\r\n")` on a binary read of every file in the commit:

```
OK  engine/preview-engine.js            CRLF=0
OK  engine/rao-card.js                  CRLF=0
OK  engine/rao.css                      CRLF=0
OK  tools/verify-retry-state.js         CRLF=0
OK  tools/verify-reset.js               CRLF=0
OK  docs/ISSUES.md                      CRLF=0
OK  BRIEF-RETRY-STATE-2.md              CRLF=0
OK  REPORT-RETRY-STATE-2-PHASE0..3.md   CRLF=0
OK  review/_RETRY-STATE-2-flicker-demo.html  CRLF=0
```

All LF. (grep `-c $'\r'` deliberately not used — it gave false results twice on
2026-07-22.) The demo `.html` regenerated clean because the engine files are LF
(the #117 failure mode is a CRLF-drifted engine; ours is LF).

---

## 3.4 — Format check, run explicitly (not the silent staged variant)

`verify-format-staged` no-ops when no lesson/review pair is staged, so per the
brief I invoked `verify-format.js` directly on a fill-blank lesson touched by G4:

```
$ node tools/verify-format.js add_5digit_word_problems
PASS  add_5digit_word_problems  (32 cards, structure + paint identical)

all 1 match the lesson format
EXIT: 0
```

Structure + paint identical → the CSS width fix does not make this review page
stale, confirming 3.2.

---

## 3.5 — docs/ISSUES.md updated

**Closed (status → closed, 2026-07-23, with resolutions):** #84, #85, #88, #109,
#111. Each resolution names the guard (`verify-retry-state.js` G1–G5) and the
mechanism. #85 and #111 carried prior AMENDED notes — the closure is prepended,
the prior notes preserved (append-only law).

**Added — the Law-3 reversal record, #118** (per G1 and 3.5): a standalone row
recording that the fill-blank typed value is now CLEARED on Try again, reversing
the former "NEVER cleared" law, **so the old behaviour is not restored later from
a stale note** (the exact failure mode that hit tile-sizing twice). Table
integrity verified — every edited row has 11 columns (12 pipes).

**Disclosure (STANDING RULE 3 — no laundering):** `docs/ISSUES.md` carried
**pre-existing uncommitted changes from a prior session** before this brief began
— rows **116** and **117** (line-ending guard scope / make-review line-ending
baking), a **#44 → #44b** duplicate-number fix, and a **#92 status** update
("COMMITTED ff2c0d4"). These are not this brief's work. They are legitimate and
committing them causes no harm, but they ride along in this commit's ISSUES.md
diff and I am flagging them so the enumeration check is not surprised. I did
**not** author or alter them.

---

## 3.6 — Local commit (NOT pushed)

Staged **only** this brief's files (explicit `git add`, never `-A`) — the many
other untracked root notes, `docs/audits/`, `mockup/`, `lessons-g3/`, and the
pre-existing `review/compare_numbers_up_to_five_digits.html` (out of scope, mixed
CRLF, #117) were **deliberately excluded**.

Commit hash, full file list, and `git log --oneline origin/main..HEAD` are
reported in the chat message accompanying this report (they are generated by the
commit itself). The pre-commit hook (`test:fast`) ran as part of the commit;
`verify-format-staged` deferred to push (pipeline files staged, no lesson/review
pair) — expected. **Nothing was pushed.**

---

## Deliverables checklist

- [x] `tools/verify-retry-state.js` (new) — 5 guards + 6-digit G4 case
- [x] amended `tools/verify-reset.js` — G1 inversions + null-serialize fix
- [x] amended `engine/rao-card.js` — G1/G2 + LAWS law-3
- [x] `engine/preview-engine.js` — G3/G5 grading
- [x] `engine/rao.css` — G4 widths
- [x] `docs/ISSUES.md` — 5 closed + #118 reversal row
- [x] four phase reports (PHASE0–3)
- [x] `BRIEF-RETRY-STATE-2.md` committed (matches the #92 precedent: brief + reports at root)
- [x] flicker demo (`review/_RETRY-STATE-2-flicker-demo.html` + `.gif`)
- [x] one local commit, **unpushed**

---

## END OF BRIEF — awaiting chat's review

All five items (#88, #111, #84, #85, #109) are fixed, guarded (proved failing then
passing), full-suite-green, and closed in ISSUES.md. The one item that needs
Venkat's eyes before ship is the **#111 selection-dismiss behaviour** (3.1) — the
demo is ready. Nothing pushed; the commit is local for the chat-side check.
