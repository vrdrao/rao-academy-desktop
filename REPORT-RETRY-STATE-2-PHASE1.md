# REPORT-RETRY-STATE-2 — PHASE 1 (Guards first, all five, proved failing)

Guards only. **Zero production code changed** — `engine/preview-engine.js`,
`engine/rao-card.js`, `engine/rao.css` are all untouched by this phase. The only
files written are two guard/test files:

- `tools/verify-retry-state.js` — **new**, one file covering all five state
  transitions (G1–G5).
- `tools/verify-reset.js` — **amended**, the two G1 sites Phase 0 found (A5 +
  the `keepValues` drill) inverted from preservation to clearing.

**Headline: all five guards FAIL against the unmodified engine, each for the
stated reason; every control/sabotage/negative assertion PASSES (the fixtures
distinguish the real bug from over-lenient behaviour); and the two inverted
verify-reset sites flip green→red exactly as intended.** Two items need a chat
decision before Phase 2 — see "Decisions needed" at the end.

---

## What each guard drives, and why it fails now

| Guard | Issue | How it exercises the transition | Why it fails on the unmodified engine |
|---|---|---|---|
| **G1** | #88 | Real browser: type a wrong value → Check → "Try again" → read the box. | The wrong value **survives** the retry (`"99999"`), old law preserved it. |
| **G2** | #111 | Real browser: wrong pick → Check (whyWrong "Not quite" types) → Try again → tap a **different** option → inspect the panel. | The `.cc-msg-why` panel + chip are **still visible** — nothing dismisses them on a new selection. |
| **G3** | #84 | Node grader: four `check()` calls against key `["42613"]`. | `"42,613"` grades **false** — the comma form is rejected. |
| **G4** | #85 | Real browser at 390×844 **and** 360×780: type the full answer, measure `scrollWidth` vs `clientWidth`. | Plain box **60px < 77px** and round-scaffold result **54px < 76px** — both clip. |
| **G5** | #109 | Node grader: commutative-addition positives (real q2zyrs8kf) + synthetic −/÷ negatives. | `"16 + 31 = 47"` and `"16+31=47"` grade **false** — commutativity rejected. |

Each guard **also** asserts the behaviours that must NOT change, and those pass
today — proving the guard tests the bug, not the whole feature:
- **G3** the two misplaced-comma sabotage cases (`"4,2613"`, `"426,13"`) already
  grade false, and must stay false after the fix.
- **G5** the two synthetic non-commutative negatives (`4-9=5` vs `9-4=5`;
  `3÷12=4` vs `12÷3=4`) already grade false, and must stay false.
- **G2** the "node still present in the DOM" and "prior ✕/tint cleared" checks
  already pass (the bug is the *bubble*, not node-removal or the ✕).

---

## G1–G5 verbatim output — `node tools/verify-retry-state.js` (unmodified engine)

