'use strict';
const c=require('./core.cjs');
function binding(){return {version:1,project:c.P,projectNumber:c.N,runId:'synthetic-test-run',actorUid:'staff',ownerUid:'staff',leadId:'AutoCreatedLead01',caseId:'crm4-AutoCreatedLead01',clientEmail:'portal-client@crm4.example.test',requestPath:'crm4ManualReferralRequests/staff_'+'a'.repeat(32),requestHash:'a'.repeat(32),startedAt:'2026-10-16T10:00:00.000Z',createdAt:'2026-10-16T10:00:01.000Z',finishedAt:'2026-10-16T10:00:02.000Z',leadCreateTime:'2026-10-16T10:00:01.000Z',leadUpdateTime:'2026-10-16T10:00:01.000Z',requestCreateTime:'2026-10-16T10:00:01.000Z',auditAction:'manual_referral_lead_created',auditActorUid:'staff'};}
module.exports={binding};
