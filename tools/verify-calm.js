#!/usr/bin/env node
/* ── verify-calm.js — THE CALM CARD LAWS (Brief 7.6, rao-master-16) ──
 *
 * The grading harness proves questions GRADE right. It never looks at what a
 * wrong attempt PAINTS — and the exact bug this brief exists to kill was a
 * paint bug: the correct option glowed green while retry was still possible,
 * so a child could bail out, tap the green one, and be marked correct having
 * learned nothing. Every law here is asserted on COMPUTED STYLE in a real
 * Chromium, never on markup.
 *
 *   a. ANSWER-LEAK  — for EVERY select-type question in the ENTIRE corpus:
 *                     after a wrong attempt, no option carries green/correct
 *                     styling (each option must computed-equal its own resting
 *                     snapshot) and no reveal text/.explain is visible inside
 *                     the card while the question is attemptable.
 *   b. LOCK-ON-OPEN — opening a walkthrough — by the child's tap OR the
 *                     second-wrong auto-open (LAW 6 as amended by BRIEF FR-2,
 *                     2026-07-19: "never auto-opened" is re-pointed; either
 *                     path locks immediately and records solved-with-help,
 *                     not correct) — with no retry control anywhere inside
 *                     it. This file drives the TAP path; the AUTO-OPEN path
 *                     is guarded by tools/verify-reset.js A6–A9.
 *   c. TASK-IMMUTABILITY — computed color/bg/border/opacity of the prompt and
 *                     ALL options are snapshotted while answering and must be
 *                     IDENTICAL in the wrong, hint, and walkthrough states.
 *   d. ACCUMULATION — hint rung 1 is still visible after rung 2; walkthrough
 *                     steps 1+2 are still visible (full opacity) at step 3.
 *   e. BUBBLE PARITY — against incoming/calm-card-v36.html as the reference:
 *                     production fill timing equals the demo's chatMsg timing
 *                     (650ms ±50 measured live), bubbles are append-only (node
 *                     count only grows; a MutationObserver sees ZERO mutations
 *                     to earlier bubbles after their single fill).
 *   f. HINT-LABEL BAN — no rendered hint chip ever matches /of\s+\d/.
 *
 * Exit 0 = all laws hold. Exit 1 = at least one violated (with the reason).
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

const C = { r: "\x1b[31m", g: "\x1b[32m", b: "\x1b[1m", d: "\x1b[2m", x: "\x1b[0m" };
let failures = 0;
function pass(name, detail) { console.log(`  ${C.g}PASS${C.x}  ${name}${detail ? " — " + detail : ""}`); }
function fail(name, detail) { failures++; console.log(`  ${C.r}FAIL${C.x}  ${name} — ${detail}`); }

const FILL_WAIT = 800;

function pageFor(source) {
  const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
  return `<!doctype html><html><head><meta charset="utf-8">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
${source}
<div class="rao-lesson" data-theme="grape"><div id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}
function sourceOf(file) {
  const html = fs.readFileSync(file, "utf8");
  const a = html.indexOf('<div id="source">');
  const b = html.indexOf('<div id="preview"');
  if (a < 0) throw new Error(`no #source in ${file}`);
  return html.slice(a, b > a ? b : undefined);
}
function collectLessons(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "_preview") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(collectLessons(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

/* Brief 7.7.2 guard fixtures — injected TEST-SIDE (never into the lesson file):
   a fill-blanks card and a select card, each with a 2-rung forward ladder and
   NO whyWrong and NO solution. They exercise the calm-wrong fallback path the
   ladder fixture (which has whyWrong) never reaches. Kept identical to the
   copies in verify-touch.js. */
const FALLBACK_FIXTURES = `
<!--@q
type: fill-blanks
answer: ["14"]
hint:
  - "Think about which doubles fact this is."
  - "Start at the first number and count on the second."
description: calm-wrong fallback fixture — fill-blanks + ladder, NO whyWrong (Brief 7.7.2)
-->
<div class="question" data-type="fill-blanks">
  <p class="prompt">Add: 7 + 7 = []</p>
</div>

<!--@q
type: single-select
answer: ["9"]
hint:
  - "Count on from the bigger number."
  - "Picture both groups joining into one group."
description: calm-wrong fallback fixture — select + ladder, NO whyWrong (Brief 7.7.2)
-->
<div class="question" data-type="single-select">
  <p class="prompt">What is 4 + 5?</p>
  <ul class="options"><li>8</li><li>9</li><li>10</li></ul>
</div>
`;

