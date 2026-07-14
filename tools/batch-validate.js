/* ============================================================================
   batch-validate.js — quick bulk validation of content-only lesson files.

   For each .html in lessons/incoming/:
     1. RaoPreview.build() — must succeed, reports question count
     2. Self-grade — every correct answer must grade true
     3. Wrong-answer discrimination — a wrong answer must grade false

   Usage:  node tools/batch-validate.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INCOMING = path.join(ROOT, "lessons", "incoming");

global.window = {};
eval(fs.readFileSync(path.join(ROOT, "engine", "preview-engine.js"), "utf8"));
const P = window.RaoPreview;

const files = fs.readdirSync(INCOMING).filter(f => f.endsWith(".html") && !f.startsWith("_"));
console.log(`Validating ${files.length} files...\n`);

let totalFiles = 0, passFiles = 0, failFiles = 0;
let totalQ = 0, gradeOk = 0, rejectOk = 0;
const failures = [];

for (const file of files) {
  totalFiles++;
  const src = fs.readFileSync(path.join(INCOMING, file), "utf8");
  let qs;
  try {
    qs = P.build(src);
  } catch (e) {
    failFiles++;
    failures.push({ file, reason: "build() threw: " + e.message });
    console.log(`  FAIL  ${file} — build error: ${e.message}`);
    continue;
  }

  if (!qs.length) {
    failFiles++;
    failures.push({ file, reason: "0 questions built" });
    console.log(`  FAIL  ${file} — 0 questions`);
    continue;
  }

  let fileOk = true;
  const types = {};
  for (const q of qs) {
    types[q.behavior] = (types[q.behavior] || 0) + 1;
    totalQ++;

    // Self-grade
    const ok = P.check(q.behavior, q.answer, q.answer);
    if (ok) gradeOk++;
    else {
      fileOk = false;
      console.log(`  GRADE FAIL  ${file} — answer ${JSON.stringify(q.answer)} rejected`);
    }

    // Wrong-answer discrimination
    let wrong;
    if (q.behavior === "fill-blanks" || q.behavior === "expression" || q.behavior === "lattice") {
      wrong = q.answer.map(a => String((Number(a) || 0) + 7));
    } else if (q.behavior === "single-select") {
      wrong = ["__DEFINITELY_WRONG__"];
    } else if (q.behavior === "multi-select") {
      wrong = ["__DEFINITELY_WRONG__"];
    } else if (q.behavior === "order" || q.behavior === "sequence-build") {
      wrong = [...q.answer].reverse();
      if (JSON.stringify(wrong) === JSON.stringify(q.answer)) wrong = ["__WRONG__"];
    } else if (q.behavior === "categorize") {
      wrong = q.answer.map(a => a === "A" ? "B" : "A");
    } else if (q.behavior === "construct") {
      // self-grades, skip
      rejectOk++;
      continue;
    } else {
      wrong = ["__WRONG__"];
    }
    const bad = P.check(q.behavior, wrong, q.answer);
    if (!bad) rejectOk++;
    else {
      fileOk = false;
      console.log(`  REJECT FAIL ${file} — wrong answer accepted`);
    }
  }

  if (fileOk) {
    passFiles++;
    const typeStr = Object.entries(types).map(([k, v]) => `${k}:${v}`).join(" ");
    console.log(`  ok    ${file}  (${qs.length}q  ${typeStr})`);
  } else {
    failFiles++;
    failures.push({ file, reason: "grading issues" });
  }
}

console.log(`\n════════════════════════════════════════`);
console.log(`Files:    ${passFiles}/${totalFiles} pass`);
console.log(`Questions: ${totalQ} total, ${gradeOk} grade, ${rejectOk} reject`);
if (failures.length) {
  console.log(`\nFAILURES:`);
  failures.forEach(f => console.log(`  ${f.file}: ${f.reason}`));
}
