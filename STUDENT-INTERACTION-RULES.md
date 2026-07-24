# STUDENT INTERACTION RULES

**What this is.** The rules that are always true about how a Rao Academy question
behaves, whatever the question is, whatever the lesson.

**Why it exists.** On 2026-07-23 an engine change was built from a symptom logged
in ISSUES.md ("any new selection dismisses previous feedback") instead of from
the rule behind it ("Try again gives a fresh start"). The fix was half right and
had to be redone. The issue log records **things someone noticed on a screen**.
This file records **rules that are always true.** Anyone writing a brief reads
this first.

**Authority.** Ruled by Venkat. Only Venkat changes these. A brief may not
reinterpret a rule; if a rule seems wrong or incomplete for a case, the brief
stops and asks.

**Status of each rule:** RULED (Venkat has decided) or UNRULED (the engine does
this, but no decision is on record — needs Venkat).

---

## 1. The child gets two attempts. RULED 2026-07-23.

Two attempts is the cap. After the second wrong answer the question locks. No
"Try again" is offered.

What happens at the lock: if the question has an authored walkthrough, it opens
and the outcome records as solved-with-help. If it has none, the answer is
revealed and the outcome records as shown-answer. **Every question routes
somewhere** — none is left in a retry loop.

Why: a child who has just failed twice should not be handed another decision.

**RULED 2026-07-23.** Venkat was asked to reconsider (two vs three vs
hint-dependent) and confirmed two. This is now a decision on record, not an
inherited default.

---

## 1a. After the walkthrough, the child moves on. RULED 2026-07-23.

When the walkthrough ends, the question is over and the next question follows.
The child is **not** given a fresh similar question to prove they learned it.

Venkat was asked to reconsider (move on / fresh similar question / let the child
choose) and confirmed move on.

> **Noted for later, not a rule:** this means the model currently has no moment
> where a child demonstrates they learned from a mistake. The three optional
> workouts per lesson are where re-practice happens instead. If that proves
> insufficient in real use, revisit.

---

## 1b. Hints are available before the first attempt. RULED 2026-07-23.

A child may open a hint at any time, including before they have tried once.

**"Costs nothing" means precisely:** opening a hint does not consume an attempt,
does not change the outcome recorded, and does not prevent the child from
answering. It does NOT mean hint usage goes unrecorded — usage is still logged,
because knowing which questions send children to the hints is exactly what tells
you which lessons need rewriting.

Venkat was asked to reconsider (always available / must try first / costs
something) and confirmed always available.

---

## 2. "Try again" means a fresh start. RULED 2026-07-23.

When the child taps **Try again**, the card returns to exactly the state it was
in when they first arrived at the question.

Gone:
- the "Not quite" chip
- the explanation of why the answer was wrong
- any red mark, tint, or wrong-answer styling
- the typed value in a fill-in-the-blank
- the selected option

Stays:
- **the hint.** If the child opened a hint before their wrong attempt, it is
  still open. They worked for it; they keep it.

This rule is the whole rule. Do not implement a part of it and call it done.

---

## 3. Stale feedback also clears on a new selection. RULED 2026-07-23.

If the child does not tap Try again but simply taps a different option, the
previous wrong-answer explanation disappears too.

This is **in addition to** rule 2, not instead of it. Both triggers exist.

---

## 4. Hints persist; answer-specific feedback does not. RULED — amended 2026-07-23.

Every hint the child opens stays available until the question ends. The card
never takes back help the child asked for.

Answer-specific feedback is different: only one is shown at a time, and it
belongs to the response that produced it. When the child abandons that response
— by tapping Try again, or by choosing differently — the feedback goes with it.

**One exception, RULED 2026-07-23: a wrong-answer message disappears on Try
again. A hint does not.**

The distinction, and it is the whole reasoning:

