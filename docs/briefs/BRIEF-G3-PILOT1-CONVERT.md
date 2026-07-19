# BRIEF-G3-PILOT1-CONVERT — Division facts up to 10 → the first Grade 3 lesson

This is the Grade 3 TEMPLATE lesson (playbook §6.4): convert slowly, follow
this brief exactly, disclose everything. Venkat's `y` of 2026-07-19 approved
the 25-question variation plan below, including the +7 thin-lesson top-up
(playbook §5 explicit-ruling clause) and a preference for interactive/visual
treatments.

Read BEFORE touching anything: `GRADE-ROLLOUT-PLAYBOOK.md`,
`GRADE3-CHARTER.md`, `WORD_TO_AUTHORING_INSTRUCTIONS.md`, `CLAUDE.md`
standing rules, `docs/MISCONCEPTIONS.md`, and
`docs/extractions/G3-PILOT1-EXTRACTION.md` (the source of truth for the 18
source facts).

Hard fences: no Grade 4 path is touched (lessons/, review/,
LESSONS-MANIFEST.md, engine/, tools/, hooks). No engine edits of any kind —
if the engine cannot do something this brief asks, use the question's named
FALLBACK; if there is no fallback, STOP-AND-SKIP that question, record it in
Deviations, continue (playbook §7). Never improvise scope.

---

## Part A — Entry check

1. `git status --porcelain` (must be clean except this brief in root) +
   `git rev-parse HEAD` (expected: 9cc6bf7 or its descendant).
2. Engine `__version` (expected rao-master-19; if newer, proceed — forward-
   only — and record).
3. G4 fence baseline: record `LESSONS-MANIFEST.md` totals line verbatim.
4. Confirm `docs/G3-HOLD-DUPES.md` exists; confirm the pilot source
   `sources-g3/Division fluency/Division facts up to 10.docx` is NOT in its
   Sections 1–2.

## Part B — Build the lesson

Create `lessons-g3/` (first Grade 3 lesson). Author
`lessons-g3/Division_facts_up_to_10_remix.html` per
`WORD_TO_AUTHORING_INSTRUCTIONS.md`, on the current engine, containing
EXACTLY the 25 questions of Part C in that order.

Lesson header comment must include: source path; extraction path; the note
"G4 twin: Division facts to 10 (16q, bare fluency consolidation). This G3
lesson is deliberately differentiated: meaning-anchored introduction —
grouping figures, inverse-multiplication forms, identity-pattern discovery,
story contexts. No stem duplicates the G4 bare-drill format where avoidable.";
and "25q = 18 source facts + 7 gap-fill additions approved by Venkat
2026-07-19 (never padded)".

Global authoring rules for this lesson:
- **Answer-leak law (hard):** no figure may depict the quotient anywhere —
  no pre-drawn groups matching the answer, no hop arcs on number lines, no
  base-ten decomposition whose unit count equals the answer. Figures show
  the DIVIDEND objects and EMPTY divisor containers (or a bare labeled
  number line), never a completed grouping.
- Every answer recomputed in Python before authoring; assert quotient ==
  computed value from the extraction for all 18 source facts.
- Story skins use neutral objects (cookies, marbles, stickers, crayons,
  football cards) — no currency, per the charter amendment.
- Full §5 enrichment on ALL 25 questions: 3-rung ladder (orient / method /
  nearly-does-it; rung 3 names a procedure the child performs — e.g.
  "skip-count by 4s up to 12, counting your hops" — and NEVER performs
  arithmetic on the question's numbers, states the answer, or eliminates
  options); `whyWrong` + misconception code on EVERY distractor (new codes
  → add to `docs/MISCONCEPTIONS.md` in this commit); stepped walkthrough
  (goal/working/reason per step, takeaway + verification at the end); one
  `explain` line (respect EXPLAIN PRECEDENCE — never author both forms
  with the same opening text).
- Fallback rule: each non-fill question names a FALLBACK type below. Use it
  only if the primary type genuinely cannot express the question on the
  current engine; every fallback use is a Deviations line.

## Part C — The 25 questions (fixed order; facts and answers are law)

Act 1 — Sharing is division (meaning):
| # | Fact (ans) | Type | Treatment |
|---|---|---|---|
| 1 | 4÷2 (2) | fill-blank | Story: 4 cookies shared between 2 plates. equal-groups figure: 4 cookie icons + 2 EMPTY plates. |
| 2 | 10÷5 (2) | single-select | 10 marbles into 5 bags. icons figure: 10 marbles + 5 EMPTY bags. Distractors 5 (divisor-copied), 15 (added), 50 (multiplied). FALLBACK fill-blank. |
| 3 | 12÷4 (3) | fill-blank | 12 stickers into 4 party bags. equal-groups figure: 12 stickers + 4 EMPTY bags. |
| 4 | 14÷7 (2) | fill-blank | "How many hops of 7 reach 14?" number-line figure 0–14, ticks at 0/7/14, NO hop arcs. |

