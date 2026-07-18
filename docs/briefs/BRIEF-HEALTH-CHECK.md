# BRIEF — One-time system health audit (READ-ONLY)

Read CLAUDE.md first. This is a read-only audit. Change nothing, commit
nothing, push nothing. Every check reports actual output, not summaries.

1. TREE — git status. Expected: clean, no untracked files. Report
   anything present.
2. ENGINE — print the __version string from engine/preview-engine.js.
   Expected: rao-master-18.
3. GUARDS — run npm test, full suite. Print the final banner and the
   result of every guard. All green expected.
4. TOTALS — re-derive corpus totals from disk: count lesson files and
   count questions by running each lesson through the engine's build().
   Compare against the recorded 104 lessons / 2,722 questions. Report
   both numbers and any mismatch plainly.
5. COMMIT PROVENANCE — git log --oneline -30. For each commit, name the
   brief or handoff that authorized it (BRIEFS.md, docs/handoffs/).
   Flag any commit you cannot trace to an authorized brief. Do not
   launder an untraceable commit into a benign-sounding label — list it
   as UNTRACED.
6. DEPLOY DROP — verify deploy-drop/ still md5-matches its repo sources
   (16/16 expected, same method as the STAGING-18 verification).
7. REPORT — one section per check, PASS/FAIL at the top of each.
   Anything you could not verify goes in its own UNVERIFIED section;
   absence of that section is itself an audit flag.

Delete this brief file (BRIEF-HEALTH-CHECK.md) after reading so the
tree stays clean. It is not to be committed.
