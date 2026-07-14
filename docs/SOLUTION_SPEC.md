# SOLUTION_SPEC — the explanation system

**Engine: `rao-master-14`. Standing rules: `CLAUDE.md` §13. Build order: `BRIEFS.md` Brief 7.**

This is the reference. `CLAUDE.md` §13 is the summary that survives compaction; this file is
what you read when the summary isn't enough.

---

## 0. Why this exists

Today an explanation is one string:

```html
<p class="explain">66 rounds to 70 and 39 rounds to 40; 70 + 40 = 110.</p>
```

That is fine for Grade 4 estimation. It is a dead end for a five-step Grade 8 solution, a
geometry proof, or anything that needs a diagram. And it does the child a disservice even
here: it says *what* happened. It never says *why 66 rounds up*. The child leaves with a
fact, not a rule.

The fix is not a longer string. It is a **list of typed blocks**, so that adding a new kind
of explanation later means writing one renderer — not rewriting the engine.

**One design constraint governs everything below:** this project has lost patches, reverted
engines, and shipped fake test results across roughly ninety sessions. Every rule here is
paired with a guard, and every guard is proved to fail before it is trusted. A rule without
a guard does not exist.

---

## 1. The grading firewall

### 1.1 The rule

```
grading module  →  produces an immutable result
                        ↓
question controller  →  passes that result, read-only
                        ↓
solution renderer  →  displays. Calls nothing. Mutates nothing.
```

The solution renderer:
- **must not** import or reference the grading module
- **must not** call `check()` — ever, under any circumstance
- **must not** mutate the stored answer
- **must not** mutate the student's stored response

Grading is a one-way producer. The renderer is a pure consumer of an immutable result.

### 1.2 Why it is this severe

Every change to how an explanation looks is a change that *could* silently corrupt how a
child's answer is graded. There is no visible symptom. A child gets marked wrong on a
correct answer and nobody finds out for a month.

Given this project's history — the engine reverting to stale versions and silently losing
every patch, repeatedly, for ninety sessions — a written rule is not enough. The firewall is
structural, and it is guarded four ways.

### 1.3 The four firewall guards

| Guard | Asserts | Break it by |
|---|---|---|
| **Dependency** | The solution renderer does not import or reference the grading module | Adding the import |
| **Runtime** | Opening, stepping through, and closing a solution never calls `check()`. Spy on `check()`; assert call count is 0. | Calling `check()` from the renderer |
| **Mutation** | Rendering a solution cannot alter the stored answer or the student's response. Deep-freeze the objects passed to the renderer; assert no write. | Mutating the response object during render |
| **Source-diff** | Solution work does not modify a grading file without explicit authorisation | Touching a grading file |

Each guard is proved by the §2 procedure: write it, break the thing it protects, **show the
FAIL output**, restore, show the PASS. A guard never observed failing is faith.

---

## 2. The three-tier ladder

A child who got it wrong does not want the full solution. They want the smallest nudge that
lets them fix it **themselves**. Six steps dumped on them steals the win — and the win is the
entire product.

```
┌─ Tier 0 — HINT LADDER ───────── shown on demand, before checking
│    1–3 rungs. Names the move. Never performs it.
│
├─ Tier 1 — whyWrong ──────────── shown automatically on a wrong answer
│    One line, about the option they chose. Describes the option.
│
└─ Tier 2 — WALKTHROUGH ───────── shown on demand ("Show me")
     The block list, revealed ONE STEP AT A TIME.
     "I've got it" bail-out at every step.
```

### 2.1 The bail-out is the point

The walkthrough is **never dumped**. Steps stack; previous steps stay visible above, dimmed;
the child taps to advance. Nothing auto-advances.

An **"I've got it — let me try again"** button is present at every step, because the moment a
child says *"oh, I see it now"* and closes the solution is the moment learning happened.
Design for that exit, not against it.

---

## 3. Hints — the ladder

### 3.1 Format

```yaml
hint:
  - "Find the place you are rounding to."
  - "Look at the digit just to the right of that place."
  - "Round both numbers first, then add."
```

A single string remains valid forever and normalizes to a one-rung ladder. **No migration.**

### 3.2 The leak rules — unchanged, now applied to every rung

A hint **names the move**: the strategy, where to look, what to ask.

A hint **never**:
- performs arithmetic on the child's numbers
- eliminates options
- states or restates the answer, including disguised ("it's 4 tens" for 40)

