'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validateCloudRuntime}=require('./cloud-configuration.cjs');
function callSource(){return `async function callCloud(app,auth,name,data){
 if(!/^[A-Za-z0-9]+$/.test(name)||app.options.projectId!==config.projectId)throw Error('CRM4 callable boundary');
 if(typeof auth.authStateReady==="function")await auth.authStateReady();else await new Promise((resolve,reject)=>{const stop=auth.onAuthStateChanged(()=>{queueMicrotask(()=>stop());resolve();},reject);});if(!auth.currentUser)throw Object.assign(Error('Sign in required'),{code:'functions/unauthenticated'});
 const response=await fetch('/__crm4/call/'+name,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CRM4-ID-Token':await auth.currentUser.getIdToken()},body:JSON.stringify({data:data===undefined?null:data}),signal:AbortSignal.timeout(120000)});
 const result=await response.json();if(!response.ok||result.error)throw Object.assign(Error(result.error?.message||'CRM4 operation failed'),{code:'functions/'+String(result.error?.status||'internal').toLowerCase().replaceAll('_','-')});return {data:result.result};
}`;}
function moduleWrapper(version,service,config,web){
 const url='https://www.gstatic.com/firebasejs/'+version+'/firebase-'+service+'.js';
 const base='export * from '+JSON.stringify(url)+';\nimport * as sdk from '+JSON.stringify(url)+';\nconst config='+JSON.stringify(config)+';\nif(location.origin!==config.origin)throw Error("CRM4 origin mismatch");\n';
 if(service==='app')return base+'export function initializeApp(){const old=sdk.getApps().find(a=>a.name==="crm4-spain-client");if(old&&old.options.projectId!==config.projectId)throw Error("CRM4 project mismatch");return old||sdk.initializeApp('+JSON.stringify(web)+',"crm4-spain-client");}\n';
 if(service==='functions')return base+'import {getAuth} from "./auth.js";\n'+callSource()+'\nexport function getFunctions(app){if(app.options.projectId!==config.projectId)throw Error("CRM4 project mismatch");return {app};}\nexport function httpsCallable(functions,name){return data=>callCloud(functions.app,getAuth(functions.app),name,data);}\n';
 const name={auth:'Auth',firestore:'Firestore',storage:'Storage'}[service];if(!name)throw Error('Unknown SDK module');
 return base+'export function get'+name+'(app,...args){if(app.options.projectId!==config.projectId)throw Error("CRM4 project mismatch");return sdk.get'+name+'(app,...args);}\n';
}
function compatWrapper(config,web){return '(()=>{const config='+JSON.stringify(config)+';if(location.origin!==config.origin||firebase.apps.length)throw Error("CRM4 compat boundary");const init=firebase.initializeApp.bind(firebase);'+callSource()+'firebase.initializeApp=()=>{const app=init('+JSON.stringify(web)+');const functions=()=>({httpsCallable:name=>data=>callCloud(app,app.auth(),name,data)});app.functions=functions;firebase.functions=functions;return app;};})();\n';}
function buildWeb(configuration,out){
 const config=validateCloudRuntime(configuration),web=config.firebaseWeb&&Object.fromEntries(["apiKey","authDomain","projectId","storageBucket","messagingSenderId","appId"].filter(k=>config.firebaseWeb[k]!==undefined).map(k=>[k,config.firebaseWeb[k]]));
 if(!web||web.projectId!==config.projectId||web.storageBucket!==config.bucket||web.authDomain!==config.authDomain||typeof web.apiKey!=='string'||typeof web.appId!=='string')throw Error('Independent Firebase web configuration required');
 // Serialize only public SDK configuration, never IAP tester lists or deployment flags.
 const publicConfig={projectId:config.projectId,origin:config.origin};
 const root=path.resolve(__dirname,'..'),source=path.join(root,'local-public'),manifest=JSON.parse(fs.readFileSync(path.join(root,'clone-manifest.json'))),files=[];
 fs.mkdirSync(out,{recursive:true});
 const write=(name,bytes)=>{if(name.includes('..')||path.isAbsolute(name)||name.includes('\\'))throw Error('Invalid asset path');const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);files.push(name);};
 for(const row of manifest.records){
  if(manifest.blocked.some(x=>x.path===row.target))continue;
  let bytes=fs.readFileSync(path.join(source,row.target));if(crypto.createHash('sha1').update(bytes).digest('hex')!==row.cloneSha1)throw Error('Clone drift: '+row.target);
  if(/\.(html|js|mjs|css)$/.test(row.target)){
   let text=bytes.toString('utf8').replaceAll('http://127.0.0.1:5001/demo-quaerens-crm4/us-central1/','/__crm4/disabled/').replaceAll('demo-quaerens-crm4',config.projectId);
   if(text.includes('127.0.0.1:')||text.includes('connectAuthEmulator(')||text.includes('useEmulator('))throw Error('Unexpected emulator code: '+row.target);
   bytes=Buffer.from(text);
  }
  write(row.target,bytes);
 }
 for(const key of manifest.modules){const [version,service]=key.split('/');write('__crm4/sdk/'+key+'.js',moduleWrapper(version,service,publicConfig,web));}
 write('__crm4/compat.js',compatWrapper(publicConfig,web));
 const csp="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com; frame-src 'self' blob:; form-action 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
 const result={projectId:config.projectId,origin:config.origin,files:files.sort(),csp};fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(result,null,2)+'\n');return result;
}
module.exports={buildWeb,moduleWrapper,compatWrapper};
