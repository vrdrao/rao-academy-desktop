/* ============================================================================
   FORMAT VERIFIER — proves review/<x>.html is the lesson's content, correctly rendered.

   Lessons are now CONTENT-ONLY (just their #source) — they no longer carry an engine
   or a renderer, so they cannot be opened standalone. So for each lesson this renders
   its content THROUGH the shared pipeline (engine + engine/rao-card.js) into a temp
   review page — exactly what the app/review builder produces — and compares it, card
   by card, to the on-disk review/<x>.html. Same renderer on both sides: a mismatch
   means the on-disk review is stale or corrupt (regenerate with `npm run review`).

   Guards the contract in make-review.js. Two independent checks:

     1. DOM      — the card skeleton around every question must match exactly:
                   .pv-frame > .pv-card > [.pv-head(.pv-ring) , question , .pv-foot]
                   with a Hint button, a Check button, and the green .pv-ans line.
                   Any stray review-only chrome (.rv-card, .rv-mount, ...) fails.

     2. PIXELS   — the two pages are screenshotted at the same width and the
                   question cards are written out as PNGs for external eyeballing.

   Usage:  node tools/verify-format.js [lesson-basename ...]
           (default: every lesson that has a matching review file)
   ========================================================================== */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { build } = require("./make-review");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, ".format-diff");
const WIDTH = 900;

const BANNED = [".rv-card", ".rv-mount", ".rv-list", ".rv-bar", ".rv-type", ".rv-meta", ".rv-num"];

async function probe(page, file) {
  await page.goto("file://" + path.join(ROOT, file));
  await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 0, { timeout: 15000 })
            .catch(() => {});
  await page.waitForTimeout(1200);
  return page.evaluate((banned) => {
    const frames = [...document.querySelectorAll(".pv-frame")];
    return {
      count: frames.length,
      banned: banned.filter((s) => document.querySelector(s)),
      // structural fingerprint of every card
      cards: frames.map((f) => ({
        behavior: f.dataset.behavior || null,
        hasCard: !!f.querySelector(":scope > .pv-card"),
        hasHead: !!f.querySelector(".pv-head"),
        hasRing: !!f.querySelector(".pv-ring i"),
        ring: (f.querySelector(".pv-ring i") || {}).textContent || null,
        hasQbody: !!f.querySelector(".qbody"),
        hasHintBtn: !!f.querySelector(".pv-hint"),
        hasHintBox: !!f.querySelector(".pv-hintbox"),
        hasCheck: !!f.querySelector(".pv-check"),
        checkText: (f.querySelector(".pv-check") || {}).textContent || null,
        hasFb: !!f.querySelector(".pv-fb"),
        // the green answer line lives just AFTER the frame
        hasAns: !!(f.nextElementSibling && f.nextElementSibling.classList.contains("pv-ans")),
      })),
      // paint check: the gradient frame + the orange check button must be real
      paint: (() => {
        const fr = document.querySelector(".pv-frame");
        const ck = document.querySelector(".pv-check");
        const qb = document.querySelector(".pv-frame .qbody");
        const g = (el, p) => (el ? getComputedStyle(el)[p] : null);
        return {
          frameBg: g(fr, "backgroundImage"),
          frameRadius: g(fr, "borderRadius"),
          checkBg: g(ck, "backgroundImage"),
          checkShadow: g(ck, "boxShadow"),
          checkFont: g(ck, "fontFamily"),
          // The soft work-panel behind the question is a REAL painted surface, not
          // structure. A stale review that predates the panel (or one that drops it)
          // computes a transparent qbody here and DIFFERS from the fresh render — so
          // this must be part of the paint fingerprint, or that class of bug goes
          // green again. (Both sides render at data-theme="grape", so a current
          // review matches; only a stale/wrong background fails.)
          qbodyBg: g(qb, "backgroundColor"),
          qbodyRadius: g(qb, "borderRadius"),
        };
      })(),
    };
  }, BANNED);
}

