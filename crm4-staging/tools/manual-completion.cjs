'use strict';
// CRM4 demo-only linkage adapter. No issue, AI, migration or provider calls.
const {createHash}=require('node:crypto');
const hash=value=>createHash('sha256').update(value).digest('hex');
function manualCompletion(deps,{checkpoint=async()=>{}}={}){
 const db=deps.db,fail=(code,message)=>{throw new deps.HttpsError(code,message);};
 return async request=>{
  require('./runtime-boundary.cjs').assertRuntime(deps, false);
  if(!request.auth?.uid)fail('unauthenticated','Authentication required');
  const d=request.data||{},uid=request.auth.uid;
  if(![d.id,d.leadId,d.versionId].every(v=>typeof v==='string'&&/^[\w-]+$/.test(v))||!Number.isInteger(d.revision)||typeof d.qarReference!=='string')fail('invalid-argument','Exact assessment, lead, QAR, revision and version required');
  return db.runTransaction(async tx=>{
   const ref=(c,id)=>db.collection(c).doc(id),read=async(c,id)=>(await tx.get(ref(c,id))).data();
   const member=await read('crm4Memberships',uid),profile=await read('users',uid);
   if(member?.workspaceId!=='CRM4'||member.active!==true||!['manager','administrator'].includes(member.role))fail('permission-denied','Active CRM4 Manager/Administrator required');
   const a=await read('professionalAssessments',d.id),l=await read('crm4Leads',d.leadId);
   if(!a||a.assessmentSource!=='FRAMEWORK_B'||a.generationContractVersion||a.structuredIntake?.crm4ManualAuthoringVersion!==1)fail('failed-precondition','Governed CRM4 manual assessment required');
   const privileged=request.auth.token?.platformAdmin===true;
   if(!privileged&&(!profile?.assessmentCapabilities?.some(c=>['assessmentIssuer','assessmentAdministrator'].includes(c))||!profile.assessmentCategoryAccess?.some(c=>[a.category,'*'].includes(c))||!profile.assessmentWorkspaceAccess?.some(c=>['CRM4','*'].includes(c))))fail('permission-denied','Issuer capability and category/workspace access required');
   if(l?.workspaceId!=='CRM4'||l.assessmentId!==d.id||l.assessmentQar!==a.qarReference||a.crmLink?.workspaceId!=='CRM4'||a.crmLink.sourceCollection!=='crm4Leads'||a.crmLink.caseRef!==d.leadId||a.crmLink.clientRef!==d.leadId||(a.crmLink.crm4LeadId&&a.crmLink.crm4LeadId!==d.leadId)||d.qarReference!==a.qarReference)fail('failed-precondition','Assessment/lead/QAR linkage mismatch');
   if(a.revision!==d.revision||a.currentVersionId!==d.versionId)fail('aborted','Stale assessment revision/version');
   if(a.status!=='ISSUED')fail('failed-precondition','Current manual assessment must be issued');
   const v=await read('professionalAssessmentVersions',d.versionId);
   if(!v||v.immutable!==true||v.status!=='ISSUED'||v.assessmentId!==d.id||v.qarReference!==a.qarReference||v.version!==a.currentVersion||hash(JSON.stringify(v.projection))!==v.projectionHash||v.projectionHash!==a.approvedContentHash)fail('failed-precondition','Immutable issued version integrity mismatch');
   const docs=await tx.get(db.collection('professionalAssessmentDocuments').where('versionId','==',d.versionId));
   if(docs.size!==1)fail('failed-precondition','One canonical document required');
   const doc=docs.docs[0].data(),documentId=docs.docs[0].id;
   if(doc.assessmentId!==d.id||doc.qarReference!==a.qarReference||doc.version!==a.currentVersion)fail('failed-precondition','Document identity mismatch');
   const deliveryId=d.id+'_'+d.versionId,delivery=await read('professionalAssessmentDeliveries',deliveryId);
   if(!delivery||delivery.status!=='COMPLETE'||delivery.assessmentId!==d.id||delivery.versionId!==d.versionId||delivery.qarReference!==a.qarReference||delivery.documentId!==documentId||delivery.pdfHash!==doc.pdfHash||delivery.client?.status!=='SENT'||delivery.archive?.status!=='SENT')fail('failed-precondition','Current version issuance incomplete');
   for(const type of ['client','archive']){
    const key=`assessment-${d.id}-${v.version}-${type}-${doc.pdfHash}`,capture=await read('crm4ManualIssueCaptures',hash(key));
    const recipient=type==='client'?(a.crmLink.snapshot.email||a.crmLink.snapshot.clientEmail):'archive@example.test';
    if(!capture||capture.capturedOnly!==true||capture.delivered!==false||capture.idempotencyKey!==key||capture.recipient!==recipient||delivery[type].providerMessageId!=='crm4-issue-capture-'+hash(key))fail('failed-precondition','Synthetic issuance capture mismatch');
   }
   for(const kind of ['pdf','docx']){
    const path=doc[kind+'Path'],expected=doc[kind+'Hash'];
    if(typeof path!=='string'||!path.startsWith(`professional-assessments/${d.id}/versions/`)||path.includes('..')||!/^[a-f0-9]{64}$/.test(expected||''))fail('failed-precondition','Canonical artifact reference required');
    const [bytes]=await deps.admin.storage().bucket().file(path).download();
    if(hash(bytes)!==expected)fail('data-loss','Stored document hash mismatch');
   }
   const eventId='manual-completion-'+hash(d.id+':'+d.versionId),auditRef=ref('professionalAssessmentAudit',eventId),prior=(await tx.get(auditRef)).data();
   if(prior){
    if(prior.assessmentId!==d.id||prior.versionId!==d.versionId||l.assessmentSource!=='FRAMEWORK_B'||l.assessmentStatus!=='COMPLETED'||l.assessmentVersionId!==d.versionId)fail('failed-precondition','Completion replay state conflict');
    return {status:'COMPLETED',idempotent:true,assessmentId:d.id,versionId:d.versionId};
   }
   if(l.assessmentSource&&l.assessmentSource!=='FRAMEWORK_B')fail('failed-precondition','Conflicting lead assessment source');
   const fv=deps.admin.firestore.FieldValue;
   await checkpoint('BEFORE_COMMIT');
   tx.update(ref('crm4Leads',d.leadId),{assessmentStatus:'COMPLETED',assessmentSource:'FRAMEWORK_B',assessmentQar:a.qarReference,assessmentVersionId:d.versionId,assessmentReportStatus:'ISSUED',assessmentReportDeliveryStatus:'COMPLETE',assessmentCompletionMethod:'CRM4_MANUAL_CAPTURE_ONLY',assessmentCompletedAt:fv.serverTimestamp(),lastUpdatedAt:fv.serverTimestamp(),actionHistory:fv.arrayUnion({action:'professional_assessment_completed',eventId,byUid:uid,at:new Date().toISOString(),assessmentId:d.id,versionId:d.versionId,captureOnly:true})});
   tx.create(auditRef,{event:'CRM4_MANUAL_COMPLETION_LINKED',assessmentId:d.id,versionId:d.versionId,qarReference:a.qarReference,leadId:d.leadId,actorUid:uid,actorRole:member.role,projectionHash:v.projectionHash,pdfHash:doc.pdfHash,docxHash:doc.docxHash,deliveryId,captureOnly:true,createdAt:fv.serverTimestamp()});
   return {status:'COMPLETED',idempotent:false,assessmentId:d.id,versionId:d.versionId};
  });
 };
}
module.exports={manualCompletion};
