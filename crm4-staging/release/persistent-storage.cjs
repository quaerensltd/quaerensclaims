'use strict';
// Cloud adapter candidate. Construction is offline; the caller supplies the
// explicitly configured Admin app after infrastructure/deployment approval.
const {validateConfiguration} = require('./configuration.cjs');
function createPersistentStorage(app, configuration, getStorage) {
  const config = validateConfiguration(configuration);
  if (app?.options?.projectId !== config.projectId || app.options.storageBucket !== config.bucket || !app.name?.startsWith('crm4-spain-')) throw Error('Explicit CRM4 named app and bucket required');
  const bucket = getStorage(app).bucket(config.bucket);
  return {bucket(name) {
    if (name && name !== config.bucket) throw Error('Cross-project bucket denied');
    return {file(name) {
      if (typeof name !== 'string' || name.includes('..') || !(/^(professional-assessments\/[\w-]+\/versions\/[\w-]+\/(report\.pdf|internal\.docx)|clientPortal\/[\w-]+\/(client-uploads\/[\w-]+\/[\w.-]+|shared\/[\w. -]+))$/.test(name))) throw Error('Unapproved CRM4 object path');
      const file = bucket.file(name);
      return {
        save: (bytes, options) => file.save(bytes, options),
        download: () => file.download(),
        exists: () => file.exists(),
        getMetadata: () => file.getMetadata(),
        delete: options => file.delete(options),
        getSignedUrl: () => file.getSignedUrl({version:'v4', action:'read', expires:Date.now() + 300000})
      };
    }};
  }};
}
module.exports = {createPersistentStorage};
