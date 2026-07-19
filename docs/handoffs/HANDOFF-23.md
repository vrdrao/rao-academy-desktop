# HANDOFF-23 — FR-1 pushed, BRIEF-CLEANSTART mid-flight, G4-only fence hardened

Chat-side handoff from the Grade 4 review chat, 2026-07-19. Prior: HANDOFF-22.
This document opens a NEW chat in this same project whose job is unchanged:
**run Venkat's Grade 4 lesson review using `docs/FEEDBACK-PROTOCOL.md`, and
carry the engine-owner role for E-class fixes.**

## Opening ritual

1. Read `GRADE-ROLLOUT-PLAYBOOK.md` (repo root; supersedes chat memory
   including this handoff where they conflict). **It is NOT in project
   knowledge** — three searches across two sessions failed to surface it, and
   a Sync did not fix it. It is likely not registered as a project source at
   all. Ask Venkat to add it. Everything I know about it is second-hand from
   other documents citing it (§1 push discipline, §4 fix-the-general-case,
   §9 opening ritual, §10 conflict routing). It is now at **playbook-3**.
   `CLAUDE.md` and `docs/CALM-CARD-MASTER-SPEC-v1.md` are likewise absent.
2. Read `docs/FEEDBACK-PROTOCOL.md` — present and synced (`feedback-protocol-1`).
   Triage table → Venkat's `y`/overrides → briefs in lane order E→P→L →
   scoreboard.
3. Entry check: engine `__version` = **`rao-master-20`**. Corpus **3,075
   questions / 118 files** in `lessons/`.

## THE SCOPE FENCE — Venkat's explicit ruling this session

**GRADE 4 ONLY. Grade 3 is absolutely none of this chat's concern.**

This was ruled after the previous chat (me) imported a Grade 3 agenda item into
G4 planning — I raised the per-grade repo restructure (`grades/gN/…`) as a
sequencing constraint. Venkat killed it flat. `lessons-g3/` is out of scope for
counts, guards, fixes, regeneration, deploy drops, and planning input. If Grade
3 work ever lands, it is Venkat's coordination problem, not this chat's.

Everything proposed must be aimed at **fixing UI or engine issues in the Grade 4
lessons that already exist.**

## How this project runs

Venkat is non-technical. Chat decides, writes briefs, audits; Claude Code
executes. Briefs are FILES in the repo root, invoked exactly:
`Read <FILE> in the repo root and execute it verbatim.` Veto ritual every time:
pre-typed Claude Code input is cleared before pasting. Claude Code never pushes.
Venkat pushes after chat audit, enumerated, then Syncs. Terse replies: a single
`y` = full agreement. Decisions are MADE for him, explained after. One Claude
Code task at a time.

**DAY/NIGHT triage (from HANDOFF-22, still in force):** every triage table
carries a DAY/NIGHT column alongside E/P/L/D. DAY = ≤15 min, brief immediately,
phase gates allowed. NIGHT = accumulate into ONE fully pre-ruled nightly omnibus,
lane order inside it, one commit per item, items independent, every
STOP-and-ask converted to skip-log-continue, ambiguous items parked to a
morning ruling list.

## What landed this session

**`4bbb5b8` — FR-1 — AUDITED AND PUSHED.** Engine → `rao-master-20`.
Snapshot-restore reset in `rao-card.js`, `markTried()`/`.cc-x` retired, new
guard `tools/verify-reset.js` wired into npm test, verify-touch Law-3
assertions inverted, spec amendment, `.st-apple` fix named separately.

Audit verdict was PASS, enumerated. Worth carrying forward: the report was
**honest in a way that earned trust** — it disclosed that its first sabotage
attempt *failed to fail* (the reset healed the sabotage before the guard
looked) and that reproducing the defect required a two-step sabotage. A weaker
report would have shown only the clean FAIL/PASS pair. Hold future reports to
that standard.

Numbers reconciled at audit: 1,663 + 806 + 179 + 154 + 153 + 32 + 31 + 31 + 14
+ 8 + 3 + 1 = **3,075**, cross-checked against the grading gate (3,044 graded +
31 construct self-graded).

## IN FLIGHT AT HANDOFF — `BRIEF-CLEANSTART.md`

Running in a Claude Code session right now. Written by chat (not self-written),
saved to repo root, invoked verbatim. **Four commits, in order:**

1. **sb-tile touch fix** — one line in `rao.css:611` adding `.sb-tile` to the
   existing `touch-action:none` rule. Guard-first: `verify-reset.js` mobile
   pass extended with a real CDP touch drag on a sequence-build tile, shown RED
   before the fix, PASS after, plus a sabotage round-trip. **31 G4 questions.**
2. **Regenerate `review/*.html`** at rao-master-20.
3. **Refresh `deploy-drop/`** — engine first, lessons second, per DEPLOY.md,
   md5-proven per file.
4. **Housekeeping** — delete `BRIEF-FR-2.md`, archive this brief to
   `docs/briefs/`, commit any `HANDOFF-*.md` files Venkat placed in the root.

**Status at handoff:** item 1's fix applied and its sabotage round-trip shown
(revert → FAIL, restore → PASS, `grep -c = 0`). Full `npm test` was running.
Claude Code had switched to `manual mode`, so it may pause for permission
rather than proceed — an idle-looking screen with a frozen timer may be a
permission prompt, not a stall.

**FIRST DUTY OF THE NEW CHAT: audit the CLEANSTART report before Venkat
pushes.** Specific audit points:
- Item 1: the **pre-fix RED output** must be present, not only the sabotage
  round-trip. The sabotage proves the guard catches a reverted fix; the pre-fix
  red run proves it caught the original defect. Both are required.
