'use strict';
// Local integration entrypoint, not a deployed Firebase export. Only reviewed
// non-provider handlers are exposed; all other factory exports stay private.
function createLocalHandlers(env = process.env) {
  if (env.GCLOUD_PROJECT !== 'demo-quaerens-crm4' || env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') {
    throw Error('Explicit demo project and loopback Firestore emulator required');
  }
  // Validate the real SDK environment as well as a caller-provided environment.
  if (process.env.GCLOUD_PROJECT !== env.GCLOUD_PROJECT || process.env.FIRESTORE_EMULATOR_HOST !== env.FIRESTORE_EMULATOR_HOST) throw Error('SDK environment mismatch');
  const { initializeApp, deleteApp } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  const app = initializeApp({ projectId: 'demo-quaerens-crm4' }, 'crm4-local-' + require('node:crypto').randomUUID());
  const db = getFirestore(app);
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const forbidden = () => { throw Error('External providers are disabled in CRM4 local integration'); };
  const deps = { db, admin: {}, HttpsError, onCall: (...args) => args.at(-1),
    resendSecret: { value: forbidden }, resend: { emails: { send: forbidden } } };
  const referral = require('../backend-sources/crm4ListerCreateReferralLead/crm4ManualReferral.js').registerCrm2ManualReferral(deps);
  const manager = require('../backend-sources/crm4ManagerGetLinkedAssessment/crm4OperationalFlow.js').registerCrm2OperationalFlow(deps);
  return { db, handlers: Object.freeze({
    crm4ListerCreateReferralLead: referral.crm4ListerCreateReferralLead,
    crm4ManagerGetLinkedAssessment: manager.crm4ManagerGetLinkedAssessment
  }), async close() { await db.terminate(); await deleteApp(app); } };
}
module.exports = { createLocalHandlers };
