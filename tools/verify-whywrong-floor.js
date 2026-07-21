#!/usr/bin/env node
/* ── verify-whywrong-floor.js — a RATCHETING floor on whyWrong coverage ──
 *
 * Item 55. §13.4 makes whyWrong mandatory for every distractor, but npm test
 * only ever ran `verify-content-guards.js --hint-leak-only`, so coverage was
 * never enforced — which is how 84 of 103 lessons reached 0% unnoticed.
 *
 * Gating at 100% would turn the suite red for weeks; a permanently-red suite is
 * ignored, then bypassed — worse than no guard. So this guard does NOT demand
 * good coverage. It demands coverage never gets WORSE:
 *
 *   • It measures, per lesson, how many questions carry >=1 whyWrong entry.
 *   • It compares each lesson against a committed floor in
 *     docs/whywrong-floor.json.
 *   • It FAILS if any lesson drops BELOW its recorded floor.
 *   • It PASSES if a lesson rises above its floor — and prints those, so a human
 *     can raise the floor deliberately, in a brief.
 *
 * The floor is a COUNT of covered questions, not a ratio: adding new questions
 * without whyWrong must not fail the build (the ratchet is about not LOSING
 * coverage, not about denominators). Removing a whyWrong drops the count → fail.
 *
 * ── The floor is NEVER auto-raised. ──
 * Normal runs are READ-ONLY. Only `--generate` writes the file, and that is a
 * deliberate human act performed once, in a brief. A guard that rewrites its own
 * expectations checks nothing (same law as docs/question-ids.json).
 *
 * Usage:
 *   node tools/verify-whywrong-floor.js              # check (read-only)
 *   node tools/verify-whywrong-floor.js --generate   # (re)write the floor — human act only
 *
 * Exit 0 = every lesson meets or exceeds its floor.
 * Exit 1 = at least one lesson dropped below its floor (or the floor is missing).
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT    = path.resolve(__dirname, "..");
const ENGINE  = path.join(ROOT, "engine", "preview-engine.js");
const LESSONS = path.join(ROOT, "lessons");
const FLOOR   = path.join(ROOT, "docs", "whywrong-floor.json");

const C = { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", b: "\x1b[1m", d: "\x1b[2m", x: "\x1b[0m" };

// Load the real engine — the same build() the harness and content guards use.
global.window = {};
eval(fs.readFileSync(ENGINE, "utf8"));
const RaoPreview = global.window.RaoPreview;

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

// Measure per-lesson whyWrong coverage using the engine's own build() output —
// whyWrong is read from the engine, exactly as verify-content-guards.js does
// (a flat line parser cannot see the nested whyWrong map).
function measure() {
  const files = collectLessons(LESSONS);
  const per = {}; // rel -> { covered, total }
  for (const f of files) {
    const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
    const html = fs.readFileSync(f, "utf8");
    const src = sourceOf(html);
    if (!src) continue;
    let qs;
    try { qs = RaoPreview.build(src); } catch { continue; }
    let covered = 0;
    for (const q of qs) {
      const ww = q.whyWrong;
      if (ww && typeof ww === "object" && Object.keys(ww).length > 0) covered++;
    }
    per[rel] = { covered, total: qs.length };
  }
  return per;
}

const generate = process.argv.includes("--generate");
const measured = measure();

const totalCovered = Object.values(measured).reduce((s, m) => s + m.covered, 0);
const totalQ       = Object.values(measured).reduce((s, m) => s + m.total, 0);

if (generate) {
  // The ONLY write path. Deliberate human act, run once in a brief.
  const sorted = {};
  for (const k of Object.keys(measured).sort()) sorted[k] = measured[k];
  fs.writeFileSync(FLOOR, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\n── whyWrong floor GENERATED ──\n`);
  console.log(`  Wrote ${FLOOR}`);
  console.log(`  ${Object.keys(sorted).length} lessons · overall coverage ` +
    `${totalCovered}/${totalQ} (${(totalCovered / totalQ * 100).toFixed(1)}%)`);
  console.log(`\n  ${C.y}This is a human act. Normal runs never write this file.${C.x}\n`);
  process.exit(0);
}

console.log("\n── whyWrong Floor (ratcheting) ──\n");

if (!fs.existsSync(FLOOR)) {
  console.log(`  ${C.r}FAIL${C.x} — no floor file at ${FLOOR}. Generate it once with --generate.\n`);
  process.exit(1);
}

const floor = JSON.parse(fs.readFileSync(FLOOR, "utf8"));

const dropped = [];   // below floor — FAIL
const rose    = [];   // above floor — advisory, raise deliberately
const newLessons = []; // present in repo, absent from floor — advisory

for (const [rel, m] of Object.entries(measured)) {
  if (!(rel in floor)) { newLessons.push(rel); continue; }
  const fl = floor[rel].covered;
  if (m.covered < fl) dropped.push({ rel, saw: m.covered, floor: fl, total: m.total });
  else if (m.covered > fl) rose.push({ rel, saw: m.covered, floor: fl, total: m.total });
}

// Lessons in the floor but no longer in the repo (archived) — advisory, not fatal.
const goneLessons = Object.keys(floor).filter((rel) => !(rel in measured));

console.log(`  Lessons measured: ${Object.keys(measured).length} · floor entries: ${Object.keys(floor).length}`);
console.log(`  Overall whyWrong coverage: ${totalCovered}/${totalQ} (${(totalCovered / totalQ * 100).toFixed(1)}%)`);

if (rose.length) {
  console.log(`\n  ${C.y}ROSE above floor${C.x} — ${rose.length} lesson(s). Raise the floor deliberately (a brief), not automatically:`);
  for (const r of rose) console.log(`    ${r.rel}: ${r.saw}/${r.total} (floor ${r.floor})`);
}
if (newLessons.length) {
  console.log(`\n  ${C.y}NOT IN FLOOR${C.x} — ${newLessons.length} lesson(s) present in repo but absent from the floor. Add them in a brief:`);
  for (const n of newLessons) console.log(`    ${n}: ${measured[n].covered}/${measured[n].total}`);
}
if (goneLessons.length) {
  console.log(`\n  ${C.d}IN FLOOR, NOT IN REPO${C.x} — ${goneLessons.length} lesson(s) (archived?). Advisory:`);
  for (const gn of goneLessons) console.log(`    ${gn} (floor ${floor[gn].covered})`);
}

if (dropped.length) {
  console.log(`\n  ${C.r}FAIL${C.x} — ${dropped.length} lesson(s) dropped BELOW their whyWrong floor:`);
  for (const d of dropped) {
    console.log(`    ${d.rel}: floor ${d.floor}, saw ${d.saw} (of ${d.total} questions) — ` +
      `${d.floor - d.saw} whyWrong-covered question(s) lost`);
  }
  console.log(`\n  A floor drop means coverage got WORSE. Restore the whyWrong, or — if the drop is`);
  console.log(`  intentional — lower the floor deliberately in a brief with --generate.\n`);
  process.exit(1);
}

console.log(`\n  ${C.g}PASS${C.x} — no lesson is below its whyWrong floor.\n`);
process.exit(0);
