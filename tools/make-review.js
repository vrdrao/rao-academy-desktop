/* ============================================================================
   RAO REVIEW BUILDER — the lesson, exactly as a child sees it.

   Produces a FULLY SELF-CONTAINED review/<name>.html you can double-click and
   open offline: the CURRENT engine, the CURRENT rao.css and the fonts are all
   inlined. It is NOT a mock and NOT a re-render — the page runs the real
   RaoPreview.build() + attach() in your browser, exactly as the app will.

   ---------------------------------------------------------------------------
   FORMAT CONTRACT — read this before you change anything in here.

   The review page MUST look identical to a lesson file in lessons/.
   That means every question is a real student card:

       .pv-frame   gradient border        (purple -> pink)
         .pv-card  white rounded card
           .pv-head    "Problem" label + progress ring (i/n)
           <question>  the real engine markup, interactive
           .pv-hintbox collapsible hint panel
           .pv-foot    [Hint] ......... [Check]
       .pv-ans     green "Answer: ..." line, below the frame

   There is NO separate review skin. No .rv-card. No audit list. No type chips
   scattered down the page. If you are tempted to invent chrome here, DON'T —
   the whole point of this tool is that what you review is what ships.

   To guarantee that, the card CSS and the card/wire JS are not written out by
   hand in this file. They are inlined VERBATIM from the two real shared files the
   app ships — engine/rao-card.css (the look) and engine/rao-card.js (the renderer).
   Change the card design there and the review follows for free. There is exactly
   one copy of the card in the system, so the two can never drift apart.
   ---------------------------------------------------------------------------

   Usage:
     node tools/make-review.js lessons/<lesson>.html [outname]
       -> writes review/<outname or lesson-basename>.html

   This is a VIEWER. It never touches the engine or any lesson content.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENGINE = path.join(ROOT, "engine", "preview-engine.js");
const CSS = path.join(ROOT, "engine", "rao.css");
const FONTS_CSS = path.join(ROOT, "engine", "fonts.css");
const FONTS_DIR = path.join(ROOT, "engine", "fonts");
const CARD_CSS = path.join(ROOT, "engine", "rao-card.css");
const CARD_JS = path.join(ROOT, "engine", "rao-card.js");
const SOLUTION_JS = path.join(ROOT, "engine", "solution-renderer.js");
const ROBO_CSS = path.join(ROOT, "engine", "robo.css");
const ROBO_JS = path.join(ROOT, "engine", "robo.js");
const OUT_DIR = path.join(ROOT, "review");

/* ---------- inputs: questions from the lesson, chrome from shared files --- */

/* Pull just the authored questions out of a lesson file — identical scoping to
   the harness. This is the ONLY thing read from a lesson: its #source. Chrome (CSS
   + renderer JS) comes from the shared engine/ files, never from a lesson. Legacy
   self-contained files bake an engine after <div id="preview">, so we stop there. */
function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  if (a < 0) throw new Error('no <div id="source"> block found');
  const b = html.indexOf('<div id="preview"');
  return html.slice(a, b > a ? b : undefined);
}

/* The card chrome now lives in engine/rao-card.css — a REAL shared file the app
   ships alongside rao.css. The review page links the same bytes the app does, so
   there is exactly ONE copy of the card design in the whole system. It cannot
   drift, because there is nothing to drift from.

   (It used to be scraped out of the reference lesson's <style> block. That worked,
   but it left the app with nothing to install — the design existed only inside an
   HTML file. Now it is a file.) */
function chromeCss() {
  const css = fs.readFileSync(CARD_CSS, "utf8");
  if (!/\.pv-frame/.test(css) || !/\.pv-check/.test(css))
    throw new Error("engine/rao-card.css is missing .pv-frame/.pv-check");
  return css.trim();
}

/* The review page is a standalone HTML document, so it also needs the few page-level
   rules a lesson has but an app supplies itself (body background, the h1, the note).
   These are page furniture, NOT card design — they never go in rao-card.css.
   Body is plain --bg white; the checkered grid is NOT painted here, because it
   arrives via the shared rao.css on `.rao-lesson` — the pane the cards actually
   sit in, exactly as in the app. Painting a second grid on body would overlap
   the pane's own grid out of phase and draw a seam the app never shows. */
