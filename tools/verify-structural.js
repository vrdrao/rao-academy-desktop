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

if (failed) {
  console.log(`\n${C.r}STRUCTURAL: ${failed} case(s) failed — malformed authoring is not being rejected.${C.x}`);
  process.exit(1);
}
console.log(`\n${C.g}STRUCTURAL: all ${cases.length} cases pass — malformed authoring is rejected loudly.${C.x}`);
