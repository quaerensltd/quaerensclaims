'use strict';
// CRM4 only. Explicit execution flag; disposable synthetic fixtures, no app deployment.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),P='quaerens-crm4-spain-test',N='558324850479',bucket=P+'.firebasestorage.app';
async function run(){
 if(process.argv[2]!=='--execute-approved-synthetic')throw Error('Explicit approved synthetic execution flag required');
 for(const key of ['FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST','STORAGE_EMULATOR_HOST','FIREBASE_STORAGE_EMULATOR_HOST'])assert(!process.env[key],'Unexpected emulator environment');
 assert(!process.env.GOOGLE_CLOUD_QUOTA_PROJECT||process.env.GOOGLE_CLOUD_QUOTA_PROJECT===P,'Unexpected quota project');process.env.GOOGLE_CLOUD_QUOTA_PROJECT=P;
 const cfg=JSON.parse(fs.readFileSync(path.join(root,'release/firebase-web.public.json')));assert.equal(cfg.projectId,P);assert.equal(cfg.appId,'1:558324850479:web:4820e9460b4926adbd4bda');assert.equal(cfg.storageBucket,bucket);
 const token=cp.execFileSync('C:\\Windows\\System32\\cmd.exe',['/d','/s','/c','gcloud.cmd auth print-access-token'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 const report={runId:'crm4-cloud-'+crypto.randomUUID(),projectId:P,projectNumber:N,startedAt:new Date().toISOString(),checks:[],mutations:[],cleanup:[],credentialsPersisted:false};
 const file=path.join(root,'release/evidence/phase1/authenticated-storage-'+report.runId+'.json'),save=()=>fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
 async function api(url,method='GET',body,admin=true){const r=await fetch(url,{method,headers:{...(admin?{Authorization:'Bearer '+token,'x-goog-user-project':P}:{}),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const text=await r.text();return {status:r.status,body:text?JSON.parse(text):{}};}
 async function guard(){const r=await api('https://cloudresourcemanager.googleapis.com/v1/projects/'+P);assert.equal(r.status,200);assert.equal(r.body.projectId,P);assert.equal(r.body.projectNumber,N);assert.equal(r.body.lifecycleState,'ACTIVE');}
 async function write(kind,url,method,body,resource){await guard();report.mutations.push({kind,resource,time:new Date().toISOString(),state:'intent'});save();const r=await api(url,method,body);report.mutations.at(-1).status=r.status;report.mutations.at(-1).state='response';save();assert(r.status<300,kind+': '+r.status+' '+(r.body.error?.message||''));return r.body;}
 const authUrl='https://identitytoolkit.googleapis.com/v1/projects/'+P+'/accounts',db='https://firestore.googleapis.com/v1/projects/'+P+'/databases/(default)/documents',objects='https://storage.googleapis.com/storage/v1/b/'+bucket+'/o';
 const users=[],docs=new Map(),createdObjects=new Map(),serverDocs=new Set();let sdkDb,sdkApp,afterServerSave;
 report.execution='Local governed upload callable with verified Firebase ID tokens and real CRM4 Firestore/GCS; deployed IAP and managed-runtime integration remain pending';
 const {OAuth2Client,GoogleAuth}=require('node:module').createRequire(require.resolve('google-gax/package.json'))('google-auth-library'),oauth=new OAuth2Client();oauth.setCredentials({access_token:token});oauth.quotaProjectId=P;
 const sdkAuth=new GoogleAuth({authClient:oauth,projectId:P});
 sdkDb=new(require('@google-cloud/firestore').Firestore)({projectId:P,auth:sdkAuth,preferRest:true});
 sdkApp=require('firebase-admin/app').initializeApp({projectId:P,credential:{getAccessToken:async()=>({access_token:token,expires_in:1800})}},report.runId);
 const authVerifier=require('firebase-admin/auth').getAuth(sdkApp),storage=new(require('@google-cloud/storage').Storage)({projectId:P,authClient:oauth});
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 const guardedDb={collection:n=>sdkDb.collection(n),runTransaction:fn=>sdkDb.runTransaction(async tx=>{
  const view=new Proxy(tx,{get(target,key){if(['create','set','update','delete'].includes(key))return (ref,data,...args)=>{
   assert(['clientPortalDocuments','clientPortalAudit','crm4LegacyPortalOperations'].includes(ref.parent.id));assert.equal(data.caseId,report.runId);
   serverDocs.add(ref.path);report.mutations.push({kind:'governed-transaction-write',resource:ref.path,time:new Date().toISOString()});save();return target[key](ref,data,...args);
  };const value=target[key];return typeof value==='function'?value.bind(target):value;}});
  const result=await fn(view);await guard();return result;
 })};
 const guardedStorage={bucket:()=>({file:name=>{
  assert(name.startsWith('clientPortal/'+report.runId+'/shared/'));const f=storage.bucket(bucket).file(name);
  return {getMetadata:()=>f.getMetadata(),exists:()=>f.exists(),save:async(bytes,options)=>{
   await guard();report.mutations.push({kind:'governed-synthetic-upload',resource:name,time:new Date().toISOString()});save();
   await f.save(bytes,options);const [meta]=await f.getMetadata();createdObjects.set(name,meta.generation);if(afterServerSave)await afterServerSave();
  }};
 }})};
 const governed=require('./portal-upload-boundary.cjs').portalUpload({db:guardedDb,HttpsError,onCall:(...a)=>a.at(-1),admin:{firestore:require('firebase-admin').firestore,storage:()=>guardedStorage}});
 async function serverUpload(user,expected,label,patch={}){
  const data={caseId:report.runId,documentId:report.runId+'-'+crypto.randomUUID(),filename:'synthetic.txt',contentType:'text/plain',base64:Buffer.from('Synthetic evidence only').toString('base64'),...patch};
  let actual,result;
  try{const decoded=await authVerifier.verifyIdToken(user.idToken,true);assert.equal(decoded.aud,P);assert.equal(decoded.uid,user.uid);result=await governed({data,auth:{uid:decoded.uid,token:decoded}});actual=200;}catch(e){actual={'permission-denied':403,'unauthenticated':401,'already-exists':409,'invalid-argument':400}[e.code]||500;if(actual!==expected)report.lastServerError=e.message;}
  report.checks.push({label,expected,actual});save();return {data,result};
 }
 const val=x=>x===null?{nullValue:null}:typeof x==='boolean'?{booleanValue:x}:typeof x==='number'?{integerValue:String(x)}:typeof x==='string'?{stringValue:x}:Array.isArray(x)?{arrayValue:{values:x.map(val)}}:{mapValue:{fields:Object.fromEntries(Object.entries(x).map(([k,v])=>[k,val(v)]))}};
 async function put(name,data){assert(name.includes(report.runId));const existing=await api(db+'/'+name);if(!docs.has(name))assert.equal(existing.status,404,'Refuse existing fixture');else assert.equal(existing.body.updateTime,docs.get(name));const result=await write('fixture-write',db+'/'+name+'?currentDocument.'+(docs.has(name)?'updateTime='+encodeURIComponent(docs.get(name)):'exists=false'),'PATCH',{fields:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,val(v)]))},name);docs.set(name,result.updateTime);}
 async function upload(name,user,expected,label){assert(name.startsWith('clientPortal/'+report.runId+'/'));await guard();report.mutations.push({kind:'synthetic-client-upload',resource:name,expected,time:new Date().toISOString()});save();const r=await require('../tests/storage-upload-helper.cjs').uploadSynthetic('https://firebasestorage.googleapis.com/v0/b/'+bucket+'/o',user.idToken,name);const body=await r.json();if(r.status===200){assert(body.generation);createdObjects.set(name,body.generation);}report.checks.push({label,expected,actual:r.status});save();if(r.status!==expected)report.checks.at(-1).error=body.error?.message||'Unexpected status';save();}
 try{
  await guard();const release=await api('https://firebaserules.googleapis.com/v1/projects/'+P+'/releases/firebase.storage/'+bucket);assert.equal(release.status,200);const rule=await api('https://firebaserules.googleapis.com/v1/'+release.body.rulesetName);assert.equal(crypto.createHash('sha256').update(rule.body.source.files[0].content).digest('hex'),require('../release/bootstrap-plan.json').sourceHashes['storage.rules']);const authConfig=await api('https://identitytoolkit.googleapis.com/admin/v2/projects/'+P+'/config');assert.equal(authConfig.status,200);assert.equal(authConfig.body.subtype,'FIREBASE_AUTH');assert(authConfig.body.client.permissions.disabledUserSignup&&authConfig.body.client.permissions.disabledUserDeletion);assert(authConfig.body.signIn.email.passwordRequired);
  for(const role of ['staff-one','staff-two','administrator']){const uid=report.runId+'-'+role,email=uid+'@example.test',password=crypto.randomBytes(30).toString('base64url');const existing=await api(authUrl+':lookup','POST',{localId:[uid]});assert.equal(existing.status,200);assert(!existing.body.users?.length);users.push({uid,email,role});await write('synthetic-user-create',authUrl,'POST',{localId:uid,email,password,emailVerified:true,displayName:'Disposable CRM4 synthetic '+role},uid);const login=await api('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(cfg.apiKey),'POST',{email,password,returnSecureToken:true},false);assert.equal(login.status,200,'Synthetic sign-in failed');users.at(-1).idToken=login.body.idToken;const claims=JSON.parse(Buffer.from(login.body.idToken.split('.')[1],'base64url'));assert.equal(claims.aud,P);assert.equal(claims.sub,uid);await put('crm4Memberships/'+uid,{workspaceId:'CRM4',active:true,role:role==='administrator'?'administrator':'lister',roles:role==='administrator'?['administrator']:['lister','closer']});}
  const caseName='clientPortalCases/'+report.runId,leadName='crm4Leads/'+report.runId,caseData={workspaceId:'CRM4',portalVersion:2,crmLink:{workspaceId:'CRM4',collection:'crm4Leads',caseId:report.runId},clientUid:users[0].uid,accessState:'ACTIVE'};
  const leadData={workspaceId:'CRM4',synthetic:true,listerUid:users[0].uid,closerUid:users[1].uid};await put(leadName,leadData);await put(caseName,caseData);
  const shared='clientPortal/'+report.runId+'/shared/',client='clientPortal/'+report.runId+'/client-uploads/'+users[0].uid+'/',admin=users[2];
  await upload(shared+'allowed.txt',admin,403,'direct administrator upload denied; server boundary required');
  const first=await serverUpload(admin,200,'active administrator governed upload allowed');
  await serverUpload(admin,200,'exact upload retry allowed without duplicate audit',first.data);
  await serverUpload(admin,409,'conflicting object overwrite denied',{...first.data,base64:Buffer.from('Changed bytes').toString('base64')});
  if(first.result){const doc=await api(db+'/clientPortalDocuments/'+first.data.documentId);assert.equal(doc.body.fields.uploadedByUid.stringValue,admin.uid);report.checks.push({label:'individual administrator document attribution',expected:200,actual:200});}
  if(first.result){const audits=await sdkDb.collection('clientPortalAudit').where('caseId','==',report.runId).get();assert.equal(audits.size,1);assert.equal(audits.docs[0].data().actorUid,admin.uid);assert.equal(audits.docs[0].data().action,'DOCUMENT_SHARED');report.checks.push({label:'original audit retained exactly once under retry',expected:1,actual:audits.size});
  afterServerSave=()=>put('crm4Memberships/'+admin.uid,{workspaceId:'CRM4',role:'administrator',active:false});const revoked=await serverUpload(admin,403,'membership revoked during upload blocks document publication');afterServerSave=undefined;const unpublished=await api(db+'/clientPortalDocuments/'+revoked.data.documentId);assert.equal(unpublished.status,404);report.checks.push({label:'revoked upload has no client-visible registration',expected:404,actual:unpublished.status});await put('crm4Memberships/'+admin.uid,{workspaceId:'CRM4',role:'administrator',active:true});
  }else report.skipped=['admin audit/retry completion and mid-upload revocation depend on successful first server upload'];
  if(createdObjects.has(shared+'allowed.txt'))await upload(shared+'allowed.txt',admin,403,'overwrite denied');
  for(const staff of users.slice(0,2)){await upload(shared+staff.role+'.txt',staff,403,staff.role+' direct upload denied');await serverUpload(staff,403,staff.role+' dual role cannot gain administrator power');}
  await upload(client+'owner.txt',users[0],200,'verified case owner allowed');await upload(client+'wrong-user.txt',users[1],403,'wrong owner denied');
  await put(caseName,{...caseData,accessState:'DISABLED'});await upload(client+'revoked.txt',users[0],403,'revoked case denied');await put(caseName,caseData);
  for(const workspaceId of ['CRM2','CRM3','CRM5']){await put('crm4Memberships/'+admin.uid,{workspaceId,role:'administrator',active:true});await serverUpload(admin,403,'foreign '+workspaceId+' membership denied');}
  await put('crm4Memberships/'+admin.uid,{workspaceId:'CRM4',role:'administrator',active:true});
  for(const patch of [{workspaceId:'CRM3'},{workspaceId:''},{workspaceId:null},{crm4LeadId:'conflict'},{crm4LeadId:''},{crm4LeadId:null},{crmLink:{...caseData.crmLink,workspaceId:'CRM5'}},{crmLink:{...caseData.crmLink,collection:'crm3Leads'}}]){
   await put(caseName,{...caseData,...patch});await serverUpload(admin,403,'conflicting case marker '+JSON.stringify(patch));await upload(client+crypto.randomUUID()+'.txt',users[0],403,'case owner conflicting marker denied');
  }
  await put(caseName,caseData);await put(leadName,{workspaceId:'CRM2',synthetic:true});await serverUpload(admin,403,'foreign linked lead denied');await upload(client+'foreign-lead.txt',users[0],403,'case owner foreign linked lead denied');await put(leadName,leadData);
  await put('crm4Memberships/'+admin.uid,{workspaceId:'CRM4',role:'administrator',active:false});await serverUpload(admin,403,'inactive membership denied');
  assert.deepEqual((await sdkDb.collection('crm4Leads').doc(report.runId).get()).data(),leadData);assert.deepEqual((await sdkDb.collection('clientPortalCases').doc(report.runId).get()).data(),caseData);report.checks.push({label:'case ownership and lead assignments unchanged',expected:200,actual:200});
  report.passed=report.checks.filter(c=>c.actual===c.expected).length;report.failed=report.checks.length-report.passed;if(report.failed)process.exitCode=1;
 }catch(error){report.error=error.message;report.failed=1;process.exitCode=1;}
 finally{
  // A save may succeed before getMetadata is denied or the response is lost.
  // Discover only this run's objects through the existing list permission so
  // every successful write is generation-tracked before cleanup.
  try{const listed=await api(objects+'?prefix='+encodeURIComponent('clientPortal/'+report.runId+'/'));assert.equal(listed.status,200);collectRunObjects(report,listed.body,createdObjects);}catch(e){report.cleanup.push({resource:'run-scoped-object-discovery',error:e.message});process.exitCode=1;}
  for(const name of serverDocs){try{const current=await api(db+'/'+name);if(current.status===200){assert.equal(current.body.fields.caseId.stringValue,report.runId);docs.set(name,current.body.updateTime);}else assert.equal(current.status,404);}catch(e){report.cleanup.push({resource:name,error:e.message});process.exitCode=1;}}
  for(const[name,generation]of createdObjects){try{await write('synthetic-object-cleanup',objects+'/'+encodeURIComponent(name)+'?ifGenerationMatch='+generation,'DELETE',undefined,name);report.cleanup.push({resource:name,deleted:true,softDeleteRetentionSeconds:604800});}catch(e){report.cleanup.push({resource:name,error:e.message});process.exitCode=1;}}
  for(const[name,time]of [...docs].reverse()){try{await write('synthetic-document-cleanup',db+'/'+name+'?currentDocument.updateTime='+encodeURIComponent(time),'DELETE',undefined,name);report.cleanup.push({resource:name,deleted:true});}catch(e){report.cleanup.push({resource:name,error:e.message});process.exitCode=1;}}
  for(const user of users){try{const lookup=await api(authUrl+':lookup','POST',{localId:[user.uid]});if(lookup.body.users?.length){assert.equal(lookup.body.users[0].email,user.email);await write('synthetic-user-cleanup',authUrl+':delete','POST',{localId:user.uid},user.uid);}const check=await api(authUrl+':lookup','POST',{localId:[user.uid]});assert.equal(check.status,200);assert(!check.body.users?.length);report.cleanup.push({resource:user.uid,deleted:true});}catch(e){report.cleanup.push({resource:user.uid,error:e.message});process.exitCode=1;}}
  if(sdkDb)await sdkDb.terminate();if(sdkApp)await require('firebase-admin/app').deleteApp(sdkApp);
  report.passed=report.checks.filter(c=>c.actual===c.expected).length;report.failed=report.checks.length-report.passed+(report.error?1:0);
  report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({passed:report.passed||0,failed:report.failed||0,error:report.error,cleanupFailures:report.cleanup.filter(r=>r.error).length,report:file}));
 }
}
function collectRunObjects(report,body,createdObjects){
 assert(!body.nextPageToken,'Unexpected fixture pagination');
 for(const obj of body.items||[]){
  assert(obj.name.startsWith('clientPortal/'+report.runId+'/'),'Foreign run object');
  assert(report.mutations.some(m=>m.resource===obj.name&&['governed-synthetic-upload','synthetic-client-upload'].includes(m.kind)),'Unjournalled object');
  if(obj.name.includes('/shared/'))assert.equal(obj.metadata?.crm4ActorUid,report.runId+'-administrator');
  assert(typeof obj.generation==='string'&&/^[0-9]+$/.test(obj.generation),'Exact object generation required');
  createdObjects.set(obj.name,obj.generation);
 }
}
module.exports={collectRunObjects};
if(require.main===module)run().catch(e=>{console.error(e.message);process.exitCode=1;});
