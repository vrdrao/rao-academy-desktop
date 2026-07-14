// Ad-hoc probe (not part of npm test): open each review page at a phone width and
// report any card whose content overflows the card horizontally. Flags mobile
// overflow of ANY kind — column-arithmetic, wide figures, venn, tables.
const { chromium } = require("playwright");
const { pathToFileURL } = require("url");
const fs = require("fs"), path = require("path");
const REVIEW = path.join(__dirname, "..", "review");
const WIDTH = parseInt(process.env.W || "375", 10);
(async () => {
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : fs.readdirSync(REVIEW).filter(f => f.endsWith(".html") && !f.startsWith("__"));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 1 });
  const offenders = [];
  for (const f of files) {
    const fp = path.join(REVIEW, path.basename(f));
    await p.goto(pathToFileURL(fp).href, { waitUntil: "load" });
    await p.waitForTimeout(500);
    const res = await p.evaluate(() => {
      let worst = 0, culprit = null;
      document.querySelectorAll(".pv-frame").forEach((fr, i) => {
        const card = fr.querySelector(".pv-card"); if (!card) return;
        const cr = card.getBoundingClientRect();
        const cs = getComputedStyle(card);
        const padR = parseFloat(cs.paddingRight) || 0, padL = parseFloat(cs.paddingLeft) || 0;
        const innerR = cr.right - padR, innerL = cr.left + padL;
        card.querySelectorAll("*").forEach(el => {
          const b = el.getBoundingClientRect();
          if (b.width === 0) return;
          const over = Math.max(b.right - innerR, innerL - b.left);
          if (over > worst) { worst = over; culprit = { i: i + 1, cls: el.className && el.className.toString().slice(0, 40), tag: el.tagName }; }
        });
      });
      return { worst: Math.round(worst), culprit };
    });
    if (res.worst > 3) { offenders.push({ f: path.basename(f), ...res }); }
  }
  await b.close();
  if (!offenders.length) console.log(`OVERFLOW CLEAN at ${WIDTH}px (${files.length} pages)`);
  else { console.log(`OVERFLOW at ${WIDTH}px:`); offenders.forEach(o => console.log(`  ${o.f}  +${o.worst}px  Q${o.culprit.i} <${o.culprit.tag}.${o.culprit.cls}>`)); }
})();
