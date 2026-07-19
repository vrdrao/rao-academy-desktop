# BRIEF-PLAYBOOK-AMEND-2026-07-19 — playbook-2: resolve UNKNOWNs, commit charter

Executor: Claude Code. Execute verbatim. Do not widen scope. Do not push.

## Entry check (abort with report if any fail)

1. `GRADE-ROLLOUT-PLAYBOOK.md` exists at repo root, version `playbook-1`,
   containing exactly 4 `UNKNOWN` markers.
2. `GRADE3-CHARTER.md` exists at repo root, untracked.
3. HEAD is e200afc or a descendant.

## Task A — verify the --no-verify deny (verification, not assertion)

Read the merged Claude Code permission settings in the repo's `.claude`
directory. Report verbatim: (a) the deny rules actually configured,
(b) whether any deny specifically matches `--no-verify`, (c) the
defaultMode value. Make no changes to settings. The playbook edit in
Task B depends on this finding.

## Task B — amend GRADE-ROLLOUT-PLAYBOOK.md to playbook-2

Bump the header to version `playbook-2`, same date. Then replace each
UNKNOWN with the chat-ratified text below, tagging each
`[src: chat-side ratification 2026-07-19, playbook-2]`.

### §3 permission mode — replace the UNKNOWN with:

"Permission mode is `defaultMode: auto` with a small curated allow list
and hard deny rules on `git push` (all shells) and on `--no-verify`,
merged in the repo's `.claude` settings. Auto mode is what makes
unattended overnight runs possible; the deny rules are what make it
safe."

EXCEPTION: if Task A found NO configured deny matching `--no-verify`,
write instead: "…hard deny on `git push` (all shells); `--no-verify` is
forbidden by rule (§3 above) — a configured permission deny for it is
recommended but not yet present." and list this in Deviations.

### §4 build inside, not beside — replace the UNKNOWN with:

"Build inside, not beside: when Venkat shares a reference file, work is
done by cloning and injecting into that file — never by rebuilding a
lookalike from scratch beside it. The reference is the ground truth for
structure and styling; a rebuild silently drops details the reference
carried."

Keep the two CLAUDE.md near-quotes in place beneath it as their own
separately-sourced rules (one-copy-of-the-card; engine fixes go in the
engine), no longer framed as candidates.

### §5 thin-lesson top-ups — replace the UNKNOWN with:

"Thin lessons (sub-30 questions) ship at source counts and are flagged.
Top-ups happen only by Venkat's explicit ruling, as attended daylight
briefs, and only to fill interaction-type or misconception gaps — never
to pad a count."

### §10 change control — replace the UNKNOWN block with:

"Only the engine chat amends this playbook, via brief. Every amendment
increments the version stamp (`playbook-2`, `playbook-3`, …) and is
pushed. Grade chats propose amendments by routing an ENGINE REQUEST-style
note through Venkat; they never edit this file."

### §2 veto ritual — append to the existing veto-ritual bullet:

"The ritual applies in every permission mode, auto included."
Tag: `[src: chat-side ratification 2026-07-19, playbook-2]`

Make no other edits to the playbook.

## Task C — commit

One commit containing exactly: the amended `GRADE-ROLLOUT-PLAYBOOK.md`,
the newly-tracked `GRADE3-CHARTER.md`, and this brief archived to
`docs/briefs/` (md5-verify the archive copy, then remove the root copy).
Commit message: `playbook-2: UNKNOWNs resolved, charter committed`.
Do NOT push.

## Report (paste back to chat)

1. Entry-check results.
2. Task A findings verbatim (deny rules, --no-verify match yes/no,
   defaultMode).
3. Diff-level summary of every playbook edit made (section, old marker,
   new text confirmed in place), and confirmation exactly 0 UNKNOWN
   markers remain.
4. Commit hash and its exact file list.
5. Deviations (mandatory, even if none).