// ════════════════════════════════════════════════════════════════
// 5f. Law 5 fallback (Brief 7.7.2): the FIRST wrong attempt with NO fresh
// whyWrong (none authored — every non-select, and the 1,585 legacy selects)
// must still deliver "Hint 1" by typing the next forward rung, accumulating
// per Law 4; the ghost label must never promise a rung it has not given.
//
// The SECOND wrong is the cap (BRIEF-PUBLISH-1 Item 50): two attempts is the
// cap on EVERY question. These fixtures have no solution, so the cap reveals the
// answer (outcome "shown-answer") and offers "Next question →" — it does NOT
// deliver a 2nd forward rung and does NOT re-offer "Try again". (Before Item 50
// this path looped: Hint 2 on the 2nd wrong, then "Try again" row-only forever —
// the dead end Item 50 removed. Those two old assertions were replaced here.)
// ════════════════════════════════════════════════════════════════
async function fallbackLaws(browser) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const src = sourceOf(path.join(ROOT, "lessons", "_type-coverage.html"))
    .replace('<div id="source">', '<div id="source">' + FALLBACK_FIXTURES);
  await page.setContent(pageFor(src), { waitUntil: "load" });

  const state = (i) => page.evaluate((k) => {
    const f = document.querySelectorAll(".pv-frame")[k];
    const msgs = [...f.querySelectorAll(".cc-msg")];
    const row = [...f.querySelectorAll(".cc-actions button")]
      .filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.textContent);
    return {
      bubbles: msgs.length,
      allVisible: msgs.every((m) => m.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(m).opacity) > 0.99),
      chips: msgs.map((m) => (m.querySelector(".cc-schip") || {}).textContent || ""),
      texts: msgs.map((m) => m.textContent),
      row,
      ghost: row.find((t) => /hint/i.test(t)) || null,
      walk: row.some((t) => /walk me through/i.test(t)),
    };
  }, i);
  const tryAgain = (i) => page.evaluate((k) => {
    const f = document.querySelectorAll(".pv-frame")[k];
    const b = [...f.querySelectorAll(".cc-actions button")].find((x) => /try again/i.test(x.textContent));
    if (b) b.click();
    return !!b;
  }, i);

  const CASES = [
    { name: "fill-blanks (whyWrong impossible)", idx: 0,
      rungs: ["Think about which doubles fact this is.", "Start at the first number and count on the second."],
      goWrong: (i) => page.evaluate((k) => {
        const f = document.querySelectorAll(".pv-frame")[k];
        f.scrollIntoView({ block: "center" });
        f.querySelectorAll(".blank-input").forEach((inp) => {
          inp.value = "1"; inp.dispatchEvent(new Event("input", { bubbles: true }));
        });
        f.querySelector(".pv-check").click();
      }, i) },
    { name: "select with NO whyWrong", idx: 1,
      rungs: ["Count on from the bigger number.", "Picture both groups joining into one group."],
      goWrong: (i) => page.evaluate((k) => {
        const f = document.querySelectorAll(".pv-frame")[k];
        f.scrollIntoView({ block: "center" });
        const o = [...f.querySelectorAll(".opt")].find((x) =>
          String(x.dataset.val != null ? x.dataset.val : (x.textContent || "").trim()) === "8");
        o.click();
        f.querySelector(".pv-check").click();
      }, i) },
  ];

  for (const cse of CASES) {
    await cse.goWrong(cse.idx);
    await page.waitForTimeout(FILL_WAIT);
    let s = await state(cse.idx);
    if (s.bubbles === 1 && s.allVisible && s.chips[0] === "Hint 1" && s.texts[0].includes(cse.rungs[0]))
      pass(`5f. WRONG DELIVERS HINT 1 [${cse.name}]`, `typed, visible, first forward rung`);
    else fail(`5f. WRONG DELIVERS HINT 1 [${cse.name}]`, `bubbles=${s.bubbles} chips=${JSON.stringify(s.chips)} — the wrong feedback delivered NOTHING`);
    if (s.bubbles >= 1 && s.ghost === "Give one more hint")
      pass(`5f. TRUTHFUL GHOST LABEL [${cse.name}]`, `${s.bubbles} rung shown → "Give one more hint"`);
    else fail(`5f. TRUTHFUL GHOST LABEL [${cse.name}]`, `${s.bubbles} rung(s) delivered but ghost=${JSON.stringify(s.ghost)} — the label promises a rung it has not given`);

    // SECOND wrong = the cap (Item 50). No solution here → reveal the answer
    // (shown-answer), offer Next, no Try again, no Hint 2. The earlier bubbles
    // stay (help accumulates, Law 4).
    await tryAgain(cse.idx);
    await page.waitForTimeout(150);
    await cse.goWrong(cse.idx);
    await page.waitForTimeout(FILL_WAIT);
    const cap = await page.evaluate((k) => {
      const f = document.querySelectorAll(".pv-frame")[k];
      const qb = f.querySelector(".qbody");
      const btns = [...f.querySelectorAll(".cc-actions button")].map((b) => b.textContent);
      return {
        locked: qb.classList.contains("cc-locked"),
        shown: !!f.querySelector(".cc-shown"),
        outcome: f.dataset.raoOutcome || null,
        tryAgain: btns.some((t) => /try again/i.test(t)),
        next: btns.some((t) => /next question/i.test(t)),
        bubbles: f.querySelectorAll(".cc-msg").length,
      };
    }, cse.idx);
    if (cap.locked && cap.shown && cap.next && !cap.tryAgain && cap.outcome === "shown-answer" && cap.bubbles >= 1)
      pass(`5f. SECOND WRONG CAPS — answer shown, no loop [${cse.name}]`, `outcome=${cap.outcome}, Next present, NO Try again, help retained (${cap.bubbles} bubble(s))`);
    else fail(`5f. SECOND WRONG CAPS [${cse.name}]`, JSON.stringify(cap));
  }
  if (errors.length) fail("zero page errors (fallback drive)", errors.join(" | "));
  else pass("zero page errors (fallback drive)");
  await page.close();
}

