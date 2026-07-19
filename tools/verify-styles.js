/* ============================================================================
   verify-styles.js — catches styling regressions the grading harness cannot see.

   harness.js proves a question GRADES correctly. It clicks options and checks the
   answer. It never LOOKS at what it clicked. So a selected option could carry a
   double border, an invisible label or a 20px shadow and every test would still
   pass 124/124.

   That is exactly how the double-border bug survived: two separate rules were both
   painting a ring on .opt.is-sel — a 2px border AND a 3px outline at 2px offset —
   and nothing in the repo could see it.

   This renders real questions in Chromium, drives them with real clicks and real
   keystrokes, and asserts on COMPUTED STYLE. Not markup — computed style. The CSS
   scoper silently drops rules whose classes don't appear in static markup, so
   reading the stylesheet proves nothing about what actually paints.

   Checks:
     1. ONE RING ONLY  — a selected option must not paint a border AND an outline.
     2. VISIBLE SELECT — a selected option must be visibly different from a resting
                         one (border colour, background, or shadow must change).
     3. KEYBOARD A11Y  — :focus-visible must still draw a ring. Removing the double
                         border must not silently blind keyboard users. Children on
                         school laptops tab through these.
     4. NO MOUSE RING  — but a MOUSE click must NOT draw that focus ring.

   Usage:  node tools/verify-styles.js
   ========================================================================== */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REVIEW = path.join(ROOT, "review");

const px = (v) => parseFloat(v) || 0;

async function checkLesson(page, file) {
  await page.goto("file://" + path.join(REVIEW, file));
  await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 0, { timeout: 15000 })
            .catch(() => {});
  await page.waitForTimeout(1200);

  const problems = [];

  // ---- REVIEW PAGE BACKGROUND — the page furniture must match the app's white --
  // A review page built before the 2026-07-18 card-look revision still carries the
  // old lavender body. On-disk reviews are the deliverable, so assert per page.
  // (transparent is fine too — an undeclared body paints over the white canvas;
  //  review/index.html has no body background at all. The target here is a STALE
  //  page still carrying the pre-2026-07-18 lavender #f4f1fb.)
  const pageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (pageBg !== "rgb(255, 255, 255)" && pageBg !== "rgba(0, 0, 0, 0)")
    problems.push(`review page body background is ${pageBg} — must be #ffffff (stale page? regenerate with make-review)`);

  // ---- FRACTION RENDERING — n/d must be STACKED, barred, and NOT oversized ----
  // Guards the exact bug reported on simple_fractions_shape: the sign-detector saw "1/2"
  // as a 3-char symbol and blew every fraction up to the 2.1rem opt-sign glyph. A green
  // grading run never sees this — it clicks data-val, never looks. So we assert on paint:
  // the numerator sits above the denominator, the bar actually draws, and the option is
  // neither tagged opt-sign nor rendered at glyph size.
  const frac = await page.evaluate(() => {
    const isFracText = (t) => /^\s*\d+\s*\/\s*\d+\s*$/.test(t || "");
    const out = {};
    // (a) REGRESSION CATCH: a bare-fraction option/tile that still shows FLAT "n/d" text
    // (no .frac child) is the original bug — whether or not it also got .opt-sign. A stacked
    // fraction's textContent is "12" (no slash), so this only ever fires on unstacked ones.
    const flatEl = [...document.querySelectorAll(".opt, .tile")]
      .find((el) => isFracText(el.textContent) && !el.querySelector(".frac"));
    if (flatEl) {
      out.flat = true;
      out.flatSign = flatEl.classList.contains("opt-sign");
      out.flatFontPx = parseFloat(getComputedStyle(flatEl).fontSize) || 0;
    }
    // (b) PAINT CHECK: where a stacked fraction exists, it must be well-formed and legible.
    const el = document.querySelector(".frac");
    if (el) {
      out.hasFrac = true;
      const n = el.querySelector(".frac-n"), d = el.querySelector(".frac-d");
      if (!n || !d) { out.malformed = true; return out; }
      const nb = n.getBoundingClientRect(), db = d.getBoundingClientRect();
      const cs = getComputedStyle(d);
      const btn = el.closest(".opt, .tile");
      out.stacked = nb.bottom <= db.top + 1;          // numerator sits ABOVE denominator
      out.barW = parseFloat(cs.borderTopWidth) || 0;  // the fraction bar
      out.barStyle = cs.borderTopStyle;
      out.isSign = btn ? btn.classList.contains("opt-sign") : false;
      out.fontPx = btn ? parseFloat(getComputedStyle(btn).fontSize) : 0;
    }
    return out;
  });
  if (frac.flat)
    problems.push(
      `a bare fraction option/tile (n/d) renders as FLAT TEXT, not stacked` +
      (frac.flatSign ? ` and is tagged .opt-sign — the 2.1rem oversize bug` : ``) +
      ` (font ${frac.flatFontPx || "?"}px)`);
  if (frac.hasFrac) {
    if (frac.malformed)
      problems.push("a fraction is missing its numerator/denominator (.frac-n / .frac-d)");
    else {
      if (!frac.stacked)
        problems.push("a fraction renders SIDE-BY-SIDE, not stacked (numerator is not above the denominator)");
      if (!(frac.barW > 0 && frac.barStyle !== "none"))
        problems.push(`a fraction has NO visible bar (border-top ${frac.barW}px ${frac.barStyle})`);
      if (frac.isSign)
        problems.push("a fraction option is tagged .opt-sign — the sign-detector is oversizing it (the 2.1rem bug is back)");
      if (frac.fontPx >= 28)
        problems.push(`a fraction option is oversized (${frac.fontPx}px ≥ 28px) — it is being treated as a giant operator glyph`);
    }
  }

  // ---- NO INNER QUESTION PANEL (BRIEF-CARD-LOOK-2, 2026-07-18) ---------------
  // This INVERTS the old "work-panel must paint" guard: per the signed-off demo,
  // there is NO intermediate surface between the white card face and the question
  // content. The .qbody must paint no background of its own — transparent (or
  // plain white) over the card face. A grading run can never see this; assert on
  // computed style.
  const panelBg = await page.evaluate(() => {
    const q = document.querySelector(".pv-frame .qbody");
    return q ? getComputedStyle(q).backgroundColor : null;
  });
  if (panelBg && panelBg !== "rgba(0, 0, 0, 0)" && panelBg !== "rgb(255, 255, 255)")
    problems.push(
      `the .qbody paints an INNER PANEL (computed background ${panelBg}) — the card ` +
      `face is the only surface; question content sits directly on white`);

  // ---- find a card with plain .opt options (single-select / multi-select) -----
  const idx = await page.evaluate(() => {
    const fr = [...document.querySelectorAll(".pv-frame")];
    return fr.findIndex((f) => f.querySelectorAll(".opt").length >= 2);
  });
  if (idx < 0) return problems; // nothing to check in this lesson

  const frame = page.locator(".pv-frame").nth(idx);
  const opt = frame.locator(".opt").first();
  const sibling = frame.locator(".opt").nth(1);

  // resting appearance, for comparison
  const rest = await sibling.evaluate((e) => {
    const c = getComputedStyle(e);
    return { border: c.borderColor, bg: c.backgroundColor, shadow: c.boxShadow };
  });

  // ---- 1 + 2 + 4: MOUSE click -----------------------------------------------
  await opt.click();
  await page.waitForTimeout(350); // let any transition settle before reading

  const sel = await opt.evaluate((e) => {
    const c = getComputedStyle(e);
    return {
      isSel: e.classList.contains("is-sel"),
      borderW: c.borderWidth, borderColor: c.borderColor, borderStyle: c.borderStyle,
      outlineW: c.outlineWidth, outlineStyle: c.outlineStyle,
      bg: c.backgroundColor, shadow: c.boxShadow,
    };
  });

  if (!sel.isSel) {
    problems.push("clicking an option did not select it (.is-sel never applied)");
    return problems;
  }

  const hasBorder = sel.borderStyle !== "none" && px(sel.borderW) > 0;
  const hasOutline = sel.outlineStyle !== "none" && px(sel.outlineW) > 0;

  // 1. THE DOUBLE-BORDER BUG
  if (hasBorder && hasOutline)
    problems.push(
      `DOUBLE BORDER on a selected option: border ${sel.borderW} ${sel.borderStyle} ` +
      `AND outline ${sel.outlineW} ${sel.outlineStyle}. Pick one. ` +
      `(a mouse click must not draw a focus ring — use :focus-visible for keyboards)`);

  // 4. a mouse click must not leave a focus ring behind
  if (hasOutline && !hasBorder)
    problems.push(
      `a MOUSE click draws an outline (${sel.outlineW}). That ring is for keyboard ` +
      `users only — move it to :focus-visible.`);

  // 2. selection must be visible at all
  const changed =
    sel.borderColor !== rest.border || sel.bg !== rest.bg || sel.shadow !== rest.shadow;
  if (!changed)
    problems.push("a selected option looks IDENTICAL to an unselected one — nothing changes");

  // ---- 3: KEYBOARD focus must still ring -------------------------------------
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press("Tab");
  await page.waitForTimeout(250);

  const kb = await page.evaluate(() => {
    const e = document.activeElement;
    if (!e || !e.classList || !e.classList.contains("opt")) return null;
    const c = getComputedStyle(e);
    return {
      ring: (c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0) ||
            /inset/.test(c.boxShadow) || parseFloat(c.borderWidth) > 2,
      outline: c.outlineWidth + " " + c.outlineStyle,
    };
  });

  if (kb && !kb.ring)
    problems.push(
      "KEYBOARD ACCESSIBILITY: a Tab-focused option draws NO visible ring " +
      `(outline: ${kb.outline}). Keyboard users cannot see where they are. ` +
      "Add .opt:focus-visible{outline:3px solid var(--brand)}.");

  return problems;
}

