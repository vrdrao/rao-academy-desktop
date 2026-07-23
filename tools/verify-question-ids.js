#!/usr/bin/env node
/* ── verify-question-ids.js — EVERY QUESTION HAS A STABLE, OPAQUE ID (BRIEF-ID-1) ──
 *
 * The only prior identity was positional (`auth-q{index+1}`), unstable across
 * edits and colliding across lessons (auth-q1 named 118 different questions).
 * This guard enforces the permanent-ID scheme: each question in the source
 * frontmatter carries `id: q<8 Crockford chars>`, unique corpus-wide, opaque.
 *
 * Scan set: lessons/*.html + lessons/incoming/*.html.  NEVER lessons-g3/.
 *
 * Assertions:
 *   1. Every question has an `id:` in its @q frontmatter.        (count missing)
 *   2. Every ID matches  ^q[23456789abcdefghijkmnpqrstuvwxyz]{8}$.
 *   3. Every ID is unique corpus-wide (distinct == total == 3015).
 *   4. Every ID survives into the #source block that the platform imports —
 *      the exact block make-review.js copies verbatim into the review page
 *      (make-review.js:61 sourceOf, :252 `${source}`). Checked on >=3 lessons.
 *   5. No ID encodes position: for no lesson do the document-order IDs come out
 *      already ascending (a positional scheme sorts into document order for
 *      EVERY lesson; random IDs essentially never, min lesson size here is 8).
 *   6. lessons-g3/ is not in the scan set.
 *
 * Exit 0 = all six hold. Exit 1 = at least one fails (named, with numbers).
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", x: "\x1b[0m" };
// Corpus-size tripwire. This number must ONLY ever change as part of an
// explicitly authorised brief that predicts the new value BEFORE the run.
// Never edit this to make a failing test pass.
//
// History:
//   3015 -> 2668  BRIEF-CULL-1A/1B, 2026-07-20: 15 duplicate _1to1/faithful
//                 lessons archived to archive/lessons-1to1/. 347 questions
//                 removed from the live corpus. Their IDs remain permanently
//                 taken in docs/question-ids.json, which did not shrink.
//   2668 -> 2666  BRIEF-CHILD-FACING-FIX-1, 2026-07-23: two unanswerable/inert
//                 questions dropped — qhhmpihb4 (§1, no statement on card) from
//                 compare_numbers_up_to_five_digits.html and q8gwp2qc7 (§2,
//                 round-then-order that tests nothing) from incoming/rounding_remix.html.
//                 Their IDs remain permanently taken in docs/question-ids.json.
const EXPECTED = 2666;
const ID_RE = /^q[23456789abcdefghijkmnpqrstuvwxyz]{8}$/;

let failures = 0;
function pass(n, d) { console.log(`  ${C.g}PASS${C.x}  ${n}${d ? " — " + d : ""}`); }
function fail(n, d) { failures++; console.log(`  ${C.r}FAIL${C.x}  ${n}${d ? " — " + d : ""}`); }

// The scan set — lessons/ (top level) + lessons/incoming/. Explicitly NOT lessons-g3.
function scanSet() {
  const out = [];
  const top = path.join(ROOT, "lessons");
  for (const e of fs.readdirSync(top, { withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith(".html")) out.push(path.join(top, e.name));
  }
  const inc = path.join(top, "incoming");
  if (fs.existsSync(inc)) {
    for (const e of fs.readdirSync(inc, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith(".html")) out.push(path.join(inc, e.name));
    }
  }
  return out.sort();
}

// Pull every @q block from a file, in document order, with its id (or null).
function questionsOf(html) {
  const re = /<!--@q\b([\s\S]*?)-->/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    const fm = m[1];
    const idm = fm.match(/^[ \t]*id:[ \t]*(\S+)[ \t]*$/m);
    out.push({ id: idm ? idm[1] : null });
  }
  return out;
}

// The #source block, extracted exactly as make-review.js does (its sourceOf).
function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  if (a < 0) return null;
  return html.slice(a);
}

(async () => {
  console.log(`\n${C.b}QUESTION IDS${C.x} — every question has a stable, opaque, unique id (BRIEF-ID-1)\n`);

  const files = scanSet();
  const perFile = files.map((f) => ({ file: path.relative(ROOT, f).replace(/\\/g, "/"), html: fs.readFileSync(f, "utf8") }));
  perFile.forEach((r) => (r.qs = questionsOf(r.html)));

  const total = perFile.reduce((s, r) => s + r.qs.length, 0);
  const allIds = perFile.flatMap((r) => r.qs.map((q) => q.id).filter(Boolean));

  // corpus sanity: total must equal the authorised EXPECTED tripwire above
  if (total === EXPECTED) console.log(`  scan: ${files.length} files, ${total} questions (expected ${EXPECTED})\n`);
  else fail(`corpus size is ${EXPECTED}`, `saw ${total} across ${files.length} files`);

  /* 1. every question has an id */
  const missing = perFile.flatMap((r) => r.qs.map((q, i) => ({ file: r.file, i: i + 1, id: q.id }))).filter((x) => !x.id);
  if (missing.length === 0) pass("1. every question carries an id:", `${total}/${total}`);
  else fail("1. every question carries an id:", `${missing.length} missing — e.g. ${missing.slice(0, 3).map((x) => x.file + " #" + x.i).join(", ")}`);

  /* 2. every id matches the scheme */
  const bad = allIds.filter((id) => !ID_RE.test(id));
  if (allIds.length && bad.length === 0) pass("2. every id matches ^q[23456789abcdefghijkmnpqrstuvwxyz]{8}$", `${allIds.length} ids`);
  else fail("2. every id matches the scheme", allIds.length ? `${bad.length} malformed — e.g. ${bad.slice(0, 3).join(", ")}` : "no ids present at all");

  /* 3. unique corpus-wide */
  const distinct = new Set(allIds);
  const dupes = {};
  allIds.forEach((id) => (dupes[id] = (dupes[id] || 0) + 1));
  const collided = Object.entries(dupes).filter(([, n]) => n > 1);
  if (allIds.length === total && distinct.size === total && collided.length === 0)
    pass("3. ids unique corpus-wide", `distinct ${distinct.size} == questions ${total}`);
  else fail("3. ids unique corpus-wide", `distinct ${distinct.size}, ids ${allIds.length}, questions ${total}, collisions ${collided.length}${collided.length ? " — e.g. " + collided.slice(0, 3).map(([k, n]) => k + "×" + n).join(", ") : ""}`);

  /* 4. ids survive into the importable #source block (>=3 lessons) */
  const sample = perFile.filter((r) => r.qs.length && r.qs.every((q) => q.id)).slice(0, 3);
  if (sample.length < 3) {
    fail("4. ids survive into #source (>=3 lessons)", `only ${sample.length} fully-id'd lessons available to sample`);
  } else {
    let ok = true, detail = [];
    for (const r of sample) {
      const src = sourceOf(r.html);
      const present = src != null && r.qs.every((q) => src.includes("id: " + q.id) || src.includes("id:" + q.id));
      detail.push(`${r.file}:${present ? "ok" : "MISSING"}`);
      if (!present) ok = false;
    }
    if (ok) pass("4. every id present in the #source block make-review copies verbatim", detail.join(", "));
    else fail("4. ids survive into #source", detail.join(", "));
  }

  /* 5. no id encodes position — document-order ids never come out already ascending */
  const ordered = perFile.filter((r) => r.qs.length >= 2 && r.qs.every((q) => q.id));
  const positional = ordered.filter((r) => {
    const ids = r.qs.map((q) => q.id);
    const sorted = [...ids].sort();
    return ids.every((v, i) => v === sorted[i]); // ids already in ascending (document) order
  });
  if (ordered.length && positional.length === 0)
    pass("5. no lesson's ids are in document order (opacity)", `${ordered.length} multi-question lessons checked`);
  else fail("5. no lesson's ids encode position", positional.length ? `${positional.length} lesson(s) sort into document order — e.g. ${positional.slice(0, 3).map((r) => r.file).join(", ")}` : "no multi-question lessons with ids to check");

  /* 6. lessons-g3 is not scanned */
  const g3 = files.filter((f) => f.replace(/\\/g, "/").includes("/lessons-g3/"));
  if (g3.length === 0) pass("6. lessons-g3/ excluded from the scan set");
  else fail("6. lessons-g3/ excluded", `${g3.length} g3 file(s) leaked into the scan`);

  console.log(`\n${failures === 0 ? C.g + "QUESTION IDS: every question has a stable, opaque, unique id ✅" : C.r + failures + " id check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-question-ids crashed:", e); process.exit(1); });
