/* ============================================================================
   RAO REGRESSION HARNESS — the safety net.

   For EVERY lesson in lessons/, in a real browser:
     1. builds     — all questions appear
     2. renders    — no blank figures, no JS errors
     3. grades     — the RIGHT answer is marked CORRECT
     4. rejects    — a WRONG answer is marked WRONG   <- the dangerous one
     5. themes     — all 8 colour schemes re-tint

   Run:  node harness.js            (all lessons)
         node harness.js lessons/place_values.html
   Exit code 0 = SAFE TO SHIP. Non-zero = DO NOT SHIP.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

/* Temp files must live in the OS temp dir — "/tmp" does not exist on Windows.
   tmpFile() returns a real path; tmpUrl() the matching file:// URL for page.goto. */
const tmpFile = (name) => path.join(os.tmpdir(), name);
const tmpUrl  = (name) => pathToFileURL(tmpFile(name)).href;

const ROOT = __dirname;
const ENGINE = path.join(ROOT, "engine", "preview-engine.js");
const CSS = path.join(ROOT, "engine", "rao.css");
const LESSONS = path.join(ROOT, "lessons");
const THEMES = ["grape","bubblegum","mint","sunshine","blueberry","cottoncandy","forest","rainbow"];

const C = { r:"\x1b[31m", g:"\x1b[32m", y:"\x1b[33m", b:"\x1b[1m", d:"\x1b[2m", x:"\x1b[0m" };
const read = (p) => fs.readFileSync(p, "utf8");

/* Pull just the authored questions out of a lesson file. Scoping to #source
   matters: the engine text itself contains the word "question" and would
   inflate any naive grep. */
function sourceOf(html) {
  const a = html.indexOf('<div id="source">');
  const b = html.indexOf('<div id="preview"');
  if (a < 0) throw new Error("no <div id=\"source\"> block found");
  return html.slice(a, b > a ? b : undefined);
}

