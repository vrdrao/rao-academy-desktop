#!/usr/bin/env node
/* ── verify-celebrate.js — tiered, grade-keyed celebrations + streaks ──
   BRIEF-CELEBRATE-1, ruled by Venkat 2026-07-24.

   THE RULING: Grade-4 base celebration is "pronounced"; 3 corrects in a row
   step one level up (with a flourish line from the grade profile); 5 in a row
   is "grand" (burst + confetti shower); lesson complete fires the grand
   finale regardless of streak. Sounds are per-grade WebAudio recipes in the
   same profile (audio output cannot be asserted headlessly — the guard
   asserts the profile carries all four recipes and that each tier logs its
   designated sound exactly once via the __raoCelebrateLog seam). Wrong
   answers stay silent. prefers-reduced-motion collapses every level to green
   paint + chip bounce. Particles are chrome overlay only (outside .qbody)
   and always self-remove.

   Run:  node tools/verify-celebrate.js
   Exit 0 = celebrations land as ruled. Non-zero = do not ship.
   ========================================================================== */
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

const safe = (s) => s.replace(/<\/script>/gi, "<\\/script>");
function makePage(sourceInner) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${read("engine/rao.css")}</style>
<style>${read("engine/rao-card.css")}</style>
</head><body>
<div id="source">${sourceInner}</div>
<div class="rao-lesson" data-theme="grape"><div class="pv-frame-mount" id="preview"></div></div>
<script>${safe(read("engine/preview-engine.js"))}</script>
<script>${safe(read("engine/solution-renderer.js"))}</script>
<script>${safe(read("engine/rao-card.js"))}</script>
</body></html>`;
}

const sel = (id, prompt, ans, opts, extra) => `
<!--@q
id: ${id}
type: single-select
answer: ["${ans}"]${extra || ""}
-->
<div class="question" data-type="single-select">
  <p class="prompt">${prompt}</p>
  <ul class="options">${opts.map((o) => `<li>${o}</li>`).join("")}</ul>
