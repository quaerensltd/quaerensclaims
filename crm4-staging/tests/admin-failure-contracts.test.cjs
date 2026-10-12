'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('Admin failure diagnostic: original multi-service contract converges on retry but is not atomic/exactly-once',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),id='admin-failure-'+require('node:crypto').randomUUID();
 class HttpsError extends Error {constructor(code,message){super(message);this.code=code;}}
 let failProvider=true,failAuth=false,captures=0;
 const authProxy=new Proxy(auth,{get:(target,key)=>key==='updateUser'?async(...args)=>{if(failAuth){failAuth=false;throw Error('Synthetic interrupted Auth update');}return target.updateUser(...args);}:typeof target[key]==='function'?target[key].bind(target):target[key]});
 const deps={db:r.db,admin:{firestore:require('firebase-admin').firestore,auth:()=>authProxy},HttpsError,onCall:(...a)=>a.at(-1),resend:{emails:{send:async()=>{if(failProvider)throw Error('Synthetic staff provider failure');captures++;return {data:{id:'capture-'+captures}};}}}};
 const load=suffix=>require('../tools/local-admin.cjs').loadAdmin('crm4Admin'+suffix,deps),identity={uid:id,token:{platformAdmin:true}};
 const data={email:id+'@example.test',displayName:'Synthetic failure recovery',role:'processing',workspaceId:'CRM4'};
 try {
  await assert.rejects(load('CreateUser')({auth:identity,data}),/provider failure/);
  const user=await auth.getUserByEmail(data.email),member=r.db.collection('crm4Memberships').doc(user.uid);
  assert.equal((await member.get()).data().active,true,'Inherited partial creation exists before failed email');
  failProvider=false;assert.equal((await load('CreateUser')({auth:identity,data})).uid,user.uid);assert.equal(captures,1);
  // Source has no setup-email request key: this remains a documented limitation.
  await load('CreateUser')({auth:identity,data});assert.equal(captures,2,'Repeated successful source call captures another setup email');
  failAuth=true;const update={uid:user.uid,role:'processing',active:false};
  await assert.rejects(load('UpdateMembership')({auth:identity,data:update}),/interrupted Auth/);
  assert.equal((await member.get()).data().active,false);assert.equal((await auth.getUser(user.uid)).disabled,false);
  await load('UpdateMembership')({auth:identity,data:update});assert.equal((await auth.getUser(user.uid)).disabled,true);
  console.log('KNOWN INHERITED ADMIN LIMITATION: partial Auth/Firestore state and duplicate setup capture; retry convergence verified, atomic recovery NOT CERTIFIED');
 } finally {await r.close();}
});
test('legacy Closer Processing links are deliberately excluded for CRM4 members',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),id='legacy-denied-'+require('node:crypto').randomUUID();
 try {
  await r.db.collection('users').doc(id).set({role:'closer',active:true});
  await r.db.collection('crm4Memberships').doc(id).set({role:'closer',active:true,workspaceId:'CRM4'});
  const call=require('../backend-sources/legacyCloserGetProcessingLinks/legacyCloserProcessingLinks.js').createProcessingLinks({db:r.db});
  await assert.rejects(call(id,{assignmentIds:[]}),e=>e.code==='permission-denied');
  for(const file of ['closer-panel.html','closer-dashboard.html']) {
   const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../local-public',file),'utf8');
   assert.match(source,/async function loadProcessingLinks\(\)\s*\{\s*processingAssignmentIds = new Set\(\);\s*if\(isCrm2\(currentContext\)\)return;/);
  }
  assert.equal(r.handlers.legacyCloserGetProcessingLinks,undefined);
 } finally {await r.close();}
});
test('Admin concurrent-create diagnostic preserves one Auth identity but exposes original race rejection',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),id='admin-race-'+require('node:crypto').randomUUID();
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 let waiting=0,release;const barrier=new Promise(resolve=>{release=resolve;});
 const proxy=new Proxy(auth,{get:(target,key)=>key==='getUserByEmail'?async email=>{
  try{return await target.getUserByEmail(email);}catch(e){if(e.code!=='auth/user-not-found')throw e;if(++waiting===2)release();await barrier;throw e;}
 }:typeof target[key]==='function'?target[key].bind(target):target[key]});
 const deps={db:r.db,admin:{firestore:require('firebase-admin').firestore,auth:()=>proxy},HttpsError,onCall:(...a)=>a.at(-1),resend:require('../tools/local-providers.cjs').createLocalProviders().resend};
 try {
  const handler=require('../tools/local-admin.cjs').loadAdmin('crm4AdminCreateUser',deps),request={auth:{uid:id,token:{platformAdmin:true}},data:{email:id+'@example.test',displayName:'Synthetic race',role:'processing'}};
  const results=await Promise.allSettled([handler(request),handler(request)]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'auth/email-already-exists');
  const user=await auth.getUserByEmail(request.data.email);assert.equal((await handler(request)).uid,user.uid);
  assert.equal((await r.db.collection('crm4Memberships').where('email','==',request.data.email).get()).size,1);
  console.log('KNOWN INHERITED ADMIN LIMITATION: one concurrent creation rejects; explicit retry converges to same UID');
 }finally{await r.close();}
});
