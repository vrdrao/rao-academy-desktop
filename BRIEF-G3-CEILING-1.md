# BRIEF-G3-CEILING-1 — Number ceilings and interaction inventory, three documents

**Type: READ-ONLY. This brief makes NO changes to any file in the repo.**
**No authoring. No engine changes. No guards. No commits. No push.**

Expected duration: ~10–15 minutes.

---

## 0. SCOPE FENCE

- Read **only** the three documents named in §2. No others.
- Do **not** author a single question. Do **not** draft, sketch, propose or
  outline lesson content. This brief produces a measurement report and nothing
  else.
- Do **not** write the number ceilings into a guard, a config file, or
  `CLAUDE.md`. Turning this report into a guard is a later brief and a
  chat-side ruling.
- Do **not** create, move, rename or delete any file.
- Do **not** stage, commit or push.
- Do **not** modify `docs/ISSUES.md`. This brief commits nothing.
- `lessons/`, `lessons-g3/`, all other grades' sources, and the other 195
  Grade 3 documents are **out of scope**.

**Extracting images to a temporary location in order to read them is
permitted** if that is the only way to see them, provided every extracted
artifact is deleted before the run ends and the report states plainly that it
was done and that cleanup completed. Nothing extracted may remain on disk.

---

## 1. WHY THIS EXISTS

**Every Grade 3 question is a screenshot. There is zero typed question text.**
The number ranges Grade 3 is permitted to use are therefore **UNMEASURED** —
they are known only from document titles, which is inference, not measurement.
They live inside the images.

Two defects are being hunted, and neither can be caught retroactively:

1. **Authoring above grade level.** If we author 30 questions and only then
   discover Grade 3 division stops at 10, the defect has been committed thirty
   times before anyone notices once. There is nothing to compare against after
   the fact.
2. **Authoring an interaction the engine cannot render.** A prior survey named
   four gaps: no interactive ruler, no interactive thermometer, no interactive
   clock, and `construct` existing in the engine but absent from the 8-type
   list. If a lesson's pedagogy depends on an instrument we do not have, that
   must surface now, with three lessons on the table, not in Phase 3.

**Report what is in the images. Do not infer from the filename.** A document
called "up to 10" that contains a 12 must be reported as containing a 12.

---

## 2. THE THREE DOCUMENTS

Read exactly these three, from the repo directory `sources-g3/`:

1. `Multiplication fluency/Multiplication facts up to 10.docx`
2. `Logical reasoning/Find two numbers based on sum and difference.docx`
3. `Measurement/Measure using a centimetre ruler.docx`

These were chosen to be maximally different in interaction shape —
fact-fluency, prose-dependent word problem, and instrument-reading figure.

**If any of the three is missing, unreadable, or contains zero images:** report
that fact for that document, continue with the others, and do **not**
substitute a different file. Selection is a chat-side judgment.

---

## 3. TASK A — inventory each document

Per document, report:

1. Full path as given in §2.
2. File size in bytes.
3. Number of embedded images.
4. Amount of typed (non-image) body text: report as **none**, **headings
   only**, or **substantive** — and if substantive, quote up to the first 200
   characters verbatim so chat can judge.

---

## 4. TASK B — the number ceiling

Per document, read **every** image and report the following. Where a category
does not appear in the document at all, say **N/A — not present**. Do not
leave a row blank and do not guess.

| Field | What to report |
|---|---|
| Largest addend | The largest single number being added anywhere |
| Largest sum | The largest total reached by addition |
| Largest minuend | The largest number being subtracted *from* |
| Largest factor | The largest single number being multiplied |
| Largest product | The largest total reached by multiplication |
| Largest dividend | The largest number being divided |
| Largest divisor | The largest number divided *by* |
| Division remainders | Do any division questions produce a remainder? YES / NO / N/A |
| Fractions | Present? If so, in what form — numeric (3/4), words ("one half"), shaded figures, or a mix |
| Decimals | Present? If so, how many decimal places |
| Negative numbers | Present? YES / NO |
| Place-value ceiling | The largest number appearing *anywhere* in the document, in any role |
| Units of measure | Every unit that appears (cm, m, kg, ml, °C, ₹, minutes, …) |
| Money | Present? If so, largest amount, and is it whole rupees or rupees-and-paise |

**Additionally, per document:** state the largest number appearing anywhere,
and name which image it appears in, so the claim is traceable.

**Anti-laundering rules for this task:**

- If an image is too low-resolution, cropped, or otherwise unclear, mark that
  image **UNREADABLE** and say which fields it might have affected. Do not
  interpolate.
