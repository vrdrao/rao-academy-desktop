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

  // ---- QBODY WORK-PANEL — the soft background behind the question must PAINT ---
  // The panel stops a small figure/equation floating in a sea of white. It is
  // theme-tinted (derived from --brand), so a grading run never sees it and a mere
  // structural check cannot tell a painted panel from a transparent one. Assert on
  // computed style: the .qbody must have a non-transparent, rounded background, AND
  // it must RE-TINT when the theme changes — a dead grey would satisfy a plain
  // "non-transparent" check but is not what we ship. Runs before the .opt lookup so
  // figure-only lessons (which have no options) are covered too.
  const panel = await page.evaluate(() => {
    const q = document.querySelector(".pv-frame .qbody");
    if (!q) return null;
    const wrap = q.closest(".rao-lesson") || document.querySelector(".rao-lesson");
    const alpha = (rgb) => {
      const m = /rgba?\(([^)]+)\)/.exec(rgb || "");
      if (!m) return 0;
      const p = m[1].split(",").map((s) => s.trim());
      return p.length >= 4 ? parseFloat(p[3]) : 1; // rgb() with no alpha is opaque
    };
    const read = () => {
      const c = getComputedStyle(q);
      return { bg: c.backgroundColor, radius: parseFloat(c.borderTopLeftRadius) || 0 };
    };
    const prev = wrap ? wrap.getAttribute("data-theme") : null;
    const base = read();
    let other = null;
    if (wrap) {
      // grape and mint have different --brand, so a brand-derived tint must differ
      wrap.setAttribute("data-theme", prev === "mint" ? "sunshine" : "mint");
      other = read();
      wrap.setAttribute("data-theme", prev || "grape");
    }
    return { bg: base.bg, radius: base.radius, alpha: alpha(base.bg), otherBg: other && other.bg };
  });
  if (panel) {
    if (!(panel.alpha > 0))
      problems.push(
        `the .qbody work-panel has NO visible background (computed ${panel.bg}) — ` +
        `the soft panel behind the question is not painting`);
    if (!(panel.radius > 0))
      problems.push(
        `the .qbody work-panel is not rounded (border-radius ${panel.radius}px) — ` +
        `it should read as a defined work area, not a full-bleed flood`);
    if (panel.otherBg && panel.otherBg === panel.bg)
      problems.push(
        `the .qbody work-panel does NOT re-tint with the theme (two themes both ` +
        `compute ${panel.bg}) — it is a dead colour, not a --brand-derived tint`);
  }

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

(async () => {
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
      console.log(`PASS  ${f.replace(/\.html$/, "")}  (one ring, visible selection, keyboard ring, panel painted)`);
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

  await browser.close();
  const total = files.length + 2;   // +1 explain, +1 mobile
  console.log(failed ? `\n${failed}/${total} FAILED` : `\nselection styling is clean`);
  process.exit(failed ? 1 : 0);
})();
