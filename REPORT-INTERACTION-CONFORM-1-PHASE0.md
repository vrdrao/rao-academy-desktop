# REPORT-INTERACTION-CONFORM-1 — Phase 0 (Recon, no edits)

Run 2026-07-23. Grade 4 corpus only (`lessons/` + `lessons/incoming/`).
`STUDENT-INTERACTION-RULES.md` read first; it is the authority.

No discrepancy found between that file and this brief. One incidental note: a
stray untracked duplicate `STUDENT-INTERACTION-RULES (1).md` exists (7,732 B vs
the canonical 16,447 B) — an older partial download, NOT referenced by the brief.
It creates no authority conflict (the brief names the non-`(1)` file) but should
be deleted in a later housekeeping pass. **Nothing changed this phase.**

---

## 0.1 — HEAD and unpushed state

```
$ git log --oneline -1
1d50f07 BRIEF-RETRY-STATE-2: retry-state engine pass (#88 #111 #84 #85 #109)

$ git log --oneline origin/main..HEAD
1d50f07 BRIEF-RETRY-STATE-2: retry-state engine pass (#88 #111 #84 #85 #109)

$ git status -sb | head -1
## main...origin/main [ahead 1]
```

**Confirmed.** HEAD is `1d50f07` (not "or later" — exactly it), and it is unpushed
(ahead 1). Working tree has one modified tracked file
(`review/compare_numbers_up_to_five_digits.html`) plus many untracked briefs/reports;
none touched by this phase.

---

## 0.2 — Item 1, the red box

**Where the wrong-styling is applied.** `markFeedback()` in `engine/rao-card.js`
— the function begins at **line 695**, not 699. Line 699 is the `norm` helper
inside it. The Atlas's "~699" pointed at the right function.

The painter has **two** relevant per-input branches, and they behave differently:

- **`fill-blanks` (rao-card.js:714–720)** — the ~121-question population:
  ```js
  var right = u[i] === ans[i];
  ...
  else if (!right) inp.classList.add("incorrect");   // the red tint
  ```
  This is **RAW string equality with ZERO normalisation** — not even the
  whitespace-strip the Atlas described. `u[i]` is the child's serialized digits
  (`"42,613"`), `ans[i]` is the key (`"42613"`); they are unequal, so `incorrect`
  (red) is added even though the grader passed the answer.

- **`expression` (rao-card.js:730–736)** — the 6 typed-expression questions:
  ```js
  var norm = function (s) { return String(s).replace(/\s+/g, "").toLowerCase(); };
  var right = norm(u[i]) === norm(ans[i] || "");
  ```
  This strips whitespace + lowercases only. It accepts spacing differences but
  **not** commutative addition, so `16+31=47` against a `31+16=47` key normalises
  to two different strings → `incorrect` (red).

**What the grader does** (`check()` in `engine/preview-engine.js:2819`):

- `fill-blanks` (2861–2876) strips commas **when they form a valid grouping** —
  Western `/^\d{1,3}(,\d{3})+$/` and Indian `/^\d{1,2}(,\d{2})+,\d{3}$/` — then
  exact-matches. So `42,613` and `1,00,000` grade **correct**. A misplaced comma
  (`4,2613`) matches neither pattern, is left intact, and stays wrong (the
  sabotage guard).
- `expression` (2837–2860) whitespace-strips + lowercases, then accepts a
  commutatively-restated **addition** sum (`a+b=total`, addends sorted; operator
  allowlist `{+}` only). So `16+31=47` grades **correct**.

