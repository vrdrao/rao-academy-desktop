/* ============================================================================
   preview.js — generates a fully interactive preview page for a lesson.

   Usage:  node tools/preview.js lessons/foo.html
           node tools/preview.js lessons/foo.html

   Output: lessons/_preview/foo.preview.html  (opened in the default browser)

   The preview loads the REAL rao.css, rao-card.css, preview-engine.js, and
   rao-card.js via relative paths — no inlining, no stubs. If the preview
   and the live app can drift, the preview is worthless.

   lessons/_preview/ is in .gitignore. Preview files are throwaway.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PREVIEW_DIR = path.join(ROOT, "lessons", "_preview");

const file = process.argv[2];
if (!file) { console.error("Usage: node tools/preview.js <lesson.html>"); process.exit(1); }

const abs = path.resolve(file);
if (!fs.existsSync(abs)) { console.error("File not found: " + abs); process.exit(1); }

const basename = path.basename(abs, ".html");
const source = fs.readFileSync(abs, "utf8");

// Extract just the #source content if it's wrapped in <div id="source">
let content = source;
const m = source.match(/<div id="source">([\s\S]*?)<\/div>\s*$/);
if (m) content = m[1];

fs.mkdirSync(PREVIEW_DIR, { recursive: true });

// Relative paths from lessons/_preview/ to engine/
const REL = "../../engine";

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview: ${basename}</title>
<link rel="stylesheet" href="${REL}/fonts.css">
<link rel="stylesheet" href="${REL}/rao.css">
<link rel="stylesheet" href="${REL}/rao-card.css">
<style>
/* ── Control bar: outside .rao-lesson, cannot affect the lesson ──────── */
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:#f4f1fb;font-family:'Quicksand','DM Sans',system-ui,sans-serif}
.pv-ctrl{position:sticky;top:0;z-index:999;display:flex;align-items:center;gap:14px;
  padding:10px 16px;background:#1e1640;color:#fff;font-size:.82rem;font-weight:600;
  flex-wrap:wrap;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.pv-ctrl label{display:flex;align-items:center;gap:6px;cursor:pointer}
.pv-ctrl select{font-size:.82rem;padding:4px 8px;border-radius:8px;border:1px solid #555;
  background:#2a2060;color:#fff;font-weight:600;cursor:pointer}
.pv-ctrl button{font-size:.78rem;padding:6px 14px;border-radius:8px;border:1px solid #555;
  background:#2a2060;color:#fff;font-weight:700;cursor:pointer;transition:background .15s}
.pv-ctrl button:hover{background:#3d2c8a}
.pv-ctrl button.active{background:#7b5cff;border-color:#7b5cff}
.pv-ctrl .spacer{flex:1}
.pv-ctrl .title{font-size:.92rem;font-weight:800;letter-spacing:.02em}
#preview{max-width:820px;margin:0 auto;padding:clamp(10px,3.5vw,24px)}
.pv-ans{margin:0 6px 22px;font-size:.86rem;color:#0f9d6b;font-weight:600}
.pv-ans b{color:#047857}
.pv-ans.hidden{display:none}
</style>
</head><body>

<div class="pv-ctrl">
  <span class="title">${basename}</span>
  <span class="spacer"></span>
  <label>Mode
    <select id="mode-sel">
      <option value="adaptive" selected>Adaptive</option>
      <option value="rapid">Rapid Fire</option>
      <option value="quiz">Quiz</option>
    </select>
  </label>
  <label>Theme
    <select id="theme-sel">
      <option value="grape" selected>Grape</option>
      <option value="bubblegum">Bubblegum</option>
      <option value="mint">Mint</option>
      <option value="sunshine">Sunshine</option>
      <option value="blueberry">Blueberry</option>
      <option value="cottoncandy">Cotton Candy</option>
      <option value="forest">Forest</option>
      <option value="rainbow">Rainbow</option>
    </select>
  </label>
  <button id="reveal-btn">Reveal Answers</button>
</div>

<div id="source" style="display:none">
${content}
</div>

<div id="preview" class="rao-lesson" data-theme="grape"></div>

<script src="${REL}/preview-engine.js"></script>
<script src="${REL}/rao-card.js"></script>
<script>
(function(){
  // ── Mode switch ──────────────────────────────────────────────────────
  var modeSel = document.getElementById('mode-sel');
  modeSel.addEventListener('change', function(){
    document.querySelectorAll('.qbody').forEach(function(q){
      q.setAttribute('data-mode', modeSel.value);
    });
  });

  // ── Theme switch ─────────────────────────────────────────────────────
  var themeSel = document.getElementById('theme-sel');
  themeSel.addEventListener('change', function(){
    document.getElementById('preview').setAttribute('data-theme', themeSel.value);
  });

  // ── Reveal answers toggle ────────────────────────────────────────────
  var revealBtn = document.getElementById('reveal-btn');
  var revealed = false;
  revealBtn.addEventListener('click', function(){
    revealed = !revealed;
    revealBtn.classList.toggle('active', revealed);
    revealBtn.textContent = revealed ? 'Hide Answers' : 'Reveal Answers';
    document.querySelectorAll('.pv-ans').forEach(function(el){
      el.classList.toggle('hidden', !revealed);
    });
  });

  // ── Hide answers by default ──────────────────────────────────────────
  document.querySelectorAll('.pv-ans').forEach(function(el){
    el.classList.add('hidden');
  });
})();
</script>
</body></html>`;

const out = path.join(PREVIEW_DIR, basename + ".preview.html");
fs.writeFileSync(out, html);
console.log("preview -> " + path.relative(ROOT, out));

// Open in default browser
const plat = process.platform;
try {
  if (plat === "win32") execSync('start "" "' + out + '"');
  else if (plat === "darwin") execSync('open "' + out + '"');
  else execSync('xdg-open "' + out + '"');
} catch (e) {
  console.log("(could not auto-open — open the file manually)");
}
