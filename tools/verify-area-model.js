#!/usr/bin/env node
/* ── verify-area-model.js — Item 48: typed cells in the partial-product box ──
 *
 * BRIEF-AREAMODEL-1. The area model's product cells are now typed
 * <input class="blank-input"> (mode="type"), graded by POSITION via the
 * fill-blanks path. Three guards:
 *
 * Guard 1 — GRADES BY POSITION. Correct entries in every cell → correct; one
 *   cell wrong → wrong; and — the whole point of Item 48 — the RIGHT numbers in
 *   the WRONG CELLS → wrong. Driven through the real DOM (serialize + check).
 *
 * Guard 2 — NO REGRESSION. mode="filled" and mode="blank" still render an SVG
 *   picture with ZERO inputs (unchanged); only mode="type" emits blank-inputs,
 *   as an HTML grid (no <foreignObject>).
 *
 * Guard 3 — VISIBILITY. At 390×844 and 360×780 under real CDP touch: every cell
 *   input is tappable (focuses) and reachable, the Check button is reachable,
 *   and the grid does not overflow horizontally.
 *
 * Fixtures are injected TEST-SIDE (never a lesson file).
 *
 * Exit 0 = all pass. Exit 1 = otherwise.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", x: "\x1b[0m" };
let failures = 0;
const pass = (n, d) => console.log(`  ${C.g}PASS${C.x}  ${n}${d ? " — " + d : ""}`);
const fail = (n, d) => { failures++; console.log(`  ${C.r}FAIL${C.x}  ${n}${d ? " — " + d : ""}`); };

function pageFor(source) {
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style><style>${read("engine/rao-card.css")}</style>
</head><body>${source}
<div class="rao-lesson" data-theme="grape"><div id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script></body></html>`;
}

// idx0 type/sums=hide (4 cells) · idx1 type/sums=blank (6 blanks) · idx2 filled · idx3 blank
const SRC = `<div id="source">
<!--@q
id: qamtype001
type: fill-blanks
answer: ["6300", "450", "350", "25"]
-->
<div class="question" data-type="fill-blanks"><p class="prompt">Fill the box for 75 x 95.</p><figure data-show="area-model" data-top="75" data-side="95" data-mode="type" data-sums="hide" data-blank-start="0"></figure></div>

<!--@q
id: qamtype002
type: fill-blanks
answer: ["6300", "450", "6750", "350", "25", "375"]
-->
<div class="question" data-type="fill-blanks"><p class="prompt">Fill the box for 75 x 95 with row totals.</p><figure data-show="area-model" data-top="75" data-side="95" data-mode="type" data-sums="blank" data-blank-start="0"></figure></div>

<!--@q
id: qamfilled01
type: single-select
answer: ["a"]
-->
<div class="question" data-type="single-select"><p class="prompt">Worked box.</p><figure data-show="area-model" data-top="75" data-side="95" data-mode="filled" data-sums="show"></figure><ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul></div>

<!--@q
id: qamblank001
type: single-select
answer: ["a"]
-->
<div class="question" data-type="single-select"><p class="prompt">Empty box.</p><figure data-show="area-model" data-top="75" data-side="95" data-mode="blank" data-sums="blank"></figure><ul class="options"><li data-val="a">a</li><li data-val="b">b</li></ul></div>
</div>`;

// set the cell inputs (by data-blank order) to a set of values, then grade via
// the engine's own serialize + check — the exact path the app grades on.
const gradeWith = (page, idx, values) => page.evaluate(([k, vals]) => {
  const f = document.querySelectorAll(".pv-frame")[k];
  const qb = f.querySelector(".qbody");
  const ins = [...qb.querySelectorAll(".blank-input")].sort((a, b) => Number(a.dataset.blank) - Number(b.dataset.blank));
  ins.forEach((inp, i) => { inp.value = vals[i]; inp.dispatchEvent(new Event("input", { bubbles: true })); });
  const beh = f.dataset.behavior;
  const answer = JSON.parse(f.dataset.answer);
  const user = window.RaoPreview.serialize(qb, beh);
  return { user, ok: window.RaoPreview.check(beh, user, answer) };
}, [idx, values]);

(async () => {
  console.log(`\n${C.b}AREA MODEL${C.x} — Item 48: typed partial-product cells\n`);
  const browser = await chromium.launch();

  // ── Guards 1 & 2 (desktop) ──
  {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setContent(pageFor(SRC), { waitUntil: "load" });

    // Guard 1a — sums=hide, correct in every cell
    let r = await gradeWith(page, 0, ["6300", "450", "350", "25"]);
    if (r.ok === true) pass("Guard 1 — every cell correct → correct", `serialize=${JSON.stringify(r.user)}`);
    else fail("Guard 1 — every cell correct → correct", JSON.stringify(r));
    // Guard 1b — one cell wrong
    r = await gradeWith(page, 0, ["6300", "450", "350", "99"]);
    if (r.ok === false) pass("Guard 1 — one cell wrong → wrong");
    else fail("Guard 1 — one cell wrong → wrong", JSON.stringify(r));
    // Guard 1c — RIGHT numbers, WRONG cells (swap first two) → must be wrong
    r = await gradeWith(page, 0, ["450", "6300", "350", "25"]);
    if (r.ok === false) pass("Guard 1 — right numbers in WRONG cells → wrong (the point of Item 48)", `serialize=${JSON.stringify(r.user)}`);
    else fail("Guard 1 — right numbers in WRONG cells → wrong", JSON.stringify(r));
    // Guard 1d — sums=blank path grades (6 blanks incl. row totals)
    r = await gradeWith(page, 1, ["6300", "450", "6750", "350", "25", "375"]);
    if (r.ok === true) pass("Guard 1 — sums=blank (cells + row totals) correct → correct", `${r.user.length} blanks`);
    else fail("Guard 1 — sums=blank correct → correct", JSON.stringify(r));

    // Guard 2 — filled/blank are SVG pictures with NO inputs; type is HTML inputs
    const reg = await page.evaluate(() => {
      const q = (k) => document.querySelectorAll(".pv-frame")[k];
      const info = (k) => {
        const f = q(k);
        return {
          blanks: f.querySelectorAll(".blank-input").length,
          svg: !!f.querySelector(".fig-wrap svg"),
          amTable: !!f.querySelector(".am-table"),
          foreignObject: !!f.querySelector("foreignObject"),
        };
      };
      return { type: info(0), typeSum: info(1), filled: info(2), blank: info(3) };
    });
    const g2 = reg.filled.blanks === 0 && reg.filled.svg && reg.blank.blanks === 0 && reg.blank.svg &&
               reg.type.blanks === 4 && reg.type.amTable && !reg.type.svg && !reg.type.foreignObject &&
               reg.typeSum.blanks === 6;
    if (g2) pass("Guard 2 — filled/blank unchanged SVG (0 inputs); type = HTML grid, no foreignObject", JSON.stringify(reg));
    else fail("Guard 2 — no regression on filled/blank", JSON.stringify(reg));

    if (errors.length) fail("desktop: zero page errors", errors.join(" | "));
    else pass("desktop: zero page errors");
    await page.close();
  }

  // ── Guard 3 — visibility under CDP touch ──
  for (const vp of [{ w: 390, h: 844 }, { w: 360, h: 780 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: true });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setContent(pageFor(SRC), { waitUntil: "load" });
    const cdp = await ctx.newCDPSession(page);

    // no horizontal page overflow, and the grid fits its container (no internal scroll)
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const pageOverflow = doc.scrollWidth > doc.clientWidth + 1;
      const tbl = document.querySelectorAll(".pv-frame")[0].querySelector(".am-table");
      const wrap = document.querySelectorAll(".pv-frame")[0].querySelector(".am-wrap");
      const gridScrolls = tbl.scrollWidth > wrap.clientWidth + 1;
      return { pageOverflow, gridScrolls, tableW: Math.round(tbl.getBoundingClientRect().width), vw: window.innerWidth };
    });
    if (!overflow.pageOverflow && !overflow.gridScrolls)
      pass(`Guard 3 [${vp.w}] no horizontal overflow`, `grid ${overflow.tableW}px ≤ ${overflow.vw}px`);
    else fail(`Guard 3 [${vp.w}] no horizontal overflow`, JSON.stringify(overflow));

    // tap each cell input → it focuses and is inside the viewport
    const cells = await page.evaluate(() => document.querySelectorAll(".pv-frame")[0].querySelectorAll(".blank-input").length);
    let allTappable = true, detail = "";
    for (let i = 0; i < cells; i++) {
      const p = await page.evaluate((idx) => {
        const inp = document.querySelectorAll(".pv-frame")[0].querySelectorAll(".blank-input")[idx];
        inp.scrollIntoView({ block: "center" });
        const r = inp.getBoundingClientRect();
        const vis = r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= window.innerWidth + 0.5 && r.top < window.innerHeight;
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, vis };
      }, i);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p.x, y: p.y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(60);
      const focused = await page.evaluate((idx) => document.activeElement === document.querySelectorAll(".pv-frame")[0].querySelectorAll(".blank-input")[idx], i);
      if (!p.vis || !focused) { allTappable = false; detail += `cell ${i}: vis=${p.vis} focused=${focused}; `; }
    }
    if (allTappable) pass(`Guard 3 [${vp.w}] every cell input tappable + reachable`, `${cells} cells`);
    else fail(`Guard 3 [${vp.w}] every cell input tappable + reachable`, detail);

    // Check button reachable (scrollable into view, has size)
    const chk = await page.evaluate(() => {
      const c = document.querySelectorAll(".pv-frame")[0].querySelector(".pv-check");
      if (!c) return { ok: false };
      c.scrollIntoView({ block: "center" });
      const r = c.getBoundingClientRect();
      return { ok: r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight + 0.5 };
    });
    if (chk.ok) pass(`Guard 3 [${vp.w}] Check button reachable`);
    else fail(`Guard 3 [${vp.w}] Check button reachable`, JSON.stringify(chk));

    if (errors.length) fail(`${vp.w}: zero page errors`, errors.join(" | "));
    else pass(`${vp.w}: zero page errors`);
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "AREA MODEL: typed cells grade by position, no regression, reachable ✅" : C.r + failures + " check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-area-model crashed:", e); process.exit(1); });
