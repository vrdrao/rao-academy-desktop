#!/usr/bin/env node
/* ── verify-notquite.js — the instant "not quite" pill + gentle shake ──
   BRIEF-NOTQUITE-1, ruled by Venkat 2026-07-24.

   THE RULING: on a wrong FIRST attempt in calm mode the child gets an
   explicit, instant, playful signal — a pill + one gentle shake of the card.
   Pool lines are FIXED ENGINE LINES, grade-keyed (only "4" ships), zero
   per-question authoring. Rule 12 applies to every line (no "close",
   "almost", "nearly").

   Asserts, fixture-driven in calm mode:
     1. wrong attempt 1 → pill VISIBLE instantly, text EXACTLY one of the five
        Grade-4 pool lines; the card carries the shake class, then sheds it.
     2. two consecutive wrong-attempt-1 renders → pill text DIFFERS (no
        immediate repeat).
     3. hint ladder exhausted before answering → pill is EXACTLY the fallback
        line (the "below" promise would be false).
     4. wrong attempt 2 WITH a walkthrough → pill is EXACTLY the second-miss
        line, and the walkthrough opens.
     5. wrong attempt 2 WITHOUT a walkthrough → NO pill (the shown-answer
        panel carries its own line).
     6. "Try again" → pill gone.  7. new selection → pill stays gone.
     8. correct answer → pill never exists.
     9. rule-12 lint on the pool object itself (window.NOTQUITE_POOLS).

   Run:  node tools/verify-notquite.js
   Exit 0 = the signal lands as ruled. Non-zero = do not ship.
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

/* The pool lines, VERBATIM from the brief — the guard pins the exact text. */
const POOL_FIRST = [
  "Ooh, tricky one! The hint below will help",
  "The answer is still hiding — your clue is below!",
  "Keep hunting, detective! Check the hint below",
  "Oops-a-daisy! The hint below will help you",
  "Hmm, nope! Let's peek at the hint below",
];
const LINE_NO_HINT = "Hmm, not that one — try again!";
const LINE_SECOND = "Let's work it out together";

const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
function makePage(sourceInner) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
<div id="source">${sourceInner}</div>
<div class="rao-lesson" data-theme="grape"><div class="pv-frame-mount" id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

/* Fixtures — TEST-SIDE only, never a lesson.
   A: hints + solution (pool pill, then attempt-2 walkthrough doorway)
   B: same shape (the no-immediate-repeat partner)
   C: ONE hint, no solution (exhaust the ladder first → fallback line)
   D: no hint, no solution (fallback line; attempt 2 → shown-answer, NO pill)
   E: answered correctly (pill must never exist) */
const FX = `
<!--@q
id: nq-a
type: single-select
answer: ["8"]
hint:
  - "Count on from the bigger number."
  - "Picture both groups joining into one group."
solution:
  - type: step
    goal: Add the numbers.
    working: "3 + 5 = 8"
  - type: takeaway
    text: Count on from the bigger number.
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 3 + 5?</p>
  <ul class="options"><li>6</li><li>7</li><li>8</li></ul>
</div>
<!--@q
id: nq-b
type: single-select
answer: ["9"]
hint: Count the fours one at a time.
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 4 + 5?</p>
  <ul class="options"><li>8</li><li>9</li><li>10</li></ul>
</div>
<!--@q
id: nq-c
type: single-select
answer: ["12"]
hint: Think of a dozen.
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 6 + 6?</p>
  <ul class="options"><li>11</li><li>12</li><li>13</li></ul>
</div>
<!--@q
id: nq-d
type: single-select
answer: ["10"]
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 5 + 5?</p>
  <ul class="options"><li>9</li><li>10</li><li>11</li></ul>
</div>
<!--@q
id: nq-e
type: single-select
answer: ["7"]
hint: Count on from five.
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 5 + 2?</p>
  <ul class="options"><li>6</li><li>7</li><li>8</li></ul>
</div>`;

