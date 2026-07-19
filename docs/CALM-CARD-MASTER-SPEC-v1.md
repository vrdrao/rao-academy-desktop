# CALM CARD — MASTER SPEC v1 (2026-07-17)

**Ground truth:** `calm-card-v36.html` — md5 `deb8d07a84a9f1fbc6847b7ff57a965f`,
1,791,115 bytes. This file IS the design. Where this document and the file disagree,
the file wins and the disagreement is a bug in this document to be reported, not
silently resolved. Claude Code implements against the real engine files using the
values below; it does NOT copy demo scaffolding (state bar, dev drawers, tuner) into
production. Venkat's design sign-off on the v36 demo was given 2026-07-17
("I think we have done a good job here"), recorded per HANDOFF-12.

Companion documents: ROBO-ENGAGEMENT-FRAMEWORK-v4.md (all mascot behaviour) ·
BRIEF-7.8-DRAFT.md (the paste-ready production brief) · HANDOFF-12.md (session record).

---

## 1. Card anatomy — exact numbers (shipped defaults, tuner at rest)

> **Revision 2026-07-18** (per `docs/briefs/BRIEF-CARD-LOOK-2026-07-18.md`): Venkat's
> tuner readout `frame 3px · ledge 5px · halo 9px/21px @ .34 / bg #ffffff · grid 0.090`
> replaces the v1 values. Old → new: frame padding 5px → **3px**; card radius 23px →
> **25px** (concentric rule, 28 − 3); halo `0 12px 28px` → **`0 9px 21px`** (alpha .34
> unchanged); page bg #eef1f6 → **#ffffff**; grid alpha .06 → **.09**. Ledge and
> checker size unchanged.
>
> **Revision 2026-07-18 (2)** (per `docs/briefs/BRIEF-PRECOMMIT-SPEED-2026-07-18.md`,
> rider): added the question-body surface row — no inner panel, authority
> BRIEF-CARD-LOOK-2.

