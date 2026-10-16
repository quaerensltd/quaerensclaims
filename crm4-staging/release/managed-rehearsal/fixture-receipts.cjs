'use strict';
// Operator evidence only. Hashes bind reviewed receipts; they are not authentication.
const {createHash}=require('node:crypto'),{P,N,check}=require('./core.cjs');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(x);
const iso=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
function validate(b,{project=P,projectNumber=N}={}){
 check(b?.version===1&&b.project===project&&b.projectNumber===projectNumber&&id(b.runId)&&id(b.actorUid)&&id(b.leadId)&&b.caseId==='crm4-'+b.leadId);
 check(b.clientEmail==='portal-client@crm4.example.test'&&iso(b.startedAt)&&iso(b.createdAt)&&iso(b.finishedAt)&&Date.parse(b.startedAt)<=Date.parse(b.createdAt)&&Date.parse(b.createdAt)<=Date.parse(b.finishedAt));
 check(b.ownerUid===b.actorUid&&b.requestPath==='crm4ManualReferralRequests/'+b.actorUid+'_'+b.requestHash&&/^[a-f0-9]{32}$/.test(b.requestHash)&&b.auditAction==='manual_referral_lead_created'&&b.auditActorUid===b.actorUid);
 check(iso(b.leadCreateTime)&&iso(b.leadUpdateTime)&&iso(b.requestCreateTime)&&b.caseId.length<=128);return b;
}
function bindLead({project,projectNumber,runId,actorUid,requestId,response,lead,request,startedAt,finishedAt}){
 const requestHash=createHash('sha256').update(requestId).digest('hex').slice(0,32),d=lead.data,q=request.data;
 check(response?.status==='CREATED'&&response.outcome==='NEW_LEAD_CREATED'&&response.idempotent===false&&response.leadId===lead.id);
 check(lead.path==='crm4Leads/'+lead.id&&request.path==='crm4ManualReferralRequests/'+actorUid+'_'+requestHash&&q.outcome==='NEW_LEAD_CREATED'&&q.leadId===lead.id&&q.ownerUid===actorUid);
 check(d.workspaceId==='CRM4'&&d.sourceWorkspace==='CRM4'&&d.createdBy===actorUid&&d.assignedUserId===actorUid&&d.assignedToUid===actorUid&&d.emailNormalized==='portal-client@crm4.example.test');
 const p=d.referralProvenance;check(p?.mechanism==='lister_manual_referral'&&p.createdByUid===actorUid);
 const audits=(d.actionHistory||[]).filter(a=>a.action==='manual_referral_lead_created'&&a.byUid===actorUid&&a.at===p.createdAt);check(audits.length===1);
 const b={version:1,project,projectNumber,runId,actorUid,ownerUid:q.ownerUid,leadId:lead.id,caseId:'crm4-'+lead.id,clientEmail:d.emailNormalized,requestPath:request.path,requestHash,startedAt,createdAt:p.createdAt,finishedAt,leadCreateTime:lead.createTime,leadUpdateTime:lead.updateTime,requestCreateTime:request.createTime,auditAction:audits[0].action,auditActorUid:audits[0].byUid};
 validate(b,{project,projectNumber});check(Date.parse(b.leadCreateTime)>=Date.parse(startedAt)&&Date.parse(b.requestCreateTime)>=Date.parse(startedAt)&&Date.parse(b.leadCreateTime)<=Date.parse(finishedAt)&&Date.parse(b.requestCreateTime)<=Date.parse(finishedAt));return b;
}
function approved(approval,b){validate(b);check(approval?.fixtureBindingHash===hash(b)&&approval.fixtureRunId===b.runId);return b;}
function bindPortal(b,{user,portal,access,membershipExists,audits,actorUid}){
 validate(b,{project:b.project,projectNumber:b.projectNumber});check(id(user.uid)&&user.email===b.clientEmail&&user.emailVerified===true&&!user.disabled&&!user.customClaims?.platformAdmin&&!membershipExists);
 check(portal.id===b.caseId&&portal.data.clientUid===user.uid&&portal.data.accessState==='ACTIVE'&&portal.data.crm4LeadId===b.leadId&&portal.data.crmLink?.workspaceId==='CRM4'&&portal.data.crmLink?.collection==='crm4Leads'&&portal.data.crmLink?.caseId===b.leadId);
 check(access.path==='clientPortalAccess/'+user.uid+'_'+b.caseId&&access.data.active===true&&access.data.uid===user.uid&&access.data.caseId===b.caseId);
 check(iso(portal.createTime)&&Date.parse(portal.createTime)>=Date.parse(b.startedAt)&&iso(portal.updateTime));
 const activation=audits.filter(x=>x.data.caseId===b.caseId&&x.data.actorUid===actorUid&&(x.data.action||x.data.event)==='CLIENT_PORTAL_ACTIVATED');check(activation.length===1);
 return {bindingHash:hash(b),clientUid:user.uid,caseId:b.caseId,portalCreateTime:portal.createTime,portalUpdateTime:portal.updateTime,activationAuditPath:activation[0].path,activationActorUid:actorUid};
}
module.exports={hash,id,validate,bindLead,approved,bindPortal};
