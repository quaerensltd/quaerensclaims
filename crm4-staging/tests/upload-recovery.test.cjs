'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
test('upload registration rejects incomplete/stale metadata; orphan can resume once; duplicate registration is atomic',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const runtime=require('../tools/local-handlers.cjs').createLocalHandlers(),db=runtime.db;
 const id='upload-'+require('node:crypto').randomUUID(), path=`clientPortal/${id}/client-uploads/${id}/evidence.txt`;
 const file=require('firebase-admin/storage').getStorage(runtime.app).bucket('demo-quaerens-crm4.appspot.com').file(path);
 const request={auth:{uid:id},data:{caseId:id,documentId:id,requirementId:id,storagePath:path,contentType:'text/plain',size:9,title:'Synthetic'}};
 try{
  await db.collection('clientPortalCases').doc(id).set({clientUid:id,accessState:'ACTIVE'});
  await db.collection('clientPortalAccess').doc(id+'_'+id).set({uid:id,caseId:id,active:true});
  await db.collection('clientPortalRequirements').doc(id).set({caseId:id,clientVisible:true,title:'Synthetic invoice'});
  await assert.rejects(runtime.handlers.paidClientRegisterUpload(request),e=>e.code==='failed-precondition');
  assert.equal((await db.collection('clientPortalDocuments').doc(id).get()).exists,false);
  // Completed object with registration interrupted: safe orphan, not yet client-visible.
  await file.save(Buffer.from('Synthetic'),{contentType:'text/plain'});
  await assert.rejects(runtime.handlers.paidClientRegisterUpload({...request,data:{...request.data,size:8}}),e=>e.code==='failed-precondition');
  const replies=await Promise.all([1,2,3].map(()=>runtime.handlers.paidClientRegisterUpload(request)));
  assert.equal(replies.filter(r=>!r.idempotent).length,1);
  assert.equal((await db.collection('clientPortalDocuments').where('caseId','==',id).get()).size,1);
  assert.equal((await db.collection('clientPortalRequirements').doc(id).get()).data().latestDocumentId,id);
  assert.equal((await db.collection('crm4PortalOutbox').where('caseId','==',id).get()).size,1);
  await assert.rejects(runtime.handlers.paidClientRegisterUpload({...request,data:{...request.data,documentId:id+'-alias'}}),e=>e.code==='failed-precondition');
  await assert.rejects(runtime.handlers.paidClientRegisterUpload({...request,data:{...request.data,requirementId:id+'-wrong'}}),e=>e.code==='failed-precondition');
  await assert.rejects(runtime.handlers.paidClientRegisterUpload({...request,auth:{uid:'other'}}),e=>e.code==='permission-denied');
  await db.collection('crm4Memberships').doc(id+'-staff').set({active:true,workspaceId:'CRM4',role:'processing'});
  const cleanRequest={auth:{uid:id+'-staff'},data:{caseId:id,storagePath:path}};
  await assert.rejects(runtime.handlers.crm4ReconcilePortalUpload(cleanRequest),e=>e.code==='failed-precondition');
  await assert.rejects(runtime.handlers.crm4ReconcilePortalUpload({...cleanRequest,auth:{uid:id}}),e=>e.code==='permission-denied');
  const orphanPath=path.replace('evidence.txt','orphan.txt');
  const orphan=require('firebase-admin/storage').getStorage(runtime.app).bucket('demo-quaerens-crm4.appspot.com').file(orphanPath);
  await orphan.save(Buffer.from('orphan'),{contentType:'text/plain'});
  cleanRequest.data.storagePath=orphanPath;
  assert.equal((await runtime.handlers.crm4ReconcilePortalUpload(cleanRequest)).state,'RETAINED_RECENT');
  class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
  const boundary=require('../tools/portal-recovery.cjs').createPortalRecovery(db,{HttpsError,admin:{storage:()=>require('../tools/local-storage.cjs').createLocalStorage(runtime.app)}},{clock:()=>Date.now()+86401000});
  assert.equal((await boundary.reconcileUpload(cleanRequest)).state,'DELETED');
  assert.equal((await orphan.exists())[0],false);
  assert.equal((await boundary.reconcileUpload(cleanRequest)).state,'DELETED');
  assert.equal((await file.exists())[0],true,'Registered evidence retained');
  const legacyPath=path.replace('evidence.txt','legacy.txt'), legacyId=id+'-legacy';
  await require('firebase-admin/storage').getStorage(runtime.app).bucket('demo-quaerens-crm4.appspot.com').file(legacyPath).save(Buffer.from('Synthetic'),{contentType:'text/plain'});
  await db.collection('clientPortalRequirements').doc(legacyId).set({caseId:id,clientVisible:true,title:'Legacy interrupted registration'});
  const partial={caseId:id,uploadedByUid:id,storagePath:legacyPath,requirementId:legacyId,contentType:'text/plain',size:9};
  await db.collection('clientPortalDocuments').doc(legacyId).set(partial);
  const repaired=await runtime.handlers.paidClientRegisterUpload({...request,data:{...request.data,documentId:legacyId,requirementId:legacyId,storagePath:legacyPath}});
  assert.equal(repaired.recoveredLegacy,true);assert.equal(repaired.notificationState,'CAPTURED');
  assert.deepEqual((await db.collection('clientPortalDocuments').doc(legacyId).get()).data(),partial);
  assert.equal((await db.collection('clientPortalRequirements').doc(legacyId).get()).data().latestDocumentId,legacyId);
 }finally{await runtime.close();}
});
