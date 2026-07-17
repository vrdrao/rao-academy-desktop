# HANDOFF-7 — Brief 7.6 (Calm Card) closed and pushed

Written 2026-07-17, at commit `09cc647`, immediately after the milestone push.
Read CLAUDE.md first; this file only carries what CLAUDE.md and STATUS.md do not.

---

## Repo state at 09cc647 (all verified this session, not recalled)

- **Branch:** `main`, in sync with `origin/main` after fast-forward push
  `9183ef3..09cc647`.
- **Milestone commits (pushed):**
  - `e43dd91` — Brief 7.6 Calm Card: all behavior + guards. Grading files
    untouched, so SOURCE-DIFF passed honestly.
  - `219e156` — the single engine change: `__version` → `rao-master-16`.
    Two-commit sequencing chosen by Venkat in-session so the firewall guard
    never needed `FIREWALL_ALLOW_GRADING` — **that variable was never set at
    any point** (no OVERRIDE banner in any run this session).
  - `09cc647` — Venkat's rulings recorded: walkthrough header **KEPT**;
    frontmatter-`explain:` fix approved as **Brief 7.6.1, NOT started**.
- **Engine:** `rao-master-16`. Deploy engine first, lessons second. Calm-card
  behavior needs ≥ 16. Five shipped files + the mount, all five or nothing:

  | File | md5 | bytes |
  |---|---|---:|
  | `engine/preview-engine.js` | `1bc54667291ca9edbec2394d4e72eb25` | 196,081 |
  | `engine/rao.css` | `77fe771b3a6d38b55a737e6ea4588d2b` | 89,161 |
  | `engine/rao-card.css` | `7b7ef624505cfd99aac26bb5459b38ac` | 9,748 |
  | `engine/rao-card.js` | `aa1eba9b651b4e10564120eebb265784` | 26,399 |
  | `engine/solution-renderer.js` | `0a17636d35a482cf82ebeaf65e65fa1c` | 15,207 |

- **Reference (ground truth for calm behavior):** `incoming/calm-card-v36.html`,
  md5 `deb8d07a84a9f1fbc6847b7ff57a965f`, 1,791,115 bytes — verified before work
  began and unchanged after. Where any doc disagrees with it, the file wins.
- **Suite:** full green in the `09cc647` pre-commit hook — 104 lesson files,
  2,721 questions, ENGINE rao-master-16 — SAFE TO SHIP; touch suite green;
  CALM CARD: all laws hold (incl. the ANSWER-LEAK sweep of all 1,593 select
  questions).

## What the Calm Card is (one paragraph)

On a wrong attempt the card whispers: the tried option gets a small red ✕
(`cc-tried`, `is-sel` removed) and NOTHING else changes — no red, no shake, no
pill, no reveal. whyWrong + forward hints are ONE tutor-bubble ladder ("Hint n",
never "of N", 650ms dots→fill, append-only, faceless). "Walk me through it"
appears after the 2nd wrong attempt or when hints run out; opening it LOCKS the
question and records `solved-with-help` (dataset `raoOutcome`,
`window.__raoOutcomes`, `rao:outcome` event); no retry inside; one button per
step (Next step → Got it); the final step greens the correct option quietly.
Correct is the only loud moment: green + cc-win + sparks + chime + "The idea to
keep" takeaway + "Next question →". The task freezes via `qbody.inert` in
feedback states — zero paint change, which is what makes TASK-IMMUTABILITY
assertable.

## Corpus arithmetic (settled this session — do not re-derive)

- 104 corpus files = **103 real lessons + `lessons/_type-coverage.html`** (the
  fixture, in the corpus by design since `712d3be`, 2026-07-14).
- 108 → 104 happened at `1f69a98` (2026-07-14 cleanup), NOT during 7.6, which
  touched zero lesson files.
- Question ledger, marker terms: 2,817 (108 files) − 131 (five files deleted:
  31+30+30+8+32) + 32 (`place_values_remix (2)` renamed to
  `place_values_unit_conversion_remix`) − 4 (`Addition_patterns…` 30→26)
  + 7 (Brief 7.5, `estimate-sums-faithful` 23→30) = **2,721**, and at HEAD
  every marker builds (harness: 2,721 built). The old "2,808 built" was
  reproduced exactly by running the `a45e48c` corpus through the current
  engine.