```
RETRY-STATE VERIFICATION — BRIEF-RETRY-STATE-2 (G1 #88 · G2 #111 · G3 #84 · G4 #85 · G5 #109)

── G3 (#84): comma-grouped numeric fill-blank grades CORRECT; misplaced comma does NOT ──
  PASS  G3 — ["42613"] -> true (control: bare digits) — check returned true
  FAIL  G3 — ["42,613"] -> true (the fix: canonical thousands grouping) — check returned false, expected true — comma form rejected (#84)
  PASS  G3 — ["4,2613"] -> false (sabotage: comma after 1 digit is misplaced) — check returned false
  PASS  G3 — ["426,13"] -> false (sabotage: comma leaves 2 trailing digits) — check returned false

── G5 (#109): commutative ADDITION accepted; subtraction/division backwards STAY wrong ──
  PASS  G5 — ["31 + 16 = 47"] vs key ["31 + 16 = 47"] -> true (control: exact (q2zyrs8kf)) — check returned true
  FAIL  G5 — ["16 + 31 = 47"] vs key ["31 + 16 = 47"] -> true (the fix: operands swapped, addition (q2zyrs8kf)) — check returned false, expected true — commutative addition rejected (#109)
  FAIL  G5 — ["16+31=47"] vs key ["31 + 16 = 47"] -> true (swapped + no spaces (real #109 keystrokes)) — check returned false, expected true — commutative addition rejected (#109)
  PASS  G5 — ["4 - 9 = 5"] vs key ["9 - 4 = 5"] -> false (SYNTHETIC negative: subtraction is NOT commutative) — check returned false
  PASS  G5 — ["3 ÷ 12 = 4"] vs key ["12 ÷ 3 = 4"] -> false (SYNTHETIC negative: division is NOT commutative) — check returned false

── G1 (#88): the fill-blank box is EMPTY after "Try again" ──
  FAIL  G1 — the box is empty on retry — value="99999" — the wrong answer survived the retry (old law: preserved). #88.

── G2 (#111): a new selection HIDES the stale whyWrong panel (node stays) ──
  FAIL  G2 — whyWrong panel HIDDEN after new selection — panel still visible — stale 'Not quite' survives the retry. #111.
  FAIL  G2 — 'Not quite' chip hidden — chip still visible. #111.
  PASS  G2 — prior-attempt ✕/tint cleared — 0 marks
  PASS  G2 — HIDE not remove: nodes still in the DOM — panel + chip present

── G4 (#85): the fill-blank box is wide enough — no clipping at 390×844 and 360×780 ──
  FAIL  G4 — plain 5-digit box not clipped @ 390×844 — client 60px < scroll 77px — 5 digits clipped (#85)
  FAIL  G4 — round-scaffold RESULT box not clipped @ 390×844 — client 54px < scroll 76px — result "10000" clipped while operands fit (#85 amendment, qm37aecdj)
  FAIL  G4 — plain 5-digit box not clipped @ 360×780 — client 60px < scroll 77px — 5 digits clipped (#85)
  FAIL  G4 — round-scaffold RESULT box not clipped @ 360×780 — client 54px < scroll 76px — result "10000" clipped while operands fit (#85 amendment, qm37aecdj)

10 assertion(s) FAILED
```

**All five transitions fail, each for its own documented reason. Exit code 1.**

---

## The two G1 sites in `verify-reset.js` — before → after (guard-first proof)

Phase 0 (0.3) located two assertions that assert *preservation*. Both are now
inverted to assert *clearing*, each with a dated comment naming this brief and
the ruling (so a future reader cannot mistake the reversal for drift). Neither
was deleted.

### BEFORE (unmodified engine, unmodified guard — exit 0, green)
```
  PASS  A5 — typed values preserved verbatim through Check — 13, 20
  PASS  A5 — typed values preserved verbatim through Try Again — 13, 20
  PASS  fill-blanks (typed value survives, tint clears) [1280×800 desktop pointer] — marks cleared, typed values preserved verbatim (serialize ["13"]) — FR-2 ruling 4
  PASS  fill-blanks (typed value survives, tint clears) [390×844 TOUCH (CDP)] — marks cleared, typed values preserved verbatim (serialize ["13"]) — FR-2 ruling 4
```

### AFTER (unmodified engine, inverted guard — exit 1, the inverted sites red)
```
  PASS  A5 — typed values preserved verbatim through Check — 13, 20
  FAIL  A5 — typed values CLEARED on Try Again (BRIEF-RETRY-STATE-2 #88) — values ["13","20"] — expected both empty; the wrong answer survived the retry
  FAIL  fill-blanks (typed value CLEARED on retry, tint clears) [1280×800 desktop pointer] — serialize after Try Again ["13"] — expected EMPTY (BRIEF-RETRY-STATE-2 #88: the box clears on retry); driven was ["13"]
  FAIL  fill-blanks (typed value CLEARED on retry, tint clears) [390×844 TOUCH (CDP)] — serialize after Try Again ["13"] — expected EMPTY (BRIEF-RETRY-STATE-2 #88: the box clears on retry); driven was ["13"]
```

The inverted assertions correctly fail against the unmodified engine (it still
preserves), which is the guard-first proof that they now test the *new* law.
After the Phase 2 engine fix they will pass. **Expected breakage — not a
regression.** (The `keepValues` flag name is kept; only its assertion is
inverted, with a comment at both the drill call and the assertion.)

