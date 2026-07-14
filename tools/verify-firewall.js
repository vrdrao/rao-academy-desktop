#!/usr/bin/env node
/* ── Grading Firewall Guards ──
 *
 * Four guards that prove the solution renderer is structurally incapable
 * of touching grading. See CLAUDE.md §13.7 and SOLUTION_SPEC.md §1.3.
 *
 * Usage:  node tools/verify-firewall.js
 *
 * Each guard is independently provable: break what it protects, run this
 * script, see the FAIL. Restore, see the PASS. A guard never observed
 * failing is faith, not a guard.
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT         = path.resolve(__dirname, "..");
const RENDERER     = path.join(ROOT, "engine", "solution-renderer.js");
const ENGINE       = path.join(ROOT, "engine", "preview-engine.js");

// Files that constitute the grading path — touching these while doing
// solution work requires explicit authorisation.
const GRADING_FILES = ["engine/preview-engine.js"];

let failures = 0;
let passes   = 0;

function pass(name, detail) {
  passes++;
  console.log(`  PASS  ${name}` + (detail ? ` — ${detail}` : ""));
}

function fail(name, detail) {
  failures++;
  console.log(`  FAIL  ${name} — ${detail}`);
}

// ════════════════════════════════════════════════════════════════
// Guard A: DEPENDENCY
// The solution renderer must not import or reference the grading module.
// ════════════════════════════════════════════════════════════════

function stripComments(src) {
  // Remove single-line comments (// ...) and multi-line comments (/* ... */)
  // but preserve strings — simplified approach: replace comments with spaces
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")   // block comments
    .replace(/\/\/.*$/gm, " ");           // line comments
}

