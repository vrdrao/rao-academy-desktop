# REPORT-MCQ-CONVERT-92-PHASE3

Executed 2026-07-22 per BRIEF-MCQ-CONVERT-92, Phase 3 (write). Assembled from the
results reported inline at execution time — not reconstructed from memory. No commit,
no push at time of writing (committed later on Venkat's explicit go).

Target file (confirmed single path): `lessons/incoming/interpret-remainders.html`.

---

## 1. Guard written FIRST, proved to fail TWICE before trusting it

`tools/verify-mcq-92.js` — a structural guard for the conversion. Asserts, for the lesson:
1. 29 questions, ALL single-select, ZERO fill-blanks.
2. Exactly 4 options each — EXCEPT `qix6jkchx`, the named 3-option exception (19÷5 admits
   only 2 honest distractors; ruled option b). NOT a blanket "≥3" loosening — every other
   question is asserted to have exactly 4.
3. Every correct answer equals the remainder of its division (`a mod b`, a=max prompt
   number, b=min).
4. No duplicate option values.
5. Answer present exactly once among options; no answer/distractor collision.

**Prove-fail #1 — guard vs the still-fill-blanks lesson (before conversion):**
```
✗ verify-mcq-92: 59 violation(s)
  • qdsstjm5x: still type fill-blanks — must be single-select
  • qdsstjm5x: no <ul class="options"> found
  … (×29 questions) …
  • (lesson): named 3-option exception "qix6jkchx" not found
exit=1
```

**Prove-fail #2 — guard vs a deliberately sabotaged COPY of the converted lesson**
(three injected faults: flipped qdsstjm5x answer 3→16; duplicated option 13 in qp4u9d7tx;
gave the 3-option exception a 4th option):
```
✗ verify-mcq-92: 3 violation(s)
  • qdsstjm5x: answer "16" != remainder(83 mod 5) = 3
  • qp4u9d7tx: duplicate option value(s): 13
  • qix6jkchx: named 3-option exception must have exactly 3 options, has 4
exit=1
```
The three substantive assertions (remainder equality, no-duplicates, exception option-count)
each fired on real faults. The sabotaged copy was discarded; the real lesson never touched.

---

## 2. Conversion

All 29 `fill-blanks` → `single-select`. Options in the approved Phase-2 shuffled order
(deterministic salt `r2:`). Lesson-local whyWrong authored on every distractor, each keeping
its `code:` for analytics; `docs/MISCONCEPTIONS.md` untouched (per Venkat's ruling — taxonomy
messages read backwards for a remainder-answer question; see #114). Line endings preserved LF.

Post-conversion counts: `single-select 29 · fill-blanks 0 · options-uls 29 · whyWrong 29 · CR bytes 0`.

The 3-option exception `qix6jkchx` (19÷5, correct 4) rendered with options `[4, 5, 3]` and
2 whyWrong entries — the only 3-option question in the lesson.

**Format note:** the fill-blank placeholder ` []` was removed from each prompt (it is the
blank marker, not prose); the human-readable prompt sentence is unchanged. First clean pass
had a cosmetic blank line before `whyWrong:` and `-->` sharing the last message's line; the
file was reverted and regenerated to match the known-good reference format exactly (`-->` on
its own line, no blank line).

---

## 3. Guard PASS on the real converted lesson
```
✓ verify-mcq-92 — 29 questions, all single-select; 4 options each (qix6jkchx: 3);
  every answer = remainder; no duplicate/colliding options.
exit=0
```

---

## 4. test:fast — PASS
```
NODE GRADING GATE  engine rao-master-22 · 103 lessons · 2668 questions
2637 grade correct · 2637 reject wrong · 31 construct (self-grading, skipped)
NODE GRADING: all keys grade correct and reject wrong — OK to commit
test:fast exit=0
```
Every converted single-select grades correct and rejects wrong. The whyWrong-floor guard
reported the lesson ROSE 0 → 29/29 (ratchet; a rise passes, a human raises the floor in a
brief — done in the follow-up floor-lock step).

---

## 5. Explicit format check (test:fast's verify-format-staged does NOT cover an unstaged file)

`verify-format-staged` printed *"no staged lesson/review pages — format check deferred to
the push gate"* — so the review/app match was proven directly:
```
$ node tools/make-review.js lessons/incoming/interpret-remainders.html
review written -> review/interpret-remainders.html  (self-contained)

$ node tools/verify-format.js interpret-remainders
PASS  interpret-remainders  (29 cards, structure + paint identical)
all 1 match the lesson format
exit=0
```
The review page the app renders matches the converted lesson, card for card.

---

## 6. Diff stat
| file | change |
|---|---|
| `lessons/incoming/interpret-remainders.html` | **+403 / −87** |
| `review/interpret-remainders.html` | regenerated (was tracked) |
| `tools/verify-mcq-92.js` | new, **+160** |

---

## 7. Integrity — ids / prompts / explains preserved
```
IDS IDENTICAL (29)                                   (HEAD vs working, `id:` lines)
EXPLAIN LINES IDENTICAL (29)                         (`<p class="explain">` lines)
PROMPTS IDENTICAL APART FROM REMOVED [] MARKER (29)  (prompt text; only ` []` removed)
```
Only the answer format changed. ids, prompts, and explain lines are byte-identical to HEAD.

---

## 8. Follow-up (done after Phase 3, before commit)
- Line-ending normalization of `engine/preview-engine.js` + `engine/rao.css` (working-copy
  CRLF → LF, restoring them to the already-committed LF blobs; **no content change, not part
  of this commit**), then `review/interpret-remainders.html` regenerated so it is CRLF-free.
- `docs/whywrong-floor.json` regenerated to lock `interpret-remainders` at 29 (0 → 29);
  ratchet proven (removed one whyWrong → guard FAILED "floor 29, saw 28"; restored → PASS).

STOP.
