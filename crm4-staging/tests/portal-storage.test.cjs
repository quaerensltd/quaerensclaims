'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('portal Storage emulator permits owner create only; denies other clients, reads, overwrite and unsafe types', async () => {
  Object.assign(process.env, { GCLOUD_PROJECT: 'demo-quaerens-crm4', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099', STORAGE_EMULATOR_HOST: 'http://127.0.0.1:9199' });
  const runtime = require('../tools/local-handlers.cjs').createLocalHandlers();
  const auth = require('firebase-admin/auth').getAuth(runtime.app), id = 'storage-' + require('node:crypto').randomUUID();
  const tokens = {};
  try {
    for (const role of ['owner', 'other', 'unverified']) {
      const uid = id + '-' + role, email = uid + '@example.test', password = 'Synthetic-storage-927!';
      await auth.createUser({ uid, email, password, emailVerified: role !== 'unverified' });
      const res = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
      tokens[role] = (await res.json()).idToken;
    }
    const caseRef = runtime.db.collection('clientPortalCases').doc(id);
    await caseRef.set({ clientUid: id + '-owner', accessState: 'ACTIVE' });
    const name = 'clientPortal/' + id + '/client-uploads/' + id + '-owner/test.txt';
    const base = 'http://127.0.0.1:9199/v0/b/demo-quaerens-crm4.appspot.com/o';
    const put = (role, path = name, type = 'text/plain') => require('./storage-upload-helper.cjs').uploadSynthetic(base, tokens[role], path, type);
    assert.equal((await put('other')).status, 403);
    assert.equal((await put('unverified')).status, 403);
    assert.equal((await put('owner', name + '.html', 'text/html')).status, 403);
    assert.equal((await put('owner')).status, 200);
    assert.equal((await put('owner')).status, 403, 'Overwrite denied');
    assert.equal((await fetch(base + '/' + encodeURIComponent(name) + '?alt=media', { headers: { Authorization: 'Firebase ' + tokens.owner } })).status, 403, 'Downloads require governed callable');
    await caseRef.update({ accessState: 'DISABLED' });
    assert.equal((await put('owner', name + '-disabled')).status, 403);
    await assert.rejects(runtime.handlers.portalClientGetDocumentUrl({ data: {} }), e => e.code === 'unauthenticated');
  } finally { await runtime.close(); }
});
