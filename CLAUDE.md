# Rao Academy — Project Instructions

Read this fully before doing anything. It carries every rule, gotcha and hard-won
lesson from ~90 prior sessions. Following it is not optional.

---

## What this project is

K–10 maths edtech. Grade 4 is the active focus. Word-document worksheets are converted
into interactive HTML lessons that get imported into the app.

**Venkat is non-technical.** Explain in plain language. Be direct — no hedging, no
sugar-coating. He is terse ("y" = yes to the last question). He prefers being **shown
results over being asked permission**: make technical judgment calls autonomously, and
flag only genuine ambiguities. When a better approach exists, **propose it** rather than
executing a flawed request.

**Goal: learning that is joyful and addictive.** Correct is the floor, not the bar.

---

## 🚨 NEVER REWRITE HISTORY

Do NOT run: `git push --force`, `git push -f`, `git rebase`, `git reset --hard` on
pushed commits, `git commit --amend` on pushed commits, or `git filter-branch`.
Do NOT offer to "clean up" or "squash" history. History is append-only.
If a fix seems to require any of these, STOP and ask Venkat first, explaining
in plain language what would be lost.

Enforcement (not just a promise): a **`pre-push` hook** in `.githooks/` blocks any
non-fast-forward (history-rewriting) push, and `receive.denyNonFastForwards` is set
`true` locally. Note — `git push` **cannot** be intercepted by a git alias (aliases
only name *new* commands), so the hook, not an alias, is what actually guards this.

---

## 🚨 THE ONE RULE

```
NEVER commit an engine change without running:   npm test
```

Every lesson ever shipped runs on **one shared engine**. A change made for Lesson 30 can
silently break Lesson 4 — and it fails **silently**: no error, just a blank space where a
figure should be. A child sees it before you do.

`npm test` opens every lesson in a real browser, answers every question right (must grade
CORRECT), answers every question wrong (must grade WRONG), checks every figure actually
rendered, and checks all 8 themes re-tint. It takes ~30 seconds.

**Red = do not ship. No exceptions, no "it's a small change".**

This is not paranoia. It has caught, in testing: a grader that marked every answer correct,
a question type that silently stopped rendering, and figures collapsing to zero size.

---

## 🚨 THE SECOND RULE — grading tests are BLIND to styling

```
A GREEN HARNESS PROVES A QUESTION GRADES RIGHT. IT NEVER PROVES IT LOOKS RIGHT.
```

The grading harness clicks options and reads the verdict — it **never looks at what it
clicked**. A double border, an invisible label, or no visible selection all pass (a real
double-border bug survived a green run). So **every visual rule needs its own computed-style
check in `tools/verify-styles.js`** — `getComputedStyle` on a really-rendered card, driven
with real clicks/keys. Reading the stylesheet proves nothing: the CSS scoper **drops rules
whose classes never appear in static markup**, so a rule you see in the source may not paint.
`verify-styles.js` runs in `npm test` and already enforces the ring / focus / visible-selection
invariants — add NEW visual invariants to it, don't just write prose here.

---

## Repo layout

```
engine/preview-engine.js   the ENGINE — renders, drags, GRADES. Shared by every lesson.
engine/rao.css             all styling + the 8 kid-selectable colour themes
lessons/*.html             one file per lesson (the deliverable)
harness.js                 the regression suite  →  npm test
docs/                      authoring spec, developer brief, FORMATTING-SPEC (card paddings/gaps)
```

Current engine: **`rao-master-13`**. Check `__version` before building anything.

---

## The four pieces (and who owns them)

| | What | Where it lives | Changes |
|---|---|---|---|
| `preview-engine.js` | Behaviour — renders, drags, **grades** | App, loaded once | **Occasionally — FORWARD ONLY** |
| `rao.css` | The **inside** of the card — options, tiles, figures, themes | App, loaded once | Rarely |
| `rao-card.css` | The **card itself** — gradient frame, ring, Hint, Check, feedback | App, loaded once | Rarely |
| `rao-card.js` | The card **renderer** — `card()` / `wireCard()`: builds each card, wires Hint/Check | App, loaded once | Rarely |
| `fonts.css` + `fonts/` | Baloo 2 · Quicksand · DM Sans, self-hosted | App, loaded once | Never |
| lesson `.html` | Content — the questions (`#source` only) | Database, per lesson | Every lesson |