**A ladder is not a slow reveal of the answer.** It is three increasingly specific
descriptions of the *strategy*. Each rung says *more about the move*, never *more of the
answer*.

❌ *"689 is closer to 700 than to 600."* — This is a leak. It performs the rounding for the
child. It would fail the leak test. Do not write it, in any rung.

✅ *"Look at the digit just to the right of that place."* — Names where to look. The child
still does the work.

Hints for the same concept must use **consistent hint families** (cover-the-zeros,
use-the-fact-above) — §7 already requires this and it applies rung by rung.

### 3.3 Guard

The existing hint leak test is extended to run against **every rung of every ladder**, not
just the first.

---

## 4. `whyWrong` — the enforcement mechanism for §7

### 4.1 What problem this solves

`CLAUDE.md` §7 says: *every distractor must be traceable to a specific misconception a child
actually has; never invent a distractor to fill a slot.*

Right now that traceability lives **nowhere**. It is a standard with no artifact and no
enforcement. `whyWrong` makes the author **write the misconception down** — and a guard then
checks they did.

**If you cannot write the misconception, the distractor does not earn its place. Cut it.**

That sentence is the whole point of this feature. It is not primarily a UX improvement; it is
how a soft editorial standard becomes an enforceable one.

### 4.2 Format

```yaml
type: single-select
answer: ["55,367 + 12,376"]
whyWrong:
  "30,937 + 97,021":
    code: sum-far-too-large
    message: "This pair rounds to about 130,000 — much more than 70,000."
  "27,612 + 82,436":
    code: sum-too-large
    message: "Round each number to the nearest ten thousand and compare with 70,000."
  "92,327 + 49,921":
    code: first-addend-alone-too-large
    message: "The first number on its own is already close to 90,000."
```

**Mandatory for every incorrect option of every `single-select` and `multi-select`.**

### 4.3 The two fields

**`code`** — a stable machine key. Never shown to a child.

This is the **analytics key**. It is how the platform will one day know not merely *that* a
child was wrong but *what kind of error they made* — and that is the data that eventually
drives real adaptivity. It costs nothing to author now, alongside the message. It cannot be
retrofitted onto 2,710 questions later.

Codes should be reusable across questions. `added-before-rounding` is a real misconception
that will recur across a hundred questions. Prefer a growing shared vocabulary over
per-question snowflakes.

**`message`** — student-facing, one line.

### 4.4 Keyed by literal option text — and why not by ID

`whyWrong` is keyed by the **literal option text**, which is the key the engine already uses
for text/number options.

There is a reasonable argument for stable IDs (`A`, `B`, `C`) instead: they survive
punctuation, localisation and reordering. That argument was considered and **deferred**, for
three reasons:

1. **The engine already has two keying schemes and mixing them is a documented silent-bug
   generator.** §8: *"Picture options key by 1-based position. Text/number options key by
   literal text. Mixing these is a subtle, silent bug."* Adding a third scheme to that engine
   is a bad trade.
2. **`answer` is the source of truth (§8).** IDs make `answer: D` an indirection into a
   lookup table. Every existing validation — self-grade round-trip, wrong-answer
   discrimination, the harness — reads the literal today.
3. **It touches `check()`** — which is precisely what the four firewall guards exist to
   prevent.

The problems IDs solve are real but **hypothetical for this project today**: one language,
static option order. The problems adding IDs would cause are **documented and historical**.

**The zero-cost substitute:** a **key-match guard** asserts that every `whyWrong` key matches
an actual option *exactly*. Drift fails loudly at validation. Same protection, no engine
change, no migration.

**Trigger to un-defer:** localisation, or per-student option shuffling. Both are plausible
futures. Neither exists. This is recorded in §13.9 as a decision with a trigger — not an
oversight.

### 4.5 Describe the option. Do not diagnose the child.

A tap proves **what** they picked. It does not prove **why**.

Telling a nine-year-old confidently what they were thinking, when it is not what they were
thinking, is corrosive. It teaches them that the machine knows their mind, and then it is
wrong about their mind.

| | |
|---|---|
| ✅ | "This estimate is too large — this pair is closer to 130,000." |
| ✅ | "The first number on its own is already close to 90,000." |
| ❌ | "You forgot to round the first number." |
| ❌ | "You added before rounding." |

