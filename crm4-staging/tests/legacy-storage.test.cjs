'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('staff shared upload rules require active CRM4 staff, owned v2 link, immutable safe object',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),id='staff-upload-'+require('node:crypto').randomUUID();
 try {
  const email=id+'@example.test',password='Synthetic-only-927!';await auth.createUser({uid:id,email,password});
  const signIn=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});const token=(await signIn.json()).idToken;
  const member=r.db.collection('crm4Memberships').doc(id),lead=r.db.collection('crm4Leads').doc(id),portal=r.db.collection('clientPortalCases').doc(id);
  await member.set({workspaceId:'CRM4',active:true,role:'manager'});await lead.set({workspaceId:'CRM4'});await portal.set({portalVersion:2,crmLink:{workspaceId:'CRM4',collection:'crm4Leads',caseId:id}});
  const base='http://127.0.0.1:9199/v0/b/demo-quaerens-crm4.appspot.com/o';
  const put=(suffix,type='text/plain')=>require('./storage-upload-helper.cjs').uploadSynthetic(base,token,`clientPortal/${id}/shared/${suffix}.txt`,type);
  assert.equal((await put('valid')).status,200);assert.equal((await put('valid')).status,403);
  assert.equal((await put('unsafe','text/html')).status,403);
  await member.update({role:'lister'});assert.equal((await put('lister')).status,403);
  await member.update({role:'processing',active:false});assert.equal((await put('inactive')).status,403);
  await member.update({active:true,workspaceId:'CRM2'});assert.equal((await put('foreign-member')).status,403);
  await member.update({workspaceId:'CRM4'});await portal.update({portalVersion:3});assert.equal((await put('v3')).status,403);
  await portal.update({portalVersion:2});await lead.update({workspaceId:'CRM2'});assert.equal((await put('foreign-lead')).status,403);
  assert.equal((await fetch(base+'/'+encodeURIComponent(`clientPortal/${id}/shared/valid.txt`)+'?alt=media',{headers:{Authorization:'Firebase '+token}})).status,403);
 }finally{await r.close();}
});
