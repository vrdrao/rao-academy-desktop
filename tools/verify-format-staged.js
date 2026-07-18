/* ============================================================================
   verify-format-staged.js — the COMMIT-TIME slice of the format contract.

   The full verify-format.js sweep renders all ~104 lesson/review pairs through
   real Chromium and takes ~13-14 MINUTES — measured 819s on 2026-07-18. That is
   a push-time cost (the pre-push hook runs the full `npm test`, which includes
   the full sweep). This wrapper keeps the format contract in the COMMIT path at
   commit-sized cost: it format-checks exactly the lessons this commit touches.

     staged lessons/<x>.html or review/<x>.html  ->  verify-format.js <x> ...

   Deferral rules — ALWAYS printed, never silent (CLAUDE.md: no silent caps):
     - No staged lesson/review pages        -> nothing to check; defer to push.
     - More than MAX_STAGED pages staged    -> a mass regeneration; checking all
       of them IS the full sweep, which is what the push gate is for. Defer to
       push, LOUDLY, printing the exact count.
     - Shared pipeline files staged (engine/, tools/make-review.js) -> every
       review could be stale; only the full sweep can prove them all, so that
       part is deferred to push (printed). Staged lesson pages still check.

   Run:  node tools/verify-format-staged.js
   Exit 0 = staged pages match (or nothing to check). Non-zero = stale review.
   ========================================================================== */
"use strict";

const { execFileSync, spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MAX_STAGED = 20;

const PIPELINE = [
  "engine/preview-engine.js", "engine/rao.css", "engine/rao-card.css",
  "engine/rao-card.js", "engine/solution-renderer.js", "engine/robo.css",
  "engine/robo.js", "engine/fonts.css", "tools/make-review.js",
];

let staged;
try {
  staged = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
} catch (e) {
  console.error("verify-format-staged: cannot read the git index — " + e.message);
  process.exit(2);
}

const names = new Set();
for (const f of staged) {
  const p = f.replace(/\\/g, "/");
  let m;
  if ((m = p.match(/^lessons\/(?:incoming\/)?([^/]+)\.html$/)) && !m[1].startsWith("_"))
    names.add(m[1]);
  else if ((m = p.match(/^review\/([^/]+)\.html$/)) && m[1] !== "index" && !m[1].startsWith("_"))
    names.add(m[1]);
}
const pipelineTouched = PIPELINE.filter((f) => staged.includes(f));

if (pipelineTouched.length)
  console.log(
    `format(staged): shared pipeline file(s) staged (${pipelineTouched.join(", ")}) — ` +
    `every review could be affected; the FULL format sweep runs in the pre-push gate.`);

if (!names.size) {
  console.log("format(staged): no staged lesson/review pages — format check deferred to the push gate (full sweep).");
  process.exit(0);
}
if (names.size > MAX_STAGED) {
  console.log(
    `format(staged): ${names.size} lesson/review pages staged (> ${MAX_STAGED}) — this is a mass ` +
    `regeneration; checking them all IS the full ~14 min sweep. DEFERRED to the pre-push gate, ` +
    `which runs the full sweep and blocks the push on any mismatch.`);
  process.exit(0);
}

console.log(`format(staged): checking ${names.size} staged lesson/review page(s): ${[...names].join(", ")}`);
const r = spawnSync("node", [path.join(__dirname, "verify-format.js"), ...names],
  { cwd: ROOT, stdio: "inherit" });
process.exit(r.status === null ? 2 : r.status);
