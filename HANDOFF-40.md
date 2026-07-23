HANDOFF-40

Written 2026-07-21, ~21:00 IST. Chat-authored. Supersedes HANDOFF-39.

ACCURACY WARNING — READ FIRST. This handoff was written after the authoring container crashed. Nothing in it has been verified against the repo. Every file path, line number and count below came from reports read in the prior chat, not from a fresh directory listing. The receiving chat must measure before trusting any number here. Per the handoff accuracy law, treat every claim as a premise to be checked, not a fact.

1. IMMEDIATE STATE — read this before doing anything

BRIEF-G3-LESSON1-REWRITE.md was invoked and was still running when this chat closed. Its report has not been seen or audited. That is the first thing to handle.

Nothing is committed. Nothing is pushed. The last push was 13:42 at commit 4dbe2cc; the repo was 0 ahead / 0 behind at last check.

Working tree at last known check:

Modified: rao-card.js, rao-card.css, solution-renderer.js, tools/verify-calm.js, tools/verify-touch.js, tools/verify-reset.js, package.json, docs/ISSUES.md
Staged: tools/verify-solpanel.js (staged only — verify-tracked requires it)
Untracked: lessons-g3/multiplication_facts_up_to_10.html, review/multiplication_facts_up_to_10.html, plus pre-existing BRIEF-*.md and HANDOFF-*.md from prior sessions
2. AUDIT THE REWRITE REPORT AGAINST THESE CHECKS

When the report lands, check all nine:

build() returns 30, 0 empty
Self-grade 30/30
Zero whyWrong messages contain their answer as a whole numeric token — and the naive raw-substring count reported and traced. A report giving only the flattering number is incomplete.
Zero hint rungs contain their answer
Zero step / takeaway / verification blocks remain
Zero products in any solution: frontmatter
Shape counts: 11 one-entry table, 2 two-entry table, 4 table with absent, 8 facts, 5 rule = 30
Zero ·, zero bare x as multiplication sign
npm test green with the explicit statement that guards do not scan lessons-g3/ — green means Grade 4 didn't regress, it is NOT validation of this file

Protected fields (file is untracked, so no git diff baseline — must be verified by field extraction): 30 questions, mix 14/6/3/4/3, every id, every data-val, every code:, every explain:, the 25 compliant whyWrong messages, and all 30 hint: blocks unchanged.

3. THE QUEUE, IN ORDER
Audit the rewrite report (§2 above)
Write and run the hint-strip brief (§4 below) — Venkat's ruling, not yet briefed
Regenerate the review page — node tools/make-review.js lessons-g3/multiplication_facts_up_to_10.html
Venkat reviews all 30 questions — this is the approval gate, and he has not yet seen the five shapes rendered
Step-block query for his team example (§6 below)
Lesson 2 — sum and difference (word-problem shape)
Venkat reviews lesson 2
Lesson 3 — pictographs
ID + manifest brief for all three G3 lessons
One commit, one push, end of day — Venkat authorises against an enumerated list
4. RULINGS MADE THIS SESSION — all binding

Made this morning, already shipped in BRIEF-G3-ENGINE-1:

#	Ruling	Notes
1	Hint ladders cut 3 rungs → 1	Ruling 12; now superseded by ruling 8 below
2	Button reads "Show me the solution"	Was "Walk me through it" — read as "hint 3"
3	whyWrong gets own chip "Not quite", does not consume a hint number	Reverses law 5
4	Hint bubbles clear when the solution opens	Reverses law 4
5	Correct answer shows no takeaway panel; cc-hastake still set to seal .explain	Reverses law 7

Made this morning, running now in BRIEF-G3-LESSON1-REWRITE:

#	Ruling	Notes
6	whyWrong names the misconception, never the answer	21 of 46 rewritten in lesson 1
7	Solutions are printed facts, never a method	Five shapes; supersedes the 2026-07-20 "2–3 steps, do not trim" ruling

Made this evening, NOT YET BRIEFED — this is the outstanding work:

#	Ruling	Status
8	Grade 3 default is NO HINT. Hints exist only where Venkat names them individually.	Needs a brief
9	All 30 hint rungs come out of lesson 1 — clean baseline, he adds back what he wants	Needs a brief
10	When a wrong answer needs to teach more, strengthen whyWrong, never reinstate hints. whyWrong explains the child's specific error and stops. If it starts suggesting a method, it has become a hint and violates ruling 8.	Principle only — rewrite explicitly ON HOLD until Venkat asks

Ruling 10 has a history worth preserving: Venkat initially said "let's make it happen" to a rewrite of the messages. I pushed back that he was converting a conditional into a decision before seeing the no-hint path rendered. He agreed and put it on hold. Do not start a whyWrong rewrite unless he asks for it explicitly.

5. THE HINT-STRIP BRIEF — what it must cover

Not yet written. Three parts:

Strip all 30 hint: blocks from lessons-g3/multiplication_facts_up_to_10.html. Protected-field verification that nothing else moved.

Measure the no-hint path — do not assume it. walkOffered() at rao-card.js:169 fires on wrongCount >= 2 || (wrongCount >= 1 && allHintsUsed()). With zero rungs, allHintsUsed() is presumably trivially true, so the solution would be offered after one wrong attempt rather than two. This is unverified. It may be what Venkat wants — no hint to give, so don't make the child guess twice — but it must be measured.

