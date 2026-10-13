'use strict';
// Capture-only issuance: run the original issuer with buffered transactional
// writes. Synthetic receipt acceptance, delivery, immutable-version status,
// assessment status and audit commit together or not at all.
function manualIssueRecovery(deps, factory, options={}) {
 const db=deps.db, checkpoint=options.checkpoint|| (async()=>{});
 if(process.env.GCLOUD_PROJECT!=='demo-quaerens-crm4'||process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080')throw Error('CRM4 demo only');
 return request=>db.runTransaction(async tx=>{
  const writes=[],raw=ref=>ref._raw||ref;
  const allowed=new Set(['professionalAssessments','professionalAssessmentVersions','professionalAssessmentDeliveries','professionalAssessmentAudit','crm4ManualIssueCaptures']);
  const write=(method,ref,...args)=>{ref=raw(ref);if(!allowed.has(ref.parent.id))throw Error('Unreviewed issuance write: '+ref.parent.id);writes.push([method,ref,...args]);};
  const document=ref=>({_raw:ref,id:ref.id,path:ref.path,get:()=>tx.get(ref),set:async(...a)=>write('set',ref,...a),create:async(...a)=>write('create',ref,...a),update:async(...a)=>write('update',ref,...a)});
  const collection=(name,q=db.collection(name))=>({doc:id=>document(id?db.collection(name).doc(id):db.collection(name).doc()),add:async value=>{const ref=document(db.collection(name).doc());write('create',ref,value);return ref;},where:(...a)=>collection(name,q.where(...a)),limit:n=>collection(name,q.limit(n)),get:()=>tx.get(q)});
  const view={collection};
  const resend={emails:{send:async(payload,options)=>{
   if(!/^[^@\s]+@(?:crm4\.)?example\.test$/.test(payload.to))throw Error('Synthetic issuance recipient required');
   if(!options?.idempotencyKey)throw Error('Original issuance key required');
   const key=require('node:crypto').createHash('sha256').update(options.idempotencyKey).digest('hex');
   const ref=db.collection('crm4ManualIssueCaptures').doc(key);
   if(!(await tx.get(ref)).exists)write('create',ref,{recipient:payload.to,subject:payload.subject,delivered:false,capturedOnly:true,idempotencyKey:options.idempotencyKey});
   await checkpoint('CAPTURE_STAGED');
   return {data:{id:'crm4-issue-capture-'+key}};
  }}};
  const original=factory({...deps,db:view,resend}).frameworkBAssessmentIssue;
  const result=await require('./manual-assessment-boundary.cjs').manualBoundary(view,deps,'frameworkBAssessmentIssue',original)(request);
  if(result.status!=='ISSUED')throw new deps.HttpsError('unavailable','Synthetic issuance incomplete; no state committed, retry permitted');
  await checkpoint('BEFORE_COMMIT');
  for(const [method,...args]of writes)tx[method](...args);
  return result;
 });
}
module.exports={manualIssueRecovery};
