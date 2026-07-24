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
     G2 (#111) AMENDED by BRIEF-WHYWRONG-OFF-1 (2026-07-24): whyWrong is OFF —
               the .cc-msg-why panel NEVER APPEARS (stronger than the old
               "appears, then hides"); the hint fallback types instead, and
               prior-attempt ✕/tint still clear on a new selection.
     G3 (#84)  a comma-grouped numeric answer grades CORRECT ("42,613" == 42613);
               a MISPLACED comma is NOT accepted (sabotage).
     G4 (#85)  the fill-blank box is WIDE ENOUGH for the full key digit count —
               no clipping at 390×844 and 360×780. RULED: WIDEN, never shrink
               font. Round-scaffold RESULT box checked specifically (qm37aecdj).
     G5 (#109) a commutatively-restated typed sum grades CORRECT ("16+31=47" for
               "thirty-one plus sixteen"). ADDITION ONLY — an operator allowlist
               of {+}. Subtraction/division written backwards must STAY wrong.

   ── BRIEF-INTERACTION-CONFORM-1 (2026-07-23) adds G10–G15. Each asserts the
      POST-FIX behaviour, so against the UNMODIFIED engine the new ones FAIL
      (guard-first) and after that brief's Phase 2 every one PASSES. G15 is the
      exception: it re-asserts the four RETRY-STATE-2 fixes, so it PASSES already.

     G10 a RIGHT answer written differently is never painted wrong (rules 10,12).
         "42,613" / "1,00,000" / "16+31=47" grade correct AND carry no red box.
         Sabotage: "4-9=5" stays graded wrong AND painted wrong.
     G11 multi-select shows what the child picked (rule 12). A correct pick stays
         visually distinct from an option never chosen; a wrong pick keeps its ✕.
     G12 "Try again" is a fresh start (rule 2). AMENDED by BRIEF-WHYWRONG-OFF-1
         (2026-07-24): no whyWrong ever appears; typed/selection/tint cleared;
         the hint bubbles SURVIVE.
     G13 the explain line is gone (rule 13). No state renders it — including the
         rule-6 case (first wrong, no whyWrong): red mark, and NO answer reveal.
     G14 ordering marks the misplaced tiles (rule 14). The two out-of-place tiles
         carry wrong-styling, the two correct ones do not — WITHOUT revealing the
         correct order (rule 6).
     G15 regression: the four RETRY-STATE-2 fixes still hold (comma/Indian
         grading, addition commutativity, box widths, typed-value clearing).

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

/* ── BRIEF-INTERACTION-CONFORM-1 fixtures (G10–G14) — one @q per page so the
   document-wide helpers below stay unambiguous. Modelled on real evidence:
   42613 is #88, "31 + 16 = 47" is the real q2zyrs8kf key, the G14 numbers are
   rule 14's worked example. ── */

// G10 — a right answer written differently must grade correct AND stay unpainted.
const FX_G10_COMMA = `
<!--@q
id: rt-g10a
type: fill-blanks
answer: ["42613"]
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">24,516 + 18,097 = []</p>
</div>`;
const FX_G10_INDIAN = `
<!--@q
id: rt-g10b
type: fill-blanks
answer: ["100000"]
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">Ten times ten thousand is []</p>
</div>`;
const FX_G10_EXPR = `
<!--@q
id: rt-g10c
type: expression
answer: ["31 + 16 = 47"]
-->
<div class="question" data-type="expression">
  <p class="prompt">Write a number sentence for thirty-one plus sixteen.</p>
</div>`;
// Sabotage: subtraction is NOT commutative — must STAY wrong AND painted wrong.
const FX_G10_SABO = `
<!--@q
id: rt-g10d
type: expression
answer: ["9 - 4 = 5"]
-->
<div class="question" data-type="expression">
  <p class="prompt">Write a number sentence for nine minus four.</p>
</div>`;

// G11 — pick one right (12) + one wrong (15); 18 and 20 are never chosen.
const FX_G11_MULTI = `
<!--@q
id: rt-g11
type: multi-select
answer: ["12","18"]
-->
<div class="question" data-type="multi-select">
  <p class="prompt">Select the multiples of 6.</p>
  <ul class="options"><li data-val="12">12</li><li data-val="18">18</li><li data-val="15">15</li><li data-val="20">20</li></ul>
</div>`;

// G12 — a hint is opened BEFORE the wrong pick; the whyWrong panel then speaks.
const FX_G12 = `
<!--@q
id: rt-g12
type: single-select
answer: ["54"]
hint:
  - "Count the nines one at a time."
  - "Six groups of nine."
whyWrong:
  "45":
    code: OFF_BY_ONE_NINE
    message: "That is 5 nines — count one more nine to reach six."
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 6 × 9?</p>
  <ul class="options"><li data-val="45">45</li><li data-val="54">54</li></ul>
</div>`;

// G13 — a fill-blank with an explain and NO whyWrong (the rule-6 case).
const FX_G13 = `
<!--@q
id: rt-g13
type: fill-blanks
answer: ["110"]
explain: 70 + 40 = 110.
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">70 + 40 = []</p>
</div>`;

// G14 — rule 14's worked example. Key 3,024·3,204·3,240·3,402 (smallest→largest);
// the child will submit 3,024·3,204·3,402·3,240 (last two swapped).
const FX_G14_ORDER = `
<!--@q
id: rt-g14
type: order
answer: ["3,024","3,204","3,240","3,402"]
low: smallest
high: largest
-->
<div class="question" data-type="order">
  <p class="prompt">Order these numbers from smallest to largest.</p>
  <ol class="order">
    <li>3,240</li>
    <li>3,024</li>
    <li>3,402</li>
    <li>3,204</li>
  </ol>
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
async function clickHint(page) {
  const box = await page.evaluate(() => {
    const b = document.querySelector(".pv-hint");
    if (!b) return null;
    b.scrollIntoView({ block: "center" });
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (!box) throw new Error("no Hint button");
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(140);
}
// Tap-to-place for order tiles: tap the tile (arms it), then tap the slot (drops
// it there). enableTileDrag binds pointerdown+click on the qbody root; a mouse
// click issues both, so this is exactly the child's two-step tap.
async function clickTile(page, val) {
  const box = await page.evaluate((v) => {
    const t = [...document.querySelectorAll(".tile")].find(
      (e) => e.dataset.val === v && !e.classList.contains("placed"));
    if (!t) return null;
    t.scrollIntoView({ block: "center" });
    const r = t.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, val);
  if (!box) throw new Error("tile not found (or already placed): " + val);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(90);
}
async function clickSlot(page, idx) {
  const box = await page.evaluate((i) => {
    const s = document.querySelectorAll(".order-slot")[i];
    if (!s) return null;
    s.scrollIntoView({ block: "center" });
    const r = s.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, idx);
  if (!box) throw new Error("order-slot not found at index " + idx);
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(90);
}
// Shared visibility + style-signature readers used by the conformance guards.
const VIS_FN = `function(n){ if(!n) return false; var r=n.getBoundingClientRect(); var cs=getComputedStyle(n); return r.width>0 && r.height>0 && cs.display!=="none" && cs.visibility!=="hidden"; }`;

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

/* ══════ G2 — no whyWrong ever; marks still clear on a new selection ══════
   AMENDED 2026-07-24 (BRIEF-WHYWRONG-OFF-1, ruled by Venkat): whyWrong is
   SWITCHED OFF product-wide. The old G2 (#111) asserted the panel APPEARS,
   then HIDES on a new selection. The amended G2 asserts the strictly stronger
   claim: the .cc-msg-why panel NEVER APPEARS AT ALL — the hint fallback types
   instead — while the #111 mark-clearing on a new selection still holds.
   Do not restore the old "appears then hides" form without a new dated ruling. */
async function g2(browser) {
  console.log(`\n${C.b}── G2 (WHYWRONG-OFF): no whyWrong panel ever; ✕/tint still clear on a new selection ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  try {
    await page.setContent(makePage(FX_WHYWRONG), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
    // Wrong pick 45 (the authored-whyWrong option) -> Check -> the HINT types.
    await clickOption(page, "45");
    await clickCheck(page);
    if (!(await waitForRetry(page, 9000))) { fail("G2 — reach Try again", "no Try again after a wrong pick"); return; }
    const before = await page.evaluate(() => {
      const vis = (n) => { if (!n) return false; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
      const hint = [...document.querySelectorAll(".cc-msg")].find((m) => !m.classList.contains("cc-msg-why"));
      return {
        whyNodes: document.querySelectorAll(".cc-msg-why").length,
        hintChip: hint ? ((hint.querySelector(".cc-schip") || {}).textContent || "") : null,
        hintVisible: vis(hint),
      };
    });
    if (before.whyNodes === 0) pass("G2 — no .cc-msg-why after the wrong pick (whyWrong is OFF)", "0 nodes");
    else fail("G2 — no .cc-msg-why after the wrong pick", `${before.whyNodes} node(s) — a child can see a whyWrong message (BRIEF-WHYWRONG-OFF-1)`);
    if (before.hintChip === "Hint 1" && before.hintVisible) pass("G2 — hint fallback typed instead", `"${before.hintChip}"`);
    else fail("G2 — hint fallback typed instead", `expected a visible "Hint 1" bubble, got chip=${JSON.stringify(before.hintChip)} visible=${before.hintVisible}`);
    // Try again (unfreezes), then tap a DIFFERENT option (the correct 54).
    await clickRetry(page);
    await clickOption(page, "54");
    const after = await page.evaluate(() => {
      const vis = (n) => { if (!n) return false; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
      const hint = [...document.querySelectorAll(".cc-msg")].find((m) => !m.classList.contains("cc-msg-why"));
      return {
        whyNodes: document.querySelectorAll(".cc-msg-why").length,
        hintVisible: vis(hint),
        priorMarks: document.querySelectorAll(".pv-frame .cc-x, .pv-frame .cc-tried").length
      };
    });
    if (after.whyNodes === 0) pass("G2 — still no .cc-msg-why after the new selection", "0 nodes");
    else fail("G2 — still no .cc-msg-why after the new selection", `${after.whyNodes} node(s) appeared (BRIEF-WHYWRONG-OFF-1)`);
    if (after.priorMarks === 0) pass("G2 — prior-attempt ✕/tint cleared", "0 marks");
    else fail("G2 — prior-attempt ✕/tint cleared", `${after.priorMarks} stale mark(s)`);
    if (after.hintVisible) pass("G2 — the hint SURVIVES the retry (help accumulates, law 4)", "hint bubble still visible");
    else fail("G2 — the hint survives the retry", "the hint vanished — earned help must not be withdrawn (law 4)");
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

/* ══ G10 — a right answer written differently is never painted wrong (10,12) ══ */
async function g10(browser) {
  console.log(`\n${C.b}── G10: a correct answer keeps NO red box; a wrong one keeps it (rules 10, 12) ──${C.x}`);
  // fill-blank case: type `typed`, expect graded correct AND no .incorrect.
  async function fillCase(fx, typed, name) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(fx), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .blank-input", { timeout: 8000 });
      const inp = page.locator(".pv-frame .blank-input").first();
      await inp.click(); await inp.pressSequentially(typed, { delay: 25 });
      await clickCheck(page);
      const st = await page.evaluate(() => ({
        graded: document.querySelector(".pv-frame .qbody").classList.contains("is-checked"),
        wrong: document.querySelector(".pv-frame .blank-input").classList.contains("incorrect"),
      }));
      if (st.graded && !st.wrong) pass(`${name}`, `graded correct, box unpainted (typed ${JSON.stringify(typed)})`);
      else fail(`${name}`, `graded=${st.graded} redBox=${st.wrong} — the painter disagrees with the grader (rules 10/12)`);
      if (errs.length) fail(`${name} — zero page errors`, errs.join(" | "));
    } catch (e) { fail(`${name} — drive`, e.message); }
    finally { await page.close(); }
  }
  // expression case: wantCorrect true => correct+clean; false => wrong+painted (sabotage).
  async function exprCase(fx, typed, wantCorrect, name) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(fx), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .ans-input", { timeout: 8000 });
      const inp = page.locator(".pv-frame .ans-input").first();
      await inp.click(); await inp.pressSequentially(typed, { delay: 25 });
      await clickCheck(page);
      const st = await page.evaluate(() => ({
        graded: document.querySelector(".pv-frame .qbody").classList.contains("is-checked"),
        wrong: document.querySelector(".pv-frame .ans-input").classList.contains("incorrect"),
      }));
      if (wantCorrect) {
        if (st.graded && !st.wrong) pass(`${name}`, `graded correct, box unpainted (typed ${JSON.stringify(typed)})`);
        else fail(`${name}`, `graded=${st.graded} redBox=${st.wrong} — commutative sum painted wrong (rules 10/12)`);
      } else {
        if (!st.graded && st.wrong) pass(`${name} (sabotage)`, `graded WRONG and painted wrong, as it must be`);
        else fail(`${name} (sabotage)`, `graded=${st.graded} redBox=${st.wrong} — a non-commutative op must stay wrong AND painted`);
      }
      if (errs.length) fail(`${name} — zero page errors`, errs.join(" | "));
    } catch (e) { fail(`${name} — drive`, e.message); }
    finally { await page.close(); }
  }
  await fillCase(FX_G10_COMMA, "42,613", "G10a — comma form 42,613 correct + no red box");
  await fillCase(FX_G10_INDIAN, "1,00,000", "G10b — Indian form 1,00,000 correct + no red box");
  await exprCase(FX_G10_EXPR, "16+31=47", true, "G10c — commutative sum 16+31=47 correct + no red box");
  await exprCase(FX_G10_SABO, "4 - 9 = 5", false, "G10d — subtraction 4-9=5 wrong + red box");
}

/* ══ G11 — multi-select shows what the child picked (rule 12) ══ */
async function g11(browser) {
  console.log(`\n${C.b}── G11: a correct pick stays distinct from a never-chosen option; the wrong pick keeps its ✕ (rule 12) ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  try {
    await page.setContent(makePage(FX_G11_MULTI), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
    await clickOption(page, "12");   // correct
    await clickOption(page, "15");   // wrong
    await clickCheck(page);
    // Settle: move the pointer off every card element and let the .opt/.check-ind
    // 150ms transitions finish, so we compare RESTING looks — not a mid-fade
    // artifact (the is-sel→rest fade briefly makes a just-deselected option differ
    // from a never-chosen one, which would falsely pass this guard).
    await page.mouse.move(1, 1);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const opt = (v) => [...document.querySelectorAll(".opt")].find((o) => o.dataset.val === v);
      const sig = (o) => {
        const cs = getComputedStyle(o), ind = o.querySelector(".check-ind"), is = ind ? getComputedStyle(ind) : null;
        return [cs.borderColor, cs.backgroundColor, cs.boxShadow, is ? is.backgroundColor : "", is ? is.borderColor : ""].join("|");
      };
      const picked = opt("12"), never = opt("20"), wrong = opt("15");
      return { pickedSig: sig(picked), neverSig: sig(never), wrongHasX: !!wrong.querySelector(".cc-x") };
    });
    if (r.pickedSig !== r.neverSig) pass("G11 — correct pick stays visually distinct from a never-chosen option", "signatures differ");
    else fail("G11 — correct pick stays visually distinct from a never-chosen option", `both render identically — the child cannot tell what they picked (rule 12). sig=${r.pickedSig}`);
    if (r.wrongHasX) pass("G11 — wrong pick carries its ✕", "cc-x present");
    else fail("G11 — wrong pick carries its ✕", "no ✕ on the wrong pick");
    if (errs.length) fail("G11 — zero page errors", errs.join(" | "));
  } catch (e) { fail("G11 — drive", e.message); }
  finally { await page.close(); }
}

/* ══ G12 — Try again is a fresh start; the hint survives (rule 2) ══
   AMENDED 2026-07-24 (BRIEF-WHYWRONG-OFF-1, ruled by Venkat): whyWrong is
   SWITCHED OFF product-wide. The old G12 asserted the whyWrong panel appears
   on the wrong pick and is HIDDEN after Try again. Amended to the strictly
   stronger claim: NO .cc-msg-why ever appears in any state. The hint-survival
   assertions (rule 2) are UNCHANGED — the wrong pick now auto-types the next
   forward rung ("Hint 2" here, after the pre-attempt "Hint 1"), and both
   survive the fresh start. Do not restore "appears then hides" without a new
   dated ruling. */
async function g12(browser) {
  console.log(`\n${C.b}── G12: "Try again" clears the wrong-answer feedback but KEEPS the hint (rule 2; whyWrong OFF) ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  try {
    await page.setContent(makePage(FX_G12), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
    await clickHint(page);                              // open a hint BEFORE answering
    await page.waitForSelector(".cc-msg", { timeout: 8000 });
    await page.waitForTimeout(800);                     // let the bubble FINISH typing (fill is 650ms)
    await clickOption(page, "45");                      // wrong pick (authored whyWrong)
    await clickCheck(page);
    if (!(await waitForRetry(page, 9000))) { fail("G12 — reach Try again", "no Try again after a wrong pick"); return; }
    const atWrong = await page.evaluate(() => document.querySelectorAll(".cc-msg-why").length);
    if (atWrong === 0) pass("G12 — no .cc-msg-why on the wrong pick (whyWrong is OFF)", "0 nodes");
    else fail("G12 — no .cc-msg-why on the wrong pick", `${atWrong} node(s) — a child can see a whyWrong message (BRIEF-WHYWRONG-OFF-1)`);
    await clickRetry(page);
    const st = await page.evaluate((visSrc) => {
      const vis = eval("(" + visSrc + ")");
      const hints = [...document.querySelectorAll(".cc-msg")].filter((m) => !m.classList.contains("cc-msg-why"));
      const q = document.querySelector(".pv-frame .qbody");
      return {
        whyNodes: document.querySelectorAll(".cc-msg-why").length,
        hintCount: hints.length,
        hintsVisible: hints.length > 0 && hints.every(vis),
        selCleared: q.querySelectorAll(".is-sel").length === 0,
        marksCleared: q.querySelectorAll(".cc-x, .cc-tried, .incorrect").length === 0,
      };
    }, VIS_FN);
    if (st.whyNodes === 0) pass("G12 — still no .cc-msg-why after Try again", "0 nodes");
    else fail("G12 — still no .cc-msg-why after Try again", `${st.whyNodes} node(s) (BRIEF-WHYWRONG-OFF-1)`);
    if (st.selCleared) pass("G12 — selection cleared", "0 selected");
    else fail("G12 — selection cleared", "a selection survived Try again");
    if (st.marksCleared) pass("G12 — red tint / ✕ marks cleared", "0 marks");
    else fail("G12 — red tint / ✕ marks cleared", "prior-attempt marks survived Try again");
    if (st.hintCount >= 2 && st.hintsVisible) pass("G12 — the HINTS survive Try again (rule 2: help the child earned stays)", `${st.hintCount} hint bubble(s) visible`);
    else fail("G12 — the HINTS survive Try again", `expected the pre-attempt hint + the auto-typed rung both visible, got count=${st.hintCount} allVisible=${st.hintsVisible} (rule 2)`);
    if (errs.length) fail("G12 — zero page errors", errs.join(" | "));
  } catch (e) { fail("G12 — drive", e.message); }
  finally { await page.close(); }
}

/* ══ G13 — the explain line is gone; rule-6 first-wrong reveals nothing (rule 13) ══ */
async function g13(browser) {
  console.log(`\n${C.b}── G13: no state renders an explain line; first wrong reveals no answer (rules 13, 6) ──${C.x}`);
  // G13a — a CORRECT answer must render NO explain line.
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(FX_G13), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .blank-input", { timeout: 8000 });
      const inp = page.locator(".pv-frame .blank-input").first();
      await inp.click(); await inp.pressSequentially("110", { delay: 25 });
      await clickCheck(page);
      const st = await page.evaluate((visSrc) => {
        const vis = eval("(" + visSrc + ")");
        return {
          graded: document.querySelector(".pv-frame .qbody").classList.contains("is-checked"),
          explainVisible: vis(document.querySelector(".pv-frame .explain")),
        };
      }, VIS_FN);
      if (st.graded && !st.explainVisible) pass("G13a — a correct answer renders NO explain line", "explain not visible");
      else fail("G13a — a correct answer renders NO explain line", `graded=${st.graded} explainVisible=${st.explainVisible} — the removed explain line still paints (rule 13)`);
      if (errs.length) fail("G13a — zero page errors", errs.join(" | "));
    } catch (e) { fail("G13a — drive", e.message); }
    finally { await page.close(); }
  }
  // G13b — first wrong, no whyWrong: red mark shows, but NO answer reveal (rule 6).
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(FX_G13), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .blank-input", { timeout: 8000 });
      const inp = page.locator(".pv-frame .blank-input").first();
      await inp.click(); await inp.pressSequentially("99", { delay: 25 });
      await clickCheck(page);
      const st = await page.evaluate((visSrc) => {
        const vis = eval("(" + visSrc + ")");
        return {
          graded: document.querySelector(".pv-frame .qbody").classList.contains("is-checked"),
          redMark: document.querySelector(".pv-frame .blank-input").classList.contains("incorrect"),
          explainVisible: vis(document.querySelector(".pv-frame .explain")),
        };
      }, VIS_FN);
      if (st.redMark) pass("G13b — first wrong shows the red mark", "blank tinted incorrect");
      else fail("G13b — first wrong shows the red mark", "no red mark on a wrong answer (rule 5)");
      if (!st.graded && !st.explainVisible) pass("G13b — first wrong reveals NO answer (rule 6)", "not checked, explain not visible");
      else fail("G13b — first wrong reveals NO answer (rule 6)", `graded=${st.graded} explainVisible=${st.explainVisible} — answer revealed while an attempt remains (rule 6)`);
      if (errs.length) fail("G13b — zero page errors", errs.join(" | "));
    } catch (e) { fail("G13b — drive", e.message); }
    finally { await page.close(); }
  }
}

/* ══ G14 — ordering marks the misplaced tiles, not the correct ones (rule 14) ══ */
async function g14(browser) {
  console.log(`\n${C.b}── G14: the two out-of-place tiles are marked; the two correct ones are not; the order is NOT revealed (rules 14, 6) ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  try {
    await page.setContent(makePage(FX_G14_ORDER), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .tile", { timeout: 8000 });
    // Child's order: slot0<-3,024 slot1<-3,204 slot2<-3,402 slot3<-3,240 (last two swapped).
    const plan = [["3,024", 0], ["3,204", 1], ["3,402", 2], ["3,240", 3]];
    for (const [val, slot] of plan) { await clickTile(page, val); await clickSlot(page, slot); }
    // Sanity: all four slots filled before Check.
    const filled = await page.evaluate(() => document.querySelectorAll(".order-slot.filled").length);
    if (filled !== 4) { fail("G14 — place all four tiles", `only ${filled}/4 slots filled — driving failed`); return; }
    await clickCheck(page);
    // Settle: move the pointer off every tile and let the .tile 150ms transitions
    // finish, so we compare RESTING looks. The last-placed tile is briefly hovered
    // / mid-transition, which would otherwise make it differ from a correct tile
    // for the wrong reason.
    await page.mouse.move(1, 1);
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const slots = [...document.querySelectorAll(".order-slot")];
      const tile = (i) => slots[i].querySelector(".tile");
      const sig = (t) => { const cs = getComputedStyle(t); return [cs.borderColor, cs.borderTopColor, cs.boxShadow, cs.backgroundColor, cs.color].join("|"); };
      const ref = sig(tile(0)); // slot0 is correctly placed — the baseline "not wrong" look
      return {
        s2distinct: sig(tile(2)) !== ref,
        s3distinct: sig(tile(3)) !== ref,
        s1SameAsRef: sig(tile(1)) === ref,
        correctClass: document.querySelector(".order-slots").classList.contains("correct"),
        orderPreserved: tile(2).dataset.val === "3,402" && tile(3).dataset.val === "3,240",
      };
    });
    if (r.s2distinct && r.s3distinct) pass("G14 — both misplaced tiles carry wrong-styling", "slots 2 & 3 differ from a correctly-placed tile");
    else fail("G14 — both misplaced tiles carry wrong-styling", `s2=${r.s2distinct} s3=${r.s3distinct} — misplaced tiles are not individually marked (rule 14)`);
    if (r.s1SameAsRef) pass("G14 — correctly-placed tiles carry NO wrong-styling", "slots 0 & 1 share the baseline look");
    else fail("G14 — correctly-placed tiles carry NO wrong-styling", "a correctly-placed tile was marked wrong (rule 14)");
    if (!r.correctClass && r.orderPreserved) pass("G14 (sabotage) — the correct order is NOT revealed", "tiles stay in the child's order, no green");
    else fail("G14 (sabotage) — the correct order is NOT revealed", `correctClass=${r.correctClass} orderPreserved=${r.orderPreserved} — marking must not reveal placement (rule 6)`);
    if (errs.length) fail("G14 — zero page errors", errs.join(" | "));
  } catch (e) { fail("G14 — drive", e.message); }
  finally { await page.close(); }
}

/* ══ G15 — regression: the four RETRY-STATE-2 fixes still hold ══ */
async function g15(Rao, browser) {
  console.log(`\n${C.b}── G15 (regression): comma/Indian grading · addition commutativity · box width · typed-value clearing ──${C.x}`);
  // Grading trio (most at risk from Phase-2's shared-normaliser refactor).
  const gcases = [
    { b: "fill-blanks", u: ["42,613"], k: ["42613"], want: true, why: "comma grouping (#84)" },
    { b: "fill-blanks", u: ["1,00,000"], k: ["100000"], want: true, why: "Indian lakh grouping (#84)" },
    { b: "fill-blanks", u: ["4,2613"], k: ["42613"], want: false, why: "misplaced comma stays wrong (sabotage)" },
    { b: "expression", u: ["16+31=47"], k: ["31 + 16 = 47"], want: true, why: "addition commutativity (#109)" },
  ];
  for (const c of gcases) {
    const got = Rao.check(c.b, c.u, c.k);
    if (got === c.want) pass(`G15 — ${c.why}`, `check returned ${got}`);
    else fail(`G15 — ${c.why}`, `check returned ${got}, expected ${c.want} — RETRY-STATE-2 grading regressed`);
  }
  // Box width (#85): the 6-digit key must not clip. Typed clearing (#88): the box
  // is empty after Try again. Both reuse the existing fixtures at one viewport.
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  try {
    await page.setContent(makePage(FX_FILLBLANK), { waitUntil: "load" });
    await page.waitForSelector(".pv-frame .blank-input", { timeout: 8000 });
    const inp = page.locator(".pv-frame .blank-input").first();
    await inp.click(); await inp.pressSequentially("99999", { delay: 20 });
    const clipped = await page.evaluate(() => { const el = document.querySelector(".pv-frame .blank-input"); return el.scrollWidth > el.clientWidth + 1; });
    if (!clipped) pass("G15 — the answer box is not clipped (#85)", "scrollWidth <= clientWidth");
    else fail("G15 — the answer box is not clipped (#85)", "box clips its digits — RETRY-STATE-2 width fix regressed");
    await clickCheck(page);
    if (!(await waitForRetry(page, 9000))) { fail("G15 — reach Try again", "no Try again after a wrong fill-blank"); }
    else {
      await clickRetry(page);
      const val = await page.evaluate(() => document.querySelector(".pv-frame .blank-input").value);
      if (val === "") pass("G15 — the box is empty on Try again (#88)", "value cleared");
      else fail("G15 — the box is empty on Try again (#88)", `value=${JSON.stringify(val)} — typed-clearing regressed`);
    }
    if (errs.length) fail("G15 — zero page errors", errs.join(" | "));
  } catch (e) { fail("G15 — drive", e.message); }
  finally { await page.close(); }
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
    // BRIEF-INTERACTION-CONFORM-1 — G10–G15.
    await g10(browser);
    await g11(browser);
    await g12(browser);
    await g13(browser);
    await g14(browser);
    await g15(Rao, browser);
  } finally { await browser.close(); }

  console.log(`\n${failures ? C.r : C.g}${C.b}${failures ? failures + " assertion(s) FAILED" : "all retry-state guards passed"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})();
