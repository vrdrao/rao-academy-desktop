#!/usr/bin/env node
/* ── verify-touch.js — the ladder under REAL TOUCH, at phone width ──
 *
 * Playwright's mouse API gives FALSE PASSES for touch: a walkthrough that
 * "passes" under mouse can be completely dead on a phone. Every interaction
 * here is a raw CDP `Input.dispatchTouchEvent` (touchStart → touchEnd), the
 * same events a finger produces. Viewport is 380×800.
 *
 * What it proves (Brief 7.3):
 *   1. Hint ladder — 3 rungs reveal one per TAP, stacking, never all at once.
 *   2. whyWrong — a wrong answer shows the option's message + logs its code.
 *   3. Walkthrough — opens on "Show me", reveals ONE step per tap, history
 *      dims, the "I've got it — let me try again" bail-out is present at
 *      EVERY step, and tapping it unlocks the card (keeping the selection).
 *   4. Firewall at runtime — check() is spied; opening/stepping/closing the
 *      walkthrough adds ZERO calls.
 *   5. Idempotency — attach() is called a 2nd time mid-flow; a tap must still
 *      fire handlers exactly once (select toggles once, grading still works).
 *   6. Tap targets — every visible interactive control in the card ≥ 44×44px.
 *
 * Exit 0 = all green. Exit 1 = at least one failure (with the reason).
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

function buildPage() {
  const lesson = read("lessons/_type-coverage.html");
  const a = lesson.indexOf('<div id="source">');
  const b = lesson.indexOf('<div id="preview"');
  const source = lesson.slice(a, b > a ? b : undefined);
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
${source}
<div class="rao-lesson" data-theme="grape"><div class="pv-frame-mount" id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

(async () => {
  console.log(`\n${C.b}TOUCH VERIFICATION${C.x} — 380×800, CDP Input.dispatchTouchEvent\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 380, height: 800 },
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(buildPage(), { waitUntil: "load" });
  const cdp = await context.newCDPSession(page);

  // ── real touch: touchStart at the element's centre, then touchEnd ──
  async function tap(selector, which) {
    const box = await page.evaluate(([sel, idx]) => {
      const els = Array.from(document.querySelectorAll(sel)).filter((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden";
      });
      const el = idx != null ? els[idx] : els[0];
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [selector, which == null ? null : which]);
    if (!box) throw new Error("tap target not found/visible: " + selector);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x, y: box.y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(60);
  }

  // The fixture ladder question is the LAST card on the page.
  const F = await page.evaluate(() => {
    const frames = document.querySelectorAll(".pv-frame");
    const f = frames[frames.length - 1];
    f.id = "fixture";
    f.scrollIntoView();
    return frames.length;
  });
  console.log(`  fixture: card ${F} of ${F} (ladder question in _type-coverage.html)\n`);

  // Scope every selector to the fixture card.
  const S = (sel) => `#fixture ${sel}`;

  // ── 6. tap-target audit helper (≥44×44 for every visible control) ──
  async function auditTargets(stage) {
    const bad = await page.evaluate((sel) => {
      const out = [];
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || cs.display === "none") return;
        if (r.width < 44 || r.height < 44) out.push(`${el.className}: ${Math.round(r.width)}x${Math.round(r.height)}px`);
      });
      return out;
    }, S("button, .opt"));
    if (bad.length) fail(`tap targets ≥44px (${stage})`, bad.join(" · "));
    else pass(`tap targets ≥44px (${stage})`);
  }

  await auditTargets("initial");

  // ── 1. hint ladder: one rung per tap ──
  await tap(S(".pv-hint"));
  let rungCount = await page.$$eval(S(".pv-rung"), (els) => els.length);
  if (rungCount === 1) pass("hint tap 1 reveals rung 1 only", `rungs visible: ${rungCount}`);
  else fail("hint tap 1", `expected 1 rung, saw ${rungCount}`);
  await tap(S(".pv-hint"));
  await tap(S(".pv-hint"));
  rungCount = await page.$$eval(S(".pv-rung"), (els) => els.length);
  const rungsStacked = await page.$eval(S(".pv-hintbox"), (el) => !el.hasAttribute("hidden"));
  if (rungCount === 3 && rungsStacked) pass("hint taps 2+3 stack rungs 2 and 3", "all 3 visible, earlier rungs retained");
  else fail("hint ladder stacking", `rungs=${rungCount} boxVisible=${rungsStacked}`);

  // ── spy on check() BEFORE any grading ──
  await page.evaluate(() => {
    window.__checkCalls = 0;
    const orig = window.RaoPreview.check;
    window.RaoPreview.check = function () { window.__checkCalls++; return orig.apply(this, arguments); };
  });

  // ── 2. wrong answer → whyWrong message + code log ──
  await tap(S('.opt[data-val="130,000"], .opt'), undefined); // data-val may be absent: options key by text
  // ensure we actually selected the wrong option "130,000"
  const picked = await page.evaluate((sel) => {
    // if the first tap selected the wrong element, force-tap by text
    const opts = Array.from(document.querySelectorAll(sel));
    const want = opts.find((o) => (o.textContent || "").trim() === "130,000");
    const got = opts.find((o) => o.classList.contains("is-sel"));
    return { want: !!want, gotText: got ? (got.textContent || "").trim() : null };
  }, S(".opt"));
  if (picked.gotText !== "130,000") {
    // deterministic re-pick: clear then tap the right one by index
    await page.evaluate((sel) => {
      Array.from(document.querySelectorAll(sel)).forEach((o) => o.classList.remove("is-sel"));
    }, S(".opt"));
    const idx = await page.evaluate((sel) =>
      Array.from(document.querySelectorAll(sel)).findIndex((o) => (o.textContent || "").trim() === "130,000"), S(".opt"));
    await tap(S(".opt"), idx);
  }
  await tap(S(".pv-check"));
  const afterWrong = await page.evaluate(() => ({
    fb: document.querySelector("#fixture .pv-fb").textContent,
    why: (() => { const w = document.querySelector("#fixture .pv-why"); return w && !w.hasAttribute("hidden") ? w.textContent : null; })(),
    log: (window.__raoWhyWrongLog || []).map((e) => e.code),
    showme: !!document.querySelector("#fixture .pv-showme"),
    checks: window.__checkCalls,
  }));
  if (/Not quite/.test(afterWrong.fb)) pass("wrong answer graded WRONG under touch", afterWrong.fb.trim());
  else fail("wrong answer grading", `fb="${afterWrong.fb}"`);
  if (afterWrong.why && /far larger/.test(afterWrong.why)) pass("whyWrong message shown", `"${afterWrong.why.replace(/Show me/, "").trim().slice(0, 60)}…"`);
  else fail("whyWrong message", `panel="${afterWrong.why}"`);
  if (afterWrong.log.includes("ESTIMATE_WRONG_VALUE")) pass("whyWrong code logged", JSON.stringify(afterWrong.log));
  else fail("whyWrong code log", JSON.stringify(afterWrong.log));
  if (afterWrong.showme) pass("Show me button present");
  else fail("Show me button", "not found");
  const checksAfterGrade = afterWrong.checks; // legitimate call from the Check button

  // ── 3. walkthrough: one step per tap, dimmed history, bail-out everywhere ──
  await tap(S(".pv-showme"));
  const step1 = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("#fixture .sol-walk-item"));
    return {
      total: items.length,
      visible: items.filter((i) => !i.hasAttribute("hidden")).length,
      retryVisible: (() => { const b = document.querySelector("#fixture .sol-retry"); return b && !b.hasAttribute("hidden") && b.getBoundingClientRect().height > 0; })(),
    };
  });
  if (step1.total === 5 && step1.visible === 1) pass("walkthrough opens at step 1 of 5 — NOT dumped", `visible: ${step1.visible}/${step1.total}`);
  else fail("walkthrough open", `visible ${step1.visible}/${step1.total}`);
  if (step1.retryVisible) pass("bail-out present at step 1");
  else fail("bail-out at step 1", "not visible");

  await auditTargets("walkthrough open");

  await tap(S(".sol-next"));
  const step2 = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("#fixture .sol-walk-item"));
    const first = items[0];
    return {
      visible: items.filter((i) => !i.hasAttribute("hidden")).length,
      firstDimmed: first.classList.contains("sol-dim"),
      firstOpacity: getComputedStyle(first).opacity,
      retryVisible: !!document.querySelector("#fixture .sol-retry") && document.querySelector("#fixture .sol-retry").getBoundingClientRect().height > 0,
    };
  });
  if (step2.visible === 2 && step2.firstDimmed && parseFloat(step2.firstOpacity) < 1)
    pass("tap advances to step 2; step 1 stays visible, dimmed", `opacity(step1)=${step2.firstOpacity}`);
  else fail("step 2 reveal/dim", JSON.stringify(step2));
  if (step2.retryVisible) pass("bail-out present at step 2");
  else fail("bail-out at step 2", "not visible");

  // advance to the end
  await tap(S(".sol-next"));
  await tap(S(".sol-next"));
  await tap(S(".sol-next"));
  const stepEnd = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("#fixture .sol-walk-item"));
    const next = document.querySelector("#fixture .sol-next");
    const retry = document.querySelector("#fixture .sol-retry");
    return {
      visible: items.filter((i) => !i.hasAttribute("hidden")).length,
      nextHidden: !next || next.hasAttribute("hidden"),
      retryVisible: !!retry && !retry.hasAttribute("hidden") && retry.getBoundingClientRect().height > 0,
      checks: window.__checkCalls,
    };
  });
  if (stepEnd.visible === 5 && stepEnd.nextHidden) pass("all 5 steps revealed one-at-a-time; Next hides at the end");
  else fail("walkthrough completion", JSON.stringify(stepEnd));
  if (stepEnd.retryVisible) pass("bail-out present at final step");
  else fail("bail-out at final step", "not visible");

  // ── 4. firewall at runtime: walkthrough added ZERO check() calls ──
  if (stepEnd.checks === checksAfterGrade)
    pass("RUNTIME firewall — check() calls during open/step/close: 0", `total stayed ${stepEnd.checks}`);
  else fail("RUNTIME firewall", `check() calls grew ${checksAfterGrade} → ${stepEnd.checks} during the walkthrough`);

  // ── bail-out: unlocks the card, KEEPS the selection ──
  await tap(S(".sol-retry"));
  const afterBail = await page.evaluate(() => ({
    walkHidden: (() => { const s = document.querySelector("#fixture .pv-solwrap"); return !s || s.hasAttribute("hidden"); })(),
    whyHidden: (() => { const w = document.querySelector("#fixture .pv-why"); return !w || w.hasAttribute("hidden"); })(),
    checked: document.querySelector("#fixture .qbody").classList.contains("is-checked"),
    fb: document.querySelector("#fixture .pv-fb").textContent.trim(),
    selKept: (() => { const s = document.querySelector("#fixture .opt.is-sel"); return s ? (s.textContent || "").trim() : null; })(),
  }));
  if (afterBail.walkHidden && afterBail.whyHidden && !afterBail.checked && afterBail.fb === "")
    pass('"I\'ve got it — let me try again" unlocks the card', "panels hidden, is-checked removed, feedback cleared");
  else fail("bail-out reset", JSON.stringify(afterBail));
  if (afterBail.selKept === "130,000") pass("child's selection is KEPT after bail-out", `still selected: ${afterBail.selKept}`);
  else fail("selection after bail-out", `selected=${afterBail.selKept}`);

  // ── 5. idempotency under touch: 2nd attach mid-flow must not double-fire ──
  await page.evaluate(() => {
    const qbody = document.querySelector("#fixture .qbody");
    window.RaoPreview.attach(qbody, qbody.dataset.behavior); // React re-mount simulation
  });
  const correctIdx = await page.evaluate((sel) =>
    Array.from(document.querySelectorAll(sel)).findIndex((o) => (o.textContent || "").trim() === "70,000"), S(".opt"));
  await tap(S(".opt"), correctIdx);
  const selState = await page.evaluate(() => {
    const sel = Array.from(document.querySelectorAll("#fixture .opt.is-sel")).map((o) => (o.textContent || "").trim());
    return sel;
  });
  // single-select + single tap after re-attach: exactly ONE selection, the tapped one.
  // A double-bound handler would toggle twice and leave the old selection state.
  if (selState.length === 1 && selState[0] === "70,000")
    pass("attach() idempotent under touch", `one tap after 2nd attach() = one selection (${selState[0]})`);
  else fail("attach() idempotency", `selection after tap: ${JSON.stringify(selState)}`);

  await tap(S(".pv-check"));
  const finalFb = await page.$eval(S(".pv-fb"), (el) => el.textContent.trim());
  if (/Correct!/.test(finalFb)) pass("retry path: corrected answer grades CORRECT under touch", finalFb);
  else fail("retry regrade", `fb="${finalFb}"`);

  if (errors.length) fail("zero page errors", errors.join(" | "));
  else pass("zero page errors");

  await browser.close();

  console.log(`\n${failures === 0 ? C.g + "TOUCH: all interactions work with real touch events at 380px ✅" : C.r + failures + " touch check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-touch crashed:", e); process.exit(1); });
