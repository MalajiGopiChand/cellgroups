const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('ERR:', err.message));
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'public/screenshot.png' });
    await browser.close();
    console.log('DONE');
  } catch (err) {
    console.error('PUPPETEER ERROR:', err.message);
  }
})();