Second person is permitted **only** where the chosen option *uniquely* demonstrates that
error — where there is no other plausible route to that answer. In that case the author sets
`diagnostic: true` explicitly.

**Tone guard:** rejects any `message` opening with *"You forgot / You didn't / You added /
You should have"* unless `diagnostic: true` is set.

Note the `code` may freely name the misconception (`added-before-rounding`) — it is never
shown to a child. The caution applies only to `message`.

### 4.6 Guards

| Guard | Asserts |
|---|---|
| **Distractor coverage** | Every incorrect option of every select question has a `whyWrong` entry. No entry → the option is a slot-filler → **the lesson fails validation.** |
| **Key match** | Every `whyWrong` key matches an actual option exactly. No orphans, no typos. |
| **Tone** | No `message` diagnoses the child without `diagnostic: true`. |

---

## 5. Blocks

### 5.1 The four

**Four block types. Not ten.** More are listed in §9 (Deferred) and are built **when a lesson
actually needs one** — one at a time, never speculatively. A block library built ahead of
demand is a quarter of work serving nobody.

| Type | Fields | Renders as |
|---|---|---|
| `step` | `goal`, `working`, `reason` — all optional | Numbered step card. `goal` = what we're doing. `working` = the maths, mono, large. `reason` = the why, small, muted. |
| `figure` | Same SVG / `<figure>` handling as question figures | A diagram inside the solution. |
| `takeaway` | `text` | Highlighted band, brand colour. **The generalisable rule.** |
| `verification` | `text` | Sanity-check band: "does this answer make sense?" |

### 5.2 `verification`, not `check`

`check()` is the grading function. Naming a solution block `check` would weaken the
vocabulary firewall in code, in logs, in tests, and in this documentation — and would produce
a genuinely confusing bug report six months from now.

`verification` means *"confirm the mathematical result is sensible."* It never means *"grade
the child."*

### 5.3 What a `step` is

**One meaningful change in the reasoning. Not one sentence.**

```yaml
- type: step
  goal: Round the first number.
  working: "9,827 → 10,000"
  reason: The digit to the right of the thousands place is 8, so round up.
```

- `goal` — what we are doing (imperative, short)
- `working` — the maths (mono font, large, this is the visual anchor)
- `reason` — why (small, muted, expandable)

All three are optional. A trivial step may be `working` only.

### 5.4 Ordering convention

`step` … `step` … `takeaway` … `verification`

`takeaway` is always present and always near the end. It carries **the rule**, not the answer.
This is the difference between a child leaving with *"70 + 40 = 110"* and leaving with
*"5 or more, round up."* The second is the entire ROI of the project.

### 5.5 Text fallback — mandatory on every block

If a renderer fails, the child still sees the working. Every block type must degrade to
readable text. Cheap now. Expensive to retrofit.

---

## 6. Authoring format

### 6.1 The simple case is unchanged

```yaml
type: fill-blanks
answer: ["110"]
hint: Round each number to the nearest ten, then add.
explain: 66 rounds to 70 and 39 rounds to 40; 70 + 40 = 110.
```

**Renders exactly as today. Zero migration.** All 2,710 existing questions keep working
forever. This is not a compatibility courtesy — it is a hard guard (§7 below).

### 6.2 The full case

```yaml
type: single-select
answer: ["55,367 + 12,376"]
hint:
  - "Find the place you are rounding to."
  - "Look at the digit just to the right of that place."
  - "Round both numbers first, then compare."
explain: 55,367 rounds to 60,000 and 12,376 rounds to 10,000; the sum is about 70,000.
whyWrong:
  "30,937 + 97,021":
    code: sum-far-too-large
    message: "This pair rounds to about 130,000 — much more than 70,000."
  "27,612 + 82,436":
    code: sum-too-large
    message: "Round each number to the nearest ten thousand and compare with 70,000."
  "92,327 + 49,921":
    code: first-addend-alone-too-large
    message: "The first number on its own is already close to 90,000."
solution:
  - type: step
    goal: Round the first number.
    working: "55,367 → 60,000"
    reason: The digit to the right of the ten-thousands place is 5, so round up.
  - type: step
    goal: Round the second number.
    working: "12,376 → 10,000"
    reason: The digit to the right of the ten-thousands place is 2, so round down.
  - type: step
    goal: Add the rounded numbers.
    working: "60,000 + 10,000 = 70,000"
  - type: takeaway
    text: Round each number first, then add. Never add first.
  - type: verification
    text: Both numbers were rounded to the nearest ten thousand, so the answer ends in four zeros.
```

