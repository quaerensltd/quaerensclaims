'use strict';
// Ordinary Edge coordination only. No WebDriver/CDP, cookies or token transport.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),core=require('../managed-rehearsal/core.cjs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function validate(req,res,now=Date.now()){
 assert.deepEqual(Object.keys(res).sort(),['id','origin','state',...(req.phase==='create'?['ownerUid']:[]),...(req.phase==='login'?['uid']:[])].sort());
 assert.equal(res.id,req.id);assert.equal(res.origin,core.ORIGIN);assert(now<req.deadline);
 assert.equal(res.state,{ready:'READY',create:'OWNER_CREATED',revocation:'REVOKED',login:'OWNER_LOGIN'}[req.phase]);
 if(req.phase==='create')assert(typeof res.ownerUid==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(res.ownerUid)&&res.ownerUid!==req.approval.bootstrapUid);
 if(req.phase==='login')assert.equal(res.uid,req.uid);
 return res;
}
function snippet(req){
 assert(['ready','create','revocation','login'].includes(req.phase));
 const header=`(()=>{const r=${JSON.stringify(req)};if(location.origin!==${JSON.stringify(core.ORIGIN)}||Date.now()>=r.deadline)throw Error('WRONG_OR_EXPIRED_CONTEXT');let out=document.getElementById('crm4-private-status');if(!out){out=document.createElement('output');out.id='crm4-private-status';document.body.prepend(out);}const publish=x=>{const value={id:r.id,origin:location.origin,state:x.state};if(r.phase==='create'&&x.state==='OWNER_CREATED')value.ownerUid=x.ownerUid;if(r.phase==='login'&&x.state==='OWNER_LOGIN')value.uid=x.uid;out.textContent=JSON.stringify(value);let save=document.getElementById('crm4-save-receipt');if(!save){save=document.createElement('button');save.id='crm4-save-receipt';document.body.prepend(save);}save.textContent='Save '+r.phase+' verification receipt';save.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='edge-'+r.id+'.result.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};};`;
 if(req.phase==='create')return header+`const ceremony=${require('../managed-rehearsal/browser-ceremony.js').crm4PrivateCeremony.toString()};void ceremony(r.approval,x=>{if(x.state==='OWNER_CREATED'){publish({state:x.state,ownerUid:x.ownerUid});}else if(x.state==='REVOKED'){window.__crm4PrivateRevoked=true;}else{publish({state:'FAIL'});}}).catch(()=>publish({state:'FAIL'}));})()`;
 if(req.phase==='revocation')return header+`const button=[...document.querySelectorAll('button')].find(b=>b.textContent==='Verify revocation');if(!button)throw Error('VERIFY_CONTROL_ABSENT');window.__crm4PrivateRevoked=false;button.click();const until=Math.min(r.deadline,Date.now()+30000);const timer=setInterval(()=>{if(window.__crm4PrivateRevoked===true){clearInterval(timer);publish({state:'REVOKED'});}else if(Date.now()>=until){clearInterval(timer);publish({state:'FAIL'});}},100);})()`;
 return header+`void(async()=>{const apps=await import('/__crm4/sdk/10.8.0/app.js');const app=apps.initializeApp();if(app.options.projectId!==${JSON.stringify(core.P)})throw Error('PROJECT');`+(req.phase==='ready'?`if(!document.querySelector('input[type=password]'))throw Error('LOGIN_PAGE');publish({state:'READY'});`:`const sdk=await import('/__crm4/sdk/10.8.0/auth.js');const user=sdk.getAuth(app).currentUser;if(!user||user.uid!==r.uid)throw Error('OWNER');const claims=(await user.getIdTokenResult()).claims;if(claims.platformAdmin===true||claims.aud!==${JSON.stringify(core.P)}||claims.iss!=='https://securetoken.google.com/'+${JSON.stringify(core.P)})throw Error('CLAIMS');publish({state:'OWNER_LOGIN',uid:user.uid});`)+`})().catch(()=>publish({state:'FAIL'}));})()`;
}
function exchange(dir,{now=Date.now,sleep=wait,timeout=180000,receiptDirectory=null,preparationId=null}={}){
 if(preparationId!==null)assert(/^[a-f0-9-]{36}$/.test(preparationId));
 let pending=false;
 return async(phase,data={})=>{assert(!pending,'BROWSER_ACTION_ALREADY_PENDING');pending=true;
 const id=crypto.randomUUID(),deadline=Math.min(now()+timeout,data.approval?Date.parse(data.approval.endUtc):Infinity),req={id,phase,deadline,...data,...(preparationId?{preparationId}:{})};
 const stem=path.join(dir,'edge-'+id),result=stem+'.result.json';
 try{assert(now()<deadline);fs.writeFileSync(stem+'.request.json',JSON.stringify(req)+'\n',{flag:'wx',mode:0o600});if(preparationId)require('./inactive-edge.cjs').checkTicket(req,preparationId,now());const source=preparationId?JSON.stringify(req)+'\n':snippet(req),sourceFile=stem+(preparationId?'.activation.json':'.snippet.js');fs.writeFileSync(sourceFile,source,{flag:'wx',mode:0o600});const sourceHash=core.sha(Buffer.from(source));fs.writeFileSync(stem+'.sha256',sourceHash+'\n',{flag:'wx'});
 console.log(preparationId?'EDGE '+phase+': use the existing Choose File control to select '+sourceFile:'MANUAL EDGE '+phase+': reviewed snippet '+sourceFile);console.log('SHA256 '+sourceHash);if(receiptDirectory)console.log('Save the non-sensitive receipt as '+path.join(receiptDirectory,path.basename(result))+'. Codex manages watcher timing; do not send credentials or watcher messages.');
 while(now()<deadline){assert.equal(core.sha(fs.readFileSync(sourceFile)),sourceHash,'SNIPPET_CHANGED');if(receiptDirectory&&!fs.existsSync(result)){const downloaded=path.join(receiptDirectory,path.basename(result));if(fs.existsSync(downloaded)){const bytes=fs.readFileSync(downloaded);assert(bytes.length<=2048);const accepted=validate(req,JSON.parse(bytes),now());fs.writeFileSync(result,JSON.stringify(accepted)+'\n',{flag:'wx',mode:0o600});}}if(fs.existsSync(result)){const bytes=fs.readFileSync(result);assert(bytes.length<=2048);return validate(req,JSON.parse(bytes),now());}await sleep(250);}throw Error('ORDINARY_EDGE_TIMEOUT');
 }finally{pending=false;}};
}
async function open({dir,approval}={}){
 require('./context.cjs').privateEnvironment();
 assert(approval?.browserMode==='manual-edge'&&approval.manualBrowserHandoffApproved===true,'MANUAL_HANDOFF_NOT_APPROVED');assert(fs.statSync(dir).isDirectory());const receiptDirectory=approval.manualReceiptDirectory;assert.equal(receiptDirectory,path.join(require('os').homedir(),'Downloads'));assert(fs.statSync(receiptDirectory).isDirectory());
 let preparationId=null;if(approval.inactiveBrowserPreparation){const p=approval.inactiveBrowserPreparation;assert.equal(approval.inactiveBrowserHandoffApproved,true,'INACTIVE_HANDOFF_NOT_APPROVED');const source=fs.readFileSync(path.join(__dirname,'../evidence/inactive-edge-preparation/CRM4-ready-inactive.js'));assert.equal(core.sha(source),p.scriptSha256);assert.equal(source.toString(),require('./inactive-edge.cjs').generate(p.preparationId));preparationId=p.preparationId;}
 const request=exchange(dir,{receiptDirectory,preparationId});
 return {ready:()=>request('ready'),create:async a=>(await request('create',{approval:a})).ownerUid,verifyRevocation:()=>request('revocation'),login:uid=>request('login',{uid}),
 async anonymousDenial(){const r=await fetch(core.ORIGIN,{redirect:'manual',signal:AbortSignal.timeout(15000)});assert([302,303,401,403].includes(r.status));await r.body?.cancel();},
 async close(){fs.writeFileSync(path.join(dir,'edge-stop.json'),JSON.stringify({at:new Date().toISOString(),state:'STOP',instruction:'Stop browser ceremony; do not retry. Coordinator containment governs created identities.'})+'\n',{flag:'wx'});}};
}
function respond(requestFile,observation){
 assert(/^edge-[a-f0-9-]{36}\.request\.json$/.test(path.basename(requestFile)));
 const bytes=fs.readFileSync(requestFile);assert(bytes.length<=8192);const req=JSON.parse(bytes);
 assert.equal(path.basename(requestFile),'edge-'+req.id+'.request.json');
 const accepted=validate(req,observation);
 fs.writeFileSync(requestFile.replace(/\.request\.json$/,'.result.json'),JSON.stringify(accepted)+'\n',{flag:'wx',mode:0o600});
}
module.exports={open,validate,snippet,exchange,respond};
