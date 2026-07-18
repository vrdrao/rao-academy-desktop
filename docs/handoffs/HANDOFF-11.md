# HANDOFF-11 — Engine rao-master-19: figures + option ladder (2026-07-18)

Written 2026-07-18 at commit `0af8608`. **All three commits of this milestone
are LOCAL — not pushed.** BRIEF-ENGINE-19 mandates that Venkat pushes only
after the chat audit clears. Read CLAUDE.md first, then HANDOFF-10 — this file
carries only the day's delta. Everything below is from the git record and this
session's verified runs, not memory.

---

## Repo state at 0af8608 (verified this session)

- **Branch:** `main`, three commits ahead of `origin/main` (`d156dc8`).
  Untracked in root: `BRIEF-DUPLICATE-CULL-2026-07-18.md` (the NEXT brief —
  runs only after this one is pushed) and `settings.json` (pre-existing stray,
  untouched).
- **Engine:** `rao-master-18` → **`rao-master-19`**.
- **Corpus:** 104 files / **2,727** questions (was 2,722; +5 coverage
  questions in `_type-coverage.html`, enumerated in the brief report).
- **Suite:** full `npm test` green on the exact final tree
  (`FULL-SUITE-EXIT=0`): 2,727 questions render/grade/reject, **0 blank
  figures**, 0 JS errors, 8 themes, format contract on all 104 pairs, styles
  (incl. two new checks), touch, calm, Robo.

## The three local commits

1. **`46d9189` — the engine work (BRIEF-ENGINE-19 Parts A–D + fixtures +
   guards).** equal-groups + sequence figure renderers (the 7 registered
   blank-figure questions now render); unknown `data-show` promoted to
   build-failing `UNKNOWN_FIGURE` (error-level, guarded in
   verify-structural.js + failed by verify-grading-node in both gates);
   option-layout ladder (`OPTION_LADDER` constant: ≤10 → today's grid,
   11–18 → 2×2 via `.opts-mid`, >18 → stacked rows via `.opts-long`; tier
   stamped as class + `data-opt-tier`; `.nw` spans stop mid-expression
   wrapping); 5 fixture questions; verify-styles gains `checkFigures` +
   `checkOptionLadder` (both sabotage-proofed); all 104 review pages
   regenerated; totals updated in manifest/STATUS/index/CLAUDE.md. The brief
   itself archived at `docs/briefs/BRIEF-ENGINE-19-2026-07-18.md`.
2. **`6c5c18e` — deploy-drop regenerated for rao-master-19.** 16/16 files
   md5-match their `engine/` sources; DEPLOY.md rewritten (new fingerprints,
   sizes, rao-master-19 notes). Changed vs the -18 drop: `preview-engine.js`,
   `rao.css`, and `rao-card.css` (the drop's copy predated the card-look
   revision).
3. **`0af8608` — rider: the two historical briefs archived.**
   `docs/briefs/BRIEF-REVIEW-INDEX.md` + `BRIEF-HEALTH-CHECK.md`,
   byte-for-byte from the copies Venkat provided (his browser had renamed
   them `… (1).md`; content md5-verified, root copies removed). HEALTH-CHECK's
   internal "delete after reading" instruction is historical, superseded by
   the archive rule — noted in the commit message. This closes HANDOFF-10's
   "deleted-brief audit gap" item.

## Landmines discovered this session (recorded for the next author)

- **`_type-coverage.html`'s LAST question is load-bearing**: verify-touch
  drives "the last card on the page" and needs the 3-rung hint-ladder
  question there. Appending new coverage questions after it broke the touch
  suite mid-session; fixed by inserting new questions ABOVE it, with a
  KEEP-THIS-LAST comment now in the fixture.
- **The engine's per-question CSS scoper is neutered** (`styleFor` returns
  `""` — "rao.css owns styling"). New markup classes still must go in
  `rao.css`; the packed `MARKUP_STYLE_CSS` copies were updated for parity
  but are inert today (they still feed `var()` fallback baking).
- **At a 390px viewport the lesson container is 342px**, so the pre-existing
  ≤360px container rule already renders every plain option grid one-per-row
  on phones — "today's 4-across grid" tier is one column there, unchanged.
  qbody content at 390px is 320px; figure wrap budget is 300px + `.eqg-svg`/
  `.seq-svg` scale-down safety.

## Open list (delta from HANDOFF-10)

- **Venkat: audit this milestone, then push.** After the push:
  `BRIEF-DUPLICATE-CULL-2026-07-18.md` (in the repo root) is authorized to
  run — it deletes the two hyphen-named estimate-products duplicates
  (expects engine rao-master-19, BEFORE totals from the suite).
- ~~The 7 missing figures~~ — DONE (this milestone).
- Unchanged: Brief 7.8 (Robo personality pack) · rapid-mode stale green +
  no-lock · app wiring + go-live gate · individual review of remaining ~95
  files · whyWrong content debt.