### 6.3 `explain:` survives even when `solution:` exists

`explain:` remains the **short summary and universal fallback**:
- it is what **Rapid Fire** shows (speed is the point there)
- it is what renders if a block renderer fails
- it is what the legacy snapshot guard protects

Never delete it. Never make it optional.

### 6.4 Everything lives in frontmatter

**Never in `data-*` attributes.**

```html
<!-- ❌ NEVER -->
<li data-val="600" data-feedback="You rounded 689 correctly, but…">600</li>
```

Two reasons:
1. **§8: the frontmatter is the source of truth.** Splitting authoring across frontmatter
   *and* DOM attributes recreates exactly the drift this project has spent ninety sessions
   fighting.
2. **The engine double-encodes entities in `data-val`** (documented footgun, §8). Prose with
   apostrophes and punctuation in a `data-` attribute walks straight into that bug class.

### 6.5 The DOM is an authoring format, not the internal model

```
frontmatter + markup  →  normalizeExplain()  →  one normalized object  →  render
```

**One parse point.** Nothing downstream ever sees the raw shape. A legacy string `explain:`
is normalized at parse time into a single-block list; the renderer has no idea the legacy
format ever existed.

This is the same discipline as `sanitizeMarkup()` having a single emission point, and for the
same reason.

---

## 7. The legacy snapshot guard

### 7.1 The requirement

All 2,710 existing questions have a string `explain:`. Every one must render
**byte-identical** after `rao-master-14`.

### 7.2 Compare at the right layer — this matters

Browsers **normalise whitespace, reorder attributes, and re-encode entities.** A
byte-comparison of serialized DOM will therefore produce false failures.

And a false failure is worse than no guard, because the fix for a false failure is always to
loosen the guard until it stops firing. **That is how a guard dies.**

| Layer | Comparison |
|---|---|
| Legacy `explain:` renderer output — the HTML string, **captured before DOM insertion** | **Exact byte-compare.** This is the guard. |
| Representative rendered pages | **Screenshot compare.** Catches visual regressions. |
| Live DOM serialisation | **Never used for byte-comparison.** |

### 7.3 Prove it

Change one character of legacy renderer output. Run the guard. Show the FAIL. Restore. Show
the PASS.

---

## 8. Modes — one content, three timings

The content does not need three versions. **The mode decides when it is shown.**

| Mode | Hints | On wrong answer | Walkthrough |
|---|---|---|---|
| **Adaptive** | Full ladder, on demand | `whyWrong` + retry | On "Show me". This is where explanations live. |
| **Rapid Fire** | None — speed is the point | Correct/incorrect indicator, one-line `explain:`. **Log the `code`.** | Collected for end-of-round review |
| **Quiz** | None before submission | Nothing | Full walkthroughs on the post-submit review screen, child's answer shown beside the correct one |

---

## 9. Deferred — with the trigger for each

The schema **permits** these. **Build none of them** until the trigger fires.

Building a mature-platform architecture on top of Grade 4 estimation is how four months
disappear and nothing ships.

| Deferred | Trigger |
|---|---|
| **Multiple solution paths** ("Another way") | A lesson has a genuine second method worth teaching. Grade 4 estimation does not — authoring `paths: [standard]` on 2,710 questions would serve zero of them. |
| **Block families 5+** — number line, place-value chart, bar model, ten-frame, base-ten blocks, fraction strips, algebra tiles, graphs, proof renderers | **A specific lesson needs one. Build that one.** Not a library. Each is a component; a library is a quarter of work. |
| **Grade-band renderers** | A second grade band exists. |
| **Interactive checkpoints inside a solution** ("now you do the next step") | Probably never in this form. The solution appears *after* a wrong answer. A child asked to perform the next step correctly can now **fail twice on the same question** — that is a shame spiral, not a learning loop. The right version of this idea is: reveal the solution, then offer a *fresh similar question*. |
| **Ternary grading** (`partially-correct`) | `check()` returns a boolean. Changing it goes straight through the firewall. Needs a separate, deliberate decision — never a side effect of explanation work. |
| **Stable option IDs** | Localisation, or per-student option shuffling. See §4.4. Recorded as a decision with a trigger, not an oversight. |

---

## 10. Media

