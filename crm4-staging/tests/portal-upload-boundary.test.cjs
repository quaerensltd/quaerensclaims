'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
test('CRM4 server upload preserves membership, linkage, immutable objects and original individual audit',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='upload-'+crypto.randomUUID(),uid=id+'-admin',member=r.db.collection('crm4Memberships').doc(uid),lead=r.db.collection('crm4Leads').doc(id),portal=r.db.collection('clientPortalCases').doc(id);
 const membership={workspaceId:'CRM4',active:true,role:'administrator'},leadData={workspaceId:'CRM4',listerUid:id+'-one',closerUid:id+'-two'},caseData={workspaceId:'CRM4',portalVersion:2,crm4LeadId:id,crmLink:{workspaceId:'CRM4',collection:'crm4Leads',caseId:id},clientUid:id+'-client',accessState:'ACTIVE'};
 const request=(patch={},auth={uid,token:{}})=>({auth,data:{caseId:id,documentId:crypto.randomUUID(),filename:'evidence.txt',base64:Buffer.from('Synthetic evidence only').toString('base64'),contentType:'text/plain',...patch}}),upload=q=>r.handlers.portalStaffUploadDocument(q),denied=q=>assert.rejects(upload(q),e=>e.code==='permission-denied');
 try{
  await member.set(membership);await lead.set(leadData);await portal.set(caseData);
  const q=request(),result=await upload(q);assert.equal(result.status,'SHARED');assert.equal((await upload(q)).idempotent,true);
  const doc=(await r.db.collection('clientPortalDocuments').doc(q.data.documentId).get()).data();assert.equal(doc.uploadedByUid,uid);assert.equal(doc.caseId,id);
  const audit=await r.db.collection('clientPortalAudit').where('caseId','==',id).get();assert.equal(audit.size,1);assert.equal(audit.docs[0].data().actorUid,uid);assert.equal(audit.docs[0].data().action,'DOCUMENT_SHARED');
  await assert.rejects(upload({...q,data:{...q.data,base64:Buffer.from('changed').toString('base64')}}),e=>e.code==='already-exists');
  const [saved]=await require('firebase-admin/storage').getStorage(r.app).bucket('demo-quaerens-crm4.appspot.com').file(doc.storagePath).download();assert.equal(saved.toString(),'Synthetic evidence only');
  await assert.rejects(upload(request({},null)),e=>e.code==='unauthenticated');
  for(const role of ['manager','processing']){await member.set({...membership,role});assert.equal((await upload(request())).status,'SHARED');}
  for(const staff of ['one','two']){const staffUid=id+'-'+staff;await r.db.collection('crm4Memberships').doc(staffUid).set({...membership,role:'lister',roles:['lister','closer']});await denied(request({}, {uid:staffUid,token:{}}));}
  for(const workspaceId of ['CRM2','CRM3','CRM5']){await member.set({...membership,workspaceId});await denied(request());}
  await member.set({...membership,active:false});await denied(request({}, {uid,token:{platformAdmin:true}}));await member.delete();await denied(request());await member.set(membership);
  for(const patch of [{workspaceId:'CRM2'},{workspaceId:''},{workspaceId:null},{crm4LeadId:'conflict'},{crm4LeadId:''},{crm4LeadId:null},{crmLink:{...caseData.crmLink,workspaceId:'CRM5'}},{crmLink:{...caseData.crmLink,collection:'crm3Leads'}}]){await portal.set({...caseData,...patch});await denied(request());}await portal.set(caseData);
  await lead.update({workspaceId:'CRM3'});await denied(request());await lead.set(leadData);
  await assert.rejects(upload(request({base64:'invalid'})),e=>e.code==='invalid-argument');await assert.rejects(upload(request({contentType:'text/html'})),e=>e.code==='invalid-argument');await assert.rejects(upload(request({filename:'../escape.txt'})),e=>e.code==='invalid-argument');
  class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
  const raw=require('firebase-admin/storage').getStorage(r.app).bucket('demo-quaerens-crm4.appspot.com');
  const race=require('../tools/portal-upload-boundary.cjs').portalUpload({db:r.db,HttpsError,onCall:(...a)=>a.at(-1),admin:{firestore:require('firebase-admin').firestore,storage:()=>({bucket:()=>({file:name=>{const f=raw.file(name);return {save:async(...a)=>{await f.save(...a);await member.update({active:false});},getMetadata:()=>f.getMetadata(),exists:()=>f.exists()};}})})}});
  const revoked=request();await assert.rejects(race(revoked),e=>e.code==='permission-denied');assert.equal((await r.db.collection('clientPortalDocuments').doc(revoked.data.documentId).get()).exists,false);
  assert.deepEqual((await lead.get()).data(),leadData);assert.deepEqual((await portal.get()).data(),caseData);
 }finally{await r.close();}
});
