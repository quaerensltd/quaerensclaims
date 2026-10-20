"use strict";
const test=require('node:test'),assert=require('node:assert/strict');
test('CRM4 scoped staff lifecycle, escalation boundaries and concurrent administrator protection',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers(),db=r.db,auth=require('firebase-admin/auth').getAuth(r.app),prefix='staffadmin-'+require('crypto').randomUUID(),checks=[];
 const call=(actor,suffix,data,token={})=>r.handlers['crm4Admin'+suffix]({auth:{uid:actor,token},data});
 const seed=async(label,role)=>{const u=await auth.createUser({email:prefix+'-'+label+'@example.test'});await db.collection('crm4Memberships').doc(u.uid).set({uid:u.uid,email:u.email,workspaceId:'CRM4',workspaceAccess:['CRM4'],role,active:true});return u.uid;};
 try{
 const admin=await seed('admin','administrator'),manager=await seed('manager','manager');
 const staff=[];
 for(const [label,role,roles]of [['lister','lister'],['closer','closer'],['both','lister',['lister','closer']]]){
  const input={email:prefix+'-'+label+'@example.test',displayName:'Fictional '+label,role,...(roles?{roles}:{}),workspaceId:'CRM4'},u=await call(manager,'CreateUser',input);staff.push(u.uid);assert.equal(u.linkReturned,false);assert.equal(u.capturedOnly,true);assert.equal((await call(manager,'CreateUser',input)).uid,u.uid);const m=(await db.collection('crm4Memberships').doc(u.uid).get()).data();assert.equal(m.role,role);if(roles)assert.deepEqual(m.roles,roles);assert.deepEqual((await auth.getUser(u.uid)).customClaims||{},{});
 }
 checks.push('three roles created by Manager without custom claims; idempotent retry');
 const target=staff[0];await call(manager,'UpdateMembership',{uid:target,role:'lister',roles:['lister','closer'],active:true});assert.deepEqual((await db.collection('crm4Memberships').doc(target).get()).data().roles,['lister','closer']);await call(manager,'UpdateMembership',{uid:target,role:'closer',active:false});assert((await auth.getUser(target)).disabled);assert.equal((await db.collection('crm4Memberships').doc(target).get()).data().roles,undefined);await call(manager,'UpdateMembership',{uid:target,role:'lister',active:true});assert(!(await auth.getUser(target)).disabled);checks.push('role change, removal of combined capability, block and reactivate');
 assert.equal((await call(manager,'SendPasswordSetupEmail',{uid:target})).linkReturned,false);checks.push('setup invitation capture returns no link');
 const denied=e=>['permission-denied','failed-precondition','invalid-argument'].includes(e.code);
 await assert.rejects(call(manager,'UpdateMembership',{uid:target,role:'administrator',active:true}),denied);
 await assert.rejects(call(manager,'UpdateMembership',{uid:admin,role:'lister',active:true}),denied);
 await assert.rejects(call(manager,'UpdateMembership',{uid:manager,role:'administrator',active:true}),denied);
 await assert.rejects(call(staff[1],'CreateUser',{email:prefix+'-escalate@example.test',displayName:'No',role:'administrator'},{platformAdmin:true}),denied);
 await assert.rejects(call(manager,'CreateUser',{email:prefix+'-cross@example.test',displayName:'No',role:'lister',workspaceId:'CRM2'}),denied);
 await db.collection('crm4Memberships').doc(staff[2]).update({workspaceId:'CRM3'});await assert.rejects(call(manager,'UpdateMembership',{uid:staff[2],role:'lister',active:true}),denied);await assert.rejects(call(manager,'SendPasswordSetupEmail',{uid:staff[2]}),denied);checks.push('self escalation, privileged targets, claim-only actor and cross-CRM denied');
 await auth.setCustomUserClaims(target,{platformAdmin:true});await assert.rejects(call(manager,'SendPasswordSetupEmail',{uid:target}),denied);await auth.setCustomUserClaims(target,{});
 await call(admin,'UpdateMembership',{uid:manager,role:'manager',active:false});await assert.rejects(call(manager,'SendPasswordSetupEmail',{uid:target}),denied);await call(admin,'UpdateMembership',{uid:manager,role:'manager',active:true});checks.push('inactive managers and claim-bearing target resets denied');
 const privileged=await call(admin,'CreateUser',{email:prefix+'-processing@example.test',displayName:'Fictional Processing',role:'processing'});assert(privileged.uid);checks.push('Administrator can provision privileged CRM4 role');
 const policyFactory=require('../tools/admin-authority.cjs').administration;class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}let failAuth=true;
 const proxy=new Proxy(auth,{get(t,k){if(k==='updateUser')return async(...args)=>{if(failAuth){failAuth=false;throw Error('simulated transport failure');}return t.updateUser(...args);};return typeof t[k]==='function'?t[k].bind(t):t[k];}});
 const policy=policyFactory({db,admin:{firestore:require('firebase-admin').firestore,auth:()=>proxy},HttpsError}),change={auth:{uid:manager,token:{}},data:{uid:target,role:'lister',active:false}};
 await assert.rejects(policy.update(change),e=>e.code==='internal');assert((await db.collection('crm4Memberships').doc(target).get()).data().accessChangePending);assert.equal((await db.collection('crm4Memberships').doc(target).get()).data().active,false);
 await assert.rejects(policy.update({...change,data:{...change.data,active:true}}),denied);await policy.update(change);assert((await auth.getUser(target)).disabled);assert.equal((await db.collection('crm4Memberships').doc(target).get()).data().accessChangePending,undefined);checks.push('Auth failure cannot pass; exact authorised reconciliation succeeds');
 const second=await seed('secondadmin','administrator');const results=await Promise.allSettled([call(admin,'UpdateMembership',{uid:second,role:'manager',active:true}),call(second,'UpdateMembership',{uid:admin,role:'manager',active:true})]);assert.equal(results.filter(x=>x.status==='fulfilled').length,1);const admins=await db.collection('crm4Memberships').where('role','==','administrator').get();assert.equal(admins.docs.filter(d=>d.data().active).length,1);checks.push('concurrent cross-demotion retains one Administrator');
 const audit=await db.collection('crm4MembershipAudit').get();assert(audit.size>0);for(const d of audit.docs){const text=JSON.stringify(d.data());assert(!/oobCode|resetLink|setupLink":|password":/.test(text));}assert(r.providerReceipts.every(x=>x.delivered===false));checks.push('audits and captures contain no setup links or passwords');
 console.log(JSON.stringify({checks,cloudMutations:0}));
 }finally{await r.close();}
});