// ════════════════════════════════════════════════════════════════
// 7.7.3 KEYPAD: TOUCH-ONLY. On a fine-primary-pointer device (mouse — every
// desktop) the on-screen digit pad under fill-blanks inputs must be
// display:none with its space fully collapsed. Mechanism is pointer
// capability, never viewport width. (The coarse-pointer half — pad visible
// and functional under real touch — lives in verify-touch.js.)
// ════════════════════════════════════════════════════════════════
async function keypadLaws(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const src = sourceOf(path.join(ROOT, "lessons", "_type-coverage.html"))
    .replace('<div id="source">', '<div id="source">' + FALLBACK_FIXTURES);
  await page.setContent(pageFor(src), { waitUntil: "load" });

  const finePointer = await page.evaluate(() => matchMedia("(pointer: fine)").matches);
  if (finePointer) pass("7.7.3 keypad: context sanity — (pointer: fine) matches at 1280×800");
  else { fail("7.7.3 keypad: context sanity", "(pointer: fine) does not match — the desktop-hide claim cannot be tested"); await page.close(); return; }

  // gap between the task block and the next visible block, BEFORE any focus
  const gapBefore = await page.evaluate(() => {
    const f = document.querySelectorAll(".pv-frame")[0];   // injected fill-blanks fixture
    f.scrollIntoView({ block: "center" });
    const q = f.querySelector(".qbody").getBoundingClientRect();
    const foot = f.querySelector(".pv-foot").getBoundingClientRect();
    return foot.top - q.bottom;
  });
  await page.click('.pv-frame .blank-input');   // focus → ensureDigitPad show()
  await page.waitForTimeout(250);
  const st = await page.evaluate(() => {
    const f = document.querySelectorAll(".pv-frame")[0];
    const pad = document.querySelector(".rao-digitpad");
    const q = f.querySelector(".qbody").getBoundingClientRect();
    const foot = f.querySelector(".pv-foot").getBoundingClientRect();
    return {
      inDom: !!pad,
      display: pad ? getComputedStyle(pad).display : "(absent)",
      height: pad ? pad.getBoundingClientRect().height : 0,
      gapAfter: foot.top - q.bottom,
      focusedIsBlank: document.activeElement && document.activeElement.classList.contains("blank-input"),
    };
  });
  if (st.display === "none" && st.height === 0)
    pass("7.7.3 keypad: HIDDEN on fine pointer", `computed display=${st.display}, rect height=${st.height}`);
  else fail("7.7.3 keypad: HIDDEN on fine pointer", `computed display=${st.display}, rect height=${st.height} — the pad paints on a mouse device`);
  if (Math.abs(st.gapAfter - gapBefore) <= 1)
    pass("7.7.3 keypad: space fully collapsed", `task→foot gap ${Math.round(gapBefore)}px before focus, ${Math.round(st.gapAfter)}px after`);
  else fail("7.7.3 keypad: space fully collapsed", `task→foot gap grew ${Math.round(gapBefore)}px → ${Math.round(st.gapAfter)}px — a hidden pad is reserving space`);
  // physical-keyboard typing must keep working with the pad hidden
  await page.keyboard.type("14");
  const typed = await page.evaluate(() =>
    document.querySelectorAll(".pv-frame")[0].querySelector(".blank-input").value);
  if (st.focusedIsBlank && typed === "14") pass("7.7.3 keypad: physical-keyboard typing unaffected", `typed "14" into the focused blank`);
  else fail("7.7.3 keypad: physical-keyboard typing unaffected", `focused=${st.focusedIsBlank} value="${typed}"`);

  if (errors.length) fail("zero page errors (keypad drive)", errors.join(" | "));
  else pass("zero page errors (keypad drive)");
  await page.close();
}

