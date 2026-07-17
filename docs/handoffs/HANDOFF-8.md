# HANDOFF-8 — Brief 7.6.1 (frontmatter explain) closed and pushed

Written 2026-07-17, at commit `16f5c50`, immediately after the milestone push.
Read CLAUDE.md first, then HANDOFF-7 (the Calm Card record) — this file only
carries the 7.6.1 delta.

---

## Repo state at 16f5c50 (verified this session, not recalled)

- **Branch:** `main`, in sync with `origin/main` after fast-forward push
  `22be6f7..16f5c50`. (`22be6f7` — BRIEFS.md text of 7.6.1, message "commit" —
  is Venkat's own commit and push, made mid-session while the 7.6.1 hook suite
  ran; nothing about it needed untangling.)
- **Engine:** `rao-master-17`. The whole brief is ONE engine change:
  `parseQuestion` falls back to `fm.explain` when the markup has no
  `<p class="explain">`. Markup wins when both exist. Both forms flow through
  the single `inner` assembly and the same build()-time `sanitizeMarkup` pass —
  parity is by construction, and sanitizer parity was verified live (an
  `onclick` inside a frontmatter explain is stripped). Packed CSS string
  untouched. FIREWALL_ALLOW_GRADING never set; SOURCE-DIFF passed normally
  (engine change, no solution files in the diff, single commit).
- **Corpus:** 104 files, **2,722 questions** (2,721 + the one both-form
  precedence question added to `lessons/_type-coverage.html`). Frontmatter-
  explain inventory: 32 fm-only (30 in `estimate-sums-faithful.html` — now
  rendering for the first time — + 2 fixture) · 1 both-form · 2,392 markup-only.
- **Suite:** full green in the `16f5c50` pre-commit hook —
  ENGINE rao-master-17 — SAFE TO SHIP; CALM CARD: all laws hold.

## Guards added (verify-calm.js §g, each proved to FAIL)

| Guard | Sabotage that proved it |
|---|---|
| g. EXPLAIN PARITY (built DOM) — every fm-only explain emits `.explain` | fallback reverted → `FAIL … estimate-sums-faithful.html (30), _type-coverage.html (2)` |
| g. EXPLAIN PRECEDENCE (markup wins) | precedence flipped → `FAIL … _type-coverage.html q14 (markup "MARKUP-WINS: 4 + 5 = 9." must render …)` |
| g. EXPLAIN REVEAL (live) — all 32 driven with correct answers per type | fallback reverted → `32/32 failed` |

The REVEAL drive enters correct answers in real Chromium (select, multi,
fill-blanks, order, sequence-build, categorize — entry technique mirrors
harness.js FILL; a change to answer-entry DOM contracts must be updated in
BOTH places). Expectation encoded: `.explain` hidden before Check; on correct
it is VISIBLE when legacy (no takeaway) and SUPPRESSED via `cc-hastake` +
takeaway panel when the solution carries a takeaway — that suppression is 7.6
design, not a bug.

## Fixture notes (so nobody "fixes" them)

- `_type-coverage.html` q1 carries a frontmatter-only `explain:` with NO
  solution — it exists to exercise the legacy reveal branch.
- q14 ("What is 4 + 5?") deliberately authors BOTH explain forms with
  sentinel texts (`MARKUP-WINS…` / `FRONTMATTER-LOSES…`) — it exists so the
  precedence rule is testable. Do not "clean up" the losing frontmatter line.
- The ladder question stays LAST in the fixture — verify-touch anchors on the
  last frame.

## Open list (unchanged from HANDOFF-7 except item 1 done)

1. ~~Brief 7.6.1~~ — DONE and pushed.
2. CLAUDE.md §13 revision to match 7.6 (retry language, verify-touch contract).
3. Rapid-mode verdict paint (`.opt.is-sel` beats `.opt.is-wrong`/`.is-correct`).
4. whyWrong content debt: 3,989 distractors across 103 lessons.
5. Individual review of remaining ~95 files continues.
