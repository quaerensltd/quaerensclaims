'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('real Auth emulator accepts only a synthetic local account; Firestore remains fail closed', async () => {
  const signup = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-emulator-only', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      email: `crm4-isolation-${Date.now()}@example.test`, password: 'Synthetic-Local-Only-947!', returnSecureToken: true
    })
  });
  assert.equal(signup.status, 200);
  const account = await signup.json(); assert(account.idToken);
  try {
    for (const collection of ['crm2Leads', 'crm3Leads', 'crm4Leads', 'crm4Memberships']) {
      const result = await fetch(`http://127.0.0.1:8080/v1/projects/demo-quaerens-crm4/databases/(default)/documents/${collection}`, {
        headers: { Authorization: `Bearer ${account.idToken}` }
      });
      assert.equal(result.status, 403, collection);
    }
  } finally {
    await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:delete?key=demo-emulator-only', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: account.idToken })
    });
  }
});