// ════════════════════════════════════════════════════════════════
// e (static half): the demo file IS the reference. Its chatMsg fills at a
// constant the production renderer must match exactly.
// ════════════════════════════════════════════════════════════════
function checkStaticParity() {
  const demoPath = path.join(ROOT, "incoming", "calm-card-v36.html");
  if (!fs.existsSync(demoPath)) {
    fail("e. BUBBLE PARITY (reference)", "incoming/calm-card-v36.html is missing — the signed-off reference must stay in the repo");
    return;
  }
  const demo = fs.readFileSync(demoPath, "utf8");
  const cc = demo.slice(demo.indexOf('<script id="cc-script">'), demo.indexOf("</script>", demo.indexOf('<script id="cc-script">')));
  const demoMs = (cc.match(/setTimeout\(function\(\)\{[\s\S]*?\},(\d+)\);/) || [])[1];
  const prodMs = (read("engine/solution-renderer.js").match(/BUBBLE_FILL_MS\s*=\s*(\d+)/) || [])[1];
  if (demoMs && prodMs && demoMs === prodMs)
    pass("e. BUBBLE PARITY (reference constant)", `demo chatMsg fills at ${demoMs}ms; production BUBBLE_FILL_MS=${prodMs}`);
  else
    fail("e. BUBBLE PARITY (reference constant)", `demo=${demoMs}ms, production=${prodMs}ms — the signed-off timing is the contract`);
  // the avatar seat is dead CSS in the demo and must NOT exist in production
  // styles — match a RULE (selector shape), not the word in a comment
  const cardCss = read("engine/rao-card.css") + read("engine/rao.css");
  if (/\.cc-ava\s*[,{.:\s]*\{/.test(cardCss)) fail("e. faceless bubbles", "a .cc-ava rule exists in production CSS — the avatar seat must not ship");
  else pass("e. faceless bubbles", "no .cc-ava rule in production CSS");
}

// ════════════════════════════════════════════════════════════════
// a. ANSWER-LEAK — the whole corpus, every select-type question.
// Each option is snapshotted at rest; after a wrong attempt every option
// must still computed-equal its snapshot (no green, no dim, no recolor),
// and no .explain / reveal text may be visible inside the card.
// ════════════════════════════════════════════════════════════════
const SWEEP = `(async () => {
  const out = { checked: 0, skipped: 0, leaks: [] };
  const css = (el) => { const c = getComputedStyle(el); return c.borderColor + "|" + c.backgroundColor + "|" + c.color + "|" + c.opacity + "|" + c.filter; };
  const frames = [...document.querySelectorAll(".pv-frame")];
  for (const f of frames) {
    const beh = f.dataset.behavior;
    if (beh !== "single-select" && beh !== "multi-select") continue;
    const qbody = f.querySelector(".qbody");
    const check = f.querySelector(".pv-check");
    const opts = [...f.querySelectorAll(".opt, .opt-fig, .hcell")];
    if (!qbody || !check || !opts.length) { out.skipped++; continue; }
    let ans; try { ans = JSON.parse(f.dataset.answer || "[]").map(String); } catch (e) { ans = []; }
    const wrong = opts.find((o) => {
      const v = String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim());
      return ans.indexOf(v) === -1;
    });
    if (!wrong) { out.skipped++; continue; }          // no distractor to try
    const rest = opts.map(css);                        // resting snapshot, pre-selection
    const promptEl = qbody.querySelector(".prompt");
    const promptRest = promptEl ? css(promptEl) : null;
    wrong.click();
    check.click();                                     // wrong attempt — question still attemptable
    const iq = (f.id || "") + " q" + (frames.indexOf(f) + 1);
    opts.forEach((o, i) => {
      if (css(o) !== rest[i]) out.leaks.push(iq + ": option " + (o.dataset.val || i) + " changed paint after a wrong attempt (" + rest[i] + " -> " + css(o) + ")");
    });
    if (promptEl && css(promptEl) !== promptRest) out.leaks.push(iq + ": PROMPT changed paint after a wrong attempt");
    const ex = qbody.querySelector(".explain");
    if (ex && getComputedStyle(ex).display !== "none") out.leaks.push(iq + ": .explain visible while attemptable");
    const card = f.querySelector(".pv-card");
    if (/✓\\s*Answer/.test(card.textContent)) out.leaks.push(iq + ": reveal text inside the card");
    out.checked++;
  }
  return out;
})()`;

async function sweepCorpus(browser) {
  const files = collectLessons(path.join(ROOT, "lessons"));
  // Same guard as harness.js: a sweep that silently sees a shrunken corpus is
  // worse than no sweep — every "green" it prints would be a lie.
  const MIN_LESSONS = 100;
  if (files.length < MIN_LESSONS) {
    fail("a. ANSWER-LEAK (corpus discovery)", `found only ${files.length} lesson files, expected >= ${MIN_LESSONS} — discovery is broken`);
    return;
  }
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  let checked = 0, leaks = [], lessons = 0;
  for (const f of files) {
    let src;
    try { src = sourceOf(f); } catch (e) { continue; }
    await page.setContent(pageFor(src), { waitUntil: "load" });
    // The sweep reads computed style synchronously after Check. .opt paints are
    // CSS-transitioned, and a transition reports its STARTING value at t=0 — a
    // leak could hide inside the transition window. Transitions off = we read
    // the FINAL paint, which is what the child ends up seeing. (The live-timing
    // and immutability drives in fixtureLaws keep real transitions + waits.)
    await page.addStyleTag({ content: "#preview *{transition:none !important;animation:none !important}" });
    const r = await page.evaluate(SWEEP);
    checked += r.checked; lessons++;
    r.leaks.forEach((l) => leaks.push(path.basename(f) + " " + l));
  }
  await page.close();
  if (leaks.length) {
    fail("a. ANSWER-LEAK (corpus)", `${leaks.length} leak(s) across ${lessons} lessons / ${checked} select questions`);
    leaks.slice(0, 12).forEach((l) => console.log(`        ${C.r}·${C.x} ${l}`));
    if (leaks.length > 12) console.log(`        ${C.d}… and ${leaks.length - 12} more${C.x}`);
  } else {
    pass("a. ANSWER-LEAK (corpus)", `${checked} select questions across ${lessons} lessons — zero green, zero reveals, zero repaints on wrong`);
  }
}

// ════════════════════════════════════════════════════════════════
// g. EXPLAIN (Brief 7.6.1, rao-master-17; reveal amended by BRIEF-INTERACTION-
// CONFORM-1 item 4 / rule 13) — the frontmatter `explain:` form must still
// render exactly like markup <p class="explain">, and markup must win when both
// exist (the element is retained as an inert hidden carrier). But it NO LONGER
// reveals on a correct answer — rule 13 removed the explain LINE from the product,
// so .explain stays display:none in every state, both authoring forms alike.
// ════════════════════════════════════════════════════════════════
function loadEngineNode() {
  global.window = {};
  // eslint-disable-next-line no-eval
  eval(read("engine/preview-engine.js"));
  return global.window.RaoPreview;
}
const normWs = (s) => String(s).replace(/\s+/g, " ").trim();

// Pair each <!--@q --> comment with its markup chunk so we know, per question,
// which authoring form(s) carry the explanation.
function scanExplainForms(source) {
  const chunks = source.split(/(?=<!--@q)/).filter((c) => c.startsWith("<!--@q"));
  return chunks.map((chunk) => {
    const end = chunk.indexOf("-->");
    const fmBody = chunk.slice(0, end);
    const markup = chunk.slice(end + 3);
    const fmMatch = /^\s*explain\s*:\s*(\S.*)$/m.exec(fmBody);
    const mkMatch = /<p class="explain">([\s\S]*?)<\/p>/.exec(markup);
    return {
      fmText: fmMatch ? fmMatch[1].trim() : null,
      mkText: mkMatch ? normWs(mkMatch[1]) : null,
    };
  });
}

async function explainLaws(browser) {
  const engine = loadEngineNode();
  const files = collectLessons(path.join(ROOT, "lessons"));
  let fmOnly = 0, both = 0, markupOnly = 0;
  const missing = [];      // fm-only questions whose built DOM lacks .explain
  const precedence = [];   // both-form questions where markup did not win
  const revealTargets = []; // {file, indexes[]} for the browser drive

  for (const f of files) {
    let src;
    try { src = sourceOf(f); } catch (e) { continue; }
    const forms = scanExplainForms(src);
    let built;
    try { built = engine.build(src); } catch (e) { fail("g. EXPLAIN (corpus scan)", `${path.basename(f)}: build threw ${e.message}`); continue; }
    if (built.length !== forms.length) {
      fail("g. EXPLAIN (corpus scan)", `${path.basename(f)}: ${forms.length} @q comments but ${built.length} built questions — cannot align, refusing to guess`);
      continue;
    }
    const idxs = [];
    forms.forEach((form, i) => {
      const m = built[i].markup;
      if (form.fmText && !form.mkText) {
        fmOnly++;
        idxs.push(i);
        const snippet = normWs(form.fmText).slice(0, 30);
        if (!m.includes('class="explain"') || !normWs(m).includes(snippet)) {
          missing.push(`${path.basename(f)} q${i + 1}`);
        }
      } else if (form.fmText && form.mkText) {
        both++;
        const mkSnip = form.mkText.slice(0, 25);
        const fmSnip = normWs(form.fmText).slice(0, 25);
        if (!normWs(m).includes(mkSnip) || normWs(m).includes(fmSnip)) {
          precedence.push(`${path.basename(f)} q${i + 1} (markup "${mkSnip}" must render; frontmatter "${fmSnip}" must not)`);
        }
      } else if (form.mkText) {
        markupOnly++;
      }
    });
    if (idxs.length) revealTargets.push({ file: f, idxs, src });
  }

  if (missing.length) {
    const byFile = {};
    missing.forEach((m) => { const k = m.split(" q")[0]; byFile[k] = (byFile[k] || 0) + 1; });
    fail("g. EXPLAIN PARITY (built DOM)",
      `${missing.length} frontmatter-explain question(s) missing/mismatched .explain in the built DOM: ` +
      Object.entries(byFile).map(([k, n]) => `${k} (${n})`).join(", "));
  } else {
    pass("g. EXPLAIN PARITY (built DOM)", `${fmOnly} frontmatter-only explain(s) all emit <p class="explain"> (plus ${markupOnly} markup-only)`);
  }
  if (both === 0) {
    fail("g. EXPLAIN PRECEDENCE", "no corpus question authors BOTH forms — the precedence rule is untestable (the fixture must carry one)");
  } else if (precedence.length) {
    fail("g. EXPLAIN PRECEDENCE", precedence.join(" · "));
  } else {
    pass("g. EXPLAIN PRECEDENCE (markup wins)", `${both} both-form question(s), markup text rendered, frontmatter text absent`);
  }

  // ── the reveal, live: correct answer → .explain visible (legacy) or
  //    suppressed by cc-hastake when the takeaway carried the teaching ──
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
  let driven = 0, revealOk = 0;
  const revealFails = [];
  for (const t of revealTargets) {
    await page.setContent(pageFor(t.src), { waitUntil: "load" });
    const recs = await page.evaluate(async (targets) => {
      const out = [];
      const frames = [...document.querySelectorAll(".pv-frame")];
      const fire = (n, ty) => n.dispatchEvent(new Event(ty, { bubbles: true }));
      // answer entry — same technique as harness.js FILL, trimmed to the
      // behaviors that carry explains in this corpus
      function fill(el, behavior, A) {
        if (behavior === "single-select" || behavior === "multi-select") {
          const opts = [...el.querySelectorAll(".opt")];
          opts.forEach((o) => { if (o.classList.contains("is-sel")) o.click(); });
          let hit = 0;
          A.forEach((v) => { const o = opts.find((x) => (x.dataset.val ?? x.textContent.trim()) === v); if (o) { o.click(); hit++; } });
          return hit === A.length;
        }
        if (behavior === "fill-blanks" || behavior === "expression") {
          const ins = [...el.querySelectorAll(".blank-input, input[type=text], .ans-input")];
          if (!ins.length) return false;
          ins.forEach((inp, i) => { inp.value = A[i] ?? ""; fire(inp, "input"); fire(inp, "change"); });
          return true;
        }
        if (behavior === "order") {
          const slots = [...el.querySelectorAll(".order-slot")], bank = [...el.querySelectorAll(".tile")];
          if (!slots.length || !bank.length) return false;
          A.forEach((v, i) => {
            const tl = bank.find((x) => (x.dataset.val ?? x.textContent.trim()) === v && !x.dataset.__used);
            if (tl && slots[i]) { tl.dataset.__used = "1"; slots[i].appendChild(tl); slots[i].classList.add("filled"); }
          });
          return true;
        }
        if (behavior === "sequence-build") {
          const slots = [...el.querySelectorAll(".sb-slot")], palette = [...el.querySelectorAll(".sb-tile")];
          if (!slots.length || !palette.length) return false;
          A.forEach((v, i) => {
            const srcT = palette.find((x) => (x.dataset.val ?? x.textContent.trim()) === v);
            if (srcT && slots[i]) { const c = srcT.cloneNode(true); c.classList.add("placed"); slots[i].innerHTML = ""; slots[i].appendChild(c); slots[i].classList.add("filled"); }
          });
          return true;
        }
        if (behavior === "categorize") {
          const tiles = [...el.querySelectorAll(".vs-tile, .tiles li, .tile")], zones = [...el.querySelectorAll("[data-region]")];
          if (!tiles.length || !zones.length) return false;
          A.forEach((region, i) => { const z = zones.find((x) => x.dataset.region === region); if (tiles[i] && z) z.appendChild(tiles[i]); });
          return true;
        }
        return false;
      }
      for (const i of targets) {
        const f = frames[i];
        const behavior = f.dataset.behavior;
        let answer; try { answer = JSON.parse(f.dataset.answer || "[]").map(String); } catch (e) { answer = []; }
        let solution = null; try { solution = JSON.parse(f.dataset.solution || "null"); } catch (e) { solution = null; }
        const hasTake = !!(solution || []).find((b) => b && b.type === "takeaway");
        const hasSolution = !!(solution && solution.length);
        const qbody = f.querySelector(".qbody");
        const ex = qbody && qbody.querySelector(".explain");
        const rec = { i: i + 1, behavior, hasTake, hasSolution, exists: !!ex, before: null, after: null, filled: false, outcome: null, panel: false, hastake: false, winPaint: false };
        if (!ex) { out.push(rec); continue; }
        rec.before = getComputedStyle(ex).display;
        rec.filled = fill(qbody, behavior, answer) !== false;
        const chk = f.querySelector(".pv-check");
        if (chk) chk.click();
        await new Promise((r) => setTimeout(r, 750));   // celebrate's 550ms beat
        rec.after = getComputedStyle(ex).display;
        rec.outcome = f.dataset.raoOutcome || null;
        rec.panel = !!f.querySelector(".cc-take");
        rec.hastake = qbody.classList.contains("cc-hastake");
        rec.winPaint = !!f.querySelector(".cc-win");
        out.push(rec);
      }
      return out;
    }, t.idxs);
    for (const r of recs) {
      driven++;
      const isSel = r.behavior === "single-select" || r.behavior === "multi-select";
      // AMENDED by BRIEF-INTERACTION-CONFORM-1 item 4 (rule 13, RULED 2026-07-23):
      // THE EXPLAIN LINE IS REMOVED FROM THE PRODUCT. It no longer reveals on a
      // correct answer in ANY mode — the reveal CSS is gone, so .explain stays
      // display:none in every state. The old law revealed it for legacy (no-
      // solution) questions (wantAfter "block"); that is repealed. It stays "none".
      const wantAfter = "none";
      // RE-POINTED by BRIEF-G3-ENGINE-1 Change 4 (Item 65; REVERSES the takeaway
      // panel) and again by item 4 above. This asserts:
      //   (a) NO .cc-take panel ever (the panel is gone);
      //   (b) .explain stays hidden ("none") on correct — rule 13, all forms;
      //   (c) cc-hastake present iff a solution exists (unchanged — it still seals
      //       .explain, now redundantly with the removed reveal, harmless);
      //   (d) selects keep the green .cc-win (correct is still loud).
      const ok = r.exists && r.before === "none" && r.filled && r.outcome === "correct" &&
                 !r.panel && r.after === wantAfter && (r.hastake === r.hasSolution) && (!isSel || r.winPaint);
      if (ok) revealOk++;
      else revealFails.push(`${path.basename(t.file)} q${r.i} (${r.behavior}): ${JSON.stringify(r)}`);
    }
  }
  await page.close();
  if (revealFails.length) {
    fail("g. EXPLAIN REVEAL (live)", `${revealFails.length}/${driven} failed`);
    revealFails.slice(0, 6).forEach((l) => console.log(`        ${C.r}·${C.x} ${l}`));
  } else {
    pass("g. EXPLAIN REVEAL (live)",
      `${revealOk}/${driven} frontmatter-explain questions: hidden before Check; correct → NO .cc-take panel, ` +
      `.explain STAYS hidden in every state (rule 13: the explain line is removed), green .cc-win on selects`);
  }
}

// ════════════════════════════════════════════════════════════════
// b/c/d/e/f — driven on the _type-coverage ladder fixture.
// ════════════════════════════════════════════════════════════════
async function fixtureLaws(browser) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(pageFor(sourceOf(path.join(ROOT, "lessons", "_type-coverage.html"))), { waitUntil: "load" });
  await page.evaluate(() => {
    const fr = document.querySelectorAll(".pv-frame");
    fr[fr.length - 1].id = "fx";
    // spy on check() for the lock-on-open law
    window.__checkCalls = 0;
    const orig = window.RaoPreview.check;
    window.RaoPreview.check = function () { window.__checkCalls++; return orig.apply(this, arguments); };
  });

  const snap = () => page.evaluate(() => {
    const f = document.getElementById("fx");
    const css = (el) => { const c = getComputedStyle(el); return c.borderColor + "|" + c.backgroundColor + "|" + c.color + "|" + c.opacity + "|" + c.filter; };
    return {
      prompt: css(f.querySelector(".prompt")),
      opts: [...f.querySelectorAll(".opt")].map((o) => ({ val: o.dataset.val, s: css(o) })),
    };
  });

  // ── c: snapshot in ANSWERING state (pre-selection = resting task) ──
  const answering = await snap();

  // instrument bubble timing + mutation before anything types
  await page.evaluate(() => {
    window.__bubbleLog = [];   // {createdAt, filledAt}
    window.__mutationsToEarlier = 0;
    const chatObserver = new MutationObserver((recs) => {
      for (const r of recs) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1 && n.classList.contains("cc-msg")) {
            const entry = { createdAt: performance.now(), filledAt: null, node: n };
            window.__bubbleLog.push(entry);
            const mo = new MutationObserver(() => {
              if (!entry.filledAt && !n.querySelector(".cc-dots")) {
                entry.filledAt = performance.now();
                // after the single fill, ANY further mutation to this bubble is a violation
                setTimeout(() => {
                  mo.disconnect();
                  const late = new MutationObserver((mrs) => { window.__mutationsToEarlier += mrs.length; });
                  late.observe(n, { childList: true, subtree: true, characterData: true, attributes: true });
                }, 0);
              }
            });
            mo.observe(n, { childList: true, subtree: true });
          }
        }
      }
    });
    chatObserver.observe(document.getElementById("fx"), { childList: true, subtree: true });
  });

  // ── hint 1 (pre-attempt); the wrong AUTO-TYPES hint 2; hint 3 exhausts ──
  // AMENDED 2026-07-24 (BRIEF-WHYWRONG-OFF-1, ruled by Venkat): whyWrong is OFF
  // product-wide, so the wrong attempt types the next FORWARD RUNG instead of a
  // "Not quite" bubble — one manual rung then exhausts the 3-rung ladder.
  await page.click("#fx .pv-hint");
  await page.waitForTimeout(FILL_WAIT);
  const d1 = await page.evaluate(() => document.querySelectorAll("#fx .cc-msg").length);

  // wrong attempt
  await page.click('#fx .opt[data-val="130,000"]');
  await page.click("#fx .pv-check");
  await page.waitForTimeout(FILL_WAIT);
  const wrongState = await snap();

  // ── a (fixture): wrong state must equal answering state exactly (also c) ──
  const diffs = [];
  if (wrongState.prompt !== answering.prompt) diffs.push("prompt");
  answering.opts.forEach((o, i) => { if (wrongState.opts[i].s !== o.s) diffs.push("option " + o.val); });
  if (diffs.length) fail("c. TASK-IMMUTABILITY (wrong state)", `changed paint: ${diffs.join(", ")}`);
  else pass("c. TASK-IMMUTABILITY (wrong state)", "prompt + all options computed-identical to answering state");

  // ── d: rung 1 still visible after rung 2 ──
  const d2 = await page.evaluate(() => {
    const msgs = [...document.querySelectorAll("#fx .cc-msg")];
    return {
      count: msgs.length,
      allVisible: msgs.every((m) => m.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(m).opacity) > 0.99),
    };
  });
  if (d2.count === d1 + 1 && d2.allVisible) pass("d. ACCUMULATION (hints)", `rung 1 still visible under rung 2 (${d2.count} bubbles, full opacity)`);
  else fail("d. ACCUMULATION (hints)", JSON.stringify(d2));

  // hint state: one more rung, then re-check accumulation AND immutability.
  // (The rung count is asserted at EVERY stage — a giveHint that clears the
  // chat before typing must fail HERE, not just via a side effect elsewhere.)
  const clickRow = (re) => page.evaluate((src) => {
    const b = [...document.querySelectorAll("#fx .cc-actions button")].find((x) => new RegExp(src).test(x.textContent));
    if (b) b.click();
    return b ? true : [...document.querySelectorAll("#fx .cc-actions button")].map((x) => x.textContent);
  }, re.source);
  const r1 = await clickRow(/Give one more hint/);
  if (r1 !== true) fail("fixture drive", `expected a "Give one more hint" row button; row = ${JSON.stringify(r1)} (a bubble that never filled leaves the row unbuilt)`);
  await page.waitForTimeout(FILL_WAIT);
  const d3 = await page.evaluate(() => {
    const msgs = [...document.querySelectorAll("#fx .cc-msg")];
    return {
      count: msgs.length,
      allVisible: msgs.every((m) => m.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(m).opacity) > 0.99),
    };
  });
  if (d3.count === d2.count + 1 && d3.allVisible) pass("d. ACCUMULATION (forward rung)", `rungs 1+2 still visible under rung 3 (${d3.count} bubbles)`);
  else fail("d. ACCUMULATION (forward rung)", `expected ${d2.count + 1} bubbles all visible, got ${JSON.stringify(d3)}`);
  const hintState = await snap();
  const hDiffs = [];
  if (hintState.prompt !== answering.prompt) hDiffs.push("prompt");
  answering.opts.forEach((o, i) => { if (hintState.opts[i].s !== o.s) hDiffs.push("option " + o.val); });
  if (hDiffs.length) fail("c. TASK-IMMUTABILITY (hint state)", `changed paint: ${hDiffs.join(", ")}`);
  else pass("c. TASK-IMMUTABILITY (hint state)", "identical again");

  // hints are now EXHAUSTED (rung 2 auto-typed on the wrong, rung 3 above) —
  // the walkthrough is already offered; no further hint button may exist.
  // (AMENDED by BRIEF-WHYWRONG-OFF-1 — the old drive needed a second manual
  // rung here because the wrong used to type a whyWrong instead of a rung.)
  const noMoreHint = await page.evaluate(() =>
    ![...document.querySelectorAll("#fx .cc-actions button")].some((b) => /Give one more hint/.test(b.textContent || "")));
  if (noMoreHint) pass("ladder exhausted after the auto-rung + one manual rung (WHYWRONG-OFF)");
  else fail("ladder exhaustion (BRIEF-WHYWRONG-OFF-1)", 'a "Give one more hint" button survived a fully-delivered ladder');

  // Change 3 (Item 63) clears the accumulated hint/whyWrong bubbles when the
  // solution opens — so capture the hint chips HERE, while they still exist, for
  // the HINT-LABEL BAN (f) below (it used to sample them after the open).
  const preOpenHintChips = await page.evaluate(() => {
    const f = document.getElementById("fx");
    return [...f.querySelectorAll(".cc-schip")].filter((c) => !c.closest(".pv-solwrap")).map((c) => c.textContent);
  });

  // ── b: LOCK-ON-OPEN ──  RE-POINTED by BRIEF-G3-ENGINE-1 Change 1: the button is
  // now "Show me the solution". STRICTER — also assert the OLD label appears
  // NOWHERE in rao-card.js (a second condition where the repealed law had one).
  if (!/Walk me through it/.test(require("fs").readFileSync(require("path").join(ROOT, "engine/rao-card.js"), "utf8")))
    pass("b. LABEL — old 'Walk me through it' absent from rao-card.js");
  else fail("b. LABEL — old label lingers", "'Walk me through it' still in rao-card.js");
  const checksBefore = await page.evaluate(() => window.__checkCalls);
  const r3 = await clickRow(/Show me the solution/);
  if (r3 !== true) {
    fail("b. LOCK-ON-OPEN", `"Show me the solution" never appeared; row = ${JSON.stringify(r3)}`);
    await page.close();
    return;
  }
  const atOpen = await page.evaluate(() => {
    const f = document.getElementById("fx");
    return {
      outcome: f.dataset.raoOutcome,
      recorded: (window.__raoOutcomes || []).map((o) => o.outcome),
      inert: f.querySelector(".qbody").inert,
      footHidden: getComputedStyle(f.querySelector(".pv-foot")).display === "none",
      retryControls: [...f.querySelectorAll("button")].filter((b) => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && /try again|try now|i've got it|retry/i.test(b.textContent || "");
      }).map((b) => b.textContent),
    };
  });
  if (atOpen.inert && atOpen.footHidden && atOpen.outcome === "solved-with-help" &&
      atOpen.recorded.includes("solved-with-help") && !atOpen.recorded.includes("correct") &&
      atOpen.retryControls.length === 0)
    pass("b. LOCK-ON-OPEN", "locked immediately; solved-with-help recorded, not correct; zero retry controls");
  else fail("b. LOCK-ON-OPEN", JSON.stringify(atOpen));

  // walkthrough state immutability + step accumulation to step 3
  await page.waitForTimeout(FILL_WAIT);
  await page.click("#fx .sol-next");
  await page.waitForTimeout(FILL_WAIT);
  await page.click("#fx .sol-next");
  await page.waitForTimeout(FILL_WAIT);
  const walkState = await snap();
  const wDiffs = [];
  if (walkState.prompt !== answering.prompt) wDiffs.push("prompt");
  answering.opts.forEach((o, i) => { if (walkState.opts[i].s !== o.s) wDiffs.push("option " + o.val); });
  if (wDiffs.length) fail("c. TASK-IMMUTABILITY (walkthrough, pre-reveal)", `changed paint: ${wDiffs.join(", ")}`);
  else pass("c. TASK-IMMUTABILITY (walkthrough, pre-reveal)", "identical at step 3 of the walkthrough");

  const steps3 = await page.evaluate(() => {
    const msgs = [...document.querySelectorAll("#fx .pv-solwrap .cc-msg")];
    return {
      count: msgs.length,
      allVisible: msgs.every((m) => m.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(m).opacity) > 0.99),
      chips: [...document.querySelectorAll("#fx .pv-solwrap .cc-schip")].map((c) => c.textContent),
    };
  });
  if (steps3.count === 3 && steps3.allVisible) pass("d. ACCUMULATION (walkthrough)", `steps 1 and 2 still visible at step 3 (${steps3.chips.join(", ")})`);
  else fail("d. ACCUMULATION (walkthrough)", JSON.stringify(steps3));

  // the walkthrough never called check()
  const checksAfter = await page.evaluate(() => window.__checkCalls);
  if (checksAfter === checksBefore) pass("b. walkthrough grading firewall", `check() calls stayed at ${checksAfter}`);
  else fail("b. walkthrough grading firewall", `check() calls grew ${checksBefore} → ${checksAfter}`);

  // ── e: live timing + append-only ──
  const bubbleStats = await page.evaluate(() => ({
    fills: window.__bubbleLog.filter((b) => b.filledAt != null).map((b) => Math.round(b.filledAt - b.createdAt)),
    unfilled: window.__bubbleLog.filter((b) => b.filledAt == null).length,
    mutationsToEarlier: window.__mutationsToEarlier,
    count: window.__bubbleLog.length,
  }));
  const offTiming = bubbleStats.fills.filter((ms) => ms < 600 || ms > 700);
  // count floor 7 → 6 (BRIEF-WHYWRONG-OFF-1): the whyWrong bubble no longer
  // exists — 3 hint bubbles + 3 walkthrough steps is the full stream.
  if (bubbleStats.count >= 6 && offTiming.length === 0)
    pass("e. BUBBLE PARITY (live timing)", `${bubbleStats.fills.length} bubbles filled dots→content in [${Math.min(...bubbleStats.fills)}–${Math.max(...bubbleStats.fills)}]ms (650±50 required)`);
  else fail("e. BUBBLE PARITY (live timing)", `fills=${JSON.stringify(bubbleStats.fills)} offTiming=${JSON.stringify(offTiming)} count=${bubbleStats.count}`);
  if (bubbleStats.mutationsToEarlier === 0)
    pass("e. BUBBLE PARITY (append-only)", "MutationObserver saw ZERO mutations to earlier bubbles after their single fill");
  else fail("e. BUBBLE PARITY (append-only)", `${bubbleStats.mutationsToEarlier} mutation record(s) hit already-filled bubbles`);

  // ── f: HINT-LABEL BAN ──  RE-POINTED for Change 3 (Item 63): the hint bubbles
  // are CLEARED when the solution opens, so the ban is checked on the chips
  // captured BEFORE the open (preOpenHintChips). Same ban, correct sampling
  // moment — no weakening. Chip floor 4 → 3 (BRIEF-WHYWRONG-OFF-1): the
  // "Not quite" chip no longer exists; the stream is the 3 hint chips.
  const chips = preOpenHintChips;
  const banned = chips.filter((t) => /of\s+\d/.test(t));
  if (chips.length >= 3 && banned.length === 0)
    pass("f. HINT-LABEL BAN", `${chips.length} hint chips (pre-open: ${chips.join(", ")}) — none match /of\\s+\\d/`);
  else fail("f. HINT-LABEL BAN", banned.length ? `banned labels: ${banned.join(", ")}` : `only ${chips.length} chips rendered`);

  if (errors.length) fail("zero page errors (fixture drive)", errors.join(" | "));
  else pass("zero page errors (fixture drive)");
  await page.close();
}

(async () => {
  console.log(`\n${C.b}CALM CARD LAWS${C.x} — real Chromium, computed style only (Brief 7.6)\n`);
  checkStaticParity();
  const browser = await chromium.launch();
  await fixtureLaws(browser);
  await fallbackLaws(browser);
  await keypadLaws(browser);
  await explainLaws(browser);
  await sweepCorpus(browser);
  await browser.close();
  console.log(`\n${failures === 0 ? C.g + C.b + "CALM CARD: all laws hold ✅" : C.r + C.b + failures + " law(s) VIOLATED — DO NOT SHIP"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-calm crashed:", e); process.exit(1); });