### 10.1 Structured animation is the rule

**You cannot shoot 2,710 videos. You can author 2,710 animations.**

```yaml
- type: animate
  script: "move 8 counters · group into pairs · highlight no remainder · label even"
```

That is **data**. It renders through a component you own. It scales to the whole question
bank. It restyles for free when the brand changes. A video file does none of those things.

This is the growth path. When the first lesson genuinely needs motion, build the animation
component — not a video pipeline.

### 10.2 Video is the escape hatch

When motion, narration, or a watched construction genuinely earns its place:

**Never embed a URL per question.** The same "how to round" video will be referenced by two
hundred questions. Re-shoot it and you would be editing two hundred files.

**Videos are a library keyed by concept:**

```yaml
- type: video
  concept: round-to-nearest-thousand
```

Resolved through `concepts.json`:

```json
{
  "round-to-nearest-thousand": {
    "src": "…",
    "poster": "…",
    "duration": 92,
    "title": "Rounding to the nearest thousand",
    "captions": "…",
    "transcript": "…"
  }
}
```

Re-shoot the video → change one registry line → two hundred questions update.

**Requirements, non-negotiable:**
- A video is **never the only explanation.** The block list must still stand without it.
- Captions and a transcript are **mandatory**.
- A step summary appears beneath the player.

**Build the registry when the first video exists. Not before.**

---

## 11. Build order

| Stage | What | Value |
|---|---|---|
| **7.1** | Firewall + 4 guards, each proved to fail | Everything else rests on this |
| **7.2** | `normalizeExplain()` + 4 block renderers + legacy snapshot guard | Multi-step solutions become possible; nothing breaks |
| **7.3** | Hint ladder + `whyWrong` display + walkthrough reveal | The learning loop |
| **7.4** | `whyWrong` authoring + coverage / key-match / tone guards | §7 becomes enforceable |
| **7.5** | Re-author `estimate-sums-faithful` as the proof | The standard, demonstrated |

**Stages 7.2–7.4 carry roughly 90% of the learning value.** Media is the flashiest and the
least important. It is last for a reason.

---

## 12. Validation — the full list

Run after every change. This extends `CLAUDE.md` §10; it does not replace it.

**Firewall (§1.3)**
1. Dependency guard — renderer does not reference grading
2. Runtime guard — solution rendering never calls `check()`
3. Mutation guard — solution rendering never alters answer or response
4. Source-diff guard — solution work does not touch grading files

**Content**
5. Legacy snapshot — every string `explain:` renders byte-identical (pre-DOM string compare)
6. Distractor coverage — every distractor of every select has a `whyWrong`
7. Key match — every `whyWrong` key matches an option exactly
8. Tone — no `message` diagnoses the child without `diagnostic: true`
9. Hint leak — **every rung** of every ladder: no literal answer, no disguised answer, no
   option elimination, no arithmetic on the child's numbers

**Existing, unchanged**
10. `npm test` — mandatory before any engine deploy
11. `RaoPreview.build()` — question count; **svg-in-prompt = 0**
12. Self-grade round-trip: `check(behavior, answer, answer) === true`
13. Wrong-answer discrimination: every non-key option grades false
14. Chromium: computed-style + **real pointer/touch interaction** (`Input.dispatchTouchEvent`
    via CDP — Playwright's `mouse` API gives false passes)
15. Double-attach every question (idempotency)

**Every new guard above is proved to fail before it is trusted. No exceptions.**

---

## 13. The standard

`STATUS.md` names `estimate-sums-faithful.html` as the representative failure: *"mechanically
correct and pedagogically dead."*

Its explanations are all of this shape:

> *"66 rounds to 70 and 39 rounds to 40; 70 + 40 = 110."*

That tells a child **what** happened. It never tells them **why 66 rounds up**. Under this
system:

```yaml
solution:
  - type: step
    goal: Look at the ones digit of each number.
    working: "66  and  39"
    reason: The ones digits are 6 and 9.
  - type: step
    goal: Decide which way each rounds.
    working: "66 → 70,  39 → 40"
    reason: Both ones digits are 5 or more.
  - type: step
    goal: Add the rounded numbers.
    working: "70 + 40 = 110"
  - type: takeaway
    text: 5 or more, round up. Less than 5, round down.
```

Same question. Roughly the same authoring effort.

The child leaves with **a rule instead of a fact.**

That is the entire return on this project.
