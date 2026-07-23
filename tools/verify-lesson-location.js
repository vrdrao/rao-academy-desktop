"use strict";
/* ── verify-lesson-location.js — lesson files live only in canonical folders ──
 *
 * A "lesson file" is any .html whose bytes contain a `<!--@q` frontmatter
 * marker. Five folders once held lesson files and Venkat could not tell which
 * held what (BRIEF-CONSOLIDATE-1). This guard stops that recurring: it FAILS if
 * a lesson file appears anywhere outside the canonical locations below.
 *
 * It reads only .html files OUTSIDE the allowed locations (fast — the big
 * review/ pages are allowed and never opened), and flags any that carry `<!--@q`.
 *
 * Run:  node tools/verify-lesson-location.js
 * Exit 0 = every lesson file is in a canonical folder. Non-zero = a stray lesson.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", d: "\x1b[2m", x: "\x1b[0m" };

// Canonical homes for lesson files. A lesson may only live under one of these.
const ALLOWED_PREFIXES = [
  "lessons/",   // the deliverable lessons (incl. lessons/_preview/; lessons/incoming/ was merged into lessons/ by BRIEF-CONSOLIDATE-1 Step 2)
  "review/",    // rendered review pages (embed the lesson's #source)
  "archive/",   // archived/retired lessons, kept for history
];

// Documented, TEMPORARY exceptions — each kept by an explicit Venkat ruling in
// BRIEF-CONSOLIDATE-1 (2026-07-23). Delete the exception once its reason is gone.
const ALLOWED_EXCEPTIONS = [
  // sources/ — 21 legacy self-contained lessons; TEMPORARY, retained until the
  //   "subtract numbers ending in zeroes" conversion gap is investigated.
  "sources/",
  // lessons-g3/ — Grade 3 is parked, EXCEPT multiplication_facts_up_to_10.html,
  //   which tools/verify-panel-layout.js uses as a fixture; TEMPORARY.
  "lessons-g3/",
  // tools/scratch/dropped-prose-fixture.html — a structural-test FIXTURE, not a
  //   shipped lesson; TEMPORARY (lives with the scratch tooling, not a deliverable).
  "tools/scratch/dropped-prose-fixture.html",
];

function isAllowed(rel) {
  if (ALLOWED_PREFIXES.some((p) => rel.startsWith(p))) return true;
  return ALLOWED_EXCEPTIONS.some((e) => (e.endsWith("/") ? rel.startsWith(e) : rel === e));
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const strays = [];
for (const f of walk(ROOT, [])) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  if (isAllowed(rel)) continue;                 // canonical/excepted — content irrelevant
  let txt;
  try { txt = fs.readFileSync(f, "utf8"); } catch (e) { continue; }
  if (txt.includes("<!--@q")) strays.push(rel);  // a lesson file in a disallowed place
}

console.log(`\n${C.b}LESSON LOCATION${C.x} — lesson files (<!--@q) live only in canonical folders`);
console.log(`${C.d}allowed: ${ALLOWED_PREFIXES.join(", ")} + ${ALLOWED_EXCEPTIONS.length} documented exception(s)${C.x}`);

if (strays.length) {
  console.error(`\n${C.r}${C.b}FAIL${C.x} — ${strays.length} lesson file(s) outside the canonical folders:`);
  strays.forEach((s) => console.error(`${C.r}  stray  ${s}${C.x}`));
  console.error(`${C.d}Move it into lessons/ (or review/ / archive/), or add a documented, temporary exception.${C.x}`);
  process.exit(1);
}
console.log(`${C.g}${C.b}PASS${C.x} — no stray lesson files\n`);
