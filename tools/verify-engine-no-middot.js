#!/usr/bin/env node
/* ── verify-engine-no-middot.js — no `·` in the engine's child-facing insert ──
 *
 * Item 38 (RULED 2026-07-21). The expression keypad used to insert " · " as its
 * multiply operator (preview-engine.js, insert + backspace). A nine-year-old
 * reads `·` as a multiply sign — which is exactly what it was here, so the glyph
 * itself is fine as MEANING but wrong as GRADE-4 TYPOGRAPHY: the ruling is `×`.
 * BRIEF-CONTENT-1 Task C changed both sites to " × ".
 *
 * This guard asserts the engine contains no raised dot `·` at all, so the insert
 * path can never regress to " · ". Grading is unaffected — nothing ever parsed
 * or graded on `·` (P3, verified against the repo); this is typography, not
 * behaviour.
 *
 * Scope: engine/preview-engine.js only — the file that renders the keypad and
 * the input a child types into. robo.js middots are header-comment bullets, not
 * child-facing insert text, and are out of scope.
 *
 * Usage:  node tools/verify-engine-no-middot.js
 * Exit 0 = no `·` in preview-engine.js.
 * Exit 1 = a `·` is present (named with line).
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT   = path.resolve(__dirname, "..");
const ENGINE = path.join(ROOT, "engine", "preview-engine.js");
const C = { r: "\x1b[31m", g: "\x1b[32m", x: "\x1b[0m" };

console.log("\n── No middot in the engine insert path (Item 38) ──\n");

const lines = fs.readFileSync(ENGINE, "utf8").split(/\r?\n/);
const hits = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("·")) hits.push(`preview-engine.js:${i + 1}  ${lines[i].trim().slice(0, 100)}`);
}

if (hits.length > 0) {
  console.log(`  ${C.r}FAIL${C.x} — ${hits.length} line(s) in preview-engine.js contain a raised dot ·:`);
  for (const h of hits) console.log(`    ${h}`);
  console.log(`\n  The expression keypad must insert " × ", never " · ".\n`);
  process.exit(1);
}

console.log(`  ${C.g}PASS${C.x} — preview-engine.js contains no raised dot ·.\n`);
process.exit(0);