const PAGE_CSS = `
body{font-family:'Quicksand','DM Sans',system-ui,sans-serif;max-width:820px;margin:0 auto;padding:24px;background:#ffffff;color:#2c2150}
h1{font-size:1.2rem}.sub{font-size:.8rem;color:#8a7bbd;font-weight:600}
.note{background:#fff;border-left:4px solid #7b5cff;padding:10px 14px;border-radius:8px;color:#6b5b9a;margin:8px 0 18px;font-size:.9rem}
#source{display:none}
/* BRIEF-IDCHIP-1: the permanent question id, shown as a small muted monospace chip
   beside the counter. REVIEW-ONLY page furniture — Venkat's instrument, never the
   child's card. Reuses --fm/--mute/--sub tokens; must not compete with the question. */
.id-chip{-webkit-appearance:none;appearance:none;display:inline-flex;align-items:center;justify-content:center;
  font-family:var(--fm,'JetBrains Mono',monospace);font-size:.66rem;font-weight:600;letter-spacing:.02em;
  color:var(--mute,#9ca3af);background:rgba(44,33,80,.05);border:1px solid rgba(44,33,80,.10);border-radius:7px;
  padding:4px 8px;margin-left:auto;margin-right:8px;cursor:pointer;white-space:nowrap;line-height:1.1;
  user-select:all;-webkit-user-select:all;transition:color .15s,background .15s,border-color .15s}
.id-chip:hover{color:var(--sub,#4b5563);background:rgba(44,33,80,.09)}
.id-chip:focus-visible{outline:2px solid var(--brand,#7b5cff);outline-offset:1px}
.id-chip.is-copied{color:#0b9468;background:rgba(16,185,129,.14);border-color:rgba(16,185,129,.35)}
/* mobile: keep the chip legible and give it a >=44px tap height without pushing the counter out */
@media(max-width:480px){.id-chip{font-size:.6rem;padding:11px 8px;margin-right:6px}}
`;

/* The card RENDERER lives in engine/rao-card.js — a real shared file, exactly like
   engine/rao-card.css: esc/escAttr/card/wireCard + the IIFE that mounts every question
   into #preview. The review page inlines the same bytes the app ships. There is ONE
   copy of the renderer in the whole system, so review and app cannot drift — and it is
   NOT scraped out of a lesson, so content-only lessons (just their #source) still build.
   (rao-card.css was promoted to a file first; this finishes the job for the JS.) */
function chromeJs() {
  const js = fs.readFileSync(CARD_JS, "utf8");
  if (!/function\s+card\s*\(/.test(js) || !/pv-frame/.test(js))
    throw new Error("engine/rao-card.js is missing card()/pv-frame — cannot build review chrome");
  return js.trim();
}

/* THE MOUNT POINT — and the one place the review deliberately does NOT copy the
   lesson.

   The legacy lesson files mount into:
       <div id="preview" style="--brand:#7b5cff; --ink:#2c2150; ...">
   i.e. they hard-pin the theme as INLINE STYLES. CLAUDE.md is explicit that this
   is a bug: inline styles win the cascade, so `data-theme` can never re-tint the
   page. Those lessons predate rao.css.

   The real app mounts into:
       <div class="rao-lesson" data-theme="grape">
   That wrapper is what switches rao.css on — scoping, theming, and the
   `.rao-lesson .qbody{min-height:0!important}` rule that cancels the engine's
   inline `min-height:var(--rz-card-floor,300px)` floor.

   Drop the wrapper and every card is padded out to a 300px floor and no theme
   works. So the review keeps the lesson's CARD DESIGN but uses the APP's MOUNT.
   That is the correct target: what the child actually sees. Theme is overridable
   with RAO_THEME=mint (grape | bubblegum | mint | sunshine | blueberry |
   cottoncandy | forest | rainbow). */
const THEME = process.env.RAO_THEME || "grape";
const previewDiv = () => `<div id="preview" class="rao-lesson" data-theme="${THEME}">`;

/* ---------- fonts --------------------------------------------------------- */

/* Embed the fonts as base64 data: URIs so the page needs no network and no sibling
   files. fonts.css points several weights (500/600/700/800) at the SAME woff2 file,
   so a naive url()->base64 replace embeds each file 3-4x and quadruples the payload.
   Instead we group @font-face rules by (family, file, unicode-range) and emit ONE
   rule per unique file with a font-weight RANGE — each woff2 embedded exactly once.
   The app already reuses one file across those weights, so this changes nothing
   visually; it just stops the duplication. */
function inlineFonts() {
  const css = fs.readFileSync(FONTS_CSS, "utf8");
  const cache = {};
  const dataUri = (file) => (cache[file] ||=
    `data:font/woff2;base64,${fs.readFileSync(path.join(FONTS_DIR, file)).toString("base64")}`);

  const pick = (block, prop) => (block.match(new RegExp(prop + ":\\s*([^;]+);")) || [])[1]?.trim();
  const groups = new Map();
  for (const block of css.match(/@font-face\s*\{[^}]*\}/g) || []) {
    const file = (block.match(/url\(\s*fonts\/([^)\s]+)\s*\)/) || [])[1];
    if (!file) continue;
    const family = pick(block, "font-family") || "";
    const urange = pick(block, "unicode-range") || "";
    const style = pick(block, "font-style") || "normal";
    const key = family + "|" + file + "|" + urange;
    if (!groups.has(key)) groups.set(key, { family, file, urange, style, weights: [] });
    (pick(block, "font-weight") || "400").split(/\s+/).forEach((w) => {
      const n = parseInt(w, 10);
      if (!isNaN(n)) groups.get(key).weights.push(n);
    });
  }

  let out = "";
  for (const g of groups.values()) {
    const lo = Math.min(...g.weights), hi = Math.max(...g.weights);
    const fw = lo === hi ? String(lo) : lo + " " + hi;
    out += `@font-face{font-family:${g.family};font-style:${g.style};font-weight:${fw};` +
           `font-display:swap;src:url(${dataUri(g.file)}) format('woff2');` +
           (g.urange ? `unicode-range:${g.urange};` : "") + "}\n";
  }
  return out;
}