- A **hint** is help the child earned by asking for it. It is theirs. It stays.
- A **wrong-answer message** is a verdict on an attempt the child has just
  abandoned. When they tap Try again they are asking for a clean slate, and the
  verdict on a discarded attempt is not help — it is clutter.

The old rule read "every bubble stays visible after a reset." That is now too
broad and is superseded by the above. Do not restore it.

Second sanctioned exception: opening the solution clears the accumulated bubbles
so the solution panel stands alone.

Rule 2 is not a violation of this rule — a fresh start is a reset the child asked
for, not the card silently withdrawing help.

---

## 5. Wrong is a whisper. RULED — legacy decision, date not recorded.

A wrong answer gets a small red mark on what the child picked. In fill-in-the-
blanks the blank tints softly red.

Never: a red flood, a shake, a buzzer, a scolding word. The tone is "not that
one, try again", never "you failed".

The question itself — the prompt and the options — **never** dims, fades, greys
out, or changes colour. Only the card's chrome quiets. The task the child is
working on stays exactly as legible as it was.

---

## 6. No answer reveal while the child can still try. RULED — legacy decision, date not recorded.

> **AMENDED 2026-07-23 — one exception, multi-select only. See rule 18.** On a
> wrong multi-select attempt, correct picks the child made turn green while an
> attempt remains. This is a deliberate carve-out, made with the leak understood.
> **It does not extend to any other question type.**

No green, no highlight, no "the answer is…" while another attempt is possible.

The reveal happens once: at the end of the walkthrough, or on a correct answer,
or at the two-attempt lock.

---

## 7. Getting it wrong does not cost a hint. RULED — legacy decision, date not recorded.

Hints and wrong-answer explanations are two separate streams.

A wrong-answer message carries the chip "Not quite" and **does not consume a hint
number**. After it, the next hint the child asks for is still Hint 1.

Why: two adults on this project misread a wrong-answer message as a hint on
consecutive days. A child would misread it every time.

---

## 8. Correct is loud, and there is nothing to read. RULED — legacy decision, date not recorded.

A correct answer gets the green option, the celebration, and the chime.

No takeaway panel, no paragraph of explanation. Nothing to read by default. A
"Show me the solution" option sits beside "Next question" for the child who wants
it — taking it does **not** change the outcome. They still got it right.

---

## 9. The question never rebuilds itself mid-question. RULED — legacy decision, date not recorded.

Panels are added, hidden, or cleared. The question itself is never torn down and
re-rendered while the child is working on it.

Rule 2's fresh start is a **restore from the first-attempt snapshot**, not a
rebuild.

---

## 10. A child is never marked wrong for a right answer written differently. RULED 2026-07-23.

If the child's answer is mathematically correct, it is correct.

Established so far:
- **Commas.** `42613` and `42,613` are the same answer. Both Western grouping
  (`1,000,000`) and **Indian lakh grouping** (`1,00,000`) are accepted. Children
  in India are taught lakh grouping in school and must never be penalised for it.
  RULED 2026-07-23.
- **Order of addition.** A question asking for thirty-one plus sixteen accepts
  `16+31=47`. RULED 2026-07-23, addition only — the corpus currently contains no
  multiplication questions of this type. If any are authored, revisit.
- **Subtraction and division are NOT commutative.** `4-9` is not `9-4`. These
  stay wrong.

This rule is open-ended by design. Any new way a child can be right must be
accepted. When a new case appears, add it here.

---

## 11. The answer box fits the answer. RULED — legacy decision, date not recorded.

An input is wide enough for the full answer, at every screen size a child uses.

If an answer does not fit, **the box gets wider. The text never gets smaller.**
Shrinking text to solve a container problem makes it harder for a nine-year-old
to read. RULED.

Note: a result can be wider than either number that made it — `3000 + 7000` is
four digits plus four digits, and the answer is five.

---

## 12. Feedback must describe what the child actually did. RULED — legacy decision, date not recorded.

A wrong-answer message must match the mistake it is responding to. A child who
picked the big share must not be told they picked the leftover.

