'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {planLegacyManual}=require('../tools/manual-legacy-plan.cjs');
const fixture=()=>({sourceId:'legacy-synthetic',leadId:'lead-synthetic',record:{workspaceId:'CRM4',caseId:'lead-synthetic',status:'draft',assessmentRoute:'spray-foam',createdBy:'synthetic-author',issueSummary:'Reported only'},lead:{workspaceId:'CRM4'}});
test('legacy preflight is deterministic, non-executable and preserves original data',()=>{
 const input=fixture(),before=JSON.stringify(input),a=planLegacyManual(input);
 assert.equal(a.status,'REQUIRES_EXPLICIT_MIGRATION_APPROVAL');assert.equal(a.executable,false);assert.equal(a.targetId,null);assert.equal(a.qarReference,null);
 assert.deepEqual(a,planLegacyManual(input));assert.equal(JSON.stringify(input),before);
 input.record.issueSummary='Changed';assert.notEqual(planLegacyManual(input).sourceDigest,a.sourceDigest);
});
test('legacy preflight refuses conflicting identity, unsupported category and governed records',()=>{
 for(const mutate of [x=>x.record.workspaceId='CRM2',x=>x.record.caseId='other',x=>x.lead.assessmentId='existing',x=>x.record.qarReference='QAR-existing',x=>x.record.assessmentRoute='solar',x=>x.record.status='issued',x=>delete x.record.createdBy]){
  const x=fixture();mutate(x);const p=planLegacyManual(x);assert.equal(p.status,'BLOCKED');assert(p.reasons.length);assert.equal(p.executable,false);
 }
});
