# G3 PILOT 1 — Stage 2 faithful extraction

**Source:** `sources-g3/Division fluency/Division facts up to 10.docx`
**Extracted:** 2026-07-19 by BRIEF-G3-PILOT1-PREP-V3 Part D.
**Method:** document unzipped in system temp; images sequenced by
`word/document.xml` `r:embed` order cross-referenced against
`word/_rels/document.xml.rels` (filesystem order was NOT document order —
e.g. question 1 is `image10.png`); every image flattened onto white and
upscaled 4× (LANCZOS) before reading; every answer computed independently in
Python with a zero-remainder assert per question.

## MISMATCH / UNREADABLE items

**None.** All 18 images were readable. The source document prints NO answers
anywhere (every question is a screenshot of an unanswered interactive item
with an empty input box and a Submit button), so every record below is
SOURCE-ANSWER-UNKNOWN — there is no printed key to match or mismatch against.

## Document-level summary

- **Printed title/topic:** none printed inside the images; topic per filename:
  "Division facts up to 10". No document text at all (0 `<w:t>` runs) — the
  document is 18 embedded screenshots, nothing else.
- **Total questions:** 18 (readable 18, unreadable 0).
- **Question type:** all 18 identical — fill-blank. Each image shows the
  instruction "Divide.", one horizontal division expression with an empty
  input box after "=", and a green "Submit" button. No options anywhere.
- **Difficulty arc:** none. The sequence is unordered fact drill — it opens
  mid-range (12 ÷ 4), mixes identity facts (5 ÷ 5, 9 ÷ 9, 8 ÷ 8), ÷10 facts
  (40, 70, 50 ÷ 10), and larger facts (56 ÷ 7, 64 ÷ 8, 80 ÷ 8) with no
  progression from easy to hard.
- **Monotony pattern:** q1–q18 are the identical computation format with
  different numbers — 100% bare fluency, same prompt word, same layout, zero
  context, zero figures. (This is the monotony the remix pipeline exists to
  fix.)
- **Fact coverage:** divisors used: 2×1, 3×1, 4×2, 5×3, 6×2, 7×2, 8×3, 9×1,
  10×3. Quotients range 1–10. All divisions exact (asserted in Python — no
  remainders). Repeated quotient values: 1 appears 3×, 2 appears 3×,
  8 appears 3×.
- **G4 twin (manifest, read-only):** "Division facts to 10" —
  `lessons/incoming/Division_facts_to_10.html`, **16 questions**. (Recorded
  for the chat's differentiation planning; the G4 lesson was not opened.)

## Per-question inventory

Fields: seq · stem (verbatim) · implied type · options · source's printed
answer · independently computed answer · verdict · figure · image file(s).

| # | Stem (verbatim) | Type | Options | Source ans. | Computed | Verdict | Figure | Image |
|---|---|---|---|---|---|---|---|---|
| 1 | Divide. 12 ÷ 4 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 3 | SOURCE-ANSWER-UNKNOWN | none | image10.png |
| 2 | Divide. 5 ÷ 5 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 1 | SOURCE-ANSWER-UNKNOWN | none | image12.png |
| 3 | Divide. 40 ÷ 10 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 4 | SOURCE-ANSWER-UNKNOWN | none | image14.png |
| 4 | Divide. 9 ÷ 9 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 1 | SOURCE-ANSWER-UNKNOWN | none | image9.png |
| 5 | Divide. 56 ÷ 7 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 8 | SOURCE-ANSWER-UNKNOWN | none | image18.png |
| 6 | Divide. 36 ÷ 4 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 9 | SOURCE-ANSWER-UNKNOWN | none | image4.png |
| 7 | Divide. 4 ÷ 2 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 2 | SOURCE-ANSWER-UNKNOWN | none | image8.png |
| 8 | Divide. 48 ÷ 6 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 8 | SOURCE-ANSWER-UNKNOWN | none | image11.png |
| 9 | Divide. 70 ÷ 10 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 7 | SOURCE-ANSWER-UNKNOWN | none | image1.png |
| 10 | Divide. 45 ÷ 5 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 9 | SOURCE-ANSWER-UNKNOWN | none | image13.png |
| 11 | Divide. 24 ÷ 6 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 4 | SOURCE-ANSWER-UNKNOWN | none | image5.png |
| 12 | Divide. 18 ÷ 3 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 6 | SOURCE-ANSWER-UNKNOWN | none | image17.png |
| 13 | Divide. 8 ÷ 8 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 1 | SOURCE-ANSWER-UNKNOWN | none | image16.png |
| 14 | Divide. 64 ÷ 8 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 8 | SOURCE-ANSWER-UNKNOWN | none | image15.png |
| 15 | Divide. 10 ÷ 5 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 2 | SOURCE-ANSWER-UNKNOWN | none | image3.png |
| 16 | Divide. 50 ÷ 10 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 5 | SOURCE-ANSWER-UNKNOWN | none | image2.png |
| 17 | Divide. 14 ÷ 7 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 2 | SOURCE-ANSWER-UNKNOWN | none | image6.png |
| 18 | Divide. 80 ÷ 8 = ⬚ | fill-blank | — | UNKNOWN (not printed) | 10 | SOURCE-ANSWER-UNKNOWN | none | image7.png |

Notation: "⬚" marks the empty input box in the screenshot. Method-instruction
wording is the single word "Divide." on every question; there is no other
instruction text.

## Observation notes (screenshot artifacts, not questions)

- q6, q11 and q17 show the input box focused (blue border, text cursor) —
  same question type, merely captured mid-focus.
- q17 (`image6.png`) carries a thin blue strip on its left edge — a capture
  artifact of the source app's page background; the question itself is fully
  readable.
- Every screenshot includes the source app's green "Submit" button; it is
  chrome, not content.

## Answer verification tally

- MATCH: 0 · MISMATCH: 0 · SOURCE-ANSWER-UNKNOWN: 18 (document prints no
  answers; all 18 computed independently in Python, all exact divisions).
