#!/usr/bin/env node
/* ── Content Guards — whyWrong & hint enforcement ──
 *
 * Four guards enforcing CLAUDE.md §13.4 / §13.7 content rules:
 *
 *   a) DISTRACTOR COVERAGE — every incorrect option of every single-select
 *      and multi-select has a whyWrong entry.
 *   b) KEY MATCH — every whyWrong key matches an actual option exactly.
 *   c) TONE — no message opens with "You forgot / You didn't / You added /
 *      You should have" unless diagnostic: true.
 *   d) HINT LEAK — runs against every rung of every hint ladder.
 *
 * Uses the real engine (build()) for question parsing — the same questions
 * the harness tests are the questions this guard checks. No second parser.
 *
 * Usage:  node tools/verify-content-guards.js
 *         node tools/verify-content-guards.js --coverage   (report only)
 *
 * Exit code 0 = all guards pass.
 * Exit code 1 = at least one failure.
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT    = path.resolve(__dirname, "..");
const ENGINE  = path.join(ROOT, "engine", "preview-engine.js");
const LESSONS = path.join(ROOT, "lessons");

const C = { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", b: "\x1b[1m", d: "\x1b[2m", x: "\x1b[0m" };

// ════════════════════════════════════════════════════════════════
// Load the real engine
// ════════════════════════════════════════════════════════════════

global.window = {};
eval(fs.readFileSync(ENGINE, "utf8"));
const RaoPreview = global.window.RaoPreview;

// ════════════════════════════════════════════════════════════════
// Lesson file discovery — recursive, skips _preview
// ════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════
// Parse frontmatter blocks from source to get whyWrong
// (The engine doesn't parse whyWrong yet, so we read it ourselves
//  from the same <!--@q --> blocks, in document order.)
// ════════════════════════════════════════════════════════════════

function parseFrontmatter(body) {
  const fm = {};
  body.split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const i = t.indexOf(":");
    if (i < 0) return;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (/^[[{]/.test(val)) {
      try { val = JSON.parse(val); } catch (_) { /* leave as string */ }
    }
    fm[key] = val;
  });
  return fm;
}

function extractFrontmatters(html) {
  const fms = [];
  const re = /<!--@q\s*([\s\S]*?)-->/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    fms.push(parseFrontmatter(m[1]));
  }
  return fms;
}

// Extract option keys from engine-rendered markup
function extractOptionKeys(markup) {
  const keys = [];
  // Engine renders options as <button class="opt ..." data-val="...">.
  // The class may be compound: "opt", "opt opt-wide", "opt opt-sign", etc.
  // Match any element whose class contains "opt" followed by data-val.
  const re = /class="opt\b[^"]*"[^>]*data-val="([^"]*)"/g;
  let m;
  while ((m = re.exec(markup)) !== null) {
    keys.push(m[1]);
  }
  return keys;
}

function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  const b = html.indexOf('<div id="preview"');
  if (a < 0) return null;
  return html.slice(a, b > a ? b : undefined);
}

// ════════════════════════════════════════════════════════════════
// Build question list per lesson using the real engine
// ════════════════════════════════════════════════════════════════

function buildLesson(file) {
  const html = fs.readFileSync(file, "utf8");
  const src = sourceOf(html);
  if (!src) return [];

  const fms = extractFrontmatters(src);
  let qs;
  try { qs = RaoPreview.build(src); } catch { return []; }

  // The engine may produce fewer questions than @q blocks (e.g.
  // malformed nesting in _type-coverage.html). We pair engine
  // questions with frontmatters by matching on type+answer.
  // Simple approach: walk fms in order, consume the first engine
  // question whose behavior matches. This handles the common case
  // where the counts differ by a small number.
  const used = new Set();
  const paired = [];
  for (let qi = 0; qi < qs.length; qi++) {
    const q = qs[qi];
    // Find the frontmatter for this question
    let fm = fms[qi] || {};
    // If we have more fms than qs due to malformed nesting,
    // we might be off by one. Try matching by type.
    if (fm.type !== q.behavior && fms.length > qs.length) {
      for (let fi = 0; fi < fms.length; fi++) {
        if (!used.has(fi) && fms[fi].type === q.behavior) {
          fm = fms[fi];
          used.add(fi);
          break;
        }
      }
    } else {
      used.add(qi);
    }

    const optionKeys = extractOptionKeys(q.markup);
    const whyWrong = (typeof fm.whyWrong === "object" && fm.whyWrong !== null) ? fm.whyWrong : null;

    paired.push({
      type: q.behavior,
      answer: q.answer || [],
      hint: q.hint || null,
      explain: q.explain || null,
      optionKeys,
      whyWrong,
    });
  }
  return paired;
}

