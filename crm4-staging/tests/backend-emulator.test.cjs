'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { createLocalHandlers } = require('../tools/local-handlers.cjs');
test('local integration refuses production/default environment', () => {
  for (const env of [{}, { GCLOUD_PROJECT: 'quaerensclaims', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' }, { GCLOUD_PROJECT: 'demo-quaerens-crm4', FIRESTORE_EMULATOR_HOST: 'example.com:8080' }]) assert.throws(() => createLocalHandlers(env), /Explicit demo/);
});
test('actual Lister create/replay/duplicate and Manager draft read on demo Firestore only', async () => {
  process.env.GCLOUD_PROJECT = 'demo-quaerens-crm4';
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  const runtime = createLocalHandlers();
  const { db, handlers } = runtime;
  const suffix = require('node:crypto').randomUUID(), uid = 'synthetic-' + suffix;
  const touched = [];
  const member = db.collection('crm4Memberships').doc(uid); touched.push(member);
  try {
    assert.deepEqual(Object.keys(handlers).sort(), [
      ...['UpdateClientIdentity', 'Analyse', 'ConfirmReview', 'SaveCorrections', 'GenerateDraft', 'PreviewDraftPdf', 'ReprojectDraft', 'Finalise', 'DownloadFinalPdf', 'GetState', 'StartCorrection', 'PreviewCorrectionPdf', 'FinaliseCorrection'].map(n => 'crm4AssessmentAssistant' + n),
      'portalClientCreateMessage', 'portalClientRegisterUpload', 'portalClientGetDocumentUrl',
      'paidClientStaffCreateMessage', 'paidClientMarkMessageRead', 'paidClientDownloadDocument',
      'paidClientCreateMessage', 'paidClientRegisterUpload',
      'crm4CloserBookAdministrationOnboarding', 'crm4CloserListAdministrationOnboardingSlots', 'crm4CloserRecordClosedDeal', 'crm4CloserGetLinkedAssessment',
      'crm4ListerCreateReferralLead', 'crm4ManagerGetLinkedAssessment', 'crm4ManagerUpdateLead', 'crm4ManagerSendToCloser',
      ...['ListerSubmitToManager', 'UpdateAppointment', 'CloserGetAgreement', 'CloserSaveAgreement', 'CloserSendAgreement', 'CloserPreparePaymentEmail', 'CloserSendPaymentEmail'].map(n => 'crm4' + n),
      'paidClientGetWorkspace', 'paidClientActivateLogin', 'paidClientUpdateOnboardingChecklist', 'paidClientAddDocumentRequirement', 'paidClientUpdateEvidence', 'portalClientGetDashboard', 'portalClientListCases', 'processingPublishAdministrationOnboardingSlots',
      'processingListAdministrationOnboarding', 'processingListOperationalDashboard', 'processingCompleteAdministrationOnboarding', 'processingMarkAgreementSigned', 'processingConfirmCrm2Payment'
    ].sort());
    await member.set({ active: true, workspaceId: 'CRM4', role: 'lister', name: 'Synthetic CRM4 Lister' });
    const request = { auth: { uid, token: {} }, data: { requestId: suffix, forename: 'Synthetic', surname: 'CRM4 Test', email: suffix + '@example.test', claimType: 'foam_insulation', referralSource: 'direct_enquiry' } };
    const first = await handlers.crm4ListerCreateReferralLead(request);
    assert.equal(first.outcome, 'NEW_LEAD_CREATED');
    const leadRef = db.collection('crm4Leads').doc(first.leadId); touched.push(leadRef);
    const lead = (await leadRef.get()).data();
    assert.equal(lead.workspaceId, 'CRM4'); assert.equal(lead.assignedToUid, uid);
    assert.equal(lead.assessmentStatus, 'NOT_STARTED'); assert.equal(lead.assessmentId, undefined);
    const replay = await handlers.crm4ListerCreateReferralLead(request);
    assert.equal(replay.leadId, first.leadId); assert.equal(replay.idempotent, true);
    const duplicate = await handlers.crm4ListerCreateReferralLead({ ...request, data: { ...request.data, requestId: suffix + '-duplicate' } });
    assert.equal(duplicate.status, 'POSSIBLE_DUPLICATE'); assert.equal(duplicate.existingLeadId, first.leadId);
    await member.update({ role: 'manager' });
    const assessmentRef = db.collection('professionalAssessments').doc('synthetic-' + suffix); touched.push(assessmentRef);
    const assessment = { qarReference: 'QAR-SYNTHETIC-' + suffix, status: 'DRAFT', currentVersion: 1, assessmentSource: 'AI_ASSISTED', crmLink: { workspaceId: 'CRM4', crm4LeadId: first.leadId } };
    await assessmentRef.set(assessment); await leadRef.update({ assessmentId: assessmentRef.id });
    const read = await handlers.crm4ManagerGetLinkedAssessment({ auth: { uid }, data: { leadId: first.leadId } });
    assert.equal(read.assessment.id, assessmentRef.id); assert.equal(read.assessment.qarReference, assessment.qarReference);
    assert.deepEqual((await assessmentRef.get()).data(), assessment);
    for (const workspace of ['CRM2', 'CRM3']) {
      await member.update({ workspaceId: workspace });
      await assert.rejects(() => handlers.crm4ManagerGetLinkedAssessment({ auth: { uid }, data: { leadId: first.leadId } }), e => e.code === 'permission-denied');
    }
  } finally {
    // Delete only documents owned by this unique synthetic local test actor.
    for (const collection of ['crm4ManualReferralRequests', 'crm4LeadDuplicateKeys']) {
      const owned = await db.collection(collection).where('ownerUid', '==', uid).get();
      touched.push(...owned.docs.map(doc => doc.ref));
    }
    await Promise.all(touched.map(ref => ref.delete()));
    await runtime.close();
  }
});
