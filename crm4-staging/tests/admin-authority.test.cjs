"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),{administration}=require('../tools/admin-authority.cjs');
class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
const policy=actor=>administration({HttpsError,admin:{firestore:{FieldValue:{}}},db:{collection:()=>({doc:()=>({get:async()=>({exists:!!actor,data:()=>actor})})})}});
const actor={workspaceId:'CRM4',workspaceAccess:['CRM4'],active:true,role:'manager'};
test('Manager operational authority requires live membership, not platform claim',async()=>{await policy(actor).authorize({auth:{uid:'manager',token:{}}},{role:'lister'});await assert.rejects(policy(null).authorize({auth:{uid:'manager',token:{platformAdmin:true}}},{role:'lister'}));});
test('malformed, inactive and mixed workspace authority fails closed',async()=>{for(const change of [{active:false},{workspaceId:'CRM2'},{workspaceAccess:['CRM4','CRM3']},{roles:['lister','closer']}])await assert.rejects(policy({...actor,...change}).authorize({auth:{uid:'manager'}},{role:'lister'}));});
test('Manager cannot assign or reset privileged targets',async()=>{await assert.rejects(policy(actor).authorize({auth:{uid:'manager'}},{role:'administrator'}));await assert.rejects(policy(actor).authorize({auth:{uid:'manager'}},{target:{uid:'other',workspaceId:'CRM4',role:'administrator'}}));});
test('Administrator retains scoped privileged management but no self changes',async()=>{const p=policy({...actor,role:'administrator'});await p.authorize({auth:{uid:'admin'}},{role:'processing'});await assert.rejects(p.authorize({auth:{uid:'admin'}},{target:{uid:'admin',workspaceId:'CRM4',role:'administrator'}}));});