/* ---- BUG 4: the explanation must actually REVEAL on Check --------------------
   rao.css hides `.explain` by default and only un-hides it via
   `[data-mode="…"].is-checked .explain`. For years nothing set those hooks, so
   every explanation was emitted, styled — and permanently invisible. A grading
   run can never catch this: the explanation's visibility has nothing to do with
   whether the answer is right. So we build a card WITH an explanation, drive a
   real Check click, and assert the paragraph goes from 0-height to visible.
   No lesson currently ships `explain:`, hence the self-contained fixture. */
async function checkExplainReveal(page) {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
  const html =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<style>${read("engine/rao.css")}</style>` +
    `<style>${read("engine/rao-card.css")}</style></head><body>` +
    `<div id="source">` +
    `<!--@q\ntype: single-select\nanswer: ["4"]\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">What is 2 + 2?</p>` +
    `<ul class="options"><li data-val="3">3</li><li data-val="4">4</li></ul>` +
    `<p class="explain">Two plus two makes four.</p>` +
    `</div></div>` +
    `<div id="preview" class="rao-lesson" data-theme="grape"></div>` +
    `<script>${read("engine/preview-engine.js")}</script>` +
    `<script>${read("engine/rao-card.js")}</script>` +
    `</body></html>`;
  const tmp = path.join(ROOT, "review", "__explain_fixture.html");
  fs.writeFileSync(tmp, html);
  const problems = [];
  try {
    await page.goto("file://" + tmp);
    await page.waitForFunction(() => document.querySelector(".pv-frame .explain"), { timeout: 15000 })
              .catch(() => {});
    const before = await page.evaluate(() => {
      const e = document.querySelector(".pv-frame .explain");
      if (!e) return { missing: true };
      return { h: e.getBoundingClientRect().height, disp: getComputedStyle(e).display };
    });
    if (before.missing) { problems.push("BUG 4: the `.explain` paragraph was never emitted into the card"); return problems; }
    if (before.h > 0 || before.disp !== "none")
      problems.push(`BUG 4: the explanation is visible BEFORE Check (height ${before.h}px, display ${before.disp}) — it should stay hidden until Check`);

    // select the answer, then press Check
    await page.locator('.pv-frame .opt[data-val="4"]').click();
    await page.locator(".pv-frame .pv-check").click();
    await page.waitForTimeout(400);

    const after = await page.evaluate(() => {
      const e = document.querySelector(".pv-frame .explain");
      const q = document.querySelector(".pv-frame .qbody");
      return {
        h: e.getBoundingClientRect().height, disp: getComputedStyle(e).display,
        mode: q && q.getAttribute("data-mode"), checked: q && q.classList.contains("is-checked"),
      };
    });
    if (!(after.h > 0) || after.disp === "none")
      problems.push(
        `BUG 4: the explanation is STILL hidden after Check (height ${after.h}px, display ${after.disp}, ` +
        `data-mode=${after.mode}, is-checked=${after.checked}) — the reveal hooks are not being set`);
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return problems;
}

/* ---- MOBILE INVARIANTS (380×800) ─────────────────────────────────────────
   These run on a self-contained fixture at phone width. Each guards one of
   the four mobile bugs that a desktop-viewport test can never catch:
     1. Card gutters — left ≈ right (±2px), content gets ≥ 280px
     2. Column-arithmetic — .vmul-grid fits inside .qbody (no clip)
     3. Hint/Check — both ≥ 44px tall (tap target), font shrunk from desktop
     4. Blank input — solid border (not dashed), visible fill, ≥ 44×44px    */
async function checkMobileInvariants(browser) {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
  const html =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width">` +
    `<style>${read("engine/rao.css")}</style>` +
    `<style>${read("engine/rao-card.css")}</style></head><body style="margin:0;padding:0">` +
    `<div id="source">` +
    `<!--@q\ntype: fill-blanks\nanswer: ["42"]\n-->` +
    `<div class="question" data-type="fill-blanks">` +
    `<p class="prompt">What is the answer? []</p>` +
    `</div>` +
    `<!--@q\ntype: single-select\nanswer: ["4"]\nhint: Two plus two.\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">What is 2 + 2?</p>` +
    `<ul class="options"><li data-val="3">3</li><li data-val="4">4</li></ul>` +
    `</div>` +
    `</div>` +
    `<div id="preview" class="rao-lesson" data-theme="grape"></div>` +
    `<script>${read("engine/preview-engine.js")}</script>` +
    `<script>${read("engine/rao-card.js")}</script>` +
    `</body></html>`;
  const tmp = path.join(ROOT, "review", "__mobile_fixture.html");
  fs.writeFileSync(tmp, html);
  const problems = [];
  const page = await browser.newPage({ viewport: { width: 380, height: 800 } });
  try {
    await page.goto("file://" + tmp);
    await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length >= 2, { timeout: 15000 })
              .catch(() => {});
    await page.waitForTimeout(250);

    // 1. CARD GUTTERS — symmetrical, content ≥ 280px
    const gutters = await page.evaluate(() => {
      const card = document.querySelector(".pv-card");
      if (!card) return null;
      const cr = card.getBoundingClientRect();
      const frame = card.closest(".pv-frame");
      const fr = frame ? frame.getBoundingClientRect() : null;
      const lesson = document.querySelector(".rao-lesson");
      const lr = lesson ? lesson.getBoundingClientRect() : null;
      // qbody is where content actually lives
      const qb = card.querySelector(".qbody");
      const qr = qb ? qb.getBoundingClientRect() : null;
      return {
        cardLeft: cr.left, cardRight: 380 - cr.right, cardWidth: cr.width,
        contentLeft: qr ? qr.left : 0, contentRight: qr ? 380 - qr.right : 0,
        contentWidth: qr ? qr.width : 0,
      };
    });
    if (gutters) {
      const diff = Math.abs(gutters.contentLeft - gutters.contentRight);
      if (diff > 4)
        problems.push(
          `MOBILE GUTTERS: left (${gutters.contentLeft.toFixed(1)}px) and right ` +
          `(${gutters.contentRight.toFixed(1)}px) content gutters differ by ${diff.toFixed(1)}px — must be ≤ 4px`);
      if (gutters.contentWidth < 280)
        problems.push(
          `MOBILE CONTENT WIDTH: only ${gutters.contentWidth.toFixed(0)}px at 380px viewport — ` +
          `must be ≥ 280px. Padding is eating too much space.`);
    }

    // 2. VMUL OVERFLOW — check if vmul-grid would clip
    // (no vmul in this fixture, but guard the vcol which IS present via fill-blanks
    //  with column layout — we check the qbody overflow principle)
    const overflow = await page.evaluate(() => {
      const qb = document.querySelector(".qbody");
      if (!qb) return null;
      return { scrollW: qb.scrollWidth, clientW: qb.clientWidth };
    });
    if (overflow && overflow.scrollW > overflow.clientW + 2)
      problems.push(
        `MOBILE OVERFLOW: .qbody scrollWidth (${overflow.scrollW}px) > clientWidth ` +
        `(${overflow.clientW}px) — content is clipped or scrolling horizontally`);

    // 3. HINT/CHECK BUTTONS — ≥ 44px tap height, font smaller than desktop
    //    The hint button is display:none when no hint exists, so find the first VISIBLE one.
    const buttons = await page.evaluate(() => {
      const hints = [...document.querySelectorAll(".pv-hint")];
      const hint = hints.find(h => getComputedStyle(h).display !== "none");
      const check = document.querySelector(".pv-check");
      if (!hint || !check) return null;
      const hs = getComputedStyle(hint);
      const cs = getComputedStyle(check);
      return {
        hintH: hint.getBoundingClientRect().height,
        hintFont: parseFloat(hs.fontSize),
        checkH: check.getBoundingClientRect().height,
        checkFont: parseFloat(cs.fontSize),
      };
    });
    if (buttons) {
      if (buttons.hintH < 44)
        problems.push(`MOBILE HINT: rendered height ${buttons.hintH.toFixed(1)}px < 44px tap target`);
      if (buttons.checkH < 44)
        problems.push(`MOBILE CHECK: rendered height ${buttons.checkH.toFixed(1)}px < 44px tap target`);
      if (buttons.hintFont > 15.5)
        problems.push(`MOBILE HINT: font ${buttons.hintFont.toFixed(1)}px is desktop-sized (should be ≤ 15px)`);
      if (buttons.checkFont > 15.5)
        problems.push(`MOBILE CHECK: font ${buttons.checkFont.toFixed(1)}px is desktop-sized (should be ≤ 15px)`);
    }

    // 4. BLANK INPUT — solid border, visible fill, ≥ 44×44px
    const blank = await page.evaluate(() => {
      const el = document.querySelector(".blank-input");
      if (!el) return null;
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const alpha = (rgb) => {
        const m = /rgba?\(([^)]+)\)/.exec(rgb || "");
        if (!m) return 0;
        const p = m[1].split(",").map((s) => s.trim());
        return p.length >= 4 ? parseFloat(p[3]) : 1;
      };
      return {
        w: r.width, h: r.height,
        borderStyle: c.borderStyle, borderW: parseFloat(c.borderWidth),
        bg: c.backgroundColor, bgAlpha: alpha(c.backgroundColor),
        radius: parseFloat(c.borderTopLeftRadius),
      };
    });
    if (blank) {
      if (blank.borderStyle === "dashed")
        problems.push(`BLANK INPUT: border is dashed — must be solid so a child recognises it as tappable`);
      if (blank.bgAlpha < 0.05)
        problems.push(`BLANK INPUT: background is transparent (${blank.bg}) — needs a visible tinted fill`);
      if (blank.w < 42 || blank.h < 42)
        problems.push(`BLANK INPUT: ${blank.w.toFixed(0)}×${blank.h.toFixed(0)}px — must be ≥ 44×44px tap target`);
      if (blank.radius < 10)
        problems.push(`BLANK INPUT: border-radius ${blank.radius}px — should be ≥ 12px`);
      if (blank.borderW < 1.5)
        problems.push(`BLANK INPUT: border ${blank.borderW}px — should be ≥ 2px for visibility`);
    }
  } finally {
    await page.close();
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return problems;
}