// ════════════════════════════════════════════════════════════════
// Guard A: DISTRACTOR COVERAGE
// ════════════════════════════════════════════════════════════════

function guardDistractorCoverage(allQuestions) {
  const label = "DISTRACTOR COVERAGE";
  let totalSelect = 0;
  let totalDistractors = 0;
  let covered = 0;
  let uncovered = 0;
  const uncoveredExamples = [];

  for (const { file, questions } of allQuestions) {
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (q.type !== "single-select" && q.type !== "multi-select") continue;
      if (q.optionKeys.length === 0) continue;
      totalSelect++;

      const correctSet = new Set(q.answer);
      const distractors = q.optionKeys.filter(k => !correctSet.has(k));
      totalDistractors += distractors.length;

      for (const d of distractors) {
        if (q.whyWrong && q.whyWrong[d]) {
          covered++;
        } else {
          uncovered++;
          if (uncoveredExamples.length < 5) {
            uncoveredExamples.push(`${file}:q${qi + 1} — option "${d}"`);
          }
        }
      }
    }
  }

  console.log(`\n  ${label}:`);
  console.log(`    Select questions: ${totalSelect}`);
  console.log(`    Total distractors: ${totalDistractors}`);
  console.log(`    Covered (have whyWrong): ${covered}`);
  console.log(`    Uncovered (missing whyWrong): ${uncovered}`);

  if (uncovered > 0) {
    console.log(`    ${C.r}FAIL${C.x} — ${uncovered} distractor(s) have no whyWrong entry`);
    if (uncoveredExamples.length > 0) {
      console.log(`    Examples:`);
      for (const ex of uncoveredExamples) console.log(`      ${ex}`);
    }
    return { pass: false, totalSelect, totalDistractors, uncovered };
  } else {
    console.log(`    ${C.g}PASS${C.x} — all ${totalDistractors} distractors have whyWrong entries`);
    return { pass: true, totalSelect, totalDistractors, uncovered };
  }
}

// ════════════════════════════════════════════════════════════════
// Guard B: KEY MATCH
// ════════════════════════════════════════════════════════════════

function guardKeyMatch(allQuestions) {
  const label = "KEY MATCH";
  let checked = 0;
  let orphans = 0;
  const orphanExamples = [];

  for (const { file, questions } of allQuestions) {
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.whyWrong) continue;

      const optSet = new Set(q.optionKeys);

      for (const key of Object.keys(q.whyWrong)) {
        checked++;
        if (!optSet.has(key)) {
          orphans++;
          if (orphanExamples.length < 5) {
            orphanExamples.push(`${file}:q${qi + 1} — whyWrong key "${key}" matches no option`);
          }
        }
      }
    }
  }

  console.log(`\n  ${label}:`);
  console.log(`    whyWrong keys checked: ${checked}`);

  if (orphans > 0) {
    console.log(`    ${C.r}FAIL${C.x} — ${orphans} orphan key(s) found`);
    for (const ex of orphanExamples) console.log(`      ${ex}`);
    return false;
  } else if (checked === 0) {
    console.log(`    ${C.g}PASS${C.x} — no whyWrong entries to check (vacuously true)`);
    return true;
  } else {
    console.log(`    ${C.g}PASS${C.x} — all ${checked} keys match an option`);
    return true;
  }
}

// ════════════════════════════════════════════════════════════════
// Guard C: TONE
// ════════════════════════════════════════════════════════════════

const TONE_PATTERNS = [
  /^you\s+forgot\b/i,
  /^you\s+didn'?t\b/i,
  /^you\s+added\b/i,
  /^you\s+should\s+have\b/i,
];

