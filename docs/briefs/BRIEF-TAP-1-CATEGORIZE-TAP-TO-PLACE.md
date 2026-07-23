# BRIEF-TAP-1 — CATEGORIZE GETS TAP-TO-PLACE

**Chat-authored. Guard-first. Engine change. No push.**
**Engine: rao-master-22. Corpus: 3,015 questions / 118 lessons, Grade 4 only.**
**`lessons-g3/` is out of scope and must not be touched, counted, or regenerated.**

---

## 0. THE DEFECT, MEASURED

**Order questions and sequence-build questions support two-step tap-to-place.
Categorize questions (venn and bins) do not. They are drag-only.**

Same child, same lesson, two different rules for how a tile moves. On a phone,
drag is the most failure-prone interaction shipped: the hand covers the target,
there is no hover state on touch, and a slow press before the move is often
consumed as a page scroll.

### What order/sequence-build have (CONFIRMED by reading the mount)

`enableTileDrag(root, opts)` at `preview-engine.js:2163`. `opts.tapChoose`
defaults to **true** (line 2165: `opts.tapChoose !== false`). It provides:

- `armTile()` (:2208) — tap a tile, it gains `.armed`; every unfilled slot gains
  `.target-hint`. Tapping the armed tile again disarms it.
- `onSlotTap()` (:2215) — tap a slot, the armed tile is placed there.
- `handleTap()` (:2229) — tap a *placed* tile to send it home to the bank.
- `clearArmed()` (:2204) — one shared clear path.
- Drag is layered on top via `onPointerDown`/`onPointerMove`/`startDrag`, with a
  `MOVE_THRESHOLD` distinguishing a tap from a drag (:2191).

CSS for both states already exists in the engine's baked stylesheet and in
`rao.css`: `.tile.armed` (lift + glow + 3px ring) and `.order-slot.target-hint`
(pulse via `@keyframes slot-pulse`).

Bound at:
- `:2483` order → `enableTileDrag(root, {tileSelector:".tile", slotSelector:".order-slot", isReusable:false, bank})`
- `:2508` sequence-build → `enableTileDrag(root, {tileSelector:".sb-tile", slotSelector:".sb-slot", isReusable:pal.hasAttribute("data-reuse"), bank:pal})`

### What categorize has instead

A **separate, parallel** pointer implementation beginning at `:2515`
(`onDown` :2519, `startDrag` :2520, ghost class `vs-ghost`). It does **not** call
`enableTileDrag`. It has **no arm step, no target-hint, and no tap path.**

### The dead-code finding — this is the important part

`preview-engine.js:1475` defines `onTapTarget(e)`, which implements exactly the
missing behaviour: it reads `.vs-tile.vs-pick`, resolves the tapped
`.vs-zone`/`.bs-drop`/`.vs-tray`, and appends the picked tile into it.

**It is dead code.** Measured:

- `vs-pick` appears **exactly once** in `preview-engine.js` — inside
  `onTapTarget` itself. **Nothing ever adds the class.**
- `vs-pick` appears **zero times** in `rao.css`. There is no picked-state style.
- The line above it reads `/* merged: onTapTarget (from
  simple-fractions-parts-of-a-group-preview-engine.js) */` — it was merged in
  from another engine and never wired.
- It references bare `root` and `tray` identifiers that are not parameters of
  the function. **Whether it would even execute without a ReferenceError is
  UNMEASURED** — Phase 0 must determine this before any decision to reuse it.

**Do not assume `onTapTarget` is a working foundation.** It may be a usable
starting point or it may be broken; Phase 0 measures which.

---

## 1. STANDING LAWS THAT APPLY

- **Guard-first, always.** Every behaviour change gets a fixture that
  demonstrates **FAIL before** and **PASS after**. **Pre-fix RED and a sabotage
  round-trip are different proofs and both are required.**
- **Test discriminators must discriminate.** The guard must be verified against
  the exact scenario it claims to catch. If a sabotage does not re-fire the
  guard, **disclose that with its numbers** rather than presenting a clean
  result.
