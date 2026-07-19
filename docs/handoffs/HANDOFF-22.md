# HANDOFF-22 — FR-1 mid-flight, DAY/NIGHT triage adopted, review continues

Chat-side handoff from the Grade 4 review chat, 2026-07-19. Prior: HANDOFF-21.
This document opens a NEW chat in this same project whose job is unchanged:
**run Venkat's Grade 4 lesson review using docs/FEEDBACK-PROTOCOL.md, and
carry the engine-owner role for E-class fixes.**

## Opening ritual (do this before anything else)

1. Read `GRADE-ROLLOUT-PLAYBOOK.md` (repo root; supersedes chat memory
   including this handoff where they conflict).
2. Read `docs/FEEDBACK-PROTOCOL.md` — CONFIRMED present in the repo and
   synced to project knowledge this session (`feedback-protocol-1`). It
   governs every batch: triage table → Venkat's `y`/overrides → briefs in
   lane order E→P→L → scoreboard.
3. Entry check: engine `__version` should be `rao-master-20` if FR-1's
   commit `4bbb5b8` is present (see below); corpus 3,075 questions / 118
   files in `lessons/` (the FR-1 DIAG re-derived this exactly).
   `lessons-g3/` (1 file / 25q) exists but is OUT of this chat's corpus —
   ruled this session.
4. Project knowledge lags GitHub. If a file you need isn't in search
   results, ask Venkat to Sync before concluding it's absent.

## How this project runs (unchanged, plus one new rule)

Venkat is non-technical. Chat decides, writes briefs, audits; Claude Code
executes. Briefs are FILES in the repo root, invoked exactly:
`Read <FILE> in the repo root and execute it verbatim.` Veto ritual every
time: pre-typed Claude Code input is cleared before pasting — this session
Claude Code pre-typed its own next task including an un-ruled fix
(`npm run review, then fix the sb-tile touch-action in rao.css`); Venkat
was told to clear it. Claude Code never pushes. Venkat pushes after chat
audit, enumerated, then Syncs. Terse replies: a single `y` = full
agreement. Decisions are MADE for him, explained after. One Claude Code
task at a time, repo-wide — coordinate with the Grade 3 stream through
Venkat.

