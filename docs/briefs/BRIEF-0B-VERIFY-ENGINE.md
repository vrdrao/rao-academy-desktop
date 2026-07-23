# BRIEF-0B — VERIFY-ENGINE (READ-ONLY)

**Authored chat-side, 2026-07-20. Scope: Grade 4 only. `lessons-g3/` is out of
scope entirely.**

---

## 0. THIS BRIEF WRITES NOTHING

**You will not edit any file. You will not create any file. You will not stage,
commit, or push. You will not re-apply any patch.** This brief prints a report
and nothing else.

If you find a patch missing and the fix looks trivial, **do not apply it.**
Report it. Chat authorises fixes; this brief only measures.

If any step below appears to require a write, skip it, log
SKIPPED-WOULD-WRITE, and continue.

---

## 1. Why this brief exists

Two independent review findings point at the same suspicion:

- `review/number-patterns-word-problems-remix.html` Q1: a single-line
  fill-blanks sequence prompt renders small and left-aligned. The
  `qprompt-solo` patch should make exactly this case render at 1.55rem desktop
  / 1.35rem mobile, centred.
- `review/ordinal-numbers-to-100th_remix.html` Q6: sequence-build tiles render
  visibly larger than the 44px / 1.05rem the tile-sizing patches specify, and
  the empty slots do not match the filled tiles.

**Hypothesis: the repo's canonical engine has drifted from the patched engine
and is missing some or all of the nine inventory patches.**

That hypothesis may be wrong. **Measure it; do not assume it.** Prior work on
this repo has twice found the guessed cause was not the real cause, so treat
"the patch is missing" as a claim requiring evidence, not a starting point.

**Anti-laundering.** Report PRESENT, ABSENT, PARTIAL, or UNKNOWN. PARTIAL and
UNKNOWN are respectable answers and must be used where they are true. Do not
report PRESENT on the basis of a similar-looking rule; quote the actual code.

---

## 2. Files in scope

Read only. Print the resolved absolute path before reading each:

- `engine/preview-engine.js`
- `engine/rao.css`
- `engine/rao-card.css`
- `engine/rao-card.js`

Also print, for each: file size in bytes, line count, and last commit hash and
date touching it (`git log -1 --format='%h %ad' -- <path>`).

---

## 3. The nine patches to verify

For **each** patch below, print a block containing:

- patch number and name
- verdict: PRESENT / ABSENT / PARTIAL / UNKNOWN
- the evidence: the actual matching code, quoted verbatim, with file and line
  number — or, if ABSENT, the search terms you used that returned nothing
- if PARTIAL: precisely which half is present and which is missing

### Patch 1 — `helper:` frontmatter / known-fact scaffold
A `helper:` frontmatter line renders as a green "You know" chip above a centred
problem statement, for fill-blanks and single-select. Look for helper parsing in
`preview-engine.js` and a corresponding chip style in the CSS.

### Patch 2 — `qprompt-solo`
Single-line fill-blanks prompts with **no figure and no `.lbl` label** get the
prompt wrapper tagged `class="prompt qprompt-solo"`, rendering 1.55rem desktop /
1.35rem mobile, centred. Verify BOTH halves: the class being applied in the JS,
AND the CSS rule that sizes it. Report each half separately.

### Patch 3 — `order-slot` polish (two parts, report separately)
- 3a Overflow: `.order-slot` min-width computed from longest tile text via an
  `--ow` CSS variable; shape tiles keep a 58px floor.
- 3b Double-border: `.order-slot.filled { border-color: transparent;
  background: transparent; }`

### Patch 4 — `round-scaffold` layout
Fill-blanks with `layout: round-scaffold` renders a 5-column inline-grid:
original numbers on top, down-arrows beneath each, three blanks below.

