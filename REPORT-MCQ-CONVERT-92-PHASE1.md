# REPORT-MCQ-CONVERT-92-PHASE1

Executed 2026-07-22 per BRIEF-MCQ-CONVERT-92, Phase 1 (3 questions only).
Read-only. No lesson file edited, no engine change, no commit, no push.
Phase 1 is a review gate: chat and Venkat rule before 26 more are generated.

---

## 0. Path confirmation

`find lessons -name "interpret-remainders.html"` returned exactly ONE path:

```
lessons/incoming/interpret-remainders.html
```

No ambiguity. This is the file operated on (read-only).

---

## 1. Answer-key sanity check (gate from BRIEF-RECOMPUTE-91)

For all three sampled questions the stored key equals the remainder of its
division — consistent with BRIEF-RECOMPUTE-91. No STOP triggered on this axis.

---

## 2. The three questions (first / middle / last in file order)

- Q1 (first): **qdsstjm5x**
- Q15 (middle): **quhjhn9s2**
- Q29 (last): **q77w8xe5n**

Operands identified from the prompt: dividend = max(prompt numbers), divisor =
min(prompt numbers). Shuffle is deterministic: options are ordered by
`md5("<id>|<role-index>")`, so Phase 2 will regenerate byte-identically.

---

### Q1 — qdsstjm5x
- **Prompt:** "There are 83 chairs set up in the gym for an assembly. After the assembly, all the chairs will be put away on racks that hold 5 chairs. How many chairs will be on the final rack? []"
- operands a=83, b=5 → quotient=16, remainder=3, quotient+1=17
- stored key **3** = remainder ✓
- **Options in final shuffled order:**

| pos | value | role | code | whyWrong (verbatim from taxonomy) |
|---|---|---|---|---|
| 0 | 17 | distractor: quotient+1 | QUOTIENT_OFF_BY_ONE | "So close — one group too many, or one too few! Think about what happens to the leftover." |
| 1 | 5 | distractor: divisor | DIVISOR_AS_ANSWER | "Sneaky! This is the number you divide *by* — the question wants what comes out." |
| 2 | **3** | **CORRECT** | — | — |
| 3 | 16 | distractor: quotient | REMAINDER_AS_ANSWER | "This is the little bit left over, not the answer — the question wants the big share." |

- correct-answer position: **2**
- all 3 distractors > correct? **YES** (17, 5, 16 all > 3)
- collisions: none

---

### Q15 — quhjhn9s2
- **Prompt:** "A farmer wants to plant 33 tomato plants. If he puts 7 plants in each full row, how many tomato plants will be in the partially filled row? []"
- operands a=33, b=7 → quotient=4, remainder=5, quotient+1=5
- stored key **5** = remainder ✓
- **Options in final shuffled order:**

| pos | value | role | code | whyWrong (verbatim from taxonomy) |
|---|---|---|---|---|
| 0 | 4 | distractor: quotient | REMAINDER_AS_ANSWER | "This is the little bit left over, not the answer — the question wants the big share." |
| 1 | **5** | **CORRECT** | — | — |
| 2 | 6 | distractor: remainder+1 | NEAR_MISS | "So close! This answer trips right at the finish line — the last step wants one more look." |
| 3 | 7 | distractor: divisor | DIVISOR_AS_ANSWER | "Sneaky! This is the number you divide *by* — the question wants what comes out." |

- correct-answer position: **1**
- all 3 distractors > correct? **NO** (quotient 4 < 5)
- **collision:** source `quotient+1` = 5 collides with the correct answer (5) → INVALID, skipped; next valid source `remainder+1` = 6 used instead. This is the mitigation the brief intends: because DIVISOR (7) alone would leave two of three distractors above the key, remainder+1 keeps one distractor near the key rather than systematically larger.

---

### Q29 — q77w8xe5n
- **Prompt:** "At the fair, Lara has 218 ride tickets. Each ride on the Ferris wheel costs 3 tickets. After riding the Ferris wheel as many times as possible, how many tickets will Lara have left? []"
- operands a=218, b=3 → quotient=72, remainder=2, quotient+1=73
- stored key **2** = remainder ✓
- **Options in final shuffled order:**

| pos | value | role | code | whyWrong (verbatim from taxonomy) |
|---|---|---|---|---|
| 0 | **2** | **CORRECT** | — | — |
| 1 | 72 | distractor: quotient | REMAINDER_AS_ANSWER | "This is the little bit left over, not the answer — the question wants the big share." |
| 2 | 73 | distractor: quotient+1 | QUOTIENT_OFF_BY_ONE | "So close — one group too many, or one too few! Think about what happens to the leftover." |
| 3 | 3 | distractor: divisor | DIVISOR_AS_ANSWER | "Sneaky! This is the number you divide *by* — the question wants what comes out." |

