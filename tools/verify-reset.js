#!/usr/bin/env node
/* ── verify-reset.js — LAW 3 AS AMENDED (BRIEF FR-1 + BRIEF FR-2, 2026-07-19) ──
 *
 * WRONG IS A WHISPER — a wrong SELECTION is marked with a small red ✕ glyph
 * (rulings 1–3, HANDOFF-24), a wrong fill-blanks entry tints softly red with
 * the typed value PRESERVED (ruling 4) — AND THE MARKS DO NOT LINGER: when the
 * child taps "Try again" every ✕/tint clears and the TASK returns to its
 * first-attempt state (fill-blanks keeps the child's typed values — erasing
 * them reads as punishment). Help (hint bubbles, walkthrough steps)
 * accumulates and is NEVER touched by the reset (law 4).
 *
 * A1–A5 (BRIEF FR-2) live in wrongMarkLaws() below; the per-behavior reset
 * drill (FR-1) follows it.
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
window.__firstDiff = function (a, b, skip) {
  skip = skip || [];
  if (a.length !== b.length) return "element count " + a.length + " -> " + b.length +
    " (task structure changed — e.g. an injected mark or a moved tile)";
  for (var i = 0; i < a.length; i++) {
    var ka = a[i], kb = b[i];
    for (var k in ka) {
      if (skip.indexOf(k) !== -1) continue;
      if (String(ka[k]) !== String(kb[k]))
        return "el#" + i + " <" + kb.tag.toLowerCase() + (kb.cls ? " ." + kb.cls.replace(/ /g, ".") : "") +
               "> field " + k + ": " + JSON.stringify(ka[k]).slice(0, 120) + " -> " + JSON.stringify(kb[k]).slice(0, 120);
    }
  }
  return null;
};
`;

/* ════════════════════════════════════════════════════════════════
   A1–A5 — THE WRONG-MARK LAWS (BRIEF FR-2, 2026-07-19, per HANDOFF-24):
     A1  a wrong selection displays a ✕ mark on that option after Check.
     A2  a ✕ never appears on a correct selection — including a correct
         selection inside a wrong multi-select attempt.
     A3  a ✕ never appears on an unselected option.
     A4  Try Again clears every ✕/tint, and ONLY those: hint bubbles, chat
         content and action history are untouched (help accumulates), and
         attempt counters do not reset (counter survival is proven by the
         "progress survives reset" section — wrongCount + ladder position).
     A5  fill-blanks: a wrong blank tints (border + text) with NO ✕ glyph;
         a correct blank in the same attempt is untouched; the typed value
         is preserved VERBATIM through Check and through Try Again.
   Assertions are computed-style on a really-rendered card, never markup.
   ════════════════════════════════════════════════════════════════ */
const A5_FIXTURE = `
<!--@q
type: fill-blanks
answer: ["14", "20"]
hint: Add the ones first.
description: A5 fixture — two blanks so one can be wrong while one is right (BRIEF FR-2)
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">7 + 7 = [] and 10 + 10 = []</p>
</div>
`;
const RED_MARK = "rgb(239, 68, 68)";

