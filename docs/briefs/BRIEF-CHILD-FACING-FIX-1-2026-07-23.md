# BRIEF-CHILD-FACING-FIX-1

**Authority:** `STUDENT-INTERACTION-RULES.md` (18 rules). **Read it in full before
starting.** This brief is written FROM the rules file, not from the issue rows.
Where an issue row and a rule disagree, the rule wins and you STOP and report.

**What this brief is.** Six items, all of which change what a child sees. Four are
already ruled by Venkat and need building. Two are engine behaviour on the
wrong-answer screen. They share one review cycle because they touch nearby code.

**Ordering rule for this brief: MEASURE, REPORT, THEN CHANGE.** Three items below
carry a stop-gate. Do not pass a stop-gate on your own judgement.

---

## HARD CONSTRAINTS

1. **Do not commit. Do not push.** All work stays local for Venkat's review.
2. **SCOPE FENCE: Grade 4 only.** `lessons-g3/` is never read or touched.
3. **Do NOT modify `docs/MISCONCEPTIONS.md`.** It is unaudited (ISSUES #114) and
   Venkat has ruled the structural fix into a separate later brief. This brief
   writes lesson-local text only.
4. **Guard-first, always.** Every engine change in §5 and §6 requires a fixture
   that is **seen FAILING before the fix and PASSING after.** A guard that has
   never failed is not trusted. If a guard passes on first run, assume the guard
   is wrong, not the code, and report it.
5. **When a change alters how an answer is JUDGED or PAINTED, ask what else needs
   to know.** ISSUES #119 happened because the grader learned commas and the
   painter did not. Before finishing §5 or §6, state explicitly which other code
   reads the same state.
6. **One source of truth.** Do not add a second copy of any comparison or
   normalisation logic. Call the existing one.

---

## §1 — #107: A QUESTION THAT CANNOT BE ANSWERED. **RULED: DROP IT.**

Question `qhhmpihb4`. The prompt reads *"A digit is missing. Tap every digit that
makes this statement true."* **There is no statement on the card** — no
expression, no inequality, nothing containing a gap. Options are 3/4/5/6 and the
key is 5, 6. Whatever comparison was meant to render is absent.

Every existing guard passes it: the options render, the grading gate accepts 5
and 6 and rejects the others. It is internally consistent and completely
unanswerable. **Venkat has ruled it dropped** — not repaired, not regenerated.

- Locate `qhhmpihb4` by id. Report the file and its position in the lesson.
- Remove the question.
- Report the lesson's question count before and after.
- Do NOT author a replacement. Do NOT renumber question ids.

**Chase the number.** The corpus total drops by one. State the new total. If any
manifest, census or floor file records a per-lesson count, it must be updated in
the same pass — list every file you changed and why.

---

## §2 — #113: A QUESTION THAT TESTS NOTHING. **RULED: DROP IT.**

Question `q8gwp2qc7`. The prompt reads *"Round each number, then drag them
smallest → largest: 76 (to 10), 149 (to 10), 705 (to 100)"* — but the tiles
already carry 80, 150, 700: already rounded, already in ascending order. **The
correct answer is to move nothing.** The child passes by not touching the screen.

**STOP-GATE 2a — CONFIRM THE PATH FIRST.** The issue row records this question in
`lessons/incoming/rounding_remix.html`. **Do not assume it is still there.**
Report: which file currently contains `q8gwp2qc7`; whether that path is under
`lessons/` or `lessons/incoming/`; and whether `lessons/incoming/` is inside the
scope that `npm test` and the lesson counts cover. **Report and CONTINUE** — but
if the file is NOT found, or is found in more than one place, HALT and report.

- Remove the question.
- Report the lesson's question count before and after, and the new corpus total.
- Venkat has ruled: **no replacement question is to be generated.**

**Also record, do not build:** Venkat's validity rule for this question type —
*a round-then-order question is honest only if sorting the RAW values gives a
DIFFERENT order than sorting the ROUNDED values*, and *tiles must never be
presented already in the answer order.* This is mechanically checkable and is a
candidate guard. **Do not build the guard in this brief.** State in your report
whether any other round-then-order question exists in the corpus — a count only,
no changes.

---

## §3 — #103: A PROMPT THAT HANDS OVER THE ANSWER. **RULED: DELETE ONE SENTENCE.**

Question `qscbcghnr`. Current prompt:

> "Tap every number that is less than 20,000. Be careful: 20,000 itself is not
> less than 20,000."

**Delete the second sentence.** The prompt becomes: *"Tap every number that is
less than 20,000."*

Why this one is different from the other prompt trims (#95/#99/#101/#104), which
removed noise: **this removes the assessment itself.** 20,000 sits in the options
specifically to test whether the child understands strict inequality. The warning
hands that over, so the distractor catches nobody and the question tests reading
the warning rather than understanding "less than".

- Change the prompt text only. Options, key and question id unchanged.
- Report the prompt before and after, verbatim.

**Then, in the same pass:** this question is a multi-select, so under rule 16 it
**requires** a whyWrong. Write one for the 20,000 option, in the voice ruled in
§7 below. It must teach that a number is not less than itself — at the moment the
child taps it — and must **not** state the correct answer (rule 6, ISSUES #68) and
must **not** state distance from the answer (rule 12). Report the text you wrote.
If any other option lacks a whyWrong, report which — do not author them here.

---

## §4 — #114: DIVISION FEEDBACK THAT SAYS THE OPPOSITE OF WHAT HAPPENED.

**RULED BY VENKAT 2026-07-23: lesson-local text now; the shared list is fixed in
a separate later brief with a full audit.** This is Route A. Follow it exactly.

The defect: in `interpret-remainders`, a child who taps the **quotient** — the
most common real mistake — is shown `REMAINDER_AS_ANSWER`: *"This is the little
bit left over, not the answer — the question wants the big share."* The child
picked the big share. The message says they picked the leftover. Backwards, for
the single most common wrong answer in the lesson.

The root cause is structural: the shared list has no representation of what the
question **asks**. The same number is a wrong answer in a remainder question and
the correct answer in a quotient question. **That is NOT fixed here.**

**STOP-GATE 4a — MEASURE THE BLAST RADIUS FIRST. HALT AND REPORT.**

Before writing any text, report:
1. Which lessons in `lessons/` contain questions whose whyWrong uses the division
   misconception codes (`REMAINDER_AS_ANSWER` and any sibling division codes).
   Name every lesson and count the questions in each.
2. For each, whether the question asks for the **remainder**, the **quotient**, or
   something else (e.g. "how many trips altogether" = quotient + 1).
3. How many of those messages are **factually inverted** for the question they sit
   on — i.e. the message describes the opposite of what the child picked.

**HALT there and report to Venkat before writing a single message.** The ruling
covers `interpret-remainders`; if the inversion reaches other lessons, Venkat
decides whether Route A extends to them.

**After Venkat's go-ahead only:** write lesson-local whyWrong text that names what
the child actually did (rule 12, rule 17, §7 voice). Keep the existing `code:`
field on each question untouched — it carries analytics and the later structural
brief will read it. Do not delete codes, do not add new ones, do not edit
`docs/MISCONCEPTIONS.md`.

---

## §5 — RULE 18: MULTI-SELECT SHOWS GREEN ON CORRECT PICKS. **RULED, NOT BUILT.**

Rule 18 is ruled. Commit `15dc637` shipped a **superseded** version: correct picks
get a neutral highlight, not green. Not a regression, but it does not match the
rule.

**Required behaviour, from rule 18 verbatim:** after a wrong multi-select attempt,
**every option the child ticked stays visible as their pick.** The correct ones
get a **green tick**; the incorrect one gets the red ✕.

Worked example — *"Tap all the even numbers"*: options 2, 3, 4, 6; the child ticks
2 and 3. After Check: **2 shows green, 3 shows the red ✕.** Options 4 and 6 —
never picked — stay **unmarked**.

**SCOPE: MULTI-SELECT ONLY.** Single-select is unchanged — a child who picks wrong
sees only their own ✕ and nothing turns green until the question is over.
Extending green to single-select would end the second attempt outright (the child
taps the green option), making the two-attempt cap decorative. **Do not
generalise this rule to any other question type.** If you find yourself writing a
condition that could catch another type, stop and report.

**Still governed by rule 2:** all of this clears on Try again.

Guard: prove a multi-select wrong attempt marks ticked-correct green and
ticked-wrong red, leaves unpicked options unmarked, and that a **single-select**
wrong attempt shows NO green (sabotage case — this assertion must be present).
Prove it failing first.

---

## §6 — CATEGORIZE MARKS THE MISPLACED TILES. **RULED BY VENKAT 2026-07-23.**

Rule 14 currently covers `order` and `sequence-build`: a wrong answer marks
**which tiles are out of place**, not merely that the whole answer is wrong.
Categorize ("sort into groups") still marks only the whole answer.

**Venkat has ruled rule 14 extended to categorize.** Same reasoning as the
original ruling: a child who sorts four numbers into two boxes and is told only
"not right" cannot tell whether they made one mistake or four, and will reshuffle
at random, which teaches nothing.

Required: each tile placed in the **wrong bin** gets the same soft red edge that
`order` and `sequence-build` misplaced tiles get (`.tile-wrong` in `rao.css`).
Tiles in the **correct** bin are untouched.

**Constraints, all binding:**
- **Display-only.** Nothing moves. No tile relocates, no bin re-labels.
- **Nothing turns green.** The correct grouping is **NOT revealed** — rule 6 holds
  while an attempt remains.
- **Identity, not position.** ISSUES #76 records an unverified suspicion that
  categorize grading may compare tray **position** rather than tile **identity**,
  which would mark correct answers wrong if tiles shuffle. **Verify which it is
  before building.** If it is positional, HALT and report — that is a correctness
  defect that must be ruled on, not quietly fixed inside a marking change.
- Clears on Try again (rule 2).

Guard: a wrong categorize attempt marks exactly the mis-binned tiles, leaves
correctly-binned tiles clean, and reveals nothing. Sabotage assertion: the correct
grouping must not be discoverable from the marks. Prove failing first.

---

## §7 — THE VOICE OF A whyWrong. **RULED BY VENKAT 2026-07-23.**

Any whyWrong text written in this brief uses the **gentle, hedged** form:

> **"Looks like you forgot to carry into the thousands column."**

Not *"You forgot to carry into the thousands column."* (firmer, rejected).
Not *"Check the thousands column — there's a carry coming in from the hundreds."*
(indirect, rejected — it sends the child looking instead of telling them what
happened).

**Name what the child did, plainly.** Binding constraints:
- **Never state the answer** (rule 6, ISSUES #68).
- **Never state distance from the answer** — no "you were close", no "off by ten"
  (rule 12).
- **Must match what the child actually did** (rule 12). #114 is the cautionary
  case.

---

## §8 — REPORTING

Report per section, in order, stating for each: what you measured, what you
changed, and which guard proved it. Include:

- corpus question count **before and after** (two questions are removed)
- every file changed, with a one-line reason
- every guard added, and confirmation it was **seen failing first**
- the three stop-gate reports (§2a path, §4a blast radius, §6 identity-vs-position)

**Do not commit. Do not push.** Do not propose follow-up work in the report —
findings and completions only. If anything is ambiguous, STOP and ask. A wrong
guess that looks confident is worse than a delay.