function guardDependency() {
  const label = "DEPENDENCY";
  const raw = fs.readFileSync(RENDERER, "utf8");
  const src = stripComments(raw);

  // Patterns that would indicate a reference to the grading module
  const forbidden = [
    { pattern: /require\s*\(\s*['"].*preview-engine/,       desc: "require('preview-engine')" },
    { pattern: /import\s+.*from\s+['"].*preview-engine/,    desc: "import from preview-engine" },
    { pattern: /\bRaoPreview\b/,                            desc: "RaoPreview reference" },
    { pattern: /\bcheck\s*\(/,                              desc: "check() call" },
    { pattern: /\bserialize\s*\(/,                          desc: "serialize() call" },
    { pattern: /\bBEHAVIORS\b/,                             desc: "BEHAVIORS reference" },
  ];

  let clean = true;
  for (const { pattern, desc } of forbidden) {
    if (pattern.test(src)) {
      fail(label, `Found forbidden reference: ${desc}`);
      clean = false;
    }
  }
  if (clean) {
    pass(label, "solution-renderer.js has no grading references");
  }
}

// ════════════════════════════════════════════════════════════════
// Guard B: RUNTIME
// Spy on check(). Opening, stepping through, and closing a solution
// must never call check() — not even once.
// ════════════════════════════════════════════════════════════════

function guardRuntime() {
  const label = "RUNTIME";

  // Load the engine into a sandboxed scope
  global.window = {};
  const engineSrc = fs.readFileSync(ENGINE, "utf8");
  eval(engineSrc);
  const engine = global.window.RaoPreview || (typeof RaoPreview !== "undefined" ? RaoPreview : null);

  if (!engine || typeof engine.check !== "function") {
    fail(label, "Could not load engine or find check()");
    return;
  }

  // Install spy on check()
  let checkCallCount = 0;
  const originalCheck = engine.check;
  engine.check = function (...args) {
    checkCallCount++;
    return originalCheck.apply(this, args);
  };

  // Load solution renderer fresh (clear any cached version)
  delete require.cache[require.resolve(RENDERER)];
  const { renderSolution } = require(RENDERER);

  // Simulate rendering a solution — open, step through, close
  // NOTE: objects are NOT frozen here — the RUNTIME guard only checks whether
  // check() is called, not mutation. MUTATION guard handles freeze.
  const gradingResult = { correct: true };
  const answer        = ["110"];
  const userResponse  = ["110"];
  const solution = [
    { type: "step", goal: "Round first", working: "66 → 70", reason: "6 ≥ 5" },
    { type: "step", goal: "Round second", working: "39 → 40", reason: "9 ≥ 5" },
    { type: "step", goal: "Add", working: "70 + 40 = 110" },
    { type: "takeaway", text: "5 or more, round up." },
    { type: "verification", text: "Close to 110." },
  ];

  try {
    renderSolution({ gradingResult, answer, userResponse, solution, explain: "70 + 40 = 110" });
    // Also test legacy path
    renderSolution({ gradingResult, answer, userResponse, explain: "70 + 40 = 110" });
  } catch (err) {
    fail(label, `Renderer threw during execution: ${err.message}`);
    engine.check = originalCheck;
    return;
  }

  if (checkCallCount > 0) {
    fail(label, `check() was called ${checkCallCount} time(s) during solution rendering`);
  } else {
    pass(label, "check() was never called during solution rendering");
  }

  // Restore
  engine.check = originalCheck;
}

// ════════════════════════════════════════════════════════════════
// Guard C: MUTATION
// Rendering a solution must not alter the stored answer or the
// student's stored response. Deep-freeze them; any write throws.
// ════════════════════════════════════════════════════════════════

function guardMutation() {
  const label = "MUTATION";

  delete require.cache[require.resolve(RENDERER)];
  const { renderSolution } = require(RENDERER);

  // Create deeply frozen objects
  const gradingResult = deepFreeze({ correct: false });
  const answer        = deepFreeze(["110"]);
  const userResponse  = deepFreeze(["100"]);
  const solution = deepFreeze([
    { type: "step", goal: "Round first", working: "66 → 70", reason: "6 ≥ 5" },
    { type: "takeaway", text: "5 or more, round up." },
  ]);

  try {
    renderSolution({ gradingResult, answer, userResponse, solution, explain: "70 + 40 = 110" });
    pass(label, "No mutation of frozen answer/response/gradingResult");
  } catch (err) {
    if (err instanceof TypeError && /Cannot (assign|add|delete|define|set)/i.test(err.message)) {
      fail(label, `Attempted mutation: ${err.message}`);
    } else {
      fail(label, `Unexpected error: ${err.message}`);
    }
  }
}

function deepFreeze(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

// ════════════════════════════════════════════════════════════════
// Guard D: SOURCE-DIFF
// Solution work must not modify grading files without explicit
// authorisation. Check git diff for co-modification.
// ════════════════════════════════════════════════════════════════

function guardSourceDiff() {
  const label = "SOURCE-DIFF";

  // Solution-related files
  const SOLUTION_FILES = [
    "engine/solution-renderer.js",
    "tools/verify-firewall.js",
  ];

  let changedFiles;
  try {
    // Get both staged and unstaged changes
    const staged   = execSync("git diff --cached --name-only", { cwd: ROOT, encoding: "utf8" }).trim();
    const unstaged = execSync("git diff --name-only",          { cwd: ROOT, encoding: "utf8" }).trim();
    const untracked = execSync("git ls-files --others --exclude-standard", { cwd: ROOT, encoding: "utf8" }).trim();
    const all = [staged, unstaged, untracked].filter(Boolean).join("\n");
    changedFiles = all ? [...new Set(all.split("\n").map(f => f.replace(/\\/g, "/")))] : [];
  } catch {
    // Not a git repo or git not available — skip gracefully
    pass(label, "Not a git repo or git unavailable — skipped");
    return;
  }

  const solutionChanged = changedFiles.some(f => SOLUTION_FILES.some(sf => f.endsWith(sf)));
  const gradingChanged  = changedFiles.some(f => GRADING_FILES.some(gf => f.endsWith(gf)));

  if (solutionChanged && gradingChanged) {
    const touchedGrading = changedFiles.filter(f => GRADING_FILES.some(gf => f.endsWith(gf)));

    if (process.env.FIREWALL_ALLOW_GRADING === "1") {
      // Override accepted — but scream about it so nobody misses it.
      const banner = [
        "",
        "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
        "!! FIREWALL OVERRIDE ACTIVE — GRADING FILES BEING MODIFIED  !!",
        "!!                                                          !!",
        ...touchedGrading.map(f =>
          "!!  " + f.padEnd(54) + "!!"
        ),
        "!!                                                          !!",
        "!! This override requires Venkat's explicit instruction.    !!",
        "!! See CLAUDE.md §13.7 SOURCE-DIFF.                        !!",
        "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
        "",
      ];
      process.stderr.write(banner.join("\n") + "\n");
      pass(label, "OVERRIDE — grading files touched with FIREWALL_ALLOW_GRADING=1 (see stderr warning)");
    } else {
      fail(label, `Solution files and grading files modified together: ${touchedGrading.join(", ")}`);
    }
  } else {
    pass(label, solutionChanged
      ? "Solution files changed but grading files untouched"
      : "No solution file changes detected");
  }
}

// ════════════════════════════════════════════════════════════════
// Run all guards
// ════════════════════════════════════════════════════════════════

console.log("\n── Grading Firewall Guards ──\n");

guardDependency();
guardRuntime();
guardMutation();
guardSourceDiff();

console.log(`\n── ${passes} passed, ${failures} failed ──\n`);

if (failures > 0) {
  process.exit(1);
}
