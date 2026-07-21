#!/usr/bin/env node
/* ── verify-no-middot.js — no raised dot `·` in Grade 4 lesson content ──
 *
 * Item 38 (RULED 2026-07-21): the raised dot `·` has no place in Grade 4.
 * It reads as a multiply sign to a nine-year-old. Prose separators must be
 * commas; multiplication must be `×`. This guard makes a regression impossible.
 *
 * It scans every lesson under lessons/ (the 2,668-question corpus) for any `·`
 * in child-facing content and HARD-FAILS, naming file:line. There is no
 * legitimate `·` in Grade 4 lesson content — every one measured (BRIEF-CONTENT-1
 * Task A, docs/audits/CONTENT-CENSUS-33-38.md) was a ` · ` clause separator, all
 * converted to commas by Task B.
 *
 * `lessons/_preview/` is a stale build artifact excluded from the corpus by the
 * engine and every other guard; it is skipped here for the same reason.
 *
 * Usage:  node tools/verify-no-middot.js
 * Exit 0 = no `·` anywhere in lesson content.
 * Exit 1 = at least one `·` found (named with file:line).
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT    = path.resolve(__dirname, "..");
const LESSONS = path.join(ROOT, "lessons");
const C = { r: "\x1b[31m", g: "\x1b[32m", x: "\x1b[0m" };

function collectLessons(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "_preview") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(collectLessons(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

console.log("\n── No middot in lesson content (Item 38) ──\n");

const files = collectLessons(LESSONS);
const hits = [];

for (const f of files) {
  const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
  const lines = fs.readFileSync(f, "utf8").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("·")) {
      hits.push(`${rel}:${i + 1}  ${lines[i].trim().slice(0, 90)}`);
    }
  }
}

console.log(`  Lesson files scanned: ${files.length}`);

if (hits.length > 0) {
  console.log(`  ${C.r}FAIL${C.x} — ${hits.length} line(s) contain a raised dot ·:`);
  for (const h of hits.slice(0, 30)) console.log(`    ${h}`);
  if (hits.length > 30) console.log(`    …and ${hits.length - 30} more`);
  console.log(`\n  Replace prose separators with commas, multiplication with ×.\n`);
  process.exit(1);
}

console.log(`  ${C.g}PASS${C.x} — no raised dot · in any lesson content.\n`);
process.exit(0);