async function wrongMarkLaws(browser) {
  console.log(`\n${C.b}── A1–A5: the wrong-mark laws (BRIEF FR-2) ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(
    buildPage().replace('<div id="source">', '<div id="source">' + A5_FIXTURE),
    { waitUntil: "load" });
  // frame 0 = injected A5 fill-blanks · 1 = single-select ("30") · 2 = multi-select (2/4/6)
  await page.evaluate(() => {
    const fr = document.querySelectorAll(".pv-frame");
    fr[0].id = "a5"; fr[1].id = "a1"; fr[2].id = "a2";
  });

  const clickOpt = (id, val) => page.evaluate(([fid, v]) => {
    const f = document.getElementById(fid);
    f.scrollIntoView({ block: "center" });
    const o = [...f.querySelectorAll(".opt")].find((x) =>
      String(x.dataset.val != null ? x.dataset.val : (x.textContent || "").trim()) === v);
    if (o) o.click();
    return !!o;
  }, [id, val]);
  const clickCheck = (id) => page.evaluate((fid) =>
    document.getElementById(fid).querySelector(".pv-check").click(), id);
  const tryAgain = async (id) => {
    const deadline = Date.now() + 6000;
    for (;;) {
      const hit = await page.evaluate((fid) => {
        const b = [...document.getElementById(fid).querySelectorAll(".cc-actions button")]
          .find((x) => x.getBoundingClientRect().width > 0 && /try again/i.test(x.textContent));
        if (b) b.click();
        return !!b;
      }, id);
      if (hit) return;
      if (Date.now() > deadline) throw new Error(`no "Try again" button appeared in #${id}`);
      await page.waitForTimeout(120);
    }
  };
  // per-option ✕ audit: {val, sel(at drive time is gone), hasX, xColor, xVisible}
  const xAudit = (id) => page.evaluate((fid) => {
    const f = document.getElementById(fid);
    return [...f.querySelectorAll(".opt")].map((o) => {
      const x = o.querySelector(".cc-x");
      const r = x && x.getBoundingClientRect();
      return {
        val: String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim()),
        hasX: !!x,
        tried: o.classList.contains("cc-tried"),
        xColor: x ? getComputedStyle(x).color : null,
        xVisible: !!(r && r.width > 0 && r.height > 0),
        glyph: x ? x.textContent : null,
      };
    });
  }, id);
  const marksLeft = (id) => page.evaluate((fid) => {
    const f = document.getElementById(fid);
    return {
      xs: f.querySelectorAll(".cc-x").length,
      trieds: f.querySelectorAll(".cc-tried").length,
      tints: f.querySelectorAll(".incorrect, .is-wrong").length,
      bubbles: f.querySelectorAll(".cc-msg").length,
      bubblesVisible: [...f.querySelectorAll(".cc-msg")]
        .every((m) => m.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(m).opacity) > 0.99),
    };
  }, id);

  /* ── A1 + A4 on the single-select frame ── */
  await clickOpt("a1", "3");                       // wrong (answer is "30")
  await clickCheck("a1");
  await page.waitForTimeout(900);                  // bubble types
  let audit = await xAudit("a1");
  const tried = audit.find((o) => o.val === "3");
  if (tried && tried.hasX && tried.xVisible && tried.xColor === RED_MARK && tried.glyph === "✕")
    pass("A1 — wrong selection carries a rendered red ✕ after Check", `option "3": color ${tried.xColor}`);
  else fail("A1 — wrong selection carries a rendered red ✕ after Check", JSON.stringify(tried));
  const bubblesAtWrong = (await marksLeft("a1")).bubbles;
  await tryAgain("a1");
  await page.waitForTimeout(300);
  let left = await marksLeft("a1");
  if (left.xs === 0 && left.trieds === 0 && left.tints === 0)
    pass("A4 — Try Again clears every ✕/tint (single-select)");
  else fail("A4 — Try Again clears every ✕/tint (single-select)", JSON.stringify(left));
  // (q1 authors no hint/whyWrong, so 0 bubbles is legitimate here — bubble
  //  SURVIVAL with real bubbles is proven by the reset drill + progress
  //  section below; this asserts the clear itself removed nothing.)
  if (left.bubbles === bubblesAtWrong && left.bubblesVisible)
    pass("A4 — help untouched by the clear", `${left.bubbles} bubble(s), unchanged`);
  else fail("A4 — help untouched by the clear", `bubbles ${bubblesAtWrong} -> ${left.bubbles}, visible=${left.bubblesVisible}`);

  /* ── A2 + A3 + A4 on the multi-select frame: "2" correct + "3" wrong ── */
  await clickOpt("a2", "2");                       // correct selection
  await clickOpt("a2", "3");                       // wrong selection
  await clickCheck("a2");
  await page.waitForTimeout(900);
  audit = await xAudit("a2");
  const wrongSel = audit.find((o) => o.val === "3");
  const rightSel = audit.find((o) => o.val === "2");
  const unselected = audit.filter((o) => ["4", "5", "6"].includes(o.val));
  if (wrongSel && wrongSel.hasX && wrongSel.xVisible && wrongSel.xColor === RED_MARK)
    pass("A1 — multi-select: the wrong selection carries the ✕", `option "3"`);
  else fail("A1 — multi-select: the wrong selection carries the ✕", JSON.stringify(wrongSel));
  if (rightSel && !rightSel.hasX && !rightSel.tried)
    pass("A2 — NO ✕ on the correct selection inside a wrong multi-select attempt", `option "2" unmarked`);
  else fail("A2 — NO ✕ on the correct selection inside a wrong multi-select attempt", JSON.stringify(rightSel));
  if (unselected.every((o) => !o.hasX && !o.tried))
    pass("A3 — NO ✕ on any unselected option", `options 4/5/6 unmarked`);
  else fail("A3 — NO ✕ on any unselected option", JSON.stringify(unselected));
  await tryAgain("a2");
  await page.waitForTimeout(300);
  left = await marksLeft("a2");
  if (left.xs === 0 && left.trieds === 0 && left.tints === 0)
    pass("A4 — Try Again clears every ✕ (multi-select)");
  else fail("A4 — Try Again clears every ✕ (multi-select)", JSON.stringify(left));

  /* ── A5 on the injected two-blank fill-blanks: blank 0 wrong, blank 1 right ── */
  await page.evaluate(() => {
    const f = document.getElementById("a5");
    f.scrollIntoView({ block: "center" });
    const inps = [...f.querySelectorAll(".blank-input")];
    inps[0].value = "13"; inps[0].dispatchEvent(new Event("input", { bubbles: true }));
    inps[1].value = "20"; inps[1].dispatchEvent(new Event("input", { bubbles: true }));
  });
  const restRef = await page.evaluate(() => {
    const inps = [...document.getElementById("a5").querySelectorAll(".blank-input")];
    const c = getComputedStyle(inps[1]);
    return { border: c.borderTopColor, text: c.color, bg: c.backgroundColor };
  });
  await clickCheck("a5");
  await page.waitForTimeout(900);
  const a5 = await page.evaluate(() => {
    const f = document.getElementById("a5");
    const inps = [...f.querySelectorAll(".blank-input")];
    const css = (el) => { const c = getComputedStyle(el); return { border: c.borderTopColor, text: c.color, bg: c.backgroundColor }; };
    return {
      wrong: css(inps[0]), right: css(inps[1]),
      wrongCls: inps[0].className, rightCls: inps[1].className,
      values: inps.map((i) => i.value),
      glyphs: f.querySelectorAll(".cc-x").length,
    };
  });
  if (a5.wrong.border === RED_MARK && a5.wrong.text === RED_MARK)
    pass("A5 — wrong blank tints border AND text softly red", `border ${a5.wrong.border}, text ${a5.wrong.text}`);
  else fail("A5 — wrong blank tints border AND text softly red", JSON.stringify(a5.wrong));
  if (a5.right.border === restRef.border && a5.right.text === restRef.text && a5.right.bg === restRef.bg && !/\b(in)?correct\b/.test(a5.rightCls))
    pass("A5 — correct blank in the same attempt is untouched", `computed-equal to its resting self`);
  else fail("A5 — correct blank in the same attempt is untouched", JSON.stringify({ right: a5.right, rest: restRef, cls: a5.rightCls }));
  if (a5.glyphs === 0) pass("A5 — no ✕ glyph anywhere on fill-blanks");
  else fail("A5 — no ✕ glyph anywhere on fill-blanks", `${a5.glyphs} .cc-x node(s)`);
  if (a5.values.join("|") === "13|20") pass("A5 — typed values preserved verbatim through Check", a5.values.join(", "));
  else fail("A5 — typed values preserved verbatim through Check", JSON.stringify(a5.values));
  await tryAgain("a5");
  await page.waitForTimeout(300);
  const a5after = await page.evaluate(() => {
    const f = document.getElementById("a5");
    const inps = [...f.querySelectorAll(".blank-input")];
    const c = getComputedStyle(inps[0]);
    return {
      values: inps.map((i) => i.value),
      classes: inps.map((i) => i.className),
      wrongBorder: c.borderTopColor, wrongText: c.color,
    };
  });
  if (a5after.values.join("|") === "13|20")
    pass("A5 — typed values preserved verbatim through Try Again", a5after.values.join(", "));
  else fail("A5 — typed values preserved verbatim through Try Again", `values ${JSON.stringify(a5after.values)} — the child's handwriting was erased`);
  if (a5after.wrongBorder !== RED_MARK && a5after.wrongText !== RED_MARK && a5after.classes.every((cl) => !/\b(in)?correct\b/.test(cl)))
    pass("A4/A5 — Try Again clears the tint (border + text back to resting)");
  else fail("A4/A5 — Try Again clears the tint", JSON.stringify(a5after));

  if (errors.length) fail("zero page errors (A1–A5 drive)", errors.join(" | "));
  else pass("zero page errors (A1–A5 drive)");
  await page.close();
}