Both were taught these forms on 2026-07-23 (BRIEF-RETRY-STATE-2, #84 and #109).

**Verdict on the Atlas account: CONFIRMED in substance, CORRECTED in one detail.**
The grader learned comma/Indian/commutative forms; the painter did not — exactly
as the Atlas said. But "the painter normalises with whitespace-strip only" is
precise only for the **expression** path. The **fill-blanks** path — where all
~121 comma cases live — does a **raw exact-match with no normalisation at all**.
Neither painter branch consults the grader's comma/commutative logic; that is the
root defect and it is a **duplicated-logic drift** (Phase 2 item-1's warning: a
second copy of the normaliser drifted from the first).

---

## 0.3 — Item 2, multi-select tick

**What happens to a correctly-picked option after a wrong Check.** On a wrong
attempt the select branch runs (rao-card.js:517):
```js
if (isSelect) { markWrongSelections(); clearSelection(); }
```

- `markWrongSelections()` (273–294) walks `.is-sel` options. For a **correct**
  pick it hits `if (ans.indexOf(val) !== -1) continue;` (line 279, "ruling 2:
  correct selections stay unmarked") → it gets **no ✕, no `cc-tried`**. Wrong
  picks get `.cc-tried` + a `.cc-x` (✕) glyph.
- `clearSelection()` (299–304) then removes `.is-sel` from **every** selected
  option — including the correct one (line 301).

**Net effect:** a correctly-picked option ends the wrong attempt with (a) no ✕
because ruling 2 skipped it, and (b) no `.is-sel` because `clearSelection()`
stripped it. It is now visually **identical to an option the child never
touched**. The child cannot tell what they got right. This is the reported
defect and it violates rule 12.

**Code path:** `wireCard` wrong-attempt branch (`rao-card.js:517`) →
`markWrongSelections()` `continue` at :279 → `clearSelection()` at :301.

---

## 0.4 — Item 4, the explain line (report only, nothing changed)

**Every place `explain` is produced, stored, rendered, or referenced:**

Produced / parsed / carried (engine, `preview-engine.js`):
- `:1653–1656` — parse from markup `block(content,"explain")` OR frontmatter
  `fm.explain`; also builds `help = <p>${explain}</p>`.
- `:1926–1929` — **the rendered line**: `_explainHtml = explain ? '<p class="explain">'+explain+'</p>' : ""`, appended into the card `inner`.
- `:1995`, `:1994` — regex that strips `class="explain"` prose from the
  description/plain-text extraction (search-index hygiene, not display).
- `:2064`, `:2129` — `explain` carried on the returned build object (and the
  null-default degrade path).
- `:2912` — `explain:item.explain||null` passed through the second build path.

Rendered / revealed (CSS, `rao.css`):
- `:640` — `.explain{display:none;…}` base (hidden by default).
- `:649` / `:653` — hidden in rapid / adaptive by default.
- `:654` — **`[data-mode="adaptive"].is-checked .explain{display:block}`** — the
  reveal-on-Check that rule 13 removes.
- `:665–666` — quiz mode (hidden during, shown on `.is-review`).
- `:688` — dark-theme styling.
- `:1058–1061` — **`[data-mode="rapid"].is-checked .explain{display:block}`** —
  Rapid-Fire reveal.

Sealed-when-walkthrough (CSS, `rao-card.css`):
- `:137–138` — `.cc-hastake .explain{display:none}` (once a walkthrough taught,
  the duplicate line is suppressed).

Read / reused (renderer, `rao-card.js`):
- `:137,140–141` — reads `.explain` element's innerHTML into an `explain` var.
- `:348,351,355` — passes `explain` to `RaoSolution.renderWalkthrough(...)` and
  sets `cc-hastake`.
- `:402,414,489–490,626` — comments/logic gating the `.explain` reveal on
  `is-checked` / sealing it while attemptable.

Fallback consumer (`solution-renderer.js:13–14`) — a legacy string `explain`
normalises to a single walkthrough block; the renderer never sees the raw string
except as that fallback.

Tools referencing `explain` (not display, for Phase-2 awareness): `tools/
capture-explain-baseline.js`, `tools/explain-baseline.json` (the legacy
byte-identical snapshot), plus `verify-snapshot.js`, `verify-calm.js`,
`verify-structural.js`, `verify-content-guards.js`, `verify-solpanel.js`,
`verify-panel-layout.js`, `verify-retry-state.js`, `verify-firewall.js`,
`verify-answerable.js`, `verify-misconception-coverage.js`, `classify-
distractors.js`. Authoring docs: `CLAUDE.md` §13.6, plus `docs/briefs/*` history.

**Important distinction for Phase 2 (report only):** `explain` has TWO consumers —
(a) the **`<p class="explain">` line revealed on Check** (what rule 13 removes),
and (b) the **walkthrough fallback** in `rao-card.js`/`solution-renderer.js`.
Item 4 removes (a). Whether (b) is retained is a Phase-2 decision, flagged here
only.

**Count of lesson questions carrying a non-empty `explain`: 2,454, across 99 of
103 files** (command in §0.6). This is the orphaned-field population to be handed
to a later content brief — the brief forbids stripping them here.

---

## 0.5 — Item 5, ordering

**How an ordering answer is compared to its key today.** `order` and
`sequence-build` fall through to the default branch of `check()`
(`preview-engine.js:2877`):
```js
return user.length === correct.length && user.every((v, i) => v === correct[i]);
```
Element-wise position compare. `serialize()` for `order` (`:2524`) reads each
`.order-slot.filled .tile` in slot order and returns its `dataset.val`;
`sequence-build` (`:2531`) reads `.sb-slot.filled .sb-tile` likewise.

**Is per-tile correctness already computed internally?** Transiently, yes — the
`.every((v,i) => v === correct[i])` callback evaluates each tile's correctness —
but the result is **collapsed into a single boolean and discarded**; nothing
retains or exposes per-tile verdicts.

**What the painter does today** (`markFeedback`, rao-card.js:738–745): marks the
whole `.order-slots` / `.sb-slots` **container** `correct`/`incorrect`. No
per-tile marking exists.

**Is the fix display-only? YES.** Every input the fix needs is already in the
DOM + build output: the child's placed tiles carry `dataset.val` per slot
(`.order-slot.filled .tile`), and `answer[i]` is the correct val for slot `i`.
The painter can recompute `slotVal === answer[i]` per slot and tint only the
misplaced tiles — no grading change, no serialize change, no engine-behaviour
change. **Display-only.** And because rule 14 forbids revealing the correct
order, the fix must mark misplaced tiles **without** moving them or showing where
they belong.

---

## 0.6 — Population counts, each with its command

All counts produced by one Node script that builds every lesson through the real
`RaoPreview.build()` (same `#source` scoping + same `collectLessons()` recursion
+ same `MIN_LESSONS=100` corpus as `tools/verify-grading-node.js`). Script:
`scratchpad/recon-count.js`. Command: `node scratchpad/recon-count.js`.

```
=== CORPUS ===
files discovered: 103   built: 103   buildFails: 0
total questions: 2668

=== BY BEHAVIOR ===
  bar-graph: 3      categorize: 152   construct: 31     expression: 6
  fill-blanks: 576  lattice: 1        line-plot: 33     multi-select: 169
  order: 141        sequence-build: 31 single-select: 1511  time: 14

=== POPULATIONS ===
fill-blanks total:                                    576
fill-blanks RED-BOX susceptible (answer has 4+ digit int): 121  across 22 files
expression (typed) total:                             6
multi-select total:                                   169
order total:                                          141
sequence-build total:                                 31
order + sequence-build:                               172
questions carrying explain:                           2454  across 99 files
```

**Mapping to the brief's four requested counts:**

| Requested | Count | Definition used |
|---|---|---|
| fill-blanks affected by the red box | **121** (+ **6** typed expressions) | fill-blanks whose key holds a 4+-digit integer (comma grouping is possible → painter's raw match can disagree). Matches the rules doc's "~121 fill-blanks plus every typed expression" exactly. |
| multi-select questions | **169** | `behavior === "multi-select"` |
| ordering/sorting questions | **141 order** (+ **31 sequence-build** = **172**) | rule 14 says "ordering **and sorting**"; `order` is the primary target, `sequence-build` is the sister drag-into-slots type. Flagging both — Phase 1/2 should confirm whether rule 14 covers `sequence-build` too, or `order` only. |
| questions carrying `explain` | **2454** across 99 files | `q.explain` non-empty after build |

**One judgement call flagged for the gate:** whether item 5 / rule 14 covers
`sequence-build` (31 q) in addition to `order` (141 q). Rule 14's title says
"ordering **and sorting**" and its worked example is an `order` question. Both
share the identical slot/tile/`dataset.val` structure, so the fix is mechanically
the same. I have **not** assumed the answer — Phase 1 guards should be told which.

---

## Summary for STOP GATE 1

- **0.1** HEAD `1d50f07`, unpushed (ahead 1). ✔
- **0.2** Red box confirmed. Painter (`markFeedback`, rao-card.js:695) never
  learned the grader's comma/commutative forms. Correction to the Atlas: the
  fill-blanks branch does **raw exact-match, no normalisation** (not
  whitespace-strip); only the expression branch whitespace-strips. Root cause is
  duplicated normalisation that drifted. Fix must share one source of truth.
- **0.3** Multi-select confirmed. `clearSelection()` (rao-card.js:301) strips
  `.is-sel` from the correct pick, which `markWrongSelections()` deliberately left
  unmarked (:279) → correct pick becomes indistinguishable from never-chosen.
- **0.4** Explain line fully mapped (engine render at preview-engine.js:1928;
  CSS reveals at rao.css:654 adaptive + :1061 rapid). **2,454** questions across
  **99** files carry an `explain` — the orphan population for a later content
  brief. Nothing changed.
- **0.5** Ordering compared element-wise (check() default branch); per-tile
  verdict is computed-and-discarded. All inputs present in the DOM → fix is
  **display-only**. Must not reveal correct order (rule 14 / rule 6).
- **0.6** Counts above, each traceable to `node scratchpad/recon-count.js`.
  Red-box **121** matches the rules doc to the digit.

**Open question raised, not resolved:** does rule 14 cover `sequence-build` (31 q)
or `order` (141 q) only?

Awaiting instruction to proceed to Phase 1.
