'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { handler } = require('../tools/serve-local.cjs');
async function run(chromium) {
  const server = http.createServer(handler); await new Promise(r => server.listen(4404, '127.0.0.1', r));
  let browser;
  const dir = path.resolve(__dirname, '../.scratch/browser'); fs.mkdirSync(dir, { recursive: true });
  const results = [];
  try {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
    for (const width of [390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const denied = [];
      // Defence in depth: the browser cannot reach any production service.
      await context.route('**/*', route => {
        const u = new URL(route.request().url());
        if (u.hostname === '127.0.0.1' || u.hostname === 'www.gstatic.com') return route.continue();
        denied.push(u.origin); return route.abort();
      });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:4404/crm4-login.html', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').innerText(), 'CRM4 Login');
      assert(await page.locator('#email').isVisible()); assert(await page.locator('#password').isVisible());
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false);
      await page.screenshot({ path: path.join(dir, `login-${width}.png`), fullPage: true });
      // Blocked legacy portal and original workspace routes must not execute.
      for (const p of ['crm2-login.html', 'crm3-lister.html']) {
        const response = await context.request.get('http://127.0.0.1:4404/' + p);
        assert([403, 404].includes(response.status()), p);
      }
      results.push({ width, loginVisible: true, overflow, errors, blockedExternalOrigins: [...new Set(denied)] });
      await context.close();
    }
  } finally { if (browser) await browser.close(); await new Promise(r => server.close(r)); }
  fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
}
module.exports = { run };
if (require.main === module) run(require(process.env.CRM4_PLAYWRIGHT_MODULE || 'playwright').chromium).catch(e => { console.error(e); process.exitCode = 1; });
