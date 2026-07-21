#!/usr/bin/env node
/* ── verify-no-dead-end.js — Item 50: two wrong attempts, never a dead end ──
 *
 * BRIEF-PUBLISH-1 Task A. The two-wrong cap was correct ONLY where a walkthrough
 * exists (`&& canWalk()`); on the 83% of questions with no authored solution, a
 * second wrong answer fell through to "Try again" forever. commitCap() now caps
 * EVERY question: walkthrough where one exists, else reveal the answer.
 *
 * Guard 1 — NO DEAD END. A select question with NO solution, answered wrong
 *   twice, must end LOCKED with the correct option revealed, a "Next question →"
 *   control present, a shown-answer panel, outcome "shown-answer" — and CRUCIALLY
 *   NO "Try again" control (that residual retry IS the defect).
 *
 * Guard 2 — WALKTHROUGH UNCHANGED. A select question WITH a solution, answered
 *   wrong twice, must still open the walkthrough (.sol-walk) and record
 *   outcome "solved-with-help", with NO shown-answer panel and NO "Try again".
 *   The regression guard on the minority that already worked.
 *
 * A5 VISIBILITY — after the second wrong attempt at 390×844 and 360×780, driven
 *   with real CDP touch, the revealed answer and the Next control are visible
 *   inside the viewport (scrolled into view first).
 *
 * Fixtures are injected TEST-SIDE (never into a lesson file), two select cards —
 * one without a solution, one with — each with NO hint/whyWrong so the wrong
 * path commits deterministically without a typing bubble.
 *
 * Exit 0 = no dead ends and the walkthrough path is intact. Exit 1 = otherwise.
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

function sourceOf(file) {
  const html = fs.readFileSync(file, "utf8");
  const a = html.indexOf('<div id="source">');
  const b = html.indexOf('<div id="preview"');
  return html.slice(a, b > a ? b : undefined);
}
function pageFor(source) {
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
${source}
<div class="rao-lesson" data-theme="grape"><div id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

// idx 0 = NO solution (fallback path); idx 1 = WITH solution (walkthrough path)
const FIXTURES = `
<!--@q
type: single-select
answer: ["9"]
description: no-dead-end fixture — select, NO solution (Item 50 fallback)
-->
<div class="question" data-type="single-select">
  <p class="prompt">Item 50 fixture (no solution): what is 4 + 5?</p>
  <ul class="options"><li>8</li><li>9</li><li>10</li></ul>
</div>

<!--@q
type: single-select
answer: ["9"]
solution:
  - type: step
    goal: Add the groups.
    working: "4 + 5 = 9"
  - type: takeaway
    text: Count on from the bigger number.
description: no-dead-end fixture — select WITH solution (walkthrough path)
-->
<div class="question" data-type="single-select">
  <p class="prompt">Item 50 fixture (with solution): what is 4 + 5?</p>
  <ul class="options"><li>8</li><li>9</li><li>10</li></ul>
</div>
`;

function buildSource() {
  return sourceOf(path.join(ROOT, "lessons", "_type-coverage.html"))
    .replace('<div id="source">', '<div id="source">' + FIXTURES);
}

const stateOf = (page, idx) => page.evaluate((k) => {
  const f = document.querySelectorAll(".pv-frame")[k];
  const qb = f.querySelector(".qbody");
  const btns = [...f.querySelectorAll(".cc-actions button")].map((b) => b.textContent.trim());
  return {
    locked: qb.classList.contains("cc-locked"),
    isChecked: qb.classList.contains("is-checked"),
    correctShown: !!f.querySelector(".opt.is-correct, .opt-fig.is-correct, .hcell.is-correct"),
    hasShownPanel: !!f.querySelector(".cc-shown"),
    hasWalk: !!f.querySelector(".sol-walk"),
    buttons: btns,
    hasTryAgain: btns.some((t) => /try again/i.test(t)),
    hasNext: btns.some((t) => /next question/i.test(t)),
    outcome: f.dataset.raoOutcome || null,
  };
}, idx);

// Drive one wrong attempt via DOM click: select a wrong option, press Check.
const wrongOnce = (page, idx) => page.evaluate((k) => {
  const f = document.querySelectorAll(".pv-frame")[k];
  const opts = [...f.querySelectorAll(".opt")];
  const wrong = opts.find((o) => (o.dataset.val || o.textContent).trim() !== "9") || opts[0];
  wrong.click();
  f.querySelector(".pv-check").click();
}, idx);
const clickTryAgain = (page, idx) => page.evaluate((k) => {
  const f = document.querySelectorAll(".pv-frame")[k];
  const b = [...f.querySelectorAll(".cc-actions button")].find((x) => /try again/i.test(x.textContent));
  if (b) b.click();
  return !!b;
}, idx);

async function wrongTwiceClick(page, idx) {
  await wrongOnce(page, idx);
  await page.waitForTimeout(400);
  await clickTryAgain(page, idx);
  await page.waitForTimeout(200);
  await wrongOnce(page, idx);
  await page.waitForTimeout(500);
}

(async () => {
  console.log(`\n${C.b}NO DEAD END${C.x} — Item 50: two wrong attempts cap every question\n`);
  const browser = await chromium.launch();

  // ── Guards 1 & 2 (functional, desktop) ──
  {
    const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setContent(pageFor(buildSource()), { waitUntil: "load" });

    // Guard 1 — no-solution fixture (frame 0)
    await wrongTwiceClick(page, 0);
    const s1 = await stateOf(page, 0);
    const g1ok = s1.locked && s1.correctShown && s1.hasNext && s1.hasShownPanel &&
                 s1.outcome === "shown-answer" && !s1.hasTryAgain;
    if (g1ok) pass("Guard 1 — no dead end", `locked, answer revealed, "Next question →" present, outcome=${s1.outcome}, NO Try again`);
    else fail("Guard 1 — no dead end", `locked=${s1.locked} correctShown=${s1.correctShown} next=${s1.hasNext} shownPanel=${s1.hasShownPanel} outcome=${s1.outcome} tryAgain=${s1.hasTryAgain} buttons=${JSON.stringify(s1.buttons)}`);

    // Guard 2 — with-solution fixture (frame 1): walkthrough path unchanged
    await wrongTwiceClick(page, 1);
    const s2 = await stateOf(page, 1);
    const g2ok = s2.locked && s2.hasWalk && s2.outcome === "solved-with-help" &&
                 !s2.hasShownPanel && !s2.hasTryAgain;
    if (g2ok) pass("Guard 2 — walkthrough unchanged", `locked, .sol-walk present, outcome=${s2.outcome}, NO shown-answer panel, NO Try again`);
    else fail("Guard 2 — walkthrough unchanged", `locked=${s2.locked} walk=${s2.hasWalk} outcome=${s2.outcome} shownPanel=${s2.hasShownPanel} tryAgain=${s2.hasTryAgain} buttons=${JSON.stringify(s2.buttons)}`);

    if (errors.length) fail("desktop: zero page errors", errors.join(" | "));
    else pass("desktop: zero page errors");
    await page.close();
  }

  // ── A5 visibility (CDP touch) at two phone sizes, no-solution fixture ──
  for (const vp of [{ w: 390, h: 844 }, { w: 360, h: 780 }]) {
    const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setContent(pageFor(buildSource()), { waitUntil: "load" });
    const cdp = await context.newCDPSession(page);

    const centerOf = (idx, sel, sub) => page.evaluate(([k, s, si]) => {
      const f = document.querySelectorAll(".pv-frame")[k];
      const els = [...f.querySelectorAll(s)].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const el = els[si || 0]; if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [idx, sel, sub || 0]);
    async function tap(idx, sel, sub) {
      const p = await centerOf(idx, sel, sub);
      if (!p) throw new Error("tap target not found: " + sel);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p.x, y: p.y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(90);
    }

    // wrong twice via touch (frame 0): tap wrong option (idx 0 = "8"), tap Check,
    // tap Try again, repeat.
    await tap(0, ".opt", 0); await tap(0, ".pv-check", 0); await page.waitForTimeout(400);
    await tap(0, ".cc-actions button", 0); await page.waitForTimeout(200);   // Try again
    await tap(0, ".opt", 0); await tap(0, ".pv-check", 0); await page.waitForTimeout(500);

    const vis = await page.evaluate(() => {
      const f = document.querySelectorAll(".pv-frame")[0];
      const vw = window.innerWidth, vh = window.innerHeight;
      const inView = (el) => { if (!el) return false; el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw; };
      const correct = f.querySelector(".opt.is-correct");
      const next = [...f.querySelectorAll(".cc-actions button")].find((b) => /next question/i.test(b.textContent));
      return { correctVisible: inView(correct), nextVisible: inView(next), locked: f.querySelector(".qbody").classList.contains("cc-locked") };
    });
    if (vis.locked && vis.correctVisible && vis.nextVisible)
      pass(`A5 visibility ${vp.w}×${vp.h}`, "revealed answer + Next control visible in viewport");
    else fail(`A5 visibility ${vp.w}×${vp.h}`, JSON.stringify(vis));

    if (errors.length) fail(`${vp.w}: zero page errors`, errors.join(" | "));
    else pass(`${vp.w}: zero page errors`);
    await context.close();
  }

  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "NO DEAD END: every question caps at two wrongs — answer shown, no loop ✅" : C.r + failures + " check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-no-dead-end crashed:", e); process.exit(1); });
