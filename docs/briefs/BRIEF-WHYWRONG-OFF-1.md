# BRIEF-WHYWRONG-OFF-1

Ruled by Venkat 2026-07-24. Chat-authored. One issue, one brief.

## THE RULING

**The whyWrong feature is switched OFF product-wide.** No child ever sees a
whyWrong bubble or panel again, in any mode.

- Reason: 1,365 of 1,674 select questions have no authored whyWrong and there is
  no bandwidth to write them. A feature that fires on 309 questions and stays
  silent on 1,365 is an inconsistent experience. Off everywhere beats half-baked.
- **Option A ruled: HIDE, do not delete.** Authored whyWrong content stays in the
  lesson files untouched — zero lesson-file edits in this brief. The `nothing is
  deleted, everything moves` law applies. If Venkat ever reverses this, the
  content is still there.
- The invisible analytics stream (`rao:whywrong` event + `__raoWhyWrongLog`)
  **keeps firing** — no child sees it, and the data may matter later. Only the
  VISIBLE surfaces go dark.
- The resulting child experience is the one 1,365 questions already have today:
  wrong answer → ✕ marks → first hint types automatically → "Try again"
  (or the two-attempt cap commits as it already does). **No new behaviour is
  being designed.** We are routing 309 questions onto the proven majority path.

## PHASE 0 — DISCOVERY (read-only, report before editing)

Chat measured the PROJECT COPIES of the engine; the REPO is canonical. Verify
against the repo before trusting any line number below.

1. Enumerate every place whyWrong text can reach a screen. Chat found exactly two
   in `engine/rao-card.js`:
   - **Calm path:** inside the wrong-answer flow, the branch beginning
     `var msg = entry && entry.message ? ...` which types the `.cc-msg-why`
     bubble with the "Not quite" chip (~line 558–572 in the project copy).
   - **Degraded/non-calm path:** `if (mode === "adaptive") showWhyPanel(frame, entry);`
     (~line 671) and the `showWhyPanel` / `.pv-why` machinery it drives.

   Grep the repo (`engine/`, `tools/`, robo files, solution-renderer) for any
   OTHER visible render of whyWrong content (`cc-msg-why`, `pv-why`, `whyWrong`,
   `data-why`, `lookupWhy`, `showWhyPanel`). Also check whether ANYTHING listens
   to `rao:whywrong` and reacts visibly (chat found no listener in the project
   copies of robo.js / preview-engine.js / solution-renderer.js).
   **STOP-GATE: if a third visible surface or a visible `rao:whywrong` listener
   exists, halt and report before editing anything.**

2. Enumerate every test assertion that requires a whyWrong bubble/panel to
   APPEAR. Known from the issue log: `verify-retry-state.js` G2 and G12,
   `verify-reset.js` law-4 amendments (hint-visible / whyWrong-hidden), possibly
   `verify-solpanel.js`. Grep `tools/` for `cc-msg-why`, `pv-why`, `whyWrong`.
   Report the full list with one line each on what it currently asserts.

## PHASE 1 — GUARD FIRST (must be SEEN FAILING before any engine edit)

New guard `tools/verify-whywrong-off.js`, registered in `test` and `test:fast`:

- Fixture: a question WITH an authored whyWrong entry (reuse an existing fixture
  question that has one, or plant one in the fixture file — NOT in a lesson).
- Drive a wrong answer that matches the authored option, in calm mode.
- **Assert: no `.cc-msg-why` bubble ever appears** (not merely hidden — never
  created/typed), the hint fallback fires instead (a "Hint 1" bubble types), and
  the `rao:whywrong` event still fires (analytics preserved).
- Also drive the degraded adaptive path: **assert `.pv-why` never shows.**
- Run it against the CURRENT engine → it must FAIL. Record the failing output.

## PHASE 2 — THE ENGINE CHANGE

One named switch at the top of `engine/rao-card.js`:

```
var WHYWRONG_VISIBLE = false; // RULED OFF by Venkat 2026-07-24 (BRIEF-WHYWRONG-OFF-1).
                              // Authored content retained in lessons; analytics event still fires.
                              // Do not re-enable without a new dated ruling.
```