- correct-answer position: **0**
- all 3 distractors > correct? **YES** (72, 73, 3 all > 2)
- collisions: none

Sample correct-answer positions: {2, 1, 0} — spread across the three, no clustering.

---

## 3. 🚨 CONFLICT — the taxonomy messages are written for the OPPOSITE question type

The brief assigns four misconception codes and instructs (HARD RULES): *"Never
invent a whyWrong message. Use the taxonomy's text verbatim, or report that the
code has no message."* I used the verbatim text above. **But the verbatim text
does not fit this lesson**, because every code in `docs/MISCONCEPTIONS.md §6
Division` was written assuming the **correct answer is the QUOTIENT**. In this
lesson the correct answer is the **REMAINDER** — the mirror image. Measured
against the taxonomy's own detection rules:

| Code (brief) | Applied to | Taxonomy rule | Fits this lesson? |
|---|---|---|---|
| **REMAINDER_AS_ANSWER** | the **quotient** distractor | `distractor == dividend mod divisor` (distractor IS the remainder) | **NO — inverted.** Here the distractor is the quotient and the *correct* answer is the remainder. |
| **QUOTIENT_OFF_BY_ONE** | quotient+1 | `distractor == correct ± 1` | **NO.** quotient+1 (e.g. 17) is not correct±1 (correct=3). |
| **DIVISOR_AS_ANSWER** | divisor | `distractor == divisor where correct is the quotient` | Partial — value matches, but rule assumes correct=quotient; here correct=remainder. |
| **NEAR_MISS** | remainder±1 | `3 ≤ |d−c| ≤ 10 or within 15%` | **NO.** remainder±1 gives \|d−c\|=1, which is the taxonomy's **OFF_BY_ONE** (\|d−c\|==1), not NEAR_MISS. |

**The most serious case — REMAINDER_AS_ANSWER on the quotient distractor:**
a child who taps the **quotient** (16 on Q1 — the *big* number, the number of
racks) is shown, verbatim:

> "This is the little bit left over, not the answer — the question wants the big share."

That is **factually backwards**. The child picked the big share; the message tells
them they picked the leftover. The correct answer here IS the little bit left over.
Shipping this verbatim message would teach the wrong thing to exactly the child who
made the most common error.

**Root cause:** the taxonomy has no code whose message is authored for "correct
answer = remainder, distractor = quotient." The brief's code map is the closest
*rule-name* match but the *message* is written for the inverse question.

### This is a decision for chat / Venkat, not for me to make. Three options:

1. **Add mirror-image codes to the taxonomy** (e.g. `QUOTIENT_AS_REMAINDER_ANSWER`
   with a message like "This is how many *full* groups there are — the question
   asks for what's *left over*."). This edits `docs/MISCONCEPTIONS.md`, which the
   brief's SCOPE FENCE forbids ("Do NOT modify docs/MISCONCEPTIONS.md"). So this
   path needs Venkat to lift that fence.
2. **Author lesson-local whyWrong messages** that correctly describe the
   remainder-question distractors, keeping the `code:` for analytics but not using
   the taxonomy's `message`. This violates "Never invent a whyWrong message" unless
   chat authorises it.
3. **Re-map to codes whose verbatim message is at least not false** here (e.g. the
   remainder±1 distractors → OFF_BY_ONE, whose message "Just one away…" is true).
   The quotient distractor has no honest existing message.

I cannot resolve this within the brief's fences (no taxonomy edits, no invented
messages) without producing a whyWrong that is factually wrong. **STOP for a
ruling.**

---

## 4. Mechanics that DID work (for the record)

- Deterministic generation confirmed: re-running the generator produces identical
  options and order (shuffle keyed on the stable question id).
- Collision handling works: Q15's quotient+1 collides with the key and correctly
  falls through to remainder+1.
- "All distractors larger than correct" flag: TRUE for Q1 and Q29, FALSE for Q15.
  Across the full 29 this count is a finding Phase 2 will report; on this sample,
  the remainder±1 fallback is what breaks the "smallest-is-always-correct" pattern
  when it fires.

---

## 5. STOP

Nothing was written to the lesson file. Two items need a ruling before Phase 2:

1. **The whyWrong conflict in §3** — the primary blocker. The brief's own rules
   ("use taxonomy text verbatim" + "never invent a message" + "do NOT modify
   MISCONCEPTIONS.md") are mutually unsatisfiable for the quotient distractor,
   whose only rule-matched taxonomy message is factually inverted for a
   remainder-answer question.
2. Confirmation that the option design in §2 (four options, this shuffle, these
   sources) is what Venkat wants before it is replicated across 29.

Awaiting chat/Venkat.
