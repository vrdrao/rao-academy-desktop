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
rendered, and checks all 8 themes re-tint. It takes ~12–15 minutes.

**Where it runs (since 2026-07-18, BRIEF-PRECOMMIT-SPEED):** the pre-commit hook runs a
fast ~1–2 min subset (`npm run test:fast` — Node-only grading of all 2,722 questions +
format/authoring guards); the **pre-push hook runs the FULL `npm test` and blocks the
push on any failure**. Same invariant, moved in time: nothing reaches origin without the
full suite green on that exact tree. Engine changes still warrant a full local `npm test`
before you rely on them — don't lean on the push gate to find out.

**`--no-verify` is FORBIDDEN.** git offers `git commit --no-verify` / `git push --no-verify`
as built-ins that skip these hooks. Never use either, never suggest either — a bypassed
gate is how silent breakage ships. If a hook seems wrongly red, fix the cause or ask Venkat.

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

- **Every executed brief file is committed to `docs/briefs/` as part of its own work's
  commit. Briefs are archived, never deleted — the paper trail outranks a tidy tree.**
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
  heuristic" failures included a real authoring bug (14 questions with empty answer keys).
  The test was right; the content was wrong.
- **Never launder an unknown into a "benign" label.** When a classification or code change
  affects a distractor that ALREADY had a code (a collision), STOP and print the collision
  explicitly: file, question, old code, new code. Never summarize it as "benign," "same
  pattern," or "wins" without showing the per-item list. The reviewer decides if it is
  benign, not the classifier. When a count does not match its predicted target (e.g.
  expected 96, got 78), STOP and print the exact rows causing the difference before
  proceeding. Do not explain the gap in prose and move on.
- **A harness that silently skips files is worse than no harness.** The harness used a flat
  `readdirSync("lessons/")` for ~95 sessions and silently tested 4 files while 105 sat in
  `lessons/incoming/`. Every "green" was a claim about 4% of the bank. **Assert the corpus
  size** (`MIN_LESSONS = 100`); do not assume discovery works. If the count drops, the
  harness is broken again and every "green" is a lie.
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

---

## 13. Solutions — the explanation system

**Read this before authoring or rendering any explanation. It is `rao-master-14`.**

A one-line `explain:` string is enough for "70 + 40 = 110". It is not enough for a five-step
Grade 8 solution, and it never will be. The fix is not a longer string — it is a **list of
typed blocks**. Adding a new kind of explanation later means adding one renderer, not
rewriting anything.

---

### 13.1 The grading firewall — the hardest rule in this file

**Rendering a solution must be structurally incapable of touching grading.**

```
grading module  →  produces an immutable result
                        ↓
question controller  →  passes that result, read-only
                        ↓
solution renderer  →  displays. Calls nothing. Mutates nothing.
```

The solution renderer must not import, call, or mutate anything in the grading path.
It must never call `check()`. It must never alter the stored answer or the student's response.

**This is enforced by four guards, not by good intentions.** See §13.7.

Every visual change to an explanation is a change that could silently corrupt grading.
That is why the firewall comes first and why it is guarded four ways.

---

### 13.2 The three-tier ladder

A child who got it wrong does not want the full solution. They want the smallest nudge that
lets them fix it *themselves*. Dumping six steps on them steals the win — and the win is the
whole product.

| Tier | Shown when | What it is |
|---|---|---|
| **Hint ladder** | Before checking, on demand | 1–3 rungs. Names the move. Never performs it. |
| **`whyWrong`** | On a wrong answer | One line about **the option they chose**. |
| **Walkthrough** | On demand ("Show me") | The full block list, revealed **one step at a time**. |

The walkthrough is never dumped. The child taps to advance. A **"I've got it — let me try
again"** button is present at every step, because bailing out early is exactly the moment
learning happens.

---

### 13.3 Hints — a ladder, with the leak rules intact

The single `hint:` becomes an optional list of 1–3.

```yaml
hint:
  - "Find the place you are rounding to."
  - "Look at the digit just to the right of that place."
  - "Round both numbers first, then add."
```

Each rung **names the move more specifically**. **No rung ever performs the move.**

A hint **never**:
- performs arithmetic on the child's numbers — ❌ *"689 is closer to 700 than to 600"*
- eliminates options
- states or restates the answer, including disguised ("it's 4 tens" for 40)

A ladder is *not* a slow reveal of the answer. It is three increasingly specific descriptions
of the strategy. If the last rung gives the answer away, the ladder is wrong.

A single string `hint:` remains valid forever and is treated as a one-rung ladder.

---

### 13.4 `whyWrong` — this is how §7's distractor rule becomes enforceable

