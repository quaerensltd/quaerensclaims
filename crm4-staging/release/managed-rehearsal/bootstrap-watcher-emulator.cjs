'use strict';
let phase='initial';
const assert=require('assert/strict'),c=require('./core.cjs'),w=require('./bootstrap-watcher.cjs');
async function main(){
 assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,'127.0.0.1:9099');assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080');
 process.env.GCLOUD_PROJECT='demo-quaerens-crm4';process.env.STORAGE_EMULATOR_HOST='http://127.0.0.1:9199';
 const r=require('../../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),project='demo-quaerens-crm4',password='fictional-emulator-watcher-password';
 let actor,owner;const results=[];
 const guard=async()=>assert.equal(process.env.GCLOUD_PROJECT,project);
 const members=async()=>{const response=await fetch('http://127.0.0.1:8080/v1/projects/'+project+'/databases/(default)/documents/crm4Memberships?pageSize=2',{headers:{Authorization:'Bearer owner'}});assert.equal(response.status,200);return w.parseMembers(await response.json(),project);};
 async function clean(){
  // Remove only this demo test's governed receipts, so the next scenario does
  // not replay a completed operation whose Auth fixture has been deleted.
  if(owner){const key=require('crypto').createHash('sha256').update(JSON.stringify('owner@crm4.example.test')).digest('hex');const op=r.db.collection('crm4AdminCreateOperations').doc(key);const snap=await op.get();assert.equal(snap.data().actorUid,actor.uid);await r.db.collection('crm4Memberships').doc(owner.uid).delete();await auth.deleteUser(owner.uid);await op.delete();await r.db.collection('crm4MembershipAudit').doc('create-'+key).delete();await r.db.collection('crm4AdminSetupCaptures').doc(key).delete();owner=null;}
  if(actor){await auth.deleteUser(actor.uid);actor=null;}
 }

 try{
  for(const scenario of ['success','read-failure','timeout','revocation-failure']){
   phase=scenario+':arming';let ready;const armed=new Promise(resolve=>ready=resolve),states=[];let failRead=false,ack=null;
   const targetAuth=scenario==='revocation-failure'?new Proxy(auth,{get(t,k){if(k==='setCustomUserClaims')return async(uid,claims)=>{if(!claims.platformAdmin)throw Error('synthetic cleanup failure');return t.setCustomUserClaims(uid,claims);};const value=t[k];return typeof value==='function'?value.bind(t):value;}}):auth;
   const diagnostic=require('./private-diagnostics.cjs').create({write:row=>{assert(!JSON.stringify(row).includes(password));}});
   const io=require('./watcher-io.cjs');const watchedAuth=io.authReads(targetAuth,(url,body)=>io.read(url.replace('https://identitytoolkit.googleapis.com','http://127.0.0.1:9099/identitytoolkit.googleapis.com'),{token:'owner',project,body}),project);
   const watched=w.monitor({liveHeartbeat:true,auth:diagnostic.wrapAuth(watchedAuth),readMembers:async()=>{if(failRead)throw Error('synthetic read failure');return members();},guard,revokeGuard:guard,deadline:Date.now()+(scenario==='success'?900000:scenario==='timeout'?6000:30000),...(scenario==='success'?{armedDurationMs:600000,readAcknowledgement:()=>ack}:{}),manifestHash:'emulator-only',write:s=>states.push(s),notify:state=>{if(state==='WATCHER_READY_FOR_VERIFICATION'){const row=states.at(-1);assert.equal(row.state,'READY_FOR_VERIFICATION');ack={manifestHash:row.manifestHash,pid:row.pid,started:row.started,verifiedAt:Date.now()};}else if(state==='WATCHER_ARMED')ready();},sleep:ms=>new Promise(resolve=>setTimeout(resolve,100))});
   watched.then(result=>{if(!result.armed)console.log(JSON.stringify({phase,result,diagnostic:diagnostic.summary()}));});
   await Promise.race([armed,new Promise((_,reject)=>setTimeout(()=>reject(Error('not armed')),10000))]);
   assert.equal((await auth.listUsers(1)).users.length,0);assert(states.some(s=>s.state==='ARMED'));if(scenario==='success'){const row=states.find(s=>s.state==='ARMED');assert.equal(row.deadline-row.armedAt,600000);assert(row.independentlyVerifiedAt<=row.armedAt);}
   phase=scenario+':bootstrap';actor=await c.bootstrap(diagnostic.wrapAuth(auth),password,guard);assert.equal((await r.db.collection('crm4Memberships').doc(actor.uid).get()).exists,false);
   let session;
   if(scenario==='success'||scenario==='revocation-failure'){
    const login=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-only',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'bootstrap@crm4.example.test',password,returnSecureToken:true})});assert.equal(login.status,200);session=await login.json();const token=await auth.verifyIdToken(session.idToken,true);assert(token.platformAdmin);
    phase=scenario+':governed-create';owner=await r.handlers.crm4AdminCreateUser({auth:{uid:token.uid,token},data:{email:'owner@crm4.example.test',displayName:'Fictional emulator owner',role:'administrator',workspaceId:'CRM4',active:true}});
    assert.equal((await auth.getUser(owner.uid)).customClaims?.platformAdmin,undefined);assert.equal((await r.db.collection('crm4Memberships').doc(owner.uid).get()).data().createdBy,actor.uid);
   }
   if(scenario==='read-failure')failRead=true;
   phase=scenario+':verification';const result=await watched;console.log(JSON.stringify({phase,result}));assert.equal(result.pass,scenario==='success');const after=await auth.getUser(actor.uid);assert(after.disabled);
   if(scenario==='revocation-failure'){assert(!result.revocationVerified);await c.revoke(auth,actor.uid,guard);}else{assert(result.revocationVerified);assert.equal(after.customClaims?.platformAdmin,undefined);}
   if(session){await assert.rejects(auth.verifyIdToken(session.idToken,true));const refresh=await fetch('http://127.0.0.1:9099/securetoken.googleapis.com/v1/token?key=demo-only',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:session.refreshToken})});assert.notEqual(refresh.status,200);}
   results.push({scenario,expectedDecisionObserved:true,disabled:true,claimsRemoved:true,tokenDenialChecked:!!session});await clean();
  }
  console.log(JSON.stringify({environment:'loopback demo only',watcherArmedBeforeCreation:true,governedOwnerHandler:true,scenarios:results,cloudMutations:0}));
 }finally{await clean();await r.close();}
}
main().catch(e=>{console.error('WATCHER_EMULATOR_FAIL',phase,e.code||e.name);process.exitCode=1;});
