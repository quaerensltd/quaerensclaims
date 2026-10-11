'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), vm = require('node:vm');
const { transform, wrapper, compatWrapper } = require('../tools/build-local.cjs');
const { csp } = require('../tools/serve-local.cjs');
const root = path.resolve(__dirname, '..'), manifest = require('../clone-manifest.json');
test('every cloned file matches the recorded transformed bytes', () => {
  for (const f of manifest.records) assert.equal(crypto.createHash('sha1').update(fs.readFileSync(path.join(root, 'local-public', f.target))).digest('hex'), f.cloneSha1, f.target);
});
test('configuration and workspace identity are replaced without altering visual CSS', () => {
  const modules = new Set();
  const source = `const c={apiKey:'public-key',projectId:'production'}; const w='CRM2'; const url='/crm2.html'; <style>.card{color:blue}</style>`;
  const output = transform(source, modules);
  assert.match(output, /demo-quaerens-crm4/); assert.doesNotMatch(output, /public-key|production|CRM2|crm2/);
  assert.match(output, /<style>\.card\{color:blue\}<\/style>/);
});
test('only local emulator connections are permitted by CSP', () => {
  const connections = csp.split(';').find(s => s.trim().startsWith('connect-src'));
  assert.doesNotMatch(connections, /googleapis|cloudfunctions|run\.app|https:|\*/);
  assert.match(connections, /127\.0\.0\.1:5001/);
});
test('all generated modular SDK entrypoints enforce demo project and emulator connection', () => {
  for (const key of manifest.modules) {
    const [version, service] = key.split('/'); const text = wrapper(version, service);
    assert.match(text, /CRM4 local only/); assert.match(text, /demo-quaerens-crm4/);
    if (service !== 'app') assert.match(text, /connect\w+Emulator/);
  }
});
test('all CRM4 text assets have no original workspace or production API key', () => {
  for (const f of manifest.records.filter(f => /\.(html|js|css)$/.test(f.target))) {
    const text = fs.readFileSync(path.join(root, 'local-public', f.target), 'utf8');
    assert.doesNotMatch(text, /CRM2|crm2|AIza[\w-]+/, f.target);
    assert.doesNotMatch(text, /https:\/\/us-central1-quaerensclaims\.cloudfunctions\.net/, f.target);
  }
});
test('compatibility SDK connects every portal service before returning app', () => {
  const calls = [], service = name => ({ useEmulator: (...args) => calls.push([name, ...args]) });
  const firebase = { apps: [], initializeApp: config => {
    assert.equal(config.projectId, 'demo-quaerens-crm4');
    return { auth: () => service('auth'), functions: () => service('functions'), storage: () => service('storage') };
  } };
  vm.runInNewContext(compatWrapper(), { firebase, location: { hostname: 'localhost' } });
  firebase.initializeApp({ projectId: 'production' });
  assert.deepEqual(calls.map(x => x[0]), ['auth', 'functions', 'storage']);
  assert(calls.every(x => x[1].includes('127.0.0.1')));
  for (const file of ['client-portal.html', 'client-portal-admin.html']) {
    assert.match(fs.readFileSync(path.join(root, 'local-public', file), 'utf8'), /__crm4\/compat.js/);
  }
});
test('local rules do not expose any client records before rules reconciliation', () => {
  for (const file of ['firestore.local.rules', 'storage.local.rules']) assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /allow read, write: if false/);
});
