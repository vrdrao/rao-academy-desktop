# BRIEF-PLAYBOOK-3-2026-07-19 — §6.3 hold scope clarified (twins ruling)

Executor: Claude Code. Execute verbatim. Do not widen scope. Do not push.
Do NOT run while any other brief is executing (one task at a time).

## Entry check (abort with report if any fail)

1. `GRADE-ROLLOUT-PLAYBOOK.md` exists at repo root, version `playbook-2`,
   zero `> UNKNOWN` markers.
2. HEAD is 0e62cdb or a descendant.

## Task A — amend §6.3

Append this text to §6.3, verbatim, as its final sentences:

"The hold covers intra-grade suspected duplicate sources (which-copy-
survives questions). Cross-grade topic twins are enumerated in the same
register for awareness but are NOT held; each twin's variation plan must
state its differentiation from the other grade's lesson."

Tag: `[src: Grade 3 chat amendment request via Venkat, ratified by
engine chat 2026-07-19, playbook-3]`

## Task B — header housekeeping

1. Bump the header version to `playbook-3`, same date.
2. Rewrite the now-vestigial header sentence about UNKNOWN markers
   ("Rules that could not be found … are marked UNKNOWN …") to:
   "Every rule below carries a source tag: a repo file, or a chat-side
   ratification recorded by amendment. A rule that cannot be sourced
   does not enter this file — it is marked UNKNOWN pending chat-side
   text, per the anti-laundering law."

Make no other edits to the playbook.

## Task C — commit

One commit containing exactly: the amended `GRADE-ROLLOUT-PLAYBOOK.md`
and this brief archived to `docs/briefs/` (md5-verify the archive copy,
then remove the root copy).
Commit message: `playbook-3: §6.3 hold scope — intra-grade holds,
cross-grade twins registered not held`.
Do NOT push.

## Report (paste back to chat)

1. Entry-check results.
2. The full amended §6.3 text and the rewritten header sentence, as they
   now stand in the file.
3. Commit hash and exact file list.
4. Deviations (mandatory, even if none).