Lesson files carry **zero CSS and zero JS** — just the `<div id="source">` block of
`<!--@q -->` frontmatter + `<div class="question">` blocks. The app owns styling and the
renderer; the engine owns behaviour.
Claude's job is pedagogically correct, well-structured **content** — not per-lesson styling.

**Forward-only:** a newer engine always runs older lessons. An older engine **cannot** run
newer lessons. Never roll the engine back. Deploy engine **first**, import lesson **second**.

### ⚠️ Engine + rao.css alone is NOT enough

It is tempting to think "same engine, same `rao.css`, therefore same look." **It is not true**,
and it has been tested: with an identical engine and an identical `rao.css`, an app that
supplies its own card chrome and forgets the mount renders a correct question **in a grey box
with the wrong font**. The card is not in `rao.css`. It never was.

Four files, and the mount. All five, or the app will not match `review/`:

```html
<link rel="stylesheet" href="fonts.css">
<link rel="stylesheet" href="rao.css">
<link rel="stylesheet" href="rao-card.css">
<script src="preview-engine.js"></script>

<div class="rao-lesson" data-theme="grape">   <!-- LOAD-BEARING -->
  <div class="pv-frame">…</div>
</div>
```

`.rao-lesson` is not decoration. The engine writes an inline
`min-height:var(--rz-card-floor,300px)` onto every `.qbody`; `rao.css` cancels it with
`.rao-lesson .qbody{min-height:0!important}`. **Drop the wrapper and every card — even a
two-line multiple-choice — inflates to a 300px floor, and no theme applies.**

**`node tools/check-app.js <url>` proves it against the live app.** Point it at any page in
the real product showing a question. It checks all five and exits non-zero with the reason
if any is missing. Run it once after the developer wires the engine in, and again after any
deploy that touches CSS. Green means what Venkat approved in `review/` is what the child sees.

---

## Engine API (get this right — it is easy to get wrong)

```js
const qs   = RaoPreview.build(sourceHTML);      // -> [{markup, behavior, answer, hint, issues}]
RaoPreview.attach(qbodyEl, behavior);           // wire up interactivity
const user = RaoPreview.serialize(qbodyEl, behavior);   // read what the child entered
const ok   = RaoPreview.check(behavior, user, correct); // GRADE — note the arg order!
```

⚠️ **`check(behavior, user, correct)`** — behaviour FIRST, not the element. Passing the DOM
node gives `user.map is not a function`. You must `serialize()` first, then `check()`.

Node load: `global.window = {}; eval(fs.readFileSync('engine/preview-engine.js','utf8'));`
Always read/write the engine in Python with `encoding='utf-8', errors='surrogatepass'`
(it contains emoji; naive reads corrupt it). For final HTML assembly, read it in **binary**.

---

## The nine question types

`single-select` · `multi-select` · `fill-blanks` · `expression` · `order` ·
`sequence-build` · `categorize` (venn2 / bins) · `line-plot` · `construct` (geometry)

Each question = a `<!--@q … -->` frontmatter comment + a `<div class="question">`.
The **frontmatter `answer` is the source of truth** — the SQL importer reads it directly.
Full spec: `docs/WORD_TO_AUTHORING_INSTRUCTIONS.md`.

### Answer-key formats — exact strings, exact matching

- `fill-blanks` — **digit-only** strings. No commas, no ₹ symbol. Grader does exact match.
- `single-select` / `multi-select` — must match the option's `data-val` **verbatim**.
- `order` / `sequence-build` — tile keys are the **visible text**, unless `data-val` is set.
  The answer must be a **permutation of the authored tiles** (the engine now guards this).
- `categorize` — the region id **per tile, in tile order** (`A`/`B`/`AB`/`OUT`, or bin ids).
- `construct` — no answer key; geometry self-grades against `targets`.

---

## Authoring rules — apply automatically, without being asked

**Pedagogy**
- Grades 1–5: **tap-first, minimal typing.** A "type the number" question becomes a
  "tap the number" `single-select`. Typing is friction for a 9-year-old.
