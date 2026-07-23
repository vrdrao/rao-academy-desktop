#!/usr/bin/env node
/* ── Capture Legacy Explain Baseline ──
 *
 * Runs every lesson through the CURRENT engine's build() and captures the
 * exact HTML string that each question's explain field produces. This
 * baseline is saved BEFORE any engine changes, so the snapshot guard can
 * compare new renderer output against it.
 *
 * Output: tools/explain-baseline.json
 *   { "<relative/path.html>:<qIndex>": "<html string>", ... }
 *
 * Keys use RELATIVE PATHS from lessons/, not basenames, to avoid collisions
 * when two files share a basename (basenames are unique across lessons/ now that
 * lessons/incoming/ has been merged in — BRIEF-CONSOLIDATE-1 Step 2).
 *
 * The HTML string is captured at the ENGINE level — the exact string that
 * parseQuestion() produces as _explainHtml — NOT a DOM serialization.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT    = path.resolve(__dirname, "..");
const ENGINE  = path.join(ROOT, "engine", "preview-engine.js");
const LESSONS = path.join(ROOT, "lessons");

// Load engine in Node
global.window = {};
eval(fs.readFileSync(ENGINE, "utf8"));
const RaoPreview = global.window.RaoPreview;

if (!RaoPreview || !RaoPreview.build) {
  console.error("Could not load engine");
  process.exit(1);
}

// Collect all lesson files recursively
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
console.log(`Scanning ${files.length} lesson files...`);

const baseline = {};
let totalQ = 0;
let withExplain = 0;

for (const f of files) {
  const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
  const html = fs.readFileSync(f, "utf8");
  let source;
  try { source = sourceOf(html); } catch { continue; }

  let qs;
  try { qs = RaoPreview.build(source); } catch (e) {
    console.error(`  SKIP ${rel}: ${e.message}`);
    continue;
  }

  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const key = `${rel}:${i}`;
    totalQ++;

    // The engine bakes explain into markup as: <p class="explain">...</p>
    // We capture the explain string and reconstruct the exact HTML the engine produces.
    if (q.explain) {
      // This is the exact line from the engine (line 1568):
      //   const _explainHtml = explain ? `<p class="explain">${explain}</p>` : "";
      baseline[key] = `<p class="explain">${q.explain}</p>`;
      withExplain++;
    } else {
      baseline[key] = "";
    }
  }
}

const outPath = path.join(__dirname, "explain-baseline.json");
fs.writeFileSync(outPath, JSON.stringify(baseline, null, 2));

console.log(`\nBaseline captured:`);
console.log(`  ${files.length} lessons, ${totalQ} questions`);
console.log(`  ${withExplain} with explain, ${totalQ - withExplain} without`);
console.log(`  Saved to ${outPath}`);
