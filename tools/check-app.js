/* ============================================================================
   check-app.js — POINT THIS AT THE REAL APP.

   verify-format.js proves review == lesson. That is a check of OUR files against
   OUR files. It cannot tell you whether the APP matches, because the app is not
   in this repo.

   This does. Give it a URL showing a question, and it inspects the live page:

       node tools/check-app.js http://localhost:3000/lesson/42

   It answers one question — "will what Venkat approved in review/ be what the
   child actually sees?" — by checking the five things that must ALL be true.
   Engine + rao.css alone is NOT enough; that gets you a correct question in a
   grey box with the wrong font.

     1. ENGINE     RaoPreview loaded, and __version matches this repo
     2. rao.css    loaded (probe: does .rao-lesson .qbody get min-height:0?)
     3. rao-card.css   loaded (probe: is .pv-frame actually a purple->pink gradient?)
     4. MOUNT      questions sit inside .rao-lesson[data-theme] — the wrapper is
                   load-bearing: without it EVERY card inflates to a 300px floor
                   and no theme applies
     5. FONTS      Baloo 2 + Quicksand actually resolve (not a system fallback)

   Exit 0 = the app matches the preview. Exit 1 = it does not, and it says why.
   ========================================================================== */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OURS = (fs.readFileSync(path.join(ROOT, "engine", "preview-engine.js"), "utf8")
  .match(/__version\s*:\s*"([^"]+)"/) || [])[1] || "?";

const url = process.argv[2];
if (!url) {
  console.error("usage: node tools/check-app.js <url-of-a-page-showing-a-question>");
  console.error("   eg: node tools/check-app.js http://localhost:3000/lesson/42");
  process.exit(2);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });

  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  try { await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }); }
  catch (e) { console.error("could not load " + url + "\n  " + e.message); process.exit(1); }

  await page.waitForTimeout(2500);

  const r = await page.evaluate(() => {
    const g = (el, p) => (el ? getComputedStyle(el)[p] : null);

    // --- probe rao.css: inject a .rao-lesson .qbody and see if min-height is killed
    const probe = document.createElement("div");
    probe.className = "rao-lesson";
    probe.style.cssText = "position:absolute;left:-9999px;top:0";
    probe.innerHTML = '<div class="qbody" style="min-height:var(--rz-card-floor,300px)"></div>';
    document.body.appendChild(probe);
    const raoCss = getComputedStyle(probe.querySelector(".qbody")).minHeight === "0px";

    // --- probe rao-card.css: inject a .pv-frame and a .pv-check, read the paint
    const probe2 = document.createElement("div");
    probe2.style.cssText = "position:absolute;left:-9999px;top:0";
    probe2.innerHTML = '<div class="pv-frame"><button class="pv-check">x</button></div>';
    document.body.appendChild(probe2);
    const fr = probe2.querySelector(".pv-frame");
    const ck = probe2.querySelector(".pv-check");
    const frameBg = g(fr, "backgroundImage") || "";
    const checkBg = g(ck, "backgroundImage") || "";
    const cardCss = /gradient/.test(frameBg) && /gradient/.test(checkBg);

    // --- fonts: did Baloo 2 / Quicksand actually load, or did we fall back?
    const fonts = {
      baloo: document.fonts ? document.fonts.check("700 1rem 'Baloo 2'") : null,
      quicksand: document.fonts ? document.fonts.check("600 1rem 'Quicksand'") : null,
    };

    probe.remove(); probe2.remove();

    // --- the live page's own questions
    const qb = document.querySelector(".qbody");
    const mount = qb ? qb.closest(".rao-lesson") : null;
    const frame = qb ? qb.closest(".pv-frame") : null;

    return {
      engine: window.RaoPreview ? (window.RaoPreview.__version || "loaded, no __version") : null,
      raoCss, cardCss, fonts,
      questions: document.querySelectorAll(".qbody").length,
      mounted: !!mount,
      theme: mount ? mount.getAttribute("data-theme") : null,
      qbodyMinHeight: qb ? g(qb, "minHeight") : null,
      card: frame ? {
        hasRing: !!frame.querySelector(".pv-ring"),
        hasHint: !!frame.querySelector(".pv-hint"),
        hasCheck: !!frame.querySelector(".pv-check"),
        frameBg: g(frame, "backgroundImage"),
      } : null,
    };
  });

  await browser.close();

  const fail = [];
  const ok = [];
  const say = (good, msg) => (good ? ok : fail).push(msg);

  say(r.engine === OURS,
      `engine: app=${r.engine || "NOT LOADED"} repo=${OURS}`);
  say(r.raoCss,
      `rao.css: ${r.raoCss ? "loaded" : "NOT LOADED — .rao-lesson .qbody min-height:0 never fires"}`);
  say(r.cardCss,
      `rao-card.css: ${r.cardCss ? "loaded" : "NOT LOADED — no gradient frame, no orange Check button"}`);
  say(r.questions > 0,
      `questions on page: ${r.questions}`);
  say(r.mounted,
      r.mounted ? `mount: .rao-lesson[data-theme="${r.theme}"]`
                : `mount: MISSING .rao-lesson wrapper — every card inflates to the 300px floor, theming dead`);
  say(r.qbodyMinHeight === "0px" || r.qbodyMinHeight === "0" || r.qbodyMinHeight == null,
      `qbody min-height: ${r.qbodyMinHeight} ${r.qbodyMinHeight === "300px" ? "  <-- THE 300px FLOOR IS ACTIVE" : ""}`);
  say(r.fonts.baloo !== false,
      `font 'Baloo 2': ${r.fonts.baloo === false ? "NOT LOADED (falling back to a system font)" : "ok"}`);
  say(r.fonts.quicksand !== false,
      `font 'Quicksand': ${r.fonts.quicksand === false ? "NOT LOADED (falling back to a system font)" : "ok"}`);
  if (r.card) {
    say(r.card.hasRing && r.card.hasHint && r.card.hasCheck,
        `card chrome: ring=${r.card.hasRing} hint=${r.card.hasHint} check=${r.card.hasCheck}`);
  } else if (r.questions) {
    fail.push("card chrome: questions are NOT wrapped in .pv-frame — the app is drawing its own card");
  }
  if (jsErrors.length) fail.push("JS errors on page: " + jsErrors.slice(0, 3).join(" | "));

  ok.forEach((m) => console.log("  ok    " + m));
  fail.forEach((m) => console.log("  FAIL  " + m));

  if (fail.length) {
    console.log(`\n${fail.length} problem${fail.length === 1 ? "" : "s"} — the app will NOT look like review/.`);
    console.log("Ship all four: preview-engine.js · rao.css · rao-card.css · fonts.css");
    console.log("and mount inside <div class=\"rao-lesson\" data-theme=\"grape\">.");
    process.exit(1);
  }
  console.log("\nthe app matches the preview. what Venkat approves is what the child sees.");
})();
