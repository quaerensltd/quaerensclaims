'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { validateLink, workspaceBoundary } = require('../tools/linkage-boundary.cjs');
const fixture = () => ({ lead: {workspaceId:'CRM4',assessmentId:'a',assessmentQar:'QAR-TEST',assessmentStatus:'COMPLETED'}, assessment: {status:'GENERATED',currentVersion:1,qarReference:'QAR-TEST',crmLink:{workspaceId:'CRM4',sourceCollection:'crm4Leads',caseRef:'l',clientRef:'l'}}, docs:[{assessmentId:'a',version:1,pdfPath:'local/report.pdf'}] });
const validate = x => validateLink('l',x.lead,'a',x.assessment,x.docs,()=>{throw Error('DENIED');});
test('legacy and canonical links produce the same read-only identity',()=>{
  const f=fixture(), original=structuredClone(f); assert.equal(validate(f).crmLink.crm4LeadId,'l'); assert.deepEqual(f,original);
  delete f.assessment.crmLink.caseRef; f.assessment.crmLink.crm4LeadId='l'; assert.equal(validate(f).crmLink.crm4LeadId,'l');
});
test('contradictions, malformed/cross-workspace links, QAR and version mismatches fail closed',()=>{
  for(const change of [f=>f.assessment.crmLink.crm4LeadId='other',f=>f.assessment.crmLink.caseRef={},f=>f.assessment.crmLink.clientRef='other',f=>f.assessment.crmLink.workspaceId='CRM2',f=>f.lead.workspaceId='CRM3',f=>f.assessment.crmLink.sourceCollection='crm2Leads',f=>f.lead.assessmentId='other',f=>f.assessment.qarReference='wrong',f=>f.assessment.currentVersion=2,f=>f.lead.assessmentVersion=2,f=>f.docs=[],f=>f.docs.push({...f.docs[0]})]) { const f=fixture();change(f);assert.throws(()=>validate(f),/DENIED/); }
});
test('projection failure rolls back all workspace writes; unauthorised staff cannot enter',async()=>{
  process.env.GCLOUD_PROJECT='demo-quaerens-crm4';process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8080';
  const r=require('../tools/local-handlers.cjs').createLocalHandlers(), db=r.db, suffix=require('node:crypto').randomUUID();
  const f=fixture(), leadId='link-'+suffix, aid='a-'+suffix, uid='p-'+suffix;
  f.lead.assessmentId=aid; f.assessment.crmLink.caseRef=leadId;f.assessment.crmLink.clientRef=leadId;f.docs[0].assessmentId=aid;
  const refs=[db.collection('crm4Memberships').doc(uid),db.collection('crm4Leads').doc(leadId),db.collection('professionalAssessments').doc(aid),db.collection('professionalAssessmentDocuments').doc(aid)];
  class HttpsError extends Error {constructor(code,m){super(m);this.code=code;}}
  try {
    await refs[0].set({active:true,workspaceId:'CRM4',role:'processing'});await refs[1].set(f.lead);await refs[2].set(f.assessment);await refs[3].set(f.docs[0]);
    const action=workspaceBoundary(db,{HttpsError},({db: scoped})=>({paidClientGetWorkspace:async()=>{await scoped.collection('clientPortalCases').doc(leadId).create({synthetic:true});throw Error('PROJECTION_FAILED');}}));
    await assert.rejects(action({auth:{uid},data:{leadId}}),/PROJECTION_FAILED/);
    assert.equal((await db.collection('clientPortalCases').doc(leadId).get()).exists,false);
    await refs[2].update({'crmLink.crm4LeadId':'contradictory'});
    for (const name of ['paidClientGetWorkspace','paidClientActivateLogin','paidClientUpdateOnboardingChecklist','paidClientAddDocumentRequirement','paidClientUpdateEvidence']) {
      await assert.rejects(r.handlers[name]({auth:{uid},data:{leadId}}),e=>e.code==='failed-precondition');
    }
    assert.equal((await db.collection('clientPortalCases').doc('crm4-'+leadId).get()).exists,false);
    await refs[0].update({role:'closer'});await assert.rejects(action({auth:{uid},data:{leadId}}),e=>e.code==='permission-denied');
  }finally{await Promise.all(refs.map(r=>r.delete()));await r.close();}
});
