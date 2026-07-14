# Rao Academy — Lesson Rendering: Developer Brief

**Engine version in this drop:** `rao-master-10`

---

## The shipped files

| File | What it does | Where it lives | Changes? |
|---|---|---|---|
| **`rao.css`** | All styling — colors, fonts, spacing, sizing | **App** — loaded once, app-wide | Rarely |
| **`rao-card.css`** | The **card itself** — gradient frame, progress ring, Hint/Check, feedback pill | **App** — loaded once, app-wide | Rarely |
| **`rao-card.js`** | The card **renderer** — `card()` / `wireCard()`: builds each card, wires Hint + Check, applies per-option feedback | **App** — loaded once, app-wide | Rarely |
| **`preview-engine.js`** | All behavior — renders questions, draws figures, handles drag/tap, **grades answers** | **App** — loaded once, app-wide | **Occasionally — forward only** |
| **Lesson HTML** | Content only — the questions (the `#source` block) | **Database** — imported per lesson | Every lesson |

All four asset files are loaded **once by the app**, not per lesson.
Lesson files contain **zero CSS and zero JavaScript** — content and structure only.

> **The card renderer used to be pasted into every lesson's preview wrapper.** It is now a
> real file, `rao-card.js` — the same promotion `rao-card.css` already got. Ship it; do not
> re-embed it per page.

---

## Page setup

```html
<link rel="stylesheet" href="/assets/rao.css">
<link rel="stylesheet" href="/assets/rao-card.css">
<script src="/assets/preview-engine.js"></script>
<script src="/assets/rao-card.js"></script>
<body class="rao-lesson">
```

The `rao-lesson` body class is required — `rao.css` scopes to it.

### Fonts
Lessons expect three Google Fonts. Without them everything falls back to a generic
system font and loses the intended look:

```html
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

---

## 🎨 Kid-selected colour themes

The app already lets kids pick a colour (Grape / Bubblegum / Mint / Sunshine / Blueberry /
Cotton Candy / Forest / Rainbow). **`rao.css` now wires that pick straight into the lessons.**

### How to use it — one attribute

```html
<div class="rao-lesson" data-theme="mint">
   … lesson questions …
</div>
```

That's the whole integration. Set `data-theme` to the kid's saved choice. Every button, tile,
chip, drop-slot, focus ring, figure and shadow re-tints instantly. **No JavaScript, no
re-render, no page reload** — the browser does it. Changing it live is one line:

```js
container.dataset.theme = kid.colourChoice;   // 'mint' | 'sunshine' | ...
```

Valid values: `grape` (default) · `bubblegum` · `mint` · `sunshine` · `blueberry` ·
`cottoncandy` · `forest` · `rainbow`. Omit the attribute → Grape.

### ⚠️ Do NOT put theme variables in an inline `style=` on the question container

The old preview template did this:

```html
<!-- ❌ this HARD-PINS purple and blocks the kid's theme -->
<div id="preview" style="--brand:#7b5cff;--brand-rgb:123,92,255; …"></div>
```

An inline `style` beats everything in the cascade, so the theme can never take effect.
**Drop it.** `rao.css` supplies all defaults on `:root`. The container needs no inline vars.

### What was changed to make this work

- `rao.css` used to pin `--brand` **directly onto** `.tile`, `.opt`, `.prompt` etc. A variable
  set *on* an element cannot be overridden by an ancestor, so theming was impossible. That token
  block now lives on `:root`, where it inherits normally.
- 73 hardcoded `rgba(123,92,255,…)` shadows and 54 hardcoded brand hexes were converted to
  `var(--brand-rgb, …)` / `var(--brand, …)`. Nothing is visually different in Grape — the old
  values are the fallbacks.

### Accessibility

Each theme's `--brand` is **contrast-checked**: white text on it clears **3:1** minimum. Some
brand colours are a shade deeper than the picker swatch for exactly this reason (the swatch is
kept as `--swatch` if you want the button to match the picker chip exactly). Kids can read the
buttons in every theme.

---

## ⚠️ Feedback on check — mark the OPTION, never the whole card

When the child presses **Check**, `rao-card.js` shows the pill (🎉 **Correct!** / 🤔 **Not
quite**) and then marks **the option the child chose** — and, when wrong, reveals the correct
one. That is what `wireCard()` / `markFeedback()` do.

**DO NOT colour or box-shadow the whole `.pv-card` on check.** The card wasn't wrong — a
single option was. Flashing the whole card red/green is a real bug this project already had
(`cardEl.style.boxShadow = ok ? green : red`); it was removed. If you re-implement the card
renderer in the app, copy the per-option behaviour, not the card flash — otherwise you inherit
the bug straight off the demo page.

The engine **grades** (`check()` → boolean) but never touches the DOM — *"CSS decides, not the
engine."* So per-option state is applied by the renderer, using classes `rao.css` already
styles:

| Question type | Marked element | Classes |
|---|---|---|
| single-select / multi-select | `.opt` / `.opt-fig` / `.hcell` | `.is-correct` / `.is-wrong` |
| fill-blanks | `.blank-input` | `.correct` / `.incorrect` |
| expression | `.ans-input` | `.correct` / `.incorrect` |
| lattice | `.lat-in` | `.correct` / `.incorrect` |
| order / sequence-build | `.order-slots` / `.sb-slots` (whole answer) | `.correct` / `.incorrect` |

**Per-option feedback gaps — no state class exists in `rao.css` yet** (these show the pill +
answer line only; build them out engine/CSS-side rather than faking classes):
**categorize** (venn/bins drop zones), **line-plot**, **time**, **bar-graph**, scene-tree
apples. `construct` (geometry) self-grades on its board and needs no per-option state.

---

## Engine API

`preview-engine.js` exposes one global: `window.RaoPreview`

| Method | Purpose |
|---|---|
| `build(sourceHTML)` | Parses lesson source → array of `{ markup, behavior, answer, hint, issues }` |
| `attach(qbodyEl, behavior)` | Wires up interactivity (click, drag, type) on a rendered question |
| `check(qbodyEl, behavior, answer)` | **Grades** — returns whether the child's answer is correct |
| `validate(...)` | Reports authoring errors before ship |
| `serialize(...)` | Reads the child's current answer state |
| `__version` | Version string — **surface this in the app** (see below) |

Typical render loop:

```js
const questions = RaoPreview.build(lessonSourceHTML);
questions.forEach(q => {
  container.insertAdjacentHTML('beforeend', q.markup);   // no <style> — rao.css styles it
});
document.querySelectorAll('.qbody').forEach((el, i) =>
  RaoPreview.attach(el, questions[i].behavior));
