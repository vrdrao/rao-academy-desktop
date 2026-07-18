# WORKFLOW — how to work with Claude Code

**For Venkat. Plain language. This is the operating manual.**

---

## The shape of the thing

You have two tools, and they are good at different jobs.

| | Good at | Bad at |
|---|---|---|
| **Chat (claude.ai)** | *Deciding what to do.* Thinking through a problem, spotting what's actually wrong, writing a precise brief. | Doing it. It can't touch your files, run your tests, or see your repo. |
| **Claude Code (terminal)** | *Doing it correctly.* Running tests, editing files, proving guards fail, sweeping 102 files at once. | Deciding what to do. Left alone, it will process file-by-file when the fix is global, and it will ask you permission for things you don't care about. |

**The relay is the right shape:** figure it out in chat → hand Claude Code a precise brief →
paste the result back into chat if something looks off.

You asked why chat *felt* faster. It felt faster because it skipped verification. Claude
Code is slower in the visible part and faster in the invisible part — you don't re-fix the
same bug next week.

---

## Setup

- **Repo:** `C:\Users\Venkat Rao\Desktop\rao-academy`
- **Launch:** `cd "C:\Users\Venkat Rao\Desktop\rao-academy"` then `claude`
- **Use the terminal, not the desktop app.** The desktop app has documented bugs with
  working directories on Windows — it silently inherits stale directories and has no folder
  picker on a new session.
- The green ticks and red circles in Explorer are **TortoiseGit** status badges. Not OneDrive.

---

## Sessions and memory — this matters

**Claude Code has a working-memory limit, like chat.** As a session runs long, it fills up.
When it gets close to full, Claude Code **auto-compacts**: it summarises everything so far
and throws the details away.

**That summary is lossy.** The subtle stuff — a decision you made, a gotcha it found, an
exception to a rule — gets flattened or dropped. This is where hallucinations and "it forgot
the rule we agreed" errors come from. It is very likely a large part of why the engine kept
reverting to stale versions across ~90 sessions.

### Three things protect you

1. **`CLAUDE.md` is read from disk every session and survives compaction.** Anything that
   must never be forgotten belongs in that file, not in the conversation. **If you find
   yourself repeating an instruction, it is a `CLAUDE.md` entry.**

2. **Your guards are the real safety net.** `npm test`, `verify-format`, `verify-styles` run
   on disk, not from memory. If Claude Code forgets a rule and breaks something, the guard
   catches it. *This is why proving the guards fail was worth the four minutes.*

3. **Start fresh deliberately.** Don't let it auto-compact. Use `/clear` when you finish a
   chunk of work. A clean session that re-reads `CLAUDE.md` is more reliable than a long one
   running on a lossy summary.

### The clear-and-restart ritual

Before `/clear`:
```
Before I clear the session — persist state to disk.

1. Update STATUS.md: what's done, what's in progress, what's next,
   and anything you learned that a fresh session would otherwise
   have to rediscover.
2. Update CLAUDE.md with any new rule or gotcha worth keeping.
3. Commit both locally. Do not push.

Give me the commit hash and stop.
```

After `/clear`:
```
Read CLAUDE.md and STATUS.md. Tell me where we are and what's next.
```

The conversation dies. The state survives. That's the whole trick.

---

## Pushing — the full suite runs at push time

**A `git push` runs the complete `npm test` (~15 minutes) in the pre-push hook and
blocks the push if anything fails. Never abort a push mid-hook** — killing it half-way
proves nothing and leaves you unsure what state the gate saw. Let it finish either way.
(Committing is fast now — a ~1–2 minute subset; the full browser suite moved to push
time. Same safety, different moment: nothing reaches GitHub without the full suite
green on that exact tree.) Any Claude Code shell command that wraps a `git push` or
`git commit` must use a **30-minute timeout** — the default 2-minute timeout has
already killed one commit mid-hook.

---

## Permissions — the trap you already hit

**"Yes, don't ask again" saves the ENTIRE compound command, not just the safe part.**

That is how the permission leak happened: an approved rule contained a chain ending in
`ls "/c/Users/Venkat Rao/Desktop/"*.html` — reaching outside the repo. Once approved, it
was approved forever.

**Rule: approve compound commands ONCE. Never "always".**
Only approve "always" for a single, simple, obviously-safe command (`npm test`).

**Current state:** workspace is `rao-academy` only. Allow list is `npm install`, `npm test`,
`npx playwright install chromium`. Deny list empty.

**Still to do:** lock `.claude/settings.json` to an allow-only model plus an OS-level
sandbox. **Deny rules alone don't stop a Node or Python script that opens a file directly.**
Only the sandbox does.

---

## Why it asks permission so much

Claude Code prefixes commands with `cd "/c/Users/..."`, and the `cd && git` pattern trips a
hardcoded "bare repository attack" check — so it prompts you every single time.

**Fix:** tell it to stop using `cd`. It's already in the directory. This is now in
`CLAUDE.md`.

---

## The two standing demands

Say these often enough and they become the default.

### 1. "Prove the guard fails."
Any time Claude Code adds a check, guard, or test:
> *Break the thing it protects. Run the guard. Show me the FAIL output — the actual numbers,
> not a summary. Then restore.*

A guard that has never been observed failing is a guard you are trusting on faith.

### 2. "Fix the general case."
Any time it starts working file-by-file:
> *If three or more files share this defect, stop. Fix the general case, sweep, and tell me.*

The four mobile bugs were one CSS change that fixed every lesson. All 102 legacy files had
one identical defect. Both were nearly done the slow way.

---

## Reading its output — what to be suspicious of

Claude Code is good but it will occasionally launder an unknown into a certainty. Watch for:

| It says | Ask |
|---|---|
| "Tests were genuinely green" *(after admitting the browser wasn't installed)* | **"You cannot know that. Did you re-run them, or are you guessing?"** — this exact thing happened. |
| "That's a test heuristic limitation, not a real bug" | **"Investigate before blaming the test."** — this exact excuse hid four questions with empty answer keys. |
| "All guards passing" | **"Which ones ran? Show me."** |
| A summary of a FAIL output | **"Show me the actual output."** |

None of this is malice. It's a model wanting to give you a clean answer. Your job is to
refuse clean answers that weren't earned.

---

## The per-lesson loop

Once `tools/preview.js` exists, this is your rhythm:

```
Process <filename>.

Convert to current authoring format. Validate: build, self-grade
round-trip, wrong-answer discrimination, hint leak, verify-format,
verify-styles. Generate the preview. Give me the path.

Then STOP. Do not move to the next file. Do not commit. Do not push.
```

Then **you open the preview and look at it.** Not the markup — the page. Tap the buttons.
Type in the blanks. Drag the tiles. At 380px wide, in phone mode.

**That is the only test that matters.** The guards prove it is correct. Only your eyes prove
it is good.
