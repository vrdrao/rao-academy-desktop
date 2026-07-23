# REPORT-MCQ-CONVERT-92-PHASE2

Executed 2026-07-22 per BRIEF-MCQ-CONVERT-92, Phase 2 (all 29). Read-only on the
lesson file — **nothing was written to `lessons/incoming/interpret-remainders.html`**.
No engine change, no edit to `docs/MISCONCEPTIONS.md`, no commit, no push.
Options generated for all 29; report only. Phase 3 (writing the file) awaits
Venkat's approval of this report.

Per Venkat's ruling (2026-07-22): **whyWrong messages are lesson-local, hand-authored
for this lesson only.** Each carries the `code:` for analytics; the taxonomy's own
`message` text is NOT used (it is written for quotient-answer questions and reads
backwards here — see PHASE1 report §3). `docs/MISCONCEPTIONS.md` is untouched.

**Authoring rule enforced (mechanically):** a message names *what the wrong number is
in the story*; it never states the number's arithmetic distance from the correct
answer. A lint (see §5) rejects "one more than / one less / off by / plus one …" and
confirms every non-NEAR_MISS message names its own value. Lint = **PASS** for all.

---

## 1. Headline findings (read these first)

1. **28 of 29 questions convert to 4 options; one — qix6jkchx (19 ÷ 5, correct = 4) —
   is the single 3-option question.** Its numbers admit only **2** honest distractors
   ({3, 5}); every other source collides. **RULED by Venkat 2026-07-22: option (b) —
   keep 3 options for this question only; do NOT change its numbers.** Converting the
   format is in scope; rewriting a question's content is not. Three honest distractors
   beat four with one invented. The Phase-3 guard must therefore allow this one question
   to have 3 options (all others exactly 4). See §2.

2. **Phase-1 option *contents* reproduced exactly; option *order* changed by a
   deliberate, spec-required reshuffle.** The unsalted shuffle used in PHASE1 put the
   correct answer in position 2 on **11** questions — over the brief's "no position >10"
   rule. I applied a fixed shuffle salt `"r2:"` (the most balanced of the candidates
   searched) which brings the distribution to {0:7, 1:7, 2:7, 3:8}, max 8. This changes
   the *display order* of the three PHASE1 questions but **not their option set, codes,
   or messages**. This is NOT the non-determinism the brief's STOP guards against —
   determinism is proven (identical md5 across repeated runs). Flagging it for
   acknowledgement; the reshuffle was forced by the brief's own position rule.

   | id | PHASE1 order (unsalted) | PHASE2 order (salt `r2:`) | option set identical? |
   |---|---|---|---|
   | qdsstjm5x | 17 / 5 / **3** / 16 | 16 / 17 / 5 / **3** | yes {3,5,16,17} |
   | quhjhn9s2 | 4 / **5** / 6 / 7 | 4 / **5** / 7 / 6 | yes {4,5,6,7} |
   | q77w8xe5n | **2** / 72 / 73 / 3 | 72 / 73 / 3 / **2** | yes {2,3,72,73} |

3. **Correct-answer position distribution (all 29):** `{0: 7, 1: 7, 2: 7, 3: 8}` —
   max 8, within the ≤10 rule. (qix6jkchx has 3 options, so contributes to positions
   0–2 only.)

