# BRIEF-MCQ-CONVERT-92 (as executed)

Chat-authored 2026-07-22. Grade 4 only. Three phases, two STOP gates.
This is the brief as executed, written to file so the chain is file-based per protocol.
Reports: REPORT-MCQ-CONVERT-92-PHASE1.md, -PHASE2.md, -PHASE3.md. Gated on #91
(closed not-a-defect by BRIEF-RECOMPUTE-91 / REPORT-RECOMPUTE-91.md).

## Purpose
Item #92, Venkat's own request: convert all 29 fill-blanks questions in the
interpret-remainders lesson to MCQ. Verbatim: "I want to convert all the questions of
this lesson from fill in the blanks to m c q format" and "in fourth grade i don't want
kids to do a lot of fill in the blanks so let's just make everything mcq in this lesson."

## Scope fence
- Grade 4 only. Do not touch lessons-g3/ or sources-g3/.
- ONE lesson file. No other lesson touched.
- Do NOT modify the engine. Do NOT modify docs/MISCONCEPTIONS.md.
- Never commit / never push until Venkat says.

## File path
Confirmed at `lessons/incoming/interpret-remainders.html` (the brief originally named
`lessons/interpret-remainders.html`, which does not exist — reported, not decided).

## The design (ruled by Venkat 2026-07-22)
All 29 remain remainder questions; only the answer format changes (fill-blank → 4-option
single-select). Four options: 1 correct + 3 distractors. Distractor sources, in priority
order, first 3 valid (a source is invalid if it collides with the correct answer or an
already-taken distractor):
1. QUOTIENT = floor(a/b) — code REMAINDER_AS_ANSWER
2. QUOTIENT_PLUS_ONE = floor(a/b)+1 — code QUOTIENT_OFF_BY_ONE
3. DIVISOR = b — code DIVISOR_AS_ANSWER
4. REMAINDER_PLUS_ONE = (a mod b)+1 — code NEAR_MISS
5. REMAINDER_MINUS_ONE = (a mod b)−1, only if > 0 — code NEAR_MISS

Pattern mitigations: option order shuffled per question (no position holds the correct
answer >10 times); remainder±1 sources exist to break the "smallest is always correct"
tell where divisor would make all three distractors larger than the key.

## Rulings applied during execution
- **whyWrong (Venkat, option 2):** the taxonomy's division messages assume the correct
  answer is the QUOTIENT, so they read backwards on a remainder-answer question (logged
  as #114). Author lesson-local whyWrong text; keep the `code:` field for analytics; do
  NOT modify docs/MISCONCEPTIONS.md.
- **whyWrong voice (Venkat):** name what the wrong number IS in the story; NEVER state its
  arithmetic distance from the correct answer (a message that lets a child derive the
  answer without redoing the work is not teaching). Enforced by a mechanical lint.
- **qix6jkchx 3-option exception (Venkat, option b):** 19÷5 admits only 2 honest
  distractors ({3,5}); keep 3 options, do NOT change the numbers. Converting format is in
  scope; rewriting content is not. The single 3-option question in the lesson.
- **Known limitation accepted (logged #115):** 23/28 four-option questions have all three
  distractors larger than the correct answer — inherent to remainder problems. Question
  rewrites ruled out of scope.

## Phases (all executed; STOP gates honoured)
- **Phase 1** — 3 questions (first/middle/last: qdsstjm5x, quhjhn9s2, q77w8xe5n). Surfaced
  the inverted-message conflict; STOPPED for a ruling. → REPORT-…-PHASE1.md.
- **Phase 2** — all 29 generated (deterministic, salt `r2:`); full table, position
  distribution {0:7,1:7,2:7,3:8}, collisions, the one UNRESOLVED→ruled-3-option question,
  lesson-local whyWrong with a passing lint. STOPPED. → REPORT-…-PHASE2.md.
- **Phase 3** — guard-first (tools/verify-mcq-92.js, sabotage-proved twice), conversion,
  guard PASS, test:fast PASS, explicit verify-format.js PASS, integrity checks (ids /
  prompts / explains byte-identical to HEAD). → REPORT-…-PHASE3.md.

## Anti-laundering / hard rules honoured
- Every distractor traces to a named misconception code and a computed value; nothing
  invented. The one question that could not yield 4 honest distractors was reported
  UNRESOLVED and ruled, not padded.
- Answer key = remainder for all 29 (asserted by the generator and the guard).
- No lesson file written before Phase 3. No engine change. docs/MISCONCEPTIONS.md untouched.

## Follow-ups spawned
- #114 — division misconception codes assume the quotient is the answer (do NOT fix yet;
  belongs to BRIEF-WHYWRONG-CLASSIFY-1 against an unchanged taxonomy).
- #115 — all-distractors-larger limitation on remainder MCQs (read before repeating the
  pattern on any future remainder lesson).
- #111 (amended) — the MCQ conversion made the stale-whyWrong-on-retry engine bug far more
  visible; must be fixed (Batch 2) before converting further lessons.