- Drag needs **3+ items**. A 2-item drag into 2 bins is pointless friction → `single-select`.
- **Never** use single-blank `fill-blanks` for an *estimated* answer (no single correct
  string exists) → `single-select`.
- `order` tiles show **expressions to solve** (`24 × 21`), never pre-computed products —
  that leaks the answer.
- Venn diagrams: **all regions populated.** Target the regions (overlap = AND, one-circle =
  AND-NOT), not "how many are blue" — that ignores the diagram entirely.
- Prompt order: **the question/expression first**, then the method/rounding instruction.
- **30 questions is a floor**, not a ceiling. Never drop supplied questions; generate to fill
  *interaction-type and misconception* gaps, not to pad the count.
- Distractors should target real misconceptions: place-value errors, dropped carries,
  wrong-operation results, no-shift errors.
- **Diversify the interaction mix.** If a lesson is drifting toward 60% single-select, that's
  a smell — flag it and vary it.
- Indian names (Priya, Arjun, Rohan, Diya, Meera, Kabir, Ananya). Currency ₹ unless the
  source doc says otherwise.

**Frontmatter defaults (apply silently)**
- `helper:` — for "known-fact scaffold" questions (`7+2=9 → 70+20=?`), put the base fact in
  `helper:` and keep the prompt to just the target problem. Renders a green "You know" chip.
  Applies to `fill-blanks` and `single-select`. **Never** on multi-select "select all".
- `layout: round-scaffold` — for two-operand "round each, then add/subtract" estimation.
  `fill-blanks` + `top: [a, b]` + `op: −` + `answer: [roundedA, roundedB, result]`.
  Prompt is plain text, no inline `[]`.

---

## Traps that have burned this project before

**The figure-in-prompt bug — the single most common authoring error.**
`<p class="prompt">` is **text only**. An `<svg>`/`<figure>` goes as a **sibling** after it.
Put one inside the prompt and it renders **twice** — and `build()` passes silently. It only
looks broken in a browser. Exception: SVGs inside `<li>` of `.options`/`.tiles`/`.palette`
belong to their tile and are fine.

**Dimension labels on a figure MUST be `<text class="dim-label">`.** `rao.css` auto-scales
each figure to a fixed box, stretching all its text with it, so the same `font-size="17"`
renders 18–32px across figures. The engine counter-sizes **only `.dim-label` text** back to a
constant on-screen px (`--rz-dim-px`, default 16 — sized to sit with the prompt text). Tag measurement labels (`20 m`, `? cm`);
leave region ids (`A`, `B`) and text meant to scale *with* its shape untagged.

**A figure `<svg>` needs `width`/`height` attrs, not just a `viewBox`.** With only a viewBox
it has no intrinsic size and balloons to the full card (~760px) — and **`npm test` passes**,
because it checks that a figure rendered, not its size. `rao.css` now pins
`.fig-wrap > svg:not([width])` to 150px as a safety net. The `:not([width])` is deliberate:
figures that DO carry `width`/`height` must keep their authored size — do NOT broaden it to
`.fig-wrap > svg` (that would crush every already-correct figure to 150px).

**Other landmines**
- `build()` silently **drops `<table>` tags** → use inline SVG for tabular stimulus data.
- `<` and `>` as `data-val` values break HTML parsing silently → use `lt`/`gt`/`eq` as keys
  with the glyph as display text.
- Duplicate `url(#id)` gradient ids across questions on one page silently break fills.
- The engine's CSS was a single packed string with literal `\n` escapes — never introduce
  real newlines into it.

**Answer keys**
- **Recompute every answer independently in Python before authoring.** Use `round_half_up`
  (not Python's banker's rounding) and `Decimal` for money. A wrong key is worse than a
  missing question — the engine will faithfully grade a correct child as wrong, forever, and
  every test will pass.

---

## Themes — the kid picks a colour

The app lets kids choose: `grape` (default) · `bubblegum` · `mint` · `sunshine` ·
`blueberry` · `cottoncandy` · `forest` · `rainbow`.

```html
<div class="rao-lesson" data-theme="mint"> … </div>
```

