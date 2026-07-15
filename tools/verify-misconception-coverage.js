#!/usr/bin/env node
/**
 * verify-misconception-coverage.js
 *
 * Guard: every distractor of every select question maps to at least one
 * misconception code from docs/MISCONCEPTIONS.md.
 *
 * ──────────────────────────────────────────────────────────────────────
 * NOT wired into npm test.
 *
 * As of 2026-07-15, 145 of 4,014 distractors (3.6%) remain unexplained
 * and 258 are unclassified text. This guard goes into npm test when
 * coverage hits 100%. Wiring it in now would break the pipeline on
 * known gaps and produce a red bar that everyone ignores — which is
 * worse than no guard at all.
 * ──────────────────────────────────────────────────────────────────────
 *
 * Usage:
 *   node tools/verify-misconception-coverage.js          # check all
 *   node tools/verify-misconception-coverage.js --strict  # fail on ANY uncovered
 *
 * Exit 0 = pass, exit 1 = fail.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// Re-use the classification engine
const CLASS_PATH = path.join(__dirname, 'distractor-classification.json');

// If classification hasn't been run yet, tell the user
if (!fs.existsSync(CLASS_PATH)) {
  console.error('FAIL: distractor-classification.json not found.');
  console.error('Run "node tools/classify-distractors.js" first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(CLASS_PATH, 'utf8'));
const strict = process.argv.includes('--strict');

// Codes that are NOT real misconceptions (meta / catch-all)
const META_CODES = new Set([
  'UNCLASSIFIED_TEXT',
  'VISUAL_ONLY',
  'VISUAL_DEPENDENT',
]);

let total = 0;
let covered = 0;    // has at least one non-meta code
let metaOnly = 0;   // has only meta codes
let uncovered = 0;  // has zero codes

const failures = [];

results.forEach(entry => {
  total++;
  const realCodes = entry.codes.filter(c => !META_CODES.has(c));

  if (realCodes.length > 0) {
    covered++;
  } else if (entry.codes.length > 0) {
    metaOnly++;
    if (strict) {
      failures.push(entry);
    }
  } else {
    uncovered++;
    failures.push(entry);
  }
});

const pctCovered = (100 * covered / total).toFixed(1);
const pctMeta    = (100 * metaOnly / total).toFixed(1);
const pctUncov   = (100 * uncovered / total).toFixed(1);

console.log(`Misconception coverage guard${strict ? ' (STRICT)' : ''}`);
console.log(`─────────────────────────────────────`);
console.log(`Total distractors:   ${total}`);
console.log(`Covered (real code): ${covered}  (${pctCovered}%)`);
console.log(`Meta-only:           ${metaOnly}  (${pctMeta}%)`);
console.log(`Uncovered:           ${uncovered}  (${pctUncov}%)`);
console.log();

if (failures.length > 0) {
  console.log(`FAIL: ${failures.length} distractor(s) without a misconception code.\n`);
  failures.slice(0, 20).forEach(f => {
    console.log(`  ${f.file.replace('incoming/','')}  Q${f.qIndex}`);
    console.log(`    answer: ${f.answer[0]}  distractor: ${f.distractor}`);
    console.log(`    codes: [${f.codes.join(', ')}]`);
  });
  if (failures.length > 20) {
    console.log(`  ... and ${failures.length - 20} more.`);
  }
  process.exit(1);
} else {
  console.log('PASS: every distractor has at least one misconception code.');
  process.exit(0);
}