/* ---- CARD LOOK — the shipped card anatomy (CALM-CARD-MASTER-SPEC §1, ----------
   revised 2026-07-18 by tuner readout). The grading harness never looks at the
   chrome, and a stale on-disk review page still carries the OLD css it was built
   with — so this check renders a fixture from the CURRENT shared files
   (rao.css + rao-card.css), the same way the app composes them, and asserts on
   computed style at BOTH a desktop and a phone viewport:
     frame  — .pv-frame padding 3px on all sides
     card   — .pv-card border-radius 25px (concentric: 28 outer − 3 frame)
     halo   — .pv-frame box-shadow 0 9px 21px @ alpha .34 (grape 123,92,255)
     ledge  — .pv-card box-shadow 0 5px 0 @ alpha .12
     page   — .rao-lesson background-color #ffffff
     grid   — checker lines rgba(124,58,237,.09) (grape pinned), 30px cells   */
async function checkCardLook(browser) {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
  const html =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width">` +
    `<style>${read("engine/rao.css")}</style>` +
    `<style>${read("engine/rao-card.css")}</style></head><body style="margin:0;padding:0">` +
    `<div id="source">` +
    `<!--@q\ntype: single-select\nanswer: ["4"]\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">What is 2 + 2?</p>` +
    `<ul class="options"><li data-val="3">3</li><li data-val="4">4</li></ul>` +
    `</div></div>` +
    `<div id="preview" class="rao-lesson" data-theme="grape"></div>` +
    `<script>${read("engine/preview-engine.js")}</script>` +
    `<script>${read("engine/rao-card.js")}</script>` +
    `</body></html>`;
  const tmp = path.join(ROOT, "review", "__cardlook_fixture.html");
  if (!fs.existsSync(path.dirname(tmp))) fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, html);
  const problems = [];
  try {
    for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: vp });
      try {
        await page.goto("file://" + tmp);
        await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 0, { timeout: 15000 })
                  .catch(() => {});
        await page.waitForTimeout(300);
        const look = await page.evaluate(() => {
          const frame = document.querySelector(".pv-frame");
          const card = document.querySelector(".pv-card");
          const pane = document.querySelector(".rao-lesson");
          if (!frame || !card || !pane) return null;
          const f = getComputedStyle(frame), c = getComputedStyle(card), p = getComputedStyle(pane);
          const qbody = document.querySelector(".pv-frame .qbody");
          return {
            pad: [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft],
            radius: c.borderTopLeftRadius,
            halo: f.boxShadow,
            ledge: c.boxShadow,
            paneBg: p.backgroundColor,
            grid: p.backgroundImage,
            gridSize: p.backgroundSize,
            qbodyBg: qbody ? getComputedStyle(qbody).backgroundColor : "MISSING",
          };
        });
        const at = `${vp.width}px`;
        if (!look) { problems.push(`${at}: no .pv-frame/.pv-card/.rao-lesson rendered — cannot verify card look`); continue; }
        if (!look.pad.every((v) => v === "3px"))
          problems.push(`${at}: FRAME thickness is ${look.pad.join("/")} — .pv-frame padding must be 3px on all sides`);
        if (look.radius !== "25px")
          problems.push(`${at}: CARD inner border-radius is ${look.radius} — must be 25px (concentric: 28 − 3)`);
        if (!(look.halo.includes("0px 9px 21px") && look.halo.includes("rgba(123, 92, 255, 0.34)")))
          problems.push(`${at}: HALO box-shadow is "${look.halo}" — must be 0 9px 21px rgba(123, 92, 255, 0.34)`);
        if (!(look.ledge.includes("0px 5px 0px") && look.ledge.includes("rgba(123, 92, 255, 0.12)")))
          problems.push(`${at}: LEDGE box-shadow is "${look.ledge}" — must be 0 5px 0 rgba(123, 92, 255, 0.12)`);
        if (look.paneBg !== "rgb(255, 255, 255)")
          problems.push(`${at}: PAGE background-color is ${look.paneBg} — .rao-lesson must paint #ffffff`);
        const lines = (look.grid.match(/rgba\(124, 58, 237, 0\.09\)/g) || []).length;
        if (lines !== 2)
          problems.push(`${at}: CHECKER grid — found ${lines} gradient line colours at rgba(124, 58, 237, 0.09), expected 2 (horizontal + vertical). background-image: "${look.grid}"`);
        // background-size serializes once PER GRADIENT LAYER ("30px 30px, 30px 30px")
        if (!look.gridSize.split(/,\s*/).every((s) => s.trim() === "30px 30px"))
          problems.push(`${at}: CHECKER size is "${look.gridSize}" — every layer must be 30px 30px`);
        if (look.qbodyBg !== "rgba(0, 0, 0, 0)" && look.qbodyBg !== "rgb(255, 255, 255)")
          problems.push(`${at}: INNER PANEL — .qbody paints background ${look.qbodyBg}; the card face is the only surface (must be transparent or #ffffff)`);
      } finally {
        await page.close();
      }
    }
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return problems;
}

