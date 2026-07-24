#!/usr/bin/env node
/* ── verify-whywrong-off.js — the whyWrong feature is SWITCHED OFF ──
   BRIEF-WHYWRONG-OFF-1, ruled by Venkat 2026-07-24.

   THE RULING: no child ever sees a whyWrong bubble or panel, in any mode.
   Authored content stays in the lesson files (Option A: hide, not delete);
   the invisible analytics stream (rao:whywrong event + __raoWhyWrongLog)
   KEEPS firing. Only the visible surfaces are dark.

   This guard drives a question that HAS an authored whyWrong entry and picks
   exactly the authored wrong option, then asserts:

     CALM path (adaptive + solution-renderer.js loaded):
       1. no .cc-msg-why bubble is EVER CREATED — not merely hidden. A
          MutationObserver armed before Check counts every node that appears
          with (or gains) the class; the count must stay 0.
       2. the hint fallback fires instead — a "Hint 1" bubble types (the same
          path the 1,365 no-whyWrong questions have always taken).
       3. the rao:whywrong event still fires and __raoWhyWrongLog still gets
          the code — analytics preserved.

     DEGRADED adaptive path (solution-renderer.js ABSENT):
       4. no .pv-why panel is ever created/shown.
       5. the rao:whywrong event still fires there too.

   Run:  node tools/verify-whywrong-off.js
   Exit 0 = whyWrong is dark everywhere, analytics alive. Non-zero = a child
   can see a whyWrong message — do not ship.
   ========================================================================== */
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

/* Real pipeline, exactly as verify-retry-state.js builds it. `degraded` drops
   solution-renderer.js so the card falls back to the legacy panel path. */
const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
function makePage(sourceInner, degraded) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
<div id="source">${sourceInner}</div>
<div class="rao-lesson" data-theme="grape"><div class="pv-frame-mount" id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
${degraded ? "" : `<script>${safe(read("engine/solution-renderer.js"))}</script>`}
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

/* Fixture: a select WITH an authored whyWrong on the option we will pick —
   TEST-SIDE only, never a lesson (the #111 shape, same as verify-retry-state
   FX_WHYWRONG). The hint exists so the fallback has a rung to type. */
const FX = `
<!--@q
id: wwoff-1
type: single-select
answer: ["54"]
hint: Count the nines one at a time.
whyWrong:
  "45":
    code: OFF_BY_ONE_NINE
    message: "That is 5 nines - count one more nine to reach six."
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 6 × 9?</p>
  <ul class="options"><li data-val="45">45</li><li data-val="54">54</li><li data-val="63">63</li></ul>
  <p class="explain">6 × 9 = 54.</p>
</div>`;

/* Arm BEFORE Check: a MutationObserver that counts every .cc-msg-why / .pv-why
   that is ever ADDED or gains the class (catches created-then-hidden, which a
   post-hoc querySelector would miss), plus the analytics listeners. */
const ARM = () => {
  window.__whySeen = 0;
  window.__whyEvents = [];
  const HIT = (n) => {
    if (!(n instanceof Element)) return;
    if (n.matches && (n.matches(".cc-msg-why, .pv-why") || n.querySelector(".cc-msg-why, .pv-why"))) window.__whySeen++;
  };
  const mo = new MutationObserver((mrs) => {
    for (const m of mrs) {
      if (m.type === "childList") m.addedNodes.forEach(HIT);
      else if (m.type === "attributes" && m.target instanceof Element &&
               m.target.matches(".cc-msg-why, .pv-why")) window.__whySeen++;
    }
  });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  document.addEventListener("rao:whywrong", (e) => window.__whyEvents.push(e.detail && e.detail.code), true);
};