/* ════════════════════════════════════════════════════════════════
   A6–A9 — THE TWO-ATTEMPT CAP (BRIEF FR-2 rulings 5–7, per HANDOFF-24):
     A6  a second wrong attempt locks the question: no Try Again control is
         offered or functional after it.
     A7  the walkthrough opens AUTOMATICALLY on the second wrong attempt,
         without any child action, wherever canWalk() is true.
     A8  at the moment the walkthrough opens (either path), NO green is
         present anywhere on the card (proved by sabotage: force an early
         green → FAIL → restore → PASS).
     A9  opening by EITHER path locks immediately and records
         solved-with-help. (The voluntary-tap half of A9 is guarded by
         verify-calm.js b. LOCK-ON-OPEN and verify-touch.js §3; this section
         proves the second-wrong AUTO-OPEN path.)
   Questions where canWalk() is FALSE are measured and left UNCHANGED —
   parked with Venkat (see the report), the injected no-solution fixture
   documents today's behaviour.
   ════════════════════════════════════════════════════════════════ */
const NOWALK_FIXTURE = `
<!--@q
type: single-select
answer: ["9"]
hint:
  - "Count on from the bigger number."
  - "Picture both groups joining into one group."
description: canWalk()-false fixture — select + ladder, NO solution (BRIEF FR-2 parked item)
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 4 + 5?</p>
  <ul class="options"><li>8</li><li>9</li><li>10</li></ul>
</div>
`;
const GREEN_MARK = "rgb(16, 185, 129)";

