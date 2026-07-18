/* ============================================================================
   verify-grading-node.js — the FAST grading gate (no browser).

   The full harness (harness.js) proves grading in a real Chromium with real
   clicks — but takes ~12 min across 104 lessons, which is a PUSH-time cost,
   not a commit-time cost (BRIEF-PRECOMMIT-SPEED, 2026-07-18). This tool is
   the commit-time subset: it loads the engine in plain Node and, for EVERY
   question in the corpus:

     1. BUILDS the lesson through the real RaoPreview.build() and fails on any
        error-level authoring issue (ANSWER_NOT_IN_OPTIONS, ORDER_ANSWER_NOT_
        PERMUTATION, FRONTMATTER_MALFORMED, ...). A sabotaged answer key that
        no longer matches its options dies HERE.
     2. Fails any gradeable question whose answer key is EMPTY — check([],[])
        is vacuously true, which is exactly how 14 empty-key questions once
        shipped "green". construct is exempt: it self-grades geometry and its
        empty key is correct by design.
     3. GRADE-CORRECT: RaoPreview.check(behavior, key, key) must be true.
     4. REJECT-WRONG:  the key with its first element mutated (sentinel
        appended — survives every normalizer: time strips dots, expression
        strips spaces/case, multi-select sorts) must grade FALSE.

   What this deliberately does NOT do: click options, drag tiles, render
   figures, or test themes — that is the browser harness's job and it still
   runs, at PUSH time. This is a pure grader/authoring gate, built to run in
   seconds so committing is cheap again.

   Run:  node tools/verify-grading-node.js
   Exit 0 = grading clean. Non-zero = do not commit.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENGINE = path.join(ROOT, "engine", "preview-engine.js");
const LESSONS = path.join(ROOT, "lessons");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", d: "\x1b[2m", x: "\x1b[0m" };

/* Load the engine exactly the way CLAUDE.md documents for Node. */
global.window = {};
eval(fs.readFileSync(ENGINE, "utf8"));
const Rao = global.window.RaoPreview || global.RaoPreview;
if (!Rao || typeof Rao.build !== "function" || typeof Rao.check !== "function") {
  console.error(`${C.r}${C.b}cannot load RaoPreview from engine/preview-engine.js${C.x}`);
  process.exit(2);
}

/* Same #source scoping as harness.js. */
function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  const b = html.indexOf('<div id="preview"');
  if (a < 0) throw new Error('no <div id="source"> block found');
  return html.slice(a, b > a ? b : undefined);
}

/* Same corpus discovery as harness.js — and the SAME minimum-corpus guard.
   The harness once silently tested 4 files while 105 sat in lessons/incoming/.
   The fast path keeps that guard: if discovery breaks, commits stop. */
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

const files = fs.existsSync(LESSONS) ? collectLessons(LESSONS) : [];
const MIN_LESSONS = 100;
if (files.length < MIN_LESSONS) {
  console.error(`${C.r}${C.b}CORPUS TOO SMALL: found ${files.length} lessons, expected >= ${MIN_LESSONS}${C.x}`);
  console.error(`${C.r}The harness once silently skipped 96% of the bank. This guard exists to prevent that.${C.x}`);
  process.exit(2);
}

/* A wrong answer that stays wrong through every normalizer in check():
   append a sentinel to the first element. time's normalizer bails on the
   pattern mismatch, expression's lowercase/space-strip keeps the sentinel,
   multi-select's sort still sees a different member. */
function mutate(key) {
  const w = key.map(String);
  w[0] = w[0] + "§X";
  return w;
}

let lessons = 0, questions = 0, graded = 0, rejected = 0, constructs = 0;
const fails = [];

for (const file of files) {
  const name = path.basename(file);
  let qs;
  try {
    qs = Rao.build(sourceOf(fs.readFileSync(file, "utf8")));
  } catch (e) {
    fails.push(`${name}: build() THREW — ${e.message}`);
    continue;
  }
  lessons++;
  qs.forEach((q, i) => {
    questions++;
    const qid = `${name} q${i + 1} [${q.behavior}]`;
    for (const issue of q.issues || []) {
      const level = issue.level || "error";
      const msg = issue.message || issue.code || String(issue);
      if (level === "error") fails.push(`${qid}: BUILD ISSUE ${issue.code || ""} — ${msg}`);
    }
    if (q.behavior === "construct") { constructs++; return; } // self-grades; empty key correct
    const key = (q.answer || []).map(String);
    if (!key.length) {
      fails.push(`${qid}: EMPTY ANSWER KEY — check([],[]) is vacuously true; this is the 14-empty-keys bug`);
      return;
    }
    if (Rao.check(q.behavior, key, key) !== true)
      fails.push(`${qid}: GRADE-CORRECT failed — the authored key does not grade as correct`);
    else graded++;
    if (Rao.check(q.behavior, mutate(key), key) !== false)
      fails.push(`${qid}: REJECT-WRONG failed — a mutated answer was NOT rejected`);
    else rejected++;
  });
}

console.log(`\n${C.b}NODE GRADING GATE${C.x}  ${C.d}engine ${Rao.__version} · ${lessons} lessons · ${questions} questions${C.x}`);
console.log(`${graded} grade correct · ${rejected} reject wrong · ${constructs} construct (self-grading, skipped)`);

if (fails.length) {
  console.error(`\n${C.r}${C.b}${fails.length} GRADING FAILURE(S):${C.x}`);
  fails.forEach((f) => console.error(`${C.r}  FAIL  ${f}${C.x}`));
  process.exit(1);
}
console.log(`${C.g}${C.b}NODE GRADING: all keys grade correct and reject wrong — OK to commit${C.x}\n`);
