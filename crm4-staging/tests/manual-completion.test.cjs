'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
test('manual completion validates issuance, rolls back, serialises concurrent replay and retains source',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),leadId='completion-'+crypto.randomUUID(),author=leadId+'-author',reviewer=leadId+'-reviewer';
 const call=(name,data,uid=reviewer)=>r.handlers[name]({auth:{uid,token:{}},data});
 const bridge=(data,uid)=>call('crm4ManualAssessment',data,uid);
 try{
  for(const uid of [author,reviewer]){
   await r.db.collection('crm4Memberships').doc(uid).set({workspaceId:'CRM4',active:true,role:'manager'});
   await r.db.collection('users').doc(uid).set({assessmentCapabilities:uid===author?['assessmentAuthor']:['assessmentAuthor','assessmentApprover','assessmentIssuer'],assessmentCategoryAccess:['spray-foam'],assessmentWorkspaceAccess:['CRM4']});
  }
  const lead=r.db.collection('crm4Leads').doc(leadId);await lead.set({workspaceId:'CRM4',email:leadId+'@example.test',clientName:'Synthetic Completion'});
  const created=await bridge({action:'create',leadId,category:'spray-foam',form:{issueSummary:'Reported concern',financialPosition:'Unquantified'}},author),a=r.db.collection('professionalAssessments').doc(created.id);
  await bridge({action:'submit',id:created.id,revision:2},author);
  const approved=await call('frameworkBAssessmentApprove',{id:created.id,checklist:{identity:true,facts:true,calculations:true,evidence:true,wording:true}});
  const data={action:'complete',id:created.id,leadId,revision:(await a.get()).data().revision,versionId:approved.versionId,qarReference:created.qarReference};
  await assert.rejects(bridge(data),/must be issued/);
  const doc=await call('frameworkBAssessmentGenerateDocuments',{id:created.id});
  await call('frameworkBAssessmentIssue',{id:created.id});
  const before=(await lead.get()).data();
  await assert.rejects(bridge(data,author),e=>e.code==='permission-denied');
  await assert.rejects(bridge({...data,revision:0}),e=>e.code==='aborted');
  await assert.rejects(bridge({...data,qarReference:'wrong'}),/linkage mismatch/);
  await assert.rejects(bridge({...data,leadId:'wrong'}),/linkage mismatch/);
  const membership=r.db.collection('crm4Memberships').doc(reviewer);
  for(const patch of [{role:'closer'},{role:'manager',active:false},{active:true,workspaceId:'CRM2'}]){await membership.update(patch);await assert.rejects(bridge(data),e=>e.code==='permission-denied');}
  await membership.update({workspaceId:'CRM4',active:true,role:'manager'});
  const v=r.db.collection('professionalAssessmentVersions').doc(data.versionId),original=(await v.get()).data();
  await v.update({projectionHash:'wrong'});await assert.rejects(bridge(data),/integrity/);await v.update({projectionHash:original.projectionHash});
  const delivery=r.db.collection('professionalAssessmentDeliveries').doc(data.id+'_'+data.versionId);
  await delivery.update({status:'PARTIAL'});await assert.rejects(bridge(data),/issuance incomplete/);await delivery.update({status:'COMPLETE'});
  const stored=require('firebase-admin/storage').getStorage(r.app).bucket('demo-quaerens-crm4.appspot.com').file(doc.pdfPath); const [bytes]=await stored.download(); await stored.save(Buffer.from('bad')); await assert.rejects(bridge(data),e=>e.code==='data-loss'); await stored.save(bytes);
  class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
  const interrupted=require('../tools/manual-completion.cjs').manualCompletion({db:r.db,HttpsError,admin:{firestore:require('firebase-admin').firestore,storage:()=>({bucket:()=>({file:p=>({download:async()=>[r.storageObjects.get(p)]})})})}},{checkpoint:async()=>{throw Error('Synthetic crash');}});
  await assert.rejects(interrupted({auth:{uid:reviewer,token:{}},data}),/Synthetic crash/);
  assert.deepEqual((await lead.get()).data(),before);
  const results=await Promise.all([bridge(data),bridge(data),bridge(data)]);
  assert.equal(results.filter(x=>!x.idempotent).length,1);assert.equal((await bridge(data)).idempotent,true);
  const after=(await lead.get()).data();assert.equal(after.assessmentSource,'FRAMEWORK_B');assert.equal(after.assessmentVersionId,data.versionId);assert.equal(after.actionHistory.length,1);
  assert.equal((await a.get()).data().assessmentSource,'FRAMEWORK_B');
  const audits=await r.db.collection('professionalAssessmentAudit').where('assessmentId','==',data.id).get();assert.equal(audits.docs.filter(x=>x.data().event==='CRM4_MANUAL_COMPLETION_LINKED').length,1);
  const processing=leadId+'-processing';await r.db.collection('crm4Memberships').doc(processing).set({workspaceId:'CRM4',role:'processing',active:true});
  const verify=()=>r.db.runTransaction(tx=>require('../tools/linkage-boundary.cjs').verifyRequest(r.db,tx,{auth:{uid:processing},data:{leadId}},{HttpsError}));
  assert.equal((await verify()).canonical.assessmentSource,'FRAMEWORK_B');
  const completionAudit=audits.docs.find(x=>x.data().event==='CRM4_MANUAL_COMPLETION_LINKED');
  await completionAudit.ref.update({pdfHash:'wrong'});await assert.rejects(verify(),/linkage\/version/);await completionAudit.ref.update({pdfHash:doc.pdfHash});
  await delivery.update({status:'PARTIAL'});await assert.rejects(verify(),/linkage\/version/);await delivery.update({status:'COMPLETE'});
  assert.equal((await verify()).canonical.crmLink.crm4LeadId,leadId);
  await bridge({action:'correct',id:data.id,revision:data.revision},author);
  await assert.rejects(bridge(data),e=>e.code==='aborted');
  await assert.rejects(verify(),/linkage\/version/);
 }finally{await r.close();}
});
