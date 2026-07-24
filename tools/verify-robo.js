/* ============================================================================
   verify-robo.js — ROBO integration guards (Brief 7.7, engine rao-master-18).

   Real Chromium (Playwright), TWO viewports (1280×800 and 390×844), real card
   events (never synthetic rao:* dispatches), CDP Input.dispatchTouchEvent for
   every mobile claim, page.clock for the 45 s idle behaviors, and 30 ms
   mouth-continuity scans on every ported reaction.

   SABOTAGE MODES — prove each guard can fail (CLAUDE.md §2), without touching
   the shipped file. The page is built from engine/robo.js source IN MEMORY;
   setting ROBO_SABOTAGE mutates that source before inlining:
     ROBO_SABOTAGE=quiet  → strips the walkthrough-silence guard in mood()
     ROBO_SABOTAGE=doze   → strips the stuck-child doze suppression (hadWrong)
     ROBO_SABOTAGE=width  → pins W/H to the desktop constants (kills the v22
                            live-size sync — the old 120px-constant bug)
   A sabotage run must end RED. A clean run must end GREEN.
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

const FILL_WAIT = 800;   // bubbles fill at 650ms — wait comfortably past it

// ── robo.js source, with optional sabotage mutation (in memory only) ──
function roboSource() {
  let src = read("engine/robo.js");
  const mode = process.env.ROBO_SABOTAGE || "";
  if (!mode) return src;
  const cuts = {
    quiet: "if (quiet) return false;                       /* walkthrough silence rule */",
    doze: "if (hadWrong) { leanIn(); return; }        /* v23: never doze on a stuck child */",
    width: "if (wrap && wrap.offsetWidth) { W = wrap.offsetWidth; H = wrap.offsetHeight; }",
  };
  const cut = cuts[mode];
  if (!cut) throw new Error("unknown ROBO_SABOTAGE mode: " + mode);
  if (!src.includes(cut)) throw new Error("sabotage anchor not found — robo.js changed? anchor: " + cut);
  src = src.replace(cut, "");
  console.log(`  ${C.r}${C.b}⚠ SABOTAGE ACTIVE: ${mode} — this run MUST end RED${C.x}`);
  return src;
}

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
<style>${read("engine/robo.css")}</style>
</head><body>
${source}
<div class="rao-lesson" data-theme="grape"><div class="pv-frame-mount" id="preview"></div></div>
<script>window.RaoAccount = { firstName: "Priya" };</script>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
<script>${safe(roboSource())}</script>
</body></html>`;
}

const PRAISE = ["Nailed it!", "That’s it!", "Perfect estimate!", "You got it!"];
const COMEBACK = ["You didn’t give up!", "You fixed it yourself!",
                  "That’s how it’s done — keep trying!", "You worked it out!"];

(async () => {
  console.log(`\n${C.b}ROBO VERIFICATION${C.x} — 1280×800 + 390×844, real card events, CDP touch, page.clock (Brief 7.7)\n`);
  const browser = await chromium.launch();

  /* ════════ helpers shared by all sections ════════ */
  function makeHelpers(page) {
    const h = {};
    h.moodClass = () => page.evaluate(() => {
      const svg = document.querySelector(".rao-mascot");
      return Array.from(svg.classList).filter((c) => c.indexOf("mood-") === 0).join(" ");
    });
    h.animOn = (partSel) => page.evaluate((s) => {
      const el = document.querySelector(".rao-mascot " + s);
      return el ? getComputedStyle(el).animationName : "";
    }, partSel);
    h.bubble = () => page.evaluate(() => {
      const b = document.querySelector(".rao-bubble");
      return { shown: b.classList.contains("show"), text: b.textContent };
    });
    // exactly ONE mouth visible, sampled every 30 ms for `ms` — the MOUTH RULE scan
    h.mouthScan = (ms) => page.evaluate(async (dur) => {
      const mouths = Array.from(document.querySelectorAll(".rao-mascot .m-mouth"));
      let samples = 0, bad = 0;
      const t0 = performance.now();
      while (performance.now() - t0 < dur) {
        const visible = mouths.filter((m) => parseFloat(getComputedStyle(m).opacity) > 0.5).length;
        samples++;
        if (visible !== 1) bad++;
        await new Promise((r) => setTimeout(r, 30));
      }
      return { samples, bad };
    }, ms);
    // answer a card CORRECT through its real UI (select / fill-blanks)
    h.answerCorrect = async (idx) => {
      const did = await page.evaluate((i) => {
        const f = document.querySelectorAll(".pv-frame")[i];
        if (!f || f.dataset.raoOutcome) return "locked";
        f.scrollIntoView({ block: "center" });
        const b = f.dataset.behavior;
        const ans = JSON.parse(f.dataset.answer || "[]").map(String);
        if (b === "single-select" || b === "multi-select") {
          let hit = 0;
          f.querySelectorAll(".opt, .opt-fig, .hcell").forEach((o) => {
            const val = String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim());
            if (ans.indexOf(val) !== -1) { o.click(); hit++; }
          });
          return hit ? "ok" : "no-opt";
        }
        if (b === "fill-blanks") {
          const ins = f.querySelectorAll(".blank-input");
          if (!ins.length) return "no-inputs";
          ins.forEach((inp, k) => {
            inp.value = ans[k] || "";
            inp.dispatchEvent(new Event("input", { bubbles: true }));
          });
          return "ok";
        }
        return "skip:" + b;
      }, idx);
      if (did !== "ok") return did;
      await page.evaluate((i) => {
        document.querySelectorAll(".pv-frame")[i].querySelector(".pv-check").click();
      }, idx);
      return "ok";
    };
    // answer the FIXTURE (last card) wrong via its real UI
    h.fixtureWrong = async () => {
      await page.evaluate(() => {
        const frames = document.querySelectorAll(".pv-frame");
        const f = frames[frames.length - 1];
        f.scrollIntoView({ block: "center" });
        const ans = JSON.parse(f.dataset.answer).map(String);
        const opts = Array.from(f.querySelectorAll(".opt"));
        const wrongOpt = opts.find((o) => ans.indexOf(String(o.dataset.val != null ? o.dataset.val : o.textContent.trim())) === -1);
        wrongOpt.click();
        f.querySelector(".pv-check").click();
      });
    };
    h.tapRowButton = async (re) => {
      const ok = await page.evaluate((src) => {
        const rx = new RegExp(src);
        const btns = Array.from(document.querySelectorAll(".cc-actions button, .sol-walk button"))
          .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        const b = btns.find((x) => rx.test(x.textContent || ""));
        if (!b) return false;
        b.click(); return true;
      }, re.source);
      if (!ok) throw new Error("no visible row button matching " + re);
    };
    h.selectableIdx = () => page.evaluate(() => {
      const out = [];
      document.querySelectorAll(".pv-frame").forEach((f, i) => {
        const b = f.dataset.behavior;
        if (b === "single-select" || b === "multi-select" || b === "fill-blanks") out.push(i);
      });
      out.pop();   // drop the fixture (last) — it is driven explicitly
      return out;
    });
    return h;
  }

  /* ════════ SECTION 1 — desktop 1280×800: the reaction ladder on real events ════════ */
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setContent(buildPage(), { waitUntil: "load" });
    const h = makeHelpers(page);

    const dockOk = await page.evaluate(() => {
      const d = document.querySelector(".rao-dock");
      const w = document.querySelector(".rao-mascot-wrap");
      if (!d || !w) return null;
      return { z: getComputedStyle(d).zIndex, w: w.offsetWidth, h: w.offsetHeight };
    });
    if (dockOk && dockOk.z === "8" && dockOk.w === 120 && dockOk.h === 130)
      pass("dock injected — z-index 8, wrap 120×130 (desktop)", `z=${dockOk.z} ${dockOk.w}×${dockOk.h}`);
    else fail("dock injected — z-index 8, wrap 120×130 (desktop)", JSON.stringify(dockOk));

    // WRONG → encourage (gsE)
    await h.fixtureWrong();
    let m = await h.moodClass(), a = await h.animOn(".m-flip");
    if (m.includes("mood-solve-encourage") && a.includes("gsE"))
      pass("wrong → mood-solve-encourage, keyframe gsE running", `class="${m}" anim="${a}"`);
    else fail("wrong → mood-solve-encourage, keyframe gsE running", `class="${m}" anim="${a}"`);
    let scan = await h.mouthScan(2100);
    if (scan.bad === 0) pass(`mouth continuity (encourage) — ${scan.samples} samples @30ms, always exactly 1 mouth`);
    else fail("mouth continuity (encourage)", `${scan.bad}/${scan.samples} samples had ≠1 visible mouth`);

    // retry → correct = COMEBACK → shook (gsS), effort pool, NO name, no streak flash
    await page.waitForTimeout(FILL_WAIT + 400);
    await h.tapRowButton(/Try again/);
    await page.waitForTimeout(200);
    const fixIdx = await page.evaluate(() => document.querySelectorAll(".pv-frame").length - 1);
    await h.answerCorrect(fixIdx);
    m = await h.moodClass(); a = await h.animOn(".m-flip");
    if (m.includes("mood-solve-shook") && a.includes("gsS"))
      pass("comeback → mood-solve-shook, keyframe gsS running", `class="${m}" anim="${a}"`);
    else fail("comeback → mood-solve-shook, keyframe gsS running", `class="${m}" anim="${a}"`);
    scan = await h.mouthScan(1000);
    if (scan.bad === 0) pass(`mouth continuity (shook) — ${scan.samples} samples, always exactly 1 mouth`);
    else fail("mouth continuity (shook)", `${scan.bad}/${scan.samples} bad samples`);
    await page.waitForTimeout(300);   // praise bubble fires at +150ms
    let bb = await h.bubble();
    const inComeback = COMEBACK.some((s) => bb.text.startsWith(s));
    const inPraise = PRAISE.some((s) => bb.text.indexOf(s.replace(/!$/, "")) === 0);
    if (bb.shown && inComeback && !inPraise && !bb.text.includes("Priya") && !bb.text.includes("⚡"))
      pass("comeback praise — effort pool ONLY, no name, no streak flash", `"${bb.text}"`);
    else fail("comeback praise — effort pool ONLY, no name, no streak flash", `shown=${bb.shown} "${bb.text}"`);

    // streak 2 → happy (gsH), PRAISE pool + "⚡ 2 in a row!", no name
    const pool = await h.selectableIdx();
    let cursor = 0;
    async function nextCorrect() {
      while (cursor < pool.length) {
        const r = await h.answerCorrect(pool[cursor++]);
        if (r === "ok") return true;
      }
      return false;
    }
    await page.waitForTimeout(2200);
    if (!(await nextCorrect())) fail("streak build", "ran out of answerable cards");
    m = await h.moodClass(); a = await h.animOn(".m-flip");
    if (m.includes("mood-solve-happy") && a.includes("gsH"))
      pass("ordinary correct → mood-solve-happy, keyframe gsH running", `anim="${a}"`);
    else fail("ordinary correct → mood-solve-happy, keyframe gsH running", `class="${m}" anim="${a}"`);
    scan = await h.mouthScan(800);
    if (scan.bad === 0) pass(`mouth continuity (happy) — ${scan.samples} samples, always exactly 1 mouth`);
    else fail("mouth continuity (happy)", `${scan.bad}/${scan.samples} bad samples`);
    await page.waitForTimeout(250);
    bb = await h.bubble();
    if (bb.shown && PRAISE.some((s) => bb.text.startsWith(s.slice(0, -1))) && bb.text.includes("⚡ 2 in a row!") && !bb.text.includes("Priya"))
      pass("streak-2 praise — outcome pool + '⚡ 2 in a row!', name withheld", `"${bb.text}"`);
    else fail("streak-2 praise — outcome pool + '⚡ 2 in a row!', name withheld", `shown=${bb.shown} "${bb.text}"`);

    // streak 3 → celebrate (gsCl arms + gsCb body), NAME appears
    await page.waitForTimeout(2400);
    if (!(await nextCorrect())) fail("streak build", "ran out of answerable cards");
    m = await h.moodClass();
    const armA = await h.animOn(".m-arm-l"), bodyA = await h.animOn(".m-flip");
    if (m.includes("mood-solve-celebrate") && armA.includes("gsCl") && bodyA.includes("gsCb"))
      pass("streak 3 → mood-solve-celebrate, keyframes gsCl+gsCb running", `arm="${armA}" body="${bodyA}"`);
    else fail("streak 3 → mood-solve-celebrate, keyframes gsCl+gsCb running", `class="${m}" arm="${armA}" body="${bodyA}"`);
    scan = await h.mouthScan(1200);
    if (scan.bad === 0) pass(`mouth continuity (celebrate) — ${scan.samples} samples, always exactly 1 mouth`);
    else fail("mouth continuity (celebrate)", `${scan.bad}/${scan.samples} bad samples`);
    await page.waitForTimeout(250);
    bb = await h.bubble();
    if (bb.shown && bb.text.includes(", Priya!") && bb.text.includes("⚡ 3 in a row!"))
      pass("streak-3 milestone — name personalization fires", `"${bb.text}"`);
    else fail("streak-3 milestone — name personalization fires", `shown=${bb.shown} "${bb.text}"`);

    // streak 4 (celebrate again), then streak 5 → hyped (gsY) + name
    await page.waitForTimeout(2600);
    if (!(await nextCorrect())) fail("streak build", "ran out of answerable cards");
    await page.waitForTimeout(2600);
    if (!(await nextCorrect())) fail("streak build", "ran out of answerable cards");
    m = await h.moodClass(); a = await h.animOn(".m-flip");
    if (m.includes("mood-solve-hyped") && a.includes("gsY"))
      pass("streak 5 → mood-solve-hyped, keyframe gsY running", `anim="${a}"`);
    else fail("streak 5 → mood-solve-hyped, keyframe gsY running", `class="${m}" anim="${a}"`);
    scan = await h.mouthScan(1000);
    if (scan.bad === 0) pass(`mouth continuity (hyped) — ${scan.samples} samples, always exactly 1 mouth`);
    else fail("mouth continuity (hyped)", `${scan.bad}/${scan.samples} bad samples`);
    await page.waitForTimeout(250);
    bb = await h.bubble();
    if (bb.shown && bb.text.includes(", Priya!") && bb.text.includes("⚡ 5 in a row!"))
      pass("streak-5 milestone — name personalization fires", `"${bb.text}"`);
    else fail("streak-5 milestone — name personalization fires", `shown=${bb.shown} "${bb.text}"`);

    // praise-bubble timing: ≈150ms in, ≈1900ms long — measured on the last one
    const timing = await page.evaluate(() => new Promise((res) => {
      const b = document.querySelector(".rao-bubble");
      const t0 = performance.now();
      const iv = setInterval(() => {
        if (!b.classList.contains("show")) { clearInterval(iv); res(performance.now() - t0); }
        if (performance.now() - t0 > 4000) { clearInterval(iv); res(-1); }
      }, 40);
    }));
    if (timing > 0 && timing < 2600) pass("praise bubble expires on schedule (≈1900ms)", `gone after ${Math.round(timing)}ms more`);
    else fail("praise bubble expires on schedule (≈1900ms)", `residual ${Math.round(timing)}ms`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow <= 0) pass("zero horizontal overflow (1280×800)");
    else fail("zero horizontal overflow (1280×800)", `scrollWidth exceeds viewport by ${overflow}px`);
    if (errors.length === 0) pass("zero page errors (desktop ladder run)");
    else fail("zero page errors (desktop ladder run)", errors.join(" | "));
    await context.close();
  }

  /* ════════ SECTION 2 — walkthrough silence (desktop, fresh page) ════════ */
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.setContent(buildPage(), { waitUntil: "load" });
    const h = makeHelpers(page);

    // FR-2 ruling 5: the SECOND wrong attempt AUTO-opens the walkthrough — the
    // open fires straight from Check (whyWrong is OFF product-wide since
    // BRIEF-WHYWRONG-OFF-1, 2026-07-24, so no bubble ever types ahead of the
    // commit). Was: two wrongs → voluntary "Walk me through it" tap. The
    // silence contract is unchanged — the open (either path) is the commit point.
    await h.fixtureWrong();
    await page.waitForTimeout(FILL_WAIT + 300);
    await h.tapRowButton(/Try again/);
    await page.waitForTimeout(200);
    // a praise bubble may be about to show — prove silence kills bubbles at
    // open: put a bubble up deliberately, then trip the cap
    await page.evaluate(() => window.Robo.bubble("about to be silenced", 5000));
    await h.fixtureWrong();                          // wrong #2 → auto-open
    const capOpened = await (async () => {
      const deadline = Date.now() + 9000;
      for (;;) {
        const r = await page.evaluate(() => {
          const frames = document.querySelectorAll(".pv-frame");
          const f = frames[frames.length - 1];
          const sol = f.querySelector(".pv-solwrap");
          return !!(sol && !sol.hasAttribute("hidden"));
        });
        if (r) return true;
        if (Date.now() > deadline) return false;
        await page.waitForTimeout(80);
      }
    })();
    if (capOpened) pass("second wrong AUTO-opens the walkthrough (FR-2 ruling 5)");
    else fail("second wrong AUTO-opens the walkthrough (FR-2 ruling 5)", "no walkthrough within 9s of the capping Check");
    await page.waitForTimeout(150);
    let bb = await h.bubble();
    let m = await h.moodClass();
    if (!bb.shown && !m.includes("mood-solve"))
      pass("walkthrough OPEN — bubble hidden immediately, no mood survives the commit point");
    else fail("walkthrough OPEN — bubble hidden immediately, no mood survives the commit point", `bubble=${bb.shown} mood="${m}"`);

    // REAL event mid-walkthrough: wrong on ANOTHER card must NOT move Robo
    const otherIdx = await page.evaluate(() => {
      let idx = -1;
      document.querySelectorAll(".pv-frame").forEach((f, i) => {
        if (idx === -1 && f.dataset.behavior === "single-select" && !f.dataset.raoOutcome) idx = i;
      });
      return idx;
    });
    await page.evaluate((i) => {
      const f = document.querySelectorAll(".pv-frame")[i];
      const ans = JSON.parse(f.dataset.answer).map(String);
      const wrongOpt = Array.from(f.querySelectorAll(".opt")).find((o) =>
        ans.indexOf(String(o.dataset.val != null ? o.dataset.val : o.textContent.trim())) === -1);
      wrongOpt.click();
      f.querySelector(".pv-check").click();
    }, otherIdx);
    await page.waitForTimeout(250);
    m = await h.moodClass();
    bb = await h.bubble();
    if (!m.includes("mood-solve") && !bb.shown)
      pass("WALKTHROUGH SILENCE — a real wrong event during the walkthrough produces NO mood, NO bubble");
    else fail("WALKTHROUGH SILENCE — a real wrong event during the walkthrough produces NO mood, NO bubble", `mood="${m}" bubble=${bb.shown}`);

    // step through to the end, asserting silence at each step
    let silent = true;
    for (let i = 0; i < 12; i++) {
      const label = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll(".sol-walk button, .cc-actions button"))
          .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        const nx = btns.find((b) => /Next step|Got it/.test(b.textContent || ""));
        if (!nx) return null;
        const t = nx.textContent;
        nx.click();
        return t;
      });
      await page.waitForTimeout(FILL_WAIT);
      const mm = await h.moodClass(); const bbb = await h.bubble();
      if (mm.includes("mood-solve") || bbb.shown) silent = false;
      if (label === null || /Got it/.test(label)) break;
    }
    if (silent) pass("walkthrough stepping — Robo fully silent through the quiet reveal");
    else fail("walkthrough stepping — Robo fully silent through the quiet reveal", "a mood or bubble appeared mid-walkthrough");

    // "Next question →" releases the silence; the next real wrong reacts again
    await h.tapRowButton(/Next question/);
    await page.waitForTimeout(200);
    const other2 = await page.evaluate(() => {
      let idx = -1;
      document.querySelectorAll(".pv-frame").forEach((f, i) => {
        if (idx === -1 && f.dataset.behavior === "single-select" && !f.dataset.raoOutcome) idx = i;
      });
      return idx;
    });
    await page.evaluate((i) => {
      const f = document.querySelectorAll(".pv-frame")[i];
      f.scrollIntoView({ block: "center" });
      const ans = JSON.parse(f.dataset.answer).map(String);
      const wrongOpt = Array.from(f.querySelectorAll(".opt")).find((o) =>
        ans.indexOf(String(o.dataset.val != null ? o.dataset.val : o.textContent.trim())) === -1);
      wrongOpt.click();
      f.querySelector(".pv-check").click();
    }, other2);
    await page.waitForTimeout(150);
    m = await h.moodClass();
    if (m.includes("mood-solve-encourage"))
      pass("rao:next releases the silence — encourage fires again after the walkthrough");
    else fail("rao:next releases the silence — encourage fires again after the walkthrough", `mood="${m}"`);

    if (errors.length === 0) pass("zero page errors (walkthrough-silence run)");
    else fail("zero page errors (walkthrough-silence run)", errors.join(" | "));
    await context.close();
  }

  /* ════════ SECTION 3 — 45 s idle: doze, stuck-child lean-in (page.clock) ════════ */
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.clock.install();
    await page.setContent(buildPage(), { waitUntil: "load" });
    const h = makeHelpers(page);

    // A wrong answer is pending → 45 s idle must produce ONE silent lean-in, NO doze
    await h.fixtureWrong();
    await page.clock.fastForward(46_000);
    await page.waitForTimeout(80);
    let leans = await page.evaluate(() => document.querySelector(".rao-mascot").dataset.leans || "0");
    let m = await h.moodClass();
    let bb = await h.bubble();
    if (leans === "1" && !m.includes("mood-solve-sleepy") && !bb.shown)
      pass("STUCK-CHILD RULE — wrong pending + 45s idle → ONE silent lean-in, NO doze class, no bubble", `leans=${leans}`);
    else fail("STUCK-CHILD RULE — wrong pending + 45s idle → ONE silent lean-in, NO doze class, no bubble", `leans=${leans} mood="${m}" bubble=${bb.shown}`);

    // no repeat without a new answer event
    await page.clock.fastForward(60_000);
    await page.waitForTimeout(80);
    leans = await page.evaluate(() => document.querySelector(".rao-mascot").dataset.leans || "0");
    if (leans === "1") pass("lean-in does not repeat until the next answer event", `leans still ${leans}`);
    else fail("lean-in does not repeat until the next answer event", `leans=${leans}`);

    // correct re-arms NORMAL doze: sleepy (gsZ) + Zzz bubble, held (no timer end).
    // A real child's tap fires pointerdown (wake → idleReset); the synthetic
    // .click() used to answer does not, so send the pointerdown a finger would.
    await page.waitForTimeout(50);
    await h.tapRowButton(/Try again/);
    const fixIdx = await page.evaluate(() => document.querySelectorAll(".pv-frame").length - 1);
    await h.answerCorrect(fixIdx);
    await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await page.clock.fastForward(46_000);
    await page.waitForTimeout(80);
    m = await h.moodClass();
    const zA = await h.animOn(".m-flip");
    bb = await h.bubble();
    if (m.includes("mood-solve-sleepy") && zA.includes("gsZ") && bb.text.indexOf("Zzz") === 0)
      pass("correct re-arms doze — 45s idle → mood-solve-sleepy held, keyframe gsZ, Zzz bubble", `anim="${zA}"`);
    else fail("correct re-arms doze — 45s idle → mood-solve-sleepy held, keyframe gsZ, Zzz bubble", `mood="${m}" anim="${zA}" bubble="${bb.text}"`);

    // sleepy is HELD (holdMs 0): still asleep after 3 more virtual minutes
    await page.clock.fastForward(180_000);
    m = await h.moodClass();
    if (m.includes("mood-solve-sleepy")) pass("sleepy is held, not timed — still dozing after +3 min");
    else fail("sleepy is held, not timed — still dozing after +3 min", `mood="${m}"`);

    // wake on touch
    await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await page.waitForTimeout(60);
    m = await h.moodClass();
    if (!m.includes("mood-solve-sleepy")) pass("wakes on any pointerdown");
    else fail("wakes on any pointerdown", `mood="${m}"`);

    if (errors.length === 0) pass("zero page errors (idle/clock run)");
    else fail("zero page errors (idle/clock run)", errors.join(" | "));
    await context.close();
  }

  /* ════════ SECTION 4 — mobile 390×844: CDP touch (tap→poke, drag, yield, clamp, persist) ════════ */
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    // Serve over a real origin — sessionStorage is denied on about:blank, and
    // the roboPos persistence claim must be proven against the real API.
    await page.route("**/robo-fixture.html", (route) =>
      route.fulfill({ body: buildPage(), contentType: "text/html" }));
    await page.goto("http://robo.fixture/robo-fixture.html", { waitUntil: "load" });
    const cdp = await context.newCDPSession(page);
    const h = makeHelpers(page);

    async function touchDrag(x0, y0, x1, y1, steps) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
      for (let i = 1; i <= steps; i++) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x0 + ((x1 - x0) * i) / steps, y: y0 + ((y1 - y0) * i) / steps }],
        });
        await page.waitForTimeout(16);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    const wrapCenter = () => page.evaluate(() => {
      const r = document.querySelector(".rao-mascot-wrap").getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });

    const size = await page.evaluate(() => {
      const w = document.querySelector(".rao-mascot-wrap");
      return { w: w.offsetWidth, h: w.offsetHeight };
    });
    if (size.w === 84 && size.h === 91) pass("responsive size — wrap 84×91 at 390px", `${size.w}×${size.h}`);
    else fail("responsive size — wrap 84×91 at 390px", `${size.w}×${size.h}`);

    // touch TAP → poke wobble (mood-poked, pokeWob)
    let c = await wrapCenter();
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: c.x, y: c.y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(120);
    let m = await h.moodClass();
    let a = await h.animOn(".m-flip");
    if (m.includes("mood-poked") && a.includes("pokeWob"))
      pass("touch tap → poke — single friendly wobble (mood-poked, pokeWob)", `anim="${a}"`);
    else fail("touch tap → poke — single friendly wobble (mood-poked, pokeWob)", `class="${m}" anim="${a}"`);
    const pokeScan = await h.mouthScan(400);
    if (pokeScan.bad === 0) pass(`mouth continuity (poked) — ${pokeScan.samples} samples, always exactly 1 mouth`);
    else fail("mouth continuity (poked)", `${pokeScan.bad}/${pokeScan.samples} bad samples`);
    await page.waitForTimeout(700);

    // touch DRAG to a clear top-left area → dock follows; roboPos persists after 700ms
    c = await wrapCenter();
    await touchDrag(c.x, c.y, 60, 200, 10);
    const afterDrag = await page.evaluate(() => {
      const d = document.querySelector(".rao-dock");
      return { l: d.offsetLeft, t: d.offsetTop };
    });
    if (Math.abs(afterDrag.l - (60 - 42)) < 30 && Math.abs(afterDrag.t - (200 - 45)) < 40)
      pass("touch drag — dock follows the finger (pointer capture)", `dock at ${afterDrag.l},${afterDrag.t}`);
    else fail("touch drag — dock follows the finger (pointer capture)", `dock at ${afterDrag.l},${afterDrag.t}`);
    await page.waitForTimeout(950);   // savePos fires on the 700ms post-drop timer
    const saved = await page.evaluate(() => sessionStorage.getItem("roboPos"));
    let savedOk = false;
    try { const sp = JSON.parse(saved); savedOk = sp && typeof sp.l === "number" && typeof sp.t === "number"; } catch (e) {}
    if (savedOk) pass("roboPos persisted to sessionStorage AFTER the 700ms timer", saved);
    else fail("roboPos persisted to sessionStorage AFTER the 700ms timer", String(saved));

    // drag ONTO the fixture card's options → yield rule flies him clear.
    const target = await page.evaluate(() => {
      const frames = document.querySelectorAll(".pv-frame");
      const f = frames[frames.length - 1];
      f.scrollIntoView({ block: "center" });
      const r = f.querySelector(".opt").getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    c = await wrapCenter();
    await touchDrag(c.x, c.y, target.x, target.y, 10);
    await page.waitForTimeout(900);   // fly-away (560ms) + settle
    const clear = await page.evaluate(() => {
      const d = document.querySelector(".rao-dock").getBoundingClientRect();
      let hit = false;
      document.querySelectorAll(".opt,.pv-check,.pv-hint,button,input,a").forEach((el) => {
        if (hit) return;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return;
        if (getComputedStyle(el).visibility === "hidden") return;
        if (!(d.right < b.left || b.right < d.left || d.bottom < b.top || b.bottom < d.top)) hit = true;
      });
      return !hit;
    });
    if (clear) pass("YIELD RULE — dropped on the card, Robo flew to the nearest clear spot");
    else fail("YIELD RULE — dropped on the card, Robo flew to the nearest clear spot", "dock still overlaps an interactive element");

    // BOTTOM-DROP YIELD (Brief 7.7.1) — drop Robo directly ON the Check button
    // at the viewport bottom. The yield fly's landing clamps must agree with
    // the drag clamps, or nearestClear's below-the-card spot gets clamped back
    // onto the footer row (the Brief 7.7 stop-and-reported conflict, ruled FIX).
    const checkTarget = await page.evaluate(() => {
      const frames = document.querySelectorAll(".pv-frame");
      const f = frames[frames.length - 1];
      f.scrollIntoView({ block: "center" });
      const r = f.querySelector(".pv-check").getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    c = await wrapCenter();
    await touchDrag(c.x, c.y, checkTarget.x, checkTarget.y, 10);
    await page.waitForTimeout(900);   // fly-away (560ms) + settle
    const bottomDrop = await page.evaluate(() => {
      const frames = document.querySelectorAll(".pv-frame");
      const f = frames[frames.length - 1];
      const d = document.querySelector(".rao-dock").getBoundingClientRect();
      const b = f.querySelector(".pv-check").getBoundingClientRect();
      const overlaps = !(d.right < b.left || b.right < d.left || d.bottom < b.top || b.bottom < d.top);
      return { overlaps, dock: `${Math.round(d.left)},${Math.round(d.top)}→${Math.round(d.right)},${Math.round(d.bottom)}`,
               check: `${Math.round(b.left)},${Math.round(b.top)}→${Math.round(b.right)},${Math.round(b.bottom)}` };
    });
    if (!bottomDrop.overlaps)
      pass("BOTTOM-DROP YIELD — dropped ON the Check button, dock lands clear of it", `dock ${bottomDrop.dock}, check ${bottomDrop.check}`);
    else fail("BOTTOM-DROP YIELD — dropped ON the Check button, dock lands clear of it", `dock ${bottomDrop.dock} STILL OVERLAPS check ${bottomDrop.check}`);

    // drag hard right → clamp honours the LIVE 84px width: left must reach ≥298 on 390px
    c = await wrapCenter();
    await touchDrag(c.x, c.y, 389, c.y, 10);
    const leftMax = await page.evaluate(() => document.querySelector(".rao-dock").offsetLeft);
    if (leftMax >= 298)
      pass("390px drag clamp honours the live 84px width — dock reached left " + leftMax + " (≥298)");
    else fail("390px drag clamp honours the live 84px width", `dock capped at left ${leftMax} — the old 120px constant caps at 266`);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow <= 0) pass("zero horizontal overflow (390×844)");
    else fail("zero horizontal overflow (390×844)", `scrollWidth exceeds viewport by ${overflow}px`);
    if (errors.length === 0) pass("zero page errors (mobile touch run)");
    else fail("zero page errors (mobile touch run)", errors.join(" | "));
    await context.close();
  }

  await browser.close();

  console.log("");
  if (failures) {
    console.log(`${C.r}${C.b}ROBO: ${failures} guard(s) failed ✗${C.x}\n`);
    process.exit(1);
  }
  console.log(`${C.g}${C.b}ROBO: rig, ladder, silence, stuck-child, touch — all hold ✅${C.x}\n`);
})().catch((e) => { console.error(e); process.exit(1); });
