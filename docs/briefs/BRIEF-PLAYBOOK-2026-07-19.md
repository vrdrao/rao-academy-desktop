# BRIEF-PLAYBOOK-2026-07-19 — Create GRADE-ROLLOUT-PLAYBOOK.md

Executor: Claude Code. Execute verbatim. Do not widen scope. Do not push.

## Objective

Create ONE file, `GRADE-ROLLOUT-PLAYBOOK.md`, at the repo root. It becomes
the single versioned source of truth for every rule that applies to ALL
grades. Grade chats will read it at the start of every session. When a rule
changes, it is amended here and nowhere else.

## Entry check (abort with a report if any fail)

1. `git status` clean OR only the untracked Grade-3 prep files expected
   from BRIEF-G3-PILOT1-PREP (list exactly what is untracked in your
   report).
2. HEAD is d721a03 or a descendant of it.
3. These source files exist: `CLAUDE.md`, `WORKFLOW.md`,
   `GRADE3-CHARTER.md`, `docs/GRADE3-CAPABILITY-SCAN.md`,
   `OVERNIGHT-REPORT-2026-07-19.md`, and `docs/handoffs/` is non-empty.

## Method — assembly, not authorship

Every rule in the playbook MUST be extracted from an existing repo file.
For each rule, append a source tag in this form: `[src: CLAUDE.md]` or
`[src: docs/handoffs/HANDOFF-11.md]`.

If a section below names a rule you cannot find stated in any repo file,
DO NOT write it from your own memory or general knowledge. Instead insert:
`> UNKNOWN — not found in repo files; needs chat-side text.` and list it
in your Deviations section. The chat will supply the missing text in a
follow-up. Laundering an unknown into confident prose is a violation.

## Required structure of GRADE-ROLLOUT-PLAYBOOK.md

Header block: title, version `playbook-1`, date, and this sentence
verbatim: "This file supersedes chat memory. If any chat's recollection
of a rule conflicts with this file, this file wins; report the conflict
to the engine chat."

### §1 Roles and fences
- Chat-side decides, adjudicates, writes briefs, audits. Claude Code
  executes only; never decides scope; never pushes (hard-denied).
- Engine (`engine/preview-engine.js`) is owned by the engine chat alone.
  Grade chats route engine requests there; they never commission engine
  work. Engine is forward-only; rollback prohibited.
- ONE Claude Code task at a time, repo-wide, across all grades.
- Venkat pushes only after chat-side audit clears, via TortoiseGit,
  enumerated ("X and nothing else"), then Syncs the Context panel card.

### §2 Rituals
- Briefs travel as files in the repo root; invocation line is exactly:
  `Read <FILE> in the repo root and execute it verbatim.` Long pastes
  banned. Briefs are archived to `docs/briefs/` in their work's commit.
- Veto ritual: clear any pre-typed input in Claude Code before pasting.
  Applies in every mode.
- Browser downloads may arrive renamed `<name> (1).md`; verify content,
  archive under canonical names.
- Every closed milestone triggers a handoff document unprompted.

### §3 Gates and permissions
- Pre-commit = fast gate (~5 s). Pre-push = FULL suite (~15–25 min),
  blocks push on failure, fires from TortoiseGit. Never abort a push
  mid-hook. `--no-verify` forbidden and permission-denied.
- A blocked push is the gate working. An abrupt mid-list stop with no
  FAIL line = suspect browser flake; re-run the failing tool standalone
  before touching anything.
- Permissions: auto mode, curated allow list, hard deny on git push and
  --no-verify. "Don't ask again" grants are prohibited.

### §4 Laws (all grades, all content)
Extract each with its source tag: answer-leak rule (figures never show
the answer) · no intermediate surface between card face and content ·
one spotlight at a time · green exactly twice · no-repaint law · build
inside, not beside · chase every number that changes · fix the general
case, not the file · anti-laundering · prove guards fail before trusting
them (break → FAIL → restore → PASS) · deviations section mandatory in
every brief report · hint-leak guard discipline · EXPLAIN PRECEDENCE
rule.

### §5 Conversion standard
- Full enrichment on every new conversion; whyWrong full coverage.
- Answers independently recomputed (script asserts; SVG/screenshot
  reading verified, never trusted), mismatches surfaced in the report.
- Ship at source question counts; never pad. Thin lessons may get
  daylight top-ups only by explicit ruling (fill gaps, never pad).
- Delivery is REMIX-only plus updated engine when the engine changes.
- Sources live in the repo (`sources/`, `sources-g3/`, `sources-gN/`);
  every lesson traceable to its source.

### §6 Grade launch sequence (the crank)
1. Ingest sources to `sources-gN/` (committed).
2. Capability scan → `docs/GRADEN-CAPABILITY-SCAN.md` (supported topics,
   convertible count, pilot candidates, suspected duplicates).
3. Duplicate HOLD list (`docs/GN-HOLD-DUPES.md`): BOTH members of every
   suspected pair held, excluded from all batches until Venkat rules.
4. Three pilots, daylight sessions, full standard; each needs a
   variation plan approved by `y` before its conversion brief.
5. Venkat's visual sign-off on the pilots in his browser.
6. Overnight batches under STOP-AND-SKIP.
7. Lesson review + fix-batch protocol (screenshots + one line each;
   chat adjudicates; one item per commit; exactly-one-match grep guard;
   scoreboard).

### §7 Unattended batch doctrine
- STOP-AND-SKIP: skip the item, record, continue; never halt, never
  widen scope. Ledgers account for every input. An interrupted run is a
  successful partial run.

### §8 Per-grade state files
- `GRADEN-CHARTER.md` (scope + fences), grade status/totals kept per
  grade and never mixed, handoffs in `docs/handoffs/`, separate content
  folders (`lessons-gN/` etc.).

### §9 Session opening ritual (every grade chat, every session)
1. Read this playbook. 2. Read own charter. 3. Read own latest handoff.
4. Entry check against the synced repo (tree state, engine __version,
   own grade's totals). 5. If anything looks stale, ask Venkat to Sync
   before proceeding.

### §10 Change control
- Only the engine chat amends this playbook, via brief. Every amendment
  increments the version stamp (`playbook-2`, …) and is pushed.

## Constraints

- Modify NOTHING except creating `GRADE-ROLLOUT-PLAYBOOK.md` and
  archiving this brief to `docs/briefs/` at commit time.
- Do not touch the Grade-3 prep files if present.
- Commit message: `playbook-1: single source of truth for grade rollout`.
  Commit only these two files. Do NOT push.

## Report (paste back to chat)

1. Entry-check results, including exact untracked files found.
2. The full text of GRADE-ROLLOUT-PLAYBOOK.md.
3. Count of rules tagged per source file (e.g. "CLAUDE.md: 9 rules,
   HANDOFF-11: 3 rules …").
4. Every UNKNOWN inserted, listed.
5. Deviations section (mandatory, even if "none").
