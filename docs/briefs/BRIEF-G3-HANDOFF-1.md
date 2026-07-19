# BRIEF-G3-HANDOFF-1 — Commit the milestone handoff (small, deterministic)

1. Entry check (light): `git status --porcelain` — expected untracked:
   `HANDOFF-G3-1.md` and this brief in the root, nothing else. HEAD
   expected: 8a38c52. Anything else → STOP and report.
2. `git mv` is not applicable (new file): move `HANDOFF-G3-1.md` from the
   root to `docs/handoffs/HANDOFF-G3-1.md` (plain move; md5 before/after
   identical — report both).
3. Archive this brief to `docs/briefs/BRIEF-G3-HANDOFF-1.md` (md5-verify,
   remove root copy).
4. Stage exactly those two paths. Commit locally (30-min timeout, never
   --no-verify), message: `HANDOFF-G3-1: pilot 1 milestone`
5. Do NOT push. Report: hash, `git show --stat`, gate closing output,
   final `git status --porcelain` (expected empty), Deviations section
   (mandatory).
