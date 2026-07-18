# BRIEF — Audit closeout (docs only, one commit)

Read CLAUDE.md first. This brief touches documentation only. No lesson,
engine, tool, or config file may change.

1. ARCHIVE THE AUDIT — save the full health-audit report you produced
   this session (all seven sections, including the reprinted §4 table)
   to docs/audits/AUDIT-2026-07-18.md, verbatim.
2. RETROACTIVE AUTHORIZATION — append a short section to that same file
   titled "Untraced commits — resolved":
   - 2515a4f (deploy-drop for tulipmath.com): directed by Venkat in
     chat; corroborated by STATUS.md "Deploy state" and HANDOFF-9.
     Ruled AUTHORIZED retroactively, 2026-07-18.
   - fb22f81 (gitignore settings.local.json): Venkat's standing
     instruction, previously recorded only in session memory. Ruled
     AUTHORIZED retroactively, 2026-07-18.
3. ESTABLISH docs/briefs/ — create the folder. Copy this brief file
   into it as docs/briefs/BRIEF-CLOSEOUT-2026-07-18.md. New standing
   rule, add to CLAUDE.md under Working style: "Every executed brief
   file is committed to docs/briefs/ as part of its own work's commit.
   Briefs are archived, never deleted — the paper trail outranks a
   tidy tree."
4. KNOWN-DEFECT REGISTER — add to STATUS.md: the 7 warn-level missing
   figures (equal-groups ×2 in Division_facts_to_10, sequence ×5 in
   number-patterns-word-problems-remix) are a KNOWN DEFECT awaiting an
   engine brief that will (a) implement both figure types and
   (b) promote unknown data-show from warn to build-failing error.
5. STATUS.md REFRESH — update it to describe the current state:
   rao-master-18, the complete review set + index + manifest
   (commit 5eb6297), and the health audit of 2026-07-18. Remove or
   mark done anything it still describes as pending that has shipped.
6. One commit containing exactly: docs/audits/AUDIT-2026-07-18.md,
   docs/briefs/BRIEF-CLOSEOUT-2026-07-18.md, the CLAUDE.md rule
   addition, and the STATUS.md changes — and nothing else. Delete the
   copy of this brief at the repo root (the docs/briefs/ copy is the
   permanent record). npm test green. Print git status and the commit
   hash. Do not push.