**NEW — DAY/NIGHT triage (adopted this session, Venkat's ask):** every
triage table now carries a DAY/NIGHT column alongside E/P/L/D.
- DAY = ≤15 min fix → brief immediately, interactive, phase gates allowed.
- NIGHT = longer → accumulate into ONE nightly omnibus brief, lane order
  E→P→L inside it, one commit per item, items independent (a failure in
  one must not stall the rest). Night briefs must be FULLY PRE-RULED:
  every STOP-and-ask becomes skip-log-continue; ambiguous items get parked
  to a morning "needs ruling" list, never guessed. One paste at bedtime,
  one audit + one push in the morning.
- Grade 3 must not run overnight on the same nights.

## FR-1 — the session's main work (Batch 1, item 1)

**The feedback:** `_type-coverage.html` q2/20 (multi-select "Select all the
even numbers") — after Try Again, red ✕ persisted on options 2 and 4, both
CORRECT answers. Triaged E-class.

**The ruling (Venkat, explicit, overrules ratified law):** Calm Card LAW 3
AMENDED. The whisper ✕ is dead. Try Again restores the task to EXACTLY its
first-attempt state — no ✕, no residual selection, no retained input, no
moved tiles — for ALL question types (his word: consistent everywhere;
fill-blanks re-blank, drag tiles return to origin). LAW 4 unchanged: hint
bubbles and walkthrough steps persist; help is not residue. The spec doc
(`docs/CALM-CARD-MASTER-SPEC-v1.md`) carries a dated amendment block;
historical Brief 7.6 text in BRIEFS.md deliberately untouched.

**Brief FR-1** (archived at `docs/briefs/BRIEF-FR-1-2026-07-19.md`) ran in
two phases. Phase 1 DIAG surfaced, verbatim rulings given (`g3 out,
verify-touch ok, go`):
1. Corpus = 3,075 G4 only; G3's 25 questions excluded.
2. `verify-touch.js` Law-3 assertions INVERTED, not deleted (assert ✕
   ABSENT after Try Again) — ruled by chat as Amendment 1.
3. npm-test wiring for the new guard authorized.
4. `.st-apple` gap (pre-existing: `markTried()` never queried `.st-apple`,
   so apple-scene selections survived a wrong attempt un-cleared) fixed
   inside FR-1 but named separately in the commit. Corpus count of shipped
   `.st-apple` questions: 0 — latent engine capability, no child could hit
   it yet.

**Phase 2 status at handoff: RUNNING, 3 of 4 tasks done.** Last task
("Sabotage proof + full npm test + commit + report") was in progress when
this handoff was written. The report-so-far claims:
- Commit `4bbb5b8` (LOCAL, UNPUSHED) — engine → `rao-master-20`,
  snapshot-restore reset in `rao-card.js`, `markTried()`/`.cc-x` removed,
  new guard `tools/verify-reset.js` in npm test, touch-guard inversion,
  spec amendment, brief + Amendment 1 archived.
- Full npm test exit 0 on rao-master-20; verify-calm untouched and green
  (ANSWER-LEAK 1,836 select questions; ACCUMULATION green, no relaxation).
- Shipped-file md5 table delivered (9 files incl. rao-card.js 28,703 B,
  preview-engine.js 206,179 B, rao-card.css 10,262 B).
- `_type-coverage.html` NOT modified (already carried all 12 behaviors;
  KEEP-THIS-LAST card untouched).

**FIRST DUTY OF THE NEW CHAT: audit the FINAL FR-1 report before Venkat
pushes.** Audit points: sabotage FAIL/PASS output actually shown (deviation
2 says the sabotage recipe deviated from the brief's literal one-step —
verify the reasoning holds); reconciliation numbers; Deviations section
complete; only allowed files touched (+ the three authorized in Amendment
1). Venkat pushes ONLY after this audit, enumerated. Then Sync.

## New triage items FR-1 discovered (untriaged — feed into the next table)

1. **sequence-build tile drag DEAD on real touch devices** — `rao.css:611`
   gives `touch-action:none` to `.tile/.vs-tile/.order-slot` but NOT
   `.sb-tile`; finger drags pointercancel into page scroll. Tap-arm/
   tap-slot path works, so children CAN still answer. One-line rao.css
   fix, explicitly awaiting Venkat's ruling. Likely E + DAY. 31
   sequence-build questions (G4).
2. **review/*.html pages still embed rao-master-19 card code** — playing
   an old review page shows the OLD ✕ behavior until `npm run review`
   regenerates them. verify-format stays green because the markup skeleton
   is unchanged. Housekeeping, post-push. Likely DAY.
3. **deploy-drop/ still the rao-master-19 drop** — deploying FR-1 needs a
   fresh drop, engine first, lessons second (DEPLOY.md order). NIGHT or
   post-push DAY.
4. **construct guard uses a test-side RaoGeo stub** — `raoGeoEngine.js`
   lives in the app, not the repo; the guard proves re-mount-from-spec on
   the card side only; `gmReset`/`gcReset` unverifiable from the repo.
   Recorded limitation, not a defect. No action unless Venkat wants an
   app-side check.

## Frozen items (unchanged from HANDOFF-21 — do not resurrect unasked)

- Five OVERLAP-HOLD rulings (HANDOFF-20 §OPEN-1) — parked.
- Thin-lesson top-up rulings — parked; protocol handles them as feedback.
- Calm Card overall sign-off WITHHELD; Brief 7.6's four blockers — parked.
  (Note: FR-1's Law-3 amendment is a ruled exception, not a sign-off.)
- Brief 7.8 (Robo personality pack) — unblocked, deferred by choice.
- whyWrong authoring debt on the OLD corpus — parked.
- Rapid-mode stale green; app-side wiring per DEPLOY.md — parked.
- docs/handoffs/ ends at HANDOFF-11; committing 12–22 is a future small
  brief (this file makes it 12–22).

## Batch 1 scoreboard (protocol §3.6 — provisional until FR-1 audit)

Items received: 1 · Fixed by lane: E×1 (FR-1, commit `4bbb5b8`, pending
audit + push) · Retired: 0 · Ruled D: 0 · Deferred: 0 · Discovered new:
4 (listed above, untriaged). Blast radius of item 1 as ruled: all 3,075
questions (the amended law is corpus-wide), of which 180 multi-select were
the reported symptom class.

## How to open

If Venkat's first message is the FR-1 final report → audit it (see FIRST
DUTY above). If it's feedback screenshots → triage per protocol with the
new DAY/NIGHT column. If it's `y` → he's confirming your entry-check
summary; ask for the FR-1 final report or the next batch. If the FR-1 run
failed or stalled overnight → get the partial report, do NOT let Claude
Code self-commission recovery; write a recovery brief yourself.
