'use strict';
// Offline validation only: this module cannot provision or deploy anything.
function validateConfiguration(config) {
  const fail = message => { throw Error(message); };
  if (config.schemaVersion !== 1 || config.workspace !== 'CRM4' || config.team !== 'Spain' || config.environment !== 'private-synthetic-test') fail('CRM4 Spain synthetic configuration required');
  if (!/^quaerens-crm4-spain-[a-z][a-z0-9-]{0,9}$/.test(config.projectId || '')) fail('Dedicated CRM4 Spain project required');
  if (config.region !== 'europe-west1' || config.databaseId !== '(default)') fail('Reviewed EU region/default database required');
  if (config.bucket !== config.projectId + '.firebasestorage.app' || config.authDomain !== config.projectId + '.firebaseapp.com') fail('Cross-project service configuration denied');
  if (config.runtimeServiceAccount !== 'crm4-runtime@' + config.projectId + '.iam.gserviceaccount.com') fail('Dedicated runtime identity required');
  if (config.providers !== 'capture-only') fail('Real providers are outside this release');
  if (config.minimumInstances !== 0 || config.maximumInstances !== 2 || config.concurrency !== 8 || config.memoryMiB !== 1024 || config.timeoutSeconds !== 120) fail('Reviewed resource limits required');
  if (config.privateAccess !== 'IAP named tester allowlist') fail('Private tester access required');
  return Object.freeze({ ...config });
}
module.exports = { validateConfiguration };
