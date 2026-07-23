#!/usr/bin/env node
/* ── verify-mcq-92.js — structural guard for the interpret-remainders MCQ conversion ──
 *
 * BRIEF-MCQ-CONVERT-92, Phase 3. All 29 fill-blanks questions in the
 * interpret-remainders lesson were converted to single-select. This guard pins the
 * invariants that conversion must hold, so a later edit cannot silently regress them.
 *
 * Asserts, for the lesson:
 *   1. Exactly 29 questions, ALL type single-select, ZERO fill-blanks.
 *   2. Every question has exactly 4 options — EXCEPT qix6jkchx, the one question
 *      whose numbers (19 ÷ 5) admit only 2 honest distractors, which has exactly 3.
 *      (Named exception, ruled by Venkat 2026-07-22 — NOT a blanket ">=3" loosening.)
 *   3. Every question's correct answer equals the remainder of its division
 *      (a mod b, where a = max prompt number, b = min prompt number).
 *   4. No question has duplicate option values.
 *   5. No question's correct answer collides with a distractor, and the answer is
 *      present exactly once among the options.
 *
 * Read-only. Exit 0 = all invariants hold. Exit 1 = at least one violation.
 *
 * Usage:  node tools/verify-mcq-92.js [path-to-lesson.html]
 *         (defaults to lessons/incoming/interpret-remainders.html)
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LESSON = process.argv[2] || path.join(ROOT, "lessons", "incoming", "interpret-remainders.html");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", x: "\x1b[0m" };

const EXPECTED_COUNT = 29;
const THREE_OPTION_EXCEPTION = "qix6jkchx"; // 19 ÷ 5 — only 2 honest distractors exist

function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  if (a < 0) return null;
  const b = html.indexOf('<div id="preview"');
  return html.slice(a, b > a ? b : undefined);
}

// Pair each <!--@q --> frontmatter with the <div class="question"> body after it.
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

function answerValues(fm) {
  // answer: ["3"]  ->  ["3"]
  const raw = field(fm, "answer");
  if (!raw) return null;
  return [...raw.matchAll(/"([^"]*)"/g)].map((x) => x[1]);
}

function optionsOf(body) {
  const um = body.match(/<ul class="options">([\s\S]*?)<\/ul>/i);
  if (!um) return null;
  return [...um[1].matchAll(/<li[^>]*\bdata-val="([^"]*)"[^>]*>/gi)].map((x) => x[1]);
}

function promptOf(body) {
  const m = body.match(/<p class="prompt">([\s\S]*?)<\/p>/i);
  return m ? m[1] : "";
}

function operands(prompt) {
  const nums = [...prompt.matchAll(/\d[\d,]*/g)].map((x) => parseInt(x[0].replace(/,/g, ""), 10));
  if (nums.length < 2) return null;
  return { a: Math.max(...nums), b: Math.min(...nums) };
}

const fails = [];
function bad(id, msg) { fails.push(`${id}: ${msg}`); }

const html = fs.readFileSync(LESSON, "utf8");
const src = sourceOf(html);
if (!src) {
  console.error(`${C.r}${C.b}✗ no <div id="source"> block in ${LESSON}${C.x}`);
  process.exit(1);
}

const blks = blocks(src);

// 1a. count
if (blks.length !== EXPECTED_COUNT) {
  bad("(lesson)", `expected ${EXPECTED_COUNT} questions, found ${blks.length}`);
}

let sawException = false;
for (const blk of blks) {
  const id = field(blk.fm, "id") || "(no-id)";
  const type = field(blk.fm, "type");

  // 1b. type
  if (type === "fill-blanks") bad(id, `still type fill-blanks — must be single-select`);
  else if (type !== "single-select") bad(id, `type is "${type}" — must be single-select`);

  const opts = optionsOf(blk.body);
  const ans = answerValues(blk.fm);

  if (!opts) { bad(id, `no <ul class="options"> found`); continue; }
  if (!ans || ans.length !== 1) { bad(id, `answer must be exactly one value, got ${JSON.stringify(ans)}`); continue; }
  const answer = ans[0];

  // 2. option count (with the named 3-option exception)
  if (id === THREE_OPTION_EXCEPTION) {
    sawException = true;
    if (opts.length !== 3) bad(id, `named 3-option exception must have exactly 3 options, has ${opts.length}`);
  } else {
    if (opts.length !== 4) bad(id, `must have exactly 4 options, has ${opts.length}`);
  }

  // 4. no duplicate options
  const dupes = opts.filter((v, i) => opts.indexOf(v) !== i);
  if (dupes.length) bad(id, `duplicate option value(s): ${[...new Set(dupes)].join(", ")}`);

  // 5. answer present exactly once, and not colliding with a distractor
  const occurrences = opts.filter((v) => v === answer).length;
  if (occurrences === 0) bad(id, `answer "${answer}" is not among options [${opts.join(", ")}]`);
  else if (occurrences > 1) bad(id, `answer "${answer}" collides with a distractor (appears ${occurrences}× in options)`);

  // 3. correct answer equals the remainder of the division
  const prompt = promptOf(blk.body);
  const op = operands(prompt);
  if (!op) { bad(id, `could not extract two operands from prompt`); continue; }
  const rem = op.a % op.b;
  if (parseInt(answer, 10) !== rem) {
    bad(id, `answer "${answer}" != remainder(${op.a} mod ${op.b}) = ${rem}`);
  }
}

if (!sawException && blks.length === EXPECTED_COUNT) {
  bad("(lesson)", `named 3-option exception "${THREE_OPTION_EXCEPTION}" not found — id missing or renamed`);
}

if (fails.length) {
  console.error(`${C.r}${C.b}✗ verify-mcq-92: ${fails.length} violation(s) in ${path.relative(ROOT, LESSON)}${C.x}`);
  for (const f of fails) console.error(`${C.r}  • ${f}${C.x}`);
  process.exit(1);
}

console.log(`${C.g}${C.b}✓ verify-mcq-92${C.x} — ${blks.length} questions, all single-select; 4 options each (qix6jkchx: 3); every answer = remainder; no duplicate/colliding options.`);
process.exit(0);
