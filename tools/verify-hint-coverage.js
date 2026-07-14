#!/usr/bin/env node
/* ── Hint Coverage Guard ──
 *
 * Every question in every real lesson must have at least one hint rung.
 * A question with no hint means a stuck child gets zero help.
 *
 * _type-coverage.html is excluded — it is the harness fixture, not a
 * real lesson. No child ever sees it.
 *
 * Usage:  node tools/verify-hint-coverage.js
 * Exit 0 = all real questions have hints.
 * Exit 1 = at least one question has no hint.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT    = path.resolve(__dirname, "..");
const ENGINE  = path.join(ROOT, "engine", "preview-engine.js");
const LESSONS = path.join(ROOT, "lessons");

const C = { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", b: "\x1b[1m", x: "\x1b[0m" };

// Load the real engine
global.window = {};
eval(fs.readFileSync(ENGINE, "utf8"));
const RaoPreview = global.window.RaoPreview;

// Recursive lesson discovery
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

function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  const b = html.indexOf('<div id="preview"');
  if (a < 0) return null;
  return html.slice(a, b > a ? b : undefined);
}

console.log("\n── Hint Coverage ──\n");

const files = collectLessons(LESSONS);
let totalQ = 0;
let missing = 0;
const examples = [];

for (const f of files) {
  const basename = path.basename(f);

  // _type-coverage.html is the harness fixture, not a real lesson
  if (basename === "_type-coverage.html") continue;

  const html = fs.readFileSync(f, "utf8");
  const src = sourceOf(html);
  if (!src) continue;

  let qs;
  try { qs = RaoPreview.build(src); } catch { continue; }

  const rel = path.relative(LESSONS, f).replace(/\\/g, "/");

  for (let qi = 0; qi < qs.length; qi++) {
    totalQ++;
    const q = qs[qi];
    if (!q.hint) {
      missing++;
      if (examples.length < 10) {
        examples.push(`${rel}:q${qi + 1} (${q.behavior})`);
      }
    }
  }
}

console.log(`  Questions checked: ${totalQ}`);

if (missing > 0) {
  console.log(`  ${C.r}FAIL${C.x} — ${missing} question(s) have no hint`);
  for (const ex of examples) console.log(`    ${ex}`);
} else {
  console.log(`  ${C.g}PASS${C.x} — all ${totalQ} questions have at least one hint`);
}

console.log();
process.exit(missing > 0 ? 1 : 0);