§7 already says: *every distractor must be traceable to a specific misconception; never
invent a distractor to fill a slot.* Today that traceability lives nowhere. `whyWrong` makes
the author **write the misconception down** — and a guard then checks they did.

**Mandatory for every incorrect option of every `single-select` and `multi-select`.**
A distractor with no `whyWrong` is not a distractor. It is a slot-filler, and the lesson
fails validation.

```yaml
whyWrong:
  "30,937 + 97,021":
    code: sum-far-too-large
    message: "This pair rounds to about 130,000 — much more than 70,000."
  "92,327 + 49,921":
    code: first-addend-alone-too-large
    message: "The first number on its own is already close to 90,000."
```

- **Keyed by the literal option text** — the same key the engine already uses. (See §13.9
  for why not IDs.)
- **`code`** — a stable machine key. Never shown to a child. This is the analytics key: it
  is how the platform will one day know *what kind* of error a child made, not merely that
  they were wrong. It costs nothing to author now and cannot be retrofitted later.
- **`message`** — student-facing, one line.

#### Describe the option. Do not diagnose the child.

A tap proves what they picked. It does not prove why. Telling a nine-year-old confidently
what they were thinking, when it isn't what they were thinking, is corrosive.

- ✅ *"This estimate is too large — this pair is closer to 130,000."*
- ❌ *"You forgot to round the first number."*

Second person is permitted **only** when the option uniquely demonstrates that error, and the
author marks it `diagnostic: true`. A guard rejects "You forgot / You didn't / You added"
without that flag.

---

### 13.5 The block list

Four block types. **Four. Not ten.** More exist in the deferred list (§13.9) and are to be
built when a lesson actually needs one — one at a time, never speculatively.

| Type | Fields | Renders as |
|---|---|---|
| `step` | `goal`, `working`, `reason` — all optional | A numbered step card. `goal` = what we're doing. `working` = the maths, mono, large. `reason` = the why, small, muted. |
| `figure` | same SVG/`<figure>` handling as question figures | A diagram inside the solution. |
| `takeaway` | `text` | Highlighted band. **The generalisable rule.** Always last-but-one. |
| `verification` | `text` | "Does this answer make sense?" Sanity check. |

**`verification` is deliberately not called `check`.** `check()` is the grading function.
Reusing the word would weaken the vocabulary firewall in code, in logs, and in this file.

A `step` is **one meaningful change in the reasoning** — not one sentence.

Every block must have a **text fallback**. If a renderer dies, the child still sees the
working. This is cheap now and expensive to retrofit.

---

### 13.6 Authoring — the simple case stays simple

**The existing `explain:` string remains valid forever.** All 2,710 existing questions keep
working with zero migration and must render **byte-identical** after this change (§13.7).

Simple case — unchanged:
```yaml
type: fill-blanks
answer: ["110"]
hint: Round each number to the nearest ten, then add.
explain: 66 rounds to 70 and 39 rounds to 40; 70 + 40 = 110.
```

Full case:
```yaml
type: fill-blanks
answer: ["16000"]
hint:
  - "Find the place you are rounding to."
  - "Look at the digit just to the right of that place."
  - "Round both numbers first, then add."
explain: 9,827 rounds to 10,000 and 5,519 rounds to 6,000; the sum is about 16,000.
solution:
  - type: step
    goal: Round the first number.
    working: "9,827 → 10,000"
    reason: The digit to the right of the thousands place is 8, so round up.
  - type: step
    goal: Round the second number.
    working: "5,519 → 6,000"
    reason: The digit to the right of the thousands place is 5, so round up.
  - type: step
    goal: Add the rounded numbers.
    working: "10,000 + 6,000 = 16,000"
  - type: takeaway
    text: Round each number first, then add. Never add first.
  - type: verification
    text: The exact answer should land close to 16,000.
```

`explain:` stays as the **fallback and short summary** even when `solution:` is present. It
is what Rapid Fire shows. It is what renders if a block renderer fails.

**All solution data lives in frontmatter.** Never in `data-*` attributes on `<li>`. The
frontmatter is the source of truth (§8); splitting authoring across frontmatter *and* DOM
attributes recreates exactly the drift this project has spent ninety sessions fighting. The
engine already double-encodes entities in `data-val` — prose in a `data-` attribute walks
straight into that bug class.

**The DOM is an authoring format, not the internal model.** Parse frontmatter + markup →
one normalized object → render. One parse point, exactly as `sanitizeMarkup()` has one
emission point.

---

### 13.7 Guards — every one proved to fail

Per §2: a guard that has never been observed failing is faith, not a guard.

**Firewall guards (4):**

