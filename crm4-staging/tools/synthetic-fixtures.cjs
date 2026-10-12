'use strict';
const { createLocalHandlers } = require('./local-handlers.cjs');
async function seed() {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Demo Auth emulator required');
  const runtime = createLocalHandlers(), auth = require('firebase-admin/auth').getAuth(runtime.app);
  const password = 'CRM4-Synthetic-Local-927!', users = {};
  for (const role of ['manager', 'administrator', 'lister', 'closer', 'processing']) {
    const uid = 'crm4-synthetic-' + role, email = role + '@crm4.example.test';
    try { await auth.createUser({ uid, email, password }); } catch (error) { if (error.code !== 'auth/uid-already-exists') throw error; }
    await runtime.db.collection('crm4Memberships').doc(uid).set({ active: true, workspaceId: 'CRM4', role, displayName: 'Synthetic ' + role, email });
    await runtime.db.collection('users').doc(uid).set({ role, assessmentCapabilities: ['manager', 'administrator'].includes(role) ? ['assessmentIssuer'] : [] });
    users[role] = { uid, email, password };
  }
  const leadId = 'crm4-synthetic-browser-lead';
  await runtime.db.collection('crm4Leads').doc(leadId).set({ workspaceId: 'CRM4', source: 'manual_crm4', clientName: 'Synthetic Browser Client', forename: 'Synthetic', surname: 'Browser Client', email: 'client@example.test', claimType: 'foam_insulation', assignedToUid: users.lister.uid, assignedUserId: users.lister.uid, assignedToName: 'Synthetic lister', closerUid: users.closer.uid, status: 'approved', assessmentStatus: 'NOT_STARTED', createdBy: users.lister.uid, createdAt: new Date(), telephone: '07700900000' });
  await runtime.db.collection('crm4Leads').doc('crm4-synthetic-closer-lead').set({ workspaceId: 'CRM4', source: 'manual_crm4', clientName: 'Synthetic Onboarding Client', email: 'onboarding@example.test', claimType: 'foam_insulation', assignedUserId: users.closer.uid, closerUid: users.closer.uid, assignedToUid: users.lister.uid, status: 'appointment-booked', outcome: 'Closed Deal', paymentStatus: 'payment_confirmed', paymentConfirmedAt: new Date(), processingStatus: 'ready_for_administration_onboarding', appointmentDate: '2099-01-12', appointmentTime: '12:00' });
  await runtime.db.collection('crm4AdministrationOnboardingSlots').doc('crm4-synthetic-slot').set({ date: '2099-01-12', startTime: '12:00', durationMinutes: 60, status: 'available' });
  await runtime.db.collection('processingCases').doc('crm4-synthetic-processing-case').set({ crm4LeadId: 'crm4-synthetic-closer-lead', caseReference: 'SYNTHETIC-CRM4-CASE', client: { name: 'Synthetic Processing Client', email: 'processing-client@example.test' }, assignedToUid: users.processing.uid, assignedToName: 'Synthetic processing', caseStage: 'evidence_review', createdAt: new Date() });
  await runtime.close();
  return { users, leadId };
}
module.exports = { seed };
if (require.main === module) seed().then(() => console.log('Demo-only synthetic fixtures seeded. Accounts: <role>@crm4.example.test; password documented in synthetic-fixtures.cjs.')).catch(e => { console.error(e.message); process.exitCode = 1; });
