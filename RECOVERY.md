# RECOVERY — when something breaks

**You cannot lose this project.** Every working version is saved in git and on GitHub.
This page tells you what to type to get back to safety.

Don't memorise anything. Find your situation below, copy the block, paste it into
Claude Code.

---

## First, always: am I safe right now?

```
git status
```

- **"nothing to commit, working tree clean"** → everything is snapshotted. Safe.
- **Anything else** → those changes exist ONLY on your laptop. Not protected yet.

---

## THE PANIC BUTTON

*Claude changed something and now everything is broken. I just want it back to how it was.*

```
Discard all uncommitted changes and restore the working tree to the last commit.
Then run npm test and show me the result.
```

This throws away everything since your last snapshot and puts the folder back exactly
as it was. Takes seconds. **This fixes 90% of bad days.**

⚠️ It also throws away any *good* work you hadn't committed. That's the trade.

---

## The engine is broken, nothing else

*Lessons render blank, figures vanish, answers grade wrong.*

```
Restore engine/preview-engine.js from the last commit. Then run npm test.
```

Only touches the engine. Everything else you were working on stays.

Same for the stylesheet:

```
Restore engine/rao.css from the last commit. Then run npm test.
```

---

## I want to go back to the known-good baseline

*The last-commit version is ALSO broken. Take me back to the version I know worked.*

```
Restore engine/preview-engine.js and engine/rao.css to the v1.0-baseline tag.
Then run npm test and show me the result.
```

`v1.0-baseline` is the 45/45-green version. It is permanent. It always works.

---

## Something broke and I don't know when

```
Show me git log --oneline for the last 20 commits.
Then show me what changed in engine/preview-engine.js since the last commit
where npm test was green.
```

Then, once you've picked the commit you want (the ugly code like `712d3be`):

```
Restore engine/preview-engine.js to how it was in commit 712d3be. Then run npm test.
```

---

## I'm about to do something risky

*Big engine surgery. I don't want to endanger what works.*

**Before you start:**
```
Create a branch called engine-experiment and switch to it.
```
Your main version is now frozen and untouchable. Experiment freely.

**If it worked:**
```
npm test must pass. Then merge engine-experiment into main and push.
```

**If it was a disaster:**
```
Switch back to main and delete the engine-experiment branch.
```
The entire mess evaporates. `main` never knew it happened.

---

## My laptop died / I'm on a new machine

Install Git and Node, then:

```
git clone https://github.com/vrdrao/rao-academy-desktop.git
cd rao-academy-desktop
npm install
npx playwright install chromium
npm test
```

Green? You're fully back, with the entire history.

---

# THE HABITS (this is the whole job)

### Every session that produced something working, end with:

```
npm test must pass. Then commit everything with a clear message describing
what changed, and push.
```

**Commit** = snapshot on your laptop.
**Push** = copy it to GitHub.
They are different. **If it isn't pushed, a dead laptop loses it.** Always do both.

### Commit when you START too

A commit is free. Take them liberally. That way "restore to the last commit"
always means something recent, not something from last Tuesday.

### Never let Claude rewrite history

If it ever proposes `force push`, `rebase`, `squash`, or "clean up the history" —
**say no.** Those erase the past. The past is the entire point.

---

# WHAT PROTECTS YOU (already set up, working)

| Risk | Protection |
|---|---|
| Claude mangles the engine | `git checkout` — **fire-drill tested, proven** |
| Broken engine gets committed | pre-commit hook runs `npm test` — **blocked automatically** |
| Laptop dies | GitHub: `vrdrao/rao-academy-desktop` |
| "Which version worked?" | tag `v1.0-baseline` |
| A session goes badly | the Panic Button, above |

---

# THE TEST

```bash
npm test
```

Opens every lesson in a real browser. Right answers must grade CORRECT. Wrong answers
must grade WRONG. Every figure must render. All 8 themes must re-tint. ~30 seconds.

**Green = safe to ship. Red = DO NOT SHIP. No exceptions, no "it's a small change".**
