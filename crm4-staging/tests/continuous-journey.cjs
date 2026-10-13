'use strict';
// Only staff identities are seeded. Every client/workflow state is created by
// the pinned authenticated handlers; Admin Firestore is used for assertions only.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
async function run() {
  const manual=process.env.CRM4_JOURNEY_MODE==='manual',dualStaff=process.env.CRM4_DUAL_STAFF==='true';
  Object.assign(process.env, { GCLOUD_PROJECT: 'demo-quaerens-crm4', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099', STORAGE_EMULATOR_HOST: 'http://127.0.0.1:9199' });
  const service = await require('../tools/serve-callables.cjs').start();
  const db = service.runtime.db, auth = require('firebase-admin/auth').getAuth(service.runtime.app);
  const runId = require('node:crypto').randomUUID(), password = 'Synthetic-Only-927!', users = {}, pages = {}, events = [];
  const server = http.createServer(require('../tools/serve-local.cjs').handler);
  await new Promise(r => server.listen(4404, '127.0.0.1', r));
  const browser = await require(process.env.CRM4_PLAYWRIGHT_MODULE).chromium.launch({ channel: 'msedge', headless: true });
  const output = path.resolve(__dirname, '../.scratch/'+(dualStaff?'dual-':'')+(manual?'manual-continuous-journey':'continuous-journey')); fs.mkdirSync(output, { recursive: true });
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
      if(role==='administrator')await auth.setCustomUserClaims(uid,{platformAdmin:true});
      await db.collection('crm4Memberships').doc(uid).set({ active: true, workspaceId: 'CRM4', role, ...(dualStaff&&['lister','closer'].includes(role)?{role:'lister',roles:['lister','closer']}:{}), email, displayName: 'Synthetic ' + role });
      await db.collection('users').doc(uid).set({ role, assessmentCapabilities: ['manager', 'administrator'].includes(role) ? ['assessmentIssuer'] : [] });
      if(manual)await db.collection('users').doc(uid).set({role,assessmentCapabilities:role==='lister'?['assessmentAuthor']:role==='manager'?['assessmentIssuer','assessmentApprover']:[],assessmentCategoryAccess:['spray-foam'],assessmentWorkspaceAccess:['CRM4']});
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
    const staffInput={email:'staff-'+runId+'@example.test',displayName:'Synthetic new staff',role:'processing',workspaceId:'CRM4'};
    await invoke('manager','crm4AdminCreateUser',staffInput,'permission-denied');
    const staff=await invoke('administrator','crm4AdminCreateUser',staffInput);
    assert.equal(staff.linkReturned,false);
    await invoke('administrator','crm4AdminSendPasswordSetupEmail',{uid:staff.uid});
    await invoke('administrator','crm4AdminUpdateMembership',{uid:staff.uid,role:'processing',active:false});
    assert.equal((await auth.getUser(staff.uid)).disabled,true);
    await invoke('administrator','crm4AdminUpdateMembership',{uid:staff.uid,role:'processing',active:true});
    assert.equal((await auth.getUser(staff.uid)).disabled,false);
    await invoke('administrator','crm4AdminProvisionExistingProcessing');
    const referral = { requestId: runId, forename: 'Synthetic', surname: 'Continuous Journey', email: clientEmail, claimType: 'foam_insulation', referralSource: 'direct_enquiry' };
    const created = await invoke('lister', 'crm4ListerCreateReferralLead', referral); leadId = created.leadId; assert(leadId);
    assert.equal((await invoke('lister', 'crm4ListerCreateReferralLead', referral)).leadId, leadId);
    const callback={callbackType:'lister',callbackDate:'2099-01-10',callbackTime:'10:00',reason:'Client needs time',notes:'Synthetic callback'};
    await invoke('lister','crm4SaveCallback',callback);
    assert.equal((await invoke('lister','crm4SaveCallback',callback)).idempotent,true);
    assert((await invoke('lister','crm4ListAgenda')).callbacks.some(row=>row.leadId===leadId));
    const callbackPreview=await invoke('lister','crm4PreviewCallbackConfirmation',{callbackType:'lister'});assert(callbackPreview.previewKey);
    await invoke('lister','crm4SendCallbackConfirmation',{callbackType:'lister',previewKey:'stale'},'failed-precondition');
    await invoke('lister','crm4SendCallbackConfirmation',{callbackType:'lister',previewKey:callbackPreview.previewKey});
    assert.equal((await invoke('lister','crm4SendCallbackConfirmation',{callbackType:'lister',previewKey:callbackPreview.previewKey})).idempotent,true);
    await invoke('lister','crm4ListerSendGeneralInformationEmail');
    assert.equal((await invoke('lister','crm4ListerSendGeneralInformationEmail')).idempotent,true);
    await invoke('closer', 'crm4ManagerUpdateLead', { action: 'APPROVE' }, 'permission-denied');
    const handoff = { appointmentDate: '2099-01-12', appointmentTime: '12:00', appointmentAgentName: 'Synthetic Onboarding' };
    await invoke('lister', 'crm4ListerSubmitToManager', handoff, 'failed-precondition');
    let draft;
    if(manual){
      const createdManual=await invoke('lister','crm4ManualAssessment',{action:'create',category:'spray-foam',form:{issueSummary:'Synthetic client-reported roof concerns',financialPosition:'Unquantified pending evidence'}});
      draft={assessmentId:createdManual.id};
      await invoke('lister','crm4ManualAssessment',{action:'submit',id:createdManual.id,revision:2});
      const approved=await invoke('manager','frameworkBAssessmentApprove',{id:createdManual.id,checklist:{identity:true,facts:true,calculations:true,evidence:true,wording:true}});
      await invoke('manager','frameworkBAssessmentGenerateDocuments',{id:createdManual.id});
      await invoke('manager','frameworkBAssessmentIssue',{id:createdManual.id});
      const current=(await db.collection('professionalAssessments').doc(createdManual.id).get()).data();
      const complete={action:'complete',id:createdManual.id,versionId:approved.versionId,revision:current.revision,qarReference:current.qarReference};
      await invoke('lister','crm4ManualAssessment',complete,'permission-denied');
      await invoke('manager','crm4ManualAssessment',complete);
      assert.equal((await invoke('manager','crm4ManualAssessment',complete)).idempotent,true);
    }else{
    await invoke('lister', 'crm4AssessmentAssistantUpdateClientIdentity', { client: { firstName: 'Synthetic', lastName: 'Continuous Journey', email: clientEmail, mobile: '07700900000', address: { addressLine1: '1 Synthetic Street', town: 'Test Town', postcode: 'ZZ1 1ZZ', country: 'United Kingdom' } } });
    const extracted = await invoke('lister', 'crm4AssessmentAssistantAnalyse', { narrative: 'CRM4_SYNTHETIC_ASSESSMENT: separate installation, damp treatment and removal.', caseContext: { sameAsClientAddress: true } });
    const confirmed = await invoke('lister', 'crm4AssessmentAssistantConfirmReview', { artifactId: extracted.id, reviewedExtraction: extracted.output });
    draft = await invoke('lister', 'crm4AssessmentAssistantGenerateDraft', { artifactId: confirmed.id });
    const final = await invoke('lister', 'crm4AssessmentAssistantFinalise'); assert.equal(final.assessmentId, draft.assessmentId);
    }
    await invoke('lister', 'crm4ListerSubmitToManager', handoff);
    assert.equal((await invoke('lister','crm4ListerRetryManagerNotification')).idempotent,true);
    await invoke('manager', 'crm4ManagerUpdateLead', { action: 'APPROVE' });
    await invoke('manager', 'crm4ManagerSendToCloser', { closerUid: users.closer.uid, mode: 'book', appointmentDate: '2099-01-12', appointmentTime: '12:00' });
    const appointmentPreview=await invoke('manager','crm4ManagerPreviewAppointmentEmail');assert(appointmentPreview.previewKey);
    await invoke('manager','crm4ManagerSendAppointmentConfirmation',{appointmentDate:'2099-01-12',appointmentTime:'12:00',previewKey:appointmentPreview.previewKey});
    await invoke('lister','crm4ManagerDownloadLinkedAssessmentReport',{},'permission-denied');
    for(const role of ['manager','closer']) {
      const name=role==='manager'?'crm4ManagerDownloadLinkedAssessmentReport':'crm4CloserDownloadLinkedAssessmentReport';
      const report=await invoke(role,name);
      assert.equal(report.contentType,'application/pdf');
      const bytes=Buffer.from(report.content,'base64');
      assert.equal(bytes.subarray(0,4).toString(),'%PDF');
      assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),report.hash);
    }
    const appointmentCompletion = { appointmentDate: '2099-01-12', appointmentTime: '12:00', appointmentStatus: 'completed' };
    await invoke('closer', 'crm4UpdateAppointment', appointmentCompletion, 'permission-denied');
    await invoke('manager', 'crm4UpdateAppointment', appointmentCompletion);
    assert.equal((await invoke('manager', 'crm4UpdateAppointment', appointmentCompletion)).idempotent, true);
    await invoke('closer', 'crm4CloserRecordClosedDeal', { paymentOptionId: 'bank_transfer_gbp_950' });
    assert.equal((await invoke('closer', 'crm4CloserRecordClosedDeal', { paymentOptionId: 'bank_transfer_gbp_950' })).idempotent, true);
    assert((await invoke('closer','crm4CloserPreviewAgreementEmail',{emailBody:'Synthetic agreement preview only.'})).html);
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
    const onboardingPreview=await invoke('closer','crm4CloserPreviewAdministrationOnboardingConfirmation');assert(onboardingPreview.previewKey);
    assert.equal((await invoke('closer','crm4CloserSendAdministrationOnboardingConfirmation',{previewKey:onboardingPreview.previewKey})).idempotent,true);
    const assessment = (await db.collection('professionalAssessments').doc(draft.assessmentId).get()).data();
    assert.equal(assessment.crmLink.caseRef, leadId);
    await invoke('processing', 'paidClientGetWorkspace');
    const activation = await invoke('processing', 'paidClientActivateLogin', { password });
    assert(activation.clientUid);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await context.route('**/*', r => ['127.0.0.1', 'www.gstatic.com', 'cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort());
    const portal = pages.client = await context.newPage();
    await portal.goto('http://127.0.0.1:4404/client-portal.html');
    await portal.locator('#loginEmail').fill(clientEmail); await portal.locator('#loginPassword').fill(password);
    await portal.locator('#loginForm button[type=submit]').click();
    await portal.locator('#dashboard').waitFor({ state: 'visible' });
    await invoke('client', 'portalClientGetDashboard', { caseId: 'crm4-' + leadId });
    await invoke('client', 'portalClientGetDashboard', { caseId: 'crm4-wrong-client' }, 'permission-denied');
    await invoke('client', 'paidClientGetWorkspace', {}, 'permission-denied');
    for (const key of ['identityReviewed', 'loginExplained', 'uploadExplained', 'messageBoardExplained', 'notesRecorded']) await invoke('processing', 'paidClientUpdateOnboardingChecklist', { key, complete: true, notes: 'Synthetic onboarding rehearsal completed; no customer contact.' });
    const requirement = await invoke('processing', 'paidClientAddDocumentRequirement', { title: 'Synthetic invoice', description: 'Synthetic evidence only', required: true });
    await portal.reload();
    await portal.locator('#dashboard').waitFor({ state: 'visible' });
    await portal.locator('#messageBody').fill('Synthetic client evidence message; no real client data.');
    await portal.locator('#messageForm button[type=submit]').click();
    await portal.locator('#messageMsg').filter({ hasText: 'Message sent securely.' }).waitFor();
    events.push({ role: 'client', name: 'actual portal message form', outcome: 'PASS' });
    const clientMessages = await db.collection('clientPortalMessages').where('caseId', '==', 'crm4-' + leadId).get();
    const clientMessage = clientMessages.docs.find(d => d.data().senderType === 'client');
    assert(clientMessage);
    await invoke('processing', 'paidClientMarkMessageRead', { messageId: clientMessage.id });
    const staffMessage = { body: 'Synthetic staff response.', requestId: runId + '-response' };
    await invoke('processing', 'paidClientStaffCreateMessage', staffMessage);
    assert.equal((await invoke('processing', 'paidClientStaffCreateMessage', staffMessage)).idempotent, true);
    await portal.locator('#uploadRequirement').selectOption(requirement.id);
    await portal.locator('#uploadFile').setInputFiles({ name: 'synthetic-evidence.txt', mimeType: 'text/plain', buffer: Buffer.from('Synthetic CRM4 evidence only') });
    await portal.locator('#uploadForm button[type=submit]').click();
    await portal.locator('#uploadMsg').filter({ hasText: 'Document uploaded securely.' }).waitFor();
    events.push({ role: 'client', name: 'actual portal upload form / Storage emulator', outcome: 'PASS' });
    const uploaded = await db.collection('clientPortalDocuments').where('caseId', '==', 'crm4-' + leadId).get();
    const evidence = uploaded.docs.find(d => d.data().storagePath?.includes('/client-uploads/'));
    assert(evidence, 'Actual portal upload must be registered');
    const download = await invoke('client', 'portalClientGetDocumentUrl', { caseId: 'crm4-' + leadId, documentId: evidence.id });
    const response = await portal.request.get(download.url);
    assert.equal(response.status(), 200); assert.equal(await response.text(), 'Synthetic CRM4 evidence only');
    const staffDownload = await invoke('processing', 'paidClientDownloadDocument', { documentId: evidence.id });
    assert.equal(Buffer.from(staffDownload.content, 'base64').toString(), 'Synthetic CRM4 evidence only');
    await invoke('lister', 'paidClientDownloadDocument', { documentId: evidence.id }, 'permission-denied');
    await invoke('client', 'portalClientGetDocumentUrl', { caseId: 'crm4-wrong-client', documentId: evidence.id }, 'permission-denied');
    await invoke('processing', 'processingCompleteAdministrationOnboarding', { notes: 'Synthetic administration completion' });
    assert.equal((await invoke('processing', 'processingCompleteAdministrationOnboarding', { notes: 'Replay' })).idempotent, true);
    await invoke('processing', 'paidClientUpdateEvidence', { requirementId: requirement.id, priority: 'HIGH', requested: true });
    const currentLead = (await db.collection('crm4Leads').doc(leadId).get()).data();
    assert.equal(currentLead.processingStatus, 'accepted');
    assert.equal(currentLead.administrationOnboardingStatus, 'completed');
    assert.equal(currentLead.actionHistory.filter(e => e.action === 'processing_activated_after_administration_onboarding').length, 1);
    const audits = await db.collection('clientPortalAudit').where('caseId', '==', 'crm4-' + leadId).get();
    const auditActions = audits.docs.map(d => d.data().action || d.data().event);
    for (const action of ['CLIENT_PORTAL_ACTIVATED','ONBOARDING_CHECKLIST_UPDATED','DOCUMENT_REQUIREMENT_ADDED','EVIDENCE_GOVERNANCE_UPDATED','ADMINISTRATION_ONBOARDING_COMPLETED']) assert(auditActions.includes(action), action);
    assert.equal(auditActions.filter(a => a === 'ADMINISTRATION_ONBOARDING_COMPLETED').length, 1);
    assert.equal((await db.collection('processingCases').doc('crm4-' + leadId).get()).data().assessmentId, draft.assessmentId);
    assert.equal((await db.collection('clientPortalRequirements').doc(requirement.id).get()).data().requested, true);
    await invoke('processing', 'paidClientGetWorkspace');
    if(!manual){
    const original = (await db.collection('professionalAssessments').doc(draft.assessmentId).get()).data();
    const originalVersion = (await db.collection('professionalAssessmentVersions').doc(original.currentVersionId).get()).data();
    const correctionInput = { expectedAssessmentId: draft.assessmentId, expectedQarReference: original.qarReference, expectedCurrentRevision: original.revision, expectedCurrentFinalVersion: original.currentVersion };
    const startCorrection = { ...correctionInput, correctionReason: 'Synthetic report lifecycle regression only', confirmStartCorrection: true };
    await invoke('closer', 'crm4AssessmentAssistantStartCorrection', startCorrection, 'permission-denied');
    const correction = await invoke('manager', 'crm4AssessmentAssistantStartCorrection', startCorrection);
    assert.equal((await invoke('manager', 'crm4AssessmentAssistantStartCorrection', startCorrection)).idempotent, true);
    const currentCorrection = { ...correctionInput, expectedCurrentRevision: correction.revision };
    await invoke('manager', 'crm4AssessmentAssistantPreviewCorrectionPdf', correctionInput, 'failed-precondition');
    const preview = await invoke('manager', 'crm4AssessmentAssistantPreviewCorrectionPdf', currentCorrection);
    assert.equal(Buffer.from(preview.content, 'base64').subarray(0, 5).toString(), '%PDF-');
    const finaliseCorrection = { ...currentCorrection, confirmFinaliseCorrection: true, confirmPreviewReviewed: true };
    const corrected = await invoke('manager', 'crm4AssessmentAssistantFinaliseCorrection', finaliseCorrection);
    assert.equal(corrected.result, 'CORRECTION_FINALISED');
    assert.equal((await invoke('manager', 'crm4AssessmentAssistantFinaliseCorrection', finaliseCorrection)).idempotent, true);
    const afterCorrection = (await db.collection('professionalAssessments').doc(draft.assessmentId).get()).data();
    assert.equal(afterCorrection.currentVersion, original.currentVersion + 1);
    assert.equal(afterCorrection.qarReference, original.qarReference);
    assert.deepEqual((await db.collection('professionalAssessmentVersions').doc(original.currentVersionId).get()).data(), originalVersion);
    }else{
      assert.equal((await db.collection('professionalAssessments').doc(draft.assessmentId).get()).data().assessmentSource,'FRAMEWORK_B');
      assert.equal((await db.collection('crm4Leads').doc(leadId).get()).data().assessmentSource,'FRAMEWORK_B');
    }
    assert(service.runtime.providerReceipts.every(r => r.delivered === false));
    const captures=await db.collection('crm4CapturedNotifications').get();
    assert(captures.docs.every(d=>d.data().delivered===false));
    await portal.reload(); await portal.locator('#dashboard').waitFor({state:'visible'});
    assert.match(await portal.locator('#messages').innerText(), /Seen by (?:client|Processing) on \d{2}\/\d{2}\/\d{4}/);
    console.log('CONTINUOUS JOURNEY COMPLETE', leadId);
  } catch (e) {
    blocked = e.message;
    throw e;
  } finally {
    const responsive = [];
    if (leadId) for (const role of ['lister', 'manager', 'closer', 'processing', ...(pages.client ? ['client'] : [])]) {
      const page = pages[role];
      const route = { lister: 'crm4-assessment-assistant.html?leadId=' + leadId, manager: 'manager-panel.html', closer: 'closer-panel.html?id=' + leadId, processing: 'processing-dashboard.html', client: 'client-portal.html' }[role];
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
