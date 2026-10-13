'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPlan,proposeTokenCreatorRemoval}=require('../release/bootstrap-plan.cjs');
const scope=require('../release/infrastructure-scope.json'),observed=require('../release/bootstrap-preflight.json');
const member='serviceAccount:firebase-adminsdk-fbsvc@quaerens-crm4-spain-test.iam.gserviceaccount.com';
test('Token Creator proposal removes only the selected member and preserves policy concurrency and unrelated access',()=>{
 const source={version:3,etag:'fresh-etag',auditConfigs:[{service:'allServices'}],bindings:[{role:'roles/owner',members:['user:owner@example.test']},{role:'roles/iam.serviceAccountTokenCreator',members:[member,'serviceAccount:other@example.test']},{role:'roles/firebase.sdkAdminServiceAgent',members:[member]}]};
 const before=structuredClone(source),result=proposeTokenCreatorRemoval(source);
 assert.deepEqual(source,before);assert.equal(result.applyApproved,false);assert.equal(result.policy.etag,source.etag);assert.deepEqual(result.policy.auditConfigs,source.auditConfigs);assert.deepEqual(result.policy.bindings[0],source.bindings[0]);assert.deepEqual(result.policy.bindings[2],source.bindings[2]);assert.deepEqual(result.policy.bindings[1].members,['serviceAccount:other@example.test']);
 for(const bad of [{...source,etag:null},{...source,bindings:[]},{...source,bindings:[{...source.bindings[1],condition:{expression:'true'}}]},{...source,bindings:[source.bindings[1],source.bindings[1]]}])assert.throws(()=>proposeTokenCreatorRemoval(bad));
});
test('bootstrap refuses other projects/testers and keeps deployment outside infrastructure stage',()=>{
 for(const patch of [{projectId:'quaerensclaims'},{projectNumber:'111111111111'},{region:'us-central1'},{iap:{...scope.iap,testerEmails:['info@quaerens.co.uk']}},{iamBindings:[...scope.iamBindings,{principal:'allUsers',role:'roles/run.invoker',scope:'project'}]},{iamBindings:scope.iamBindings.map((b,i)=>i===0?{...b,role:'roles/owner'}:b)}])assert.throws(()=>createPlan({...scope,...patch},observed));
 const plan=createPlan(scope,observed);assert.equal(plan.executable,false);assert.equal(plan.approved,false);
 for(const step of plan.steps){assert.equal(step.approved,false);for(const dep of step.dependsOn||[])assert(plan.steps.findIndex(s=>s.id===dep)<plan.steps.indexOf(step));}
 const run=plan.steps.find(s=>s.id==='private-run-service');assert.equal(run.stage,'deployment');assert.equal(run.body.iapEnabled,true);assert.equal(run.body.invokerIamDisabled,false);assert(run.body.template.containers[0].image.includes('<approved-image-digest>'));
 const access=plan.steps.find(s=>s.id==='private-service-access');assert.deepEqual(access.bindings.filter(b=>b.principal.startsWith('user:')).map(b=>b.principal),['user:brusseljeroen@gmail.com']);
 assert(plan.noProjectCreation&&plan.noBillingAttachment);assert(!plan.steps.some(s=>/projects$/.test(s.url||'')&&s.method==='POST'));
});
