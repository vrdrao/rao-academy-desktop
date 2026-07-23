BRIEF-COMMIT-PUSH-1
Chat-authored 2026-07-22. Supersedes nothing. One task, three phases, two STOP gates.

CONTEXT
The working tree has carried the #75 geometry fix, its guard, six regenerated
review pages, and seven new ISSUES entries since HANDOFF-42 was written. Nothing
is committed. Nothing is pushed. HEAD is believed to be 4dbe2cc — VERIFY, do not
assume.

engine/geometry-engine.js (~962 KB) is UNTRACKED. The entire #75 fix depends on
it. A `git commit -a` will NOT stage it, because -a only stages already-tracked
files. If this commit lands without it, all 31 construct questions break for the
next clone or deploy and the bug you just fixed silently returns.

SCOPE FENCE
Grade 4 and Grade 3 both in scope for this commit (the tree already contains
both). Do not author, edit, or regenerate any lesson content in this brief. This
is a version-control task only. No content changes. No engine changes.

────────────────────────────────────────────────
PHASE 1 — ENUMERATE (read-only). STOP at the end.
────────────────────────────────────────────────
Run and report verbatim output for each:

  1. git log --oneline -3
  2. git status --porcelain=v1
  3. git status --porcelain=v1 --untracked-files=all
  4. git ls-files --error-unmatch engine/geometry-engine.js ; echo "EXIT=$?"
  5. ls -l engine/geometry-engine.js
  6. git remote -v
  7. git log --oneline origin/main..HEAD
  8. git status --porcelain=v1 -- review/
     Report EVERY path under review/ that shows as modified, one per line, full
     relative path. Do not summarise as "6 pages" or "review/*" — Venkat needs
     the actual filenames to open them in a browser.
  9. For each file listed in step 8, report whether it contains the inlined
     geometry engine, as a two-column list of "<path>  <YES|NO>":
       grep -l "raoGeoEngine\|geometry-engine" review/<file>
     Use whatever exact marker string tools/make-review.js actually inlines —
     read make-review.js first to find it, and report which string you searched
     for. If the marker is ambiguous, report that and do not guess.
 10. Report the count from step 8. If it is not 6, say so explicitly and report
     the actual number. Do not reconcile it against HANDOFF-42 yourself.

For each modified (M) or added (A) path in step 2, also report:
  git diff --stat <path>        (for M)
  git diff --cached --stat <path>  (for A/staged)

Do NOT stage anything. Do NOT commit. Do NOT push.

Report and STOP. Wait for chat to authorize Phase 2 against an enumerated list.

