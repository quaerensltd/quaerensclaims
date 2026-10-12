'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('synthetic agreement and manual-payment acknowledgments retain role, workspace and exact-amount guards', async () => {
  process.env.GCLOUD_PROJECT = 'demo-quaerens-crm4'; process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  const runtime = require('../tools/local-handlers.cjs').createLocalHandlers(), db = runtime.db;
  const id = 'synthetic-processing-' + require('node:crypto').randomUUID();
  const invoke = (name, data, uid = id) => runtime.handlers[name]({ auth: { uid, token: {} }, data: { leadId: id, ...data } });
  try {
    await db.collection('crm4Memberships').doc(id).set({ active: true, workspaceId: 'CRM4', role: 'processing' });
    await db.collection('crm4Memberships').doc(id + '-lister').set({ active: true, workspaceId: 'CRM4', role: 'lister' });
    const lead = db.collection('crm4Leads').doc(id);
    // This is a pre-existing synthetic sent-agreement fixture, not a claim that
    // the agreement preparation/delivery workflow has been tested.
    await lead.set({ workspaceId: 'CRM4', status: 'closed-deal-awaiting-payment', outcome: 'Closed Deal', agreementStatus: 'sent', agreementSentAt: new Date(), agreementVersion: 1, agreementDocumentId: 'synthetic-document', assessmentId: 'synthetic-assessment', assessmentQar: 'SYNTHETIC-QAR', assessmentStatus: 'COMPLETED', paymentStatus: 'payment_requested', paymentOptionType: 'bank_transfer', agreedFeeAmount: 950, agreedFeeCurrency: 'GBP' });
    const agreement = { agreementVersion: 1, agreementDocumentId: 'synthetic-document' };
    await assert.rejects(invoke('processingMarkAgreementSigned', agreement, id + '-lister'), e => e.code === 'permission-denied');
    await assert.rejects(invoke('processingMarkAgreementSigned', { ...agreement, agreementVersion: 2 }), e => e.code === 'failed-precondition');
    assert.equal((await invoke('processingMarkAgreementSigned', agreement)).status, 'AGREEMENT_SIGNED');
    assert.equal((await invoke('processingMarkAgreementSigned', agreement)).idempotent, true);
    await assert.rejects(invoke('processingConfirmCrm2Payment', { confirmedAmount: 949 }), e => e.code === 'failed-precondition');
    assert.equal((await invoke('processingConfirmCrm2Payment', { confirmedAmount: 950, paymentReference: 'SYNTHETIC-NO-PAYMENT' })).status, 'PAYMENT_CONFIRMED_READY_FOR_ADMINISTRATION_ONBOARDING');
    assert.equal((await invoke('processingConfirmCrm2Payment', { confirmedAmount: 950 })).idempotent, true);
    await lead.update({ workspaceId: 'CRM2' });
    await assert.rejects(invoke('processingConfirmCrm2Payment', { confirmedAmount: 950 }), e => e.code === 'permission-denied');
    assert.equal(runtime.providerReceipts.length, 0);
  } finally { await runtime.close(); }
});
