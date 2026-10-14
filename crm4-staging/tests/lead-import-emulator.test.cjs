'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
test('synthetic preview rows reuse governed creation, retry/duplicate protection, individual audit and guarded handoff',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id=crypto.randomUUID(),staff=[1,2].map(n=>({uid:'import-'+n+'-'+id,workspaceId:'CRM4',active:true,role:'lister',roles:['lister','closer'],displayName:'Synthetic Import '+n})),manager='import-manager-'+id;
 const call=(uid,name,data)=>r.handlers[name]({auth:{uid,token:{}},data});
 try{
  for(const s of staff)await r.db.collection('crm4Memberships').doc(s.uid).set(s);await r.db.collection('crm4Memberships').doc(manager).set({workspaceId:'CRM4',active:true,role:'manager'});
  const csv='sourceRowId,forename,surname,email,referralSource,assigneeUid\na,Synthetic,One,one-'+id+'@example.test,direct_enquiry,'+staff[0].uid+'\nb,Synthetic,Two,two-'+id+'@example.test,direct_enquiry,'+staff[1].uid;
  const p=require('../tools/lead-import-preview.cjs').preview(csv,{batchId:id,staff,existingRevision:'synthetic-empty'});assert.equal(p.counts.accepted,2);
  // Each request uses its own synthetic authenticated actor; no administrator impersonation path.
  const first=await call(staff[0].uid,p.rows[0].handler,p.rows[0].data);
  const resumed=await call(staff[0].uid,p.rows[0].handler,p.rows[0].data);assert.equal(resumed.leadId,first.leadId);assert.equal(resumed.idempotent,true);
  const second=await call(staff[1].uid,p.rows[1].handler,p.rows[1].data);assert.notEqual(second.leadId,first.leadId);
  const ref=r.db.collection('crm4Leads').doc(first.leadId),lead=(await ref.get()).data();assert.equal(lead.workspaceId,'CRM4');assert.equal(lead.createdBy,staff[0].uid);assert.equal(lead.assignedToUid,staff[0].uid);assert.equal(lead.actionHistory.length,1);assert.equal(lead.actionHistory[0].byUid,staff[0].uid);
  const duplicate=await call(staff[1].uid,p.rows[0].handler,{...p.rows[0].data,requestId:'duplicate-'+id});assert.equal(duplicate.status,'POSSIBLE_DUPLICATE');assert.equal(duplicate.existingLeadId,null);
  const callback={leadId:first.leadId,callbackType:'lister',callbackDate:'2099-12-01',callbackTime:'10:00',reason:'Client needs time'};await call(staff[0].uid,'crm4SaveCallback',callback);await assert.rejects(call(staff[1].uid,'crm4SaveCallback',callback),e=>e.code==='permission-denied');
  await assert.rejects(call(staff[0].uid,'crm4ManagerSendToCloser',{leadId:first.leadId,closerUid:staff[1].uid}),e=>e.code==='permission-denied');
  await assert.rejects(call(manager,'crm4ManagerSendToCloser',{leadId:first.leadId,closerUid:staff[1].uid}),e=>e.code==='failed-precondition');
  // Independent approval fixture only; does not claim the assessment workflow was executed here.
  await ref.update({status:'approved',managerDecision:'approved'});await call(manager,'crm4ManagerSendToCloser',{leadId:first.leadId,closerUid:staff[1].uid});
  const handed=(await ref.get()).data();assert.equal(handed.closerUid,staff[1].uid);assert.equal(handed.createdBy,staff[0].uid);assert(handed.actionHistory.some(x=>x.byUid===manager));
  await assert.rejects(call(manager,'crm4ManagerSendToCloser',{leadId:first.leadId,closerUid:staff[0].uid}),/separately governed reassignment/);assert.equal((await ref.get()).data().closerUid,staff[1].uid);
  await r.db.collection('crm4Memberships').doc(staff[0].uid).update({active:false});await assert.rejects(call(staff[0].uid,p.rows[0].handler,p.rows[0].data),e=>e.code==='permission-denied');
 }finally{await r.close();}
});

