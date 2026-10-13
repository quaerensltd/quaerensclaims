'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('pinned Admin create/setup/block/reactivate and Processing provisioning remain synthetic and authorised',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),id='admin-'+require('node:crypto').randomUUID();
 const invoke=(suffix,data,token={platformAdmin:true})=>r.handlers['crm4Admin'+suffix]({auth:{uid:id,token},data});
 try {
  const input={email:id+'@example.test',displayName:'Synthetic Processing',role:'processing',workspaceId:'CRM4'};
  await assert.rejects(invoke('CreateUser',input,{}),e=>e.code==='permission-denied');
  await assert.rejects(invoke('CreateUser',{...input,email:'not-synthetic@example.com'}),e=>e.code==='permission-denied');
  await assert.rejects(invoke('CreateUser',{...input,workspaceId:'CRM2'}),e=>e.code==='invalid-argument');
  const created=await invoke('CreateUser',input),member=r.db.collection('crm4Memberships').doc(created.uid);
  assert.equal((await member.get()).data().role,'processing');assert.equal(created.linkReturned,false);assert.equal(created.passwordStored,false);
  assert.equal((await invoke('CreateUser',input)).uid,created.uid,'Replay does not create a second Auth user');
  assert.equal((await invoke('SendPasswordSetupEmail',{uid:created.uid})).linkReturned,false);
  await invoke('UpdateMembership',{uid:created.uid,role:'processing',active:false});
  assert.equal((await auth.getUser(created.uid)).disabled,true);
  await invoke('UpdateMembership',{uid:created.uid,role:'processing',active:true});
  assert.equal((await auth.getUser(created.uid)).disabled,false);
  const legacy=await auth.createUser({email:id+'-legacy@example.test'});
  await r.db.collection('users').doc(legacy.uid).set({email:legacy.email,role:'processing',name:'Synthetic legacy processing'});
  const first=await invoke('ProvisionExistingProcessing',{});assert(first.provisioned>=1);
  const second=await invoke('ProvisionExistingProcessing',{});assert.equal(second.provisioned,0);
  assert.equal((await r.db.collection('crm4Memberships').doc(legacy.uid).get()).data().workspaceId,'CRM4');
  assert(r.providerReceipts.length>=1);assert(r.providerReceipts.every(v=>v.delivered===false));
  const setupCaptures=await r.db.collection('crm4AdminSetupCaptures').where('recipient','==',input.email).get();
  assert.equal(setupCaptures.size,1,'Create and replay share one durable setup capture');
  assert.equal(setupCaptures.docs[0].data().delivered,false);
  const audit=await r.db.collection('crm4MembershipAudit').where('actorUid','==',id).get();assert(audit.size>=4);
  assert(audit.docs.every(d=>!d.data().password&&!d.data().setupLink));
 } finally {await r.close();}
});