Never state how far the answer was from correct — no "you were close", no "off by
two". RULED.

---

## 13. One answer explanation at a time. RULED 2026-07-23.

A child should never have to choose what to read. Every state shows **at most one
explanation of the answer.**

This rule governs *answer explanations only.* It does NOT remove: the "Not quite"
status chip, the red mark or tint, or any hint the child has opened. Those are
different things and they stay.

**THE EXPLAIN LINE IS REMOVED FROM THE PRODUCT. RULED 2026-07-23.**

The `explain` line is the one-line answer statement ("6 × 9 = 54") that appears
when a question ends. Venkat ruled it removed outright — not made conditional.

Reasons:
- It duplicated. By the time it appeared, the green highlight had already shown
  the answer and (where authored) the whyWrong had already taught the mistake.
- It contradicted rule 6. After a *first* wrong answer on a question with no
  whyWrong, the explain revealed the answer while the child still had an attempt
  in hand. Since 84 of 103 lessons have no whyWrong, that was most of the
  product.
- It was a third message type to author, maintain and keep consistent with the
  other two.

**What each state shows now:**

- **First wrong answer, whyWrong exists** → the red mark and the whyWrong.
- **First wrong answer, no whyWrong** → the red mark alone. Nothing else. The
  child knows they were wrong, still has an attempt, and the hint button is
  there if they want help. **The answer is NOT revealed** — rule 6 holds.
- **Second wrong answer, solution exists** → the solution, alone. Clear the
  whyWrong; the walkthrough teaches the same lesson better and competing with it
  splits the child's attention.
- **Second wrong answer, no solution** → the whyWrong if authored, else the
  answer revealed at the lock (which is correct — the child has no attempts left,
  so rule 6 no longer applies).

Why any of this: a nine-year-old who has just failed twice was looking at a green
answer they did not pick, a red mark on one they did, a "Not quite" note, an
explain line and an encouragement line. Five things at the worst moment. One
explanation, clearly placed, teaches more than five competing ones.

