'use strict';
// Search keeps the pinned ranking/matching/projection and staff permissions.
// Every source is filtered before scanning; unclassified historic records fail
// closed rather than being treated as CRM4 merely because the emulator holds them.
function searchBoundary(db,deps,factory) {
 const view={collection:name=>{
  const c=db.collection(name);
  if(name==='crm4Memberships')return c;
  return c.where(name==='clientPortalCases'?'crmLink.workspaceId':'workspaceId','==','CRM4');
 }};
 const original=factory({...deps,db:view}).paidClientGlobalClientSearch;
 return async request=>{
  const output=await original(request),results=[];
  for(const row of output.results) {
   if(row.source==='Paid Client Workspace') {
    const data=(await db.collection('clientPortalCases').doc(row.sourceRecordId).get()).data(),link=data?.crmLink;
    if(!data||link?.workspaceId!=='CRM4'||link.collection!=='crm4Leads'||typeof link.caseId!=='string'||link.caseId.includes('/')||
      (data.workspaceId&&data.workspaceId!=='CRM4')||(data.crm4LeadId&&data.crm4LeadId!==link.caseId))continue;
    if((await db.collection('crm4Leads').doc(link.caseId).get()).data()?.workspaceId!=='CRM4')continue;
   }
   results.push(row);
  }
  // Never invent a no-match authorisation token after rejecting malformed rows.
  return {...output,results};
 };
}
module.exports={searchBoundary};
