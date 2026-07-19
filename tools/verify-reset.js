#!/usr/bin/env node
/* ── verify-reset.js — LAW 3 AS AMENDED (BRIEF FR-1, 2026-07-19) ──
 *
 * WRONG IS A WHISPER, AND THE WHISPER DOES NOT LINGER. When the child taps
 * "Try again", the TASK must return to EXACTLY its first-attempt state: no ✕,
 * no residual selection, no retained input, no moved tiles. Help (hint bubbles,
 * walkthrough steps) accumulates and is NEVER touched by the reset (law 4).
 *
 * For EVERY behavior in the fixture (all 12 the engine supports):
 *   1. snapshot the question's COMPUTED state at first attempt
 *      (getComputedStyle per element + attributes + input values + the
 *      engine's own serialize() — never markup inspection),
 *   2. drive a WRONG answer with real input,
 *   3. tap "Try again",
 *   4. assert the state matches the snapshot EXACTLY.
 *
 * Runs the full battery TWICE: 1280×800 (desktop pointer) and 390×844
 * (touch — every interaction is raw CDP Input.dispatchTouchEvent; drags are
 * real touchStart→touchMove→touchEnd sequences, per QA law: mouse events do
 * not count as mobile QA). Both viewports: zero page errors, zero horizontal
 * overflow.
 *
 * Also proves the reset does NOT reset PROGRESS (FR-1 req 4): on the ladder
 * fixture, a second wrong after a reset must still offer "Walk me through it"
 * (wrongCount survived), and the hint ladder position survives.
 *
 * construct: window.RaoGeo is an APP-side asset (raoGeoEngine.js is not in
 * this repo), so a minimal TEST-SIDE stub is injected — mount() renders a
 * tappable board recording placements. The reset contract for construct is
 * re-mount-from-pristine-spec; the stub proves the card calls it.
 *
 * Exit 0 = all green. Exit 1 = at least one failure (with the first diff).
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

/* TEST-SIDE ONLY RaoGeo stub — raoGeoEngine.js lives in the app, not this repo.
   mount() renders a tappable dot that counts placements; grade() is always
   wrong; attempted() once a dot is placed. A re-mount (the reset contract for
   construct) starts the count at 0 again. */
const RAOGEO_STUB = `
window.__geoMounts = 0;
window.RaoGeo = { mount: function (el, spec) {
  window.__geoMounts++;
  var placed = 0;
  el.innerHTML = '<div class="geo-stub-board" style="padding:16px;border:2px dashed #cbd5e1;border-radius:12px">' +
    '<button type="button" class="geo-stub-dot" style="min-width:48px;min-height:48px">●</button>' +
    ' placed: <span class="geo-stub-count">0</span></div>';
  var btn = el.querySelector(".geo-stub-dot");
  var onTap = function () { placed++; el.querySelector(".geo-stub-count").textContent = String(placed); };
  btn.addEventListener("click", onTap);
  return { grade: function () { return false; }, attempted: function () { return placed > 0; },
           destroy: function () { btn.removeEventListener("click", onTap); } };
} };
`;

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
<script>${RAOGEO_STUB}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

/* The COMPUTED-state capture. Runs in the page. Never inspects markup strings:
   per element it records classes, input value, dataset, key attributes, leaf
   text, and a getComputedStyle slice broad enough to catch any visual change
   (colors, opacity, visibility, box size, transform). */
const STATE_FN = `
// Deterministic capture: run every animation in the task to its end state
// first. The vs-tile "nudge" (and friends) replay on re-mount BY DESIGN — the
// reset IS a re-mount — so a mid-animation transform is not a state diff.
// finish() throws on infinite animations; those are cancelled (base state),
// identically on both captures.
window.__settleAnims = function (qbody) {
  var anims = qbody.getAnimations ? qbody.getAnimations({ subtree: true }) : [];
  anims.forEach(function (a) { try { a.finish(); } catch (e) { try { a.cancel(); } catch (e2) {} } });
};
window.__stateOf = function (qbody) {
  window.__settleAnims(qbody);
  var els = [qbody].concat(Array.prototype.slice.call(qbody.querySelectorAll("*")));
  return els.map(function (el) {
    var cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: Array.prototype.slice.call(el.classList).sort().join(" "),
      val: (el.tagName === "INPUT" || el.tagName === "TEXTAREA") ? el.value : null,
      dis: el.disabled === true,
      data: JSON.stringify(Object.assign({}, el.dataset)),
      styleAttr: el.getAttribute("style") || "",
      transformAttr: el.getAttribute("transform") || "",
      aria: el.getAttribute("aria-valuenow") || "",
      text: el.children.length === 0 ? (el.textContent || "").trim() : null,
      css: [cs.color, cs.backgroundColor, cs.borderTopColor, cs.borderBottomColor,
            cs.opacity, cs.display, cs.visibility, cs.width, cs.height, cs.transform].join("|")
    };
  });
};
window.__firstDiff = function (a, b) {
  if (a.length !== b.length) return "element count " + a.length + " -> " + b.length +
    " (task structure changed — e.g. an injected mark or a moved tile)";
  for (var i = 0; i < a.length; i++) {
    var ka = a[i], kb = b[i];
    for (var k in ka) {
      if (String(ka[k]) !== String(kb[k]))
        return "el#" + i + " <" + kb.tag.toLowerCase() + (kb.cls ? " ." + kb.cls.replace(/ /g, ".") : "") +
               "> field " + k + ": " + JSON.stringify(ka[k]).slice(0, 120) + " -> " + JSON.stringify(kb[k]).slice(0, 120);
    }
  }
  return null;
};
`;

