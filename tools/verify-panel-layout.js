/* ============================================================================
   verify-panel-layout.js  —  GUARD for SOLUTION-PANEL-LAYOUT-CONTRACT v1
   (Item 81). Asserts, by computed style + rendered geometry in a real browser
   at the three fixed panel widths 294 / 642 / 758:

     A   a SEQUENCE with short items columnises — 4 cols at 758 with ~66px items
     B   column order is ACROSS (row1-col2 = item 2, not item 5)  [catches column-count]
     C   `column-count`/`columns` is NOT the mechanism (computed column-count == auto)
     D   a SEQUENCE whose LONGEST SINGLE ITEM exceeds the width stays at 1 column
         (synthetic: one item wider than the panel — NOT sol-working)
     D2  sol-working IS BLOCK AND NEVER ITEMISED (Ruling R6). It carries no
         sequence marker, is never split on ", ", renders as ONE element at 294 /
         642 / 758 (proven with the real prose corpus string
         "1 kL is 1,000 L, and 842 falls short of 1,000."), and if it exceeds the
         panel it gets a horizontal scroll rail with the panel width unchanged.
         THIS PREVENTS THE GREEN-HARNESS TRAP: a ", " split satisfies a list fixture
         while shattering ~164 prose workings. D2 fails against any split.
     E   a sequence breaks BETWEEN items, never within one (item height == 1 line);
         applied to the TABLE and FACTS sequences and the synthetic fixture — NOT
         to sol-working, which is BLOCK per R6.
     F   an item wider than the panel gets its OWN scroll rail; panel width unchanged
     G   a BLOCK never columnises at any width (full panel width at 294/642/758)
     H   an UNDECLARED shape is treated as BLOCK, not SEQUENCE (fail-safe)
     I   panel width is still 294 / 642 / 758 — nothing widened

   RULINGS SETTLED: R5 (an item is the smallest self-meaning unit) is NARROWED by
   R6 (sol-working is BLOCK in v1 because item boundaries cannot be found from
   content — 164/274 comma workings are prose a split would shatter). R7 (table-2
   does not columnise internally). R8 (sol-step cards are BLOCK).

   USAGE
     node tools/verify-panel-layout.js            # assert against the engine
     node tools/verify-panel-layout.js --sabotage # prove each assertion discriminates

   The plain run calls the real RaoSolution.layoutSequences (the Phase-3 mechanism).
   Before Phase 3 that function is absent, so the plain run FAILS (A,B,D2,E,F) —
   the point of a guard-first check. After Phase 3 it passes. The --sabotage proof
   uses a self-contained stand-in implementation so it discriminates independently.
   ========================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const rb = (p) => fs.readFileSync(path.join(ROOT, p));

const engine      = rd("engine/preview-engine.js");
const solRenderer = rd("engine/solution-renderer.js");
const raoCss      = rd("engine/rao.css");
const raoCardCss  = rd("engine/rao-card.css");
let fontsCss = rd("engine/fonts.css")
  .replace(/url\(fonts\/([^)]+)\)/g, (m, f) =>
    `url(data:font/woff2;base64,${rb("engine/fonts/" + f).toString("base64")}) format('woff2')`)
  .replace(/format\('woff2'\) format\('woff2'\)/g, "format('woff2')");

const FILES = {
  g3:    "lessons-g3/multiplication_facts_up_to_10.html",
  prose: "lessons/compare_convert_metric_volume.html",
};
const PICK = {
  table1: (q) => q.solution && q.solution.some((b) => b.type === "table" &&
            Array.isArray(b.tables) && b.tables.length === 1 &&
            b.tables[0].factor === 8 && b.tables[0].upTo === 8 && !b.tables.some((t) => t.absent)),
  facts: (q) => q.solution && q.solution.some((b) => b.type === "facts" &&
            Array.isArray(b.items) && b.items.length === 4 && b.items[0][0] === 6 && b.items[0][1] === 4),
  rule: (q) => q.solution && q.solution.some((b) => b.type === "rule" && /zero/i.test(b.text || "")),
  // the prose-working fixture: a step whose working is a SENTENCE, not a list
  prose: (q) => q.solution && q.solution.some((b) => b.type === "step" &&
            /842 falls short of 1,000/.test(b.working || "")),
};
const PROSE_WORKING = "1 kL is 1,000 L, and 842 falls short of 1,000.";

const pageHtml = `<!doctype html><html><head><meta charset="utf-8">
<style>${fontsCss}</style><style>${raoCss}</style><style>${raoCardCss}</style></head>
<body><div class="rao-lesson" data-theme="grape"><div id="mount"></div></div>
<script>${engine}</script><script>${solRenderer}</script></body></html>`;

async function measure(page, source, pickSrc, variant, inject, context) {
  return page.evaluate(async ({ source, pickSrc, variant, inject, context }) => {
    const GUTTER = 24;
    const qs = RaoPreview.build(source);
    const picker = eval("(" + pickSrc + ")");
    let q = null; for (const x of qs) if (picker(x)) { q = x; break; }
    if (!q) return { error: "fixture not found (" + qs.length + " qs)" };

    const mount = document.getElementById("mount");
    mount.innerHTML =
      '<div class="pv-frame"><div class="pv-card">' +
        '<div class="pv-head"><span class="pv-tlabel">Problem</span><span class="pv-ring"><i>3/24</i></span></div>' +
        q.markup +
        '<div class="pv-foot"><span class="pv-fb good"><span class="pv-fb-ic">\u{1F389}</span>Correct!</span></div>' +
        '<div class="sol-holder is-checked" data-mode="adaptive"></div>' +
        '<div class="cc-actions"><button class="cc-btn-solid" type="button">Next question →</button></div>' +
      "</div></div>";
    const frame = mount.firstChild;
    const qbody = frame.querySelector(".qbody");
    if (RaoPreview.attach) RaoPreview.attach(qbody, q.behavior);
    qbody.setAttribute("data-mode", "adaptive");
    qbody.classList.add("is-checked", "cc-hastake");
    const holder = frame.querySelector(".sol-holder");
    // the content to place: the real solution, OR a synthetic sequence for D/F/H
    let contentHtml;
    if (inject === "undeclared") {  // NO sol-seq marker -> must stay BLOCK (H)
      let s = '<div class="sol-undeclared">';
      for (let i = 1; i <= 8; i++) s += '<div class="sol-udi" style="white-space:nowrap">u × ' + i + " = " + i + "</div>";
      contentHtml = s + "</div>";
    } else if (inject === "synth-wide") {  // a declared sequence with one item far wider than any panel (D, F)
      const wide = "0123456789 ".repeat(12).trim();
      contentHtml = '<div class="sol-seq sol-synth-seq"><div class="sol-synthitem">a = 1</div>' +
        '<div class="sol-synthitem">a = 2</div><div class="sol-synthitem">a = 3</div>' +
        '<div class="sol-synthitem sol-synthwide">' + wide + "</div></div>";
    } else {
      contentHtml = RaoSolution.renderSolution({ explain: q.explain, solution: q.solution });
    }

    if (context === "bubble") {
      // THE FAITHFUL WALKTHROUGH SURFACE — the SAME chat primitives wireWalkthrough uses
      // (RaoSolution.bubbles): the content fills into a shrink-to-content .cc-bub. This is
      // the surface the review page actually shows; the Phase-4 failure lived here and the
      // full-width .sol-holder context could not see it.
      const chat = RaoSolution.bubbles.wrap(null);
      holder.appendChild(chat);
      await new Promise((res) => RaoSolution.bubbles.msg(chat, "step", contentHtml, res));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    } else {
      holder.innerHTML = contentHtml;   // full-width .sol-holder context
    }

    // ── layout mechanism ──
    const SEQ_SEL = ".sol-table, .sol-facts, .sol-synth-seq";
    const availPanel = holder.clientWidth;
    function maxContentW(el) {
      const c = el.cloneNode(true);
      c.style.cssText += ";white-space:nowrap;width:max-content;max-width:none;position:absolute;left:-99999px;top:0;display:inline-block";
      el.parentNode.appendChild(c); const w = c.getBoundingClientRect().width; c.remove(); return w;
    }
    function colsFor(container) {
      let longest = 0; for (const it of container.children) longest = Math.max(longest, maxContentW(it));
      return Math.max(1, Math.min(4, Math.floor(availPanel / (longest + GUTTER))));
    }
    function styleItems(container, allowMidBreak) {
      for (const it of container.children) {
        it.style.minWidth = "0"; it.style.maxWidth = availPanel + "px";
        if (allowMidBreak) { it.style.whiteSpace = "normal"; it.style.wordBreak = "break-all"; it.style.overflowX = "visible"; }
        else { it.style.whiteSpace = "nowrap"; it.style.overflowX = "auto"; }
      }
    }
    function gridify(container, mode, allowMidBreak) {
      const cols = colsFor(container);
      styleItems(container, allowMidBreak);
      container.style.width = availPanel + "px"; container.style.justifyContent = "start"; container.style.gap = GUTTER + "px";
      if (mode === "across") { container.style.display = "grid"; container.style.gridAutoFlow = "row";
        container.style.gridTemplateColumns = "repeat(" + cols + ", minmax(0, max-content))"; container.style.columnCount = ""; }
      else if (mode === "down") { container.style.display = "grid"; container.style.gridAutoFlow = "column";
        container.style.gridTemplateRows = "repeat(" + Math.ceil(container.children.length / cols) + ", max-content)";
        container.style.gridTemplateColumns = ""; container.style.columnCount = ""; }
      else if (mode === "column-count") { container.style.display = "block"; container.style.columnCount = String(cols); container.style.columnGap = GUTTER + "px"; }
    }
    // sol-working is BLOCK (R6): one line + rail if too wide. No marker, no split.
    const styleWorkingBlock = () => document.querySelectorAll(".sol-working").forEach((w) => {
      w.style.whiteSpace = "nowrap"; w.style.overflowX = "auto"; w.style.maxWidth = "100%"; });
    const splitWorking = () => document.querySelectorAll(".sol-working").forEach((w) => {   // the REJECTED itemisation
      const parts = w.textContent.split(/,\s+/).map((s) => s.trim()).filter(Boolean);
      w.innerHTML = parts.map((p) => '<span class="sol-witem">' + p + "</span>").join(""); });
    const SEQ_FACTS = ".sol-table, .sol-facts";
    function applyCorrect() {
      document.querySelectorAll(SEQ_SEL).forEach((c) => { c.classList.add("sol-seq"); gridify(c, "across", false); });
      styleWorkingBlock();
    }
    if (variant === "none") {
      // the REAL Phase-3 mechanism (absent before Phase 3 -> plain run fails, as required)
      if (window.RaoSolution && typeof window.RaoSolution.layoutSequences === "function")
        window.RaoSolution.layoutSequences(holder);
    }
    else if (variant === "correct") applyCorrect();
    else if (variant === "fill-down")      { applyCorrect(); document.querySelectorAll(SEQ_FACTS).forEach((c) => gridify(c, "down", false)); }              // B
    else if (variant === "column-count")   { applyCorrect(); document.querySelectorAll(SEQ_FACTS).forEach((c) => gridify(c, "column-count", false)); }      // B,C
    else if (variant === "mid-break")      { applyCorrect(); document.querySelectorAll(".sol-synthitem").forEach((it) => {                                   // E
        it.style.whiteSpace = "normal"; it.style.wordBreak = "break-all"; it.style.overflowX = "visible"; }); }
    else if (variant === "columnise-block"){ applyCorrect(); document.querySelectorAll(".sol-note").forEach((b) => { b.style.columnCount = "2"; b.style.columnGap = GUTTER + "px"; }); } // G
    else if (variant === "no-failsafe")    { applyCorrect(); document.querySelectorAll(".sol-undeclared").forEach((c) => { c.classList.add("sol-seq"); gridify(c, "across", false); }); } // H
    else if (variant === "split-working")  { applyCorrect(); splitWorking(); }                                                                              // 6 -> D2
    else if (variant === "marker-working") { applyCorrect(); document.querySelectorAll(".sol-working").forEach((w) => w.classList.add("sol-seq")); }        // 7 -> D2

    // ── geometry ──
    const pvCard = frame.querySelector(".pv-card");
    const cs = getComputedStyle(pvCard);
    const panelW = Math.round(pvCard.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));

    function itemsGeom(container) {
      if (!container) return null;
      const items = [...container.children].map((el) => {
        const r = el.getBoundingClientRect();
        const c = el.cloneNode(true);
        c.style.cssText += ";white-space:nowrap;width:max-content;max-width:none;position:absolute;left:-99999px;top:0;display:inline-block";
        el.parentNode.appendChild(c); const nowrapH = c.getBoundingClientRect().height; c.remove();
        const ecs = getComputedStyle(el);
        return { text: (el.textContent || "").trim().slice(0, 40), left: Math.round(r.left), top: Math.round(r.top),
                 height: Math.round(r.height), nowrapH: Math.round(nowrapH),
                 clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, overflowX: ecs.overflowX };
      });
      if (!items.length) return { cols: 0, items: [], firstRow: [], columnCount: getComputedStyle(container).columnCount };
      const minTop = Math.min(...items.map((it) => it.top));
      const firstRow = items.filter((it) => Math.abs(it.top - minTop) <= 2).sort((a, b) => a.left - b.left);
      return { cols: firstRow.length, items, firstRow, columnCount: getComputedStyle(container).columnCount };
    }

    const workEl = holder.querySelector(".sol-working");
    let working = null;
    if (workEl) {
      const r = workEl.getBoundingClientRect(); const ecs = getComputedStyle(workEl);
      working = { hasSeqMarker: workEl.classList.contains("sol-seq"), childItemCount: workEl.children.length,
                  text: (workEl.textContent || "").trim(), overflowX: ecs.overflowX,
                  scrollWidth: workEl.scrollWidth, clientWidth: workEl.clientWidth, height: Math.round(r.height) };
    }

    return {
      qid: q.id, panelW,
      seq: itemsGeom(holder.querySelector(".sol-table") || holder.querySelector(".sol-facts")),
      note: holder.querySelector(".sol-note") ? { columnCount: getComputedStyle(holder.querySelector(".sol-note")).columnCount } : null,
      synth: itemsGeom(holder.querySelector(".sol-synth-seq")),
      undeclared: itemsGeom(holder.querySelector(".sol-undeclared")),
      working,
    };
  }, { source, pickSrc: pickSrc.toString(), variant, inject: inject || null, context: context || "holder" });
}

const inner = (html) => {
  const o = html.indexOf('<div id="source">'); if (o < 0) return html;
  const s = o + '<div id="source">'.length; const b = html.indexOf('<div id="preview"', s);
  let sl = html.slice(s, b > s ? b : undefined); const lc = sl.lastIndexOf("</div>");
  return lc >= 0 ? sl.slice(0, lc) : sl;
};

const NEED = [
  ["table1@1280", FILES.g3, PICK.table1, 1280, null],
  ["table1@380",  FILES.g3, PICK.table1, 380,  null],
  ["table1@768",  FILES.g3, PICK.table1, 768,  null],
  ["facts@1280",  FILES.g3, PICK.facts,  1280, null],
  ["rule@1280",   FILES.g3, PICK.rule,   1280, null],
  ["rule@768",    FILES.g3, PICK.rule,   768,  null],
  ["rule@380",    FILES.g3, PICK.rule,   380,  null],
  ["prose@294",   FILES.prose, PICK.prose, 380,  null],
  ["prose@642",   FILES.prose, PICK.prose, 768,  null],
  ["prose@758",   FILES.prose, PICK.prose, 1280, null],
  ["synth@1280",  FILES.g3, PICK.rule,   1280, "synth-wide"],
  ["synth@380",   FILES.g3, PICK.rule,   380,  "synth-wide"],
  ["undecl@1280", FILES.prose, PICK.prose, 1280, "undeclared"],
];
const srcCache = {};
// render every fixture in a given layout CONTEXT ("holder" full-width, or "bubble" .cc-bub)
async function collect(browser, variant, context) {
  const geo = {};
  for (const [key, file, pick, vw, inj] of NEED) {
    if (!(file in srcCache)) srcCache[file] = inner(rd(file));
    const page = await browser.newPage({ viewport: { width: vw, height: 1400 } });
    await page.setContent(pageHtml, { waitUntil: "load" });
    await page.evaluate(async () => { await document.fonts.ready; });
    geo[key] = await measure(page, srcCache[file], pick, variant, inj, context);
    await page.close();
  }
  return geo;
}

function assertAll(geo) {
  const near = (a, b) => Math.abs(a - b) <= 2;
  const seqOneLine = (g) => g.seq && g.seq.items.length > 0 && g.seq.items.every((it) => near(it.height, it.nowrapH));

  const A = geo["table1@1280"].seq && geo["table1@1280"].seq.cols === 4;
  const fr = geo["table1@1280"].seq && geo["table1@1280"].seq.firstRow;
  const B = !!(fr && fr.length >= 2 && /8\s*×\s*2\s*=\s*16/.test(fr[1].text));
  const C = geo["table1@1280"].seq && geo["table1@1280"].seq.columnCount === "auto";
  const D = !!(geo["synth@1280"].synth && geo["synth@1280"].synth.cols === 1 && geo["synth@1280"].panelW === 758);
  // D2 — sol-working is BLOCK: no marker + never split (all widths); rail when it exceeds 294; panel unchanged.
  const P = [geo["prose@294"].working, geo["prose@642"].working, geo["prose@758"].working];
  const noSplitNoMarker = P.every((p) => p && !p.hasSeqMarker && p.childItemCount === 0 && p.text === "1 kL is 1,000 L, and 842 falls short of 1,000.");
  const p294 = geo["prose@294"].working;
  const railWhenWide = !!(p294 && /(auto|scroll)/.test(p294.overflowX) && p294.scrollWidth > p294.clientWidth + 1 && geo["prose@294"].panelW === 294);
  const D2 = noSplitNoMarker && railWhenWide;
  // E — every item one line; the synthetic wide item stays one line (rails, never wraps).
  const synthOneLine = geo["synth@380"].synth && geo["synth@380"].synth.items.length &&
                       geo["synth@380"].synth.items.every((it) => near(it.height, it.nowrapH));
  const E = seqOneLine(geo["table1@1280"]) && seqOneLine(geo["facts@1280"]) && !!synthOneLine;
  // F — the synthetic wide item gets its OWN scroll rail; panel unchanged (294).
  const sy = geo["synth@380"].synth;
  const wideItem = sy && sy.items.reduce((m, it) => (it.scrollWidth > (m ? m.scrollWidth : 0) ? it : m), null);
  const F = !!(wideItem && wideItem.scrollWidth > wideItem.clientWidth + 1 && /(auto|scroll)/.test(wideItem.overflowX) && geo["synth@380"].panelW === 294);
  const blk = (g) => g.note && g.note.columnCount === "auto";
  const G = blk(geo["rule@1280"]) && blk(geo["rule@768"]) && blk(geo["rule@380"]);
  const H = !!(geo["undecl@1280"].undeclared && geo["undecl@1280"].undeclared.cols <= 1);
  const I = geo["table1@380"].panelW === 294 && geo["table1@768"].panelW === 642 && geo["table1@1280"].panelW === 758 &&
            geo["rule@380"].panelW === 294 && geo["prose@294"].panelW === 294 &&
            geo["synth@1280"].panelW === 758 && geo["synth@380"].panelW === 294;

  return { A, B, C, D, D2, E, F, G, H, I, geo };
}

const NAMES = ["A", "B", "C", "D", "D2", "E", "F", "G", "H", "I"];
// A,B,D,D2,E,F,G,H,I are mandatory in BOTH contexts (Phase-4 fix). C is mechanism-only.
const BUBBLE_MANDATORY = ["A", "B", "D", "D2", "E", "F", "G", "H", "I"];
const line = (label, r) => label.padEnd(18) + NAMES.map((n) => n + ":" + (r[n] ? "PASS" : "FAIL")).join("  ");

async function runAll(browser, variant, context) { return assertAll(await collect(browser, variant, context)); }

// key diagnostics for the report: the table's computed columns and the measured width
function bubbleDiag(geo) {
  const t = geo["table1@1280"] && geo["table1@1280"].seq;
  const f = geo["facts@1280"] && geo["facts@1280"].seq;
  return {
    table1_cols: t ? t.cols : null,
    table1_rowLefts: t ? [...new Set(t.firstRow ? t.items.map((i) => i.left) : [])].length : null,
    facts_cols: f ? f.cols : null,
  };
}

(async () => {
  const sabotage = process.argv.includes("--sabotage");
  const browser = await chromium.launch();
  try {
    if (!sabotage) {
      console.log("verify-panel-layout — assertions against the engine, in BOTH layout contexts\n");
      const rHolder = await runAll(browser, "none", "holder");
      const rBubble = await runAll(browser, "none", "bubble");
      console.log(line("holder (renderSolution)", rHolder));
      console.log(line("bubble (.cc-bub walk)  ", rBubble));

      const holderFail = NAMES.filter((n) => !rHolder[n]);
      const bubbleFailAll = NAMES.filter((n) => !rBubble[n]);
      const bubbleFailMandatory = BUBBLE_MANDATORY.filter((n) => !rBubble[n]);
      console.log("\nholder FAILING: " + (holderFail.length ? holderFail.join(", ") : "none"));
      console.log("bubble FAILING: " + (bubbleFailAll.length ? bubbleFailAll.join(", ") : "none") +
                  "  (of the mandatory set " + BUBBLE_MANDATORY.join("/") + ")");
      console.log("\nbubble diagnostics: " + JSON.stringify(bubbleDiag(rBubble.geo)));
      // Pass only when BOTH contexts are green on their required sets.
      const ok = holderFail.length === 0 && bubbleFailMandatory.length === 0;
      process.exit(ok ? 0 : 1);
    }

    console.log("verify-panel-layout --sabotage : proving each assertion discriminates (holder context)\n");
    const expect = {
      "correct":          [],
      "fill-down":        ["B"],
      "column-count":     ["B", "C"],
      "mid-break":        ["E"],
      "columnise-block":  ["G"],
      "no-failsafe":      ["H"],
      "split-working":    ["D2"],   // sabotage 6 — the rejected ", " itemisation
      "marker-working":   ["D2"],   // sabotage 7 — a sequence marker alone
    };
    let allGood = true;
    for (const variant of Object.keys(expect)) {
      const rH = await runAll(browser, variant, "holder");
      const rB = await runAll(browser, variant, "bubble");
      const failH = NAMES.filter((n) => !rH[n]);
      const failB = NAMES.filter((n) => !rB[n]);
      const want = expect[variant];
      console.log(line(variant + " [holder]", rH));
      console.log(line(variant + " [bubble]", rB));
      let ok;
      if (variant === "correct") {
        ok = failH.length === 0 && BUBBLE_MANDATORY.every((n) => rB[n]);   // both contexts green
      } else {
        // each named assertion must fail in holder, and — if it is bubble-mandatory — in the bubble too
        ok = want.every((n) => failH.includes(n) && (!BUBBLE_MANDATORY.includes(n) || failB.includes(n)));
      }
      const bubbleNamed = want.filter((n) => BUBBLE_MANDATORY.includes(n));
      console.log("   named [" + want.join(",") + "]  holder-fail:[" + want.filter((n) => failH.includes(n)).join(",") +
                  "]  bubble-fail(mandatory):[" + bubbleNamed.filter((n) => failB.includes(n)).join(",") +
                  "]  => " + (ok ? "OK" : "NAMED ASSERTION DID NOT FAIL IN A REQUIRED CONTEXT"));
      if (!ok) allGood = false;
    }
    console.log("\nSABOTAGE RESULT: " + (allGood ? "every assertion is discriminating in BOTH contexts (each sabotage failed its named assertion where mandatory)"
                                                  : "NON-DISCRIMINATING — an assertion did not fail for the right reason in a required context"));
    process.exit(allGood ? 0 : 1);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(2); });
