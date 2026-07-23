/* ============================================================================
   verify-retry-state.js — THE RETRY-STATE GATE (BRIEF-RETRY-STATE-2, 2026-07-23).

   One guard file for five state transitions that share ONE root cause: state
   that does not reset between attempts. Each guard asserts the POST-FIX
   behaviour, so against the UNMODIFIED engine every one FAILS (guard-first,
   STANDING RULE 1) and after Phase 2 every one PASSES.

     G1 (#88)  fill-blank clears on "Try again" — the box is EMPTY on retry.
               RULED BY VENKAT 2026-07-23: the typed value IS CLEARED. This
               REVERSES the old "typed value is NEVER cleared" law; the sister
               inversion lives in verify-reset.js (A5 + the keepValues drill).
     G2 (#111) stale whyWrong feedback is DISMISSED on any new selection — the
               .cc-msg-why panel + "Not quite" chip HIDE (never node-removal),
               and prior-attempt ✕/tint clear. RULED BY VENKAT 2026-07-22.
     G3 (#84)  a comma-grouped numeric answer grades CORRECT ("42,613" == 42613);
               a MISPLACED comma is NOT accepted (sabotage).
     G4 (#85)  the fill-blank box is WIDE ENOUGH for the full key digit count —
               no clipping at 390×844 and 360×780. RULED: WIDEN, never shrink
               font. Round-scaffold RESULT box checked specifically (qm37aecdj).
     G5 (#109) a commutatively-restated typed sum grades CORRECT ("16+31=47" for
               "thirty-one plus sixteen"). ADDITION ONLY — an operator allowlist
               of {+}. Subtraction/division written backwards must STAY wrong.

   Run:  node tools/verify-retry-state.js
   Exit 0 = every transition resets correctly. Non-zero = do not ship.
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

/* ── the page: real engine + rao-card pipeline, real rao.css/rao-card.css. A
   caller supplies the #source inner markup; the trailing IIFE in rao-card.js
   mounts every @q into #preview exactly as the app does. ── */
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

/* ── fixtures ──────────────────────────────────────────────────────────────
   G1: a plain fill-blank (answer 42613 — the exact #88 evidence qrgncsxq7). */
const FX_FILLBLANK = `
<!--@q
id: rt-g1
type: fill-blanks
answer: ["42613"]
hint: Add the ones first, then carry into the next column.
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">A stadium sold 24,516 tickets on Saturday and 18,097 on Sunday. How many in all? []</p>
  <p class="explain">24,516 + 18,097 = 42,613.</p>
</div>`;

/* G2: a single-select carrying whyWrong on every distractor — the #111 shape
   (auth-q3, 6×9). Wrong pick 45 speaks a "Not quite" panel; the retry then
   selects the correct 54. */
const FX_WHYWRONG = `
<!--@q
id: rt-g2
type: single-select
answer: ["54"]
hint: Count the nines one at a time.
whyWrong:
  "45":
    code: OFF_BY_ONE_NINE
    message: "That is 5 nines — count one more nine to reach six."
  "63":
    code: OVER_BY_ONE_NINE
    message: "That is 7 nines — that is one nine too many."
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 6 × 9?</p>
  <ul class="options"><li data-val="45">45</li><li data-val="54">54</li><li data-val="63">63</li></ul>
  <p class="explain">6 × 9 = 54.</p>
</div>`;

/* G4: a 5-digit plain fill-blank AND a round-scaffold whose RESULT (10000) is a
   digit wider than either operand (3000/7000) — the exact #85 evidence qm37aecdj. */
const FX_WIDTH = `
<!--@q
id: rt-g4a
type: fill-blanks
answer: ["42613"]
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">Add 24,516 and 18,097. []</p>
  <p class="explain">42,613.</p>
</div>
<!--@q
id: rt-g4b
type: fill-blanks
layout: round-scaffold
top: [3007, 6582]
op: +
place: thousand
answer: ["3000", "7000", "10000"]
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">Estimate 3,007 + 6,582 to the nearest thousand.</p>
  <p class="explain">3,000 + 7,000 = 10,000.</p>
</div>
<!--@q
id: rt-g4c
type: fill-blanks
answer: ["428617"]
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">The widest key in the corpus is 6 digits. []</p>
  <p class="explain">428,617.</p>
</div>`;

