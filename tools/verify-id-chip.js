#!/usr/bin/env node
/* ── verify-id-chip.js — THE ID CHIP IS A REVIEW-ONLY AFFORDANCE (BRIEF-IDCHIP-1) ──
 *
 * BRIEF-ID-1 gave every question a permanent id, surfaced as data-qid on the
 * rendered .qbody. This guard proves the review page now shows that id as a
 * small, copyable chip beside the .pv-ring counter — AND that the chip can never
 * reach the child-facing app card. The chip lives ONLY in make-review.js's
 * review-only post-mount furniture (the same class of mechanism as the .rvbar
 * summary bar); the app's render path (engine + rao-card.js) never emits it.
 *
 * Assertions, on a real on-disk review page at 1280x800 and 390x844:
 *   1. chips-on-page == questions-on-page.
 *   2. each chip's text == that card's data-qid, and matches the id scheme.
 *   3. the chip is visible (computed style + non-zero rect, inside container and
 *      viewport) — never markup presence alone.
 *   4. the chip does not overlap the .pv-ring counter or the Check/Hint controls.
 *   5. clicking the chip copies its text (clipboard) and shows a confirmation.
 *   6. THE MOST IMPORTANT ONE: the app card path — engine + rao-card.js, no
 *      make-review furniture — renders ZERO id chips.
 *
 * Run before the change: 1-5 FAIL, 6 PASSES. Exit 1 unless all six hold.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", x: "\x1b[0m" };
const ID_RE = /^q[23456789abcdefghijkmnpqrstuvwxyz]{8}$/;
const CHIP = ".id-chip";

// the lesson whose on-disk review page we drive (21 questions, known data-qids)
const LESSON = "lessons/subtract_numbers_up_to_five_digits.html";
const REVIEW = "review/subtract_numbers_up_to_five_digits.html";

let failures = 0;
function pass(n, d) { console.log(`  ${C.g}PASS${C.x}  ${n}${d ? " — " + d : ""}`); }
function fail(n, d) { failures++; console.log(`  ${C.r}FAIL${C.x}  ${n}${d ? " — " + d : ""}`); }

function sourceOf(html) { const a = html.indexOf('<div id="source">'); return html.slice(a, html.indexOf('<div id="preview"', a)); }

// The APP card path: exactly the files DEPLOY.md lists (engine + solution + card
// renderer), mounted the app way — but WITHOUT make-review's review-only furniture.
function appPathPage() {
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  const src = sourceOf(read(LESSON));
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
${src}
<div id="preview" class="rao-lesson" data-theme="grape"></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

async function chipData(page) {
  return page.evaluate((sel) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const frames = [...document.querySelectorAll(".pv-frame")];
    const inView = (r) => r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh;
    const overlaps = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
    return {
      frames: frames.length,
      chips: document.querySelectorAll(sel).length,
      rows: frames.map((f) => {
        const chip = f.querySelector(sel);
        const qb = f.querySelector(".qbody");
        const ring = f.querySelector(".pv-ring");
        const check = f.querySelector(".pv-check");
        const hint = f.querySelector(".pv-hint");
        if (!chip) return { hasChip: false };
        const cs = getComputedStyle(chip);
        const cr = chip.getBoundingClientRect();
        const contained = (() => { const hr = (f.querySelector(".pv-head") || f).getBoundingClientRect();
          return cr.left >= hr.left - 1 && cr.right <= hr.right + 1; })();
        return {
          hasChip: true,
          text: chip.textContent.trim(),
          dataQid: qb ? qb.getAttribute("data-qid") : null,
          display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
          w: +cr.width.toFixed(1), h: +cr.height.toFixed(1),
          visible: cs.display !== "none" && cs.visibility !== "hidden" && cr.width > 0 && cr.height > 0 && inView(cr) && contained,
          overlapRing: ring ? overlaps(cr, ring.getBoundingClientRect()) : false,
          overlapCheck: check ? overlaps(cr, check.getBoundingClientRect()) : false,
          overlapHint: hint ? overlaps(cr, hint.getBoundingClientRect()) : false,
        };
      }),
    };
  }, CHIP);
}

(async () => {
  console.log(`\n${C.b}ID CHIP${C.x} — review-only, copyable, never on the app card (BRIEF-IDCHIP-1)\n`);
  const browser = await chromium.launch();

  for (const vp of [{ w: 1280, h: 800 }, { w: 390, h: 844 }]) {
    console.log(`${C.b}— review page @ ${vp.w}x${vp.h} —${C.x}`);
    const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, permissions: ["clipboard-read", "clipboard-write"] });
    const page = await context.newPage();
    await page.goto("file://" + path.join(ROOT, REVIEW).replace(/\\/g, "/"));
    await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 0, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const d = await chipData(page);

    // 1. count
    if (d.chips === d.frames && d.frames > 0) pass(`1. chip per question (${d.chips}/${d.frames})`);
    else fail(`1. chip per question`, `${d.chips} chips vs ${d.frames} questions`);

    // 2. text == data-qid and matches scheme
    const withChip = d.rows.filter((r) => r.hasChip);
    const mismatched = withChip.filter((r) => r.text !== r.dataQid || !ID_RE.test(r.text));
    if (withChip.length === d.frames && mismatched.length === 0)
      pass(`2. each chip text == data-qid and matches id scheme`, `${withChip.length} chips e.g. ${withChip[0] ? withChip[0].text : "—"}`);
    else fail(`2. chip text == data-qid`, withChip.length ? `${mismatched.length} mismatched — e.g. ${mismatched.slice(0,2).map((r)=>`"${r.text}" vs ${r.dataQid}`).join(", ")}` : "no chips present");

    // 3. visible — a 21-card page is taller than the viewport, so each chip is
    //    scrolled INTO view before checking (the honest test of "visible inside
    //    its container and viewport"; a below-the-fold chip is not a hidden chip).
    const vis = await page.evaluate((sel) => {
      const vw = window.innerWidth, vh = window.innerHeight, bad = [];
      const chips = [...document.querySelectorAll(sel)];
      chips.forEach((chip, idx) => {
        chip.scrollIntoView({ block: "center" });
        const cs = getComputedStyle(chip), cr = chip.getBoundingClientRect();
        const head = chip.closest(".pv-head") || chip.parentElement, hr = head.getBoundingClientRect();
        const contained = cr.left >= hr.left - 1 && cr.right <= hr.right + 1;
        const inView = cr.top >= -1 && cr.bottom <= vh + 1 && cr.left >= -1 && cr.right <= vw + 1;
        const ok = cs.display !== "none" && cs.visibility !== "hidden" && cr.width > 0 && cr.height > 0 && contained && inView;
        if (!ok) bad.push({ idx, text: chip.textContent.trim(), w: +cr.width.toFixed(1), h: +cr.height.toFixed(1), top: +cr.top.toFixed(1), contained, inView, display: cs.display });
      });
      return { n: chips.length, bad };
    }, CHIP);
    if (vis.n && vis.bad.length === 0) pass(`3. every chip visible in container + viewport (each scrolled into view)`, `${vis.n} chips`);
    else fail(`3. chip visible`, vis.n ? `${vis.bad.length} not visible — e.g. ${JSON.stringify(vis.bad[0]).slice(0, 140)}` : "no chips to check");

    // 4. no overlap with counter or controls
    const overlap = withChip.filter((r) => r.overlapRing || r.overlapCheck || r.overlapHint);
    if (withChip.length && overlap.length === 0) pass(`4. chip overlaps neither the counter nor Check/Hint`);
    else fail(`4. chip overlap`, withChip.length ? `${overlap.length} overlap` : "no chips to check");

    // 5. click copies + confirmation (only need to prove once; do it on the first chip)
    if (withChip.length) {
      const chip0 = page.locator(CHIP).first();
      const before = await chip0.textContent();
      await chip0.click();
      await page.waitForTimeout(150);
      const after = await chip0.textContent();
      const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => "<denied>"));
      const confirmed = after.trim() !== before.trim(); // text mutated to a confirmation state
      if (clip === before.trim() && confirmed) pass(`5. click copies id to clipboard + shows confirmation`, `clipboard="${clip}", chip "${before.trim()}"→"${after.trim()}"`);
      else fail(`5. click copies + confirms`, `clipboard="${clip}" (want "${before.trim()}"), text "${before.trim()}"→"${after.trim()}" confirmed=${confirmed}`);
    } else fail(`5. click copies + confirms`, "no chip to click");

    await context.close();
    console.log("");
  }

  // 6. THE BOUNDARY — app card path must render zero chips.
  console.log(`${C.b}— app card path (engine + rao-card.js, no review furniture) —${C.x}`);
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.setContent(appPathPage(), { waitUntil: "load" });
    await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 0, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const d = await chipData(page);
    if (d.frames > 0 && d.chips === 0) pass(`6. app card path renders ZERO id chips (${d.frames} cards, 0 chips)`);
    else fail(`6. app card path renders ZERO id chips`, `${d.frames} cards, ${d.chips} chips — THE BOUNDARY LEAKED`);
    await context.close();
  }

  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "ID CHIP: visible, copyable, review-only ✅" : C.r + failures + " id-chip check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-id-chip crashed:", e); process.exit(1); });
