'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('staff message recovery preserves pinned permissions, durable intent, bounded retry and one capture',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),db=r.db,id='staff-'+require('node:crypto').randomUUID(),caseId='crm4-'+id;
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 const deps={db,admin:{firestore:require('firebase-admin').firestore},HttpsError,onCall:(...args)=>args.at(-1),resendSecret:{}};
 const factory=require('../backend-sources/paidClientStaffCreateMessage/paidClientWorkspace.js').registerPaidClientWorkspace;
 let now=10000;const recovery=options=>require('../tools/portal-recovery.cjs').createPortalRecovery(db,deps,{clock:()=>now,...options});
 const req={auth:{uid:id,token:{}},data:{leadId:id,body:'Synthetic staff recovery',requestId:id}};
 try {
  await db.collection('crm4Memberships').doc(id).set({active:true,role:'processing',workspaceId:'CRM4'});
  await db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4',assessmentId:id,assessmentQar:'QAR-'+id,assessmentStatus:'COMPLETED',assessmentVersion:1,processingStatus:'accepted',email:id+'@example.test'});
  await db.collection('professionalAssessments').doc(id).set({status:'COMPLETED',currentVersion:1,qarReference:'QAR-'+id,crmLink:{workspaceId:'CRM4',sourceCollection:'crm4Leads',caseRef:id,clientRef:id}});
  await db.collection('professionalAssessmentDocuments').doc(id).set({assessmentId:id,version:1,pdfPath:'synthetic-report.pdf'});
  await db.collection('clientPortalCases').doc(caseId).set({accessState:'ACTIVE',clientUid:id+'-client',workspaceId:'CRM4',onboardingChecklist:{loginExplained:true}});
  const failed=recovery({providerFailure:()=>true}),first=await failed.wrap('paidClientStaffCreateMessage',factory)(req);
  assert.equal(first.notificationState,'PENDING');
  assert.equal((await db.collection('clientPortalCases').doc(caseId).get()).data().onboardingChecklist.loginExplained,true);
  const recoverReq={auth:req.auth,data:{notificationId:first.notificationId}};
  await assert.rejects(failed.recover({auth:{uid:id+'-client'},data:recoverReq.data}),e=>e.code==='permission-denied');
  now+=1000;
  const restarted=recovery({});await Promise.all([1,2,3].map(()=>restarted.recover(recoverReq)));
  assert.equal((await db.collection('crm4PortalOutbox').doc(first.notificationId).get()).data().state,'CAPTURED');
  assert.equal((await restarted.wrap('paidClientStaffCreateMessage',factory)(req)).idempotent,true);
  assert.equal((await db.collection('clientPortalMessages').where('caseId','==',caseId).get()).size,1);
  const legacyReq={...req,data:{...req.data,requestId:id+'-legacy'}};
  const legacy=factory({...deps,resend:{emails:{send:async()=>{throw Error('Synthetic old provider failure');}}}});
  await assert.rejects(legacy.paidClientStaffCreateMessage(legacyReq),/old provider failure/);
  const originalRef=db.collection('clientPortalMessages').doc(`staff-${caseId}-${id}-legacy`),before=(await originalRef.get()).data();
  const migrated=await restarted.wrap('paidClientStaffCreateMessage',factory)(legacyReq);
  assert.equal(migrated.notificationState,'CAPTURED');assert.equal(migrated.recoveredLegacy,true);
  assert.deepEqual((await originalRef.get()).data(),before);
  const terminal=await failed.wrap('paidClientStaffCreateMessage',factory)({...req,data:{...req.data,requestId:id+'-terminal'}});
  now+=1000;await failed.recover({auth:req.auth,data:{notificationId:terminal.notificationId}});
  now+=2000;assert.equal((await failed.recover({auth:req.auth,data:{notificationId:terminal.notificationId}})).notificationState,'TERMINAL_FAILURE');
  await db.collection('crm4Memberships').doc(id).update({workspaceId:'CRM2'});
  await assert.rejects(restarted.wrap('paidClientStaffCreateMessage',factory)(req),e=>e.code==='permission-denied');
 } finally {await r.close();}
});