Guard it. With ruling 8, "question with no hint" becomes the default path for the entire grade, not an edge case. It needs a fixture or a future engine change breaks it silently.

Open question for Venkat's review, not to be decided in advance: with hints stripped and no takeaway panel, a child who taps wrong once sees only the whyWrong message and a button. Whether that's enough of a second chance is something he should form a view on while reviewing the 30.

6. UNANSWERED — Venkat still owes rulings on these

Does the no-hint default (ruling 8) bind Grade 4? My recommendation: no, Grade 3 spec only. Grade 4's 2,668 questions are pushed and approved and have hints throughout.

The pedagogy divergence, which has no owner. Grade 3 will have: no hints, whyWrong that withholds the answer, quiet correct answers, printed-fact solutions. Grade 4 has: hints throughout, whyWrong that names the answer, takeaway panels, method-step solutions. Two grades, two pedagogies, one product. Tolerable now; more expensive every lesson Grade 3 adds. This needs a decision, not a drift.

His team example query. He wants to show his team a well-built multi-step solution. The query to run (read-only, lessons/ only, not lessons-g3/):

For each lesson file, count type: step blocks and the number of questions containing 3 or more. Report the top 10 by 3+-step question count. For the top lesson, quote its longest solution: block verbatim with question id and prompt.

Caveat he was given and should be reminded of: the step-by-step format is exactly what he overruled this morning for Grade 3. Grade 4 lessons may contain the same Grade 5/6-level reasoning (the Q1 example used the distributive property to explain 7 × 8). If this goes to his team as "the standard," he may be setting a standard he later reverses. Worth reviewing what comes back before circulating it.

7. WHAT SHIPPED IN BRIEF-G3-ENGINE-1 — audited PASS

Three new solution-renderer.js block types. The engine computes every product; a product in frontmatter is never read.

table — tables: list of 1 or 2 entries, each factor / upTo / mark. Optional note above, footer below, and absent as a LIST of {after: n, value: v} rendering a danger-tinted "v is not here" line between rows. Two tables render side by side.
facts — items: list of [a, b] pairs, optional mark indices, note, footer.
rule — text (the rule in one sentence) plus optional example: [a, b]. The only block type where a 0 operand is legal.

Chip labels: "The times table" / "The facts" / "The rule".

Alignment is load-bearing and now guarded. Every row carries identical horizontal padding; marked rows differ in background and weight only, never position. The absent line is not indented. Font measured: JetBrains Mono, weights 400 and 700 both 87.97px advance width for the test string — identical, so the bold survives without breaking the = column.

Guard re-pointing (§2A of that brief) — the rule established: tuning a guard weaker is forbidden; re-pointing a guard from a repealed law to its replacement is required, and every re-pointed assertion must end stricter. verify-calm.js "g. EXPLAIN REVEAL" went from 5 to 7 conditions. Two sub-assertions beyond the authorised list broke as legitimate consequences and were re-pointed — both inside authorised files, both disclosed. No fourth guard file touched.

Fixture: tools/verify-solpanel.js, 27 assertions proved RED pre-fix, all green post-fix, eight sabotages each turning their assertion red, none failing to discriminate.

takeawayText() is now dead code, left in place to minimise the diff. Ruled: leave it.

8. THE FIVE SHAPES — lesson 1 assignment
Shape	Type	Questions	Count
1	table, one entry	Q1–6, 12, 13, 14, 19, 20	11
2	table, two side by side	Q17, 18	2
3	table with absent	Q24–27	4
4	facts	Q15, 16, 21, 22, 23, 28, 29, 30	8
5	rule	Q7, 8, 9, 10, 11	5

Shape 3 derived parameters:

Q	factor	upTo	mark	absent (after row, value)
24	6	9	3, 5, 8	(6, 40)
25	8	7	3, 4	(3, 30) and (6, 54)
26	7	9	3, 5, 8	(6, 45)
27	9	9	3, 6, 8	(4, 40)

Why Shape 5 exists: Q7 is 9 × 0. No factor × multiplier in 1–12 produces 0, so it cannot be a table. Q8–11 teach the ×1 and ×10 rules — printing the seven times table to reach 1 × 7 teaches nothing about ×1. These five teach a rule, not a fact.

9. PROCESS — what held and what failed this session

Three briefs, three correct stops, all caused by chat-side gaps:

A false premise read off a screenshot (a whyWrong message mistaken for a leaking hint rung)
A block spec that could not represent 9 × 0 — caught by Claude Code before anything hit disk
A brief demanding a green suite while ordering three changes that three existing guards forbade

The lesson, stated plainly for the receiving chat: every one was caused by specifying against a mental model of the repo instead of measuring it first. Front-load a read-only measurement pass before writing any brief. It costs two minutes and has already cost three restarts.

What held: stop conditions caught all three before disk was touched. Guard-first with sabotage round-trips caught every reintroduced defect. Reading the file rather than the screenshot resolved the false premise in one query.

Standing process rules, unchanged: one Claude Code task at a time; clear the input box before every invocation; briefs are file-based and chat-authored, never reconstructed from memory; Claude Code never pushes; Grade 4 is closed and lessons/ is not touched in Grade 3 sessions; if Claude Code asks a question mid-run, paste its exact text to chat rather than answering it directly.

10. FIRST MESSAGE FOR THE NEW CHAT

Read HANDOFF-40. The BRIEF-G3-LESSON1-REWRITE report is [running / here — pasted below]. Audit it against §2.