One attribute. Everything re-tints — no JS, no re-render. Each `--brand` is contrast-checked
so white button text clears 3:1 (some are a shade deeper than the picker swatch; the swatch
colour is preserved as `--swatch`).

⚠️ **Never put theme variables in an inline `style=` on the question container.** Inline
styles win the cascade and silently kill theming. `rao.css` supplies all defaults on `:root`.
Never re-pin `--brand` onto `.tile`/`.opt`/`.prompt` — a variable set *on* an element cannot
be overridden by an ancestor. That exact bug made theming impossible for months.

---

## Reading a Word doc (every question is a screenshot)

1. **Document order ≠ file order.** `image1.png` is not question 1. Map `rId` → media file
   via `word/_rels/document.xml.rels`, then follow `r:embed` order in `word/document.xml`.
2. **A blank-looking PNG usually isn't blank** — app screenshots are RGBA with art on a
   transparent layer. Flatten onto white before reading. Upscale 3–4× (LANCZOS) for legibility.
3. **The docs contain no written answers.** Work them out. **If you are not confident about
   any answer — STOP and ASK.** Present a short numbered list and wait. Never guess silently.

---

## Per-lesson workflow

1. Check `engine/preview-engine.js` `__version`.
2. Extract images in true document order; flatten and upscale.
3. **Verify every answer arithmetically in Python** before authoring any HTML.
4. Author the lesson → `lessons/<name>.html`. Vary the interaction types.
5. **`npm test`** → must be green.
6. **`node tools/make-review.js lessons/<name>.html`** → the page Venkat opens.
7. **`node tools/verify-format.js <name>`** → must be green. See the contract below.
8. If the engine changed: say so explicitly, and state the minimum version the lesson needs.
9. Venkat reviews the generated questions before finalisation.

---

## 🚨 THE REVIEW FORMAT CONTRACT — do not invent a review skin

**Venkat reviews questions by opening `review/<name>.html`. That page must look EXACTLY
like the app.** He is not proofreading a spec; he is playing the lesson. If the review
page shows a flat list of questions with the answer printed underneath, it is WRONG,
no matter how correct the content is.

Every question on a review page is a real, playable student card:

```
.pv-frame                     purple→pink gradient border
  .pv-card                    white rounded card
    .pv-head                  "Problem" label + progress ring (i/n)
    <the question>            real engine markup — clickable, typable, draggable
    .pv-hintbox               hint panel, hidden until Hint is pressed
    .pv-foot                  [Hint]  ……  [Check ✓]   + 🎉 Correct! / 🤔 Not quite
.pv-ans                       green "✓ Answer: …" line, BELOW the frame
```

**Rules:**

- **Never hand-write this chrome into a tool.** `tools/make-review.js` inlines the card
  design verbatim from two **real shared files** — `engine/rao-card.css` (the look) and
  `engine/rao-card.js` (the `card()` / `wireCard()` renderer). These are the same bytes the
  app ships; there is exactly ONE copy of the card in the system, so review and app cannot
  drift. (Both used to be scraped out of a reference lesson; now that lessons are content-only
  they are files — `rao-card.css` was promoted first, `rao-card.js` followed.)
- **Never introduce a parallel `.rv-*` / review-only card class.** `tools/verify-format.js`
  fails the build if it finds one. A review skin is how the format broke in the first place:
  a builder invented `.rv-card`, dropped the Check button, and printed the answer as text —
  producing an audit list instead of the app.
- **On Check, mark the OPTION, never the whole card.** `rao-card.js` adds per-option state
  (`.is-correct`/`.is-wrong`, etc.) and reveals the right answer; it must NOT box-shadow the
  `.pv-card` — the card wasn't wrong, the option was. Grading still passes if you flash the
  card, so **no test catches this**. Wrong-answer icon is 🤔, never a celebratory one.
- **The mount is the app's mount, not the legacy lesson's.** Mount into
  `<div id="preview" class="rao-lesson" data-theme="grape">`.
  The old lesson files instead hard-pin the theme as inline styles on `#preview`
  (`style="--brand:#7b5cff;…"`). That is the bug called out under **Themes** — inline styles
  win the cascade and kill `data-theme`. Those lessons predate `rao.css`. Do not copy it.
