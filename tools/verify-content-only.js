#!/usr/bin/env node
/**
 * Guard: every lesson file must be CONTENT-ONLY.
 *
 * Lessons carry zero CSS and zero JS — just the <div id="source"> block.
 * The app owns styling and the renderer; the engine owns behaviour.
 * See CLAUDE.md §5.
 *
 * A lesson with <script>, <style>, <link>, or Google Fonts is a legacy
 * full-page file that was missed by the extraction sweep.
 *
 * Runs as part of npm test — red = do not ship.
 */
"use strict";

const fs   = require("fs");
const path = require("path");

const LESSONS = path.resolve(__dirname, "..", "lessons");

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

const files = collectLessons(LESSONS);
const failures = [];

const CHECKS = [
  { re: /<script\b/i,              label: "<script>" },
  { re: /<style\b/i,               label: "<style>" },
  { re: /<link\b[^>]*stylesheet/i, label: "<link stylesheet>" },
  { re: /fonts\.googleapis/i,      label: "Google Fonts" },
];

for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
  const hits = [];
  for (const { re, label } of CHECKS) {
    if (re.test(html)) hits.push(label);
  }
  if (hits.length > 0) {
    failures.push(`${rel}  [${hits.join(", ")}]`);
  }
}

if (failures.length > 0) {
  console.error("\x1b[31m\u2717 LEGACY LESSON FILES — lessons must be content-only (no CSS, no JS, no fonts):\x1b[0m");
  for (const f of failures) console.error("    " + f);
  console.error(`\n  ${failures.length} file(s). Strip them with tools/batch-extract.js or manually extract #source.`);
  process.exit(1);
} else {
  console.log("\x1b[32m\u2713\x1b[0m all lessons are content-only (no embedded CSS/JS/fonts)");
}
