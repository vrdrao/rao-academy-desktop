const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 375, height: 700 }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(process.argv[2]).href, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const idx = parseInt(process.argv[4]||'0',10);
  const frames = await p.$$('.pv-frame');
  // report overflow of the vcol vs card
  const over = await p.evaluate((i)=>{
    const f=document.querySelectorAll('.pv-frame')[i];
    const card=f.querySelector('.pv-card'); const vcol=f.querySelector('.vcol');
    const cb=card.getBoundingClientRect(); const vb=vcol.getBoundingClientRect();
    return {cardW:Math.round(cb.width), vcolW:Math.round(vb.width), rightOver:Math.round(vb.right-cb.right), leftOver:Math.round(cb.left-vb.left)};
  }, idx);
  console.log('OVERFLOW', JSON.stringify(over));
  await frames[idx].screenshot({ path: process.argv[3] });
  await b.close();
})();
