# REPORT-RECOMPUTE-91

Executed 2026-07-22 per BRIEF-RECOMPUTE-91. Read-only. No lesson file modified,
no engine change, no commit, no push. This report settles Item #91 against the
FILE by independent recomputation. The verdict is Venkat's — this report states
only what the keys are and what the three candidate values are.

---

## 0. Path discrepancy — REPORTED, not decided

The brief names the target as `lessons/interpret-remainders.html`. **That path does
not exist.** The lesson lives at:

```
lessons/incoming/interpret-remainders.html
```

This matches CLAUDE.md's note that ~105 lesson files sit in `lessons/incoming/`.
There is also a rendered `review/interpret-remainders.html` (not the source of truth).
I proceeded against `lessons/incoming/interpret-remainders.html` as the only lesson
source that exists. Flagging the mismatch per the HARD RULES; not deciding it.

---

## 1. File metadata

| Field | Value |
|---|---|
| Path used | `lessons/incoming/interpret-remainders.html` |
| Line count | 349 |
| Last COMMITTED (`git log -1 --format=%cd`) | Mon Jul 20 17:42:28 2026 +0530 |
| Filesystem MTIME (`stat`) | 2026-07-20 17:07:24 +0530 |
| Working-tree status | clean (no uncommitted changes to this file) |

COMMITTED and MODIFIED differ as the brief warned; both reported above. The file is
committed and unmodified in the working tree.

---

## 2. Question count

**Total questions enumerated: 29.** This matches the count referenced in #91.
All 29 are `type: fill-blanks`.

---

## 3–5. Recompute table (sorted NONE-first)

Operands identified independently from the **prompt** text: `a` (dividend) =
`max(numbers in prompt)`, `b` (divisor) = `min(numbers in prompt)`. Each prompt
contains exactly two integers. As a cross-check, prompt-derived operands were
compared to the operands stated in each question's `explain` line
(`a ÷ b = q remainder r`): **they agree for all 29 questions** (no disagreements).

Candidates: `QUOTIENT = a // b`, `REMAINDER = a % b`, `QUOTIENT_PLUS = (a//b) + (1 if a%b>0 else 0)`.

**No row matches NONE.** The NONE group — which would be the finding — is empty.
Every stored key matches at least the REMAINDER candidate.

| # | id | a | b | key | QUOTIENT | REMAINDER | QUOTIENT_PLUS | key matches |
|---|----|---|---|-----|----------|-----------|---------------|-------------|
| 1 | qdsstjm5x | 83 | 5 | 3 | 16 | 3 | 17 | REMAINDER |
| 2 | qp4u9d7tx | 95 | 7 | 4 | 13 | 4 | 14 | REMAINDER |
| 3 | qebysdusy | 71 | 8 | 7 | 8 | 7 | 9 | REMAINDER |
| 4 | qw3vv7rah | 99 | 6 | 3 | 16 | 3 | 17 | REMAINDER |
| 5 | qhxw9drpb | 40 | 7 | 5 | 5 | 5 | 6 | QUOTIENT+REMAINDER |
| 6 | q877j9nhc | 73 | 7 | 3 | 10 | 3 | 11 | REMAINDER |
| 7 | q4vh6njzy | 59 | 3 | 2 | 19 | 2 | 20 | REMAINDER |
| 8 | q3twi4gtg | 64 | 5 | 4 | 12 | 4 | 13 | REMAINDER |
| 9 | q6uqmsuib | 42 | 8 | 2 | 5 | 2 | 6 | REMAINDER |
| 10 | q9yp3qucq | 92 | 7 | 1 | 13 | 1 | 14 | REMAINDER |
| 11 | qpi2bq8u4 | 31 | 6 | 1 | 5 | 1 | 6 | REMAINDER |
| 12 | q43az8myv | 67 | 5 | 2 | 13 | 2 | 14 | REMAINDER |
| 13 | qectdw5ef | 36 | 7 | 1 | 5 | 1 | 6 | REMAINDER |
| 14 | qpzrahjtg | 79 | 2 | 1 | 39 | 1 | 40 | REMAINDER |
| 15 | quhjhn9s2 | 33 | 7 | 5 | 4 | 5 | 5 | REMAINDER+QUOTIENT_PLUS |
| 16 | qix6jkchx | 19 | 5 | 4 | 3 | 4 | 4 | REMAINDER+QUOTIENT_PLUS |
| 17 | q6hxxe5gv | 30 | 9 | 3 | 3 | 3 | 4 | QUOTIENT+REMAINDER |
| 18 | qkrnerb6u | 56 | 6 | 2 | 9 | 2 | 10 | REMAINDER |
| 19 | qhsef57p2 | 40 | 9 | 4 | 4 | 4 | 5 | QUOTIENT+REMAINDER |
| 20 | qshtq6ydj | 47 | 4 | 3 | 11 | 3 | 12 | REMAINDER |
| 21 | qzmyzmkv7 | 507 | 8 | 3 | 63 | 3 | 64 | REMAINDER |
| 22 | q8hbtbnnp | 116 | 3 | 2 | 38 | 2 | 39 | REMAINDER |
| 23 | qie6ztqij | 536 | 9 | 5 | 59 | 5 | 60 | REMAINDER |
| 24 | qiknwb8q7 | 634 | 8 | 2 | 79 | 2 | 80 | REMAINDER |
| 25 | q5y2u5cpu | 955 | 4 | 3 | 238 | 3 | 239 | REMAINDER |
| 26 | qmtuyc7fs | 686 | 5 | 1 | 137 | 1 | 138 | REMAINDER |
| 27 | qymm3u7h9 | 161 | 9 | 8 | 17 | 8 | 18 | REMAINDER |
| 28 | qeeeszu5x | 595 | 6 | 1 | 99 | 1 | 100 | REMAINDER |
| 29 | q77w8xe5n | 218 | 3 | 2 | 72 | 2 | 73 | REMAINDER |

