'use strict';
// No SDK initialisation or network on import. Uses existing core revocation only.
const fs=require('fs'),path=require('path'),c=require('./core.cjs');
const EMAIL='bootstrap@crm4.example.test',OWNER='owner@crm4.example.test';
function receiptPath(a){c.check(a.watcherReceipt==='crm4-bootstrap-watch.json');return path.resolve(__dirname,'../.scratch',a.watcherReceipt);}
function assertReady(file,hash,now=Date.now(),alive=pid=>process.kill(pid,0)){
 const r=JSON.parse(fs.readFileSync(file,'utf8'));
 c.check(r.manifestHash===hash&&r.state==='ARMED'&&Number.isInteger(r.pid)&&r.pid>0);
 c.check(Number.isFinite(r.heartbeat)&&now>=r.heartbeat&&now-r.heartbeat<30000&&now<r.deadline-5000);
 alive(r.pid);return r;
}
function parseMembers(body,project){
 c.check(body&&typeof body==='object'&&!body.nextPageToken);
 const rows=body.documents||[];c.check(Array.isArray(rows)&&rows.length<=1);
 return rows.map(d=>{const prefix='projects/'+project+'/databases/(default)/documents/crm4Memberships/';c.check(d.name?.startsWith(prefix));const uid=d.name.slice(prefix.length);c.check(uid&&!uid.includes('/'));const f=d.fields||{};return {uid,email:f.email?.stringValue,createdBy:f.createdBy?.stringValue,workspaceId:f.workspaceId?.stringValue,role:f.role?.stringValue,active:f.active?.booleanValue};});
}
async function lookup(auth){try{return await auth.getUserByEmail(EMAIL);}catch(e){c.check(e.code==='auth/user-not-found');return null;}}
function bind(user,start,deadline){c.check(user.email===EMAIL&&user.uid&&Number.isFinite(Date.parse(user.metadata?.creationTime)));const created=Date.parse(user.metadata.creationTime);/* Admin SDK creationTime is a UTC string with whole-second precision.
 Empty-inventory preflight and exact-email lookup still reject existing identities. */c.check(created>=Math.floor(start/1000)*1000&&created<=deadline);return user.uid;}
async function monitor({auth,readMembers,guard,revokeGuard,write,notify=()=>{},now=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms)),deadline,manifestHash,pid=process.pid,cancelled=()=>false}){
 let uid,started=now(),armed=false,completed=false,failure=false,revokeResult,absenceVerified=false;
 const state={manifestHash,pid,started,deadline,state:'STARTING',heartbeat:started};
 const publish=s=>{Object.assign(state,{state:s,heartbeat:now(),...(uid?{bootstrapUid:uid}:{})});write({...state});};
 try{
  await guard();c.check(deadline>now()+5000);c.check(await lookup(auth)===null);
  const users=await auth.listUsers(1);c.check(users.users.length===0&&!users.pageToken);
  c.check((await readMembers()).length===0);armed=true;publish('ARMED');notify('WATCHER_ARMED');
  while(now()<deadline){
   c.check(!cancelled());await guard();const user=await lookup(auth);
   if(user){const found=bind(user,started,deadline);c.check(!uid||uid===found);uid=found;c.check(!user.disabled);}
   const rows=await readMembers();
   if(rows.length){c.check(rows.length===1&&uid);const m=rows[0];c.check(m.uid!==uid&&m.email===OWNER&&m.createdBy===uid&&m.workspaceId==='CRM4'&&m.role==='administrator'&&m.active===true);const owner=await auth.getUser(m.uid);c.check(owner.email===OWNER&&owner.customClaims?.platformAdmin!==true);completed=true;break;}
   publish('ARMED');await sleep(1000);
  }
 }catch{failure=true;}
 finally{
  try{publish('REVOKING');}catch{failure=true;}
  // Even failed reads trigger a separate cleanup lookup; unknown identity never
  // counts as verified absence and is never mutated by guessed UID.
  try{
   if(armed&&!uid){const user=await lookup(auth);if(user)uid=bind(user,started,deadline);else absenceVerified=true;}
   if(uid)revokeResult=await c.revoke(auth,uid,revokeGuard);
  }catch{failure=true;}
  const pass=completed&&!failure&&revokeResult?.disabled===true&&revokeResult?.claimAbsent===true&&revokeResult?.refreshTokensRevoked===true;
  const result={pass,completed,armed,bootstrapUid:uid||null,revocationVerified:!!revokeResult,absenceVerified,state:pass?'PASS_REVOKED':failure?'FAIL_CLOSED':'TIMEOUT_NO_PASS'};
  try{publish(result.state);}catch{result.pass=false;result.state='FAIL_CLOSED';}
  return result;
 }
}
module.exports={receiptPath,assertReady,parseMembers,lookup,bind,monitor};
