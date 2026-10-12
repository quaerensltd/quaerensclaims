'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('pinned portal provider-failure diagnostic: message retained but retry does not recover pending notification', async () => {
  Object.assign(process.env, { GCLOUD_PROJECT: 'demo-quaerens-crm4', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' });
  const runtime = require('../tools/local-handlers.cjs').createLocalHandlers(), db = runtime.db;
  const id = 'failure-' + require('node:crypto').randomUUID();
  let attempts = 0;
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const handlers = require('../backend-sources/paidClientCreateMessage/paidClientWorkspace.js').registerPaidClientWorkspace({ db, admin: { firestore: require('firebase-admin').firestore }, HttpsError, onCall: (...args) => args.at(-1), resendSecret: {}, resend: { emails: { send: async () => { attempts++; throw Error('Synthetic provider unavailable'); } } } });
  try {
    await db.collection('clientPortalCases').doc(id).set({ accessState: 'ACTIVE', clientUid: id });
    await db.collection('clientPortalAccess').doc(id + '_' + id).set({ active: true, uid: id, caseId: id });
    const request = { auth: { uid: id }, data: { caseId: id, body: 'Synthetic failure diagnostic', requestId: id } };
    await assert.rejects(handlers.paidClientCreateMessage(request), /Synthetic provider unavailable/);
    const messageId = 'client-' + id + '-' + id;
    assert((await db.collection('clientPortalMessages').doc(messageId).get()).exists);
    assert.equal((await handlers.paidClientCreateMessage(request)).idempotent, true);
    assert.equal(attempts, 1, 'Known inherited gap: retry bypasses pending notification');
    assert.equal((await db.collection('clientPortalNotifications').doc('portal-message:' + messageId + ':internal').get()).data().status, 'PENDING');
    assert.equal((await db.collection('clientPortalMessages').where('caseId', '==', id).get()).size, 1);
    console.log('KNOWN GAP: preserved portal handler does not retry notification after provider failure; not resilience acceptance.');
  } finally { await runtime.close(); }
});