- **Touch testing uses real CDP touch events**, never mouse simulation.
- **Visibility law.** Every human-facing control verified visible after a real
  tap, inside its container and viewport, at multiple viewport sizes.
- **No-repaint law.** The question DOM must never rebuild mid-session.
- **Fix the general case, not the file.**
- **Measure, don't assume — including this brief's own premises.** §0 was
  measured against the *project mount*, a manual copy. If the repo differs,
  **report the difference and measure the repo.** The repo is truth.
- **Anti-laundering.** Say **UNMEASURED** when it is unmeasured.
- **Chase every changed number.** The corpus is **3,015**. This brief changes
  no questions, so it must still read 3,015 at the end. **Any other value is a
  halt condition.**
- **Never pipe a run in a way that masks output or exit code.**
- **Packed CSS caution:** `rao.css` and `MARKUP_STYLE_CSS` contain packed
  one-line blocks. Verify via `getComputedStyle`, **never** by reading markup.
- **Claude Code never pushes, never self-commissions, never writes handoffs.**

---

## 2. PHASE 0 — MEASURE BEFORE CHANGING (read-only, report inline, continue)

1. Confirm §0 against the **repo** engine: line numbers for `enableTileDrag`,
   its `tapChoose` default, the categorize `onDown`/`startDrag` block, and
   `onTapTarget`. Report any drift from §0.
2. **Count `vs-pick` occurrences** in the repo engine and in `rao.css`. Confirm
   or refute the dead-code finding.
3. **Determine whether `onTapTarget` is reachable and whether its `root` and
   `tray` identifiers resolve.** Is it referenced by any listener registration
   anywhere? Report: reachable / unreachable, and resolvable / ReferenceError.
4. **Count the affected questions.** How many questions corpus-wide are
   categorize type? Break down venn vs bins. This is the blast radius.
5. Report whether categorize tiles are ever reusable (a tile placed in more than
   one zone), analogous to `isReusable` in `enableTileDrag`. Serialization at
   `:2512` maps each `.vs-tile[data-idx]` to exactly one `.vs-zone`, which
   suggests **not** reusable — confirm rather than assume.

**Report these five findings and continue to Phase 1.** No halt unless Phase 0
contradicts §0 so severely that the design below cannot apply — in which case
**stop and report**.

---

## 3. PHASE 1 — THE GUARD, WRITTEN FIRST AND PROVED RED

Create `tools/verify-categorize-tap.js`. It must fail against the **current**
engine before any fix is written.

Using Playwright with **real CDP touch events**, on a real categorize question
(one venn, one bins — name both in the report), at **390 × 844** and
**1280 × 800**:

1. **Tap a tray tile.** Assert it enters a visible picked state — a class is
   applied AND `getComputedStyle` shows a difference from resting state.
2. **Assert the valid drop targets become visibly hinted** while a tile is
   picked, and that the hint clears when the tile is disarmed or placed.
3. **Tap a target zone.** Assert the tile MOVES into that zone — present in the
   target, **absent from the tray**. (Drag-means-MOVE was established by BRIEF-3
   Item C; tap must not regress to copy semantics.)
4. **Tap the picked tile again.** Assert it disarms and no zone stays hinted.
5. **Tap a placed tile.** Assert it returns to the tray and the zone no longer
   holds it.
6. **Assert serialization still round-trips**: `serialize(root)` (:2512) must
   return the same shape after a tap-placement as after a drag-placement.
7. **Assert drag still works unchanged** — the existing drag path must not
   regress. This is a non-regression assertion, not a new behaviour.
8. **Visibility:** the picked tile and every hinted zone must be verified
   visible inside their container and the viewport at both sizes.

**Run it against the unmodified engine. It must FAIL.** Report which assertions
fail and the actual values observed. **A guard that passes before the fix is not
a guard — if that happens, stop and report.**

---

## 4. PHASE 2 — THE FIX

