"use strict";
// Private operator entrypoint. No execution on import. Never prints raw exceptions.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),core=require('../managed-rehearsal/core.cjs');
const {provision,PROJECT,EMAIL,OPERATOR}=require('./provision.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function validate(bytes,expected,now=Date.now()){
 assert.equal(sha(bytes),expected);const a=JSON.parse(bytes);
 assert.equal(a.executionApproved,true);assert.equal(a.initialOwnerExceptionApproved,true);
 assert.equal(a.project,PROJECT);assert.equal(a.projectNumber,'558324850479');assert.equal(a.operator,OPERATOR);assert.equal(a.email,EMAIL);
 assert.equal(a.expiresAt,'2026-10-24T09:00:00Z');assert.equal(a.containmentUntil,'2026-10-24T10:00:00Z');assert.equal(a.image,core.IMAGE);
 assert(typeof a.ownerApprovalReference==='string'&&a.ownerApprovalReference.length>5);assert(now<Date.parse(a.expiresAt)-600000);
 const required=['first-owner-candidate/run.cjs','first-owner-candidate/provision.cjs','first-owner-candidate/firestore-rest.cjs','first-owner-candidate/preflight.cjs','managed-rehearsal/core.cjs','managed-rehearsal/watcher-io.cjs','package-lock.json','evidence/private-execution-resumed-20261018/audit-verified.json','evidence/saturday-owner-test-20261017/cloud-run.proposed.json','evidence/private-access-20261018/invoker-verified.json','evidence/private-access-20261018/iap-access-verified.json','evidence/post-oauth-20261019/verification.json','evidence/approved-build/auth-result.json'];
 for(const f of required){assert.equal(typeof a.sourceHashes?.[f],'string');assert.equal(sha(fs.readFileSync(path.join(root,f))),a.sourceHashes[f]);}return a;
}
async function coordinate({preflight,masked,perform}){
 await preflight();let password;
 try{password=await masked();assert(typeof password==='string'&&password.length>=20);await preflight();return await perform(password);}finally{password=undefined;}
}
async function main(){
 const [mode,file,hash]=process.argv.slice(2);assert.equal(mode,'--apply');assert(file&&hash);const a=validate(fs.readFileSync(file),hash);
 assert(process.stdin.isTTY&&process.stderr.isTTY);
 for(const k of ['FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST','GOOGLE_APPLICATION_CREDENTIALS','NODE_OPTIONS','NODE_DEBUG','DEBUG','HTTP_PROXY','HTTPS_PROXY'])assert(!process.env[k]);
 assert(!process.env.GOOGLE_CLOUD_QUOTA_PROJECT||process.env.GOOGLE_CLOUD_QUOTA_PROJECT===PROJECT);
 const io=require('../managed-rehearsal/watcher-io.cjs'),cp=require('child_process');
 const dir=path.join(root,'.scratch','initial-owner-'+crypto.randomUUID());fs.mkdirSync(dir,{recursive:true});
 const receipt=path.join(dir,'receipt.json');let records=[];const journal=r=>{records.push({...r,at:new Date().toISOString()});const temp=receipt+'.next';fs.writeFileSync(temp,JSON.stringify(records,null,2)+'\n',{mode:0o600});fs.renameSync(temp,receipt);};
 const env={...process.env,CLOUDSDK_CORE_DISABLE_FILE_LOGGING:'true',CLOUDSDK_CORE_LOG_HTTP:'false'};
 const cli=args=>io.cli('gcloud.cmd',args,{shell:true,env});const token=io.tokenCache(()=>cli([...io.TOKEN_ARGS]));
 const read=io.serial(async(url,body)=>io.read(url,{token:await token(),project:PROJECT,body}));
 async function guard(cleanup=false){if(!cleanup)assert(!cancelled);assert(Date.now()<Date.parse(cleanup?a.containmentUntil:a.expiresAt));await io.operatorConfig(cli,OPERATOR);const p=await read('https://cloudresourcemanager.googleapis.com/v1/projects/'+PROJECT+'?fields=projectId,projectNumber,lifecycleState');assert.equal(p.projectId,PROJECT);assert.equal(p.projectNumber,'558324850479');assert.equal(p.lifecycleState,'ACTIVE');}
 async function preflight(){validate(fs.readFileSync(file),hash);const session='coordinated-'+crypto.randomUUID(),folder=path.join(root,'.scratch',session);fs.mkdirSync(folder);await new Promise((resolve,reject)=>cp.execFile(process.execPath,[path.join(__dirname,'preflight.cjs'),session],{timeout:300000,windowsHide:true,maxBuffer:1048576},err=>err?reject(Error('PREFLIGHT_FAILED')):resolve()));const r=JSON.parse(fs.readFileSync(path.join(folder,'security.json')));assert.equal(r.result,'PASS');assert(Date.now()-Date.parse(r.at)<300000);journal({stage:'security-preflight',pass:true});}
 let app,cancelled=false;const cancel=()=>{cancelled=true;};process.on('SIGINT',cancel);process.on('SIGTERM',cancel);
 try{const result=await coordinate({preflight,masked:()=>core.masked(),perform:async password=>{
  process.env.GOOGLE_CLOUD_QUOTA_PROJECT=PROJECT;
  const {initializeApp}=require('firebase-admin/app');app=initializeApp({projectId:PROJECT,credential:{getAccessToken:async()=>({access_token:await token(),expires_in:300})}},'crm4-initial-owner');
  const auth=io.authReads(require('firebase-admin/auth').getAuth(app),read,PROJECT),db=require('./firestore-rest.cjs').createRestDb({project:PROJECT,request:read});
  return provision({auth,db,approval:a,password,guard:()=>guard(false),cleanupGuard:()=>guard(true),journal});
 }});journal({stage:'result',...result});console.log(result.pass?'OWNER_PROVISIONED_VERIFY_BROWSER_LOGIN':'STOP_FAILED_REVIEW_RECEIPT');if(!result.pass)process.exitCode=1;
 }catch{journal({stage:'stopped',pass:false});console.log('STOP_NO_AUTOMATIC_RETRY');process.exitCode=1;}finally{process.off('SIGINT',cancel);process.off('SIGTERM',cancel);if(app)await require('firebase-admin/app').deleteApp(app);}
}
module.exports={validate,coordinate};if(require.main===module)main().catch(()=>{console.log('STOP_APPROVAL_OR_PRIVATE_ENVIRONMENT_INVALID');process.exitCode=1;});
