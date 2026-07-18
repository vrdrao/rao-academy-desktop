# HANDOFF-9 — rao-master-18: Robo in production (Brief 7.7 + 7.7.1/2/3)

Written 2026-07-18, at commit `5b26bec`, after the four-commit milestone push
`077db41..d5818b1`. Read CLAUDE.md first, then HANDOFF-8 — this file carries
the 7.7-series delta and the deploy-drop regeneration.

---

## Repo state (verified this session, not recalled)

- **Branch:** `main`. The milestone push was fast-forward `077db41..d5818b1`
  (four commits, enumerated by Venkat). One local commit sits on top:
  `5b26bec` (deploy-drop regeneration, below), unpushed at writing time.
- **Engine:** `rao-master-18`. Forward-only. The bump itself is a one-line
  version-string change in `preview-engine.js`; all Robo behavior lives in
  NEW files (`engine/robo.js`, `engine/robo.css`) plus one dispatch-only
  addition to `rao-card.js`. FIREWALL_ALLOW_GRADING was never set;
  SOURCE-DIFF passed normally on every commit (no solution files in any diff).
- **Corpus:** 104 files, 2,722 questions. Harness banner at every pre-commit:
  `ENGINE rao-master-18 — SAFE TO SHIP` · `CALM CARD: all laws hold` ·
  `TOUCH: … ✅` · `ROBO: rig, ladder, silence, stuck-child, touch — all hold`.

## The four pushed commits (from `git log`, not memory)

1. **`4c8cbcd` — Brief 7.7: Robo production integration.** Ported VERBATIM
   from the signed-off references: the rig (dock, SVG, motion pool, flight,
   victory lap with exact-return) from `incoming/calm-card-v36.html`, and the
   six `mood-solve-*` reactions with hold timings 2100/1600/2200/2000/1900/held
   from `incoming/guided-solve-rebuilt-v1.html` (the sanctioned rebuild; its
   provenance header travels with the CSS). `window.Robo = {play, flyTo,
   bubble, poke, busy}`, DROP-not-queue. Layers 1–2 wired to REAL card events
   (`rao:wrong` — added to `calmWrong()` as a dispatch-only line — plus the
   existing `rao:outcome`/`rao:next`); walkthrough silence from the
   solved-with-help commit point to `rao:next`; L3 drag/poke(single
   wobble)/yield/`roboPos`; L4 eye-tracking, 45 s doze, stuck-child lean-in.
   `tools/verify-robo.js` added to `npm test` (both viewports, CDP touch,
   page.clock; three sabotage modes each shown RED). The demo's cheer-row /
   cc-ava removal was a verified NO-OP — 7.6 had already removed them.
2. **`f7b372c` — Brief 7.7.1.** The stop-and-reported rig conflict, ruled FIX:
   `flyTo`'s landing clamps (demo 8/60/70 insets) could pull a nearestClear
   yield spot back onto the card footer at 390px — clamps aligned with the
   drag clamps (4px), guard-first (FAIL: dock overlapped the Check button;
   PASS: lands clear). Victory-lap exact-return untouched (separate WAAPI
   path). `tools/make-review.js` now inlines `robo.css`/`robo.js`; all four
   review pages regenerated — Venkat's review pages carry a live Robo.
3. **`27cc376` — Brief 7.7.2: the corpus-wide wrong-feedback fix.** DIAG-7.7.2
   found 2,707 of 2,722 questions (99.4%) gave a SILENT wrong in calm mode:
   the wrong-feedback bubble was sourced only from whyWrong, which is
   select-only by design and authored on just 15 questions — and the row
   label promised "Give one more hint" having given none. Fix: `calmWrong()`
   falls back to the next FORWARD rung through the existing `giveHint()` path
   (1,122 non-selects + 1,585 whyWrong-less selects healed, zero content
   edits); `feedbackRow()` derives its ghost label from the `syncHintBtn()`
   rule so it cannot over-promise. 16 guard asserts (verify-calm +
   verify-touch, all shown RED pre-fix) on two TEST-SIDE fixtures (`fb2a`
   fill-blanks / `fb2b` whyWrong-less select — injected by the test page
   builders, NOT in `_type-coverage.html`; do not go looking for them there).
4. **`d5818b1` — 7.7.3: keypad touch-only.** The on-screen digit pad
   (`ensureDigitPad()`, styles injected at runtime by `preview-engine.js`)
   now hides on fine-primary-pointer devices via one rule in `rao.css`
   (`@media (pointer:fine){ .rao-lesson .rao-digitpad{display:none !important} }`
   — `!important` because the runtime `<style>` lands after the sheet).
   Pointer capability, not viewport width. Guard-first (FAIL: display=flex,
   88px, gap 18→114px; PASS: none/0/18px); coarse-pointer taps proven
   functional under CDP touch; physical-keyboard typing proven unaffected.

## `5b26bec` — deploy-drop regenerated for rao-master-18

`deploy-drop/` now byte-matches the repo at `d5818b1`, verified md5-per-file
(16/16 MATCH, printed in-session): `robo.js` + `robo.css` added; DEPLOY.md
rewritten — load order (robo.css after rao-card.css; robo.js after the card
renderer), updated fingerprint table, and the note that the app must set
`window.RaoAccount.firstName` at login or milestone praise is silently
nameless. `tools/check-app.js` does NOT yet probe Robo — DEPLOY.md says so.

## Deferred — said plainly, with the why

- **Brief 7.8 territory (explicit fence, not omission):** personality pack
  §A (sneak-peek entrance, poke ladder stages 2–4 + 30 s cooldown — tap is
  ONE wobble today — idle mischief, carry-flail/dust-off), attention gaze §C,
  stage props/bolt §B, palette tint §D. The mischief props are in the shipped
  SVG, inert and hidden at rest, so 7.8 is pure addition.
- **whyWrong authoring debt:** 1,585 of 1,600 select QUESTIONS carry no
  whyWrong (HANDOFF-8 counted the same debt as 3,989 distractors). Since
  7.7.2 a wrong there falls back to forward rungs — the child is no longer
  silent-wronged — but the authored misconception messages and their
  analytics codes remain unwritten, and the DISTRACTOR COVERAGE guard is
  still not in `npm test` (it runs `--hint-leak-only`). Deferred per Brief
  7.4's ruling: report the debt, don't author it yet.
- **Rapid-mode stale green (HANDOFF-8 open-list item 3, still open):** the
  rapid Check path never drops `.opt.is-sel`, so the selection purple
  out-specifies the verdict paint (the exact bug calm's `celebrate()` fixes
  by removing `is-sel`), and rapid never locks a card after Check. Untouched
  by the 7.7 series — every 7.7.x brief was calm-card scope; rapid has no
  signed-off brief yet.
- **`RaoAccount.firstName` is a defined-by-us hook** (Brief 7.7 disclosure):
  the account layer does not exist in this repo; the app must supply it.

## Open list (delta from HANDOFF-8)

1. **Brief 7.8** — personality pack, gaze, props, tint, poke ladder, entrance.
2. CLAUDE.md §13 revision to match 7.6/7.7 reality (carried from HANDOFF-8).
3. Rapid-mode verdict paint + no-lock (carried; see above).
4. whyWrong content debt (carried; softened by the 7.7.2 fallback).
5. Individual review of remaining ~95 files (carried).
6. App wiring: load the drop per DEPLOY.md, set `RaoAccount.firstName`,
   then the standing go-live gate (`check-app.js` against the real URL).