- Item 2: the review-page counts. **The brief deliberately does not assert a
  number** — see below. Check that before/after filename sets are identical,
  that `rao-master-19` count is zero, and that the numbers printed are
  internally consistent.
- Item 3: source-vs-destination md5 per file, and DEPLOY.md re-pinned to item
  1's hash.
- Item 4: which handoff files were actually found, by name.
- Deviations section present and substantive.
- Only allowed files touched. No `__version` bump (no engine JS was touched).

## The count that must be measured, never assumed

`review/` page count is **unresolved**: my arithmetic reached 117, 118, or 119
depending on assumptions (118 lesson files, minus `_`-prefixed fixtures skipped
by the generator, plus a non-engine `index.html`). A prior self-written Claude
Code brief asserted 119 without verification.

CLEANSTART's Phase 0 **measures** it and prints it. Do not let any future brief
bake a remembered number into a guard. Chase every number that changes.

## Rulings made this session (carry forward)

1. **G4 only** (above) — the hard fence.
2. **Multi-select is 179, not 180.** HANDOFF-22's 180 counted G3's single
   multi-select. Resolved, no action.
3. **The FR-1 md5 table is 8 files, not 9.** HANDOFF-22 said 9; Amendment 1 is
   archived *inside* `BRIEF-FR-1-2026-07-19.md`, not as a separate file. My
   flag, my error, closed.
4. **Review regeneration and deploy-drop are CHORES, not E/P/L items.** E/P/L
   classify defects in the product; these are stale build artifacts. Forcing
   them into a lane would launder a chore into a defect class. Only the sb-tile
   item is a real defect.
5. **whyWrong debt (3,989 distractors) stays parked.** It is authoring, not
   engineering. It gets burned down lesson-by-lesson during review, never as a
   sweep — a sweep would stall everything for weeks and produce thousands of
   unreviewed messages.
6. **`BRIEF-FR-2.md` was never authorized.** A prior Claude Code session wrote
   its own brief, choosing scope, sequencing, and assertions. Some judgment in
   it was good (the 1→2→3 ordering and its reasoning were kept), but good
   judgment from the wrong seat is still the wrong seat. Deleted in item 4.

## Process incident — worth not repeating

Venkat had two chats open and, believing he was in this one, gave the other
chat FR-1 feedback and rulings. That chat instructed Claude Code, which wrote
`BRIEF-FR-2.md` for itself. Separately, `4bbb5b8` reached origin **before** the
enumerate step. Nothing was damaged — the push was of an already-audited commit
— but the audit-then-push order was inverted.

Venkat has since closed the other chat and consolidated here. The lesson stands:
two chats both believing they are driving is how contradictory rulings reach
Claude Code.

## Architecture note — the root cause behind item 2

The engine exists in **three places**: the live `engine/` + `rao.css`; frozen
copies inlined into every `review/*.html` at generation time; and another copy
in `deploy-drop/`. An engine fix reaches the corpus instantly but is invisible
in review pages until they are regenerated — which is exactly why Venkat could
not see FR-1's ✕ fix in his browser.

**Proposed, not scheduled:** have review pages link one shared engine file
instead of embedding a copy. Fix once, every page updates, no drift, no third
copy to forget. Tradeoff: linked pages stop being self-contained single files,
which may be why it was built this way. Venkat was told this is surgery, not
clean-start work, and should wait until he knows his day-to-day review rhythm.
**Do not resurrect this unasked.**

## Frozen items (do not resurrect unasked)

- Calm Card overall sign-off WITHHELD; Brief 7.6's four blockers — parked.
  (FR-1's Law-3 amendment was a ruled exception, not a sign-off.)
- Brief 7.8 (Robo personality pack) — unblocked, deferred by choice.
- Five OVERLAP-HOLD rulings (HANDOFF-20 §OPEN-1) — parked.
- Thin-lesson top-up rulings — parked; the protocol handles them as feedback.
- Rapid-mode stale green; app-side wiring per DEPLOY.md — parked.
- `raoGeoEngine.js` lives in the app, not the repo; `gmReset`/`gcReset` are
  unverifiable from here. Recorded limitation, not a defect.
- Handoffs 12–21 exist only inside old chat threads, not as files. Claude Code
  is explicitly forbidden from reconstructing them. Judged not worth
  retrieving; HANDOFF-22 and this file carry the live state.

## Batch 1 scoreboard (protocol §3.6)

Items received: 1 · Fixed by lane: E×1 (FR-1, `4bbb5b8`, audited + PUSHED) ·
Retired: 0 · Ruled D: 0 · Deferred: 0 · Discovered new: 4, of which 3 are in
CLEANSTART (sb-tile, review regen, deploy-drop) and 1 is a recorded limitation
(RaoGeo stub). Blast radius of item 1 as ruled: all 3,075 questions.

**Batch 1 closes when CLEANSTART is audited and pushed.**

## How to open

- If Venkat's first message is the **CLEANSTART report** → audit it (FIRST DUTY
  above), enumerated, then he pushes and Syncs.
- If it is **feedback screenshots** → triage per protocol with the DAY/NIGHT
  column. This is the expected steady state once CLEANSTART lands: Venkat opens
  regenerated review pages, finds issues, sends batches.
- If it is `y` → he is confirming your entry-check summary; ask for the
  CLEANSTART report.
- If the run **failed or stalled** → get the partial report, do NOT let Claude
  Code self-commission recovery; write a recovery brief yourself.

**The point of all of this:** once CLEANSTART lands, Venkat can finally open a
review page and see rao-master-20 — no ✕ after Try Again, tiles back in the
bank. That unblocks the actual work, which is him reviewing Grade 4 lessons and
sending feedback batches.