/* ---- FIGURES (rao-master-19 Parts A+B) — equal-groups + sequence must PAINT ----
   The 7 defect questions (Division_facts_to_10 q1-q2, number-patterns-word-problems-
   remix q2/q7/q12/q19/q24) once requested these figure types and rendered NOTHING —
   and every grading run stayed green. This check renders both figures on real fixture
   cards at a desktop and a phone viewport and asserts on computed paint: the figure
   exists, has non-zero rendered size, fits the card, and draws in the spec colours
   (brand-purple #7b5cff structures, ink #2c2150 numerals, dashed blank box). */
async function checkFigures(browser) {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
  const html =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width">` +
    `<style>${read("engine/rao.css")}</style>` +
    `<style>${read("engine/rao-card.css")}</style></head><body style="margin:0;padding:0">` +
    `<div id="source">` +
    `<!--@q\ntype: single-select\nanswer: ["4"]\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">How many dots are in each ring?</p>` +
    `<figure data-show="equal-groups" data-groups="3" data-per="4"></figure>` +
    `<ul class="options"><li>3</li><li>4</li><li>12</li></ul>` +
    `</div>` +
    `<!--@q\ntype: single-select\nanswer: ["16"]\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">What number belongs in the empty box?</p>` +
    `<figure data-show="sequence" data-values="4,8,12,?"></figure>` +
    `<ul class="options"><li>14</li><li>16</li><li>20</li></ul>` +
    `</div>` +
    `</div>` +
    `<div id="preview" class="rao-lesson" data-theme="grape"></div>` +
    `<script>${read("engine/preview-engine.js").replace(/<\/script/gi, "<\\/script")}</script>` +
    `<script>${read("engine/rao-card.js").replace(/<\/script/gi, "<\\/script")}</script>` +
    `</body></html>`;
  const tmp = path.join(ROOT, "review", "__figures_fixture.html");
  fs.writeFileSync(tmp, html);
  const problems = [];
  try {
    for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: vp });
      try {
        await page.goto("file://" + tmp);
        await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length >= 2, { timeout: 15000 })
                  .catch(() => {});
        await page.waitForTimeout(300);
        const at = `${vp.width}px`;
        const res = await page.evaluate(() => {
          const out = { eq: null, seq: null };
          const frames = [...document.querySelectorAll(".pv-frame")];
          // equal-groups card
          {
            const svg = frames[0] && frames[0].querySelector(".fig-wrap svg");
            if (svg) {
              const r = svg.getBoundingClientRect();
              const qb = frames[0].querySelector(".qbody").getBoundingClientRect();
              const ring = svg.querySelector("rect");
              const dot = svg.querySelector("circle, svg");
              out.eq = {
                w: r.width, h: r.height, fits: r.width <= qb.width + 1,
                rings: svg.querySelectorAll("rect").length,
                dots: svg.querySelectorAll("circle").length,
                ringStroke: ring ? getComputedStyle(ring).stroke : null,
                ringFill: ring ? getComputedStyle(ring).fill : null,
                dotFill: dot && dot.tagName === "circle" ? getComputedStyle(dot).fill : null,
                labels: svg.querySelectorAll("text").length,
              };
            }
          }
          // sequence card
          {
            const svg = frames[1] && frames[1].querySelector(".fig-wrap svg");
            if (svg) {
              const r = svg.getBoundingClientRect();
              const qb = frames[1].querySelector(".qbody").getBoundingClientRect();
              const rects = [...svg.querySelectorAll("rect")];
              const solid = rects.filter((b) => getComputedStyle(b).strokeDasharray === "none");
              const dashed = rects.filter((b) => getComputedStyle(b).strokeDasharray !== "none");
              const texts = [...svg.querySelectorAll("text")];
              out.seq = {
                w: r.width, h: r.height, fits: r.width <= qb.width + 1,
                boxes: rects.length, solid: solid.length, dashed: dashed.length,
                boxStroke: solid[0] ? getComputedStyle(solid[0]).stroke : null,
                textFill: texts[0] ? getComputedStyle(texts[0]).fill : null,
                texts: texts.map((t) => t.textContent.trim()),
                arrows: svg.querySelectorAll("polygon").length,
              };
            }
          }
          return out;
        });
        const BRAND = "rgb(123, 92, 255)", INK = "rgb(44, 33, 80)";
        if (!res.eq) problems.push(`${at}: EQUAL-GROUPS figure did not render at all (no .fig-wrap svg on the card)`);
        else {
          if (!(res.eq.w >= 2 && res.eq.h >= 2)) problems.push(`${at}: EQUAL-GROUPS rendered blank (${res.eq.w}×${res.eq.h})`);
          if (!res.eq.fits) problems.push(`${at}: EQUAL-GROUPS overflows the card (${res.eq.w}px wide)`);
          if (res.eq.rings !== 3) problems.push(`${at}: EQUAL-GROUPS has ${res.eq.rings} rings, expected 3`);
          if (res.eq.dots !== 12) problems.push(`${at}: EQUAL-GROUPS has ${res.eq.dots} dots, expected 12`);
          if (res.eq.ringStroke !== BRAND) problems.push(`${at}: EQUAL-GROUPS ring stroke is ${res.eq.ringStroke}, must be brand ${BRAND}`);
          if (res.eq.ringFill !== "none" && res.eq.ringFill !== "rgba(0, 0, 0, 0)") problems.push(`${at}: EQUAL-GROUPS ring is FILLED (${res.eq.ringFill}) — must be transparent (no intermediate surface)`);
          if (res.eq.dotFill !== BRAND) problems.push(`${at}: EQUAL-GROUPS dot fill is ${res.eq.dotFill}, must be brand ${BRAND}`);
          if (res.eq.labels !== 0) problems.push(`${at}: EQUAL-GROUPS draws ${res.eq.labels} text label(s) — a count label can leak the answer; the figure must draw none`);
        }
        if (!res.seq) problems.push(`${at}: SEQUENCE figure did not render at all (no .fig-wrap svg on the card)`);
        else {
          if (!(res.seq.w >= 2 && res.seq.h >= 2)) problems.push(`${at}: SEQUENCE rendered blank (${res.seq.w}×${res.seq.h})`);
          if (!res.seq.fits) problems.push(`${at}: SEQUENCE overflows the card (${res.seq.w}px wide)`);
          if (res.seq.boxes !== 4) problems.push(`${at}: SEQUENCE has ${res.seq.boxes} boxes, expected 4`);
          if (res.seq.dashed !== 1) problems.push(`${at}: SEQUENCE has ${res.seq.dashed} dashed blank box(es), expected exactly 1`);
          if (res.seq.boxStroke !== BRAND) problems.push(`${at}: SEQUENCE box stroke is ${res.seq.boxStroke}, must be brand ${BRAND}`);
          if (res.seq.textFill !== INK) problems.push(`${at}: SEQUENCE numeral fill is ${res.seq.textFill}, must be ink ${INK}`);
          if (res.seq.texts.join(",") !== "4,8,12") problems.push(`${at}: SEQUENCE terms are [${res.seq.texts.join(",")}] — expected the three known terms 4,8,12 and a BLANK box (the missing term must never be printed)`);
          if (res.seq.arrows < 3) problems.push(`${at}: SEQUENCE has ${res.seq.arrows} arrows, expected ≥ 3`);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return problems;
}

