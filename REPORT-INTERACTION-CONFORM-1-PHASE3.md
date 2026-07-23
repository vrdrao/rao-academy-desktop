# REPORT-INTERACTION-CONFORM-1 — Phase 3 (Review artifact and commit)

Run 2026-07-23. Deliverables built, full suite green, one local commit (unpushed).

---

## 3.1 — The Interaction Atlas, rebuilt on the fixed engine

`review/_INTERACTION-ATLAS-2.html` — **22 of 22 tiles**, each a screenshot of the
**real card** driven to that state through the fixed engine (built via a scratchpad
driver, no scaffolding left in the repo). 649 KB, self-contained (**22 embedded
data-URIs, 0 external references**), opens offline by double-click. **The original
`review/_INTERACTION-ATLAS.html` is retained** for before/after comparison.

**Every tile the first atlas flagged is now clean — verified by eye, not asserted:**

| Tile | First atlas | Now | What the screenshot shows |
|---|---|---|---|
| A5 "After pressing Try again" | 🔴 Known problem | ✅ now fixed | Clean slate — options reset, **no "Not quite" message, no empty box**, Hint+Check restored |
| Cms "Pick several" | 🟠 Worth a look | ✅ now fixed | Right pick "2" keeps a brand edge; wrong pick "3" keeps its ✕; "4"/"6" plain — the child can tell what they picked |
| Cord "Put in order" | (as ruled) | ✅ now improved | The two misplaced tiles (3,402 · 3,240) get a red edge; the two correct ones don't; order NOT revealed |
| D13 comma | 🔴 Problem | ✅ now fixed | 42,613 accepted, box **green**, "Next question" — no red box |
| D14 Indian | 🔴 Problem | ✅ now fixed | 1,00,000 accepted, green, no red box |
| D15 commutative | 🔴 Problem | ✅ now fixed | 16+31=47 accepted, green, no red box |
| D16 subtraction | (as ruled) | ✅ unchanged | 4-9=5 correctly **red** + "Try again" (sabotage — non-commutative stays wrong) |

All other tiles (A1–A4, A6a/b, B7–B12, Cfb, Css, Ccat) re-captured on the fixed
engine and remain clean. B12 shows the walkthrough's final step with the answer
revealed once (54 greened). B10 confirms the hint SURVIVES Try again while the
verdict clears.

**One tile I did NOT re-tag clean — reported instead, per the brief.** `Ccat`
("Sort into groups", categorize) still marks only the whole answer, because rule 14
was ruled to cover `order` + `sequence-build` only (Venkat, this session).
Now that ordering marks its tiles, sorting-into-groups is inconsistent with it. I
tagged Ccat **"Worth a look"** with a caption stating the difference plainly, and
called it out in the intro note, so Venkat can decide whether to extend rule 14 to
categorize. I did **not** silently mark it clean or silently fix it (out of scope).

Intro note rewritten: the three problems are stated as **resolved**, with the one
open categorize decision surfaced.

---

## 3.2 — Line endings (byte-level Python, not grep)

```
$ python -c "import io;b=io.open('review/_INTERACTION-ATLAS-2.html','rb').read();
             print('CRLF:',b.count(b'\r\n'),'data-uris:',b.count(b'data:image/png;base64,'),
             'external:',b.count(b'http://')+b.count(b'https://'))"
CRLF: 0   data-uris: 22   external: 0
```
`docs/ISSUES.md`: `CRLF: 0`. Both files are pure LF.

---

## 3.3 — verify-format, run explicitly

`verify-format.js` ran inside the full `npm test` (`all 102 match the lesson
format`). Run again explicitly on one lesson, per the note that
`verify-format-staged` reports green when nothing is staged:

```
$ node tools/verify-format.js compare_numbers_up_to_five_digits
PASS  compare_numbers_up_to_five_digits  (30 cards, structure + paint identical)

all 1 match the lesson format
```

The engine changes do not touch the initial (pre-interaction) render, so every
on-disk review page still matches the pipeline card-for-card.

---

## 3.4 — docs/ISSUES.md

- **#86** (multi-select tick) — **CLOSED** by item 2; names rule 12; guard G11.
- **#111** (Try-again stale feedback) — **amended**: item 3 extended the fix to the
  Try-again BUTTON (RETRY-STATE-2 had deliberately left that out), narrowed rule 4,
  and added the empty-chat collapse. Row stays closed; note dated.
- **#119** (NEW) — the red-box painter defect (Atlas Finding 1); rules 10, 12;
  found + closed by item 1; guard G10.
- **#120** (NEW) — ordering marks the misplaced tiles (Atlas Finding 3 + the
  change); rule 14; found + closed by item 5; guard G14. Notes the open categorize
  question (relates to #32).
- **#121** (NEW) — the explain line removed; rule 13; closed by item 4; carries the
  orphaned-field count (2,454 across 99 files) for a later content brief and the
  §13.8 supersession; guards G13 / verify-calm test g / verify-styles BUG-4.

All rows are 11-field, LF, append-only (nothing deleted).

---

## 3.5 — Local commit (NOT pushed)

Full `npm test` is green (exit 0, "all green") on the exact committed tree —
including the amended guards:
- `PASS  explanation stays hidden (rule 13 …)`
- `PASS  … the empty chat collapses on Try again (fresh start, rule 2)`
- `PASS  … law 4 (narrowed): the whyWrong verdict is HIDDEN on Try again`
- `PASS  … law 4: the HINT(s) stay VISIBLE`

Commit details (hash, file list, origin diff) are appended below after the commit.

---

## Deliverables checklist (from the brief)

- [x] amended `tools/verify-retry-state.js` (G10–G15)
- [x] amended `tools/verify-reset.js` (law-4 narrowing + empty-chat)
- [x] amended engine files (`rao-card.js`, `rao.css`, `rao-card.css`)
- [x] `review/_INTERACTION-ATLAS-2.html` (original retained)
- [x] `docs/ISSUES.md` updated
- [x] four phase reports
- [x] one local commit, unpushed
- [x] (also) `verify-calm.js` test g + `verify-styles.js` BUG-4 amended to rule 13
