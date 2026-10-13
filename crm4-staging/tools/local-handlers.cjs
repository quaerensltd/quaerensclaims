'use strict';
// Local integration entrypoint, not a deployed Firebase export. Only reviewed
// non-provider handlers are exposed; all other factory exports stay private.
function createLocalHandlers(env = process.env) {
  if (env.GCLOUD_PROJECT !== 'demo-quaerens-crm4' || env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') {
    throw Error('Explicit demo project and loopback Firestore emulator required');
  }
  // Validate the real SDK environment as well as a caller-provided environment.
  if (process.env.GCLOUD_PROJECT !== env.GCLOUD_PROJECT || process.env.FIRESTORE_EMULATOR_HOST !== env.FIRESTORE_EMULATOR_HOST) throw Error('SDK environment mismatch');
  if (process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL && process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL !== 'archive@example.test') throw Error('Synthetic archive recipient required');
  process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL = 'archive@example.test';
  const { initializeApp, deleteApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const app = initializeApp({ projectId: 'demo-quaerens-crm4' }, 'crm4-local-' + require('node:crypto').randomUUID());
  const db = getFirestore(app);
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const forbidden = () => { throw Error('External providers are disabled in CRM4 local integration'); };
  const providers = require('./local-providers.cjs').createLocalProviders();
  if (!process.env.STORAGE_EMULATOR_HOST) process.env.STORAGE_EMULATOR_HOST = 'http://127.0.0.1:9199';
  if (process.env.STORAGE_EMULATOR_HOST !== 'http://127.0.0.1:9199') throw Error('CRM4 loopback Storage required');
  const storage = require('./local-storage.cjs').createLocalStorage(app);
  const localAuth = () => {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Loopback Auth emulator required');
    return require('firebase-admin/auth').getAuth(app);
  };
  const deps = { db, admin: { firestore: require('firebase-admin').firestore, storage: () => storage, auth: localAuth }, HttpsError, onCall: (...args) => args.at(-1),
    resendSecret: { value: forbidden }, resend: providers.resend };
  const handlers = require('./register-handlers.cjs').registerHandlers(deps);
  return { db, app, providerReceipts: providers.receipts, downloadTickets: storage.tickets, storageObjects: storage.objects, handlers: Object.freeze(handlers), async close() { await db.terminate(); await deleteApp(app); } };
}
module.exports = { createLocalHandlers };
