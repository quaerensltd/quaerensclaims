'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../backend-sources/crm4AssessmentAssistantGenerateDraft');
const assistant = require(path.join(root, 'crm4AssessmentAssistant.js'));
class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
function handler(membership, lead) {
  const reads = [];
  const db = { collection(name) {
    assert(['crm4Memberships', 'crm4Leads'].includes(name), 'Unexpected data access: ' + name);
    return { doc(id) { return { async get() {
      reads.push(name);
      const value = name === 'crm4Memberships' ? membership : lead;
      return { id, exists: !!value, data: () => value };
    } }; } };
  } };
  const forbidden = () => { throw new Error('Provider activity forbidden'); };
  const registered = assistant.registerCrm2AssessmentAssistant({
    db, admin: {}, onCall: (...args) => args.at(-1), HttpsError,
    openaiSecret: { value: forbidden }, resendSecret: { value: forbidden },
    resend: { emails: { send: forbidden } }
  });
  return { invoke: registered.crm4AssessmentAssistantGenerateDraft, reads };
}
test('backend source provenance matches every materialised byte', () => {
  const manifest = require(path.join(root, 'source-manifest.json'));
  assert.equal(manifest.executable, false);
  for (const file of manifest.records) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file.target))).digest('hex'), file.cloneSha256);
  assert.equal(assistant.GENERATION_CONTRACT_VERSION, 'assessment-generation-v9');
});
test('unauthenticated GenerateDraft does not access data or providers', async () => {
  const h = handler(null, null);
  await assert.rejects(() => h.invoke({ auth: null, data: {} }), e => e.code === 'unauthenticated');
  assert.deepEqual(h.reads, []);
});
for (const [name, membership] of Object.entries({
  absent: null,
  inactive: { active: false, workspaceId: 'CRM4', role: 'lister' },
  crm2: { active: true, workspaceId: 'CRM2', role: 'lister' },
  crm3: { active: true, workspaceId: 'CRM3', role: 'lister' },
  unrelatedRole: { active: true, workspaceId: 'CRM4', role: 'closer' },
  managerNotGrantedGenerate: { active: true, workspaceId: 'CRM4', role: 'manager' }
})) test('GenerateDraft rejects membership ' + name, async () => {
  const h = handler(membership, { workspaceId: 'CRM4', assignedToUid: 'synthetic' });
  await assert.rejects(() => h.invoke({ auth: { uid: 'synthetic' }, data: { leadId: 'synthetic-lead' } }), e => e.code === 'permission-denied');
});
test('authorised Lister cannot cross lead workspace boundary', async () => {
  const h = handler({ active: true, workspaceId: 'CRM4', role: 'lister' }, { workspaceId: 'CRM2', assignedToUid: 'synthetic' });
  await assert.rejects(() => h.invoke({ auth: { uid: 'synthetic' }, data: { leadId: 'synthetic-lead' } }), e => e.code === 'not-found');
});
test('authorised Lister cannot generate against another assignment', async () => {
  const h = handler({ active: true, workspaceId: 'CRM4', role: 'lister' }, { workspaceId: 'CRM4', assignedToUid: 'other' });
  await assert.rejects(() => h.invoke({ auth: { uid: 'synthetic' }, data: { leadId: 'synthetic-lead' } }), e => e.code === 'permission-denied');
});
