import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { assertLocalEnvironment, createLocalServices, PROJECT_ID, APP_NAME } from '../isolation.mjs';
const { safeAsset, describe } = createRequire(import.meta.url)('../tools/inventory.cjs');

test('non-local origins fail before Firebase initialisation', () => {
  for (const hostname of ['www.quaerens.co.uk', 'localhost.attacker.test', '192.168.1.1', '']) {
    assert.throws(() => createLocalServices({}, { hostname, protocol: 'https:' }), /emulator-only/);
  }
  assert.throws(() => assertLocalEnvironment({ hostname: 'localhost', protocol: 'file:' }));
});
test('all four services connect to loopback demo emulators before being returned', () => {
  const calls = [], sdk = { getApps: () => [{ name: 'production' }] };
  sdk.initializeApp = (config, name) => {
    assert.equal(config.projectId, PROJECT_ID); assert.equal(name, APP_NAME);
    calls.push('app'); return { name };
  };
  for (const name of ['Auth', 'Firestore', 'Functions', 'Storage']) {
    sdk['get' + name] = app => { assert.equal(app.name, APP_NAME); return name; };
    sdk['connect' + name + 'Emulator'] = (service, host) => {
      assert.equal(service, name); assert.match(host, /127\.0\.0\.1/); calls.push(name);
    };
  }
  const services = createLocalServices(sdk, { hostname: 'localhost', protocol: 'http:' });
  assert.deepEqual(calls, ['app', 'Auth', 'Firestore', 'Functions', 'Storage']);
  assert.equal(services.workspaceId, 'CRM4'); assert(Object.isFrozen(services));
});
test('never reuses an existing named application', () => {
  assert.throws(() => createLocalServices({ getApps: () => [{ name: APP_NAME }] },
    { hostname: 'localhost', protocol: 'http:' }), /already initialised/);
});
test('inventory rejects credentials, traversal and non-public source types', () => {
  for (const file of ['.env', '../functions/index.js', 'a/../../x.js', 'credentials.js',
    '.secret.local', 'service-account.json', 'x\\y.js', 'functions.zip']) assert.equal(safeAsset(file), false);
  assert.equal(safeAsset('crm-workspace.js'), true);
});
test('inventory includes direct and Assessment Assistant helper callables', () => {
  const result = describe('page.html', Buffer.from(`
    const a = httpsCallable(functions, "crm2ManagerGetLinkedAssessment");
    const call = n => httpsCallable(fx, n);
    const b = call("crm2AssessmentAssistantReprojectDraft");
    <script src="/crm-workspace.js"></script>
    <a href="/client-file.html?id=synthetic">Client</a>
  `));
  assert.deepEqual(result.callables, ['crm2AssessmentAssistantReprojectDraft', 'crm2ManagerGetLinkedAssessment']);
  assert.deepEqual(result.dependencies, ['client-file.html', 'crm-workspace.js']);
});
test('connection failure is not followed by a live-service fallback', () => {
  let initialisations = 0;
  const sdk = { getApps: () => [], initializeApp: () => { initialisations++; return {}; },
    getAuth: () => ({}), connectAuthEmulator: () => { throw new Error('emulator unavailable'); } };
  assert.throws(() => createLocalServices(sdk, { hostname: 'localhost', protocol: 'http:' }), /emulator unavailable/);
  assert.equal(initialisations, 1);
});
