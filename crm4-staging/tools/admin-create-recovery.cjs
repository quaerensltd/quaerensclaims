'use strict';
// CRM4 demo boundary. Original validation, membership shape and email rendering
// remain in the pinned handler. No provider is called: the durable receipt IS
// the synthetic provider acceptance. This is not real-email exactly-once proof.
const { createHash } = require('node:crypto');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function adminCreateRecovery(deps, options = {}) {
  const db = deps.db, fault = options.checkpoint || (async () => {});
  return async request => {
    if (process.env.GCLOUD_PROJECT !== 'demo-quaerens-crm4' || process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080' || process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('CRM4 demo emulators required');
    const fail = (code, message) => { throw new deps.HttpsError(code, message); };
    if (!request.auth?.uid || request.auth.token?.platformAdmin !== true) fail('permission-denied', 'Platform administrator required');
    const d = request.data || {}, input = { email: String(d.email || '').trim().toLowerCase(), displayName: String(d.displayName || '').trim(), role: String(d.role || '').trim().toLowerCase(), active: d.active === undefined ? true : d.active, workspaceId: d.workspaceId === undefined ? 'CRM4' : d.workspaceId };
    if (!/^[^@\s]+@(?:crm4\.)?example\.test$/.test(input.email)) fail('permission-denied', 'Synthetic emulator identity required');
    if (!input.displayName || !['lister','manager','closer','processing','administrator'].includes(input.role) || typeof input.active !== 'boolean' || input.workspaceId !== 'CRM4') fail('invalid-argument', 'Invalid CRM4 account request');
    const key = hash(input.email), fingerprint = hash(input), ref = db.collection('crm4AdminCreateOperations').doc(key);
    const previous = await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (snap.exists) {
        const op = snap.data();
        if (op.fingerprint !== fingerprint) fail('failed-precondition', 'Account creation request conflicts; use the membership operation for changes');
        return op;
      }
      const op = { fingerprint, actorUid: request.auth.uid, state: 'PENDING', createdAt: deps.admin.firestore.FieldValue.serverTimestamp() };
      tx.create(ref, op); return op;
    });
    if (previous.state === 'COMPLETE') return previous.result;
    const auth = deps.admin.auth();
    const wrappedAuth = new Proxy(auth, { get(target, property) {
      if (property === 'updateUser') return async (...args) => {
        await fault('BEFORE_AUTH_UPDATE');
        const user = await target.updateUser(...args);
        await fault('AUTH_UPDATED'); return user;
      };
      if (property === 'createUser') return async values => {
        let user;
        try { user = await target.createUser(values); }
        catch (error) { if (error.code !== 'auth/email-already-exists') throw error; user = await target.getUserByEmail(input.email); }
        await fault('AUTH_CREATED'); return user;
      };
      return typeof target[property] === 'function' ? target[property].bind(target) : target[property];
    }});
    const wrappedDb = new Proxy(db, { get(target, property) {
      if (property !== 'collection') return typeof target[property] === 'function' ? target[property].bind(target) : target[property];
      return name => {
        const collection = target.collection(name);
        if (name === 'crm4Memberships') return new Proxy(collection, { get(c, p) {
          if (p !== 'doc') return typeof c[p] === 'function' ? c[p].bind(c) : c[p];
          return uid => {
            const member = c.doc(uid);
            return new Proxy(member, { get(m, method) {
              if (method !== 'set') return typeof m[method] === 'function' ? m[method].bind(m) : m[method];
              return async (data, settings) => {
                await db.runTransaction(async tx => {
                  const op = (await tx.get(ref)).data(), existing = await tx.get(member);
                  if (op.uid && op.uid !== uid) fail('failed-precondition', 'Auth identity conflict');
                  if (op.membershipWritten) return;
                  if (existing.exists) fail('failed-precondition', 'Existing membership requires explicit membership management');
                  tx.set(member, data, settings); tx.update(ref, { uid, membershipWritten: true });
                });
                await fault('MEMBERSHIP_WRITTEN');
              };
            }});
          };
        }});
        if (name === 'crm4MembershipAudit') return { add: async data => {
          const audit = collection.doc('create-' + key);
          await db.runTransaction(async tx => { if (!(await tx.get(audit)).exists) tx.create(audit, data); });
          return audit;
        }};
        return collection;
      };
    }});
    const resend = { emails: { send: async payload => {
      if (payload.to !== input.email) fail('failed-precondition', 'Setup recipient mismatch');
      await fault('BEFORE_CAPTURE');
      const receipt = db.collection('crm4AdminSetupCaptures').doc(key);
      await db.runTransaction(async tx => {
        if (!(await tx.get(receipt)).exists) tx.create(receipt, { operationId: key, recipient: input.email, subject: payload.subject, delivered: false, capturedOnly: true });
      });
      await fault('CAPTURE_ACCEPTED');
      return { data: { id: 'crm4-capture-' + key } };
    }}};
    const original = require('./local-admin.cjs').loadAdmin('crm4AdminCreateUser', { ...deps, db: wrappedDb, admin: { ...deps.admin, auth: () => wrappedAuth }, resend });
    const result = await original({ ...request, auth: { ...request.auth, uid: previous.actorUid }, data: input });
    // Capture is explicitly not external communication, despite the source's
    // provider-branch bookkeeping value.
    result.externalCommunications = 0;
    await ref.update({ state: 'COMPLETE', result });
    return result;
  };
}
module.exports = { adminCreateRecovery };
