'use strict';
// Version-2 compatibility only. Original factories run inside one buffered
// Firestore transaction: invitation/claim/upsert and audit commit together.
const crypto=require('node:crypto');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function legacyPortal(db,deps,name,factory) {
 const fail=(code,message)=>{throw new deps.HttpsError(code,message);};
 const valid=x=>typeof x==='string'&&/^[\w-]+$/.test(x);
 const owned=(tx,id,version)=>ownedPortal(db,tx,id,version,fail);
 return async request=>{
  if(name==='portalStaffListCases') {
   const out=await factory(deps)[name](request),cases=[];
   for(const row of out.cases) {
    try {await owned({get:ref=>ref.get()},row.id);cases.push(row);} catch(e){if(!['permission-denied','invalid-argument'].includes(e.code))throw e;}
   }
   return {...out,cases};
  }
  return db.runTransaction(async tx=>{
   let data={...request.data},caseId=data.caseId;
   if(name==='portalClientClaimInvitation') {
    if(typeof data.token!=='string'||data.token.length<32)fail('invalid-argument','Invitation required');
    const invite=(await tx.get(db.collection('clientPortalInvitations').doc(hash(data.token.trim())))).data();caseId=invite?.caseId;
   }
   if(name==='portalStaffUpsertCase'&&!caseId) {
    if(!valid(data.crmCaseId))fail('invalid-argument','Existing CRM4 lead required');
    caseId='crm4-legacy-'+data.crmCaseId;data.caseId=caseId;
   }
   if(!valid(caseId))fail('invalid-argument','Exact portal case required');
   let existing=(await tx.get(db.collection('clientPortalCases').doc(caseId))).data();
   if(existing||name!=='portalStaffUpsertCase') await owned(tx,caseId,2);
   if(name==='portalStaffUpsertCase') {
    if(!valid(data.crmCaseId))fail('invalid-argument','Exact linked lead required');
    const lead=(await tx.get(db.collection('crm4Leads').doc(data.crmCaseId))).data();
    if(lead?.workspaceId!=='CRM4'||(existing&&existing.crmLink.caseId!==data.crmCaseId))fail('permission-denied','Conflicting CRM4 lead');
    const linked=await tx.get(db.collection('clientPortalCases').where('crmLink.caseId','==',data.crmCaseId));
    const canonical=await tx.get(db.collection('clientPortalCases').where('crm4LeadId','==',data.crmCaseId));
    if([...linked.docs,...canonical.docs].some(d=>d.id!==caseId))fail('failed-precondition','Existing portal projection must be used; no duplicate legacy case');
    const email=String(lead.email||lead.clientEmail||'').trim().toLowerCase();
    if(!/^[^@\s]+@(?:crm4\.)?example\.test$/.test(email)||String(data.clientEmail||'').trim().toLowerCase()!==email)fail('permission-denied','Synthetic linked client identity required');
    if(existing&&String(existing.clientEmail).toLowerCase()!==email)fail('failed-precondition','Client identity change requires a separate migration');
    data.accessState=existing?.accessState||'INVITATION_REQUIRED';
   }
   if(name==='portalStaffCreateInvitation') {
    if(existing.accessState==='REVOKED'||existing.accessState==='ACTIVE')fail('failed-precondition','Active/revoked access cannot be replaced by a legacy invitation');
    const invites=await tx.get(db.collection('clientPortalInvitations').where('caseId','==',caseId));
    if(invites.docs.some(d=>d.data().status==='ACTIVE'&&d.data().expiresAt.toMillis()>Date.now()))fail('already-exists','An unexpired invitation already exists');
   }
   if(name==='portalClientClaimInvitation'&&existing.clientUid&&existing.clientUid!==request.auth?.uid)fail('permission-denied','Case already belongs to another client');
   // Original legacy forms lack a request ID. An exact immediate replay is
   // deduplicated conservatively; an explicit ID permits a later distinct message.
   let operation;
   if(name==='portalStaffCreateMessage') {
    operation=db.collection('crm4LegacyPortalOperations').doc(hash(name+'|'+request.auth?.uid+'|'+caseId+'|'+(data.requestId||String(data.body||'').trim())));
   } else if(name==='portalStaffRegisterDocument') {
    if(!valid(data.documentId)||!String(data.storagePath).startsWith(`clientPortal/${caseId}/shared/${data.documentId}_`))fail('invalid-argument','Exact shared document identity required');
    const [meta]=await deps.admin.storage().bucket().file(data.storagePath).getMetadata();
    if(Number(meta.size)!==data.size||meta.contentType!==data.contentType)fail('failed-precondition','Uploaded metadata mismatch');
    operation=db.collection('crm4LegacyPortalOperations').doc(hash(name+'|'+data.documentId));
   }
   // Re-check original staff authority even on a deduplicated request.
   if(name!=='portalClientClaimInvitation') {
    const member=(await tx.get(db.collection('crm4Memberships').doc(request.auth.uid))).data();
    if((deps.crm4RequireActiveMembership||request.auth.token?.platformAdmin!==true)&&!(member?.active===true&&member.workspaceId==='CRM4'&&['manager','processing','administrator'].includes(member.role)))fail('permission-denied','Authorised CRM4 portal staff required');
   }
   const fingerprint=hash(JSON.stringify({uid:request.auth.uid,data}));
   if(operation) {
    const old=(await tx.get(operation)).data();
    if(old) {if(old.fingerprint!==fingerprint)fail('failed-precondition','Conflicting legacy replay');return {...old.result,idempotent:true};}
   }
   const writes=[], allowed=new Set(['clientPortalCases','clientPortalAccess','clientPortalInvitations','clientPortalMessages','clientPortalDocuments','clientPortalAudit']);
   const raw=ref=>ref._raw||ref;
   function write(method,ref,...args){ref=raw(ref);if(!allowed.has(ref.parent.id))throw Error('Unreviewed legacy write');writes.push([method,ref,...args]);}
   const document=ref=>({_raw:ref,id:ref.id,path:ref.path,get:()=>tx.get(ref),set:async(...args)=>write('set',ref,...args),update:async(...args)=>write('update',ref,...args),create:async(...args)=>write('create',ref,...args)});
   const collection=(n,q=db.collection(n))=>({doc:id=>document(id?db.collection(n).doc(id):db.collection(n).doc()),add:async value=>{const ref=document(db.collection(n).doc());await ref.create(value);return ref;},where:(...a)=>collection(n,q.where(...a)),orderBy:(...a)=>collection(n,q.orderBy(...a)),limit:n2=>collection(n,q.limit(n2)),get:()=>tx.get(q)});
   const nested={get:ref=>tx.get(raw(ref)),set:(...a)=>write('set',...a),update:(...a)=>write('update',...a),create:(...a)=>write('create',...a)};
   const view={collection,runTransaction:async fn=>fn(nested),batch:()=>({...nested,commit:async()=>{}})};
   const result=await factory({...deps,db:view})[name]({...request,data});
   for(const [method,...args] of writes)tx[method](...args);
   if(operation)tx.create(operation,{fingerprint,result,caseId,actorUid:request.auth.uid});
   if(result.claimUrl)result.claimUrl=(deps.crm4Cloud?.origin || 'http://127.0.0.1:4404')+'/client-portal.html?claim='+encodeURIComponent(result.token);
   return result;
  });
 };
}
async function ownedPortal(db,tx,id,version,fail) {
  const valid=x=>typeof x==='string'&&/^[\w-]+$/.test(x);
  if(!valid(id))fail('invalid-argument','Exact portal case required');
  const c=(await tx.get(db.collection('clientPortalCases').doc(id))).data(), link=c?.crmLink;
  if(!c||link?.workspaceId!=='CRM4'||link.collection!=='crm4Leads'||!valid(link.caseId)||
   (Object.hasOwn(c,'workspaceId')&&c.workspaceId!=='CRM4')||(Object.hasOwn(c,'crm4LeadId')&&c.crm4LeadId!==link.caseId))fail('permission-denied','Owned CRM4 portal link required');
  const lead=(await tx.get(db.collection('crm4Leads').doc(link.caseId))).data();
  if(lead?.workspaceId!=='CRM4')fail('permission-denied','CRM4 lead required');
  if(version&&c.portalVersion!==version)fail('failed-precondition','Legacy operation requires version 2; current cases cannot be downgraded');
  return {c,lead};
 }

module.exports={legacyPortal,ownedPortal};