/* Keep an embedded </script> from closing our wrapper tag prematurely. */
const safeForScript = (s) => s.replace(/<\/script/gi, "<\\/script");

/* ---------- the one thing a lesson does NOT have -------------------------- */
/* A lesson file has no summary bar. A reviewer wants one: how many questions,
   which types, which engine built it. It is a THIN strip ABOVE the cards and it
   touches nothing below — the cards stay byte-for-byte the lesson's own.
   Namespaced .rvbar so it can never collide with .pv-* or rao.css. */
const BAR_CSS = `
.rvbar{position:sticky;top:0;z-index:60;margin:-24px -24px 18px;background:#2c2150;color:#fff;
  padding:11px 20px;display:flex;flex-wrap:wrap;gap:7px 12px;align-items:center;
  box-shadow:0 2px 12px rgba(0,0,0,.18)}
.rvbar b{font-size:1rem;font-weight:800}
.rvbar .c{background:rgba(255,255,255,.15);border-radius:999px;padding:3px 10px;font-size:.75rem;font-weight:600;white-space:nowrap}
.rvbar .v{margin-left:auto;font-size:.74rem;opacity:.82;font-family:'JetBrains Mono',monospace}
.rvbar .bad{color:#ffb3c1;font-weight:800}
`;

/* Fills the summary bar AFTER the lesson's own render script has mounted every
   card. It reads the DOM the lesson produced; it renders no questions itself. */
const BAR_JS = `
(function(){
  var bar = document.getElementById('rvbar'); if(!bar) return;
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  try{
    var frames = document.querySelectorAll('.pv-frame');
    if(!frames.length){ bar.innerHTML = '<b class="bad">NO CARDS RENDERED</b>'; return; }
    var counts = {};
    frames.forEach(function(f){ var t = f.dataset.behavior || '?'; counts[t] = (counts[t]||0)+1; });
    var chips = Object.keys(counts).sort().map(function(t){
      return '<span class="c">'+esc(t)+' &middot; '+counts[t]+'</span>'; }).join('');
    bar.innerHTML = '<b>'+frames.length+' question'+(frames.length===1?'':'s')+'</b>'+chips+
      '<span class="v">engine '+esc((window.RaoPreview && RaoPreview.__version) || '?')+'</span>';
  }catch(e){ bar.innerHTML = '<b class="bad">'+esc(e.message)+'</b>'; }
})();
`;

/* BRIEF-IDCHIP-1 — REVIEW-ONLY. After the cards mount, tag each with its permanent
   question id (read from the rendered .qbody[data-qid]) as a small copyable chip
   beside the .pv-ring counter. This script is emitted ONLY into the review page by
   make-review; the app's render path (engine + rao-card.js) never includes it, so
   the id can never reach the child-facing card. Same class of mechanism as BAR_JS.
   The chip element is never replaced — its text is mutated for the copy
   confirmation (no-repaint law). Clipboard failure never throws: it falls back to
   selecting the text and stays silent. */
