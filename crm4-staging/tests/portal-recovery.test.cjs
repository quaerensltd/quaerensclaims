'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { createPortalRecovery } = require('../tools/portal-recovery.cjs');
test('transactional message outbox recovers after failure/restart; concurrent replay captures once; permanent failure terminates', async () => {
  Object.assign(process.env,{ GCLOUD_PROJECT:'demo-quaerens-crm4', FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080' });
  const runtime = require('../tools/local-handlers.cjs').createLocalHandlers(), db = runtime.db;
  class HttpsError extends Error { constructor(code,message) { super(message); this.code=code; } }
  const deps = { db, admin:{firestore:require('firebase-admin').firestore}, HttpsError, onCall:(...args)=>args.at(-1), resendSecret:{} };
  const factory = require('../backend-sources/paidClientCreateMessage/paidClientWorkspace.js').registerPaidClientWorkspace;
  const id='recovery-'+require('node:crypto').randomUUID(); let now=10000;
  const request={auth:{uid:id},data:{caseId:id,requestId:id,body:'Synthetic recovery message'}};
  try {
    await db.collection('clientPortalCases').doc(id).set({clientUid:id,accessState:'ACTIVE'});
    await db.collection('clientPortalAccess').doc(id+'_'+id).set({uid:id,caseId:id,active:true});
    const failed=createPortalRecovery(db,deps,{clock:()=>now,providerFailure:()=>true});
    const first=await failed.wrap('paidClientCreateMessage',factory)(request);
    assert.equal(first.notificationState,'PENDING');
    assert.equal((await db.collection('clientPortalMessages').where('caseId','==',id).get()).size,1);
    assert.equal((await failed.recover({...request,data:{notificationId:first.notificationId}})).notificationState,'PENDING');
    now+=1000;
    // New boundary instance models process restart; no in-memory idempotency state.
    const recovered=createPortalRecovery(db,deps,{clock:()=>now});
    await Promise.all(Array.from({length:5},()=>recovered.recover({...request,data:{notificationId:first.notificationId}})));
    assert.equal((await db.collection('crm4PortalOutbox').doc(first.notificationId).get()).data().state,'CAPTURED');
    assert.equal((await db.collection('crm4CapturedNotifications').doc(first.notificationId).get()).data().delivered,false);
    assert.equal((await recovered.wrap('paidClientCreateMessage',factory)(request)).idempotent,true);
    await assert.rejects(recovered.wrap('paidClientCreateMessage',factory)({...request,data:{...request.data,body:'changed'}}),e=>e.code==='failed-precondition');
    await assert.rejects(recovered.recover({auth:{uid:'wrong'},data:{notificationId:first.notificationId}}),e=>e.code==='permission-denied');
    const legacyRequest={...request,data:{...request.data,requestId:id+'-legacy'}};
    const legacy=factory({...deps,resend:{emails:{send:async()=>{throw Error('Old provider failure');}}}});
    await assert.rejects(legacy.paidClientCreateMessage(legacyRequest),/Old provider failure/);
    const legacyRef=db.collection('clientPortalMessages').doc(`client-${id}-${id}-legacy`), before=(await legacyRef.get()).data();
    const migrated=await recovered.wrap('paidClientCreateMessage',factory)(legacyRequest);
    assert.equal(migrated.notificationState,'CAPTURED'); assert.equal(migrated.recoveredLegacy,true);
    assert.deepEqual((await legacyRef.get()).data(),before,'Legacy message is not rewritten');
    const terminal=await failed.wrap('paidClientCreateMessage',factory)({...request,data:{...request.data,requestId:id+'-terminal'}});
    now+=1000; await failed.recover({...request,data:{notificationId:terminal.notificationId}});
    now+=2000; assert.equal((await failed.recover({...request,data:{notificationId:terminal.notificationId}})).notificationState,'TERMINAL_FAILURE');
    now+=999999; assert.equal((await recovered.recover({...request,data:{notificationId:terminal.notificationId}})).notificationState,'TERMINAL_FAILURE');
    assert.equal((await db.collection('crm4PortalOutbox').doc(terminal.notificationId).get()).data().attempts,3);
    const interrupted=createPortalRecovery(db,deps,{clock:()=>now,afterCapture:async()=>{throw Error('Interrupted acknowledgment');}});
    const uncertain=await interrupted.wrap('paidClientCreateMessage',factory)({...request,data:{...request.data,requestId:id+'-uncertain'}});
    assert.equal(uncertain.notificationState,'PENDING'); now+=1000;
    assert.equal((await recovered.recover({...request,data:{notificationId:uncertain.notificationId}})).notificationState,'CAPTURED');
    assert.equal((await db.collection('crm4CapturedNotifications').doc(uncertain.notificationId).get()).exists,true);
    const crashRequest={...request,data:{...request.data,requestId:id+'-commit'}};
    const crash=createPortalRecovery(db,deps,{clock:()=>now,beforeDispatch:async()=>{throw Error('Process interruption after commit');}});
    await assert.rejects(crash.wrap('paidClientCreateMessage',factory)(crashRequest),/Process interruption/);
    const crashId=require('node:crypto').createHash('sha256').update(`crm4-portal-message:client-${id}-${id}-commit:internal`).digest('hex');
    const runner=`const r=require(${JSON.stringify(require.resolve('../tools/local-handlers.cjs'))}).createLocalHandlers(); r.handlers.crm4RecoverPortalNotification(${JSON.stringify({auth:{uid:id},data:{notificationId:crashId}})}).then(x=>console.log(x.notificationState)).finally(()=>r.close());`;
    const restarted=require('node:child_process').execFileSync(process.execPath,['-e',runner],{encoding:'utf8',timeout:30000});
    assert.match(restarted,/CAPTURED/,'Separate process recovers committed notification');
    const resumed=await recovered.wrap('paidClientCreateMessage',factory)(crashRequest);
    assert.equal(resumed.notificationState,'CAPTURED'); assert.equal(resumed.idempotent,true);
  } finally { await runtime.close(); }
});
