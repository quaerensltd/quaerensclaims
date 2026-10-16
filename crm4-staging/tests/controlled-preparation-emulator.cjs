'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {expiryRules}=require('../release/controlled-preparation/expiry.cjs');
async function run(){
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),checks=[],id='expiry-'+require('node:crypto').randomUUID(),password='Synthetic-only-Local-937!';
 async function login(email){const result=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});assert.equal(result.status,200);return (await result.json()).idToken;}
 async function install(kind,content){const url=kind==='firestore'?'http://127.0.0.1:8080/emulator/v1/projects/demo-quaerens-crm4:securityRules':'http://127.0.0.1:9199/internal/setRules';const response=await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:kind+'.rules',content}]}})});assert.equal(response.status,200,await response.text());}
 const original=Object.fromEntries(['firestore','storage'].map(k=>[k,fs.readFileSync(path.join(__dirname,'../release/'+k+'.rules'),'utf8')]));
 async function window(start){const end=new Date(Date.parse(start)+604800000).toISOString();for(const kind of ['firestore','storage'])await install(kind,expiryRules(kind,original[kind],start,end).output);}
 async function check(name,promise,status){const result=await promise;assert.equal(result.status,status,name+': '+await result.text());checks.push(name);}
 try{
  const actor=await auth.createUser({uid:id+'-actor',email:id+'-actor@example.test',password});
  const actorLogin=()=>login(actor.email);
  const invoke=async(suffix,data)=>{const verified=await auth.verifyIdToken(await actorLogin(),true);assert.equal(verified.aud,'demo-quaerens-crm4');return r.handlers['crm4Admin'+suffix]({auth:{uid:verified.uid,token:verified},data});};
  const input={email:'owner@crm4.example.test',displayName:'CRM4 Synthetic Owner',role:'administrator',workspaceId:'CRM4',active:true};
  await assert.rejects(invoke('CreateUser',input),e=>e.code==='permission-denied');checks.push('real emulator token without platformAdmin denied');
  await auth.setCustomUserClaims(actor.uid,{platformAdmin:true}); // demo emulator only, never production bootstrap evidence
  const owner=await invoke('CreateUser',input);assert.equal((await invoke('CreateUser',input)).uid,owner.uid);checks.push('governed synthetic owner creation and idempotent retry');
  await auth.updateUser(owner.uid,{password});const token=await login(input.email);
  const membership=r.db.collection('crm4Memberships').doc(owner.uid);const member=(await membership.get()).data();assert.equal(member.role,'administrator');assert.deepEqual(member.workspaceAccess,['CRM4']);assert.equal(member.createdBy,actor.uid);assert.equal((await auth.getUser(owner.uid)).customClaims?.platformAdmin,undefined);checks.push('owner CRM4-only membership no platformAdmin inherited');
  const audit=await r.db.collection('crm4MembershipAudit').where('actorUid','==',actor.uid).get();assert(audit.size>0);checks.push('individual bootstrap audit retained');
  await r.db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4'});
  const base='http://127.0.0.1:8080/v1/projects/demo-quaerens-crm4/databases/(default)/documents/';
  const read=target=>fetch(base+target,{headers:{Authorization:'Bearer '+token}});
  const client=await auth.createUser({uid:id+'-client',email:id+'-client@example.test',password,emailVerified:true});const ct=await login(client.email);
  await r.db.collection('clientPortalCases').doc(id).set({workspaceId:'CRM4',clientUid:client.uid,accessState:'ACTIVE'});
  let n=0;const upload=()=>require('./storage-upload-helper.cjs').uploadSynthetic('http://127.0.0.1:9199/v0/b/quaerens-crm4-spain-test.firebasestorage.app/o',ct,'clientPortal/'+id+'/client-uploads/'+client.uid+'/expiry-'+n+++'.txt');
  await window(new Date(Date.now()-60000).toISOString());
  await check('active window owner membership read',read('crm4Memberships/'+owner.uid),200);await check('active window owner lead read',read('crm4Leads/'+id),200);await check('active window governed case-owner upload',upload(),200);
  await r.db.collection('crm4Leads').doc(id).update({workspaceId:'CRM3'});await check('active window still denies foreign workspace',read('crm4Leads/'+id),403);await r.db.collection('crm4Leads').doc(id).update({workspaceId:'CRM4'});
  await invoke('UpdateMembership',{uid:owner.uid,role:'administrator',active:false});assert.equal((await auth.getUser(owner.uid)).disabled,true);await check('retained token denied after governed membership revocation',read('crm4Leads/'+id),403);checks.push('governed owner disable verified');
  await invoke('UpdateMembership',{uid:owner.uid,role:'administrator',active:true});
  await window(new Date(Date.now()-604800000-60000).toISOString());
  await check('expired window denies own membership with retained token',read('crm4Memberships/'+owner.uid),403);await check('expired window denies owner lead with retained token',read('crm4Leads/'+id),403);await check('expired window denies direct Storage with retained token',upload(),403);
  await window(new Date(Date.now()+60000).toISOString());await check('future window denies Firestore',read('crm4Leads/'+id),403);await check('future window denies Storage',upload(),403);
  console.log(JSON.stringify({environment:'demo loopback emulators only',passed:checks.length,checks,cloudMutations:0,productionBootstrapActorVerified:false}));
 }finally{for(const kind of ['firestore','storage'])await install(kind,fs.readFileSync(path.join(__dirname,'../'+kind+'.local.rules'),'utf8'));await r.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