| Layer | Property | Value |
|---|---|---|
| **Frame** (the coloured ring) | `.quiz` padding | **3px**; background `var(--frame-g)` gradient; border-radius **28px** |
| **Card** | `.q.active` border-radius | **25px** — concentric rule: inner = 28 − frame, floor 12 |
| **Ledge** (lip under card) | `.q.active` box-shadow | `0 5px 0 rgba(var(--halo-rgb,123,92,255),.12)` |
| **Halo** (glow) | `.quiz` box-shadow | `0 9px 21px rgba(var(--halo-rgb,123,92,255),.34)` |
| **Page background** | `.proto-right` background-color | `var(--bg)` = **#ffffff** (light mode) |
| **Checkered grid** | `--checker-line` | `rgba(var(--grid-rgb,124,58,237),.09)`, `--checker-size` **30px** |
| Card face | `.q.active` background | **#fff**, no CSS border (border-width 0 on all sides) |
| **Question-body surface** | `.qbody` background | **NONE — transparent.** No intermediate surface between the card face (#fff) and the question content; the card face is the only surface (authority: BRIEF-CARD-LOOK-2, 2026-07-18) |

The card has NO border property. The visible "purple border" is the frame (gradient
wrapper padding); the "underline" is the ledge shadow; the "aura" is the halo shadow.
These names are canonical — use them in code comments and QA output.

**Dark mode exception:** dark mode overrides `--checker-line` to
`rgba(255,255,255,.04)` and is NOT palette-tinted. Do not "fix" this.

**Tuner:** the 🎨 Card-look tuner in the demo is a sanctioned demo-only instrument
(like the `#rdName` field). It does not ship. Production hard-codes the table above.
If Venkat supplies different numbers (he reads out the tuner's two monospace lines),
those replace this table via a spec revision — never ad-hoc in code.

## 2. Theming system — one palette pick recolours the world

Eight palettes (`THEMES` in the demo): grape (default), bubble, mint, citrus, blue,
candy, tropic, forest. Each defines `frame` (gradient), `btn` (gradient), `sh` (hex).
Both pickers (kid picker `buildKidPicker` and host picker `pickTheme`) funnel through
a single `applyTheme(id)` — production must preserve this single-funnel property.

On apply, `applyTheme` derives and sets on `:root`:

1. **`--halo-rgb`** = RGB of the FIRST 6-digit hex in the theme's frame gradient
   ("lead colour"). Drives halo + ledge tint. Intensities (.34/.12) never change
   per theme — switching palettes changes colour, never physical strength.
2. **`--grid-rgb`** = same lead RGB, EXCEPT grape is pinned to `124,58,237`
   (the shipped grid purple — pixel fidelity of the default).
3. **Robo body family** (5 CSS vars) — see Framework v4 §Palette tint. Grape pins
   the exact shipped hexes `#8b5cf6 / #6366f1 / #7c3aed / #a78bfa / #c4b5fd`;
   all other themes derive via HSL from the lead colour:
   `S = min(S, .90)`, `L = clamp(L, .42, .66)`, then
   g1 = (H, S, L) · g2 = (H−14°, S, max(.36, L−.08)) · arm = (H, S, max(.30, L−.12))
   · mid = (H, S, min(.82, L+.14)) · tint = (H, S, min(.92, L+.26)).
4. Existing vars `--frame-g`, `--btn-g`, `--btn-sh` (unchanged behaviour).

**Generalisation law:** a future ninth palette must tint halo, ledge, grid, and Robo
with ZERO additional code — everything derives from the frame gradient's lead hex.
Never introduce a parallel hand-maintained colour list.

**Identity anchors (never themed):** Robo's red cape #ef4444, plum face lines
#3b1f78, amber star #f59e0b, pink cheeks #f9a8d4. The Rainbow (tropic) palette's
lead colour equals grape purple, so Robo stays purple there — correct by construction.

**Mechanism (port as-is):** Robo recolouring is CSS attribute-selector overrides
scoped strictly under `.rao-mascot` (e.g. `.rao-mascot [fill="#7c3aed"]{fill:var(--robo-arm,#7c3aed)}`
plus `#raoGrad stop:first-child/last-child` for the gradient). Scoping matters:
card artwork shares some hexes and must be untouched.

## 3. Solution & hint presentation — the heart of the product

Demo states (`set(n)` in `cc-script`) and what each IS in production terms:

| # | State | What happens |
|---|---|---|
| 1 | **Answering** | Clean card: prompt, options, Hint button. Task text and option colours are NEVER modified in any later state (task-immutable law). |
| 2 | **Wrong** | Options disable; **no persistent mark on the task** (LAW 3 as amended 2026-07-19 — see the amendment block below this table). Chrome quiets (`cc-dim` on tlabel/counter/pip — options dim ONLY in feedback states). A typed tutor bubble delivers **Hint 1**, then an action row: ghost "Give one more hint" / solid "Try again". On "Try again" the task returns to exactly its first-attempt state. |
| 3 | **Hint** | Rungs accumulate: Hint 1 stays, **Hint 2 types beneath it** (help-accumulates law), then a single solid "I'll try now". |
| 4 | **Walkthrough — Steps** | Header **"Solution — step by step"** (KEPT pending Venkat's open keep/remove ruling — one word overrules). Steps type in one at a time as tutor bubbles (Step k of n), each with a `done` chip trail; ends in the **quiet reveal** — the correct option greens with NO fanfare (triumph ≠ rescue). |
| 5 | **Correct** | The card's ambient celebration: green option (the ONLY other green moment — green appears exactly twice ever), sparks, chime, takeaway panel after beat 3 (~550ms), Next button. All personal praise comes from Robo, never the card (one-character law). |
| 6 | **Walkthrough — Video + Steps** | Toggle `▶ Watch` / `Steps`; **Watch is the default tab** (ratified). Video player with pause/finish handling; switching is free at any time; forward-seeking allowed (ratified). |
| 7 | **Walkthrough — Try-it** | Interactive guided attempt variant. |
| 8/9 | G10 exemplars | Quadratic / Geometry walkthroughs on sibling cards — prove the pattern generalises beyond Grade 4. |

> **LAW 3 — AMENDED 2026-07-19 (BRIEF-FR-1; supersedes the Brief 7.6 wording
> "the ✕ persists for the life of the question"):**
>
> WRONG IS A WHISPER, AND THE WHISPER DOES NOT LINGER. A wrong attempt
> produces no persistent mark on the task. When the child taps Try Again,
> the task returns to EXACTLY its first-attempt state: no ✕, no residual
> selection, no retained input, no moved tiles. The child re-reads the
> question cold.
>
> Rationale (Venkat, recorded in BRIEF-FR-1): a child who just answered knows
> what they picked; the ✕ added nothing. On multi-select it actively lied — a
> red ✕ on "2" in "select all the even numbers" teaches that 2 is odd.
> LAW 4 (HELP ACCUMULATES) is unchanged and must not be weakened: hint bubbles
> and walkthrough steps persist exactly as before. The chat log stays; the
> TASK resets. Where `calm-card-v36.html` still shows the persisting ✕, the
> demo reflects the superseded wording — this amendment wins.

**Chat-bubble mechanics (exact):** `chatWrap` creates a `.cc-chat` container
(optional `.cc-chat-hd` header — hints have NONE since v24; HINT chips carry the
labelling). `chatMsg` is **append-only + type-then-fill**: the `.cc-msg` node is
created once showing typing dots, and its content is filled ONCE (dots → chip + text)
at **650ms**; earlier bubbles are never touched again (no-repaint law). Bubbles are
**faceless** — no avatar seat; the docked Robo is the only face on screen (production
removes the dead `.cc-ava` CSS).

**Design laws (all in force, restated):** task immutable · help accumulates ·
no-repaint · green exactly twice (correct moment + walkthrough quiet reveal) ·
triumph ≠ rescue · one character on screen · one spotlight at a time.

**Robo ↔ card wiring during these states:** wrong → encourage + gaze locks on the
newest hint bubble; hints accumulate → gaze re-aims to the newest bubble; walkthrough
→ Robo totally silent but gaze follows each step as it types (gaze is ambient posture,
not a reaction — see Framework v4); correct → gaze releases, praise per ladder.
The REAL reaction ladder is ported from the guided-solve file only (hard gate).

## 4. QA laws (accumulated, all mandatory)

1. Assert-guarded edits; `node --check` every touched script.
2. Playwright real Chromium. Mobile = real CDP `Input.dispatchTouchEvent`; mouse
   events through a small viewport are NOT mobile QA.
3. **Visibility law (new, from three same-disease failures):** any control intended
   for a human must be verified VISIBLE — element rect inside both its container and
   the viewport, container needs no scrolling — after realistic interaction (a real
   click), for EVERY control (not a sample), at MULTIPLE viewport sizes including
   short-laptop heights: at minimum 1280×800, 1366×633, 1280×620, 390×844.
   Driving a control via JS events is functional QA, never visibility QA.
4. Computed-style and pixel-scan verification (screenshot + PIL sampling) for visual
   claims; `getComputedStyle` for style claims; wait out transitions (~250ms+) before
   reading.
5. Prove guards fail: deliberately break each new guard, show actual FAIL output,
   restore, show PASS. A test that cannot fail is not a test — three tests this
   session initially false-passed and were rebuilt until they could.
6. Fake-clock (Playwright `page.clock`) for idle timers; suppress the Robo entrance
   in fake-clock runs via `sessionStorage.roboEntered='1'` (its CSS travel is
   real-time and stalls nondeterministically in headless); the entrance gets its own
   real-time coverage.
7. Report md5 + byte count (bytes on disk) of every shipped file; grep the shipped
   file for each new feature before delivering; chase every number that changes.