Act 2 — Magic patterns (identities and ones):
| 5 | 5÷5 (1) | fill-blank | Bare; explain plants the a÷a pattern. |
| 6 | 8÷8 (1) | single-select | Distractors 0 (a÷a=0 code), 8 (identity confusion), 16. FALLBACK fill-blank. |
| 7 | 9÷9 (1) | fill-blank | Bare; explain confirms the pattern. |
| 8 | NEW: sort 4 cards | categorize bins (DRAG) | Cards 6÷6, 7÷1, 3÷3, 9÷1 → bins "equals 1" / "equals the number itself". FALLBACK multi-select "which equal 1?". |
| 9 | NEW: 7÷1 (7) | single-select | 7 crayons, 1 box. Distractors 1 (÷1=1 confusion), 0, 8. FALLBACK fill-blank. |
| 10 | NEW: 0÷5 (0) | single-select | Distractors 5, 1, 50. whyWrong teaches zero-dividend rule. FALLBACK fill-blank. |

Act 3 — The tens express (bare on purpose — figures would leak):
| 11 | 40÷10 (4) | fill-blank | Bare. |
| 12 | 50÷10 (5) | single-select | Distractors 40 (subtracted), 500 (multiplied), 10. FALLBACK fill-blank. |
| 13 | 70÷10 (7) | fill-blank | Bare; explain names the drop-a-zero pattern AND why it works (7 tens). |

Act 4 — Fact families:
| 14 | NEW: 4×⬚=12 (3) | fill-blank | Inverse form; explain ties back to Q3's party bags. |
| 15 | 48÷6 (8) | single-select | Off-by-one distractors 7, 9, 6. FALLBACK fill-blank. |
| 16 | NEW: 3-7-21 family | multi-select | "Which equations belong to the 3, 7, 21 fact family?" Correct: 3×7=21, 21÷3=7, 21÷7=3. Wrong: 21−7=14 (subtraction-intrusion), 7÷3=21 (reversal). FALLBACK single-select. |
| 17 | 24÷6 (4) | fill-blank | Story: 24 football cards among 6 friends. No figure. |
| 18 | 18÷3 (6) | fill-blank | Bare (speed feel). |
| 19 | 45÷5 (9) | single-select | Distractors 8, 10 (off-by-one), 40 (subtracted). FALLBACK fill-blank. |
| 20 | 36÷4 (9) | fill-blank | Bare. |

Act 5 — Summit climb:
| 21 | 56÷7 (8) | fill-blank | Bare; hints/walkthrough carry the climb framing. |
| 22 | 64÷8 (8) | single-select | Distractors 7, 9, 6. FALLBACK fill-blank. |
| 23 | NEW: order 4 cards | order (DRAG) | "Smallest answer to largest": 8÷8 (1), 6÷2 (3), 30÷5 (6), 90÷9 (10). FALLBACK single-select "which has the largest answer?". |
| 24 | NEW: the "equals 8" club | categorize bins (DRAG) | Cards 56÷7, 64÷8, 72÷9, 48÷8 → bins "equals 8" / "does not". (48÷8=6 is the twist.) FALLBACK multi-select. |
| 25 | 80÷8 (10) | fill-blank | FINALE — biggest quotient in the lesson; walkthrough closes the whole arc. |

Source-fact ledger (never-drop proof): the 18 extraction facts map to
questions 1,2,3,4,5,6,7,11,12,13,15,17,18,19,20,21,22,25 — reproduce this
ledger in the report with each computed answer re-asserted.

## Part D — Manifest and QA

1. Create `LESSONS-MANIFEST-G3.md`: header, one row for this lesson, totals
   line "**Totals: 1 lesson, 25 questions.**" (or the true count if any
   STOP-AND-SKIP fired — the manifest states reality, never the plan).
2. Run the hint-leak guard against every rung of every ladder; any firing →
   reword before commit and list the firing verbatim in the report AND the
   commit message.
3. Node grading check on the new lesson: every key grades correct and
   rejects wrong (show closing output).
4. Playwright, real Chromium, 1280×800 AND 390×844: load the lesson, answer
   q1 correctly and q2 wrongly, screenshot each state; exercise one drag
   question (q8) — if drag QA can't be automated reliably, say so plainly
   (Venkat's browser playthrough is the human gate) rather than faking it.
5. Confirm zero diffs outside: `lessons-g3/`, `LESSONS-MANIFEST-G3.md`,
   `docs/MISCONCEPTIONS.md` (additions only), `docs/briefs/`.

## Part E — Commit (local, no push)

Archive this brief to `docs/briefs/BRIEF-G3-PILOT1-CONVERT.md` (md5-verify,
remove root copy). Stage exactly: the lesson file, the G3 manifest, the
misconception additions (if any), the archived brief. Commit message:
`G3 pilot 1: Division facts up to 10 remix — 25q (18 source + 7 approved top-ups), first lessons-g3 lesson + G3 manifest`
30-minute timeout; never --no-verify. Report hash + `git show --stat` +
gate output + G4 fence proof (totals line unchanged, zero G4 paths).
Final `git status --porcelain` empty.

## Part F — Report

Part A values · source-fact ledger with re-asserted answers · per-question
build table (#, type used, primary-or-fallback, figure y/n, hint-leak
firings) · guard/QA outputs (actual closing lines, screenshots listed) ·
manifest totals line · commit block · Deviations (mandatory; absence is an
audit failure). End with the preview instruction for Venkat's visual
sign-off (playbook §6.5): how to open the lesson in his browser from the
repo, one line.
