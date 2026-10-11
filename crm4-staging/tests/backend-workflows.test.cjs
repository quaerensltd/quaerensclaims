'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../backend-sources');
class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
const definitions = [
  ['crm4ManagerGetLinkedAssessment', 'crm4OperationalFlow.js', 'registerCrm2OperationalFlow'],
  ['crm4ListerCreateReferralLead', 'crm4ManualReferral.js', 'registerCrm2ManualReferral'],
  ['crm4CloserBookAdministrationOnboarding', 'crm4AdministrationOnboarding.js', 'registerCrm2AdministrationOnboarding'],
  ['processingListOperationalDashboard', 'processingOperations.js', 'registerProcessingOperations']
];
function harness(definition, records = {}) {
  const reads = [];
  const db = { collection(collection) { return { doc(id) { return { id, async get() {
    const key = collection + '/' + id;
    reads.push(key);
    assert(Object.hasOwn(records, key), 'Unexpected read: ' + key);
    const data = records[key];
    return { id, exists: data !== null, data: () => structuredClone(data) };
  } }; } }; } };
  const forbidden = () => { throw Error('External provider forbidden'); };
  const module = require(path.join(root, definition[0], definition[1]));
  const handlers = module[definition[2]]({ db, admin: {}, HttpsError,
    onCall: (...args) => args.at(-1), resendSecret: { value: forbidden },
    resend: { emails: { send: forbidden } } });
  assert.equal(typeof handlers[definition[0]], 'function');
  return { invoke: handlers[definition[0]], reads };
}
for (const definition of definitions) {
  test(definition[0] + ' preserves pinned byte provenance', () => {
    const manifest = require(path.join(root, definition[0], 'source-manifest.json'));
    assert.equal(manifest.executable, false);
    assert.deepEqual(manifest.unresolved, []);
    for (const file of manifest.records) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, definition[0], file.target))).digest('hex'), file.cloneSha256);
  });
  test(definition[0] + ' rejects unauthenticated access before data access', async () => {
    const h = harness(definition);
    await assert.rejects(() => h.invoke({ auth: null, data: {} }), e => e.code === 'unauthenticated');
    assert.deepEqual(h.reads, []);
  });
}
const request = { auth: { uid: 'synthetic-manager', token: {} }, data: { leadId: 'synthetic-lead' } };
function fixture(role = 'manager') { return {
  'crm4Memberships/synthetic-manager': { active: true, workspaceId: 'CRM4', role },
  'crm4Leads/synthetic-lead': { assessmentId: 'synthetic-assessment', workspaceId: 'CRM4' },
  'professionalAssessments/synthetic-assessment': { qarReference: 'QAR-SYNTHETIC', status: 'DRAFT', assessmentSource: 'AI_ASSISTED', currentVersion: 5, crmLink: { workspaceId: 'CRM4', crm4LeadId: 'synthetic-lead' } }
}; }
for (const role of ['manager', 'administrator']) test(role + ' reads existing linked draft without writes or providers', async () => {
  const h = harness(definitions[0], fixture(role));
  const result = await h.invoke(request);
  assert.equal(result.assessment.id, 'synthetic-assessment');
  assert.equal(result.assessment.qarReference, 'QAR-SYNTHETIC');
  assert.equal(result.assessment.status, 'DRAFT');
  assert.equal(result.assessment.currentVersion, 5);
  assert.equal(h.reads.length, 3);
});
for (const workspace of ['CRM2', 'CRM3']) test('Manager linked assessment denies ' + workspace, async () => {
  const data = fixture(); data['professionalAssessments/synthetic-assessment'].crmLink.workspaceId = workspace;
  await assert.rejects(() => harness(definitions[0], data).invoke(request), e => e.code === 'failed-precondition');
});
test('Manager rejects mismatched lead linkage', async () => {
  const data = fixture(); data['professionalAssessments/synthetic-assessment'].crmLink.crm4LeadId = 'another-lead';
  await assert.rejects(() => harness(definitions[0], data).invoke(request), e => e.code === 'failed-precondition');
});
