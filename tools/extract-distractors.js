#!/usr/bin/env node
/**
 * extract-distractors.js
 *
 * Extracts all distractors (incorrect options) from single-select and
 * multi-select questions across all lesson HTML files.
 *
 * Uses the REAL ENGINE (RaoPreview.build()) for option discovery — the
 * same code path as verify-content-guards.js. One parser, one definition
 * of "distractor", reconciled forever.
 *
 * Scans lessons/ recursively (same discovery as verify-content-guards.js).
 * Outputs tools/distractor-data.json.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.resolve(__dirname, '..');
const ENGINE   = path.join(ROOT, 'engine', 'preview-engine.js');
const LESSONS  = path.join(ROOT, 'lessons');
const OUT_FILE = path.join(ROOT, 'tools', 'distractor-data.json');

// ═══════════════════════════════════════════════════════════════
// Load the real engine — same as verify-content-guards.js
// ═══════════════════════════════════════════════════════════════

global.window = {};
eval(fs.readFileSync(ENGINE, 'utf8'));
const RaoPreview = global.window.RaoPreview;

// ═══════════════════════════════════════════════════════════════
// Lesson file discovery — recursive, skips _preview
// (identical to verify-content-guards.js)
// ═══════════════════════════════════════════════════════════════

function collectLessons(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_preview') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(collectLessons(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════
// Source extraction + frontmatter parsing
// ═══════════════════════════════════════════════════════════════

function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  const b = html.indexOf('<div id="preview"');
  if (a < 0) return null;
  return html.slice(a, b > a ? b : undefined);
}

function parseFrontmatter(body) {
  const fm = {};
  body.split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const i = t.indexOf(':');
    if (i < 0) return;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (/^[[{]/.test(val)) {
      try { val = JSON.parse(val); } catch { /* leave as string */ }
    }
    fm[key] = val;
  });
  return fm;
}

function extractFrontmatters(html) {
  const fms = [];
  const re = /<!--@q\s*([\s\S]*?)-->/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    fms.push(parseFrontmatter(m[1]));
  }
  return fms;
}

// Extract option keys from engine-rendered markup
// (identical to verify-content-guards.js)
function extractOptionKeys(markup) {
  const keys = [];
  const re = /class="opt\b[^"]*"[^>]*data-val="([^"]*)"/g;
  let m;
  while ((m = re.exec(markup)) !== null) keys.push(m[1]);
  return keys;
}

// Strip HTML tags to get plain text
function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// Extract numbers from text
function extractNumbers(text) {
  const matches = text.match(/\b[\d,]+(?:\.\d+)?\b/g) || [];
  return matches.map(s => s.replace(/,/g, '')).filter(s => s.length > 0 && !isNaN(Number(s)));
}

// ═══════════════════════════════════════════════════════════════
// Build question list per lesson using the real engine
// ═══════════════════════════════════════════════════════════════

function processFile(filePath, relPath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const src = sourceOf(html);
  if (!src) return [];

  const fms = extractFrontmatters(src);
  let qs;
  try { qs = RaoPreview.build(src); } catch { return []; }

  const results = [];
  const used = new Set();

  for (let qi = 0; qi < qs.length; qi++) {
    const q = qs[qi];

    // Match frontmatter — same logic as verify-content-guards.js
    let fm = fms[qi] || {};
    if (fm.type !== q.behavior && fms.length > qs.length) {
      for (let fi = 0; fi < fms.length; fi++) {
        if (!used.has(fi) && fms[fi].type === q.behavior) {
          fm = fms[fi];
          used.add(fi);
          break;
        }
      }
    } else {
      used.add(qi);
    }

    if (q.behavior !== 'single-select' && q.behavior !== 'multi-select') continue;

    const optionKeys = extractOptionKeys(q.markup);
    if (optionKeys.length === 0) continue;

    const correctSet = new Set(q.answer || []);
    const distractors = optionKeys
      .filter(k => !correctSet.has(k))
      .map(k => {
        // Try to extract display text for this option from markup
        const escK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const textRe = new RegExp('data-val="' + escK + '"[^>]*>([\\s\\S]*?)</button>', 'i');
        const tm = textRe.exec(q.markup);
        const text = tm ? stripTags(tm[1]) : k;
        return { value: k, text };
      });

    // Extract prompt text from engine-rendered markup
    // Engine renders prompt as <div class="prompt"><span>...</span></div>
    // or <p class="prompt">...</p> depending on version
    const promptRe = /<(?:div|p)\s+class="prompt"[^>]*>([\s\S]*?)<\/(?:div|p)>/i;
    const pm = promptRe.exec(q.markup);
    const promptText = pm ? stripTags(pm[1]) : '';
    const promptNumbers = extractNumbers(promptText);

    results.push({
      file: relPath,
      dir: path.dirname(relPath) || 'lessons',
      qIndex: qi,
      type: q.behavior,
      prompt: promptText,
      promptNumbers,
      answer: q.answer || [],
      distractors,
      hasWhyWrong: !!(fm.whyWrong && typeof fm.whyWrong === 'object'),
      hint: q.hint || fm.hint || null,
      optionCount: optionKeys.length,
      correctCount: correctSet.size,
      distractorCount: distractors.length,
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════

const files = collectLessons(LESSONS);
let allResults = [];

for (const f of files) {
  const rel = path.relative(LESSONS, f).replace(/\\/g, '/');
  try {
    const r = processFile(f, rel);
    allResults = allResults.concat(r);
  } catch (e) {
    console.error(`ERROR processing ${rel}: ${e.message}`);
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(allResults, null, 2), 'utf8');

// Summary
const totalQuestions = allResults.length;
const totalDistractors = allResults.reduce((s, q) => s + q.distractorCount, 0);
const withWhyWrong = allResults.filter(q => q.hasWhyWrong).length;
const byType = {};
for (const q of allResults) {
  byType[q.type] = (byType[q.type] || 0) + 1;
}

console.log('\n=== Distractor Extraction Summary ===');
console.log(`Files scanned:         ${files.length}`);
console.log(`Select questions:      ${totalQuestions}`);
console.log(`  single-select:       ${byType['single-select'] || 0}`);
console.log(`  multi-select:        ${byType['multi-select'] || 0}`);
console.log(`Total distractors:     ${totalDistractors}`);
console.log(`With whyWrong:         ${withWhyWrong}`);
console.log(`Without whyWrong:      ${totalQuestions - withWhyWrong}`);
console.log(`\nOutput: ${OUT_FILE}`);
