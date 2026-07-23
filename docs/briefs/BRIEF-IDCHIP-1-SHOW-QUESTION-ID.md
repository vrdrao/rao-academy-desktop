# BRIEF-IDCHIP-1 — SHOW THE QUESTION ID ON REVIEW PAGES

**Chat-authored. Guard-first. Review-tooling change. Small. No push.**
**Engine: rao-master-22 + BRIEF-TAP-1 + BRIEF-ID-1.**
**Corpus: 3,015 questions / 118 lessons, Grade 4 only.**
**`lessons-g3/` is out of scope and must not be touched, counted, or regenerated.**

---

## 0. WHY

BRIEF-ID-1 gave every question a permanent opaque id (`id: q7k2m9x4`), confirmed
present in the `#source` block and materialising as `data-qid` on the rendered
`.qbody` at runtime.

**Venkat reviews lessons visually and reports defects by description** — "the
drag question in the volume lesson", "Q14 with the horizontal expressions".
Descriptions are ambiguous, and question *numbers* are positional: they shift the
moment BRIEF-4 deletes anything.

**The id is the stable handle. It should be visible where he is looking, and
copyable in one click**, so a defect report can name `qpttuf3yn` exactly.

**Ruled (Venkat, 2026-07-20): both — a visible chip AND click-to-copy.**

---

## 1. THE HARD BOUNDARY

**This is a REVIEW-PAGE-ONLY affordance. It must never appear on the
child-facing card.**

Review pages are Venkat's instrument. The app is the child's. A nine-year-old
must never see `qpttuf3yn` on a maths question.

**Phase 0 must establish where the boundary actually lies in code** before
anything is written. If the chip cannot be added to review pages without any
possibility of reaching the app, **stop and report** — the design changes.

---

## 2. STANDING LAWS THAT APPLY

- **Guard-first, always.** Fixture demonstrating **FAIL before** and **PASS
  after**. Pre-fix RED and a sabotage round-trip are both required.
- **Visibility law.** The chip must be verified visible after a real render,
  inside its container and viewport, at **1280×800 and 390×844**.
- **No-repaint law.** The question DOM must not rebuild. The chip is additive.
- **Chase every changed number.** Corpus is **3,015**. This brief changes no
  questions. Any other count is a halt condition.
- **Measure, don't assume — including this brief's own premises.**
- **Anti-laundering.** Say **UNMEASURED** when it is unmeasured.
- **Never pipe a run in a way that masks output or exit code.**
- **Packed CSS caution:** verify via `getComputedStyle`, never markup.
- **Test discriminators must discriminate.**
- **Claude Code never pushes, never self-commissions, never writes handoffs.**

---

## 3. PHASE 0 — MEASURE (read-only, report, continue)

1. **Locate the `.q-counter` badge** (the `1/22` pill). It is **not** in
   `preview-engine.js` and **not** in `rao-card.js`. Report the file and line
   that generates it.
2. **Report the render path for a review page vs the app card.** Which file
   builds each? Is there a shared template, or two separate paths? **Name the
   exact seam** at which review-only markup can be added without any chance of
   reaching the app.
3. Confirm `data-qid` is present on the rendered `.qbody` for a review page, with
   a real `q********` value (BRIEF-ID-1 verified this in headless Chromium —
   re-confirm rather than assume).
4. Report whether any existing review-only affordance already exists (e.g. the
   `✓ Answer:` line under each card). **If one does, the chip should follow the
   same mechanism** — that is the proven seam.
5. Report whether review pages are generated per-lesson by `tools/make-review.js`
   and whether that tool has any test coverage today.

**If Phase 0 finds no clean seam, stop and report.**

---

## 4. PHASE 1 — THE GUARD, WRITTEN FIRST AND PROVED RED

Create `tools/verify-id-chip.js`.

Assertions, against a real regenerated review page, at **1280×800 and 390×844**:

1. **Every question card on the page shows an id chip.** Count of chips ==
   count of questions on that page.
2. **Each chip's text equals that question's `data-qid`**, and matches
   `^q[23456789abcdefghijkmnpqrstuvwxyz]{8}$`.
3. **The chip is visible** — non-zero box, inside its container, inside the
   viewport, at both viewport sizes. Verify via `getComputedStyle` and bounding
   rect, **never** by markup presence alone.
