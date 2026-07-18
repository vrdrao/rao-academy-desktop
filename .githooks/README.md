# Git hooks

These hooks are versioned in the repo and activated via `core.hooksPath`.

## Activate after a fresh clone (one time)

Git does **not** auto-enable a repo's `core.hooksPath` on clone (for security).
After cloning, run once:

```
git config core.hooksPath .githooks
```

## The hooks (fast commit gate, full push gate — BRIEF-PRECOMMIT-SPEED, 2026-07-18)

- **pre-commit** — runs `npm run test:fast` (~1–2 min: Node-only grading of the
  full corpus + authoring/format/firewall guards) and **blocks the commit if it
  fails**. The heavy browser suites moved to push time.
- **pre-push** — two gates, in order:
  1. **Blocks force / history-rewriting pushes** (anything not a fast-forward).
     History is append-only — see CLAUDE.md "NEVER REWRITE HISTORY".
  2. **Runs the FULL `npm test` (~12–15 min) and blocks the push on any failure.**
     This is where the safety invariant lives: no commit reaches origin without
     the complete suite green on that exact tree. Do not abort it mid-run.

**`--no-verify` is forbidden** (CLAUDE.md, THE ONE RULE). git offers it as a
built-in escape hatch for both hooks; never use it.

(The old post-commit auto-push hook was removed deliberately — commits stay
local until Venkat says push.)
