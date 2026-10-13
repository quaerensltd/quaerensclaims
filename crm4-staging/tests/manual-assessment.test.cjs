'use strict';
const test=require('node:test'), assert=require('node:assert/strict'), crypto=require('node:crypto');
test('manual approval, immutable documents, captured issue and legacy completion preserve linkage and v9 separation',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(), id='manual-'+crypto.randomUUID(), manager=id+'-manager';
 const invoke=(name,data={},uid=manager)=>r.handlers[name]({auth:{uid,token:{email:uid+'@example.test'}},data:{id,...data}});
 const a=r.db.collection('professionalAssessments').doc(id), l=r.db.collection('crm4Leads').doc(id);
 try {
  await r.db.collection('crm4Memberships').doc(manager).set({workspaceId:'CRM4',active:true,role:'manager'});
  await r.db.collection('users').doc(manager).set({assessmentCapabilities:['assessmentApprover','assessmentReviewer','assessmentIssuer'],assessmentCategoryAccess:['spray-foam'],assessmentWorkspaceAccess:['CRM4']});
  await l.set({workspaceId:'CRM4',assessmentId:id,assessmentQar:'QAR-SYNTHETIC-'+id});
  await a.set({assessmentSource:'FRAMEWORK_B',category:'spray-foam',qarReference:'QAR-SYNTHETIC-'+id,status:'UNDER REVIEW',revision:1,currentVersion:0,authorUid:id+'-author',crmLink:{workspaceId:'CRM4',sourceCollection:'crm4Leads',caseRef:id,clientRef:id,snapshot:{clientName:'Synthetic Manual',email:id+'@example.test'}},clientContent:{executiveSummary:'Synthetic client-reported information; no entitlement established.'},financialExposure:[],evidence:[],chronology:[],findings:[]});
  await assert.rejects(invoke('frameworkBAssessmentApprove',{},id+'-stranger'),e=>e.code==='permission-denied');
  await assert.rejects(invoke('frameworkBAssessmentApprove',{}),e=>e.code==='failed-precondition');
  assert.equal((await invoke('frameworkBAssessmentRequestCorrections',{reason:'Confirm evidence status'})).status,'DRAFT');
  assert.equal((await a.get()).data().correctionsRequested,true);
  // A new reviewed input fixture, not a claim to execute the unregistered author UI.
  await a.update({status:'UNDER REVIEW',revision:2});
  const checklist={identity:true,facts:true,calculations:true,evidence:true,wording:true};
  await a.update({authorUid:manager});
  await assert.rejects(invoke('frameworkBAssessmentApprove',{checklist}),/own assessment/);
  await a.update({authorUid:id+'-author'});
  await assert.rejects(invoke('frameworkBAssessmentApprove',{checklist,expectedRevision:1}),/Stale/);
  const results=await Promise.allSettled([invoke('frameworkBAssessmentApprove',{checklist}),invoke('frameworkBAssessmentApprove',{checklist})]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
  const approved=results.find(x=>x.status==='fulfilled').value;
  const v=r.db.collection('professionalAssessmentVersions').doc(approved.versionId), immutable=(await v.get()).data();
  assert.equal(immutable.version,1);assert.equal(immutable.immutable,true);
  await v.update({'projection.executiveSummary':'Corrupt synthetic projection'});
  await assert.rejects(invoke('frameworkBAssessmentGenerateDocuments'),/integrity mismatch/);
  await v.update({projection:immutable.projection});
  const doc=await invoke('frameworkBAssessmentGenerateDocuments');
  assert.equal((await invoke('frameworkBAssessmentGenerateDocuments')).documentId,doc.documentId);
  assert.equal(crypto.createHash('sha256').update(r.storageObjects.get(doc.pdfPath)).digest('hex'),doc.pdfHash);
  assert.equal(r.storageObjects.get(doc.pdfPath).subarray(0,4).toString(),'%PDF');
  assert.equal(r.storageObjects.get(doc.docxPath).subarray(0,2).toString(),'PK');
  await v.update({qarReference:'WRONG'});
  await assert.rejects(invoke('frameworkBAssessmentIssue'),/identity mismatch/);
  await v.update({qarReference:immutable.qarReference});
  class HttpsError extends Error {constructor(code,message){super(message);this.code=code;}}
  const deps={db:r.db,admin:{firestore:require('firebase-admin').firestore,storage:()=>({bucket:()=>({file:path=>({download:async()=>[r.storageObjects.get(path)]})})})},HttpsError,onCall:(...args)=>args.at(-1)};
  const factory=require('../backend-sources/frameworkBAssessmentIssue/frameworkB.js').registerFrameworkB;
  for(const stage of ['CAPTURE_STAGED','BEFORE_COMMIT']) {
   const interrupted=require('../tools/manual-issue-recovery.cjs').manualIssueRecovery(deps,factory,{checkpoint:async point=>{if(point===stage)throw Error('Synthetic issuance interruption');}});
   await assert.rejects(interrupted({auth:{uid:manager,token:{email:manager+'@example.test'}},data:{id}}));
   assert.equal((await a.get()).data().status,'APPROVED');
   assert.equal((await v.get()).data().status,'APPROVED');
   assert.equal((await r.db.collection('professionalAssessmentDeliveries').where('assessmentId','==',id).get()).size,0);
   assert.equal((await r.db.collection('crm4ManualIssueCaptures').where('recipient','==',id+'@example.test').get()).size,0);
  }
  const restarted=require('../tools/local-handlers.cjs').createLocalHandlers();
  let attempts;
  try {
   assert.equal(restarted.storageObjects.size,0,'Fresh runtime has no document memory cache');
   const issue=()=>restarted.handlers.frameworkBAssessmentIssue({auth:{uid:manager,token:{email:manager+'@example.test'}},data:{id}});
   attempts=await Promise.allSettled([issue(),issue()]);
  }finally{await restarted.close();}
  assert.equal(attempts.filter(v=>v.status==='fulfilled').length,1);
  const issued=attempts.find(v=>v.status==='fulfilled').value;assert.equal(issued.status,'ISSUED');
  const captures=await r.db.collection('crm4ManualIssueCaptures').where('recipient','==',id+'@example.test').get();
  assert.equal(captures.size,1);assert.equal(captures.docs[0].data().delivered,false);
  assert.equal(r.providerReceipts.length,0);
  await assert.rejects(invoke('frameworkBAssessmentIssue'),e=>e.code==='failed-precondition');
  assert.equal(r.providerReceipts.length,0);
  const after=(await v.get()).data();assert.deepEqual(after.projection,immutable.projection);assert.equal(after.projectionHash,immutable.projectionHash);
  await assert.rejects(invoke('crm4AssessmentAssistantCompleteIssue',{assessmentId:id,leadId:id}),e=>e.code==='permission-denied');
  // Separate legacy AI input uses the same issuance evidence; current v9 never enters this route.
  await a.update({assessmentSource:'AI_ASSISTED'});
  const delivery=r.db.collection('professionalAssessmentDeliveries').doc(issued.deliveryId);
  await delivery.update({versionId:'OLD'});
  await assert.rejects(invoke('crm4AssessmentAssistantCompleteIssue',{assessmentId:id,leadId:id}),/Current immutable/);
  await delivery.update({versionId:approved.versionId});
  assert.equal((await invoke('crm4AssessmentAssistantCompleteIssue',{assessmentId:id,leadId:id})).status,'COMPLETED');
  assert.equal((await invoke('crm4AssessmentAssistantCompleteIssue',{assessmentId:id,leadId:id})).idempotent,true);
  assert.equal((await l.get()).data().actionHistory.length,1);
  await a.update({generationContractVersion:'assessment-generation-v9'});
  await assert.rejects(invoke('frameworkBAssessmentGenerateDocuments'),/versioned Assessment Assistant/);
  await a.update({'crmLink.workspaceId':'CRM2'});
  await assert.rejects(invoke('frameworkBAssessmentRequestCorrections'),/CRM4 assessment/);
 } finally {await r.close();}
});