Expected from HANDOFF-42 (confirm or contradict — contradiction is a finding,
not a failure; report it plainly rather than reconciling it yourself):
  M  tools/make-review.js
  M  package.json
  M  docs/ISSUES.md
  M  review/*            (6 construct pages)
  A  tools/verify-geo-wired.js   (staged, not committed)
  ?? engine/geometry-engine.js   (untracked)

If the real tree differs from this list in ANY way — extra files, missing files,
different paths — say so explicitly in the report. Do not silently absorb the
difference.

────────────────────────────────────────────────
PHASE 2A — READ THE UNEXPLAINED DIFFS (read-only). STOP at the end.
────────────────────────────────────────────────
Phase 1 found seven tracked changes that HANDOFF-42 never mentioned. They have no
provenance in this session's record. Before anything is staged, chat needs to see
what they actually do.

Do NOT stage. Do NOT commit. Do NOT push. Do NOT edit any file in this phase.

  1. Report the FULL diff (not --stat) for each:
       git diff package.json
       git diff tools/verify-calm.js
       git diff tools/verify-reset.js
       git diff tools/verify-touch.js
       git diff engine/rao-card.css

  2. For the two large ones, report the full diff as well, but if either exceeds
     ~400 lines of diff output, report the first 200 lines and say clearly how
     many lines were withheld. Do not summarise instead of showing:
       git diff engine/rao-card.js
       git diff engine/solution-renderer.js

  3. Report the full staged diff for the second guard:
       git diff --cached tools/verify-solpanel.js
     If it exceeds ~400 lines, report the first 200 and state the count withheld.

  4. GUARD-WEAKENING CHECK. For each of verify-calm.js, verify-reset.js,
     verify-touch.js, answer these three questions explicitly, quoting the exact
     diff lines that justify each answer:
       (a) Were any assertions REMOVED or made less strict?
       (b) Were any test cases, selectors, or corpus paths NARROWED, skipped, or
           filtered out?
       (c) Were any thresholds, timeouts, or tolerances LOOSENED?
     If the answer to any is yes, quote it and say so plainly. A guard that was
     weakened to make a test pass is the single worst outcome here. Do not
     rationalise a weakening as a "fix" — report it and let chat rule.

  5. PACKAGE.JSON SCOPE CHECK. The package.json diff is +2/-1. State exactly
     which guard(s) it wires into npm test. Name them. If it wires
     verify-solpanel.js as well as verify-geo-wired.js, say so explicitly.

  6. For each of the seven unexplained changes, state in ONE line whether it
     relates to: (i) the #75 geometry fix, (ii) the item-81 / solution-panel
     work, (iii) something else entirely. If you cannot tell, say "UNKNOWN" —
     do not infer a plausible-sounding origin. An honest UNKNOWN is correct here;
     a confident guess is not.

Report and STOP. Do not proceed to Phase 2B.

────────────────────────────────────────────────
PHASE 2B — STAGE AND COMMIT BOTH STORIES. STOP at the end.
────────────────────────────────────────────────
Do not begin until chat has explicitly authorized Phase 2B after reading 2A.

RULING (Venkat, this session): ONE commit covering both the #75 geometry fix and
the BRIEF-G3-ENGINE-1 solution-panel cluster. The earlier two-commit plan is
CANCELLED. Reason: package.json wires verify-solpanel.js and verify-geo-wired.js
into npm test in the same edit. Splitting it would produce a commit whose test
suite references a file that commit does not contain — npm test would fail on a
fresh clone, and the pre-push hook runs the full suite. The two stories are
already entangled; this commit records that honestly rather than inventing a
clean separation that was never real.

  1. git add engine/geometry-engine.js
     THIS IS A MANDATORY, SEPARATE, EXPLICIT LINE. Do not fold it into any other
     add. Do not use `git add -A` or `git commit -a` as a substitute.

  2. git status --porcelain=v1 --untracked-files=all
     Confirm engine/geometry-engine.js now shows as A (added), not ?? .
     Report the output.

  3. Stage these paths, each named explicitly. tools/verify-solpanel.js is
     ALREADY staged from a previous session — leave it staged, do not re-add and
     do not unstage it.

     Geometry (#75):
       tools/make-review.js
       tools/verify-geo-wired.js
       review/Create figures with a given area.html
       review/_type-coverage.html
       review/perimeter_remix.html
       review/select-area-remix.html
       review/symmetry_remix.html
       review/symmetry_set2.html

     Solution panel (BRIEF-G3-ENGINE-1):
       engine/rao-card.js
       engine/rao-card.css
       engine/solution-renderer.js
       tools/verify-calm.js
       tools/verify-reset.js
       tools/verify-touch.js

     Both:
       package.json
       docs/ISSUES.md

  4. Stage NOTHING ELSE. Every untracked file stays untracked — the BRIEF-*.md,
     HANDOFF-*, REPORT-* markdown, docs/audits/*, mockup/wrong-state-mockup.html,
     engine/robo_motion_lab_v27.html, lessons-g3/multiplication_facts_up_to_10.html,
     and review/multiplication_facts_up_to_10.html are all OUT. Leaving them
     untracked is intended, not an oversight.

     NOTE: verify-tracked.js asserts every file in lessons/ and tools/ is
     git-tracked. The two untracked files under lessons-g3/ and review/ are
     outside those directories, so the guard should not fire. If it DOES fire,
     STOP and report the exact output — do not stage anything to silence it.

  5. git status --porcelain=v1 --untracked-files=all
     Report. Verify every path in step 3 is staged, including
     tools/verify-solpanel.js, and that nothing from step 4 is staged. If
     anything unintended is staged, STOP and report — do not commit.

  6. Commit with this message:

     Fix #75 geometry wiring + BRIEF-G3-ENGINE-1 solution panel

     Two stories, committed together because package.json wires both guards
     into npm test and cannot be split cleanly.

     GEOMETRY (#75):
     - engine/geometry-engine.js was untracked; now committed. Root cause of
       silently dead geometry: on disk but never in the build asset set.
     - Option B inlining (Ruling 20): geometry engine inlined only into review
       pages whose lesson source contains a construct question. 5.6 MB, not the
       98.7 MB of Option A.
     - tools/verify-geo-wired.js: guard with an INDEPENDENT construct detector
       (data-type="construct") from build()'s sourceNeedsGeo, so a future
       construct lesson missed by the builder makes the two disagree and the
       guard fails. Sabotage-proved on broken detection and on removed wiring.
     - 31/31 construct questions render and are answerable.

     SOLUTION PANEL (BRIEF-G3-ENGINE-1, Items 63/65/66):
     - engine/rao-card.js, rao-card.css, solution-renderer.js: five engine law
       changes, incl. table/facts/rule solution blocks.
     - tools/verify-solpanel.js: new fixture covering all five changes.
     - verify-calm.js, verify-reset.js, verify-touch.js re-pointed onto the
       reversed laws. Each re-point replaces one condition with a strictly
       larger set; no assertion removed, no corpus narrowed, no threshold
       loosened. Verified diff-by-diff before commit.

     BOTH:
     - package.json wires verify-solpanel.js and verify-geo-wired.js into
       npm test, plus a test:geo alias.
     - docs/ISSUES.md: #75 and #76 closed; #84-#90 appended.
     - #76 closed NOT-A-DEFECT: categorize grading is identity-keyed, proved by
       live round-trip. 154 questions / 68 files, 0 at risk.

  7. git log --oneline -2 and git status --porcelain=v1
     Report both.

Do NOT push. Report and STOP.

NOTE ON THE PRE-COMMIT HOOK: the fast subset runs at commit. If it fails, STOP
and report the exact output verbatim. Do not edit any file to make it pass. Do
not stage anything further to make it pass. A failing hook here is information,
not an obstacle.

────────────────────────────────────────────────
PHASE 3 — PUSH. Only on explicit chat authorization.
────────────────────────────────────────────────
  1. git log --oneline origin/main..HEAD
     Report. Must show exactly one commit — the one from Phase 2B. If it shows
     more, STOP and report; do not push.

  2. Push via the normal path so the pre-push hook fires and runs the full suite
     (~15-25 min). Do not bypass. Do not use --no-verify. If the hook fails,
     STOP, report the full failure output, and do not retry or "fix" anything.

  3. On success: git log --oneline -1 and git status --porcelain=v1. Report both.

────────────────────────────────────────────────
POST-PUSH VERIFICATION (chat-side, not yours)
────────────────────────────────────────────────
Chat will independently confirm engine/geometry-engine.js is present on origin by
fetching it from GitHub. Do not do this yourself.

────────────────────────────────────────────────
HARD RULES
────────────────────────────────────────────────
- Never use `git commit -a`.
- Never use `git add -A` or `git add .`.
- Never stage any file not named in Phase 2B step 3, under any circumstances,
  including to make a hook pass. In particular, no BRIEF-*.md, HANDOFF-*,
  REPORT-*, docs/audits/*, mockup/*, engine/robo_motion_lab_v27.html, or the
  untracked lessons-g3/ and review/ multiplication_facts_up_to_10.html pair.
- Never use `--no-verify`.
- Never amend, rebase, reset, or force-push.
- Never touch lessons/, lessons-g3/, sources/, or sources-g3/ in this brief.
- Never make a content or engine change to "fix" a failing test. Failing test =
  STOP and report.
- If anything at all is ambiguous, STOP and report the exact text. Do not decide.
