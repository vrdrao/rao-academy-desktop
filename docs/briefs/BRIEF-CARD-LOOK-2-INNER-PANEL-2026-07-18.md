# BRIEF — CARD-LOOK FOLLOW-UP: REMOVE THE INNER QUESTION PANEL (2026-07-18)

## PRE-CHECK (report before proceeding; STOP on any mismatch)

1. `git status` — tree clean, branch main, in sync with origin/main at `0f516d3`.
2. Engine `__version` is exactly `rao-master-18`.
3. Corpus totals: 104 lesson files / 2,722 questions.

## Authority

Venkat compared a regenerated review page against the signed-off app demo
(both screenshots supplied to chat, 2026-07-18). The review card wraps the
question body (prompt + options) in a pale lavender inner panel. The demo —
which is ground truth for card look — has NO inner panel: prompt and options
sit directly on the plain white card face.

**Spec point being added:** between the card face (#fff) and the question
content there is no intermediate surface. The card face is the only surface.

## The task

1. **Locate the source of the lavender inner panel** on review-page cards
   (expected: a background on `.qbody` or an inner wrapper in
   `engine/rao.css` / `engine/rao-card.css`). Report the exact selector,
   property, and current value before changing anything.
2. **Remove it** so the question body paints no background of its own —
   transparent over the white card face. Also remove any panel-only padding,
   border-radius, or border that exists solely to shape that panel, IF
   removing it does not change the position of the prompt/options relative
   to the card edge in a way that diverges from the demo. If spacing is
   ambiguous, match the demo screenshot and say what you matched.
3. **Blast radius check before editing:** if the selector you change is
   shared by anything other than the question-body panel (hints, walkthrough
   bubbles, figures, tiles), STOP and report instead of editing — the fix
   must not repaint any other element. Calm-card surfaces (tutor bubbles,
   takeaway) keep their own backgrounds; this brief touches ONLY the
   question-body panel.
4. **`engine/preview-engine.js` — ZERO diff.** md5 before == md5 after.
   If the panel background turns out to be emitted by the engine (inline
   style or engine-generated markup), STOP and report; do not widen scope.
5. **Regenerate all 104 review pages** through `tools/make-review.js`.
   Diff must be chrome-only and uniform.

## Guards (guard-first proof required)

Extend the card-look check in `tools/verify-styles.js`, both 1280px and
390px, on a really rendered lesson card:

- computed background-color of the question body container is transparent
  (`rgba(0, 0, 0, 0)`) or #ffffff — no lavender/grey panel.
- The existing card-look assertions (frame 3px, radius 25px, halo 9/21 @ .34,
  ledge 5 @ .12, page #ffffff, checker .09) still pass untouched.

Proof, actual output required:

1. Sabotage: restore the lavender background → guard FAIL, actual line shown.
2. Restore → PASS.
3. Full `npm test` green. Final banner + totals reported (104 / 2,722; any
   changed number explained).

## Report requirements

- The selector/property/value you found, and exactly what you changed
  (old → new), file by file.
- md5 + bytes-on-disk for every shipped file changed.
- Firewall: no grading file changes; FIREWALL_ALLOW_GRADING never set —
  confirm explicitly.
- Anything not implemented faithfully in its own section; absence of that
  section is an audit flag.
- Commit this brief to `docs/briefs/` in the work's commit.
- Commits stay LOCAL. No push. Venkat pushes after the chat audit clears.