4. **All-three-distractors-larger-than-correct: 23 of the 28 four-option questions.**
   This is inherent to remainder questions — a remainder is always smaller than the
   divisor, which is ≤ the quotient — so the two quotient-family distractors and the
   divisor are all ≥ the answer. The only thing that breaks the pattern is when a
   `remainder±1` distractor gets pulled in (the 5 collision cases: #3, #5, #15, #17,
   #19) plus the UNRESOLVED #16. **Position shuffling hides the *positional* tell, but
   the *magnitude* tell (correct answer is the smallest number on screen) survives in
   23/28.** There is no smaller-than-remainder value available to use as a distractor
   except `remainder−1`, which is frequently 0 or collides. Reporting as a finding, per
   the brief; a fuller mitigation (if wanted) would be a design decision for Venkat.

5. **Collisions occurred on 6 questions** (the source was skipped and the next valid
   source used):

   | id | division | collided source(s) | substitute used |
   |---|---|---|---|
   | qebysdusy | 71÷8 | divisor=8 (=quotient), remainder+1=8 | remainder−1 = 6 |
   | qhxw9drpb | 40÷7 | quotient=5 (=correct), remainder+1=6 | remainder−1 = 4 |
   | qpi2bq8u4 | 31÷6 | divisor=6 (=quotient+1) | remainder+1 = 2 |
   | quhjhn9s2 | 33÷7 | quotient+1=5 (=correct) | remainder+1 = 6 |
   | q6hxxe5gv | 30÷9 | quotient=3 (=correct), remainder+1=4 | remainder−1 = 2 |
   | qhsef57p2 | 40÷9 | quotient=4 (=correct), remainder+1=5 | remainder−1 = 3 |
   | qix6jkchx | 19÷5 | quotient+1=4 (=correct), remainder+1=5 (=divisor), remainder−1=3 (=quotient) | **none left — UNRESOLVED** |

6. **All 29 correct answers equal the remainder of their division** (re-asserted here;
   the generator hard-asserts `key == a mod b` and would STOP otherwise). Consistent
   with BRIEF-RECOMPUTE-91.

---

## 2. The single 3-option question — RULED (option b)

> **Ruling (Venkat, 2026-07-22):** qix6jkchx keeps **3 options**. Numbers are NOT
> changed. It is the one 3-option question in the lesson; all other 28 have exactly 4.
> The Phase-3 guard encodes this as an explicit, named exception (not a blanket
> "≥3 options" loosening — every other question is asserted to have exactly 4).

Detail of why 4 was impossible (for the record):

**qix6jkchx — "At a funfair, a group of 19 people wants to ride the rollercoaster.
If each car on the rollercoaster holds 5 people, how many people will be in the
partially full car?"**  →  19 ÷ 5 = 3 r **4**. Correct = 4.

The brief's five distractor sources all collapse onto just two distinct valid values:

| source | value | status |
|---|---|---|
| quotient | 3 | valid |
| quotient+1 | 4 | **= correct (4)** → invalid |
| divisor | 5 | valid |
| remainder+1 | 5 | **= divisor (5)** → invalid |
| remainder−1 | 3 | **= quotient (3)** → invalid |

Only **{3, 5}** survive. A 4-option question is impossible from the brief's sources
alone, and per the ruling the numbers stay. The two honest distractors are:

| pos | value | role | code | whyWrong |
|---|---|---|---|---|
| 0 | **4** | **CORRECT** | — | — |
| 1 | 5 | divisor | DIVISOR_AS_ANSWER | "5 is how many people a full car holds — that's a full car, not the partly full one." |
| 2 | 3 | quotient | REMAINDER_AS_ANSWER | "3 is how many cars are completely full — the question asks how many people are in the partly full car." |

This is the lesson's only 3-option question.

---

## 3. Position distribution & magnitude findings

- Correct-answer position across all 29: **{0: 7, 1: 7, 2: 7, 3: 8}** (salt `r2:`). Max 8 ≤ 10. ✓
- All-3-distractors-larger-than-correct: **23 of 28** four-option questions (the 5 with a
  `remainder±1` distractor are the exceptions; #16 is UNRESOLVED). Inherent to the topic;
  see finding #4 above.

---

## 4. Determinism

The generator is a pure function of the file + fixed salt. Running it three times
produced byte-identical output (`md5sum` identical on repeated runs). Phase 3 will use
the same code, so the written options will match this report exactly.

---

## 5. Lint (proof the authoring rule held)

A mechanical check over every chosen distractor asserts: (a) a message exists; (b) every
non-NEAR_MISS message contains its own numeric value as a token; (c) no message matches
any banned arithmetic-distance phrase (`one more than`, `one less`, `off by`, `plus one`,
`minus one`, `one too many/few`, `add/subtract one`, `just above/below`, `one bigger/smaller`,
`nearly the`, …). Result: **PASS** for all 29. NEAR_MISS messages ("That's close — check
the leftover once more.") deliberately carry no value and no distance, per your correction.

---

## 6. Summary table (all 29, options in final shuffled order)


| # | id | a | b | correct | option values (in order) | correct pos | all distractors larger |
|---|----|---|---|---------|--------------------------|-------------|------------------------|
| 1 | qdsstjm5x | 83 | 5 | 3 | 16 / 17 / 5 / **3** | 3 | yes |
| 2 | qp4u9d7tx | 95 | 7 | 4 | 7 / **4** / 14 / 13 | 1 | yes |
| 3 | qebysdusy | 71 | 8 | 7 | 9 / 8 / **7** / 6 | 2 | no |
| 4 | qw3vv7rah | 99 | 6 | 3 | 6 / 17 / 16 / **3** | 3 | yes |
| 5 | qhxw9drpb | 40 | 7 | 5 | 6 / 4 / **5** / 7 | 2 | no |
| 6 | q877j9nhc | 73 | 7 | 3 | 7 / 11 / **3** / 10 | 2 | yes |
| 7 | q4vh6njzy | 59 | 3 | 2 | 19 / 20 / 3 / **2** | 3 | yes |
| 8 | q3twi4gtg | 64 | 5 | 4 | 12 / **4** / 5 / 13 | 1 | yes |
| 9 | q6uqmsuib | 42 | 8 | 2 | 6 / 8 / **2** / 5 | 2 | yes |
| 10 | q9yp3qucq | 92 | 7 | 1 | 14 / 13 / 7 / **1** | 3 | yes |
| 11 | qpi2bq8u4 | 31 | 6 | 1 | **1** / 6 / 2 / 5 | 0 | yes |
| 12 | q43az8myv | 67 | 5 | 2 | 14 / 5 / 13 / **2** | 3 | yes |
| 13 | qectdw5ef | 36 | 7 | 1 | **1** / 5 / 7 / 6 | 0 | yes |
| 14 | qpzrahjtg | 79 | 2 | 1 | 39 / **1** / 40 / 2 | 1 | yes |
| 15 | quhjhn9s2 | 33 | 7 | 5 | 4 / **5** / 7 / 6 | 1 | no |
| 16 | qix6jkchx | 19 | 5 | 4 | **4** / 5 / 3 | 0 | n/a (2 distractors) |
| 17 | q6hxxe5gv | 30 | 9 | 3 | **3** / 4 / 2 / 9 | 0 | no |
| 18 | qkrnerb6u | 56 | 6 | 2 | 6 / 9 / **2** / 10 | 2 | yes |
| 19 | qhsef57p2 | 40 | 9 | 4 | **4** / 5 / 3 / 9 | 0 | no |
| 20 | qshtq6ydj | 47 | 4 | 3 | 4 / 12 / 11 / **3** | 3 | yes |
| 21 | qzmyzmkv7 | 507 | 8 | 3 | 8 / **3** / 64 / 63 | 1 | yes |
| 22 | q8hbtbnnp | 116 | 3 | 2 | 3 / **2** / 38 / 39 | 1 | yes |
| 23 | qie6ztqij | 536 | 9 | 5 | **5** / 60 / 59 / 9 | 0 | yes |
| 24 | qiknwb8q7 | 634 | 8 | 2 | 79 / 80 / **2** / 8 | 2 | yes |
| 25 | q5y2u5cpu | 955 | 4 | 3 | 238 / 239 / **3** / 4 | 2 | yes |
| 26 | qmtuyc7fs | 686 | 5 | 1 | 5 / **1** / 138 / 137 | 1 | yes |
| 27 | qymm3u7h9 | 161 | 9 | 8 | 18 / 9 / 17 / **8** | 3 | yes |
| 28 | qeeeszu5x | 595 | 6 | 1 | **1** / 6 / 100 / 99 | 0 | yes |
| 29 | q77w8xe5n | 218 | 3 | 2 | 72 / 73 / 3 / **2** | 3 | yes |

---

## 7. Per-question detail (values · sources · codes · lesson-local whyWrong)

### 1. qdsstjm5x  —  83 ÷ 5
_Prompt:_ There are 83 chairs set up in the gym for an assembly. After the assembly, all the chairs will be put away on racks that hold 5 chairs. How many chairs will be on the final rack? []

quotient=16 · remainder=**3** (correct) · quotient+1=17 · divisor=5

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 16 | quotient | REMAINDER_AS_ANSWER | 16 is how many racks are completely filled — the question asks how many chairs are on the last one. |
| 1 | 17 | quotient+1 | QUOTIENT_OFF_BY_ONE | 17 is the total number of racks, counting the part-full one — the question asks for the chairs on that last rack, not the number of racks. |
| 2 | 5 | divisor | DIVISOR_AS_ANSWER | 5 is how many chairs a full rack holds — that's a full rack, not the last one. |
| 3 | **3** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**

### 2. qp4u9d7tx  —  95 ÷ 7
_Prompt:_ 95 miners need to ride the lift to the bottom of the mine. The lift can hold 7 miners at a time. How many miners will be in the lift on its last trip? []

quotient=13 · remainder=**4** (correct) · quotient+1=14 · divisor=7

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 7 | divisor | DIVISOR_AS_ANSWER | 7 is how many miners a full lift holds — that's a full trip, not the last one. |
| 1 | **4** | **CORRECT** | — | — |
| 2 | 14 | quotient+1 | QUOTIENT_OFF_BY_ONE | 14 is the total number of trips, counting the last part-full one — the question asks how many miners are on that trip, not the number of trips. |
| 3 | 13 | quotient | REMAINDER_AS_ANSWER | 13 is how many full trips the lift makes — the question asks how many miners ride on the last trip. |

- correct at position **1** · all distractors larger? **yes**

### 3. qebysdusy  —  71 ÷ 8
_Prompt:_ Miss Hurst has 71 gold stickers. She wants to give the same number of stickers to each of her 8 students. If she gives away as many stickers as she can, how many stickers will be left over? []

quotient=8 · remainder=**7** (correct) · quotient+1=9 · divisor=8

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 9 | quotient+1 | QUOTIENT_OFF_BY_ONE | 9 is more stickers than each student can actually get — the question asks how many are left over after sharing. |
| 1 | 8 | quotient | REMAINDER_AS_ANSWER | 8 is how many stickers each student gets — the question asks how many are left over after sharing. |
| 2 | **7** | **CORRECT** | — | — |
| 3 | 6 | remainder−1 | NEAR_MISS | That's close — check the leftover once more. |

- correct at position **2** · all distractors larger? **no** · collisions: divisor=8 (collision); remainder_plus_one=8 (collision)

### 4. qw3vv7rah  —  99 ÷ 6
_Prompt:_ 99 people need to ride the lift to the top of a skyscraper. The lift can hold 6 people at a time. How many people will be in the lift on the last trip to the top? []

quotient=16 · remainder=**3** (correct) · quotient+1=17 · divisor=6

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 6 | divisor | DIVISOR_AS_ANSWER | 6 is how many people a full lift holds — that's a full trip, not the last one. |
| 1 | 17 | quotient+1 | QUOTIENT_OFF_BY_ONE | 17 is the total number of trips, counting the last part-full one — the question asks how many people are on that trip, not the number of trips. |
| 2 | 16 | quotient | REMAINDER_AS_ANSWER | 16 is how many full trips the lift makes — the question asks how many people ride on the last trip. |
| 3 | **3** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**

### 5. qhxw9drpb  —  40 ÷ 7
_Prompt:_ Lancaster Furniture needs to ship 40 sofas across the country. If they can fit 7 sofas in each truck, how many sofas will be in the partially full truck? []

quotient=5 · remainder=**5** (correct) · quotient+1=6 · divisor=7

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 6 | quotient+1 | QUOTIENT_OFF_BY_ONE | 6 is the total number of trucks, counting the part-full one — the question asks how many sofas are in that truck, not the number of trucks. |
| 1 | 4 | remainder−1 | NEAR_MISS | That's close — count the sofas in the part-full truck again. |
| 2 | **5** | **CORRECT** | — | — |
| 3 | 7 | divisor | DIVISOR_AS_ANSWER | 7 is how many sofas a full truck holds — that's a full truck, not the part-full one. |

- correct at position **2** · all distractors larger? **no** · collisions: quotient=5 (collision); remainder_plus_one=6 (collision)

### 6. q877j9nhc  —  73 ÷ 7
_Prompt:_ A real estate agent has ₹73 to spend on newspaper ads. Each ad costs ₹7. After buying as many ads as she can afford, how much money will the real estate agent have left over? []

quotient=10 · remainder=**3** (correct) · quotient+1=11 · divisor=7

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 7 | divisor | DIVISOR_AS_ANSWER | 7 is the cost of one ad — the question asks how much money is left after buying as many as she can. |
| 1 | 11 | quotient+1 | QUOTIENT_OFF_BY_ONE | 11 is more ads than ₹73 can pay for — the question asks how much money is left over, not how many ads. |
| 2 | **3** | **CORRECT** | — | — |
| 3 | 10 | quotient | REMAINDER_AS_ANSWER | 10 is how many ads she can buy — the question asks how much money is left over. |

- correct at position **2** · all distractors larger? **yes**

### 7. q4vh6njzy  —  59 ÷ 3
_Prompt:_ At the fair, Vivian has 59 ride tickets. Each ride on the Ferris wheel costs 3 tickets. After riding the Ferris wheel as many times as possible, how many tickets will Vivian have left? []

quotient=19 · remainder=**2** (correct) · quotient+1=20 · divisor=3

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 19 | quotient | REMAINDER_AS_ANSWER | 19 is how many rides Vivian can go on — the question asks how many tickets she has left. |
| 1 | 20 | quotient+1 | QUOTIENT_OFF_BY_ONE | 20 is more rides than Vivian's tickets can pay for — the question asks how many tickets are left, not how many rides. |
| 2 | 3 | divisor | DIVISOR_AS_ANSWER | 3 is how many tickets one ride costs — the question asks how many tickets are left over. |
| 3 | **2** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**

### 8. q3twi4gtg  —  64 ÷ 5
_Prompt:_ At the fair, Marcus has 64 ride tickets. Each ride on the Ferris wheel costs 5 tickets. After riding the Ferris wheel as many times as possible, how many tickets will Marcus have left? []

quotient=12 · remainder=**4** (correct) · quotient+1=13 · divisor=5

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 12 | quotient | REMAINDER_AS_ANSWER | 12 is how many rides Marcus can go on — the question asks how many tickets he has left. |
| 1 | **4** | **CORRECT** | — | — |
| 2 | 5 | divisor | DIVISOR_AS_ANSWER | 5 is how many tickets one ride costs — the question asks how many tickets are left over. |
| 3 | 13 | quotient+1 | QUOTIENT_OFF_BY_ONE | 13 is more rides than Marcus's tickets can pay for — the question asks how many tickets are left, not how many rides. |

- correct at position **1** · all distractors larger? **yes**

### 9. q6uqmsuib  —  42 ÷ 8
_Prompt:_ A bakery received a shipment of 42 peaches. If it takes 8 peaches to bake a peach pie, how many peaches will the bakery have left over after baking as many pies as possible? []

quotient=5 · remainder=**2** (correct) · quotient+1=6 · divisor=8

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 6 | quotient+1 | QUOTIENT_OFF_BY_ONE | 6 is more pies than the peaches can fill — the question asks how many peaches are left over, not how many pies. |
| 1 | 8 | divisor | DIVISOR_AS_ANSWER | 8 is how many peaches one pie needs — that's a full pie's worth, not the leftovers. |
| 2 | **2** | **CORRECT** | — | — |
| 3 | 5 | quotient | REMAINDER_AS_ANSWER | 5 is how many pies the bakery can make — the question asks how many peaches are left over. |

- correct at position **2** · all distractors larger? **yes**

### 10. q9yp3qucq  —  92 ÷ 7
_Prompt:_ A boy at a funfair has 92 ride tickets. Each ride on the rollercoaster costs 7 tickets. After riding the rollercoaster as many times as he can, how many tickets will the boy have left? []

quotient=13 · remainder=**1** (correct) · quotient+1=14 · divisor=7

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 14 | quotient+1 | QUOTIENT_OFF_BY_ONE | 14 is more rides than the boy's tickets can pay for — the question asks how many tickets are left, not how many rides. |
| 1 | 13 | quotient | REMAINDER_AS_ANSWER | 13 is how many rides the boy can go on — the question asks how many tickets he has left. |
| 2 | 7 | divisor | DIVISOR_AS_ANSWER | 7 is how many tickets one ride costs — the question asks how many tickets are left over. |
| 3 | **1** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**

### 11. qpi2bq8u4  —  31 ÷ 6
_Prompt:_ There are 31 skiers in queue to ride the chair lift. If each chair seats 6 people, how many skiers will be on the last chair? []

quotient=5 · remainder=**1** (correct) · quotient+1=6 · divisor=6

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | **1** | **CORRECT** | — | — |
| 1 | 6 | quotient+1 | QUOTIENT_OFF_BY_ONE | 6 is how many skiers a full chair holds — the question asks how many are on the last chair, which isn't full. |
| 2 | 2 | remainder+1 | NEAR_MISS | That's close — count the skiers on the last chair again. |
| 3 | 5 | quotient | REMAINDER_AS_ANSWER | 5 is how many chairs are completely full — the question asks how many skiers are on the last one. |

- correct at position **0** · all distractors larger? **yes** · collisions: divisor=6 (collision)

### 12. q43az8myv  —  67 ÷ 5
_Prompt:_ A group of 67 people is going on a boat tour. If each boat holds 5 people, how many people will be on the last boat? []

quotient=13 · remainder=**2** (correct) · quotient+1=14 · divisor=5

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 14 | quotient+1 | QUOTIENT_OFF_BY_ONE | 14 is the total number of boats, counting the last part-full one — the question asks how many people are on that boat, not the number of boats. |
| 1 | 5 | divisor | DIVISOR_AS_ANSWER | 5 is how many people a full boat holds — that's a full boat, not the last one. |
| 2 | 13 | quotient | REMAINDER_AS_ANSWER | 13 is how many boats are completely full — the question asks how many people are on the last one. |
| 3 | **2** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**

### 13. qectdw5ef  —  36 ÷ 7
_Prompt:_ There are 36 people in queue to ride the bumper cars. 7 people can go in each round. How many people will ride in the last round? []

quotient=5 · remainder=**1** (correct) · quotient+1=6 · divisor=7

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | **1** | **CORRECT** | — | — |
| 1 | 5 | quotient | REMAINDER_AS_ANSWER | 5 is how many rounds are completely full — the question asks how many people ride in the last round. |
| 2 | 7 | divisor | DIVISOR_AS_ANSWER | 7 is how many people ride in a full round — that's a full round, not the last one. |
| 3 | 6 | quotient+1 | QUOTIENT_OFF_BY_ONE | 6 is the total number of rounds, counting the last part-full one — the question asks how many people are in that round, not the number of rounds. |

- correct at position **0** · all distractors larger? **yes**

### 14. qpzrahjtg  —  79 ÷ 2
_Prompt:_ A car dealership needs to transport 79 cars to an island. The ferry can hold 2 cars. How many cars will the ferry take on its last trip? []

quotient=39 · remainder=**1** (correct) · quotient+1=40 · divisor=2

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 39 | quotient | REMAINDER_AS_ANSWER | 39 is how many full trips the ferry makes — the question asks how many cars are on the last trip. |
| 1 | **1** | **CORRECT** | — | — |
| 2 | 40 | quotient+1 | QUOTIENT_OFF_BY_ONE | 40 is the total number of trips, counting the last part-full one — the question asks how many cars are on that trip, not the number of trips. |
| 3 | 2 | divisor | DIVISOR_AS_ANSWER | 2 is how many cars a full ferry holds — that's a full trip, not the last one. |

- correct at position **1** · all distractors larger? **yes**

### 15. quhjhn9s2  —  33 ÷ 7
_Prompt:_ A farmer wants to plant 33 tomato plants. If he puts 7 plants in each full row, how many tomato plants will be in the partially filled row? []

quotient=4 · remainder=**5** (correct) · quotient+1=5 · divisor=7

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 4 | quotient | REMAINDER_AS_ANSWER | 4 is how many rows are completely full — the question asks how many plants are in the partly filled row. |
| 1 | **5** | **CORRECT** | — | — |
| 2 | 7 | divisor | DIVISOR_AS_ANSWER | 7 is how many plants a full row holds — that's a full row, not the partly filled one. |
| 3 | 6 | remainder+1 | NEAR_MISS | That's close — count the plants in the partly filled row again. |

- correct at position **1** · all distractors larger? **no** · collisions: quotient_plus_one=5 (collision)

### 16. qix6jkchx  —  19 ÷ 5
_Prompt:_ At a funfair, a group of 19 people wants to ride the rollercoaster. If each car on the rollercoaster holds 5 people, how many people will be in the partially full car? []

quotient=3 · remainder=**4** (correct) · quotient+1=4 · divisor=5

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | **4** | **CORRECT** | — | — |
| 1 | 5 | divisor | DIVISOR_AS_ANSWER | 5 is how many people a full car holds — that's a full car, not the partly full one. |
| 2 | 3 | quotient | REMAINDER_AS_ANSWER | 3 is how many cars are completely full — the question asks how many people are in the partly full car. |

- correct at position **0** · all distractors larger? **no** · ⚠️ **UNRESOLVED — only 2 distractors** · collisions: quotient_plus_one=4 (collision); remainder_plus_one=5 (collision); remainder_minus_one=3 (collision)

### 17. q6hxxe5gv  —  30 ÷ 9
_Prompt:_ The school party committee has ₹30 to buy ice cream. Each carton of ice cream costs ₹9. After buying as many cartons of ice cream as they can, how much money will the committee have left over? []

quotient=3 · remainder=**3** (correct) · quotient+1=4 · divisor=9

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | **3** | **CORRECT** | — | — |
| 1 | 4 | quotient+1 | QUOTIENT_OFF_BY_ONE | 4 is more cartons than ₹30 can pay for — the question asks how much money is left over, not how many cartons. |
| 2 | 2 | remainder−1 | NEAR_MISS | That's close — check the leftover once more. |
| 3 | 9 | divisor | DIVISOR_AS_ANSWER | 9 is the cost of one carton — the question asks how much money is left after buying as many as they can. |

- correct at position **0** · all distractors larger? **no** · collisions: quotient=3 (collision); remainder_plus_one=4 (collision)

### 18. qkrnerb6u  —  56 ÷ 6
_Prompt:_ Carrie had 56 plastic cups. She arranged them on trays that can hold 6 cups. How many cups were on the final tray? []

quotient=9 · remainder=**2** (correct) · quotient+1=10 · divisor=6

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 6 | divisor | DIVISOR_AS_ANSWER | 6 is how many cups a full tray holds — that's a full tray, not the final one. |
| 1 | 9 | quotient | REMAINDER_AS_ANSWER | 9 is how many trays are completely full — the question asks how many cups are on the final tray. |
| 2 | **2** | **CORRECT** | — | — |
| 3 | 10 | quotient+1 | QUOTIENT_OFF_BY_ONE | 10 is the total number of trays, counting the final part-full one — the question asks how many cups are on that tray, not the number of trays. |

- correct at position **2** · all distractors larger? **yes**

### 19. qhsef57p2  —  40 ÷ 9
_Prompt:_ Mr. Garrett has 40 rubber stamps. He wants to give the same number of stamps to each of his 9 students. If he gives away as many stamps as he can, how many stamps will be left over? []

quotient=4 · remainder=**4** (correct) · quotient+1=5 · divisor=9

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | **4** | **CORRECT** | — | — |
| 1 | 5 | quotient+1 | QUOTIENT_OFF_BY_ONE | 5 is more stamps than each student can actually get — the question asks how many are left over after sharing. |
| 2 | 3 | remainder−1 | NEAR_MISS | That's close — check the leftover once more. |
| 3 | 9 | divisor | DIVISOR_AS_ANSWER | 9 is how many students are sharing — the question asks how many stamps are left over, not how many students. |

- correct at position **0** · all distractors larger? **no** · collisions: quotient=4 (collision); remainder_plus_one=5 (collision)

### 20. qshtq6ydj  —  47 ÷ 4
_Prompt:_ Garrett's Floral Shop needs to post 47 cheques to the bank. If they can put 4 cheques in each envelope, how many cheques will be in the final envelope? []

quotient=11 · remainder=**3** (correct) · quotient+1=12 · divisor=4

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 4 | divisor | DIVISOR_AS_ANSWER | 4 is how many cheques a full envelope holds — that's a full envelope, not the final one. |
| 1 | 12 | quotient+1 | QUOTIENT_OFF_BY_ONE | 12 is the total number of envelopes, counting the final part-full one — the question asks how many cheques are in that envelope, not the number of envelopes. |
| 2 | 11 | quotient | REMAINDER_AS_ANSWER | 11 is how many envelopes are completely full — the question asks how many cheques are in the final envelope. |
| 3 | **3** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**

### 21. qzmyzmkv7  —  507 ÷ 8
_Prompt:_ There are 507 chairs set up in the gym for an assembly. After the assembly, all the chairs will be put away on racks that hold 8 chairs. How many chairs will be on the final rack? []

quotient=63 · remainder=**3** (correct) · quotient+1=64 · divisor=8

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 8 | divisor | DIVISOR_AS_ANSWER | 8 is how many chairs a full rack holds — that's a full rack, not the last one. |
| 1 | **3** | **CORRECT** | — | — |
| 2 | 64 | quotient+1 | QUOTIENT_OFF_BY_ONE | 64 is the total number of racks, counting the part-full one — the question asks for the chairs on that last rack, not the number of racks. |
| 3 | 63 | quotient | REMAINDER_AS_ANSWER | 63 is how many racks are completely filled — the question asks how many chairs are on the last one. |

- correct at position **1** · all distractors larger? **yes**

### 22. q8hbtbnnp  —  116 ÷ 3
_Prompt:_ A boy at a funfair has 116 ride tickets. Each ride on the rollercoaster costs 3 tickets. After riding the rollercoaster as many times as he can, how many tickets will the boy have left? []

quotient=38 · remainder=**2** (correct) · quotient+1=39 · divisor=3

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 3 | divisor | DIVISOR_AS_ANSWER | 3 is how many tickets one ride costs — the question asks how many tickets are left over. |
| 1 | **2** | **CORRECT** | — | — |
| 2 | 38 | quotient | REMAINDER_AS_ANSWER | 38 is how many rides the boy can go on — the question asks how many tickets he has left. |
| 3 | 39 | quotient+1 | QUOTIENT_OFF_BY_ONE | 39 is more rides than the boy's tickets can pay for — the question asks how many tickets are left, not how many rides. |

- correct at position **1** · all distractors larger? **yes**

### 23. qie6ztqij  —  536 ÷ 9
_Prompt:_ The school party committee has ₹536 to buy ice cream. Each carton of ice cream costs ₹9. After buying as many cartons of ice cream as they can, how much money will the committee have left over? []

quotient=59 · remainder=**5** (correct) · quotient+1=60 · divisor=9

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | **5** | **CORRECT** | — | — |
| 1 | 60 | quotient+1 | QUOTIENT_OFF_BY_ONE | 60 is more cartons than ₹536 can pay for — the question asks how much money is left over, not how many cartons. |
| 2 | 59 | quotient | REMAINDER_AS_ANSWER | 59 is how many cartons they can buy — the question asks how much money is left over. |
| 3 | 9 | divisor | DIVISOR_AS_ANSWER | 9 is the cost of one carton — the question asks how much money is left after buying as many as they can. |

- correct at position **0** · all distractors larger? **yes**

### 24. qiknwb8q7  —  634 ÷ 8
_Prompt:_ Annie had 634 plastic cups. She arranged them on trays that can hold 8 cups. How many cups were on the final tray? []

quotient=79 · remainder=**2** (correct) · quotient+1=80 · divisor=8

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 79 | quotient | REMAINDER_AS_ANSWER | 79 is how many trays are completely full — the question asks how many cups are on the final tray. |
| 1 | 80 | quotient+1 | QUOTIENT_OFF_BY_ONE | 80 is the total number of trays, counting the final part-full one — the question asks how many cups are on that tray, not the number of trays. |
| 2 | **2** | **CORRECT** | — | — |
| 3 | 8 | divisor | DIVISOR_AS_ANSWER | 8 is how many cups a full tray holds — that's a full tray, not the final one. |

- correct at position **2** · all distractors larger? **yes**

### 25. q5y2u5cpu  —  955 ÷ 4
_Prompt:_ A group of 955 people is going on a boat tour. If each boat holds 4 people, how many people will be on the last boat? []

quotient=238 · remainder=**3** (correct) · quotient+1=239 · divisor=4

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 238 | quotient | REMAINDER_AS_ANSWER | 238 is how many boats are completely full — the question asks how many people are on the last one. |
| 1 | 239 | quotient+1 | QUOTIENT_OFF_BY_ONE | 239 is the total number of boats, counting the last part-full one — the question asks how many people are on that boat, not the number of boats. |
| 2 | **3** | **CORRECT** | — | — |
| 3 | 4 | divisor | DIVISOR_AS_ANSWER | 4 is how many people a full boat holds — that's a full boat, not the last one. |

- correct at position **2** · all distractors larger? **yes**

### 26. qmtuyc7fs  —  686 ÷ 5
_Prompt:_ Michael made 686 pieces of peanut brittle to share with his friends. He put 5 pieces of peanut brittle in each tin. How many pieces of peanut brittle did Michael have left over? []

quotient=137 · remainder=**1** (correct) · quotient+1=138 · divisor=5

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 5 | divisor | DIVISOR_AS_ANSWER | 5 is how many pieces one tin holds — that's a full tin, not the leftovers. |
| 1 | **1** | **CORRECT** | — | — |
| 2 | 138 | quotient+1 | QUOTIENT_OFF_BY_ONE | 138 is more tins than the pieces can fill — the question asks how many pieces are left over, not how many tins. |
| 3 | 137 | quotient | REMAINDER_AS_ANSWER | 137 is how many tins Michael fills — the question asks how many pieces are left over. |

- correct at position **1** · all distractors larger? **yes**

### 27. qymm3u7h9  —  161 ÷ 9
_Prompt:_ Mr. McMillan has 161 rubber stamps. He wants to give the same number of stamps to each of his 9 students. If he gives away as many stamps as he can, how many stamps will be left over? []

quotient=17 · remainder=**8** (correct) · quotient+1=18 · divisor=9

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 18 | quotient+1 | QUOTIENT_OFF_BY_ONE | 18 is more stamps than each student can actually get — the question asks how many are left over after sharing. |
| 1 | 9 | divisor | DIVISOR_AS_ANSWER | 9 is how many students are sharing — the question asks how many stamps are left over, not how many students. |
| 2 | 17 | quotient | REMAINDER_AS_ANSWER | 17 is how many stamps each student gets — the question asks how many are left over after sharing. |
| 3 | **8** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**

### 28. qeeeszu5x  —  595 ÷ 6
_Prompt:_ Gina's Floral Shop needs to post 595 cheques to the bank. If they can put 6 cheques in each envelope, how many cheques will be in the final envelope? []

quotient=99 · remainder=**1** (correct) · quotient+1=100 · divisor=6

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | **1** | **CORRECT** | — | — |
| 1 | 6 | divisor | DIVISOR_AS_ANSWER | 6 is how many cheques a full envelope holds — that's a full envelope, not the final one. |
| 2 | 100 | quotient+1 | QUOTIENT_OFF_BY_ONE | 100 is the total number of envelopes, counting the final part-full one — the question asks how many cheques are in that envelope, not the number of envelopes. |
| 3 | 99 | quotient | REMAINDER_AS_ANSWER | 99 is how many envelopes are completely full — the question asks how many cheques are in the final envelope. |

- correct at position **0** · all distractors larger? **yes**

### 29. q77w8xe5n  —  218 ÷ 3
_Prompt:_ At the fair, Lara has 218 ride tickets. Each ride on the Ferris wheel costs 3 tickets. After riding the Ferris wheel as many times as possible, how many tickets will Lara have left? []

quotient=72 · remainder=**2** (correct) · quotient+1=73 · divisor=3

| pos | value | role | code | whyWrong (lesson-local) |
|---|---|---|---|---|
| 0 | 72 | quotient | REMAINDER_AS_ANSWER | 72 is how many rides Lara can go on — the question asks how many tickets she has left. |
| 1 | 73 | quotient+1 | QUOTIENT_OFF_BY_ONE | 73 is more rides than Lara's tickets can pay for — the question asks how many tickets are left, not how many rides. |
| 2 | 3 | divisor | DIVISOR_AS_ANSWER | 3 is how many tickets one ride costs — the question asks how many tickets are left over. |
| 3 | **2** | **CORRECT** | — | — |

- correct at position **3** · all distractors larger? **yes**
---

## STOP

Nothing written to the lesson file. Both open items are now resolved:

1. **qix6jkchx** (§2) — RULED option (b): 3 options, numbers unchanged. It is the
   lesson's single 3-option question; the Phase-3 guard encodes it as a named exception.
2. **Reshuffle** (§1.2) — acknowledged: deterministic salt, option contents unchanged.

**Phase 3 is NOT authorised to run yet.** Venkat requested a read-only directory/harness
recon first (answered in a separate report). On explicit go, Phase 3 writes the guard
(proved to fail first), converts the file, runs the guard + `npm run test:fast`, and
reports the diff — no commit, no push.
