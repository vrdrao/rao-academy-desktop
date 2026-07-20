/* ============================================================================
   STRUCTURAL VERIFIER — proves the parser REJECTS malformed authoring loudly.

   The engine's whole-file parser (parseAuthoringHtml) used to RECOVER silently
   from broken structure: an unclosed <div class="question"> swallowed every
   later question; a nested question vanished; a duplicate @q silently discarded
   the earlier frontmatter (type AND answer key). validate() returned ok=true.
   That is the project's cardinal sin — a silent failure a child sees first.

   This runs the parser (node, no browser) over hand-built malformed fixtures and
   asserts each produces the expected diagnostic code, AND over valid fixtures to
   assert NO structural false positives. Fast: pure string parse, ~instant.

   Usage:  node tools/verify-structural.js
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENGINE = path.join(ROOT, "engine", "preview-engine.js");

// Load the engine the same way the browser does: it assigns window.RaoPreview.
global.window = {};
eval(fs.readFileSync(ENGINE, "utf8"));
const RP = global.window.RaoPreview;

const C = { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", x: "\x1b[0m" };

// A single, well-formed single-select — the building block for fixtures.
const good = (p, vals, ans) =>
  `<!--@q\ntype: single-select\nanswer: ["${ans}"]\n-->\n` +
  `<div class="question"><p class="prompt">${p}</p><ul class="options">` +
  vals.map((v) => `<li data-val="${v}">${v}</li>`).join("") +
  `</ul></div>`;

const codesOf = (v) =>
  (v.items || []).flatMap((it) => (it.issues || []).map((is) => is.code));

// Each case: source, and the structural codes that MUST appear (mustHave) or MUST
// NOT appear (mustLack). Structural codes are the ones this verifier owns.
const STRUCTURAL = ["UNCLOSED_QUESTION", "NESTED_QUESTION", "NESTED_FRONTMATTER",
                    "DUPLICATE_FRONTMATTER", "ORPHAN_FRONTMATTER"];

const cases = [
  { name: "valid single question",
    src: good("Q1?", ["a", "b"], "a"),
    mustHave: [], mustLack: STRUCTURAL },

  { name: "valid multi-question lesson (no false positives)",
    src: [good("Q1?", ["a", "b"], "a"),
          good("Q2?", ["c", "d"], "c"),
          good("Q3?", ["e", "f"], "e")].join("\n\n"),
    mustLack: STRUCTURAL, expectDetected: 3 },

  { name: "nested question is swallowed",
    src: `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
         `<div class="question"><p class="prompt">Outer?</p>` +
         `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul>\n` +
         good("Inner?", ["c", "d"], "c") + `\n</div>`,
    mustHave: ["NESTED_QUESTION"], expectDetected: 1 },

  { name: "unclosed question swallows the next",
    src: `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
         `<div class="question"><p class="prompt">Q1?</p>` +
         `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul>\n` +
         good("Q2?", ["c", "d"], "c"),   // no closing </div> on Q1
    mustHave: ["UNCLOSED_QUESTION"], expectDetected: 1 },

  { name: "duplicate frontmatter discards an answer key",
    src: `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
         `<!--@q\ntype: single-select\nanswer: ["b"]\n-->\n` +
         `<div class="question"><p class="prompt">Which fm wins?</p>` +
         `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul></div>`,
    mustHave: ["DUPLICATE_FRONTMATTER"], expectDetected: 1 },

  { name: "orphan trailing frontmatter",
    src: good("Q1?", ["a", "b"], "a") +
         `\n<!--@q\ntype: single-select\nanswer: ["z"]\n-->`,
    mustHave: ["ORPHAN_FRONTMATTER"], expectDetected: 1 },

  // rao-master-19 Part C: an unknown figure type is a BUILD-FAILING error, not a
  // warning. It used to warn and render nothing — a child saw a blank. The corpus
  // carries no unknown figures, so without this fixture a demotion back to a
  // warning would never be caught.
  { name: "unknown figure data-show is a build-failing error",
    src: `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
         `<div class="question"><p class="prompt">X?</p>` +
         `<figure data-show="no-such-figure"></figure>` +
         `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul></div>`,
    mustHave: ["UNKNOWN_FIGURE"], expectDetected: 1 },

  { name: "known figure types (equal-groups, sequence) build clean",
    src: `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
         `<div class="question"><p class="prompt">X?</p>` +
         `<figure data-show="equal-groups" data-groups="3" data-per="4"></figure>` +
         `<figure data-show="sequence" data-values="2,4,?"></figure>` +
         `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul></div>`,
    mustHave: [], mustLack: ["UNKNOWN_FIGURE"], expectDetected: 1 },

  // BRIEF-1 Item G: prose in an element no extractor claims is silently
  // discarded — 25 questions shipped with their perimeter in <p class="lead">.
  // The engine must WARN (not fail: content fixes are content-brief work).
  { name: "unclaimed prose element (p.lead) emits DROPPED_PROSE warn",
    src: `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
         `<div class="question"><p class="lead">The perimeter is 22.</p>` +
         `<p class="prompt">X?</p>` +
         `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul></div>`,
    mustHave: ["DROPPED_PROSE"], expectDetected: 1 },

  { name: "fully-claimed question (prompt+figure+svg+options+explain) emits no DROPPED_PROSE",
    src: `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
         `<div class="question"><p class="prompt">X?</p>` +
         `<svg viewBox="0 0 10 10" width="10" height="10"><text x="1" y="5">7</text></svg>` +
         `<figure data-show="equal-groups" data-groups="3" data-per="4"></figure>` +
         `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul>` +
         `<p class="explain">Because.</p></div>`,
    mustHave: [], mustLack: ["DROPPED_PROSE"], expectDetected: 1 },
];

let failed = 0;
for (const c of cases) {
  const v = RP.validate(c.src);
  const codes = codesOf(v);
  const problems = [];

  for (const code of c.mustHave || [])
    if (!codes.includes(code)) problems.push(`missing ${code}`);
  for (const code of c.mustLack || [])
    if (codes.includes(code)) problems.push(`false positive ${code}`);
  if (c.expectDetected != null && (v.items || []).length !== c.expectDetected)
    problems.push(`detected ${(v.items || []).length}, expected ${c.expectDetected}`);

  if (problems.length) {
    failed++;
    console.log(`${C.r}✗ ${c.name}${C.x}`);
    problems.forEach((p) => console.log(`    ${p}`));
    console.log(`    codes seen: [${codes.join(", ") || "none"}]`);
  } else {
    console.log(`${C.g}✓${C.x} ${c.name}`);
  }
}

/* ── SANITIZER GUARD: prose with "on*" words must survive intact ────────────
   The old sanitizer regex /\son[a-z]+=.../g was global and ate ANY word
   starting with "on" followed by "=" — including "ones =" in a maths prompt.
   It silently deleted content from Place_values_remix Q13 and shipped that way
   for months. This guard exists so it can never happen again. */
{
  const sanitizerCases = [
    { prompt: "8 ones = []",           mustContain: "ones =",  name: "ones = []" },
    { prompt: "Sign up online = []",   mustContain: "online =",       name: "online = []" },
    { prompt: "ongoing = []",          mustContain: "ongoing =",       name: "ongoing = []" },
    { prompt: "Count on from 5. []",   mustContain: "on from",  name: "on from" },
  ];
  const securityCases = [
    { tag: '<p class="prompt" onclick="alert(1)">text</p>', mustStrip: "onclick", name: "onclick stripped" },
    { tag: '<li onmouseover="x">A</li>', mustStrip: "onmouseover", name: "onmouseover stripped" },
  ];

  let sanitizerFailed = 0;

  for (const c of sanitizerCases) {
    const src = `<div id="source"><!--@q\ntype: fill-blanks\nanswer: ["99"]\n--><div class="question" data-type="fill-blanks"><p class="prompt">${c.prompt}</p></div></div>`;
    const qs = RP.build(src);
    const ok = qs[0].markup.includes(c.mustContain);
    if (!ok) { sanitizerFailed++; failed++; console.log(`${C.r}✗ sanitizer ate prose: ${c.name}${C.x}`); }
    else { console.log(`${C.g}✓${C.x} sanitizer preserves prose: ${c.name}`); }
  }

  for (const c of securityCases) {
    const src = `<div id="source"><!--@q\ntype: single-select\nanswer: ["A"]\n--><div class="question" data-type="single-select">${c.tag}<ul class="options"><li data-val="A">A</li><li data-val="B">B</li></ul></div></div>`;
    const qs = RP.build(src);
    const ok = !qs[0].markup.includes(c.mustStrip);
    if (!ok) { sanitizerFailed++; failed++; console.log(`${C.r}✗ sanitizer MISSED event handler: ${c.name}${C.x}`); }
    else { console.log(`${C.g}✓${C.x} sanitizer strips handler: ${c.name}`); }
  }

  if (sanitizerFailed) {
    console.log(`\n${C.r}SANITIZER: ${sanitizerFailed} case(s) failed.${C.x}`);
  }
}

