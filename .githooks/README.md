# Git hooks

These hooks are versioned in the repo and activated via `core.hooksPath`.

## Activate after a fresh clone (one time)

Git does **not** auto-enable a repo's `core.hooksPath` on clone (for security).
After cloning, run once:

```
git config core.hooksPath .githooks
```

## The hooks

- **pre-commit** — runs `npm test` and **blocks the commit if it fails**.
  Bypass (rarely, and only if you must): `git commit --no-verify`.
- **post-commit** — runs `git push` automatically after a successful commit,
  so a commit is also a backup. If the push fails (e.g. no internet) it prints
  a loud `NOT PUSHED — YOU ARE NOT BACKED UP` warning; the commit still stands
  locally, so just run `git push` again once you are online.
