# BRIEF — CARD-LOOK SPEC REVISION (tuner readout 2026-07-18)

## PRE-CHECK (report before proceeding; STOP on any mismatch)

1. `git status` — tree clean, branch main, in sync with origin/main.
2. Engine `__version` in engine/preview-engine.js is exactly `rao-master-18`.
3. Corpus totals: 104 lesson files / 2,722 questions (from the manifest or a
   suite run — state which).

## Authority

Venkat read out the Card-look tuner's two monospace lines from the live demo
(screenshot supplied to chat, 2026-07-18):

```
frame 3px · ledge 5px · halo 9px/21px @ .34
bg #ffffff · grid 0.090
```

Per the card-look spec's own rule, a tuner readout from Venkat REPLACES the
shipped card-anatomy table via spec revision. This brief is that revision.
This is a CHROME-ONLY change. The engine's grading, behavior, and markup
output are untouched.

## The new shipped defaults (replaces the old table everywhere it appears)

| Layer | Property | OLD | NEW |
|---|---|---|---|
| Frame (coloured ring) | `.quiz` padding | 5px | **3px** |
| Card inner radius | concentric rule: 28 − frame, floor 12 | 23px | **25px** |
| Ledge (lip under card) | box-shadow y-offset | 5px @ .12 | **unchanged: 5px @ .12** |
| Halo (glow) | box-shadow | 0 12px 28px @ .34 | **0 9px 21px @ .34** |
| Page background | `--bg` | #eef1f6 | **#ffffff** |
| Checker grid strength | `--checker-line` alpha | .06 | **.09** |
| Checker size | `--checker-size` | 30px | **unchanged: 30px** |

Unchanged and NOT to be touched: halo/ledge palette tinting via `--halo-rgb`
and `--grid-rgb` (intensities never change per theme); grape's pinned grid
purple `124,58,237`; the dark-mode `--checker-line` override
`rgba(255,255,255,.04)` (dark mode is NOT palette-tinted — do not "fix" it).

## Scope of edits

1. **Production CSS** — apply the new values wherever the shipped defaults are
   hard-coded (expected: `engine/rao-card.css`; page background/grid may live
   in `engine/rao.css`). Report exactly which files and rules you changed.
2. **Spec document** — find the doc in `docs/` carrying the
   "Card anatomy — exact numbers" table and revise the table to the new
   values, with a one-line revision note citing this brief and the date.
   If no such doc exists in the repo, say so — do not create one.
3. **Review pages must show the full app context.** Check whether
   `review/<name>.html` pages currently paint the page background + checker
   grid behind the card. If they do NOT, extend the shared review builder
   (`tools/make-review.js`) so every review page renders: `--bg` white page,
   checker grid at the new strength, card with frame/ledge/halo per the table
   above. The card must sit on the page the way it does in the app.
4. **Regenerate all 104 review pages** through the shared builder. The
   pipeline is deterministic — content must not change, only chrome. Spot-diff
   two regenerated pages against their priors and confirm the diff touches
   chrome only.
5. **`engine/preview-engine.js` — ZERO diff.** md5 before == md5 after.
   If you believe this brief cannot be done without touching the engine,
   STOP and report; do not widen the diff yourself.

## Guards (guard-first proof required)

Extend `tools/verify-styles.js` with computed-style assertions on a really
rendered card at BOTH 1280px and 390px:

- frame thickness (`.quiz` padding) === 3px
- card inner border-radius === 25px
- halo box-shadow === 0 9px 21px at alpha .34 (grape rgb)
- ledge box-shadow === 0 5px 0 at alpha .12
- page/review background-color === #ffffff
- checker-line alpha === .09 (grape pinned rgb 124,58,237)

Proof protocol, actual output required (no summaries):

1. Sabotage: set frame back to 5px → run guard → show the actual FAIL line.
2. Restore → PASS.
3. Sabotage: set `--bg` back to #eef1f6 → FAIL line → restore → PASS.
4. Full `npm test` green. Report final banner and totals (must still be
   104 / 2,722 — any changed number gets explained).

## Report requirements

- md5 + bytes-on-disk for every shipped file you changed.
- The exact list of CSS rules edited (file + selector + property, old → new).
- Whether review pages previously had page background/grid, and what you did.
- Firewall: no grading file changes expected; FIREWALL_ALLOW_GRADING must
  never be set — confirm explicitly.
- Anything you couldn't implement faithfully goes in its own section;
  absence of that section is itself an audit flag.
- Commit this brief file to `docs/briefs/` in the same commit as the work.
- Commits stay LOCAL. No push, no handoff files, nothing beyond this brief's
  scope. Venkat pushes only after the chat audit clears.
