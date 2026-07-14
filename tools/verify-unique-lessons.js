#!/usr/bin/env node
/**
 * Guard: no two lesson files may share a basename, and no lesson filename
 * may match the Windows-copy pattern "foo (N).html".
 *
 * A corpus with two files claiming to be the same lesson is a corpus where
 * nobody knows which one ships. The harness tests both, the importer picks
 * one, and they silently diverge.
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

// 1. Duplicate basenames
const byName = {};
for (const f of files) {
  const bn = path.basename(f).toLowerCase(); // case-insensitive on Windows
  if (!byName[bn]) byName[bn] = [];
  byName[bn].push(path.relative(LESSONS, f).replace(/\\/g, "/"));
}
for (const [bn, paths] of Object.entries(byName)) {
  if (paths.length > 1) {
    failures.push(`DUPLICATE BASENAME "${path.basename(paths[0])}":\n` +
      paths.map(p => `      lessons/${p}`).join("\n"));
  }
}

// 2. Windows copy pattern: "foo (N).html"
const COPY_RE = / \(\d+\)\.html$/;
for (const f of files) {
  const bn = path.basename(f);
  if (COPY_RE.test(bn)) {
    const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
    failures.push(`WINDOWS COPY "lessons/${rel}" — rename or delete it`);
  }
}

if (failures.length > 0) {
  console.error("\x1b[31m✗ DUPLICATE / COPY LESSONS — each lesson must have a unique basename:\x1b[0m");
  for (const f of failures) console.error("    " + f);
  console.error(`\n  ${failures.length} problem(s). A corpus with duplicates is a corpus where nobody knows which one ships.`);
  process.exit(1);
} else {
  console.log("\x1b[32m✓\x1b[0m all lesson basenames are unique, no Windows copies");
}