### Patch 5 — drag ghost fix (`liftGhost`)
Pointer-drag clones snapshot computed paint properties (background, borders,
radius, box-shadow, colour, font, padding, filter, fill, stroke) as inline
styles onto the clone and all descendants. Must be present on **both** drag
paths: the shared tile drag in `startDrag`, and the venn/bins drag in
`vs-ghost`. **Report each path separately** — this patch is specifically
recorded as having been delivered in a prior chat and possibly never merged.

### Patch 6 — categorize tile affordance
Text categorize tiles get class `vs-text` plus a 6-dot grip SVG plus a `.vs-txt`
wrapper; shape tiles get `vs-shape`. CSS: white chip, border, radius, shadow,
brand mono bold, cursor grab, hover lift, and a `vs-nudge` load animation
running twice. Grip hidden on `.vs-fixed`.

### Patch 7 — order/sequence tile sizing
Shared `.tile` and `.order-slot` at **height 44px, font 1.05rem, padding
0 12px**. Print the actual current values for both selectors even if they
differ from these. If `.tile` and `.order-slot` disagree with each other,
say so explicitly — they are required to match.

### Patch 8 — categorize chip sizing
`.vs-text` at **font 1.05rem, padding 8px 13px**. Print actual values.
State whether `.vs-text` font-size equals `.tile` font-size.

### Patch 9 — delivery default
Not a code patch. Skip, and print "N/A — delivery convention, not code."

---

## 4. Task — targeted render measurement

For the two questions that triggered this brief, measure what actually renders.
Use Playwright at 1280px and 390px. **Read computed style via
`getComputedStyle`, not markup** — a class being present in the DOM is not
proof the rule applied.

Note: `.order-slot` carries `transition: border-color .15s`. Wait at least
250ms after any state change before reading computed style.

### 4a — `review/number-patterns-word-problems-remix.html` Q1
Print:
- the prompt wrapper's class list
- computed `font-size` and `text-align` of the prompt
- computed width and font-size of the answer blanks
- whether the question has a figure, and whether it has a `.lbl`

If `qprompt-solo` is absent from the class list, state whether the question
meets the patch's stated conditions (single-line, no figure, no label). That
distinguishes "patch missing" from "patch present but selector not matching" —
these are different defects with different fixes.

### 4b — `review/ordinal-numbers-to-100th_remix.html` Q6
Print computed height, font-size, and padding for:
- a filled `.tile` in the tray
- an empty `.order-slot`

State explicitly whether tile and slot match on height and font-size.

---

## 5. Task — geometry engine reconciliation (measurement only)

Venkat has ruled that the repo becomes the source of truth for
`raoGeoEngine.js`. **Do not move, copy, or create anything under this brief.**
Measure only:

- Does `engine/raoGeoEngine.js` exist in the repo? YES / NO
- Does `scripts/build-geo-engine.js` exist? YES / NO — the app's copy carries a
  header saying it is GENERATED by that script, so the generator's location
  matters
- Does any file in the repo reference `raoGeoEngine`, `RaoGeo`, or
  `window.RaoGeo`? List every hit with file and line
- How do review pages currently load engine files? Print the actual script tags
  from one generated review page
- Count the Grade 4 questions that render the "Geometry engine not loaded"
  fallback, and list the files containing them with per-file counts

---

## 6. Report back — enumerated, in this order

1. File inventory: paths, sizes, line counts, last-commit hashes (§2)
2. Nine patch verdicts with quoted evidence (§3)
3. A summary line: how many PRESENT / ABSENT / PARTIAL / UNKNOWN
4. Render measurements for 4a and 4b, both viewports (§4)
5. Geometry reconciliation findings (§5)
6. `git status` — **must show no modifications.** If it shows any, say so
   loudly at the top of the report.

## 7. Stop conditions

- Any step requiring a write: skip, log SKIPPED-WOULD-WRITE, continue.
- If a file in §2 does not exist, print that and continue with the others.
  Do not create it.
- Do not proceed to any other brief. When the report is printed, you are done.
