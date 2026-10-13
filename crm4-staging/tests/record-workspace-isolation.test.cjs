'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('CRM4 browser rules deny foreign records even when their UID assignments match',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const runtime=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(runtime.app),id=require('crypto').randomUUID();
 try{
  for(const role of ['lister','closer','manager','administrator','dual']){
   const uid=role+'-'+id,email=uid+'@example.test',password='Synthetic-Only-927!';await auth.createUser({uid,email,password});await runtime.db.collection('crm4Memberships').doc(uid).set({active:true,workspaceId:'CRM4',role:role==='dual'?'lister':role,...(role==='dual'?{roles:['lister','closer']}:{})});
   const login=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});assert.equal(login.status,200);const token=(await login.json()).idToken;
   for(const workspaceId of ['CRM4','CRM2','CRM3','CRM5']){const leadId=uid+'-'+workspaceId;await runtime.db.collection('crm4Leads').doc(leadId).set({workspaceId,assignedToUid:role==='dual'?'different-lister':uid,closerUid:uid,assignedUserId:uid});const res=await fetch('http://127.0.0.1:8080/v1/projects/demo-quaerens-crm4/databases/(default)/documents/crm4Leads/'+leadId,{headers:{Authorization:'Bearer '+token}});assert.equal(res.status,workspaceId==='CRM4'?200:403,role+' '+workspaceId);}
  }
 }finally{await runtime.close();}
});
