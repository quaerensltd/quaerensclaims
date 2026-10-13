'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { validateConfiguration } = require('../release/configuration.cjs');
const config = JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname, '../release/infrastructure.proposed.json'), 'utf8').replace(/^\uFEFF/, ''));
test('release configuration rejects cross-project resources and unreviewed runtime/provider boundaries', () => {
  assert.equal(validateConfiguration(config).workspace, 'CRM4');
  for (const patch of [{projectId:'quaerensclaims'}, {workspace:'CRM3'}, {team:'London'}, {bucket:'quaerensclaims.appspot.com'}, {authDomain:'quaerensclaims.firebaseapp.com'}, {runtimeServiceAccount:'default@quaerensclaims.iam.gserviceaccount.com'}, {region:'us-central1'}, {providers:'live'}, {maximumInstances:100}, {privateAccess:'public'}]) {
    assert.throws(() => validateConfiguration({...config,...patch}));
  }
  assert.equal(config.provisioningApproved, false);
  assert.equal(config.billingApproved, false);
  assert.equal(config.deploymentApproved, false);
});
