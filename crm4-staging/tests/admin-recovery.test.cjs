'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
test('durable Admin creation recovers interruptions, concurrent calls and lost capture acknowledgement',async()=>{
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app);
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 const deps={db:r.db,admin:{firestore:require('firebase-admin').firestore,auth:()=>auth},HttpsError,onCall:(...a)=>a.at(-1)};
 const factory=options=>require('../tools/admin-create-recovery.cjs').adminCreateRecovery(deps,options);
 try{
  for(const stage of ['AUTH_CREATED','MEMBERSHIP_WRITTEN','BEFORE_AUTH_UPDATE','AUTH_UPDATED','BEFORE_CAPTURE','CAPTURE_ACCEPTED']){
   const id='recovery-'+randomUUID(),request={auth:{uid:id,token:{platformAdmin:true}},data:{email:id+'@example.test',displayName:'Synthetic recovery',role:'processing'}};
   let fired=false;
   await assert.rejects(factory({checkpoint:async point=>{if(point===stage&&!fired){fired=true;throw Error('Simulated process interruption');}}})(request),/interruption/);
   if(stage==='CAPTURE_ACCEPTED') {
    const child=require('node:child_process').execFileSync(process.execPath,['-e',`(async()=>{const r=require('./crm4-staging/tools/local-handlers.cjs').createLocalHandlers();try{await r.handlers.crm4AdminCreateUser(${JSON.stringify(request)});}finally{await r.close();}})().catch(e=>{console.error(e);process.exitCode=1;})`],{cwd:require('node:path').resolve(__dirname,'../..'),env:process.env,encoding:'utf8',timeout:30000});
    assert(!child.includes('Error'));
   }
   // Fresh handler instances share only Firestore/Auth, never a local lock/cache.
   const results=await Promise.all(Array.from({length:4},()=>factory()(request)));
   assert.equal(new Set(results.map(v=>v.uid)).size,1);
   assert.equal((await r.db.collection('crm4Memberships').where('email','==',request.data.email).get()).size,1);
   assert.equal((await r.db.collection('crm4AdminSetupCaptures').where('recipient','==',request.data.email).get()).size,1);
   assert.equal((await r.db.collection('crm4MembershipAudit').where('targetUid','==',results[0].uid).get()).size,1);
   assert.equal((await auth.getUser(results[0].uid)).disabled,false);
   assert.deepEqual(await factory()(request),results[0]);
   await assert.rejects(factory()({...request,auth:{uid:id,token:{}}}),e=>e.code==='permission-denied');
   await assert.rejects(factory()({...request,data:{...request.data,role:'administrator'}}),e=>e.code==='failed-precondition');
   assert.equal(results[0].externalCommunications,0);
  }
  const id='fresh-race-'+randomUUID(),request={auth:{uid:id,token:{platformAdmin:true}},data:{email:id+'@example.test',displayName:'Concurrent account',role:'lister',active:false}};
  const values=await Promise.all(Array.from({length:5},()=>factory()(request)));
  assert.equal(new Set(values.map(v=>v.uid)).size,1);
  assert.equal((await auth.getUser(values[0].uid)).disabled,true);
  assert.equal((await r.db.collection('crm4AdminSetupCaptures').where('recipient','==',request.data.email).get()).size,1);
 }finally{await r.close();}
});
