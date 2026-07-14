# Card formatting spec — paddings & gaps

The canonical spacing for every question card. These live in the **shared** style files,
so a value here restyles **every lesson at once** — that is the point. Change the rule,
don't hand-tweak a lesson.

All values were set and **verified in a real browser** (`getComputedStyle` on a rendered
card), not by reading CSS. Re-verify the same way after any change — the CSS scoper can
drop rules whose classes aren't in static markup, so the stylesheet is not the truth.

| Gap | Value | Where it's set |
|---|---|---|
| Prompt → answer choices | **24px** | `--rz-gap-po: 24px` on `:root` **+** `.rao-lesson .opts{margin-top:24px!important}` — `rao.css` |
| Prompt bottom margin | **10px** | `.rao-lesson .prompt{margin-bottom:10px}` — `rao.css` |
| Between option buttons (grid gap) | **12px** | `.opts{…gap:12px}` (also `.opts-stack`, `.opts-fig`) — `rao.css` |
| Card padding — desktop | **26px top / 28px sides / 20px bottom** | `.pv-card{padding:26px 28px 20px}` — `rao-card.css` |
| Card padding — mobile | **22px top / 16px sides / 16px bottom** | `@container lesson (max-width:480px){.pv-card{padding:22px 16px 16px}}` — `rao-card.css` |

## Two things that look wrong but aren't

- **Prompt bottom margin (10px) and prompt→answer gap (24px) coexist.** `.qbody` is
  `display:block`, so the prompt's 10px bottom margin and the answer area's 24px top margin
  **collapse** to `max(10, 24) = 24px`. The 10px only shows when the prompt is followed by
  something with a *smaller* top margin (it isn't today — figures are 12px, answers 24px), so
  raising it to 10px changed nothing visible while still giving the prompt its own margin.
- **Mobile card padding is a `@container` query, not `@media`.** It must respond to the
  *lesson's* width, not the window's — a 340px side-panel on a wide desktop is "mobile" too.
  Viewport `@media` would give that panel desktop padding (this is CLAUDE.md's GUARD C trap).
  It relies on `.rao-lesson`'s `container-name: lesson` (declared in `rao.css`).

## Changing a value

1. Edit the rule above (in `rao.css` or `rao-card.css`).
2. `npm run review lessons/<name>.html` — the review page **inlines** both CSS files, so a
   stale review won't reflect the change and `verify-format` will fail until regenerated.
3. `npm test` — must be green.
4. Measure the rendered card in a browser to confirm the number is what you intended.
