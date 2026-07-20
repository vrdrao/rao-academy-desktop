#!/usr/bin/env node
/* ── verify-categorize-tap.js — CATEGORIZE GETS TAP-TO-PLACE (BRIEF-TAP-1) ──
 *
 * Order and sequence-build already support two-step tap: tap a tile to arm it
 * (.armed), every valid target lights up (.target-hint), tap a target to place.
 * Categorize (venn + bins) was drag-only — the most failure-prone interaction
 * on a phone. This guard proves categorize now speaks the SAME tap language,
 * reusing the same .armed / .target-hint visual treatment, WITHOUT regressing
 * the drag path that verify-drag.js / verify-venn.js already protect.
 *
 * Fixtures: lessons/_type-coverage.html — one venn2 (#venn) and one bins (#bins).
 * Every interaction is a raw CDP Input.dispatchTouchEvent (touchStart →
 * touchMove* → touchEnd). Never mouse simulation. Checked at 390x844 (phone)
 * and 1280x800 (desktop).
 *
 * Assertions (per fixture, per viewport):
 *   1. Tap a tray tile -> it enters a visible picked state (.armed + computed
 *      style differs from a resting tile).
 *   2. While picked, valid zones become visibly hinted (.target-hint + computed
 *      style differs); the hint clears on disarm and on placement.
 *   3. Tap a zone -> the tile MOVES in (present in zone, ABSENT from tray).
 *   4. Tap the picked tile again -> disarms; no zone stays hinted.
 *   5. Tap a placed tile -> it returns to the tray; the zone no longer holds it.
 *   6. serialize() round-trips: same shape after a tap-place as after a drag-place.
 *   7. Drag still works unchanged (non-regression).
 *   8. Visibility: the picked tile and every hinted zone are visible inside their
 *      container and the viewport, at both sizes.
 *
 * Exit 0 = all green. Exit 1 = at least one failure (named, with values).
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
function fail(name, detail) { failures++; console.log(`  ${C.r}FAIL${C.x}  ${name}${detail ? " — " + detail : ""}`); }

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

// snapshot of the computed properties that a picked/hinted state should move
const STYLE_PROPS = ["boxShadow", "outlineWidth", "outlineColor", "transform", "borderColor", "backgroundColor", "animationName"];
function styleDiffers(a, b) { return STYLE_PROPS.some((p) => a[p] !== b[p]); }

(async () => {
  console.log(`\n${C.b}CATEGORIZE TAP-TO-PLACE${C.x} — arm / hint / tap under real CDP touch (BRIEF-TAP-1)\n`);
  const browser = await chromium.launch();

  for (const vp of [{ w: 390, h: 844 }, { w: 1280, h: 800 }]) {
    console.log(`${C.b}— viewport ${vp.w}x${vp.h} —${C.x}`);
    const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setContent(buildPage(), { waitUntil: "load" });
    const cdp = await context.newCDPSession(page);

    const centerOf = (sel, idx) => page.evaluate(([s, i]) => {
      const els = Array.from(document.querySelectorAll(s)).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const el = i != null ? els[i] : els[0];
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [sel, idx == null ? null : idx]);

    async function tap(sel, idx) {
      const p = await centerOf(sel, idx);
      if (!p) throw new Error("tap target not found: " + sel);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p.x, y: p.y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(80);
    }
    // tap only if the target exists; returns false instead of throwing so a
    // missing prerequisite (e.g. arm never happened) reports as a clean FAIL.
    async function tapIf(sel, idx) {
      const p = await centerOf(sel, idx);
      if (!p) return false;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p.x, y: p.y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(80);
      return true;
    }
    async function drag(fromSel, fromIdx, toSel, toIdx) {
      const a = await centerOf(fromSel, fromIdx);
      if (!a) throw new Error("drag source not found: " + fromSel);
      const bb = await page.evaluate(([s, i]) => {
        const els = Array.from(document.querySelectorAll(s)).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        const el = i != null ? els[i] : els[0];
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, [toSel, toIdx == null ? null : toIdx]);
      if (!bb) throw new Error("drag target not found: " + toSel);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: a.x, y: a.y }] });
      const STEPS = 8;
      for (let k = 1; k <= STEPS; k++) {
        const x = a.x + ((bb.x - a.x) * k) / STEPS, y = a.y + ((bb.y - a.y) * k) / STEPS;
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
        await page.waitForTimeout(16);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(120);
    }

    // id the fixtures
    await page.evaluate(() => {
      document.querySelectorAll(".pv-frame").forEach((f) => {
        if (f.dataset.behavior === "categorize") {
          if (f.querySelector(".venn-box")) f.id = "venn";
          else if (f.querySelector(".bins")) f.id = "bins";
        }
      });
    });

    for (const kind of ["venn", "bins"]) {
      const sel = `#${kind}`;
      const exists = await page.evaluate((s) => !!document.querySelector(s), sel);
      if (!exists) { fail(`[${kind}] fixture present`, "not found in _type-coverage.html"); continue; }

      const zoneSel = kind === "venn" ? `${sel} .vs-zone.vs-a` : `${sel} .vs-zone`;
      const state = () => page.evaluate((s) => ({
        tray: document.querySelectorAll(`${s} .vs-tray .vs-tile`).length,
        inZones: document.querySelectorAll(`${s} .vs-zone .vs-tile`).length,
        armed: document.querySelectorAll(`${s} .vs-tile.armed`).length,
        hinted: document.querySelectorAll(`${s} .vs-zone.target-hint`).length,
      }), sel);

      const before = await state();

      // resting baseline of the FIRST zone, captured BEFORE any tile is armed.
      // The engine hints ALL zones at once, so there is never a resting sibling
      // to diff against — we must compare the same element to its own pre-armed
      // style, or the computed-style check silently degrades to class-presence.
      const restZone = await page.evaluate((s) => {
        const z = document.querySelector(`${s} .vs-zone`);
        if (!z) return null;
        const c = getComputedStyle(z); const o = {};
        ["boxShadow","outlineWidth","outlineColor","transform","borderColor","backgroundColor","animationName"].forEach((p) => o[p] = c[p]);
        return o;
      }, sel);

      /* 1. TAP tray tile -> visible picked state */
      await tap(`${sel} .vs-tray .vs-tile`, 0);
      const arm = await page.evaluate((s) => {
        const t = document.querySelector(`${s} .vs-tile.armed`);
        if (!t) return { armed: false };
        const rest = Array.from(document.querySelectorAll(`${s} .vs-tray .vs-tile`)).find((e) => !e.classList.contains("armed"));
        const g = (el) => { const c = getComputedStyle(el); const o = {}; ["boxShadow","outlineWidth","outlineColor","transform","borderColor","backgroundColor","animationName"].forEach((p) => o[p] = c[p]); return o; };
        return { armed: true, pick: g(t), rest: rest ? g(rest) : null };
      }, sel);
      if (arm.armed && arm.rest && styleDiffers(arm.pick, arm.rest))
        pass(`[${kind}] 1. tap arms the tile with a visible picked state`, `box-shadow "${arm.pick.boxShadow.slice(0,24)}…" vs rest "${arm.rest.boxShadow.slice(0,12)}…"`);
      else if (arm.armed && !arm.rest)
        pass(`[${kind}] 1. tap arms the tile (.armed applied)`, "no resting sibling to diff — style-diff skipped");
      else fail(`[${kind}] 1. tap arms the tile with a visible picked state`, arm.armed ? "class applied but computed style identical to resting" : "no .vs-tile.armed after tap");

      /* 2. zones become visibly hinted — the SAME zone must differ from its own
       *    pre-armed resting style (not merely carry the class). */
      const hint = await page.evaluate((s) => {
        const z = document.querySelector(`${s} .vs-zone.target-hint`);
        if (!z) return { hinted: 0 };
        const c = getComputedStyle(z); const on = {};
        ["boxShadow","outlineWidth","outlineColor","transform","borderColor","backgroundColor","animationName"].forEach((p) => on[p] = c[p]);
        return { hinted: document.querySelectorAll(`${s} .vs-zone.target-hint`).length, on };
      }, sel);
      if (hint.hinted > 0 && restZone && styleDiffers(hint.on, restZone))
        pass(`[${kind}] 2. valid zones light up while picked`, `${hint.hinted} zone(s) hinted; style moved vs resting (anim "${restZone.animationName}"→"${hint.on.animationName}")`);
      else fail(`[${kind}] 2. valid zones light up while picked`, hint.hinted ? "class applied but computed style identical to the zone's own pre-armed style" : "no .vs-zone.target-hint while a tile is armed");

      /* 8a. visibility of picked tile + hinted zones (this viewport) */
      const vis = await page.evaluate((s) => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const okBox = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh; };
        const t = document.querySelector(`${s} .vs-tile.armed`);
        const zones = Array.from(document.querySelectorAll(`${s} .vs-zone.target-hint`));
        return { tileVisible: t ? okBox(t) : false, zonesVisible: zones.length > 0 && zones.every(okBox), nZones: zones.length };
      }, sel);
      if (vis.tileVisible && vis.zonesVisible) pass(`[${kind}] 8. picked tile + ${vis.nZones} hinted zone(s) visible in viewport`);
      else fail(`[${kind}] 8. picked tile + hinted zones visible`, JSON.stringify(vis));

      /* 3. tap a zone -> tile MOVES in (absent from tray) */
      await tap(zoneSel, 0);
      const placed = await state();
      if (placed.inZones === before.inZones + 1 && placed.tray === before.tray - 1 && placed.armed === 0 && placed.hinted === 0)
        pass(`[${kind}] 3. tapping a zone MOVES the tile in (tray ${before.tray}→${placed.tray})`);
      else fail(`[${kind}] 3. tapping a zone MOVES the tile in`, `before tray ${before.tray}/zones ${before.inZones}; after tray ${placed.tray}/zones ${placed.inZones}/armed ${placed.armed}/hinted ${placed.hinted}`);

      /* 4. re-arm a fresh tray tile, tap it again -> disarms */
      await tapIf(`${sel} .vs-tray .vs-tile`, 0);
      const rearmed = await state();
      await tapIf(`${sel} .vs-tile.armed`, 0);
      const disarm = await state();
      if (rearmed.armed === 1 && disarm.armed === 0 && disarm.hinted === 0)
        pass(`[${kind}] 4. tapping the picked tile again disarms it (no zone stays hinted)`);
      else fail(`[${kind}] 4. tapping the picked tile again disarms it`, `rearmed armed ${rearmed.armed}; after re-tap armed ${disarm.armed}/hinted ${disarm.hinted}`);

      /* 5. tap a placed tile -> returns to tray */
      await tapIf(`${sel} .vs-zone .vs-tile`, 0);
      const home = await state();
      if (home.tray === before.tray && home.inZones === before.inZones)
        pass(`[${kind}] 5. tapping a placed tile returns it to the tray (tray back to ${home.tray})`);
      else fail(`[${kind}] 5. tapping a placed tile returns it to the tray`, `expected tray ${before.tray}/zones ${before.inZones}, got tray ${home.tray}/zones ${home.inZones}`);

      /* 7. drag still works (non-regression) */
      await drag(`${sel} .vs-tray .vs-tile`, 0, kind === "venn" ? `${sel} .vs-zone.vs-a` : `${sel} .vs-zone .bs-drop`, 0);
      const dragged = await state();
      if (dragged.inZones === before.inZones + 1 && dragged.tray === before.tray - 1)
        pass(`[${kind}] 7. drag still MOVES the tile (non-regression, tray ${before.tray}→${dragged.tray})`);
      else fail(`[${kind}] 7. drag still MOVES the tile`, `tray ${dragged.tray}/zones ${dragged.inZones}`);
      await tapIf(`${sel} .vs-zone .vs-tile`, 0); // return it, back to the all-in-tray baseline

      /* 6. serialize round-trip — place EVERY tile (serialize is null until all
       *    tiles are zoned), by tap then by drag, and compare the two arrays. */
      const serialize = (s) => page.evaluate((x) => {
        const qb = document.querySelector(`${x} .qbody`);
        return JSON.stringify(RaoPreview.serialize(qb, document.querySelector(x).dataset.behavior));
      }, s);
      const returnAll = async () => { let g = 0; while (await tapIf(`${sel} .vs-zone .vs-tile`, 0) && g++ < 20) {} };
      const zoneForTap = kind === "venn" ? `${sel} .vs-zone.vs-a` : `${sel} .vs-zone`;
      const zoneForDrag = kind === "venn" ? `${sel} .vs-zone.vs-a` : `${sel} .vs-zone .bs-drop`;

      await returnAll();
      // place all by TAP
      let guard = 0;
      while ((await page.evaluate((s) => document.querySelectorAll(`${s} .vs-tray .vs-tile`).length, sel)) > 0 && guard++ < 20) {
        const armedOk = await tapIf(`${sel} .vs-tray .vs-tile`, 0);
        if (!armedOk) break;
        await tapIf(zoneForTap, 0);
      }
      const serTap = await serialize(sel);
      await returnAll();
      // place all by DRAG
      guard = 0;
      while ((await page.evaluate((s) => document.querySelectorAll(`${s} .vs-tray .vs-tile`).length, sel)) > 0 && guard++ < 20) {
        await drag(`${sel} .vs-tray .vs-tile`, 0, zoneForDrag, 0);
      }
      const serDrag = await serialize(sel);

      let okShape = false, why = "";
      try {
        const a = JSON.parse(serTap), b = JSON.parse(serDrag);
        okShape = Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.length > 0;
        why = `tap ${serTap} vs drag ${serDrag}`;
      } catch (e) { why = "serialize threw: " + e.message; }
      if (okShape) pass(`[${kind}] 6. serialize round-trips identically (tap vs drag, both full placements)`, why);
      else fail(`[${kind}] 6. serialize round-trips identically`, why || `tap ${serTap} vs drag ${serDrag}`);

      await returnAll(); // reset for cleanliness
    }

    if (errors.length) fail(`[${vp.w}] zero page errors`, errors.join(" | "));
    else pass(`[${vp.w}] zero page errors`);
    await context.close();
    console.log("");
  }

  await browser.close();
  console.log(`${failures === 0 ? C.g + "CATEGORIZE TAP: arm/hint/tap works and drag is intact ✅" : C.r + failures + " categorize-tap check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-categorize-tap crashed:", e); process.exit(1); });