**NONE count: 0. UNPARSED count: 0.**

Notes on multi-match rows (arithmetic coincidences, not ambiguity in the key):
- Row 5 `qhxw9drpb` (40÷7): quotient 5 and remainder 5 are equal, so key `5` matches both.
- Row 15 `quhjhn9s2` (33÷7): remainder 5 and quotient_plus 5 are equal.
- Row 16 `qix6jkchx` (19÷5): remainder 4 and quotient_plus 4 are equal.
- Row 17 `q6hxxe5gv` (30÷9): quotient 3 and remainder 3 are equal.
- Row 19 `qhsef57p2` (40÷9): quotient 4 and remainder 4 are equal.

In all 29 questions the stored key equals the REMAINDER candidate.

---

## 6. The two questions named in Item #91 — explicit report

Both ids exist in the file. Their stored keys equal their REMAINDER.

| id | prompt (verbatim) | a | b | key | QUOTIENT | REMAINDER | QUOTIENT_PLUS | key matches |
|---|---|---|---|---|---|---|---|---|
| **qw3vv7rah** | "99 people need to ride the lift to the top of a skyscraper. The lift can hold 6 people at a time. How many people will be in the lift on the last trip to the top? []" | 99 | 6 | 3 | 16 | 3 | 17 | REMAINDER |
| **qhxw9drpb** | "Lancaster Furniture needs to ship 40 sofas across the country. If they can fit 7 sofas in each truck, how many sofas will be in the partially full truck? []" | 40 | 7 | 5 | 5 | 5 | 6 | QUOTIENT+REMAINDER |

Neither id is in the NONE group. `qw3vv7rah` key = 3 = remainder(99,6). `qhxw9drpb`
key = 5 = remainder(40,7) (also equals quotient, since 40÷7 = 5 r 5).

**Item #91 claims both keys are wrong. By independent recomputation against the file,
both keys equal the remainder of their stated division.** The verdict is Venkat's; this
report presents the computed values beside the stored keys and does not rule.

---

## 7. Unparsed questions

**UNPARSED count: 0.** Every question yielded exactly two integer operands from its
prompt, and every prompt-derived operand pair agreed with the operands stated in the
question's `explain` line.

---

## Method / traceability

- Parser: `/tmp/recompute91.py`, run with `PYTHONIOENCODING=utf-8 python /tmp/recompute91.py`.
- Operands read from the prompt (all integers, commas stripped), independent of the
  stored answer key.
- All three candidates computed with Python integer `//` and `%`.
- Every value in the table above is emitted directly by that script.

STOP. No lesson file, engine, commit, or push was touched.