/* ── browser helpers (single-frame pages, so we target .pv-frame directly) ── */
async function waitForRetry(page, timeout) {
  const deadline = Date.now() + (timeout || 8000);
  for (;;) {
    const found = await page.evaluate(() =>
      [...document.querySelectorAll(".cc-actions button")].some(
        (b) => b.getBoundingClientRect().width > 0 && /try again/i.test(b.textContent || "")));
    if (found) return true;
    if (Date.now() > deadline) return false;
    await page.waitForTimeout(120);
  }
}
async function clickRetry(page) {
  const box = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".cc-actions button")].find(
      (x) => x.getBoundingClientRect().width > 0 && /try again/i.test(x.textContent || ""));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (!box) throw new Error('no "Try again" button to click');
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(120);
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

/* ══════════════ G1 — fill-blank clears on Try again (#88) ══════════════ */
async function g1(browser) {
  console.log(`\n${C.b}── G1 (#88): the fill-blank box is EMPTY after "Try again" ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  try {
    await page.setContent(makePage(FX_FILLBLANK), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .blank-input", { timeout: 8000 });
    // Type a WRONG value, Check -> wrong verdict, wait for "Try again".
    const inp = page.locator(".pv-frame .blank-input").first();
    await inp.click();
    await inp.pressSequentially("99999", { delay: 25 });
    await clickCheck(page);
    if (!(await waitForRetry(page, 9000))) { fail("G1 — reach Try again", "no Try again after a wrong fill-blank"); return; }
    await clickRetry(page);
    const val = await page.evaluate(() => document.querySelector(".pv-frame .blank-input").value);
    if (val === "")
      pass("G1 — the box is empty on retry (RULED 2026-07-23: value IS cleared)", `value=${JSON.stringify(val)}`);
    else
      fail("G1 — the box is empty on retry", `value=${JSON.stringify(val)} — the wrong answer survived the retry (old law: preserved). #88.`);
    if (errs.length) fail("G1 — zero page errors", errs.join(" | "));
  } catch (e) { fail("G1 — drive", e.message); }
  finally { await page.close(); }
}