- If a number is ambiguous between two readings (e.g. 8 vs 3), report both
  candidates and mark it **AMBIGUOUS**. Do not pick one.
- **Do not round, generalise or tidy.** If the largest product observed is 81,
  report 81 — not "under 100" and not "up to 10 × 10".
- Report what was **observed**, and state the number of images actually read
  versus the number present. If those two numbers differ, say why.

---

## 5. TASK C — the interaction inventory

This is the second half of the brief and is **equally important**. A number
ceiling stops us authoring above grade level; this stops us authoring
something that cannot be rendered.

Per document, and where possible per question within the document, report
**what the child is physically being asked to do.** Use these buckets:

- **Tap one option** (single-select from text choices)
- **Tap several options** (multi-select)
- **Tap a region of a picture** (select over an image)
- **Type a number**
- **Type words**
- **Drag / sort / order** — state what into what
- **Read an instrument** — name it (ruler, thermometer, clock, scale, …)
- **Construct or draw** — state what is being constructed
- **Other** — describe it

For each document also report:

1. The **approximate mix** — e.g. "roughly 20 of 25 questions are tap-one-option,
   5 require reading a ruler." Approximate is fine and should be labelled
   approximate.
2. **Whether the question can be answered from the numbers alone**, or whether
   understanding the prose or the picture is required. Report per document as
   **numbers-alone**, **prose-dependent**, **figure-dependent**, or **mixed**.
3. **Whether any question depends on an instrument the child must read to a
   precision** — e.g. measuring to the nearest centimetre versus half
   centimetre. State the finest gradation observed.
4. **Whether any question depends on a previous question.** YES / NO. (Our
   self-containment law forbids this in authored output; we need to know if the
   source relies on it.)

**Do not propose a solution, a question type, or an engine change.** Naming a
gap is in scope. Designing around it is not.

---

## 6. STOP CONDITIONS

- **`sources-g3/` does not exist** → report and stop. Do not substitute
  `word-staging\word docs-g3\`.
- **A named document does not exist at its stated path** → report it, continue
  with the others, substitute nothing.
- **A document contains zero images** → report that as the finding for that
  document and move on. It is a real result, not a failure.
- **Any operation would write to the repo** → do not perform it.
- **Image extraction leaves artifacts that cannot be cleaned up** → say so
  explicitly and name every file left behind.

A correct stop is a success. Reporting **UNMEASURED** is a correct outcome.

---

## 7. OUTPUT FORMAT

Print to the terminal. Do **not** write a report file into the repo.

```
=== BRIEF-G3-CEILING-1 REPORT ===

######## DOCUMENT 1: <path> ########

--- INVENTORY ---
Size: <bytes>
Images: <n>   Images read: <n>
Typed body text: none | headings only | substantive
<first 200 chars if substantive>

--- NUMBER CEILING ---
Largest addend:        <value or N/A>
Largest sum:           <value or N/A>
Largest minuend:       <value or N/A>
Largest factor:        <value or N/A>
Largest product:       <value or N/A>
Largest dividend:      <value or N/A>
Largest divisor:       <value or N/A>
Division remainders:   YES | NO | N/A
Fractions:             <absent, or form>
Decimals:              <absent, or places>
Negative numbers:      YES | NO
Place-value ceiling:   <value>  (seen in image <n>)
Units of measure:      <list or none>
Money:                 <absent, or largest + whole/paise>

--- INTERACTION INVENTORY ---
Mix (approximate):     <breakdown>
Answerable from:       numbers-alone | prose-dependent | figure-dependent | mixed
Instrument precision:  <finest gradation, or N/A>
Cross-question deps:   YES | NO

--- ANOMALIES ---
Unreadable images:     <list or none>
Ambiguous readings:    <list or none>

######## DOCUMENT 2: ... ########
...

######## DOCUMENT 3: ... ########
...

=== CROSS-DOCUMENT SUMMARY ===
Highest number seen across all three, and where:
Engine gaps named (instruments/interactions we do not have):
Anything that contradicts its own filename:

=== CLEANUP ===
Images extracted to temp: YES | NO
Temp artifacts removed:   YES | NO | <list of anything left>
Repo modified:            MUST BE "NO"

=== END REPORT ===
```

---

## 8. WHAT SUCCESS LOOKS LIKE

Three documents measured, every ceiling field either given a value or marked
**N/A — not present**, every interaction named, every unreadable or ambiguous
image disclosed rather than guessed at, and **nothing in the repo changed.**

The report's ceiling numbers become a guard in a later brief. Its interaction
inventory becomes a chat-side ruling on what Grade 3 can and cannot ask.
Neither happens in this brief.
