'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
async function run() {
  process.env.GCLOUD_PROJECT = 'demo-quaerens-crm4'; process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'; process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  const fixtures = await require('../tools/synthetic-fixtures.cjs').seed();
  const callables = await require('../tools/serve-callables.cjs').start();
  const server = http.createServer(require('../tools/serve-local.cjs').handler);
  await new Promise(resolve => server.listen(4404, '127.0.0.1', resolve));
  const browser = await require(process.env.CRM4_PLAYWRIGHT_MODULE || 'playwright').chromium.launch({ channel: 'msedge', headless: true });
  const results = [], output = path.resolve(__dirname, '../.scratch/browser-workflows'); fs.mkdirSync(output, { recursive: true });
  try {
    for (const role of ['manager', 'lister', 'closer', 'processing']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await context.route('**/*', route => ['127.0.0.1', 'www.gstatic.com', 'cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage(), errors = [], responses = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.url().startsWith('http://127.0.0.1') && r.status() >= 400) responses.push({ url: r.url(), status: r.status() }); });
      await page.goto('http://127.0.0.1:4404/crm4-login.html');
      await page.locator('#email').fill(fixtures.users[role].email); await page.locator('#password').fill(fixtures.users[role].password); await page.locator('#submit').click();
      try { await page.waitForURL(url => !url.pathname.includes('crm4-login'), { timeout: 15000 }); } catch {}
      await page.waitForTimeout(2000);
      if (role === 'lister') {
        await page.goto('http://127.0.0.1:4404/lister-leads.html');
        await page.locator('#createManualLeadBtn').click();
        await page.locator('#manualLeadForm [name=forename]').fill('Synthetic');
        await page.locator('#manualLeadForm [name=surname]').fill('Browser Workflow');
        const email = 'browser-' + Date.now() + '@example.test';
        await page.locator('#manualLeadForm [name=email]').fill(email);
        await page.locator('#manualLeadForm [name=claimType]').selectOption('foam_insulation');
        await page.locator('#manualLeadForm [name=referralSource]').selectOption('direct_enquiry');
        const response = page.waitForResponse(r => r.url().endsWith('/crm4ListerCreateReferralLead') && r.request().method() === 'POST');
        await page.locator('#createReferralLeadSubmit').click();
        require('node:assert/strict').equal((await response).status(), 200);
        const created = await callables.runtime.db.collection('crm4Leads').where('email', '==', email).get();
        require('node:assert/strict').equal(created.size, 1);
        await page.waitForTimeout(1500);
        await page.goto('http://127.0.0.1:4404/crm4-assessment-assistant.html?leadId=' + fixtures.assessmentLeadId);
        await page.waitForFunction(() => document.querySelector('#firstName').value === 'Synthetic');
        await page.locator('#narrative').fill('CRM4_SYNTHETIC_ASSESSMENT: installation, damp treatment and removal reported. Synthetic records only.');
        await page.locator('#sameAddress').check();
        async function action(button, callable) {
          const reply = page.waitForResponse(r => r.url().endsWith('/' + callable) && r.request().method() === 'POST');
          await page.locator(button).click();
          let response;
          try { response = await reply; } catch (error) { console.error(await page.locator('#status').innerText()); throw error; }
          require('node:assert/strict').equal(response.status(), 200, await response.text());
          return (await response.json()).result;
        }
        await action('#analyse', 'crm4AssessmentAssistantAnalyse');
        await action('#confirmReview', 'crm4AssessmentAssistantConfirmReview');
        const generated = await action('#draft', 'crm4AssessmentAssistantGenerateDraft');
        const preview = await action('#previewDraft', 'crm4AssessmentAssistantPreviewDraftPdf');
        require('node:assert/strict').equal(Buffer.from(preview.content, 'base64').subarray(0, 4).toString(), '%PDF');
        page.once('dialog', d => d.accept());
        const completed = await action('#finalise', 'crm4AssessmentAssistantFinalise');
        require('node:assert/strict').equal(completed.assessmentId, generated.assessmentId);
        require('node:assert/strict').equal(completed.status, 'COMPLETED');
        const finalPdf = await action('#downloadFinal', 'crm4AssessmentAssistantDownloadFinalPdf');
        require('node:assert/strict').equal(Buffer.from(finalPdf.content, 'base64').subarray(0, 4).toString(), '%PDF');
        require('node:assert/strict').equal(callables.runtime.providerReceipts.length, 2);
        require('node:assert/strict').ok(callables.runtime.providerReceipts.every(r => !r.delivered));
      }
      const views = [{ name: role, url: page.url() }];
      if (role === 'manager') {
        await page.goto('http://127.0.0.1:4404/manager-panel.html');
        await page.locator('[data-open-submission="' + fixtures.leadId + '"]').click();
        const approvalReply = page.waitForResponse(r => r.url().endsWith('/crm4ManagerUpdateLead') && r.request().method() === 'POST');
        await page.locator('#approveBtn').click();
        require('node:assert/strict').equal((await approvalReply).status(), 200);
        require('node:assert/strict').equal((await callables.runtime.db.collection('crm4Leads').doc(fixtures.leadId).get()).data().managerDecision, 'approved');
      }
      if (role === 'closer') {
        await page.goto('http://127.0.0.1:4404/closer-panel.html?id=crm4-synthetic-closer-lead');
        await page.locator('#administrationOnboardingDate').selectOption('2099-01-12');
        const options = await page.locator('#administrationOnboardingSlot option').evaluateAll(nodes => nodes.map(n => n.value).filter(Boolean));
        require('node:assert/strict').ok(options.length);
        await page.locator('#administrationOnboardingSlot').selectOption(options[0]);
        const bookingReply = page.waitForResponse(r => r.url().endsWith('/crm4CloserBookAdministrationOnboarding') && r.request().method() === 'POST');
        await page.locator('#bookAdministrationOnboardingBtn').click();
        require('node:assert/strict').equal((await bookingReply).status(), 200);
      }
      if (role === 'manager') views.push({ name: 'assessment', url: 'http://127.0.0.1:4404/crm4-assessment-assistant.html?leadId=' + fixtures.leadId });
      for (const view of views) {
        if (page.url() !== view.url) { await page.goto(view.url); await page.waitForTimeout(2000); }
        for (const width of [390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 }); await page.screenshot({ path: path.join(output, view.name + '-' + width + '.png'), fullPage: true });
          results.push({ role, view: view.name, width, url: page.url(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), text: (await page.locator('body').innerText()).slice(0, 700), errors: [...errors], failedResponses: [...responses] });
        }
      }
      await context.close();
    }
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); await callables.close(); }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  for (const result of results) {
    require('node:assert/strict').deepEqual(result.errors, [], result.view);
    require('node:assert/strict').deepEqual(result.failedResponses, [], result.view);
    require('node:assert/strict').equal(result.url.includes('crm4-login'), false, result.view);
    require('node:assert/strict').equal(result.overflow, false, result.view + ' ' + result.width);
  }
  // Overflow is deliberately reported separately; passing functional assertions
  // does not certify responsive parity.
}
run().catch(e => { console.error(e); process.exitCode = 1; });