</div>`;

/* Page A — the streak ladder: c1..c5 correct (base, base, step-up+line, step,
   grand+line), c6 solved-with-help (reset, silent), c7 correct (base again),
   c8 correct LAST → finale. */
const SOL = `
solution:
  - type: step
    goal: Add.
    working: "2 + 2 = 4"
  - type: takeaway
    text: Count on.`;
const PAGE_A =
  sel("cel-1", "1 + 1 =", "2", ["2", "3"]) +
  sel("cel-2", "2 + 1 =", "3", ["3", "4"]) +
  sel("cel-3", "2 + 2 =", "4", ["4", "5"]) +
  sel("cel-4", "3 + 2 =", "5", ["5", "6"]) +
  sel("cel-5", "3 + 3 =", "6", ["6", "7"]) +
  sel("cel-6", "4 + 3 =", "7", ["7", "8"], SOL) +
  sel("cel-7", "4 + 4 =", "8", ["8", "9"]) +
  sel("cel-8", "5 + 4 =", "9", ["9", "10"]);

/* Page B — wrong-mid-streak reset. b4 stays unanswered so no finale fires. */
const PAGE_B =
  sel("celb-1", "1 + 1 =", "2", ["2", "3"]) +
  sel("celb-2", "2 + 1 =", "3", ["3", "4"]) +
  sel("celb-3", "2 + 2 =", "4", ["4", "5"]) +
  sel("celb-4", "3 + 2 =", "5", ["5", "6"]);

/* Page C — reduced motion. r2 stays unanswered. */
const PAGE_C =
  sel("celr-1", "1 + 1 =", "2", ["2", "3"]) +
  sel("celr-2", "2 + 1 =", "3", ["3", "4"]);

/* Bands for the chosen particle values (assert the band, not exact pixels):
   pronounced burst 20 → [15,25]; step-up 30 → [26,36]; grand adds confetti. */
const BAND_BASE = [15, 25], BAND_STEP = [26, 36];
const SETTLE = 1900;   // > longest fx TTL — used for the zero-residue asserts

async function driveCorrect(page, i, val) {
  return page.evaluate(([k, v]) => {
    const f = document.querySelectorAll(".pv-frame")[k];
    f.scrollIntoView({ block: "center" });
    const o = [...f.querySelectorAll(".opt")].find(
      (e) => String(e.dataset.val != null ? e.dataset.val : (e.textContent || "").trim()) === v);
    o.click();
    f.querySelector(".pv-check").click();
    // celebrate() runs synchronously in the click handler — sample the fx NOW.
    const fx = f.querySelector(".cc-fx");
    const fl = f.querySelector(".cc-flourish");
    return {
      bursts: f.querySelectorAll(".cc-burst").length,
      confetti: f.querySelectorAll(".cc-confetti").length,
      sparks: f.querySelectorAll(".cc-spark").length,
      flourish: fl ? (fl.textContent || "").trim() : null,
      fxPresent: !!fx,
      win: !!f.querySelector(".cc-win"),
      log: (window.__raoCelebrateLog || []).map((e) => e.sound),
    };
  }, [i, val]);
}
async function residue(page) {
  return page.evaluate(() => ({
    fx: document.querySelectorAll(".cc-fx").length,
    bursts: document.querySelectorAll(".cc-burst").length,
    confetti: document.querySelectorAll(".cc-confetti").length,
    flourish: document.querySelectorAll(".cc-flourish").length,
  }));
}
const inBand = (n, b) => n >= b[0] && n <= b[1];

(async () => {
  console.log(`\n${C.b}══ verify-celebrate — grade-keyed tiers, streaks, finale (BRIEF-CELEBRATE-1) ══${C.x}`);
  const browser = await chromium.launch();

  /* ════════ PAGE A — profile, tiers, milestones, help-reset, finale ════════ */
  {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(PAGE_A), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });

      // profile object: all four sound recipes present for grade "4"
      const prof = await page.evaluate(() =>
        (typeof CELEBRATE_PROFILES !== "undefined" && CELEBRATE_PROFILES["4"]) ? {
          base: CELEBRATE_PROFILES["4"].base,
          line3: CELEBRATE_PROFILES["4"].streak3Line,
          line5: CELEBRATE_PROFILES["4"].streak5Line,
          sounds: Object.keys(CELEBRATE_PROFILES["4"].sounds || {}).filter((k) => Array.isArray(CELEBRATE_PROFILES["4"].sounds[k]) && CELEBRATE_PROFILES["4"].sounds[k].length),
        } : null);
      if (prof && prof.base === "pronounced" && ["base", "streak3", "streak5", "finale"].every((k) => prof.sounds.includes(k)))
        pass("profile — grade 4 base 'pronounced', all four sound recipes present", prof.sounds.join(", "));
      else fail("profile — grade-4 celebration profile", JSON.stringify(prof));

      // c1 — base: pronounced burst, no shower, base sound, no flourish
      const a1 = await driveCorrect(page, 0, "2");
      if (inBand(a1.bursts, BAND_BASE) && a1.confetti === 0 && a1.flourish === null && a1.win)
        pass("correct #1 — PRONOUNCED (burst in band, no shower, no flourish)", `${a1.bursts} bursts`);
      else fail("correct #1 — pronounced base", JSON.stringify(a1));
      if (a1.log.length === 1 && a1.log[0] === "base") pass("correct #1 — base sound logged exactly once", JSON.stringify(a1.log));
      else fail("correct #1 — base sound once", JSON.stringify(a1.log));
      await page.waitForTimeout(SETTLE);
      const r1 = await residue(page);
      if (r1.fx + r1.bursts + r1.confetti + r1.flourish === 0) pass("correct #1 — zero particle nodes remain after the animation");
      else fail("correct #1 — zero residue", JSON.stringify(r1));

      // c2 — still base
      const a2 = await driveCorrect(page, 1, "3");
      if (inBand(a2.bursts, BAND_BASE) && a2.confetti === 0 && a2.flourish === null)
        pass("correct #2 — still pronounced", `${a2.bursts} bursts`);
      else fail("correct #2 — still pronounced", JSON.stringify(a2));
      await page.waitForTimeout(SETTLE);

      // c3 — streak 3: ONE LEVEL UP + flourish line + streak3 sound
      const a3 = await driveCorrect(page, 2, "4");
      if (inBand(a3.bursts, BAND_STEP) && a3.confetti === 0)
        pass("streak 3 — one level up (bigger burst, STILL no shower — grand stays reserved)", `${a3.bursts} bursts`);
      else fail("streak 3 — step-up level", JSON.stringify(a3));
      if (a3.flourish === "3 in a row!") pass("streak 3 — flourish line renders the profile's exact text", `"${a3.flourish}"`);
      else fail("streak 3 — flourish text", JSON.stringify(a3.flourish));
      if (a3.log[a3.log.length - 1] === "streak3" && a3.log.filter((s) => s === "streak3").length === 1)
        pass("streak 3 — climbing-ladder sound logged exactly once", JSON.stringify(a3.log));
      else fail("streak 3 — streak3 sound once", JSON.stringify(a3.log));
      await page.waitForTimeout(SETTLE);

      // c4 — streak 4: stays stepped, no new milestone (no flourish, base sound)
      const a4 = await driveCorrect(page, 3, "5");
      if (inBand(a4.bursts, BAND_STEP) && a4.flourish === null && a4.log[a4.log.length - 1] === "base")
        pass("streak 4 — stepped level holds, no new milestone", `${a4.bursts} bursts`);
      else fail("streak 4 — stepped, milestone-silent", JSON.stringify(a4));
      await page.waitForTimeout(SETTLE);

      // c5 — streak 5: GRAND (shower present) + line + streak5 sound
      const a5 = await driveCorrect(page, 4, "6");
      if (a5.confetti >= 30 && a5.flourish === "5 in a row!" && a5.log[a5.log.length - 1] === "streak5")
        pass("streak 5 — GRAND: confetti shower + line + level-up sound", `${a5.confetti} confetti`);
      else fail("streak 5 — grand", JSON.stringify(a5));
      await page.waitForTimeout(SETTLE);

      // c6 — solved-with-help: two wrongs → walkthrough; NO celebration, streak resets
      const logBefore = await page.evaluate(() => (window.__raoCelebrateLog || []).length);
      await page.evaluate(() => {
        const f = document.querySelectorAll(".pv-frame")[5];
        f.scrollIntoView({ block: "center" });
        [...f.querySelectorAll(".opt")].find((o) => (o.textContent || "").trim() === "8").click();
        f.querySelector(".pv-check").click();
      });
      const gotRetry = await (async () => {
        const deadline = Date.now() + 9000;
        for (;;) {
          const hit = await page.evaluate(() => {
            const f = document.querySelectorAll(".pv-frame")[5];
            return [...f.querySelectorAll(".cc-actions button")].some((b) => b.getBoundingClientRect().width > 0 && /try again/i.test(b.textContent || ""));
          });
          if (hit) return true;
          if (Date.now() > deadline) return false;
          await page.waitForTimeout(120);
        }
      })();
      if (!gotRetry) fail("help-cap drive", "no Try again after wrong #1");
      await page.evaluate(() => {
        const f = document.querySelectorAll(".pv-frame")[5];
        [...f.querySelectorAll(".cc-actions button")].find((b) => /try again/i.test(b.textContent || "")).click();
      });
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        const f = document.querySelectorAll(".pv-frame")[5];
        [...f.querySelectorAll(".opt")].find((o) => (o.textContent || "").trim() === "8").click();
        f.querySelector(".pv-check").click();
      });
      await page.waitForTimeout(800);
      const afterHelp = await page.evaluate(() => ({
        outcome: document.querySelectorAll(".pv-frame")[5].dataset.raoOutcome,
        log: (window.__raoCelebrateLog || []).length,
      }));
      if (afterHelp.outcome === "solved-with-help" && afterHelp.log === logBefore)
        pass("solved-with-help — NO celebration fires, log silent", `outcome=${afterHelp.outcome}`);
      else fail("solved-with-help — silent + reset", JSON.stringify({ afterHelp, logBefore }));

      // c7 — correct after help: back to BASE level (the reset proof)
      const a7 = await driveCorrect(page, 6, "8");
      if (inBand(a7.bursts, BAND_BASE) && a7.flourish === null && a7.log[a7.log.length - 1] === "base")
        pass("correct after help — streak was RESET (base level again)", `${a7.bursts} bursts`);
      else fail("correct after help — base level", JSON.stringify(a7));
      await page.waitForTimeout(SETTLE);

      // c8 — LAST question answered → FINALE (shower), regardless of streak (streak is 2 here)
      const a8 = await driveCorrect(page, 7, "9");
      if (a8.confetti >= 30 && a8.log[a8.log.length - 1] === "finale" && a8.log.filter((s) => s === "finale").length === 1)
        pass("lesson complete — GRAND FINALE fires (shower + finale sound, once), regardless of streak", `${a8.confetti} confetti, streak was 2`);
      else fail("lesson complete — finale", JSON.stringify(a8));
      await page.waitForTimeout(SETTLE);
      const rEnd = await residue(page);
      if (rEnd.fx + rEnd.bursts + rEnd.confetti + rEnd.flourish === 0) pass("after the finale — zero particle nodes remain anywhere");
      else fail("finale — zero residue", JSON.stringify(rEnd));

      if (errs.length === 0) pass("page A — zero page errors");
      else fail("page A — zero page errors", errs.join(" | "));
    } catch (e) { fail("page A drive", e.message); }
    finally { await page.close(); }
  }

  /* ════════ PAGE B — a wrong attempt mid-streak resets the counter ════════ */
  {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.setContent(makePage(PAGE_B), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
      await driveCorrect(page, 0, "2"); await page.waitForTimeout(SETTLE);
      await driveCorrect(page, 1, "3"); await page.waitForTimeout(SETTLE);   // streak 2
      // b3: WRONG first (resets), Try again, then correct → must be BASE, no flourish
      await page.evaluate(() => {
        const f = document.querySelectorAll(".pv-frame")[2];
        f.scrollIntoView({ block: "center" });
        [...f.querySelectorAll(".opt")].find((o) => (o.textContent || "").trim() === "5").click();
        f.querySelector(".pv-check").click();
      });
      const gotRetry = await (async () => {
        const deadline = Date.now() + 9000;
        for (;;) {
          const hit = await page.evaluate(() => {
            const f = document.querySelectorAll(".pv-frame")[2];
            return [...f.querySelectorAll(".cc-actions button")].some((b) => b.getBoundingClientRect().width > 0 && /try again/i.test(b.textContent || ""));
          });
          if (hit) return true;
          if (Date.now() > deadline) return false;
          await page.waitForTimeout(120);
        }
      })();
      if (!gotRetry) fail("page B drive", "no Try again after the wrong pick");
      await page.evaluate(() => {
        const f = document.querySelectorAll(".pv-frame")[2];
        [...f.querySelectorAll(".cc-actions button")].find((b) => /try again/i.test(b.textContent || "")).click();
      });
      await page.waitForTimeout(250);
      const b3 = await driveCorrect(page, 2, "4");
      if (inBand(b3.bursts, BAND_BASE) && b3.flourish === null && b3.log[b3.log.length - 1] === "base")
        pass("wrong mid-streak — counter RESET (3rd correct celebrates at base, no flourish)", `${b3.bursts} bursts`);
      else fail("wrong mid-streak resets", JSON.stringify(b3) + " — a streak-3 step-up here means the wrong attempt did not reset the counter");
      if (errs.length === 0) pass("page B — zero page errors");
      else fail("page B — zero page errors", errs.join(" | "));
    } catch (e) { fail("page B drive", e.message); }
    finally { await page.close(); }
  }

  /* ════════ PAGE C — prefers-reduced-motion: paint + bounce only ════════ */
  {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
    try {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setContent(makePage(PAGE_C), { waitUntil: "load" });
      await page.waitForSelector(".pv-frame .opt", { timeout: 8000 });
      const rm = await driveCorrect(page, 0, "2");
      if (rm.bursts === 0 && rm.confetti === 0 && rm.sparks === 0 && rm.win)
        pass("reduced motion — NO particles at any level; green paint + chip bounce only");
      else fail("reduced motion — particles suppressed", JSON.stringify(rm));
      if (rm.log.length === 1) pass("reduced motion — the celebration still logs its sound (audio is not motion)", JSON.stringify(rm.log));
      else fail("reduced motion — sound seam", JSON.stringify(rm.log));
      if (errs.length === 0) pass("page C — zero page errors");
      else fail("page C — zero page errors", errs.join(" | "));
    } catch (e) { fail("page C drive", e.message); }
    finally { await page.close(); }
  }

  await browser.close();
  console.log(failures
    ? `\n${C.r}${C.b}verify-celebrate: ${failures} FAILURE(S) — celebrations are not as ruled. Do not ship.${C.x}\n`
    : `\n${C.g}${C.b}verify-celebrate: all green — tiers, streaks and the finale land exactly as ruled.${C.x}\n`);
  process.exit(failures ? 1 : 0);
})();
