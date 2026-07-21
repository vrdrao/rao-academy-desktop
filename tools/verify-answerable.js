#!/usr/bin/env node
/* ── verify-answerable.js — a CATEGORIZE question must present a data source ──
 *
 * Item 45, first half (spec: docs/audits/SOURCE-READ.md Task D, Assertion 2).
 *
 * A categorize question asks the child to SORT tiles. If the criterion lives
 * only in `explain:` (shown AFTER answering) and nothing readable sits in the
 * body, the child is sorting blind. That is exactly what `qe4c5gevv` and
 * `qszpxymg7` did — "sort animals by how many the zoo has" with no chart.
 *
 * TWO layers, deliberately different in strength:
 *
 *   HARD (gates the build) — the two known Item-44 questions MUST each render a
 *     data source in the body (<svg>/<figure>/<table>/<img>). This is a
 *     regression guard: once fixed, they must never silently lose the chart.
 *
 *   SOFT (flags for review, never fails) — every OTHER categorize question with
 *     no data source AND opaque (non-numeric) tiles is printed for a human to
 *     eyeball. Per SOURCE-READ, this heuristic is over-strict one way and
 *     over-loose the other: it cannot tell "Lion/Zebra" (opaque, needs a chart)
 *     from "even+even" or "eight hundred" (self-describing / world-knowledge,
 *     answerable from the tile itself). So the 14 near-misses SOURCE-READ
 *     inspected and cleared are excluded by id, and the rest are advisory only.
 *     Hard-failing on this heuristic would be worse than no guard.
 *
 * Assertion 1 (select answer selectable) and the fill-blanks/order/etc. cases
 * are the REST of Item 45 and are deliberately NOT built here.
 *
 * Usage:  node tools/verify-answerable.js
 * Exit 0 = both known questions present a data source (review flags may print).
 * Exit 1 = a known Item-44 question renders no data source.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT    = path.resolve(__dirname, "..");
const LESSONS = path.join(ROOT, "lessons");
const C = { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", b: "\x1b[1m", d: "\x1b[2m", x: "\x1b[0m" };

// A body "presents a data source" if it carries any of these.
const DATA_SOURCE = /<svg|<figure|<table|<img/i;

// The two questions Item 44 is about — these HARD-gate.
const KNOWN_ITEM_44 = ["qe4c5gevv", "qszpxymg7"];

// The 14 categorize questions SOURCE-READ (docs/audits/SOURCE-READ.md, C.1)
// inspected and cleared as answerable from their own tiles (self-describing
// values or world-knowledge sorts: am/pm, area/perimeter, certain/impossible,
// unit families, number-names, parity rules). They carry no <svg>/<table> and
// need none — excluded from the soft review list so it stays signal, not noise.
const CLEARED_NEAR_MISSES = new Set([
  "qeevadz8f", "qewvxafpa", "q4girap2u", "qa84zxg64", "qs3bymxbn",
  "q77ih8bq3", "qcfkh8rvy", "qdba6mj6g", "qk77nuxaf", "qdehbcxnr",
  "qb5xpe5v3", "q35yygrd3", "qjipgcdti", "qckh4q65q",
]);

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

// Pair each <!--@q --> block with the <div class="question"> body that follows
// it, sliced to the first </div>. Categorize bodies have no nested <div>, so the
// first close is the question's own. Robust across the whole corpus (152/152).
function blocks(src) {
  const out = [];
  const qre = /<!--@q\s*([\s\S]*?)-->/g;
  let m;
  const heads = [];
  while ((m = qre.exec(src)) !== null) heads.push({ fm: m[1], end: qre.lastIndex });
  for (const h of heads) {
    const start = src.indexOf('<div class="question"', h.end);
    if (start < 0) { out.push({ fm: h.fm, body: "" }); continue; }
    const close = src.indexOf("</div>", start);
    out.push({ fm: h.fm, body: src.slice(start, close < 0 ? undefined : close + 6) });
  }
  return out;
}

function field(fm, name) {
  const m = fm.match(new RegExp(`^\\s*${name}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : null;
}

function tilesOf(body) {
  const um = body.match(/<ul class="tiles">([\s\S]*?)<\/ul>/i);
  if (!um) return [];
  return [...um[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((x) => x[1].replace(/<[^>]+>/g, "").trim());
}

console.log("\n── Answerable (categorize data source) ──\n");

const files = collectLessons(LESSONS);
let totalCat = 0;
const known = {};              // id -> { file, hasData }
const reviewFlags = [];        // soft: opaque-tile categorize with no data source

for (const f of files) {
  const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
  const src = sourceOf(fs.readFileSync(f, "utf8"));
  if (!src) continue;
  for (const blk of blocks(src)) {
    if (field(blk.fm, "type") !== "categorize") continue;
    totalCat++;
    const id = field(blk.fm, "id") || "?";
    const hasData = DATA_SOURCE.test(blk.body);

    if (KNOWN_ITEM_44.includes(id)) known[id] = { file: rel, hasData };

    if (!hasData) {
      const tiles = tilesOf(blk.body);
      const allNumeric = tiles.length > 0 && tiles.every((t) => /\d/.test(t));
      if (!allNumeric && !CLEARED_NEAR_MISSES.has(id)) {
        reviewFlags.push({ id, file: rel, tiles });
      }
    }
  }
}

console.log(`  Categorize questions scanned: ${totalCat}`);

// ── HARD: the two known Item-44 questions must present a data source ──
let hardFail = 0;
console.log(`\n  ${C.b}HARD${C.x} — Item-44 questions must render a data source:`);
for (const id of KNOWN_ITEM_44) {
  const k = known[id];
  if (!k) {
    hardFail++;
    console.log(`    ${C.r}FAIL${C.x} — ${id}: not found in any lesson (id must be permanent)`);
  } else if (!k.hasData) {
    hardFail++;
    console.log(`    ${C.r}FAIL${C.x} — ${id} (${k.file}): body has NO <svg>/<figure>/<table>/<img>; ` +
      `the child is asked to sort with no readable data`);
  } else {
    console.log(`    ${C.g}PASS${C.x} — ${id} (${k.file}): body renders a data source`);
  }
}

// ── SOFT: advisory review list, never affects exit code ──
console.log(`\n  ${C.b}REVIEW${C.x} (advisory, non-fatal) — opaque-tile categorize with no data source:`);
if (reviewFlags.length === 0) {
  console.log(`    ${C.g}none${C.x} — every remaining categorize either presents data or has self-describing tiles`);
} else {
  console.log(`    ${C.y}${reviewFlags.length} flagged${C.x} — a human should confirm each is answerable from its tiles:`);
  for (const r of reviewFlags) {
    console.log(`      ${r.id}  ${r.file}  tiles=[${r.tiles.join(", ")}]`);
  }
}

console.log(`\n  ${hardFail === 0 ? C.g + "PASS" : C.r + hardFail + " FAIL"}${C.x} — hard gate\n`);
process.exit(hardFail > 0 ? 1 : 0);
