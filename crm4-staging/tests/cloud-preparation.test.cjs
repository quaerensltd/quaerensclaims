'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const proposal=require('../release/infrastructure.proposed.json');
const config={...proposal,projectNumber:'123456789012',origin:'https://crm4-spain-test-synthetic.europe-west1.run.app'};
test('cloud startup refuses missing confirmations and unapproved deployment',()=>{
 const {validateCloudRuntime}=require('../release/cloud-configuration.cjs'),{assertRuntime}=require('../tools/runtime-boundary.cjs');
 assert.throws(()=>validateCloudRuntime(proposal),/project number/);assert.equal(validateCloudRuntime(config).projectId,proposal.projectId);
 for(const patch of [{testerEmails:[]},{testerEmails:['other@example.test']},{testerEmails:[...proposal.testerEmails,'other@example.test']},{testerEmails:['allUsers']},{testerEmails:['allAuthenticatedUsers']},{origin:'https://example.test'},{projectId:'quaerensclaims'}])assert.throws(()=>validateCloudRuntime({...config,...patch}));
 assert.throws(()=>assertRuntime({crm4Cloud:config,db:{projectId:config.projectId}},false,{GCLOUD_PROJECT:config.projectId}),/approval/);
 const approved={...config,deploymentApproved:true},env={GCLOUD_PROJECT:config.projectId,CRM4_DEPLOYMENT_APPROVED:'true'};
 assert.doesNotThrow(()=>assertRuntime({crm4Cloud:approved,db:{projectId:config.projectId}},false,env));
 for(const k of ['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST','STORAGE_EMULATOR_HOST','GOOGLE_APPLICATION_CREDENTIALS'])assert.throws(()=>assertRuntime({crm4Cloud:approved,db:{projectId:config.projectId}},false,{...env,[k]:'unexpected'}));
});
test('owner allowlist is a frozen snapshot and does not confer Firebase privileges',()=>{
 const input={...config,testerEmails:[...config.testerEmails]}, validated=require('../release/cloud-configuration.cjs').validateCloudRuntime(input);
 input.testerEmails.push('other@example.test');assert.deepEqual(validated.testerEmails,proposal.testerEmails);assert(Object.isFrozen(validated.testerEmails));
 const state=require('../release/approval-state.json');assert.equal(state.iamGrantsApproved,false);assert.equal(state.resourceProvisioningApproved,false);assert.equal(state.realAccountsApproved,false);assert.equal(state.ownerFirebaseMembership.provisioned,false);assert.equal(state.applicationDeploymentApproved,false);
});
test('IAP requires verified signature, exact audience and a named tester',async()=>{
 const now=Math.floor(Date.now()/1000),aud='/projects/'+config.projectNumber+'/locations/europe-west1/services/crm4-spain-test';
 let claims={sub:'synthetic-iap',email:'brusseljeroen@gmail.com',aud,iss:'https://cloud.google.com/iap',iat:now,exp:now+600},verified=0;
 const verifier=require('../release/iap.cjs').createIapVerifier(config,{getIapPublicKeys:async()=>({pubkeys:{key:'fixture'}}),verifySignedJwtWithCertsAsync:async(token,keys,audience)=>{assert.equal(token,'signed-fixture');assert.equal(audience,aud);verified++;return {getPayload:()=>claims};}});
 await assert.rejects(verifier());assert.equal((await verifier('signed-fixture')).sub,claims.sub);assert.equal(verified,1);
 for(const patch of [{email:'outsider@example.test'},{aud:'wrong'},{exp:now-100},{iat:now+100},{iss:'wrong'}]){const old=claims;claims={...old,...patch};await assert.rejects(verifier('signed-fixture'));claims=old;}
});
test('cloud browser artifact contains only public SDK fields and private callable routes',()=>{
 const out=path.resolve(__dirname,'../.scratch/cloud-web-test');
 const manifest=require('../release/build-web.cjs').buildWeb({...config,firebaseWeb:{projectId:config.projectId,storageBucket:config.bucket,authDomain:config.authDomain,apiKey:'synthetic-public-key',appId:'synthetic-app',secret:'MUST-NOT-SERIALIZE'}},out);
 assert(manifest.files.length>10);
 for(const name of manifest.files.filter(n=>/\.(html|js)$/.test(n))){const source=fs.readFileSync(path.join(out,name),'utf8');assert(!source.includes('MUST-NOT-SERIALIZE'));assert(!source.includes('127.0.0.1:'));assert(!source.includes('brusseljeroen@gmail.com'));}
 assert(fs.readFileSync(path.join(out,'__crm4/compat.js'),'utf8').includes('onAuthStateChanged'));
});
test('three synthetic identities do not silently grant unsupported dual roles',async()=>{
 const policy=require('../release/staff-policy.json');assert.equal(policy.identities.length,3);assert.equal(new Set(policy.identities.map(i=>i.uid)).size,3);assert.equal(policy.provisioned,false);
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 for(const staff of policy.identities.slice(0,2))for(const shape of [{role:['lister','closer']},{roles:['lister','closer']},{role:'lister,closer'}]){
  const reads=[];const db={collection:name=>({doc:uid=>({get:async()=>{reads.push(name+'/'+uid);assert.equal(name,'crm4Memberships');assert.equal(uid,staff.uid);return {exists:true,data:()=>({active:true,workspaceId:'CRM4',...shape})};}})})};
  const deps={db,HttpsError,admin:{},onCall:(...args)=>args.at(-1)};
  const lister=require('../backend-sources/crm4ListerCreateReferralLead/crm4ManualReferral.js').registerCrm2ManualReferral(deps).crm4ListerCreateReferralLead;
  const closer=require('../backend-sources/crm4CloserBookAdministrationOnboarding/crm4AdministrationOnboarding.js').registerCrm2AdministrationOnboarding(deps).crm4CloserBookAdministrationOnboarding;
  for(const handler of [lister,closer])await assert.rejects(handler({auth:{uid:staff.uid,token:{}},data:{leadId:'synthetic-lead'}}),e=>e.code==='permission-denied');
  assert.equal(reads.length,2); // No lead, ownership, assignment or audit reads/writes were reached.
 }
});
