'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('pinned revocation disables client access; wrong roles/workspaces cannot revoke',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),db=r.db,id='crm4-revoke-'+require('node:crypto').randomUUID();
 try{
  await db.collection('clientPortalCases').doc(id).set({clientUid:id,workspaceId:'CRM4',accessState:'ACTIVE'});
  await db.collection('clientPortalAccess').doc(id+'_'+id).set({uid:id,caseId:id,active:true});
  for(const role of ['lister','processing']) await db.collection('crm4Memberships').doc(id+role).set({workspaceId:'CRM4',active:true,role});
  const request={auth:{uid:id+'lister',token:{}},data:{caseId:id,reason:'Synthetic revocation test'}};
  await assert.rejects(r.handlers.portalStaffRevokeAccess(request),e=>e.code==='permission-denied');
  await assert.rejects(r.handlers.portalStaffRevokeAccess({...request,auth:{uid:id+'processing',token:{}},data:{...request.data,caseId:'crm2-other'}}),e=>e.code==='permission-denied');
  assert.equal((await r.handlers.portalStaffRevokeAccess({...request,auth:{uid:id+'processing',token:{}}})).status,'REVOKED');
  assert.equal((await db.collection('clientPortalAccess').doc(id+'_'+id).get()).data().active,false);
  await assert.rejects(r.handlers.portalClientGetDashboard({auth:{uid:id},data:{caseId:id}}),e=>e.code==='permission-denied');
  assert.equal((await db.collection('clientPortalAudit').where('caseId','==',id).get()).size,1);
 }finally{await r.close();}
});