// on submit:
const correct = RaoPreview.check(el, questions[i].behavior, questions[i].answer);
```

---

## ⚠️ The one rule that matters: the engine only moves FORWARD

When a new lesson needs a question type the engine has never rendered (a lattice grid, a
rotatable 3D solid, a build-a-bar-graph), **the engine gains a new capability.** A newer
engine always runs older lessons correctly. An older engine **cannot** run newer lessons —
and it **fails silently**: the question imports fine, the database looks fine, and the child
sees a blank space where the figure should be. No error is thrown.

### Rules

1. **Never roll the engine back.** Newer is always safe.
2. **Deploy the engine BEFORE importing a lesson that needs it.**
3. **The engine is a drop-in file** — replaced whole, never hand-edited.

### Two things to build (cheap, prevents most pain)

**a) Show the engine version in the app.**
`RaoPreview.__version` → put it in a footer, admin screen, or console log. Then anyone can
answer *"which engine is live?"* in two seconds instead of guessing.

**b) Record a `min_engine` per lesson.**
Each lesson should carry the minimum engine version it needs. The app should refuse to serve
a lesson whose `min_engine` is newer than the loaded engine — so it fails **loudly** instead
of showing a child an empty box.

---

## Deploy order (per lesson)

```
1. Did this lesson ship with a new preview-engine.js?
   ├─ NO  → skip to step 3
   └─ YES → 2. Deploy the new engine to the app FIRST
3. Import the lesson content
```

---

## Question types the engine supports

`single-select` · `multi-select` · `fill-blanks` · `expression` · `order` ·
`sequence-build` · `categorize` (Venn / bins) · `line-plot` · `construct` (geometry)

Geometry (`construct`) additionally requires **`raoGeoEngine.js`** loaded on the page.
Only needed for lessons that actually contain geometry questions.

---

## Verified in this drop

- Engine loads standalone, reports `rao-master-10`
- Builds a real 32-question lesson: **32/32 built, 0 validation issues**
- **0 `<style>` blocks emitted** — `rao.css` owns all styling
- **0 figures duplicated into prompts**
- Rendered in Chromium: all classes resolve against `rao.css`, **0 JS errors**
- Mobile responsive rules confirmed active at 390px
