"use strict";
const staff=new Set(['lister','closer']);
function administration(deps){
 const {db,HttpsError,admin}=deps,F=admin.firestore.FieldValue;
 const fail=(code,message)=>{throw new HttpsError(code,message);};
 function desired(data){if(!['lister','closer','manager','processing','administrator'].includes(data.role))fail('invalid-argument','Unsupported CRM4 role');if(data.workspaceId!==undefined&&data.workspaceId!=='CRM4')fail('permission-denied','CRM4 only');if(data.roles!==undefined){try{return require('./staff-capabilities.cjs').resolveActor('validation',{workspaceId:'CRM4',active:true,role:data.role,roles:data.roles}).roles;}catch{fail('invalid-argument','Invalid role combination');}}return null;}
 async function authorize(request,{target,role,tx}={}){
  if(!request.auth?.uid)fail('unauthenticated','Authentication required');
  if(target?.uid===request.auth.uid)fail('failed-precondition','Self-management is prohibited');
  const ref=db.collection('crm4Memberships').doc(request.auth.uid),snap=await (tx?tx.get(ref):ref.get()),actor=snap.data();
  if(!snap.exists||actor.workspaceId!=='CRM4'||actor.active!==true||!['manager','administrator'].includes(actor.role))fail('permission-denied','Active CRM4 management membership required');
  if(actor.workspaceAccess&&JSON.stringify(actor.workspaceAccess)!==JSON.stringify(['CRM4']))fail('permission-denied','CRM4-only authority required');
  try{require('./staff-capabilities.cjs').resolveActor(request.auth.uid,actor);}catch{fail('permission-denied','Invalid management membership');}
  if(target){if(target.uid===request.auth.uid)fail('failed-precondition','Self-management is prohibited');if(target.workspaceId!=='CRM4'||(target.workspaceAccess&&JSON.stringify(target.workspaceAccess)!==JSON.stringify(['CRM4'])))fail('permission-denied','CRM4 member required');}
  if(actor.role==='manager'&&((role&&!staff.has(role))||(target&&!staff.has(target.role))))fail('permission-denied','Managers may manage operational staff only');
  return actor;
 }
 async function update(request){
  require('./runtime-boundary.cjs').assertRuntime(deps,true);
  const d=request.data||{},roles=desired(d),uid=String(d.uid||'');if(!uid||uid.includes('/')||typeof d.active!=='boolean')fail('invalid-argument','UID and active state required');
  await authorize(request,{role:d.role});
  const auth=admin.auth(),user=await auth.getUser(uid);if(!/^[^@\s]+@(?:crm4\.)?example\.test$/.test(user.email||''))fail('permission-denied','Synthetic identity required');if(Object.keys(user.customClaims||{}).length)fail('permission-denied','Claim-bearing identities require separate governance');
  const ref=db.collection('crm4Memberships').doc(uid);let audit=db.collection('crm4MembershipAudit').doc();
  await db.runTransaction(async tx=>{
   const current=await tx.get(ref);if(!current.exists)fail('permission-denied','Existing CRM4 membership required');const before={...current.data(),uid};
   await authorize(request,{target:before,role:d.role,tx});
   if(before.creationPending)fail('failed-precondition','Creation is incomplete');
   if(before.accessChangePending){const pending=db.collection('crm4MembershipAudit').doc(before.accessChangePending),entry=(await tx.get(pending)).data();if(!entry||entry.actorUid!==request.auth.uid||entry.targetUid!==uid||entry.after.role!==d.role||entry.after.active!==d.active||JSON.stringify(entry.after.roles)!==JSON.stringify(roles||[d.role]))fail('failed-precondition','Only exact authorised access reconciliation is permitted');audit=pending;return;}
   const all=await tx.get(db.collection('crm4Memberships').where('role','==','administrator'));
   if(before.role==='administrator'&&before.active===true&&(d.role!=='administrator'||!d.active)&&all.docs.filter(x=>x.data().workspaceId==='CRM4'&&x.data().active===true&&!x.data().accessChangePending&&!x.data().creationPending).length<=1)fail('failed-precondition','Last active Administrator protected');
   tx.update(ref,{role:d.role,roles:roles?[...roles]:F.delete(),active:d.active,workspaceAccess:['CRM4'],updatedBy:request.auth.uid,updatedAt:F.serverTimestamp(),accessChangePending:audit.id});
   tx.create(audit,{action:'CRM4_MEMBERSHIP_CHANGED',actorUid:request.auth.uid,targetUid:uid,workspaceId:'CRM4',before:{role:before.role,roles:before.roles||[before.role],active:before.active===true},capabilitiesAfter:roles||[d.role],after:{role:d.role,roles:roles||[d.role],active:d.active},outcome:'AUTH_SYNC_PENDING',createdAt:F.serverTimestamp()});
  });
  // Pending marker serializes per-UID Auth changes and remains on uncertain failure.
  try{await auth.updateUser(uid,{disabled:!d.active});await auth.revokeRefreshTokens(uid);const checked=await auth.getUser(uid);if(checked.disabled!==!d.active)fail('internal','Auth state could not be verified');
   await db.runTransaction(async tx=>{const m=await tx.get(ref);if(m.data()?.accessChangePending!==audit.id)fail('failed-precondition','Access operation drift');tx.update(ref,{accessChangePending:F.delete()});tx.update(audit,{outcome:'COMPLETE',firebaseAuthDisabled:checked.disabled});});
  }catch{await audit.update({outcome:'AUTH_SYNC_FAILED'});fail('internal','Access change requires reconciliation; no automatic retry');}
  return {uid,role:d.role,roles:roles||[d.role],active:d.active,workspaceId:'CRM4'};
 }
 return {authorize,desired,update};
}
module.exports={administration};