**Preferred approach: make categorize use the same machinery as order.**

The categorize pointer block (:2515+) duplicates what `enableTileDrag` already
does. If categorize can be bound through `enableTileDrag` with
`tileSelector: ".vs-tile[data-idx]"` and a zone-appropriate `slotSelector`, the
arm/hint/tap behaviour arrives for free, one implementation serves all three
question types, and future fixes land once instead of twice.

**But `enableTileDrag` assumes one tile per slot** (`.filled` gating,
`nextEmptySlot()`), while categorize zones hold **many** tiles. That assumption
may not bend cleanly.

**So this is a measured decision, not a mandate:**

- **Phase 2a — assess.** Determine whether `enableTileDrag` can serve categorize
  without weakening its behaviour for order and sequence-build. Report the
  specific incompatibilities found, with line references.
- **Phase 2b — choose and state why.** Either (i) bind categorize through
  `enableTileDrag`, extending it in a way that leaves order and sequence-build
  behaviourally identical, or (ii) implement arm/hint/tap **within** the
  categorize block, reusing `onTapTarget` if Phase 0 found it viable, or
  rewriting it if not. **Option (i) is preferred. Option (ii) is acceptable
  with a stated reason.** Do not pick (ii) merely because it is quicker.

**Whichever path:**

- Drag must remain fully functional. Tap is **added**, not substituted.
- Tap must MOVE, never copy, unless Phase 0 proved categorize tiles reusable.
- The picked state and the zone hint need CSS. `.tile.armed` and
  `.order-slot.target-hint` already exist — **reuse those visual treatments** so
  a child sees the same language across all three question types. Add the
  categorize equivalents to **both** `rao.css` and the engine's
  `MARKUP_STYLE_CSS`, since both load on both surfaces (BRIEF-MOBILE-1A §3).
- **If `onTapTarget` is not used, delete it.** Leaving dead code that looks like
  a working feature is how this defect stayed invisible.

**Halt condition:** if making categorize share `enableTileDrag` would change
order or sequence-build behaviour in any way a guard can detect, **stop, report
the specific conflict, and do not proceed** — that is a design ruling for chat,
not an implementation choice.

---

## 5. PHASE 3 — PROVE IT

1. **Run the Phase 1 guard. It must now PASS**, all assertions, both viewports.
2. **Sabotage round-trip.** Remove the arm step. Confirm the guard re-fires.
   Then remove only the hint CSS. Confirm what happens. **Report both results
   honestly, including any sabotage that fails to re-fire the guard**, with the
   numbers.
3. **Non-regression:** run `tools/verify-touch.js`, `tools/verify-reset.js`, and
   any existing order/sequence-build guard. All must pass. Report names and
   results individually — **not a single aggregated "green".**
4. **Full `npm test`, unpiped, exit code reported.**
5. **Corpus count must read 3,015.** Report the number and its source.

---

## 6. WHAT TO REPORT

1. Phase 0's five findings, including the `onTapTarget` verdict.
2. The Phase 1 guard's **pre-fix failure**, with observed values.
3. Phase 2's path choice and the reasoning, with the incompatibilities found.
4. Phase 3's guard pass, **both sabotage results including any weak one**, the
   individually-named non-regression results, `npm test` exit code, and the
   corpus count.
5. The commit list, enumerated, **local only**.
6. Anything noticed but not acted on.
7. `git status --short` and confirmation that nothing was pushed and
   `lessons-g3/` was untouched.

**A correct stop is a success.** Where something could not be measured, say
**UNMEASURED**.

---

## 7. WHAT THIS BRIEF DOES NOT DO

- It does not change any question content, key, or prompt.
- It does not add feedback, verdicts, or per-tile grading — that is FEEDBACK-1.
  (Item 32 remains open and is **not** in scope here.)
- It does not touch the tray's dashed-outline-when-empty defect (HANDOFF-29
  item 20).
- It does not regenerate review pages. Chat will authorise that separately after
  auditing this report.
- It does not push.