(async () => {
  const wanted = process.argv.slice(2);
  // RECURSIVE discovery — lessons/incoming/ holds ~105 of the ~108 lessons.
  // A flat readdirSync here is the exact bug that let the harness silently
  // test 4% of the corpus for ~95 sessions (see STATUS.md); a review page
  // for an incoming/ lesson was invisible to this guard until 2026-07-15.
  const collectLessons = (dir) => {
    let out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith("_")) continue; // _preview/, _type-coverage.html
      const full = path.join(dir, e.name);
      if (e.isDirectory()) out = out.concat(collectLessons(full));
      else if (e.name.endsWith(".html")) out.push(full);
    }
    return out;
  };
  const lessons = collectLessons(path.join(ROOT, "lessons"))
    .map((f) => ({ name: path.basename(f, ".html"), file: f }))
    .filter((l) => fs.existsSync(path.join(ROOT, "review", l.name + ".html")))
    .filter((l) => !wanted.length || wanted.includes(l.name));

  // No lesson/review pairs = clean slate (all lessons wiped), not an error. When a real
  // lesson is asked for by name but its review page is missing, that IS an error.
  if (!lessons.length) {
    if (wanted.length) { console.error(`no review page for: ${wanted.join(", ")} — run  npm run review  first`); process.exit(2); }
    console.log("no lesson/review pairs to check (clean slate)"); process.exit(0);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  let failed = 0;

  for (const { name, file } of lessons) {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: 1200 } });
    // Lessons are content-only (their #source only) — they no longer self-render.
    // Render the lesson THROUGH the shared pipeline (engine + rao-card.js) into a temp
    // review, exactly as the app/review builder does, then compare it card-by-card to
    // the on-disk review page. Same renderer on both sides, so any mismatch means
    // review/<name>.html is stale or corrupt — regenerate it with `npm run review`.
    const tmp = `__vf_${name}`;
    build(file, tmp);
    const L = await probe(page, `review/${tmp}.html`);
    const R = await probe(page, `review/${name}.html`);

    const problems = [];

    if (R.banned.length) problems.push(`review-only chrome present: ${R.banned.join(", ")}`);
    if (!R.count) problems.push("review rendered ZERO .pv-frame cards");
    if (L.count !== R.count) problems.push(`card count ${L.count} (fresh) vs ${R.count} (on-disk review)`);

    // structural fingerprint, card by card
    const n = Math.min(L.count, R.count);
    for (let i = 0; i < n; i++) {
      const a = L.cards[i], b = R.cards[i];
      for (const k of Object.keys(a)) {
        if (JSON.stringify(a[k]) !== JSON.stringify(b[k]))
          problems.push(`Q${i + 1} ${k}: fresh=${JSON.stringify(a[k])} review=${JSON.stringify(b[k])}`);
      }
    }
    // paint fingerprint
    for (const k of Object.keys(L.paint)) {
      if (L.paint[k] !== R.paint[k])
        problems.push(`paint ${k}: fresh=${L.paint[k]} review=${R.paint[k]}`);
    }

    // ---- pixel compare of the question column -----------------------------
    let pct = 0;
    try {
      const shots = {};
      for (const [tag, file] of [["lesson", `review/${tmp}.html`], ["review", `review/${name}.html`]]) {
        await page.goto("file://" + path.join(ROOT, file));
        await page.waitForFunction(() => document.querySelectorAll(".pv-frame").length > 0, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1500);
        // hide the review-only summary bar so it can't offset the layout
        await page.evaluate(() => { const b = document.getElementById("rvbar"); if (b) b.style.display = "none"; });
        await page.waitForTimeout(150);
        const el = await page.$("#preview");
        shots[tag] = el ? await el.screenshot() : null;
      }
      if (shots.lesson && shots.review) {
        const A = path.join(OUT, `${name}-lesson.png`);
        const B = path.join(OUT, `${name}-review.png`);
        fs.writeFileSync(A, shots.lesson);
        fs.writeFileSync(B, shots.review);
        pct = -1; // signal: compare externally with Pillow
      }
    } catch (e) { problems.push("screenshot failed: " + e.message); }

    if (problems.length) {
      failed++;
      console.log(`\nFAIL  ${name}`);
      problems.slice(0, 12).forEach((p) => console.log("      - " + p));
      if (problems.length > 12) console.log(`      ... and ${problems.length - 12} more`);
    } else {
      console.log(`PASS  ${name}  (${R.count} cards, structure + paint identical)`);
    }
    try { fs.unlinkSync(path.join(ROOT, "review", `${tmp}.html`)); } catch (e) {}
    await page.close();
  }

  await browser.close();
  console.log(failed ? `\n${failed}/${lessons.length} FAILED` : `\nall ${lessons.length} match the lesson format`);
  process.exit(failed ? 1 : 0);
})();