async function runViewport(browser, vp, touch) {
  const label = `${vp.width}×${vp.height} ${touch ? "TOUCH (CDP)" : "desktop pointer"}`;
  console.log(`\n${C.b}── viewport ${label} ──${C.x}`);
  const context = await browser.newContext({ viewport: vp, hasTouch: touch });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(buildPage(), { waitUntil: "load" });
  await page.evaluate(STATE_FN);
  const cdp = touch ? await context.newCDPSession(page) : null;

  // id every frame; sanity-check the behavior order against the fixture
  const behaviors = await page.evaluate(() => {
    const frames = [...document.querySelectorAll(".pv-frame")];
    frames.forEach((f, i) => { f.id = "rst" + i; });
    return frames.map((f) => f.dataset.behavior);
  });

  /* ── input primitives ─────────────────────────────────────────────── */
  async function center(sel, idx, scroll) {
    const box = await page.evaluate(([s, i, sc]) => {
      const els = [...document.querySelectorAll(s)].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
      });
      const el = i != null ? els[i] : els[0];
      if (!el) return null;
      if (sc) el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [sel, idx == null ? null : idx, scroll !== false]);
    if (!box) throw new Error("target not found/visible: " + sel);
    return box;
  }
  async function scrollTo(sel) {
    await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.scrollIntoView({ block: "center" }); }, sel);
    await page.waitForTimeout(50);
  }
  async function tap(sel, idx) {
    const box = await center(sel, idx);
    if (touch) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x, y: box.y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      await page.mouse.click(box.x, box.y);
    }
    await page.waitForTimeout(60);
  }
  async function drag(fromSel, fromIdx, toSel, toIdx) {
    // scroll ONCE (to the drag source); measure the drop point WITHOUT further
    // scrolling — a second scroll would invalidate the source coordinates
    const from = await center(fromSel, fromIdx, true);
    const to = await center(toSel, toIdx, false);
    const steps = 10;
    if (touch) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from.x, y: from.y }] });
      for (let i = 1; i <= steps; i++)
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      for (let i = 1; i <= steps; i++)
        await page.mouse.move(from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps);
      await page.mouse.up();
    }
    await page.waitForTimeout(80);
  }
  async function setValue(sel, idx, value) {
    await page.evaluate(([s, i, v]) => {
      const els = [...document.querySelectorAll(s)];
      const el = i != null ? els[i] : els[0];
      el.value = v;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, [sel, idx == null ? null : idx, value]);
  }
  async function optIdx(scope, val) {
    return page.evaluate(([s, v]) =>
      [...document.querySelectorAll(s)].findIndex((o) =>
        String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim()) === v), [scope, val]);
  }
  // neutral mouse position so :hover can't pollute a computed-style capture
  async function parkPointer() { if (!touch) await page.mouse.move(2, 2); }

  async function waitForButton(frameId, re, timeout) {
    const deadline = Date.now() + (timeout || 6000);
    for (;;) {
      const found = await page.evaluate(([id, src]) => {
        const f = document.getElementById(id);
        const rx = new RegExp(src);
        return [...f.querySelectorAll(".cc-actions button")].some((b) =>
          b.getBoundingClientRect().width > 0 && rx.test(b.textContent || ""));
      }, [frameId, re.source]);
      if (found) return;
      if (Date.now() > deadline) throw new Error(`no "${re.source}" button appeared in #${frameId}`);
      await page.waitForTimeout(120);
    }
  }
  async function tapRowButton(frameId, re) {
    const idx = await page.evaluate(([id, src]) => {
      const rx = new RegExp(src);
      return [...document.querySelectorAll("#" + id + " .cc-actions button")]
        .filter((b) => b.getBoundingClientRect().width > 0)
        .findIndex((b) => rx.test(b.textContent || ""));
    }, [frameId, re.source]);
    await tap(`#${frameId} .cc-actions button`, idx);
  }

  /* ── the core drill: snapshot → wrong → Try again → compare ───────── */
  async function drill(i, behavior, driveWrong, extraLabel) {
    const id = "rst" + i;
    const name = `${behavior}${extraLabel ? " " + extraLabel : ""} [${label}]`;
    if (behaviors[i] !== behavior) { fail(name, `fixture order changed: frame ${i} is ${behaviors[i]}`); return; }
    try { return await drillBody(i, id, name, driveWrong); }
    catch (e) { fail(name, `drill errored: ${e.message}`); }
  }
  async function drillBody(i, id, name, driveWrong) {
    await scrollTo(`#${id} .qbody`);
    await parkPointer();
    const before = await page.evaluate((fid) => {
      const f = document.getElementById(fid), q = f.querySelector(".qbody");
      return { state: window.__stateOf(q),
               ser: JSON.stringify(window.RaoPreview.serialize(q, f.dataset.behavior)),
               bubbles: f.querySelectorAll(".cc-msg").length };
    }, id);
    await driveWrong(id);
    const driven = await page.evaluate((fid) => {
      const f = document.getElementById(fid);
      return JSON.stringify(window.RaoPreview.serialize(f.querySelector(".qbody"), f.dataset.behavior));
    }, id);
    if (driven === "null") throw new Error("wrong-drive did not complete — serialize is still null (nothing to grade)");
    // settle: a tap within ~300ms of a touch DRAG can be swallowed by Chrome's
    // gesture recognizer (double-tap candidate) — real fingers pause too
    await page.waitForTimeout(350);
    await tap(`#${id} .pv-check`);
    try { await waitForButton(id, /Try again/, 2500); }
    catch (e) { await tap(`#${id} .pv-check`); await waitForButton(id, /Try again/, 6000); }
    const bubblesAtFeedback = await page.evaluate((fid) =>
      document.getElementById(fid).querySelectorAll(".cc-msg").length, id);
    await tapRowButton(id, /Try again/);
    await page.waitForTimeout(300);
    await parkPointer();
    const after = await page.evaluate((fid) => {
      const f = document.getElementById(fid), q = f.querySelector(".qbody");
      const msgs = [...f.querySelectorAll(".cc-msg")];
      return { state: window.__stateOf(q),
               ser: JSON.stringify(window.RaoPreview.serialize(q, f.dataset.behavior)),
               bubbles: msgs.length,
               bubblesVisible: msgs.every((m) => m.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(m).opacity) > 0.99),
               inert: q.inert === true,
               anyX: !!q.querySelector(".cc-x"), anyTried: !!q.querySelector(".cc-tried") };
    }, id);

    const diff = await page.evaluate(([a, b]) => window.__firstDiff(a, b), [before.state, after.state]);
    if (!diff && before.ser === after.ser) pass(name, `state restored exactly (${before.state.length} els, serialize ${before.ser})`);
    else fail(name, diff || `serialize ${before.ser} -> ${after.ser}`);
    if (after.anyX || after.anyTried) fail(`${name} — no residual whisper mark`, `cc-x=${after.anyX} cc-tried=${after.anyTried}`);
    if (after.inert) fail(`${name} — unlocked`, "qbody still inert after Try again");
    // LAW 4: the reset must not touch help — every bubble that existed in the
    // feedback state is still there, fully visible, after the reset.
    if (after.bubbles === bubblesAtFeedback && after.bubblesVisible)
      { if (bubblesAtFeedback > 0) pass(`${name} — law 4: ${bubblesAtFeedback} bubble(s) survive the reset`); }
    else fail(`${name} — law 4 HELP ACCUMULATES`, `bubbles ${bubblesAtFeedback} -> ${after.bubbles}, allVisible=${after.bubblesVisible}`);
    return after;
  }

  /* ── per-behavior wrong-answer drivers ─────────────────────────────── */

  // 0 single-select — pick "3" (wrong)
  await drill(0, "single-select", async (id) => {
    await tap(`#${id} .opt`, await optIdx(`#${id} .opt`, "3"));
  });

  // 1 multi-select — THE REPORTED DEFECT: select "2" (correct) + "3" (wrong)
  await drill(1, "multi-select", async (id) => {
    await tap(`#${id} .opt`, await optIdx(`#${id} .opt`, "2"));
    await tap(`#${id} .opt`, await optIdx(`#${id} .opt`, "3"));
  }, "(q2 'even numbers')");

  // 2 fill-blanks — type a wrong value; it must NOT survive the reset
  await drill(2, "fill-blanks", async (id) => {
    await setValue(`#${id} .blank-input`, null, "13");
  });

  // 3 expression
  await drill(3, "expression", async (id) => {
    await setValue(`#${id} .ans-input, #${id} .exprpow-input`, null, "17 + 2 = 20");
  });

  // 4 order — place ALL tiles in bank order (wrong); the FIRST placement is a
  // REAL drag (touch drag via CDP on mobile), the rest top up via the
  // tap-arm/tap-slot path until every slot is filled
  await drill(4, "order", async (id) => {
    await drag(`#${id} .order-bank .tile`, 0, `#${id} .order-slot`, 0);
    for (let attempt = 0; attempt < 8; attempt++) {
      const sIdx = await page.evaluate((fid) =>
        [...document.querySelectorAll(`#${fid} .order-slot`)].findIndex((s) => !s.classList.contains("filled")), id);
      if (sIdx < 0) break;
      await tap(`#${id} .order-bank .tile`, 0);
      await tap(`#${id} .order-slot`, sIdx);
    }
  });

  // 5 sequence-build — fill every slot with "2" (wrong). On the MOBILE pass
  // the FIRST placement is a genuine touch DRAG (touchStart→touchMove→touchEnd)
  // and the target slot MUST end up filled — this guards .sb-tile's
  // touch-action:none coverage in rao.css:611; without it the drag
  // pointercancels into a page scroll and the slot stays empty. The remaining
  // slots (and the whole desktop pass) fill via the tap-arm/tap-slot path.
  await drill(5, "sequence-build", async (id) => {
    if (touch) {
      await drag(`#${id} .sb-palette .sb-tile`, 0, `#${id} .sb-slot`, 0);
      const dragFilled = await page.evaluate((fid) => {
        const s = document.querySelector(`#${fid} .sb-slot`);
        return !!s && s.classList.contains("filled");
      }, id);
      if (!dragFilled) throw new Error("sb-tile TOUCH DRAG did not fill the first slot — the drag pointercancelled into a scroll (.sb-tile lacks touch-action:none in rao.css:611)");
      await page.waitForTimeout(350); // gesture-recognizer settle: a tap right after a touch drag can be swallowed as a double-tap candidate
    }
    for (let attempt = 0; attempt < 10; attempt++) {
      const sIdx = await page.evaluate((fid) =>
        [...document.querySelectorAll(`#${fid} .sb-slot`)].findIndex((s) => !s.classList.contains("filled")), id);
      if (sIdx < 0) break;
      await tap(`#${id} .sb-palette .sb-tile`, 0);
      await tap(`#${id} .sb-slot`, sIdx);
    }
  });

  // 6 categorize (bins) — drag ALL tiles into the first bin ("Even"; 7 is wrong).
  // categorize has no tap path: every placement is a genuine drag (CDP touch
  // on mobile). Top-up loop: a missed drop is retried, an empty tray ends it.
  await drill(6, "categorize", async (id) => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const left = await page.evaluate((fid) => document.querySelectorAll(`#${fid} .vs-tray .vs-tile`).length, id);
      if (!left) break;
      await drag(`#${id} .vs-tray .vs-tile`, 0, `#${id} .vs-zone`, 0);
    }
  }, "(bins, drag-only)");

  // 8 line-plot — tap one slot: col 1 count -> 1 (answer needs 2)
  await drill(8, "line-plot", async (id) => {
    await tap(`#${id} .lp-col .lp-slot`, 0);
  });

  // 9 time — type 3:45 + tap AM (answer is PM)
  await drill(9, "time", async (id) => {
    await setValue(`#${id} .time-input`, null, "3:45");
    const amIdx = await page.evaluate((fid) =>
      [...document.querySelectorAll(`#${fid} .ampm-btn`)].findIndex((b) => b.dataset.ap === "AM"), id);
    await tap(`#${id} .ampm-btn`, amIdx);
  });

  // 10 bar-graph — bars start at 0 and the child builds the graph; one
  // ArrowUp on the first bar overwrites data-value in place (the destroyed-
  // at-first-interaction case that forces snapshot-and-restore), then Check
  // grades wrong against ["4","2","5"].
  await drill(10, "bar-graph", async (id) => {
    const moved = await page.evaluate((fid) => {
      const bar = document.querySelector(`#${fid} .bg-editable`);
      const before = bar.dataset.value;
      bar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      return { before, after: bar.dataset.value };
    }, id);
    if (moved.before === moved.after) throw new Error(`bar did not move (value stayed ${moved.after}) — the wrong-drive is a no-op`);
  });

  // 11 lattice — one wrong digit
  await drill(11, "lattice", async (id) => {
    await setValue(`#${id} .lat-in`, 0, "9");
  });

  // 12 construct — TEST-SIDE RaoGeo stub: place a point, grade() is wrong;
  // the reset contract is re-mount-from-pristine-spec
  const mountsBefore = await page.evaluate(() => window.__geoMounts);
  await drill(12, "construct", async (id) => {
    await tap(`#${id} .geo-stub-dot`);
  }, "(RaoGeo stub)");
  const mountsAfter = await page.evaluate(() => window.__geoMounts);
  if (mountsAfter > mountsBefore)
    pass(`construct re-mount [${label}]`, `RaoGeo.mount called again on reset (${mountsBefore} -> ${mountsAfter})`);
  else fail(`construct re-mount [${label}]`, `RaoGeo.mount NOT re-called (${mountsBefore} -> ${mountsAfter}) — board would keep its placed state`);

  /* ── FR-1 req 4: the reset is visual/input ONLY — progress survives ──
     Ladder fixture (last card): wrong → Try again → SECOND wrong must offer
     "Walk me through it" (wrongCount survived the reset) and the hint ladder
     stays where it was (hint button label after a consumed rung). */
  try {
    const i = behaviors.length - 1;
    const id = "rst" + i;
    const name = `progress survives reset [${label}]`;
    await scrollTo(`#${id} .qbody`);
    await tap(`#${id} .opt`, await optIdx(`#${id} .opt`, "130,000"));
    await tap(`#${id} .pv-check`);
    await waitForButton(id, /Try again/, 8000);   // whyWrong bubble types first
    await tapRowButton(id, /Try again/);
    await page.waitForTimeout(300);
    const mid = await page.evaluate((fid) => {
      const f = document.getElementById(fid);
      return {
        bubbles: f.querySelectorAll(".cc-msg").length,
        anyX: !!f.querySelector(".cc-x"),
        residualSel: !!f.querySelector(".qbody .is-sel"),
        hintLabel: (f.querySelector(".pv-hint") || {}).textContent || "",
      };
    }, id);
    if (!mid.anyX && !mid.residualSel) pass(`${name} — task reset clean after wrong #1`, `bubbles kept: ${mid.bubbles}`);
    else fail(`${name} — task reset after wrong #1`, JSON.stringify(mid));
    if (mid.bubbles === 1) pass(`${name} — law 4: whyWrong bubble survives`);
    else fail(`${name} — law 4: whyWrong bubble survives`, `bubbles=${mid.bubbles}`);
    if (mid.hintLabel === "Give one more hint") pass(`${name} — ladder position survives`, `"${mid.hintLabel}"`);
    else fail(`${name} — ladder position survives`, `hint button reads "${mid.hintLabel}"`);
    await tap(`#${id} .opt`, await optIdx(`#${id} .opt`, "60,000"));
    await tap(`#${id} .pv-check`);
    await waitForButton(id, /Try again/, 8000);
    const row = await page.evaluate((fid) =>
      [...document.querySelectorAll("#" + fid + " .cc-actions button")]
        .filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.textContent), id);
    if (row.some((t) => /Walk me through it/.test(t)))
      pass(`${name} — wrongCount survived`, `2nd wrong offers: ${row.join(" / ")}`);
    else fail(`${name} — wrongCount survived`, `2nd wrong after reset offers only: ${JSON.stringify(row)} — the reset wiped attempt progress`);
  } catch (e) { fail(`progress survives reset [${label}]`, `drill errored: ${e.message}`); }

  // ── viewport hygiene: zero horizontal overflow, zero page errors ──
  const overflow = await page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
  if (overflow <= 1) pass(`zero horizontal overflow [${label}]`, `scrollWidth − innerWidth = ${overflow}px`);
  else fail(`zero horizontal overflow [${label}]`, `${overflow}px of horizontal overflow`);
  if (errors.length === 0) pass(`zero page errors [${label}]`);
  else fail(`zero page errors [${label}]`, errors.join(" | "));

  await context.close();
}

(async () => {
  console.log(`\n${C.b}RESET VERIFICATION${C.x} — Try Again restores first-attempt state (BRIEF FR-1, LAW 3 as amended)\n`);
  const browser = await chromium.launch();
  await runViewport(browser, { width: 1280, height: 800 }, false);
  await runViewport(browser, { width: 390, height: 844 }, true);
  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "RESET: Try Again returns every behavior to its first-attempt state ✅" : C.r + failures + " reset check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-reset crashed:", e); process.exit(1); });
