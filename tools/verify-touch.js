#!/usr/bin/env node
/* ── verify-touch.js — the CALM CARD under REAL TOUCH, at phone width ──
 *
 * Playwright's mouse API gives FALSE PASSES for touch: a flow that "passes"
 * under mouse can be completely dead on a phone. Every interaction here is a
 * raw CDP `Input.dispatchTouchEvent` (touchStart → touchEnd), the same events
 * a finger produces. Viewport is 380×800.
 *
 * What it proves (Brief 7.6, rao-master-16):
 *   1. Hint bubbles — a pre-attempt Hint tap types ONE bubble; the ladder
 *      accumulates one bubble per tap; options stay live while hinting.
 *   2. Wrong is a whisper, AND THE WHISPER DOES NOT LINGER (LAW 3 as amended
 *      by BRIEF FR-1, 2026-07-19) — a wrong attempt leaves NO mark: no ✕, no
 *      cc-tried, is-sel comes off, NO pill, NO red flood; the NEXT FORWARD
 *      HINT RUNG types (whyWrong is OFF product-wide — BRIEF-WHYWRONG-OFF-1,
 *      2026-07-24; its code is still logged, analytics-only). After
 *      "Try again" the task is back to its first-attempt state (✕ ABSENT —
 *      inverted from the superseded "✕ persists" assertion, per FR-1
 *      Amendment 1 ruling 2; full state-restore proof is tools/verify-reset.js).
 *   3. Walkthrough trigger + commit (LAW 6 as amended by BRIEF FR-2,
 *      2026-07-19) — the TAP path: "Walk me through it" appears once all
 *      hints are used after a wrong attempt; opening locks the card
 *      IMMEDIATELY, records solved-with-help, and offers NO retry control
 *      anywhere. One button per step: Next step → Got it. (The second-wrong
 *      AUTO-OPEN path — two attempts is the cap — is guarded by
 *      verify-reset.js A6–A9.)
 *   4. Firewall at runtime — check() is spied; opening/stepping/finishing the
 *      walkthrough adds ZERO calls.
 *   5. Retry path — on a fresh card: wrong → "Try again" unlocks → correct
 *      answer celebrates (green + takeaway timing + "Next question →").
 *   6. Idempotency — attach() called a 2nd time mid-flow; one tap still fires
 *      handlers exactly once.
 *   7. Tap targets — every visible interactive control in the card ≥ 44×44px.
 *
 * Exit 0 = all green. Exit 1 = at least one failure (with the reason).
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

// Bubbles fill at RaoSolution.bubbles.FILL_MS (650ms) — wait comfortably past it.
const FILL_WAIT = 800;

/* Brief 7.7.2 guard fixtures — injected TEST-SIDE (never into the lesson file):
   a fill-blanks card and a select card, each with a 2-rung forward ladder and
   NO whyWrong and NO solution. They exercise the calm-wrong fallback path that
   the ladder fixture (which has whyWrong) never reaches. Injected at the TOP of
   #source so the existing "last frame = ladder fixture" selection is untouched. */
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

