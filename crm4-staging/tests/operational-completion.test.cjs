'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
test('callbacks and agendas preserve ownership, membership, audit and concurrent replay', async () => {
  Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
  const r=require('../tools/local-handlers.cjs').createLocalHandlers(), db=r.db;
  const id='callback-'+require('node:crypto').randomUUID(), member=db.collection('crm4Memberships').doc(id), lead=db.collection('crm4Leads').doc(id);
  const req={auth:{uid:id,token:{}},data:{leadId:id,callbackType:'lister',callbackDate:'2099-12-01',callbackTime:'12:00',reason:'Client needs time',notes:'Synthetic callback'}};
  try {
    await member.set({active:true,workspaceId:'CRM4',role:'lister'});
    await lead.set({workspaceId:'CRM4',assignedToUid:id,createdByUid:id,email:id+'@example.test'});
    const results=await Promise.all([1,2,3].map(()=>r.handlers.crm4SaveCallback(req)));
    assert.equal(results.filter(v=>v.status==='SAVED').length,1);
    assert.equal(results.filter(v=>v.idempotent).length,2);
    assert.equal((await lead.get()).data().actionHistory.length,1);
    const agenda=await r.handlers.crm4ListAgenda({auth:req.auth,data:{}});
    assert(agenda.callbacks.some(v=>v.leadId===id));
    for(const patch of [{workspaceId:'CRM2'},{workspaceId:'CRM3'},{workspaceId:'CRM4',active:false},{active:true,role:'manager'}]) {
      await member.update(patch);
      await assert.rejects(r.handlers.crm4SaveCallback(req),e=>e.code==='permission-denied');
    }
    await member.update({role:'lister'}); await lead.update({assignedToUid:'someone-else',createdByUid:'someone-else'});
    await assert.rejects(r.handlers.crm4SaveCallback(req),e=>e.code==='permission-denied');
    assert.equal(r.providerReceipts.length,0);
  } finally {await r.close();}
});
test('book then cancel releases exact slot once; slot blocking retains role and booked-slot protection',async()=>{
  Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
  const r=require('../tools/local-handlers.cjs').createLocalHandlers(),db=r.db,id='cancel-'+require('node:crypto').randomUUID();
  const member=db.collection('crm4Memberships').doc(id),lead=db.collection('crm4Leads').doc(id),slot=db.collection('crm4AdministrationOnboardingSlots').doc(id);
  const req={auth:{uid:id,token:{}},data:{leadId:id,slotId:id,reason:'Synthetic cancellation'}};
  try {
    await member.set({active:true,workspaceId:'CRM4',role:'closer'});
    await lead.set({workspaceId:'CRM4',closerUid:id,outcome:'Closed Deal',paymentStatus:'payment_confirmed',paymentConfirmedAt:new Date(),processingStatus:'ready_for_administration_onboarding',email:id+'@example.test'});
    await slot.set({status:'available',date:'2099-12-01',startTime:'12:00',durationMinutes:60});
    await r.handlers.crm4CloserBookAdministrationOnboarding(req);
    await assert.rejects(r.handlers.processingBlockAdministrationOnboardingSlot(req),e=>e.code==='permission-denied');
    await member.update({role:'processing'});
    await assert.rejects(r.handlers.processingBlockAdministrationOnboardingSlot(req),e=>e.code==='failed-precondition');
    const results=await Promise.all([1,2,3].map(()=>r.handlers.crm4CancelAdministrationOnboarding(req)));
    assert.equal(results.filter(v=>v.status==='CANCELLED').length,1);
    assert.equal(results.filter(v=>v.idempotent).length,2);
    assert.equal((await slot.get()).data().status,'available');
    assert.equal((await lead.get()).data().actionHistory.filter(v=>v.action==='administration_onboarding_cancelled').length,1);
    assert.equal((await r.handlers.processingBlockAdministrationOnboardingSlot(req)).status,'BLOCKED');
    assert.equal((await r.handlers.processingBlockAdministrationOnboardingSlot({...req,data:{slotId:id,action:'release'}})).status,'AVAILABLE');
    await member.update({workspaceId:'CRM2'});
    await assert.rejects(r.handlers.processingBlockAdministrationOnboardingSlot(req),e=>e.code==='permission-denied');
    assert(r.providerReceipts.every(v=>v.delivered===false));
  } finally {await r.close();}
});
test('callback staff-email provider failure leaves unsent state; authorised retry and replay capture once',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FUNCTIONS_EMULATOR:'false'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='callback-failure-'+require('node:crypto').randomUUID(),lead=r.db.collection('crm4Leads').doc(id);
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 const provider=require('../tools/local-providers.cjs').createLocalProviders();let failing=true;
 const deps={db:r.db,admin:{firestore:require('firebase-admin').firestore},HttpsError,onCall:(...a)=>a.at(-1),resend:{emails:{send:async(...args)=>{if(failing)throw Error('Synthetic callback provider failure');return provider.resend.emails.send(...args);}}}};
 const factory=require('../backend-sources/crm4SendCallbackConfirmation/crm4OperationalFlow.js').registerCrm2OperationalFlow;
 const req={auth:{uid:id,token:{}},data:{leadId:id,callbackType:'lister',callbackDate:'2099-12-01',callbackTime:'12:00',reason:'Client needs time'}};
 try {
  await r.db.collection('crm4Memberships').doc(id).set({active:true,workspaceId:'CRM4',role:'lister'});
  await lead.set({workspaceId:'CRM4',assignedToUid:id,createdByUid:id,email:id+'@example.test'});
  await r.handlers.crm4SaveCallback(req);
  const preview=await r.handlers.crm4PreviewCallbackConfirmation(req),send={...req,data:{...req.data,previewKey:preview.previewKey}};
  await assert.rejects(factory(deps).crm4SendCallbackConfirmation(send),/provider failure/);
  assert.equal((await lead.get()).data().listerCallbackConfirmationSentAt,undefined);
  failing=false;await factory(deps).crm4SendCallbackConfirmation(send);await factory(deps).crm4SendCallbackConfirmation(send);
  assert.equal(provider.receipts.length,1);assert.equal(provider.receipts[0].delivered,false);
  assert.equal((await lead.get()).data().actionHistory.filter(x=>x.action==='lister_callback_confirmation_sent').length,1);
 }finally{await r.close();}
});
