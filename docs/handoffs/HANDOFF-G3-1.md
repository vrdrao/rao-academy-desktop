# HANDOFF-G3-1 — Pilot 1 shipped (first Grade 3 milestone)

Date: 2026-07-19 · Grade 3 chat · Engine at rao-master-19 · Playbook: playbook-2

## What this push contains (3 commits)

1. `9cc6bf7` — G3 pilot prep: HOLD register (`docs/G3-HOLD-DUPES.md`),
   pilot 1 faithful extraction (`docs/extractions/G3-PILOT1-EXTRACTION.md`),
   briefs archived (PREP v2 + V3).
2. `8a38c52` — Pilot 1 lesson: `lessons-g3/Division_facts_up_to_10_remix.html`
   (25q = 18 source facts + 7 approved top-ups; md5 3cc1da41e2c5678819a0a772b687a420),
   `LESSONS-MANIFEST-G3.md` (**Totals: 1 lesson, 25 questions.**),
   5 new misconception codes in `docs/MISCONCEPTIONS.md` §6,
   brief archived (CONVERT).
3. The commit carrying this handoff.

## State of the grade

- **Pilot 1: DONE.** Visual sign-off by Venkat 2026-07-19; his minor-change
  list is DEFERRED and pending (will seed the first G3 fix brief; items not
  yet enumerated). QA in-report: 25/25 grade-correct, 25/25 reject-wrong,
  75/75 hint rungs clean, Playwright both viewports incl. one automated drag.
- **Pilots 2–3 next:** "Multiplication word problems", then "Add two numbers
  up to three digits" (scan's closing section). Same crank per pilot:
  extraction → variation plan → Venkat's `y` → conversion brief → his eyes.
- **HOLD register** (`docs/G3-HOLD-DUPES.md`): Sections 1–2 (12 underscore
  files + `Time/_A.M. or P.M_.docx`) EXCLUDED from all batches until
  Venkat's ruling — still pending, unhurried. Section 3: 23 cross-grade
  twins + 20 maybes, enumerated, NOT held.

## Open items, in priority order

1. **ENGINE REQUEST (combined, file with Venkat):** per-grade repo
   restructure (`grades/gN/…`) + grade-aware guards/gates — currently NO
   automated gate scans `lessons-g3/`; pilot 1 was QA'd via path-redirected
   scratch copies of the real tools (disclosed in its report). Runs only
   AFTER this push lands; Grade 3 pauses during that surgery. Secondary
   item inside it: empty-containers mode for the equal-groups figure.
2. **Playbook amendment request (with Venkat):** §6.3 hold-scope
   clarification (intra-grade duplicates held; cross-grade twins registered,
   not held, differentiation mandatory in variation plans) → playbook-3.
3. **Venkat's rulings pending:** underscore-draft files (convert/kill/merge);
   twin handling at scale before overnight batches; his pilot-1 minor-change
   list.
4. **Charter correction queue:** 23 topic folders (not 24); folded into next
   charter touch. G4 manifest's stale reconciliation paragraph is the engine
   chat's item (already flagged to it).

## Standing context for the next session

- Session opening ritual per playbook §9 (playbook → charter → this handoff
  → entry check). G3 recorded totals: **1 lesson / 25 questions**. G4
  fence baseline at this handoff: **118 lessons / 3,075 questions**.
- Template lessons for the grade: pilot 1 sets the pattern — act-structured
  arc, meaning-anchored open, interaction remix (fills/selects/drag),
  figures show the problem never the answer, convention-neutral objects
  (charter amendment: India-first launch, global rollout), explicit
  differentiation note for cross-grade twins, full §5 enrichment.
- Push-gate caveat: the full suite at push time validates the G4 corpus
  only (open item 1). G3 content rides on in-brief QA + Venkat's eyes until
  the guards are grade-aware.
