'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('two synthetic leads competing for one slot produce one booking and no losing-lead mutation', async () => {
  Object.assign(process.env, { GCLOUD_PROJECT: 'demo-quaerens-crm4', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' });
  const runtime = require('../tools/local-handlers.cjs').createLocalHandlers(), db = runtime.db;
  const id = 'collision-' + require('node:crypto').randomUUID(), ids = [id + '-a', id + '-b'];
  try {
    await db.collection('crm4Memberships').doc(id).set({ active: true, workspaceId: 'CRM4', role: 'closer' });
    // Isolated concurrency fixtures, not a substitute for continuous-journey transitions.
    const fixture = { workspaceId: 'CRM4', closerUid: id, outcome: 'Closed Deal', paymentStatus: 'payment_confirmed', paymentConfirmedAt: new Date(), processingStatus: 'ready_for_administration_onboarding', email: id + '@example.test' };
    for (const leadId of ids) await db.collection('crm4Leads').doc(leadId).set(fixture);
    await db.collection('crm4AdministrationOnboardingSlots').doc(id).set({ status: 'available', date: '2099-12-01', startTime: '12:00', durationMinutes: 60 });
    const results = await Promise.allSettled(ids.map(leadId => runtime.handlers.crm4CloserBookAdministrationOnboarding({ auth: { uid: id, token: {} }, data: { leadId, slotId: id } })));
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    const loser = results.findIndex(r => r.status === 'rejected');
    assert.equal(results[loser].reason.code, 'already-exists');
    assert.deepEqual((await db.collection('crm4Leads').doc(ids[loser]).get()).data(), { ...fixture, paymentConfirmedAt: require('firebase-admin/firestore').Timestamp.fromDate(fixture.paymentConfirmedAt) });
    assert.equal((await db.collection('crm4AdministrationOnboardingAppointments').where('slotId', '==', id).get()).size, 1);
    assert(runtime.providerReceipts.every(r => r.delivered === false));
  } finally { await runtime.close(); }
});
