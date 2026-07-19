# GRADE-ROLLOUT-PLAYBOOK

**Version:** `playbook-2` · **Date:** 2026-07-19

This file supersedes chat memory. If any chat's recollection of a rule conflicts
with this file, this file wins; report the conflict to the engine chat.

Every rule below is extracted from an existing repo file and carries a source
tag. Rules that could not be found in any repo file are marked UNKNOWN and await
chat-side text — they are listed in the creating brief's Deviations section.

---

## §1 Roles and fences

- **Chat-side (claude.ai) decides.** It adjudicates, writes briefs, audits
  Claude Code's reports, designs question variations and visuals. It never
  simulates the repo, never invents repo contents, never writes code directly
  into the repo. [src: GRADE3-CHARTER.md]
- **Claude Code executes only.** It executes briefs against the repo and never
  decides scope. Substituting one work item for another is a scope decision,
  and scope is not Claude Code's. [src: GRADE3-CHARTER.md]
  [src: BRIEF-G3-PILOT1-PREP-2026-07-19-v2.md]
- **Claude Code never pushes.** Commits stay local until the chat audit clears,
  and a permission deny rule blocks `git push` — do not attempt it.
  [src: GRADE3-CHARTER.md] [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]
- **The engine has one owner.** `engine/preview-engine.js`, `engine/rao.css`,
  `engine/rao-card.css`, `engine/rao-card.js`, the guards in `tools/`, and the
  git hooks are owned by the engine (Grade 4) chat alone. Grade chats NEVER
  commission engine work; a needed capability becomes an ENGINE REQUEST (a
  short doc: what's needed, why, example question) that Venkat carries to the
  engine chat. One owner, no forks, no drift. [src: GRADE3-CHARTER.md]
- **The engine is forward-only.** A newer engine always runs older lessons; an
  older engine cannot run newer lessons. Never roll the engine back. Deploy
  engine first, import lesson second. [src: CLAUDE.md]
- **ONE Claude Code task at a time, repo-wide, across all grades.** Never run
  one grade's brief and another's simultaneously. Finish one, push, sync, then
  start the other. [src: GRADE3-CHARTER.md]
- **Venkat is the only one who pushes** — always after a chat audit clears,
  always with commits enumerated ("push X and nothing else"), followed by
  clicking Sync on the project's GitHub card. [src: GRADE3-CHARTER.md]
  He pushes via TortoiseGit; the pre-push hook firing from TortoiseGit's Push
  dialog is a hard requirement — never ship a gate his actual tool bypasses.
  [src: docs/briefs/BRIEF-PRECOMMIT-SPEED-2026-07-18.md]

## §2 Rituals

- **Briefs travel as files in the repo root.** Long terminal pastes are banned
  (the terminal truncates them). The invocation line is exactly:
  `Read <FILE> in the repo root and execute it verbatim.` [src: GRADE3-CHARTER.md]
- **Briefs are archived, never deleted.** Every executed brief is committed to
  `docs/briefs/` as part of its own work's commit — the paper trail outranks a
  tidy tree. [src: CLAUDE.md] [src: GRADE3-CHARTER.md]
- **Veto ritual:** pre-typed Claude Code commands are cleared before pasting.
  [src: GRADE3-CHARTER.md] The ritual applies in every permission mode, auto
  included. [src: chat-side ratification 2026-07-19, playbook-2]
- **Browser downloads may arrive renamed** `<name> (1).md`. Verify content
  (md5) and archive under the canonical name, removing the stray copy.
  [src: docs/handoffs/HANDOFF-11.md] [src: OVERNIGHT-REPORT-2026-07-19.md]
- **Every pushed milestone triggers a handoff document, unprompted**
  (per-grade series, e.g. HANDOFF-G3-N). [src: GRADE3-CHARTER.md]

## §3 Gates and permissions

- **Pre-commit = fast gate** (~1–2 min: Node-only grading of the full corpus +
  format/authoring guards; the corpus-count guard stays in the fast path).
  **Pre-push = the FULL `npm test`** (~15+ min), which BLOCKS the push on any
  failure and prints its banner in the push output; it fires from TortoiseGit.
  The safety invariant: nothing reaches origin without the full suite green on
  that exact tree — only the timing moved. [src: CLAUDE.md]
  [src: docs/briefs/BRIEF-PRECOMMIT-SPEED-2026-07-18.md]
- **Never abort a push mid-hook** — killing it half-way proves nothing and
  leaves you unsure what state the gate saw; let it finish either way. Any
  Claude Code shell command wrapping a `git push` or `git commit` uses a
  30-minute timeout (the default 2-minute timeout has killed a commit
  mid-hook). [src: WORKFLOW.md]
- **`--no-verify` is FORBIDDEN.** Never use it, never suggest it — a bypassed
  gate is how silent breakage ships. If a hook seems wrongly red, fix the cause
  or ask Venkat. [src: CLAUDE.md]
- **A blocked push is the gate doing its job** (the invariant above operating).
  A push-time failure with NO FAIL line visible — an abrupt mid-list stop —
  is a suspected flaky browser-process death, not a regression: re-run the
  failing tool standalone on the same tree, capture its tail and exit code,
  and fix NOTHING — diagnosis only; Venkat and chat adjudicate.
  [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]
  [src: OVERNIGHT-REPORT-2026-07-19.md]
- **Permission mode ("auto mode"):** Permission mode is `defaultMode: auto`
  with a small curated allow list and hard deny rules on `git push` (all
  shells) and on `--no-verify`, merged in the repo's `.claude` settings. Auto
  mode is what makes unattended overnight runs possible; the deny rules are
  what make it safe. [src: chat-side ratification 2026-07-19, playbook-2]
- **The allow list is curated and small.** Workspace is `rao-academy` only;
  allow list e.g. `npm install`, `npm test`, `npx playwright install chromium`.
  [src: WORKFLOW.md] `git push` is blocked by a deny rule.
  [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]
- **"Yes, don't ask again" saves the ENTIRE compound command,** not just the
  safe part — that is how the permission leak happened. Approve compound
  commands ONCE, never "always"; "always" only ever for a single, simple,
  obviously-safe command. [src: WORKFLOW.md]

## §4 Laws (all grades, all content)

- **Answer-leak rule:** no figure, hint, or layout cue may reveal the answer of
  the question it accompanies. [src: GRADE3-CHARTER.md]
- **No intermediate surface** between the card face (#fff) and the question
  content — the card face is the only surface; the question body paints no
  background of its own. [src: docs/CALM-CARD-MASTER-SPEC-v1.md]
  [src: docs/briefs/BRIEF-CARD-LOOK-2-INNER-PANEL-2026-07-18.md]
- **One spotlight at a time.** [src: docs/CALM-CARD-MASTER-SPEC-v1.md]
  [src: GRADE3-CHARTER.md]
- **Green appears exactly twice ever:** the correct moment and the
  walkthrough's quiet final reveal. [src: docs/CALM-CARD-MASTER-SPEC-v1.md]
  [src: GRADE3-CHARTER.md]
- **No-repaint law:** messages are append-only and type-then-fill; a bubble's
  content is filled once, and earlier bubbles are never touched again.
  [src: docs/CALM-CARD-MASTER-SPEC-v1.md]
- **Build inside, not beside:** when Venkat shares a reference file, work is
  done by cloning and injecting into that file — never by rebuilding a
  lookalike from scratch beside it. The reference is the ground truth for
  structure and styling; a rebuild silently drops details the reference
  carried. [src: chat-side ratification 2026-07-19, playbook-2]
- **One copy of the card in the system.** There is exactly ONE copy of the
  card; never introduce a parallel review-only card skin. [src: CLAUDE.md]
- **Engine fixes go in the engine,** so every future lesson inherits them —
  never patch around a problem per-lesson. [src: CLAUDE.md]
- **Chase every number that changes.** A totals delta is enumerated question by
  question or the audit fails. [src: GRADE3-CHARTER.md]
- **Fix the general case, not the file.** When 3+ files share the same defect,
  stop file-by-file work, write a batch script, and sweep. [src: CLAUDE.md]
  [src: WORKFLOW.md] [src: GRADE3-CHARTER.md]
- **Anti-laundering.** Unknowns are reported as unknowns, never dressed as
  confident labels. Collisions and count mismatches are printed row by row —
  never summarized as "benign"; the reviewer decides what is benign, not the
  classifier. [src: GRADE3-CHARTER.md] [src: CLAUDE.md]
- **Prove every guard fails before trusting it:** sabotage the thing it
  protects → run the guard → show the actual FAIL output → restore → PASS.
  A guard never observed failing is faith, not a guard. [src: CLAUDE.md]
  [src: WORKFLOW.md] [src: GRADE3-CHARTER.md]
- **Deviations section mandatory in every brief report;** its absence is itself
  an audit flag. [src: GRADE3-CHARTER.md]
  [src: docs/briefs/BRIEF-PRECOMMIT-SPEED-2026-07-18.md]
- **Hint-leak guard discipline.** A hint never performs arithmetic on the
  child's numbers, never eliminates options, never states or restates the
  answer (including disguised); the hint-leak guard runs against every rung of
  every ladder. When the guard fires, the rung is reworded before commit and
  every firing is disclosed in that lesson's commit message. [src: CLAUDE.md]
  [src: OVERNIGHT-REPORT-2026-07-19.md]
- **EXPLAIN PRECEDENCE rule.** When a question authors BOTH an in-markup
  explain and a frontmatter `explain:`, the markup text is what renders
  (markup wins), asserted by verify-calm's "g. EXPLAIN PRECEDENCE" check. A
  frontmatter explain must not open with the same text as the markup explain —
  that makes the markup-wins assertion undecidable and fails the suite.
  [src: docs/handoffs/HANDOFF-8.md] [src: OVERNIGHT-REPORT-2026-07-19.md]

## §5 Conversion standard

- **Full enrichment on every new conversion.** Every question ships with: a
  3-rung hint ladder (orient / method / nearly-does-it); `whyWrong` for EVERY
  distractor, each tagged with a misconception code from
  `docs/MISCONCEPTIONS.md` (new misconceptions get new codes added to the
  taxonomy in the same commit); a stepped solution walkthrough (goal / working /
  reason per step) ending with a takeaway and a verification step; and an
  `explain` line. [src: GRADE3-CHARTER.md]
- **Answers independently recomputed, always.** Recompute every answer in
  Python before authoring (`round_half_up`, `Decimal` for money; script asserts
  where formulaic). Figure-dependent keys are read from the SVG geometry and
  verified; a source document's printed answer is never copied into the
  computed field. Mismatches between source and computed answers are surfaced
  in the report. [src: CLAUDE.md] [src: OVERNIGHT-REPORT-2026-07-19.md]
  [src: BRIEF-G3-PILOT1-PREP-2026-07-19-v2.md]
- **Never pad.** Generate only to fill interaction-type and misconception gaps,
  never to pad the count; never drop supplied questions. [src: CLAUDE.md]
  Unattended runs convert at source question counts and flag sub-30 counts for
  the audit rather than inventing questions. [src: OVERNIGHT-REPORT-2026-07-19.md]
- **Thin-lesson top-ups by explicit ruling:** thin lessons (sub-30 questions)
  ship at source counts and are flagged. Top-ups happen only by Venkat's
  explicit ruling, as attended daylight briefs, and only to fill
  interaction-type or misconception gaps — never to pad a count.
  [src: chat-side ratification 2026-07-19, playbook-2]
- **Delivery is REMIX-only.** Ship the enriched remix lesson; faithful 1:1
  conversions of the Word documents are not a deliverable.
  [src: GRADE3-CHARTER.md] When the engine changes, the deploy drop is
  regenerated to md5-match the `engine/` sources and travels with the release —
  engine deploys first, lessons import second. [src: docs/handoffs/HANDOFF-11.md]
  [src: CLAUDE.md]
- **Sources live in the repo** (`sources/`, `sources-g3/`, `sources-gN/`),
  committed, so every lesson is traceable to its source document — standing
  rule from the 2026-07-18 audit.
  [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]
  [src: GRADE3-CHARTER.md]

## §6 Grade launch sequence (the crank)

1. **Intake.** Venkat stages the grade's Word documents; they are ingested into
   `sources-gN/` in the repo and committed. [src: GRADE3-CHARTER.md]
2. **Capability scan** (first session of the grade, once): inventory every
   question type, figure type, and interaction the documents imply; map against
   what the engine supports today → `docs/GRADEN-CAPABILITY-SCAN.md` (supported
   topics, convertible count, pilot candidates, suspected duplicates). Gaps
   become ENGINE REQUESTS routed per §1; the scan orders the work, it does not
   block all of it. [src: GRADE3-CHARTER.md] [src: docs/GRADE3-CAPABILITY-SCAN.md]
3. **Duplicate HOLD list** (`docs/GN-HOLD-DUPES.md`): every source the scan
   flags as a suspected duplicate is EXCLUDED from all conversion batches until
   Venkat rules — both/all members of every pair or group; nothing escapes the
   hold by being "probably the original".
   [src: BRIEF-G3-PILOT1-PREP-2026-07-19-v2.md]
4. **Three pilots.** Start with the scan's three recommended zero-gap pilot
   candidates; these first lessons are the grade's TEMPLATE — convert slowly,
   critique hard, then scale. Each pilot's variation plan is approved by
   Venkat's `y` before its conversion brief is written. [src: GRADE3-CHARTER.md]
   Pilots are attended-session work, never overnight-batch work: screenshot-
   based sources demand unrushed per-image reading and independent answer
   verification. [src: OVERNIGHT-REPORT-2026-07-19.md]
5. **Venkat's visual sign-off on the pilots,** playing them in his browser.
   The guards prove a lesson is correct; only his eyes prove it is good.
   [src: GRADE3-CHARTER.md] [src: WORKFLOW.md]
6. **Overnight batches** under the STOP-AND-SKIP doctrine (§7).
   [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]
7. **Lesson review + fix-batch protocol.** Venkat plays lessons from the index
   and sends screenshots + one line of feedback each; the chat adjudicates
   (some feedback is working-as-designed per design law); fixes batch into FIX
   briefs — one commit per item, address = lesson name + verbatim prompt
   snippet, a grep guard requiring exactly one match, scoreboard at the end.
   [src: GRADE3-CHARTER.md]

## §7 Unattended batch doctrine

- **STOP-AND-SKIP:** skip that one item, record it in the deviations section,
  and continue with the rest. Never halt the whole run for a single lesson's
  problem; never widen scope to "solve" a problem the brief doesn't authorize.
  [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]
- **Ledgers account for every input:** one row per source (converted / held /
  skipped, with reason), no source unaccounted for; BEFORE + added = AFTER
  shown per lesson; any number that moves outside the ledger fails the morning
  audit. [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]
- **An interrupted run is a successful partial run,** not a failure: whatever
  is committed is safe and complete per-lesson; report where the run stopped
  and what remains. Never rush a lesson to "finish the list".
  [src: docs/briefs/BRIEF-OVERNIGHT-CONVERSION-2026-07-18.md]

## §8 Per-grade state files

- **Each grade has its own charter** (`GRADEN-CHARTER.md`) stating its scope
  and fences. [src: GRADE3-CHARTER.md]
- **Corpus totals are tracked per grade,** reconciled at every milestone,
  independent of every other grade's — never mixed. [src: GRADE3-CHARTER.md]
- **Handoffs live in `docs/handoffs/`,** in per-grade series.
  [src: GRADE3-CHARTER.md]
- **Grade content lives in its own folders** (`lessons-gN/`, `review-gN/`,
  `sources-gN/`, manifest `LESSONS-MANIFEST-GN.md`); one grade's briefs never
  touch another grade's lesson files, reviews, or manifest.
  [src: GRADE3-CHARTER.md]

## §9 Session opening ritual (every grade chat, every session)

1. **Read this playbook.** (Structural — follows from the header: this file
   supersedes chat memory.)
2. **Read your own charter,** fully, before doing anything.
   [src: GRADE3-CHARTER.md]
3. **Read your own latest handoff.** Handoffs chain — each carries only the
   delta on top of the previous one. [src: docs/handoffs/HANDOFF-11.md]
4. **Entry check against the synced repo opens every session:** tree clean +
   engine `__version` + your grade's totals vs their recorded values (other
   grades' totals untouched). [src: GRADE3-CHARTER.md]
5. **Confirm the repo is connected and synced before proceeding;** if anything
   looks stale, Venkat syncs first. [src: GRADE3-CHARTER.md]

## §10 Change control

Only the engine chat amends this playbook, via brief. Every amendment
increments the version stamp (`playbook-2`, `playbook-3`, …) and is pushed.
Grade chats propose amendments by routing an ENGINE REQUEST-style note through
Venkat; they never edit this file.
[src: chat-side ratification 2026-07-19, playbook-2]
