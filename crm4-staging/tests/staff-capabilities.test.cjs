'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {resolveActor,hasRole,assertOwnedLead,auditIdentity}=require('../tools/staff-capabilities.cjs');
const membership={active:true,workspaceId:'CRM4',role:'lister',roles:['lister','closer']};
test('one individual holds both staff capabilities without changing primary identity or gaining supervisor privileges',()=>{
 for(const uid of ['synthetic-spain-1','synthetic-spain-2']){
  const before=structuredClone(membership),actor=resolveActor(uid,membership);
  for(const role of ['lister','closer']){assert(hasRole(actor,role));assert.equal(auditIdentity(actor,role).actorUid,uid);assert.equal(auditIdentity(actor,role).actorRole,'lister');}
  for(const role of ['manager','administrator','processing'])assert.equal(hasRole(actor,role),false);
  assert.deepEqual(membership,before);assert(Object.isFrozen(actor.roles));
 }
});
test('dual staff cannot use originator ownership as closer assignment or access a colleagues lead',()=>{
 const actor=resolveActor('staff-1',membership),lead={workspaceId:'CRM4',assignedToUid:'staff-1',closerUid:'staff-2',assignedUserId:'staff-2'};
 assert.doesNotThrow(()=>assertOwnedLead(actor,lead,'lister'));assert.throws(()=>assertOwnedLead(actor,lead,'closer'),/assigned/);
 assert.doesNotThrow(()=>assertOwnedLead(actor,{...lead,closerUid:'staff-1'},'closer'));
 assert.throws(()=>assertOwnedLead(actor,{...lead,assignedToUid:'staff-2'},'lister'),/assigned/);
 for(const workspaceId of ['CRM2','CRM3','CRM5',undefined])for(const role of ['lister','closer'])assert.throws(()=>assertOwnedLead(actor,{...lead,workspaceId},role));
});
test('legacy single roles remain exact and malformed or elevated dual memberships fail closed',()=>{
 for(const role of ['lister','closer','manager','administrator','processing'])assert.deepEqual(resolveActor('staff',{active:true,workspaceId:'CRM4',role}).roles,[role]);
 for(const patch of [{active:false},{workspaceId:'CRM2'},{workspaceId:'CRM3'},{workspaceId:'CRM5'},{role:'administrator'},{role:['lister','closer']},{roles:['lister','administrator']},{roles:['lister','closer','manager']},{roles:['lister','lister']},{roles:'lister,closer'},{roles:[]}])assert.throws(()=>resolveActor('staff',{...membership,...patch}));
 const actor=resolveActor('staff',membership);assert.throws(()=>auditIdentity(actor,'administrator'));
});

test('browser capability module is generated from the same canonical contract',()=>{
 const fs=require('node:fs'),path=require('node:path');assert.equal(fs.readFileSync(path.resolve(__dirname,'../local-public/crm4-staff-capabilities.js'),'utf8'),require('../tools/adapt-staff-browser.cjs').browserCapabilities());
});
test('query scoping is idempotent with whitespace and preserves existing ownership predicates',()=>{
 const {scopeQueries}=require('../tools/scope-browser-queries.cjs');
 for(const input of ['query(collection(db,"crm4Leads"), orderBy("updatedAt","desc"))','query(collection(db,currentLeadCollection),where("assignedToUid","==",uid))']){
  const output=scopeQueries(input);assert.equal(scopeQueries(output),output);assert(output.includes('where("workspaceId","==","CRM4")'));if(input.includes('assignedToUid'))assert(output.includes('where("assignedToUid","==",uid)'));
 }
});