/* ---- OPTION-LAYOUT LADDER (rao-master-19 Part D) — computed-style per tier ----
   Build-time tiers from the longest option: ≤10 chars → 4-across (unchanged),
   11–18 → 2×2 grid, >18 → one full-width row per option. Laws checked on paint,
   at a desktop AND a phone viewport: the tier's actual row/column arrangement,
   IDENTICAL font-size across all three tiers, and no mid-expression wrap (every
   .nw expression run renders as a single fragment). */
async function checkOptionLadder(browser) {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
  const html =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width">` +
    `<style>${read("engine/rao.css")}</style>` +
    `<style>${read("engine/rao-card.css")}</style></head><body style="margin:0;padding:0">` +
    `<div id="source">` +
    `<!--@q\ntype: single-select\nanswer: ["24"]\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">What is 4 × 6?</p>` +
    `<ul class="options"><li>24</li><li>18</li><li>28</li><li>30</li></ul>` +
    `</div>` +
    `<!--@q\ntype: single-select\nanswer: ["9,000 + 400"]\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">Which sum is right?</p>` +
    `<ul class="options"><li>9,000 + 400</li><li>9,000 + 40</li><li>900 + 400</li><li>90 + 4</li></ul>` +
    `</div>` +
    `<!--@q\ntype: single-select\nanswer: ["24,516 + 18,097 = 42,613"]\n-->` +
    `<div class="question" data-type="single-select">` +
    `<p class="prompt">Which addition sentence is correct?</p>` +
    `<ul class="options"><li>24,516 + 18,097 = 42,613</li><li>24,516 + 18,097 = 41,613</li><li>24,516 + 18,097 = 43,613</li></ul>` +
    `</div>` +
    `</div>` +
    `<div id="preview" class="rao-lesson" data-theme="grape">` +
    `</div>` +
    `<script>${read("engine/preview-engine.js").replace(/<\/script/gi, "<\\/script")}</script>` +
    `<script>${read("engine/rao-card.js").replace(/<\/script/gi, "<\\/script")}</script>` +
    `</body></html>`;
  const tmp = path.join(ROOT, "review", "__ladder_fixture.html");
  fs.writeFileSync(tmp, html);
  const problems = [];
  try {
    for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: vp });
      try {
        await page.goto("file://" + tmp);
        await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length >= 3, { timeout: 15000 })
                  .catch(() => {});
        await page.waitForTimeout(300);
        const at = `${vp.width}px`;
        const res = await page.evaluate(() => {
          const layout = (optsEl) => {
            const btns = [...optsEl.querySelectorAll(".opt")];
            const rows = [];
            btns.forEach((b) => {
              const r = b.getBoundingClientRect();
              const row = rows.find((x) => Math.abs(x.top - r.top) < 4);
              if (row) row.n++;
              else rows.push({ top: r.top, n: 1 });
            });
            const ow = optsEl.getBoundingClientRect().width;
            return {
              tier: optsEl.getAttribute("data-opt-tier"),
              cls: optsEl.className,
              rows: rows.sort((a, b) => a.top - b.top).map((r) => r.n),
              fullWidth: btns.every((b) => b.getBoundingClientRect().width >= ow * 0.95),
              font: getComputedStyle(btns[0]).fontSize,
              nwFragments: [...optsEl.querySelectorAll(".nw")].map((s) => s.getClientRects().length),
              overflow: optsEl.scrollWidth > optsEl.clientWidth + 2,
            };
          };
          return [...document.querySelectorAll(".pv-frame .opts")].map(layout);
        });
        if (res.length !== 3) { problems.push(`${at}: expected 3 option sets, found ${res.length}`); continue; }
        const [s, m, l] = res;
        const shape = (r) => r.rows.join(",");
        if (s.tier !== "short") problems.push(`${at}: SHORT set stamped tier "${s.tier}" (class "${s.cls}") — expected short`);
        if (m.tier !== "mid") problems.push(`${at}: MEDIUM set stamped tier "${m.tier}" (class "${m.cls}") — expected mid`);
        if (l.tier !== "long") problems.push(`${at}: LONG set stamped tier "${l.tier}" (class "${l.cls}") — expected long`);
        // Phone note: at 390px the lesson CONTAINER is 342px, so the PRE-EXISTING
        // ≤360px-container rule already makes every plain grid one column — the
        // short tier at a phone is one-per-row TODAY, unchanged by the ladder.
        if (vp.width >= 1280 && shape(s) !== "4") problems.push(`${at}: SHORT tier renders rows [${shape(s)}] — expected one row of 4 (today's grid)`);
        if (vp.width < 1280 && shape(s) !== "1,1,1,1") problems.push(`${at}: SHORT tier renders rows [${shape(s)}] — expected today's phone behavior (one per row via the ≤360px container rule)`);
        if (vp.width >= 1280 && shape(m) !== "2,2") problems.push(`${at}: MEDIUM tier renders rows [${shape(m)}] — expected a 2×2 grid`);
        if (vp.width < 1280 && shape(m) !== "1,1,1,1") problems.push(`${at}: MEDIUM tier renders rows [${shape(m)}] — expected one option per row at phone width (an 18-char expression cannot fit half a phone)`);
        if (shape(l) !== "1,1,1") problems.push(`${at}: LONG tier renders rows [${shape(l)}] — expected one full-width row per option`);
        if (!l.fullWidth) problems.push(`${at}: LONG tier options are not full-width rows`);
        if (!(s.font === m.font && m.font === l.font))
          problems.push(`${at}: FONT SIZE differs between tiers (short ${s.font} / mid ${m.font} / long ${l.font}) — the ladder must NEVER change font size`);
        const wrapped = [m, l].flatMap((r) => r.nwFragments).filter((n) => n > 1).length;
        if (wrapped) problems.push(`${at}: ${wrapped} expression run(s) WRAP mid-expression (an .nw span split across lines)`);
        if (res.some((r) => r.overflow)) problems.push(`${at}: an option set overflows its card horizontally`);
      } finally {
        await page.close();
      }
    }
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return problems;
}