const CHIP_JS = `
(function(){
  var frames = document.querySelectorAll('.pv-frame');
  frames.forEach(function(f){
    var qb = f.querySelector('.qbody'); if(!qb) return;
    var id = qb.getAttribute('data-qid'); if(!id) return;
    var head = f.querySelector('.pv-head'); if(!head || head.querySelector('.id-chip')) return;
    var ring = head.querySelector('.pv-ring');
    var chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'id-chip'; chip.textContent = id;
    chip.title = 'Click to copy question id';
    chip.setAttribute('aria-label', 'Question id ' + id + ', click to copy');
    chip.addEventListener('click', function(){
      function confirmCopied(){
        chip.classList.add('is-copied'); chip.textContent = 'copied';
        setTimeout(function(){ chip.textContent = id; chip.classList.remove('is-copied'); }, 1000);
      }
      function selectFallback(){
        try{ var r = document.createRange(); r.selectNodeContents(chip);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }catch(_){}
      }
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(id).then(confirmCopied, function(){ selectFallback(); confirmCopied(); });
        } else { selectFallback(); confirmCopied(); }
      }catch(e){ selectFallback(); confirmCopied(); }
    });
    if(ring) head.insertBefore(chip, ring); else head.appendChild(chip);
  });
})();
`;

/* ---------- build --------------------------------------------------------- */

function build(lessonPath, outName) {
  const html = fs.readFileSync(lessonPath, "utf8");

  const source = sourceOf(html);          // the questions from THIS lesson
  const cardCss = chromeCss();           // the card LOOK — engine/rao-card.css, shared with the app
  const renderJs = chromeJs();            // the card RENDERER — engine/rao-card.js, shared with the app
  const mount = previewDiv();             // the APP's mount: .rao-lesson[data-theme]

  const engine = fs.readFileSync(ENGINE, "utf8");
  const css = fs.readFileSync(CSS, "utf8");
  const fontsCss = inlineFonts();
  const refName = "engine/rao-card.js";

  const title = path.basename(lessonPath).replace(/\.html?$/i, "");
  const page =
`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Review — ${title}</title>
<style>/* self-hosted fonts, inlined as data URIs (page needs no network) */
${fontsCss}</style>
<style>/* engine/rao.css — the CURRENT app stylesheet, verbatim */
${css}</style>
<style>/* page furniture — the review page is standalone; your app supplies its own */
${PAGE_CSS}</style>
<style>/* engine/rao-card.css — THE CARD. the same file your app ships, verbatim */
${cardCss}</style>
<style>/* engine/robo.css — ROBO the mascot (Brief 7.7), the same file your app ships, verbatim */
${fs.readFileSync(ROBO_CSS, "utf8").trim()}</style>
<style>/* review summary bar only — sits ABOVE the cards, never inside one */
${BAR_CSS}</style>
</head>
<body>
<div class="rvbar" id="rvbar">building&hellip;</div>
<h1>Question Preview <span class="sub">— exactly as it appears in the app</span></h1>
<p class="note">Each card is the real app UI. Try it — click, type, drag, then press <b>Check</b>. The green line shows the correct answer for review.</p>
${source}
${mount}</div>
<script>/* engine/preview-engine.js — the CURRENT engine, verbatim */
${safeForScript(engine)}
</script>
<script>/* engine/solution-renderer.js — walkthrough renderer (display-only), verbatim.
   Loaded BEFORE the card renderer so window.RaoSolution exists when cards wire up. */
${safeForScript(fs.readFileSync(SOLUTION_JS, "utf8").trim())}
</script>
<script>/* card renderer — lifted VERBATIM from ${refName} */
${safeForScript(renderJs)}
</script>
<script>/* engine/robo.js — ROBO the mascot (Brief 7.7), verbatim. Loaded AFTER the
   card renderer: he injects his own dock and listens for the card's rao:* events. */
${safeForScript(fs.readFileSync(ROBO_JS, "utf8").trim())}
</script>
<script>/* BRIEF-IDCHIP-1 — review-only id chip; never emitted into the app card path */
${safeForScript(CHIP_JS)}</script>
<script>${safeForScript(BAR_JS)}</script>
</body>
</html>`;

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const base = (outName || title).replace(/\.html?$/i, "");
  const outPath = path.join(OUT_DIR, base + ".html");
  fs.writeFileSync(outPath, page);
  return outPath;
}

if (require.main === module) {
  const lesson = process.argv[2];
  const outName = process.argv[3];
  if (!lesson) {
    console.error("usage: node tools/make-review.js lessons/<lesson>.html [outname]");
    process.exit(2);
  }
  if (!fs.existsSync(lesson)) {
    console.error("lesson not found: " + lesson);
    process.exit(2);
  }
  const out = build(lesson, outName);
  const size = (fs.statSync(out).size / 1024).toFixed(0);
  console.log("review written -> " + path.relative(ROOT, out) + "  (" + size + " KB, self-contained)");
  console.log("card from  engine/rao-card.css + engine/rao-card.js   theme: " + THEME);
}

module.exports = { build };
