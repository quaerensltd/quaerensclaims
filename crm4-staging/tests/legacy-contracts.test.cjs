'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
test('legacy v2 operations are atomic, isolated, replay-safe and cannot downgrade v3',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='v2-'+crypto.randomUUID(),staff=id+'-staff',client=id+'-client';
 const call=(name,data,uid=staff,token={})=>r.handlers[name]({auth:{uid,token},data});
 try {
  await r.db.collection('crm4Memberships').doc(staff).set({workspaceId:'CRM4',active:true,role:'manager'});
  await r.db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4',email:id+'@example.test',clientName:'Synthetic Legacy'});
  const input={crmCaseId:id,clientName:'Synthetic Legacy',clientEmail:id+'@example.test',caseRef:'QCP-SYNTHETIC',summary:'Synthetic legacy compatibility'};
  await assert.rejects(call('portalStaffUpsertCase',input,'stranger'),e=>e.code==='permission-denied');
  const [a,b]=await Promise.all([call('portalStaffUpsertCase',input),call('portalStaffUpsertCase',input)]);assert.equal(a.id,b.id);
  const caseId=a.id, ref=r.db.collection('clientPortalCases').doc(caseId);
  assert.equal((await ref.get()).data().portalVersion,2);
  await assert.rejects(call('portalStaffUpsertCase',{...input,caseId:'duplicate-'+id}),/no duplicate legacy/);
  const invites=await Promise.allSettled([call('portalStaffCreateInvitation',{caseId}),call('portalStaffCreateInvitation',{caseId})]);
  assert.equal(invites.filter(x=>x.status==='fulfilled').length,1);const invitation=invites.find(x=>x.status==='fulfilled').value;
  assert(invitation.claimUrl.startsWith('http://127.0.0.1:4404/'));
  await assert.rejects(call('portalClientClaimInvitation',{token:invitation.token},client,{email:'wrong@example.test',email_verified:true}),e=>e.code==='permission-denied');
  const clientToken={email:input.clientEmail,email_verified:true};
  assert.equal((await call('portalClientClaimInvitation',{token:invitation.token},client,clientToken)).status,'CLAIMED');
  await assert.rejects(call('portalClientClaimInvitation',{token:invitation.token},client,clientToken),e=>e.code==='permission-denied');
  const message={caseId,body:'Synthetic legacy staff reply',requestId:'one'};
  const messages=await Promise.all([call('portalStaffCreateMessage',message),call('portalStaffCreateMessage',message)]);assert.equal(messages[0].id,messages[1].id);
  await assert.rejects(call('portalStaffCreateMessage',{...message,body:'Changed'}),/Conflicting/);
  const documentId=id+'-doc',path=`clientPortal/${caseId}/shared/${documentId}_evidence.txt`,storage=require('firebase-admin/storage').getStorage(r.app).bucket('demo-quaerens-crm4.appspot.com');
  await storage.file(path).save(Buffer.from('synthetic'),{contentType:'text/plain',resumable:false});
  const meta={caseId,documentId,storagePath:path,contentType:'text/plain',size:9,title:'Synthetic evidence',version:1};
  await assert.rejects(call('portalStaffRegisterDocument',{...meta,size:10}),/metadata mismatch/);
  assert.equal((await call('portalStaffRegisterDocument',meta)).status,'SHARED');
  assert.equal((await call('portalStaffRegisterDocument',meta)).idempotent,true);
  const download=await call('portalClientGetDocumentUrl',{caseId,documentId},client,clientToken);assert(download.url.startsWith('http://127.0.0.1:5001/'));
  await assert.rejects(call('portalClientGetDocumentUrl',{caseId,documentId},'wrong',clientToken),e=>e.code==='permission-denied');
  await call('portalStaffRevokeAccess',{caseId,reason:'Synthetic acceptance'});
  await assert.rejects(call('portalClientGetDocumentUrl',{caseId,documentId},client,clientToken),e=>e.code==='permission-denied');
  await assert.rejects(call('portalStaffCreateInvitation',{caseId}),/revoked/);
  await ref.update({portalVersion:3});const before=(await ref.get()).data();
  for(const [name,data] of [['portalStaffUpsertCase',{...input,caseId}],['portalStaffCreateInvitation',{caseId}],['portalStaffCreateMessage',message],['portalStaffRegisterDocument',meta]])await assert.rejects(call(name,data),/cannot be downgraded/);
  assert.deepEqual((await ref.get()).data(),before);
  await ref.update({'crmLink.workspaceId':'CRM2'});
  assert(!(await call('portalStaffListCases',{})).cases.some(x=>x.id===caseId));
  await assert.rejects(call('portalStaffCreateMessage',message),/Owned CRM4/);
  assert.equal(r.providerReceipts.length,0);
 } finally {await r.close();}
});
test('global search retains Processing/Admin contract and excludes foreign or unclassified records',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='search-'+crypto.randomUUID();
 const call=()=>r.handlers.paidClientGlobalClientSearch({auth:{uid:id,token:{}},data:{query:id}});
 try {
  const member=r.db.collection('crm4Memberships').doc(id);await member.set({workspaceId:'CRM4',active:true,role:'processing'});
  for(const [suffix,workspaceId] of [['own','CRM4'],['foreign','CRM2'],['other','CRM3'],['unknown',null]])await r.db.collection('crm4Leads').doc(id+'-'+suffix).set({workspaceId,clientName:id,email:id+'@example.test'});
  await r.db.collection('clientPortalCases').doc(id+'-conflict').set({workspaceId:'CRM2',clientName:id,crmLink:{workspaceId:'CRM4',collection:'crm4Leads',caseId:id+'-own'}});
  await r.db.collection('clientPortalCases').doc(id+'-foreign-link').set({clientName:id,crmLink:{workspaceId:'CRM4',collection:'crm4Leads',caseId:id+'-foreign'}});
  assert.deepEqual((await call()).results.map(x=>x.leadId),[id+'-own']);
  for(const role of ['lister','closer','manager','client']) {await member.update({role});await assert.rejects(call,e=>e.code==='permission-denied');}
  await member.update({role:'administrator'});assert.equal((await call()).results.length,1);
  await member.update({workspaceId:'CRM3'});await assert.rejects(call,e=>e.code==='permission-denied');
  await member.update({workspaceId:'CRM4',active:false});await assert.rejects(call,e=>e.code==='permission-denied');
 } finally {await r.close();}
});
test('legacy write interruption rolls back audit/message; concurrent v3 upgrade cannot be overwritten',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='atomic-'+crypto.randomUUID(),caseId='crm4-legacy-'+id;
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 const deps={db:r.db,admin:{firestore:require('firebase-admin').firestore},HttpsError,onCall:(...a)=>a.at(-1)};
 const ref=r.db.collection('clientPortalCases').doc(caseId),request={auth:{uid:id,token:{}},data:{caseId,body:'Atomic synthetic message'}};
 const factory=require('../backend-sources/portalStaffCreateMessage/clientPortal.js').registerClientPortal;
 try {
  await r.db.collection('crm4Memberships').doc(id).set({workspaceId:'CRM4',active:true,role:'manager'});
  await r.db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4'});
  await ref.set({portalVersion:2,crmLink:{workspaceId:'CRM4',collection:'crm4Leads',caseId:id}});
  const boundary=hook=>require('../tools/legacy-portal-boundary.cjs').legacyPortal(r.db,deps,'portalStaffCreateMessage',d=>{const source=factory(d);return {portalStaffCreateMessage:async req=>{const result=await source.portalStaffCreateMessage(req);await hook();return result;}};});
  await assert.rejects(boundary(async()=>{throw Error('Synthetic commit interruption');})(request),/commit interruption/);
  assert.equal((await r.db.collection('clientPortalMessages').where('caseId','==',caseId).get()).size,0);
  assert.equal((await r.db.collection('clientPortalAudit').where('caseId','==',caseId).get()).size,0);
  let upgrade;
  // Do not await a competing writer while holding the emulator read lock.
  try {await boundary(async()=>{upgrade ||= ref.update({portalVersion:3});})(request);}catch(e){assert.match(e.message,/cannot be downgraded/);}
  await upgrade;
  assert.equal((await ref.get()).data().portalVersion,3);
  await assert.rejects(boundary(async()=>{})(request),/cannot be downgraded/);
 }finally{await r.close();}
});
