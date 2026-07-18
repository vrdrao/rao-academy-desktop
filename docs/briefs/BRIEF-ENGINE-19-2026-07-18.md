# BRIEF — ENGINE rao-master-19: FIGURES + OPTION-LAYOUT LADDER + GUARD PROMOTION

## PRE-CHECK (report before proceeding; STOP on any mismatch)

1. `git status` — tree clean, branch main, in sync with origin/main at `d156dc8`.
2. Engine `__version` is exactly `rao-master-18`.
3. Corpus totals: 104 lesson files / 2,722 questions.
4. The two archive files `BRIEF-REVIEW-INDEX.md` and `BRIEF-HEALTH-CHECK.md`
   are present in the repo root (Venkat placed them alongside this brief).
   If absent, STOP — do not reconstruct them from memory.

## Scope — one engine bump, five parts

This is an ENGINE change. Bump `__version` to `rao-master-19`. Forward-only:
no rollback of any prior engine behavior. Grading logic is untouched;
FIREWALL_ALLOW_GRADING must never be set.

### Part A — equal-groups figure renderer

Registered defect: `Division_facts_to_10.html` q1, q2 request
`data-show` type `equal-groups` which the engine lacks; they render without
their intended visual.

Design (chat-authored, implement this): the figure shows division/
multiplication as items sorted into rings. For a fact like 12 ÷ 3: three
rings in a row, each containing four small identical item dots, with the
group count and per-group count readable at a glance. Requirements:
- Rings: soft rounded containers on the white card face (thin brand-purple
  border, transparent fill — no new surfaces per the no-intermediate-surface
  spec point). Dots: filled brand-purple circles, uniform size.
- Data comes from the question's existing data attributes; if the markup
  carries groups and per-group counts, use them; report the exact attribute
  contract you implemented.
- Must scale: up to 10 groups × 10 items without overflowing the card at
  390px (wrap rings to a second row when needed).
- No text inside the figure that gives away the ANSWER of the question it
  illustrates. If q1/q2's answer would be directly readable from the figure
  (e.g. the question asks "how many groups?" and the figure labels the group
  count), render the figure without that label and say so in the report.

### Part B — sequence figure renderer

Registered defect: `number-patterns-word-problems-remix.html` q2, q7, q12,
q19, q24 request `data-show` type `sequence`.

Design (chat-authored, implement this): a boxed number chain. Each known
term sits in a rounded box, boxes joined left-to-right by small arrows, the
unknown term rendered as an empty box with a soft dashed border. Requirements:
- Boxes and arrows in brand purple on the white card face; the blank box
  must be visually distinct (dashed) but calm — no color that competes with
  the option tiles.
- Wraps to a second row at 390px if the chain is long.
- Same answer-leak rule as Part A: the blank box stays blank.

### Part C — promote unknown data-show to build-failing error

Today an unknown `data-show` type warns and renders nothing. After this
brief, an unknown type FAILS the build with a message naming the file,
question, and the unknown type. Guard-first proof required (see Guards).

### Part D — option-layout ladder (spec locked by Venkat, 2026-07-18)

Options currently render in one fixed grid; long options (e.g. full
equations like "24,516 + 18,097 = 42,613") overflow and wrap mid-expression.

The ladder, chosen at BUILD time per question from the character length of
the LONGEST option in that question:
- longest ≤ 10 chars → 4-across grid (today's layout, unchanged)
- longest 11–18 chars → 2×2 grid
- longest > 18 chars → vertically stacked, one full-width row per option

Laws:
1. FONT SIZE NEVER CHANGES between tiers. No shrinking, ever.
2. All options in one question share one layout — sized by the longest
   option, never individually.
3. Measurement happens once at build; the engine stamps the tier onto the
   card (data attribute or CSS variable — your choice, report it). No
   runtime measurement, no JS resize logic.
4. Reconcile with the existing mobile (≤480px) option behavior: at mobile
   widths the stacked tier still applies for >18; report exactly how the
   tiers interact with the current mobile rules. Option content must never
   wrap mid-expression in any tier at either viewport.
5. Thresholds live in ONE place (constant or CSS), named, so a future spec
   revision changes one number.

### Part E — deploy-drop refresh

deploy-drop/ is stale (pre-dates the card-look revision, the inner-panel
removal, and this engine bump). Regenerate it completely; every file must
md5-match its repo source. Report N/N verified with the actual hashes.

## Fixture coverage (sanctioned totals change)

Add coverage questions to `_type-coverage.html` for: equal-groups figure,
sequence figure, and one option-set per ladder tier (short / medium / long).
This CHANGES the corpus totals from 104 / 2,722. The report must enumerate
the delta question by question and state the new totals; every changed
number is explained or the audit fails. No other lesson's count may move.

## Rider — archive the two historical briefs

Copy `BRIEF-REVIEW-INDEX.md` and `BRIEF-HEALTH-CHECK.md` from the repo root
into `docs/briefs/` verbatim, byte-for-byte as provided. Note in the commit
message that HEALTH-CHECK's internal "delete after reading" instruction is
historical, superseded by the archive rule. Remove the two root copies after
archiving (they are archives, not active briefs).

## Guards (guard-first proof, actual output for every FAIL and PASS)

1. Part C: inject a bogus `data-show="no-such-figure"` into a scratch copy →
   build must FAIL naming file + question + type → remove → PASS.
2. Parts A/B: extend the styles suite to assert, on really rendered fixture
   cards at 1280px and 390px, that the equal-groups and sequence figures
   exist and paint (non-zero rendered size, correct colors). Sabotage one
   renderer to emit nothing → FAIL → restore → PASS. The standing
   "0 blank figures" count must now cover the 7 previously-blank questions —
   report their before/after state explicitly.
3. Part D: computed-style assertions for each tier on fixture questions at
   both viewports: correct grid/stack, identical font size across all three
   tiers, no mid-expression wrap. Sabotage the tier threshold constant →
   FAIL → restore → PASS.
4. Full `npm test` green on the final tree (the fast commit gate and the
   full push gate both exist now — run the FULL suite explicitly for this
   report regardless).

## Report requirements

- md5 + bytes for every shipped file changed; engine old → new version line.
- The attribute contract for both figure renderers and the tier-stamp
  mechanism for Part D.
- Totals: old → new, delta enumerated per added fixture question.
- The 7 defect questions listed with before (blank) / after (rendered) state.
- Deploy-drop: N/N md5 matches with hashes.
- Firewall confirmation. Deviations in their own section; absence of that
  section is an audit flag.
- Commit this brief to `docs/briefs/` in the work's commit(s). Commits stay
  LOCAL. No push. Venkat pushes after the chat audit clears.
