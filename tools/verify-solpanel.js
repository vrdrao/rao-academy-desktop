#!/usr/bin/env node
/* ── verify-solpanel.js — BRIEF-G3-ENGINE-1 fixture ──
 *
 * Guards the five changes to the shared answering loop and the three new
 * solution block types (table / facts / rule). Real CDP touch for the
 * behavioural half; direct renderer calls + getBoundingClientRect for the
 * render half. Viewport 390×844 (retested at 360×780 for the visibility law).
 *
 * DOM CONTRACT the renderer must satisfy (asserted below, so it cannot drift):
 *   table  → [<p class="sol-note">]
 *            <div class="sol-tables[ sol-tables-2]">
 *              <div class="sol-table">
 *                <div class="sol-row[ sol-mark]"><span class="sol-eq">a × b = p</span></div>
 *                <div class="sol-absent"><span class="sol-eq">v is not here</span></div>
 *              </div> …1 or 2 tables…
 *            </div>
 *            [<p class="sol-foot">]
 *   facts  → [<p class="sol-note">] <div class="sol-facts"> …sol-row… </div> [<p class="sol-foot">]
 *   rule   → <div class="sol-rule"><p class="sol-note">text</p>[ sol-row sol-mark example ]</div>
 *   every product is COMPUTED by the renderer; a frontmatter product is ignored.
 *   an invalid block renders "" and pushes to window.__raoSolWarn.
 *
 * Exit 0 = all green. Exit 1 = at least one failure.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", x: "\x1b[0m" };
let failures = 0;
function pass(n, d) { console.log(`  ${C.g}PASS${C.x}  ${n}${d ? " — " + d : ""}`); }
function fail(n, d) { failures++; console.log(`  ${C.r}FAIL${C.x}  ${n} — ${d}`); }
const FILL_WAIT = 850;   // > BUBBLE_FILL_MS (650)

// ── injected behavioural fixtures (TEST-SIDE only, never a lesson) ──
// FX1: whyWrong + a table solution + explain — wrong-path assertions 1,2,3.
// FX2: identical — correct-path assertions 4,5.
// FX3: whyWrong, NO solution — cap-out to shown-answer (assertion 6, Item 50).
// FX4: whyWrong + solution — two wrong AUTO-OPENS the walkthrough (assertion 6, with-solution half).
const FIX = `
<!--@q
type: single-select
answer: ["8"]
hint:
  - "FX1 rung one."
  - "FX1 rung two."
whyWrong:
  "6":
    code: FX1_SIX
    message: "FX1 six is wrong."
solution:
  - type: table
    tables:
      - factor: 8
        upTo: 2
        mark: [1]
explain: FX1 explain.
-->
<div class="question" data-type="single-select">
  <p class="prompt">FX1 pick 8</p>
  <ul class="options"><li>8</li><li>6</li><li>9</li></ul>
</div>

<!--@q
type: single-select
answer: ["8"]
whyWrong:
  "6":
    code: FX2_SIX
    message: "FX2 six is wrong."
solution:
  - type: table
    tables:
      - factor: 8
        upTo: 2
        mark: [1]
  - type: takeaway
    text: FX2 takeaway line.
explain: FX2 explain.
-->
<div class="question" data-type="single-select">
  <p class="prompt">FX2 pick 8</p>
  <ul class="options"><li>8</li><li>6</li><li>9</li></ul>
</div>

<!--@q
type: single-select
answer: ["8"]
whyWrong:
  "6":
    code: FX3_SIX
    message: "FX3 six is wrong."
-->
<div class="question" data-type="single-select">
  <p class="prompt">FX3 pick 8, no solution</p>
  <ul class="options"><li>8</li><li>6</li><li>9</li></ul>
</div>

<!--@q
type: single-select
answer: ["8"]
whyWrong:
  "6":
    code: FX4_SIX
    message: "FX4 six is wrong."
solution:
  - type: table
    tables:
      - factor: 8
        upTo: 2
        mark: [1]
explain: FX4 explain.
-->
<div class="question" data-type="single-select">
  <p class="prompt">FX4 pick 8, has solution</p>
  <ul class="options"><li>8</li><li>6</li><li>9</li></ul>
</div>

<!--@q
type: single-select
answer: ["8"]
solution:
  - type: table
    tables:
      - factor: 8
        upTo: 2
        mark: [1]
explain: FX5 explain.
-->
<div class="question" data-type="single-select">
  <p class="prompt">FX5 pick 8, visibility fixture</p>
  <ul class="options"><li>8</li><li>6</li><li>9</li></ul>
</div>
`;

function buildPage() {
  const lesson = read("lessons/_type-coverage.html");
  const a = lesson.indexOf('<div id="source">');
  const b = lesson.indexOf('<div id="preview"');
  const source = lesson.slice(a, b > a ? b : undefined)
    .replace('<div id="source">', '<div id="source">' + FIX);
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
${source}
<div class="rao-lesson" data-theme="grape"><div class="pv-frame-mount" id="preview"></div></div>
<div class="rao-lesson" data-theme="grape"><div id="renderharness" style="padding:16px"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

(async () => {
  console.log(`\n${C.b}SOLUTION-PANEL VERIFICATION${C.x} — BRIEF-G3-ENGINE-1 (5 changes + table/facts/rule)\n`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(buildPage(), { waitUntil: "load" });
  const cdp = await context.newCDPSession(page);

  async function tapAt(box) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x, y: box.y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(70);
  }
  // resolve coords of the first visible element in frame[k] matching `sub` (and optional label re)
  async function coordsOf(fxIdx, sub, re) {
    return page.evaluate(([k, s, src, flags]) => {
      const f = document.querySelectorAll(".pv-frame")[k]; if (!f) return null;
      let els = Array.from(f.querySelectorAll(s)).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; });
      if (src) { const rx = new RegExp(src, flags); els = els.filter((b) => rx.test(b.textContent || "")); }
      const el = els[0]; if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [fxIdx, sub, re ? re.source : null, re ? re.flags : ""]);
  }
  async function tapOpt(fxIdx, val) {
    const box = await page.evaluate(([k, v]) => {
      const f = document.querySelectorAll(".pv-frame")[k];
      const o = Array.from(f.querySelectorAll(".opt")).find((o) => (o.dataset.val || o.textContent || "").trim() === v);
      if (!o) return null; o.scrollIntoView({ block: "center" });
      const r = o.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [fxIdx, val]);
    if (!box) throw new Error(`opt "${val}" not found in FX${fxIdx}`);
    await tapAt(box);
  }
  async function tapCheck(fxIdx) { const box = await coordsOf(fxIdx, ".pv-check"); if (!box) throw new Error("no Check in FX" + fxIdx); await tapAt(box); }
  // tap a row/hint button by label; returns false (does NOT throw) when absent — pre-fix RED must not crash
  async function tapRowBtn(fxIdx, re) { const box = await coordsOf(fxIdx, ".cc-actions button, .pv-hint", re); if (!box) return false; await tapAt(box); return true; }
  const stateOf = (k) => page.evaluate((idx) => {
    const f = document.querySelectorAll(".pv-frame")[idx];
    const qb = f.querySelector(".qbody");
    return {
      // hint/whyWrong stream only — the walkthrough panel's own step bubbles
      // live inside .pv-solwrap and must not be counted as accumulated hints.
      chips: [...f.querySelectorAll(".cc-schip")].filter((c) => !c.closest(".pv-solwrap")).map((c) => c.textContent),
      bubbles: [...f.querySelectorAll(".cc-msg")].filter((m) => !m.closest(".pv-solwrap")).length,
      rowBtns: [...f.querySelectorAll(".cc-actions button")].map((b) => b.textContent),
      hasWalk: !!f.querySelector(".sol-walk"),
      hasTake: !!f.querySelector(".cc-take"),
      hasShown: !!f.querySelector(".cc-shown"),
      hastake: qb.classList.contains("cc-hastake"),
      winPaint: !!f.querySelector(".cc-win"),
      explainVis: (() => { const e = qb.querySelector(".explain"); return e ? getComputedStyle(e).display !== "none" : null; })(),
      outcome: f.dataset.raoOutcome || null,
      qbodyId: qb.__id || (qb.__id = "qb" + Math.random().toString(36).slice(2)),
    };
  }, k);

  // FX indices: injected 4 are frames 0..3; real _type-coverage frames follow.
  const FX1 = 0, FX2 = 1, FX3 = 2, FX4 = 3;

  // ════════ ASSERTION 2 — no whyWrong; the hint fallback speaks ════════
  // AMENDED 2026-07-24 (BRIEF-WHYWRONG-OFF-1, ruled by Venkat): whyWrong is
  // SWITCHED OFF product-wide — the old assertion ("Not quite" chip appears,
  // numbering not consumed) is replaced by the stronger claim: NO "Not quite"
  // chip / .cc-msg-why ever exists; the wrong types "Hint 1" (the forward
  // rung), which DOES consume a hint number. Do not restore the old assertions
  // without a new dated ruling.
  await tapOpt(FX1, "6"); await tapCheck(FX1);
  await page.waitForTimeout(FILL_WAIT);
  let s = await stateOf(FX1);
  if (s.chips[0] === "Hint 1" && !s.chips.includes("Not quite")) pass("2. wrong types 'Hint 1' — no 'Not quite' chip (WHYWRONG-OFF)", `chips ${JSON.stringify(s.chips)}`);
  else fail("2. wrong-attempt hint fallback (BRIEF-WHYWRONG-OFF-1)", `chips=${JSON.stringify(s.chips)}`);
  // then request one hint — the NEW bubble must read Hint 2 (numbering continues)
  await tapRowBtn(FX1, /hint/i);
  await page.waitForTimeout(FILL_WAIT);
  s = await stateOf(FX1);
  if (s.chips[1] === "Hint 2") pass("2. next hint reads 'Hint 2' (numbering consecutive)", `chips ${JSON.stringify(s.chips)}`);
  else fail("2. hint numbering consecutive", `chips=${JSON.stringify(s.chips)} — expected chips[1]='Hint 2'`);

  // ════════ ASSERTION 1 — label + ASSERTION 3 — bubbles clear ════════
  // FX1's 2-rung ladder is now exhausted (auto rung + manual rung), so the
  // walkthrough is already offered — no further hint tap needed (AMENDED by
  // BRIEF-WHYWRONG-OFF-1; the old drive spent a third tap here).
  const beforeBubbles = s.bubbles, beforeQid = s.qbodyId;
  if (s.rowBtns.some((t) => /Show me the solution/.test(t))) pass("1. offered button reads 'Show me the solution'", s.rowBtns.join(" / "));
  else fail("1. label 'Show me the solution'", `rowBtns=${JSON.stringify(s.rowBtns)}`);
  if (!s.rowBtns.some((t) => /Walk me through it/.test(t))) pass("1. old label 'Walk me through it' absent from the row");
  else fail("1. old label gone", `rowBtns=${JSON.stringify(s.rowBtns)}`);
  // open it → bubbles must clear, qbody must be the same node
  const opened = await tapRowBtn(FX1, /Show me the solution/);
  await page.waitForTimeout(FILL_WAIT);
  s = await stateOf(FX1);
  if (opened && beforeBubbles > 0 && s.bubbles === 0) pass("3. hint/whyWrong bubbles cleared when the solution opened", `${beforeBubbles} → 0`);
  else fail("3. bubbles clear", `opened=${opened} before=${beforeBubbles} after=${s.bubbles}`);
  if (opened && s.qbodyId === beforeQid) pass("3. question body is the SAME node (no repaint)", beforeQid);
  else fail("3. no repaint", `opened=${opened} qbody ${beforeQid} → ${s.qbodyId}`);

  // ════════ ASSERTION 4 — correct path is quiet ════════
  await tapOpt(FX2, "8"); await tapCheck(FX2);
  await page.waitForTimeout(FILL_WAIT + 200);   // > celebrate 550ms beat
  s = await stateOf(FX2);
  if (!s.hasTake) pass("4. correct path renders NO .cc-take panel");
  else fail("4. no .cc-take on correct", "panel present");
  if (s.explainVis === false) pass("4. .explain stays suppressed on correct", "display:none");
  else fail("4. .explain suppressed", `explainVis=${s.explainVis}`);
  if (s.hastake) pass("4. cc-hastake IS present on qbody (keeps .explain sealed)");
  else fail("4. cc-hastake present", "missing — .explain would reappear");
  if (s.winPaint) pass("4. .cc-win green paint present (correct stays loud)");
  else fail("4. .cc-win present", "missing");

  // ════════ ASSERTION 5 — reveal works, outcome preserved ════════
  if (s.rowBtns.some((t) => /Show me the solution/.test(t))) pass("5. correct path offers 'Show me the solution'", s.rowBtns.join(" / "));
  else fail("5. correct offers reveal", JSON.stringify(s.rowBtns));
  const revealed = await tapRowBtn(FX2, /Show me the solution/);
  await page.waitForTimeout(FILL_WAIT);
  s = await stateOf(FX2);
  if (revealed && s.hasWalk) pass("5. tapping it renders the full solution");
  else fail("5. reveal renders solution", `revealed=${revealed} hasWalk=${s.hasWalk}`);
  if (s.outcome === "correct") pass("5. outcome is STILL 'correct', not 'solved-with-help'", `outcome=${s.outcome}`);
  else fail("5. outcome preserved", `outcome=${s.outcome}`);

  // ════════ ASSERTION 6 — cap-out unchanged ════════
  // FX3 (no solution): two wrong → shown-answer, Next, no Try again.
  await tapOpt(FX3, "6"); await tapCheck(FX3); await page.waitForTimeout(FILL_WAIT);
  await tapRowBtn(FX3, /Try again/);
  await page.waitForTimeout(200);
  await tapOpt(FX3, "6"); await tapCheck(FX3); await page.waitForTimeout(FILL_WAIT);
  s = await stateOf(FX3);
  if (s.hasShown && s.outcome === "shown-answer" && s.rowBtns.some((t) => /Next question/.test(t)) && !s.rowBtns.some((t) => /Try again/.test(t)))
    pass("6. no-solution cap → shown-answer, Next, no Try again (Item 50 intact)", `outcome=${s.outcome}`);
  else fail("6. cap-out shown-answer", JSON.stringify(s));
  // FX4 (has solution): two wrong → walkthrough auto-opens, solved-with-help.
  await tapOpt(FX4, "6"); await tapCheck(FX4); await page.waitForTimeout(FILL_WAIT);
  await tapRowBtn(FX4, /Try again/);
  await page.waitForTimeout(200);
  await tapOpt(FX4, "6"); await tapCheck(FX4); await page.waitForTimeout(FILL_WAIT);
  s = await stateOf(FX4);
  if (s.hasWalk && s.outcome === "solved-with-help" && !s.rowBtns.some((t) => /Try again/.test(t)))
    pass("6. with-solution cap → walkthrough auto-opens, solved-with-help", `outcome=${s.outcome}`);
  else fail("6. cap-out auto-walkthrough", JSON.stringify(s));

  // ════════ RENDER TESTS — table / facts / rule via the renderer directly ════════
  // Inject renderSolution output into #renderharness and measure the real DOM.
  async function render(sol) {
    return page.evaluate((solution) => {
      window.__raoSolWarn = [];
      const h = document.getElementById("renderharness");
      h.innerHTML = window.RaoSolution.renderSolution({ explain: null, solution: solution });
      const rows = [...h.querySelectorAll(".sol-row")].map((r) => ({ text: r.textContent.trim(), mark: r.classList.contains("sol-mark"), x: Math.round(r.querySelector(".sol-eq") ? r.querySelector(".sol-eq").getBoundingClientRect().left : r.getBoundingClientRect().left) }));
      const absent = [...h.querySelectorAll(".sol-absent")].map((r) => ({ text: r.textContent.trim(), x: Math.round(r.querySelector(".sol-eq") ? r.querySelector(".sol-eq").getBoundingClientRect().left : r.getBoundingClientRect().left) }));
      return {
        html: h.innerHTML,
        rows, absent,
        tables: h.querySelectorAll(".sol-table").length,
        pair: !!h.querySelector(".sol-tables-2"),
        note: (h.querySelector(".sol-note") || {}).textContent || null,
        foot: (h.querySelector(".sol-foot") || {}).textContent || null,
        rule: !!h.querySelector(".sol-rule"),
        warn: window.__raoSolWarn.length,
      };
    }, sol);
  }

  // Shape 1 — one table
  let r = await render([{ type: "table", tables: [{ factor: 6, upTo: 5, mark: [5] }] }]);
  if (r.rows.length === 5 && r.rows[4].text === "6 × 5 = 30") pass("Shape 1 — 5 rows, last '6 × 5 = 30'", r.rows.map((x) => x.text).join(" | "));
  else fail("Shape 1 rows", JSON.stringify(r.rows));
  if (r.rows.filter((x) => x.mark).length === 1 && r.rows[4].mark) pass("Shape 1 — only the marked row carries .sol-mark");
  else fail("Shape 1 mark", JSON.stringify(r.rows.map((x) => x.mark)));

  // Shape 2 — two tables side by side + footer
  r = await render([{ type: "table", tables: [{ factor: 7, upTo: 8, mark: [8] }, { factor: 9, upTo: 6, mark: [6] }], footer: "7 × 8 = 56 beats 9 × 6 = 54." }]);
  if (r.tables === 2 && r.pair) pass("Shape 2 — two .sol-table side by side (.sol-tables-2)");
  else fail("Shape 2 two tables", JSON.stringify({ tables: r.tables, pair: r.pair }));
  if (r.foot && /beats/.test(r.foot)) pass("Shape 2 — footer renders below", r.foot);
  else fail("Shape 2 footer", JSON.stringify(r.foot));

  // Shape 3 — two absent lines on factor 8 upTo 7
  r = await render([{ type: "table", tables: [{ factor: 8, upTo: 7, mark: [3, 6], absent: [{ after: 3, value: 30 }, { after: 6, value: 54 }] }] }]);
  if (r.rows.length === 7) pass("Shape 3 — 7 table rows (absent lines NOT counted)", `rows=${r.rows.length}`);
  else fail("Shape 3 row count", `rows=${r.rows.length}`);
  if (r.absent.length === 2 && /30 is not here/.test(r.absent[0].text) && /54 is not here/.test(r.absent[1].text))
    pass("Shape 3 — two absent lines, correct text", r.absent.map((x) => x.text).join(" | "));
  else fail("Shape 3 absent", JSON.stringify(r.absent));

  // Shape 4 — facts
  r = await render([{ type: "facts", items: [[2, 3], [4, 4], [3, 8], [6, 6]], footer: "Smallest to largest: 6, 16, 24, 36." }]);
  if (r.rows.length === 4 && r.rows.map((x) => x.text).join("|") === "2 × 3 = 6|4 × 4 = 16|3 × 8 = 24|6 × 6 = 36")
    pass("Shape 4 — four facts, products computed", r.rows.map((x) => x.text).join(" | "));
  else fail("Shape 4 facts", JSON.stringify(r.rows));
  if (r.foot) pass("Shape 4 — footer below", r.foot); else fail("Shape 4 footer", "missing");

  // Shape 5 — rule with a 0 operand
  r = await render([{ type: "rule", text: "Any number times zero is zero.", example: [9, 0] }]);
  if (r.rule && r.note === "Any number times zero is zero.") pass("Shape 5 — rule sentence renders", r.note);
  else fail("Shape 5 rule text", JSON.stringify({ rule: r.rule, note: r.note }));
  if (r.rows.length === 1 && r.rows[0].text === "9 × 0 = 0") pass("Shape 5 — example '9 × 0 = 0' (0 operand accepted in rule)", r.rows[0].text);
  else fail("Shape 5 rule example", JSON.stringify(r.rows));
  // 0 operand REJECTED in table and facts
  r = await render([{ type: "table", tables: [{ factor: 9, upTo: 0, mark: [0] }] }]);
  if (r.rows.length === 0 && r.warn >= 1) pass("Shape 5 — 0 rejected by table (renders nothing, warns)");
  else fail("Shape 5 table rejects 0", JSON.stringify({ rows: r.rows.length, warn: r.warn }));
  r = await render([{ type: "facts", items: [[9, 0]] }]);
  if (r.rows.length === 0 && r.warn >= 1) pass("Shape 5 — 0 rejected by facts (renders nothing, warns)");
  else fail("Shape 5 facts rejects 0", JSON.stringify({ rows: r.rows.length, warn: r.warn }));

  // Invalid — factor 0, and mark index out of range; surrounding solution still renders
  r = await render([{ type: "table", tables: [{ factor: 0, upTo: 3, mark: [1] }] }, { type: "facts", items: [[2, 2]], mark: [9] }, { type: "facts", items: [[5, 5]] }]);
  if (r.warn >= 2) pass("Invalid — two invalid blocks reported (window.__raoSolWarn)", `warns=${r.warn}`);
  else fail("Invalid reported", `warns=${r.warn}`);
  if (r.rows.some((x) => x.text === "5 × 5 = 25")) pass("Invalid — the surrounding valid block still renders", "5 × 5 = 25 present");
  else fail("Invalid — surrounding renders", JSON.stringify(r.rows));

  // Product ignored — author a wrong pre-computed product; engine value must win
  r = await render([{ type: "facts", items: [[7, 6]], product: 99, footer: "" }]);
  if (r.rows.length === 1 && r.rows[0].text === "7 × 6 = 42") pass("Product-in-frontmatter IGNORED — engine computes 42, not 99", r.rows[0].text);
  else fail("Product ignored", JSON.stringify(r.rows));

  // Alignment — marked + unmarked rows begin at the same x
  r = await render([{ type: "table", tables: [{ factor: 8, upTo: 4, mark: [3] }] }]);
  const xs = r.rows.map((x) => x.x);
  if (xs.length === 4 && new Set(xs).size === 1) pass("Alignment — every row's text begins at the same x", `x=${xs[0]} (all)`);
  else fail("Alignment", `xs=${JSON.stringify(xs)} — rows do not line up`);

  // ════════ VISIBILITY LAW — 'Show me the solution' reachable after real touch ════════
  // FX5 is a fresh correct-path fixture whose reveal button is NOT tapped away.
  const FX5 = 4;
  await tapOpt(FX5, "8"); await tapCheck(FX5);
  await page.waitForTimeout(FILL_WAIT + 200);
  for (const vp of [{ w: 390, h: 844 }, { w: 360, h: 780 }]) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.waitForTimeout(150);
    const vis = await page.evaluate((k) => {
      const f = document.querySelectorAll(".pv-frame")[k];
      const btn = [...f.querySelectorAll(".cc-actions button")].find((b) => /Show me the solution/.test(b.textContent || ""));
      if (!btn) return { found: false };
      btn.scrollIntoView({ block: "center" });
      const r = btn.getBoundingClientRect();
      return { found: true, visible: r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight + 2, top: Math.round(r.top), h: Math.round(r.height) };
    }, FX5);
    if (vis.found && vis.visible && vis.h >= 44) pass(`Visibility — 'Show me the solution' visible & ≥44px at ${vp.w}×${vp.h}`, `top=${vis.top} h=${vis.h}`);
    else fail(`Visibility at ${vp.w}×${vp.h}`, JSON.stringify(vis));
  }

  if (errors.length) fail("zero page errors", errors.slice(0, 3).join(" | "));
  else pass("zero page errors");

  await browser.close();
  console.log(`\n${failures === 0 ? C.g + C.b + "SOLUTION-PANEL: all green ✅" : C.r + C.b + failures + " assertion(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-solpanel crashed:", e); process.exit(1); });
