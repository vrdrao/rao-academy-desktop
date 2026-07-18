# BRIEF — PRE-COMMIT SPEED: FAST COMMIT GATE, FULL PUSH GATE (2026-07-18)

## PRE-CHECK (report before proceeding; STOP on any mismatch)

1. `git status` — tree clean, branch main, in sync with origin/main at `1f54183`.
2. Engine `__version` is exactly `rao-master-18`.
3. Corpus totals: 104 lesson files / 2,722 questions.

## Problem

The pre-commit hook runs the full `npm test` (~12-15 min, including real-Chromium
rendering of all 104 lessons) on EVERY commit. Today this killed one commit via
Claude Code's command timeout and taxed every other commit ~12 minutes. The
upcoming fix-batch protocol is one-commit-per-item; ten items would cost ~2
hours of pure waiting.

## The design (implement exactly this; STOP and report if it can't hold)

**Safety invariant, unchanged:** no commit reaches origin/main without the FULL
suite green on that exact tree. Only the timing moves.

1. **Pre-commit hook → FAST subset.** Target under ~2 minutes. Must include:
   - The Node-only grading harness across the full corpus (build + grade
     correct + reject wrong for all 2,722 — no browser).
   - `verify-format.js`.
   - Corpus-count guard (the CORPUS TOO SMALL check stays in the fast path).
   You choose what else fits the time budget; report the final fast-path
   contents and its measured wall time. Browser-based checks (verify-styles,
   calm/touch/robo suites) move OUT of the commit path.
2. **Pre-push hook → FULL suite.** `git push` runs the complete `npm test`
   exactly as today and BLOCKS the push on any failure. The banner must print
   in the push output. There is no flag, env var, or argument that skips it —
   if git offers `--no-verify`, note in the report that it exists as a git
   built-in and add a line to CLAUDE.md forbidding its use.
3. **TortoiseGit compatibility is a hard requirement.** Venkat pushes via
   TortoiseGit on Windows. Verify the pre-push hook actually fires from
   TortoiseGit's Push dialog (not just CLI git). If TortoiseGit does not honor
   the repo's hooks path, wire it via its Settings > Hook Scripts or
   core.hooksPath so it does — and say exactly what you configured. If it
   cannot be made to fire from TortoiseGit at all, STOP and report; do not
   ship a gate Venkat's actual tool bypasses.
4. **Hook runtime + Claude Code timeouts.** The full suite now runs at push
   time; pushes will take ~15 min. Add one line to WORKFLOW.md stating pushes
   run the full suite and must never be aborted mid-hook, and that any
   Claude Code shell command wrapping a push/commit must use a 30-minute
   timeout.

## Rider (same commit, explicitly in scope)

Add to the card-anatomy table in `docs/CALM-CARD-MASTER-SPEC-v1.md` (§1) a row
for the question-body surface: NO intermediate surface between the card face
(#fff) and the question content — `.qbody` background transparent; authority
BRIEF-CARD-LOOK-2, 2026-07-18. One-line revision note citing this brief.

## Guards (guard-first proof required, actual output)

1. **Fast path catches real breakage:** sabotage one answer key in a lesson →
   COMMIT must FAIL in the fast hook, show the actual FAIL line → restore.
2. **Push gate catches what the fast path can't see:** sabotage a
   style-guarded value (e.g. frame 3px → 5px) → commit SUCCEEDS through the
   fast hook (expected — show it) → `git push` to a throwaway target must
   FAIL in the pre-push hook with the verify-styles FAIL line → restore.
   Do NOT push anything to origin/main during this proof — use a local bare
   repo as the push target and say so in the report.
3. Timings reported: fast hook wall time, full push-gate wall time.
4. Full `npm test` green on the final tree; totals 104 / 2,722.

## Report requirements

- Final contents of both hooks (what runs where), with measured times.
- Exactly how TortoiseGit was verified/wired to fire the pre-push hook.
- md5 + bytes for every shipped file changed.
- Firewall: no grading file changes; FIREWALL_ALLOW_GRADING never set.
- Anything not implemented faithfully in its own section; absence of that
  section is an audit flag.
- Commit this brief to `docs/briefs/` in the work's commit.
- Commits stay LOCAL. No push. Venkat pushes after the chat audit clears —
  and that push will be the first live run of the new push gate.
