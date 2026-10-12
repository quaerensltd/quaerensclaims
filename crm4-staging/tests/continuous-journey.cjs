'use strict';
// Only staff identities are seeded. Every client/workflow state is created by
// the pinned authenticated handlers; Admin Firestore is used for assertions only.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
async function run() {
  Object.assign(process.env, { GCLOUD_PROJECT: 'demo-quaerens-crm4', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' });
  const service = await require('../tools/serve-callables.cjs').start();
  const db = service.runtime.db, auth = require('firebase-admin/auth').getAuth(service.runtime.app);
  const runId = require('node:crypto').randomUUID(), password = 'Synthetic-Only-927!', users = {}, pages = {}, events = [];
  const server = http.createServer(require('../tools/serve-local.cjs').handler);
  await new Promise(r => server.listen(4404, '127.0.0.1', r));
  const browser = await require(process.env.CRM4_PLAYWRIGHT_MODULE).chromium.launch({ channel: 'msedge', headless: true });
  const output = path.resolve(__dirname, '../.scratch/continuous-journey'); fs.mkdirSync(output, { recursive: true });
  let leadId, blocked = null;
  async function invoke(role, name, data = {}, expectedError) {
    const reply = await pages[role].evaluate(async ({ name, data }) => {
      const { auth, functions } = await import('/crm4-platform.js');
      await auth.authStateReady();
      const { httpsCallable } = await import('/__crm4/sdk/10.8.0/functions.js');
      try { return { result: (await httpsCallable(functions, name)(data)).data }; }
      catch(e) { return { error: e.code, message: e.message }; }
    }, { name, data: { ...(leadId ? { leadId } : {}), ...data } });
    if (expectedError) assert.equal(reply.error, 'functions/' + expectedError, JSON.stringify(reply));
    else assert(!reply.error, name + ': ' + JSON.stringify(reply));
    events.push({ role, name, outcome: expectedError || 'PASS' }); console.log(name, expectedError || 'PASS');
    return reply.result;
  }
  try {
    for (const role of ['lister', 'manager', 'closer', 'processing', 'administrator']) {
      const uid = 'journey-' + role + '-' + runId, email = uid + '@example.test';
      await auth.createUser({ uid, email, password });
      await db.collection('crm4Memberships').doc(uid).set({ active: true, workspaceId: 'CRM4', role, email, displayName: 'Synthetic ' + role });
      await db.collection('users').doc(uid).set({ role, assessmentCapabilities: ['manager', 'administrator'].includes(role) ? ['assessmentIssuer'] : [] });
      users[role] = { uid, email };
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await context.route('**/*', r => ['127.0.0.1', 'www.gstatic.com', 'cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort());
      const page = pages[role] = await context.newPage();
      await page.goto('http://127.0.0.1:4404/crm4-login.html');
      await page.locator('#email').fill(email); await page.locator('#password').fill(password); await page.locator('#submit').click();
      try { await page.waitForURL(u => !u.pathname.includes('crm4-login'), { waitUntil: 'commit' }); } catch (e) { if (!e.message.includes('ERR_ABORTED')) throw e; }
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      assert(!new URL(page.url()).pathname.includes('crm4-login'), role + ' did not sign in');
      console.log('Authenticated browser', role);
    }
    const clientEmail = 'client-' + runId + '@example.test';
    const referral = { requestId: runId, forename: 'Synthetic', surname: 'Continuous Journey', email: clientEmail, claimType: 'foam_insulation', referralSource: 'direct_enquiry' };
    const created = await invoke('lister', 'crm4ListerCreateReferralLead', referral); leadId = created.leadId; assert(leadId);
    assert.equal((await invoke('lister', 'crm4ListerCreateReferralLead', referral)).leadId, leadId);
    await invoke('closer', 'crm4ManagerUpdateLead', { action: 'APPROVE' }, 'permission-denied');
    const handoff = { appointmentDate: '2099-01-12', appointmentTime: '12:00', appointmentAgentName: 'Synthetic Onboarding' };
    await invoke('lister', 'crm4ListerSubmitToManager', handoff, 'failed-precondition');
    await invoke('lister', 'crm4AssessmentAssistantUpdateClientIdentity', { client: { firstName: 'Synthetic', lastName: 'Continuous Journey', email: clientEmail, mobile: '07700900000', address: { addressLine1: '1 Synthetic Street', town: 'Test Town', postcode: 'ZZ1 1ZZ', country: 'United Kingdom' } } });
    const extracted = await invoke('lister', 'crm4AssessmentAssistantAnalyse', { narrative: 'CRM4_SYNTHETIC_ASSESSMENT: separate installation, damp treatment and removal.', caseContext: { sameAsClientAddress: true } });
    const confirmed = await invoke('lister', 'crm4AssessmentAssistantConfirmReview', { artifactId: extracted.id, reviewedExtraction: extracted.output });
    const draft = await invoke('lister', 'crm4AssessmentAssistantGenerateDraft', { artifactId: confirmed.id });
    const final = await invoke('lister', 'crm4AssessmentAssistantFinalise'); assert.equal(final.assessmentId, draft.assessmentId);
    await invoke('lister', 'crm4ListerSubmitToManager', handoff);
    await invoke('manager', 'crm4ManagerUpdateLead', { action: 'APPROVE' });
    await invoke('manager', 'crm4ManagerSendToCloser', { closerUid: users.closer.uid, mode: 'book', appointmentDate: '2099-01-12', appointmentTime: '12:00' });
    const appointmentCompletion = { appointmentDate: '2099-01-12', appointmentTime: '12:00', appointmentStatus: 'completed' };
    await invoke('closer', 'crm4UpdateAppointment', appointmentCompletion, 'permission-denied');
    await invoke('manager', 'crm4UpdateAppointment', appointmentCompletion);
    assert.equal((await invoke('manager', 'crm4UpdateAppointment', appointmentCompletion)).idempotent, true);
    await invoke('closer', 'crm4CloserRecordClosedDeal', { paymentOptionId: 'bank_transfer_gbp_950' });
    assert.equal((await invoke('closer', 'crm4CloserRecordClosedDeal', { paymentOptionId: 'bank_transfer_gbp_950' })).idempotent, true);
    await pages.closer.goto('http://127.0.0.1:4404/agreement-generator.html?source=crm4Leads&id=' + encodeURIComponent(leadId));
    await pages.closer.waitForFunction(() => document.querySelector('#agreementText')?.value.length > 100);
    const sent = pages.closer.waitForResponse(r => r.url().endsWith('/crm4CloserSendAgreement') && r.request().method() === 'POST');
    await pages.closer.locator('#sendEmailBtn').click(); const sentResponse = await sent; assert.equal(sentResponse.status(), 200, await sentResponse.text());
    events.push({ role: 'closer', name: 'actual agreement template/PDF UI', outcome: 'PASS' });
    const lead = (await db.collection('crm4Leads').doc(leadId).get()).data();
    const signed = { agreementVersion: lead.agreementVersion, agreementDocumentId: lead.agreementDocumentId };
    await invoke('processing', 'processingMarkAgreementSigned', { ...signed, agreementVersion: 999 }, 'failed-precondition');
    await invoke('processing', 'processingMarkAgreementSigned', signed);
    const payment = await invoke('closer', 'crm4CloserPreparePaymentEmail');
    await invoke('closer', 'crm4CloserSendPaymentEmail', { previewKey: 'stale' }, 'failed-precondition');
    await invoke('closer', 'crm4CloserSendPaymentEmail', { previewKey: payment.previewKey });
    await invoke('processing', 'processingConfirmCrm2Payment', { confirmedAmount: 1, paymentReference: 'SYNTHETIC-NO-MONEY' }, 'failed-precondition');
    await invoke('processing', 'processingConfirmCrm2Payment', { confirmedAmount: 950, paymentReference: 'SYNTHETIC-NO-MONEY-' + runId });
    let slotId;
    for (let day = 1; day <= 28 && !slotId; day++) {
      const slots = await invoke('processing', 'processingPublishAdministrationOnboardingSlots', { startDate: '2099-03-' + String(day).padStart(2, '0'), startTime: '12:00', durationMinutes: 60 });
      slotId = slots.slotIds[0];
    }
    assert(slotId, 'No free synthetic rehearsal slot');
    await invoke('closer', 'crm4CloserListAdministrationOnboardingSlots');
    await invoke('closer', 'crm4CloserBookAdministrationOnboarding', { slotId });
    assert.equal((await invoke('closer', 'crm4CloserBookAdministrationOnboarding', { slotId })).idempotent, true);
    const assessment = (await db.collection('professionalAssessments').doc(draft.assessmentId).get()).data();
    assert.equal(assessment.crmLink.caseRef, leadId);
    await invoke('processing', 'paidClientGetWorkspace');
    await invoke('processing', 'paidClientActivateLogin', { password });
    for (const key of ['identityReviewed', 'loginExplained', 'uploadExplained', 'messageBoardExplained', 'notesRecorded']) await invoke('processing', 'paidClientUpdateOnboardingChecklist', { key, complete: true, notes: 'Synthetic onboarding rehearsal completed; no customer contact.' });
    const requirement = await invoke('processing', 'paidClientAddDocumentRequirement', { title: 'Synthetic invoice', description: 'Synthetic evidence only', required: true });
    await invoke('processing', 'processingCompleteAdministrationOnboarding', { notes: 'Synthetic administration completion' });
    await invoke('processing', 'paidClientUpdateEvidence', { requirementId: requirement.id, priority: 'HIGH', requested: true });
    assert(service.runtime.providerReceipts.every(r => r.delivered === false));
    console.log('CONTINUOUS JOURNEY COMPLETE', leadId);
  } catch (e) {
    blocked = e.message;
    throw e;
  } finally {
    const responsive = [];
    if (leadId) for (const role of ['lister', 'manager', 'closer', 'processing']) {
      const page = pages[role];
      const route = { lister: 'crm4-assessment-assistant.html?leadId=' + leadId, manager: 'manager-panel.html', closer: 'closer-panel.html?id=' + leadId, processing: 'processing-dashboard.html' }[role];
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      try {
        await page.goto('http://127.0.0.1:4404/' + route); await page.waitForTimeout(1200);
        for (const width of [390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 }); await page.waitForTimeout(150);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
          await page.screenshot({ path: path.join(output, role + '-' + width + '.png'), fullPage: true });
          responsive.push({ role, width, overflow, errors: [...errors] });
        }
      } catch(e) { responsive.push({ role, error: e.message }); }
    }
    const providerIsolation = service.runtime.providerReceipts.every(r => r.delivered === false);
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ leadId, status: blocked ? 'BLOCKED' : 'COMPLETE', blocked, events, responsive, providerIsolation }, null, 2));
    await browser.close(); await new Promise(r => server.close(r)); await service.close();
    assert(providerIsolation, 'Capture adapter must never deliver');
  }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
