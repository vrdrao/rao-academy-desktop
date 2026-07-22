#!/usr/bin/env node
/* ── verify-geo-wired.js — BRIEF-FIX-GEO-WIRING-1 Step 4 ──────────────────────
 *
 * ISSUES #75: engine/geometry-engine.js was never inlined into review pages, so
 * every construct question rendered "Geometry engine not loaded." and was dead.
 * The fix (Option B) inlines the ~962 KB geometry engine ONLY into pages whose
 * lesson SOURCE contains a construct question. That makes "which pages get the
 * engine" a COMPUTED CONDITION — and a computed condition can drift: a future
 * construct lesson could slip through the detector and silently go dead again.
 *
 * This guard makes the condition un-driftable, two independent ways:
 *
 *  (1) SET EQUALITY (structural, WHOLE corpus, no browser). For every lesson, the
 *      freshly BUILT page carries the geometry engine  <=>  the lesson has a
 *      construct question. Truth for "has a construct question" comes from an
 *      INDEPENDENT detector — /data-type="construct"/ on the lesson file — which
 *      is deliberately NOT sourceNeedsGeo(), the frontmatter-based function that
 *      build() uses to decide wiring. Because the two detectors read different
 *      strings in different places, breaking EITHER one makes the two sides
 *      DISAGREE and the guard FAILS. The guard cannot silently agree with itself.
 *
 *  (2) RUNTIME (browser, ALL construct pages — not a sample). Every construct
 *      page loads with window.RaoGeo defined, ZERO "Geometry engine not loaded"
 *      text, and every construct question actually binds a live geo board
 *      (a __geo handle). Render count must hit the full construct total.
 *
 * SABOTAGE PROOF (per project law — a guard unproven-to-fail is faith, not a
 * guard): remove the wiring (drop the geoBlock) OR break the detection
 * (sourceNeedsGeo -> false) and (1) FAILS for every construct lesson; restore and
 * it PASSES. Both were demonstrated when this guard was written.
 *
 * Exit 0 = all green. Exit 1 = at least one failure.
 */

"use strict";

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { build, sourceOf, sourceNeedsGeo } = require("./make-review");

const ROOT = path.resolve(__dirname, "..");
const C = { r: "\x1b[31m", g: "\x1b[32m", y: "\x1b[33m", b: "\x1b[1m", x: "\x1b[0m" };
let failures = 0;
const pass = (m) => console.log(`  ${C.g}PASS${C.x}  ${m}`);
const fail = (m) => { failures++; console.log(`  ${C.r}FAIL${C.x}  ${m}`); };

// The definition of window.RaoGeo lives ONLY in engine/geometry-engine.js, so its
// presence in a built page proves the geometry engine was inlined into that page.
const GEO_DEF = "W.RaoGeo = { mount: mount };";
const ERR_STR = "Geometry engine not loaded";
// INDEPENDENT construct detector — the question DIV attribute, NOT the frontmatter
// `type:` marker that sourceNeedsGeo() keys on. Different string, different place.
const INDEP_CONSTRUCT = /data-type=["']construct["']/g;

// Recursive discovery, mirroring verify-format.js. Skip the _preview/ mirror dir,
// but KEEP _type-coverage.html — it is a real fixture that carries a construct
// question and must be covered (it is one of the construct lessons).
const collect = (dir) => {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "_preview") continue;
      out = out.concat(collect(full));
    } else if (e.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
};

(async () => {
  const files = collect(path.join(ROOT, "lessons"));
  const temps = [];
  const constructPages = [];
  let lessonCount = 0;

  try {
    console.log(`${C.b}(1) set equality — built-page-has-geo  <=>  lesson-has-construct${C.x}`);
    for (const file of files) {
      const html = fs.readFileSync(file, "utf8");
      try { sourceOf(html); } catch (e) { continue; } // not a content lesson (no #source)
      lessonCount++;
      const name = path.basename(file, ".html");

      const expected = (html.match(INDEP_CONSTRUCT) || []).length; // independent truth
      const hasConstruct = expected > 0;

      const tmp = `__vg_${name}`;
      build(file, tmp);
      const tmpPath = path.join(ROOT, "review", tmp + ".html");
      temps.push(tmpPath);

      const built = fs.readFileSync(tmpPath, "utf8");
      const geoWired = built.includes(GEO_DEF);

      if (geoWired !== hasConstruct) {
        fail(`${name}: geoWired=${geoWired} but hasConstruct=${hasConstruct} ` +
             `(independent data-type="construct" count=${expected}) — wiring set != construct set`);
      }
      // cross-check: build()'s own detector must agree with the independent one; if
      // they diverge, the frontmatter/div markers drifted apart on this lesson.
      const buildSaysGeo = sourceNeedsGeo(sourceOf(html));
      if (buildSaysGeo !== hasConstruct) {
        fail(`${name}: sourceNeedsGeo()=${buildSaysGeo} disagrees with independent ` +
             `data-type detector (${hasConstruct}) — construct markers have drifted`);
      }

      if (hasConstruct) constructPages.push({ name, tmpRel: `review/${tmp}.html`, expected });
    }
    if (failures === 0) pass(`all ${lessonCount} lessons: geo wiring set == construct set`);

    console.log(`\n${C.b}(2) runtime — every construct page: RaoGeo defined, 0 error text, all boards bound${C.x}`);
    if (!constructPages.length) fail("no construct lessons discovered — expected 6");

    const browser = await chromium.launch();
    const page = await browser.newPage();
    let renderedTotal = 0, expectedTotal = 0;
    for (const cp of constructPages) {
      await page.goto("file://" + path.join(ROOT, cp.tmpRel));
      await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 0, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(900);
      const info = await page.evaluate((errStr) => {
        const mounts = Array.from(document.querySelectorAll(".rao-construct"));
        return {
          raoGeo: !!(window.RaoGeo && typeof window.RaoGeo.mount === "function"),
          bound: mounts.filter((m) => m.__geo).length,
          errors: mounts.filter((m) => (m.textContent || "").includes(errStr)).length,
        };
      }, ERR_STR);

      const ok = info.raoGeo && info.errors === 0 && info.bound === cp.expected;
      const msg = `${cp.name}: RaoGeo=${info.raoGeo} errors=${info.errors} bound=${info.bound}/${cp.expected}`;
      ok ? pass(msg) : fail(msg);
      renderedTotal += info.bound;
      expectedTotal += cp.expected;
    }
    await browser.close();
    console.log(`\n  render count: ${renderedTotal}/${expectedTotal} construct questions rendered live`);
    if (renderedTotal !== expectedTotal) fail(`render count ${renderedTotal} != ${expectedTotal}`);
  } finally {
    for (const t of temps) { try { fs.unlinkSync(t); } catch (e) {} }
  }

  console.log(failures ? `\n${C.r}${C.b}${failures} FAILURE(S)${C.x}` : `\n${C.g}${C.b}all green${C.x}`);
  process.exit(failures ? 1 : 0);
})();
