'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),crypto=require('node:crypto');
test('private HTTP gates static files and calls with IAP, project token, origin and envelope',async()=>{
 const config={projectId:'quaerens-crm4-spain-test',origin:'https://crm4-spain-test-synthetic.europe-west1.run.app'};let calls=0;
 const runtime={config,auth:{verifyIdToken:async(token,revoked)=>{assert.equal(revoked,true);if(token!=='valid')throw Error();return {uid:'staff-1',aud:config.projectId,iss:'https://securetoken.google.com/'+config.projectId};}},documents:{withActor:(actor,fn)=>{assert.equal(actor.uid,'staff-1');assert.equal(actor.iapSub,'iap-1');return fn();}},handlers:{synthetic:async()=>{calls++;return {captured:true};}}};
 const server=http.createServer(require('../release/http.cjs').createCloudHandler({runtime,verifyIap:async value=>{if(value!=='valid')throw Error();return {sub:'iap-1'};},webRoot:__dirname,manifest:{files:[]},csp:"default-src 'self'"}));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 try{
  assert.equal((await fetch(url+'/')).status,403);
  const headers={'x-goog-iap-jwt-assertion':'valid',Origin:config.origin,'Content-Type':'application/json','X-CRM4-ID-Token':'valid'};
  const call=(patch={},body={data:{}})=>fetch(url+'/__crm4/call/synthetic',{method:'POST',headers:{...headers,...patch},body:JSON.stringify(body)});
  assert.equal((await call({Origin:'https://wrong.example.test'})).status,403);
  assert.equal((await call({'X-CRM4-ID-Token':'invalid'})).status,401);
  assert.equal((await call({}, {data:{},auth:{uid:'admin'}})).status,400);
  assert.equal((await call({}, {data:'x'.repeat(65536)})).status,413);
  const response=await call();assert.equal(response.status,200);assert.deepEqual(await response.json(),{result:{captured:true}});assert.equal(calls,1);
  assert.equal((await fetch(url+'/release/infrastructure.proposed.json',{headers})).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('durable provider capture and document tickets survive adapter restart and enforce revocation',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const runtime=require('../tools/local-handlers.cjs').createLocalHandlers(),db=runtime.db,id=crypto.randomUUID(),uid='cloud-test-'+id;
 const create=require('../release/captured-providers.cjs').createCapturedProviders;
 try{
  const payload={to:'staff1@crm4.example.test',subject:'Synthetic capture'},key={idempotencyKey:id};
  const receipts=await Promise.all([create(db),create(db),create(db)].map(p=>p.resend.emails.send(payload,key)));assert.equal(new Set(receipts.map(x=>x.data.id)).size,1);
  await assert.rejects(create(db).resend.emails.send({...payload,subject:'changed'},key),/Conflicting/);
  await assert.rejects(create(db).resend.emails.send({...payload,to:'real@example.com'}),/Synthetic/);
  let disabled=false,tokensValidAfterTime;const storage={bucket:()=>({file:()=>({download:async()=>[Buffer.from('persisted synthetic bytes')]})})},auth={getUser:async()=>({disabled,tokensValidAfterTime})};
  const links=()=>require('../release/document-links.cjs').createDocumentLinks(db,storage,auth,'https://private.example.test');
  await db.collection('crm4Memberships').doc(uid).set({active:true,workspaceId:'CRM4',role:'closer'});
  await assert.rejects(links().issue('professional-assessments/synthetic.pdf'),/context/);
  const [url]=await links().withActor({uid,iapSub:'iap-'+id},()=>links().issue('professional-assessments/synthetic.pdf'));const token=url.split('/').at(-1);
  assert.equal((await links().download(token,{sub:'iap-'+id})).toString(),'persisted synthetic bytes');
  await assert.rejects(links().download(token,{sub:'other'}),/denied/);
  disabled=true;await assert.rejects(links().download(token,{sub:'iap-'+id}),/disabled/);disabled=false;
  tokensValidAfterTime=new Date(Date.now()+2000).toISOString();await assert.rejects(links().download(token,{sub:'iap-'+id}),/sessions revoked/);tokensValidAfterTime=undefined;
  await db.collection('crm4Memberships').doc(uid).update({role:'lister'});await assert.rejects(links().download(token,{sub:'iap-'+id}),/revoked/);
  await db.collection('crm4Memberships').doc(uid).update({role:'closer'});
  await db.collection('crm4Memberships').doc(uid).update({active:false});await assert.rejects(links().download(token,{sub:'iap-'+id}),/revoked/);
 }finally{await runtime.close();}
});

test('staff upload HTTP route keeps IAP/token gates and a bounded file envelope',async()=>{
 const config={projectId:'quaerens-crm4-spain-test',origin:'https://crm4-spain-test-synthetic.europe-west1.run.app'};let calls=0;
 const runtime={config,auth:{verifyIdToken:async(token,revoked)=>{assert(revoked);if(token!=='valid')throw Error();return {uid:'synthetic',aud:config.projectId,iss:'https://securetoken.google.com/'+config.projectId};}},documents:{withActor:(_a,fn)=>fn()},handlers:{portalStaffUploadDocument:async()=>{calls++;return {status:'SHARED'};}}};
 const server=http.createServer(require('../release/http.cjs').createCloudHandler({runtime,verifyIap:async v=>{if(v!=='valid')throw Error();return {sub:'synthetic-iap'};},webRoot:__dirname,manifest:{files:[]},csp:"default-src 'self'"}));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port+'/__crm4/call/portalStaffUploadDocument',headers={'x-goog-iap-jwt-assertion':'valid','X-CRM4-ID-Token':'valid',Origin:config.origin,'Content-Type':'application/json'};
 const send=(h={},n=100000)=>fetch(url,{method:'POST',headers:{...headers,...h},body:JSON.stringify({data:{base64:'A'.repeat(n)}})});
 try{assert.equal((await send({'x-goog-iap-jwt-assertion':'invalid'})).status,403);assert.equal((await send({'X-CRM4-ID-Token':'invalid'})).status,401);assert.equal((await send({Origin:'https://other.example.test'})).status,403);assert.equal((await send()).status,200);assert.equal((await send({},21037057)).status,413);assert.equal(calls,1);}finally{await new Promise(r=>server.close(r));}
});
