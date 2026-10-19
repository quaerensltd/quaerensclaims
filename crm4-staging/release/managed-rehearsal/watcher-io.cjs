'use strict';
const cp=require('child_process');
function timeout(){const e=Error('Bounded read failed');e.name='TimeoutError';return e;}
function cli(file,args,{env,shell=false}={}){return new Promise((resolve,reject)=>cp.execFile(file,args,{env,shell,encoding:'utf8',timeout:10000,maxBuffer:1048576,windowsHide:true},(err,out)=>{if(err)return reject(err.killed?timeout():Error('CLI_READ_FAILED'));resolve(out.trim());}));}
async function read(url,{token,project,body,timeoutMs=15000,fetchImpl=fetch}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{const r=await fetchImpl(url,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'x-goog-user-project':project,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:controller.signal});if(!r.ok){const e=Error('Cloud read failed');e.safeHttpStatus=r.status;throw e;}const result=await r.json();if(controller.signal.aborted)throw timeout();return result;}catch(e){if(controller.signal.aborted)throw timeout();throw e;}finally{clearTimeout(timer);}
}
// Read-only Auth REST selects no password hashes, salts or signing configuration.
function authReads(auth,read,project){
 const base='https://identitytoolkit.googleapis.com/v1/projects/'+project+'/accounts';
 const fields='users(localId,email,disabled,customAttributes,createdAt,validSince,emailVerified)';
 const map=u=>({uid:u.localId,email:u.email,disabled:u.disabled===true,emailVerified:u.emailVerified===true,customClaims:u.customAttributes?JSON.parse(u.customAttributes):{},metadata:{creationTime:new Date(Number(u.createdAt)).toUTCString()},tokensValidAfterTime:new Date(Number(u.validSince||0)*1000).toUTCString()});
 async function lookup(body){const r=await read(base+':lookup?fields='+fields,body);if(!r.users?.length){const e=Error('Account absent');e.code='auth/user-not-found';throw e;}if(r.users.length!==1)throw Error('Ambiguous account');return map(r.users[0]);}
 return new Proxy(auth,{get(t,k){if(k==='getUser')return uid=>lookup({localId:[uid]});if(k==='getUserByEmail')return email=>lookup({email:[email]});if(k==='listUsers')return async n=>{if(n!==1)throw Error('Inventory bound');const r=await read(base+':batchGet?maxResults=1&fields='+fields+',nextPageToken');return {users:(r.users||[]).map(map),pageToken:r.nextPageToken};};const v=t[k];return typeof v==='function'?v.bind(t):v;}});
}
function serial(fn){let active=false;return async(...args)=>{if(active){const e=Error('Overlapping read blocked');e.code='READ_OVERLAP';throw e;}active=true;try{return await fn(...args);}finally{active=false;}};}
function tokenCache(load,now=Date.now){let value,until=0,pending;return async()=>{if(value&&now()<until)return value;if(pending)return pending;value=undefined;pending=(async()=>{try{const v=await load();if(typeof v!=='string'||!v)throw Error('Token unavailable');value=v;until=now()+60000;return v;}finally{pending=undefined;}})();return pending;};}
module.exports={cli,read,authReads,serial,tokenCache};
