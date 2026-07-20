#!/usr/bin/env node
/* ── verify-colmath.js — COLUMN ARITHMETIC MUST ALIGN (BRIEF-3 Item E) ──
 *
 * Misaligned columns in a place-value lesson actively teach the wrong thing —
 * column alignment IS the skill being taught. This guard renders every
 * layout:column (cmath) question in the corpus, plus the layout:vertical
 * (.vcol) and layout:multiply (.vmul) coverage fixtures, and asserts at BOTH
 * viewports (1280px, 390px):
 *
 *   1. COLUMN ALIGNMENT — per column, |x-centre(top-row digit GLYPH) −
 *      x-centre(answer box)| ≤ 2px. Glyphs, not cell boxes: a left-aligned
 *      digit in a wide auto-layout column passed a box-centre check while
 *      sitting 27.5px off its answer box.
 *   2. TAP TARGET — every answer input ≥ 44×44px (BRIEF-1 Item B's regression
 *      check, carried forward).
 *   3. ₹ TIGHT — where a currency glyph renders, its right edge sits within
 *      10px of the first digit glyph of its row.
 *   4. THE RULE LINE — the answer row sits under a visible rule
 *      (border ≥ 2px) spanning the digit columns, so it reads as the
 *      sum's third line, not a detached row of boxes.
 *
 * Exit 0 = all green. Exit 1 = at least one failure (with per-column numbers).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", x: "\x1b[0m" };
let failures = 0;
function pass(name, detail) { console.log(`  ${C.g}PASS${C.x}  ${name}${detail ? " — " + detail : ""}`); }
function fail(name, detail) { failures++; console.log(`  ${C.r}FAIL${C.x}  ${name} — ${detail}`); }

function collectLessons(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "_preview") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(collectLessons(full));
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function buildPage() {
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  const files = collectLessons(path.join(ROOT, "lessons"))
    .filter((f) => /layout:\s*(column|vertical|multiply)/.test(fs.readFileSync(f, "utf8")));
  const sources = files.map((f) => {
    const html = fs.readFileSync(f, "utf8");
    const a = html.indexOf('<div id="source">');
    const b = html.indexOf('<div id="preview"');
    const src = html.slice(a, b > a ? b : undefined);
    const rel = path.relative(path.join(ROOT, "lessons"), f).replace(/\\/g, "/");
    return `<div class="src-blob">${src.replace('<div id="source">', `<div class="lsrc" data-file="${rel}">`)}</div>`;
  }).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
${sources}
<div class="rao-lesson" data-theme="grape"><div id="mount"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>
window.__vm = [];
document.querySelectorAll(".lsrc").forEach(function (blob) {
  const qs = RaoPreview.build('<div id="source">' + blob.innerHTML + '</div>');
  qs.forEach(function (q, i) {
    const kind = q.markup.indexOf('class="cmath"') >= 0 ? "cmath"
               : q.markup.indexOf('class="vcol"') >= 0 ? "vcol"
               : q.markup.indexOf('class="vmul') >= 0 ? "vmul" : null;
    if (!kind) return;
    // every cmath question; vcol/vmul sampled from the coverage fixture only
    if (kind !== "cmath" && blob.dataset.file !== "_type-coverage.html") return;
    const holder = document.createElement("div");
    holder.innerHTML = q.markup;
    document.getElementById("mount").appendChild(holder);
    window.__vm.push({ file: blob.dataset.file, q: i + 1, kind, root: holder });
  });
});
</script></body></html>`;
}

(async () => {
  console.log(`\n${C.b}COLUMN ARITHMETIC${C.x} — one column grid, top digit to answer box (BRIEF-3 Item E)\n`);
  const browser = await chromium.launch();
  const html = buildPage();
  for (const vp of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: vp, height: 1400 } });
    await page.setContent(html, { waitUntil: "load" });
    await page.waitForTimeout(250);
    const rows = await page.evaluate(() => {
      const glyphRect = (el) => {
        // rect of the actual text/content, not the cell box
        if (el.tagName === "INPUT") return el.getBoundingClientRect();
        const rg = document.createRange();
        rg.selectNodeContents(el);
        const r = rg.getBoundingClientRect();
        return (r.width > 0 ? r : el.getBoundingClientRect());
      };
      const cx = (r) => r.left + r.width / 2;
      const out = [];
      window.__vm.forEach((v) => {
        const rec = { file: v.file, q: v.q, kind: v.kind, cols: [], inputs: [], cur: null, rule: null };
        if (v.kind === "cmath") {
          const topRow = v.root.querySelector("tr.cm-row");
          const ansRow = v.root.querySelector("tr.cm-ansrow");
          const topCells = [...topRow.querySelectorAll("td.cm-d")].filter((td) => td.textContent.trim() !== "");
          const inputs = [...ansRow.querySelectorAll("input.cm-cell")];
          // pair right-to-left: last digit column ↔ last input
          const n = Math.min(topCells.length, inputs.length);
          for (let k = 1; k <= n; k++) {
            const td = topCells[topCells.length - k], inp = inputs[inputs.length - k];
            rec.cols.push(+(cx(glyphRect(td)) - cx(inp.getBoundingClientRect())).toFixed(1));
          }
          rec.cols.reverse();
          inputs.forEach((i) => { const r = i.getBoundingClientRect(); rec.inputs.push([Math.round(r.width), Math.round(r.height)]); });
          // ₹ tightness for each row that renders a visible currency glyph
          [...v.root.querySelectorAll("tr")].forEach((tr) => {
            const cur = [...tr.querySelectorAll("td")].find((td) => td.textContent.indexOf("₹") >= 0);
            if (!cur) return;
            const digits = [...tr.querySelectorAll("td.cm-d")].filter((td) => td.textContent.trim() !== "" && td !== cur);
            const inp = tr.querySelector("input.cm-cell");
            const firstRect = digits.length ? glyphRect(digits[0]) : (inp ? inp.getBoundingClientRect() : null);
            if (!firstRect) return;
            const gap = +(firstRect.left - glyphRect(cur).right).toFixed(1);
            if (rec.cur == null || gap > rec.cur) rec.cur = gap;
          });
          const rule = v.root.querySelector(".cm-rule");
          if (rule) {
            const cs = getComputedStyle(rule);
            rec.rule = { border: parseFloat(cs.borderTopWidth), w: Math.round(rule.getBoundingClientRect().width) };
          }
        } else if (v.kind === "vcol") {
          const rowsEls = [...v.root.querySelectorAll(".vcol .row")];
          const cellsOf = (row) => [...row.children].filter((c) => c.classList.contains("cm-cell") || c.classList.contains("blank-input"));
          const top = cellsOf(rowsEls[0]), ans = cellsOf(rowsEls[rowsEls.length - 1]);
          const n = Math.min(top.length, ans.length);
          for (let k = 1; k <= n; k++) {
            const t = top[top.length - k], a2 = ans[ans.length - k];
            rec.cols.push(+(cx(t.getBoundingClientRect()) - cx(a2.getBoundingClientRect())).toFixed(1));
          }
          rec.cols.reverse();
          [...v.root.querySelectorAll(".vcol .blank-input")].forEach((i) => { const r = i.getBoundingClientRect(); rec.inputs.push([Math.round(r.width), Math.round(r.height)]); });
        } else if (v.kind === "vmul") {
          const rowsEls = [...v.root.querySelectorAll(".vm-row")].filter((r) => r.querySelector(".vm-d"));
          const top = [...rowsEls[0].querySelectorAll(".vm-d")];
          const ans = [...rowsEls[rowsEls.length - 1].querySelectorAll(".vm-d")];
          const n = Math.min(top.length, ans.length);
          for (let k = 1; k <= n; k++) {
            const t = top[top.length - k], a2 = ans[ans.length - k];
            rec.cols.push(+(cx(t.getBoundingClientRect()) - cx(a2.getBoundingClientRect())).toFixed(1));
          }
          rec.cols.reverse();
          [...v.root.querySelectorAll(".vm-cell")].forEach((i) => { const r = i.getBoundingClientRect(); rec.inputs.push([Math.round(r.width), Math.round(r.height)]); });
        }
        out.push(rec);
      });
      return out;
    });

    let badAlign = 0, badSize = 0, badCur = 0, badRule = 0, qn = 0;
    for (const r of rows) {
      qn++;
      const worst = Math.max(...r.cols.map((d) => Math.abs(d)));
      if (worst > 2) { badAlign++; fail(`@${vp}px ${r.file} Q${r.q} [${r.kind}] column alignment`, `per-column Δ [${r.cols.join(", ")}]px — worst ${worst}px (limit 2px)`); }
      const small = r.inputs.filter(([w, h]) => w < 44 || h < 44);
      if (small.length) { badSize++; fail(`@${vp}px ${r.file} Q${r.q} [${r.kind}] input ≥44px`, small.map(([w, h]) => w + "x" + h).join(", ")); }
      if (r.kind === "cmath") {
        if (r.cur != null && r.cur > 10) { badCur++; fail(`@${vp}px ${r.file} Q${r.q} ₹ tight`, `worst ₹→digit gap ${r.cur}px (limit 10px)`); }
        if (!r.rule || r.rule.border < 2) { badRule++; fail(`@${vp}px ${r.file} Q${r.q} rule line`, r.rule ? `border ${r.rule.border}px` : "no .cm-rule"); }
      }
    }
    if (!badAlign) pass(`@${vp}px column alignment ≤2px`, `${qn} questions, every column`);
    if (!badSize) pass(`@${vp}px all answer inputs ≥44×44px`);
    if (!badCur) pass(`@${vp}px ₹ sits tight against its number (≤10px)`);
    if (!badRule) pass(`@${vp}px rule line visible above the answer row`);
    await page.close();
  }
  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "COLMATH: columns align top row to answer box ✅" : C.r + failures + " column-arithmetic check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-colmath crashed:", e); process.exit(1); });