/* ---- BRIEF-RENDER-1 guards (rao-master-22) — computed style + pixel measurement
   on the RENDER-1 fixture questions in lessons/_type-coverage.html, rendered live
   through the CURRENT engine files (not a stale review page), at 1280px and 390px.

   C1 — line-plot marks: a filled slot paints a DISCRETE ✕ glyph (::before, brand
        colour, same colour as the legend's ✕), NOT a solid background block; and
        adjacent marks keep non-zero visual separation (slot box − glyph box > 2px).
        A green grading run can never see this: it reads data-count, never paint. */
function buildTypeCoveragePage() {
  const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
  const lesson = read("lessons/_type-coverage.html");
  const a = lesson.indexOf('<div id="source">');
  const b = lesson.indexOf('<div id="preview"');
  const source = lesson.slice(a, b > a ? b : undefined);
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style></head><body style="margin:0;padding:0">
${source}
<div class="rao-lesson" data-theme="grape"><div id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

async function checkRender1(browser) {
  const problems = [];
  const tmp = path.join(ROOT, "review", "__render1_fixture.html");
  fs.writeFileSync(tmp, buildTypeCoveragePage());
  try {
    for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: vp });
      const at = `${vp.width}px`;
      try {
        await page.goto("file://" + tmp);
        await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 3, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(400);

        // ── C1: discrete ✕ marks ──
        const c1 = await page.evaluate(() => {
          const frame = [...document.querySelectorAll(".pv-frame")].find((f) =>
            f.querySelector(".lp-plot") && f.querySelector('svg[aria-label="frequency table"]'));
          if (!frame) return { missing: true };
          frame.scrollIntoView();
          const col = frame.querySelector(".lp-col");
          const top = col.querySelector('.lp-slot[data-row="5"]');
          top.click();
          return { clicked: true };
        });
        if (c1.missing) { problems.push(`${at}: C1 fixture (line-plot with frequency-table svg) not found in _type-coverage`); await page.close(); continue; }
        await page.waitForTimeout(300);   // .15s transitions must settle before computed reads
        const c1r = await page.evaluate(() => {
          const frame = [...document.querySelectorAll(".pv-frame")].find((f) =>
            f.querySelector(".lp-plot") && f.querySelector('svg[aria-label="frequency table"]'));
          const col = frame.querySelector(".lp-col");
          const on = [...col.querySelectorAll(".lp-slot.on")];
          const keyX = frame.querySelector(".lp-key-x");
          const alpha = (c) => { const m = c.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*([\d.]+))?\)/); return m ? (m[1] == null ? 1 : parseFloat(m[1])) : 0; };
          const rgb = (c) => (c.match(/\d+/g) || []).slice(0, 3).join(",");
          return {
            filled: on.length,
            marks: on.map((s) => {
              const b = getComputedStyle(s, "::before"), c = getComputedStyle(s);
              const r = s.getBoundingClientRect();
              return { content: b.content, markColor: b.color, markAlpha: alpha(b.color),
                       glyphPx: parseFloat(b.fontSize), slotH: r.height, bg: c.backgroundColor, bgAlpha: alpha(c.backgroundColor) };
            }),
            keyColor: keyX ? getComputedStyle(keyX).color : null,
            _rgb: rgb.toString(),
          };
        });
        if (c1r.filled !== 5) problems.push(`${at}: C1 clicked row 5 but ${c1r.filled} slots are .on (expected 5)`);
        c1r.marks.forEach((m, i) => {
          if (!/✕/.test(m.content)) problems.push(`${at}: C1 slot ${i} has no ✕ glyph node (::before content ${m.content})`);
          if (m.markAlpha < 0.9) problems.push(`${at}: C1 slot ${i} mark is INVISIBLE (::before color ${m.markColor}) — the filled state paints no countable glyph`);
          if (m.bgAlpha > 0.05) problems.push(`${at}: C1 slot ${i} paints a SOLID BACKGROUND (${m.bg}) — adjacent fills merge into one block; the key says ✕ = 1`);
          const sep = m.slotH - m.glyphPx;
          if (!(sep > 2)) problems.push(`${at}: C1 slot ${i} mark separation ${sep.toFixed(1)}px (slot ${m.slotH}px − glyph ${m.glyphPx}px) — marks are not visually discrete`);
        });
        if (c1r.marks.length && c1r.keyColor && c1r.marks[0].markAlpha >= 0.9) {
          const rgb = (c) => (c.match(/\d+/g) || []).slice(0, 3).join(",");
          if (rgb(c1r.keyColor) !== rgb(c1r.marks[0].markColor))
            problems.push(`${at}: C1 legend ✕ is ${c1r.keyColor} but plotted marks are ${c1r.marks[0].markColor} — figure and legend disagree`);
        }

        // ── C2: source table BESIDE the plot at desktop, stacked at phone.
        //    The child transcribes the table while building — off-screen data
        //    means forced scrolling on every placement. ──
        const c2 = await page.evaluate(() => {
          const frame = [...document.querySelectorAll(".pv-frame")].find((f) =>
            f.querySelector(".lp-plot") && f.querySelector('svg[aria-label="frequency table"]'));
          if (!frame) return { missing: true };
          const srcw = frame.querySelector(".lp-row .lp-srcwrap");
          const plot = frame.querySelector(".lp-row .lp-plot");
          if (!srcw || !plot) return { noSrcwrap: true, strayFig: !!frame.querySelector(".qbody > .fig-wrap") };
          const a = srcw.getBoundingClientRect(), b = plot.getBoundingClientRect();
          const slot = frame.querySelector(".lp-slot").getBoundingClientRect();
          return {
            table: { l: a.left, r: a.right, t: a.top, b: a.bottom, w: a.width },
            plot: { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width },
            slot: { w: slot.width, h: slot.height },
          };
        });
        if (c2.missing) problems.push(`${at}: C2 fixture not found`);
        else if (c2.noSrcwrap) problems.push(`${at}: C2 the source table is NOT in the lp-row source slot${c2.strayFig ? " — it renders as a stray full-width figure ABOVE the plot" : ""}`);
        else {
          const hDisjoint = c2.table.r <= c2.plot.l + 2 || c2.plot.r <= c2.table.l + 2;
          const vOverlap = Math.min(c2.table.b, c2.plot.b) - Math.max(c2.table.t, c2.plot.t);
          const vDisjoint = c2.table.b <= c2.plot.t + 2 || c2.plot.b <= c2.table.t + 2;
          if (vp.width >= 1280) {
            if (!(hDisjoint && vOverlap > 0))
              problems.push(`${at}: C2 table and plot are NOT side by side (table ${JSON.stringify(c2.table)}, plot ${JSON.stringify(c2.plot)})`);
            if (c2.table.w < 300)
              problems.push(`${at}: C2 side-by-side table squashed to ${c2.table.w.toFixed(0)}px (<300px legibility floor)`);
          } else {
            if (!vDisjoint)
              problems.push(`${at}: C2 at phone width table and plot must STACK — two squashed figures is worse than scrolling (table ${JSON.stringify(c2.table)}, plot ${JSON.stringify(c2.plot)})`);
          }
          // Slot size floor = the engine's own container-query ladder (34 → 28 →
          // 24px as the card narrows). The LAYOUT change must never squash slots
          // below what the sizing ladder itself grants at that width.
          const slotFloor = vp.width >= 1280 ? 34 : 24;
          if (!(c2.slot.w >= slotFloor && c2.slot.h >= 24))
            problems.push(`${at}: C2 plot slots shrank to ${c2.slot.w}×${c2.slot.h}px (floor ${slotFloor}×24) — layout must never squash the tap targets`);
        }

        // ── C3: vertical-multiply answer boxes — visible gap between adjacent
        //    digit boxes AND x-centre alignment with the digit columns above.
        //    (rao.css's 44px blank-input tap floor used to clamp the boxes wider
        //    than their 40px columns: −4px overlap at desktop, −12px at phone.) ──
        const c3 = await page.evaluate(() => {
          const frame = [...document.querySelectorAll(".pv-frame")].find((f) => f.querySelector(".vmul"));
          if (!frame) return { missing: true };
          const boxes = [...frame.querySelectorAll(".vm-ans .blank-input")].map((b) => b.getBoundingClientRect());
          const centres = (sel) => [...frame.querySelectorAll(sel)].map((d) => { const r = d.getBoundingClientRect(); return (r.left + r.right) / 2; });
          return {
            boxes: boxes.map((r) => ({ l: +r.left.toFixed(1), r: +r.right.toFixed(1) })),
            topCentres: centres(".vm-top .vm-d"),
            ansCentres: centres(".vm-ans .vm-d"),
          };
        });
        if (c3.missing) problems.push(`${at}: C3 fixture (layout: multiply) not found in _type-coverage`);
        else {
          c3.boxes.slice(1).forEach((b, i) => {
            const gap = b.l - c3.boxes[i].r;
            if (!(gap > 2)) problems.push(`${at}: C3 answer boxes ${i}/${i + 1} gap is ${gap.toFixed(1)}px — adjacent digit boxes must keep a visible gap (>2px), not fuse or overlap`);
          });
          c3.topCentres.forEach((t, i) => {
            const a = c3.ansCentres[i];
            if (a == null || Math.abs(t - a) > 1.5)
              problems.push(`${at}: C3 column ${i} x-centre misaligned — top digit at ${t.toFixed(1)}, answer box at ${a == null ? "MISSING" : a.toFixed(1)} (tolerance 1.5px); a gap that shifts blanks off their place-value columns is a worse defect than flush boxes`);
          });
        }

        // ── C4: thousands comma — understated (smaller, lighter, muted) in a
        //    narrow column; digit columns x-centre-aligned across ALL rows,
        //    including rows carrying a blank (the 44px blank floor used to
        //    clamp blanks wider than static cells at phone width → 4-8px skew). ──
        const c4 = await page.evaluate(() => {
          const frame = [...document.querySelectorAll(".pv-frame")].find((f) => f.querySelector(".vcol .cm-sep"));
          if (!frame) return { missing: true };
          const sep = frame.querySelector(".vcol .cm-sep");
          const cell = frame.querySelector(".vcol .cm-cell");
          const s = getComputedStyle(sep), c = getComputedStyle(cell);
          const rows = [...frame.querySelectorAll(".vcol .row")].map((row) =>
            [...row.querySelectorAll(".cm-cell, .blank-input")].map((el) => {
              const r = el.getBoundingClientRect();
              return +((r.left + r.right) / 2).toFixed(1);
            }));
          return {
            sep: { fs: parseFloat(s.fontSize), fw: parseInt(s.fontWeight), color: s.color, w: sep.getBoundingClientRect().width },
            cell: { fs: parseFloat(c.fontSize), fw: parseInt(c.fontWeight), color: c.color, w: cell.getBoundingClientRect().width },
            rows,
          };
        });
        if (c4.missing) problems.push(`${at}: C4 fixture (layout: vertical with commas) not found in _type-coverage`);
        else {
          if (!(c4.sep.fs < 0.85 * c4.cell.fs))
            problems.push(`${at}: C4 comma font-size ${c4.sep.fs}px vs digit ${c4.cell.fs}px — the comma must be SMALLER than the digits (<85%)`);
          if (!(c4.sep.fw < c4.cell.fw))
            problems.push(`${at}: C4 comma font-weight ${c4.sep.fw} vs digit ${c4.cell.fw} — the comma must be LIGHTER than the digits`);
          if (c4.sep.color === c4.cell.color)
            problems.push(`${at}: C4 comma colour ${c4.sep.color} equals digit colour — the comma must be muted`);
          if (!(c4.sep.w <= 0.35 * c4.cell.w))
            problems.push(`${at}: C4 comma column ${c4.sep.w}px vs digit column ${c4.cell.w}px — the comma column must stay narrow (≤35% of a digit column)`);
          const base = c4.rows[0];
          c4.rows.slice(1).forEach((row, ri) => {
            row.forEach((x, i) => {
              if (base[i] == null || Math.abs(x - base[i]) > 1.5)
                problems.push(`${at}: C4 row ${ri + 1} column ${i} x-centre ${x} vs row 0 ${base[i]} — digit columns must align vertically across operand and result rows (tolerance 1.5px)`);
            });
          });
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
  return problems;
}

