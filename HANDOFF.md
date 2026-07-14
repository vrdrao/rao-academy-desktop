# Handoff — the review format is fixed

Read this once, then delete it. Everything durable has been folded into `CLAUDE.md`.

## What was wrong

Claude Code was generating `review/*.html` correctly *as content* and wrongly *as a page*.

`tools/make-review.js` invented its own look. It wrapped each question in a `.rv-card`,
tagged it `SINGLE-SELECT` in grey, and printed the answer, hint and explanation as text
underneath. The result was a **proofreading document**: a flat list you read. Nothing was
clickable. There was no Check button, no Hint button, no progress ring, no gradient frame.

The lesson files in `lessons/` — the format you actually asked for — render each question
as a **real student card** you can play: gradient frame, white card, "Problem" label,
progress ring (1/24), the live question, a Hint button, an orange **Check ✓** button, and
🎉 Correct! / 🤔 Not quite feedback.

Same questions. Completely different page.

## Why it happened

`CLAUDE.md` never said what a review page must look like. Claude Code had no contract to
follow, so it made a reasonable-but-wrong guess: "review" sounded like an audit, so it
built an audit. Nothing in the repo contradicted it, and `npm test` only checked the
*engine*, never the *page*. It passed 124/124 while producing the wrong format.

## What changed

**1. `tools/make-review.js` — rewritten.**
It no longer hand-writes any card design. It **lifts the card CSS and the
`card()` / `wireCard()` renderer verbatim out of a reference lesson**
(`lessons/area_perimeter.html`; override with `RAO_REF=…`).

That is the whole trick: the review page and the lesson are now literally running the same
code. Change the card design in the lesson and every review page follows for free. They
**cannot drift apart again**, because there is no second copy to drift.

**2. One deliberate difference from the legacy lessons — the mount.**

The old lesson files mount into:

```html
<div id="preview" style="--brand:#7b5cff; --ink:#2c2150; …">
```

They hard-pin the theme as **inline styles**. `CLAUDE.md` already flags this as a bug:
inline styles win the cascade, so `data-theme` can never re-tint the page. Those lessons
predate `rao.css`.

The review mounts the way the **app** does:

```html
<div id="preview" class="rao-lesson" data-theme="grape">
```

This matters more than it looks. The engine writes an inline
`min-height: var(--rz-card-floor, 300px)` onto every `.qbody`. `rao.css` cancels it with
`.rao-lesson .qbody{min-height:0!important}`. **Without the wrapper, every card — even a
two-line multiple-choice — gets padded out to a 300px floor**, and no theme works. I hit
exactly this while fixing it: every card measured an identical 477px until the wrapper went
in. After: `order` = 395px, `single-select` = 272px. Correct, and per-type.

So the review copies the lesson's **card design** but the app's **mount**. That combination
is what the child actually sees.

**3. `tools/verify-format.js` — new. This is the guard.**
It renders the lesson and the review side by side in real Chromium and compares them
card by card:

- the card skeleton (`.pv-frame` → `.pv-card` → head/ring/question/foot)
- Hint button, Check button, feedback slot, green answer line — each must be present
- the gradient frame and orange button **paint** (computed styles, not markup)
- and it **fails outright** if any review-only chrome (`.rv-card`, `.rv-mount`, …) appears

I sabotage-tested it: deleting the Check button makes it fail immediately and name the
exact difference on every card. The original bug cannot recur silently.

**4. `npm test` now runs both.**

```
npm test          engine harness  +  format check      ← both must be green
npm run test:engine    engine only
npm run test:format    format only
npm run review lessons/<name>.html
```

**5. `CLAUDE.md` — the contract is now written down.**
New section: **🚨 THE REVIEW FORMAT CONTRACT — do not invent a review skin.** It states the
required card anatomy, forbids parallel `.rv-*` classes, explains why `.rao-lesson` is
load-bearing, and folds the review + verify steps into the per-lesson workflow.

Every future Claude Code session reads `CLAUDE.md` automatically. That is the actual fix —
the rest is just code.

## Where things stand

