'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('manual browser contract creates linked identity atomically and serialises stale/concurrent saves',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='author-'+require('node:crypto').randomUUID();
 const call=(data,uid=id)=>r.handlers.crm4ManualAssessment({auth:{uid,token:{}},data});
 try{
  await r.db.collection('crm4Memberships').doc(id).set({workspaceId:'CRM4',active:true,role:'manager'});
  await r.db.collection('users').doc(id).set({assessmentCapabilities:['assessmentAuthor'],assessmentCategoryAccess:['spray-foam'],assessmentWorkspaceAccess:['CRM4']});
  await r.db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4',email:id+'@example.test',clientName:'Synthetic Author'});
  const input={action:'create',leadId:id,category:'spray-foam',form:{issueSummary:'Reported only',financialPosition:'Unquantified'}};
  await assert.rejects(call(input,'stranger'),e=>e.code==='permission-denied');
  await assert.rejects(call({...input,category:'solar'}));
  const results=await Promise.allSettled([call(input),call(input)]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
  const created=results.find(x=>x.status==='fulfilled').value;
  const read=()=>call({action:'get',id:created.id});
  const original=(await read()).assessment;assert.equal(original.revision,2);assert.equal(original.clientContent.executiveSummary,'Reported only');
  assert.equal(original.assessmentSource,'FRAMEWORK_B');assert.equal(original.generationContractVersion,undefined);
  assert.equal((await r.db.collection('crm4Leads').doc(id).get()).data().assessmentQar,original.qarReference);
  const save={action:'save',id:created.id,revision:2,form:{issueSummary:'Updated once'}};
  const races=await Promise.allSettled([call(save),call(save)]);assert.equal(races.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(races.find(x=>x.status==='rejected').reason.code,'aborted');
  await assert.rejects(call({...save,leadId:'wrong'}));
  await call({action:'submit',id:created.id,revision:3});
  await assert.rejects(call({...save,revision:4}),/Return to draft/);
  await r.db.collection('users').doc(id).update({assessmentCapabilities:['assessmentAuthor','assessmentApprover']});
  await assert.rejects(r.handlers.frameworkBAssessmentApprove({auth:{uid:id,token:{}},data:{id:created.id,checklist:{identity:true,facts:true,calculations:true,evidence:true,wording:true}}}),/own assessment/);
  const ref=r.db.collection('professionalAssessments').doc(created.id);
  await ref.update({'structuredIntake.crm4ManualAuthoringVersion':0});
  await assert.rejects(read(),/migration contract/);
  await ref.update({'structuredIntake.crm4ManualAuthoringVersion':1,generationContractVersion:'assessment-generation-v9'});
  await assert.rejects(read(),/Governed manual/);
  await ref.update({generationContractVersion:require('firebase-admin').firestore.FieldValue.delete()});
  await r.db.collection('crm4Memberships').doc(id).update({active:false});
  await assert.rejects(read(),e=>e.code==='permission-denied');
  assert.equal((await r.db.collection('professionalAssessmentVersions').where('assessmentId','==',created.id).get()).size,0);
 }finally{await r.close();}
});
