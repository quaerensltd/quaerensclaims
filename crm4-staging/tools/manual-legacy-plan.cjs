'use strict';
// Pure, read-only preflight. No SDK, database, network, migration or allocation.
const crypto=require('node:crypto');
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
function planLegacyManual({sourceId,record,leadId,lead}){
 const reasons=[];
 if(!/^[\w-]+$/.test(sourceId||'')||!/^[\w-]+$/.test(leadId||''))reasons.push('INVALID_IDENTITY');
 if(record?.workspaceId!=='CRM4'||lead?.workspaceId!=='CRM4')reasons.push('WRONG_WORKSPACE');
 if(record?.caseId!==leadId)reasons.push('CONFLICTING_LEAD');
 if(!['draft','ready-for-review'].includes(record?.status))reasons.push('NOT_LEGACY_DRAFT');
 if(record?.assessmentRoute!=='spray-foam')reasons.push('CATEGORY_CREATE_CONTRACT_UNAVAILABLE');
 if(!record?.createdBy)reasons.push('AUTHOR_PROVENANCE_MISSING');
 if(lead?.assessmentId||lead?.assessmentQar)reasons.push('LEAD_ALREADY_LINKED');
 if(record?.qarReference||record?.currentVersionId||record?.generationContractVersion||record?.assessmentSource)reasons.push('GOVERNED_IDENTITY_REQUIRES_SEPARATE_REVIEW');
 const snapshot={sourceCollection:'crm4Assessments',sourceId,record,leadId,lead};
 return {mode:'READ_ONLY_PLAN',executable:false,status:reasons.length?'BLOCKED':'REQUIRES_EXPLICIT_MIGRATION_APPROVAL',reasons,
  sourceDigest:crypto.createHash('sha256').update(JSON.stringify(canonical(snapshot))).digest('hex'),
  sourceId,leadId,targetCollection:'professionalAssessments',targetId:null,qarReference:null,
  requiredSteps:['Review original source and author provenance','Revalidate digest, permissions and unlinked lead in a transaction','Preserve immutable legacy snapshot and audit cross-reference','Allocate a new governed identity explicitly; do not overwrite legacy identity','Import as unverified DRAFT only; independent review remains required']};
}
module.exports={planLegacyManual};
