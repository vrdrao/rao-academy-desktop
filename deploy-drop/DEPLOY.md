# Deploying the Rao Academy engine (rao-master-20) to tulipmath.com

This folder is the complete engine drop for the app. It was built and verified
at repo commit `2366311` — every file here md5-matches the `engine/` sources of
that commit, and the full test suite ran green on that exact tree (118 lessons,
3,075 questions, all guards green, including the Robo suite). **Copy the files
exactly as they are. Never edit them by hand.**

New in this drop (rao-master-20):

- **"Try again" restores first-attempt state** (BRIEF FR-1) — when a child taps
  Try again after a wrong answer, the task returns to EXACTLY its first-attempt
  state for every behavior: no ✕ mark, no residual selection, no retained
  input, no moved tiles. Help (hint bubbles, walkthrough steps) accumulates and
  is never touched; attempt progress (the hint-ladder position, the
  "Walk me through it" offer) survives the reset.
- **Sequence-build tiles now drag on touch screens** (BRIEF CLEANSTART) —
  `.sb-tile` joined the `touch-action:none` rule in `rao.css`. Before this, a
  finger drag on a sequence-build tile scrolled the page instead of dragging
  the tile (tapping still worked). 31 Grade 4 questions affected.

---

## The one rule: ENGINE FIRST, LESSONS SECOND

Always put the new engine files on the site BEFORE importing any lesson.
Never the other way around, and never go back to an older engine. An old
engine cannot run new lessons — and it fails silently: the child just sees a
blank space where a question should be. No error appears anywhere.

---

## Step 1 — copy these files to the app's assets folder

Everything in this folder, keeping the `fonts/` subfolder together with
`fonts.css`:

```
preview-engine.js
rao.css
rao-card.css
rao-card.js
solution-renderer.js
robo.js
robo.css
fonts.css
fonts/            (all 8 .woff2 files)
```

## Step 2 — verify the copies (do not skip this)

After copying, check each file's fingerprint and size ON THE SERVER. If even
one does not match, the copy is corrupted or stale — recopy before going on.

| File | md5 fingerprint | size (bytes) |
|---|---|---:|
| `preview-engine.js` | `15c03853599f09627c063d5c3a43f55d` | 206,179 |
| `rao.css` | `38a925ccab9da0865d2d1784d8d7123c` | 90,880 |
| `rao-card.css` | `7d430f1871d851989e33898362cbd364` | 10,262 |
| `rao-card.js` | `184ce9423b59dc952ff856ec3317cef1` | 28,703 |
| `solution-renderer.js` | `0a17636d35a482cf82ebeaf65e65fa1c` | 15,207 |
| `robo.js` | `f137b5ff4f2774abfef1fe3ab4d96aba` | 51,393 |
| `robo.css` | `6b7336bf9f7a7ff872874e716631d715` | 51,183 |
| `fonts.css` | `84d7b35f3a39e180225c94059c921f68` | 9,756 |

(On most servers: `md5sum <file>` prints the fingerprint, `ls -l` the size.)

## Step 3 — the page must load ALL of them, in this order, with this mount

This exact block goes on every page that shows a question. The order matters,
and the `rao-lesson` wrapper is LOAD-BEARING — without it every question card
inflates to a 300px minimum height and the colour themes stop working:

```html
<link rel="stylesheet" href="fonts.css">        <!-- FIRST, before rao.css -->
<link rel="stylesheet" href="rao.css">
<link rel="stylesheet" href="rao-card.css">
<link rel="stylesheet" href="robo.css">         <!-- AFTER rao-card.css -->
<script src="preview-engine.js"></script>
<script src="solution-renderer.js"></script>    <!-- BEFORE rao-card.js -->
<script src="rao-card.js"></script>
<script src="robo.js"></script>                 <!-- AFTER the card renderer -->

<div class="rao-lesson" data-theme="grape">     <!-- LOAD-BEARING wrapper -->
  <!-- question cards render in here -->
</div>
```

Three easy mistakes this prevents:
- Skipping `solution-renderer.js` — the page still "works", but the hint
  bubbles and the step-by-step walkthrough silently disappear. It must load
  BEFORE `rao-card.js`.
- Loading `robo.js` before `rao-card.js` — Robo listens for the card's
  `rao:*` events; he must load AFTER the card renderer. His CSS loads after
  `rao-card.css`.
- Putting theme colours in a `style=` attribute on the wrapper — that kills
  the theme picker. The wrapper carries only `class="rao-lesson"` and
  `data-theme="grape"`.

**Robo and the child's name:** the app must set
`window.RaoAccount = { firstName: "<the child's first name>" }` at login.
If it does not, nothing breaks — but Robo's milestone praise (streak 3 and 5)
is silently nameless ("Nailed it! ⚡ 3 in a row!" instead of
"Nailed it, Priya! ⚡ 3 in a row!").

## Step 4 — only now import lessons

Lessons relying on the rao-master-20 reset behavior need engine rao-master-20
or newer. The live engine version is visible in the browser console as
`RaoPreview.__version`.

---

## THE GO-LIVE GATE (standing, deferred until a real URL exists)

The site is not verified until this command has been run against the REAL
live URL and printed all green. Do not consider the deploy done before it:

```
node tools/check-app.js https://www.tulipmath.com/<any-page-showing-a-question>
```

(Run from the rao-academy repo folder. Replace the address with the actual
page once it exists — the exact URL is still to be determined.)

It checks the five things that must ALL be true — engine loaded and version
matching, rao.css live, rao-card.css live, the load-bearing mount present,
and the real fonts resolving. Green means what Venkat approved in review/
is what a child will see. Anything else means DO NOT go live; it prints
the reason. (It does not yet probe Robo — after wiring, confirm the dock
appears and reacts on the live page by answering one question.)
