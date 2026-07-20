#!/usr/bin/env node
/* ── verify-venn.js — VENN TILES SIT INSIDE ONE REGION (BRIEF-3 Item D) ──
 *
 * Venkat's report (symmetry_set2 Q17): dropped tiles straddle region
 * boundaries — one across the left circle's edge, one across the intersection
 * boundary. A child cannot tell which region their own answer is in.
 *
 * This guard builds EVERY venn2 question in the corpus through the real
 * engine, places every tile into its ANSWER region via the exact call the
 * drop path performs (dropOf(zone).appendChild(tile) — the touch mechanics of
 * that path are proven separately by verify-drag.js), and then asserts
 * GEOMETRIC containment against the real rendered circle geometry:
 *
 *   region A   — every tile corner inside the LEFT disk, and the tile's
 *                nearest point to the right centre outside the RIGHT disk
 *   region B   — mirror
 *   region AB  — every corner inside BOTH disks
 *   region OUT — nearest point to either centre outside both disks
 *
 * Checked at BOTH viewports (1280px and 390px — the venn box scales by
 * transform below 480px). Exit 0 = every placed tile wholly inside its
 * region. Exit 1 = at least one straddler (named, with overhang px).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", x: "\x1b[0m" };

function collectLessons(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "_preview") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(collectLessons(full));
    else if (e.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function buildPage() {
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  const vennLessons = collectLessons(path.join(ROOT, "lessons"))
    .filter((f) => /layout:\s*venn2/.test(fs.readFileSync(f, "utf8")));
  const sources = vennLessons.map((f) => {
    const html = fs.readFileSync(f, "utf8");
    const a = html.indexOf('<div id="source">');
    const b = html.indexOf('<div id="preview"');
    const src = html.slice(a, b > a ? b : undefined);
    const rel = path.relative(path.join(ROOT, "lessons"), f).replace(/\\/g, "/");
    return `<div class="src-blob">${src.replace('<div id="source">', `<div class="lsrc" data-file="${rel}">`)}</div>`;
  }).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
${sources}
<div class="rao-lesson" data-theme="grape"><div id="mount"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>
window.__venn = [];
document.querySelectorAll(".lsrc").forEach(function (blob) {
  const qs = RaoPreview.build('<div id="source">' + blob.innerHTML + '</div>');
  qs.forEach(function (q, i) {
    if (q.behavior !== "categorize" || q.markup.indexOf("venn-box") < 0) return;
    const holder = document.createElement("div");
    holder.innerHTML = q.markup;
    document.getElementById("mount").appendChild(holder);
    window.__venn.push({ file: blob.dataset.file, q: i + 1, root: holder, answer: q.answer });
  });
});
window.__venn.forEach(function (v) {
  const tiles = Array.prototype.slice.call(v.root.querySelectorAll(".vs-tile[data-idx]"));
  tiles.sort(function (a, b) { return Number(a.dataset.idx) - Number(b.dataset.idx); });
  tiles.forEach(function (t, i) {
    const z = v.root.querySelector('.vs-zone[data-region="' + v.answer[i] + '"]');
    if (z) (z.querySelector(".bs-drop") || z).appendChild(t); // exactly what the drop path does
  });
});
</script>
</body></html>`;
}

(async () => {
  console.log(`\n${C.b}VENN CONTAINMENT${C.x} — every placed tile wholly inside its region (BRIEF-3 Item D)\n`);
  const browser = await chromium.launch();
  let failures = 0;
  const page400 = buildPage();
  for (const vp of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: vp, height: 900 } });
    await page.setContent(page400, { waitUntil: "load" });
    await page.waitForTimeout(250);
    const rows = await page.evaluate(() => {
      const out = [];
      window.__venn.forEach((v) => {
        const L = v.root.querySelector(".venn-left").getBoundingClientRect();
        const R = v.root.querySelector(".venn-right").getBoundingClientRect();
        const cl = { x: L.left + L.width / 2, y: L.top + L.height / 2, r: L.width / 2 };
        const cr = { x: R.left + R.width / 2, y: R.top + R.height / 2, r: R.width / 2 };
        const dist = (p, c) => Math.hypot(p.x - c.x, p.y - c.y);
        const inDisk = (p, c) => dist(p, c) <= c.r;
        const corners = (r) => [{ x: r.left, y: r.top }, { x: r.right, y: r.top }, { x: r.left, y: r.bottom }, { x: r.right, y: r.bottom }];
        const nearest = (r, c) => ({ x: Math.max(r.left, Math.min(c.x, r.right)), y: Math.max(r.top, Math.min(c.y, r.bottom)) });
        v.root.querySelectorAll(".vs-zone .vs-tile").forEach((t) => {
          const region = t.closest(".vs-zone").dataset.region;
          const r = t.getBoundingClientRect();
          const cs = corners(r);
          let bad = null;
          if (region === "A") {
            if (!cs.every((p) => inDisk(p, cl))) bad = `crosses its own (left) circle edge by ${Math.max(...cs.map((p) => dist(p, cl) - cl.r)).toFixed(1)}px`;
            else if (inDisk(nearest(r, cr), cr)) bad = `crosses into the right circle by ${(cr.r - dist(nearest(r, cr), cr)).toFixed(1)}px`;
          } else if (region === "B") {
            if (!cs.every((p) => inDisk(p, cr))) bad = `crosses its own (right) circle edge by ${Math.max(...cs.map((p) => dist(p, cr) - cr.r)).toFixed(1)}px`;
            else if (inDisk(nearest(r, cl), cl)) bad = `crosses into the left circle by ${(cl.r - dist(nearest(r, cl), cl)).toFixed(1)}px`;
          } else if (region === "AB") {
            if (!cs.every((p) => inDisk(p, cl) && inDisk(p, cr))) bad = `crosses the lens boundary by ${Math.max(...cs.map((p) => Math.max(dist(p, cl) - cl.r, dist(p, cr) - cr.r))).toFixed(1)}px`;
          } else if (region === "OUT") {
            if (inDisk(nearest(r, cl), cl)) bad = `clips into the left circle by ${(cl.r - dist(nearest(r, cl), cl)).toFixed(1)}px`;
            else if (inDisk(nearest(r, cr), cr)) bad = `clips into the right circle by ${(cr.r - dist(nearest(r, cr), cr)).toFixed(1)}px`;
          }
          out.push({ file: v.file, q: v.q, region, bad, size: `${Math.round(r.width)}x${Math.round(r.height)}` });
        });
      });
      return out;
    });
    const bad = rows.filter((r) => r.bad);
    if (bad.length) {
      failures += bad.length;
      console.log(`  ${C.r}FAIL${C.x}  @${vp}px: ${bad.length}/${rows.length} placed tiles straddle a region boundary:`);
      bad.forEach((r) => console.log(`          ${r.file} Q${r.q} [${r.region}] tile ${r.size}: ${r.bad}`));
    } else {
      console.log(`  ${C.g}PASS${C.x}  @${vp}px: all ${rows.length} placed tiles wholly inside their regions (${new Set(rows.map((r) => r.file + r.q)).size} venn questions)`);
    }
    await page.close();
  }
  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "VENN: containment holds at both viewports ✅" : C.r + failures + " containment violation(s)"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-venn crashed:", e); process.exit(1); });