/* ── UNKNOWN-FIGURE LEVEL GUARD (rao-master-19 Part C) ──────────────────────
   The UNKNOWN_FIGURE issue must stay ERROR-level: the build gate
   (verify-grading-node) only fails on level "error", so a silent demotion to
   "warn" would reopen the blank-figure hole while every code-based check
   still saw the code present. */
{
  const src = `<!--@q\ntype: single-select\nanswer: ["a"]\n-->\n` +
    `<div class="question"><p class="prompt">X?</p>` +
    `<figure data-show="no-such-figure"></figure>` +
    `<ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul></div>`;
  const v = RP.validate(src);
  const iss = (v.items || []).flatMap((it) => (it.issues || []))
    .filter((i) => i.code === "UNKNOWN_FIGURE");
  if (iss.length && iss.every((i) => (i.level || "error") === "error")) {
    console.log(`${C.g}✓${C.x} UNKNOWN_FIGURE is error-level (build-failing)`);
  } else {
    failed++;
    console.log(`${C.r}✗ UNKNOWN_FIGURE is ${iss.length ? "level \"" + iss[0].level + "\"" : "missing"} — must be an error-level, build-failing issue${C.x}`);
  }
}

/* ── CORPUS NESTING GUARD: no real lesson may have @q inside unclosed question div ──
   _type-coverage.html had this exact bug: a missing </div> caused the construct
   question to nest inside the single-select, and the engine silently swallowed it.
   This scans every lesson file and fails if any @q appears while a question div is
   still open. */
{
  const LESSONS = path.join(ROOT, "lessons");
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
  const lessonFiles = collectLessons(LESSONS);
  const nestingBugs = [];
  for (const f of lessonFiles) {
    const html = fs.readFileSync(f, "utf8");
    const srcMatch = html.match(/<div id="source">([\s\S]*?)(?:<div id="preview"|$)/);
    if (!srcMatch) continue;
    const src = srcMatch[1];
    // Tokenize: @q blocks, question opens, any </div>
    const tokens = [];
    const tokenRe = /(<!--@q[\s\S]*?-->)|(<div\s+class="question"[^>]*>)|(<\/div>)/gi;
    let m;
    while ((m = tokenRe.exec(src)) !== null) {
      if (m[1]) tokens.push("fq");
      else if (m[2]) tokens.push("open");
      else if (m[3]) tokens.push("close");
    }
    // Walk: if @q appears while a question div is open, the HTML is malformed
    let depth = 0;
    for (const tok of tokens) {
      if (tok === "fq") {
        if (depth > 0) {
          const rel = path.relative(LESSONS, f).replace(/\\/g, "/");
          nestingBugs.push(rel);
          break; // one report per file is enough
        }
        depth = 0;
      } else if (tok === "open") {
        depth++;
      } else if (tok === "close") {
        depth = Math.max(0, depth - 1);
      }
    }
  }
  if (nestingBugs.length > 0) {
    failed += nestingBugs.length;
    console.log(`${C.r}✗ MALFORMED NESTING — <!--@q--> found inside unclosed <div class="question">:${C.x}`);
    for (const b of nestingBugs) console.log(`    ${b}`);
    console.log(`  This means a question is swallowing the next one. Add the missing </div>.`);
  } else {
    console.log(`${C.g}✓${C.x} no malformed question nesting across ${lessonFiles.length} lessons`);
  }
}

if (failed) {
  console.log(`\n${C.r}STRUCTURAL: ${failed} case(s) failed — malformed authoring is not being rejected.${C.x}`);
  process.exit(1);
}
console.log(`\n${C.g}STRUCTURAL: all ${cases.length} cases pass — malformed authoring is rejected loudly.${C.x}`);