(async () => {
  console.log(`\n${C.b}══ verify-notquite — instant pill + gentle shake on wrong (BRIEF-NOTQUITE-1) ══${C.x}`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));

  const frameOf = (i) => `document.querySelectorAll(".pv-frame")[${i}]`;
  const tapOpt = (i, val) => page.evaluate(([k, v]) => {
    const f = document.querySelectorAll(".pv-frame")[k];
    f.scrollIntoView({ block: "center" });
    const o = [...f.querySelectorAll(".opt")].find(
      (e) => String(e.dataset.val != null ? e.dataset.val : (e.textContent || "").trim()) === v);
    o.click();
  }, [i, val]);
  const tapCheck = (i) => page.evaluate((k) => {
    document.querySelectorAll(".pv-frame")[k].querySelector(".pv-check").click();
  }, i);
  const tapRowBtn = (i, reSrc) => page.evaluate(([k, src]) => {
    const f = document.querySelectorAll(".pv-frame")[k];
    const b = [...f.querySelectorAll(".cc-actions button")].find((x) => new RegExp(src).test(x.textContent || ""));
    if (b) b.click();
    return !!b;
  }, [i, reSrc]);
  const waitRow = async (i, reSrc, timeout) => {
    const deadline = Date.now() + (timeout || 9000);
    for (;;) {
      const hit = await page.evaluate(([k, src]) => {
        const f = document.querySelectorAll(".pv-frame")[k];
        return [...f.querySelectorAll(".cc-actions button")].some(
          (b) => b.getBoundingClientRect().width > 0 && new RegExp(src).test(b.textContent || ""));
      }, [i, reSrc]);
      if (hit) return true;
      if (Date.now() > deadline) return false;
      await page.waitForTimeout(120);
    }
  };
  const pillState = (i) => page.evaluate((k) => {
    const f = document.querySelectorAll(".pv-frame")[k];
    const p = f.querySelector(".cc-pill");
    const vis = (n) => { if (!n) return false; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
    return { present: !!p, visible: vis(p), text: p ? (p.textContent || "").trim() : null };
  }, i);

  try {
    await page.setContent(makePage(FX), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });

    /* ── 9. rule-12 lint on the pool object itself ── */
    const pools = await page.evaluate(() => (typeof NOTQUITE_POOLS !== "undefined" ? NOTQUITE_POOLS : null));
    if (!pools) fail("pool object NOTQUITE_POOLS exists in the engine", "not found on the page");
    else {
      const lines = JSON.stringify(pools);
      const hits = ["close", "almost", "nearly"].filter((w) => new RegExp(w, "i").test(lines));
      if (hits.length === 0) pass("rule-12 lint — no pool line contains 'close'/'almost'/'nearly'");
      else fail("rule-12 lint on the pools", `banned word(s) present: ${hits.join(", ")}`);
      const g4 = pools["4"] || {};
      const first = g4.firstWithHint || [];
      if (first.length === 5 && first.every((l, ix) => l === POOL_FIRST[ix]) &&
          g4.firstNoHint === LINE_NO_HINT && g4.secondWithWalkthrough === LINE_SECOND)
        pass("Grade-4 pool matches the brief VERBATIM (5 + fallback + second-miss)");
      else fail("Grade-4 pool verbatim", JSON.stringify(g4));
    }

    /* ── 1. FXA wrong attempt 1: pill instant + pool line + shake ── */
    await tapOpt(0, "6");
    await tapCheck(0);
    const shakeNow = await page.evaluate(() =>
      document.querySelectorAll(".pv-frame")[0].querySelector(".pv-card").classList.contains("cc-shake"));
    const pA = await pillState(0);
    if (pA.visible && POOL_FIRST.includes(pA.text))
      pass("A wrong #1 — pill visible INSTANTLY, text is a pool line", `"${pA.text}"`);
    else fail("A wrong #1 — instant pool pill", JSON.stringify(pA));
    if (shakeNow) pass("A wrong #1 — .cc-shake present on .pv-card at Check");
    else fail("A wrong #1 — shake fires", ".cc-shake not on .pv-card immediately after the wrong Check");
    await page.waitForTimeout(900);
    const shakeGone = await page.evaluate(() =>
      !document.querySelectorAll(".pv-frame")[0].querySelector(".pv-card").classList.contains("cc-shake"));
    if (shakeGone) pass("A wrong #1 — shake class removed after the animation");
    else fail("A wrong #1 — shake class sheds", ".cc-shake still on .pv-card 900ms later");

    /* ── 2. FXB wrong attempt 1: no immediate repeat ── */
    await tapOpt(1, "8");
    await tapCheck(1);
    const pB = await pillState(1);
    if (pB.visible && POOL_FIRST.includes(pB.text) && pB.text !== pA.text)
      pass("B wrong #1 — pool line differs from the previous render (no immediate repeat)", `"${pB.text}"`);
    else fail("B wrong #1 — no immediate repeat", `A="${pA.text}" B="${JSON.stringify(pB)}"`);

    /* ── 3. FXC: exhaust the 1-rung ladder first, then wrong → fallback line ── */
    await page.evaluate(() => {
      const f = document.querySelectorAll(".pv-frame")[2];
      f.scrollIntoView({ block: "center" });
      f.querySelector(".pv-hint").click();
    });
    await page.waitForTimeout(900);                       // let the rung finish typing
    await tapOpt(2, "11");
    await tapCheck(2);
    const pC = await pillState(2);
    if (pC.visible && pC.text === LINE_NO_HINT)
      pass("C ladder exhausted → wrong — pill is EXACTLY the fallback line", `"${pC.text}"`);
    else fail("C fallback line", JSON.stringify(pC));

    /* ── 6/7. FXA: Try again → pill gone; new selection → still gone ── */
    if (!(await waitRow(0, "Try again", 9000))) fail("A — reach Try again", "no Try again row");
    await tapRowBtn(0, "Try again");
    await page.waitForTimeout(250);
    const pA2 = await pillState(0);
    if (!pA2.visible) pass("A — pill GONE on Try again (fresh start)");
    else fail("A — pill clears on Try again", JSON.stringify(pA2));
    await tapOpt(0, "7");                                  // a NEW selection
    await page.waitForTimeout(150);
    const pA3 = await pillState(0);
    if (!pA3.visible) pass("A — pill still gone after a new selection (#111 machinery)");
    else fail("A — pill hidden on new selection", JSON.stringify(pA3));

    /* ── 4. FXA wrong attempt 2 (walkthrough exists): second-miss pill + open ── */
    await tapCheck(0);
    const pA4 = await pillState(0);
    const solOpen = await (async () => {
      const deadline = Date.now() + 9000;
      for (;;) {
        const r = await page.evaluate(() => {
          const f = document.querySelectorAll(".pv-frame")[0];
          const s = f.querySelector(".pv-solwrap");
          return !!(s && !s.hasAttribute("hidden"));
        });
        if (r) return true;
        if (Date.now() > deadline) return false;
        await page.waitForTimeout(120);
      }
    })();
    if (pA4.visible && pA4.text === LINE_SECOND)
      pass("A wrong #2 — pill is EXACTLY the second-miss line", `"${pA4.text}"`);
    else fail("A wrong #2 — second-miss pill", JSON.stringify(pA4));
    if (solOpen) pass("A wrong #2 — the walkthrough auto-opens (doorway kept)");
    else fail("A wrong #2 — walkthrough opens", ".pv-solwrap never opened");

    /* ── 5. FXD: attempt 2 with NO walkthrough → NO pill; shown-answer carries it ── */
    await tapOpt(3, "9");
    await tapCheck(3);
    const pD1 = await pillState(3);
    if (pD1.visible && pD1.text === LINE_NO_HINT)
      pass("D wrong #1 (no hint authored) — fallback line", `"${pD1.text}"`);
    else fail("D wrong #1 — fallback line", JSON.stringify(pD1));
    if (!(await waitRow(3, "Try again", 9000))) fail("D — reach Try again", "no Try again row");
    await tapRowBtn(3, "Try again");
    await page.waitForTimeout(250);
    await tapOpt(3, "9");
    await tapCheck(3);
    await page.waitForTimeout(600);
    const pD2 = await pillState(3);
    const shown = await page.evaluate(() => {
      const f = document.querySelectorAll(".pv-frame")[3];
      return f.dataset.raoOutcome === "shown-answer";
    });
    if (!pD2.visible) pass("D wrong #2 (no walkthrough) — NO pill (the shown-answer panel carries its own line)");
    else fail("D wrong #2 — no pill with shown-answer", JSON.stringify(pD2) + " — a pill here contradicts the panel");
    if (shown) pass("D wrong #2 — shown-answer commit unchanged");
    else fail("D wrong #2 — shown-answer commit", "outcome is not shown-answer");

    /* ── 8. FXE: correct answer → pill never exists ── */
    await tapOpt(4, "7");
    await tapCheck(4);
    await page.waitForTimeout(800);
    const pE = await pillState(4);
    if (!pE.present) pass("E correct — no pill node ever created on the correct path");
    else fail("E correct — pill must never exist", JSON.stringify(pE));

    if (errs.length === 0) pass("zero page errors");
    else fail("zero page errors", errs.join(" | "));
  } catch (e) { fail("drive", e.message); }
  finally { await page.close(); }

  await browser.close();
  console.log(failures
    ? `\n${C.r}${C.b}verify-notquite: ${failures} FAILURE(S) — the wrong-attempt signal is not as ruled. Do not ship.${C.x}\n`
    : `\n${C.g}${C.b}verify-notquite: all green — pill + shake land exactly as ruled.${C.x}\n`);
  process.exit(failures ? 1 : 0);
})();