Gate BOTH visible surfaces on it:

- Calm path: when `WHYWRONG_VISIBLE` is false, skip the `msg` bubble branch
  entirely so the flow falls through to the existing no-whyWrong logic
  (`capped → commitCap()`, else `giveHint(...)`, else `feedbackRow("Try again")`).
  Do NOT restructure that fallback — it is the proven path.
- Degraded path: gate the `showWhyPanel` call the same way.
- The `rao:whywrong` dispatch and `__raoWhyWrongLog` push are NOT gated — they
  stay exactly as they are, in both paths.
- No-repaint / append-only laws are untouched: nothing is removed from the DOM
  because nothing is created in the first place.

Phase 1 guard must now PASS.

## PHASE 3 — AMEND THE EXISTING GUARDS (each proved to bite)

For every assertion found in Phase 0.2 that requires a whyWrong bubble to
appear (G2, G12, verify-reset law-4, and any others found):

- Invert/amend to the new truth: **the whyWrong bubble never appears in any
  state.** Where a guard tested "appears, then hides on retry/new-selection",
  the amended guard asserts "never appears at all" (a strictly stronger claim);
  hint-bubble survival assertions stay as they are.
- Every amendment carries a dated comment naming this brief and the ruling —
  the #118 pattern, so the old behaviour is never "restored" from a stale note.
- **Prove each amended guard bites:** temporarily set `WHYWRONG_VISIBLE = true`
  → the amended guards must FAIL → restore `false` → all green. Record this.

## PHASE 4 — REGENERATE `review/`

Review pages inline the engine, so all lesson review pages must be regenerated
or Venkat's own preview will still show the old behaviour.

- **Precondition (#117 workaround):** verify the working-copy engine files are
  byte-identical to HEAD apart from this brief's change (no CRLF drift —
  `git diff --stat` must show only rao-card.js, and
  `git diff --ignore-cr-at-eol` vs `git diff` must agree). **STOP-GATE: if CRLF
  drift is present in any inlined engine file, halt and report — do not bake it
  into 100+ pages.**
- Regenerate all lesson review pages with `tools/make-review.js`.

## PHASE 5 — RECORDS (so this is never accidentally undone)

1. `STUDENT-INTERACTION-RULES.md`: add a dated note to Rules 16 and 17 —
   **DORMANT as of 2026-07-24, not repealed** (BRIEF-WHYWRONG-OFF-1): the
   whyWrong feature is suppressed product-wide; these rules govern the content
   if it is ever re-enabled. Do not rewrite the rules themselves.
2. `docs/ISSUES.md`:
   - Close **#122** ("That's close" NEAR_MISS messages breaking rule 12) —
     resolution: mooted; no child can see any whyWrong message as of this brief;
     messages left in files unchanged per Option A.
   - Add a new RECORD row (the #118 law-reversal pattern) stating the ruling,
     the switch (`WHYWRONG_VISIBLE`), what was retained (content + analytics),
     and that re-enabling requires a new dated ruling.
   - Do NOT touch #114 — its remaining scope is the analytics taxonomy, which
     this brief deliberately preserves.
3. `docs/whywrong-floor.json` and its verifier: content is untouched, so floors
   still hold — leave alone. If any floor tool FAILS after this brief, STOP and
   report; do not adjust floors to get green.

## PHASE 6 — CLOSE OUT

- Full `npm test` green (exit 0).
- Commit locally with message
  `whywrong: visible surfaces OFF product-wide (BRIEF-WHYWRONG-OFF-1); content and analytics retained`.
- **NO PUSH.** Pushes go through TortoiseGit after chat audit.
- Report: Phase 0 findings, the failing-then-passing guard output, the
  bite-proof from Phase 3, review regeneration stats, and the exact diff stat.

## STOP-GATES (summary)

- Third visible surface or visible `rao:whywrong` listener found → STOP.
- Any guard that cannot be cleanly amended to "never appears" → STOP with the
  guard's text.
- CRLF drift in engine files before review regeneration → STOP.
- Any floor/coverage tool goes red → STOP.
