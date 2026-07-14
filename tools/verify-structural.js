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

if (failed) {
  console.log(`\n${C.r}STRUCTURAL: ${failed} case(s) failed — malformed authoring is not being rejected.${C.x}`);
  process.exit(1);
}
console.log(`\n${C.g}STRUCTURAL: all ${cases.length} cases pass — malformed authoring is rejected loudly.${C.x}`);