async function waitForRetry(page, timeout) {
  const deadline = Date.now() + (timeout || 9000);
  for (;;) {
    const found = await page.evaluate(() =>
      [...document.querySelectorAll(".cc-actions button")].some(
        (b) => b.getBoundingClientRect().width > 0 && /try again/i.test(b.textContent || "")));
    if (found) return true;
    if (Date.now() > deadline) return false;
    await page.waitForTimeout(120);
  }
}
async function clickOption(page, val) {
  const box = await page.evaluate((v) => {
    const o = [...document.querySelectorAll(".opt")].find(
      (e) => String(e.dataset.val != null ? e.dataset.val : (e.textContent || "").trim()) === v);
    if (!o) return null;
    o.scrollIntoView({ block: "center" });
    const r = o.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, val);
  if (!box) throw new Error("option not found: " + val);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(80);
}
async function clickCheck(page) {
  const box = await page.evaluate(() => {
    const b = document.querySelector(".pv-check");
    b.scrollIntoView({ block: "center" });
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(120);
}

(async () => {
  console.log(`\n${C.b}══ verify-whywrong-off — no child sees a whyWrong, analytics alive (BRIEF-WHYWRONG-OFF-1) ══${C.x}`);
  const browser = await chromium.launch();

  /* ════════ CALM PATH ════════ */
  {
    console.log(`\n${C.b}── calm path: authored whyWrong option picked — bubble must never exist ──${C.x}`);
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(FX, false), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
      await page.evaluate(ARM);
      await clickOption(page, "45");            // the authored whyWrong option
      await clickCheck(page);
      const gotRetry = await waitForRetry(page, 9000);
      if (!gotRetry) fail("calm — reach Try again", "no Try again row after the wrong pick");
      const st = await page.evaluate(() => {
        const whyNodes = document.querySelectorAll(".cc-msg-why").length;
        const msgs = [...document.querySelectorAll(".cc-msg")];
        const vis = (n) => { if (!n) return false; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
        const hint = msgs.find((m) => !m.classList.contains("cc-msg-why"));
        return {
          whyNodes, whySeen: window.__whySeen,
          hintChip: hint ? ((hint.querySelector(".cc-schip") || {}).textContent || "") : null,
          hintVisible: vis(hint),
          hintText: hint ? ((hint.querySelector(".cc-btxt") || {}).textContent || "") : "",
          events: window.__whyEvents,
          log: (window.__raoWhyWrongLog || []).map((e) => e.code),
        };
      });
      if (st.whyNodes === 0 && st.whySeen === 0)
        pass("calm — no .cc-msg-why ever created (observer count 0)", "the ruling holds");
      else
        fail("calm — .cc-msg-why must never exist", `nodes now=${st.whyNodes}, observer saw ${st.whySeen} — a child can see a whyWrong message`);
      if (st.hintChip === "Hint 1" && st.hintVisible)
        pass("calm — hint fallback fired instead", `"Hint 1": "${st.hintText.slice(0, 40)}"`);
      else
        fail("calm — hint fallback (the 1,365-question path)", `expected a visible "Hint 1" bubble, got chip=${JSON.stringify(st.hintChip)} visible=${st.hintVisible}`);
      if (st.events.includes("OFF_BY_ONE_NINE") && st.log.includes("OFF_BY_ONE_NINE"))
        pass("calm — rao:whywrong event + __raoWhyWrongLog still fire (analytics preserved)", JSON.stringify(st.log));
      else
        fail("calm — analytics must keep firing", `events=${JSON.stringify(st.events)} log=${JSON.stringify(st.log)} — the invisible stream must NOT be gated`);
      if (errs.length === 0) pass("calm — zero page errors");
      else fail("calm — zero page errors", errs.join(" | "));
    } catch (e) { fail("calm — drive", e.message); }
    finally { await page.close(); }
  }

  /* ════════ DEGRADED ADAPTIVE PATH ════════ */
  {
    console.log(`\n${C.b}── degraded adaptive (solution-renderer.js absent): .pv-why must never show ──${C.x}`);
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(FX, true), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
      await page.evaluate(ARM);
      await clickOption(page, "45");
      await clickCheck(page);
      await page.waitForTimeout(900);           // > any panel build/typing window
      const st = await page.evaluate(() => ({
        panels: document.querySelectorAll(".pv-why").length,
        whySeen: window.__whySeen,
        events: window.__whyEvents,
        log: (window.__raoWhyWrongLog || []).map((e) => e.code),
      }));
      if (st.panels === 0 && st.whySeen === 0)
        pass("degraded — no .pv-why panel ever created (observer count 0)");
      else
        fail("degraded — .pv-why must never show", `panels now=${st.panels}, observer saw ${st.whySeen}`);
      if (st.events.includes("OFF_BY_ONE_NINE") && st.log.includes("OFF_BY_ONE_NINE"))
        pass("degraded — rao:whywrong event + log still fire", JSON.stringify(st.log));
      else
        fail("degraded — analytics must keep firing", `events=${JSON.stringify(st.events)} log=${JSON.stringify(st.log)}`);
      if (errs.length === 0) pass("degraded — zero page errors");
      else fail("degraded — zero page errors", errs.join(" | "));
    } catch (e) { fail("degraded — drive", e.message); }
    finally { await page.close(); }
  }

  await browser.close();
  console.log(failures
    ? `\n${C.r}${C.b}verify-whywrong-off: ${failures} FAILURE(S) — a visible whyWrong surface is live (or analytics broke). Do not ship.${C.x}\n`
    : `\n${C.g}${C.b}verify-whywrong-off: all green — whyWrong dark everywhere, analytics preserved.${C.x}\n`);
  process.exit(failures ? 1 : 0);
})();
