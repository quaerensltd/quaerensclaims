'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('every pinned callable bundle retains its materialised source hashes and brochure asset', () => {
  const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
  const root = path.resolve(__dirname, '../backend-sources');
  for (const name of fs.readdirSync(root)) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, name, 'source-manifest.json')));
    for (const file of manifest.records) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name, file.target))).digest('hex'), file.cloneSha256, name + '/' + file.target);
  }
  const brochure = require('../backend-sources/crm4AssessmentAssistantFinalise/crm4InformationBrochure.js');
  assert(brochure.verifiedInformationBrochure(Error).length > 100);
});
test('synthetic AI boundary refuses real external requests and unmarked input', async () => {
  const { isolated } = require('../tools/local-ai.cjs');
  await assert.rejects(isolated(() => fetch('https://example.com'))({}), /External network disabled/);
  const request = marker => fetch('https://api.openai.com/v1/responses', { body: JSON.stringify({ input: [{}, { content: [{ text: JSON.stringify({ category: 'spray-foam', assessmentNotes: marker }) }] }] }) });
  await assert.rejects(isolated(() => request('unmarked'))({}), /synthetic assessment marker/);
  const response = await isolated(() => request('CRM4_SYNTHETIC_ASSESSMENT'))({});
  assert.equal(response.status, 200);
  assert.equal((await response.json()).id, 'crm4-local-synthetic-response');
});
test('capture storage retains bytes locally and rejects arbitrary paths', async () => {
  const storage = require('../tools/local-storage.cjs').createLocalStorage();
  assert.throws(() => storage.bucket().file('../../credentials'), /Unapproved/);
  const object = storage.bucket().file('professional-assessments/synthetic/versions/v1/report.pdf');
  await object.save(Buffer.from('%PDF synthetic')); assert.equal((await object.download())[0].toString(), '%PDF synthetic');
});
