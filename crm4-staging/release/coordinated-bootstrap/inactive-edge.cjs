"use strict";
// Preparation only: no network, timers or cloud SDK initialisation on import.
const assert=require('assert/strict'),{snippet}=require('./browser.cjs'),core=require('../managed-rehearsal/core.cjs');
function checkTicket(q,preparationId,now=Date.now()){
 const fail=()=>{throw Error('ACTIVATION_REJECTED');};
 if(!q||typeof q!=='object'||Array.isArray(q))fail();
 const extra=q.phase==='create'?['approval']:q.phase==='login'?['uid']:[];
 const keys=['preparationId','id','phase','deadline',...extra].sort();
 if(JSON.stringify(Object.keys(q).sort())!==JSON.stringify(keys))fail();
 const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
 if(q.preparationId!==preparationId||!uuid.test(q.id)||!['ready','create','revocation','login'].includes(q.phase))fail();
 if(!Number.isSafeInteger(q.deadline)||q.deadline<=now||q.deadline>now+180000||q.deadline>Date.parse('2026-10-24T09:00:00Z'))fail();
 const uid=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(x);
 if(q.phase==='login'&&!uid(q.uid))fail();
 if(q.phase==='create'){
  const a=q.approval;
  if(!a||JSON.stringify(Object.keys(a).sort())!==JSON.stringify(['executionApproved','project','bootstrapUid','ownerApprovalReference','endUtc'].sort()))fail();
  if(a.executionApproved!==true||a.project!=='quaerens-crm4-spain-test'||!uid(a.bootstrapUid)||typeof a.ownerApprovalReference!=='string'||a.ownerApprovalReference.length<6||a.ownerApprovalReference.length>512)fail();
  const end=Date.parse(a.endUtc);if(!Number.isFinite(end)||end<q.deadline||end>now+600000||end>Date.parse('2026-10-24T09:00:00Z'))fail();
 }
 return q;
}
function generate(preparationId){
 assert(/^[a-f0-9-]{36}$/.test(preparationId));
 // Embed the reviewed phase bodies verbatim; runtime accepts JSON data, never JavaScript.
 const handlers=['ready','create','revocation','login'].map(phase=>{
  const q={id:'00000000-0000-0000-0000-000000000000',phase,deadline:0};
  const source=snippet(q),prefix='(()=>{const r='+JSON.stringify(q)+';';
  assert(source.startsWith(prefix)&&source.endsWith('})()'));
  return JSON.stringify(phase)+':(r)=>{'+source.slice(prefix.length,-4)+'}';
 }).join(',\n');
 return `(()=>{'use strict';const preparationId=${JSON.stringify(preparationId)};
 if(location.origin!==${JSON.stringify(core.ORIGIN)})throw Error('WRONG_ORIGIN');
 if(Date.now()>=Date.parse('2026-10-24T09:00:00Z'))throw Error('TEST_EXPIRED');
 if(document.getElementById('crm4-inactive-handoff'))throw Error('ALREADY_LOADED');
 const checkTicket=${checkTicket.toString()};const handlers={${handlers}};
 const box=document.createElement('section');box.id='crm4-inactive-handoff';
 const status=document.createElement('p');status.id='crm4-activation-status';status.textContent='INACTIVE â€” waiting for separately approved activation file. No timer or account action started.';
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','CRM4 activation file');box.append(status,input);document.body.prepend(box);
 const used=new Set();let busy=false,stopped=false;
 input.onchange=async()=>{if(stopped||busy)return;busy=true;input.disabled=true;try{if(location.origin!==${JSON.stringify(core.ORIGIN)})throw Error();const file=input.files?.[0];if(!file||file.size>8192)throw Error();const q=checkTicket(JSON.parse(await file.text()),preparationId);if(file.name!=='edge-'+q.id+'.activation.json'||used.has(q.id))throw Error();used.add(q.id);status.textContent='ACTIVE: '+q.phase+' â€” deadline '+new Date(q.deadline).toISOString();handlers[q.phase](q);}catch{stopped=true;status.textContent='STOP: activation rejected. No retry in this loaded helper.';}finally{input.value='';busy=false;input.disabled=stopped;}};
})()`;
}
module.exports={generate,checkTicket};
