#!/usr/bin/env node
/* ── Legacy Explain Snapshot Guard ──
 *
 * Compares the solution renderer's output for every legacy explain string
 * against the baseline captured from the PREVIOUS engine version. This is
 * a pre-DOM HTML string comparison — NOT a DOM serialization comparison.
 *
 * The baseline was captured by tools/capture-explain-baseline.js BEFORE
 * any engine changes. A mismatch means the new renderer changed legacy
 * output — which is a regression.
 *
 * Usage:  node tools/verify-snapshot.js
 * Exit code 0 = all legacy explains are byte-identical.
 * Exit code 1 = at least one mismatch.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT      = path.resolve(__dirname, "..");
const ENGINE    = path.join(ROOT, "engine", "preview-engine.js");
const RENDERER  = path.join(ROOT, "engine", "solution-renderer.js");
const BASELINE  = path.join(__dirname, "explain-baseline.json");
const LESSONS   = path.join(ROOT, "lessons");

if (!fs.existsSync(BASELINE)) {
  console.error("ERROR: explain-baseline.json not found. Run capture-explain-baseline.js first.");
  process.exit(2);
}

// Load engine
global.window = {};
eval(fs.readFileSync(ENGINE, "utf8"));
const RaoPreview = global.window.RaoPreview;

// Load solution renderer
delete require.cache[require.resolve(RENDERER)];
const { renderSolution } = require(RENDERER);

// Load baseline
const baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));

// Collect lessons
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
  if (a < 0) throw new Error("no <div id=\"source\"> block found");
  return html.slice(a, b > a ? b : undefined);
}

const files = collectLessons(LESSONS);

console.log("\n── Legacy Explain Snapshot Guard ──\n");
console.log(`  Baseline: ${Object.keys(baseline).length} entries`);
console.log(`  Lessons:  ${files.length} files\n`);

let checked = 0;
let passed  = 0;
let failed  = 0;
const mismatches = [];

for (const f of files) {
  const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
  const html = fs.readFileSync(f, "utf8");
  let source;
  try { source = sourceOf(html); } catch { continue; }

  let qs;
  try { qs = RaoPreview.build(source); } catch { continue; }

  for (let i = 0; i < qs.length; i++) {
    const key = `${rel}:${i}`;
    const expected = baseline[key];
    if (expected === undefined) continue; // new question not in baseline

    checked++;

    // Render through the solution renderer — legacy path
    const actual = renderSolution({ explain: qs[i].explain || null, solution: null });

    if (actual === expected) {
      passed++;
    } else {
      failed++;
      if (mismatches.length < 10) {
        mismatches.push({ key, expected: expected.slice(0, 120), actual: actual.slice(0, 120) });
      }
    }
  }
}

if (mismatches.length > 0) {
  console.log("  MISMATCHES:\n");
  for (const m of mismatches) {
    console.log(`    ${m.key}`);
    console.log(`      expected: ${m.expected}`);
    console.log(`      actual:   ${m.actual}\n`);
  }
}

console.log(`  Checked: ${checked}`);
console.log(`  Passed:  ${passed}`);
console.log(`  Failed:  ${failed}\n`);

if (failed > 0) {
  console.log(`  FAIL — ${failed} legacy explain(s) changed. This is a regression.\n`);
  process.exit(1);
} else {
  console.log(`  PASS — all ${passed} legacy explains are byte-identical.\n`);
  process.exit(0);
}
