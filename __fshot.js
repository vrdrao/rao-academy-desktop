const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(process.argv[2]).href, { waitUntil: 'load' });
  await p.waitForTimeout(3000); // let the 2-pulse invite finish so we capture the RESTING state
  const frames = await p.$$('.pv-frame');
  await frames[parseInt(process.argv[4]||'0',10)].screenshot({ path: process.argv[3] });
  await b.close();
})();
