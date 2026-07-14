# Rao Academy — lesson engine + content

## Setup (once)
```bash
npm install
npx playwright install chromium
```

## The one rule
```bash
npm test
```
Runs every lesson in a real browser. Right answers must grade CORRECT, wrong answers
must grade WRONG, figures must render, all 8 themes must re-tint.

**Green = safe to ship. Red = DO NOT SHIP.**

Never deploy `engine/preview-engine.js` without a green run. The engine is shared by
every lesson — a change for a new lesson can silently break an old one.

Test a single lesson:
```bash
npm test lessons/place_values.html
```

## Layout
```
engine/preview-engine.js   the engine — renders, drags, grades (shared)
engine/rao.css             styling + 8 colour themes + container queries
engine/fonts.css           self-hosted @font-face rules  (load BEFORE rao.css)
engine/fonts/*.woff2       the font files — no Google Fonts, CSP-safe
lessons/*.html             one file per lesson
harness.js                 the regression suite
CLAUDE.md                  project rules — Claude Code reads this every session
docs/                      authoring spec, developer brief, theme preview
```

## Deploy order
1. Engine changed? Deploy `engine/preview-engine.js` to the app **first**.
2. Then import the lesson.

Never the reverse. Never roll the engine back.

## Page setup

```html
<link rel="stylesheet" href="/assets/fonts.css">   <!-- FIRST -->
<link rel="stylesheet" href="/assets/rao.css">
<script src="/assets/preview-engine.js"></script>

<div class="rao-lesson" data-theme="mint">   <!-- kid's colour choice -->
   … lesson questions …
</div>
```

`fonts.css` expects `fonts/*.woff2` to sit **next to it** on your server.
No external font requests — works under a strict CSP, offline, and on school networks.

`.rao-lesson` is a **container query root**: the lesson adapts to the width of *its own
box*, not the browser window. It fits correctly in a phone, a side panel, a modal or an
iframe. Do not remove `container-type: inline-size` from it.
