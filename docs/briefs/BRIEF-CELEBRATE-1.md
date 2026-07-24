# BRIEF-CELEBRATE-1

Ruled by Venkat 2026-07-24. Chat-authored. Runs ONLY after BRIEF-SHOWN-ANSWER-1
is complete, committed, and the day's four commits are pushed and audited.
This is a MEDIUM brief — do not start it as a filler task.

## THE RULING

Celebrations become grade-keyed and tiered. Venkat's rulings:

1. **Grade 4 base celebration: "pronounced"** (bigger than today's subtle
   sparks; not the full shower).
2. **Streaks: ON.** 3 correct in a row → one level up from the grade's base.
   5 in a row → "grand". A small flourish line accompanies the step-up
   (e.g. "3 in a row!" — exact copy in the profile, per grade).
3. **Lesson complete → grand finale** (the full shower), regardless of streak.
4. Structure mirrors the NOTQUITE pools: ONE grade-keyed profile object at the
   top of the engine file; new grades add a key, never engine changes.

Streak definition (chat's call, Venkat may veto — flag it in the report):
- Only outcome "correct" counts toward and extends the streak (first- or
  second-attempt correct both count — the child got it themselves).
- Outcomes "solved-with-help" and "shown-answer" RESET the streak to 0 and do
  not celebrate.
- The streak lives per lesson page; it does not persist across lessons.

## LEVELS (named presets in the engine)

- **subtle** — today's exact behaviour (8-ish sparks, 7px, short). Preserved
  unchanged as a preset so older grades can choose it later.
- **pronounced** — roughly 3× spark count, larger particles, wider spread,
  ~1s. Chip bounce unchanged. No shower.
- **grand** — big radial burst PLUS a brief top-down confetti shower over the
  card (~1.5s). Reserved for 5-streaks and the lesson finale.

Exact particle numbers are the implementer's judgement within those shapes —
report the chosen values.

## SOUNDS (RULED by Venkat 2026-07-24 — part of the same grade profile)

Sounds are **per-grade profile entries**, exactly like the visual levels. Only
Grade 4 ships now. Each is synthesized in code via WebAudio, the ding()
pattern — no audio files. Recipes are EXACT (freq Hz, start s, duration s,
peak gain, waveform; default sine; envelope identical to ding(): .001 →
exponential ramp to peak over .02s → exponential ramp to .001 by start+dur):

- **base — "marimba pluck"** (every correct answer):
  (523.25, 0, .35, .08) + (1046.5, 0, .18, .03)
- **streak-3 — "climbing ladder"**:
  (523.25, 0, .2, .06, triangle) (587.33, .08, .2, .06, triangle)
  (659.25, .16, .2, .06, triangle) (783.99, .24, .2, .06, triangle)
- **streak-5 — "retro level-up"**:
  (523.25, 0, .12, .045, square) (659.25, .09, .12, .045, square)
  (783.99, .18, .12, .045, square) (1046.5, .27, .12, .045, square)
  (1318.5, .36, .45, .05, square)
- **lesson finale — "full finale"**:
  (98, 0, .25, .09) + ta-da fanfare [(392,0,.22,.035,saw) (523.25,0,.22,.035,saw)
  (659.25,0,.22,.035,saw) then (523.25,.24,.6,.035,saw) (659.25,.24,.6,.035,saw)
  (783.99,.24,.6,.035,saw) (1046.5,.24,.6,.035,saw)] + flourish
  [(1046.5,.5,.4,.045,tri) (1318.5,.58,.4,.045,tri) (1567.98,.66,.4,.045,tri)
  (2093,.74,.4,.045,tri)]

Sound rules (permanent, all grades):
- Wrong answers are SILENT — no sound ever marks failure.
- Sound is a garnish, never a dependency (the engine's existing written
  philosophy) — every celebration must be complete with audio unavailable;
  the try/catch swallow pattern from ding() applies to all four.
- The base sound replaces ding() for graded celebrations; keep ding() itself
  intact if anything else calls it (Phase 0: check callers).
- Guard: audio output cannot be asserted in the harness — instead assert the
  profile object carries all four recipes for grade "4", and that each
  celebration tier invokes its designated sound function exactly once (spy or
  call-log seam, implementer's choice; the seam must not change runtime
  behaviour).

## HARD CONSTRAINTS

- **No-repaint law:** particles/shower are overlay elements appended OUTSIDE
  `.qbody` (or position-absolute within the frame chrome), removed when the
  animation ends. The question DOM is never rebuilt.
- **`prefers-reduced-motion`:** all levels collapse to the green paint +
  chip bounce only (no flying particles, no shower). Assert this in the guard.
- **Performance:** DOM/CSS particles only, no canvas, no libraries; every
  particle self-removes. Nothing may accumulate across 32 questions.
- The streak counter must survive "Try again" without incident (a retry is
  not an outcome) and must not be confused by scrolling between cards.

## PHASE 0 — DISCOVERY (read-only, report before building)

1. How does a page-level observer learn a question's outcome today? setOutcome
   exists per card; find or identify the cleanest signal (existing events like
   `rao:next` / `rao:wrong`, or a new `rao:outcome` event dispatched from
   setOutcome). **STOP-GATE: if outcome cannot be observed without touching
   the per-question DOM or violating no-repaint, halt and report options.**
2. How is "last question answered" detectable (lesson complete)? Report the
   mechanism before building. STOP-GATE if none exists cleanly.
3. Confirm the grade-signal finding from BRIEF-NOTQUITE-1 Phase 0 and reuse
   the same resolution (same default-to-"4" rule if no signal).
4. Enumerate existing guards touching celebrate()/sparks/ding.

## PHASE 1 — GUARD FIRST (seen FAILING before the fix)

New guard `tools/verify-celebrate.js`, in `test` and `test:fast`. Fixture-
driven, fake clocks for the timed parts (repo convention):

- Correct answer at Grade 4 → pronounced-level particle count (assert the
  count band, not exact pixels), no shower.
- 3 consecutive corrects → third celebration is one level up AND the flourish
  line renders with the profile's exact text.
- 5 consecutive corrects → fifth is grand (shower present).
- Wrong answer mid-streak → counter resets (next correct is base level).
- solved-with-help / shown-answer → counter resets, no celebration fires.
- Last question answered → finale fires (shower), regardless of streak.
- reduced-motion emulated → no particles at any level; paint + bounce only.
- After each celebration completes: zero particle nodes remain in the DOM.

Run against the current engine → must FAIL. Record the failing output.

## PHASE 2 — BUILD

Per the spec. Profile object dated, commented with this brief and the ruling,
new-grades-add-a-key note. All existing guards stay green; the subtle preset
must be byte-equivalent in behaviour to today's celebration.

## PHASE 3 — RECORDS + REGENERATE

1. `STUDENT-INTERACTION-RULES.md`: add Rule 20 (dated): tiered, grade-keyed
   celebrations; streak definition; help resets; finale; reduced-motion floor.
2. `docs/ISSUES.md`: RECORD row for the ruling.
3. Regenerate `review/` (same #117 CRLF stop-gate).

## PHASE 4 — CLOSE OUT

- Full `npm test` green (exit 0). Commit locally:
  `celebrate: grade-keyed tiers, streaks, lesson finale (BRIEF-CELEBRATE-1)`.
- **NO PUSH.**
- Report: Phase 0 mechanisms found, chosen particle values, streak-definition
  flag for Venkat, failing-then-passing guard output, diff stat.

## STOP-GATES (summary)

- No clean outcome signal or lesson-complete signal → STOP with options.
- Any approach requiring qbody rebuild → STOP.
- CRLF drift before review regeneration → STOP.
