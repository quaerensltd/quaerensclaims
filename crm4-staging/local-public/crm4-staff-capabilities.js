'use strict';
// CRM4 extension of the Shared CRM capability contract. No membership rewriting or request-supplied roles.
// The factory extension retains each pinned workflow's action-specific ownership checks.
const staffRoles=Object.freeze(['lister','closer']);
const legacyRoles=Object.freeze(['lister','closer','manager','administrator','processing']);
function resolveActor(uid,membership){
 if(typeof uid!=='string'||!uid||uid.includes('/')||!membership||membership.active!==true||membership.workspaceId!=='CRM4')throw Error('Active individual CRM4 membership required');
 const primary=membership.role;
 if(!legacyRoles.includes(primary))throw Error('Unsupported primary role');
 let roles=[primary];
 if(Object.hasOwn(membership,'roles')){
  if(!Array.isArray(membership.roles)||membership.roles.length!==2||new Set(membership.roles).size!==2||!staffRoles.includes(primary)||!staffRoles.every(r=>membership.roles.includes(r)))throw Error('Only the explicit Lister and Closer role combination is supported');
  roles=[...staffRoles];
 }
 return Object.freeze({uid,workspaceId:'CRM4',role:primary,roles:Object.freeze(roles)});
}
function hasRole(actor,role){return actor.workspaceId==='CRM4'&&actor.roles.includes(role);}
function assertOwnedLead(actor,lead,capability){
 if(!staffRoles.includes(capability)||!hasRole(actor,capability)||lead?.workspaceId!=='CRM4')throw Error('CRM4 staff capability required');
 // Originating a lead never confers Closer ownership. No supervisor fallback.
 const owners=capability==='lister'?[lead.assignedToUid]:[lead.closerUid,lead.assignedUserId];
 if(!owners.includes(actor.uid))throw Error('Lead is not assigned to this individual for this capability');
 return actor;
}
function auditIdentity(actor,capability){
 if(!hasRole(actor,capability))throw Error('Capability not granted');
 return Object.freeze({actorUid:actor.uid,workspaceId:actor.workspaceId,actorRole:actor.role,actorRoles:[...actor.roles],actionCapability:capability});
}
export {resolveActor,hasRole,assertOwnedLead,auditIdentity};
