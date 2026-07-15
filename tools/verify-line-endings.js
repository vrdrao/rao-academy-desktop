#!/usr/bin/env node
/**
 * verify-line-endings.js
 *
 * Guard: no lesson file may contain \r\n (CRLF) line endings.
 *
 * Why this exists: a CRLF file silently breaks any parser that splits on
 * "\n" — the trailing \r prevents regex anchors ($) from matching, keys
 * fail to parse, and entire files are silently dropped. This has happened
 * three times. This guard makes it impossible a fourth time.
 *
 * Wired into npm test.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const LESSONS = path.join(__dirname, "..", "lessons");

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "_preview") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(full));
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const files = walk(LESSONS);
const failures = [];

for (const f of files) {
  const buf = fs.readFileSync(f);
  if (buf.includes(0x0d)) {
    failures.push(path.relative(LESSONS, f).replace(/\\/g, "/"));
  }
}

console.log(`Line-ending guard: checked ${files.length} lesson files.`);

if (failures.length > 0) {
  console.log(`\x1b[31mFAIL\x1b[0m — ${failures.length} file(s) contain CRLF (\\r\\n) line endings:\n`);
  for (const f of failures) {
    console.log(`  ${f}`);
  }
  console.log(`\nFix: run  node -e "const fs=require('fs'); const f='lessons/${failures[0]}'; fs.writeFileSync(f, fs.readFileSync(f,'utf8').replace(/\\r\\n/g,'\\n'))"`);
  process.exit(1);
} else {
  console.log(`\x1b[32mPASS\x1b[0m — all ${files.length} files use LF line endings.`);
  process.exit(0);
}