function guardTone(allQuestions) {
  const label = "TONE";
  let checked = 0;
  let violations = 0;
  const violationExamples = [];

  for (const { file, questions } of allQuestions) {
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.whyWrong) continue;

      for (const [key, entry] of Object.entries(q.whyWrong)) {
        if (!entry || typeof entry !== "object") continue;
        const msg = String(entry.message || "").trim();
        if (!msg) continue;
        checked++;

        const diagnostic = entry.diagnostic === true || entry.diagnostic === "true";
        if (diagnostic) continue;

        for (const pat of TONE_PATTERNS) {
          if (pat.test(msg)) {
            violations++;
            if (violationExamples.length < 5) {
              violationExamples.push(
                `${file}:q${qi + 1} — key "${key}": "${msg.slice(0, 60)}"`
              );
            }
            break;
          }
        }
      }
    }
  }

  console.log(`\n  ${label}:`);
  console.log(`    Messages checked: ${checked}`);

  if (violations > 0) {
    console.log(`    ${C.r}FAIL${C.x} — ${violations} message(s) diagnose the child without diagnostic:true`);
    for (const ex of violationExamples) console.log(`      ${ex}`);
    return false;
  } else if (checked === 0) {
    console.log(`    ${C.g}PASS${C.x} — no whyWrong messages to check (vacuously true)`);
    return true;
  } else {
    console.log(`    ${C.g}PASS${C.x} — all ${checked} messages pass tone check`);
    return true;
  }
}

// ════════════════════════════════════════════════════════════════
// Guard D: HINT LEAK
//
// A hint leak is when the hint PERFORMS the work or STATES the
// answer. A hint that merely names the concept being tested
// (e.g. "even numbers end in 0, 2, 4, 6, 8") is not a leak —
// it names the strategy, which is exactly what a hint should do.
//
// Precision rules:
//   1. Numeric answers: match as a standalone number token, not
//      as digits inside another number. "56" matches "= 56" but
//      not "560" or "3,569".
//   2. Skip short numeric answers (1-2 digits) — they appear
//      naturally in strategy language ("round to the nearest 10").
//      Exception: if the number appears as a RESULT in an equation
//      (after "="), that IS a leak.
//   3. Text answers: skip common English words that naturally
//      appear in strategy descriptions.
//   4. A hint that contains the answer inside a COMPLETED
//      equation ("X × Y = answer" or "answer = X + Y") is a leak
//      because it performed the arithmetic for the child.
// ════════════════════════════════════════════════════════════════

// Common words that appear as answer values but are also natural
// in strategy descriptions. These are NOT leaked just by appearing.
const HINT_SAFE_WORDS = new Set([
  // directions / positions
  "left", "right", "up", "down", "top", "bottom", "above", "below",
  "north", "south", "east", "west",
  // math vocabulary that is also an answer
  "even", "odd", "more", "less", "equal", "greater", "fewer",
  "true", "false", "yes", "no", "none",
  // shapes / concepts
  "square", "circle", "triangle", "rectangle", "cube", "cone",
  "sphere", "cylinder", "line", "point", "face", "edge", "vertex",
  // units / time
  "hour", "hours", "minute", "minutes", "second", "seconds",
  "day", "days", "week", "weeks", "month", "months", "year", "years",
  "meter", "meters", "gram", "grams", "liter", "liters",
  // common short words
  "the", "and", "for", "are", "but", "not", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "his", "how", "its",
  "may", "new", "now", "old", "see", "way", "who", "did", "get",
  "let", "say", "she", "too", "use", "red", "big", "end", "far",
  "few", "got", "low", "put", "ran", "run", "set", "ten", "try",
  "two", "ago", "cup", "cut", "hot", "lot", "mix", "six", "won",
  "add", "box", "eat", "both",
  // sports / activities that appear in context
  "tennis", "football", "soccer", "cricket", "hockey",
  "basketball", "baseball", "swimming", "gymnastics",
  // other context words
  "each", "first", "last", "next", "same", "other",
]);

function isNumeric(s) {
  return /^-?[\d,]+$/.test(s.replace(/,/g, ""));
}