function buildPage() {
  const lesson = read("lessons/_type-coverage.html");
  const a = lesson.indexOf('<div id="source">');
  const b = lesson.indexOf('<div id="preview"');
  const source = lesson.slice(a, b > a ? b : undefined)
    .replace('<div id="source">', '<div id="source">' + FALLBACK_FIXTURES);
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
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

(async () => {
  console.log(`\n${C.b}TOUCH VERIFICATION${C.x} — 380×800, CDP Input.dispatchTouchEvent, calm card (Brief 7.6)\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 380, height: 800 },
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(buildPage(), { waitUntil: "load" });
  const cdp = await context.newCDPSession(page);

  // ── real touch: touchStart at the element's centre, then touchEnd ──
  async function tap(selector, which) {
    const box = await page.evaluate(([sel, idx]) => {
      const els = Array.from(document.querySelectorAll(sel)).filter((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && cs.visibility !== "hidden";
      });
      const el = idx != null ? els[idx] : els[0];
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, [selector, which == null ? null : which]);
    if (!box) throw new Error("tap target not found/visible: " + selector);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x, y: box.y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(60);
  }
  // tap the action-row / walkthrough button whose label matches `re`
  async function tapButton(scopeSel, re) {
    const idx = await page.evaluate(([sel, src]) => {
      const rx = new RegExp(src);
      const els = Array.from(document.querySelectorAll(sel)).filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
      });
      return els.findIndex((b) => rx.test(b.textContent || ""));
    }, [scopeSel, re.source]);
    if (idx < 0) throw new Error(`no visible button matching ${re} in ${scopeSel}`);
    await tap(scopeSel, idx);
  }

  // The fixture ladder question is the LAST card on the page.
  const F = await page.evaluate(() => {
    const frames = document.querySelectorAll(".pv-frame");
    const f = frames[frames.length - 1];
    f.id = "fixture";
    frames[0].id = "fb2a";   // injected fallback fixtures (Brief 7.7.2)
    frames[1].id = "fb2b";
    f.scrollIntoView();
    return frames.length;
  });
  console.log(`  fixture: card ${F} of ${F} (ladder question in _type-coverage.html)\n`);
  const S = (sel) => `#fixture ${sel}`;

  // ── 7. tap-target audit helper (≥44×44 for every visible control) ──
  async function auditTargets(stage) {
    const bad = await page.evaluate((sel) => {
      const out = [];
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || cs.display === "none") return;
        if (el.closest("[inert]")) return;   // frozen task — not tappable, not audited
        if (r.width < 44 || r.height < 44) out.push(`${el.className}: ${Math.round(r.width)}x${Math.round(r.height)}px`);
      });
      return out;
    }, S("button, .opt"));
    if (bad.length) fail(`tap targets ≥44px (${stage})`, bad.join(" · "));
    else pass(`tap targets ≥44px (${stage})`);
  }

  await auditTargets("initial");

  // ── 1. pre-attempt hint: ONE bubble types in; the task stays live ──
  await tap(S(".pv-hint"));
  await page.waitForTimeout(FILL_WAIT);
  const h1 = await page.evaluate(() => {
    const f = document.getElementById("fixture");
    return {
      bubbles: f.querySelectorAll(".cc-msg").length,
      chips: [...f.querySelectorAll(".cc-schip")].map((c) => c.textContent),
      optsLive: !f.querySelector(".qbody").inert,
      hintLabel: f.querySelector(".pv-hint").textContent,
    };
  });
  if (h1.bubbles === 1 && h1.chips[0] === "Hint 1") pass("pre-attempt Hint types ONE bubble", `chip "${h1.chips[0]}"`);
  else fail("pre-attempt hint", JSON.stringify(h1));
  if (h1.optsLive) pass("options stay live while hinting");
  else fail("options during hint", "qbody is inert after a mere hint");
  if (h1.hintLabel === "Give one more hint") pass('hint button relabels to "Give one more hint"');
  else fail("hint button label", `"${h1.hintLabel}"`);

  // ── spy on check() BEFORE any grading ──
  await page.evaluate(() => {
    window.__checkCalls = 0;
    const orig = window.RaoPreview.check;
    window.RaoPreview.check = function () { window.__checkCalls++; return orig.apply(this, arguments); };
  });

  // ── 2. wrong answer → whisper + hint fallback + code log ──
  // AMENDED 2026-07-24 (BRIEF-WHYWRONG-OFF-1, ruled by Venkat): whyWrong is
  // SWITCHED OFF product-wide — no .cc-msg-why / "Not quite" bubble may EVER
  // appear. The wrong attempt now auto-types the NEXT FORWARD RUNG ("Hint 2"
  // here, after the pre-attempt "Hint 1") — the same path every no-whyWrong
  // question takes. The rao:whywrong code log is analytics-only and MUST still
  // fire. Do not restore the "Not quite" assertions without a new dated ruling.
  const idx130 = await page.evaluate((sel) =>
    Array.from(document.querySelectorAll(sel)).findIndex((o) => (o.dataset.val || "").trim() === "130,000"), S(".opt"));
  await tap(S(".opt"), idx130);
  await tap(S(".pv-check"));
  await page.waitForTimeout(FILL_WAIT);
  const afterWrong = await page.evaluate(() => {
    const f = document.getElementById("fixture");
    const tried = f.querySelector('.opt[data-val="130,000"]');
    const rest = f.querySelector('.opt[data-val="60,000"]');
    const cs = (el) => { const c = getComputedStyle(el); return c.borderColor + "|" + c.backgroundColor + "|" + c.color + "|" + c.opacity; };
    return {
      fb: f.querySelector(".pv-fb").textContent.trim(),
      hasX: !!tried.querySelector(".cc-x"),
      triedStyleEqualsRest: cs(tried) === cs(rest),
      isSelGone: !tried.classList.contains("is-sel"),
      isWrongGone: !tried.classList.contains("is-wrong"),
      chips: [...f.querySelectorAll(".cc-schip")].map((c) => c.textContent),
      lastBubble: [...f.querySelectorAll(".cc-btxt")].pop()?.textContent || "",
      whyNodes: f.querySelectorAll(".cc-msg-why").length,
      log: (window.__raoWhyWrongLog || []).map((e) => e.code),
      rowBtns: [...f.querySelectorAll(".cc-actions button")].map((b) => b.textContent),
      inert: f.querySelector(".qbody").inert,
      checks: window.__checkCalls,
    };
  });
  if (afterWrong.fb === "") pass("no pill on wrong — the whisper carries it");
  else fail("wrong-state pill", `pv-fb reads "${afterWrong.fb}" (must be empty)`);
  // RE-INVERTED per BRIEF FR-2 (HANDOFF-24 ruling 1, reversing FR-1's
  // removal): the ✕ must be PRESENT on the tried wrong option after Check —
  // and it must CLEAR on Try Again (asserted further down, unchanged).
  if (afterWrong.hasX && afterWrong.isSelGone && afterWrong.isWrongGone) pass("tried option: ✕ PRESENT, no is-sel, no is-wrong — the whisper marks the attempt (FR-2)");
  else fail("wrong-mark presence (LAW 3 as amended by FR-2)", JSON.stringify(afterWrong));
  if (afterWrong.triedStyleEqualsRest) pass("tried option computed style == resting sibling", "border/bg/color/opacity identical");
  else fail("tried option styling", "differs from a resting option");
  // AMENDED (BRIEF-WHYWRONG-OFF-1): the wrong types the NEXT FORWARD RUNG
  // ("Hint 2" — pre-attempt Hint 1 consumed rung 1), and NO whyWrong bubble
  // exists anywhere. Three conditions: chip, rung text, zero .cc-msg-why.
  if (afterWrong.chips[1] === "Hint 2" && /digit just to the right/.test(afterWrong.lastBubble) && afterWrong.whyNodes === 0)
    pass("wrong types the next forward rung — no whyWrong bubble (WHYWRONG-OFF)", `chip "Hint 2", 0 cc-msg-why, "${afterWrong.lastBubble.slice(0, 40)}…"`);
  else fail("wrong-attempt hint fallback (BRIEF-WHYWRONG-OFF-1)", JSON.stringify({ chips: afterWrong.chips, whyNodes: afterWrong.whyNodes, last: afterWrong.lastBubble.slice(0, 60) }));
  if (afterWrong.log.includes("ESTIMATE_WRONG_VALUE")) pass("whyWrong code still logged (analytics-only stream preserved)", JSON.stringify(afterWrong.log));
  else fail("whyWrong code log (must keep firing — BRIEF-WHYWRONG-OFF-1)", JSON.stringify(afterWrong.log));
  if (afterWrong.rowBtns.join("|") === "Give one more hint|Try again")
    pass("action row after wrong", afterWrong.rowBtns.join(" / "));
  else fail("action row after wrong", JSON.stringify(afterWrong.rowBtns));
  if (afterWrong.inert) pass("task frozen in feedback state");
  else fail("feedback freeze", "qbody not inert");
  const checksAfterGrade = afterWrong.checks;

  await auditTargets("feedback row");

  // ── ladder: ONE more rung exhausts the hints; walkthrough is then offered ──
  // AMENDED (BRIEF-WHYWRONG-OFF-1): the wrong attempt consumed rung 2, so a
  // single "Give one more hint" delivers rung 3 and exhausts the ladder. The
  // stream is pure hints — no "Not quite" bubble anywhere.
  await tapButton(S(".cc-actions button"), /Give one more hint/);
  await page.waitForTimeout(FILL_WAIT);
  const ladder = await page.evaluate(() => {
    const f = document.getElementById("fixture");
    return {
      chips: [...f.querySelectorAll(".cc-schip")].map((c) => c.textContent),
      bubbles: f.querySelectorAll(".cc-msg").length,
      whyNodes: f.querySelectorAll(".cc-msg-why").length,
      rowBtns: [...f.querySelectorAll(".cc-actions button")].map((b) => b.textContent),
    };
  });
  if (ladder.bubbles === 3 && ladder.chips.join("|") === "Hint 1|Hint 2|Hint 3" && ladder.whyNodes === 0)
    pass("hint ladder accumulates — consecutive numbering, zero whyWrong bubbles (WHYWRONG-OFF)", ladder.chips.join(", "));
  else fail("ladder accumulation (BRIEF-WHYWRONG-OFF-1)", JSON.stringify(ladder));
  // RE-POINTED (Change 1): the button is now "Show me the solution". STRICTER —
  // also assert the OLD label appears NOWHERE in rao-card.js (a second condition).
  const cardSrc = read("engine/rao-card.js");
  if (ladder.rowBtns.join("|") === "Show me the solution|I’ll try now")
    pass('all hints used → "Show me the solution" appears', ladder.rowBtns.join(" / "));
  else fail("walkthrough trigger (Change 1)", JSON.stringify(ladder.rowBtns));
  if (!/Walk me through it/.test(cardSrc)) pass('old label "Walk me through it" absent from rao-card.js');
  else fail("old label lingers in rao-card.js", "'Walk me through it' still present");

  // ── 3. walkthrough: COMMIT on open, no retry anywhere, one button per step ──
  await tapButton(S(".cc-actions button"), /Show me the solution/);
  // assert the lock BEFORE the first bubble even fills — the commit is immediate
  const atOpen = await page.evaluate(() => {
    const f = document.getElementById("fixture");
    const retryish = [...f.querySelectorAll("button")].filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && /try again|try now|i've got it|retry/i.test(b.textContent || "");
    });
    return {
      outcome: f.dataset.raoOutcome,
      inert: f.querySelector(".qbody").inert,
      footHidden: getComputedStyle(f.querySelector(".pv-foot")).display === "none",
      retryControls: retryish.map((b) => b.textContent),
      recorded: (window.__raoOutcomes || []).map((o) => o.outcome),
    };
  });
  if (atOpen.outcome === "solved-with-help" && atOpen.recorded.includes("solved-with-help") && !atOpen.recorded.includes("correct"))
    pass("LOCK-ON-OPEN: recorded solved-with-help, not correct", `outcome=${atOpen.outcome}`);
  else fail("walkthrough outcome", JSON.stringify(atOpen));
  if (atOpen.inert && atOpen.footHidden) pass("question locks immediately on open");
  else fail("lock on open", JSON.stringify(atOpen));
  if (atOpen.retryControls.length === 0) pass("NO retry control exists in the walkthrough");
  else fail("retry inside walkthrough", JSON.stringify(atOpen.retryControls));

  await page.waitForTimeout(FILL_WAIT);
  await auditTargets("walkthrough open");

  // header + step chips, then advance through all 5 blocks (3 steps + takeaway + verification)
  const step1 = await page.evaluate(() => {
    const f = document.getElementById("fixture");
    const hd = f.querySelector(".pv-solwrap .cc-chat-hd");
    const chips = [...f.querySelectorAll(".pv-solwrap .cc-schip")].map((c) => c.textContent);
    return { header: hd && hd.textContent, chips };
  });
  if (step1.header === "Solution — step by step" && step1.chips.join("|") === "Step 1 of 3")
    pass("walkthrough opens at step 1 only — NOT dumped", `header "${step1.header}"`);
  else fail("walkthrough open state", JSON.stringify(step1));

  for (let k = 0; k < 4; k++) {
    await tap(S(".sol-next"));
    await page.waitForTimeout(FILL_WAIT);
  }
  const walkEnd = await page.evaluate(() => {
    const f = document.getElementById("fixture");
    const win = f.querySelector('.opt[data-val="70,000"]');
    const chips = [...f.querySelectorAll(".pv-solwrap .cc-schip")].map((c) => c.textContent);
    const msgs = [...f.querySelectorAll(".pv-solwrap .cc-msg")];
    return {
      chips,
      allVisible: msgs.every((m) => m.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(m).opacity) > 0.99),
      winGreen: getComputedStyle(win).borderColor,
      winLoud: win.classList.contains("cc-win") || !!f.querySelector(".cc-spark"),
      nextLabel: f.querySelector(".sol-next").textContent,
      checks: window.__checkCalls,
    };
  });
  if (walkEnd.chips.length === 5 && walkEnd.allVisible)
    pass("all 5 blocks revealed one-per-tap, ALL still visible at full opacity", walkEnd.chips.join(", "));
  else fail("walkthrough accumulation", JSON.stringify(walkEnd.chips));
  if (walkEnd.winGreen === "rgb(16, 185, 129)" && !walkEnd.winLoud)
    pass("final step reveals the answer QUIETLY — green, no cc-win, no sparks");
  else fail("quiet reveal", JSON.stringify({ green: walkEnd.winGreen, loud: walkEnd.winLoud }));
  if (walkEnd.nextLabel === "Got it") pass('final step button reads "Got it"');
  else fail("final button label", `"${walkEnd.nextLabel}"`);

  // ── 4. firewall at runtime: walkthrough added ZERO check() calls ──
  if (walkEnd.checks === checksAfterGrade)
    pass("RUNTIME firewall — check() calls during open/step/finish: 0", `total stayed ${walkEnd.checks}`);
  else fail("RUNTIME firewall", `check() calls grew ${checksAfterGrade} → ${walkEnd.checks} during the walkthrough`);

  await tap(S(".sol-next"));   // Got it
  await page.waitForTimeout(200);
  const afterGotIt = await page.evaluate(() => {
    const f = document.getElementById("fixture");
    return {
      inert: f.querySelector(".qbody").inert,
      row: [...f.querySelectorAll(".cc-actions button")].map((b) => b.textContent),
      outcome: f.dataset.raoOutcome,
    };
  });
  if (afterGotIt.inert && afterGotIt.outcome === "solved-with-help" && afterGotIt.row.join("|") === "Next question →")
    pass('"Got it" ends the walkthrough — card stays locked, door opens', afterGotIt.row.join(""));
  else fail("after Got it", JSON.stringify(afterGotIt));

  // ── 5. retry path on a FRESH card: wrong → Try again → correct celebration ──
  const fresh = await page.evaluate(() => {
    const frames = [...document.querySelectorAll(".pv-frame")];
    const f = frames.find((fr) => fr.dataset.behavior === "single-select" && fr.id !== "fixture" && fr.id.indexOf("fb2") !== 0);
    f.id = "fresh";
    f.scrollIntoView({ block: "center" });
    const ans = JSON.parse(f.dataset.answer)[0];
    const opts = [...f.querySelectorAll(".opt")].map((o) => o.dataset.val);
    return { ans, wrong: opts.find((v) => v !== ans) };
  });
  const S2 = (sel) => `#fresh ${sel}`;
  const wIdx = await page.evaluate(([sel, v]) =>
    Array.from(document.querySelectorAll(sel)).findIndex((o) => o.dataset.val === v), [S2(".opt"), fresh.wrong]);
  await tap(S2(".opt"), wIdx);
  await tap(S2(".pv-check"));
  await page.waitForTimeout(FILL_WAIT);
  await tapButton(S2(".cc-actions button"), /Try again/);
  await page.waitForTimeout(100);
  const unlocked = await page.evaluate(() => {
    const f = document.getElementById("fresh");
    const q = f.querySelector(".qbody");
    return {
      inert: q.inert,
      footBack: getComputedStyle(f.querySelector(".pv-foot")).display !== "none",
      xKept: !!q.querySelector(".cc-x"),                 // INVERTED (FR-1): must be false
      triedKept: !!q.querySelector(".cc-tried"),         // INVERTED (FR-1): must be false
      residualSel: !!q.querySelector(".is-sel"),         // first-attempt state = nothing selected
      bubblesKept: f.querySelectorAll(".cc-msg").length,
    };
  });
  if (!unlocked.inert && unlocked.footBack) pass('"Try again" unlocks the card');
  else fail("Try again unlock", JSON.stringify(unlocked));
  // INVERTED per BRIEF FR-1 Amendment 1 ruling 2 (was: "✕ persists for the
  // life of the question"). LAW 3 as amended: the whisper does not linger —
  // after Try Again the task carries NO ✕, NO cc-tried, NO residual selection.
  if (!unlocked.xKept && !unlocked.triedKept && !unlocked.residualSel)
    pass("✕ ABSENT after Try Again — the whisper does not linger (LAW 3 as amended, FR-1)");
  else fail("✕ absence after Try Again (LAW 3 as amended)", JSON.stringify(unlocked));

  // ── 6. idempotency under touch: 2nd attach mid-flow must not double-fire ──
  await page.evaluate(() => {
    const qbody = document.querySelector("#fresh .qbody");
    window.RaoPreview.attach(qbody, document.getElementById("fresh").dataset.behavior); // React re-mount simulation
  });
  const cIdx = await page.evaluate(([sel, v]) =>
    Array.from(document.querySelectorAll(sel)).findIndex((o) => o.dataset.val === v), [S2(".opt"), fresh.ans]);
  await tap(S2(".opt"), cIdx);
  const selState = await page.evaluate(() =>
    [...document.querySelectorAll("#fresh .opt.is-sel")].map((o) => o.dataset.val));
  if (selState.length === 1 && selState[0] === fresh.ans)
    pass("attach() idempotent under touch", `one tap after 2nd attach() = one selection (${selState[0]})`);
  else fail("attach() idempotency", `selection after tap: ${JSON.stringify(selState)}`);

  await tap(S2(".pv-check"));
  await page.waitForTimeout(FILL_WAIT);   // celebration beat 3 lands at ~550ms
  const party = await page.evaluate(([ans]) => {
    const f = document.getElementById("fresh");
    const win = f.querySelector(`.opt[data-val="${ans}"]`);
    return {
      outcome: f.dataset.raoOutcome,
      green: getComputedStyle(win).borderColor,
      othersUntouched: [...f.querySelectorAll(".opt")].filter((o) => o !== win)
        .every((o) => parseFloat(getComputedStyle(o).opacity) === 1),
      row: [...f.querySelectorAll(".cc-actions button")].map((b) => b.textContent),
    };
  }, [fresh.ans]);
  if (party.outcome === "correct" && party.green === "rgb(16, 185, 129)" && party.othersUntouched &&
      party.row.join("|") === "Next question →")
    pass("retry path: corrected answer CELEBRATES under touch", `green + "${party.row[0]}"`);
  else fail("celebration", JSON.stringify(party));

  // ── 7.7.3 KEYPAD on coarse pointer: visible AND functional under REAL
  //    touch — tap a digit, the focused blank receives it; tap backspace, it
  //    is removed. (The fine-pointer hide half lives in verify-calm.js.)
  //    Runs BEFORE the fallback drives so fb2a is still fresh. ──
  {
    const coarse = await page.evaluate(() => matchMedia("(pointer: coarse)").matches);
    if (coarse) pass("7.7.3 keypad: context sanity — (pointer: coarse) matches in the touch context");
    else fail("7.7.3 keypad: context sanity", "(pointer: coarse) does not match — touch emulation is not driving pointer media");
    await tap("#fb2a .blank-input");
    await page.waitForTimeout(300);
    const padUp = await page.evaluate(() => {
      const pad = document.querySelector(".rao-digitpad");
      return pad ? { display: getComputedStyle(pad).display, h: pad.getBoundingClientRect().height } : null;
    });
    if (padUp && padUp.display === "flex" && padUp.h > 0)
      pass("7.7.3 keypad: VISIBLE on coarse pointer", `display=${padUp.display}, height=${Math.round(padUp.h)}px`);
    else fail("7.7.3 keypad: VISIBLE on coarse pointer", JSON.stringify(padUp));
    const dIdx = await page.evaluate(() =>
      [...document.querySelectorAll(".rao-digitpad .rdp-key")].findIndex((k) => k.dataset.d === "5"));
    await tap(".rao-digitpad .rdp-key", dIdx);
    const afterDigit = await page.evaluate(() => document.querySelector("#fb2a .blank-input").value);
    if (afterDigit === "5") pass("7.7.3 keypad: tapping a digit fills the focused blank", `value="${afterDigit}"`);
    else fail("7.7.3 keypad: tapping a digit fills the focused blank", `value="${afterDigit}"`);
    const bIdx = await page.evaluate(() =>
      [...document.querySelectorAll(".rao-digitpad .rdp-key")].findIndex((k) => k.hasAttribute("data-back")));
    await tap(".rao-digitpad .rdp-key", bIdx);
    const afterBack = await page.evaluate(() => document.querySelector("#fb2a .blank-input").value);
    if (afterBack === "") pass("7.7.3 keypad: backspace removes the digit", `value=""`);
    else fail("7.7.3 keypad: backspace removes the digit", `value="${afterBack}"`);
    // blur so the pad withdraws before the fallback drives below
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
    await page.waitForTimeout(200);
  }

  // ── 7. Law 5 fallback (Brief 7.7.2): the FIRST wrong with NO fresh whyWrong
  //    must still deliver "Hint 1" (the next forward rung); the ghost label must
  //    never promise a rung it has not given. The SECOND wrong is the cap
  //    (BRIEF-PUBLISH-1 Item 50): no solution here, so it reveals the answer
  //    (shown-answer) and offers Next — no Hint 2, no "Try again" loop (that
  //    loop was the dead end Item 50 removed). Real CDP touch throughout. ──
  async function driveFallback(id, label, enterWrong, rungs) {
    const S3 = (sel) => `#${id} ${sel}`;
    const st = () => page.evaluate((fid) => {
      const f = document.getElementById(fid);
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
    }, id);

    await enterWrong();
    await tap(S3(".pv-check"));
    await page.waitForTimeout(FILL_WAIT);
    let s = await st();
    if (s.bubbles === 1 && s.allVisible && s.chips[0] === "Hint 1" && s.texts[0].includes(rungs[0]))
      pass(`fallback [${label}]: first wrong types a VISIBLE "Hint 1" (first forward rung)`, `"${s.texts[0].slice(6, 60)}"`);
    else fail(`fallback [${label}]: first wrong types a VISIBLE "Hint 1" (first forward rung)`, `bubbles=${s.bubbles} chips=${JSON.stringify(s.chips)} — the wrong feedback delivered NOTHING`);
    if (s.bubbles >= 1 && s.ghost === "Give one more hint")
      pass(`fallback [${label}]: ghost label truthful — ${s.bubbles} rung shown → "Give one more hint"`);
    else fail(`fallback [${label}]: ghost label truthful`, `${s.bubbles} rung(s) delivered but ghost=${JSON.stringify(s.ghost)} — the label promises a rung it has not given`);

    // SECOND wrong = the cap (Item 50). No solution → reveal the answer
    // (shown-answer) + "Next question →"; NO Hint 2, NO "Try again" loop. The
    // earlier bubble stays (help accumulates, Law 4).
    await tapButton(S3(".cc-actions button"), /Try again/);
    await page.waitForTimeout(120);
    await enterWrong();
    await tap(S3(".pv-check"));
    await page.waitForTimeout(FILL_WAIT);
    const cap = await page.evaluate((fid) => {
      const f = document.getElementById(fid);
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
    }, id);
    if (cap.locked && cap.shown && cap.next && !cap.tryAgain && cap.outcome === "shown-answer" && cap.bubbles >= 1)
      pass(`fallback [${label}]: second wrong CAPS — answer shown, Next, no loop (Item 50)`, `outcome=${cap.outcome}, help retained (${cap.bubbles} bubble(s))`);
    else fail(`fallback [${label}]: second wrong CAPS`, JSON.stringify(cap));
  }
  await driveFallback("fb2a", "fill-blanks", async () => {
    await page.evaluate(() => {
      document.getElementById("fb2a").scrollIntoView({ block: "center" });
      document.querySelectorAll("#fb2a .blank-input").forEach((inp) => {
        inp.value = "1"; inp.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
  }, ["Think about which doubles fact this is.", "Start at the first number and count on the second."]);
  await driveFallback("fb2b", "select, no whyWrong", async () => {
    const wI = await page.evaluate(() => {
      document.getElementById("fb2b").scrollIntoView({ block: "center" });
      return [...document.querySelectorAll("#fb2b .opt")].findIndex((o) =>
        String(o.dataset.val != null ? o.dataset.val : (o.textContent || "").trim()) === "8");
    });
    await tap("#fb2b .opt", wI);
  }, ["Count on from the bigger number.", "Picture both groups joining into one group."]);

  if (errors.length) fail("zero page errors", errors.join(" | "));
  else pass("zero page errors");

  await browser.close();

  console.log(`\n${failures === 0 ? C.g + "TOUCH: the calm card works with real touch events at 380px ✅" : C.r + failures + " touch check(s) FAILED"}${C.x}\n`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error("verify-touch crashed:", e); process.exit(1); });
