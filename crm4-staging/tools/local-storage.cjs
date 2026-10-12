'use strict';
// Reports stay volatile; portal files use only the explicitly guarded demo Storage emulator.
function createLocalStorage(app) {
  const objects = new Map();
  const tickets = new Map();
  function portal(name) {
    if (!app || process.env.GCLOUD_PROJECT !== 'demo-quaerens-crm4' || process.env.STORAGE_EMULATOR_HOST !== 'http://127.0.0.1:9199') throw Error('Explicit local Storage emulator required');
    const file = require('firebase-admin/storage').getStorage(app).bucket('demo-quaerens-crm4.appspot.com').file(name);
    return { exists: () => file.exists(), download: () => file.download(),
      async getSignedUrl() {
        const [bytes] = await file.download(), token = require('node:crypto').randomBytes(32).toString('hex');
        tickets.set(token,{bytes,expires:Date.now()+300000});
        return ['http://127.0.0.1:5001/__local-document/' + token];
      } };
  }
  return { objects, tickets, bucket: () => ({ file(name) {
    if (/^clientPortal\/[\w-]+\/client-uploads\/[\w-]+\/[\w.-]+$/.test(name)) return portal(name);
    if (!/^professional-assessments\/[\w-]+\/versions\/[\w-]+\/(report\.pdf|internal\.docx)$/.test(name)) throw Error('Unapproved synthetic document path');
    return {
      async save(bytes, options = {}) {
        if (options.preconditionOpts?.ifGenerationMatch === 0 && objects.has(name)) throw Object.assign(Error('Synthetic object already exists'), { code: 412 });
        objects.set(name, Buffer.from(bytes));
      },
      async download() { if (!objects.has(name)) throw Error('Local document missing'); return [Buffer.from(objects.get(name))]; }
    };
  } }) };
}
module.exports = { createLocalStorage };
