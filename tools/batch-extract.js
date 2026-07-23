/* ============================================================================
   batch-extract.js — strips stale wrappers from legacy lesson files.

   Every file from the "Class 4 HTML Files" batch has the same stale pattern:
     - embedded preview-engine.js
     - embedded card CSS (.pv-frame, .pv-card, etc.)
     - Google Fonts <link>
     - inline theme vars on #preview
     - body/layout CSS, <h1>, .note markup

   The content inside <div id="source">…</div> is fine every time.
   This script extracts just that block for each file.

   Usage:  node tools/batch-extract.js <source-dir>
           Copies every .html from source-dir into lessons/ (the single lesson
           folder since BRIEF-CONSOLIDATE-1 Step 2 merged lessons/incoming/ in),
           extracts the #source content, and reports results.

   Does NOT validate, generate reviews, or take screenshots — that is
   still the per-file loop's job.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const srcDir = process.argv[2];
if (!srcDir) {
  console.error("Usage: node tools/batch-extract.js <source-directory>");
  process.exit(1);
}

const abs = path.resolve(srcDir);
if (!fs.existsSync(abs)) {
  console.error("Directory not found: " + abs);
  process.exit(1);
}

const ROOT = path.join(__dirname, "..");
// Import target: the single lessons/ folder (lessons/incoming/ was merged in by
// BRIEF-CONSOLIDATE-1 Step 2). New imports land directly in lessons/.
const INCOMING = path.join(ROOT, "lessons");
fs.mkdirSync(INCOMING, { recursive: true });

const files = fs.readdirSync(abs).filter(f => f.endsWith(".html"));
console.log(`Found ${files.length} HTML files in ${abs}\n`);

let extracted = 0, alreadyClean = 0, failed = 0;
const failures = [];

for (const file of files) {
  const src = path.join(abs, file);
  const dest = path.join(INCOMING, file);
  const html = fs.readFileSync(src, "utf8");

  // Check if it's already content-only (starts with <div id="source">)
  if (/^\s*<div id="source">/.test(html)) {
    fs.copyFileSync(src, dest);
    alreadyClean++;
    console.log(`  clean  ${file}`);
    continue;
  }

  // Extract #source block — try both patterns
  const m = html.match(/<div id="source">([\s\S]*?)<\/div>\s*<div id="preview"/);
  if (!m) {
    // Try alternate: source block might end differently
    const m2 = html.match(/<div id="source">([\s\S]*?)<\/div>\s*\n*\s*<div id="preview"/);
    if (!m2) {
      failed++;
      failures.push(file);
      console.log(`  FAIL   ${file} — could not find #source block`);
      // Copy original anyway so it can be inspected
      fs.copyFileSync(src, dest);
      continue;
    }
    fs.writeFileSync(dest, '<div id="source">' + m2[1] + '</div>\n');
    extracted++;
    console.log(`  extract ${file}`);
    continue;
  }

  fs.writeFileSync(dest, '<div id="source">' + m[1] + '</div>\n');
  extracted++;
  console.log(`  extract ${file}`);
}

console.log(`\n────────────────────────────────────────`);
console.log(`Total:     ${files.length}`);
console.log(`Extracted: ${extracted}`);
console.log(`Clean:     ${alreadyClean}`);
if (failed) {
  console.log(`FAILED:    ${failed}`);
  failures.forEach(f => console.log(`           - ${f}`));
}
console.log(`All files in: lessons/`);
