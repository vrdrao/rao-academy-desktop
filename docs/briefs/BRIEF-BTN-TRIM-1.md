# BRIEF-BTN-TRIM-1

Ruled by Venkat 2026-07-24. Chat-authored. Runs ONLY after BRIEF-NOTQUITE-1 is
complete and committed. One task at a time.

## THE RULING

The action buttons are oversized. Venkat picked "Option 1 — compact solid":
same character, ~25% smaller, applied to BOTH button families so the
solid-vs-ghost hierarchy is preserved (solid = the main action, ghost =
optional help; the contrast between them must not shrink).

## PHASE 0 — MEASURE FIRST (tile-sizing law: sizing decisions are measured
against the repo, never against notes)

Read the CURRENT repo values of `.cc-btn-solid` and `.cc-btn-ghost` in
`engine/rao-card.css` and report them. Chat measured the project copies as:

- `.cc-btn-solid`: font-size .95rem, font-weight 800, padding 11px 24px,
  border-radius 14px
- `.cc-btn-ghost`: font-size .95rem, font-weight 700, padding 11px 18px,
  border-radius 14px, 2px border

**STOP-GATE: if the repo values differ from the above, halt and report before
editing — the design was chosen against these numbers.**

Also enumerate every element carrying these classes (grep the engine JS) so
the blast radius is named in the report.

## PHASE 1 — GUARD FIRST (seen FAILING before the fix)

Extend or add a style guard (follow the existing verify-styles.js pattern):

- Assert via COMPUTED STYLE (getComputedStyle after a real render — never by
  reading the stylesheet text) that `.cc-btn-solid` renders at the NEW values
  below, and `.cc-btn-ghost` at its new values.
- Assert rendered button height ≥ 44px for BOTH families (the child tap-target
  floor). This assertion is permanent — it must survive any future resize.
- Assert at two viewports (desktop + a ~380px mobile width): buttons visible,
  inside their container, height floor holds (visibility law).

Run against the current engine → must FAIL on the new-size assertions (the
44px floor should PASS today — if it fails today, STOP and report).

## PHASE 2 — THE CHANGE

`engine/rao-card.css` only:

- `.cc-btn-solid`: font-size .85rem, font-weight 700, padding 8px 16px,
  border-radius 10px. Everything else (font family, colors, margin-left:auto)
  unchanged.
- `.cc-btn-ghost`: font-size .85rem, font-weight 700, padding 8px 14px,
  border-radius 10px, border stays 2px. Everything else unchanged.
- If padding 8px yields a rendered height below 44px at either viewport,
  increase VERTICAL padding only until the floor holds, and report the final
  numbers. The floor outranks the aesthetic.

Dated comment on both rules naming this brief and the ruling ("Option 1 —
compact solid, ghost trimmed to preserve hierarchy").

Phase 1 guard must now PASS.

## PHASE 3 — RECORDS + REGENERATE

1. `docs/ISSUES.md`: RECORD row — buttons resized per Venkat's Option-1 ruling
   2026-07-24; the OLD sizes (from Phase 0's measurement) are recorded in the
   row so no future session "restores" them from a stale note.
2. Regenerate `review/` (same #117 CRLF stop-gate as the previous briefs).

## PHASE 4 — CLOSE OUT

- Full `npm test` green (exit 0).
- Commit locally: `buttons: compact solid + matching ghost trim, 44px floor
  guarded (BRIEF-BTN-TRIM-1)`.
- **NO PUSH.**
- Report: Phase 0 measurements, blast-radius list, failing-then-passing guard
  output, final rendered heights at both viewports, diff stat.

## STOP-GATES (summary)

- Repo button values differ from Phase 0's expected numbers → STOP.
- 44px floor fails on TODAY'S engine → STOP (pre-existing defect, separate
  ruling needed).
- CRLF drift before review regeneration → STOP.