/* ══════ G2 — stale whyWrong dismissed on any new selection (#111) ══════ */
async function g2(browser) {
  console.log(`\n${C.b}── G2 (#111): a new selection HIDES the stale whyWrong panel (node stays) ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  try {
    await page.setContent(makePage(FX_WHYWRONG), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
    // Wrong pick 45 -> Check -> the "Not quite" whyWrong panel types in.
    await clickOption(page, "45");
    await clickCheck(page);
    // Wait for the whyWrong bubble to exist and finish typing.
    await page.waitForSelector(".cc-msg-why", { timeout: 8000 });
    if (!(await waitForRetry(page, 9000))) { fail("G2 — reach Try again", "no Try again after a wrong pick"); return; }
    // Confirm it really is on screen BEFORE the new selection.
    const before = await page.evaluate(() => {
      const el = document.querySelector(".cc-msg-why");
      const r = el.getBoundingClientRect();
      return { present: !!el, visible: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && getComputedStyle(el).display !== "none" };
    });
    if (!before.visible) { fail("G2 — precondition: panel visible after wrong", JSON.stringify(before)); return; }
    // Try again (unfreezes), then tap a DIFFERENT option (the correct 54).
    await clickRetry(page);
    await clickOption(page, "54");
    const after = await page.evaluate(() => {
      const el = document.querySelector(".cc-msg-why");
      const chip = el ? el.querySelector(".cc-schip") : null;
      const vis = (n) => { if (!n) return false; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
      return {
        panelPresent: !!el,
        panelVisible: vis(el),
        chipPresent: !!chip,
        chipVisible: vis(chip),
        priorMarks: document.querySelectorAll(".pv-frame .cc-x, .pv-frame .cc-tried").length
      };
    });
    // The bug: the panel is still visible. Fix: hidden, but node still present.
    if (!after.panelVisible) pass("G2 — whyWrong panel HIDDEN after new selection", "not visible");
    else fail("G2 — whyWrong panel HIDDEN after new selection", "panel still visible — stale 'Not quite' survives the retry. #111.");
    if (!after.chipVisible) pass("G2 — 'Not quite' chip hidden", "not visible");
    else fail("G2 — 'Not quite' chip hidden", "chip still visible. #111.");
    if (after.priorMarks === 0) pass("G2 — prior-attempt ✕/tint cleared", "0 marks");
    else fail("G2 — prior-attempt ✕/tint cleared", `${after.priorMarks} stale mark(s)`);
    if (after.panelPresent && after.chipPresent) pass("G2 — HIDE not remove: nodes still in the DOM", "panel + chip present");
    else fail("G2 — HIDE not remove: nodes still in the DOM", JSON.stringify(after) + " — a fix that removes the node violates the no-repaint law.");
    if (errs.length) fail("G2 — zero page errors", errs.join(" | "));
  } catch (e) { fail("G2 — drive", e.message); }
  finally { await page.close(); }
}

/* ══════════ G3 — comma-grouped numeric answers accepted (#84) ══════════
   Node-level: check() is a pure grader. The chosen rule (reported to chat):
   accept a comma form ONLY when the commas sit in exact thousands positions
   ^\d{1,3}(,\d{3})*$ — so "42,613" ✓ but "4,2613" and "426,13" ✗. This is not
   a lenient "strip all commas" rule; a MISPLACED comma stays wrong. */
function g3(Rao) {
  console.log(`\n${C.b}── G3 (#84): comma-grouped numeric fill-blank grades CORRECT; misplaced comma does NOT ──${C.x}`);
  const key = ["42613"];
  const cases = [
    { user: ["42613"], want: true, why: "control: bare digits" },
    { user: ["42,613"], want: true, why: "the fix: canonical thousands grouping" },
    { user: ["4,2613"], want: false, why: "sabotage: comma after 1 digit is misplaced" },
    { user: ["426,13"], want: false, why: "sabotage: comma leaves 2 trailing digits" },
  ];
  for (const c of cases) {
    const got = Rao.check("fill-blanks", c.user, key);
    const ok = got === c.want;
    const name = `G3 — ${JSON.stringify(c.user)} -> ${c.want} (${c.why})`;
    if (ok) pass(name, `check returned ${got}`);
    else fail(name, `check returned ${got}, expected ${c.want}${c.want ? " — comma form rejected (#84)" : " — misplaced comma wrongly accepted"}`);
  }
}

/* ══════════════ G4 — the box fits its answer, no clip (#85) ══════════════ */
async function g4(browser) {
  console.log(`\n${C.b}── G4 (#85): the fill-blank box is wide enough — no clipping at 390×844 and 360×780 ──${C.x}`);
  for (const vp of [{ w: 390, h: 844 }, { w: 360, h: 780 }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(FX_WIDTH), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .blank-input", { timeout: 8000 });
      // Fill the plain 5-digit box and the round-scaffold's THREE blanks.
      const plain = page.locator(".pv-frame").nth(0).locator(".blank-input").first();
      await plain.click(); await plain.pressSequentially("42613", { delay: 20 });
      const rsf = page.locator(".pv-frame").nth(1).locator(".rsf-blank");
      const rvals = ["3000", "7000", "10000"];
      const n = await rsf.count();
      for (let i = 0; i < n; i++) { await rsf.nth(i).click(); await rsf.nth(i).pressSequentially(rvals[i] || "", { delay: 20 }); }
      // Also fill the 6-digit plain box (the widest key in the corpus).
      const plain6 = page.locator(".pv-frame").nth(2).locator(".blank-input").first();
      await plain6.click(); await plain6.pressSequentially("428617", { delay: 20 });
      const m = await page.evaluate(() => {
        const clip = (el) => ({ digits: el.value.length, client: el.clientWidth, scroll: el.scrollWidth, clipped: el.scrollWidth > el.clientWidth + 1 });
        const plainBox = document.querySelectorAll(".pv-frame")[0].querySelector(".blank-input");
        const rblanks = document.querySelectorAll(".pv-frame")[1].querySelectorAll(".rsf-blank");
        const resultBox = rblanks[rblanks.length - 1]; // the box after "=" — the result
        const plain6Box = document.querySelectorAll(".pv-frame")[2].querySelector(".blank-input");
        return { plain: clip(plainBox), result: clip(resultBox), plain6: clip(plain6Box) };
      });
      const tag = `${vp.w}×${vp.h}`;
      if (!m.plain.clipped) pass(`G4 — plain 5-digit box not clipped @ ${tag}`, `client ${m.plain.client}px >= scroll ${m.plain.scroll}px (${m.plain.digits} digits)`);
      else fail(`G4 — plain 5-digit box not clipped @ ${tag}`, `client ${m.plain.client}px < scroll ${m.plain.scroll}px — ${m.plain.digits} digits clipped (#85)`);
      if (!m.plain6.clipped) pass(`G4 — plain 6-digit box not clipped @ ${tag}`, `client ${m.plain6.client}px >= scroll ${m.plain6.scroll}px (${m.plain6.digits} digits — widest key)`);
      else fail(`G4 — plain 6-digit box not clipped @ ${tag}`, `client ${m.plain6.client}px < scroll ${m.plain6.scroll}px — ${m.plain6.digits} digits clipped (#85, 6-digit population)`);
      if (!m.result.clipped) pass(`G4 — round-scaffold RESULT box not clipped @ ${tag}`, `client ${m.result.client}px >= scroll ${m.result.scroll}px (${m.result.digits} digits)`);
      else fail(`G4 — round-scaffold RESULT box not clipped @ ${tag}`, `client ${m.result.client}px < scroll ${m.result.scroll}px — result "${rvals[2]}" clipped while operands fit (#85 amendment, qm37aecdj)`);
      if (errs.length) fail(`G4 — zero page errors @ ${tag}`, errs.join(" | "));
    } catch (e) { fail(`G4 — drive @ ${vp.w}×${vp.h}`, e.message); }
    finally { await page.close(); }
  }
}

/* ══════ G5 — commutative typed sum accepted, ADDITION ONLY (#109) ══════
   Node-level. Positive uses a REAL corpus question (q2zyrs8kf, "thirty-one plus
   sixteen", key "31 + 16 = 47"). Negatives are SYNTHETIC (Phase 0 proved the
   corpus has zero −/÷ expression questions) and are NOT added to lessons/. */
function g5(Rao) {
  console.log(`\n${C.b}── G5 (#109): commutative ADDITION accepted; subtraction/division backwards STAY wrong ──${C.x}`);
  const cases = [
    { key: ["31 + 16 = 47"], user: ["31 + 16 = 47"], want: true, why: "control: exact (q2zyrs8kf)" },
    { key: ["31 + 16 = 47"], user: ["16 + 31 = 47"], want: true, why: "the fix: operands swapped, addition (q2zyrs8kf)" },
    { key: ["31 + 16 = 47"], user: ["16+31=47"], want: true, why: "swapped + no spaces (real #109 keystrokes)" },
    { key: ["9 - 4 = 5"], user: ["4 - 9 = 5"], want: false, why: "SYNTHETIC negative: subtraction is NOT commutative" },
    { key: ["12 ÷ 3 = 4"], user: ["3 ÷ 12 = 4"], want: false, why: "SYNTHETIC negative: division is NOT commutative" },
  ];
  for (const c of cases) {
    const got = Rao.check("expression", c.user, c.key);
    const ok = got === c.want;
    const name = `G5 — ${JSON.stringify(c.user)} vs key ${JSON.stringify(c.key)} -> ${c.want} (${c.why})`;
    if (ok) pass(name, `check returned ${got}`);
    else fail(name, `check returned ${got}, expected ${c.want}${c.want ? " — commutative addition rejected (#109)" : " — non-commutative operator wrongly accepted"}`);
  }
}

(async () => {
  console.log(`${C.b}RETRY-STATE VERIFICATION${C.x} — BRIEF-RETRY-STATE-2 (G1 #88 · G2 #111 · G3 #84 · G4 #85 · G5 #109)\n`);
  // Node grader for G3/G5.
  global.window = {};
  eval(read("engine/preview-engine.js"));
  const Rao = global.window.RaoPreview || global.RaoPreview;
  if (!Rao || typeof Rao.check !== "function") { console.error("cannot load RaoPreview"); process.exit(2); }

  g3(Rao);
  g5(Rao);

  const browser = await chromium.launch();
  try {
    await g1(browser);
    await g2(browser);
    await g4(browser);
  } finally { await browser.close(); }

  console.log(`\n${failures ? C.r : C.g}${C.b}${failures ? failures + " assertion(s) FAILED" : "all retry-state guards passed"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})();