## Guards added/changed (all with break→FAIL→restore proofs on record)

- **`tools/verify-calm.js`** (new, in npm test): a ANSWER-LEAK corpus sweep
  (computed-style diff vs per-option resting snapshot; transitions disabled in
  the sweep page because a transitioned property reads its STARTING value at
  t=0 — a leak literally hid there during sabotage), b LOCK-ON-OPEN,
  c TASK-IMMUTABILITY, d ACCUMULATION (asserted at EVERY rung — the first
  version couldn't fail for its own reason), e BUBBLE PARITY vs the v36 file
  (the 650 is parsed out of the demo, not hardcoded twice; live fills 650±50;
  MutationObserver zero mutations to filled bubbles), f HINT-LABEL BAN.
  Min-corpus guard (≥100) same as harness.
- **`tools/verify-touch.js`** rewritten to the calm flow (28 checks, real CDP
  touch, 380×800).
- **`harness.js`** flake fixed: 104 lessons navigated ONE reused temp file; a
  partially-written file loaded with its script truncated and crashed the run
  with "Cannot read properties of undefined (reading 'slice')" instead of a
  verdict. Now unique per-lesson temp files + `waitForFunction(__ready)` +
  defensive err read + cleanup. If you see that error again, the race is back.

## Bugs found, status

1. **FIXED — the brief's blocker:** old `markFeedback` revealed the correct
   option green on every wrong attempt (`else if (!ok && right)` — removed).
2. **FIXED — green never painted on the chosen option:** `.opt.is-sel:not(:disabled)`
   out-specifies `.opt.is-correct` in rao.css; the calm card drops `is-sel`
   when the verdict paints. Rapid mode still carries the stale paint
   (selection purple beats the red/green flash; shake still fires) — known,
   out of 7.6 scope.
3. **OPEN — Brief 7.6.1 (approved 2026-07-17, not started):** the engine
   ignores frontmatter `explain:` — `build()` reads only `<p class="explain">`
   from markup. All 30 `explain:` strings in
   `lessons/incoming/estimate-sums-faithful.html` (and 1 in the fixture) parse
   and vanish. CLAUDE.md §13.6 documents the frontmatter form as valid.
4. **DOC BUGS, not yet edited:** CLAUDE.md §13.2/§13.7 still describe the old
   walkthrough ("I've got it — let me try again" at every step; interactive
   bail-out). Brief 7.6 supersedes: NO retry inside the walkthrough — it is
   the commit point. The master spec's §3 line "options dim ONLY in feedback
   states" describes code that does not exist in v36 (nothing ever dims an
   option); per the spec's own rule the file wins.

## Judgment calls made in 7.6 (disclosed in-session; revisit only with Venkat)

- Multi-select wrong: ✕ on EVERY selected option (marking only the wrong ones
  would leak which were right).
- Non-select wrong: no auto-bubble (whyWrong is select-only); red input marks
  stay, green per-blank marks suppressed while attemptable.
- After "Got it": locked card shows "Next question →" — a door, not a
  celebration (demo's dev bar jumped to state 5 there; read as dev navigation).
- Adaptive mode has no "Not quite"/"Correct!" pill; "✋ Answer it first" kept.
- `.explain` is suppressed (`cc-hastake`) when the takeaway panel or the full
  walkthrough already carried the teaching; legacy explain-only questions
  still reveal on correct (BUG-4 style guard still passes).
- Walkthrough chips: takeaway = "The idea to keep", verification = "Does it
  make sense?" (never the word "check" — vocabulary firewall).

## Open list for the next session

1. Brief 7.6.1 (frontmatter `explain:`) — approved, waiting for go.
2. CLAUDE.md §13 revision to match 7.6 (retry language, verify-touch contract).
3. Rapid-mode verdict paint (bug 2 above) — needs a decision.
4. whyWrong content debt: 3,989 distractors across 103 lessons.
5. Individual review of remaining ~95 files continues.
