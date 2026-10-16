'use strict';
// Explicit resource inventory only: no list-and-delete or prefix-derived eligibility.
const {check,P}=require('./core.cjs'),r=require('./fixture-receipts.cjs');
const collections=new Set(['crm4Leads','clientPortalCases','clientPortalAccess','clientPortalDocuments','clientPortalRequirements','clientPortalMessages','processingCases','professionalAssessments','professionalAssessmentVersions','professionalAssessmentDocuments']);
function documentReceipt(binding,snapshot,creationReceipt){
 r.validate(binding);const parts=snapshot.path?.split('/');check(parts?.length===2&&collections.has(parts[0])&&r.id(parts[1]));
 check(creationReceipt?.path===snapshot.path&&creationReceipt.createdByThisRun===true&&creationReceipt.bindingHash===r.hash(binding)&&creationReceipt.createTime===snapshot.createTime);
 check(Date.parse(snapshot.createTime)>=Date.parse(binding.startedAt)&&Number.isFinite(Date.parse(snapshot.updateTime)));
 const d=snapshot.data;const related=snapshot.path==='crm4Leads/'+binding.leadId||d.caseId===binding.caseId||d.leadId===binding.leadId||d.crm4LeadId===binding.leadId||d.crmLink?.caseRef===binding.leadId;
 check(related&&(!d.workspaceId||d.workspaceId==='CRM4')&&(!d.crmLink?.workspaceId||d.crmLink.workspaceId==='CRM4'));
 return {project:P,runId:binding.runId,bindingHash:r.hash(binding),createdByThisRun:true,kind:'document',path:snapshot.path,updateTime:snapshot.updateTime,createTime:snapshot.createTime,creationEvidence:r.hash(creationReceipt)};
}
function objectReceipt(binding,metadata,uploadReceipt){
 r.validate(binding);check(metadata.bucket===P+'.firebasestorage.app'&&metadata.name?.startsWith('clientPortal/'+binding.caseId+'/')&&!metadata.name.includes('..')&&/^\d+$/.test(metadata.generation));
 check(uploadReceipt?.bindingHash===r.hash(binding)&&uploadReceipt.name===metadata.name&&uploadReceipt.generation===metadata.generation&&uploadReceipt.createdByThisRun===true&&Date.parse(metadata.timeCreated)>=Date.parse(binding.startedAt));
 return {project:P,runId:binding.runId,bindingHash:r.hash(binding),createdByThisRun:true,kind:'object',bucket:metadata.bucket,name:metadata.name,generation:metadata.generation,creationEvidence:r.hash(uploadReceipt)};
}
module.exports={documentReceipt,objectReceipt,collections};