- **`.rao-lesson` is load-bearing, not decoration.** The engine writes an inline
  `min-height:var(--rz-card-floor,300px)` onto every `.qbody`. `rao.css` cancels it with
  `.rao-lesson .qbody{min-height:0!important}`. Drop the wrapper and *every* card — even a
  two-line multiple-choice — is padded to a 300px floor, and no theme works.
- A review page may add **one** thing a lesson does not have: a thin sticky summary bar
  (count · types · engine version) ABOVE the cards. It never reaches inside a card.

**`tools/verify-format.js` enforces all of this**: lessons are content-only and cannot
self-render, so it renders each lesson's `#source` THROUGH the shared pipeline (engine +
`rao-card.js`) into a temp page and compares it, card by card, to the on-disk `review/<x>.html`
— card skeleton, gradient/button paint, and Hint + Check + answer line. A mismatch means the
on-disk review is stale; regenerate with `npm run review`. Green means what you reviewed is
what ships.

---

## Working style

- **Do NOT prefix Bash commands with `cd "/c/Users/…" &&`.** The shell is already in the
  working directory. The `cd && …` pattern triggers a security prompt every time and is
  unnecessary. Use bare commands: `git status`, `npm test`, etc.
- **Never push without explicit instruction from Venkat.** Commits stay local until he
  says push. The post-commit auto-push hook has been removed for this reason.
- **Honesty about verification.** Never assert a check passed if it did not actually run.
  Say "I don't know." Label inferences as inferences. If context auto-compaction happens,
  announce it and re-read CLAUDE.md before continuing.
- **Every new guard must be proved to fail before it is trusted.** Break the CSS rule it
  protects, run the guard, show the FAIL output, then restore. A guard that cannot fail is
  worthless — same standard as the qbody work-panel proof.
- **When 3+ files share the same defect, fix the general case.** Write a batch script and
  sweep — do not process file by file. (Example: all 102 legacy lesson files had the same
  stale wrapper; a batch extractor handled them in one pass.)
- **When a test fails, investigate before blaming the test.** In this project, 3 "test
  heuristic" failures in `batch-validate.js` included a real authoring bug (14 questions
  with empty answer keys). The test was right; the content was wrong.
- Disclose bugs and self-corrections **explicitly and directly**. Do not bury them.
- Never re-litigate settled decisions.
- Engine fixes go **in the engine**, so every future lesson inherits them. Never patch around
  a problem per-lesson — that is exactly how drift started.
- Multi-seam engine edits (new type = TYPES set + builder + dispatch + BEHAVIORS + CSS) must
  be applied atomically, with `assert src.count(old) == 1` guards before touching the file.
- **Prefer NOT changing the engine.** Ask first: can this lesson be built with what the engine
  already does? A lesson file cannot break other lessons. **Only the engine can.** The safest
  engine is the one you don't touch. Batch engine changes; don't ship one per lesson.

---

## Settled — do NOT re-fix or revert (with the reason)

These look tempting to "fix" or "clean up." Each was decided deliberately; don't undo it.

- **Every type must appear in `lessons/_type-coverage.html`.** The harness once tested only the
  types present in real lessons, so a completely dead `time` behavior shipped as SAFE. Adding a
  new type without adding it to the fixture reopens that exact hole.
- **Don't "fix" these non-bugs:** `construct` self-grades geometry — `answer: []` is correct,
  not missing. And **the engine never computes answers** — it grades against the author's key,
  so there is no arithmetic for it to get wrong. Reports of "wrong arithmetic in the engine"
  are misreads of code that was never run.
- **Do NOT extract the dead-looking `MARKUP_STYLE_CSS` string from the engine.** Two surgical
  attempts corrupted the bundle, and its `:root` block is still live (bakes `var()` fallbacks
  into inline SVG so a host without `--brand` doesn't render figures black). ~2KB gzipped —
  not worth it. If ever revisited, rebuild the engine from source, don't string-surgery it.
- **Never reintroduce Google Fonts.** Fonts are self-hosted because Google Fonts breaks under
  CSP, offline, and on school networks — and fails *silently* to a system font that shifts the
  whole layout.
- **Do NOT rewrite the HTML authoring format as JSON.** Big rewrite of a working system; every
  real bug so far was fixable without it.