```
npm test
  124 questions · 124 render · 124 grade · 124 reject wrong · 0 JS errors
  ENGINE rao-master-11 — SAFE TO SHIP ✅
  PASS  area_perimeter          (25 cards, structure + paint identical)
  PASS  compare_money           (24 cards, structure + paint identical)
  PASS  simple_fractions_shape  (30 cards, structure + paint identical)
```

Open any file in `review/` — click an option, press **Check ✓**, press **Hint**. It plays.

## Starting the next Claude Code session

Unzip, then:

```
cd rao-academy
npm install
npx playwright install chromium
npm test
```

Then say:

> Read CLAUDE.md. Here is a Word doc — build the lesson, then build the review and verify
> the format.

Two notes for that session:

- **`lessons/place_values.html` is stale.** It is the one lesson that does *not* share the
  card chrome (no progress ring, older renderer). It still passes the engine harness, so it
  is not broken — but it is not the format. Do not use it as the reference lesson, and
  consider regenerating it. Every other lesson is byte-identical chrome.
- **`RAO_THEME=mint node tools/make-review.js …`** builds the review in any of the eight
  themes (grape · bubblegum · mint · sunshine · blueberry · cottoncandy · forest · rainbow).
  Worth doing once — it is a fast way to eyeball that theming actually works now that the
  mount is right.


---

# ⚠️ FOR THE DEVELOPER — making the app match the preview

**Same engine + same `rao.css` is NOT enough.** This was tested, not assumed: with an
identical `preview-engine.js` and an identical `rao.css`, an app that draws its own card and
forgets the mount renders a **correct question in a grey box with the wrong font**.

The reason is simple — **the card is not in `rao.css`.** The gradient frame, the progress
ring, the Hint button, the orange Check button and the 🎉/🤔 feedback were only ever defined
inside the preview HTML. So they have now been extracted into a real file you can ship:
**`engine/rao-card.css`** (4 KB).

## Ship four files, and get the mount right

```html
<link rel="stylesheet" href="fonts.css">      <!-- + the fonts/ folder -->
<link rel="stylesheet" href="rao.css">        <!-- the INSIDE of the card -->
<link rel="stylesheet" href="rao-card.css">   <!-- the CARD ITSELF -->
<script src="preview-engine.js"></script>

<div class="rao-lesson" data-theme="grape">   <!-- LOAD-BEARING. not decoration. -->
  <div class="pv-frame" data-behavior="..." data-answer='[...]'>
    <div class="pv-card">
      <div class="pv-head">
        <span class="pv-tlabel">Problem</span>
        <span class="pv-ring"><i>3/24</i></span>
      </div>
      <!-- RaoPreview.build() markup goes here -->
      <div class="pv-hintbox" hidden></div>
      <div class="pv-foot">
        <button class="pv-hint" type="button">Hint</button>
        <span class="pv-fb"></span>
        <button class="pv-check" type="button">Check &#10003;</button>
      </div>
    </div>
  </div>
</div>
```

**Why `.rao-lesson` is load-bearing:** the engine writes an inline
`min-height:var(--rz-card-floor,300px)` onto every `.qbody`. `rao.css` cancels it with
`.rao-lesson .qbody{min-height:0!important}`. Drop the wrapper and **every card — even a
two-line multiple-choice — inflates to a 300px floor, and `data-theme` stops working.**

Also: **never put theme variables in an inline `style=` on the mount.** Inline styles win the
cascade and silently kill theming. (The old lesson files do this. It is a bug. Don't copy it.)

`tools/rao-card.css` header documents the full required DOM. `wireCard()` in any lesson file
shows the ~20 lines of JS that wire Hint / Check / feedback.

## Prove it, don't trust it

```
node tools/check-app.js https://your-app/lesson/42
```

Point it at any live page in the real product that shows a question. It inspects the running
page and checks all five: engine version, `rao.css`, `rao-card.css`, the `.rao-lesson` mount,
and whether the fonts actually resolved. Exit 0 = the app matches `review/`. Exit 1 = it does
not, and it names the reason.

Run it once when the engine is first wired in, and again after any deploy that touches CSS.
