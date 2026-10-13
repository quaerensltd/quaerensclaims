'use strict';
// CRM4 compatibility endpoint, NOT a claim that these are independently pinned
// deployed callables. Reuses the authoring exports in the preserved Approve bundle.
function manualAuthoring(deps) {
 const db=deps.db, fail=(code,message)=>{throw new deps.HttpsError(code,message);};
 const factory=require('../backend-sources/frameworkBAssessmentApprove/frameworkB.js').registerFrameworkB;
 const actions={create:'Create',get:'Get',save:'SaveDraft',submit:'SubmitReview',correct:'StartSupersedingRevision'};
 return async request=>{
  require('./runtime-boundary.cjs').assertRuntime(deps, false);
  if(!request.auth?.uid)fail('unauthenticated','Authentication required');
  const data=request.data||{}, action=data.action;
  if(action==='complete')return require('./manual-completion.cjs').manualCompletion(deps)(request);
  if(!actions[action])fail('invalid-argument','Unsupported manual action');
  return db.runTransaction(async tx=>{
   const uid=request.auth.uid, member=(await tx.get(db.collection('crm4Memberships').doc(uid))).data();
   if(member?.workspaceId!=='CRM4'||member.active!==true)fail('permission-denied','Active CRM4 membership required');
   const writes=[], pending=new Map(), raw=r=>r._raw||r;
   const allowed=new Set(['professionalAssessments','professionalAssessmentQarRegistry','professionalAssessmentAudit','crm4Leads']);
   const read=async ref=>{
    ref=raw(ref);
    if(pending.has(ref.path))return {id:ref.id,exists:true,data:()=>pending.get(ref.path)};
    return tx.get(ref);
   };
   const write=(method,ref,value,options)=>{
    ref=raw(ref);if(!allowed.has(ref.parent.id))throw Error('Unreviewed authoring write');
    writes.push([method,ref,value,...(options?[options]:[])]);
    pending.set(ref.path,method==='update'?{...(pending.get(ref.path)||{}),...value}:value);
   };
   const document=ref=>({_raw:ref,id:ref.id,path:ref.path,get:()=>read(ref),create:async v=>write('create',ref,v),set:async(v,o)=>write('set',ref,v,o),update:async v=>write('update',ref,v)});
   const collection=(name,q=db.collection(name))=>({_raw:q,doc:id=>document(id?db.collection(name).doc(id):db.collection(name).doc()),where:(...a)=>collection(name,q.where(...a)),limit:n=>collection(name,q.limit(n)),get:()=>read(q),add:async v=>{const r=document(db.collection(name).doc());await r.create(v);return r;}});
   const view={collection,runTransaction:async fn=>fn({get:read,create:(r,v)=>write('create',r,v),update:(r,v)=>write('update',r,v),set:(r,v,o)=>write('set',r,v,o)})};
   let a, leadId=data.leadId;
   if(action!=='create') {
    if(!/^[\w-]+$/.test(data.id||''))fail('invalid-argument','Assessment identity required');
    a=(await tx.get(db.collection('professionalAssessments').doc(data.id))).data();
    if(!a||a.assessmentSource!=='FRAMEWORK_B'||a.generationContractVersion||a.crmLink?.workspaceId!=='CRM4'||a.crmLink.sourceCollection!=='crm4Leads'||a.crmLink.clientRef!==a.crmLink.caseRef)fail('failed-precondition','Governed manual CRM4 record required; no legacy migration');
    if(a.structuredIntake?.crm4ManualAuthoringVersion!==1)fail('failed-precondition','Existing records require an explicit migration contract');
    if(leadId&&leadId!==a.crmLink.caseRef)fail('permission-denied','Conflicting lead');
    leadId=a.crmLink.caseRef;
    if(action!=='get'&&data.revision!==a.revision)fail('aborted','Assessment revision changed. Reload before saving.');
    if(action==='correct'){
     const v=(await tx.get(db.collection('professionalAssessmentVersions').doc(a.currentVersionId))).data();
     const hash=require('node:crypto').createHash('sha256').update(JSON.stringify(v?.projection||{})).digest('hex');
     if(!v||v.assessmentId!==data.id||v.qarReference!==a.qarReference||v.version!==a.currentVersion||v.projectionHash!==hash||a.approvedContentHash!==hash)fail('failed-precondition','Issued version integrity mismatch');
    }
   }
   if(!/^[\w-]+$/.test(leadId||''))fail('invalid-argument','Lead required');
   const leadRef=db.collection('crm4Leads').doc(leadId),lead=(await tx.get(leadRef)).data();
   if(lead?.workspaceId!=='CRM4')fail('permission-denied','CRM4 lead required');
   if(a&&(lead.assessmentId!==data.id||lead.assessmentQar!==a.qarReference))fail('failed-precondition','Lead/assessment/QAR mismatch');
   if(action==='create'&&lead.assessmentId)fail('already-exists','Lead already has an assessment; reopen it explicitly');
   const category=a?.category||data.category;
   const profile=(await tx.get(db.collection('users').doc(uid))).data()||{};
   if(!request.auth.token?.platformAdmin&&(![category,'*'].some(v=>profile.assessmentCategoryAccess?.includes(v))||!['CRM4','*'].some(v=>profile.assessmentWorkspaceAccess?.includes(v))))fail('permission-denied','Category/workspace authority required');
   const f= data.form||{};
   const fields=['clientName','reference','propertyAddress','provider','saleDate','financeRoute','issueSummary','financialPosition','evidenceAvailable','evidenceGaps'];
   if(['save','create'].includes(action)&&fields.some(k=>f[k]!==undefined&&(typeof f[k]!=='string'||f[k].length>10000)))fail('invalid-argument','Invalid authoring text');
   const form=Object.fromEntries(fields.map(k=>[k,f[k]||'']));
   form.flags=Array.isArray(f.flags)?f.flags.filter(v=>typeof v==='string').slice(0,10):[];
   const mapped={structuredIntake:{crm4ManualAuthoringVersion:1,manualForm:form},chronology:form.saleDate?[{date:form.saleDate,description:'Client-reported sale/installation date',source:'CLIENT REPORTED'}]:[],evidence:form.evidenceAvailable?[{description:form.evidenceAvailable,state:'CLIENT REPORTED',source:'Author input; not document verified'}]:[],financialExposure:[],findings:[],evidenceReadiness:{explanation:form.evidenceGaps||'Evidence verification outstanding'},clientContent:{executiveSummary:form.issueSummary,background:[form.provider,form.propertyAddress,form.financeRoute].filter(Boolean).join('\n'),preliminaryAssessment:form.financialPosition,limitations:form.evidenceGaps},restricted:a?.restricted||{}};
   const handlers=factory({...deps,db:view});
   let result;
   if(action==='create') {
    result=await handlers.frameworkBAssessmentCreate({...request,data:{category,crmLink:{workspaceId:'CRM4',sourceCollection:'crm4Leads',caseRef:leadId,clientRef:leadId},structuredIntake:mapped.structuredIntake}});
    const saved=await handlers.frameworkBAssessmentSaveDraft({...request,data:{id:result.id,revision:1,...mapped}});
    result={...result,...saved};write('update',leadRef,{assessmentId:result.id,assessmentQar:result.qarReference});
   }else{
    if(action==='save'&&a.status!=='DRAFT')fail('failed-precondition','Return to draft before editing');
    result=await handlers['frameworkBAssessment'+actions[action]]({...request,data:{id:data.id,revision:data.revision,...(action==='save'?mapped:{})}});
   }
   for(const [method,...args]of writes)tx[method](...args);
   return result;
  });
 };
}
module.exports={manualAuthoring};