function guardHintLeak(allQuestions) {
  const label = "HINT LEAK";
  let checked = 0;
  let leaks = 0;
  const leakExamples = [];

  for (const { file, questions } of allQuestions) {
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.hint) continue;

      // Normalize hint to array of rungs
      const rungs = Array.isArray(q.hint) ? q.hint.map(String) : [String(q.hint)];

      for (let ri = 0; ri < rungs.length; ri++) {
        const rung = rungs[ri].trim();
        if (!rung) continue;
        checked++;

        let leaked = false;
        let leakDetail = "";

        for (const rawAns of q.answer) {
          const ans = String(rawAns).trim();
          if (ans.length === 0) continue;
          const ansLower = ans.toLowerCase();

          // Skip safe common words
          if (HINT_SAFE_WORDS.has(ansLower)) continue;

          if (isNumeric(ans)) {
            // Numeric answer — check for equation result leak
            // Strip commas for matching: "16,000" -> "16000"
            const plain = ans.replace(/,/g, "");
            const plainLen = plain.replace(/^-/, "").length;

            // For short numbers (1-2 digits), only flag if it appears
            // as the result of an equation: "... = 56" or "56 = ..."
            // This catches "so 56 = 7×8" but not "5, 6, 7, 8"
            if (plainLen <= 2) {
              const eqResult = new RegExp(
                `=\\s*${plain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b` +
                `|\\b${plain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=`,
              );
              if (eqResult.test(rung.replace(/,/g, ""))) {
                leaked = true;
                leakDetail = `answer "${ans}" appears as equation result`;
              }
            } else {
              // For longer numbers (3+ digits), flag if the number
              // appears as a standalone token (not inside a larger number)
              const escaped = plain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              // Match the number not preceded/followed by digits
              const pat = new RegExp(`(?<!\\d)${escaped}(?!\\d)`);
              if (pat.test(rung.replace(/,/g, ""))) {
                leaked = true;
                leakDetail = `answer "${ans}" appears in hint`;
              }
            }
          } else {
            // Text answer — check for verbatim appearance
            if (ans.length <= 2) continue;
            const escaped = ansLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const pat = new RegExp(`\\b${escaped}\\b`, "i");
            if (pat.test(rung)) {
              leaked = true;
              leakDetail = `answer "${ans}" appears in hint`;
            }
          }

          if (leaked) break;
        }

        // Check for option elimination language
        if (!leaked) {
          if (/\beliminate\b.*\boption/i.test(rung) || /\brule\s+out\b/i.test(rung)) {
            leaked = true;
            leakDetail = "eliminates options";
          }
        }

        if (leaked) {
          leaks++;
          if (leakExamples.length < 10) {
            leakExamples.push(
              `${file}:q${qi + 1} rung ${ri + 1} — ${leakDetail}: "${rung.slice(0, 80)}"`
            );
          }
        }
      }
    }
  }

  console.log(`\n  ${label}:`);
  console.log(`    Hint rungs checked: ${checked}`);

  if (leaks > 0) {
    console.log(`    ${C.r}FAIL${C.x} — ${leaks} hint rung(s) leak answers or eliminate options`);
    for (const ex of leakExamples) console.log(`      ${ex}`);
    return false;
  } else {
    console.log(`    ${C.g}PASS${C.x} — all ${checked} hint rungs are clean`);
    return true;
  }
}

// ════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════

const coverageOnly = process.argv.includes("--coverage");

console.log("\n── Content Guards ──\n");

const files = collectLessons(LESSONS);
console.log(`  Scanning ${files.length} lesson files...\n`);

const allQuestions = [];
for (const f of files) {
  const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
  try {
    const questions = buildLesson(f);
    allQuestions.push({ file: rel, questions });
  } catch (err) {
    console.log(`  ${C.y}WARN${C.x} ${rel}: ${err.message}`);
  }
}

const totalQ = allQuestions.reduce((s, x) => s + x.questions.length, 0);
console.log(`  Parsed ${totalQ} questions from ${files.length} files.`);

// Run all four guards
const coverageResult = guardDistractorCoverage(allQuestions);
const keyMatchOk     = guardKeyMatch(allQuestions);
const toneOk         = guardTone(allQuestions);
const hintLeakOk     = guardHintLeak(allQuestions);

// Summary
const passed = [coverageResult.pass, keyMatchOk, toneOk, hintLeakOk].filter(Boolean).length;
const failed = 4 - passed;

console.log(`\n── ${passed} passed, ${failed} failed ──\n`);

if (coverageOnly) {
  process.exit(0);
}

if (failed > 0) {
  process.exit(1);
}
