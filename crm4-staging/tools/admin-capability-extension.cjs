'use strict';
// Extend the existing protected membership update, retaining its identity guard,
// self-change prohibition, atomic membership/audit batch and access-state handling.
function extendMembershipUpdate(source){
 const replace=(old,next)=>{if(source.split(old).length!==2)throw Error('Membership update hook drift');source=source.replace(old,next);};
 replace('  const batch = db.batch();',`  let capabilityRoles;
  if(Object.hasOwn(data,'roles')){
    try{capabilityRoles=crm4Capabilities.resolveActor(uid,{workspaceId:'CRM4',active:true,role,roles:data.roles}).roles;}
    catch{throw new HttpsError('invalid-argument','Only an explicit Lister and Closer combination is supported.');}
  }
  const batch = db.batch();`);
 replace('    role,\n    active: data.active,', '    role,\n    roles: capabilityRoles ? [...capabilityRoles] : FieldValue.delete(),\n    active: data.active,');
 replace('    before: { active: current.data()?.active === true },','    before: { active: current.data()?.active === true, role: current.data().role, roles: current.data().roles || [current.data().role] },\n    capabilitiesAfter: capabilityRoles ? [...capabilityRoles] : [role],');
 return source;
}
module.exports={extendMembershipUpdate};
