'use strict';
// Explicit manifest/checksum approval; no network or mutation on import.
const fs=require('fs'),path=require('path'),c=require('./core.cjs'),w=require('./bootstrap-watcher.cjs'),diagnostics=require('./private-diagnostics.cjs'),io=require('./watcher-io.cjs');
let activeDiagnostic=null;
async function main(){
 const [action,file,expectedHash,suppliedUid]=process.argv.slice(2);let uid=suppliedUid;
 c.check(['create-bootstrap','revoke-bootstrap','set-owner-password','watch-bootstrap'].includes(action)&&file&&expectedHash);
 const bytes=fs.readFileSync(file);c.check(c.sha(bytes)===expectedHash);const a=JSON.parse(bytes.toString().replace(/^\uFEFF/,''));c.approve(a,action);
 if(['create-bootstrap','watch-bootstrap'].includes(action))c.approve(a,'revoke-bootstrap');
 for(const [name,hash]of Object.entries(a.toolHashes||{})){c.check(!name.includes('..')&&!path.isAbsolute(name));c.check(c.sha(fs.readFileSync(path.join(__dirname,name)))===hash);}
 c.check(['core.cjs','credentials.cjs','bootstrap-watcher.cjs','private-diagnostics.cjs','watcher-io.cjs'].every(n=>a.toolHashes?.[n]));
 c.check(!['FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST','GOOGLE_APPLICATION_CREDENTIALS'].some(k=>process.env[k]));
 c.check(!process.env.GOOGLE_CLOUD_QUOTA_PROJECT||process.env.GOOGLE_CLOUD_QUOTA_PROJECT===c.P);
 const traceDir=path.resolve(__dirname,'../.scratch');fs.mkdirSync(traceDir,{recursive:true});const traceFile=path.join(traceDir,'credential-diagnostic-'+require('crypto').randomUUID()+'.json');
 const diag=diagnostics.create({write:r=>{const next=traceFile+'.next';fs.writeFileSync(next,JSON.stringify(r,null,2)+'\n',{mode:0o600});fs.renameSync(next,traceFile);}});activeDiagnostic=diag;diag.checkHealthy();
 process.env.GOOGLE_CLOUD_QUOTA_PROJECT=c.P; // SDK-supported, process-local only.
 const cliEnv={...process.env,CLOUDSDK_CORE_DISABLE_FILE_LOGGING:'true',CLOUDSDK_CORE_LOG_HTTP:'false'};
 const cli=args=>io.cli(process.platform==='win32'?'gcloud.cmd':'gcloud',args,{env:cliEnv,shell:process.platform==='win32'});
 c.check(a.operatorEmail==='martijnpronk76@gmail.com');
 const token=io.tokenCache(()=>diag.step('operator-token-acquisition',()=>cli([...io.TOKEN_ARGS])));
 const read=io.serial(async(url,body)=>io.read(url,{token:await token(),project:c.P,body}));
 const receipt=w.receiptPath(a);
 async function guard(guardAction=action){
  await diag.step('approval',async()=>c.approve(a,guardAction));
  await diag.step('operator-configuration',()=>io.operatorConfig(cli,a.operatorEmail));
  const p=await diag.step('project-read',()=>read('https://cloudresourcemanager.googleapis.com/v1/projects/'+c.P+'?fields=projectId,projectNumber,lifecycleState'));
  await diag.step('project-identity',async()=>c.check(p.projectId===c.P&&p.projectNumber===c.N&&p.lifecycleState==='ACTIVE'));
  if(guardAction==='create-bootstrap'){await diag.step('watcher-readiness',async()=>w.assertReady(receipt,expectedHash));diag.checkHealthy();}
 }
 await guard();
 const {initializeApp,deleteApp}=require('firebase-admin/app');
 const app=initializeApp({projectId:c.P,credential:{getAccessToken:async()=>({access_token:await token(),expires_in:300})}},'crm4-private-operator');
 const auth=diag.wrapAuth(io.authReads(require('firebase-admin/auth').getAuth(app),read,c.P));let password;
 const readMembers=()=>diag.step('membership-read',async()=>w.parseMembers(await read('https://firestore.googleapis.com/v1/projects/'+c.P+'/databases/(default)/documents/crm4Memberships?pageSize=2&mask.fieldPaths=email&mask.fieldPaths=createdBy&mask.fieldPaths=workspaceId&mask.fieldPaths=role&mask.fieldPaths=active'),c.P));
 try{
  if(!['create-bootstrap','watch-bootstrap'].includes(action)&&a.resolveUidsByExactEmail===true){const target=await auth.getUserByEmail(action==='set-owner-password'?'owner@crm4.example.test':'bootstrap@crm4.example.test');c.check(!uid||uid===target.uid);uid=target.uid;}
  let result;
  if(action==='watch-bootstrap'){
   fs.mkdirSync(path.dirname(receipt),{recursive:true});const fd=fs.openSync(receipt,'wx',0o600);fs.closeSync(fd);
   c.check(a.watcherArmedDurationMs===600000);const deadline=Date.parse(a.window.endUtc)-30000;
   let cancelled=false;const cancel=()=>{cancelled=true;};process.on('SIGINT',cancel);process.on('SIGTERM',cancel);
   try{result=await w.monitor({auth,readMembers,guard,revokeGuard:()=>guard('revoke-bootstrap'),deadline,deadlineLimit:deadline,armedDurationMs:a.watcherArmedDurationMs,manifestHash:expectedHash,liveHeartbeat:true,cancelled:()=>cancelled,readAcknowledgement:a.requireIndependentWatcherAcknowledgement===true?()=>{const file=receipt+'.ack';try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}:null,
    write:r=>{const next=receipt+'.next';fs.writeFileSync(next,JSON.stringify(r)+'\n',{mode:0o600});fs.renameSync(next,receipt);},notify:s=>process.stdout.write(s+'\n')});}finally{process.off('SIGINT',cancel);process.off('SIGTERM',cancel);}
   if(!result.pass)process.exitCode=1;
  }
  if(action==='create-bootstrap'){
   c.check((await readMembers()).length===0);const users=await auth.listUsers(1);c.check(users.users.length===0&&!users.pageToken);
   password=await diag.step('private-input',()=>c.masked());await diag.step('password-policy',async()=>{if(typeof password!=='string'||password.length<20){const e=Error('Private input rejected');e.code='PASSWORD_POLICY_FAILED';throw e;}});result=await diag.step('bootstrap-provision',()=>c.bootstrap(auth,password,guard,()=>guard('revoke-bootstrap')));
   try{await guard();}catch{await c.revoke(auth,result.uid,()=>guard('revoke-bootstrap'));throw Error('WATCHER_LOST');}
  }
  if(action==='revoke-bootstrap'){c.check(uid===a.bootstrapUid||a.resolveUidsByExactEmail===true);result=await c.revoke(auth,uid,guard);}
  if(action==='set-owner-password'){
   c.check(uid===a.ownerUid||a.resolveUidsByExactEmail===true);await guard();const user=await auth.getUser(uid);c.check(user.email==='owner@crm4.example.test'&&user.customClaims?.platformAdmin!==true);
   const boot=await auth.getUserByEmail('bootstrap@crm4.example.test');c.check(boot.disabled&&boot.customClaims?.platformAdmin!==true);
   const rows=await readMembers();c.check(rows.length===1&&rows[0].uid===uid&&rows[0].createdBy===boot.uid&&rows[0].workspaceId==='CRM4'&&rows[0].role==='administrator'&&rows[0].active===true);
   password=await diag.step('private-input',()=>c.masked());await diag.step('password-policy',async()=>c.check(password.length>=20));await guard();await auth.updateUser(uid,{password});result={passwordUpdated:true};
  }
  diag.checkHealthy();diag.record('completion',result?.pass===false?'FAIL':'PASS');
  process.stdout.write(JSON.stringify({action,result})+'\n');
 }finally{password=undefined;await deleteApp(app);}
}
if(require.main===module)main().catch(()=>{const first=activeDiagnostic?.summary().firstFailure;process.stderr.write('PRIVATE_ACTION_FAILED: '+(first?first.stage+' / '+first.category:'unclassified preflight or cleanup')+'; stop; no automatic retry.\n');process.exitCode=1;});
module.exports={main};
