'use strict';
// CRM4 transport adapter. Reuses the pinned portal registration/audit transaction.
// Storage client rules deny shared writes: every staff upload traverses this boundary.
const crypto=require('node:crypto');
const {legacyPortal,ownedPortal}=require('./legacy-portal-boundary.cjs');
const original=require('../backend-sources/portalStaffRegisterDocument/clientPortal.js');
function portalUpload(deps) {
 const {db,HttpsError}=deps,fail=(code,message)=>{throw new HttpsError(code,message);};
 const register=legacyPortal(db,{...deps,crm4RequireActiveMembership:true},'portalStaffRegisterDocument',original.registerClientPortal);
 return async request=>{
  if(!request.auth?.uid)fail('unauthenticated','Sign in required');
  const d=request.data||{};
  if(typeof d.documentId!=='string'||!/^[\w-]{1,128}$/.test(d.documentId)||typeof d.filename!=='string'||! /^[\w. -]{1,180}$/.test(d.filename))fail('invalid-argument','Safe document identity required');
  if(typeof d.base64!=='string'||d.base64.length>20971520)fail('invalid-argument','Valid file bytes required');
  const bytes=Buffer.from(d.base64,'base64');
  if(bytes.toString('base64')!==d.base64)fail('invalid-argument','Canonical file bytes required');
  const data={caseId:d.caseId,documentId:d.documentId,storagePath:'clientPortal/'+d.caseId+'/shared/'+d.documentId+'_'+d.filename,contentType:d.contentType,size:bytes.length,title:d.title||d.filename,category:d.category||'',status:d.status||'READY FOR CLIENT REVIEW',version:1};
  original.validateUpload(data,HttpsError);
  if(!original.DOCUMENT_STATUSES.has(data.status))fail('invalid-argument','The document status is invalid');
  await db.runTransaction(async tx=>{
   const m=(await tx.get(db.collection('crm4Memberships').doc(request.auth.uid))).data();
   if(!(m?.active===true&&m.workspaceId==='CRM4'&&['administrator','manager','processing'].includes(m.role)))fail('permission-denied','Active CRM4 portal staff membership required');
   await ownedPortal(db,tx,data.caseId,2,fail);
  });
  const fingerprint=crypto.createHash('sha256').update(JSON.stringify({uid:request.auth.uid,data})).update(bytes).digest('hex');
  const file=deps.admin.storage().bucket().file(data.storagePath);
  const match=meta=>{
   if(meta.metadata?.crm4UploadFingerprint!==fingerprint||meta.metadata?.crm4ActorUid!==request.auth.uid)fail('already-exists','Conflicting document upload');
  };
  let existing;
  try{[existing]=await file.getMetadata();}catch(error){if(Number(error.code)!==404)throw error;}
  if(existing)match(existing);
  else try {
   await file.save(bytes,{resumable:false,preconditionOpts:{ifGenerationMatch:0},metadata:{contentType:data.contentType,metadata:{crm4UploadFingerprint:fingerprint,crm4ActorUid:request.auth.uid}}});
  } catch(error) {
   if(Number(error.code)!==412)throw error;
   const [meta]=await file.getMetadata();match(meta);
  }
  // Rechecks fresh membership, case and lead inside the original buffered transaction.
  // Until this commits, bytes have no client-visible document or download entitlement.
  // Never delete on an ambiguous transaction response: it may have committed. An
  // exact retry is safe; failed/unregistered objects stay private for reviewed cleanup.
  return register({...request,data});
 };
}
module.exports={portalUpload};
