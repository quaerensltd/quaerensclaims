'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('browser rule permissions are role scoped and deny cross-workspace/privileged writes', async () => {
  process.env.GCLOUD_PROJECT = 'demo-quaerens-crm4'; process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'; process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  const fixture = await require('../tools/synthetic-fixtures.cjs').seed();
  const tokens = {};
  for (const role of ['manager', 'lister', 'closer']) {
    const u = fixture.users[role];
    const response = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, password: u.password, returnSecureToken: true }) });
    assert.equal(response.status, 200); tokens[role] = (await response.json()).idToken;
  }
  async function read(role, suffix, method = 'GET') {
    return fetch('http://127.0.0.1:8080/v1/projects/demo-quaerens-crm4/databases/(default)/documents/' + suffix, { method, headers: { Authorization: 'Bearer ' + tokens[role], 'Content-Type': 'application/json' }, ...(method === 'PATCH' ? { body: JSON.stringify({ fields: { role: { stringValue: 'administrator' } } }) } : {}) });
  }
  assert.equal((await read('lister', 'crm4Memberships/' + fixture.users.lister.uid)).status, 200);
  assert.equal((await read('lister', 'crm4Memberships/' + fixture.users.manager.uid)).status, 403);
  assert.equal((await read('manager', 'crm4Memberships')).status, 200);
  assert.equal((await read('lister', 'crm4Leads/' + fixture.leadId)).status, 200);
  for (const collection of ['crm2Leads', 'crm3Leads', 'professionalAssessments', 'clientPortalCases']) assert.equal((await read('manager', collection)).status, 403);
  assert.equal((await read('lister', 'crm4Memberships/' + fixture.users.lister.uid, 'PATCH')).status, 403);
  assert.equal((await read('manager', 'crm4Leads/' + fixture.leadId, 'PATCH')).status, 403);
});