> **Check before building:** the engine already clears accumulated bubbles when
> the walkthrough opens (rule 4's existing exception). Part of this may already
> hold. Measure before changing anything.

> **Deliberately unchanged:** the first-wrong state keeps its whyWrong where one
> exists. That is the moment the child is still trying and feedback genuinely
> helps. Do not quieten it without a fresh ruling.

---

## 14. Ordering and sorting mark the misplaced tiles. RULED 2026-07-23.

When a child gets an ordering or sorting question wrong, the card marks **which
tiles are out of place** — not just that the answer as a whole is wrong.

Worked example. The question asks smallest to largest:
`3,204 · 3,024 · 3,240 · 3,402`

The child produces: `3,024 · 3,204 · 3,402 · 3,240`

The first two are right. The last two are swapped — a specific misunderstanding
about which of 3,402 and 3,240 is larger. **The two misplaced tiles get a red
edge. The two correct ones do not.**

Rejected alternatives, and why:
- **Mark nothing (current behaviour).** The child sees four numbers and "not
  right", with no way to tell whether they made one mistake or four. The likely
  response is reshuffling at random, which teaches nothing.
- **Mark the count only** ("two are out of place"). Keeps more challenge but
  still leaves the child guessing at which.

The consistency argument decides it: on a multiple-choice question the child gets
a ✕ on the exact option they chose wrongly. Ordering gave them nothing. Same
child, same product, far worse feedback for no reason.

**Do not reveal the correct order.** Marking which tiles are misplaced is not the
same as showing where they go — rule 6 still holds while an attempt remains.

---

## 15. A question left mid-way is discarded. RULED 2026-07-23.

Lessons are adaptive; questions are served by algorithm, not fixed in advance.
So a question is not a thing to be preserved — the child's **progress** is.

If a child leaves mid-question — closes the app, walks away — that question is
**discarded entirely.** It does not count as attempted, even if they had already
answered wrong once. Any spent attempt goes with it.

When they return, progress up to that point is intact, and the algorithm serves
whatever comes next: possibly the same question, possibly another of similar
difficulty. Its choice.

Why discard rather than resume: a child who left mid-question was not ready.
Handing them a half-spent question a day later punishes them for stopping, and
the attempt count would be meaningless anyway — they will not remember what they
tried.

## 16. A whyWrong exists only where the wrong answer is a known option. RULED 2026-07-23.

> **DORMANT as of 2026-07-24, not repealed** (BRIEF-WHYWRONG-OFF-1): the
> whyWrong feature is suppressed product-wide — no child sees any whyWrong
> message in any mode (`WHYWRONG_VISIBLE = false` in `engine/rao-card.js`).
> Authored content stays in the lesson files, and the analytics stream still
> fires. This rule governs the content if the feature is ever re-enabled,
> which requires a new dated ruling.

**Where a whyWrong is required:** question types with a fixed, authored set of
wrong answers — **single-select and multi-select.** The author knows in advance
exactly what a child can pick, so the message can name what that child actually
did.

**Where a whyWrong is NOT authored:** fill-in-the-blank, ordering,
sequence-build, categorize — any type where the child produces something the
author did not enumerate. **The hint carries the teaching load instead.**

Why not write a generic one anyway ("children often miss a carry")? Because a
child who transposed two digits would be told they missed a carry. That is not
feedback, it is a guess in the shape of feedback. A child who reads two or three
messages that do not describe what they did will stop reading them — which
damages the messages that *are* accurate. Silence is more honest than a
confident wrong guess.

**The known consequence, accepted:** in a lesson that is mostly fill-in-the-blank,
a child who answers wrong sees the red mark and no explanation, twice, then the
answer. The hint is available but only if they open it. This is a deliberate
trade. **Revisit if real usage shows children stalling on fill-in questions** —
that would be the signal that something more is needed there.

**This is a second, stronger argument for preferring multiple-choice at Grade 4.**
The first was that nine-year-olds should not do a lot of typing (ruled during the
#92 conversion). The second is this: a fixed set of wrong answers is a set you can
teach into. An open text box is not.

---

## 17. How a whyWrong is written. RULED 2026-07-23.

> **DORMANT as of 2026-07-24, not repealed** (BRIEF-WHYWRONG-OFF-1): the
> whyWrong feature is suppressed product-wide; no child sees these messages.
> This rule governs the content if the feature is ever re-enabled, which
> requires a new dated ruling.

**Name what the child did, plainly.** Not what to check, not what to reconsider.

Worked example, from `add_5digit_word_problems` (`37,409 + 51,286 = 88,695`):

| Child picked | Message |
|---|---|
| 87,695 (1,000 short) | "Looks like you forgot to carry into the thousands column." |
| 88,685 (10 short) | "Looks like you forgot to carry into the tens column." |
| 89,695 (1,000 over) | "Looks like you carried into the thousands, but nothing needed carrying there." |

Rejected phrasing: *"Check the thousands column — there's a carry coming in from
the hundreds."* Venkat: too indirect. Tell the child what happened, do not send
them looking.

Constraints, from existing rules:
- **Never state the answer** (rule 6, and ISSUES #68). If tapping a wrong option
  reveals the right one, guessing becomes cheaper than thinking.
- **Never state distance from the answer** — no "you were close", no "off by
  ten" (rule 12).
- **Must match what the child actually did** (rule 12). ISSUES #114 is the
  cautionary case: division messages assumed the answer was the quotient, so on
  remainder questions every message told the child the opposite of what they
  picked.

> **Still open — the voice.** "Looks like you forgot…" is gentle and slightly
> hedged. "You forgot to carry into the thousands column" is firmer and flatter.
> Venkat has not ruled between them, and this sets the voice for every whyWrong
> in the corpus.

> **Still open — multiple missed carries.** When a distractor is short by, say,
> 10,010, the child missed two carries. Name both columns, or say something
> simpler like "looks like you missed a couple of carries"? Unruled.

---

## 18. Multi-select shows green on correct picks. RULED 2026-07-23.

After a wrong multi-select attempt, **every option the child ticked stays
visible as their pick.** The correct ones get a **green tick**; the incorrect
one gets the red ✕.

Worked example. "Tap all the even numbers": 2, 3, 4, 6. The child ticks 2 and 3.
After Check: **2 shows green, 3 shows the red ✕.** Options 4 and 6 — never
picked — stay unmarked.

**SCOPE: MULTI-SELECT ONLY. RULED 2026-07-23.**
Single-select is **unchanged**: a child who picks wrong sees only their own ✕,
and nothing turns green until the question is over. Extending green to
single-select would end the second attempt outright — the child would simply tap
the green option — making the two-attempt cap decorative. **A brief-writer must
not generalise this rule to other question types.**

---

### This is an AMENDMENT to rule 6, made deliberately

Rule 6 says: no answer reveal while the child can still try. **This ruling carves
out an exception for multi-select.** It was not a styling decision and must not be
recorded as one.

**The case against, put to Venkat and overruled:**
- A green tick on 2 plus a ✕ on 3 resolves two of four options with an attempt
  still in hand — on a four-option question, most of the puzzle.
- It offers a strategy: tick one option, press Check, read the marks, adjust.
  The child can walk out the answer without doing the arithmetic. Rule 6 exists
  to prevent exactly this.

**Venkat's ruling, and the reasoning:** the screen was incomplete and confusing —
one option marked wrong and the rest blank reads as though the child's other
picks did not register. Legibility for a nine-year-old outweighs the leak. The ✕
already narrows the field substantially, so the added information is marginal in
practice.

**Two earlier positions this supersedes, both from 2026-07-23:**
- the neutral soft-highlight shipped by BRIEF-INTERACTION-CONFORM-1 item 2
  (commit `15dc637`) — it cleared the checkbox, so a box the child had ticked
  appeared unticked;
- an intermediate ruling that the ticks stay but nothing turns green.

**Still governed by rule 2:** all of this clears on Try again.

> **Watch this one.** If real usage shows children solving multi-select by
> elimination — tick, Check, read, adjust — rather than by reasoning, this
> exception is the cause. Revisit before concluding the questions are too easy.

---

## 19. Wrong gets an instant playful pill and a gentle shake. RULED by Venkat 2026-07-24.

**(BRIEF-NOTQUITE-1. This REVERSES the old law-3 clause "no shake, no 'Not
quite' pill in adaptive mode" — a deliberate ruling, not drift.)**

On a wrong first attempt in calm mode, the child gets an explicit, **instant**
signal — a pill under the question plus **one gentle shake of the card**.
Reason: young children did not register that they were wrong from the quiet
feedback alone (✕ marks + a hint arriving). The signal must be instant,
visible, and land where the child is already looking.

- **The pill points to the hint** ("…the hint below") — the promise is kept by
  the auto-typed hint that follows.
- **The joke lands on the QUESTION, never on the child** ("Ooh, tricky one!" —
  never "you got it wrong").
- **Second attempt gets no joke.** With a walkthrough coming, the plain
  doorway line "Let's work it out together"; with no walkthrough, **no pill at
  all** — the shown-answer panel carries its own line, and a pill would
  contradict it.
- If no hint will follow (ladder exhausted, or none authored), the pool's
  "below" promise would be false — the plain fallback line shows instead.
- **The pools are grade-keyed FIXED ENGINE LINES** (`NOTQUITE_POOLS` in
  `engine/rao-card.js`), rotated with no immediate repeat — **never
  per-question content**. Only the Grade 4 pool exists today; a new grade adds
  a key, nothing else. No runtime grade signal exists yet, so the engine
  defaults to the "4" pool.
- **Rule 12 applies to every line**: no "close", no "almost", no "nearly" —
  linted by `tools/verify-notquite.js`.
- The shake is one short animation (~380ms), respects
  `prefers-reduced-motion`, and never repeats until the next wrong Check.
- **Still governed by rule 2:** the pill clears on Try again and on any new
  selection.

---

## Open questions for Venkat

1. **"Here's the answer — you've got this!" after failing twice.** (ISSUES #89.)
   This encouragement line shows on the lock screen *after* the child got it
   wrong twice. "You've got this" reads as praise for succeeding and misdescribes
   what happened. With the explain line now removed (rule 13) it is one of the
   few things left on that screen, so it carries more weight than it used to.
   Keep it, reword it, or drop it?
2. **Multi-select gives no instruction on a wrong answer.** (ISSUES #87.) A child
   who picks some but not all of the correct options is told they are wrong, with
   nothing saying "select every correct one". Rule 13 permits this — an
   instruction is not an answer explanation — but nobody has ruled whether it
   should appear.
3. **How much of a solution table to show.** (ISSUES #83, parked.) Whether a
   solution panel shows the full table or a window of rows around the answer.
   Rule 13's reasoning — one thing to read at the worst moment — bears on it, but
   it was parked before that rule existed.
4. **When exactly is `solved-with-help` recorded, and what does it mean?**
   Two parts, both undefined today:
   - **Timing.** Is it recorded when the walkthrough *opens*, when the child
     reaches its *final step*, or when the question *moves on*? A child who opens
     the walkthrough and immediately taps away has not been taught anything.
   - **Meaning.** It records the *route the child took*, not that the skill was
     learned. Nothing downstream — an adaptive engine, a parent report, a mastery
     score — should treat reaching the end of a walkthrough as evidence the child
     can now do it alone. Worth writing down before anything is built on top of
     it.
5. **Asking for the solution burns the second attempt.** After one wrong answer
   plus hints, a child may tap "Show me the solution." Doing so locks the
   question — they lose the attempt they still had. The engine does this; nobody
   ruled it. A child may tap it without realising what it costs.
6. **Number display.** The engine shows Western grouping (`1,000,000`) to Indian
   children everywhere. Rule 10 means they may now *type* either form, but they
   still *see* Western. Whether Rao Academy should display Indian grouping is an
   open product decision.

---

## Known implementation divergences — last verified 2026-07-23

**These are defects, not rules.** They are listed here — rather than only in
ISSUES.md — because each one is recorded against the rule it breaks. ISSUES.md
records what someone saw on a screen; this section records which rule that
sighting violated, which is the link that was missing when the Try-again fix went
wrong. Full symptoms and fix status stay in ISSUES.md.

Found by the Interaction Atlas.

- **A right answer painted red.** A child typing `42,613`, `1,00,000`, or
  `16+31=47` is graded **correct** — celebration, "Next question" — but the input
  box is painted **red as if wrong**. The grader was taught these forms on
  2026-07-23; the painter was not. Affects ~121 fill-blanks plus every typed
  expression. Violates rules 10 and 12.
- **Multi-select loses the tick on a right pick.** A child picks one right and
  one wrong; the wrong gets a ✕, but the right one loses its tick and becomes
  indistinguishable from options never chosen. The child cannot tell what they
  picked. Violates rule 12.
- **Try again does not clear the wrong-answer message.** Fix written and parked
  in `BRIEF-RETRY-STATE-3`. Violates rule 2.

---

## How to use this file

**Writing a brief:** read this first. If the brief contradicts a rule, the brief
is wrong. If a rule does not cover the case, stop and ask Venkat — do not infer.

**Logging an issue:** record what was seen on screen. Then check this file. If
the issue reveals a rule that is not written here, **add the rule** — that is
how this file stays useful.

**Changing a rule:** only Venkat. Date it, and leave the old rule visible with a
note, so nobody restores it later from a stale memory.