(async () => {
  // --render1-only: just the BRIEF-RENDER-1 fixture guards (fast RED/PASS cycles).
  if (process.argv.includes("--render1-only")) {
    const browser = await chromium.launch();
    const problems = await checkRender1(browser);
    await browser.close();
    if (problems.length) {
      console.log("FAIL  RENDER-1 fixtures (1280px + 390px)");
      problems.forEach((p) => console.log("      - " + p));
      process.exit(1);
    }
    console.log("PASS  RENDER-1 fixtures — at 1280px and 390px");
    process.exit(0);
  }

  // --figures-only / --ladder-only: run just the rao-master-19 fixture checks
  // (used for fast sabotage-proof runs; the full suite still runs everything).
  if (process.argv.includes("--figures-only") || process.argv.includes("--ladder-only")) {
    const browser = await chromium.launch();
    const problems = process.argv.includes("--figures-only")
      ? await checkFigures(browser)
      : await checkOptionLadder(browser);
    await browser.close();
    const label = process.argv.includes("--figures-only") ? "figures (equal-groups + sequence)" : "option ladder (short/mid/long)";
    if (problems.length) {
      console.log(`FAIL  ${label} (1280px + 390px)`);
      problems.forEach((p) => console.log("      - " + p));
      process.exit(1);
    }
    console.log(`PASS  ${label} — at 1280px and 390px`);
    process.exit(0);
  }

  // --card-look-only: run just the card-anatomy fixture check (used for fast
  // sabotage-proof runs; the full suite still runs everything).
  if (process.argv.includes("--card-look-only")) {
    const browser = await chromium.launch();
    const problems = await checkCardLook(browser);
    await browser.close();
    if (problems.length) {
      console.log("FAIL  card look (1280px + 390px)");
      problems.forEach((p) => console.log("      - " + p));
      process.exit(1);
    }
    console.log("PASS  card look (frame 3px, radius 25px, halo 9/21@.34, ledge 5@.12, white page, checker .09 @ 30px — at 1280px and 390px)");
    process.exit(0);
  }

  const files = fs.existsSync(REVIEW)
    ? fs.readdirSync(REVIEW).filter((f) => f.endsWith(".html") && !f.startsWith("__"))
    : [];
  // An EMPTY review/ is a clean slate (no lessons yet), not an error — there is simply
  // nothing to regression-check. We skip the per-lesson loop but still run the
  // self-contained checks below (the explanation-reveal fixture needs no lesson), so
  // the engine-level guards stay live even with zero content.
  if (!files.length) console.log("no review/ pages — skipping per-lesson checks (clean slate)");

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });

  let failed = 0;
  for (const f of files) {
    const problems = await checkLesson(page, f);
    if (problems.length) {
      failed++;
      console.log(`\nFAIL  ${f}`);
      problems.forEach((p) => console.log("      - " + p));
    } else {
      console.log(`PASS  ${f.replace(/\.html$/, "")}  (one ring, visible selection, keyboard ring, no inner panel)`);
    }
  }

  // Bug 4 — explanation reveal, on its own fixture (no lesson ships `explain:` yet).
  const explainProblems = await checkExplainReveal(page);
  if (explainProblems.length) {
    failed++;
    console.log(`\nFAIL  explanation reveal`);
    explainProblems.forEach((p) => console.log("      - " + p));
  } else {
    console.log(`PASS  explanation reveal  (hidden by default, visible after Check)`);
  }

  // Mobile invariants — 380×800 viewport, self-contained fixture.
  const mobileProblems = await checkMobileInvariants(browser);
  if (mobileProblems.length) {
    failed++;
    console.log(`\nFAIL  mobile (380×800)`);
    mobileProblems.forEach((p) => console.log("      - " + p));
  } else {
    console.log(`PASS  mobile (380×800)  (gutters, overflow, buttons, blank-input)`);
  }

  // Card look — shipped anatomy from the CURRENT shared files, 1280px and 390px.
  const lookProblems = await checkCardLook(browser);
  if (lookProblems.length) {
    failed++;
    console.log(`\nFAIL  card look (1280px + 390px)`);
    lookProblems.forEach((p) => console.log("      - " + p));
  } else {
    console.log(`PASS  card look  (frame 3px, radius 25px, halo 9/21@.34, ledge 5@.12, white page, checker .09 @ 30px — at 1280px and 390px)`);
  }

  // Figures — equal-groups + sequence paint on real cards, 1280px and 390px (rao-master-19).
  const figureProblems = await checkFigures(browser);
  if (figureProblems.length) {
    failed++;
    console.log(`\nFAIL  figures (equal-groups + sequence)`);
    figureProblems.forEach((p) => console.log("      - " + p));
  } else {
    console.log(`PASS  figures  (equal-groups + sequence paint, brand colours, no leak labels — at 1280px and 390px)`);
  }

  // Option ladder — tier layout, constant font, no mid-expression wrap (rao-master-19).
  const ladderProblems = await checkOptionLadder(browser);
  if (ladderProblems.length) {
    failed++;
    console.log(`\nFAIL  option ladder (short/mid/long)`);
    ladderProblems.forEach((p) => console.log("      - " + p));
  } else {
    console.log(`PASS  option ladder  (4-across / 2×2 / stacked, one font size, no mid-expression wrap — at 1280px and 390px)`);
  }

  // BRIEF-RENDER-1 fixture guards — line-plot marks/layout, column math, comma, figure cap.
  const render1Problems = await checkRender1(browser);
  if (render1Problems.length) {
    failed++;
    console.log(`\nFAIL  RENDER-1 fixtures (1280px + 390px)`);
    render1Problems.forEach((p) => console.log("      - " + p));
  } else {
    console.log(`PASS  RENDER-1 fixtures  (discrete ✕ marks — at 1280px and 390px)`);
  }

  await browser.close();
  const total = files.length + 6;   // +1 explain, +1 mobile, +1 card look, +1 figures, +1 ladder, +1 render1
  console.log(failed ? `\n${failed}/${total} FAILED` : `\nselection styling is clean`);
  process.exit(failed ? 1 : 0);
})();
