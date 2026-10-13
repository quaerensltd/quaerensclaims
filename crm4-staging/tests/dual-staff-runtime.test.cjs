'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('two distinct CRM4 staff each create as Lister and close as Closer without role changes or authority escalation',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const runtime=require('../tools/local-handlers.cjs').createLocalHandlers(),db=runtime.db,id=require('crypto').randomUUID(),leads=[];
 try{
  for(const number of [1,2]){
   const uid='dual-'+number+'-'+id,member={workspaceId:'CRM4',active:true,role:'lister',roles:['lister','closer'],displayName:'Synthetic staff '+number};await db.collection('crm4Memberships').doc(uid).set(member);
   const invoke=(name,data)=>runtime.handlers[name]({auth:{uid,token:{}},data});
   const created=await invoke('crm4ListerCreateReferralLead',{requestId:id+'-'+number,forename:'Synthetic',surname:'Dual '+number,email:uid+'@example.test',claimType:'foam_insulation',referralSource:'direct_enquiry'});assert(created.leadId);const ref=db.collection('crm4Leads').doc(created.leadId);leads.push({ref,uid});
   assert.equal((await ref.get()).data().assignedToUid,uid);
   await invoke('crm4SaveCallback',{leadId:ref.id,callbackType:'lister',callbackDate:'2099-12-01',callbackTime:'10:00',reason:'Client needs time'});
   const close={leadId:ref.id,paymentOptionId:'bank_transfer_gbp_950'};
   await assert.rejects(invoke('crm4CloserRecordClosedDeal',close),e=>e.code==='permission-denied'||e.code==='failed-precondition');
   // Synthetic setup of independently approved prerequisites; the staff cannot set these through the API.
   await ref.update({closerUid:uid,assignedUserId:uid,status:'closer-assigned',managerDecision:'approved'});
   await assert.rejects(invoke('crm4CloserRecordClosedDeal',close),e=>e.code==='failed-precondition');
   await ref.update({assessmentId:'synthetic-'+id,assessmentStatus:'COMPLETED'});
   await invoke('crm4SaveCallback',{leadId:ref.id,callbackType:'closer',callbackDate:'2099-12-02',callbackTime:'10:00',reason:'Client needs time'});
   const agenda=await invoke('crm4ListAgenda',{});assert.equal(agenda.scope,'INDIVIDUAL_LISTER_AND_CLOSER');assert(agenda.callbacks.some(x=>x.type==='lister-callback'&&x.leadId===ref.id));assert(agenda.callbacks.some(x=>x.type==='closer-callback'&&x.leadId===ref.id));assert(agenda.callbacks.every(x=>x.staffUid===uid));
   await assert.rejects(invoke('crm4ManagerUpdateLead',{leadId:ref.id,action:'APPROVE'}),e=>e.code==='permission-denied');
   await assert.rejects(invoke('processingConfirmCrm2Payment',{leadId:ref.id}),e=>e.code==='permission-denied');
   assert.equal((await invoke('crm4CloserRecordClosedDeal',close)).status,'CLOSED_DEAL_AWAITING_PAYMENT');assert.equal((await invoke('crm4CloserRecordClosedDeal',close)).idempotent,true);
   const lead=(await ref.get()).data();assert.equal(lead.closedDealRecordedByUid,uid);assert.equal(lead.actionHistory.filter(x=>x.action==='closed_deal_awaiting_payment').length,1);assert(lead.actionHistory.filter(x=>x.action==='closed_deal_awaiting_payment').every(x=>x.byUid===uid));assert.deepEqual((await db.collection('crm4Memberships').doc(uid).get()).data(),member);
  }
  const [first,second]=leads;
  await assert.rejects(runtime.handlers.crm4CloserRecordClosedDeal({auth:{uid:first.uid,token:{}},data:{leadId:second.ref.id,paymentOptionId:'bank_transfer_gbp_950'}}),e=>e.code==='permission-denied');
  for(const workspaceId of ['CRM2','CRM3','CRM5']){await db.collection('crm4Memberships').doc(first.uid).update({workspaceId});await assert.rejects(runtime.handlers.crm4SaveCallback({auth:{uid:first.uid,token:{}},data:{leadId:first.ref.id,callbackType:'lister'}}),e=>e.code==='permission-denied');}
 }finally{await runtime.close();}
});