**One deliberate refinement — flagged for chat (see Decisions needed #1):** A5
physically contains **two** preservation assertions — *through Check* (line 322)
and *through Try Again* (line 337). I inverted **only the Try-Again one** and
**kept the through-Check assertion** as preservation. Reason: #88 asks to clear
the box *"when the child begins a retry"* — i.e. on the Try-again tap — not at
Check. Clearing at Check would erase the child's wrong answer while they are
still reading *why* it was wrong. The engine fix (Phase 2) will clear in the
Try-again path (`restoreTask`/`resumeAnswering`), not in the Check path
(`calmWrong`), so through-Check preservation stays true after the fix.

---

## Design choices baked into the guards (report, per STANDING RULES)

### G3 comma rule — canonical thousands grouping only
The guard encodes: **accept a comma form only when the commas sit in exact
thousands positions** (`^\d{1,3}(,\d{3})*$`). `"42,613"` ✓; `"4,2613"` ✗;
`"426,13"` ✗. This is **not** a lenient "strip all commas" rule — a misplaced
comma stays wrong (the sabotage requirement). It matches what the app actually
displays: the engine's own grouping helper (`grp()`,
`preview-engine.js:1044`) is Western (comma every 3 digits from the right), so
the natural form a child types back is Western-grouped. **Indian lakh grouping
(`1,00,000`) was considered and NOT accepted** — the app never renders it, so a
child never sees it to copy. This affects only the 4 six-digit-answer questions
(Phase 0); at 5 digits Indian and Western grouping are identical (`42,613`).
Flagged as Decisions needed #2 in case chat wants lakh grouping accepted too.

### G5 negatives are SYNTHETIC and stay out of `lessons/`
Per the amended G5 ruling and Phase 0 (0.5): the corpus has **6 typed-expression
questions, all addition, zero −/÷**. So the two negative fixtures (`4-9=5` vs
`9-4=5`; `3÷12=4` vs `12÷3=4`) are **synthetic**, defined inline in the guard and
**not added to any lesson**. The positive fixture uses the **real** #109 question
`q2zyrs8kf` ("thirty-one plus sixteen", key `"31 + 16 = 47"`). The Phase 2 fix
must be an **operator allowlist of `{+}`** — `×` deliberately excluded (Phase 0
found zero × questions; this project does not defend against content that does
not exist), to be commented at the allowlist so it is not "restored" as a bug.

---

## Populations the fixes will touch (from Phase 0, for the fix-time count)

- #84 comma / #85 width: **121** numeric fill-blank questions ≥1000 (49 at ≥5
  digits) — G3/G4 are engine-level, so all inherit the fix.
- #109 commutative: **6** typed-expression questions (all `+`).
- #111 stale feedback: **309** whyWrong questions across 20 files.

---

## Scope confirmation

`git status` after Phase 1 shows only:
```
 M tools/verify-reset.js
?? tools/verify-retry-state.js
```
(`docs/ISSUES.md`, `engine/preview-engine.js`, `engine/rao.css`,
`review/compare_numbers_up_to_five_digits.html` were already modified in the
session's opening git status — **pre-existing, untouched by this brief.**)
No production engine/renderer/CSS file was changed. `rao-card.js` LAWS-block
amendment and the `docs/ISSUES.md` reversal row are deferred to Phase 2/3 as the
brief sequences them.

---

## Decisions needed before Phase 2 (STOP GATE 2)

1. **A5 split (G1).** I inverted only A5's *through-Try-Again* assertion and kept
   *through-Check* as preservation (reasoning above). The brief phrased it as
   "flip A5." Confirm this split, or tell me to also clear at Check.
2. **G3 comma rule.** Confirm Western thousands-grouping only (`42,613` yes,
   `1,00,000` no), matching the app's own display. Say so if Indian lakh grouping
   should also be accepted for the 4 six-digit questions.

---

## STOP GATE 2 — Phase 1 complete, awaiting authorization

- **verify-retry-state.js** (new): 5 guards, **all fail** for the stated reason;
  10 assertions total, the 6 bug-assertions red, the 4 control/sabotage/node
  assertions green. Exit 1.
- **verify-reset.js** (amended): 2 G1 sites inverted (3 assertion instances),
  **before green → after red** shown verbatim. Exit 1 (expected).
- **Zero production code changed.** No pushing.

**Awaiting authorization before Phase 2.**