async function capLaws(browser) {
  console.log(`\n${C.b}── A6–A9: the two-attempt cap (BRIEF FR-2 rulings 5–7) ──${C.x}`);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(
    buildPage().replace('<div id="source">', '<div id="source">' + NOWALK_FIXTURE),
    { waitUntil: "load" });
  await page.evaluate(() => {
    const fr = document.querySelectorAll(".pv-frame");
    fr[0].id = "nowalk";                 // injected: canWalk() FALSE
    fr[fr.length - 1].id = "cap";        // ladder fixture: whyWrong + solution, canWalk() TRUE
  });

  const wrongOn = (id, val) => page.evaluate(([fid, v]) => {
    const f = document.getElementById(fid);
    f.scrollIntoView({ block: "center" });
    const o = [...f.querySelectorAll(".opt")].find((x) =>
      String(x.dataset.val != null ? x.dataset.val : (x.textContent || "").trim()) === v);
    if (!o) return false;
    o.click();
    f.querySelector(".pv-check").click();
    return true;
  }, [id, val]);
  const rowState = (id) => page.evaluate((fid) => {
    const f = document.getElementById(fid);
    return {
      row: [...f.querySelectorAll(".cc-actions button")]
        .filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.textContent),
      solOpen: !!(f.querySelector(".pv-solwrap") && !f.querySelector(".pv-solwrap").hasAttribute("hidden")),
      inert: f.querySelector(".qbody").inert === true,
    };
  }, id);
  const tapTryAgain = async (id) => {
    const deadline = Date.now() + 6000;
    for (;;) {
      const hit = await page.evaluate((fid) => {
        const b = [...document.getElementById(fid).querySelectorAll(".cc-actions button")]
          .find((x) => x.getBoundingClientRect().width > 0 && /try again/i.test(x.textContent));
        if (b) b.click();
        return !!b;
      }, id);
      if (hit) return true;
      if (Date.now() > deadline) return false;
      await page.waitForTimeout(120);
    }
  };

  /* ── canWalk() TRUE — the cap fires ── */
  await wrongOn("cap", "130,000");                 // wrong #1
  if (!(await tapTryAgain("cap"))) { fail("A6–A9 drive", "no Try again after wrong #1 — cannot reach the second attempt"); await page.close(); return; }
  const afterFirst = await rowState("cap");
  if (!afterFirst.solOpen && !afterFirst.inert)
    pass("cap is TWO, not one — first wrong leaves the question attemptable");
  else fail("cap is TWO, not one", JSON.stringify(afterFirst));
  await page.waitForTimeout(200);
  await wrongOn("cap", "60,000");                  // wrong #2 — the cap
  // Poll for the auto-open; capture the green/lock state ATOMICALLY in the
  // same evaluate that first sees the walkthrough open (A8 is "at the moment
  // the walkthrough opens").
  const atOpen = await (async () => {
    const deadline = Date.now() + 9000;
    for (;;) {
      const r = await page.evaluate(() => {
        const f = document.getElementById("cap");
        const sol = f.querySelector(".pv-solwrap");
        if (!sol || sol.hasAttribute("hidden")) return null;
        const qbody = f.querySelector(".qbody");
        const ans = JSON.parse(f.dataset.answer || "[]").map(String);
        const win = [...qbody.querySelectorAll(".opt")].find((o) =>
          ans.indexOf(String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim())) !== -1);
        return {
          greens: qbody.querySelectorAll(".is-correct, .cc-win").length,
          take: !!f.querySelector(".cc-take"),
          isChecked: qbody.classList.contains("is-checked"),
          winBorder: win ? getComputedStyle(win).borderColor : null,
          outcome: f.dataset.raoOutcome,
          recorded: (window.__raoOutcomes || []).map((o) => o.outcome),
          inert: qbody.inert === true,
          footHidden: getComputedStyle(f.querySelector(".pv-foot")).display === "none",
          retry: [...f.querySelectorAll("button")].filter((b) => {
            const r2 = b.getBoundingClientRect();
            return r2.width > 0 && /try again|try now|retry/i.test(b.textContent || "");
          }).map((b) => b.textContent),
        };
      });
      if (r) return r;
      if (Date.now() > deadline) return { timedOut: true };
      await page.waitForTimeout(80);
    }
  })();
  if (!atOpen.timedOut)
    pass("A7 — walkthrough OPENED AUTOMATICALLY on the second wrong attempt", "no child action beyond Check");
  else fail("A7 — walkthrough OPENED AUTOMATICALLY on the second wrong attempt", "9s after the second wrong Check, no walkthrough opened");
  if (!atOpen.timedOut && atOpen.inert && atOpen.footHidden && atOpen.retry.length === 0)
    pass("A6 — second wrong LOCKS: qbody inert, foot hidden, zero retry controls");
  else fail("A6 — second wrong LOCKS the question", JSON.stringify(atOpen));
  if (!atOpen.timedOut && atOpen.greens === 0 && !atOpen.take && !atOpen.isChecked && atOpen.winBorder !== GREEN_MARK)
    pass("A8 — NO green anywhere at walkthrough open", `correct option border ${atOpen.winBorder}`);
  else fail("A8 — NO green anywhere at walkthrough open", JSON.stringify(atOpen));
  if (!atOpen.timedOut && atOpen.outcome === "solved-with-help" &&
      atOpen.recorded.includes("solved-with-help") && !atOpen.recorded.includes("correct"))
    pass("A9 — auto-open records solved-with-help, not correct", `outcome=${atOpen.outcome}`);
  else fail("A9 — auto-open records solved-with-help, not correct", JSON.stringify({ outcome: atOpen.outcome, recorded: atOpen.recorded }));
  // A6, held: still no retry control materialises after the open settles
  await page.waitForTimeout(900);
  const settled = await rowState("cap");
  if (settled.row.every((t) => !/try again|try now|retry/i.test(t)) && settled.inert)
    pass("A6 — lock holds after the open settles", `row: ${JSON.stringify(settled.row)}`);
  else fail("A6 — lock holds after the open settles", JSON.stringify(settled));

  /* ── canWalk() FALSE — MEASURED, changed by nothing (parked with Venkat) ── */
  await wrongOn("nowalk", "8");                    // wrong #1
  await tapTryAgain("nowalk");
  await page.waitForTimeout(200);
  await wrongOn("nowalk", "8");                    // wrong #2
  const gotRow = await tapTryAgain("nowalk") ? "Try again offered and functional" : "NO Try again";
  const nowalk = await rowState("nowalk");
  pass("parked (measured, unchanged) — canWalk()-false second wrong", `${gotRow}; no walkthrough (solOpen=${nowalk.solOpen}); the child may keep retrying`);

  if (errors.length) fail("zero page errors (A6–A9 drive)", errors.join(" | "));
  else pass("zero page errors (A6–A9 drive)");
  await page.close();
}

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
  async function drill(i, behavior, driveWrong, extraLabel, opts) {
    const id = "rst" + i;
    const name = `${behavior}${extraLabel ? " " + extraLabel : ""} [${label}]`;
    if (behaviors[i] !== behavior) { fail(name, `fixture order changed: frame ${i} is ${behaviors[i]}`); return; }
    try { return await drillBody(i, id, name, driveWrong, opts || {}); }
    catch (e) { fail(name, `drill errored: ${e.message}`); }
  }
  async function drillBody(i, id, name, driveWrong, opts) {
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

    // FR-2 ruling 4 (keepValues): fill-blanks preserves the child's typed
    // values through Try Again — the value PROPERTY is exempt from the
    // exact-restore compare, and serialize must still read the DRIVEN values.
    // Everything else (classes = tints, computed paint, structure) restores.
    const diff = await page.evaluate(([a, b, skip]) => window.__firstDiff(a, b, skip),
      [before.state, after.state, opts.keepValues ? ["val"] : []]);
    if (opts.keepValues) {
      if (!diff && after.ser === driven) pass(name, `marks cleared, typed values preserved verbatim (serialize ${driven}) — FR-2 ruling 4`);
      else fail(name, diff || `serialize after Try Again ${after.ser} != driven ${driven} — the typed value was cleared (FR-1 behaviour; FR-2 ruling 4 forbids it)`);
    } else if (!diff && before.ser === after.ser) pass(name, `state restored exactly (${before.state.length} els, serialize ${before.ser})`);
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

  // 2 fill-blanks — type a wrong value; per FR-2 ruling 4 it MUST survive the
  // reset (the typed value is the child's handwriting — never erased), while
  // the .incorrect tint clears. INVERTED from FR-1's "must NOT survive".
  await drill(2, "fill-blanks", async (id) => {
    await setValue(`#${id} .blank-input`, null, "13");
  }, "(typed value survives, tint clears)", { keepValues: true });

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
    // BRIEF-3 Item C: sequence-build tiles now MOVE (placed once each), not COPY.
    // The old wrong-drive tapped palette tile 0 into every slot to make [2,2,2,2];
    // under move semantics that yields the CORRECT sequence and the drill can no
    // longer reach a wrong state. Drive a wrong ORDER instead: rotate the answer
    // by one (distinct tiles → guaranteed ≠ answer) and place each tile by value.
    const answer = await page.evaluate((fid) => JSON.parse(document.getElementById(fid).dataset.answer), id);
    const wrong = answer.slice(1).concat(answer.slice(0, 1));
    const palIdxOf = (v) => page.evaluate(([fid, val]) =>
      [...document.querySelectorAll(`#${fid} .sb-palette .sb-tile`)].findIndex((t) =>
        (t.dataset.val != null ? t.dataset.val : (t.textContent || "").trim()) === val), [id, v]);
    for (let i = 0; i < wrong.length; i++) {
      const tIdx = await palIdxOf(wrong[i]);
      if (tIdx < 0) throw new Error(`sequence-build palette tile "${wrong[i]}" not found (move semantics: already placed?)`);
      if (touch && i === 0) {
        // keep the touch-DRAG placement assertion (touch-action:none regression guard)
        await drag(`#${id} .sb-palette .sb-tile`, tIdx, `#${id} .sb-slot`, 0);
        const dragFilled = await page.evaluate((fid) => {
          const s = document.querySelector(`#${fid} .sb-slot`);
          return !!s && s.classList.contains("filled");
        }, id);
        if (!dragFilled) throw new Error("sb-tile TOUCH DRAG did not fill the first slot — the drag pointercancelled into a scroll (.sb-tile lacks touch-action:none in rao.css:611)");
        await page.waitForTimeout(350); // gesture-recognizer settle
      } else {
        await tap(`#${id} .sb-palette .sb-tile`, tIdx);
        await tap(`#${id} .sb-slot`, i);
      }
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
    // FR-2 ruling 5: the SECOND wrong now auto-opens the walkthrough — its
    // firing is itself the proof that wrongCount survived the reset (the cap
    // only trips at wrongCount >= 2). Was: "2nd wrong offers Walk me through
    // it" — updated for the two-attempt cap.
    const opened = await (async () => {
      const deadline = Date.now() + 9000;
      for (;;) {
        const r = await page.evaluate((fid) => {
          const f = document.getElementById(fid);
          const sol = f.querySelector(".pv-solwrap");
          if (!sol || sol.hasAttribute("hidden")) return null;
          return { outcome: f.dataset.raoOutcome, inert: f.querySelector(".qbody").inert === true };
        }, id);
        if (r) return r;
        if (Date.now() > deadline) return { timedOut: true };
        await page.waitForTimeout(120);
      }
    })();
    if (!opened.timedOut && opened.outcome === "solved-with-help" && opened.inert)
      pass(`${name} — wrongCount survived`, `2nd wrong after the reset trips the cap: walkthrough auto-opened, solved-with-help`);
    else fail(`${name} — wrongCount survived`, `2nd wrong after reset did not trip the cap: ${JSON.stringify(opened)} — the reset wiped attempt progress`);
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
  console.log(`\n${C.b}RESET VERIFICATION${C.x} — wrong-marks (BRIEF FR-2 A1–A5) + Try Again restore (BRIEF FR-1)\n`);
  const browser = await chromium.launch();
  await wrongMarkLaws(browser);
  await capLaws(browser);
  await runViewport(browser, { width: 1280, height: 800 }, false);
  await runViewport(browser, { width: 390, height: 844 }, true);
  await browser.close();
  console.log(`\n${failures === 0 ? C.g + "RESET: Try Again returns every behavior to its first-attempt state ✅" : C.r + failures + " reset check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-reset crashed:", e); process.exit(1); });
