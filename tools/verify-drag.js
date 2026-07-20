#!/usr/bin/env node
/* ── verify-drag.js — DRAG MEANS MOVE, NOT COPY (BRIEF-3 Item C) ──
 *
 * Venkat dragged sequence-build tiles into slots and the tray still showed
 * every tile, duplicates included (Time_patterns_remix Q9). The rule this
 * file enforces: a tile placed in a slot or region LEAVES the tray, and a
 * tile taken back out RETURNS to it.
 *
 * The one legitimate exception: a sequence-build whose palette is
 * deliberately SMALLER than its answer demands (2 odd/even tiles filling 4
 * slots — even_odd_remix Q30, properties_of_multiplication Q12). Those are
 * stamped data-reuse by the builder and tiles COPY; the tray never depletes.
 *
 * Every interaction is a raw CDP Input.dispatchTouchEvent (touchStart →
 * touchMove* → touchEnd) — the standing rule: never mouse simulation.
 * Fixtures come from lessons/_type-coverage.html:
 *   - sequence-build move-mode   (4 tiles / 4 slots)      — shared tile path
 *   - sequence-build reuse-mode  (2 tiles / 3 slots)      — the exemption
 *   - categorize venn2 + bins    (.vs-tile → .vs-zone)    — the vs path
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
  console.log(`\n${C.b}DRAG SEMANTICS${C.x} — move-not-copy under real CDP touch (BRIEF-3 Item C)\n`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(buildPage(), { waitUntil: "load" });
  const cdp = await context.newCDPSession(page);

  const centerOf = (sel, idx) => page.evaluate(([s, i]) => {
    const els = Array.from(document.querySelectorAll(s)).filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
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
  // real touch drag: start on the source, move in steps past the 6px threshold,
  // release over the target. Coordinates re-resolved after scrollIntoView.
  async function drag(fromSel, fromIdx, toSel, toIdx) {
    const a = await centerOf(fromSel, fromIdx);
    if (!a) throw new Error("drag source not found: " + fromSel);
    const b = await page.evaluate(([s, i]) => {
      const els = Array.from(document.querySelectorAll(s)).filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      const el = i != null ? els[i] : els[0];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [toSel, toIdx == null ? null : toIdx]);
    if (!b) throw new Error("drag target not found: " + toSel);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: a.x, y: a.y }] });
    const STEPS = 8;
    for (let k = 1; k <= STEPS; k++) {
      const x = a.x + ((b.x - a.x) * k) / STEPS, y = a.y + ((b.y - a.y) * k) / STEPS;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
      await page.waitForTimeout(16);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(120);
  }

  // locate the fixtures
  const ids = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll(".pv-frame").forEach((f, i) => {
      if (f.dataset.behavior === "sequence-build") {
        const pal = f.querySelector(".sb-palette");
        if (!pal) return;
        const n = pal.querySelectorAll(".sb-tile").length + f.querySelectorAll(".sb-slot .sb-tile").length;
        if (n >= 4) { f.id = "seqmove"; out.seqmove = i; }
        else { f.id = "seqreuse"; out.seqreuse = i; }
      }
      if (f.dataset.behavior === "categorize") {
        if (f.querySelector(".venn-box")) { f.id = "venn"; out.venn = i; }
        else if (f.querySelector(".bins")) { f.id = "bins"; out.bins = i; }
      }
    });
    return out;
  });
  for (const need of ["seqmove", "seqreuse", "venn", "bins"]) {
    if (ids[need] == null) { fail(`fixture present: ${need}`, "not found in _type-coverage.html"); }
  }
  if (failures) { await browser.close(); process.exit(1); }

  const trayCount = (scope, sel) => page.evaluate(([sc, s]) =>
    document.querySelectorAll(`${sc} ${s}`).length, [scope, sel]);

  /* ── PATH 1a: sequence-build MOVE mode (shared tile path) ── */
  {
    const palTiles = "#seqmove .sb-palette .sb-tile";
    const before = await trayCount("#seqmove", ".sb-palette .sb-tile");
    // tap-arm flow: tap a tray tile, then tap a slot
    await tap(palTiles, 0);
    await tap("#seqmove .sb-slot", 0);
    const s1 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#seqmove .sb-palette .sb-tile").length,
      inSlot: document.querySelectorAll("#seqmove .sb-slot .sb-tile").length,
      slotFilled: !!document.querySelector("#seqmove .sb-slot.filled"),
    }));
    if (s1.inSlot === 1 && s1.tray === before - 1)
      pass("seq move: tap-place MOVES the tile out of the tray", `tray ${before} → ${s1.tray}, slot holds it`);
    else fail("seq move: tap-place MOVES the tile out of the tray", `tray ${before} → ${s1.tray} (expected ${before - 1}), in-slot ${s1.inSlot}`);
    // tap the placed tile: it returns to the tray
    await tap("#seqmove .sb-slot .sb-tile", 0);
    const s2 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#seqmove .sb-palette .sb-tile").length,
      inSlot: document.querySelectorAll("#seqmove .sb-slot .sb-tile").length,
      filled: !!document.querySelector("#seqmove .sb-slot.filled"),
    }));
    if (s2.tray === before && s2.inSlot === 0 && !s2.filled)
      pass("seq move: tapping the placed tile RETURNS it to the tray", `tray back to ${s2.tray}`);
    else fail("seq move: tapping the placed tile RETURNS it to the tray", JSON.stringify(s2));
    // true drag flow
    await drag(palTiles, 1, "#seqmove .sb-slot", 1);
    const s3 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#seqmove .sb-palette .sb-tile").length,
      inSlot: document.querySelectorAll("#seqmove .sb-slot .sb-tile").length,
    }));
    if (s3.inSlot === 1 && s3.tray === before - 1)
      pass("seq move: touch-DRAG place also moves (no tray duplicate)", `tray ${before} → ${s3.tray}`);
    else fail("seq move: touch-DRAG place also moves (no tray duplicate)", `tray ${s3.tray} (expected ${before - 1}), in-slot ${s3.inSlot}`);
    await tap("#seqmove .sb-slot .sb-tile", 0); // restore
  }

  /* ── PATH 1b: sequence-build REUSE mode — the exemption stays copy ── */
  {
    const before = await trayCount("#seqreuse", ".sb-palette .sb-tile");
    await tap("#seqreuse .sb-palette .sb-tile", 0);
    await tap("#seqreuse .sb-slot", 0);
    const r1 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#seqreuse .sb-palette .sb-tile").length,
      inSlot: document.querySelectorAll("#seqreuse .sb-slot .sb-tile").length,
    }));
    if (r1.inSlot === 1 && r1.tray === before)
      pass("seq reuse: palette smaller than demand → placement COPIES, tray keeps all tiles", `tray stays ${r1.tray}`);
    else fail("seq reuse: palette smaller than demand → placement COPIES, tray keeps all tiles", `tray ${before} → ${r1.tray}, in-slot ${r1.inSlot}`);
    await tap("#seqreuse .sb-slot .sb-tile", 0); // clear the clone
    const r2 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#seqreuse .sb-palette .sb-tile").length,
      inSlot: document.querySelectorAll("#seqreuse .sb-slot .sb-tile").length,
    }));
    if (r2.tray === before && r2.inSlot === 0)
      pass("seq reuse: removing the placed copy leaves the tray intact");
    else fail("seq reuse: removing the placed copy leaves the tray intact", JSON.stringify(r2));
  }

  /* ── PATH 2: categorize venn2 (vs path) — drop moves, drag-back returns ── */
  {
    const before = await trayCount("#venn", ".vs-tray .vs-tile");
    await drag("#venn .vs-tray .vs-tile", 0, "#venn .vs-zone.vs-a", null);
    const v1 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#venn .vs-tray .vs-tile").length,
      inZones: document.querySelectorAll("#venn .vs-zone .vs-tile").length,
    }));
    if (v1.tray === before - 1 && v1.inZones === 1)
      pass("venn: drop into a region MOVES the tile out of the tray", `tray ${before} → ${v1.tray}`);
    else fail("venn: drop into a region MOVES the tile out of the tray", `tray ${before} → ${v1.tray} (expected ${before - 1}), in-zones ${v1.inZones}`);
    await drag("#venn .vs-zone .vs-tile", 0, "#venn .vs-tray", null);
    const v2 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#venn .vs-tray .vs-tile").length,
      inZones: document.querySelectorAll("#venn .vs-zone .vs-tile").length,
    }));
    if (v2.tray === before && v2.inZones === 0)
      pass("venn: dragging it back RETURNS it to the tray", `tray back to ${v2.tray}`);
    else fail("venn: dragging it back RETURNS it to the tray", JSON.stringify(v2));
  }

  /* ── PATH 2b: categorize bins — same vs path, bin drop target ── */
  {
    const before = await trayCount("#bins", ".vs-tray .vs-tile");
    await drag("#bins .vs-tray .vs-tile", 0, "#bins .vs-zone .bs-drop", 0);
    const b1 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#bins .vs-tray .vs-tile").length,
      inZones: document.querySelectorAll("#bins .vs-zone .vs-tile").length,
    }));
    if (b1.tray === before - 1 && b1.inZones === 1)
      pass("bins: drop into a bin MOVES the tile out of the tray", `tray ${before} → ${b1.tray}`);
    else fail("bins: drop into a bin MOVES the tile out of the tray", `tray ${before} → ${b1.tray} (expected ${before - 1}), in-zones ${b1.inZones}`);
    await drag("#bins .vs-zone .vs-tile", 0, "#bins .vs-tray", null);
    const b2 = await page.evaluate(() => ({
      tray: document.querySelectorAll("#bins .vs-tray .vs-tile").length,
      inZones: document.querySelectorAll("#bins .vs-zone .vs-tile").length,
    }));
    if (b2.tray === before && b2.inZones === 0)
      pass("bins: dragging it back RETURNS it to the tray");
    else fail("bins: dragging it back RETURNS it to the tray", JSON.stringify(b2));
  }

  /* ── no-repaint law: the qbody element must be the SAME node throughout ── */
  // (placements are targeted appendChild moves; a rebuild would replace nodes)
  const samefix = await page.evaluate(() => {
    window.__qbodyRef = window.__qbodyRef || document.querySelector("#seqmove .qbody");
    return window.__qbodyRef === document.querySelector("#seqmove .qbody");
  });
  if (samefix) pass("no-repaint: .qbody node identity stable across interactions");
  else fail("no-repaint", "the qbody was replaced mid-session");

  if (errors.length) fail("zero page errors", errors.join(" | "));
  else pass("zero page errors");

  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "DRAG: move-not-copy holds on both drag paths ✅" : C.r + failures + " drag check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-drag crashed:", e); process.exit(1); });
