'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('authenticated local callable roles, onboarding and provider isolation', async () => {
  process.env.GCLOUD_PROJECT = 'demo-quaerens-crm4'; process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'; process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  const service = await require('../tools/serve-callables.cjs').start(0);
  const auth = require('firebase-admin/auth').getAuth(service.runtime.app), db = service.runtime.db;
  const suffix = require('node:crypto').randomUUID(), documents = [], users = [];
  async function seed(collection, id, value) { const ref = db.collection(collection).doc(id); documents.push(ref); await ref.set(value); return ref; }
  async function identity(role) {
    const email = role + '-' + suffix + '@example.test', password = 'LocalSyntheticOnly-927!';
    const user = await auth.createUser({ email, password }); users.push(user.uid);
    await seed('crm4Memberships', user.uid, { active: true, workspaceId: 'CRM4', role });
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-only', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
    assert.equal(response.status, 200); return { uid: user.uid, token: (await response.json()).idToken };
  }
  async function invoke(name, identity, data = {}, origin = 'http://127.0.0.1:4404') {
    const response = await fetch(`http://127.0.0.1:${service.port}/demo-quaerens-crm4/us-central1/${name}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...(identity ? { Authorization: 'Bearer ' + identity.token } : {}) }, body: JSON.stringify({ data }) });
    return { status: response.status, body: await response.json() };
  }
  try {
    const manager = await identity('manager'), closer = await identity('closer'), processing = await identity('processing'), lister = await identity('lister');
    assert.equal((await invoke('crm4ManagerGetLinkedAssessment', null)).status, 401);
    assert.equal((await invoke('crm4ManagerGetLinkedAssessment', { token: 'invalid' })).status, 401);
    assert.equal((await invoke('crm4ManagerGetLinkedAssessment', manager, {}, 'https://example.com')).status, 403);
    assert.equal((await invoke('crm4AssessmentAssistantFinalise', manager)).status, 404);
    assert.equal((await invoke('crm4ManagerGetLinkedAssessment', lister)).status, 403);
    const leadId = 'synthetic-' + suffix;
    const lead = await seed('crm4Leads', leadId, { workspaceId: 'CRM4', closerUid: closer.uid, email: 'client-' + suffix + '@example.test', clientName: 'Synthetic Client', outcome: 'Closed Deal', paymentStatus: 'payment_confirmed', paymentConfirmedAt: new Date(), processingStatus: 'ready_for_administration_onboarding' });
    assert.equal((await invoke('crm4ManagerGetLinkedAssessment', manager, { leadId })).body.result.assessment, null);
    assert.equal((await invoke('crm4AssessmentAssistantGetState', manager, { leadId })).status, 403);
    await seed('users', manager.uid, { assessmentCapabilities: ['assessmentIssuer'] });
    const assessmentState = await invoke('crm4AssessmentAssistantGetState', manager, { leadId });
    assert.equal(assessmentState.status, 200, JSON.stringify(assessmentState.body));
    assert.equal(assessmentState.body.result.leadId, leadId);
    assert.equal(assessmentState.body.result.assessment, null);
    assert.equal((await invoke('crm4AssessmentAssistantGetState', closer, { leadId })).status, 403);
    const slot = await seed('crm4AdministrationOnboardingSlots', 'synthetic-slot-' + suffix, { date: '2099-01-12', startTime: '12:00', durationMinutes: 60, status: 'available' });
    const booking = await invoke('crm4CloserBookAdministrationOnboarding', closer, { leadId, slotId: slot.id });
    assert.equal(booking.status, 200, JSON.stringify(booking.body));
    assert.equal(booking.body.result.status, 'BOOKED');
    documents.push(db.collection('crm4AdministrationOnboardingAppointments').doc(booking.body.result.appointmentId));
    const repeat = await invoke('crm4CloserBookAdministrationOnboarding', closer, { leadId, slotId: slot.id });
    assert.equal(repeat.body.result.idempotent, true);
    assert.equal(service.runtime.providerReceipts.length, 2);
    assert(service.runtime.providerReceipts.every(receipt => receipt.delivered === false));
    assert.equal((await lead.get()).data().administrationOnboardingStatus, 'confirmation_sent');
    assert.equal((await invoke('processingListOperationalDashboard', processing)).status, 200);
    await db.collection('crm4Memberships').doc(manager.uid).update({ workspaceId: 'CRM2' });
    assert.equal((await invoke('crm4ManagerGetLinkedAssessment', manager, { leadId })).status, 403);
  } finally {
    await Promise.all(documents.map(ref => ref.delete())); await Promise.all(users.map(uid => auth.deleteUser(uid))); await service.close();
  }
});
