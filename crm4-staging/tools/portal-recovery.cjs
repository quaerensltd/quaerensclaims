'use strict';
// CRM4-only durability boundary; never edit or replace the pinned business factory.
const { createHash, randomUUID } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const OUTBOX = 'crm4PortalOutbox', RECEIPTS = 'crm4CapturedNotifications';
function createPortalRecovery(db, deps, options = {}) {
  if (process.env.GCLOUD_PROJECT !== 'demo-quaerens-crm4' || process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8080') throw Error('CRM4 demo Firestore required');
  const clock = options.clock || Date.now;
  const fail = (code, message) => { throw new deps.HttpsError(code, message); };
  async function authorised(tx, request, caseId, staffOnly = false) {
    if (!request.auth?.uid) fail('unauthenticated', 'Authentication required');
    const member = (await tx.get(db.collection('crm4Memberships').doc(request.auth.uid))).data();
    const portal = (await tx.get(db.collection('clientPortalCases').doc(caseId))).data();
    if (!portal || portal.accessState !== 'ACTIVE') fail('permission-denied', 'Active portal required');
    if (/^crm[23][:-]/i.test(caseId) || [portal.workspaceId,portal.crmLink?.workspaceId].some(v=>v && v!=='CRM4')) fail('permission-denied','CRM4 workspace required');
    if (member?.active && member.workspaceId === 'CRM4' && ['processing', 'administrator'].includes(member.role)) return;
    if (staffOnly) fail('permission-denied', 'CRM4 Processing/Administrator required');
    const access = (await tx.get(db.collection('clientPortalAccess').doc(request.auth.uid + '_' + caseId))).data();
    if (!access?.active || access.uid !== request.auth.uid || access.caseId !== caseId || portal.clientUid !== request.auth.uid) fail('permission-denied', 'Own client case required');
  }
  async function dispatch(request, id) {
    const ref = db.collection(OUTBOX).doc(id), owner = randomUUID();
    const row = await db.runTransaction(async tx => {
      const snap = await tx.get(ref); if (!snap.exists) fail('not-found', 'Notification not found');
      const data = snap.data(); await authorised(tx, request, data.caseId, data.staffOnly === true);
      const receipt=await tx.get(db.collection(RECEIPTS).doc(id));
      if(receipt.exists && data.state!=='CAPTURED') {
        tx.update(ref,{state:'CAPTURED',leaseUntil:0,nextAttemptAt:0,owner:null});
        tx.update(db.collection('clientPortalNotifications').doc(data.eventId),{status:'SENT',capturedOnly:true,delivered:false});
        tx.create(db.collection('crm4RecoveryAudit').doc(id+'-receipt-reconciled'),{event:'CAPTURE_RECONCILED',notificationId:id,actorUid:request.auth.uid,at:clock()});
        return {...data,state:'CAPTURED'};
      }
      if (['CAPTURED', 'TERMINAL_FAILURE'].includes(data.state) || data.nextAttemptAt > clock() || data.leaseUntil > clock()) return data;
      const attempt = data.attempts + 1;
      if (attempt > 3) { tx.update(ref, { state: 'TERMINAL_FAILURE', leaseUntil: 0 }); tx.update(db.collection('clientPortalNotifications').doc(data.eventId),{status:'TERMINAL_FAILURE'}); tx.create(db.collection('crm4RecoveryAudit').doc(id+'-lease-exhausted'),{event:'TERMINAL_FAILURE',notificationId:id,actorUid:request.auth.uid,at:clock()}); return { ...data, state: 'TERMINAL_FAILURE' }; }
      tx.update(ref, { state: 'PROCESSING', attempts: attempt, leaseUntil: clock() + 5000, owner });
      tx.create(db.collection('crm4RecoveryAudit').doc(id + '-attempt-' + attempt), { event: 'ATTEMPT', notificationId: id, attempt, actorUid: request.auth.uid, at: clock() });
      return { ...data, attempts: attempt, acquired: true };
    });
    if (!row.acquired) return { notificationId: id, notificationState: row.state };
    try {
      // Durable synthetic provider ledger models provider idempotency across process restarts.
      await db.runTransaction(async tx => {
        const receipt = db.collection(RECEIPTS).doc(id), old = await tx.get(receipt);
        if (old.exists) return;
        if (options.providerFailure?.(row)) throw Error('Synthetic provider failure');
        const recipients = [row.payload.to, row.payload.cc, row.payload.bcc].flat(2).filter(Boolean);
        if (!recipients.length || recipients.some(e => !/@example\.test$/.test(e) && !['info@quaerens.co.uk', 'support@quaerens.co.uk'].includes(e))) throw Error('Non-synthetic recipient rejected');
        tx.create(receipt, { delivered: false, captured: true, idempotencyKey: row.key, capturedAt: clock() });
      });
      if (options.afterCapture) await options.afterCapture(); // test-only interrupted acknowledgment
      await finish('CAPTURED');
      return { notificationId: id, notificationState: 'CAPTURED' };
    } catch {
      const state = row.attempts >= 3 ? 'TERMINAL_FAILURE' : 'PENDING';
      await finish(state);
      return { notificationId: id, notificationState: state };
    }
    async function finish(state) {
      await db.runTransaction(async tx => {
        const latest = (await tx.get(ref)).data(); if (latest.owner !== owner) return;
        tx.update(ref, { state, leaseUntil: 0, nextAttemptAt: state === 'PENDING' ? clock() + 1000 * 2 ** (row.attempts - 1) : 0 });
        tx.update(db.collection('clientPortalNotifications').doc(row.eventId), { status: state === 'CAPTURED' ? 'SENT' : state, capturedOnly: true, delivered: false });
        tx.create(db.collection('crm4RecoveryAudit').doc(id + '-result-' + row.attempts), { event: state, notificationId: id, attempt: row.attempts, actorUid: request.auth.uid, at: clock() });
      });
    }
  }
  function wrap(name, factory) {
    return async request => {
      const result = await db.runTransaction(async tx => {
        const staffMessage = name === 'paidClientStaffCreateMessage';
        const caseId = staffMessage ? 'crm4-' + request.data?.leadId : request.data?.caseId;
        if (typeof caseId !== 'string' || !caseId || caseId.includes('/')) fail('invalid-argument', 'Exact case required');
        await authorised(tx, request, caseId, staffMessage);
        const linkage = staffMessage ? await require('./linkage-boundary.cjs').verifyRequest(db,tx,request,deps) : null;
        const messagePrefix = staffMessage ? 'staff' : 'client', destination = staffMessage ? 'client' : 'internal';
        const writes = new Map(); let intent;
        let legacyMessagePath, legacyEventPath, legacyUploadPath;
        if (['paidClientCreateMessage','paidClientStaffCreateMessage'].includes(name) && /^[a-zA-Z0-9-]{16,80}$/.test(request.data.requestId || '')) {
          const messageId=`${messagePrefix}-${caseId}-${request.data.requestId}`, eventId=`portal-message:${messageId}:${destination}`;
          const prior=(await tx.get(db.collection('clientPortalMessages').doc(messageId))).data();
          const event=(await tx.get(db.collection('clientPortalNotifications').doc(eventId))).data();
          const outbox=await tx.get(db.collection(OUTBOX).doc(hash('crm4-'+eventId)));
          if (prior && !outbox.exists && event?.status==='PENDING' && event.caseId===caseId && event.messageId===messageId) {
            if (prior.senderUid!==request.auth.uid || prior.body!==String(request.data.body||'').trim().slice(0,8000)) fail('failed-precondition','Conflicting legacy message replay');
            legacyMessagePath='clientPortalMessages/'+messageId; legacyEventPath='clientPortalNotifications/'+eventId;
          }
        }
        const allowed = new Set(['clientPortalMessages','clientPortalNotifications','clientPortalAudit','clientPortalActivity','clientPortalDocuments','clientPortalRequirements',...(staffMessage?['clientPortalCases']:[])]);
        function merge(a,b) { const value={...a};for(const [key,item] of Object.entries(b))value[key]=item&&Object.getPrototypeOf(item)===Object.prototype?merge(value[key],item):item;return value; }
        function document(ref) {
          return { id: ref.id, path: ref.path,
            get: async () => { const s = await tx.get(ref); const value = linkage && ref.path==='professionalAssessments/'+linkage.assessmentId ? linkage.canonical : ref.path===legacyMessagePath ? undefined : writes.get(ref.path)?.data || s.data(); return { exists: value !== undefined, id: ref.id, ref: document(ref), data: () => value }; },
            set: async (data,options) => { if(!allowed.has(ref.parent.id))throw Error('Unexpected write');const old=await tx.get(ref),prior=writes.get(ref.path);writes.set(ref.path,{ref,data:options?.merge?merge(prior?.data||old.data(),data):data,create:!!prior?.create}); },
            create: async data => { if (!allowed.has(ref.parent.id)) throw Error('Unexpected write'); const old=await tx.get(ref); if(ref.path===legacyMessagePath || ref.path===legacyUploadPath)return; if(ref.path===legacyEventPath){writes.set(ref.path,{ref,data:{...data,...old.data()},create:false});return;} if (old.exists || writes.has(ref.path)) fail('already-exists','Record exists'); writes.set(ref.path,{ref,data,create:true}); },
            update: async data => { if (!allowed.has(ref.parent.id)) throw Error('Unexpected write'); const prior = writes.get(ref.path); const s = await tx.get(ref); if (!prior && !s.exists) fail('not-found','Record missing'); writes.set(ref.path,{ref,data:{...(prior?.data || s.data()),...data},create:!!prior?.create}); }
          };
        }
        function collection(name,query=db.collection(name)) { return { doc:id=>document(id?db.collection(name).doc(id):db.collection(name).doc()),add:async data=>{const r=document(db.collection(name).doc());await r.create(data);return r;},where:(...args)=>collection(name,query.where(...args)),limit:n=>collection(name,query.limit(n)),get:()=>tx.get(query) }; }
        const view = { collection, batch:()=>{const jobs=[];const batch={create:(r,d)=>{jobs.push(r.create(d));return batch;},set:(r,d,o)=>{jobs.push(r.set(d,o));return batch;},commit:()=>Promise.all(jobs)};return batch;} };
        const provider = { emails: { send: async (payload, config) => { if (intent) throw Error('One notification expected'); intent = { payload, key: config.idempotencyKey }; return { data: { id: 'local-pending' } }; } } };
        const original = factory({ ...deps, db: view, resend: provider });
        let reply;
        if (name === 'paidClientRegisterUpload') {
          const d = request.data;
          if (typeof d.documentId !== 'string' || !d.documentId || d.documentId.includes('/') || typeof d.requirementId !== 'string' || !d.requirementId || d.requirementId.includes('/')) fail('invalid-argument','Exact document/requirement required');
          if (typeof d.storagePath !== 'string' || !d.storagePath.startsWith(`clientPortal/${caseId}/client-uploads/${request.auth.uid}/`)) fail('permission-denied','Own upload path required');
          if ((await tx.get(db.collection('crm4UploadCleanup').doc(hash(d.storagePath)))).exists) fail('failed-precondition','Upload quarantined for cleanup');
          const file = deps.admin.storage().bucket().file(d.storagePath);
          if (!(await file.exists())[0]) fail('failed-precondition','Upload incomplete or missing');
          const [metadata] = await file.getMetadata();
          if (Number(metadata.size) !== Number(d.size) || metadata.contentType !== d.contentType) fail('failed-precondition','Storage metadata does not match registration');
          const aliases=await tx.get(db.collection('clientPortalDocuments').where('storagePath','==',d.storagePath));
          if(aliases.docs.some(doc=>doc.id!==d.documentId)) fail('failed-precondition','Object already registered under another identity');
          const previous = (await tx.get(db.collection('clientPortalDocuments').doc(d.documentId))).data();
          if (previous) {
            if (previous.caseId !== caseId || previous.uploadedByUid !== request.auth.uid || ['storagePath','requirementId','contentType','size'].some(k => previous[k] !== d[k])) fail('failed-precondition','Conflicting upload replay');
            const req = (await tx.get(db.collection('clientPortalRequirements').doc(d.requirementId))).data();
            if (req?.caseId !== caseId || req.clientVisible !== true) fail('permission-denied','Requirement unavailable');
            if (req.latestDocumentId && req.latestDocumentId!==d.documentId) fail('failed-precondition','A newer document supersedes this registration');
            reply = { id:d.documentId, status:'ALREADY_REGISTERED', idempotent:true };
            const eid=`portal-upload:${d.documentId}:internal`, priorEvent=(await tx.get(db.collection('clientPortalNotifications').doc(eid))).data();
            const priorOutbox=await tx.get(db.collection(OUTBOX).doc(hash('crm4-'+eid)));
            if (!priorOutbox.exists && (!priorEvent || priorEvent.status==='PENDING')) {
              if (priorEvent && (priorEvent.caseId!==caseId || priorEvent.documentId!==d.documentId)) fail('failed-precondition','Notification linkage conflict');
              legacyUploadPath='clientPortalDocuments/'+d.documentId;
              if(priorEvent)legacyEventPath='clientPortalNotifications/'+eid;
              reply=undefined;
            }
          }
        } else {
          const previous = (await tx.get(db.collection('clientPortalMessages').doc(`${messagePrefix}-${caseId}-${request.data.requestId}`))).data();
          if (previous && (previous.body !== String(request.data.body || '').trim().slice(0,8000) || previous.senderUid !== request.auth.uid)) fail('failed-precondition','Conflicting message replay');
        }
        reply ||= await original[name](request);
        const eventId = name !== 'paidClientRegisterUpload' ? 'portal-message:' + reply.id + ':' + destination : 'portal-upload:' + reply.id + ':internal';
        const id = hash('crm4-' + eventId), outboxRef = db.collection(OUTBOX).doc(id);
        const old = await tx.get(outboxRef);
        if (intent && !old.exists) {
          tx.create(outboxRef, { ...intent, caseId, eventId, staffOnly:staffMessage, state:'PENDING', attempts:0, nextAttemptAt:0, leaseUntil:0, createdAt:clock() });
          const pending = writes.get('clientPortalNotifications/' + eventId);
          pending.data = { ...pending.data, status:'PENDING', capturedOnly:true, delivered:false, providerMessageId:null, sentAt:null };
        }
        for (const w of writes.values()) { if (w.create) tx.create(w.ref,w.data); else tx.set(w.ref,w.data); }
        return { ...reply, ...(legacyMessagePath || legacyUploadPath?{idempotent:true,recoveredLegacy:true}:{}), notificationId:id, recoverable:old.exists || !!intent };
      });
      if (options.beforeDispatch) await options.beforeDispatch();
      return result.recoverable ? { ...result, ...await dispatch(request,result.notificationId) } : result;
    };
  }
  async function reconcileUpload(request) {
    const { caseId, storagePath } = request.data || {};
    if (typeof caseId !== 'string' || !caseId || caseId.includes('/') || typeof storagePath !== 'string') fail('invalid-argument','Exact case and upload path required');
    const marker=db.collection('crm4UploadCleanup').doc(hash(storagePath));
    const selected=await db.runTransaction(async tx=>{
      await authorised(tx,request,caseId,true);
      const portal=(await tx.get(db.collection('clientPortalCases').doc(caseId))).data();
      if (!storagePath.startsWith(`clientPortal/${caseId}/client-uploads/${portal.clientUid}/`)) fail('permission-denied','Upload must belong to selected client');
      const registered=await tx.get(db.collection('clientPortalDocuments').where('storagePath','==',storagePath));
      if (!registered.empty) fail('failed-precondition','Registered evidence must not be deleted');
      const old=(await tx.get(marker)).data();
      if (old) return old;
      const file=deps.admin.storage().bucket().file(storagePath);
      if (!(await file.exists())[0]) return {state:'MISSING'};
      const [metadata]=await file.getMetadata();
      const created=Date.parse(metadata.timeCreated);
      if (!Number.isFinite(created) || clock()-created<86400000) return {state:'RETAINED_RECENT'};
      const data={caseId,storagePath,generation:metadata.generation,state:'QUARANTINED',actorUid:request.auth.uid,at:clock()};
      tx.create(marker,data); return data;
    });
    if (selected.state!=='QUARANTINED') return {state:selected.state};
    const file=deps.admin.storage().bucket().file(storagePath);
    if ((await file.exists())[0]) await file.delete({ifGenerationMatch:selected.generation});
    await marker.update({state:'DELETED',deletedAt:clock()});
    return {state:'DELETED'};
  }
  return { wrap, reconcileUpload, recover: request => {
    const id = request.data?.notificationId;
    if (!/^[a-f0-9]{64}$/.test(id || '')) fail('invalid-argument','Exact notification identity required');
    return dispatch(request,id);
  } };
}
module.exports = { createPortalRecovery };
