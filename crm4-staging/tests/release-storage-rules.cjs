'use strict';
// Run separately after other emulator tests: temporarily replaces Storage rules,
// then restores the local baseline in finally. All endpoints are literal loopback.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
async function run(){
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const root=path.resolve(__dirname,'..'),r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),id='release-rules-'+require('crypto').randomUUID(),uid=id+'-client',email=uid+'@example.test',password='Synthetic-only-927!';
 const setRules=async file=>{const response=await fetch('http://127.0.0.1:9199/internal/setRules',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:path.join(root,file),content:fs.readFileSync(path.join(root,file),'utf8')}]}})});assert.equal(response.status,200,await response.text());};
 try{
  await setRules('release/storage.rules');await auth.createUser({uid,email,password,emailVerified:true});
  const login=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});assert.equal(login.status,200);const token=(await login.json()).idToken;
  const ref=r.db.collection('clientPortalCases').doc(id),base='http://127.0.0.1:9199/v0/b/quaerens-crm4-spain-test.firebasestorage.app/o';let counter=0;
  const upload=(type='text/plain')=>require('./storage-upload-helper.cjs').uploadSynthetic(base,token,'clientPortal/'+id+'/client-uploads/'+uid+'/test-'+counter+++'.txt',type);
  await ref.set({workspaceId:'CRM4',clientUid:uid,accessState:'ACTIVE'});assert.equal((await upload()).status,200);
  for(const patch of [{workspaceId:'CRM2'},{workspaceId:'CRM3'},{workspaceId:'CRM5'},{workspaceId:'CRM4',crmLink:{workspaceId:'CRM3'}},{workspaceId:'CRM4',crmLink:{workspaceId:'CRM4'},accessState:'DISABLED'}]){await ref.update(patch);assert.equal((await upload()).status,403);}
  await ref.update({workspaceId:'CRM4',crmLink:{workspaceId:'CRM4'},accessState:'ACTIVE'});assert.equal((await upload('text/html')).status,403);
  console.log('PASS: release Storage rules compile; valid CRM4 owner upload allowed; foreign/conflicting workspace, revoked access and unsafe MIME denied');
 }finally{await setRules('storage.local.rules');await r.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