| Guard | Asserts | Proved by |
|---|---|---|
| Dependency | The solution renderer does not import/reference the grading module | Add the import → FAIL |
| Runtime | Opening, stepping through and closing a solution never calls `check()` (spy on it) | Call `check()` from the renderer → FAIL |
| Mutation | Rendering a solution cannot alter the stored answer or the student's response | Mutate the response object → FAIL |
| Source-diff | Solution work does not modify grading files without explicit authorisation | Touch a grading file → FAIL |

**SOURCE-DIFF escape hatch:** `FIREWALL_ALLOW_GRADING=1` overrides the source-diff guard
when a change legitimately needs to touch both solution and grading files (e.g. an engine
upgrade). It prints a **loud warning to stderr** naming every grading file being modified.
**Never set this without Venkat's explicit instruction.** If you think a change needs it,
STOP and ASK — explain which grading files and why.

**Content guards (4):**

| Guard | Asserts |
|---|---|
| Legacy snapshot | Every legacy string `explain:` produces **byte-identical renderer output** |
| Distractor coverage | Every incorrect option of every select question has a `whyWrong` entry |
| Key match | Every `whyWrong` key matches an actual option **exactly** — no orphans, no typos |
| Tone | No `message` opens with "You forgot / You didn't / You added / You should have" unless `diagnostic: true` |

Plus the existing hint leak test (§7), now run against **every rung** of every ladder.

#### Snapshot comparison — do it at the right layer

Browsers normalise whitespace, reorder attributes and re-encode entities. A DOM-serialisation
byte-compare produces false failures — and the "fix" for a false failure is always to loosen
the guard until it stops firing. That is how a guard dies.

- **Legacy `explain:` output** → capture the renderer's HTML string **before DOM insertion**.
  Byte-compare **that**.
- **Rendered pages** → screenshot comparison, representative question types.
- **Live DOM serialisation** → **never** used for byte-comparison.

---

### 13.8 Mode behaviour — one content, three timings

The content does not need three versions. The mode decides *when* it is shown.

| Mode | Behaviour |
|---|---|
| **Adaptive** | Full ladder. Hints on demand → `whyWrong` on a wrong answer → walkthrough on "Show me" → retry. This is where explanations live. |
| **Rapid Fire** | Correct/incorrect only. `explain:` one-liner, nothing more — speed is the point. **Log the `code`.** Solutions collected for end-of-round review. |
| **Quiz** | Nothing during. Full walkthroughs on the review screen after submission, with the child's answer shown beside the correct one. |

---

### 13.9 Deferred — and the trigger that un-defers each one

The schema **permits** these. **Build none of them** until the trigger fires. Building a
mature-platform architecture on Grade 4 estimation is how four months disappear.

| Deferred | Trigger to build it |
|---|---|
| Multiple solution paths ("Another way") | A lesson has a genuine second method worth teaching. Grade 4 estimation does not. |
| Block families 5+ (number line, place-value chart, bar model, ten-frame, algebra tiles, graphs, proofs) | **A specific lesson needs one.** Build that one. Not a library. |
| Grade-band renderers | A second grade band exists. |
| Interactive checkpoints inside a solution | Probably never in this form. A child who just got it wrong should not be able to fail *twice* on the same question. Offer a fresh similar question instead. |
| Ternary grading (`partially-correct`) | `check()` returns a boolean. Changing it goes through the firewall. Needs a separate, deliberate decision. |
| **Stable option IDs** for `answer` / `whyWrong` | **Localisation, or per-student option shuffling.** Neither exists. Adding a *third* keying scheme to an engine where mixing *two* is already a documented silent-bug generator (§8) is a bad trade today. Revisit when a trigger fires — this is a decision, not an oversight. |

---

### 13.10 Video — the escape hatch, not the goal

**Structured animation is the rule. Video is the exception.**

You cannot shoot 2,710 videos. You *can* author an animation in one line:

```yaml
- type: animate
  script: "move 8 counters · group into pairs · highlight no remainder · label even"
```

That is data. It is rendered by a component you own, it scales to the whole bank, and it is
re-styleable for free. A video file is none of those things.

When video genuinely earns its place (motion, narration, a construction that must be watched):

- **Never embed a URL per question.** The same "how to round" video will be referenced by 200
  questions. Re-shoot it and you would be editing 200 files.
- Videos are a **library keyed by concept**: `video: round-to-nearest-thousand`, resolved
  through a `concepts.json` registry to `{ src, poster, duration, title, captions, transcript }`.
- **A video is never the only explanation.** Captions, transcript, and a step summary beneath
  it are mandatory.

Build the registry when the first video exists. Not before.
