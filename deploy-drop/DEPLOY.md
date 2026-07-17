# Deploying the Rao Academy engine (rao-master-17) to tulipmath.com

This folder is the complete engine drop for the app. It was built and verified
at repo commit `a0b372f` — every file here passed the full test suite (104
lessons, 2,722 questions, all guards green). **Copy the files exactly as they
are. Never edit them by hand.**

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
fonts.css
fonts/            (all 8 .woff2 files)
```

## Step 2 — verify the copies (do not skip this)

After copying, check each file's fingerprint and size ON THE SERVER. If even
one does not match, the copy is corrupted or stale — recopy before going on.

| File | md5 fingerprint | size (bytes) |
|---|---|---:|
| `preview-engine.js` | `0fa5836f141c00d5e8dc551c02690961` | 196,698 |
| `rao.css` | `77fe771b3a6d38b55a737e6ea4588d2b` | 89,161 |
| `rao-card.css` | `7b7ef624505cfd99aac26bb5459b38ac` | 9,748 |
| `rao-card.js` | `aa1eba9b651b4e10564120eebb265784` | 26,399 |
| `solution-renderer.js` | `0a17636d35a482cf82ebeaf65e65fa1c` | 15,207 |
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
<script src="preview-engine.js"></script>
<script src="solution-renderer.js"></script>    <!-- BEFORE rao-card.js -->
<script src="rao-card.js"></script>

<div class="rao-lesson" data-theme="grape">     <!-- LOAD-BEARING wrapper -->
  <!-- question cards render in here -->
</div>
```

Two easy mistakes this prevents:
- Skipping `solution-renderer.js` — the page still "works", but the hint
  bubbles and the step-by-step walkthrough silently disappear. It must load
  BEFORE `rao-card.js`.
- Putting theme colours in a `style=` attribute on the wrapper — that kills
  the theme picker. The wrapper carries only `class="rao-lesson"` and
  `data-theme="grape"`.

## Step 4 — only now import lessons

Lessons using the calm card need engine rao-master-17 or newer. The live
engine version is visible in the browser console as `RaoPreview.__version`.

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
the reason.