function harnessPage(source, engine, css) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body class="rao-lesson" data-theme="grape">
${source}
<div id="preview"></div>
<script>${engine}</script>
<script>
window.__err = [];
window.onerror = function (m) { window.__err.push(String(m)); };
try {
  window.__qs = RaoPreview.build(document.getElementById('source').innerHTML);
  var p = document.getElementById('preview');
  window.__qs.forEach(function (q, i) {
    p.insertAdjacentHTML('beforeend',
      '<div class="pv-frame" data-i="' + i + '">' + q.markup + '</div>');
  });
  document.querySelectorAll('.pv-frame').forEach(function (f) {
    var el = f.querySelector('.qbody');
    if (el) RaoPreview.attach(el, window.__qs[+f.dataset.i].behavior);
  });
  window.__ready = true;
} catch (e) { window.__err.push('BUILD THREW: ' + e.message); window.__ready = false; }
</script></body></html>`;
}

/* ---------------------------------------------------------------------------
   Simulate a child answering. `answer` is the array from the frontmatter.
   Returns true if we managed to enter it. Runs INSIDE the browser.
   ------------------------------------------------------------------------ */
const FILL = `
function fillAnswer(el, behavior, answer) {
  const A = (answer || []).map(String);
  const fire = (n, t) => n.dispatchEvent(new Event(t, { bubbles: true }));

  if (behavior === 'single-select' || behavior === 'multi-select') {
    const opts = [...el.querySelectorAll('.opt')];
    if (!opts.length) return false;
    // clear any existing selection
    opts.forEach(o => { if (o.classList.contains('is-sel')) o.click(); });
    let hit = 0;
    A.forEach(v => {
      const o = opts.find(o => (o.dataset.val ?? o.textContent.trim()) === v);
      if (o) { o.click(); hit++; }
    });
    return hit === A.length;
  }

  if (behavior === 'fill-blanks' || behavior === 'expression') {
    const ins = [...el.querySelectorAll('.blank-input, input[type=text], .ans-input')];
    if (!ins.length) return false;
    ins.forEach((inp, i) => { inp.value = A[i] ?? ''; fire(inp, 'input'); fire(inp, 'change'); });
    return true;
  }

  if (behavior === 'order') {
    const slots = [...el.querySelectorAll('.order-slot')];
    const bank  = [...el.querySelectorAll('.tile')];
    if (!slots.length || !bank.length) return false;
    A.forEach((v, i) => {
      const t = bank.find(t => (t.dataset.val ?? t.textContent.trim()) === v && !t.dataset.__used);
      const s = slots[i];
      if (t && s) { t.dataset.__used = '1'; s.appendChild(t); s.classList.add('filled'); }
    });
    return true;
  }

  if (behavior === 'sequence-build') {
    // sequence-build uses its OWN dom: .sb-palette > .sb-tile  ->  .sb-slots > .sb-slot
    const slots   = [...el.querySelectorAll('.sb-slot')];
    const palette = [...el.querySelectorAll('.sb-tile')];
    if (!slots.length || !palette.length) return false;
    A.forEach((v, i) => {
      const src = palette.find(t => (t.dataset.val ?? t.textContent.trim()) === v);
      const s = slots[i];
      if (src && s) {
        const clone = src.cloneNode(true);
        clone.classList.add('placed');
        s.innerHTML = '';
        s.appendChild(clone);
        s.classList.add('filled');
      }
    });
    return true;
  }

  if (behavior === 'time') {
    // regex-free on purpose: '3:45 PM' -> ['3:45','PM']
    const raw = String(A[0] || '').trim();
    const sp = raw.lastIndexOf(' ');
    if (sp < 0) return false;
    const clock = raw.slice(0, sp).trim();
    const ap = raw.slice(sp + 1).trim().toUpperCase();
    const inp = el.querySelector('.time-input');
    if (!inp || !clock || !ap) return false;
    inp.value = clock;
    fire(inp, 'input');
    const btn = [...el.querySelectorAll('.ampm-btn')].find(b => b.dataset.ap === ap);
    if (btn) btn.click();
    return true;
  }

  if (behavior === 'categorize') {
    const tiles = [...el.querySelectorAll('.vs-tile, .tiles li, .tile')];
    const zones = [...el.querySelectorAll('[data-region]')];
    if (!tiles.length || !zones.length) return false;
    A.forEach((region, i) => {
      const t = tiles[i];
      const z = zones.find(z => z.dataset.region === region);
      if (t && z) z.appendChild(t);
    });
    return true;
  }

  if (behavior === 'line-plot') {
    const cols = [...el.querySelectorAll('.lp-col')];
    if (!cols.length) return false;
    A.forEach((count, i) => {
      const slots = [...(cols[i]?.querySelectorAll('.lp-slot') || [])];
      const n = parseInt(count, 10) || 0;
      // slots stack bottom-up; click the nth from the bottom
      const target = slots[slots.length - n];
      if (target) target.click();
    });
    return true;
  }

  if (behavior === 'lattice') {
    // lattice: grid of .lat-in cells; the answer array is the cell values in order
    const cells = [...el.querySelectorAll('.lat-in')];
    if (!cells.length) return false;
    cells.forEach((c, i) => { c.value = A[i] ?? ''; fire(c, 'input'); fire(c, 'change'); });
    return true;
  }

  if (behavior === 'bar-graph') {
    // The engine keeps each bar's value in bar.dataset.value and paints .bg-fill from
    // data-max/data-plot. Set it the way the engine's own setBar() does — pixel-perfect
    // synthetic clicks are brittle and would test the mouse, not the grader.
    const bars = [...el.querySelectorAll('.bg-editable')];
    if (!bars.length) return false;
    const horiz = !!el.querySelector('.bg-wrap[data-h="1"]');
    bars.forEach((bar, i) => {
      const val = parseInt(A[i], 10) || 0;
      const max = +bar.dataset.max || 10;
      const plot = +bar.dataset.plot || 100;
      bar.dataset.value = val;
      const fill = bar.querySelector('.bg-fill');
      const px = Math.round((val / max) * plot);
      if (fill) { if (horiz) fill.style.width = px + 'px'; else fill.style.height = px + 'px'; }
      bar.setAttribute('aria-valuenow', val);
    });
    return true;
  }

  if (behavior === 'construct') return null;   // geometry self-grades; skip
  return false;
}

