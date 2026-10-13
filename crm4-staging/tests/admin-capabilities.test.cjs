'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('existing administrator update atomically audits dual capabilities and removes them on a single-role update',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='dual-admin-'+require('crypto').randomUUID(),auth=require('firebase-admin/auth').getAuth(r.app);
 try{
  await auth.createUser({uid:id,email:id+'@example.test'});const ref=r.db.collection('crm4Memberships').doc(id);await ref.set({active:true,workspaceId:'CRM4',role:'lister'});
  const request={auth:{uid:'synthetic-owner',token:{platformAdmin:true}},data:{uid:id,role:'lister',roles:['lister','closer'],active:true,workspaceId:'CRM4'}};
  await assert.rejects(r.handlers.crm4AdminUpdateMembership({...request,auth:{uid:'staff',token:{}}}),e=>e.code==='permission-denied');
  await assert.rejects(r.handlers.crm4AdminUpdateMembership({...request,data:{...request.data,roles:['lister','administrator']}}),e=>e.code==='invalid-argument');
  await r.handlers.crm4AdminUpdateMembership(request);assert.deepEqual((await ref.get()).data().roles,['lister','closer']);
  const audit=await r.db.collection('crm4MembershipAudit').where('targetUid','==',id).get();assert.equal(audit.size,1);assert.equal(audit.docs[0].data().actorUid,'synthetic-owner');assert.deepEqual(audit.docs[0].data().capabilitiesAfter,['lister','closer']);
  const single={...request,data:{uid:id,role:'lister',active:true,workspaceId:'CRM4'}};await r.handlers.crm4AdminUpdateMembership(single);assert.equal((await ref.get()).data().roles,undefined);
  await assert.rejects(r.handlers.crm4AdminUpdateMembership({...request,auth:{uid:id,token:{platformAdmin:true}}}),e=>e.code==='failed-precondition');
 }finally{await r.close();}
});