4. **The chip does not overlap the `.q-counter` badge** or any interactive
   control. Assert via bounding-rect intersection.
5. **Clicking the chip copies its text**, and a confirmation state appears.
6. **The chip is absent from the app card path.** Assert that the child-facing
   render produces zero id chips. **This is the most important assertion in the
   brief** — if the seam found in Phase 0 cannot support this test, stop.

**Run against the current tree. Assertions 1–5 must FAIL, assertion 6 must
PASS.** Report observed numbers. A guard that passes before the change is not a
guard.

---

## 5. PHASE 2 — THE CHIP

**Placement:** near the `.q-counter` badge, visually subordinate to it. The
counter is the child-facing element and stays primary; the chip is an
instrument.

**Appearance:** small, muted, monospace, low-contrast — it must not compete with
the question for attention. Reuse existing tokens (`--fm`, `--mute`, `--sub`)
rather than introducing new colours. **It must not look like part of the
question.**

**Behaviour:**
- Click copies the id to the clipboard via the async Clipboard API.
- A brief confirmation state (e.g. the chip reads `copied` for ~1s, then
  reverts). **The chip element must not be replaced** — mutate its text, per the
  no-repaint law.
- `cursor: pointer`, and a title/tooltip stating it copies.
- **Clipboard failure must not throw.** If the API is unavailable or denied,
  fall back to selecting the text and report nothing to the console. A review
  instrument must never break a review page.

**Mobile:** at 390px the chip must not push the counter out of the card or
overlap the prompt. If space is tight, the chip may shrink but must remain
legible and tappable at ≥44px in its clickable area.

**Scope discipline:** the chip is added at the seam identified in Phase 0 and
nowhere else. Do not add it to the engine's shared render path.

---

## 6. PHASE 3 — REGENERATE AND PROVE

1. **Regenerate all 118 review pages**: one
   `node tools/make-review.js lessons/<file>.html` call per lesson (19 in
   `lessons/` + 99 in `lessons/incoming/`). **`npm run review` does not exist as
   a sweep.**
2. **Guard now PASSES** assertions 1–5, and assertion 6 **still passes**.
3. **Sabotage round-trip, both disclosed with numbers:**
   - **A:** hide the chip via CSS → assertion 3 must re-fire.
   - **B:** make one chip render a stale/wrong id → assertion 2 must re-fire.
   - If either fails to re-fire, **say so with the numbers and strengthen the
     assertion**, as BRIEF-TAP-1 did with its hint-CSS sabotage.
4. **Non-regression, named individually:** `verify-tracked`, `verify-structural`,
   `verify-grading-node`, `verify-format`, `verify-question-ids`, `verify-touch`,
   `verify-reset`, `verify-drag`, `verify-venn`, `verify-categorize-tap`,
   `verify-colmath`.
   **Note:** `verify-format` compares class skeleton and paint. Adding a visible
   chip may legitimately change the fingerprint. **If it fires, do not tune the
   check to pass** — report it, state whether the change is intended, and stop
   for a ruling.
5. **Full `npm test`, unpiped, exit code reported.** Stage new guard files first
   — `verify-tracked.js` fails on untracked guards (this cost BRIEF-TAP-1 a
   re-run).
6. **Corpus count reads 3,015**, from the grading gate's own count.
7. **Wire `verify-id-chip.js` into `package.json`** — the full `test` script and
   a named `test:idchip` entry, matching the existing convention.

---

## 7. WHAT TO REPORT

1. Phase 0's five findings, especially **the seam** and how assertion 6 is
   satisfied by it.
2. Phase 1's pre-change failure, with observed numbers.
3. Phase 2's placement decision and how mobile was handled.
4. Phase 3: guard pass, **both sabotage results including any weak one**,
   `verify-format`'s behaviour, individually-named non-regression results,
   `npm test` exit code, corpus count.
5. Commit list, enumerated, **local only**.
6. Anything noticed but not acted on.
7. `git status --short`, confirmation nothing was pushed, `lessons-g3/`
   untouched.

**A correct stop is a success.**

---

## 8. WHAT THIS BRIEF DOES NOT DO

- It does not change any question, key, prompt, hint, or explanation.
- It does not change the engine's shared render path.
- It does not add anything to the child-facing card.
- It does not touch `lessons-g3/` or any `sources-g*/` directory.
- It does not refresh `deploy-drop/`.
- It does not push.