/* Produce a WRONG answer that is genuinely different from the right one. */
function wrongAnswer(el, behavior, answer) {
  const A = (answer || []).map(String);
  if (behavior === 'single-select') {
    const opts = [...el.querySelectorAll('.opt')].map(o => o.dataset.val ?? o.textContent.trim());
    const bad = opts.find(v => v !== A[0]);
    return bad == null ? null : [bad];
  }
  if (behavior === 'multi-select') {
    const opts = [...el.querySelectorAll('.opt')].map(o => o.dataset.val ?? o.textContent.trim());
    const bad = opts.find(v => !A.includes(v));
    if (bad != null) return [bad];                 // pick a distractor only
    return A.length > 1 ? A.slice(0, 1) : null;    // or an incomplete set
  }
  if (behavior === 'fill-blanks' || behavior === 'expression') {
    return A.map(v => (/^-?\d+$/.test(v) ? String(Number(v) + 1) : v + 'X'));
  }
  if (behavior === 'order' || behavior === 'sequence-build') {
    if (A.length < 2) return null;
    const b = A.slice(); [b[0], b[1]] = [b[1], b[0]];      // swap first two
    return b.join('|') === A.join('|') ? null : b;
  }
  if (behavior === 'categorize') {
    const zones = [...new Set([...el.querySelectorAll('[data-region]')].map(z => z.dataset.region))];
    if (zones.length < 2) return null;
    return A.map(r => zones.find(z => z !== r) ?? r);       // every tile misfiled
  }
  if (behavior === 'line-plot') {
    return A.map(v => String((parseInt(v, 10) || 0) + 1));
  }
  if (behavior === 'time') {
    // flip AM/PM — same digits, wrong half of the day
    const v = String(A[0] || '');
    return [/PM/i.test(v) ? v.replace(/PM/i, 'AM') : v.replace(/AM/i, 'PM')];
  }
  return null;
}`;

async function runLesson(page, file, engine, css) {
  const name = path.basename(file);
  const source = sourceOf(read(file));
  fs.writeFileSync(tmpFile("__rao_h.html"), harnessPage(source, engine, css));
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(tmpUrl("__rao_h.html"));
  await page.waitForTimeout(900);

  const res = await page.evaluate(`(() => {
    ${FILL}
    const out = { ready: window.__ready, err: window.__err.slice(), n: 0, q: [] };
    if (!window.__ready) return out;
    out.n = window.__qs.length;

    document.querySelectorAll('.pv-frame').forEach(f => {
      const i = +f.dataset.i, q = window.__qs[i];
      const el = f.querySelector('.qbody');
      const rec = { i: i + 1, behavior: q.behavior, answer: q.answer,
                    rendered: false, graded: null, rejected: null, note: '' };
      if (!el) { rec.note = 'no .qbody rendered'; out.q.push(rec); return; }

      // ---- RENDER: is the question actually visible & non-empty?
      const r = el.getBoundingClientRect();
      const figs = el.querySelectorAll('svg, canvas, .rao-construct, figure');
      const interactive = el.querySelectorAll(
        '.opt,.blank-input,.tile,.lp-slot,[data-region],.ans-input,.sb-tile,.sb-slot,.time-input,.ampm-btn,.lat-in,.bg-bar');
      rec.rendered = r.height > 10 && (interactive.length > 0 || figs.length > 0);
      rec.figs = figs.length;
      // a figure that collapsed to zero size = the silent-blank bug
      let blank = 0;
      figs.forEach(s => { const b = s.getBoundingClientRect(); if (b.width < 2 || b.height < 2) blank++; });
      rec.blankFigs = blank;
      if (blank) rec.note = blank + ' figure(s) rendered blank';

      if (q.behavior === 'construct') { rec.graded = rec.rejected = 'skip'; out.q.push(rec); return; }

      // ---- DOUBLE-ATTACH: attach() must be idempotent. A React re-mount calls it
      // twice; before rao-master-11 that double-bound every listener and made
      // multi-select unselectable. The harness MISSED this — never again.
      try {
        RaoPreview.attach(el, q.behavior);   // 2nd attach on an already-attached node
        rec.doubleAttachOk = true;
      } catch (e) { rec.doubleAttachOk = false; rec.note += ' 2nd attach threw: ' + e.message; }

      // ---- GRADE: right answer must be CORRECT (AFTER the double-attach)
      try {
        const ok = fillAnswer(el, q.behavior, q.answer);
        if (ok === false) { rec.note = 'could not enter answer'; }
        const user = RaoPreview.serialize(el, q.behavior);
        rec.user = user;
        rec.graded = RaoPreview.check(q.behavior, user, q.answer) === true;
      } catch (e) { rec.graded = false; rec.note = 'check() threw: ' + e.message; }

      // ---- REJECT: wrong answer must be WRONG
      try {
        const bad = wrongAnswer(el, q.behavior, q.answer);
        if (bad == null) { rec.rejected = 'n/a'; }
        else {
          // rebuild a clean copy so the previous answer doesn't linger
          const fresh = document.createElement('div');
          fresh.innerHTML = q.markup;
          const fel = fresh.querySelector('.qbody');
          document.body.appendChild(fresh);
          RaoPreview.attach(fel, q.behavior);
          fillAnswer(fel, q.behavior, bad);
          const buser = RaoPreview.serialize(fel, q.behavior);
          rec.rejected = RaoPreview.check(q.behavior, buser, q.answer) === false;
          rec.badUser = buser;
          rec.wrongTried = bad;
          fresh.remove();
        }
      } catch (e) { rec.rejected = false; rec.note += ' reject threw: ' + e.message; }

      out.q.push(rec);
    });
    return out;
  })()`);

  // ---- THEMES: brand colour must actually change per theme
  const themeSeen = new Set();
  for (const t of THEMES) {
    await page.evaluate((t) => document.body.setAttribute("data-theme", t), t);
    await page.waitForTimeout(90);
    const c = await page.evaluate(() => {
      const e = document.querySelector(".tile, .opt, .check-btn, .blank-input");
      if (!e) return null;
      const s = getComputedStyle(e);
      return s.color + "|" + s.borderTopColor;
    });
    if (c) themeSeen.add(c);
  }
  await page.evaluate(() => document.body.setAttribute("data-theme", "grape"));

  return { name, ...res, errs: errs.concat(res.err || []), themes: themeSeen.size };
}

(async () => {
  if (!fs.existsSync(ENGINE)) { console.error(`${C.r}engine/preview-engine.js missing${C.x}`); process.exit(2); }
  const engine = read(ENGINE), css = fs.existsSync(CSS) ? read(CSS) : "";
  const ver = (engine.match(/__version[^"']*["']([^"']+)/) || [, "unknown"])[1];

  const arg = process.argv[2];
  const files = arg ? [path.resolve(arg)]
    : fs.existsSync(LESSONS)
      ? fs.readdirSync(LESSONS).filter(f => f.endsWith(".html")).map(f => path.join(LESSONS, f))
      : [];

  if (!files.length) { console.error(`${C.r}no lessons found in lessons/${C.x}`); process.exit(2); }

  console.log(`\n${C.b}RAO REGRESSION SUITE${C.x}  ${C.d}engine ${ver} · ${files.length} lesson(s)${C.x}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });

  const preFail = [];

  /* ── GUARD A: rao.css must not touch the HOST APP ──────────────────────────
     rao.css used to ship `* { margin:0 }`, `body {...}` and an unscoped
     `.q { display:none }` — loading it in the app HID any app element with
     class="q" and wiped the app's spacing. Every rule must now be confined
     to .rao-lesson. This asserts it in a real browser, not by reading CSS.

     ALSO guards Bug 5: the CSS scoper mangles comments and can strand the
     `.rao-lesson` prefix, leaving painting selectors (`.explain`,`.opt`,
     `[data-mode] .explain`) looking unscoped. Today they stay scoped only
     because a stray `.rao-lesson` sits before their comment and CSS treats a
     comment as whitespace (-> descendant combinator). That is fragile: clean
     the comments and scoping silently breaks. So we assert here, in a browser,
     that NONE of those rules reach a host element outside `.rao-lesson`. */
  {
    const host = `<!doctype html><html><head><meta charset="utf-8"><style>
      .app-header{padding:20px;margin:10px}
      .q{padding:8px;display:block}
      .app-para{margin:16px}
    </style><style>${css}</style></head><body>
      <div class="app-header">app</div><div class="q">app quantity</div>
      <p class="app-para">app para</p>
      <p class="explain" id="host-explain">app explanation</p>
      <div class="opt" id="host-opt">app option</div>
      <div data-mode="quiz"><p class="explain" id="host-mode-explain">app q-explain</p></div>
      <div class="rao-lesson"><button class="tile">t</button>
        <div class="opt" id="lesson-opt">o</div></div>
    </body></html>`;
    fs.writeFileSync(tmpFile("__rao_host.html"), host);
    await page.goto(tmpUrl("__rao_host.html"));
    await page.waitForTimeout(250);
    const leak = await page.evaluate(() => {
      const g = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e) : null; };
      const gi = (id) => { const e = document.getElementById(id); return e ? getComputedStyle(e) : null; };
      const q = g(".q"), p = g(".app-para"), t = g(".rao-lesson .tile");
      return {
        appQHidden:   q.display === "none",
        appParaWiped: p.marginTop === "0px",
        lessonStyled: t && parseInt(t.height) > 20,
        // Bug 5 leak probes — host copies must be UNAFFECTED, lesson copy MUST be styled.
        hostExplainHidden:     gi("host-explain").display === "none",
        hostOptFloored:        gi("host-opt").minHeight === "44px",
        hostModeExplainHidden: gi("host-mode-explain").display === "none",
        lessonOptFloored:      gi("lesson-opt").minHeight === "44px",
      };
    });
    const noLeak = !leak.hostExplainHidden && !leak.hostOptFloored && !leak.hostModeExplainHidden;
    const scopedOk = leak.lessonOptFloored;   // the rules must still WORK inside .rao-lesson
    const cssOk = !leak.appQHidden && !leak.appParaWiped && leak.lessonStyled && noLeak && scopedOk;
    console.log(`${cssOk ? C.g + "✓" : C.r + "✗"}${C.x} ${C.b}css containment${C.x}  ` +
      `host .q ${leak.appQHidden ? C.r + "HIDDEN" + C.x : "intact"} · ` +
      `host margins ${leak.appParaWiped ? C.r + "WIPED" + C.x : "intact"} · ` +
      `host .explain/.opt ${noLeak ? "intact" : C.r + "LEAKED" + C.x} · ` +
      `lesson ${leak.lessonStyled && scopedOk ? "styled" : C.r + "UNSTYLED" + C.x}`);
    if (!cssOk) preFail.push({ lesson: "rao.css", why: "leaks into host app" });
  }

  /* ── GUARD C: a lesson must fit a NARROW CONTAINER, not just a narrow window ─
     rao.css used to rely on @media (viewport) queries. A lesson in a 340px side
     panel on a 1400px desktop got DESKTOP styling — the queries never fired — and
     the Venn's .vs-out zone (hardcoded 440px) punched 111px out of the panel.
     Container queries fixed it; this asserts it stays fixed. */
  {
    const anySrc = sourceOf(read(files[0]));
    const probe = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
      <body style="margin:0"><div style="display:flex">
        <div style="flex:0 0 1000px"></div>
        <div id="panel" class="rao-lesson" style="width:340px">
          ${anySrc}<div id="preview"></div>
        </div></div>
      <script>${engine}<\/script>
      <script>
        var qs=RaoPreview.build(document.getElementById('source').innerHTML);
        var pv=document.getElementById('preview');
        qs.forEach(function(q,i){ pv.insertAdjacentHTML('beforeend',
          '<div class="pv-frame" data-i="'+i+'">'+q.markup+'</div>'); });
        document.querySelectorAll('.pv-frame').forEach(function(f){
          var el=f.querySelector('.qbody');
          if(el) RaoPreview.attach(el, qs[+f.dataset.i].behavior); });
      <\/script></body></html>`;
    fs.writeFileSync(tmpFile("__rao_panel.html"), probe);
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto(tmpUrl("__rao_panel.html"));
    await page.waitForTimeout(700);
    const fit = await page.evaluate(() => {
      const p = document.getElementById("panel");
      const w = Math.round(p.getBoundingClientRect().width);
      return { w, scroll: p.scrollWidth, over: p.scrollWidth - w };
    });
    await page.setViewportSize({ width: 900, height: 1400 });
    const ok = fit.over <= 2;
    console.log(`${ok ? C.g + "✓" : C.r + "✗"}${C.x} ${C.b}narrow container${C.x} ` +
      `340px panel on a 1400px desktop — content ` +
      (ok ? `fits (${fit.scroll}px)` : `${C.r}OVERFLOWS by ${fit.over}px${C.x}`));
    if (!ok) preFail.push({ lesson: "responsive", why: `overflows narrow container by ${fit.over}px` });
  }

  /* ── GUARD B: every supported type must be exercised ───────────────────────
     The harness previously only tested types present in one real lesson, so the
     completely dead `time` behavior shipped as SAFE. If the engine gains a type
     and no fixture covers it, FAIL — don't silently skip it. */
  {
    const tm = engine.match(/TYPES\s*=\s*new Set\(\[([^\]]*)\]/);
    const declared = tm
      ? [...new Set((tm[1].match(/["'][a-z-]+["']/g) || []).map(function (x) { return x.slice(1, -1); }))]
      : [];
    const covered = new Set();
    for (const f of files) {
      const src = sourceOf(read(f));
      (src.match(/type:\s*[a-z-]+/g) || []).forEach(function (m) {
        covered.add(m.split(":")[1].trim());
      });
    }
    // bar-graph + lattice need author-specific frontmatter and are covered by real
    // lessons rather than a synthetic fixture; construct self-grades via RaoGeo.
    const SELF_GRADING = new Set(["construct"]);
    const missing = declared.filter(t => !covered.has(t) && !SELF_GRADING.has(t));
    const ok = missing.length === 0;
    console.log(`${ok ? C.g + "✓" : C.y + "!"}${C.x} ${C.b}type coverage${C.x}    ` +
      `${covered.size}/${declared.length} types exercised` +
      (missing.length ? `  ${C.y}untested: ${missing.join(", ")}${C.x}` : ""));
    if (!ok) preFail.push({ lesson: "coverage", why: "untested types: " + missing.join(", ") });
  }
  console.log("");

  const T = { q:0, built:0, rendered:0, graded:0, rejected:0, blank:0, errs:0 };
  const failures = [];

  for (const f of files) {
    let r;
    try { r = await runLesson(page, f, engine, css); }
    catch (e) {
      console.log(`${C.r}✗ ${path.basename(f)} — ${e.message}${C.x}`);
      failures.push({ lesson: path.basename(f), why: e.message }); continue;
    }

    if (!r.ready) {
      console.log(`${C.r}✗ ${r.name} — BUILD FAILED${C.x}\n  ${r.errs.join("\n  ")}`);
      failures.push({ lesson: r.name, why: "build failed" }); continue;
    }

    const bad = r.q.filter(q =>
      !q.rendered || q.blankFigs > 0 || q.graded === false || q.rejected === false ||
      q.doubleAttachOk === false);

    T.q += r.n; T.built += r.n;
    T.rendered += r.q.filter(q => q.rendered).length;
    T.graded   += r.q.filter(q => q.graded === true  || q.graded === 'skip').length;
    T.rejected += r.q.filter(q => q.rejected === true || q.rejected === 'n/a' || q.rejected === 'skip').length;
    T.blank    += r.q.reduce((a, q) => a + (q.blankFigs || 0), 0);
    T.errs     += r.errs.length;

    const ok = !bad.length && !r.errs.length && r.themes >= 7;
    const mark = ok ? `${C.g}✓${C.x}` : `${C.r}✗${C.x}`;
    console.log(`${mark} ${C.b}${r.name}${C.x}  ${r.n} questions · ` +
      `render ${r.q.filter(q=>q.rendered).length}/${r.n} · ` +
      `grade ${r.q.filter(q=>q.graded===true).length}/${r.q.filter(q=>q.graded!=='skip').length} · ` +
      `reject ${r.q.filter(q=>q.rejected===true).length}/${r.q.filter(q=>q.rejected===true||q.rejected===false).length} · ` +
      `themes ${r.themes}/8`);

    bad.forEach(q => {
      const why = [];
      if (!q.rendered)          why.push("did not render");
      if (q.blankFigs > 0)      why.push(`${q.blankFigs} BLANK FIGURE(S)`);
      if (q.graded === false)   why.push("right answer graded WRONG");
      if (q.rejected === false) why.push(`wrong answer graded CORRECT (tried ${JSON.stringify(q.wrongTried)})`);
      if (q.doubleAttachOk === false) why.push("attach() NOT idempotent");
      console.log(`   ${C.r}Q${q.i}${C.x} ${C.d}(${q.behavior})${C.x} ${why.join(" · ")}` +
                  (q.note ? ` ${C.d}${q.note}${C.x}` : ""));
      failures.push({ lesson: r.name, q: q.i, behavior: q.behavior, why: why.join("; ") });
    });
    if (r.errs.length) { console.log(`   ${C.r}JS ERRORS:${C.x} ${r.errs.slice(0,3).join(" | ")}`); failures.push({lesson:r.name, why:"js errors"}); }
    if (r.themes < 7)  { console.log(`   ${C.r}THEMES not propagating${C.x} (${r.themes}/8 distinct)`); failures.push({lesson:r.name, why:"themes"}); }
  }

  await browser.close();

  const line = "─".repeat(60);
  console.log(`\n${line}`);
  console.log(`${T.built} questions built · ${T.rendered} rendered · ${T.graded} grade correctly`);
  console.log(`${T.rejected} reject wrong answers · ${T.blank} blank figures · ${T.errs} JS errors`);
  console.log(line);

  failures.unshift(...preFail);
  if (failures.length) {
    console.log(`\n${C.r}${C.b}ENGINE ${ver} — DO NOT SHIP${C.x}  ${C.r}(${failures.length} failure(s))${C.x}\n`);
    fs.writeFileSync(path.join(ROOT, "last-run.json"), JSON.stringify({ engine: ver, failures }, null, 2));
    process.exit(1);
  }
  console.log(`\n${C.g}${C.b}ENGINE ${ver} — SAFE TO SHIP ✅${C.x}\n`);
  process.exit(0);
})();
